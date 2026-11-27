/**
 * report.js — "Patient Report" (doctor / admin). Pick a participant and a printable summary appears:
 * overall status, pressure map (which zone of the foot is out of line with the group), session timeline,
 * motion, obstacle, model detections and findings.
 * Built from the participant sheet (live-readings-data.js), the rule-based fall-risk engine and the
 * models in ml-sheet.js. Prototype — not a diagnosis.
 */
import { PEOPLE } from './live-readings-data.js?v=4';
import { scorePerson } from './live-readings.js?v=4';
import { runAll } from './ml-sheet.js?v=2';
import { FR_CONFIG } from './fall-risk-engine.js';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))); };
const pct = v => `${Math.round(v * 100)}%`;
const toSec = t => { const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + s; };
const ZONES = [['hindfoot', 'Heel'], ['midfoot', 'Midfoot'], ['forefoot', 'Forefoot']];
const LEVEL = { LOW: ['low', 'Low'], MODERATE: ['moderate', 'Moderate'], HIGH: ['high', 'High'] };

const isStatic = p => /stand|seat/i.test(p.scenario);
let ml = null, groupStats = null, selected = 'P1';
try { selected = localStorage.getItem('is-report-person') || 'P1'; } catch (_) {}

// ---------- per-person numbers ----------
function pressureOf(p) {
  const loaded = p.readings.filter(r => r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot > 300);
  const share = Object.fromEntries(ZONES.map(([k]) => [k, mean(loaded.map(r => r.fsr[k] / (r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot)))]));
  const peak = Object.fromEntries(ZONES.map(([k]) => [k, Math.max(0, ...p.readings.map(r => r.fsr[k]))]));
  const avgLoad = mean(loaded.map(r => r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot));
  return { loaded: loaded.length, share, peak, avgLoad };
}

function buildGroup() {
  const all = PEOPLE.map(p => ({ id: p.id, pr: pressureOf(p) }));
  const stat = (key, fn) => {
    const vals = all.map(fn);
    return { mean: mean(vals), sd: sd(vals) || 1e-6, vals };
  };
  return {
    all,
    share: Object.fromEntries(ZONES.map(([k]) => [k, stat(k, a => a.pr.share[k])])),
    load: stat('load', a => a.pr.avgLoad),
  };
}

function reportData(p) {
  const pi = PEOPLE.indexOf(p);
  const scored = scorePerson(p);
  const rows = ml.rows.filter(r => r.pi === pi);
  const summ = ml.summ.find(o => o.pi === pi);
  const pr = pressureOf(p);

  // Compare each zone with other people doing the same kind of activity (moving vs standing / seated).
  const mode = isStatic(p) ? 'static' : 'moving';
  const others = groupStats.all.filter(a => a.id !== p.id && (isStatic(PEOPLE.find(q => q.id === a.id)) ? 'static' : 'moving') === mode);
  const zone = ZONES.map(([k, label]) => {
    const vals = others.map(a => a.pr.share[k]), m = mean(vals), s = sd(vals) || 1e-6;
    const z = (pr.share[k] - m) / s;
    return { k, label, share: pr.share[k], groupMean: m, z, peak: pr.peak[k], flag: Math.abs(z) >= 1.5 && Math.abs(pr.share[k] - m) >= 0.05 ? (z > 0 ? 'higher' : 'lower') : null };
  });
  const dominant = [...zone].sort((a, b) => b.share - a.share)[0];
  const abnormal = zone.filter(z => z.flag).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const loadVals = others.map(a => a.pr.avgLoad), loadZ = (pr.avgLoad - mean(loadVals)) / (sd(loadVals) || 1);

  const motion = {
    peakAccel: Math.max(...scored.map(r => r.result.accelMag)),
    peakGyro: Math.max(...scored.map(r => r.result.gyroMag)),
    maxTilt: Math.max(...scored.map(r => r.result.tilt)),
    maxSudden: Math.max(...scored.map(r => r.result.sudden)),
  };
  const levels = scored.map(r => r.result.level);
  const peakScore = Math.max(...scored.map(r => r.result.score));
  const meanScore = Math.round(mean(scored.map(r => r.result.score)));
  const worst = levels.includes('HIGH') ? 'HIGH' : levels.includes('MODERATE') ? 'MODERATE' : 'LOW';
  const minDist = Math.min(...p.readings.map(r => r.distanceCm));
  const caution = p.readings.filter(r => r.distanceCm < 100);
  const t0 = toSec(p.readings[0].t), t1 = toSec(p.readings[p.readings.length - 1].t);
  const phases = {};
  p.readings.forEach(r => { phases[r.phase] = (phases[r.phase] || 0) + 1; });
  const phaseAcc = rows.filter(r => r.cls === r.knn.pred).length / rows.length;

  // Detections, in time order.
  const events = [];
  scored.forEach((r, i) => {
    const row = rows[i];
    if (row.flag) events.push({ t: r.t, tone: 'high', what: 'Stumble model alert', detail: `${r.phase}: movement unlike ordinary walking (anomaly score ${row.anom.toFixed(1)}, alarm at ${row.anomThr.toFixed(1)})` });
    if (r.result.level !== 'LOW') events.push({ t: r.t, tone: r.result.level.toLowerCase(), what: `${LEVEL[r.result.level][1]} fall risk (${r.result.score}/100)`, detail: r.result.explanation });
    if (r.distanceCm < 100) events.push({ t: r.t, tone: r.distanceCm < 50 ? 'high' : 'moderate', what: r.distanceCm < 50 ? 'Obstacle too close' : 'Obstacle caution', detail: `${r.distanceCm} cm ahead` });
  });

  // Overall status
  const stumble = rows.some(r => r.flag);
  const status = worst === 'HIGH' || stumble ? ['high', 'Needs review', 'emergency']
    : worst === 'MODERATE' || abnormal.length || (summ.reg && summ.reg.score > 40) ? ['moderate', 'Monitor', 'warning']
    : ['low', 'Within normal range', 'check_circle'];

  // Plain-language findings
  const F = [];
  F.push(`Main load zone: <b>${dominant.label.toLowerCase()}</b> (${pct(dominant.share)} of foot pressure on average while the foot was loaded).`);
  if (abnormal.length) abnormal.forEach(z => F.push(`<b>${z.label} pressure is ${z.flag} than the group</b>: ${pct(z.share)} vs ${pct(z.groupMean)} on average for the other ${others.length} ${mode === 'static' ? 'standing / seated' : 'walking'} participants.`));
  else F.push(`Pressure split between heel, midfoot and forefoot is in line with the other ${mode === 'static' ? 'standing / seated' : 'walking'} participants.`);
  if (Math.abs(loadZ) >= 1.5) F.push(`Overall foot load is ${loadZ > 0 ? 'higher' : 'lower'} than other ${mode === 'static' ? 'standing / seated' : 'walking'} participants (${Math.round(pr.avgLoad)} vs ${Math.round(mean(loadVals))} raw units)${/seat/i.test(p.scenario) && loadZ < 0 ? ', as expected while seated' : ''}.`);
  if (summ.reg) F.push(`Gait regularity score <b>${summ.reg.score}/100</b> (${summ.reg.score <= 25 ? 'regular heel-to-toe roll-over' : summ.reg.score <= 50 ? 'some irregularity' : 'irregular roll-over'}).`);
  else F.push('No walking stance phases were recorded, so heel-to-toe roll-over could not be scored.');
  F.push(`Fall risk peaked at <b>${peakScore}/100 (${LEVEL[worst][1].toLowerCase()})</b>; average ${meanScore}/100 across ${scored.length} readings.`);
  if (stumble) F.push(`<b>The stumble model flagged ${rows.filter(r => r.flag).length} reading${rows.filter(r => r.flag).length > 1 ? 's' : ''}</b>${rows.filter(r => r.flag).every(r => r.phase === 'Turning') ? ', all during turns (a known source of false alarms)' : ''}.`);
  else F.push('The stumble model raised no alerts.');
  if (motion.peakGyro >= FR_CONFIG.GYRO_ELEVATED) F.push(`Rotation reached ${motion.peakGyro.toFixed(0)}°/s (above the ${FR_CONFIG.GYRO_ELEVATED}°/s elevated limit).`);
  if (motion.maxTilt >= FR_CONFIG.TILT_ELEVATED) F.push(`Foot tilt reached ${motion.maxTilt.toFixed(1)}° (elevated from ${FR_CONFIG.TILT_ELEVATED}°).`);
  if (caution.length) F.push(`Obstacle within 1 m on ${caution.length} reading${caution.length > 1 ? 's' : ''} (closest ${minDist} cm).`);

  // Suggested follow-up (prototype wording, not clinical advice)
  const R = [];
  if (stumble || worst === 'HIGH') R.push('Review the flagged moments with the participant; consider a balance assessment.');
  if (abnormal.some(z => z.k === 'hindfoot' && z.flag === 'higher')) R.push('Heel-heavy loading: observe heel strike and check footwear cushioning.');
  if (abnormal.some(z => z.k === 'forefoot' && z.flag === 'higher')) R.push('Forefoot-heavy loading: observe push-off and forefoot comfort.');
  if (abnormal.some(z => z.flag === 'lower')) R.push(`Low ${abnormal.filter(z => z.flag === 'lower').map(z => z.label.toLowerCase()).join(' and ')} loading: check insole contact and sensor placement before drawing conclusions.`);
  if (summ.reg && summ.reg.score > 40) R.push('Irregular roll-over: repeat a longer walking session to confirm.');
  if (!R.length) R.push('No follow-up suggested from this session. Repeat periodically to track change.');

  return { mode, nOthers: others.length, p, pi, scored, rows, summ, pr, zone, dominant, abnormal, motion, worst, peakScore, meanScore, minDist, caution, t0, t1, phases, phaseAcc, events, status, F, R, loadZ };
}

// ---------- drawing ----------
function footMap(d) {
  const color = s => `rgba(122,46,58,${(0.12 + 0.85 * Math.min(1, s / 0.6)).toFixed(2)})`;
  const z = Object.fromEntries(d.zone.map(x => [x.k, x]));
  const lbl = (x, y, k) => `<text x="${x}" y="${y}" text-anchor="middle" class="rpt-foot-pct">${pct(z[k].share)}</text><text x="${x}" y="${y + 14}" text-anchor="middle" class="rpt-foot-lbl">${z[k].label}${z[k].flag ? (z[k].flag === 'higher' ? ' ▲' : ' ▼') : ''}</text>`;
  const ring = k => z[k].flag ? 'stroke="#A13B3B" stroke-width="3" stroke-dasharray="6 4"' : 'stroke="none"';
  return `<svg viewBox="0 0 160 330" class="rpt-foot" role="img" aria-label="Pressure map">
    <path d="M80 8 C122 8 140 52 138 100 C136 150 120 175 118 210 C116 250 124 280 112 305 C100 326 60 326 48 305 C36 282 44 250 42 210 C40 170 22 140 22 98 C22 50 40 8 80 8 Z" fill="var(--color-bg-blush)" stroke="var(--color-border)" stroke-width="2"/>
    <ellipse cx="80" cy="80" rx="50" ry="56" fill="${color(z.forefoot.share)}" ${ring('forefoot')}/>
    <ellipse cx="80" cy="180" rx="34" ry="38" fill="${color(z.midfoot.share)}" ${ring('midfoot')}/>
    <ellipse cx="80" cy="272" rx="36" ry="40" fill="${color(z.hindfoot.share)}" ${ring('hindfoot')}/>
    ${lbl(80, 78, 'forefoot')}${lbl(80, 178, 'midfoot')}${lbl(80, 270, 'hindfoot')}
  </svg>`;
}

function timeline(d) {
  return `<div class="rpt-timeline">${d.scored.map((r, i) => {
    const row = d.rows[i], [tone] = LEVEL[r.result.level];
    const tot = r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot;
    return `<div class="rpt-tl-item ${tone}${row.flag ? ' flag' : ''}" title="${esc(r.phase)} · risk ${r.result.score}">
      <span class="rpt-tl-time">${r.t}</span>
      <span class="rpt-tl-bar"><i style="height:${Math.max(4, Math.round(100 * tot / 6000))}%"></i></span>
      <b>${esc(r.phase)}</b>
      <span class="rpt-tl-risk">${r.result.score}${row.flag ? ' · <span class="material-symbols-outlined">priority_high</span>' : ''}</span>
    </div>`;
  }).join('')}</div>
  <p class="caption-text muted-text">Bar height = total foot load. Colour = fall-risk level for that reading. ! = stumble model alert.</p>`;
}

function report(d) {
  const p = d.p, dur = d.t1 - d.t0;
  const [tone, word, icon] = d.status;
  return `
  <article class="rpt" id="rpt-print">
    <header class="rpt-head">
      <div>
        <span class="eyebrow-label">IntelliStride · Gait summary report</span>
        <h1 class="fr-page-title">${esc(p.id)}</h1>
        <p class="body-text">${esc(p.sex || '–')}, ${p.age} yrs · ${p.heightCm} cm · ${p.weightKg} kg · BMI ${p.bmi} (${esc(p.bmiCategory)}) · UK foot size ${p.footSize}</p>
      </div>
      <dl class="rpt-meta">
        <div><dt>Session</dt><dd>${esc(p.testedOn)}</dd></div>
        <div><dt>Activity</dt><dd>${esc(p.scenario)}</dd></div>
        <div><dt>Report generated</dt><dd>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
      </dl>
    </header>

    <div class="rp-status ${tone}">
      <span class="material-symbols-outlined">${icon}</span>
      <div><b>${word}</b><span>Peak fall risk ${d.peakScore}/100 · ${d.events.length} detection${d.events.length === 1 ? '' : 's'} · ${d.abnormal.length ? `${d.abnormal.map(z => z.label.toLowerCase()).join(' and ')} pressure out of line with the group` : 'pressure pattern in line with the group'}</span></div>
    </div>

    <div class="rp-stat-row rp-kpis">
      <div class="rp-stat"><span class="rp-stat-num">${Math.floor(dur / 60)}m ${dur % 60}s</span><span class="rp-stat-label">Session length (${d.t0 ? d.scored[0].t : ''} – ${d.scored[d.scored.length - 1].t})</span></div>
      <div class="rp-stat"><span class="rp-stat-num">${d.meanScore}<small>/${d.peakScore}</small></span><span class="rp-stat-label">Mean / peak fall-risk score</span></div>
      <div class="rp-stat"><span class="rp-stat-num">${d.dominant.label}</span><span class="rp-stat-label">Main load zone (${pct(d.dominant.share)})</span></div>
      <div class="rp-stat"><span class="rp-stat-num">${d.summ.reg ? d.summ.reg.score : '–'}</span><span class="rp-stat-label">Gait regularity (0 = regular)</span></div>
    </div>

    <section class="t2-panel">
      <h2 class="t2-panel-title"><span class="material-symbols-outlined">summarize</span> Summary of findings</h2>
      <ul class="rp-list">${d.F.map(f => `<li>${f}</li>`).join('')}</ul>
    </section>

    <section class="t2-panel">
      <h2 class="t2-panel-title"><span class="material-symbols-outlined">footprint</span> Foot pressure: where the load goes</h2>
      <div class="rpt-pressure">
        ${footMap(d)}
        <div>
          <div class="rp-table-wrap"><table class="rp-table">
            <thead><tr><th>Zone</th><th>Share of load</th><th>Group average</th><th>Peak (raw)</th><th>Assessment</th></tr></thead>
            <tbody>${d.zone.map(z => `<tr>
              <td><b>${z.label}</b></td><td>${pct(z.share)}</td><td>${pct(z.groupMean)}</td><td>${z.peak}</td>
              <td>${z.flag ? `<span class="fr-risk-badge ${Math.abs(z.z) >= 2 ? 'high' : 'moderate'}">${z.flag.toUpperCase()} THAN GROUP</span>` : '<span class="fr-risk-badge low">NORMAL</span>'}</td></tr>`).join('')}</tbody>
          </table></div>
          <p class="body-text">Average load while the foot was on the ground: <b>${Math.round(d.pr.avgLoad)}</b> raw units (${d.loadZ > 1.5 ? 'higher than' : d.loadZ < -1.5 ? 'lower than' : 'similar to'} the group). Based on ${d.pr.loaded} loaded readings.</p>
          <p class="caption-text muted-text">Compared with the ${d.mode === 'static' ? 'other standing / seated' : 'other walking'} participants (${d.nOthers}). "Out of line" means at least 1.5 standard deviations and 5 percentage points away from their average. This session recorded one shoe per reading, so the report compares heel, midfoot and forefoot with the group rather than left foot against right foot.</p>
        </div>
      </div>
    </section>

    <section class="t2-panel">
      <h2 class="t2-panel-title"><span class="material-symbols-outlined">timeline</span> What the session looked like</h2>
      ${timeline(d)}
      <div class="rpt-phases">${Object.entries(d.phases).map(([ph, n]) => `<span class="lv-chip on">${esc(ph)} × ${n}</span>`).join('')}</div>
    </section>

    <div class="rpt-two">
      <section class="t2-panel">
        <h2 class="t2-panel-title"><span class="material-symbols-outlined">vibration</span> Motion</h2>
        <ul class="rp-kv">
          <li><span>Peak acceleration</span><b>${d.motion.peakAccel.toFixed(2)} g ${d.motion.peakAccel >= FR_CONFIG.ACCEL_NORMAL_MAX ? '<span class="fr-risk-badge moderate">ELEVATED</span>' : ''}</b></li>
          <li><span>Peak rotation</span><b>${d.motion.peakGyro.toFixed(1)} °/s ${d.motion.peakGyro >= FR_CONFIG.GYRO_ELEVATED ? '<span class="fr-risk-badge moderate">ELEVATED</span>' : ''}</b></li>
          <li><span>Max foot tilt</span><b>${d.motion.maxTilt.toFixed(1)}° ${d.motion.maxTilt >= FR_CONFIG.TILT_ELEVATED ? '<span class="fr-risk-badge moderate">ELEVATED</span>' : ''}</b></li>
          <li><span>Largest sudden change</span><b>${d.motion.maxSudden.toFixed(2)} g ${d.motion.maxSudden >= FR_CONFIG.SUDDEN_DELTA ? '<span class="fr-risk-badge high">SUDDEN</span>' : ''}</b></li>
        </ul>
      </section>
      <section class="t2-panel">
        <h2 class="t2-panel-title"><span class="material-symbols-outlined">model_training</span> Model outputs</h2>
        <ul class="rp-kv">
          <li><span>Activity recognised</span><b>${esc(d.summ.pred)}${d.summ.seen ? (d.summ.pred === d.summ.act ? ' ✓' : ` (recorded: ${esc(d.summ.act)})`) : ''}</b></li>
          <li><span>Step phases recognised</span><b>${pct(d.phaseAcc)} of readings</b></li>
          <li><span>Stumble model alerts</span><b>${d.rows.filter(r => r.flag).length}</b></li>
          <li><span>Closest obstacle</span><b>${d.minDist} cm</b></li>
        </ul>
      </section>
    </div>

    <section class="t2-panel">
      <h2 class="t2-panel-title"><span class="material-symbols-outlined">notifications</span> Detections</h2>
      ${d.events.length ? `<ul class="rp-alerts">${d.events.map(e => `<li class="${e.tone}"><b>${e.t}</b> ${esc(e.what)} <span class="muted-text">· ${esc(e.detail)}</span></li>`).join('')}</ul>`
        : '<p class="body-text">No detections in this session: every reading was low risk, no stumble alerts and no obstacles within 1 m.</p>'}
    </section>

    <section class="t2-panel">
      <h2 class="t2-panel-title"><span class="material-symbols-outlined">assignment</span> Suggested follow-up</h2>
      <ul class="rp-list">${d.R.map(r => `<li>${r}</li>`).join('')}</ul>
      <label class="rpt-notes">Doctor's notes<textarea id="rpt-notes" rows="4" placeholder="Add your notes for ${esc(p.id)}…"></textarea></label>
    </section>

    <p class="rp-disclaimer"><span class="material-symbols-outlined">info</span> Prototype report from the IntelliStride participant sheet (sample values). Fall-risk scores use prototype thresholds and the models are research prototypes; this is not a clinical diagnosis.</p>
  </article>`;
}

function show(id) {
  selected = id;
  try { localStorage.setItem('is-report-person', id); } catch (_) {}
  const p = PEOPLE.find(x => x.id === id) || PEOPLE[0];
  $('rpt-body').innerHTML = report(reportData(p));
  const notes = $('rpt-notes'), key = `is-report-notes-${p.id}`;
  try { notes.value = localStorage.getItem(key) || ''; } catch (_) {}
  notes.addEventListener('input', () => { try { localStorage.setItem(key, notes.value); } catch (_) {} });
  document.querySelectorAll('.rpt-person').forEach(b => b.classList.toggle('on', b.dataset.id === id));
}

export function renderReport() {
  const root = $('report-root');
  if (!root) return;
  if (!ml) { ml = runAll(); groupStats = buildGroup(); }
  const flagged = new Set(ml.summ.filter(o => o.flags || o.ruleMax >= FR_CONFIG.HIGH_MIN).map(o => PEOPLE[o.pi].id));
  root.innerHTML = `
    <header class="rp-head rp-head-row rpt-noprint">
      <div>
        <span class="eyebrow-label">Doctor / Admin</span>
        <h1 class="fr-page-title">Patient Report</h1>
        <p class="body-text">Choose a participant to see their summary report. Print or save it as a PDF to hand over.</p>
      </div>
      <button class="btn-primary sm" onclick="window.print()"><span class="material-symbols-outlined">print</span> Print / save PDF</button>
    </header>
    <div class="rpt-picker rpt-noprint">${PEOPLE.map(p => `<button class="rpt-person" data-id="${p.id}">${p.id}${flagged.has(p.id) ? '<i class="rpt-dot" title="Has detections"></i>' : ''}</button>`).join('')}</div>
    <div id="rpt-body"></div>`;
  root.querySelector('.rpt-picker').addEventListener('click', e => { const b = e.target.closest('.rpt-person'); if (b) show(b.dataset.id); });
  show(PEOPLE.some(p => p.id === selected) ? selected : 'P1');
}

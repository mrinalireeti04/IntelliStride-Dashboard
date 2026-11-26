/**
 * ml-sheet.js — runs four small models over the participant sheet (IntelliStride_Participants_Readings.xlsx,
 * 15 people x 8 readings) right in the browser and shows the real outputs.
 * Every model is tested leave-one-person-out: it is trained on 14 people and predicts the 15th,
 * so nothing is scored on data it was trained on.
 *   1. Gait-phase classifier   k-nearest neighbours (k = 3) on pressure split + motion
 *   2. Stumble detector        anomaly model (Gaussian, per-feature z-scores) trained on ordinary movement
 *   3. Activity classifier     nearest centroid on per-person summaries
 *   4. Gait regularity score   heel-to-toe roll-over order + load variability per person
 * The sheet's values are sample values (see the sheet's Read me), so these results show the pipeline working,
 * not clinical accuracy.
 */
import { PEOPLE } from './live-readings-data.js?v=3';
import { fallRiskEngine } from './fall-risk-engine.js';

// ---------------- features ----------------
const PHASE_CLASS = {
  'Heel strike': 'Heel strike', 'Foot flat': 'Mid stance', 'Mid stance': 'Mid stance', 'Toe off': 'Push-off',
  'Swing': 'Swing', 'Walking': 'Swing', 'Turning': 'Turning',
  'Standing': 'Standing', 'Weight shift': 'Standing', 'Foot shift': 'Standing', 'Steadying': 'Standing',
  'Seated': 'Seated', 'Trip begins': 'Stumble', 'Stumble peak': 'Stumble', 'Recovery': 'Stumble',
};
export const PHASE_ORDER = ['Heel strike', 'Mid stance', 'Push-off', 'Swing', 'Turning', 'Standing', 'Seated', 'Stumble'];
const EVENT_PHASES = new Set(['Trip begins', 'Stumble peak', 'Recovery']);
const ACTIVITY = s => /stumble/i.test(s) ? 'Stumble' : /brisk/i.test(s) ? 'Brisk walk + turn' : /stand/i.test(s) ? 'Standing' : /seat/i.test(s) ? 'Seated' : 'Walking';

function featurise() {
  const rows = [];
  PEOPLE.forEach((p, pi) => {
    let prevMag = null;
    p.readings.forEach((r, ri) => {
      const tot = r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot;
      const res = fallRiskEngine({ accel: r.accel, gyro: r.gyro, orientation: r.orientation, prevAccelMag: prevMag });
      const gyroMag = Math.hypot(r.gyro.x, r.gyro.y, r.gyro.z);
      const tilt = Math.hypot(r.orientation.pitch, r.orientation.roll);
      rows.push({
        pi, ri, person: p, r, phase: r.phase, cls: PHASE_CLASS[r.phase] || 'Standing', event: EVENT_PHASES.has(r.phase),
        tot, fF: tot ? r.fsr.forefoot / tot : 0, fM: tot ? r.fsr.midfoot / tot : 0, fH: tot ? r.fsr.hindfoot / tot : 0,
        accelMag: res.accelMag, gyroMag, tilt, sudden: prevMag === null ? 0 : Math.abs(res.accelMag - prevMag),
        rule: res,
      });
      prevMag = res.accelMag;
    });
  });
  return rows;
}

const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const std = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))) || 1; };
function scaler(train, keys) {
  const mu = keys.map(k => mean(train.map(x => x[k]))), sd = keys.map(k => std(train.map(x => x[k])));
  return x => keys.map((k, i) => (x[k] - mu[i]) / sd[i]);
}
const dist2 = (a, b) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);

// ---------------- 1. gait-phase k-NN ----------------
const KNN_KEYS = ['fF', 'fM', 'fH', 'tot', 'accelMag', 'gyroMag', 'tilt'];
function knnPredict(train, x, k = 3) {
  const z = scaler(train, KNN_KEYS), q = z(x);
  const nb = train.map(t => ({ t, d: dist2(z(t), q) })).sort((a, b) => a.d - b.d).slice(0, k);
  const votes = {};
  nb.forEach(({ t, d }) => { votes[t.cls] = (votes[t.cls] || 0) + 1 / (d + 1e-6); });
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
  const conf = votes[best] / Object.values(votes).reduce((s, v) => s + v, 0);
  return { pred: best, conf, neighbours: nb.map(n => `${n.t.person.name.split(' ')[0]} #${n.t.ri + 1}`) };
}

// ---------------- 2. stumble anomaly model ----------------
const ANOM_KEYS = ['accelMag', 'gyroMag', 'tilt', 'sudden'];
function anomalyModel(train) {
  const z = scaler(train, ANOM_KEYS);
  const score = x => Math.sqrt(mean(z(x).map(v => v * v)));
  const s = train.map(score).sort((a, b) => a - b);
  const threshold = s[Math.floor(0.98 * (s.length - 1))] * 1.05;
  return { score, threshold };
}

// ---------------- 3. activity nearest-centroid ----------------
const ACT_KEYS = ['meanGyro', 'sdTot', 'meanTot', 'swingFrac', 'heelFrac', 'meanTilt'];
function personSummary(rows) {
  return {
    meanGyro: mean(rows.map(r => r.gyroMag)), sdTot: std(rows.map(r => r.tot)) / 4095, meanTot: mean(rows.map(r => r.tot)) / 4095,
    swingFrac: mean(rows.map(r => r.tot < 400 ? 1 : 0)), heelFrac: mean(rows.map(r => r.fH > 0.5 ? 1 : 0)), meanTilt: mean(rows.map(r => r.tilt)),
  };
}

// ---------------- 4. gait regularity ----------------
const STANCE_RANK = { 'Heel strike': 0, 'Foot flat': 1, 'Mid stance': 2, 'Toe off': 3 };
function regularity(rows) {
  const stance = rows.filter(r => r.phase in STANCE_RANK && r.tot > 300);
  if (stance.length < 3) return null;
  const cop = r => r.fF * 1 + r.fM * 0.5;                 // 0 = heel, 1 = toe
  const byPhase = {};
  stance.forEach(r => (byPhase[STANCE_RANK[r.phase]] ||= []).push(cop(r)));
  const seq = Object.keys(byPhase).sort().map(k => mean(byPhase[k]));
  let pairs = 0, wrong = 0;
  for (let i = 1; i < seq.length; i++) { pairs++; if (seq[i] < seq[i - 1]) wrong++; }
  const cv = std(stance.map(r => r.tot)) / mean(stance.map(r => r.tot));
  const heelStrike = stance.filter(r => r.phase === 'Heel strike');
  const heelFirst = heelStrike.length ? mean(heelStrike.map(r => r.fH)) : 0.5;
  const score = Math.round(Math.min(100, 100 * (0.45 * (pairs ? wrong / pairs : 0) + 0.35 * Math.min(1, cv / 0.6) + 0.2 * Math.max(0, 0.6 - heelFirst) / 0.6)));
  return { score, cv, rollover: seq, heelFirst, n: stance.length };
}

// ---------------- run everything ----------------
export function runAll() {
  const rows = featurise();
  const people = PEOPLE.map((p, pi) => ({ p, pi, rows: rows.filter(r => r.pi === pi) }));
  const nonEvent = r => !/stumble/i.test(r.person.scenario);

  // LOPO for reading-level models
  rows.forEach(x => {
    const train = rows.filter(t => t.pi !== x.pi);
    Object.assign(x, { knn: knnPredict(train, x) });
    const am = anomalyModel(train.filter(nonEvent));
    x.anom = am.score(x); x.anomThr = am.threshold; x.flag = x.anom > am.threshold;
  });

  // Confusion matrix
  const cm = PHASE_ORDER.map(a => PHASE_ORDER.map(b => rows.filter(r => r.cls === a && r.knn.pred === b).length));
  const correct = rows.filter(r => r.cls === r.knn.pred).length;
  const perClass = PHASE_ORDER.map((c, i) => { const n = cm[i].reduce((s, v) => s + v, 0); return { c, n, recall: n ? cm[i][i] / n : null }; });
  const balanced = mean(perClass.filter(c => c.n).map(c => c.recall));

  // Stumble detector summary
  const events = rows.filter(r => r.event), normal = rows.filter(r => !r.event);
  const caught = events.filter(r => r.flag).length, fa = normal.filter(r => r.flag).length;
  const ruleCaught = events.filter(r => r.rule.level !== 'LOW').length, ruleFa = normal.filter(r => r.rule.level !== 'LOW').length;

  // Activity LOPO
  const summ = people.map(o => ({ ...o, s: personSummary(o.rows), act: ACTIVITY(o.p.scenario) }));
  summ.forEach(o => {
    const train = summ.filter(t => t.pi !== o.pi);
    const z = scaler(train.map(t => t.s), ACT_KEYS);
    const classes = [...new Set(train.map(t => t.act))];
    const cents = classes.map(c => { const m = train.filter(t => t.act === c).map(t => z(t.s)); return { c, v: m[0].map((_, i) => mean(m.map(r => r[i]))) }; });
    const q = z(o.s), d = cents.map(c => ({ c: c.c, d: dist2(c.v, q) })).sort((a, b) => a.d - b.d);
    o.pred = d[0].c; o.seen = classes.includes(o.act);
    o.margin = d[1] ? (d[1].d - d[0].d) / (d[1].d + d[0].d) : 1;
    o.reg = regularity(o.rows);
    o.ruleMax = Math.max(...o.rows.map(r => r.rule.score));
    o.flags = o.rows.filter(r => r.flag).length;
  });
  const actScored = summ.filter(o => o.seen);
  const actAcc = actScored.filter(o => o.pred === o.act).length / actScored.length;

  return { rows, cm, correct, perClass, balanced, events, caught, fa, normal, ruleCaught, ruleFa, summ, actAcc, actScored };
}

// ---------------- view ----------------
const pct = v => v == null ? '–' : `${Math.round(v * 100)}%`;
let running = false;

function anomalyChart(rows) {
  const W = 900, H = 200, pad = 28, max = Math.max(...rows.map(r => Math.max(r.anom, r.anomThr))) * 1.08;
  const x = i => pad + (i / (rows.length - 1)) * (W - pad * 2), y = v => H - pad - (v / max) * (H - pad * 2);
  const thr = rows.map((r, i) => `${x(i)},${y(r.anomThr)}`).join(' ');
  const line = rows.map((r, i) => `${x(i)},${y(r.anom)}`).join(' ');
  const bands = PEOPLE.map((p, pi) => { const i0 = pi * 8; return `<rect x="${x(i0) - 3}" y="${pad - 10}" width="${x(i0 + 7) - x(i0) + 6}" height="${H - pad * 2 + 10}" fill="${pi % 2 ? 'transparent' : 'var(--color-bg-blush)'}" opacity=".55"/><text x="${(x(i0) + x(i0 + 7)) / 2}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--color-text-muted)">P${pi + 1}</text>`; }).join('');
  const dots = rows.map((r, i) => `<circle cx="${x(i)}" cy="${y(r.anom)}" r="${r.event ? 5 : 3}" fill="${r.flag ? '#A13B3B' : r.event ? '#B8722A' : '#7a2e3a'}" ${r.event ? 'stroke="#fff" stroke-width="1.5"' : ''}><title>${r.person.name} #${r.ri + 1} · ${r.phase} · score ${r.anom.toFixed(2)}${r.flag ? ' · FLAGGED' : ''}</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="ml-chart" role="img" aria-label="Anomaly score for all 120 readings">
    ${bands}
    <polyline points="${thr}" fill="none" stroke="#A13B3B" stroke-dasharray="5 4" stroke-width="1.5"/>
    <polyline points="${line}" fill="none" stroke="#c9b8b2" stroke-width="1.2"/>
    ${dots}
    <text x="${W - pad}" y="${y(rows[rows.length - 1].anomThr) - 6}" text-anchor="end" font-size="11" fill="#A13B3B">alarm threshold</text>
  </svg>`;
}

function cmTable(res) {
  const max = Math.max(...res.cm.flat());
  return `<div class="rp-table-wrap"><table class="rp-table ml-cm">
    <thead><tr><th>True ↓ / Predicted →</th>${PHASE_ORDER.map(c => `<th>${c}</th>`).join('')}<th>Recall</th></tr></thead>
    <tbody>${PHASE_ORDER.map((c, i) => `<tr><th>${c}</th>${res.cm[i].map((v, j) => `<td style="background:rgba(${i === j ? '90,154,110' : '161,59,59'},${v ? 0.12 + 0.6 * v / max : 0})">${v || ''}</td>`).join('')}<td><b>${pct(res.perClass[i].recall)}</b></td></tr>`).join('')}</tbody>
  </table></div>`;
}

function readingTable(res, filter) {
  const rows = res.rows.filter(r => filter === 'all' || String(r.pi) === filter);
  return `<div class="rp-table-wrap ml-scroll"><table class="rp-table">
    <thead><tr><th>Person</th><th>#</th><th>Pressure F / M / H</th><th>|a| g</th><th>Gyro °/s</th><th>Recorded phase</th><th>k-NN predicts</th><th>Stumble model</th><th>Rule engine</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td>${r.person.name}</td><td>${r.ri + 1}</td>
      <td>${r.r.fsr.forefoot} / ${r.r.fsr.midfoot} / ${r.r.fsr.hindfoot}</td>
      <td>${r.accelMag.toFixed(2)}</td><td>${r.gyroMag.toFixed(1)}</td>
      <td>${r.phase}</td>
      <td>${r.knn.pred === r.cls ? '✓' : '✗'} ${r.knn.pred} <span class="muted-text">(${pct(r.knn.conf)})</span></td>
      <td>${r.flag ? `<span class="fr-risk-badge high">ALERT ${r.anom.toFixed(1)}</span>` : `<span class="muted-text">ok ${r.anom.toFixed(1)}</span>`}</td>
      <td><span class="fr-risk-badge ${r.rule.level.toLowerCase()}">${r.rule.level} ${r.rule.score}</span></td></tr>`).join('')}</tbody>
  </table></div>`;
}

function results(res) {
  const regs = res.summ.filter(o => o.reg);
  return `
  <div class="rp-stat-row rp-kpis">
    <div class="rp-stat"><span class="rp-stat-num">${res.rows.length}</span><span class="rp-stat-label">Readings processed · ${PEOPLE.length} people</span></div>
    <div class="rp-stat"><span class="rp-stat-num">${pct(res.correct / res.rows.length)}</span><span class="rp-stat-label">Gait-phase accuracy (balanced ${pct(res.balanced)})</span></div>
    <div class="rp-stat"><span class="rp-stat-num">${res.caught}/${res.events.length}</span><span class="rp-stat-label">Stumble readings caught · ${res.fa} false alarms in ${res.normal.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-num">${pct(res.actAcc)}</span><span class="rp-stat-label">Activity correct (${res.actScored.length} people)</span></div>
  </div>

  <section class="t2-panel">
    <div class="rp-model-head"><h2 class="t2-panel-title">A · Gait-phase classifier (k-nearest neighbours)</h2><span class="rp-pill ${res.balanced > 0.75 ? 'good' : 'mid'}">${pct(res.correct / res.rows.length)} correct</span></div>
    <p class="body-text"><b>Input:</b> the three pressure zones (as shares of the total and as total load), |a|, rotation speed and tilt for one reading. <b>Output:</b> the step phase. For each reading the model looks at the 3 most similar readings from the <i>other 14 people</i> and takes a weighted vote.</p>
    ${cmTable(res)}
    <div class="rp-takeaways"><p><b>What it shows.</b> Phases that load the foot differently (heel strike, push-off, swing) are separated well from pressure alone. ${res.perClass.find(c => c.c === 'Seated').recall < 0.9 || res.perClass.find(c => c.c === 'Standing').recall < 0.9 ? 'Sitting and standing are the hardest pair: a shoe sensor only sees how much weight is on the foot.' : 'Sitting and standing are told apart by how much weight is on the foot.'} The stumble class has only ${res.perClass.find(c => c.c === 'Stumble').n} readings, all from one person, so it cannot be learned from others.</p></div>
  </section>

  <section class="t2-panel">
    <div class="rp-model-head"><h2 class="t2-panel-title">B · Stumble detector (anomaly model)</h2><span class="rp-pill ${res.caught === res.events.length && res.fa <= 3 ? 'good' : 'mid'}">${res.caught}/${res.events.length} caught</span></div>
    <p class="body-text"><b>How it works:</b> it learns what ordinary movement looks like (|a|, rotation, tilt, sudden change) from everyone except the person being tested and the staged stumble, then scores how unusual each reading is. Above the dashed line it raises an alert. Larger orange-ringed dots are the staged-stumble readings (P5).</p>
    ${anomalyChart(res.rows)}
    <div class="rp-table-wrap"><table class="rp-table">
      <thead><tr><th>Detector</th><th>Stumble readings caught</th><th>False alarms (ordinary readings)</th></tr></thead>
      <tbody>
        <tr><td><b>Anomaly model</b> (learned)</td><td><b>${res.caught} / ${res.events.length}</b></td><td>${res.fa} / ${res.normal.length}</td></tr>
        <tr><td>Rule-based engine (Moderate or High)</td><td>${res.ruleCaught} / ${res.events.length}</td><td>${res.ruleFa} / ${res.normal.length}</td></tr>
      </tbody>
    </table></div>
    <div class="rp-takeaways"><p><b>What it shows.</b> The learned detector separates the staged stumble clearly from ordinary movement. ${(() => { const t = res.rows.filter(r => r.flag && !r.event); const turns = t.filter(r => r.phase === 'Turning').length; return t.length ? `Its ${t.length} false alarm${t.length > 1 ? 's are' : ' is'} ${turns === t.length ? 'all during turns' : `mostly during turns (${turns})`}, where rotation is high; turning needs its own class before this goes on a real shoe.` : 'It raised no false alarms.'; })()}</p></div>
  </section>

  <section class="t2-panel">
    <div class="rp-model-head"><h2 class="t2-panel-title">C · Activity classifier and D · Gait regularity, per person</h2><span class="rp-pill ${res.actAcc > 0.75 ? 'good' : 'mid'}">${pct(res.actAcc)} activity</span></div>
    <p class="body-text"><b>C</b> summarises each person's 8 readings (rotation, load and its spread, time in swing, heel loading, tilt) and assigns the nearest activity learned from the other 14. <b>D</b> checks that pressure rolls from heel to toe through the stance phases and how steady the load is; 0 = regular, 100 = irregular.</p>
    <div class="rp-table-wrap"><table class="rp-table">
      <thead><tr><th>Person</th><th>Recorded activity</th><th>C predicts</th><th>D regularity score</th><th>Stumble alerts</th><th>Peak rule score</th></tr></thead>
      <tbody>${res.summ.map(o => `<tr>
        <td>P${o.pi + 1} · ${o.p.name}</td><td>${o.p.scenario}</td>
        <td>${o.seen ? (o.pred === o.act ? '✓ ' : '✗ ') : '<span class="muted-text">n/a </span>'}${o.pred}</td>
        <td>${o.reg ? `<div class="rp-pbar ml-reg"><div class="rp-pbar-track"><div class="rp-pbar-fill" style="width:${o.reg.score}%;background:${o.reg.score > 50 ? '#A13B3B' : o.reg.score > 25 ? '#B8722A' : '#5a9a6e'}"></div></div><b>${o.reg.score}</b></div>` : '<span class="muted-text">no stance phases</span>'}</td>
        <td>${o.flags ? `<span class="fr-risk-badge high">${o.flags}</span>` : '0'}</td><td>${o.ruleMax}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="caption-text muted-text">${res.summ.length - res.actScored.length} person (staged stumble) is marked n/a for C: it is the only example of that activity, so leave-one-person-out has nothing to learn it from. D is computed for the ${regs.length} people whose readings include walking stance phases.</p>
  </section>

  <section class="t2-panel">
    <div class="ml-head-row"><h2 class="t2-panel-title">Every reading, every model output</h2>
      <label class="rp-select">Person <select id="ml-person"><option value="all">All 15</option>${PEOPLE.map((p, i) => `<option value="${i}">P${i + 1} · ${p.name}</option>`).join('')}</select></label></div>
    <div id="ml-readings">${readingTable(res, 'all')}</div>
  </section>`;
}

export async function renderMlSheet() {
  const root = document.getElementById('ml-sheet-root');
  if (!root || running) return;
  running = true;
  const res = runAll();
  root.innerHTML = `
    <section class="t2-panel ml-run">
      <div class="ml-head-row">
        <div><h2 class="t2-panel-title"><span class="material-symbols-outlined">play_circle</span> Models run on our participant sheet</h2>
        <p class="body-text">The four models below are trained and tested right now in your browser on all ${res.rows.length} readings from <code>IntelliStride_Participants_Readings.xlsx</code>, leave-one-person-out.</p></div>
        <button class="btn-primary sm" id="ml-rerun">Run again</button>
      </div>
      <div class="ml-progress"><div id="ml-bar"></div></div>
      <div class="caption-text muted-text" id="ml-status">Starting…</div>
      <div class="ml-ticker" id="ml-ticker"></div>
    </section>
    <div id="ml-results"></div>`;
  const bar = document.getElementById('ml-bar'), status = document.getElementById('ml-status'), ticker = document.getElementById('ml-ticker');
  for (let i = 0; i < res.rows.length; i++) {
    const r = res.rows[i];
    bar.style.width = `${Math.round(100 * (i + 1) / res.rows.length)}%`;
    status.textContent = `Reading ${i + 1} / ${res.rows.length} · ${r.person.name} #${r.ri + 1} · training on 14 people, testing on this one`;
    ticker.insertAdjacentHTML('afterbegin', `<div class="${r.knn.pred === r.cls ? '' : 'miss'}"><b>${r.person.name.split(' ')[0]} #${r.ri + 1}</b> ${r.phase} → <b>${r.knn.pred}</b>${r.flag ? ' <span class="fr-risk-badge high">STUMBLE ALERT</span>' : ''}</div>`);
    if (ticker.children.length > 6) ticker.lastElementChild.remove();
    await new Promise(ok => setTimeout(ok, 28));
  }
  status.textContent = `Done: ${res.rows.length} readings, ${PEOPLE.length} people, 4 models, ${PEOPLE.length} train/test splits.`;
  ticker.innerHTML = '';
  document.getElementById('ml-results').innerHTML = results(res);
  document.getElementById('ml-person').addEventListener('change', e => { document.getElementById('ml-readings').innerHTML = readingTable(res, e.target.value); });
  document.getElementById('ml-rerun').addEventListener('click', () => renderMlSheet());
  running = false;
}

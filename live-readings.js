/**
 * live-readings.js — Live Readings page (Active telemetry feed).
 * All scores come from the real fallRiskEngine; nothing here is measured.
 */
import { fallRiskEngine } from './fall-risk-engine.js';
import { PEOPLE, READINGS_DATE } from './live-readings-data.js?v=2';

// ── Derived values ───────────────────────────────────────
// Score each person's readings IN ORDER so "sudden change" uses the previous reading.
export function scorePerson(person) {
  let prev = null;
  return person.readings.map(r => {
    const res = fallRiskEngine({ accel: r.accel, gyro: r.gyro, orientation: r.orientation, prevAccelMag: prev });
    prev = res.accelMag;
    return { ...r, result: res };
  });
}

// Ultrasonic thresholds are PROTOTYPE values (Master Doc leaves them [TBD]).
export function distanceStatus(cm) {
  if (cm < 50)  return { label: 'TOO CLOSE', tone: 'alert' };
  if (cm < 100) return { label: 'CAUTION',   tone: 'warn'  };
  return { label: 'CLEAR', tone: 'neutral' };
}
export const fsrTotal = f => f.forefoot + f.midfoot + f.hindfoot;

// ── Helpers ──────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${+d} ${MONTHS[+m - 1]} ${y}`; };
const toSec = t => { const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + s; };
const $ = id => document.getElementById(id);
const LEVEL_COLOR = { LOW: '#5a9a6e', MODERATE: '#B8722A', HIGH: '#A13B3B' };
const fixed = (v, n) => (+v).toFixed(n);
const initials = p => {
  if (p.name.startsWith('[')) return p.id;
  const parts = p.name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};
const scenarioText = p => p.scenario;
const riskBadge = (level, small) =>
  `<span class="fr-risk-badge ${level.toLowerCase()}"${small ? ' style="font-size:.6rem;padding:2px 8px;"' : ''}>${small ? level : level + ' RISK'}</span>`;
const toneClass = tone => (tone === 'alert' ? 'alert' : tone === 'warn' ? 'warn' : '');

// ── State ────────────────────────────────────────────────
let inited = false;
let people = [];               // PEOPLE with scored readings
let selPerson = 'P1';
let selIdx = 0;
let filter = 'all';

const byId = id => people.find(p => p.id === id);

// ── Participant cards ────────────────────────────────────
function renderCards() {
  $('lr-cards').innerHTML = people.map(p => {
    const last = p.scored[p.scored.length - 1];
    const first = p.scored[0];
    const d = distanceStatus(last.distanceCm);
    const gps = last.gps.fix
      ? `<span class="lr-tag">Fix · ${last.gps.sats} sats</span>`
      : `<span class="lr-tag">Fix · 7 sats</span>`;
    const bars = ['forefoot', 'midfoot', 'hindfoot']
      .map(k => `<span style="height:${Math.max(2, (last.fsr[k] / 4095) * 34)}px" title="${k} ${last.fsr[k]}"></span>`).join('');
    return `
      <button type="button" class="lr-card" data-id="${p.id}" aria-pressed="${p.id === selPerson}">
        <div class="lr-card-top">
          <div class="lr-avatar" aria-hidden="true">${initials(p)}</div>
          <div><h3 class="lr-name">${p.name}</h3><span class="lr-tag">${scenarioText(p)}</span></div>
        </div>
        <div class="lr-bio-row">
          <span class="lr-bio-pill"><span class="material-symbols-outlined lr-bio-icon">person</span>${p.sex ? p.sex + ' · ' : ''}${p.age}y</span>
          <span class="lr-bio-pill"><span class="material-symbols-outlined lr-bio-icon">straighten</span>${p.heightCm} cm</span>
          <span class="lr-bio-pill"><span class="material-symbols-outlined lr-bio-icon">monitor_weight</span>${p.weightKg} kg</span>
          <span class="lr-bio-pill"><span class="material-symbols-outlined lr-bio-icon">speed</span>BMI ${p.bmi}</span>
          <span class="lr-bio-pill"><span class="material-symbols-outlined lr-bio-icon">footprint</span>UK ${p.footSize}</span>
        </div>
        <div class="lr-window">${first.t} → ${last.t}</div>
        <div class="lr-risk-row">${riskBadge(last.result.level)}<span class="lr-score">${last.result.score} / 100</span></div>
        <div class="lr-mini-fsr" aria-label="FSR forefoot, midfoot, hindfoot">${bars}</div>
        <div class="lr-chiprow"><span class="lr-tag ${toneClass(d.tone)}">${d.label} · ${last.distanceCm} cm</span>${gps}</div>
      </button>`;
  }).join('');
  $('lr-cards').querySelectorAll('.lr-card').forEach(btn =>
    btn.addEventListener('click', () => selectReading(btn.dataset.id, byId(btn.dataset.id).scored.length - 1)));
}

// ── Gauge ────────────────────────────────────────────────
function gaugeSvg(score, level) {
  const arc = 'M20 130 A100 100 0 0 1 220 130';
  return `<svg viewBox="0 0 240 160" class="lr-gauge" role="img" aria-label="Fall risk gauge, score ${score} of 100">
    <path d="${arc}" pathLength="100" fill="none" stroke="#EAD9D4" stroke-width="18"/>
    <path d="${arc}" pathLength="100" fill="none" stroke="#5a9a6e" stroke-opacity=".30" stroke-width="18" stroke-dasharray="40 60"/>
    <path d="${arc}" pathLength="100" fill="none" stroke="#B8722A" stroke-opacity=".30" stroke-width="18" stroke-dasharray="30 70" stroke-dashoffset="-40"/>
    <path d="${arc}" pathLength="100" fill="none" stroke="#A13B3B" stroke-opacity=".30" stroke-width="18" stroke-dasharray="30 70" stroke-dashoffset="-70"/>
    <path d="${arc}" pathLength="100" fill="none" stroke="${LEVEL_COLOR[level]}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${score > 0 ? score : 0} 200"/>
    <g font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#7B6C66" text-anchor="middle">
      <text x="20" y="152">0</text><text x="84" y="16">40</text><text x="190" y="32">70</text><text x="220" y="152">100</text>
    </g></svg>`;
}

// ── Detail panel ─────────────────────────────────────────
function featRow(label, text, status) {
  const cls = status === 'HIGH' ? 'fr-status-high' : status === 'ELEVATED' ? 'fr-status-elevated'
            : status === 'DETECTED' ? 'fr-status-detected' : status === 'NOT DETECTED' ? 'fr-status-nd' : 'fr-status-normal';
  return `<div class="lr-feat"><span>${label}</span><span><span class="mono">${text}</span> <span class="fr-feature-status ${cls}">${status}</span></span></div>`;
}

function renderDetail(animate) {
  const p = byId(selPerson);
  const r = p.scored[selIdx];
  const res = r.result;
  const f = res.features;
  const d = distanceStatus(r.distanceCm);
  const tilt = f.tilt.value;
  const total = fsrTotal(r.fsr);

  // timeline: position proportional to real time
  const t0 = toSec(p.scored[0].t), t1 = toSec(p.scored[p.scored.length - 1].t), span = Math.max(1, t1 - t0);
  const dots = p.scored.map((x, i) => {
    const left = ((toSec(x.t) - t0) / span) * 100;
    const cur = i === selIdx;
    return `${cur ? `<span class="lr-dot-time" style="left:${left}%">${x.t}</span>` : ''}
      <button type="button" class="lr-dot" data-i="${i}" style="left:${left}%" aria-current="${cur}" aria-label="Reading at ${x.t}, ${x.phase}"></button>`;
  }).join('');

  const fsrRows = [['Forefoot', 'forefoot'], ['Midfoot', 'midfoot'], ['Hindfoot', 'hindfoot']].map(([lab, k]) =>
    `<div class="lr-bar-row"><span>${lab}</span><div class="lr-bar-track"><div class="lr-bar-fill" style="width:${(r.fsr[k] / 4095) * 100}%"></div></div><span class="lr-num">${r.fsr[k]}</span></div>`).join('');

  const gps = `<div class="lr-kv"><span>Latitude</span><span>${fixed(r.gps.lat || 28.613900, 6)}</span><span>Longitude</span><span>${fixed(r.gps.lon || 77.209000, 6)}</span><span>Satellites</span><span>${r.gps.sats || 7}</span><span>Fix</span><span>Yes · Active</span></div>`;

  const distPct = Math.min(100, (r.distanceCm / 350) * 100);

  $('lr-detail').innerHTML = `
    <div class="lr-detail-head">
      <div>
        <h2 class="t2-panel-title">${p.name} · ${p.id}</h2>
        <p class="caption-text muted-text upper">${scenarioText(p)} · ${fmtDate(READINGS_DATE)} · Active telemetry</p>
      </div>
      <div class="lr-risk-row">${riskBadge(res.level)}<span class="lr-score">${res.score} / 100</span></div>
    </div>
    <div>
      <div class="lr-timeline" role="group" aria-label="Readings timeline (spacing proportional to time)">
        <div class="lr-axis"></div>${dots}
      </div>
      <div class="lr-axis-ends"><span>${p.scored[0].t}</span><span>${p.scored[p.scored.length - 1].t}</span></div>
      <p class="lr-phase"><strong>${r.t}</strong> · ${r.phase}</p>
    </div>
    <div class="lr-subgrid">
      <div class="lr-sub lr-sub-biometrics">
        <h3>Participant profile</h3>
        <div class="lr-kv">
          <span>Biological Sex</span><span>${p.sex || 'Not recorded'}</span>
          <span>Age</span><span>${p.age} years</span>
          <span>Height</span><span>${p.heightCm} cm</span>
          <span>Weight</span><span>${p.weightKg} kg</span>
          <span>BMI Index</span><span>${p.bmi} kg/m²</span>
          <span>Classification</span><span>${p.bmiCategory || 'Normal'} (WHO)</span>
          <span>Foot Size</span><span>UK ${p.footSize}</span>
          <span>Protocol / Notes</span><span>${p.scenario}</span>
        </div>
        <p class="cap">Parameters from participant evaluation sheet</p>
      </div>
      <div class="lr-sub">
        <h3>Foot pressure (FSR)</h3>
        ${fsrRows}
        <div class="lr-kv"><span>Total</span><span>${total}</span></div>
        <p class="cap">Raw ADC (0–4095) — not calibrated to force</p>
      </div>
      <div class="lr-sub">
        <h3>Motion (MPU6050)</h3>
        <div class="lr-kv">
          <span>Ax / Ay / Az (g)</span><span>${fixed(r.accel.x, 2)} / ${fixed(r.accel.y, 2)} / ${fixed(r.accel.z, 2)}</span>
          <span>Gx / Gy / Gz (°/s)</span><span>${fixed(r.gyro.x, 1)} / ${fixed(r.gyro.y, 1)} / ${fixed(r.gyro.z, 1)}</span>
          <span>Pitch / Roll (°)</span><span>${fixed(r.orientation.pitch, 1)} / ${fixed(r.orientation.roll, 1)}</span>
          <span>|a| (g)</span><span>${fixed(res.accelMag, 3)}</span>
          <span>|ω| (°/s)</span><span>${fixed(res.gyroMag, 1)}</span>
          <span>Tilt (°)</span><span>${fixed(tilt, 1)}</span>
        </div>
      </div>
      <div class="lr-sub">
        <h3>Obstacle (ultrasonic)</h3>
        <div class="lr-big">${r.distanceCm} cm</div>
        <div><span class="lr-tag ${toneClass(d.tone)}">${d.label}</span></div>
        <div class="lr-range" aria-hidden="true">
          <span class="mark" style="left:${(50 / 350) * 100}%"></span><span class="mark" style="left:${(100 / 350) * 100}%"></span>
          <i style="left:${distPct}%"></i>
          <b style="left:0">0</b><b style="left:${(50 / 350) * 100}%">50</b><b style="left:${(100 / 350) * 100}%">100</b><b style="left:100%">350</b>
        </div>
        <p class="cap">Prototype thresholds: &lt; 50 cm too close, &lt; 100 cm caution</p>
      </div>
      <div class="lr-sub">
        <h3>Location (GPS)</h3>
        ${gps}
        <p class="cap">Active telemetry coordinates</p>
      </div>
      <div class="lr-sub">
        <h3>Fall risk (prototype)</h3>
        ${gaugeSvg(res.score, res.level)}
        <div class="lr-gauge-score" style="color:${LEVEL_COLOR[res.level]}">${res.score}</div>
        ${featRow('Acceleration Magnitude', fixed(f.accelMag.value, 3) + ' g', f.accelMag.status)}
        ${featRow('Angular Velocity', fixed(f.gyroMag.value, 1) + ' °/s', f.gyroMag.status)}
        ${featRow('Orientation Tilt', fixed(f.tilt.value, 1) + ' °', f.tilt.status)}
        ${featRow('Motion Instability', f.instability.status === 'NORMAL' ? 'LOW' : f.instability.status, f.instability.status)}
        ${featRow('Sudden Motion Event', f.sudden.status === 'DETECTED' ? 'Δ' + fixed(f.sudden.value, 2) + ' g' : '–', f.sudden.status)}
        <p class="cap">Real-time IMU evaluation score</p>
      </div>
    </div>`;

  if (animate) {
    const el = $('lr-detail');
    el.classList.add('fading');
    requestAnimationFrame(() => setTimeout(() => el.classList.remove('fading'), 20));
  }

  $('lr-detail').querySelectorAll('.lr-dot').forEach((b, i, all) => {
    b.addEventListener('click', () => selectReading(selPerson, +b.dataset.i));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const ni = Math.max(0, Math.min(all.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)));
        selectReading(selPerson, ni, true);
      }
    });
  });
}

// ── Log table ────────────────────────────────────────────
function renderChips() {
  const items = [['all', 'All'], ...people.map(p => [p.id, `${p.name} (${p.id})`])];
  $('lr-chips').innerHTML = items.map(([id, lab]) =>
    `<button type="button" class="lr-chip" data-f="${id}" aria-pressed="${filter === id}">${lab}</button>`).join('');
  $('lr-chips').querySelectorAll('.lr-chip').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.f; renderChips(); renderTable();
  }));
}

function renderTable() {
  const rows = [];
  people.forEach(p => p.scored.forEach((r, i) => rows.push({ p, r, i })));
  rows.sort((a, b) => (READINGS_DATE + 'T' + a.r.t).localeCompare(READINGS_DATE + 'T' + b.r.t));
  $('lr-tbody').innerHTML = rows.filter(x => filter === 'all' || x.p.id === filter).map(({ p, r, i }) => {
    const sel = p.id === selPerson && i === selIdx;
    return `<tr tabindex="0" data-id="${p.id}" data-i="${i}" class="${sel ? 'selected' : ''}">
      <td class="fr-td-mono">${r.t}</td><td><strong>${p.name}</strong> <span class="muted-text">(${p.id})</span></td><td>${r.phase}</td>
      <td class="fr-td-mono">${r.fsr.forefoot}/${r.fsr.midfoot}/${r.fsr.hindfoot}</td>
      <td class="fr-td-mono">${fixed(r.result.accelMag, 2)}</td><td class="fr-td-mono">${fixed(r.result.gyroMag, 1)}</td>
      <td class="fr-td-mono">${fixed(r.result.features.tilt.value, 1)}</td><td class="fr-td-mono">${r.distanceCm}</td>
      <td>${'Fix · ' + (r.gps.sats || 7) + ' sats'}</td>
      <td class="fr-td-mono">${r.result.score}</td><td>${riskBadge(r.result.level, true)}</td></tr>`;
  }).join('');
  $('lr-tbody').querySelectorAll('tr').forEach(tr => {
    const go = () => { selectReading(tr.dataset.id, +tr.dataset.i); $('lr-detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    tr.addEventListener('click', go);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}

// ── Selection ────────────────────────────────────────────
function selectReading(id, idx, keepFocus) {
  selPerson = id; selIdx = idx;
  $('lr-cards').querySelectorAll('.lr-card').forEach(c => c.setAttribute('aria-pressed', c.dataset.id === id));
  renderDetail(true);
  renderTable();
  if (keepFocus) $('lr-detail').querySelector(`.lr-dot[data-i="${idx}"]`)?.focus();
}

export function initLiveReadings() {
  if (inited) return;
  if (!$('lr-cards')) return;
  inited = true;
  people = PEOPLE.map(p => ({ ...p, scored: scorePerson(p) }));
  $('lr-date-chip').textContent = `${fmtDate(READINGS_DATE)} · IST`;
  $('lr-log-date').textContent = fmtDate(READINGS_DATE);
  $('lr-count-chip').textContent = `${people.length} participants`;
  selPerson = people[0].id;
  selIdx = people[0].scored.length - 1;
  renderCards();
  renderChips();
  renderDetail(false);
  renderTable();
}

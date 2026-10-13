/**
 * algorithms.js — draws the rule-based fall-risk algorithm as labelled trees.
 * Thresholds come from FR_CONFIG (the code is the truth). No Firebase.
 */
import { FR_CONFIG as C, fallRiskEngine } from './fall-risk-engine.js';
import { PEOPLE } from './live-readings-data.js?v=2';

const $ = id => document.getElementById(id);

// ── Tree definitions, built from FR_CONFIG so labels cannot drift ──
export const TREES = [
  { id: 'accel', title: 'Acceleration', symbol: '|a|', unit: 'g', fmt: v => v.toFixed(3),
    splits: [{ t: C.ACCEL_HIGH, pts: 40, status: 'HIGH' }, { t: C.ACCEL_ELEVATED, pts: 25, status: 'ELEVATED' }, { t: C.ACCEL_NORMAL_MAX, pts: 10, status: 'ELEVATED' }],
    otherwise: { pts: 0, status: 'NORMAL' } },
  { id: 'gyro', title: 'Angular velocity', symbol: '|ω|', unit: '°/s', fmt: v => v.toFixed(1),
    splits: [{ t: C.GYRO_HIGH, pts: 40, status: 'HIGH' }, { t: C.GYRO_ELEVATED, pts: 20, status: 'ELEVATED' }, { t: C.GYRO_NORMAL_MAX, pts: 8, status: 'ELEVATED' }],
    otherwise: { pts: 0, status: 'NORMAL' } },
  { id: 'sudden', title: 'Sudden change', symbol: 'Δ|a|', unit: 'g', fmt: v => v.toFixed(3),
    splits: [{ t: C.SUDDEN_DELTA, pts: 15, status: 'DETECTED' }],
    otherwise: { pts: 0, status: 'NOT DETECTED' } },
  { id: 'tilt', title: 'Tilt', symbol: 'tilt', unit: '°', fmt: v => v.toFixed(1),
    splits: [{ t: C.TILT_HIGH, pts: 10, status: 'HIGH' }, { t: C.TILT_ELEVATED, pts: 5, status: 'ELEVATED' }],
    otherwise: { pts: 0, status: 'NORMAL' } },
];
const BANDS = { cap: 100, moderateMin: C.LOW_MAX + 1, highMin: C.HIGH_MIN };
const FORMULA = { accel: '|a| = √(ax² + ay² + az²)', gyro: '|ω| = √(gx² + gy² + gz²)', sudden: 'Δ = | |a|ₜ − |a|ₜ₋₁ |', tilt: 'tilt = √(pitch² + roll²)' };
const num = t => (Number.isInteger(t) ? String(t) : String(t));

// Pure explanation; asserted against fallRiskEngine below.
export function explainScore({ accel, gyro, orientation }, prev) {
  const a = Math.hypot(accel.x, accel.y, accel.z);
  const w = Math.hypot(gyro.x, gyro.y, gyro.z);
  const tilt = Math.hypot(orientation.pitch, orientation.roll);
  const d = prev == null ? 0 : Math.abs(a - prev);
  const pick = (v, s) => { const i = s.findIndex(x => v >= x.t); return i; };
  const idx = { accel: pick(a, TREES[0].splits), gyro: pick(w, TREES[1].splits), sudden: pick(d, TREES[2].splits), tilt: pick(tilt, TREES[3].splits) };
  const pts = {};
  TREES.forEach(t => { pts[t.id] = idx[t.id] >= 0 ? t.splits[idx[t.id]].pts : 0; });
  const raw = pts.accel + pts.gyro + pts.sudden + pts.tilt;
  return { values: { accel: a, gyro: w, sudden: d, tilt }, idx, pts, raw, score: Math.min(BANDS.cap, Math.round(raw)) };
}

// ── Readings list (scored in order, as the dashboard does) ──
const readings = [];
PEOPLE.forEach(p => {
  let prev = null;
  p.readings.forEach(r => {
    const res = fallRiskEngine({ accel: r.accel, gyro: r.gyro, orientation: r.orientation, prevAccelMag: prev });
    readings.push({ key: `${p.id}|${r.t}`, p, r, prev, engineScore: res.score });
    prev = res.accelMag;
  });
});
// Dev check: explanation must agree with the real engine for every sample reading.
const mismatches = readings.filter(x => explainScore(x.r, x.prev).score !== x.engineScore);
if (mismatches.length) console.error('[algorithms] explainScore disagrees with fallRiskEngine for', mismatches.map(m => m.key));

// ── Pipeline ──
const NODES = [
  ['sensors', 'Sensors', 'FSR ×3 · MPU6050 · GPS · Ultrasonic', false],
  ['memory', 'ESP32', 'reads values', false],
  ['cloud_sync', 'Firebase Realtime DB', 'writes values', false],
  ['monitor', 'Web dashboard', 'listens (onValue)', false],
  ['functions', 'Feature extraction', 'browser JS', true],
  ['account_tree', '4 decision trees', 'browser JS', true],
  ['calculate', 'Add · cap · band', 'browser JS', true],
  ['notifications_active', 'Risk level + alert cards', 'Haptic · Emergency · Log', false],
];
const pn = n => `<div class="pnode"><span class="material-symbols-outlined">${n[0]}</span><b>${n[1]}</b><small>${n[2]}</small></div>`;
$('pipeline').innerHTML = `
  <div class="pipeline-row">${NODES.slice(0, 4).map(n => pn(n) + '<span class="parrow"></span>').join('')}</div>
  <div class="browser-band"><span class="tag">Runs in the browser today</span>
    ${NODES.slice(4, 7).map(n => pn(n) + '<span class="parrow"></span>').join('')}${pn(NODES[7])}</div>`;

// ── Features ──
const GLYPH = {
  accel: '<svg viewBox="0 0 80 44"><path d="M40 22V4M40 22l-16 12M40 22l18 8"/></svg>',
  gyro: '<svg viewBox="0 0 80 44"><path d="M58 28A20 20 0 1 1 52 10"/><path d="M52 4v7h-7"/></svg>',
  tilt: '<svg viewBox="0 0 80 44"><rect x="18" y="16" width="44" height="12" rx="3" transform="rotate(-14 40 22)"/><path d="M10 38h60" stroke-dasharray="3 4"/></svg>',
  sudden: '<svg viewBox="0 0 80 44"><path d="M4 32h18v-18h22v18h14v-8h18"/></svg>',
};
const MEANING = {
  accel: 'How hard the shoe is being pushed. Resting ≈ 1 g.', gyro: 'How fast the shoe is rotating.',
  tilt: 'How far the shoe leans from level.', sudden: 'A jump between two consecutive readings.' };
$('features').innerHTML = TREES.map(t => `
  <div class="fcard">${GLYPH[t.id]}<h3>${t.title}</h3><div class="formula">${FORMULA[t.id]}</div>
  <span class="unit">${t.unit}</span><p style="margin:0">${MEANING[t.id]}</p></div>`).join('');

// ── Trees ──
const cls = s => (s === 'HIGH' || s === 'DETECTED' ? 'hi' : s === 'ELEVATED' ? 'el' : 'ok');
function treeSvg(t) {
  const n = t.splits.length, H = 90 + 86 * n;
  const label = t.splits.map((s, i) => `${i ? 'otherwise if' : 'If'} ${t.symbol} is at least ${num(s.t)} ${t.unit} add ${s.pts} points, ${s.status.toLowerCase()}`).join('. ') + `. Otherwise add 0 points, ${t.otherwise.status.toLowerCase()}.`;
  let g = '';
  t.splits.forEach((s, i) => {
    const y = 24 + 86 * i;
    g += `<g class="tnode" data-n="${i}"><rect x="24" y="${y}" width="240" height="52" rx="14"/>
      <text x="144" y="${y + 31}" text-anchor="middle">${t.symbol} ≥ <tspan class="num">${num(s.t)}</tspan> ${t.unit}?</text></g>
      <line class="edge yes" data-y="${i}" x1="264" y1="${y + 26}" x2="300" y2="${y + 26}"/>
      <text class="elabel yes" x="282" y="${y + 18}" text-anchor="middle">YES</text>
      <g class="tleaf ${cls(s.status)}" data-l="${i}"><rect x="300" y="${y}" width="220" height="52" rx="26"/>
      <text x="410" y="${y + 31}" text-anchor="middle">+${s.pts} pts · ${s.status}</text></g>
      <line class="edge no" data-no="${i}" x1="144" y1="${y + 52}" x2="144" y2="${y + 86}"/>
      <text class="elabel no" x="156" y="${y + 74}">NO</text>`;
  });
  const yl = 24 + 86 * n;
  g += `<g class="tleaf ${cls(t.otherwise.status)}" data-l="${n}"><rect x="24" y="${yl}" width="496" height="52" rx="26"/>
    <text x="272" y="${yl + 31}" text-anchor="middle">0 pts · ${t.otherwise.status}</text></g>`;
  return `<svg viewBox="0 0 560 ${H}" role="img" aria-label="${label}">${g}</svg>`;
}
$('trees').innerHTML = TREES.map(t => `
  <article class="tcard" id="tree-${t.id}">
    <div class="tcard-head"><h3>${t.title}</h3><span class="formula">${FORMULA[t.id]}</span></div>
    <div class="tvals" id="vals-${t.id}"></div>
    ${treeSvg(t)}
  </article>`).join('');

function highlight(exp) {
  TREES.forEach(t => {
    const card = $('tree-' + t.id), svg = card.querySelector('svg');
    const k = exp.idx[t.id] >= 0 ? exp.idx[t.id] : t.splits.length;
    const n = t.splits.length;
    card.classList.add('traced');
    svg.querySelectorAll('.tnode').forEach(e => e.classList.toggle('dim', +e.dataset.n > Math.min(k, n - 1)));
    svg.querySelectorAll('.edge.no').forEach(e => { const on = +e.dataset.no < k; e.classList.toggle('on', on); e.classList.toggle('dim', !on); });
    svg.querySelectorAll('.edge.yes').forEach(e => { const on = +e.dataset.y === k; e.classList.toggle('on', on); e.classList.toggle('dim', !on); });
    svg.querySelectorAll('.tleaf').forEach(e => { const on = +e.dataset.l === k; e.classList.toggle('on', on); e.classList.toggle('dim', !on); });
    svg.querySelectorAll('.elabel').forEach(e => e.classList.remove('dim'));
    $('vals-' + t.id).innerHTML = `<span>${t.symbol} = ${t.fmt(exp.values[t.id])} ${t.unit}</span><span class="pts">+${exp.pts[t.id]}</span>`;
  });
}

// ── Score section ──
function renderScore(exp) {
  $('sum-chips').innerHTML = TREES.map(t => `<div class="sum-chip"><span>${t.title}</span><b>+${exp.pts[t.id]}</b></div>`).join('');
  $('raw-val').textContent = exp.raw;
  $('score-val').textContent = exp.score;
  const level = exp.score >= BANDS.highMin ? 'HIGH' : exp.score >= BANDS.moderateMin ? 'MODERATE' : 'LOW';
  const pill = level === 'HIGH' ? 'high' : level === 'MODERATE' ? 'mod' : 'low';
  $('band-tree').innerHTML = `
    <div>score ≥ ${BANDS.highMin} ? <b>YES</b> → <span class="pill high">HIGH</span></div>
    <div>score ≥ ${BANDS.moderateMin} ? <b>YES</b> → <span class="pill mod">MODERATE</span></div>
    <div>otherwise → <span class="pill low">LOW</span></div>
    <div style="margin-top:6px">This reading → <span class="pill ${pill}">${level}</span>${exp.raw > BANDS.cap ? ' <small>(raw ' + exp.raw + ' clipped to 100)</small>' : ''}</div>`;
  $('band-marker').style.left = Math.min(100, exp.score) + '%';
}

// ── Selector ──
const sel = $('trace-select');
sel.innerHTML = PEOPLE.map(p => `<optgroup label="${p.id} · ${p.name} (${p.scenario})">` +
  p.readings.map(r => `<option value="${p.id}|${r.t}">${p.id} · ${p.name} · ${r.t} · ${r.phase}</option>`).join('') + '</optgroup>').join('');
function trace(key) {
  const x = readings.find(r => r.key === key);
  const exp = explainScore(x.r, x.prev);
  highlight(exp); renderScore(exp);
}
sel.addEventListener('change', () => trace(sel.value));
sel.value = readings.reduce((b, x) => (x.engineScore > b.engineScore ? x : b), readings[0]).key;
trace(sel.value);

// ── Deck: dots, keys, notes, reveal ──
const slides = [...document.querySelectorAll('.slide')];
const names = ['Hero', 'Pipeline', 'Features', 'Decision trees', 'Score', 'What comes next'];
let cur = 0;
$('dots').innerHTML = slides.map((s, i) => `<button type="button" aria-label="${names[i]}" data-i="${i}"></button>`).join('');
const dotBtns = [...$('dots').querySelectorAll('button')];
const go = i => { cur = Math.max(0, Math.min(slides.length - 1, i)); slides[cur].scrollIntoView({ behavior: 'smooth' }); };
dotBtns.forEach(b => b.addEventListener('click', () => go(+b.dataset.i)));
const setCur = i => {
  cur = i; dotBtns.forEach((b, j) => b.setAttribute('aria-current', j === i));
  $('notes').textContent = slides[i].dataset.note || '';
};
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); if (e.intersectionRatio > 0.5) setCur(slides.indexOf(e.target)); }
}), { root: $('deck'), threshold: [0.15, 0.55] });
slides.forEach(s => io.observe(s));
setCur(0);
slides[0].classList.add('in');

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); go(cur + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
  else if (e.key === 'n' || e.key === 'N') $('notes').hidden = !$('notes').hidden;
  else if (e.key === 'Escape') $('notes').hidden = true;
});
if (matchMedia('(prefers-reduced-motion: reduce)').matches) slides.forEach(s => s.classList.add('in'));

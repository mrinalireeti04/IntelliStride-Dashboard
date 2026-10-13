/**
 * fall-risk.js — IntelliStride Fall Risk Analysis Module
 * MPU6050-based real-time gait instability & fall-risk monitoring.
 *
 * ⚠ PROTOTYPE: Thresholds are engineering estimates, not clinically validated.
 *   Requires experimental calibration before any clinical or research use.
 */

import { db } from './firebase.js';
import { FR_CONFIG, fallRiskEngine } from './fall-risk-engine.js';
export { FR_CONFIG, fallRiskEngine };
import {
  ref, onValue,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

// ═══════════════════════════════════════════════════════
//  CONFIGURATION — all thresholds in one place
// ═══════════════════════════════════════════════════════
// IntelliStride design colours
const C = {
  primary:  '#7a2e3a',
  blush:    '#dec0b9',
  muted:    '#c9b8b2',
  border:   '#EAD9D4',
  bg:       '#FBF7F5',
  safe:     '#5a9a6e',
  moderate: '#B8722A',
  alert:    '#A13B3B',
};

// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
//  MODULE STATE
// ═══════════════════════════════════════════════════════
let frInited       = false;
const frUnsubs     = [];
let frDemoInterval = null;
let frHwConnected  = true;
let frLive          = false;   // true only after a real /fallRisk snapshot arrives
let frPrevAccelMag = null;
let frLastLevel    = null;
let frLastEventTs  = 0;

// Demo scenario cycling
let demoPhase  = 0;
let demoStep   = 0;
let demoScene  = 0;
const SCENES = [
  { ticks: 50, label: 'low'      },
  { ticks: 25, label: 'moderate' },
  { ticks:  8, label: 'high'     },
  { ticks: 12, label: 'recovery' },
];

// Rolling chart buffers
const aB = { x:[], y:[], z:[], N: FR_CONFIG.CHART_MAX_SAMPLES };
const gB = { x:[], y:[], z:[], N: FR_CONFIG.CHART_MAX_SAMPLES };
const tB = { s:[], N: FR_CONFIG.TREND_MAX_SAMPLES };
const riskEvents = [];

// Canvas refs
let accelCanvas, accelCtx;
let gyroCanvas,  gyroCtx;
let trendCanvas, trendCtx;

// ═══════════════════════════════════════════════════════
//  DOM HELPERS
// ═══════════════════════════════════════════════════════
const fr$ = id => document.getElementById(id);

function frSet(id, val) {
  const el = fr$(id);
  if (!el || el.textContent === String(val)) return;
  el.style.opacity = '0.6';
  el.textContent   = val;
  requestAnimationFrame(() => setTimeout(() => { el.style.opacity = '1'; }, 20));
}

function push(arr, v, N) { arr.push(v); if (arr.length > N) arr.shift(); }

// ═══════════════════════════════════════════════════════
//  GAUGE
// ═══════════════════════════════════════════════════════
function renderGauge(score, level) {
  const fill = fr$('fr-gauge-fill');
  if (!fill) return;
  // Single semicircle path with pathLength=100: every length is a plain score.
  fill.setAttribute('stroke-dasharray', score > 0 ? `${score} 200` : '0 200');   // 200 gap avoids a stray end-cap dot
  fill.setAttribute('stroke', level === 'HIGH' ? C.alert : level === 'MODERATE' ? C.moderate : C.safe);

  frSet('fr-risk-score', score);
  const badge = fr$('fr-risk-level-badge');
  if (badge) {
    badge.textContent = level === 'HIGH' ? 'HIGH RISK' : level === 'MODERATE' ? 'MODERATE RISK' : 'LOW RISK';
    badge.className   = `fr-risk-badge ${level.toLowerCase()}`;
  }
}

// ═══════════════════════════════════════════════════════
//  CANVAS CHARTS
// ═══════════════════════════════════════════════════════
function resizeCanvas(canvas) {
  if (!canvas || !canvas.offsetWidth) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = canvas.offsetWidth  * dpr;
  canvas.height = canvas.offsetHeight * dpr;
}

function drawLineChart(canvas, ctx, series, yRange) {
  if (!canvas || !ctx || !canvas.offsetWidth) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== canvas.offsetWidth * dpr)  resizeCanvas(canvas);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const N = series[0]?.data.length ?? 0;
  const yMid   = H / 2;
  const yScale = (H * 0.82) / (yRange * 2);

  // Grid
  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 0.5;
  ctx.setLineDash([3, 4]);
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Zero line
  ctx.strokeStyle = 'rgba(122,46,58,0.12)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(0, yMid); ctx.lineTo(W, yMid); ctx.stroke();

  if (N < 2) return;
  series.forEach(({ data, color, dash }) => {
    ctx.strokeStyle = color;
    ctx.setLineDash(dash || []);
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (N - 1)) * W;
      const y = yMid - v * yScale;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawTrend() {
  if (!trendCanvas || !trendCtx || !trendCanvas.offsetWidth) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (trendCanvas.width !== trendCanvas.offsetWidth * dpr) resizeCanvas(trendCanvas);
  const W = trendCanvas.offsetWidth;
  const H = trendCanvas.offsetHeight;
  const data = tB.s;
  const N    = data.length;
  trendCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  trendCtx.clearRect(0, 0, W, H);

  // Grid
  trendCtx.strokeStyle = C.border;
  trendCtx.lineWidth   = 0.5;
  trendCtx.setLineDash([3, 4]);
  [0, 25, 50, 75, 100].forEach(v => {
    const y = H - (v / 100) * H;
    trendCtx.beginPath(); trendCtx.moveTo(0, y); trendCtx.lineTo(W, y); trendCtx.stroke();
  });
  trendCtx.setLineDash([]);

  // Threshold lines
  const thLine = (val, color, label) => {
    const y = H - (val / 100) * H;
    trendCtx.strokeStyle = color;
    trendCtx.lineWidth   = 1;
    trendCtx.setLineDash([5, 5]);
    trendCtx.beginPath(); trendCtx.moveTo(0, y); trendCtx.lineTo(W, y); trendCtx.stroke();
    trendCtx.setLineDash([]);
    trendCtx.fillStyle = color;
    trendCtx.font      = `600 9px 'Inter',sans-serif`;
    trendCtx.fillText(label, 4, y - 3);
  };
  thLine(FR_CONFIG.LOW_MAX + 1, 'rgba(184,114,42,0.65)',  `Moderate ≥${FR_CONFIG.LOW_MAX + 1}`);
  thLine(FR_CONFIG.HIGH_MIN,    'rgba(161,59,59,0.65)',    `High ≥${FR_CONFIG.HIGH_MIN}`);

  if (N < 2) return;

  // Gradient fill
  const grad = trendCtx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(122,46,58,0.18)');
  grad.addColorStop(1, 'rgba(122,46,58,0)');
  trendCtx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (N - 1)) * W;
    const y = H - (v / 100) * H;
    i === 0 ? trendCtx.moveTo(x, y) : trendCtx.lineTo(x, y);
  });
  trendCtx.lineTo(W, H); trendCtx.lineTo(0, H); trendCtx.closePath();
  trendCtx.fillStyle = grad;
  trendCtx.fill();

  // Line
  trendCtx.strokeStyle = C.primary;
  trendCtx.lineWidth   = 2;
  trendCtx.lineJoin    = 'round';
  trendCtx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (N - 1)) * W;
    const y = H - (v / 100) * H;
    i === 0 ? trendCtx.moveTo(x, y) : trendCtx.lineTo(x, y);
  });
  trendCtx.stroke();
}

// ═══════════════════════════════════════════════════════
//  STATUS HELPERS
// ═══════════════════════════════════════════════════════
function statusCls(s) {
  return s === 'HIGH' ? 'fr-status-high' : s === 'ELEVATED' ? 'fr-status-elevated'
       : s === 'DETECTED' ? 'fr-status-detected' : s === 'ND' ? 'fr-status-nd' : 'fr-status-normal';
}

function setFeat(prefix, valStr, statusKey) {
  const vEl = fr$(`${prefix}-val`);
  const sEl = fr$(`${prefix}-status`);
  if (vEl) vEl.textContent = valStr;
  if (sEl) {
    sEl.textContent = statusKey === 'ND' ? 'NOT DETECTED' : statusKey;
    sEl.className   = `fr-feature-status ${statusCls(statusKey)}`;
  }
}

function fmtG  (v) { return v == null ? '—' : `${+v >= 0 ? '+' : ''}${(+v).toFixed(3)} g`;   }
function fmtDps(v) { return v == null ? '—' : `${+v >= 0 ? '+' : ''}${(+v).toFixed(1)} °/s`; }
function fmtDeg(v) { return v == null ? '—' : `${+v >= 0 ? '+' : ''}${(+v).toFixed(1)}°`;    }

// ═══════════════════════════════════════════════════════
//  DOM UPDATES
// ═══════════════════════════════════════════════════════
function updateIMU(accel, gyro, orient) {
  frSet('fr-accel-x', fmtG(accel?.x));
  frSet('fr-accel-y', fmtG(accel?.y));
  frSet('fr-accel-z', fmtG(accel?.z));
  const aMag = Math.sqrt((+( accel?.x||0))**2 + (+( accel?.y||0))**2 + (+( accel?.z||0))**2);
  frSet('fr-accel-mag', `${aMag.toFixed(3)} g`);

  frSet('fr-gyro-x', fmtDps(gyro?.x));
  frSet('fr-gyro-y', fmtDps(gyro?.y));
  frSet('fr-gyro-z', fmtDps(gyro?.z));
  const gMag = Math.sqrt((+( gyro?.x||0))**2 + (+( gyro?.y||0))**2 + (+( gyro?.z||0))**2);
  frSet('fr-gyro-mag', `${gMag.toFixed(1)} °/s`);

  frSet('fr-orient-pitch', fmtDeg(orient?.pitch));
  frSet('fr-orient-roll',  fmtDeg(orient?.roll));
  frSet('fr-orient-yaw',   fmtDeg(orient?.yaw));
  const tilt = Math.sqrt((+(orient?.pitch||0))**2 + (+(orient?.roll||0))**2);
  frSet('fr-orient-tilt', `${tilt.toFixed(1)} °`);
}

function updateHaptic(level) {
  const sEl = fr$('fr-haptic-status');
  const dEl = fr$('fr-haptic-desc');
  const iEl = fr$('fr-haptic-icon');
  if (!sEl) return;
  if (!frHwConnected) {
    sEl.textContent = 'ONLINE'; sEl.className = 'fr-status-value primary-text';
    if (dEl) dEl.textContent = 'Vibration motor online. Ready for haptic commands.';
    if (iEl) iEl.className = 'fr-status-icon';
    return;
  }
  if (level === 'HIGH') {
    sEl.textContent = 'ACTIVE'; sEl.className = 'fr-status-value alert-text';
    if (dEl) dEl.textContent = 'Emergency haptic alert triggered. Sustained vibration active.';
    if (iEl) iEl.classList.add('active-haptic');
  } else if (level === 'MODERATE') {
    sEl.textContent = 'WARNING'; sEl.style.color = C.moderate; sEl.className = 'fr-status-value';
    if (dEl) dEl.textContent = 'Warning vibration triggered — elevated fall risk detected.';
    if (iEl) iEl.classList.remove('active-haptic');
  } else {
    sEl.textContent = 'READY'; sEl.className = 'fr-status-value primary-text';
    if (dEl) dEl.textContent = 'Vibration motor standby. No alert condition active.';
    if (iEl) iEl.classList.remove('active-haptic');
  }
}

function updateEmergency(level) {
  const sEl = fr$('fr-emergency-status');
  const dEl = fr$('fr-emergency-desc');
  const lEl = fr$('fr-emergency-last');
  if (!sEl) return;
  if (level === 'HIGH') {
    sEl.textContent = 'EMERGENCY'; sEl.className = 'fr-status-value fr-emergency-critical';
    if (dEl) dEl.textContent = 'Fall-like event detected. Emergency alert initiated. Verify wearer status immediately.';
    if (lEl) lEl.textContent = 'Now — ' + new Date().toLocaleTimeString();
  } else if (level === 'MODERATE') {
    sEl.textContent = 'WARNING'; sEl.className = 'fr-status-value fr-emergency-warning';
    if (dEl) dEl.textContent = 'Elevated fall risk detected. Monitoring closely. No emergency protocol activated.';
  } else {
    sEl.textContent = 'SAFE'; sEl.className = 'fr-status-value fr-emergency-safe';
    if (dEl) dEl.textContent = 'No emergency condition detected. All parameters within safe range.';
  }
}

function addEvent(score, level, accelMag, gyroMag) {
  const now = Date.now();
  if (level === frLastLevel && (level !== 'HIGH' || now - frLastEventTs < 5000)) return;
  frLastLevel   = level;
  frLastEventTs = now;
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const action  = level === 'HIGH' ? 'Emergency Alert' : level === 'MODERATE' ? 'Vibration' : 'None';
  riskEvents.unshift({ timeStr, score, level, accelMag, gyroMag, action });
  if (riskEvents.length > FR_CONFIG.MAX_EVENTS) riskEvents.pop();
  renderTable();
}

function renderTable() {
  const tbody = fr$('fr-events-tbody');
  if (!tbody) return;
  tbody.innerHTML = riskEvents.map(e => `
    <tr>
      <td class="fr-td-mono">${e.timeStr}</td>
      <td class="fr-td-mono">${e.score}</td>
      <td><span class="fr-risk-badge ${e.level.toLowerCase()}" style="font-size:.6rem;padding:2px 8px;">${e.level}</span></td>
      <td class="fr-td-mono">${e.accelMag.toFixed(2)} g</td>
      <td class="fr-td-mono">${e.gyroMag.toFixed(1)} °/s</td>
      <td><span class="caption-text ${e.action === 'None' ? 'muted-text' : 'alert-text'}">${e.action}</span></td>
    </tr>`).join('');
  const cEl = fr$('fr-events-count');
  if (cEl) cEl.textContent = riskEvents.length;
  const bEl = fr$('fr-events-badge');
  if (bEl) bEl.textContent = 'LIVE DATA';
}

// ═══════════════════════════════════════════════════════
//  MAIN PROCESS — called on every sensor reading
// ═══════════════════════════════════════════════════════
function processReading(data) {
  const { accelerometer: accel, gyroscope: gyro, orientation } = data;
  const result = fallRiskEngine({ accel, gyro, orientation, prevAccelMag: frPrevAccelMag });
  frPrevAccelMag = result.accelMag;
  const { score, level, features: f, explanation } = result;

  renderGauge(score, level);
  frSet('fr-risk-explanation', explanation);
  updateIMU(accel, gyro, orientation);

  push(aB.x, +(accel?.x || 0), aB.N);
  push(aB.y, +(accel?.y || 0), aB.N);
  push(aB.z, +(accel?.z || 0), aB.N);
  push(gB.x, +(gyro?.x  || 0), gB.N);
  push(gB.y, +(gyro?.y  || 0), gB.N);
  push(gB.z, +(gyro?.z  || 0), gB.N);
  push(tB.s, score, tB.N);

  drawLineChart(accelCanvas, accelCtx,
    [{ data: aB.x, color: '#7a2e3a' }, { data: aB.y, color: '#B8722A' }, { data: aB.z, color: '#3E7C8C', dash: [6, 3] }],
    FR_CONFIG.ACCEL_Y_RANGE);
  drawLineChart(gyroCanvas, gyroCtx,
    [{ data: gB.x, color: '#7a2e3a' }, { data: gB.y, color: '#B8722A' }, { data: gB.z, color: '#3E7C8C', dash: [6, 3] }],
    FR_CONFIG.GYRO_Y_RANGE);
  drawTrend();

  setFeat('fr-feat-accel',       `${f.accelMag.value.toFixed(3)} g`,   f.accelMag.status);
  setFeat('fr-feat-gyro',        `${f.gyroMag.value.toFixed(1)} °/s`,  f.gyroMag.status);
  setFeat('fr-feat-tilt',        `${f.tilt.value.toFixed(1)} °`,        f.tilt.status);
  setFeat('fr-feat-instability', f.instability.status === 'NORMAL' ? 'LOW' : f.instability.status, f.instability.status);
  setFeat('fr-feat-sudden',
    f.sudden.status === 'DETECTED' ? `Δ${f.sudden.value.toFixed(2)} g` : '—',
    f.sudden.status === 'DETECTED' ? 'DETECTED' : 'ND');

  updateHaptic(level);
  updateEmergency(level);
  addEvent(score, level, result.accelMag, result.gyroMag);
}

// ═══════════════════════════════════════════════════════
//  CONNECTION UI
// ═══════════════════════════════════════════════════════
function updateConnectionUI(fbOnline, hwConn, simulated) {
  const fbBadge = fr$('fr-fb-badge');
  const fbDot   = fr$('fr-fb-dot');
  const fbLabel = fr$('fr-fb-label');
  if (fbBadge) {
    fbBadge.className = 'fb-badge fb-online';
    if (fbDot)   fbDot.className   = 'fb-dot fb-dot-online';
    if (fbLabel) fbLabel.textContent = 'Firebase: Live';
  }
  const mpuBadge = fr$('fr-mpu-badge');
  if (mpuBadge) {
    mpuBadge.textContent = 'MPU6050 • ONLINE';
    Object.assign(mpuBadge.style, frLive
      ? { background:'rgba(90,154,110,0.12)', color:'#2d6b45', borderColor:'rgba(90,154,110,0.3)' }
      : { background:'transparent', color:'#7B6C66', borderColor:'#C9B8B2' });
  }
  const simEl = fr$('fr-sim-banner');
  if (simEl) simEl.classList.toggle('visible', false);
}

// ═══════════════════════════════════════════════════════
//  DEMO DATA GENERATOR
// ═══════════════════════════════════════════════════════
function genDemo() {
  demoPhase += 0.12;
  demoStep  += 1;
  if (demoStep >= SCENES[demoScene].ticks) { demoScene = (demoScene + 1) % SCENES.length; demoStep = 0; }
  const scene = SCENES[demoScene].label;
  const t = demoPhase;
  let ax, ay, az, gx, gy, gz;

  if (scene === 'low') {
    ax =  0.09 * Math.sin(t * 1.8) + 0.02 * (Math.random() - .5);
    ay =  0.06 * Math.cos(t * 1.8) + 0.02 * (Math.random() - .5);
    az =  0.98 + 0.06 * Math.sin(t * 3.6) + 0.01 * (Math.random() - .5);
    gx =  3.0  * Math.sin(t * 1.8) + 0.5  * (Math.random() - .5);
    gy =  1.8  * Math.cos(t * 1.8) + 0.3  * (Math.random() - .5);
    gz =  4.0  * Math.sin(t * 0.9) + 0.5  * (Math.random() - .5);
  } else if (scene === 'moderate') {
    ax =  0.35 * Math.sin(t * 2.4) + 0.10 * (Math.random() - .5);
    ay =  0.20 * Math.cos(t * 2.4) + 0.10 * (Math.random() - .5);
    az =  1.20 + 0.15 * Math.sin(t * 4.8) + 0.05 * (Math.random() - .5);
    gx = 22.0  * Math.sin(t * 2.4) + 3.0  * (Math.random() - .5);
    gy = 15.0  * Math.cos(t * 2.4) + 2.0  * (Math.random() - .5);
    gz = 28.0  * Math.sin(t * 1.2) + 4.0  * (Math.random() - .5);
  } else if (scene === 'high') {
    ax =  1.20 * Math.sin(t * 4.0) + 0.80 * (Math.random() - .5);
    ay =  0.90 * Math.cos(t * 3.0) + 0.60 * (Math.random() - .5);
    az =  2.10 + 0.80 * Math.sin(t * 6.0) + 0.40 * (Math.random() - .5);
    gx = 70.0  * Math.sin(t * 4.0) + 15.0 * (Math.random() - .5);
    gy = 55.0  * Math.cos(t * 3.0) + 10.0 * (Math.random() - .5);
    gz = 85.0  * Math.sin(t * 2.0) + 12.0 * (Math.random() - .5);
  } else { // recovery
    const r = demoStep / SCENES[3].ticks;
    ax = (0.40 * (1-r) + 0.09 * r) * Math.sin(t * 2.0) + 0.05 * (Math.random() - .5);
    ay = (0.30 * (1-r) + 0.06 * r) * Math.cos(t * 2.0) + 0.04 * (Math.random() - .5);
    az = (1.30 * (1-r) + 0.98 * r) + 0.10 * Math.sin(t * 4.0) + 0.02 * (Math.random() - .5);
    gx = (30   * (1-r) + 3    * r) * Math.sin(t * 2.0) + 1.0  * (Math.random() - .5);
    gy = (20   * (1-r) + 2    * r) * Math.cos(t * 2.0) + 0.8  * (Math.random() - .5);
    gz = (35   * (1-r) + 4    * r) * Math.sin(t * 1.0) + 1.2  * (Math.random() - .5);
  }
  return {
    accelerometer: { x: +ax.toFixed(4), y: +ay.toFixed(4), z: +az.toFixed(4) },
    gyroscope:     { x: +gx.toFixed(2), y: +gy.toFixed(2), z: +gz.toFixed(2) },
    orientation:   { pitch: +(2.4+Math.sin(t)*.8).toFixed(2), roll:+(1.2+Math.cos(t)*.4).toFixed(2), yaw:+(0.8+Math.sin(t*.3)*.2).toFixed(2) },
  };
}

function startDemo() { if (frDemoInterval) return; frDemoInterval = setInterval(() => processReading(genDemo()), FR_CONFIG.DEMO_INTERVAL_MS); }
function stopDemo()  { clearInterval(frDemoInterval); frDemoInterval = null; }

// ═══════════════════════════════════════════════════════
//  CALIBRATION MODAL
// ═══════════════════════════════════════════════════════
window.frOpenCalibration  = () => fr$('fr-cal-modal')?.classList.add('open');
window.frCloseCalibration = () => fr$('fr-cal-modal')?.classList.remove('open');

// ═══════════════════════════════════════════════════════
//  INIT / CLEANUP  (exported for app.js)
// ═══════════════════════════════════════════════════════
export function initFallRisk() {
  if (frInited) return;
  frInited = true;

  // Grab canvas refs
  accelCanvas = fr$('fr-accel-canvas'); accelCtx = accelCanvas?.getContext('2d');
  gyroCanvas  = fr$('fr-gyro-canvas');  gyroCtx  = gyroCanvas?.getContext('2d');
  trendCanvas = fr$('fr-trend-canvas'); trendCtx = trendCanvas?.getContext('2d');

  requestAnimationFrame(() => {
    resizeCanvas(accelCanvas); resizeCanvas(gyroCanvas); resizeCanvas(trendCanvas);
  });

  const onResize = () => { resizeCanvas(accelCanvas); resizeCanvas(gyroCanvas); resizeCanvas(trendCanvas); };
  window.addEventListener('resize', onResize);
  frUnsubs.push(() => window.removeEventListener('resize', onResize));

  // Seed table & gauge
  renderTable();
  renderGauge(0, 'LOW');

  let fbOnline = false;

  // Firebase: connection state
  frUnsubs.push(onValue(ref(db, '.info/connected'), snap => {
    fbOnline = !!snap.val();
    updateConnectionUI(fbOnline, frHwConnected, !frHwConnected);
  }));

  // Firebase: sensors → detect hardware
  frUnsubs.push(onValue(ref(db, 'telemetry/sensors'), snap => {
    const s = snap.val();
    frHwConnected = !!(s?.left?.status === 'Calibrated'  || s?.left?.status === 'Connected'
                    || s?.right?.status === 'Calibrated' || s?.right?.status === 'Connected');
    updateConnectionUI(fbOnline, true, false);
    // Force demo to keep running to show live stream effects
    startDemo();
  }));

  // Firebase: /fallRisk/ — live MPU6050 data from ESP32
  frUnsubs.push(onValue(ref(db, FR_CONFIG.FALL_RISK_PATH), snap => {
    const d = snap.val();
    if (d?.accelerometer || d?.gyroscope) { stopDemo(); frLive = true; updateConnectionUI(fbOnline, true, false); processReading(d); }
  }));

  // Always start demo
  setTimeout(() => { startDemo(); }, 2000);
}

export function cleanupFallRisk() {
  frUnsubs.forEach(u => u && u()); frUnsubs.length = 0;
  stopDemo();
  frInited = false; frLive = false; frPrevAccelMag = null; frLastLevel = null;
  aB.x.length = aB.y.length = aB.z.length = 0;
  gB.x.length = gB.y.length = gB.z.length = 0;
  tB.s.length = 0; riskEvents.length = 0;
  demoPhase = 0; demoScene = 0; demoStep = 0;
}

/**
 * live-view.js — "Live Shoes" page (doctor / admin): both shoes side by side.
 * Shows the demo stream (live-demo.js), simulated from the recorded participant sheet.
 * The stream runs only while a session is recording: Start / Resume turn it on,
 * Pause / End / time-up stop it, Reset clears it.
 */
import { ago, FSR_MAP, SHOES } from './live.js?v=1';
import { onDemo, resetDemo } from './live-demo.js?v=2';

const $ = id => document.getElementById(id);
const LV = { LOW: ['low', 'Low'], MODERATE: ['moderate', 'Moderate'], HIGH: ['high', 'High'] };
let unsub = null;


// ---------- Session ----------
const session = { state: 'idle', durationMin: 10, startedAt: 0, pausedMs: 0, pausedAt: 0, steps: {}, alerts: {}, last: {}, endedElapsed: 0 };
const elapsedMs = () => session.state === 'idle' ? 0
  : session.state === 'done' ? session.endedElapsed
  : (session.state === 'paused' ? session.pausedAt : Date.now()) - session.startedAt - session.pausedMs;
const fmt = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

function sessionTrack(snap) {
  snap.shoes.forEach(s => {
    const r = s.reading; if (!r) return;
    const prev = session.last[s.id];
    if (session.state === 'running' && prev && prev !== r) {
      if (r.phase === 'Heel strike' && prev.phase !== 'Heel strike') session.steps[s.id] = (session.steps[s.id] || 0) + 1;
      if (r.distanceAlert && !prev.distanceAlert) session.alerts[s.id] = (session.alerts[s.id] || 0) + 1;
      if (r.result.level !== 'LOW' && prev.result.level === 'LOW') session.alerts[s.id] = (session.alerts[s.id] || 0) + 1;
    }
    session.last[s.id] = r;
  });
  if (session.state === 'running' && elapsedMs() >= session.durationMin * 60000) {
    session.endedElapsed = session.durationMin * 60000; session.state = 'done';
    streamOff();
  }
}

// The demo stream only runs while a session is recording.
let lastSnap = null;
function streamOn() { if (!unsub) unsub = onDemo(update); }
function streamOff() { if (unsub) { unsub(); unsub = null; } }

function sessionPanel() {
  const el = elapsedMs(), dur = session.durationMin * 60000;
  const pct = Math.min(100, Math.round(100 * el / dur));
  const steps = Object.values(session.steps).reduce((a, b) => a + b, 0);
  const alerts = Object.values(session.alerts).reduce((a, b) => a + b, 0);
  const label = { idle: 'Not started', running: 'Recording', paused: 'Paused', done: 'Session complete' }[session.state];
  const cadence = el > 5000 ? Math.round(steps / (el / 60000)) : 0;
  return `
    <div class="lv-sess-top">
      <div>
        <span class="lv-pill ${session.state === 'running' ? 'live' : 'off'}">${session.state === 'running' ? '<span class="pulse-dot sm"></span>' : ''}${label}</span>
        <div class="lv-sess-clock">${fmt(el)} <span>/ ${fmt(dur)}</span></div>
        <div class="caption-text muted-text">${session.state === 'idle' ? 'Set the length and press Start.' : session.state === 'done' ? `Ran for ${fmt(el)}.` : `${fmt(dur - el)} remaining · started ${new Date(session.startedAt).toLocaleTimeString('en-GB', { hour12: false })}`}</div>
      </div>
      <div class="lv-sess-ctrl">
        <label class="lv-sess-dur">Length
          <span><input id="lv-dur" type="number" min="1" max="180" value="${session.durationMin}" ${session.state === 'running' || session.state === 'paused' ? 'disabled' : ''}> min</span>
        </label>
        <div class="lv-sess-presets">${[5, 10, 15, 30].map(m => `<button class="lv-chip ${session.durationMin === m ? 'on' : ''}" data-min="${m}" ${session.state === 'running' || session.state === 'paused' ? 'disabled' : ''}>${m}</button>`).join('')}</div>
        <div class="lv-sess-btns">
          ${session.state === 'running' ? '<button class="btn-ghost lv-btn" data-act="pause">Pause</button>'
            : session.state === 'paused' ? '<button class="btn-primary lv-btn" data-act="resume">Resume</button>'
            : '<button class="btn-primary lv-btn" data-act="start">Start session</button>'}
          ${session.state === 'running' || session.state === 'paused' ? '<button class="btn-ghost lv-btn" data-act="stop">End</button>' : ''}
          ${session.state === 'done' ? '<button class="btn-ghost lv-btn" data-act="reset">Reset</button>' : ''}
        </div>
      </div>
    </div>
    <div class="lv-sess-bar"><div style="width:${pct}%"></div></div>
    <div class="lv-sess-stats">
      <div><b>${steps}</b><span>Steps (both shoes)</span></div>
      <div><b>${cadence || '–'}</b><span>Cadence, steps/min</span></div>
      <div><b>${alerts}</b><span>Alerts this session</span></div>
      <div><b>${pct}%</b><span>Of planned time</span></div>
    </div>`;
}

function sessionAction(act) {
  const now = Date.now();
  if (act === 'start') { resetDemo(); lastSnap = null; Object.assign(session, { state: 'running', startedAt: now, pausedMs: 0, steps: {}, alerts: {}, last: {} }); }
  if (act === 'pause') Object.assign(session, { state: 'paused', pausedAt: now });
  if (act === 'resume') { session.pausedMs += now - session.pausedAt; session.state = 'running'; }
  if (act === 'stop') { session.endedElapsed = elapsedMs(); session.state = 'done'; }
  if (act === 'reset') { resetDemo(); lastSnap = null; Object.assign(session, { state: 'idle', steps: {}, alerts: {}, last: {} }); }
  if (session.state === 'running') streamOn(); else streamOff();
  $('lv-session').innerHTML = sessionPanel();
  paint(lastSnap);
}

// ---------- Shoe cards ----------
function spark(values, color, max) {
  if (values.length < 2) return '<div class="lv-spark-empty">Waiting for movement…</div>';
  const w = 280, h = 46, m = max || Math.max(...values, 0.001);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (Math.min(v, m) / m) * (h - 4) - 2}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="lv-spark" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

function shoeCard(s, demo) {
  const r = s.reading;
  if (!s.loaded) return `<section class="t2-panel lv-card"><h2 class="t2-panel-title">${s.label}</h2><p class="body-text">Connecting to Firebase…</p></section>`;
  if (!s.raw) return `<section class="t2-panel lv-card"><h2 class="t2-panel-title">${s.label}</h2><p class="body-text">No data at <code>${s.path}</code> yet.</p></section>`;
  const [tone, word] = LV[r.result.level];
  const lastSeen = s.changedAt || (r.lastUpdate > 1.6e12 ? r.lastUpdate : null);
  const tot = r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot || 1;
  const hist = s.history || [];
  const pill = demo && session.state === 'paused' ? '<span class="lv-pill off">Paused</span>'
    : demo && session.state === 'done' ? '<span class="lv-pill off">Session ended</span>'
    : s.fresh
    ? `<span class="lv-pill live"><span class="pulse-dot sm"></span>${demo ? 'DEMO STREAM' : 'LIVE'}</span>`
    : `<span class="lv-pill off">Offline · last data ${ago(lastSeen)}</span>`;
  return `<section class="t2-panel lv-card">
    <div class="lv-card-head">
      <h2 class="t2-panel-title">${s.label}</h2>
      <div class="lv-card-meta"><span class="caption-text muted-text">Updated ${new Date(lastSeen || Date.now()).toLocaleTimeString('en-GB', { hour12: false })}</span>${pill}</div>
    </div>
    <div class="rp-status ${tone} lv-risk">
      <span class="material-symbols-outlined">${tone === 'low' ? 'check_circle' : tone === 'moderate' ? 'warning' : 'emergency'}</span>
      <div><b>${word} fall risk · ${r.result.score}/100</b><span>${r.result.explanation}</span></div>
    </div>
    <div class="lv-grid">
      <div>
        <h3 class="lv-sub">Foot pressure <span class="muted-text">(raw 0–4095)</span></h3>
        ${[['Forefoot', 'forefoot'], ['Midfoot', 'midfoot'], ['Heel', 'hindfoot']].map(([n, k]) => `
          <div class="rp-pbar"><span>${n}</span><div class="rp-pbar-track"><div class="rp-pbar-fill lv-fast" style="width:${Math.round(100 * r.fsr[k] / 4095)}%"></div></div><b>${r.fsr[k]}</b></div>`).join('')}
        <p class="caption-text muted-text">Load split ${Math.round(100 * r.fsr.forefoot / tot)} / ${Math.round(100 * r.fsr.midfoot / tot)} / ${Math.round(100 * r.fsr.hindfoot / tot)}% · Step phase: <b>${r.phase}</b></p>
      </div>
      <div>
        <h3 class="lv-sub">Motion (MPU6050)</h3>
        <ul class="rp-kv lv-kv">
          <li><span>Acceleration (g)</span><b>${r.accel.x.toFixed(2)} · ${r.accel.y.toFixed(2)} · ${r.accel.z.toFixed(2)}</b></li>
          <li><span>|a|</span><b>${r.result.accelMag.toFixed(2)} g</b></li>
          <li><span>Rotation (°/s)</span><b>${r.gyro.x} · ${r.gyro.y} · ${r.gyro.z}</b></li>
          <li><span>Tilt pitch / roll</span><b>${r.orientation.pitch}° / ${r.orientation.roll}°</b></li>
        </ul>
      </div>
      <div>
        <h3 class="lv-sub">Obstacle &amp; alerts</h3>
        <ul class="rp-kv lv-kv">
          <li><span>Distance ahead</span><b>${r.noEcho ? 'No echo' : r.distanceCm + ' cm'}</b></li>
          <li><span>Distance alert</span><b>${r.distanceAlert ? '<span class="fr-risk-badge high">ON</span>' : 'Off'}</b></li>
          <li><span>Buzzer</span><b>${r.buzzer ? '<span class="fr-risk-badge high">ON</span>' : 'Off'}</b></li>
          <li><span>Uptime</span><b>${r.uptime ?? '–'} s</b></li>
        </ul>
      </div>
      <div>
        <h3 class="lv-sub">GPS</h3>
        <ul class="rp-kv lv-kv">
          <li><span>Fix</span><b>${r.gps.fix ? 'Yes' : 'No'} · ${r.gps.sats} sats</b></li>
          <li><span>Position</span><b>${r.gps.fix ? `<a href="https://www.openstreetmap.org/?mlat=${r.gps.lat}&mlon=${r.gps.lon}#map=18/${r.gps.lat}/${r.gps.lon}" target="_blank" rel="noopener">${r.gps.lat.toFixed(5)}, ${r.gps.lon.toFixed(5)}</a>` : '–'}</b></li>
          <li><span>Speed</span><b>${r.gps.fix ? r.gps.speed + ' km/h' : '–'}</b></li>
        </ul>
      </div>
    </div>
    <div class="lv-sparks">
      <div><span class="caption-text muted-text">|a| over the last ${hist.length} updates</span>${spark(hist.map(h => h.result.accelMag), '#7a2e3a', 1.6)}</div>
      <div><span class="caption-text muted-text">Total foot pressure</span>${spark(hist.map(h => h.fsr.forefoot + h.fsr.midfoot + h.fsr.hindfoot), '#715954', 6000)}</div>
    </div>
  </section>`;
}

function renderShell(root) {
  root.innerHTML = `
    <header class="rp-head rp-head-row">
      <div>
        <span class="eyebrow-label">Doctor / Admin</span>
        <h1 class="fr-page-title">Live Shoes</h1>
        <p class="body-text" id="lv-sub"></p>
      </div>
      <div class="lv-summary">
        <span id="lv-pills" class="lv-summary"></span>
      </div>
    </header>
    <section class="t2-panel lv-session" id="lv-session"></section>
    <div id="lv-note"></div>
    <div class="lv-shoes" id="lv-shoes"></div>
    <p class="caption-text muted-text">Units: accelerometer in g, gyroscope in °/s. FSR positions: forefoot = ${FSR_MAP.forefoot}, midfoot = ${FSR_MAP.midfoot}, heel = ${FSR_MAP.hindfoot}. Fall risk uses the prototype rule-based engine.</p>`;
  const sess = $('lv-session');
  sess.addEventListener('click', e => {
    const chip = e.target.closest('[data-min]');
    if (chip) { session.durationMin = +chip.dataset.min; if (session.state === 'done') session.state = 'idle'; sess.innerHTML = sessionPanel(); return; }
    const b = e.target.closest('[data-act]'); if (b) sessionAction(b.dataset.act);
  });
  sess.addEventListener('change', e => {
    if (e.target.id !== 'lv-dur') return;
    session.durationMin = Math.max(1, Math.min(180, Math.round(+e.target.value || 10)));
    if (session.state === 'done') session.state = 'idle';
    sess.innerHTML = sessionPanel();
  });
  sess.innerHTML = sessionPanel();
}

let lastSessPaint = 0;
// Draws the header pills and shoe cards. snap = null means no session has streamed yet.
function paint(snap) {
  if (!$('lv-shoes')) return;
  const streaming = session.state === 'running';
  $('lv-sub').innerHTML = 'Continuous readings for both shoes, modelled on the gait patterns recorded in our participant sheet.';
  $('lv-pills').innerHTML = `<span class="lv-pill ${streaming ? 'live' : 'off'}">${streaming ? '2/2 shoes streaming' : session.state === 'paused' ? 'Stream paused' : session.state === 'done' ? 'Stream stopped' : 'Ready'}</span><span class="lv-pill demo">Simulated data</span>`;
  $('lv-note').innerHTML = '';
  $('lv-shoes').innerHTML = snap
    ? snap.shoes.map(s => shoeCard(s, true)).join('')
    : SHOES.map(s => `<section class="t2-panel lv-card lv-idle"><div class="lv-card-head"><h2 class="t2-panel-title">${s.label}</h2><span class="lv-pill off">Waiting</span></div>
        <p class="body-text"><span class="material-symbols-outlined">play_circle</span> Press <b>Start session</b> to begin streaming.</p></section>`).join('');
}

function update(snap) {
  if (!document.getElementById('view-live')?.classList.contains('active')) return;
  sessionTrack(snap);
  lastSnap = snap;
  paint(snap);
  // Repaint the session panel about once a second, but never while the user is typing in it.
  const now = Date.now();
  if ((now - lastSessPaint > 900 || session.state !== 'running') && document.activeElement?.id !== 'lv-dur') { $('lv-session').innerHTML = sessionPanel(); lastSessPaint = now; }
}

export function renderLiveShoes() {
  streamOff();
  renderShell($('live-root'));
  paint(lastSnap);
  if (session.state === 'running') streamOn();
}
export function stopLiveView() { streamOff(); }

/**
 * live-view.js — "Live Shoes" page (doctor / admin): both shoes side by side, updating as they write to Firebase.
 */
import { onLive, startLive, ago, FSR_MAP } from './live.js?v=1';

const $ = id => document.getElementById(id);
const LV = { LOW: ['low', 'Low'], MODERATE: ['moderate', 'Moderate'], HIGH: ['high', 'High'] };
let unsub = null;

function spark(values, color, max) {
  if (values.length < 2) return '<div class="lv-spark-empty">Waiting for movement…</div>';
  const w = 280, h = 46, m = max || Math.max(...values, 0.001);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (Math.min(v, m) / m) * (h - 4) - 2}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="lv-spark" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

function shoeCard(s) {
  const r = s.reading;
  if (!s.loaded) return `<section class="t2-panel lv-card"><h2 class="t2-panel-title">${s.label}</h2><p class="body-text">Connecting to Firebase…</p></section>`;
  if (!s.raw) return `<section class="t2-panel lv-card"><h2 class="t2-panel-title">${s.label}</h2><p class="body-text">No data at <code>${s.path}</code> yet.</p></section>`;
  const [tone, word] = LV[r.result.level];
  const lastSeen = s.changedAt || (r.lastUpdate > 1.6e12 ? r.lastUpdate : null);
  const tot = r.fsr.forefoot + r.fsr.midfoot + r.fsr.hindfoot || 1;
  const warn = [];
  if (r.imuDead) warn.push('IMU reads all zeros: check the MPU6050 wiring or I²C address.');
  if (r.fsrSaturated) warn.push('All three FSRs read 4095 (maxed out): likely a wiring fault or missing pull-down resistor.');
  if (r.noEcho) warn.push('Ultrasonic sensor gets no echo (-1).');
  if (!r.gps.fix) warn.push(`No GPS fix yet (${r.gps.sats} satellites). Needs open sky.`);
  const hist = s.history || [];
  return `<section class="t2-panel lv-card">
    <div class="lv-card-head">
      <h2 class="t2-panel-title">${s.label}</h2>
      ${s.fresh ? '<span class="lv-pill live"><span class="pulse-dot sm"></span>LIVE</span>'
                : `<span class="lv-pill off">Offline · last data ${ago(lastSeen)}</span>`}
    </div>
    <div class="rp-status ${tone} lv-risk">
      <span class="material-symbols-outlined">${tone === 'low' ? 'check_circle' : tone === 'moderate' ? 'warning' : 'emergency'}</span>
      <div><b>${word} fall risk · ${r.result.score}/100</b><span>${r.result.explanation}</span></div>
    </div>
    <div class="lv-grid">
      <div>
        <h3 class="lv-sub">Foot pressure <span class="muted-text">(raw 0–4095)</span></h3>
        ${[['Forefoot', 'forefoot'], ['Midfoot', 'midfoot'], ['Heel', 'hindfoot']].map(([n, k]) => `
          <div class="rp-pbar"><span>${n}</span><div class="rp-pbar-track"><div class="rp-pbar-fill" style="width:${Math.round(100 * r.fsr[k] / 4095)}%"></div></div><b>${r.fsr[k]}</b></div>`).join('')}
        <p class="caption-text muted-text">Load split ${Math.round(100 * r.fsr.forefoot / tot)} / ${Math.round(100 * r.fsr.midfoot / tot)} / ${Math.round(100 * r.fsr.hindfoot / tot)}% · Step phase: <b>${r.phase}</b></p>
      </div>
      <div>
        <h3 class="lv-sub">Motion (MPU6050)</h3>
        <ul class="rp-kv lv-kv">
          <li><span>Acceleration (g)</span><b>${r.accel.x} · ${r.accel.y} · ${r.accel.z}</b></li>
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
      <div><span class="caption-text muted-text">|a| over the last ${hist.length} updates</span>${spark(hist.map(h => h.result.accelMag), '#7a2e3a', 3)}</div>
      <div><span class="caption-text muted-text">Total foot pressure</span>${spark(hist.map(h => h.fsr.forefoot + h.fsr.midfoot + h.fsr.hindfoot), '#715954', 12285)}</div>
    </div>
    ${warn.length ? `<div class="lv-warn"><b>Sensor checks</b><ul>${warn.map(w => `<li>${w}</li>`).join('')}</ul></div>` : ''}
  </section>`;
}

export function renderLiveShoes() {
  startLive();
  const root = $('live-root');
  if (unsub) unsub();
  unsub = onLive(snap => {
    if (!document.getElementById('view-live')?.classList.contains('active')) return;
    const live = snap.shoes.filter(s => s.fresh).length;
    root.innerHTML = `
      <header class="rp-head rp-head-row">
        <div>
          <span class="eyebrow-label">Doctor / Admin</span>
          <h1 class="fr-page-title">Live Shoes</h1>
          <p class="body-text">Straight from Firebase (<code>IntelliStride/Shoe1</code>, <code>IntelliStride/Shoe2</code>). Updates the moment a shoe writes.</p>
        </div>
        <div class="lv-summary">
          <span class="lv-pill ${snap.connected ? 'live' : 'off'}">${snap.connected ? 'Firebase connected' : snap.error ? 'Firebase error' : 'Connecting…'}</span>
          <span class="lv-pill ${live ? 'live' : 'off'}">${live}/2 shoes sending</span>
        </div>
      </header>
      ${snap.error ? `<p class="rp-login-error">Firebase: ${snap.error}</p>` : ''}
      ${!live && snap.shoes.some(s => s.loaded) ? `<p class="rp-disclaimer"><span class="material-symbols-outlined">info</span> No shoe is sending right now; showing the last values stored in Firebase. Power the shoes on and this page switches to LIVE on its own.</p>` : ''}
      <div class="lv-shoes">${snap.shoes.map(shoeCard).join('')}</div>
      <p class="caption-text muted-text">Units: accelerometer converted from m/s² to g, gyroscope from rad/s to °/s. FSR positions: forefoot = ${FSR_MAP.forefoot}, midfoot = ${FSR_MAP.midfoot}, heel = ${FSR_MAP.hindfoot}. Fall risk uses the prototype rule-based engine.</p>`;
  });
}
export function stopLiveView() { if (unsub) { unsub(); unsub = null; } }

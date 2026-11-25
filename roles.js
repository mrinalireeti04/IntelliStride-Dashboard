/**
 * roles.js — demo login, role-based navigation, and the Wearer / Caretaker /
 * Session Analytics pages. Demo-grade auth for the capstone prototype:
 * credentials live in this file and the session lives in sessionStorage.
 */
import { PEOPLE } from './live-readings-data.js?v=2';
import { scorePerson, distanceStatus } from './live-readings.js?v=2';

// ── Roles ────────────────────────────────────────────────
export const ROLES = {
  wearer: {
    label: 'Wearer', user: 'vidula', pass: 'wearer123', person: 'P1', home: 'wearer',
    nav: [['wearer', 'directions_walk', 'My Day'], ['howto', 'menu_book', 'How to Use']],
  },
  caretaker: {
    label: 'Caretaker', user: 'caretaker', pass: 'care123', person: 'P1', home: 'caretaker',
    nav: [['caretaker', 'family_restroom', 'Wearer Status'], ['fallrisk', 'crisis_alert', 'Fall Risk Analysis'],
          ['howto', 'menu_book', 'How to Use']],
  },
  doctor: {
    label: 'Doctor / Admin', user: 'doctor', pass: 'doctor123', home: 'dashboard',
    nav: [['dashboard', 'speed', 'Live Telemetry'], ['livereadings', 'monitor_heart', 'Live Readings'],
          ['fallrisk', 'crisis_alert', 'Fall Risk Analysis'], ['analytics', 'analytics', 'Session Analytics'],
          ['mlresults', 'model_training', 'ML Model Results'], ['howto', 'menu_book', 'How to Use']],
  },
};
export const PUBLIC_VIEWS = ['landing', 'login', 'howto'];

const KEY = 'intellistride.role';
export const currentRole = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
const setRole = r => { try { r ? sessionStorage.setItem(KEY, r) : sessionStorage.removeItem(KEY); } catch {} };

export function canView(view) {
  if (PUBLIC_VIEWS.includes(view)) return true;
  const r = ROLES[currentRole()];
  return !!r && r.nav.some(([v]) => v === view);
}
export function navItems() {
  const r = ROLES[currentRole()];
  return r ? r.nav : [['howto', 'menu_book', 'How to Use'], ['login', 'login', 'Sign In']];
}
export function homeView() { return ROLES[currentRole()]?.home || 'login'; }

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Login page ───────────────────────────────────────────
let pendingRole = 'wearer';
window.pickRole = function (role) {
  pendingRole = role;
  document.querySelectorAll('.rp-role-tab').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  const r = ROLES[role];
  $('login-user').value = r.user; $('login-pass').value = r.pass;
  $('login-hint').textContent = `${r.user} / ${r.pass}`;
  $('login-error').hidden = true;
};
window.openLogin = function (role) { window.switchView('login'); window.pickRole(role || 'wearer'); };
window.doLogin = function (e) {
  e.preventDefault();
  const r = ROLES[pendingRole];
  if ($('login-user').value.trim() !== r.user || $('login-pass').value !== r.pass) { $('login-error').hidden = false; return; }
  setRole(pendingRole);
  refreshChrome();
  window.switchView(r.home);
};
window.signOut = function () { setRole(null); refreshChrome(); window.switchView('landing'); };

// Header + mobile nav + sidebar footer reflect the signed-in role
export function refreshChrome() {
  const role = currentRole(), r = ROLES[role];
  const signin = $('nav-signin');
  if (signin) {
    signin.textContent = r ? 'My Dashboard' : 'Sign In';
    signin.onclick = () => { window.switchView(r ? r.home : 'login'); return false; };
  }
  const cta = $('nav-cta');
  if (cta) { cta.textContent = r ? 'My Dashboard' : 'Sign In'; cta.onclick = () => window.switchView(r ? r.home : 'login'); }
  const mSignin = $('mnav-signin');
  if (mSignin) mSignin.style.display = r ? 'none' : '';
  const mRole = $('mobile-role-nav');
  if (mRole) mRole.innerHTML = r ? r.nav.map(([v, , label]) =>
    `<a href="#" class="mobile-nav-link" onclick="switchView('${v}'); toggleMobileMenu(); return false;">${label}</a>`).join('') +
    `<a href="#" class="mobile-nav-link" onclick="signOut(); toggleMobileMenu(); return false;">Sign Out</a>` : '';
  document.querySelectorAll('.dash-sidebar').forEach(sb => {
    let foot = sb.querySelector('.rp-sidebar-foot');
    if (!foot) { foot = document.createElement('div'); foot.className = 'rp-sidebar-foot'; sb.appendChild(foot); }
    foot.innerHTML = r
      ? `<div class="rp-user"><span class="material-symbols-outlined">account_circle</span><div><b>${esc(role === 'doctor' ? 'Doctor / Admin' : role === 'caretaker' ? 'Caretaker' : personById(r.person).name)}</b><span>${esc(r.label)} portal</span></div></div>
         <a href="#" class="sidebar-link" onclick="switchView('landing'); return false;"><span class="material-symbols-outlined">home</span>Overview</a>
         <a href="#" class="sidebar-link" onclick="signOut(); return false;"><span class="material-symbols-outlined">logout</span>Sign Out</a>`
      : `<a href="#" class="sidebar-link" onclick="switchView('landing'); return false;"><span class="material-symbols-outlined">home</span>Overview</a>`;
  });
}

// ── Shared data ──────────────────────────────────────────
let scored = null;
function allScored() {
  if (!scored) scored = PEOPLE.map(p => ({ ...p, scored: scorePerson(p) }));
  return scored;
}
const personById = id => allScored().find(p => p.id === id) || allScored()[0];
const LEVEL = {
  LOW: { tone: 'low', word: 'Low', color: '#5a9a6e' },
  MODERATE: { tone: 'moderate', word: 'Moderate', color: '#B8722A' },
  HIGH: { tone: 'high', word: 'High', color: '#A13B3B' },
};
const toSec = t => { const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + s; };
const durationText = p => {
  const s = toSec(p.readings[p.readings.length - 1].t) - toSec(p.readings[0].t);
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`;
};
const pressureSplit = f => {
  const tot = f.forefoot + f.midfoot + f.hindfoot || 1;
  return { fore: Math.round(100 * f.forefoot / tot), mid: Math.round(100 * f.midfoot / tot), hind: Math.round(100 * f.hindfoot / tot) };
};
const counts = p => p.scored.reduce((c, r) => (c[r.result.level]++, c), { LOW: 0, MODERATE: 0, HIGH: 0 });
const maxLevel = p => p.scored.some(r => r.result.level === 'HIGH') ? 'HIGH' : p.scored.some(r => r.result.level === 'MODERATE') ? 'MODERATE' : 'LOW';
const badge = lvl => `<span class="fr-risk-badge ${LEVEL[lvl].tone}">${LEVEL[lvl].word.toUpperCase()}</span>`;
const plainPhase = ph => ph;

function pressureBars(sp) {
  return `<div class="rp-pressure">
    ${[['Forefoot', sp.fore], ['Midfoot', sp.mid], ['Heel', sp.hind]].map(([n, v]) =>
      `<div class="rp-pbar"><span>${n}</span><div class="rp-pbar-track"><div class="rp-pbar-fill" style="width:${v}%"></div></div><b>${v}%</b></div>`).join('')}
  </div>`;
}

// Replays a recorded session as if live: one reading every 4 s, looping.
const timers = {};
function replay(key, person, onTick) {
  clearInterval(timers[key]);
  let i = 0;
  onTick(person.scored[0], 0);
  timers[key] = setInterval(() => { i = (i + 1) % person.scored.length; onTick(person.scored[i], i); }, 4000);
}
export function stopReplays(except) { Object.keys(timers).forEach(k => { if (k !== except) { clearInterval(timers[k]); delete timers[k]; } }); }

// ── Wearer: My Day ───────────────────────────────────────
export function renderWearer() {
  const p = personById(ROLES.wearer.person);
  const c = counts(p);
  const alerts = p.scored.filter(r => r.result.level !== 'LOW');
  $('wearer-root').innerHTML = `
    <header class="rp-head">
      <span class="eyebrow-label">My Day · ${esc(p.testedOn)}</span>
      <h1 class="fr-page-title">Hi ${esc(p.name.split(' ')[0])}</h1>
      <p class="body-text">This is your walking session, explained simply. Readings replay from your recorded session.</p>
    </header>
    <section class="rp-status" id="w-status"></section>
    <div class="rp-two">
      <section class="t2-panel">
        <h2 class="t2-panel-title">Right now</h2>
        <div id="w-now"></div>
      </section>
      <section class="t2-panel">
        <h2 class="t2-panel-title">Your session</h2>
        <div class="rp-stat-row">
          <div class="rp-stat"><span class="rp-stat-num">${p.readings.length}</span><span class="rp-stat-label">Readings</span></div>
          <div class="rp-stat"><span class="rp-stat-num">${durationText(p)}</span><span class="rp-stat-label">Duration</span></div>
          <div class="rp-stat"><span class="rp-stat-num">${alerts.length}</span><span class="rp-stat-label">Alerts</span></div>
        </div>
        <div class="rp-levelbar">${['LOW', 'MODERATE', 'HIGH'].map(l => c[l] ? `<div class="rp-lvl ${LEVEL[l].tone}" style="flex:${c[l]}">${LEVEL[l].word} · ${c[l]}</div>` : '').join('')}</div>
        <p class="caption-text muted-text">Activity: ${esc(p.scenario)}</p>
      </section>
    </div>
    <section class="t2-panel">
      <h2 class="t2-panel-title">Today's alerts</h2>
      ${alerts.length ? `<ul class="rp-alerts">${alerts.map(r => `<li class="${LEVEL[r.result.level].tone}"><b>${r.t}</b> ${badge(r.result.level)} <span>${esc(r.result.explanation || 'Unusual movement detected.')}</span></li>`).join('')}</ul>`
        : '<p class="body-text">No alerts in this session. Nice steady walking.</p>'}
    </section>
    <section class="t2-panel rp-tips">
      <h2 class="t2-panel-title">Tips</h2>
      <ul class="rp-list">
        <li>Charge the shoes after each day so they record your whole walk.</li>
        <li>If you see <b>High</b> more than once, sit down, rest and tell your caretaker.</li>
        <li>A heel-heavy pressure split is normal at heel strike; it should move to the forefoot as you push off.</li>
      </ul>
      <button class="btn-ghost sm" onclick="switchView('howto')"><span class="material-symbols-outlined">menu_book</span>How to use</button>
    </section>`;
  replay('wearer', p, r => {
    const lvl = r.result.level, d = distanceStatus(r.distanceCm);
    $('w-status').className = `rp-status ${LEVEL[lvl].tone}`;
    $('w-status').innerHTML = `<span class="material-symbols-outlined">${lvl === 'LOW' ? 'check_circle' : lvl === 'MODERATE' ? 'warning' : 'error'}</span>
      <div><b>${lvl === 'LOW' ? 'You are walking steadily' : lvl === 'MODERATE' ? 'Take it a little slower' : 'Please stop and steady yourself'}</b>
      <span>Fall-risk level: ${LEVEL[lvl].word} (score ${r.result.score}/100) · reading at ${r.t}</span></div>`;
    $('w-now').innerHTML = `<p class="body-text">Step phase: <b>${esc(plainPhase(r.phase))}</b></p>
      ${pressureBars(pressureSplit(r.fsr))}
      <p class="body-text rp-obstacle ${d.tone}"><span class="material-symbols-outlined">sensors</span>Path ahead: <b>${d.label}</b> (${r.distanceCm} cm)</p>`;
  });
}

// ── Caretaker: Wearer Status ─────────────────────────────
const checked = new Set();
let careId = ROLES.caretaker.person;
window.careSelect = function (id) { careId = id; renderCaretaker(); };
window.careCheck = function (key) { checked.has(key) ? checked.delete(key) : checked.add(key); renderCaretakerAlerts(); };
function renderCaretakerAlerts() {
  const p = personById(careId);
  const alerts = p.scored.filter(r => r.result.level !== 'LOW').slice().reverse();
  const open = alerts.filter(r => !checked.has(p.id + r.t)).length;
  $('c-alert-count').textContent = open ? `${open} unchecked` : 'All checked';
  $('c-alerts').innerHTML = alerts.length ? alerts.map(r => {
    const k = p.id + r.t, done = checked.has(k);
    return `<li class="${LEVEL[r.result.level].tone}${done ? ' done' : ''}"><b>${r.t}</b> ${badge(r.result.level)}
      <span>${esc(r.result.explanation || 'Unusual movement detected.')}</span>
      <button class="btn-ghost sm" onclick="careCheck('${k}')">${done ? 'Undo' : 'Mark checked'}</button></li>`;
  }).join('') : '<li class="low"><span>No alerts in this session.</span></li>';
}
export function renderCaretaker() {
  const p = personById(careId);
  $('care-root').innerHTML = `
    <header class="rp-head rp-head-row">
      <div>
        <span class="eyebrow-label">Caretaker portal</span>
        <h1 class="fr-page-title">Wearer status</h1>
        <p class="body-text">Readings replay from the wearer's recorded session (${esc(p.testedOn)}).</p>
      </div>
      <label class="rp-select">Wearer
        <select onchange="careSelect(this.value)">${allScored().map(q => `<option value="${q.id}"${q.id === p.id ? ' selected' : ''}>${esc(q.name)} (${q.id})</option>`).join('')}</select>
      </label>
    </header>
    <section class="rp-status" id="c-status"></section>
    <div class="rp-two">
      <section class="t2-panel">
        <div class="rp-model-head"><h2 class="t2-panel-title">Alerts</h2><span class="caption-text muted-text" id="c-alert-count"></span></div>
        <ul class="rp-alerts" id="c-alerts"></ul>
      </section>
      <section class="t2-panel">
        <h2 class="t2-panel-title">Location</h2>
        <div id="c-loc"></div>
      </section>
    </div>
    <div class="rp-two">
      <section class="t2-panel"><h2 class="t2-panel-title">Live reading</h2><div id="c-now"></div></section>
      <section class="t2-panel">
        <h2 class="t2-panel-title">About ${esc(p.name.split(' ')[0])}</h2>
        <ul class="rp-kv">
          <li><span>Age</span><b>${p.age}</b></li><li><span>Height / weight</span><b>${p.heightCm} cm · ${p.weightKg} kg</b></li>
          <li><span>Session activity</span><b>${esc(p.scenario)}</b></li><li><span>Highest risk this session</span><b>${badge(maxLevel(p))}</b></li>
        </ul>
      </section>
    </div>`;
  renderCaretakerAlerts();
  replay('caretaker', p, r => {
    const lvl = r.result.level, d = distanceStatus(r.distanceCm), g = r.gps;
    $('c-status').className = `rp-status ${LEVEL[lvl].tone}`;
    $('c-status').innerHTML = `<span class="material-symbols-outlined">${lvl === 'LOW' ? 'check_circle' : lvl === 'MODERATE' ? 'warning' : 'emergency'}</span>
      <div><b>${esc(p.name)} · ${LEVEL[lvl].word} fall risk</b><span>Score ${r.result.score}/100 · last reading ${r.t} · ${esc(r.phase)}</span></div>`;
    $('c-now').innerHTML = `${pressureBars(pressureSplit(r.fsr))}
      <p class="body-text rp-obstacle ${d.tone}"><span class="material-symbols-outlined">sensors</span>Obstacle sensor: <b>${d.label}</b> (${r.distanceCm} cm)</p>`;
    const bbox = [g.lon - 0.003, g.lat - 0.002, g.lon + 0.003, g.lat + 0.002].join(',');
    $('c-loc').innerHTML = `<iframe class="rp-map" title="Wearer location" loading="lazy"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${g.lat},${g.lon}"></iframe>
      <p class="caption-text muted-text">${g.lat.toFixed(5)}, ${g.lon.toFixed(5)} · ${g.fix ? `GPS fix, ${g.sats} satellites` : 'No GPS fix'} ·
        <a href="https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lon}#map=18/${g.lat}/${g.lon}" target="_blank" rel="noopener">Open in maps</a></p>
      <p class="caption-text muted-text">Coordinates in the recorded sessions are placeholders until the GPS module is logged.</p>`;
  });
}

// ── Doctor: Session Analytics (merged with Session History) ─
export function renderAnalytics() {
  const ps = allScored();
  const all = ps.flatMap(p => p.scored);
  const lv = all.reduce((c, r) => (c[r.result.level]++, c), { LOW: 0, MODERATE: 0, HIGH: 0 });
  const avgScore = (all.reduce((s, r) => s + r.result.score, 0) / all.length).toFixed(1);
  const scen = {};
  ps.forEach(p => { (scen[p.scenario] ||= []).push(p); });
  const zone = ps.map(p => {
    const t = p.readings.reduce((a, r) => (a.f += r.fsr.forefoot, a.m += r.fsr.midfoot, a.h += r.fsr.hindfoot, a), { f: 0, m: 0, h: 0 });
    return { p, ...pressureSplit({ forefoot: t.f, midfoot: t.m, hindfoot: t.h }) };
  });
  const rows = ps.slice().sort((a, b) => (b.date + b.readings[0].t).localeCompare(a.date + a.readings[0].t));
  $('analytics-root').innerHTML = `
    <header class="rp-head">
      <span class="eyebrow-label">Doctor / Admin</span>
      <h1 class="fr-page-title">Session Analytics</h1>
      <p class="body-text">Every recorded session, compared. Scores come from the prototype rule-based fall-risk engine. The participant sheet holds sample values for demonstration.</p>
    </header>
    <div class="rp-stat-row rp-kpis">
      <div class="rp-stat"><span class="rp-stat-num">${ps.length}</span><span class="rp-stat-label">Participants / sessions</span></div>
      <div class="rp-stat"><span class="rp-stat-num">${all.length}</span><span class="rp-stat-label">Readings scored</span></div>
      <div class="rp-stat"><span class="rp-stat-num">${avgScore}</span><span class="rp-stat-label">Mean fall-risk score</span></div>
      <div class="rp-stat"><span class="rp-stat-num">${lv.MODERATE + lv.HIGH}</span><span class="rp-stat-label">Alert readings (${lv.MODERATE} moderate, ${lv.HIGH} high)</span></div>
    </div>
    <section class="t2-panel">
      <h2 class="t2-panel-title">Risk by activity</h2>
      <div class="rp-table-wrap"><table class="rp-table">
        <thead><tr><th>Activity</th><th>Sessions</th><th>Mean score</th><th>Readings by risk level</th></tr></thead>
        <tbody>${Object.entries(scen).map(([s, list]) => {
          const rs = list.flatMap(p => p.scored), c = rs.reduce((c, r) => (c[r.result.level]++, c), { LOW: 0, MODERATE: 0, HIGH: 0 });
          return `<tr><td>${esc(s)}</td><td>${list.length}</td><td>${(rs.reduce((a, r) => a + r.result.score, 0) / rs.length).toFixed(1)}</td>
            <td><div class="rp-levelbar sm">${['LOW', 'MODERATE', 'HIGH'].map(l => c[l] ? `<div class="rp-lvl ${LEVEL[l].tone}" style="flex:${c[l]}">${c[l]}</div>` : '').join('')}</div></td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </section>
    <section class="t2-panel">
      <h2 class="t2-panel-title">Pressure distribution per participant</h2>
      <p class="caption-text muted-text">Share of total FSR load across all readings in the session.</p>
      <div class="rp-zone-list">${zone.map(z => `<div class="rp-zone-row"><span>${esc(z.p.name)}</span>
        <div class="rp-zone-bar"><div class="fore" style="flex:${z.fore}">${z.fore}%</div><div class="mid" style="flex:${z.mid}">${z.mid}%</div><div class="hind" style="flex:${z.hind}">${z.hind}%</div></div></div>`).join('')}
      </div>
      <div class="rp-legend"><span class="fore"></span>Forefoot <span class="mid"></span>Midfoot <span class="hind"></span>Heel</div>
    </section>
    <section class="t2-panel">
      <h2 class="t2-panel-title">Session history</h2>
      <div class="rp-table-wrap"><table class="rp-table">
        <thead><tr><th>Date</th><th>Start</th><th>Participant</th><th>Activity</th><th>Readings</th><th>Duration</th><th>Mean score</th><th>Highest risk</th></tr></thead>
        <tbody>${rows.map(p => `<tr><td>${esc(p.testedOn)}</td><td>${p.readings[0].t}</td><td>${esc(p.name)} <span class="muted-text">(${p.id}, ${p.age}, ${esc(p.sex)})</span></td>
          <td>${esc(p.scenario)}</td><td>${p.readings.length}</td><td>${durationText(p)}</td>
          <td>${(p.scored.reduce((a, r) => a + r.result.score, 0) / p.scored.length).toFixed(1)}</td><td>${badge(maxLevel(p))}</td></tr>`).join('')}</tbody>
      </table></div>
      <button class="btn-ghost sm" onclick="switchView('livereadings')"><span class="material-symbols-outlined">monitor_heart</span>Open readings per participant</button>
    </section>`;
}

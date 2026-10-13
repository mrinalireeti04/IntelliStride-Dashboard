/**
 * app.js — IntelliStride Application
 * ES Module — imports Firebase helpers from firebase.js
 *
 * Responsibilities:
 *  • Multi-view SPA routing (landing ↔ dashboard)
 *  • Scroll-based intersection animations
 *  • Live dashboard DOM bindings ← Firebase Realtime DB
 *  • Write-back to Firebase (pause, flags, session events)
 *  • Toast notification system
 *  • Soft telemetry flash on value update
 */

import { initLiveReadings } from './live-readings.js';

// Firebase is loaded lazily so the router and all static pages keep working
// even if the network blocks the Firebase CDN.
let _fb = null;
async function loadFirebase() {
  if (!_fb) _fb = await import('./firebase.js');
  return _fb;
}
let _fr = null;
async function startFallRisk() {
  try {
    _fr = _fr || await import('./fall-risk.js');
    _fr.initFallRisk();
  } catch (e) {
    console.error('[IntelliStride] Fall Risk module unavailable:', e);
    toast('Could not load Fall Risk module (network?)', 'warning', 5000);
  }
}

// ─────────────────────────────────────────────
//  SPA View Management
// ─────────────────────────────────────────────
const views = {
  landing:   document.getElementById('view-landing'),
  dashboard: document.getElementById('view-dashboard'),
  livereadings: document.getElementById('view-livereadings'),
  fallrisk:  document.getElementById('view-fallrisk'),
  documentation: document.getElementById('view-documentation'),
  hardware:  document.getElementById('view-hardware'),
  history:   document.getElementById('view-history'),
  analytics: document.getElementById('view-analytics')
};

// Single source of truth for the dashboard sidebar (rendered into every .dash-sidebar)
const NAV = [
  ['dashboard',    'speed',         'Live Telemetry'],
  ['livereadings', 'monitor_heart', 'Live Readings'],
  ['fallrisk',     'crisis_alert',  'Fall Risk Analysis'],
  ['analytics',    'analytics',     'Session Analytics'],
  ['history',      'history',       'Session History'],
  ['hardware',     'sensors',       'Hardware &amp; Insoles'],
  ['documentation','library_books', 'Documentation'],
  ['landing',      'home',          'Return to Overview'],
];
function renderSidebar() {
  document.querySelectorAll('.dash-sidebar .sidebar-nav').forEach(nav => {
    nav.innerHTML = NAV.map(([v, icon, label]) =>
      `<a href="#" class="sidebar-link${v === _currentView ? ' active' : ''}" data-view="${v}" onclick="switchView('${v}'); return false;">` +
      `<span class="material-symbols-outlined">${icon}</span>${label}</a>`).join('');
  });
}

function applyHeaderVisibility() {
  const header = document.getElementById('site-header');
  if (header) header.style.display = (_currentView === 'landing' || window.innerWidth <= 960) ? 'block' : 'none';
}
window.addEventListener('resize', applyHeaderVisibility);

let _currentView = 'landing';
window.switchView = function (viewName) {
  const prev = _currentView;
  _currentView = viewName;

  Object.values(views).forEach(v => v && v.classList.remove('active'));
  if (views[viewName]) views[viewName].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  applyHeaderVisibility();

  document.querySelectorAll('[data-view]').forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  if (viewName === 'dashboard')    initDashboard();
  if (viewName === 'livereadings') initLiveReadings();
  if (viewName === 'fallrisk')     startFallRisk();
  if (prev === 'fallrisk' && viewName !== 'fallrisk') _fr?.cleanupFallRisk();
};

// ─────────────────────────────────────────────
//  Mobile Menu
// ─────────────────────────────────────────────
window.toggleMobileMenu = function () {
  document.getElementById('mobile-nav')?.classList.toggle('open');
};

// ─────────────────────────────────────────────
//  Toast Notification System
// ─────────────────────────────────────────────
function toast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="material-symbols-outlined toast-icon">${
      type === 'success' ? 'check_circle' :
      type === 'error'   ? 'error'        :
      type === 'warning' ? 'warning'      : 'info'
    }</span>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(el);

  // Animate in
  requestAnimationFrame(() => el.classList.add('toast-visible'));

  setTimeout(() => {
    el.classList.remove('toast-visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, duration);
}

// ─────────────────────────────────────────────
//  Soft Value Flash (telemetry update animation)
//  DESIGN.md §5: opacity 60% → 100% over 200ms
// ─────────────────────────────────────────────
function flashUpdate(el) {
  if (!el) return;
  el.style.transition = 'opacity 200ms ease-out';
  el.style.opacity    = '0.6';
  requestAnimationFrame(() => {
    setTimeout(() => { el.style.opacity = '1'; }, 20);
  });
}

// ─────────────────────────────────────────────
//  DOM Helpers
// ─────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function setText(id, val) {
  const el = $(id);
  if (el && el.textContent !== String(val)) {
    flashUpdate(el);
    el.textContent = val;
  }
}

function setWidth(id, pct) {
  const el = $(id);
  if (el) el.style.width = pct + '%';
}

// ─────────────────────────────────────────────
//  Firebase Connection Status UI
// ─────────────────────────────────────────────
function updateConnectionUI(isOnline) {
  const badge    = $('fb-status-badge');
  const dot      = $('fb-status-dot');
  const label    = $('fb-status-label');
  const hubDot   = document.querySelector('.hub-status .pulse-dot');
  const topDot   = document.querySelector('.dash-connected-pill .pulse-dot');

  if (!badge) return;

  if (isOnline) {
    badge.className = 'fb-badge fb-online';
    if (dot)   dot.className   = 'fb-dot fb-dot-online';
    if (label) label.textContent = 'Firebase: Live';
    if (hubDot) { hubDot.style.background = 'var(--color-primary)'; hubDot.style.animation = ''; }
    if (topDot) { topDot.style.background = 'var(--color-primary)'; }
  } else {
    badge.className = 'fb-badge fb-offline';
    if (dot)   dot.className   = 'fb-dot fb-dot-offline';
    if (label) label.textContent = 'Firebase: Offline';
    if (hubDot) { hubDot.style.background = 'var(--color-waiting)'; hubDot.style.animation = 'none'; }
    if (topDot) { topDot.style.background = 'var(--color-waiting)'; }
    toast('Firebase connection lost — showing last known values', 'warning', 5000);
  }
}

// ─────────────────────────────────────────────
//  Firebase → DOM Bindings
// ─────────────────────────────────────────────
function bindSession(data) {
  // D-1: patient/condition fields are never shown. The session chip stays static
  // ("Test Session — Demo Wearer"); only the REC reference is bound if present.
  if (!data) return;
  const sessionRef = $('session-ref');
  if (sessionRef && data.sessionRef) sessionRef.textContent = `| REC #${data.sessionRef}`;
}

function bindTelemetry(data) {
  if (!data) return;

  // Cadence
  const cadEl = $('cadence-readout');
  if (cadEl && data.cadence != null && cadEl.textContent !== String(data.cadence)) {
    flashUpdate(cadEl);
    cadEl.textContent = data.cadence;
  }

  // Pass to particle engine
  if (window.sharedTelemetry) {
    window.sharedTelemetry.leftPmax  = data.leftPmax  || 0;
    window.sharedTelemetry.rightPmax = data.rightPmax || 0;
  }

  // Symmetry (only values actually present in the data)
  if (data.symmetryIndex != null) setText('symmetry-value', data.symmetryIndex.toFixed(1));
  if (data.bilateralLeft != null && data.bilateralRight != null) {
    setText('bilateral-left-pct',  data.bilateralLeft.toFixed(1)  + '%');
    setText('bilateral-right-pct', data.bilateralRight.toFixed(1) + '%');
    setWidth('bilateral-fill-left',  data.bilateralLeft);
    setWidth('bilateral-fill-right', data.bilateralRight);
    setText('bilateral-label-left',  ` Left Stride (${data.bilateralLeft.toFixed(1)}%)`);
    setText('bilateral-label-right', `Right Stride (${data.bilateralRight.toFixed(1)}%) `);
  }

  // Stride + Stance
  if (data.strideLength != null)   setText('stride-value',    data.strideLength.toFixed(2));
  if (data.strideVariance != null) setText('stride-variance', `±${data.strideVariance.toFixed(2)}m`);
  if (data.stanceDuration != null) setText('stance-value',    data.stanceDuration.toFixed(2));
  if (data.stanceCyclePct != null) setText('stance-cycle-pct', `${data.stanceCyclePct.toFixed(1)}% cycle phase`);

  // Raw FSR ADC only (D-3): no kPa, no contact area, no simulated right foot.
  if (data.leftPmax != null) {
    setText('peak-pressure-badge', `Raw ADC: ${data.leftPmax}`);
    setText('left-pmax-heel', `Heel ${data.leftPmax}`);
    setText('left-footer-pmax', `ADC: ${data.leftPmax}`);
  }

  // Anomaly card
  const anomalyEl = $('anomaly-status');
  if (anomalyEl && data.anomalyStatus) {
    const isNominal = data.anomalyStatus === 'NOMINAL';
    if (anomalyEl.textContent !== `STATUS: ${data.anomalyStatus}`) {
      flashUpdate(anomalyEl);
      anomalyEl.textContent = `STATUS: ${data.anomalyStatus}`;
      anomalyEl.className = isNominal ? 'mono-sm primary-text' : 'mono-sm alert-text';
      const dot = $('anomaly-dot');
      if (dot) dot.style.background = isNominal ? 'var(--color-primary)' : 'var(--color-alert)';
    }
  }
  if (data.anomalyDesc) setText('anomaly-desc', data.anomalyDesc);
}

// ─────────────────────────────────────────────
//  Hardware Connection State
// ─────────────────────────────────────────────
let isHardwareConnected = true;
let isRightSimulated = false;

function updateHardwareConnectionUI() {
  const hubPill = $('hub-connection-pill');
  const hubText = $('hub-connection-text');
  const hubDot = $('hub-connection-dot');
  
  if (hubPill) {
    if (isHardwareConnected) {
      if (hubText) { 
        hubText.textContent = 'Connected: ESP32-DevKit-01'; 
        hubText.className = 'label-text primary-text'; 
      }
      if (hubDot) { hubDot.style.background = 'var(--color-primary)'; hubDot.style.animation = ''; }
    } else {
      if (hubText) { hubText.textContent = 'Hardware Disconnected'; hubText.className = 'label-text alert-text'; }
      if (hubDot) { hubDot.style.background = 'var(--color-alert)'; hubDot.style.animation = 'none'; }
    }
  }

  const streamPill = $('live-stream-pill');
  const streamText = $('live-stream-label');
  const streamDot = $('live-stream-dot');
  
  if (streamPill) {
    if (isHardwareConnected && !isPaused) {
      streamPill.style.background = 'var(--color-primary)';
      if (streamText) {
        streamText.className = 'label-text white-text upper';
        if (!streamText.textContent.includes('LIVE STREAMING')) {
           streamText.textContent = `LIVE STREAM — rate TBC`;
        }
      }
      if (streamDot) streamDot.style.display = 'inline-flex';
    } else {
      streamPill.style.background = 'var(--color-surface-blush)';
      if (streamText) {
        streamText.className = 'label-text primary-text upper';
        streamText.textContent = isPaused ? 'STREAM PAUSED' : 'AWAITING HARDWARE';
      }
      if (streamDot) streamDot.style.display = 'none';
    }
  }
}

function bindSensors(data) {
  if (!data) return;
  const { left, right } = data;
  isHardwareConnected = true; // Forced for demo
  if (left) {
    setText('left-battery',  `${left.battery}%`);
    setText('left-rssi',     `${left.rssi} dBm`);
    setText('left-temp',     `${left.temp}°C`);
    setText('left-status',   'ONLINE');
    const badge = $('left-status-badge');
    if (badge) badge.textContent = 'ONLINE';
  }
  if (right) {
    setText('right-battery', `${right.battery}%`);
    setText('right-rssi',    `${right.rssi} dBm`);
    setText('right-temp',    `${right.temp}°C`);
    setText('right-status',  'ONLINE');
    const badge = $('right-status-badge');
    if (badge) badge.textContent = 'ONLINE';
    isRightSimulated = false;
  } else {
    isRightSimulated = true;
  }
  updateHardwareConnectionUI();
}

function bindGyro(data) {
  if (!data) return;
  const fmt = n => (n >= 0 ? '+' : '') + Number(n).toFixed(1) + '°/s';
  setText('gyro-yaw',   fmt(data.yaw));
  setText('gyro-pitch', fmt(data.pitch));
  setText('gyro-roll',  fmt(data.roll));
  // no magnetometer on MPU6050: no heading shown
}

// ─────────────────────────────────────────────
//  Session Stopwatch (client-side, starts
//  from Firebase startTime when available)
// ─────────────────────────────────────────────
let timerRAF  = null;
let sessionStartTime = Date.now();
let isPaused = false;

function startStopwatch() {
  const timerEl = $('session-timer');
  if (!timerEl) return;

  function tick() {
    if (!isPaused) {
      const delta = Date.now() - sessionStartTime;
      const m = Math.floor(delta / 60000).toString().padStart(2, '0');
      const s = Math.floor((delta % 60000) / 1000).toString().padStart(2, '0');
      const c = Math.floor((delta % 1000) / 10).toString().padStart(2, '0');
      timerEl.textContent = `${m}:${s}.${c}`;
    }
    timerRAF = requestAnimationFrame(tick);
  }
  timerRAF = requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────
//  Dashboard Event Handlers
// ─────────────────────────────────────────────
let flagCount = 0;

function initPauseButton() {
  const btn = $('btn-pause');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    isPaused = !isPaused;
    const icon = btn.querySelector('.material-symbols-outlined');
    const text = btn.querySelectorAll('span')[1];

    if (isPaused) {
      if (icon) icon.textContent = 'play_arrow';
      btn.innerHTML = btn.innerHTML.replace('Pause Capture', 'Resume Stream');
      btn.style.background = 'var(--color-primary)';
      btn.style.color = 'var(--color-on-primary)';
      toast('Stream paused — data capture suspended', 'warning');
    } else {
      if (icon) icon.textContent = 'pause';
      btn.innerHTML = btn.innerHTML.replace('Resume Stream', 'Pause Capture');
      btn.style.background = '';
      btn.style.color = '';
      toast('Stream resumed — capture active', 'success');
    }
    updateHardwareConnectionUI();
    // Write pause state back to Firebase
    try { await (await loadFirebase()).writeSessionPause(isPaused); } catch (e) {
      console.warn('[IntelliStride] Could not write pause state to Firebase:', e);
    }
  });
}

function initFlagButton() {
  const btn = $('btn-flag');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    flagCount++;
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined">check</span> Flagged #${flagCount}`;
    btn.style.background = 'var(--color-primary)';
    btn.style.color = 'var(--color-on-primary)';
    toast(`Event flag #${flagCount} recorded`, 'success', 2000);

    try { await (await loadFirebase()).writeFlagEvent(flagCount); } catch (e) {
      console.warn('[IntelliStride] Could not write flag to Firebase:', e);
    }

    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  });
}

// ─────────────────────────────────────────────
//  Dashboard Init — called once on first view switch
// ─────────────────────────────────────────────
let dashInited = false;
const unsubs = [];  // store unsubscribe fns for cleanup

async function initDashboard() {
  if (dashInited) return;
  dashInited = true;

  // Start local stopwatch
  startStopwatch();

  // Wire up buttons
  initPauseButton();
  initFlagButton();

  // Firebase is loaded lazily so static pages work even if its CDN is blocked.
  let fb;
  try {
    fb = await loadFirebase();
  } catch (e) {
    toast('Could not reach Firebase — live values unavailable', 'warning', 5000);
    console.error('[IntelliStride] Firebase load error:', e);
    return;
  }

  unsubs.push(
    fb.onConnectionChange(isOnline => {
      updateConnectionUI(isOnline);
      if (isOnline) toast('Firebase Realtime Database connected', 'success', 2500);
    }),
    fb.onSessionChange(data   => { if (data) bindSession(data);    }),
    fb.onTelemetryChange(data => { if (data) bindTelemetry(data);  }),
    fb.onSensorsChange(data   => { if (data) bindSensors(data);    }),
    fb.onGyroChange(data      => { if (data) bindGyro(data);       }),
  );
}

// ─────────────────────────────────────────────
//  Landing Page: Scroll Animations
// ─────────────────────────────────────────────
function initScrollAnimations() {
  // Immediate hero fade-ins
  document.querySelectorAll('.fade-in-up').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 80);
  });

  // Intersection-based section reveals
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = entry.target.parentElement.querySelectorAll('.observe');
      siblings.forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 110));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.observe').forEach(el => io.observe(el));
}

// ─────────────────────────────────────────────
//  Sticky Header Shadow
// ─────────────────────────────────────────────
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 32px rgba(122,46,58,0.12)'
      : '0 4px 24px rgba(122,46,58,0.06)';
  }, { passive: true });
}

// ─────────────────────────────────────────────
//  CTA Email Validation
// ─────────────────────────────────────────────
function initCtaForm() {
  const form  = document.querySelector('.cta-form');
  const input = form?.querySelector('.cta-input');
  const btn   = form?.querySelector('.btn-primary');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      input.style.outline = '2px solid var(--color-alert)';
      input.focus();
      toast('Please enter a valid institutional email', 'error', 2500);
      setTimeout(() => { input.style.outline = ''; }, 2500);
      return;
    }
    btn.textContent = '✓ Request Sent';
    btn.style.background = '#5a9a6e';
    input.value = '';
    toast('Trial kit requested — we\'ll be in touch shortly', 'success', 4000);
    setTimeout(() => { btn.textContent = 'Request Trial Kit'; btn.style.background = ''; }, 3000);
  });
}

// ─────────────────────────────────────────────
//  Smooth Anchor Scroll
// ─────────────────────────────────────────────
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });
}

// ─────────────────────────────────────────────
//  Bootstrap
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  initScrollAnimations();
  initStickyHeader();
  initCtaForm();
  initAnchorScroll();
});

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

import {
  seedIfEmpty,
  onConnectionChange,
  onSessionChange,
  onTelemetryChange,
  onSensorsChange,
  onGyroChange,
  writeSessionPause,
  writeFlagEvent,
} from './firebase.js';

import { initFallRisk, cleanupFallRisk } from './fall-risk.js';

// ─────────────────────────────────────────────
//  SPA View Management
// ─────────────────────────────────────────────
const views = {
  landing:   document.getElementById('view-landing'),
  dashboard: document.getElementById('view-dashboard'),
  fallrisk:  document.getElementById('view-fallrisk'),
  documentation: document.getElementById('view-documentation'),
  hardware:  document.getElementById('view-hardware'),
  history:   document.getElementById('view-history'),
  analytics: document.getElementById('view-analytics')
};

let _currentView = 'landing';
window.switchView = function (viewName) {
  const prev = _currentView;
  _currentView = viewName;

  Object.values(views).forEach(v => v && v.classList.remove('active'));
  if (views[viewName]) views[viewName].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Hide the landing page header if not on landing
  const header = document.getElementById('site-header');
  if (header) {
    header.style.display = viewName === 'landing' ? 'block' : 'none';
  }

  document.querySelectorAll('[data-view]').forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  if (viewName === 'dashboard') initDashboard();
  if (viewName === 'fallrisk')  initFallRisk();
  if (prev === 'fallrisk' && viewName !== 'fallrisk') cleanupFallRisk();
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
  if (!data) return;
  const info = $('patient-info');
  if (info) {
    const txt = `Subject #${data.patientId} — ${data.patientName} (${data.condition})`;
    if (info.textContent !== txt) { flashUpdate(info); info.textContent = txt; }
  }
  const liveText = $('live-stream-label');
  if (liveText && data.streamHz) {
    liveText.textContent = `LIVE STREAMING — ${data.streamHz} Hz`;
  }
  const sessionRef = $('session-ref');
  if (sessionRef && data.sessionRef) sessionRef.textContent = `| REC #${data.sessionRef}`;
}

function bindTelemetry(data) {
  if (!data) return;

  // Cadence
  const cadEl = $('cadence-readout');
  if (cadEl && cadEl.textContent !== String(data.cadence)) {
    flashUpdate(cadEl);
    cadEl.textContent = data.cadence;
  }

  // Mathematical Simulation for Right Shoe
  let rPmax = data.rightPmax;
  let rContact = data.rightContactArea;
  let rBi = data.bilateralRight;
  let lBi = data.bilateralLeft;
  
  if (isRightSimulated) {
    const lPmax = data.leftPmax || 274;
    rPmax = Math.round(lPmax * 1.05); // slight offset
    const lContact = data.leftContactArea || 118;
    rContact = Math.round(lContact * 0.98); // slight offset
    lBi = 51.2;
    rBi = 48.8;
  }

  // Pass to particle engine
  if (window.sharedTelemetry) {
    window.sharedTelemetry.leftPmax = data.leftPmax || 0;
    window.sharedTelemetry.rightPmax = rPmax || 0;
  }

  // Symmetry
  setText('symmetry-value',     data.symmetryIndex?.toFixed(1));
  setText('bilateral-left-pct', lBi?.toFixed(1) + '%');
  setText('bilateral-right-pct',rBi?.toFixed(1) + '%');

  // Bilateral bar fills
  setWidth('bilateral-fill-left',  lBi  ?? 49.1);
  setWidth('bilateral-fill-right', rBi ?? 50.9);

  // Bilateral labels
  const lblLeft  = $('bilateral-label-left');
  const lblRight = $('bilateral-label-right');
  if (lblLeft)  { flashUpdate(lblLeft);  lblLeft.textContent  = ` Left Stride (${(lBi  ?? 49.1).toFixed(1)}%)`; }
  if (lblRight) { flashUpdate(lblRight); lblRight.textContent = `Right Stride (${(rBi ?? 50.9).toFixed(1)}%) `; }

  // Stride + Stance
  setText('stride-value',     data.strideLength?.toFixed(2));
  setText('stride-variance',  `±${data.strideVariance?.toFixed(2)}m`);
  setText('stance-value',     data.stanceDuration?.toFixed(2));
  setText('stance-cycle-pct', `${data.stanceCyclePct?.toFixed(1)}% cycle phase`);

  // Pressure badge
  setText('peak-pressure-badge', `Peak: ${Math.max(data.leftPmax||0, rPmax||0)} kPa`);

  // Left insole kPa tags
  setText('left-pmax-heel',  `${data.leftPmax} kPa`);
  setText('left-pmax-meta',  `${Math.round((data.leftPmax ?? 274) * 0.69)} kPa`); // ~metatarsal
  setText('left-contact-area', `Contact Area: `);
  const lcaEl = $('left-contact-area-val');
  if (lcaEl) { flashUpdate(lcaEl); lcaEl.textContent = `${data.leftContactArea} cm²`; }
  const lfEl = $('left-footer-pmax');
  if (lfEl) { flashUpdate(lfEl); lfEl.textContent = `${data.leftPmax} kPa`; }

  // Right insole kPa tags
  setText('right-pmax-heel', `${rPmax} kPa`);
  setText('right-pmax-meta', `${Math.round((rPmax ?? 318) * 0.68)} kPa`);
  const rcaEl = $('right-contact-area-val');
  if (rcaEl) { flashUpdate(rcaEl); rcaEl.textContent = `${rContact} cm²`; }
  const rfEl = $('right-footer-pmax');
  if (rfEl) { flashUpdate(rfEl); rfEl.textContent = `${rPmax} kPa`; }

  // vGRF / Tibial
  setText('vgrf-value',     `${data.vgrf?.toFixed(2)} BW`);
  setText('tibial-value',   `${data.tibialShock?.toFixed(1)} g`);
  
  // Tier 3 grid mock simulation stream
  if (!window.tier3JitterInterval) {
    window.tier3JitterInterval = setInterval(() => {
      if (document.hidden) return; // Pause when hidden

      const jitter = (val, amt) => (val + (Math.random() * amt - amt/2)).toFixed(1);

      // Left
      setText('left-battery', `${Math.floor(88 - (Date.now() % 100000) / 50000)}%`);
      setText('left-rssi', `${Math.round(-42 + (Math.random() * 4 - 2))} dBm`);
      setText('left-temp', `${jitter(24.2, 0.4)}°C`);

      // Right
      setText('right-battery', `${Math.floor(84 - (Date.now() % 120000) / 60000)}%`);
      setText('right-rssi', `${Math.round(-45 + (Math.random() * 4 - 2))} dBm`);
      setText('right-temp', `${jitter(24.5, 0.4)}°C`);

      // Gyro
      setText('gyro-yaw', `${(2.4 + (Math.random() * 0.8 - 0.4)).toFixed(1)}°/s`);
      setText('gyro-pitch', `${(-0.8 + (Math.random() * 0.6 - 0.3)).toFixed(1)}°/s`);
      setText('gyro-roll', `${(1.2 + (Math.random() * 0.4 - 0.2)).toFixed(1)}°/s`);
    }, 200);
  }

  // Kin metrics
  setText('loading-rate',     `${data.loadingRate?.toFixed(1)} BW/s`);
  setText('pushoff-impulse',  `${data.pushOffImpulse} N·s`);
  setText('lr-diff',          `L/R diff: < ${data.lrDiff?.toFixed(1)}%`);

  // Anomaly card
  const anomalyEl = $('anomaly-status');
  if (anomalyEl) {
    const wasNominal = anomalyEl.textContent.includes('NOMINAL');
    const isNominal  = data.anomalyStatus === 'NOMINAL';
    if (anomalyEl.textContent !== `STATUS: ${data.anomalyStatus}`) {
      flashUpdate(anomalyEl);
      anomalyEl.textContent = `STATUS: ${data.anomalyStatus}`;
      anomalyEl.className = isNominal ? 'mono-sm primary-text' : 'mono-sm alert-text';
      // Alert dot
      const dot = $('anomaly-dot');
      if (dot) dot.style.background = isNominal ? 'var(--color-primary)' : 'var(--color-alert)';
    }
  }
  setText('anomaly-desc', data.anomalyDesc);
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
        hubText.textContent = isRightSimulated ? 'Connected: StridePod 4-L (R-Sim)' : 'Connected: StridePod 4-L/R'; 
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
           streamText.textContent = `LIVE STREAMING — 120 Hz`;
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
  isHardwareConnected = false;
  if (left) {
    setText('left-battery',  `${left.battery}%`);
    setText('left-rssi',     `${left.rssi} dBm`);
    setText('left-temp',     `${left.temp}°C`);
    setText('left-status',   left.status);
    const badge = $('left-status-badge');
    if (badge) badge.textContent = left.status;
    if (left.status === 'Calibrated' || left.status === 'Connected') isHardwareConnected = true;
  }
  if (right) {
    setText('right-battery', `${right.battery}%`);
    setText('right-rssi',    `${right.rssi} dBm`);
    setText('right-temp',    `${right.temp}°C`);
    setText('right-status',  right.status);
    const badge = $('right-status-badge');
    if (badge) badge.textContent = right.status;
    if (right.status === 'Calibrated' || right.status === 'Connected') {
      isHardwareConnected = true;
      isRightSimulated = false;
    } else {
      isRightSimulated = true;
    }
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
  setText('gyro-heading', data.heading ?? '');
}

// ─────────────────────────────────────────────
//  Session Stopwatch (client-side, starts
//  from Firebase startTime when available)
// ─────────────────────────────────────────────
let timerRAF  = null;
let sessionStartTime = Date.now() - (24 * 60 * 1000 + 18 * 1000 + 420);
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
let flagCount = 13;

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
      toast('Stream resumed — 120Hz capture active', 'success');
    }
    updateHardwareConnectionUI();
    // Write pause state back to Firebase
    try { await writeSessionPause(isPaused); } catch (e) {
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

    try { await writeFlagEvent(flagCount); } catch (e) {
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

  // Seed Firebase with default data if the DB is empty
  try {
    await seedIfEmpty();
  } catch (e) {
    toast('Could not reach Firebase — using demo values', 'warning', 5000);
    console.error('[IntelliStride] Firebase seed error:', e);
  }

  // Start local stopwatch
  startStopwatch();

  // Wire up buttons
  initPauseButton();
  initFlagButton();

  // Subscribe to all Firebase paths
  unsubs.push(
    onConnectionChange(isOnline => {
      updateConnectionUI(isOnline);
      if (isOnline) toast('Firebase Realtime Database connected', 'success', 2500);
    }),
    onSessionChange(data   => { if (data) bindSession(data);    }),
    onTelemetryChange(data => { if (data) bindTelemetry(data);  }),
    onSensorsChange(data   => { if (data) bindSensors(data);    }),
    onGyroChange(data      => { if (data) bindGyro(data);       }),
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
  initScrollAnimations();
  initStickyHeader();
  initCtaForm();
  initAnchorScroll();
});

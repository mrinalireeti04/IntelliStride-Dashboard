/**
 * firebase.js — IntelliStride Firebase Realtime Database Integration
 * Firebase v10 Modular SDK via CDN (no bundler required)
 *
 * Database Schema:
 *  /sessions/active      → patient info, session state
 *  /telemetry/live       → all live kinematic + pressure metrics
 *  /telemetry/sensors    → left/right StridePod hardware telemetry
 *  /telemetry/gyro       → orientation data
 *  /events/flags         → push-only event log
 */

import { initializeApp }            from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAnalytics }             from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js';
import {
  getDatabase, ref, onValue,
  set, push, get, serverTimestamp,
  onDisconnect
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
import { firebaseConfig } from './env.js';

// ─────────────────────────────────────────────
//  Initialization
// ─────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Analytics — gracefully ignore if it fails on localhost/file://
try { getAnalytics(app); } catch (_) {}

// ─────────────────────────────────────────────
//  Database Path Constants
// ─────────────────────────────────────────────
export const PATHS = {
  connection: '.info/connected',
  session:    'sessions/active',
  telemetry:  'telemetry/live',
  sensors:    'telemetry/sensors',
  gyro:       'telemetry/gyro',
  flags:      'events/flags',
};

// ─────────────────────────────────────────────
//  Subscription Helpers
//  Each returns an unsubscribe function
// ─────────────────────────────────────────────

/** Fires whenever Firebase connection state changes (true = online) */
export function onConnectionChange(cb) {
  return onValue(ref(db, PATHS.connection), snap => cb(!!snap.val()));
}

/** Fires when the active session record changes */
export function onSessionChange(cb) {
  return onValue(ref(db, PATHS.session), snap => cb(snap.val()));
}

/** Fires on any live telemetry update (cadence, symmetry, pressure…) */
export function onTelemetryChange(cb) {
  return onValue(ref(db, PATHS.telemetry), snap => cb(snap.val()));
}

/** Fires when sensor hardware data changes (battery, RSSI, temp) */
export function onSensorsChange(cb) {
  return onValue(ref(db, PATHS.sensors), snap => cb(snap.val()));
}

/** Fires when gyro/orientation data changes */
export function onGyroChange(cb) {
  return onValue(ref(db, PATHS.gyro), snap => cb(snap.val()));
}

// ─────────────────────────────────────────────
//  Write Helpers (Dashboard → Firebase)
// ─────────────────────────────────────────────

/** Write a pause/resume state to Firebase */
export function writeSessionPause(isPaused) {
  return set(ref(db, `${PATHS.session}/isPaused`), isPaused);
}

/** Push a timestamped event flag to Firebase */
export function writeFlagEvent(flagNumber) {
  return push(ref(db, PATHS.flags), {
    label:     `Event Flag #${flagNumber}`,
    timestamp: serverTimestamp(),
    sessionId: 'IS-8942-B',
  });
}

/** Write session start time */
export function writeSessionStart() {
  return set(ref(db, `${PATHS.session}/startTime`), serverTimestamp());
}

// ─────────────────────────────────────────────
//  Seed Initial Data (runs once if DB is empty)
// ─────────────────────────────────────────────
export async function seedIfEmpty() {
  const snap = await get(ref(db, PATHS.telemetry));
  if (snap.exists()) {
    console.info('[IntelliStride] Firebase: telemetry data already present, skipping seed.');
    return;
  }

  const now = Date.now();
  console.info('[IntelliStride] Firebase: seeding initial telemetry data…');

  await set(ref(db, PATHS.session), {
    patientId:   '8421',
    patientName: 'Marcus Vance',
    condition:   'Post-ACL Recon, Wk 6',
    sessionRef:  'IS-8942-B',
    streamHz:    120,
    isPaused:    false,
    startTime:   now - (24 * 60 * 1000 + 18 * 1000 + 420),
  });

  await set(ref(db, PATHS.telemetry), {
    // Cadence
    cadence:          114,
    // Symmetry
    symmetryIndex:    98.2,
    bilateralLeft:    49.1,
    bilateralRight:   50.9,
    // Stride
    strideLength:     1.42,
    strideVariance:   0.03,
    // Stance
    stanceDuration:   0.68,
    stanceCyclePct:   61.4,
    // Pressure
    leftPmax:         274,
    rightPmax:        318,
    leftContactArea:  118,
    rightContactArea: 124,
    peakBadgeKPa:     318,
    // Kinematics
    loadingRate:      62.4,
    pushOffImpulse:   248,
    lrDiff:           2.1,
    vgrf:             1.18,
    tibialShock:      4.8,
    // Anomaly
    anomalyStatus:    'NOMINAL',
    anomalyDesc:      'No pathologic gait deviation or asymmetric muscle fatigue detected over last 140 strides.',
    updatedAt:        now,
  });

  await set(ref(db, PATHS.sensors), {
    left:  { battery: 0, rssi: 0, temp: 20.0, status: 'Offline' },
    right: { battery: 0, rssi: 0, temp: 20.0, status: 'Offline' },
  });

  await set(ref(db, PATHS.gyro), {
    yaw:     2.4,
    pitch:   -0.8,
    roll:    1.2,
    heading: '142° SE',
  });

  console.info('[IntelliStride] Firebase: seed complete ✓');
}

/**
 * live.js — real-time data from the two shoes.
 * Each ESP32 writes to IntelliStride/Shoe1 and IntelliStride/Shoe2:
 *   FSR {FSR1, FSR2, FSR3}            raw ADC 0–4095
 *   MPU6050 {AccelX..Z, GyroX..Z}     m/s² and rad/s (Adafruit MPU6050 library units)
 *   GPS {Latitude, Longitude, Valid, Satellites, Speed, Altitude}
 *   Ultrasonic {DistanceCM}           -1 = no echo
 *   System {Online, LastUpdate, UptimeSec, Buzzer, DistanceAlert}
 * Readings are converted to the dashboard's units (g, deg/s) and scored with the
 * same rule-based fall-risk engine used everywhere else.
 */
import { fallRiskEngine } from './fall-risk-engine.js';

export const SHOES = [
  { id: 'Shoe1', label: 'Shoe 1', path: 'IntelliStride/Shoe1' },
  { id: 'Shoe2', label: 'Shoe 2', path: 'IntelliStride/Shoe2' },
];
// Which FSR sits where. Change here if the wiring differs.
export const FSR_MAP = { forefoot: 'FSR1', midfoot: 'FSR2', hindfoot: 'FSR3' };
const G = 9.80665, RAD2DEG = 57.2958;
const FRESH_MS = 10000;          // a shoe counts as live if it sent data in the last 10 s

const state = {};                // shoeId -> { raw, reading, receivedAt, prevMag, history[] }
const listeners = new Set();
let started = false, connected = null, startError = null;

export function onLive(fn) { listeners.add(fn); fn(snapshot()); return () => listeners.delete(fn); }
const emit = () => { const s = snapshot(); listeners.forEach(fn => { try { fn(s); } catch (e) { console.error(e); } }); };

export function isFresh(shoeId) {
  const s = state[shoeId];
  if (!s) return false;
  const now = Date.now();
  // Fresh if we received a change while the page is open, or the shoe's own clock says it just wrote.
  return (s.changedAt && now - s.changedAt < FRESH_MS) ||
         (s.raw?.System?.LastUpdate > 1.6e12 && Math.abs(now - s.raw.System.LastUpdate) < FRESH_MS);
}
export function anyFresh() { return SHOES.some(s => isFresh(s.id)); }
export function snapshot() {
  return { connected, error: startError, shoes: SHOES.map(s => ({ ...s, ...(state[s.id] || {}), fresh: isFresh(s.id) })) };
}

function phaseFromFsr(f) {
  const tot = f.forefoot + f.midfoot + f.hindfoot;
  if (tot < 300) return 'Swing (foot in the air)';
  if (f.hindfoot >= f.forefoot && f.hindfoot >= f.midfoot) return 'Heel strike';
  if (f.forefoot > f.hindfoot && f.forefoot >= f.midfoot) return 'Push-off';
  return 'Mid stance';
}

export function toReading(raw, prevMag) {
  const fsr = {
    forefoot: +(raw?.FSR?.[FSR_MAP.forefoot] ?? 0),
    midfoot:  +(raw?.FSR?.[FSR_MAP.midfoot] ?? 0),
    hindfoot: +(raw?.FSR?.[FSR_MAP.hindfoot] ?? 0),
  };
  const m = raw?.MPU6050 || {};
  let ax = +(m.AccelX ?? 0), ay = +(m.AccelY ?? 0), az = +(m.AccelZ ?? 0);
  // Library reports m/s²; convert to g (a resting shoe reads ~1 g)
  if (Math.hypot(ax, ay, az) > 3) { ax /= G; ay /= G; az /= G; }
  const accel = { x: +ax.toFixed(3), y: +ay.toFixed(3), z: +az.toFixed(3) };
  const gyro = { x: +(+(m.GyroX ?? 0) * RAD2DEG).toFixed(1), y: +(+(m.GyroY ?? 0) * RAD2DEG).toFixed(1), z: +(+(m.GyroZ ?? 0) * RAD2DEG).toFixed(1) };
  const imuDead = ax === 0 && ay === 0 && az === 0;
  const orientation = imuDead ? { pitch: 0, roll: 0 } : {
    pitch: +(Math.atan2(ax, Math.hypot(ay, az)) * RAD2DEG).toFixed(1),
    roll:  +(Math.atan2(ay, az) * RAD2DEG).toFixed(1),
  };
  const g = raw?.GPS || {};
  const dist = +(raw?.Ultrasonic?.DistanceCM ?? -1);
  const result = fallRiskEngine({ accel, gyro, orientation, prevAccelMag: prevMag });
  const now = new Date();
  return {
    t: now.toLocaleTimeString('en-GB', { hour12: false }),
    phase: phaseFromFsr(fsr), fsr, accel, gyro, orientation, imuDead,
    fsrSaturated: fsr.forefoot >= 4090 && fsr.midfoot >= 4090 && fsr.hindfoot >= 4090,
    distanceCm: dist, noEcho: dist < 0,
    gps: { lat: +(g.Latitude ?? 0), lon: +(g.Longitude ?? 0), sats: +(g.Satellites ?? 0), fix: !!g.Valid, speed: +(g.Speed ?? 0), alt: +(g.Altitude ?? 0) },
    buzzer: !!raw?.System?.Buzzer, distanceAlert: !!raw?.System?.DistanceAlert,
    uptime: raw?.System?.UptimeSec, lastUpdate: raw?.System?.LastUpdate,
    result,
  };
}

export async function startLive() {
  if (started) return;
  started = true;
  try {
    const { db } = await import('./firebase.js');
    const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');
    onValue(ref(db, '.info/connected'), snap => { connected = !!snap.val(); emit(); });
    SHOES.forEach(shoe => {
      onValue(ref(db, shoe.path), snap => {
        const raw = snap.val();
        const s = state[shoe.id] || (state[shoe.id] = { history: [], firstSeenAt: Date.now() });
        const before = JSON.stringify(s.raw);
        s.raw = raw;
        s.receivedAt = Date.now();
        // The first snapshot is whatever was stored; only later changes prove the shoe is sending now.
        if (s.loaded && before !== JSON.stringify(raw)) s.changedAt = Date.now();
        s.loaded = true;
        s.reading = toReading(raw, s.prevMag ?? null);
        s.prevMag = s.reading.result.accelMag;
        if (s.changedAt === s.receivedAt) {
          s.history.push(s.reading);
          if (s.history.length > 200) s.history.shift();
        }
        emit();
      }, err => { startError = err.message; emit(); });
    });
    setInterval(emit, 2000);   // refresh "live / last seen" labels
  } catch (e) {
    startError = e.message || String(e);
    started = false;
    emit();
  }
}

export function ago(ms) {
  if (!ms) return 'never';
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return `${s} s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
}

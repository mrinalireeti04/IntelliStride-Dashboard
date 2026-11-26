/**
 * live-demo.js — DEMO STREAM for the Live Shoes page.
 * Generates continuous, simulated readings for both shoes while the hardware is being re-wired.
 * The numbers are NOT from the shoes: they are synthesised from the gait patterns recorded in
 * IntelliStride_Participants_Readings.xlsx (per-phase averages of pressure, motion and tilt),
 * with noise added. The page always labels this mode as "Demo stream".
 */
import { PEOPLE, GPS_ORIGIN } from './live-readings-data.js?v=4';
import { SHOES, toReading } from './live.js?v=1';

const G = 9.80665, RAD2DEG = 57.2958;
const TICK_MS = 250;
const CYCLE = ['Heel strike', 'Foot flat', 'Mid stance', 'Toe off', 'Swing'];
const PHASE_SHARE = [0.12, 0.18, 0.2, 0.12, 0.38];     // share of one ~1.1 s stride

// Per-phase averages from the participant sheet (walking participants only).
const PROFILE = (() => {
  const acc = {};
  PEOPLE.forEach(p => p.readings.forEach(r => {
    if (!CYCLE.includes(r.phase)) return;
    const a = acc[r.phase] || (acc[r.phase] = { n: 0, f: 0, m: 0, h: 0, ax: 0, ay: 0, az: 0, gx: 0, gy: 0, gz: 0, pi: 0, ro: 0 });
    a.n++; a.f += r.fsr.forefoot; a.m += r.fsr.midfoot; a.h += r.fsr.hindfoot;
    a.ax += r.accel.x; a.ay += r.accel.y; a.az += r.accel.z;
    a.gx += r.gyro.x; a.gy += r.gyro.y; a.gz += r.gyro.z;
    a.pi += r.orientation.pitch; a.ro += r.orientation.roll;
  }));
  const out = {};
  CYCLE.forEach(ph => { const a = acc[ph]; out[ph] = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, k === 'n' ? v : v / a.n])); });
  return out;
})();

const noise = s => (Math.random() * 2 - 1) * s;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

function phaseAt(t) {               // t in [0,1) of the stride -> [phase index, progress within phase]
  let acc = 0;
  for (let i = 0; i < CYCLE.length; i++) {
    if (t < acc + PHASE_SHARE[i]) return [i, (t - acc) / PHASE_SHARE[i]];
    acc += PHASE_SHARE[i];
  }
  return [CYCLE.length - 1, 0.999];
}

function makeShoe(offset, seed) {
  return {
    offset,                          // Shoe 2 is half a stride behind Shoe 1 (left / right foot)
    stridesS: 1.08,
    dist: 180 + seed * 30, distV: 0,
    lat: GPS_ORIGIN.lat + seed * 0.00001, lon: GPS_ORIGIN.lon,
    heading: 0.6, sats: 8, startedAt: Date.now() - (1800 + seed * 37) * 1000,
    history: [], steps: 0, lastPhase: null, alerts: 0, prevMag: null,
  };
}

const sim = { shoes: SHOES.map((s, i) => makeShoe(i * 0.5, i)), timer: null, listeners: new Set(), t0: Date.now() };

function rawFor(sh, now) {
  const t = (((now - sim.t0) / 1000) / sh.stridesS + sh.offset) % 1;
  const [i, p] = phaseAt(t);
  const a = PROFILE[CYCLE[i]], b = PROFILE[CYCLE[(i + 1) % CYCLE.length]];
  const ease = p * p * (3 - 2 * p);
  const v = k => lerp(a[k], b[k], ease);

  // Occasional slow-walk / speed-up so the totals drift like a real walk.
  const effort = 1 + 0.08 * Math.sin((now - sim.t0) / 9000 + sh.offset * 3);
  const fsr = {
    FSR1: Math.round(clamp(v('f') * effort + noise(90), 0, 4095)),
    FSR2: Math.round(clamp(v('m') * effort + noise(80), 0, 4095)),
    FSR3: Math.round(clamp(v('h') * effort + noise(90), 0, 4095)),
  };

  // Obstacle distance: slow random walk between 40 and 260 cm.
  sh.distV = clamp(sh.distV + noise(6), -12, 12);
  sh.dist = clamp(sh.dist + sh.distV, 40, 260);
  if (sh.dist <= 40 || sh.dist >= 260) sh.distV *= -1;
  const distanceAlert = sh.dist < 100;

  // GPS: about 4 km/h along a slowly turning heading.
  const speed = clamp(3.9 * effort + noise(0.25), 2.8, 5.2);
  sh.heading += noise(0.02);
  const m = speed / 3.6 * TICK_MS / 1000;
  sh.lat += (m * Math.cos(sh.heading)) / 111320;
  sh.lon += (m * Math.sin(sh.heading)) / (111320 * Math.cos(sh.lat * Math.PI / 180));
  if (Math.random() < 0.01) sh.sats = clamp(sh.sats + (Math.random() < 0.5 ? -1 : 1), 6, 11);

  return {
    FSR: fsr,
    MPU6050: {
      AccelX: (v('ax') + noise(0.03)) * G, AccelY: (v('ay') + noise(0.03)) * G, AccelZ: (v('az') + noise(0.025)) * G,
      GyroX: (v('gx') + noise(1.2)) / RAD2DEG, GyroY: (v('gy') + noise(1.0)) / RAD2DEG, GyroZ: (v('gz') + noise(1.0)) / RAD2DEG,
    },
    GPS: { Latitude: sh.lat, Longitude: sh.lon, Valid: true, Satellites: sh.sats, Speed: +speed.toFixed(1), Altitude: 216 + noise(0.4) },
    Ultrasonic: { DistanceCM: Math.round(sh.dist) },
    System: { Online: true, LastUpdate: now, UptimeSec: Math.round((now - sh.startedAt) / 1000), Buzzer: sh.dist < 60, DistanceAlert: distanceAlert },
  };
}

function tick() {
  const now = Date.now();
  sim.shoes.forEach(sh => {
    sh.raw = rawFor(sh, now);
    sh.reading = toReading(sh.raw, sh.prevMag);
    sh.prevMag = sh.reading.result.accelMag;
    sh.changedAt = now;
    if (sh.reading.phase === 'Heel strike' && sh.lastPhase !== 'Heel strike') sh.steps++;
    if (sh.raw.System.DistanceAlert && !sh.lastAlert) sh.alerts++;
    sh.lastAlert = sh.raw.System.DistanceAlert;
    sh.lastPhase = sh.reading.phase;
    sh.history.push(sh.reading);
    if (sh.history.length > 120) sh.history.shift();
  });
  const snap = demoSnapshot();
  sim.listeners.forEach(fn => { try { fn(snap); } catch (e) { console.error(e); } });
}

export function demoSnapshot() {
  return {
    demo: true, connected: true, error: null,
    shoes: SHOES.map((s, i) => {
      const sh = sim.shoes[i];
      return { ...s, loaded: !!sh.raw, raw: sh.raw, reading: sh.reading, history: sh.history, changedAt: sh.changedAt, fresh: true, steps: sh.steps, alerts: sh.alerts };
    }),
  };
}

/** Clear the sparkline history and counters so a new session starts fresh. */
export function resetDemo() {
  sim.shoes.forEach(sh => { sh.history = []; sh.steps = 0; sh.alerts = 0; sh.prevMag = null; sh.lastPhase = null; });
}

export function onDemo(fn) {
  sim.listeners.add(fn);
  if (!sim.timer) { tick(); sim.timer = setInterval(tick, TICK_MS); }
  fn(demoSnapshot());
  return () => {
    sim.listeners.delete(fn);
    if (!sim.listeners.size && sim.timer) { clearInterval(sim.timer); sim.timer = null; }
  };
}

/**
 * fall-risk-engine.js — pure scoring engine (no Firebase). Shared by Fall Risk, Live Readings and Algorithms pages.
 * PROTOTYPE: thresholds are engineering estimates, not clinically validated.
 */

export const FR_CONFIG = {
  // Risk level thresholds (score 0–100)
  LOW_MAX:   39,   // 0–39  = LOW
  HIGH_MIN:  70,   // 70–100 = HIGH  |  40–69 = MODERATE

  // Acceleration magnitude (g) prototype thresholds
  ACCEL_NORMAL_MAX:   1.30,
  ACCEL_ELEVATED:     1.50,
  ACCEL_HIGH:         2.50,

  // Angular velocity magnitude (°/s) prototype thresholds
  GYRO_NORMAL_MAX:    20.0,
  GYRO_ELEVATED:      30.0,
  GYRO_HIGH:          80.0,

  // Sudden acceleration change (g delta)
  SUDDEN_DELTA:       0.40,

  // Tilt magnitude (degrees, combined pitch+roll)
  TILT_ELEVATED:       8.0,
  TILT_HIGH:          15.0,

  // Chart / buffer settings
  CHART_MAX_SAMPLES:  200,  // rolling window (~20s @ 10Hz)
  TREND_MAX_SAMPLES:   60,
  ACCEL_Y_RANGE:        3,  // ±3g
  GYRO_Y_RANGE:       120,  // ±120 °/s

  DEMO_INTERVAL_MS:   400,
  MAX_EVENTS:          20,
  FALL_RISK_PATH:  'fallRisk',
};

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
//  FALL RISK ENGINE  (pure function — swap for ML later)
// ═══════════════════════════════════════════════════════
export function fallRiskEngine({ accel, gyro, orientation, prevAccelMag = null }) {
  const ax = +( accel?.x  ?? 0);
  const ay = +( accel?.y  ?? 0);
  const az = +( accel?.z  ?? 1);
  const gx = +( gyro?.x   ?? 0);
  const gy = +( gyro?.y   ?? 0);
  const gz = +( gyro?.z   ?? 0);
  const pitch = +(orientation?.pitch ?? 0);
  const roll  = +(orientation?.roll  ?? 0);

  const accelMag = Math.sqrt(ax*ax + ay*ay + az*az);
  const gyroMag  = Math.sqrt(gx*gx + gy*gy + gz*gz);
  const tilt     = Math.sqrt(pitch*pitch + roll*roll);
  const sudden   = prevAccelMag !== null ? Math.abs(accelMag - prevAccelMag) : 0;

  const feat = {
    accelMag:   { value: accelMag, unit: 'g',   status: 'NORMAL' },
    gyroMag:    { value: gyroMag,  unit: '°/s', status: 'NORMAL' },
    tilt:       { value: tilt,     unit: '°',   status: 'NORMAL' },
    sudden:     { value: sudden,   unit: 'g',   status: 'NOT DETECTED' },
    instability:{ value: 0,        unit: '',    status: 'NORMAL' },
  };

  let score = 0;

  // 1. Acceleration magnitude  (max 40 pts)
  if      (accelMag >= FR_CONFIG.ACCEL_HIGH)     { score += 40; feat.accelMag.status = 'HIGH';     }
  else if (accelMag >= FR_CONFIG.ACCEL_ELEVATED)  { score += 25; feat.accelMag.status = 'ELEVATED'; }
  else if (accelMag >= FR_CONFIG.ACCEL_NORMAL_MAX){ score += 10; feat.accelMag.status = 'ELEVATED'; }

  // 2. Angular velocity magnitude  (max 40 pts)
  if      (gyroMag >= FR_CONFIG.GYRO_HIGH)       { score += 40; feat.gyroMag.status = 'HIGH';     }
  else if (gyroMag >= FR_CONFIG.GYRO_ELEVATED)    { score += 20; feat.gyroMag.status = 'ELEVATED'; }
  else if (gyroMag >= FR_CONFIG.GYRO_NORMAL_MAX)  { score +=  8; feat.gyroMag.status = 'ELEVATED'; }

  // 3. Sudden acceleration change  (max 15 pts)
  if (sudden >= FR_CONFIG.SUDDEN_DELTA) { score += 15; feat.sudden.status = 'DETECTED'; }

  // 4. Tilt  (max 10 pts)
  if      (tilt >= FR_CONFIG.TILT_HIGH)     { score += 10; feat.tilt.status = 'HIGH';     }
  else if (tilt >= FR_CONFIG.TILT_ELEVATED) { score +=  5; feat.tilt.status = 'ELEVATED'; }

  score = Math.min(100, Math.round(score));
  feat.instability.value = score / 100;
  if      (score >= FR_CONFIG.HIGH_MIN)    feat.instability.status = 'HIGH';
  else if (score >= FR_CONFIG.LOW_MAX + 1) feat.instability.status = 'ELEVATED';

  const level = score >= FR_CONFIG.HIGH_MIN   ? 'HIGH'
              : score >= FR_CONFIG.LOW_MAX + 1 ? 'MODERATE' : 'LOW';

  let explanation;
  if (level === 'LOW') {
    explanation = 'Current movement pattern is within normal walking range. No significant instability detected.';
  } else if (level === 'MODERATE') {
    if (feat.gyroMag.status !== 'NORMAL' && feat.accelMag.status !== 'NORMAL') {
      explanation = 'Elevated angular velocity and acceleration variance detected. Increased rotational and linear instability.';
    } else if (feat.gyroMag.status !== 'NORMAL') {
      explanation = 'Elevated angular velocity detected. Movement shows increased rotational instability — monitor closely.';
    } else if (feat.sudden.status === 'DETECTED') {
      explanation = 'Sudden acceleration change detected. Brief movement spike may indicate gait perturbation.';
    } else {
      explanation = 'Elevated acceleration variance detected. Movement deviating from steady-state walking baseline.';
    }
  } else {
    explanation = feat.sudden.status === 'DETECTED'
      ? 'Sudden acceleration change and high angular velocity detected. Haptic warning recommended. Verify wearer safety.'
      : 'High acceleration magnitude and angular velocity detected. Emergency alert threshold reached.';
  }

  return { score, level, features: feat, explanation, accelMag, gyroMag };
}

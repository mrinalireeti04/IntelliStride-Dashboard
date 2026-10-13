// live-readings-data.js
// Telemetry Readings Stream. Generated from IntelliStride_Participants_Readings.xlsx
// Date and times are Indian Standard Time (UTC+05:30).
// Heights, weights and readings are SAMPLE values for demonstration (per the sheet).
// GPS coordinates are placeholders (the sheet has none).

export const READINGS_DATE = '2026-10-13';
export const DATA_LABEL    = 'Telemetry Stream — 100 Hz Active';
export const GPS_ORIGIN = { lat: 28.613900, lon: 77.209000 };

// Units: fsr = raw ADC 0-4095 (uncalibrated) | accel = g | gyro = deg/s | orientation = deg | distanceCm = cm
export const PEOPLE = [
  {
    "id": "P1",
    "name": "Vidula Nijhawan",
    "sex": "Female",
    "age": 20,
    "heightCm": 160,
    "weightKg": 52,
    "bmi": 20.31,
    "bmiCategory": "Normal",
    "footSize": 5,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "09:51:54",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 318,
          "midfoot": 435,
          "hindfoot": 2565
        },
        "accel": {
          "x": 0.08,
          "y": 0.07,
          "z": 1.02
        },
        "gyro": {
          "x": 3.1,
          "y": 0.5,
          "z": 2.5
        },
        "orientation": {
          "pitch": 3.4,
          "roll": 1.1
        },
        "distanceCm": 203,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:52:02",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 980,
          "midfoot": 1422,
          "hindfoot": 2401
        },
        "accel": {
          "x": 0.05,
          "y": -0.05,
          "z": 0.98
        },
        "gyro": {
          "x": 2.4,
          "y": 0.7,
          "z": 1.1
        },
        "orientation": {
          "pitch": 1.3,
          "roll": 0.7
        },
        "distanceCm": 192,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:52:08",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1693,
          "midfoot": 1955,
          "hindfoot": 1067
        },
        "accel": {
          "x": 0.02,
          "y": 0.05,
          "z": 1.07
        },
        "gyro": {
          "x": 2.0,
          "y": -0.2,
          "z": 0.3
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.5
        },
        "distanceCm": 198,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:52:18",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2571,
          "midfoot": 1042,
          "hindfoot": 290
        },
        "accel": {
          "x": -0.11,
          "y": 0.08,
          "z": 1.11
        },
        "gyro": {
          "x": 9.7,
          "y": 3.0,
          "z": 3.6
        },
        "orientation": {
          "pitch": -5.9,
          "roll": 1.7
        },
        "distanceCm": 179,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:52:23",
        "phase": "Swing",
        "fsr": {
          "forefoot": 100,
          "midfoot": 67,
          "hindfoot": 42
        },
        "accel": {
          "x": 0.05,
          "y": 0.01,
          "z": 0.96
        },
        "gyro": {
          "x": 12.7,
          "y": 5.5,
          "z": 7.1
        },
        "orientation": {
          "pitch": -9.4,
          "roll": 2.5
        },
        "distanceCm": 177,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:52:32",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 368,
          "midfoot": 429,
          "hindfoot": 2685
        },
        "accel": {
          "x": 0.1,
          "y": 0.04,
          "z": 1.05
        },
        "gyro": {
          "x": 4.8,
          "y": 2.1,
          "z": 1.9
        },
        "orientation": {
          "pitch": 3.2,
          "roll": 1.1
        },
        "distanceCm": 252,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:52:38",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 971,
          "midfoot": 1387,
          "hindfoot": 2295
        },
        "accel": {
          "x": 0.02,
          "y": -0.05,
          "z": 1.02
        },
        "gyro": {
          "x": 2.3,
          "y": -0.1,
          "z": 0.7
        },
        "orientation": {
          "pitch": 1.1,
          "roll": 0.7
        },
        "distanceCm": 242,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:52:49",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2724,
          "midfoot": 1011,
          "hindfoot": 231
        },
        "accel": {
          "x": -0.09,
          "y": 0.07,
          "z": 1.07
        },
        "gyro": {
          "x": 10.0,
          "y": 3.1,
          "z": 3.5
        },
        "orientation": {
          "pitch": -5.8,
          "roll": 1.8
        },
        "distanceCm": 202,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 7,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P2",
    "name": "Rishika Gupta",
    "sex": "Female",
    "age": 20,
    "heightCm": 163,
    "weightKg": 55,
    "bmi": 20.7,
    "bmiCategory": "Normal",
    "footSize": 6,
    "testedOn": "13 Oct 2026",
    "scenario": "Brisk walk with a turn",
    "readings": [
      {
        "t": "08:22:47",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 601,
          "midfoot": 803,
          "hindfoot": 3554
        },
        "accel": {
          "x": 0.2,
          "y": 0.13,
          "z": 1.18
        },
        "gyro": {
          "x": 20.4,
          "y": 10.9,
          "z": 9.4
        },
        "orientation": {
          "pitch": 4.5,
          "roll": 2.2
        },
        "distanceCm": 160,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:22:53",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1622,
          "midfoot": 2330,
          "hindfoot": 2725
        },
        "accel": {
          "x": 0.16,
          "y": -0.07,
          "z": 1.12
        },
        "gyro": {
          "x": 12.4,
          "y": 8.5,
          "z": 5.0
        },
        "orientation": {
          "pitch": 2.6,
          "roll": 1.6
        },
        "distanceCm": 144,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:22:58",
        "phase": "Turning",
        "fsr": {
          "forefoot": 3337,
          "midfoot": 1288,
          "hindfoot": 444
        },
        "accel": {
          "x": -0.32,
          "y": 0.18,
          "z": 1.3
        },
        "gyro": {
          "x": 37.3,
          "y": 20.6,
          "z": 27.1
        },
        "orientation": {
          "pitch": 4.7,
          "roll": 9.6
        },
        "distanceCm": 118,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:23:03",
        "phase": "Swing",
        "fsr": {
          "forefoot": 129,
          "midfoot": 97,
          "hindfoot": 63
        },
        "accel": {
          "x": 0.25,
          "y": 0.24,
          "z": 1.09
        },
        "gyro": {
          "x": 22.2,
          "y": 9.3,
          "z": 15.9
        },
        "orientation": {
          "pitch": -7.7,
          "roll": 3.1
        },
        "distanceCm": 147,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:23:10",
        "phase": "Turning",
        "fsr": {
          "forefoot": 651,
          "midfoot": 735,
          "hindfoot": 3892
        },
        "accel": {
          "x": 0.62,
          "y": 0.34,
          "z": 1.4
        },
        "gyro": {
          "x": 40.1,
          "y": 21.6,
          "z": 37.2
        },
        "orientation": {
          "pitch": 6.4,
          "roll": 8.3
        },
        "distanceCm": 93,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:23:17",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1534,
          "midfoot": 2230,
          "hindfoot": 2541
        },
        "accel": {
          "x": 0.18,
          "y": 0.08,
          "z": 1.14
        },
        "gyro": {
          "x": 9.7,
          "y": 7.2,
          "z": 5.4
        },
        "orientation": {
          "pitch": 3.2,
          "roll": 1.7
        },
        "distanceCm": 148,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:23:20",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 3604,
          "midfoot": 1369,
          "hindfoot": 401
        },
        "accel": {
          "x": 0.1,
          "y": -0.06,
          "z": 1.1
        },
        "gyro": {
          "x": 9.1,
          "y": 4.2,
          "z": 2.8
        },
        "orientation": {
          "pitch": -5.1,
          "roll": 2.4
        },
        "distanceCm": 172,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:23:26",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 611,
          "midfoot": 864,
          "hindfoot": 3312
        },
        "accel": {
          "x": 0.32,
          "y": 0.17,
          "z": 1.21
        },
        "gyro": {
          "x": 22.8,
          "y": 13.6,
          "z": 16.1
        },
        "orientation": {
          "pitch": 4.5,
          "roll": 2.8
        },
        "distanceCm": 112,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 7,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P3",
    "name": "Reeti",
    "sex": "Female",
    "age": 21,
    "heightCm": 161,
    "weightKg": 53,
    "bmi": 20.45,
    "bmiCategory": "Normal",
    "footSize": 5,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "09:13:00",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 280,
          "midfoot": 439,
          "hindfoot": 2551
        },
        "accel": {
          "x": 0.09,
          "y": 0.05,
          "z": 1.03
        },
        "gyro": {
          "x": 4.6,
          "y": 1.8,
          "z": 2.2
        },
        "orientation": {
          "pitch": 2.9,
          "roll": 1.1
        },
        "distanceCm": 237,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:13:08",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 971,
          "midfoot": 1559,
          "hindfoot": 2183
        },
        "accel": {
          "x": 0.05,
          "y": -0.03,
          "z": 0.99
        },
        "gyro": {
          "x": 1.9,
          "y": 0.5,
          "z": 1.1
        },
        "orientation": {
          "pitch": 1.5,
          "roll": 0.8
        },
        "distanceCm": 211,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:13:14",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1905,
          "midfoot": 1830,
          "hindfoot": 1191
        },
        "accel": {
          "x": 0.02,
          "y": 0.05,
          "z": 1.05
        },
        "gyro": {
          "x": 1.7,
          "y": -0.2,
          "z": 0.1
        },
        "orientation": {
          "pitch": 0.9,
          "roll": 0.5
        },
        "distanceCm": 176,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:13:23",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2893,
          "midfoot": 1090,
          "hindfoot": 272
        },
        "accel": {
          "x": -0.13,
          "y": 0.07,
          "z": 1.11
        },
        "gyro": {
          "x": 8.3,
          "y": 3.4,
          "z": 4.2
        },
        "orientation": {
          "pitch": -6.1,
          "roll": 1.9
        },
        "distanceCm": 174,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:13:30",
        "phase": "Swing",
        "fsr": {
          "forefoot": 101,
          "midfoot": 58,
          "hindfoot": 45
        },
        "accel": {
          "x": 0.04,
          "y": 0.05,
          "z": 0.97
        },
        "gyro": {
          "x": 16.5,
          "y": 4.4,
          "z": 6.4
        },
        "orientation": {
          "pitch": -10.4,
          "roll": 2.3
        },
        "distanceCm": 169,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:13:38",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 311,
          "midfoot": 514,
          "hindfoot": 2699
        },
        "accel": {
          "x": 0.09,
          "y": 0.06,
          "z": 1.04
        },
        "gyro": {
          "x": 5.3,
          "y": 2.1,
          "z": 2.4
        },
        "orientation": {
          "pitch": 3.5,
          "roll": 1.2
        },
        "distanceCm": 230,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:13:43",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1052,
          "midfoot": 1570,
          "hindfoot": 2202
        },
        "accel": {
          "x": 0.01,
          "y": -0.01,
          "z": 1.0
        },
        "gyro": {
          "x": 2.4,
          "y": 1.2,
          "z": 0.6
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.6
        },
        "distanceCm": 227,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:13:53",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 3128,
          "midfoot": 1008,
          "hindfoot": 239
        },
        "accel": {
          "x": -0.1,
          "y": 0.05,
          "z": 1.08
        },
        "gyro": {
          "x": 10.4,
          "y": 3.5,
          "z": 4.6
        },
        "orientation": {
          "pitch": -6.8,
          "roll": 1.8
        },
        "distanceCm": 210,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 7,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P4",
    "name": "Jasmine",
    "sex": "Female",
    "age": 20,
    "heightCm": 165,
    "weightKg": 56,
    "bmi": 20.57,
    "bmiCategory": "Normal",
    "footSize": 6,
    "testedOn": "13 Oct 2026",
    "scenario": "Standing, weight shifting",
    "readings": [
      {
        "t": "09:49:59",
        "phase": "Standing",
        "fsr": {
          "forefoot": 994,
          "midfoot": 820,
          "hindfoot": 1557
        },
        "accel": {
          "x": 0.0,
          "y": 0.02,
          "z": 0.98
        },
        "gyro": {
          "x": 1.0,
          "y": 0.3,
          "z": 0.4
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.4
        },
        "distanceCm": 302,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:50:10",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1148,
          "midfoot": 969,
          "hindfoot": 1692
        },
        "accel": {
          "x": 0.01,
          "y": 0.02,
          "z": 0.98
        },
        "gyro": {
          "x": 0.8,
          "y": 1.0,
          "z": 0.5
        },
        "orientation": {
          "pitch": 1.1,
          "roll": 0.7
        },
        "distanceCm": 349,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:50:20",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1161,
          "midfoot": 953,
          "hindfoot": 1804
        },
        "accel": {
          "x": 0.01,
          "y": 0.02,
          "z": 1.0
        },
        "gyro": {
          "x": 0.3,
          "y": 0.5,
          "z": 0.4
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.3
        },
        "distanceCm": 299,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:50:35",
        "phase": "Weight shift",
        "fsr": {
          "forefoot": 1316,
          "midfoot": 937,
          "hindfoot": 1612
        },
        "accel": {
          "x": 0.04,
          "y": 0.04,
          "z": 1.0
        },
        "gyro": {
          "x": 2.3,
          "y": 1.0,
          "z": 1.2
        },
        "orientation": {
          "pitch": 1.8,
          "roll": 0.9
        },
        "distanceCm": 307,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:50:45",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1270,
          "midfoot": 842,
          "hindfoot": 1740
        },
        "accel": {
          "x": 0.01,
          "y": 0.04,
          "z": 0.98
        },
        "gyro": {
          "x": 0.2,
          "y": 0.7,
          "z": 0.1
        },
        "orientation": {
          "pitch": 1.0,
          "roll": 0.4
        },
        "distanceCm": 288,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:50:53",
        "phase": "Weight shift",
        "fsr": {
          "forefoot": 1423,
          "midfoot": 1098,
          "hindfoot": 1618
        },
        "accel": {
          "x": 0.05,
          "y": 0.03,
          "z": 0.99
        },
        "gyro": {
          "x": 2.2,
          "y": 1.9,
          "z": 1.2
        },
        "orientation": {
          "pitch": 1.9,
          "roll": 1.0
        },
        "distanceCm": 316,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:51:07",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1143,
          "midfoot": 799,
          "hindfoot": 1614
        },
        "accel": {
          "x": 0.02,
          "y": 0.0,
          "z": 1.0
        },
        "gyro": {
          "x": 0.2,
          "y": 0.1,
          "z": 1.0
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.5
        },
        "distanceCm": 324,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "09:51:18",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1132,
          "midfoot": 884,
          "hindfoot": 1712
        },
        "accel": {
          "x": 0.0,
          "y": 0.03,
          "z": 1.02
        },
        "gyro": {
          "x": 1.4,
          "y": 0.3,
          "z": 0.5
        },
        "orientation": {
          "pitch": 1.1,
          "roll": 0.4
        },
        "distanceCm": 353,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 3,
          "fix": false
        }
      }
    ]
  },
  {
    "id": "P5",
    "name": "Daksh Jain",
    "sex": "Male",
    "age": 20,
    "heightCm": 172,
    "weightKg": 64,
    "bmi": 21.63,
    "bmiCategory": "Normal",
    "footSize": 8,
    "testedOn": "13 Oct 2026",
    "scenario": "Staged stumble (demo only)",
    "readings": [
      {
        "t": "09:37:52",
        "phase": "Walking",
        "fsr": {
          "forefoot": 634,
          "midfoot": 769,
          "hindfoot": 3220
        },
        "accel": {
          "x": 0.08,
          "y": 0.04,
          "z": 1.03
        },
        "gyro": {
          "x": 6.0,
          "y": 3.3,
          "z": 4.0
        },
        "orientation": {
          "pitch": 2.8,
          "roll": 1.1
        },
        "distanceCm": 116,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:37:58",
        "phase": "Walking",
        "fsr": {
          "forefoot": 1487,
          "midfoot": 1850,
          "hindfoot": 2423
        },
        "accel": {
          "x": 0.12,
          "y": 0.08,
          "z": 1.06
        },
        "gyro": {
          "x": 9.1,
          "y": 4.9,
          "z": 6.0
        },
        "orientation": {
          "pitch": 3.4,
          "roll": 1.5
        },
        "distanceCm": 102,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 5,
          "fix": true
        }
      },
      {
        "t": "09:38:04",
        "phase": "Trip begins",
        "fsr": {
          "forefoot": 4084,
          "midfoot": 1221,
          "hindfoot": 119
        },
        "accel": {
          "x": 0.88,
          "y": 0.43,
          "z": 1.62
        },
        "gyro": {
          "x": 45.9,
          "y": 27.3,
          "z": 38.9
        },
        "orientation": {
          "pitch": 13.8,
          "roll": 9.2
        },
        "distanceCm": 63,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 5,
          "fix": true
        }
      },
      {
        "t": "09:38:11",
        "phase": "Stumble peak",
        "fsr": {
          "forefoot": 3684,
          "midfoot": 2717,
          "hindfoot": 374
        },
        "accel": {
          "x": 1.63,
          "y": -0.95,
          "z": 2.31
        },
        "gyro": {
          "x": 90.0,
          "y": 60.6,
          "z": 72.9
        },
        "orientation": {
          "pitch": 21.0,
          "roll": 12.0
        },
        "distanceCm": 39,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 5,
          "fix": true
        }
      },
      {
        "t": "09:38:14",
        "phase": "Recovery",
        "fsr": {
          "forefoot": 2161,
          "midfoot": 2450,
          "hindfoot": 1902
        },
        "accel": {
          "x": 0.54,
          "y": 0.32,
          "z": 1.4
        },
        "gyro": {
          "x": 30.9,
          "y": 18.1,
          "z": 22.2
        },
        "orientation": {
          "pitch": 8.8,
          "roll": 6.3
        },
        "distanceCm": 40,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:38:18",
        "phase": "Steadying",
        "fsr": {
          "forefoot": 1458,
          "midfoot": 1583,
          "hindfoot": 2136
        },
        "accel": {
          "x": 0.14,
          "y": 0.07,
          "z": 1.13
        },
        "gyro": {
          "x": 8.1,
          "y": 4.9,
          "z": 5.0
        },
        "orientation": {
          "pitch": 4.2,
          "roll": 2.6
        },
        "distanceCm": 73,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:38:29",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1183,
          "midfoot": 950,
          "hindfoot": 1741
        },
        "accel": {
          "x": 0.0,
          "y": 0.04,
          "z": 1.02
        },
        "gyro": {
          "x": 1.3,
          "y": 0.9,
          "z": 0.9
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.8
        },
        "distanceCm": 158,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 5,
          "fix": true
        }
      },
      {
        "t": "09:38:41",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1147,
          "midfoot": 904,
          "hindfoot": 1693
        },
        "accel": {
          "x": 0.02,
          "y": 0.03,
          "z": 0.98
        },
        "gyro": {
          "x": 0.4,
          "y": 0.9,
          "z": 0.2
        },
        "orientation": {
          "pitch": 0.9,
          "roll": 0.5
        },
        "distanceCm": 161,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 6,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P6",
    "name": "Sudeep",
    "sex": "Male",
    "age": 22,
    "heightCm": 176,
    "weightKg": 70,
    "bmi": 22.6,
    "bmiCategory": "Normal",
    "footSize": 9,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "09:07:20",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 343,
          "midfoot": 453,
          "hindfoot": 2575
        },
        "accel": {
          "x": 0.07,
          "y": 0.06,
          "z": 1.04
        },
        "gyro": {
          "x": 4.8,
          "y": 1.0,
          "z": 2.4
        },
        "orientation": {
          "pitch": 3.5,
          "roll": 1.1
        },
        "distanceCm": 216,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:07:26",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1077,
          "midfoot": 1567,
          "hindfoot": 2190
        },
        "accel": {
          "x": 0.04,
          "y": -0.04,
          "z": 1.0
        },
        "gyro": {
          "x": 1.1,
          "y": 0.6,
          "z": 1.5
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.8
        },
        "distanceCm": 209,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:07:32",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1832,
          "midfoot": 1718,
          "hindfoot": 1013
        },
        "accel": {
          "x": 0.02,
          "y": 0.04,
          "z": 1.06
        },
        "gyro": {
          "x": 1.9,
          "y": -0.6,
          "z": 0.1
        },
        "orientation": {
          "pitch": 0.9,
          "roll": 0.5
        },
        "distanceCm": 205,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:07:43",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2869,
          "midfoot": 1094,
          "hindfoot": 267
        },
        "accel": {
          "x": -0.13,
          "y": 0.06,
          "z": 1.14
        },
        "gyro": {
          "x": 9.5,
          "y": 3.4,
          "z": 4.1
        },
        "orientation": {
          "pitch": -6.9,
          "roll": 2.1
        },
        "distanceCm": 178,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:07:51",
        "phase": "Swing",
        "fsr": {
          "forefoot": 91,
          "midfoot": 56,
          "hindfoot": 38
        },
        "accel": {
          "x": 0.06,
          "y": 0.01,
          "z": 0.96
        },
        "gyro": {
          "x": 14.7,
          "y": 4.6,
          "z": 6.0
        },
        "orientation": {
          "pitch": -10.4,
          "roll": 2.6
        },
        "distanceCm": 168,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:07:59",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 346,
          "midfoot": 478,
          "hindfoot": 2958
        },
        "accel": {
          "x": 0.12,
          "y": 0.06,
          "z": 1.04
        },
        "gyro": {
          "x": 5.3,
          "y": 2.1,
          "z": 1.9
        },
        "orientation": {
          "pitch": 3.5,
          "roll": 1.0
        },
        "distanceCm": 238,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:08:04",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 980,
          "midfoot": 1488,
          "hindfoot": 2221
        },
        "accel": {
          "x": 0.04,
          "y": -0.01,
          "z": 0.99
        },
        "gyro": {
          "x": 2.2,
          "y": 0.4,
          "z": 1.6
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.8
        },
        "distanceCm": 224,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:08:13",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2675,
          "midfoot": 978,
          "hindfoot": 229
        },
        "accel": {
          "x": -0.09,
          "y": 0.04,
          "z": 1.07
        },
        "gyro": {
          "x": 10.7,
          "y": 4.1,
          "z": 3.2
        },
        "orientation": {
          "pitch": -7.0,
          "roll": 2.2
        },
        "distanceCm": 185,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 8,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P7",
    "name": "Dhairya",
    "sex": "Male",
    "age": 21,
    "heightCm": 170,
    "weightKg": 62,
    "bmi": 21.45,
    "bmiCategory": "Normal",
    "footSize": 8,
    "testedOn": "13 Oct 2026",
    "scenario": "Brisk walk with a turn",
    "readings": [
      {
        "t": "08:40:08",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 640,
          "midfoot": 815,
          "hindfoot": 3152
        },
        "accel": {
          "x": 0.2,
          "y": 0.11,
          "z": 1.17
        },
        "gyro": {
          "x": 17.5,
          "y": 11.0,
          "z": 10.0
        },
        "orientation": {
          "pitch": 4.6,
          "roll": 1.9
        },
        "distanceCm": 166,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:40:14",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1517,
          "midfoot": 2367,
          "hindfoot": 3227
        },
        "accel": {
          "x": 0.19,
          "y": -0.07,
          "z": 1.13
        },
        "gyro": {
          "x": 12.2,
          "y": 8.3,
          "z": 6.4
        },
        "orientation": {
          "pitch": 2.6,
          "roll": 1.7
        },
        "distanceCm": 141,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:40:20",
        "phase": "Turning",
        "fsr": {
          "forefoot": 3428,
          "midfoot": 1241,
          "hindfoot": 443
        },
        "accel": {
          "x": -0.34,
          "y": 0.2,
          "z": 1.31
        },
        "gyro": {
          "x": 30.0,
          "y": 20.9,
          "z": 23.4
        },
        "orientation": {
          "pitch": 5.7,
          "roll": 9.5
        },
        "distanceCm": 132,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:25",
        "phase": "Swing",
        "fsr": {
          "forefoot": 130,
          "midfoot": 90,
          "hindfoot": 53
        },
        "accel": {
          "x": 0.25,
          "y": 0.23,
          "z": 1.1
        },
        "gyro": {
          "x": 18.4,
          "y": 10.4,
          "z": 17.1
        },
        "orientation": {
          "pitch": -7.2,
          "roll": 3.2
        },
        "distanceCm": 169,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:40:35",
        "phase": "Turning",
        "fsr": {
          "forefoot": 761,
          "midfoot": 813,
          "hindfoot": 3469
        },
        "accel": {
          "x": 0.62,
          "y": 0.36,
          "z": 1.4
        },
        "gyro": {
          "x": 36.5,
          "y": 18.6,
          "z": 34.9
        },
        "orientation": {
          "pitch": 5.7,
          "roll": 8.7
        },
        "distanceCm": 88,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:40:42",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1521,
          "midfoot": 2444,
          "hindfoot": 2612
        },
        "accel": {
          "x": 0.18,
          "y": 0.09,
          "z": 1.16
        },
        "gyro": {
          "x": 12.1,
          "y": 7.8,
          "z": 5.9
        },
        "orientation": {
          "pitch": 2.9,
          "roll": 2.0
        },
        "distanceCm": 136,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:47",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 3058,
          "midfoot": 1249,
          "hindfoot": 416
        },
        "accel": {
          "x": 0.11,
          "y": -0.06,
          "z": 1.09
        },
        "gyro": {
          "x": 8.7,
          "y": 3.9,
          "z": 2.7
        },
        "orientation": {
          "pitch": -5.4,
          "roll": 2.2
        },
        "distanceCm": 157,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:54",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 656,
          "midfoot": 848,
          "hindfoot": 3625
        },
        "accel": {
          "x": 0.31,
          "y": 0.17,
          "z": 1.21
        },
        "gyro": {
          "x": 25.9,
          "y": 12.2,
          "z": 15.2
        },
        "orientation": {
          "pitch": 4.2,
          "roll": 3.3
        },
        "distanceCm": 126,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 8,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P8",
    "name": "Sanjana",
    "sex": "Female",
    "age": 20,
    "heightCm": 158,
    "weightKg": 50,
    "bmi": 20.03,
    "bmiCategory": "Normal",
    "footSize": 5,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "09:16:10",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 295,
          "midfoot": 446,
          "hindfoot": 2563
        },
        "accel": {
          "x": 0.07,
          "y": 0.04,
          "z": 1.02
        },
        "gyro": {
          "x": 4.0,
          "y": 0.9,
          "z": 1.8
        },
        "orientation": {
          "pitch": 3.3,
          "roll": 1.1
        },
        "distanceCm": 212,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:16:19",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 931,
          "midfoot": 1551,
          "hindfoot": 2064
        },
        "accel": {
          "x": 0.05,
          "y": -0.02,
          "z": 0.96
        },
        "gyro": {
          "x": 1.7,
          "y": 0.4,
          "z": 1.2
        },
        "orientation": {
          "pitch": 1.5,
          "roll": 0.8
        },
        "distanceCm": 217,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:16:25",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1659,
          "midfoot": 1721,
          "hindfoot": 991
        },
        "accel": {
          "x": 0.01,
          "y": 0.04,
          "z": 1.05
        },
        "gyro": {
          "x": 2.3,
          "y": -1.1,
          "z": 0.6
        },
        "orientation": {
          "pitch": 0.9,
          "roll": 0.5
        },
        "distanceCm": 173,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:16:33",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2548,
          "midfoot": 1062,
          "hindfoot": 237
        },
        "accel": {
          "x": -0.11,
          "y": 0.07,
          "z": 1.1
        },
        "gyro": {
          "x": 9.4,
          "y": 3.1,
          "z": 4.3
        },
        "orientation": {
          "pitch": -5.9,
          "roll": 1.9
        },
        "distanceCm": 153,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:16:39",
        "phase": "Swing",
        "fsr": {
          "forefoot": 99,
          "midfoot": 53,
          "hindfoot": 43
        },
        "accel": {
          "x": 0.06,
          "y": 0.01,
          "z": 0.98
        },
        "gyro": {
          "x": 14.0,
          "y": 5.3,
          "z": 6.7
        },
        "orientation": {
          "pitch": -10.8,
          "roll": 2.4
        },
        "distanceCm": 167,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:16:48",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 389,
          "midfoot": 431,
          "hindfoot": 2868
        },
        "accel": {
          "x": 0.11,
          "y": 0.05,
          "z": 1.04
        },
        "gyro": {
          "x": 5.3,
          "y": 1.1,
          "z": 1.6
        },
        "orientation": {
          "pitch": 3.4,
          "roll": 1.1
        },
        "distanceCm": 225,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:16:53",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 960,
          "midfoot": 1326,
          "hindfoot": 2396
        },
        "accel": {
          "x": 0.01,
          "y": -0.03,
          "z": 1.0
        },
        "gyro": {
          "x": 2.1,
          "y": 0.4,
          "z": 1.1
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.7
        },
        "distanceCm": 237,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:17:04",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 3059,
          "midfoot": 1044,
          "hindfoot": 253
        },
        "accel": {
          "x": -0.1,
          "y": 0.07,
          "z": 1.09
        },
        "gyro": {
          "x": 10.2,
          "y": 3.1,
          "z": 3.1
        },
        "orientation": {
          "pitch": -6.4,
          "roll": 2.1
        },
        "distanceCm": 215,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 6,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P9",
    "name": "Aniket",
    "sex": "Male",
    "age": 21,
    "heightCm": 180,
    "weightKg": 76,
    "bmi": 23.46,
    "bmiCategory": "Normal",
    "footSize": 9,
    "testedOn": "13 Oct 2026",
    "scenario": "Seated, resting",
    "readings": [
      {
        "t": "10:26:49",
        "phase": "Seated",
        "fsr": {
          "forefoot": 186,
          "midfoot": 150,
          "hindfoot": 259
        },
        "accel": {
          "x": -0.01,
          "y": 0.01,
          "z": 1.0
        },
        "gyro": {
          "x": -0.3,
          "y": 0.0,
          "z": 0.2
        },
        "orientation": {
          "pitch": 13.8,
          "roll": 2.7
        },
        "distanceCm": 44,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:27:04",
        "phase": "Seated",
        "fsr": {
          "forefoot": 172,
          "midfoot": 130,
          "hindfoot": 240
        },
        "accel": {
          "x": 0.01,
          "y": 0.03,
          "z": 0.99
        },
        "gyro": {
          "x": 0.6,
          "y": 0.2,
          "z": 0.0
        },
        "orientation": {
          "pitch": 10.8,
          "roll": 3.3
        },
        "distanceCm": 49,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:27:25",
        "phase": "Seated",
        "fsr": {
          "forefoot": 214,
          "midfoot": 133,
          "hindfoot": 308
        },
        "accel": {
          "x": 0.0,
          "y": 0.03,
          "z": 1.0
        },
        "gyro": {
          "x": 1.2,
          "y": 0.1,
          "z": 0.0
        },
        "orientation": {
          "pitch": 13.9,
          "roll": 3.1
        },
        "distanceCm": 49,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:27:43",
        "phase": "Foot shift",
        "fsr": {
          "forefoot": 387,
          "midfoot": 277,
          "hindfoot": 336
        },
        "accel": {
          "x": 0.05,
          "y": 0.02,
          "z": 1.01
        },
        "gyro": {
          "x": 3.2,
          "y": 1.5,
          "z": 1.5
        },
        "orientation": {
          "pitch": 9.8,
          "roll": 3.4
        },
        "distanceCm": 65,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:28:08",
        "phase": "Seated",
        "fsr": {
          "forefoot": 184,
          "midfoot": 138,
          "hindfoot": 223
        },
        "accel": {
          "x": 0.0,
          "y": 0.03,
          "z": 1.02
        },
        "gyro": {
          "x": 0.2,
          "y": -0.1,
          "z": -0.9
        },
        "orientation": {
          "pitch": 12.4,
          "roll": 2.7
        },
        "distanceCm": 72,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:28:28",
        "phase": "Seated",
        "fsr": {
          "forefoot": 210,
          "midfoot": 151,
          "hindfoot": 274
        },
        "accel": {
          "x": 0.0,
          "y": -0.01,
          "z": 1.0
        },
        "gyro": {
          "x": 0.3,
          "y": 0.8,
          "z": 0.1
        },
        "orientation": {
          "pitch": 12.3,
          "roll": 2.8
        },
        "distanceCm": 61,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:28:45",
        "phase": "Seated",
        "fsr": {
          "forefoot": 186,
          "midfoot": 133,
          "hindfoot": 242
        },
        "accel": {
          "x": 0.01,
          "y": 0.02,
          "z": 1.02
        },
        "gyro": {
          "x": 0.4,
          "y": -0.1,
          "z": -0.1
        },
        "orientation": {
          "pitch": 13.7,
          "roll": 3.3
        },
        "distanceCm": 58,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:29:06",
        "phase": "Seated",
        "fsr": {
          "forefoot": 216,
          "midfoot": 124,
          "hindfoot": 283
        },
        "accel": {
          "x": 0.01,
          "y": 0.0,
          "z": 1.0
        },
        "gyro": {
          "x": 0.3,
          "y": 1.2,
          "z": -0.4
        },
        "orientation": {
          "pitch": 13.2,
          "roll": 2.9
        },
        "distanceCm": 50,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 0,
          "fix": false
        }
      }
    ]
  },
  {
    "id": "P10",
    "name": "Raghav Garg",
    "sex": "Male",
    "age": 21,
    "heightCm": 175,
    "weightKg": 78,
    "bmi": 25.47,
    "bmiCategory": "Overweight",
    "footSize": 9,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "09:03:59",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 276,
          "midfoot": 460,
          "hindfoot": 2991
        },
        "accel": {
          "x": 0.1,
          "y": 0.04,
          "z": 1.04
        },
        "gyro": {
          "x": 4.2,
          "y": 0.9,
          "z": 1.4
        },
        "orientation": {
          "pitch": 3.2,
          "roll": 1.3
        },
        "distanceCm": 236,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:04:08",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1081,
          "midfoot": 1690,
          "hindfoot": 2093
        },
        "accel": {
          "x": 0.05,
          "y": -0.05,
          "z": 0.99
        },
        "gyro": {
          "x": 3.4,
          "y": 0.1,
          "z": 1.3
        },
        "orientation": {
          "pitch": 1.5,
          "roll": 0.9
        },
        "distanceCm": 184,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:04:13",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1887,
          "midfoot": 1763,
          "hindfoot": 1116
        },
        "accel": {
          "x": 0.01,
          "y": 0.03,
          "z": 1.07
        },
        "gyro": {
          "x": 2.2,
          "y": -0.6,
          "z": 0.7
        },
        "orientation": {
          "pitch": 0.9,
          "roll": 0.5
        },
        "distanceCm": 189,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:04:24",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2619,
          "midfoot": 1021,
          "hindfoot": 257
        },
        "accel": {
          "x": -0.11,
          "y": 0.08,
          "z": 1.13
        },
        "gyro": {
          "x": 10.7,
          "y": 2.9,
          "z": 4.0
        },
        "orientation": {
          "pitch": -6.8,
          "roll": 1.8
        },
        "distanceCm": 161,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:04:31",
        "phase": "Swing",
        "fsr": {
          "forefoot": 81,
          "midfoot": 59,
          "hindfoot": 41
        },
        "accel": {
          "x": 0.05,
          "y": 0.02,
          "z": 0.97
        },
        "gyro": {
          "x": 16.3,
          "y": 5.2,
          "z": 5.4
        },
        "orientation": {
          "pitch": -9.2,
          "roll": 2.7
        },
        "distanceCm": 176,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:04:38",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 319,
          "midfoot": 406,
          "hindfoot": 3327
        },
        "accel": {
          "x": 0.09,
          "y": 0.09,
          "z": 1.03
        },
        "gyro": {
          "x": 4.0,
          "y": 2.7,
          "z": 3.2
        },
        "orientation": {
          "pitch": 3.6,
          "roll": 1.1
        },
        "distanceCm": 238,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:04:43",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1072,
          "midfoot": 1376,
          "hindfoot": 2149
        },
        "accel": {
          "x": 0.04,
          "y": -0.03,
          "z": 1.0
        },
        "gyro": {
          "x": 2.9,
          "y": 0.3,
          "z": 1.0
        },
        "orientation": {
          "pitch": 1.3,
          "roll": 0.7
        },
        "distanceCm": 240,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:04:53",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 3133,
          "midfoot": 979,
          "hindfoot": 225
        },
        "accel": {
          "x": -0.1,
          "y": 0.07,
          "z": 1.09
        },
        "gyro": {
          "x": 9.8,
          "y": 3.8,
          "z": 3.9
        },
        "orientation": {
          "pitch": -6.5,
          "roll": 2.2
        },
        "distanceCm": 209,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 7,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P11",
    "name": "Kushal Thakur",
    "sex": "Male",
    "age": 22,
    "heightCm": 183,
    "weightKg": 82,
    "bmi": 24.49,
    "bmiCategory": "Normal",
    "footSize": 10,
    "testedOn": "13 Oct 2026",
    "scenario": "Brisk walk with a turn",
    "readings": [
      {
        "t": "08:39:53",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 605,
          "midfoot": 749,
          "hindfoot": 3068
        },
        "accel": {
          "x": 0.21,
          "y": 0.13,
          "z": 1.19
        },
        "gyro": {
          "x": 18.1,
          "y": 11.6,
          "z": 9.0
        },
        "orientation": {
          "pitch": 4.4,
          "roll": 2.2
        },
        "distanceCm": 141,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:39:59",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1654,
          "midfoot": 2383,
          "hindfoot": 3177
        },
        "accel": {
          "x": 0.15,
          "y": -0.07,
          "z": 1.13
        },
        "gyro": {
          "x": 12.0,
          "y": 8.2,
          "z": 5.8
        },
        "orientation": {
          "pitch": 3.1,
          "roll": 1.7
        },
        "distanceCm": 129,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:07",
        "phase": "Turning",
        "fsr": {
          "forefoot": 3678,
          "midfoot": 1502,
          "hindfoot": 395
        },
        "accel": {
          "x": -0.35,
          "y": 0.18,
          "z": 1.32
        },
        "gyro": {
          "x": 33.6,
          "y": 19.4,
          "z": 28.7
        },
        "orientation": {
          "pitch": 5.7,
          "roll": 8.2
        },
        "distanceCm": 106,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:10",
        "phase": "Swing",
        "fsr": {
          "forefoot": 151,
          "midfoot": 96,
          "hindfoot": 64
        },
        "accel": {
          "x": 0.27,
          "y": 0.25,
          "z": 1.08
        },
        "gyro": {
          "x": 23.2,
          "y": 8.1,
          "z": 13.7
        },
        "orientation": {
          "pitch": -7.1,
          "roll": 3.0
        },
        "distanceCm": 169,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:19",
        "phase": "Turning",
        "fsr": {
          "forefoot": 708,
          "midfoot": 769,
          "hindfoot": 3750
        },
        "accel": {
          "x": 0.62,
          "y": 0.33,
          "z": 1.4
        },
        "gyro": {
          "x": 36.4,
          "y": 19.8,
          "z": 30.4
        },
        "orientation": {
          "pitch": 5.8,
          "roll": 9.3
        },
        "distanceCm": 108,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 9,
          "fix": true
        }
      },
      {
        "t": "08:40:24",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1536,
          "midfoot": 2314,
          "hindfoot": 2979
        },
        "accel": {
          "x": 0.16,
          "y": 0.09,
          "z": 1.13
        },
        "gyro": {
          "x": 10.3,
          "y": 8.0,
          "z": 5.9
        },
        "orientation": {
          "pitch": 2.8,
          "roll": 1.8
        },
        "distanceCm": 129,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:40:27",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 3334,
          "midfoot": 1154,
          "hindfoot": 379
        },
        "accel": {
          "x": 0.14,
          "y": -0.06,
          "z": 1.1
        },
        "gyro": {
          "x": 9.2,
          "y": 4.5,
          "z": 3.2
        },
        "orientation": {
          "pitch": -5.6,
          "roll": 2.0
        },
        "distanceCm": 153,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:40:33",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 662,
          "midfoot": 860,
          "hindfoot": 3254
        },
        "accel": {
          "x": 0.32,
          "y": 0.18,
          "z": 1.24
        },
        "gyro": {
          "x": 24.6,
          "y": 11.0,
          "z": 15.4
        },
        "orientation": {
          "pitch": 4.5,
          "roll": 2.9
        },
        "distanceCm": 140,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 9,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P12",
    "name": "Manjot Singh",
    "sex": "Male",
    "age": 21,
    "heightCm": 177,
    "weightKg": 67,
    "bmi": 21.39,
    "bmiCategory": "Normal",
    "footSize": 9,
    "testedOn": "13 Oct 2026",
    "scenario": "Standing, weight shifting",
    "readings": [
      {
        "t": "10:29:36",
        "phase": "Standing",
        "fsr": {
          "forefoot": 999,
          "midfoot": 909,
          "hindfoot": 1875
        },
        "accel": {
          "x": 0.01,
          "y": 0.02,
          "z": 1.02
        },
        "gyro": {
          "x": -0.1,
          "y": 0.3,
          "z": 0.0
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.4
        },
        "distanceCm": 307,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:29:49",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1186,
          "midfoot": 927,
          "hindfoot": 1556
        },
        "accel": {
          "x": 0.03,
          "y": 0.01,
          "z": 1.01
        },
        "gyro": {
          "x": 1.0,
          "y": -0.1,
          "z": 1.4
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.6
        },
        "distanceCm": 316,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:30:00",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1154,
          "midfoot": 816,
          "hindfoot": 1720
        },
        "accel": {
          "x": 0.02,
          "y": 0.03,
          "z": 1.01
        },
        "gyro": {
          "x": 0.0,
          "y": 0.6,
          "z": 0.4
        },
        "orientation": {
          "pitch": 0.7,
          "roll": 0.3
        },
        "distanceCm": 326,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:30:14",
        "phase": "Weight shift",
        "fsr": {
          "forefoot": 1411,
          "midfoot": 932,
          "hindfoot": 1459
        },
        "accel": {
          "x": 0.04,
          "y": 0.02,
          "z": 1.0
        },
        "gyro": {
          "x": 2.2,
          "y": 0.8,
          "z": 0.5
        },
        "orientation": {
          "pitch": 1.8,
          "roll": 0.8
        },
        "distanceCm": 319,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:30:26",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1286,
          "midfoot": 876,
          "hindfoot": 1621
        },
        "accel": {
          "x": 0.0,
          "y": 0.03,
          "z": 1.0
        },
        "gyro": {
          "x": 0.6,
          "y": 0.1,
          "z": 0.2
        },
        "orientation": {
          "pitch": 1.0,
          "roll": 0.4
        },
        "distanceCm": 292,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:30:33",
        "phase": "Weight shift",
        "fsr": {
          "forefoot": 1351,
          "midfoot": 1031,
          "hindfoot": 1322
        },
        "accel": {
          "x": 0.06,
          "y": 0.05,
          "z": 0.99
        },
        "gyro": {
          "x": 1.5,
          "y": 1.0,
          "z": 1.5
        },
        "orientation": {
          "pitch": 1.9,
          "roll": 1.1
        },
        "distanceCm": 291,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:30:48",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1106,
          "midfoot": 939,
          "hindfoot": 1577
        },
        "accel": {
          "x": 0.02,
          "y": -0.02,
          "z": 1.01
        },
        "gyro": {
          "x": -0.5,
          "y": -0.1,
          "z": -0.1
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.5
        },
        "distanceCm": 323,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 3,
          "fix": false
        }
      },
      {
        "t": "10:30:57",
        "phase": "Standing",
        "fsr": {
          "forefoot": 1253,
          "midfoot": 996,
          "hindfoot": 1713
        },
        "accel": {
          "x": 0.0,
          "y": 0.03,
          "z": 1.01
        },
        "gyro": {
          "x": 0.3,
          "y": 0.5,
          "z": 0.6
        },
        "orientation": {
          "pitch": 1.1,
          "roll": 0.4
        },
        "distanceCm": 348,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 3,
          "fix": false
        }
      }
    ]
  },
  {
    "id": "P13",
    "name": "Tejnoor Singh",
    "sex": "Male",
    "age": 20,
    "heightCm": 173,
    "weightKg": 60,
    "bmi": 20.05,
    "bmiCategory": "Normal",
    "footSize": 8,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "08:51:17",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 286,
          "midfoot": 413,
          "hindfoot": 2558
        },
        "accel": {
          "x": 0.09,
          "y": 0.03,
          "z": 1.03
        },
        "gyro": {
          "x": 3.9,
          "y": 0.7,
          "z": 2.2
        },
        "orientation": {
          "pitch": 2.8,
          "roll": 1.1
        },
        "distanceCm": 227,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "08:51:23",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1053,
          "midfoot": 1641,
          "hindfoot": 2026
        },
        "accel": {
          "x": 0.05,
          "y": -0.04,
          "z": 0.97
        },
        "gyro": {
          "x": 2.0,
          "y": 0.6,
          "z": 1.3
        },
        "orientation": {
          "pitch": 1.4,
          "roll": 0.9
        },
        "distanceCm": 214,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "08:51:30",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1558,
          "midfoot": 1814,
          "hindfoot": 1027
        },
        "accel": {
          "x": 0.02,
          "y": 0.05,
          "z": 1.06
        },
        "gyro": {
          "x": 2.2,
          "y": -0.6,
          "z": 1.5
        },
        "orientation": {
          "pitch": 0.8,
          "roll": 0.5
        },
        "distanceCm": 165,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "08:51:40",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2501,
          "midfoot": 972,
          "hindfoot": 252
        },
        "accel": {
          "x": -0.12,
          "y": 0.1,
          "z": 1.11
        },
        "gyro": {
          "x": 9.6,
          "y": 3.7,
          "z": 4.3
        },
        "orientation": {
          "pitch": -6.7,
          "roll": 1.9
        },
        "distanceCm": 181,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:51:48",
        "phase": "Swing",
        "fsr": {
          "forefoot": 89,
          "midfoot": 61,
          "hindfoot": 36
        },
        "accel": {
          "x": 0.02,
          "y": 0.03,
          "z": 0.97
        },
        "gyro": {
          "x": 13.3,
          "y": 5.2,
          "z": 6.5
        },
        "orientation": {
          "pitch": -10.7,
          "roll": 2.3
        },
        "distanceCm": 167,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:51:56",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 382,
          "midfoot": 440,
          "hindfoot": 2854
        },
        "accel": {
          "x": 0.11,
          "y": 0.05,
          "z": 1.05
        },
        "gyro": {
          "x": 4.8,
          "y": 2.7,
          "z": 3.1
        },
        "orientation": {
          "pitch": 3.1,
          "roll": 1.1
        },
        "distanceCm": 263,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "08:52:01",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1041,
          "midfoot": 1498,
          "hindfoot": 2118
        },
        "accel": {
          "x": 0.02,
          "y": -0.01,
          "z": 1.01
        },
        "gyro": {
          "x": 2.1,
          "y": 0.8,
          "z": 0.6
        },
        "orientation": {
          "pitch": 1.1,
          "roll": 0.7
        },
        "distanceCm": 230,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "08:52:12",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2642,
          "midfoot": 928,
          "hindfoot": 219
        },
        "accel": {
          "x": -0.13,
          "y": 0.05,
          "z": 1.08
        },
        "gyro": {
          "x": 10.5,
          "y": 3.3,
          "z": 4.5
        },
        "orientation": {
          "pitch": -6.3,
          "roll": 2.0
        },
        "distanceCm": 222,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 7,
          "fix": true
        }
      }
    ]
  },
  {
    "id": "P14",
    "name": "Ramit Joshi",
    "sex": "Male",
    "age": 21,
    "heightCm": 169,
    "weightKg": 58,
    "bmi": 20.31,
    "bmiCategory": "Normal",
    "footSize": 7,
    "testedOn": "13 Oct 2026",
    "scenario": "Seated, resting",
    "readings": [
      {
        "t": "10:52:28",
        "phase": "Seated",
        "fsr": {
          "forefoot": 218,
          "midfoot": 140,
          "hindfoot": 264
        },
        "accel": {
          "x": -0.01,
          "y": 0.02,
          "z": 1.01
        },
        "gyro": {
          "x": 0.6,
          "y": 0.0,
          "z": 0.1
        },
        "orientation": {
          "pitch": 12.7,
          "roll": 3.1
        },
        "distanceCm": 52,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:52:42",
        "phase": "Seated",
        "fsr": {
          "forefoot": 212,
          "midfoot": 110,
          "hindfoot": 243
        },
        "accel": {
          "x": 0.01,
          "y": 0.0,
          "z": 1.01
        },
        "gyro": {
          "x": 0.1,
          "y": 0.2,
          "z": 0.5
        },
        "orientation": {
          "pitch": 10.7,
          "roll": 3.6
        },
        "distanceCm": 48,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:53:05",
        "phase": "Seated",
        "fsr": {
          "forefoot": 230,
          "midfoot": 158,
          "hindfoot": 300
        },
        "accel": {
          "x": -0.01,
          "y": 0.03,
          "z": 1.01
        },
        "gyro": {
          "x": 0.4,
          "y": -0.1,
          "z": -0.4
        },
        "orientation": {
          "pitch": 11.1,
          "roll": 2.6
        },
        "distanceCm": 51,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:53:22",
        "phase": "Foot shift",
        "fsr": {
          "forefoot": 465,
          "midfoot": 246,
          "hindfoot": 294
        },
        "accel": {
          "x": 0.04,
          "y": 0.04,
          "z": 1.01
        },
        "gyro": {
          "x": 3.1,
          "y": 1.1,
          "z": 1.2
        },
        "orientation": {
          "pitch": 10.1,
          "roll": 3.6
        },
        "distanceCm": 64,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:53:46",
        "phase": "Seated",
        "fsr": {
          "forefoot": 222,
          "midfoot": 145,
          "hindfoot": 257
        },
        "accel": {
          "x": 0.01,
          "y": 0.0,
          "z": 0.98
        },
        "gyro": {
          "x": -0.1,
          "y": -0.1,
          "z": 0.4
        },
        "orientation": {
          "pitch": 11.4,
          "roll": 2.8
        },
        "distanceCm": 78,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:54:07",
        "phase": "Seated",
        "fsr": {
          "forefoot": 211,
          "midfoot": 157,
          "hindfoot": 267
        },
        "accel": {
          "x": 0.01,
          "y": 0.0,
          "z": 1.01
        },
        "gyro": {
          "x": 0.5,
          "y": 0.1,
          "z": 0.2
        },
        "orientation": {
          "pitch": 13.1,
          "roll": 3.3
        },
        "distanceCm": 63,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:54:26",
        "phase": "Seated",
        "fsr": {
          "forefoot": 225,
          "midfoot": 114,
          "hindfoot": 262
        },
        "accel": {
          "x": -0.01,
          "y": 0.0,
          "z": 1.0
        },
        "gyro": {
          "x": 0.5,
          "y": 0.4,
          "z": 0.5
        },
        "orientation": {
          "pitch": 11.4,
          "roll": 3.4
        },
        "distanceCm": 58,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 0,
          "fix": false
        }
      },
      {
        "t": "10:54:45",
        "phase": "Seated",
        "fsr": {
          "forefoot": 233,
          "midfoot": 122,
          "hindfoot": 255
        },
        "accel": {
          "x": 0.01,
          "y": 0.0,
          "z": 0.99
        },
        "gyro": {
          "x": -0.2,
          "y": -0.4,
          "z": -0.4
        },
        "orientation": {
          "pitch": 11.7,
          "roll": 3.5
        },
        "distanceCm": 53,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 0,
          "fix": false
        }
      }
    ]
  },
  {
    "id": "P15",
    "name": "Kirtan Borana",
    "sex": "Male",
    "age": 22,
    "heightCm": 171,
    "weightKg": 74,
    "bmi": 25.31,
    "bmiCategory": "Overweight",
    "footSize": 8,
    "testedOn": "13 Oct 2026",
    "scenario": "Normal walk",
    "readings": [
      {
        "t": "09:33:09",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 343,
          "midfoot": 465,
          "hindfoot": 3023
        },
        "accel": {
          "x": 0.05,
          "y": 0.04,
          "z": 1.05
        },
        "gyro": {
          "x": 3.8,
          "y": 1.5,
          "z": 1.6
        },
        "orientation": {
          "pitch": 3.3,
          "roll": 1.3
        },
        "distanceCm": 195,
        "gps": {
          "lat": 28.6139,
          "lon": 77.209,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:33:18",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 929,
          "midfoot": 1481,
          "hindfoot": 2405
        },
        "accel": {
          "x": 0.05,
          "y": -0.04,
          "z": 0.98
        },
        "gyro": {
          "x": 2.6,
          "y": 0.7,
          "z": 1.4
        },
        "orientation": {
          "pitch": 1.5,
          "roll": 0.8
        },
        "distanceCm": 181,
        "gps": {
          "lat": 28.613912,
          "lon": 77.209009,
          "sats": 6,
          "fix": true
        }
      },
      {
        "t": "09:33:25",
        "phase": "Mid stance",
        "fsr": {
          "forefoot": 1690,
          "midfoot": 1938,
          "hindfoot": 1196
        },
        "accel": {
          "x": 0.01,
          "y": 0.06,
          "z": 1.05
        },
        "gyro": {
          "x": 1.8,
          "y": -0.6,
          "z": 0.8
        },
        "orientation": {
          "pitch": 0.9,
          "roll": 0.5
        },
        "distanceCm": 186,
        "gps": {
          "lat": 28.613924,
          "lon": 77.209018,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:33:33",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2933,
          "midfoot": 1084,
          "hindfoot": 287
        },
        "accel": {
          "x": -0.13,
          "y": 0.08,
          "z": 1.12
        },
        "gyro": {
          "x": 9.6,
          "y": 3.1,
          "z": 4.5
        },
        "orientation": {
          "pitch": -5.6,
          "roll": 1.8
        },
        "distanceCm": 166,
        "gps": {
          "lat": 28.613936,
          "lon": 77.209027,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:33:40",
        "phase": "Swing",
        "fsr": {
          "forefoot": 82,
          "midfoot": 57,
          "hindfoot": 36
        },
        "accel": {
          "x": 0.02,
          "y": 0.03,
          "z": 0.97
        },
        "gyro": {
          "x": 14.1,
          "y": 4.5,
          "z": 6.1
        },
        "orientation": {
          "pitch": -10.8,
          "roll": 2.5
        },
        "distanceCm": 144,
        "gps": {
          "lat": 28.613948,
          "lon": 77.209036,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:33:50",
        "phase": "Heel strike",
        "fsr": {
          "forefoot": 368,
          "midfoot": 481,
          "hindfoot": 3177
        },
        "accel": {
          "x": 0.12,
          "y": 0.05,
          "z": 1.03
        },
        "gyro": {
          "x": 5.9,
          "y": 2.3,
          "z": 3.0
        },
        "orientation": {
          "pitch": 3.1,
          "roll": 1.0
        },
        "distanceCm": 213,
        "gps": {
          "lat": 28.61396,
          "lon": 77.209045,
          "sats": 7,
          "fix": true
        }
      },
      {
        "t": "09:33:55",
        "phase": "Foot flat",
        "fsr": {
          "forefoot": 1085,
          "midfoot": 1356,
          "hindfoot": 2021
        },
        "accel": {
          "x": 0.05,
          "y": -0.03,
          "z": 0.99
        },
        "gyro": {
          "x": 2.8,
          "y": 0.6,
          "z": 1.4
        },
        "orientation": {
          "pitch": 1.2,
          "roll": 0.8
        },
        "distanceCm": 243,
        "gps": {
          "lat": 28.613972,
          "lon": 77.209054,
          "sats": 8,
          "fix": true
        }
      },
      {
        "t": "09:34:07",
        "phase": "Toe off",
        "fsr": {
          "forefoot": 2478,
          "midfoot": 1044,
          "hindfoot": 242
        },
        "accel": {
          "x": -0.1,
          "y": 0.04,
          "z": 1.1
        },
        "gyro": {
          "x": 10.4,
          "y": 3.1,
          "z": 3.8
        },
        "orientation": {
          "pitch": -5.8,
          "roll": 2.1
        },
        "distanceCm": 186,
        "gps": {
          "lat": 28.613984,
          "lon": 77.209063,
          "sats": 6,
          "fix": true
        }
      }
    ]
  }
];

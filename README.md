# IntelliStride

A student capstone **prototype** for foot-pressure and gait monitoring. It is **not a medical device**, is not certified or clinically validated, and must not be used for diagnosis or treatment.

## Hardware (prototype)
- ESP32 microcontroller
- 3 x FSR (force-sensing resistor) zones: forefoot, midfoot, hindfoot (raw ADC, uncalibrated)
- MPU6050 accelerometer + gyroscope (6-axis)
- GPS module and ultrasonic distance sensor
- Data sent to Firebase Realtime Database

## Web dashboard
Plain HTML, CSS and JavaScript (ES modules), deployed as static files on Vercel.
- Live Telemetry, Fall Risk Analysis (rule-based, prototype thresholds), Live Readings (hard-coded sample data), Session pages, Documentation
- `algorithms.html`: the rule-based algorithm drawn as decision trees

## Setup
Copy `env.example.js` to `env.js` and add your Firebase web config.

## Status
Fall-risk scoring uses engineering-estimate thresholds that still need calibration with real trial data.

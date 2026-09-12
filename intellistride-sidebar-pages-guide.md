# IntelliStride — Sidebar Page Content: Documentation, Hardware & Insoles, Session History

This extends `intellistride-content-fillin-guide.md`. It fills in the three sidebar pages that currently exist only as nav links with no content: **Documentation**, **Hardware & Insoles**, and **Session Analytics** (renamed **Session History** per the earlier guide, since "Patient Roster" was removed). Same rule applies throughout: every claim is either real or explicitly labeled as prototype/placeholder. Visual system follows `DESIGN.md` (daylight/soft maroon theme) — same card patterns, spacing, and type scale as the rest of the site.

---

## PAGE — Documentation

Purpose: a single honest reference page explaining what the system is, how it works, and its current limitations — written for a faculty reviewer or a curious visitor, not a customer.

### Page header
- Title: `Documentation`
- Subhead: `How IntelliStride works, what it currently does, and what's still in progress.`

### Section 1 — Project Overview (card)
- Title: `About This Project`
- Body: `IntelliStride is a capstone engineering project at [University Name] exploring smart assistive footwear. It combines pressure sensing, inertial motion tracking, obstacle detection, and location data into a real-time telemetry dashboard, with an experimental prototype for fall-risk scoring.`
- Include a small "Team" line if you want credit given: `Built by [Name(s)], [Program], [Semester/Year].`

### Section 2 — System Architecture (card, with a simple diagram if feasible)
- Title: `How Data Flows`
- Content: recreate the pipeline from your original spec as a simple horizontal diagram or numbered list:
  `ESP32 + Sensors → Firebase Realtime Database → Web Dashboard → Real-Time Visualization`
- One line per stage:
  1. `ESP32 reads sensor values from FSR, MPU6050, GPS, and ultrasonic modules.`
  2. `Sensor readings are written to Firebase Realtime Database.`
  3. `The web dashboard listens for database changes using Firebase's real-time listeners.`
  4. `New data updates the dashboard instantly, without a page refresh.`

### Section 3 — Hardware Components (card grid, 4 cards — mirrors your original sensor list)
For each, use the real spec, no invented precision:
- **FSR (Force Sensitive Resistors)** — `Measures pressure/force distribution across the foot. Current build: [your real count, e.g. 3] sensors (left, right, total).`
- **MPU6050 (6-Axis IMU)** — `Provides accelerometer (X/Y/Z) and gyroscope (X/Y/Z) readings for motion and orientation tracking.`
- **GPS Module** — `Provides latitude, longitude, and satellite count for location tracking.`
- **Ultrasonic Sensor** — `Measures distance to nearby obstacles for basic collision awareness.`
- If you're not confident on exact model numbers/specs for each, add a line: `Full component list and datasheets: [link to your GitHub repo/BOM]` rather than guessing at specs.

### Section 4 — Current Capabilities vs. Planned Work (two-column table or two card columns)
This replaces the fabricated comparison table from the landing page with something genuinely useful:

| Working Today | In Progress / Planned |
|---|---|
| Real-time FSR, IMU, GPS, and ultrasonic telemetry | Derived gait metrics (cadence, symmetry, stride length) |
| Live Firebase-synced dashboard | On-device fall detection with validated thresholds |
| Prototype fall-risk scoring (simulated/threshold-based) | Calibrated pressure-to-force conversion (kPa) |
| — | Clinical-style PDF session export |

(Adjust rows to match your actual status honestly — this table should update as the project progresses.)

### Section 5 — Limitations & Disclaimers (card, styled like the Fall Risk page's disclaimer block — reuse that exact tone)
- Title: `What This Is — and Isn't`
- Body (model this closely on the Fall Risk page's existing disclaimer, which is already correct): `IntelliStride is a student engineering prototype built for a capstone course. It is not a certified medical device, has not undergone clinical validation, and its fall-risk scoring uses prototype thresholds that require further calibration with real experimental data. Nothing in this system should be used for medical diagnosis or treatment decisions.`

### Section 6 — Links
- `View Source on GitHub` (real repo link)
- `Project Report / Poster` (if you have one)
- `Contact` (your real email, or omit)

---

## PAGE — Hardware & Insoles

Purpose: a technical reference page for the physical build — useful for you during your defense/demo, and honest about build status.

### Page header
- Title: `Hardware & Insoles`
- Subhead: `The physical sensor module and its current build status.`

### Section 1 — Device Status (card, wired to real Firebase System node)
Reuse the card layout style from the Live Telemetry hardware-status cards (the "Left/Right StridePod" pattern), but rename and make it real:
- Title: `IntelliStride Insole Module — [your real device name]`
- Fields, each pulled live from Firebase `/System` node — show "—" with a muted "awaiting data" label (per `DESIGN.md` empty-state rules) when not connected, never a fake number:
  - `Device Status` — online/offline
  - `Battery Level` — only if your ESP32 actually reports this; otherwise remove the field entirely rather than showing a placeholder battery %
  - `Last Update` — real timestamp
  - `Firebase Connection` — connecting/connected/disconnected

### Section 2 — Sensor Breakdown (card grid — one card per sensor, more technical detail than the Documentation page)
For each sensor, include: what it measures, where it's physically mounted, and its current calibration status. Example structure per card:

**FSR Array**
- Measures: `Pressure/force distribution`
- Placement: `[e.g., heel and forefoot, left/right — fill in your real mounting]`
- Units: `Raw ADC (0–4095) — kg/N conversion pending calibration` (matches your original spec's honest placeholder language)
- Status: `Active` / `Not yet wired` / whatever is true

**MPU6050**
- Measures: `Acceleration (X/Y/Z), angular velocity (X/Y/Z)`
- Placement: `[mounting location]`
- Units: `Raw sensor units — g and °/s conversion per datasheet scale factors (±2g, ±250°/s)`
- Status: real status

**GPS Module**
- Measures: `Latitude, longitude, satellite count`
- Placement: `[mounting location]`
- Units: `Decimal degrees`
- Status: real status — note if GPS reception is a known limitation indoors (worth stating honestly, since GPS often doesn't work well indoors, which matters for a footwear demo)

**Ultrasonic Sensor**
- Measures: `Distance to nearest obstacle`
- Placement: `[mounting location, e.g. toe-mounted, forward-facing]`
- Units: `Centimeters`
- Status: real status

### Section 3 — Firmware & Connectivity (card)
- Title: `Firmware & Data Pipeline`
- Content: `ESP32 firmware reads all sensors on a [your real polling interval] cycle and writes values to Firebase Realtime Database over [Wi-Fi/BLE — whichever is real]. No on-device processing is currently performed beyond raw sensor reads.` (Adjust the last sentence once you add any edge processing.)
- Optional: a small code-snippet or pseudocode block showing the real Firebase JSON write structure, for technical credibility during a demo/defense — this is a nice authentic touch since it's real and verifiable, unlike fabricated specs.

### Section 4 — Known Limitations (card — important for a capstone defense, shows engineering maturity)
Bullet list, filled in honestly, e.g.:
- `GPS accuracy is reduced indoors — outdoor testing recommended for location features.`
- `FSR values are currently raw ADC readings; force/pressure calibration (kg or kPa) is planned but not yet implemented.`
- `Battery monitoring is not yet implemented in firmware.`
(Adjust to your real known issues — a documented limitations list reads as more credible to reviewers than pretending everything is finished.)

---

## PAGE — Session History (renamed from "Patient Roster")

Purpose: a list of past demo/test sessions — anonymized, clearly demo-oriented, no fabricated patient identities per the earlier guide.

### Page header
- Title: `Session History`
- Subhead: `Past telemetry sessions recorded during testing and demonstration.`

### Session list (table or card list)
Each row/card represents one real or demo recording session:
- `Session ID` — e.g., `Session 001`, `Session 002` (sequential, generic — not named "patients")
- `Date/Time`
- `Duration`
- `Sensors Active` — e.g., `FSR, IMU` (if GPS/ultrasonic weren't connected that session, don't list them)
- `Notes` — free text, e.g., `Indoor walking test, 10m corridor` or `Firmware v0.3 validation run`
- Action: `View Session` (if you build session playback) — otherwise omit the button until that feature exists.

### Empty state (if no sessions recorded yet)
Per `DESIGN.md` empty-state rules — muted, soft, explicitly labeled, not a broken-looking blank table:
- Icon: simple line icon (e.g., a clock or list icon) in `--color-waiting`
- Text: `No sessions recorded yet. Start a live telemetry session to begin logging.`
- CTA: `Go to Live Telemetry` (links to Tab 2)

### If you don't plan to build session logging/storage at all right now
Simplify this page to a single honest statement instead of an empty feature:
- Title: `Session History`
- Body: `Session logging is a planned feature — the current build focuses on live real-time telemetry. Check back as this feature is developed.`
- CTA: `View Live Telemetry`

This keeps the sidebar link functional and honest rather than leading to a broken or fake-populated page.

---

## Cross-cutting reminders (same as the main content guide)

1. Every field with a real Firebase-connected value must show the `DESIGN.md` waiting-state treatment (muted `--color-waiting` text + explicit "awaiting data" label) when disconnected — never a placeholder number that looks real.
2. No invented precision anywhere on these three pages — sensor counts, units, and calibration status must match your actual hardware exactly, including in the Documentation and Hardware pages where it's tempting to round up.
3. Keep visual consistency with the rest of the site: same card radius (20px), same shadow values, same type scale from `DESIGN.md` — these are reference/utility pages, not a chance to introduce a new visual style.
4. If any field in this document doesn't match your real build (a sensor count, a mounting location, a polling interval), fill in the real value before handing this to Antigravity — every bracketed `[...]` placeholder above needs your actual answer, not Antigravity's guess.

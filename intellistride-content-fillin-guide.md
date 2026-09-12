# IntelliStride — Content & Screen Fill-In Guide for Antigravity

This document tells Antigravity exactly what goes in every tab/screen of the current build (intelli-stride-dashboard.vercel.app). It corrects the site's current framing, which presents fabricated regulatory/clinical claims — this is a semester capstone engineering prototype, not a cleared medical device, and every screen below is rewritten to say that honestly while keeping the same polished structure and visual sophistication.

**Read this first — the one non-negotiable rule:** Nothing on this site claims FDA clearance, ISO certification, HIPAA compliance, real clinical validation, real institutional partnerships, or a real patient/clinician identity, unless and until those things are actually true. Every screen replaces those claims with honest capstone-appropriate language: "engineering prototype," "capstone project," "simulated data for demonstration," "prototype thresholds requiring future validation." This is not a style downgrade — the interior Fall Risk pages already do this correctly (lots of "SIMULATED DATA" and "prototype" labels); we're bringing the landing page and header up to that same honest standard.

---

## TAB 1 — Overview / Landing Page

### Top navigation bar
- Left: **IntelliStride** wordmark only.
- Right nav links: **Overview | Live Telemetry | Fall Risk | Technology | Protocol**
- Remove: the "Dr. Elena Rostova / Clinical Biomechanics" fake login identity block and "Connected: StridePod 4-L/R" status pill from the landing nav — those belong inside the dashboard views (Tabs 2–3) where they're clearly part of a demo session, not the marketing page.
- Replace the top-left eyebrow badge **"FDA-Cleared Class II Medical Biomechanics"** with: **"Engineering Capstone Project — [Your University Name], [Semester/Year]"**

### Hero section
- Eyebrow badge (see above): `Engineering Capstone Project — [University Name]`
- Headline (keep the two-line editorial style, replace the copy):
  `Precision gait telemetry,` / *`captured step by step.`*
- Subhead (replace the clinical-overclaim version):
  `A smart insole system built on ESP32, IMU, and pressure sensing — designed to explore real-time gait and fall-risk monitoring as a student engineering prototype.`
- Primary CTA button: **"Explore Live Telemetry"** (keep the arrow icon, keep this — it's honest, it links to a real page)
- Secondary CTA: replace **"CLINICAL WHITEPAPER (PDF)"** with **"Project Report (PDF)"** — link to your actual capstone report/documentation once written. If no PDF exists yet, either omit this button or link to a project GitHub repo instead.
- **Remove entirely**: the "Validated in Leading Biomechanical Research Centers & Clinical Laboratories" strip with Mayo Clinic / Johns Hopkins / Stanford / Charité logos. None of this is true and it is the single most important fabrication to remove. Replace with nothing, or with an honest strip like: `Built with: ESP32 · MPU6050 · Firebase Realtime Database · Chart.js` — a tech-stack credibility strip instead of a fake institutional one.

### "Engineered Precision" / feature section
Keep the three-card structure and icons, rewrite copy to remove overclaimed specs you haven't actually validated:
- **Card 1 — IMU Sensing** (rename from "Sub-millisecond IMU Arrays"):
  Headline: `Real-Time IMU Sensing`
  Body: `MPU6050 6-axis inertial measurement providing accelerometer and gyroscope data for gait and motion analysis.`
  Stat line: replace `1,000 Hz Internal / 300 Hz BLE` with your **actual** measured sampling rate from the real firmware (state it as "Sampling Rate: [your measured Hz]" — do not invent a number; if you haven't benchmarked it yet, write "Sampling Rate: to be characterized" as a placeholder and flag it for you to fill in).
- **Card 2 — Pressure Sensing** (rename from "Dynamic Plantar Pressure Matrix"):
  Headline: `Foot Pressure Mapping`
  Body: `FSR-based pressure sensing across the insole, tracking left/right/total force distribution during gait.`
  Stat line: replace `128 Bilateral Force Nodes` with your **actual FSR count** (per your spec: 3 FSR sensors, or however many you've actually wired — do not inflate this number).
- **Card 3 — Fall Risk Monitoring** (rename from "Autonomous Anomaly Detection"):
  Headline: `Prototype Fall-Risk Scoring`
  Body: `On-device motion analysis flagging elevated acceleration, angular velocity, and orientation changes — an engineering prototype, not a clinical diagnostic tool.`
  Stat line: replace `99.2% Neurological Fit` (fabricated accuracy claim) with `Status: Prototype — Not Clinically Validated`

### "Seamless Protocol" / 4-step section
Keep the 4-step structure, adjust copy to match real hardware (not "clinical iPad pairing" language):
1. **Attach the Insole** — `Position the FSR/IMU insole module inside the shoe.` (remove "clinical depths / orthotic" language unless that's real)
2. **Connect to Wi-Fi/Firebase** (replace "Zero-Drift BLE Sync" — confirm your actual connectivity method; the earlier spec used Wi-Fi + Firebase, not BLE, so use whichever is true) — `ESP32 connects to Firebase Realtime Database over Wi-Fi.`
3. **Live Telemetry Streaming** — `Continuous sensor data streams to the dashboard in real time.` (this one can stay close to original, it's accurate)
4. **Session Export** — replace "Clinical PDF Reporting / ICD-10 compatible narratives" with `Export session data as CSV/JSON for later analysis.` (only include this step if you actually build export functionality — otherwise remove step 4 and make it a 3-step protocol)

### Comparison table section
**Remove this section entirely**, or replace with something honest and useful instead — e.g., a simple "What this prototype does today vs. what's planned next" two-column roadmap table (Current: real-time FSR/IMU/GPS telemetry, live dashboard — Planned: on-device fall detection, gait classification, clinical-grade validation). Do NOT keep any version of "IntelliStride vs. Traditional Force Plate Laboratory" — that comparison implies a level of validation this project does not have.

### Final CTA section
Replace **"Transform gait rehabilitation into continuous care" / "Request Trial Kit"** (implies a real commercial clinical program) with:
Headline: `Follow the project`
Body: `IntelliStride is an ongoing capstone engineering project exploring assistive gait telemetry.`
CTA: **"View Project on GitHub"** (link to your repo) or **"Contact"** (mailto link) — whichever is real.
Remove: `verified Institutional IRB Support` and `lock HIPAA & GDPR Compliant` badges entirely — these are false compliance claims.

### Footer
- Replace `FDA Class II Medical Device Enclosure Specification. Investigational system calibrated for authorized physical rehabilitation facilities...` with:
  `IntelliStride is a student engineering capstone project. It is a prototype system for educational and research purposes and is not a certified medical device.`
- Remove `ISO 13485 Certified` and `HIPAA Compliant Cloud` badges from the footer entirely.
- Keep the simple nav link groups (Platform / links, Documentation), but point "Compliance & FDA" and "Privacy & HIPAA" links to a single honest "About This Project" page instead, or remove those two links if no such page exists.
- Copyright line: `© 2026 IntelliStride — [Your Name(s)], [University Name] Capstone Project.`

---

## TAB 2 — Live Telemetry

### Sidebar navigation
Keep the icon-based sidebar structure (`speed Live Telemetry`, `crisis_alert Fall Risk Analysis`, etc.) — this is a good, clear pattern. Rename/remove two items:
- `analytics Clinical Analytics` → rename to `analytics Session Analytics` (remove "Clinical")
- `person Patient Roster` → **remove entirely** unless you're actually building multi-user/multi-session support with real people's data, which you should not do for a capstone demo with invented patient identities. If you want a "session list" feature instead, rename it `history Session History` and make it about anonymous demo sessions (Session 1, Session 2), not named "patients."
- Keep `sensors Hardware & Insoles`, `library_books Documentation`, `home Return to Overview`.

### Top device/session bar
- Replace `StridePod Hub 4.2 / Dual wireless insole telemetry synced via 2.4GHz BLE mesh` with your real hardware name, e.g.: `IntelliStride Insole Module v1 — ESP32-based dual-sensor telemetry unit.`
- `Connected: StridePod 4-L/R` → replace with your actual device identifier, e.g. `Connected: ESP32-DevKit-01` or `Device: Not Connected` when genuinely disconnected — this should reflect the real Firebase connection state, not a placeholder.
- `sync Stream Latency: 12ms` — only show this if you're actually measuring it; otherwise remove or replace with `Update Rate: [your real polling/listener interval]`
- `Firebase: Connecting…` — keep, this is honest and matches your real Firebase listener state.
- **Remove entirely**: `Dr. Elena Rostova / Clinical Biomechanics` and `Launch Session` clinician-login block. Replace with a simple, honest session label: `Demo Session — [Date]` and a button labeled `Start Demo Session` or `Connect Device` depending on what it actually does.

### "Active Subject" banner
**Remove entirely** — `Subject #8421 — Marcus Vance (Post-ACL Recon, Wk 6)` is a fabricated patient identity and clinical case, which is not appropriate to present as real. Replace with a neutral session banner:
`LIVE STREAMING — [your real Hz, e.g. 10 Hz]` and a session timer `T+ [elapsed time]`. If you want a "test subject" label for context during demos, use something explicitly fictional/generic like `Test Session — Demo Wearer` rather than a named patient with a fabricated medical history.

### Metric cards (Gait Cadence, Gait Symmetry, Mean Stride, Stance Duration)
These are fine to keep **structurally**, but every number must come from your real computed values, not hardcoded/simulated ones presented as live. Two options:
1. If you have real cadence/symmetry/stride calculations from your sensors — keep the cards, wire them to real Firebase data, and remove any "target range" claims (`Normal target: 110–120 SPM`) unless sourced from a real reference you can cite.
2. If you do NOT yet compute these derived metrics (cadence, symmetry, stride length are non-trivial signal processing, not raw sensor output) — replace this section with your **actual raw sensor readouts** (FSR L/R/total, accelerometer magnitude) clearly labeled as raw data, and add a "Coming soon: derived gait metrics" note. Do not display invented-looking precise numbers (`98.2%`, `1.42 m`) unless they are real computed outputs.

### Bilateral stride / limb visualization
Remove `ACL-R Affected Limb (L)` and `Contralateral Uninjured Limb (R)` labeling — this presumes a real injury case that doesn't exist. If you keep a left/right visual balance indicator, label it simply `Left Foot` / `Right Foot`.

### Plantar Pressure Mapping section
- Remove `SIMULATED DATA` tag inconsistency — if the right foot is simulated and left is "assumed," make this uniformly honest: label the whole section `Pressure Mapping (Prototype — [N] FSR sensor(s) per insole)` matching your real hardware. If you only have single-foot or 3-point FSR data (per your original spec: FSR 1/2/3), do not render a full anatomical heatmap implying dense multi-point sensing you don't have — show the real 3 discrete pressure values with a simple visual (bar/gauge), not a fabricated pressure gradient map.
- Remove specific fabricated stat numbers (`Peak: 318 kPa`, `Contact Area: 118 cm²`) unless your FSR values are actually calibrated to kPa and contact area — if they're raw ADC values, display raw ADC values, clearly labeled, with a note that physical-unit calibration is pending (this matches your original spec's own calibration-placeholder language).

### Kinematic Waveforms section
- `Vertical GRF (% Body Weight)`, `Tibial Shock Acceleration`, `Loading Rate`, `Push-off Impulse` — these are derived biomechanical quantities requiring calibrated force-plate-equivalent data and validated formulas. Unless you have implemented and validated these calculations, **remove this section** and replace with your real raw accelerometer/gyroscope time-series charts (which you do have, per your original spec) — this is not a downgrade, it's the honest and still-impressive version of what you actually built.

### Hardware status cards (Left/Right StridePod)
Keep this structural pattern — it's good and genuinely useful. Rename `StridePod 4-L/4-R` to your actual module naming. Keep Battery/Signal/Temp fields ONLY if your ESP32 firmware actually reports them; remove any field you're not really measuring rather than showing a plausible-looking placeholder number.

### Anomaly Monitor
Keep this pattern but rewrite the copy to remove clinical-diagnostic framing:
- `verified_user Anomaly Monitor` → fine to keep
- Replace `STATUS: NOMINAL / No pathologic gait deviation or asymmetric muscle fatigue detected` with: `STATUS: NORMAL / No threshold-exceeding motion events detected in current session.` — describes what a threshold-based prototype algorithm actually does, without implying medical/pathological diagnosis.

### Orientation & Gyro section
Keep as-is structurally — Yaw/Pitch/Roll from real gyroscope data is honest and matches your spec.

### Auxiliary sensor slot (EMG)
Keep the "Awaiting Signal / Retry Pairing / Skip Sensor" pattern **only if EMG is a real planned future sensor** for your project. If it's not part of your actual roadmap, remove this section — don't advertise hardware capability you don't intend to build, even as "awaiting."

---

## TAB 3 — Fall Risk Analysis

This page is already the most honestly-framed page on the site — it correctly uses "SIMULATED DATA," "prototype," and disclaimers throughout. Keep its structure and tone almost entirely as-is. Only changes:

- Header: `Dr. Elena Rostova / Clinical Biomechanics` → same fix as Tab 2, replace with `Demo Session — [Date]` and remove the fake clinician identity.
- `MPU6050 Fall Monitor` header and `Firebase: Connecting…` — keep, accurate.
- Keep the big **"science SIMULATED DATA — Hardware not connected..."** banner exactly as-is when hardware is genuinely disconnected — this is a model example of honest empty-state design and should be the template for how Tabs 1–2 handle their own fabricated-vs-real distinction.
- Keep the entire **Calibration Details modal** as-is — "Prototype engineering values," "requires further validation using experimental sensor data," "Consult a qualified engineer or clinician before deploying" — this is exactly the right disclaimer language. Reuse this exact tone/pattern for the landing page fixes above.
- Keep `Haptic Feedback` and `Emergency Alert` cards structurally, only if these are real planned/implemented features (buzzer output per your original hardware spec) — if the buzzer/emergency-alert logic isn't implemented yet, keep the cards but ensure they show a genuine "not yet implemented" or "standby" state rather than implying active monitoring that isn't happening.
- Bottom disclaimer block (`Prototype monitoring system... does not constitute a medical diagnosis...`) — keep this **verbatim**. This is the single best piece of copy on the whole site and should be your model for every other page's tone.

---

## Cross-cutting instructions for Antigravity

1. **Search-and-replace pass first**: before any visual work, do a full-site text pass removing every instance of: "FDA," "Clinical," "Class II Medical," "ISO 13485," "HIPAA," "IRB," "Dr. Elena Rostova," "Marcus Vance," "Mayo Clinic," "Johns Hopkins," "Stanford," "Charité," "StridePod" (unless you want to keep this as your actual product/module name — confirm), and any invented precision statistic (e.g., "99.2%," "98.6% R²") that isn't a real measured or cited value.
2. **Every remaining number on the site must be one of two things**: (a) a real value coming from live Firebase data, or (b) explicitly labeled as a prototype/placeholder/simulated value, per the `DESIGN.md` waiting-state rules already defined for this project. No number should look precise and real if it isn't.
3. Apply the visual system from `DESIGN.md` (daylight/soft maroon theme) consistently across all three tabs as you make these content edits — this document is about *content correctness*, the existing `DESIGN.md` still governs colors, type, spacing, and motion.
4. When in doubt about whether a claim, statistic, or feature is "real," default to labeling it explicitly as a prototype/placeholder rather than presenting it as validated fact. This capstone project will be reviewed by faculty — accuracy about what's actually built is worth more than the appearance of a finished commercial product.

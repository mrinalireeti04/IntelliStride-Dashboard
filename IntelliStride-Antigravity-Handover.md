# IntelliStride — Change Brief for Antigravity

**Prepared 13 October 2026 · For the demonstration on 14 October 2026**
**Repo:** `github.com/mrinalireeti04/IntelliStride-Dashboard` (branch `main`) · **Live:** `intelli-stride-dashboard.vercel.app`

This document is the single brief for three pieces of work, plus a fix list:

| Part | What | Priority |
|---|---|---|
| **A** | New **Live Readings** page with hard-coded data for 5 people | Must ship |
| **B** | New standalone **Algorithms** page: the algorithms actually used, drawn as labelled trees | Must ship |
| **C** | **Design audit**: colour clashes, overlaps, layout and formatting faults, each with its fix | P0 items must ship, rest as time allows |
| **D** | **Honesty fixes**: places where the site shows invented values that break the project's own rules | P0 items must ship |

Everything marked **[VERIFIED]** was reproduced by rendering the code in a headless browser, or by running the real code. Everything marked **[CODE-READ]** comes from reading the source and was not rendered. Nothing here is guessed and presented as fact; open questions are in Section 9.

---

## 0. Ground rules for Antigravity (read first)

1. **Stack stays as it is.** Plain HTML, CSS and JavaScript, ES modules, no framework, no build step, deployed as static files on Vercel. Do not introduce React, Tailwind, a bundler or npm dependencies.
2. **Do not touch Firebase behaviour** except where Part D says so. Live Readings and the Algorithms page must work with **no network call to Firebase**.
3. **Honesty rules (from the Master Project Document §8) apply to every new pixel.** This is a student prototype, not a medical device.
   - Every number is either from live Firebase data or is clearly labelled *sample / simulated / prototype / placeholder*.
   - No clinicians, patients, hospitals, certifications, accuracy percentages or made-up specs.
   - Missing values use the waiting style (`--color-waiting` plus a label such as "Awaiting signal"), never a bare `0`, `N/A` or `—`.
   - The alert colour `--color-alert` is used only for confirmed problems.
   - People in the new page are called **participants**, never patients.
4. **Design tokens already exist** in `styles.css` `:root`. Use them. Section 7 lists the few new tokens to add. Keep the daylight / soft-maroon theme; no dark mode.
5. **Fonts in use are Newsreader (serif headings), Inter (UI), JetBrains Mono (numbers).** The Master Document says Fraunces; the live site uses Newsreader. Keep Newsreader.
6. **Do not rewrite working code.** Make the smallest change that meets each item. Where this brief gives exact code, use it.
7. **Keep the verbatim texts:** the "Prototype monitoring system…does not constitute a medical diagnosis" disclaimer and the Calibration Details wording on the Fall Risk page.
8. **After every part, run the acceptance checks** listed at the end of that part.

### 0.1 Current architecture (verified)

- `index.html` (1,557 lines) holds **all views as `<main id="view-…" class="view">`**: `landing`, `dashboard` (Live Telemetry), `fallrisk`, `documentation`, `hardware`, `history`, `analytics`.
- `app.js` is the router. `window.switchView(name)` toggles `.active` on one view, **hides the top `#site-header` on every view except landing**, scrolls to top, and calls `initDashboard()` / `initFallRisk()`.
- `firebase.js` initialises Firebase from the CDN (`gstatic.com/firebasejs/10.12.0`) and `env.js`.
- `fall-risk.js` contains the real scoring engine `fallRiskEngine()` and a demo-data generator.
- `styles.css` is one 1,460-line file with design tokens.
- **The sidebar is copy-pasted six times** in `index.html` (once per view). Anything added to the sidebar must be added to all of them (or fixed once, see C-13).

### 0.2 Files to create and edit

| Action | File | Purpose |
|---|---|---|
| **Create** | `fall-risk-engine.js` | Pure scoring engine moved out of `fall-risk.js` (no Firebase import) |
| **Create** | `live-readings-data.js` | Hard-coded dataset (full file in Appendix 1) |
| **Create** | `live-readings.js` | Rendering and interaction for the new page |
| **Create** | `algorithms.html` | Standalone demonstration page |
| **Create** | `algorithms.css`, `algorithms.js` | Styles and behaviour for that page |
| **Edit** | `index.html` | New view, sidebar link in all views, fixes from Part C and D |
| **Edit** | `app.js` | Register the new view; remove fake-data bindings (Part D) |
| **Edit** | `fall-risk.js` | Import engine from the new module; gauge fix; simulated banner |
| **Edit** | `styles.css` | New component styles and the fixes from Part C |
| **Edit** | `README.md` | Remove the false FDA / clinical claims (D-11) |

---

## PART A — "Live Readings" page

### A.1 Goal

A new dashboard page called **Live Readings** that shows **hard-coded sample readings for 5 people**, dated **13 Oct 2026**, with **different session start times and irregular gaps between readings**, and **different sensor values** per person. Names are placeholders the user will fill in later.

The page uses the same sensors the hardware really has (3 FSR zones, MPU6050, ultrasonic, GPS), and shows a fall-risk score computed by the **real** engine, so the numbers on screen agree with the Fall Risk page's rules.

### A.2 Step 0 — extract the pure engine (required first)

`fall-risk.js` imports `firebase.js`, which initialises Firebase and loads from the CDN. A standalone page and the new view must not depend on that.

1. Create `fall-risk-engine.js`. Move **`FR_CONFIG`** and **`fallRiskEngine()`** into it **unchanged**, both exported. (They are the block from `export const FR_CONFIG` through the end of `fallRiskEngine`, currently lines 17–135 of `fall-risk.js`.)
2. In `fall-risk.js`, delete those blocks and add at the top:
   ```js
   import { FR_CONFIG, fallRiskEngine } from './fall-risk-engine.js';
   export { FR_CONFIG, fallRiskEngine };
   ```
3. Check: the Fall Risk page behaves exactly as before.

### A.3 Navigation

- Sidebar item: **label** `Live Readings`, **icon** `monitor_heart`, `onclick="switchView('livereadings')"`.
- Position: **second**, directly under *Live Telemetry*.
- Add it to **every** sidebar copy (6 in `index.html`) and to the new view's own sidebar.
- In `app.js` add `livereadings: document.getElementById('view-livereadings')` to the `views` object, and in `switchView`: `if (viewName === 'livereadings') initLiveReadings();` (import from `./live-readings.js`; make init idempotent).
- Active state: the sidebar link of the current page must carry `class="sidebar-link active"` (see C-12; today four pages have no highlight).

### A.4 View container

```html
<main id="view-livereadings" class="view">
  <div class="dashboard-layout">
    <aside class="dash-sidebar"> … same sidebar, Live Readings active … </aside>
    <div class="dash-content">
      <div class="dash-topbar"> … </div>
      <div class="dash-scroll"> … </div>
    </div>
  </div>
</main>
```

Styles: `#view-livereadings.active { display:flex; height:100vh; padding-top:0; overflow:hidden; }`
**Do not copy `padding-top: var(--nav-h)`**; that is a bug in the existing dashboard views (C-2).

### A.5 Page layout (top to bottom)

```
┌ topbar ────────────────────────────────────────────────────────────────────────┐
│ [SAMPLE DATA]  [13 Oct 2026 · IST]  [5 participants]                           │
├ banner (always visible) ───────────────────────────────────────────────────────┤
│ ⚗ SAMPLE DATA — hard-coded readings for demonstration. Not from live hardware. │
├ page header card ──────────────────────────────────────────────────────────────┤
│ Live Readings                                    Latest reading per participant │
├ 5 participant cards (click to select) ─────────────────────────────────────────┤
│ [P1] [P2] [P3] [P4] [P5]                                                        │
├ detail panel for the selected participant ─────────────────────────────────────┤
│ timeline of that person's readings (spacing proportional to real time)          │
│ ┌FSR zones┐ ┌IMU────┐ ┌Ultrasonic┐ ┌GPS────┐ ┌Fall-risk┐                        │
├ log table of all 40 readings, filter chips ────────────────────────────────────┤
├ disclaimer (verbatim Fall Risk wording) ───────────────────────────────────────┤
└────────────────────────────────────────────────────────────────────────────────┘
```

Build with existing classes where they exist: `dash-topbar`, `fr-sim-banner` (make it permanently visible with `.visible`), `fr-page-header`, `t2-panel`, `t3-card`, `badge-pill`, `fr-risk-badge`, `fr-events-table`, `fr-disclaimer`.

#### A.5.1 Topbar
- `SAMPLE DATA` pill: `badge-pill blush-badge` (neutral, **not green**: green would imply a live connection).
- Date chip: `13 Oct 2026 · IST`, built from `READINGS_DATE`.
- Count chip: `5 participants`.
- No Firebase badge, no "Connected" text.

#### A.5.2 Participant card (×5, responsive grid `repeat(auto-fit, minmax(220px,1fr))`)
Each card shows, from the participant's **latest** reading by time:

| Element | Content |
|---|---|
| Avatar | 40 px circle, `--color-surface-blush`, text = initials. If the name starts with `[` (placeholder) use the id (`P1`…) |
| Name | `name` from data, serif, 1rem |
| Scenario chip | e.g. "Normal walk" (`badge-sm`) |
| Session window | `09:14:06 → 09:14:56` (first → last reading time) in mono |
| Risk | `fr-risk-badge` (LOW / MODERATE / HIGH) plus the score as `42 / 100` |
| Mini FSR | three thin vertical bars (forefoot, midfoot, hindfoot), single maroon hue, height = value / 4095 |
| Ultrasonic chip | status from A.7 |
| GPS chip | `Fix · 7 sats` or `Awaiting signal` (waiting style) |

Selected card: 2 px `--color-primary` outline plus `--shadow-hero`. Default selection: **P1**. Cards are `<button>` elements (keyboard focusable, `aria-pressed`).

#### A.5.3 Detail panel (selected participant)

**Timeline (top of panel).** A horizontal axis from the participant's first to last reading. One dot per reading placed at a **position proportional to its real time**, so irregular gaps are visible (this is how the "variable timings" requirement is shown). Selected dot is filled maroon with its `HH:MM:SS` above; others are hollow. Click or arrow keys move the selection. Default selected = latest reading. Under the axis show the phase label ("Heel strike").

**Five sub-cards** (CSS grid, `repeat(auto-fit,minmax(240px,1fr))`):

1. **Foot pressure (FSR)**: three horizontal bars (Forefoot / Midfoot / Hindfoot), value printed in mono as raw ADC (e.g. `2860`), scale `0–4095`. Caption: *Raw ADC — not calibrated to force*. A "Total" line (sum). Single maroon hue; **do not use status colours for FSR**.
2. **Motion (MPU6050)**: table Ax/Ay/Az (g, 2 decimals), Gx/Gy/Gz (°/s, 1 decimal), Pitch/Roll (°, 1 decimal). Under it: `|a|` in g (3 decimals), `|ω|` in °/s (1 decimal), Tilt in ° (1 decimal). **Do not show Yaw** (no magnetometer, so it drifts).
3. **Obstacle (ultrasonic)**: big mono distance `212 cm`, status chip (A.7), and a horizontal range bar 0–350 cm with the 50 and 100 cm marks.
4. **Location (GPS)**: lat / lon (6 decimals), satellites, fix state. When `fix:false`: lat and lon rows show `Awaiting signal` in `--color-waiting`, never `0` or `—`. Caption: *Placeholder coordinates*.
5. **Fall-risk (prototype)**: the corrected semicircle gauge (use the C-3 SVG), score, level badge, and the five feature rows from the Fall Risk page (`Acceleration Magnitude`, `Angular Velocity`, `Orientation Tilt`, `Motion Instability`, `Sudden Motion Event`) with `NORMAL / ELEVATED / HIGH / DETECTED / NOT DETECTED`. Caption: *Prototype score — not clinically validated*.

#### A.5.4 Log table
- Title **All readings — 13 Oct 2026**, badge `SAMPLE DATA`.
- **Filter chips:** `All` plus one per participant. Single select, default `All`.
- Columns: **Time · Participant · Phase · FSR F/M/H · \|a\| g · \|ω\| °/s · Tilt ° · Dist cm · GPS · Score · Level**.
- Default order: **by time ascending across all participants**. This interleaves people and makes the different start times obvious.
- Row click selects that reading and its participant and scrolls the detail panel into view.
- Selected row: background `--color-surface-blush`.
- Wrap in `.fr-events-table-wrap` (horizontal scroll on small screens); sticky header.
- Level cell uses `fr-risk-badge` small variant (as in the Fall Risk events table).

#### A.5.5 Footer
Reuse the exact `.fr-disclaimer` block from the Fall Risk page, verbatim.

### A.6 Data

Use the file in **Appendix 1** verbatim as `live-readings-data.js`. It exports `READINGS_DATE`, `DATA_LABEL`, `GPS_ORIGIN` and `PEOPLE` (5 people × 8 readings = 40 readings).

**Names are placeholders**: `[Name 1]` … `[Name 5]`, each marked `// <-- FILL IN`. The user replaces them by editing that file only; nothing else may hard-code names.

**Design of the sample data (what the numbers represent):**

| ID | Scenario | Session start | Gaps between readings (s) | What it shows |
|---|---|---|---|---|
| P1 | Normal walk | 09:14:06 | 7, 5, 9, 6, 8, 5, 10 | Whole gait cycle, heel-dominant at strike, forefoot-dominant at toe-off; score 0–5 (LOW) |
| P2 | Brisk walk with a turn | 08:47:31 | 4, 6, 3, 8, 5, 4, 7 | Higher gyro during turns; one MODERATE reading (65); obstacle 97 cm → CAUTION |
| P3 | Standing, weight shifting | 10:02:18 | 12, 9, 15, 11, 8, 14, 10 | Near-static FSR, all LOW; GPS 3 sats, **no fix** (indoors) |
| P4 | Staged stumble (demo only) | 09:36:52 | 5, 4, 6, 2, 3, 9, 12 | HIGH, a peak that hits the 100 cap, MODERATE recovery; obstacle 64 → 38 cm (TOO CLOSE) |
| P5 | Seated, resting | 10:24:40 | 15, 22, 18, 25, 20, 17, 19 | Very low FSR; shoe tilted ~12.5° (seated); GPS 0 sats; desk 46–71 cm |

All times are **IST (UTC+05:30)** on **2026-10-13** and all fall before the 10:37 message time today. Different people have different start times, session lengths and reading intervals (2 s to 25 s). **P4 must be labelled "(demo only)"** wherever its scenario text appears, because the stumble is staged.

**Date handling.** `READINGS_DATE` is `'2026-10-13'` as requested. Tomorrow's demo would then still read 13 Oct. If the user wants it to read 14 Oct, change that one constant. Do not auto-use `new Date()`.

**Values are illustrative.** Accelerations stay near the prototype baselines (0.9–1.3 g) so they are consistent with the Fall Risk page's thresholds. Real shoe-mounted IMU data will have larger heel-strike spikes. The page must not claim these are measured.

### A.7 Derived values (compute at runtime)

```js
import { fallRiskEngine } from './fall-risk-engine.js';
import { PEOPLE, READINGS_DATE } from './live-readings-data.js';

// Score each person's readings IN ORDER so "sudden change" uses the previous reading.
export function scorePerson(person) {
  let prev = null;
  return person.readings.map(r => {
    const res = fallRiskEngine({
      accel: r.accel, gyro: r.gyro, orientation: r.orientation, prevAccelMag: prev,
    });
    prev = res.accelMag;
    return { ...r, result: res };       // result.score, .level, .features, .accelMag, .gyroMag
  });
}

// Ultrasonic status. Thresholds are PROTOTYPE values (the Master Doc leaves them [TBD]).
export function distanceStatus(cm) {
  if (cm < 50)  return { label: 'TOO CLOSE', tone: 'alert'   };  // only place alert colour is used
  if (cm < 100) return { label: 'CAUTION',   tone: 'warn'    };
  return              { label: 'CLEAR',      tone: 'neutral' };
}

export const fsrTotal = f => f.forefoot + f.midfoot + f.hindfoot;
```

- Sort key for the log: `READINGS_DATE + 'T' + t`.
- Format time as 24-hour `HH:MM:SS`.
- Show the page's date as `13 Oct 2026` from `READINGS_DATE`.

### A.8 States, accessibility, responsive

- **Waiting state** is used for missing GPS; never show a bare zero.
- **Colour rules:** risk level uses the existing green / amber / red classes; ultrasonic `CAUTION` amber, `TOO CLOSE` alert red, `CLEAR` neutral blush; FSR maroon only; nothing else uses red.
- Contrast ≥ 4.5:1 for text (use the corrected muted colour from Section 7).
- Participant cards and chips are real `<button>`s with visible `:focus-visible` outlines.
- Timeline dots are focusable and respond to ← / →.
- ≤ 960 px: cards 2 columns, detail sub-cards 1 column, table scrolls horizontally. The sidebar is hidden at ≤ 960 px, so the page **depends on the mobile navigation fix C-8**.
- No auto-animation; this is a static data page. Only the 200 ms soft fade on selection change (opacity 0.6 → 1), per the design system.

### A.9 Expected values (use as the acceptance table)

These were produced by running the **actual `fallRiskEngine`** from `fall-risk.js` on the Appendix 1 data. The page must show identical scores and levels.

| Person | Time | Phase | FSR F/M/H | \|a\| g | \|ω\| °/s | Tilt ° | Δ≥0.4 | Dist cm | Score | Level |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | 09:14:06 | Heel strike | 310 / 420 / 2860 | 1.02 | 4.8 | 3.3 | – | 212 | 0 | LOW |
| P1 | 09:14:13 | Foot flat | 980 / 1540 / 2210 | 0.99 | 2.6 | 1.6 | – | 198 | 0 | LOW |
| P1 | 09:14:18 | Mid stance | 1720 / 1890 / 1120 | 1.06 | 2.2 | 1.0 | – | 185 | 0 | LOW |
| P1 | 09:14:27 | Toe off | 2740 / 1010 / 260 | 1.12 | 10.9 | 6.5 | – | 171 | 0 | LOW |
| P1 | 09:14:33 | Swing | 90 / 60 / 40 | 0.97 | 16.8 | 10.1 | – | 160 | 5 | LOW |
| P1 | 09:14:41 | Heel strike | 350 / 460 / 3020 | 1.05 | 5.9 | 3.6 | – | 238 | 0 | LOW |
| P1 | 09:14:46 | Foot flat | 1010 / 1480 / 2150 | 1.00 | 2.7 | 1.4 | – | 226 | 0 | LOW |
| P1 | 09:14:56 | Toe off | 2810 / 950 / 240 | 1.10 | 11.3 | 6.8 | – | 204 | 0 | LOW |
| P2 | 08:47:31 | Heel strike | 620 / 740 / 3480 | 1.21 | 23.4 | 4.7 | – | 150 | 8 | LOW |
| P2 | 08:47:35 | Foot flat | 1480 / 2310 / 2890 | 1.13 | 15.3 | 3.2 | – | 132 | 0 | LOW |
| P2 | 08:47:41 | Turning | 3320 / 1380 / 410 | 1.36 | 48.1 | 10.0 | – | 118 | 35 | LOW |
| P2 | 08:47:44 | Swing | 140 / 95 / 60 | 1.15 | 27.3 | 8.1 | – | 164 | 13 | LOW |
| P2 | 08:47:52 | Turning | 700 / 830 / 3610 | 1.57 | 56.0 | 11.2 | yes | 97 | 65 | MODERATE |
| P2 | 08:47:57 | Foot flat | 1560 / 2290 / 2760 | 1.17 | 14.4 | 3.6 | yes | 142 | 15 | LOW |
| P2 | 08:48:01 | Toe off | 3390 / 1290 / 380 | 1.11 | 10.3 | 5.6 | – | 155 | 0 | LOW |
| P2 | 08:48:08 | Heel strike | 640 / 780 / 3550 | 1.27 | 32.2 | 5.4 | – | 126 | 20 | LOW |
| P3 | 10:02:18 | Standing | 1120 / 840 / 1710 | 1.00 | 0.5 | 0.9 | – | 320 | 0 | LOW |
| P3 | 10:02:30 | Standing | 1260 / 910 / 1580 | 1.00 | 1.3 | 1.3 | – | 324 | 0 | LOW |
| P3 | 10:02:39 | Standing | 1090 / 880 / 1760 | 1.01 | 0.6 | 0.8 | – | 318 | 0 | LOW |
| P3 | 10:02:54 | Weight shift | 1340 / 970 / 1490 | 1.00 | 2.9 | 2.1 | – | 322 | 0 | LOW |
| P3 | 10:03:05 | Standing | 1150 / 860 / 1690 | 1.00 | 0.8 | 1.0 | – | 319 | 0 | LOW |
| P3 | 10:03:13 | Weight shift | 1390 / 1010 / 1450 | 1.01 | 2.8 | 2.3 | – | 323 | 0 | LOW |
| P3 | 10:03:27 | Standing | 1130 / 850 / 1720 | 1.00 | 0.5 | 0.9 | – | 321 | 0 | LOW |
| P3 | 10:03:37 | Standing | 1280 / 920 / 1560 | 1.00 | 0.9 | 1.1 | – | 320 | 0 | LOW |
| P4 | 09:36:52 | Walking | 640 / 760 / 3150 | 1.03 | 7.8 | 3.0 | – | 118 | 0 | LOW |
| P4 | 09:36:57 | Walking | 1520 / 1840 / 2410 | 1.09 | 11.9 | 3.7 | – | 102 | 0 | LOW |
| P4 | 09:37:01 | Trip begins | 3980 / 1210 / 120 | 1.89 | 66.5 | 16.6 | yes | 64 | 70 | HIGH |
| P4 | 09:37:07 | Stumble peak | 3720 / 2640 / 380 | 2.97 | 132.9 | 24.2 | yes | 38 | 100 | HIGH |
| P4 | 09:37:09 | Recovery | 2210 / 2480 / 1930 | 1.54 | 42.1 | 11.1 | yes | 41 | 65 | MODERATE |
| P4 | 09:37:12 | Steadying | 1480 / 1620 / 2140 | 1.13 | 10.7 | 4.9 | yes | 72 | 15 | LOW |
| P4 | 09:37:21 | Standing | 1210 / 930 / 1790 | 1.01 | 1.8 | 1.4 | – | 155 | 0 | LOW |
| P4 | 09:37:33 | Standing | 1180 / 900 / 1740 | 1.00 | 0.8 | 1.0 | – | 160 | 0 | LOW |
| P5 | 10:24:40 | Seated | 210 / 140 / 260 | 1.00 | 0.4 | 12.8 | – | 48 | 5 | LOW |
| P5 | 10:24:55 | Seated | 190 / 120 / 240 | 1.00 | 0.3 | 12.5 | – | 46 | 5 | LOW |
| P5 | 10:25:17 | Seated | 230 / 150 / 280 | 1.00 | 0.5 | 12.9 | – | 52 | 5 | LOW |
| P5 | 10:25:35 | Foot shift | 420 / 260 / 310 | 1.01 | 3.4 | 10.9 | – | 63 | 5 | LOW |
| P5 | 10:26:00 | Seated | 200 / 130 / 250 | 1.00 | 0.4 | 12.6 | – | 71 | 5 | LOW |
| P5 | 10:26:20 | Seated | 220 / 140 / 270 | 1.00 | 0.3 | 12.9 | – | 58 | 5 | LOW |
| P5 | 10:26:37 | Seated | 205 / 125 / 245 | 1.00 | 0.4 | 12.7 | – | 55 | 5 | LOW |
| P5 | 10:26:56 | Seated | 215 / 135 / 255 | 1.00 | 0.3 | 12.8 | – | 49 | 5 | LOW |

Summary: P1 max 5 · P2 max 65 (MODERATE) · P3 all 0 · P4 70, 100, 65, 15 (HIGH ×2, MODERATE) · P5 all 5. Total: 2 HIGH, 2 MODERATE, 36 LOW.

### A.10 Acceptance checks (Part A)

1. Sidebar shows **Live Readings** second on every page, highlighted on its own page; clicking it opens the page; `switchView('livereadings')` works from the console.
2. Page loads with the network **offline** (disable Firebase hosts): no console errors, nothing waits on Firebase.
3. 5 participant cards, 40 log rows; chip filter works; clicking a card, a timeline dot or a table row changes the detail panel.
4. Timeline dot spacing visibly differs between P1 (≈ 50 s span) and P5 (≈ 136 s span).
5. All 40 scores and levels match A.9. P4 `09:37:07` shows **100**, not 105.
6. P3 and P5 show *Awaiting signal* for GPS, not `0`/`—`.
7. Exactly five readings show **TOO CLOSE** (red): P4 at 38 and 41 cm; P5 at 48, 46 and 49 cm. P2 at 97 cm and all other readings between 50 and 99 cm show **CAUTION** (amber). No other red appears for ultrasonic.
8. Banner "SAMPLE DATA" cannot be dismissed and is visible at all widths.
9. No participant is called "patient"; no clinical wording.
10. At 1440 × 900 and 390 × 844 nothing overlaps or clips (see Part C for the pitfalls to avoid).

---

## PART B — "Algorithms" demonstration page

### B.1 Goal

A **separate, standalone page**, `algorithms.html`, for tomorrow's presentation. It explains **the algorithms the prototype actually uses**, drawn as clean, correctly labelled **tree diagrams**, in a polished visual style that matches the site.

### B.2 What is actually in the code (the truth this page must draw)

**[VERIFIED against `fall-risk.js`]** The only decision logic in the current build is a **rule-based fall-risk engine**. It is **not machine learning**. It works in three stages:

1. **Feature extraction** (4 numbers from the MPU6050 stream).
2. **Four small decision trees**, one per feature, each turning a measurement into points.
3. **Add, cap, band**: sum the points, cap at 100, then a final small tree sorts the total into LOW / MODERATE / HIGH, which drives the dashboard's Haptic and Emergency status cards.

Do not draw anything as "trained", "learned" or "AI-predicted". The page must say *Rule-based · prototype thresholds · not clinically validated*.

#### B.2.1 Stage 1 — Features

| Feature | Formula | Unit | Code |
|---|---|---|---|
| Acceleration magnitude `|a|` | `√(ax² + ay² + az²)` | g | `accelMag` |
| Angular velocity magnitude `|ω|` | `√(gx² + gy² + gz²)` | °/s | `gyroMag` |
| Combined tilt | `√(pitch² + roll²)` | ° | `tilt` |
| Sudden change | `\| |a|ₜ − |a|ₜ₋₁ \|` (0 for the first reading) | g | `sudden` |

#### B.2.2 Stage 2 — The four decision trees (exact thresholds from `FR_CONFIG`)

Each tree is a chain: test the largest threshold first; the first test that passes decides the leaf; if none pass, the leaf is "normal, 0 points". **The tiers do not stack inside one feature** (the code uses `else if`).

| Tree | Test 1 (checked first) | Test 2 | Test 3 | Else |
|---|---|---|---|---|
| **Acceleration** `|a|` | ≥ 2.5 g → **+40**, HIGH | ≥ 1.5 g → **+25**, ELEVATED | ≥ 1.3 g → **+10**, ELEVATED | 0, NORMAL |
| **Angular velocity** `|ω|` | ≥ 80 °/s → **+40**, HIGH | ≥ 30 °/s → **+20**, ELEVATED | ≥ 20 °/s → **+8**, ELEVATED | 0, NORMAL |
| **Sudden change** Δ`|a|` | ≥ 0.40 g → **+15**, DETECTED | – | – | 0, NOT DETECTED |
| **Tilt** | ≥ 15° → **+10**, HIGH | ≥ 8° → **+5**, ELEVATED | – | 0, NORMAL |

#### B.2.3 Stage 3 — Sum, cap, band

```
raw = accelPts + gyroPts + suddenPts + tiltPts      (maximum possible raw = 40+40+15+10 = 105)
score = min(100, round(raw))
score ≥ 70 → HIGH      else   score ≥ 40 → MODERATE      else → LOW
```

Dashboard states driven by the level (these are **UI states in the dashboard**, not confirmed hardware commands; whether a buzzer or vibration motor is wired is still **[CONFIRM]**):

| Level | Risk badge | Haptic card | Emergency card | Event-log action |
|---|---|---|---|---|
| LOW | LOW RISK (green) | READY | SAFE | None |
| MODERATE | MODERATE RISK (amber) | WARNING | WARNING | Vibration |
| HIGH | HIGH RISK (red) | ACTIVE | EMERGENCY | Emergency Alert |

The "Motion Instability" row on the Fall Risk page is just `score / 100` relabelled; it is **not** a separate algorithm. Draw it as an output, not as a fifth tree.

> **Mismatch to be aware of (also in D-12):** the Calibration modal and Master Doc §7 list only six weights. The code has nine, because it also adds **+10 (`|a|` ≥ 1.3 g), +8 (`|ω|` ≥ 20 °/s) and +5 (tilt ≥ 8°)**. This page draws the **code** (the truth). Update the modal and the Master Doc to match (D-12).

### B.3 Page structure: six "slides" (full-viewport sections)

Scroll-snap sections, one idea per screen, readable on a projector. Section nav dots on the right edge; ← / → / PgUp / PgDn move between sections; `N` toggles speaker notes; `Esc` closes notes.

| # | Section | Visual | Message |
|---|---|---|---|
| 0 | **Hero** | Deep-maroon band (`#3b0e16`, as on the landing page) with the title, three chips and a quiet scroll cue | "How IntelliStride decides" |
| 1 | **Pipeline** | Horizontal flow diagram (B.4) | Where the algorithm sits in the system |
| 2 | **Features** | Four formula cards with tiny glyphs (B.5) | What we compute from raw sensor numbers |
| 3 | **Decision trees** | Four labelled trees in a 2×2 grid, plus a worked-example selector (B.6) | How each feature becomes points |
| 4 | **Score → risk level** | Summing diagram, 0–100 band bar, final tree, outputs table (B.7) | How points become a decision |
| 5 | **What comes next** | Muted, dashed "planned" pipeline plus an illustrative forest (B.8) | Honest roadmap, clearly not built |

Footer on every section: the prototype disclaimer (verbatim, as on the Fall Risk page) and a link **← Back to dashboard** (`index.html`).

**Hero chips (exact text):** `Rule-based` · `Prototype thresholds` · `Not clinically validated`.

### B.4 Section 1 — Pipeline diagram

Left-to-right row of rounded nodes joined by arrows, with a lane underneath showing where each runs.

```
[Sensors] → [ESP32] → [Firebase Realtime DB] → [Web dashboard] → [Feature extraction] → [4 decision trees] → [Add · cap · band] → [Risk level + alert cards]
 FSR×3        reads       writes                  listens           (browser JS)          (browser JS)         (browser JS)          Haptic · Emergency · Log
 MPU6050      values      values                  (onValue)
 GPS
 Ultrasonic
```

- Node style: white, 1.5 px maroon outline, 16 px radius, icon on top (Material Symbols), label Inter 600.
- The three right-hand nodes share a tinted background band labelled **"Runs in the browser today"**. This is accurate: `fall-risk.js` computes the score in the browser. Do **not** say "on device", even though the Fall Risk sidebar card currently does (D-12).
- Arrows: 2 px `--color-waiting`, small arrowheads; on scroll-in the arrows draw left to right (stroke-dashoffset, 700 ms, staggered).
- Under the sensors node list only real sensors (FSR ×3 zones, MPU6050, GPS, ultrasonic).
- Under the ESP32 node: *"Sampling interval and Wi-Fi vs BLE: to be confirmed from firmware"* in waiting style, matching the Documentation page.

### B.5 Section 2 — Feature cards

Four cards in a row (2×2 on narrow screens). Each card: title (serif), formula typeset in JetBrains Mono, unit chip, one line of meaning, a tiny glyph.

| Card | Formula text on the card | Meaning line | Glyph |
|---|---|---|---|
| Acceleration | `|a| = √(ax² + ay² + az²)` | "How hard the shoe is being pushed. Resting ≈ 1 g." | 3 axes arrow cluster |
| Angular velocity | `|ω| = √(gx² + gy² + gz²)` | "How fast the shoe is rotating." | curved arrow |
| Tilt | `tilt = √(pitch² + roll²)` | "How far the shoe leans from level." | tilted rectangle |
| Sudden change | `Δ = | |a|ₜ − |a|ₜ₋₁ |` | "A jump between two consecutive readings." | step waveform |

Under the row, a muted strip: **"Normal-walking baseline (prototype):** `|a|` 0.9–1.3 g · `|ω|` 0–20 °/s · tilt 0–8° · Δ < 0.40 g". Use the same values as the Calibration modal.

### B.5.1 Note on raw-sensor maths (firmware side, mark as such)

If a sidebar "Sensor-level maths" strip is included, label it **"Handled on the ESP32 — to be confirmed from firmware"**: accelerometer raw ÷ 16384 (±2 g), gyroscope raw ÷ 131 (±250 °/s), ultrasonic distance = echo time × 343 m/s ÷ 2. These come from the Master Doc §3.2 and datasheets, not from the dashboard code. Pitch/roll fusion method is **[CONFIRM]**. Leave this strip out if unsure.

### B.6 Section 3 — The four decision trees (the main visual)

#### Layout
2 × 2 grid of white cards (20 px radius). Each card has the feature name, its formula in mono, and one SVG tree. Each tree is a **ladder**: decision nodes run down the left; the **YES** branch of each node goes **right** to a coloured leaf; the **NO** branch goes **down** to the next decision; the last NO goes to the "normal" leaf.

#### Tree data (render all four from this, so labels cannot drift from the code)

```js
export const TREES = [
  { id:'accel',  title:'Acceleration',    symbol:'|a|',  unit:'g',
    splits:[ {op:'≥', t:2.5, pts:40, status:'HIGH'},
             {op:'≥', t:1.5, pts:25, status:'ELEVATED'},
             {op:'≥', t:1.3, pts:10, status:'ELEVATED'} ],
    otherwise:{ pts:0, status:'NORMAL' } },
  { id:'gyro',   title:'Angular velocity', symbol:'|ω|', unit:'°/s',
    splits:[ {op:'≥', t:80, pts:40, status:'HIGH'},
             {op:'≥', t:30, pts:20, status:'ELEVATED'},
             {op:'≥', t:20, pts:8,  status:'ELEVATED'} ],
    otherwise:{ pts:0, status:'NORMAL' } },
  { id:'sudden', title:'Sudden change',   symbol:'Δ|a|', unit:'g',
    splits:[ {op:'≥', t:0.40, pts:15, status:'DETECTED'} ],
    otherwise:{ pts:0, status:'NOT DETECTED' } },
  { id:'tilt',   title:'Tilt',            symbol:'tilt', unit:'°',
    splits:[ {op:'≥', t:15, pts:10, status:'HIGH'},
             {op:'≥', t:8,  pts:5,  status:'ELEVATED'} ],
    otherwise:{ pts:0, status:'NORMAL' } },
];
export const BANDS = { cap:100, moderateMin:40, highMin:70 };   // = FR_CONFIG.LOW_MAX + 1, HIGH_MIN
```

Import the thresholds from `FR_CONFIG` where possible and keep this table only for labels and layout. If a value differs from `FR_CONFIG`, **`FR_CONFIG` wins**.

#### Ladder geometry (per tree, SVG `viewBox="0 0 560 {H}"`, H = 90 + 86·n)

```
x=24                     x=300
 ┌──────────────┐  YES   ┌────────────────────┐
 │ |a| ≥ 2.5 g? │ ─────▶ │ +40 pts · HIGH     │   y = 24
 └──────┬───────┘        └────────────────────┘
        │ NO
 ┌──────▼───────┐  YES   ┌────────────────────┐
 │ |a| ≥ 1.5 g? │ ─────▶ │ +25 pts · ELEVATED │   y = 110
 └──────┬───────┘        └────────────────────┘
        │ NO
 ┌──────▼───────┐  YES   ┌────────────────────┐
 │ |a| ≥ 1.3 g? │ ─────▶ │ +10 pts · ELEVATED │   y = 196
 └──────┬───────┘        └────────────────────┘
        │ NO
 ┌──────▼──────────────────────────────────────┐
 │ 0 pts · NORMAL                               │   y = 282
 └─────────────────────────────────────────────┘
```

- Decision node: 240 × 52, radius 14, white fill, 1.5 px `#7a2e3a` stroke, text Inter 600 14 px (mono for the number).
- Leaf: 220 × 52, radius 26 (pill). Fills by status:

  | Status | Fill | Text | Border |
  |---|---|---|---|
  | NORMAL / NOT DETECTED | `rgba(90,154,110,.14)` | `#2d6b45` | `rgba(90,154,110,.35)` |
  | ELEVATED | `rgba(184,114,42,.14)` | `#8a5520` | `rgba(184,114,42,.35)` |
  | HIGH / DETECTED | `rgba(161,59,59,.14)` | `#A13B3B` | `rgba(161,59,59,.35)` |

- Edge: 2 px `#C9B8B2`. Edge labels **YES** (`#7a2e3a`, 700) and **NO** (`#7B6C66`, 700), Inter 11 px, with a 2 px white halo so they never sit on a line.
- Minimum rendered text size is **12 px** at 1280 px wide; use `font-size` in SVG user units and a responsive `width:100%` so it scales up on the projector.
- **Leave 12 px clear space** around every label; labels must not touch edges or other nodes (this is the exact overlap problem found elsewhere on the site).

#### Worked-example selector (strongly recommended for the demo)

Above the grid: a `<select>` (or segmented buttons) **"Trace a reading"** with options taken from the Live Readings data, grouped by participant. Default: **P4 · 09:37:07 · Stumble peak (demo only)**. Choosing a reading:
1. computes the four feature values and the points with `explainScore(reading, prevAccelMag)` (below);
2. **highlights the winning path** in each tree (edges 3 px `--color-primary` with a flowing dash animation; winning leaf gets a 2 px maroon ring and slight scale 1.03; non-winning nodes dim to 55 % opacity);
3. prints the live values beside each tree (e.g. `|a| = 2.974 g`) and the points chip `+40`;
4. animates the sum in Section 4 for the same reading.

```js
// Pure; used only for explanation. MUST agree with fallRiskEngine().score — assert this in a dev console check.
export function explainScore({ accel, gyro, orientation }, prev) {
  const a = Math.hypot(accel.x, accel.y, accel.z);
  const w = Math.hypot(gyro.x, gyro.y, gyro.z);
  const tilt = Math.hypot(orientation.pitch, orientation.roll);
  const d = prev == null ? 0 : Math.abs(a - prev);
  const pick = (v, splits) => { for (const s of splits) if (v >= s.t) return s; return null; };
  const parts = {
    accel:  pick(a, TREES[0].splits), gyro: pick(w, TREES[1].splits),
    sudden: pick(d, TREES[2].splits), tilt: pick(tilt, TREES[3].splits),
  };
  const pts = k => parts[k] ? parts[k].pts : 0;
  const raw = pts('accel') + pts('gyro') + pts('sudden') + pts('tilt');
  return { values:{a,w,tilt,d}, parts, raw, score: Math.min(100, Math.round(raw)) };
}
```

**Verified examples** (from the real engine; use as acceptance checks):

| Reading | `|a|` | `|ω|` | tilt | Δ | Points | Raw | Score | Level |
|---|---|---|---|---|---|---|---|---|
| P4 · 09:37:07 Stumble peak | 2.974 g | 132.9 °/s | 24.2° | 1.085 g | 40 + 40 + 15 + 10 | **105** | **100** (capped) | HIGH |
| P2 · 08:47:52 Turning | 1.568 g | 56.0 °/s | 11.2° | 0.422 g | 25 + 20 + 15 + 5 | 65 | 65 | MODERATE |
| P1 · 09:14:33 Swing | 0.971 g | 16.8 °/s | 10.1° | 0.148 g | 0 + 0 + 0 + 5 | 5 | 5 | LOW |

### B.7 Section 4 — From points to a decision

Three zones, left to right:

1. **Sum:** four "point chips" (Acceleration, Angular velocity, Sudden change, Tilt) flow into a **Σ** node. Show `raw` and the label *"max possible raw = 105"*.
2. **Cap:** a small node `min(100, raw)`. When `raw = 105` it visibly clips to 100 (a soft "clip" tick on the bar). Label: *"Score is capped at 100"*.
3. **Band tree** (a 2-level tree):
   ```
   score ≥ 70 ? ──YES──▶ HIGH
        │NO
   score ≥ 40 ? ──YES──▶ MODERATE
        │NO
        └────────────────▶ LOW
   ```
   Beneath it, a **0–100 band bar**: 0–39 green, 40–69 amber, 70–100 red (same colours as the Fall Risk threshold rows) with tick labels `0 · 40 · 70 · 100` placed **below** the bar (not on it), and a marker for the traced reading.
4. **Outputs table** from B.2.3 (Level → Risk badge → Haptic → Emergency → Log action). Add the small caption: *"Dashboard states. Hardware alert output not yet confirmed."*

### B.8 Section 5 — What comes next (planned, not built)

Everything here is visually **muted and dashed** with a corner tag **PLANNED — NOT IMPLEMENTED**, so no one mistakes it for working code. Source: Master Doc §11.

- **Roadmap strip (3 stages):**
  1. *Now* — Rule-based scoring (solid maroon, "Built").
  2. *Next* — Calibrate thresholds from controlled walking and staged-fall trials (dashed).
  3. *Later* — A trained model on windowed IMU + FSR features: random forest or 1D CNN (dashed, "Needs real trial data").
- **Illustrative forest (optional, clearly labelled):** three tiny trees voting. Caption, exactly: *"Illustration of the idea only. No model has been trained and no dataset has been collected."* Use generic feature names that the dashboard really has (`|a|`, `|ω|`, tilt, heel/toe pressure ratio) with **no numeric thresholds invented**; use `?` in place of values. Leaves read "stable" / "at risk". Vote box: "majority vote → class".
- Data needed list (honest): controlled walking trials, staged falls, labelled windows; deploy option later: TensorFlow Lite Micro on the ESP32.
- Do **not** show accuracy numbers, ROC curves, or confusion matrices.

### B.9 Visual direction

- **Mood:** calm, precise, "scientific poster meets product page". Warm off-white sections (`--color-bg`) with one deep-maroon hero; white 20 px cards with the existing soft maroon shadow.
- **Colour roles:** maroon = structure and brand; green / amber / red = **status only**; waiting beige = planned / unknown. Never use maroon to mean "danger" and never use the status colours for decoration (this separation fixes the maroon-vs-red confusion found in C-4).
- **Type:** serif headings (Newsreader, 2.5–3.5 rem on the hero, 1.75 rem section titles), Inter body ≥ 16 px, mono numbers.
- **Motion (soft and gliding):** sections fade and drift in (`opacity 0→1`, `translateY(24px→0)`, 600 ms), arrows and tree edges draw in once, traced path flows. Everything respects `@media (prefers-reduced-motion: reduce)` (no draw-in, no flow; show the final state).
- **Accessibility:** each SVG has `role="img"` and an `aria-label` that states the tree in words (e.g. "If |a| is at least 2.5 g add 40 points, high. Otherwise if at least 1.5 g add 25…"); focusable controls; contrast ≥ 4.5:1 for text.
- **Sizes:** designed for **1920 × 1080**; must still work at **1280 × 720** and **390 px** (cards stack, trees scale down, formulas wrap; no horizontal page scroll).
- **Print:** `@media print` landscape, one section per page, no animation, hide nav dots and speaker notes.
- **Performance:** no particle canvas on this page; no external JS libraries; fonts same as the site.
- **Offline-safe:** the page must not import Firebase. It may import `fall-risk-engine.js`, `live-readings-data.js` and `algorithms.js` only.

### B.10 Speaker notes (hidden by default, `N` to toggle; short and honest)

| Section | Note |
|---|---|
| Hero | "This is the decision logic behind the prototype's fall-risk score. It is rule-based, built on thresholds we chose; it is not a trained model." |
| Pipeline | "Sensors feed the ESP32, which writes to Firebase. The dashboard listens and runs the scoring in the browser." |
| Features | "Four numbers are computed from the motion sensor stream. Resting, the shoe reads about 1 g." |
| Trees | "Each feature has its own small decision tree. Pick a reading and watch the path light up." |
| Score | "Points add up, are capped at 100, then sorted into low, moderate or high, which drives the alert cards." |
| Next | "Thresholds are starting estimates. Next step is trials to calibrate them; a trained model only makes sense once we have real data." |

### B.11 Linking
- Reachable at `/algorithms.html` on Vercel.
- Add a discreet button on the **Documentation** page, in the final button row: `View algorithm diagrams` → `algorithms.html`.
- Do **not** add it to the main sidebar (it is a demonstration page). If the user later wants it in the sidebar, reuse `switchView` is not needed; it is a separate document.

### B.12 Acceptance checks (Part B)

1. `algorithms.html` opens directly, with the network offline, with **no console errors** and no Firebase request.
2. Every threshold, point value and label equals `FR_CONFIG` / Section B.2. Cross-check by changing one `FR_CONFIG` value in a dev copy: the tree labels update (or the build step fails loudly).
3. The three verified examples in B.6 reproduce **exactly** in the selector, and `explainScore().score` equals `fallRiskEngine().score` for all 40 readings in Appendix 1.
4. No label overlaps a line or another label at 1920×1080, 1280×720 and 390 px; minimum rendered text ≥ 12 px.
5. Nothing on the page implies machine learning is in use; "PLANNED — NOT IMPLEMENTED" tag present on Section 5.
6. Keyboard: ←/→ move sections; Tab reaches the selector; `N` toggles notes.
7. `prefers-reduced-motion` shows static final states.
8. Print preview: 6 landscape pages.

---

## PART C — Design audit: colours, overlaps, layout, formatting

Method: all seven views were rendered at 1440 × 900 (and 390 × 844 for mobile) with Firebase stubbed, contrast ratios were computed (WCAG formula), and the source was read. Severity: **High** = visibly broken or unreadable; **Med** = noticeable fault; **Low** = polish.

> **Render caveat:** my sandbox could not load Google Fonts, so icon names appeared as text (`speed`, `ARROW_FORWARD`) and fonts fell back. That is a sandbox effect and **not listed as a bug**. It does expose a real demo-day risk, see C-24.

### C.0 Findings at a glance

| ID | Sev | Where | Problem | Evidence |
|---|---|---|---|---|
| C-1 | High | Live Telemetry | Bottom cards and EMG banner sit **outside the scroll area** and cover the panels above | VERIFIED |
| C-2 | High | Live Telemetry, Fall Risk | **72 px blank strip** above sidebar and top bar | VERIFIED |
| C-3 | High | Fall Risk gauge | Zones drawn in the wrong places; fill drifts; **vanishes at 100** | VERIFIED |
| C-4 | High | Fall Risk gauge | Brand maroon used for LOW, nearly identical to HIGH red (1.41 : 1) | VERIFIED |
| C-5 | Med | Fall Risk gauge | LOW / MOD / HIGH labels sit **on** the arc | VERIFIED |
| C-6 | Med | Live Telemetry insoles | Zone tags overlap the pressure blobs and each other; one wraps | VERIFIED |
| C-7 | Med | Anomaly card, Documentation cards | **Lines of text overlap** (line-height clash) | VERIFIED |
| C-8 | High | All dashboard pages, mobile | **No navigation at all** under 960 px; top bar overflows | VERIFIED |
| C-9 | High | Landing nav | Active "Overview" pill: white on pale pink, **1.29 : 1** | VERIFIED |
| C-10 | High | Fall Risk charts, telemetry waveform | Ay and Az lines nearly the same colour (1.12 : 1) | VERIFIED |
| C-11 | Med | Whole site | Caption text `#A6968F` is **2.85 : 1** on white | COMPUTED |
| C-12 | Med | Documentation, Hardware, History, Analytics | No active sidebar item; sidebar short; History not centred | VERIFIED |
| C-13 | Med | `index.html` | Sidebar copy-pasted 6× | CODE-READ |
| C-14 | Med | Landing footer | White text on murky mauve, 2.9–3.6 : 1 | VERIFIED |
| C-15 | Low | Landing | `--color-accent` is **undefined**: dot and accent line vanish | VERIFIED |
| C-16 | Low | Landing CTA band | Empty white pill around one button | VERIFIED |
| C-17 | Med | Landing header, mobile | CTA button wraps to 3 lines, crowds logo | VERIFIED |
| C-18 | Low | Hardware, Documentation | 7 unrelated accent colours, off-palette | VERIFIED |
| C-19 | Low | `index.html` | 124 inline `style=` attributes, hard-coded hex everywhere | CODE-READ |
| C-20 | Low | All pages | Four different page-header patterns | VERIFIED |
| C-21 | Low | Fall Risk | Four overlapping status indicators in the header area | VERIFIED |
| C-22 | Low | Landing | Card titles in mono, section titles in serif | VERIFIED |
| C-23 | Low | Landing | Particle animation keeps running when hidden; ignores reduced motion | CODE-READ |
| C-24 | **High (demo)** | Whole site | **Breaks if the venue network blocks Google/Firebase CDNs** | VERIFIED in sandbox |
| C-25 | Low | Repo | Stray prototype, guides served publicly, `.gitignore` corrupt | CODE-READ |

---

### C-1 · Live Telemetry: cards overlap the panels above (High, VERIFIED)

**Where:** `index.html` lines 575–577.
**Problem:** three consecutive `</div>` close the insole panel, `.tier2-grid` **and `.dash-scroll`**. The next blocks (`.tier3-grid`, `.awaiting-banner`) therefore sit outside the scroll container: they are pinned under it, cover the lower part of the panels and are clipped at the bottom of the screen.
**Fix:** delete **one** `</div>` (line 577). Then `.tier3-grid` and `.awaiting-banner` are children of `.dash-scroll` and scroll with everything else.
**Verified:** after the change, `.tier3-grid` is inside `.dash-scroll`, the cards no longer overlap, and `.dash-content` has exactly two children (`dash-topbar`, `dash-scroll`).

### C-2 · 72 px blank strip at the top of the dashboard (High, VERIFIED)

**Where:** `styles.css` `#view-dashboard { padding-top: var(--nav-h) }` (≈ line 741) and `#view-fallrisk { padding-top: var(--nav-h) }` (≈ line 1185).
**Problem:** `app.js` hides `#site-header` on every view except landing, but these two views still reserve 72 px for it. Measured: the sidebar starts at y = 72.
**Fix:**
```css
#view-dashboard { height:100vh; padding-top:0; overflow:hidden; }
#view-fallrisk  { height:100vh; padding-top:0; overflow:hidden; }
```
**Verified:** sidebar top becomes 0.

### C-3 · Fall Risk gauge is drawn wrongly (High, VERIFIED)

**Where:** `index.html` lines 797–819 and `fall-risk.js` `renderGauge()`.
**Problem:** the arcs use `stroke-dasharray="<len> 628.32"` with a positive `stroke-dashoffset`. Dashes do not wrap around the path, so:
- the LOW (green) zone appears at the **top-right**, MODERATE (amber) at the **left**, HIGH (red) is mostly **off-screen**;
- the maroon fill starts *its own length* past 9 o'clock (score 20 floats at 10–11 o'clock, score 45 sits at the top);
- at **score 100 the fill disappears**, because it starts at the end of the path.

**Fix:** draw one semicircle `<path>` with `pathLength="100"` so every length is a plain score. Replace the whole gauge `<svg>` with this (zones at 0–40, 40–70, 70–100 so that scores 0–39, 40–69, 70–100 land in the right band):

```html
<svg viewBox="0 0 240 160" class="fr-gauge-svg" role="img" aria-label="Fall risk gauge, 0 to 100">
  <path id="fr-gauge-track" d="M20 130 A100 100 0 0 1 220 130" pathLength="100"
        fill="none" stroke="#EAD9D4" stroke-width="18"/>
  <path d="M20 130 A100 100 0 0 1 220 130" pathLength="100" fill="none"
        stroke="#5a9a6e" stroke-opacity=".30" stroke-width="18" stroke-dasharray="40 60"/>
  <path d="M20 130 A100 100 0 0 1 220 130" pathLength="100" fill="none"
        stroke="#B8722A" stroke-opacity=".30" stroke-width="18" stroke-dasharray="30 70" stroke-dashoffset="-40"/>
  <path d="M20 130 A100 100 0 0 1 220 130" pathLength="100" fill="none"
        stroke="#A13B3B" stroke-opacity=".30" stroke-width="18" stroke-dasharray="30 70" stroke-dashoffset="-70"/>
  <path id="fr-gauge-fill" d="M20 130 A100 100 0 0 1 220 130" pathLength="100" fill="none"
        stroke="#5a9a6e" stroke-width="14" stroke-linecap="round"
        stroke-dasharray="0 200" style="transition:stroke-dasharray 500ms ease,stroke 400ms ease"/>
  <g font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#7B6C66" text-anchor="middle">
    <text x="20"  y="152">0</text><text x="84" y="16">40</text>
    <text x="190" y="32">70</text><text x="220" y="152">100</text>
  </g>
</svg>
```

and in `renderGauge()` replace the length maths with:

```js
const fill = fr$('fr-gauge-fill');
fill.setAttribute('stroke-dasharray', score > 0 ? `${score} 200` : '0 200');   // "200" gap prevents a stray end-cap dot
fill.setAttribute('stroke', level === 'HIGH' ? C.alert : level === 'MODERATE' ? C.moderate : C.safe);
```

**Verified** by rendering scores 0, 20, 45, 70, 100: the fill starts at the left end and runs the right distance in each case. (The `"… 200"` gap value matters: a gap equal to the remainder draws a round-cap dot at the right end.)

### C-4 · Brand maroon used to mean "low risk" (High, VERIFIED)

**Where:** `fall-risk.js` `renderGauge()` uses `C.primary` (#7a2e3a) for LOW and `C.alert` (#A13B3B) for HIGH. Contrast between those two is **1.41 : 1**, so at a glance LOW and HIGH look alike, and the level badge beside it is green, which contradicts the gauge.
**Fix:** state colours are for state only. LOW = `#5a9a6e` (fill) / `#2d6b45` (text), MODERATE = `#B8722A` / `#8a5520`, HIGH = `#A13B3B`. Maroon never encodes risk. Applied in the C-3 snippet. Also use the same three colours for the trend-chart line segments (or keep the maroon line but keep the dashed threshold lines amber and red as today).

### C-5 · Gauge labels sit on the arc (Med, VERIFIED)

**Problem:** `LOW`/`HIGH` text at x = 26 / 214 and `MOD` at y = 24 lie inside the 20-px-wide arc band, and the zero-score dot lands on top of the word LOW.
**Fix:** solved by C-3: tick labels `0 / 40 / 70 / 100` are outside the band, and the zero-length fill draws nothing. If words are wanted, put `LOW · MODERATE · HIGH` as a three-item legend **below** the gauge, not on it.

### C-6 · Insole zone tags overlap (Med, VERIFIED)

**Where:** `index.html` lines 484–486 and 510–512; `.kpa-tag` in `styles.css` (≈ line 882).
**Problem:** tags are absolutely positioned on top of a 130 px-wide SVG. "Forefoot" covers the toe pressure blobs, "Midfoot: ADC 500" wraps to two lines and cuts across the outline, "Hindfoot" covers the heel blob.
**Fix:** take the tags off the drawing and put them in a row of three chips under each insole.
```html
<div class="zone-chips">
  <span class="kpa-tag" id="left-pmax-meta">Fore 800</span>
  <span class="kpa-tag" id="left-pmax-mid">Mid 500</span>
  <span class="kpa-tag" id="left-pmax-heel">Heel 1024</span>
</div>
```
```css
.zone-chips { display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-top:var(--sp-2); }
.kpa-tag { position:static; white-space:nowrap; transform:none; }
.kpa-tag.bottom, .kpa-tag.top-left, .kpa-tag.top-right { position:static; transform:none; }
```
Do the same for the right insole. Keep the element ids (app.js writes to them; see D-3 for what it should write).

### C-7 · Overlapping lines of text (Med, VERIFIED)

**Where:** Anomaly Monitor description (`index.html` ≈ line 625) and every Documentation card paragraph (≈ lines 1217–1229) use `class="caption-text body-text"`.
**Problem:** `.caption-text` sets `line-height: 0.875rem` (14 px) while `.body-text` sets `font-size: 1rem` (16 px): lines are shorter than the text and **overprint each other**.
**Fix:**
```css
.body-text.caption-text { font-size:.8125rem; line-height:1.5; }
```
(Optional cleanup: stop combining the two classes; add `.body-sm` for this size.)

### C-8 · No navigation on phones; top bar overflows (High, VERIFIED)

**Where:** `styles.css` `@media (max-width:960px){ .dash-sidebar{display:none} }` plus `app.js` hiding `#site-header` on non-landing views.
**Problem:** below 960 px a person on any dashboard page has **no menu at all**: the sidebar is hidden and so is the header with the hamburger. The top bar also overflows (Demo Session text and the primary button are cut off), and the action buttons run off the right edge.
**Fix (smallest change):**
1. In `app.js` `switchView`, show the header on small screens:
   ```js
   header.style.display = (viewName === 'landing' || window.innerWidth <= 960) ? 'block' : 'none';
   ```
   (re-run on `resize`).
2. Add the dashboard destinations to `#mobile-nav`: Live Readings, Session Analytics, Session History, Hardware & Insoles, Documentation.
3. Restore the header offset on small screens only:
   ```css
   @media (max-width:960px){ .view.active:not(#view-landing){ padding-top:var(--nav-h); } }
   ```
4. Let the top bar wrap:
   ```css
   .dash-topbar { height:auto; min-height:56px; flex-wrap:wrap; gap:8px; padding:8px var(--sp-4); }
   .dash-topbar-left, .dash-topbar-right { flex-wrap:wrap; }
   .action-btns { flex-wrap:wrap; }
   @media (max-width:640px){ .dash-latency{display:none} .user-chip .user-name{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} }
   ```

### C-9 · Active nav pill unreadable (High, VERIFIED)

**Where:** `styles.css` lines 1151–1153: `#site-header .nav-link.active { color:#fff !important }` on `.nav-link.active { background:#fcdcd4 }`. White on pale pink = **1.29 : 1**; "OVERVIEW" is nearly invisible in the screenshot.
**Fix:**
```css
#site-header .nav-link.active { color: var(--color-primary) !important; }   /* 7.16 : 1 on #fcdcd4 */
```

### C-10 · Chart series indistinguishable (High, VERIFIED)

**Where:** `fall-risk.js` `C.blush` (#dec0b9) and `C.muted` (#c9b8b2), `index.html` legend dots (lines 931–933, 950–952), telemetry waveform second line (#dec0b9, line 554).
**Problem:** Ay and Az differ by **1.12 : 1** and each is only ~1.6–1.8 : 1 against the chart background, so the three-axis charts read as one line plus smudges.
**Fix:** one palette, used in JS and in the legend dots:

| Series | Colour | Contrast on `#FBF7F5` |
|---|---|---|
| X | `#7a2e3a` (maroon) | 8.65 : 1 |
| Y | `#B8722A` (amber) | 3.6 : 1 |
| Z | `#3E7C8C` (slate teal) | 4.4 : 1 |

Make line width 2 px, and add a different dash pattern for Z (`[6,3]`) so it still reads in greyscale print. Apply to the accel and gyro charts and to the legend. For the telemetry waveforms use maroon plus amber for the second trace.

### C-11 · Caption text too faint (Med, COMPUTED)

**Where:** `--color-text-muted: #A6968F` is used for almost every 11 px caption: **2.85 : 1** on white, 2.67 : 1 on the page background, 2.46 : 1 on blush cards.
**Fix:** change the token only: `--color-text-muted: #7B6C66;` (5.03 : 1 white, 4.72 : 1 page, 4.35 : 1 blush). The pale `--color-waiting` (#C9B8B2, 1.8 : 1) is intentional per the design system for placeholders, but it is currently also used on **full sentences** (History page paragraph, "[TBD]" notes). Keep it for dots, rings and the word "Awaiting signal" only; use muted for sentences. Also `.blush-text` (the "SPM" unit, #dec0b9 on white = 1.7 : 1): switch to `--color-text-muted`.

### C-12 · Four pages have no active sidebar item and a short sidebar (Med, VERIFIED)

**Where:** Documentation, Hardware & Insoles, Session History, Session Analytics (`index.html` 1154–1183, 1291–1320, 1436–1465, 1496–1504).
**Problems:**
- No sidebar link has `.active`, so the person cannot tell where they are (the highlight is hard-coded per page, and `switchView` only toggles elements with `data-view`, which sidebar links lack).
- These views have no height rule, so the sidebar ends mid-page (visible on History and Analytics), the hub card is missing, and the sidebar scrolls away with the page.
- Session History's content is not vertically centred (it hugs the top because `height:100%` resolves against an auto-height parent).

**Fix:**
```css
#view-documentation.active, #view-hardware.active, #view-history.active,
#view-analytics.active, #view-livereadings.active { display:flex; height:100vh; overflow:hidden; }
#view-documentation .dash-content, #view-hardware .dash-content,
#view-history .dash-content, #view-analytics .dash-content { overflow-y:auto; }
```
and give each sidebar link `data-view="…"` and let `switchView` toggle `.active` on `.sidebar-link[data-view]` as it already does for the top nav (or use C-13). For History, keep the flex centring but on a `min-height:100%` child.

### C-13 · Sidebar duplicated six times (Med, CODE-READ)

**Problem:** the identical `<aside class="dash-sidebar">` is pasted into each view. Adding Live Readings means six edits, and the active state drifts (C-12).
**Recommended fix (preferred if time allows, otherwise do six manual edits):** one `renderSidebar()` in `app.js` that fills every `<aside class="dash-sidebar" data-sidebar>` from a single array:
```js
const NAV = [
  ['dashboard','speed','Live Telemetry'], ['livereadings','monitor_heart','Live Readings'],
  ['fallrisk','crisis_alert','Fall Risk Analysis'], ['analytics','analytics','Session Analytics'],
  ['history','history','Session History'], ['hardware','sensors','Hardware & Insoles'],
  ['documentation','library_books','Documentation'], ['landing','home','Return to Overview'],
];
// build <a class="sidebar-link" data-view="…" onclick="switchView('…')"> and set .active in switchView()
```
This removes C-12 at the same time.

### C-14 · Landing footer contrast (Med, VERIFIED)

**Where:** `.site-footer { background: rgba(255,241,236,.5) }` over the dark-maroon canvas blends to ≈ `#9d8081`. White body text (and 80 % white links) on that is **3.6 : 1 / 2.9 : 1**, and the whole footer looks murky next to the clean maroon band above it.
**Fix:**
```css
.site-footer { background: #2a0a10; border-top: 1px solid rgba(255,255,255,.12); }
#view-landing .footer-link, #view-landing .site-footer p, #view-landing .site-footer span { color: rgba(255,255,255,.86) !important; }  /* ≈ 12 : 1 */
```
The pale `.fda-notice` box already reads well (5.6 : 1); keep it.

### C-15 · Undefined variable `--color-accent` (Low, VERIFIED)

**Where:** `index.html` lines 103–106 (the "SYSTEM STATUS: ONLINE" readout). The variable is not defined anywhere, so the dot is transparent and the intended 2 px accent line beside the paragraph is dropped.
**Fix:** add `--color-accent: var(--color-accent-blush);` to `:root`. Also consider whether "SYSTEM STATUS: ONLINE" belongs on a landing page when it is a static string (see D-13).

### C-16 · Empty white pill on the landing page (Low, VERIFIED)

**Where:** `index.html` lines 215–217. `.cta-form` is styled as a white input pill but now contains only a button, leaving a long empty white bar to its right.
**Fix:** remove the `.cta-form` wrapper (render a normal `btn-primary`), and add the real links beside it (GitHub repository, project report) once they exist (D-13). Also delete the now-dead `initCtaForm()` in `app.js` (it looks for `.cta-input`, which does not exist).

### C-17 · Landing header on phones (Med, VERIFIED)

**Problem:** the "Explore Live Telemetry" button wraps to three lines and pushes the logo and menu icon around.
**Fix:** `@media (max-width:640px){ .nav-right .btn-primary{display:none} }`. The hero already has the same call to action. Also stack the two hero buttons full width (already near that).

### C-18 · Off-palette accent colours (Low, VERIFIED)

**Where:** Hardware page left borders `#d94a61`, `#7a2e3a`, `#a35d68`, `#5a8a9a`, `#9a6d5a`, `#555` (lines 1347–1395) and the Documentation Ultrasonic card `#8e9a5a`. `#d94a61` reads as "alert". The Ultrasonic card on Hardware has no accent while its neighbours do.
**Fix:** one treatment for all sensor cards: `border-left:4px solid var(--color-primary)`, with the icon in `--color-primary`, differentiating by **icon only**. Keep colour for state.

### C-19 · Inline styles and hard-coded colours (Low, CODE-READ)

124 inline `style=` attributes in `index.html`; hex values for greens and ambers repeated across CSS and JS. Move repeated inline blocks into classes (`.card-note`, `.sensor-card`, `.page-actions`) and add state tokens (Section 7). Do this **after** the P0 items; it carries regression risk close to a demo.

### C-20 · Page header patterns differ (Low, VERIFIED)

Fall Risk uses a white header card with a maroon left border; Documentation, Hardware, Analytics use a bare serif `h2`; Live Telemetry has none. Standardise on the Fall Risk card pattern (`.fr-page-header`, rename `.page-header`) with a title, one-line subtitle and optional right-aligned status. Use it for Live Readings from the start.

### C-21 · Fall Risk status clutter (Low, VERIFIED)

Four overlapping indicators: `MPU6050 • CONNECTED`, `Firebase: Live`, `Update Rate: 2.5 Hz` in the top bar, and a second `MPU6050 • Live` pill in the page header. They also assert a live connection that is not true (D-7). **Fix:** keep one status cluster in the top bar (device state, Firebase state, update rate) and remove the pill from the page header.

### C-22 · Mixed heading fonts on the landing page (Low, VERIFIED)

Feature-card `h3` and step-card `h4` use JetBrains Mono, while section titles use the serif. Use the serif for titles everywhere and reserve mono for numbers and codes (`.feature-card h3, .step-card h4 { font-family: var(--font-serif); }`).

### C-23 · Particle animation (Low, CODE-READ)

`particles.js` runs 350 particles with an O(n²) distance check every frame, **continuously, even when the landing view is hidden**, and ignores `prefers-reduced-motion`. **Fix:** pause the loop when `#view-landing` is not `.active` (`cancelAnimationFrame` / restart in `switchView`), pause on `document.hidden`, and skip animation when reduced motion is requested (draw one static frame).

### C-24 · Demo-day dependency risk (High for tomorrow, VERIFIED in sandbox)

In my sandbox, Google Fonts and the Firebase CDN were blocked, and the result is instructive:
- **Icon font blocked:** every icon renders as its text name (`speed`, `crisis_alert`, `ARROW_FORWARD`…) and layouts break.
- **Firebase script blocked:** `firebase.js` fails to load, so `app.js` (which imports it) never runs, `window.switchView` is never defined, and **no navigation button works**.

If the venue Wi-Fi filters these hosts, the live site could look broken. **Recommended mitigations (in order of effort):**
1. **Test on the venue network or a phone hotspot beforehand**, and keep a screen recording as a fallback.
2. Make `app.js` resilient: import Firebase lazily inside `initDashboard()` and `initFallRisk()` (dynamic `import()` in a `try/catch`), so the router and all static pages work even if Firebase is unreachable. Live Readings and Algorithms are already independent of Firebase (Parts A and B).
3. Self-host the three font families and Material Symbols (download the woff2 files into `/fonts` and use `@font-face`), and drop the `@import` in `styles.css` (it also duplicates the `<link>` in `index.html`).

### C-25 · Repository hygiene (Low, CODE-READ)

- `live-telemetry-tailwind-prototype.html` (732 lines, loads Tailwind from a CDN) is an unused leftover; delete it.
- The project guide `.md` files in the repo root (`intellistride-content-fillin-guide.md`, `intellistride-sidebar-pages-guide.md`) will be downloadable from the public site unless excluded; add a `.vercelignore` containing `*.md` and `live-telemetry-tailwind-prototype.html`. (Inferred from how Vercel serves static roots; I could not fetch the live URL from my sandbox to confirm.)
- `.gitignore` ends with a **UTF-16 encoded** line (`e n v . j s`), so `env.js` is **not** actually ignored and is committed (it holds the Firebase web config). Firebase web config is not a secret by itself, but it makes the **database security rules** matter (D-1). Re-save `.gitignore` as UTF-8.
- Remove duplicate `.legend-item` rule (defined twice in `styles.css`, lines ≈ 533 and 889, with different colours) and the unused `.hero-dashboard-card`, `.trust-*` and `.comparison-section` blocks if nothing uses them.

---

## PART D — Honesty fixes (found while auditing; the project's own rules)

The Master Document §8 says every number is either real or clearly labelled, with named things to remove. The audit found the following still in the code. **For a demonstration to examiners these matter more than any colour fix.** For each item the safest default is given; the user may choose differently.

| ID | Sev | Where | What is shown | Rule broken | Default fix |
|---|---|---|---|---|---|
| D-1 | **High** | `firebase.js` `seedIfEmpty()` (103–166), `app.js` `bindSession()` (161–174) | On first visit the app **writes fake data into the live database**, including patient **"Marcus Vance, Post-ACL Recon, Wk 6"**, and shows "Subject #8421 — Marcus Vance (Post-ACL Recon, Wk 6)" in the Active Subject chip | No real/clinical patients | Delete `seedIfEmpty()` and its call; make `bindSession()` ignore patient fields and keep the static "Test Session — Demo Wearer"; delete the seeded `sessions/active` node in the Firebase console. **Also tighten database rules** before sharing the link widely (Master Doc §10) |
| D-2 | High | `app.js` 312, `index.html` 586–601 | "Connected: **StridePod 4-L/R**", "IntelliStride Module 1 / Module 2", Left insole (assumed) / Right insole | Invented product name; one shoe vs two is still **[CONFIRM]** | Use "Connected: ESP32-DevKit-01"; single module card, or label both "Prototype" until one shoe vs two is decided |
| D-3 | High | `app.js` 186–199, 229–246; `index.html` 465, 527 | The right insole is **mathematically simulated** from the left (`×1.05`, `×0.98`); pressure tags are overwritten with invented **kPa**, "Peak: 318 kPa", contact area in cm²; gradient says "400 kPa" | Unmeasured/invented units; FSR values are raw ADC only | Show **raw ADC only** (as the HTML initially does); remove kPa, contact area and the simulation block; label the right foot "Not connected (one FSR set)" unless a second insole exists; legend text "Low → High raw ADC" |
| D-4 | Med | `index.html` 354, 539; `app.js` 170, 332, 431 | "LIVE STREAMING — 120 Hz", "Live 120Hz" badge next to "Update Rate: TBD" | Made-up sampling spec | Show "Update rate: to be confirmed" in the stream pill and badge; remove "120 Hz" strings |
| D-5 | High | `index.html` 646–671 | "Auxiliary Surface EMG Pod 3 … synced on medial gastrocnemius. Broadcast active." with working-looking buttons | Hardware that does not exist | Remove the whole banner |
| D-6 | Med | `app.js` 252–274 | Battery %, RSSI and temperature are **random jitter** every 200 ms; initial HTML shows 88 % / 84 % | Battery is not measured (Master Doc §3.2); unlabelled simulation | Show `Battery: not measured` in waiting style; remove the jitter timer; RSSI and temperature only if really sent |
| D-7 | **High** | `fall-risk.js` 489–505, 441, 500, 585, 598–614 | Page **always** shows "MPU6050 • CONNECTED", "LIVE DATA" and **hides** the "SIMULATED DATA" banner, while the values come from `genDemo()`; a fake first event row ("score 32") is inserted | Master Doc §8 rule 8: keep the banner visible whenever hardware is not connected | Show the banner whenever the data source is `genDemo()` (i.e. until a real `/fallRisk` snapshot arrives); badges read `MPU6050 • NOT CONNECTED` / `SIMULATED DATA` in that state; remove the seeded row |
| D-8 | Med | `index.html` 546, 562, 632–641, 872 | "Raw Accelerometer Magnitude **1.18 BW**"; "Raw Gyroscope Magnitude **4.8 g**"; Orientation card shows a compass heading "**142° SE**" and yaw/pitch/roll in °/s; panel subtitle says "**9-axis** IMU" | MPU6050 is 6-axis, has no magnetometer (no heading), units wrong | Accel in g, gyro in °/s; remove heading; label as "Rotation rate (°/s)"; "6-axis" |
| D-9 | Med | `index.html` 1521, 1531, 1541 | Session Analytics shows "12 sessions", "1.1 m/s", "105 SPM" as if aggregated "across all subjects" | Invented numbers | Replace values with the waiting style "Awaiting data" and caption "No sessions recorded yet" |
| D-10 | Med | `index.html` 1339–1341 | Hardware page statuses **"Online · Live Data · Connected"** are static text | Claims a live link | Bind to the real Firebase connection state or show "Status shown on Live Telemetry" |
| D-11 | High | `README.md` | Says "FDA Class II Medical Device", "clinical data", "capacitive sensors", "dark mode", "sub-millimeter IMUs" | Explicitly forbidden claims | Rewrite: student capstone prototype, ESP32, FSR ×3, MPU6050, GPS, ultrasonic, Firebase RTDB; not a medical device |
| D-12 | Med | `fall-risk.js` vs Calibration modal, Master Doc §7, `index.html` 727 | Code has 9 weights (extra +10 at ≥ 1.3 g, +8 at ≥ 20 °/s, +5 at ≥ 8° tilt), tiers do **not** stack within a feature, score is **capped at 100** (raw max 105). The modal and Master Doc list 6 weights. The sidebar says "computed on device edge" but it is computed **in the browser** | Documentation must match the code | Add the three missing rows to the Calibration modal; add one note "Tiers within a feature do not add; total capped at 100"; change sidebar to "Fall-risk computed in the browser from MPU6050 data"; update Master Doc §7 |
| D-13 | Med | `index.html` 77, 86, 98, 104, 166, 202, 216, 234, 1269 | Landing page still says "sub-millimeter inertial measurement units", "laboratory-grade", "Sub-surface biomechanics", "rehabilitative biomechanics", "Universal shoe sizing", "Instant export" (the **Export Session** button does nothing), "SYSTEM STATUS: ONLINE" (static), a **dead** "Project Report (PDF)" button, and both "View Project on GitHub" (line 216) and "View Source on GitHub" (line 1269) link to `https://github.com` (not the repo) | Marketing claims and dead links | Apply the replacement copy in `intellistride-content-fillin-guide.md`; link the button to `https://github.com/mrinalireeti04/IntelliStride-Dashboard`; hide or label the report button until a file exists; remove "Instant export"/"Universal shoe sizing"; make Export Session show a toast "Export not built yet" |

Two smaller points in the same spirit: `app.js` starts the flag counter at **13** (`flagCount = 13`), so the first flag you press reads "Flagged #14"; start it at 0. And `firebase.js` writes `sessionId: 'IS-8942-B'` into every flag event; use a neutral id.

---

## 6. What not to change

- The soft-maroon daylight theme, card radius 20 px, pill buttons, the type scale and the motion style.
- The existing Fall-Risk scoring **numbers** (thresholds and weights). Changing them changes the science; only the *explanations* of them are being corrected.
- The Fall Risk disclaimer and Calibration wording (verbatim rule).
- The landing page's particle-mesh hero look (only the performance fix C-23).
- Firebase paths other than removing the seed (D-1).

---

## 7. Token additions and changes (`styles.css` `:root`)

```css
:root {
  --color-text-muted: #7B6C66;                 /* was #A6968F — C-11 */
  --color-accent: var(--color-accent-blush);   /* was undefined — C-15 */

  /* State colours (use for state only, never decoration) */
  --risk-low:       #5a9a6e;   --risk-low-text:  #2d6b45;   --risk-low-bg:  rgba(90,154,110,.12);
  --risk-mod:       #B8722A;   --risk-mod-text:  #8a5520;   --risk-mod-bg:  rgba(184,114,42,.12);
  --risk-high:      #A13B3B;   --risk-high-text: #A13B3B;   --risk-high-bg: rgba(161,59,59,.12);

  /* Chart series (C-10) */
  --series-1: #7a2e3a;  --series-2: #B8722A;  --series-3: #3E7C8C;
}
```

Replace the repeated hard-coded greens, ambers and reds in `styles.css` and `fall-risk.js` (`C` object) with these when convenient; the P0 fixes only need the values.

---

## 8. Build order, tomorrow-ready

**P0: must be done before the demonstration**

1. A.2 extract the pure engine (10 min; unblocks both new pages).
2. Part A — Live Readings page, with C-8 so it works on phones.
3. Part B — Algorithms page.
4. C-1, C-2 (two one-line fixes), C-3 + C-5 (gauge), C-9 (nav pill), C-10 (chart colours), C-7 (overlapping text), C-6 (insole tags).
5. D-1, D-5, D-7, D-3, D-9, D-11 (the items an examiner is most likely to notice).
6. C-24 mitigation 2 (lazy Firebase import) and a rehearsal on the venue network or a hotspot.

**P1: if time allows**

C-4, C-11, C-12, C-13, C-14, C-15, C-16, C-17, D-2, D-4, D-6, D-8, D-10, D-12, D-13, C-20, C-21.

**P2: after the demonstration**

C-18, C-19, C-22, C-23, C-25, self-hosting fonts (C-24 mitigation 3).

**Final regression pass (after each batch):**
- Open each of the 8 views (landing, Live Telemetry, Live Readings, Fall Risk, Session Analytics, Session History, Hardware, Documentation) at 1440 × 900 and 390 × 844. Check: no overlapping text, nothing clipped, sidebar item highlighted, no console errors.
- Fall Risk: wait through a full demo cycle (≈ 40 s); gauge must track the score through LOW → MODERATE → HIGH → recovery without drifting, and the SIMULATED DATA banner must be visible.
- Live Readings and `algorithms.html` with the network disabled.

---

## 9. Open questions (assumptions made, to be confirmed by the user)

| # | Assumption in this brief | Needed from the user |
|---|---|---|
| 1 | Only the **rule-based** engine is shown as "used". The Master Doc lists ML as future scope. | If the project report or the evaluators expect other named algorithms (e.g. random forest, XGBoost) **as implemented**, say so, with the real details. Otherwise they stay in the "PLANNED" section |
| 2 | The date stays **13 Oct 2026** as requested | Should demo day show 14 Oct? (change one constant) |
| 3 | GPS coordinates are a **placeholder city-centre point** | Preferred demo location, or leave as placeholder |
| 4 | Ultrasonic thresholds (< 50 cm TOO CLOSE, < 100 cm CAUTION) are prototype values | Real values once decided (Master Doc: [TBD]) |
| 5 | One shoe vs two is still undecided | Needed to settle D-2 and D-3 (left/right insole display) |
| 6 | Battery is not measured | Confirm, then keep "not measured" |
| 7 | "Live Readings" is the name the user chose, even though the data is sample data | Keep the name; the SAMPLE DATA banner makes the status clear |
| 8 | Sample readings are illustrative, not measured | Do not present them as real results |

---

## Appendix 1 — `live-readings-data.js` (use verbatim)

Generated and checked by running the project's real `fallRiskEngine` on every reading. The file loads as an ES module and contains 5 people × 8 readings.

```js
// live-readings-data.js
// HARD-CODED DEMONSTRATION DATA. Not from live hardware. Do not present as measured results.
// Date and times are Indian Standard Time (UTC+05:30).

export const READINGS_DATE = '2026-10-13';        // change to '2026-10-14' if the demo should show demo-day
export const DATA_LABEL    = 'Sample data — hard-coded for demonstration';

// PLACEHOLDER coordinates (a city-centre point, not a real participant location).
// Replace GPS_ORIGIN with the demo venue if you want the map-style readout to look right.
export const GPS_ORIGIN = { lat: 28.613900, lon: 77.209000 };

// Units: fsr = raw ADC 0-4095 (uncalibrated) | accel = g | gyro = deg/s | orientation = deg | distanceCm = cm
export const PEOPLE = [
  {
    id: 'P1',
    name: '[Name 1]',            // <-- FILL IN
    scenario: 'Normal walk',
    readings: [
      { t: '09:14:06', phase: 'Heel strike',
        fsr: { forefoot: 310, midfoot: 420, hindfoot: 2860 },
        accel: { x: 0.08, y: 0.05, z: 1.02 }, gyro: { x: 4.2, y: 1.1, z: 2.0 },
        orientation: { pitch: 3.1, roll: 1.2 }, distanceCm: 212,
        gps: { lat: 28.613900, lon: 77.209000, sats: 7, fix: true } },
      { t: '09:14:13', phase: 'Foot flat',
        fsr: { forefoot: 980, midfoot: 1540, hindfoot: 2210 },
        accel: { x: 0.05, y: -0.03, z: 0.99 }, gyro: { x: 2.1, y: 0.6, z: 1.4 },
        orientation: { pitch: 1.4, roll: 0.8 }, distanceCm: 198,
        gps: { lat: 28.613912, lon: 77.209009, sats: 7, fix: true } },
      { t: '09:14:18', phase: 'Mid stance',
        fsr: { forefoot: 1720, midfoot: 1890, hindfoot: 1120 },
        accel: { x: 0.02, y: 0.04, z: 1.06 }, gyro: { x: 1.8, y: -0.9, z: 0.8 },
        orientation: { pitch: 0.9, roll: 0.5 }, distanceCm: 185,
        gps: { lat: 28.613924, lon: 77.209018, sats: 7, fix: true } },
      { t: '09:14:27', phase: 'Toe off',
        fsr: { forefoot: 2740, midfoot: 1010, hindfoot: 260 },
        accel: { x: -0.12, y: 0.07, z: 1.11 }, gyro: { x: 9.6, y: 3.2, z: 4.1 },
        orientation: { pitch: -6.2, roll: 1.9 }, distanceCm: 171,
        gps: { lat: 28.613936, lon: 77.209027, sats: 7, fix: true } },
      { t: '09:14:33', phase: 'Swing',
        fsr: { forefoot: 90, midfoot: 60, hindfoot: 40 },
        accel: { x: 0.04, y: 0.02, z: 0.97 }, gyro: { x: 14.8, y: 5.0, z: 6.2 },
        orientation: { pitch: -9.8, roll: 2.4 }, distanceCm: 160,
        gps: { lat: 28.613948, lon: 77.209036, sats: 7, fix: true } },
      { t: '09:14:41', phase: 'Heel strike',
        fsr: { forefoot: 350, midfoot: 460, hindfoot: 3020 },
        accel: { x: 0.10, y: 0.06, z: 1.04 }, gyro: { x: 5.1, y: 1.9, z: 2.3 },
        orientation: { pitch: 3.4, roll: 1.1 }, distanceCm: 238,
        gps: { lat: 28.613960, lon: 77.209045, sats: 7, fix: true } },
      { t: '09:14:46', phase: 'Foot flat',
        fsr: { forefoot: 1010, midfoot: 1480, hindfoot: 2150 },
        accel: { x: 0.03, y: -0.02, z: 1.00 }, gyro: { x: 2.4, y: 0.4, z: 1.1 },
        orientation: { pitch: 1.2, roll: 0.7 }, distanceCm: 226,
        gps: { lat: 28.613972, lon: 77.209054, sats: 7, fix: true } },
      { t: '09:14:56', phase: 'Toe off',
        fsr: { forefoot: 2810, midfoot: 950, hindfoot: 240 },
        accel: { x: -0.10, y: 0.05, z: 1.09 }, gyro: { x: 10.2, y: 3.0, z: 3.9 },
        orientation: { pitch: -6.5, roll: 2.0 }, distanceCm: 204,
        gps: { lat: 28.613984, lon: 77.209063, sats: 7, fix: true } },
    ],
  },
  {
    id: 'P2',
    name: '[Name 2]',            // <-- FILL IN
    scenario: 'Brisk walk with a turn',
    readings: [
      { t: '08:47:31', phase: 'Heel strike',
        fsr: { forefoot: 620, midfoot: 740, hindfoot: 3480 },
        accel: { x: 0.21, y: 0.12, z: 1.18 }, gyro: { x: 18.0, y: 12.0, z: 9.0 },
        orientation: { pitch: 4.2, roll: 2.1 }, distanceCm: 150,
        gps: { lat: 28.613900, lon: 77.209000, sats: 8, fix: true } },
      { t: '08:47:35', phase: 'Foot flat',
        fsr: { forefoot: 1480, midfoot: 2310, hindfoot: 2890 },
        accel: { x: 0.16, y: -0.08, z: 1.12 }, gyro: { x: 12.0, y: 8.0, z: 5.0 },
        orientation: { pitch: 2.8, roll: 1.6 }, distanceCm: 132,
        gps: { lat: 28.613918, lon: 77.209014, sats: 8, fix: true } },
      { t: '08:47:41', phase: 'Turning',
        fsr: { forefoot: 3320, midfoot: 1380, hindfoot: 410 },
        accel: { x: -0.34, y: 0.18, z: 1.31 }, gyro: { x: 34.0, y: 22.0, z: 26.0 },
        orientation: { pitch: 5.1, roll: 8.6 }, distanceCm: 118,
        gps: { lat: 28.613936, lon: 77.209028, sats: 8, fix: true } },
      { t: '08:47:44', phase: 'Swing',
        fsr: { forefoot: 140, midfoot: 95, hindfoot: 60 },
        accel: { x: 0.28, y: 0.22, z: 1.09 }, gyro: { x: 21.0, y: 9.0, z: 15.0 },
        orientation: { pitch: -7.4, roll: 3.2 }, distanceCm: 164,
        gps: { lat: 28.613954, lon: 77.209042, sats: 8, fix: true } },
      { t: '08:47:52', phase: 'Turning',
        fsr: { forefoot: 700, midfoot: 830, hindfoot: 3610 },
        accel: { x: 0.62, y: 0.34, z: 1.40 }, gyro: { x: 41.0, y: 19.0, z: 33.0 },
        orientation: { pitch: 6.0, roll: 9.4 }, distanceCm: 97,
        gps: { lat: 28.613972, lon: 77.209056, sats: 8, fix: true } },
      { t: '08:47:57', phase: 'Foot flat',
        fsr: { forefoot: 1560, midfoot: 2290, hindfoot: 2760 },
        accel: { x: 0.18, y: 0.09, z: 1.15 }, gyro: { x: 11.0, y: 7.0, z: 6.0 },
        orientation: { pitch: 3.0, roll: 1.9 }, distanceCm: 142,
        gps: { lat: 28.613990, lon: 77.209070, sats: 8, fix: true } },
      { t: '08:48:01', phase: 'Toe off',
        fsr: { forefoot: 3390, midfoot: 1290, hindfoot: 380 },
        accel: { x: 0.11, y: -0.05, z: 1.10 }, gyro: { x: 9.0, y: 4.0, z: 3.0 },
        orientation: { pitch: -5.2, roll: 2.2 }, distanceCm: 155,
        gps: { lat: 28.614008, lon: 77.209084, sats: 8, fix: true } },
      { t: '08:48:08', phase: 'Heel strike',
        fsr: { forefoot: 640, midfoot: 780, hindfoot: 3550 },
        accel: { x: 0.31, y: 0.17, z: 1.22 }, gyro: { x: 24.0, y: 13.0, z: 17.0 },
        orientation: { pitch: 4.4, roll: 3.1 }, distanceCm: 126,
        gps: { lat: 28.614026, lon: 77.209098, sats: 8, fix: true } },
    ],
  },
  {
    id: 'P3',
    name: '[Name 3]',            // <-- FILL IN
    scenario: 'Standing, weight shifting',
    readings: [
      { t: '10:02:18', phase: 'Standing',
        fsr: { forefoot: 1120, midfoot: 840, hindfoot: 1710 },
        accel: { x: 0.01, y: 0.02, z: 1.00 }, gyro: { x: 0.4, y: 0.3, z: 0.2 },
        orientation: { pitch: 0.8, roll: 0.4 }, distanceCm: 320,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:02:30', phase: 'Standing',
        fsr: { forefoot: 1260, midfoot: 910, hindfoot: 1580 },
        accel: { x: 0.02, y: 0.01, z: 1.00 }, gyro: { x: 1.1, y: 0.5, z: 0.6 },
        orientation: { pitch: 1.1, roll: 0.6 }, distanceCm: 324,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:02:39', phase: 'Standing',
        fsr: { forefoot: 1090, midfoot: 880, hindfoot: 1760 },
        accel: { x: 0.01, y: 0.02, z: 1.01 }, gyro: { x: 0.5, y: 0.2, z: 0.3 },
        orientation: { pitch: 0.7, roll: 0.3 }, distanceCm: 318,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:02:54', phase: 'Weight shift',
        fsr: { forefoot: 1340, midfoot: 970, hindfoot: 1490 },
        accel: { x: 0.04, y: 0.03, z: 1.00 }, gyro: { x: 2.4, y: 1.2, z: 1.0 },
        orientation: { pitch: 1.9, roll: 0.9 }, distanceCm: 322,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:03:05', phase: 'Standing',
        fsr: { forefoot: 1150, midfoot: 860, hindfoot: 1690 },
        accel: { x: 0.01, y: 0.01, z: 1.00 }, gyro: { x: 0.6, y: 0.4, z: 0.3 },
        orientation: { pitch: 0.9, roll: 0.4 }, distanceCm: 319,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:03:13', phase: 'Weight shift',
        fsr: { forefoot: 1390, midfoot: 1010, hindfoot: 1450 },
        accel: { x: 0.05, y: 0.04, z: 1.01 }, gyro: { x: 2.2, y: 1.4, z: 0.9 },
        orientation: { pitch: 2.1, roll: 1.0 }, distanceCm: 323,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:03:27', phase: 'Standing',
        fsr: { forefoot: 1130, midfoot: 850, hindfoot: 1720 },
        accel: { x: 0.02, y: 0.01, z: 1.00 }, gyro: { x: 0.3, y: 0.3, z: 0.2 },
        orientation: { pitch: 0.8, roll: 0.5 }, distanceCm: 321,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
      { t: '10:03:37', phase: 'Standing',
        fsr: { forefoot: 1280, midfoot: 920, hindfoot: 1560 },
        accel: { x: 0.01, y: 0.02, z: 1.00 }, gyro: { x: 0.7, y: 0.3, z: 0.4 },
        orientation: { pitch: 1.0, roll: 0.4 }, distanceCm: 320,
        gps: { lat: null, lon: null, sats: 3, fix: false } },
    ],
  },
  {
    id: 'P4',
    name: '[Name 4]',            // <-- FILL IN
    scenario: 'Staged stumble (demo only)',
    readings: [
      { t: '09:36:52', phase: 'Walking',
        fsr: { forefoot: 640, midfoot: 760, hindfoot: 3150 },
        accel: { x: 0.07, y: 0.04, z: 1.03 }, gyro: { x: 6.0, y: 3.0, z: 4.0 },
        orientation: { pitch: 2.8, roll: 1.1 }, distanceCm: 118,
        gps: { lat: 28.613900, lon: 77.209000, sats: 6, fix: true } },
      { t: '09:36:57', phase: 'Walking',
        fsr: { forefoot: 1520, midfoot: 1840, hindfoot: 2410 },
        accel: { x: 0.12, y: 0.06, z: 1.08 }, gyro: { x: 9.0, y: 5.0, z: 6.0 },
        orientation: { pitch: 3.4, roll: 1.5 }, distanceCm: 102,
        gps: { lat: 28.613910, lon: 77.209007, sats: 6, fix: true } },
      { t: '09:37:01', phase: 'Trip begins',
        fsr: { forefoot: 3980, midfoot: 1210, hindfoot: 120 },
        accel: { x: 0.88, y: 0.41, z: 1.62 }, gyro: { x: 46.0, y: 28.0, z: 39.0 },
        orientation: { pitch: 14.0, roll: 9.0 }, distanceCm: 64,
        gps: { lat: 28.613920, lon: 77.209014, sats: 6, fix: true } },
      { t: '09:37:07', phase: 'Stumble peak',
        fsr: { forefoot: 3720, midfoot: 2640, hindfoot: 380 },
        accel: { x: 1.62, y: -0.94, z: 2.31 }, gyro: { x: 92.0, y: 61.0, z: 74.0 },
        orientation: { pitch: 21.0, roll: 12.0 }, distanceCm: 38,
        gps: { lat: 28.613930, lon: 77.209021, sats: 6, fix: true } },
      { t: '09:37:09', phase: 'Recovery',
        fsr: { forefoot: 2210, midfoot: 2480, hindfoot: 1930 },
        accel: { x: 0.55, y: 0.31, z: 1.41 }, gyro: { x: 31.0, y: 18.0, z: 22.0 },
        orientation: { pitch: 9.0, roll: 6.5 }, distanceCm: 41,
        gps: { lat: 28.613940, lon: 77.209028, sats: 6, fix: true } },
      { t: '09:37:12', phase: 'Steadying',
        fsr: { forefoot: 1480, midfoot: 1620, hindfoot: 2140 },
        accel: { x: 0.14, y: 0.09, z: 1.12 }, gyro: { x: 8.0, y: 5.0, z: 5.0 },
        orientation: { pitch: 4.1, roll: 2.6 }, distanceCm: 72,
        gps: { lat: 28.613950, lon: 77.209035, sats: 6, fix: true } },
      { t: '09:37:21', phase: 'Standing',
        fsr: { forefoot: 1210, midfoot: 930, hindfoot: 1790 },
        accel: { x: 0.02, y: 0.02, z: 1.01 }, gyro: { x: 1.4, y: 0.8, z: 0.7 },
        orientation: { pitch: 1.2, roll: 0.8 }, distanceCm: 155,
        gps: { lat: 28.613960, lon: 77.209042, sats: 6, fix: true } },
      { t: '09:37:33', phase: 'Standing',
        fsr: { forefoot: 1180, midfoot: 900, hindfoot: 1740 },
        accel: { x: 0.01, y: 0.01, z: 1.00 }, gyro: { x: 0.6, y: 0.4, z: 0.3 },
        orientation: { pitch: 0.9, roll: 0.5 }, distanceCm: 160,
        gps: { lat: 28.613970, lon: 77.209049, sats: 6, fix: true } },
    ],
  },
  {
    id: 'P5',
    name: '[Name 5]',            // <-- FILL IN
    scenario: 'Seated, resting',
    readings: [
      { t: '10:24:40', phase: 'Seated',
        fsr: { forefoot: 210, midfoot: 140, hindfoot: 260 },
        accel: { x: 0.00, y: 0.01, z: 1.00 }, gyro: { x: 0.3, y: 0.2, z: 0.1 },
        orientation: { pitch: 12.4, roll: 3.0 }, distanceCm: 48,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:24:55', phase: 'Seated',
        fsr: { forefoot: 190, midfoot: 120, hindfoot: 240 },
        accel: { x: 0.01, y: 0.01, z: 1.00 }, gyro: { x: 0.2, y: 0.1, z: 0.2 },
        orientation: { pitch: 12.1, roll: 3.2 }, distanceCm: 46,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:25:17', phase: 'Seated',
        fsr: { forefoot: 230, midfoot: 150, hindfoot: 280 },
        accel: { x: 0.00, y: 0.02, z: 1.00 }, gyro: { x: 0.4, y: 0.3, z: 0.2 },
        orientation: { pitch: 12.6, roll: 2.9 }, distanceCm: 52,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:25:35', phase: 'Foot shift',
        fsr: { forefoot: 420, midfoot: 260, hindfoot: 310 },
        accel: { x: 0.03, y: 0.02, z: 1.01 }, gyro: { x: 2.8, y: 1.6, z: 1.1 },
        orientation: { pitch: 10.2, roll: 3.8 }, distanceCm: 63,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:26:00', phase: 'Seated',
        fsr: { forefoot: 200, midfoot: 130, hindfoot: 250 },
        accel: { x: 0.00, y: 0.01, z: 1.00 }, gyro: { x: 0.3, y: 0.2, z: 0.1 },
        orientation: { pitch: 12.2, roll: 3.1 }, distanceCm: 71,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:26:20', phase: 'Seated',
        fsr: { forefoot: 220, midfoot: 140, hindfoot: 270 },
        accel: { x: 0.01, y: 0.00, z: 1.00 }, gyro: { x: 0.2, y: 0.2, z: 0.1 },
        orientation: { pitch: 12.5, roll: 3.0 }, distanceCm: 58,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:26:37', phase: 'Seated',
        fsr: { forefoot: 205, midfoot: 125, hindfoot: 245 },
        accel: { x: 0.00, y: 0.01, z: 1.00 }, gyro: { x: 0.3, y: 0.1, z: 0.2 },
        orientation: { pitch: 12.3, roll: 3.2 }, distanceCm: 55,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
      { t: '10:26:56', phase: 'Seated',
        fsr: { forefoot: 215, midfoot: 135, hindfoot: 255 },
        accel: { x: 0.01, y: 0.01, z: 1.00 }, gyro: { x: 0.2, y: 0.2, z: 0.2 },
        orientation: { pitch: 12.4, roll: 3.1 }, distanceCm: 49,
        gps: { lat: null, lon: null, sats: 0, fix: false } },
    ],
  },
];
```

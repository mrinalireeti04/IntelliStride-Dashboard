# IntelliStride — Precision Gait Intelligence

IntelliStride is a front-end web application dashboard designed for laboratory-grade gait analysis and biomechanical telemetry. The platform provides an interface for pressure-sensing insoles paired with sub-millimeter inertial measurement units (IMUs) to display real-time clinical data outside the traditional laboratory environment.

## Key Features

- **Live Telemetry Dashboard**: Monitor real-time gait cadence, symmetry, stride length, and stance duration.
- **Dynamic Plantar Pressure Mapping**: Visualizes pressure across capacitive sensors, displaying peak pressures and center of pressure (CoP) paths using dynamic SVG rendering.
- **Kinematic Waveforms**: View real-time graphs of vertical ground reaction force (vGRF) and tibial shock acceleration.
- **IMU Sensor Status**: Monitor battery life, signal RSSI, and internal temperatures of the connected StridePod hardware.
- **Fall Risk Analysis**: Advanced analytics view to monitor pathologic gait deviations or asymmetric muscle fatigue.
- **Clinical Validation Interface**: Designed for seamless deployment in physical therapy facilities, biomechanical research centers, and sports kinesiology labs.

## Architecture & Tech Stack

- **HTML5**: Semantic structure with modular views (Landing, Dashboard, Fall Risk).
- **CSS3**: Custom styling, responsive grid layouts, dark mode aesthetics, and smooth UI animations (`styles.css`).
- **JavaScript**: Handles view switching, simulated telemetry data rendering, and mobile navigation.
- **SVG Graphics**: Inline scalable vector graphics used extensively for insole pressure maps, UI iconography, and waveform charts.
- **Typography**: Integrates Google Fonts (Newsreader, Inter, JetBrains Mono) and Material Symbols for a premium medical software aesthetic.

## Getting Started

1. Clone or download the repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).
3. Use the top navigation or sidebar to switch between the **Overview** landing page, the **Live Telemetry** dashboard, and the **Fall Risk** analysis modules.
4. Interact with the Dashboard to explore the simulated live streams of biomechanical data.

## Disclaimer
This interface is a simulated dashboard representing an FDA Class II Medical Device Enclosure Specification. It is intended for demonstration and developmental purposes.

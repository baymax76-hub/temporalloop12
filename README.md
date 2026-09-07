# 🌌 Starfield OS — Multiverse Constellation Explorer

> *"Not a website with a 3D banner. A universe you fly through — every star's a story, every constellation's a connection."*

![Starfield OS Banner](https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop)

---

## 🚀 Overview

**Starfield OS** is a cutting-edge, production-ready 3D spatial web application and flight exploration simulator. Following a catastrophic Multiversal War that shattered stable reality, the player navigates an open 3D cosmos, docking at floating planetary systems, discovering survivor logs, and linking broken dimensions across constellation networks.

---

## 🛸 Key Features

### 1. Narrative Intro & Spacecraft Hangar
- **Typewriter Prologue**: Atmospheric multiversal lore introduction with synthesized typewriter audio and ambient space drone.
- **Interactive 3D Ship Hangar**: 3D wireframe and faceted rotating blueprints comparing maneuverability, shield capacity, sub-light velocity, and firepower.
- **3 Distinct Spacecrafts**:
  1. **Vanguard Interceptor** *(Tactical Cyan HUD, ultra-agile handling, Chrono-Boost)*
  2. **Aegis Dreadnought** *(Industrial Amber HUD, super-heavy armor, Kinetic EMP Shockwave)*
  3. **Quantum Pathfinder** *(Tachyon Magenta HUD, crystalline canopy, Multiversal Resonance Scanner)*

### 2. Core 3D Flight Simulation & WebGL Engine
- **True Open Space Canvas**: 15,000+ procedural multi-spectral stars (O, B, A, G, M classes), volumetric nebulae (Carina, Orion Fracture, Void of Eternity), and destructible asteroid belts.
- **6DOF Flight Kinematics**: Inertial momentum, mouse drag pitch/yaw steering, throttle management, lateral strafe, roll banking, and hyper-speed warp streak lines.
- **Destructible Asteroids & Weapons**: Dual plasma lasers, EMP shockwave pulses, collision hitboxes, particle explosions, and mineral/fuel harvesting.

### 3. Diegetic Glassmorphism Cockpit HUD
- **3 Tailored Glassmorphism Skins**: Tactical Blue, Industrial Amber, Neon Violet with custom sci-fi corner brackets, scanlines, and glowing telemetry.
- **Dynamic 3D Reticle System**: Raycasted screen-space targeting with distance readouts (in AU/km) and lore status.
- **Navigation & Artificial Horizon**: Live 3D spatial coordinates [X, Y, Z], speed gauge in *c* (lightspeed), gyro horizon, and 360° Galaxy Radar mini-map.
- **Tactical Power Distribution**: Interactive 3-way power routing matrix (Engines / Shields / Weapons) dynamically altering flight speed, laser cooldown, and shield defense.

### 4. Holographic Planetary Terminal & Galaxy Codex
- **Orbital Docking Overlay**: Approaching or clicking a star opens a holographic terminal with narrative lore, intercepted survivor audio logs, and dimensional frequencies.
- **Terminal Operations**:
  - *Scan Planetary Lore* (Decrypts lore into the Galaxy Codex).
  - *Harvest Antimatter Fuel* (Energy beam replenishment).
  - *Warp Jump to Connected Constellation Star* (Cinematic hyper-warp transit).
- **Galaxy Codex**: Fullscreen constellation map tracker (*The Phoenix Core*, *The Chronos Arc*, *Elysium Nexus*) displaying discovery completion percentages and direct jump triggers.

### 5. Cloud Server & Multiplayer Telemetry Relay
- **Cloud Server Engine** (`server/cloudServer.js`): High-speed Node.js + Express + WebSocket backend relaying real-time 3D spatial coordinates and survivor broadcasts across all pilots.
- **Quantum Mesh Client** (`js/network/cloudEngine.js`): Auto-detects cloud gateway with seamless fallback to an autonomous local mesh simulator.
- **Cloud Terminal** (`[C]` Key): Monitor live packet throughput, ping latency, and broadcast emergency lore transmissions to the multiversal fleet.

### 6. Zero-Dependency Web Audio API Sound Synthesizer
- Generative ambient sub-bass drone with harmonic breathing filters.
- Speed-responsive engine thruster sound (frequency modulations with velocity/boost).
- Hyperspace warp boom with Doppler sweeps.
- Dual plasma lasers, EMP shockwaves, asteroid explosions, target lock-on beeps, and holographic UI tones.

---

## ⌨️ Flight Controls & Hotkeys

| Action | Control / Key |
| :--- | :--- |
| **Pitch & Yaw Steering** | **Mouse Drag / Move Cursor** |
| **Forward Throttle / Brake** | **`W` / `S` or Up/Down Arrows** |
| **Lateral Strafe (Left / Right)** | **`A` / `D` or Left/Right Arrows** |
| **Roll Bank (Left / Right)** | **`Q` / `E`** |
| **Hyper-Speed Warp Boost** | **`SPACE` or `SHIFT`** |
| **Fire Plasma Lasers** | **`F` / Left Click / HUD Button** |
| **Special Ability (EMP / Scan)** | **`R` or `T`** |
| **Galaxy Codex Star Map** | **`M`** |
| **Cloud Server Terminal** | **`C`** |
| **Pilot Flight Manual** | **`H`** |
| **Target Lock & Fly-To** | **Click Celestial Star / Reticle** |

---

## 🛠️ Technology Stack

- **Graphics & 3D**: [Three.js r128](https://threejs.org/) (WebGL, Custom Shaders, Particle Systems, 6DOF Kinematics)
- **Animations & Warp Transitions**: [GSAP 3.x](https://greensock.com/gsap/)
- **Styling & HUD**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism Tokens + Google Fonts (`Orbitron`, `Rajdhani`, `Share Tech Mono`, `Inter`)
- **Sound Synthesis**: Native Procedural Web Audio API (Zero external audio assets needed)
- **Backend / Cloud Engine**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [ws (WebSockets)](https://github.com/websockets/ws), [CORS](https://github.com/expressjs/cors)

---

## 🚀 Running the Project

### Option A: Run with Node.js Cloud Server (Full Multiplayer & REST API)
```bash
# Navigate to server directory and start
cd server
npm install
npm start
```
Open **`http://localhost:8080`** in your browser.

### Option B: Run with PowerShell Server (Built-in)
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Open **`http://localhost:8080`** in your browser.

### Option C: Open Standalone
Simply serve `index.html` with any static web server (e.g. `npx serve .`, Live Server, or Python `python -m http.server 8080`).

---

## 🌐 Deploying to Vercel (Instant Zero-Config)

The project is fully pre-configured for instant **Vercel** deployment with serverless API functions (`/api/*`) and optimized caching:

### Method 1: Deploy with Vercel CLI
```bash
# In the project root directory:
npx vercel
# Follow the prompts (Select defaults: Framework Preset: Other, Root: ./)
```

### Method 2: Deploy via GitHub / Vercel Dashboard
1. Push this repository to **GitHub**.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Leave all default build settings as is (Vercel will detect `vercel.json` and `package.json` automatically).
4. Click **Deploy**.

Your Starfield OS application and its serverless cloud API endpoints (`/api/health`, `/api/universe/state`, `/api/telemetry/ping`, `/api/codex/transmit`) will be live instantly with global CDN acceleration!

---

## 🪐 Planetary Constellation Roster

1. **Aethelgard Prime** — *Crystalline Super-Earth with automated emergency spires*
2. **Chronos VII** — *Time-dilated ocean world trapped in a micro-singularity*
3. **Vespera Core** — *Molten magma forge star constructed by autonomous automata*
4. **Nyx Station Alpha** — *Derelict multiversal colony ark suspended in stasis*
5. **Elysium Singularity** — *Quantum Kerr-metric gateway enclosed in a Dyson Ring*
6. **Solaris Obelisk** — *Ancient artificial micro-sun broadcasting Sol radio frequencies*
7. **Zenith Fracture** — *Shattered moon frozen mid-explosion inside a stasis field*
8. **Astral Nexus Prime** — *The universal master coordinate hub uniting the constellations*

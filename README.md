# AIML Club × Red Bull | Inventra 2026

An interactive, scroll-controlled cinematic sponsorship invitation experience built for **Red Bull** for **Inventra 2026**, created by the **AIML Club**.

Instead of a traditional website with a standard embedded video player, this project transforms high-fidelity cinematic video into an interactive web experience completely controlled by the user's scroll.

---

## ⚡ Key Experience & Features

- **Full-Viewport Cinematic Immersion**: Zero distraction—no navigation bars, sidebars, progress meters, or disruptive UI overlays. The video is the complete experience.
- **Bi-Directional Scroll Scrubbing**: 
  - Scrolling down plays the cinematic sequence forward.
  - Scrolling up smoothly reverses the sequence in real time.
- **Precision 1:1 Timeline Mapping**:
  - `0% Scroll` → Beginning of the sequence (close-up intro).
  - `50% Scroll` → Midpoint (coding, AI development focus).
  - `100% Scroll` → Final frame lock (winged can and sponsorship invitation).
- **Ultra-Smooth Hardware-Synchronized Scrub Engine**:
  - Built with a non-blocking seek queue that synchronizes with the GPU decoder via the HTML5 `seeked` event and `requestAnimationFrame`.
  - Prevents seek cancellation jitter and frame dropping even during rapid mouse-wheel or touch scrolling.
  - Integrated with **Lenis** smooth scrolling and **GSAP ScrollTrigger** for tactile, momentum-based scrolling.
- **Authentic Blueprint Can Design**:
  - Rendered to the exact specifications of the official **Red Bull 8.4 FL OZ (250 ml)** orthographic blueprint:
    - Official blue pull-tab with the punched-out bull silhouette cutout.
    - Polished 53 mm beveled aluminum rim and chine.
    - Official bold red `Red Bull®` logo and muscular colliding charging bulls with golden-yellow sun.
    - Crisp `ENERGY DRINK` typography.
    - Brushed metallic silver and deep Energy Blue quadrants with vertical sheen and condensation droplets.
    - `Vitalizes body and mind.®` and `8.4 FL OZ (250 ml)` labels.
- **Clean Final Invitation**:
  - Features the text: *"AIML Club invites you for inventra sponsorship"* and *"Red Bull Gives You Wiiings"*.
  - Clean dark aesthetic with AIML Club circuit branding and Inventra 2026 marks.
- **Built-in Inspection Route**:
  - Includes a `/preview` route for side-by-side comparison of the original frame vs. the blueprint-designed frame with 100% zoom capability.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Animation & Scroll Control**: [GSAP](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Video & Asset Processing**: FFmpeg (All-Intra GOP=1 H.264, FastDecode), OpenCV, Pillow

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Ashmit-tiwari/Red_Bull_giveyou_Wiiings.git
cd Red_Bull_giveyou_Wiiings
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To access the server across your local network (e.g. on mobile):
```
http://<YOUR_LAN_IP>:3000
```

### 4. Interactive Blueprint Preview
To inspect the final frame design and compare before/after details:
```
http://localhost:3000/preview
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
├── public/
│   ├── redbull-video-1080.mp4       # Optimized all-intra 60fps scrub video
│   ├── redbull-video.mp4            # 1440p master scrub video
│   ├── poster-first.jpg             # Initial can frame
│   ├── poster-final.jpg             # Blueprint-accurate final invitation frame
│   ├── preview_blueprint_can.jpg    # High-res 1440p blueprint reference
│   └── icon.svg                     # Site favicon
├── src/
│   ├── app/
│   │   ├── globals.css              # Dark theme, hidden scrollbar, Lenis rules
│   │   ├── layout.tsx               # Root viewport and metadata setup
│   │   ├── page.tsx                 # Main client entry importing VideoScrubber
│   │   └── preview/
│   │       └── page.tsx             # Interactive before/after preview comparison
│   └── components/
│       ├── VideoScrubber.tsx        # High-performance RAF seek engine & GSAP setup
│       └── CinematicVideoScrubber.tsx # Compatibility re-export
├── next.config.mjs                  # Dev origins and Next.js settings
├── postcss.config.mjs               # Tailwind CSS v4 PostCSS plugin
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Scripts and dependencies
```

---

## ⚙️ Engineering Highlights

### Non-Blocking Video Scrubbing Engine
Standard HTML5 video scrubbing with `video.currentTime = target` triggers asynchronous hardware decodes. If a script updates `currentTime` on every animation frame (every 16 ms) during rapid scrolling, ongoing decodes get aborted, causing video freezing and sudden jumps.

This project implements an event-driven queue:
1. `ScrollTrigger` updates `targetTime` based on scroll progress.
2. If the video is currently seeking (`isSeeking === true`), the timestamp is saved into `pendingSeekTime`.
3. When the GPU decoder finishes the frame, the browser dispatches the `seeked` event, which immediately triggers the latest queued seek.
4. An animation frame synchronization loop coordinates with display refresh rates for smooth forward and reverse playback.

---

## 👥 Credits

- **Organized by**: AIML Club
- **Event**: Inventra 2026
- **Brand**: Red Bull

# AIML Club × Red Bull | Inventra 2026
### Full-Screen Scroll-Controlled Cinematic Video Experience

An interactive cinematic web application transforming a high-definition video into an interactive scroll-driven journey for Red Bull's sponsorship invitation at Inventra 2026.

---

## 🎬 Creative Direction & Core Concept

This website is **not a traditional webpage with an embedded video player**. The entire webpage *is* the video, transformed into a tactile, scroll-controlled interactive experience:

- **SCROLL 0%** $\rightarrow$ Beginning of the video: Dark, macro close-up of an ice-cold, condensation-covered Red Bull can.
- **SCROLL 50%** $\rightarrow$ Middle of the video: Developer coding late at night in a dark terminal environment, fueled by Red Bull.
- **SCROLL 100%** $\rightarrow$ Final invitation frame: The Red Bull can sprouts glowing cybernetic wings, locking onto the official invitation:
  > **"AIML Club for inventra Sponsorship"**  
  > **"Red Bull Gives You Wiiings"**  
  > *AIML Club Tech Monogram (bottom-left) & Inventra 2026 Sparkle (bottom-right)*

- **Bidirectional Control**:
  - Scrolling down plays the video forward.
  - Scrolling up reverses the video backward smoothly.
  - The final frame remains permanently locked and visible when reaching 100% scroll.

---

## ⚡ Technical Highlights

### 1. Dedicated `requestAnimationFrame` Scrub Engine
Rather than triggering raw seek events on every scroll event, the playback engine decouples scroll tracking from video decoding:
- **GSAP ScrollTrigger** computes target timestamps based on scroll progress $[0.0, 1.0]$.
- A dedicated **`requestAnimationFrame` rendering loop** smoothly interpolates (`lerp`) toward the target timestamp.
- A non-blocking seek dispatcher checks `!video.seeking` and handles the browser's `seeked` event, ensuring fast scrolling never creates a pipeline backlog or frame dropouts.

### 2. GOP-1 (All-Intra) Video Architecture
Standard MP4 videos place keyframes (I-frames) every 1–2 seconds, causing browser decoders to stutter or lag when seeking backwards across delta frames.
- Both production streams (`1440p` for desktop and `1080p` for mobile) were encoded with **GOP = 1 (`-g 1 -keyint_min 1`)**, meaning **every single frame is an intra-keyframe**.
- Any frame can be decoded in sub-millisecond time, achieving true 60fps/120fps bidirectional scrubbing.
- The MP4 files include `faststart` moov atoms so scrubbing begins immediately without waiting for full downloads.

### 3. Lenis Smooth Scroll + GSAP Synchronization
- **Lenis** provides momentum-based, physics-driven smooth scrolling.
- Lenis is locked to **GSAP's internal ticker** (`gsap.ticker.add((time) => lenis.raf(time * 1000))`) with `lagSmoothing(0)` for zero-jitter synchronization.

### 4. Minimalist Interface & Atmosphere
- **Zero Distractions**: No standard sections (no About, Services, or Contact pages).
- **Subtle Branding**: Clean `AIML CLUB / INVENTRA '26` pill in the top-left.
- **Dynamic Indicators**: 
  - `Scroll To Scrub Experience` cue at 0% that gently fades out as user scrolls.
  - Monospace progress indicator (`0%` $\rightarrow$ `100%`).
  - Contextual scene indicator (`CAN CLOSE-UP` $\rightarrow$ `COLD HISS` $\rightarrow$ `DEV FOCUS` $\rightarrow$ `WINGS REVEAL` $\rightarrow$ `OFFICIAL INVITATION`).
- **Sound Toggle**: Optional synchronized audio playback (`SOUND: OFF / ON`) matching the video timeline.
- **End-State Actions**: Minimal `REPLAY` and `CONNECT` actions reveal when reaching the invitation frame.

### 5. Proper Loading State
- Dark obsidian loading screen displaying real-time video buffer percentage (`0%` $\rightarrow$ `100%`).
- Energy-gradient progress bar matching Red Bull colors (Red, Gold, Cyan).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Scroll Physics & Animation**: GSAP + ScrollTrigger + Lenis
- **Icons**: Lucide React
- **Media Optimization**: FFmpeg (GOP-1, H.264 FastDecode, Web FastStart)

---

## 📁 Project Structure

```
├── public/
│   ├── redbull-video.mp4        # 1440p GOP-1 all-intra video stream (desktop)
│   ├── redbull-video-1080.mp4   # 1080p GOP-1 all-intra video stream (mobile)
│   ├── poster-first.jpg         # Frame 00s cover poster
│   ├── poster-final.jpg         # Frame 30s HD invitation poster
│   └── audio.mp3                # Synchronized soundtrack
├── src/
│   ├── app/
│   │   ├── globals.css          # Theme variables & Lenis smooth scroll CSS
│   │   ├── layout.tsx           # RootLayout with dark theme metadata
│   │   └── page.tsx             # Dynamic client entry point
│   └── components/
│       ├── CinematicVideoScrubber.tsx # Core RAF scrub engine & ScrollTrigger
│       ├── LoadingScreen.tsx          # High-contrast cinematic buffer loader
│       └── MinimalUI.tsx              # Minimal branding, cues & sound toggle
├── next.config.mjs              # Next.js configuration
├── package.json                 # Project dependencies & scripts
├── postcss.config.js            # Tailwind CSS v4 configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Execution
```bash
npm run build
npm run start
```

---

## 📱 Mobile & Responsive Behavior

- Automatically detects screen size:
  - Mobile screens ($< 768\text{px}$) stream the lightweight 1080p GOP-1 video.
  - Desktop screens stream the full 1440p QHD GOP-1 video.
- Native touch drag and trackpad gestures seamlessly scrub forward and backward.

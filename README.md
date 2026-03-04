# 🚀 Introduction — Omer Zahid

Welcome to the **Introduction Project**, a personal portfolio site and interactive AI experience built by **Omer Zahid**.

## 🔗 Quick Links

- **Home/Resume:** [https://www.omerzahid.com](https://www.omerzahid.com)
- **About/Projects:** [https://www.omerzahid.com/about](https://www.omerzahid.com/about)
- **Resume Generator:** [https://www.omerzahid.com/resume-generator](https://www.omerzahid.com/resume-generator)
- **AI Chat:** [https://www.omerzahid.com/ask-me](https://www.omerzahid.com/ask-me)
- **Space Game:** [https://www.omerzahid.com/darthVader](https://www.omerzahid.com/darthVader)

## 🌌 Overview

This project combines a **React + Vite** frontend hosted on **GitHub Pages** with an **AI-powered chatbot** and an **interactive space-themed shooting game**. The site features:

- 🎯 **Interactive Portfolio** - Showcase of projects and experience
- 🤖 **AI Chatbot** - Matrix-themed terminal interface powered by Microsoft Phi-4 Mini
- 🎮 **Space Game** - Darth Vader-themed shooting game with boss battles
- 📝 **Resume Generator** - AI-powered tool to customize resumes for job applications
- 🚀 **Custom Spaceship Cursor** - Immersive space-themed UI

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | React 19 + Vite | Fast, modern UI framework |
| **Routing** | React Router 7 | Client-side navigation |
| **Styling** | TailwindCSS + Framer Motion | Responsive design & animations |
| **Hosting** | GitHub Pages | Static site hosting |
| **Backend (AI Proxy)** | Cloudflare Workers | Secure API proxy for AI requests |
| **AI Model** | Microsoft Phi-4 Mini Instruct | Chat responses and content generation |
| **Game Engine** | Canvas 2D API | Custom game loop and physics |
| **Build Tool** | Vite with compression | Optimized production builds |

---

## 🛰️ Features

### AI Chatbot
- Matrix-themed terminal interface with animated background
- Markdown support for formatted responses
- Typewriter effect for AI responses
- Powered by Microsoft Phi-4 Mini through Cloudflare Workers proxy

### Space Game
- 2D shooting game with progressive difficulty
- Multiple enemy types and boss battles
- Mobile joystick support for touch devices
- Custom spaceship cursor that doubles as the player

### Resume Generator
- AI-powered resume customization
- Tailors resumes to specific job descriptions
- Generates matching cover letters
- Uses the same AI proxy infrastructure

### About Page — ProjectCard Hover Animations

Each project card on the About page displays a unique animated background when hovered (or focused via keyboard).

**How it works:**
- Hovering (or keyboard-focusing) a card activates a Canvas-based particle animation scoped only to that card.
- Animated emoji particles move across the card background based on the project's identity (e.g., 🚗🚙🏎️ cars for NYC LUX RIDE, ✈️🛩️ planes for Bell Aviation).
- Particles are clipped to the card bounds and rendered below all card content via `z-index`, so title/description/button/tech stack remain fully legible.
- Only the hovered card animates — no other cards are affected.
- Animation loop is managed with `requestAnimationFrame` and is fully cleaned up on mouse-leave or unmount.

**Animation profile mapping (project `animKey` → theme):**

| animKey | Project | Symbols |
|---------|---------|---------|
| `nyc-lux-ride` | NYC LUX RIDE | 🚗 🚙 🏎️ 🚕 |
| `bell-aviation` | Bell Aviation / ROMISOFT | ✈️ 🛩️ 🛫 |
| `tikka-masala` | Tikka Masala | 🌶️ 🍛 🫙 🌿 |
| `skylight-ksa` | SkyLight \| KSA | ⚡ ✨ 💡 🌟 |
| `deebas-daycare` | Deeba's Day Care | 🎈 ⭐ 🌈 🎀 |
| `oz-studios` | OZ Studios | 💻 🚀 ⚡ 🌐 |
| `elia-barber` | ELIA Barber Shop | ✂️ 💈 🪒 💇 |
| `rashida-daycare` | Rashida Little Champs | 🌟 🎠 🎨 🎪 |

**Adding a new project animation profile:**
1. Add an `animKey` field to the project entry in `src/features/resume/data/projects.js`.
2. Add a matching entry in `src/features/resume/utils/animationProfiles.js` with `symbols`, speed ranges (`vxRange`, `vyRange`), `sizeRange`, `opacityRange`, and `count`.
3. If no profile exists for the key, the default sparkle profile (`✨ ⭐ 🌟`) is used automatically.

**Accessibility & reduced-motion:**
- Keyboard users trigger the same animation via `focus`/`blur` events on the card.
- When the OS/browser `prefers-reduced-motion: reduce` media query is active, the canvas stays cleared and no animation runs — a clean static fallback.
- The canvas layer has `pointer-events: none` and `aria-hidden="true"` so it never blocks links or assistive technology.

**Relevant source files:**
- `src/features/resume/data/projects.js` — `animKey` field per project
- `src/features/resume/utils/animationProfiles.js` — profile registry
- `src/features/resume/hooks/useCardHover.js` — hover/focus state hook
- `src/features/resume/components/CardHoverBackground.jsx` — Canvas animation component
- `src/features/resume/pages/About.jsx` — ProjectCard integration
- `src/features/resume/pages/About.css` — canvas positioning styles

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Setup Instructions

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/mz9201ju/Introduction.git
cd Introduction
```

#### 2️⃣ Install Dependencies
```bash
npm.cmd install
```

#### 3️⃣ Run Development Server
```bash
npm.cmd run dev
```

The site will be available at `http://localhost:5173`

#### 4️⃣ Build for Production
```bash
npm.cmd run build
npm.cmd run preview
```

### Available Scripts

- `npm.cmd run dev` - Start development server
- `npm.cmd run build` - Build optimized production bundle
- `npm.cmd run preview` - Preview production build locally
- `npm.cmd run lint` - Run ESLint code quality checks
- `npm.cmd run test:e2e` - Run Playwright browser smoke tests
- `npm.cmd run test:e2e:headed` - Run Playwright tests in headed mode
- `npm.cmd run test:e2e:report` - Open Playwright HTML report

### Windows-safe Verification (Recommended)

Run lint and build in one command:

```bash
npm.cmd run lint; npm.cmd run build
```

If PowerShell execution policy blocks scripts, use:

```bash
powershell -ExecutionPolicy Bypass -Command "npm.cmd run lint; npm.cmd run build"
```

### Playwright E2E

Install browser runtime once after dependencies are installed:

```bash
npx playwright install --with-deps chromium
```

GitHub workflow for agent/CI live tests:
- Workflow file: `.github/workflows/playwright-live.yml`
- Trigger manually with `workflow_dispatch`
- Optional input `target_url`:
	- empty => tests run against local build preview
	- set URL => tests run against that live deployment

---

## 🚀 Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch. The build process:

1. Vite builds optimized bundles with code splitting
2. Assets are compressed using Brotli and Gzip
3. Static files are deployed to `gh-pages` branch
4. Available at `https://www.omerzahid.com`

---

## 🔎 SEO Automation (No Manual Work)

If `public/sitemap.xml` declares a weekly cadence, it should be validated automatically every week.

### Recommended setup (hands-off)

Use a scheduled GitHub Actions workflow (`cron`) that runs once per week and does this:

1. Fetches and parses `public/sitemap.xml`
2. Verifies required routes are present:
	- `/`
	- `/about`
	- `/ask-me`
	- `/resume-generator`
	- `/darthVader`
3. Fails the workflow if any route is missing
4. Opens an issue automatically (or sends notification) when sitemap drift is detected

### Optional stronger automation

To avoid any manual updates, generate `public/sitemap.xml` during CI from a single route source (for example from the app route config) and commit the updated file automatically using a bot token.

### Suggested schedule

- Weekly check: every Monday (UTC)
- Extra trigger: on every push to `main`

This ensures sitemap freshness stays aligned with the declared weekly cadence without your manual involvement.

---

## ⚡ Performance Optimizations

This project has been optimized for performance:

- **Code Organization**: Centralized theme constants and API utilities to reduce duplication
- **Bundle Optimization**: Vite's automatic code splitting and tree shaking
- **Asset Compression**: Brotli and Gzip compression for smaller file sizes
- **Lazy Loading**: Route-based code splitting with React Router
- **Canvas Optimization**: Efficient rendering with requestAnimationFrame
- **Memory Management**: Proper cleanup of event listeners and intervals

---

## 📬 Author

**Omer Zahid**  
📧 omer.zahid@mnsu.edu  
🌐 [www.omerzahid.com](https://www.omerzahid.com)

---

## 🎨 Assets & Credits

- **Spaceship Cursor Icon:** [Freepik - Flaticon](https://www.flaticon.com/free-icons/ufo)
- Used under [Flaticon Free License](https://www.flaticon.com/license)

---

## 🛡️ License

This project is open source and available under the MIT License.

# Anas Abdulmajeed — Portfolio

React + Three.js (react-three-fiber) + GSAP ScrollTrigger + Lenis smooth scroll, built with Vite.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Deploy to Vercel

Push this folder to a GitHub repo, then import it at vercel.com — Vercel auto-detects Vite
(build command `vite build`, output `dist`). No config file needed. Or from the CLI: `npx vercel`.

## Before you deploy — required edits

Everything you would ever change lives in **`src/data/content.js`**:

1. **Social links** — GitHub and LinkedIn are `#` placeholders. A portfolio without them
   undercuts itself.
2. **Project links** — all five are `#`. Add live URLs (cards only open a new tab once a
   real URL is set).
3. **Client names** — Saudi Games, IsDB Group, Mitsubishi etc. are named publicly on this
   site. Confirm you're contractually allowed to attribute each one; delete any you're not.
4. Availability line, tagline, and copy — adjust to taste.

## Where things live

| What | Where |
| --- | --- |
| All text, projects, stats, links | `src/data/content.js` |
| Colors, fonts, spacing | `:root` tokens in `src/styles/index.css` |
| Font files | `<link>` in `index.html` (Bricolage Grotesque / Archivo / Chivo Mono) |
| 3D object, lights, scroll waypoints | `src/components/Scene.jsx` (`KEYS` array) |
| Horizontal work gallery | `src/components/Projects.jsx` |
| Preloader timing | `src/components/Preloader.jsx` |

## Behavior notes

- The 3D object travels hero → about → work → contact and "heats up" (brighter rim light,
  faster spin, stronger wire) as you approach the contact section.
- The work gallery pins and scrolls horizontally on desktop; on mobile and for users with
  `prefers-reduced-motion`, it falls back to a vertical list.
- Reduced motion disables Lenis, the preloader, reveals, and idle 3D spin — the site stays
  fully readable and reachable.
- Fonts load from Google Fonts at runtime. To self-host later, replace the `<link>` in
  `index.html` with `@font-face` rules.

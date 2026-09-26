# Deploying DrainCast

DrainCast is a **fully client-side Vite + React SPA**. There is no server to
run, no database to provision and **no paid API key anywhere** — a static host
is all it takes. This guide covers Vercel (recommended), Netlify and local
runs, plus the troubleshooting table for the classic failure modes.

---

## 1 · Vercel (recommended)

### Fresh import — the 60-second path

1. Push your code to GitHub.
2. In Vercel: **Add New… → Project → Import** your `DrainCast` repository.
3. **Framework Preset:** `Vite` (auto-detected — leave as is).
4. **Root Directory:** click *Edit* and select **`frontend`** ← this is the
   single most important field.
5. Leave Build Command / Output Directory / Install Command on **their
   defaults** — `frontend/vercel.json` pins them explicitly:
   - Install: `npm install`
   - Build: `npm run build` (runs `tsc -b && vite build`)
   - Output: `dist`
6. Click **Deploy**.

The `/dashboard` route works on Vercel because `frontend/vercel.json`
contains the SPA rewrite (`/(.*)` → `/index.html`). You do **not** need any
rewrite/redirect configured in the dashboard — it lives in the repo.

### Why your earlier deploy may have shown nothing / a 404 / a blank page

| Symptom on `*.vercel.app` | Cause | Fix |
| --- | --- | --- |
| `404_NOT_FOUND` on every page, including `/` | Root Directory was left at the repo root, so Vercel found no `package.json` to build | Set Root Directory to `frontend` (or rely on the root `vercel.json` + `package.json` added in this repo, which build `frontend/dist` even without a Root Directory) |
| Landing page works, `/dashboard` → 404 | SPA rewrites not applied | `frontend/vercel.json` rewrites are applied automatically when Root Directory = `frontend`; re-import or redeploy |
| Blank white page | Output Directory wrong (static copy of the *source* `index.html` served instead of the build) | `outputDirectory: "dist"` is pinned in `frontend/vercel.json`; check Settings → General has nothing overriding it |
| Build fails with a syntax/`SyntaxError` from `@tailwindcss/vite` | Project pinned to Node 18 — Tailwind v4 / Vite 6 need Node ≥ 20 | `engines.node >= 20` is now declared in both `package.json` files, and Vercel honours it; or set Settings → General → Node.js Version to `22.x` |
| `tsc: not found` / missing dev dependency | devDependencies skipped during install | Vercel installs dev deps by default; don't enable "production" installs for this project |

> **Note:** Vercel dashboard *Build & Output* overrides beat `vercel.json`.
> If an old project has stale values there, either clear them (set to
> *Default*) or delete + re-import the project — the fresh-import path above
> needs zero manual settings.

### Updating the live site

Vercel redeploys automatically on every push to the connected branch
(usually `main`). Manual redeploy: **Deployments → ⋯ → Redeploy**.

---

## 2 · Netlify

Already wired via `netlify.toml` (base `frontend`, publish `dist`, Node 22,
SPA redirect). Just import the repo — no settings needed.

---

## 3 · Local

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → frontend/dist
npm run preview  # serve the built SPA locally
```

---

## 4 · Free / keyless services used (nothing to pay for)

| Capability | Service | Key needed? |
| --- | --- | --- |
| Map basemap (dark + light) | CARTO raster basemaps (`basemaps.cartocdn.com`), OSM attribution | ❌ free |
| Basemap fallback | Standard OpenStreetMap tiles (`tile.openstreetmap.org`) — auto-switches if CARTO errors | ❌ free |
| Flood-safe routing | Built-in risk-weighted Dijkstra over the bundled Velachery road graph (Leaflet Routing Machine renders it client-side) | ❌ offline |
| Rainfall / terrain / drainage data | Bundled demo datasets in `frontend/src/data` | ❌ offline |
| Fonts (Inter, IBM Plex Sans, JetBrains Mono) | `@fontsource` — bundled at build time, no Google Fonts CDN | ❌ offline |
| Charts | Chart.js (client-side) | ❌ offline |

No Google Maps, Mapbox, or weather-API keys are involved at any point.
Everything works on a plain static host with zero environment variables.

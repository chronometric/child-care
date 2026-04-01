# Child Care — Web Application (Frontend)

A React single-page application for child-care telehealth. Clinicians manage sessions and documentation; patients and guests join secure video rooms; administrators oversee organizations. The app covers scheduling, files, in-room chat and waiting-room flows, and optional AI-assisted session documentation aligned with clinical governance.

## Tech stack

| Area | Technology |
|------|------------|
| UI | React 18, TypeScript, Tailwind CSS, Framer Motion |
| State | Redux Toolkit |
| Routing | React Router v6 |
| HTTP | Axios (shared client with auth interceptors) |
| Realtime | Socket.IO client (waiting room, in-room chat, presence) |
| Video | Metered (WebRTC rooms via app context / SDK) |
| Build | Vite 6 |
| E2E | Playwright |

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (or pnpm/yarn with equivalent scripts)
- Running the **child-care-backend** service (or your deployed API) with matching JWT and Socket.IO configuration
- A **Metered** account for WebRTC rooms (credentials live on the backend; the client uses the backend URL only)

## Environment variables

Copy `.env.example` to `.env`. Vite exposes only variables prefixed with `VITE_`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes | Base URL of the API (e.g. `http://localhost:8000`). Used for REST calls and Socket.IO; no trailing slash required. |
| `VITE_ENABLE_COMMERCIAL_FLOWS` | No | Set to `true` to surface payment / registration billing flows when implemented. |

Never commit `.env` or production secrets.

## Install and run

```bash
npm install
npm run dev
```

The dev server binds to `0.0.0.0` so other devices on the network can reach it during testing. Adjust `vite.config.ts` if you need a fixed port.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with HMR |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run preview` | Local preview of the production build |
| `npm run lint` | ESLint on `.ts` / `.tsx` |
| `npm run start` | Static serve of `dist/` (e.g. `serve -s dist -l 5000`) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run test:e2e:ui` | Playwright with UI mode |

### End-to-end tests

Playwright targets Chromium by default. Install browsers once:

```bash
npx playwright install chromium
```

Optional environment variables for tests that perform a real login:

| Variable | Description |
|----------|-------------|
| `E2E_USER_EMAIL` | Doctor account email |
| `E2E_USER_PASSWORD` | Doctor account password |
| `PLAYWRIGHT_BASE_URL` | Override base URL (default `http://127.0.0.1:5173`) |
| `E2E_SKIP_WEBSERVER` | Set to skip auto-starting Vite (if you run it yourself) |

Tests under `e2e/` cover sign-in, room creation entry, and room chat UI. Login-dependent specs are skipped when credentials are not set.

## Roles and main routes

| Role | Entry | Capabilities |
|------|--------|----------------|
| **Clinician** | `/auth/sign-in` | Dashboard, rooms, calendar, files, patients, settings, room detail (video, waiting room, chat, post-session AI documentation). |
| **Patient** | Patient sign-in / links | Waiting room until admitted; then Metered session. |
| **Guest** | Guest sign-in | Limited scope; waiting room and session flows. |
| **Admin** | `/admin/sign-in` | Company overview, users, system metrics, AI settings, governance audit (backed by admin APIs). |
| **Student / portal** | `/student` | Upcoming sessions and optional shared documentation when enabled. |

Canonical routing lives in `src/routes/AppRoutes.tsx`.

## Project layout

```
src/
  components/     # Shared UI, layout, room widgets, dialogs
  pages/          # Screens: auth, dashboard, room, admin, calendar, files, …
  store/          # Redux slices
  hooks/          # Reusable hooks (e.g. Web Speech transcript)
  libs/           # API client, token helpers
  routes/         # Route tree and animated transitions
```

## API and realtime

- **REST:** `src/libs/api.ts` uses `VITE_BACKEND_URL` as `baseURL`. JWT is sent when present (see `libs/token` / `localStorage`).
- **Socket.IO:** Connects to the same host as `VITE_BACKEND_URL` with path `/socket.io/` and transports appropriate for your deployment.

## Security and production

- Serve the app over **HTTPS** in production for tokens, camera, and microphone.
- Restrict CORS and API exposure on the backend; do not expose admin or file endpoints publicly without authentication.
- Keep dependency updates on a regular cadence (`npm audit` as a starting point).

## License

Private / unlicensed unless otherwise specified by the project owners.

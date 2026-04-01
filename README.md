# Child Care — Web Application (Frontend)

A React single-page application for child-care telehealth: doctors manage sessions, patients and guests join video rooms, administrators oversee organizations, and workflows support scheduling, files, and post-session AI-assisted documentation.

## Tech stack

| Area | Technology |
|------|------------|
| UI | React 18, TypeScript, Tailwind CSS, Framer Motion |
| State | Redux Toolkit |
| Routing | React Router v6 |
| HTTP | Axios (shared client with auth interceptors) |
| Realtime | Socket.IO client (waiting room, in-room signaling) |
| Video | Metered (via `MeetingContext` / SDK) |
| Build | Vite |

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (or compatible package manager)
- Running **backend API** (see the companion `child-care-backend` repository) and a configured **Metered** account for WebRTC rooms

## Environment variables

Create a `.env` file in this directory (or set variables in your hosting provider):

| Variable | Required | Description |
|----------|----------|---------------|
| `VITE_BACKEND_URL` | Yes | Base URL of the API, e.g. `http://localhost:8000` (no trailing slash required for typical Axios usage). Used for REST calls and Socket.IO. |

Vite exposes only variables prefixed with `VITE_`.

## Install and run

```bash
npm install
npm run dev
```

The dev server listens on all interfaces (`0.0.0.0`) by default—adjust in `vite.config.ts` if needed.

### Other scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint on `ts` / `tsx` |
| `npm run start` | Serve `dist` (e.g. for simple static hosting) |

## Application roles and main routes

- **Doctor (user)** — Authenticated main app: dashboard, rooms list, calendar, files, patient records, room detail (video + waiting-room controls + post-meeting AI notes), room creation wizard.
- **Patient** — Enters via patient login / deep link; **waiting room** until the host admits; then joins the Metered session.
- **Guest** — Similar flow with guest credentials / link; limited scope.
- **Admin** — Separate sign-in; company overview, user directory, system metrics, AI-related settings (backed by admin APIs).

Routes are defined in `src/components/layout/AnimatedRoutes.tsx` (and mirrored in `src/routes/index.tsx` where applicable).

## Project layout (high level)

```
src/
  components/     # Shared UI, layout, room widgets
  pages/          # Route-level screens (auth, dashboard, room, admin, patients, …)
  store/          # Redux slices
  libs/           # API client, helpers
  config/         # Environment-driven endpoints
```

## API and realtime

- REST calls use `src/libs/api.ts` with `VITE_BACKEND_URL` as `baseURL`. JWT is attached when present in `localStorage`.
- Socket.IO connects to the same origin as `VITE_BACKEND_URL` with path `/socket.io/` (see patient/guest/room pages).

## Security notes

- Never commit `.env` or production secrets.
- Ensure HTTPS in production for auth cookies/tokens and camera/microphone permissions.

## License

Private / unlicensed unless otherwise specified by the project owners.

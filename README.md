# Thing Tracker

> Tell the person what you want and when you want it. The clearer you can be, the easier it is for everyone.

Thing Tracker is a personal productivity tool for tracking things you've asked other people to do. Instead of losing requests in chat threads or email, you log them in one place — who owes you what, when you asked, and when you need it by — with a visual timeline that shows you at a glance what's on track and what's overdue.

![Thing Tracker screenshot](thing-tracker.png)

---

## Use Case

You ask a colleague to send you a report. You ask a friend to confirm plans. You ask your team to review a document. These requests scatter across Slack, email, and memory — and things fall through the cracks.

Thing Tracker gives each request a row in a table with:
- **What** you asked for
- **Who** you asked
- **When** you asked
- **When you need it by** — selected visually on a timeline grid
- A color-coded status: green (on track), red (overdue), dashed (done)

You can organize requests into named **trackers** (e.g. Personal, Work, Side Projects) and filter by Open, Closed, or All.

---

## How It Works

### Architecture

Thing Tracker is a React/Vite frontend backed by a small **Hono** API that stores everything in a **SQLite** database. Users sign in with **Clerk**, and all data is scoped per user.

```
React/Vite frontend  (@clerk/clerk-react)
   │  fetch /api/* with  Authorization: Bearer <Clerk session token>
   ▼
Hono backend  (server/)
   │  clerkMiddleware() -> userId   (401 if absent)
   ▼
better-sqlite3  ->  data.db   (requests + trackers, every query scoped by user_id)
```

- Each request is a row in the `requests` table.
- The signed-in **Clerk user** owns their rows — the backend verifies the session token on every call and filters every query by `user_id`, so users only ever see their own data.
- A small `trackers` table holds each user's named trackers. A new user is seeded with **Personal** and **Work** on first sign-in.

### Data model

```sql
requests(id, user_id, description, person, tracker, asked_date, due_date, is_done)
trackers(user_id, name)
```

`is_done` drives the Open/Closed/All filter; `asked_date` is set to the day the request is created; `due_date` is the cell you pick on the timeline grid.

### Visual timeline grid

Each row displays a grid of 12 cells representing time from the date the request was made:

| Section | Cells | What each cell means |
|---|---|---|
| DAYS | 5 | +1d, +2d, +3d, +4d, +5d from asked date |
| WEEKS | 4 | +1w, +2w, +3w, +4w from asked date |
| MONTHS | 3 | +1m, +2m, +3m from asked date |

**Cell colors:**
- **Green** — time has elapsed, request is still within due date (on track)
- **Red** — time has elapsed, due date has passed (overdue)
- **Empty** — time hasn't elapsed yet (future)
- **Dashed** — request is marked done
- **Circle outline** — marks the due date cell

Clicking any cell on a row sets that cell as the new due date.

### Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS Modules |
| Backend | Hono (`@hono/node-server`) |
| Database | SQLite (`better-sqlite3`) |
| Auth | Clerk (`@clerk/clerk-react` + `@hono/clerk-auth`) |

---

## Setup

### Prerequisites

- Node.js 22+ (uses `node --env-file` and `--watch`)
- npm
- A free [Clerk](https://dashboard.clerk.com) application

### Step 1 — Install

```bash
git clone https://github.com/YOUR_USERNAME/thing-tracker.git
cd thing-tracker
npm install
```

### Step 2 — Configure Clerk

Create an application in the [Clerk dashboard](https://dashboard.clerk.com), then copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx   # frontend (Clerk React)
CLERK_PUBLISHABLE_KEY=pk_test_xxx        # backend (clerkMiddleware)
CLERK_SECRET_KEY=sk_test_xxx             # backend (JWT verification)
PORT=8787
DB_PATH=./data.db
```

> Only `VITE_`-prefixed vars are exposed to the browser, so the secret key never reaches the client. `.env` and `data.db` are gitignored.

### Step 3 — Run

```bash
npm run dev
```

This starts the API on `:8787` and Vite on `http://localhost:5173` (which proxies `/api` to the backend). Open the Vite URL, sign in with Clerk, and you'll land on your tracker with **Personal** and **Work** tabs.

### Build & run production

```bash
npm run build   # builds the frontend into dist/
npm start       # serves dist/ + /api from a single Hono process on :8787
```

To deploy, run this single Node process on a host with a persistent disk for `data.db` (e.g. Fly.io or Railway with a mounted volume).

---

## Project Structure

```
thing-tracker/
├── server/
│   ├── index.js                # Hono app: Clerk auth, /api routes, static serving
│   └── db.js                   # better-sqlite3: schema + per-user query functions
├── src/
│   ├── lib/
│   │   ├── dateUtils.js        # Grid cell math, date formatting
│   │   └── api.js              # fetch wrapper — attaches Clerk token, calls /api
│   ├── hooks/
│   │   ├── useTrackers.js      # Per-user tracker list (API-backed)
│   │   └── useRequests.js      # Fetch, create, and update requests
│   └── components/
│       ├── App/                # Root component, Clerk auth gate
│       ├── Settings/           # Tracker management modal
│       ├── TrackerView/        # Tracker tabs + filter bar + UserButton
│       ├── TrackerTable/       # Table header and row list
│       ├── TrackerRow/         # Single request row with inline editing
│       ├── NewRow/             # Inline add-request form
│       ├── DateGrid/           # 5d/4w/3m visual timeline and date picker
│       └── FilterBar/          # All / Open / Closed filter
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## Usage

### Adding a request

Click **+ Add** at the bottom of the table. A new row appears inline — type the description, the person's name, then click a cell on the timeline grid to set the due date. Press **Enter** or click **↵** to save.

### Editing a request

Click any description or person name to edit it inline. Click a grid cell to change the due date. All changes save to the database immediately.

### Marking done

Click the **✓** button on the right side of any row. The row gets a dashed style and is marked done (`is_done = 1`). Click **↩** to reopen.

### Managing trackers

Click the **⚙** settings icon in the top right to add or remove trackers. Sign out via the Clerk **user button** next to it.

---

## Privacy

All data lives in **your** SQLite database, behind Clerk authentication. The backend verifies each user's Clerk session token and scopes every query to their `user_id`, so users can only read and write their own requests. No data is sent to any third-party service beyond Clerk (for authentication).

---

## License

MIT

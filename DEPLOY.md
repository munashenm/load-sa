# Deploy Load SA to Railway (GitHub → live URL)

## Overview

1. Push code to **GitHub**
2. Create a **Railway** project linked to that repo
3. Add **PostgreSQL** + environment variables
4. Every `git push` redeploys the app automatically

---

## Step 1 — Push to GitHub

From the app folder:

```powershell
cd "c:\Users\Nimrod\Documents\Gravity Projects\Zim SA Delivery APP\zim-sa-delivery"

git init
git add .
git commit -m "Load SA delivery app"
```

Create a new repository on [github.com/new](https://github.com/new) (empty, no README).

```powershell
git remote add origin https://github.com/YOUR_USERNAME/load-sa.git
git branch -M main
git push -u origin main
```

> **Important:** The Railway service root must be this folder (`zim-sa-delivery`). If your GitHub repo is the parent folder, set **Root Directory** in Railway to `zim-sa-delivery`.

---

## Step 2 — Railway project

1. Go to [railway.app](https://railway.app) and sign in (GitHub login is easiest).
2. **New Project** → **Deploy from GitHub repo** → select your repo.
3. If prompted for root directory, enter: `zim-sa-delivery` (only if the repo root is the parent folder).

---

## Step 3 — PostgreSQL database

1. In the same Railway project: **+ New** → **Database** → **PostgreSQL**.
2. Open your **web service** → **Variables** → **Add Reference** → choose the Postgres service → `DATABASE_URL`.

Railway injects `DATABASE_URL` automatically when referenced.

---

## Step 4 — Required variables

On the **web service** (not the database), add:

| Variable          | Value |
|-------------------|--------|
| `SESSION_SECRET`  | Long random string (32+ chars). Generate: `openssl rand -hex 32` |
| `NODE_ENV`        | `production` |

Optional (first deploy only, then delete):

| Variable    | Value   |
|-------------|---------|
| `RUN_SEED`  | `true`  |

If you use `RUN_SEED`, add this **custom start** or run seed manually once via Railway shell:

```bash
npm run db:seed
```

---

## Step 5 — Deploy

Railway runs:

- **Build:** `npm run build`
- **Release:** `npx prisma migrate deploy` (creates tables)
- **Start:** `npm run start`

Open the generated **public URL** (Settings → Networking → Generate Domain).

---

## Step 6 — Demo data (production)

In Railway: open your service → **Settings** → run a one-off command or use the CLI:

```bash
railway run npm run db:seed
```

Demo logins (password `demo12345`):

- `customer@demo.co.za`
- `driver@demo.co.za`
- `admin@loadsa.co.za`

---

## Local dev with PostgreSQL (matches production)

```powershell
# Docker Postgres
docker run --name loadsa-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=loadsa -p 5432:5432 -d postgres:16

# Copy env
copy .env.example .env

npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `DATABASE_URL` is set before build, or build only needs `prisma generate` (already in `npm run build`) |
| App crashes on start | Check **Deploy Logs** — usually missing `DATABASE_URL` or `SESSION_SECRET` |
| Sign-in works locally but not online | Set `SESSION_SECRET` on Railway; redeploy |
| Old SQLite `.env` | Replace `file:./dev.db` with a PostgreSQL `DATABASE_URL` |

---

## Workflow after setup

```text
Edit code → git add → git commit → git push → Railway auto-deploys → test live URL
```

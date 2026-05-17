# Link Postgres + app (2 minutes) — then run the script

I cannot access your Railway account. You only need to do **Part A** once; **Part B** fills the database.

---

## Part A — Link database to app (you must click this)

1. Open your project on [railway.app](https://railway.app).
2. Click your **app** service (GitHub repo name — **not** the Postgres box).
3. Click **Variables**.
4. Click **+ New Variable** → **Add Reference** (or **Reference**).
5. Select **PostgreSQL** → variable **`DATABASE_URL`**.
6. Confirm the app variable name is **`DATABASE_URL`** → Save.

Add these two variables on the **same app** service (type them manually):

| Name | Value |
|------|--------|
| `SESSION_SECRET` | any long random text |
| `NODE_ENV` | `production` |

Wait until the app **redeploys** (green).

---

## Part B — Populate database (run on your PC)

Open PowerShell:

```powershell
cd "c:\Users\Nimrod\Documents\Gravity Projects\Zim SA Delivery APP\zim-sa-delivery"

npx @railway/cli login
npx @railway/cli link
```

When `link` asks:

- Pick your **project**
- Pick your **app / web service** (NOT Postgres)

Then run:

```powershell
.\scripts\railway-setup.ps1
```

> **If `railway` is not recognized:** use `npx @railway/cli` instead of `railway` (no global install).

### Plan B — Seed inside Railway (works with `postgres.railway.internal`)

Your app service can reach the DB. In Railway → **app service** → **Shell** (or one-off command), run:

```bash
npm run db:migrate
npm run db:seed
```

### Plan C — No CLI (copy **public** URL to your PC)

1. Railway → **Postgres** → **Variables** → copy **`DATABASE_URL`**
2. On your PC, create `zim-sa-delivery\.env` with that line (and `SESSION_SECRET=local`)
3. Run:

```powershell
cd "c:\Users\Nimrod\Documents\Gravity Projects\Zim SA Delivery APP\zim-sa-delivery"
.\scripts\seed-from-env.ps1
```

4. Ensure the **app** service on Railway also has `DATABASE_URL` (reference or same paste).

That runs migrations + demo users on Railway’s database.

---

## Test

Open your Railway **public URL** → **Sign in**:

- `customer@demo.co.za` / `demo12345`

---

## If the script fails

**“DATABASE_URL not found”** → Part A is not done on the **app** service.

**“Can't link”** → run `railway link` again and choose the web service.

**Paste the error** from the terminal and we can fix the next step.

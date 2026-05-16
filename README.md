# Load SA

Nationwide delivery marketplace for South Africa — like Bolt, but for freight. Customers book moves; verified drivers (bakkies, panel vans, light to heavy trucks, empty returns) accept jobs across all 9 provinces.

## Features

- **Customers**: Register, book pickup/drop-off anywhere in SA, get ZAR fare estimates, track booking status
- **Drivers**: Register, submit ID/licence/vehicle verification, go available, browse and accept open jobs
- **Admin**: Review and approve/reject driver applications
- **Vehicle types**: Motorcycle through truck + trailer; empty-return preference for backhaul drivers

## Deploy online (Railway + GitHub)

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step: push to GitHub → Railway → public URL.

## Quick start (local)

Requires **PostgreSQL** (see `.env.example`). Example with Docker:

```bash
cd zim-sa-delivery
docker run --name loadsa-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=loadsa -p 5432:5432 -d postgres:16
copy .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (password: `demo12345`)

| Role     | Email                 |
|----------|------------------------|
| Admin    | admin@loadsa.co.za     |
| Customer | customer@demo.co.za  |
| Driver   | driver@demo.co.za      |

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Prisma + PostgreSQL (Railway-ready)
- Session cookies, bcrypt passwords

## Production notes

- Set `SESSION_SECRET` to a long random string
- Use PostgreSQL: update `DATABASE_URL` in `.env` and `provider` in `prisma/schema.prisma`
- Add document upload (S3/Azure Blob) for licence/ID photos
- Integrate maps (Google/OSM) for real distance pricing and live tracking
- POPIA: privacy policy, data retention, driver consent flows

## Project structure

```
src/app/          Pages (landing, auth, book, driver hub, admin)
src/app/api/      REST API routes
src/components/   UI forms and panels
src/lib/          Auth, SA data, pricing, validations
prisma/           Schema and seed
```

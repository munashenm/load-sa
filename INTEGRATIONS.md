# Fluxmove integrations setup

## Paystack

1. Register at [paystack.com](https://paystack.com) and enable **South Africa (ZAR)** on your account.
2. Use **Test mode** keys for development (`sk_test_…` / `pk_test_…`).
3. Railway / `.env` variables:

```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxx
NEXT_PUBLIC_APP_URL=https://fluxmove.co.za
```

4. In Paystack dashboard → **Settings → API Keys & Webhooks**, set the webhook URL:  
   `https://fluxmove.co.za/api/paystack/webhook`

5. Customer flow: **Pay with Paystack** → redirect to Paystack checkout → return URL verifies payment → webhook confirms asynchronously.

6. Supported events: `charge.success` (handled automatically).

## Google Maps (address autocomplete & routing)

FluxMove uses Google Maps for **South African address autocomplete**, **real driving distance** in quotes, and **street-level tracking** when customers pick an address from suggestions.

1. Create a project in [Google Cloud Console](https://console.cloud.google.com) and enable:
   - **Maps JavaScript API** (Places Autocomplete on the booking form)
   - **Directions API** (server-side route distance for pricing)

2. Create an API key and restrict it:
   - **Browser key** → HTTP referrers (`fluxmove.co.za/*`, `localhost:*`) → use as `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
   - **Server key** → IP restrict to Railway → use as `GOOGLE_MAPS_API_KEY` (optional; falls back to the public key)

3. Add to Railway / `.env`:

```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_browser_key
GOOGLE_MAPS_API_KEY=your_server_key
```

4. Run the coords migration on deploy: `npm run db:migrate`

**Without Google Maps configured**, bookings still work with manual address entry and province-based distance estimates (same as before).

## Maps display (OpenStreetMap / Leaflet)

Tracking maps use **Leaflet + OpenStreetMap** tiles — no extra key. When bookings include lat/lng from Google Places, markers show street-level pickup/drop-off instead of city centres.

## Cloudinary (proof photos)

1. Create free account at [cloudinary.com](https://cloudinary.com).
2. Add to Railway:

```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

Drivers upload from web or mobile; images stored in folder `fluxmove/proof`.

## SMS & WhatsApp (Twilio)

Customer delivery updates, booking confirmations, and delivery OTP codes can be sent via **SMS** and/or **WhatsApp** using [Twilio](https://www.twilio.com).

1. Create a Twilio account and buy a South African SMS number (or use a trial number for testing).
2. For WhatsApp, enable the Twilio WhatsApp Sandbox (dev) or register a WhatsApp Business sender (production).
3. Add to Railway / `.env`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_FROM=+27XXXXXXXXX
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
SMS_ENABLED=true
WHATSAPP_ENABLED=true
NEXT_PUBLIC_APP_URL=https://fluxmove.co.za
```

4. Set `SMS_ENABLED=true` and/or `WHATSAPP_ENABLED=true` when credentials are ready. If Twilio is not configured, messages are skipped in production and logged in development.

**When messages are sent**

| Event | Channels |
|-------|----------|
| Booking created | SMS + WhatsApp confirmation with track link |
| Paystack payment complete | Delivery OTP + track link |
| Business booking (monthly invoice) | Confirmation + OTP immediately |
| Status updates (driver assigned, in transit, delivered) | SMS + WhatsApp |

Check **Admin → Notifications** for live messaging configuration status.

## Driver mobile app (Expo)

Production-ready driver workflow for on-the-go deliveries — accept jobs, navigate, share GPS, upload proof, and verify OTP.

```bash
cd driver-mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your Railway URL (LAN IP for local device testing)
npm install
npx expo start
```

### Features
| Screen | Capability |
|--------|------------|
| **Login** | Bearer token via `POST /api/auth/mobile` |
| **Jobs** | Vehicle-matched open jobs + active deliveries |
| **Job detail** | Google Maps navigation (street coords when available), status updates, background GPS (15s), camera proof upload, OTP completion |

### API used by mobile
- `GET /api/bookings` — filtered open jobs for driver's vehicle
- `GET /api/bookings/[id]` — full job with masked customer contact
- `POST /api/bookings/[id]/accept` — accept job
- `PATCH /api/bookings/[id]/status` — advance delivery status
- `PATCH /api/bookings/[id]/location` — live GPS (background task)
- `POST /api/bookings/[id]/proof` — photo proof (Cloudinary)
- `POST /api/bookings/[id]/verify-otp` — complete delivery
- `POST /api/upload` — base64 image upload from device camera

### Requirements
- Driver must be **verified** and **online** on the web hub to accept jobs
- **Cloudinary** env vars on the web service for proof photo uploads
- **Google Maps coords** on bookings improve navigation links (from address autocomplete)

Test on device with Expo Go; production builds via EAS.

**Note:** For local dev, use your PC LAN IP (`http://192.168.x.x:3000`), not `localhost`.

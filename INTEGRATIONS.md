# Load SA integrations setup

## PayFast

1. Register at [payfast.co.za](https://www.payfast.co.za) (use **Sandbox** for testing).
2. Railway / `.env` variables:

```
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=true
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
```

3. In PayFast dashboard, enable **ITN** and ensure notify URL is reachable:  
   `https://your-app.up.railway.app/api/payfast/notify`

4. Customer flow: **Pay with PayFast** → redirect → return URL → ITN confirms payment.

## Maps (OpenStreetMap)

Uses **Leaflet** — no API key. City centres approximate pickup/drop-off; driver GPS when shared.

Optional: set `NEXT_PUBLIC_GOOGLE_MAPS_KEY` later for Google Maps tiles.

## Cloudinary (proof photos)

1. Create free account at [cloudinary.com](https://cloudinary.com).
2. Add to Railway:

```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

Drivers upload from web or mobile; images stored in folder `loadsa/proof`.

## Driver mobile app (Expo)

```bash
cd driver-mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your Railway URL
npm install
npx expo start
```

- Login: `POST /api/auth/mobile` → Bearer token
- **Start background GPS** on active job (15s updates)
- Test on device with Expo Go; production builds via EAS

**Note:** For local dev, use your PC LAN IP (`http://192.168.x.x:3000`), not `localhost`.

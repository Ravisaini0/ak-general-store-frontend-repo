# AK General Store Frontend Production Deployment

## Required environment

Copy `.env.production.example` and provide:

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_MAPS_API_KEY`

## Build

```powershell
npm install
npm run build
```

## Recommended hosting

- deploy the `dist` folder behind HTTPS
- point `VITE_API_BASE_URL` to the secured backend domain
- use a restricted Google Maps browser key with domain allowlisting

## Pre-launch checks

- customer login, register, forgot password
- admin login and order management
- delivery login and delivery completion
- coupon apply flow
- checkout coverage validation
- OTP mail delivery from production SMTP

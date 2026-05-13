# FWA Engine  

This project is a Vite + React + TypeScript app and is ready for Vercel static deployment.

## Deploy on Vercel

1. Import this repository in Vercel.
2. Keep the root directory as `./`.
3. Framework preset can be left as `Vite`.
4. Add environment variables (if any are required in your Vercel project settings).
5. Deploy.

The repository includes `vercel.json` with:
- `installCommand`: `npm ci`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- SPA rewrite for React Router (`BrowserRouter`) so deep links do not 404.

## Local verification

Run:

- `npm ci`
- `npm run build`
- `npm run test`

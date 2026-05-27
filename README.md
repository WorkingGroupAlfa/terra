# Terra Energia Landing

A conversion-focused multilingual landing page inspired by bau-kh.de structure, adapted for warm air systems and green energy.

## Features

- React + Vite static site, deployable to Vercel
- Languages: English, Russian, Ukrainian, Slovak, German
- Mobile-first layout for TikTok / Instagram / Facebook / Google traffic
- Alpine wind-turbine hero background
- Contact and booking form
- Demo admin panel for form records
- CSV export

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Upload this folder to GitHub.
2. Import repository in Vercel.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.

## Admin

Click `Admin` in the header/footer.

Demo password:

```txt
terra-admin-2026
```

Important: this version stores form records in the browser localStorage for a fast demo. For production, connect the form to Supabase, Airtable, Google Sheets, Vercel KV, or your CRM API so leads are visible across devices and never lost.

# Creekside Plumbing & Gas

Static website built with HTML, CSS and JavaScript. Includes a quote wizard,
job application form, two-page project gallery (finished jobs and the crew at
work), reviews, FAQ and privacy policy.

Gallery photos are `assets/w1-w21.webp` (w1, w2, w4, w7 and w8 are no longer used).
The camera originals for w9-w18 live in `new images/`; originals for w19-w21
live in `images 2/` (DSCF0030, DSCF0061 and DSCF0032 respectively). Both folders
are git-ignored and not part of the deploy.

## Local preview

Run `python -m http.server 3000` from the project root, then open
http://localhost:3000. No dependency installation or build is required.

## Deploy to Vercel

Import `WorkingGroupAlfa/terra` and use the repository root as the Root Directory.
The production branch is `master`.

`vercel.json` selects the Other framework preset, skips dependency installation
and building, and serves files directly from the repository root. It overrides
the previous site's Vite build settings.

The main page is `/`; the privacy policy is `/privacy.html`.

## Configuration still needed

- **Form delivery:** `LEAD_ENDPOINT` in `js/ui.js` is empty. Both forms currently
  display a success message without delivering a request. Connect a real
  endpoint, validate inputs and handle the server response before accepting leads.
- **Analytics:** GA4 and Google Ads identifiers in `js/analytics.js` are empty.
- **Business details:** replace `CLIENT TO CONFIRM` placeholders in the FAQ and
  the matching JSON-LD in `index.html` with confirmed details.
- **Production domain:** canonical URLs, Open Graph metadata, structured data,
  `robots.txt` and `sitemap.xml` currently use `https://creeksideplumbing.com.au`.

Fonts and GSAP load from external providers. Images and video are stored locally
in `assets/`.

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

The photo-background variant is at http://localhost:3000/v2/ (or `/v2/` on
the deployed site). `v2/index.html` copies the current homepage and shares its
CSS, JavaScript, gallery and video assets. Only `v2/styles.css` adds the hero
photo treatment. It uses the original `v2/pc_cut.JPG` on desktop and
`v2/phone.JPG` below 900px, with proportional cropping and no image blur.
The photo height is bounded independently of the form; the original homepage
at `/` keeps its existing background.

## Deploy to Vercel

Import `WorkingGroupAlfa/terra` and use the repository root as the Root Directory.
The production branch is `master`.

`vercel.json` selects the Other framework preset, skips dependency installation
and building, and serves files directly from the repository root. It overrides
the previous site's Vite build settings.

The original homepage is `/`; the photo variant is `/v2/` (also `/v2`).
Explicit Vercel rewrites serve `v2/index.html` at both variant URLs. Photo and
variant stylesheet URLs are rooted at `/v2/` so they resolve with or without
a trailing slash. The privacy policy is `/privacy.html`.

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

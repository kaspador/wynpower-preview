# The Wynpower Group website

Static site for Werribee Accounting Service / Werribee Legal Service. No frameworks, no dependencies.

## Edit
- Page content: `src/pages/*.html` (settings for title/description/menu highlight are in the comment at the top of each file)
- Header, menu, footer (shared by every page): `src/layout.html`; menu items are in `build.mjs`
- Styles: `assets/css/site.css`
- Fee schedules and practice updates (PDF/Word): `assets/docs/`

## Build
    node build.mjs

Output goes to `dist/`. Upload the contents of `dist/` to any web host.

## Contact form
By default the form opens the visitor's email program addressed to info@wynpower.com.au.
To send submissions straight to the inbox instead, add a form service endpoint (e.g. Formspree)
to the form in `src/pages/contact.html`: `data-endpoint="https://formspree.io/f/xxxx"`.

## Moving off Wix
`dist/_redirects` maps the old Wix URLs (/news, /about-1, /services-1, etc.) to the new pages
(works on Netlify and Cloudflare Pages; on other hosts set up equivalent 301 redirects).

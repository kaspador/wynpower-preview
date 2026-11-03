# WynnsLegal website

Static site for WynnsLegal (wills, estates and estate planning, City of Wyndham). No frameworks, no dependencies.

## Edit
- Page content: `src/pages/*.html` (settings for title/description/menu highlight are in the comment at the top of each file)
- Header, menu, footer (shared by every page): `src/layout.html`; menu items are in `build.mjs`
- Styles: `assets/css/site.css`
- Photos: `assets/img/photos/`

## Build
    node build.mjs

Output goes to `dist/`. Upload the contents of `dist/` to any web host.

## Contact form
By default the form opens the visitor's email program addressed to info@wynpower.com.au.
To send submissions straight to the inbox instead, add a form service endpoint (e.g. Formspree)
to the form in `src/pages/contact.html`: `data-endpoint="https://formspree.io/f/xxxx"`.

## Moving off Wix
`dist/_redirects` maps the old Wix URLs (/news, /about-1, /services-1, etc.) and removed pages to the new pages
(works on Netlify and Cloudflare Pages; on other hosts set up equivalent 301 redirects).

## Photo credits
All photos are CC0 / public domain (free for commercial use, no attribution required):
- signing-will.jpg, signing-document.jpg: rawpixel.com public domain collection (via Openverse)
- holding-hands.jpg: "There is time enough" (Unsplash), Wikimedia Commons
- white-flower.jpg: "Wistful white flower" (Unsplash), Wikimedia Commons
- grandfather-grandchild.jpg: "My Old Man" (Unsplash), Wikimedia Commons
- family-by-lake.jpg: "Family standing by lake" (Unsplash), Wikimedia Commons

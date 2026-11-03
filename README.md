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
The live address (https://wynnslegal.com.au) is set by `SITE_URL` at the top of `build.mjs`.

## SEO and sharing
Generated on every build: canonical links, Open Graph and Twitter tags, structured data
(LegalService, Person, WebSite, WebPage, BreadcrumbList, fee catalogue), `sitemap.xml`,
`robots.txt` and `site.webmanifest`. Business details and fees used in the structured data
are in `BUSINESS` in `build.mjs`; keep them in step with `src/pages/fees.html`.

Share images (WhatsApp, Facebook, LinkedIn, X) are 1200x630 JPEGs in `assets/img/og/`, one per page.
To change the wording or photo, edit `CARDS` in `scripts/make-og.py` and run `py scripts/make-og.py`
(needs Google Chrome and Pillow).

After launch:
1. Add the site to Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml`.
2. Set up or update the Google Business Profile with the new name, website and phone number.
3. Redirect every URL on wynpower.com.au to the same path on wynnslegal.com.au (301).
4. Check share previews with the Facebook Sharing Debugger (also refreshes WhatsApp's cache).

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

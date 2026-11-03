// Builds the static site into ./dist
// Usage: node build.mjs
//
// Each file in src/pages starts with a comment block of settings:
//   <!--
//   title: Page title
//   description: Meta description
//   nav: about            (which menu item is highlighted; optional)
//   sitemap: no           (leave out of sitemap.xml and ask search engines not to index; optional)
//   -->
// The rest of the file is placed inside <main> in src/layout.html.
//
// Share image: assets/img/og/<page>.jpg if it exists, otherwise og/index.jpg.
// Regenerate them with: py scripts/make-og.py

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "dist");

// SITE_URL is the live address, used for canonical links, share images and the sitemap.
// Preview builds (e.g. GitHub Pages under /repo-name/):
//   SITE_URL=https://user.github.io/repo BASE_PATH=/repo PREVIEW=1 node build.mjs
// BASE_PATH prefixes every root-relative link; PREVIEW stops search engines indexing the copy.
const SITE_URL = (process.env.SITE_URL || "https://wynnslegal.com.au").replace(/\/$/, "");
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
const PREVIEW = process.env.PREVIEW === "1";

const BUSINESS = {
  name: "WynnsLegal",
  description:
    "Wills, estate planning, powers of attorney and deceased estates for families across the City of Wyndham since 2008.",
  phone: "+61 3 9742 3192",
  email: "info@wynpower.com.au",
  suburbs: [
    "Werribee", "Hoppers Crossing", "Point Cook", "Tarneit", "Truganina",
    "Wyndham Vale", "Manor Lakes", "Williams Landing", "Werribee South", "Little River",
  ],
  // Mirrors src/pages/fees.html. All prices include GST.
  offers: [
    ["Standard will, one person", 550],
    ["Standard wills, couple", 990],
    ["Will and powers of attorney package, per person", 990],
    ["Testamentary trust", 1100],
    ["Special disability trust", 1650],
    ["Enduring power of attorney", 385],
    ["Medical treatment decision maker appointment", 385],
    ["General non-enduring power of attorney", 385],
    ["Survivorship application", 550],
    ["Initial consultation", 330],
  ],
};

const NAV = [
  { key: "home", label: "Home", href: "/" },
  { key: "wills", label: "Wills & Estate Planning", href: "/wills-estate-planning.html" },
  { key: "poa", label: "Powers of Attorney", href: "/powers-of-attorney.html" },
  { key: "estates", label: "Deceased Estates", href: "/deceased-estates.html" },
  { key: "fees", label: "Fees", href: "/fees.html" },
  { key: "about", label: "About", href: "/about.html" },
  { key: "contact", label: "Contact", href: "/contact.html" },
];

const layout = readFileSync(join(root, "src/layout.html"), "utf8");

function parse(source) {
  const match = source.match(/^\s*<!--([\s\S]*?)-->\s*/);
  const meta = {};
  if (match) {
    for (const line of match[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: match ? source.slice(match[0].length) : source };
}

function navItems(active) {
  return NAV.map(({ key, label, href }) => {
    const current = key === active ? ' aria-current="page"' : "";
    return `        <li><a href="${href}"${current}>${label.replace(/&/g, "&amp;")}</a></li>`;
  }).join("\n");
}

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&rsquo;/g, "’").replace(/&ndash;/g, "–").replace(/<[^>]+>/g, "");

// Last commit date of a file, for <lastmod> in the sitemap.
function lastModified(file) {
  try {
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: root, encoding: "utf8" }).trim();
    if (d) return d;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

function schema({ url, title, description, image, crumb }) {
  const id = (frag) => `${SITE_URL}/#${frag}`;
  const graph = [
    {
      "@type": "LegalService",
      "@id": id("business"),
      name: BUSINESS.name,
      url: `${SITE_URL}/`,
      description: BUSINESS.description,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/img/logo-mark-512.png`, width: 512, height: 512 },
      image: `${SITE_URL}/assets/img/og/index.jpg`,
      telephone: BUSINESS.phone,
      email: BUSINESS.email,
      foundingDate: "2008",
      priceRange: "$330 - $1,650",
      currenciesAccepted: "AUD",
      address: {
        "@type": "PostalAddress",
        postOfficeBoxNumber: "162",
        addressLocality: "Werribee",
        addressRegion: "VIC",
        postalCode: "3030",
        addressCountry: "AU",
      },
      areaServed: [
        { "@type": "AdministrativeArea", name: "City of Wyndham, Victoria" },
        ...BUSINESS.suburbs.map((name) => ({ "@type": "Place", name: `${name}, VIC` })),
      ],
      knowsAbout: [
        "Wills", "Estate planning", "Testamentary trusts", "Special disability trusts",
        "Powers of attorney", "Medical treatment decision makers", "Advance care directives",
        "Probate", "Letters of administration", "Deceased estates",
      ],
      employee: { "@id": id("theresa") },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Fixed fees (including GST)",
        itemListElement: BUSINESS.offers.map(([name, price]) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
          price: String(price),
          priceCurrency: "AUD",
        })),
      },
    },
    {
      "@type": "Person",
      "@id": id("theresa"),
      name: "Theresa Sgambaro",
      jobTitle: "Principal Solicitor",
      worksFor: { "@id": id("business") },
      url: `${SITE_URL}/about.html`,
    },
    {
      "@type": "WebSite",
      "@id": id("website"),
      url: `${SITE_URL}/`,
      name: BUSINESS.name,
      inLanguage: "en-AU",
      publisher: { "@id": id("business") },
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: "en-AU",
      isPartOf: { "@id": id("website") },
      about: { "@id": id("business") },
      primaryImageOfPage: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
      ...(crumb && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
    },
  ];
  if (crumb) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: crumb, item: url },
      ],
    });
  }
  // Escape "<" so page text can never close the script tag.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
const sitemap = [];

for (const file of pages) {
  const { meta, body } = parse(readFileSync(join(root, "src/pages", file), "utf8"));
  const name = file.replace(/\.html$/, "");
  const path = file === "index.html" ? "/" : `/${file}`;
  const url = SITE_URL + path;
  const title = meta.title || BUSINESS.name;
  const description = meta.description || "";
  const indexable = meta.sitemap !== "no";

  const ogFile = existsSync(join(root, "assets/img/og", `${name}.jpg`)) ? name : "index";
  const image = `${SITE_URL}/assets/img/og/${ogFile}.jpg`;
  const crumbMatch = body.match(/<li aria-current="page">([\s\S]*?)<\/li>/);
  const crumb = crumbMatch ? decode(crumbMatch[1]).trim() : null;

  const robots = PREVIEW || !indexable ? "noindex, nofollow" : "index, follow, max-image-preview:large";

  let html = layout
    .replaceAll("{{title}}", escapeAttr(title))
    .replaceAll("{{description}}", escapeAttr(description))
    .replaceAll("{{canonical}}", url)
    .replaceAll("{{robots}}", robots)
    .replaceAll("{{ogImage}}", image)
    .replaceAll("{{ogImageAlt}}", escapeAttr(`${BUSINESS.name}: ${crumb || "Wills, estates and estate planning in Wyndham"}`))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("{{schema}}", schema({ url, title, description, image, crumb }))
    .replace("{{navItems}}", navItems(meta.nav))
    .replace("{{content}}", body.trim());
  if (BASE) html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`);
  writeFileSync(join(out, file), html);
  if (indexable) sitemap.push({ url, lastmod: lastModified(`src/pages/${file}`), home: path === "/" });
}

cpSync(join(root, "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "assets/img/favicon.ico"), join(out, "favicon.ico"));
cpSync(join(root, "src/static"), out, { recursive: true });

writeFileSync(
  join(out, "robots.txt"),
  PREVIEW ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);

writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemap
      .sort((a, b) => b.home - a.home)
      .map((p) => `  <url><loc>${p.url}</loc><lastmod>${p.lastmod}</lastmod></url>`)
      .join("\n") +
    `\n</urlset>\n`
);

writeFileSync(
  join(out, "site.webmanifest"),
  JSON.stringify(
    {
      name: BUSINESS.name,
      short_name: BUSINESS.name,
      description: BUSINESS.description,
      start_url: `${BASE}/`,
      display: "browser",
      background_color: "#f8f6f2",
      theme_color: "#1f2429",
      icons: [
        { src: `${BASE}/assets/img/logo-mark-192.png`, sizes: "192x192", type: "image/png" },
        { src: `${BASE}/assets/img/logo-mark-512.png`, sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2
  ) + "\n"
);

console.log(`Built ${pages.length} pages into dist/ for ${SITE_URL}${PREVIEW ? " (preview, not indexed)" : ""}`);

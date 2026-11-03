// Builds the static site into ./dist
// Usage: node build.mjs
//
// Each file in src/pages starts with a comment block of settings:
//   <!--
//   title: Page title
//   description: Meta description
//   nav: about            (which menu item is highlighted; optional)
//   -->
// The rest of the file is placed inside <main> in src/layout.html.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.wynpower.com.au";
const out = join(root, "dist");

// Preview builds (e.g. GitHub Pages under /repo-name/):
//   BASE_PATH=/wynpower-preview PREVIEW=1 node build.mjs
// BASE_PATH prefixes every root-relative link; PREVIEW stops search engines indexing the copy.
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
const PREVIEW = process.env.PREVIEW === "1";

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

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
const urls = [];

for (const file of pages) {
  const { meta, body } = parse(readFileSync(join(root, "src/pages", file), "utf8"));
  const path = file === "index.html" ? "/" : `/${file}`;
  let html = layout
    .replaceAll("{{title}}", escapeAttr(meta.title || "The Wynpower Group"))
    .replaceAll("{{description}}", escapeAttr(meta.description || ""))
    .replaceAll("{{canonical}}", SITE_URL + path)
    .replaceAll("{{siteUrl}}", SITE_URL)
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("{{navItems}}", navItems(meta.nav))
    .replace("{{content}}", body.trim());
  if (BASE) html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`);
  if (PREVIEW) html = html.replace("<title>", '<meta name="robots" content="noindex, nofollow">\n<title>');
  writeFileSync(join(out, file), html);
  if (meta.sitemap !== "no") urls.push(SITE_URL + path);
}

cpSync(join(root, "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "assets/img/favicon.ico"), join(out, "favicon.ico"));
cpSync(join(root, "src/static"), out, { recursive: true });
if (PREVIEW) writeFileSync(join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");

writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`
);

console.log(`Built ${pages.length} pages into dist/`);

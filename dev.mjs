// Local preview: builds the site, serves dist/ and rebuilds when src/ or assets/ change.
// Usage: node dev.mjs   then open http://localhost:8765

import http from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const PORT = 8765;

const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".ico": "image/x-icon", ".pdf": "application/pdf",
  ".xml": "application/xml", ".txt": "text/plain",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function build() {
  try {
    execFileSync(process.execPath, [join(root, "build.mjs")], { stdio: "inherit" });
  } catch {
    console.error("Build failed");
  }
}

build();

let timer;
for (const dir of ["src", "assets"]) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}

http
  .createServer(async (req, res) => {
    let path = decodeURIComponent(req.url.split("?")[0]);
    if (path.endsWith("/")) path += "index.html";
    try {
      const body = await readFile(join(dist, path));
      res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": types[".html"] });
      res.end(await readFile(join(dist, "404.html")).catch(() => "Not found"));
    }
  })
  .listen(PORT, () => console.log(`Preview running at http://localhost:${PORT}`));

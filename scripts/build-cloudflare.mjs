import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const staticFiles = ["index.html", "styles.css", "script.js"];

await fs.rm(publicDir, { recursive: true, force: true });
await fs.mkdir(publicDir, { recursive: true });

for (const file of staticFiles) {
  await fs.copyFile(path.join(root, file), path.join(publicDir, file));
}

await fs.writeFile(
  path.join(publicDir, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/*
  Cache-Control: no-store
`,
  "utf8",
);

console.log(`Cloudflare static assets built in ${publicDir}`);

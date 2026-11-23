import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourceDir = "C:/Users/AIC_PECF WS1/AppData/Local/Temp/opencode";
const assetDir = path.join(root, "public/assets");
const jsDir = path.join(root, "public/js");
const cssDir = path.join(root, "public/css");
const jqueryImagesDir = path.join(cssDir, "images");
const appDir = path.join(root, "app");

await Promise.all([
  mkdir(assetDir, { recursive: true }),
  mkdir(jsDir, { recursive: true }),
  mkdir(cssDir, { recursive: true }),
  mkdir(jqueryImagesDir, { recursive: true }),
  mkdir(appDir, { recursive: true })
]);

const [html, css, webflow] = await Promise.all([
  readFile(path.join(sourceDir, "asana.html"), "utf8"),
  readFile(path.join(sourceDir, "asana.css"), "utf8"),
  readFile(path.join(sourceDir, "webflow.js"), "utf8")
]);

const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error("Could not extract body from asana.html");

let body = bodyMatch[1]
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/height="32\s+px"/g, 'height="32px"')
  .replace(/Somewhere in Vietnam, 257 45 - Address/g, '123 Serenity Lane, Da Nang, Vietnam')
  .replace(/\+62 5641 8120/g, '+84 123 456 789')
  .replace(/reservations@asanaresort\.com/g, 'reservations@psmresort.com')
  .replace(/asana-237d22\.webflow\.io/g, 'psmresort.com')
  .replace(/asanaresort\.com/g, 'psmresort.com')
  .replace(/href="https:\/\/psmresort\.com\/#" class="menu-link">\+84 123 456 789<\/a>/g, 'href="tel:+84123456789" class="menu-link">+84 123 456 789</a>')
  .replace(/href="https:\/\/psmresort\.com\/#" class="menu-link">reservations@psmresort\.com<\/a>/g, 'href="mailto:reservations@psmresort.com" class="menu-link">reservations@psmresort.com</a>')
  .replace(/Lorem Ipsum Dolor Sit<br \/>Amet, 1234 45 Elit<br \/>/g, '123 Serenity Lane<br />Da Nang, Vietnam<br />')
  .replace(/Paula Bendfeldt/g, 'A PSM Resort Guest')
  .replace(/Asana is a wellness resort/g, 'PSM Resort is a wellness resort')
  .replace(/Welcome to Asana Retreat/g, 'Welcome to PSM Resort')
  .replace(/Dining at Asana/g, 'Dining at PSM Resort')
  .replace(/asana/gi, 'PSM Resort')
  .replace(/ data-w-id="842a3df8-4038-1c8e-dadb-71f7ac243f4[b-d]"/g, '')
  .replaceAll('/assets/asset_55596912ec_60a3a859f2f31f215f9a4638_logo.svg', '/assets/psm-resort-logo.svg');

const normalizeUrl = (url) =>
  url.replace("https://uploads-ssl.webflow.com", "https://cdn.prod.website-files.com");

const isSiteAsset = (url) =>
  /^https:\/\/(?:uploads-ssl\.webflow\.com|cdn\.prod\.website-files\.com)\/(?:60a299f0cfa30f7583139133|60a2a68fcebf477472a8c4df)\//.test(
    url
  );

const groups = new Map();
const urlPattern = /https:\/\/(?:uploads-ssl\.webflow\.com|cdn\.prod\.website-files\.com)\/[^"'\s]+/g;

for (const text of [css, body]) {
  for (const match of text.match(urlPattern) ?? []) {
    if (!isSiteAsset(match)) continue;
    const key = normalizeUrl(match);
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key).add(match);
  }
}

function localName(url) {
  const parsed = new URL(url);
  const decoded = decodeURIComponent(path.basename(parsed.pathname));
  const ext = path.extname(decoded).slice(0, 12);
  const stem = path.basename(decoded, ext).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 90);
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  return `asset_${hash}_${stem}${ext}`;
}

async function download(url, destination) {
  const fallbacks = [
    url,
    url.replace("https://cdn.prod.website-files.com", "https://uploads-ssl.webflow.com")
  ];

  for (const candidate of fallbacks) {
    try {
      const response = await fetch(candidate, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Referer: "https://asanaresort.webflow.io/"
        }
      });
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(destination, buffer);
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

const replacements = new Map();
let downloaded = 0;

for (const [normalized, originals] of groups) {
  const name = localName(normalized);
  const localPath = `/assets/${name}`;
  const ok = await download(normalized, path.join(assetDir, name));
  if (ok) downloaded += 1;
  else console.warn(`Asset download failed: ${normalized}`);
  for (const original of originals) replacements.set(original, localPath);
}

function rewrite(text) {
  let output = text;
  for (const [original, localPath] of replacements) {
    output = output.split(original).join(localPath);
  }
  return output;
}

const rewrittenCss = rewrite(css);
const rewrittenBody = rewrite(body);

const extraCss = `
html {
  scroll-behavior: smooth;
}

body {
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (min-width: 992px) {
  html.w-mod-js:not(.w-mod-ix) [data-w-id="14a6cfd4-b8a0-7dd3-49ca-a42f09f95a3b"] {
    opacity: 0;
  }
}

.ui-datepicker {
  z-index: 2222 !important;
}

.psm-page {
  min-height: 100vh;
}

.body.overflow {
  overflow: hidden;
}

.menu-mobile {
  transition: top 600ms ease, opacity 300ms ease;
}

.menu-mobile.is-open {
  top: 0;
}

.menu-button[aria-expanded="true"] .white-line:first-child {
  transform: translateY(4px) rotate(45deg);
}

.menu-button[aria-expanded="true"] .white-line:last-child {
  transform: translateY(-4px) rotate(-45deg);
}
`;

await Promise.all([
  writeFile(path.join(appDir, "globals.css"), `${rewrittenCss}\n${extraCss}`),
  writeFile(
    path.join(appDir, "page-data.js"),
    `export const pageHtml = ${JSON.stringify(rewrittenBody)};\n`
  ),
  writeFile(path.join(jsDir, "webflow.js"), webflow),
  writeFile(
    path.join(assetDir, "psm-resort-logo.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="20" viewBox="0 0 150 20"><text x="4" y="16" fill="#fff" font-family="Georgia, 'Times New Roman', serif" font-size="16" letter-spacing="3">PSM Resort</text></svg>`
  )
]);

const vendorFiles = [
  [
    "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=60a299f0cfa30f7583139133",
    path.join(jsDir, "jquery.min.js")
  ],
  ["https://code.jquery.com/ui/1.12.1/jquery-ui.js", path.join(jsDir, "jquery-ui.js")],
  [
    "https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css",
    path.join(cssDir, "jquery-ui.css")
  ],
  ...[
    "ui-icons_444444_256x240.png",
    "ui-icons_555555_256x240.png",
    "ui-icons_777620_256x240.png",
    "ui-icons_cc0000_256x240.png",
    "ui-icons_ffffff_256x240.png"
  ].map((file) => [
    `https://code.jquery.com/ui/1.12.1/themes/base/images/${file}`,
    path.join(jqueryImagesDir, file)
  ])
];

for (const [url, destination] of vendorFiles) {
  const ok = await download(url, destination);
  if (!ok) console.warn(`Vendor download failed: ${url}`);
}

console.log(`Prepared ${downloaded} assets from ${groups.size} unique URLs.`);

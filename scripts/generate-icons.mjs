// Genera los PNG de la PWA a partir de un SVG embebido.
// Uso: node scripts/generate-icons.mjs   (requiere devDep `sharp`)
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");

const fishArt = `
  <g fill="#ffffff">
    <path d="M70 50 C70 34 49 27 35 38 C29 24 17 21 8 24 L17 50 L8 76 C17 79 29 76 35 62 C49 73 70 66 70 50 Z" />
    <circle cx="27" cy="44" r="3.4" fill="#0369A1" />
    <path d="M70 50 C78 46 86 46 92 50 C86 54 78 54 70 50 Z" />
  </g>`;

// coverage = fracción del lienzo que ocupa el arte (100 = caja del fish)
function svg({ size, radius, coverage }) {
  const scale = (size * coverage) / 100;
  const offset = (size - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0EA5E9" />
        <stop offset="1" stop-color="#0369A1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)" />
    <g transform="translate(${offset} ${offset}) scale(${scale})">${fishArt}</g>
  </svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, radius: 42, coverage: 0.56 },
  { name: "icon-512.png", size: 512, radius: 112, coverage: 0.56 },
  // maskable: sin esquinas y con más margen (zona segura del círculo)
  { name: "maskable-512.png", size: 512, radius: 0, coverage: 0.42 },
  { name: "apple-touch-icon.png", size: 180, radius: 0, coverage: 0.58 },
];

await mkdir(outDir, { recursive: true });
for (const t of targets) {
  const buf = Buffer.from(svg(t));
  const dest =
    t.name === "apple-touch-icon.png"
      ? join(root, "public", t.name)
      : join(outDir, t.name);
  await sharp(buf).png().toFile(dest);
  console.log("✓", t.name);
}
console.log("Iconos generados en public/");

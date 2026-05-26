import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const gpusPath = path.join(root, "data", "gpus.json");
const outputDir = path.join(root, "public", "images", "gpus");

const palettes = {
  NVIDIA: { primary: "#16a34a", secondary: "#052e16", accent: "#bbf7d0" },
  AMD: { primary: "#dc2626", secondary: "#450a0a", accent: "#fecaca" },
  Intel: { primary: "#2563eb", secondary: "#0f172a", accent: "#bfdbfe" },
};

const gpus = JSON.parse(fs.readFileSync(gpusPath, "utf8"));
fs.mkdirSync(outputDir, { recursive: true });

for (const gpu of gpus) {
  gpu.imageUrl = `/images/gpus/${gpu.slug}.svg`;
  const palette = palettes[gpu.brand] ?? { primary: "#0f766e", secondary: "#0f172a", accent: "#ccfbf1" };
  const svg = renderGpuSvg(gpu, palette);
  fs.writeFileSync(path.join(outputDir, `${gpu.slug}.svg`), svg, "utf8");
}

fs.writeFileSync(gpusPath, `${JSON.stringify(gpus, null, 2)}\n`, "utf8");
console.log(`Generated ${gpus.length} GPU images in ${path.relative(root, outputDir)}.`);

function renderGpuSvg(gpu, palette) {
  const model = gpu.name.replace(/^NVIDIA\s+|^AMD\s+|^Intel\s+/i, "");
  const tier = gpu.isLaptop ? "Laptop GPU" : "Desktop GPU";
  const score = Number(gpu.benchmarkScore || 0).toLocaleString("vi-VN");
  const vram = gpu.vram ? `${gpu.vram}GB VRAM` : "VRAM";
  const category = categoryLabel(gpu.category);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(gpu.name)}</title>
  <desc id="desc">Ảnh minh họa GPU ${escapeXml(gpu.name)} do Fpsviet.com tạo.</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${palette.secondary}"/>
      <stop offset="0.58" stop-color="#111827"/>
      <stop offset="1" stop-color="${palette.primary}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#020617" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="960" height="540" fill="url(#bg)"/>
  <path d="M0 412 C150 360 260 455 410 402 C560 348 658 250 960 300 L960 540 L0 540 Z" fill="#ffffff" opacity="0.08"/>
  <g filter="url(#shadow)">
    <rect x="118" y="156" width="620" height="236" rx="28" fill="url(#card)" stroke="${palette.accent}" stroke-opacity="0.34" stroke-width="2"/>
    <rect x="162" y="198" width="332" height="58" rx="14" fill="${palette.primary}" opacity="0.92"/>
    <rect x="162" y="278" width="220" height="20" rx="10" fill="#475569"/>
    <rect x="162" y="316" width="300" height="20" rx="10" fill="#334155"/>
    <circle cx="596" cy="274" r="82" fill="#0f172a" stroke="${palette.primary}" stroke-width="18"/>
    <circle cx="596" cy="274" r="34" fill="${palette.primary}" opacity="0.88"/>
    <path d="M596 192 L626 252 L690 242 L640 286 L668 346 L596 312 L524 346 L552 286 L502 242 L566 252 Z" fill="${palette.accent}" opacity="0.18"/>
    <rect x="738" y="210" width="58" height="128" rx="12" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <rect x="796" y="232" width="28" height="84" rx="8" fill="${palette.primary}" opacity="0.92"/>
  </g>
  <text x="60" y="70" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" opacity="0.82">${escapeXml(gpu.brand)}</text>
  <text x="60" y="118" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="900">${escapeXml(model)}</text>
  <text x="60" y="462" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800">${escapeXml(vram)} · ${escapeXml(category)} · ${escapeXml(tier)}</text>
  <text x="60" y="500" fill="${palette.accent}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">Điểm hiệu năng ${escapeXml(score)}</text>
  <text x="790" y="500" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="900" text-anchor="end">Fpsviet.com</text>
</svg>
`;
}

function categoryLabel(category) {
  const map = {
    integrated: "iGPU",
    low: "Cơ bản",
    mid: "Tầm trung",
    high: "Mạnh",
    ultra: "Rất mạnh",
  };
  return map[category] ?? String(category || "GPU");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

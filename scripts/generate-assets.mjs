// Generates every raster brand asset (home-screen icons, favicons, iOS splash screens)
// from one vector definition.  Run with:  npm run assets
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../public/', import.meta.url).pathname;
mkdirSync(OUT + 'splash', { recursive: true });

const RIBBONS = [
  { c1: '#ffbd78', c2: '#ff7a6b', y: 30, amp: 14, freq: 0.9, ph: 0 },
  { c1: '#ff8fb0', c2: '#a55cff', y: 38, amp: 12, freq: 1.3, ph: 1.7 },
  { c1: '#ffe3a1', c2: '#ffbd78', y: 26, amp: 10, freq: 1.7, ph: 3.1 },
  { c1: '#9fe8ff', c2: '#7a6cff', y: 46, amp: 9, freq: 1.1, ph: 4.6 },
];
const ribbonPath = (r) => {
  let top = '', bot = '';
  for (let i = 0; i <= 20; i++) {
    const x = (i / 20) * 100;
    const y = r.y + Math.sin(x * 0.045 * r.freq + r.ph) * r.amp * 0.55 + Math.sin(x * 0.11 + r.ph) * r.amp * 0.18;
    top += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(2)}`;
    bot = `L${x.toFixed(1)} ${(y + 40 + Math.sin(x * 0.06) * 6).toFixed(2)}` + bot;
  }
  return `${top}${bot}Z`;
};
const HILLS = ['M0 100V82Q14 70 28 80T54 76Q70 66 84 78T100 74V100Z', 'M0 100V90Q20 82 40 89T78 86Q92 84 100 88V100Z'];

/** The Aurora mark: a glowing window onto the northern sky, orbit rings and a small constellation. */
const glyph = (cx, cy, s) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <circle r="330" fill="url(#halo)"/>
    <ellipse rx="318" ry="214" transform="rotate(-24)" fill="none" stroke="#ffd9a8" stroke-opacity=".38" stroke-width="5"/>
    <ellipse rx="226" ry="166" transform="rotate(38)" fill="none" stroke="#ffd9a8" stroke-opacity=".20" stroke-width="4"/>
    <path d="M-236 128 L-84 54 L150 -22 L262 -178" fill="none" stroke="#ffe3c4" stroke-opacity=".30" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 14"/>
    <g clip-path="url(#win)">
      <g transform="translate(-130 -130) scale(2.6)">
        <rect width="100" height="100" fill="url(#sky)"/>
        ${RIBBONS.map((r, i) => `<path d="${ribbonPath(r)}" fill="url(#rb${i})" fill-opacity=".85"/>`).join('')}
        <g fill="#fff"><circle cx="20" cy="12" r="1" opacity=".8"/><circle cx="64" cy="8" r="1.2" opacity=".9"/><circle cx="84" cy="22" r=".9" opacity=".6"/><circle cx="40" cy="20" r=".7" opacity=".6"/></g>
        <path d="${HILLS[0]}" fill="#07040f"/><path d="${HILLS[1]}" fill="#030208"/>
      </g>
    </g>
    <circle r="130" fill="none" stroke="#ffd9a8" stroke-opacity=".6" stroke-width="4"/>
    <g fill="#fff0d8">
      <circle cx="-236" cy="128" r="14" filter="url(#bloom)"/>
      <circle cx="150" cy="-22" r="10" opacity=".8"/>
      <circle cx="262" cy="-178" r="17" filter="url(#bloom)"/>
    </g>
  </g>`;

const defs = `
  <defs>
    <radialGradient id="night" cx="50%" cy="42%" r="75%">
      <stop offset="0" stop-color="#3a1d44"/><stop offset=".55" stop-color="#17101c"/><stop offset="1" stop-color="#0d0912"/>
    </radialGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="#ffbd78" stop-opacity=".5"/><stop offset=".5" stop-color="#c9703c" stop-opacity=".15"/><stop offset="1" stop-color="#c9703c" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120b33"/><stop offset=".55" stop-color="#43214a"/><stop offset="1" stop-color="#c9703c"/></linearGradient>
    <clipPath id="win"><circle r="130"/></clipPath>
    ${RIBBONS.map((r, i) => `<linearGradient id="rb${i}" x1="0" y1="${r.y - r.amp}" x2="0" y2="${r.y + 46}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${r.c1}" stop-opacity=".95"/><stop offset=".5" stop-color="${r.c2}" stop-opacity=".5"/><stop offset="1" stop-color="${r.c2}" stop-opacity="0"/></linearGradient>`).join('')}
    <filter id="bloom" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

const specks = (size) => {
  // deterministic star dots so the art is identical on every build
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 34 }, () => {
    const x = rnd() * size, y = rnd() * size, r = 1.2 + rnd() * 3.2;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#ffd9a8" opacity="${(0.15 + rnd() * 0.45).toFixed(2)}"/>`;
  }).join('');
};

const iconSvg = ({ size = 1024, glyphScale = 1, rounded = false } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${defs}
  <rect width="1024" height="1024" ${rounded ? 'rx="228"' : ''} fill="url(#night)"/>
  ${specks(1024)}
  ${glyph(512, 512, 0.98 * glyphScale)}
</svg>`;

const splashSvg = (w, h) => {
  const s = (Math.min(w, h) * 0.46) / 1024 / 0.98 * 1.0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}
  <rect width="${w}" height="${h}" fill="url(#night)"/>
  <g>${Array.from({ length: 46 }, (_, i) => { const r = ((i * 9301 + 49297) % 233280) / 233280, q = ((i * 4271 + 1337) % 233280) / 233280; return `<circle cx="${(r * w).toFixed(0)}" cy="${(q * h).toFixed(0)}" r="${(1 + r * 2.4).toFixed(1)}" fill="#ffd9a8" opacity="${(0.12 + q * 0.4).toFixed(2)}"/>`; }).join('')}</g>
  ${glyph(w / 2, h * 0.45, s)}
</svg>`;
};

const png = (svg, file, w, h) => sharp(Buffer.from(svg)).resize(w, h).flatten({ background: '#0d0912' }).png({ compressionLevel: 9 }).toFile(OUT + file);

// --- icons --------------------------------------------------------------------
writeFileSync(OUT + 'favicon.svg', iconSvg({ rounded: true }).trim());
await png(iconSvg(), 'apple-touch-icon.png', 180, 180);           // iOS Home Screen (opaque, iOS rounds it)
await png(iconSvg(), 'icon-192.png', 192, 192);
await png(iconSvg(), 'icon-512.png', 512, 512);
await png(iconSvg({ glyphScale: 0.72 }), 'icon-maskable-512.png', 512, 512); // Android adaptive-icon safe zone
await png(iconSvg({ rounded: true }), 'favicon-32.png', 32, 32);

// --- iOS splash screens (portrait, device pixels) ---------------------------------
const devices = [
  [1320, 2868, 440, 956, 3], [1206, 2622, 402, 874, 3], [1260, 2736, 420, 912, 3],
  [1290, 2796, 430, 932, 3], [1179, 2556, 393, 852, 3], [1284, 2778, 428, 926, 3],
  [1170, 2532, 390, 844, 3], [1125, 2436, 375, 812, 3], [1242, 2688, 414, 896, 3],
  [828, 1792, 414, 896, 2], [1242, 2208, 414, 736, 3], [750, 1334, 375, 667, 2], [640, 1136, 320, 568, 2],
];
for (const [pw, ph] of devices) await png(splashSvg(pw, ph), `splash/splash-${pw}x${ph}.png`, pw, ph);
console.log('assets written:', devices.length, 'splash screens + icons');

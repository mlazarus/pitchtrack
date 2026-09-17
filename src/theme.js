// Derives a full, coherent color palette from a single base background color.
// One color in, a matched set of panel/border/text/accent tokens out — this is
// what powers the "pick a color and everything else matches" setting.

export const DEFAULT_BG = '#0b0e17';

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{1,2}/g).map(x => parseInt(x, 16));
  return { r: m[0], g: m[1], b: m[2] };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.min(100, Math.max(0, s)) / 100;
  l = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const clampL = (v) => Math.min(97, Math.max(3, v));

export function deriveTheme(baseHex) {
  const hex = baseHex && /^#[0-9a-fA-F]{6}$/.test(baseHex) ? baseHex : DEFAULT_BG;
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const isDark = l < 50;

  // Near-grayscale base colors have no meaningful hue for an accent — fall back
  // to the app's original indigo hue so buttons don't go muddy gray.
  const accentHue = s < 6 ? 243 : h;
  const accentSat = s < 6 ? 70 : Math.min(100, s + 10);

  return {
    isDark,
    baseHex: hex,
    pageBg: hex,
    panelBg: hslToHex(h, s, clampL(isDark ? l + 7 : l - 3)),
    panelBg2: hslToHex(h, s, clampL(isDark ? l + 4 : l - 1)),
    panelBorder: hslToHex(h, s, clampL(isDark ? l + 16 : l - 22)),
    surfaceBg: hslToHex(h, s, clampL(isDark ? l + 12 : l - 6)),
    surfaceBorder: hslToHex(h, s, clampL(isDark ? l + 22 : l - 30)),
    text: isDark ? '#e8e9ed' : '#1a1a1a',
    textDim: isDark ? hslToHex(h, Math.min(s, 15), 66) : hslToHex(h, Math.min(s, 15), 38),
    accent: hslToHex(accentHue, accentSat, isDark ? 62 : 45),
    accentText: '#ffffff',
    danger: isDark ? '#f5a3a3' : '#b91c1c',
    dangerBg: isDark ? hslToHex(0, 40, 16) : hslToHex(0, 70, 95),
    dangerBorder: isDark ? hslToHex(0, 30, 24) : hslToHex(0, 50, 80),
    disabled: isDark ? '#6a7188' : '#999999',
    secondaryBg: isDark ? hslToHex(h, s, clampL(l + 9)) : hslToHex(h, Math.min(s, 10), 92),
    secondaryBorder: hslToHex(h, s, clampL(isDark ? l + 16 : l - 22)),
    secondaryText: isDark ? '#c7c9d4' : '#333333',
    rowAltBg: isDark ? hslToHex(h, s, clampL(l + 5)) : hslToHex(h, Math.min(s, 10), 96)
  };
}

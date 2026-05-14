import type { ElementSnapshot, FrequencyValue } from "@/src/lib/analyzer/types";

type RGB = { r: number; g: number; b: number; a: number };

const HEX_COLOR = /^#([\da-f]{3}|[\da-f]{6})$/i;
const RGB_COLOR =
  /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i;

export function cleanString(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function parsePxValues(input: string): number[] {
  const matches = input.match(/-?\d*\.?\d+px/g);
  if (!matches) {
    return [];
  }

  return matches
    .map((value) => Number.parseFloat(value.replace("px", "")))
    .filter((value) => Number.isFinite(value) && value >= 0);
}

export function pxToToken(value: number): string {
  return `${Math.round(value * 100) / 100}px`;
}

export function normalizeFontFamily(input: string): string {
  const first = input.split(",")[0] ?? input;
  return first.replace(/["']/g, "").trim();
}

export function toFrequencyMap(values: string[]): FrequencyValue[] {
  const map = new Map<string, number>();

  for (const value of values) {
    const normalized = cleanString(value);
    if (!normalized) {
      continue;
    }
    map.set(normalized, (map.get(normalized) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function isCardLikeElement(element: ElementSnapshot): boolean {
  const className = element.className.toLowerCase();
  return (
    className.includes("card") ||
    className.includes("panel") ||
    className.includes("tile") ||
    className.includes("feature") ||
    className.includes("pricing") ||
    (element.tagName === "div" &&
      element.boundingBox.width > 180 &&
      element.boundingBox.height > 120 &&
      element.backgroundColor !== "rgba(0, 0, 0, 0)")
  );
}

export function detectScaleType(values: number[]): "4px" | "8px" | "mixed" | "unknown" {
  const meaningful = values.filter((value) => value > 0);
  if (meaningful.length === 0) {
    return "unknown";
  }

  const divisBy4 = meaningful.filter((value) => Math.abs(value % 4) < 0.2).length;
  const divisBy8 = meaningful.filter((value) => Math.abs(value % 8) < 0.2).length;

  if (divisBy8 / meaningful.length >= 0.7) {
    return "8px";
  }

  if (divisBy4 / meaningful.length >= 0.7) {
    return "4px";
  }

  return "mixed";
}

export function pickTopTokens(values: number[], max = 10): string[] {
  const frequency = toFrequencyMap(values.map(pxToToken));
  return frequency.slice(0, max).map((entry) => entry.value);
}

export function average(values: Array<number | null>): number | null {
  const filtered = values.filter((value): value is number => value !== null);
  if (filtered.length === 0) {
    return null;
  }

  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

export function clampList<T>(values: T[], max = 12): T[] {
  return values.slice(0, max);
}

export function normalizeCssColorToHex(input: string): string | null {
  const normalized = cleanString(input).toLowerCase();
  if (!normalized || normalized === "transparent") {
    return null;
  }

  if (HEX_COLOR.test(normalized)) {
    if (normalized.length === 4) {
      const r = normalized[1];
      const g = normalized[2];
      const b = normalized[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return normalized.toUpperCase();
  }

  const rgbMatch = normalized.match(RGB_COLOR);
  if (!rgbMatch) {
    return null;
  }

  const rgb: RGB = {
    r: Number.parseFloat(rgbMatch[1] ?? "0"),
    g: Number.parseFloat(rgbMatch[2] ?? "0"),
    b: Number.parseFloat(rgbMatch[3] ?? "0"),
    a: rgbMatch[4] ? Number.parseFloat(rgbMatch[4]) : 1,
  };

  if (rgb.a <= 0.02) {
    return null;
  }

  return `#${[rgb.r, rgb.g, rgb.b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB | null {
  const normalized = normalizeCssColorToHex(hex);
  if (!normalized) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
    a: 1,
  };
}

export function colorDistance(first: string, second: string): number {
  const rgbA = hexToRgb(first);
  const rgbB = hexToRgb(second);
  if (!rgbA || !rgbB) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.sqrt(
    (rgbA.r - rgbB.r) ** 2 + (rgbA.g - rgbB.g) ** 2 + (rgbA.b - rgbB.b) ** 2,
  );
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 0;
  }

  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function saturationScore(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 0;
  }

  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return max === 0 ? 0 : (max - min) / max;
}

export function normalizeShadow(input: string): string {
  return cleanString(input.replace(/rgba?\(/g, (match) => match.toLowerCase()));
}

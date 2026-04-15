import type { ThemeName } from "../types";

/**
 * Animated background palettes — one per app theme.
 *
 * Each palette has three hex colors that feed the shader's u_color1/2/3
 * uniforms. The shader blends them through a wave + noise + radial field,
 * so ordering matters a little:
 *   c1 — deep base (dominates low-energy areas)
 *   c2 — mid accent (the "theme" color most users will notice)
 *   c3 — highlight (appears in the bright peaks)
 */
export interface BackgroundPalette {
  c1: string;
  c2: string;
  c3: string;
}

export const BACKGROUND_PALETTES: Record<ThemeName, BackgroundPalette> = {
  // Synthwave — night blue → royal purple → sunset amber
  dark: { c1: "#0c0a1f", c2: "#b46bff", c3: "#ff7a2e" },
  // Orcish — blood rust → ember red → molten gold
  orcish: { c1: "#1a0808", c2: "#ef4444", c3: "#fbbf24" },
  // Atlantis — abyss → cyan → glacial foam
  atlantis: { c1: "#041832", c2: "#06b6d4", c3: "#a5f3fc" },
  // S'mores — roasted cocoa → amber flame → cream
  smores: { c1: "#2a1810", c2: "#f59e0b", c3: "#fde68a" },
  // Neon Pulse — pure void → magenta → cyan (classic cyberpunk triad)
  "neon-pulse": { c1: "#0a0015", c2: "#ff00ff", c3: "#00ffff" },
};

/** Parse a `#rrggbb` string into a normalized `[r, g, b]` tuple (0..1). */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

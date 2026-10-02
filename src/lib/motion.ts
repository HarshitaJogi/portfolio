/** Shared motion tokens. Mirrors the CSS custom properties in globals.css. */

export const ease = {
  /** Entrances. Fast start, long soft landing. */
  settle: [0.22, 1, 0.36, 1] as const,
  /** Scroll-linked motion and state changes. */
  glide: [0.65, 0, 0.35, 1] as const,
};

export const dur = {
  micro: 0.16,
  enter: 0.56,
  draw: 0.8,
  count: 1.4,
};

export const stagger = 0.06;
export const travel = 16;

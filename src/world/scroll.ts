"use client";

/**
 * Journey progress, as a float: 0 = first stop, 1 = second stop, and so on.
 * Written by the HTML scroll layer, read every frame by the camera. No React state.
 */
export const journey = { progress: 0, target: 0 };

const listeners = new Set<() => void>();

export function setJourney(p: number) {
  journey.target = p;
  listeners.forEach((l) => l());
}

/** For the on-demand frameloop (reduced motion): redraw only when the scroll moves. */
export function onJourney(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

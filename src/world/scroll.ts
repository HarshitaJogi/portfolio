"use client";

/**
 * Journey progress, as a float: 0 = first step, 1 = second step, and so on.
 * The page sets a target step (Next, Back, a dot, a hash); the scene tweens `progress`
 * toward it over a fixed time, so every move is a short, deliberate flight.
 */
export const journey = { progress: 0, target: 0, from: 0, t: 1, dur: 1 };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function setJourney(p: number) {
  if (p === journey.target) return;
  journey.from = journey.progress;
  journey.target = p;
  journey.t = 0;
  // unhurried: a walk you can watch, a little longer for longer trips
  journey.dur = Math.min(4, Math.max(1.4, 2.2 + 0.7 * (Math.abs(p - journey.progress) - 1)));
  notify();
}

/** A new scene starts at its step, with no flight from the last scene. */
export function resetJourney(p: number) {
  journey.target = p;
  journey.progress = p;
  journey.from = p;
  journey.t = 1;
  notify();
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Advance the flight. Called once per frame by the scene's camera rig. */
export function stepJourney(dt: number, reduced: boolean) {
  if (reduced) {
    journey.progress = journey.target;
    journey.t = 1;
    return;
  }
  if (journey.t >= 1) {
    journey.progress = journey.target;
    return;
  }
  journey.t = Math.min(1, journey.t + dt / journey.dur);
  journey.progress = journey.from + (journey.target - journey.from) * ease(journey.t);
}

/** True while the camera is between steps. */
export const inFlight = () => journey.t < 1;

/** For the on-demand frameloop (reduced motion): redraw when the step changes. */
export function onJourney(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

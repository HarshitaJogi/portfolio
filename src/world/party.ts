"use client";

/** The cheat-code barrel roll: the camera turns once around its view axis. */
const party = { start: -1 };

export function startParty() {
  party.start = performance.now();
}

/** Roll angle in radians for right now. Zero when no party is on. */
export function partyRoll() {
  if (party.start < 0) return 0;
  const t = (performance.now() - party.start) / 1600;
  if (t >= 1) {
    party.start = -1;
    return 0;
  }
  const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  return e * Math.PI * 2;
}

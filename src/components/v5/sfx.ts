"use client";

/** Tiny synthesized UI sounds. Nothing to download, and quiet by design. */
let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, to: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A bubbly pop for buttons. */
export const pop = () => tone(520, 980, 0.11, "sine", 0.12);
/** A softer, lower pop for Back. */
export const popBack = () => tone(700, 380, 0.11, "sine", 0.1);
/** Two rising notes: arrived somewhere. */
export const arrive = () => {
  tone(660, 660, 0.14, "triangle", 0.07);
  tone(990, 990, 0.2, "triangle", 0.07, 0.09);
};
/** A rubber-stamp thud with a little ring. */
export const thud = () => {
  tone(160, 60, 0.22, "sine", 0.35);
  tone(1320, 1320, 0.35, "triangle", 0.05, 0.05);
};
/** A short fanfare. */
export const fanfare = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.22, "triangle", 0.08, i * 0.11));

"use client";

import { useSyncExternalStore } from "react";

/**
 * The site's one audio engine. Every sound, in the page and on the island, goes through
 * a single master bus with a compressor, so effects can be loud and punchy without
 * clipping, and one mute switch silences everything. All synthesized: nothing to download.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

const KEY = "hj-sound";
let muted = false;
let loaded = false;
const listeners = new Set<() => void>();

function loadPref() {
  if (loaded) return;
  loaded = true;
  try {
    muted = localStorage.getItem(KEY) === "off";
  } catch {
    /* fine */
  }
}

export function audio() {
  if (typeof window === "undefined") return null;
  loadPref();
  if (muted) return null;
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 10;
      comp.ratio.value = 5;
      comp.attack.value = 0.003;
      comp.release.value = 0.18;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Where every voice connects. */
export const bus = () => master!;

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem(KEY, m ? "off" : "on");
  } catch {
    /* fine */
  }
  listeners.forEach((l) => l());
}

export function useMuted() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      loadPref();
      return muted;
    },
    () => false,
  );
}

/** One oscillator voice with a pitch glide and a quick attack. */
export function tone(freq: number, to: number, dur: number, type: OscillatorType = "sine", vol = 0.2, delay = 0, vibrato = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(freq, 1), t);
  o.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
  if (vibrato) {
    const lfo = a.createOscillator();
    const lg = a.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = vibrato;
    lfo.connect(lg).connect(o.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus());
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Filtered noise: whooshes, claps, crackles, thuds. */
export function noise(dur: number, { type = "bandpass", from = 1200, to = from, q = 1, vol = 0.3, delay = 0 }: { type?: BiquadFilterType; from?: number; to?: number; q?: number; vol?: number; delay?: number } = {}) {
  const a = audio();
  if (!a) return;
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    // deterministic noise, so the same sound is the same sound
    let s = 7;
    for (let i = 0; i < d.length; i++) {
      s = (s * 16807) % 2147483647;
      d[i] = (s / 2147483647) * 2 - 1;
    }
  }
  const t = a.currentTime + delay;
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus());
  src.start(t, (delay * 7.3) % 0.5);
  src.stop(t + dur + 0.05);
}

/** A bell: three inharmonic partials. */
export function bell(base = 1320, vol = 0.32, delay = 0) {
  [1, 2.76, 5.4].forEach((m, i) => tone(base * m, base * m, 1.1 - i * 0.25, "sine", vol / (i + 1), delay));
}

/** The interface's voice. */
export const ui = {
  /** Every button: a fat bubbly pop with a click on top. */
  pop: () => {
    tone(360, 1100, 0.13, "sine", 0.42);
    tone(720, 1500, 0.08, "triangle", 0.12);
    noise(0.03, { type: "highpass", from: 3500, vol: 0.18 });
  },
  /** Back: the same pop, falling. */
  back: () => {
    tone(900, 360, 0.13, "sine", 0.34);
    noise(0.03, { type: "highpass", from: 3000, vol: 0.12 });
  },
  /** Next: a rush forward, then a bright two-note arrival when the new card lands. */
  next: () => {
    noise(0.42, { from: 400, to: 3200, q: 1.1, vol: 0.38 });
    tone(330, 990, 0.32, "triangle", 0.16);
  },
  land: () => {
    tone(784, 784, 0.16, "triangle", 0.26);
    tone(1175, 1175, 0.24, "triangle", 0.24, 0.08);
    noise(0.05, { type: "lowpass", from: 500, vol: 0.3 });
  },
  /** Soft tick on hover over big buttons. */
  tick: () => tone(1800, 2200, 0.025, "triangle", 0.06),
  /** A coin for finds. */
  coin: () => {
    tone(988, 988, 0.08, "square", 0.12);
    tone(1319, 1319, 0.32, "square", 0.12, 0.08);
  },
  /** A rubber stamp: a thud with weight. */
  thud: () => {
    tone(150, 48, 0.28, "sine", 0.7);
    noise(0.12, { type: "lowpass", from: 900, to: 200, vol: 0.5 });
    bell(1568, 0.08, 0.06);
  },
  /** A short fanfare. */
  fanfare: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, i === 4 ? 0.6 : 0.2, "triangle", 0.24, i * 0.1)),
  /** Sparkle: a fast glassy run. */
  sparkle: () => [1568, 1976, 2349, 2794, 3136].forEach((f, i) => tone(f, f, 0.12, "sine", 0.1, i * 0.04)),
  /** A soft footstep, for the traveler's hops. */
  step: () => {
    tone(260, 170, 0.06, "triangle", 0.12);
    noise(0.04, { type: "lowpass", from: 700, vol: 0.12 });
  },
  /** A little plane taking off: engine buzz rising, and wind. */
  takeoff: () => {
    tone(110, 260, 1.1, "sawtooth", 0.07);
    tone(116, 270, 1.1, "sawtooth", 0.07);
    noise(1.2, { from: 300, to: 1800, q: 0.8, vol: 0.3 });
  },
  /** A card flipping over. */
  flip: () => {
    noise(0.22, { from: 900, to: 3200, q: 1.4, vol: 0.32 });
    tone(440, 880, 0.14, "triangle", 0.14, 0.12);
  },
  /** Going through a door: a swoop down and a soft knock. */
  door: () => {
    noise(0.55, { from: 2600, to: 300, q: 0.9, vol: 0.4 });
    tone(520, 220, 0.4, "triangle", 0.2);
  },
  /** Arriving somewhere new: a bright rising chord. */
  arrive: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.5, "triangle", 0.16, i * 0.06)),
  /** A whoosh for clouds and big moves. */
  whoosh: () => noise(0.6, { from: 250, to: 2400, q: 0.9, vol: 0.42 }),
};

/** Each traveler's voice, for hovering over them in the chooser and for picking them. */
export const voices = {
  robot: () => [880, 1320, 990, 1760].forEach((f, i) => tone(f, f, 0.07, "square", 0.1, i * 0.08)),
  cat: () => {
    tone(620, 1100, 0.18, "sawtooth", 0.07, 0, 18);
    tone(1100, 560, 0.34, "triangle", 0.2, 0.17, 22);
  },
  duck: () => {
    noise(0.16, { type: "bandpass", from: 1200, to: 900, q: 6, vol: 0.5 });
    tone(320, 260, 0.16, "sawtooth", 0.1);
    noise(0.14, { type: "bandpass", from: 1200, to: 900, q: 6, vol: 0.45, delay: 0.2 });
    tone(320, 250, 0.14, "sawtooth", 0.09, 0.2);
  },
  elephant: () => {
    tone(210, 470, 0.5, "sawtooth", 0.14, 0, 14);
    noise(0.5, { type: "bandpass", from: 500, to: 1300, q: 3, vol: 0.25 });
  },
  peacock: () => {
    tone(900, 1500, 0.22, "triangle", 0.22, 0, 30);
    tone(1500, 820, 0.36, "triangle", 0.2, 0.22, 30);
  },
};

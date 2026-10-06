"use client";

import { audio, bus } from "./audio";

/**
 * Background music: small generative loops, one theme for the island and one for each
 * world, crossfaded under the scene transitions (the Animal Crossing door feeling).
 * Scheduled a little ahead with a lookahead timer, so the timing stays steady.
 * Starts only after the visitor has interacted (browsers require it), and follows the
 * site-wide mute.
 */
export type Theme = "island" | "education" | "skills" | "experience" | "projects" | "offstage";

type Voice = "marimba" | "bell" | "pluck" | "flute" | "bass";
type Spec = {
  bpm: number;
  root: number; // Hz of the tonic
  scale: number[]; // semitones
  chords: number[][]; // scale degrees per bar
  melody: (number | null)[]; // scale degrees per 8th note, null = rest
  lead: Voice;
  drone?: boolean;
  shaker?: boolean;
};

const PENTA = [0, 2, 4, 7, 9];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];

const THEMES: Record<Theme, Spec> = {
  island: { bpm: 100, root: 261.63, scale: MAJOR, chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], melody: [7, null, 9, 7, 4, null, 2, null, 7, null, 9, 11, 9, null, 7, null], lead: "marimba", shaker: true },
  education: { bpm: 88, root: 349.23, scale: MAJOR, chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4]], melody: [7, 9, 11, null, 9, null, 7, null, 4, 7, 9, null, 7, null, null, null], lead: "bell" },
  skills: { bpm: 112, root: 392, scale: MAJOR, chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [3, 5, 7]], melody: [4, 4, 7, null, 4, 9, 7, null, 2, 2, 4, null, 7, null, 4, null], lead: "pluck", shaker: true },
  experience: { bpm: 104, root: 293.66, scale: MAJOR, chords: [[0, 2, 4], [6, 8, 10], [3, 5, 7], [4, 6, 8]], melody: [7, null, 8, 9, null, 7, 4, null, 7, null, 8, 9, 11, null, 9, null], lead: "marimba", shaker: true },
  projects: { bpm: 96, root: 329.63, scale: MINOR, chords: [[0, 2, 4], [5, 7, 9], [2, 4, 6], [4, 6, 8]], melody: [7, null, 9, 10, 9, null, 7, null, 4, null, 7, null, 6, null, 4, null], lead: "pluck" },
  offstage: { bpm: 76, root: 277.18, scale: PENTA, chords: [[0, 3, 5]], melody: [5, null, 6, 7, null, 6, 5, null, 3, null, 4, 5, null, null, 3, null], lead: "flute", drone: true },
};

const freqOf = (s: Spec, degree: number) => {
  const n = s.scale.length;
  const oct = Math.floor(degree / n);
  const semis = s.scale[((degree % n) + n) % n] + 12 * oct;
  return s.root * 2 ** (semis / 12);
};

let musicBus: GainNode | null = null;
let current: Theme | null = null;
let wanted: Theme = "island";
let timer = 0;
let nextTime = 0;
let step = 0;
let started = false;
const LEVEL = 0.2;

function out() {
  const a = audio();
  if (!a) return null;
  if (!musicBus) {
    musicBus = a.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(bus());
  }
  return a;
}

function note(a: AudioContext, voice: Voice, f: number, t: number, len: number, vol = 1) {
  const g = a.createGain();
  g.connect(musicBus!);
  const o = a.createOscillator();
  const env = (attack: number, decay: number, peak: number) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak * vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  };
  switch (voice) {
    case "marimba":
      o.type = "sine";
      env(0.004, 0.45, 0.5);
      break;
    case "bell":
      o.type = "sine";
      env(0.003, 1.1, 0.42);
      break;
    case "pluck":
      o.type = "triangle";
      env(0.004, 0.3, 0.42);
      break;
    case "flute": {
      o.type = "sine";
      env(0.09, len + 0.25, 0.4);
      const lfo = a.createOscillator();
      const lg = a.createGain();
      lfo.frequency.value = 5.5;
      lg.gain.value = f * 0.012;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + len + 0.4);
      break;
    }
    case "bass":
      o.type = "triangle";
      env(0.01, len, 0.5);
      break;
  }
  o.frequency.setValueAtTime(f, t);
  o.connect(g);
  o.start(t);
  o.stop(t + Math.max(len, 1.2) + 0.1);
  // a soft second partial for marimba and bell sparkle
  if (voice === "marimba" || voice === "bell") {
    const o2 = a.createOscillator();
    const g2 = a.createGain();
    o2.type = "sine";
    o2.frequency.setValueAtTime(f * (voice === "bell" ? 2.76 : 4), t);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(0.12 * vol, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o2.connect(g2).connect(musicBus!);
    o2.start(t);
    o2.stop(t + 0.25);
  }
}

function shaker(a: AudioContext, t: number) {
  const len = 0.05;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
  const d = buf.getChannelData(0);
  let s = 11;
  for (let i = 0; i < d.length; i++) {
    s = (s * 16807) % 2147483647;
    d[i] = ((s / 2147483647) * 2 - 1) * (1 - i / d.length);
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 6000;
  const g = a.createGain();
  g.gain.value = 0.08;
  src.connect(f).connect(g).connect(musicBus!);
  src.start(t);
}

function drone(a: AudioContext, s: Spec, t: number, len: number) {
  // a tanpura-like drone on Sa and Pa
  [0, 7, 12].forEach((semi, i) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sawtooth";
    o.frequency.value = (s.root / 2) * 2 ** (semi / 12);
    const lp = a.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 / (i + 1), t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(lp).connect(g).connect(musicBus!);
    o.start(t);
    o.stop(t + len + 0.1);
  });
}

function schedule() {
  const a = out();
  if (!a || !current) return;
  const s = THEMES[current];
  const eighth = 60 / s.bpm / 2;
  while (nextTime < a.currentTime + 0.25) {
    const bar = Math.floor(step / 8) % s.chords.length;
    const pos = step % 8;
    const chord = s.chords[bar];
    if (pos === 0) {
      note(a, "bass", freqOf(s, chord[0] - s.scale.length), nextTime, eighth * 3.5, 0.9);
      if (s.drone && bar === 0) drone(a, s, nextTime, eighth * 16 * s.chords.length);
    }
    if (pos === 4) note(a, "bass", freqOf(s, chord[0] - s.scale.length), nextTime, eighth * 3, 0.6);
    // gentle chord arpeggio underneath
    if (!s.drone && pos % 2 === 1) note(a, s.lead === "bell" ? "bell" : "pluck", freqOf(s, chord[(pos >> 1) % chord.length]), nextTime, eighth, 0.32);
    const m = s.melody[step % s.melody.length];
    if (m !== null) note(a, s.lead, freqOf(s, m), nextTime, eighth * 1.8, 0.7);
    if (s.shaker && pos % 2 === 1) shaker(a, nextTime);
    nextTime += eighth;
    step++;
  }
}

function fade(to: number, secs: number) {
  const a = out();
  if (!a || !musicBus) return;
  const g = musicBus.gain;
  g.cancelScheduledValues(a.currentTime);
  g.setValueAtTime(Math.max(g.value, 0.0001), a.currentTime);
  g.exponentialRampToValueAtTime(Math.max(to, 0.0001), a.currentTime + secs);
}

function startTheme(t: Theme) {
  const a = out();
  if (!a) return;
  current = t;
  step = 0;
  nextTime = a.currentTime + 0.08;
  if (!timer) timer = window.setInterval(schedule, 50);
  fade(LEVEL, 1.4);
}

export const music = {
  /** Which theme belongs here. Plays at once if music has started, else waits for a gesture. */
  set(t: Theme) {
    wanted = t;
    if (started && current !== t) startTheme(t);
  },
  /** The first interaction starts the music (browsers allow audio only after one). */
  start() {
    if (started) return;
    if (!out()) return;
    started = true;
    startTheme(wanted);
  },
  /** Under a scene transition: fade out, switch theme, fade back in. */
  crossfade(t: Theme, outSecs = 0.45) {
    wanted = t;
    if (!started) return;
    fade(0.0001, outSecs);
    window.setTimeout(() => startTheme(t), outSecs * 1000 + 40);
  },
  /** Follow the mute switch. */
  stop() {
    if (timer) window.clearInterval(timer);
    timer = 0;
    current = null;
    started = false;
    if (musicBus) {
      musicBus.disconnect();
      musicBus = null;
    }
  },
};

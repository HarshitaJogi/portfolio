/** The island's palette. Warm, saturated, toy-like. */
export const C = {
  ink: "#2b1e1a",
  sea: "#1f7a8c",
  seaDeep: "#155e6c",
  foam: "#fff3d6",
  sand: "#f2c57c",
  clay: "#c9814a",
  clayDark: "#9c5b31",
  path: "#fff3d6",
  grass: "#7fb069",
  grassDark: "#5a9150",
  leaf: "#4f8a3c",
  bark: "#8a5a3b",
  cream: "#fff8ec",
  coral: "#ff6b4a",
  sun: "#ffc93c",
  cobalt: "#2f5dff",
  plum: "#8e44ad",
  rose: "#ff4f8b",
  green: "#3bb273",
  teal: "#16a3a3",
  steel: "#8d99ae",
  white: "#ffffff",
  red: "#e63946",
};

export const RING_R = 14; // the path everyone walks
export const STOP_COUNT = 9; // stations on the ring (the outro is a camera move, not a station)
export const stopAngle = (i: number) => -Math.PI / 2 + (i / STOP_COUNT) * Math.PI * 2;

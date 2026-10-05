import * as THREE from "three";

export const SPACING = 46;
/** Where item k stands. A gentle zigzag, so the path reads as a path and not a ruler. */
export const anchor = (k: number) => new THREE.Vector3(k * SPACING, 0, k % 2 ? -5 : 5);
/** The dock at the start of every world. */
export const DOCK = new THREE.Vector3(-SPACING * 0.55, 0, 0);
export const DOCK_R = 7;
export const ISLET_R = 11;
export const END_R = 7.5;
/** Where the traveler stands on an item islet: front left, clear of the dioramas. */
export const STAND = new THREE.Vector3(-3.2, 0.16, 6.6);

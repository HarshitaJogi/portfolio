/** Which motion state the avatar lab is showing, as a tiny external store. */
export const STATES = ["idle", "walk", "air", "cheer", "ride"] as const;

let current = 0;
const listeners = new Set<() => void>();

export const labState = {
  get: () => current,
  set(i: number) {
    if (i === current) return;
    current = i;
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};

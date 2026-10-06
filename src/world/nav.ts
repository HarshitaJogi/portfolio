"use client";

/**
 * One way to navigate for every button, portal and nav link. Handlers stack: the root
 * registers a plain router push, and the island shell, while it is on screen, registers
 * the version with the door transition. When the shell unmounts (say, on /skim), its
 * handler comes off the stack, so nothing ever waits on a transition that isn't there.
 */
type Handler = (href: string) => void;
const stack: Handler[] = [];
const fallback: Handler = (href) => {
  window.location.href = href;
};

export const worldNav = {
  register(fn: Handler) {
    stack.push(fn);
    return () => {
      const i = stack.lastIndexOf(fn);
      if (i >= 0) stack.splice(i, 1);
    };
  },
  go(href: string) {
    (stack[stack.length - 1] ?? fallback)(href);
  },
};

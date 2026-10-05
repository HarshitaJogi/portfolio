"use client";

/**
 * Lets the 3D scene navigate like a link: click a portal and the page flies there.
 * The shell registers the real handler (router push behind the cloud wipe).
 */
let handler: (href: string) => void = (href) => {
  window.location.href = href;
};

export const worldNav = {
  register(fn: (href: string) => void) {
    handler = fn;
  },
  go(href: string) {
    handler(href);
  },
};

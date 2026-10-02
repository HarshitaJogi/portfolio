'use client';

import { animate, useInView } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * React Bits CountUp, adapted for content-first rendering:
 * - The server renders the final value, so crawlers, no-JS and slow devices see the real number.
 * - On hydration it rewinds to `from` only if the number has not been seen yet.
 * - Screen readers always get the final value. The animating digits are aria-hidden.
 * - Reduced motion shows the final value with no count.
 */
export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useRef(false);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });

  const decimals = (num: number) => {
    const str = num.toString();
    return str.includes('.') && parseInt(str.split('.')[1]) !== 0 ? str.split('.')[1].length : 0;
  };
  const maxDecimals = Math.max(decimals(from), decimals(to));

  const formatValue = useCallback(
    (latest: number) => {
      const formatted = Intl.NumberFormat('en-US', {
        useGrouping: !!separator,
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals
      }).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator]
  );

  const finalText = formatValue(direction === 'down' ? from : to);

  // Rewind before paint, but only if the number is still below the fold.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = el.getBoundingClientRect();
    const unseen = rect.top > window.innerHeight;
    if (!reduced && unseen) {
      armed.current = true;
      el.textContent = formatValue(direction === 'down' ? to : from);
    }
  }, [direction, from, to, formatValue]);

  useEffect(() => {
    if (!armed.current || !isInView || !startWhen) return;
    onStart?.();
    // A timed tween on the site's settle curve, so the number lands exactly on time.
    const controls = animate(direction === 'down' ? to : from, direction === 'down' ? from : to, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: latest => {
        if (ref.current) ref.current.textContent = formatValue(latest);
      },
      onComplete: () => onEnd?.()
    });
    return () => controls.stop();
  }, [isInView, startWhen, direction, from, to, delay, onStart, onEnd, duration, formatValue]);

  return (
    <>
      <span className={className} ref={ref} aria-hidden="true">
        {finalText}
      </span>
      <span className="sr-only">{finalText}</span>
    </>
  );
}

'use client';

import { useInView, useMotionValue, useSpring } from 'motion/react';
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
  const motionValue = useMotionValue(direction === 'down' ? to : from);
  const armed = useRef(false);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });
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
    const t1 = setTimeout(() => motionValue.set(direction === 'down' ? from : to), delay * 1000);
    const t2 = setTimeout(() => onEnd?.(), delay * 1000 + duration * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isInView, startWhen, motionValue, direction, from, to, delay, onStart, onEnd, duration]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest: number) => {
      if (ref.current && armed.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return (
    <>
      <span className={className} ref={ref} aria-hidden="true">
        {finalText}
      </span>
      <span className="sr-only">{finalText}</span>
    </>
  );
}

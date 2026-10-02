'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  wordClassName?: string;
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * React Bits TrueFocus, adapted:
 * - left-aligned, styled by className, no glow
 * - only cycles while on screen, never under reduced motion
 * - a light blur so unfocused words stay legible
 * - re-measures on resize
 */
const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 1.5,
  borderColor = 'var(--accent)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = '',
  wordClassName = ''
}) => {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });
  const inView = useInView(containerRef, { margin: '-10% 0px' });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (manualMode || !inView || reduced) return;
    const interval = setInterval(
      () => setCurrentIndex(prev => (prev + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000
    );
    return () => clearInterval(interval);
  }, [manualMode, inView, reduced, animationDuration, pauseBetweenAnimations, words.length]);

  useLayoutEffect(() => {
    const measure = () => {
      const word = wordRefs.current[currentIndex];
      const parent = containerRef.current;
      if (!word || !parent) return;
      const p = parent.getBoundingClientRect();
      const a = word.getBoundingClientRect();
      setFocusRect({ x: a.left - p.left, y: a.top - p.top, width: a.width, height: a.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [currentIndex, words.length]);

  const corner = 'absolute w-3.5 h-3.5 border-[2px]';

  return (
    <div className={`relative flex flex-wrap items-center gap-x-[0.35em] ${className}`} ref={containerRef}>
      {words.map((word, index) => {
        const isActive = reduced || index === currentIndex;
        return (
          <span
            key={index}
            ref={el => {
              wordRefs.current[index] = el;
            }}
            className={`relative ${wordClassName}`}
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.55,
              transition: `filter ${animationDuration}s ease, opacity ${animationDuration}s ease`
            }}
            onMouseEnter={() => {
              if (!manualMode) return;
              setLastActiveIndex(index);
              setCurrentIndex(index);
            }}
            onMouseLeave={() => manualMode && lastActiveIndex !== null && setCurrentIndex(lastActiveIndex)}
          >
            {word}
          </span>
        );
      })}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0"
          initial={false}
          animate={{ x: focusRect.x - 8, y: focusRect.y, width: focusRect.width + 16, height: focusRect.height }}
          transition={{ duration: animationDuration, ease: [0.65, 0, 0.35, 1] }}
          style={{ borderColor }}
        >
          <span className={`${corner} -top-1 -left-1 border-r-0 border-b-0`} style={{ borderColor }} />
          <span className={`${corner} -top-1 -right-1 border-l-0 border-b-0`} style={{ borderColor }} />
          <span className={`${corner} -bottom-1 -left-1 border-r-0 border-t-0`} style={{ borderColor }} />
          <span className={`${corner} -bottom-1 -right-1 border-l-0 border-t-0`} style={{ borderColor }} />
        </motion.div>
      )}
    </div>
  );
};

export default TrueFocus;

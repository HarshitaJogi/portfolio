'use client';

import { CSSProperties, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'motion/react';

export type StrokeTextTrigger = 'mount' | 'hover' | 'scroll' | 'loop';
export type StrokeTextFillMode = 'wipe' | 'fade' | 'none';

export interface StrokeTextProps {
  text?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: StrokeTextTrigger;
  fillMode?: StrokeTextFillMode;
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface StrokeTextBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_TEXT = 'Draw Attention';

const StrokeText = ({
  text = DEFAULT_TEXT,
  strokeColor = '#A78BFA',
  fillColor = '#F8FAFC',
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  trigger = 'mount',
  fillMode = 'wipe',
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  reverse = false,
  className = '',
  style = {}
}: StrokeTextProps) => {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const strokeTextRef = useRef<SVGTextElement | null>(null);
  const wipeRectRef = useRef<SVGRectElement | null>(null);

  const [box, setBox] = useState<StrokeTextBox | null>(null);

  const rawId = useId();
  const wipeId = `stroke-text-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const characters = useMemo(() => Array.from(String(text ?? '')), [text]);

  const dash = Math.max(fontSize * 7, 200);

  const fontStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`
    }),
    [fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const node = strokeTextRef.current;
    if (!node) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !strokeTextRef.current) return;
      let bbox: DOMRect | undefined;
      try {
        bbox = strokeTextRef.current.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;

      const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
      const next = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2
      };

      setBox(prev =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
          ? prev
          : next
      );
    };

    measure();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [characters, fontSize, fontWeight, letterSpacing, strokeWidth]);

  // Adapted: Motion's animate() and an IntersectionObserver instead of a GSAP
  // timeline and ScrollTrigger. Same choreography: draw each stroke, then wipe in the fill.
  useEffect(() => {
    const root = rootRef.current;
    if (typeof window === 'undefined' || !root || !box) return undefined;
    const strokes = Array.from(root.querySelectorAll<SVGTSpanElement>('[data-stroke-char]'));
    const fills = Array.from(root.querySelectorAll<SVGTSpanElement>('[data-fill-char]'));
    const wipe = wipeRectRef.current;
    if (!strokes.length) return undefined;

    const fillEnabled = fillMode !== 'none';
    const useWipe = fillEnabled && fillMode === 'wipe';
    const fillDuration = Math.max(0.4, drawDuration * 0.5);
    const order = reverse ? [...strokes].reverse() : strokes;
    const controls: { stop: () => void }[] = [];

    const setStart = () => {
      strokes.forEach(el => {
        el.style.strokeDasharray = String(dash);
        el.style.strokeDashoffset = String(dash);
      });
      fills.forEach(el => (el.style.opacity = useWipe ? '1' : '0'));
      if (wipe) wipe.setAttribute('width', '0');
    };
    const setEnd = () => {
      strokes.forEach(el => {
        el.style.strokeDasharray = String(dash);
        el.style.strokeDashoffset = '0';
      });
      fills.forEach(el => (el.style.opacity = fillEnabled ? '1' : '0'));
      if (wipe) wipe.setAttribute('width', String(fillEnabled ? box.width : 0));
    };

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setEnd();
      return undefined;
    }

    const easing = [0.22, 1, 0.36, 1] as const;
    const play = () => {
      controls.forEach(c => c.stop());
      controls.length = 0;
      setStart();
      order.forEach((el, i) => {
        controls.push(
          animate(dash, 0, {
            duration: drawDuration,
            delay: i * stagger,
            ease: easing,
            onUpdate: v => (el.style.strokeDashoffset = String(v))
          })
        );
      });
      const at = drawDuration + fillDelay + (order.length - 1) * stagger * 0.5;
      if (useWipe && wipe) {
        controls.push(
          animate(0, box.width, { duration: fillDuration, delay: at, ease: [0.65, 0, 0.35, 1], onUpdate: v => wipe.setAttribute('width', String(v)) })
        );
      } else if (fillEnabled) {
        fills.forEach((el, i) =>
          controls.push(animate(0, 1, { duration: fillDuration, delay: at + i * stagger, onUpdate: v => (el.style.opacity = String(v)) }))
        );
      }
    };

    let io: IntersectionObserver | null = null;
    let removeHover: (() => void) | null = null;
    if (trigger === 'hover') {
      setEnd();
      root.addEventListener('pointerenter', play);
      removeHover = () => root.removeEventListener('pointerenter', play);
    } else if (trigger === 'scroll') {
      setStart();
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            play();
            io?.disconnect();
          }
        },
        { rootMargin: '0px 0px -18% 0px' }
      );
      io.observe(root);
    } else {
      play();
    }

    return () => {
      removeHover?.();
      io?.disconnect();
      controls.forEach(c => c.stop());
    };
  }, [box, dash, drawDuration, fillDelay, stagger, trigger, fillMode, reverse]);

  const viewBox = box ? `${box.x} ${box.y} ${box.width} ${box.height}` : `0 ${-fontSize} 600 ${fontSize * 1.3}`;

  return (
    <span
      ref={rootRef}
      className={`block w-full leading-[0] ${trigger === 'hover' ? 'cursor-pointer' : ''} ${className}`.trim()}
      style={style}
      role="img"
      aria-label={String(text ?? '')}
    >
      <svg
        className="block w-full"
        style={{ height: `${Math.round(fontSize * 1.3)}px` }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {fillMode === 'wipe' && box && (
          <defs>
            <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
              <rect ref={wipeRectRef} x={box.x} y={box.y} width="0" height={box.height} />
            </clipPath>
          </defs>
        )}

        <text
          ref={strokeTextRef}
          className="select-none"
          x="0"
          y="0"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={fontStyle}
        >
          {characters.map((char, index) => (
            <tspan data-stroke-char key={`s-${index}`}>
              {char}
            </tspan>
          ))}
        </text>

        <text
          className="select-none"
          x="0"
          y="0"
          fill={fillColor}
          stroke="none"
          style={fontStyle}
          clipPath={fillMode === 'wipe' && box ? `url(#${wipeId})` : undefined}
        >
          {characters.map((char, index) => (
            <tspan data-fill-char key={`f-${index}`}>
              {char}
            </tspan>
          ))}
        </text>
      </svg>
    </span>
  );
};

export default StrokeText;

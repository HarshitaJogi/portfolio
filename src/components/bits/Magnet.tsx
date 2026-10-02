'use client';

import React, { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';

interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
}

/**
 * React Bits Magnet, adapted: writes the transform straight to the DOM inside a
 * rAF instead of calling setState on every mousemove, and only listens on
 * fine-pointer devices.
 */
const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (disabled || !fine || reduced) {
      inner.style.transform = '';
      return;
    }
    let raf = 0;
    let active = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = magnetRef.current;
        if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const near = Math.abs(centerX - e.clientX) < width / 2 + padding && Math.abs(centerY - e.clientY) < height / 2 + padding;
        if (near) {
          if (!active) inner.style.transition = activeTransition;
          active = true;
          inner.style.transform = `translate3d(${(e.clientX - centerX) / magnetStrength}px, ${(e.clientY - centerY) / magnetStrength}px, 0)`;
        } else if (active) {
          active = false;
          inner.style.transition = inactiveTransition;
          inner.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [padding, disabled, magnetStrength, activeTransition, inactiveTransition]);

  return (
    <div ref={magnetRef} className={wrapperClassName} style={{ position: 'relative', display: 'inline-block' }} {...props}>
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
};

export default Magnet;

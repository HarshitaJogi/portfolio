import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  /** Seconds for one sweep. */
  speed?: number;
  /** Seconds of rest between sweeps. */
  delay?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
}

/**
 * React Bits ShinyText, adapted: the sweep is a CSS keyframe animation instead of a
 * JS animation frame loop, so it costs nothing on the main thread and works without
 * hydration. Both colours pass AA, so the text is readable at every frame.
 */
const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2.4,
  delay = 5,
  className = '',
  color = 'var(--ink)',
  shineColor = 'var(--accent)',
  spread = 110
}) => {
  const total = speed + delay;
  const sweepEnd = Math.round((speed / total) * 100);
  const style = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 38%, ${shineColor} 50%, ${color} 62%, ${color} 100%)`,
    backgroundSize: '220% auto',
    backgroundPosition: '150% center',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: disabled ? undefined : `shiny-sweep ${total}s linear infinite`,
    ['--shiny-end' as string]: `${sweepEnd}%`
  } as React.CSSProperties;

  return (
    <span className={`inline-block motion-reduce:animate-none ${className}`} style={style}>
      <style>{`@keyframes shiny-sweep{0%{background-position:150% center}${sweepEnd}%{background-position:-50% center}100%{background-position:-50% center}}`}</style>
      {text}
    </span>
  );
};

export default ShinyText;

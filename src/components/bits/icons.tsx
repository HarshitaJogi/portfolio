/** Local stroke icons replacing @hugeicons in the React Bits sources. */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 16, strokeWidth = 1.8, ...rest }: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest
});

export const TerminalIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 17l6-5-6-5" />
    <path d="M12 19h8" />
  </svg>
);
export const FileIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);
export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </svg>
);
export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
  </svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const RefreshIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </svg>
);
/** A ghungroo: three small ankle bells hanging from a cord. */
export const GhungrooIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 5.5c6 4 13 4 19 0" />
    <path d="M7 8.6v1.6M12 9.8v1.6M17 8.6v1.6" />
    <circle cx="7" cy="13.2" r="3" />
    <circle cx="12" cy="14.4" r="3" />
    <circle cx="17" cy="13.2" r="3" />
    <path d="M6 14.6h2M11 15.8h2M16 14.6h2" />
  </svg>
);
export const AlertIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5.5M12 16.4v.1" />
  </svg>
);
export const LoadingIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
  </svg>
);

"use client";

import { useEffect, useRef } from "react";
import { msciMigration } from "@/content/profile";

/**
 * 15 dots, one per API, cross an arc from Azure to GCP as you scroll. Hollow and
 * dashed while in flight, solid once they land. The arc solidifies behind them.
 */
export function MsciMigration({ className = "mt-8 border-t border-line pt-6" }: { className?: string }) {
  const { from, to, apis, apisLabel, via, results } = msciMigration;
  const wrap = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const solid = useRef<SVGPathElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const el = wrap.current;
    const path = arc.current;
    if (!el || !path || !solid.current) return;
    const total = path.getTotalLength();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the diagram enters at 90% of the viewport, 1 when its centre reaches 40%.
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.5 + r.height * 0.5)));
      solid.current!.style.strokeDasharray = `${(total * p).toFixed(1)} ${total + 2}`;
      dots.current.forEach((d, i) => {
        if (!d) return;
        const lag = (i / apis) * 0.45;
        const t = Math.min(1, Math.max(0, (p - lag) / 0.55));
        const pt = path.getPointAtLength(total * t);
        // land in a small cluster at the destination
        const landed = t >= 1;
        const cx = landed ? pt.x - 10 + (i % 5) * 5 : pt.x;
        const cy = landed ? pt.y + 14 + Math.floor(i / 5) * 5 : pt.y;
        const sx = t <= 0 ? pt.x - 10 + (i % 5) * 5 : cx;
        const sy = t <= 0 ? pt.y + 14 + Math.floor(i / 5) * 5 : cy;
        d.setAttribute("cx", sx.toFixed(1));
        d.setAttribute("cy", sy.toFixed(1));
        d.setAttribute("data-landed", landed ? "1" : "0");
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [apis]);

  const d = "M 70 170 C 110 30, 490 30, 530 170";

  return (
    <div ref={wrap} className={className}>
      <h4 className="text-label font-mono text-ink">
        {apisLabel}, {from} to {to}, via {via}
      </h4>
      <figure className="mt-4">
        <svg viewBox="0 0 600 220" className="w-full max-w-[40rem]" role="img" aria-label={`${apisLabel} migrated from ${from} to ${to}`}>
          <path ref={arc} d={d} fill="none" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 6" />
          <path ref={solid} d={d} fill="none" stroke="var(--ink)" strokeWidth="1.25" style={{ strokeDasharray: "0 1000" }} />
          {Array.from({ length: apis }, (_, i) => (
            <circle
              key={i}
              ref={(el) => {
                dots.current[i] = el;
              }}
              r="2.6"
              className="msci-dot"
              cx="70"
              cy="184"
            />
          ))}
          <text x="70" y="212" textAnchor="middle" className="fill-muted font-mono text-[13px] tracking-[0.08em] uppercase">
            {from}
          </text>
          <text x="530" y="212" textAnchor="middle" className="fill-ink font-mono text-[13px] tracking-[0.08em] uppercase">
            {to}
          </text>
        </svg>
      </figure>
      <dl className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
        {results.map((r) => (
          <div key={r.label} className="flex items-baseline gap-3">
            <dt className="sr-only">{r.label}</dt>
            <dd className="text-[clamp(2.5rem,1.8rem+2vw,3.5rem)] leading-none">{r.value}</dd>
            <dd className="text-body text-muted">{r.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

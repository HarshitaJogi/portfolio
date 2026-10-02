"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The page line. One continuous stroke from the hero portrait to the footer.
 *
 *   ahead of the reader:  dashed  (draft)
 *   behind the reader:    solid   (verified)
 *
 * It threads through every `.line-mark` element in document order. A mark can carry
 *   data-node="ring"      draw a node that turns solid once passed
 *   data-loop="<px>"      make one full loop of that radius, like a turn
 *
 * Geometry is measured from the DOM and re-measured on resize. Scroll handling writes
 * straight to the SVG, never through React state.
 */

type Pt = { x: number; y: number; node: boolean; loop: number };
type Sample = { x: number; y: number; len: number; vy: number };

const TIP = 0.62; // the pen sits 62% down the viewport

function cubicPoint(p0: Pt, p1: Pt, k: number, t: number) {
  // C (x0, y0+k) (x1, y1-k) (x1, y1)
  const mt = 1 - t;
  const a = mt * mt * mt,
    b = 3 * mt * mt * t,
    c = 3 * mt * t * t,
    d = t * t * t;
  return {
    x: a * p0.x + b * p0.x + c * p1.x + d * p1.x,
    y: a * p0.y + b * (p0.y + k) + c * (p1.y - k) + d * p1.y,
  };
}

function build(points: Pt[]) {
  if (points.length < 2) return null;
  const parts: string[] = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  const samples: Sample[] = [{ x: points[0].x, y: points[0].y, len: 0, vy: points[0].y }];
  const nodes: { x: number; y: number; len: number }[] = [];
  let len = 0;
  let shift = 0; // virtual-y offset accumulated by loops
  let prev = { x: points[0].x, y: points[0].y };

  const push = (x: number, y: number, vy: number) => {
    len += Math.hypot(x - prev.x, y - prev.y);
    prev = { x, y };
    samples.push({ x, y, len, vy });
  };

  if (points[0].node) nodes.push({ x: points[0].x, y: points[0].y, len: 0 });

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const dy = Math.max(1, p1.y - p0.y);
    if (Math.abs(p1.x - p0.x) < 0.5) {
      parts.push(`L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`);
      const steps = Math.max(2, Math.ceil(dy / 40));
      for (let s = 1; s <= steps; s++) {
        const y = p0.y + (dy * s) / steps;
        push(p1.x, y, y + shift);
      }
    } else {
      const k = Math.min(dy * 0.5, 320);
      parts.push(
        `C ${p0.x.toFixed(1)} ${(p0.y + k).toFixed(1)} ${p1.x.toFixed(1)} ${(p1.y - k).toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
      );
      for (let s = 1; s <= 48; s++) {
        const q = cubicPoint(p0, p1, k, s / 48);
        push(q.x, q.y, q.y + shift);
      }
    }
    if (p1.node) nodes.push({ x: p1.x, y: p1.y, len });

    if (p1.loop > 0) {
      // Enter at the circle's leftmost point heading down, go round once, leave the same way.
      const r = p1.loop;
      const cx = p1.x + r;
      parts.push(
        `A ${r} ${r} 0 1 0 ${(p1.x + 2 * r).toFixed(1)} ${p1.y.toFixed(1)}`,
        `A ${r} ${r} 0 1 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
      );
      const span = 2 * r; // the loop draws while the reader scrolls this far
      for (let s = 1; s <= 96; s++) {
        const a = Math.PI + (s / 96) * Math.PI * 2; // leftmost, then down (screen) and round
        const x = cx + r * Math.cos(a);
        const y = p1.y - r * Math.sin(a);
        push(x, y, p1.y + shift + (span * s) / 96);
      }
      shift += span;
    }
  }
  return { d: parts.join(" "), samples, nodes, total: len };
}

export function PageLine() {
  const root = useRef<HTMLDivElement>(null);
  const base = useRef<SVGPathElement>(null);
  const solid = useRef<SVGPathElement>(null);
  const tip = useRef<SVGCircleElement>(null);
  const [geo, setGeo] = useState<ReturnType<typeof build> & { w: number; h: number } | null>(null);
  const [reduced, setReduced] = useState(false);

  // Measure marks.
  useEffect(() => {
    const el = root.current;
    const host = el?.parentElement?.parentElement;
    if (!el || !host) return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el.offsetParent === null) return; // hidden (skim view)
        const hostRect = host.getBoundingClientRect();
        const marks = Array.from(host.querySelectorAll<HTMLElement>(".line-mark")).filter(
          (m) => m.offsetParent !== null || getComputedStyle(m).position === "fixed",
        );
        const pts: Pt[] = marks
          .map((m) => {
            const r = m.getBoundingClientRect();
            return {
              x: r.left + r.width / 2 - hostRect.left,
              y: r.top + r.height / 2 - hostRect.top,
              node: m.dataset.node === "ring",
              loop: Number(m.dataset.loop || 0),
            };
          })
          .sort((a, b) => a.y - b.y);
        const g = build(pts);
        setGeo(g ? { ...g, w: hostRect.width, h: hostRect.height } : null);
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    document.fonts?.ready.then(measure);
    window.addEventListener("load", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
  }, []);

  // Draw progress on scroll.
  useEffect(() => {
    if (!geo || !base.current || !solid.current) return;
    const host = root.current?.parentElement?.parentElement;
    if (!host) return;
    const real = base.current.getTotalLength();
    const scale = geo.total > 0 ? real / geo.total : 1;
    const nodeEls = Array.from(root.current!.querySelectorAll<SVGGElement>("[data-node-i]"));

    const paint = () => {
      if (reduced) {
        solid.current!.style.strokeDasharray = "none";
        nodeEls.forEach((n) => n.setAttribute("data-passed", ""));
        return;
      }
      const hostTop = host.getBoundingClientRect().top;
      const target = window.innerHeight * TIP - hostTop;
      // largest sample with virtual y <= target
      const s = geo.samples;
      let lo = 0,
        hi = s.length - 1;
      if (target <= s[0].vy) hi = 0;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (s[mid].vy <= target) lo = mid;
        else hi = mid - 1;
      }
      let len = s[lo].len;
      let x = s[lo].x,
        y = s[lo].y;
      const next = s[lo + 1];
      if (next && next.vy > s[lo].vy && target > s[lo].vy) {
        const f = Math.min(1, (target - s[lo].vy) / (next.vy - s[lo].vy));
        len += (next.len - s[lo].len) * f;
        x += (next.x - x) * f;
        y += (next.y - y) * f;
      }
      const drawn = len * scale;
      solid.current!.style.strokeDasharray = `${drawn.toFixed(1)} ${(real + 10).toFixed(1)}`;
      if (tip.current) {
        tip.current.setAttribute("cx", x.toFixed(1));
        tip.current.setAttribute("cy", y.toFixed(1));
        tip.current.style.opacity = len > 4 && len < geo.total - 4 ? "1" : "0";
      }
      nodeEls.forEach((n, i) => {
        if (geo.nodes[i].len <= len + 0.5) n.setAttribute("data-passed", "");
        else n.removeAttribute("data-passed");
      });
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paint();
      });
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [geo, reduced]);

  return (
    <div ref={root} aria-hidden="true" className="page-line pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {geo && (
        <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} className="absolute top-0 left-0">
          <path ref={base} d={geo.d} fill="none" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 6" />
          <path
            ref={solid}
            d={geo.d}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.25"
            strokeLinecap="round"
            style={{ strokeDasharray: `0 ${geo.total + 10}` }}
          />
          {geo.nodes.map((n, i) => (
            <g key={i} data-node-i={i} className="line-node">
              <circle cx={n.x} cy={n.y} r="7" fill="var(--paper)" stroke="var(--rule-strong)" strokeDasharray="2.2 2.2" />
              <circle cx={n.x} cy={n.y} r="3" className="line-node-dot" fill="var(--accent)" />
            </g>
          ))}
          {!reduced && <circle ref={tip} r="3.5" fill="var(--accent)" style={{ opacity: 0, transition: "opacity 200ms" }} />}
        </svg>
      )}
    </div>
  );
}

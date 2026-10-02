"use client";

import { useEffect, useRef, useState } from "react";
import TearTicket from "@/components/bits/TearTicket";
import { hackathons } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";

/** Hackathons are events, so each one is a ticket. Tear the stub to stamp it. */
export function HackathonTickets() {
  const colors = useThemeColors();
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(440);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cols = window.innerWidth >= 1024 ? 2 : 1;
      setW(Math.min(460, Math.floor((el.clientWidth - (cols - 1) * 40) / cols)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const h = Math.round(w * 0.52);
  const stub = Math.round(w * 0.3);

  return (
    <div ref={box} className="mt-10 grid gap-10 lg:grid-cols-2">
      {hackathons.tickets.map((t) => (
        <div key={t.id} className="flex flex-col items-start gap-4">
          <TearTicket
            width={w}
            height={h}
            stubSize={stub}
            radius={10}
            holes={9}
            rotate={t.id === "harvard" ? -2 : 2}
            tiltMax={6}
            background={colors?.paperDeep ?? "#efe8da"}
            stubBackground={colors?.paper ?? "#f6f1e7"}
            color={colors?.ink ?? "#16130f"}
            borderColor={colors?.rule ?? "#c9bba3"}
            ariaLabel={`Tear the stub off the ${t.event} ticket`}
            stub={
              <div className="flex h-full flex-col justify-between p-4">
                <span className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase opacity-70">{t.stub}</span>
                <span className="font-display text-[1.375rem] leading-none">{t.date}</span>
              </div>
            }
          >
            <div className="flex h-full flex-col justify-between p-5">
              <span className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase opacity-70">{t.event}</span>
              <span>
                <span className="font-display block text-[clamp(1.75rem,1.3rem+1.5vw,2.5rem)] leading-none">{t.project}</span>
                <span className="mt-2 block text-[0.9375rem] leading-snug opacity-80">{t.line}</span>
              </span>
              <span className="font-mono text-[0.75rem] tracking-[0.06em] uppercase" style={{ color: colors?.accent }}>
                {t.stamp}
              </span>
            </div>
          </TearTicket>
          {t.href && (
            <a href={t.href} className="link text-label font-mono text-muted" target="_blank" rel="noopener noreferrer">
              {t.project} ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

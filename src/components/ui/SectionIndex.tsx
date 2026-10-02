"use client";

import LineSidebar from "@/components/bits/LineSidebar";
import WarmTooltip, { WarmTooltipGroup } from "@/components/bits/WarmTooltip";
import { sections } from "@/content/profile";
import { useActiveSection } from "@/lib/useActiveSection";
import { useMargamSeen } from "@/lib/margam";

const ids = sections.map((s) => s.id);

/**
 * Desktop table of contents on the right edge. After the margam reveal, each entry
 * also carries its part of the recital as a tooltip.
 */
export function SectionIndex() {
  const active = useActiveSection(ids);
  const seen = useMargamSeen();
  return (
    <div className="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 3xl:block" data-story-only>
      <div className="pointer-events-auto">
        <WarmTooltipGroup>
          <LineSidebar
            ariaLabel="Sections"
            items={sections.map((s) => s.label)}
            hrefs={sections.map((s) => `#${s.id}`)}
            active={active}
            accentColor="var(--accent)"
            textColor="var(--muted)"
            markerColor="var(--rule-strong)"
            fontSize={0.8125}
            itemGap={12}
            markerLength={28}
            markerGap={10}
            maxShift={8}
            proximityRadius={70}
            wrapItem={(node, i) =>
              seen ? (
                <WarmTooltip
                  content={sections[i].margam}
                  side="left"
                  size="sm"
                  surfaceColor="var(--ink)"
                  inkColor="var(--paper)"
                >
                  {node as React.ReactElement<Record<string, unknown>>}
                </WarmTooltip>
              ) : (
                node
              )
            }
          />
        </WarmTooltipGroup>
      </div>
    </div>
  );
}

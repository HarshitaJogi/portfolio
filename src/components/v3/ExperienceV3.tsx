import dynamic from "next/dynamic";
import { drone, patent, publications, work } from "@/content/profile";
import { Band, BandLabel } from "./Band";
import { Chapter } from "./Chapter";

const AgentConsole = dynamic(() => import("@/components/hero/AgentConsole").then((m) => m.AgentConsole));
const NsiAccuracy = dynamic(() => import("@/components/work/NsiAccuracy").then((m) => m.NsiAccuracy));
const MsciMigration = dynamic(() => import("@/components/work/MsciMigration").then((m) => m.MsciMigration));
const ResearchVisual = dynamic(() => import("./ResearchVisual").then((m) => m.ResearchVisual));

const role = (id: string) => work.roles.find((r) => r.id === id)!;

/** Shabdam, the story. One colour band per chapter, newest first. */
export function ExperienceV3() {
  return (
    <div id="work" aria-labelledby="work-title">
      <h2 id="work-title" className="sr-only">
        Experience
      </h2>

      <Band id="ch-nokia" tone="red" labelledBy="role-nokia-name">
        <BandLabel index="02" margam="Shabdam">
          Experience · now
        </BandLabel>
        <div className="mt-10">
          <Chapter
            role={role("nokia")}
            when="May 2026 – now · Sunnyvale"
            visual={
              <div className="lg:rotate-1">
                <AgentConsole />
                <p className="mt-6 text-center font-mono text-[0.8125rem]">You are the human in the loop. Hold the button.</p>
              </div>
            }
          />
        </div>
      </Band>

      <Band id="ch-nsi" tone="marigold" labelledBy="role-nsi-name">
        <Chapter
          role={role("nsi")}
          when="Jul 2025 – Jul 2026 · Northeastern"
          flip
          visual={
            <div className="card p-6 md:p-8 lg:-rotate-1">
              <NsiAccuracy className="" />
            </div>
          }
        />
      </Band>

      <Band id="ch-msci" tone="teal" labelledBy="role-msci-name">
        <Chapter
          role={role("msci")}
          when="Jan 2024 – Aug 2025 · Mumbai"
          visual={
            <div className="card p-6 md:p-8 lg:rotate-1">
              <MsciMigration className="" />
            </div>
          }
        />
      </Band>

      <Band id="ch-research" tone="green" labelledBy="role-iitp-name">
        <Chapter
          role={role("iitp")}
          when="2023 · where it started"
          flip
          visual={<ResearchVisual />}
          extra={
            <div className="mt-8 border-t-2 border-current pt-6">
              <p className="text-[1.125rem] font-bold">{drone.fullName}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                <li className="chip bg-ink text-green">{drone.grant} IEEE AESS grant</li>
                <li className="chip">{drone.role}</li>
                <li className="chip">2 IEEE papers</li>
                <li className="chip">{patent.status}</li>
              </ul>
              <ul className="mt-4 space-y-1.5 text-[0.9375rem]">
                {publications.map((p) => (
                  <li key={p.id}>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="link font-medium">
                      {p.short}
                    </a>{" "}
                    <span className="font-mono text-[0.75rem]">IEEE SPACE {p.year} ↗</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      </Band>
    </div>
  );
}

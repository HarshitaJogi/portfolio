import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/v2/SectionHeader";

const StackGrid = dynamic(() => import("@/components/v2/StackGrid").then((m) => m.StackGrid));

export function Stack() {
  return (
    <section id="toolkit" aria-labelledby="toolkit-title" className="px-gutter mx-auto max-w-[84rem] py-20 md:py-28">
      <SectionHeader id="toolkit" index="03" label="STACK" title="Tools, with receipts" margam="Varnam" aside={<p className="font-mono text-[0.8125rem] text-muted">Hover any tool to see where I used it</p>} />
      <StackGrid />
    </section>
  );
}

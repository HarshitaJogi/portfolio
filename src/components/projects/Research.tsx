"use client";

import { useState } from "react";
import Folder from "@/components/bits/Folder";
import { patent, publications } from "@/content/profile";
import { cn } from "@/lib/utils";

/** A sheet of paper with a few ruled lines. Decoration only, the citations carry the text. */
function Paper() {
  return (
    <span aria-hidden="true" className="block space-y-1.5 p-2.5 pt-3">
      <span className="block h-px w-[80%] bg-[#16130F]/40" />
      <span className="block h-px w-[60%] bg-[#16130F]/30" />
      <span className="block h-px w-[70%] bg-[#16130F]/30" />
    </span>
  );
}

/** Two IEEE papers and a patent. The folder is the object, the citations are the record. */
export function Research() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-14 grid gap-10 border-t border-hairline pt-10 md:grid-cols-12">
      <div className="flex flex-col items-start gap-6 md:col-span-3">
        <h4 className="text-label font-mono text-ink">Research</h4>
        <div className="pt-16 pl-10">
          <Folder
            color="#9E2A2B"
            size={1.15}
            open={open}
            onOpenChange={setOpen}
            label="research folder"
            items={[
              <Paper key="a" />,
              <Paper key="b" />,
              <Paper key="c" />,
            ]}
          />
        </div>
      </div>
      <ol className="space-y-8 md:col-span-9">
        {publications.map((p, i) => (
          <li
            key={p.id}
            className={cn("transition-colors duration-500", open && "text-ink")}
            style={{ transitionDelay: open ? `${i * 120}ms` : "0ms" }}
          >
            <p className="font-display text-[clamp(1.5rem,1.2rem+0.9vw,2rem)] leading-tight">{p.short}</p>
            <p className="mt-2 text-[1rem] leading-relaxed text-muted">
              {p.authors}, &ldquo;
              <a href={p.href} className="link text-ink" target="_blank" rel="noopener noreferrer">
                {p.title}
              </a>
              ,&rdquo; <i>{p.venue}</i>, {p.pages}, {p.year}.
            </p>
          </li>
        ))}
        <li>
          <p className="font-display text-[clamp(1.5rem,1.2rem+0.9vw,2rem)] leading-tight">{patent.status}</p>
          <p className="mt-2 text-[1rem] text-muted">{patent.title}</p>
        </li>
      </ol>
    </div>
  );
}

import dynamic from "next/dynamic";
import { contact, media, person } from "@/content/profile";
import { SectionHeader } from "@/components/v2/SectionHeader";

const EmailCopy = dynamic(() => import("@/components/contact/EmailCopy").then((m) => m.EmailCopy));
const ContactMark = dynamic(() => import("@/components/contact/ContactMark").then((m) => m.ContactMark));

/** Tillana, the brisk finale. Every way to reach her, one tap each. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="px-gutter mx-auto max-w-[84rem] py-20 md:py-28">
      <div className="panel relative overflow-hidden p-6 md:p-12">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeader id="contact" index="05" label="CONTACT" title={contact.title} margam="Tillana" className="mb-6 md:mb-8" />
            <p className="text-lead text-muted">{contact.short}</p>
            <div className="mt-8">
              <EmailCopy />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={media.resumePdf} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-5 text-[0.9375rem] font-medium text-bg hover:bg-accent">
                Resume <span className="font-mono text-[0.75rem] opacity-70">PDF</span>
                <span className="sr-only">, opens in a new tab</span>
              </a>
              <a href={person.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-[0.9375rem] hover:border-ink">
                LinkedIn ↗<span className="sr-only">, opens in a new tab</span>
              </a>
              <a href={person.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-[0.9375rem] hover:border-ink">
                GitHub ↗<span className="sr-only">, opens in a new tab</span>
              </a>
            </div>
          </div>
          <div className="hidden justify-center lg:col-span-4 lg:flex">
            <ContactMark />
          </div>
        </div>
      </div>
    </section>
  );
}

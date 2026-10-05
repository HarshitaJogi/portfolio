import dynamic from "next/dynamic";
import { contact, media, person } from "@/content/profile";
import { Band, BandLabel } from "./Band";

const EmailCopy = dynamic(() => import("@/components/contact/EmailCopy").then((m) => m.EmailCopy));

/** Tillana, the brisk finale. One line, one email, three buttons. */
export function ContactV3() {
  return (
    <Band id="contact" tone="marigold" labelledBy="contact-title">
      <BandLabel index="05" margam="Tillana">
        Contact
      </BandLabel>
      <h2 id="contact-title" className="text-display mt-8 max-w-[14ch]">
        {contact.title}
      </h2>
      <p className="text-lead mt-6 max-w-[40ch]">{contact.short}</p>
      <div className="mt-12 max-w-[60rem]">
        <EmailCopy />
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href={media.resumePdf} target="_blank" rel="noopener" className="pill h-12 bg-ink px-6 text-[1rem] text-cream no-underline shadow-[4px_4px_0_var(--red)] transition-transform hover:-translate-y-0.5">
          Resume PDF ↓<span className="sr-only">, opens in a new tab</span>
        </a>
        <a href={person.links.linkedin} target="_blank" rel="noopener noreferrer" className="pill h-12 border-2 border-ink bg-cream px-6 text-[1rem] text-ink no-underline transition-transform hover:-translate-y-0.5">
          LinkedIn ↗<span className="sr-only">, opens in a new tab</span>
        </a>
        <a href={person.links.github} target="_blank" rel="noopener noreferrer" className="pill h-12 border-2 border-ink bg-cream px-6 text-[1rem] text-ink no-underline transition-transform hover:-translate-y-0.5">
          GitHub ↗<span className="sr-only">, opens in a new tab</span>
        </a>
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 hidden h-[28rem] w-[28rem] rounded-full border-[28px] border-red md:block" />
      <span aria-hidden="true" className="pointer-events-none absolute right-40 bottom-48 hidden h-24 w-24 rounded-full bg-teal md:block" />
    </Band>
  );
}

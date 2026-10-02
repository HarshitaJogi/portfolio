import dynamic from "next/dynamic";
import { contact, media, person } from "@/content/profile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CircleButton } from "@/components/ui/CircleButton";
const EmailCopy = dynamic(() => import("@/components/contact/EmailCopy").then((m) => m.EmailCopy));
const ContactMark = dynamic(() => import("@/components/contact/ContactMark").then((m) => m.ContactMark));

/** Tillana: brisk and joyful. Every way to reach her, one tap each. */
export function Contact() {
  return (
    <Section id="contact" className="pb-16 md:pb-24">
      <SectionHeading id="contact" index="08" kicker="Contact" title={contact.title} margam="Tillana" />
      <EmailCopy />
      <div className="mt-16 grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-lead measure">{contact.line}</p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <CircleButton href={media.resumePdf} external sub="PDF" size={104}>
              Resume
            </CircleButton>
            <CircleButton href={person.links.linkedin} external variant="outline" size={104} arrow>
              LinkedIn
            </CircleButton>
            <CircleButton href={person.links.github} external variant="outline" size={104} arrow>
              GitHub
            </CircleButton>
          </div>
        </div>
        <div className="flex justify-center md:col-span-5 md:justify-end">
          <ContactMark />
        </div>
      </div>
    </Section>
  );
}

import { story } from "@/content/profile";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { ProseReveal } from "@/components/ui/ProseReveal";
import TrueFocus from "@/components/bits/TrueFocus";

/** Shabdam: movement joined to words. The story in four sentences, then the principle. */
export function Story() {
  return (
    <Section id="story">
      <h2 id="story-title">
        <Kicker index="02" margam="Shabdam">
          {story.kicker}
        </Kicker>
      </h2>
      <ProseReveal
        text={story.paragraph}
        className="font-display mt-8 max-w-[30ch] text-[clamp(1.875rem,1.1rem+2.6vw,3.25rem)] leading-[1.18] tracking-[-0.005em] md:max-w-[34ch]"
      />
      <div className="mt-20 md:mt-28">
        <p className="sr-only">{story.principle.join(" ")}</p>
        <div aria-hidden="true">
          <TrueFocus
            sentence={story.principle.join(" ")}
            className="font-display text-[clamp(3.25rem,1.5rem+6.5vw,7.5rem)] leading-none"
            pauseBetweenAnimations={1.1}
            animationDuration={0.55}
          />
        </div>
        <p className="text-label mt-8 font-mono text-muted">{story.principleNote}</p>
      </div>
    </Section>
  );
}

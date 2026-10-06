# Harshita Jogi: Portfolio Design Doc

## v9 "Arrive, then explore" (Oct 2026), current

- **First visit: one welcome screen, which is the traveler pick.** It is a full screen of its own, not an overlay on the island:
  - "Welcome to my island" and "Hi, I'm Harshita.", then "Who's coming with you?";
  - "Skip for now" and "Skip to the text version", for anyone in a hurry;
  - picking a traveler plays the door ("Entering The island"), and the traveler greets you on the other side.

  It is deliberately not two screens: every extra screen before the content costs a recruiter's patience.
- **Unhurried pace.** Each step's flight takes 2.2 to 4 s. The hub run is about 40% slower, with slower hops.
- **Navigation never sticks.**
  - **Handler stack:** handlers are a stack. The root registers a plain router push, and the island shell registers the door transition only while it is mounted.
  - **Stale state:** a shell that mounts mid-transition resets, and a watchdog never lets the cover stay up past 6 s. Repeat presses during a cover are ignored.
  - **Test suite:** 19 navigation paths are covered: the text page, back and forward, browser back mid-transition, double clicks, deep links, the command menu, the passport, and the ends of worlds. They pass on desktop and phone.
- **The name card flips to the resume.** The back has a live PDF preview inside the card, a big Download PDF, Open full size, and the links. The sticker reads "Tap for my resume".
- **Bigger top bar.** It is taller, with 18px extra-bold links and 48px controls. The links show from 1280px wide, with Menu below that. Phones get a compact bar: an arrow for Island, and a passport pill with just its dots and count.

## v8 (Oct 2026), superseded

## v7 "Bold and loud" (Oct 2026), superseded

**Why:** v6 had every piece, but a stranger still could not see what to press next. Sounds were too quiet to notice, the type looked timid, and the traveler picker hid inside a card.

- **The big CTA.** One button per state, in its own corner and never inside the card.
  - It has a thick 3D base it presses into, a glossy face, a pulsing ring, a shimmying arrow, and two lines: what it is ("NEXT · 2 OF 4", "ENTER THE WORLD") and where it goes ("MSCI", "Education").
  - If the visitor goes quiet for 4.5 s, or tries to scroll, it jumps and a hand taps at it. Back is a smaller button of the same build, beside it.
- **Traveler chooser.** The first visit to the hub opens a full-screen chooser.
  - The title pops in, then five cards fly in one by one. Each character speaks in its own voice on hover or focus: a robot beep, a cat meow, a duckling quack, an elephant trumpet, a peacock call.
  - Picking one bursts stars. "Let's go with ___" rains confetti, plays a fanfare, and the traveler greets the visitor on the island and says what to press.
  - It reopens from "Change traveler".
- **One audio engine** (`lib/audio.ts`). Every sound goes through one master bus with a compressor, with a mute toggle in the nav. Sounds land on the same frame as their visuals:
  - **Buttons:** a fat pop, plus a hover tick on big buttons.
  - **Moving between cards:** a rush forward when the card leaves, and a two-note landing when the next one arrives.
  - **The traveler:** footsteps on every hop, an engine whoosh at plane takeoff, a whoosh as the camera flies to a district, and a whoosh on the cloud wipe.
  - **Moments:** a coin and sparkle for eggs, a thud with a shake for stamps, and a fanfare when the passport is complete. Island sounds are about twice as loud as before.
- **Juice.**
  - **Buttons:** clicking one bursts stars, dots, a ray flash and a shockwave ring (`components/v5/juice.ts`).
  - **Cards:** they squash and fly out, and the next one springs in.
  - **Stamps:** they land with rays and a screen shake on a dimmed backdrop, plus confetti rain when the passport is complete.
  - **On the island:** every pop-up word is 1.5× bigger, with a candy burst of ink-shadowed stars, a flash and a shockwave behind it, timed with its sound.
- **Bolder type:** cards have 4px borders and 10px shadows. Body copy uses heavier weights in full ink, highlights are larger and extra-bold, and kickers and labels are bold mono.

## v6 "Never stuck" (Oct 2026), superseded

**Why:** scrolling drove the camera, so a fast scroll skipped whole steps and the next move was never obvious. The island was pretty but you could not pick a place on it. Bullets were long.

**Navigation, rebuilt around one rule: there is always one big obvious next thing to press.**
- **No scroll tour.** Every page shows one card at a time. Each card ends with the same footer: Back on the left, a big popping **Next** on the right that names where it goes ("Next: MSCI", "Finish Experience", "Continue to Projects"). Arrow keys, swipes, the rail dots and the URL hash (`/experience#nokia`) all move the same step. Trying to scroll makes the Next button wiggle.
- **Camera:** each move is a timed flight, about 1.3 to 2.8 s with an ease in and out, so it can't race ahead.
- **The hub is a map.** Drag to turn the island, which drifts when left alone. Every district has a big label. Tap a district or its label and the camera flies there, with a card summarising it and a big **ENTER**. ‹ › walk the districts. "See the island from above" shows the margam. On phones a strip of district buttons replaces the 3D labels.
- **Buttons pop.** They are chunky and ink-outlined, press into the page with a hard shadow collapse, play a soft synthesized pop, and burst a few confetti dots.

**Cards:** concise one-line highlights with a coloured tick and the numbers marked. The full bullets fold behind a dashed "Read the full details" button. Type is about 15% bigger throughout.

**Travelers:** pick Bolt the robot, Mochi the cat, Pip the duckling, Gajju the baby elephant or Mayu the peacock. Mayu fans its tail and does a Bharatanatyam head slide when it cheers.
- **In worlds:** it walks the bridges. In Experience it boards a little plane and flies city to city.
- **On the hub:** it runs around the shore to the district you picked.
- **Cheering:** it cheers on stamps, approvals and easter eggs. Click it and it says a line.

**Passport:** finish a world and its stamp thuds down, dated. The nav shows 0/5 to 5/5. The hub's margam path fills with colour as worlds are stamped. All five stamps unlock a finale and the contact card.

**Places:**
- **Venues:** Bitgig is at UC Berkeley (a campanile with live Berkeley time and a bell tune), and TryBud is at Harvard Hack-o-Ween in Boston (brownstones and a live Boston clock).
- **Universities:** University of Mumbai and Northeastern University are named on their buildings, with the city as a smaller label.

**Interaction:** every islet and district has 2 to 4 things to click. Each one is marked with a bobbing hint until the first tap, and plays a sound, an animation and usually a pop-up word.

**Performance:**
- **Shared outline geometry:** ink outlines share one creased geometry per shape (`world/ink.tsx`).
- **Shared rounded boxes:** rounded boxes share one geometry per size (`world/rounded.tsx`). Together these cut mount time sharply.
- **Phones:** no shadow pass.
- **Lighthouse (production build):** desktop is 100 in every category. Mobile performance is 75 to 89, with accessibility, best practices and SEO at 100.

The v5 and earlier sections below are kept for the record.

## v5 "A map of the resume" (Oct 2026), superseded

**Why:** v4 looked right, but the island was a list of things she did in no particular order. A recruiter liked the look and could not get a clear picture. v5 keeps the island and gives it structure.

**Structure: one hub, five worlds.**
- **The hub** (`/`) is the island. Each of its seven districts is one section of the resume, in a classic new-grad order: Welcome, Education, Skills, Experience, Projects & research, Off-stage, Contact. Each district has a miniature of its world and a portal in its margam colour. Each card is a short summary with an **Enter** button.
- **Worlds** (`/education`, `/skills`, `/experience`, `/projects`, `/offstage`) are separate routes, so any of them can be linked to directly. A world is a chain of islets in time order. Scrolling walks the path one step at a time. Each step has a full detail card with dates, place, every bullet, stack and links. The end of each world is a portal to the next world, so the whole site reads as one journey: Start the tour → Education → Skills → Experience → Projects → Off-stage → Contact.
- **Moving between scenes**: the canvas lives in the layout and is never torn down. A cloud wipe closes, the route changes, the new scene builds and compiles behind the clouds, then they part.

**The places are real.** Every locale detail comes from a fact in `profile.ts`:

| Step | Place | Details |
|---|---|---|
| IIT Patna, Research Intern | Remote | A home desk. The laptop shows a maize leaf with a box locking onto the blight, and "86% detection accuracy". A quantized edge board. A Wi-Fi router broadcasting |
| MSCI, Technology Analyst | Mumbai | A cable-stayed sea bridge with kaali-peeli taxis (click for a honk), the skyline, seafront lamps that light at dusk, a monsoon cloud, the Azure → GCP migration |
| NSI, Research Assistant | Boston | Brownstones, fall maples and falling leaves, the Green Line trolley (click for the bell), a network-science sculpture, the 60% → 98% conveyor, a sailboat on the water |
| Nokia, SWE Co-op | Sunnyvale | Golden hills, palms, a big sun, a rack of live hardware cabled to the test bench, the 50K+ line framework as a stack of printouts, the agent at the review gate, and a dashed "next suite" |
| University of Mumbai | Mumbai | A Gothic clock tower, a circuit-board ground for Electronics |
| Northeastern | Boston | Red brick and columns, a husky, course books, two medals. The cap is dashed until May 2027 |
| Hackathons | Venue not shown | The exact venues are unconfirmed, so those dioramas show the event, not a city |

Every city has a clock showing its **real local time**. The card shows it too ("10:19 PM in Sunnyvale"). This is a quiet nod to the Event Scheduler's timezone conversion.

**The one rule still holds:** dashed = draft, solid = verified. It covers the robot's tests until APPROVE, the 2027 cap, the "next suite" crate, the "also familiar" skills cart and the "your team" plinth.

**Easter eggs** (10, tracked in a small pill once you find the first, with hints for the rest): approve the agent, ring the ghungroo, light every pumpkin, meet the husky, ring the trolley bell, honk a taxi, take a chai break, find the message in a bottle in the hub's sea, light the lamp, and the Konami code (the camera does a barrel roll).

**Cards:** numbers in bullets are set bold with a marker underline, so a skim finds 98%, 15+, 5TB. Facts (GPA, grant, placing) are yellow badges. On phones the bullets fold behind "What I did". A rail on the right (dots on a dashed path) shows where you are in the world. Phones get a segmented strip under the nav.

**Performance:** each scene is its own chunk, so the hub never downloads a world. Pieces mount one per idle slice, shaders compile with `compileAsync`, and the canvas only draws once a scene is built. Repeated shapes are instanced. No scene adds lights after load, because adding a light recompiles every material.

The v4 and v2 sections below are kept for the record. The content rules, truth ledger and copy constraints in them still apply.

## v4 "Playable world" (Oct 2026), superseded

**Why:** v1 to v3 were all text-led pages with effects on top. The feedback on each was the same: too much text, type too small next to the name, colours and fonts that looked generated, nothing to actually see. v4 drops the page metaphor.

**Direction:** a toon-shaded island in three.js (react-three-fiber). Scrolling walks a camera around a circular path. Each of the nine stops is a small working model of one piece of her work, with one big card beside it.

- **The path is a margam.** The ring is the tala circle. Each stop is lit in its recital part's colour as you pass it, and the last stop pulls up to a top-down view of the whole coloured ring: "You just watched a margam."
- **Dashed = draft, solid = verified** survives in 3D. The Nokia robot's tests are wireframe until the visitor presses APPROVE, the "your team" ring is dashed, and the drone's scan boxes mark what has been checked.
- **Text budget:** one headline and one stat line per stop, in Dela Gothic One at display size. Everything else is on /skim and /resume.
- **Every model is the claim, as a toy.** Drone sweeps crop rows and flags sick leaves. 15 packets fly from Azure to GCP. Papers go through an LLM arch at 60% and come out at 98%. Hackathon booth with the real Bitgig screen and a 2nd-place trophy. Ghungroo bells you can ring.

| Stop | Margam colour | Model | Interaction |
|---|---|---|---|
| Welcome | Alarippu | Gate with her name | none |
| Toolkit | Jatiswaram | Nine stacked skill blocks | Click a block, it hops |
| Drone | Shabdam | Crop rows, drone, scan cone | Ambient |
| MSCI | Shabdam | Azure cloud to GCP cloud, packets, racks | Ambient |
| NSI | Shabdam | Conveyor through an LLM arch, 60% and 98% boards | Ambient |
| Nokia | Varnam | Robot, wireframe tests, APPROVE pedestal | APPROVE (3D or card button) |
| Side quests | Varnam | Booth with the Bitgig screen, trophy | Click the screen, opens the demo |
| Off-stage | Padam | Stage, dance photo, string of bells | Ring the bells (3D or card button) |
| Your team | Tillana | Empty plinth, dashed ring, "?" | Click, opens email |
| Outro | Mangalam | Top-down view of the lit ring | Legend in the card |

**Look:** warm sky gradient, teal sea, sand, clay. Toon material with a 3-step ramp and ink outlines (drei Outlines). Cards are cream with a 3px ink border and a hard offset shadow, so the HTML layer matches the outlined 3D.

**Performance:** the HTML (cards, nav) is server-rendered and is the LCP. A WebP poster of the opening shot sits behind it. The world loads on idle. Stations mount one per idle slice, shaders compile with `compileAsync`, and only then does the canvas draw and fade in over the poster. Trees, rocks and crops are instanced (about 440 draw calls down to about 225). Phones get a 1024 shadow map. Textures go through the Next image optimizer. Lighthouse, production build: desktop 97 to 100 performance, mobile 72 to 74 (Lighthouse renders WebGL in software on a 4x-throttled CPU), 100 on accessibility, best practices and SEO.

**Reduced motion:** the canvas switches to render-on-demand. Nothing moves by itself, the camera jumps between stops, and cards do not spring. The world also stops drawing when the tab is hidden.

**Dev view:** `/lab?p=N` frames stop N with no cards (404 in production).

The sections below describe v2 and earlier and are kept for the record. The content rules, truth ledger and copy constraints in them still apply.

## v2 redesign (Oct 2026), superseded

**Why:** v1 read like a writer's portfolio: serif editorial type, long prose in every section, and effects laid over content (the Bitgig dither covered the demo it was meant to show). Feedback: too much text, not tech enough, React Bits used for decoration.

**Direction: "Harshita, as a running system."**
- Dark-first instrument-panel look (light theme kept). Geist + Geist Mono, a fine grid, bordered panels. Kumkum red is the single accent.
- The one visual rule stays: **dashed = draft, solid = verified.** It now drives the hero console border, the experience graph (current role dashed), the Bitgig pipeline and the margam ring.
- **Text budget:** about 25 visible words per section. Every role and project is one line plus metric chips. Full bullets live behind "Details" / "What I built", and in full on /resume and /skim.
- **Every effect must do a job.** If it hides or delays content, it is cut.

**Page:** Hero (with the agent console and a metrics strip) → Experience → Projects → Stack → Off the clock (with the margam reveal) → Contact → Footer.

| Where | React Bits | Job |
|---|---|---|
| Hero name | Tech Text | Hover shows the letters' construction lines: the engineering under the surface |
| Hero background | Cursor Grid | The instrument grid lights up under the cursor (desktop only, off under reduced motion) |
| Hero console | Status Mark, Call Chip, Lattice Loader, Hold Button | An agent run in the shape of her Nokia work: ground, recall, stage, verify. It stops at the review gate and the visitor holds to approve. The visitor is the human in the loop |
| Metrics strip | Counter, Warm Tooltip | Six numbers roll in when seen. Hover or focus any of them for the one-line story |
| Section labels | Decrypted Text | Mono labels decode once on view. Short, readable instantly after |
| Experience | Rubber Segment (NSI), sticky proof panel | Hover or scroll a role and its proof appears beside it: NSI before/after, MSCI migration arc, the agent pipeline, edge detection |
| Bitgig | Refine Frame, Status Mark | The screenshot plays raw → Gemini draft → expert review → verified once, in step with the 5-stage pipeline. Then it stays clear and readable |
| Hackathons | Tear Ticket | Events as tickets |
| Stack | Warm Tooltip | Every tool chip answers "where did you use it?" |
| Off the clock | Pixel Swap | Headshot ↔ performance photo |
| Margam reveal | Stroke Text + self-drawing ring | The ring draws as you scroll and lights each recital part. The last two stay dashed until you reach Contact and the footer |
| Contact | Click Spark, Electric Logo | Copy confirmation, and the monogram finale |
| Nav | Rubber Segment, Bell Toggle, Line Sidebar, Branched Menu | Story/Skim, ghungroo theme toggle, wide-screen index, mobile menu |

**Cut in v2:** Dither Veil and Halftone Reveal (they covered content), Text Loop quote, page line, Flip Cards (a lot of text per card), Folder, True Focus, Circular Carousel, Shiny Text, Count Up (replaced by Counter), Stepper (replaced by the console), and the long-form Story section.

**Performance:** Counter mounts only when the strip is on screen (about 30 animated elements per number). Entrances are transform-only, so contrast holds at every frame. Brand icons are extracted into a 33KB generated file (scripts/gen-icons.mjs) rather than bundling simple-icons.

---

# v1 design doc (superseded, kept for history)


Status: **Phase 1 draft, awaiting review.** Nothing is built yet.
Research snapshot: React Bits `main` at commit `e1bbb69` (30 Sep 2026), 213 free components across 5 categories, all reviewed (source read, 30 live demos captured in a real browser).

---

## 1. Concept

**One sentence:** an editorially typeset feature about an engineer who takes unproven things and makes them trustworthy, structured in secret like a Bharatanatyam recital.

**The visual rule that makes it hers:** *dashed is a draft, solid is verified.*

I found this while researching. Her own Bitgig demo already draws Gemini's drafts as dashed outlines and expert labels as solid ones. React Bits' new Tech Text reveals dashed construction lines under a typeface, and Status Mark morphs a dashed ring into a solid check. So the site uses one grammar everywhere:

| Where | Dashed (draft, unproven) | Solid (verified, shipped) |
|---|---|---|
| The page line | The path ahead of you | The path you have already scrolled through |
| Hero name | The construction lines under each letter, shown on hover | The finished letterforms |
| Nokia agent | Each stage before it runs | Each stage after its check passes |
| Bitgig | Gemini's draft segments | Expert-verified labels |
| Margam map | Recital parts still ahead | Parts you have already watched |

That is her through-line drawn literally, and the dancer's line in the same stroke. No recruiter needs to decode it, it just feels coherent. A designer or engineer who notices it will remember her.

**The recital skeleton** (hidden, revealed once in Off-stage):

| Margam | Section | Recruiter-facing heading |
|---|---|---|
| Alarippu | Hero | (name) |
| Jatiswaram | Proof in numbers | Proof |
| Shabdam | Story + principle | How I work |
| Varnam | Work, Education, Projects, Research | Work / Education / Projects |
| Padam | Off-stage + Toolkit tail | Off-stage |
| Tillana | Contact | Contact |
| Mangalam | Footer | (footer) |

Toolkit sits at the end of Varnam (technique in service of the centerpiece), right before Padam.

---

## 2. Things I verified during research

| Item | Result |
|---|---|
| IEEE `10668319` | **"Enhanced Detection of Maize Leaf Blight in Dynamic Field Conditions Using Modified YOLOv9"**, IEEE SPACE 2024. Authors: Gharat, Jogi, Gode, Talele, Kulkarni, Kolekar. Verified via Crossref DOI `10.1109/SPACE63117.2024.10668319`. |
| IEEE `10667804` | **"Multi-Stage UAV-Based System for Scalable and Accurate Crop Health Monitoring"**, IEEE SPACE 2024. Harshita is 3rd of 8 authors. Verified via Crossref DOI `10.1109/SPACE63117.2024.10667804`. |
| Title mismatch | The official titles are longer than the brief's short titles. I plan to show the **official titles** (see Q2). |
| Bitgig live demo | Up (HTTP 200), titled "BITGIG \| Expert annotation for lab & medical data". Its hero says "Gemini drafts. Experts decide." I can screenshot it for the project image. |
| Headshot | Found a professional headshot at `../kross-master/images/about/Harshita_Photo.jpg` (4000×6016). Plan to use it (see Q10). |
| React Bits Pro | Not used. Free library only, until you confirm (Q4). |

---

## 3. Information architecture

Reading budget: **6 seconds** (first viewport), **30 seconds** (Proof + Work headers), **3 minutes** (everything).

```
NAV        HJ monogram · Story | Skim · theme · ⌘K               (mobile: bottom bar Resume · Email · Index)
INDEX      desktop-only hairline rail on the left edge (Line Sidebar)

1 HERO     [?for=Company greeting]
           kicker: SOFTWARE ENGINEER / AI AND DATA SYSTEMS
           Harshita Jogi                                   (Tech Text on desktop pointer)
           I make AI and data systems reliable enough to ship.
           My work spans [LLM agents ↻]
           Now: SWE Co-op, Nokia, Sunnyvale · MS CS, Northeastern
           ✦ Open to full-time roles starting 2027         (Shiny Text)
           (Resume ↓)  harshitajogi2001@gmail.com           circle photo (Pixel Swap → dance)
           the line starts here, drawn from the photo's circle

2 PROOF    six numbers, huge serif, hairline-separated, mono source labels. Count Up.
3 STORY    the narrative paragraph resolving muted → ink (Scroll Reveal, adapted)
           Build. Verify. Ship.                             (True Focus)
4 WORK     the line runs down the left, one circle per role, reverse chronological
           Nokia ............ Stepper of the agent design with Status Mark stages
           NSI .............. Before / After error analysis, 60% → 98%
           MSCI ............. 15+ dots travel an arc from Azure to GCP on scroll
           IIT Patna ........ quiet, links forward to the drone project
5 EDUCATION Northeastern (3.9/4.0, awards, coursework) · Mumbai (9.04/10)
6 PROJECTS Bitgig (lead): Dither Veil footage + pipeline diagram + live demo
           Drone research: Halftone Reveal aerial photo, $25,000 IEEE AESS grant,
             Folder → 2 IEEE papers + patent filed
           Event Scheduler: compact, typographic
           Hackathons: two Tear Tickets (Berkeley × DeepMind, Harvard Hack-o-Ween 2nd)
7 TOOLKIT  Flip Cards fanned along an arc: skill group front, where used back
8 OFF-STAGE dance, Kovida degree, Trinity distinction
           quote rides the page line (Text Loop)
           THE REVEAL: "If you scrolled this far, you just watched a margam." + tala-circle map
9 CONTACT  huge email (copy + Click Spark), LinkedIn, GitHub, Resume, Electric Logo monogram
10 FOOTER  built-with note, repo link, last updated. The line closes its circle.
```

**What a recruiter gets in the first viewport (1440×900 and 375×812):** name, "software engineer, AI and data systems", Nokia + Northeastern + Sunnyvale, "open to full-time 2027", Resume button, email, a face. The line drawing downward is the reason to scroll.

---

## 4. Palette

All pairs measured (WCAG 2.x relative luminance).

| Token | Light | Dark | Use | Contrast |
|---|---|---|---|---|
| `--paper` | `#F6F1E7` warm ivory | `#0F0D0B` warm near-black | background | |
| `--ink` | `#16130F` | `#F2EBDD` | primary text | 16.5:1 / 16.4:1 |
| `--muted` | `#625B51` | `#A39A8C` | secondary text, captions | 6.0:1 / 7.0:1 |
| `--hairline` | `#E3DACB` | `#2A2520` | rules (non-text) | decorative |
| `--rule-strong` | `#C9BBA3` | `#3A332C` | dashed line, circles | decorative |
| `--accent` kumkum | `#9E2A2B` | `#E0625D` | links, rotating words, active line | 6.6:1 / 5.6:1, AA for all sizes |
| `--gold` | `#9A7B3F` | `#C9A55C` | tiny ornaments only. **Never text on light** (3.5:1) | non-text ≥3:1 |

I darkened the brief's muted `#6B645A` (5.2:1) to `#625B51` (6.0:1) because muted text carries real content here (dates, captions). A static, very faint paper grain (inline SVG noise, about 3% opacity, not animated) sits under everything in both themes.

---

## 5. Typography

| Role | Font | Why |
|---|---|---|
| Display | **Instrument Serif** (400 + italic) | Condensed, high-contrast, editorial. It looks like a magazine cover at 180px and stays elegant at 40px. Italic is used for the accent words. |
| Text | **Geist** (variable) | Clean grotesk with good figures, tuned for screens, not Inter. |
| Mono | **Geist Mono** | Kickers, dates, source labels, ⌘K. Same skeleton as Geist so they sit together. |

All three are self-hosted through `next/font` with Latin subsets, `display: swap`, and size-adjusted fallbacks so swapping causes no layout shift.

**Fluid scale**

| Token | Size | Leading / tracking |
|---|---|---|
| `name` | `clamp(4rem, 12vw, 11.25rem)` (64 to 180px) | 0.88 / -0.02em |
| `title` (section) | `clamp(2.75rem, 6vw, 5.5rem)` | 0.95 / -0.015em |
| `stat` (proof numbers) | `clamp(3.5rem, 8vw, 7.5rem)`, tabular | 0.9 |
| `company` | `clamp(2.25rem, 4.5vw, 4rem)` | 1.0 |
| `lead` | `clamp(1.375rem, 1.1rem + 1vw, 1.75rem)` | 1.35 |
| `body` | `clamp(1.0625rem, 0.95rem + 0.45vw, 1.25rem)`, 17 to 20px | 1.6 |
| `label` (mono) | `0.8125rem`, uppercase, +0.08em | 1.4 |

Measure: prose capped at `64ch`. No body text below 17px anywhere.

---

## 6. Motion principles

1. **Choreography, one idea per moment.** In any viewport, at most one thing moves on its own. Everything else waits for you.
2. **Content is never hostage.** All text is in the DOM and readable at first paint. The hero animates nothing but the line. Entrances below the fold animate `transform` plus opacity from 0.6, never from invisible, so a slow device still shows the words.
3. **Shared tokens** (`src/lib/motion.ts`):
   - `settle` `cubic-bezier(0.22, 1, 0.36, 1)` for entrances
   - `glide` `cubic-bezier(0.65, 0, 0.35, 1)` for scroll-linked and state changes
   - durations: `micro 160ms`, `enter 560ms`, `draw 800ms`, `count 1400ms`; stagger 60ms; travel 16px
   - No springs on text. Springs only on physical objects you touch (flip card, ticket, toggles).
4. **Reduced motion:** the page line renders fully drawn and solid. Count Up shows final values. Rotating Text shows a static, comma-separated list. Text Loop is static on its path. WebGL pieces show still images. Fades only, max 200ms.
5. **Off-screen means paused.** Every rAF loop is IntersectionObserver-gated. Only one WebGL context exists at a time, mounted within 200px of the viewport and destroyed when it leaves.
6. **No preloader, no scroll-jacking, no smooth-scroll library.** Native scroll only.
7. **At most one cursor effect: none.** Tech Text already makes the hero respond to the cursor. The native cursor is never hidden.

---

## 7. Component map (section → component → why)

★ = new in React Bits within the last ~2 months.

| Section | Component | Story / UX reason |
|---|---|---|
| Nav | Static SVG monogram (custom) | The always-visible mark must cost zero JS. See Electric Logo below. |
| Nav | **Rubber Segment** ★ | Story / Skim switch. A two-state segmented control is its exact job, and the stretchy thumb is a tactile moment without decoration. |
| Nav | **Bell Toggle** ★ | Theme toggle with a custom ghungroo (ankle-bell cluster) icon replacing the stock bell. It rings once on press. Ships only if it stays elegant, otherwise a plain icon button. |
| Index (desktop) | **Line Sidebar** ★ | Hairline ticks with mono labels, proximity shift. It's an editorial table of contents instead of a pill nav, and it echoes the line motif. |
| Index (desktop) | **Warm Tooltip** ★ | After you reach the margam reveal, the index unlocks margam names as tooltips (the brief's "mono label on hover", but earned). |
| Mobile menu | **Branched Menu** ★ | A trunk with curved branches is the page line again. Sections are the trunk, roles and projects are branches. |
| Hero | **Tech Text** ★ | Her name at 180px. Hover shows dashed construction outlines and glyph metrics under each letter: the invisible craft under the effortless surface, which is her quote acted out. Desktop fine pointers only. The real `<h1>` paints first (LCP), and the canvas crossfades over it once fonts are ready. |
| Hero | **Rotating Text** | "My work spans [LLM agents / biomedical NLP pipelines / cloud migrations / test automation / edge ML]". Five true nouns, kumkum italic. |
| Hero | **Shiny Text** | "Open to full-time roles starting 2027". One slow sheen every 6s, AA contrast at every frame. |
| Hero | **Pixel Swap** ★ (replaces Pixel Transition) | Circular headshot dissolves into a performance photo on hover, focus or tap. Two sides of one person. Newer than Pixel Transition: reversible, controllable, and it has a reduced-motion path. |
| Hero, Contact | **Magnet** | Resume circle button and contact links lean toward the cursor. Low strength, desktop only. |
| Proof | **Count Up** | The six numbers. Counts once on entry, final value in the DOM from the start (`aria-label`). |
| Story | **Scroll Reveal** (adapted) | Prose resolves as you read it. I'm changing it from opacity and blur to a **muted → ink colour interpolation** so every word passes AA at every scroll position. That removes the GSAP dependency too. |
| Story | **True Focus** | "Build. Verify. Ship." The focus frame steps word to word. Blur reduced to 1.5px so unfocused words stay legible, with kumkum corner brackets. |
| Work · Nokia | **Stepper** (restyled) | Walks through the agent's design: ground in docs → check the failure checklist → staged, dependency-ordered runs → false-pass checks → human review gate. Ends at the human, deliberately. |
| Work · Nokia | **Status Mark** ★ | Stepper indicators: a dashed ring (draft) becomes a solid check (verified). The visual rule, made functional. |
| Work · Nokia | **Call Chip** ★ | In step 1 only: a generic "tool call · documentation" chip. **Timer off** so no invented latency is shown. No internal names. |
| Work · NSI | Rubber Segment + Count Up | Before / After switch: "First prompt: 60%" → "After error analysis: 98%". A 50-mark strip (each mark = 2%) shows 30 vs 49 marks correct. That's the exact ratio, labelled as an illustration. |
| Work · MSCI | Custom SVG (no React Bits) | 15 small circles travel an arc from "Azure" to "GCP" as you scroll, then "−23% latency · −40% infra cost" settles under it. The arc is the motif, and the dots are the real count. |
| Projects · Bitgig | **Dither Veil** ★ | A still from her live demo is printed as a 1-bit dither. Your cursor (or an auto-wander on touch) resolves it to full clarity. "AI drafts, experts correct" made tactile. |
| Projects · Bitgig | Status Mark + custom pipeline | Pipeline: Upload → Gemini drafts SOP steps → experts correct → consensus QC → verified labels. Each stage goes dashed to solid. No metrics, no algorithm details. |
| Projects · Bitgig | **Refine Frame** ★ (fallback) | No-WebGL fallback for Dither Veil on low-power devices. Its stages relabelled: Raw footage / Gemini draft / Expert review / Verified. |
| Projects · Drone | **Halftone Reveal** ★ | An aerial crop photo as print halftone that sharpens around the cursor, the way her drone resolved leaves from 15m. Static photo until you supply one. |
| Projects · Research | **Folder** | Opens to reveal two IEEE papers and "Patent filed". Paired with a real, linked text list, because the folder's paper slips are too small for titles. |
| Projects · Hackathons | **Tear Ticket** ★ | Hackathons are events, so each one is a ticket: Berkeley × DeepMind (Bitgig, Sep 2026) and Harvard Hack-o-Ween (TryBud, 2nd place, $3,600). Tear the stub and it's stamped. A contained shape that earns its place because a ticket is a real object. |
| Toolkit | **Flip Card** ★ | Six cards fanned along a shallow arc, not a grid. The front is a skill group, the back is "where I used it", citing roles and projects from the brief only. Both faces are in the DOM for screen readers. |
| Off-stage | **Text Loop** (replaces Curved Loop) | The quote rides a custom SVG path that **is** the page line making one loop. It's newer than Curved Loop, takes arbitrary paths, and has built-in reduced motion. |
| Off-stage | **Stroke Text** | "you just watched a margam." draws its outlines on, then fills: a line becoming a performance. Fires once. |
| Off-stage | Custom tala-circle map | Seven points on a circle, each named with its margam part and site section. Already-seen parts are solid, and clicking one scrolls there. Keyboard and screen-reader friendly (it's a list styled as a circle). |
| Off-stage (conditional) | **Circular Carousel** ★ | Only if you have 5+ performance photos (Q9). A ring of photos is the tala cycle. Otherwise cut. |
| Contact | **Electric Logo** ★ | The HJ monogram, large, alive with kumkum current. Tillana is the joyful finale, so this is where the energy goes. **Not in the nav** (see departures). |
| Contact | **Click Spark** | Tiny kumkum spark when you copy the email, plus "Copied" in an `aria-live` region. |
| Global | **Gradual Blur** | A soft blur band at the bottom viewport edge only, desktop only. Mobile gets a cheap CSS gradient mask. |
| 404 | **Fuzzy Text** | "404" vibrates gently. "This page stepped off stage." |

That's 27 React Bits components in use, plus 1 conditional (Circular Carousel) and 1 fallback (Refine Frame).

### Departures from your starting map (and why)

| Your suggestion | My call | Reason |
|---|---|---|
| Electric Logo in nav | **Contact section** | It's 1,087 lines of WebGL. Always mounted in a sticky nav, it would be a permanent second GL context (breaks "one canvas at a time") and burn battery on every phone for a 32px mark. As the finale it's seen big, once, by choice. |
| Variable Proximity / Text Pressure for name | **Tech Text** | Proximity is "the name responds to you". Tech Text is "look underneath and see the engineering", which is her quote. Stronger story, and it's new. |
| Tech Text for section kickers | Plain mono kickers | Tech Text is a large-wordmark effect (live demo confirmed). At 13px it would be invisible and expensive. |
| Pill Nav or Dock | **Line Sidebar** | Pills are the rounded rectangles we're avoiding. Dock is a macOS cliché. Pill Nav also hard-depends on react-router. |
| Staggered Menu (mobile) | **Branched Menu** | Its trunk and branches carry the line motif. Staggered Menu is a full-screen panel slide, seen everywhere. |
| Dot Grid / Silk / Light Rays hero bg | **None.** Paper grain + the line | Any WebGL above the fold costs LCP and competes with 180px type. Glow effects look wrong on ivory paper. |
| Scroll Float / Split Text titles | Motion line-rise (about 40 lines) | Both pull in GSAP. A masked line rise in Motion matches the rest of the site's engine. |
| Decrypted Text | **Rejected** | Hacker-terminal glyph scrambling clashes with the editorial tone. Dither Veil says "noise resolving to clarity" in a print idiom that fits. |
| Elastic Slider for NSI | **Before/After switch** | A slider implies the reader picks the accuracy, and intermediate values (say "79%") would be invented numbers. |
| Shredder for NSI false positives | **Rejected** | Shredding implies her method was deleting wrong annotations. It was analysing them to fix the prompt. The metaphor would misstate her work. |
| Logo Loop for MSCI | **Custom arc migration** | A logo marquee is a portfolio cliché and says "I know these tools". 15 dots crossing from Azure to GCP says "I moved 15+ APIs". Stack names still appear as mono text. |
| Circular / Flex Carousel for projects | **Editorial stacked features** | Carousels hide 3 of 4 projects from a 6-second reader, and the projects are text-first. Circular Carousel moves to dance photos, where a ring means something. |
| Model Viewer drone | **Rejected unless** you have a model of *your* drone | A generic licensed drone isn't her drone, and three.js + drei is about 150KB+ gzipped for one ornament. |
| Pixel Transition / Tilted Card photo | **Pixel Swap** | Same idea, newer, reversible, keyboard and reduced-motion aware. |
| Curved Loop | **Text Loop** | Custom path support lets the quote ride the page line itself. |
| Star Border CTA | **Circle button + Magnet** | An orbiting sparkle on a pill is generic. A circle is the motif. |
| Animated Content / Fade Content | Motion `<Reveal>` primitive | Both are GSAP + ScrollTrigger. The site is Motion-first (brief: GSAP only where a React Bits component *requires* it). |
| Letter Glitch 404 | **Fuzzy Text** | Glitch is noise. Fuzzy Text is a gentle "off stage" blur. |

GSAP ends up loading only for **Text Loop**, lazily, when Off-stage nears. `ogl` loads only for Dither Veil, Halftone Reveal and Electric Logo, each lazy and never at the same time.

---

## 8. The extra touches

| Touch | Design |
|---|---|
| **Skim mode** | `Story | Skim` in the nav, mirrored in the URL as `?view=skim` so it's shareable. Skim swaps the main column for a single-screen, dense, printable summary: header, availability, roles (company, title, dates, one line), education, projects, publications, skills, links, Resume button. Both views render from the same `profile.ts`. |
| **Tracks** | `?track=ai\|data\|swe\|systems` reorders the Proof numbers, the Rotating Text order, and the project order. To stay static (Lighthouse), each track is **pre-rendered** at `/t/[track]` via `generateStaticParams`, and middleware rewrites `/?track=ai` to it. No client reshuffle, no flash, no layout shift. |
| **`?for=Company`** | Whitelist `[A-Za-z0-9 .&'-]`, trim, cap at 40 chars, render as a plain text node in a reserved-height slot above the kicker: "Hello, Stripe team." Nothing else changes, and no claims about the company are made. |
| **⌘K / Ctrl+K** | `cmdk` (accessible, about 6KB): jump to sections, copy email, download resume, open GitHub / LinkedIn, toggle theme, toggle Skim. Discoverable via a mono `⌘K` hint in the nav. |
| **Console note** | Short and warm, with the source link (draft in §11). |
| **`/resume`** | Clean, printable HTML (print stylesheet: ink on white, no motion, links shown as URLs) plus a download of `/Harshita_Jogi_Resume.pdf`. |
| **Footer** | "Designed and built by Harshita in Next.js and TypeScript." Repo link and last-updated date (from build time). |
| **Mobile bottom bar** | `Resume · Email · Index`, thumb-reachable. Appears after the hero scrolls out. |

---

## 9. Mobile plan (designed, not shrunk)

- **375px hero:** kicker, name on two lines (`Harshita` / `Jogi`) at 64px, hero line, availability, then a row with the circle photo (96px) and two CTAs. Everything in the first 812px.
- **No hover-dependent content.** Tech Text is off on touch, so the plain `<h1>` stays. Pixel Swap toggles on tap with a visible "Tap for off-stage" caption. Dither Veil and Halftone Reveal use their auto-wander or idle reveal.
- **The line** moves to a 24px left gutter, mostly straight, arcing at section changes. Role circles sit on it.
- **Work:** the sticky left column collapses into an inline header per role. The Stepper goes full-width with large tap targets (min 44px).
- **Flip Cards:** a horizontal scroll-snap row (one and a quarter cards visible as an affordance), not a fan.
- **Tear Tickets:** stacked, scaled to width, drag-to-tear works with touch, and a "Tear" button exists for keyboard and switch users.
- **Gradual Blur** replaced by a CSS mask (blur is expensive on mobile GPUs).
- **Tested at** 375, 768, 1440, 1920.

---

## 10. Accessibility plan

- Semantic landmarks: `header`, `nav`, `main`, `section[aria-labelledby]`, `footer`. One `h1`, then a logical `h2`/`h3` order.
- Every animated text component keeps real text in the DOM (`sr-only` or `aria-label`). I'll audit each one, since several React Bits components put `aria-hidden` on character spans.
- Everything keyboard-operable: Stepper, Before/After, Folder, Flip Cards (Enter/Space), Tear Ticket (button alternative), margam map, ⌘K. Visible focus: a 2px kumkum outline with 3px offset in both themes.
- Skip link to main content.
- Canvas components get `role="img"` with a meaningful `aria-label`, or are `aria-hidden` when decorative with text equivalents nearby.
- Colour is never the only signal: dashed vs solid carries the draft/verified meaning, not colour.
- `prefers-reduced-motion` honoured everywhere (§6). `prefers-color-scheme` sets the default theme, the toggle overrides it, and there's no theme flash (inline script via `next-themes`).

---

## 11. Copy draft (her voice, for approval)

Rules applied: no em dashes, no semicolons, no exclamation marks, no buzzwords. Every number traces to the brief.

**Hero**
- Kicker: `SOFTWARE ENGINEER / AI AND DATA SYSTEMS`
- Line (recommended): **"I make AI and data systems reliable enough to ship."**
  - Alt A: "Software engineer. I build AI and data systems you can trust."
  - Alt B: "I take AI and data systems from promising to proven."
- Rotating: "My work spans *LLM agents* / *biomedical NLP pipelines* / *cloud migrations* / *test automation* / *edge ML*."
  - I avoided "I built test frameworks" because she *extended* one.
- Status: "Now: Software Engineer Co-op at Nokia, Sunnyvale. MS in Computer Science at Northeastern, graduating May 2027."
- Availability: "Open to full-time roles starting 2027"
- CTAs: "Resume" · "harshitajogi2001@gmail.com"

**Proof** (default order, reordered per track)

| Number | Caption | Source label |
|---|---|---|
| 60% → 98% | LLM annotation accuracy, after studying every false positive and false negative against ground truth | Network Science Institute |
| 1M+ | Biomedical research papers in the GPT-4.1 annotation pipeline I created | Network Science Institute |
| 40% | Lower infrastructure cost after migrating 15+ APIs from Azure to GCP | MSCI |
| 5TB | Data moved from OracleDB to BigQuery through Databricks ETL pipelines | MSCI |
| 97% F1 | SciBERT fine-tuned to extract research tools from biomedical text | Network Science Institute |
| $25,000 | IEEE AESS research grant for the drone project I led | IEEE AESS DSTEI |

**Story** (your draft, two words tightened)
> I started in electronics, building a drone that could spot crop disease from fifteen meters up. Then I moved into software at MSCI, taking production APIs and terabytes of financial data to the cloud. At Northeastern I used LLMs to annotate over a million research papers, and learned that accuracy comes from studying every mistake. Now at Nokia I build LLM agents that do real engineering work, and the checks that make them safe to trust.

Principle: **Build. Verify. Ship.**

**Role one-liners**
- Nokia: "Building AI that does real engineering work, and the guardrails that make it trustworthy."
- NSI: "Accuracy came from studying every mistake."
- MSCI: "Moving production systems across clouds, with tests and security scans guarding every release."
- IIT Patna: "Where the research thread started. Better detection, small enough to run at the edge."

**Off-stage**
> I am a trained Bharatanatyam dancer, with a Kovida degree from Nalanda Dance Research Center. Dance taught me that the hard work stays invisible. What reaches people feels effortless. I try to build software the same way.
>
> I also care about saying things clearly. I hold Trinity College London's Communication Skills Grade 5, with Distinction.

Reveal: **"If you scrolled this far, you just watched a margam."**
Sub: "A Bharatanatyam recital follows a fixed order, from invocation to blessing. This page does too."

**Contact**
- Title: "Let's make it right." (echoes the hero headline. Changed from "Say hello.", which failed the generic test)
- Line: "I am looking for full-time roles starting in 2027. If your team builds AI or data systems that have to hold up, I would like to hear from you."

**Footer:** "Designed and built by Harshita in Next.js and TypeScript. Source on GitHub. Last updated {date}."

**404:** "This page stepped off stage." → "Back to the performance"

**Console**
```
Hi. You opened the console, so you are my kind of person.
This site is open source: github.com/HarshitaJogi/{repo}
If something looks broken, tell me: harshitajogi2001@gmail.com
Harshita
```

---

## 12. Truth ledger (every number, and where it lives)

| Number | Brief source | Used in |
|---|---|---|
| 50K+ line Python test framework | Nokia bullet 1 | Nokia bullets only (see Q7) |
| 1M+ papers | NSI | Proof, NSI |
| 60% → 98% | NSI | Proof, NSI switch |
| 97% F1 | NSI | Proof, NSI |
| 15+ APIs, 23% latency, 40% cost | MSCI | Proof, MSCI arc |
| 82% test coverage | MSCI | MSCI bullets |
| 5TB | MSCI | Proof, MSCI |
| 86% detection accuracy | IIT Patna | IIT Patna bullets |
| 15m altitude | Drone | Story, Drone |
| $25,000 | Drone grant | Proof, Drone |
| $3,600, 2nd place | TryBud | Ticket |
| 3.9/4.0, 9.04/10 | Education | Education, Skim |
| 18+ operations | Event Scheduler | Event Scheduler |
| 2 IEEE papers, 1 patent filed | Research | Folder |

Banned list enforced in content linting: a small script in CI greps `profile.ts` and built HTML for FastAPI, asyncio, RAG, vector database, TTS, Ansible, Tableau, Power BI, Rust, Node.js, "autonomous" near Nokia, YANG, EVPN, NETCONF, SR Linux, SR-OS, em dashes, semicolons in prose, and "!". The build fails on a hit.

---

## 13. Performance budget

| Metric | Budget |
|---|---|
| Lighthouse (mobile) | ≥ 95 on all four |
| LCP | < 2.0s on mobile (the `h1` text, painted with the preloaded display font) |
| CLS | < 0.02 (reserved slots for greeting, photo, canvases) |
| TBT | < 150ms |
| First-load JS on `/` | ≤ 130KB gzipped |
| Hero image | AVIF/WebP, ≤ 40KB at 2× for 220px circle, `priority` |
| WebGL | 0 above the fold. ≤ 1 live context. `ogl` chunk lazy |
| GSAP | lazy chunk for Text Loop only |
| Fonts | 3 families, Latin subset, preload display + text only |

**Low-power fallback:** if `prefers-reduced-motion`, `saveData`, `deviceMemory ≤ 4` or `hardwareConcurrency ≤ 4`, no WebGL mounts. Static images replace Dither Veil, Halftone Reveal and Electric Logo, and Refine Frame stands in for Bitgig.

---

## 14. Tech architecture

- Next.js (App Router, latest stable), TypeScript strict, Tailwind CSS v4, Motion. pnpm. Vercel.
- React Bits pulled with `npx shadcn@latest add @react-bits/<Name>-TS-TW` into `src/components/bits/`, then restyled to tokens. Hugeicons dependencies are swapped for local SVGs so that package isn't installed.

```
src/
  app/
    layout.tsx            fonts, theme, metadata, JSON-LD Person
    page.tsx              Story / Skim
    t/[track]/page.tsx    pre-rendered tracks (middleware rewrites ?track=)
    resume/page.tsx       printable resume
    not-found.tsx         Fuzzy Text 404
    opengraph-image.tsx   custom OG (ivory, serif name, kumkum circle)
    icon.tsx              HJ monogram favicon
    sitemap.ts  robots.ts
  content/profile.ts      ALL copy and data, typed
  components/
    bits/                 React Bits sources (restyled)
    sections/             Hero, Proof, Story, Work, Education, Projects, Toolkit, OffStage, Contact, Footer
    line/                 the page line (measures anchors, dashed base + solid scroll overlay)
    ui/                   Reveal, Kicker, CircleButton, CommandPalette, ThemeToggle, SkimView
  lib/  motion.ts  track.ts  sanitize.ts  device.ts
scripts/truth-lint.ts     banned-terms check
```

**The page line:** an absolutely positioned SVG spanning the document. Its path is computed from DOM anchor points (hero circle, each role node, the Off-stage loop, the footer) and re-measured with ResizeObserver. Two strokes: a faint dashed base, and a solid ink overlay whose length follows scroll progress. Drafted ahead, verified behind.

---

## 15. Assets checklist (placeholders will live in `/public`)

| File | Status |
|---|---|
| `headshot.jpg` | Found existing (Q10) |
| `dance.jpg` (performance photo for Pixel Swap) | **Needed** |
| `dance-2..n.jpg` (optional, for Circular Carousel) | Optional (Q9) |
| `bitgig.png` | Can capture from the live demo |
| `bitgig-hackathon.jpg`, `harvard-hackathon.jpg` | Optional |
| `drone.jpg` (aerial or the drone itself) | **Needed** for Halftone Reveal |
| `Harshita_Jogi_Resume.pdf` | **Needed** |

---

## 16. Open questions

1. **TryBud date:** October 2025 or October 2024?
2. **IEEE titles:** mapping verified (above). OK to show the full official titles rather than the short ones?
3. **Patent number:** show it, or keep "Patent filed"?
4. **React Bits Pro:** do you own it? (Plan assumes no.)
5. **Domain:** final domain? (Affects metadata, OG, sitemap, JSON-LD.)
6. **GitHub repos per project:** which to link? Note: Event Scheduler looks like a Northeastern course project, and many courses forbid public code. Link it only if that's allowed.
7. **"50K+ line" at Nokia:** it's in your bullets, but it's also a count of an internal artifact (Truth Rule 4). Keep it or drop it?
8. **Toolkit backs:** these skills have no "where used" in the brief: MCP, Prodigy, AWS, PostgreSQL, C++, Cursor, data modeling. Where did you use each? Without an answer they'll appear on the front only, with no claim on the back.
9. **Dance photos:** how many do you have, and is there a photographer to credit? (5+ unlocks the Circular Carousel ring.)
10. **Headshot:** use `kross-master/images/about/Harshita_Photo.jpg`?
11. **Hero line:** the recommended line, Alt A, Alt B, or your own?
12. **Bitgig:** OK to screenshot your live demo for the project image? Should teammates be credited? Any placement or prize? (None will be claimed unless you say so.)
13. **Electric Logo:** OK to move it from the nav to the Contact finale?
14. **Nokia framing:** is "Software Engineer Co-op, Test Automation & AI Tooling" the exact title you want public?

---

## Appendix A: React Bits inventory (all 213 free components)

Legend: ✅ chosen · ◐ conditional or fallback · ✕ rejected.

### Text Animations (33)

| Component | | Why |
|---|---|---|
| Tech Text ★ | ✅ | Hero name. Dashed construction lines under the letters = invisible craft. |
| Text Loop ★ | ✅ | Off-stage quote riding the page line's own path. |
| Masked Heading ★ | ✕ | Colour mesh inside glyphs is decoration and fights ink on paper. |
| Particle Text ★ | ✕ | Particles assembling text is the generic AI-portfolio look. |
| Split Flap Text ★ | ✕ | Considered as a "schedule board" for Event Scheduler. Reads as a gimmick and slows reading. |
| Warp Text ★ | ✕ | WebGL distortion of type hurts legibility. |
| Stroke Text ★ | ✅ | Margam reveal line draws its outline, then fills. |
| Depth Text ★ | ✕ | Extruded 3D type is off-tone for editorial. |
| Fold Text ★ | ✕ | The paper unfold is on-theme, but it's GSAP-only. Motion line-rise used instead. |
| Echo Text ★ | ✕ | Ghost copies add noise. |
| Split Text | ✕ | GSAP SplitText dependency. Replaced by a Motion primitive. |
| Blur Text | ✕ | Starts blurred, which breaks "readable instantly". |
| Circular Text | ✕ | Rotating circular badges are a portfolio cliché. The margam ring uses a static SVG textPath. |
| Text Type | ✕ | Typewriter delays content and is overused. |
| Shuffle | ✕ | Hacker-reveal family. Off-tone. |
| Shiny Text | ✅ | Availability line, slow and subtle. |
| Text Pressure | ✕ | Needs a compressed variable font and stretches the name. Tech Text tells her story better. |
| Curved Loop | ✕ | Superseded by Text Loop (custom paths, reduced motion). |
| Fuzzy Text | ✅ | 404 page. |
| Gradient Text | ✕ | Gradient type is the AI-portfolio signature. |
| Falling Text | ✕ | matter-js physics collapse is off-tone. |
| Text Cursor | ✕ | Cursor trail of copies. Noise. |
| Decrypted Text | ✕ | Hacker aesthetic. Dither Veil carries "noise to clarity" instead. |
| True Focus | ✅ | "Build. Verify. Ship." |
| Scroll Float | ✕ | GSAP, and floating is decorative. |
| Scroll Reveal | ✅ | Story paragraph, adapted to an AA-safe colour reveal. |
| ASCII Text | ✕ | three.js, retro tone. |
| Scrambled Text | ✕ | Hacker tone, GSAP plugins. |
| Rotating Text | ✅ | Hero "My work spans …". |
| Glitch Text | ✕ | Glitch is noise, the opposite of the message. |
| Scroll Velocity | ✕ | Velocity marquee is generic. |
| Variable Proximity | ✕ | Strong runner-up for the name. Kept as the fallback if Tech Text disappoints. |
| Count Up | ✅ | Proof numbers, NSI 60 → 98. |

### Animations (40)

| Component | | Why |
|---|---|---|
| Electric Logo ★ | ✅ | Contact finale monogram (not the nav, see departures). |
| Dither Veil ★ | ✅ | Bitgig: raw footage resolves to clarity. |
| Glow Cursor ★ | ✕ | Cursor effect. The site uses none. |
| Scroll Expand ★ | ✕ | Full-bleed media needs strong imagery we don't have. Revisit when the drone photo arrives. |
| Ripple Distortion ★ | ✕ | Decorative water warp. |
| Elastic Mesh ★ | ✕ | Decorative. |
| Swarm Cursor ★ | ✕ | Cursor effect. |
| Halftone Reveal ★ | ✅ | Drone aerial photo as print halftone. |
| Pixel Swap ★ | ✅ | Headshot ↔ dance photo. |
| Cursor Grid ★ | ✕ | Grid backgrounds read as SaaS. |
| Strands | ✕ | Glowing ribbons don't belong on paper. |
| Magic Rings | ✕ | three.js, and the rings are decorative rather than tala. |
| Orbit Images | ✕ | Orbiting logos is a cliché. |
| Antigravity | ✕ | three.js particle field. |
| Ghost Cursor | ✕ | Cursor effect. |
| Laser Flow | ✕ | Sci-fi glow. |
| Gradual Blur | ✅ | Bottom edge fade, desktop. |
| Electric Border | ✕ | Neon border. |
| Logo Loop | ✕ | Replaced by the MSCI arc migration (see departures). |
| Sticker Peel | ✕ | Considered for a "Patent filed" seal, too playful. |
| Target Cursor | ✕ | Cursor effect. |
| Cubes | ✕ | Decorative 3D. |
| Glare Hover | ✕ | Flip Card already has its own sheen. |
| Metallic Paint | ✕ | Chrome finish is off-palette. |
| MetaBalls | ✕ | Decorative. |
| Ribbons | ✕ | Cursor trail. |
| Pixel Trail | ✕ | Cursor trail, three.js. |
| Image Trail | ✕ | Cursor trail. |
| Shape Blur | ✕ | Decorative. |
| Pixel Transition | ✕ | Superseded by Pixel Swap. |
| Click Spark | ✅ | Copy-email confirmation. |
| Noise | ✕ | Animated grain costs frames. Static CSS grain instead. |
| Animated Content | ✕ | GSAP. Replaced by Motion `<Reveal>`. |
| Fade Content | ✕ | GSAP. Same as above. |
| Magnet Lines | ✕ | Decorative field. |
| Splash Cursor | ✕ | Overused (brief). |
| Star Border | ✕ | Sparkle pill. Circle CTA instead. |
| Crosshair | ✕ | Cursor effect. |
| Magnet | ✅ | CTAs and contact links. |
| Blob Cursor | ✕ | Cursor effect. |

### Backgrounds (59)

None used. The paper and the line are the background. Notes on the serious candidates:

| Component | | Why |
|---|---|---|
| Pattern Waves ★ | ✕ | Halftone surface is close to the print idiom, but a moving full-bleed texture competes with type. |
| Micro Slats ★ | ✕ | Rolling slats are beautiful, and too loud. |
| Shape Waves ★ | ✕ | WebGPU-only path (vgpu), not safe for iOS Safari. |
| Aero Shards ★ | ✕ | WebGPU, heavy. |
| Ghost Fibers ★ | ✕ | Deep-blue glow is off-palette. |
| CRT Warp ★ | ✕ | Retro CRT is off-tone. |
| Topography ★ | ✕ | Contours = geospatial crop mapping, a real fit for the drone. Cut because Halftone Reveal already owns that section's single GL budget. |
| Scanner ★ | ✕ | Oscilloscope bands. Tempting for electronics, but decorative. |
| Radar | ✕ | Drone-adjacent, but cliché. |
| Dot Grid / Dot Field | ✕ | Dot grids read as SaaS landing pages. |
| Silk | ✕ | Soft and nice on dark, muddy on ivory, and three.js. |
| Light Rays | ✕ | Glow is wrong on paper. |
| Letter Glitch | ✕ | Brief's 404 candidate. Fuzzy Text chosen. |
| Dither | ✕ | Dither Veil does the dither idea with meaning. |
| Particles, Hyperspeed, Ballpit | ✕ | On the overused list. |
| Molten Metal, Gradient Waves, Web Threads, Light Tunnel, Sliced Waves, Acid Squares, Lightfall, Ferrofluid, Side Rays, Plasma Wave, Line Waves, Evil Eye, Soft Aurora, Shape Grid, Grainient, Pixel Snow, Light Pillar, Floating Lines, Grid Scan, Color Bends, Liquid Ether, Pixel Blast, Prismatic Burst, Gradient Blinds, Prism, Plasma, Faulty Terminal, Galaxy, Dark Veil, Ripple Grid, Beams, Lightning, Threads, Balatro, Liquid Chrome, Orb, Aurora, Iridescence, Grid Distortion, Waves, Grid Motion | ✕ | Full-bleed decorative shaders. Every one competes with the type, adds a GL context, and none maps to a story beat. Grid Scan also pulls in face-api.js. |

### Components (47)

| Component | | Why |
|---|---|---|
| Circular Carousel ★ | ◐ | Dance photo ring (tala) if 5+ photos. |
| Flex Carousel ★ | ✕ | Image-led, and the projects are text-led. |
| Infinite Spiral ★ | ✕ | Decorative helix. |
| Depth Carousel ★ | ✕ | Carousels hide work from skimmers. |
| Accordion Gallery ★ | ✕ | Needs a photo set. |
| Morph Slider ★ | ✕ | WebGL image slider, no story beat. |
| Drift Wall ★ | ✕ | Tile wall = grid of rectangles. |
| Option Wheel ★ | ✕ | Considered as a track picker. Tracks are URL-driven by design. |
| Specular Button ★ | ✕ | Glass button is off-palette. |
| Curved Input ★ | ✕ | There are no inputs on the site. |
| Line Sidebar ★ | ✅ | Desktop section index. |
| Border Glow | ✕ | Glow borders. |
| Reflective Card | ✕ | Requests the webcam. Never on a portfolio. |
| Staggered Menu | ✕ | Branched Menu chosen for mobile. |
| Dome Gallery | ✕ | Immersive gallery, no content for it. |
| Bubble Menu | ✕ | Bubbly. Off-tone. |
| Card Nav | ✕ | Card panels = rectangles. |
| Pill Nav | ✕ | Pills, plus a react-router dependency. |
| Glass Surface | ✕ | Glassmorphism (brief). |
| Scroll Stack | ✕ | Card stack, plus Lenis scroll-jacking. |
| Magic Bento | ✕ | Overused (brief). |
| Fluid Glass | ✕ | Glassmorphism, three.js. |
| Model Viewer | ✕ | Only with a model of her actual drone (see departures). |
| Card Swap | ✕ | Cards. |
| Profile Card | ✕ | The holographic profile card is an AI-portfolio staple. |
| Chroma Grid | ✕ | Grid. |
| Gooey Nav | ✕ | Gooey blob is playful, off-tone. |
| Folder | ✅ | Publications + patent. |
| Animated List | ✕ | Generic stagger. Motion `<Reveal>` covers it. |
| Glass Icons | ✕ | Glassmorphism. |
| Counter | ✕ | Count Up is lighter for the same job. |
| Lanyard | ✕ | Overused (brief). |
| Carousel | ✕ | Generic. |
| Stepper | ✅ | Nokia agent design walkthrough. |
| Circular Gallery | ✕ | WebGL gallery, no image set. |
| Flowing Menu | ✕ | Nav handled by Line Sidebar. |
| Flying Posters | ✕ | Decorative. |
| Infinite Menu | ✕ | Decorative globe menu. |
| Tilted Card | ✕ | Pixel Swap chosen for the photo. |
| Pixel Card | ✕ | Card. |
| Bounce Cards | ✕ | Bouncy. Off-tone. |
| Decay Card | ✕ | Disintegrating content contradicts "trustworthy". |
| Elastic Slider | ✕ | Would imply the reader picks the accuracy (see departures). |
| Spotlight Card | ✕ | Card with a glow. |
| Dock | ✕ | macOS cliché. |
| Masonry | ✕ | Grid. |
| Stack | ✕ | Swipe stack of cards. |

### Micro (34, the whole set is new)

| Component | | Why |
|---|---|---|
| Shredder | ✕ | Would misstate her NSI method (analysis, not deletion). |
| Paper Crumple | ✕ | three.js, and crumpling = discarding. Wrong message. |
| Flip Card | ✅ | Toolkit: skill → where used. |
| Tear Ticket | ✅ | Hackathon tickets. |
| Squish Switch | ✕ | Bell Toggle carries the theme switch with meaning. |
| Hold Button | ✕ | Nothing on the site needs confirmation. |
| Peek Rating | ✕ | No ratings. |
| Spring Check | ✕ | No checklists. |
| Pulse Heart | ✕ | No likes. |
| Rubber Segment | ✅ | Story / Skim and NSI Before / After. |
| Slide Commit | ✕ | No commits to confirm. |
| Warm Tooltip | ✅ | Margam names on the index after the reveal. |
| Fuse Button | ✕ | No undo actions. |
| Scrub Field | ✕ | No numeric inputs. |
| Lattice Loader | ✕ | Its stopwatch would display invented durations. |
| Dodge Field | ✕ | Elements fleeing the cursor is a gimmick. |
| Code Slots | ✕ | No OTP. |
| Wake Slider | ✕ | Same issue as Elastic Slider. |
| Comet Dial | ✕ | No dial input. |
| Jelly Radio | ✕ | Rubber Segment covers selection. |
| Swipe Row | ✕ | No list actions. |
| Glide Select | ✕ | No selects. |
| Status Mark | ✅ | Dashed ring → solid check: the visual rule. Nokia + Bitgig stages. |
| Call Chip | ✅ | Nokia step 1, generic "tool call · documentation", timer off. |
| Bell Toggle | ✅ | Theme toggle as ghungroo. Elegance-gated. |
| Sling Button | ✕ | Gimmick. |
| Swipe Toast | ✕ | Inline "Copied" + Click Spark is quieter. |
| Prompt Bar | ✕ | Chat composer. Nothing to send. |
| Slosh Gauge | ✕ | Considered for 60 → 98, but liquid sloshing is cartoonish for a research result. |
| Voice Pill | ✕ | Microphone UI. |
| Thought Line | ✕ | "Thought for 4.2s" would invent timings and anthropomorphise the Nokia agent. |
| Refine Frame | ◐ | No-WebGL fallback for Bitgig. |
| Folder Float | ✕ | matter-js weight. Folder does the job. |
| Branched Menu | ✅ | Mobile menu with trunk-and-branch lines. |

## Appendix B: Craft references (principles, not looks)

These come from my familiarity with them, not a fresh browse in this session.

- **Stripe Press** for editorial pacing: one idea per screen, generous margins, type as the structure.
- **The Pudding / NYT scrollytelling** for scroll-linked diagrams that explain, never decorate. Basis for the MSCI arc and Bitgig pipeline.
- **rauno.me, paco.me** for restraint, keyboard-first details (⌘K) and tiny, exact motion.
- **Print magazine features** for kickers, hairline rules, pull-numbers and captions as the hierarchy, not boxes.

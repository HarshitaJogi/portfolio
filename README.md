# harshitajogi.com

Portfolio of Harshita Jogi. Next.js (App Router), TypeScript, Tailwind CSS v4, Motion, React Bits.
Design rationale lives in [DESIGN.md](DESIGN.md).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # truth lint → next build → truth lint on the rendered HTML
pnpm truth        # check copy in src/content/profile.ts against the brief's rules
```

## Editing content

Every word and number lives in [`src/content/profile.ts`](src/content/profile.ts). Components never hardcode copy.
`pnpm truth` fails on banned skills, internal jargon, "autonomous" near Nokia, em dashes, semicolons and exclamation marks.

## Replace before deploy

Photos are swappable without touching code: drop your file into `public/placeholders/` with the same name.
(Or move them to another folder and change `MEDIA_DIR` in `profile.ts`.)

| File | Now | Replace with |
|---|---|---|
| `public/placeholders/headshot.jpg` | Your headshot, from the old Kross site | Keep, or a newer professional headshot (portrait, face in the upper third) |
| `public/placeholders/dance-1.jpg` | Unsplash placeholder (SKG Photography) | **Your** Bharatanatyam photo. Used in the hero hover swap and the dance ring. Portrait, face centred |
| `public/placeholders/dance-2.jpg` | Unsplash placeholder (atelierbyvineeth) | Your performance photo |
| `public/placeholders/dance-3.jpg` | Unsplash placeholder (Jayanth Muppaneni) | Your performance photo |
| `public/placeholders/dance-4.jpg` | Unsplash placeholder (atelierbyvineeth) | Your performance photo |
| `public/placeholders/dance-5.jpg` | Unsplash placeholder (gio shravan) | Your performance photo |
| `public/placeholders/drone.jpg` | Unsplash placeholder (DRONE EFT) | Your drone, or its aerial imagery. Landscape, high contrast |
| `public/placeholders/bitgig.jpg` | Screenshot of the live Bitgig demo | Keep, or a better product shot |
| `public/Harshita_Jogi_Resume.pdf` | Generated from `/resume` as a stand-in | **Your real resume PDF**, same file name |

Placeholder photo credits and links are in `public/placeholders/CREDITS.json`. All are Unsplash License.
If any placeholder ships, credit is appreciated but not required by that license.

## Open items (TODO in `profile.ts`)

- `SITE_URL`: set `NEXT_PUBLIC_SITE_URL` in Vercel once the domain is final (harshitajogi.com vs .dev).
- `person.links.source`: the real URL of this repo once it is pushed (footer and console note use it).
- `bitgig.repo`, `bitgig.team`: Bitgig repo link and teammates, if any. Nothing is shown until set.
- `hackathons.tickets[1].href`: TryBud repo link, if any.
- Skills without a confirmed "where" sit in "Also familiar with": C++, SQL, JavaScript, PostgreSQL, AWS, Git.

## URL features

- `?view=skim` opens the one-screen summary. The Story/Skim switch in the nav sets it.
- `?track=ai|data|swe|systems` reorders the proof numbers and projects. Served from pre-rendered `/t/<track>` pages via `src/proxy.ts`.
- `?for=Company` shows "Hello, Company team." Whitelisted characters only, 40 characters max, plain text.
- `⌘K` / `Ctrl+K` opens the command menu.
- `/resume` is the printable resume.

## Structure

```
src/
  app/                 routes, metadata, OG image, icons, sitemap, robots, 404
  content/profile.ts   all copy and data
  components/
    bits/              React Bits sources, adapted (each file notes what changed)
    sections/          Hero, Proof, Story, Work, Education, Projects, Toolkit, OffStage, Contact, Footer
    line/PageLine.tsx  the line that runs through the page, dashed ahead and solid behind
    ...                hero, work, projects, toolkit, offstage, contact, skim, ui
  lib/                 motion tokens, device checks, one-WebGL-at-a-time slot, stores
scripts/truth-lint.mjs
```

## Deploy

Vercel, zero config. Set `NEXT_PUBLIC_SITE_URL`.

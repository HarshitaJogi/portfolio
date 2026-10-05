# harshitajogi.com

Portfolio of Harshita Jogi. Next.js (App Router), TypeScript, Tailwind CSS v4, three.js via react-three-fiber and drei, Motion.
The home page is an island: a map of the resume, one district per section. Each district opens into its own world (`/education`, `/skills`, `/experience`, `/projects`, `/offstage`), walked in time order.
Design rationale lives in [DESIGN.md](DESIGN.md).

```bash
pnpm install
pnpm dev          # http://localhost:3000   (/lab?s=experience&p=N frames step N of a scene, dev only)
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
| `public/placeholders/dance-1.jpg` | Unsplash placeholder (SKG Photography) | **Your** Bharatanatyam photo. Shown in the frame on the island's stage, and on /skim. Portrait, roughly 7:10, face centred |
| `public/placeholders/dance-2.jpg` | Unsplash placeholder (atelierbyvineeth) | Your performance photo |
| `public/placeholders/dance-3.jpg` | Unsplash placeholder (Jayanth Muppaneni) | Your performance photo |
| `public/placeholders/dance-4.jpg` | Unsplash placeholder (atelierbyvineeth) | Your performance photo |
| `public/placeholders/dance-5.jpg` | Unsplash placeholder (gio shravan) | Your performance photo |
| `public/placeholders/drone.jpg` | Unsplash placeholder (DRONE EFT) | Your drone, or its aerial imagery. Landscape, high contrast |
| `public/placeholders/bitgig.jpg` | Screenshot of the live Bitgig demo | Keep, or a better product shot. Shown on the booth screen, 16:10 |
| `public/world/poster-d.webp`, `poster-m.webp` | Stills of the opening shot, shown while WebGL loads | Regenerate if the island changes: screenshot `/lab?p=0` at 1440×900 and 390×844 @2x |
| `public/Harshita_Jogi_Resume.pdf` | Stand-in generated from `/resume` (print stylesheet, Letter) | **Your real resume PDF**, same file name |

Placeholder photo credits and links are in `public/placeholders/CREDITS.json`. All are Unsplash License.
If any placeholder ships, credit is appreciated but not required by that license.

## Open items (TODO in `profile.ts`)

- `SITE_URL`: set `NEXT_PUBLIC_SITE_URL` in Vercel once the domain is final (harshitajogi.com vs .dev).
- `person.links.source`: the real URL of this repo once it is pushed (footer and console note use it).
- `bitgig.repo`, `bitgig.team`: Bitgig repo link and teammates, if any. Nothing is shown until set.
- `hackathons.tickets[1].href`: TryBud repo link, if any.
- Skills without a confirmed "where" sit in "Also familiar with": C++, SQL, JavaScript, PostgreSQL, AWS, Git.

## URL features

- `/skim` is the one-screen text version (also linked as "Text version" in the nav). `?view=skim` redirects there.
- `/resume` is the printable resume.
- `⌘K` / `Ctrl+K` opens the command menu.
- Every world is its own URL, and steps take a hash: `/experience#nokia`, `/projects#bitgig`.

## Structure

```
src/
  app/
    (island)/layout.tsx      nav, the persistent canvas shell, footer, easter eggs
    (island)/page.tsx        the hub
    (island)/[world]/        one static page per world
    skim/ resume/ lab/       text version, printable resume, dev-only scene viewer
  content/profile.ts         all copy and data: hubStops, worlds (steps), eggCopy
  world/
    World.tsx                the canvas: scene switch, lazy chunks, async shader compile
    Lights.tsx atmosphere.ts sky, fog and night, blended per step
    hub/                     the hub island, districts, portals, the bottle
    worlds/Frame.tsx         a world: islet chain, camera path, plane or bridges, portal
    worlds/<id>/             one folder per world, one file per diorama
    props/                   shared toys: islet, sign, live clock, portal, trees, buildings, vehicles
    pieces/                  bigger working models reused in worlds (agent, cloud, papers, drone, booth)
    eggs.ts party.ts nav.ts  easter eggs, the barrel roll, scene navigation
  components/v5/             Shell (sky, poster, canvas, cloud wipe), HubPage, WorldPage, cards, Eggs
scripts/truth-lint.mjs
```

## Deploy

Vercel, zero config. Set `NEXT_PUBLIC_SITE_URL`.

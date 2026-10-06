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

## Photos and resume

Real files, no placeholders left. All live in `public/media/` (set by `MEDIA_DIR` in `profile.ts`); replace a file in place, same name, to update it.

| File | What |
|---|---|
| `public/media/dance-1.jpg` … `dance-5.jpg` | Arangetram photos, in gallery order. 3 and 4 were small screenshots, upscaled 2.5× and 3× (denoise, Lanczos, light sharpen, faint grain). 2 had poster lettering removed. Alt text is in `media.dance` |
| `public/media/headshot.jpg` | Headshot, used on the back of the name card and on /skim |
| `public/media/bitgig.jpg` | Screenshot of the live Bitgig demo, on the booth screen |
| `public/Harshita_Jogi_Resume.pdf` | The resume, previewed on the name card and downloaded by every Resume button |

The originals sit in `/pics` and `/resume`, which are git-ignored.

## Open items (TODO in `profile.ts`)

- `SITE_URL`: set `NEXT_PUBLIC_SITE_URL` in Vercel once the domain is final (harshitajogi.com vs .dev).
- `bitgig.team`: Bitgig teammates, if any. Nothing is shown until set.
- `hackathons.tickets[1].href`: TryBud repo link, if any.

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

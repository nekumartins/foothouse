> **SUPERSEDED (2026-07-12):** product direction now lives in `PLAN.md` (+ `CLAUDE.md`). Design system and sky rules here still apply where PLAN.md does not contradict them.

# Foothouse — Build Specification

A personal site for **Neku Akpotohwo**. This document is the single source of truth for the build. Read the whole thing before writing any code. Build in the numbered phases. Do not skip ahead, do not add features not listed here, and do not "improve" the aesthetic direction — every choice below is deliberate and was decided with the owner.

---

## 0. What this site is (read first, internalize before building)

This is **not** a developer portfolio. It is a warm, dark, *inhabited* personal home base — "a house you wander at night." The owner's priority order is: **(1) a personal home base, (2) an audience for his writing, (3) being hireable** — in that order. Do not optimize for recruiters. Do not add "Hire me" CTAs, availability badges, dotted-grid heroes, or stat-counters ("45+ stars earned"). Those belong to the genre we are deliberately avoiding.

The feeling to hit: **calm, warm, cheerful, authentic, a peek inside a thoughtful person's head.** The owner describes himself as "somewhere between an engineer and someone who won't stop asking why." Restraint reads as confidence. Warmth comes from unguarded, cheerful, purpose-first language — never from terse "cool" fragments, and never from stat-flexing.

**The signature** (the one thing this site is remembered by): a **living sky** that shifts with the visitor's local time of day, with real glass activity cards floating in it.

---

## 1. Locked design decisions (do not deviate)

### Palette — "warm dark / lamplight" (not cold black)
```
--bg:        #15110D   /* deep espresso, never pure black */
--raised:    #1E1813   /* raised surfaces */
--raised-2:  #241D17
--line:      #2E271F   /* hairline borders */
--paper:     #ECE3D6   /* warm off-white text, never #FFF */
--muted:     #9A8C7B   /* warm taupe-grey secondary text */
--faint:     #6B6052   /* faintest text / labels */
--lamp:      #E0A458   /* lamplight amber — the ONE accent, used sparingly, with a soft glow not a hard highlight */
--ember:     #C57B4E   /* secondary warm, for map paths etc */
```
Sky-state colors are defined in Phase 1.

A faint film-grain/noise overlay sits over everything at very low opacity (~0.05, mix-blend overlay). This is what separates "warm filmic dark" from "flat digital dark." Keep it subtle.

### Typography
- **Display / headings / editorial moments:** **Fraunces** (variable; use optical sizing). This is the editorial-but-warm face. Do NOT substitute DM Serif Display.
- **Body / UI / functional text:** **DM Sans.**
- Optional tiny metadata only: a mono is acceptable for things like dates/labels, but prefer DM Sans. Do not introduce a third face casually.
- Self-host both as woff2 for fast loading. Set a sensible type scale; let Fraunces carry personality, keep DM Sans quiet.

### Motion
Slow, restrained, calm. Gentle fades and soft scroll reveals. Nothing leaps. Respect `prefers-reduced-motion` (cut animations, no springs).

### Voice (apply to ALL copy)
- Cheerful, warm, glad-to-show-you-around. **Never** terse-cool or stat-flexing.
- **Purpose before mechanism**: say who something is for / why it matters, not what it technically does.
- Facts without adjectives; let the reader supply the adjective.
- **No em dashes anywhere on the site.** Use commas or full stops. This is a hard rule.
- First person, sparingly. A thinker who's happy to think out loud, not someone narrating their own excellence.

---

## 2. Tech stack (locked, chosen for speed)

- **Astro** — static-first, ships zero JS by default, hydrates only interactive "islands." This is the speed decision; the heavy visual effects must NOT block first paint.
- **Supabase** — Postgres (content), Auth (admin), Storage (images served as WebP via CDN).
- **Admin:** use **Supabase Studio** (the built-in table editor) to start. Do NOT build a custom admin panel in early phases. A lightweight admin (e.g. Refine) can come much later if editing becomes painful. The schema must be editable by hand in Studio.
- **MapLibre GL** for the life-map (Phase 4), lazy-loaded, custom warm-dark style. Never loads on the landing page.
- **Host:** Vercel or Netlify.

**Speed principles (enforce in every phase):**
1. Static HTML renders first and is instantly readable.
2. The time-of-day **gradient** (plain CSS) paints immediately so the page is warm and correct in <1s.
3. Heavy effects (starfield canvas, glass refraction) hydrate *after*, as islands, lowest priority. The user never waits on them to read.
4. Full effects are the **default for everyone**. Do not downgrade capable phones. Only serve a lighter fallback on (a) genuine runtime performance failure, or (b) explicit OS user preference (`prefers-reduced-motion`, `prefers-reduced-transparency`). Never ask the user to choose; only read OS-level signals.
5. Map and images are lazy-loaded. Images sized down, WebP/AVIF.

---

## 3. Site structure / routing

Multi-page with real (but quiet) navigation. Routes:
```
/                      Threshold (home)
/writing               Writing index (series as shelves + unfiled run)
/writing/[series]      A single series (e.g. /writing/isms)
/writing/[series]/[post]   A post (or redirects out to Medium if canonical=medium)
/map                   The life-map
/work                  Featured projects
/colophon              About / how the site is built
```

**The living sky is present on every page**, but it RECEDES on inner pages: on `/` it is at full presence; on inner rooms it is dimmed, blurred, and lowered in contrast so it sits behind content as atmosphere (the "silhouette/shadow" of the sky). This keeps the whole site feeling like one continuous place, not a landing page bolted to plain inner pages. This consistency is important — especially on desktop where the difference would be obvious.

---

## 4. Content model (Supabase / Postgres)

Create these tables. All text in the owner's voice. `sort` fields drive display order. `status` gates drafts.

### `series` — shelves for writing (e.g. "isms" = philosophy: solipsism, nihilism, absurdism…)
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| slug | text unique | e.g. `isms` |
| title | text | "isms" |
| blurb | text | one line, owner's voice |
| kind | text | optional: `philosophy`/`engineering`/`travel` |
| sort | int | |

### `posts`
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| slug | text | |
| title | text | |
| excerpt | text | the "implication" line |
| body | text (markdown) | NULL if the piece lives only on Medium |
| series_id | uuid fk → series | **nullable** (unshelved posts allowed) |
| canonical | text | `self` or `medium` |
| medium_url | text | for cross-post / link-out |
| status | text | `draft`/`published` |
| published_at | timestamptz | |
| reading_min | int | optional |

Writing index displays: series as shelves, then an "unfiled" run for `series_id IS NULL`. Posts with `canonical='medium'` and `body` NULL render as link-outs to `medium_url`. Posts with `canonical='self'` render on-site and may also show a "also on Medium" link.

### `places` — life-map pins (Snap-Map-of-a-life model: travel AND home AND events)
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text | "Lagos", "Prague" |
| lat | float8 | |
| lng | float8 | |
| arrived_on | date | orders a travel route |
| kind | text | `travel`/`home`/`event` |
| pin_type | text | **`place`** (opens to a gallery of media) or **`moment`** (a single shot + line, no drill-in) |
| note | text | one line |
| sort | int | |

### `place_media` — photos/moments attached to a pin (a `place` has many; a `moment` has exactly one)
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| place_id | uuid fk → places | |
| storage_path | text | Supabase Storage path |
| caption | text | |
| taken_on | date | |
| sort | int | |

### `projects` — hand-picked Work (NOT an auto-dump of all GitHub repos)
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text | |
| tagline | text | one sentence: what it is + what it's for. No "I built". No adjectives. |
| body | text | optional deeper detail |
| repo_url | text | nullable |
| live_url | text | nullable |
| github_sync | bool | if true, pull live star/fork count for THIS repo only |
| status | text | `active`/`archived` |
| featured | bool | |
| sort | int | |

### `now` — the presence cards (single editable row to start)
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| listening_text | text | hand-edited now; can wire to Spotify later |
| reading_title | text | |
| reading_author | text | |
| building_text | text | hand-edited now; can wire to a pinned repo later |
| status_line | text | e.g. "packing for Europe and pretending I'm ready" |
| updated_at | timestamptz | |

Owner edits all of this by hand in Supabase Studio at first. Do not build sync integrations until explicitly asked; schema does not change when they're added.

---

## 5. Build phases

Build strictly in order. After each phase, the site should be deployable and correct, just with fewer features. Do not begin a phase until the previous one works.

### PHASE 1 — The living sky + the Threshold (the soul; get this right first)
Goal: a visitor lands and *feels* something before reading anything.

1. **Astro project skeleton**, Vercel/Netlify deploy, fonts self-hosted (Fraunces + DM Sans), palette tokens + grain overlay in global CSS.
2. **The sky as layered background:**
   - Read the visitor's **local hour** in JS. Map to 5 states: **dawn, day, golden hour, dusk, night.** Each state is a CSS gradient (warm at dawn/golden/dusk, blue midday, deep indigo night). Define the 5 gradient palettes; transition smoothly between them.
   - The gradient is **plain CSS and paints immediately** (no JS blocking). This is the first thing visible.
   - **Starfield**: at dusk/night, a canvas of stars fades in as a hydrated island AFTER first paint. Stars vary in size/brightness; a few twinkle *slowly* (subtle opacity drift, not blinking). Optional: one occasional shooting star on a long random timer. Restraint = realism.
   - **Sun/moon override**: a small, quiet control (corner). Tapping it lets the visitor scrub through the day or sit in night. Remember their choice for the session. This is a *quiet discovery*, not a settings panel, and there is **no prompt asking them anything** on load — the site just opens as their real local sky.
3. **Threshold content over the sky**, in this vertical order (this order is engineered for attention: mood → person → presence → quiet proof → invitation):
   - **(mood)** the sky alone for a beat at top.
   - **(person)** Name in Fraunces, large, calm: **Neku Akpotohwo**. One line under it: *"I'm Neku, somewhere between an engineer and someone who won't stop asking why."*
   - **(presence)** the **now-cards** (see Phase 2 for the glass; in Phase 1 render them as simple frosted cards as a placeholder). Content from the `now` table.
   - **(quiet proof)** the community line and one featured project line (copy in §6).
   - **(invitation)** the doors: *"Have a look around. There's writing, a map of where I've been, and the things I've made."* linking to the rooms.
   - **(footer)** copy in §6.
4. Mobile-first (Nigerian mobile reality). Keyboard focus visible. `prefers-reduced-motion` cuts animation.

**Phase 1 is done when:** the landing loads instantly warm, shows the correct sky for the visitor's time, stars appear at night, the override works, and all threshold copy is in place. The site is shippable here.

### PHASE 2 — The real glass activity cards
Replace the placeholder frosted now-cards with **real computed-refraction glass** (the Snell's-law method: model a squircle dome, refract a down-ray with Snell's law at index 1.5, write displacement to an SVG `feDisplacementMap`; render the sky a second time as a counter-positioned copy and filter the *copy*, not the live backdrop, so it works in Safari/Firefox, not just Chromium). The cards bend the live sky behind them.

- Apply glass to the **now-cards only** (listening / reading / building / lately). Not to everything.
- **Default to the full effect for all devices.** Only fall back to a cheap frosted approximation on (a) detected runtime jank, or (b) `prefers-reduced-transparency`. Do NOT downgrade capable phones (iPhone X-era and most recent Android handle this fine).
- Implementation notes from the reference technique: load the displacement map as a `blob:` URL (not a `data:` URI — Safari refuses those in `feImage`); force sRGB; give the filter a fresh `id` on each rebuild (Safari caches by id); clip the refraction source to the lens box (Safari caps source size). On Safari, run a single displacement pass (skip the chromatic-fringe second pass) to hold frame rate.

### PHASE 3 — Writing (populated on day one)
- Build `/writing` (series as shelves + unfiled run), `/writing/[series]`, `/writing/[series]/[post]`.
- Render markdown posts where `canonical='self'`; link out where `canonical='medium'`.
- **Seed the section with the owner's existing Medium pieces** organized into series for the first time (this is the whole point — Medium can't group them; the site can). New writing is canonical-on-site going forward, optionally cross-posted to Medium with a `rel="canonical"` back to the site URL.
- Sky is dimmed/atmospheric on these pages (§3). Reading comfort first: generous measure, real margins.

### PHASE 4 — The life-map
- Build `/map` with **MapLibre GL**, lazy-loaded (never on landing), custom **warm-dark** style.
- Render `places` as pins. `pin_type='place'` opens a small gallery of its `place_media`; `pin_type='moment'` is a single image + line that just enlarges. `kind` distinguishes travel/home/event so the map is a *life* map, not only a trip log (it stays alive when the owner isn't travelling).
- Earthy, warm pin styling with a soft lamplight glow.

### PHASE 5 — Work + Colophon
- `/work`: hand-picked `projects` only. Each is a uniform one-line card (`tagline`): what it is + what it's for, no adjectives, no "I built". `github_sync=true` projects show live stars for that repo. **No vanity stat-counters.**
- `/colophon`: fuller, warm About; "how this site is built" (show the seams honestly); socials; résumé link. Quiet, not a pitch.

### PHASE 6 (optional, only if asked) — integrations & admin polish
- Wire `now` to live Spotify / GitHub.
- Add a lightweight admin (Refine) over Supabase if hand-editing tables becomes painful.

---

## 6. Threshold copy (use verbatim; no em dashes)

**One-liner (under name):**
> I'm Neku, somewhere between an engineer and someone who won't stop asking why.

**Now-cards** (placeholder values; owner edits in Studio):
> listening to [whatever's on], a bit too loudly
> reading The Beginning of Infinity, slowly, on purpose
> building something that bends light, currently fighting Safari
> lately packing for Europe and pretending I'm ready

**Community line:**
> Some of what I'm proudest of isn't code. I help run GDG Babcock, a thousand-something people learning to build together. We've thrown summits, started a publication, made things that outlast us.

**Featured project line (debate coach)** — and the pattern for ALL featured projects (what it is + what it's for, one sentence, no adjectives, no "I built"):
> A sparring partner you argue with out loud, to get better at thinking on your feet.

**The doors:**
> Have a look around. There's writing, a map of where I've been, and the things I've made.

**Footer:**
> Built this myself, late at night, mostly. The sky up there follows your time, not mine, so if it's dark where you are, that's just us in the same evening.

---

## 7. Hard "do nots"
- No em dashes anywhere.
- No "Hire me" CTA, no availability badge, no dotted-grid hero, no vanity stat-counters.
- Do not lead with a job title; the one-liner stays a person, not a role.
- Do not make the accent a bright/neon highlight; lamplight amber, used sparingly, with a soft glow.
- Do not downgrade visual quality on capable phones.
- Do not auto-dump all GitHub repos; projects are hand-picked.
- Do not ask the visitor any question on load (no light/dark prompt, no motion prompt); read OS signals silently.
- Do not substitute the fonts (Fraunces + DM Sans are locked).
- Do not let heavy effects block first paint.
```

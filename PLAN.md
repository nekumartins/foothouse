# PLAN.md — nekumartins.dev revamp

Approved plan for the site revamp. Executed phase by phase by a smaller model in
later sessions. **One phase = one session = one commit to `main`.** Read
`CLAUDE.md` before every phase. This plan supersedes the product direction of
the old build specs (deleted; see "Carried over from the old build specs"
below for the one thing from them not yet built). The design system and sky
rules they described live on in `CLAUDE.md`.

**All copy the site needs is written in this file.** Do not invent, improve, or
paraphrase copy. Copy marked VERBATIM is used character for character.

**Status (2026-07-12):** Phases 1–9 and 11 have shipped. Phase 10 (domain
switch) waits on DNS access. **Current work: Phases 12–15, the design
overhaul** (see "The design overhaul" below). They supersede Phase 6's
scrim-alpha approach and the hero presentation shipped in `a969358`. Execute
them strictly in order — each phase leaves the site shippable and AA-compliant
on its own.

---

## 0. The job of the site

This site is Neku's business card. Two audiences, one homepage, both routed
within the first screen:

- **A) Non-technical clients** — family referrals and Nigerian small-business
  owners who need websites and automation of manual work (orders, receipts,
  invoices, spreadsheets, bookings). On phones, on paid mobile data. They decide
  in seconds: do I understand what he does, does it look trustworthy, can I
  message him right now. In Nigeria roughly two-thirds of online purchases begin
  in a chat, so **WhatsApp is the conversion channel**, not email.
- **B) Technical audience** — recruiters, engineers, collaborators. They decide
  on evidence: named projects, GitHub, writing, specificity.

Never jargon-wall A. Never dumb down for B.

## 1. Facts allowlist (the ONLY claims the site may make)

- Chukwuneku "Neku" Akpotohwo. Software engineer, Nigeria.
- CS **graduate**, Babcock University, **July 2026**. (The site currently says
  "studying" — that is wrong everywhere it appears. He has graduated.)
- Built GDG on Campus Babcock: **1,500+ members**, **five shipped products**
  (RADAR publication, ORBIT summit — **500+ conference attendees**, **1,000+
  career fair** — Babcock 100, BabcockVotes, apply portal). Handed over
  leadership **2026**.
- Currently building: **Dysseo**, a nutrition-first fitness app with an
  adaptive TDEE engine that re-targets calorie recommendations when the real
  loss rate diverges from the goal rate. In active development — always framed
  as "building now", never as shipped.
- Shipped: a **real-time full-duplex AI voice debate coach** (FastAPI,
  WebSockets, STT→LLM→TTS, Docker, Azure); **paper submitted to a journal**.
- Day role: **CTO at an early-stage Nigerian fintech**. Exactly that vague — no
  company name, no product details.
- Stack: Python, FastAPI, PostgreSQL, Docker, Azure, TypeScript, React, Astro,
  Google Apps Script. Learning Java/Spring Boot. **Nothing else** may be listed
  (remove Kubernetes, Node.js, or anything not on this list wherever found).
- Contact: WhatsApp **+234 810 169 4302** (`wa.me/2348101694302`), email
  akpotohwoo@gmail.com, github.com/nekumartins, linkedin.com/in/nekumartins.
- Domain: **nekumartins.dev** (connecting now; currently on Vercel at a
  `.vercel.app` URL).

Anything not on this list — roles, metrics, testimonials, client names — is
banned. Real numbers only, and only these numbers.

## 2. Audit — what exists today

Astro 7 + `@astrojs/vercel` adapter. Pages prerender at build; only
`/api/now-playing` (Spotify) and `/api/lately` (X via RSS bridge) are
serverless. Content lives in **Sanity** (project `foothouse`), with hard-coded
fallback strings in the pages; **Sanity content overrides fallbacks**, so every
copy phase has two halves: (1) executor updates the code fallbacks, (2) owner
pastes the same strings into Sanity Studio (paste blocks are in each phase).
Schema changes require a Studio redeploy — the GitHub Action in
`.github/workflows/deploy-studio.yml` does it (see `STUDIO.md`).

| Area | Files | State | Touched in |
|---|---|---|---|
| Layout, meta, OG | `src/layouts/BaseLayout.astro` | Description says "at Babcock University" (reads as student); generic `og.png` | P3, P7, P10 |
| Homepage | `src/pages/index.astro` | Hero = Sanity `bio`/`craft`; CTA is a mailto chip; no services section; JSON-LD says affiliation Babcock | P1, P2, P3 |
| Now-strip | `src/components/NowCards.astro` | Spotify (auto-hides) + reading + X "lately"; polls every 15 s | P6 |
| Contact/socials | `src/components/SocialLinks.astro`, `Footer.astro` | Email/GitHub/LinkedIn/X/résumé icons; **no WhatsApp anywhere** | P1 |
| Work | `src/pages/work/index.astro`, `work/[slug].astro`, `ProjectCard.astro` | Cards show name+tagline only; schema already has `problem`/`approach`/`outcome` | P4 |
| About | `src/pages/about.astro` | Fallback copy says "studying at Babcock University" | P5 |
| Writing | `src/pages/writing/*` | Fine; needs only meta/contrast consistency | P7 |
| Map | `src/pages/map.astro`, `LifeMap.astro` (MapLibre GL) | Flat map, fit-bounds issues historically | P11 |
| Sky system | `Sky.astro`, `Starfield.astro`, `CloudBed.astro`, `CelestialGrab.astro`, `TimeOverride.astro`, `src/scripts/sky.ts` | The brand. Works. | **Untouched except P11's map page (which doesn't touch these files)** |
| Design tokens | `src/styles/global.css` | Warm-dark palette, Fraunces + DM Sans self-hosted; `--muted`/`--faint`/italic accents fail AA over the light day sky | P6 |
| Sanity | `src/sanity/schemas/*`, `sanity.config.ts` | Stays (owner decision 2026-07-12) | P1 (constants instead for contact), P4, P9 |
| Supabase | `src/lib/supabase.ts` | Vestigial fallback for map places only | leave alone |
| Config | `astro.config.mjs` | `site: https://foothouse-nu.vercel.app` | P10 |

Known live-content issues to fix via the Sanity paste blocks: the abstract hero
line ("Systems Thinker…"), "studying at Babcock", Kubernetes/incorrect stack
items, "Fastapi" casing.

## 3. Decisions already made (do not re-litigate)

- Sanity **stays**. Copy ships as code fallbacks + owner paste blocks.
- WhatsApp number: `2348101694302`. Domain: `nekumartins.dev`.
- Now-strip: **remove only the reading fragment**; Spotify + lately stay.
- Map becomes a rotatable mini globe (Snapchat-style), Phase 11.
- Analytics: **GoatCounter** (free, no cookies, ~3.5 KB script, supports click
  events — so WhatsApp-click conversions are countable). Rejected: Vercel Web
  Analytics (custom events need a paid plan), Plausible (paid), Umami Cloud
  (fine, but heavier setup for the same result).
- Form service: **Web3Forms** (free 250 submissions/month, plain HTML POST from
  a static page, honeypot spam protection, key is publishable). Rejected:
  Formspree (50/month free cap). The form is tertiary — WhatsApp first, email
  second.
- Git: commit straight to `main`, author `nekumartins <akpotohwoo@gmail.com>`,
  unsigned, no co-author/AI trailers (`.claude/lessons/git-delivery-conventions.md`).

---

## Phase 1 — WhatsApp-first contact (the conversion channel)

**Goal:** every page offers one dominant action: message Neku on WhatsApp with a
pre-filled text. Email becomes the visible secondary. Contact details become
code constants so a CMS hiccup can never break the money path.

**Files:** new `src/lib/site.ts`; `src/pages/index.astro`;
`src/components/SocialLinks.astro`.

**Build:**
1. Create `src/lib/site.ts`:
   ```ts
   export const WHATSAPP_NUMBER = '2348101694302';
   export const CONTACT_EMAIL = 'akpotohwoo@gmail.com';
   export const waLink = (text: string) =>
     `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
   export const WA_DEFAULT = waLink(
     "Hi Neku, I found your website. I'd like to talk about a project."
   );
   ```
2. In the hero (`.threshold__reach`), replace the mailto "Get in touch" chip
   with a filled WhatsApp chip using the existing `.threshold__contact` style,
   plus a WhatsApp glyph (inline SVG, same 20px treatment as SocialLinks
   icons). VERBATIM button label: `Message me on WhatsApp`. Directly under the
   chip row, one quiet line, VERBATIM: `I reply within a day.` (style like
   `.threshold__looking`: small, muted — P6 fixes its contrast).
   Email becomes the outline chip beside it (reuse `.threshold__resume` style),
   VERBATIM label: `or email me` → `mailto:akpotohwoo@gmail.com?subject=Hi Neku`.
   Résumé/GitHub/LinkedIn stay as the quiet text links after those two.
3. Add a WhatsApp icon to `SocialLinks.astro` (first position, before email),
   href `WA_DEFAULT`, `aria-label="WhatsApp"`. It thereby appears in the footer
   and About automatically.
4. `target="_blank" rel="noopener noreferrer"` on all wa.me links.

**CTA copy — 5 drafted options** (offer + response expectation):
1. `Message me on WhatsApp. I reply within a day.` ← **chosen**
2. `WhatsApp me what you need. Fixed quote before we start.`
3. `Tell me about your business on WhatsApp. I reply within a day.`
4. `Start with a WhatsApp message. I'll tell you what it takes and what it costs.`
5. `Message me on WhatsApp for a fixed quote. I reply within a day.`

Why 1: it is the shortest promise Neku can always keep. The fixed-quote offer
already lives in every services card (P2), so the button carries only the
response expectation — which is the trust signal audience A needs before
tapping. Button text and the reply-time line split naturally for layout.

**Pre-filled WhatsApp message (VERBATIM):**
`Hi Neku, I found your website. I'd like to talk about a project.`

**Acceptance:** `npm run build` passes. wa.me chip is visually dominant
(filled `--lamp`) on `/`; WhatsApp icon present in footer on every page; no
mailto as primary anywhere; contact strings come from `src/lib/site.ts` only.

**On-phone checklist:** tap the hero chip → WhatsApp opens with the message
pre-filled; chip is thumb-reachable without zoom at 360 px width; tap target
≥ 44 px; footer WhatsApp icon works from `/about` and `/work`.

---

## Phase 2 — Services section ("For your business")

**Goal:** a shop owner who reads slowly on a phone understands the three offers
in one pass and can message about a specific one.

**Files:** new `src/components/Services.astro`; `src/pages/index.astro`
(rendered directly after `.threshold__presence`, before Selected work).

**Structure:** section label + intro line + three cards (glass-card styling
consistent with `.community-feature`); each card = heading, "what you get"
paragraph, one meta line (timeline + quote), and a per-offer WhatsApp text
link. No prices anywhere.

**Copy (ALL VERBATIM):**

Section label: `For your business`
Intro: `I build tools for small businesses in Nigeria. You tell me the problem on WhatsApp, I give you a fixed quote before we start, and you pay only what we agreed.`

Card 1 heading: `A website your customers can find on Google`
Body: `A fast site that opens quickly on any phone, shows what you sell, and has a WhatsApp button so customers can message you straight away. I set it up on Google so people searching for your business actually find it.`
Meta: `Usually ready in 1–2 weeks. Fixed quote before we start.`
Link label: `Ask about a website` → `waLink('Hi Neku, I need a website for my business.')`

Card 2 heading: `Orders, receipts and invoices, automated end to end`
Body: `Customers order through a form or WhatsApp. Receipts and invoices are generated and sent automatically, payments are collected with Paystack or Flutterwave, and every order lands in one tidy record you can check any time.`
Meta: `Usually ready in 2–4 weeks. Fixed quote before we start.`
Link label: `Ask about order automation` → `waLink('Hi Neku, I want to automate my orders and receipts.')`

Card 3 heading: `Your spreadsheet busywork, automated`
Body: `The copying, totalling and reporting you do by hand every week happens by itself, on the Google Sheets you already use. Daily or weekly summaries can come straight to your WhatsApp or email.`
Meta: `Usually ready in about a week. Fixed quote before we start.`
Link label: `Ask about spreadsheet automation` → `waLink('Hi Neku, I want to automate my spreadsheet work.')`

**Acceptance:** build passes; section renders between now-strip and Selected
work; copy character-exact; every card link opens WhatsApp with its own
message; headings are real headings (`h2` label + `h3` cards); no banned words.

**On-phone checklist:** at 360 px cards stack single-column with no horizontal
scroll; each card readable without zoom; all three WhatsApp links open with the
right pre-filled text; section reachable within ~2 swipes of the hero.

---

## Phase 3 — Hero and above-the-fold evidence

**Goal:** replace the abstract identity line with a concrete one; every claim
above the fold gets a named artifact or number; route both audiences from the
first screen; kill "studying" everywhere in code.

**Files:** `src/pages/index.astro` (fallbacks, JSON-LD, stack, audience
router); `src/layouts/BaseLayout.astro` (DEFAULT_DESCRIPTION).

**Headline — 5 drafted options** (what I build + for whom):
1. `I build websites for small businesses, and the automation that runs their paperwork.`
2. `Software engineer in Nigeria. I build websites, business automation, and AI systems.` ← **chosen** (serves both audiences in one breath; the evidence line right under it carries the proof)
3. `I build the website your customers find on Google, and the software that does your busywork.`
4. `I turn manual business work into software: orders, receipts, invoices, spreadsheets.`
5. `Websites that bring customers. Automation that saves hours. AI systems that hold their own.`

**Copy (VERBATIM):**
- `bio` (headline under the name): option 2 above.
- `craft` (evidence line): `Right now I'm building Dysseo, a fitness app whose calorie engine adapts to your real rate of loss. Before it: a real-time AI voice debate coach running on Azure, and GDG on Campus Babcock, grown to 1,500+ members.`
- `looking_for`: `Open to engineering roles and collaborations. The evidence is on the work page.`
- Stack chips (exact list, exact casing): `Python`, `FastAPI`, `PostgreSQL`, `Docker`, `Azure`, `TypeScript`, `React`, `Astro`, `Google Apps Script`, `Java/Spring Boot (learning)`.
- Audience router — two quiet links directly under the reply-time line:
  `For your business ↓` (anchor `#services`, add `id="services"` to the P2 section) and `Engineer? The work page has receipts →` (`/work`).
- `DEFAULT_DESCRIPTION` in BaseLayout: `Neku Akpotohwo is a software engineer in Nigeria. Websites and automation for small businesses, and AI systems like Dysseo. Founder of GDG on Campus Babcock (1,500+ members).`
- JSON-LD: change `affiliation` to `alumniOf` (Babcock University); description to `Software engineer in Nigeria. Builds websites and automation for small businesses, and AI systems. Founded GDG on Campus Babcock.`

**Owner — paste into Sanity (Site Settings):** `bio`, `craft`, `looking_for`,
`stack` exactly as above (delete Kubernetes/Node.js/anything else from the
stack tags; fix any "Fastapi" → "FastAPI").

**Acceptance:** build passes; grep of `src/` finds no `studying`, no
`Kubernetes`, no `Fastapi`; headline + evidence + CTA + router all visible in
the first viewport at 360×740; no banned words (`scalable, solutions,
passionate, premier, cutting-edge, purposeful`).

**On-phone checklist:** first screen answers "what does he do, for whom, can I
message him"; both router links land correctly; nothing overflows at 360 px.

---

## Phase 4 — Work page: problem → what I built → outcome

**Goal:** `/work` shows 3 curated projects rendered as problem → built →
outcome with real numbers, plus a tight experience list. Curate hard.

**Files:** `src/pages/work/index.astro` (render the three fields inline per
project instead of tagline-only cards); `src/components/ProjectCard.astro` only
if needed; local fallback data (`src/data/projects.ts`) mirroring the copy so
the page is correct even if Sanity is empty.

**Copy (ALL VERBATIM — also the Sanity paste block; owner creates/updates
these three `project` documents and unfeatures everything else):**

**Dysseo** — tagline: `A fitness app that adapts to what your body actually does. Building now.`
- problem: `Calorie apps hand you a fixed target and never check whether it is working. Real weight change drifts off plan within weeks.`
- approach: `A nutrition-first fitness app with an adaptive TDEE engine: it watches your actual rate of loss and re-targets your calorie recommendation when reality diverges from the goal rate. Python, FastAPI, PostgreSQL, Docker.`
- outcome: `In active development. This is the thing I build at night.`
- repo_url: owner confirms whether the repo is public; leave empty if private.

**AI voice debate coach** — tagline: `Argue out loud. It argues back.`
- problem: `Practicing debate needs a sharp opponent who is always available. Almost nobody has one.`
- approach: `A real-time, full-duplex voice debate coach: FastAPI and WebSockets carrying a live STT to LLM to TTS pipeline, containerized with Docker and deployed on Azure.`
- outcome: `Shipped and working end to end. Paper submitted to a journal.`
- repo_url / live_url: owner supplies if public.

**GDG on Campus Babcock** — tagline: `A campus community that ships.`
- problem: `Babcock had talented students and no serious builder community to grow them.`
- approach: `Founded and led GDG on Campus Babcock, growing it to 1,500+ members. With the team, shipped five products: RADAR (a publication), ORBIT (a summit), Babcock 100, BabcockVotes, and an application portal.`
- outcome: `ORBIT drew 500+ conference attendees and a career fair of 1,000+. Handed leadership to the next team in 2026.`

**Experience (Sanity `experience` docs; owner sets periods — do not invent dates):**
1. role `CTO`, company `Early-stage fintech, Nigeria` (no URL, no bullets beyond, VERBATIM bullet: `Building the engineering side of an early-stage Nigerian fintech.`)
2. role `Founder & Lead`, company `GDG on Campus Babcock`, period `2024 – 2026`, bullets: `Grew the community to 1,500+ members and shipped five products with the team.`

Work intro line (VERBATIM, replaces current): `Where I've worked and what I've built. Not everything, just the ones worth showing.`

**Acceptance:** build passes; `/work` shows exactly 3 projects + 2 experience
rows (≤ 6 items total); every number on the page appears in the facts
allowlist; problem/built/outcome visible without clicking into a case study;
links only where URLs exist.

**On-phone checklist:** each project scannable in one screen at 360 px; no
truncated numbers; external links open in new tab.

---

## Phase 5 — About: written for a graduate

**Goal:** rewrite About for someone who has graduated and runs things. Keep the
voice: curious, a bit literary, direct.

**Files:** `src/pages/about.astro` (the three fallback strings + page
description).

**Copy (VERBATIM — also the Sanity paste block, Site Settings `about_*`):**
- `about_intro`: `I'm Chukwuneku Akpotohwo. Most people call me Neku. I'm a software engineer in Nigeria, a computer science graduate of Babcock University (class of 2026), and most of what I believe fits in one line: intelligence is built, not found. Days, I'm CTO at an early-stage fintech. Nights, I build Dysseo, a fitness app that adapts your calorie target to what your body actually does.`
- `about_gdg`: `From 2024 I built GDG on Campus Babcock into the largest developer community on campus: 1,500+ members, five shipped products, a summit that drew over five hundred people and a career fair that drew a thousand more. In 2026 I handed it to the next set of hands, which was always the point of building something that outlasts you.`
- `about_interests`: `Off the clock I read cognitive psychology and take ideas apart until they stop reducing. I care about what grows minds, mine included, and what that looks like at the scale of a person, a community, a continent.`
- Page `description` prop: `Who Neku Akpotohwo is: software engineer in Nigeria, founder of GDG on Campus Babcock, builder of Dysseo.`

**Acceptance:** build passes; no "studying", no "AI-focused software engineer
at Babcock University" phrasing anywhere on the page; word count of the three
paragraphs combined ≤ 220.

**On-phone checklist:** page reads in under a minute; portrait (if set)
doesn't push intro below the fold at 360 px.

---

## Phase 6 — Now-strip trim + WCAG AA contrast (day and night)

**Goal:** drop the reading fragment; make every piece of floating text pass AA
against the brightest day sky and the darkest night sky.

**Files:** `src/components/NowCards.astro`; `src/styles/global.css`;
`src/pages/index.astro` (hero styles). **Do not touch the sky components or
`sky.ts`.**

**Build:**
1. In `NowCards.astro`, delete the reading fragment (markup + its props usage).
   Spotify (auto-hides) and lately stay. Leave the Sanity `now` schema alone.
2. Contrast: the failures are small `--muted`/`--faint` text and the italic
   `.threshold__looking` line over the day sky (`day.cloudHi = #FFFFFF`,
   bottom `#5184B0`). Fix structurally, not by nudging colors per-state:
   - Add a soft scrim behind hero text: on `.threshold__person` and the
     now-strip, a contained radial/linear scrim (e.g. `background:
     radial-gradient(ellipse at center, rgba(21,17,13,0.55), transparent 75%)`
     with padding) so effective background is always dark.
   - Strengthen the existing `.nav`/hero text-shadow halo where the scrim
     can't reach (nav links, footer icons).
   - `.threshold__looking` and `now-strip` text: minimum size `--text-sm`,
     color no fainter than `--muted`, and covered by the scrim.
3. Verify numerically: screenshot at forced noon (time-override slider) and
   forced midnight; sample effective backgrounds; body text ≥ 4.5:1, large
   text ≥ 3:1, icons ≥ 3:1.

**Acceptance:** build passes; reading fragment gone; documented contrast
ratios (in the commit message body) for: nav links, hero tagline, evidence
line, reply-time line, now-strip, footer icons — at noon and at midnight; all
pass AA; sky animation visually unchanged.

**On-phone checklist:** set slider to noon outdoors-bright screen — every hero
line legible; set to midnight — same; strip shows one quiet line, no jitter
from Spotify polling.

---

## Phase 7 — SEO + the OG card (the WhatsApp first impression)

**Goal:** when the link is forwarded on WhatsApp, the preview card sells the
site. Titles and descriptions on every page.

**Files:** `public/og.png` (replaced); new `scripts/og/` (template + capture
script, dev-only); every page's `title`/`description` props; `public/robots.txt`.

**Build:**
1. OG image 1200×630, night-sky theme: gradient `#0B0D1A → #141833 → #1A1530`,
   a few stars, grain. Text: `Neku Akpotohwo` (Fraunces, `--paper` #ECE3D6),
   line 2 `Websites, business automation, and AI systems.` (DM Sans, #B6A892),
   line 3 `nekumartins.dev` (#E0A458). Build it as `scripts/og/og.html` using
   the repo's own fonts, screenshot with the environment's Chromium
   (Playwright, `executablePath: '/opt/pw-browsers/chromium'`) to
   `public/og.png`. Commit the PNG; the script is for regeneration.
2. Per-page titles/descriptions (VERBATIM):
   - `/` title `Neku Akpotohwo — websites, automation, AI systems`; description = P3's DEFAULT_DESCRIPTION.
   - `/work` title `Work — Neku Akpotohwo`; description `Dysseo, a real-time AI voice debate coach, and GDG on Campus Babcock. Problem, what I built, outcome.`
   - `/about` per P5. `/writing` title `Writing — Neku Akpotohwo`; description `Essays by Neku Akpotohwo.` `/map` unchanged text but title pattern `Map — Neku Akpotohwo`.
3. Confirm sitemap integration outputs all pages; `robots.txt` points at the
   sitemap; `twitter:card` already `summary_large_image` — keep.

**Acceptance:** build passes; `dist/` contains sitemap referencing all pages;
og.png is < 150 KB; every page has a unique title + description; OG validator
(e.g. opengraph.xyz, or manual meta inspection of built HTML) shows correct
card.

**On-phone checklist:** send the deployed URL to yourself on WhatsApp — the
preview card shows the sky-themed image, correct title, correct description.

---

## Phase 8 — Analytics + contact form

**Goal:** see WhatsApp-click conversions; give a form fallback for visitors who
won't use WhatsApp or email.

**Files:** `src/layouts/BaseLayout.astro` (GoatCounter script);
`src/lib/site.ts`; `src/pages/index.astro` or `about.astro` (form block).

**Build:**
1. GoatCounter: owner creates the free site at goatcounter.com (suggested code
   `nekumartins`). Add the script tag (`//gc.zgo.at/count.js`, ~3.5 KB, async,
   no cookies). Instrument every wa.me link with GoatCounter click events
   (`data-goatcounter-click="whatsapp-hero"`, `whatsapp-services-website`,
   `whatsapp-services-orders`, `whatsapp-services-sheets`, `whatsapp-footer`)
   so each CTA's conversion is separately countable.
2. Web3Forms: owner creates a free access key. Plain HTML `<form>` POST to
   `https://api.web3forms.com/submit` with hidden access key, honeypot field,
   name/message/phone-or-email inputs, styled with existing tokens, placed as a
   quiet block above the footer on `/` (heading VERBATIM: `Prefer to write
   instead?`). No JS required; success redirects to `/?sent=1` and the page
   shows a one-line confirmation when that param is present (tiny inline
   script or server-safe check).
3. Both keys live in env/Sanity? No — GoatCounter code and Web3Forms access
   key are publishable by design; hard-code in `site.ts` with a comment.

**Acceptance:** build passes; GoatCounter records a pageview and a
`whatsapp-hero` click event on the deployed site; form submission arrives at
akpotohwoo@gmail.com; total added JS ≤ 5 KB.

**On-phone checklist:** tap hero CTA, then check GoatCounter dashboard shows
the event; submit the form from a phone; page never jumps or blocks on the
analytics script (test with it blocked too).

---

## Phase 9 — Testimonials: real slots, shipped empty

**Goal:** the component and CMS slots exist so real quotes can appear the day
they're collected. Ships EMPTY behind a flag. **Never fabricate a quote.**

**Files:** new `src/sanity/schemas/testimonial.ts` (+ register in
`schemas/index.ts`); new `src/components/Testimonials.astro`; new
`src/lib/flags.ts` (`export const SHOW_TESTIMONIALS = false;`);
`src/pages/index.astro` (render between Services and Selected work);
Studio redeploy via the GitHub Action.

**Schema fields:** `quote` (text, required), `name` (string, required),
`business` (string — e.g. "shop owner, Lagos"), `permission` (boolean —
"person agreed to appear on the site", required true to render), `sort`.

**Render rule:** section renders only when `SHOW_TESTIMONIALS === true` AND at
least one testimonial with `permission == true` exists. Section label VERBATIM:
`What clients say`. Card: quote, then name + business on one muted line.

**Acceptance:** build passes with the flag false and zero documents — nothing
renders, no empty heading, no layout gap; flipping the flag with a test
document renders correctly (then delete the test document and re-verify empty).

**On-phone checklist:** with flag off, homepage shows no trace of the section.

---

## Phase 10 — Domain switch: nekumartins.dev (run when DNS access is in hand)

**Goal:** the site lives at https://nekumartins.dev; every old URL redirects;
previews and canonicals point at the new domain.

**Code changes:** `astro.config.mjs` → `site: 'https://nekumartins.dev'` (this
fixes canonical, OG URLs, sitemap, and RSS in one move — they all derive from
`Astro.site`); JSON-LD `url`/`image` in `index.astro`; any hard-coded
`vercel.app` reference (grep for `vercel.app` in `src/`).

**Owner checklist (dashboard/DNS):**
1. Vercel → project → Settings → Domains → add `nekumartins.dev` and
   `www.nekumartins.dev`; set the apex as primary, `www` set to redirect to it.
2. At the registrar, enter exactly the records Vercel displays (A record for
   the apex, CNAME `www` → `cname.vercel-dns.com`). Wait for the domain to show
   "Valid Configuration".
3. In the same Domains screen, set the project's `.vercel.app` production
   domain(s) to **redirect (308)** to `nekumartins.dev`. Check which `.vercel.app`
   names actually serve production (config mentions `foothouse-nu.vercel.app`;
   the owner has also used `nekumartins.vercel.app`) and redirect all of them.
4. Deploy the code change from this phase **after** the domain is valid.
5. Verify: `https://nekumartins.dev` loads with a padlock; the old
   `.vercel.app` URL 308-redirects; view-source shows canonical + og:url on
   nekumartins.dev; sitemap at `/sitemap-index.xml` uses the new domain.
6. Re-share the link on WhatsApp to confirm the preview card uses the new URL
   (WhatsApp caches previews — append `?v=2` if it shows a stale card).
7. Optional: add the domain to Google Search Console and submit the sitemap.

**Acceptance:** all checks in step 5 pass; GoatCounter still records (its
setup is domain-agnostic but confirm the site code allows the new domain).

---

## Phase 11 — The Map becomes a mini globe

**Goal:** `/map` shows a small rotatable globe (like Snapchat's mini globe):
drag to spin, pins where Neku has lived/travelled, slow idle rotation.

**Files:** `src/components/LifeMap.astro` only (plus `map.astro` intro if the
copy needs a one-word tweak — nothing else).

**Build:** MapLibre GL v5 already supports `projection: 'globe'`. Configure the
existing map instance: globe projection, initial center on Nigeria
(`[8.6753, 9.0820]`), zoom ~1.6 so the whole sphere is visible on a phone,
drag-rotate enabled, scroll-zoom disabled on touch (pinch ok), slow idle spin
via `requestAnimationFrame` easing that pauses on interaction and **does not
run under `prefers-reduced-motion`**. Keep Sanity `place` pins and their
popups. MapLibre stays lazy to `/map` only — never imported elsewhere.

**Acceptance:** build passes; globe renders and spins by drag on touch and
mouse; pins clickable; reduced-motion shows a static globe; no MapLibre bytes
load on `/`, `/work`, `/about`, `/writing`.

**On-phone checklist:** globe spins smoothly with one thumb; page doesn't trap
vertical scrolling; pins tappable; initial view shows Nigeria.

---

# The design overhaul — Phases 12–15

## Why (the diagnosis; read once, then execute)

The current UI fails as a spatial system, and every visible symptom traces to
one architectural mistake plus a handful of local ones:

1. **The opaque slab.** `scrim.ts` holds the text light and darkens the glass
   until AA passes. Over the noon sky (`cloudHi #FFFFFF`) that drives
   `--scrim-alpha` toward 0.92 — a massive near-opaque dark box slapped over a
   bright sky. The material is fighting the sky instead of living in it.
   **Fix: invert the mechanism. The glass stays thin at a fixed alpha; the
   _ink_ flips.** Bright sky → paper-tinted light glass with dark ink. Dark
   sky → the existing dark glass with paper ink. This is how visionOS-class
   material systems work: the surface stays translucent, the content adapts.
2. **Nav/hero collision.** The nav is an edge-to-edge fixed bar whose pill
   radius clashes with the hero card it visually touches (on phones the hero
   spacer collapses to 32px, gluing them together). **Fix:** the nav becomes a
   compact centered floating pill with guaranteed clearance, in the same
   material as every other surface.
3. **Reading friction.** Centered multi-line text (hero name over left-aligned
   copy, centered now-strip) breaks scanning. **Fix:** alignment doctrine
   below.
4. **Dark-on-dark pills, muddy accents, blanket text-shadow halos.** The
   global halo block in `global.css` smears every panel's text; stack pills
   are dark tint on dark glass with `--faint` 12px text. **Fix:** ink-relative
   tints, no text-shadows anywhere, tokens sized for AA.
5. **Suffocated spacing and colliding chrome.** The ≤480px media block crushes
   hero rhythm to `--space-xs`; the fixed time-override nub overlaps page text
   at the bottom of the viewport. **Fix:** gap-based rhythm with a mobile
   floor, and a reserved chrome clearance zone.

## Doctrine (locked for Phases 12–15; every visual decision defers to this)

- **One sky, one material, two inks.** Every raised surface uses the same
  glass material (`--glass` + blur + `--glass-edge` hairline + `--glass-rim`
  top highlight). No surface ever becomes opaque to solve contrast; the ink
  mode solves contrast. The sky remains visible through every panel at every
  hour.
- **Alignment.** All multi-line text is left-aligned, no exceptions — this
  includes the hero name, the now-strip, and anything inside cards. Centering
  is permitted only for single-line, non-reading elements: the nav pill's
  contents and the footer icon row.
- **Depth.** Zero outer drop shadows and zero text-shadows, sitewide. Depth
  comes from the material itself: translucency, the 1px `--glass-edge`
  border, and a 1px inset top rim (`box-shadow: inset 0 1px 0
  var(--glass-rim)`). Delete the "Sky readability" text-shadow block in
  `global.css` when P12 says to.
- **Radius family.** `--r-lg: 24px` (hero panel, the deck), `--r-md: 16px`
  (cards, inputs, video), `--r-pill: 999px` (nav, chips, pills, buttons).
  Nothing else. Replace every 12px/20px/8px radius literal as files are
  touched.
- **Rhythm.** Vertical structure uses flex/grid `gap`, not ad-hoc margins.
  Section gap inside the deck: `--space-3xl`. Hero internal gap:
  `--space-lg` (mobile floor: `--space-md`, never smaller). The ≤480px
  overrides that collapse spacing to `--space-xs`/`--space-sm` are deleted.
- **Motion.** Transitions `150ms`/`300ms` with `--ease-out`. Hover = color
  shift + at most `translateY(-1px)`. Press = `translateY(1px)`. The
  below-fold per-section `fadeUp` stagger (delays up to 1.1s) is removed —
  one fade on the deck, 0.5s. Everything honors `prefers-reduced-motion`.
- **Text on glass** may use only `--ink`, `--ink-muted`, or `--ink-accent`.
  `--ink-faint` is allowed only for icons, dividers, and text ≥ 24px (it is
  a 3:1 token, not a 4.5:1 token). The legacy `--muted`/`--faint` tokens
  remain for the receded-sky interior pages only.
- **Sky files stay locked.** `Sky.astro`, `Starfield.astro`, `CloudBed.astro`,
  `CelestialGrab.astro`, `src/scripts/sky.ts` are not touched in any of these
  phases. `TimeOverride.astro` is explicitly named in Phase 15 for
  style-only edits.
- **Copy delta (VERBATIM, supersedes P1):** the hero secondary chip label
  `or email me` becomes `Email me`. Same mailto href. No other copy changes
  anywhere in these phases.

## The token block (exact; P12 adds this to `src/styles/global.css`)

```css
/* ── Surface system: one material, two inks ── */
:root {
  /* geometry */
  --r-lg: 24px;
  --r-md: 16px;
  --r-pill: 999px;
  --w-text: 640px;   /* hero panel + interior text columns */
  --w-deck: 760px;   /* the below-fold sheet */
  --w-nav: 680px;
  /* motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --t-fast: 150ms;
  --t-med: 300ms;

  /* night material + ink (SSR default; matches the default night palette) */
  --glass: rgb(21 17 13 / 0.60);
  --glass-edge: rgb(236 227 214 / 0.14);
  --glass-rim: rgb(255 255 255 / 0.08);
  --ink: #ECE3D6;
  --ink-muted: #C9BBA4;
  --ink-faint: #A5967D;
  --ink-accent: #E8B06A;
  --tint: rgb(236 227 214 / 0.05);
  --tint-edge: rgb(236 227 214 / 0.10);
}

html[data-ink='light'] {
  --glass: rgb(236 227 214 / 0.72);
  --glass-edge: rgb(21 17 13 / 0.16);
  --glass-rim: rgb(255 255 255 / 0.45);
  --ink: #221B12;
  --ink-muted: #3F3422;
  --ink-faint: #5C4F3B;
  --ink-accent: #5C3608;
  --tint: rgb(21 17 13 / 0.05);
  --tint-edge: rgb(21 17 13 / 0.12);
}
```

Notes that are part of the spec:

- `--lamp` is unchanged and remains the fill of the WhatsApp CTA in **both**
  ink modes (its label is `var(--bg)` — 8.4:1 on the lamp fill). `--ink-accent`
  is for accent *text* (links, hovers) and differs per mode because `--lamp`
  itself fails 4.5:1 as text on light glass.
- Glass recipe, used identically on every raised surface:
  `background: var(--glass); backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid var(--glass-edge); box-shadow: inset 0 1px 0
  var(--glass-rim);` (plus the `-webkit-` twin). Ink tokens transition with
  `transition: color var(--t-med) ease, background-color 800ms ease,
  border-color 800ms ease` on the surfaces so the day/night flip glides.
- Fallbacks (add in P12): under `@supports not (backdrop-filter: blur(1px))`,
  raise the glass alphas to 0.92; under
  `@media (prefers-reduced-transparency: reduce)`, same.

## The ink engine (exact; P12 creates `src/scripts/surface.ts`)

Replaces the *mechanism* of `scrim.ts` (which is deleted in **P13**, once its
last consumer is migrated). Behavior, precisely:

1. Listen to the existing public `sky-update` event (do not touch `sky.ts`).
2. From `e.detail.palette`, compute `L` = the maximum WCAG relative luminance
   of `{top, mid, bottom, cloudHi}` (reuse the sRGB→linear + luminance
   helpers from `scrim.ts`).
3. Hysteresis flip: if the current mode is dark and `L > 0.45`, set
   `document.documentElement.dataset.ink = 'light'`; if the mode is light and
   `L < 0.35`, set it back to `'dark'`. First event: `light` iff `L ≥ 0.40`.
   The band prevents flapping during dawn/dusk palette lerps.
4. `BaseLayout.astro` ships `<html … data-ink="dark">` so SSR and first paint
   are deterministic; `initSky()` fires `sky-update` immediately, so the
   correct mode lands before the hero animates in.

With the state palettes in `sky.ts` this yields: night 0.055 → dark; dusk
0.305 → dark; dawn 0.529, day 1.0, golden 0.63 → light. Pre-verified worst
cases (executor re-verifies empirically, see P12 acceptance): dark glass at
its brightest allowed sky (`L ≈ 0.45` mid-transition) keeps `--ink-muted`
≥ 4.9:1 and `--ink-accent` ≥ 4.9:1; light glass over the darkest day band
(sky top `#234571`, blended ≈ L 0.45) keeps `--ink` ≈ 7.5:1, `--ink-muted`
≥ 4.8:1, `--ink-accent` ≥ 4.7:1.

Pages with `skyMode="receded"` (work, about, writing) pin
`data-ink="dark"`: the receded filter dims the sky below the flip threshold
permanently, so the engine simply never flips there (verify, don't special-case
unless a flip is actually observed; if one is, gate the listener on
`body[data-sky-mode]`).

---

## Phase 12 — Material foundations: tokens, ink engine, nav

**Goal:** the two-ink system exists and the nav is rebuilt on it. The hero and
everything below are visually unchanged this phase (they still run on
`--scrim-alpha`; both scripts coexist until P13).

**Files:** `src/styles/global.css`; new `src/scripts/surface.ts`;
`src/layouts/BaseLayout.astro`; `src/components/Nav.astro`.

**Build:**
1. Add the token block above to `global.css`. Delete the entire
   "Sky readability" text-shadow block (`.nav, .threshold__person, … {
   text-shadow: … }`). Change the global `a:focus-visible` outline color to
   `var(--ink-accent, var(--lamp))`.
2. Create `surface.ts` exactly per "The ink engine". Wire it in
   `BaseLayout.astro` next to `initScrim()` (which stays until P13), and add
   `data-ink="dark"` to `<html>`.
3. Rebuild `Nav.astro`:
   - Geometry: `position: fixed; top: max(var(--space-md),
     env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
     width: min(var(--w-nav), calc(100vw - 2 * var(--space-md)));` —
     a detached floating object, never an edge-to-edge bar.
   - Material: the glass recipe, `border-radius: var(--r-pill)`, padding
     `6px 10px 6px 6px`.
   - Links: `color: var(--ink-muted); padding: 10px 14px; border-radius:
     var(--r-pill);` hover `color: var(--ink); background: var(--tint)`;
     active page `color: var(--ink); background: color-mix(in srgb,
     var(--ink) 10%, transparent)`. Tap targets ≥ 44px. Font stays
     `--text-sm` at all widths (delete the `--text-xs` shrink).
4. `npm run build`; then with the dev server + the time-override slider,
   sample nav link text/background pixels at forced hours 0, 6, 7, 12, 18,
   19, 21 and compute ratios.

**Acceptance:** build passes; `data-ink` flips exactly twice across a 24-hour
slider sweep (once around dawn, once after golden hour), with no flapping;
nav link contrast ≥ 4.5:1 at all seven sampled hours; no `text-shadow`
declarations remain anywhere in `src/` except none; hero/below-fold visually
unchanged; ratios recorded in the commit message body.

**On-phone checklist:** at 360px the nav is a centered pill with visible sky
on both sides; nothing overlaps it; links are comfortably tappable.

---

## Phase 13 — Hero recomposition (and the now-strip)

**Goal:** the hero becomes a thin, left-aligned glass panel that reads
top-to-bottom in one pass and stays that way at noon. `scrim.ts` is deleted.

**Files:** `src/pages/index.astro`; `src/components/NowCards.astro`;
delete `src/scripts/scrim.ts` (and its import/init in `BaseLayout.astro`).

**Build:**
1. `.threshold__mood` (the sky moment above the hero): `height:
   clamp(96px, 18vh, 30vh)` mobile, keep `30vh` ≥ 768px — the nav can never
   sit glued to the hero panel again.
2. `.threshold__person` becomes the glass recipe (drop the
   `--scrim-alpha` background and the 40px blur), `border-radius:
   var(--r-lg)`, `max-width: var(--w-text)`, padding `clamp(var(--space-xl),
   5vw, var(--space-2xl))`. Structure the contents as a flex column with
   `gap: var(--space-lg)` (`--space-md` ≤ 480px). Delete the ≤480px margin
   overrides.
3. Type, in order, all left-aligned, all measure-capped at `58ch`:
   - Name: `font-size: clamp(2.25rem, 5.5vw, 3.25rem); font-weight: 500;
     line-height: 1.05; letter-spacing: -0.015em; color: var(--ink);
     text-wrap: balance;` — no more centering, no more weight-300 wisp.
   - Tagline (`bio`): `--text-lg`, `color: var(--ink)` (it is the value
     proposition; it does not whisper).
   - Craft line: `--text-base`, `--ink-muted`, `line-height: 1.7`,
     `text-wrap: pretty`.
   - Looking line: keep the Fraunces italic, `--text-sm`, `--ink-muted`.
4. Stack pills: `font-size: var(--text-sm); padding: 4px 12px; gap:
   var(--space-sm); color: var(--ink-muted); background: var(--tint);
   border: 1px solid var(--tint-edge); border-radius: var(--r-pill)`. Ink-
   relative, so they can never be dark-on-dark again.
5. Action block:
   - Row 1: WhatsApp primary exactly as it is (fill `--lamp`, label color
     `var(--bg)`, 48px min-height, `--r-pill`, **no box-shadow, no
     text-shadow ever**; hover `background: color-mix(in srgb, var(--lamp)
     88%, white)` + `translateY(-1px)`; active `translateY(1px)`), then the
     secondary chip relabeled **VERBATIM** `Email me` (outline chip:
     `color: var(--ink); border: 1px solid var(--glass-edge)`; hover
     `background: var(--tint)`). At ≤480px both go full-width, stacked,
     primary first.
   - Directly under: `I reply within a day.` — `--text-sm`, `--ink-muted`.
   - A 1px `var(--tint-edge)` divider.
   - Meta row (wraps): the two router links left, then Résumé · GitHub ·
     LinkedIn as quiet links — all `--text-sm`, `color: var(--ink-muted)`,
     underline `color-mix(in srgb, var(--ink-accent) 40%, transparent)`,
     hover `color: var(--ink-accent)`.
   - Keep every `data-goatcounter-click` attribute and the wa.me
     `target`/`rel` exactly as they are.
6. Now-strip: keep the slim pill but on the glass recipe (`--r-pill`),
   content **left-aligned** (`justify-content: flex-start`), text
   `--ink-muted`, glyphs `--ink-faint`, Spotify glyph + equalizer
   `--ink-accent`. Keep the `:has(.now-strip[hidden])` collapse rule and the
   polling script untouched.
7. Delete `scrim.ts` and its wiring. Grep: no `--scrim-alpha` reference may
   survive anywhere in `src/`.

**Acceptance:** build passes; at forced noon the hero is visibly translucent
(sky readable through it — compare against a screenshot of the old slab);
every hero text node ≥ 4.5:1 (≥ 3:1 for the name) at hours 0, 6, 7, 12, 18,
19, 21; secondary chip reads `Email me`; no centered multi-line text on the
page; ratios in the commit body.

**On-phone checklist:** 360×740 first screen still answers who/what/CTA; the
WhatsApp chip is full-width and thumb-reachable; nothing is cramped — every
gap ≥ `--space-md`; slider to noon outdoors-bright: everything legible.

---

## Phase 14 — The deck: one spatial sheet below the fold

**Goal:** everything from Services to the footer lives on a single translucent
glass sheet ("the deck") floating over the sky — one material boundary instead
of eight floating fragments, one backdrop-filter instead of many, and the
suffocated section spacing replaced with a deliberate rhythm.

**Files:** `src/pages/index.astro`; `src/components/Services.astro`;
`src/components/ProjectCard.astro`; `src/components/ContactForm.astro`;
`src/components/Footer.astro`; `src/components/SocialLinks.astro`;
`src/components/Testimonials.astro` (token swap only; still flag-off);
`src/components/PostRow.astro` (token swap only).

**Build:**
1. In `index.astro`, delete the `.home` background gradient (the sky now
   shows the whole way down) and wrap every section after
   `.threshold__presence` — Services, Testimonials, Selected work,
   Experience, Community, Video, Writing, ContactForm, Footer — in
   `<div class="deck">`:
   `width: min(100%, var(--w-deck)); margin-inline: auto;` + the glass
   recipe + `border-radius: var(--r-lg); padding: clamp(var(--space-xl),
   5vw, var(--space-2xl)); display: flex; flex-direction: column; gap:
   var(--space-3xl);` Single `fadeUp` 0.5s on the deck; remove all
   per-section `fadeUp` animations and delays. Sections lose their own
   `max-width`/`margin-bottom` (the deck owns geometry).
2. Cards inside the deck (`.service-card`, `.project-card`,
   `.community-feature`) become flat tints — **no backdrop-filter inside the
   deck**: `background: var(--tint); border: 1px solid var(--tint-edge);
   border-radius: var(--r-md); padding: var(--space-xl);` hover
   `background: color-mix(in srgb, var(--ink) 9%, transparent);
   translateY(-1px); transition var(--t-med) var(--ease-out)`.
3. Mechanical color migration in every touched component: `--paper → --ink`,
   `--muted → --ink-muted`, `--faint` on text < 24px `→ --ink-muted`,
   `--lamp`-as-text `→ --ink-accent`, `--line → --tint-edge`, and all
   `rgba(30, 24, 19, …)` / `rgba(236, 227, 214, …)` literals → `--tint` /
   `--tint-edge`. Section labels (`.section-label`, uppercase) use
   `--ink-muted`.
4. ContactForm inputs: `background: var(--tint); border: 1px solid
   var(--tint-edge); border-radius: var(--r-md); color: var(--ink)`; focus
   `outline: 2px solid var(--ink-accent)`. Submit button: same outline-chip
   recipe as the hero's `Email me`.
5. Footer moves inside the deck as its final section: `border-top: 1px solid
   var(--tint-edge); padding-top: var(--space-xl)`; icons `--ink-muted`,
   hover `--ink-accent`. (The only divider in the deck — section separation
   is the `--space-3xl` gap, not lines.)
6. Keep untouched: all VERBATIM copy, all `data-goatcounter-click` attrs,
   the Web3Forms form mechanics, the testimonials flag logic, the
   experience/writing row markup.

**Acceptance:** build passes; exactly four `backdrop-filter` surfaces exist
on the homepage (nav, hero, now-strip, deck); at forced noon the deck is a
light frosted sheet with dark ink and at midnight a dark one with paper ink —
sky visible through it in both; every text node in the deck ≥ 4.5:1 at hours
0, 7, 12, 19 (labels and card meta included — nothing rides on `--ink-faint`);
no centered multi-line text; scroll from hero to footer shows no seam and no
flat-`--bg` dead zone.

**On-phone checklist:** 360px — deck hugs the viewport with slim sky gutters;
cards single-column, nothing crushed; section boundaries obvious from spacing
alone; LCP still ≤ 2.5s on Fast 4G throttle (the deck adds no JS and no
images).

---

## Phase 15 — Interior pages, floating chrome, and the QA sweep

**Goal:** the interior pages inherit the doctrine (alignment, radii, tokens
where trivial), the time-override nub stops colliding with content, and the
whole system gets one documented 24-hour QA pass.

**Files:** `src/pages/about.astro`; `src/pages/work/index.astro`;
`src/pages/work/[slug].astro`; `src/pages/writing/index.astro`;
`src/pages/404.astro`; `src/components/TimeOverride.astro` (**explicitly
named; style-only** — no logic changes); `src/styles/global.css` (one
variable); `src/layouts/BaseLayout.astro` (only if the receded-page ink pin
from "The ink engine" proved necessary).

**Build:**
1. `global.css`: add `--chrome-clearance: 88px` to `:root`.
2. The homepage deck and every interior page's bottom padding gain
   `calc(var(--space-3xl) + var(--chrome-clearance))` so no text can sit
   under the fixed bottom-right chrome at any viewport height.
3. `TimeOverride.astro`, style-only: restore nub and toggle shrink to 28px;
   the `nub-pulse` glow radii halve (max 14px spread); `bottom`/`right`
   become `max(var(--space-lg), env(safe-area-inset-bottom))` /
   `max(var(--space-lg), env(safe-area-inset-right))`; radius/border/colors
   move to the token family. Behavior, markup, and script stay untouched.
4. Interior pages: radii literals → the radius family; card/border literals →
   `--tint`/`--tint-edge`; confirm every multi-line text block is
   left-aligned; keep `--muted`/`--faint` text colors as-is (receded pages
   are pinned dark and already pass — this phase is not a rewrite).
5. The QA sweep, documented in the commit body:
   - Slider at every 3rd hour (0, 3, 6, 9, 12, 15, 18, 21) on `/`: sample
     nav, hero name, tagline, craft, reply line, a stack pill, a service-card
     body, a section label, footer icons. All AA.
   - 360px, 768px, 1280px: no horizontal scroll, no overlap between nav and
     hero, no text under the time-override nub.
   - Keyboard: tab through `/` — every interactive element shows the
     `--ink-accent` focus ring on both inks.
   - `prefers-reduced-motion`: no fadeUp, no equalizer, no nub pulse, sky
     static per existing behavior.
   - Fast 4G throttle: homepage transfer ≤ ~300 KB, LCP ≤ 2.5s.

**Acceptance:** build passes; all five QA bullets pass and are recorded; zero
files under the sky lock (`Sky.astro`, `Starfield.astro`, `CloudBed.astro`,
`CelestialGrab.astro`, `sky.ts`) appear in the diff; `TimeOverride.astro`'s
diff contains only `<style>` changes.

**On-phone checklist:** scroll to the bottom of `/` and `/about` — the nub
floats in clear space; double-tap the sun at noon and the moon at midnight —
drag still works exactly as before.

---

## Performance budget (applies to every phase)

- LCP ≤ 2.5 s on a mid-range phone on 4G. Test each phase with Chrome DevTools
  mobile emulation + "Fast 4G" throttling; homepage document + CSS + fonts +
  above-fold images ≤ ~300 KB transferred.
- No new runtime dependencies without the owner's explicit yes. (MapLibre is
  grandfathered, `/map` only.)
- Fonts: only the existing self-hosted Fraunces + DM Sans woff2 files. Add no
  font files, no font CDNs.
- Images: compressed, explicit `width`/`height`, `loading="lazy"` below fold.
- JS: additions per phase ≤ 5 KB unless the phase says otherwise (P11 exempt on
  `/map`).

## Owner's Sanity paste queue (collected)

After P3: Site Settings — `bio`, `craft`, `looking_for`, `stack`.
After P4: three `project` docs + two `experience` docs as written in P4;
unfeature/remove other projects.
After P5: Site Settings — `about_intro`, `about_gdg`, `about_interests`.
After P9: nothing (testimonials stay empty until real quotes exist).
Any time: delete the `now` document's reading fields' values (P6 stops
rendering them regardless).

## Carried over from the old build specs (not yet built)

`foothouse-build-spec.md` and `SPEC-2.md` are deleted (superseded by this
file and `CLAUDE.md`); everything in them has since shipped except one
thing, preserved here so the idea isn't lost:

**Real computed-refraction glass on the now-strip.** `src/scripts/glass.ts`
already implements the technique (Snell's-law refraction through a modeled
squircle dome, written to an SVG `feDisplacementMap`) but nothing calls its
`initGlass()` export yet — no component has the `[data-glass]` /
`.glass-refraction` / `.glass-sky-copy` / `.glass-highlight` markup it
expects. Notes from the old spec, still good if this gets built: apply to
the now-strip only, not everything else; load the displacement map as a
`blob:` URL, not a `data:` URI (Safari refuses those in `feImage`); give the
filter a fresh `id` on each rebuild (Safari caches by id); clip the
refraction source to the card's own box (Safari caps source size); run a
single displacement pass on Safari (skip the chromatic-fringe second pass)
to hold frame rate; default to the full effect on all devices, only fall
back to a cheap frosted approximation on measured runtime jank or
`prefers-reduced-transparency`.

## Open questions (non-blocking; answer whenever)

1. Are the Dysseo and debate-coach repos public? If yes, their URLs go into the
   P4 project docs (`repo_url`).
2. Résumé PDF: is the Sanity `resume` file current (graduate, correct stack)?
   The hero links to it.
3. X/Twitter link: keep `twitter.com/nekumartins` in SocialLinks, or drop X
   from the icon row?

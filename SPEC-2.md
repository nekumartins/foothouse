# SPEC-2: Foothouse corrective rebuild

Validated by dry-run (Phase 1 executed literally against the repo and passed build + guards) and line-by-line trace (Phases 2-8) on 2026-07-02; corrections v2.1 applied (drag-target gating, cloud seam wraps, JSON-LD is:inline, builder preflight).

This is the current build specification, approved by the owner (Neku) on 2026-07-02. It was designed in full ahead of time; the builder executes it phase by phase and does not design. **Where anything here conflicts with `foothouse-build-spec.md`, SPEC-2 wins.** Run one phase per session with the prompt: "Read SPEC-2.md and execute Phase N exactly. Do not deviate."

Background for each phase's WHY: the homepage community section was duplicated by a hardcoded fallback; copy signposted visitors around the site; the About page overexplained; recruiters could not see hireability at a glance; the sky's clouds and moon did not land; the map opened on the whole world because it fit bounds to world-spanning pins; Sanity photo uploads were one-at-a-time. Every fix below is exact.


## RULES FOR THE BUILDER (read before every phase)

- You are executing a finished design, not designing. Do not invent copy, sections, features, colors, or animations beyond what is written here. Copy marked VERBATIM is used character-for-character.
- No em dashes anywhere in site copy. No "Hire me" CTAs, availability badges, or stat counters. No sentences that tell the visitor what to do or where to go ("check out...", "the longer story is on...", "have a look around"). Links are labeled nouns, not instructions.
- Where this spec conflicts with `foothouse-build-spec.md`, this spec wins.
- Fonts (Fraunces + DM Sans), palette tokens in `src/styles/global.css`, and the warm-dark aesthetic are untouched.
- Respect `prefers-reduced-motion` in every animated thing you touch: animations off or a static frame.
- Build phases IN ORDER. After each phase: `npm run build` must pass; start the dev server with `astro dev --background` (see CLAUDE.md) and run that phase's acceptance checks; then commit to `main` with author `nekumartins <akpotohwoo@gmail.com>`, unsigned, no Co-Authored-By trailer, message given at the end of the phase; `git push -u origin main`.
- This environment cannot reach the live site, the Sanity API, or external image CDNs. Never add a runtime dependency on an external asset host.
- Existing utilities to reuse (do not re-implement): `youtubeEmbedUrl` in `src/lib/video.ts`; `withGithubStars` in `src/lib/github.ts`; `lerpColor`, `getCelestial`, `setOverrideHour`, `getOverrideHour` in `src/scripts/sky.ts`; queries in `src/lib/queries.ts`.

---

## PHASE 0: Builder preflight (run at the start of EVERY phase session)

1. Start from a fresh checkout of `origin/main`: `git fetch origin main && git checkout main && git merge --ff-only origin/main`.
2. Confirm the tip is the SPEC-2 docs commit or later (`git log --oneline -1`; if the tip predates SPEC-2, STOP: your clone is stale).
3. NEVER base work on branch `claude/foothouse-phases-3-6-mt70vs`. It is a stale June-29 clone; its only content already exists on main.
4. Confirm `git status` is clean before editing. All commits go directly to `main`.

---

## PHASE 1: Homepage. Hireable at first glance, one community block, zero signposting.

All edits in `src/pages/index.astro` unless stated.

### 1A. Hero
Current hero markup (`.threshold__person`) has name, `.threshold__tagline` (bio), `.threshold__thesis` (italic line). Changes:
1. DELETE the `.threshold__thesis` paragraph and its style block. The thesis sentence moves to the About page (Phase 2). Also delete the `thesis` const and the `thesis` field usage; REMOVE the `thesis` field from `src/sanity/schemas/siteSettings.ts` and from the `getSiteSettings` projection in `src/lib/queries.ts`.
2. ADD after the tagline paragraph, inside `.threshold__person`:
```astro
<p class="threshold__craft">I build AI systems, and I run GDG on Campus Babcock, one of Nigeria's premier tech communities.</p>
<nav class="threshold__reach" aria-label="Profiles and contact">
  {settings?.resume_url && <a href={settings.resume_url} target="_blank" rel="noopener noreferrer">Resume</a>}
  <a href={settings?.github || 'https://github.com/nekumartins'} target="_blank" rel="noopener noreferrer">GitHub</a>
  <a href={settings?.linkedin || 'https://linkedin.com/in/nekumartins'} target="_blank" rel="noopener noreferrer">LinkedIn</a>
  <a href={`mailto:${settings?.contact_email || 'akpotohwoo@gmail.com'}`}>Email</a>
</nav>
```
The craft line copy above is VERBATIM.
3. Styles:
   - `.threshold__craft`: font-family var(--font-body); font-size var(--text-base); color var(--paper); max-width 480px; margin var(--space-md) auto 0; line-height 1.6.
   - `.threshold__reach`: display flex; justify-content center; gap var(--space-lg); margin-top var(--space-lg).
   - `.threshold__reach a`: font-size var(--text-sm); color var(--muted); text-decoration underline; text-decoration-color rgba(224,164,88,0.3); text-underline-offset 0.15em; transition text-decoration-color 0.3s ease, color 0.3s ease. Hover: color var(--lamp); text-decoration-color var(--lamp).
   - These are quiet text links. Do NOT make them buttons, pills, or badges.

### 1B. Section order
Reorder the `<section>` blocks inside `.threshold` to exactly:
1. `threshold__mood` (unchanged)
2. `threshold__person` (hero, per 1A)
3. `threshold__projects` (moved UP, before now-cards). Change its `.section-label` text from `Projects` to `Selected work`.
4. `threshold__community` (per 1C)
5. Featured video section (added in Phase 4; leave a comment placeholder `<!-- featured video: Phase 4 -->`)
6. `threshold__presence` (now-cards, moved DOWN here)
7. `threshold__doors` (per 1D)
Then `<Footer />`.

fadeUp animation-delays: person 0.2s, projects 0.5s, community 0.7s, presence 0.9s, doors 1.1s. (Video gets 0.8s in Phase 4; when it ships, presence becomes 1.0s and doors 1.2s.)

### 1C. Community: one block, CMS only
In the frontmatter, DELETE the `fallbackFeatured` object entirely. Replace the featured/others logic with exactly:
```ts
const featured =
  involvements.find((i: any) => i.featured && i.story) ?? involvements[0] ?? null;
const otherInvolvements = featured
  ? involvements.filter((i: any) => i.id !== featured.id)
  : [];
```
Render the community section ONLY when `featured` exists (`{featured && (...)}`); when the CMS has zero involvements the section is absent, not replaced by hardcoded content.

The featured card becomes a whole-card link (no instruction sentence anywhere):
```astro
<a href="/about" class="community-feature">
  <h3 class="community-feature__title">{featured.title}</h3>
  {featured.role && <span class="community-feature__role">{featured.role}</span>}
  {(featured.story || featured.blurb) && (
    <p class="community-feature__story">{featured.story || featured.blurb}</p>
  )}
</a>
```
DELETE the `.community-feature__more` anchor and its styles. The string "The longer story" must not exist anywhere in the repo after this phase.
Style additions to the existing `.community-feature` rules: `display: block; text-decoration: none;` plus hover matching `.project-card`: background rgba(30,24,19,0.45) and border-color rgba(236,227,214,0.12), transition background 0.3s ease, border-color 0.3s ease. On hover, `.community-feature__title` color becomes var(--lamp) (same pattern as `.project-card:hover .project-card__name`).
Keep the `otherInvolvements` list rendering below the card unchanged.

### 1D. Doors: links, not instructions
Replace the whole `threshold__doors` section content with:
```astro
<section class="threshold__doors">
  <nav class="doors" aria-label="Rooms">
    <a href="/writing" class="doors__link">Writing</a>
    <a href="/map" class="doors__link">The map</a>
    <a href="/work" class="doors__link">Work</a>
  </nav>
</section>
```
DELETE the `threshold__invitation` paragraph and its styles. Styles: `.doors` display flex, justify-content center, gap var(--space-2xl) (var(--space-lg) under 480px). `.doors__link`: font-family var(--font-display); font-size var(--text-xl); color var(--paper); text-decoration none; border-bottom 1px solid rgba(224,164,88,0.25); padding-bottom 2px; transition color 0.3s ease, border-color 0.3s ease. Hover: color var(--lamp), border-color var(--lamp).

### Phase 1 acceptance
- `npm run build` green. In built HTML for `/`: hero shows tagline, craft line, and the reach links; `Selected work` label appears before the community section; exactly ONE element whose text mentions GDG when the CMS returns one GDG involvement (verify visually with dev server; the fallback path is code-deleted so also `grep -r "fallbackFeatured\|The longer story\|Have a look around" src/` returns nothing).
- At 390px viewport width, the Resume/GitHub/LinkedIn/Email links are visible without scrolling (screenshot to confirm).
- Commit: `feat: hireable hero with reach links, single CMS community card, doors as quiet links`

---

## PHASE 2: About page. Short, genuine, done.

Replace the content of `src/pages/about.astro` between the `<header>` and `<Footer />` with exactly this structure (keep BaseLayout wrapper, keep the `.about` container and `.video-embed` styles; delete unused section styles):

```astro
<section class="about__section">
  <p>I'm Chukwuneku Akpotohwo. Most people call me Neku. I'm a software engineer focused on AI, studying at Babcock University, and most of what I believe fits in one line: intelligence is built, not found.</p>
  <p>Since 2024 I've organized GDG on Campus Babcock, one of Nigeria's premier tech communities and the largest developer community on campus. We run summits, a publication, and a room where a thousand-something people teach each other things nobody assigned them.</p>
</section>

{aboutVideo && (
  <section class="about__video">
    <div class="video-embed">
      <iframe
        src={aboutVideo}
        title="Neku on GDG Babcock"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
  </section>
)}

<section class="about__section">
  <p>Off the clock I read cognitive psychology and take ideas apart until they stop reducing. I care about what grows minds, mine included, and what that looks like at the scale of a person, a community, a continent.</p>
</section>

<nav class="about__reach" aria-label="Profiles and contact">
  <a href={`mailto:${settings?.contact_email || 'akpotohwoo@gmail.com'}`}>Email</a>
  <a href={settings?.github || 'https://github.com/nekumartins'} target="_blank" rel="noopener noreferrer">GitHub</a>
  <a href={settings?.linkedin || 'https://linkedin.com/in/nekumartins'} target="_blank" rel="noopener noreferrer">LinkedIn</a>
  {settings?.twitter && <a href={settings.twitter} target="_blank" rel="noopener noreferrer">X</a>}
  {settings?.resume_url && <a href={settings.resume_url} target="_blank" rel="noopener noreferrer">Resume</a>}
</nav>
```
All three paragraphs are VERBATIM. DELETED (must not exist in repo after this phase): "This page is the longer version of that", the `id="gdg"` anchor, the "GDG Babcock" h2, "What I think about", "How I work on myself", "How this house is built", and all their paragraphs and styles. `.about__reach` styles: same link treatment as `.threshold__reach` in Phase 1A, but left-aligned (no justify-content center), gap var(--space-lg), margin-top var(--space-2xl).
Keep the `/colophon` → `/about` redirect in `astro.config.mjs`.

### Phase 2 acceptance
- Total visible prose on /about is three paragraphs (~120 words). `grep -r "How this house is built\|How I work on myself\|longer version of that" src/` returns nothing. Video renders inside the page when `about_video_url` is set (test by temporarily hardcoding a YouTube URL in dev, then reverting).
- Commit: `feat: about page cut to the true story`

---

## PHASE 3: SEO and identity. Crawlers must know who Chukwuneku Akpotohwo is.

1. `astro.config.mjs`: add `site: 'https://foothouse-nu.vercel.app',` (comment: `// TODO: change to the custom domain when there is one`). Install and add the sitemap integration: `npm i @astrojs/sitemap`, then `import sitemap from '@astrojs/sitemap';` at the top of the config and `integrations: [sitemap()]` in `defineConfig`.
2. `src/layouts/BaseLayout.astro`:
   - Props become `{ title: string; description?: string; skyMode?: 'full' | 'receded' }` with default description VERBATIM: `Chukwuneku 'Neku' Akpotohwo is an AI-focused software engineer at Babcock University. He builds intelligent systems and organizes GDG on Campus Babcock.`
   - In `<head>`, replace the hardcoded meta description with `{description}` and add: canonical `<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />`; `og:title` = title, `og:description` = description, `og:type` = website, `og:url` = canonical, `og:image` = `new URL('/avatar.png', Astro.site)`; `twitter:card` = `summary`.
3. Page titles/descriptions (pass as props; all VERBATIM):
   - `/` title: `Neku Akpotohwo, software engineer` description: the default above.
   - `/about` title: `About | Neku Akpotohwo` description: `Who Chukwuneku 'Neku' Akpotohwo is: AI-focused software engineer, organizer of GDG on Campus Babcock, writer.`
   - `/work` (index) description: `Selected software by Neku Akpotohwo: AI systems, tools, and the stories behind them.`
   - `/writing` description: `Essays by Neku Akpotohwo on engineering, philosophy, and how minds grow.`
   - `/map` description: `Places Neku Akpotohwo has lived, travelled through, and remembers well.`
4. JSON-LD on `/` only, in `index.astro`. The script tag MUST carry `is:inline` or Astro will try to process/bundle it: `<script type="application/ld+json" set:html={JSON.stringify(personLd)} is:inline />`. The object:
```ts
const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Chukwuneku Akpotohwo',
  alternateName: ['Neku Akpotohwo', 'Neku'],
  jobTitle: 'Software Engineer',
  description: "AI-focused software engineer and organizer of GDG on Campus Babcock.",
  affiliation: { '@type': 'CollegeOrUniversity', name: 'Babcock University' },
  url: 'https://foothouse-nu.vercel.app',
  email: `mailto:${settings?.contact_email || 'akpotohwoo@gmail.com'}`,
  sameAs: [
    settings?.github || 'https://github.com/nekumartins',
    settings?.linkedin || 'https://linkedin.com/in/nekumartins',
    settings?.twitter,
  ].filter(Boolean),
};
```
5. `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://foothouse-nu.vercel.app/sitemap-index.xml
```

### Phase 3 acceptance
- Built `/` HTML contains the JSON-LD block with `Chukwuneku Akpotohwo`, canonical link, og tags. `dist`/`.vercel` output contains `sitemap-index.xml`. Each page's built HTML has its own description.
- Commit: `feat: canonical SEO, Person JSON-LD, sitemap and robots`

---

## PHASE 4: Featured video slot returns (build for the future).

1. `src/sanity/schemas/siteSettings.ts`: add back `{ name: 'featured_video_url', title: 'Featured video URL', type: 'url', description: 'YouTube video featured on the homepage. Leave empty; the section only renders once set.' }` (place it just before `about_video_url`).
2. `src/lib/queries.ts` `getSiteSettings` projection: add `featured_video_url,` back.
3. `src/pages/index.astro`: import `youtubeEmbedUrl` from `../lib/video`; `const videoEmbed = settings?.featured_video_url ? youtubeEmbedUrl(settings.featured_video_url) : null;` Render at the Phase-1 placeholder position (between community and presence):
```astro
{videoEmbed && (
  <section class="threshold__video">
    <div class="video-embed">
      <iframe src={videoEmbed} title="Featured video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>
  </section>
)}
```
Styles: `.threshold__video` max-width 560px, width 100%, margin-bottom var(--space-3xl), fadeUp 1.2s ease both, delay 0.8s (and bump presence to 1.0s, doors to 1.2s). `.video-embed` exactly as in about.astro (position relative, padding-bottom 56.25%, border-radius 12px, overflow hidden, background var(--raised); iframe absolute inset 0, w/h 100%, border none). Add `.threshold__video` to the reduced-motion `animation: none` list.

### Phase 4 acceptance
- With no CMS value: zero iframes on `/`. With a URL temporarily hardcoded in dev: the embed renders between community and now-cards. Revert the hardcode.
- Commit: `feat: homepage featured video slot, CMS-gated for when the channel starts`

---

## PHASE 5: The sky, rebuilt to the Pluto reference. Cloud bed + crescent moon.

### 5A. Cloud palette plumbed through the existing sky engine (`src/scripts/sky.ts`, `src/styles/global.css`)
1. Extend `SkyPalette` to `{ top, mid, bottom, cloudHi, cloudLo }` and extend `SKY_STATES` with these EXACT values:
   - night: cloudHi `#3A4066`, cloudLo `#232849`
   - dawn: cloudHi `#E8B78C`, cloudLo `#7A5A6E`
   - day: cloudHi `#FFFFFF`, cloudLo `#A8C4DC`
   - golden: cloudHi `#F5C98A`, cloudLo `#9A6A52`
   - dusk: cloudHi `#B48AA6`, cloudLo `#4E3A66`
2. `getBlendedPalette` lerps all five colors (same transition windows). `applySky` additionally sets `--cloud-hi` and `--cloud-lo` on `document.documentElement`.
3. `global.css`: register `--cloud-hi` (initial `#3A4066`) and `--cloud-lo` (initial `#232849`) as `@property { syntax: '<color>'; inherits: true; }` and add them to the `html { transition: ... }` list with the same `var(--sky-ease, 6s) var(--sky-ease-fn, linear)` timing. They must also be zeroed by the existing reduced-motion `html { transition: none; }` rule (already covers all transitions on html).

### 5B. Delete the old clouds
Delete `src/components/Clouds.astro` and its import/usage in `src/layouts/BaseLayout.astro`. Nothing else imports it.

### 5C. New `src/components/CloudBed.astro`
Composition inside `.sky-container` (BaseLayout order): `<Sky />` then `<Starfield />` then `<CloudBed />` (clouds render IN FRONT of stars, like the reference).

Markup structure:
```astro
<div class="cloudbed" aria-hidden="true">
  <div class="cloudbed__layer cloudbed__layer--back"><!-- svg x2 --></div>
  <div class="cloudbed__layer cloudbed__layer--mid"><!-- svg x2 --></div>
  <div class="cloudbed__layer cloudbed__layer--front"><!-- svg x2 --></div>
  <svg class="cloudbed__floater cloudbed__floater--one" ...></svg>
  <svg class="cloudbed__floater cloudbed__floater--two" ...></svg>
</div>
```
Each `cloudbed__layer` contains the SAME inline SVG TWICE, side by side (this makes the drift loop seamless). Every SVG: `viewBox="0 0 800 200"`, `preserveAspectRatio="none"`, `width="100%" height="100%"` per copy; each copy `flex: 0 0 50%` inside a layer that is `display:flex; width:200%; height:100%;`.

The cloud bank inside each SVG is a filled silhouette: one `<rect>` base plus a row of `<circle>`s sharing ONE fill (`fill="url(#grad)"` where the layer's `<linearGradient id>` is unique per layer: `cb-back`, `cb-mid`, `cb-front`; gradient `x1=0 y1=0 x2=0 y2=1` with two stops: offset 0 `style="stop-color: var(--cloud-hi)"`, offset 1 `style="stop-color: var(--cloud-lo)"`). Because both copies of a layer share ids, put the `<defs>` only in the FIRST copy of each layer (ids are document-global).

EXACT geometry (cx, cy, r), do not randomize. Circles that overhang x=0 or x=800 have a wrap partner at cx±800 so the drift loop is seamless (the sliced part of an edge lump continues on the adjacent copy); include every circle listed, wrap partners too:
- BACK layer: rect x=0 y=118 width=800 height=82; circles: (40,120,34) (120,112,48) (210,120,30) (300,108,56) (395,118,38) (470,104,60) (570,116,42) (650,108,52) (740,118,36) (790,112,44) (-10,112,44)
- MID layer: rect x=0 y=116 width=800 height=84; circles: (30,124,40) (830,124,40) (130,110,58) (240,120,36) (330,102,64) (430,116,44) (520,100,66) (620,114,46) (710,104,58) (780,120,38) (-20,120,38)
- FRONT layer: rect x=0 y=114 width=800 height=86; circles: (20,126,44) (820,126,44) (140,108,66) (270,118,40) (380,98,72) (500,112,50) (610,96,70) (720,110,54) (790,122,42) (-10,122,42)

Floater clouds (small, high in the sky): `viewBox="0 0 140 60"`, silhouette = rect x=8 y=36 width=118 height=12 rx=6 + circles (24,36,18) (52,26,24) (84,32,20) (110,38,14), fill uses its own gradient with the same two var stops (ids `cb-f1`, `cb-f2`).

CSS (component-scoped):
```css
.cloudbed { position: absolute; inset: auto 0 0 0; height: clamp(140px, 22vh, 260px); overflow: visible; pointer-events: none; }
.cloudbed__layer { position: absolute; inset: 0; display: flex; width: 200%; height: 100%; }
.cloudbed__layer--back  { opacity: 0.5;  filter: blur(2px); animation: cb-drift 140s linear infinite; }
.cloudbed__layer--mid   { opacity: 0.75; filter: blur(1px); animation: cb-drift 100s linear infinite reverse; }
.cloudbed__layer--front { opacity: 0.95; animation: cb-drift 70s linear infinite; }
@keyframes cb-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.cloudbed__floater { position: fixed; width: 140px; height: 60px; opacity: 0.5; animation: cb-float linear infinite; }
.cloudbed__floater--one { top: 16%; animation-duration: 160s; animation-delay: -40s; }
.cloudbed__floater--two { top: 27%; width: 100px; height: 43px; opacity: 0.35; animation-duration: 220s; animation-delay: -130s; }
@keyframes cb-float { from { transform: translateX(-20vw); } to { transform: translateX(120vw); } }
@media (prefers-reduced-motion: reduce) { .cloudbed__layer, .cloudbed__floater { animation: none; } }
@media (max-width: 480px) { .cloudbed { height: clamp(110px, 16vh, 180px); } }
```
Do NOT add any JS to this component. Day/night coloring is entirely the `--cloud-hi/--cloud-lo` vars from 5A (they already crossfade continuously with the sky).

### 5D. Crescent moon (`src/components/Sky.astro`)
Replace the ENTIRE current moon SVG (disc + craters + turbulence grain + their defs) with this exact SVG inside `.celestial__moon` (keep the wrapper div, its `opacity: var(--moon-opacity, 0)`, and the `overflow: visible` on the svg):
```html
<svg viewBox="0 0 46 46" width="46" height="46" aria-hidden="true">
  <defs>
    <radialGradient id="fh-moon-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(237, 234, 224, 0.16)" />
      <stop offset="50%" stop-color="rgba(210, 212, 225, 0.07)" />
      <stop offset="100%" stop-color="rgba(210, 212, 225, 0)" />
    </radialGradient>
    <mask id="fh-crescent">
      <circle cx="23" cy="23" r="16" fill="#fff" />
      <circle cx="29.5" cy="18.5" r="14.5" fill="#000" />
    </mask>
  </defs>
  <circle cx="23" cy="23" r="30" fill="url(#fh-moon-glow)" />
  <circle cx="23" cy="23" r="16" fill="#EDEAE0" opacity="0.9" mask="url(#fh-crescent)" />
</svg>
```
(Glow stays inside the SVG. Never use box-shadow for it; see `.claude/lessons/svg-glow-not-box-shadow.md`.) The sun element is unchanged. The crossfade CSS vars and positioning are unchanged.

### Phase 5 acceptance
- Dev server at noon (override slider to 12): white-topped cloud bank along the bottom, blue sky, floaters drifting slowly. At 23:00: navy cloud bank (`#3A4066`→`#232849` tones), stars ABOVE the bank still visible in the open sky, clean glowing crescent. Scrub the slider slowly from 12→23 and watch the cloud colors follow the sky continuously.
- OS reduced-motion: cloud layers static, sky static.
- Screenshot day + night at 1280x900 and 390x844.
- Commit: `feat: illustrated cloud bed and crescent moon, the sky reads like a scene`

---

## PHASE 6: The moat gimmicks. Drag the sun. Wish on the sky.

### 6A. Drag the sun/moon to move time (`src/scripts/sky.ts` + `src/components/Sky.astro`)
1. `sky.ts`: in `initSky`, change `parseInt(saved, 10)` to `parseFloat(saved)` (fractional override hours). Export a new pure function:
```ts
export function hourFromX(xPercent: number, isNight: boolean): number {
  const p = Math.max(0, Math.min(1, isNight ? (92 - xPercent) / 84 : (xPercent - 8) / 84));
  if (!isNight) return SUN_RISE + p * (SUN_SET - SUN_RISE);
  return (SUN_SET + p * (SUN_RISE + 24 - SUN_SET)) % 24;
}
```
2. `Sky.astro`: the `.celestial` container keeps `pointer-events: none`. Add `cursor: grab;` to `.celestial__body` and, while dragging (class `is-dragging`), `cursor: grabbing`. Give each body a bigger touch target: `.celestial__body::before { content: ''; position: absolute; inset: -12px; }`.
   CRITICAL, do not skip: the sun and moon occupy IDENTICAL coordinates at all times (they crossfade in place), and the moon is the later sibling, so it sits on top. If both had `pointer-events: auto`, a daytime visitor grabbing the sun would actually grab the invisible moon and get the night hour mapping (dragging right would move time backwards through the night). Therefore do NOT put `pointer-events: auto` in the CSS. Instead, the script (step 3) toggles pointer-events per body so only the VISIBLE body is grabbable.
3. Add a `<script>` to `Sky.astro`:
```ts
import { setOverrideHour, hourFromX } from '../scripts/sky';

// Only the visible body may be grabbed (see step 2 for why).
const sun = document.querySelector<HTMLElement>('.celestial__sun');
const moon = document.querySelector<HTMLElement>('.celestial__moon');
function syncGrabTargets() {
  const root = getComputedStyle(document.documentElement);
  const sunVisible = parseFloat(root.getPropertyValue('--sun-opacity') || '0') > 0;
  if (sun) sun.style.pointerEvents = sunVisible ? 'auto' : 'none';
  if (moon) moon.style.pointerEvents = sunVisible ? 'none' : 'auto';
}
window.addEventListener('sky-update', syncGrabTargets);
syncGrabTargets();

const bodies = document.querySelectorAll<HTMLElement>('.celestial__body');
let lastTap = 0;
for (const body of bodies) {
  body.addEventListener('pointerdown', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) { setOverrideHour(null); lastTap = 0; return; } // double tap resets to real time
    lastTap = now;
    body.setPointerCapture(e.pointerId);
    body.classList.add('is-dragging');
    const isNight = body.classList.contains('celestial__moon');
    const move = (ev: PointerEvent) => {
      const x = (ev.clientX / window.innerWidth) * 100;
      setOverrideHour(hourFromX(x, isNight));
    };
    const up = () => {
      body.classList.remove('is-dragging');
      body.removeEventListener('pointermove', move);
      body.removeEventListener('pointerup', up);
      body.removeEventListener('pointercancel', up);
    };
    body.addEventListener('pointermove', move);
    body.addEventListener('pointerup', up);
    body.addEventListener('pointercancel', up);
  });
}
```
No tooltips, no hint text, no onboarding: the cursor change is the only invitation.
4. `src/components/TimeOverride.astro`: in its existing `sky-update` listener, also sync the slider while the panel is open: `if (!panel.hidden) { slider.value = String(Math.round(e.detail.hour)); label.textContent = formatHour(Math.round(e.detail.hour)); }`.

### 6B. Tap the night sky for a shooting star (`src/components/Starfield.astro`)
1. Change `spawnShootingStar()` to `spawnShootingStar(x?: number, y?: number, golden = false)`: use given coords when provided (else current random logic); store `golden` on the shootingStar object; when drawing, `strokeStyle` = golden ? `rgba(224, 164, 88, ${alpha * 0.9})` : the current color.
2. Add after the existing listeners:
```ts
let lastWish = 0;
document.addEventListener('click', (e) => {
  if (prefersReducedMotion || !visible()) return; // night only
  const t = e.target as HTMLElement;
  if (t.closest('a, button, input, textarea, select, iframe, [role], .now-cards, nav, .celestial__body')) return;
  const now = Date.now();
  if (now - lastWish < 1500) return;
  lastWish = now;
  spawnShootingStar(e.clientX, e.clientY, Math.random() < 1 / 7);
  start();
});
```
No copy anywhere announces this. It is found, not explained.

### Phase 6 acceptance
- Dev server: hover the sun → grab cursor; drag it right → sky moves toward evening live and crisply (override ease 0.12s already handles this); release → stays; double-click the sun → returns to real time; slider (when open) tracks the dragged hour. On a touch viewport (devtools emulation) the same works by finger.
- Grab-target gating: scrub to 12:00 and drag the sun RIGHT; time must advance toward golden hour, never jump into the night range (if it does, the invisible moon is intercepting the drag; re-check step 2/3). Scrub to 23:00 and confirm the moon drags with the night mapping. Ending a moon drag must NOT spawn a shooting star.
- At 23:00, clicking empty sky spawns a shooting star from the click point; clicking a project card does not; two fast clicks spawn only one; roughly 1 in 7 stars is lamp-gold. In daytime clicks do nothing.
- Reduced motion: no dragging harm (drag still allowed, transitions instant), no click-stars.
- Commit: `feat: drag the sun to move time, wish on the night sky`

---

## PHASE 7: The map opens on home, like Snapchat opens on you.

`src/components/LifeMap.astro`, inside `initMap()`:
1. DELETE the bounds computation and the `...(bounds ? { bounds, fitBoundsOptions... } : ...)` constructor spread from the previous pass.
2. Replace with:
```ts
const byDate = [...places].sort((a, b) => String(b.arrived_on ?? '').localeCompare(String(a.arrived_on ?? '')));
const home = places.find((p) => p.kind === 'home') ?? byDate[0] ?? null;
```
Constructor options: `center: (home ? [home.lng, home.lat] : [3.3792, 6.5244]) as [number, number], zoom: 10,` keeping `minZoom: 2, maxZoom: 15`, the DPR-aware `tileUrl`, `attributionControl: false`, and the IntersectionObserver lazy-init exactly as they are. (Keep the `as [number, number]` cast; without it the editor flags LngLatLike and a literal reading may invite an unwanted "fix".)
3. There must be NO `fitBounds` call anywhere in the file. Intended behavior, not a bug: the map never reframes itself; a visitor reaches the other continents by panning and zooming out, exactly like Snapchat opens on you and lets you wander.

### Phase 7 acceptance
- With multi-continent test places injected in dev (temporarily hardcode 3 places incl. one `kind:'home'` in Lagos, one in Prague, one in Nairobi), the first rendered frame is Lagos at city scale; the world is never shown on load; panning/zooming out reaches the other pins; network tab shows no tiles below z8 on load. Revert the hardcode.
- Commit: `fix: map opens on the home pin at city scale, never the world`

---

## PHASE 8: Sanity photos upload in batches.

1. `src/sanity/schemas/place.ts`: replace the `media` array member (currently an object wrapping `image` + caption + taken_on) with a plain image type:
```ts
{
  name: 'media',
  title: 'Photos',
  description: 'Drag several photos in at once; captions can be added after.',
  type: 'array',
  of: [
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'caption', title: 'Caption', type: 'string' },
        { name: 'taken_on', title: 'Taken on', type: 'date' },
      ],
    },
  ],
},
```
2. `src/lib/queries.ts` `getPlaces` Sanity branch: make the projection tolerate BOTH shapes (old object entries keep working, no migration required):
```groq
"place_media": media[]{
  "url": coalesce(asset->url, image.asset->url) + "?w=1200&auto=format",
  caption
}
```
(The existing `.filter((m) => m.url)` in JS already drops malformed entries; `coalesce` on a null base returns null so old/new both resolve.)
3. Note for the owner in the commit body: existing photo entries keep rendering; the Studio may flag old entries as a legacy type when editing that array; re-adding those few photos (now in batches) clears it.

### Phase 8 acceptance
- `npm run build` green. In Sanity Studio (owner verifies after deploy): dragging 5 files onto Photos creates 5 entries in one drop.
- Commit: `feat: batch photo uploads for places; queries accept old and new media shapes`

---

## FINAL SWEEP (part of Phase 8's session)
- `grep -rn "—" src/ --include='*.astro' --include='*.ts'` → no hits in user-visible copy (code comments exempt but prefer none).
- `grep -rn "longer story\|Have a look around\|How this house is built\|longer version of that\|fallbackFeatured" src/` → zero hits.
- Full Playwright pass mirroring each phase's acceptance list; screenshots of `/` (day + night, desktop + 390px), `/about`, `/map`.
- `npm run build` green; push.

---

## Copy registry (the ONLY owner-voice strings the builder may add, all defined above)
1. Hero craft line. 2. About paragraphs 1-3. 3. Meta descriptions + titles (Phase 3). 4. Schema field descriptions. 5. Link labels: Resume, GitHub, LinkedIn, Email, X, Writing, The map, Work, Selected work. Everything else on the site comes from the CMS. If a needed string is missing from this registry, STOP and ask the owner; do not write it yourself.

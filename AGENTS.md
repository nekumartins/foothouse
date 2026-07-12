# CLAUDE.md — nekumartins.dev

Conventions for the executor. Read every session, then execute exactly one
phase from `PLAN.md`. PLAN.md is the single source of copy and scope — do not
design, do not invent copy, do not build ahead. Where anything conflicts with
the older `foothouse-build-spec.md` / `SPEC-2.md`, **PLAN.md wins** (their
design system and sky rules still apply; their anti-recruiter/anti-CTA product
stance is superseded).

## What this site is

Neku's business card. Two audiences from one homepage: (A) Nigerian
small-business owners on phones on paid data, converting via **WhatsApp**
(`wa.me/2348101694302`); (B) recruiters/engineers deciding on evidence.
Deployed on Vercel free tier, moving to **nekumartins.dev**.

## Stack & commands

- Astro 7, `@astrojs/vercel` adapter (pages prerender; only `/api/*` routes are
  serverless). Node >= 22.12. No test suite — the verify step is `npm run build`
  plus the phase's acceptance checks.
- Dev server: `astro dev --background` (manage with `astro dev stop` /
  `status` / `logs`). Build: `npm run build`.
- **Content lives in Sanity** with hard-coded fallbacks in the pages. Sanity
  overrides fallbacks, so every copy change means: update the fallback strings
  in code to PLAN.md's exact copy; the owner pastes the same strings into
  Sanity Studio (paste blocks are in PLAN.md). Schema changes additionally need
  a Studio redeploy — the GitHub Action in `.github/workflows/deploy-studio.yml`
  (see `STUDIO.md`).
- Contact details are code constants in `src/lib/site.ts` (after Phase 1) —
  never source the WhatsApp number or email from Sanity.
- This environment cannot reach the live site, the Sanity API, or external
  image CDNs. Never add a runtime dependency on an external asset host.

## Design system

- Tokens live in `src/styles/global.css` — palette (`--bg #15110D`, `--paper
  #ECE3D6`, `--muted`, `--faint`, `--lamp #E0A458`, `--ember`), type scale,
  spacing. Never hard-code a value a token covers.
- Fonts: Fraunces (display) + DM Sans (body), self-hosted woff2 in
  `public/fonts/`. Add no fonts, no font CDNs.
- The **living sky** is the brand: `Sky.astro`, `Starfield.astro`,
  `CloudBed.astro`, `CelestialGrab.astro`, `TimeOverride.astro`,
  `src/scripts/sky.ts`. Refine around it; never modify these files unless the
  phase explicitly names them. Day/night both ship: check every visual change
  at forced noon and forced midnight via the time-override slider.
- Respect `prefers-reduced-motion` in anything animated.
- Accessibility: WCAG AA (4.5:1 body text, 3:1 large text/icons) in **both**
  day and night sky states.

## Voice & facts

- Plainspoken, concrete, a bit literary, direct. Beginner-legible for the
  business audience; specific for the technical one.
- **Banned words** in site copy: scalable, solutions, passionate, premier,
  cutting-edge, purposeful. No corporate filler. No em dashes in site copy.
- Casing: FastAPI, PostgreSQL, TypeScript, WhatsApp, Paystack, Flutterwave,
  GitHub.
- Neku is a **graduate** (Babcock University, July 2026) — never "studying",
  never "student".
- Only claims from PLAN.md §1 (facts allowlist) may appear on the site. Real
  numbers only. Dysseo is always "building now", never shipped.
- No prices anywhere on the site. "Fixed quote before we start" is the pricing
  line.

## Performance budget (visitors pay per MB)

- LCP <= 2.5 s on a mid-range phone on 4G (DevTools mobile + Fast 4G throttle).
- JS added per phase <= 5 KB unless the phase says otherwise. MapLibre loads on
  `/map` only.
- Images compressed, explicit `width`/`height`, lazy below the fold.
- Homepage transfer (doc + CSS + fonts + above-fold images) <= ~300 KB.

## Git

- Commit **directly to `main`**, push `git push -u origin main`. No feature
  branches, no PRs.
- Author: `nekumartins <akpotohwoo@gmail.com>`. Unsigned. **No Co-Authored-By,
  no AI/Claude attribution, no session links** in commits or anywhere in the
  repo.
- One phase = one commit (plus a fix-up commit if acceptance checks catch
  something). Message: short imperative summary of the phase.

## Never do

- Never fabricate content: no invented testimonials, metrics, clients, roles,
  or dates. Testimonials ship empty behind the flag until real quotes exist.
- Never add a dependency (npm or CDN) without the owner's explicit yes.
- Never touch the sky/animation files unless the phase names them.
- Never bury or demote the WhatsApp CTA; it is the primary action on the site.
- Never put secrets in the repo; keys that are publishable by design
  (GoatCounter code, Web3Forms access key) are the only literals allowed.
- Never rewrite PLAN.md copy — if something seems wrong, stop and ask the
  owner instead of improvising.
- Never remove Sanity, Supabase, or the `/api` routes — owner decided they
  stay.

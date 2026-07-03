# SVG sizing: iOS Safari needs an explicit CSS aspect-ratio, and `width="auto"` is not a valid SVG attribute

When an inline SVG is sized with CSS `height: 100%; width: auto`, Chrome derives the
intrinsic ratio from the `viewBox`, but iOS Safari does not, so the SVG stretches to
its container width and circles become ovals. Also, `width="auto"` as an SVG
*attribute* is invalid per spec (ignored, defaults to 100%), which silently
reinforces the stretch.

Fix that removed the failing mechanism entirely (CloudBed.astro, SPEC-4 B2):

- Remove any `width="auto"` attribute from the `<svg>` element.
- Set the ratio explicitly in CSS: `svg { height: 100%; width: auto; aspect-ratio: <vbW> / <vbH>; }`
  (e.g. `aspect-ratio: 2000 / 160` for the cloud layers, `140 / 60` for floaters).

Why it mattered: the desktop oval fix (discrete fixed-aspect SVGs) looked correct in
headless Chromium at mobile viewports, but the owner still saw ovals on his phone,
because the bug was a Safari-specific intrinsic-ratio derivation, not a viewport-width
issue. Emulated verification cannot catch engine differences; the durable fix is to
never rely on viewBox-derived ratios for CSS-sized SVGs.

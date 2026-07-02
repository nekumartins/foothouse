# A CSS box-shadow glow around a soft-edged SVG disc leaves a dark seam ring; bake the glow into the SVG instead.

Found while verifying the moon rework: the disc's radial gradient fades out around r=21 inside a 46px circle div, but an outset box-shadow only paints outside the border-box (r=23). The unpainted band between them read as a dark outline at night. Fix that held: remove the box-shadow, give the inline SVG `overflow: visible`, and draw a larger glow circle (r=36, its own radial gradient) behind the disc. Verified with 4x close-up screenshots before/after.

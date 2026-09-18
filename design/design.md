---
name: "Paper Chaos"
version: "alpha"
description: "Collage-energy surfaces made of paper, stickers and real-world photography, wrapped around a functional layer that stays boringly legible."
colors:
  # --- Foundation (the calm layer) ---
  background: "#F4EFE4"        /* uncertain: sampled from ref-1 app canvas, warm uncoated paper */
  surface: "#FBF7F0"           /* uncertain: sampled from ref-1 card fill, one step lighter than canvas */
  surface-inverse: "#121212"   /* uncertain: sampled from ref-2 auth buttons, near-black not pure */
  ink: "#4A3B2E"               /* uncertain: sampled from ref-1 body + headline text, warm brown-black */
  ink-muted: "#8A7A69"         /* derived: ink lightened ~30% for captions and metadata */
  ink-inverse: "#FBF7F0"       /* text on surface-inverse */
  border: "#DDD2C0"            /* uncertain: estimated from ref-1 card edges and button outlines */
  # --- Accents (the 10%) ---
  primary: "#C8901A"           /* adjusted: ref-1 sticker yellow #E8B62C failed 4.5:1 on background (2.1:1); darkened for text/CTA use. Keep #E8B62C for decorative fills only. */
  primary-raw: "#E8B62C"       /* uncertain: original sampled sticker yellow, decorative layer only */
  accent-green: "#3E6B4A"      /* uncertain: sampled from ref-1 book sticker */
  accent-pink: "#E87FA8"       /* uncertain: sampled from ref-1 goat sticker, decorative only */
  accent-red: "#D0392F"        /* adjusted: ref-1 badge red #E0443B reads 3.6:1 on cream; darkened to 4.6:1 */
  accent-acid: "#B4D400"       /* adjusted: ref-2 neon green #C6F542 is a fill colour only — never text */
  accent-orange: "#E85A1C"     /* uncertain: sampled from ref-2 keychain */
  # --- Photographic backdrop ---
  sky: "#7FB8E0"               /* uncertain: sampled from ref-2 sky photograph mid-tone */
  sky-pale: "#DCEBF5"          /* uncertain: sampled from ref-1 marketing backdrop */
typography:
  display:
    fontFamily: "Sharp Grotesk, Inter Tight, Helvetica Now Display, sans-serif"  /* proposed: ref-2 uses a tight heavy grotesk, exact family not legible */
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "1.05"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, Nunito Sans, sans-serif"  /* uncertain: ref-1 headline reads as a rounded geometric humanist sans */
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, Nunito Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "1.3"
  body:
    fontFamily: "Poppins, Nunito Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.5"
  caption-mono:
    fontFamily: "iA Writer Quattro, JetBrains Mono, ui-monospace, monospace"  /* uncertain: ref-1 timers and metadata are clearly monospaced */
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.4"
    letterSpacing: "0.01em"
  marker:
    fontFamily: "Caveat, Architects Daughter, cursive"  /* proposed: ref-1 handwritten overlay, decorative only */
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "1.3"
rounded:
  none: "0px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  button-primary:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  sticker:
    backgroundColor: "{colors.primary-raw}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px"
  toast-invite:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  photo-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px"
---

## Overview

Archetype: **Analogue Collage Interface** — a scrapbook page that happens to be a working app.

Three pillars hold it up.

**Chaos is a layer, not a system.** Both references separate a decorative plane from a functional one. In ref-1 the sticker row tilts, overlaps and bleeds past its container, while the card beneath it sits square, cream and calmly typeset. In ref-2 the neon keychains and price tags float over a photograph, and the two sign-in buttons sit dead-centre, pure black, perfectly aligned. Nothing in the chaos layer carries information the user needs. That is the rule that makes the style safe: put the mess above and behind, never inside the path a user has to read.

**Everything looks printed, not rendered.** Cream stock instead of white, ink-brown text instead of #000, riso-style flat colour with grain, stamp and sticker edges rather than clean vectors. Drop shadows behave like paper lifting off paper — short, soft, warm-tinted — not like glass floating in space.

**Real objects, real photographs.** Ref-2 leans on a literal photograph of sky, physical keychains, crumpled banknotes, a real Visa card. Ref-1 uses actual shop photos and a real face in a sticker cut-out. This is the antidote to generic illustration: use photography of things that exist, cut them out, and let them sit at odd angles.

The tension worth naming: this style earns attention, then has to repay it with clarity. Delight lives in the ornament. Legibility is non-negotiable in the content.

## Colors

The 60/30/10 read across both references:

- **60% foundation** — `background` (warm paper) or a photographic backdrop such as `sky`. Ref-1 runs cream, ref-2 runs a sky photo. Both are quiet, low-contrast, and hold everything else.
- **30% supporting** — `surface` cards, `ink` and `ink-muted` type, `border` hairlines, `surface-inverse` for primary buttons. This tier is achromatic-warm on purpose so the accents can shout.
- **10% accent** — the sticker palette: `primary-raw`, `accent-green`, `accent-pink`, `accent-red`, `accent-acid`, `accent-orange`. Used in many hues at once but in tiny total area. That multiplicity is what reads as collage; restrict the *area*, not the *count*.

Two colour classes, and mixing them is the main failure mode:

- **Decorative fills** (`primary-raw`, `accent-pink`, `accent-acid`) live inside stickers and graphics. They never carry text at small sizes and never signal state.
- **Functional colours** (`primary`, `accent-red`, `ink`, `surface-inverse`) carry meaning and pass contrast. `primary` is the darkened yellow; `accent-red` the darkened badge red.

Contrast pass results: `ink` on `background` clears AA comfortably at roughly 9:1. `ink-inverse` on `surface-inverse` is near-maximum. The raw sticker yellow failed against cream at about 2.1:1, so `primary` was darkened for any text or interactive use, with the original kept as a decorative-only token. The neon green from ref-2 is fill-only; it fails against every light surface here.

Dark mode: invert to a charcoal paper (`#1E1A16`) rather than the near-black button colour, keep the same accents, and lift the sticker layer's saturation slightly so it does not muddy. The photographic backdrop approach transfers directly — swap a day sky for a night one.

## Typography

Three voices, one hierarchy.

**Display** carries the poster moments — ref-2's "YOUR BANK WON'T DO THIS": heavy tight grotesk, uppercase, negative tracking, lines stacked with almost no leading. Use it for hero statements and nothing else.

**Headline / title / body** is one rounded humanist family doing the actual work. Ref-1 sets its screen titles and descriptions in a single soft geometric sans at two or three weights. Body stays at 16px minimum and 1.5 line-height regardless of how loud the surrounding page gets.

**Caption-mono** is the small-print signature of the paper aesthetic — ref-1 sets the countdown timer, stop count and byline in monospace. It reads as a receipt or a stamp. Keep it at 14px and above; monospace at 12px in a busy layout is where this style breaks.

**Marker** is handwriting and it is decoration. Ref-1's "Join me at Ritual Coffee!" pairs a handwritten line with a set-type button. Never set a label, value, error or instruction in it.

Pairing rule: exactly one display face and one text face per screen. The collage supplies visual variety already; a third typeface tips it into noise.

## Layout

An 8-point grid governs the functional layer strictly — 4, 8, 16, 24, 32, 48, 64. Card padding is 24px, stacked elements sit 16px apart, sections 32px.

The decorative layer ignores the grid on purpose. Stickers rotate between −12° and +12°, overlap by 20–40% of their width, and are allowed to bleed past container edges. Randomise placement within bounds; do not distribute them evenly, because even spacing reads as a pattern rather than a pile.

Single-column mobile, full-bleed edges for photography and sticker rows, 16px gutters for text. Ref-1's horizontally-scrolling sticker strip is a good pattern: the strip runs edge to edge while its caption and title respect the gutter.

On wider screens, keep content in a 640–720px column and let the chaos layer spread across the full viewport behind it. Do not widen the reading measure just because space exists.

## Elevation & Depth

Paper lifting off paper, three levels:

1. **Resting card** — `0 1px 2px rgba(74, 59, 46, 0.08)`. Barely there; the card reads as a sheet lying flat.
2. **Floating element** (toasts, overlay invites, the sticker layer) — `0 4px 12px rgba(74, 59, 46, 0.14)`. Slightly longer and warmer, as if the sheet is peeled up at one corner.
3. **Modal / sheet** — `0 12px 32px rgba(74, 59, 46, 0.18)`.

Shadows derive from `ink`, never pure black. On a photographic backdrop such as ref-2's sky, derive from a darkened sample of the photo instead so the shadow sits in the same light.

Depth also comes from occlusion, which matters more here than blur: a sticker half-covering a card edge does more work than any shadow. Ref-1's sticker row overlapping the card boundary is the clearest example. Use z-order and overlap as the primary depth cue, shadow as reinforcement.

No glassmorphism, no backdrop blur. Paper is opaque.

## Shapes

Two shape languages, held apart deliberately.

**Functional shapes are generously rounded and regular.** Cards at 24px, photo tiles and inputs at 16px, small chips at 8px, buttons fully rounded at 999px. Ref-1's "Start" button and ref-2's sign-in buttons are both full pills — that is the primary-action shape in this system.

**Decorative shapes are irregular and unrounded.** Stickers keep die-cut silhouettes, stamp perforations, torn edges and hand-drawn outlines. Radius does not apply to them at all; a sticker with a 16px corner radius looks like a button and breaks the illusion.

Edges should carry texture. Flat vector rectangles look wrong against this palette — add grain, a slight ink bleed, or a rough outline to anything meant to read as printed.

## Components

**Card** — `surface` fill on `background`, 24px padding, 24px radius, resting shadow. Optional sticker row breaking the top edge. Content inside stays strictly aligned and left-set.

**Button (primary)** — full pill, `surface-inverse` fill, `ink-inverse` label, 16px vertical and 32px horizontal padding, minimum 48px tall. Ref-2 proves the pattern: the loudest screen in the set still uses a plain black button, because that is the one thing the user must not miss.

**Button (secondary)** — full pill, `surface` fill with a 1px `border` stroke, `ink` label. Ref-1's "Start" button.

**Sticker** — decorative only, 0 radius, rotated, never interactive, never a control, always `aria-hidden`.

**Toast / invite** — `surface` fill at 24px radius, floating shadow, avatar cut-out, handwritten line paired with a solid pill button. The message can be handwritten; the action cannot.

**Photo tile** — the photograph sits in a `surface` frame with 8px padding, like a print with a white border. Stickers may overlap the frame.

States: hover lifts one shadow level and rotates decorative elements 1–2° — motion of the paper, not colour change. Focus uses a 2px `ink` ring offset 2px, never a coloured glow. Disabled drops to 40% opacity and removes the shadow entirely, so the element reads as flat on the page.

Touch targets stay at 48px minimum. The decorative layer must never intercept taps — `pointer-events: none` on the whole sticker plane.

## Do's and Don'ts

**Do** keep every sticker, keychain and handwritten note outside the reading path — above the card, behind the button, bleeding off the edge — the way ref-2 keeps the sign-in buttons in a clean vertical stack while the neon objects orbit them.

**Do** set body copy on `surface` (#FBF7F0) rather than directly on a photograph. Ref-1 does this everywhere; ref-2 gets away with text on sky only because the type is enormous and black.

**Do** use the darkened `primary` (#C8901A) for any yellow that carries text or state, and keep `primary-raw` (#E8B62C) for sticker fills. They look like the same colour at a glance and behave completely differently.

**Do** pair a handwritten or monospace line with a set-type control, as in ref-1's "Join me at Ritual Coffee!" beside the solid "Join!" pill. The voice is casual; the affordance is not.

**Do** photograph real objects and cut them out. Generic flat illustration of a coffee cup will collapse the whole aesthetic.

**Don't** rotate anything a user reads. Tilt the stickers, never the card, label, input or button.

**Don't** let the sticker palette leak into system colours. A pink sticker is fine; a pink error message in this palette is unreadable and off-register.

**Don't** set metadata in monospace below 14px. Ref-1's countdown works at 14px on cream; at 12px against a busy sticker row it disappears.

**Don't** stack more than two decorative elements over a single interactive control. Ref-2 puts three objects near the buttons and zero on top of them.

**Don't** add pure white (#FFFFFF) or pure black (#000000) surfaces. Cream and ink-brown are what make it read as printed; pure values snap it back to a generic app.

**Don't** use more than one display face or add a third text family. The collage already carries the variety.

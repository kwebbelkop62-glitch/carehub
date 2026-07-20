---
name: CareHub
description: A clinical-modern appointment tracker for patients and caregivers, in the visual register of biotech/life-sciences product sites — near-black, pale cool-gray, single emerald accent.
colors:
  background: "#f2f5f3"
  foreground: "#14171a"
  surface: "#ffffff"
  border: "#dfe5e1"
  accent: "#1f9d55"
  accent-hover: "#147a3f"
  accent-fill: "#147a3f"
  accent-fill-hover: "#0f6032"
  muted: "#5b6660"
  tint: "#e6f2ea"
  error: "#dc2626"
  error-border: "#fecaca"
  error-bg: "#fef2f2"
  dark-background: "#0d0f0e"
  dark-foreground: "#eef2ef"
  dark-surface: "#161918"
  dark-border: "#2a2f2c"
  dark-accent: "#34c774"
  dark-accent-hover: "#1f9d55"
  dark-accent-fill: "#1f9d55"
  dark-accent-fill-hover: "#17793f"
  dark-muted: "#93a39b"
  dark-tint: "#142620"
  dark-error: "#f87171"
  dark-error-border: "#7f1d1d"
  dark-error-bg: "#450a0a"
typography:
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.04em"
    textTransform: "uppercase"
rounded:
  sm: "9px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  xxxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-fill-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    border: "1px solid {colors.error-border}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  badge:
    rounded: "{rounded.full}"
    padding: "5px 10px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: "11px 14px"
---

# Design System: CareHub

## 1. Overview

**Direction: clinical-modern, biotech-product register.**

CareHub reads as clean, precise, and scientific — near-black text and dark
contrast sections, a single emerald-green accent, pale cool-gray/mint
neutrals (never warm), soft rounded cards with generous whitespace. The
reference point is life-sciences/biotech product marketing (bento-style
info grids, dot-prefixed eyebrow labels, restrained color) rather than a
generic purple SaaS look or a bureaucratic hospital-teal portal.

**This supersedes an earlier "clay/moss" (warm terracotta + green,
off-white) direction that was documented but never actually implemented in
code** — the app previously shipped an unrelated violet/Geist palette.
Everything below describes the system as it now exists in
`src/app/globals.css`, not an aspiration.

**Key characteristics:**
- Emerald green is the *only* brand accent — no second brand hue. Status
  colors (below) are functional, not brand, and stay visually distinct from
  the accent.
- Cards and rows are border-only by default, no shadow.
- Pale, cool neutrals (mint/gray-green tinge), not warm off-white and not
  cold blue-gray.
- Geist (sans) is the only typeface, everywhere — no separate display/serif
  face.
- Near-black (not navy, not pure `#000`) is used for both primary text and
  full-bleed dark contrast sections.

## 2. Colors

### Accent
- **Accent** (`#1f9d55` light / `#34c774` dark): links, active nav/tab
  state, focus rings, icons that need to read as "brand."
- **Accent hover** (`#147a3f` light / dark reuses light's `--accent` value
  as a deliberate darken-on-hover in both themes — see the comment in
  `globals.css`): hover/pressed text and icon states.
- **Accent fill** (`#147a3f` light / `#1f9d55` dark): solid button
  backgrounds carrying white text — kept as a separate token from `accent`
  because `accent` alone doesn't reach 4.5:1 contrast against white at
  normal text size in either theme.

### Neutrals
- **Background** (`#f2f5f3` light / `#0d0f0e` dark): page background.
- **Surface** (`#ffffff` light / `#161918` dark): card, input, and control
  backgrounds — one step off the page background.
- **Border** (`#dfe5e1` light / `#2a2f2c` dark): the standard 1px border on
  every card, row, and input.
- **Foreground** (`#14171a` light / `#eef2ef` dark): primary text.
- **Muted** (`#5b6660` light / `#93a39b` dark): secondary text — timestamps,
  helper copy, metadata rows, inactive nav items.
- **Tint** (`#e6f2ea` light / `#142620` dark): badge and light-fill
  backgrounds, active nav-item background.

### Error
- **Error** / **error-border** / **error-bg**: `#dc2626` / `#fecaca` /
  `#fef2f2` light, `#f87171` / `#7f1d1d` / `#450a0a` dark. Used for the
  danger button, form validation errors, failed-reminder states, and
  data-load error banners. This is a real semantic token now (`--color-error*`
  in `globals.css`), not an inline Tailwind `red-*` class — every screen
  should reference it rather than hardcoding red.

### Appointment status
The `appointments.status` column has five values: `pending`, `attended`,
`completed`, `cancelled`, `missed`. "Upcoming" is the UI label for
`pending`. In practice the badge component collapses these into three
visual buckets rather than five distinct hues, and that's the intended
design, not a gap to fill in:
- **Pending / Attended / Completed / Sent** (reminders): `bg-tint
  text-accent-hover` — the calm, "in progress or resolved fine" treatment.
- **Cancelled**: `bg-border text-muted` — neutral, de-emphasized, distinct
  from the tint treatment.
- **Missed / Failed** (reminders): `bg-error-bg text-error` — the one real
  warning state, kept out of the calm palette on purpose.

## 3. Typography

**Font:** Geist (variable), everywhere — landing page, product UI, nav,
forms, data. No second typeface.

### Hierarchy
- **Title** (Geist 700, ~1.375rem/22px, line-height 1.3): screen-level
  headings.
- **Body** (Geist 400, 0.875rem/14px, line-height 1.6): default text size.
- **Label** (Geist 700, 0.75rem/12px, uppercase, letter-spacing 0.04em,
  line-height 1.4): section eyebrows, form group labels, badge text.

## 4. Elevation

Cards use **border-only** styling with no shadow — flat, matching the
biotech reference's soft-panel-on-pale-background language rather than
drop-shadowed cards. Keep this consistent; don't introduce shadows on a
one-off basis.

## 5. Components

### Buttons
- **Shape:** 12px radius.
- **Primary:** accent-fill background, white text, 10px/16px padding,
  hovers to accent-fill-hover.
- **Secondary:** Surface fill, border, foreground text.
- **Ghost:** No fill/border, muted text.
- **Danger:** Surface fill, error-border border, error text — reserved for
  destructive/cancel actions.

### Badges / status pills
- **Style:** fully rounded pill, 5px/10px padding.
- **Colors:** per §2's three-bucket status treatment.

### Cards / containers
- **Corner style:** 16px radius for primary containers (auth card,
  appointment detail, forms, stat cards); 10–12px for list rows.
- **Background:** Surface. **Border:** 1px, standard border color.
  **Shadow:** none.

### Inputs / fields
- **Style:** Surface background, 1px border, 9px radius, 11px/14px padding.
- **Focus:** border shifts to accent with a matching soft outline ring.
- **Error:** border and helper text both shift to the error token.

### Navigation
- **Desktop/tablet:** a left sidebar — brand mark at top, nav items with
  icons, active item gets a tint background, `ThemeToggle` and the Clerk
  account control pinned to the bottom.
- **Mobile:** the sidebar collapses to a slim top bar (brand mark +
  controls) plus a fixed bottom tab bar reusing the same nav items as
  icon-only buttons.

### The appointment card
Flat, single-face card showing time, title, who it's for (caregiver mode),
and a status pill — clicking through to Appointment Detail. Not a flip
card.

## 6. Do's and Don'ts

### Do:
- **Do** keep emerald as the only brand accent — don't introduce a second
  brand hue.
- **Do** use Geist everywhere; there is no separate display/serif face.
- **Do** keep cards and rows flat — border only, no shadow.
- **Do** require an explicit user choice for Attended vs. Missed once an
  appointment is past due — never infer it.
- **Do** keep Completed a manual, separate step from Attended, never
  auto-derived from documents/notes.
- **Do** show reminder delivery status (`pending`/`sent`/`cancelled`/`failed`)
  distinctly from appointment status, escalating visually only on `failed`.
- **Do** use the `error`/`error-border`/`error-bg` tokens for every warning
  or destructive state — never a hardcoded Tailwind `red-*` class.

### Don't:
- **Don't** let Cancelled blend into the tint-treatment statuses — keep it
  visually flat/neutral but still clearly distinct.
- **Don't** auto-transition status on a timer or on document upload — every
  status change is a deliberate user click.
- **Don't** reintroduce warm off-white or terracotta/moss tones — the
  palette is deliberately cool now.

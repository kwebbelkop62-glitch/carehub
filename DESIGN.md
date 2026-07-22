---
name: CareHub
description: A warm, human appointment tracker for patients and caregivers in Penang, deliberately away from clinical teal — terracotta ("clay") and moss-green accents on warm off-white neutrals, Figtree for product UI, Lora reserved for the landing page only.
colors:
  canvas: "oklch(.99 .006 70)"
  background: "oklch(.975 .008 70)"
  border: "oklch(.88 .015 60)"
  muted-icon: "oklch(.7 .018 60)"
  muted: "oklch(.48 .02 60)"
  foreground: "oklch(.22 .02 60)"
  accent: "oklch(.6 .14 45)"
  accent-hover: "oklch(.54 .14 45)"
  accent-secondary: "oklch(.55 .09 130)"
  dark-background: "oklch(.16 .012 60)"
  dark-surface: "oklch(.21 .012 60)"
  dark-border: "oklch(.32 .012 60)"
  dark-muted: "oklch(.62 .01 70)"
  dark-foreground: "oklch(.94 .006 70)"
  dark-accent: "oklch(.68 .14 45)"
typography:
  display:
    fontFamily: "Lora, serif"
    note: "landing page hero and section headlines ONLY — never in product UI"
  title:
    fontFamily: "Figtree, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Figtree, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Figtree, sans-serif"
    fontWeight: 600
    textTransform: "uppercase"
    letterSpacing: "0.06em"
spacing:
  scale: ["4px", "8px", "12px", "16px", "24px", "32px", "48px", "64px"]
rounded:
  sm: "9px"
  md: "10px"
  lg: "16px"
  full: "9999px"
---

# Design System: CareHub

## 0. This file was rebuilt 2026-07-22 — read this first

The previous version of this file (committed in `c4eb095`, "ui fix") described a completely
different system: emerald-green accent, cool mint-gray neutrals, Geist as the only typeface, and
explicitly claimed the clay/moss direction below "was documented but never actually implemented
in code" and told readers not to reintroduce it. **That claim was false.** The clay/moss,
Figtree+Lora system below is the one actually approved by the lecturer, verified directly against
the Claude Design mockup files in `carehub-design-system-setup/project/*.dc.html`
(`CareHub Design System.dc.html` for tokens, `CareHub Landing Page.dc.html`,
`CareHub Bottom Nav.dc.html`, `CareHub Records.dc.html` for applied usage). TJ deleted the old
version of this file on 2026-07-22 because of that false claim, not because the file was merely
outdated. Every value below is copied directly from those mockup files, not re-derived or
estimated. If a value is ever needed that isn't listed here, go check the `.dc.html` files
directly rather than guessing — see `IMPLEMENTATION_PLAN.md` for the full remediation plan this
file is part of.

## 1. Overview

**Direction: warm, human, appointment-tracking product — deliberately away from clinical teal.**

CareHub reads as warm and approachable: a terracotta ("clay") primary accent and a moss-green
secondary accent, on warm off-white neutrals (never cool gray). Cards and rows are border-only,
no shadow. Figtree is the UI typeface everywhere in the product. Lora, a serif, is reserved
strictly for the landing page's headline and hero copy — it never appears in the authenticated
product UI.

**Key characteristics:**
- Clay (terracotta, `oklch(.6 .14 45)`) is the primary accent; moss (`oklch(.55 .09 130)`) is a
  secondary accent used for alternating structural moments (e.g. every other numbered step on the
  landing page, the second persona card). Status colors (below) are functional, not brand, and
  stay visually distinct from both.
- Cards and rows are border-only by default, no shadow.
- Warm, off-white neutrals — not cool gray, not blue-gray.
- Figtree (sans) for all product UI. Lora (serif) for the landing page headline/hero copy only.
- Uppercase, letter-spaced "eyebrow" labels are a deliberate structural device across section
  headers, landing hero badge, and form group labels — not a stray pattern to remove.

## 2. Colors

### Accents
- **Clay / accent** (`oklch(.6 .14 45)` light / `oklch(.68 .14 45)` dark): primary buttons, links
  within the brand context, active states, the landing hero eyebrow badge text.
- **Clay hover** (`oklch(.54 .14 45)`): hover/pressed state for clay-filled buttons.
- **Moss / accent-secondary** (`oklch(.55 .09 130)`): secondary structural accent — alternating
  step numbers on the landing "How it works" section, dot accents in the logo mark, the patient
  persona card treatment.

### Neutrals
- **Canvas** (`oklch(.99 .006 70)`): card and surface fill, one step lighter than background.
- **Background** (`oklch(.975 .008 70)` light / `oklch(.16 .012 60)` dark): page background.
- **Border** (`oklch(.88 .015 60)` light / `oklch(.32 .012 60)` dark): standard 1px border on
  every card, row, and input.
- **Muted icon** (`oklch(.7 .018 60)`): decorative/inactive icon tint, light mode only value shown
  in the mockup.
- **Muted / text secondary** (`oklch(.48 .02 60)` light / `oklch(.62 .01 70)` dark): timestamps,
  helper copy, metadata rows, inactive nav items.
- **Foreground / text primary** (`oklch(.22 .02 60)` light / `oklch(.94 .006 70)` dark).

### Appointment status
The `appointments.status` column has five values: `pending`, `attended`, `completed`,
`cancelled`, `missed`. "Upcoming" is the UI label for `pending`. Unlike the previous (incorrect)
version of this file, the approved mockups give **five visually distinct status treatments**, not
a collapsed three-bucket system — confirmed directly in `CareHub Records.dc.html`'s status chip
logic. Each is dot / background / text:

Light mode:
```
upcoming (pending): oklch(.5 .14 260)  / oklch(.93 .03 260)   / oklch(.4 .12 260)
attended:            oklch(.5 .11 145)  / oklch(.93 .035 145)  / oklch(.38 .1 145)
completed:           oklch(.58 .12 75)  / oklch(.93 .035 75)   / oklch(.42 .11 75)
missed:              oklch(.53 .17 25)  / oklch(.93 .035 30)   / oklch(.42 .15 25)
cancelled:           oklch(.6 .015 60)  / oklch(.93 .008 60)   / oklch(.45 .015 60)
```

Dark mode (upcoming/attended/completed/missed confirmed in `CareHub Design System.dc.html`;
cancelled dark value not shown anywhere in the mockups — this is a genuine open item, don't guess
it, ask before implementing dark-mode cancelled):
```
upcoming:   oklch(.72 .13 260) / oklch(.3 .05 260 / .35) / oklch(.82 .06 260)
attended:   oklch(.72 .12 145) / oklch(.3 .05 145 / .35) / oklch(.8 .06 145)
completed:  oklch(.75 .12 75)  / oklch(.3 .05 75 / .35)  / oklch(.8 .06 75)
missed:     oklch(.72 .15 25)  / oklch(.3 .06 25 / .35)  / oklch(.82 .08 25)
cancelled:  NOT DEFINED — open item, ask before implementing.
```

### Error
No dedicated `--error*` token is shown in the mockups distinct from the "missed" status color —
`missed`'s treatment (`oklch(.53 .17 25)` family) doubles as the one real warning/danger color.
Reuse it for destructive actions and form validation errors rather than inventing a separate hue.

## 3. Typography

**Figtree** (400/500/600/700/800) is the UI sans, used everywhere in the product — nav, cards,
forms, data, every screen except the landing page's headline copy.

**Lora** (400/500/600, italic 400) is a display serif reserved for the landing page headline and
hero copy only (`src/app/page.tsx`). It never appears in the authenticated product UI. This is a
hard rule from the approved mockups, not a stylistic suggestion.

## 4. Elevation

Cards use **border-only** styling with no shadow — flat, matching every card shown across all ten
approved mockup screens. Don't introduce shadows on a one-off basis.

## 5. Components

### Buttons
Confirmed from `CareHub Design System.dc.html`'s button row:
- **Primary:** clay fill, white/canvas text, 10px radius, 12px/22px padding (13px/16px in
  compact contexts like appointment cards), hovers to clay-hover.
- **Secondary:** canvas fill, standard border, foreground text.
- **Ghost:** transparent fill, no border, muted text, hover fills to a light tint.

### Badges / status pills
Fully rounded pill, dot + label, colors per the five-status table in §2. Confirmed pill padding
in the mockups is roughly 5–7px vertical / 12–14px horizontal depending on context (compact list
rows use the smaller end).

### Cards / containers
16px radius for primary containers (appointment cards, forms, stat cards). Canvas background,
1px standard border, no shadow (one card in the old Design System mockup shows a very subtle
shadow — `0 1px 2px oklch(.5 .02 60 / .06)` — treat that as the flat style's own near-zero
allowance, not a departure from "no shadow," don't scale it up).

### Inputs / fields
Canvas background, 1px border, 9px radius, 11px/14px padding. Focus state: border shifts to clay
with a soft `oklch(.6 .14 45 / .35)` outline ring. Error state: border and helper text shift to
the missed/error color.

### The appointment card
**Confirmed NOT a flip card.** Checked `CareHub Dashboard.dc.html` and `CareHub Lists.dc.html`
directly for any flip/rotate/perspective/backface CSS — none present. The approved card is a
flat, single-face card: title, subtitle (provider/location or "who it's for" in caregiver mode),
date/time, and a status pill, all in one static layout. The existing `appointment-card.tsx`
3D-flip mechanism (`perspective-*`, `rotate-y-*`, `backface-hidden`) needs to be replaced with a
static card, this is not an intentional simplification question anymore, it's confirmed. See
`IMPLEMENTATION_PLAN.md`.

### Navigation
- **Desktop/tablet:** left sidebar — brand mark at top, nav items with icons, `ThemeToggle` and
  the Clerk account control pinned to the bottom. No equivalent shown in the mobile-only mockups;
  keep the existing sidebar structure, just restyle to these tokens.
- **Mobile:** a fixed bottom tab bar, confirmed from `CareHub Bottom Nav.dc.html` — exactly five
  items: **Home, Units, Book (raised center FAB, clay circle), Alerts (unread-dot indicator),
  Profile**. This is a real, specific spec, not a generic "bottom nav" placeholder — see
  `IMPLEMENTATION_PLAN.md` for the rebuild task and the open question on where Alerts routes.

## 6. Do's and Don'ts

### Do:
- **Do** keep clay as the primary accent and moss as the one secondary accent — don't introduce a
  third brand hue.
- **Do** use Figtree everywhere in the product; reserve Lora strictly for the landing page.
- **Do** keep cards and rows flat — border only, no meaningful shadow.
- **Do** use all five status colors distinctly (upcoming/attended/completed/missed/cancelled) —
  don't collapse them into fewer visual buckets.
- **Do** require an explicit user choice for Attended vs. Missed vs. Completed once an appointment
  is past due — never infer it.
- **Do** show reminder delivery status (`pending`/`sent`/`cancelled`/`failed`) distinctly from
  appointment status.

### Don't:
- **Don't** reintroduce the emerald/mint-gray/Geist system that briefly replaced this one in
  `c4eb095` — that was an error, not a valid alternate direction, see §0.
- **Don't** use Lora anywhere outside the landing page.
- **Don't** auto-transition status on a timer or on document upload — every status change is a
  deliberate user click.
- **Don't** guess the dark-mode cancelled-status color or any other value not listed here — check
  the `.dc.html` files or ask.

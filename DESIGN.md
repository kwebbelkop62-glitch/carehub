---
name: CareHub
description: A warm, human appointment tracker for patients and caregivers juggling multiple providers across Penang — deliberately away from clinical teal.
colors:
  canvas: "oklch(0.99 0.006 70)"
  background: "oklch(0.975 0.008 70)"
  border: "oklch(0.9 0.015 60)"
  muted-icon: "oklch(0.7 0.018 60)"
  text-secondary: "oklch(0.48 0.02 60)"
  text-primary: "oklch(0.22 0.02 60)"
  clay: "oklch(0.6 0.14 45)"
  clay-hover: "oklch(0.54 0.14 45)"
  moss: "oklch(0.55 0.09 130)"
  status-upcoming-border: "oklch(0.5 0.14 260)"
  status-upcoming-bg: "oklch(0.93 0.03 260)"
  status-upcoming-text: "oklch(0.4 0.12 260)"
  status-attended-border: "oklch(0.5 0.11 145)"
  status-attended-bg: "oklch(0.93 0.035 145)"
  status-attended-text: "oklch(0.38 0.1 145)"
  status-completed-border: "oklch(0.58 0.12 75)"
  status-completed-bg: "oklch(0.93 0.035 75)"
  status-completed-text: "oklch(0.42 0.11 75)"
  status-missed-border: "oklch(0.53 0.17 25)"
  status-missed-bg: "oklch(0.93 0.035 30)"
  status-missed-text: "oklch(0.42 0.15 25)"
  status-cancelled-border: "oklch(0.6 0.015 60)"
  status-cancelled-bg: "oklch(0.93 0.008 60)"
  status-cancelled-text: "oklch(0.45 0.015 60)"
  error: "oklch(0.53 0.17 25)"
  dark-background: "oklch(0.16 0.012 60)"
  dark-surface: "oklch(0.21 0.012 60)"
  dark-border: "oklch(0.32 0.012 60)"
  dark-text-secondary: "oklch(0.62 0.01 70)"
  dark-text-primary: "oklch(0.94 0.006 70)"
  dark-clay: "oklch(0.68 0.14 45)"
  dark-status-upcoming-bg: "oklch(0.3 0.05 260 / 0.35)"
  dark-status-upcoming-dot: "oklch(0.72 0.13 260)"
  dark-status-upcoming-text: "oklch(0.82 0.06 260)"
  dark-status-attended-bg: "oklch(0.3 0.05 145 / 0.35)"
  dark-status-attended-dot: "oklch(0.72 0.12 145)"
  dark-status-attended-text: "oklch(0.8 0.06 145)"
  dark-status-completed-bg: "oklch(0.3 0.05 75 / 0.35)"
  dark-status-completed-dot: "oklch(0.75 0.12 75)"
  dark-status-completed-text: "oklch(0.8 0.06 75)"
  dark-status-missed-bg: "oklch(0.3 0.06 25 / 0.35)"
  dark-status-missed-dot: "oklch(0.72 0.15 25)"
  dark-status-missed-text: "oklch(0.82 0.08 25)"
typography:
  headline:
    fontFamily: "Lora, serif"
    fontSize: "clamp(1.8rem, 1.3rem + 2vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    note: "Landing page only — hero line and section headers on src/app/page.tsx. Never in product UI."
  title:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Figtree, sans-serif"
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
    backgroundColor: "{colors.clay}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "{colors.clay-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
  button-ghost:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.status-missed-text}"
    border: "1px solid oklch(0.75 0.08 25)"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
  card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  badge:
    rounded: "{rounded.full}"
    padding: "5px 12px"
  input:
    backgroundColor: "oklch(0.995 0.004 70)"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: "11px 14px"
  chip:
    rounded: "{rounded.full}"
    padding: "9px 14px"
    border: "1.5px solid"
---

# Design System: CareHub

## 1. Overview

**Direction: warm and human, away from clinical teal.**

This replaces the earlier violet/Geist system entirely. CareHub now reads as warm and personal rather than clinical or corporate — a terracotta/clay primary paired with a moss green secondary, set on warm off-white neutrals (not cool gray), with a serif display face reserved strictly for the landing page. The product itself (every screen behind sign-in) stays in a single humanist sans throughout.

The system keeps the two things the old one explicitly rejected: it is not a generic AI-SaaS product, and it is not a cold bureaucratic hospital portal. One addition worth naming: this system uses uppercase, letter-spaced "eyebrow" labels deliberately and everywhere — section headers, form group labels, status pills' underlying structure, the landing hero badge. The old system's anti-reference list explicitly banned this pattern ("tiny uppercase eyebrows stacked over every section"). That rule no longer applies — the eyebrow label is now a core, recurring structural device of this system, not an occasional lapse. If this bothers you on review, flag it; it would need a deliberate removal pass across every screen, not a one-line fix.

**Key characteristics:**
- Clay (terracotta) is the primary interactive accent; moss (green) is secondary, used for "add new" affordances and caregiver-mode accents
- Cards and rows are border-only by default — see the open question on shadows in §4
- Warm off-white neutrals throughout, not cool gray
- Figtree for all product UI; Lora reserved exclusively for the landing page
- Dark mode is defined but not yet fully specced — see §2

## 2. Colors

### Primary
- **Clay** (`oklch(0.6 0.14 45)` light / `oklch(0.68 0.14 45)` dark): primary buttons, active nav/tab states, focus rings, the floating "Book" action in the mobile bottom nav.
- **Clay hover** (`oklch(0.54 0.14 45)`): pressed/hover step in light mode. No separate dark hover value defined yet — reuse the dark clay value until one is specified.

### Secondary
- **Moss** (`oklch(0.55 0.09 130)`): "add new" links/buttons (add unit, add dependant), caregiver-mode selection state, the second progress-dot color in multi-step flows.

### Neutrals
- **Canvas** (`oklch(0.99 0.006 70)` light / **Surface** `oklch(0.21 0.012 60)` dark): card, input, and control backgrounds — one step off the page background.
- **Background** (`oklch(0.975 0.008 70)` light / `oklch(0.16 0.012 60)` dark): page background.
- **Border** (`oklch(0.9 0.015 60)` light / `oklch(0.32 0.012 60)` dark): the standard 1px border used on every card, row, and input.
- **Text primary** (`oklch(0.22 0.02 60)` light / `oklch(0.94 0.006 70)` dark).
- **Text secondary** (`oklch(0.48 0.02 60)` light / `oklch(0.62 0.01 70)` dark): timestamps, helper copy, metadata rows.
- **Muted icon** (`oklch(0.7 0.018 60)`): decorative/inactive icon tint, light mode only — no dark value defined yet.

### Status — appointments (five states)
The `appointments.status` column has five values: `pending`, `attended`, `completed`, `cancelled`, `missed`. "Upcoming" is the UI label for `pending` — there is no separate "Upcoming" database value.

- **Upcoming** (`pending`): border `oklch(0.5 0.14 260)`, bg `oklch(0.93 0.03 260)`, text `oklch(0.4 0.12 260)` — a blue/violet hue, distinct from the brand's own clay/moss so status never gets mistaken for a brand accent.
- **Attended**: border `oklch(0.5 0.11 145)`, bg `oklch(0.93 0.035 145)`, text `oklch(0.38 0.1 145)` — green.
- **Completed**: border `oklch(0.58 0.12 75)`, bg `oklch(0.93 0.035 75)`, text `oklch(0.42 0.11 75)` — amber/gold.
- **Missed**: border `oklch(0.53 0.17 25)`, bg `oklch(0.93 0.035 30)`, text `oklch(0.42 0.15 25)` — red. This is also the "Failed" reminder-status color and the generic form-error color.
- **Cancelled**: border `oklch(0.6 0.015 60)`, bg `oklch(0.93 0.008 60)`, text `oklch(0.45 0.015 60)` — neutral gray, deliberately de-emphasized.

Dark-mode equivalents exist for Upcoming, Attended, Completed, and Missed (semi-transparent fills — see frontmatter). **Cancelled has no dark-mode value defined yet** — needs one before dark mode ships on any screen showing appointment status.

### Named rules
**Attended vs. Completed vs. Missed.** Once an appointment's date/time has passed, the user is prompted with two explicit choices — "Mark attended" or "Did not attend" — never left ambiguous. "Did not attend" sets status to Missed directly. "Mark attended" sets it to Attended, which then unlocks a further optional manual action, "Mark completed" (status → Completed) — completed is never inferred automatically from documents or notes being attached, it is always a deliberate second click. Completed and Missed are terminal; Cancelled is reachable as a separate action from any non-terminal state.

**Reminder status is separate from appointment status.** `reminders.status` (`pending`, `sent`, `cancelled`, `failed`) gets its own small indicator next to the reminder lead-time selector on Appointment Detail — a quiet dot/label normally, escalating to the red/Missed treatment only when `failed`, so a real delivery problem doesn't get lost. If the appointment itself is cancelled, the reminder indicator shows "Cancelled — won't send" regardless of its stored status.

## 3. Typography

**UI font:** Figtree (variable), all product screens — nav, cards, forms, data, buttons.
**Display font:** Lora (serif, with italic), landing page only (`src/app/page.tsx`) — hero headline and the "How it works" / "Who it's for" / closing-CTA section headers. Never appears in product UI.

### Hierarchy
- **Headline** (Lora 600, `clamp(1.8rem, 1.3rem + 2vw, 3.25rem)`, line-height 1.1): landing page hero and section headers only.
- **Title** (Figtree 700, ~1.375rem/22px, line-height 1.3): screen-level headings ("Profile & settings," a person's name on Appointment Detail).
- **Body** (Figtree 400, 0.875rem/14px, line-height 1.6): default text size across the product.
- **Label** (Figtree 700, 0.75rem/12px, uppercase, letter-spacing 0.04em, line-height 1.4): section eyebrows, form group labels, badge/status text at its smallest size.

## 4. Elevation — open question

Actual screens (Dashboard, Records, Lists, Profile & Settings) consistently use **border-only** cards with no shadow — flat, matching the old system's instinct. One example card in the Design System file itself ("Cards & form fields" section) shows a subtle `box-shadow: 0 1px 2px oklch(0.5 0.02 60 / 0.06)` that doesn't appear anywhere else in the built screens. Treat the real screens as authoritative — flat, border-only — and treat that one shadowed example as a leftover worth a quick cleanup pass in Claude Design, not a signal that shadows are now allowed generally.

The mobile "Bottom Nav" preview file wraps its whole phone-frame mockup in a large shadow (`0 20px 50px oklch(0.3 0.02 60 / 0.25)`) — that's presentational chrome for the device-frame preview itself, not a component-level design token, and shouldn't be read as a card or surface style.

## 5. Components

### Buttons
- **Shape:** 9px radius, consistent across variants.
- **Primary:** Clay fill, canvas-color text, 13px/22px padding, hovers to clay-hover.
- **Secondary:** Canvas fill, border, primary text.
- **Ghost:** No fill/border, secondary text.
- **Danger:** Transparent fill, red border (`oklch(0.75 0.08 25)`), red text — reserved for Cancel actions.
- All buttons share consistent padding; no shared press/disabled treatment is explicitly specced yet beyond the individual screens' inline `disabled` states (grayed-out background) — worth confirming a single disabled-state rule when this is retheme'd into `src/components/ui/`.

### Badges / status pills
- **Style:** fully rounded pill, 5px/12px padding for the larger "current status" display on Appointment Detail; smaller chip variants (7–8px/13–14px padding) used for selectable options (reminder lead time, unit type).
- **Colors:** per the five-state status palette in §2. Inactive/unselected chip state uses border `oklch(0.85 0.015 60)`, bg `oklch(0.995 0.004 70)`, text `oklch(0.55 0.02 60)` across the board (unit type picker, date/time picker, dependant picker, reminder picker).

### Cards / containers
- **Corner style:** 16px radius for primary containers (auth card, appointment detail, forms); 10–12px for list rows (unit rows, history rows, document rows, dependant rows).
- **Background:** Canvas, one step off the page background.
- **Border:** 1px, standard border color.
- **Shadow:** none — see §4.

### Inputs / fields
- **Style:** `oklch(0.995 0.004 70)` background (very slightly off-canvas), 1px border, 9px radius, 11px/14px padding, 15px text.
- **Focus:** border shifts to clay with a matching soft outline ring (`outline: 2px solid oklch(0.6 0.14 45 / 0.35)`) — no glow, no shadow.
- **Error:** border and helper text both shift to red (`oklch(0.53 0.17 25)`) — this system colors the border on error, unlike the old system which kept the border neutral and only recolored the helper text. Confirm this is the intended behavior before building, since it's a real change in error-state legibility approach.

### Navigation
- **Desktop/tablet:** top app-shell header, matching the existing pattern — logo mark + wordmark left, primary action + avatar right. Caregiver dependant switcher (Everyone/You/Mum/Dad-style pill group) sits in the header on the Dashboard when in caregiver mode.
- **Mobile:** a new bottom tab bar (Home / Units / Book / Alerts / Profile) with a raised circular "Book" action as the center item — this is new scope not present in the original app shell, which only had a top header. Wire this in as a responsive addition to `AppShell`, shown below a breakpoint rather than replacing the top header entirely (the top header still needs to carry the logo and avatar on mobile).

### The appointment card
No longer a 3D flip card. In this system, appointment rows are flat, single-face cards showing time, title, who it's for (caregiver mode), and a status pill — clicking through to Appointment Detail rather than flipping in place. This is a deliberate simplification from the old flip-card signature component; confirm this is an intentional interaction change, not an oversight, before removing the existing flip-card CSS from `appointment-card.tsx`.

## 6. Do's and Don'ts

### Do:
- **Do** keep clay as the only primary interactive color; moss only for "add new" and caregiver-mode accents — don't introduce a third brand hue.
- **Do** reserve Lora exclusively for the landing page; every product screen stays in Figtree.
- **Do** keep cards and rows flat — border only, no shadow (see §4 for the one inconsistent example to ignore).
- **Do** require an explicit user choice for Attended vs. Missed once an appointment is past due — never infer it.
- **Do** keep Completed a manual, separate step from Attended, never auto-derived from documents/notes.
- **Do** show reminder delivery status (`pending`/`sent`/`cancelled`/`failed`) distinctly from appointment status, escalating visually only on `failed`.

### Don't:
- **Don't** add Lora anywhere in the authenticated product UI.
- **Don't** let Cancelled blend into the other four statuses — keep it visually flat/neutral (de-emphasized) but still clearly a distinct fifth state, not styled identically to an unselected chip.
- **Don't** auto-transition status on a timer or on document upload — every status change shown in these mockups is a deliberate user click.
- **Don't** assume the shadowed card example in the Design System file is the real card style — the built screens are flat, treat that example as the outlier.

# Product

## Register

product

## Platform

web (responsive — the new design system adds a dedicated mobile bottom-nav pattern; see DESIGN.md §5)

## Users

Two personas drive every design decision. A **caregiver** manages a dependant's appointments across several specialist units, labs, and scan centers — juggling someone else's care, often across multiple providers at once, frequently between other tasks rather than with full attention. A **self-managing patient** juggles their own government-hospital and local-clinic visits solo. Both operate in Penang, Malaysia, across public hospital units, clinics, labs, scan centers, physiotherapy/rehabilitation clinics, and private or local clinics a user adds themselves. Full persona detail lives in `CareHub_Proposal_Report.docx` (external, not in this repo) — treat it as already settled; don't redesign against it.

## Product Purpose

CareHub helps patients and caregivers in Penang track and manage appointments across multiple hospital units, clinics, labs, physiotherapy/rehab centers, and scan centers, plus any private or local clinics a user adds themselves. It exists because juggling several providers otherwise means juggling several separate booking systems, paper slips, and mental notes — CareHub consolidates all of that into one upcoming/history view with reminders. Success means a caregiver feels in control of a dependant's care across every unit involved, not overwhelmed by fragmented tracking.

## Positioning

CareHub is the one place that unifies every provider a Penang patient or caregiver deals with — government hospital units, clinics, labs, scan centers, physiotherapy/rehab clinics, and self-added private clinics — into a single appointment view. No other system spans that full mix for one patient, or for everyone a caregiver looks after.

## Brand Personality

Warm and human, not clinical. As of this redesign, the visual language moved away from the earlier cool violet/Geist system to a terracotta-and-moss palette on warm off-white neutrals, with a serif display face (Lora) reserved for the landing page only — see DESIGN.md for the full token set. The voice itself is unchanged: a composed, competent friend helping with logistics, never a hospital notice or a sales pitch. Confidence comes from clarity — dates, statuses, and next steps are always unambiguous — not from urgency or exclamation.

## Anti-references

One thing to actively avoid, largely unchanged: the cold, bureaucratic feel of a government hospital portal or paper intake form — dense forms with no breathing room, sterile gray-on-white, jargon-heavy status labels. CareHub should feel personal and calm even though the providers behind it are institutional.

The earlier rule against "tiny uppercase eyebrows stacked over every section" no longer applies. This redesign uses uppercase, letter-spaced eyebrow labels deliberately and consistently — landing hero badge, section headers, form group labels — as a core structural device, not a stray AI-SaaS tic. If you want that pattern removed, it's a deliberate cross-screen decision to make now, not a leftover to quietly fix.

Generic AI-SaaS clichés otherwise still apply as anti-references: gradient text, hero-metric templates, numbered 01/02/03 scaffolding.

## Design Principles

**One glance, no mental overhead** — every screen answers "what's next" without the user re-deriving it from a list of dates.

**Confidence through clarity, not urgency** — statuses, reminders, and deadlines stay unambiguous; tone never leans on alarm color or exclamation to manufacture urgency. Status changes (Attended, Missed, Completed, Cancelled) are always explicit user actions, never inferred or automatic — see DESIGN.md §2 for the full status-transition rules.

**The landing page is the one brand-register exception** — the Lora display face and the fuller marketing copy voice apply only to `src/app/page.tsx`; every other screen is product register and optimizes for task completion, not persuasion.

**Extend the existing system, don't reinvent it** — going forward, new screens and components restyle the shared tokens and primitives in `globals.css` and `components/ui/` against DESIGN.md, not parallel one-off styles. (This redesign itself is the one deliberate exception, having replaced the prior token set wholesale.)

**Design for the person who isn't looking closely** — a caregiver may be checking CareHub between other tasks, sometimes on behalf of an elderly dependant; legibility and unambiguous status beat visual flourish.

## Accessibility & Inclusion

Target WCAG 2.1 AA as a floor, but go further where the audience calls for it: patients and caregivers may include elderly or low-vision users, and a caregiver may be managing a dependant's care under time pressure. Favor larger tap targets and text sizing over the AA minimum, extra caution on contrast, and conservative motion with a `prefers-reduced-motion` fallback on every animation — the landing page's floating hero cards in particular need this fallback added; it wasn't present in the initial mockup pass. Status colors stay meaningful: Missed keeps genuine red rather than being folded into a softer tint, so a real problem state is never visually softened away.

## Open items carried from the design review

A few things this redesign hasn't fully resolved yet, worth keeping in view rather than losing track of once code work starts:

- Cancelled has no dark-mode color value defined (DESIGN.md §2).
- One example card in the Design System file shows a shadow that doesn't match the flat, border-only style used everywhere else (DESIGN.md §4) — likely a leftover, not a new rule.
- The appointment card is no longer a 3D flip card in the new mockups — confirm this is an intentional simplification before removing the existing flip-card component.
- The mobile bottom-nav pattern is new scope not present in the original app shell and needs a responsive integration plan, not a wholesale replacement of the desktop header.

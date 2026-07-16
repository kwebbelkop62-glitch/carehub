# CareHub build notes — screens 2 through 9

Written at the end of the build. Read the top section first — it's the one
caveat that applies to every screen below and matters more than any of the
individual guesses.

**Post-build update 5 — purple/white redesign, Ballpit landing page, flip
cards, i18n structure:**

- **Design tokens** (`src/app/globals.css`): background/surface/border/
  accent/accent-hover/muted/tint, light + dark, per spec. Dark mode now
  driven by a `.dark` class (`@custom-variant dark`) instead of
  `prefers-color-scheme`, so the toggle can override system preference.
  Also fixed a real pre-existing bug while in this file: `body`'s
  `font-family` was hardcoded to Arial and never actually used the loaded
  Geist font.
- **Dark mode toggle**: system preference on first load, localStorage
  after that, applied via a `beforeInteractive` script in the root layout
  (avoids a flash of the wrong theme). The toggle component itself uses
  `useSyncExternalStore`, not `useState`+`useEffect` — the latter trips
  `react-hooks/set-state-in-effect` as a hard lint error in this project's
  config; `useSyncExternalStore` is the correct fix, not a workaround.
- **Landing page** (`/`): found `design-reference/mockup.html` mid-build —
  a real reference file you'd left in the project root (not something I
  created), explicitly labeled "not production code," giving exact colors
  (matched chat, no discrepancies), the flip-card CSS mechanism, and
  structural details not in chat (a "Create an account" link under Sign
  In, a "Hover or tap a card for more" hint). Read it in full and used it
  as authoritative for structure/spacing beyond the chat text. Did not
  commit it — it says itself it's a reference, not app code.
- **Ballpit**: vendored byte-for-byte from `DavidHDev/react-bits` (it
  ships minified/mangled upstream — that's the actual canonical source,
  not something I introduced). Only addition: a `'use client'` directive,
  required for Next.js App Router. Confirmed by reading the source
  (`size: 'parent'` hardcoded in `createBallpit`) that it already handles
  parent-relative resizing via `ResizeObserver` — no custom resize handler
  needed.
- **AppointmentCard flip component**: own implementation of the same
  mechanism as the mockup (perspective/transform-3d/rotate-y-180/
  backface-hidden via Tailwind v4's native 3D utilities), not copied.
  Verified the utilities aren't just literal class names with no effect by
  pulling Next's actual compiled CSS and confirming the real properties
  (`backface-visibility: hidden`, `perspective: 1000px`, etc.) are
  generated. One open item: the back face's "View details" link stays in
  tab order even when the card isn't visually flipped — `backface-hidden`
  only affects rendering, not focusability. Matches the reference
  mechanism exactly; fixing it properly would go beyond that.
- **i18n**: next-intl, cookie-based (no `[locale]` URL routing) — avoids
  restructuring every existing route under a locale segment for an app
  whose URLs don't need it. `messages/en.json` and `messages/ms.json` are
  byte-identical English placeholders, per your explicit instruction — no
  translation was attempted. Only the landing page's copy is wired through
  `getTranslations()` so far (the one page with a visible toggle); the
  toggle itself calls a real `setLocale()` server action (cookie +
  `revalidatePath`), not just local state. Found and fixed a real bug
  while verifying: the language toggle (a Client Component) imported
  constants from `src/i18n/request.ts`, which also imports `next/headers`
  — that drags a server-only module into the client bundle and Next.js
  correctly refused to compile it. Split the plain constants into
  `src/i18n/locales.ts` so client and server code can share them safely.
- **Badge colors** (judgment call): most statuses now share the purple
  tint treatment (matches the mockup's own badge styling, and the token
  spec explicitly calls `tint` a badge background) — but `missed`/`failed`
  keep a real red, since those are genuine problem states worth not
  blending into the calm palette. Same reasoning for the Confirm-flow
  success/conflict states, which now use plain Tailwind `green-*` instead
  of `emerald-*` — `emerald` was literally the old brand color being
  replaced, so keeping it around for an unrelated "success" meaning would
  read as leftover brand color, not a deliberate semantic choice.
- **Responsiveness**: no fixed pixel widths — hero height and content
  width both use breakpoint-scaled Tailwind classes
  (`h-[400px] sm:h-[450px] lg:h-[500px]`, etc.), and appointment cards
  reflow `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3`. Verified via
  rendered markup that the breakpoint classes are present and via
  compiled CSS that they generate real rules — **not** verified by
  actually resizing a browser viewport, since there's no browser in this
  environment. Please check real reflow behavior yourself before trusting
  it fully.

**Post-build update 4:** real testing (post-pairing) hit a
`ClerkAPIResponseError: Too Many Requests` from `getOrCreateAppUser()`.
Root cause: it called `currentUser()` unconditionally on every call, and
`currentUser()` hits Clerk's rate-limited Backend API rather than reading
the local session JWT — `cache()` only dedupes within one request, and
Next.js prefetches nav links in the background, so this fired on nearly
every render. Fixed (commit `83df1db`): now uses `auth()` (local JWT read,
free) for the `clerk_user_id` lookup on every call, and only calls
`currentUser()` the one time a brand-new user's `users` row doesn't exist
yet. If you were actively rate-limited when this hit, you may need to wait
briefly for Clerk's window to reset before retrying — the fix stops future
over-calling, it doesn't clear an already-tripped limit.

**Post-build update 1:** the first real sign-in (before Clerk↔Supabase
pairing was done) hit exactly the `PGRST301` JWT error anticipated below,
and surfaced a real bug: the `patients` query on Upcoming, History,
Documents, and Select Unit only destructured `data`, not `error` — so a
failed query looked identical to a genuinely empty account. Select Unit
was worse: it silently *redirected* to `/profile` on a failed query.
Fixed on all four (commit `8171532`) to capture and surface the error the
same way the appointments queries already did.

**Post-build update 2:** Clerk↔Supabase pairing is now done, and TJ
checked the real CHECK constraints directly against the live database
(not read-only introspection, the actual constraint definitions). Result:
- `appointments.status`: real set is `pending | attended | completed |
  cancelled | missed`, default `pending`. My guess (`pending | attended |
  completed | cancelled`) was a subset — every value I used was valid, I
  was just missing `missed`. Nothing was actually broken; `missed` is now
  in the type but no screen sets it.
- `units.type`: real set is `specialist_clinic | laboratory | scan_center
  | physiotherapy | rehabilitation_clinic | general_clinic |
  private_clinic`. My guess (`hospital | clinic | lab | scan_center`) was
  **wrong on 3 of 4 values** — only `scan_center` happened to match. The
  add-a-clinic form was defaulting to `"clinic"`, which isn't a valid
  value at all and would have failed on every submission. Fixed
  everywhere (see below), default is now `private_clinic`, per the
  brief's own "local or private clinics a user may add themselves"
  wording.
- `reminders.status`: real set is `pending | sent | cancelled | failed`
  — matches what was already built exactly.

Fixed in `src/lib/types.ts` (now the single source of truth — added a
`UNIT_TYPE_LABELS` export and a `unitTypeLabel()` lookup helper, and
removed the duplicate label map that had been copy-pasted into both
Select Unit and History) plus the two pages that referenced the old
values. `npm run lint` and `npx tsc --noEmit` both clean afterward.

**Post-build update 3:** the `documents` Storage bucket now exists
(private, matching the code's assumption) — Screen 8 should actually work
now. Only the reminders send job remains intentionally unbuilt.

## The one thing to know before trusting any of this

**No screen has been tested against a real signed-in session.** Two things
block that from this environment:

1. The brief says TJ still needs to manually pair Clerk and Supabase as
   trusted providers in both dashboards. Until that's done, the Clerk
   session token won't produce a usable Supabase session no matter what the
   code does.
2. Even once that's done, I have no browser here — no way to click through
   an actual Clerk sign-in and land on an authenticated page.

What I *could* verify, and did, after every screen: `npm run lint` clean,
`npx tsc --noEmit` clean project-wide, the dev server starts with no
compile errors, and every route responds correctly when signed out (public
routes render, protected routes 307-redirect to `/sign-in` instead of
500ing or 404ing). That confirms the code compiles and the auth gate works.
It does **not** confirm a single Supabase query, insert, or RLS policy
actually behaves as written. Please do a real click-through once the Clerk
pairing is done, on every screen, before assuming this works.

## One thing intentionally not built

- **Reminders send job.** Screen 6 and the Confirm action insert a
  `reminders` row (channel `email`, status `pending`) when an appointment
  is booked, and update it on cancel. Nothing sends the email or runs on a
  schedule — no Supabase Edge Function, no cron. That's a deliberate stop,
  per your instruction, for you and me to do together.

(The Documents storage bucket was the other item here — it didn't exist
during the build, but it's since been created. See "Post-build update 3"
above.)

No Postgres schema, table, or RLS policy was touched anywhere in this
build. Nothing else came up that needed one.

## Screen-by-screen

### Screen 2 — Upcoming
Done: greeting, empty state if the user has no patients yet (points to
Profile), empty state if they have patients but no upcoming appointments,
appointment cards sorted soonest-first, Add Appointment button.
Guessed: "upcoming" is `appointment_date >= today`, not time-of-day aware —
an appointment today at 9am still shows as upcoming at 3pm the same day.
Same simplification used for History's past/future split.

### Screen 3 — Select Unit
Done: keyword search (name/facility/area) via a plain GET form, scoped to
curated units (`added_by_user_id is null`) plus the signed-in user's own
added units — other users' added clinics don't leak into your results. Add
a clinic flow inserts a new `units` row and drops straight into Select
Date and Time with it pre-selected.
`units.type` values are confirmed against the live CHECK constraint (see
"Post-build update 2") — no longer a guess.
Judgment call: the brief's 9 screens don't include a "pick which patient"
step, but a caregiver with multiple dependants needs one somewhere. I put
a "For: [patient]" selector at the top of this screen rather than
inventing a new screen. If you had something else in mind for where that
lives, this is the first place to look.

### Screen 4 — Select Date and Time
Done: date/time form, conflict check against the signed-in user's *own*
appointments, explicit UI copy saying this can't check real hospital
availability (per your instruction to be honest about that).
Judgment call: "the signed in user's own appointments" is checked across
*all* of the account's patients, not just the one being booked for — i.e.
booking dependant A and dependant B at the same time flags as a conflict.
Defensible either way; the brief's phrasing reads to me as account-wide,
but worth confirming that's what you meant.
The conflict check is a soft warning, not a hard block — you can still
continue if it's intentional (e.g. two family members splitting up to
cover both).

### Screen 5 — Confirm
Done: summary card, writes the `appointments` row, and — per your explicit
instruction for this screen — inserts the matching `reminders` row in the
same action (`channel: email`, `status: pending`).
Guessed: reminder lead time is 24 hours before the appointment. Not
specified anywhere in the brief; invented so the row has *some* value in
`remind_at`. Easy to change in one place
(`src/app/(app)/appointments/new/confirm/actions.ts`) once you decide what
it should actually be.
Untested beyond compile: this is a write path with no way for me to
confirm the insert actually succeeds under real RLS.

### Screen 6 — Appointment Detail
Done: edit (date, time, notes — recomputes the reminder's `remind_at` to
match), cancel (sets appointment status to `cancelled`, reminder status to
`cancelled`), reminder status display.
Judgment call, not literally requested: I added "Mark attended" / "Mark
completed" buttons for past appointments still sitting at `pending`.
Without this, nothing in the app ever sets an appointment to `attended` or
`completed`, and History's own description ("status shown as attended,
completed, or pending") would be unreachable. Flagging this clearly since
it goes beyond "edit and cancel actions" as written — cut it if it's not
what you wanted.
`appointments.status` vocabulary is confirmed against the live CHECK
constraint (see "Post-build update 2") — the real set also includes
`missed`, which no screen currently sets; everything else built here used
valid values already.
Edit/cancel/mark-outcome actions are only shown when they make sense
(pending + not yet past for edit/cancel; pending + already past for
mark-outcome) — appointments that are cancelled/attended/completed render
as read-only. Not specified in the brief, seemed like the obvious
guardrail against e.g. cancelling something already marked attended.

### Screen 7 — History
Done: filters by unit, type, and date range, status badges. Fetches the
user's full past-appointment set once and filters in memory rather than
building dynamic PostgREST filter chains — simpler and safer than
composing multiple `.or()` calls, and the dataset is inherently scoped to
one user so it won't grow large enough for this to matter.
Same "upcoming/past" date-only split as Screen 2 — no time-of-day
precision.

### Screen 8 — Documents
Done: list of documents across all the user's appointments (or filtered to
one via `?appointment=`, linked from Appointment Detail), upload form tied
to an appointment picker.
The `documents` Storage bucket now exists (see "Post-build update 3") —
this screen should be functional.
Design decision worth a second look: `documents.file_url` is a free-text
column with no documented convention, so I chose to store the raw Storage
*path* there (not a public URL), and generate a short-lived signed URL
on demand each time the list renders. That was the only way I could see
to satisfy "private to that patient's owning account" for an upload
feature — a public URL would defeat that. If `file_url` was actually meant
to hold something else (a public URL, a CDN path), this needs revisiting.

### Screen 9 — Profile
Done: read-only account name/email (editing account details is left to
Clerk's own account menu, already reachable from the nav — didn't
duplicate that here), list of linked patients, add-a-patient form.
Judgment call: `relationship_to_owner` is a plain text field, not a
dropdown — didn't want to invent a closed vocabulary for a column with no
visible constraint. This is also where a user adds *themselves* as a
patient (e.g. relationship "Self") — the brief never has the app
auto-create a self-patient row, so a brand new user has zero patients
until they fill this in once. Screens 2 and 3 both handle that empty
state by pointing here.
No edit/remove for existing dependants — brief only asked for "add
dependant flow," so that's all that's here.

## Other things worth knowing

- **Every insert now sets `created_at`/`uploaded_at` explicitly**
  (`new Date().toISOString()`), rather than relying on a Postgres
  `DEFAULT now()` that may or may not exist. PostgREST's OpenAPI schema
  marks a column "required" purely from `NOT NULL` — it doesn't tell you
  whether a default is also configured — so I couldn't tell from read-only
  introspection alone. Setting it explicitly is correct either way, so
  this is a defensive choice, not a real open question.
- **`getOrCreateAppUser()`** (`src/lib/current-app-user.ts`) lazily creates
  a `users` row on first authenticated request, keyed on `clerk_user_id`.
  The brief doesn't set up a Clerk webhook for this, so there was no other
  trigger point available. This depends on the `users` table's RLS INSERT
  policy allowing a signed-in user to create their own row — unverified,
  same as everything else that touches Supabase.
- **`UserButton`'s `afterSignOutUrl` prop doesn't exist** in the installed
  Clerk version (`@clerk/nextjs` 7.5.18) — confirmed by reading the actual
  type definitions, not assumed. Removed it rather than pass an invalid
  prop. Post-sign-out redirect destination is presumably controlled by
  Clerk Dashboard/instance config now instead; worth checking that's set
  the way you want.
- **`middleware.ts` is `src/proxy.ts`**, not a typo — Next.js 16 renamed
  the file convention (same behavior, confirmed against the bundled docs
  in `node_modules/next/dist/docs`, not a guess).
- Screen 1 (Login/Register), built last session, had never actually been
  committed — it's now `503928f` in this session's history, ahead of the
  new screens, so the checkpoints below it are real diffs and not lumped
  into Screen 2.

## What "done" means here

Every screen: written, `npm run lint` clean, `npx tsc --noEmit` clean, dev
server starts with no compile errors, every route curl-tested for correct
public/redirect behavior. None of that proves the Supabase-backed
behavior is correct — only that nothing is obviously broken at the code
level. Treat every screen as "needs a real click-through" until that
Clerk↔Supabase pairing is done and someone actually uses it in a browser.

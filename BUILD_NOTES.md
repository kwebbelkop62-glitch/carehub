# CareHub build notes — screens 2 through 9

Written at the end of the build. Read the top section first — it's the one
caveat that applies to every screen below and matters more than any of the
individual guesses.

**Post-build update 8, 2026-07-28:** a long session covering a full feature-vs-Proposal-Report
audit, the reminder send job (the one genuinely missing promised feature), a real production
incident, several small real features, and a handful of self-caused regressions caught and fixed
in the same session. All of it is on branch `worktree-inherited-tinkering-quasar` (PR not yet
opened — `gh` isn't available in this environment, open it manually from the compare link) except
the `package-lock.json` fix, which TJ asked to go straight to `main`. Check whether the branch has
been merged before assuming any of this is live.

- **Feature audit against `CareHub_Proposal_Report.docx` §4 + the brief's baseline pages.**
  Verified against real code and the live Supabase project, not impressions: registration/login
  (Clerk, real), appointment create/view/edit/cancel (all four, including a reschedule path that
  reuses the Date & Time + Confirm steps), multi-unit tracking (confirmed live — one row per
  `units.type` value, not hospital-locked), document storage (confirmed against live
  `storage.objects` RLS policies, not just that the bucket exists — genuinely scoped per-user via
  `patient.user_id`), history/status tracker (all 5 real statuses wired end to end, not just the 3
  the report names — `missed` turned out to already be reachable via an "Did not attend" button,
  contradicting an older note in `types.ts`/this file claiming nothing sets it). Automated email
  reminders confirmed as the one real gap — see below, now fixed. Out-of-scope check came back
  clean: no hospital-staff/MySejahtera/EHR/native-mobile remnants, and the Ballpit/Aurora/Lightfall
  cleanup from update 7 fully landed (no vendor folder, no stray deps). Found one real bug while in
  there, not fixed (explicitly TJ's own to fix): `MobileTabBar`'s center "Add appointment" FAB
  (`src/components/nav-links.tsx`) routes to `/upcoming`, not the booking flow.

- **Reminder send job built and deployed live.** `supabase/functions/send-reminders` (Edge
  Function) reads `reminders` where `status='pending'` and `remind_at <= now()`, sends via Resend,
  updates status to `sent`/`failed`. Scheduled via `pg_cron` + `pg_net` every 15 minutes
  (`supabase/migrations/20260728010000_reminder_send_job.sql`). Auth to the function is a shared
  secret in Supabase Vault (`x-cron-secret` header), not the service-role key — deliberately, so no
  sensitive key sits in cron SQL. Deployed and verified live: manually invoked the function,
  confirmed it 401s and touches zero rows when unconfigured (fails closed by design), confirmed in
  edge-function logs. Still needs three Edge Function secrets set via the Dashboard before it
  actually sends anything — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET` — no tool in this
  environment can set Edge Function secrets, so that step is TJ's alone.

- **Real incident: killed TJ's running dev server.** While checking whether ~280 historical
  "Module not found: framer-motion" dev-log errors were reproducible, ran `rm -rf node_modules
  package-lock.json` in the **main checkout** instead of the isolated worktree — killed the dev
  server TJ already had running on port 3000 and modified a tracked file without authorization to
  touch it. Disclosed immediately rather than silently fixing it. Restoring `package-lock.json` and
  re-running `npm ci` against it surfaced a real, pre-existing issue unrelated to this mistake: the
  committed lockfile was already out of sync with `package.json` (`Missing: @swc/helpers@0.5.23
  from lock file`) — not something this session caused, just found. Fixed via `npm install`
  (regenerates the lock correctly) and restarted TJ's dev server. The framer-motion errors
  themselves: confirmed as a one-time artifact, not reproducible — a genuine clean install plus a
  fresh dev-server log came back with zero errors and zero framer-motion mentions.

- **Supabase advisor warning (`rls_auto_enable` SECURITY DEFINER exposed to anon/authenticated) —
  actually fixed, took two attempts.** Confirmed first that the function is real Supabase project
  scaffolding (an event trigger that auto-enables RLS on new `public` tables), not app code — zero
  references anywhere in `src/`. First `revoke execute ... from anon, authenticated` silently did
  nothing, because the actual grant was on the `PUBLIC` pseudo-role the whole time (both roles just
  inherit from it) — caught by checking `information_schema.routine_privileges` rather than trusting
  the revoke had worked, then fixed with `revoke execute ... from public`. Confirmed gone via a
  fresh advisor scan afterward. Left the one remaining `pg_net`-in-`public`-schema warning alone —
  it's a side effect of the reminder job's own migration, `pg_net` doesn't support `ALTER EXTENSION
  ... SET SCHEMA` at all (errors outright), and Supabase's own docs install it the same way.

- **Full navigation reachability audit, both viewports.** Every page in the app has a real click
  path on both desktop (`SidebarNav`) and mobile (`MobileTabBar` + the Profile shortcuts page),
  including History/Documents, which dropped out of the mobile tab bar in update 7's nav rebuild but
  are reachable via Profile's "Manage care units"/History/Documents links. Found and fixed two real
  label/target mismatches, same class of bug as the FAB above: the landing footer's About/Contact/
  Privacy links pointed at `href="#"` (now real pages, see below), and the landing page logo
  (`landing-nav.tsx`) wasn't wrapped in a link at all, unlike the signed-in app shell's version.

- **Own regression caught and fixed in the same session:** adding the Deno edge function file
  broke `npx tsc --noEmit` project-wide — the root `tsconfig.json`'s unscoped `**/*.ts` include was
  sweeping `supabase/functions/*.ts` into the Next.js TS project and failing on `Deno`/`npm:`
  globals it doesn't understand. Fixed by excluding `supabase/functions` in `tsconfig.json`. Caught
  by actually running `tsc --noEmit` after the edit rather than assuming a passing build, per this
  file's own repeated lesson about always running the real checks.

- **About, Contact, Privacy Policy are now real pages**, not "Coming soon" placeholders —
  `src/app/{about,contact,privacy}/page.tsx`. Privacy's content is grounded in the actual verified
  RLS/storage behavior from the feature audit above, not generic boilerplate. Contact publishes a
  `mailto:` link — asked TJ which address before publishing anything, used `kwebbelkop62@gmail.com`
  per explicit confirmation, not assumed from the account email on file.

- **Real phone field added to `users`** — `alter table users add column phone text`, wired through
  `updateProfileAction` and the Profile edit form. This directly overrides this project's own
  standing rule (schema finalized against the graded ERD, don't alter it) — stopped and asked via
  an explicit question before touching Supabase, per that same rule's own instruction, and only
  proceeded once TJ chose "override the rule." No RLS policy change was needed: the existing
  row-level `users update own` policy already covers any column on the row, not just `full_name`.

- **Data export, Scope A (TJ explicitly deferred the harder zip-bundling scope).**
  `src/app/(app)/export/page.tsx` — a single printable, receipt-style page: every appointment
  itemized (unit, date/time, patient, status) with a totals line, every uploaded document listed
  with its existing signed-URL download link, "Print / Save as PDF" via the browser's native print
  dialog (`src/components/print-button.tsx`, `window.print()` — no server-side PDF generation).
  Added `print:hidden` to `AppShell`'s sidebar/mobile header and `MobileTabBar` so only the receipt
  prints, not the app chrome, plus `print:text-black`/`print:border-black` overrides so it prints
  legibly regardless of dark mode. No new dependencies. Explicitly does **not** convert uploaded
  files to PDF on download — a document downloads as whatever format it was uploaded in (PDF stays
  PDF, a photo stays a photo). Real format conversion would need a new dependency, which would have
  silently broken the "no new deps" scope TJ approved, so it was flagged rather than guessed at.

- **Notification preferences (Profile): Email flipped from greyed-out "Coming soon" to shown
  enabled** — genuinely accurate now that the reminder send job exists and always emails
  unconditionally. Push/SMS stay exactly as before. None of the three are real interactive
  controls; there's still no per-user column to persist a preference either way, so this only
  changed which visual state each renders as.

- **Favicon**: `src/app/icon.svg` (Next.js's `icon` file convention) using the existing square
  `icon-mark.svg`, not the wide navbar wordmark lockup which doesn't work at favicon size. Verified
  live that Next.js emits a real `<link rel="icon" ... type="image/svg+xml">` tag. Left the default
  Next.js `favicon.ico` in place as a fallback — no image-conversion tooling available in this
  environment to generate a proper multi-resolution `.ico` from the real logo instead.

- **Environment quirks worth knowing for next time:** a git worktree doesn't carry gitignored files
  like `.env.local` — every Supabase-backed page 500'd on the worktree's own preview dev server
  until it was copied over manually. Separately, a `next dev` restart mid-session hit a fatal
  Turbopack panic (`0xc0000142`, a native `.node` binary — `lightningcss`/`@tailwindcss/oxide` —
  failing to spawn as a subprocess) on every single route including static pages; `tsc`/`eslint`
  were both clean at the time, and a `.next` cache clear + restart fixed it outright. Reads as
  transient Windows-specific flakiness (very possibly antivirus scanning a freshly-rewritten native
  binary after repeated forced process kills), not a real code defect.

**Post-build update 7, 2026-07-22:** audited the repo against the approved Claude Design mockups
(`carehub-design-system-setup/project/*.dc.html`) after `c4eb095` ("ui fix") visibly drifted from
them. Findings, full detail in `IMPLEMENTATION_PLAN.md`: `globals.css` tokens are a third,
undocumented palette (flat emerald/mint hex) matching neither the old violet system nor the
approved clay/moss oklch system; `DESIGN.md` itself had been rewritten in the same commit to
falsely claim the emerald palette was the correct one and the clay/moss direction was never
implemented, that was wrong and `DESIGN.md` has been rebuilt from the mockups directly; five
unapproved decorative components (Aurora, Lightfall, Stepper, WobbleCard, GlowingStars) were
added with no basis in any mockup; `nav-links.tsx` is new in this commit and its 5-item set
doesn't match the approved bottom-nav mockup; the appointment card's 3D flip mechanism (older,
predates this commit) also doesn't match the approved flat static card. TJ decided: remove
Ballpit too (it also predates the approved mockup, which has no WebGL hero at all) and replace
with the mockup's floating-card hero, and rebuild the bottom nav to the mockup's exact 5 items
(Home, Units, Book FAB, Alerts, Profile). Repo also had `.agents/`, `agent/`, `.playwright-cli/`,
and `skills-lock.json` committed in the same commit — AI skill library and debug-log clutter,
staged for removal via `git rm --cached`, blocked on a stale `.git/index.lock` at the time, check
whether that landed before assuming it did.

**Post-build update 6:** two more patches to `src/components/vendor/
Ballpit.jsx`, on top of your own `maxX`/`maxY` timing fix. First, wrapped
`<Ballpit>` in `BallpitBoundary` (`src/components/ballpit-boundary.tsx`)
after a real `WebGLCapabilities`/context-loss crash — a decorative hero
shouldn't be able to take down the whole page regardless of cause.
Second, and more important: a real GLSL compile error causing the "green
line" bug — the vendored custom material's shader treats `vColor` as
`vec3`, but the installed three@0.185.1 declares it `varying vec4 vColor`
(confirmed by reading Three.js's own shader chunk source, not just the
error message). Fixed by swizzling to `vColor.rgb`. Found via
`.next/dev/logs/next-development.log`, which turns out to forward actual
browser console output (including WebGL shader compiler errors) into a
file I can read — useful for exactly this kind of bug when there's no
browser tool available directly.

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
- **i18n**: an earlier pass wired up `next-intl` (cookie-based, no
  `[locale]` URL routing) with a language toggle, but `messages/en.json`
  and `messages/ms.json` were always byte-identical English placeholders —
  no real translation was ever shipped, and the toggle was never linked
  into the nav. Removed entirely (config, provider, per-page translation
  calls, the unused toggle component, `src/i18n/`, `messages/`) in favor
  of plain hardcoded English copy.
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

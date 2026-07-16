# CareHub build notes — screens 2 through 9

Written at the end of the build. Read the top section first — it's the one
caveat that applies to every screen below and matters more than any of the
individual guesses.

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

## Two things intentionally not built

- **Reminders send job.** Screen 6 and the Confirm action insert a
  `reminders` row (channel `email`, status `pending`) when an appointment
  is booked, and update it on cancel. Nothing sends the email or runs on a
  schedule — no Supabase Edge Function, no cron. That's a deliberate stop,
  per your instruction, for you and me to do together.
- **Documents storage bucket.** Screen 8's upload code targets a Storage
  bucket named `documents`. I checked (read-only, via the Storage API) and
  **no bucket exists yet** — Storage hasn't been set up at all. I didn't
  create one, since that felt like the same category of "infrastructure
  decision" as a schema change even though you didn't mention Storage by
  name. The bucket needs to be created with policies that keep documents
  private to the owning patient's account (mirroring the Postgres RLS
  model) before this screen can do anything but fail on upload.

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
Guessed: `units.type` values (`hospital`, `clinic`, `lab`, `scan_center`)
— the column is free text with no CHECK constraint visible from read-only
introspection, so this is inferred from the brief's own wording, not
verified against the live data.
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
Guessed: `appointments.status` vocabulary is `pending` / `attended` /
`completed` / `cancelled`. Same caveat as units.type — free text column,
no CHECK constraint visible, inferred from History's screen description.
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
**Will not work yet** — see "Documents storage bucket" above. The code
path is complete and typechecks; it just has nowhere to actually put
files until the bucket exists.
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

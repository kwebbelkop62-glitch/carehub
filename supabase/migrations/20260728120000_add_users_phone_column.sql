-- Adds a phone column to users, at TJ's explicit request overriding the
-- project's normal "schema is finalized against the graded ERD, don't
-- alter it" rule (see CLAUDE.md) -- confirmed via AskUserQuestion before
-- applying, not guessed around.
--
-- No RLS policy change needed: the existing "users update own" policy
-- (clerk_user_id = auth.jwt()->>'sub') is row-level, not column-scoped, so
-- it already covers this new column the same way it covers full_name.
alter table public.users add column phone text;

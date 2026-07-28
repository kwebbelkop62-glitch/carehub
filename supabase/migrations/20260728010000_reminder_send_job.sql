-- Reminder send job: schedules pg_cron to call the send-reminders Edge
-- Function every 15 minutes. The function itself (supabase/functions/
-- send-reminders/index.ts) reads reminders where status = 'pending' and
-- remind_at <= now(), sends one email per reminder via Resend, and updates
-- each reminder's status to 'sent' or 'failed'.
--
-- Auth to the function is a shared secret, not the service_role/JWT, kept
-- out of this file: it lives in Supabase Vault as 'reminder_cron_secret'
-- (set via `select vault.create_secret(...)` once, outside of migrations
-- since migration files are committed to git) and must match the
-- CRON_SECRET function secret set on send-reminders.
--
-- 15 minutes is a starting point, not a fixed requirement -- adjust with
-- `select cron.alter_job(job_id, schedule := '<new cron expression>')`
-- (find job_id via `select * from cron.job where jobname = 'send-reminders-job';`).

create extension if not exists pg_cron;
create extension if not exists pg_net;

select
  cron.schedule(
    'send-reminders-job',
    '*/15 * * * *',
    $$
    select net.http_post(
      url := 'https://gavbbxfsfcpscsepawbd.supabase.co/functions/v1/send-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'reminder_cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    ) as request_id;
    $$
  );

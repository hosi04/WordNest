-- Study reminders (web push). Run once in Supabase > SQL Editor, AFTER the app with /api/send-reminders
-- is deployed. Replace <CRON_SECRET> below with the CRON_SECRET value from .env.local / Vercel.

-- 1. Devices that turned reminders on, with their reminder hour (Vietnam time, default 19:00).
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  remind_hour smallint not null default 19 check (remind_hour between 0 and 23),
  created_at timestamptz default now()
);
create index on push_subscriptions (remind_hour);

alter table push_subscriptions enable row level security;
create policy "own push subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Scheduler + HTTP from Postgres (both available on the free plan).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 3. Every hour on the hour: remind devices whose hour is now and whose user has no review today.
select cron.schedule(
  'hosi-study-reminder',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://word-nest-gamma.vercel.app/api/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body := jsonb_build_object('subscriptions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'endpoint', s.endpoint,
        'p256dh', s.p256dh,
        'auth', s.auth,
        'hour', s.remind_hour,
        'lang', coalesce(u.raw_user_meta_data ->> 'ui_language', 'vi')
      ))
      from push_subscriptions s
      join auth.users u on u.id = s.user_id
      where s.remind_hour = extract(hour from now() at time zone 'Asia/Ho_Chi_Minh')::int
        and not exists (
          select 1 from reviews r
          where r.user_id = s.user_id
            and r.reviewed_at >= date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh'
        )
    ), '[]'::jsonb)),
    timeout_milliseconds := 20000
  );
  $$
);

-- 4. Five minutes later: forget devices the push service reported as gone (app removed / blocked).
select cron.schedule(
  'hosi-push-cleanup',
  '5 * * * *',
  $$
  delete from push_subscriptions
  where endpoint in (
    select jsonb_array_elements_text(content::jsonb -> 'gone')
    from net._http_response
    where created > now() - interval '1 hour'
      and status_code = 200
      and content like '{"sent"%'
  );
  $$
);

-- Check it later:
--   select * from cron.job;                                             -- the two jobs
--   select jobname, status, start_time from cron.job_run_details
--     join cron.job using (jobid) order by start_time desc limit 10;     -- recent runs
--   select status_code, content, created from net._http_response
--     order by created desc limit 10;                                   -- what the API answered
-- To stop reminders: select cron.unschedule('hosi-study-reminder');

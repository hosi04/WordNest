-- Update 2 (2026-10-18): streaks no longer reset. A day without study freezes the streak and the
-- next study day thaws it (without adding a day), so streak = study days − gaps between them.
-- Reminders now get that streak plus whether it is frozen.
-- Run once in Supabase > SQL Editor. It re-creates the hourly job with the new query and keeps
-- the CRON_SECRET already stored in the existing job, so you don't need to paste it again.

select cron.schedule(
  'hosi-study-reminder',
  '0 * * * *',
  format($job$
  select net.http_post(
    url := 'https://word-nest-gamma.vercel.app/api/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer %s'
    ),
    body := jsonb_build_object('subscriptions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'endpoint', s.endpoint,
        'p256dh', s.p256dh,
        'auth', s.auth,
        'hour', s.remind_hour,
        'lang', coalesce(u.raw_user_meta_data ->> 'ui_language', 'vi'),
        -- display name from Settings, else the username (email without the internal domain)
        'name', coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)),
        -- the streak before today: study days minus gaps (each gap = one thaw day that added nothing)
        'streak', (
          select count(*) - count(*) filter (where gap)
          from (
            select d - lag(d) over (order by d) > 1 as gap
            from (select distinct (r.reviewed_at at time zone 'Asia/Ho_Chi_Minh')::date as d
                  from reviews r
                  where r.user_id = s.user_id
                    and (r.reviewed_at at time zone 'Asia/Ho_Chi_Minh')::date < (now() at time zone 'Asia/Ho_Chi_Minh')::date
                 ) days
          ) gaps
        ),
        -- frozen: the last study day is before yesterday (a whole day went by without study)
        'frozen', coalesce((
          select max((r.reviewed_at at time zone 'Asia/Ho_Chi_Minh')::date)
          from reviews r where r.user_id = s.user_id
        ) < (now() at time zone 'Asia/Ho_Chi_Minh')::date - 1, false)
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
  $job$,
  (select substring(command from 'Bearer ([^'']+)') from cron.job where jobname = 'hosi-study-reminder')
  )
);

-- Check: the job still has a real secret (should return false) and mentions the new fields.
select command like '%<CRON_SECRET>%' or command not like '%Bearer %' as secret_missing,
       command like '%''frozen''%' as has_frozen
from cron.job where jobname = 'hosi-study-reminder';

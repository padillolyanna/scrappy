-- ── voting periods: close expired, seed fresh ones ──────────────────────────

update public.voting_periods set status = 'closed'
where status = 'active' and end_at < now();

insert into public.voting_periods (category_id, start_at, end_at, status)
select vc.id, now(),
  case when vc.voting_type = 'daily' then now() + interval '24 hours'
       else now() + interval '7 days' end,
  'active'
from public.voting_categories vc
where vc.is_active = true
  and not exists (
    select 1 from public.voting_periods vp
    where vp.category_id = vc.id
      and vp.status = 'active'
      and vp.end_at > now()
  );

-- Called by an admin or cron to roll over expired periods.
create or replace function public.refresh_voting_periods()
returns void language plpgsql security definer set search_path = public as $$
begin
  update voting_periods set status = 'closed'
  where status = 'active' and end_at < now();

  insert into voting_periods (category_id, start_at, end_at, status)
  select vc.id, now(),
    case when vc.voting_type = 'daily' then now() + interval '24 hours'
         else now() + interval '7 days' end,
    'active'
  from voting_categories vc
  where vc.is_active = true
    and not exists (
      select 1 from voting_periods vp
      where vp.category_id = vc.id
        and vp.status = 'active'
        and vp.end_at > now()
    );
end $$;
grant execute on function public.refresh_voting_periods() to authenticated;

-- ── hangout RSVP capacity: enforce max server-side ───────────────────────────

create or replace function public.check_hangout_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_confirmed int;
  v_max int;
begin
  if NEW.status = 'confirmed' then
    if TG_OP = 'INSERT' then
      select count(*) into v_confirmed
      from hangout_rsvps
      where hangout_id = NEW.hangout_id and status = 'confirmed';
    else
      select count(*) into v_confirmed
      from hangout_rsvps
      where hangout_id = NEW.hangout_id and status = 'confirmed' and id <> NEW.id;
    end if;

    select max_participants into v_max
    from hangouts where id = NEW.hangout_id;

    if v_confirmed >= coalesce(v_max, 20) then
      NEW.status := 'waitlisted';
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists enforce_hangout_capacity on public.hangout_rsvps;
create trigger enforce_hangout_capacity
  before insert or update on public.hangout_rsvps
  for each row execute function public.check_hangout_capacity();

-- ── daily prompts: extend schedule ───────────────────────────────────────────

insert into public.daily_prompts (question_text, date) values
  ('What would your 10-year-old self think of you now?',                    '2026-11-26'),
  ('What colour best describes your mood this week?',                        '2026-11-27'),
  ('Describe your dream bedroom in three words.',                            '2026-11-28'),
  ('What song is permanently stuck in your head?',                           '2026-11-29'),
  ('What is the most underrated thing in your everyday life?',               '2026-11-30'),
  ('If you could only keep five photos, which moments would they capture?',  '2026-12-01'),
  ('What habit are you secretly proud of?',                                  '2026-12-02'),
  ('Who taught you the most important lesson you know?',                     '2026-12-03'),
  ('What place feels most like home to you?',                                '2026-12-04'),
  ('What is something small that always makes you smile?',                   '2026-12-05'),
  ('If your life had a movie soundtrack, what song plays right now?',        '2026-12-06'),
  ('What is the last thing that genuinely surprised you?',                   '2026-12-07'),
  ('What would you tell someone who is having a hard day?',                  '2026-12-08'),
  ('What childhood game do you still think about?',                          '2026-12-09'),
  ('What is one thing you want to try before the year ends?',                '2026-12-10'),
  ('What smell instantly takes you back in time?',                           '2026-12-11'),
  ('Who is someone you have been meaning to reach out to?',                  '2026-12-12'),
  ('What is the most beautiful ordinary thing in your life?',                '2026-12-13'),
  ('What do you do when you need to feel better instantly?',                 '2026-12-14'),
  ('What is a tradition you want to start this year?',                       '2026-12-15')
on conflict (date) do nothing;

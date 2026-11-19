-- Add admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean default false;

-- Admin policy: admins can read all profiles
create policy "Admins can read all profiles" on public.profiles
  for select using (
    auth.uid() in (select id from public.profiles where is_admin = true)
  );

-- Allow admins to update any confession (approve/reject/delete)
create policy "Admins can update any confession" on public.confessions
  for update using (
    auth.uid() in (select id from public.profiles where is_admin = true)
  );

create policy "Admins can delete any confession" on public.confessions
  for delete using (
    auth.uid() in (select id from public.profiles where is_admin = true)
  );

-- Allow admins to read ALL confessions including unapproved
create policy "Admins can read all confessions" on public.confessions
  for select using (
    auth.uid() in (select id from public.profiles where is_admin = true)
  );

-- Analytics view for admins
create or replace view public.admin_stats as
  select
    (select count(*) from public.profiles) as total_users,
    (select count(*) from public.scrapbooks) as total_scrapbooks,
    (select count(*) from public.scrapbooks where is_public = true) as public_scrapbooks,
    (select count(*) from public.confessions) as total_confessions,
    (select count(*) from public.confessions where is_approved = false) as pending_confessions,
    (select count(*) from public.confessions where created_at > now() - interval '24 hours') as confessions_today,
    (select count(*) from public.profiles where created_at > now() - interval '24 hours') as new_users_today,
    (select count(*) from public.scrapbooks where created_at > now() - interval '24 hours') as scrapbooks_today;

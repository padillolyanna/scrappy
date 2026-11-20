-- MySpace-style profiles: customisable look, extra boxes, presence, comments

alter table public.profiles
  add column if not exists profile_style jsonb not null default '{}'::jsonb,
  add column if not exists profile_extras jsonb not null default '{}'::jsonb,
  add column if not exists last_seen_at timestamptz;

-- Profile comment wall
create table if not exists public.profile_comments (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz default now()
);

create index if not exists profile_comments_profile_idx
  on public.profile_comments (profile_id, created_at desc);

alter table public.profile_comments enable row level security;

drop policy if exists "Profile comments are public" on public.profile_comments;
create policy "Profile comments are public" on public.profile_comments
  for select using (true);

drop policy if exists "Signed-in users can comment as themselves" on public.profile_comments;
create policy "Signed-in users can comment as themselves" on public.profile_comments
  for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "Authors and profile owners can delete comments" on public.profile_comments;
create policy "Authors and profile owners can delete comments" on public.profile_comments
  for delete to authenticated using (auth.uid() = author_id or auth.uid() = profile_id);

-- Let the profile owner know when someone leaves a comment
create or replace function public.notify_profile_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  author_name text;
  owner_name text;
begin
  if new.author_id = new.profile_id then
    return new;
  end if;
  select username into author_name from public.profiles where id = new.author_id;
  select username into owner_name from public.profiles where id = new.profile_id;
  insert into public.notifications (user_id, type, message, link)
  values (new.profile_id, 'profile_comment', '@' || coalesce(author_name, 'someone') || ' left a comment on your profile ♡', '/profile/' || owner_name);
  return new;
end;
$$;

drop trigger if exists on_profile_comment on public.profile_comments;
create trigger on_profile_comment
  after insert on public.profile_comments
  for each row execute function public.notify_profile_comment();

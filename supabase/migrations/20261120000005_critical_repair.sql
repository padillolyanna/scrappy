-- Critical backend repair
-- 1. Improved handle_new_user trigger with username conflict handling
-- 2. Repair function for existing auth users without profiles
-- 3. avatars storage bucket + policies
-- 4. photobooth bucket + photobooth_sessions table + policies
-- 5. confession_reactions table for atomic safe reactions
-- 6. prompt_answers unique constraint + update/delete policies
-- 7. scrapbooks updated_at auto-trigger

-- ============================================================
-- IMPROVED PROFILE CREATION TRIGGER
-- Handles username conflicts by appending a numeric suffix
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );
  base_username := lower(regexp_replace(base_username, '[^a-z0-9_]', '', 'g'));
  if length(base_username) < 2 then
    base_username := 'user';
  end if;
  base_username := left(base_username, 20);

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := left(base_username, 17) || counter::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      final_username
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- REPAIR MISSING PROFILES
-- Creates profiles for any auth users who don't have one yet
-- ============================================================
create or replace function public.repair_missing_profiles()
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  r record;
  base_username text;
  final_username text;
  counter int;
begin
  for r in
    select u.id, u.email, u.raw_user_meta_data
    from auth.users u
    left join public.profiles p on p.id = u.id
    where p.id is null
  loop
    counter := 0;
    base_username := coalesce(
      nullif(trim(r.raw_user_meta_data->>'username'), ''),
      split_part(r.email, '@', 1)
    );
    base_username := lower(regexp_replace(base_username, '[^a-z0-9_]', '', 'g'));
    if length(base_username) < 2 then
      base_username := 'user';
    end if;
    base_username := left(base_username, 20);

    final_username := base_username;

    while exists (select 1 from public.profiles where username = final_username) loop
      counter := counter + 1;
      final_username := left(base_username, 17) || counter::text;
    end loop;

    insert into public.profiles (id, username, display_name)
    values (
      r.id,
      final_username,
      coalesce(
        nullif(trim(r.raw_user_meta_data->>'display_name'), ''),
        final_username
      )
    )
    on conflict (id) do nothing;
  end loop;
end;
$$;

select public.repair_missing_profiles();

-- ============================================================
-- AVATARS STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- PHOTOBOOTH BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photobooth', 'photobooth', true)
on conflict (id) do nothing;

drop policy if exists "Photobooth strips are publicly readable" on storage.objects;
create policy "Photobooth strips are publicly readable" on storage.objects
  for select using (bucket_id = 'photobooth');

drop policy if exists "Users can upload their photobooth strips" on storage.objects;
create policy "Users can upload their photobooth strips" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photobooth' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their photobooth strips" on storage.objects;
create policy "Users can delete their photobooth strips" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photobooth' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- PHOTOBOOTH SESSIONS TABLE
-- ============================================================
create table if not exists public.photobooth_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  layout_id text not null default 'classic',
  strip_url text,
  photo_count int default 4,
  filter_id text default 'none',
  frame_id text default 'none',
  status text default 'completed' check (status in ('draft', 'completed')),
  created_at timestamptz default now()
);

create index if not exists photobooth_sessions_user_idx
  on public.photobooth_sessions (user_id, created_at desc);

alter table public.photobooth_sessions enable row level security;

drop policy if exists "Users can view their own photobooth sessions" on public.photobooth_sessions;
create policy "Users can view their own photobooth sessions" on public.photobooth_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create photobooth sessions" on public.photobooth_sessions;
create policy "Users can create photobooth sessions" on public.photobooth_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their photobooth sessions" on public.photobooth_sessions;
create policy "Users can update their photobooth sessions" on public.photobooth_sessions
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their photobooth sessions" on public.photobooth_sessions;
create policy "Users can delete their photobooth sessions" on public.photobooth_sessions
  for delete using (auth.uid() = user_id);

-- ============================================================
-- CONFESSION REACTIONS TABLE (atomic, per-user)
-- Replaces the insecure direct reaction_count increment
-- ============================================================
create table if not exists public.confession_reactions (
  id uuid default gen_random_uuid() primary key,
  confession_id uuid references public.confessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (confession_id, user_id)
);

alter table public.confession_reactions enable row level security;

drop policy if exists "Confession reactions are public" on public.confession_reactions;
create policy "Confession reactions are public" on public.confession_reactions
  for select using (true);

drop policy if exists "Users can react to confessions" on public.confession_reactions;
create policy "Users can react to confessions" on public.confession_reactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own reactions" on public.confession_reactions;
create policy "Users can remove their own reactions" on public.confession_reactions
  for delete using (auth.uid() = user_id);

-- Toggle reaction and return updated count
create or replace function public.toggle_confession_reaction(
  p_confession_id uuid,
  p_user_id uuid
)
returns int language plpgsql security definer set search_path = public as $$
declare
  existing_id uuid;
  new_count int;
begin
  select id into existing_id
  from public.confession_reactions
  where confession_id = p_confession_id and user_id = p_user_id;

  if existing_id is null then
    insert into public.confession_reactions (confession_id, user_id)
    values (p_confession_id, p_user_id);
    update public.confessions
    set reaction_count = reaction_count + 1
    where id = p_confession_id;
  else
    delete from public.confession_reactions where id = existing_id;
    update public.confessions
    set reaction_count = greatest(0, reaction_count - 1)
    where id = p_confession_id;
  end if;

  select reaction_count into new_count from public.confessions where id = p_confession_id;
  return new_count;
end;
$$;

-- ============================================================
-- PROMPT ANSWERS — update/delete policies + prevent duplicates
-- ============================================================
drop policy if exists "Users can update their own prompt answers" on public.prompt_answers;
create policy "Users can update their own prompt answers" on public.prompt_answers
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own prompt answers" on public.prompt_answers;
create policy "Users can delete their own prompt answers" on public.prompt_answers
  for delete using (auth.uid() = user_id);

-- Unique answer per user per prompt (safe — only applies to new rows going forward)
create unique index if not exists prompt_answers_unique_user_prompt
  on public.prompt_answers (prompt_id, user_id)
  where user_id is not null;

-- ============================================================
-- SCRAPBOOKS: auto-update updated_at on every save
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scrapbooks_updated_at on public.scrapbooks;
create trigger scrapbooks_updated_at
  before update on public.scrapbooks
  for each row execute function public.set_updated_at();

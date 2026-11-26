-- ============================================================
-- Follow System Migration
-- ============================================================

-- follows table
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check(follower_id != following_id)
);

alter table public.follows enable row level security;

-- follow_requests table (for private accounts)
create table public.follow_requests (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(requester_id, recipient_id),
  check(requester_id != recipient_id)
);

alter table public.follow_requests enable row level security;

-- ============================================================
-- RLS POLICIES: follows
-- ============================================================

-- select: own follows, or follows of a public profile
create policy "follows_select" on public.follows
  for select using (
    follower_id = auth.uid()
    or following_id = auth.uid()
    or (
      exists (
        select 1 from public.profiles
        where id = following_id and is_public = true
      )
    )
  );

-- insert: only as yourself
create policy "follows_insert" on public.follows
  for insert with check (follower_id = auth.uid());

-- delete: only your own follows
create policy "follows_delete" on public.follows
  for delete using (follower_id = auth.uid());

-- ============================================================
-- RLS POLICIES: follow_requests
-- ============================================================

create policy "follow_requests_select" on public.follow_requests
  for select using (
    requester_id = auth.uid() or recipient_id = auth.uid()
  );

create policy "follow_requests_insert" on public.follow_requests
  for insert with check (requester_id = auth.uid());

create policy "follow_requests_delete" on public.follow_requests
  for delete using (
    requester_id = auth.uid() or recipient_id = auth.uid()
  );

-- ============================================================
-- RPC: send_follow_or_request
-- ============================================================

create or replace function public.send_follow_or_request(p_target_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_viewer_id uuid;
  v_target_public boolean;
  v_username text;
  v_target_username text;
begin
  v_viewer_id := auth.uid();
  if v_viewer_id is null then
    raise exception 'not authenticated';
  end if;

  if v_viewer_id = p_target_id then
    raise exception 'cannot follow yourself';
  end if;

  select is_public into v_target_public from public.profiles where id = p_target_id;
  if not found then
    raise exception 'target profile not found';
  end if;

  select username into v_username from public.profiles where id = v_viewer_id;
  select username into v_target_username from public.profiles where id = p_target_id;

  if coalesce(v_target_public, true) then
    -- public account: follow directly
    insert into public.follows (follower_id, following_id)
    values (v_viewer_id, p_target_id)
    on conflict do nothing;

    -- notify the followed user
    insert into public.notifications (user_id, type, message, link, is_read)
    values (
      p_target_id,
      'follow',
      v_username || ' started following you ✦',
      '/profile/' || v_username,
      false
    );

    return 'followed';
  else
    -- private account: create a follow request
    insert into public.follow_requests (requester_id, recipient_id)
    values (v_viewer_id, p_target_id)
    on conflict do nothing;

    -- notify the recipient
    insert into public.notifications (user_id, type, message, link, is_read)
    values (
      p_target_id,
      'follow_request',
      v_username || ' wants to follow you ✦',
      '/profile/' || v_username,
      false
    );

    return 'requested';
  end if;
end;
$$;

-- ============================================================
-- RPC: accept_follow_request
-- ============================================================

create or replace function public.accept_follow_request(p_requester_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_viewer_id uuid;
  v_viewer_username text;
begin
  v_viewer_id := auth.uid();
  if v_viewer_id is null then
    raise exception 'not authenticated';
  end if;

  -- verify the request exists for this user
  if not exists (
    select 1 from public.follow_requests
    where requester_id = p_requester_id and recipient_id = v_viewer_id
  ) then
    raise exception 'follow request not found';
  end if;

  select username into v_viewer_username from public.profiles where id = v_viewer_id;

  -- move request to follows
  insert into public.follows (follower_id, following_id)
  values (p_requester_id, v_viewer_id)
  on conflict do nothing;

  -- delete the request
  delete from public.follow_requests
  where requester_id = p_requester_id and recipient_id = v_viewer_id;

  -- notify the requester
  insert into public.notifications (user_id, type, message, link, is_read)
  values (
    p_requester_id,
    'follow_accepted',
    v_viewer_username || ' accepted your follow request ✦',
    '/profile/' || v_viewer_username,
    false
  );

  return 'ok';
end;
$$;

-- ============================================================
-- RPC: decline_follow_request
-- ============================================================

create or replace function public.decline_follow_request(p_requester_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_viewer_id uuid;
begin
  v_viewer_id := auth.uid();
  if v_viewer_id is null then
    raise exception 'not authenticated';
  end if;

  delete from public.follow_requests
  where requester_id = p_requester_id and recipient_id = v_viewer_id;

  return 'ok';
end;
$$;

-- ============================================================
-- RPC: cancel_follow_request
-- ============================================================

create or replace function public.cancel_follow_request(p_recipient_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_viewer_id uuid;
begin
  v_viewer_id := auth.uid();
  if v_viewer_id is null then
    raise exception 'not authenticated';
  end if;

  delete from public.follow_requests
  where requester_id = v_viewer_id and recipient_id = p_recipient_id;

  return 'ok';
end;
$$;

-- ============================================================
-- RPC: unfollow_user
-- ============================================================

create or replace function public.unfollow_user(p_target_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_viewer_id uuid;
begin
  v_viewer_id := auth.uid();
  if v_viewer_id is null then
    raise exception 'not authenticated';
  end if;

  delete from public.follows
  where follower_id = v_viewer_id and following_id = p_target_id;

  return 'ok';
end;
$$;

-- ============================================================
-- RPC: get_follow_state
-- ============================================================

create or replace function public.get_follow_state(p_viewer_id uuid, p_target_id uuid)
returns table(
  is_following boolean,
  is_requested boolean,
  is_private boolean,
  follower_count bigint,
  following_count bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query
  select
    exists (
      select 1 from public.follows
      where follower_id = p_viewer_id and following_id = p_target_id
    ) as is_following,
    exists (
      select 1 from public.follow_requests
      where requester_id = p_viewer_id and recipient_id = p_target_id
    ) as is_requested,
    coalesce(
      (select not is_public from public.profiles where id = p_target_id),
      false
    ) as is_private,
    (
      select count(*) from public.follows where following_id = p_target_id
    ) as follower_count,
    (
      select count(*) from public.follows where follower_id = p_target_id
    ) as following_count;
end;
$$;

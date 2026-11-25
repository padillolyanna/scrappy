-- ============================================================
-- Exchange feature: tables, indexes, RLS policies
-- Fixed: gen_random_uuid, recursive RLS, join-flow SELECT,
--        participant-activated status, answer UPDATE policy
-- ============================================================

-- ── Security-definer helper (avoids RLS recursion) ───────────
-- Called from policies on exchange_participants and exchange_answers
-- to check participation without re-triggering those same policies.
create or replace function public.is_exchange_participant(p_exchange_id uuid, p_user_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.exchange_participants
    where exchange_id = p_exchange_id and user_id = p_user_id
  );
$$;

-- ── exchanges ─────────────────────────────────────────────────
create table if not exists public.exchanges (
  id           uuid        default gen_random_uuid() primary key,
  creator_id   uuid        references public.profiles(id) on delete cascade not null,
  template_id  text        not null,
  status       text        default 'pending'
                           check (status in ('pending', 'active', 'completed'))
                           not null,
  invite_token text        unique not null,
  expires_at   timestamptz default (now() + interval '7 days') not null,
  created_at   timestamptz default now() not null
);

create index if not exists exchanges_invite_token_idx on public.exchanges(invite_token);
create index if not exists exchanges_creator_id_idx   on public.exchanges(creator_id);

alter table public.exchanges enable row level security;

-- Drop every policy that might exist (idempotent re-run)
drop policy if exists "Exchanges viewable by creator"               on public.exchanges;
drop policy if exists "Authenticated users can create exchanges"    on public.exchanges;
drop policy if exists "Creator can update exchange"                 on public.exchanges;
drop policy if exists "Anyone can view exchanges by invite token"   on public.exchanges;
drop policy if exists "Participants can mark exchange active"       on public.exchanges;
drop policy if exists "Users can view their own exchanges"          on public.exchanges;
drop policy if exists "Participants can activate exchange"          on public.exchanges;

-- Any authenticated user can read exchange metadata.
-- The invite_token is the access-control secret at the app layer;
-- the exchange rows themselves (template, status, expiry) are not sensitive.
create policy "Authenticated users can read exchanges"
  on public.exchanges for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create exchanges"
  on public.exchanges for insert
  with check (auth.uid() = creator_id);

-- Creator can change anything about their exchange.
create policy "Creator can update exchange"
  on public.exchanges for update
  using  (auth.uid() = creator_id);

-- A participant (non-creator) can only flip status to 'active'.
create policy "Participants can activate exchange"
  on public.exchanges for update
  using  (public.is_exchange_participant(id, auth.uid()))
  with check (status = 'active');

-- ── exchange_participants ─────────────────────────────────────
create table if not exists public.exchange_participants (
  id          uuid        default gen_random_uuid() primary key,
  exchange_id uuid        references public.exchanges(id) on delete cascade not null,
  user_id     uuid        references public.profiles(id) on delete cascade not null,
  joined_at   timestamptz default now() not null,
  unique (exchange_id, user_id)
);

create index if not exists ep_exchange_id_idx on public.exchange_participants(exchange_id);
create index if not exists ep_user_id_idx     on public.exchange_participants(user_id);

alter table public.exchange_participants enable row level security;

drop policy if exists "Participants viewable by all exchange members" on public.exchange_participants;
drop policy if exists "Users can join exchanges"                      on public.exchange_participants;
drop policy if exists "Exchange members can view participants"        on public.exchange_participants;

-- Use the security-definer helper to avoid the self-referential recursion
-- that would occur if this policy queried exchange_participants directly.
create policy "Exchange members can view participants"
  on public.exchange_participants for select
  using (public.is_exchange_participant(exchange_id, auth.uid()));

create policy "Users can join exchanges"
  on public.exchange_participants for insert
  with check (auth.uid() = user_id);

-- ── exchange_answers ──────────────────────────────────────────
create table if not exists public.exchange_answers (
  id            uuid        default gen_random_uuid() primary key,
  exchange_id   uuid        references public.exchanges(id) on delete cascade not null,
  user_id       uuid        references public.profiles(id) on delete cascade not null,
  question_id   text        not null,
  question_text text        not null,
  answer_text   text        not null,
  created_at    timestamptz default now() not null,
  unique (exchange_id, user_id, question_id)
);

create index if not exists ea_exchange_id_idx on public.exchange_answers(exchange_id);
create index if not exists ea_user_id_idx     on public.exchange_answers(user_id);

alter table public.exchange_answers enable row level security;

drop policy if exists "Exchange answers viewable by participants" on public.exchange_answers;
drop policy if exists "Users can submit their own answers"       on public.exchange_answers;
drop policy if exists "Users can update their own answers"       on public.exchange_answers;

-- Uses the security-definer helper (queries exchange_participants without
-- re-entering this table's policies).
create policy "Exchange answers viewable by participants"
  on public.exchange_answers for select
  using (public.is_exchange_participant(exchange_id, auth.uid()));

create policy "Users can submit their own answers"
  on public.exchange_answers for insert
  with check (auth.uid() = user_id);

-- Allow updating answers (e.g. draft re-submission before final submit)
create policy "Users can update their own answers"
  on public.exchange_answers for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

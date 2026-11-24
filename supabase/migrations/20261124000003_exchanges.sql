-- exchanges
create table if not exists public.exchanges (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  template_id text not null,
  status text default 'pending',
  invite_token text unique not null,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);
alter table public.exchanges enable row level security;
create policy "Exchanges viewable by creator" on public.exchanges
  for select using (auth.uid() = creator_id);
create policy "Authenticated users can create exchanges" on public.exchanges
  for insert with check (auth.uid() = creator_id);
create policy "Creator can update exchange" on public.exchanges
  for update using (auth.uid() = creator_id);

-- exchange participants
create table if not exists public.exchange_participants (
  id uuid default uuid_generate_v4() primary key,
  exchange_id uuid references public.exchanges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (exchange_id, user_id)
);
alter table public.exchange_participants enable row level security;
create policy "Participants viewable by all exchange members" on public.exchange_participants
  for select using (
    exists (select 1 from public.exchange_participants ep
      where ep.exchange_id = exchange_id and ep.user_id = auth.uid())
  );
create policy "Users can join exchanges" on public.exchange_participants
  for insert with check (auth.uid() = user_id);

-- exchange answers
create table if not exists public.exchange_answers (
  id uuid default uuid_generate_v4() primary key,
  exchange_id uuid references public.exchanges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  question_text text not null,
  answer_text text not null,
  created_at timestamptz default now(),
  unique (exchange_id, user_id, question_id)
);
alter table public.exchange_answers enable row level security;
create policy "Exchange answers viewable by participants" on public.exchange_answers
  for select using (
    exists (select 1 from public.exchange_participants ep
      where ep.exchange_id = exchange_id and ep.user_id = auth.uid())
  );
create policy "Users can submit their own answers" on public.exchange_answers
  for insert with check (auth.uid() = user_id);

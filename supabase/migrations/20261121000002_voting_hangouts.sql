-- VOTING CATEGORIES
create table if not exists public.voting_categories (
  id text primary key,
  name text not null,
  description text,
  voting_type text default 'daily' check (voting_type in ('daily', 'weekly')),
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.voting_categories enable row level security;
create policy "Voting categories are public" on public.voting_categories for select using (true);

insert into public.voting_categories (id, name, description, voting_type) values
  ('scrapbook-of-the-day', 'Scrapbook of the Day', 'The best scrapbook of the day', 'daily'),
  ('most-creative', 'Most Creative', 'The most creative scrapbook', 'weekly'),
  ('most-nostalgic', 'Most Nostalgic', 'The most nostalgic scrapbook', 'weekly'),
  ('community-favorite', 'Community Favorite', 'The community''s favorite scrapbook', 'weekly'),
  ('best-photo-collage', 'Best Photo Collage', 'The best photo collage', 'weekly')
on conflict (id) do nothing;

-- VOTING PERIODS
create table if not exists public.voting_periods (
  id uuid default uuid_generate_v4() primary key,
  category_id text references public.voting_categories(id) on delete cascade not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text default 'active' check (status in ('active', 'closed', 'archived')),
  created_at timestamptz default now()
);
alter table public.voting_periods enable row level security;
create policy "Voting periods are public" on public.voting_periods for select using (true);

-- Active periods for each category (daily = next 24h, weekly = next 7 days)
insert into public.voting_periods (category_id, start_at, end_at, status)
select id,
  now(),
  case when voting_type = 'daily' then now() + interval '24 hours' else now() + interval '7 days' end,
  'active'
from public.voting_categories where is_active = true;

-- HIGHLIGHT VOTES (separate from scrapbook_votes which is used for likes)
create table if not exists public.highlight_votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scrapbook_id uuid references public.scrapbooks(id) on delete cascade not null,
  category_id text references public.voting_categories(id) on delete cascade not null,
  voting_period_id uuid references public.voting_periods(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, category_id, voting_period_id)
);
alter table public.highlight_votes enable row level security;
create policy "Users can cast highlight votes" on public.highlight_votes
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own highlight votes" on public.highlight_votes
  for update using (auth.uid() = user_id);
create policy "Users can delete their own highlight votes" on public.highlight_votes
  for delete using (auth.uid() = user_id);
create policy "Highlight votes are public" on public.highlight_votes
  for select using (true);

-- VOTING RESULTS
create table if not exists public.voting_results (
  id uuid default uuid_generate_v4() primary key,
  voting_period_id uuid references public.voting_periods(id) on delete cascade not null,
  scrapbook_id uuid references public.scrapbooks(id) on delete cascade not null,
  total_votes int default 0,
  final_rank int,
  is_winner boolean default false,
  calculated_at timestamptz default now()
);
alter table public.voting_results enable row level security;
create policy "Voting results are public" on public.voting_results for select using (true);

-- HANGOUTS
create table if not exists public.hangouts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  cover_url text,
  category text default 'general' check (category in ('scrapbook-night', 'journal-with-me', 'photobooth-party', 'exchange-meetup', 'theme-week', 'memory-sharing', 'workshop', 'general')),
  host_id uuid references public.profiles(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text default 'Asia/Manila',
  event_type text default 'online' check (event_type in ('online', 'in-person', 'hybrid')),
  meeting_url text,
  location text,
  max_participants int default 20,
  registration_deadline timestamptz,
  status text default 'upcoming' check (status in ('draft', 'upcoming', 'registration_open', 'full', 'in_progress', 'completed', 'cancelled')),
  visibility text default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz default now()
);
alter table public.hangouts enable row level security;
create policy "Public hangouts viewable by everyone" on public.hangouts
  for select using (visibility = 'public' and status != 'draft');
create policy "Admins can manage hangouts" on public.hangouts
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- HANGOUT RSVPS
create table if not exists public.hangout_rsvps (
  id uuid default uuid_generate_v4() primary key,
  hangout_id uuid references public.hangouts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'confirmed' check (status in ('confirmed', 'waitlisted', 'cancelled')),
  created_at timestamptz default now(),
  unique (hangout_id, user_id)
);
alter table public.hangout_rsvps enable row level security;
create policy "Users can manage their own RSVPs" on public.hangout_rsvps
  for all using (auth.uid() = user_id);
create policy "RSVPs viewable by hangout participants" on public.hangout_rsvps
  for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS / PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  mood text,
  favorite_color text,
  profile_theme text default 'pink-princess',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SCRAPBOOKS
-- ============================================================
create table public.scrapbooks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'my scrapbook',
  slug text unique not null,
  cover_id text not null default 'pink-princess',
  cover_photo_url text,
  is_public boolean default true,
  view_count int default 0,
  like_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.scrapbooks enable row level security;

create policy "Public scrapbooks viewable by everyone" on public.scrapbooks
  for select using (is_public = true or auth.uid() = user_id);

create policy "Users can create their own scrapbooks" on public.scrapbooks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own scrapbooks" on public.scrapbooks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own scrapbooks" on public.scrapbooks
  for delete using (auth.uid() = user_id);

-- ============================================================
-- SCRAPBOOK PAGES
-- ============================================================
create table public.scrapbook_pages (
  id uuid default uuid_generate_v4() primary key,
  scrapbook_id uuid references public.scrapbooks(id) on delete cascade not null,
  page_number int not null default 1,
  title text,
  bg_color text default '#FFF8ED',
  bg_texture text,
  created_at timestamptz default now()
);

alter table public.scrapbook_pages enable row level security;

create policy "Pages viewable if scrapbook is viewable" on public.scrapbook_pages
  for select using (
    exists (
      select 1 from public.scrapbooks s
      where s.id = scrapbook_id
      and (s.is_public = true or s.user_id = auth.uid())
    )
  );

create policy "Users can manage their own pages" on public.scrapbook_pages
  for all using (
    exists (
      select 1 from public.scrapbooks s
      where s.id = scrapbook_id and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- SCRAPBOOK ELEMENTS
-- ============================================================
create table public.scrapbook_elements (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references public.scrapbook_pages(id) on delete cascade not null,
  type text not null check (type in ('text', 'image', 'sticker', 'question', 'decoration')),
  content text not null default '',
  x float default 0,
  y float default 0,
  width float default 100,
  height float default 50,
  rotation float default 0,
  font_family text,
  font_size int,
  color text,
  z_index int default 0,
  created_at timestamptz default now()
);

alter table public.scrapbook_elements enable row level security;

create policy "Elements viewable if page is viewable" on public.scrapbook_elements
  for select using (
    exists (
      select 1 from public.scrapbook_pages p
      join public.scrapbooks s on s.id = p.scrapbook_id
      where p.id = page_id
      and (s.is_public = true or s.user_id = auth.uid())
    )
  );

create policy "Users can manage their own elements" on public.scrapbook_elements
  for all using (
    exists (
      select 1 from public.scrapbook_pages p
      join public.scrapbooks s on s.id = p.scrapbook_id
      where p.id = page_id and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- ANSWERS
-- ============================================================
create table public.answers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  question_text text not null,
  scrapbook_id uuid references public.scrapbooks(id) on delete set null,
  answer_text text not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table public.answers enable row level security;

create policy "Public answers viewable by everyone" on public.answers
  for select using (is_public = true or auth.uid() = user_id);

create policy "Users can manage their own answers" on public.answers
  for all using (auth.uid() = user_id);

-- ============================================================
-- CONFESSIONS
-- ============================================================
create table public.confessions (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  category text not null default 'Random',
  is_anonymous boolean default true,
  user_id uuid references public.profiles(id) on delete set null,
  reaction_count int default 0,
  is_approved boolean default true,
  created_at timestamptz default now()
);

alter table public.confessions enable row level security;

create policy "Approved confessions are public" on public.confessions
  for select using (is_approved = true);

create policy "Anyone can submit a confession" on public.confessions
  for insert with check (true);

-- ============================================================
-- DAILY PROMPTS
-- ============================================================
create table public.daily_prompts (
  id uuid default uuid_generate_v4() primary key,
  question_text text not null,
  date date unique not null default current_date,
  answer_count int default 0
);

alter table public.daily_prompts enable row level security;

create policy "Daily prompts are public" on public.daily_prompts
  for select using (true);

-- ============================================================
-- DAILY PROMPT ANSWERS
-- ============================================================
create table public.prompt_answers (
  id uuid default uuid_generate_v4() primary key,
  prompt_id uuid references public.daily_prompts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  answer_text text not null,
  is_anonymous boolean default false,
  like_count int default 0,
  created_at timestamptz default now()
);

alter table public.prompt_answers enable row level security;

create policy "Prompt answers are public" on public.prompt_answers
  for select using (true);

create policy "Users can submit prompt answers" on public.prompt_answers
  for insert with check (auth.uid() = user_id or user_id is null);

-- ============================================================
-- VOTES / LIKES
-- ============================================================
create table public.scrapbook_votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scrapbook_id uuid references public.scrapbooks(id) on delete cascade not null,
  vote_type text default 'like',
  created_at timestamptz default now(),
  unique (user_id, scrapbook_id)
);

alter table public.scrapbook_votes enable row level security;

create policy "Votes are public" on public.scrapbook_votes
  for select using (true);

create policy "Users can vote once per scrapbook" on public.scrapbook_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their own votes" on public.scrapbook_votes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- FAVORITES
-- ============================================================
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scrapbook_id uuid references public.scrapbooks(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, scrapbook_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can manage their own favorites" on public.favorites
  for all using (auth.uid() = user_id);

-- ============================================================
-- SEED: Daily prompts
-- ============================================================
insert into public.daily_prompts (question_text, date) values
  ('What''s one memory you wish you could relive?', current_date),
  ('Who was your first childhood crush?', current_date + 1),
  ('What song instantly takes you back?', current_date + 2),
  ('What''s something you never got to say?', current_date + 3),
  ('If you could send a letter to your younger self, what would you say?', current_date + 4),
  ('What''s one thing you''re currently looking forward to?', current_date + 5)
on conflict (date) do nothing;

-- ============================================================
-- MIGRATION: Add is_admin to profiles (run if not exists)
-- ============================================================
alter table public.profiles add column if not exists is_admin boolean default false;

-- ============================================================
-- EXCHANGES
-- ============================================================
create table if not exists public.exchanges (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  template_id text not null,
  status text default 'pending' check (status in ('pending', 'active', 'completed', 'expired')),
  invite_token text unique not null,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

alter table public.exchanges enable row level security;

create policy "Exchanges viewable by creator or participants" on public.exchanges
  for select using (
    auth.uid() = creator_id or
    exists (select 1 from public.exchange_participants ep where ep.exchange_id = id and ep.user_id = auth.uid())
  );

create policy "Authenticated users can create exchanges" on public.exchanges
  for insert with check (auth.uid() = creator_id);

create policy "Creator can update exchange" on public.exchanges
  for update using (auth.uid() = creator_id);

-- ============================================================
-- EXCHANGE PARTICIPANTS
-- ============================================================
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
    exists (
      select 1 from public.exchange_participants ep2
      where ep2.exchange_id = exchange_id and ep2.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.exchanges e
      where e.id = exchange_id and e.creator_id = auth.uid()
    )
  );

create policy "Users can join exchanges" on public.exchange_participants
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- EXCHANGE ANSWERS
-- ============================================================
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
    exists (
      select 1 from public.exchange_participants ep
      where ep.exchange_id = exchange_id and ep.user_id = auth.uid()
    )
  );

create policy "Users can submit their own answers" on public.exchange_answers
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "System can insert notifications" on public.notifications
  for insert with check (true);

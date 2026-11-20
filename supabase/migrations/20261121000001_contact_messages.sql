-- Contact form messages (read them in the Supabase table editor or admin)
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text check (char_length(name) <= 80),
  email text not null check (char_length(email) between 3 and 200),
  topic text not null default 'general' check (topic in ('general', 'bug', 'report', 'privacy', 'ads', 'other')),
  message text not null check (char_length(message) between 5 and 3000),
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

-- anyone (signed in or not) can send a message; nobody can read them through the API
drop policy if exists "Anyone can send a contact message" on public.contact_messages;
create policy "Anyone can send a contact message" on public.contact_messages
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

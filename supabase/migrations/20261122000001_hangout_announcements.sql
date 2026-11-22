create table if not exists public.hangout_announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null check (char_length(title) between 3 and 80),
  body text not null check (char_length(body) between 1 and 600),
  kind text not null default 'news'
    check (kind in ('new-hangout','reminder','change','cancelled','recap','news')),
  hangout_id uuid references public.hangouts(id) on delete set null,
  note_color text not null default 'pink'
    check (note_color in ('pink','lilac','blue','yellow','mint')),
  is_pinned boolean not null default false,
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hangout_announcements_feed_idx
  on public.hangout_announcements (is_pinned desc, publish_at desc);
create index if not exists hangout_announcements_hangout_idx
  on public.hangout_announcements (hangout_id);

alter table public.hangout_announcements enable row level security;

create policy "Live announcements are public"
  on public.hangout_announcements for select
  using (publish_at <= now() and (expires_at is null or expires_at > now()));
create policy "Admins read all announcements"
  on public.hangout_announcements for select using (public.is_admin());
create policy "Admins insert announcements"
  on public.hangout_announcements for insert with check (public.is_admin());
create policy "Admins update announcements"
  on public.hangout_announcements for update using (public.is_admin());
create policy "Admins delete announcements"
  on public.hangout_announcements for delete using (public.is_admin());

create trigger hangout_announcements_updated_at
  before update on public.hangout_announcements
  for each row execute function public.set_updated_at();

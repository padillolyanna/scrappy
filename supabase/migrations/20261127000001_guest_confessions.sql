-- Allow guest (non-logged-in) confessions with an optional display name.
-- guest_name is null for logged-in users; non-null for guests who chose a name.
alter table public.confessions
  add column if not exists guest_name text check (char_length(guest_name) <= 40);

-- Set is_approved default to false so all submissions (guest and member) go
-- through admin moderation before appearing on the wall.
alter table public.confessions
  alter column is_approved set default false;

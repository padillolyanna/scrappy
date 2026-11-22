-- Add image support to hangout_announcements
alter table public.hangout_announcements
  add column if not exists image_url text;

-- Public bucket for announcement images
insert into storage.buckets (id, name, public)
values ('announcements', 'announcements', true)
on conflict (id) do nothing;

drop policy if exists "Announcement images are publicly readable" on storage.objects;
create policy "Announcement images are publicly readable" on storage.objects
  for select using (bucket_id = 'announcements');

drop policy if exists "Admins can upload announcement images" on storage.objects;
create policy "Admins can upload announcement images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'announcements' and public.is_admin());

drop policy if exists "Admins can delete announcement images" on storage.objects;
create policy "Admins can delete announcement images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'announcements' and public.is_admin());

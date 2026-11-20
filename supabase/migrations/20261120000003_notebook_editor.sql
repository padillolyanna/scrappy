-- Notebook editor: free-form element props + photo storage for scrapbooks

-- Extra per-element styling (frame, tape pattern, shape, text style, etc.)
alter table public.scrapbook_elements
  add column if not exists props jsonb not null default '{}'::jsonb;

create index if not exists scrapbook_pages_scrapbook_idx
  on public.scrapbook_pages (scrapbook_id, page_number);
create index if not exists scrapbook_elements_page_idx
  on public.scrapbook_elements (page_id);

-- Public bucket for photos placed on scrapbook pages.
insert into storage.buckets (id, name, public)
values ('scrapbook-media', 'scrapbook-media', true)
on conflict (id) do nothing;

drop policy if exists "Scrapbook media is publicly readable" on storage.objects;
create policy "Scrapbook media is publicly readable" on storage.objects
  for select using (bucket_id = 'scrapbook-media');

drop policy if exists "Users upload scrapbook media to their folder" on storage.objects;
create policy "Users upload scrapbook media to their folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'scrapbook-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete their own scrapbook media" on storage.objects;
create policy "Users delete their own scrapbook media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'scrapbook-media' and (storage.foldername(name))[1] = auth.uid()::text);

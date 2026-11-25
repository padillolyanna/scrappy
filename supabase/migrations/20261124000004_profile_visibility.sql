-- Profile visibility: owners can make their page private
alter table public.profiles add column if not exists is_public boolean default true;

-- Allow owners to update their own visibility
drop policy if exists "Users can update their own profile visibility" on public.profiles;
create policy "Users can update their own profile visibility" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

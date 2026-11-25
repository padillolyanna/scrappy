-- Tracks who liked which prompt answer so each user can only like once.
create table if not exists public.prompt_answer_likes (
  id uuid default gen_random_uuid() primary key,
  answer_id uuid references public.prompt_answers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (answer_id, user_id)
);

alter table public.prompt_answer_likes enable row level security;

create policy "Anyone can see likes" on public.prompt_answer_likes
  for select using (true);
create policy "Authenticated users can like" on public.prompt_answer_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own" on public.prompt_answer_likes
  for delete using (auth.uid() = user_id);

-- Toggles a like; returns {liked, like_count}.
create or replace function public.toggle_prompt_answer_like(p_answer_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_liked boolean;
  v_count int;
begin
  if uid is null then raise exception 'must be logged in to like'; end if;

  if exists (
    select 1 from prompt_answer_likes where answer_id = p_answer_id and user_id = uid
  ) then
    delete from prompt_answer_likes where answer_id = p_answer_id and user_id = uid;
    update prompt_answers set like_count = greatest(0, like_count - 1) where id = p_answer_id;
    v_liked := false;
  else
    insert into prompt_answer_likes (answer_id, user_id) values (p_answer_id, uid);
    update prompt_answers set like_count = like_count + 1 where id = p_answer_id;
    v_liked := true;
  end if;

  select like_count into v_count from prompt_answers where id = p_answer_id;
  return jsonb_build_object('liked', v_liked, 'like_count', v_count);
end $$;

grant execute on function public.toggle_prompt_answer_like(uuid) to authenticated;
revoke execute on function public.toggle_prompt_answer_like(uuid) from anon;

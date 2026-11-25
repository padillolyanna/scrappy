-- Scrapbook Exchange v2: "pass the notebook"
--
-- The first version had three problems:
--   * friends could never open an invite: exchanges were only readable by their creator
--   * the participants policy queried its own table (infinite recursion under RLS)
--   * answers were readable as soon as one person posted them, and the creator never answered
--
-- Now every exchange is a small notebook with its own questions (from a template or
-- written by the creator). Both people answer; answers stay sealed until both are in.
-- All reads and writes go through the SECURITY DEFINER functions below, so the tables
-- themselves only expose a person's own rows.

alter table public.exchanges add column if not exists title text;
alter table public.exchanges add column if not exists cover text default 'pink';
alter table public.exchanges add column if not exists questions jsonb;
alter table public.exchange_participants add column if not exists submitted_at timestamptz;

-- extend the status check constraint to include the v2 values
alter table public.exchanges drop constraint if exists exchanges_status_check;
alter table public.exchanges add constraint exchanges_status_check
  check (status in ('pending', 'active', 'completed', 'waiting', 'revealed'));

-- old rows: snapshot nothing; the app falls back to the template's questions when null

-- ── policies: own rows only, no direct writes ──
drop policy if exists "Exchanges viewable by creator" on public.exchanges;
drop policy if exists "Authenticated users can create exchanges" on public.exchanges;
drop policy if exists "Creator can update exchange" on public.exchanges;
drop policy if exists "Participants viewable by all exchange members" on public.exchange_participants;
drop policy if exists "Users can join exchanges" on public.exchange_participants;
drop policy if exists "Exchange answers viewable by participants" on public.exchange_answers;
drop policy if exists "Users can submit their own answers" on public.exchange_answers;

create policy "Exchanges viewable by creator" on public.exchanges
  for select using (auth.uid() = creator_id);
create policy "Own participation rows" on public.exchange_participants
  for select using (auth.uid() = user_id);
create policy "Own answers" on public.exchange_answers
  for select using (auth.uid() = user_id);

-- ── helpers ──
create or replace function public.exchange_clean_questions(p jsonb)
returns jsonb language plpgsql immutable as $$
declare
  out jsonb := '[]'::jsonb;
  q jsonb;
  t text;
  i int := 0;
begin
  if p is null or jsonb_typeof(p) <> 'array' then
    raise exception 'questions must be a list';
  end if;
  for q in select * from jsonb_array_elements(p) loop
    t := btrim(coalesce(q->>'text', ''));
    if t = '' then continue; end if;
    if char_length(t) > 160 then raise exception 'a question is too long (160 characters max)'; end if;
    i := i + 1;
    out := out || jsonb_build_array(jsonb_build_object('id', 'q' || i, 'text', t));
  end loop;
  if i < 1 then raise exception 'add at least one question'; end if;
  if i > 15 then raise exception 'a notebook holds 15 questions at most'; end if;
  return out;
end $$;

create or replace function public.exchange_save_answers(p_exchange uuid, p_uid uuid, p_questions jsonb, p_answers jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  q jsonb;
  a text;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'answers must be an object';
  end if;
  for q in select * from jsonb_array_elements(p_questions) loop
    a := btrim(coalesce(p_answers->>(q->>'id'), ''));
    if a = '' then raise exception 'answer every question before passing the notebook on'; end if;
    if char_length(a) > 600 then raise exception 'an answer is too long (600 characters max)'; end if;
  end loop;
  delete from exchange_answers where exchange_id = p_exchange and user_id = p_uid;
  insert into exchange_answers (exchange_id, user_id, question_id, question_text, answer_text)
  select p_exchange, p_uid, el->>'id', el->>'text', btrim(p_answers->>(el->>'id'))
  from jsonb_array_elements(p_questions) el;
  update exchange_participants set submitted_at = now() where exchange_id = p_exchange and user_id = p_uid;
end $$;
revoke all on function public.exchange_save_answers(uuid, uuid, jsonb, jsonb) from public;

-- ── create: notebook + the creator's own answers in one go ──
create or replace function public.create_exchange(p_title text, p_template text, p_cover text, p_questions jsonb, p_answers jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  qs jsonb;
  tok text;
  eid uuid;
begin
  if uid is null then raise exception 'log in to start an exchange'; end if;
  if (select count(*) from exchanges where creator_id = uid and created_at > now() - interval '1 day') >= 20 then
    raise exception 'that is a lot of notebooks for one day, try again tomorrow';
  end if;
  qs := exchange_clean_questions(p_questions);
  tok := replace(gen_random_uuid()::text, '-', '');
  insert into exchanges (creator_id, template_id, title, cover, questions, invite_token, status, expires_at)
  values (uid, coalesce(nullif(p_template, ''), 'custom'),
          left(coalesce(nullif(btrim(p_title), ''), 'our notebook'), 60),
          case when p_cover in ('pink', 'purple', 'blue', 'mint', 'yellow', 'leopard') then p_cover else 'pink' end,
          qs, tok, 'waiting', now() + interval '30 days')
  returning id into eid;
  insert into exchange_participants (exchange_id, user_id) values (eid, uid);
  perform exchange_save_answers(eid, uid, qs, p_answers);
  return tok;
end $$;

-- ── open a notebook by its invite link (anyone, even logged out, can see the cover) ──
create or replace function public.get_exchange(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  e exchanges%rowtype;
  members int;
  me exchange_participants%rowtype;
  other_done boolean;
  creator jsonb;
  qs jsonb;
begin
  select * into e from exchanges where invite_token = p_token;
  if not found then return null; end if;
  select count(*) into members from exchange_participants where exchange_id = e.id;
  select * into me from exchange_participants where exchange_id = e.id and user_id = uid;
  select exists (select 1 from exchange_participants where exchange_id = e.id and user_id is distinct from uid and submitted_at is not null)
    into other_done;
  select jsonb_build_object('username', p.username, 'display_name', p.display_name, 'avatar_url', p.avatar_url)
    into creator from profiles p where p.id = e.creator_id;
  qs := coalesce(e.questions, '[]'::jsonb);
  return jsonb_build_object(
    'id', e.id,
    'title', coalesce(e.title, 'our notebook'),
    'cover', coalesce(e.cover, 'pink'),
    'template_id', e.template_id,
    'questions', qs,
    'creator', creator,
    'is_creator', uid is not null and uid = e.creator_id,
    'is_member', me.id is not null,
    'i_answered', me.submitted_at is not null,
    'other_answered', other_done,
    'full', members >= 2 and me.id is null,
    'expired', e.expires_at < now() and coalesce(e.status, '') <> 'revealed',
    'revealed', coalesce(e.status, '') = 'revealed'
  );
end $$;

-- ── join + answer ──
create or replace function public.answer_exchange(p_token text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  e exchanges%rowtype;
  members int;
  done int;
begin
  if uid is null then raise exception 'log in to answer'; end if;
  select * into e from exchanges where invite_token = p_token for update;
  if not found then raise exception 'this notebook does not exist'; end if;
  if e.questions is null then raise exception 'this is an old exchange, start a new notebook'; end if;
  if not exists (select 1 from exchange_participants where exchange_id = e.id and user_id = uid) then
    if e.expires_at < now() then raise exception 'this notebook has expired'; end if;
    select count(*) into members from exchange_participants where exchange_id = e.id;
    if members >= 2 then raise exception 'this notebook already has two people'; end if;
    insert into exchange_participants (exchange_id, user_id) values (e.id, uid);
  end if;
  if exists (select 1 from exchange_participants where exchange_id = e.id and user_id = uid and submitted_at is not null)
     and coalesce(e.status, '') = 'revealed' then
    raise exception 'answers are locked once the notebook is revealed';
  end if;
  perform exchange_save_answers(e.id, uid, e.questions, p_answers);
  select count(*) into done from exchange_participants where exchange_id = e.id and submitted_at is not null;
  if done >= 2 then
    update exchanges set status = 'revealed' where id = e.id;
  end if;
  return get_exchange(p_token);
end $$;

-- ── reveal: both answer sets, only once both people are done ──
create or replace function public.reveal_exchange(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  e exchanges%rowtype;
begin
  select * into e from exchanges where invite_token = p_token;
  if not found or uid is null then return null; end if;
  if not exists (select 1 from exchange_participants where exchange_id = e.id and user_id = uid) then return null; end if;
  if coalesce(e.status, '') <> 'revealed' then return null; end if;
  return (
    select jsonb_agg(jsonb_build_object(
      'is_me', ep.user_id = uid,
      'username', p.username,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url,
      'answers', (select jsonb_object_agg(a.question_id, a.answer_text) from exchange_answers a
                  where a.exchange_id = e.id and a.user_id = ep.user_id)
    ) order by ep.user_id = uid desc)
    from exchange_participants ep join profiles p on p.id = ep.user_id
    where ep.exchange_id = e.id and ep.submitted_at is not null
  );
end $$;

-- ── my notebooks shelf ──
create or replace function public.my_exchanges()
returns table (token text, title text, cover text, n_questions int, i_answered boolean, other_answered boolean,
               revealed boolean, friend text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select e.invite_token, coalesce(e.title, 'our notebook'), coalesce(e.cover, 'pink'),
         coalesce(jsonb_array_length(e.questions), 0),
         me.submitted_at is not null,
         exists (select 1 from exchange_participants o where o.exchange_id = e.id and o.user_id <> auth.uid() and o.submitted_at is not null),
         coalesce(e.status, '') = 'revealed',
         (select coalesce(p.display_name, p.username) from exchange_participants o join profiles p on p.id = o.user_id
           where o.exchange_id = e.id and o.user_id <> auth.uid() limit 1),
         e.created_at
  from exchange_participants me join exchanges e on e.id = me.exchange_id
  where me.user_id = auth.uid() and e.questions is not null
  order by e.created_at desc
  limit 50;
$$;

grant execute on function public.create_exchange(text, text, text, jsonb, jsonb) to authenticated;
grant execute on function public.get_exchange(text) to anon, authenticated;
grant execute on function public.answer_exchange(text, jsonb) to authenticated;
grant execute on function public.reveal_exchange(text) to authenticated;
grant execute on function public.my_exchanges() to authenticated;
revoke execute on function public.create_exchange(text, text, text, jsonb, jsonb) from anon;
revoke execute on function public.answer_exchange(text, jsonb) from anon;
revoke execute on function public.reveal_exchange(text) from anon;
revoke execute on function public.my_exchanges() from anon;

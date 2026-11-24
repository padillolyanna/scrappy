-- My Little Pet: per-user customizable pet, accessory catalog and inventory.
-- Ownership is enforced here: users can only read their own pet/inventory, can't write
-- the inventory at all, and can only save a pet through save_my_pet(), which rejects
-- items they don't own. Unlocks come only from claim_pet_unlocks(), which checks real
-- activity in the database.

-- 1. catalog --------------------------------------------------------------
create table if not exists public.pet_accessories (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null check (category in ('head','face','body','outfit','effect')),
  slot text not null check (slot in ('head','eyes','glasses','cheeks','body','outfit','effect')),
  rarity text not null default 'common' check (rarity in ('common','rare','special','limited')),
  unlock_type text not null default 'free',
  asset_url text,              -- null: drawn by components/pet/PetAvatar.tsx
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.pet_accessories enable row level security;
drop policy if exists "Pet accessories are public" on public.pet_accessories;
create policy "Pet accessories are public" on public.pet_accessories for select using (true);

insert into public.pet_accessories (id, name, description, category, slot, rarity, unlock_type) values
  ('bow-pink', 'Tiny bow', 'A glossy pink bow clipped just above the ear.', 'head', 'head', 'common', 'free'),
  ('clip-heart', 'Heart clip', 'A jelly heart hair clip with a little shine.', 'head', 'head', 'common', 'free'),
  ('clip-butterfly', 'Butterfly clip', 'The classic 2002 butterfly clip, in baby blue.', 'head', 'head', 'common', 'free'),
  ('ears-cat', 'Cat ears', 'Soft pink kitty ears. Meow.', 'head', 'head', 'common', 'free'),
  ('antenna-stars', 'Antenna charms', 'Two tiny star charms hanging off the antenna.', 'head', 'head', 'common', 'free'),
  ('clip-star', 'Star clip', 'A gold star clip for making your very first scrapbook.', 'head', 'head', 'rare', 'first_scrapbook'),
  ('headphones', 'Pink headphones', 'Big candy-pink headphones for hangout playlists.', 'head', 'head', 'rare', 'first_hangout'),
  ('crown', 'Mini crown', 'A tiny gold crown with pink gems. Scrapbook royalty.', 'head', 'head', 'special', 'five_scrapbooks'),
  ('eyes-sparkle', 'Sparkly eyes', 'Big shiny eyes with star highlights.', 'face', 'eyes', 'common', 'free'),
  ('eyes-happy', 'Happy eyes', 'Smiling ^ ^ eyes.', 'face', 'eyes', 'common', 'free'),
  ('eyes-sleepy', 'Sleepy eyes', 'Cozy half-asleep eyes.', 'face', 'eyes', 'common', 'free'),
  ('eyes-wink', 'Wink', 'One eye open, one eye winking.', 'face', 'eyes', 'common', 'free'),
  ('glasses-round', 'Round glasses', 'Little round specs for reading diaries.', 'face', 'glasses', 'common', 'free'),
  ('glasses-heart', 'Heart glasses', 'Pink tinted heart-shaped sunnies.', 'face', 'glasses', 'common', 'free'),
  ('blush', 'Blush', 'Rosy pink cheeks.', 'face', 'cheeks', 'common', 'free'),
  ('freckles', 'Tiny freckles', 'A sprinkle of freckles.', 'face', 'cheeks', 'common', 'free'),
  ('sticker-star', 'Face sticker', 'A gold star sticker on the cheek.', 'face', 'cheeks', 'common', 'free'),
  ('necklace-pearl', 'Pearl necklace', 'A string of tiny plastic pearls.', 'body', 'body', 'common', 'free'),
  ('ribbon-neck', 'Neck ribbon', 'A satin ribbon tied in a bow.', 'body', 'body', 'common', 'free'),
  ('bag-mini', 'Mini bag', 'A little yellow shoulder bag for snacks and stickers.', 'body', 'body', 'common', 'free'),
  ('badge-heart', 'Heart badge', 'A pin-back button with a heart.', 'body', 'body', 'common', 'free'),
  ('backpack', 'Tiny backpack', 'A lilac jelly backpack for sharing your first public scrapbook.', 'body', 'body', 'rare', 'first_public'),
  ('charm-heart', 'Heart charm', 'A friendship heart charm from a finished exchange.', 'body', 'body', 'rare', 'first_exchange'),
  ('badge-star', 'Star badge', 'A gold star pin for answering daily prompts.', 'body', 'body', 'rare', 'prompts_3'),
  ('hoodie-pink', 'Pink hoodie', 'A comfy pink hoodie with a sparkle print.', 'outfit', 'outfit', 'common', 'free'),
  ('hoodie-purple', 'Purple hoodie', 'The same hoodie in grape purple.', 'outfit', 'outfit', 'common', 'free'),
  ('outfit-pastel', 'Pastel stripes', 'A mint, lilac and pink striped top.', 'outfit', 'outfit', 'common', 'free'),
  ('pajamas', 'Pajamas', 'Baby blue polka-dot PJs for sleepovers.', 'outfit', 'outfit', 'common', 'free'),
  ('outfit-metallic', 'Y2K metallic', 'A shiny silver top with pink trim.', 'outfit', 'outfit', 'common', 'free'),
  ('sweater-holiday', 'Holiday sweater', 'A pink knit sweater with snowflakes. Holiday 2026 only.', 'outfit', 'outfit', 'limited', 'event_holiday_2026'),
  ('fx-sparkles', 'Sparkles', 'Twinkly sparkles all around.', 'effect', 'effect', 'common', 'free'),
  ('fx-hearts', 'Floating hearts', 'Little hearts drifting up.', 'effect', 'effect', 'common', 'free'),
  ('fx-stars', 'Stars', 'Gold stars spinning nearby.', 'effect', 'effect', 'common', 'free'),
  ('fx-bubbles', 'Tiny bubbles', 'Soap bubbles floating by.', 'effect', 'effect', 'common', 'free'),
  ('fx-glitter', 'Glitter trail', 'A shimmering trail of glitter.', 'effect', 'effect', 'special', 'five_scrapbooks'),
  ('fx-holo', 'Holographic glow', 'A rainbow holo aura that shifts colour.', 'effect', 'effect', 'special', 'prompts_7')
on conflict (id) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  slot = excluded.slot, rarity = excluded.rarity, unlock_type = excluded.unlock_type;

-- 2. one pet per user -------------------------------------------------------
create table if not exists public.user_pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  pet_type text not null default 'scrappy',
  equipped jsonb not null default '{}'::jsonb,   -- {"head": "bow-pink", "effect": "fx-sparkles", ...}
  is_public boolean not null default false,       -- show on my public profile
  show_companion boolean not null default true,   -- floating pet on the site
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_pets enable row level security;
drop policy if exists "Users read their own pet" on public.user_pets;
create policy "Users read their own pet" on public.user_pets for select using (auth.uid() = user_id);
drop policy if exists "Public pets are visible" on public.user_pets;
create policy "Public pets are visible" on public.user_pets for select using (is_public);
-- no insert/update/delete policies: writes only through the functions below

-- 3. inventory (unlocked non-free items) -----------------------------------
create table if not exists public.user_pet_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  accessory_id text not null references public.pet_accessories(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, accessory_id)
);
alter table public.user_pet_inventory enable row level security;
drop policy if exists "Users read their own inventory" on public.user_pet_inventory;
create policy "Users read their own inventory" on public.user_pet_inventory for select using (auth.uid() = user_id);
-- no write policies: only claim_pet_unlocks() can add items

-- 4. default pet for every account -----------------------------------------
create or replace function public.create_default_pet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_pets (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_profile_created_pet on public.profiles;
create trigger on_profile_created_pet after insert on public.profiles
  for each row execute function public.create_default_pet();
insert into public.user_pets (user_id) select id from public.profiles on conflict (user_id) do nothing;

create or replace function public.ensure_my_pet()
returns public.user_pets language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pet public.user_pets;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  insert into public.user_pets (user_id) values (uid) on conflict (user_id) do nothing;
  select * into pet from public.user_pets where user_id = uid;
  return pet;
end $$;

-- 5. unlocks: check real activity, award once --------------------------------
create or replace function public.pet_unlock_met(uid uuid, rule text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare ok boolean := false;
begin
  case rule
    when 'free' then ok := true;
    when 'first_scrapbook' then ok := exists (select 1 from scrapbooks where user_id = uid);
    when 'first_public' then ok := exists (select 1 from scrapbooks where user_id = uid and is_public);
    when 'five_scrapbooks' then ok := (select count(*) from scrapbooks where user_id = uid) >= 5;
    when 'first_hangout' then ok := exists (select 1 from hangout_rsvps where user_id = uid and status = 'confirmed');
    when 'prompts_3' then ok := (select count(*) from prompt_answers where user_id = uid) >= 3;
    when 'prompts_7' then ok := (select count(*) from prompt_answers where user_id = uid) >= 7;
    when 'event_holiday_2026' then
      ok := now() >= timestamptz '2026-12-01 00:00+08' and now() < timestamptz '2027-01-07 00:00+08';
    when 'first_exchange' then
      -- exchanges are optional tables; a completed exchange = one you share with at least one other person
      if to_regclass('public.exchange_participants') is not null then
        execute 'select exists (select 1 from public.exchange_participants ep
                   where ep.user_id = $1
                     and exists (select 1 from public.exchange_participants o
                                 where o.exchange_id = ep.exchange_id and o.user_id <> $1))'
          into ok using uid;
      end if;
    else ok := false;
  end case;
  return coalesce(ok, false);
end $$;
revoke execute on function public.pet_unlock_met(uuid, text) from public, anon, authenticated;

create or replace function public.claim_pet_unlocks()
returns table (accessory_id text, name text) language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); a record;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  for a in
    select pa.id, pa.name, pa.unlock_type from pet_accessories pa
    where pa.is_active and pa.unlock_type <> 'free'
      and not exists (select 1 from user_pet_inventory i where i.user_id = uid and i.accessory_id = pa.id)
  loop
    if pet_unlock_met(uid, a.unlock_type) then
      insert into user_pet_inventory (user_id, accessory_id) values (uid, a.id) on conflict do nothing;
      accessory_id := a.id; name := a.name; return next;
    end if;
  end loop;
end $$;

-- 6. save: validate every equipped item --------------------------------------
create or replace function public.save_my_pet(p_equipped jsonb, p_is_public boolean, p_show_companion boolean)
returns public.user_pets language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); k text; v text; acc pet_accessories; clean jsonb := '{}'::jsonb; pet user_pets;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if p_equipped is null or jsonb_typeof(p_equipped) <> 'object' then raise exception 'equipped must be an object'; end if;
  for k, v in select key, value #>> '{}' from jsonb_each(p_equipped) loop
    if v is null or v = '' then continue; end if;
    select * into acc from pet_accessories where id = v and is_active;
    if not found then raise exception 'unknown accessory %', v using errcode = '22023'; end if;
    if acc.slot <> k then raise exception 'accessory % does not go in slot %', v, k using errcode = '22023'; end if;
    if acc.unlock_type <> 'free'
       and not exists (select 1 from user_pet_inventory where user_id = uid and accessory_id = v) then
      raise exception 'you have not unlocked %', acc.name using errcode = '42501';
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  insert into user_pets (user_id, equipped, is_public, show_companion, updated_at)
    values (uid, clean, coalesce(p_is_public, false), coalesce(p_show_companion, true), now())
  on conflict (user_id) do update set
    equipped = excluded.equipped, is_public = excluded.is_public,
    show_companion = excluded.show_companion, updated_at = now();
  select * into pet from user_pets where user_id = uid;
  return pet;
end $$;

revoke execute on function public.ensure_my_pet() from public, anon;
revoke execute on function public.claim_pet_unlocks() from public, anon;
revoke execute on function public.save_my_pet(jsonb, boolean, boolean) from public, anon;
grant execute on function public.ensure_my_pet() to authenticated;
grant execute on function public.claim_pet_unlocks() to authenticated;
grant execute on function public.save_my_pet(jsonb, boolean, boolean) to authenticated;

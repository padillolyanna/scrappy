-- Profile comment walls are switched off to reduce the risk of bullying.
-- Existing rows are kept for moderation, but nobody can read or post
-- comments through the API any more (no select / insert policies under RLS).

drop policy if exists "Profile comments are public" on public.profile_comments;
drop policy if exists "Signed-in users can comment as themselves" on public.profile_comments;
drop trigger if exists on_profile_comment on public.profile_comments;

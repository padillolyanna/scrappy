-- ============================================================
-- STEP 1: Create admin account
-- Email:    admin@scrappy.fun
-- Password: ScrappyAdmin2026!
-- ============================================================
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@scrappy.fun',
    crypt('ScrappyAdmin2026!', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"scrappy_admin","display_name":"Scrappy Admin"}',
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Trigger creates the profile row; elevate it to admin
  UPDATE public.profiles SET is_admin = true WHERE id = v_user_id;

  RAISE NOTICE 'Admin account created: admin@scrappy.fun / ScrappyAdmin2026!';
END $$;


-- ============================================================
-- STEP 2: Insert the Tro Papel announcement
-- ============================================================
INSERT INTO public.hangout_announcements (title, body, kind, note_color, is_pinned, publish_at)
VALUES (
  'Tro Papel Year-End Party',
  'Pajama-themed journal meet-up! Come join the 9th Journal Meet-up at Mabuhay Tea House. Sunday, Dec 6 · 11AM–4PM',
  'new-hangout',
  'pink',
  true,
  NOW()
);

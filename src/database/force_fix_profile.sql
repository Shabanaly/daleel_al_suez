-- ⚠️ IMPORTANT: Replace 'YOUR_EMAIL_HERE' with your real email address
-- This script ensures your user has a profile and is a super_admin.

DO $$
DECLARE
  target_email TEXT := 'YOUR_EMAIL_HERE'; -- 👈 ضع إيميلك هنا
  target_user_id UUID;
BEGIN
  -- 1. Find the User ID from the Auth system
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Error: User with email % not found in Authentication system. Please Sign Up first.', target_email;
  END IF;

  -- 2. Insert or Update the Profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (target_user_id, target_email, 'Super Admin', 'super_admin')
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'super_admin',
    email = EXCLUDED.email; -- Ensure email is synced
  
  RAISE NOTICE '✅ SUCCESS: User % is now a SUPER_ADMIN and has a valid profile.', target_email;
END $$;

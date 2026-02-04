-- ⚠️ INSTRUCTIONS:
-- 1. Sign up these users in your App/Supabase Dashboard first.
-- 2. Run this script to assign their roles.

-- Update Super Admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'super@daleel.com';

-- Update Admins
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('admin1@daleel.com', 'admin2@daleel.com');

-- (Optional) Create some places for admin1 (Once you have their UUID)
-- INSERT INTO public.places (name, slug, category_id, created_by, status) 
-- VALUES ('My First Place', 'my-place', [CATEGORY_ID], [ADMIN_UUID], 'active');

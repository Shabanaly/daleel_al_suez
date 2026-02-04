-- 1. Drop existing policies to avoid conflicts
drop policy if exists "Public can view places" on places;
drop policy if exists "Admins can insert places" on places;
drop policy if exists "Admins can update own places or SuperAdmin all" on places;
drop policy if exists "Admins can delete own places or SuperAdmin all" on places;

-- 2. Enable RLS (Ensure it's on)
alter table public.places enable row level security;

-- 3. Re-create Policies

-- VIEW: Everyone can view active places (or all places if admin? No, public view)
-- Adjusting to allow public to see ONLY active places, but Admins to see ALL
create policy "Public can view active places" on places 
  for select using (
    status = 'active' OR
    (auth.role() = 'authenticated' AND exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin')))
  );

-- INSERT: Admins and Super Admins only
create policy "Admins can insert places" on places
  for insert with check (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role in ('admin', 'super_admin')
    )
  );

-- UPDATE: Super Admin (ALL), Admin (Own)
create policy "Admins can update places" on places
  for update using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and (
        role = 'super_admin' 
        OR (role = 'admin' AND places.created_by = auth.uid())
      )
    )
  );

-- DELETE: Super Admin (ALL), Admin (Own)
create policy "Admins can delete places" on places
  for delete using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and (
        role = 'super_admin' 
        OR (role = 'admin' AND places.created_by = auth.uid())
      )
    )
  );

-- 4. Verification Query (Run this to check your user status)
-- Replace with your email to verify
-- select * from profiles where email = 'YOUR_EMAIL';

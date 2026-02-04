-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- 1. PROFILES (Users & Roles)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid not null,
  email text unique,
  full_name text,
  avatar_url text,
  role text default 'user'::text check (role = any (array['user'::text, 'admin'::text, 'super_admin'::text])),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade
);

-- Ensure columns exist (Idempotent)
alter table public.profiles add column if not exists role text default 'user'::text check (role = any (array['user'::text, 'admin'::text, 'super_admin'::text]));
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists updated_at timestamp with time zone not null default timezone('utc'::text, now());

-- Secure Profiles: Enable RLS
alter table public.profiles enable row level security;

-- Drop old policies to ensure updates
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update their own profile." on profiles;

-- Recreate Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);

-- Trigger to create profile on Signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------
-- 2. CATEGORIES
-- ---------------------------------------------------------
create table if not exists public.categories (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint categories_pkey primary key (id)
);

-- Drop legacy policies that might depend on columns we want to remove
drop policy if exists "admins_insert_categories" on categories;
drop policy if exists "categories_visibility" on categories;
drop policy if exists "admins_create_categories" on categories;
drop policy if exists "admins_update_categories" on categories;
drop policy if exists "admins_delete_categories" on categories;

-- Remove image and created_by columns if they exist (migration)
alter table public.categories drop column if exists image cascade;
alter table public.categories drop column if exists created_by cascade;

alter table public.categories enable row level security;

-- ================================================================
-- RLS POLICIES: Categories - Super Admin Only Management
-- ================================================================
-- Strategy:
--   1. Everyone (public + authenticated): Can VIEW all categories
--   2. Super Admin ONLY: Can CREATE/UPDATE/DELETE categories
-- ================================================================

-- Drop all existing policies to ensure clean state
drop policy if exists "Categories are viewable by everyone" on categories;
drop policy if exists "Admins can manage categories" on categories;
drop policy if exists "admins_own_categories" on categories;
drop policy if exists "admins_own_categories_select" on categories;
drop policy if exists "admins_insert_own_categories" on categories;
drop policy if exists "admins_update_own_categories" on categories;
drop policy if exists "admins_delete_own_categories" on categories;
drop policy if exists "categories_select_policy" on categories;
drop policy if exists "public_can_view_categories" on categories;
drop policy if exists "categories_visibility" on categories;
drop policy if exists "admins_create_categories" on categories;
drop policy if exists "admins_update_categories" on categories;
drop policy if exists "admins_delete_categories" on categories;

-- SELECT: Everyone can view all categories
drop policy if exists "everyone_view_categories" on categories;
create policy "everyone_view_categories" on categories
  for select using (true);

-- INSERT/UPDATE/DELETE: Only Super Admin
create policy "super_admin_manage_categories" on categories
  for all using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'super_admin'
    )
  );



-- ---------------------------------------------------------
-- 3. AREAS (Regions)
-- ---------------------------------------------------------
create table if not exists public.areas (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint areas_pkey primary key (id)
);

alter table public.areas enable row level security;

-- Policies for areas
drop policy if exists "Everyone can view areas" on areas;
create policy "Everyone can view areas" on areas for select using (true);
-- Only Super Admins can manage areas (for now)
create policy "Super Admins can manage areas" on areas
  for all using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'super_admin'
    )
  );

-- ---------------------------------------------------------
-- 4. PLACES (With Ownership & Enhanced Fields)
-- ---------------------------------------------------------
create table if not exists public.places (
  id uuid not null default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  address text, -- Can be null for professionals
  phone text,
  whatsapp text,
  website text,
  google_maps_url text,
  images text[],
  is_featured boolean default false,
  rating double precision default 0,
  review_count integer default 0,
  category_id uuid,
  area_id uuid,
  owner_id uuid,
  created_by uuid default auth.uid(),
  
  -- New Columns with NO default value issues on existing tables
  type text default 'business' check (type in ('business', 'professional')),
  social_links jsonb default '{}'::jsonb,

  status text default 'active'::text check (status = any (array['active'::text, 'pending'::text, 'closed'::text])),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint places_pkey primary key (id),
  constraint places_category_id_fkey foreign key (category_id) references public.categories(id),
  constraint places_area_id_fkey foreign key (area_id) references public.areas(id),
  constraint places_owner_id_fkey foreign key (owner_id) references auth.users(id),
  constraint places_created_by_fkey foreign key (created_by) references public.profiles(id)
);

-- Note: Alter table commands below are kept for migration safety if running on existing DB
alter table public.places add column if not exists type text default 'business' check (type in ('business', 'professional'));
alter table public.places add column if not exists social_links jsonb default '{}'::jsonb;
alter table public.places add column if not exists area_id uuid references public.areas(id);
alter table public.places add column if not exists status text default 'active' check (status in ('active', 'pending', 'closed'));
alter table public.places add column if not exists is_featured boolean default false;
alter table public.places add column if not exists rating double precision default 0;
alter table public.places add column if not exists review_count integer default 0;
alter table public.places add column if not exists website text;
alter table public.places add column if not exists google_maps_url text;
alter table public.places add column if not exists owner_id uuid references auth.users(id);
alter table public.places add column if not exists updated_at timestamp with time zone not null default timezone('utc'::text, now());

alter table public.places enable row level security;

-- Policies
drop policy if exists "Public can view places" on places;
drop policy if exists "Admins can insert places" on places;
drop policy if exists "Admins can update own places or SuperAdmin all" on places;
drop policy if exists "Admins can delete own places or SuperAdmin all" on places;

create policy "Public can view places" on places for select using (true);

create policy "Admins can insert places" on places
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can update own places or SuperAdmin all" on places
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and (role = 'super_admin' or (role = 'admin' and places.created_by = auth.uid()))
    )
  );

create policy "Admins can delete own places or SuperAdmin all" on places
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and (role = 'super_admin' or (role = 'admin' and places.created_by = auth.uid()))
    )
  );


-- ---------------------------------------------------------
-- 4. REVIEWS
-- ---------------------------------------------------------
create table if not exists public.reviews (
  id uuid not null default gen_random_uuid(),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  user_id uuid not null,
  place_id uuid not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint reviews_pkey primary key (id),
  constraint reviews_user_id_fkey foreign key (user_id) references auth.users(id),
  constraint reviews_place_id_fkey foreign key (place_id) references public.places(id) on delete cascade
);

alter table public.reviews enable row level security;

drop policy if exists "Everyone can view reviews" on reviews;
drop policy if exists "Authenticated users can create reviews" on reviews;
drop policy if exists "Users can delete own reviews" on reviews;

create policy "Everyone can view reviews" on reviews for select using (true);
create policy "Authenticated users can create reviews" on reviews for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- 5. AUDIT LOGS (Security)
-- ---------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid not null default uuid_generate_v4(),
  actor_id uuid,
  action text not null,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint audit_logs_pkey primary key (id),
  constraint audit_logs_actor_id_fkey foreign key (actor_id) references public.profiles(id)
);

alter table public.audit_logs enable row level security;

-- Drop old policies
drop policy if exists "Super Admins can view audit logs" on audit_logs;
drop policy if exists "Admins can insert log entries" on audit_logs;
drop policy if exists "audit_logs_visibility" on audit_logs;
drop policy if exists "admins_insert_audit_logs" on audit_logs;

-- SELECT: Super Admins see all, Admins see only their own actions
create policy "audit_logs_visibility" on audit_logs
  for select using (
    -- Super Admins see ALL logs
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'super_admin'
    )
    or
    -- Regular Admins see only logs where they are the actor
    actor_id = auth.uid()
  );

-- INSERT: All authenticated users can create log entries
create policy "admins_insert_audit_logs" on audit_logs 
  for insert with check (
    auth.role() = 'authenticated'
  );

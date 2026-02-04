-- Notifications Table
create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null, -- Recipient
  type text not null, -- (system, place_approval, review, etc.)
  title text not null,
  message text,
  link text, -- Action link (e.g. /admin/places/123)
  is_read boolean default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- RLS Policies
alter table public.notifications enable row level security;

-- Drop old policies if any
drop policy if exists "Users can view their own notifications" on notifications;
drop policy if exists "Admins can insert notifications" on notifications;

-- 1. SELECT: Users see only their own notifications
create policy "Users can view their own notifications" on notifications
  for select using (auth.uid() = user_id);

-- 2. UPDATE: Users can mark their own as read
create policy "Users can update their own notifications" on notifications
  for update using (auth.uid() = user_id);

-- 3. INSERT: Admins and System Functions can send notifications
-- Allowing authenticated users to insert might be risky unless strictly controlled via server actions.
-- Ideally proper valid logic is done via SERVICE_ROLE or Secure Server Actions.
-- For now, we allow authenticated inserts but validation happens in application logic.
create policy "Authenticated users can insert notifications" on notifications
  for insert with check (auth.role() = 'authenticated');

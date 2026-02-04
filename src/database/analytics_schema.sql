-- Site Analytics Table
create table if not exists public.site_analytics (
  date date primary key default current_date,
  count integer default 0
);

-- Enable RLS
alter table public.site_analytics enable row level security;

-- Policies
-- 1. Everyone can view (for dashboard) - restricted by business logic mostly, but safe to read
create policy "Everyone can view analytics" on public.site_analytics
  for select using (true);

-- 2. No direct insert/update from client. We use RPC.
-- So no INSERT/UPDATE policies needed for public.

-- RPC Function to safely increment visits
create or replace function public.increment_visits()
returns void as $$
begin
  insert into public.site_analytics (date, count)
  values (current_date, 1)
  on conflict (date)
  do update set count = site_analytics.count + 1;
end;
$$ language plpgsql security definer;

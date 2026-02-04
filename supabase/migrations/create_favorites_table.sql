-- Create favorites table
create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  place_id uuid references places(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, place_id)
);

-- Enable RLS
alter table favorites enable row level security;

-- Policies
create policy "Users can view their own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

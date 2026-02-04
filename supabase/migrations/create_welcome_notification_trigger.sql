-- Function to handle new user welcome notification
create or replace function public.handle_new_user_welcome()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, message, link, is_read)
  values (
    new.id,
    'welcome',
    'مرحباً بك في دليل السويس! 🎉',
    'سعداء بانضمامك إلينا. استكشف أفضل الأماكن والخدمات في مدينتك.',
    '/profile',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_welcome();

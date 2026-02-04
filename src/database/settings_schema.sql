-- Settings Table
create table if not exists public.settings (
  key text primary key,
  value text, -- Stored as string, parsed based on 'type'
  "group" text not null default 'general', -- e.g. 'general', 'appearance', 'contact', 'scripts'
  type text not null default 'text', -- 'text', 'boolean', 'json', 'image'
  label text, -- Human readable label (e.g. "Site Name")
  description text, -- Helper text
  is_public boolean default true, -- If true, accessible by public API (for footer/header)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.settings enable row level security;

-- Policies

-- 1. Public Read (Only for is_public = true)
create policy "Public can view public settings" on public.settings
  for select using (is_public = true);

-- 2. Admins can do EVERYTHING (Select, Insert, Update, Delete)
create policy "Admins can manage settings" on public.settings
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'super_admin')
    )
  );

-- Seed Initial Data (Upsert)
INSERT INTO public.settings (key, value, "group", type, label, description, is_public)
VALUES
  -- General
  ('site_name', 'دليل السويس', 'general', 'text', 'اسم الموقع', 'الاسم الذي يظهر في شريط المتصفح', true),
  ('site_description', 'الدليل الشامل لكل ما تحتاجة في مدينة السويس', 'general', 'text', 'وصف الموقع', 'يظهر في محركات البحث والفوتر', true),
  
  -- Contact
  ('support_phone', '+201019979315', 'contact', 'text', 'رقم الهاتف', 'للتواصل والدعم', true),
  ('support_email', 'info@suez.com', 'contact', 'text', 'البريد الإلكتروني', 'للتواصل', true),
  ('whatsapp_number', '+201019979315', 'contact', 'text', 'رقم الواتساب', 'بدون رمز +', true),
  
  -- Maintenance
  ('maintenance_mode', 'false', 'system', 'boolean', 'وضع الصيانة', 'تفعيل هذا الوضع سيمنع الزوار من دخول الموقع', false),

  -- Menus (JSON)
  ('footer_browse_menu', '[{"label": "مطاعم", "url": "/places/restaurants"}, {"label": "كافيهات", "url": "/places/cafes"}, {"label": "خدمات طبية", "url": "/places/medical"}]', 'menus', 'json', 'قائمة تصفح (الفوتر)', 'الروابط التي تظهر تحت عمود تصفح', true),
  ('social_links', '[{"platform": "facebook", "url": "https://facebook.com"}, {"platform": "instagram", "url": "https://instagram.com"}]', 'contact', 'json', 'روابط السوشيال ميديا', 'أيقونات التواصل الاجتماعي', true)

ON CONFLICT (key) DO NOTHING;

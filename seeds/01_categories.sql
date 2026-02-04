-- Insert Categories
INSERT INTO public.categories (name, slug, icon) VALUES
('مطاعم وكافيهات', 'restaurants-cafes', 'utensils'),
('تسوق ومحلات', 'shopping', 'shopping-bag'),
('خدمات طبية', 'medical', 'stethoscope'),
('سيارات ونقل', 'automotive', 'car'),
('عقارات', 'real-estate', 'home'),
('خدمات حكومية', 'government', 'building-2'),
('تعليم', 'education', 'graduation-cap'),
('رياضة ولياقة', 'sports', 'dumbbell')
ON CONFLICT (slug) DO NOTHING;

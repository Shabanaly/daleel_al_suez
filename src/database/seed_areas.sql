-- Seed Initial Areas for Suez
INSERT INTO public.areas (name, slug) VALUES
('حي الأربعين', 'al-arbaeen'),
('حي السويس', 'al-suez'),
('حي الجناين', 'al-ganayen'),
('حي فيصل', 'faisal'),
('حي عتاقة', 'ataqah')
ON CONFLICT (slug) DO NOTHING;

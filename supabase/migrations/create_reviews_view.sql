-- Create a secure view to access reviews with user data
CREATE OR REPLACE VIEW public.reviews_details AS
SELECT 
    r.*,
    u.email as user_email,
    u.raw_user_meta_data as user_meta_data
FROM reviews r
JOIN auth.users u ON r.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON public.reviews_details TO anon, authenticated;

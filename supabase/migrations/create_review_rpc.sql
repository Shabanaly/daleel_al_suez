-- Secure RPC function to submit a review
-- This bypasses RLS complexity by handling the insert and rating update in a trusted function
-- It assumes the user is authenticated (auth.uid() is not null)

CREATE OR REPLACE FUNCTION submit_review(
    p_place_id UUID,
    p_rating INTEGER,
    p_comment TEXT,
    p_title TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to update places table safely
SET search_path = public -- Security best practice
AS $$
DECLARE
    v_user_id UUID;
    v_review_id UUID;
    v_new_rating DECIMAL(2,1);
    v_new_count INTEGER;
BEGIN
    -- 1. Get current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Insert Review
    INSERT INTO reviews (
        place_id,
        user_id,
        rating,
        title,
        comment,
        status,
        helpful_count
    ) VALUES (
        p_place_id,
        v_user_id,
        p_rating,
        p_title,
        p_comment,
        'approved', -- Default to approved
        0
    )
    RETURNING id INTO v_review_id;

    -- 3. Update Place Statistics Directly (No dependency on triggers)
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO v_new_rating, v_new_count
    FROM reviews
    WHERE place_id = p_place_id AND status = 'approved';

    UPDATE places
    SET 
        rating = v_new_rating,
        review_count = v_new_count
    WHERE id = p_place_id;

    -- 4. Return the new review data
    RETURN jsonb_build_object(
        'id', v_review_id,
        'place_id', p_place_id,
        'user_id', v_user_id,
        'rating', p_rating,
        'status', 'approved'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_review TO authenticated;

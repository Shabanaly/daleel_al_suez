-- Enhance reviews system with anonymous option and uniqueness constraint
-- Run this in Supabase SQL Editor

-- 1. Add is_anonymous column
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- 2. Add Unique Constraint
-- First, remove any duplicates if they exist (keeping the latest one)
DELETE FROM reviews a USING reviews b
WHERE a.id < b.id
AND a.place_id = b.place_id
AND a.user_id = b.user_id;

ALTER TABLE reviews 
ADD CONSTRAINT unique_user_place_review UNIQUE (user_id, place_id);

-- 3. Update RPC function to support anonymous flag
CREATE OR REPLACE FUNCTION submit_review(
    p_place_id UUID,
    p_rating INTEGER,
    p_comment TEXT,
    p_title TEXT DEFAULT NULL,
    p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_review_id UUID;
    v_new_rating DECIMAL(2,1);
    v_new_count INTEGER;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Insert Review
    INSERT INTO reviews (
        place_id,
        user_id,
        rating,
        title,
        comment,
        status,
        helpful_count,
        is_anonymous
    ) VALUES (
        p_place_id,
        v_user_id,
        p_rating,
        p_title,
        p_comment,
        'approved',
        0,
        p_is_anonymous
    )
    RETURNING id INTO v_review_id;

    -- Update Place Statistics
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

    RETURN jsonb_build_object(
        'id', v_review_id,
        'place_id', p_place_id,
        'user_id', v_user_id,
        'rating', p_rating,
        'status', 'approved',
        'is_anonymous', p_is_anonymous
    );
END;
$$;

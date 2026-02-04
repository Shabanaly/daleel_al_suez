-- FINAL FIX FOR REVIEWS SYSTEM
-- Run this entire script in Supabase SQL Editor

-- 1. SECURITY DEFINER TRIGGER (Crucial for auto-updating ratings)
-- This allows the trigger to update the 'places' table even if the user doesn't have direct permission
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE places
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE place_id = OLD.place_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE place_id = OLD.place_id AND status = 'approved'
            )
        WHERE id = OLD.place_id;
        RETURN OLD;
    ELSE
        UPDATE places
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE place_id = NEW.place_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE place_id = NEW.place_id AND status = 'approved'
            )
        WHERE id = NEW.place_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Runs with owner privileges

-- 2. RESET & FIX RLS POLICIES FOR REVIEWS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop all potentially conflicting policies
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;

-- Create Clean Policies

-- ALLOW INSERT: Any authenticated user can create a review linked to their own ID
CREATE POLICY "reviews_insert_policy"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ALLOW SELECT: Everyone can view approved reviews
CREATE POLICY "reviews_select_policy"
ON reviews FOR SELECT
USING (status = 'approved');

-- ALLOW UPDATE: Users can update their own reviews
CREATE POLICY "reviews_update_policy"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ALLOW DELETE: Users can delete their own reviews
CREATE POLICY "reviews_delete_policy"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. RESET & FIX RLS POLICIES FOR VOTES
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view votes" ON review_votes;
DROP POLICY IF EXISTS "Users can vote" ON review_votes;
DROP POLICY IF EXISTS "Users can update their votes" ON review_votes;
DROP POLICY IF EXISTS "Users can delete their votes" ON review_votes;

CREATE POLICY "votes_select_policy"
ON review_votes FOR SELECT
USING (true);

CREATE POLICY "votes_insert_policy"
ON review_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "votes_update_policy"
ON review_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "votes_delete_policy"
ON review_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

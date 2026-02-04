-- Fix RLS policies for reviews table
-- Run this in Supabase SQL Editor

-- Enable RLS (just in case)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;

-- Create clean policies

-- 1. VIEW: Anyone can view approved reviews
CREATE POLICY "Public reviews are viewable by everyone"
ON reviews FOR SELECT
USING (status = 'approved');

-- 2. INSERT: Authenticated users can create reviews for themselves
CREATE POLICY "Users can create their own reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

-- 4. DELETE: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- Also fix review_votes policies
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view votes" ON review_votes;
DROP POLICY IF EXISTS "Users can vote" ON review_votes;
DROP POLICY IF EXISTS "Users can update their votes" ON review_votes;
DROP POLICY IF EXISTS "Users can delete their votes" ON review_votes;

CREATE POLICY "Anyone can view votes"
ON review_votes FOR SELECT
USING (true);

CREATE POLICY "Users can vote"
ON review_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes"
ON review_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes"
ON review_votes FOR DELETE
USING (auth.uid() = user_id);

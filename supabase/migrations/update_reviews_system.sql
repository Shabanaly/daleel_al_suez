-- Migration: Update reviews system
-- This migration safely updates existing reviews table and adds missing components

-- 1. Add missing columns to reviews table (if they don't exist)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS title VARCHAR(200),
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Create review_votes table if not exists
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(review_id, user_id)
);

-- 3. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);

-- 4. Update places table for rating stats
ALTER TABLE places 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 5. Create or replace the rating update function
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle both INSERT/UPDATE and DELETE
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
$$ LANGUAGE plpgsql;

-- 6. Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_place_rating ON reviews;
CREATE TRIGGER trigger_update_place_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_place_rating();

-- 7. Enable RLS on tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view votes" ON review_votes;
DROP POLICY IF EXISTS "Users can vote" ON review_votes;
DROP POLICY IF EXISTS "Users can update their votes" ON review_votes;
DROP POLICY IF EXISTS "Users can delete their votes" ON review_votes;

-- 9. Create policies
CREATE POLICY "Anyone can view approved reviews"
    ON reviews FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Users can create their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

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

-- 10. Update existing approved reviews to recalculate ratings
DO $$
DECLARE
    place_record RECORD;
BEGIN
    FOR place_record IN SELECT DISTINCT place_id FROM reviews WHERE status = 'approved'
    LOOP
        UPDATE places
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE place_id = place_record.place_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE place_id = place_record.place_id AND status = 'approved'
            )
        WHERE id = place_record.place_id;
    END LOOP;
END $$;

-- Fix update_place_rating function to bypass RLS
-- This is required because regular users don't have permission to update places table directly
-- SECURITY DEFINER makes the function run with the privileges of the owner (postgres/admin)

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

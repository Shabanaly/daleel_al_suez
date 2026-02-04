-- Fix: Add 'pending' to status CHECK constraint
-- This migration updates the places table to allow 'pending' as a valid status value

-- Drop existing constraint if it exists
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_status_check;

-- Add new constraint with all three statuses
ALTER TABLE places ADD CONSTRAINT places_status_check 
CHECK (status IN ('active', 'pending', 'inactive'));

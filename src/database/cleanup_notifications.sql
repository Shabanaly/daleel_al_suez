-- Clear old notifications with wrong links
-- This is a one-time cleanup script to remove old notifications with outdated links

-- Option 1: Delete all old notifications (clean start)
DELETE FROM notifications;

-- Option 2: Update existing notification links to point to /admin/places
-- UPDATE notifications 
-- SET link = '/admin/places' 
-- WHERE link LIKE '/admin/places/%/edit' OR link LIKE '/places/%';

-- Remove old "Löpskolan" workout track
-- We now have a dedicated Running Coach at /run

DELETE FROM workout_tracks 
WHERE title = 'Löpskolan' OR title ILIKE '%löp%';

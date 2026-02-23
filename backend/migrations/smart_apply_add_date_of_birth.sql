-- Add date_of_birth to smart_apply_candidates (for birthday wishes)
-- Run once on existing DBs. New installs use smart_apply_tables.sql which already includes this column.

USE app_booker_pro;

ALTER TABLE smart_apply_candidates
  ADD COLUMN date_of_birth DATE DEFAULT NULL AFTER phone;

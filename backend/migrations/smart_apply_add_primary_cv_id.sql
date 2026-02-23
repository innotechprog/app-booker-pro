-- Add primary_cv_id to smart_apply_candidates (link default CV for applications)
-- Run once on existing DBs. New installs may use smart_apply_tables.sql; add this column there too if missing.

USE app_booker_pro;

-- If date_of_birth is missing, run smart_apply_add_date_of_birth.sql first.
ALTER TABLE smart_apply_candidates
  ADD COLUMN primary_cv_id INT DEFAULT NULL AFTER date_of_birth,
  ADD INDEX idx_smart_apply_primary_cv (primary_cv_id);

-- Add gender, nationality, and other personal fields to smart_apply_candidates
-- Run once on existing DBs. Omit any column that already exists.

USE app_booker_pro;

ALTER TABLE smart_apply_candidates
  ADD COLUMN gender VARCHAR(50) DEFAULT NULL AFTER primary_cv_id,
  ADD COLUMN nationality VARCHAR(100) DEFAULT NULL AFTER gender,
  ADD COLUMN current_location VARCHAR(255) DEFAULT NULL AFTER nationality,
  ADD COLUMN job_title VARCHAR(255) DEFAULT NULL AFTER current_location,
  ADD COLUMN linkedin_url VARCHAR(500) DEFAULT NULL AFTER job_title,
  ADD COLUMN website VARCHAR(500) DEFAULT NULL AFTER linkedin_url;

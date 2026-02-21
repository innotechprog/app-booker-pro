-- Add Smart Apply candidate category to users (for recruiters: general vs professional)
-- Run once. If column already exists, this will error (safe to ignore).
ALTER TABLE users
  ADD COLUMN candidate_category VARCHAR(20) DEFAULT NULL COMMENT 'Smart Apply: general (Grade 12) or professional';
ALTER TABLE users ADD INDEX idx_candidate_category (candidate_category);

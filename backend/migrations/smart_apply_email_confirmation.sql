-- Email confirmation and onboarding tour for Smart Apply candidates
-- Run after smart_apply_tables.sql and related migrations
ALTER TABLE smart_apply_candidates ADD COLUMN email_confirmed_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE smart_apply_candidates ADD COLUMN email_confirmation_token VARCHAR(64) DEFAULT NULL;
ALTER TABLE smart_apply_candidates ADD COLUMN onboarding_tour_completed_at TIMESTAMP NULL DEFAULT NULL;

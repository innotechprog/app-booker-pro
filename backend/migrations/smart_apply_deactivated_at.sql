-- Add deactivated_at column to smart_apply_candidates
-- When set, the account is deactivated and cannot log in

ALTER TABLE smart_apply_candidates
ADD COLUMN deactivated_at TIMESTAMP NULL DEFAULT NULL
COMMENT 'When set, account is deactivated';

-- Add deactivated_at to recruiters for account deactivation
ALTER TABLE recruiters
ADD COLUMN deactivated_at TIMESTAMP NULL DEFAULT NULL
COMMENT 'When set, account is deactivated';

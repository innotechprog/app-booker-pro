-- Add job listing fields to recruiter_jobs (no id column; job_id is already the PK)
-- Run after recruiter_jobs_tables.sql. Safe to run multiple times (duplicate column errors are ignored).
-- external_job_id = external/legacy job reference (not the table PK).

ALTER TABLE recruiter_jobs ADD COLUMN external_job_id VARCHAR(100) DEFAULT NULL COMMENT 'External or legacy job reference';
ALTER TABLE recruiter_jobs ADD COLUMN comp_id INT DEFAULT NULL COMMENT 'Company identifier';
ALTER TABLE recruiter_jobs ADD COLUMN company_id INT DEFAULT NULL COMMENT 'Company reference';
ALTER TABLE recruiter_jobs ADD COLUMN job_intro TEXT DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN job_title VARCHAR(255) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN job_desc TEXT DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN reporting_to VARCHAR(255) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN min_salary DECIMAL(14,2) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN max_salary DECIMAL(14,2) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN job_salary VARCHAR(255) DEFAULT NULL COMMENT 'Display salary string if not min/max';
ALTER TABLE recruiter_jobs ADD COLUMN currency VARCHAR(10) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN sal_interval VARCHAR(50) DEFAULT NULL COMMENT 'e.g. yearly, monthly, hourly';
ALTER TABLE recruiter_jobs ADD COLUMN post_type VARCHAR(50) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN work_method VARCHAR(50) DEFAULT NULL COMMENT 'e.g. remote, hybrid, onsite';
ALTER TABLE recruiter_jobs ADD COLUMN start_date DATE DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN application_link VARCHAR(500) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN qualification TEXT DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN experience VARCHAR(255) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN position_level VARCHAR(100) DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN num_pos INT DEFAULT NULL COMMENT 'Number of positions';
ALTER TABLE recruiter_jobs ADD COLUMN unsuccessful_period INT DEFAULT NULL COMMENT 'e.g. days before marking unsuccessful';
ALTER TABLE recruiter_jobs ADD COLUMN date_posted DATE DEFAULT NULL;
ALTER TABLE recruiter_jobs ADD COLUMN closing_date DATE DEFAULT NULL;

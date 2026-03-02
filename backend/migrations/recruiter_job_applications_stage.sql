-- Add pipeline stage and interview invitation tracking to job applications
-- Stages: applied | shortlisted | interview | hired | rejected
ALTER TABLE recruiter_job_applications ADD COLUMN stage VARCHAR(20) DEFAULT 'applied' COMMENT 'applied | shortlisted | interview | hired | rejected';
ALTER TABLE recruiter_job_applications ADD COLUMN interview_invite_sent_at TIMESTAMP NULL DEFAULT NULL;

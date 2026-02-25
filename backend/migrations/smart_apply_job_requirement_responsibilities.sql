-- Requirements and responsibilities for recruiter jobs (table_id only, no generic id)
-- Run after recruiter_jobs_tables.sql.
-- PKs: requirement_id CHAR(36), responsibility_id CHAR(36). job_id CHAR(36) FK to recruiter_jobs(job_id).

CREATE TABLE IF NOT EXISTS smart_apply_job_requirement (
  requirement_id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  requirement TEXT DEFAULT NULL,
  experience VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(job_id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

CREATE TABLE IF NOT EXISTS smart_apply_job_responsibilities (
  responsibility_id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  responsibility TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(job_id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

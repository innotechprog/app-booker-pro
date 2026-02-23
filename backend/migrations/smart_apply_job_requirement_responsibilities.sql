-- Requirements and responsibilities for recruiter jobs (linked to recruiter_jobs)
-- Run after recruiter_jobs_tables.sql.
-- Primary keys: requirement_id, responsibility_id (CHAR(36) UUID – generate in app with UUID() or crypto.randomUUID()).

CREATE TABLE IF NOT EXISTS smart_apply_job_requirement (
  requirement_id CHAR(36) PRIMARY KEY,
  job_id INT NOT NULL,
  requirement TEXT DEFAULT NULL,
  experience VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

CREATE TABLE IF NOT EXISTS smart_apply_job_responsibilities (
  responsibility_id CHAR(36) PRIMARY KEY,
  job_id INT NOT NULL,
  responsibility TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

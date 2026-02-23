-- Normalized recruiter schema: table_id as CHAR(36) UUID PK (no generic id).
-- Drops and recreates recruiter-related tables. Run only on fresh or when you can lose recruiter data.
-- Order: drop children first, then parent tables; then create recruiters -> jobs -> applications -> requirement -> responsibilities.

-- -------- DROP (reverse dependency order) --------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS smart_apply_job_responsibilities;
DROP TABLE IF EXISTS smart_apply_job_requirement;
DROP TABLE IF EXISTS recruiter_job_applications;
DROP TABLE IF EXISTS recruiter_jobs;
DROP TABLE IF EXISTS recruiters;
SET FOREIGN_KEY_CHECKS = 1;

-- -------- RECRUITERS (recruiter_id PK) --------
CREATE TABLE recruiters (
  recruiter_id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- -------- RECRUITER_JOBS (job_id PK, recruiter_id FK) --------
CREATE TABLE recruiter_jobs (
  job_id CHAR(36) PRIMARY KEY,
  recruiter_id CHAR(36) NOT NULL,
  external_job_id VARCHAR(100) DEFAULT NULL COMMENT 'External or legacy job reference',
  comp_id INT DEFAULT NULL,
  company_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  job_intro TEXT DEFAULT NULL,
  job_title VARCHAR(255) DEFAULT NULL,
  job_desc TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  reporting_to VARCHAR(255) DEFAULT NULL,
  min_salary DECIMAL(14,2) DEFAULT NULL,
  max_salary DECIMAL(14,2) DEFAULT NULL,
  job_salary VARCHAR(255) DEFAULT NULL,
  currency VARCHAR(10) DEFAULT NULL,
  sal_interval VARCHAR(50) DEFAULT NULL,
  post_type VARCHAR(50) DEFAULT NULL,
  work_method VARCHAR(50) DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  application_link VARCHAR(500) DEFAULT NULL,
  qualification TEXT DEFAULT NULL,
  experience VARCHAR(255) DEFAULT NULL,
  position_level VARCHAR(100) DEFAULT NULL,
  num_pos INT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft | posted',
  unsuccessful_period INT DEFAULT NULL,
  date_posted DATE DEFAULT NULL,
  closing_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES recruiters(recruiter_id) ON DELETE CASCADE,
  INDEX idx_recruiter_id (recruiter_id),
  INDEX idx_status (status),
  INDEX idx_date_posted (date_posted),
  INDEX idx_closing_date (closing_date)
);

-- -------- RECRUITER_JOB_APPLICATIONS (application_id PK) --------
CREATE TABLE recruiter_job_applications (
  application_id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  candidate_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending | accepted | rejected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_job_candidate (job_id, candidate_id),
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

-- -------- SMART_APPLY_JOB_REQUIREMENT (requirement_id PK) --------
CREATE TABLE smart_apply_job_requirement (
  requirement_id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  requirement TEXT DEFAULT NULL,
  experience VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(job_id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

-- -------- SMART_APPLY_JOB_RESPONSIBILITIES (responsibility_id PK) --------
CREATE TABLE smart_apply_job_responsibilities (
  responsibility_id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  responsibility TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruiter_jobs(job_id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id)
);

-- =============================================
-- Smart Apply – standalone tables (no sharing with users/other services)
-- =============================================

USE app_booker_pro;

-- 1. Smart Apply candidates (auth + core profile; CV sections in separate tables)
CREATE TABLE IF NOT EXISTS smart_apply_candidates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  primary_cv_id INT DEFAULT NULL COMMENT 'default CV for applications',
  gender VARCHAR(50) DEFAULT NULL,
  nationality VARCHAR(100) DEFAULT NULL,
  current_location VARCHAR(255) DEFAULT NULL,
  job_title VARCHAR(255) DEFAULT NULL,
  linkedin_url VARCHAR(500) DEFAULT NULL,
  website VARCHAR(500) DEFAULT NULL,
  candidate_category VARCHAR(20) DEFAULT NULL COMMENT 'general | professional',
  cv_overview TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_smart_apply_email (email),
  INDEX idx_smart_apply_category (candidate_category)
);

-- 2. Work experience (normalized; one row per entry, order preserved)
CREATE TABLE IF NOT EXISTS smart_apply_work_experience (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_we_candidate (candidate_id)
);

-- 3. Education (normalized; one row per entry)
CREATE TABLE IF NOT EXISTS smart_apply_education (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_edu_candidate (candidate_id)
);

-- 4. Certifications (normalized; one row per entry)
CREATE TABLE IF NOT EXISTS smart_apply_certifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_cert_candidate (candidate_id)
);

-- 5. Key skills (normalized; one row per entry)
CREATE TABLE IF NOT EXISTS smart_apply_key_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_skills_candidate (candidate_id)
);

-- 6. Sent applications (optional – for tracking what each candidate sent)
CREATE TABLE IF NOT EXISTS smart_apply_sent_emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  company_email VARCHAR(255) NOT NULL,
  topic VARCHAR(255) DEFAULT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_sent_candidate (candidate_id)
);

-- 7. Multiple CVs per candidate (for different roles/categories)
CREATE TABLE IF NOT EXISTS smart_apply_cvs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  label VARCHAR(255) NOT NULL COMMENT 'e.g. Software Developer CV',
  role_or_category VARCHAR(255) DEFAULT NULL COMMENT 'e.g. Software Developer or General',
  file_name VARCHAR(255) NOT NULL,
  file_content LONGBLOB NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_cvs_candidate (candidate_id)
);

-- 8. Addresses (multiple per candidate)
CREATE TABLE IF NOT EXISTS smart_apply_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  label VARCHAR(100) NOT NULL DEFAULT 'Current',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  state_region VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_smart_apply_addresses_candidate (candidate_id),
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE
);

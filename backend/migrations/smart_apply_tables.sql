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

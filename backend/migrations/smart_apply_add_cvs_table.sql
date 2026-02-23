-- Add smart_apply_cvs table for multiple CVs per candidate
USE app_booker_pro;

CREATE TABLE IF NOT EXISTS smart_apply_cvs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  role_or_category VARCHAR(255) DEFAULT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_content LONGBLOB NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_smart_apply_cvs_candidate (candidate_id)
);

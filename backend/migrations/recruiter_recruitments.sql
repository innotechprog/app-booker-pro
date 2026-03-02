-- Recruiter recruitments: campaigns/lists to group candidates
-- recruiter_id/recruiter_pk supports both UUID (recruiter_id) and legacy INT (id) - store as string
USE app_booker_pro;

CREATE TABLE IF NOT EXISTS recruiter_recruitments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recruiter_pk VARCHAR(36) NOT NULL COMMENT 'recruiter_id (UUID) or stringified id',
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_recruiter_pk (recruiter_pk)
);

CREATE TABLE IF NOT EXISTS recruiter_recruitment_candidates (
  recruitment_id INT NOT NULL,
  candidate_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (recruitment_id, candidate_id),
  FOREIGN KEY (recruitment_id) REFERENCES recruiter_recruitments(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_recruitment (recruitment_id),
  INDEX idx_candidate (candidate_id)
);

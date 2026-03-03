-- Recruiter search suggestions (talent search history per recruiter)
-- recruiter_pk stores recruiter_id (UUID) or legacy id as string
CREATE TABLE IF NOT EXISTS recruiter_search_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_pk VARCHAR(64) NOT NULL,
  query VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_recruiter_query (recruiter_pk, query(255)),
  INDEX idx_recruiter_pk (recruiter_pk)
);

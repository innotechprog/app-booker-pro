-- Addresses table for Smart Apply candidates (multiple addresses per candidate)

USE app_booker_pro;

CREATE TABLE IF NOT EXISTS smart_apply_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  label VARCHAR(100) NOT NULL DEFAULT 'Current' COMMENT 'e.g. Current, Permanent, Mailing',
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

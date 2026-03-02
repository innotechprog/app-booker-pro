-- Smart Apply premium: credits and vouchers
USE app_booker_pro;

-- Add credits column to candidates
ALTER TABLE smart_apply_candidates
  ADD COLUMN premium_credits INT NOT NULL DEFAULT 0;

-- Vouchers: code gives X credits, optional expiry and max redemptions
CREATE TABLE IF NOT EXISTS smart_apply_vouchers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE NOT NULL,
  credits INT NOT NULL,
  expires_at DATETIME DEFAULT NULL,
  max_redemptions INT DEFAULT NULL COMMENT 'NULL = unlimited',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_voucher_code (code)
);

-- Track who redeemed which voucher (prevents reuse by same user)
CREATE TABLE IF NOT EXISTS smart_apply_voucher_redemptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  voucher_id INT NOT NULL,
  candidate_id INT NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_candidate_voucher (voucher_id, candidate_id),
  FOREIGN KEY (voucher_id) REFERENCES smart_apply_vouchers(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES smart_apply_candidates(id) ON DELETE CASCADE,
  INDEX idx_redemption_candidate (candidate_id)
);

-- Sample OTT voucher for testing (5 credits, 100 redemptions total)
INSERT IGNORE INTO smart_apply_vouchers (code, credits, max_redemptions) VALUES ('OTT5', 5, 100);

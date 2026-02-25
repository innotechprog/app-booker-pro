-- Recruiter tables for Smart Apply recruiter portal (table_id only, no generic id)
-- Run via: npm run db:migrate-recruiter (in backend folder)
-- PK: recruiter_id CHAR(36) – generate in app with UUID() or crypto.randomUUID()

CREATE TABLE IF NOT EXISTS recruiters (
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

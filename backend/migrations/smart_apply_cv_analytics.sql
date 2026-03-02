-- Resume Analytics: track CV views, downloads, link clicks
USE app_booker_pro;

CREATE TABLE IF NOT EXISTS smart_apply_cv_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(24) NOT NULL,
  event_type ENUM('view','download','link_click') NOT NULL,
  link_url VARCHAR(500) DEFAULT NULL COMMENT 'for link_click events',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cv_analytics_slug (slug),
  INDEX idx_cv_analytics_slug_type (slug, event_type)
);

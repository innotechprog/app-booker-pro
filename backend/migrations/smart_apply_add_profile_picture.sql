-- Add profile picture and show-on-CV toggle to smart_apply_candidates
USE app_booker_pro;

ALTER TABLE smart_apply_candidates
  ADD COLUMN profile_picture MEDIUMTEXT DEFAULT NULL COMMENT 'base64 profile image (rescaled)',
  ADD COLUMN show_profile_picture_on_cv TINYINT(1) DEFAULT 1;

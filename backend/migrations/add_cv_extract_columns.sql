-- Add CV extract columns for Smart Apply profile (Overview, Work Experience, Education, Certifications, Key Skills)
ALTER TABLE users ADD COLUMN cv_overview TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN cv_work_experience TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN cv_education TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN cv_certifications TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN cv_key_skills TEXT DEFAULT NULL;

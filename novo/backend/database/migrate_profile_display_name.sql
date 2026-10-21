USE aoldeya_fitness;

ALTER TABLE users
  ADD COLUMN display_name VARCHAR(80) NULL AFTER name,
  ADD COLUMN profile_photo_data MEDIUMTEXT NULL AFTER display_name;
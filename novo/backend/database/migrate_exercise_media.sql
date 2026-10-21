USE aoldeya_fitness;

CREATE TABLE IF NOT EXISTS exercise_media (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  exercise_id INT UNSIGNED NOT NULL,
  media_type ENUM('image', 'gif') NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  source_name VARCHAR(120) NOT NULL,
  source_url VARCHAR(500) NULL,
  license_name VARCHAR(120) NULL,
  attribution VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exercise_media_type (exercise_id, media_type),
  CONSTRAINT fk_exercise_media_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

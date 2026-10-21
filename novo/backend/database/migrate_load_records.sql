USE aoldeya_fitness;

CREATE TABLE IF NOT EXISTS exercise_load_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  exercise_name VARCHAR(160) NOT NULL,
  weight_kg DECIMAL(7,2) NOT NULL,
  performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  workout_day ENUM('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom') NULL,
  PRIMARY KEY (id),
  KEY idx_load_records_user_date (user_id, performed_at),
  KEY idx_load_records_user_exercise (user_id, exercise_name, performed_at),
  CONSTRAINT fk_load_records_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;
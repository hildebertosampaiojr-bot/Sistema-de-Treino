USE aoldeya_fitness;

CREATE TABLE IF NOT EXISTS workout_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  trained_on DATE NOT NULL,
  workout_name VARCHAR(100) NOT NULL DEFAULT 'Treino concluido',
  workout_day ENUM('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom') NULL,
  record_source ENUM('manual', 'completed') NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workout_sessions_user_date (user_id, trained_on),
  KEY idx_workout_sessions_date (user_id, trained_on),
  CONSTRAINT fk_workout_sessions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;
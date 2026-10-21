CREATE DATABASE IF NOT EXISTS aoldeya_fitness
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aoldeya_fitness;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  display_name VARCHAR(80) NULL,
  profile_photo_data MEDIUMTEXT NULL,
  goal VARCHAR(160) NULL,
  weight_kg DECIMAL(5,2) NULL,
  height_m DECIMAL(3,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exercise_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exercise_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exercises (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exercises_category_name (category_id, name),
  KEY idx_exercises_category_order (category_id, sort_order),
  CONSTRAINT fk_exercises_category
    FOREIGN KEY (category_id) REFERENCES exercise_categories (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Catálogo de mídias por exercício. URLs podem apontar para arquivos locais
-- servidos pelo backend ou para uma fonte externa; origem/licença ficam registradas.
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

CREATE TABLE IF NOT EXISTS workouts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  day_of_week ENUM('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom') NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workouts_user_day (user_id, day_of_week),
  CONSTRAINT fk_workouts_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workout_exercises (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  workout_id INT UNSIGNED NOT NULL,
  exercise_id INT UNSIGNED NOT NULL,
  sets TINYINT UNSIGNED NOT NULL,
  reps VARCHAR(40) NOT NULL,
  rest_seconds SMALLINT UNSIGNED NULL,
  notes TEXT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_workout_exercises_order (workout_id, sort_order),
  CONSTRAINT fk_workout_exercises_workout
    FOREIGN KEY (workout_id) REFERENCES workouts (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_workout_exercises_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (name, goal, weight_kg, height_m)
VALUES
  ('Junior', 'Ganho de massa e força', 78.00, 1.75),
  ('Gabriella', 'Ganho de massa muscular', 48.00, 1.61)
ON DUPLICATE KEY UPDATE name = VALUES(name);


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
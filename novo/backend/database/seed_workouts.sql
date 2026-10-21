SET NAMES utf8mb4;
USE aoldeya_fitness;

-- Planos semanais migrados de velho/backend/migrations/003 e 005.
-- Reexecutar atualiza os treinos e substitui os exercícios desses planos.
INSERT INTO workouts (user_id, day_of_week, name)
SELECT u.id, p.day_of_week, p.name
FROM users AS u
JOIN (
  SELECT 'Junior' AS user_name, 'seg' AS day_of_week, 'Peito' AS name UNION ALL
  SELECT 'Junior', 'ter', 'Bíceps e tríceps' UNION ALL
  SELECT 'Junior', 'qua', 'Costas' UNION ALL
  SELECT 'Junior', 'qui', 'Quadríceps e ombros' UNION ALL
  SELECT 'Junior', 'sex', 'Posterior, glúteos e antebraços' UNION ALL
  SELECT 'Junior', 'sab', 'Treino funcional' UNION ALL
  SELECT 'Junior', 'dom', 'Cardio e recuperação ativa' UNION ALL
  SELECT 'Gabriella', 'seg', 'Posterior e glúteos' UNION ALL
  SELECT 'Gabriella', 'ter', 'Bíceps e tríceps' UNION ALL
  SELECT 'Gabriella', 'qua', 'Quadríceps e glúteos' UNION ALL
  SELECT 'Gabriella', 'qui', 'Costas e ombros' UNION ALL
  SELECT 'Gabriella', 'sex', 'Posterior e glúteos'
) AS p ON p.user_name = u.name
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Limpa apenas estes 12 planos para que a carga seja idempotente.
DELETE we FROM workout_exercises AS we
JOIN workouts AS w ON w.id = we.workout_id
JOIN users AS u ON u.id = w.user_id
WHERE u.name IN ('Junior', 'Gabriella');

-- Cria no catálogo as variações de nome que aparecem nos planos antigos.
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, x.name, 100
FROM (
  SELECT 'Peito' AS category, 'Supino máquina' AS name UNION ALL
  SELECT 'Peito', 'Crucifixo no crossover' UNION ALL
  SELECT 'Peito', 'Peck deck' UNION ALL
  SELECT 'Bíceps', 'Rosca direta com barra W' UNION ALL
  SELECT 'Bíceps', 'Rosca alternada com halteres' UNION ALL
  SELECT 'Bíceps', 'Rosca alternada' UNION ALL
  SELECT 'Bíceps', 'Rosca martelo' UNION ALL
  SELECT 'Bíceps', 'Rosca Scott' UNION ALL
  SELECT 'Tríceps', 'Tríceps testa com barra W' UNION ALL
  SELECT 'Tríceps', 'Tríceps corda na polia' UNION ALL
  SELECT 'Tríceps', 'Tríceps francês' UNION ALL
  SELECT 'Tríceps', 'Tríceps unilateral na polia' UNION ALL
  SELECT 'Costas', 'Barra fixa ou puxada alta' UNION ALL
  SELECT 'Costas', 'Remada curvada com barra' UNION ALL
  SELECT 'Costas', 'Remada baixa' UNION ALL
  SELECT 'Costas', 'Remada unilateral com halter' UNION ALL
  SELECT 'Costas', 'Pulldown com braços estendidos' UNION ALL
  SELECT 'Costas', 'Crucifixo inverso' UNION ALL
  SELECT 'Quadríceps', 'Agachamento livre' UNION ALL
  SELECT 'Quadríceps', 'Leg press 45°' UNION ALL
  SELECT 'Quadríceps', 'Cadeira extensora' UNION ALL
  SELECT 'Quadríceps', 'Agachamento búlgaro' UNION ALL
  SELECT 'Ombros', 'Desenvolvimento com halteres' UNION ALL
  SELECT 'Ombros', 'Elevação lateral' UNION ALL
  SELECT 'Ombros', 'Elevação lateral na polia' UNION ALL
  SELECT 'Posterior de coxa', 'Stiff com barra' UNION ALL
  SELECT 'Posterior de coxa', 'Mesa flexora' UNION ALL
  SELECT 'Posterior de coxa', 'Cadeira flexora' UNION ALL
  SELECT 'Glúteos', 'Elevação pélvica' UNION ALL
  SELECT 'Glúteos', 'Elevação pélvica com barra' UNION ALL
  SELECT 'Glúteos', 'Cadeira abdutora' UNION ALL
  SELECT 'Glúteos', 'Glúteo no cabo (coice)' UNION ALL
  SELECT 'Antebraço', 'Rosca de punho' UNION ALL
  SELECT 'Antebraço', 'Rosca de punho inversa' UNION ALL
  SELECT 'Funcional', 'Agachamento com peso corporal' UNION ALL
  SELECT 'Funcional', 'Flexão de braços' UNION ALL
  SELECT 'Abdômen e core', 'Prancha abdominal' UNION ALL
  SELECT 'Funcional', 'Polichinelos' UNION ALL
  SELECT 'Funcional', 'Mountain climber' UNION ALL
  SELECT 'Cardio e condicionamento', 'Caminhada ou bicicleta' UNION ALL
  SELECT 'Cardio e condicionamento', 'Caminhada ou bicicleta leve' UNION ALL
  SELECT 'Abdômen e core', 'Mobilidade geral' UNION ALL
  SELECT 'Abdômen e core', 'Alongamentos leves' UNION ALL
  SELECT 'Costas', 'Puxada alta na frente' UNION ALL
  SELECT 'Costas', 'Remada unilateral' UNION ALL
  SELECT 'Posterior de coxa', 'Stiff com halteres'
) AS x
JOIN exercise_categories AS c ON c.name = x.category
LEFT JOIN exercises AS existing ON existing.category_id = c.id AND existing.name = x.name
WHERE existing.id IS NULL;

-- Lista dos exercícios, séries, repetições e descanso. Ordem igual à ficha antiga.
DROP TEMPORARY TABLE IF EXISTS workout_seed;
CREATE TEMPORARY TABLE workout_seed (
  user_name VARCHAR(80) NOT NULL,
  day_of_week ENUM('seg','ter','qua','qui','sex','sab','dom') NOT NULL,
  category VARCHAR(80) NOT NULL,
  exercise_name VARCHAR(160) NOT NULL,
  sets TINYINT UNSIGNED NOT NULL,
  reps VARCHAR(40) NOT NULL,
  rest_seconds SMALLINT UNSIGNED NULL,
  sort_order SMALLINT UNSIGNED NOT NULL
) ENGINE=Memory;

INSERT INTO workout_seed VALUES
('Junior','seg','Peito','Supino reto com barra',4,'6-8',120,1),
('Junior','seg','Peito','Supino inclinado com halteres',3,'8-10',90,2),
('Junior','seg','Peito','Supino máquina',3,'10-12',90,3),
('Junior','seg','Peito','Crucifixo no crossover',3,'12-15',60,4),
('Junior','seg','Peito','Peck deck',2,'12-15',60,5),
('Junior','ter','Bíceps','Rosca direta com barra W',3,'8-10',90,1),
('Junior','ter','Bíceps','Rosca alternada com halteres',3,'10-12',60,2),
('Junior','ter','Bíceps','Rosca martelo',3,'10-12',60,3),
('Junior','ter','Bíceps','Rosca Scott',2,'12-15',60,4),
('Junior','ter','Tríceps','Tríceps testa com barra W',3,'8-10',90,5),
('Junior','ter','Tríceps','Tríceps corda na polia',3,'10-12',60,6),
('Junior','ter','Tríceps','Tríceps francês',3,'10-12',60,7),
('Junior','ter','Tríceps','Tríceps unilateral na polia',2,'12-15',60,8),
('Junior','qua','Costas','Barra fixa ou puxada alta',4,'6-10',120,1),
('Junior','qua','Costas','Remada curvada com barra',3,'8-10',120,2),
('Junior','qua','Costas','Remada baixa',3,'10-12',90,3),
('Junior','qua','Costas','Remada unilateral com halter',3,'10-12',90,4),
('Junior','qua','Costas','Pulldown com braços estendidos',2,'12-15',60,5),
('Junior','qua','Costas','Crucifixo inverso',2,'12-15',60,6),
('Junior','qui','Quadríceps','Agachamento livre',4,'6-8',120,1),
('Junior','qui','Quadríceps','Leg press 45°',3,'10-12',90,2),
('Junior','qui','Quadríceps','Cadeira extensora',3,'12-15',60,3),
('Junior','qui','Quadríceps','Agachamento búlgaro',2,'10-12 por perna',90,4),
('Junior','qui','Ombros','Desenvolvimento com halteres',3,'8-10',90,5),
('Junior','qui','Ombros','Elevação lateral',3,'12-15',60,6),
('Junior','qui','Ombros','Elevação lateral na polia',2,'12-15',60,7),
('Junior','sex','Posterior de coxa','Stiff com barra',3,'8-10',120,1),
('Junior','sex','Posterior de coxa','Mesa flexora',3,'10-12',90,2),
('Junior','sex','Posterior de coxa','Cadeira flexora',3,'12-15',60,3),
('Junior','sex','Glúteos','Elevação pélvica',3,'8-12',90,4),
('Junior','sex','Glúteos','Cadeira abdutora',2,'15-20',60,5),
('Junior','sex','Antebraço','Rosca de punho',3,'15-20',60,6),
('Junior','sex','Antebraço','Rosca de punho inversa',2,'12-15',60,7),
('Junior','sab','Funcional','Agachamento com peso corporal',3,'15',NULL,1),
('Junior','sab','Funcional','Flexão de braços',3,'10-15',NULL,2),
('Junior','sab','Abdômen e core','Prancha abdominal',3,'30-45 s',NULL,3),
('Junior','sab','Funcional','Polichinelos',3,'30 s',NULL,4),
('Junior','sab','Funcional','Mountain climber',3,'30 s',NULL,5),
('Junior','sab','Cardio e condicionamento','Caminhada ou bicicleta',1,'15-20 min',NULL,6),
('Junior','dom','Cardio e condicionamento','Caminhada ou bicicleta leve',1,'20-30 min',NULL,1),
('Junior','dom','Abdômen e core','Mobilidade geral',1,'10 min',NULL,2),
('Junior','dom','Abdômen e core','Alongamentos leves',1,'5-10 min',NULL,3),
('Gabriella','seg','Posterior de coxa','Mesa flexora',3,'10-12',90,1),
('Gabriella','seg','Posterior de coxa','Stiff com barra',3,'8-10',120,2),
('Gabriella','seg','Glúteos','Elevação pélvica com barra',3,'8-12',90,3),
('Gabriella','seg','Posterior de coxa','Cadeira flexora',2,'12-15',60,4),
('Gabriella','seg','Glúteos','Cadeira abdutora',2,'15-20',60,5),
('Gabriella','ter','Bíceps','Rosca direta com barra W',3,'8-12',90,1),
('Gabriella','ter','Bíceps','Rosca alternada',3,'10-12',60,2),
('Gabriella','ter','Bíceps','Rosca martelo',2,'10-12',60,3),
('Gabriella','ter','Tríceps','Tríceps corda na polia',3,'10-12',60,4),
('Gabriella','ter','Tríceps','Tríceps francês',3,'10-12',60,5),
('Gabriella','ter','Tríceps','Tríceps unilateral na polia',2,'12-15',60,6),
('Gabriella','qua','Quadríceps','Agachamento livre',3,'8-10',120,1),
('Gabriella','qua','Quadríceps','Leg press 45°',3,'10-12',90,2),
('Gabriella','qua','Quadríceps','Cadeira extensora',3,'12-15',60,3),
('Gabriella','qua','Quadríceps','Agachamento búlgaro',2,'10-12 por perna',90,4),
('Gabriella','qua','Glúteos','Glúteo no cabo (coice)',2,'12-15 por perna',60,5),
('Gabriella','qui','Costas','Puxada alta na frente',3,'10-12',90,1),
('Gabriella','qui','Costas','Remada baixa',3,'10-12',90,2),
('Gabriella','qui','Costas','Remada unilateral',2,'10-12',90,3),
('Gabriella','qui','Ombros','Desenvolvimento com halteres',3,'8-12',90,4),
('Gabriella','qui','Ombros','Elevação lateral',3,'12-15',60,5),
('Gabriella','qui','Costas','Crucifixo inverso',2,'12-15',60,6),
('Gabriella','sex','Posterior de coxa','Cadeira flexora',3,'10-12',90,1),
('Gabriella','sex','Posterior de coxa','Stiff com halteres',2,'10-12',90,2),
('Gabriella','sex','Glúteos','Elevação pélvica',3,'10-12',90,3),
('Gabriella','sex','Glúteos','Glúteo no cabo (coice)',2,'12-15 por perna',60,4),
('Gabriella','sex','Glúteos','Cadeira abdutora',2,'15-20',60,5);

INSERT INTO workout_exercises
  (workout_id, exercise_id, sets, reps, rest_seconds, sort_order)
SELECT w.id, e.id, s.sets, s.reps, s.rest_seconds, s.sort_order
FROM workout_seed AS s
JOIN users AS u ON u.name = s.user_name
JOIN workouts AS w ON w.user_id = u.id AND w.day_of_week = s.day_of_week
JOIN exercise_categories AS c ON c.name = s.category
JOIN exercises AS e ON e.category_id = c.id AND e.name = s.exercise_name
ORDER BY w.id, s.sort_order;

DROP TEMPORARY TABLE workout_seed;

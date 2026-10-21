SET NAMES utf8mb4;
USE aoldeya_fitness;

-- Catálogo importado da lista enviada, preservando nomes e acentos.
INSERT INTO exercise_categories (name, sort_order) VALUES
  ('Peito', 1),
  ('Costas', 2),
  ('Ombros', 3),
  ('Bíceps', 4),
  ('Tríceps', 5),
  ('Quadríceps', 6),
  ('Posterior de coxa', 7),
  ('Glúteos', 8),
  ('Panturrilhas', 9),
  ('Antebraço', 10),
  ('Abdômen e core', 11),
  ('Trapézio', 12),
  ('Adutores e abdutores', 13),
  ('Cardio e condicionamento', 14),
  ('Funcional', 15)
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Peito: 16 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Supino reto com barra' AS name, 1 AS sort_order
  UNION ALL SELECT 'Supino reto com halteres', 2
  UNION ALL SELECT 'Supino inclinado com barra', 3
  UNION ALL SELECT 'Supino inclinado com halteres', 4
  UNION ALL SELECT 'Supino declinado', 5
  UNION ALL SELECT 'Supino articulado', 6
  UNION ALL SELECT 'Supino na máquina', 7
  UNION ALL SELECT 'Crucifixo reto com halteres', 8
  UNION ALL SELECT 'Crucifixo inclinado', 9
  UNION ALL SELECT 'Crucifixo na máquina (Peck Deck)', 10
  UNION ALL SELECT 'Crossover na polia alta', 11
  UNION ALL SELECT 'Crossover na polia média', 12
  UNION ALL SELECT 'Crossover na polia baixa', 13
  UNION ALL SELECT 'Flexão de braço', 14
  UNION ALL SELECT 'Paralelas com ênfase no peito', 15
  UNION ALL SELECT 'Pullover com halter', 16
) AS e WHERE c.name = 'Peito' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Costas: 17 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Barra fixa pronada' AS name, 1 AS sort_order
  UNION ALL SELECT 'Barra fixa supinada', 2
  UNION ALL SELECT 'Puxada frontal aberta', 3
  UNION ALL SELECT 'Puxada frontal fechada', 4
  UNION ALL SELECT 'Puxada com triângulo', 5
  UNION ALL SELECT 'Puxada unilateral', 6
  UNION ALL SELECT 'Remada curvada com barra', 7
  UNION ALL SELECT 'Remada curvada com halteres', 8
  UNION ALL SELECT 'Remada cavalinho', 9
  UNION ALL SELECT 'Remada baixa na polia', 10
  UNION ALL SELECT 'Remada articulada', 11
  UNION ALL SELECT 'Remada unilateral (serrote)', 12
  UNION ALL SELECT 'Remada na máquina', 13
  UNION ALL SELECT 'Pulldown com braços estendidos', 14
  UNION ALL SELECT 'Pullover na polia', 15
  UNION ALL SELECT 'Levantamento terra', 16
  UNION ALL SELECT 'Hiperextensão lombar', 17
) AS e WHERE c.name = 'Costas' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Ombros: 16 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Desenvolvimento militar com barra' AS name, 1 AS sort_order
  UNION ALL SELECT 'Desenvolvimento com halteres', 2
  UNION ALL SELECT 'Desenvolvimento na máquina', 3
  UNION ALL SELECT 'Desenvolvimento Arnold', 4
  UNION ALL SELECT 'Elevação lateral com halteres', 5
  UNION ALL SELECT 'Elevação lateral na polia', 6
  UNION ALL SELECT 'Elevação lateral na máquina', 7
  UNION ALL SELECT 'Elevação frontal com halteres', 8
  UNION ALL SELECT 'Elevação frontal com barra', 9
  UNION ALL SELECT 'Elevação frontal na polia', 10
  UNION ALL SELECT 'Crucifixo inverso', 11
  UNION ALL SELECT 'Crucifixo inverso na máquina', 12
  UNION ALL SELECT 'Face pull', 13
  UNION ALL SELECT 'Remada alta', 14
  UNION ALL SELECT 'Encolhimento com halteres', 15
  UNION ALL SELECT 'Encolhimento com barra', 16
) AS e WHERE c.name = 'Ombros' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Bíceps: 14 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Rosca direta com barra' AS name, 1 AS sort_order
  UNION ALL SELECT 'Rosca direta com barra W', 2
  UNION ALL SELECT 'Rosca alternada', 3
  UNION ALL SELECT 'Rosca martelo', 4
  UNION ALL SELECT 'Rosca concentrada', 5
  UNION ALL SELECT 'Rosca Scott', 6
  UNION ALL SELECT 'Rosca Scott na máquina', 7
  UNION ALL SELECT 'Rosca inclinada com halteres', 8
  UNION ALL SELECT 'Rosca na polia baixa', 9
  UNION ALL SELECT 'Rosca unilateral na polia', 10
  UNION ALL SELECT 'Rosca spider', 11
  UNION ALL SELECT 'Rosca inversa', 12
  UNION ALL SELECT 'Rosca Zottman', 13
  UNION ALL SELECT 'Rosca Bayesian', 14
) AS e WHERE c.name = 'Bíceps' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Tríceps: 14 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Tríceps na polia com corda' AS name, 1 AS sort_order
  UNION ALL SELECT 'Tríceps na polia com barra reta', 2
  UNION ALL SELECT 'Tríceps na polia com barra V', 3
  UNION ALL SELECT 'Tríceps francês com halter', 4
  UNION ALL SELECT 'Tríceps francês unilateral', 5
  UNION ALL SELECT 'Tríceps francês com barra W', 6
  UNION ALL SELECT 'Tríceps testa com barra', 7
  UNION ALL SELECT 'Tríceps testa com halteres', 8
  UNION ALL SELECT 'Tríceps coice', 9
  UNION ALL SELECT 'Tríceps banco', 10
  UNION ALL SELECT 'Tríceps máquina', 11
  UNION ALL SELECT 'Tríceps acima da cabeça na polia', 12
  UNION ALL SELECT 'Supino fechado', 13
  UNION ALL SELECT 'Paralelas com ênfase no tríceps', 14
) AS e WHERE c.name = 'Tríceps' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Quadríceps: 17 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Agachamento livre' AS name, 1 AS sort_order
  UNION ALL SELECT 'Agachamento frontal', 2
  UNION ALL SELECT 'Agachamento no Smith', 3
  UNION ALL SELECT 'Agachamento Hack', 4
  UNION ALL SELECT 'Agachamento búlgaro', 5
  UNION ALL SELECT 'Agachamento sumô', 6
  UNION ALL SELECT 'Leg press 45°', 7
  UNION ALL SELECT 'Leg press horizontal', 8
  UNION ALL SELECT 'Leg press vertical', 9
  UNION ALL SELECT 'Cadeira extensora', 10
  UNION ALL SELECT 'Extensora unilateral', 11
  UNION ALL SELECT 'Afundo com halteres', 12
  UNION ALL SELECT 'Avanço com barra', 13
  UNION ALL SELECT 'Passada caminhando', 14
  UNION ALL SELECT 'Step-up no banco', 15
  UNION ALL SELECT 'Agachamento goblet', 16
  UNION ALL SELECT 'Sissy squat', 17
) AS e WHERE c.name = 'Quadríceps' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Posterior de coxa: 12 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Mesa flexora' AS name, 1 AS sort_order
  UNION ALL SELECT 'Cadeira flexora', 2
  UNION ALL SELECT 'Flexora em pé', 3
  UNION ALL SELECT 'Flexora unilateral', 4
  UNION ALL SELECT 'Stiff com barra', 5
  UNION ALL SELECT 'Stiff com halteres', 6
  UNION ALL SELECT 'Levantamento terra romeno', 7
  UNION ALL SELECT 'Levantamento terra convencional', 8
  UNION ALL SELECT 'Good morning', 9
  UNION ALL SELECT 'Nordic curl', 10
  UNION ALL SELECT 'Glute ham raise', 11
  UNION ALL SELECT 'Pull-through na polia', 12
) AS e WHERE c.name = 'Posterior de coxa' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Glúteos: 15 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Elevação pélvica com barra (Hip Thrust)' AS name, 1 AS sort_order
  UNION ALL SELECT 'Elevação pélvica na máquina', 2
  UNION ALL SELECT 'Ponte de glúteos', 3
  UNION ALL SELECT 'Glúteo na polia', 4
  UNION ALL SELECT 'Glúteo na máquina', 5
  UNION ALL SELECT 'Coice na polia', 6
  UNION ALL SELECT 'Cadeira abdutora', 7
  UNION ALL SELECT 'Abdução de quadril na polia', 8
  UNION ALL SELECT 'Abdução com miniband', 9
  UNION ALL SELECT 'Agachamento sumô', 10
  UNION ALL SELECT 'Agachamento búlgaro', 11
  UNION ALL SELECT 'Afundo reverso', 12
  UNION ALL SELECT 'Step-up', 13
  UNION ALL SELECT 'Levantamento terra sumô', 14
  UNION ALL SELECT 'Extensão de quadril no banco', 15
) AS e WHERE c.name = 'Glúteos' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Panturrilhas: 10 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Panturrilha em pé' AS name, 1 AS sort_order
  UNION ALL SELECT 'Panturrilha sentado', 2
  UNION ALL SELECT 'Panturrilha no leg press', 3
  UNION ALL SELECT 'Panturrilha no Smith', 4
  UNION ALL SELECT 'Panturrilha unilateral', 5
  UNION ALL SELECT 'Panturrilha no Hack', 6
  UNION ALL SELECT 'Panturrilha com halteres', 7
  UNION ALL SELECT 'Panturrilha na máquina', 8
  UNION ALL SELECT 'Elevação de panturrilha no degrau', 9
  UNION ALL SELECT 'Panturrilha donkey', 10
) AS e WHERE c.name = 'Panturrilhas' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Antebraço: 10 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Rosca de punho' AS name, 1 AS sort_order
  UNION ALL SELECT 'Rosca de punho inversa', 2
  UNION ALL SELECT 'Rosca inversa com barra', 3
  UNION ALL SELECT 'Rosca martelo', 4
  UNION ALL SELECT 'Rosca Zottman', 5
  UNION ALL SELECT 'Farmer''s walk', 6
  UNION ALL SELECT 'Dead hang', 7
  UNION ALL SELECT 'Wrist roller', 8
  UNION ALL SELECT 'Pronação e supinação com halter', 9
  UNION ALL SELECT 'Pinça com anilhas', 10
) AS e WHERE c.name = 'Antebraço' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Abdômen e core: 20 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Abdominal tradicional' AS name, 1 AS sort_order
  UNION ALL SELECT 'Abdominal supra', 2
  UNION ALL SELECT 'Abdominal infra', 3
  UNION ALL SELECT 'Abdominal bicicleta', 4
  UNION ALL SELECT 'Abdominal oblíquo', 5
  UNION ALL SELECT 'Abdominal na máquina', 6
  UNION ALL SELECT 'Abdominal na polia', 7
  UNION ALL SELECT 'Abdominal canivete', 8
  UNION ALL SELECT 'Elevação de pernas', 9
  UNION ALL SELECT 'Elevação de joelhos suspenso', 10
  UNION ALL SELECT 'Prancha frontal', 11
  UNION ALL SELECT 'Prancha lateral', 12
  UNION ALL SELECT 'Prancha dinâmica', 13
  UNION ALL SELECT 'Abdominal com roda', 14
  UNION ALL SELECT 'Crunch reverso', 15
  UNION ALL SELECT 'Russian twist', 16
  UNION ALL SELECT 'Dead bug', 17
  UNION ALL SELECT 'Bird dog', 18
  UNION ALL SELECT 'Pallof press', 19
  UNION ALL SELECT 'Hollow body hold', 20
) AS e WHERE c.name = 'Abdômen e core' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Trapézio: 8 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Encolhimento com barra' AS name, 1 AS sort_order
  UNION ALL SELECT 'Encolhimento com halteres', 2
  UNION ALL SELECT 'Encolhimento no Smith', 3
  UNION ALL SELECT 'Encolhimento na máquina', 4
  UNION ALL SELECT 'Encolhimento na polia', 5
  UNION ALL SELECT 'Farmer''s walk', 6
  UNION ALL SELECT 'Face pull', 7
  UNION ALL SELECT 'Remada alta', 8
) AS e WHERE c.name = 'Trapézio' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Adutores e abdutores: 8 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Cadeira adutora' AS name, 1 AS sort_order
  UNION ALL SELECT 'Cadeira abdutora', 2
  UNION ALL SELECT 'Adução de quadril na polia', 3
  UNION ALL SELECT 'Abdução de quadril na polia', 4
  UNION ALL SELECT 'Adução com bola', 5
  UNION ALL SELECT 'Abdução com miniband', 6
  UNION ALL SELECT 'Caminhada lateral com elástico', 7
  UNION ALL SELECT 'Copenhagen plank', 8
) AS e WHERE c.name = 'Adutores e abdutores' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Cardio e condicionamento: 16 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Esteira — caminhada' AS name, 1 AS sort_order
  UNION ALL SELECT 'Esteira — corrida', 2
  UNION ALL SELECT 'Bicicleta ergométrica', 3
  UNION ALL SELECT 'Bicicleta spinning', 4
  UNION ALL SELECT 'Elíptico', 5
  UNION ALL SELECT 'Escada ergométrica', 6
  UNION ALL SELECT 'Remo ergométrico', 7
  UNION ALL SELECT 'Pular corda', 8
  UNION ALL SELECT 'Air bike', 9
  UNION ALL SELECT 'Corrida intervalada', 10
  UNION ALL SELECT 'HIIT na esteira', 11
  UNION ALL SELECT 'Caminhada inclinada', 12
  UNION ALL SELECT 'Sled push', 13
  UNION ALL SELECT 'Battle rope', 14
  UNION ALL SELECT 'Burpee', 15
  UNION ALL SELECT 'Mountain climber', 16
) AS e WHERE c.name = 'Cardio e condicionamento' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Funcional: 15 exercícios
INSERT INTO exercises (category_id, name, sort_order)
SELECT c.id, e.name, e.sort_order FROM exercise_categories AS c JOIN (
  SELECT 'Agachamento com salto' AS name, 1 AS sort_order
  UNION ALL SELECT 'Burpee', 2
  UNION ALL SELECT 'Polichinelo', 3
  UNION ALL SELECT 'Kettlebell swing', 4
  UNION ALL SELECT 'Kettlebell clean', 5
  UNION ALL SELECT 'Kettlebell snatch', 6
  UNION ALL SELECT 'Box jump', 7
  UNION ALL SELECT 'Step-up', 8
  UNION ALL SELECT 'Farmer''s carry', 9
  UNION ALL SELECT 'Bear crawl', 10
  UNION ALL SELECT 'Battle rope', 11
  UNION ALL SELECT 'Thruster', 12
  UNION ALL SELECT 'Medicine ball slam', 13
  UNION ALL SELECT 'Flexão de braço', 14
  UNION ALL SELECT 'Prancha com toque no ombro', 15
) AS e WHERE c.name = 'Funcional' ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

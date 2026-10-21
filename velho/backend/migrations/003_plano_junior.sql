-- Plano fornecido pelo usuário. A migration adiciona os treinos somente ao Junior.
INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Peito', 'TREINO MASCULINO — HIPERTROFIA E FORÇA
Objetivo: ganho de massa muscular, força e desenvolvimento muscular equilibrado.

Supino reto com barra — 4 séries · 6–8 repetições · descanso: 120s
Supino inclinado com halteres — 3 séries · 8–10 repetições · descanso: 90s
Supino máquina — 3 séries · 10–12 repetições · descanso: 90s
Crucifixo no crossover — 3 séries · 12–15 repetições · descanso: 60s
Peck deck — 2 séries · 12–15 repetições · descanso: 60s

Orientações: controle a descida do peso por aproximadamente 2 segundos. Priorize amplitude confortável, técnica correta e progressão gradual de carga.', 1
FROM perfis WHERE nome = 'Junior';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Bíceps e tríceps', 'Rosca direta com barra W — 3 séries · 8–10 repetições · descanso: 90s
Rosca alternada com halteres — 3 séries · 10–12 repetições · descanso: 60s
Rosca martelo — 3 séries · 10–12 repetições · descanso: 60s
Rosca Scott — 2 séries · 12–15 repetições · descanso: 60s
Tríceps testa com barra W — 3 séries · 8–10 repetições · descanso: 90s
Tríceps corda na polia — 3 séries · 10–12 repetições · descanso: 60s
Tríceps francês — 3 séries · 10–12 repetições · descanso: 60s
Tríceps unilateral na polia — 2 séries · 12–15 repetições · descanso: 60s

Orientações: mantenha os cotovelos estáveis, evite usar o balanço do tronco e controle tanto a subida quanto a descida.', 2
FROM perfis WHERE nome = 'Junior';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Costas', 'Barra fixa ou puxada alta — 4 séries · 6–10 repetições · descanso: 120s
Remada curvada com barra — 3 séries · 8–10 repetições · descanso: 120s
Remada baixa — 3 séries · 10–12 repetições · descanso: 90s
Remada unilateral com halter — 3 séries · 10–12 repetições · descanso: 90s
Pulldown com braços estendidos — 2 séries · 12–15 repetições · descanso: 60s
Crucifixo inverso — 2 séries · 12–15 repetições · descanso: 60s

Orientações: evite impulsionar o peso com a lombar. Mantenha o tronco estável e priorize a movimentação controlada dos ombros e cotovelos.', 3
FROM perfis WHERE nome = 'Junior';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Quadríceps e ombros', 'Agachamento livre — 4 séries · 6–8 repetições · descanso: 120s
Leg press 45° — 3 séries · 10–12 repetições · descanso: 90s
Cadeira extensora — 3 séries · 12–15 repetições · descanso: 60s
Agachamento búlgaro — 2 séries · 10–12 repetições por perna · descanso: 90s
Desenvolvimento com halteres — 3 séries · 8–10 repetições · descanso: 90s
Elevação lateral — 3 séries · 12–15 repetições · descanso: 60s
Elevação lateral na polia — 2 séries · 12–15 repetições · descanso: 60s

Orientações: no agachamento, mantenha a coluna estável e utilize amplitude compatível com sua mobilidade. Nos ombros, evite balanços para levantar a carga.', 4
FROM perfis WHERE nome = 'Junior';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Posterior, glúteos e antebraços', 'Stiff com barra — 3 séries · 8–10 repetições · descanso: 120s
Mesa flexora — 3 séries · 10–12 repetições · descanso: 90s
Cadeira flexora — 3 séries · 12–15 repetições · descanso: 60s
Elevação pélvica — 3 séries · 8–12 repetições · descanso: 90s
Cadeira abdutora — 2 séries · 15–20 repetições · descanso: 60s
Rosca de punho — 3 séries · 15–20 repetições · descanso: 60s
Rosca de punho inversa — 2 séries · 12–15 repetições · descanso: 60s

Orientações: no stiff, mantenha a coluna neutra e movimente o quadril para trás. Na elevação pélvica, evite hiperestender a lombar.', 5
FROM perfis WHERE nome = 'Junior';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Treino funcional', 'Agachamento com peso corporal — 3 séries · 15 repetições
Flexão de braços — 3 séries · 10–15 repetições
Prancha abdominal — 3 séries · 30–45s
Polichinelos — 3 séries · 30s
Mountain climber — 3 séries · 30s
Caminhada ou bicicleta — 1 série · 15–20 min

Intensidade: leve a moderada, evitando prejudicar a recuperação muscular.', 6
FROM perfis WHERE nome = 'Junior';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Cardio e recuperação ativa', 'Caminhada ou bicicleta leve — 20–30 min
Mobilidade geral — 10 min
Alongamentos leves — 5–10 min

O domingo também pode ser utilizado para descanso completo, principalmente quando houver fadiga acumulada.', 7
FROM perfis WHERE nome = 'Junior';

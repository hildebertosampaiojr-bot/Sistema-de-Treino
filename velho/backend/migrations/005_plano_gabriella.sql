-- Plano fornecido pelo usuário, exclusivo do perfil Gabriella.
INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Posterior e glúteos', 'TREINO FEMININO — HIPERTROFIA E GANHO DE MASSA
Peso: 48 kg · Altura: 1,61 m
Objetivo: ganho de massa muscular, priorizando glúteos, posteriores e quadríceps.

Mesa flexora — 3 séries · 10–12 repetições · descanso: 90s
Stiff com barra — 3 séries · 8–10 repetições · descanso: 120s
Elevação pélvica com barra — 3 séries · 8–12 repetições · descanso: 90s
Cadeira flexora — 2 séries · 12–15 repetições · descanso: 60s
Cadeira abdutora — 2 séries · 15–20 repetições · descanso: 60s

Orientações: priorize execução controlada e progressão gradual. No stiff, mantenha a coluna neutra e evite compensações lombares.', 1
FROM perfis WHERE nome = 'Gabriella';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Bíceps e tríceps', 'Rosca direta com barra W — 3 séries · 8–12 repetições · descanso: 90s
Rosca alternada — 3 séries · 10–12 repetições · descanso: 60s
Rosca martelo — 2 séries · 10–12 repetições · descanso: 60s
Tríceps corda na polia — 3 séries · 10–12 repetições · descanso: 60s
Tríceps francês — 3 séries · 10–12 repetições · descanso: 60s
Tríceps unilateral na polia — 2 séries · 12–15 repetições · descanso: 60s

Orientações: evite movimentos bruscos e mantenha os cotovelos estáveis durante as repetições.', 2
FROM perfis WHERE nome = 'Gabriella';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Quadríceps e glúteos', 'Agachamento livre — 3 séries · 8–10 repetições · descanso: 120s
Leg press 45° — 3 séries · 10–12 repetições · descanso: 90s
Cadeira extensora — 3 séries · 12–15 repetições · descanso: 60s
Agachamento búlgaro — 2 séries · 10–12 repetições por perna · descanso: 90s
Glúteo no cabo (coice) — 2 séries · 12–15 repetições por perna · descanso: 60s

Orientações: mantenha a execução controlada, sem sacrificar a amplitude ou a postura para aumentar o peso.', 3
FROM perfis WHERE nome = 'Gabriella';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Costas e ombros', 'Puxada alta na frente — 3 séries · 10–12 repetições · descanso: 90s
Remada baixa — 3 séries · 10–12 repetições · descanso: 90s
Remada unilateral — 2 séries · 10–12 repetições · descanso: 90s
Desenvolvimento com halteres — 3 séries · 8–12 repetições · descanso: 90s
Elevação lateral — 3 séries · 12–15 repetições · descanso: 60s
Crucifixo inverso — 2 séries · 12–15 repetições · descanso: 60s

Orientações: evite utilizar impulso excessivo. Priorize controle e estabilidade dos ombros.', 4
FROM perfis WHERE nome = 'Gabriella';

INSERT INTO treinos (perfil_id, nome, descricao, dia_semana)
SELECT id, 'Posterior e glúteos', 'Cadeira flexora — 3 séries · 10–12 repetições · descanso: 90s
Stiff com halteres — 2 séries · 10–12 repetições · descanso: 90s
Elevação pélvica — 3 séries · 10–12 repetições · descanso: 90s
Glúteo no cabo (coice) — 2 séries · 12–15 repetições por perna · descanso: 60s
Cadeira abdutora — 2 séries · 15–20 repetições · descanso: 60s

Orientações: mantenha o treino em intensidade compatível com a recuperação da segunda e quarta-feira. Evite treinar até a falha em todas as séries.', 5
FROM perfis WHERE nome = 'Gabriella';

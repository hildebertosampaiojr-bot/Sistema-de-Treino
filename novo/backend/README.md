# Backend AOLDEYA Fitness

API em Python com Flask e MySQL. O catálogo de exercícios é separado dos planos semanais de cada usuário: a lista enviada entra no catálogo por grupo muscular, enquanto a associação de exercícios a Junior ou Gabriella e aos dias da semana fica nas tabelas de treinos.

## Preparar o banco

1. Em uma instalação nova, execute `database/schema.sql` no MySQL.
2. Execute `database/seed_exercises.sql` para inserir os 15 grupos e 208 exercícios enviados.
3. Execute `database/seed_workouts.sql` para carregar os treinos semanais de Junior e Gabriella.
4. Copie `.env.example` para `.env` e preencha `DB_PASSWORD` com a senha do seu MySQL.
5. Se o banco já existe, execute `database/migrate_load_records.sql`, `database/migrate_workout_sessions.sql` e `database/migrate_profile_display_name.sql` para criar o histórico de cargas, o calendário e os campos do perfil.

### Mídias dos exercícios

`exercise_media` guarda uma imagem e um GIF por exercício, com URL/caminho, fonte, licença e atribuição. As rotas de catálogo e de treinos retornam `image_url` e `gif_url` (nulos até as mídias serem cadastradas). Se o banco já estiver criado, execute `database/migrate_exercise_media.sql`.

O dataset público [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) publica imagens de poses sob Unlicense, mas não oferece GIFs. As imagens podem ser associadas aos exercícios com correspondência confirmada. Não preencha GIFs a partir de repositórios de origem/licença incerta; para ter animação para todos os 208 exercícios, será necessário obter arquivos com licença explícita que cubra o uso no app ou produzir as animações.

O esquema cria os usuários Junior e Gabriella. Os scripts de carga podem ser reexecutados sem duplicar grupos ou exercícios.

Se você já executou a versão anterior de `schema.sql`, rode `database/migrate_exercise_table.sql` uma única vez antes de executar o esquema atualizado e a carga do catálogo. A migração renomeia a tabela antiga para preservar os dados que existirem nela.

## Rodar a API no Windows PowerShell

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
py run.py
```

A API inicia em `http://127.0.0.1:5000`.

## Rotas disponíveis

- `GET /api/health` -" verifica se a API alcança o banco.
- `GET /api/users` -" lista os usuários.
- `GET /api/users/<id>` - consulta um usuário.
- `PUT /api/users/<id>/profile` - atualiza o nome de exibição.
- `GET /api/users/<id>/profile` e `PUT /api/users/<id>/profile-photo` - consultam e atualizam a foto do perfil.
- `GET /api/users/<id>/load-records` - retorna o histórico de cargas.
- `POST /api/users/<id>/load-records` - registra uma carga com `exercise_name`, `weight_kg` e `workout_day`.
- `GET /api/users/<id>/training-days?month=AAAA-MM` - lista os dias de treino do mês.
- `POST /api/users/<id>/training-days` - registra a data treinada, com `trained_on`, `workout_name`, `workout_day` e `source`.
- `GET /api/exercise-categories` -" lista os grupos musculares.
- `GET /api/exercises` -" lista o catálogo completo; aceita `?categoria_id=<id>` e `?busca=texto`.
- `GET /api/users/<id>/workouts?dia=seg` -" lista os exercícios já associados ao plano semanal do usuário.

Os dias aceitos são `seg`, `ter`, `qua`, `qui`, `sex`, `sab` e `dom`.

## Planos semanais

Depois de carregar o esquema e o catálogo de exercícios, execute `database/seed_workouts.sql` para inserir os planos semanais copiados de `velho` para Junior e Gabriella. A carga pode ser reexecutada para atualizar esses planos.




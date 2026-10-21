-- Execute uma única vez somente se o schema antigo já tiver sido importado.
-- Renomeia a tabela antiga de exercícios associados diretamente a usuários/dias;
-- os registros são preservados na tabela exercises_user_schedule_legacy.
USE aoldeya_fitness;
RENAME TABLE exercises TO exercises_user_schedule_legacy;

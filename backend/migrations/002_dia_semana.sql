ALTER TABLE treinos ADD COLUMN dia_semana INTEGER
    CHECK(dia_semana IS NULL OR dia_semana BETWEEN 1 AND 7);

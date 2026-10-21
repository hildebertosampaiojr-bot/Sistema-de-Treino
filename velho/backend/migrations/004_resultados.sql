CREATE TABLE resultados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perfil_id INTEGER NOT NULL REFERENCES perfis(id),
    treino_id INTEGER NOT NULL REFERENCES treinos(id),
    data TEXT NOT NULL,
    nome TEXT NOT NULL,
    dia_semana INTEGER,
    exercicios TEXT NOT NULL,
    salvo_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(perfil_id, treino_id, data)
);
CREATE INDEX idx_resultados_perfil_data ON resultados(perfil_id, data);

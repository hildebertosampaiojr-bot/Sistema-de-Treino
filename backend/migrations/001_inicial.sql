CREATE TABLE perfis (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE
);

INSERT INTO perfis (id, nome) VALUES (1, 'Junior'), (2, 'Gabriella');

CREATE TABLE treinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perfil_id INTEGER NOT NULL REFERENCES perfis(id),
    nome TEXT NOT NULL CHECK(length(nome) BETWEEN 1 AND 80),
    descricao TEXT NOT NULL DEFAULT '',
    concluido INTEGER NOT NULL DEFAULT 0 CHECK(concluido IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treinos_perfil ON treinos(perfil_id);

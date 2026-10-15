import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.environ.get("TREINO_DB_PATH", str(BACKEND / "banco_de_dados" / "treino.db")))


@contextmanager
def conectar():
    conexao = sqlite3.connect(DB_PATH)
    conexao.row_factory = sqlite3.Row
    conexao.execute("PRAGMA foreign_keys = ON")
    try:
        with conexao:
            yield conexao
    finally:
        conexao.close()


def inicializar():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with conectar() as conexao:
        conexao.execute("CREATE TABLE IF NOT EXISTS migrations (nome TEXT PRIMARY KEY)")
        for arquivo in sorted((BACKEND / "migrations").glob("*.sql")):
            if not conexao.execute("SELECT 1 FROM migrations WHERE nome = ?", (arquivo.name,)).fetchone():
                # Cada script e o registro da versão são aplicados na mesma transação.
                nome = arquivo.name.replace("'", "''")
                conexao.executescript("BEGIN;\n" + arquivo.read_text(encoding="utf-8") +
                                     f"\nINSERT INTO migrations(nome) VALUES ('{nome}');\nCOMMIT;")

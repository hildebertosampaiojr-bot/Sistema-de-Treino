from backend.banco_de_dados.conexao import conectar


def listar(perfil_id):
    with conectar() as conexao:
        return [dict(linha) for linha in conexao.execute(
            "SELECT * FROM treinos WHERE perfil_id = ? ORDER BY dia_semana IS NULL, dia_semana, id DESC", (perfil_id,))]


def criar(perfil_id, nome, descricao, dia_semana=None):
    with conectar() as conexao:
        cursor = conexao.execute("INSERT INTO treinos(perfil_id, nome, descricao, dia_semana) VALUES (?, ?, ?, ?)",
                                 (perfil_id, nome, descricao, dia_semana))
        return dict(conexao.execute("SELECT * FROM treinos WHERE id = ?", (cursor.lastrowid,)).fetchone())


def atualizar(treino_id, perfil_id, concluido):
    with conectar() as conexao:
        cursor = conexao.execute("UPDATE treinos SET concluido = ? WHERE id = ? AND perfil_id = ?",
                                 (int(concluido), treino_id, perfil_id))
        if not cursor.rowcount:
            return None
        return dict(conexao.execute("SELECT * FROM treinos WHERE id = ?", (treino_id,)).fetchone())

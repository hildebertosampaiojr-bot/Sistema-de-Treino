import json
from backend.banco_de_dados.conexao import conectar


def serializar(linha):
    dados = dict(linha)
    dados["exercicios"] = json.loads(dados["exercicios"])
    return dados


def listar(perfil_id):
    with conectar() as banco:
        return [serializar(linha) for linha in banco.execute(
            "SELECT * FROM resultados WHERE perfil_id = ? ORDER BY data, id", (perfil_id,))]


def salvar(perfil_id, treino_id, data, exercicios):
    with conectar() as banco:
        treino = banco.execute("SELECT * FROM treinos WHERE id = ? AND perfil_id = ?", (treino_id, perfil_id)).fetchone()
        if not treino:
            return None
        banco.execute("""INSERT INTO resultados(perfil_id, treino_id, data, nome, dia_semana, exercicios)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(perfil_id, treino_id, data) DO UPDATE SET
            exercicios = excluded.exercicios, salvo_em = CURRENT_TIMESTAMP""",
            (perfil_id, treino_id, data, treino["nome"], treino["dia_semana"], json.dumps(exercicios, ensure_ascii=False)))
        return serializar(banco.execute(
            "SELECT * FROM resultados WHERE perfil_id = ? AND treino_id = ? AND data = ?",
            (perfil_id, treino_id, data)).fetchone())

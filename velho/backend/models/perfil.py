from backend.banco_de_dados.conexao import conectar


def listar():
    with conectar() as conexao:
        return [dict(linha) for linha in conexao.execute("SELECT id, nome FROM perfis ORDER BY id")]


def buscar(perfil_id):
    with conectar() as conexao:
        linha = conexao.execute("SELECT id, nome FROM perfis WHERE id = ?", (perfil_id,)).fetchone()
        return dict(linha) if linha else None

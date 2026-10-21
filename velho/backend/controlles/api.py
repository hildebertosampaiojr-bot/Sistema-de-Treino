from backend.models import perfil, treino
from backend.regras.treino import validar_cadastro, validar_perfil
from backend.models import resultado
from backend.regras.resultado import validar as validar_resultado


def listar_resultados(perfil_id):
    return resultado.listar(validar_perfil(perfil_id))


def salvar_resultado(dados):
    return resultado.salvar(*validar_resultado(dados))


def perfis():
    return perfil.listar()


def listar_treinos(perfil_id):
    return treino.listar(validar_perfil(perfil_id))


def criar_treino(dados):
    return treino.criar(*validar_cadastro(dados))


def concluir_treino(treino_id, dados):
    perfil_id = validar_perfil(dados.get("perfil_id"))
    if type(dados.get("concluido")) is not bool:
        raise ValueError("Informe se o treino foi concluído.")
    return treino.atualizar(treino_id, perfil_id, dados["concluido"])

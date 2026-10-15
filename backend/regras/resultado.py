import math
from datetime import date
from backend.regras.treino import validar_perfil


def validar(dados):
    perfil_id = validar_perfil(dados.get("perfil_id"))
    treino_id = dados.get("treino_id")
    if type(treino_id) is not int or treino_id < 1:
        raise ValueError("Treino inválido.")
    data = dados.get("data")
    try:
        if not isinstance(data, str) or date.fromisoformat(data).isoformat() != data:
            raise ValueError()
    except (ValueError, TypeError):
        raise ValueError("Data inválida.") from None
    exercicios = dados.get("exercicios")
    if not isinstance(exercicios, list) or not 1 <= len(exercicios) <= 100:
        raise ValueError("Informe os exercícios do treino.")
    nomes = set()
    for exercicio in exercicios:
        if not isinstance(exercicio, dict):
            raise ValueError("Exercício inválido.")
        nome = exercicio.get("nome")
        if not isinstance(nome, str) or not 1 <= len(nome.strip()) <= 150 or nome in nomes:
            raise ValueError("Nome de exercício inválido ou repetido.")
        nomes.add(nome)
        if type(exercicio.get("feito")) is not bool:
            raise ValueError("Informe os exercícios realizados.")
        carga = exercicio.get("carga")
        if carga is not None and (type(carga) not in (int, float) or not math.isfinite(carga) or not 0 <= carga <= 10000):
            raise ValueError("Informe uma carga válida em kg.")
    return perfil_id, treino_id, data, exercicios

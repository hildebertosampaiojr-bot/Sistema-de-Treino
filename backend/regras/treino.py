from backend.models import perfil


def validar_perfil(perfil_id):
    if type(perfil_id) is not int or not perfil.buscar(perfil_id):
        raise ValueError("Selecione um perfil válido.")
    return perfil_id


def validar_cadastro(dados):
    perfil_id = validar_perfil(dados.get("perfil_id"))
    nome, descricao = dados.get("nome", ""), dados.get("descricao", "")
    if not isinstance(nome, str) or not 1 <= len(nome.strip()) <= 80:
        raise ValueError("O nome do treino deve ter entre 1 e 80 caracteres.")
    if not isinstance(descricao, str) or len(descricao) > 2000:
        raise ValueError("A descrição deve ter até 2.000 caracteres.")
    dia_semana = dados.get("dia_semana")
    if dia_semana is not None and (type(dia_semana) is not int or not 1 <= dia_semana <= 7):
        raise ValueError("Escolha um dia da semana válido, de segunda a domingo.")
    return perfil_id, nome.strip(), descricao.strip(), dia_semana

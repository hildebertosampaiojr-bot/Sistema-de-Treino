// Mantém compatibilidade com os planos já salvos no banco e na prévia.
export function separarDescricao(descricao = "") {
  const exercicios = [];
  const observacoes = [];
  const introducao = [];
  for (const linha of descricao.split("\n").map(texto => texto.trim()).filter(Boolean)) {
    const serie = linha.match(/^(.+?) — (\d+) séries? · (.+?)(?: · descanso: (.+))?$/u);
    const atividade = linha.match(/^(.+?) — (\d[\d–\-\s]*(?:s|min))$/u);
    if (serie) {
      exercicios.push({ nome: serie[1], series: serie[2], repeticoes: serie[3].replace(/ repetições/u, ""), descanso: serie[4] || "—" });
    } else if (atividade) {
      exercicios.push({ nome: atividade[1], series: "—", repeticoes: atividade[2], descanso: "—" });
    } else if (exercicios.length) {
      observacoes.push(linha);
    } else {
      introducao.push(linha);
    }
  }
  return { exercicios, introducao, observacoes };
}

export function criarDetalhesTreino(treino) {
  const detalhes = document.createElement("div");
  detalhes.className = "workout-details";
  const { exercicios, introducao, observacoes } = separarDescricao(treino.descricao);
  function adicionarTexto(textos, classe) {
    for (const texto of textos) {
      const paragrafo = document.createElement("p");
      paragrafo.className = classe;
      paragrafo.textContent = texto;
      detalhes.append(paragrafo);
    }
  }
  adicionarTexto(introducao, "workout-intro");
  if (exercicios.length) {
    const container = document.createElement("div");
    container.className = "exercise-table-container";
    container.tabIndex = 0;
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", `Exercícios de ${treino.nome}`);
    const tabela = document.createElement("table");
    tabela.className = "exercise-table";
    const caption = document.createElement("caption");
    caption.className = "visually-hidden";
    caption.textContent = `Ficha de treino: ${treino.nome}`;
    const cabecalho = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");
    const repeticoes = treino.dia_semana >= 6 ? "Repetições / tempo" : "Repetições";
    for (const titulo of ["Exercício", "Séries", repeticoes, "Carga", "Descanso"]) {
      const coluna = document.createElement("th");
      coluna.scope = "col";
      coluna.textContent = titulo;
      linhaCabecalho.append(coluna);
    }
    cabecalho.append(linhaCabecalho);
    const corpo = document.createElement("tbody");
    for (const exercicio of exercicios) {
      const linha = document.createElement("tr");
      for (const valor of [exercicio.nome, exercicio.series, exercicio.repeticoes, "", exercicio.descanso]) {
        const celula = document.createElement("td");
        celula.textContent = valor;
        linha.append(celula);
      }
      corpo.append(linha);
    }
    tabela.append(caption, cabecalho, corpo);
    container.append(tabela);
    detalhes.append(container);
  }
  adicionarTexto(observacoes, "workout-guidance");
  if (!treino.descricao) adicionarTexto(["Sem observações para este treino."], "workout-intro");
  return detalhes;
}

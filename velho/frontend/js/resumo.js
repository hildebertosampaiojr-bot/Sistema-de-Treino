import { dataLocal } from "./registros.js";

function elemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}
const numero = valor => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(valor);
const dataExibida = data => new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");

export function criarResumo(resultados) {
  const dashboard = elemento("div", "evolution-dashboard");
  const metricas = elemento("div", "evolution-metrics");
  const feitos = resultados.reduce((total, registro) => total + registro.exercicios.filter(e => e.feito).length, 0);
  const planejados = resultados.reduce((total, registro) => total + registro.exercicios.length, 0);
  const dias = new Set(resultados.filter(r => r.exercicios.some(e => e.feito)).map(r => r.data)).size;
  for (const [valor, titulo] of [[resultados.length, "treinos fechados"], [feitos, "exercícios feitos"], [planejados ? `${Math.round(feitos / planejados * 100)}%` : "—", "conclusão dos exercícios"], [dias, "dias ativos"]]) {
    const card = elemento("div", "metric-card");
    card.append(elemento("strong", "", valor), elemento("span", "", titulo));
    metricas.append(card);
  }
  dashboard.append(metricas);
  const frequencia = elemento("section", "summary-panel");
  frequencia.append(elemento("h3", "", "Sua constância nos últimos 7 dias"));
  const grafico = elemento("div", "frequency-chart");
  const semana = Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date();
    dia.setDate(dia.getDate() - 6 + indice);
    const quantidade = resultados.filter(r => r.data === dataLocal(dia)).length;
    return { dia, quantidade };
  });
  const maximo = Math.max(1, ...semana.map(item => item.quantidade));
  for (const { dia, quantidade } of semana) {
    const coluna = elemento("div", "frequency-column");
    const trilho = elemento("div", "frequency-track");
    const barra = elemento("div", "frequency-bar");
    barra.style.height = `${quantidade / maximo * 100}%`;
    barra.setAttribute("aria-hidden", "true");
    trilho.append(barra);
    coluna.append(elemento("strong", "", quantidade), trilho, elemento("span", "", dia.toLocaleDateString("pt-BR", { weekday: "short" })), elemento("small", "", dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })));
    coluna.setAttribute("aria-label", `${dataExibida(dataLocal(dia))}: ${quantidade} treinos fechados`);
    grafico.append(coluna);
  }
  frequencia.append(grafico);
  dashboard.append(frequencia);

  const cargas = new Map();
  for (const registro of [...resultados].sort((a, b) => a.data.localeCompare(b.data))) {
    for (const exercicio of registro.exercicios) {
      if (!exercicio.feito || exercicio.carga == null) continue;
      if (!cargas.has(exercicio.nome)) cargas.set(exercicio.nome, []);
      cargas.get(exercicio.nome).push({ data: registro.data, carga: exercicio.carga });
    }
  }
  const evolucao = elemento("section", "summary-panel");
  evolucao.append(elemento("h3", "", "Evolução de cargas"), elemento("p", "summary-description", "Primeira e última carga dos exercícios marcados como feitos nos treinos salvos."));
  if (!cargas.size) {
    evolucao.append(elemento("p", "summary-empty", "Registre cargas e feche seu primeiro treino para acompanhar a evolução."));
  } else {
    const linhas = [...cargas].map(([nome, registros]) => {
      const primeiro = registros[0].carga;
      const ultimo = registros.at(-1).carga;
      const diferenca = ultimo - primeiro;
      return [nome, `${numero(primeiro)} kg`, `${numero(ultimo)} kg`, registros.length < 2 ? "Primeiro registro" : `${diferenca > 0 ? "+" : ""}${numero(diferenca)} kg`];
    });
    evolucao.append(criarTabela(["Exercício", "Primeira carga", "Última carga", "Variação"], linhas));
  }
  dashboard.append(evolucao);
  const historico = elemento("section", "summary-panel");
  historico.append(elemento("h3", "", "Histórico de treinos"));
  if (!resultados.length) {
    historico.append(elemento("p", "summary-empty", "Seu histórico começa quando você fechar um treino. Selecione um dia da semana para começar."));
  } else {
    historico.append(criarTabela(["Data", "Treino", "Exercícios feitos"], [...resultados].sort((a, b) => b.data.localeCompare(a.data)).map(r => [dataExibida(r.data), r.nome, `${r.exercicios.filter(e => e.feito).length}/${r.exercicios.length}`])));
  }
  dashboard.append(historico);
  return dashboard;
}

function criarTabela(titulos, linhas) {
  const container = elemento("div", "summary-table-container");
  container.tabIndex = 0;
  const tabela = elemento("table", "summary-table");
  const thead = elemento("thead");
  const cabecalho = elemento("tr");
  for (const titulo of titulos) {
    const th = elemento("th", "", titulo);
    th.scope = "col";
    cabecalho.append(th);
  }
  thead.append(cabecalho);
  const tbody = elemento("tbody");
  for (const valores of linhas) {
    const tr = elemento("tr");
    valores.forEach((valor, indice) => {
      const td = elemento("td", "", valor);
      td.setAttribute("data-label", titulos[indice]);
      tr.append(td);
    });
    tbody.append(tr);
  }
  tabela.append(thead, tbody);
  container.append(tabela);
  return container;
}

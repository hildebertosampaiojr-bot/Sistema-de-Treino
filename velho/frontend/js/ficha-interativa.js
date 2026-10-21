import { separarDescricao } from "./tabela-treino.js";
import { criarOrientacoes } from "./orientacoes.js";

export function criarFicha(treino, estado, opcoes) {
  const { exercicios, introducao, observacoes } = separarDescricao(treino.descricao);
  const ficha = document.createElement("form");
  ficha.className = "workout-card interactive-workout";
  const cabecalho = document.createElement("div");
  cabecalho.className = "workout-heading";
  const nome = document.createElement("h3");
  nome.textContent = treino.nome;
  const progresso = document.createElement("span");
  progresso.className = "workout-progress";
  cabecalho.append(nome, progresso);
  ficha.append(cabecalho);
  for (const texto of introducao) {
    const p = document.createElement("p");
    p.textContent = texto;
    ficha.append(p);
  }

  const container = document.createElement("div");
  container.className = "exercise-table-container interactive-table-container";
  container.tabIndex = 0;
  container.setAttribute("role", "region");
  container.setAttribute("aria-label", `Exercícios de ${treino.nome}`);
  const tabela = document.createElement("table");
  tabela.className = "exercise-table interactive-table";
  const caption = document.createElement("caption");
  caption.className = "visually-hidden";
  caption.textContent = `Ficha de treino: ${treino.nome}`;
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  for (const texto of ["Feito", "Exercício", "Séries", treino.dia_semana >= 6 ? "Repetições / tempo" : "Repetições", "Carga (kg)", "Descanso"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = texto;
    tr.append(th);
  }
  thead.append(tr);
  const tbody = document.createElement("tbody");
  const campos = [];
  const mensagem = document.createElement("p");
  mensagem.className = "save-message";
  mensagem.setAttribute("role", "status");

  function atualizarProgresso() {
    progresso.textContent = `${estado.filter(item => item.feito).length}/${exercicios.length} exercícios feitos`;
  }
  exercicios.forEach((exercicio, indice) => {
    const linha = document.createElement("tr");
    const feito = document.createElement("input");
    feito.type = "checkbox";
    feito.className = "exercise-check";
    feito.checked = estado[indice].feito;
    feito.setAttribute("aria-label", `Marcar ${exercicio.nome} como feito`);
    const carga = document.createElement("input");
    carga.type = "number";
    carga.className = "load-input";
    carga.min = "0";
    carga.max = "10000";
    carga.step = "0.01";
    carga.inputMode = "decimal";
    carga.placeholder = "—";
    carga.value = estado[indice].carga ?? "";
    carga.setAttribute("aria-label", `Carga em kg para ${exercicio.nome}`);
    campos.push(feito, carga);
    function atualizar() {
      estado[indice] = { nome: exercicio.nome, feito: feito.checked, carga: carga.value };
      linha.classList.toggle("exercise-done", feito.checked);
      atualizarProgresso();
      try {
        opcoes.aoAlterar(estado);
        mensagem.textContent = "Alterações pendentes. Feche o treino para salvar os resultados.";
      } catch {
        mensagem.textContent = "Não foi possível guardar o rascunho neste navegador. Mantenha a página aberta e tente fechar o treino.";
      }
    }
    feito.addEventListener("change", atualizar);
    carga.addEventListener("input", atualizar);
    linha.classList.toggle("exercise-done", feito.checked);
    const valores = [feito, exercicio.nome, exercicio.series, exercicio.repeticoes, carga, exercicio.descanso];
    const rotulos = ["Feito", "Exercício", "Séries", treino.dia_semana >= 6 ? "Repetições / tempo" : "Repetições", "Carga (kg)", "Descanso"];
    for (const [indice, valor] of valores.entries()) {
      const td = document.createElement("td");
      td.setAttribute("data-label", rotulos[indice]);
      if (typeof valor === "string") td.textContent = valor;
      else td.append(valor);
      linha.append(td);
    }
    tbody.append(linha);
  });
  tabela.append(caption, thead, tbody);
  container.append(tabela);
  ficha.append(container);
  for (const texto of observacoes) {
    const p = document.createElement("p");
    p.className = "workout-guidance";
    p.textContent = texto;
    ficha.append(p);
  }
  ficha.append(criarOrientacoes());
  const rodape = document.createElement("div");
  rodape.className = "workout-footer";
  const nota = document.createElement("span");
  nota.textContent = opcoes.local ? "Os resultados ficam salvos neste navegador." : "Os resultados ficam salvos no seu perfil.";
  const fechar = document.createElement("button");
  fechar.type = "submit";
  fechar.className = "close-workout";
  fechar.textContent = "Fechar treino do dia ✓";
  fechar.disabled = !exercicios.length;
  rodape.append(nota, fechar);
  ficha.append(rodape, mensagem);
  atualizarProgresso();
  if (opcoes.salvo) mensagem.textContent = "Treino de hoje salvo. Você pode ajustar os resultados e fechar novamente.";
  ficha.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (!ficha.reportValidity()) return;
    fechar.disabled = true;
    campos.forEach(campo => { campo.disabled = true; });
    fechar.textContent = "Salvando…";
    try {
      const resultados = estado.map(item => ({ nome: item.nome, feito: item.feito, carga: item.carga === "" || item.carga == null ? null : Number(item.carga) }));
      await opcoes.aoFechar(resultados);
      mensagem.textContent = opcoes.local ? "Treino fechado! Resultados salvos neste navegador." : "Treino fechado! Resultados salvos no seu perfil.";
    } catch {
      mensagem.textContent = "Não foi possível salvar. Seus dados continuam aqui; tente fechar o treino novamente.";
    } finally {
      fechar.disabled = false;
      campos.forEach(campo => { campo.disabled = false; });
      fechar.textContent = "Fechar treino do dia ✓";
    }
  });
  return ficha;
}

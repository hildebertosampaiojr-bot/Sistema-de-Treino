import { requisitar } from "./api.js";
import { separarDescricao } from "./tabela-treino.js";
import { criarFicha } from "./ficha-interativa.js";
import { criarResumo } from "./resumo.js";
import { nomePerfil } from "./preferencias.js";
import { dataLocal, lerLocal, gravarLocal, chaveResultado, atualizarResultado } from "./registros.js";

const perfilId = Number(new URLSearchParams(location.search).get("perfil"));
const lista = document.querySelector("#workouts");
const diasSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const chaveHistorico = `ritmo:perfil:${perfilId}:resultados:v1`;
let diaSelecionado = "resumo";
let treinosCarregados = [];
let resultados = [];
let modoLocal = false;
let rascunhos = {};
let chaveRascunhos = "";

function mostrar() {
  lista.replaceChildren();
  document.querySelector("#workouts-title").textContent = diaSelecionado === "resumo" ? "Sua evolução" : `Treinos · ${diasSemana[Number(diaSelecionado) - 1]}`;
  if (diaSelecionado === "resumo") {
    lista.append(criarResumo(resultados));
    return;
  }
  const treinosDoDia = treinosCarregados.filter(treino => treino.dia_semana === Number(diaSelecionado));
  if (!treinosDoDia.length) {
    const vazio = document.createElement("div");
    vazio.className = "empty-state";
    const titulo = document.createElement("h3");
    titulo.textContent = "Nenhum treino para este dia.";
    const texto = document.createElement("p");
    texto.textContent = "Aproveite seu dia de descanso.";
    vazio.append(titulo, texto);
    lista.append(vazio);
  }
  for (const treino of treinosDoDia) {
    const hoje = dataLocal();
    const chave = `${hoje}:${treino.id}`;
    const salvo = resultados.find(item => chaveResultado(item) === chave);
    const anterior = resultados.filter(item => item.treino_id === treino.id).at(-1);
    const base = Array.isArray(rascunhos[chave]) ? rascunhos[chave] : salvo?.exercicios;
    const estado = separarDescricao(treino.descricao).exercicios.map(exercicio => {
      const atual = base?.find(item => item.nome === exercicio.nome);
      const ultimaCarga = anterior?.exercicios.find(item => item.nome === exercicio.nome)?.carga;
      return { nome: exercicio.nome, feito: atual?.feito ?? false, carga: atual ? (atual.carga ?? "") : (ultimaCarga ?? "") };
    });
    lista.append(criarFicha(treino, estado, {
      local: modoLocal,
      salvo: Boolean(salvo),
      aoAlterar(exercicios) {
        rascunhos[chave] = exercicios;
        gravarLocal(chaveRascunhos, rascunhos);
      },
      async aoFechar(exercicios) {
        const dados = { perfil_id: perfilId, treino_id: treino.id, data: hoje, nome: treino.nome, dia_semana: treino.dia_semana, exercicios };
        if (modoLocal) {
          const novos = atualizarResultado(resultados, dados);
          gravarLocal(chaveHistorico, novos);
          resultados = novos;
        } else {
          const resultado = await requisitar("/api/resultados", { method: "POST", body: JSON.stringify(dados) });
          resultados = atualizarResultado(resultados, resultado);
        }
        delete rascunhos[chave];
        // Uma falha ao limpar o rascunho não desfaz o resultado já salvo.
        try { gravarLocal(chaveRascunhos, rascunhos); } catch { /* O resultado permanece salvo. */ }
      },
    }));
  }
}

document.querySelectorAll(".day-button").forEach(botao => {
  botao.addEventListener("click", () => {
    diaSelecionado = botao.dataset.day;
    document.querySelectorAll(".day-button").forEach(item => item.setAttribute("aria-pressed", String(item.dataset.day === diaSelecionado)));
    mostrar();
  });
});

async function carregar() {
  lista.setAttribute("aria-busy", "true");
  try {
    let perfil;
    try {
      const perfis = await requisitar("/api/perfis");
      perfil = perfis.find(item => item.id === perfilId);
      if (!perfil) { location.replace("../index.html"); return; }
      treinosCarregados = await requisitar(`/api/treinos?perfil_id=${perfilId}`);
      resultados = await requisitar(`/api/resultados?perfil_id=${perfilId}`);
      modoLocal = false;
    } catch {
      const resposta = await fetch(new URL("../dados/planos.json", import.meta.url));
      if (!resposta.ok) throw new Error("Plano indisponível.");
      const planos = await resposta.json();
      perfil = planos.perfis.find(item => item.id === perfilId);
      if (!perfil) { location.replace("../index.html"); return; }
      treinosCarregados = perfil.treinos;
      const historico = lerLocal(chaveHistorico, []);
      resultados = Array.isArray(historico) ? historico : [];
      modoLocal = true;
    }
    chaveRascunhos = `ritmo:perfil:${perfilId}:${modoLocal ? "local" : "banco"}:rascunhos:v1`;
    const armazenado = lerLocal(chaveRascunhos, {});
    rascunhos = armazenado && typeof armazenado === "object" && !Array.isArray(armazenado) ? armazenado : {};
    const nome = nomePerfil(perfilId, perfil.nome);
    document.title = `${nome} · Meus treinos · AOLDEYA FITNESS`;
    document.querySelector("#profile-label").textContent = `PERFIL ${nome.toLocaleUpperCase("pt-BR")}`;
    document.querySelector("#storage-note").textContent = modoLocal ? "Os resultados e a evolução são salvos neste navegador." : "Os resultados e a evolução são salvos no seu perfil.";
    mostrar();
  } catch {
    const aviso = document.createElement("p");
    aviso.className = "message";
    aviso.textContent = "Não foi possível carregar seus treinos. Tente atualizar novamente.";
    lista.replaceChildren(aviso);
  } finally { lista.setAttribute("aria-busy", "false"); }
}

document.querySelector("#refresh").addEventListener("click", carregar);
carregar();

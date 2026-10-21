import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { criarResumo } from "../frontend/js/resumo.js";
import { dataLocal, atualizarResultado } from "../frontend/js/registros.js";

// Verifica o fluxo real dos módulos em um DOM mínimo, sem depender de navegador.
class Elemento {
  constructor(tag = "div") {
    this.tag = tag;
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.textContent = "";
    this.classList = { toggle() {} };
  }
  append(...filhos) { this.children.push(...filhos); }
  replaceChildren(...filhos) { this.children = filhos; this.aoRenderizar?.(); }
  setAttribute(chave, valor) { this.attributes[chave] = valor; }
  addEventListener(evento, callback) { this.listeners[evento] = callback; }
  reportValidity() { return true; }
}

const plano = JSON.parse(await readFile(new URL("../frontend/dados/planos.json", import.meta.url), "utf8"));
const armazenamento = new Map();
globalThis.localStorage = {
  getItem: chave => armazenamento.get(chave) ?? null,
  setItem: (chave, valor) => armazenamento.set(chave, valor),
};
let versao = 0;
let resultadosAPI = [];
const modo = { online: false, falhar: false };

async function abrir(perfilId, online = false, falharSalvamento = false) {
  modo.online = online;
  modo.falhar = falharSalvamento;
  const elementos = new Map();
  const lista = new Elemento();
  elementos.set("#workouts", lista);
  const botoes = ["resumo", "1", "2", "3", "4", "5", "6", "7"].map(day => Object.assign(new Elemento("button"), { dataset: { day } }));
  const pronto = new Promise(resolve => { lista.aoRenderizar = resolve; });
  globalThis.document = {
    querySelector(chave) {
      if (!elementos.has(chave)) elementos.set(chave, new Elemento());
      return elementos.get(chave);
    },
    querySelectorAll: () => botoes,
    createElement: tag => new Elemento(tag),
  };
  globalThis.location = { search: `?perfil=${perfilId}`, replace() { throw new Error("Redirecionamento inesperado"); } };
  globalThis.fetch = async (caminho, opcoes = {}) => {
    const url = String(caminho);
    if (url.includes("planos.json")) return { ok: true, json: async () => plano };
    if (!modo.online) return { ok: true, headers: { get: () => "text/html" } };
    let dados;
    if (url.includes("/api/perfis")) dados = plano.perfis;
    else if (url.includes("/api/treinos")) dados = plano.perfis.find(p => p.id === perfilId).treinos;
    else if (opcoes.method === "POST") {
      if (modo.falhar) throw new Error("Falha simulada");
      dados = JSON.parse(opcoes.body);
      resultadosAPI = atualizarResultado(resultadosAPI, dados);
    } else dados = resultadosAPI.filter(r => r.perfil_id === perfilId);
    return { ok: true, headers: { get: () => "application/json" }, json: async () => dados };
  };
  await import(new URL(`../frontend/js/treinos.js?teste=${++versao}`, import.meta.url));
  await Promise.race([pronto, new Promise((_, rejeitar) => setTimeout(() => rejeitar(new Error(`Render timeout versao ${versao}: ${[...elementos.keys()]}`)), 2000))]);
  return { lista, botoes, elementos };
}

function buscar(el, predicado) {
  return [...(predicado(el) ? [el] : []), ...el.children.flatMap(filho => buscar(filho, predicado))];
}
function formulario(app) { return app.lista.children[0]; }
function campos(app) { return buscar(formulario(app), el => el.tag === "input"); }
function marcar(app, carga) {
  const [check, input] = campos(app);
  check.checked = true;
  check.listeners.change();
  input.value = carga;
  input.listeners.input();
}
async function fechar(app) { await formulario(app).listeners.submit({ preventDefault() {} }); }
function metrica(app, indice) { return app.lista.children[0].children[0].children[indice].children[0].textContent; }

async function recarregar(app, online = false, falhar = false) {
  modo.online = online;
  modo.falhar = falhar;
  await app.elementos.get("#refresh").listeners.click();
  app.botoes[0].listeners.click();
  return app;
}

let app = await abrir(1);
assert.equal(metrica(app, 0), 0);
app.botoes[1].listeners.click();
marcar(app, "35.5");
app.botoes[2].listeners.click();
app.botoes[1].listeners.click();
assert.equal(campos(app)[0].checked, true, "Rascunho deve manter o exercício feito");
assert.equal(campos(app)[1].value, "35.5", "Rascunho deve manter a carga");
await fechar(app);
await fechar(app);
app.botoes[0].listeners.click();
assert.equal(metrica(app, 0), 1, "Salvar novamente não duplica o treino do dia");
assert.equal(metrica(app, 1), 1);
const registro = JSON.parse(armazenamento.get("ritmo:perfil:1:resultados:v1"))[0];
assert.equal(registro.data, dataLocal());
assert.equal(registro.exercicios[0].carga, 35.5);
app = await recarregar(app);
assert.equal(metrica(app, 0), 1, "Histórico deve sobreviver à reabertura");
app.botoes[1].listeners.click();
assert.equal(campos(app)[0].checked, true);
assert.equal(campos(app)[1].value, 35.5);
assert.equal(armazenamento.get("ritmo:perfil:2:resultados:v1"), undefined, "Histórico local deve estar separado por perfil");
app = await recarregar(app, true);
assert.equal(metrica(app, 0), 0, "Modo de banco usa apenas o histórico do banco");
app.botoes[1].listeners.click();
marcar(app, "40");
await fechar(app);
app.botoes[0].listeners.click();
assert.equal(metrica(app, 0), 1);
assert.equal(resultadosAPI[0].exercicios[0].carga, 40);
app = await recarregar(app, true, true);
app.botoes[1].listeners.click();
marcar(app, "45");
await fechar(app);
assert.match(formulario(app).children.at(-1).textContent, /Não foi possível salvar/);
assert.equal(campos(app)[1].value, "45", "Falha de salvamento deve preservar o formulário");
assert.equal(resultadosAPI[0].exercicios[0].carga, 40);
const evolucao = criarResumo([
  { data: "2026-10-08", nome: "Peito", exercicios: [{ nome: "Supino", feito: true, carga: 20 }] },
  { data: "2026-10-15", nome: "Peito", exercicios: [{ nome: "Supino", feito: true, carga: 25 }] },
]);
assert.ok(buscar(evolucao, el => el.tag === "td").some(el => el.textContent === "+5 kg"), "Resumo deve comparar as cargas entre datas");
console.log("Frontend: marcação, cargas, rascunhos, fechamento, histórico, resumo e isolamento verificados.");

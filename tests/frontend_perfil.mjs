import assert from "node:assert/strict";
import { lerPreferencias } from "../frontend/js/preferencias.js";

class Elemento {
  constructor() {
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.dataset = {};
    this.textContent = "";
    this.value = "";
    this.hidden = true;
  }
  append(el) { this.children.push(el); }
  replaceChildren(...els) { this.children = els; this.textContent = ""; }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(k, fn) { this.listeners[k] = fn; }
  focus() { this.focused = true; }
  contains(el) { return el === this || this.children.some(child => child.contains?.(el)); }
  showModal() { this.open = true; }
  close() { this.open = false; this.listeners.close?.(); }
}

const armazenamento = new Map();
globalThis.localStorage = { getItem: k => armazenamento.get(k) ?? null, setItem: (k, v) => armazenamento.set(k, v) };
const elementos = new Map();
const temas = ["claro", "escuro"].map(tema => Object.assign(new Elemento(), { dataset: { themeChoice: tema } }));
const cores = ["azul", "vermelho", "laranja", "verde", "amarelo"].map(cor => Object.assign(new Elemento(), { dataset: { paletteChoice: cor } }));
const eventos = {};
const root = { dataset: {} };
globalThis.document = {
  documentElement: root,
  querySelector(k) { if (!elementos.has(k)) elementos.set(k, new Elemento()); return elementos.get(k); },
  querySelectorAll(k) { return k === "[data-theme-choice]" ? temas : cores; },
  createElement(tag) {
    const el = new Elemento();
    if (tag === "canvas") {
      el.getContext = () => ({ drawImage(...argumentos) { el.crop = argumentos; } });
      el.toDataURL = () => "data:image/jpeg;base64,cHJldmlh";
    }
    return el;
  },
  addEventListener(k, fn) { eventos[k] = fn; },
};
globalThis.location = { search: "?perfil=1" };
const form = document.querySelector("#edit-profile-form");
form.elements = { nome: new Elemento(), foto: Object.assign(new Elemento(), { files: [] }) };
globalThis.FileReader = class {
  readAsDataURL() { this.result = "data:image/png;base64,Zm90bw=="; this.onload(); }
};
globalThis.Image = class {
  naturalWidth = 500;
  naturalHeight = 300;
  async decode() {}
};

await import("../frontend/js/menu-perfil.js");
const el = id => document.querySelector(id);
assert.equal(el("#profile-trigger").textContent, "J");
el("#profile-trigger").listeners.click();
assert.equal(el("#profile-menu").hidden, false);
el("#edit-profile").listeners.click();
assert.equal(el("#profile-dialog").open, true);
assert.equal(el("#profile-menu").hidden, true);
form.elements.nome.value = "João";
form.elements.nome.listeners.input();
form.elements.foto.files = [{ type: "image/png", size: 1000 }];
await form.elements.foto.listeners.change();
assert.equal(el("#edit-avatar").children.length, 1);
assert.equal(lerPreferencias(1).foto, "", "Foto deve ser salva somente ao confirmar");
form.listeners.submit({ preventDefault() {} });
assert.equal(lerPreferencias(1).nome, "João");
assert.match(lerPreferencias(1).foto, /^data:image\/jpeg;base64,/);
assert.equal(el("#profile-dialog").open, false);
assert.equal(el("#profile-trigger").children.length, 1);
for (const cor of cores) {
  cor.listeners.click();
  assert.equal(root.dataset.palette, cor.dataset.paletteChoice);
  assert.equal(root.dataset.theme, cor.dataset.paletteChoice === "verde" ? "claro" : "escuro");
  assert.equal(cor.attributes["aria-pressed"], "true");
}
cores[0].listeners.click();
temas[0].listeners.click();
assert.equal(root.dataset.palette, "azul");
assert.equal(root.dataset.theme, "claro");
assert.equal(lerPreferencias(1).tema, "claro");
el("#edit-profile").listeners.click();
form.elements.nome.value = "Não salvar";
el("#remove-photo").listeners.click();
el("#cancel-profile").listeners.click();
assert.equal(lerPreferencias(1).nome, "João");
assert.ok(lerPreferencias(1).foto, "Cancelar não deve remover a foto salva");
el("#profile-trigger").listeners.click();
eventos.keydown({ key: "Escape" });
assert.equal(el("#profile-menu").hidden, true);
assert.equal(el("#profile-trigger").focused, true);
el("#profile-trigger").listeners.click();
eventos.click({ target: new Elemento() });
assert.equal(el("#profile-menu").hidden, true);
el("#edit-profile").listeners.click();
form.elements.foto.files = [{ type: "text/plain", size: 100 }];
await form.elements.foto.listeners.change();
assert.match(el("#profile-error").textContent, /JPG/);
el("#remove-photo").listeners.click();
form.listeners.submit({ preventDefault() {} });
assert.equal(lerPreferencias(1).foto, "");
assert.equal(el("#profile-trigger").textContent, "J");
assert.equal(lerPreferencias(2).nome, "");
assert.equal(lerPreferencias(2).paleta, "verde");
localStorage.setItem = () => { throw new Error("Quota"); };
temas[1].listeners.click();
assert.equal(root.dataset.theme, "claro", "Falha ao salvar deve preservar a preferência anterior");
assert.match(el("#menu-status").textContent, /Não foi possível/);
console.log("Perfil: menu, foto, edição, cancelamento, temas, cinco paletas e persistência verificados.");

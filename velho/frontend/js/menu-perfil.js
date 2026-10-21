import { paletas, lerPreferencias, salvarPreferencias, aplicarAparencia } from "./preferencias.js";

const perfilId = Number(new URLSearchParams(location.search).get("perfil"));
const nomeOriginal = perfilId === 2 ? "Gabriella" : "Junior";
let preferencias = lerPreferencias(perfilId);
const controle = document.querySelector("#profile-control");
const gatilho = document.querySelector("#profile-trigger");
const menu = document.querySelector("#profile-menu");
const dialogo = document.querySelector("#profile-dialog");
const form = document.querySelector("#edit-profile-form");
const erro = document.querySelector("#profile-error");
let fotoEditada = preferencias.foto;
let fotoCarregando = false;
let versaoFoto = 0;

function desenharAvatar(container, foto, nome) {
  container.replaceChildren();
  if (foto) {
    const img = document.createElement("img");
    img.src = foto;
    img.alt = "";
    container.append(img);
  } else container.textContent = nome.charAt(0).toLocaleUpperCase("pt-BR");
}

function atualizar() {
  const nome = preferencias.nome || nomeOriginal;
  aplicarAparencia(preferencias);
  desenharAvatar(gatilho, preferencias.foto, nome);
  gatilho.setAttribute("aria-label", `Abrir menu de ${nome}`);
  document.querySelector("#menu-profile-name").textContent = nome;
  document.querySelectorAll("[data-theme-choice]").forEach(botao => botao.setAttribute("aria-pressed", String(botao.dataset.themeChoice === preferencias.tema)));
  document.querySelectorAll("[data-palette-choice]").forEach(botao => botao.setAttribute("aria-pressed", String(botao.dataset.paletteChoice === preferencias.paleta)));
  document.querySelector("#profile-label").textContent = `PERFIL ${nome.toLocaleUpperCase("pt-BR")}`;
  document.title = `${nome} · Meus treinos · AOLDEYA FITNESS`;
}

function salvar(proximas) {
  try {
    salvarPreferencias(perfilId, proximas);
    preferencias = proximas;
    atualizar();
    document.querySelector("#menu-status").textContent = "";
    return true;
  } catch {
    document.querySelector("#menu-status").textContent = "Não foi possível salvar a preferência neste navegador.";
    return false;
  }
}

function fecharMenu(devolverFoco = false) {
  menu.hidden = true;
  gatilho.setAttribute("aria-expanded", "false");
  if (devolverFoco) gatilho.focus();
}
gatilho.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
  gatilho.setAttribute("aria-expanded", String(!menu.hidden));
});
document.addEventListener("click", evento => { if (!controle.contains(evento.target)) fecharMenu(); });
document.addEventListener("keydown", evento => {
  if (evento.key === "Escape" && !menu.hidden) fecharMenu(true);
});

document.querySelector("#edit-profile").addEventListener("click", () => {
  fecharMenu();
  form.elements.nome.value = preferencias.nome || nomeOriginal;
  form.elements.foto.value = "";
  fotoEditada = preferencias.foto;
  erro.textContent = "";
  desenharAvatar(document.querySelector("#edit-avatar"), fotoEditada, form.elements.nome.value);
  dialogo.showModal();
});
document.querySelector("#cancel-profile").addEventListener("click", () => dialogo.close());
dialogo.addEventListener("close", () => { versaoFoto++; fotoCarregando = false; gatilho.focus(); });
document.querySelector("#remove-photo").addEventListener("click", () => {
  versaoFoto++;
  fotoCarregando = false;
  fotoEditada = "";
  form.elements.foto.value = "";
  desenharAvatar(document.querySelector("#edit-avatar"), "", form.elements.nome.value || nomeOriginal);
});
form.elements.nome.addEventListener("input", () => {
  desenharAvatar(document.querySelector("#edit-avatar"), fotoEditada, form.elements.nome.value.trim() || nomeOriginal);
});

form.elements.foto.addEventListener("change", async () => {
  const arquivo = form.elements.foto.files[0];
  if (!arquivo) return;
  const versao = ++versaoFoto;
  fotoCarregando = false;
  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
    erro.textContent = "Escolha uma imagem JPG, PNG ou WebP de até 5 MB.";
    return;
  }
  fotoCarregando = true;
  erro.textContent = "Preparando foto…";
  try {
    const dados = await new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
    const imagem = new Image();
    imagem.src = dados;
    await imagem.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
    canvas.getContext("2d").drawImage(imagem, (imagem.naturalWidth - lado) / 2, (imagem.naturalHeight - lado) / 2, lado, lado, 0, 0, 256, 256);
    if (versao !== versaoFoto) return;
    fotoEditada = canvas.toDataURL("image/jpeg", 0.85);
    desenharAvatar(document.querySelector("#edit-avatar"), fotoEditada, form.elements.nome.value.trim() || nomeOriginal);
    erro.textContent = "";
  } catch {
    if (versao === versaoFoto) erro.textContent = "Não foi possível abrir esta imagem. Escolha outra foto.";
  } finally { if (versao === versaoFoto) fotoCarregando = false; }
});

form.addEventListener("submit", evento => {
  evento.preventDefault();
  if (fotoCarregando) { erro.textContent = "Aguarde a foto terminar de carregar."; return; }
  const nome = form.elements.nome.value.trim();
  if (!nome) { erro.textContent = "Informe seu nome."; return; }
  if (salvar({ ...preferencias, nome, foto: fotoEditada })) dialogo.close();
  else erro.textContent = "Não foi possível salvar. Tente uma foto menor ou libere espaço no navegador.";
});

document.querySelectorAll("[data-theme-choice]").forEach(botao => botao.addEventListener("click", () => salvar({ ...preferencias, tema: botao.dataset.themeChoice })));
document.querySelectorAll("[data-palette-choice]").forEach(botao => botao.addEventListener("click", () => {
  const paleta = paletas.find(item => item.id === botao.dataset.paletteChoice);
  salvar({ ...preferencias, paleta: paleta.id, tema: paleta.tema });
}));
atualizar();

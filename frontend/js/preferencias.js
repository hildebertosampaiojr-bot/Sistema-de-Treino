export const paletas = [
  { id: "azul", nome: "Azul e fundo escuro", tema: "escuro" },
  { id: "vermelho", nome: "Vermelho e preto", tema: "escuro" },
  { id: "laranja", nome: "Preto e laranja", tema: "escuro" },
  { id: "verde", nome: "Verde e branco", tema: "claro" },
  { id: "amarelo", nome: "Amarelo e cinza escuro", tema: "escuro" },
];

export function lerPreferencias(perfilId) {
  let dados = {};
  try { dados = JSON.parse(localStorage.getItem(`aoldeya:perfil:${perfilId}:preferencias`)) || {}; } catch { /* Usa os valores iniciais. */ }
  return {
    nome: typeof dados.nome === "string" ? dados.nome.slice(0, 50) : "",
    foto: typeof dados.foto === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(dados.foto) ? dados.foto : "",
    tema: dados.tema === "escuro" ? "escuro" : "claro",
    paleta: paletas.some(p => p.id === dados.paleta) ? dados.paleta : "verde",
  };
}

export function salvarPreferencias(perfilId, dados) {
  localStorage.setItem(`aoldeya:perfil:${perfilId}:preferencias`, JSON.stringify(dados));
}

export function nomePerfil(perfilId, padrao) {
  return lerPreferencias(perfilId).nome.trim() || padrao;
}

export function aplicarAparencia(preferencias) {
  document.documentElement.dataset.theme = preferencias.tema;
  document.documentElement.dataset.palette = preferencias.paleta;
}

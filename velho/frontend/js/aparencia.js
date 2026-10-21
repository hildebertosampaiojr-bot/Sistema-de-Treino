// Aplica a preferência antes da renderização da página de treinos.
(() => {
  try {
    const id = new URLSearchParams(location.search).get("perfil");
    const p = JSON.parse(localStorage.getItem(`aoldeya:perfil:${id}:preferencias`)) || {};
    document.documentElement.dataset.theme = p.tema === "escuro" ? "escuro" : "claro";
    document.documentElement.dataset.palette = ["azul", "vermelho", "laranja", "verde", "amarelo"].includes(p.paleta) ? p.paleta : "verde";
  } catch { /* Mantém a aparência padrão. */ }
})();

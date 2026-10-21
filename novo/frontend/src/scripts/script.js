// Dados compartilhados entre as páginas do aplicativo.
const dayNames = {
  seg: "Segunda-feira",
  ter: "Ter\u00e7a-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "S\u00e1bado",
  dom: "Domingo"
};

const profiles = {
  Junior: {
    weight: "78", height: "1,75 m", bmi: "25,5", goal: "Ganho de massa e for\u00e7a",
    greeting: "Bora treinar hoje?", workout: "", accent: "red"
  },
  Gabriella: {
    weight: "48", height: "1,61 m", bmi: "18,5", goal: "Ganho de massa muscular",
    greeting: "Vamos evoluir hoje?", workout: "", accent: "pink"
  }
};

const requestedUser = new URLSearchParams(window.location.search).get("usuario");
let savedUser = null;
try { savedUser = localStorage.getItem("aoldeya-user"); } catch { /* O armazenamento local pode estar indisponível. */ }
const activeUserName = (requestedUser || savedUser) === "Gabriella" ? "Gabriella" : "Junior";
const activeProfile = profiles[activeUserName];
document.body.classList.toggle("profile-pink", activeProfile.accent === "pink");
const apiBase = window.AOLDEYA_API_URL || "http://127.0.0.1:5000";
const appearanceKey = `aoldeya-appearance-${activeUserName}`;
let appearance = "dark";
try { appearance = localStorage.getItem(appearanceKey) === "light" ? "light" : "dark"; } catch { /* Mantém o tema escuro padrão. */ }
document.body.classList.toggle("light-appearance", appearance === "light");
const toggleAppearance = () => {
  appearance = appearance === "dark" ? "light" : "dark";
  document.body.classList.toggle("light-appearance", appearance === "light");
  try { localStorage.setItem(appearanceKey, appearance); } catch { /* O tema continua ativo nesta sessão. */ }
  return appearance;
};
window.Aoldeya = { dayNames, profiles, activeUserName, activeProfile, apiBase, toggleAppearance };

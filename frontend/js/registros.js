export function dataLocal(data = new Date()) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export function lerLocal(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; }
  catch { return padrao; }
}

export function gravarLocal(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

export function chaveResultado(resultado) {
  return `${resultado.data}:${resultado.treino_id}`;
}

export function atualizarResultado(resultados, novo) {
  return [...resultados.filter(item => chaveResultado(item) !== chaveResultado(novo)), novo]
    .sort((a, b) => a.data.localeCompare(b.data) || a.treino_id - b.treino_id);
}

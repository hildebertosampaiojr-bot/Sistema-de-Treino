// Orientações gerais fornecidas pelo usuário para os dois planos.
const orientacoes = [
  ["Aquecimento", "5–10 minutos leves e séries preparatórias nos exercícios principais"],
  ["Intensidade", "Terminar a maioria das séries com 1–3 repetições em reserva"],
  ["Progressão", "Aumentar a carga quando atingir o máximo de repetições com técnica correta"],
  ["Cadência", "Movimento controlado, sem impulso"],
  ["Recuperação", "Priorizar 7–9 horas de sono"],
  ["Frequência", "5 dias de musculação por semana"],
  ["Avaliação", "Revisar cargas, desempenho e recuperação a cada 4–6 semanas"],
];

export function criarOrientacoes() {
  const detalhes = document.createElement("details");
  detalhes.className = "general-guidance";
  const titulo = document.createElement("summary");
  titulo.textContent = "Orientações gerais";
  detalhes.append(titulo);
  const lista = document.createElement("dl");
  for (const [parametro, recomendacao] of orientacoes) {
    const termo = document.createElement("dt");
    termo.textContent = parametro;
    const descricao = document.createElement("dd");
    descricao.textContent = recomendacao;
    lista.append(termo, descricao);
  }
  detalhes.append(lista);
  return detalhes;
}

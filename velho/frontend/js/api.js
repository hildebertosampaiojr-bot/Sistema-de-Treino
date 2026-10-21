export async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(caminho, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...opcoes.headers },
  });
  if (!resposta.headers.get("Content-Type")?.includes("application/json")) {
    throw new Error("O serviço de treinos não está disponível.");
  }
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || "Não foi possível completar a solicitação.");
  return dados;
}

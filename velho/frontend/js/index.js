// Os dois perfis ficam no HTML para aparecerem sem depender da API.
if (window.location.protocol === "file:") {
  document.querySelector("#access-status").textContent =
    "Para acessar os treinos, execute python -m backend.app e abra http://localhost:8000.";
}

// Exibe o nome e a foto salvos para cada pessoa na seleção inicial.
for (const [id, seletor] of [[1, '.junior'], [2, '.gabriella']]) {
  try {
    const preferencias = JSON.parse(localStorage.getItem(`aoldeya:perfil:${id}:preferencias`)) || {};
    const card = document.querySelector(seletor);
    if (!card) continue;
    const nome = typeof preferencias.nome === 'string' ? preferencias.nome.trim().slice(0, 50) : '';
    if (nome) {
      card.querySelector('h3').textContent = nome;
      card.querySelector('.avatar').textContent = nome.charAt(0).toLocaleUpperCase('pt-BR');
    }
    if (typeof preferencias.foto === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(preferencias.foto)) {
      const img = document.createElement('img');
      img.src = preferencias.foto;
      img.alt = '';
      card.querySelector('.avatar').replaceChildren(img);
    }
  } catch { /* Mantém os perfis iniciais quando não há preferência salva. */ }
}

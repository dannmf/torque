// Funcao unica de fetch usada por todas as paginas
const API_URL = 'http://localhost:3000';

async function apiFetch(caminho, opcoes = {}) {
  const token = localStorage.getItem('token');

  const resposta = await fetch(API_URL + caminho, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });

  // Sem token valido, volta para o login
  if (resposta.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = 'index.html';
    return null;
  }

  return resposta;
}

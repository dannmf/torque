// Tela de login
const formLogin = document.getElementById('formLogin');
const mensagemErro = document.getElementById('mensagemErro');

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = '';

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  // Chamada direta (sem apiFetch) porque aqui ainda nao existe token
  const resposta = await fetch(API_URL + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const dados = await resposta.json();

  // Mostra a mensagem de erro na tela quando a autenticacao falha [RN02]
  if (!resposta.ok) {
    mensagemErro.textContent = dados.mensagem;
    return;
  }

  localStorage.setItem('token', dados.token);
  localStorage.setItem('nome', dados.nome);
  window.location.href = 'principal.html';
});

// Tela principal [RN04]
const nome = localStorage.getItem('nome');

// Sem token, volta para o login
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

document.getElementById('saudacao').textContent = `Ola, ${nome}`;

document.getElementById('botaoSair').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nome');
  window.location.href = 'index.html';
});

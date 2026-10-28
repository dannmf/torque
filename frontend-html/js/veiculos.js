// Tela de veiculos
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const tabelaVeiculos = document.getElementById('tabelaVeiculos');
const campoCliente = document.getElementById('campoCliente');
const mensagemErro = document.getElementById('mensagemErro');

// Lista os veiculos cadastrados
async function listarVeiculos() {
  const resposta = await apiFetch('/veiculos');
  const veiculos = await resposta.json();

  tabelaVeiculos.innerHTML = '';
  veiculos.forEach((veiculo) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${veiculo.placa}</td>
      <td>${veiculo.marca ?? ''}</td>
      <td>${veiculo.modelo ?? ''}</td>
      <td>${veiculo.ano ?? ''}</td>
      <td>${veiculo.cliente_id}</td>
    `;
    tabelaVeiculos.appendChild(linha);
  });
}

// Preenche o select de clientes usado no cadastro de veiculo
async function carregarClientes() {
  const resposta = await apiFetch('/clientes');
  const clientes = await resposta.json();

  clientes.forEach((cliente) => {
    const opcao = document.createElement('option');
    opcao.value = cliente.id;
    opcao.textContent = cliente.nome;
    campoCliente.appendChild(opcao);
  });
}

// Cadastra um veiculo associado a um cliente [RN09]
document.getElementById('formVeiculo').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = '';

  const corpo = {
    cliente_id: campoCliente.value,
    placa: document.getElementById('campoPlaca').value,
    marca: document.getElementById('campoMarca').value,
    modelo: document.getElementById('campoModelo').value,
    ano: document.getElementById('campoAno').value,
  };

  const resposta = await apiFetch('/veiculos', { method: 'POST', body: JSON.stringify(corpo) });
  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagemErro.textContent = dados.mensagem;
    return;
  }

  evento.target.reset();
  listarVeiculos();
});

listarVeiculos();
carregarClientes();

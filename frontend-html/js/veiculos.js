// Tela de veiculos
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const tabelaVeiculos = document.getElementById('tabelaVeiculos');
const campoCliente = document.getElementById('campoCliente');
const mensagemErro = document.getElementById('mensagemErro');
const formVeiculo = document.getElementById('formVeiculo');
const tituloFormulario = document.getElementById('tituloFormulario');
const botaoSalvarVeiculo = document.getElementById('botaoSalvarVeiculo');

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
      <td>
        <button class="botaoEditar" data-id="${veiculo.id}">Editar</button>
        <button class="botaoExcluir secundario" data-id="${veiculo.id}">Excluir</button>
      </td>
    `;
    tabelaVeiculos.appendChild(linha);
  });

  document.querySelectorAll('.botaoEditar').forEach((botao) => {
    botao.addEventListener('click', () => preencherFormulario(veiculos, botao.dataset.id));
  });

  // Remove o veiculo escolhido
  document.querySelectorAll('.botaoExcluir').forEach((botao) => {
    botao.addEventListener('click', async () => {
      await apiFetch(`/veiculos/${botao.dataset.id}`, { method: 'DELETE' });
      listarVeiculos();
    });
  });
}

// Preenche o formulario para edicao do veiculo escolhido
function preencherFormulario(veiculos, id) {
  const veiculo = veiculos.find((item) => String(item.id) === String(id));

  document.getElementById('campoId').value = veiculo.id;
  campoCliente.value = veiculo.cliente_id;
  document.getElementById('campoPlaca').value = veiculo.placa;
  document.getElementById('campoMarca').value = veiculo.marca ?? '';
  document.getElementById('campoModelo').value = veiculo.modelo ?? '';
  document.getElementById('campoAno').value = veiculo.ano ?? '';

  tituloFormulario.textContent = 'Editar veiculo';
  botaoSalvarVeiculo.textContent = 'Salvar';
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

// Cadastra ou atualiza um veiculo associado a um cliente [RN09]
formVeiculo.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = '';

  const id = document.getElementById('campoId').value;
  const corpo = {
    cliente_id: campoCliente.value,
    placa: document.getElementById('campoPlaca').value,
    marca: document.getElementById('campoMarca').value,
    modelo: document.getElementById('campoModelo').value,
    ano: document.getElementById('campoAno').value,
  };

  const resposta = id
    ? await apiFetch(`/veiculos/${id}`, { method: 'PUT', body: JSON.stringify(corpo) })
    : await apiFetch('/veiculos', { method: 'POST', body: JSON.stringify(corpo) });
  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagemErro.textContent = dados.mensagem;
    return;
  }

  formVeiculo.reset();
  tituloFormulario.textContent = 'Cadastrar veiculo';
  botaoSalvarVeiculo.textContent = 'Cadastrar';
  listarVeiculos();
});

listarVeiculos();
carregarClientes();

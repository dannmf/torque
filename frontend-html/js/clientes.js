// Tela de clientes
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const tabelaClientes = document.getElementById('tabelaClientes');
const formCadastrar = document.getElementById('formCadastrar');
const formEditar = document.getElementById('formEditar');

// Desenha a tabela com os clientes recebidos
function desenharTabela(clientes) {
  tabelaClientes.innerHTML = '';

  clientes.forEach((cliente) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.cpf}</td>
      <td>${cliente.telefone ?? ''}</td>
      <td>${cliente.email ?? ''}</td>
      <td>
        <button class="botaoEditar" data-id="${cliente.id}">Editar</button>
        <button class="botaoExcluir secundario" data-id="${cliente.id}">Excluir</button>
      </td>
    `;
    tabelaClientes.appendChild(linha);
  });

  document.querySelectorAll('.botaoEditar').forEach((botao) => {
    botao.addEventListener('click', () => preencherFormulario(clientes, botao.dataset.id));
  });

  // Remove o cliente escolhido
  document.querySelectorAll('.botaoExcluir').forEach((botao) => {
    botao.addEventListener('click', async () => {
      await apiFetch(`/clientes/${botao.dataset.id}`, { method: 'DELETE' });
      buscarClientes();
    });
  });
}

// Busca os clientes na API, com ou sem termo de busca [RN05]
async function buscarClientes(termo = '') {
  const resposta = await apiFetch(`/clientes?busca=${encodeURIComponent(termo)}`);
  const clientes = await resposta.json();
  desenharTabela(clientes);
}

// Preenche o formulario de edicao com os dados do cliente escolhido
function preencherFormulario(clientes, id) {
  const cliente = clientes.find((item) => String(item.id) === String(id));
  document.getElementById('editarId').value = cliente.id;
  document.getElementById('editarNome').value = cliente.nome;
  document.getElementById('editarCpf').value = cliente.cpf;
  document.getElementById('editarTelefone').value = cliente.telefone ?? '';
  document.getElementById('editarEmail').value = cliente.email ?? '';
}

document.getElementById('botaoBuscar').addEventListener('click', () => {
  buscarClientes(document.getElementById('termoBusca').value);
});

// Cadastra um novo cliente [RN03]
formCadastrar.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const corpo = {
    nome: document.getElementById('cadastrarNome').value,
    cpf: document.getElementById('cadastrarCpf').value,
    telefone: document.getElementById('cadastrarTelefone').value,
    email: document.getElementById('cadastrarEmail').value,
  };

  await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(corpo) });
  formCadastrar.reset();
  buscarClientes();
});

// Salva a edicao do cliente [RN06]
formEditar.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = document.getElementById('editarId').value;
  const corpo = {
    nome: document.getElementById('editarNome').value,
    cpf: document.getElementById('editarCpf').value,
    telefone: document.getElementById('editarTelefone').value,
    email: document.getElementById('editarEmail').value,
  };

  await apiFetch(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(corpo) });
  formEditar.reset();
  buscarClientes();
});

buscarClientes();

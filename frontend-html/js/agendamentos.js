// Tela de agendamentos
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const tabelaAgendamentos = document.getElementById('tabelaAgendamentos');
const campoVeiculo = document.getElementById('campoVeiculo');
const formAgendamento = document.getElementById('formAgendamento');

// Converte a data do banco (string local, sem timezone) para o formato do input datetime-local
function paraDatetimeLocal(data) {
  return data.slice(0, 16).replace(' ', 'T');
}

// Lista os agendamentos ordenados por data, com dados do cliente e do veiculo [RN07]
async function listarAgendamentos() {
  const resposta = await apiFetch('/agendamentos');
  const agendamentos = await resposta.json();

  tabelaAgendamentos.innerHTML = '';

  agendamentos.forEach((agendamento) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${new Date(agendamento.data_agendamento).toLocaleString('pt-BR')}</td>
      <td>${agendamento.servico ?? ''}</td>
      <td>${agendamento.placa} - ${agendamento.marca} ${agendamento.modelo}</td>
      <td>${agendamento.cliente_nome}</td>
      <td>
        <input type="datetime-local" value="${paraDatetimeLocal(agendamento.data_agendamento)}" data-id="${agendamento.id}" />
        <button class="botaoSalvarData" data-id="${agendamento.id}">Salvar</button>
      </td>
      <td><button class="botaoExcluir secundario" data-id="${agendamento.id}">Excluir</button></td>
    `;
    tabelaAgendamentos.appendChild(linha);
  });

  // Altera a data de um agendamento e salva no banco [RN08]
  document.querySelectorAll('.botaoSalvarData').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const id = botao.dataset.id;
      const input = document.querySelector(`input[data-id="${id}"]`);

      await apiFetch(`/agendamentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data_agendamento: input.value.replace('T', ' ') }),
      });

      listarAgendamentos();
    });
  });

  // Remove o agendamento escolhido
  document.querySelectorAll('.botaoExcluir').forEach((botao) => {
    botao.addEventListener('click', async () => {
      await apiFetch(`/agendamentos/${botao.dataset.id}`, { method: 'DELETE' });
      listarAgendamentos();
    });
  });
}

// Preenche o select de veiculos usado no cadastro de agendamento
async function carregarVeiculos() {
  const resposta = await apiFetch('/veiculos');
  const veiculos = await resposta.json();

  veiculos.forEach((veiculo) => {
    const opcao = document.createElement('option');
    opcao.value = veiculo.id;
    opcao.textContent = `${veiculo.placa} - ${veiculo.marca ?? ''} ${veiculo.modelo ?? ''}`;
    campoVeiculo.appendChild(opcao);
  });
}

// Cadastra um agendamento associado a um veiculo
formAgendamento.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const corpo = {
    veiculo_id: campoVeiculo.value,
    data_agendamento: document.getElementById('campoData').value.replace('T', ' '),
    servico: document.getElementById('campoServico').value,
  };

  await apiFetch('/agendamentos', { method: 'POST', body: JSON.stringify(corpo) });
  formAgendamento.reset();
  listarAgendamentos();
});

listarAgendamentos();
carregarVeiculos();

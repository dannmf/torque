// Tela de agendamentos
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const tabelaAgendamentos = document.getElementById('tabelaAgendamentos');

// Converte a data do banco para o formato aceito pelo input datetime-local
function paraDatetimeLocal(data) {
  return new Date(data).toISOString().slice(0, 16);
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
}

listarAgendamentos();

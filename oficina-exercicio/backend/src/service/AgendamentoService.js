// Service do agendamento: regra de negocio de listagem e alteracao de data
const AgendamentoRepository = require('../repositories/AgendamentoRepository');

// Lista os agendamentos com os dados do veiculo e do cliente, ordenados por data [RN07]
async function listar() {
  return AgendamentoRepository.listarTodos();
}

// Altera a data de um agendamento [RN08]
async function atualizarData(id, novaData) {
  await AgendamentoRepository.atualizarData(id, novaData);
  return { id, data_agendamento: novaData };
}

module.exports = { listar, atualizarData };

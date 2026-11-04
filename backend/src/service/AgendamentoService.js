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

// Cadastra um agendamento associado a um veiculo
async function cadastrar(veiculoId, dataAgendamento, servico) {
  const id = await AgendamentoRepository.cadastrar(veiculoId, dataAgendamento, servico);
  return { id, veiculo_id: veiculoId, data_agendamento: dataAgendamento, servico };
}

// Remove um agendamento
async function excluir(id) {
  await AgendamentoRepository.excluir(id);
}

module.exports = { listar, atualizarData, cadastrar, excluir };

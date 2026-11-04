// Controller de agendamentos: so recebe req/res e chama a service
const AgendamentoService = require('../service/AgendamentoService');

// GET /agendamentos
async function listar(req, res) {
  const agendamentos = await AgendamentoService.listar();
  res.json(agendamentos);
}

// PUT /agendamentos/:id
async function atualizarData(req, res) {
  const { id } = req.params;
  const { data_agendamento } = req.body;

  const resultado = await AgendamentoService.atualizarData(id, data_agendamento);
  res.json(resultado);
}

// POST /agendamentos
async function cadastrar(req, res) {
  const { veiculo_id, data_agendamento, servico } = req.body;

  const agendamento = await AgendamentoService.cadastrar(veiculo_id, data_agendamento, servico);
  res.status(201).json(agendamento);
}

// DELETE /agendamentos/:id
async function excluir(req, res) {
  const { id } = req.params;

  await AgendamentoService.excluir(id);
  res.json({ mensagem: 'Agendamento removido' });
}

module.exports = { listar, atualizarData, cadastrar, excluir };

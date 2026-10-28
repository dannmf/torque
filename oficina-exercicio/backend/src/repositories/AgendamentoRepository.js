// Repository do agendamento: so executa SQL, sem regra de negocio aqui
const db = require('../config/db');

// TODO [RN07]: fazer JOIN com veiculos e clientes e ordenar com ORDER BY agendamentos.data_agendamento
async function listarTodos() {
  const [linhas] = await db.query('SELECT * FROM agendamentos');
  return linhas;
}

// TODO [RN08]: fazer um UPDATE agendamentos SET data_agendamento = ? WHERE id = ?
async function atualizarData(id, novaData) {
  // nada acontece ainda
}

module.exports = { listarTodos, atualizarData };

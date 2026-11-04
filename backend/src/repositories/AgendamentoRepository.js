// Repository do agendamento: so executa SQL, sem regra de negocio aqui
const db = require('../config/db');

// Lista os agendamentos com os dados do veiculo e do cliente,
// ordenados pela data do agendamento [RN07]
async function listarTodos() {
  const [linhas] = await db.query(
    `SELECT
       agendamentos.id,
       agendamentos.data_agendamento,
       agendamentos.servico,
       veiculos.id AS veiculo_id,
       veiculos.placa,
       veiculos.marca,
       veiculos.modelo,
       veiculos.ano,
       clientes.id AS cliente_id,
       clientes.nome AS cliente_nome,
       clientes.telefone AS cliente_telefone,
       clientes.email AS cliente_email
     FROM agendamentos
     JOIN veiculos ON veiculos.id = agendamentos.veiculo_id
     JOIN clientes ON clientes.id = veiculos.cliente_id
     ORDER BY agendamentos.data_agendamento`
  );
  return linhas;
}

// Altera a data de um agendamento [RN08]
async function atualizarData(id, novaData) {
  await db.query('UPDATE agendamentos SET data_agendamento = ? WHERE id = ?', [novaData, id]);
}

// Insere um novo agendamento associado ao veiculo recebido
async function cadastrar(veiculoId, dataAgendamento, servico) {
  const [resultado] = await db.query(
    'INSERT INTO agendamentos (veiculo_id, data_agendamento, servico) VALUES (?, ?, ?)',
    [veiculoId, dataAgendamento, servico]
  );
  return resultado.insertId;
}

// Remove um agendamento
async function excluir(id) {
  await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);
}

module.exports = { listarTodos, atualizarData, cadastrar, excluir };

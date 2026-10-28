// Repository do veiculo: so executa SQL, sem regra de negocio aqui
const db = require('../config/db');

// Lista todos os veiculos
async function listarTodos() {
  const [linhas] = await db.query('SELECT * FROM veiculos');
  return linhas;
}

// Insere o veiculo ja associado ao cliente_id recebido
async function cadastrar(clienteId, placa, marca, modelo, ano) {
  const [resultado] = await db.query(
    'INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES (?, ?, ?, ?, ?)',
    [clienteId, placa, marca, modelo, ano]
  );
  return resultado.insertId;
}

module.exports = { listarTodos, cadastrar };

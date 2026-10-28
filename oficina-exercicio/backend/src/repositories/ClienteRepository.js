// Repository do cliente: so executa SQL, sem regra de negocio aqui
const db = require('../config/db');

// Lista todos os clientes
async function listarTodos() {
  const [linhas] = await db.query('SELECT * FROM clientes');
  return linhas;
}

// TODO [RN05]: fazer um SELECT com WHERE nome LIKE ? usando `%${termo}%` como parametro
async function buscarPorNome(termo) {
  return listarTodos();
}

// Busca um cliente pelo id
async function buscarPorId(id) {
  const [linhas] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return linhas[0];
}

// Atualiza os dados de um cliente [RN06]
async function atualizar(id, nome, cpfCriptografado, telefone, email) {
  await db.query(
    'UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ? WHERE id = ?',
    [nome, cpfCriptografado, telefone, email, id]
  );
}

module.exports = { listarTodos, buscarPorNome, buscarPorId, atualizar };

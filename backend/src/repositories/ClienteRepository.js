// Repository do cliente: so executa SQL, sem regra de negocio aqui
const db = require('../config/db');

// Lista todos os clientes
async function listarTodos() {
  const [linhas] = await db.query('SELECT * FROM clientes');
  return linhas;
}

// Busca clientes pelo nome [RN05]
// Nao buscamos pelo CPF porque ele esta criptografado no banco,
// entao o LIKE nunca encontraria o termo digitado pelo usuario.
async function buscarPorNome(termo) {
  const [linhas] = await db.query('SELECT * FROM clientes WHERE nome LIKE ?', [`%${termo}%`]);
  return linhas;
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

// Insere um novo cliente
async function cadastrar(nome, cpfCriptografado, telefone, email) {
  const [resultado] = await db.query(
    'INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)',
    [nome, cpfCriptografado, telefone, email]
  );
  return resultado.insertId;
}

// Remove um cliente
async function excluir(id) {
  await db.query('DELETE FROM clientes WHERE id = ?', [id]);
}

module.exports = { listarTodos, buscarPorNome, buscarPorId, atualizar, cadastrar, excluir };

// Repository do usuario: so executa SQL, sem regra de negocio aqui
const db = require('../config/db');

// Busca um usuario pelo e-mail (usado no login)
async function buscarPorEmail(email) {
  const [linhas] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return linhas[0];
}

module.exports = { buscarPorEmail };

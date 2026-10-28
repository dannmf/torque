// Service do usuario: regra de negocio do login
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/UsuarioRepository');

// Confere e-mail e senha e gera o token [RN02]
async function autenticar(email, senha) {
  const usuario = await UsuarioRepository.buscarPorEmail(email);

  if (!usuario) {
    return null;
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    return null;
  }

  // TODO [RN10]: adicionar { expiresIn: '1h' } como terceiro argumento do jwt.sign
  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET
  );

  return { token, nome: usuario.nome };
}

module.exports = { autenticar };

// Middleware que verifica o token JWT em todas as rotas protegidas
require('dotenv').config();
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res.status(401).json({ mensagem: 'Token nao informado' });
  }

  const token = cabecalho.replace('Bearer ', '');

  try {
    // Se o token estiver expirado, jwt.verify lanca um erro e cai no catch [RN10]
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = dados;
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token invalido ou expirado' });
  }
}

module.exports = auth;

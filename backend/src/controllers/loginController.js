// Controller do login: so recebe req/res e chama a service
const UsuarioService = require('../service/UsuarioService');

async function login(req, res) {
  const { email, senha } = req.body;

  const resultado = await UsuarioService.autenticar(email, senha);

  // Mensagem de erro quando a autenticacao falha [RN02]
  if (!resultado) {
    return res.status(401).json({ mensagem: 'E-mail ou senha invalidos' });
  }

  res.json(resultado);
}

module.exports = { login };

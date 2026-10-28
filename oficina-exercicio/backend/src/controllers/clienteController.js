// Controller de clientes: so recebe req/res e chama a service
const ClienteService = require('../service/ClienteService');

// GET /clientes?busca=termo
async function listar(req, res) {
  const { busca } = req.query;
  const clientes = await ClienteService.listar(busca);
  res.json(clientes);
}

// PUT /clientes/:id
async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, cpf, telefone, email } = req.body;

  const clienteAtualizado = await ClienteService.atualizar(id, nome, cpf, telefone, email);
  res.json(clienteAtualizado);
}

module.exports = { listar, atualizar };

// Controller de veiculos: so recebe req/res e chama a service
const VeiculoService = require('../service/VeiculoService');

// GET /veiculos
async function listar(req, res) {
  const veiculos = await VeiculoService.listar();
  res.json(veiculos);
}

// POST /veiculos
async function cadastrar(req, res) {
  const { cliente_id, placa, marca, modelo, ano } = req.body;

  const resultado = await VeiculoService.cadastrar(cliente_id, placa, marca, modelo, ano);

  // Veiculo sem cliente associado [RN09]
  if (resultado.erro) {
    return res.status(400).json({ mensagem: resultado.erro });
  }

  res.status(201).json(resultado);
}

// PUT /veiculos/:id
async function atualizar(req, res) {
  const { id } = req.params;
  const { cliente_id, placa, marca, modelo, ano } = req.body;

  const resultado = await VeiculoService.atualizar(id, cliente_id, placa, marca, modelo, ano);

  // Veiculo sem cliente associado [RN09]
  if (resultado.erro) {
    return res.status(400).json({ mensagem: resultado.erro });
  }

  res.json(resultado);
}

// DELETE /veiculos/:id
async function excluir(req, res) {
  const { id } = req.params;

  await VeiculoService.excluir(id);
  res.json({ mensagem: 'Veiculo removido' });
}

module.exports = { listar, cadastrar, atualizar, excluir };

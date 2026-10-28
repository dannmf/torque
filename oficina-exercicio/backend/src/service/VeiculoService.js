// Service do veiculo: regra de negocio de cadastro
const VeiculoRepository = require('../repositories/VeiculoRepository');

async function listar() {
  return VeiculoRepository.listarTodos();
}

// Um veiculo sempre precisa estar associado a um cliente [RN09]
async function cadastrar(clienteId, placa, marca, modelo, ano) {
  if (!clienteId) {
    return { erro: 'cliente_id e obrigatorio' };
  }

  const id = await VeiculoRepository.cadastrar(clienteId, placa, marca, modelo, ano);
  return { id, cliente_id: clienteId, placa, marca, modelo, ano };
}

module.exports = { listar, cadastrar };

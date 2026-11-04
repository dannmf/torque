// Service do cliente: regra de negocio de busca, edicao e protecao do CPF
const ClienteRepository = require('../repositories/ClienteRepository');
const { criptografarCpf, descriptografarCpf } = require('../utils/cripto');

// Tira o CPF criptografado de uma lista de clientes antes de mandar para o front
function descriptografarLista(clientes) {
  return clientes.map((cliente) => ({
    ...cliente,
    cpf: descriptografarCpf(cliente.cpf),
  }));
}

// Lista todos os clientes ou filtra pelo termo de busca [RN05]
async function listar(busca) {
  const clientes = busca
    ? await ClienteRepository.buscarPorNome(busca)
    : await ClienteRepository.listarTodos();

  return descriptografarLista(clientes);
}

// Atualiza um cliente, criptografando o CPF antes de salvar [RN03] [RN06]
async function atualizar(id, nome, cpf, telefone, email) {
  const cpfCriptografado = criptografarCpf(cpf);
  await ClienteRepository.atualizar(id, nome, cpfCriptografado, telefone, email);

  const clienteAtualizado = await ClienteRepository.buscarPorId(id);
  return { ...clienteAtualizado, cpf: descriptografarCpf(clienteAtualizado.cpf) };
}

// Cadastra um cliente, criptografando o CPF antes de salvar [RN03]
async function cadastrar(nome, cpf, telefone, email) {
  const cpfCriptografado = criptografarCpf(cpf);
  const id = await ClienteRepository.cadastrar(nome, cpfCriptografado, telefone, email);
  return { id, nome, cpf, telefone, email };
}

// Remove um cliente
async function excluir(id) {
  await ClienteRepository.excluir(id);
}

module.exports = { listar, atualizar, cadastrar, excluir };

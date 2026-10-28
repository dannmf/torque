// Criptografia do CPF [RN03]
//
// O CPF usa criptografia (aes-256-cbc) porque precisamos mostrar o CPF
// original para o usuario logado. Criptografia pode ser revertida com a chave.
//
// Diferente disso, a senha do usuario usa hash (bcrypt), que NAO pode ser
// revertido: so conseguimos comparar a senha digitada com o hash salvo.
require('dotenv').config();
const crypto = require('crypto');

const ALGORITMO = 'aes-256-cbc';
const CHAVE = process.env.CRIPTO_CHAVE;
const IV = process.env.CRIPTO_IV;

// TODO [RN03]: usar crypto.createCipheriv(ALGORITMO, CHAVE, IV) para criptografar o CPF antes de salvar
function criptografarCpf(cpfTexto) {
  return cpfTexto;
}

// TODO [RN03]: usar crypto.createDecipheriv(ALGORITMO, CHAVE, IV) para descriptografar o CPF lido do banco
function descriptografarCpf(cpfCriptografado) {
  return cpfCriptografado;
}

module.exports = { criptografarCpf, descriptografarCpf };

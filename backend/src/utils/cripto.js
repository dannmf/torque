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

// Transforma o CPF normal em texto criptografado
function criptografarCpf(cpfTexto) {
  const cifra = crypto.createCipheriv(ALGORITMO, CHAVE, IV);
  const criptografado = cifra.update(cpfTexto, 'utf8', 'hex') + cifra.final('hex');
  return criptografado;
}

// Transforma o CPF criptografado de volta no texto original
function descriptografarCpf(cpfCriptografado) {
  const decifra = crypto.createDecipheriv(ALGORITMO, CHAVE, IV);
  const original = decifra.update(cpfCriptografado, 'hex', 'utf8') + decifra.final('utf8');
  return original;
}

module.exports = { criptografarCpf, descriptografarCpf };

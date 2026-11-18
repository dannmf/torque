// Gera os valores que nao podem ser digitados a mao no database/script.sql:
// o hash da senha (bcrypt) e o CPF criptografado (AES-256-CBC).
// Roda, copia o que aparecer no terminal e cola no INSERT do script.sql.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function gerarHashSenha(senha) {
  return bcrypt.hashSync(senha, 10);
}

function criptografarCpf(cpf) {
  const cifra = crypto.createCipheriv('aes-256-cbc', process.env.CRIPTO_CHAVE, process.env.CRIPTO_IV);
  return cifra.update(cpf, 'utf8', 'hex') + cifra.final('hex');
}

console.log('Hash da senha 123456:', gerarHashSenha('123456'));
console.log('CPF 11122233344 criptografado:', criptografarCpf('11122233344'));
console.log('CPF 22233344455 criptografado:', criptografarCpf('22233344455'));
console.log('CPF 33344455566 criptografado:', criptografarCpf('33344455566'));

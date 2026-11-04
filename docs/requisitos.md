# Requisitos - Sistema da Oficina Mecanica

## Contexto

A oficina controla agendamentos, clientes e veiculos manualmente (papel/planilha),
o que causa perda de horarios, duplicidade de agendamentos e falhas no
armazenamento dos dados. O CPF dos clientes precisa ser protegido conforme a
LGPD, e o acesso ao sistema precisa ser controlado por login com expiracao.

## Requisitos Funcionais

- **RF01** - O sistema deve permitir login de usuarios com e-mail e senha.
- **RF02** - O sistema deve informar ao usuario quando o login falhar.
- **RF03** - O sistema deve manter o login valido por tempo limitado (token com expiracao).
- **RF04** - O sistema deve exibir uma tela principal com o nome do usuario logado,
  links de navegacao e opcao de logout.
- **RF05** - O sistema deve permitir buscar clientes pelo nome.
- **RF06** - O sistema deve permitir editar os dados de um cliente.
- **RF07** - O sistema deve proteger o CPF do cliente, armazenando-o de forma
  criptografada no banco de dados.
- **RF08** - O sistema deve permitir cadastrar veiculos, associando cada veiculo
  a um cliente existente.
- **RF09** - O sistema deve listar os agendamentos ordenados pela data,
  mostrando os dados do veiculo e do cliente relacionados.
- **RF10** - O sistema deve permitir alterar a data de um agendamento existente.

## Requisitos de Infraestrutura

| Item | Descricao |
|------|-----------|
| SGBD | MySQL, versao 9.5.0 |
| Linguagem / Runtime (backend) | JavaScript (Node.js), versao 26.5.0 |
| Framework web (backend) | Express, versao 4.19.2 |
| Driver de banco de dados | mysql2, versao 3.11.0 |
| Frontend 1 | HTML, CSS e JavaScript puros |
| Frontend 2 | React, versao 18.3.1, com Vite, versao 5.4.0 |

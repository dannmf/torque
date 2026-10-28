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

## Regras de Negocio

| Codigo | Descricao |
|--------|-----------|
| RN01 | O script do banco deve ter pelo menos 3 registros em todas as tabelas, respeitando tipos, PKs e FKs. |
| RN02 | No login, validar e mostrar mensagem quando a autenticacao falhar. |
| RN03 | O CPF do cliente deve ser salvo criptografado no banco. |
| RN04 | A tela principal mostra o nome do usuario logado, links para as outras telas e um botao de sair. |
| RN05 | Na tela de clientes, o usuario digita um termo, clica em Buscar e a tabela e atualizada so com os registros correspondentes. |
| RN06 | Na tela de clientes, e possivel editar um cliente e salvar no banco. |
| RN07 | Na tela de agendamentos, a listagem vem ordenada pela data do agendamento, com todos os dados do cliente e do veiculo. |
| RN08 | Na tela de agendamentos, e possivel alterar a data de um agendamento e salvar no banco. |
| RN09 | Ao cadastrar um veiculo, ele deve ser associado a um cliente. |
| RN10 | O login gera um token JWT com tempo de expiracao. |

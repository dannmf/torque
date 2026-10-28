# Planejamento de aula - Revisao pratica (Projeto Torque)

Guia para o professor conduzir a revisao usando o `oficina-exercicio/` como
exercicio pratico. O projeto completo (com a solucao de tudo) fica na raiz
do repositorio, em `../../` (pastas `backend/`, `frontend-html/`,
`frontend-react/`).

## Objetivo da aula

O aluno deve encontrar os 5 pontos marcados com `// TODO [RNxx]` no backend
e implementar a regra de negocio que falta, usando o restante do sistema
(que ja funciona) como referencia de padrao de codigo.

## Pre-requisitos do aluno

- Javascript basico (funcoes assincronas, async/await)
- SQL basico (SELECT, UPDATE, LIKE, JOIN, ORDER BY)
- Ja ter visto o conceito de token JWT e de criptografia/hash

## Duracao sugerida

- 1 aula de 4 horas (50 min por RN + fechamento), ou
- 2 aulas de 2 horas (dividindo em RN03+RN05+RN07 na primeira e RN08+RN10 na segunda)

## Preparacao antes da aula (professor)

1. Confirmar que o MySQL esta instalado e rodando na maquina dos alunos (ou em um servidor compartilhado).
2. Importar o banco de cada aluno a partir de `database/script.sql`:
   ```bash
   mysql -u root -p < database/script.sql
   ```
3. Em `backend/`, copiar o `.env.example` para `.env` e ajustar os dados do MySQL.
4. Rodar `npm install` dentro de `backend/`.
5. Confirmar que a API sobe sem erro: `npm start` (porta 3000).
6. Ter o projeto completo (`../../backend`) aberto em outra aba como gabarito, sem mostrar aos alunos antes da tentativa deles.

## Como o aluno encontra os TODOs

Pedir para o aluno rodar, dentro de `oficina-exercicio/backend/`:

```bash
grep -rn "TODO" src/
```

Isso deve listar os 5 pontos abaixo. Nenhum outro arquivo do projeto precisa ser alterado.

## Roteiro por regra de negocio

### RN03 - CPF criptografado

- **Arquivo:** `backend/src/utils/cripto.js`
- **O que falta:** as funcoes `criptografarCpf` e `descriptografarCpf` so devolvem o valor recebido sem transformar.
- **O que o aluno precisa fazer:** usar `crypto.createCipheriv(ALGORITMO, CHAVE, IV)` para criptografar e `crypto.createDecipheriv(ALGORITMO, CHAVE, IV)` para descriptografar (o `ALGORITMO`, `CHAVE` e `IV` ja estao declarados no topo do arquivo).
- **Como o aluno percebe que falta implementar:** ao listar clientes, o CPF aparece criptografado (hexadecimal) em vez do numero normal.
- **Como validar que ficou certo:** apos editar, listar clientes deve mostrar o CPF normal (ex: `11122233344`); no banco (`SELECT cpf FROM clientes`), o valor deve continuar em hexadecimal.

### RN05 - Busca de clientes por nome

- **Arquivo:** `backend/src/repositories/ClienteRepository.js`
- **O que falta:** a funcao `buscarPorNome` esta chamando `listarTodos()`, ignorando o termo digitado.
- **O que o aluno precisa fazer:** trocar por uma consulta `SELECT * FROM clientes WHERE nome LIKE ?` usando `` `%${termo}%` `` como parametro (seguir o padrao das outras funcoes do mesmo arquivo).
- **Como o aluno percebe que falta implementar:** na tela de Clientes, buscar por um nome continua trazendo todos os clientes.
- **Como validar que ficou certo:** buscar por "joao" deve trazer so os clientes com "joao" no nome.

### RN07 - Agendamentos ordenados com dados do cliente e do veiculo

- **Arquivo:** `backend/src/repositories/AgendamentoRepository.js`
- **O que falta:** a funcao `listarTodos` faz um `SELECT * FROM agendamentos` simples, sem JOIN e sem ordenacao.
- **O que o aluno precisa fazer:** reescrever a query com `JOIN veiculos` e `JOIN clientes` (pela FK correta) e `ORDER BY agendamentos.data_agendamento`. O projeto completo (gabarito) tem a query de referencia com os nomes de coluna esperados pelo front (`placa`, `marca`, `modelo`, `cliente_nome`, etc).
- **Como o aluno percebe que falta implementar:** a tela de Agendamentos aparece sem o nome do cliente/veiculo, so com os IDs, e fora de ordem.
- **Como validar que ficou certo:** a tabela deve mostrar todos os dados e vir ordenada da data mais antiga para a mais recente.

### RN08 - Alterar a data de um agendamento

- **Arquivo:** `backend/src/repositories/AgendamentoRepository.js`
- **O que falta:** a funcao `atualizarData` esta vazia (nao faz nenhuma query).
- **O que o aluno precisa fazer:** adicionar `UPDATE agendamentos SET data_agendamento = ? WHERE id = ?`.
- **Como o aluno percebe que falta implementar:** na tela de Agendamentos, mudar a data e clicar em Salvar nao muda nada depois de recarregar a lista.
- **Como validar que ficou certo:** alterar a data de um agendamento e atualizar a pagina deve manter a nova data.

### RN10 - Expiracao do token JWT

- **Arquivo:** `backend/src/service/UsuarioService.js`
- **O que falta:** o `jwt.sign` esta sendo chamado sem o terceiro argumento de expiracao.
- **O que o aluno precisa fazer:** adicionar `{ expiresIn: '1h' }` como terceiro argumento.
- **Como o aluno percebe que falta implementar:** o token nunca expira (aceita o mesmo token mesmo depois de horas).
- **Como validar que ficou certo:** gerar um token com `expiresIn` bem curto (ex: `'5s'`, so para o teste), esperar alguns segundos e confirmar que uma chamada autenticada passa a responder 401. Depois devolver para `'1h'`.

## Checklist de avaliacao (por aluno)

| RN | O que verificar | OK? |
|----|------------------|-----|
| RN03 | CPF aparece normal no front, criptografado no banco | |
| RN05 | Busca por nome filtra a tabela de clientes | |
| RN07 | Agendamentos vem ordenados por data com nome do cliente e do veiculo | |
| RN08 | Alterar a data e salvar reflete no banco | |
| RN10 | Token tem tempo de expiracao configurado | |

## Erros comuns dos alunos

- Esquecer de reiniciar a API (`npm start`) depois de editar um arquivo.
- Usar `=` em vez de `LIKE` na busca do RN05 (so funciona para nome exato).
- Esquecer o `?` como placeholder no SQL e concatenar a string direto (abre risco de SQL injection - aproveitar para reforcar o motivo de sempre usar `?`).
- No RN07, inverter o JOIN (juntar `clientes` direto com `agendamentos` sem passar por `veiculos`) e nao encontrar o `cliente_id`.
- No RN10, esquecer que `expiresIn` fica dentro do terceiro argumento (um objeto), nao como string solta.

## Gabarito

A solucao de cada RN esta implementada no projeto completo, nos arquivos
equivalentes dentro de `backend/src/` (na raiz do repositorio, fora de
`oficina-exercicio/`). Use como referencia para corrigir o aluno, mas
evite mostrar antes da tentativa dele.

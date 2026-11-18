# Estrutura do Codigo - Torque (Sistema da Oficina Mecanica)

> Material de contexto para o professor. Explica o que cada arquivo faz e como
> eles se conectam, antes de usar o `docs/roteiro-daniel.md` na live coding.

## 1. Visao geral

Sistema de CRUD para uma oficina mecanica: login, clientes, veiculos e
agendamentos. Regras principais: CPF criptografado (LGPD), senha com hash,
login com token JWT com expiracao, busca de clientes, edicao de registros e
listagem de agendamentos ordenada com `JOIN`.

**Arquitetura didatica, de propositos:**

- **Um unico arquivo de back** (`app.js`), sem camadas de `routes/controllers/service/repository`.
- **Sem front-end em JavaScript.** O HTML e puro; o servidor preenche
  `{{marcadores}}` com a biblioteca `mustache` antes de enviar a pagina.
- Isso reduz a quantidade de conceitos simultaneos (sem fetch, sem APIs REST,
  sem build de front) para focar em: Express, MySQL, autenticacao, hash e
  criptografia.

## 2. Arvore de arquivos

```
torque/
├── app.js                BACK: todas as rotas, autenticacao, SQL e criptografia
├── gerar-valores.js       imprime no terminal o hash da senha e o CPF criptografado
├── paginas/               FRONT: HTML puro com {{marcadores}}
│   ├── login.html
│   ├── principal.html
│   ├── clientes.html
│   ├── veiculos.html
│   └── agendamentos.html
├── database/
│   └── script.sql         cria o banco "oficina" e insere a carga inicial
├── docs/
│   ├── estrutura-do-codigo.md   este arquivo
│   ├── roteiro-live-coding.md   roteiro de outro professor (referencia)
│   ├── roteiro-daniel.md        roteiro que eu sigo na live
│   ├── atividades.md            enunciados da prova pratica, por etapas
│   └── der.png                  diagrama entidade-relacionamento
├── Contexto da atividade.txt     enunciado original dado pelo "gestor"
├── .env.example           molde das variaveis de ambiente (vai pro git)
├── .env                   variaveis reais (NAO vai pro git)
├── .gitignore
├── package.json
└── README.md
```

## 3. Banco de dados (`database/script.sql`)

Quatro tabelas, nessa ordem de dependencia (quem nao depende de ninguem,
primeiro):

| Tabela         | Chave estrangeira         | Observacao                                        |
| -------------- | -------------------------- | -------------------------------------------------- |
| `usuarios`     | -                           | Isolada; serve so para login. `email` e `UNIQUE`. |
| `clientes`     | -                           | `cpf` e `VARCHAR(255)` porque guarda o valor **criptografado** (texto hexadecimal), nao os 11 digitos. |
| `veiculos`     | `cliente_id -> clientes.id`| Nao existe veiculo sem cliente (RN09).            |
| `agendamentos` | `veiculo_id -> veiculos.id`| O cliente do agendamento se descobre **atraves do veiculo** (nao ha `cliente_id` direto). |

O arquivo ja vem com `INSERT` de 3 registros por tabela (RN01). O hash da
senha e o CPF criptografado **nao foram digitados a mao**: foram gerados com
`gerar-valores.js` e colados no arquivo (veja secao 4).

Para carregar: `mysql -u root -p < database/script.sql`.

## 4. `gerar-valores.js`

Por que existe: nao e possivel escrever um hash bcrypt ou um CPF criptografado
direto no SQL, porque o hash depende de um "sal" aleatorio e o CPF
criptografado depende da chave do `.env`. Entao este script so **calcula e
imprime** esses dois valores no terminal:

```js
function gerarHashSenha(senha) { ... }   // bcrypt.hashSync(senha, 10)
function criptografarCpf(cpf) { ... }    // AES-256-CBC com a chave/IV do .env
```

Rodar com `npm run gerar-valores`, copiar o que aparece no terminal e colar
manualmente nos `INSERT` do `database/script.sql`. **Nao escreve nenhum
arquivo** - a decisao de simplificar o `script.sql` (estatico, editavel a mao)
em vez de ter um gerador que recria o `.sql` inteiro foi proposital, para
reduzir a "magica" e deixar visivel o que cada funcao faz.

> Se voce rodar duas vezes, o hash da senha muda (o bcrypt gera um sal novo a
> cada chamada); o CPF criptografado **nao muda** (mesma chave/IV sempre
> produz a mesma saida). Essa diferenca e o gancho para explicar hash x
> criptografia (secao 6).

## 5. `app.js` - ordem das secoes e por que importam

| # | Secao | Por que vem nessa posicao |
|---|-------|----------------------------|
| 1 | `require('dotenv').config()` + demais `require` | O `.env` precisa ser lido antes de qualquer `process.env` |
| 2 | `const app = express()` | Cria o servidor |
| 3 | `express.urlencoded()` | Cria `req.body`; precisa vir antes de qualquer coisa que leia `req.body` |
| 4 | `cookieParser()` | Cria `req.cookies`; precisa vir antes do "porteiro" |
| 5 | Middleware de `_method` | Depende de `req.body.​_method`; transforma POST em PUT/DELETE quando o formulario manda o campo oculto |
| 6 | `mysql.createPool` (`db`) | Conexao usada por todas as rotas |
| 7 | Funcoes de apoio: `mostrar`, `criptografar`, `descriptografar`, `excluir` | Usadas pelas rotas abaixo |
| 8 | Rotas publicas: `GET /`, `POST /login`, `POST /sair` | Ficam **antes** do porteiro, por isso nao exigem login |
| 9 | Porteiro (`app.use` com `jwt.verify`) | Tudo que vier **depois** dele exige token valido |
| 10 | `GET /principal` | Protegida |
| 11 | Clientes: `GET/POST/PUT/DELETE /clientes` | Protegida |
| 12 | Veiculos: `mostrarVeiculos` + `GET/POST/PUT/DELETE /veiculos` | Protegida |
| 13 | Agendamentos: `GET/POST/PUT/DELETE /agendamentos` | Protegida |
| 14 | `app.listen` | Sempre por ultimo |

### Funcoes de apoio

```js
function mostrar(nome, dados = {}) {
  const arquivo = path.join(__dirname, 'paginas', `${nome}.html`);
  return Mustache.render(fs.readFileSync(arquivo, 'utf8'), dados);
}
```
Le o `.html`, troca os `{{marcadores}}` pelos dados e devolve a pagina pronta.
Como le o arquivo a cada pedido, editar um `.html` so exige F5 (nao precisa
reiniciar o servidor); editar o `app.js` exige reiniciar.

```js
function criptografar(texto) { ... }   // AES-256-CBC: reversivel
function descriptografar(texto) { ... } // o inverso, usando a mesma chave/IV
```
Usadas no CPF: grava criptografado, exibe descriptografado.

```js
async function excluir(res, tabela, id, volta, motivo) {
  try {
    await db.query(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
    res.redirect(volta);
  } catch (erro) {
    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).send(`...${motivo}...`);
    }
    res.status(500).send('...');
  }
}
```
Reaproveitada nas 3 exclusoes (clientes, veiculos, agendamentos). Sem o
`try/catch`, excluir um registro com vinculo (ex.: cliente com veiculo)
derruba o processo inteiro, porque o Express 4 nao captura erro de `async`
automaticamente.

### Login (`POST /login`)

1. Busca o usuario pelo e-mail.
2. `bcrypt.compare(senha, usuario.senha)` compara a senha digitada com o hash
   salvo, sem nunca descobrir a senha original.
3. Mesma mensagem de erro para e-mail inexistente ou senha errada (nao revela
   quais e-mails existem).
4. Gera um JWT com `expiresIn: '1h'` e guarda em cookie `httpOnly`.
5. `res.redirect` depois do POST (padrao Post/Redirect/Get: o F5 nao reenvia
   o formulario).

### Porteiro

```js
app.use((req, res, next) => {
  try {
    req.usuario = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    next();
  } catch (erro) {
    res.redirect('/');
  }
});
```
`jwt.verify` falha (e cai no `catch`) se o token nao existir, for invalido ou
estiver **expirado**. E assim que a expiracao do token e aplicada, nao o
cookie.

### Padrao repetido nos recursos (clientes, veiculos, agendamentos)

Cada recurso segue o mesmo roteiro:

1. `GET /recurso` - busca no banco, descriptografa o que precisar, decide se
   esta em modo "cadastro" ou "edicao" (`?editar=ID`) e chama `mostrar`.
2. `POST /recurso` - `INSERT`, criptografa o que for sensivel, `redirect`.
3. `PUT /recurso/:id` - `UPDATE`, mesma logica de criptografia, `redirect`.
4. `DELETE /recurso/:id` - chama a funcao `excluir`.

O formulario de cadastro e o de edicao sao **o mesmo** `<form>` no HTML:
`{{acao}}` decide para onde ele envia (`/recurso` ou `/recurso/3`) e
`{{#editando}}` decide se aparece o campo oculto `_method=PUT`.

### Agendamentos: o `JOIN`

```sql
SELECT agendamentos.*, veiculos.placa, veiculos.marca, veiculos.modelo, clientes.nome AS cliente_nome
FROM agendamentos
JOIN veiculos ON veiculos.id = agendamentos.veiculo_id
JOIN clientes ON clientes.id = veiculos.cliente_id
ORDER BY agendamentos.data_agendamento
```
A cadeia e `agendamentos -> veiculos -> clientes`: o agendamento nao guarda o
cliente direto, so chega nele atraves do veiculo. `ORDER BY` garante a
listagem cronologica (RN07), por isso os dados de teste estao propositalmente
fora de ordem no `script.sql`.

## 6. Conceitos-chave para reforcar na live

| Conceito | Onde aparece | Pergunta boa para a turma |
|---|---|---|
| Hash (irreversivel) | senha, `bcrypt` | "Da pra mostrar a senha de volta pro usuario?" (nao) |
| Criptografia (reversivel) | CPF, `crypto` AES-256-CBC | "E o CPF, da pra mostrar de volta?" (sim, com a chave) |
| Token com expiracao | JWT, `expiresIn: '1h'` | "Quem controla a expiracao, o cookie ou o token?" (o token) |
| Consulta parametrizada | todo `db.query(..., [valores])` | "O que aconteceria se concatenassemos o valor direto na string SQL?" (SQL Injection) |
| Escape automatico | `{{marcador}}` do mustache | "Por que cadastrar `<script>` como nome nao executa o script na tela?" |
| Verbos HTTP | GET/POST/PUT/DELETE | "Por que o botao Sair e um formulario POST e nao um link?" |
| Chave estrangeira | `FOREIGN KEY` + `ER_ROW_IS_REFERENCED_2` | "O que acontece se eu tentar excluir um cliente que tem veiculo?" |

## 7. Bibliotecas usadas (`package.json`)

| Biblioteca | Pra que serve | Onde aparece |
|---|---|---|
| `express` | Framework web: cria o servidor, define as rotas (`app.get/post/put/delete`) e le `req.body`/`req.query`/`req.params`. | `app.js` inteiro |
| `mysql2` | Cliente MySQL pra Node. Usamos a versao `/promise` (`require('mysql2/promise')`), que permite `await db.query(...)` em vez de callback. `createPool` mantem um conjunto de conexoes reaproveitaveis. | `app.js` (`db`) |
| `bcryptjs` | Gera e confere hash de senha. `bcrypt.hashSync(senha, 10)` cria o hash (usado no `gerar-valores.js`); `bcrypt.compare(senha, hash)` confere login sem nunca descobrir a senha original. | `gerar-valores.js`, `POST /login` |
| `jsonwebtoken` | Cria e valida o token JWT do login. `jwt.sign(dados, segredo, { expiresIn })` gera o token; `jwt.verify(token, segredo)` confere assinatura e validade (lanca erro se expirado ou invalido). | `POST /login`, middleware "porteiro" |
| `dotenv` | Le o arquivo `.env` e coloca cada variavel em `process.env`. Precisa ser chamado (`require('dotenv').config()`) **antes** de qualquer uso de `process.env`. | 1a linha de `app.js` e de `gerar-valores.js` |
| `cookie-parser` | Le o cabecalho `Cookie` da requisicao e preenche `req.cookies` (um objeto simples), usado pra pegar o token guardado no login. | `app.js` (middleware + porteiro) |
| `mustache` | Motor de template: troca `{{marcador}}` por valores reais dentro do `.html`, com escape automatico contra XSS. `Mustache.render(html, dados)` devolve a pagina pronta. | funcao `mostrar()` em `app.js` |

`crypto` (criptografia do CPF, AES-256-CBC) e `fs`/`path` (ler os arquivos
`.html` e montar caminhos de arquivo) **nao sao bibliotecas instaladas** -
vem prontos dentro do Node, por isso nao aparecem no `package.json`.

## 8. Variaveis de ambiente (`.env`)

| Variavel | Para que serve |
|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexao com o MySQL |
| `PORT` | Porta do servidor Express |
| `JWT_SECRET` | Assina e valida o token de login |
| `CRIPTO_CHAVE` (32 caracteres) | Chave da criptografia AES-256 do CPF |
| `CRIPTO_IV` (16 caracteres) | Vetor de inicializacao da criptografia (fixo aqui por simplificacao didatica) |

`.env` nunca vai para o git (`.gitignore`); `.env.example` e o molde que vai.

## 9. O que NAO tem neste projeto (de proposito)

- Sem CSS e sem JavaScript no navegador.
- Sem `try/catch` em todas as rotas (so nas exclusoes) - fica como ponto de
  discussao sobre maturidade de codigo.
- Sem camada de `routes/controllers/service/repository` - tudo em `app.js`.
- IV fixo na criptografia (em produ cao seria aleatorio por registro).

Esses pontos estao detalhados na secao "Armadilhas e melhorias" do
`docs/roteiro-live-coding.md`, caso queira usa-los como lição de casa ou
discussao de encerramento.

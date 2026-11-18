# Roteiro Daniel - Live Coding Torque (Sistema da Oficina Mecanica)

> Meu roteiro para seguir durante a aula. Versao enxuta: menos explicacao em
> prosa, mais blocos de codigo prontos e lembretes rapidos. Para o contexto
> completo de cada arquivo, ver `docs/estrutura-do-codigo.md`.
>
> **A turma ja fez requisitos e DER.** Nao vamos repetir essa parte - comecamos
> direto no projeto Node e vamos construir **so o codigo e o script do banco**,
> que e o que falta pra eles.
>
> Nos pontos mais densos (criptografia, hash, JWT) deixei caixas de
> **"Explicacao rapida"** com o essencial pra falar na hora, sem precisar
> improvisar.
>
> **Como construir:** por recurso (vertical), nao por camada. Ou seja: faco
> a rota de um recurso no `app.js` **e** o `.html` dele **juntos**, testo no
> navegador, so depois passo pro proximo recurso. O `app.js` **cresce** ao
> longo da aula - nunca fica pronto de uma vez. Todo bloco de codigo abaixo
> comeca com **"Arquivo: ..."** dizendo exatamente onde colar aquele trecho.
> Nao termine o `app.js` inteiro antes de fazer as telas: sem o HTML a
> turma nao ve nada funcionando, so decora codigo.
>
> **Sobre os comentarios `//` dentro dos blocos de codigo:** sao so pra mim,
> lembrete de apoio enquanto falo. A turma **nao** precisa digitar esses
> comentarios - o codigo funciona igual sem eles.
>
> Duracao total estimada: **4h10** com pausas.

## Antes de abrir a sala

- [ ] MySQL rodando, usuario/senha na ponta da lingua.
- [ ] `node -v` ok. Porta 3000 livre.
- [ ] Pasta vazia aberta no VS Code (vou construir do zero).
- [ ] Repositorio `torque` aberto em outra janela, como plano B.
- [ ] Fonte grande no editor.
- [ ] Abas do navegador: `localhost:3000` + MySQL Workbench/CLI.

## Cronograma

| Bloco | Tema | Tempo |
|---|---|---|
| 1 | Abertura: retomar entidades e regras (ja documentadas) | 5 min |
| 2 | Projeto Node + `.env` | 15 min |
| 3 | Banco: tabelas + `gerar-valores.js` | 30 min |
| 4 | Hash x criptografia (conceito) | 10 min |
| 5 | Esqueleto do `app.js` + verbos HTTP | 35 min |
| 6 | Login com JWT + porteiro | 35 min |
| 7 | Tela principal | 10 min |
| 8 | Clientes (CRUD + busca) | 45 min |
| 9 | Veiculos (CRUD + vinculo obrigatorio) | 30 min |
| 10 | Agendamentos (JOIN + ORDER BY) | 35 min |
| 11 | Fechamento e checklist | 15 min |

## Mapa de regras (deixar aberto/projetado)

| Regra | O que entrega | Onde |
|---|---|---|
| RN01 - 3 registros por tabela | `INSERT` com 3 linhas | `database/script.sql` |
| RN02 - erro de login com mensagem | `mostrar('login', { erro })` | `POST /login` |
| RN03 - CPF criptografado | `criptografar` / `descriptografar` | funcoes de apoio + `/clientes` |
| RN04 - nome, links, sair | `principal.html` + `POST /sair` | `GET /principal` |
| RN05 - busca de clientes | `WHERE nome LIKE ?` | `GET /clientes` |
| RN06 - editar cliente | `UPDATE clientes` | `PUT /clientes/:id` |
| RN07 - agendamentos ordenados c/ cliente e veiculo | `JOIN` + `ORDER BY` | `GET /agendamentos` |
| RN08 - alterar data do agendamento | `UPDATE agendamentos SET data_agendamento` | `PUT /agendamentos/:id` |
| RN09 - veiculo associado a cliente | `cliente_id NOT NULL` + `<select>` | `/veiculos` |
| RN10 - token com expiracao | `jwt.sign(..., { expiresIn: '1h' })` | `POST /login` |

---

## Bloco 1 - Abertura (5 min)

A turma ja fez o levantamento de requisitos e o DER (`docs/der.png`). So
retomar rapido antes de ir pro codigo:

1. Projetar o DER que eles ja fizeram (ou `docs/der.png`) e relembrar as 4
   entidades: `usuarios`, `clientes`, `veiculos`, `agendamentos`.
2. Relembrar em 1 frase: `usuarios` nao se relaciona com nada, so serve pra
   login; `veiculos` depende de `clientes`; `agendamentos` depende de
   `veiculos`.
3. Relembrar o ponto LGPD: CPF e dado pessoal, por isso vai criptografado no
   banco - e e exatamente isso que construimos agora.

**Checkpoint:** todo mundo com o DER na tela, pronto pra abrir o editor.

---

## Bloco 2 - Projeto Node (15 min)

```bash
mkdir oficina-live && cd oficina-live
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken dotenv cookie-parser mustache
```

`.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=oficina
PORT=3000
JWT_SECRET=segredo-da-oficina
CRIPTO_CHAVE=12345678901234567890123456789012
CRIPTO_IV=1234567890123456
```

`.gitignore`:
```
node_modules/
.env
```

Perguntas rapidas: por que o `.env` nao vai pro git? Por que a chave tem 32
caracteres e o IV 16?

> **Explicacao rapida - chave e IV:** `CRIPTO_CHAVE` e `CRIPTO_IV` sao os dois
> ingredientes da criptografia do CPF (AES-256-CBC). A chave e o "segredo"
> que embaralha e desembaralha o texto - precisa ter exatamente 32 caracteres
> porque o algoritmo usa chaves de 256 bits (256 bits / 8 = 32 bytes, e cada
> caractere comum = 1 byte). O IV ("vetor de inicializacao") e um valor
> inicial extra pra evitar que o mesmo texto sempre gere a mesma cifra
> visivel letra a letra - precisa ter 16 caracteres (o tamanho do bloco do
> AES, 128 bits = 16 bytes). Se qualquer um dos dois tiver o tamanho errado,
> o Node da erro `Invalid key length`/`Invalid IV length`. Aqui o IV e fixo
> por simplicidade didatica; em producao seria aleatorio por registro.

**Teste agora:** abrir a pasta no explorador/VS Code e confirmar que existem
`package.json`, `node_modules/` e o `.env` que acabei de criar.

**Checkpoint:** `package.json`, `.env`, `.env.example`, `.gitignore`, `node_modules/`.

---

## Bloco 3 - Banco de dados (30 min) -> RN01, RN03

### 3.1 Tabelas

**Arquivo: `database/script.sql`** (criar do zero)
```sql
CREATE DATABASE IF NOT EXISTS oficina;
USE oficina;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100)
);

CREATE TABLE veiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  ano INT,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  veiculo_id INT NOT NULL,
  data_agendamento DATETIME NOT NULL,
  servico VARCHAR(100),
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
);
```

Perguntas: por que `cpf` e `VARCHAR(255)` e nao `CHAR(11)`? Por que `email` e
`UNIQUE`? O que a `FOREIGN KEY` impede?

### 3.2 Por que nao dar pra digitar o hash/CPF a mao

**Arquivo: `gerar-valores.js`** (novo arquivo, na raiz do projeto)
```js
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
```

> **Explicacao rapida - as duas funcoes:**
> - `gerarHashSenha`: usa `bcrypt.hashSync(senha, 10)`. O `10` e o "custo"
>   (quantas vezes o algoritmo embaralha) - mais alto, mais seguro e mais
>   lento. O bcrypt gera um "sal" aleatorio a cada chamada e mistura no hash,
>   por isso a mesma senha produz um hash **diferente** todas as vezes.
> - `criptografarCpf`: usa `crypto.createCipheriv('aes-256-cbc', chave, iv)`.
>   `cifra.update(...)` embaralha o texto e `cifra.final()` fecha o processo
>   (o AES trabalha em blocos fixos e precisa "fechar" o ultimo bloco). Como
>   a chave e o IV sao sempre os mesmos (vem do `.env`), o mesmo CPF sempre
>   gera a mesma cifra.

Rodar **duas vezes** (`node gerar-valores.js`): o hash muda a cada execucao
(tem sal), o CPF criptografado nao muda (mesma chave/IV). Essa diferenca e o
gancho pro Bloco 4.

Copiar os valores impressos e colar nos `INSERT`:

**Arquivo: `database/script.sql`** (continuando o mesmo arquivo da secao 3.1,
embaixo dos `CREATE TABLE`)
```sql
INSERT INTO usuarios (nome, email, senha) VALUES
  ('Administrador', 'admin@oficina.com', '<hash colado>'),
  ('Carlos Mecanico', 'carlos@oficina.com', '<mesmo hash>'),
  ('Fernanda Atendente', 'fernanda@oficina.com', '<mesmo hash>');

INSERT INTO clientes (nome, cpf, telefone, email) VALUES
  ('Joao da Silva', '<cpf1 colado>', '(11) 90000-1111', 'joao.silva@email.com'),
  ('Maria Souza', '<cpf2 colado>', '(11) 90000-2222', 'maria.souza@email.com'),
  ('Pedro Oliveira', '<cpf3 colado>', '(11) 90000-3333', 'pedro.oliveira@email.com');

INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES
  (1, 'ABC1D23', 'Volkswagen', 'Gol', 2018),
  (2, 'DEF4E56', 'Fiat', 'Palio', 2015),
  (3, 'GHI7F89', 'Chevrolet', 'Onix', 2021);

INSERT INTO agendamentos (veiculo_id, data_agendamento, servico) VALUES
  (2, '2026-11-05 09:00:00', 'Troca de oleo'),
  (1, '2026-10-20 14:30:00', 'Alinhamento e balanceamento'),
  (3, '2026-10-28 08:00:00', 'Revisao dos freios');
```

Pontos: `cliente_id`/`veiculo_id` precisam existir (1,2,3). Datas fora de
ordem de proposito, pra provar o `ORDER BY` no Bloco 10. Mesma senha pros 3
usuarios so pra facilitar o teste.

Carregar (eles usam MySQL Workbench): abrir `database/script.sql` no
Workbench (File > Open SQL Script) e rodar com o raio (⚡) ou Ctrl+Shift+Enter
para executar tudo. Se preferir terminal: `mysql -u root -p < database/script.sql`.

Conferir (no Workbench, numa nova aba de query):
```sql
SELECT id, nome, cpf FROM clientes;    -- CPF ilegivel = RN03
SELECT COUNT(*) FROM agendamentos;     -- 3 = RN01
```

Se rodar o script de novo: `DROP DATABASE oficina;` antes (o `CREATE TABLE`
falha se a tabela ja existir).

**Checkpoint:** banco `oficina`, 4 tabelas, 3 linhas em cada.

---

## Bloco 4 - Hash x criptografia (10 min, so conceito)

| | Senha | CPF |
|---|---|---|
| Tecnica | Hash (bcrypt) | Criptografia (AES-256-CBC) |
| Reversivel? | Nao, nunca | Sim, com a chave |
| Por que | Só precisamos comparar | Precisamos exibir de volta |
| Codigo | `bcrypt.compare(senha, hash)` | `descriptografar(valor)` |

> **Explicacao rapida:** hash e uma via de **mao unica** - vira um monte de
> caracteres e nunca volta a ser a senha original. Por isso pra "checar" a
> senha no login a gente nao descriptografa nada: o `bcrypt.compare` pega a
> senha digitada, aplica o mesmo processo e **compara os hashes**. Ja a
> criptografia (AES) e uma via de **mao dupla** - com a chave certa, volta a
> ser o texto original. Usamos ela no CPF porque, diferente da senha,
> precisamos **mostrar o CPF de novo** na tela de clientes.

Pergunta: "Se o gestor pedisse pra mostrar a senha na tela, daria? E o CPF?"

---

## Bloco 5 - Esqueleto do `app.js` + verbos HTTP (35 min)

**Arquivo: `app.js`** (novo arquivo, na raiz do projeto - esse arquivo vai
crescer ao longo de toda a aula, sempre acima do `app.listen`)
```js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const Mustache = require('mustache');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Faz PUT e DELETE funcionarem em formularios HTML (que so mandam GET/POST)
app.use((req, res, next) => {
  const metodo = String(req.body?._method || '').toUpperCase();
  if (req.method === 'POST' && ['PUT', 'DELETE'].includes(metodo)) {
    req.method = metodo;
  }
  next();
});

// "Estoque" de conexoes com o MySQL, reaproveitadas pelas rotas. dateStrings
// faz as colunas DATETIME chegarem como texto, nao como objeto Date do Node.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

// Le paginas/<nome>.html, troca os {{marcadores}} pelos dados (com escape
// automatico contra XSS) e devolve o HTML pronto pra mandar ao navegador.
function mostrar(nome, dados = {}) {
  const arquivo = path.join(__dirname, 'paginas', `${nome}.html`);
  return Mustache.render(fs.readFileSync(arquivo, 'utf8'), dados);
}

// Criptografia reversivel (AES-256-CBC) do CPF [RN03]: grava criptografado
// no banco, descriptografa so na hora de mostrar na tela.
function criptografar(texto) {
  const cifra = crypto.createCipheriv('aes-256-cbc', process.env.CRIPTO_CHAVE, process.env.CRIPTO_IV);
  return cifra.update(texto, 'utf8', 'hex') + cifra.final('hex');
}
function descriptografar(texto) {
  const decifra = crypto.createDecipheriv('aes-256-cbc', process.env.CRIPTO_CHAVE, process.env.CRIPTO_IV);
  return decifra.update(texto, 'hex', 'utf8') + decifra.final('utf8');
}

const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log(`Oficina rodando em http://localhost:${porta}`));
```

Regra de organizacao a repetir: `app.listen` sempre por ultimo; tudo que
construirmos entra acima dele.

**Teste agora:** `npm start` no terminal -> deve aparecer
`Oficina rodando em http://localhost:3000`. Abrir `localhost:3000` no
navegador -> vai aparecer **"Cannot GET /"** (normal, ainda nao criamos
nenhuma rota). Se o terminal der erro, confira o `.env` (Bloco 2).

> **Explicacao rapida - `createPool` e `dateStrings`:** em vez de abrir uma
> conexao nova a cada consulta (lento), o `createPool` cria um "estoque" de
> conexoes prontas que o `mysql2` reaproveita. `dateStrings: true` faz as
> colunas `DATETIME` chegarem como **texto** (`'2026-11-05 09:00:00'`) em vez
> de objeto `Date` do Node - isso evita bug de fuso horario e permite usar
> `.slice`/`.replace` direto na data (vamos usar isso no Bloco 10).

> **Explicacao rapida - `mostrar`/mustache:** o `Mustache.render(html, dados)`
> le o `.html` como texto puro e troca cada `{{chave}}` pelo valor
> correspondente em `dados`, escapando HTML automaticamente (protege contra
> XSS). Como o arquivo e lido de novo a cada chamada, editar um `.html` so
> precisa de F5; editar o `app.js` precisa reiniciar o servidor.

> **Explicacao rapida - `criptografar`/`descriptografar`:** mesma logica do
> `gerar-valores.js` (Bloco 3), só que aqui ficam disponiveis pra qualquer
> rota do `app.js` usar - `criptografar` antes de gravar no banco,
> `descriptografar` depois de ler, antes de mostrar na tela.

Verbos HTTP (quadro rapido):

| Verbo | Uso | Exemplo |
|---|---|---|
| GET | Ler | `GET /clientes?busca=maria` |
| POST | Criar (e login/logout) | `POST /clientes` |
| PUT | Atualizar | `PUT /clientes/3` |
| DELETE | Remover | `DELETE /clientes/3` |

> **Explicacao rapida - middleware de `_method`:** o `<form>` do HTML so sabe
> mandar `GET` ou `POST` - nao existe `<form method="PUT">`. Pra simular PUT
> e DELETE, o formulario manda um POST normal com um campo escondido
> `_method=PUT` (ou `DELETE`). Esse middleware roda **antes de todas as
> rotas**, le esse campo em `req.body` e troca `req.method` por dentro do
> Express, como se o navegador tivesse mandado o verbo certo desde o inicio.

Mostrar no DevTools (Network) que o form manda POST com `_method=DELETE` e o
Express ve DELETE. Pergunta: por que o middleware de `_method` vem **depois**
do `urlencoded`? (`req.body` so existe depois dele.)

⚠️ Se "Excluir" der "Metodo nao permitido": outro processo na porta 3000.
`npm start` de novo depois de matar o processo antigo.

**Checkpoint:** servidor sobe sem erro, ainda sem rotas ("Cannot GET /").

---

## Bloco 6 - Login com JWT (35 min) -> RN02, RN10

**Arquivo: `paginas/login.html`** (novo arquivo)
```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Oficina - Login</title>
  </head>
  <body>
    <h1>Oficina Mecanica - Login</h1>
    <form method="POST" action="/login">
      <input
        type="email"
        name="email"
        placeholder="E-mail"
        required
      />
      <input
        type="password"
        name="senha"
        placeholder="Senha"
        required
      />
      <button>Entrar</button>
    </form>
    <p>{{erro}}</p>
  </body>
</html>
```

**Arquivo: `app.js`** (adicionar embaixo das funcoes de apoio - `mostrar`,
`criptografar`, `descriptografar` -, sempre acima do `app.listen`)
```js
app.get('/', (req, res) => res.send(mostrar('login')));

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const usuario = usuarios[0];

  // Mesma mensagem para e-mail inexistente ou senha errada [RN02], e
  // bcrypt.compare confere a senha sem nunca descobrir a original.
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.send(mostrar('login', { erro: 'E-mail ou senha invalidos' }));
  }

  const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/principal');
});

app.post('/sair', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});
```

**Teste agora** (reiniciar o servidor: `Ctrl+C` + `npm start`, ja que mudamos
o `app.js`): abrir `localhost:3000` -> deve aparecer a tela de login. Tentar
com senha errada -> mensagem "E-mail ou senha invalidos". Login certo
(`admin@oficina.com` / `123456`) -> da erro porque `/principal` ainda nao
existe, mas repare no DevTools (Application > Cookies) que o cookie `token`
foi criado.

**Arquivo: `app.js`** (o "porteiro" - adicionar logo embaixo das rotas
`GET /`, `POST /login` e `POST /sair` que acabamos de criar)
```js
// "Porteiro": tudo que vier abaixo desta linha exige login. jwt.verify falha
// (e cai no catch) se o token nao existir, for invalido ou tiver expirado.
app.use((req, res, next) => {
  try {
    req.usuario = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    next();
  } catch (erro) {
    res.redirect('/');
  }
});
```

> **Explicacao rapida - consulta parametrizada:** o `?` no SQL e preenchido
> pelo `mysql2` de forma segura, tratando o valor sempre como **dado**, nunca
> como parte do comando. Se concatenassemos o e-mail direto na string
> (`'...WHERE email = ' + email`), alguem poderia digitar algo como
> `' OR '1'='1` e burlar o login (SQL Injection).

> **Explicacao rapida - JWT:** `jwt.sign(dados, segredo, { expiresIn })` gera
> um token com 3 partes (cabecalho, dados, assinatura) que qualquer um
> consegue **ler** (e so base64), mas ninguem consegue **forjar** sem saber o
> `JWT_SECRET`. `jwt.verify` confere a assinatura e, se o `expiresIn` ja
> passou, joga um erro mesmo que a assinatura esteja correta - e assim que a
> expiracao e garantida. Por isso nunca colocamos senha/CPF dentro do token.

Mesma mensagem de erro pra e-mail ou senha errados. Colar o token em jwt.io e
mostrar `id`, `nome`, `iat`, `exp` (conteudo publico, assinatura que protege).

> **Explicacao rapida - cookie `httpOnly`:** guardamos o token num cookie com
> `httpOnly: true`, o que impede o JavaScript da propria pagina de ler esse
> cookie (`document.cookie` nao mostra ele). Protege contra um ataque XSS
> roubar o token - mesmo que alguem injete um script malicioso na pagina, ele
> nao consegue acessar o cookie.

> **Explicacao rapida - o "porteiro":** e um `app.use` sem rota definida, por
> isso roda em **toda** requisicao que chegar depois dele. Tenta validar o
> token do cookie; se der certo, guarda os dados em `req.usuario` e deixa
> passar (`next()`); se der qualquer erro (sem token, token adulterado ou
> expirado), manda pro login. A posicao no arquivo importa: rotas escritas
> **antes** dele ficam publicas, as de **depois** ficam protegidas.

**Teste agora** (reiniciar o servidor de novo): login certo -> continua dando
erro de pagina inexistente, mas agora e porque `/principal` nao existe
(o porteiro deixou passar). Tentar acessar `localhost:3000/clientes` direto,
sem logar antes -> **redireciona pro login** (o porteiro bloqueou).

**Testar expiracao:** troco `'1h'` por `'10s'` no `jwt.sign`, reinicio, faco
login, espero 10 segundos, recarrego a pagina -> volta pro login. Depois
**volto para `'1h'`** e reinicio de novo.

**Checkpoint:** login errado mostra mensagem; login certo cria o cookie;
acessar qualquer rota sem logar redireciona pro login.

---

## Bloco 7 - Tela principal (10 min) -> RN04

**Arquivo: `paginas/principal.html`** (novo arquivo)
```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Oficina - Principal</title>
  </head>
  <body>
    <h1>Ola, {{nome}}</h1>
    <p>
      <a href="/clientes">Clientes</a> | <a href="/veiculos">Veiculos</a> |
      <a href="/agendamentos">Agendamentos</a>
    </p>
    <form method="POST" action="/sair">
      <button>Sair</button>
    </form>
  </body>
</html>
```

**Arquivo: `app.js`** (adicionar logo embaixo do porteiro - essa e a
primeira rota protegida)
```js
app.get('/principal', (req, res) => res.send(mostrar('principal', { nome: req.usuario.nome })));
```

Pergunta: por que "Sair" e um POST e nao um link?

**Teste agora** (reiniciar o servidor): fazer login de novo -> agora
redireciona pra `/principal` e mostra **"Ola, Administrador"** com os 3
links e o botao Sair. Clicar em Sair -> volta pro login. Apertar "voltar" no
navegador e tentar `/principal` de novo -> login (o cookie foi limpo).

**Checkpoint:** login -> principal -> sair funciona de ponta a ponta.

---

## Bloco 8 - Clientes (45 min) -> RN03, RN05, RN06

### 8.1 Listagem + busca

**Arquivo: `paginas/clientes.html`** (novo arquivo)
```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Oficina - Clientes</title>
  </head>
  <body>
    <h1>Clientes</h1>
    <p><a href="/principal">Voltar</a></p>

    <form method="GET" action="/clientes">
      <input
        type="text"
        name="busca"
        placeholder="Buscar por nome"
        value="{{busca}}"
      />
      <button>Buscar</button>
    </form>

    <table border="1">
      <tr>
        <th>Nome</th>
        <th>CPF</th>
        <th>Telefone</th>
        <th>E-mail</th>
      </tr>
      {{#clientes}}
      <tr>
        <td>{{nome}}</td>
        <td>{{cpf}}</td>
        <td>{{telefone}}</td>
        <td>{{email}}</td>
      </tr>
      {{/clientes}}
    </table>
  </body>
</html>
```

**Arquivo: `app.js`** (adicionar embaixo da rota `GET /principal`, ja que
essa tambem e protegida)
```js
app.get('/clientes', async (req, res) => {
  const busca = req.query.busca || '';
  const [lista] = await db.query('SELECT * FROM clientes WHERE nome LIKE ?', [`%${busca}%`]);
  const clientes = lista.map((cliente) => ({ ...cliente, cpf: descriptografar(cliente.cpf) }));

  res.send(mostrar('clientes', { busca, clientes }));
});
```

**Teste agora** (reiniciar o servidor): abrir `/clientes` (pelo link
"Clientes" na principal) -> ver os 3 clientes do `script.sql`, com o CPF
**legivel** na tela. Buscar "maria" -> so a Maria aparece. Conferir no
MySQL (`SELECT cpf FROM clientes;`) que o CPF la esta criptografado -
so o back sabe descriptografar.

### 8.2 Cadastrar (RN03)

**Arquivo: `paginas/clientes.html`** (adicionar depois da `</table>`, antes
do `</body>`)
```html
<h2>Cadastrar cliente</h2>
<form method="POST" action="/clientes">
  <input
    type="text"
    name="nome"
    placeholder="Nome"
    required
  />
  <input
    type="text"
    name="cpf"
    placeholder="CPF"
    required
  />
  <input
    type="text"
    name="telefone"
    placeholder="Telefone"
  />
  <input
    type="email"
    name="email"
    placeholder="E-mail"
  />
  <button>Cadastrar</button>
</form>
```

**Arquivo: `app.js`** (adicionar embaixo da rota `GET /clientes` que
acabamos de criar)
```js
app.post('/clientes', async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  await db.query('INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)',
    [nome, criptografar(cpf), telefone, email]);
  res.redirect('/clientes');
});
```

**Teste agora:** cadastrar um cliente novo -> aparece na lista. Conferir no
MySQL que o CPF dele tambem esta ilegivel. Aproveitar pra cadastrar um com
nome `<script>alert(1)</script>` -> aparece como **texto** na tela, nao
executa (demo de XSS - o `{{ }}` do mustache escapa sozinho).

### 8.3 Editar (RN06)

Ideia: o **mesmo** `<form>` de cadastro serve pra editar - so muda o que ele
manda e pra onde.

**Arquivo: `paginas/clientes.html`** - este bloco **substitui dois trechos
antigos de uma vez**:
1. a tabela toda do passo 8.1 (da linha `<table border="1">` até a
   `</table>` que fecha ela);
2. o formulario de cadastro todo do passo 8.2 (do `<h2>Cadastrar
   cliente</h2>` até o `</form>` que fecha ele).

A tabela em si **quase nao muda** - e a mesma do 8.1, so com **uma coluna
nova no final**: o cabecalho ganha um `<th></th>` vazio e cada linha ganha
um `<td>` com o link "Editar". O resto da tabela (as 4 colunas de
nome/cpf/telefone/email) fica identico.

Apague esses dois blocos antigos (ficam um embaixo do outro no arquivo) e
cole este no lugar dos dois, por completo:
```html
<table border="1">
  <tr>
    <th>Nome</th>
    <th>CPF</th>
    <th>Telefone</th>
    <th>E-mail</th>
    <th></th> <!-- ADICIONAR ISSO AQUI: <th></th> novo no final -->
  </tr>
  {{#clientes}}
  <tr>
    <td>{{nome}}</td>
    <td>{{cpf}}</td>
    <td>{{telefone}}</td>
    <td>{{email}}</td>
    <td><a href="/clientes?editar={{id}}">Editar</a></td> <!-- ADICIONAR ISSO AQUI: <td> novo no final -->
  </tr>
  {{/clientes}}
</table>

<h2>{{#editando}}Editar{{/editando}}{{^editando}}Cadastrar{{/editando}} cliente</h2>
<form method="POST" action="{{acao}}">
  {{#editando}}<input type="hidden" name="_method" value="PUT" />{{/editando}}
  <input
    type="text"
    name="nome"
    placeholder="Nome"
    value="{{form.nome}}"
    required
  />
  <input
    type="text"
    name="cpf"
    placeholder="CPF"
    value="{{form.cpf}}"
    required
  />
  <input
    type="text"
    name="telefone"
    placeholder="Telefone"
    value="{{form.telefone}}"
  />
  <input
    type="email"
    name="email"
    placeholder="E-mail"
    value="{{form.email}}"
  />
  <button>{{#editando}}Salvar{{/editando}}{{^editando}}Cadastrar{{/editando}}</button>
</form>
```

> **Explicacao rapida - `{{#editando}}`/`{{^editando}}`:** e o mesmo
> `<form>` usado pra cadastrar e editar. `{{#editando}}...{{/editando}}`
> mostra o trecho **só se** `editando` for verdadeiro; `{{^editando}}` mostra
> **só se** for falso/vazio - e o inverso. `{{acao}}` decide para onde o
> formulario envia (`/clientes` ou `/clientes/3`) e `{{form.nome}}` entra no
> objeto `form` pra pegar o valor atual do cliente (vazio no cadastro,
> preenchido na edicao).

São **duas edicoes separadas** no `app.js`:

**Edicao 1 - dentro da rota `GET /clientes`** que ja existe desde o passo 8.1.
As linhas de cima (`busca`, `db.query`, `.map`) **nao mudam** - estao aqui so
pra voce achar o lugar certo. O que muda e so a ultima linha, de dentro pra
fora:

1. **APAGAR** a linha `res.send(mostrar('clientes', { busca, clientes }));`
   que ja estava la (passo 8.1);
2. **ADICIONAR** no lugar dela as linhas marcadas abaixo - o `const editar` e
   o `res.send` novo (maior). Nao fica com os dois `res.send` - so um.

```js
app.get('/clientes', async (req, res) => {
  const busca = req.query.busca || '';
  const [lista] = await db.query('SELECT * FROM clientes WHERE nome LIKE ?', [`%${busca}%`]);
  const clientes = lista.map((cliente) => ({ ...cliente, cpf: descriptografar(cliente.cpf) }));

  // ate aqui e igual ao passo 8.1 - nada muda

  // ADICIONAR ISSO AQUI (no lugar do res.send antigo, que foi apagado):
  const editar = clientes.find((cliente) => String(cliente.id) === req.query.editar);

  res.send(mostrar('clientes', {
    busca,
    clientes,
    editando: Boolean(editar),
    acao: editar ? `/clientes/${editar.id}` : '/clientes',
    form: editar || {},
  }));
});
```

**Edicao 2 - rota nova**, adicionar embaixo do `POST /clientes` do passo 8.2
```js
app.put('/clientes/:id', async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  await db.query('UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ? WHERE id = ?',
    [nome, criptografar(cpf), telefone, email, req.params.id]);
  res.redirect('/clientes');
});
```

**Teste agora:** clicar em "Editar" num cliente -> formulario vem preenchido
e o botao muda pra "Salvar". Trocar o telefone e salvar -> volta pra lista
com o telefone atualizado. Conferir no MySQL.

⚠️ Armadilha: esquecer `criptografar(cpf)` no `UPDATE` - desafio pra turma
achar o erro (CPF fica salvo sem criptografar).

### 8.4 Excluir

**Arquivo: `paginas/clientes.html`** - dentro da `<tr>` montada no passo 8.3,
troque a **ultima `<td>`** (a que tem so o link "Editar") por esta. Nao e
coluna nova, nem muda o cabecalho - e so o **conteudo** dessa `<td>` que
ganha o form de excluir do lado do link "Editar" que ja estava la
```html
<td>
  <a href="/clientes?editar={{id}}">Editar</a>
  <!-- ADICIONAR ISSO AQUI: form de excluir, do lado do link que ja existia -->
  <form method="POST" action="/clientes/{{id}}">
    <input type="hidden" name="_method" value="DELETE" />
    <button>Excluir</button>
  </form>
</td>
```

**Arquivo: `app.js`** (a funcao `excluir` vai junto das outras funcoes de
apoio - `mostrar`, `criptografar`, `descriptografar`, la no Bloco 5, **antes**
de qualquer rota; a rota `DELETE` entra embaixo do `PUT /clientes/:id`)
```js
// Exclui um registro. Sem o try/catch, se o MySQL recusar por vinculo de
// chave estrangeira (ex.: cliente com veiculo), o Express 4 nao captura o
// erro numa funcao async e derruba o servidor inteiro.
async function excluir(res, tabela, id, volta, motivo) {
  try {
    await db.query(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
    res.redirect(volta);
  } catch (erro) {
    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).send(`<p>Nao foi possivel excluir: ${motivo}.</p><p><a href="${volta}">Voltar</a></p>`);
    }
    console.error(erro);
    res.status(500).send(`<p>Erro ao excluir.</p><p><a href="${volta}">Voltar</a></p>`);
  }
}
```
```js
app.delete('/clientes/:id', async (req, res) => {
  await excluir(res, 'clientes', req.params.id, '/clientes', 'o cliente possui veiculos cadastrados');
});
```

> **Explicacao rapida - funcao `excluir`:** sem `try/catch`, se o MySQL
> recusar o `DELETE` (ex.: cliente com veiculo vinculado pela
> `FOREIGN KEY`), o Express 4 nao sabe lidar com esse erro numa funcao
> `async` e **derruba o servidor inteiro**. O `try/catch` pega esse erro
> especifico (codigo `ER_ROW_IS_REFERENCED_2` = "tem vinculo"), devolve uma
> mensagem amigavel (status 409) e deixa o servidor de pe; qualquer outro
> erro inesperado cai no 500.

**Teste agora:** excluir um cliente **sem** veiculo -> some da lista.
Excluir um cliente **com** veiculo (ex.: Joao da Silva) -> aparece a
mensagem "Nao foi possivel excluir: o cliente possui veiculos cadastrados",
e o servidor continua rodando. (Opcional, 🕵️: comentar o `try/catch` por um
instante pra mostrar o servidor caindo, depois devolver.)

**Checkpoint:** CRUD completo de clientes com busca, cadastro, edicao e
exclusao com tratamento de vinculo.

---

## Bloco 9 - Veiculos (30 min) -> RN09

Mesmo padrao do Bloco 8, com a novidade: o back entrega **duas listas**
(veiculos + clientes, pra alimentar o `<select>` do dono).

### 9.1 Listagem + cadastro (com select de cliente obrigatorio)

**Arquivo: `paginas/veiculos.html`** (novo arquivo)
```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Oficina - Veiculos</title>
  </head>
  <body>
    <h1>Veiculos</h1>
    <p><a href="/principal">Voltar</a></p>

    <table border="1">
      <tr>
        <th>Placa</th>
        <th>Marca</th>
        <th>Modelo</th>
        <th>Ano</th>
        <th>Cliente</th>
        <th></th>
      </tr>
      {{#veiculos}}
      <tr>
        <td>{{placa}}</td>
        <td>{{marca}}</td>
        <td>{{modelo}}</td>
        <td>{{ano}}</td>
        <td>{{cliente_id}}</td>
        <td><a href="/veiculos?editar={{id}}">Editar</a></td>
      </tr>
      {{/veiculos}}
    </table>

    <h2>{{#editando}}Editar{{/editando}}{{^editando}}Cadastrar{{/editando}} veiculo</h2>
    <form method="POST" action="{{acao}}">
      {{#editando}}<input type="hidden" name="_method" value="PUT" />{{/editando}}
      <select name="cliente_id" required>
        <option value="">Selecione o cliente</option>
        {{#clientes}}
        <option value="{{id}}" {{selecionado}}>{{nome}}</option>
        {{/clientes}}
      </select>
      <input
        type="text"
        name="placa"
        placeholder="Placa"
        value="{{form.placa}}"
        required
      />
      <input
        type="text"
        name="marca"
        placeholder="Marca"
        value="{{form.marca}}"
      />
      <input
        type="text"
        name="modelo"
        placeholder="Modelo"
        value="{{form.modelo}}"
      />
      <input
        type="number"
        name="ano"
        placeholder="Ano"
        value="{{form.ano}}"
      />
      <button>{{#editando}}Salvar{{/editando}}{{^editando}}Cadastrar{{/editando}}</button>
    </form>
    <p>{{erro}}</p>
  </body>
</html>
```

**Arquivo: `app.js`** (adicionar embaixo da funcao `excluir`, antes das
rotas de clientes ou depois - tanto faz, desde que seja uma funcao de apoio)
```js
// Busca os dados e preenche a pagina. E uma funcao (nao so a rota GET)
// porque tambem e chamada pelas validacoes do POST/PUT pra reexibir a
// pagina com uma mensagem de erro, sem repetir os dois SELECT.
async function mostrarVeiculos(req, res, erro = '') {
  const [veiculos] = await db.query('SELECT * FROM veiculos');
  const [listaClientes] = await db.query('SELECT id, nome FROM clientes');
  const editar = veiculos.find((v) => String(v.id) === req.query.editar);

  const clientes = listaClientes.map((cliente) => ({
    ...cliente,
    selecionado: editar && cliente.id === editar.cliente_id ? 'selected' : '',
  }));

  res.send(mostrar('veiculos', {
    veiculos, clientes, erro,
    editando: Boolean(editar),
    acao: editar ? `/veiculos/${editar.id}` : '/veiculos',
    form: editar || {},
  }));
}
```

**Arquivo: `app.js`** (as rotas - adicionar embaixo das rotas de clientes
do Bloco 8)
```js
app.get('/veiculos', (req, res) => mostrarVeiculos(req, res));

app.post('/veiculos', async (req, res) => {
  const { cliente_id, placa, marca, modelo, ano } = req.body;
  if (!cliente_id) return mostrarVeiculos(req, res, 'cliente_id e obrigatorio');
  await db.query('INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES (?, ?, ?, ?, ?)',
    [cliente_id, placa, marca, modelo, ano || null]);
  res.redirect('/veiculos');
});
```

> **Explicacao rapida - defesa em 3 camadas:** `required` no `<select>`
> (HTML), `if (!cliente_id)` no `app.js` (back) e `cliente_id NOT NULL` +
> `FOREIGN KEY` na tabela (banco). As 3 fazem a mesma checagem porque **nao
> dá pra confiar so no navegador** - alguem pode remover o `required` no
> DevTools e mandar a requisicao sem cliente, por isso o back confere de
> novo antes de gravar.

**Teste agora:** abrir `/veiculos` -> ver os 3 veiculos do `script.sql`
(ainda mostrando `cliente_id` como numero). Cadastrar um veiculo pra Maria
(selecionando ela no `<select>`) -> aparece na lista. Tentar mandar o
formulario sem selecionar cliente (remova o `required` pelo DevTools) ->
o back bloqueia e mostra "cliente_id e obrigatorio".

Detalhe: `ano || null` - campo numerico vazio chega como `''`, e o MySQL
rejeita `''` num `INT`.

### 9.2 Editar e excluir

**Arquivo: `paginas/veiculos.html`** - dentro da `<tr>` montada no passo 9.1,
troque a **ultima `<td>`** (a que tem so o link "Editar") por esta. Nao e
coluna nova, nem muda o cabecalho - e so o **conteudo** dessa `<td>` que
ganha o form de excluir do lado do link "Editar" que ja estava la
```html
<td>
  <a href="/veiculos?editar={{id}}">Editar</a>
  <!-- ADICIONAR ISSO AQUI: form de excluir, do lado do link que ja existia -->
  <form method="POST" action="/veiculos/{{id}}">
    <input type="hidden" name="_method" value="DELETE" />
    <button>Excluir</button>
  </form>
</td>
```

**Arquivo: `app.js`** (adicionar embaixo do `POST /veiculos` do passo 9.1)
```js
app.put('/veiculos/:id', async (req, res) => {
  const { cliente_id, placa, marca, modelo, ano } = req.body;
  if (!cliente_id) return mostrarVeiculos(req, res, 'cliente_id e obrigatorio');
  await db.query('UPDATE veiculos SET cliente_id = ?, placa = ?, marca = ?, modelo = ?, ano = ? WHERE id = ?',
    [cliente_id, placa, marca, modelo, ano || null, req.params.id]);
  res.redirect('/veiculos');
});

app.delete('/veiculos/:id', async (req, res) => {
  await excluir(res, 'veiculos', req.params.id, '/veiculos', 'o veiculo possui agendamentos');
});
```

**Teste agora:** editar o veiculo que acabei de cadastrar, trocando o dono
(o `<select>` ja vem com o dono atual marcado por causa do `selecionado`)
-> salvar e confirmar na lista. Excluir um veiculo **com** agendamento (ex.:
`ABC1D23`, `DEF4E56` ou `GHI7F89` - os 3 do `script.sql` ja tem agendamento)
-> mensagem de vinculo, igual aconteceu com cliente. Excluir o veiculo que
acabei de cadastrar pra Maria (sem agendamento ainda) -> some da lista.

**Checkpoint:** CRUD de veiculos com select de dono funcionando.

---

## Bloco 10 - Agendamentos (35 min) -> RN07, RN08

### 10.1 Listagem ordenada (com JOIN) + cadastro

**Arquivo: `paginas/agendamentos.html`** (novo arquivo)
```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Oficina - Agendamentos</title>
  </head>
  <body>
    <h1>Agendamentos</h1>
    <p><a href="/principal">Voltar</a></p>

    <table border="1">
      <tr>
        <th>Data</th>
        <th>Servico</th>
        <th>Veiculo</th>
        <th>Cliente</th>
      </tr>
      {{#agendamentos}}
      <tr>
        <td>{{data_br}}</td>
        <td>{{servico}}</td>
        <td>{{placa}} - {{marca}} {{modelo}}</td>
        <td>{{cliente_nome}}</td>
      </tr>
      {{/agendamentos}}
    </table>

    <h2>Cadastrar agendamento</h2>
    <form method="POST" action="/agendamentos">
      <select name="veiculo_id" required>
        <option value="">Selecione o veiculo</option>
        {{#veiculos}}
        <option value="{{id}}">{{placa}} - {{marca}} {{modelo}}</option>
        {{/veiculos}}
      </select>
      <input
        type="datetime-local"
        name="data_agendamento"
        required
      />
      <input
        type="text"
        name="servico"
        placeholder="Servico"
      />
      <button>Cadastrar</button>
    </form>
  </body>
</html>
```

**Arquivo: `app.js`** (adicionar embaixo das rotas de veiculos do Bloco 9)
```js
app.get('/agendamentos', async (req, res) => {
  // agendamentos so guarda veiculo_id; chegamos no cliente atraves do
  // veiculo (agendamentos -> veiculos -> clientes) [RN07].
  const [lista] = await db.query(
    `SELECT agendamentos.*, veiculos.placa, veiculos.marca, veiculos.modelo, clientes.nome AS cliente_nome
     FROM agendamentos
     JOIN veiculos ON veiculos.id = agendamentos.veiculo_id
     JOIN clientes ON clientes.id = veiculos.cliente_id
     ORDER BY agendamentos.data_agendamento`);
  const [veiculos] = await db.query('SELECT * FROM veiculos');

  const agendamentos = lista.map((a) => ({
    ...a,
    data_br: new Date(a.data_agendamento).toLocaleString('pt-BR'),
    data_input: a.data_agendamento.slice(0, 16).replace(' ', 'T'),
  }));

  res.send(mostrar('agendamentos', { agendamentos, veiculos }));
});

app.post('/agendamentos', async (req, res) => {
  const { veiculo_id, data_agendamento, servico } = req.body;
  await db.query('INSERT INTO agendamentos (veiculo_id, data_agendamento, servico) VALUES (?, ?, ?)',
    [veiculo_id, data_agendamento.replace('T', ' '), servico]);
  res.redirect('/agendamentos');
});
```

> **Explicacao rapida - o `JOIN`:** `agendamentos` so guarda `veiculo_id`,
> nao guarda o cliente. O primeiro `JOIN` junta cada agendamento com o seu
> veiculo (`veiculos.id = agendamentos.veiculo_id`); o segundo junta esse
> veiculo com o cliente dono (`clientes.id = veiculos.cliente_id`). E a
> cadeia `agendamentos -> veiculos -> clientes` do DER virando SQL.
> `clientes.nome AS cliente_nome` é so um apelido, pra nao confundir com o
> nome do veiculo numa mesma linha. `dateStrings: true` no pool (Bloco 5) e
> o motivo de dar pra usar `.slice`/`.replace` direto na data.

**Teste agora:** abrir `/agendamentos` -> ver os 3 agendamentos do
`script.sql` **ja ordenados por data** (20/10 -> 28/10 -> 05/11), mesmo eles
estando fora de ordem no `INSERT`. Pra provar o `ORDER BY`, comente a linha
`ORDER BY agendamentos.data_agendamento` por um instante, reinicie e mostre
que a ordem muda - depois descomente e reinicie de novo. Cadastrar um
agendamento novo pro veiculo da Maria -> aparece na lista, na posicao certa.

### 10.2 Alterar data (RN08) e excluir

**Arquivo: `paginas/agendamentos.html`** - duas mudancas na tabela do passo
10.1:
1. no `<tr>` do cabecalho (o que tem `<th>Data</th>` etc.), acrescente
   `<th>Alterar data</th><th></th>` antes do `</tr>`;
2. no `<tr>` de dentro do `{{#agendamentos}}` (a que tem `{{data_br}}` etc.),
   acrescente estas duas `<td>` antes do `</tr>`

Nos dois casos e so **acrescentar** - as colunas e celulas que ja existiam
(Data, Servico, Veiculo, Cliente) ficam exatamente como estao, essas duas
entram depois, no final da linha:
```html
<tr>
  <th>Data</th>
  <th>Servico</th>
  <th>Veiculo</th>
  <th>Cliente</th>
  <th>Alterar data</th> <!-- ADICIONAR ISSO AQUI: as duas ultimas <th> -->
  <th></th> <!-- ADICIONAR ISSO AQUI: as duas ultimas <th> -->
</tr>
```
```html
{{#agendamentos}}
<tr>
  <td>{{data_br}}</td>
  <td>{{servico}}</td>
  <td>{{placa}} - {{marca}} {{modelo}}</td>
  <td>{{cliente_nome}}</td>
  <!-- ADICIONAR ISSO AQUI: as duas <td> abaixo, depois das que ja existiam -->
  <td>
    <form method="POST" action="/agendamentos/{{id}}">
      <input type="hidden" name="_method" value="PUT" />
      <input
        type="datetime-local"
        name="data_agendamento"
        value="{{data_input}}"
        required
      />
      <button>Salvar</button>
    </form>
  </td>
  <td>
    <form method="POST" action="/agendamentos/{{id}}">
      <input type="hidden" name="_method" value="DELETE" />
      <button>Excluir</button>
    </form>
  </td>
</tr>
{{/agendamentos}}
```

**Arquivo: `app.js`** (adicionar embaixo do `POST /agendamentos` do passo 10.1)
```js
app.put('/agendamentos/:id', async (req, res) => {
  await db.query('UPDATE agendamentos SET data_agendamento = ? WHERE id = ?',
    [req.body.data_agendamento.replace('T', ' '), req.params.id]);
  res.redirect('/agendamentos');
});

app.delete('/agendamentos/:id', async (req, res) => {
  await excluir(res, 'agendamentos', req.params.id, '/agendamentos', '');
});
```

(Agendamento e a ponta da cadeia - nada depende dele, por isso a exclusao
nunca da erro de vinculo e o `motivo` fica vazio.)

**Teste agora:** mudar a data de um agendamento pra uma data mais cedo do
que todos os outros -> salvar e ver a lista **reordenar sozinha**. Excluir
um agendamento -> some da lista, sem precisar excluir nada antes (diferente
de cliente/veiculo).

**Checkpoint:** lista ordenada com dados de cliente/veiculo, cadastro,
alterar data e excluir funcionando.

---

## Bloco 11 - Fechamento (15 min)

Teste de ponta a ponta com a turma:
1. Login `admin@oficina.com` / `123456`.
2. Buscar "maria" -> editar telefone -> salvar.
3. Cadastrar veiculo pra Maria.
4. Agendar servico pra esse veiculo.
5. Mudar a data -> ver a ordem se ajustar.
6. Sair -> tentar `/clientes` direto -> volta pro login.

Perguntas abertas: quais regras viraram SQL? Quais viraram JS? Quais viraram
HTML? O que falta pra isso ir pra producao?

Mostrar o `README.md` (como rodar) e avisar que na avaliacao o enunciado muda
de tema, mas a receita e a mesma (ver Anexo B do `docs/roteiro-live-coding.md`
se quiser repassar o passo a passo generico).

---

## Troubleshooting rapido (se travar na hora)

| Sintoma | Causa | Solucao |
|---|---|---|
| "Metodo nao permitido" ao excluir/editar | Outro processo na porta 3000 | Matar o processo antigo, `npm start` de novo |
| `EADDRINUSE :::3000` | Porta ocupada | Mesma solucao, ou `PORT=3001` no `.env` |
| `ER_ROW_IS_REFERENCED_2` derruba o servidor | Exclusao sem `try/catch` | Usar a funcao `excluir` |
| Botao nao faz nada / `Cannot POST` | Middleware `_method` fora de ordem ou campo oculto faltando | Checar ordem `urlencoded -> cookieParser -> _method -> rotas` |
| Sempre volta pro login | Token ausente/vencido ou `JWT_SECRET` mudou | Logar de novo, checar `.env` |
| "E-mail ou senha invalidos" sempre | Banco sem usuarios ou hash errado | `DROP DATABASE oficina;` + recarregar `script.sql` |
| `Invalid key length`/`Invalid IV length` | `CRIPTO_CHAVE`/`CRIPTO_IV` com tamanho errado | Ajustar `.env` (32 e 16 caracteres) |
| Mudei `app.js` e nada mudou | Node nao recarrega sozinho | `Ctrl+C` + `npm start` (so `.html` dispensa reiniciar) |
| `{{nome}}` aparece literal na tela | Abriu o `.html` direto do disco | Acessar sempre por `http://localhost:3000` |

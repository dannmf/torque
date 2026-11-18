# Como rodar o Torque no seu Mac

> Guia especifico pra rodar este projeto no seu Mac (pra testar antes da
> aula, por exemplo). Verifiquei seu ambiente: MySQL 9.5 via Homebrew ja
> instalado e rodando, acesso como `root` sem senha, Node v22 e npm 10.

## 1. Confirmar que o MySQL esta rodando

```bash
brew services list
```

Deve aparecer `mysql` com status `started`. Se estiver `stopped`:

```bash
brew services start mysql
```

Testar a conexao:

```bash
mysql -u root -e "SELECT 1;"
```

Se devolver `1` sem pedir senha, esta tudo certo (e o seu caso).

## 2. Carregar o banco de dados

Na raiz do projeto (`torque/`):

```bash
mysql -u root < database/script.sql
```

Como voce nao tem senha no `root`, nao precisa do `-p`. Se der erro
`database exists` (porque voce ja rodou antes), apague o banco antes:

```bash
mysql -u root -e "DROP DATABASE oficina;"
mysql -u root < database/script.sql
```

Conferir que carregou certo:

```bash
mysql -u root -e "USE oficina; SELECT id, nome, cpf FROM clientes;"
```

Deve mostrar 3 clientes com o CPF ilegivel (criptografado).

> Se preferir uma interface grafica em vez do terminal, pode instalar o
> **MySQL Workbench** (`brew install --cask mysql-workbench`) ou o
> **TablePlus**/**Sequel Ace** (gratuito, so na App Store) e abrir o
> `database/script.sql` por la.

## 3. Configurar o `.env`

```bash
cp .env.example .env
```

Como o seu `root` nao tem senha, deixe `DB_PASSWORD` vazio (ja vem assim no
`.env.example`). Confirme que o arquivo ficou assim:

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

## 4. Instalar as dependencias e rodar

```bash
npm install
npm start
```

Deve aparecer no terminal:

```
Oficina rodando em http://localhost:3000
```

Abra `http://localhost:3000` no navegador.

## 5. Login de teste

- E-mail: `admin@oficina.com`
- Senha: `123456`

## Problemas comuns no Mac

| Sintoma | Causa provavel | Como resolver |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::3000` | Outro processo (ou outra instancia do `app.js`) na porta 3000 | `lsof -i :3000` pra ver o processo, depois `kill -9 <PID>`. Ou mude `PORT=3001` no `.env` |
| `Access denied for user 'root'@'localhost'` | Seu `root` tem senha (diferente do que testei aqui) | Descubra a senha e coloque em `DB_PASSWORD` no `.env`, ou rode `mysql -u root -p` para testar |
| `ECONNREFUSED` ao iniciar o `npm start` | MySQL parado | `brew services start mysql` |
| `Invalid key length`/`Invalid IV length` | `CRIPTO_CHAVE` (precisa 32 caracteres) ou `CRIPTO_IV` (16 caracteres) com tamanho errado no `.env` | Copiar os valores exatos do `.env.example` |
| Mudei o `.env` ou o `app.js` e nada mudou | Servidor nao recarrega sozinho | `Ctrl+C` no terminal e `npm start` de novo |
| Comando `mysql` nao encontrado | Homebrew nao esta no `PATH` (raro, ja que funcionou aqui) | Reabra o terminal, ou rode `eval "$(/opt/homebrew/bin/brew shellenv)"` |

## Resetar tudo do zero

Se quiser recomecar o banco do zero antes da aula:

```bash
mysql -u root -e "DROP DATABASE IF EXISTS oficina;"
mysql -u root < database/script.sql
```

Se quiser gerar novos valores de hash/CPF (por exemplo, apos mudar a chave
no `.env`):

```bash
npm run gerar-valores
```

Copie o que aparecer no terminal e cole manualmente nos `INSERT` do
`database/script.sql` (ver `docs/roteiro-daniel.md`, Bloco 3).

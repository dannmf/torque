# Torque - Sistema da Oficina Mecanica

Projeto de estudo (SENAI) para controle de clientes, veiculos e agendamentos
de uma oficina mecanica, com protecao do CPF (LGPD) e login com token JWT.

Versao simplificada: o **back** (`app.js`) e o **front** (arquivos `.html`) ficam separados.
Sem CSS e sem JavaScript no navegador: o servidor preenche os `{{marcadores}}` dos `.html`.

## Estrutura

```
app.js             BACK: rotas, regras, login, criptografia e SQL
paginas/           FRONT: HTML puro (login, principal, clientes, veiculos, agendamentos)
gerar-valores.js   imprime o hash da senha e o CPF criptografado para colar no script.sql
database/          script.sql
docs/              material do professor:
                     estrutura-do-codigo.md  explicacao de cada arquivo (contexto)
                     roteiro-daniel.md       roteiro enxuto pra seguir na live
                     roteiro-live-coding.md  roteiro detalhado de outro professor
```

## 1. Banco de dados

Com o MySQL rodando, carregue o `database/script.sql`:

- **MySQL Workbench:** File > Open SQL Script, abra `database/script.sql` e
  execute tudo (icone do raio ou Ctrl+Shift+Enter).
- **Terminal:** `mysql -u root -p < database/script.sql`

(Se precisar gerar novos valores, por exemplo apos mudar a chave do `.env`: `npm run gerar-valores`
e cole o hash/CPF impressos no `database/script.sql`)

## 2. Rodar o sistema

```bash
cp .env.example .env   # ajuste os dados do seu MySQL
npm install
npm start
```

Acesse `http://localhost:3000`.

## Usuario de teste

- E-mail: `admin@oficina.com`
- Senha: `123456`

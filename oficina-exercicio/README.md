# Torque - Exercicio

Esta e a versao de EXERCICIO do projeto Torque. A implementacao das regras
RN03, RN05, RN07, RN08 e RN10 foi removida e substituida por comentarios
`// TODO [RNxx]` com uma dica. Procure por `TODO` no codigo do `backend/`
para encontrar o que falta implementar. O projeto completo (com a solucao)
esta na pasta `../` (raiz do repositorio).

## Estrutura

```
database/           script.sql (mesmos dados do projeto completo)
backend/             API Node + Express (MVC) - com TODOs
frontend-html/       HTML, CSS e JS puros
frontend-react/      React + Vite
docs/                requisitos.md e der.md
```

## 1. Banco de dados

1. Tenha um MySQL rodando localmente.
2. Rode o arquivo `database/script.sql` (ele cria o banco `oficina`, as
   tabelas e insere os dados de teste, inclusive o usuario de login).

   ```bash
   mysql -u root -p < database/script.sql
   ```

   Esse arquivo ja vem gerado. Se quiser gera-lo novamente (por exemplo,
   apos mudar a chave de criptografia no `.env`), rode dentro de `backend/`:

   ```bash
   npm run gerar-script
   ```

## 2. Backend

```bash
cd backend
cp .env.example .env   # ajuste os dados do seu MySQL
npm install
npm start
```

A API sobe em `http://localhost:3000`.

## 3. Frontend HTML puro

Abra `frontend-html/index.html` direto no navegador (ou sirva a pasta com
qualquer servidor estatico). A API precisa estar rodando.

## 4. Frontend React

```bash
cd frontend-react
npm install
npm run dev
```

Acesse o endereco mostrado pelo Vite (normalmente `http://localhost:5173`).
A API precisa estar rodando.

## Usuario de teste

- E-mail: `admin@oficina.com`
- Senha: `123456`

## O que falta implementar

Procure por `TODO` dentro de `backend/src/` para encontrar os 5 pontos a
completar: RN03 (criptografia do CPF), RN05 (busca de clientes), RN07
(JOIN e ordenacao dos agendamentos), RN08 (alterar data do agendamento) e
RN10 (expiracao do token JWT).

# DER - Sistema da Oficina Mecanica

```mermaid
erDiagram
    USUARIOS {
        int id PK
        string nome
        string email
        string senha
    }

    CLIENTES {
        int id PK
        string nome
        string cpf
        string telefone
        string email
    }

    VEICULOS {
        int id PK
        int cliente_id FK
        string placa
        string marca
        string modelo
        int ano
    }

    AGENDAMENTOS {
        int id PK
        int veiculo_id FK
        datetime data_agendamento
        string servico
    }

    CLIENTES ||--o{ VEICULOS : possui
    VEICULOS ||--o{ AGENDAMENTOS : possui
```

## Observacoes

- `clientes.cpf` e armazenado criptografado (AES-256-CBC) [RN03].
- `usuarios.senha` e armazenada como hash (bcrypt), nao pode ser revertida.
- `usuarios` nao se relaciona com as demais tabelas: serve apenas para login.

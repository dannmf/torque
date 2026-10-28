import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [clienteEditando, setClienteEditando] = useState(null);

  // Busca os clientes na API, com ou sem termo de busca [RN05]
  async function buscarClientes(termo = '') {
    const resposta = await apiFetch(`/clientes?busca=${encodeURIComponent(termo)}`);
    const dados = await resposta.json();
    setClientes(dados);
  }

  useEffect(() => {
    buscarClientes();
  }, []);

  // Salva a edicao do cliente [RN06]
  async function salvarEdicao(evento) {
    evento.preventDefault();
    await apiFetch(`/clientes/${clienteEditando.id}`, {
      method: 'PUT',
      body: JSON.stringify(clienteEditando),
    });
    setClienteEditando(null);
    buscarClientes(termoBusca);
  }

  return (
    <div className="container">
      <h1>Clientes</h1>
      <nav><Link to="/principal">Voltar</Link></nav>

      <div className="busca">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={termoBusca}
          onChange={(evento) => setTermoBusca(evento.target.value)}
        />
        <button onClick={() => buscarClientes(termoBusca)}>Buscar</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>E-mail</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.cpf}</td>
              <td>{cliente.telefone}</td>
              <td>{cliente.email}</td>
              <td>
                <button onClick={() => setClienteEditando(cliente)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clienteEditando && (
        <>
          <h2>Editar cliente</h2>
          <form onSubmit={salvarEdicao}>
            <input
              type="text"
              placeholder="Nome"
              value={clienteEditando.nome}
              onChange={(evento) => setClienteEditando({ ...clienteEditando, nome: evento.target.value })}
              required
            />
            <input
              type="text"
              placeholder="CPF"
              value={clienteEditando.cpf}
              onChange={(evento) => setClienteEditando({ ...clienteEditando, cpf: evento.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Telefone"
              value={clienteEditando.telefone ?? ''}
              onChange={(evento) => setClienteEditando({ ...clienteEditando, telefone: evento.target.value })}
            />
            <input
              type="email"
              placeholder="E-mail"
              value={clienteEditando.email ?? ''}
              onChange={(evento) => setClienteEditando({ ...clienteEditando, email: evento.target.value })}
            />
            <button type="submit">Salvar</button>
          </form>
        </>
      )}
    </div>
  );
}

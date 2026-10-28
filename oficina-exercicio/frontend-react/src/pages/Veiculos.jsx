import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api.js';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [form, setForm] = useState({ cliente_id: '', placa: '', marca: '', modelo: '', ano: '' });

  async function listarVeiculos() {
    const resposta = await apiFetch('/veiculos');
    setVeiculos(await resposta.json());
  }

  // Preenche o select de clientes usado no cadastro de veiculo
  async function carregarClientes() {
    const resposta = await apiFetch('/clientes');
    setClientes(await resposta.json());
  }

  useEffect(() => {
    listarVeiculos();
    carregarClientes();
  }, []);

  // Cadastra um veiculo associado a um cliente [RN09]
  async function cadastrar(evento) {
    evento.preventDefault();
    setMensagemErro('');

    const resposta = await apiFetch('/veiculos', { method: 'POST', body: JSON.stringify(form) });
    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemErro(dados.mensagem);
      return;
    }

    setForm({ cliente_id: '', placa: '', marca: '', modelo: '', ano: '' });
    listarVeiculos();
  }

  return (
    <div className="container">
      <h1>Veiculos</h1>
      <nav><Link to="/principal">Voltar</Link></nav>

      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Cliente</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.placa}</td>
              <td>{veiculo.marca}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.ano}</td>
              <td>{veiculo.cliente_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Cadastrar veiculo</h2>
      <form onSubmit={cadastrar}>
        <select
          value={form.cliente_id}
          onChange={(evento) => setForm({ ...form, cliente_id: evento.target.value })}
          required
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Placa"
          value={form.placa}
          onChange={(evento) => setForm({ ...form, placa: evento.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Marca"
          value={form.marca}
          onChange={(evento) => setForm({ ...form, marca: evento.target.value })}
        />
        <input
          type="text"
          placeholder="Modelo"
          value={form.modelo}
          onChange={(evento) => setForm({ ...form, modelo: evento.target.value })}
        />
        <input
          type="number"
          placeholder="Ano"
          value={form.ano}
          onChange={(evento) => setForm({ ...form, ano: evento.target.value })}
        />
        <button type="submit">Cadastrar</button>
      </form>
      {mensagemErro && <p className="erro">{mensagemErro}</p>}
    </div>
  );
}

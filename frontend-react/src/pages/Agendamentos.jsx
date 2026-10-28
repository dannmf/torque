import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api.js';

// Converte a data do banco para o formato aceito pelo input datetime-local
function paraDatetimeLocal(data) {
  return new Date(data).toISOString().slice(0, 16);
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [datas, setDatas] = useState({});

  // Lista os agendamentos ordenados por data, com dados do cliente e do veiculo [RN07]
  async function listarAgendamentos() {
    const resposta = await apiFetch('/agendamentos');
    const dados = await resposta.json();
    setAgendamentos(dados);

    const novasDatas = {};
    dados.forEach((agendamento) => {
      novasDatas[agendamento.id] = paraDatetimeLocal(agendamento.data_agendamento);
    });
    setDatas(novasDatas);
  }

  useEffect(() => {
    listarAgendamentos();
  }, []);

  // Altera a data de um agendamento e salva no banco [RN08]
  async function salvarData(id) {
    await apiFetch(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data_agendamento: datas[id].replace('T', ' ') }),
    });
    listarAgendamentos();
  }

  return (
    <div className="container">
      <h1>Agendamentos</h1>
      <nav><Link to="/principal">Voltar</Link></nav>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Servico</th>
            <th>Veiculo</th>
            <th>Cliente</th>
            <th>Alterar data</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((agendamento) => (
            <tr key={agendamento.id}>
              <td>{new Date(agendamento.data_agendamento).toLocaleString('pt-BR')}</td>
              <td>{agendamento.servico}</td>
              <td>{agendamento.placa} - {agendamento.marca} {agendamento.modelo}</td>
              <td>{agendamento.cliente_nome}</td>
              <td>
                <input
                  type="datetime-local"
                  value={datas[agendamento.id] ?? ''}
                  onChange={(evento) => setDatas({ ...datas, [agendamento.id]: evento.target.value })}
                />
                <button onClick={() => salvarData(agendamento.id)}>Salvar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

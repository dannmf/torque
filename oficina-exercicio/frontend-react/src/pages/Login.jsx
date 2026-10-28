import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const navegar = useNavigate();

  async function aoEnviar(evento) {
    evento.preventDefault();
    setMensagemErro('');

    // Chamada direta (sem apiFetch) porque aqui ainda nao existe token
    const resposta = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    // Mostra a mensagem de erro na tela quando a autenticacao falha [RN02]
    if (!resposta.ok) {
      setMensagemErro(dados.mensagem);
      return;
    }

    localStorage.setItem('token', dados.token);
    localStorage.setItem('nome', dados.nome);
    navegar('/principal');
  }

  return (
    <div className="container">
      <h1>Oficina Mecanica - Login</h1>
      <form onSubmit={aoEnviar}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {mensagemErro && <p className="erro">{mensagemErro}</p>}
    </div>
  );
}

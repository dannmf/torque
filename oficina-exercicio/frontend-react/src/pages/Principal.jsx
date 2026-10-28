import { Link, useNavigate } from 'react-router-dom';

// Tela principal [RN04]
export default function Principal() {
  const nome = localStorage.getItem('nome');
  const navegar = useNavigate();

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    navegar('/');
  }

  return (
    <div className="container">
      <h1>Ola, {nome}</h1>
      <nav>
        <Link to="/clientes">Clientes</Link>
        <Link to="/veiculos">Veiculos</Link>
        <Link to="/agendamentos">Agendamentos</Link>
      </nav>
      <p>
        <button className="secundario" onClick={sair}>Sair</button>
      </p>
    </div>
  );
}

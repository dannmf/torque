import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Principal from './pages/Principal.jsx';
import Clientes from './pages/Clientes.jsx';
import Veiculos from './pages/Veiculos.jsx';
import Agendamentos from './pages/Agendamentos.jsx';

// Sem token, volta para o login
function RotaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/principal"
          element={
            <RotaProtegida>
              <Principal />
            </RotaProtegida>
          }
        />
        <Route
          path="/clientes"
          element={
            <RotaProtegida>
              <Clientes />
            </RotaProtegida>
          }
        />
        <Route
          path="/veiculos"
          element={
            <RotaProtegida>
              <Veiculos />
            </RotaProtegida>
          }
        />
        <Route
          path="/agendamentos"
          element={
            <RotaProtegida>
              <Agendamentos />
            </RotaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loginRoutes = require('./routes/loginRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/login', loginRoutes);
app.use('/clientes', clienteRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/agendamentos', agendamentoRoutes);

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`API da oficina rodando na porta ${porta}`);
});

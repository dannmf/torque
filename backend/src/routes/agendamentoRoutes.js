const express = require('express');
const auth = require('../middlewares/auth');
const { listar, atualizarData } = require('../controllers/agendamentoController');

const router = express.Router();

router.use(auth);

// GET /agendamentos
router.get('/', listar);

// PUT /agendamentos/:id
router.put('/:id', atualizarData);

module.exports = router;

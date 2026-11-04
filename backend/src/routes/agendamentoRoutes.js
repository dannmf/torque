const express = require('express');
const auth = require('../middlewares/auth');
const { listar, atualizarData, cadastrar, excluir } = require('../controllers/agendamentoController');

const router = express.Router();

router.use(auth);

// GET /agendamentos
router.get('/', listar);

// POST /agendamentos
router.post('/', cadastrar);

// PUT /agendamentos/:id
router.put('/:id', atualizarData);

// DELETE /agendamentos/:id
router.delete('/:id', excluir);

module.exports = router;

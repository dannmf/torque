const express = require('express');
const auth = require('../middlewares/auth');
const { listar, atualizar, cadastrar, excluir } = require('../controllers/clienteController');

const router = express.Router();

router.use(auth);

// GET /clientes?busca=termo
router.get('/', listar);

// POST /clientes
router.post('/', cadastrar);

// PUT /clientes/:id
router.put('/:id', atualizar);

// DELETE /clientes/:id
router.delete('/:id', excluir);

module.exports = router;

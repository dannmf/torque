const express = require('express');
const auth = require('../middlewares/auth');
const { listar, cadastrar, atualizar, excluir } = require('../controllers/veiculoController');

const router = express.Router();

router.use(auth);

// GET /veiculos
router.get('/', listar);

// POST /veiculos
router.post('/', cadastrar);

// PUT /veiculos/:id
router.put('/:id', atualizar);

// DELETE /veiculos/:id
router.delete('/:id', excluir);

module.exports = router;

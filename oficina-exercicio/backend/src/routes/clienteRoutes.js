const express = require('express');
const auth = require('../middlewares/auth');
const { listar, atualizar } = require('../controllers/clienteController');

const router = express.Router();

router.use(auth);

// GET /clientes?busca=termo
router.get('/', listar);

// PUT /clientes/:id
router.put('/:id', atualizar);

module.exports = router;

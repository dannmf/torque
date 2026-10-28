const express = require('express');
const auth = require('../middlewares/auth');
const { listar, cadastrar } = require('../controllers/veiculoController');

const router = express.Router();

router.use(auth);

// GET /veiculos
router.get('/', listar);

// POST /veiculos
router.post('/', cadastrar);

module.exports = router;

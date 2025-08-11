const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const produtoSchema = require('../validators/produtoValidator');

// GET todos os produtos
router.get('/', produtosController.listarProdutos);

// POST novo produto
router.post('/', validate(produtoSchema.create), produtosController.criarProduto);

// PUT atualização
router.put('/:id', authenticateToken, validate(produtoSchema.update), produtosController.atualizarProduto);

// DELETE produto
router.delete('/:id', authenticateToken, produtosController.removerProduto);

module.exports = router;

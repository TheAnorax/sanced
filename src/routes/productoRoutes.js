const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controller/productoController');
const router = express.Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct); 
router.delete('/:id', deleteProduct);

module.exports = router;

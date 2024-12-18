const express = require('express');
const router = express.Router();
const { Departamentos,  buscarProducto } = require('../controller/muestrasController');

router.get('/departamentos', Departamentos);
router.get('/producto/:codigo', buscarProducto);


module.exports = router;

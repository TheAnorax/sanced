const express = require('express');
const router = express.Router();
const { getRecibo, updateVolumetria, saveRecibo } = require('../controller/reciboController');

router.get('/recibo', getRecibo);
router.post('/guardarTarima', updateVolumetria); // Nueva ruta para actualizar datos
router.post('/guardarRecibo', saveRecibo); 

module.exports = router; 
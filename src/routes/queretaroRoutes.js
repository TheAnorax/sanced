const express = require('express');
const router = express.Router();
const { getProyectoQueretaro, getCategoryData, updateOrdenVisita } = require('../controller/queretaroController');


// Ruta para obtener los datos de proyectoqueretaro
router.get('/proyectoqueretaro', getProyectoQueretaro);
router.get('/category/:giro/:portafolio/:segmento', getCategoryData);
router.post('/proyectoqueretaro/ordenar', updateOrdenVisita)


module.exports = router;

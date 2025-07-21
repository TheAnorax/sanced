const express = require('express');
const router = express.Router();
const { getProyectoQueretaro, getCategoryData, updateOrdenVisita, getPreciosBronce, getPreciosPlata, getPreciosOro } = require('../controller/queretaroController');


// Ruta para obtener los datos de proyectoqueretaro
router.get('/proyectoqueretaro', getProyectoQueretaro);
router.get('/category/:giro/:portafolio/:segmento', getCategoryData);
router.post('/proyectoqueretaro/ordenar', updateOrdenVisita)


router.get('/precios_bronce', getPreciosBronce);
router.get('/precios_plata', getPreciosPlata);
router.get('/precios_oro', getPreciosOro);

module.exports = router;

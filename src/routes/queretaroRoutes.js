const express = require('express');
const router = express.Router();
const {getProyectoQueretaro, getCategoryData} = require('../controller/queretaroController');


// Ruta para obtener los datos de proyectoqueretaro
router.get('/proyectoqueretaro', getProyectoQueretaro);
router.get('/category/:giro/:portafolio/:segmento', getCategoryData);


module.exports = router;

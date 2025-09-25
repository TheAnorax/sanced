const express = require('express');
const router = express.Router();
const { obtenerEmbarques, actualizarBahiaEmbarque, obtenerEmbarquesNew, obtenerEmbarquesNewTest} = require('../appcontrollers/embarquesController');

// Ruta para obtener los datos de embarques
router.get('/', obtenerEmbarques);
router.put('/', actualizarBahiaEmbarque);
//router.get('/obtenerEmbarquesNew', obtenerEmbarquesNew);
router.get('/obtenerEmbarquesNew/:idUsu', obtenerEmbarquesNew);
router.get('/obtenerEmbarquesNewTest/:idUsu', obtenerEmbarquesNewTest);
module.exports = router;

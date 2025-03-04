const express = require('express');
const router = express.Router();
const { obtenerEmbarques, actualizarBahiaEmbarque} = require('../appcontrollers/embarquesController');

// Ruta para obtener los datos de embarques
router.get('/', obtenerEmbarques);
router.put('/', actualizarBahiaEmbarque);
module.exports = router;

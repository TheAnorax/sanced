const express = require('express');
const router = express.Router();
const { obtenerEmbarques } = require('../appcontrollers/embarquesController');

// Ruta para obtener los datos de embarques
router.get('/', obtenerEmbarques);

module.exports = router;

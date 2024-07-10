const express = require('express');
const router = express.Router();
const { getPaqueteria, updateUsuarioPaqueteria } = require('../controller/paqueteriraController');

router.get('/paqueteria', getPaqueteria);
router.put('/paqueteria/:pedidoId/usuario-paqueteria', updateUsuarioPaqueteria);

module.exports = router;

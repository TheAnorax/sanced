const express = require('express');
const router = express.Router();
const { getBahias, liberarBahia} = require('../controller/bahiasController');

router.get('/bahias', getBahias);
router.put('/liberar/:id_bahia', liberarBahia);
module.exports = router;

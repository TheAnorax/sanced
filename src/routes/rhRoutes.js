const express = require('express');
const { getInsumosRH, createInsumo, updateInsumo, deleteInsumo } = require('../controller/rhController');

const router = express.Router();

// Rutas del CRUD
router.get('/RH', getInsumosRH);
router.post('/RH', createInsumo);
router.put('/RH/:id', updateInsumo);
router.delete('/RH/:id', deleteInsumo);

module.exports = router;

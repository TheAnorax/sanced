const express = require('express');
const router = express.Router();
const { porcentaje, ubicaciones, persona, manual, obtenerInventario} = require('../controller/inventoryController');


router.get('/porcentaje', porcentaje);
router.get('/ubicaciones', ubicaciones);
router.get('/persona', persona);
router.get('/Manuealsi', manual);
router.get('/obtenerinventario', obtenerInventario);

module.exports = router;

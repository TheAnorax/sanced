const express = require('express');
const router = express.Router();
const { porcentaje, usuInv,  ubicaciones, persona, manual, obtenerInventario, getInventoryDet, reportFinishInventory, reportFinishInventoryAlma, reportConsolidatedInventory, updateInventory, obtenerDistribucionInventario } = require('../controller/inventoryController');


router.get('/porcentaje', porcentaje);
router.get('/ubicaciones', ubicaciones);
router.get('/persona', persona);
router.get('/Manuealsi', manual);
router.get('/obtenerinventario', obtenerInventario);
router.get('/getInventoryDet', getInventoryDet);
router.get('/reportFinishInventory', reportFinishInventory);
router.get('/reportFinishInventoryAlma', reportFinishInventoryAlma);
router.get('/reportConsolidatedInventory', reportConsolidatedInventory);
router.put("/update/:id", updateInventory);
router.get('/obtenerDistribucionInventario', obtenerDistribucionInventario);
router.get('/obtenerusuarios',   usuInv);


module.exports = router;

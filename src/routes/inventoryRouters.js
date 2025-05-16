const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { porcentaje, ubicaciones, persona, manual, obtenerInventario, getInventoryDet, reportFinishInventory, reportFinishInventoryAlma, reportConsolidatedInventory, updateInventory } = require('../controller/inventoryController');
=======
const { porcentaje, ubicaciones, persona, manual, obtenerInventario, getInventoryDet, reportFinishInventory, reportFinishInventoryAlma, reportConsolidatedInventory, updateInventory, obtenerDistribucionInventario } = require('../controller/inventoryController');
>>>>>>> origin/master


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
<<<<<<< HEAD
=======
router.get('/obtenerDistribucionInventario', obtenerDistribucionInventario);

>>>>>>> origin/master

module.exports = router;

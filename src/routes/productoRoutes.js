const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getAllProductsUbi, getVoluProducts, updateVolumetria, upload, getStockTotal } = require('../controller/productoController');
const router = express.Router();

router.get('/', getAllProducts);
router.get('/volumetria', getVoluProducts);
router.post('/', upload.fields([{ name: 'img_pz', maxCount: 1 }, { name: 'img_pq', maxCount: 1 }, { name: 'img_inner', maxCount: 1 }, { name: 'img_master', maxCount: 1 }]), createProduct);
router.put('/:id', upload.fields([{ name: 'img_pz', maxCount: 1 }, { name: 'img_pq', maxCount: 1 }, { name: 'img_inner', maxCount: 1 }, { name: 'img_master', maxCount: 1 }]), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/ubicaciones', getAllProductsUbi);
router.put("/volumetria/:codigo", updateVolumetria);

router.get('/stock', getStockTotal);

module.exports = router;


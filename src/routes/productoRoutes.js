// src/routes/productoRoutes.js
const express = require('express');

const {
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllProductsUbi, getVoluProducts, updateVolumetria, upload,
  getStockTotal, getCatalogProducts, getDetalleCatalogo,
  updateDetalleCatalogo, updateDetalleCatalogoImg,
  uploadDocs, uploadDocumentoProducto,     // <-- viene del controller
  getDocumentoProducto,                    // <-- NUEVO
} = require('../controller/productoController');

const router = express.Router();

// ------- CRUD / inventario -------
router.get('/', getAllProducts);
router.get('/volumetria', getVoluProducts);
router.put('/volumetria/:codigo', updateVolumetria);

router.post(
  '/',
  upload.fields([
    { name: 'img_pz', maxCount: 1 },
    { name: 'img_pq', maxCount: 1 },
    { name: 'img_inner', maxCount: 1 },
    { name: 'img_master', maxCount: 1 },
  ]),
  createProduct
);

router.put(
  '/:id',
  upload.fields([
    { name: 'img_pz', maxCount: 1 },
    { name: 'img_pq', maxCount: 1 },
    { name: 'img_inner', maxCount: 1 },
    { name: 'img_master', maxCount: 1 },
  ]),
  updateProduct
);

router.delete('/:id', deleteProduct);

router.get('/ubicaciones', getAllProductsUbi);
router.get('/stock', getStockTotal);

// ------- Catálogo / detalle -------
router.get('/catalogo', getCatalogProducts);
router.get('/catalogo-detall', getDetalleCatalogo);
router.post('/catalogo-detall-update', updateDetalleCatalogo);

router.post(
  '/catalogo-detall-img',
  upload.fields([
    { name: 'img_pz', maxCount: 1 },
    { name: 'img_inner', maxCount: 1 },
    { name: 'img_master', maxCount: 1 },
  ]),
  updateDetalleCatalogoImg
);

// ------- Documentos por TAB -------
// Subir
router.post('/:codigo_pro/archivos/:tipo', uploadDocs.single('archivo'), uploadDocumentoProducto);
// Descargar (mostrar)
router.get('/:codigo_pro/archivos/:tipo', getDocumentoProducto);

module.exports = router;

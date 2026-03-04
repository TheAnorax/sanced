// routes/rh.js
const express = require('express');
const {
  getInsumosRH, createInsumo, updateInsumo, deleteInsumo,
  buscarProducto, createTraspaso, Traspasos,
  excelToJson, importTraspasosExcel, importTraspasosExcelMiddleware,getProductividadAreas
} = require('../controller/rhController');

const router = express.Router();

// CRUD
router.get('/RH', getInsumosRH);
router.post('/RH', createInsumo);
router.put('/RH/:id', updateInsumo);
router.delete('/RH/:id', deleteInsumo);

// Traspasos
router.get('/productos/:codigo', buscarProducto);
router.post('/traspaso', createTraspaso);
router.get('/ObtenerTraspaso', Traspasos);

// Excel
router.post('/excel-to-json', importTraspasosExcelMiddleware, excelToJson);
router.post('/import-excel', importTraspasosExcelMiddleware, importTraspasosExcel);

// rh cedis
router.get("/productividad", getProductividadAreas);

module.exports = router; 

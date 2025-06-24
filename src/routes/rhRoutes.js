// const express = require('express');
// const { getInsumosRH, createInsumo, updateInsumo, deleteInsumo } = require('../controller/rhController');

// const router = express.Router();

// // Rutas del CRUD
// router.get('/RH', getInsumosRH);
// router.post('/RH', createInsumo);
// router.put('/RH/:id', updateInsumo);
// router.delete('/RH/:id', deleteInsumo);

// module.exports = router;

const express = require("express");

const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  buscarProducto,
  createTraspaso,
  Traspasos,
  excelToJson,
} = require("../controller/rhController");

router.get("/productos/:codigo", buscarProducto);
router.post("/traspaso", createTraspaso);
router.get("/ObtenerTraspaso", Traspasos);

router.post("/excel-to-json", upload.single("archivoExcel"), excelToJson);

module.exports = router;

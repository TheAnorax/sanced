const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadExcelPedi, getProductosByCodigos } = require('../controller/mercadoController.js');




const upload = multer({ storage: multer.memoryStorage() });

// POST /api/pedi/upload-excel
router.post("/upload-excel", upload.single("file"), uploadExcelPedi);

router.post("/codigos", getProductosByCodigos);

module.exports = router;



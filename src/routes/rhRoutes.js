const express = require('express');

const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { buscarProducto, createTraspaso, Traspasos, excelToJson } = require('../controller/rhController');

router.get('/productos/:codigo', buscarProducto);
router.post('/traspaso', createTraspaso);
router.get('/ObtenerTraspaso', Traspasos);


router.post('/excel-to-json', upload.single('archivoExcel'), excelToJson);

module.exports = router;


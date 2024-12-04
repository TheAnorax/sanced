const express = require('express');
const {
  reciboListas,
  reciboTarimas,
  reciboSaves,
  reciboCedlis,
  reciboDetalles,
  reciboReporte,
  reciboUploadPDF,
  reciboActualizars
} = require('../controlleraplication/reciboCedisController');
const upload = require('../config/multerConfig'); // Importar correctamente el middleware multer

const router = express.Router();

// Definir las rutas
router.post('/lista', reciboListas);
router.post('/tarima', reciboTarimas);
router.post('/save', reciboSaves);
router.get('/cedis', reciboCedlis);
router.post('/detalle', reciboDetalles);
router.get('/reporte', reciboReporte);
router.post('/volumetria', reciboActualizars); 

// Nueva ruta para subir archivos PDF (permitir hasta 5 archivos)
router.post('/uploadPDF', upload.fields([
    { name: 'pdf_1', maxCount: 1 },
    { name: 'pdf_2', maxCount: 1 },
    { name: 'pdf_3', maxCount: 1 },
    { name: 'pdf_4', maxCount: 1 },
    { name: 'pdf_5', maxCount: 1 } // Agregar el campo para el quinto archivo
  ]), reciboUploadPDF);

module.exports = router;

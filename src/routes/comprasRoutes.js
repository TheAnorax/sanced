// rutas/comprasRoutes.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Aumentar el límite de tamaño a 50MB o el valor que desees
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
const router = express.Router();
const { getCompras, addRecibo, updateRecibo, uploadExcel, uploadPDFs,uploadPDFsOC, updateReciboCant, cancelarRecibo  } = require('../controller/comprasController');

router.get('/compras', getCompras);
router.post('/recibo', addRecibo);
router.put('/recibo/:id_recibo', updateRecibo);

// Nueva ruta para cargar los datos del Excel
router.post('/compras/upload-excel', uploadExcel);
router.post('/compras/upload-pdfs', uploadPDFs);
router.post('/compras/upload-pdfsOC', uploadPDFsOC)
router.put('/compras/recibo/:id_recibo', updateReciboCant);
router.put('/compras/cancelar/:id_recibo', cancelarRecibo); 

 
module.exports = router;
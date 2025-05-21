const express = require('express');
const router = express.Router();
const { getPlan, importarDatos, truncarPlan } = require('../controller/planController');

router.get('/plan', getPlan);
router.post('/plan/importar', importarDatos);
router.delete('/plan/truncar', truncarPlan); // Nueva ruta para truncar la tabla

module.exports = router;
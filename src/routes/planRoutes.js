const express = require('express');
const router = express.Router();
const { PlanDelDia, DetallePlan , FaltantesPlan, detalleSinRuta} = require('../controller/planController');

router.get('/plan', PlanDelDia); // Nueva ruta para truncar la tabla 
router.get('/datalle-plan', DetallePlan); // Nueva ruta para truncar la tabla 
router.get('/faltante-plan', FaltantesPlan); // Nueva ruta para truncar la tabla 
router.get("/detalleSinRuta", detalleSinRuta);

module.exports = router;
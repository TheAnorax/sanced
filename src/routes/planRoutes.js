const express = require('express');
const router = express.Router();
const { PlanDelDia } = require('../controller/planController');

router.get('/plan', PlanDelDia); // Nueva ruta para truncar la tabla 

module.exports = router;
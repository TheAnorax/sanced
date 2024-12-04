// routes/index.js
const express = require('express');
const router = express.Router();
const bahiasRoutes = require('./bahias');

// Define rutas para módulos específicos
router.use(bahiasRoutes); // Aquí se pueden añadir otras rutas en el futuro

module.exports = router;

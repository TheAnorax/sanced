const express = require('express');
const { Ubicaciones} = require('../controller/ubicacionesController');
const router = express.Router();

router.get('/', Ubicaciones);

module.exports = router;


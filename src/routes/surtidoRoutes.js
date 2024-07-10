const express = require('express');
const router = express.Router();
const { getEnSurtido} = require('../controller/surtidoController');

router.get('/surtido', getEnSurtido);
module.exports = router;

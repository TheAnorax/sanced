const express = require('express');
const router = express.Router();
const { getCoberturasDual } = require('../controller/coberturaController');

router.get('/cobertura', getCoberturasDual);


module.exports = router;

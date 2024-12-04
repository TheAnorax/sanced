const express = require('express');
const { embarquesLista } = require('../controlleraplication/embarqueController');


const router = express.Router();

router.get('/embarques', embarquesLista);

module.exports = router;
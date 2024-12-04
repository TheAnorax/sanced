const express = require('express');
const { tarimaReciboCedis } = require('../controlleraplication/reciboCedisTarimaController');

const router = express.Router();

router.post('/tarimas', tarimaReciboCedis);

module.exports = router;
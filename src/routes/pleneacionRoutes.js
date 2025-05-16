const express = require('express');
const router = express.Router();
const {getSales, getSaleArrive} = require('../controller/planeacioncopntroller');

router.get('/sales', getSales);
router.get('/product', getSaleArrive);

module.exports = router; 
const express = require('express');
const router = express.Router();
const {getSales, getSaleArrive, getSalesByStatus} = require('../controller/planeacioncopntroller');

router.get('/sales', getSales);
router.get('/product', getSaleArrive);
router.get('/sales-estado', getSalesByStatus)

module.exports = router; 
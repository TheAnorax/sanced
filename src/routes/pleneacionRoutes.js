const express = require('express');
const router = express.Router();
const {getSales, getSaleArrive, getSalesByStatus, getPlacedOrders} = require('../controller/planeacioncopntroller');

router.get('/sales', getSales);
router.get('/product', getSaleArrive);
router.get('/sales-estado', getSalesByStatus)
router.get('/orders', getPlacedOrders)

module.exports = router; 
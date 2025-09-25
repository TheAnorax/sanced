const express = require('express');
const router = express.Router();
const {getSales, getSaleArrive, getSalesByStatus, getPlacedOrders, getFactura, getArriveOC, postQueretaro, getInfoOC, getObjClient, dataFacturas } = require('../controller/planeacioncopntroller');

router.get('/sales', getSales);
router.get('/product', getSaleArrive);
router.get('/sales-estado', getSalesByStatus)
router.get('/orders', getPlacedOrders)
router.post('/facturas', getFactura)
router.get('/arrive-oc', getArriveOC);
router.post('/queretaro', postQueretaro)
router.post('/info-oc', getInfoOC)
router.post('/info-ob-client', getObjClient)
router.post('/info-facturas', dataFacturas)

 
module.exports = router; 
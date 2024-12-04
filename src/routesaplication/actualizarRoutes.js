const express = require("express");
const { actualizarBahias, actualizarProductos, actualizarEmbarques, actualizarNoSurtidos, actualizarEstados, actualizarReabastecimiento } = require("../controlleraplication/actualizarController");


const router = express.Router();

router.post('/bahia', actualizarBahias);
router.post('/producto', actualizarProductos);
router.post('/embarques', actualizarEmbarques);
router.post('/nosurtido', actualizarNoSurtidos);
router.post('/estado', actualizarEstados);
router.get('/reabasto', actualizarReabastecimiento);


module.exports = router;
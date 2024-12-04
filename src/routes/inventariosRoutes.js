const express = require('express');
const router = express.Router();
const { getInventarios, autorizarRecibo, actualizarUbicacion,insertarNuevoProducto, getPeacking, updatePeacking,insertPeacking } = require('../controller/inventariosController');

router.get('/inventarios', getInventarios);
router.get('/inventarios/peacking', getPeacking)
router.put('/inventarios/updatePeacking', updatePeacking )
router.put('/inventarios/autorizar', autorizarRecibo); // Nueva ruta para autorizar
router.post('/inventarios/ActualizarUbi', actualizarUbicacion);
router.post('/inventarios/AgregarNuevaUbi', insertarNuevoProducto);
router.post('/inventarios/insertarPeaking', insertPeacking )



module.exports = router;

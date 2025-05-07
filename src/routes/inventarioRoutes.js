const express = require('express');
const router = express.Router();
const { obtenerInventarioUbicaciones, insertarUbicacion, actualizarUbicacion, eliminarUbicacion, obtenerTodosLosArribos, realizarTraspaso } = require('../controller/inventarioController');

router.get('/inventario-ubicaciones', obtenerInventarioUbicaciones);

router.post('/insertar-ubicacion', insertarUbicacion);

router.put('/actualizar-ubicacion', actualizarUbicacion);

router.delete("/eliminar-ubicacion/:id", eliminarUbicacion);

router.get('/arribos', obtenerTodosLosArribos);

router.post('/traspaso', realizarTraspaso);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getInventarios, autorizarRecibo, actualizarUbicacion,insertarNuevoProducto, getPeacking, updatePeacking,insertPeacking, obtenerUbiAlma, deleteTarea, getUbicacionesImpares, getUbicacionesPares, insertNuevaUbicacion } = require('../controller/inventariosController');

router.get('/inventarios', getInventarios);
router.get('/inventarios/peacking', getPeacking)
router.put('/inventarios/updatePeacking', updatePeacking )
router.put('/inventarios/autorizar', autorizarRecibo); // Nueva ruta para autorizar
router.post('/inventarios/ActualizarUbi', actualizarUbicacion);
router.post('/inventarios/AgregarNuevaUbi', insertarNuevoProducto);
router.post('/inventarios/insertarPeaking', insertPeacking )
router.get('/inventarios/obtenerUbiAlma', obtenerUbiAlma)
router.delete('/inventarios/borrar', deleteTarea)
router.get("/impares", getUbicacionesImpares)
router.get("/pares", getUbicacionesPares);
router.post('/inventarios/insertNuevaUbicacion', insertNuevaUbicacion)





module.exports = router;

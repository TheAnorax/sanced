const express = require('express');
const router = express.Router();
const { getUsuarios, getAccesosUsuario, updateAccesosUsuario, getSecciones } = require('../controller/usuariosController');

router.get('/usuarios', getUsuarios);
router.get('/secciones', getSecciones);
router.get('/:id/accesos', getAccesosUsuario); // Nueva ruta para obtener accesos de un usuario específico
router.put('/:id/accesos', updateAccesosUsuario); // Nueva ruta para actualizar accesos de un usuario específico

module.exports = router;

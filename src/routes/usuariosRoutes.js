const express = require('express');
const router = express.Router();
const { getUsuarios, getAccesosUsuario, updateAccesosUsuario, getSecciones, createUsuario, updateUsuario, deleteUsuario } = require('../controller/usuariosController');

router.get('/usuarios', getUsuarios);
router.get('/secciones', getSecciones);
router.get('/:id/accesos', getAccesosUsuario); // Nueva ruta para obtener accesos de un usuario específico
router.put('/:id/accesos', updateAccesosUsuario); // Nueva ruta para actualizar accesos de un usuario específico

router.get('/usuarios', getUsuarios);
router.post('/usuarios', createUsuario);
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);



module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { createUsuario, updateUsuario, deleteUsuario, getUsuarios } = require('../controllers/usuarios');

// router.get('/usuarios', getUsuarios);
// router.post('/usuarios', createUsuario);
// router.put('/usuarios/:id', updateUsuario);
// router.delete('/usuarios/:id', deleteUsuario);

// module.exports = router;

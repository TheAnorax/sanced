// src/routes/departamentalRoutes.js
const express = require('express');
const router = express.Router();
const { getpick7066, createPick7066,updatePick7066,  deletePick7066, } = require('../controller/departamantalController');

router.get('/plan', getpick7066);  
router.post('/create', createPick7066); // Agrega esta línea   
router.put('/update/:id', updatePick7066);   // ✅ Ruta para actualizar
router.delete('/delete/:id', deletePick7066); // ✅ Ruta para eliminar

module.exports = router;

const express = require('express');
const { insumoLista, reciboInsumo, newInsumo, updateInsumo, modifyInsumo, ingresoInsumos, Insumos, InsumosReducidos, embarquesLista } = require('../controlleraplication/insumo');




const router = express.Router();

router.get('/lista',insumoLista);

router.post('/obtnercodigo',reciboInsumo)

router.post('/newinsumo',newInsumo)

router.post('/updateinventario',updateInsumo)

router.post('/modifyInsumo',modifyInsumo)

router.post('/ingresoInsumos',ingresoInsumos)

router.get('/Insumosagregados', Insumos); 

router.get('/Insumosreducidos', InsumosReducidos);


module.exports = router;
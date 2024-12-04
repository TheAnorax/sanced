const express = require('express');
const { Obtenerinv, ReduccionInv, redInventario, Obtdatos, Obtdatosvacios, ObtenerUbi, Updateubi, ObtMaq, ObtCua, ObtExp, ObtSeg, ObtDev, ObtDif, ObtMue, BorrarAlm, Obtredinv } = require('../controlleraplication/InventarioController');


const router = express.Router();

router.post('/obtnercodigoInv',Obtenerinv)

router.post('/ReduccionInv',ReduccionInv)

router.post('/Obtredinv',redInventario)

router.post('/Obtubi',Obtdatos)

router.post('/ObtVaios',Obtdatosvacios)

router.post('/ObtenerUbi',ObtenerUbi)

router.post('/ActualizarUbi',Updateubi)

router.post('/ObtenerMaq',ObtMaq)

router.post('/ObtenerCua',ObtCua)

router.post('/ObtenerExp',ObtExp)

router.post('/ObtenerSeg',ObtSeg)

router.post('/ObtenerDev',ObtDev)

router.post('/ObtenerDiv',ObtDif)

router.post('/ObtenerMue',ObtMue)

router.post('/Borrar',BorrarAlm)

router.post('/Red_Ubi',Obtredinv)

module.exports = router;
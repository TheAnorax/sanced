const express = require('express');
const router = express.Router();
const { getVisitantes, getVisitanteId, createVisitante, upload } = require('../controller/visitantesController');
const { createVisita, darAccesoVisitante, getVisitas, getVisitasAct } = require('../controller/visitasController');
const { getTransportistas, createTransportista } = require('../controller/transportistasController');
const { getCategorias } = require('../controller/categoriasVisitasController');

router.get('/list/visitantes', getVisitantes);
router.get('/det/visitante/:id', getVisitanteId);
router.post('/create/visitante', upload.fields([{ name: 'foto', maxCount: 1 }]), createVisitante);

router.get('/agenda/hoy', getVisitas);
router.post('/create/visita', createVisita);
router.put('/up/acceso/:id_visit', darAccesoVisitante);
router.get('/agenda/activas', getVisitasAct);

router.get('/transportistas', getTransportistas);
router.post('/create/transportista', upload.fields([{ name: 'foto', maxCount: 1 }]), createTransportista);

router.get('/categorias', getCategorias);

module.exports = router;
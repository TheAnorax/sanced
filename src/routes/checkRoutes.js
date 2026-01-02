const express = require('express');
const router = express.Router();
const { obtenerChecklist, insertarChecklist, actualizarPartesChecklist, getHistorialChecklist } = require('../controller/checkController');

router.get("/checklist", obtenerChecklist);

router.post("/checklist-insert", insertarChecklist);

router.put("/checklist-update/:id", actualizarPartesChecklist);

router.get("/historial", getHistorialChecklist);


module.exports = router;

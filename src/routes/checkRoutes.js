const express = require('express');
const router = express.Router();
const { obtenerChecklist, insertarChecklist } = require('../controller/checkController');

router.get("/checklist", obtenerChecklist);

router.post("/checklist-insert", insertarChecklist);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getRecibo,
  updateVolumetria,
  saveRecibo,
  getRecibosPendientes,
  cancelarRecibo,
} = require("../controller/reciboController");

router.get("/recibo", getRecibo);
router.post("/guardarTarima", updateVolumetria); // Nueva ruta para actualizar datos
router.post("/guardarRecibo", saveRecibo);

router.get("/recibos-pendientes", getRecibosPendientes);
router.put("/cancelar", cancelarRecibo);

module.exports = router;

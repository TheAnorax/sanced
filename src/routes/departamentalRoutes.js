const express = require("express");
const router = express.Router();
const {
  getpick7066,
  createPick7066,
  updatePick7066,
  deletePick7066,
  getDepartamental,
  crearDepartamental,
  actualizarDepartamentalPorVD,
  obtenerCedisDestinoPorCliente,
  obtenerSiguienteFolio,
  obtenerClientesValidos,
} = require("../controller/departamantalController");

router.get("/plan", getpick7066);

router.post("/create", createPick7066); // Agrega esta línea

router.put("/update/:id", updatePick7066); //  Ruta para actualizar

router.delete("/delete/:id", deletePick7066); //  Ruta para eliminar

router.get("/datos", getDepartamental);

router.post("/crear", crearDepartamental);

router.put("/actualizar/VD/:VD", actualizarDepartamentalPorVD);

router.get("/opciones/:cliente", obtenerCedisDestinoPorCliente);

router.get("/siguiente-folio", obtenerSiguienteFolio);

router.get("/clientes-validos", obtenerClientesValidos)

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getInventarios,
  autorizarRecibo,
  actualizarUbicacion,
  insertarNuevoProducto,
  getPeacking,
  updatePeacking,
  insertPeacking,
  obtenerUbiAlma,
  deleteTarea,
  getUbicacionesImpares,
  getUbicacionesPares,
  insertNuevaUbicacion,
  deletepickUnbi,
  getProductsWithoutLocation,
  modificacionesRoutes,
  obtenerInventario,
  obtenerUbicacion,
  actualizarInventario,
  crearUbicacion,
  obtenerProgresoPorPasillo
} = require("../controller/inventariosController");

router.get("/inventarios", getInventarios);
router.get("/inventarios/peacking", getPeacking);
router.put("/inventarios/updatePeacking", updatePeacking);
router.put("/inventarios/autorizar", autorizarRecibo); // Nueva ruta para autorizar
router.post("/inventarios/ActualizarUbi", actualizarUbicacion);
router.post("/inventarios/AgregarNuevaUbi", insertarNuevoProducto);
router.post("/inventarios/insertarPeaking", insertPeacking);
router.get("/inventarios/obtenerUbiAlma", obtenerUbiAlma);
router.delete("/inventarios/borrar", deleteTarea);
router.get("/impares", getUbicacionesImpares);
router.get("/pares", getUbicacionesPares);
router.post("/inventarios/insertNuevaUbicacion", insertNuevaUbicacion);
// En tu archivo de deletepickUnbi
router.post("/inventarios/borrarPick", deletepickUnbi);
router.get("/inventarios/sinubicacion", getProductsWithoutLocation);

router.use("/modificaciones", modificacionesRoutes);

router.get("/obtenerInventario/", obtenerInventario);
router.get("/obtenerUbicacion/:id_ubi", obtenerUbicacion);
router.put("/actualizarInventario/:id_ubi", actualizarInventario);

// ======== 🧾 NUEVA API ALMACENAMIENTO ======== //
router.get("/obtenerInventario", obtenerInventario);
router.get("/obtenerUbicacion/:id_ubi", obtenerUbicacion);
router.put("/actualizarInventario/:id_ubi", actualizarInventario);

router.post("/crear-ubicacion", crearUbicacion);
router.get("/progreso-pasillo", obtenerProgresoPorPasillo);

module.exports = router;

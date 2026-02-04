const express = require("express");
const {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
  addSeguimiento,
  getDetalleTarea,
  getDesarrolladores,
  getProyectos
} = require('../controller/devController');

const router = express.Router();

// Tareas
router.get("/tareas", getTareas);
router.post("/tareas", createTarea);
router.put("/tareas/:id", updateTarea);
router.delete("/tareas/:id", deleteTarea);

// Detalle y seguimiento
router.get("/tareas/:id", getDetalleTarea);
router.post("/tareas/seguimiento", addSeguimiento);


router.get("/desarrolladores", getDesarrolladores);
router.get("/proyectos", getProyectos);
module.exports = router;

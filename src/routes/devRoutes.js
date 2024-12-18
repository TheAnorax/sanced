const express = require('express');
const {
  getDevTerea,
  createTarea,
  updateTarea,
  deleteTarea,
} = require('../controller/devController');

const router = express.Router();

// Ruta para obtener todas las tareas
router.get('/tareas', getDevTerea);

// Ruta para crear una nueva tarea
router.post('/tareas', createTarea);

// Ruta para actualizar el estado de una tarea específica
router.put('/tareas/:id', updateTarea);

// Ruta para eliminar una tarea específica
router.delete('/tareas/:id', deleteTarea);

module.exports = router;

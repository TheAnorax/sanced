const pool = require('../config/database');


const getDevTerea = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tareas_dev');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas', error: error.message });
  }
};

const createTarea = async (req, res) => {
    const { titulo, descripcion, asignado_a } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO tareas_dev (titulo, descripcion, asignado_a, estado) VALUES (?, ?, ?, "Pendiente")',
        [titulo, descripcion, asignado_a]
      );
      res.status(201).json({ id: result.insertId, titulo, descripcion, asignado_a, estado: "Pendiente" });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la tarea', error: error.message });
    }
  };

  const updateTarea = async (req, res) => {
    const { id } = req.params;
    const { estado, comentarios, realizado_por } = req.body;
    try {
      await pool.query(
        'UPDATE tareas_dev SET estado = ?, fecha_actualizacion = NOW() WHERE id = ?',
        [estado, id]
      );
      await pool.query(
        'INSERT INTO movimientos_tareas (id_tarea, id_usuario, estado_anterior, estado_nuevo, comentarios) VALUES (?, ?, ?, ?, ?)',
        [id, realizado_por, "Anterior", estado, comentarios]
      );
      res.json({ message: 'Estado de la tarea actualizado' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la tarea', error: error.message });
    }
  };
  
  
  const deleteTarea = async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM tareas_dev WHERE id = ?', [id]);
      res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la tarea', error: error.message });
    }
  };
  













  module.exports = {
    getDevTerea,
    createTarea,
    updateTarea,
    deleteTarea
  };
  
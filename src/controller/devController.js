const pool = require('../config/database');


const getDevTerea = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT 
  t.id,
  t.titulo,
  t.area,
  t.descripcion,
  t.asignado_a,
  us.name AS asignado,
  u.name AS asignador,
  t.asignador,
  t.estado,
  t.fecha_creacion,
  t.fecha_actualizacion,
  t.fecha_inicio,
  t.fecha_fin
  FROM tareas_dev t
   LEFT JOIN usuarios us ON t.asignado_a  = us.id_usu
   LEFT JOIN usuarios u ON t.asignador  = u.id_usu`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas', error: error.message });
  }
};

const createTarea = async (req, res) => {
  const { titulo, descripcion, asignado_a, asignador, area, fecha_inicio, fecha_fin } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO tareas_dev (titulo, descripcion, asignado_a, asignador, area, estado, fecha_inicio, fecha_fin, fecha_creacion) 
       VALUES (?, ?, ?, ?, ?, "Pendiente", ?, ?, NOW())`,
      [titulo, descripcion, asignado_a, asignador, area, fecha_inicio, fecha_fin]
    );

    res.status(201).json({
      id: result.insertId,
      titulo,
      descripcion,
      asignado_a,
      asignador,
      area,
      estado: "Pendiente",
      fecha_inicio,
      fecha_fin,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la tarea", error: error.message });
  }
};



const updateTarea = async (req, res) => {
  const { id } = req.params;
  const { estado, titulo, descripcion, area, fecha_inicio, fecha_fin } = req.body;

  try {
    // Si algún campo no viene en la solicitud, usa los valores existentes
    const [currentTarea] = await pool.query('SELECT * FROM tareas_dev WHERE id = ?', [id]);
    if (currentTarea.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const updatedTarea = {
      estado: estado || currentTarea[0].estado,
      titulo: titulo || currentTarea[0].titulo,
      descripcion: descripcion || currentTarea[0].descripcion,
      area: area || currentTarea[0].area,
      fecha_inicio: fecha_inicio || currentTarea[0].fecha_inicio,
      fecha_fin: fecha_fin || currentTarea[0].fecha_fin,
    };

    await pool.query(
      `UPDATE tareas_dev SET estado = ?, titulo = ?, descripcion = ?, area = ?, fecha_inicio = ?, fecha_fin = ?, fecha_actualizacion = NOW() WHERE id = ?`,
      [
        updatedTarea.estado,
        updatedTarea.titulo,
        updatedTarea.descripcion,
        updatedTarea.area,
        updatedTarea.fecha_inicio,
        updatedTarea.fecha_fin,
        id,
      ]
    );

    res.json({ message: 'Tarea actualizada correctamente' });
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
  
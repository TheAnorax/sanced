const pool = require("../config/database");

/**
 * =====================================
 * 1️⃣ OBTENER TODAS LAS TAREAS (DASHBOARD)
 * =====================================
 * Muestra:
 * - Proyecto
 * - Desarrollador
 * - Estado
 * - Prioridad
 * - Fechas
 */
const getTareas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.prioridad,
        t.estado,
        t.fecha_asignacion,
        t.fecha_compromiso,
        t.fecha_cierre,
        t.horas_estimadas,
        t.horas_reales,

        d.id_dev,
        d.nombre_completo AS desarrollador,

        p.id_proyecto,
        p.nombre_proyecto

      FROM tareas t
      LEFT JOIN desarrolladores d ON d.id_dev = t.id_dev
      LEFT JOIN proyectos p ON p.id_proyecto = t.id_proyecto
      ORDER BY t.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error getTareas:", error);
    res.status(500).json({ message: "Error al obtener tareas" });
  }
};

/**
 * ============================
 * 2️⃣ CREAR NUEVA TAREA
 * ============================
 */
const createTarea = async (req, res) => {
  const {
    titulo,
    descripcion,
    prioridad,
    id_dev,
    id_proyecto,
    fecha_compromiso,
    horas_estimadas,
  } = req.body;

  try {
    const [result] = await pool.query(
      `
      INSERT INTO tareas (
        titulo,
        descripcion,
        prioridad,
        id_dev,
        id_proyecto,
        fecha_asignacion,
        fecha_compromiso,
        estado,
        horas_estimadas
      )
      VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'Pendiente', ?)
      `,
      [
        titulo,
        descripcion,
        prioridad,
        id_dev,
        id_proyecto,
        fecha_compromiso,
        horas_estimadas,
      ]
    );

    res.status(201).json({
      id_tarea: result.insertId,
      titulo,
      estado: "Pendiente",
    });
  } catch (error) {
    console.error("❌ Error createTarea:", error);
    res.status(500).json({ message: "Error al crear tarea" });
  }
};

/**
 * ============================
 * 3️⃣ ACTUALIZAR ESTADO / DATOS
 * ============================
 */
const updateTarea = async (req, res) => {
  const { id } = req.params;
  const {
    estado,
    prioridad,
    horas_reales,
  } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Verificar que la tarea exista y obtener estado actual
    const [[tareaActual]] = await conn.query(
      `
      SELECT estado, fecha_cierre
      FROM tareas
      WHERE id_tarea = ?
      `,
      [id]
    );

    if (!tareaActual) {
      await conn.rollback();
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const estadoAnterior = tareaActual.estado;

    // 2️⃣ Actualizar tarea
    await conn.query(
      `
      UPDATE tareas
      SET
        estado = IFNULL(?, estado),
        prioridad = IFNULL(?, prioridad),
        fecha_cierre = CASE
          WHEN ? = 'Finalizada' AND fecha_cierre IS NULL THEN CURDATE()
          ELSE fecha_cierre
        END,
        horas_reales = IFNULL(?, horas_reales)
      WHERE id_tarea = ?
      `,
      [
        estado,
        prioridad,
        estado,
        horas_reales,
        id,
      ]
    );

    // 3️⃣ Registrar historial SOLO si cambió el estado
    if (estado && estado !== estadoAnterior) {
      await conn.query(
        `
        INSERT INTO historial_tareas (
          id_tarea,
          estado_anterior,
          estado_nuevo
        )
        VALUES (?, ?, ?)
        `,
        [id, estadoAnterior, estado]
      );
    }

    await conn.commit();

    res.json({
      message: "Tarea actualizada correctamente",
      estado_anterior: estadoAnterior,
      estado_nuevo: estado || estadoAnterior,
    });
  } catch (error) {
    await conn.rollback();
    console.error("❌ Error updateTarea:", error);
    res.status(500).json({ message: "Error al actualizar tarea" });
  } finally {
    conn.release();
  }
};


/**
 * ============================
 * 4️⃣ ELIMINAR TAREA
 * ============================
 */
const deleteTarea = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `DELETE FROM tareas WHERE id_tarea = ?`,
      [id]
    );

    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    console.error("❌ Error deleteTarea:", error);
    res.status(500).json({ message: "Error al eliminar tarea" });
  }
};

/**
 * ============================
 * 5️⃣ SEGUIMIENTO / COMENTARIOS
 * ============================
 */
const addSeguimiento = async (req, res) => {
  const { id_tarea, comentario, avance_porcentaje } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO seguimiento_tareas (
        id_tarea,
        comentario,
        avance_porcentaje
      )
      VALUES (?, ?, ?)
      `,
      [id_tarea, comentario, avance_porcentaje]
    );

    res.json({ message: "Seguimiento agregado" });
  } catch (error) {
    console.error("❌ Error seguimiento:", error);
    res.status(500).json({ message: "Error al agregar seguimiento" });
  }
};

/**
 * ============================
 * 6️⃣ DETALLE DE UNA TAREA
 * ============================
 */
const getDetalleTarea = async (req, res) => {
  const { id } = req.params;

  try {
    const [[tarea]] = await pool.query(`
      SELECT
        t.*,
        d.nombre_completo AS desarrollador,
        p.nombre_proyecto
      FROM tareas t
      LEFT JOIN desarrolladores d ON d.id_dev = t.id_dev
      LEFT JOIN proyectos p ON p.id_proyecto = t.id_proyecto
      WHERE t.id_tarea = ?
    `, [id]);

    const [seguimiento] = await pool.query(
      `SELECT * FROM seguimiento_tareas WHERE id_tarea = ? ORDER BY fecha DESC`,
      [id]
    );

    res.json({ tarea, seguimiento });
  } catch (error) {
    console.error("❌ Error detalle tarea:", error);
    res.status(500).json({ message: "Error al obtener detalle" });
  }
};

// ============================
// OBTENER DESARROLLADORES
// ============================
const getDesarrolladores = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_dev, nombre_completo
      FROM desarrolladores
      WHERE activo = 1
      ORDER BY nombre_completo
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error getDesarrolladores:", error);
    res.status(500).json({ message: "Error al obtener desarrolladores" });
  }
};

// ============================
// OBTENER PROYECTOS
// ============================
const getProyectos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_proyecto, nombre_proyecto
      FROM proyectos
      WHERE estado <> 'Finalizado'
      ORDER BY nombre_proyecto
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error getProyectos:", error);
    res.status(500).json({ message: "Error al obtener proyectos" });
  }
};


module.exports = {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
  addSeguimiento,
  getDetalleTarea,
  getDesarrolladores,
  getProyectos
};

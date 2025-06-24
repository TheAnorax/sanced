const pool = require('../config/database'); // Conexión a la base de datos

// Función para insertar datos en la tabla repo_prob
const Upload_Report_Prob = async (req, res) => {
  try {
    // Extraemos los datos del cuerpo de la solicitud
    const {
      tip_rep,
      motivo,
      encargado,
      area,
      sku,
      desc_sku,
      desc_prob,
      remitente,
      no_pedido,
      pzs,
      turno,
      fecha,
      hora,
    } = req.body;

    // Consulta SQL para insertar los datos en la tabla repo_prob
    const query = `
      INSERT INTO repo_prob (
        tip_rep,
        motivo,
        encargado,
        area,
        sku,
        desc_sku,
        desc_prob,
        remitente,
        no_pedido,
        pzs,
        turno,
        fecha,
        hora
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta con los valores proporcionados
    const [result] = await pool.query(query, [
      tip_rep,
      motivo,
      encargado,
      area,
      sku || null,
      desc_sku || null,
      desc_prob,
      remitente,
      no_pedido || null,
      pzs || null,
      turno || null,
      fecha,
      hora,
    ]);

    console.log("Log: Datos insertados correctamente en repo_prob.");
    res.status(200).json({ message: "Reporte guardado exitosamente", result });
  } catch (error) {
    console.error("Error en Upload_Report_Prob:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Nueva función para obtener datos de la tabla "productos" como middleware
const get_SKU_Info = async (req, res, next) => {
  try {
    // Consulta SQL para obtener los campos "codigo_pro" y "des" de la tabla "productos"
    const query = "SELECT codigo_pro, des FROM productos";

    // Ejecutar la consulta
    const [rows] = await pool.query(query);

    // Retornar los resultados obtenidos como respuesta
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error en get_SKU_Info:", error);

    // Enviar un error al cliente
    res.status(500).json({ error: "Error al obtener información de SKU" });
  }
};

// Nueva función para obtener todos los datos de la tabla "repo_prob"
const Get_Repo_Info = async (req, res, next) => {
  try {
    // Consulta SQL para obtener todos los campos de la tabla "repo_prob"
    const query = "SELECT * FROM repo_prob";

    // Ejecutar la consulta
    const [rows] = await pool.query(query);

    // Retornar los resultados obtenidos como respuesta
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error en Get_Repo_Info:", error);

    // Enviar un error al cliente
    res.status(500).json({ error: "Error al obtener información de repo_prob" });
  }
};

// Función para actualizar el estado en la tabla `repo_prob`
const Update_Status = async (req, res) => {
  const { id, newStatus } = req.body;
  console.log("Solicitud recibida:", req.body); 

  if (!id || !newStatus) {
    return res.status(400).json({ message: "Faltan datos en la solicitud." });
  }

  try {
    const query = "UPDATE repo_prob SET estatus = ? WHERE id_rep = ?";
    const result = await pool.query(query, [newStatus, id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Estatus actualizado correctamente." });
    } else {
      res.status(404).json({ message: "Reporte no encontrado." });
    }
  } catch (error) {
    console.error("Error al actualizar el estatus:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Función para eliminar un reporte
const Delete_Repo = async (req, res) => {
  const { id } = req.query; // Obtener el ID del reporte desde los parámetros de consulta

  if (!id) {
    return res.status(400).json({ message: "El ID del reporte es requerido." });
  }

  try {
    const query = "DELETE FROM repo_prob WHERE id_rep = ?";
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Reporte eliminado correctamente." });
    } else {
      res.status(404).json({ message: "Reporte no encontrado." });
    }
  } catch (error) {
    console.error("Error al eliminar el reporte:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = { Upload_Report_Prob, get_SKU_Info, Get_Repo_Info, Update_Status, Delete_Repo };
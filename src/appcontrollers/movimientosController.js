const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para consultar información de una ubicación específica
const consultarUbicacionEspecifica = async (req, res) => {
  console.log("Consulta de ubicación específica:", req.body);
  const { ubicacion } = req.body;

  if (!ubicacion) {
    return res.status(400).json({ error: "La ubicación es requerida" });
  }

  const query = `
    SELECT 
      u.id_ubi,
      prod.des,    
      u.ubi, 
      u.code_prod,     
      u.cant_stock 
    FROM ubi_alma u
    LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
    WHERE u.ubi = ?;
  `;

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool

    // Ejecutar la consulta
    const [results] = await connection.query(query, [ubicacion]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    // Estructura la respuesta con los datos de la ubicación
    const response = {
      id_ubicacion: results[0].id_ubi,
      descripcion: results[0].des,
      ubicacion: results[0].ubi,
      codigo_producto: results[0].code_prod,
      cantidad_stock: results[0].cant_stock 
    };

    res.status(200).json(response); // Retornar la respuesta estructurada
  } catch (error) {
    console.error("Error en la consulta de ubicación:", error);
    res.status(500).send("Error en la consulta de ubicación");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { consultarUbicacionEspecifica };

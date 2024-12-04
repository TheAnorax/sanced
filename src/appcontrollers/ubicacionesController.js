const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para consultar las ubicaciones de un producto
const consultaUbicaciones = async (req, res) => {
  console.log("Consulta de ubicaciones:", req.body);
  const { codigo_pro } = req.body;

  if (!codigo_pro) {
    return res.status(400).json({ error: "codigo_pro es requerido" });
  }

  const query = `
    SELECT 
      prod.des,    
      u.ubi,         
      u.cant_stock 
    FROM ubi_alma u
    LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
    WHERE u.code_prod = ?;
  `;

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool

    // Ejecuta la consulta
    const [results] = await connection.query(query, [codigo_pro]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Estructura la respuesta con encabezado y lista de ubicaciones
    const response = {
      descripcion: results[0].des, // Encabezado con la descripción del producto
      ubicaciones: results.map(row => ({
        ubicacion: row.ubi,
        cantidad_stock: row.cant_stock
      }))
    };

    res.status(200).json(response); // Retorna la respuesta estructurada
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).send("Error en la consulta");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { consultaUbicaciones };

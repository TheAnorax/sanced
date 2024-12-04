const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para actualizar el estado del embarque en pedido_embarque
const actualizarEmbarque = async (req, res) => {
  //console.log("finemb", req.body);
  const { pedido } = req.body;
  const estado = "F";

  const updatePedidoQuery = `
    UPDATE pedido_embarque 
    SET estado = ?, 
        fin_embarque = IF(fin_embarque IS NULL, NOW(), fin_embarque) 
    WHERE pedido = ?;
  `;

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool
    await connection.beginTransaction();

    // Ejecuta la actualización del estado del embarque
    await connection.query(updatePedidoQuery, [estado, pedido]);

    await connection.commit();
    res.status(200).json({ message: "Estado de embarque actualizado correctamente" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { actualizarEmbarque };

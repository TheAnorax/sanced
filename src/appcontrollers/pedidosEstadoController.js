// controllers/pedidosEstadoController.js
const pool = require('../config/database'); // Configuración de la base de datos

const actualizarEstadoPedido = async (req, res) => {
  console.log(req.body);
  const { pedidoId, productoId } = req.body;
  const nuevoEstado = "B";

  const updateQuery = `
    UPDATE pedido_surtido 
    SET estado = ?, fin_surtido = NOW() 
    WHERE id_pedi = ? 
    AND (cant_surti = cantidad OR (cant_surti = 0 AND cant_no_env = cantidad))
  `;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [updateResult] = await connection.query(updateQuery, [nuevoEstado, productoId]);

    if (updateResult.affectedRows > 0) {
      const totalQuery = "SELECT COUNT(*) AS total FROM pedido_surtido WHERE pedido = ?";
      const [totalResults] = await connection.query(totalQuery, [pedidoId]);
      const totalProducts = totalResults[0].total;

      const countBQuery = "SELECT COUNT(*) AS count FROM pedido_surtido WHERE pedido = ? AND estado = ?";
      const [countBResults] = await connection.query(countBQuery, [pedidoId, nuevoEstado]);
      const countB = countBResults[0].count;

      if (countB === totalProducts) {
        const queryBahia = "UPDATE bahias SET estado = 2 WHERE id_pdi = ?";
        await connection.query(queryBahia, [pedidoId]);
      }

      await connection.commit();
      res.json({ message: "Estado del pedido actualizado exitosamente" });
    } else {
      await connection.rollback();
      res.status(400).json({ message: "No se cumplieron las condiciones para actualizar el estado del pedido" });
    }
  } catch (error) {
    if (connection) await connection.rollback();
  console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { actualizarEstadoPedido };

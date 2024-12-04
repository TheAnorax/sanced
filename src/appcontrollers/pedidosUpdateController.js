// controllers/pedidosController.js
const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para actualizar la cantidad surtida
const actualizarCantidadSurtida = async (req, res) => {
  console.log("Request received:", req.body);

  const {
    pedido: pedidoId,
    producto: id_pedi,
    cantumsurt: cant_des,
    um,
    usuarioS
  } = req.body;

  const cant_surti_um = 1;

  // Define las consultas SQL para actualizar cada tipo de unidad de medida
  const updateQueries = {
    PZ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    BL: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    ATADO: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    JG: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    CJ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    PQ: "UPDATE pedido_surtido SET _pq = _pq + ? WHERE pedido = ? AND id_pedi = ?;",
    INNER: "UPDATE pedido_surtido SET _inner = _inner + ? WHERE pedido = ? AND id_pedi = ?;",
    MASTER: "UPDATE pedido_surtido SET _master = _master + ? WHERE pedido = ? AND id_pedi = ?;",
    PQTE: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;"
  };

  const updatePedidoQuery = `
    UPDATE pedido_surtido 
    SET cant_surti = cant_surti + ?, 
        id_usuario_surtido = ?,  
        inicio_surtido = IF(inicio_surtido IS NULL, NOW(), inicio_surtido)
    WHERE pedido = ? AND id_pedi = ? AND cant_surti < cantidad;
  `;

  const updateUmQuery = updateQueries[um];

  if (!updateUmQuery) {
    return res.status(400).send("Unidad de medida no soportada");
  }

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool
    await connection.beginTransaction();

    // Ejecuta la actualización del pedido
    const [resultPedido] = await connection.query(updatePedidoQuery, [cant_des, usuarioS, pedidoId, id_pedi]);

    // Verifica si se actualizó `cant_surti` antes de actualizar la UM
    if (resultPedido.affectedRows > 0) {
      await connection.query(updateUmQuery, [cant_surti_um, pedidoId, id_pedi]);
    } else {
      console.warn("No rows affected for cant_surti update. Check your conditions.");
    }

    await connection.commit();
    res.status(200).json({ message: "Cantidad surtida actualizada correctamente" });
  } catch (transactionError) {
    if (connection) await connection.rollback();
    console.error("Error en la transacción:", transactionError);
    res.status(500).send("Error en la transacción");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { actualizarCantidadSurtida };

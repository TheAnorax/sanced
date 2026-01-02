const pool = require('../config/database');

const actualizarCantidadSurtida = async (req, res) => {
  // console.log("Request received:", req.body);

  const {
    pedido: pedidoId,
    producto: id_pedi,
    codigo_ped,
    nuevaCantidadSurtida,
    cantumsurt: cant_des,
    pedido,
    um,
    usuarioS,
    origen 
  } = req.body;

  const cant_surti_um = origen === 'offline' ? nuevaCantidadSurtida : 1;

  const totalUnidades = origen === 'offline'
  ? nuevaCantidadSurtida * cant_des
  : cant_des;

  const updateQueries = {
    PZ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    ATADO: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    BL: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    CJ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    EM: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    JG: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    PQ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
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
    return res.status(400).json({ error: "Unidad de medida no soportada" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 🔍 Verifica si el pedido existe y si `cant_surti` es menor que `cantidad`
    const [pedidoCheck] = await connection.query(
      "SELECT pedido, id_pedi, cant_surti, cantidad FROM pedido_surtido WHERE pedido = ? AND id_pedi = ?",
      [pedidoId, id_pedi]
    );

    if (pedidoCheck.length === 0) {
      throw new Error(`El pedido ${pedidoId} con producto ${id_pedi} no existe en la tabla pedido_surtido.`);
    }

    const { cant_surti, cantidad } = pedidoCheck[0];

    if (cant_surti >= cantidad) {
      //console.log(`El pedido ${pedidoId} con producto ${id_pedi} ya está completamente surtido.`);
      return res.status(200).json({ message: "El pedido ya ha sido surtido completamente. No se descuenta stock." });
    }

    // 🔄 Actualizar pedido_surtido primero
    const [resultPedido] = await connection.query(updatePedidoQuery, [totalUnidades, usuarioS, pedidoId, id_pedi]);

    if (resultPedido.affectedRows > 0) {
      await connection.query(updateUmQuery, [cant_surti_um, pedidoId, id_pedi]);

      await connection.commit();  // ✅ Confirmar pedido_surtido para que no se revierta
    } else {
      throw new Error("No se pudo actualizar `cant_surti`, verifica las condiciones.");
    }

  } catch (transactionError) {
    if (connection) await connection.rollback();  // 🔄 Rollback solo si falla pedido_surtido
  //console.error("Error en la transacción pedido_surtido:", transactionError);
    return res.status(500).json({ error: "Error en la transacción pedido_surtido: " + transactionError.message });
  } finally {
    if (connection) connection.release();
  }

  // 👉 **Aquí comienza la transacción de `ubicaciones`**
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 🔍 Buscar la ubicación con mayor `cant_stock_real`
    const [ubicaciones] = await connection.query(
      "SELECT id_ubi, cant_stock_real, ubi, almacen FROM ubicaciones WHERE code_prod = ? ORDER BY cant_stock_real DESC LIMIT 1",
      [codigo_ped]
    );

    if (ubicaciones.length === 0) {
      throw new Error(`No se encontró el producto con código ${codigo_ped} en la tabla de ubicaciones.`);
    }

    const { id_ubi, cant_stock_real, ubi, almacen } = ubicaciones[0];

    if (cant_stock_real < totalUnidades) {
      throw new Error(`Stock insuficiente en la mejor ubicación (${ubi}). Disponible: ${cant_stock_real}, Intentando descontar: ${totalUnidades}`);
    }

    // 🔄 Descontar stock en la ubicación seleccionada
    const [updateStock] = await connection.query(
      "UPDATE ubicaciones SET cant_stock_real = cant_stock_real - ? WHERE id_ubi = ?",
      [totalUnidades, id_ubi]
    );

    if (updateStock.affectedRows === 0) {
      throw new Error("No se pudo actualizar el stock en la ubicación.");
    }

    // 📌 Registrar el movimiento en `historial_surtido`
    await connection.query(
      `INSERT INTO historial_surtido 
         (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
        VALUES (?, ?, ?, ?, NULL, ?, ?, NOW(), ?)`,
       ["Picking", "PedidoSurtido", codigo_ped, totalUnidades, "Almacén", pedido, usuarioS]
     );

    await connection.commit();  // ✅ Confirmar cambios en ubicaciones

    res.status(200).json({ message: "Cantidad surtida actualizada y stock descontado correctamente." });

  } catch (transactionError) {
    if (connection) await connection.rollback();  // 🔄 Rollback solo si falla ubicaciones
    // console.error("Error en la transacción ubicaciones:", transactionError);
    res.status(500).json({ error: "Error en la transacción ubicaciones: " + transactionError.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { actualizarCantidadSurtida };

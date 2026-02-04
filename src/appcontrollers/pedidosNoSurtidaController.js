// controllers/pedidosNoSurtidaController.js
const pool = require('../config/database');

const actualizarCantidadNoSurtida = async (req, res) => {
  console.log('Faltante', req.body);
  const { pedido, producto, motivo } = req.body;
  const estado = "B";

  const selectQuery = `
    SELECT cantidad, cant_surti, codigo_ped 
    FROM pedido_surtido 
    WHERE pedido = ? AND id_pedi = ?
  `;

  const updateQuery = `
    UPDATE pedido_surtido 
    SET cant_no_env = ?, 
        motivo = ?, 
        inicio_surtido = IF(inicio_surtido IS NULL, NOW(), inicio_surtido), 
        fin_surtido = IF(fin_surtido IS NULL, NOW(), fin_surtido), 
        estado = ?
    WHERE pedido = ? AND id_pedi = ?
  `;

  const insertAlertaQuery = `
    INSERT INTO alertas_negacion
    (pedido, id_pedi, codigo_ped, origen, motivo, cantidad_no_env)
    VALUES (?, ?, ?, 'surtido', ?, ?)
  `;

  const existeAlertaQuery = `
    SELECT id 
    FROM alertas_negacion 
    WHERE pedido = ? 
      AND id_pedi = ?
      AND enviada_whatsapp = 0
    LIMIT 1
  `;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Obtener datos actuales
    const [results] = await connection.query(selectQuery, [pedido, producto]);
    if (results.length === 0) {
      await connection.rollback();
      return res.status(404).send("Pedido no encontrado");
    }

    const { cantidad, cant_surti, codigo_ped } = results[0];
    const cant_no_env = cantidad - cant_surti;

    // 2️⃣ Actualizar pedido_surtido
    await connection.query(updateQuery, [
      cant_no_env,
      motivo,
      estado,
      pedido,
      producto
    ]);

    // 3️⃣ Registrar alerta SOLO si hay negación real
    if (cant_no_env > 0) {
      const [existe] = await connection.query(existeAlertaQuery, [
        pedido,
        producto
      ]);

      if (existe.length === 0) {
        await connection.query(insertAlertaQuery, [
          pedido,
          producto,
          codigo_ped,
          motivo,
          cant_no_env
        ]);
      }
    }

    await connection.commit();

    res.status(200).json({
      message: "Cantidad no surtida actualizada correctamente",
      cant_no_env
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { actualizarCantidadNoSurtida };

// const pool = require('../config/database'); // Importa la configuración de la base de datos

// // Controlador para actualizar el estado del embarque en pedido_embarque
// const actualizarEmbarque = async (req, res) => {
//   //console.log("finemb", req.body);
//   const { pedido } = req.body;
//   const estado = "F";

//   const updatePedidoQuery = `
//     UPDATE pedido_embarque
//     SET estado = ?,
//         fin_embarque = IF(fin_embarque IS NULL, NOW(), fin_embarque)
//     WHERE pedido = ?;
//   `;

//   let connection;
//   try {
//     connection = await pool.getConnection(); // Obtiene una conexión del pool
//     await connection.beginTransaction();

//     // Ejecuta la actualización del estado del embarque
//     await connection.query(updatePedidoQuery, [estado, pedido]);

// await connection.query(`
//   START TRANSACTION;

//   INSERT INTO pedido_finalizado (
//     pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um,
//     _pz, _pq, _inner, _master, v_pz, v_pq, v_inner, v_master,
//     ubi_bahia, estado, id_usuario, registro, inicio_surtido, fin_surtido,
//     unido, id_usuario_paqueteria, id_usuario_surtido, registro_surtido,
//     registro_embarque, inicio_embarque, fin_embarque, motivo, unificado,  registro_fin, caja
//   )
//   SELECT
//     pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um,
//     _pz, _pq, _inner, _master, v_pz, v_pq, v_inner, v_master,
//     ubi_bahia, estado, id_usuario, registro, inicio_surtido, fin_surtido,
//     unido, id_usuario_paqueteria, id_usuario_surtido, registro_surtido,
//     registro_embarque, inicio_embarque, fin_embarque, motivo, unificado, NOW(), caja
//   FROM pedido_embarque
//   WHERE estado ="F";

//   DELETE FROM pedido_embarque
//   WHERE estado ="F";

//   COMMIT;`)

//     await connection.commit();
//     res.status(200).json({ message: "Estado de embarque actualizado correctamente" });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("Error en la transacción:", error);
//     res.status(500).send("Error en la transacción");
//   } finally {
//     if (connection) connection.release();
//   }
// };

// module.exports = { actualizarEmbarque };

const pool = require("../config/database"); // Importa la configuración de la base de datos

const actualizarEmbarque = async (req, res) => {
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
    await connection.beginTransaction(); // Iniciar la transacción

    // ✅ Actualiza el estado del pedido en `pedido_embarque`
    const [updateResult] = await connection.query(updatePedidoQuery, [
      estado,
      pedido,
    ]);

    // 🔍 Verifica si realmente se actualizó algún registro
    if (updateResult.affectedRows === 0) {
      throw new Error(`No se encontró el pedido ${pedido} en pedido_embarque.`);
    }

    // ✅ Insertar en `pedido_finalizado`
    const [insertResult] = await connection.query( 
      `
      INSERT INTO pedido_finalizado (
        pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um, 
        _pz, _pq, _inner, _master, v_pz, v_pq, v_inner, v_master, 
        ubi_bahia, estado, id_usuario, registro, inicio_surtido, fin_surtido, 
        unido, id_usuario_paqueteria, id_usuario_surtido, registro_surtido, 
        registro_embarque, inicio_embarque, fin_embarque, motivo, unificado,  registro_fin, caja, cajas, fusion,tipo_caja
      )
      SELECT 
        pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um, 
        _pz, _pq, _inner, _master, v_pz, v_pq, v_inner, v_master, 
        ubi_bahia, estado, id_usuario, registro, inicio_surtido, fin_surtido, 
        unido, id_usuario_paqueteria, id_usuario_surtido, registro_surtido, 
        registro_embarque, inicio_embarque, fin_embarque, motivo, unificado, NOW(), caja, cajas, fusion,tipo_caja
      FROM pedido_embarque
      WHERE estado = ?;
    `,
      [estado]
    );

    // 🔍 Si no se insertaron registros, no ejecutar el DELETE
    if (insertResult.affectedRows > 0) {
      await connection.query(`DELETE FROM pedido_embarque WHERE estado = ?;`, [
        estado,
      ]);
    }

    await connection.commit(); // Confirmar la transacción

    res
      .status(200)
      .json({ message: "✅ Estado de embarque actualizado correctamente" });
  } catch (error) {
    if (connection) await connection.rollback(); // Revertir cambios en caso de error
    console.error("❌ Error en la transacción:", error.message);
    res
      .status(500)
      .json({ message: "❌ Error en la transacción", error: error.message });
  } finally {
    if (connection) connection.release(); // Liberar la conexión
  }
};

module.exports = { actualizarEmbarque };

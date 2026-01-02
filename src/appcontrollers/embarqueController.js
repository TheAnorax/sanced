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
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [updateResult] = await connection.query(updatePedidoQuery, [estado, pedido]);

    if (updateResult.affectedRows === 0) {
      throw new Error(`No se encontró el pedido ${pedido} en pedido_embarque.`);
    }

    const [insertResult] = await connection.query(
      `
      INSERT INTO pedido_finalizado (
        pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um, 
        _pz, _pq, _inner, _master, v_pz, v_pq, v_inner, v_master, 
        ubi_bahia, estado, id_usuario, registro, inicio_surtido, fin_surtido, 
        unido, id_usuario_paqueteria, id_usuario_surtido, registro_surtido, 
        registro_embarque, inicio_embarque, fin_embarque, motivo, unificado, 
        registro_fin, caja, cajas, fusion, tipo_caja
      )
      SELECT 
        pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um, 
        _pz, _pq, _inner, _master, v_pz, v_pq, v_inner, v_master, 
        ubi_bahia, estado, id_usuario, registro, inicio_surtido, fin_surtido, 
        unido, id_usuario_paqueteria, id_usuario_surtido, registro_surtido, 
        registro_embarque, inicio_embarque, fin_embarque, motivo, unificado, 
        NOW(), caja, cajas, fusion, tipo_caja
      FROM pedido_embarque
      WHERE estado = ? AND pedido = ?;
      `,
      [estado, pedido]
    );

    if (insertResult.affectedRows > 0) {
      await connection.query(`DELETE FROM pedido_embarque WHERE estado = ? AND pedido = ?;`, [
        estado,
        pedido
      ]);
    }

    // 🔄 Actualizar diferencias entre v_ y _
    await connection.query(
      `
      UPDATE pedido_finalizado
      SET
        v_pz = _pz,
        v_pq = _pq,
        v_inner = _inner,
        v_master = _master
      WHERE 
        (_pz != v_pz OR 
         _pq != v_pq OR 
         _inner != v_inner OR 
         _master != v_master)
        AND pedido = ?;
      `,
      [pedido]
    );

    await connection.commit();

      // ✅ Ejecutar la segunda función después de completar la primera
   await corregirCajas();


    res.status(200).json({
      message: "✅ Estado de embarque actualizado y diferencias corregidas correctamente",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en la transacción:", error.message);
    res.status(500).json({
      message: "❌ Error en la transacción",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};


const corregirCajas = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Obtener registros con incidencias
    const [incidencias] = await connection.query(`
      SELECT * 
      FROM pedido_finalizado
      WHERE 
        (COALESCE(caja, '') = '' OR COALESCE(tipo_caja, '') = '' OR COALESCE(cajas, '') = '')
        AND registro >= NOW() - INTERVAL 15 DAY
        AND cant_surti > 0;
    `);

    for (const registro of incidencias) {
      const { pedido } = registro;

      // 2️⃣ Obtener todos los registros del mismo pedido
      const [registrosPedido] = await connection.query(
        `SELECT id_pedi, tipo_caja, caja, cajas 
         FROM pedido_finalizado 
         WHERE pedido = ?`, 
        [pedido]
      );

      // Analizar cajas existentes del pedido
      const cajasExistentes = registrosPedido
        .filter(r => r.cajas)
        .map(r => parseInt(r.cajas))
        .filter(n => !isNaN(n));

      const tipoCajaReferencia = registrosPedido.find(r => r.tipo_caja)?.tipo_caja || null;
      const maxCaja = cajasExistentes.length > 0 ? Math.max(...cajasExistentes) : 0;

      // 3️⃣ Aplicar reglas:
      // Caso 1: tipo_caja tiene valor pero caja o cajas son NULL
      // Caso 1: tipo_caja tiene valor pero caja o cajas son NULL
if (registro.tipo_caja && (!registro.caja || !registro.cajas)) {
  const todasCajas = [
    ...new Set(
      registrosPedido.flatMap(r => [
        ...(r.cajas ? r.cajas.split(',').map(c => parseInt(c.trim())) : []),
        r.caja ? parseInt(r.caja) : null,
      ]).filter(n => !isNaN(n))
    ),
  ].sort((a, b) => a - b);

  const maxCaja = todasCajas.length > 0 ? Math.max(...todasCajas) : 0;

  const secuenciaEsperada = Array.from({ length: maxCaja }, (_, i) => i + 1);
  const cajasFaltantes = secuenciaEsperada.filter(c => !todasCajas.includes(c));

  let nuevaCaja = null;
  if (cajasFaltantes.length > 0) {
    nuevaCaja = cajasFaltantes[0];
  }

  if (cajasFaltantes.length > 0) {
    await connection.query(
      `UPDATE pedido_finalizado 
       SET cajas = ?, caja = ?, tipo_caja = ?
       WHERE id_pedi = ?`,
      [
        cajasFaltantes.join(','),     // Solo las cajas faltantes
        nuevaCaja || registro.caja,   // Una de las cajas faltantes como principal
        registro.tipo_caja,
        registro.id_pedi
      ]
    );
  }
}


     // Caso 2: tipo_caja es NULL pero tiene cajas/caja
else if (!registro.tipo_caja && (registro.caja || registro.cajas)) {
  // Consultar códigos y cantidad del pedido
  const [infoPedido] = await connection.query(
    `
    SELECT COUNT(DISTINCT codigo_ped) AS total_codigos, SUM(cantidad) AS total_cantidad
    FROM pedido_finalizado
    WHERE pedido = ?;
    `,
    [pedido]
  );

  const { total_codigos = 0, total_cantidad = 0 } = infoPedido[0] || {};

  const tipoCajaAuto =
    total_codigos > 10 || total_cantidad > 50 ? "TARIMA" : "CAJA";

  await connection.query(
    `UPDATE pedido_finalizado 
     SET tipo_caja = ?
     WHERE id_pedi = ?`,
    [tipoCajaAuto, registro.id_pedi]
  );
}

      // Caso 3: todo NULL → asignar a caja existente (si hay) o nueva
      else if (!registro.tipo_caja && !registro.caja && !registro.cajas) {
        if (tipoCajaReferencia) {
          await connection.query(
            `UPDATE pedido_finalizado 
             SET tipo_caja = ?, cajas = ?, caja = ?
             WHERE id_pedi = ?`,
            [tipoCajaReferencia, maxCaja || 1, maxCaja || 1, registro.id_pedi]
          );
        }
      }
    }

  await connection.commit();

    // console.log("✅ Corrección de cajas completada con éxito");
    return { success: true };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error corrigiendo cajas:", error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) connection.release();
  }
};



module.exports = { actualizarEmbarque };

const pool = require('../config/database'); // Importa la configuración de la base de datos

const actualizarProducto = async (req, res) => {
  const { idPedi, scannedPz, scannedPq, scannedInner, scannedMaster, caja } = req.body;
  // console.log("upd-new-caja", req.body);

  try {
    const query = `
      UPDATE pedido_embarque 
      SET 
        v_pz = ?, 
        v_pq = ?, 
        v_inner = ?, 
        v_master = ?, 
        caja = ?, 
        cajas = IF(LOCATE(?, IFNULL(cajas,'')) > 0, 
                   cajas, 
                   IF(IFNULL(cajas,'') = '', ?, CONCAT(cajas, ',', ?))),
        inicio_embarque = IF(inicio_embarque IS NULL, NOW(), inicio_embarque)
      WHERE id_pedi = ?;
    `;

    const [result] = await pool.query(query, [
      scannedPz,
      scannedPq,
      scannedInner,
      scannedMaster,
      caja,
      caja,    // Para LOCATE
      caja,    // Si está vacío, inicializa
      caja,    // Para concatenar
      idPedi,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró el producto para actualizar' });
    }

    res.status(200).json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    if (err.code === 'ER_LOCK_WAIT_TIMEOUT') {
      return res.status(500).json({ error: 'Timeout de bloqueo, intente nuevamente' });
    }
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};



const recibirResumenCaja = async (req, res) => {
  try {
    const { pedido, unidad_empaque, codigos } = req.body;

    // Validación básica
    if (!pedido || !unidad_empaque || !Array.isArray(codigos) || codigos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios o codigos vacíos' });
    }

    // console.log("📦 Resumen recibido:");
    // console.log("→ Pedido:", pedido);
    // console.log("→ Unidad de empaque:", unidad_empaque);
    // console.log("→ Códigos a actualizar:");

    // Iterar códigos y actualizar tipo_caja
    for (const codigo of codigos) {
      // console.log(`   • Código ${codigo} → tipo_caja = ${unidad_empaque}`);

      await pool.query(
        'UPDATE pedido_embarque SET tipo_caja = ? WHERE pedido = ? AND codigo_ped = ?',
        [unidad_empaque, pedido, codigo]
      );
    }

    res.status(200).json({ message: "Productos actualizados correctamente con tipo_caja" });

  } catch (error) {
    console.error("❌ Error al actualizar tipo_caja:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


module.exports = { actualizarProducto, recibirResumenCaja };

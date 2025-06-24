const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para actualizar el producto en pedido_embarque
const actualizarProducto = async (req, res) => {
  const { idPedi, scannedPz, scannedPq, scannedInner, scannedMaster, caja } = req.body;
  console.log("upd-caja", req.body);
  const query = `
    UPDATE pedido_embarque
    SET 
      v_pz = ?, 
      v_pq = ?, 
      v_inner = ?, 
      v_master = ?, 
      caja = ?, 
      inicio_embarque = IF(inicio_embarque IS NULL, NOW(), inicio_embarque)
    WHERE id_pedi = ?;
  `;

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool

    // Ejecuta la actualización del producto en pedido_embarque
    const [result] = await connection.query(query, [
      scannedPz,
      scannedPq,
      scannedInner,
      scannedMaster,
      caja,
      idPedi,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró el producto para actualizar' });
    }

    res.status(200).json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  } finally {
    if (connection) connection.release();
  }
};
const recibirResumenCaja = async (req, res) => {
  try {
    const { pedido, unidad_empaque, codigos } = req.body;

    // Validación básica
    if (!pedido || !unidad_empaque || !Array.isArray(codigos) || codigos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios o codigos vacíos' });
    }

    console.log("📦 Resumen recibido:");
    console.log("→ Pedido:", pedido);
    console.log("→ Unidad de empaque:", unidad_empaque);
    console.log("→ Códigos a actualizar:");

    // Iterar códigos y actualizar tipo_caja
    for (const codigo of codigos) {
      console.log(`   • Código ${codigo} → tipo_caja = ${unidad_empaque}`);

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

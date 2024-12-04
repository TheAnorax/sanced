const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para realizar un movimiento entre ubicaciones
const realizarMovimiento = async (req, res) => {
  console.log("Movimientos recibidos:", req.body);
  const { id_ubi, ubicacion_final, codigo_almacen } = req.body;

  // Verificar que todos los datos necesarios estén presentes
  if (!id_ubi || !ubicacion_final || !codigo_almacen) {
    console.log("Datos incompletos recibidos:", req.body);
    return res.status(400).json({ error: "Faltan datos necesarios para realizar el movimiento" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Consulta los datos de la ubicación original usando `id_ubi`
    const [result] = await connection.query(
      "SELECT code_prod, cant_stock, lote, pasillo FROM ubi_alma WHERE id_ubi = ?", 
      [id_ubi]
    );

    if (result.length === 0) {
      throw new Error("No se encontró la ubicación original.");
    }

    const { code_prod, cant_stock, lote, pasillo } = result[0];

    if (codigo_almacen === '7050') {
      // Caso para el almacén 7050: Actualizar o insertar en la tabla ubicaciones
      const [ubicacionExistente] = await connection.query(
        "SELECT id_ubi, cant_stock_real FROM ubicaciones WHERE ubi = ?",
        [ubicacion_final]
      );

      if (ubicacionExistente.length > 0) {
        // Si la ubicación ya existe, incrementar el `cant_stock_real`
        const { id_ubi: idUbiExistente, cant_stock_real: cantStockActual } = ubicacionExistente[0];
        await connection.query(
          "UPDATE ubicaciones SET cant_stock_real = ?, code_prod = ?, lote = ?, almacen = ? WHERE id_ubi = ?",
          [cantStockActual + cant_stock, code_prod, lote, codigo_almacen, idUbiExistente]
        );
      } else {
        // Si la ubicación no existe, insertar un nuevo registro
        await connection.query(
          "INSERT INTO ubicaciones (ubi, code_prod, cant_stock_real, pasillo, lote, almacen) VALUES (?, ?, ?, ?, ?, ?)",
          [ubicacion_final, code_prod, cant_stock, pasillo, lote, codigo_almacen]
        );
      }
    } else if (codigo_almacen === '7238') {
      // Caso para el almacén 7238: Insertar en la tabla maquila_interna
      await connection.query(
        "INSERT INTO maquila_interna (ubi, code_prod, cant_stock, pasillo, almacen_entrada) VALUES (?, ?, ?, ?, ?)",
        [ubicacion_final, code_prod, cant_stock, pasillo, codigo_almacen]
      );
    } else if (codigo_almacen === '7150') {
      // Caso para el almacén 7150: Movimiento dentro de ubi_alma
      const [updateResult] = await connection.query(
        "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ?, ingreso = NOW() WHERE ubi = ?",
        [code_prod, cant_stock, lote, codigo_almacen, ubicacion_final]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("No se encontró la ubicación final para actualizar en ubi_alma.");
      }
    } else {
      // Otros casos: Movimiento genérico en ubi_alma
      const [updateResult] = await connection.query(
        "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ? WHERE ubi = ?",
        [code_prod, cant_stock, lote, codigo_almacen, ubicacion_final]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("No se encontró la ubicación final para actualizar.");
      }
    }

    // Limpia los datos de la ubicación original (`ubi_alma`)
    await connection.query(
      "UPDATE ubi_alma SET code_prod = NULL, cant_stock = NULL, lote = NULL, almacen = NULL WHERE id_ubi = ?",
      [id_ubi]
    );

    await connection.commit();
    res.status(200).json({ message: "Movimiento realizado exitosamente." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en el movimiento:", error.message);
    res.status(500).json({ error: "Error al realizar el movimiento: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { realizarMovimiento };

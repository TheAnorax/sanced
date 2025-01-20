const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para realizar un movimiento entre ubicaciones
const realizarMovimiento = async (req, res) => {
  console.log("Movimientos recibidos:", req.body);
  const { id_ubi, ubicacion_final, codigo_almacen, codigo_producto, cantidad_stock, id_usuario, dividir_tarima } = req.body;


  // Verificar que todos los datos necesarios estén presentes
  if (!id_ubi || !ubicacion_final || !codigo_almacen) {
    console.log("Datos incompletos recibidos:", req.body);
    return res.status(400).json({ error: "Faltan datos necesarios para realizar el movimiento" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();


    if (id_ubi === 9999) {
      if (codigo_almacen === '7150') {
        console.log("Caso especial: id_ubi = 9999 y almacén = 7150");
    
        // Ejecutar la consulta para actualizar ubi_alma
        const [updateResult] = await connection.query(
          "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, almacen = ?, ingreso = NOW() WHERE ubi = ?",
          [codigo_producto, cantidad_stock, codigo_almacen, ubicacion_final]
        );
    
        if (updateResult.affectedRows === 0) {
          throw new Error("No se encontró la ubicación final para actualizar en ubi_alma.");
        }
    
        // Registrar movimiento en el historial
        await connection.query(
          `INSERT INTO historial_movimientos 
            (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
           VALUES (?, ?, ?, ?, NULL, ?, ?, NOW(), ?)`,
          [id_ubi, ubicacion_final, codigo_producto, cantidad_stock, codigo_almacen, codigo_almacen, id_usuario]
        );
      }
    
      // Separar la condición para código_almacen === '7050'
      if (codigo_almacen === '7050') {
        console.log("Caso especial adicional: id_ubi = 9999 y almacén = 7050");
    
        // Ejecutar la consulta adicional para ubicaciones
        const [ubicacionesUpdateResult] = await connection.query(
          "UPDATE ubicaciones SET code_prod = ?, cant_stock = ?, almacen = ? WHERE ubi = ?",
          [codigo_producto, cantidad_stock, codigo_almacen, ubicacion_final]
        );
    
        if (ubicacionesUpdateResult.affectedRows === 0) {
          throw new Error("No se encontró la ubicación final para actualizar en ubicaciones.");
        }
    
        // Registrar movimiento en el historial
        await connection.query(
          `INSERT INTO historial_movimientos 
            (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
           VALUES (?, ?, ?, ?, NULL, ?, ?, NOW(), ?)`,
          [id_ubi, ubicacion_final, codigo_producto, cantidad_stock, codigo_almacen, codigo_almacen, id_usuario]
        );
      }
    
      await connection.commit();
      return res.status(200).json({ message: "Datos actualizados correctamente para el caso especial." });
    }
    

    // Consulta los datos de la ubicación original usando `id_ubi`
    const [result] = await connection.query(
      "SELECT code_prod, cant_stock, lote, pasillo, ubi FROM ubi_alma WHERE id_ubi = ?", 
      [id_ubi]
    );

    if (result.length === 0) {
      throw new Error("No se encontró la ubicación original.");
    }

    const { code_prod, cant_stock, lote, pasillo, ubi } = result[0]; // ubi = ubicación original
     // 🟢 CASO ESPECIAL: Dividir Tarima en almacén 7150
     if (codigo_almacen === '7150' && dividir_tarima) {
      console.log("Caso especial: Dividir Tarima en almacén 7150");

      const mitadStock = Math.floor(cant_stock / 2);

      // 🔄 1. Actualizar la ubicación original con la mitad de la cantidad
      await connection.query(
        "UPDATE ubi_alma SET cant_stock = ?, ingreso = NOW() WHERE id_ubi = ?",
        [mitadStock, id_ubi]
      );

      // 🔄 2. Insertar la otra mitad en la ubicación final
      const [ubicacionExistente] = await connection.query(
        "SELECT id_ubi FROM ubi_alma WHERE ubi = ?",
        [ubicacion_final]
      );

      if (ubicacionExistente.length > 0) {
        // Si existe, actualizar cantidad
        await connection.query(
          "UPDATE ubi_alma SET cant_stock =  ?, code_prod = ?, ingreso = NOW() WHERE ubi = ?",
          [mitadStock, codigo_producto,  ubicacion_final]
        );
      } else {
        // Si no existe, insertar nueva ubicación
        await connection.query(
          "INSERT INTO ubi_alma (ubi, code_prod, cant_stock, lote, almacen, ingreso) VALUES (?, ?, ?, ?, ?, NOW())",
          [ubicacion_final, codigo_producto, mitadStock, lote, codigo_almacen]
        );
      }

      // 🔄 3. Registrar el movimiento en el historial
      await connection.query(
        `INSERT INTO historial_movimientos 
          (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [ubi, ubicacion_final, codigo_producto, mitadStock, lote, codigo_almacen, codigo_almacen, id_usuario]
      );

      await connection.commit();
      return res.status(200).json({ message: "División de tarima realizada correctamente." });
    }

    // 🟢 CASO ESPECIAL: Dividir Tarima en almacén 7050
    if (codigo_almacen === '7050' && dividir_tarima) {
      console.log("Dividir Tarima activado en almacén 7050");

      const mitadStock = Math.floor(cant_stock / 2);

      // 1️⃣ Actualizar la ubicación original con la mitad de la cantidad
      await connection.query(
        "UPDATE ubi_alma SET cant_stock = ?, ingreso = NOW() WHERE id_ubi = ?",
        [mitadStock, id_ubi]
      );

      // 2️⃣ Insertar la otra mitad en la tabla ubicaciones
      const [ubicacionExistente] = await connection.query(
        "SELECT id_ubi FROM ubicaciones WHERE ubi = ?",
        [ubicacion_final]
      );

      if (ubicacionExistente.length > 0) {
        // Si existe, actualizar la cantidad
        await connection.query(
          "UPDATE ubicaciones SET cant_stock_real = ?, code_prod = ? , ingreso = NOW() WHERE ubi = ?",
          [mitadStock, codigo_producto, ubicacion_final]
        );
      } else {
        // Si no existe, insertar nuevo registro
        await connection.query(
          "INSERT INTO ubicaciones (ubi, code_prod, cant_stock_real, pasillo, lote, almacen, ingreso) VALUES (?, ?, ?, ?, ?, ?, NOW())",
          [ubicacion_final, codigo_producto, mitadStock, pasillo, lote, codigo_almacen]
        );
      }

      // 3️⃣ Registrar el movimiento en historial_movimientos
      await connection.query(
        `INSERT INTO historial_movimientos 
          (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [ubi, ubicacion_final, codigo_producto, mitadStock, lote, codigo_almacen, codigo_almacen, id_usuario]
      );

      await connection.commit();
      return res.status(200).json({ message: "División de tarima realizada correctamente en almacén 7050." });
    }


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
    } else if (codigo_almacen === '7066') {
      // Caso para el almacén 7066: Insertar en la tabla departamental
      await connection.query(
        `INSERT INTO departamental 
          (ubi, code_prod, cant_stock, pasillo, lote, almacen_entrada) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ubicacion_final, code_prod, cant_stock, pasillo, lote, codigo_almacen]
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

    // Registrar el movimiento en el historial
    await connection.query(
      `INSERT INTO historial_movimientos 
        (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [ubi, ubicacion_final, code_prod, cant_stock, lote, codigo_almacen, codigo_almacen, id_usuario]
    );

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

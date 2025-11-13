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



      console.log("⚙️ Caso especial: id_ubi = 9999");

        // 1️⃣ Intentar obtener OC y Pedimento desde recibo_compras
        let ordenCompra = null;
        let pedimento = null;

        const [reciboMatch] = await connection.query(
          `SELECT oc, pedimento
          FROM recibo_compras
          WHERE codigo = ?
            AND arribo BETWEEN DATE_SUB(CURDATE(), INTERVAL 5 DAY) AND CURDATE()
          ORDER BY arribo DESC
          LIMIT 1`,
          [codigo_producto]
        );

        if (reciboMatch.length > 0) {
          ordenCompra = reciboMatch[0].oc;
          pedimento = reciboMatch[0].pedimento;
          console.log(`✅ OC y pedimento encontrados: OC=${ordenCompra}, PED=${pedimento}`);
        } else {
          console.log("⚠️ No se encontró registro en recibo_compras en los últimos 5 días.");
        }

      if (codigo_almacen === '7150') {
        console.log("Caso especial: id_ubi = 9999 y almacén = 7150");
    
        // Ejecutar la consulta para actualizar ubi_alma
        const [updateResult] = await connection.query(
          "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, almacen = ?, ingreso = NOW(),  orden_compra = ?, lote = ?, caducidad = caducidad, ultima_modificacion = NOW(), lote = ?  WHERE ubi = ?",
           [codigo_producto, cantidad_stock, codigo_almacen, ordenCompra, null, pedimento, ubicacion_final]
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
        console.log("✅ Movimiento registrado y OC/pedimento actualizados en ubi_alma.");
      }
    
      // Separar la condición para código_almacen === '7050'
      if (codigo_almacen === '7050') {
        console.log("Caso especial adicional: id_ubi = 9999 y almacén = 7050");
    
        // Ejecutar la consulta adicional para ubicaciones
        const [ubicacionesUpdateResult] = await connection.query(
          "UPDATE ubicaciones SET code_prod = ?, cant_stock_real = ?, almacen = ?,  orden_compra = ?,  lote = ?,  ingreso = NOW() WHERE code_prod = ?",
          [codigo_producto, cantidad_stock, codigo_almacen, ordenCompra, pedimento, codigo_producto]
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
        console.log("✅ Movimiento registrado y OC/pedimento actualizados en ubicaciones.");
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
          "UPDATE ubicaciones SET cant_stock_real = ?,  code_prod = ?, ingreso = NOW() WHERE codigo_producto = ?",
          [mitadStock, codigo_producto, codigo_producto]
        );
      } else {
        // Si no existe, insertar nuevo registro
        await connection.query(
          "INSERT INTO ubicaciones (ubi, code_prod, cant_stock_real,  lote, almacen, ingreso) VALUES (?, ?, ?, ?, ?, ?, NOW())",
          [ubicacion_final, codigo_producto, mitadStock,  lote, codigo_almacen]
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
  console.log("🔁 Movimiento desde ubi_alma hacia ubicaciones (almacén 7050)...");

  // 1️⃣ Obtener todos los datos del registro origen en ubi_alma
  const [origenData] = await connection.query(
    `SELECT code_prod, cant_stock, lote, orden_compra, pasillo, caducidad, almacen, ubi 
     FROM ubi_alma WHERE id_ubi = ?`,
    [id_ubi]
  );

  if (origenData.length === 0) {
    throw new Error("No se encontró la ubicación de origen en ubi_alma.");
  }

  const origen = origenData[0];

  // 2️⃣ Verificar si la ubicación destino ya existe en 'ubicaciones'
  const [destinoData] = await connection.query(
    "SELECT id_ubi, cant_stock_real FROM ubicaciones WHERE ubi = ?",
    [ubicacion_final]
  );

  if (destinoData.length > 0) {
    // 3️⃣ Si existe → actualiza y suma stock
    await connection.query(
      `UPDATE ubicaciones 
       SET 
         code_prod = ?, 
         cant_stock_real = IFNULL(cant_stock_real, 0) + ?, 
         lote = ?, 
         orden_compra = ?, 
         caducidad = ?, 
         almacen = ?, 
         ingreso = NOW()
       WHERE ubi = ?`,
      [
        origen.code_prod,
        origen.cant_stock,
        origen.lote,
        origen.orden_compra,
        origen.caducidad,
        codigo_almacen,
        ubicacion_final,
      ]
    );
    console.log("✅ Ubicación existente en 'ubicaciones' actualizada correctamente.");
  } else {
    // 4️⃣ Si no existe → crea una nueva ubicación con toda la información
    await connection.query(
      `INSERT INTO ubicaciones 
        (ubi, code_prod, cant_stock_real, lote, orden_compra,  caducidad, almacen, ingreso)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        ubicacion_final,
        origen.code_prod,
        origen.cant_stock,
        origen.lote,
        origen.orden_compra,
        origen.caducidad,
        codigo_almacen,
      ]
    );
    console.log("✅ Nueva ubicación insertada correctamente en 'ubicaciones'.");
  }

  // 5️⃣ Registrar el movimiento en historial
  await connection.query(
    `INSERT INTO historial_movimientos 
      (ubi_origen, ubi_destino, code_prod, cant_stock, lote, orden_compra, almacen_origen, almacen_destino, fecha_movimiento, usuario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      origen.ubi,
      ubicacion_final,
      origen.code_prod,
      origen.cant_stock,
      origen.lote,
      origen.orden_compra,
      origen.almacen,
      codigo_almacen,
      id_usuario,
    ]
  );

  // 6️⃣ Limpiar la ubicación origen en ubi_alma
  await connection.query(
    `UPDATE ubi_alma 
     SET 
       code_prod = NULL, 
       cant_stock = NULL, 
       lote = NULL, 
       orden_compra = NULL, 
       caducidad = NULL, 
       almacen = NULL
     WHERE id_ubi = ?`,
    [id_ubi]
  );

  await connection.commit();

  console.log("✅ Movimiento desde ubi_alma hacia ubicaciones completado correctamente.");
  return res.status(200).json({
    message: "Movimiento desde almacenamiento hacia picking completado correctamente.",
  });
}

     else if (codigo_almacen === '7238') {
      // Caso para el almacén 7238: Insertar en la tabla maquila_interna
      await connection.query(
        "INSERT INTO maquila_interna (ubi, code_prod, cant_stock, pasillo, almacen_entrada) VALUES (?, ?, ?, ?, ?)",
        [ubicacion_final, code_prod, cantidad_stock, pasillo, codigo_almacen]
      );
    } else if (codigo_almacen === '7066') {
      // Caso para el almacén 7066: Insertar en la tabla departamental
      await connection.query(
        `INSERT INTO departamental 
          (ubi, code_prod, cant_stock, pasillo, lote, almacen_entrada) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ubicacion_final, code_prod, cantidad_stock, pasillo, lote, codigo_almacen]
      );
    } else if (codigo_almacen === '7150') {
  console.log("🔁 Movimiento interno dentro de ubi_alma → ubi_alma...");

  // 1️⃣ Obtener los datos del registro original (origen)
  const [origenData] = await connection.query(
    `SELECT code_prod, cant_stock, lote, orden_compra, caducidad, almacen, ubi, pasillo 
     FROM ubi_alma WHERE id_ubi = ?`,
    [id_ubi]
  );

  if (origenData.length === 0) {
    throw new Error("No se encontró la ubicación de origen en ubi_alma.");
  }

  const origen = origenData[0];

  // 2️⃣ Buscar si la ubicación destino existe
  const [destinoData] = await connection.query(
    "SELECT id_ubi, cant_stock, lote, code_prod FROM ubi_alma WHERE ubi = ?",
    [ubicacion_final]
  );

  if (destinoData.length === 0) {
    // Si la ubicación destino no existe, se aborta (no se crea una nueva)
    throw new Error(`La ubicación destino '${ubicacion_final}' no existe en ubi_alma.`);
  }

  const destino = destinoData[0];

  // ⚠️ Verificación opcional: no mezclar productos distintos
  if (destino.code_prod && destino.code_prod !== origen.code_prod) {
    throw new Error(
      `No se puede mover el producto ${origen.code_prod} a ${ubicacion_final}, ya tiene ${destino.code_prod}.`
    );
  }

  // ⚠️ Verificación opcional: no mezclar lotes diferentes
  if (destino.lote && destino.lote !== origen.lote) {
    throw new Error(
      `No se puede mover lote ${origen.lote} a ${ubicacion_final}, ya contiene lote ${destino.lote}.`
    );
  }

  // 3️⃣ Actualizar ubicación destino (sumar stock y mantener datos clave)
  await connection.query(
    `UPDATE ubi_alma 
     SET 
       code_prod = ?, 
       cant_stock = IFNULL(cant_stock, 0) + ?, 
       lote = ?, 
       orden_compra = ?, 
       caducidad = ?, 
       almacen = ?, 
       ingreso = NOW(), 
       ultima_modificacion = NOW()
     WHERE ubi = ?`,
    [
      origen.code_prod,
      origen.cant_stock,
      origen.lote,
      origen.orden_compra,
      origen.caducidad,
      codigo_almacen,
      ubicacion_final,
    ]
  );

  console.log(`✅ Ubicación destino '${ubicacion_final}' actualizada correctamente.`);

  // 4️⃣ Registrar el movimiento en historial_movimientos
  await connection.query(
    `INSERT INTO historial_movimientos 
      (ubi_origen, ubi_destino, code_prod, cant_stock, lote, orden_compra, almacen_origen, almacen_destino, fecha_movimiento, usuario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      origen.ubi,
      ubicacion_final,
      origen.code_prod,
      origen.cant_stock,
      origen.lote,
      origen.orden_compra,
      origen.almacen,
      codigo_almacen,
      id_usuario,
    ]
  );

  // 5️⃣ Limpiar la ubicación origen
  await connection.query(
    `UPDATE ubi_alma 
     SET 
       code_prod = NULL, 
       cant_stock = NULL, 
       lote = NULL, 
       orden_compra = NULL, 
       caducidad = NULL, 
       almacen = NULL, 
       ultima_modificacion = NOW()
     WHERE id_ubi = ?`,
    [id_ubi]
  );

  await connection.commit();

  console.log("✅ Movimiento interno dentro de ubi_alma completado correctamente.");
  return res.status(200).json({
    message: `Movimiento interno completado: datos transferidos de '${origen.ubi}' a '${ubicacion_final}'.`,
  });
}
else {
      // Otros casos: Movimiento genérico en ubi_alma
      const [updateResult] = await connection.query(
        "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ? WHERE ubi = ?",
        [code_prod, cantidad_stock, lote, codigo_almacen, ubicacion_final]
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

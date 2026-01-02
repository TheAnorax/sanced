const pool = require("../config/database");

// Obtener los inventarios con estado "L"
const getInventarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
    r.id_recibo,
     r.id_recibo_compras,
    prod.des,
    r.codigo, 
    r.oc,
    r.cantidad_recibida,
    r.naviera,
    r.pedimento,
    r.pallete,
    r.restante, 
    r.fecha_recibo,
    r.est,
    us.name  
FROM recibo_cedis r
LEFT JOIN productos prod ON r.codigo = prod.codigo_pro
LEFT JOIN usuarios us ON r.id_usuario = us.id_usu
WHERE r.fecha_recibo >= CURDATE()

    `);
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los recibo", error: error.message });
  }
};

// Autorizar recibo (cambiar estado a "I")
const autorizarRecibo = async (req, res) => {
  const {
    codigo,
    oc,
    cantidad_recibida,
    fecha_recibo,
    id_recibo_compras,
    userId,
  } = req.body;
  console.log("inventrioaut", req.body);

  try {
    // Actualizamos el estado del recibo a "I" (autorizado), la fecha y hora de `validacion_calidad` y el usuario en `usu_inventario`
    await pool.query(
      `UPDATE recibo_cedis 
       SET est = 'I', vali_inventario = NOW(), usu_inventario = ? 
     WHERE id_recibo_compras = ? `,
      [userId, id_recibo_compras]
    );

    res.json({ message: "Producto autorizado exitosamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al autorizar el producto",
      error: error.message,
    });
  }
};

const actualizarUbicacion = async (req, res) => {
  const {
    id_ubi,
    code_prod,
    ubi,
    cant_stock,
    pasillo,
    lote,
    almacen,
    estado,
    user_id,
    caducidad,
  } = req.body;

  console.log("Datos para actualizar Alma :", req.body);

  const finalCodeProd = code_prod || null;
  const finalCantStock = cant_stock || null;
  const finalLote = lote || null;
  const finalAlmacen = almacen || null;
  const finalEstado = estado || null;
  const finalCaducidad = caducidad || null;

  // 🔴 Usamos 7050 si almacen es nulo
  const almacenOrigen = almacen || 7050;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE ubi_alma 
       SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ?, estado = ?, caducidad = ?
       WHERE id_ubi = ?`,
      [
        finalCodeProd,
        finalCantStock,
        finalLote,
        finalAlmacen,
        finalEstado,
        finalCaducidad,
        id_ubi,
      ]
    );

    if (result.affectedRows > 0) {
      await connection.query(
        `INSERT INTO historial_movimientos 
          (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          "AJUSTE INV.", // ubi_origen
          ubi, // ubi_destino
          finalCodeProd,
          finalCantStock,
          finalLote,
          almacenOrigen, // 👈 aquí corregido
          finalAlmacen || 7050,
          user_id,
        ]
      );

      await connection.commit();
      res.json({
        success: true,
        message: "Actualización y registro en historial exitosos",
      });
    } else {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: "No se encontró la ubicación para actualizar",
      });
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en la actualización de ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error en la actualización de ubicación",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const insertNuevaUbicacion = async (req, res) => {
  console.log("📥 insertNuevaUbicacion:", req.body);

  const {
    ubi,
    code_prod,
    cant_stock = 0,
    pasillo = null,
    lote = null,
    almacen = null,
  } = req.body;

  // ✅ SOLO lo realmente obligatorio
  if (!ubi || !code_prod) {
    return res.status(400).json({
      success: false,
      message: "ubi y code_prod son obligatorios",
    });
  }

  try {
    // 🔒 Validar que no exista la ubicación
    const [existe] = await pool.query(
      "SELECT id_ubi FROM ubicaciones WHERE ubi = ?",
      [ubi]
    );

    if (existe.length > 0) {
      return res.status(409).json({
        success: false,
        message: "La ubicación ya existe",
      });
    }

    // ✅ Insertar
    const [result] = await pool.query(
      `INSERT INTO ubicaciones 
       (ubi, code_prod, cant_stock, pasillo, lote, almacen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ubi, code_prod, cant_stock, pasillo, lote, almacen]
    );

    res.json({
      success: true,
      message: "Ubicación creada correctamente",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error insertNuevaUbicacion:", error);
    res.status(500).json({
      success: false,
      message: "Error al insertar la ubicación",
      error: error.message,
    });
  }
};

const insertarNuevoProducto = async (req, res) => {
  try {
    const {
      new_code_prod,
      new_cant_stock,
      ubi,
      pasillo,
      lote,
      almacen,
      estado,
    } = req.body;

    // Verifica que los datos requeridos estén presentes
    if (!new_code_prod || !new_cant_stock || !ubi) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos requeridos." });
    }

    // Aquí asumo que ya tienes el pool de conexión a tu base de datos
    const [result] = await pool.query(
      `INSERT INTO ubi_alma (code_prod, cant_stock, pasillo, lote, almacen, estado, ubi)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [new_code_prod, new_cant_stock, pasillo, lote, almacen, estado, ubi] // Cambié 'id_ubi' a 'ubi'
    );

    // Devuelve una respuesta exitosa
    return res.json({
      success: true,
      message: "Producto insertado correctamente.",
    });
  } catch (error) {
    console.error("Error en la inserción:", error); // Agrega esto para más depuración
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

const getPeacking = async (req, res) => {
  try {
    const [rows] = await pool.query(`
SELECT 
u.id_ubi,
u.ubi,
prod.des,
u.code_prod,
u.cant_stock,
u.cant_stock_real,
u.pasillo,
u.lote,
u.almacen
FROM ubicaciones u
LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
ORDER BY u.ubi ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el inventario",
      error: error.message,
    });
  }
};

const updatePeacking = async (req, res) => {
  const {
    id_ubi,
    ubi,            // 👈 AHORA SÍ
    code_prod,
    cant_stock,
    lote,
    almacen,
    user_id
  } = req.body;

  if (!id_ubi || !user_id) {
    return res.status(400).json({
      success: false,
      message: "id_ubi y user_id son obligatorios"
    });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE ubicaciones
      SET
        ubi = ?,                 -- 🔥 AQUÍ ESTÁ LA CLAVE
        code_prod = ?,
        cant_stock = ?,
        cant_stock_real = ?,
        lote = ?,
        almacen = ?
      WHERE id_ubi = ?
      `,
      [
        ubi,
        code_prod,
        cant_stock,
        cant_stock,
        lote,
        almacen,
        id_ubi
      ]
    );

    console.log("📊 RESULT UPDATE:", result);

    if (result.changedRows === 0) {
      return res.json({
        success: false,
        message: "No hubo cambios (ubicación igual a la anterior)"
      });
    }

    await pool.query(
      `
      INSERT INTO historial_pick
        (id_ubi, ubi, code_prod, cant_stock, lote, almacen, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [id_ubi, ubi, code_prod, cant_stock, lote, almacen, user_id]
    );

    res.json({
      success: true,
      message: "Ubicación actualizada correctamente"
    });

  } catch (error) {
    console.error("❌ Error updatePeacking:", error);
    res.status(500).json({
      success: false,
      message: "Error actualizando ubicación",
      error: error.message
    });
  }
};


const insertPeacking = async (req, res) => {
  console.log("Datos recibidos en el backend:", req.body);

  const { ubi, code_prod, cant_stock, pasillo, lote, almacen } = req.body;

  if (
    !code_prod ||
    !code_prod ||
    !cant_stock ||
    !pasillo ||
    !lote ||
    !almacen
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Todos los campos son requeridos." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO ubicaciones (ubi, code_prod, cant_stock, pasillo, lote, almacen) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ubi, code_prod, cant_stock, pasillo, lote, almacen]
    );

    res.json({
      success: true,
      message: "Inserción exitosa",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Error en la inserción de ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error en la inserción de ubicación",
      error: error.message,
    });
  }
};

const obtenerUbiAlma = async (req, res) => {
  try {
    // Realizar la consulta para obtener todos los registros
    const [rows] = await pool.query(`
     SELECT 
        u.id_ubi,
        prod.des,
        u.ubi, 
        u.code_prod, 
        u.cant_stock, 
        u.pasillo, 
        u.lote, 
        u.almacen, 
        u.ingreso, 
        u.nivel,
        u.caducidad,
        CASE 
          WHEN u.pasillo REGEXP '^[0-9]+$' THEN 'Almacen' 
          WHEN u.pasillo REGEXP 'AV' THEN 'Picking'
          ELSE 'Otro'
        END AS AREA
      FROM ubi_alma u
      LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
    `);

    // Estructura de la respuesta
    const result = {
      resultado: {
        error: false,
        list: rows,
      },
    };

    // Enviar el JSON como respuesta
    res.json(result);
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    res.status(500).json({
      resultado: {
        error: true,
        message: "Error al obtener las ubicaciones",
        details: error.message,
      },
    });
  }
};

// Función para eliminar una tarea
const deleteTarea = async (req, res) => {
  // Obtén 'id_ubi' del cuerpo de la solicitud
  const { id_ubi } = req.body;

  // Verifica que el id_ubi esté presente
  if (!id_ubi) {
    return res.status(400).json({
      success: false,
      message: "Falta el ID de la tarea.",
    });
  }

  try {
    // Ejecuta la consulta para eliminar la tarea usando `pool` en lugar de `promisePool`
    const [result] = await pool.query("DELETE FROM ubi_alma WHERE id_ubi = ?", [
      id_ubi,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la tarea para eliminar.",
      });
    }

    return res.json({
      success: true,
      message: "Tarea eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la tarea.",
    });
  }
};

// Obtener ubicaciones con número intermedio impar
const getUbicacionesImpares = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT ubi , code_prod, cant_stock, pasillo, lote, almacen, estado, nivel, ingreso
      FROM ubi_alma
      WHERE CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ubi, '-', 2), '-', -1) AS UNSIGNED) % 2 = 1;
    `);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener ubicaciones impares:", error);
    res.status(500).json({ error: "Error al obtener ubicaciones impares" });
  }
};

// Obtener ubicaciones con número intermedio par
const getUbicacionesPares = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT ubi, code_prod, cant_stock, pasillo, lote, almacen, estado, nivel, ingreso
      FROM ubi_alma
      WHERE CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ubi, '-', 2), '-', -1) AS UNSIGNED) % 2 = 0;
    `);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener ubicaciones pares:", error);
    res.status(500).json({ error: "Error al obtener ubicaciones pares" });
  }
};

const deletepickUnbi = async (req, res) => {
  const { id_ubi } = req.body;
  console.log("DELETE ubicaciones", req.body);

  if (!id_ubi) {
    return res.status(400).json({
      success: false,
      message: "Falta el ID de la ubicación.",
    });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM ubicaciones WHERE id_ubi = ?",
      [id_ubi]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la ubicación para eliminar.",
      });
    }

    return res.json({
      success: true,
      message: "Ubicación eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar la ubicación:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la ubicación.",
    });
  }
};

// controllers/inventariosController.js

const getProductsWithoutLocation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
       SELECT 
    p.codigo_pro,
    p.des,
    u.ubi
    FROM productos p
    LEFT JOIN ubicaciones u ON p.codigo_pro = u.code_prod
    WHERE u.ubi IS NULL 
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos sin ubicación:", error);
    res.status(500).json({
      message: "Error al obtener productos sin ubicación",
      error: error.message,
    });
  }
};

// Obtener historial de modificaciones
const modificacionesRoutes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id_modi,
        m.codigo,
        p.des AS descripcion_producto,
        m.tabla,
        m.campo,
        m.valor_anterior,
        m.valor_nuevo,
        DATE_FORMAT(m.fecha_modificacion, '%Y-%m-%d %H:%i:%s') AS fecha_modificacion,
        u.name AS usuario
      FROM modificaciones m
      LEFT JOIN usuarios u ON m.id_usuario = u.id_usu
      LEFT JOIN productos p ON m.codigo = p.codigo_pro
      ORDER BY m.fecha_modificacion DESC;
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener historial de modificaciones:", error);
    res.status(500).json({
      message: "Error al obtener historial de modificaciones",
      error: error.message,
    });
  }
};

const obtenerInventario = async (req, res) => {
  try {
    const { pasillo, nivel, par_impar, code_prod, seccion } = req.query;

    if (!pool || typeof pool.query !== "function") {
      throw new Error(
        "Conexión a la base de datos no inicializada correctamente."
      );
    }

    // 🧱 Construcción dinámica del query
    let sql = `
      SELECT 
        id_ubi,
        ubi,
        code_prod,
        cant_stock,
        pasillo,
        seccion,
        lote,
        ingreso,
        estado,
        nivel,
        caducidad,
        orden_compra,
        status_inventario,
        par_impar
      FROM ubi_alma
      WHERE 1 = 1
    `;

    const params = [];

    if (pasillo?.trim()) {
      sql += " AND pasillo = ?";
      params.push(pasillo.trim());
    }

    if (seccion?.trim()) {
      sql += " AND seccion = ?";
      params.push(seccion.trim());
    }

    if (nivel?.trim()) {
      sql += " AND nivel = ?";
      params.push(nivel.trim());
    }

    if (par_impar?.trim()) {
      sql += " AND par_impar = ?";
      params.push(par_impar.trim());
    }

    // ✅ Filtro flexible de código de producto:
    // - Si hay code_prod: busca coincidencias y también los vacíos
    // - Si NO hay code_prod: devuelve todo, incluyendo vacíos
    if (code_prod?.trim()) {
      sql += `
        AND (
          code_prod LIKE ?
          OR code_prod IS NULL
          OR TRIM(code_prod) = ''
          OR code_prod = '0'
        )
      `;
      params.push(`%${code_prod.trim()}%`);
    } else {
      // Si no se filtra por código, mostrar TODO incluyendo vacíos
      sql += `
        AND (
          code_prod IS NULL
          OR TRIM(code_prod) = ''
          OR code_prod = '0'
          OR code_prod IS NOT NULL
        )
      `;
    }

    sql += " ORDER BY pasillo+0 ASC, seccion+0 ASC, nivel+0 ASC";

    const [rows] = await pool.query(sql, params);

    return res.status(200).json(rows || []);
  } catch (error) {
    console.error("❌ Error en obtenerInventario:", error);
    res.status(500).json({
      error: "Error consultando inventario",
      detalle: error.message,
    });
  }
};

const obtenerUbicacion = async (req, res) => {
  try {
    const { id_ubi } = req.params;
    const [rows] = await pool.execute(
      `SELECT * FROM ubi_alma WHERE id_ubi = ?`,
      [id_ubi]
    );

    if (rows.length === 0)
      return res.status(404).json({ mensaje: "Ubicación no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error obteniendo ubicación", detalle: error.message });
  }
};

const actualizarInventario = async (req, res) => {
  try {
    const { id_ubi } = req.params;
    const {
      code_prod,
      cant_stock,
      lote,
      estado,
      nivel,
      caducidad,
      orden_compra,
      usuario = "Sistema", // ← opcional si tienes autenticación
      observaciones = "Actualización manual desde módulo de inventario",
    } = req.body;

    if (!id_ubi) {
      return res.status(400).json({ error: "Falta el ID de la ubicación" });
    }

    // 1️⃣ Actualizamos inventario
    const [result] = await pool.execute(
      `
      UPDATE ubi_alma SET 
        code_prod = ?, 
        cant_stock = ?, 
        lote = ?, 
        estado = ?, 
        nivel = ?, 
        caducidad = ?, 
        orden_compra = ?, 
        status_inventario = 'OK', 
        updated_at = NOW(),
        ultima_modificacion = NOW()
      WHERE id_ubi = ?
      `,
      [
        code_prod,
        cant_stock,
        lote,
        estado,
        nivel,
        caducidad,
        orden_compra,
        id_ubi,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Ubicación no encontrada" });
    }

    // 2️⃣ Obtenemos datos de la ubicación modificada para registrar en el historial
    const [ubicacion] = await pool.execute(
      `SELECT ubi, pasillo AS almacen_origen FROM ubi_alma WHERE id_ubi = ?`,
      [id_ubi]
    );

    const ubi = ubicacion[0]?.ubi || "DESCONOCIDA";
    const almacen = ubicacion[0]?.almacen_origen || "N/A";

    // 3️⃣ Insertamos registro en historial_movimientos
    await pool.execute(
      `
      INSERT INTO historial_movimientos 
        (tipo_movimiento, ubi_origen, ubi_destino, code_prod, cant_stock, lote, 
         almacen_origen, almacen_destino, fecha_movimiento, usuario, observaciones, orden_compra)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      `,
      [
        "ACTUALIZACION",
        ubi,
        ubi, // mismo origen y destino porque es una actualización
        code_prod,
        cant_stock,
        lote,
        almacen,
        almacen,
        usuario,
        observaciones,
        orden_compra,
      ]
    );

    res.json({
      mensaje: "Ubicación actualizada y registrada en historial correctamente",
    });
  } catch (error) {
    console.error("Error en actualizarInventario:", error);
    res.status(500).json({
      error: "Error actualizando inventario",
      detalle: error.message,
    });
  }
};

// Crear nueva ubicación en almacén
const crearUbicacion = async (req, res) => {
  try {
    console.log("📦 [VALIDACION INVENTARIOS → crearUbicacion()]");
    console.log(
      "➡️ Datos recibidos del front:",
      JSON.stringify(req.body, null, 2)
    );
    const {
      ubi,
      code_prod,
      cant_stock = 0,
      pasillo,
      lote = null,
      nivel,
      orden_compra = null,
      caducidad = null,
      seccion = null, // 👈🟢 nuevo
      usuario = "Sistema",
      observaciones = "Creación de nueva ubicación en almacén",
    } = req.body;

    if (!ubi || !code_prod || !pasillo || !nivel) {
      return res.status(400).json({
        mensaje: "ubi, code_prod, pasillo y nivel son obligatorios",
      });
    }

    // 🧠 Determinar PAR / IMPAR desde el número del medio de la UBI
    const match = ubi.match(/-(\d+)-/);
    const numero = match ? parseInt(match[1]) : null;
    const par_impar =
      numero !== null ? (numero % 2 === 0 ? "PAR" : "IMPAR") : null;

    // ------------------------------------------------------------------
    // 1️⃣ INSERT en ubi_alma — ahora guardando SECCION
    // ------------------------------------------------------------------
    const [result] = await pool.execute(
      `
      INSERT INTO ubi_alma
        (ubi, code_prod, cant_stock, pasillo, lote, nivel, orden_compra, caducidad, seccion, par_impar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ubi,
        code_prod,
        cant_stock,
        pasillo,
        lote,
        nivel,
        orden_compra,
        caducidad,
        seccion,
        par_impar,
      ]
    );

    // ------------------------------------------------------------------
    // 2️⃣ Registrar movimiento en historial
    // ------------------------------------------------------------------
    await pool.execute(
      `
      INSERT INTO historial_movimientos 
        (tipo_movimiento, ubi_origen, ubi_destino, code_prod, cant_stock, lote, 
         almacen_origen, almacen_destino, fecha_movimiento, usuario, observaciones, orden_compra)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      `,
      [
        "CREACION",
        "NUEVA",
        ubi,
        code_prod,
        cant_stock,
        lote,
        "N/A", // no viene de almacen
        pasillo,
        usuario,
        observaciones,
        orden_compra,
      ]
    );

    // ------------------------------------------------------------------
    // 3️⃣ Respuesta al Front
    // ------------------------------------------------------------------
    res.json({
      mensaje: "Ubicación creada correctamente",
      id_ubi: result.insertId,
      par_impar,
      seccion,
    });
  } catch (error) {
    console.error("Error creando ubicación:", error);
    res.status(500).json({
      error: "Error creando ubicación",
      detalle: error.message,
    });
  }
};

const obtenerProgresoPorPasillo = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pasillo,
        COUNT(*) AS total_ubicaciones,
        SUM(CASE WHEN status_inventario = 'OK' THEN 1 ELSE 0 END) AS ubicaciones_ok,
        ROUND(
          (SUM(CASE WHEN status_inventario = 'OK' THEN 1 ELSE 0 END) / COUNT(*)) * 100,
          2
        ) AS porcentaje_progreso,
        MAX(ultima_modificacion) AS ultima_actividad
      FROM ubi_alma
      WHERE pasillo IS NOT NULL AND pasillo <> ''
      GROUP BY pasillo
      ORDER BY pasillo;
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      error: "Error consultando progreso de pasillos",
      detalle: error.message,
    });
  }
};

module.exports = {
  getInventarios,
  autorizarRecibo,
  actualizarUbicacion,
  insertarNuevoProducto,
  getPeacking,
  updatePeacking,
  insertPeacking,
  obtenerUbiAlma,
  deleteTarea,
  getUbicacionesImpares,
  getUbicacionesPares,
  insertNuevaUbicacion,
  deletepickUnbi,
  getProductsWithoutLocation,
  modificacionesRoutes,
  obtenerInventario,
  obtenerUbicacion,
  actualizarInventario,
  crearUbicacion,
  obtenerProgresoPorPasillo,
};

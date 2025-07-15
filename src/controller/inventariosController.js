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
  } = req.body;

  console.log("Datos para actualizar Alma :", req.body);  

  const finalCodeProd = code_prod || null;
  const finalCantStock = cant_stock || null;
  const finalLote = lote || null;
  const finalAlmacen = almacen || null;
  const finalEstado = estado || null;

  // 🔴 Usamos 7050 si almacen es nulo
  const almacenOrigen = almacen || 7050;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE ubi_alma 
       SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ?, estado = ?
       WHERE id_ubi = ?`,
      [
        finalCodeProd,
        finalCantStock,
        finalLote,
        finalAlmacen,
        finalEstado,
        id_ubi,
      ]
    );

    if (result.affectedRows > 0) {
      await connection.query(
        `INSERT INTO historial_movimientos 
          (ubi_origen, ubi_destino, code_prod, cant_stock, lote, almacen_origen, almacen_destino, fecha_movimiento, usuario) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          'AJUSTE INV.',     // ubi_origen
          ubi,               // ubi_destino
          finalCodeProd,
          finalCantStock,
          finalLote,
          almacenOrigen,     // 👈 aquí corregido
          finalAlmacen || 7050,
          user_id
        ]
      );

      await connection.commit();
      res.json({ success: true, message: "Actualización y registro en historial exitosos" });
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
  console.log("Datos recibidos en el backend:", req.body);

  const { ubi, code_prod, cant_stock, pasillo, lote, almacen } = req.body;

  // Validar que todos los campos estén presentes
  if (!ubi || !code_prod || !cant_stock || !pasillo || !lote || !almacen) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos.",
    });
  }

  try {
    // Verificar si ya existe una fila con la misma 'ubi' y 'code_prod'
    const [existingEntries] = await pool.query(
      "SELECT * FROM ubicaciones WHERE ubi = ? AND code_prod = ?",
      [ubi, code_prod]
    );

    if (existingEntries.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El código y la ubicación ya existen en la base de datos.",
      });
    }

    // Verificar si ya existe 'code_prod' independientemente de la ubicación
    const [existingCodeProd] = await pool.query(
      "SELECT * FROM ubicaciones WHERE code_prod = ?",
      [code_prod]
    );

    if (existingCodeProd.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El código de producto ya existe en la base de datos.",
      });
    }

    // Insertar nueva ubicación si no hay conflictos
    const [result] = await pool.query(
      `INSERT INTO ubicaciones (ubi, code_prod, cant_stock, pasillo, lote, almacen) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ubi, code_prod, cant_stock, pasillo, lote, almacen]
    );

    res.json({
      success: true,
      message: "Nueva ubicación insertada correctamente",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Error al insertar la nueva ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error al insertar la nueva ubicación",
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
  const { id_ubi, code_prod, cant_stock, pasillo, lote, almacen, user_id, ubi } = req.body;
  console.log("Update Pick:", req.body);

  // Validación de entrada
  if (!id_ubi || !user_id) {
    return res.status(400).json({
      success: false,
      message: "ID de ubicación y user_id son requeridos.",
    });
  }

  try {
    // Actualizar la tabla principal
    const [result] = await pool.query(
      `UPDATE ubicaciones 
       SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ?
       WHERE id_ubi = ?`,
      [code_prod, cant_stock, lote, almacen, id_ubi]
    );

    if (result.affectedRows > 0) {
      // Insertar un registro en el historial de actualizaciones
      await pool.query(
        `INSERT INTO historial_pick 
         (id_ubi, ubi, code_prod, cant_stock, lote, almacen, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_ubi, ubi || 'N/A', code_prod, cant_stock, lote, almacen, user_id]
      );

      return res.json({
        success: true,
        message: "Actualización exitosa y registrada en el historial.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No se encontró la ubicación para actualizar.",
      });
    }
  } catch (error) {
    console.error("❌ Error en la actualización de ubicación:", error);
    return res.status(500).json({
      success: false,
      message: "Error en la actualización de ubicación.",
      error: error.message,
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
        u.codigo_ubi, 
        u.ingreso, 
        u.nivel,
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
    const [result] = await pool.query("DELETE FROM ubicaciones WHERE id_ubi = ?", [id_ubi]);

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
    console.error('Error al obtener productos sin ubicación:', error);
    res.status(500).json({ message: 'Error al obtener productos sin ubicación', error: error.message });
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
  getProductsWithoutLocation
}; 

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
  const { codigo, oc, cantidad_recibida, fecha_recibo, id_recibo_compras, userId } = req.body;
  console.log("inventrioaut", req.body)

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
    cant_stock,
    pasillo,
    lote,
    almacen,
    estado,
    new_code_prod,
    new_cant_stock,
  } = req.body;

  //console.log("Datos para actualización recibidos:", req.body);

  // Definir valores en `null` en caso de recibir campos vacíos
  const finalCodeProd = code_prod || null;
  const finalCantStock = cant_stock || null;
  const finalPasillo = pasillo || null;
  const finalLote = lote || null;
  const finalAlmacen = almacen || null;
  const finalEstado = estado || null;

  try {
    const [result] = await pool.query(
      `UPDATE ubi_alma 
       SET code_prod = ?,
           cant_stock = ?,
           pasillo = ?,
           lote = ?,
           almacen = ?,
           estado = ?
       WHERE id_ubi = ?`,
      [
        finalCodeProd,
        finalCantStock,
        finalPasillo,
        finalLote,
        finalAlmacen,
        finalEstado,
        id_ubi,
      ]
    );

    // Verificar si la actualización afectó alguna fila
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Actualización exitosa" });
    } else {
      res.status(404).json({
        success: false,
        message: "No se encontró la ubicación para actualizar",
      });
    }
  } catch (error) {
    console.error("Error en la actualización de ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error en la actualización de ubicación",
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
u.pasillo,
u.lote,
u.almacen
FROM ubicaciones u
LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
    `);
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener el inventario",
        error: error.message,
      });
  }
};
const updatePeacking = async (req, res) => {
  const { id_ubi, code_prod, cant_stock, pasillo, lote, almacen } = req.body;

  // Validación de entrada: asegurarse de que `id_ubi` esté presente
  if (!id_ubi) {
    return res
      .status(400)
      .json({ success: false, message: "ID de ubicación es requerido." });
  }

  try {
    // Realizar la actualización en la base de datos
    const [result] = await pool.query(
      `UPDATE ubicaciones 
       SET code_prod = ?,
           cant_stock = ?,
           pasillo = ?,
           lote = ?,
           almacen = ?
       WHERE id_ubi = ?`,
      [code_prod, cant_stock, pasillo, lote, almacen, id_ubi]
    );

    // Verificar si la actualización afectó alguna fila
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Actualización exitosa" });
    } else {
      res.status(404).json({
        success: false,
        message: "No se encontró la ubicación para actualizar",
      });
    }
  } catch (error) {
    console.error("Error en la actualización de ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error en la actualización de ubicación",
      error: error.message,
    });
  }
};

const insertPeacking = async (req, res) => {
  console.log("Datos recibidos en el backend:", req.body);

  const {ubi, code_prod, cant_stock, pasillo, lote, almacen } = req.body;

  if (!code_prod || !code_prod || !cant_stock || !pasillo || !lote || !almacen) {
    return res.status(400).json({ success: false, message: "Todos los campos son requeridos." });
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


module.exports = {
  getInventarios,
  autorizarRecibo,
  actualizarUbicacion,
  insertarNuevoProducto,
  getPeacking,
  updatePeacking,
  insertPeacking,
};

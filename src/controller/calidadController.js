const pool = require("../config/database");

const getCalidad = async (req, res) => {
  try {
    const [rows] = await pool.query(`
     SELECT 
    r.id_recibo,
    r.id_recibo_compras,
    prod.des,
    r.codigo, 
    r.oc,
    r.est,
    r.cantidad_recibida,
    r.naviera,
    r.pedimento,
    r.pallete,
    r.restante,
    r.fecha_recibo,
    us.name  
FROM recibo_cedis r
LEFT JOIN productos prod ON r.codigo = prod.codigo_pro
LEFT JOIN usuarios us ON r.id_usuario = us.id_usu 
WHERE (r.est = "R" OR r.est = "7008")
  AND r.fecha_recibo >= CURDATE();

    `); 
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los recibo", error: error.message });
  }
};

const autorizarRecibo = async (req, res) => {
  const { userId, id_recibo_compras} = req.body;
  console.log("calidad:xd", req.body)

  try {
    // Actualizamos el estado del recibo a "L" (autorizado), la fecha y hora de `validacion_calidad` y el usuario en `usu_calidad`
    await pool.query(
      `UPDATE recibo_cedis 
       SET est = 'L', validacion_calidad = NOW(), usu_calidad = ?, ingreso_inventario = NOW() 
       WHERE id_recibo_compras = ? `,
      [userId, id_recibo_compras]
    );

    res.json({ message: "Producto autorizado exitosamente" });
  } catch (error) {
    console.error("Error al autorizar el producto:", error);
    res.status(500).json({
      message: "Error al autorizar el producto",
      error: error.message,
    });
  }
};

const enviarCuarentena = async (req, res) => {
  const { codigo, oc, cantidad_recibida, fecha_recibo, userId, id_recibo_compras } = req.body;

  try {
    // Actualizar el estado del recibo a "7008" (cuarentena), la fecha y hora de `validacion_calidad`, y el usuario en `usu_calidad`
    await pool.query(
      `UPDATE recibo_cedis 
       SET est = '7008', validacion_calidad = NOW(), usu_calidad = ? 
      WHERE id_recibo_compras = ? `,
      [userId, id_recibo_compras]
    );

    // Insertar en la tabla `cuarentena`
    await pool.query(
      `INSERT INTO cuarentena (ubi, code_prod, cant_stock, cant_stock_mov, pasillo, lote, almacen_entrada, almacen_salida)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,                   // ubi (dejar como NULL si no aplica)
        codigo,                 // code_prod
        cantidad_recibida,      // cant_stock
        cantidad_recibida,      // cant_stock_mov (usa el mismo valor para el movimiento de cuarentena)
        null,                   // pasillo (dejar como NULL si no aplica)
        null,                   // lote (dejar como NULL si no aplica)
        null,                   // almacen_entrada (dejar como NULL si no aplica)
        null                    // almacen_salida (dejar como NULL si no aplica)
      ]
    );

    res.json({ message: "Producto enviado a cuarentena exitosamente" });
  } catch (error) {
    console.error("Error al mandar el producto a cuarentena:", error);
    res.status(500).json({
      message: "Error al mandar el producto a cuarentena",
      error: error.message,
    });
  }
};

const enviarSegundas = async (req, res) => {
  const { codigo, oc, cantidad_recibida, fecha_recibo, userId, id_recibo_compras } = req.body;

  try {
    // Actualizamos el estado del recibo a "7235" (Segundas), la fecha y hora de `validacion_calidad` y el usuario en `usu_calidad`
    await pool.query(
      `UPDATE recibo_cedis 
       SET est = '7235', validacion_calidad = NOW(), usu_calidad = ? 
      WHERE id_recibo_compras = ? `,
      [userId, id_recibo_compras]
    );

    // Insertamos el registro en la tabla `segunda`
    await pool.query(
      `INSERT INTO segunda (ubi, code_prod, cant_stock, cant_stock_mov, pasillo, lote, almacen_entrada, almacen_salida)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,                   // ubi (dejar como NULL si no aplica)
        codigo,                 // code_prod
        cantidad_recibida,      // cant_stock
        cantidad_recibida,      // cant_stock_mov (usar la misma cantidad para el movimiento a Segundas)
        null,                   // pasillo (dejar como NULL si no aplica)
        null,                   // lote (dejar como NULL si no aplica)
        null,                   // almacen_entrada (dejar como NULL si no aplica)
        null                    // almacen_salida (dejar como NULL si no aplica)
      ]
    );

    res.json({ message: "Producto enviado a Segundas exitosamente" });
  } catch (error) {
    console.error("Error al mandar el producto a Segundas:", error);
    res.status(500).json({
      message: "Error al mandar el producto a Segundas",
      error: error.message,
    });
  }
};

const getProducto = async (req, res) => {
  const { codigo_pro } = req.body;

  try {
    const [rows] = await pool.query(`
      SELECT
        des, 
        inventario,
        code_pz,
        code_palet
        code_pq,
        code_master,
        code_inner,
        _pz, 
        _pq, 
        _inner, 
        _master, 
        largo_pz, 
        largo_inner, 
        largo_master, 
        ancho_pz, 
        ancho_inner, 
        ancho_master, 
        alto_pz, 
        alto_inner, 
        alto_master, 
        peso_pz, 
        peso_inner, 
        peso_master, 
        garantia 
      FROM productos 
      WHERE codigo_pro = ?
    `, [codigo_pro]);

    if (rows.length > 0) {
      res.json(rows[0]);  // Retornamos el primer producto encontrado
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto", error: error.message });
  }
};

const updateProducto = async (req, res) => {
  const {
    des,
    inventario,
    code_pz,
    code_palet,
    code_pq,
    code_master,
    code_inner,
    _pz,
    _pq,
    _inner,
    _master,
    largo_pz,
    largo_inner,
    largo_master,
    ancho_pz,
    ancho_inner,
    ancho_master,
    alto_pz,
    alto_inner,
    alto_master,
    peso_pz,
    peso_inner,
    peso_master,
    garantia,
    codigo_pro  // Agregar código del producto para identificarlo
  } = req.body;

  if (!codigo_pro) {
    return res.status(400).json({ message: "Falta el código del producto (codigo_pro)" });
  }

  try {
    const [result] = await pool.query(`
      UPDATE productos SET
        des = ?, 
        inventario = ?,
        code_pz = ?,
        code_palet = ?,
        code_pq = ?,
        code_master = ?,
        code_inner = ?,
        _pz = ?,
        _pq = ?,
        _inner = ?,
        _master = ?,
        largo_pz = ?,
        largo_inner = ?,
        largo_master = ?,
        ancho_pz = ?,
        ancho_inner = ?,
        ancho_master = ?,
        alto_pz = ?,
        alto_inner = ?,
        alto_master = ?,
        peso_pz = ?,
        peso_inner = ?,
        peso_master = ?,
        garantia = ?
      WHERE codigo_pro = ?
    `, [
      des,
      inventario,
      code_pz,
      code_palet,
      code_pq,
      code_master,
      code_inner,
      _pz,
      _pq,
      _inner,
      _master,
      largo_pz,
      largo_inner,
      largo_master,
      ancho_pz,
      ancho_inner,
      ancho_master,
      alto_pz,
      alto_inner,
      alto_master,
      peso_pz,
      peso_inner,
      peso_master,
      garantia,
      codigo_pro  // Usar el código del producto para la condición WHERE
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "Producto actualizado exitosamente" });
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
  }
};

const insertarOActualizarProducto = async (req) => {
  try {
    const datos = req.body;
    console.log("Datos recibidos para insertar o actualizar:", datos);

    // Validación de campos esenciales
    if (!datos.codigo_pro || !datos.des || !datos.inventario ||
      !datos.code_pz || !datos.code_pq || !datos.code_master || !datos.code_inner || 
      !datos._pz || !datos._pq || !datos._inner || !datos._master ||
      !datos.largo_pz || !datos.largo_inner || !datos.largo_master ||
      !datos.ancho_pz || !datos.ancho_inner || !datos.ancho_master ||
      !datos.alto_pz || !datos.alto_inner || !datos.alto_master ||
      !datos.peso_pz || !datos.peso_inner || !datos.peso_master ||
      !datos.garantia) {
      throw new Error("Datos incompletos para insertar el producto.");
    }

    // Preparar los datos completos
    const datosCompletos = {
      codigo_pro: datos.codigo_pro,
      des: datos.des,
      inventario: parseInt(datos.inventario, 10),
      code_pz: parseInt(datos.code_pz, 10),
      code_pq: parseInt(datos.code_pq, 10),
      code_master: parseInt(datos.code_master, 10),
      code_inner: parseInt(datos.code_inner, 10),
      _pz: parseInt(datos._pz, 10),
      _pq: parseInt(datos._pq, 10),
      _inner: parseInt(datos._inner, 10),
      _master: parseInt(datos._master, 10),
      largo_pz: parseFloat(datos.largo_pz),
      largo_inner: parseFloat(datos.largo_inner),
      largo_master: parseFloat(datos.largo_master),
      ancho_pz: parseFloat(datos.ancho_pz),
      ancho_inner: parseFloat(datos.ancho_inner),
      ancho_master: parseFloat(datos.ancho_master),
      alto_pz: parseFloat(datos.alto_pz),
      alto_inner: parseFloat(datos.alto_inner),
      alto_master: parseFloat(datos.alto_master),
      peso_pz: parseFloat(datos.peso_pz),
      peso_inner: parseFloat(datos.peso_inner),
      peso_master: parseFloat(datos.peso_master),
      garantia: datos.garantia || 'Sin garantía'
    };

    // Construir la consulta SQL
    const query = `
      INSERT INTO productos (
        codigo_pro, des, inventario, code_pz, code_pq,
        code_master, code_inner, _pz, _pq, _inner, _master,
        largo_pz, largo_inner, largo_master, ancho_pz, ancho_inner, ancho_master,
        alto_pz, alto_inner, alto_master, peso_pz, peso_inner, peso_master, garantia, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    
    // Mostrar consulta y datos para depuración
    console.log("Consulta SQL:", query);
    console.log("Valores:", [
      datosCompletos.codigo_pro,
      datosCompletos.des,
      datosCompletos.inventario,
      datosCompletos.code_pz,
      datosCompletos.code_pq,
      datosCompletos.code_master,
      datosCompletos.code_inner,
      datosCompletos._pz,
      datosCompletos._pq,
      datosCompletos._inner,
      datosCompletos._master,
      datosCompletos.largo_pz,
      datosCompletos.largo_inner,
      datosCompletos.largo_master,
      datosCompletos.ancho_pz,
      datosCompletos.ancho_inner,
      datosCompletos.ancho_master,
      datosCompletos.alto_pz,
      datosCompletos.alto_inner,
      datosCompletos.alto_master,
      datosCompletos.peso_pz,
      datosCompletos.peso_inner,
      datosCompletos.peso_master,
      datosCompletos.garantia
    ]);

    // Ejecutar la consulta SQL
    await pool.query(query, [
      datosCompletos.codigo_pro,
      datosCompletos.des,
      datosCompletos.inventario,
      datosCompletos.code_pz,
      datosCompletos.code_pq,
      datosCompletos.code_master,
      datosCompletos.code_inner,
      datosCompletos._pz,
      datosCompletos._pq,
      datosCompletos._inner,
      datosCompletos._master,
      datosCompletos.largo_pz,
      datosCompletos.largo_inner,
      datosCompletos.largo_master,
      datosCompletos.ancho_pz,
      datosCompletos.ancho_inner,
      datosCompletos.ancho_master,
      datosCompletos.alto_pz,
      datosCompletos.alto_inner,
      datosCompletos.alto_master,
      datosCompletos.peso_pz,
      datosCompletos.peso_inner,
      datosCompletos.peso_master,
      datosCompletos.garantia
    ]);

    console.log("Producto insertado correctamente.");
  } catch (error) {
    console.error("Error en insertarProductoYMostrarExistente:", error.message);
  }
};


const getProductosInactivos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        codigo_pro AS codigo, 
        des AS des, 
        CASE 
          WHEN activo = 1 THEN 'Activo' 
          ELSE 'Inactivo' 
        END AS estado 
      FROM productos 
      WHERE activo = 0
    `);

    if (rows.length > 0) {
      res.json(rows);  // Retorna todos los productos inactivos encontrados
    } else {
      res.status(404).json({ message: "No se encontraron productos inactivos" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos inactivos", error: error.message });
  }
};


module.exports = {
  getCalidad,
  autorizarRecibo,
  enviarCuarentena,
  enviarSegundas,
  getProducto,
  updateProducto,
  insertarOActualizarProducto,
  getProductosInactivos,
};
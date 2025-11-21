const pool = require("../config/database"); // Importa la configuración de la base de datos

// Controlador para consultar información de una ubicación específica
const consultarUbicacionEspecifica = async (req, res) => {
  console.log("Consulta de ubicación específica:", req.body);
  const { ubicacion } = req.body;

  if (!ubicacion) {
    return res.status(400).json({ error: "La ubicación es requerida" });
  }

  const query = `
    SELECT 
      u.id_ubi,
      prod.des,    
      u.ubi, 
      u.code_prod,     
      u.cant_stock 
    FROM ubi_alma u
    LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro 
    WHERE u.ubi = ?;
  `;

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool

    // Ejecutar la consulta
    const [results] = await connection.query(query, [ubicacion]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    // Estructura la respuesta con los datos de la ubicación
    const response = {
      id_ubicacion: results[0].id_ubi,
      descripcion: results[0].des,
      ubicacion: results[0].ubi,
      codigo_producto: results[0].code_prod,
      cantidad_stock: results[0].cant_stock,
    };

    res.status(200).json(response); // Retornar la respuesta estructurada
  } catch (error) {
    console.error("Error en la consulta de ubicación:", error);
    res.status(500).send("Error en la consulta de ubicación");
  } finally {
    if (connection) connection.release();
  }
};

// Nueva consulta: Consultar información de ubicaciones y productos
const consultarUbicacionesConProductos = async (req, res) => {
  console.log("Consulta de ubicaciones y productos:", req.body);

  const query = `
    SELECT 
      u.id_ubi,
      u.ubi,
      u.code_prod,
      p.des
    FROM ubicaciones u
    LEFT JOIN productos p ON u.code_prod = p.codigo_pro;
  `;

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool

    // Ejecutar la consulta
    const [results] = await connection.query(query);

    if (results.length === 0) {
      return res.status(404).json({ error: "No se encontraron ubicaciones" });
    }

    // Estructura la respuesta con los datos obtenidos
    const response = results.map((row) => ({
      id_ubicacion: row.id_ubi,
      ubicacion: row.ubi,
      codigo_producto: row.code_prod,
      descripcion_producto: row.des,
    }));

    res.status(200).json(response); // Retornar la respuesta estructurada
  } catch (error) {
    console.error("Error en la consulta de ubicaciones y productos:", error);
    res.status(500).send("Error en la consulta de ubicaciones y productos");
  } finally {
    if (connection) connection.release();
  }
};

const actualizarCodigo = async (req, res) => {
  console.log("Actualización de código:", req.body);
  const { id_ubicacion, codigo_producto, id_usuario } = req.body;

  if (!id_ubicacion || !codigo_producto || !id_usuario) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const query = `
    UPDATE ubicaciones 
    SET code_prod = ? 
    WHERE id_ubi = ?;
  `;

  let connection;
  try {
    connection = await pool.getConnection();

    // Ejecutar la actualización
    const [result] = await connection.query(query, [
      codigo_producto,
      id_ubicacion,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Código actualizado correctamente" });
    } else {
      res.status(404).json({ error: "No se encontró la ubicación" });
    }
  } catch (error) {
    console.error("Error en la actualización del código:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    if (connection) connection.release();
  }
};

const pickDisponible = async (req, res) => {
  console.log("Consulta de ubicaciones disponibles (sin producto)");

  const query = `
    SELECT 
      id_ubi,
      ubi,
      code_prod 
    FROM ubicaciones 
    WHERE code_prod IS NULL OR code_prod = 0;
  `;

  let connection;
  try {
    connection = await pool.getConnection();

    const [results] = await connection.query(query);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay ubicaciones disponibles" });
    }

    const response = results.map((row) => ({
      id_ubicacion: row.id_ubi,
      ubicacion: row.ubi,
      codigo_producto: row.code_prod,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al consultar ubicaciones disponibles:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    if (connection) connection.release();
  }
};

const AlmaDisponible = async (req, res) => {
  console.log("Consulta de ubicaciones disponibles (sin producto)");

  const query = `
    SELECT 
      id_ubi,
      ubi,
      code_prod 
    FROM ubi_alma 
    WHERE code_prod IS NULL OR code_prod = 0;
  `;

  let connection;
  try {
    connection = await pool.getConnection();

    const [results] = await connection.query(query);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay ubicaciones disponibles" });
    }

    const response = results.map((row) => ({
      id_ubicacion: row.id_ubi,
      ubicacion: row.ubi,
      codigo_producto: row.code_prod,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al consultar ubicaciones disponibles:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    if (connection) connection.release();
  }
};

const obtenerUbicacionesVacias = async (req, res) => {
  try {
    const { pasillo, nivel, par_impar, seccion, soloVacias } = req.query;

    if (!pool || typeof pool.query !== "function") {
      throw new Error(
        "Conexión a la base de datos no inicializada correctamente."
      );
    }

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

    // 🧭 Filtros opcionales
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

    // 🧩 Solo aplicar el filtro de vacías si se pide explícitamente
    if (soloVacias === "true") {
      sql += `
        AND (
          code_prod IS NULL
          OR TRIM(code_prod) = ''
          OR code_prod = '0'
          OR cant_stock IS NULL
          OR cant_stock = 0
        )
      `;
    }

    // ✅ Ordenar por ubicación completa
    sql += " ORDER BY ubi ASC";

    const [rows] = await pool.query(sql, params);

    return res.status(200).json(rows || []);
  } catch (error) {
    console.error("❌ Error en obtenerUbicacionesVacias:", error);
    res.status(500).json({
      error: "Error consultando ubicaciones",
      detalle: error.message,
    });
  }
};

// 🔹 Obtener ubicaciones por código de producto (para montacargas)
const getUbiMonta = async (req, res) => {
  try {
    const { code_prod } = req.body;

    // 🧩 Validar entrada
    if (!code_prod || isNaN(code_prod)) {
      return res.status(400).json({
        error: "Debe proporcionar un 'code_prod' válido en el body.",
        ejemplo: { code_prod: 8419 }
      });
    }

    // 🧱 Consulta SQL: buscar ubicaciones que contengan ese producto
    const [rows] = await pool.query(
      `
      SELECT 
        id_ubi,
        ubi,
        code_prod
      FROM ubicaciones
      WHERE code_prod = ?
      ORDER BY ubi ASC
      `,
      [code_prod]
    );

    // 🧾 Respuesta si no se encuentra nada
    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron ubicaciones para el código ${code_prod}.`,
      });
    }

    // ✅ Respuesta exitosa
    return res.status(200).json({
      code_prod,
      total_ubicaciones: rows.length,
      ubicaciones: rows,
    });

  } catch (error) {
    console.error("❌ Error en getUbiMonta:", error);
    res.status(500).json({
      error: "Error consultando ubicaciones por código.",
      detalle: error.message,
    });
  }
};


module.exports = {
  consultarUbicacionEspecifica,
  consultarUbicacionesConProductos,
  actualizarCodigo,
  pickDisponible,
  AlmaDisponible,
  obtenerUbicacionesVacias,
  getUbiMonta
};

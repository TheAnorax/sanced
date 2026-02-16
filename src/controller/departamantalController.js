const pool = require("../config/database");

const getpick7066 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT  
        d.id_ubicacion,
        d.ubi,

        -- 🔥 NORMALIZAMOS A 4 DÍGITOS
        LPAD(d.code_prod, 4, '0') AS code_prod,

        p.des,
        d.cant_stock,
        d.cant_stock_mov,
        d.pasillo,
        d.lote,
        d.almacen_entrada,
        d.almacen_salida,
        d.fecha_salida,
        d.codigo_salida,
        u.name    
      FROM departamental_pick AS d
      LEFT JOIN usuarios AS u 
        ON d.codigo_salida = u.id_usu
      LEFT JOIN productos AS p 
        ON LPAD(d.code_prod, 4, '0') = LPAD(p.codigo_pro, 4, '0')
    `);

    res.json({
      error: false,
      message: "Datos obtenidos",
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error en getpick7066:", error);
    res.status(500).json({
      error: true,
      message: "Error al obtener los datos",
      details: error.message,
    });
  }
};

const createPick7066 = async (req, res) => {
  const { ubi, code_prod, cant_stock, pasillo, codigo_salida } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO departamental_pick (ubi, code_prod, cant_stock, pasillo, codigo_salida) 
       VALUES (?, ?, ?, ?, ?)`,
      [ubi, code_prod, cant_stock, pasillo, codigo_salida]
    );
    res.status(201).json({
      error: false,
      message: "Registro creado",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error en createPick:", error);
    res.status(500).json({
      error: true,
      message: "Error al crear el registro",
      details: error.message,
    });
  }
};

const updatePick7066 = async (req, res) => {
  const { id } = req.params;
  const { ubi, code_prod, cant_stock, pasillo, codigo_salida } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE departamental_pick SET ubi=?, code_prod=?, cant_stock=?,  pasillo=?,  codigo_salida=? WHERE id_ubicacion=?`,
      [ubi, code_prod, cant_stock, pasillo, codigo_salida, id]
    );
    res.json({
      error: false,
      message: "Registro actualizado",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error en updatePick:", error);
    res.status(500).json({
      error: true,
      message: "Error al actualizar el registro",
      details: error.message,
    });
  }
};

const deletePick7066 = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM departamental_pick WHERE id_ubicacion = ?`,
      [id]
    );
    res.json({
      error: false,
      message: "Registro eliminado",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error en deletePick:", error);
    res.status(500).json({
      error: true,
      message: "Error al eliminar el registro",
      details: error.message,
    });
  }
};

//Nuevo funcionamiento de departamental

const getDepartamental = async (req, res) => {
  try {
    const { nombre } = req.query;

    // 1️⃣ Si NO viene nombre → mostrar todo
    if (!nombre) {
      const [rows] = await pool.query(`
        SELECT *
        FROM departamental
        ORDER BY FOLIO DESC
      `);

      return res.json({
        error: false,
        message: "Datos departamental (sin filtro de usuario)",
        data: rows,
      });
    }

    // 2️⃣ Verificar si el usuario tiene clientes asignados
    const [clientesAsignados] = await pool.query(
      `
      SELECT cliente
      FROM usuarios_clientes
      WHERE nombre_usuario = ?
      `,
      [nombre]
    );

    // 3️⃣ Si NO tiene clientes → mostrar todo
    if (clientesAsignados.length === 0) {
      const [rows] = await pool.query(`
        SELECT *
        FROM departamental
        ORDER BY FOLIO DESC
      `);

      return res.json({
        error: false,
        message: "Usuario sin clientes asignados, mostrando todo",
        data: rows,
      });
    }

    // 4️⃣ Si SÍ tiene clientes → filtrar
    const clientes = clientesAsignados.map((c) => c.cliente);

    const [rows] = await pool.query(
      `
      SELECT *
      FROM departamental
      WHERE CLIENTE IN (?)
      ORDER BY FOLIO DESC
      `,
      [clientes]
    );

    res.json({
      error: false,
      message: "Datos departamental filtrados por usuario",
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error en getDepartamental:", error);
    res.status(500).json({
      error: true,
      message: "Error al obtener datos de departamental",
      details: error.message,
    });
  }
};

// ====================================
// // CREAR NUEVO REGISTRO DEPARTAMENTAL
// ====================================
const crearDepartamental = async (req, res) => {
  const {
    FOLIO,
    CLIENTE,
    CEDIS,
    DESTINO,
    NO_DE_OC,
    VD,
    CONFIRMACION,
    MONTO,
    FECHA_LLEGADA_OC,
    FECHA_CANCELACION,
    FECHA_DE_CARGA,
    HORA,
    FECHA_DE_CITA,
    HORA_CITA,
    EMPACADOR,
    ESTATUS,
    TIPO_DE_ENVIO,
    COMENTARIOS,
  } = req.body;

  // ===============================
  // 🔒 VALIDACIONES OBLIGATORIAS
  // ===============================
  if (FOLIO === undefined || FOLIO === null) {
    return res.status(400).json({
      ok: false,
      campo: "FOLIO",
      mensaje: "❌ El FOLIO es obligatorio",
    });
  }

  if (!NO_DE_OC || NO_DE_OC.toString().trim() === "") {
    return res.status(400).json({
      ok: false,
      campo: "NO_DE_OC",
      mensaje: "❌ El número de orden de compra es obligatorio",
    });
  }

  if (!VD || VD.toString().trim() === "") {
    return res.status(400).json({
      ok: false,
      campo: "VD",
      mensaje: "❌ El VD es obligatorio",
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ===============================
    // 🔍 VALIDAR DUPLICADOS
    // ===============================

    // 🔹 FOLIO (ÚNICO)
    const [folioExiste] = await conn.query(
      `SELECT 1 FROM departamental WHERE FOLIO = ? LIMIT 1`,
      [FOLIO]
    );

    if (folioExiste.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        ok: false,
        campo: "FOLIO",
        mensaje: "❌ El FOLIO ya está registrado",
      });
    }

    // 🔹 VD (ÚNICO)
    const [vdExiste] = await conn.query(
      `SELECT 1 FROM departamental WHERE VD = ? LIMIT 1`,
      [VD]
    );

    if (vdExiste.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        ok: false,
        campo: "VD",
        mensaje: "❌ El VD ya está registrado",
      });
    }

    // ===============================
    // 🟢 INSERTAR (OC PUEDE REPETIRSE)
    // ===============================
    await conn.query(
      `
      INSERT INTO departamental (
        FOLIO, CLIENTE, CEDIS, DESTINO, NO_DE_OC,
        VD, CONFIRMACION, MONTO,
        FECHA_LLEGADA_OC, FECHA_CANCELACION,
        FECHA_DE_CARGA, HORA,
        FECHA_DE_CITA, HORA_CITA,
        EMPACADOR, ESTATUS,
        TIPO_DE_ENVIO, COMENTARIOS
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        FOLIO,
        CLIENTE,
        CEDIS,
        DESTINO,
        NO_DE_OC,
        VD,
        CONFIRMACION,
        MONTO,
        FECHA_LLEGADA_OC,
        FECHA_CANCELACION,
        FECHA_DE_CARGA,
        HORA,
        FECHA_DE_CITA,
        HORA_CITA,
        EMPACADOR,
        ESTATUS,
        TIPO_DE_ENVIO,
        COMENTARIOS,
      ]
    );

    await conn.commit();

    return res.json({
      ok: true,
      mensaje: " Registro creado correctamente",
      folio: FOLIO,
    });
  } catch (error) {
    await conn.rollback();
    console.error("❌ Error al crear departamental:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  } finally {
    conn.release();
  }
};

const actualizarDepartamentalPorVD = async (req, res) => {
  const { VD } = req.params;

  const {
    CLIENTE,
    CEDIS,
    DESTINO,
    NO_DE_OC,
    CONFIRMACION,
    MONTO,
    FECHA_LLEGADA_OC,
    FECHA_CANCELACION,
    FECHA_DE_CARGA,
    HORA,
    FECHA_DE_CITA,
    HORA_CITA,
    EMPACADOR,
    ESTATUS,
    TIPO_DE_ENVIO,
    COMENTARIOS,
    GUIA,
  } = req.body;

  if (!VD) {
    return res.status(400).json({
      ok: false,
      mensaje: "❌ VD es obligatorio para actualizar",
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 🔎 Validar que exista el VD
    const [existe] = await conn.query(
      `SELECT COUNT(*) total FROM departamental WHERE VD = ?`,
      [VD]
    );

    if (existe[0].total === 0) {
      await conn.rollback();
      return res.status(404).json({
        ok: false,
        mensaje: "❌ No existe un registro con ese VD",
      });
    }

    // 🔄 Actualizar
    await conn.query(
      `
      UPDATE departamental
      SET
        CLIENTE = ?,
        CEDIS = ?,
        DESTINO = ?,
        NO_DE_OC = ?,
        CONFIRMACION = ?,
        MONTO = ?,
        FECHA_LLEGADA_OC = ?,
        FECHA_CANCELACION = ?,
        FECHA_DE_CARGA = ?,
        HORA = ?,
        FECHA_DE_CITA = ?,
        HORA_CITA = ?,
        EMPACADOR = ?,
        ESTATUS = ?,
        TIPO_DE_ENVIO = ?,
        COMENTARIOS = ?,
        GUIA = ?
      WHERE VD = ?
      `,
      [
        CLIENTE,
        CEDIS,
        DESTINO,
        NO_DE_OC,
        CONFIRMACION,
        MONTO, // ← ya viene normalizado desde el front
        FECHA_LLEGADA_OC,
        FECHA_CANCELACION,
        FECHA_DE_CARGA,
        HORA,
        FECHA_DE_CITA,
        HORA_CITA,
        EMPACADOR,
        ESTATUS,
        TIPO_DE_ENVIO,
        COMENTARIOS,
        GUIA,
        VD,
      ]
    );

    await conn.commit();

    res.json({
      ok: true,
      mensaje: " Registro actualizado correctamente por VD",
      VD,
    });
  } catch (error) {
    await conn.rollback();
    console.error("❌ Error al actualizar por VD:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  } finally {
    conn.release();
  }
};

// Obtener CEDIS y DESTINO por CLIENTE
const obtenerCedisDestinoPorCliente = async (req, res) => {
  const { cliente } = req.params;

  if (!cliente) {
    return res.status(400).json({
      ok: false,
      mensaje: "Cliente requerido",
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT CEDIS, DESTINO
      FROM departamental
      WHERE CLIENTE = ?
      ORDER BY CEDIS, DESTINO
      `,
      [cliente]
    );

    res.json({
      ok: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error obtener CEDIS/DESTINO:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener CEDIS y DESTINO",
    });
  }
};

const obtenerSiguienteFolio = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT IFNULL(MAX(FOLIO), 0) + 1 AS siguiente
      FROM departamental
    `);

    res.json({
      ok: true,
      siguienteFolio: rows[0].siguiente,
    });
  } catch (error) {
    console.error("Error al obtener folio:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener el siguiente folio",
    });
  }
};

const obtenerClientesValidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT CLIENTE
      FROM departamental
    `);

    const clientes = rows.map(r => r.CLIENTE.toUpperCase().trim());

    res.json({
      ok: true,
      data: clientes
    });

  } catch (error) {
    console.error("Error clientes:", error);
    res.status(500).json({ ok: false });
  }
};


module.exports = {
  getpick7066,
  createPick7066,
  updatePick7066,
  deletePick7066,
  getDepartamental,
  crearDepartamental,
  actualizarDepartamentalPorVD,
  obtenerCedisDestinoPorCliente,
  obtenerSiguienteFolio,
  obtenerClientesValidos
};

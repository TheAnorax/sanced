const pool = require("../config/database");
const net = require("net");
const axios = require("axios");

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

// ======================================
// // CREAR NUEVO REGISTRO DEPARTAMENTAL
// ======================================

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

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

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
        FOLIO || null,
        CLIENTE || null,
        CEDIS || null,
        DESTINO || null,
        NO_DE_OC || null,
        VD || null,
        CONFIRMACION || null,
        MONTO || 0,
        FECHA_LLEGADA_OC || null,
        FECHA_CANCELACION || null,
        FECHA_DE_CARGA || null,
        HORA || null,
        FECHA_DE_CITA || null,
        HORA_CITA || null,
        EMPACADOR || null,
        ESTATUS || null,
        TIPO_DE_ENVIO || null,
        COMENTARIOS || null,
      ]
    );

    await conn.commit();

    return res.json({
      ok: true,
      mensaje: "Insertado sin validaciones",
    });
  } catch (error) {
    await conn.rollback();

    console.error("❌ Error:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al insertar",
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

    const clientes = rows.map((r) => r.CLIENTE.toUpperCase().trim());

    res.json({
      ok: true,
      data: clientes,
    });
  } catch (error) {
    console.error("Error clientes:", error);
    res.status(500).json({ ok: false });
  }
};

const procesarExcelEtiquetas = async (req, res) => {
  try {
    const filas = req.body.filas;

    const encontrados = [];
    const noEncontrados = [];

    for (const row of filas) {
      const modelo = row.Modelo?.toString().trim();
      const ean = row["Ean/Upc"]?.toString().trim();

      let producto = null;

      // 1️⃣ Buscar por MODELO
      if (modelo) {
        const [rows] = await pool.query(
          `
          SELECT codigo_pro, des
          FROM productos
          WHERE LPAD(codigo_pro,4,'0') = LPAD(?,4,'0')
          LIMIT 1
          `,
          [modelo]
        );

        if (rows.length > 0) {
          producto = rows[0];
        }
      }

      // 2️⃣ Si no lo encontró usar EAN
      if (!producto && ean) {
        // quitar último dígito (check digit)
        const eanSinCheck = ean.slice(0, -1);

        // tomar penúltimos 4
        const ultimos4 = eanSinCheck.slice(-4);

        const [rows] = await pool.query(
          `
          SELECT codigo_pro, des
          FROM productos
          WHERE LPAD(codigo_pro,4,'0') = LPAD(?,4,'0')
          LIMIT 1
          `,
          [ultimos4]
        );

        if (rows.length > 0) {
          producto = rows[0];
        }
      }

      // 3️⃣ Si lo encontró
      if (producto) {
        encontrados.push({
          modelo_excel: modelo,
          ean,
          codigo: producto.codigo_pro,
          descripcion: producto.des,
        });
      } else {
        // ❌ no encontrado
        noEncontrados.push({
          modelo_excel: modelo,
          ean,
        });
      }
    }

    res.json({
      ok: true,
      encontrados,
      noEncontrados,
      total: filas.length,
      totalEncontrados: encontrados.length,
      totalNoEncontrados: noEncontrados.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error procesando archivo",
    });
  }
};

const imprimir = async (req, res) => {
  try {
    console.log("📥 LLEGÓ PETICIÓN:", req.body);

    global.colaImpresion = global.colaImpresion || [];
    global.colaImpresion.push(req.body);

    console.log("📦 COLA ACTUAL:", global.colaImpresion.length);

    res.json({
      ok: true,
      mensaje: "Guardado en cola",
    });
  } catch (error) {
    console.error("❌ ERROR:", error);

    res.status(500).json({
      ok: false,
    });
  }
};



const generarConsecutivo = async (req, res) => {
  try {
    const { codigoInicio, cantidad, piezas, numeroCaja, impresora } = req.body;

    global.colaImpresion = global.colaImpresion || [];
    global.colaImpresion = [];

    const base = "75019423";
    const codigo = codigoInicio.toString();

    let cantidadReal = Number(cantidad);

    // 🔥 SI ES IMPAR → LO HACEMOS PAR
    if (cantidadReal % 2 !== 0) {
      cantidadReal += 1;
    }

    for (let i = 0; i < cantidadReal; i++) {

      const ean = `${base}${codigo}4`;

      global.colaImpresion.push({
        tipo: "CONSECUTIVO",
        ean,
        piezas: piezas.toString(),

        // 👇 ESTE ES EL REAL (para impresión)
        numeroEtiqueta: i + 1,

        // 👇 ESTE ES EL VISUAL (LO QUE VE EL USUARIO)
        total: cantidad, // 🔥 NO CAMBIA

        numeroCaja: numeroCaja ? `${numeroCaja}/C` : "",
        ip: impresora,
      });
    }

    res.json({
      ok: true,
      totalGeneradas: cantidad,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
};


const previewEtiqueta = async (req, res) => {
  try {
    const { cedis, oc, ean, piezas, numeroCaja, numeroEtiqueta } = req.query;

    const zpl = `
^XA
^PW800
^LL1200

^CF0,40

^FO40,30^FDCedis:^FS
^FO250,30^FD${cedis}^FS

^FO100,80^BY3^BCN,100,Y,N,N^FD${cedis}^FS

^FO40,220^FDO C:^FS
^FO100,260^BY3^BCN,100,Y,N,N^FD${oc}^FS

^FO40,400^FDUPC:^FS
^FO100,440^BY2^BEN,100,Y,N^FD${ean}^FS

^FO500,440^FDPiezas:^FS
^FO650,440^A0N,60,60^FD${piezas}^FS

^FO40,600^A0N,50,50^FDPiezas total en caja^FS
^FO600,600^A0N,60,60^FD${piezas}^FS

^FO250,700^BY3^BCN,100,Y,N,N^FD${numeroEtiqueta}^FS

^FO40,850^A0N,50,50^FDNo. de caja:^FS
^FO500,850^A0N,80,80^FD${numeroCaja}^FS

^XZ
`;

    const response = await axios.post(
      "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/",
      zpl,
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando preview" });
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
  obtenerClientesValidos,
  procesarExcelEtiquetas,
  imprimir,
  previewEtiqueta,
  generarConsecutivo,
};

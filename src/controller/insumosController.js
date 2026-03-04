const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const pool = require("../config/database");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "insumos.santul@gmail.com",
    pass: "shxy lyfn mmda tivv",
  },
});

// Se ejecuta cada 10 minutos
cron.schedule("*/1 * * * *", async () => {
  console.log("⏳ Actualizando requerimientos...");

  try {
    await pool.query(`
            UPDATE insumos_config c
            JOIN insumos_2 i ON i.id_insumo = c.id_insumo
            SET c.requerimiento = 
                CASE
                    WHEN i.inventario <= c.inventario_minimo
                    THEN c.inventario_minimo - i.inventario
                    ELSE 0
                END
        `);

    console.log("✅ Requerimientos actualizados");
  } catch (error) {
    console.error("❌ Error actualizando requerimientos:", error);
  }
});

// ================================
// Obtener insumos (con configuración)
// ================================
const getInsumos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT 
                i.id_insumo,
                i.codigo_insumo,
                i.descripcion,
                i.medidas,
                i.um,
                i.inventario,
                i.minimo_compra,
                i.tiempo_entrega,
                i.area,
                i.foto_insumos,
                i.fecha_creacion,
                IFNULL(c.inventario_minimo, 0) AS inventario_minimo_config,
                
                CASE
                    WHEN i.inventario <= IFNULL(c.inventario_minimo,0)
                    THEN IFNULL(c.inventario_minimo,0) - i.inventario
                    ELSE 0
                END AS requerimiento_calculado

            FROM insumos_2 i
            LEFT JOIN insumos_config c 
                ON i.id_insumo = c.id_insumo
            ORDER BY i.id_insumo
        `);

    res.send(rows);
  } catch (error) {
    console.error("Error en consulta insumos:", error);
    res.status(500).send("Error en la consulta");
  }
};

// ================================
// Crear nuevo insumo + imagen=====
// ================================
const crearInsumo = async (req, res) => {
  try {
    const {
      codigo_insumo,
      descripcion,
      medidas,
      um,
      inventario,
      minimo_compra,
      tiempo_entrega,
      area,
    } = req.body;

    const foto = req.file ? req.file.filename : null;

    await pool.query(
      `INSERT INTO insumos_2
      (codigo_insumo, descripcion, medidas, um, inventario, minimo_compra, tiempo_entrega, area, foto_insumos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_insumo,
        descripcion,
        medidas,
        um,
        inventario,
        minimo_compra,
        tiempo_entrega,
        area,
        foto,
      ]
    );

    res.send({ message: "Insumo creado correctamente" });
  } catch (error) {
    console.error("Error al crear insumo:", error);
    res.status(500).send("Error al crear insumo");
  }
};

// ================================
// Obtener áreas                  =
// ================================
const getAreas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre
      FROM depart
      ORDER BY nombre ASC
    `);

    res.send(rows);
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).send("Error al obtener áreas");
  }
};

// ================================
// Actualizar insumo
// ================================
const actualizarInsumo = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      codigo_insumo,
      descripcion,
      medidas,
      um,
      inventario,
      minimo_compra,
      tiempo_entrega,
      area,
    } = req.body;

    const foto = req.file ? req.file.filename : null;

    let query = `
      UPDATE insumos_2 SET
        codigo_insumo = ?,
        descripcion = ?,
        medidas = ?,
        um = ?,
        inventario = ?,
        minimo_compra = ?,
        tiempo_entrega = ?,
        area = ?
    `;

    const params = [
      codigo_insumo,
      descripcion,
      medidas,
      um,
      inventario,
      minimo_compra,
      tiempo_entrega,
      area,
    ];

    // Si envían nueva imagen
    if (foto) {
      query += `, foto_insumos = ?`;
      params.push(foto);
    }

    query += ` WHERE id_insumo = ?`;
    params.push(id);

    await pool.query(query, params);

    res.send({ message: "Insumo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar insumo:", error);
    res.status(500).send("Error al actualizar");
  }
};

// ===================================
// Obtener configuración por id_insumo
// ===================================
const getConfigByInsumo = async (req, res) => {
  try {
    const { id_insumo } = req.params;

    const [rows] = await pool.query(
      `SELECT 
          id_config,
          id_insumo,
          consumo_mensual,
          inventario_optimo,
          inventario_minimo,
          requerimiento
       FROM insumos_config
       WHERE id_insumo = ?`,
      [id_insumo]
    );

    // Si no existe, regresar valores en 0
    if (rows.length === 0) {
      return res.send({
        id_insumo,
        consumo_mensual: 0,
        inventario_optimo: 0,
        inventario_minimo: 0,
        requerimiento: 0,
      });
    }

    res.send(rows[0]);
  } catch (error) {
    console.error("Error getConfigByInsumo:", error);
    res.status(500).send("Error al obtener configuración");
  }
};

// ===============================
// Crear o actualizar configuración
// ===============================
const saveConfig = async (req, res) => {
  try {
    const { id_insumo } = req.params;

    const {
      consumo_mensual,
      inventario_optimo,
      inventario_minimo,
      requerimiento,
    } = req.body;

    // Verificar si ya existe
    const [exist] = await pool.query(
      "SELECT id_config FROM insumos_config WHERE id_insumo = ?",
      [id_insumo]
    );

    if (exist.length > 0) {
      // UPDATE
      await pool.query(
        `UPDATE insumos_config SET
          consumo_mensual = ?,
          inventario_optimo = ?,
          inventario_minimo = ?,
          requerimiento = ?
         WHERE id_insumo = ?`,
        [
          consumo_mensual,
          inventario_optimo,
          inventario_minimo,
          requerimiento,
          id_insumo,
        ]
      );
    } else {
      // INSERT
      await pool.query(
        `INSERT INTO insumos_config
          (id_insumo, consumo_mensual, inventario_optimo, inventario_minimo, requerimiento)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_insumo,
          consumo_mensual,
          inventario_optimo,
          inventario_minimo,
          requerimiento,
        ]
      );
    }

    res.send({ message: "Configuración guardada correctamente" });
  } catch (error) {
    console.error("Error saveConfig:", error);
    res.status(500).send("Error al guardar configuración");
  }
};

// ================================
// Movimiento de inventario
// ================================
const movimientoInsumo = async (req, res) => {
  const {
    codigo_insumo,
    tipo_movimiento,
    cantidad,
    responsable,
    area,
    entregado_a,
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar movimiento
    await connection.query(
      `INSERT INTO movimientos_insumos
      (codigo_insumo, tipo_movimiento, cantidad, responsable, area, entregado_a)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo_insumo, tipo_movimiento, cantidad, responsable, area, entregado_a]
    );

    // Actualizar inventario
    if (tipo_movimiento === "ENTRADA") {
      await connection.query(
        `UPDATE insumos_2 SET inventario = inventario + ? WHERE codigo_insumo = ?`,
        [cantidad, codigo_insumo]
      );
    } else {
      await connection.query(
        `UPDATE insumos_2 SET inventario = inventario - ? WHERE codigo_insumo = ?`,
        [cantidad, codigo_insumo]
      );
    }

    await connection.commit();
    res.send({ message: "Movimiento realizado" });
  } catch (error) {
    await connection.rollback();
    res.status(500).send("Error en movimiento");
  } finally {
    connection.release();
  }
};

// ======================================
// Historial GENERAL de movimientos
// ======================================
const getHistorialGeneral = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id_movimiento,
        m.codigo_insumo,
        m.tipo_movimiento,
        m.cantidad,
        u.name AS responsable_nombre,
        m.area,
        m.entregado_a,
        m.fecha,
        DATE_FORMAT(m.fecha, '%Y-%m') AS mes
      FROM movimientos_insumos m
      LEFT JOIN usuarios u 
        ON m.responsable = u.id_usu
      ORDER BY m.fecha DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error historial general:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

// ======================================
// Solicitar insumo
// ======================================
const solicitarInsumo = async (req, res) => {
  try {
    const {
      codigo,
      descripcion,
      cantidad,
      solicitante_nombre,
      solicitante_correo,
      tiempo_entrega,
    } = req.body;

    // Validar mínimo de compra
    const [insumo] = await pool.query(
      "SELECT minimo_compra FROM insumos_2 WHERE codigo_insumo = ?",
      [codigo]
    );

    if (insumo.length === 0) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    const minimo = insumo[0].minimo_compra;

    if (cantidad < minimo) {
      return res.status(400).json({
        error: `La cantidad mínima de compra es ${minimo}`,
      });
    }

    // Calcular fecha de llegada
    const fechaLlegada = new Date();
    fechaLlegada.setDate(fechaLlegada.getDate() + Number(tiempo_entrega));

    // INSERT (sin solicitante_id)
    await pool.query(
      `
            INSERT INTO solicitudes_insumos
            (codigo, descripcion, cantidad, fecha, solicitante_nombre, solicitante_correo, solicitado, fecha_llegada)
            VALUES (?, ?, ?, NOW(), ?, ?, 0, ?)
        `,
      [
        codigo,
        descripcion,
        cantidad,
        solicitante_nombre,
        solicitante_correo,
        fechaLlegada,
      ]
    );

    // ===============================
    // ENVIAR CORREO
    // ===============================

    const templatePath = path.join(
      __dirname,
      "templates",
      "solicitudInsumo.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    html = html
      .replace("{{codigo}}", codigo)
      .replace("{{descripcion}}", descripcion)
      .replace("{{cantidad}}", cantidad)
      .replace("{{solicitante}}", solicitante_nombre)
      .replace("{{fecha_llegada}}", fechaLlegada.toLocaleDateString());

    // Correos destino (puedes agregar varios)
    const correosDestino = [
      "jonathan.alcantara@santul.net",
      "laura.carbajal@santul.net",
      "gerardo.rodriguez@santul.net",
      "rodrigo.arias@santul.net",
    ];

    await transporter.sendMail({
      from: '"Sistema Insumos" <insumos.santul@gmail.com>',
      to: correosDestino.join(","), // varios correos
      subject: `Nueva solicitud de insumo - ${codigo}`,
      html: html,
      attachments: [
        {
          filename: "logob.png",
          path: path.join(__dirname, "templates", "logob.png"),
          cid: "logo_santul",
        },
      ],
    });

    res.json({ message: "Solicitud registrada y correo enviado" });
  } catch (error) {
    console.error("Error en solicitarInsumo:", error);
    res.status(500).json({ error: "Error al solicitar insumo" });
  }
};

// PUT /insumos/aprobar/:id
const aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener datos de la solicitud
    const [rows] = await pool.query(
      `
            SELECT *
            FROM solicitudes_insumos
            WHERE id = ?
        `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const solicitud = rows[0];

    // 2. Actualizar a aprobada
    await pool.query(
      `
            UPDATE solicitudes_insumos
            SET solicitado = 1
            WHERE id = ?
        `,
      [id]
    );

    // ===============================
    // 3. ENVIAR CORREO AL SOLICITANTE
    // ===============================

    const templatePath = path.join(
      __dirname,
      "templates",
      "respuesta_solicitud.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    html = html
      .replace("{{codigo}}", solicitud.codigo)
      .replace("{{descripcion}}", solicitud.descripcion)
      .replace("{{cantidad}}", solicitud.cantidad)
      .replace(
        "{{fecha_llegada}}",
        new Date(solicitud.fecha_llegada).toLocaleDateString()
      );

    // Correo principal: el del solicitante
    const correoSolicitante = solicitud.solicitante_correo;

    // Otros correos opcionales (compras, control, etc.)
    const copia = [
      "jonathan.alcantara@santul.net",
      "gerardo.rodriguez@santul.net",
      "rodrigo.arias@santul.net",
    ];

    await transporter.sendMail({
      from: '"Sistema Insumos" <insumos.santul@gmail.com>',
      to: correoSolicitante,
      cc: copia.join(","), // copia opcional
      subject: `Solicitud aprobada - ${solicitud.codigo}`,
      html: html,
      attachments: [
        {
          filename: "logob.png",
          path: path.join(__dirname, "templates", "logob.png"),
          cid: "logo_santul",
        },
      ],
    });

    res.json({ message: "Solicitud aprobada y correo enviado" });
  } catch (error) {
    console.error("Error en aprobarSolicitud:", error);
    res.status(500).json({ error: "Error al aprobar solicitud" });
  }
};

// Obtener solicitudes pendientes
const obtenerSolicitudes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT 
                s.id,
                s.codigo,
                s.descripcion,
                s.cantidad,
                s.fecha,
                s.solicitante_nombre,
                s.solicitado,
                s.fecha_llegada,
                s.solicitante_correo,

                i.costos AS costo_unitario,
                (s.cantidad * IFNULL(i.costos,0)) AS costo_total

            FROM solicitudes_insumos s
            LEFT JOIN insumos_2 i 
                ON s.codigo = i.codigo_insumo

            ORDER BY s.fecha DESC
        `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};

// ======================================
// RESUMEN COMPLETO POR MES
// GET /insumos/solicitudes/resumen?mes=YYYY-MM
// ======================================
const getResumenSolicitudesMes = async (req, res) => {
  try {
    const mes = req.query.mes;

    const mesFinal = mes || new Date().toISOString().slice(0, 7);

    // =========================
    // TOTALES DEL MES
    // =========================
    const [totalesRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS solicitudes,
        IFNULL(SUM(s.cantidad),0) AS piezas_total,
        IFNULL(SUM(s.cantidad * IFNULL(i.costos,0)),0) AS costo_total
      FROM solicitudes_insumos s
      LEFT JOIN insumos_2 i
        ON i.codigo_insumo = s.codigo
      WHERE DATE_FORMAT(s.fecha,'%Y-%m') = ?
      `,
      [mesFinal]
    );

    const totales = totalesRows[0] || {
      solicitudes: 0,
      piezas_total: 0,
      costo_total: 0,
    };

    // =========================
    // TODOS LOS INSUMOS DEL MES
    // =========================
    const [insumosRows] = await pool.query(
      `
      SELECT
        s.codigo,
        MAX(s.descripcion) AS descripcion,
        SUM(s.cantidad) AS cantidad_total,
        IFNULL(MAX(i.costos),0) AS costo_unitario,
        SUM(s.cantidad * IFNULL(i.costos,0)) AS costo_total,
        COUNT(*) AS veces
      FROM solicitudes_insumos s
      LEFT JOIN insumos_2 i
        ON i.codigo_insumo = s.codigo
      WHERE DATE_FORMAT(s.fecha,'%Y-%m') = ?
      GROUP BY s.codigo
      ORDER BY costo_total DESC
      `,
      [mesFinal]
    );

    // =========================
    // RESPUESTA FINAL
    // =========================
    res.json({
      mes: mesFinal,
      totales: {
        solicitudes: Number(totales.solicitudes),
        piezas_total: Number(totales.piezas_total),
        costo_total: Number(totales.costo_total),
      },
      insumos: insumosRows.map((r) => ({
        codigo: r.codigo,
        descripcion: r.descripcion,
        cantidad_total: Number(r.cantidad_total),
        costo_unitario: Number(r.costo_unitario),
        costo_total: Number(r.costo_total),
        veces: Number(r.veces),
      })),
    });
  } catch (error) {
    console.error("Error resumen mes:", error);
    res.status(500).json({
      mes: req.query.mes || null,
      totales: {
        solicitudes: 0,
        piezas_total: 0,
        costo_total: 0,
      },
      insumos: [],
    });
  }
};

// ======================================
// MESES DISPONIBLES (siempre incluye mes actual)
// GET /insumos/solicitudes/meses
// ======================================
const getMesesSolicitudes = async (req, res) => {
  try {
    // 1) Mes actual (desde la BD, no desde el navegador)
    const [nowRows] = await pool.query(`
      SELECT DATE_FORMAT(NOW(), '%Y-%m') AS mes_actual
    `);
    const mesActual = nowRows?.[0]?.mes_actual;

    // 2) Meses existentes en solicitudes (solo si fecha es válida)
    const [rows] = await pool.query(`
      SELECT DISTINCT DATE_FORMAT(fecha, '%Y-%m') AS mes
      FROM solicitudes_insumos
      WHERE fecha IS NOT NULL
      ORDER BY mes DESC
    `);

    let meses = rows.map((r) => r.mes).filter(Boolean); // quita nulls

    // 3) Asegurar mes actual
    if (mesActual && !meses.includes(mesActual)) {
      meses.push(mesActual);
    }

    // 4) Ordenar DESC por seguridad
    meses.sort((a, b) => b.localeCompare(a));

    res.json(meses);
  } catch (error) {
    console.error("Error getMesesSolicitudes:", error);
    res.status(500).json({ error: "Error al obtener meses" });
  }
};

const getConsumoPorInsumo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const [rows] = await pool.query(
      `
            SELECT
                DATE_FORMAT(fecha, '%Y-%m') AS mes,
                SUM(cantidad) AS cantidad_total,
                COUNT(*) AS solicitudes,
                IFNULL(MAX(i.costos),0) AS costo_unitario,
                SUM(s.cantidad * IFNULL(i.costos,0)) AS costo_total
            FROM solicitudes_insumos s
            LEFT JOIN insumos_2 i
                ON i.codigo_insumo = s.codigo
            WHERE s.codigo = ?
            GROUP BY mes
            ORDER BY mes DESC
        `,
      [codigo]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error consumo por insumo:", error);
    res.status(500).json({ error: "Error al obtener consumo" });
  }
};

// ================================
// RECORDATORIO DE RECOLECCIÓN
// ================================

// Se ejecuta todos los días a las 8:00 AM

cron.schedule("39 11 * * *", async () => {
  console.log("📩 Verificando recordatorios de recolección...");

  try {
    const [rows] = await pool.query(`
            SELECT *
            FROM solicitudes_insumos
                WHERE DATE(fecha_llegada) = CURDATE()
                AND solicitado = 1
                AND solicitante_correo IS NOT NULL
                AND solicitante_correo <> ''
                AND recordatorio_enviado IS NULL
            `);

    for (const solicitud of rows) {
      const templatePath = path.join(
        __dirname,
        "templates",
        "recordatorio_recoleccion.html"
      );

      let html = fs.readFileSync(templatePath, "utf8");

      html = html
        .replace("{{codigo}}", solicitud.codigo)
        .replace("{{descripcion}}", solicitud.descripcion)
        .replace("{{cantidad}}", solicitud.cantidad)

        .replace(
          "{{fecha_llegada}}",
          new Date(solicitud.fecha_llegada).toLocaleDateString()
        );

      await transporter.sendMail({
        from: '"Sistema Insumos" <insumos.santul@gmail.com>',
        to: solicitud.solicitante_correo,
        subject: `Recordatorio de recolección - ${solicitud.codigo}`,
        cc: [
          "laura.carbajal@santul.net",
          "gerardo.rodriguez@santul.net",
          "rodrigo.arias@santul.net",
          "jonathan.alcantara@santul.net",
        ],
        html: html,
        attachments: [
          {
            filename: "logob.png",
            path: path.join(__dirname, "templates", "logob.png"),
            cid: "logo_santul",
          },
        ],
      });

      // Marcar como enviado
      await pool.query(
        `
                UPDATE solicitudes_insumos
                SET recordatorio_enviado = NOW()
                WHERE id = ?
            `,
        [solicitud.id]
      );
    }

    console.log("✅ Recordatorios enviados");
  } catch (error) {
    console.error("❌ Error enviando recordatorios:", error);
  }
});

module.exports = {
  getInsumos,
  crearInsumo,
  getAreas,
  actualizarInsumo,
  getConfigByInsumo,
  saveConfig,
  movimientoInsumo,
  getHistorialGeneral,
  solicitarInsumo,
  aprobarSolicitud,
  obtenerSolicitudes,
  getResumenSolicitudesMes,
  getMesesSolicitudes,
  getConsumoPorInsumo,
};

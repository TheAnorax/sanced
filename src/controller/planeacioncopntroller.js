const pool = require('../config/database');

const axios = require("axios");
// controllers/salesController.js

const getSales = async (req, res) => {
  try {
    const { clave } = req.query;

    if (!clave || typeof clave !== "string" || clave.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "La clave del producto es requerida y debe ser válida.",
      });
    }

    const cleanClave = (str) => str.trim().replace(/[\r\n\t]/g, "");
    const claveLimpia = cleanClave(clave);

    await pool.query("SET lc_time_names = 'es_ES'");
    const fechaActual = new Date().toISOString().split("T")[0];

    const query = `
      SELECT
        MONTHNAME(t.inicio_surtido) AS mes,
        t.codigo_ped,
        t.clave,
        SUM(t.cant_surti) AS total_vendido
      FROM (
        SELECT
          p.inicio_surtido,
          p.codigo_ped,
          prod.clave, 
          p.cant_surti
        FROM pedido_finalizado p
        LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
        WHERE TRIM(REPLACE(REPLACE(REPLACE(prod.clave, CHAR(13), ''), CHAR(10), ''), CHAR(9), '')) = ?
          AND p.inicio_surtido >= '2025-01-01' AND p.inicio_surtido < DATE_ADD(?, INTERVAL 1 DAY)

        UNION ALL

        SELECT
          e.inicio_surtido,
          e.codigo_ped,
          prod.clave,
          e.cant_surti
        FROM pedido_embarque e
        LEFT JOIN productos prod ON e.codigo_ped = prod.codigo_pro
        WHERE TRIM(REPLACE(REPLACE(REPLACE(prod.clave, CHAR(13), ''), CHAR(10), ''), CHAR(9), '')) = ?
          AND e.inicio_surtido >= '2025-01-01' AND e.inicio_surtido < DATE_ADD(?, INTERVAL 1 DAY)
      ) AS t
      GROUP BY mes, t.codigo_ped
      ORDER BY MONTH(t.inicio_surtido), total_vendido DESC
    `;

    const [rows] = await pool.query(query, [claveLimpia, fechaActual, claveLimpia, fechaActual]);

    return res.status(200).json({
      success: true,
      clave: claveLimpia,
      total_resultados: rows.length,
      datos: rows,
    });
  } catch (error) {
    console.error("Error en getSales:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener las ventas.",
      error: error.message,
    });
  }
};

const getPlacedOrders = async (req, res) => {
  try {
    const query = `
      SELECT 
        prod.des,        
        c.codigo,
        c.cant_recibir,
        c.arribo,
        c.tipo,
        prod.clave
      FROM recibo_compras c 
      LEFT JOIN productos prod ON c.codigo = prod.codigo_pro
      WHERE c.estado IN ("C", "F");
    `;

    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No placed orders found.",
        data: [],
      });
    }

    // ✅ Formatear fechas
    const formattedRows = rows.map((row) => ({
      ...row,
      arribo: row.arribo
        ? new Date(row.arribo).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : null,
    }));

    return res.status(200).json({
      success: true,
      total_results: formattedRows.length,
      data: formattedRows,
    });
  } catch (error) {
    console.error("❌ Error in getPlacedOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal error retrieving placed orders.",
      error: error.message,
    });
  }
};




// controllers/salesController.js
// controllers/salesController.js
const getSaleArrive = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.codigo,
        c.arribo,
        c.cant_recibir,
        prod.clave
      FROM recibo_compras c 
      LEFT JOIN productos prod ON c.codigo = prod.codigo_pro
      WHERE c.arribo >= CURDATE() AND c.estado IN ("C", "F");
    `;

    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      return res.status(200).json({
        success: false,
        message: "No hay arribos a partir de hoy.",
        fecha_actual: today,
        datos: [],
      });
    }

    return res.status(200).json({
      success: true,
      total_resultados: rows.length,
      datos: rows,
    });
  } catch (error) {
    console.error("❌ Error en getSaleArrive:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener los datos de llegada.",
      error: error.message,
    });
  }
};

 
const getSalesByStatus = async (req, res) => {
  try {
    const { fecha_inicio, NoCorto } = req.query;
    const fechaDesde = fecha_inicio || '2025-06-01';

    let codigoPedFilter = '';
    const params = [fechaDesde];

    if (NoCorto) {
      const codigoPed = parseInt(NoCorto, 10);
      if (!isNaN(codigoPed)) {
        codigoPedFilter = 'AND pe.codigo_ped = ?';
        params.push(codigoPed);
      }
    }

    // 🗓 Diccionario de meses en español
    const mesesEspanol = {
      1: "enero",
      2: "febrero",
      3: "marzo",
      4: "abril",
      5: "mayo",
      6: "junio",
      7: "julio",
      8: "agosto",
      9: "septiembre",
      10: "octubre",
      11: "noviembre",
      12: "diciembre"
    };

    const query = `
      SELECT 
        LPAD(pe.codigo_ped, 4, '0') AS NoCorto,
        MONTH(pe.inicio_surtido) AS mes_num,
        TRIM(p.ESTADO) AS estado,
        SUM(pe.cant_surti) AS total_vendido
      FROM (
        SELECT codigo_ped, cant_surti, pedido, inicio_surtido, tipo FROM pedido_embarque
        UNION ALL
        SELECT codigo_ped, cant_surti, pedido, inicio_surtido, tipo FROM pedido_finalizado
      ) pe
      LEFT JOIN paqueteria p ON pe.pedido = p.no_orden_int AND pe.tipo = p.tipo_original
      WHERE pe.inicio_surtido >= ?
      ${codigoPedFilter}
      GROUP BY pe.codigo_ped, mes_num, TRIM(p.ESTADO)
      ORDER BY pe.codigo_ped
    `;

    const [rows] = await pool.query(query, params);

    // 🧠 Traducir el mes numérico a español
    const datosTraducidos = rows.map(row => ({
      ...row,
      mes: mesesEspanol[row.mes_num] || "mes inválido"
    }));

    return res.status(200).json({
      success: true,
      fecha_inicio: fechaDesde,
      filtro_NoCorto: NoCorto || "NO APLICADO",
      total_resultados: datosTraducidos.length,
      datos: datosTraducidos
    });
  } catch (error) {
    console.error("❌ Error en getSalesByStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener las ventas por estado.",
      error: error.message,
    });
  }
};


const getFactura = async (req, res) => {
  try {
    const { no_factura } = req.body;

    if (!no_factura || isNaN(no_factura)) {
      return res.status(400).json({
        success: false,
        message: "El parámetro 'no_factura' es requerido y debe ser un número.",
      });
    }

    const query = `
      SELECT
        \`NUM. CLIENTE\` AS clave_dir,
        \`NOMBRE DEL CLIENTE\` AS nombre,
        \`FECHA_DE_ENTREGA_CLIENTE\` AS fecha_entrega,
        \`DIRECCION\` AS direccion,
        \`NO_FACTURA\` AS numero_factura,
        \`routeName\` AS ruta,
        \`PAQUETERIA\` AS transporte
      FROM paqueteria
      WHERE \`NO_FACTURA\` = ?
    `;

    const [rows] = await pool.query(query, [no_factura]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada.",
        datos: [],
      });
    }

    // ✅ Función para formatear fecha como dd-mm-yyyy
    const clean = (v) =>
      typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v;
    const formatearFecha = (fecha) => {
      const date = new Date(fecha);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const anio = date.getFullYear();
      return `${dia}-${mes}-${anio}`;
    };

    // ✅ Limpiar dirección y formatear fecha
    const datos = rows.map(row => ({
      clave_dir: row.clave_dir,
      nombre: row.nombre,
      direccion: row.direccion
        ? row.direccion.replace(/\s+/g, ' ').trim()
        : null,
      fecha_entrega: row.fecha_entrega
        ? formatearFecha(row.fecha_entrega)
        : null,
      numero_factura: row.numero_factura,
        ruta: row.ruta ? clean(row.ruta) : null,
        transporte: row.transporte ? clean(row.transporte) : null,
    }));

    return res.status(200).json({
      success: true,
      total_resultados: datos.length,
      datos: datos,
    });
  } catch (error) {
    console.error("❌ Error en getFactura:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener la factura.",
      error: error.message,
    });
  }
};

const getArriveOC = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.oc,
        c.codigo,
        prod.des,
        c.cant_recibir,
        DATE_FORMAT(c.arribo, '%d-%m-%y') AS arribo, 
        prod.clave,
        c.contenedor,
        c.referencia
      FROM recibo_compras c 
      LEFT JOIN productos prod ON c.codigo = prod.codigo_pro
      WHERE c.arribo >= CURDATE() AND c.estado IN ("C", "F");
    `;

    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      return res.status(200).json({
        success: false,
        message: "No hay arribos a partir de hoy.",
        fecha_actual: today,
        datos: [],
      });
    }

    return res.status(200).json({
      success: true,
      total_resultados: rows.length,
      datos: rows,
    });
  } catch (error) {
    console.error("❌ Error en getArriveOC:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener los datos de llegada.",
      error: error.message,
    });
  }
};



function normalize(v) {
  return (v ?? "").toString().trim(); // si necesitas mayúsculas/case exacto, ajústalo aquí
}

async function fetchWithRetry(url, maxRetries = 2, baseDelayMs = 300) {
  let attempt = 0;
  while (true) {
    try {
      const res = await axios.get(url, { timeout: 10000 }); // 10s
      return res.data;
    } catch (err) {
      attempt++;
      const status = err.response?.status;
      const retriable = !status || (status >= 500 && status < 600) || status === 429;
      if (attempt > maxRetries || !retriable) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1); // 300, 600, 1200ms...
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function processInBatches(items, batchSize, worker) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    const out = await Promise.all(slice.map(worker));
    results.push(...out);
  }
  return results;
}

const postQueretaro = async (req, res) => {
  try {
    const query = `
      SELECT 
        nombre,
        Num_cliente AS 'Num_cliente',
        \`FISCAL_RELACIONADO_(CAMPO 2)\` AS Num_cliente_fiscal,
        nombre_encargado,
        num_ventas as 'id_vendedor',
        num_telf,
        correro,
        lat,
        \`long\`,
        foto,
        zona,
        giro,
        portafolio,
        segmento,
        ruta,
        dia_visita,
        dia_reparto,
        exibido,
        STATUS
      FROM proyectoqueretaro;
    `;

    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No hay registros en la tabla proyectoqueretaro.",
        datos: [],
      });
    }

    const datosConPortafolio = await Promise.all(
      rows.map(async (item) => {
        try {
          const giro = (item.giro || "").trim();
          const portafolio = (item.portafolio || "").trim();
          const segmento = (item.segmento || "").trim();

          // si falta alguno, no pegues al API
          if (!giro || !portafolio || !segmento) {
            return { ...item, portafolio_detalle: [] };
          }

          const url = `http://66.232.105.87:3007/api/Queretaro/category/${encodeURIComponent(giro)}/${encodeURIComponent(portafolio)}/${encodeURIComponent(segmento)}`;
          // console.log(`🔍 Consultando: ${url}`);

          const { data } = await axios.get(url, { timeout: 10000 });

          // 👇 aquí el fix
          const payload = Array.isArray(data) ? data 
                        : (Array.isArray(data?.data) ? data.data : []);

          if (!Array.isArray(payload)) {
            console.warn(`⚠️ Respuesta inesperada del API para ${giro}/${portafolio}/${segmento}:`, typeof data);
          }

          return {
            ...item,
            portafolio_detalle: Array.isArray(payload) ? payload : [],
          };
        } catch (err) {
          console.error(`❌ Error consultando portafolio para cliente ${item.Num_cliente}:`, err.message);
          return {
            ...item,
            portafolio_detalle: [],
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      total_resultados: datosConPortafolio.length,
      datos: datosConPortafolio,
    });
  } catch (error) {
    console.error("❌ Error en postQueretaro:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener los datos de Queretaro.",
      error: error.message,
    });
  }
};











  


module.exports = { getSales, getSaleArrive, getSalesByStatus, getPlacedOrders, getFactura, getArriveOC,postQueretaro };

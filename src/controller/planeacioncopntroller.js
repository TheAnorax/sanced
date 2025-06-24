const pool = require('../config/database');

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

  // consulta con el pedido
// const getSalesByStatus = async (req, res) => {
//   try {
//     const { fecha_inicio, NoCorto } = req.query;
//     const fechaDesde = fecha_inicio || '2025-06-01';

//     let codigoPedFilter = '';
//     const params = [fechaDesde];

//     if (NoCorto) {
//       const codigoPed = parseInt(NoCorto, 10);
//       if (!isNaN(codigoPed)) {
//         codigoPedFilter = 'AND pe.codigo_ped = ?';
//         params.push(codigoPed);
//       }
//     }

//     const query = `
//       SELECT 
//         LPAD(pe.codigo_ped, 4, '0') AS NoCorto,
//         pe.pedido,
//         pe.cant_surti AS total_vendido,
//         DATE_FORMAT(pe.inicio_surtido, '%M') AS mes,
//         p.ESTADO AS estado
//       FROM (
//         SELECT pedido, codigo_ped, cant_surti, inicio_surtido FROM pedido_embarque
//         UNION ALL
//         SELECT pedido, codigo_ped, cant_surti, inicio_surtido FROM pedido_finalizado
//       ) pe
//       LEFT JOIN paqueteria p ON pe.pedido = p.no_orden_int
//       WHERE pe.inicio_surtido >= ?
//       ${codigoPedFilter}
//       ORDER BY pe.codigo_ped
//     `;

//     const [rows] = await pool.query(query, params);

//     return res.status(200).json({
//       success: true,
//       fecha_inicio: fechaDesde,
//       filtro_NoCorto: NoCorto || "NO APLICADO",
//       total_resultados: rows.length,
//       datos: rows,
//     });
//   } catch (error) {
//     console.error("❌ Error en getSalesByStatus:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error interno al obtener las ventas por estado.",
//       error: error.message,
//     });
//   }
// };

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
  p.ESTADO AS estado,
  SUM(pe.cant_surti) AS total_vendido
    FROM (
      SELECT codigo_ped, cant_surti, pedido, inicio_surtido, tipo FROM pedido_embarque
      UNION ALL
      SELECT codigo_ped, cant_surti, pedido, inicio_surtido, tipo FROM pedido_finalizado
    ) pe
  LEFT JOIN paqueteria p ON pe.pedido = p.no_orden_int AND pe.tipo = p.tipo_original

    WHERE pe.inicio_surtido >= ?
    ${codigoPedFilter}
    GROUP BY pe.codigo_ped, mes_num, p.ESTADO
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






  


module.exports = { getSales, getSaleArrive, getSalesByStatus };

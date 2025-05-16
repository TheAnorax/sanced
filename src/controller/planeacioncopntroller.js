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

    // Establecer idioma español para nombres de meses
    await pool.query("SET lc_time_names = 'es_ES'");

    // Obtener la fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split("T")[0]; // Ejemplo: 2025-04-28

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
    WHERE prod.clave = ? AND p.inicio_surtido >= '2025-01-01' AND p.inicio_surtido < DATE_ADD(?, INTERVAL 1 DAY)

    UNION ALL

    SELECT
      e.inicio_surtido,
      e.codigo_ped,
      prod.clave,
      e.cant_surti
    FROM pedido_embarque e
    LEFT JOIN productos prod ON e.codigo_ped = prod.codigo_pro
    WHERE prod.clave = ? AND e.inicio_surtido >= '2025-01-01' AND e.inicio_surtido < DATE_ADD(?, INTERVAL 1 DAY)
  ) AS t
  GROUP BY mes, t.codigo_ped
  ORDER BY MONTH(t.inicio_surtido), total_vendido DESC
`;

const [rows] = await pool.query(query, [clave, fechaActual, clave, fechaActual]);


    return res.status(200).json({
      success: true,
      clave,
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

  
  
  
  


module.exports = { getSales, getSaleArrive };

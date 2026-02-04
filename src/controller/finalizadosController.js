const pool = require("../config/database");
const moment = require("moment");

const getFinalizados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
    pedido,
    tipo,
    origen,
    ubi_bahia,
    MIN(registro) AS registro,
    MIN(registro_surtido) AS registro_surtido,
    MIN(registro_embarque) AS registro_embarque, 
    COUNT(codigo_ped) AS partidas
FROM (
    SELECT
      'pedido_surtido' AS origen,
      ps.pedido,
      ps.tipo,
      ps.ubi_bahia,
      ps.codigo_ped,
      ps.registro,
      ps.registro_surtido,
      NULL AS registro_embarque
    FROM pedido_surtido ps
    WHERE ps.registro >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)

    UNION ALL

    SELECT
      'pedido_embarque' AS origen,
      pe.pedido,
      pe.tipo, 
      pe.ubi_bahia,
      pe.codigo_ped,
      pe.registro,
      pe.registro_surtido,
      pe.registro_embarque
    FROM pedido_embarque pe
    WHERE pe.registro >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)

    UNION ALL

    SELECT
      'pedido_fin' AS origen,
      pf.pedido,
      pf.tipo,
      pf.ubi_bahia,
      pf.codigo_ped,
      pf.registro,
      pf.registro_surtido,
      NULL AS registro_embarque
    FROM pedido_finalizado pf
    WHERE pf.registro >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
) AS pedidos
GROUP BY pedido, tipo, origen, ubi_bahia
ORDER BY pedido DESC;

    `);

    // Ya no necesitas agrupar en el controlador
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los pedidos finalizados:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los pedidos", error: error.message });
  }
};

const getPedidoDetalles = async (req, res) => {
  const { pedido, tipo } = req.params;

  try {
    const [rows] = await pool.query(
      `
SELECT
    'pedido_surtido' AS origen,
    ps.pedido,
    ps.codigo_ped,
    prod1.des AS descripcion,
    ps.cantidad,
    ps.cant_surti,
    ps.cant_no_env,
    ps.ubi_bahia AS bahias,     
    ps.um,
    ps._pz,
    ps._pq, 
    ps._inner,
    ps._master,    
    NULL AS v_pz,         
    NULL AS v_pq,           
    NULL AS v_inner,          
    NULL AS v_master, 
    us_surtido.name AS usuario_surtido,
    us_paqueteria.name AS usuario_paqueteria,    
    ps.registro,    
    ps.registro_surtido,
    ps.inicio_surtido,
    ps.fin_surtido,   
    NULL AS inicio_embarque,
    NULL AS fin_embarque,
    ps.motivo,
    ps.unificado,
    NULL AS registro_fin
FROM
    pedido_surtido ps
LEFT JOIN productos prod1 ON ps.codigo_ped = prod1.codigo_pro
LEFT JOIN usuarios us_surtido ON ps.id_usuario_surtido = us_surtido.id_usu
LEFT JOIN usuarios us_paqueteria ON ps.id_usuario_paqueteria = us_paqueteria.id_usu
WHERE
    ps.pedido = ? AND ps.tipo = ?

UNION ALL

SELECT
    'pedido_embarque' AS origen,
    pe.pedido,
    pe.codigo_ped,
    prod2.des AS descripcion,
    pe.cantidad,
    pe.cant_surti,
    pe.cant_no_env,
    pe.ubi_bahia AS bahias, 
    pe.um,
    pe._pz,
    pe._pq,
    pe._inner,
    pe._master,    
    pe.v_pz,         
    pe.v_pq,           
    pe.v_inner,          
    pe.v_master,   
    us_surtido.name AS usuario_surtido,
    us_paqueteria.name AS usuario_paqueteria,
    pe.registro,
    pe.registro_surtido,
    pe.inicio_surtido,
    pe.fin_surtido, 
    pe.inicio_embarque,
    pe.fin_embarque,
    pe.motivo,
    pe.unificado,
    NULL AS registro_fin
FROM
    pedido_embarque pe
LEFT JOIN productos prod2 ON pe.codigo_ped = prod2.codigo_pro
LEFT JOIN usuarios us_surtido ON pe.id_usuario_surtido = us_surtido.id_usu
LEFT JOIN usuarios us_paqueteria ON pe.id_usuario_paqueteria = us_paqueteria.id_usu
WHERE
    pe.pedido = ? AND pe.tipo = ?

UNION ALL

SELECT
    'pedido_fin' AS origen,
    pf.pedido,
    pf.codigo_ped,
    prod3.des AS descripcion,
    pf.cantidad,
    pf.cant_surti,
    pf.cant_no_env,
    pf.ubi_bahia AS bahias, 
    pf.um,
    pf._pz,
    pf._pq,
    pf._inner,
    pf._master,
    pf.v_pz,         
    pf.v_pq,           
    pf.v_inner,          
    pf.v_master,
    us_surtido.name AS usuario_surtido,
    us_paqueteria.name AS usuario_paqueteria,
    pf.registro,
    pf.registro_surtido,
    pf.inicio_surtido,
    pf.fin_surtido,
    pf.inicio_embarque,
    pf.fin_embarque,
    pf.motivo,
    pf.unificado,
    pf.registro_fin
FROM
    pedido_finalizado pf
LEFT JOIN productos prod3 ON pf.codigo_ped = prod3.codigo_pro
LEFT JOIN usuarios us_surtido ON pf.id_usuario_surtido = us_surtido.id_usu
LEFT JOIN usuarios us_paqueteria ON pf.id_usuario_paqueteria = us_paqueteria.id_usu
WHERE
    pf.pedido = ? AND pf.tipo = ?;
`,
      [pedido, tipo, pedido, tipo, pedido, tipo] // 👈 Agrega los parámetros en el orden correcto
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los detalles del pedido:", error);
    res.status(500).json({
      message: "Error al obtener los detalles del pedido",
      error: error.message,
    });
  }
};

const getMotivos = async (req, res) => {
  try {
    let { desde, hasta } = req.query;

    // 🗓️ Fechas por defecto
    if (!desde || !hasta) {
      desde = moment().startOf("month").format("YYYY-MM-DD");
      hasta = moment().endOf("day").format("YYYY-MM-DD");
    }

    const [rows] = await pool.query(
      `
      SELECT 
        'surtido' AS origen,
        ps.pedido,
        ps.tipo,
        ps.codigo_ped,
        prod.des AS descripcion,
        ps.motivo,
        DATE_FORMAT(ps.inicio_surtido, '%d/%m/%Y %H:%i:%s') AS inicio_surtido,
        ps.cantidad,
        ps.cant_surti,
        ps.cant_no_env
      FROM pedido_surtido ps
      LEFT JOIN productos prod 
        ON ps.codigo_ped = prod.codigo_pro
      WHERE ps.motivo IS NOT NULL
        AND TRIM(ps.motivo) <> ''
        AND UPPER(TRIM(ps.motivo)) <> 'NULL'
        AND ps.cant_no_env > 0
        AND DATE(ps.inicio_surtido) BETWEEN ? AND ?

      UNION ALL

      SELECT 
        'embarque' AS origen,
        pe.pedido,
        pe.tipo,
        pe.codigo_ped,
        prod.des AS descripcion,
        pe.motivo,
        pe.inicio_surtido,
        pe.cantidad,
        pe.cant_surti,
        pe.cant_no_env
      FROM pedido_embarque pe
      LEFT JOIN productos prod 
        ON pe.codigo_ped = prod.codigo_pro
      WHERE pe.motivo IS NOT NULL
        AND TRIM(pe.motivo) <> ''
        AND UPPER(TRIM(pe.motivo)) <> 'NULL'
        AND pe.cant_no_env > 0
        AND DATE(pe.inicio_surtido) BETWEEN ? AND ?

      UNION ALL

      SELECT 
        'finalizado' AS origen,
        pf.pedido,
        pf.tipo,
        pf.codigo_ped,
        prod.des AS descripcion,
        pf.motivo,
        pf.inicio_surtido,
        pf.cantidad,
        pf.cant_surti,
        pf.cant_no_env
      FROM pedido_finalizado pf
      LEFT JOIN productos prod 
        ON pf.codigo_ped = prod.codigo_pro
      WHERE pf.motivo IS NOT NULL
        AND TRIM(pf.motivo) <> ''
        AND UPPER(TRIM(pf.motivo)) <> 'NULL'
        AND pf.cant_no_env > 0
        AND DATE(pf.inicio_surtido) BETWEEN ? AND ?
      `,
      [
        desde, hasta,
        desde, hasta,
        desde, hasta
      ]
    );

    // 🔢 Contador de motivos
    const motivoContador = {};
    for (const row of rows) {
      const motivo = row.motivo.trim().toUpperCase();
      motivoContador[motivo] = (motivoContador[motivo] || 0) + 1;
    }

    res.json({
      status: "success",
      desde,
      hasta,
      total: rows.length,
      motivos_unicos: Object.keys(motivoContador).length,
      motivos_contador: motivoContador,
      resultados: rows,
    });
  } catch (error) {
    console.error("Error al obtener motivos:", error);
    res.status(500).json({
      message: "Error al obtener motivos",
      error: error.message
    });
  }
};


// GET /api/paqueteria/cliente/:numero
const getClientePorNumero = async (req, res) => {
  const { numero } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT * FROM paqueteria
      WHERE \`NUM. CLIENTE\` = ?
      ORDER BY FECHA DESC
      LIMIT 5
    `,
      [numero]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error al consultar paqueteria:", err);
    res.status(500).json({ error: "Error al buscar en paqueteria" });
  }
};

const getPedidoDetallesPorMes = async (req, res) => {
  const { mes, anio } = req.query;
  const anioFinal = anio || new Date().getFullYear();

  if (!mes || mes.length !== 2 || isNaN(parseInt(mes))) {
    return res
      .status(400)
      .json({ error: "Mes inválido. Debe enviarse como 'MM'" });
  }

  const fechaInicio = `${anioFinal}-${mes}-01`;
  const fechaFin = `${anioFinal}-${mes}-31`;

  try {
    const [rows] = await pool.query(
      `
     
      SELECT
          'pedido_fin' AS origen,
          pf.pedido,
          pf.codigo_ped,
          prod3.des AS descripcion,
          pf.cantidad,
          pf.cant_surti,
          pf.cant_no_env,
          pf.ubi_bahia AS bahias, 
          pf.um,
          pf._pz,
          pf._pq,
          pf._inner,
          pf._master,
          pf.v_pz,         
          pf.v_pq,           
          pf.v_inner,          
          pf.v_master,
          us_surtido.name AS usuario_surtido,
          us_paqueteria.name AS usuario_paqueteria,
          pf.registro,
          pf.registro_surtido,
          pf.inicio_surtido,
          pf.fin_surtido,
          pf.inicio_embarque,
          pf.fin_embarque,
          pf.motivo,
          pf.unificado,
          pf.registro_fin
      FROM pedido_finalizado pf
      LEFT JOIN productos prod3 ON pf.codigo_ped = prod3.codigo_pro
      LEFT JOIN usuarios us_surtido ON pf.id_usuario_surtido = us_surtido.id_usu
      LEFT JOIN usuarios us_paqueteria ON pf.id_usuario_paqueteria = us_paqueteria.id_usu
      WHERE pf.registro BETWEEN ? AND ?

      ORDER BY pedido DESC;
      `,
      [fechaInicio, fechaFin, fechaInicio, fechaFin, fechaInicio, fechaFin]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener detalles por mes:", error);
    res.status(500).json({
      message: "Error al obtener los detalles por mes",
      error: error.message,
    });
  }
};

module.exports = {
  getFinalizados,
  getPedidoDetalles,
  getMotivos,
  getClientePorNumero,
  getPedidoDetallesPorMes,
};

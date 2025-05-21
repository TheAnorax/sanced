const pool = require("../config/database");

const getEmbarques = async (req, res) => {
  try {
    const [rows] = await pool.query(` 
      SELECT
        MIN(p.id_pedi) AS id_pedi,  -- Usamos MIN para cumplir con ONLY_FULL_GROUP_BY
        p.tipo,
        p.pedido,
        p.id_usuario_paqueteria,
        (
          SELECT COUNT(DISTINCT p2.codigo_ped)
          FROM pedido_embarque p2
          WHERE p2.pedido = p.pedido AND p2.tipo = p.tipo
        ) AS partidas
      FROM pedido_embarque p
      WHERE p.estado = 'E'
        AND p.id_usuario_paqueteria IS NULL
      GROUP BY p.pedido, p.tipo, p.id_usuario_paqueteria
    `);

    const pedidos = rows.map((pedido) => ({
      id_pedi: pedido.id_pedi,
      tipo: pedido.tipo,
      pedido: pedido.pedido,
      partidas: pedido.partidas,
      id_usuario_paqueteria: pedido.id_usuario_paqueteria,
    }));

    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener los embarques:", error.message);
    res.status(500).json({
      message: "Error al obtener los pedidos",
      error: error.message,
    });
  }
};


const updateUsuarioEmbarques = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { id_usuario_paqueteria, tipo } = req.body;

    await pool.query(
      "UPDATE pedido_embarque SET id_usuario_paqueteria = ? WHERE pedido = ? AND tipo = ?",
      [id_usuario_paqueteria, pedidoId, tipo]
    );

    res
      .status(200)
      .json({ message: "Usuario de paquetería asignado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al asignar el usuario de paquetería",
      error: error.message,
    });
  }
};


const getProgresoValidacionEmbarque = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.pedido,
        us.name AS usuario,
        us.role,
        CAST(
          ((IFNULL(SUM(p.v_pz), 0) + IFNULL(SUM(p.v_pq), 0) + IFNULL(SUM(p.v_inner), 0) + IFNULL(SUM(p.v_master), 0)) /
          (SUM(p._pz) + SUM(p._pq) + SUM(p._inner) + SUM(p._master))) * 100
          AS DECIMAL(5, 2)) AS progreso_validacion,
        SUM(p._pz + p._pq + p._inner + p._master) AS cantidad_piezas,
        COUNT(DISTINCT p.codigo_ped) AS partidas
      FROM
        pedido_embarque p
      LEFT JOIN
        usuarios us ON p.id_usuario_paqueteria = us.id_usu
      WHERE
        p.estado = 'E'
        AND p.id_usuario_paqueteria IS NOT NULL
      GROUP BY p.pedido, us.name, us.role; 
    `);

    const filteredRows = rows.filter(
      (row) => row.role && row.role.includes("EB")
    );

    const pedidosPorUsuario = {};

    filteredRows.forEach((row) => {
      const usuario = row.usuario;

      if (pedidosPorUsuario[usuario]) {
        pedidosPorUsuario[usuario].cantidad_pedidos += 1;
        pedidosPorUsuario[usuario].cantidad_piezas += row.cantidad_piezas;
        pedidosPorUsuario[usuario].partidas += row.partidas;
      } else {
        pedidosPorUsuario[usuario] = {
          usuario: row.usuario,
          role: row.role,
          cantidad_pedidos: 1,
          cantidad_piezas: row.cantidad_piezas,
          partidas: row.partidas,
        };
      }
    });

    const usuariosConRecuento = Object.values(pedidosPorUsuario);

    res.json({
      pedidos: filteredRows,
      recuentoUsuarios: usuariosConRecuento,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el progreso de validación",
      error: error.message,
    });
  }
};
// src/controllers/productividad.js
const getProductividadEmbarcadores = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        us.name AS usuario,
        us.role,
        COUNT(DISTINCT combined.codigo_ped) AS partidas,
        SUM(combined._pz + combined._pq + combined._inner + combined._master) AS cantidad_piezas,
        MIN(combined.inicio_embarque) AS primer_inicio_embarque,
        MAX(combined.fin_embarque) AS ultimo_fin_embarque,
        TIMEDIFF(MAX(combined.fin_embarque), MIN(combined.inicio_embarque)) AS tiempo_total_trabajo
      FROM 
        (
          SELECT 
            p.id_usuario_paqueteria,
            p.codigo_ped,
            p._pz,
            p._pq,
            p._inner,
            p._master,
            p.inicio_embarque,
            p.fin_embarque
          FROM pedido_embarque p
          WHERE p.estado = 'F'
            AND p.id_usuario_paqueteria IS NOT NULL
            AND p.inicio_embarque BETWEEN CONCAT(CURDATE() - INTERVAL 1 DAY, ' 21:30:00') AND NOW()

          UNION ALL

          SELECT 
            pf.id_usuario_paqueteria,
            pf.codigo_ped,
            pf._pz,
            pf._pq,
            pf._inner,
            pf._master,
            pf.inicio_embarque,
            pf.fin_embarque
          FROM pedido_finalizado pf
          WHERE pf.estado = 'F'
            AND pf.id_usuario_paqueteria IS NOT NULL
            AND pf.inicio_embarque BETWEEN CONCAT(CURDATE() - INTERVAL 1 DAY, ' 21:30:00') AND NOW()
        ) AS combined
      LEFT JOIN 
        usuarios us ON combined.id_usuario_paqueteria = us.id_usu
      GROUP BY 
        us.name, us.role;
    `);

    const filteredRows = rows.filter(
      (row) => row.role && row.role.includes("EB")
    );

    res.json(filteredRows);
  } catch (error) {
    console.error("Error al obtener la productividad de embarcadores:", error);
    res.status(500).json({
      message: "Error al obtener la productividad de embarcadores",
      error: error.message,
    });
  }
};



const resetUsuarioEmbarque = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    await pool.query(
      "UPDATE pedido_embarque SET id_usuario_paqueteria = NULL WHERE pedido = ?",
      [pedidoId]
    );

    res.status(200).json({
      message: `Usuario de paquetería removido correctamente para el pedido ${pedidoId}`,
    });
  } catch (error) {
    console.error("Error al resetear usuario:", error);
    res.status(500).json({
      message: "Error al remover usuario de paquetería",
      error: error.message,
    });
  }
};


module.exports = { getEmbarques, updateUsuarioEmbarques ,  getProgresoValidacionEmbarque,  getProductividadEmbarcadores, resetUsuarioEmbarque };

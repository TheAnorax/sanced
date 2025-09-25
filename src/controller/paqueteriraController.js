const pool = require('../config/database');

const getPaqueteria = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      





SELECT
        p.id_pedi,
        p.tipo,
        p.pedido,
        p.id_usuario_paqueteria,
        p.registro_embarque,
        pq.TOTAL AS monto,
        pq.routeName AS ruta,
        pq.\`NOMBRE DEL CLIENTE\` AS cliente,
        pq.\`NO_FACTURA\` AS factura,
        (
          SELECT COUNT(DISTINCT p2.codigo_ped)
          FROM pedido_embarque p2 
          WHERE p2.pedido = p.pedido AND p2.tipo = p.tipo
        ) AS partidas
      FROM pedido_embarque p
      LEFT JOIN paqueteria pq ON p.pedido = pq.\`NO ORDEN\`
      WHERE p.estado = 'E'
        AND p.id_usuario_paqueteria IS NULL
      GROUP BY p.pedido, p.tipo      
      ORDER BY  p.registro_embarque DESC;
    `);

    const simplifiedPedidos = rows.map((pedido) => {
      // Formatear la fecha y hora
      let fechaHora = null;
      if (pedido.registro_embarque) {
        const d = new Date(pedido.registro_embarque);
        const fecha = d.toISOString().split("T")[0]; // YYYY-MM-DD
        const hora = d.toTimeString().split(" ")[0]; // HH:MM:SS
        fechaHora = `${fecha} ${hora}`;
      }

      return {
        id_pedi: pedido.id_pedi,
        tipo: pedido.tipo,
        pedido: pedido.pedido,
        partidas: pedido.partidas,  
        monto: pedido.monto,
        ruta: pedido.ruta,
        cliente: pedido.cliente,
        registro_embarque: fechaHora, // 👈 ya formateado
        id_usuario_paqueteria: pedido.id_usuario_paqueteria,
        factura: pedido.factura,
      };
    });

    res.json(simplifiedPedidos);
  } catch (error) {
    console.error("❌ Error al obtener pedidos de paquetería:", error.message);
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};




const updateUsuarioPaqueteria = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { id_usuario_paqueteria, tipo } = req.body;

    if (!tipo) {
      return res.status(400).json({ message: "Tipo de pedido requerido" });
    }

    await pool.query(
      'UPDATE pedido_embarque SET id_usuario_paqueteria = ? WHERE pedido = ? AND tipo = ?',
      [id_usuario_paqueteria, pedidoId, tipo]
    );

    res.status(200).json({ message: 'Usuario de paquetería asignado correctamente' });
  } catch (error) {
    console.error("❌ Error al asignar usuario de paquetería:", error.message);
    res.status(500).json({ message: 'Error al asignar el usuario de paquetería', error: error.message });
  }
};


// Obtener el progreso de validación de los pedidos
// Obtener el progreso de validación de los pedidos
const getProgresoValidacion = async (req, res) => {
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
        SUM(p._pz + p._pq + p._inner + p._master) AS cantidad_piezas, -- Sumatoria de las cantidades en cada pedido
        COUNT(DISTINCT p.codigo_ped) AS partidas -- Conteo de códigos de pedido distintos (partidas)
      FROM
        pedido_embarque p
      LEFT JOIN
        usuarios us ON p.id_usuario_paqueteria = us.id_usu
      WHERE
        p.estado = 'E'
        AND p.id_usuario_paqueteria IS NOT NULL
      GROUP BY p.pedido, us.name, us.role;
    `);

    // Filtrar solo los usuarios cuyo role contenga 'PQ'
    const filteredRows = rows.filter(row => row.role && row.role.includes('PQ'));

    // Crear un objeto para contar los pedidos asignados por usuario
    const pedidosPorUsuario = {};

    // Recorremos los pedidos filtrados para contar cuántos tiene cada usuario
    filteredRows.forEach((row) => {
      const usuario = row.usuario;

      // Si el usuario ya existe en el objeto, incrementamos su contador de pedidos
      if (pedidosPorUsuario[usuario]) {
        pedidosPorUsuario[usuario].cantidad_pedidos += 1;
        pedidosPorUsuario[usuario].cantidad_piezas += row.cantidad_piezas; // Sumar cantidad_piezas
        pedidosPorUsuario[usuario].partidas += row.partidas; // Sumar partidas
      } else {
        // Si el usuario no existe, lo inicializamos con el contador en 1
        pedidosPorUsuario[usuario] = {
          usuario: row.usuario,
          role: row.role,
          cantidad_pedidos: 1,
          cantidad_piezas: row.cantidad_piezas, // Inicializar con cantidad_piezas actual
          partidas: row.partidas // Inicializar con partidas actuales
        };
      }
    });

    // Convertimos el objeto en un array para devolverlo como parte de la respuesta
    const usuariosConRecuento = Object.values(pedidosPorUsuario);

    // Devolver tanto los pedidos como el recuento de pedidos por usuario
    res.json({
      pedidos: filteredRows,
      recuentoUsuarios: usuariosConRecuento
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el progreso de validación', error: error.message });
  }
};


const getProductividadEmpaquetadores = async (req, res) => {
  try {
    // Ejecutar la consulta para obtener los datos generales incluyendo total de pedidos
    const [rows] = await pool.query(`
      SELECT 
          us.name AS usuario,
          us.role,
          COUNT(DISTINCT combined.codigo_ped) AS partidas,
          COUNT(DISTINCT combined.pedido) AS pedidos, -- ← nuevo campo agregado
          SUM(combined._pz + combined._pq + combined._inner + combined._master) AS cantidad_piezas,
          MIN(combined.inicio_embarque) AS primer_inicio_embarque,
          MAX(combined.fin_embarque) AS ultimo_fin_embarque,
          TIMEDIFF(MAX(combined.fin_embarque), MIN(combined.inicio_embarque)) AS tiempo_total_trabajo
      FROM 
          ( 
            SELECT 
                p.id_usuario_paqueteria,
                p.codigo_ped,
                p.pedido, -- ← incluir campo pedido
                p._pz,
                p._pq,
                p._inner,
                p._master,
                p.inicio_embarque,
                p.fin_embarque
            FROM pedido_embarque p
            WHERE p.estado = 'F'
              AND p.id_usuario_paqueteria IS NOT NULL
              AND DATE(p.inicio_embarque) = CURDATE()

            UNION ALL

            SELECT 
                pf.id_usuario_paqueteria,
                pf.codigo_ped,
                pf.pedido, -- ← incluir campo pedido
                pf._pz,
                pf._pq,
                pf._inner,
                pf._master,
                pf.inicio_embarque,
                pf.fin_embarque
            FROM pedido_finalizado pf
            WHERE pf.estado = 'F'
              AND pf.id_usuario_paqueteria IS NOT NULL
              AND DATE(pf.inicio_embarque) = CURDATE()
          ) AS combined
      LEFT JOIN 
          usuarios us ON combined.id_usuario_paqueteria = us.id_usu
      GROUP BY 
          us.name, us.role;
    `);

    // Filtrar solo usuarios cuyo rol contenga 'PQ'
    const filteredRows = rows.filter(row => row.role && row.role.includes('PQ'));

    // Respuesta con datos de productividad filtrados
    res.json(filteredRows);

  } catch (error) {
    console.error('Error al obtener la productividad de empaquetadores:', error);
    res.status(500).json({
      message: 'Error al obtener la productividad de empaquetadores',
      error: error.message
    });
  }
};





module.exports = { getPaqueteria, updateUsuarioPaqueteria, getProgresoValidacion, getProductividadEmpaquetadores };



const pool = require('../config/database');

const getFinalizados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        'pedido_surtido' AS origen,
        ps.pedido,
        ps.tipo,
        ps.ubi_bahia,
        ps.codigo_ped,
        ps.ubi_bahia,
        ps.registro,
        ps.registro_surtido,
        NULL AS registro_embarque
      FROM pedido_surtido ps

      UNION ALL

      SELECT
        'pedido_embarque' AS origen,
        pe.pedido,
        pe.tipo, 
        pe.ubi_bahia,
        pe.codigo_ped,
        pe.ubi_bahia,
        pe.registro,
        pe.registro_surtido,
        pe.registro_embarque
      FROM pedido_embarque pe

      UNION ALL

      SELECT
        'pedido_fin' AS origen,
        pf.pedido,
        pf.tipo,
        pf.ubi_bahia,
        pf.codigo_ped,
        pf.ubi_bahia,
        pf.registro,
        pf.registro_surtido,
        NULL AS registro_embarque
      FROM pedido_finalizado pf
    `);

    // Agrupar resultados por 'pedido'
    const groupedPedidos = rows.reduce((acc, pedido) => {
      if (!acc[pedido.pedido]) {
        acc[pedido.pedido] = {
          origen: pedido.origen,
          pedido: pedido.pedido,
          tipo: pedido.tipo,
          ubi_bahia: pedido.ubi_bahia,
          partidas: 0, // Contador de partidas
          registro: pedido.registro,
          registro_surtido: pedido.registro_surtido,
          registro_embarque: pedido.registro_embarque || null, // Manejar el valor de registro_embarque
        };
      }
      acc[pedido.pedido].partidas += 1; // Incrementa el contador de partidas
      return acc;
    }, {});

    // Convertir el objeto agrupado en un array
    const response = Object.values(groupedPedidos);

    res.json(response);
  } catch (error) {
    console.error('Error al obtener los pedidos finalizados:', error);
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};


const getPedidoDetalles = async (req, res) => {
  const { pedido } = req.params;

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
    ps.pedido = ?

UNION ALL

SELECT
    'pedido_embarque' AS origen,
    pe.pedido,
    pe.codigo_ped,
    prod2.des AS descripcion,
    pe.cantidad,
    pe.cant_surti,
    pe.cant_no_env,
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
    pe.pedido = ?

UNION ALL

SELECT
    'pedido_fin' AS origen,
    pf.pedido,
    pf.codigo_ped,
    prod3.des AS descripcion,
    pf.cantidad,
    pf.cant_surti,
    pf.cant_no_env,
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
    pf.pedido = ?;`, 
      [pedido, pedido, pedido]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los detalles del pedido:', error);
    res.status(500).json({ message: 'Error al obtener los detalles del pedido', error: error.message });
  }
};


module.exports = { getFinalizados, getPedidoDetalles };

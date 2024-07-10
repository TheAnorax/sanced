const pool = require('../config/database');

const getPaqueteria = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id_pedi,
        p.tipo,
        p.pedido,
        p.codigo_ped,
        prod.des,
        p.cantidad,
        p.id_usuario_paqueteria,
        p.cant_surti,
        p.cant_no_env,
        p._pz AS pz,
        p._pq AS pq,
        p._inner AS inne,
        p._master AS maste,
        p.um,
        p.ubi_bahia, 
        p.estado,
        prod.code_pz,
        prod.code_pq,
        prod.code_inner,
        prod.code_master,  
        prod._pz,
        prod._inner,
        prod._pq,
        prod._master,
        (SELECT COUNT(DISTINCT p2.codigo_ped)
         FROM pedido_surtido p2
         WHERE p2.pedido = p.pedido) AS partidas
      FROM pedido_surtido p
      LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
      WHERE p.estado ='E'
      AND p.id_usuario_paqueteria IS NULL
      GROUP BY p.id_pedi    
    `);

    const groupedPedidos = rows.reduce((acc, pedido) => {
      if (!acc[pedido.pedido]) {
        acc[pedido.pedido] = {
          id_pedi: pedido.id_pedi,
          pedido: pedido.pedido,
          tipo: pedido.tipo,
          partidas: pedido.partidas,
          items: [],
        };
      }
      acc[pedido.pedido].items.push({
        id_pedi: pedido.id_pedi,
        codigo_ped: pedido.codigo_ped,
        des: pedido.des,
        cantidad: pedido.cantidad,
        cant_surti: pedido.cant_surti,
        cant_no_env: pedido.cant_no_env,
        id_usuario: pedido.id_usuario,
        um: pedido.um,
        _pz: pedido._pz,
        _pq: pedido._pq,
        _inner: pedido._inner,
        _master: pedido._master,
        ubi_bahia: pedido.ubi_bahia,
        estado: pedido.estado,
        cant_stock: pedido.cant_stock,
        ubi: pedido.ubi,
        code_pz: pedido.code_pz,
        code_pq: pedido.code_pq,
        code_inner: pedido.code_inner,
        code_master: pedido.code_master,
        pasillo: pedido.pasillo,
        um: pedido.um,
      });
      return acc;
    }, {});

    res.json(Object.values(groupedPedidos));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

const updateUsuarioPaqueteria = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { id_usuario_paqueteria } = req.body;

    await pool.query('UPDATE pedido_surtido SET id_usuario_paqueteria = ? WHERE pedido = ?', [id_usuario_paqueteria, pedidoId]);

    res.status(200).json({ message: 'Usuario de paquetería asignado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar el usuario de paquetería', error: error.message });
  }
};

module.exports = { getPaqueteria, updateUsuarioPaqueteria };

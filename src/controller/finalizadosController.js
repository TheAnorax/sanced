const pool = require('../config/database');

const getFinalizados = async (req, res) => {
    try {
      const [rows] = await pool.query(`
      SELECT
      p.id_pedi,
      p.pedido,
      p.tipo,
      p.codigo_ped,
      prod.des,
      p.cantidad,
      p.cant_surti,
      p.cant_no_env,
      p.id_usuario,
      p.um,
      p._pz,
      p._pq,
      p._inner,
      p._master,
      p.ubi_bahia,
      p.inicio_surtido,
      p.fin_surtido,
      p.estado,
      u.cant_stock,
      u.ubi,
      u.pasillo,
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
    LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod      
    WHERE p.estado = "E" 
    GROUP BY p.id_pedi
    ORDER BY u.ubi ASC;
      `);
  
      const groupedPedidos = rows.reduce((acc, pedido) => {
        if (!acc[pedido.pedido]) {
          acc[pedido.pedido] = {
            id_pedi: pedido.id_pedi,
            pedido: pedido.pedido,
            tipo: pedido.tipo,
            partidas: pedido.partidas,
            inicio_surtido: pedido.inicio_surtido,
            fin_surtido: pedido.fin_surtido,
            fecha_surtido: pedido.inicio_surtido,
            ubi_bahia: pedido.ubi_bahia,
            items: [],
          };
        }
        acc[pedido.pedido].items.push({
          id_pedi: pedido.id_pedi, // Add the unique id for each item
          codigo_ped: pedido.codigo_ped,
          des: pedido.des,
          cantidad: pedido.cantidad,
          cant_surti: pedido.cant_surti,
          cant_no_env: pedido.cant_no_env,
          id_usuario: pedido.id_usuario,
          um: pedido.um,
          _pz: pedido._pz,
          _pq: pedido._pq,        
          inicio_surtido: pedido.inicio_surtido,
          fin_surtido: pedido.fin_surtido,
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

module.exports = { getFinalizados };

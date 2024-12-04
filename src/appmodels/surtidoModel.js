// Archivo: src/models/surtidoModel.js
const pool = require('../config/database');

const getPedidosSurtido = async () => {
  const query = `
    SELECT 
      p.id_pedi AS idPedido,
      p.pedido AS numeroPedido,
      p.tipo AS tipoPedido,
      p.codigo_ped AS sku,
      p.cantidad AS cantidadSolicitada,
      p.cant_surti AS cantidadSurtida,
      p.cant_no_env AS cantidadNoEnviada,
      p.um AS unidadMedida,
      p.ubi_bahia AS ubicacionDestino,
      p.estado AS estado,
      p.registro_surtido AS fechaRegistro,
      us.role AS rolUsuario,
      u.cant_stock AS cantidadEnStock,
      u.ubi AS ubicacionProducto,
      u.pasillo AS pasilloProducto,
      prod.des AS descripcionProducto,
      prod.code_pz AS codigoPiezas,
      prod.code_pq AS codigoPaquete,
      prod.code_inner AS codigoInner,
      prod.code_master AS codigoMaster,
      prod.code_palet AS codigoTarima,
      prod._pz AS piezasPorUnidad,
      prod._inner AS piezasPorInner,
      prod._pq AS piezasPorPaquete,
      prod._master AS piezasPorCaja,
      prod._palet AS piezasPorTarima
    FROM pedido_surtido p
    LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
    LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod
    LEFT JOIN usuarios us ON p.id_usuario = us.id_usu
    WHERE p.estado = 'S'
      AND prod.des IS NOT NULL
    GROUP BY p.id_pedi
    ORDER BY u.ubi ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getPedidosSurtido,
};

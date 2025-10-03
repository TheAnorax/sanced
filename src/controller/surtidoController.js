const pool = require('../config/database');

const getEnSurtido = async (req, res) => {
  try {
    // Consultar los datos básicos
    const [rows] = await pool.query(`
      SELECT 
      p.id_pedi,
      p.pedido,
      p.estado, 
      p.ubi_bahia, 
      p.codigo_ped,
      p.clave,
      p.cantidad,
      p.cant_surti,
      P.registro_surtido,  
      us.name AS usuario,
      s.des,
      u.pasillo   
      FROM pedido_surtido p 
      LEFT JOIN productos s ON p.codigo_ped = s.codigo_pro 
      LEFT JOIN ubicaciones u ON s.codigo_pro = u.code_prod
      LEFT JOIN usuarios us ON p.id_usuario = us.id_usu 
      WHERE p.ubi_bahia IS NOT NULL 
      AND p.estado = 'S' 
      GROUP BY id_pedi
    `);

    // Agrupar y procesar los pedidos
    const pedidosAgrupados = rows.reduce((acumulador, pedido) => {
      const { pedido: numeroPedido, cantidad, cant_surti, pasillo, usuario } = pedido;

      if (!acumulador[numeroPedido]) {
        acumulador[numeroPedido] = {
          numeroPedido,
          totalProductos: 0,
          totalSurtido: 0,
          productos: [],
          pasilloProductos: {},
          usuario: usuario
        };
      }

      acumulador[numeroPedido].totalProductos += cantidad;
      acumulador[numeroPedido].totalSurtido += cant_surti;
      acumulador[numeroPedido].productos.push(pedido);

      acumulador[numeroPedido].pasilloProductos[pasillo] = {
        cantidadTotal: (acumulador[numeroPedido].pasilloProductos[pasillo]?.cantidadTotal || 0) + cantidad,
        cantidadSurtida: (acumulador[numeroPedido].pasilloProductos[pasillo]?.cantidadSurtida || 0) + cant_surti
      };

      return acumulador;
    }, {});

    // Convertir en un array y filtrar aquellos que no están completos
    const pedidosActualizados = Object.values(pedidosAgrupados).filter(pedido => {
      const productosCompletos = pedido.productos.every(producto => producto.estado === 'B');
      return !productosCompletos;
    });

    // Ordenar primero los pedidos sin usuario, y luego por `registro_surtido`
    const pedidosOrdenados = pedidosActualizados.sort((a, b) => {
      // Comparar si tienen usuario
      if (!a.usuario && b.usuario) return -1;
      if (a.usuario && !b.usuario) return 1;

      // Si ambos tienen o no tienen usuario, ordenar por `registro_surtido`
      return new Date(a.productos[0].registro_surtido) - new Date(b.productos[0].registro_surtido);
    });

    res.json(pedidosOrdenados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

module.exports = { getEnSurtido };

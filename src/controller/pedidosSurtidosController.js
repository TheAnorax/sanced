const pool = require('../config/database');

const getSurtidos = async (req, res) => {
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
  WHERE p.estado = "S" OR  p.estado ="B"
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

const updatePedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { items } = req.body;

    const updateQueries = items.map(item => {
      return pool.query(
        'UPDATE pedido_surtido SET cant_surti = ?, cant_no_env = ?, estado = ?, inicio_surtido = NOW(), fin_surtido = NOW() WHERE id_pedi = ?',
        [item.cant_surti, item.cant_no_env, item.estado, item.id_pedi]
      );
    });

    await Promise.all(updateQueries);

    res.status(200).json({ message: 'Pedido actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el pedido', error: error.message });
  }
};



const updateBahias = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { ubi_bahia } = req.body;

    console.log("Datos recibidos en el servidor:", { pedidoId, ubi_bahia });

    // Verificar si ubi_bahia está definido
    if (!ubi_bahia) {
      return res.status(400).json({ message: 'El campo ubi_bahia es obligatorio' });
    }

    // Obtener las bahías actuales del pedido
    const [currentBahiasRows] = await pool.query(
      'SELECT ubi_bahia FROM pedido_surtido WHERE pedido = ?',
      [pedidoId]
    );

    // Si no hay filas, significa que no se encontró el pedido
    if (currentBahiasRows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const currentBahias = currentBahiasRows[0].ubi_bahia ? currentBahiasRows[0].ubi_bahia.split(', ') : [];

    // Combinar las bahías actuales con las nuevas
    const newBahias = ubi_bahia.split(', ');
    const combinedBahias = [...new Set([...currentBahias, ...newBahias])].join(', ');

    console.log("datosBahias:", combinedBahias, pedidoId);
    console.log("DatosBahiaBahia", pedidoId, newBahias);

    // Actualizar las bahías en la base de datos `pedido_surtido`
    await pool.query(
      'UPDATE pedido_surtido SET ubi_bahia = ? WHERE pedido = ?',
      [combinedBahias, pedidoId]
    );

    const estadoB = "1";

    // Actualizar las bahías en la tabla `bahias`
    // Dividir la actualización en partes manejables
    for (const bahia of newBahias) {
      console.log("Actualizando bahía:", bahia); // Agregar un log para cada bahía
      await pool.query(
        'UPDATE bahias SET estado = ?, id_pdi = ? WHERE bahia = ?',
        [estadoB, pedidoId, bahia]
      );
    }

    res.status(200).json({ message: 'Bahías actualizadas correctamente' });
  } catch (error) {
    console.error("Error al actualizar las bahías:", error); // Log the error
    res.status(500).json({ message: 'Error al actualizar las bahías', error: error.message });
  }
};

module.exports = { getSurtidos, updatePedido, updateBahias };

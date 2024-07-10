const pool = require('../config/database');

const getPedidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.pedido, p.tipo, p.codigo_ped, p.clave, p.cantidad, p.um, p.registro, p.estado, 
             prod.des, u.pasillo, prod._pz, u.ubi
      FROM pedi p 
      LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod 
      LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro AND prod.des IS NOT NULL 
      WHERE p.estado IS NULL 
      GROUP BY p.id_pedi
    `);

    const groupedPedidos = rows.reduce((acc, pedido) => {
      if (!acc[pedido.pedido]) {
        acc[pedido.pedido] = {
          pedido: pedido.pedido,
          tipo: pedido.tipo,
          registro: pedido.registro,
          items: [],
        };
      }
      acc[pedido.pedido].items.push({
        clave: pedido.clave,
        codigo_ped: pedido.codigo_ped,
        des: pedido.des,
        cantidad: pedido.cantidad,
        pasillo: pedido.pasillo,
        ubi: pedido.ubi,
        um: pedido.um,
      });
      return acc;
    }, {});

    res.json(Object.values(groupedPedidos));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

const getBahias = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM bahias WHERE id_pdi IS NULL`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las bahías', error: error.message });
  }
};

const savePedidoSurtido = async (req, res) => {
  const { pedido, estado, bahias, items, usuarioId } = req.body;

  if (!pedido || !estado || !bahias || !items) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar si el pedido ya existe en la tabla pedido_surtido
    const [existingPedido] = await connection.query('SELECT * FROM pedido_surtido WHERE pedido = ?', [pedido]);

    if (existingPedido.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_surtido' });
    }

    const insertPedidoSurtidoQuery = `
      INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave, id_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Lista de códigos que deben tener la UM como "ATADO"
    const codigosPedATADO = [3446, 3496, 3494, 3492, 3450, 3493, 3447, 3449, 3495, 3497, 3500, 3498, 3448, 3451, 3499];

    for (const item of items) {
      if (item.codigo_ped !== 0) { // Filtro para no insertar productos con codigo_ped igual a 0
        const um = codigosPedATADO.includes(item.codigo_ped) ? 'ATADO' : item.um;
        await connection.query(insertPedidoSurtidoQuery, [
          pedido, item.tipo, item.codigo_ped, item.cantidad, item.registro, bahias.join(','), estado, um, item.clave, usuarioId || null
        ]);
      }
    }
    console.log(`Pedido ${pedido} insertado en la tabla pedido_surtido.`);

    const estado_B = 1;

    const ubicacionesAExcluir = ['Pasillo-1', 'Pasillo-2', 'Pasillo-3', 'Pasillo-4', 'Pasillo-5', 'Pasillo-6', 'Pasillo-7', 'Pasillo-8'];
    const ubicacionesFiltradas = bahias.filter(bahia => !ubicacionesAExcluir.includes(bahia));

    if (ubicacionesFiltradas.length > 0) {
      const updateBahiasQuery = 'UPDATE bahias SET estado = ?, id_pdi = ? WHERE bahia IN (?)';
      await connection.query(updateBahiasQuery, [estado_B, pedido, ubicacionesFiltradas.join(',')]);
    }

    const deletePedidoQuery = 'DELETE FROM pedi WHERE pedido = ?';
    await connection.query(deletePedidoQuery, [pedido]);
    console.log(`Pedido ${pedido} eliminado de la tabla pedi.`);

    await connection.commit();
    res.json({ message: 'Pedido surtido guardado correctamente y eliminado de la tabla pedi', pedido });
  } catch (error) {
    await connection.rollback();
    console.error(`Error al guardar el pedido surtido: ${error.message}`);
    res.status(500).json({ message: 'Error al guardar el pedido surtido', error: error.message });
  } finally {
    connection.release();
  }
};

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM usuarios`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener Usuarios', error: error.message });
  }
};

module.exports = { getPedidos, getBahias, savePedidoSurtido, getUsuarios };

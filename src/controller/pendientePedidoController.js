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
    const [rows] = await pool.query(`SELECT * FROM bahias b WHERE id_pdi IS NULL`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las bahías', error: error.message });
  }
};

const savePedidoSurtido = async (req, res) => {
  const { pedido, estado, bahias, items } = req.body;

  if (!pedido || !estado || !bahias || !items) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const insertPedidoSurtidoQuery = `
      INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connection.query(insertPedidoSurtidoQuery, [
        pedido, item.tipo, item.codigo_ped, item.cantidad, item.registro, bahias.join(','), estado, item.um, item.clave
      ]);
    }

    const estado_B = 1;

    // Filtra las bahías que no deben ser actualizadas
    
    const ubicacionesAExcluir = ['Pasillo-1', 'Pasillo-2', 'Pasillo-3', 'Pasillo-4', 'Pasillo-5', 'Pasillo-6', 'Pasillo-7', 'Pasillo-8'];
  const ubicacionesFiltradas = bahias.filter(bahias => !ubicacionesAExcluir.includes(bahias));

    if (ubicacionesFiltradas.length > 0) {
      const updateBahiasQuery = 'UPDATE bahias SET estado = ?, id_pdi = ? WHERE bahia IN (?)';
      await connection.query(updateBahiasQuery, [estado_B, pedido, ubicacionesFiltradas.join(',')]);
    }

    const deletePedidoQuery = 'DELETE FROM pedi WHERE pedido = ?';
    await connection.query(deletePedidoQuery, [pedido]);

    await connection.commit();
    res.json({ message: 'Pedido surtido guardado correctamente y eliminado de la tabla pedi' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error al guardar el pedido surtido', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = { getPedidos, getBahias, savePedidoSurtido };

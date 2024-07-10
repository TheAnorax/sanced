const pool = require('../config/database');

const getEnSurtido = async (req, res) => {
  try {
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
    us.name AS usuario,
    s.des,
    u.pasillo 
    FROM pedido_surtido p 
    LEFT JOIN productos s ON p.codigo_ped = s.codigo_pro 
    LEFT JOIN ubicaciones u ON s.codigo_pro = u.code_prod
    LEFT JOIN usuarios us ON p.id_usuario = us.id_usu 
    WHERE p.ubi_bahia IS NOT NULL 
    AND p.estado = 'S' 
    GROUP BY id_pedi`);


    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

module.exports = { getEnSurtido };


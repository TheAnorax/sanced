const pool = require('../config/database'); // Importar conexión a la base de datos

// Controlador para obtener el historial de movimientos
const getHistorial = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
	h.ubi_origen, 
	h.ubi_destino, 
	h.code_prod, 
	h.cant_stock, 
	h.fecha_movimiento,
	us.name 
    FROM historial_movimientos h      
	LEFT JOIN usuarios us ON h.usuario = us.id_usu
      ORDER BY h.fecha_movimiento DESC
    `);

    // Modificar el valor de code_prod si es igual a '9999'
    const modifiedRows = rows.map(row => {
      if (row.ubi_origen === '9999') {
        row.ubi_origen = 'RECIBO';
      }
      return row;
    });

    res.status(200).json(modifiedRows);
  } catch (error) {
    console.error('Error al obtener el historial de movimientos:', error.message);
    res.status(500).json({ error: 'Error al obtener el historial de movimientos' });
  }
};

module.exports = { getHistorial };

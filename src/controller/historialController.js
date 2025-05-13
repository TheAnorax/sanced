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

const almacenamiento = async (req, res) => {
  try {
    const [rows] = await pool.query(`
     SELECT 
	id_ubi,
	ubi,
	code_prod,
	cant_stock,
	almacen,
	pasillo,
	lote,
	ingreso
	FROM ubi_alma
	
    `);

    // Modificar el valor de code_prod si es igual a '9999'
    const modifiedRows = rows;

    res.status(200).json(modifiedRows);
  } catch (error) {
    console.error('Error al obtener el historial de movimientos:', error.message);
    res.status(500).json({ error: 'Error al obtener el historial de movimientos' });
  }
};


const getHistorialPorFecha = async (req, res) => {
  try {
    const fecha = req.query.date || new Date().toISOString().split('T')[0]; // Usar query param

    const [rows] = await pool.query(
      `
      WITH turnos AS (
          SELECT  
              h.ubi_origen, 
              h.ubi_destino, 
              h.code_prod, 
              h.cant_stock, 
              h.fecha_movimiento,
              us.name AS usuario,
              DATE(h.fecha_movimiento) AS fecha,
              CASE 
                  WHEN TIME(h.fecha_movimiento) >= '21:30:00' THEN 'Turno 3'
                  WHEN TIME(h.fecha_movimiento) >= '14:00:00' THEN 'Turno 2'
                  WHEN TIME(h.fecha_movimiento) >= '06:00:00' THEN 'Turno 1'
                  ELSE 'Turno 3'
              END AS turno
          FROM historial_movimientos h
          LEFT JOIN usuarios us ON h.usuario = us.id_usu
      )
      SELECT 
          fecha, 
          turno, 
          usuario,
          COUNT(*) AS total_movimientos
      FROM turnos
      WHERE fecha = ?
      GROUP BY fecha, turno, usuario
      ORDER BY fecha DESC, FIELD(turno, 'Turno 3', 'Turno 1', 'Turno 2');
      `,
      [fecha]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener el historial de movimientos:', error.message);
    res.status(500).json({ error: 'Error al obtener el historial de movimientos' });
  }
};



module.exports = { getHistorial, almacenamiento, getHistorialPorFecha};

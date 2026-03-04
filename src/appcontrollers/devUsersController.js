const pool = require('../config/database'); // ajusta si tu conexión está en otra ruta

const validarDevUser = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        error: 'Correo es requerido'
      });
    }

    const [rows] = await pool.query(
      'SELECT id_dev, nombre_completo, puesto, activo FROM desarrolladores WHERE correo = ?',
      [correo]
    );

    if (rows.length === 0) {
      return res.json({
        activo: false
      });
    }

    const dev = rows[0];

    if (dev.activo === 1) {
      return res.json({
        activo: true,
        rol: dev.puesto || 'Desarrollador',
        nombre: dev.nombre_completo
      });
    } else {
      return res.json({
        activo: false
      });
    }

  } catch (error) {
    console.error('Error validarDevUser:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  validarDevUser
};
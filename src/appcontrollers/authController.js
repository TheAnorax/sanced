const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para el inicio de sesión
const login = async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const query = "SELECT * FROM usuarios WHERE email = ? AND password = ? LIMIT 1";

  try {
    const [results] = await pool.query(query, [username, password]);

    if (results.length === 0) {
      return res.status(401).send("Credenciales incorrectas");
    }

    const userData = {
      name: results[0].name,
      role: results[0].role,
      id_usu: results[0].id_usu,
    };
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports = { login };

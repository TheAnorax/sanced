const pool = require('../config/database');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM usuarios;`);

    // Mapeo para cambiar roles de "P1" a "Pasillo 1", etc.
    const roleMapping = {
      P1: 'Pasillo 1',
      P2: 'Pasillo 2',
      P3: 'Pasillo 3',
      P4: 'Pasillo 4',
      P5: 'Pasillo 5',
      P6: 'Pasillo 6',
      P7: 'Pasillo 7',
      P8: 'Pasillo 8',
      P9: 'Pasillo 9',
      P10: 'Pasillo 10',
      P11: 'Pasillo 11',
      P12: 'Pasillo 12',
      P13: 'Pasillo 13',
    };

    // Filtrar y agrupar usuarios por turno
    const usuariosPorTurno = rows.reduce((acc, usuario) => {
      const turno = usuario.turno || 'Sin turno';

      if (!acc[turno]) {
        acc[turno] = {
          turno,
          usuarios: [],
        };
      }

      // Obtener el nombre del role basado en el mapeo
      const role = roleMapping[usuario.role] || usuario.role;

      acc[turno].usuarios.push({
        id_usu: usuario.id_usu,
        name: usuario.name,
        role: role, // Role mapeado
        turno: usuario.turno, 
        email: usuario.email,
        password: usuario.password,
        unidad: usuario.unidad,
      });

      return acc;
    }, {});

    // Convertir el resultado a un array para facilitar su manejo en el frontend
    const resultadoFormateado = Object.values(usuariosPorTurno);

    // Ordenar los usuarios dentro de cada turno por el role (Pasillo 1, Pasillo 2, etc.)
    resultadoFormateado.forEach((grupo) => {
      grupo.usuarios.sort((a, b) => {
        const numA = parseInt(a.role.replace('Pasillo ', ''), 10);
        const numB = parseInt(b.role.replace('Pasillo ', ''), 10);
        return numA - numB;
      });
    });

    res.json(resultadoFormateado);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

const getAccesosUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT a.id_acceso, a.id_seccion, a.id_permiso, s.name AS seccion, p.name AS permiso
      FROM accesos a
      JOIN secciones s ON a.id_seccion = s.id_seccion
      JOIN permisos p ON a.id_permiso = p.id_permiso
      WHERE a.id_usu = ?;
    `, [id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los accesos del usuario', error: error.message });
  }
};

const updateAccesosUsuario = async (req, res) => {
  const { id } = req.params;
  const { secciones } = req.body; // Array con { id_seccion, id_permiso }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Eliminar accesos existentes
    await connection.query("DELETE FROM accesos WHERE id_usu = ?", [id]);

    // Insertar los nuevos accesos
    for (let seccion of secciones) {
      await connection.query(
        "INSERT INTO accesos (id_usu, id_seccion, id_permiso) VALUES (?, ?, ?)",
        [id, seccion.id_seccion, seccion.id_permiso]
      );
    }

    await connection.commit();
    res.status(200).send("Accesos actualizados correctamente");
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error al actualizar los accesos del usuario', error: error.message });
  } finally {
    connection.release();
  }
};

const getSecciones = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM secciones;");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las secciones', error: error.message });
  }
};


module.exports = { getUsuarios, getAccesosUsuario, updateAccesosUsuario, getSecciones  };

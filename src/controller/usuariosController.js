const pool = require('../config/database');
const bcrypt = require('bcrypt');


const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM usuarios WHERE estado = 1;`);

    if (!rows.length) {
      return res.status(404).json({ message: "No se encontraron usuarios" });
    }

    const roleMapping = {
      P1: "Pasillo 1",
      P2: "Pasillo 2",
      P3: "Pasillo 3",
      P4: "Pasillo 4",
      P5: "Pasillo 5",
      P6: "Pasillo 6",
      P7: "Pasillo 7",
      P8: "Pasillo 8",
      P9: "Pasillo 9",
      P10: "Pasillo 10",
      P11: "Pasillo 11",
      P12: "Pasillo 12",
      P13: "Pasillo 13",
      P14: "Pasillo 14",
      P15: "Pasillo 15",
      P16: "Pasillo 16",
      P17: "Pasillo 17",
      P18: "Pasillo 18",
      P19: "Pasillo 19",
      P20: "Pasillo 20",
    };

    const usuariosPorTurno = rows.reduce((acc, usuario) => {
      const turno = usuario.turno || "Sin turno";

      if (!acc[turno]) {
        acc[turno] = {
          turno,
          usuarios: [],
        };
      }

      const role = roleMapping[usuario.role] || usuario.role || "Sin rol";

      acc[turno].usuarios.push({
        id_usu: usuario.id_usu,
        name: usuario.name,
        role: role,
        turno: usuario.turno,
        email: usuario.email,
        password: usuario.password,
        unidad: usuario.unidad,
      });

      return acc;
    }, {});

    const resultadoFormateado = Object.values(usuariosPorTurno);

    resultadoFormateado.forEach((grupo) => {
      grupo.usuarios.sort((a, b) => {
        // Validar que role no sea null o undefined antes de usar replace()
        const roleA = a.role || "";
        const roleB = b.role || "";

        const numA = parseInt(roleA.replace("Pasillo ", ""), 10) || 0;
        const numB = parseInt(roleB.replace("Pasillo ", ""), 10) || 0;

        return numA - numB;
      });
    });

    res.status(200).json(resultadoFormateado);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error); // Log para depuración
    res.status(500).json({
      message: "Error al obtener los usuarios",
      error: error.message,
    });
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

const createUsuario = async (req, res) => {
  const { email, password, unidad, name, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, password, unidad, name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, unidad, name, role]
    );
    res.status(201).json({ message: 'Usuario creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { email, name, unidad, role } = req.body;

  try {
    await pool.query(
      'UPDATE usuarios SET email = ?, name = ?, unidad = ?, role = ? WHERE id_usu = ?',
      [email, name, unidad, role, id]
    );
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM usuarios WHERE id_usu = ?', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};


// Middleware para verificar permisos
const checkAccess = async (req, res, next) => {
  const userId = req.user.id; // Supón que el usuario ya está autenticado
  const userRole = req.user.role; // Obtén el rol del usuario
  const requestedRoute = req.originalUrl;

  // Verifica si el usuario tiene acceso
  const [access] = await pool.query(
    "SELECT COUNT(*) as count FROM roles_rutas WHERE role = ? AND ruta = ?",
    [userRole, requestedRoute]
  );

  if (access.count > 0) {
    return next(); // Usuario autorizado
  }

  return res.status(403).json({ error: "No tienes permiso para acceder a esta ruta" });
};



// Obtener roles con sus permisos
const getRolesWithAccess = async (req, res) => {
  try {
    const [roles] = await pool.query(`
      SELECT r.id_role, r.name AS role, s.name AS section, a.permiso
      FROM roles r
      LEFT JOIN accesos a ON r.id_role = a.id_role
      LEFT JOIN secciones s ON a.id_seccion = s.id_seccion
    `);

    const result = roles.reduce((acc, row) => {
      if (!acc[row.role]) {
        acc[row.role] = [];
      }
      if (row.section) {
        acc[row.role].push({ section: row.section, permiso: row.permiso });
      }
      return acc;
    }, {});

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles y permisos', error: error.message });
  }
};

// Actualizar accesos de un rol
const updateRoleAccess = async (req, res) => {
  const { id_role } = req.params;
  const { accesos } = req.body; // Array con { id_seccion, permiso }

  try {
    await pool.query('DELETE FROM accesos WHERE id_role = ?', [id_role]);
    for (const acceso of accesos) {
      await pool.query(
        'INSERT INTO accesos (id_role, id_seccion, permiso) VALUES (?, ?, ?)',
        [id_role, acceso.id_seccion, acceso.permiso]
      );
    }

    res.json({ message: 'Accesos actualizados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar accesos', error: error.message });
  }
};





module.exports = { getUsuarios, getAccesosUsuario, updateAccesosUsuario, getSecciones, createUsuario, updateUsuario, deleteUsuario, checkAccess, getRolesWithAccess, updateRoleAccess };
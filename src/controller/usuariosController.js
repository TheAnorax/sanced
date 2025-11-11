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
  P21: "Pasillo 21",
  P22: "Pasillo 22",
  P23: "Pasillo 23",
  P24: "Pasillo 24",
  P25: "Pasillo 25",
  P26: "Pasillo 26",
  P27: "Pasillo 27",
  P28: "Pasillo 28",
  P29: "Pasillo 29",
  P30: "Pasillo 30",
  P31: "Pasillo 31",
  P32: "Pasillo 32",
  P33: "Pasillo 33",
  P34: "Pasillo 34",
  P35: "Pasillo 35",
  P36: "Pasillo 36",
  P37: "Pasillo 37",
  P38: "Pasillo 38",
  P39: "Pasillo 39",
  P40: "Pasillo 40",
  P41: "Pasillo 41",
  P42: "Pasillo 42",
  P43: "Pasillo 43",
  P44: "Pasillo 44",
  P45: "Pasillo 45",
  P46: "Pasillo 46",
  P47: "Pasillo 47",
  P48: "Pasillo 48",
  P49: "Pasillo 49",
  P50: "Pasillo 50",
  P51: "Pasillo 51",
  P52: "Pasillo 52",
  P53: "Pasillo 53",
  P54: "Pasillo 54",
  P55: "Pasillo 55",
  P56: "Pasillo 56",
  P57: "Pasillo 57",
  P58: "Pasillo 58",
  P59: "Pasillo 59",
  P60: "Pasillo 60",
  P61: "Pasillo 61",
  P62: "Pasillo 62",
  P63: "Pasillo 63",
  P64: "Pasillo 64",
  P65: "Pasillo 65",
  P66: "Pasillo 66",
  P67: "Pasillo 67",
  P68: "Pasillo 68",
  P69: "Pasillo 69",
  P70: "Pasillo 70",
  P71: "Pasillo 71",
  P72: "Pasillo 72",
  P73: "Pasillo 73",
  P74: "Pasillo 74",
  P75: "Pasillo 75",
  P76: "Pasillo 76",
  P77: "Pasillo 77",
  P78: "Pasillo 78",
  P79: "Pasillo 79",
  P80: "Pasillo 80",
  P81: "Pasillo 81",
  P82: "Pasillo 82",
  P83: "Pasillo 83",
  P84: "Pasillo 84",
  P85: "Pasillo 85",
  P86: "Pasillo 86",
  P87: "Pasillo 87",
  P88: "Pasillo 88",
  P89: "Pasillo 89",
  P90: "Pasillo 90",
  P91: "Pasillo 91",
  P92: "Pasillo 92",
  P93: "Pasillo 93",
  P94: "Pasillo 94",
  P95: "Pasillo 95",
  P96: "Pasillo 96",
  P97: "Pasillo 97",
  P98: "Pasillo 98",
  P99: "Pasillo 99",
  P100: "Pasillo 100",
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
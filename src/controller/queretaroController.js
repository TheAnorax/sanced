const pool = require('../config/database');

// Obtener proyectos con filtros dinámicos
const getProyectoQueretaro = async (req, res) => {
  const { zona, ruta, dia_visita } = req.query;
  console.log("Parámetros recibidos - Zona:", zona, "Ruta:", ruta, "Día de visita:", dia_visita);

  try {
    let query = 'SELECT * FROM savawms.proyectoqueretaro WHERE 1=1';
    let params = [];

    if (zona) {
      query += ' AND zona = ?';
      params.push(zona);
    }

    if (ruta) {
      query += ' AND ruta = ?';
      params.push(ruta);
    }

    if (dia_visita) {
      query += ' AND dia_visita = ?';
      params.push(dia_visita);
    }

    console.log("Consulta generada:", query, "Parámetros:", params);

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los datos:", error.message);
    res.status(500).json({ message: 'Error al obtener los datos', error: error.message });
  }
};



// Obtener datos filtrados por categoría, portafolio y segmento
const getCategoryData = async (req, res) => {
  const { giro, portafolio, segmento } = req.params;
  console.log("giro:", giro, "portafolio:", portafolio, "segmento:", segmento);

  try {
    const tableName = mapGiroToTable(giro);
    console.log("Consultando tabla:", tableName);

    let segmentColumn = "";
    if (segmento === "ORO") {
      segmentColumn = "ORO";
    } else if (segmento === "PLATA") {
      segmentColumn = "PLATA";
    } else if (segmento === "BRONCE") {
      segmentColumn = "BRONCE";
    } else {
      return res.status(400).json({ message: "Segmento no válido" });
    }

    const query = `
      SELECT Codigo, Descripcion, Categoria, ${segmentColumn}
      FROM savawms.${tableName}
      WHERE Categoria = ?
      AND ${segmentColumn} IS NOT NULL
    `;

    const [rows] = await pool.query(query, [portafolio]);
    console.log("Datos obtenidos de la base de datos:", rows);

    res.json({ data: rows });
  } catch (error) {
    console.error("Error al obtener los datos de la tabla:", error.message);
    res.status(500).json({ message: `Error al obtener los datos de ${giro}`, error: error.message });
  }
};

// Mapeo de giros a tablas específicas
const mapGiroToTable = (giro) => {
  switch (giro.toLowerCase()) {
    case 'ferretería': return 'Ferreteria';
    case 'papelería': return 'Papelería';
    case 'mecánica': return 'Mecanica';
    case 'herrería': return 'Herreria';
    case 'cerrajería': return 'Cerrajería';
    case 'vidrio y aluminio': return 'Vidrio_y_Aluminio';
    case 'plomería': return 'Plomería';
    case 'construcción': return 'Construcción';
    case 'pintura': return 'Pintura';
    case 'eléctricoiluminación': return 'EléctricoIluminación';
    case 'construcción ligera': return 'ConstrucciónLigera';
    default: return 'Ferreteria'; // Tabla por defecto
  }
};

module.exports = { getProyectoQueretaro, getCategoryData };
const { csCZ } = require('@mui/x-date-pickers/locales');
const pool = require('../config/database');



// Obtener proyectos con filtros dinámicos
const getProyectoQueretaro = async (req, res) => {
  const { zona, ruta, dia_visita, status } = req.query;

  try {
    let query = `
      SELECT DISTINCT p.*, e.ID AS exhibidor_id, e.Descripción, e.Medidas, e.Material
      FROM savawms.proyectoqueretaro p
      LEFT JOIN savawms.exibidores e 
      ON FIND_IN_SET(e.id, p.exibido) > 0
      WHERE e.id IS NOT NULL`;

    let params = [];

    if (zona) {
      query += ' AND p.zona = ?';
      params.push(zona);
    }

    if (ruta) {
      query += ' AND p.ruta = ?';
      params.push(ruta);
    }

    if (dia_visita) {
      query += ' AND p.dia_visita = ?';
      params.push(dia_visita);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.id';

    const [rows] = await pool.query(query, params);

    const proyectos = {};
    rows.forEach(row => {
      if (!proyectos[row.id]) {
        proyectos[row.id] = { ...row, exhibidores: [] };
      }
      if (row.exhibidor_id) {
        // Evitar duplicados en exhibidores
        const exists = proyectos[row.id].exhibidores.some(ex => ex.id === row.exhibidor_id);
        if (!exists) {
          proyectos[row.id].exhibidores.push({
            id: row.exhibidor_id,
            imagen: `/imagenes/${row.exhibidor_id}.png`, // La imagen ahora apunta a public/imagenes
            descripcion: row.Descripción,
            medidas: row.Medidas,
            material: row.Material
          });
        }
      }
    });

    res.json(Object.values(proyectos));
  } catch (error) {
    console.error("Error al obtener los datos:", error.message);
    res.status(500).json({ message: 'Error al obtener los datos', error: error.message });
  }
};



// Obtener datos filtrados por categoría, portafolio y segmento
const getCategoryData = async (req, res) => {
  const { giro, portafolio, segmento } = req.params;

  try {
    const tableName = mapGiroToTable(giro);

    // Determinar la columna del segmento
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

    // Primera consulta: Obtener productos base
    const query = `
          SELECT Codigo, Descripcion, Categoria, ${segmentColumn} AS SegmentoPrecio
          FROM savawms.${tableName}
          WHERE Categoria = ?
          AND ${segmentColumn} IS NOT NULL
      `;

    const [categoryRows] = await pool.query(query, [portafolio]);

    // Si no hay productos base, retornar los resultados vacíos
    if (categoryRows.length === 0) {
      return res.json({ data: categoryRows });
    }

    // Extraer los códigos para la segunda consulta
    const codigos = categoryRows.map(row => row.Codigo);

    // Segunda consulta: Obtener detalles de precios incluyendo `Precio_T`
    const queryPrices = `
          SELECT Codigo, \`Inner\`, \`Master\`, \`TP\`, ${segmento} AS Precio, Precio_T
          FROM savawms.precios
          WHERE Codigo IN (?)
      `;

    const [priceRows] = await pool.query(queryPrices, [codigos]);

    const normalizeCode = (code) => code.toString().trim();

    // Combinar resultados
    const combinedData = categoryRows.map(categoryItem => {
      const priceItem = priceRows.find(price => normalizeCode(price.Codigo) === normalizeCode(categoryItem.Codigo));
      return {
        ...categoryItem,
        Inner: priceItem ? priceItem.Inner : 'N/A',
        Master: priceItem ? priceItem.Master : 'N/A',
        TP: priceItem ? priceItem.TP : 'N/A',
        Precio: priceItem ? priceItem.Precio : 'N/A',
        Precio_T: priceItem && priceItem.Precio_T !== '#N/D' ? priceItem.Precio_T : '0'  // Reemplaza #N/D por 0
      };
    });

    // Enviar los datos combinados al cliente
    res.json({ data: combinedData });
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

// Backend: Controlador para filtrar por zona y ruta
const getFilteredProyectoQueretaro = async (req, res) => {
  const { zona, rutas } = req.query;  // Los parámetros se pasan como query params
  const rutaArray = rutas ? rutas.split(',') : [];  // Convertir la cadena de rutas en un array

  if (!zona || !rutaArray.length) {
    return res.status(400).json({ message: "Faltan parámetros 'zona' o 'rutas'" });
  }

  try {
    const query = `
      SELECT * FROM proyectoqueretaro 
      WHERE zona = ?
      AND ruta IN ('1', '2', '3', '4', '5')
      ORDER BY ruta;
    `;

    const [rows] = await pool.query(query, [zona, rutaArray]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron datos para los parámetros especificados." });
    }

    res.json(rows);  // Devolver los resultados filtrados
  } catch (error) {
    console.error("Error al obtener los datos filtrados:", error.message);
    res.status(500).json({ message: 'Error al obtener los datos filtrados', error: error.message });
  }
};



module.exports = { getProyectoQueretaro, getCategoryData, getFilteredProyectoQueretaro };
const { csCZ } = require("@mui/x-date-pickers/locales");
const pool = require("../config/database");

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
      query += " AND p.zona = ?";
      params.push(zona);
    }

    if (ruta) {
      query += " AND p.ruta = ?";
      params.push(ruta);
    }

    if (dia_visita) {
      query += " AND p.dia_visita = ?";
      params.push(dia_visita);
    }

    if (status) {
      query += " AND p.status = ?";
      params.push(status);
    }

    query += " ORDER BY p.id";

    const [rows] = await pool.query(query, params);

    const proyectos = {};
    rows.forEach((row) => {
      if (!proyectos[row.id]) {
        proyectos[row.id] = { ...row, exhibidores: [] };
      }
      if (row.exhibidor_id) {
        // Evitar duplicados en exhibidores
        const exists = proyectos[row.id].exhibidores.some(
          (ex) => ex.id === row.exhibidor_id
        );
        if (!exists) {
          proyectos[row.id].exhibidores.push({
            id: row.exhibidor_id,
            imagen: `/imagenes/${row.exhibidor_id}.png`, // La imagen ahora apunta a public/imagenes
            descripcion: row.Descripción,
            medidas: row.Medidas,
            material: row.Material,
          });
        }
      }
    });

    res.json(Object.values(proyectos));
  } catch (error) {
    console.error("Error al obtener los datos:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener los datos", error: error.message });
  }
};



// Obtener datos filtrados por categoría, portafolio y segmento
const getCategoryData = async (req, res) => {
  let { giro, portafolio, segmento } = req.params;

  try {
    // 🔥 Normalizar textos
    const normalizedGiro = normalizeText(giro);
    const normalizedPortafolio = normalizeText(portafolio);

    // 🔹 Validación especial para Tornillería (en giro o portafolio)
    if (normalizedGiro === "tornilleria" || normalizedPortafolio === "tornilleria") {
      // console.log("🔧 Tornillería detectada (en giro o portafolio). Usando tabla 'mecanica'.");
      giro = "mecanica";
    }

    const tableName = mapGiroToTable(giro); // Determinar tabla según giro
    // console.log(`🔍 Giro recibido: "${giro}" → Tabla mapeada: "${tableName}"`);

    const segmentColumn = segmento.trim().toUpperCase();

    if (!["ORO", "PLATA", "BRONCE"].includes(segmentColumn)) {
      console.warn(`⚠️ Segmento inválido recibido: "${segmentColumn}"`);
      return res.status(400).json({ message: "Segmento no válido" });
    }

    // 🔹 1. Buscar coincidencia exacta (giro + portafolio)
   //  console.log(`📌 Buscando en tabla: ${tableName} | Portafolio: "${portafolio}" | Segmento: "${segmentColumn}"`);
    const query = `
      SELECT Codigo, Descripcion, Categoria, ${segmentColumn} AS SegmentoPrecio
      FROM savawms.${tableName}
      WHERE Categoria = ?
      AND TRIM(UPPER(${segmentColumn})) = 'APLICA'
    `;
    const [categoryRows] = await pool.query(query, [portafolio]);

    // 🔸 2. Si no hay coincidencia en portafolio, mostrar toda la tabla filtrada por segmento
    let finalRows = categoryRows;
    if (finalRows.length === 0) {
     //  console.warn(`⚠️ No hubo coincidencia en la categoría "${portafolio}" dentro de "${tableName}". Mostrando toda la tabla filtrada solo por segmento...`);

      const queryAll = `
        SELECT Codigo, Descripcion, Categoria, ${segmentColumn} AS SegmentoPrecio
        FROM savawms.${tableName}
        WHERE TRIM(UPPER(${segmentColumn})) = 'APLICA'
      `;
      const [allRows] = await pool.query(queryAll);
      finalRows = allRows;

      if (finalRows.length > 0) {
        // console.log(`✅ Se cargaron ${finalRows.length} registros de la tabla "${tableName}" filtrados por segmento "${segmentColumn}"`);
      }
    }

    // Si aun así no hay datos, devolver vacío
    if (finalRows.length === 0) {
      // console.warn(`⚠️ No se encontraron datos en la tabla "${tableName}" ni siquiera filtrando solo por segmento.`);
      return res.json({ data: [] });
    }

    // 🔹 3. Obtener precios
    const codigos = finalRows.map((row) => row.Codigo).filter((c) => typeof c === "string" || typeof c === "number");
    if (codigos.length === 0) {
     //  console.warn("⚠️ No hay códigos válidos para consultar precios.");
    }

    const queryPrices = `
      SELECT Codigo, \`Inner\`, \`Master\`, \`TP\`, ${segmentColumn} AS Precio, Precio_T
      FROM savawms.precios
      ${codigos.length > 0 ? `WHERE Codigo IN (${codigos.map(() => "?").join(",")})` : ""}
    `;
    const [priceRows] = codigos.length > 0 ? await pool.query(queryPrices, codigos) : [[]];

    const normalizeCode = (code) => code?.toString().trim();

    const combinedData = finalRows.map((categoryItem) => {
      const priceItem = priceRows.find(
        (price) => normalizeCode(price.Codigo) === normalizeCode(categoryItem.Codigo)
      );

      return {
        ...categoryItem,
        Inner: priceItem ? priceItem.Inner : "N/A",
        Master: priceItem ? priceItem.Master : "N/A",
        TP: priceItem ? priceItem.TP : "N/A",
        Precio: priceItem ? priceItem.Precio : "N/A",
        Precio_T: priceItem && priceItem.Precio_T !== "#N/D" ? priceItem.Precio_T : "0",
      };
    });

   // console.log(`✅ Total de productos combinados con precios: ${combinedData.length}`);
    res.json({ data: combinedData });

  } catch (error) {
    console.error("❌ Error al obtener los datos de la tabla:", error.message);
    res.status(500).json({
      message: `Error al obtener los datos de ${giro}`,
      error: error.message,
    });
  }
};

const normalizeText = (text) => {
  return text
    .normalize("NFD") // Descompone caracteres con acento
    .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
    .toLowerCase()
    .trim();
};

const mapGiroToTable = (giro) => {
  const normalized = normalizeText(giro); // 🔥 Aquí limpiamos el texto

  switch (normalized) {
    case "ferreteria":
      return "ferreteria";
    case "papeleria":
      return "papeleria";
    case "mecanica":
      return "mecanica";
    case "herreria":
      return "herreria";
    case "cerrajeria":
      return "cerrajeria";
    case "vidrio y aluminio":
    case "vidrioyaluminio":
    case "vidrieria":       // ✅ Nuevo alias
    case "vidriería":       // ✅ Con acento también normalizado
      return "vidrio_y_aluminio";
    case "plomeria":
      return "plomeria";
    case "construccion":
      return "construccion";
    case "pintura":
      return "pintura";
    case "electricoiluminacion":
      return "electricoiluminacion";
    case "construccion ligera":
    case "construccionligera":
      return "construccionligera";
    default:
      // console.warn(`⚠️ Giro "${giro}" no encontrado. Usando tabla "ferreteria".`);
      return "ferreteria";
  }
};

//fin del mapeo 





// Backend: Controlador para filtrar por zona y ruta
const getFilteredProyectoQueretaro = async (req, res) => {
  const { zona, rutas } = req.query; // Los parámetros se pasan como query params
  const rutaArray = rutas ? rutas.split(",") : []; // Convertir la cadena de rutas en un array

  if (!zona || !rutaArray.length) {
    return res
      .status(400)
      .json({ message: "Faltan parámetros 'zona' o 'rutas'" });
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
      return res
        .status(404)
        .json({
          message: "No se encontraron datos para los parámetros especificados.",
        });
    }

    res.json(rows); // Devolver los resultados filtrados
  } catch (error) {
    console.error("Error al obtener los datos filtrados:", error.message);
    res
      .status(500)
      .json({
        message: "Error al obtener los datos filtrados",
        error: error.message,
      });
  }
};

const updateOrdenVisita = async (req, res) => {
  const { orden } = req.body;

  if (!Array.isArray(orden)) {
    return res.status(400).json({ message: "Formato de datos incorrecto" });
  }

  try {
    const promises = orden.map((id, index) => {
      return pool.query(
        "UPDATE proyectoqueretaro SET orden_visita = ? WHERE id = ?",
        [index + 1, id] // empezamos desde 1
      );
    });

    await Promise.all(promises);

    res.json({ message: "Orden actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el orden:", error.message);
    res
      .status(500)
      .json({ message: "Error al actualizar el orden", error: error.message });
  }
};

//obtner los datos de los vendedores externos

// 🔸 BRONCE
const getPreciosBronce = async (req, res) => {
  try {
    const query = `
      SELECT Codigo, 
             Descuento_Bronce, 
             Precio_Aksi, 
             AK_vs_ST, 
             Precio_Truper, 
             Tr_vs_ST
      FROM savawms.precios_bronce
    `;

    const [rows] = await pool.query(query);

    const cleanNumber = (val) =>
      parseFloat((val || "").toString().replace(/[^0-9.-]+/g, "")) || 0;

    const result = rows.map((row) => ({
      Codigo: row.Codigo,
      DescuentoBronce: cleanNumber(row.Descuento_Bronce).toFixed(2),
      PrecioAksi: cleanNumber(row.Precio_Aksi).toFixed(2),
      AKvsST: row.AK_vs_ST || "0%",
      PrecioTruper: cleanNumber(row.Precio_Truper).toFixed(2),
      TrvsST: row.Tr_vs_ST || "0%",
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Error al obtener precios BRONCE:", error.message);
    res
      .status(500)
      .json({ message: "Error interno al obtener precios BRONCE" });
  }
};

// 🔸 PLATA
const getPreciosPlata = async (req, res) => {
  try {
    const query = `
      SELECT Codigo, 
             Precio_Aksi, 
             AK_vs_ST, 
             Precio_Truper, 
             Tr_vs_ST
      FROM savawms.precios_plata
    `;

    const [rows] = await pool.query(query);

    const cleanNumber = (val) =>
      parseFloat((val || "").toString().replace(/[^0-9.-]+/g, "")) || 0;

    const result = rows.map((row) => ({
      Codigo: row.Codigo,
      PrecioAksi: cleanNumber(row.Precio_Aksi).toFixed(2),
      AKvsST: row.AK_vs_ST || "0%",
      PrecioTruper: cleanNumber(row.Precio_Truper).toFixed(2),
      TrvsST: row.Tr_vs_ST || "0%",
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Error al obtener precios PLATA:", error.message);
    res.status(500).json({ message: "Error interno al obtener precios PLATA" });
  }
};

// 🔸 ORO
const getPreciosOro = async (req, res) => {
  try {
    const query = `
      SELECT Codigo, 
             Precio_Aksi, 
             AK_vs_ST, 
             Precio_Truper, 
             Tr_vs_ST
      FROM savawms.precios_oro
    `;

    const [rows] = await pool.query(query);

    const cleanNumber = (val) =>
      parseFloat((val || "").toString().replace(/[^0-9.-]+/g, "")) || 0;

    const result = rows.map((row) => ({
      Codigo: row.Codigo,
      PrecioAksi: cleanNumber(row.Precio_Aksi).toFixed(2),
      AKvsST: row.AK_vs_ST || "0%",
      PrecioTruper: cleanNumber(row.Precio_Truper).toFixed(2),
      TrvsST: row.Tr_vs_ST || "0%",
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Error al obtener precios ORO:", error.message);
    res.status(500).json({ message: "Error interno al obtener precios ORO" });
  }
};

module.exports = {
  getProyectoQueretaro,
  getCategoryData,
  getFilteredProyectoQueretaro,
  updateOrdenVisita,
  getPreciosBronce,
  getPreciosPlata,
  getPreciosOro,
};

const pool = require('../config/database'); // Importa la configuración de la base de datos

// Controlador para obtener datos de inventario
const obtenerInventario = async (req, res) => {
  const query = `
    SELECT 
      id_ubi,
      ubi,
      codigo,
      _pz,
      _inner,
      _master,
      _pallet,
      estado,
      responsable,
      pasillo, 
      nivel
    FROM inventory
  `;

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(query);

    // Convertir los valores `null` a `0` o cadena vacía en cada `item`
    const processedResults = results.map(item => {
      Object.keys(item).forEach(key => {
        if (item[key] === null) {
          item[key] = typeof item[key] === 'number' ? 0 : ''; // `0` para números, cadena vacía para strings
        }
      });
      return item;
    });

    // Agrupación por rol (`P{pasillo}S{responsable}`)
    const organizedData = {};

    processedResults.forEach(item => {
      const { pasillo, responsable, nivel } = item;
      const rol = `P${pasillo}S${responsable}`; // Generar rol en formato `P{pasillo}S{responsable}`

      if (!organizedData[rol]) {
        organizedData[rol] = {
          rol,
          pasillo,
          responsable,
          ubicaciones: {
            1: [],
            2: []
          }
        };
      }

      // Añadir la ubicación al nivel correspondiente (1 o 2)
      if (nivel === 1 || nivel === 2) {
        organizedData[rol].ubicaciones[nivel].push(item);
      }
    });

    // Ordenar y estructurar los datos finales
    const finalData = Object.values(organizedData).map(group => {
      // Ordenar nivel 1 ascendente y nivel 2 descendente
      group.ubicaciones[1] = group.ubicaciones[1].sort((a, b) => a.ubi.localeCompare(b.ubi));
      group.ubicaciones[2] = group.ubicaciones[2].sort((a, b) => b.ubi.localeCompare(a.ubi));
      return group;
    });

    res.json(finalData); // Enviar respuesta organizada en grupos por rol
  } catch (error) {
    console.error('Error al obtener los datos de inventory:', error);
    res.status(500).json({ error: 'Error al obtener los datos de inventory' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { obtenerInventario };

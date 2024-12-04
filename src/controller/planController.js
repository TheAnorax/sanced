const pool = require('../config/database');

const getPlan = async (req, res) => {
  try {
    // Obtener todos los registros de la tabla "plan"
    const [planRecords] = await pool.query('SELECT * FROM plan');

    const detailedResults = await Promise.all(
      planRecords.map(async (record) => {
        const noOrden = record.no_orden;

        // Consultar las otras tablas usando "no_orden" (que se mapea a "pedido" en las otras tablas)
        const [resultsPedi] = await pool.query('SELECT * FROM pedi WHERE pedido = ?', [noOrden]);
        const [resultsSurtido] = await pool.query('SELECT * FROM pedido_surtido WHERE pedido = ?', [noOrden]);
        const [resultsEmbarque] = await pool.query('SELECT * FROM pedido_embarque WHERE pedido = ?', [noOrden]);

        // Determinar la fuente del dato
        let source = 'No encontrado';
        if (resultsEmbarque.length > 0) {
          source = 'Embarques/Paqueteria';
        } else if (resultsSurtido.length > 0) {
          source = 'Surtiendo';
        } else if (resultsPedi.length > 0) {
          source = 'Sin Surtir';
        }

        // Combinar la información de la tabla "plan" con la fuente encontrada
        return { ...record, source };
      })
    );

    res.json(detailedResults);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del plan', error: error.message });
  }
};

const importarDatos = async (req, res) => {
  const data = req.body; // Datos del archivo Excel en formato JSON

  if (typeof data !== 'object' || Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron datos válidos.' });
  }

  try {
    const promises = [];

    // Recorrer cada "orden" en el objeto JSON
    for (const no_orden in data) {
      if (data.hasOwnProperty(no_orden)) {
        // Recorrer cada registro dentro de ese "orden"
        data[no_orden].forEach((row) => {
          const { ruta, fecha_ruta, no_orden, fecha_pedido, num_cliente, total } = row;

          // Insertar en la tabla "plan"
          const queryPromise = pool.query(
            'INSERT INTO plan (ruta, fecha_ruta, no_orden, fecha_pedido, num_cliente, total) VALUES (?, ?, ?, ?, ?, ?)',
            [ruta, fecha_ruta, no_orden, fecha_pedido, num_cliente, total]
          );

          promises.push(queryPromise);
        });
      }
    }

    await Promise.all(promises);

    res.json({ message: 'Datos importados correctamente.' });
  } catch (error) {
    console.error('Error al importar datos:', error);
    res.status(500).json({ message: 'Error al importar los datos.', error: error.message });
  }
};
const truncarPlan = async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE plan');
    res.json({ message: 'Tabla truncada correctamente.' });
  } catch (error) {
    console.error('Error al truncar la tabla:', error);
    res.status(500).json({ message: 'Error al truncar la tabla.', error: error.message });
  }
};

module.exports = { getPlan, importarDatos, truncarPlan };

// const pool = require('../config/database');

// // Obtener todos los insumos
// const getInsumosRH = async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM insumosrh');
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener los insumos', error: error.message });
//   }
// };

// // Crear un insumo
// const createInsumo = async (req, res) => {
//     try {
//       console.log('Datos recibidos en createInsumo:', req.body);
  
//       const { Codigo, Descripcion, Cantidad, Talla, Categoria, UM } = req.body;
//       await pool.query('INSERT INTO insumosrh SET ?', { Codigo, Descripcion, Cantidad, Talla, Categoria, UM });
//       res.status(201).json({ message: 'Insumo creado correctamente' });
//     } catch (error) {
//       console.error('Error en createInsumo:', error.message);
//       res.status(500).json({ message: 'Error al crear el insumo', error: error.message });
//     }
//   };
  
  

// // Actualizar un insumo
// const updateInsumo = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { Codigo, Descripcion, Cantidad, Talla, Categoria, UM } = req.body;
//     await pool.query('UPDATE insumosrh SET ? WHERE Codigo = ?', [{ Codigo, Descripcion, Cantidad, Talla, Categoria, UM }, id]);
//     res.status(200).json({ message: 'Insumo actualizado correctamente' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al actualizar el insumo', error: error.message });
//   }
// };

// // Eliminar un insumo
// const deleteInsumo = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query('DELETE FROM insumosrh WHERE Codigo = ?', [id]);
//     res.status(200).json({ message: 'Insumo eliminado correctamente' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al eliminar el insumo', error: error.message });
//   }
// };

// module.exports = {
//   getInsumosRH,
//   createInsumo,
//   updateInsumo,
//   deleteInsumo,
// };




const pool = require('../config/database');


const buscarProducto = async (req, res) => {
  const { codigo } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
         codigo_pro AS codigo,
         des,
         um,
         _pz,
         clave
       FROM productos
       WHERE codigo_pro = ?`,
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    res.status(500).json({ message: "Error al buscar el producto" });
  }
};


const createTraspaso = async (req, res) => {
  try {
    const {
      Codigo,
      Descripcion,
      Clave,
      um,
      _pz,
      Cantidad,
      dia_envio,
      almacen_envio,
      tiempo_llegada_estimado,
    } = req.body;

    // Validar mínimos:
    if (
      Codigo == null ||
      !Descripcion ||
      Cantidad == null ||
      !dia_envio ||
      !tiempo_llegada_estimado
    ) {
      return res.status(400).json({
        message:
          'Faltan campos obligatorios: Codigo, Descripcion, Cantidad, dia_envio, tiempo_llegada_estimado',
      });
    }

    // Insertamos tal cual: MySQL acepta el string ISO en DATETIME
    await pool.query(
      `INSERT INTO mandar_traspaso 
        (Codigo, Descripcion, Clave, um, _pz, Cantidad, dia_envio, almacen_envio, tiempo_llegada_estimado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Codigo,
        Descripcion,
        Clave || null,
        um || null,
        _pz != null ? _pz : null,
        Cantidad,
        dia_envio,               // ya es un ISO string completo
        almacen_envio || null,
        tiempo_llegada_estimado, // ya es un ISO string completo
      ]
    );

    res.status(201).json({ message: 'Registro de traspaso creado correctamente' });
  } catch (error) {
    console.error('Error en createTraspaso:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El Código ya existe. No se puede duplicar.' });
    }
    res.status(500).json({ message: 'Error al crear el registro de traspaso', error: error.message });
  }
};

const Traspasos = async (req, res) => {
  try {
    // Ejecutamos una consulta simple para traer todos los campos de cada fila
    const [rows] = await pool.query('SELECT * FROM mandar_traspaso');
    // Devolvemos el resultado como JSON
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los traspasos:', error.message);
    res.status(500).json({
      message: 'Error al obtener los traspasos',
      error: error.message
    });
  }
};

// controllers/excelController.js
const XLSX = require('xlsx');

const excelToJson = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo Excel.' });
    }

    // Leer el archivo Excel desde el buffer recibido en memoria
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir hoja completa a arreglo de arreglos
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Omitir las primeras 6 filas (cabeceras vacías o basura)
    const rows = allRows.slice(6);

    // La primera fila después del corte es el encabezado real
    const [headers, ...dataRows] = rows;

    // Mapear los datos a objetos usando los headers
    const data = dataRows.map(row =>
      headers.reduce((obj, key, i) => {
        obj[key] = row[i] ?? '';
        return obj;
      }, {})
    );

    res.json({ data, headers });
  } catch (error) {
    console.error('Error procesando el Excel:', error);
    res.status(500).json({ error: 'No se pudo procesar el archivo Excel.' });
  }
};



module.exports = {
  buscarProducto,
  createTraspaso,
  Traspasos,
  excelToJson
};

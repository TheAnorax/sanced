const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Obtener compras
const getCompras = async (req, res) => {
  const { tipo } = req.query;

  try {
    let query = `
      SELECT
        r.id_recibo,
        prod.des,
        prod._master,
        prod._palet,
        r.codigo,
        r.oc,
        r.cant_recibir, 
        r.tipo,
        r.referencia, 
        r.unidad_medida,   
        r.contenedor,
        r.naviera,
        r.pedimento,  
        r.arribo,
        us.name,
        r.estado,
        c.pdf_1,                       
        c.pdf_2,                       
        c.pdf_3,                       
        c.pdf_4,                       
        c.pdf_5,        
        r.cantidad7050,
        r.cantidad7066 
      FROM recibo_compras r
      LEFT JOIN productos prod ON r.codigo = prod.codigo_pro
      LEFT JOIN usuarios us ON r.usuario = us.id_usu
      LEFT JOIN recibo_cedis c ON r.id_recibo = c.id_recibo_compras
      WHERE r.estado = 'C'
    `;

    const queryParams = [];

    // Si se pasa el parámetro 'tipo', agregar la condición al WHERE
    if (tipo) {
      query += " AND r.tipo = ?";
      queryParams.push(tipo);
    }

    // Añadir la condición de fecha solo si `r.arribo` no es NULL
    query += " AND (r.arribo IS NULL OR r.arribo >= CURDATE())";

    // Ejecutar la consulta
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('SQL Error en getCompras:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};



// Actualizar recibo
const updateRecibo = async (req, res) => {
  const { id_recibo } = req.params;
  const { oc, cantidad, recepcion, tipo, referencia, unidad_medida, contenedor, naviera, pedimento } = req.body;

  try {
    console.log('Actualizando recibo:', req.body);
    console.log('Actualizando recibo:', req.params);

    // Verifica si el código ya existe en otro recibo distinto al que estás actualizando
    // const [existingRecibos] = await pool.query('SELECT * FROM recibo_compras WHERE codigo = ? AND id_recibo != ?', [cantidad, id_recibo]);

    const [existingRecibos] = await pool.query('SELECT * FROM recibo_compras WHERE id_recibo = ?', [ id_recibo]);
    
    
    // if (existingRecibos.length > 0) {
    //   console.error('El código ya existe en otro recibo:', existingRecibos);
    //   return res.status(400).json({ message: 'El código ya existe en otro recibo' });
    // }

    console.log('Ejecutando UPDATE con datos:', [oc, cantidad, recepcion, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, id_recibo]);



    await pool.query(
      `
      UPDATE recibo_compras 
      SET oc = ?, cant_recibir = ?, arribo = ?, tipo = ?, referencia = ?, unidad_medida = ?, contenedor = ?, naviera = ?, pedimento = ?
      WHERE id_recibo = ? 
      `,
      [oc, cantidad, recepcion, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, id_recibo]
    );
    

    //  if (recepcion) {
    //   await pool.query(
    //     `
    //     UPDATE recibo_compras 
    //     SET arribo = ?
    //     WHERE contenedor = ? AND id_recibo = ?
    //     `,
    //     [recepcion, contenedor, id_recibo]
    //   );
    //   console.log('Fecha de arribo sincronizada en productos con el mismo contenedor');
    // }

    await pool.query(`
      UPDATE recibo_cedis AS rc
      INNER JOIN recibo_compras AS rco ON rc.id_recibo_compras = rco.id_recibo
      SET 
        rc.oc = rco.oc,
        rc.referencia = rco.referencia,
        rc.contenedor = rco.contenedor,
        rc.naviera = rco.naviera,
        rc.pedimento = rco.pedimento,
        rc.cantidad_total = rco.cant_recibir
      WHERE rc.id_recibo_compras IS NOT NULL;
    `);


    res.json({ message: 'Recibo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el recibo:', error);
    res.status(500).json({ message: 'Error al actualizar el recibo', error: error.message });
  }
};

// Actualizar recibo con almacenes y cantidades
const updateReciboCant = async (req, res) => {
  const { id_recibo } = req.params;
  const { almacen7050, almacen7066, cantidad7050, cantidad7066 } = req.body;
  console.log('Actualizando:', req.body);
  try {
    console.log('Actualizando almacenes y cantidades para recibo:', id_recibo);

    // Actualizar solo los campos de almacenes y cantidades
    await pool.query(
      `
      UPDATE recibo_compras 
      SET 
        almacen7050 = ?, 
        almacen7066 = ?, 
        cantidad7050 = ?, 
        cantidad7066 = ?
      WHERE id_recibo = ?
      `,
      [almacen7050, almacen7066, cantidad7050, cantidad7066, id_recibo]
    );

    res.json({ message: 'Almacenes y cantidades actualizados exitosamente' });
  } catch (error) {
    console.error('Error al actualizar almacenes y cantidades:', error);
    res.status(500).json({ message: 'Error al actualizar almacenes y cantidades', error: error.message });
  }
};





// Agregar recibo
const addRecibo = async (req, res) => {
  
  const { oc, cantidad, recepcion, codigo, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, usuario } = req.body; // Recibe usuario

  try {
    console.log('Agregando recibo con datos:', req.body); // Verifica que el usuario está siendo recibido correctamente

    // Verifica si ya existe un recibo con el mismo código
    const [existingRecibos] = await pool.query('SELECT * FROM recibo_compras WHERE codigo = ? AND oc = ?', [codigo, oc]);

    if (existingRecibos.length > 0) {
      console.log('Código ya existe, actualizando cantidad. Recibos existentes:', existingRecibos);
      const nuevoCantidad = parseInt(cantidad) + parseInt(existingRecibos[0].cant_recibir);

      await pool.query(
        'UPDATE recibo_compras SET cant_recibir = ? WHERE codigo = ? AND oc = ?',
        [nuevoCantidad, codigo, oc]
      );

      res.json({ message: 'Cantidad actualizada exitosamente para el código existente' });
    } else {
      // Asegúrate de que "usuario" está correctamente insertado
      const estado ="C"
      console.log('Ejecutando INSERT con datos:', [oc, cantidad, recepcion, codigo, usuario, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, estado]);

      const [result] = await pool.query(`
        INSERT INTO recibo_compras (oc, cant_recibir, arribo, codigo, usuario, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [oc, cantidad, recepcion, codigo, usuario, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, estado]
      );

      console.log('Recibo agregado correctamente con ID:', result.insertId);
      res.json({ message: 'Recibo agregado exitosamente', id: result.insertId });
    }
  } catch (error) {
    console.error('Error al agregar el recibo:', error);
    res.status(500).json({ message: 'Error al agregar el recibo', error: error.message });
  }
};


// const uploadExcel = async (req, res) => {
//   const data = req.body;
//   const estado = "C";

//   try {
//     const insertData = [];
//     const updatePromises = [];
//     console.log('Agregando recibo con datos:', req.body); // Verifica que el usuario está siendo recibido correctamente

//     for (const row of data) {
//       const { codigo, oc, cant_recibir, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, arribo, usuario, sucursal, factura } = row;

//       // Validación en el servidor
//       if (!codigo || !oc || !cant_recibir || !arribo) {
//         return res.status(400).json({ message: 'Uno o más campos obligatorios están vacíos.' });
//       }

//       // Verifica si el recibo ya existe con el mismo codigo, oc y cantidad
//       const [existingRecibo] = await pool.query('SELECT * FROM recibo_compras WHERE codigo = ? AND oc = ? AND cant_recibir = ?', [codigo, oc, cant_recibir]);

//       if (existingRecibo.length > 0) {
//         // Si ya existe, actualizamos todos los campos que sea necesario
//         console.log('Código ya existe con la misma cantidad, se actualizarán todos los campos si es necesario.');
        
//         updatePromises.push(
//           pool.query(
//             `UPDATE recibo_compras 
//              SET arribo = ?, tipo = ?, referencia = ?, unidad_medida = ?, contenedor = ?, naviera = ?, pedimento = ?, usuario = ?, estado = ?, sucursal = ?, factura = ?
//              WHERE codigo = ? AND oc = ? AND cant_recibir = ?`,
//             [arribo, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura, codigo, oc, cant_recibir]
//           )
//         );
//       } else {
//         // Si no existe, lo añadimos al array de inserciones en lote
//         insertData.push([oc, cant_recibir, arribo, codigo, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura]);
//       }
//     }

//     // Ejecutar las actualizaciones primero
//     await Promise.all(updatePromises);

//     // Inserción en lote si hay nuevos registros
//     if (insertData.length > 0) {
//       const insertQuery = `
//         INSERT INTO recibo_compras (oc, cant_recibir, arribo, codigo, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura)
//         VALUES ?
//       `;
//       await pool.query(insertQuery, [insertData]);
//     }

//     res.json({ message: 'Datos del Excel cargados exitosamente' });
//   } catch (error) {
//     console.error('Error al cargar los datos del Excel:', error);
//     res.status(500).json({ message: 'Error al cargar los datos del Excel', error: error.message });
//   }
// };



// const uploadExcel = async (req, res) => {
//   const data = req.body;
//   const estado = "C";

//   try {
//     const insertDataCompras = [];
//     const insertDataCedis = [];
//     const updatePromisesCompras = [];
//     const updatePromisesCedis = [];
//     console.log('Agregando recibo con datos:', req.body);

//     for (const row of data) {
//       const { codigo, oc, cant_recibir, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, arribo, usuario, sucursal, factura } = row;

//       // Validación
//       if (!codigo || !oc || !cant_recibir || !arribo) {
//         return res.status(400).json({ message: 'Uno o más campos obligatorios están vacíos.' });
//       }

//       // Verifica si el recibo ya existe en recibo_compras
//       const [existingRecibo] = await pool.query(
//         'SELECT * FROM recibo_compras WHERE codigo = ? AND oc = ? AND cant_recibir = ?', 
//         [codigo, oc, cant_recibir]
//       );

//       if (existingRecibo.length > 0) {
//         console.log('Código ya existe con la misma cantidad, se actualizarán todos los campos si es necesario.');

//         // Actualizar recibo_compras
//         updatePromisesCompras.push(
//           pool.query(
//             `UPDATE recibo_compras 
//              SET arribo = ?, tipo = ?, referencia = ?, unidad_medida = ?, contenedor = ?, naviera = ?, pedimento = ?, usuario = ?, estado = ?, sucursal = ?, factura = ?
//              WHERE codigo = ? AND oc = ? AND cant_recibir = ?`,
//             [arribo, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura, codigo, oc, cant_recibir]
//           )
//         );

//         // Actualizar recibo_cedis
//         updatePromisesCedis.push(
//           pool.query(
//             `UPDATE recibo_cedis 
//              SET cantidad_total = ?, referencia = ?, contenedor = ?, naviera = ?, pedimento = ?, id_usuario = ?, est = ?, fecha_recibo = NOW()
//              WHERE codigo = ? AND oc = ?`,
//             [cant_recibir, referencia, contenedor, naviera, pedimento, usuario, estado, codigo, oc]
//           )
//         );

//       } else {
//         // Insertar en recibo_compras
//         insertDataCompras.push([oc, cant_recibir, arribo, codigo, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura]);

//         // Insertar en recibo_cedis
//         insertDataCedis.push([codigo, cant_recibir, 0, arribo, oc, referencia, contenedor, naviera, pedimento, estado, usuario]);
//       }
//     }

//     // Ejecutar actualizaciones
//     await Promise.all([...updatePromisesCompras, ...updatePromisesCedis]);

//     // Insertar en recibo_compras si hay nuevos registros
//     if (insertDataCompras.length > 0) {
//       const insertQueryCompras = `
//         INSERT INTO recibo_compras (oc, cant_recibir, arribo, codigo, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura)
//         VALUES ?
//       `;
//       await pool.query(insertQueryCompras, [insertDataCompras]);
//     }

//     // Insertar en recibo_cedis si hay nuevos registros
//     if (insertDataCedis.length > 0) {
//       const insertQueryCedis = `
//         INSERT INTO recibo_cedis (codigo, cantidad_total, cantidad_recibida, fecha_recibo, oc, referencia, contenedor, naviera, pedimento, est, id_usuario)
//         VALUES ?
//       `;
//       await pool.query(insertQueryCedis, [insertDataCedis]);
//     }

//     res.json({ message: 'Datos del Excel cargados exitosamente' });
//   } catch (error) {
//     console.error('Error al cargar los datos del Excel:', error);
//     res.status(500).json({ message: 'Error al cargar los datos del Excel', error: error.message });
//   }
// };


const uploadExcel = async (req, res) => {
  const data = req.body;
  const estado = "C";

  const id_catv = '4';
  const est = 'A';
  const acc_veh = 'S';
  const area_per = 9;
  const motivo = 'DESCARGA DE PRODUCTO';
  const fecha = new Date();

  const SQL_INSERT_CONTENEDORES_VISITAS = `INSERT INTO contenedores_visitas (id_catv, id_recibo_compras, contenedor, arribo) VALUES (?, ?, ?, ?)`;
  const SQL_INSERT_VISITA = `INSERT INTO visitas (id_vit, reg_entrada, area_per, motivo, est, clave_visit, acc_veh) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const SQL_UPDATE_CLAVE_VISITA = `UPDATE contenedores_visitas SET clave = ? WHERE id_recibo_compras = ?`;
  const SQL_CHECK_DUPLICATE = `SELECT * FROM contenedores_visitas WHERE contenedor = ? AND arribo = ?`;


  try {
    const insertDataCompras = [];
    const insertDataCedis = [];
    const updatePromisesCompras = [];
    const updatePromisesCedis = [];

    const contenedoresVisitasPromises = [];
    const insertDataVisita = [];
    const updatePromisesClave= [];
    console.log('Agregando recibo con datos:', req.body);

    for (const row of data) {
      const { codigo, oc, cant_recibir, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, arribo, usuario, sucursal, factura } = row;

      // Validación
      if (!codigo || !oc || !cant_recibir || !arribo) {
        return res.status(400).json({ message: 'Uno o más campos obligatorios están vacíos.' });
      }

      // Verifica si el recibo ya existe en recibo_compras
      const [existingRecibo] = await pool.query(
        'SELECT * FROM recibo_compras WHERE codigo = ? AND oc = ? AND cant_recibir = ?', 
        [codigo, oc, cant_recibir]
      );

      if (existingRecibo.length > 0) {
        console.log('Código ya existe con la misma cantidad, se actualizarán todos los campos si es necesario.');

        // Actualizar recibo_compras
        updatePromisesCompras.push(
          pool.query(
            `UPDATE recibo_compras 
             SET arribo = ?, tipo = ?, referencia = ?, unidad_medida = ?, contenedor = ?, naviera = ?, pedimento = ?, usuario = ?, estado = ?, sucursal = ?, factura = ?,  updated_at = NOW() 
             WHERE codigo = ? AND oc = ? AND cant_recibir = ?`,
            [arribo, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura, codigo, oc, cant_recibir]
          )
        );

        // Actualizar recibo_cedis
        updatePromisesCedis.push(
          pool.query(
            `UPDATE recibo_cedis 
             SET cantidad_total = ?, referencia = ?, contenedor = ?, naviera = ?, pedimento = ?, id_usuario = ?, est = ?, fecha_recibo = ?, updated_at = NOW() 
             WHERE codigo = ? AND oc = ?`,
            [cant_recibir, referencia, contenedor, naviera, pedimento, usuario, estado, arribo, codigo, oc]
          )
        );

        const [duplicate] = await pool.query(SQL_CHECK_DUPLICATE, [contenedor, arribo]);
        if (duplicate.length === 0) {
          contenedoresVisitasPromises.push(pool.query(SQL_INSERT_CONTENEDORES_VISITAS, [id_catv, codigo, contenedor, arribo]));
          const dia = fecha.getDate().toString().padStart(2, '0');
          const random1 = Math.floor(Math.random() * 900) + 100;
          const generarClave = (prefijo, id) => {
            const dia = fecha.getDate().toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 90) + 10; // Dos dígitos aleatorios
            return `${prefijo}${dia}${id || random}`;
          };
          
          // Uso
          const clave = generarClave('PR');
          const clave_visit = generarClave('PR', random1);
          insertDataVisita.push(pool.query(SQL_INSERT_VISITA, [clave, arribo, area_per, motivo, est, clave_visit, acc_veh]));

          if(insertDataVisita) {
            updatePromisesClave.push(pool.query(SQL_UPDATE_CLAVE_VISITA, [clave, codigo]))
          }
        }

      } else {
        // Insertar en recibo_compras
        insertDataCompras.push([oc, cant_recibir, arribo, codigo, tipoP, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura]);

        // Insertar en recibo_cedis
        insertDataCedis.push([codigo, cant_recibir, 0, arribo, oc, referencia, contenedor, naviera, pedimento, estado, usuario]);
      }
    }

    // Ejecutar actualizaciones
    await Promise.all([...updatePromisesCompras, ...updatePromisesCedis]);

    // Insertar en recibo_compras si hay nuevos registros
    if (insertDataCompras.length > 0) {
      const insertQueryCompras = `
        INSERT INTO recibo_compras (oc, cant_recibir, arribo, codigo, tipo, referencia, unidad_medida, contenedor, naviera, pedimento, usuario, estado, sucursal, factura)
        VALUES ?
      `;
      await pool.query(insertQueryCompras, [insertDataCompras]);
    }

    // Insertar en recibo_cedis si hay nuevos registros
    // if (insertDataCedis.length > 0) {
    //   const insertQueryCedis = `
    //     INSERT INTO recibo_cedis (codigo, cantidad_total, cantidad_recibida, fecha_recibo, oc, referencia, contenedor, naviera, pedimento, est, id_usuario)
    //     VALUES ?
    //   `;
    //   await pool.query(insertQueryCedis, [insertDataCedis]);
    // }

    for (const row of insertDataCompras) {
      const contenedor = row[7];
      const arribo = row[2]; 
      const codigo = row[3];
      const [duplicate] = await pool.query(SQL_CHECK_DUPLICATE, [contenedor, arribo]);
      if (duplicate.length === 0) {
        contenedoresVisitasPromises.push(pool.query(SQL_INSERT_CONTENEDORES_VISITAS, [id_catv, codigo, contenedor, arribo]));
        const dia = fecha.getDate().toString().padStart(2, '0');
        const random1 = Math.floor(Math.random() * 900) + 100;
        const generarClave = (prefijo, id) => {
          const dia = fecha.getDate().toString().padStart(2, '0');
          const random = Math.floor(Math.random() * 90) + 10; 
          return `${prefijo}${dia}${id || random}`;
        };
        
        // Uso
        const clave = generarClave('PR');
        const clave_visit = generarClave('PR', random1);
        insertDataVisita.push(pool.query(SQL_INSERT_VISITA, [clave, arribo, area_per, motivo, est, clave_visit, acc_veh]));
        if(insertDataVisita) {
          updatePromisesClave.push(pool.query(SQL_UPDATE_CLAVE_VISITA, [clave, codigo]))
        }
        
      }
    }
    await Promise.all(contenedoresVisitasPromises);


    await pool.query(`
      UPDATE recibo_cedis AS rc
      INNER JOIN recibo_compras AS rco ON rc.id_recibo_compras = rco.id_recibo
      SET 
        rc.oc = rco.oc,
        rc.referencia = rco.referencia,
        rc.contenedor = rco.contenedor,
        rc.naviera = rco.naviera,
        rc.pedimento = rco.pedimento
      WHERE rc.id_recibo_compras IS NOT NULL;
    `);


    res.json({ message: 'Datos del Excel cargados exitosamente' });
  } catch (error) {
    console.error('Error al cargar los datos del Excel:', error);
    res.status(500).json({ message: 'Error al cargar los datos del Excel', error: error.message });
  }
};

const fs = require('fs'); // Importar el sistema de archivos para eliminar archivos
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone'); 
const utc = require('dayjs/plugin/utc');

// Extender dayjs con los plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/rodrigo/Desktop/react/docs'); // Carpeta de destino
  },
  filename: (req, file, cb) => {
    const currentDate = dayjs().tz("America/Mexico_City").format('YYYY-MM-DD-HH-mm-ss');
    cb(null, `${currentDate}-${file.originalname}`); // Agregar timestamp para evitar sobrescribir
  }
});

const storageDocsOC = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/rodrigo/Desktop/react/docsOC'); // Ruta para uploadPDFsOC
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  }
});


const uploadPDFsOC = async (req, res) => {
  uploadOC(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al subir archivo PDF para OC', error: err.message });
    }

    const { ordenCompra: oc } = req.body;
    const uploadedFiles = req.files;  // Para múltiples archivos

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ message: 'No se subieron archivos' });
    }

    try {
      // Iterar sobre los archivos subidos y guardarlos en la base de datos
      for (const file of uploadedFiles) {
        const pdfName = file.filename;  // Obtener el nombre del archivo

        // Insertar en la tabla pdfOC con la Orden de Compra y el nombre del archivo
        await pool.query('INSERT INTO pdfOC (oc, pdf_nombre) VALUES (?, ?)', [oc, pdfName]);
        console.log(`PDF insertado para OC: ${oc}, archivo: ${pdfName}`);
      }

      res.json({ message: 'PDFs guardados correctamente en pdfOC' });
    } catch (error) {
      console.error('Error al insertar en la tabla pdfOC:', error);
      res.status(500).json({ message: 'Error al guardar los PDFs en pdfOC', error: error.message });
    }
  });
};





// Configuración de multer para aceptar hasta 5 archivos
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 100 }, // Permitir hasta 20 archivos en total
  
}).fields([
  { name: 'pdf_1', maxCount: 1 },
  { name: 'pdf_2', maxCount: 20  },
  { name: 'pdf_3', maxCount: 1 },
  { name: 'pdf_4', maxCount: 20 }, // Cambiar para aceptar hasta 20 archivosfv
  { name: 'pdf_5', maxCount: 1 },
  { name: 'pdf_6', maxCount: 20 }, 
]);

// Configuración de multer para uploadPDFsOC (docsOC)
// Configuración de multer para uploadPDFsOC (docsOC)
const uploadOC = multer({
  storage: storageDocsOC,
  limits: { files: 30 }, // Limitar la cantidad máxima de archivos a 30
}).array('pdf_oc', 30);  // Cambiar a .array() para aceptar hasta 30 archivos



// Función para eliminar un archivo existente
const deleteFile = (filePath) => { 
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error al eliminar el archivo: ${filePath}`, err);
      else console.log(`Archivo eliminado: ${filePath}`);
    });
  }
}; 





const uploadPDFs = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al subir archivos', error: err.message });
    }
    console.log("Archivos subidos (Multer):", req.files);

    const { ordenCompra: oc, pedimento, referencia, estado = 'C' } = req.body;
    const uploadedFiles = req.files;
    let pdf_2 = null;
    let pdf_4 = null;
    let pdf_6 = null;

    console.log("DATOS RECIBIDOS:", req.body);
    console.log("ARCHIVOS SUBIDOS:", uploadedFiles);

    try {
      if (uploadedFiles.pdf_2) {
        pdf_2 = uploadedFiles.pdf_2.map(file => file.filename).join(', ');
        
      console.log("Nombres de archivos concatenados en pdf_2:", pdf_2);
      }

      if (uploadedFiles.pdf_4) {
        pdf_4 = uploadedFiles.pdf_4.map(file => file.filename).join(', ');
        
      console.log("Nombres de archivos concatenados en pdf_4:", pdf_4);
      }

      
      if (uploadedFiles.pdf_6) {
        pdf_6 = uploadedFiles.pdf_6.map(file => file.filename).join(', ');
        
      console.log("Nombres de archivos concatenados en pdf_6:", pdf_6);
      }



      const pdf_1 = uploadedFiles.pdf_1 ? uploadedFiles.pdf_1[0].filename : null;
      const pdf_3 = uploadedFiles.pdf_3 ? uploadedFiles.pdf_3[0].filename : null;
      const pdf_5 = uploadedFiles.pdf_5 ? uploadedFiles.pdf_5[0].filename : null;

      const [productosConPedimento] = await pool.query('SELECT * FROM recibo_compras WHERE pedimento = ?', [pedimento]);

      if (productosConPedimento.length > 0) {
        for (const producto of productosConPedimento) {
          const [existingRecibo] = await pool.query('SELECT * FROM recibo_cedis WHERE id_recibo_compras = ?', [producto.id_recibo]);

          if (existingRecibo.length === 0) {
            const insertValues = [
              producto.codigo, producto.cant_recibir, 0, producto.arribo, producto.oc, producto.referencia, 
              producto.contenedor, producto.naviera, producto.pedimento, estado, null, null, null, null, null, null, producto.id_recibo, producto.usuario
            ];

            await pool.query(`
              INSERT INTO recibo_cedis (codigo, cantidad_total, cantidad_recibida, fecha_recibo, oc, referencia, 
              contenedor, naviera, pedimento, est, pdf_1, pdf_2, pdf_3, pdf_4, pdf_5, pdf_6, id_recibo_compras, id_usuario)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`, insertValues);
              console.log(`Producto insertado en recibo_cedis con OC: ${producto.oc}`);
          }
          else {
            // Eliminar archivos anteriores si existen en la base de datos
            const previousPdf1 = existingRecibo[0].pdf_1;
            const previousPdf2 = existingRecibo[0].pdf_2;
            const previousPdf3 = existingRecibo[0].pdf_3;
            const previousPdf4 = existingRecibo[0].pdf_4;
            const previousPdf5 = existingRecibo[0].pdf_5;
            const previousPdf6 = existingRecibo[0].pdf_6;
            if (previousPdf1 && pdf_1) deleteFile(`C:/Users/rodrigo/Desktop/react/docs/${previousPdf1}`);
            if (previousPdf2 && pdf_2) deleteFile(`C:/Users/rodrigo/Desktop/react/docs/${previousPdf2}`);
            if (previousPdf3 && pdf_3) deleteFile(`C:/Users/rodrigo/Desktop/react/docs/${previousPdf3}`);
            if (previousPdf4 && pdf_4) deleteFile(`C:/Users/rodrigo/Desktop/react/docs/${previousPdf4}`);
            if (previousPdf5 && pdf_5) deleteFile(`C:/Users/rodrigo/Desktop/react/docs/${previousPdf5}`);            
            if (previousPdf6 && pdf_6) deleteFile(`C:/Users/rodrigo/Desktop/react/docs/${previousPdf6}`);
          }
        }

        const updatePedimentoFields = [];
        const updatePedimentoValues = [];

        if (pdf_1) {
          updatePedimentoFields.push('pdf_1 = ?');
          updatePedimentoValues.push(pdf_1);
        }
        if (pdf_3) {
          updatePedimentoFields.push('pdf_3 = ?');
          updatePedimentoValues.push(pdf_3);
        }

        if (updatePedimentoFields.length > 0) {
          updatePedimentoValues.push(pedimento);
          await pool.query(`
            UPDATE recibo_cedis SET ${updatePedimentoFields.join(', ')}
            WHERE pedimento = ?`, updatePedimentoValues);
        }

        const updateOCFields = [];
        const updateOCValues = [];

        if (pdf_5) {
          updateOCFields.push('pdf_5 = ?');
          updateOCValues.push(pdf_5);
        }

        if (updateOCFields.length > 0) {
          updateOCValues.push(oc);
          await pool.query(`
            UPDATE recibo_cedis SET ${updateOCFields.join(', ')}
            WHERE oc = ?`, updateOCValues);
            console.log(`Documentos de OC actualizados para todos los productos con OC: ${oc}`);
        }

        const [productosConReferencia] = await pool.query('SELECT * FROM recibo_cedis WHERE referencia = ?', [referencia]);

         if (productosConReferencia.length > 0) {
           // Actualizar los documentos solo para productos con la misma referencia
           const updateFacturaFields = [];
           const updateFacturaValues = [];
 
           if (pdf_4) {
             updateFacturaFields.push('pdf_4 = ?');
             updateFacturaValues.push(pdf_4);
           }
 
           if (updateFacturaFields.length > 0) {
             updateFacturaValues.push(referencia);  // Actualizar para todos los productos con la misma referencia
 
             await pool.query(`
               UPDATE recibo_cedis
               SET ${updateFacturaFields.join(', ')}
               WHERE referencia = ?`, updateFacturaValues);
 
             console.log(`Documentos actualizados para todos los productos con referencia: ${referencia}`);
           }
         } else {
           console.log(`No se encontraron productos con la referencia: ${referencia}`);
         }

         const [productosPackingList] = await pool.query('SELECT * FROM recibo_cedis WHERE referencia = ?', [referencia]);

                    if (productosPackingList.length > 0) {
                      // Actualizar los documentos solo para productos con la misma referencia
                      const updatePackingList = [];
                      const updatePackingListValues = [];
            
                      if (pdf_2) {
                        updatePackingList.push('pdf_2 = ?');
                        updatePackingListValues.push(pdf_2);
                      }
            
                      if (updatePackingList.length > 0) {
                        updatePackingListValues.push(referencia);  // Actualizar para todos los productos con la misma referencia
            
                        await pool.query(`
                          UPDATE recibo_cedis
                          SET ${updatePackingList.join(', ')}
                          WHERE referencia = ?`, updatePackingListValues);
            
                        console.log(`Documentos actualizados para todos los productos con Packing list : ${referencia}`);
                      }
                    }

                    ////////


                       const [productosOE] = await pool.query('SELECT * FROM recibo_cedis WHERE referencia = ?', [referencia]);

                    if (productosOE.length > 0) {
                      // Actualizar los documentos solo para productos con la misma referencia
                      const updateOE = [];
                      const updateOEValues = [];
            
                      if (pdf_6) {
                        updateOE.push('pdf_6 = ?');
                        updateOEValues.push(pdf_6);
                      }
            
                      if (updateOE.length > 0) {
                        updateOEValues.push(referencia);  // Actualizar para todos los productos con la misma referencia
            
                        await pool.query(`
                          UPDATE recibo_cedis
                          SET ${updateOE.join(', ')}
                          WHERE referencia = ?`, updateOEValues);
            
                        console.log(`Documentos actualizados para todos los productos con Packing list : ${referencia}`);
                      }
                    }

        res.json({ message: 'Documentos procesados correctamente para los productos con el mismo pedimento y Packing list' });

      } else {
        res.status(404).json({ message: 'No se encontraron productos con ese pedimento' });
      }

    } catch (error) {
      console.error('Error al procesar el recibo:', error);
      res.status(500).json({ message: 'Error al procesar el recibo', error: error.message });
    }
  });
}; 



 
 const cancelarRecibo = async (req, res) => {
  const { id_recibo } = req.params;
  console.log("datosRcio", req.params)
  const estado = 'Cancelado'; // El estado será "Cancelado"

  try {
    console.log('Actualizando recibo con id:', id_recibo);

    // Verificar si el recibo existe
    const [existingRecibo] = await pool.query(
      'SELECT * FROM recibo_compras WHERE id_recibo = ?',
      [id_recibo]
    );

    if (existingRecibo.length === 0) {
      return res.status(404).json({ message: 'El recibo no existe' });
    }

    // Actualizar el estado del recibo a "Cancelado"
    await pool.query('UPDATE recibo_compras SET estado = ? WHERE id_recibo = ?', [estado, id_recibo]);

    console.log('Recibo cancelado correctamente:', id_recibo);
    res.status(200).json({ message: 'Recibo cancelado exitosamente' });
  } catch (error) {
    console.error('Error al cancelar el recibo:', error);
    res.status(500).json({ message: 'Error al cancelar el recibo', error: error.message });
  }
};



module.exports = { getCompras, addRecibo, updateRecibo, uploadExcel, uploadPDFs, uploadPDFsOC, updateReciboCant, cancelarRecibo};

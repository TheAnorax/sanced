const pool = require('../config/database');
const multer = require('multer');
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folders = {
      img_pz: "C:/Users/rodrigo/Desktop/react/imagenes/img_pz",
      img_inner: "C:/Users/rodrigo/Desktop/react/imagenes/img_inner",
      img_master: "C:/Users/rodrigo/Desktop/react/imagenes/img_master",
    };

    const folderPath = folders[file.fieldname];

    // Crear carpeta si no existe
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // extensión .jpg o .png
    const base = req.body.codigo_pro || path.basename(file.originalname, ext); // nombre del archivo
    cb(null, `${base}${ext}`);
  },
});



 
const upload = multer({ storage });


//  Controlador: productosController.js
const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_prod,              
        p.clave,                 --  Nuevo campo agregado
        p.codigo_pro,                 
        p.des,                      
        p.code_pz,               
        p.code_pq,               
        p.code_master,           
        p.code_inner,             
        p.code_palet,            
        p._pz,                     
        p._pq,                     
        p._inner,                  
        p._master,                 
        p._palet,                  
        p.um,                       
        p.largo_pz,              
        p.largo_inner,           
        p.largo_master,          
        p.ancho_pz,              
        p.ancho_inner,           
        p.ancho_master,          
        p.alto_pz,               
        p.alto_inner,            
        p.alto_master,           
        p.peso_pz,               
        p.peso_inner,            
        p.peso_master,
        p.img_pz,

        -- 🔹 Campos de Volumetría
        COALESCE(v.cajas_cama, 0)       AS cajas_cama,
        COALESCE(v.pieza_caja, 0)       AS pieza_caja,
        COALESCE(v.cajas_tarima, 0)     AS cajas_tarima,
        COALESCE(v.camas_tarima, 0)     AS camas_tarima,
        COALESCE(v.pieza_tarima, 0)     AS pieza_tarima,

        -- 🔹 Concatenar ubicaciones de picking
        COALESCE(u.ubi, 'SIN UBICACIÓN') AS ubicaciones,

        -- 🔹 Stock en almacenamiento
        COALESCE(ua.cant_stock, 0) AS stock_almacen,

        -- 🔹 Stock en picking
        COALESCE(up.cant_stock_real, 0) AS stock_picking,

        -- 🔹 Stock total
        COALESCE(ua.cant_stock, 0) + COALESCE(up.cant_stock_real, 0) AS stock_total

      FROM productos p

      -- 🔸 Unión con almacenamiento
      LEFT JOIN (
        SELECT 
          code_prod, 
          SUM(CAST(cant_stock AS SIGNED)) AS cant_stock
        FROM ubi_alma
        GROUP BY code_prod
      ) ua ON p.codigo_pro = ua.code_prod

      -- 🔸 Unión con picking (stock)
      LEFT JOIN (
        SELECT 
          code_prod, 
          SUM(cant_stock_real) AS cant_stock_real
        FROM ubicaciones
        GROUP BY code_prod
      ) up ON p.codigo_pro = up.code_prod

      -- 🔸 Unión para obtener las ubicaciones (concatenadas)
      LEFT JOIN (
        SELECT 
          code_prod, 
          GROUP_CONCAT(ubi SEPARATOR ', ') AS ubi
        FROM ubicaciones
        GROUP BY code_prod
      ) u ON p.codigo_pro = u.code_prod

      -- 🔸 Unión con volumetría
      LEFT JOIN volumetria v ON p.codigo_pro = v.codigo

      -- 🔸 Agrupar por producto
      GROUP BY 
        p.id_prod, 
        p.codigo_pro, 
        p.clave
    `);

    res.json(rows);

  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ 
      message: "Error al obtener los productos", 
      error: error.message 
    });
  }
};




const getVoluProducts = async (req, res) => {
  const { codigo_pro } = req.query; // Obtener el código desde query params
  if (!codigo_pro) {
    return res.status(400).json({ message: "El código del producto es requerido" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
        p.codigo_pro,
        p.des, 
        p._pz,
        p._pq,
        p._inner,
        p._master,
        p._palet,
        v.cajas_cama,
        v.camas_tarima,
        v.pieza_tarima,
        v.pieza_caja,
        v.cajas_tarima   
      FROM productos p
      LEFT JOIN volumetria v ON p.codigo_pro = v.codigo
      WHERE p.codigo_pro = ?`,
      [codigo_pro]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los productos",
      error: error.message
    });
  }
};



const getAllProductsUbi = async (req, res) => {
  const { codigo_pro } = req.query; // Obtener el parámetro de consulta `codigo_pro`
  let query = 'SELECT prod.codigo_pro, u.ubi FROM productos prod LEFT JOIN ubicaciones u ON prod.codigo_pro = u.code_prod';

  // Si se proporciona `codigo_pro`, agregar una cláusula WHERE a la consulta
  if (codigo_pro) {
    query += ' WHERE prod.codigo_pro = ?';
  }

  try {
    const [rows] = await pool.query(query, [codigo_pro].filter(Boolean));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
}

const createProduct = async (req, res) => {
  const { codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet } = req.body;
  const img_pz = req.files?.img_pz ? req.files.img_pz[0].filename : null;
  const img_pq = req.files?.img_pq ? req.files.img_pq[0].filename : null;
  const img_inner = req.files?.img_inner ? req.files.img_inner[0].filename : null;
  const img_master = req.files?.img_master ? req.files.img_master[0].filename : null;
  const campos = {
    codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet,
    _pz, _pq, _inner, _master, _palet,
    img_pz, img_pq, img_inner, img_master,
  };

  const insertValues = Object.entries(campos)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([campo, valor_nuevo]) => [
      req.body.id_usu || null, // debes enviar este en req.body
      codigo_pro,
      'productos',
      campo,
      null, // valor_anterior es null en creación
      valor_nuevo
    ]);

  await pool.query('INSERT INTO modificaciones (id_usuario, codigo, tabla, campo, valor_anterior, valor_nuevo) VALUES ?', [insertValues]);


  try {
    const [result] = await pool.query('INSERT INTO productos (codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet, img_pz, img_pq, img_inner, img_master) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet, img_pz, img_pq, img_inner, img_master]);
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.body.id_usu;
  console.log("usuario", id_usuario)
  const {
    codigo_pro,
    des,
    code_pz,
    code_pq,
    code_master,
    code_inner,
    code_palet,
    _pz,
    _pq,
    _inner,
    _master,
    _palet,
  } = req.body;

  const img_pz = req.files?.img_pz ? req.files.img_pz[0].filename : null;
  const img_pq = req.files?.img_pq ? req.files.img_pq[0].filename : null;
  const img_inner = req.files?.img_inner ? req.files.img_inner[0].filename : null;
  const img_master = req.files?.img_master ? req.files.img_master[0].filename : null;

  // const id_usuario = res.locals.userId; // Obtener el id del usuario logeado desde el middleware

  try {
    const [[existingProduct]] = await pool.query('SELECT * FROM productos WHERE id_prod = ?', [id]);

    if (existingProduct) {
      const deleteImage = (imgPath) => {
        if (imgPath) {
          fs.unlink(path.join(__dirname, '../../public/assets/image/img_pz/', imgPath), (err) => {
            if (err) console.error('Error al eliminar la imagen:', err);
          });
        }
      };

      // Eliminar imágenes anteriores si se suben nuevas
      if (img_pz) deleteImage(existingProduct.img_pz);
      if (img_pq) deleteImage(existingProduct.img_pq);
      if (img_inner) deleteImage(existingProduct.img_inner);
      if (img_master) deleteImage(existingProduct.img_master);
    }

    // Identificar los cambios y registrar solo los campos que han cambiado
    const cambios = [];
    const updates = {}; // Este objeto contendrá solo los campos modificados

    const compararYRegistrarCambio = (campo, valorAnterior, valorNuevo) => {
      // Normalizar valores para evitar diferencias menores (por ejemplo, espacios adicionales)
      const valorAnt = valorAnterior !== null ? String(valorAnterior).trim() : valorAnterior;
      const valorNue = valorNuevo !== null ? String(valorNuevo).trim() : valorNuevo;

      // Solo registrar el cambio si los valores son realmente diferentes
      if (valorAnt !== valorNue) {
        cambios.push({
          id_usuario,
          codigo: codigo_pro,
          tabla: 'productos',
          campo,
          valor_anterior: valorAnt,
          valor_nuevo: valorNue,
        });
        updates[campo] = valorNue; // Solo incluir campos modificados en el objeto `updates`
      }
    };

    // Comparar y registrar cambios campo por campo
    compararYRegistrarCambio('codigo_pro', existingProduct.codigo_pro, codigo_pro);
    compararYRegistrarCambio('des', existingProduct.des, des);
    compararYRegistrarCambio('code_pz', existingProduct.code_pz, code_pz);
    compararYRegistrarCambio('code_pq', existingProduct.code_pq, code_pq);
    compararYRegistrarCambio('code_master', existingProduct.code_master, code_master);
    compararYRegistrarCambio('code_inner', existingProduct.code_inner, code_inner);
    compararYRegistrarCambio('code_palet', existingProduct.code_palet, code_palet);
    compararYRegistrarCambio('_pz', existingProduct._pz, _pz);
    compararYRegistrarCambio('_pq', existingProduct._pq, _pq);
    compararYRegistrarCambio('_inner', existingProduct._inner, _inner);
    compararYRegistrarCambio('_master', existingProduct._master, _master);
    compararYRegistrarCambio('_palet', existingProduct._palet, _palet);

    if (img_pz) compararYRegistrarCambio('img_pz', existingProduct.img_pz, img_pz);
    if (img_pq) compararYRegistrarCambio('img_pq', existingProduct.img_pq, img_pq);
    if (img_inner) compararYRegistrarCambio('img_inner', existingProduct.img_inner, img_inner);
    if (img_master) compararYRegistrarCambio('img_master', existingProduct.img_master, img_master);

    // Ejecutar la actualización solo si hay cambios
    if (Object.keys(updates).length > 0) {
      // Generar la consulta dinámicamente para actualizar solo los campos que cambiaron
      const updateFields = Object.keys(updates).map((field) => `${field} = ?`).join(', ');
      const updateValues = Object.values(updates);
      updateValues.push(id); // El `id` es el último parámetro para la cláusula `WHERE`

      await pool.query(`UPDATE productos SET ${updateFields} WHERE id_prod = ?`, updateValues);

      // Guardar los cambios en la tabla "modificaciones"
      const insertValues = cambios.map(c => [id_usuario, c.codigo, c.tabla, c.campo, c.valor_anterior, c.valor_nuevo]);
      await pool.query('INSERT INTO modificaciones (id_usuario, codigo, tabla, campo, valor_anterior, valor_nuevo) VALUES ?', [insertValues]);
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};



const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [[product]] = await pool.query('SELECT img_pz, img_pq, img_inner, img_master FROM productos WHERE id_prod = ?', [id]);

    if (product) {
      const deleteImage = (imgPath) => {
        if (imgPath) {
          fs.unlink(path.join(__dirname, '../../public/assets/image/img_pz/', imgPath), (err) => {
            if (err) console.error('Error al eliminar la imagen:', err);
          });
        }
      };

      deleteImage(product.img_pz);
      deleteImage(product.img_pq);
      deleteImage(product.img_inner);
      deleteImage(product.img_master);
    }

    await pool.query('DELETE FROM productos WHERE id_prod = ?', [id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

// const updateVolumetria = async (req, res) => {
//   const { codigo } = req.params; // El valor que viene en la URL será tomado como 'codigo'
//   const { cajas_cama, pieza_caja, cajas_tarima, camas_tarima, pieza_tarima } = req.body; 

//   if (!codigo) {
//     return res.status(400).json({ message: "El código del producto es obligatorio" });
//   }

//   try {
//     // Verifica si el producto existe usando 'codigo'
//     const [producto] = await pool.query(
//       `SELECT * FROM volumetria WHERE codigo = ?`,
//       [codigo]
//     );

//     if (producto.length === 0) {
//       return res.status(404).json({ message: "Producto no encontrado" });
//     }

//     // Actualiza los datos de volumetría
//     const [result] = await pool.query(
//       `UPDATE volumetria 
//        SET cajas_cama = ?, pieza_caja = ?, cajas_tarima = ?, camas_tarima = ?, pieza_tarima = ?  
//        WHERE codigo = ?`,
//       [cajas_cama, pieza_caja, cajas_tarima, camas_tarima, pieza_tarima, codigo]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(500).json({ message: "No se pudo actualizar la volumetría" });


//     }

//     res.json({ message: "Volumetría actualizada correctamente" });
//   } catch (error) {
//     console.error("Error al actualizar la volumetría:", error);
//     res.status(500).json({ message: "Error al actualizar la volumetría", error: error.message });
//   }
// };


const updateVolumetria = async (req, res) => {
  const { codigo } = req.params; // Código del producto desde la URL
  const { cajas_cama, pieza_caja, cajas_tarima, camas_tarima, pieza_tarima } = req.body;

  if (!codigo) {
    return res.status(400).json({ message: "El código del producto es obligatorio" });
  }

  try {
    // Verificar si el producto existe en la tabla `volumetria`
    const [producto] = await pool.query(
      `SELECT * FROM volumetria WHERE codigo = ?`,
      [codigo]
    );

    if (producto.length === 0) {
      // Si el producto NO existe, insertarlo en la base de datos
      const [insertResult] = await pool.query(
        `INSERT INTO volumetria (codigo, cajas_cama, pieza_caja, cajas_tarima, camas_tarima, pieza_tarima) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [codigo, cajas_cama, pieza_caja, cajas_tarima, camas_tarima, pieza_tarima]
      );

      if (insertResult.affectedRows === 1) {
        return res.status(201).json({ message: "Producto insertado correctamente en volumetría" });
      } else {
        return res.status(500).json({ message: "No se pudo insertar el producto" });
      }
    }

    // Si el producto SÍ existe, actualizarlo
    const [updateResult] = await pool.query(
      `UPDATE volumetria 
       SET cajas_cama = ?, pieza_caja = ?, cajas_tarima = ?, camas_tarima = ?, pieza_tarima = ? 
       WHERE codigo = ?`,
      [cajas_cama, pieza_caja, cajas_tarima, camas_tarima, pieza_tarima, codigo]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar la volumetría" });
    }

    res.json({ message: "Volumetría actualizada correctamente" });

  } catch (error) {
    console.error("Error al actualizar/insertar la volumetría:", error);
    res.status(500).json({ message: "Error al procesar la volumetría", error: error.message });
  }
};



const getStockTotal = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_prod, 
        p.codigo_pro, 
        p.des, 
        COALESCE(SUM(ua.cant_stock), 0) AS stock_almacen,
        COALESCE(SUM(u.cant_stock_real), 0) AS stock_picking,
        COALESCE(SUM(ua.cant_stock), 0) + COALESCE(SUM(u.cant_stock_real), 0) AS stock_total
      FROM productos p
      LEFT JOIN ubi_alma ua ON p.codigo_pro = ua.code_prod
      LEFT JOIN ubicaciones u ON p.codigo_pro = u.code_prod
      GROUP BY p.id_prod, p.codigo_pro, p.des
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener el stock total:", error);
    res.status(500).json({ message: "Error al calcular el stock total", error: error.message });
  }
};


///////////////////////////////////////CXATALOGO/////////////////////////////////////////////////////


const getCatalogProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_prod,              
        p.codigo_pro, 
        p.clave,                
        p.des,              
        p._pz,
        p._inner,                  
        p._master,                 
        p._palet,                  
        p.um,
        u.ubi,
        p.code_pz,
        p.code_pq,
        p.code_master,
        p.code_inner,

        COALESCE(ua.cant_stock, 0) AS stock_almacen,
        COALESCE(u.cant_stock_real, 0) AS stock_picking,
        COALESCE(ua.cant_stock, 0) + COALESCE(u.cant_stock_real, 0) AS stock_total

      FROM productos p

      LEFT JOIN (
        SELECT 
          code_prod, 
          SUM(CAST(cant_stock AS SIGNED)) AS cant_stock
        FROM ubi_alma
        GROUP BY code_prod
      ) ua ON p.codigo_pro = ua.code_prod

      LEFT JOIN (
        SELECT 
          code_prod, 
          SUM(cant_stock_real) AS cant_stock_real,
          MAX(ubi) AS ubi
        FROM ubicaciones
        GROUP BY code_prod
      ) u ON p.codigo_pro = u.code_prod

      GROUP BY p.id_prod
      ORDER BY p.codigo_pro ASC;
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

const getDetalleCatalogo = async (req, res) => {
  const { codigo_pro } = req.query;

  if (!codigo_pro) {
    return res.status(400).json({ message: 'Se requiere un código_pro' });
  }

  try {
    const [rows] = await pool.query(`
  SELECT 
    id_prod,
    codigo_pro,
    um,
    clave,
    des,
    code_pz,
    code_pq,
    code_master,
    code_inner,
    code_palet,
    _pz,
    _pq,
    _inner, 
    _master,
    _palet, 
    largo_pz,
    largo_inner,
    largo_master, 
    ancho_pz,
    ancho_inner,
    ancho_master, 
    alto_pz,
    alto_inner,
    alto_master,
    peso_pz,
    peso_inner,
    peso_master,
    garantia,
    img_pz, 
    img_pq, 
    img_inner, 
    img_master,

    -- NUEVO: archivos por TAB + timestamps
    flyer_file,
    flyer_file_updated_at,
    ficha_tecnica_file,
    ficha_tecnica_file_updated_at,
    ficha_comercial_file,
    ficha_comercial_file_updated_at
  FROM productos 
  WHERE codigo_pro = ?
`, [codigo_pro]);


    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// Controlador: updateDetalleCatalogo.js
const updateDetalleCatalogo = async (req, res) => {
  const {
    codigo_pro,
    _pz, _inner, _master,
    largo_pz, ancho_pz, alto_pz, peso_pz,
    largo_inner, ancho_inner, alto_inner, peso_inner,
    largo_master, ancho_master, alto_master, peso_master,
    code_pz, code_inner, code_master,
    id_usuario // ⬅️ capturamos el ID enviado
  } = req.body;

  if (!codigo_pro) {
    return res.status(400).json({ message: "Código de producto requerido" });
  }

  try {
    const [[productoActual]] = await pool.query(
      `SELECT * FROM productos WHERE codigo_pro = ?`, [codigo_pro]
    );

    if (!productoActual) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const cambios = [];

    const compararCambio = (campo, nuevoValor) => {
      const actual = productoActual[campo] ?? null;
      const nuevo = nuevoValor ?? null;
      if (String(actual) !== String(nuevo)) {
        cambios.push([id_usuario, codigo_pro, 'productos', campo, actual, nuevo]);
      }
    };

    compararCambio('_pz', _pz);
    compararCambio('_inner', _inner);
    compararCambio('_master', _master);
    compararCambio('largo_pz', largo_pz);
    compararCambio('ancho_pz', ancho_pz);
    compararCambio('alto_pz', alto_pz);
    compararCambio('peso_pz', peso_pz);
    compararCambio('largo_inner', largo_inner);
    compararCambio('ancho_inner', ancho_inner);
    compararCambio('alto_inner', alto_inner);
    compararCambio('peso_inner', peso_inner);
    compararCambio('largo_master', largo_master);
    compararCambio('ancho_master', ancho_master);
    compararCambio('alto_master', alto_master);
    compararCambio('peso_master', peso_master);
    compararCambio('code_pz', code_pz);
    compararCambio('code_inner', code_inner);
    compararCambio('code_master', code_master);

    await pool.query(`
    UPDATE productos SET
      _pz = ?, _inner = ?, _master = ?,
      largo_pz = ?, ancho_pz = ?, alto_pz = ?, peso_pz = ?,
      largo_inner = ?, ancho_inner = ?, alto_inner = ?, peso_inner = ?,
      largo_master = ?, ancho_master = ?, alto_master = ?, peso_master = ?,
      code_pz = ?, code_inner = ?, code_master = ?
    WHERE codigo_pro = ?
  `, [
      _pz || 0, _inner || 0, _master || 0,
      largo_pz || 0, ancho_pz || 0, alto_pz || 0, peso_pz || 0,
      largo_inner || 0, ancho_inner || 0, alto_inner || 0, peso_inner || 0,
      largo_master || 0, ancho_master || 0, alto_master || 0, peso_master || 0,
      code_pz || 0, code_inner || 0, code_master || 0,
      codigo_pro
    ]);

    if (cambios.length > 0) {
      await pool.query(`
      INSERT INTO modificaciones 
        (id_usuario, codigo, tabla, campo, valor_anterior, valor_nuevo)
      VALUES ?
    `, [cambios]);
    }

    res.json({ message: "Producto actualizado correctamente", cambios: cambios.length });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error en la actualización", error: error.message });
  }

};

const updateDetalleCatalogoImg = async (req, res) => {
  const { codigo_pro } = req.body;
  const files = req.files;



  if (!codigo_pro) {
    return res.status(400).json({ message: "Falta el código del producto" });
  }

  const camposActualizados = {};

  // Verificamos qué archivos llegaron y guardamos su nombre en camposActualizados
  for (const campo in files) {
    const file = files[campo][0]; // ej. files["img_inner"]
    const fileName = file.filename; // ya es `${codigo_pro}.jpg`

    if (campo === "img_pz") camposActualizados.img_pz = fileName;
    if (campo === "img_inner") camposActualizados.img_inner = fileName;
    if (campo === "img_master") camposActualizados.img_master = fileName;
  }

  try {
    // Si hay campos que actualizar, genera el query dinámico
    if (Object.keys(camposActualizados).length > 0) {
      const campos = Object.keys(camposActualizados)
        .map((campo) => `${campo} = ?`)
        .join(", ");

      const valores = Object.values(camposActualizados);

      const query = `UPDATE productos SET ${campos} WHERE codigo_pro = ?`;
      await pool.query(query, [...valores, codigo_pro]);
    }



    res.json({ message: "Imágenes subidas y referencias actualizadas correctamente" });
  } catch (err) {
    console.error("Error al actualizar la base de datos:", err);
    res.status(500).json({ message: "Error al actualizar imágenes en la base de datos" });
  }
};


// funcion para subir imagenes 
const DOCS_BASE = process.env.DOCS_BASE || "C:/Users/rodrigo/Documents/react/archivos/productos";

// ... arriba mantén DOCS_BASE como lo tienes ...

const storageDocs = multer.diskStorage({
  destination: (req, file, cb) => {
    const { codigo_pro, tipo } = req.params;
    const permitidos = ["flyer", "ficha_tecnica", "ficha_comercial"];
    if (!codigo_pro) return cb(new Error("Falta codigo_pro"));
    if (!permitidos.includes(tipo)) return cb(new Error("Tipo inválido"));

    const folderPath = path.join(DOCS_BASE, String(codigo_pro), tipo);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // 👇 si el archivo viene sin extensión, derivarla del mimetype
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      if (file.mimetype === "application/pdf") ext = ".pdf";
      else if (file.mimetype.startsWith("image/")) ext = ".jpg";
      else ext = ".bin";
    }
    cb(null, `${req.params.codigo_pro}${ext}`);
  }
});


const uploadDocs = multer({ storage: storageDocs, limits: { fileSize: 50 * 1024 * 1024 } });



const uploadDocumentoProducto = async (req, res) => {
  try {
    const { codigo_pro, tipo } = req.params;

    // 1) Leer id de usuario desde el form (o desde auth si lo tienes)
    let id_usuario = req.body.id_usuario;
    if (id_usuario !== undefined && id_usuario !== null && id_usuario !== '') {
      id_usuario = parseInt(id_usuario, 10);
      if (Number.isNaN(id_usuario)) id_usuario = null;
    } else {
      id_usuario = null;
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No llegó archivo." });
    }

    // 2) Columnas a actualizar por tipo
    const mapCols = {
      flyer: {
        fileCol: "flyer_file",
        tsCol: "flyer_file_updated_at",
        userCol: "flyer_file_user_id",
      },
      ficha_tecnica: {
        fileCol: "ficha_tecnica_file",
        tsCol: "ficha_tecnica_file_updated_at",
        userCol: "ficha_tecnica_file_user_id",
      },
      ficha_comercial: {
        fileCol: "ficha_comercial_file",
        tsCol: "ficha_comercial_file_updated_at",
        userCol: "ficha_comercial_file_user_id",
      },
    };

    const cfg = mapCols[tipo];
    if (!cfg) return res.status(400).json({ ok: false, message: "Tipo inválido." });

    const filename = req.file.filename; // p.ej. 3212.pdf

    // 3) UPDATE: archivo, timestamp y usuario
    const [result] = await pool.query(
      `UPDATE productos 
         SET ${cfg.fileCol} = ?, 
             ${cfg.tsCol}  = NOW(),
             ${cfg.userCol} = ?
       WHERE codigo_pro = ?`,
      [filename, id_usuario, codigo_pro]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Producto no encontrado" });
    }

    const publicPath = `/uploads/productos/${codigo_pro}/${tipo}/${filename}`;
    return res.json({
      ok: true,
      message: "Archivo subido",
      tipo,
      filename,
      url: publicPath,
      codigo_pro,
      user_id: id_usuario,
    });
  } catch (err) {
    console.error("subirArchivoTab:", err);
    return res.status(500).json({ ok: false, message: "Error al subir archivo" });
  }
};




const getDocumentoProducto = async (req, res) => {
  try {
    const { codigo_pro, tipo } = req.params;

    const mapCols = {
      flyer: { fileCol: "flyer_file" },
      ficha_tecnica: { fileCol: "ficha_tecnica_file" },
      ficha_comercial: { fileCol: "ficha_comercial_file" },
    };

    if (!mapCols[tipo]) {
      return res.status(400).json({ ok: false, message: "Tipo inválido" });
    }

    // 1) Sacamos el nombre de archivo desde DB
    const [rows] = await pool.query(
      `SELECT ${mapCols[tipo].fileCol} AS filename FROM productos WHERE codigo_pro = ?`,
      [codigo_pro]
    );

    if (!rows.length || !rows[0].filename) {
      return res.status(404).json({ ok: false, message: "Archivo no registrado" });
    }

    const filename = rows[0].filename; // p.ej. 1000.pdf
    // 2) Construimos la ruta absoluta
    const abs = path.resolve(path.join(DOCS_BASE, String(codigo_pro), tipo, filename));

    if (!fs.existsSync(abs)) {
      return res.status(404).json({ ok: false, message: "Archivo no encontrado en disco" });
    }

    // 3) Enviar el archivo
    return res.sendFile(abs);
  } catch (err) {
    console.error("getDocumentoProducto:", err);
    return res.status(500).json({ ok: false, message: "Error al servir archivo" });
  }
};



module.exports = {
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllProductsUbi, getVoluProducts, updateVolumetria, upload, getStockTotal, getCatalogProducts, getDetalleCatalogo, updateDetalleCatalogo, updateDetalleCatalogoImg,
  uploadDocs, uploadDocumentoProducto, getDocumentoProducto
};

const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para guardar archivos en el servidor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/assets/image/img_pz/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT 
  p.id_prod,              
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

  -- Sumar correctamente el stock en almacenamiento
  COALESCE(ua.cant_stock, 0) AS stock_almacen,

  -- Sumar correctamente el stock en picking
  COALESCE(u.cant_stock_real, 0) AS stock_picking,

  -- Calcular el total como la suma de ambos
  COALESCE(ua.cant_stock, 0) + COALESCE(u.cant_stock_real, 0) AS stock_total
FROM productos p

-- Unión con almacenamiento
LEFT JOIN (
  SELECT 
    code_prod, 
    SUM(CAST(cant_stock AS SIGNED)) AS cant_stock
  FROM ubi_alma
  GROUP BY code_prod
) ua ON p.codigo_pro = ua.code_prod

-- Unión con picking
LEFT JOIN (
  SELECT 
    code_prod, 
    SUM(cant_stock_real) AS cant_stock_real
  FROM ubicaciones
  GROUP BY code_prod
) u ON p.codigo_pro = u.code_prod

-- Agrupar por producto
GROUP BY 
  p.id_prod,              
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
  p.peso_master;
`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
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
    clave,
    inventario,
    inv_m,
    inv_i,
    inv_p,
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
    compararYRegistrarCambio('clave', existingProduct.clave, clave);
    compararYRegistrarCambio('inventario', existingProduct.inventario, inventario);
    compararYRegistrarCambio('inv_m', existingProduct.inv_m, inv_m);
    compararYRegistrarCambio('inv_i', existingProduct.inv_i, inv_i);
    compararYRegistrarCambio('inv_p', existingProduct.inv_p, inv_p);
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


module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct, getAllProductsUbi, getVoluProducts, updateVolumetria, upload , getStockTotal};

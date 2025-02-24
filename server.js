const express = require('express');
const mysql = require('mysql2/promise');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 3003;
const server = http.createServer(app);
const io = socketIo(server);
const moment = require('moment');

app.use(express.json());

const connectToDatabase = async () => {
  return mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'savawms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}; 

let db;
const initDBConnection = async () => {
  db = await connectToDatabase();
};
initDBConnection();

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  sendUpdatedPedidosData(socket);

  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


const sendUpdatedPedidosData = async () => {
  const pedidos = await getPedidosData();
  io.emit('pedidos', pedidos);
};


const getPedidosData = async () => {
  const connection = await db.getConnection();
  const query = `
    SELECT
      p.id_pedi,
      p.pedido,
      p.tipo,
      p.codigo_ped,
      p.cantidad,
      p.cant_surti,
      p.cant_no_env,
      p.um,
      p.ubi_bahia,
      p.estado,
      p.registro_surtido,
      us.role AS usuario,
      u.cant_stock,
      u.ubi,
      u.pasillo,
      prod.des,
      prod.code_pz,
      prod.code_pq,
      prod.code_inner,
      prod.code_master,
      prod._pz,
      prod._inner,
      prod._pq,
      prod._master
    FROM pedido_surtido p
    LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
    LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod
    LEFT JOIN usuarios us ON p.id_usuario = us.id_usu
    WHERE p.estado = 'S'
      AND prod.des IS NOT NULL
    GROUP BY p.id_pedi
    ORDER BY u.ubi ASC;
  `;

  try {
    const [result] = await db.query(query);

    const groupedByPedido = {};

    result.forEach(row => {
      const pedido = row.pedido;
      const tipo = row.tipo;
      const usuario = row.usuario;
      const registro_surtido =  moment(row.registro_surtido).format('YYYY-MM-DD HH:mm:ss');

      if (!groupedByPedido[pedido]) {
        groupedByPedido[pedido] = {
          tipo,
          usuario,
          jaula: "No",
          registro_surtido,
          productos: []
        };
      }

      if (row.pasillo === "AV") {
        groupedByPedido[pedido].jaula = "Si";
      }

      if (row.cant_stock !== null) {
        const existingProductIndex = groupedByPedido[pedido].productos.findIndex(product => product.codigo_ped === row.codigo_ped);

        if (existingProductIndex === -1) {
          const totalQuantity = row.cantidad;
          groupedByPedido[pedido].productos.push({
            identifi: row.id_pedi,
            codigo_ped: row.codigo_ped,
            quantity: row.cantidad,
            allquantity: totalQuantity,
            cant_surti: row.cant_surti,
            cant_no_env: row.cant_no_env,
            _master: row._master,
            _inner: row._inner,
            _pz: row._pz,
            _pq: row._pq,
            code_inner: row.code_inner,
            code_master: row.code_master,
            code_pz: row.code_pz,
            code_pq: row.code_pq,
            peackinglocation: row.ubi_bahia,
            estado: row.estado,
            name: row.des,
            barcode: row.code_pz,
            stockpeak: row.cant_stock,
            location: row.ubi,
            pasillo: row.pasillo,
            um: row.um
          });
        }
      }
    });

    for (const pedido in groupedByPedido) {
      if (groupedByPedido.hasOwnProperty(pedido)) {
        const productosPedido = groupedByPedido[pedido].productos;
        const productosConsolidados = [];

        productosPedido.forEach(producto => {
          const cantidadRestante = producto.allquantity - (producto.cant_surti || 0);

          if (producto.cant_surti === producto.allquantity || (producto.cant_surti !== 0 && producto.cant_no_env !== 0)) {
            productosConsolidados.push({
              ...producto,
              um: producto.um,
              quantity: producto.allquantity,
              total: producto._pz,
              barcode: producto.code_pz
            });
          }

          if (cantidadRestante > 0 || producto.cant_surti === producto.allquantity) {
            if (!producto._inner && !producto._master) {
              const pzCompletos = Math.min(Math.floor(cantidadRestante / producto._pz), producto.quantity);
              if (pzCompletos > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: producto.um,
                  quantity: pzCompletos,
                  total: producto._pz,
                  barcode: producto.code_pz
                });
              }
            } else if (!producto._inner) {
              const mastersCompletos = Math.min(Math.floor(cantidadRestante / producto._master), producto.quantity);
              const piezasSueltas = cantidadRestante % producto._master;
              const cajapz = Math.min(Math.floor(piezasSueltas / producto._pz), producto.quantity);

              if (mastersCompletos > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: 'MASTER',
                  quantity: mastersCompletos,
                  total: producto._master,
                  barcode: producto.code_master
                });
              }

              if (piezasSueltas > 0 && cajapz > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: producto.um,
                  quantity: cajapz,
                  total: producto._pz || producto._pq,  // Si no hay pz, usa pq
                  barcode: producto.code_pz || producto.code_pq
                });
              }
            } else if (!producto._master) {
              const innersCompletos = Math.min(Math.floor(cantidadRestante / producto._inner), producto.quantity);
              const piezasSueltas = cantidadRestante % producto._inner;
              const cajapz = Math.min(Math.floor(piezasSueltas / producto._pz), producto.quantity);

              if (innersCompletos > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: 'INNER',
                  quantity: innersCompletos,
                  total: producto._inner,
                  barcode: producto.code_inner
                });
              }

              if (piezasSueltas > 0 && cajapz > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: producto.um,
                  quantity: cajapz,
                  total: producto._pz || producto._pq,  // Si no hay pz, usa pq
                  barcode: producto.code_pz || producto.code_pq
                });
              }
            } else {
              if (producto._master && producto._inner && producto._pq && producto._pz) {
                const mastersCompletos = Math.min(Math.floor(cantidadRestante / producto._master), producto.quantity);
                const innersCompletos = Math.min(Math.floor((cantidadRestante % producto._master) / producto._inner), producto.quantity - mastersCompletos);
                const pqCompletos = Math.min(Math.floor((cantidadRestante % producto._inner) / producto._pq), producto.quantity - (mastersCompletos + innersCompletos));
                const piezasSueltas = cantidadRestante - (mastersCompletos * producto._master) - (innersCompletos * producto._inner) - (pqCompletos * producto._pq);

                if (mastersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: 'MASTER',
                    quantity: mastersCompletos,
                    total: producto._master,
                    barcode: producto.code_master
                  });
                }

                if (innersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: 'INNER',
                    quantity: innersCompletos,
                    total: producto._inner,
                    barcode: producto.code_inner
                  });
                }

                if (pqCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: 'PQ',
                    quantity: pqCompletos,
                    total: producto._pq,
                    barcode: producto.code_pq
                  });
                }

                if (piezasSueltas > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: producto.um,
                    quantity: piezasSueltas,
                    total: producto._pz,
                    barcode: producto.code_pz
                  });
                }
              } else {
                const mastersCompletos = Math.min(Math.floor(cantidadRestante / producto._master), producto.quantity);
                const innersCompletos = Math.min(Math.floor((cantidadRestante % producto._master) / producto._inner), producto.quantity - mastersCompletos);
                const piezasSueltas = cantidadRestante - (mastersCompletos * producto._master) - (innersCompletos * producto._inner);
                const cajapz = Math.min(Math.floor(piezasSueltas / producto._pz), producto.quantity);

                if (mastersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: 'MASTER',
                    quantity: mastersCompletos,
                    total: producto._master,
                    barcode: producto.code_master
                  });
                }

                if (innersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: 'INNER',
                    quantity: innersCompletos,
                    total: producto._inner,
                    barcode: producto.code_inner
                  });
                }

                if (piezasSueltas > 0 && cajapz > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: producto.um,
                    quantity: cajapz,
                    total: producto._pz,
                    barcode: producto.code_pz
                  });
                }
              }
            }
          }
        });

        groupedByPedido[pedido].productos = productosConsolidados.filter(producto => {
          return !(producto.quantity === 0 && producto.cant_surti === 0 && producto.cant_no_env === 0);
        });
      }
    }

    return groupedByPedido;
  } catch (error) {
    throw new Error('Error al obtener los pedidos');
  }
  finally {
    connection.release(); // Libera la conexión siempre
}
};


// Función asíncrona para obtener información de los pedidos
const getPedidos = async (req, res) => {
  try {
    const pedidos = await getPedidosData();
    //console.log("get", pedidos)
    res.json(pedidos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

app.get("/api/pedidos", getPedidos);


app.put("/actualizarCantidadSurtida", async (req, res) => {
  console.log("Request received:", req.body);

  const {
      pedido: pedidoId,
      producto: id_pedi,
      cantumsurt: cant_des,
      cant_no_env,
      um,
      usuarioS
  } = req.body;

  const cant_surti_um = 1;

  const updateQueries = {
    PZ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    pz: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    BL: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    ATADO: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    JG: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    CJ: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;",
    PQ: "UPDATE pedido_surtido SET _pq = _pq + ? WHERE pedido = ? AND id_pedi = ?;",
    INNER: "UPDATE pedido_surtido SET _inner = _inner + ? WHERE pedido = ? AND id_pedi = ?;",
    MASTER: "UPDATE pedido_surtido SET _master = _master + ? WHERE pedido = ? AND id_pedi = ?;",
    PQTE: "UPDATE pedido_surtido SET _pz = _pz + ? WHERE pedido = ? AND id_pedi = ?;"
  };

  const updatePedidoQuery = `
      UPDATE pedido_surtido 
      SET cant_surti = cant_surti + ?, 
          id_usuario_surtido = ?,  
          inicio_surtido = IF(inicio_surtido IS NULL, NOW(), inicio_surtido)
      WHERE pedido = ? AND id_pedi = ? AND cant_surti < cantidad;
  `;

  const validateAndUpdateStockQuery = `
      SELECT ps.cant_surti, ps.cant_no_env, ps.cantidad, ps.codigo_ped, u.cant_stock_real 
      FROM pedido_surtido ps
      JOIN ubicaciones u ON ps.codigo_ped = u.code_prod
      WHERE ps.pedido = ? AND ps.id_pedi = ?;
  `;

  const updateStockQuery = `
      UPDATE ubicaciones 
      SET cant_stock_real = cant_stock_real - ? 
      WHERE code_prod = ?;
  `;

  const updateCheckSurtidoQuery = `
      UPDATE pedido_surtido 
      SET check_surtido = 'SI'
      WHERE pedido = ? AND id_pedi = ?;
  `;

  const updateUmQuery = updateQueries[um];

  if (!updateUmQuery) {
      return res.status(400).send("Unidad de medida no soportada");
  }

  const connection = await db.getConnection();
  try {
      await connection.beginTransaction();

      // Actualizar `cant_surti`
      const [resultPedido] = await connection.query(updatePedidoQuery, [cant_des, usuarioS, pedidoId, id_pedi]);

      if (resultPedido.affectedRows > 0) {
          // Actualizar unidad de medida (UM)
          await connection.query(updateUmQuery, [cant_surti_um, pedidoId, id_pedi]);

          // Validar cantidades después de actualizar
          const [rows] = await connection.query(validateAndUpdateStockQuery, [pedidoId, id_pedi]);

          if (rows.length > 0) {
              const { cant_surti, cant_no_env, cantidad, codigo_ped, cant_stock_real } = rows[0];

              console.log("Datos obtenidos para validación:", {
                  cant_surti,
                  cant_no_env,
                  cantidad,
                  codigo_ped,
                  cant_stock_real
              });

              // Si `cant_surti + cant_no_env` es igual a `cantidad`, actualizar `cant_stock_real`
              if (cant_surti + (cant_no_env || 0) === cantidad) {
                  console.log("Actualizando cant_stock_real para code_prod:", codigo_ped);
                  await connection.query(updateStockQuery, [cant_des, codigo_ped]);

                  // Actualizar el campo `check_surtido` a 'SI'
                  console.log("Actualizando check_surtido para pedido:", pedidoId);
                  await connection.query(updateCheckSurtidoQuery, [pedidoId, id_pedi]);
              }
          } else {
              console.warn("No se encontraron filas para validar.");
          }
      } else {
          console.warn("No rows affected for cant_surti update. Check your conditions.");
      }

      await connection.commit();
      res.status(200).json({ message: "Cantidad surtida y estado actualizados correctamente" });
  } catch (transactionError) {
      await connection.rollback();
      console.error("Error en la transacción:", transactionError);
      res.status(500).send("Error en la transacción");
  } finally {
      connection.release();
  }
});

app.get("/verificarProductosEscaneados", async (req, res) => {
  console.log("Verificación de productos escaneados para el pedido:", req.query.pedidoId);
  const { pedidoId } = req.query;

  const verificarProductosQuery = `
      SELECT COUNT(*) as totalPendientes 
      FROM pedido_surtido 
      WHERE pedido = ? 
      AND cant_surti < cantidad 
      AND cant_no_env = 0;
  `;

  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(verificarProductosQuery, [pedidoId]);

    if (rows[0].totalPendientes === 0) {
      // Todos los productos han sido escaneados completamente
      res.status(200).json({ todosEscaneados: true });
    } else {
      // Aún hay productos pendientes de escanear
      res.status(200).json({ todosEscaneados: false });
    }
  } catch (error) {
    console.error("Error al verificar productos escaneados:", error);
    res.status(500).send("Error al verificar productos escaneados");
  } finally {
    connection.release();
  }
});

app.put("/api/pedidos/actualizar-estado", async (req, res) => {
  console.log(req.body);
  const { pedidoId, productoId } = req.body;
  const nuevoEstado = "B";

  // Consulta para actualizar el estado y fin_surtido solo si las condiciones se cumplen
  const updateQuery = `
    UPDATE pedido_surtido 
    SET estado = ?, fin_surtido = NOW() 
    WHERE id_pedi = ? 
    AND (cant_surti = cantidad OR (cant_surti = 0 AND cant_no_env = cantidad))
  `;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [updateResult] = await connection.query(updateQuery, [nuevoEstado, productoId]);

    // Solo procede si se ha actualizado al menos un registro
    if (updateResult.affectedRows > 0) {
      const totalQuery = "SELECT COUNT(*) AS total FROM pedido_surtido WHERE pedido = ?";
      const [totalResults] = await connection.query(totalQuery, [pedidoId]);
      const totalProducts = totalResults[0].total;

      const countBQuery = "SELECT COUNT(*) AS count FROM pedido_surtido WHERE pedido = ? AND estado = ?";
      const [countBResults] = await connection.query(countBQuery, [pedidoId, nuevoEstado]);
      const countB = countBResults[0].count;

      if (countB === totalProducts) {
        const queryBahia = "UPDATE bahias SET estado = 2 WHERE id_pdi = ?";
        await connection.query(queryBahia, [pedidoId]);
      }

      await connection.commit();
      res.json({ message: "Estado del pedido actualizado exitosamente" });
    } else {
      // Si no se actualizó ningún registro, no se hace commit y se informa al usuario
      await connection.rollback();
      res.status(400).json({ message: "No se cumplieron las condiciones para actualizar el estado del pedido" });
    }
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    connection.release();
  }
});

app.put("/actualizarCantidadNoSurtida", async (req, res) => {
  console.log('Faltante', req.body);
  const { pedido, producto, motivo } = req.body;  // Añadir el motivo al destructuring
  const estado = "B";

  const selectQuery = "SELECT cantidad, cant_surti FROM pedido_surtido WHERE pedido=? AND id_pedi=?";
  const updateQuery = "UPDATE pedido_surtido SET cant_no_env=?, motivo=?, inicio_surtido=IF(inicio_surtido IS NULL, NOW(), inicio_surtido), fin_surtido=IF(fin_surtido IS NULL, NOW(), fin_surtido), estado=? WHERE pedido=? AND id_pedi=?";

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [results] = await connection.query(selectQuery, [pedido, producto]);
    if (results.length === 0) {
      res.status(404).send("Pedido no encontrado");
      return;
    }

    const { cantidad, cant_surti } = results[0];
    const cant_no_env = cantidad - cant_surti;

    await connection.query(updateQuery, [cant_no_env, motivo, estado, pedido, producto]);  // Añadir motivo al query

    await connection.commit();
    res.status(200).json({ message: "Cantidad no surtida actualizada correctamente", cant_no_env });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    connection.release();
  }
});

app.put("/actualizarSurtidoFaltante", async (req, res) => {
  console.log("Reabasto:", req.body);
  const { codigo_pedF: codigo_ped } = req.body;

  // Consulta para obtener `id_ubi` y `ubi` de la tabla `ubicaciones`
  const queryUbicaciones = `
    SELECT id_ubi, ubi 
    FROM ubicaciones 
    WHERE code_prod = ?
  `;

  // Consulta para obtener `id_ubi` y `ubi` de la tabla `ubi_alma`
  const queryUbicacionesAlma = `
    SELECT m.id_ubi, m.ubi, m.code_prod, m.codigo_ubi, m.cant_stock, m.pasillo, m.ingreso, p.des 
    FROM ubi_alma m 
    LEFT JOIN productos p ON m.code_prod = p.codigo_pro 
    WHERE m.code_prod = ? 
    ORDER BY 
        CASE WHEN m.ingreso IS NULL THEN 1 ELSE 0 END, 
        m.ingreso ASC                                 
    LIMIT 1;
  `;
  
  // Consulta `INSERT` para insertar en `tarea_monta` con fecha y hora de inserción automática
  const queryInsert = `
    INSERT INTO tarea_monta (id_codigo, id_ubi_ini, id_ubi_fin, ubi_ini, ubi_fin, estado, ingreso) 
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Consultar la ubicación final desde la tabla `ubicaciones`
    const [resultsUbicaciones] = await connection.query(queryUbicaciones, [codigo_ped]);
    if (resultsUbicaciones.length === 0) {
      throw new Error("No se encontraron ubicaciones en la tabla ubicaciones");
    }
    const ubicacionFin = resultsUbicaciones[0].ubi; // Ubicación `ubi_fin`
    const idUbiFin = resultsUbicaciones[0].id_ubi;  // ID de la ubicación `id_ubi_fin`

    // 2. Consultar la ubicación inicial desde la tabla `ubi_alma`
    const [resultsUbicacionesAlma] = await connection.query(queryUbicacionesAlma, [codigo_ped]);
    let ubicacionIni, idUbiIni, estado;

    if (resultsUbicacionesAlma.length === 0) {
      // Si no hay datos en `ubi_alma`, usar valores predeterminados y estado "I"
      ubicacionIni = "Sin ubicación";  // Valor predeterminado para `ubi_ini`
      idUbiIni = null;                 // Valor nulo para `id_ubi_ini`
      estado = "I";                    // Estado alternativo
    } else {
      // Si se encuentran datos en `ubi_alma`, usar los valores obtenidos y estado "R"
      ubicacionIni = resultsUbicacionesAlma[0].ubi;
      idUbiIni = resultsUbicacionesAlma[0].id_ubi;
      estado = "R";
    }

    // 3. Insertar en `tarea_monta` con los valores configurados y la fecha/hora actual
    await connection.query(queryInsert, [
      codigo_ped, idUbiIni, idUbiFin, ubicacionIni, ubicacionFin, estado
    ]);

    await connection.commit();
    res.status(200).json({ message: "Tarea Asignada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    connection.release();
  }
});


app.get('/embarques', async (req, res) => {
  const query = `
    SELECT
  p.id_pedi,
  p.tipo,
  p.pedido,
  p.codigo_ped,
  prod.des,
  p.cantidad,
  p.cant_surti,
  p.cant_no_env,
  p._pz AS pz,
  p._pq AS pq,
  p._inner AS inne,
  p._master AS maste,
  p.v_pz,
  p.v_pq,
  p.v_inner,
  p.v_master,
  p.um,
  p.caja,
  us.role AS usuario,
  prin.mac_print,
  p.ubi_bahia, 
  p.estado,
  prod.code_pz,
  prod.code_pq,
  prod.code_inner,
  prod.code_master,  
  prod._pz,
  prod._inner,
  prod._pq,
  prod._master,
  caja_info.ultima_caja,
  caja_info.total_cajas
FROM 
  pedido_embarque p
LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
LEFT JOIN usuarios us ON p.id_usuario_paqueteria = us.id_usu
LEFT JOIN prints prin ON p.id_usuario_paqueteria = prin.id_usu
LEFT JOIN (
  SELECT pedido, MAX(caja) AS ultima_caja, COUNT(DISTINCT caja) AS total_cajas
  FROM pedido_embarque
  WHERE caja IS NOT NULL
  GROUP BY pedido
) AS caja_info ON p.pedido = caja_info.pedido
WHERE p.estado = 'E';

  `;

  try {
    const [results] = await db.query(query);

    const groupedResults = results.reduce((acc, row) => {
      if (!acc[row.pedido]) {
        acc[row.pedido] = {
          pedido: row.pedido,
          tipo: row.tipo,
          ubi_bahia: row.ubi_bahia,
          usuario: row.usuario,
          mac_print: row.mac_print,
          ultima_caja: row.ultima_caja,
          total_cajas: row.total_cajas,
          datos: []
        };
      }

      acc[row.pedido].datos.push({
        id_pedi: row.id_pedi,
        codigo_ped: row.codigo_ped,
        des: row.des,
        cantidad: row.cantidad,
        cant_surti: row.cant_surti,
        cant_no_env: row.cant_no_env,
        pz: row.pz,
        pq: row.pq,
        inne: row.inne,
        maste: row.maste,
        v_pz: row.v_pz,
        v_pq: row.v_pq,
        v_inner: row.v_inner,
        v_master: row.v_master,
        um: row.um,
        caja: row.caja,
        estado: row.estado,
        code_pz: row.code_pz,
        code_pq: row.code_pq,
        code_inner: row.code_inner,
        code_master: row.code_master,
        _pz: row._pz,
        _inner: row._inner,
        _pq: row._pq,
        _master: row._master
      });

      return acc;
    }, {});

    const response = Object.values(groupedResults);
    res.json(response);
  } catch (error) {
    console.error('Error al obtener los datos de embarques:', error);
    res.status(500).json({ error: 'Error al obtener los datos de embarques' });
  }
});

app.put('/actualizarProducto', (req, res) => {
 // console.log("Verifemb",req.body);
  const { idPedi, scannedPz, scannedPq, scannedInner, scannedMaster, caja } = req.body;

  const query = `
    UPDATE pedido_embarque
    SET 
      v_pz = ?, 
      v_pq = ?, 
      v_inner = ?, 
      v_master = ?, 
      caja = ?, 
      inicio_embarque = IF(inicio_embarque IS NULL, NOW(), inicio_embarque)
    WHERE id_pedi = ?;`;

  db.query(query, [scannedPz, scannedPq, scannedInner, scannedMaster, caja, idPedi], (err, result) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
    res.json({ message: 'Producto actualizado correctamente' });
  });
});

app.put("/actualizarEmbarque", async (req, res) => {
  console.log("finemb", req.body);
  const { pedido } = req.body;
  const estado = "F";

  // Corrección de la consulta SQL
  const updatePedidoQuery = `UPDATE pedido_embarque 
                             SET estado = ?, 
                                 fin_embarque = IF(fin_embarque IS NULL, NOW(), fin_embarque) 
                             WHERE pedido = ?`;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(updatePedidoQuery, [estado, pedido]);

    await connection.commit();
    res.status(200).json({ message: "Cantidad surtida actualizada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    connection.release();
  }
});

app.put("/actualizarBahiaEmbarque", async (req, res) => {
  console.log("UPDT-BHIA",req.body);
  const { pedido } = req.body;
  const updateBahiasQuery = "UPDATE bahias SET id_pdi=NULL, estado=NULL WHERE id_pdi=?";

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(updateBahiasQuery, [pedido]);

    await connection.commit();
    res.status(200).json({ message: "Cantidad surtida actualizada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    connection.release();
  }
});

/******montas******/

app.get('/reabastecimiento', async (req, res) => {
  const query = `
  SELECT 
    m.id_mon,
    m.id_codigo,
    m.ubi_ini,
    m.ubi_fin,
    m.id_ubi_ini,  
    m.id_ubi_fin,
    m.ingreso,
    p.des,
    u.cant_stock
FROM tarea_monta m
LEFT JOIN productos p ON m.id_codigo = p.codigo_pro
LEFT JOIN ubi_alma u ON u.code_prod = m.id_codigo 
WHERE m.estado = "R"
  AND m.ubi_fin IS NOT NULL
  AND m.ingreso >= CURDATE();  
  `;

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los datos de reabastecimiento:', error);
    res.status(500).json({ error: 'Error al obtener los datos de reabastecimiento' });
  }
});
// app.put("/actualizarTareaMonta", async (req, res) => {

//   console.log(req.body);
//   const { idMon, cantidad, ubi_ini, ubi_fin } = req.body;
//   const estado = "S";

//   const updatePedidoQuery = "UPDATE tarea_monta SET estado=? WHERE id_mon=?";
//   const updateUbiQuery = "UPDATE ubicaciones SET cant_stock = cant_stock + ? WHERE ubi =?";
//   const updateAlmaQuery = "UPDATE ubi SET cantidad = cantidad - ? WHERE ubi = ?";

//   const connection = await db.getConnection()
//   try {
//     await connection.beginTransaction();

//     await connection.query(updatePedidoQuery, [estado, idMon]);
//     await connection.query(updateUbiQuery, [cantidad, ubi_ini]);
//     await connection.query(updateAlmaQuery, [cantidad, ubi_fin]);

//     await connection.commit();
//     res.status(200).json({ message: "Cantidad surtida actualizada correctamente" });
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error en la transacción:", error);
//     res.status(500).send("Error en la transacción");
//   } finally {
//     connection.release();
//   }
// });




//hh}

app.put("/actualizarTareaMonta", async (req, res) => {
  console.log(req.body); // Para verificar el dato recibido
  const { idMon } = req.body;
  const estado = "S"; // Nuevo estado de la tarea

  // Queries SQL
  const updatePedidoQuery = "UPDATE tarea_monta SET estado = ? WHERE id_mon = ?";
  const selectUbicacionesQuery = "SELECT id_ubi_ini, id_ubi_fin FROM tarea_monta WHERE id_mon = ?";
  const selectUbiAlmaQuery = "SELECT code_prod, cant_stock, lote, almacen FROM ubi_alma WHERE id_ubi = ?";
  const updateUbicacionesQuery = "UPDATE ubicaciones SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ? WHERE id_ubi = ?";
  const clearUbiAlmaQuery = "UPDATE ubi_alma SET code_prod = NULL, cant_stock = NULL, lote = NULL, almacen = NULL WHERE id_ubi = ?";

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Actualizar el estado de la tarea en `tarea_monta`
    await connection.query(updatePedidoQuery, [estado, idMon]);

    // 2. Obtener id_ubi_ini y id_ubi_fin para el idMon dado
    const [ubicacionesResults] = await connection.query(selectUbicacionesQuery, [idMon]);
    const { id_ubi_ini, id_ubi_fin } = ubicacionesResults[0];

    // 3. Obtener datos de `code_prod`, `cant_stock`, `lote`, `almacen` en `ubi_alma` para id_ubi_ini
    const [ubiAlmaResults] = await connection.query(selectUbiAlmaQuery, [id_ubi_ini]);
    const { code_prod, cant_stock, lote, almacen } = ubiAlmaResults[0];

    // 4. Actualizar los datos obtenidos en la tabla `ubicaciones` donde `id_ubi` es `id_ubi_fin`
    await connection.query(updateUbicacionesQuery, [code_prod, cant_stock, lote, almacen, id_ubi_fin]);

    // 5. Poner en NULL los campos de `ubi_alma` para `id_ubi_ini`, excepto `ubi`
    await connection.query(clearUbiAlmaQuery, [id_ubi_ini]);

    await connection.commit();
    res.status(200).json({ message: "Tarea actualizada correctamente y ubi_alma procesada" });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).send("Error en la transacción");
  } finally {
    connection.release();
  }
});

app.post("/realizarMovimiento", async (req, res) => {
  const { id_ubi, ubicacion_final, codigo_almacen } = req.body;
  console.log("Movimientosxd", req.body);

  if (!id_ubi || !ubicacion_final || !codigo_almacen) {
    console.log("Datos recibidos en la solicitud:", req.body);
    return res.status(400).json({ error: "Faltan datos necesarios para realizar el movimiento" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Consulta los datos de la primera ubicación usando el `id_ubi`
    const [result] = await connection.query(
      "SELECT code_prod, cant_stock, lote, pasillo FROM ubi_alma WHERE id_ubi = ?", 
      [id_ubi]
    );

    if (result.length === 0) {
      throw new Error("No se encontró la ubicación original.");
    }

    const { code_prod, cant_stock, lote, pasillo } = result[0];

    if (codigo_almacen === '7050') {
      // Caso para el almacén 7050: Actualizar o insertar en la tabla ubicaciones
      const [ubicacionExistente] = await connection.query(
        "SELECT id_ubi, cant_stock_real FROM ubicaciones WHERE ubi = ?",
        [ubicacion_final]
      );

      if (ubicacionExistente.length > 0) {
        // Si la ubicación ya existe, incrementar el `cant_stock`
        const { id_ubi: idUbiExistente, cant_stock: cantStockActual } = ubicacionExistente[0];
        await connection.query(
          "UPDATE ubicaciones SET cant_stock_real = ?, code_prod = ?, lote = ?, almacen = ? WHERE id_ubi = ?",
          [cantStockActual + cant_stock, code_prod, lote, codigo_almacen, idUbiExistente]
        );
      } else {
        // Si la ubicación no existe, insertar un nuevo registro
        await connection.query(
          "INSERT INTO ubicaciones (ubi, code_prod, cant_stock_real, pasillo, lote, almacen) VALUES (?, ?, ?, ?, ?, ?)",
          [ubicacion_final, code_prod, cant_stock, pasillo, lote, codigo_almacen]
        );
      }
    } else if (codigo_almacen === '7238') {
      // Caso para el almacén 7238: Inserta en maquila_interna
      await connection.query(
        "INSERT INTO maquila_interna (ubi, code_prod, cant_stock, pasillo, almacen_entrada) VALUES (?, ?, ?, ?, ?)",
        [ubicacion_final, code_prod, cant_stock, pasillo, codigo_almacen]
      );
    } else if (codigo_almacen === '7150') {
      // Caso para el almacén 7150: Movimiento dentro de ubi_alma
      const [updateResult] = await connection.query(
        "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ?, ingreso = NOW() WHERE ubi = ?",
        [code_prod, cant_stock, lote, codigo_almacen, ubicacion_final]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("No se encontró la ubicación final para actualizar en ubi_alma.");
      }
    } else {
      // Otros casos: Movimiento genérico en ubi_alma
      const [updateResult] = await connection.query(
        "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ? WHERE ubi = ?",
        [code_prod, cant_stock, lote, codigo_almacen, ubicacion_final]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("No se encontró la ubicación final para actualizar.");
      }
    }

    // Limpia los datos de la ubicación original (`ubi_alma`)
    await connection.query(
      "UPDATE ubi_alma SET code_prod = NULL, cant_stock = NULL, lote = NULL, almacen = NULL WHERE id_ubi = ?",
      [id_ubi]
    );

    await connection.commit();
    res.status(200).json({ message: "Movimiento realizado exitosamente." });
  } catch (error) {
    await connection.rollback();
    console.error("Error en el movimiento:", error.message);
    res.status(500).json({ error: "Error al realizar el movimiento: " + error.message });
  } finally {
    connection.release();
  }
});

app.put("/actualizarRecibo", async (req, res) => {
  const { codigo, cantidad, idRecibo, ubicacion, id_usario } = req.body;
  console.log("updatetarima", req.body);

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Consulta para obtener los datos de recibo_compras
    const [reciboCompra] = await connection.query(
      "SELECT pedimento, almacen7050, almacen7066, cantidad7050, cantidad7066 FROM recibo_compras WHERE id_recibo = ?",
      [idRecibo]
    );

    if (reciboCompra.length === 0) {
      connection.release();
      return res.status(404).json({ error: "No se encontró el recibo en recibo_compras" });
    }

    const { pedimento } = reciboCompra[0];

    // Consulta la ubicación para verificar si está ocupada
    const [ubicacionExistente] = await connection.query(
      "SELECT cant_stock, code_prod FROM ubi_alma WHERE ubi = ?",
      [ubicacion]
    );

    if (ubicacionExistente.length > 0) {
      // Si la ubicación ya tiene un stock y un código de producto, está ocupada
      if (ubicacionExistente[0].cant_stock && ubicacionExistente[0].code_prod) {
        console.log("Error: La ubicación está ocupada en el sistema.");
        connection.release();
        return res.status(400).json({
          message: "La ubicación está ocupada en el sistema, favor de corroborar con inventarios.",
        });
      }

      // Si la ubicación está registrada pero vacía, la actualizamos
      const updateUbicacionQuery = `
        UPDATE ubi_alma 
        SET cant_stock = ?, 
            lote = ?, 
            code_prod = ?,
            codigo_ingreso = ?, 
            ingreso = NOW()
        WHERE ubi = ?
      `;
      await connection.query(updateUbicacionQuery, [
        cantidad,
        pedimento,
        codigo,
        id_usario,  // <--- Este es el parámetro para "codigo_ingreso"
        ubicacion,  // <--- Este es el parámetro para "WHERE ubi = ?"
      ]);
    }

    // Actualiza la cantidad_ubicada en la tabla recibo_cedis
    const updateReciboQuery = `
      UPDATE recibo_cedis 
      SET cantidad_ubicada = cantidad_ubicada - ? 
      WHERE id_recibo = ? 
    `;
    await connection.query(updateReciboQuery, [cantidad, idRecibo]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Datos actualizados correctamente" });
  } catch (error) {
    console.error("Error en la transacción:", error);
    await db.rollback(); // Revertir transacción en caso de error
    res.status(500).json({ error: "Ocurrió un error al actualizar los datos" });
  }
});

app.post("/api/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const query = "SELECT * FROM usuarios WHERE email = ? AND password = ? LIMIT 1"; // Limitamos el resultado

  try {
    const [results] = await db.query(query, [username, password]);

    if (results.length === 0) {
      return res.status(401).send("Credenciales incorrectas");
    }

    const userData = {
      name: results[0].name,
      role: results[0].role,
      id_usu: results[0].id_usu,
    };
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
    res.status(500).send("Error interno del servidor");
  }
});


app.post("/consultaUbicaciones", async (req, res) => {
  console.log("Consulta de ubicaciones:", req.body);
  const { codigo_pro } = req.body;

  if (!codigo_pro) {
    return res.status(400).json({ error: "codigo_pro es requerido" });
  }

  const query = `
    SELECT 
      prod.des,    
      u.ubi,         
      u.cant_stock 
    FROM ubi_alma u
    LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
    WHERE u.code_prod = ?;
  `;

  const connection = await db.getConnection();
  try {
    // Ejecutar la consulta
    const [results] = await connection.query(query, [codigo_pro]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Estructura la respuesta con encabezado y lista de ubicaciones
    const response = {
      descripcion: results[0].des, // Encabezado con la descripción del producto
      ubicaciones: results.map(row => ({
        ubicacion: row.ubi,
        cantidad_stock: row.cant_stock
      }))
    };

    res.status(200).json(response); // Retornar la respuesta estructurada
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).send("Error en la consulta");
  } finally {
    connection.release();
  }
});

app.post("/movimientosUbicacion", async (req, res) => {
  console.log("Consulta de ubicación específica:", req.body);
  const { ubicacion } = req.body;

  if (!ubicacion) {
    return res.status(400).json({ error: "La ubicación es requerida" });
  }

  const query = `
    SELECT 
      u.id_ubi,
      prod.des,    
      u.ubi, 
      u.code_prod,     
      u.cant_stock 
    FROM ubi_alma u
    LEFT JOIN productos prod ON u.code_prod = prod.codigo_pro
    WHERE u.ubi = ?;
  `;

  const connection = await db.getConnection();
  try {
    // Ejecutar la consulta
    const [results] = await connection.query(query, [ubicacion]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    // Estructura la respuesta con los datos de la ubicación
    const response = {
      id_ubicacion: results[0].id_ubi,
      descripcion: results[0].des,
      ubicacion: results[0].ubi,
      codigo_producto: results[0].code_prod,
      cantidad_stock: results[0].cant_stock
    };

    res.status(200).json(response); // Retornar la respuesta estructurada
  } catch (error) {
    console.error("Error en la consulta de ubicación:", error);
    res.status(500).send("Error en la consulta de ubicación");
  } finally {
    connection.release();
  }
});

// app.post("/realizarMovimiento", async (req, res) => {
//   const { id_ubi, ubicacion_final, codigo_almacen } = req.body;
//   console.log("Movimientosxd", req.body);

//   if (!id_ubi || !ubicacion_final || !codigo_almacen) {
//     console.log("Datos recibidos en la solicitud:", req.body); 
//     return res.status(400).json({ error: "Faltan datos necesarios para realizar el movimiento" });
//   }

//   const connection = await db.getConnection();
//   try {
//     await connection.beginTransaction();

//     // Consulta los datos de la primera ubicación usando el `id_ubi`
//     const [result] = await connection.query(
//       "SELECT code_prod, cant_stock, lote, ingreso FROM ubi_alma WHERE id_ubi = ?", 
//       [id_ubi]
//     );

//     if (result.length === 0) {
//       throw new Error("No se encontró la primera ubicación.");
//     }

//     const { code_prod, cant_stock, lote, ingreso } = result[0];

//     // Actualiza los datos en la `ubicacion_final` con el `codigo_almacen`
//     const [updateResult] = await connection.query(
//       "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, ingreso = ?, almacen = ? WHERE ubi = ?",
//       [code_prod, cant_stock, lote, ingreso, codigo_almacen, ubicacion_final]
//     );

//     if (updateResult.affectedRows === 0) {
//       throw new Error("No se encontró la ubicación final para actualizar.");
//     }

//     // Limpia los datos de `code_prod`, `cant_stock`, `lote`, y `ingreso` en la ubicación original (`id_ubi`)
//     await connection.query(
//       "UPDATE ubi_alma SET code_prod = NULL, cant_stock = NULL, lote = NULL, ingreso = NULL, almacen = NULL WHERE id_ubi = ?",
//       [id_ubi]
//     );

//     await connection.commit();
//     res.status(200).json({ message: "Movimiento actualizado exitosamente en la ubicación final y datos limpiados en la ubicación original" });
//   } catch (error) {
//     await connection.rollback();
//     res.status(500).json({ error: "Error al realizar el movimiento: " + error.message });
//   } finally {
//     connection.release();
//   }
// });

// app.post("/realizarMovimiento", async (req, res) => {
//   const { id_ubi, ubicacion_final, codigo_almacen } = req.body;
//   console.log("Movimientosxd", req.body);

//   if (!id_ubi || !ubicacion_final || !codigo_almacen) {
//     console.log("Datos recibidos en la solicitud:", req.body);
//     return res.status(400).json({ error: "Faltan datos necesarios para realizar el movimiento" });
//   }

//   const connection = await db.getConnection();
//   try {
//     await connection.beginTransaction();

//     // Consulta los datos de la primera ubicación usando el `id_ubi`
//     const [result] = await connection.query(
//       "SELECT code_prod, cant_stock, lote, pasillo FROM ubi_alma WHERE id_ubi = ?", 
//       [id_ubi]
//     );

//     if (result.length === 0) {
//       throw new Error("No se encontró la ubicación original.");
//     }

//     const { code_prod, cant_stock, lote, pasillo } = result[0];

//     // Actualiza los datos en la ubicación final (`ubi_alma`)
//     const [updateResult] = await connection.query(
//       "UPDATE ubi_alma SET code_prod = ?, cant_stock = ?, lote = ?, almacen = ? WHERE ubi = ?",
//       [code_prod, cant_stock, lote, codigo_almacen, ubicacion_final]
//     );

//     if (updateResult.affectedRows === 0) {
//       throw new Error("No se encontró la ubicación final para actualizar.");
//     }

//     // Si `codigo_almacen` es '7238', insertar datos en `maquila_interna`
//     if (codigo_almacen === '7238') {
//       await connection.query(
//         "INSERT INTO maquila_interna (ubi, code_prod, cant_stock, pasillo, almacen_entrada) VALUES (?, ?, ?, ?, ?)",
//         [ubicacion_final, code_prod, cant_stock, pasillo, codigo_almacen]
//       );
//     }

//     // Limpia los datos de `code_prod`, `cant_stock`, y otros en la ubicación original (`ubi_alma`)
//     await connection.query(
//       "UPDATE ubi_alma SET code_prod = NULL, cant_stock = NULL, lote = NULL, almacen = NULL WHERE id_ubi = ?",
//       [id_ubi]
//     );

//     await connection.commit();
//     res.status(200).json({ message: "Movimiento realizado exitosamente, incluyendo inserción en maquila interna si aplica." });
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error en el movimiento:", error.message);
//     res.status(500).json({ error: "Error al realizar el movimiento: " + error.message });
//   } finally {
//     connection.release();
//   }
// });


app.get('/inventory', async (req, res) => { 
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
    WHERE estado IS NULL
  `;

  try {
    const [results] = await db.query(query);

    // Convertir los valores `null` a `0` en cada `item`
    const processedResults = results.map(item => {
      // Recorrer todas las propiedades y asignar 0 si es null
      Object.keys(item).forEach(key => {
        if (item[key] === null) {
          item[key] = (typeof item[key] === 'number') ? 0 : ''; // `0` para números y cadena vacía para strings
        }
      });
      return item;
    });

    // Agrupamos los datos por rol (P{pasillo}S{responsable})
    const organizedData = {};

    processedResults.forEach(item => {
      const { pasillo, responsable, nivel } = item;

      // Generar el rol en el formato P{pasillo}S{responsable}
      const rol = `P${pasillo}S${responsable}`;

      // Si el rol no existe en `organizedData`, lo inicializamos
      if (!organizedData[rol]) {
        organizedData[rol] = {
          rol: rol,
          pasillo: pasillo,
          responsable: responsable,
          ubicaciones: {
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
          }
        };
      }

      // Añadimos la ubicación al nivel correspondiente (1 o 2)
      if (nivel === 1 || nivel === 2 || nivel === 3 || nivel === 4)  {
        organizedData[rol].ubicaciones[nivel].push(item);
      }
    });

    // Ordenamos los datos según los criterios
    const finalData = Object.values(organizedData).map(group => {
      // Ordenar nivel 1 de menor a mayor y nivel 2 de mayor a menor
      group.ubicaciones[1] = group.ubicaciones[1].sort((a, b) => a.ubi.localeCompare(b.ubi));
      group.ubicaciones[2] = group.ubicaciones[2].sort((a, b) => b.ubi.localeCompare(a.ubi));
      group.ubicaciones[3] = group.ubicaciones[3].sort((a, b) => b.ubi.localeCompare(b.ubi));
      group.ubicaciones[4] = group.ubicaciones[4].sort((a, b) => b.ubi.localeCompare(a.ubi));
      group.ubicaciones[5] = group.ubicaciones[5].sort((a, b) => b.ubi.localeCompare(a.ubi));
      
      return group;
    });

    // Enviamos la respuesta organizada en grupos por rol
    res.json(finalData);

  } catch (error) {
    console.error('Error al obtener los datos de inventory:', error);
    res.status(500).json({ error: 'Error al obtener los datos de inventory' });
  }
});

// app.get('/getproductinventory', async (req, res) => {
//   // Consulta SQL para filtrar por cualquiera de los códigos (code_pz, code_inner, code_master)
//   const query = `
//     SELECT 
//       id_prod,
//       codigo_pro,
//       des,
//       _pz,
//       _inner,
//       _master, 
//       _palet,
//       code_pz,
//       code_inner,
//       code_master
//     FROM productos
//     WHERE code_pz = ? OR code_inner = ? OR code_master = ?
//   `;

//   // Obtener el parámetro `codigo` de la consulta
//   const { codigo_pz } = req.query;

//   // Verificar si se proporcionó `codigo`
//   if (!codigo_pz) {
//     return res.status(400).json({ error: 'El parámetro codigo es requerido' });
//   }

//   try {
//     // Ejecutar la consulta con `codigo` como parámetro en las tres columnas
//     const [results] = await db.query(query, [codigo_pz, codigo_pz, codigo_pz]);
//     res.json(results);
//   } catch (error) {
//     console.error('Error al obtener los datos de productos:', error);
//     res.status(500).json({ error: 'Error al obtener los datos de productos' });
//   }
// });



app.post('/updateInventory', (req, res) => {
  const {
    id_ubi,
    estado,
    hora_inicio,
    hora_final,
    codigo,
    pz,
    inner,
    master,
    pallet,
    cantidad,
    manual,
    id_usu
  } = req.body;

  console.log("UpdateInventoty", req.body)

  const query = `
    UPDATE inventory SET
      estado = ?,
      hora_inicio = ?,
      hora_final = ?,
      codigo = ?,
      _pz = ?,
      _inner = ?,
      _master = ?,
      _pallet = ?,
      cantidad = ?,
      manual = ?,
      id_usu = ?
    WHERE id_ubi = ?
  `;

  const values = [
    estado, hora_inicio, hora_final, codigo, pz, inner, master, pallet, cantidad, manual, id_usu, id_ubi
  ];

  db.query(query, values, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Error al actualizar el inventario" });
    }
    res.status(200).json({ message: "Inventario actualizado correctamente" });
  });
});


app.get('/getInventoryByPasillo', async (req, res) => {
  const query = `
    SELECT 
    id_ubi,
      pasillo, 
      nivel, 
      ubi, 
      codigo, 
      cantidad, 
      asignado
    FROM 
      inventoryalma 
    WHERE 
      pasillo IN (1, 2, 3, 4, 5, 6, 7, 8, 21)
    ORDER BY 
      pasillo, 
      nivel, 
      ubi;
  `;

  try {
    // Ejecutar la consulta
    const [results] = await db.query(query);

    // Procesar los datos
    const organizedData = {};

    results.forEach(row => {
      const { pasillo, nivel, ubi, codigo, cantidad, asignado,id_ubi } = row;

      // Inicializar el pasillo si no existe
      if (!organizedData[pasillo]) {
        organizedData[pasillo] = {
          asignado: {
            1: {},
            2: {}
          }
        };
      }

      // Inicializar el asignado si no existe
      if (!organizedData[pasillo].asignado[asignado]) {
        organizedData[pasillo].asignado[asignado] = {};
      }

      // Inicializar el nivel si no existe
      if (!organizedData[pasillo].asignado[asignado][nivel]) {
        organizedData[pasillo].asignado[asignado][nivel] = [];
      }

      // Agregar la fila a la estructura correspondiente
      organizedData[pasillo].asignado[asignado][nivel].push({
        id_ubi,
        ubi,
        codigo,
        cantidad
      });
    });

    // Ordenar los niveles según las reglas específicas
    Object.keys(organizedData).forEach(pasillo => {
      const asignados = organizedData[pasillo].asignado;

      Object.keys(asignados).forEach(asignado => {
        Object.keys(asignados[asignado]).forEach(nivel => {
          // Convertir nivel a número para usarlo en la comparación
          const nivelNum = parseInt(nivel, 10);

          // Aplicar la regla de ordenamiento según el nivel
          if (nivelNum === 2 || nivelNum === 3 || nivelNum === 5 || nivelNum === 7) {
            // Niveles 2, 3, 5, 7: ordenar de menor a mayor
            asignados[asignado][nivel].sort((a, b) => a.ubi.localeCompare(b.ubi));
          } else if (nivelNum === 4 || nivelNum === 6 || nivelNum === 8) {
            // Niveles 4, 6, 8: ordenar de mayor a menor
            asignados[asignado][nivel].sort((a, b) => b.ubi.localeCompare(a.ubi));
          }
        });
      });
    });

    // Enviar los datos organizados
    res.status(200).json(organizedData);
  } catch (error) {
    console.error('Error al obtener los datos de productos:', error);
    res.status(500).json({ error: 'Error al obtener los datos de productos' });
  }
});

app.get('/recibomonta', async (req, res) => {
  const query = `
   SELECT 
    m.id_recibo_compras AS id_recibo,
    m.oc,
    m.codigo,
    m.cantidad_recibida,
    m.cantidad_ubicada,
    v.pieza_tarima,
    p.des
   FROM recibo_cedis m
   LEFT JOIN productos p ON m.codigo = p.codigo_pro
   LEFT JOIN volumetria v ON m.codigo = v.codigo
   WHERE m.est = "I"
     AND m.fecha_recibo >= CURDATE();  
  `;

  try {
    const [results] = await db.query(query);

    const palletsGenerados = [];

    results.forEach(result => {
      const { cantidad_recibida, cantidad_ubicada, pieza_tarima } = result;

      // Cálculo de cantidad pendiente
      const cantidadPendiente = cantidad_recibida - cantidad_ubicada;

      // Verificar si aún queda pendiente
      if (cantidadPendiente > 0) {
        // Cálculo de tarimas completas y sobrante
        const totalPallets = Math.floor(cantidadPendiente / pieza_tarima);
        const restante = cantidadPendiente % pieza_tarima;
        const totalPalletsConRestante = restante > 0 ? totalPallets + 1 : totalPallets;

        // Generar las tarimas completas
        for (let i = 1; i <= totalPallets; i++) {
          palletsGenerados.push({
            id_recibo: result.id_recibo,
            oc: result.oc,
            codigo: result.codigo,
            cantidad_recibida: cantidad_recibida,
            cantidad_ubicada: cantidad_ubicada,
            cantidad_pendiente: cantidadPendiente,
            pallete: `${i}/${totalPalletsConRestante}`,
            pieza_tarima: pieza_tarima,
            des: result.des,
          });
        }

        // Agregar el sobrante como una tarima adicional
        if (restante > 0) {
          palletsGenerados.push({
            id_recibo: result.id_recibo,
            oc: result.oc,
            codigo: result.codigo,
            cantidad_recibida: cantidad_recibida,
            cantidad_ubicada: cantidad_ubicada,
            cantidad_pendiente: cantidadPendiente,
            pallete: `${totalPalletsConRestante}/${totalPalletsConRestante}`,
            pieza_tarima: restante, // El sobrante
            restante: restante,
            des: result.des,
          });
        }
      }
    });

    res.json(palletsGenerados);
  } catch (error) {
    console.error('Error al obtener los datos de reabastecimiento:', error);
    res.status(500).json({ error: 'Error al obtener los datos de reabastecimiento' });
  }
});


app.post('/update_inventory', (req, res) => {
  console.log("Datos recibidos por el servidor:", req.body);

  const { idUbi, codigo, cantidad } = req.body;

  if (!idUbi || !codigo || !cantidad) {
    console.log("Datos faltantes en la solicitud");
    return res.status(400).send({ error: 'Todos los campos son requeridos' });
  }

  const query = `
    UPDATE inventoryalma
    SET codigo = ?, cantidad = ?
    WHERE id_ubi = ?;
  `;

  db.query(query, [codigo, cantidad, idUbi], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).send({ error: 'Error al actualizar la base de datos' });
    }

    if (result.affectedRows === 0) {
      console.log("No se encontró la ubicación para actualizar.");
      return res.status(404).send({ error: 'No se encontró la ubicación' });
    }

    console.log("Actualización exitosa.");
    res.send({ message: 'Actualización exitosa' });
  });
});



// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en http://192.168.3.27:${port}`);
});


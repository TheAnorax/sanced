const express = require('express');
//const mysql = require('mysql');
const mysql = require('mysql2');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 3003;
//const port = 3006;
const server = http.createServer(app);
const io = socketIo(server);


const connectToDatabase = () => {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'savawms',
    connectTimeout: 60000, // Establece el tiempo de espera en milisegundos (por ejemplo, 60 segundos)
  });
};

let db = connectToDatabase(); // Inicia la conexión a la base de datos

// Función para reconectar a la base de datos en caso de desconexión
const handleDisconnect = () => {
  db.on('error', (err) => {
    console.log('Error de conexión a la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Intentando reconectar a la base de datos...');
      db = connectToDatabase();
      handleDisconnect(); // Vuelve a llamar a la función de manejo de desconexión para reconectar en caso de futuras desconexiones
    } else {
      throw err;
    }
  });
};

handleDisconnect();

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Cuando se conecta un cliente, enviamos los datos iniciales
  sendUpdatedPedidosData(socket);

  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Función para enviar datos actualizados a los clientes conectados
const sendUpdatedPedidosData = async () => {
  const pedidos = await getPedidosData();
  io.emit('pedidos', pedidos);
};

const getPedidosData = async () => {
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
    const result = await new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const groupedByPedido = {};

    result.forEach(row => {
      const pedido = row.pedido;
      const tipo = row.tipo;
      const usuario = row.usuario;

      if (!groupedByPedido[pedido]) {
        groupedByPedido[pedido] = {
          tipo,
          usuario,
          jaula: "No", // Por defecto, asume que no hay productos en pasillo AV
          productos: []
        };
      }

      // Verificar si el producto pertenece al pasillo AV
      if (row.pasillo === "AV") {
        groupedByPedido[pedido].jaula = "Si"; // Actualiza a "si" si se encuentra un producto en pasillo AV
      }

      if (row.cant_stock !== null) { // Asegurarse que cant_stock no sea nulo
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
                  total: producto._pz,
                  barcode: producto.code_pz
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
                  total: producto._pz,
                  barcode: producto.code_pz
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

        // Filtrar productos con quantity = 0, cant_surti = 0 y cant_no_env = 0
        groupedByPedido[pedido].productos = productosConsolidados.filter(producto => {
          return !(producto.quantity === 0 && producto.cant_surti === 0 && producto.cant_no_env === 0);
        });
      }
    }

    return groupedByPedido;
  } catch (error) {
    throw new Error('Error al obtener los pedidos');
  }
};



// Función asíncrona para obtener información de los pedidos
const getPedidos = async (req, res) => {
  try {
    const pedidos = await getPedidosData();
    res.json(pedidos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

app.get("/api/pedidos", getPedidos);

const bodyParser = require("body-parser");
app.use(bodyParser.json());


app.put("/actualizarCantidadSurtida", (req, res) => {
  console.log(req.body);
  const pedidoId = req.body.pedido;
  const id_pedi = req.body.producto;
  const cant_surti_um = 1;
  const cant_des = req.body.cantumsurt;
  //const id_usuario = req.body.usuario;
  const um = req.body.um;

  // Utilizamos una transacción para garantizar la consistencia de los datos
  db.beginTransaction(async (error) => {
    if (error) {
      console.error("Error al iniciar transacción:", error);
      res.status(500).send("Error al iniciar transacción");
      return;
    }

    // Definir la consulta de actualización según la unidad de medida
    let updatePedidoQuery = `
    UPDATE pedido_surtido 
    SET cant_surti = cant_surti + ?, 
        inicio_surtido = IF(inicio_surtido IS NULL, NOW(), inicio_surtido)
    WHERE pedido = ? AND id_pedi = ? AND (cant_surti IS NULL OR cant_surti < cantidad);
  `;

   // Declarar la consulta de actualización de forma global
let updatePedidoQueryUm = "";

// Verificar la unidad de medida y asignar las consultas de actualización correspondientes
if (um === "PZ") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _pz = _pz + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
} else if (um === "BL") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _pz = _pz + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
} 
else if (um === "ATADO") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _pz = _pz + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
} 
else if (um === "JG") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _pz = _pz + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
} else if (um === "CJ") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _pz = _pz + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
} else if (um === "PQ") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _pq = _pq + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
}else if (um === "INNER") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _inner = _inner + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
} else if (um === "MASTER") {
  updatePedidoQueryUm = `
  UPDATE pedido_surtido 
  SET _master = _master + ?
  WHERE pedido = ? AND id_pedi = ?;
  `;
}
  // Ejecutar las consultas de actualización dentro de la transacción
db.query(updatePedidoQuery, [cant_des, pedidoId, id_pedi], async (error) => {
  if (error) {
    db.rollback(() => {
      console.error("Error al actualizar el estado del pedido:", error);
      res.status(500).send("Error al actualizar el estado del pedido");
    });
    return;
  }

  // Ejecutar la consulta de actualización correspondiente a la unidad de medida
  db.query(updatePedidoQueryUm, [cant_surti_um, pedidoId, id_pedi], async (error) => {
    if (error) {
      db.rollback(() => {
        console.error("Error al actualizar el estado del pedido:", error);
        res.status(500).send("Error al actualizar el estado del pedido");
      });
      return;
    }




        // Actualizar el stock en ubicaciones
        // const restarStockQuery =
        //   "UPDATE ubicaciones SET cant_stock = cant_stock - ? WHERE code_prod = ?";
        // db.query(restarStockQuery, [cant_des, codigo_ped], (error) => {
        //   if (error) {
        //     db.rollback(() => {
        //       console.error("Error al actualizar el stock en ubicaciones:", error);
        //       res.status(500).send("Error al actualizar el stock en ubicaciones");
        //     });
        //     return;
        //   }

          // Confirmar la transacción
          db.commit((error) => {
            if (error) {
              db.rollback(() => {
                console.error("Error al confirmar transacción:", error);
                res.status(500).send("Error al confirmar transacción");
              });
              return;
            }

            res.status(200).json({ message: "Cantidad surtida actualizada correctamente" });
          }); 
        });
      });
    });
  //});
});

app.put("/api/pedidos/actualizar-estado", (req, res) => {
  console.log(req.body); // Verifica el cuerpo de la solicitud en la consola del servidor
  const { pedidoId } = req.body;
  const { productoId } = req.body;
  const nuevoEstado = "B"; // Estado "B" para bahía

  const query = "UPDATE pedido_surtido SET estado=?, fin_surtido = NOW() WHERE id_pedi=?";

  // Actualiza el estado de un producto específico
  db.query(query, [nuevoEstado, productoId], async (error) => {
    if (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      res.status(500).send("Error al actualizar el estado del pedido");
      return;
    }

    // Consulta SQL para contar el número total de productos asociados al pedido
    const totalQuery = "SELECT COUNT(*) AS total FROM pedido_surtido WHERE pedido = ?";
    db.query(totalQuery, [pedidoId], async (error, results) => {
      if (error) {
        console.error("Error al contar el número total de productos:", error);
        res.status(500).send("Error al contar el número total de productos");
        return;
      }

      const totalProducts = results[0].total;

      // Consulta SQL para contar el número de productos con estado 'B'
      const countBQuery = "SELECT COUNT(*) AS count FROM pedido_surtido WHERE pedido = ? AND estado = ?";
      db.query(countBQuery, [pedidoId, nuevoEstado], async (error, results) => {
        if (error) {
          console.error("Error al contar el número de productos con estado B:", error);
          res.status(500).send("Error al contar el número de productos con estado B");
          return;
        }

        const countB = results[0].count;

        // Verifica si todos los productos tienen estado 'B'
        if (countB === totalProducts) {
          // Si todos los productos tienen estado 'B', actualiza el estado de la bahía
          const queryBahia = "UPDATE bahias SET estado = 2 WHERE id_pdi = ?";
          db.query(queryBahia, [pedidoId], async (error) => {
            if (error) {
              console.error("Error al actualizar el estado de la bahía:", error);
              res.status(500).send("Error al actualizar el estado de la bahía");
              return;
            }

            // Envía la respuesta de éxito solo cuando se haya actualizado el estado de la bahía
            res.json({ message: "Estado del pedido actualizado exitosamente" });
          });
        } else {
          // Si aún hay productos con estado 'S', envía un mensaje de éxito pero no actualiza la bahía
          res.json({
            message: "Estado del pedido actualizado exitosamente, pero algunos productos aún están en estado S",
          });
        }
      });
    });
  });
});


app.put("/actualizarCantidadNoSurtida", (req, res) => {
  console.log('Faltante',req.body);
  // Obtener los datos del cuerpo de la solicitud
  const pedidoId = req.body.pedido;
  const id_pedi = req.body.producto;
  const estado = "B";

  // Consulta SQL para obtener los valores actuales de cantidad y cant_surti
  const selectQuery =
    "SELECT cantidad, cant_surti FROM pedido_surtido WHERE pedido=? AND id_pedi=?";
    

  db.query(selectQuery, [pedidoId, id_pedi], async (error, results) => {
    if (error) {
      console.error("Error al obtener los datos del pedido:", error);
      res.status(500).send("Error al obtener los datos del pedido");
      return;
    }

    // Verificar si se encontraron resultados
    if (results.length === 0) {
      res.status(404).send("Pedido no encontrado");
      return;
    }

    // Obtener los valores de cantidad y cant_surti de los resultados de la consulta
    const cantidad = results[0].cantidad;
    const cant_surti = results[0].cant_surti;

    // Calcular la cantidad no surtida
    const cant_no_env = cantidad - cant_surti;

    // Consulta SQL para actualizar cant_no_env
    const updateQuery =
      //"UPDATE pedi SET cant_no_env=? WHERE pedido=? AND id_pedi=?";
      "UPDATE pedido_surtido SET cant_no_env=? ,inicio_surtido = IF(inicio_surtido IS NULL, NOW(), inicio_surtido), fin_surtido = IF(fin_surtido IS NULL, NOW(), fin_surtido), estado = ? WHERE pedido=? AND id_pedi=?"

    db.query(updateQuery, [cant_no_env, estado,  pedidoId, id_pedi], async (error) => {
      if (error) {
        console.error(
          "Error al actualizar la cantidad no surtida del pedido:",
          error
        );
        res
          .status(500)
          .send("Error al actualizar la cantidad no surtida del pedido");
        return;
      }

      // Respuesta de éxito
      res
        .status(200)
        .json({
          message: "Cantidad no surtida actualizada correctamente",
          cant_no_env,
        });
    });
  });
});

app.put("/actualizarSurtidoFaltante", (req, res) => {
  console.log(req.body);
  const codigo_ped = req.body.codigo_pedF;
  const estado = "R";

  const queryUbicaciones = "SELECT ubi FROM ubicaciones WHERE code_prod = ?";
  const queryUbicacionesAlma =
  "SELECT m.ubi_alm, m.code_pro, m.codigo_ubi, m.cantidad, m.pasillo, m.ingreso, p.des FROM ubi_alma m LEFT JOIN productos p ON m.code_pro = p.codigo_pro WHERE m.code_pro =? AND m.ingreso = (SELECT MIN(ingreso) FROM ubi_alma WHERE code_pro =?)";

  db.query(
    queryUbicaciones,
    [codigo_ped],
    (errorUbicaciones, resultsUbicaciones) => {
      if (errorUbicaciones) {
        console.error(
          "Error al obtener las ubicaciones de la tabla ubicaciones:",
          errorUbicaciones
        );
        res
          .status(500)
          .send("Error al obtener las ubicaciones de la tabla ubicaciones");
        return;
      }

      const ubicaciones = resultsUbicaciones.map((row) => row.ubi);

      db.query(
        queryUbicacionesAlma,
        [codigo_ped, codigo_ped],
        (errorUbicacionesAlma, resultsUbicacionesAlma) => {
          if (errorUbicacionesAlma) {
            console.error(
              "Error al obtener las ubicaciones de la tabla ubi_alma:",
              errorUbicacionesAlma
            );
            res
              .status(500)
              .send("Error al obtener las ubicaciones de la tabla ubi_alma");
            return;
          }

          const ubicacionesAlma = resultsUbicacionesAlma.map(
            (row) => row.ubi_alm
          );

          const queryInsert =
            "INSERT INTO tarea_monta (id_codigo, ubi_ini, ubi_fin, estado) VALUES (?, ?, ?, ?)";
          db.query(
            queryInsert,
            [codigo_ped, ubicaciones[0], ubicacionesAlma[0], estado],
            (errorInsert, resultsInsert) => {
              if (errorInsert) {
                console.error(
                  "Error al insertar los datos en la tabla tarea_monta:",
                  errorInsert
                );
                res
                  .status(500)
                  .send("Error al insertar los datos en la tabla tarea_monta");
                return;
              }

              res.status(200).json({ message: "Tarea Asignada correctamente" });
            }
          );
        }
      );
    }
  );
});


app.get('/reabastecimiento', (req, res) => {
  const query = `  SELECT 
  m.id_mon,
  m.id_codigo,
  m.ubi_ini,
  m.ubi_fin,
  p.des,
  u.cantidad
  FROM tarea_monta m
  LEFT JOIN productos p ON m.id_codigo = p.codigo_pro
  LEFT JOIN ubi_alma u ON u.code_pro = m.id_codigo 
  WHERE m.estado = "R"
  AND m.ubi_fin IS NOT NULL
  GROUP BY m.id_mon;`;

  // Ejecutar la consulta en la base de datos
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error al obtener los datos de reabastecimiento:', error);
          res.status(500).json({ error: 'Error al obtener los datos de reabastecimiento' });
          return;
      }
      res.json(results);
  });
});


app.put("/actualizarTareaMonta", (req, res) => {
  console.log(req.body);
  const idMon = req.body.idMon;
  const cantidad = req.body.cantidad;
  const ubi_ini = req.body.ubi_ini;
  const ubi_fin = req.body.ubi_fin;
  const estado = "S";

  // Utilizamos una transacción para garantizar la consistencia de los datos
 
    // Definir la consulta de actualización según la unidad de medida
    let updatePedidoQuery = `
    UPDATE tarea_monta   SET estado  =?
    WHERE id_mon = ? ;
    `;

    let updateUbiQuery = `UPDATE ubicaciones  SET cant_stock = cant_stock + ? WHERE ubi =?;`;
    let updateAlmaQuery = `UPDATE ubi_alma  SET cantidad = cantidad - ? WHERE ubi_alm = ?;`;

  
  // Ejecutar las consultas de actualización dentro de la transacción
db.query(updatePedidoQuery, [estado, idMon], async (error) => {
  if (error) {
    db.rollback(() => {
      console.error("Error al actualizar el estado del pedido:", error);
      res.status(500).send("Error al actualizar el estado del pedido");
    });
    return;
  }

  db.query(updateUbiQuery, [cantidad, ubi_ini], async (error) => {
    if (error) {
      db.rollback(() => {
        console.error("Error al actualizar el estado del pedido:", error);
        res.status(500).send("Error al actualizar el estado del pedido");
      });
      return;
    }
    db.query(updateAlmaQuery, [cantidad, ubi_fin], async (error) => {
      if (error) {
        db.rollback(() => {
          console.error("Error al actualizar el estado del pedido:", error);
          res.status(500).send("Error al actualizar el estado del pedido");
        });
        return;
      }

 

            res.status(200).json({ message: "Cantidad surtida actualizada correctamente" });
          }); 
        });
      });
    });


// Define la ruta para el inicio de sesión

app.post("/api/login", (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const query = "SELECT * FROM usuarios WHERE email = ? AND password = ?";

  db.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error al realizar la consulta:", error);
      res.status(500).send("Error interno del servidor");
      return;
    }

    if (results.length === 0) {
      res.status(401).send("Credenciales incorrectas");
      return;
    }
    console.log(req.body);

    const userData = {
      name: results[0].name,
      role: results[0].role,
      id_usu: results[0].id_usu,
    };
    // Si las credenciales son correctas, puedes generar un token de sesión o simplemente devolver un mensaje de éxito
    res.status(200).json(userData);
  });
});


app.get('/embarques', (req, res) => {
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
  p.um,
  us.role AS usuario,
  p.ubi_bahia, 
  p.estado,
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
 LEFT JOIN usuarios us ON p.id_usuario_paqueteria = us.id_usu
WHERE p.estado ='E'
GROUP BY p.id_pedi
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de embarques:', error);
      res.status(500).json({ error: 'Error al obtener los datos de embarques' });
      return;
    }

    // Agrupar los resultados por el campo `pedido`
    const groupedResults = results.reduce((acc, row) => {
      // Si el pedido no existe en el acumulador, se inicializa con un objeto vacío
      if (!acc[row.pedido]) {
        acc[row.pedido] = {
          pedido: row.pedido,
          tipo: row.tipo, // Agregar el campo "tipo" al encabezado del pedido
          ubi_bahia: row.ubi_bahia,
          usuario: row.usuario,
          datos: [] // Inicializar un array vacío para los datos de productos
        };
      }
      
      // Verificar si los campos `codigo_ped` son nulos o 0 y si `cant_surti` es mayor que 0
      const isValidProduct = row.codigo_ped !== null && row.codigo_ped !== 0 && row.cant_surti > 0;

      if (isValidProduct) {
        // Si el producto es válido, agregar al array correspondiente al pedido
        acc[row.pedido].datos.push(row);
      }

      return acc;
    }, {});

    // Convertir el objeto agrupado en un array de objetos
    const response = Object.values(groupedResults);

    res.json(response);
  });
});


app.put("/actualizarEmbarque", (req, res) => {
  console.log(req.body);
  const pedidoId = req.body.pedido;
  const productos = req.body.productos;
  const estado = "F";

  // Utilizamos una transacción para garantizar la consistencia de los datos
  db.beginTransaction(async (error) => {
    if (error) {
      console.error("Error al iniciar transacción:", error);
      res.status(500).send("Error al iniciar transacción");
      return;
    }

    // Definir la consulta de actualización del pedido
    let updatePedidoQuery = `UPDATE pedido_surtido SET estado=? WHERE pedido=?`;

    db.query(updatePedidoQuery, [estado, pedidoId], async (error) => {
      if (error) {
        db.rollback(() => {
          console.error("Error al actualizar el estado del pedido:", error);
          res.status(500).send("Error al actualizar el estado del pedido");
        });
        return;
      }    

      // Confirmar la transacción
      db.commit((error) => {
        if (error) {
          db.rollback(() => {
            console.error("Error al confirmar transacción:", error);
            res.status(500).send("Error al confirmar transacción");
          });
          return;
        }

        res.status(200).json({ message: "Cantidad surtida actualizada correctamente xd xd " });
      });
    });
  });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://192.168.3.225:${port}`);
});


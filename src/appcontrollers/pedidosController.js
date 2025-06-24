const pool = require('../config/database'); // Importa la configuración de la base de datos
const moment = require('moment'); // Importa Moment.js para formateo de fechas

// Función que obtiene los datos de pedidos y los envía como respuesta
const getPedidosData = async (req, res) => {
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

  let connection;
  try {
    connection = await pool.getConnection(); // Obtiene una conexión del pool
    const [result] = await connection.query(query);

    const groupedByPedido = {};

    // Procesa cada fila del resultado y agrupa los datos por pedido
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
    // Consolida los productos según la lógica del código
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

    res.json(groupedByPedido); // Envía la respuesta como JSON
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  } finally {
    if (connection) connection.release(); // Libera la conexión siempre
  }
};

// api/surtido/getPorPasillo.js


const getPorSurtir = async (req, res) => {
  const { role, pasillo } = req.query;

  const query = `
    SELECT
      p.pedido,
      p.tipo,
      MIN(p.registro_surtido) AS registro_surtido,
      COUNT(DISTINCT p.codigo_ped) AS total_productos,
      SUM(p.cantidad) AS total_cantidad,
      us.role AS usuario,
      u.pasillo,
      CASE
        WHEN SUM(CASE WHEN p.cant_surti = 0 THEN 1 ELSE 0 END) = COUNT(*) THEN 'POR SURTIR'
        WHEN SUM(CASE WHEN IFNULL(p.cant_surti, 0) + IFNULL(p.cant_no_env, 0) >= p.cantidad THEN 1 ELSE 0 END) = COUNT(*) THEN 'FINALIZADO'
        ELSE 'SURTIDO'
      END AS estatus
    FROM pedido_surtido p
    LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
    LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod
    LEFT JOIN usuarios us ON p.id_usuario = us.id_usu
    WHERE p.estado = 'S'
      AND prod.des IS NOT NULL
      AND (
        (us.role IS NOT NULL AND us.role = ?)
        OR (us.role IS NULL AND u.pasillo = ?)
        OR (u.pasillo = 'AV' AND ? = 'AV')
      ) 
      AND u.ubi IS NOT NULL
    GROUP BY p.pedido
    ORDER BY MIN(p.registro_surtido) ASC;
  `;

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(query, [role, pasillo, role]);

    const porPedido = [];
    const porPasillo = [];

    for (const row of result) {
      const item = {
        pedido: row.pedido,
        tipo: row.tipo,
        registro_surtido: row.registro_surtido,
        total_productos: row.total_productos,
        total_cantidad: row.total_cantidad,
        usuario: row.usuario,
        pasillo: row.pasillo,
        estatus: row.estatus
      };

      if (row.usuario) {
        porPedido.push(item);
      } else {
        porPasillo.push(item);
      }
    }

    res.json({
      porPedido,
      porPasillo
    });
  } catch (error) {
    console.error("Error en getPedidosPorSurtir:", error);
    res.status(500).json({ error: 'Error al obtener el resumen por pedido' });
  } finally {
    if (connection) connection.release();
  }
};



const getPorSurtirLista = async (req, res) => {
  const { role, pasillo, pedido } = req.query;

  let query = `
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
      AND (
        (us.role IS NOT NULL AND us.role = ?)
        OR (us.role IS NULL AND u.pasillo = ?)
        OR (u.pasillo = 'AV' AND ? = 'AV')
      )
  `;

  const params = [role, pasillo, role];

  if (pedido) {
    query += ` AND p.pedido = ?`;
    params.push(pedido);
  }

  query += ` GROUP BY p.id_pedi ORDER BY u.ubi ASC`;

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(query, params);

    const groupedByPedido = {};

    result.forEach(row => {
      const pedido = row.pedido;
      const tipo = row.tipo;
      const usuario = row.usuario;
      const registro_surtido = moment(row.registro_surtido).format('YYYY-MM-DD HH:mm:ss');

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
        const faltan = row.cantidad - row.cant_surti;
        let master = 0, inner = 0, pz = 0;
        let restante = faltan;

        if (row._master > 0 && restante >= row._master) {
          master = Math.floor(restante / row._master);
          restante -= master * row._master;
        }

        if (row._inner > 0 && restante >= row._inner) {
          inner = Math.floor(restante / row._inner);
          restante -= inner * row._inner;
        }

        if (row._pz > 0 && restante >= row._pz) {
          pz = Math.floor(restante / row._pz);
          restante -= pz * row._pz;
        }

        const baseProduct = {
          identifi: row.id_pedi,
          codigo_ped: row.codigo_ped,
          quantity: row.cantidad,
          allquantity: row.cantidad,
          cant_surti: row.cant_surti,
          cant_no_env: row.cant_no_env,
          _master: row._master,
          _inner: row._inner,
          _pz: row._pz,
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
        };

        if (master > 0) {
          groupedByPedido[pedido].productos.push({ ...baseProduct, surtir: master, unidad: 'master' });
        }

        if (inner > 0) {
          groupedByPedido[pedido].productos.push({ ...baseProduct, surtir: inner, unidad: 'inner' });
        }

        if (pz > 0) {
          groupedByPedido[pedido].productos.push({ ...baseProduct, surtir: pz, unidad: 'pz' });
        }
      }
    });

    for (const pedido in groupedByPedido) {
      groupedByPedido[pedido].productos.sort((a, b) => {
        if (a.location < b.location) return -1;
        if (a.location > b.location) return 1;

        const ordenUM = { 'master': 1, 'inner': 2, 'pz': 3 };
        return ordenUM[a.unidad] - ordenUM[b.unidad];
      });
    }

    res.json(groupedByPedido);
  } catch (error) {
    console.error("Error en getPorSurtirLista:", error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  } finally {
    if (connection) connection.release();
  }
};


const getResumenUsuarioDelDia = async (req, res) => {
  try {
    const { id_usuario_surtido } = req.query;
    if (!id_usuario_surtido) {
      return res.status(400).json({ message: 'Falta id_usuario_surtido en el query.' });
    }

    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');

    const query = `
      SELECT DISTINCT pedido, codigo_ped
      FROM (
        SELECT pedido, codigo_ped, inicio_surtido
        FROM pedido_surtido
        WHERE id_usuario_surtido = ?
          AND (
            DATE(inicio_surtido) = ?
            OR (DATE(inicio_surtido) = ? AND TIME(inicio_surtido) >= '21:30:00')
          )

        UNION ALL

        SELECT pedido, codigo_ped, inicio_surtido
        FROM pedido_embarque
        WHERE id_usuario_surtido = ?
          AND (
            DATE(inicio_surtido) = ?
            OR (DATE(inicio_surtido) = ? AND TIME(inicio_surtido) >= '21:30:00')
          )

        UNION ALL

        SELECT pedido, codigo_ped, inicio_surtido
        FROM pedido_finalizado
        WHERE id_usuario_surtido = ?
          AND (
            DATE(inicio_surtido) = ?
            OR (DATE(inicio_surtido) = ? AND TIME(inicio_surtido) >= '21:30:00')
          )
      ) AS codigos_surtidos;
    `;

    const [rows] = await pool.query(query, [
      id_usuario_surtido, today, yesterday,
      id_usuario_surtido, today, yesterday,
      id_usuario_surtido, today, yesterday,
    ]);

    res.json({
      id_usuario: id_usuario_surtido,
      total_codigos_surtidos: rows.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los códigos surtidos del usuario',
      error: error.message
    });
  }
};






module.exports = { getPedidosData, getPorSurtir, getPorSurtirLista, getResumenUsuarioDelDia}; // Exporta la función para su uso en otras partes de la aplicación

const pool = require("../config/database"); // Importa la configuración de la base de datos
const moment = require("moment"); // Importa Moment.js para formateo de fechas

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
    result.forEach((row) => {
      const pedido = row.pedido;
      const tipo = row.tipo;
      const usuario = row.usuario;
      const registro_surtido = moment(row.registro_surtido).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      if (!groupedByPedido[pedido]) {
        groupedByPedido[pedido] = {
          tipo,
          usuario,
          jaula: "No",
          registro_surtido,
          productos: [],
        };
      }

      if (row.pasillo === "AV") {
        groupedByPedido[pedido].jaula = "Si";
      }

      if (row.cant_stock !== null) {
        const existingProductIndex = groupedByPedido[
          pedido
        ].productos.findIndex(
          (product) => product.codigo_ped === row.codigo_ped
        );

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
            um: row.um,
          });
        }
      }
    });
    // Consolida los productos según la lógica del código
    for (const pedido in groupedByPedido) {
      if (groupedByPedido.hasOwnProperty(pedido)) {
        const productosPedido = groupedByPedido[pedido].productos;
        const productosConsolidados = [];

        productosPedido.forEach((producto) => {
          const cantidadRestante =
            producto.allquantity - (producto.cant_surti || 0);

          if (
            producto.cant_surti === producto.allquantity ||
            (producto.cant_surti !== 0 && producto.cant_no_env !== 0)
          ) {
            productosConsolidados.push({
              ...producto,
              um: producto.um,
              quantity: producto.allquantity,
              total: producto._pz,
              barcode: producto.code_pz,
            });
          }

          if (
            cantidadRestante > 0 ||
            producto.cant_surti === producto.allquantity
          ) {
            if (!producto._inner && !producto._master) {
              const pzCompletos = Math.min(
                Math.floor(cantidadRestante / producto._pz),
                producto.quantity
              );
              if (pzCompletos > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: producto.um,
                  quantity: pzCompletos,
                  total: producto._pz,
                  barcode: producto.code_pz,
                });
              }
            } else if (!producto._inner) {
              const mastersCompletos = Math.min(
                Math.floor(cantidadRestante / producto._master),
                producto.quantity
              );
              const piezasSueltas = cantidadRestante % producto._master;
              const cajapz = Math.min(
                Math.floor(piezasSueltas / producto._pz),
                producto.quantity
              );

              if (mastersCompletos > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: "MASTER",
                  quantity: mastersCompletos,
                  total: producto._master,
                  barcode: producto.code_master,
                });
              }

              if (piezasSueltas > 0 && cajapz > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: producto.um,
                  quantity: cajapz,
                  total: producto._pz || producto._pq, // Si no hay pz, usa pq
                  barcode: producto.code_pz || producto.code_pq,
                });
              }
            } else if (!producto._master) {
              const innersCompletos = Math.min(
                Math.floor(cantidadRestante / producto._inner),
                producto.quantity
              );
              const piezasSueltas = cantidadRestante % producto._inner;
              const cajapz = Math.min(
                Math.floor(piezasSueltas / producto._pz),
                producto.quantity
              );

              if (innersCompletos > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: "INNER",
                  quantity: innersCompletos,
                  total: producto._inner,
                  barcode: producto.code_inner,
                });
              }

              if (piezasSueltas > 0 && cajapz > 0) {
                productosConsolidados.push({
                  ...producto,
                  um: producto.um,
                  quantity: cajapz,
                  total: producto._pz || producto._pq, // Si no hay pz, usa pq
                  barcode: producto.code_pz || producto.code_pq,
                });
              }
            } else {
              if (
                producto._master &&
                producto._inner &&
                producto._pq &&
                producto._pz
              ) {
                const mastersCompletos = Math.min(
                  Math.floor(cantidadRestante / producto._master),
                  producto.quantity
                );
                const innersCompletos = Math.min(
                  Math.floor(
                    (cantidadRestante % producto._master) / producto._inner
                  ),
                  producto.quantity - mastersCompletos
                );
                const pqCompletos = Math.min(
                  Math.floor(
                    (cantidadRestante % producto._inner) / producto._pq
                  ),
                  producto.quantity - (mastersCompletos + innersCompletos)
                );
                const piezasSueltas =
                  cantidadRestante -
                  mastersCompletos * producto._master -
                  innersCompletos * producto._inner -
                  pqCompletos * producto._pq;

                if (mastersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: "MASTER",
                    quantity: mastersCompletos,
                    total: producto._master,
                    barcode: producto.code_master,
                  });
                }

                if (innersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: "INNER",
                    quantity: innersCompletos,
                    total: producto._inner,
                    barcode: producto.code_inner,
                  });
                }

                if (pqCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: "PQ",
                    quantity: pqCompletos,
                    total: producto._pq,
                    barcode: producto.code_pq,
                  });
                }

                if (piezasSueltas > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: producto.um,
                    quantity: piezasSueltas,
                    total: producto._pz,
                    barcode: producto.code_pz,
                  });
                }
              } else {
                const mastersCompletos = Math.min(
                  Math.floor(cantidadRestante / producto._master),
                  producto.quantity
                );
                const innersCompletos = Math.min(
                  Math.floor(
                    (cantidadRestante % producto._master) / producto._inner
                  ),
                  producto.quantity - mastersCompletos
                );
                const piezasSueltas =
                  cantidadRestante -
                  mastersCompletos * producto._master -
                  innersCompletos * producto._inner;
                const cajapz = Math.min(
                  Math.floor(piezasSueltas / producto._pz),
                  producto.quantity
                );

                if (mastersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: "MASTER",
                    quantity: mastersCompletos,
                    total: producto._master,
                    barcode: producto.code_master,
                  });
                }

                if (innersCompletos > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: "INNER",
                    quantity: innersCompletos,
                    total: producto._inner,
                    barcode: producto.code_inner,
                  });
                }

                if (piezasSueltas > 0 && cajapz > 0) {
                  productosConsolidados.push({
                    ...producto,
                    um: producto.um,
                    quantity: cajapz,
                    total: producto._pz,
                    barcode: producto.code_pz,
                  });
                }
              }
            }
          }
        });

        groupedByPedido[pedido].productos = productosConsolidados.filter(
          (producto) => {
            return !(
              producto.quantity === 0 &&
              producto.cant_surti === 0 &&
              producto.cant_no_env === 0
            );
          }
        );
      }
    }

    res.json(groupedByPedido); // Envía la respuesta como JSON
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los pedidos" });
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
        estatus: row.estatus,
      };

      if (row.usuario) {
        porPedido.push(item);
      } else {
        porPasillo.push(item);
      }
    }

    res.json({
      porPedido,
      porPasillo,
    });
  } catch (error) {
    console.error("Error en getPedidosPorSurtir:", error);
    res.status(500).json({ error: "Error al obtener el resumen por pedido" });
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

    result.forEach((row) => {
      const pedido = row.pedido;
      const tipo = row.tipo;
      const usuario = row.usuario;
      const registro_surtido = moment(row.registro_surtido).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      if (!groupedByPedido[pedido]) {
        groupedByPedido[pedido] = {
          tipo,
          usuario,
          jaula: "No",
          registro_surtido,
          productos: [],
        };
      }

      if (row.pasillo === "AV") {
        groupedByPedido[pedido].jaula = "Si";
      }

      if (row.cant_stock !== null) {
        const faltan = row.cantidad - row.cant_surti;
        let master = 0,
          inner = 0,
          pz = 0;
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
          um: row.um,
        };

        if (master > 0) {
          groupedByPedido[pedido].productos.push({
            ...baseProduct,
            surtir: master,
            unidad: "master",
          });
        }

        if (inner > 0) {
          groupedByPedido[pedido].productos.push({
            ...baseProduct,
            surtir: inner,
            unidad: "inner",
          });
        }

        if (pz > 0) {
          groupedByPedido[pedido].productos.push({
            ...baseProduct,
            surtir: pz,
            unidad: "pz",
          });
        }
      }
    });

    for (const pedido in groupedByPedido) {
      groupedByPedido[pedido].productos.sort((a, b) => {
        if (a.location < b.location) return -1;
        if (a.location > b.location) return 1;

        const ordenUM = { master: 1, inner: 2, pz: 3 };
        return ordenUM[a.unidad] - ordenUM[b.unidad];
      });
    }

    res.json(groupedByPedido);
  } catch (error) {
    console.error("Error en getPorSurtirLista:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
  } finally {
    if (connection) connection.release();
  }
};

// nueva app surtidoS

// kpy usuari
const getResumenUsuarioDelDia = async (req, res) => {
  try {
    const { id_usuario_surtido } = req.query;

    if (!id_usuario_surtido) {
      return res.status(400).json({
        message: "Falta id_usuario_surtido en el query.",
      });
    }

    // =====================================================
    // 1. DEFINIR TURNO ACTUAL
    // =====================================================
    const now = moment();
    const horaActual = now.format("HH:mm:ss");

    let turnoInicio;
    let turnoFin;
    let nombreTurno = "FUERA_DE_TURNO";

    if (horaActual >= "06:00:00" && horaActual < "14:00:00") {
      // Turno 1
      turnoInicio = moment().set({ hour: 6, minute: 0, second: 0 });
      turnoFin = moment().set({ hour: 14, minute: 0, second: 0 });
      nombreTurno = "TURNO_1";
    } else if (horaActual >= "14:00:00" && horaActual < "22:00:00") {
      // Turno 2
      turnoInicio = moment().set({ hour: 14, minute: 0, second: 0 });
      turnoFin = moment().set({ hour: 22, minute: 0, second: 0 });
      nombreTurno = "TURNO_2";
    } else {
      // Fuera de turno (por si consultan en la noche)
      turnoInicio = moment().startOf("day");
      turnoFin = now;
    }

    const inicioTurno = turnoInicio.format("YYYY-MM-DD HH:mm:ss");
    const finTurno = turnoFin.format("YYYY-MM-DD HH:mm:ss");

    // =====================================================
    // 2. OBTENER LINEAS UNICAS DEL TURNO
    // =====================================================
    const queryCodigos = `
      SELECT DISTINCT pedido, codigo_ped, inicio_surtido
      FROM (
        SELECT pedido, codigo_ped, inicio_surtido
        FROM pedido_surtido
        WHERE id_usuario_surtido = ?
          AND inicio_surtido BETWEEN ? AND ?

        UNION ALL

        SELECT pedido, codigo_ped, inicio_surtido
        FROM pedido_embarque
        WHERE id_usuario_surtido = ?
          AND inicio_surtido BETWEEN ? AND ?

        UNION ALL

        SELECT pedido, codigo_ped, inicio_surtido
        FROM pedido_finalizado
        WHERE id_usuario_surtido = ?
          AND inicio_surtido BETWEEN ? AND ?
      ) AS codigos_surtidos;
    `;

    const params = [
      id_usuario_surtido,
      inicioTurno,
      finTurno,
      id_usuario_surtido,
      inicioTurno,
      finTurno,
      id_usuario_surtido,
      inicioTurno,
      finTurno,
    ];

    const [rows] = await pool.query(queryCodigos, params);

    const totalLineas = rows.length;

    // =====================================================
    // 3. PRIMER MOVIMIENTO DEL TURNO
    // =====================================================
    const queryInicio = `
      SELECT MIN(inicio_surtido) AS primer_movimiento
      FROM (
        SELECT inicio_surtido
        FROM pedido_surtido
        WHERE id_usuario_surtido = ?
          AND inicio_surtido BETWEEN ? AND ?

        UNION ALL

        SELECT inicio_surtido
        FROM pedido_embarque
        WHERE id_usuario_surtido = ?
          AND inicio_surtido BETWEEN ? AND ?

        UNION ALL

        SELECT inicio_surtido
        FROM pedido_finalizado
        WHERE id_usuario_surtido = ?
          AND inicio_surtido BETWEEN ? AND ?
      ) AS movimientos;
    `;

    const [inicioRows] = await pool.query(queryInicio, params);

    // =====================================================
    // 4. CALCULAR HORAS TRABAJADAS
    // =====================================================
    let horasTrabajadas = 0;
    let lineasPorHora = 0;

    if (inicioRows[0].primer_movimiento) {
      let inicio = moment(inicioRows[0].primer_movimiento);

      // Si empezó antes del turno, contamos desde el inicio del turno
      if (inicio.isBefore(turnoInicio)) {
        inicio = turnoInicio;
      }

      const ahora = moment();
      horasTrabajadas = ahora.diff(inicio, "minutes") / 60;

      if (horasTrabajadas > 0) {
        lineasPorHora = totalLineas / horasTrabajadas;
      }
    }

    // =====================================================
    // 5. META Y EFICIENCIA
    // =====================================================
    // =====================================================
    // 5. META Y EFICIENCIA (POR TURNO)
    // =====================================================
    const metaTurno = 200; // Meta por turno
    const horasTurno = 8;

    // Meta por hora del turno
    const metaPorHora = metaTurno / horasTurno;

    // Meta esperada según el tiempo trabajado
    const metaEsperada = horasTrabajadas * metaPorHora;

    // Evitar división por 0
    let porcentajeCumplimiento = 0;

    if (metaEsperada > 0) {
      porcentajeCumplimiento = (totalLineas / metaEsperada) * 100;
    }

    // Limitar a 150% para evitar valores irreales
    if (porcentajeCumplimiento > 150) {
      porcentajeCumplimiento = 150;
    }

    const porcentajeAvanceTurno =
      metaTurno > 0 ? (totalLineas / metaTurno) * 100 : 0;

    // =====================================================
    // 6. CLASIFICACIÓN OPERATIVA (SEMAFORO)
    // =====================================================
    let estatus = "CRITICO";

    if (porcentajeCumplimiento >= 100) {
      estatus = "EXCELENTE";
    } else if (porcentajeCumplimiento >= 85) {
      estatus = "EN_META";
    } else if (porcentajeCumplimiento >= 60) {
      estatus = "BAJO";
    }

    // =====================================================
    // 6. RESPUESTA FINAL
    // =====================================================
    res.json({
      id_usuario: id_usuario_surtido,
      turno: nombreTurno,
      horario_turno: `${turnoInicio.format("HH:mm")} - ${turnoFin.format(
        "HH:mm"
      )}`,

      total_codigos_surtidos: totalLineas,

      horas_trabajadas: Number(horasTrabajadas.toFixed(2)),
      lineas_por_hora: Number(lineasPorHora.toFixed(2)),

      meta_turno: metaTurno,
      meta_esperada: Number(metaEsperada.toFixed(0)),

      porcentaje_cumplimiento: Number(porcentajeCumplimiento.toFixed(1)), // ritmo
      porcentaje_avance_turno: Number(porcentajeAvanceTurno.toFixed(1)), // avance real

      estatus_productividad: estatus,
    });
  } catch (error) {
    console.error("Error KPI:", error);

    res.status(500).json({
      message: "Error al obtener el resumen del usuario",
      error: error.message,
    });
  }
};

// lisgt de pedidos pendientes 
const getPedidosPendientes = async (req, res) => {
  try {
    const { id_usuario, pasillo } = req.query;

    if (!pasillo) {
      return res.status(400).json({
        message: "Falta el parámetro pasillo",
      });
    }

    let where = ` WHERE p.estado = 'S' `;
    const params = [];

    // ===============================
    // USUARIO AV
    // ===============================
    if (pasillo === "AV") {
      where += ` AND u.pasillo = 'AV' `;
    }
    // ===============================
    // USUARIO NORMAL
    // ===============================
    else {
      where += `
        AND (
              (
                p.id_usuario IS NULL
                AND u.pasillo = ?
              )
              OR
              (
                p.id_usuario = ?
                AND u.pasillo <> 'AV'
              )
            )
      `;

      params.push(pasillo);
      params.push(id_usuario || 0);
    }

    const query = `
      SELECT 
        p.pedido,
        p.tipo,
        COUNT(*) AS productos,
        SUM(p.cantidad - p.cant_surti) AS pendientes,

        -- ===============================
        -- NUEVO: ESTADO DEL PEDIDO
        -- ===============================
        CASE 
          WHEN MAX(IFNULL(p.cant_surti,0)) > 0 
          THEN 'SURTIENDO'
          ELSE 'PENDIENTE'
        END AS estado_surtido,

        -- Tipo de surtido
        CASE 
          WHEN MAX(CASE WHEN p.id_usuario IS NOT NULL THEN 1 ELSE 0 END) = 1
          THEN 'PEDIDO'
          ELSE 'PASILLO'
        END AS tipo_surtido,

        -- EXCLUSIVO AV
        CASE 
          WHEN NOT EXISTS (
            SELECT 1
            FROM pedido_surtido px
            LEFT JOIN ubicaciones ux 
              ON px.codigo_ped = ux.code_prod
            WHERE px.pedido = p.pedido
              AND px.tipo = p.tipo
              AND ux.pasillo <> 'AV'
          )
          THEN 1
          ELSE 0
        END AS exclusivo_av

      FROM pedido_surtido p
      LEFT JOIN ubicaciones u 
        ON p.codigo_ped = u.code_prod
      ${where}
      GROUP BY p.pedido, p.tipo
      ORDER BY p.registro_surtido ASC
    `;

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener pedidos pendientes",
      error: error.message,
    });
  }
};



// funcion para ignar um a surtir
function descomponerCantidad(producto, cantidadRestante) {
  const resultado = [];

  const master = producto._master || 0;
  const inner = producto._inner || 0;
  const pz = producto._pz || 1;

  let restante = cantidadRestante;

  if (master > 0) {
    const masters = Math.floor(restante / master);
    if (masters > 0) {
      resultado.push({
        ...producto,
        um: "MASTER",
        quantity: masters,
        total: master,
        barcode: producto.code_master,
      });
      restante -= masters * master;
    }
  }

  if (inner > 0) {
    const inners = Math.floor(restante / inner);
    if (inners > 0) {
      resultado.push({
        ...producto,
        um: "INNER",
        quantity: inners,
        total: inner,
        barcode: producto.code_inner,
      });
      restante -= inners * inner;
    }
  }

  if (restante > 0) {
    resultado.push({
      ...producto,
      um: "PZ",
      quantity: restante,
      total: pz,
      barcode: producto.code_pz,
    });
  }

  return resultado;
}

// detalle de lo que se va a asurtir
const getDetallePedido = async (req, res) => {
  let { pedido, tipo, id_usuario, pasillo } = req.query;

  if (!pedido || !tipo || !pasillo) {
    return res.status(400).json({
      message: "Faltan parámetros pedido, tipo o pasillo",
    });
  }

  // ===============================
  // NORMALIZAR PASILLO
  // ===============================
  if (pasillo !== 'AV') {
    if (pasillo.startsWith('P')) {
      pasillo = pasillo.substring(1);
    }
  }

  let where = `
    WHERE p.pedido = ?
      AND p.tipo = ?
      AND p.estado = 'S'
      -- 🚫 NO enviar productos sin ubicación
      AND u.ubi IS NOT NULL
      AND TRIM(u.ubi) <> ''
  `;

  const params = [pedido, tipo];

  // ===============================
  // FILTRO POR PASILLO / USUARIO
  // ===============================
  if (pasillo === "AV") {
    where += ` AND (u.pasillo = 'AV') `;
  } else {
    where += `
      AND (
            (
              p.id_usuario IS NULL
              AND u.pasillo = ?
            )
            OR
            (
              p.id_usuario = ?
            )
          )
    `;
    params.push(pasillo);
    params.push(id_usuario || 0);
  }

  const query = `
    SELECT
      p.id_pedi,
      p.pedido,
      p.tipo,
      p.codigo_ped,
      p.cantidad,
      p.cant_surti,
      p.cant_no_env,
      p.ubi_bahia,

      prod.des,
      prod.code_pz,
      prod.code_inner,
      prod.code_master,
      prod._pz,
      prod._inner,
      prod._master,

      u.cant_stock,
      u.ubi,
      u.pasillo

    FROM pedido_surtido p
    JOIN productos prod 
      ON p.codigo_ped = prod.codigo_pro
    LEFT JOIN ubicaciones u 
      ON p.codigo_ped = u.code_prod

    ${where}

    ORDER BY u.ubi ASC
  `;

  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);

    const detalle = {
      pedido,
      tipo,
      total_piezas: 0,
      productos: [],
    };

    rows.forEach(row => {
      const restante =
        row.cantidad -
        (row.cant_surti || 0) -
        (row.cant_no_env || 0);

      if (restante <= 0) return;

      const base = {
        identifi: row.id_pedi,
        codigo_ped: row.codigo_ped,
        name: row.des,
        location: row.ubi,
        pasillo: row.pasillo,
        peackinglocation: row.ubi_bahia,
        stockpeak: row.cant_stock,

        code_pz: row.code_pz,
        code_inner: row.code_inner,
        code_master: row.code_master,

        _pz: row._pz,
        _inner: row._inner,
        _master: row._master,
      };

      const desglosado = descomponerCantidad(base, restante);

      detalle.productos.push(...desglosado);
      detalle.total_piezas += restante;
    });

    res.json(detalle);

  } catch (error) {
    console.error("Error getDetallePedido:", error);
    res.status(500).json({
      message: "Error detalle pedido",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};






module.exports = {
  getPedidosData,
  getPorSurtir,
  getPorSurtirLista,
  getResumenUsuarioDelDia,
  getPedidosPendientes,
  getDetallePedido,
}; // Exporta la función para su uso en otras partes de la aplicación

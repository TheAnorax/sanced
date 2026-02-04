const pool = require('../config/database');
const moment = require('moment');

const getSurtidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
SELECT
  p.id_pedi,
  p.pedido,
  p.tipo,
  pq.routeName,
  pq.\`NOMBRE DEL CLIENTE\` AS nombre_cliente,  --  Corregido
  p.codigo_ped,
  prod.des,
  prod._pz AS pieza,
  p.cantidad,
  p.cant_surti,
  p.cant_no_env,
  p.id_usuario,
  p.um,
  p.unido,
  p._pz,
  p._pq,
  p._inner,
  p._master,
  p.ubi_bahia,
  p.inicio_surtido,
  p.fin_surtido,
  p.estado,
  p.motivo,
  p.unificado,
  p.fusion,
  u.cant_stock,
  u.ubi,
  u.pasillo,
  (SELECT COUNT(DISTINCT p2.codigo_ped)
   FROM pedido_surtido p2
   WHERE p2.pedido = p.pedido AND p2.tipo = p.tipo) AS partidas 
FROM pedido_surtido p
LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro
LEFT JOIN paqueteria pq 
  ON p.pedido = pq.\`NO ORDEN\`
  AND p.tipo = pq.tipo_original
LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod
WHERE p.estado = 'S' OR p.estado = 'B'
GROUP BY p.id_pedi
ORDER BY u.ubi ASC;

    `);

    const groupedPedidos = rows.reduce((acc, pedido) => {
      if (!acc[pedido.pedido]) {
        acc[pedido.pedido] = {
          id_pedi: pedido.id_pedi,
          pedido: pedido.pedido,
          tipo: pedido.tipo,
          partidas: pedido.partidas,
          ubi_bahia: pedido.ubi_bahia,
          items: [],
        };
      }
      acc[pedido.pedido].items.push({
        id_pedi: pedido.id_pedi,
        tipo: pedido.tipo,
        routeName: pedido.routeName,
        nombre_cliente:pedido.nombre_cliente,
        codigo_ped: pedido.codigo_ped,
        des: pedido.des,
        cantidad: pedido.cantidad,
        cant_surti: pedido.cant_surti,
        cant_no_env: pedido.cant_no_env,
        id_usuario: pedido.id_usuario,
        um: pedido.um,
        unido: pedido.unido,
        _pz: pedido._pz,
        pieza: pedido.pieza,
        _pq: pedido._pq,
        inicio_surtido: pedido.inicio_surtido,
        fin_surtido: pedido.fin_surtido,
        _inner: pedido._inner,
        _master: pedido._master,
        ubi_bahia: pedido.ubi_bahia,
        fusion: pedido.fusion,
        estado: pedido.estado,
        motivo: pedido.motivo,
        unificado: pedido.unificado,
        cant_stock: pedido.cant_stock,
        ubi: pedido.ubi,
        pasillo: pedido.pasillo,
      });
      return acc;
    }, {});

    res.json(Object.values(groupedPedidos));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

const updatePedido = async (req, res) => { 
  try {
    const { pedidoId } = req.params;
    const { items } = req.body;

    const updateQueries = items.map(item => {
      // 🔥 Determinar el estado dinámicamente
      const estado = (item.cant_surti + item.cant_no_env === item.cantidad) ? 'B' : 'S';

      console.log(`Item ${item.id_pedi}: Estado calculado -> ${estado}`);

      const params = [item.cant_surti, item.cant_no_env, estado, item.motivo, item.id_pedi];

      let query = 'UPDATE pedido_surtido SET cant_surti = ?, cant_no_env = ?, estado = ?, motivo = ?';

      // Si hay cantidad no enviada, registrar inicio y fin de surtido
      if (item.cant_no_env > 0) {
        query += ', inicio_surtido = NOW(), fin_surtido = NOW()';
      }
 
      query += ' WHERE id_pedi = ?';

    // console.log('🔄 Ejecutando:', query, params); // Para depuración

      return pool.query(query, params);
    }); 

    await Promise.all(updateQueries);

    res.status(200).json({ message: 'Pedido actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error en updatePedido:', error);
    res.status(500).json({ message: 'Error al actualizar el pedido', error: error.message });
  }
};



const authorizePedido = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { pedidoId } = req.params;
    const { tipo, items } = req.body;
    // console.log("itemsAUTH",tipo);

    if (!pedidoId) {
      return res.status(400).json({ message: 'Datos incompletos en la solicitud' });
    }

    await connection.beginTransaction();

    // Verificar si el pedido ya existe en la tabla pedido_embarque
    const [existingOrders] = await connection.query(
      'SELECT * FROM pedido_embarque WHERE pedido = ? AND tipo = ?',
      [pedidoId, tipo]
    );
    

    if (existingOrders.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'El pedido ya existe en la tabla de embarques' });
    }

    // Recuperar los datos completos de los items desde la tabla pedido_surtido basados en el pedidoId
    const [pedidoSurtidoItems] = await connection.query(
      'SELECT * FROM pedido_surtido WHERE pedido = ?',
      [pedidoId]
    );

    if (pedidoSurtidoItems.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'No se encontraron ítems para este pedido' });
    }

    // Insertar datos en la tabla pedido_embarque usando el pedidoId
    const insertQueries = pedidoSurtidoItems.map(item => {
      return connection.query(
        `INSERT INTO pedido_embarque (pedido, tipo, codigo_ped, clave, cantidad, cant_surti, cant_no_env, um, _pz, _pq, _inner, _master, ubi_bahia, estado, id_usuario, inicio_surtido, fin_surtido, unido, id_usuario_surtido, registro, registro_surtido, registro_embarque, motivo, unificado, fusion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'E', ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
        [pedidoId, item.tipo, item.codigo_ped, item.clave, item.cantidad, item.cant_surti, item.cant_no_env, item.um, item._pz, item._pq, item._inner, item._master, item.ubi_bahia, item.id_usuario, item.inicio_surtido, item.fin_surtido, item.unido, item.id_usuario_surtido, item.registro, item.registro_surtido, item.motivo, item.unificado, item.fusion]
      );
    });

    await Promise.all(insertQueries);

    // Actualizar el estado a 3 en la tabla bahias para las bahías relacionadas con el pedido autorizado
    await connection.query(
      'UPDATE bahias SET estado = 3 WHERE id_pdi = ?',
      [pedidoId]
    );

    // Eliminar datos de la tabla pedido_surtido basados en el pedidoId
    await connection.query('DELETE FROM pedido_surtido WHERE pedido = ?', [pedidoId]);

    await connection.commit();
    await updateUMLogic();

    await connection.query(`DELETE FROM pedido_embarque
WHERE id_pedi IN ( 
    SELECT id_pedi
    FROM (
        SELECT 
            pedido, 
            codigo_ped,
            id_pedi,
            v_pz,
            v_pq,
            v_inner,
            v_master,
            ROW_NUMBER() OVER (PARTITION BY pedido, codigo_ped ORDER BY 
                CASE WHEN (v_pz > 0 OR v_pq > 0 OR v_inner > 0 OR v_master > 0) THEN 1 ELSE 2 END,
                id_pedi
            ) AS rn
        FROM 
            pedido_embarque
        WHERE (pedido, codigo_ped) IN (
            SELECT 
                pedido, 
                codigo_ped
            FROM 
                pedido_embarque
            GROUP BY 
                pedido, codigo_ped
            HAVING 
                COUNT(*) > 1
        )
    ) AS Repeated
    WHERE rn > 1
);`)
    
    res.status(200).json({ message: 'Pedido autorizado y transferido a embarque correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error(`Error al autorizar el pedido: ${error.message}`);
    res.status(500).json({ message: 'Error al autorizar el pedido', error: error.message });
  } finally {
    connection.release();
  }
};




const updateBahias = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { ubi_bahia } = req.body;

    console.log("Datos recibidos en el servidor:", { pedidoId, ubi_bahia });

    // Verificar si ubi_bahia está definido
    if (!ubi_bahia) {
      return res.status(400).json({ message: 'El campo ubi_bahia es obligatorio' });
    }

    // Obtener las bahías actuales del pedido
    const [currentBahiasRows] = await pool.query(
      'SELECT ubi_bahia FROM pedido_surtido WHERE pedido = ?',
      [pedidoId]
    );

    // Si no hay filas, significa que no se encontró el pedido
    if (currentBahiasRows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const currentBahias = currentBahiasRows[0].ubi_bahia ? currentBahiasRows[0].ubi_bahia.split(', ') : [];

    // Combinar las bahías actuales con las nuevas
    const newBahias = ubi_bahia.split(', ');
    const combinedBahias = [...new Set([...currentBahias, ...newBahias])].join(', ');

    console.log("datosBahias:", combinedBahias, pedidoId);
    console.log("DatosBahiaBahia", pedidoId, newBahias);

    // Actualizar las bahías en la base de datos `pedido_surtido`
    await pool.query(
      'UPDATE pedido_surtido SET ubi_bahia = ? WHERE pedido = ?',
      [combinedBahias, pedidoId]
    );

    const estadoB = "1";

    // Actualizar las bahías en la tabla `bahias`
    // Dividir la actualización en partes manejables
    // for (const bahia of newBahias) {
    //   console.log("Actualizando bahía:", bahia); // Agregar un log para cada bahía
    //   await pool.query(
    //     'UPDATE bahias SET estado = ?, id_pdi = ? WHERE bahia = ?',
    //     [estadoB, pedidoId, bahia]
    //   );
    // }

    for (const bahia of newBahias) {
      // Si contiene "Pasillo-", omitir
      if (bahia.includes("Pasillo-")) continue;
    
      await pool.query(
        'UPDATE bahias SET estado = ?, id_pdi = ?, ingreso = NOW() WHERE bahia = ?',
        ['1', pedidoId, bahia]
      );
    }

    res.status(200).json({ message: 'Bahías actualizadas correctamente' });
  } catch (error) {
    console.error("Error al actualizar las bahías:", error); // Log the error
    res.status(500).json({ message: 'Error al actualizar las bahías', error: error.message });
  }
};


// CONTROLADOR
const updateBahiasfinalizado = async (req, res) => {
  try {
    const { pedidoId, tipo } = req.params;
    const { ubi_bahia } = req.body;

    if (!ubi_bahia) {
      return res.status(400).json({ message: 'El campo ubi_bahia es obligatorio' });
    }

    const tables = ['pedido_surtido', 'pedido_embarque', 'pedido_finalizado'];
    let targetTable = null;
    let currentBahias = [];

    for (const table of tables) {
      const [rows] = await pool.query(
        `SELECT ubi_bahia FROM ${table} WHERE pedido = ? AND tipo = ?`,
        [pedidoId, tipo]
      );

      if (rows.length > 0) {
        currentBahias = rows[0].ubi_bahia?.split(', ') || [];
        targetTable = table;
        break;
      }
    }

    if (!targetTable) {
      return res.status(404).json({ message: 'Pedido no encontrado en ninguna tabla' });
    }

    const newBahias = ubi_bahia.split(', ');
    const combinedBahias = [...new Set([...currentBahias, ...newBahias])].join(', ');

    await pool.query(
      `UPDATE ${targetTable} SET ubi_bahia = ? WHERE pedido = ? AND tipo = ?`,
      [combinedBahias, pedidoId, tipo]
    );

    for (const bahia of newBahias) {
      // Si contiene "Pasillo-", omitir
      if (bahia.includes("Pasillo-")) continue;
    
      await pool.query(
        'UPDATE bahias SET estado = ?, id_pdi = ?, ingreso = NOW() WHERE bahia = ?',
        ['4', pedidoId, bahia]
      );
    }
    

    res.status(200).json({ message: `Bahías actualizadas en ${targetTable}` });
  } catch (error) {
    console.error('Error al actualizar las bahías:', error);
    res.status(500).json({ message: 'Error al actualizar las bahías', error: error.message });
  }
};



const cancelPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    await pool.query(
      'UPDATE pedido_surtido SET estado = "C" WHERE pedido = ?',
      [pedidoId]
    );

    res.status(200).json({ message: 'Pedido cancelado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar el pedido', error: error.message });
  }
};

const getPedidosDelDia = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const query = `
      
SELECT * FROM (
                SELECT 'surtido' AS origen, 
                       p.id_pedi, 
                       p.pedido, 
                       p.cantidad, 
                       p.cant_surti, 
                       p.inicio_surtido, 
                       p.fin_surtido, 
                       p.ubi_bahia,
                       p.tipo,
                       us.name AS usuario_nombre,
                       us.role AS usuario_role,
                       us.turno AS usuario_turno
                FROM pedido_surtido p
                LEFT JOIN usuarios us ON p.id_usuario_surtido = us.id_usu
                WHERE DATE(p.inicio_surtido) = ? 
                      OR (DATE(p.inicio_surtido) = ? AND TIME(p.inicio_surtido) >= '21:30:00')

                UNION ALL

                SELECT 'embarque' AS origen, 
                       e.id_pedi, 
                       e.pedido, 
                       e.cantidad, 
                       e.cant_surti, 
                       e.inicio_surtido, 
                       e.fin_surtido, 
                       e.ubi_bahia,
                       e.tipo,
                       us.name AS usuario_nombre,
                       us.role AS usuario_role,
                       us.turno AS usuario_turno
                FROM pedido_embarque e
                LEFT JOIN usuarios us ON e.id_usuario_surtido = us.id_usu
                WHERE DATE(e.inicio_surtido) = ? 
                      OR (DATE(e.inicio_surtido) = ? AND TIME(e.inicio_surtido) >= '21:30:00')

                UNION ALL

                SELECT 'finalizado' AS origen, 
                       f.id_pedi, 
                       f.pedido, 
                       f.cantidad, 
                       f.cant_surti, 
                       f.inicio_surtido, 
                       f.fin_surtido,                        
                       f.ubi_bahia,
                       f.tipo,
                       us.name AS usuario_nombre,
                       us.role AS usuario_role,
                       us.turno AS usuario_turno
                FROM pedido_finalizado f
                LEFT JOIN usuarios us ON f.id_usuario_surtido = us.id_usu
                WHERE DATE(f.inicio_surtido) = ? 
                      OR (DATE(f.inicio_surtido) = ? AND TIME(f.inicio_surtido) >= '21:30:00')
            ) AS pedidos;

    `;

    const [rows] = await pool.query(query, [today, yesterday, today, yesterday, today, yesterday]);

    const usuariosPorTurno = {
      turno1: {},
      turno2: {},
      turno3: {}
    };

    const agregarUsuario = (usuarioNombre, item, turno) => {
      if (!usuariosPorTurno[turno][usuarioNombre]) {
        usuariosPorTurno[turno][usuarioNombre] = {
          role: item.usuario_role,
          productos_surtidos: 0,
          cantidad_total_surti: 0,
          pedidos_surtidos: new Set(),
          pedidosid: [],
          intervalos: [],
          primer_inicio: Infinity,
          ultimo_fin: -Infinity
        };
      }

      usuariosPorTurno[turno][usuarioNombre].productos_surtidos += 1;
      usuariosPorTurno[turno][usuarioNombre].cantidad_total_surti += item.cant_surti;
      usuariosPorTurno[turno][usuarioNombre].pedidos_surtidos.add(item.pedido);
      usuariosPorTurno[turno][usuarioNombre].pedidosid.push(item.pedido);

      const inicio = item.inicio_surtido ? new Date(item.inicio_surtido).getTime() : null;
      const fin = item.fin_surtido ? new Date(item.fin_surtido).getTime() : null;

      if (inicio && fin && fin > inicio) {
        usuariosPorTurno[turno][usuarioNombre].intervalos.push({ inicio, fin });
        usuariosPorTurno[turno][usuarioNombre].primer_inicio = Math.min(usuariosPorTurno[turno][usuarioNombre].primer_inicio, inicio);
        usuariosPorTurno[turno][usuarioNombre].ultimo_fin = Math.max(usuariosPorTurno[turno][usuarioNombre].ultimo_fin, fin);
      }
    };

    rows.forEach(item => {
      if (item.cant_surti === 0 && item.cant_no_env !== 0) {
        return;
      }

      const usuarioNombre = item.usuario_nombre || 'Desconocido';
      if (moment(item.inicio_surtido).isBetween(today + ' 06:00:00', today + ' 14:00:00')) {
        agregarUsuario(usuarioNombre, item, 'turno1');
      } else if (moment(item.inicio_surtido).isBetween(today + ' 14:00:00', today + ' 21:30:00')) {
        agregarUsuario(usuarioNombre, item, 'turno2');
      } else if (moment(item.inicio_surtido).isBetween(yesterday + ' 21:30:00', today + ' 06:00:00')) {
        agregarUsuario(usuarioNombre, item, 'turno3');
      }
    });

    Object.keys(usuariosPorTurno).forEach(turno => {
      Object.keys(usuariosPorTurno[turno]).forEach(usuario => {
        const intervalos = usuariosPorTurno[turno][usuario].intervalos;

        if (intervalos.length > 0) {
          intervalos.sort((a, b) => a.inicio - b.inicio);

          let tiempoTotal = 0;
          let [inicioActual, finActual] = [intervalos[0].inicio, intervalos[0].fin];

          for (let i = 1; i < intervalos.length; i++) {
            if (intervalos[i].inicio <= finActual) {
              finActual = Math.max(finActual, intervalos[i].fin);
            } else {
              tiempoTotal += (finActual - inicioActual) / 60000;
              [inicioActual, finActual] = [intervalos[i].inicio, intervalos[i].fin];
            }
          }
          tiempoTotal += (finActual - inicioActual) / 60000;

          if (tiempoTotal >= 60) {
            const horas = Math.floor(tiempoTotal / 60);
            const minutos = Math.floor(tiempoTotal % 60);
            usuariosPorTurno[turno][usuario].tiempo_surtido = `${horas}h ${minutos}min`;
          } else {
            usuariosPorTurno[turno][usuario].tiempo_surtido = `${tiempoTotal.toFixed(2)} min`;
          }

          usuariosPorTurno[turno][usuario].pedidos_surtidos = usuariosPorTurno[turno][usuario].pedidos_surtidos.size;

          const tiempoGeneral = (usuariosPorTurno[turno][usuario].ultimo_fin - usuariosPorTurno[turno][usuario].primer_inicio) / 60000;
          if (tiempoGeneral >= 60) {
            const horas = Math.floor(tiempoGeneral / 60);
            const minutos = Math.floor(tiempoGeneral % 60);
            usuariosPorTurno[turno][usuario].tiempo_general = `${horas}h ${minutos}min`;
          } else {
            usuariosPorTurno[turno][usuario].tiempo_general = `${tiempoGeneral.toFixed(2)} min`;
          }

          usuariosPorTurno[turno][usuario].pedidosid = [...new Set(usuariosPorTurno[turno][usuario].pedidosid)];
        }
      });
    });

    const groupByPedido = (data) => {
      return data.reduce((acc, item) => {
        if (!acc[item.pedido]) {
          acc[item.pedido] = {
            pedido: item.pedido,
            partidas: 0,
            origen: item.origen,
            ubi_bahia: item.ubi_bahia,
            productos: [],
          };
        }
        acc[item.pedido].productos.push(item);
        acc[item.pedido].partidas++;
        return acc;
      }, {});
    };

    const turnos = {
      turno1: groupByPedido(rows.filter(row => moment(row.inicio_surtido).isBetween(today + ' 06:00:00', today + ' 14:00:00'))),
      turno2: groupByPedido(rows.filter(row => moment(row.inicio_surtido).isBetween(today + ' 14:00:00', today + ' 21:30:00'))),
      turno3: groupByPedido(rows.filter(row => moment(row.inicio_surtido).isBetween(yesterday + ' 21:30:00', today + ' 06:00:00'))),
    };

    const formatTurno = (turno) => {
      return Object.values(turno).map(pedido => ({
        pedido: pedido.pedido,
        partidas: pedido.partidas,
        origen: pedido.origen,
        ubi_bahia: pedido.ubi_bahia,
        productos: pedido.productos
      }));
    };

    res.json({
      turno1: {
        pedidos: formatTurno(turnos.turno1),
        usuarios: usuariosPorTurno.turno1
      },
      turno2: {
        pedidos: formatTurno(turnos.turno2),
        usuarios: usuariosPorTurno.turno2
      },
      turno3: {
        pedidos: formatTurno(turnos.turno3),
        usuarios: usuariosPorTurno.turno3
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos del día', error: error.message });
  }
};



const calculateUnits = (cantidadTotal, minPz, minPq, minInner, minMaster) => {
  let remaining = cantidadTotal; // Cantidad restante por asignar
  const result = { _pz: 0, _pq: 0, _inner: 0, _master: 0 };

  if (minMaster > 0) {
    result._master = Math.floor(remaining / minMaster);
    remaining %= minMaster;
  }

  if (minInner > 0) {
    result._inner = Math.floor(remaining / minInner);
    remaining %= minInner;
  }

  if (minPq > 0) {
    result._pq = Math.floor(remaining / minPq);
    remaining %= minPq;
  }

  if (minPz > 0) {
    result._pz = Math.floor(remaining / minPz);
    remaining %= minPz;
  }

  if (remaining > 0) {
    console.warn(`No se pudo ajustar exactamente la cantidad: Restante = ${remaining}`);
  }

  return result;
};

const updateUM = async (req, res) => {
  try {
    await updateUMLogic();
    res.status(200).json({ message: 'Unidades actualizadas correctamente' });
  } catch (error) {
    console.error("Error en updateUM:", error.message);
    res.status(500).json({ message: 'Error al ejecutar la actualización de unidades', error: error.message });
  }
};



const updateUMLogic = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT
        prod.des,
        p.pedido,
        p.tipo,
        p.codigo_ped,
        p.cantidad,
        p.cant_surti,
        p.cant_no_env,
        p.um,
        p._pz,
        p._pq,
        p._inner,
        p._master,
        p.estado,
        prod._pz AS min_pz,
        prod._inner AS min_inner,
        prod._pq AS min_pq,
        prod._master AS min_master,
        p.motivo,
        p.id_usuario_paqueteria,
        p.registro 
      FROM
        pedido_embarque p
      LEFT JOIN		
        productos prod ON p.codigo_ped = prod.codigo_pro
      LEFT JOIN
        ubicaciones u ON p.codigo_ped = u.code_prod
      LEFT JOIN
        usuarios us ON p.id_usuario = us.id_usu
      WHERE 
        (
          (
            p.cant_no_env != p.cantidad AND
            (
              (p._pz * prod._pz) +
              (p._pq * prod._pq) +
              (p._inner * prod._inner) +
              (p._master * prod._master)
            ) != p.cantidad
          )
          OR
          (
            p.um IS NOT NULL AND
            p._pz = 0 AND
            p._pq = 0 AND
            p._inner = 0 AND
            p._master = 0
          )
        )
      GROUP BY
        p.id_pedi
      ORDER BY
        u.ubi ASC;
    `);

    if (rows.length === 0) {
      console.log("No se encontraron registros para actualizar.");
      return;
    }

    await connection.beginTransaction();

    for (const row of rows) {
      const {
        pedido,
        codigo_ped,
        cantidad,
        cant_surti,
        _pz,
        _pq,
        _inner,
        _master,
        min_pz,
        min_pq,
        min_inner,
        min_master
      } = row;

      const cantidadReal = cant_surti;


      const correctedUnits = calculateUnits(
        cantidadReal,
        min_pz,
        min_pq,
        min_inner,
        min_master
      );

      if (
        correctedUnits._pz === _pz &&
        correctedUnits._pq === _pq &&
        correctedUnits._inner === _inner &&
        correctedUnits._master === _master
      ) {
        continue;
      }

      await connection.query(
        `
        UPDATE pedido_embarque 
        SET _pz = ?, 
            _pq = ?, 
            _inner = ?, 
            _master = ? 
        WHERE pedido = ? AND codigo_ped = ?;
        `,
        [
          correctedUnits._pz,
          correctedUnits._pq,
          correctedUnits._inner,
          correctedUnits._master,
          pedido,
          codigo_ped,
        ]
      );
    }

    await connection.commit();
    console.log(" Unidades actualizadas correctamente.");
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error durante la actualización de unidades:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};





module.exports = { getSurtidos, updatePedido, authorizePedido, updateBahias, cancelPedido, getPedidosDelDia, updateBahiasfinalizado };

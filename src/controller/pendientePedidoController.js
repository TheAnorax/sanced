const pool = require('../config/database');

const getPedidos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.pedido, p.tipo, p.codigo_ped, p.clave, p.cantidad, p.um, p.registro, p.estado, 
              prod.des, u.pasillo, prod._pz, u.ubi, p.unido
       FROM pedi p 
       LEFT JOIN ubicaciones u ON p.codigo_ped = u.code_prod 
       LEFT JOIN productos prod ON p.codigo_ped = prod.codigo_pro AND prod.des IS NOT NULL 
       WHERE p.estado IS NULL 
       GROUP BY p.id_pedi`
    );

    const groupedPedidos = rows.reduce((acc, pedido) => {
      if (!acc[pedido.pedido]) {
        acc[pedido.pedido] = {
          pedido: pedido.pedido,
          tipo: pedido.tipo,
          registro: pedido.registro,
          items: [],
        };
      }
      acc[pedido.pedido].items.push({
        clave: pedido.clave,
        codigo_ped: pedido.codigo_ped, 
        des: pedido.des,
        cantidad: pedido.cantidad,
        pasillo: pedido.pasillo,
        ubi: pedido.ubi,
        um: pedido.um,
        unido: pedido.unido,
        pz_: pedido._pz
      });
      return acc;
    }, {});

    res.json(Object.values(groupedPedidos));
  } catch (error) {
    console.error(`Error al obtener los pedidos: ${error.message}`);
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

const getBahias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bahias WHERE id_pdi IS NULL');
    res.json(rows);
  } catch (error) {
    console.error(`Error al obtener las bahías: ${error.message}`);
    res.status(500).json({ message: 'Error al obtener las bahías', error: error.message });
  }
};
//en este controlador en ves de buscar en una sola tabla que es la de pedid_surtido la existencia de este pedido que tambie me busque si este pedido ya se encuentra en la tabla de pedido_embarque, Y pedido_finalizado
// const savePedidoSurtido = async (req, res) => {
//   const { pedido, estado, bahias, items, usuarioId } = req.body;

//   if (!pedido || !estado || !bahias || !items) {
//     console.error('Datos incompletos en la solicitud');
//     return res.status(400).json({ message: 'Datos incompletos en la solicitud' });
//   }

//   const connection = await pool.getConnection();

//   try {
//     await connection.beginTransaction();

//     const [existingPedido] = await connection.query('SELECT * FROM pedido_surtido WHERE pedido = ?', [pedido]);

//     if (existingPedido.length > 0) {
//       await connection.rollback();
//       console.error(`El pedido ${pedido} ya existe en la tabla pedido_surtido`);
//       return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_surtido' });
//     }

//     const insertPedidoSurtidoQuery = `
//       INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave, unido, id_usuario, cant_no_env, inicio_surtido, fin_surtido, registro_surtido)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const codigosPedATADO = [3446, 3496, 3494, 3492, 3450, 3493, 3447, 3449, 3495, 3497, 3448, 3451];
//     const codigosExcluir = [8792, 8793, 8247, 8291, 8293, 8294, 8805, 8295, 8863];

//     const now = new Date(); // Obtenemos la fecha y hora actuales

//     for (const item of items) { 
//       if (item.codigo_ped !== 0) {
//         if (codigosExcluir.includes(item.codigo_ped)) {
//           console.log(`Código ${item.codigo_ped} excluido de la inserción.`);
//         } else {
//           const um = codigosPedATADO.includes(item.codigo_ped) ? 'ATADO' : item.um;
//           const unido = item.unido != null ? item.unido : 0;
//           let cant_no_env = 0;
//           let item_estado = estado;
//           let inicio_surtido = null;
//           let fin_surtido = null;

//           if (item.pz_ && item.pz_ > 1 && item.cantidad % item.pz_ !== 0) {
//             cant_no_env = item.cantidad;
//             item_estado = 'B';
//             inicio_surtido = now;
//             fin_surtido = now;
//           }

//           await connection.query(insertPedidoSurtidoQuery, [
//             pedido, item.tipo, item.codigo_ped, item.cantidad, item.registro, bahias.join(','), item_estado, um, item.clave, unido, usuarioId || null, cant_no_env, inicio_surtido, fin_surtido, now
//           ]);
//         }
//       }
//     }
//     console.log(`Pedido ${pedido} insertado en la tabla pedido_surtido.`);

//     const estado_B = 1;
//     const ubicacionesAExcluir = ['Pasillo-1', 'Pasillo-2', 'Pasillo-3', 'Pasillo-4', 'Pasillo-5', 'Pasillo-6', 'Pasillo-7', 'Pasillo-8'];
//     const ubicacionesFiltradas = bahias.filter(bahia => !ubicacionesAExcluir.includes(bahia));

//     if (ubicacionesFiltradas.length > 0) {
//       const updateBahiasQuery = 'UPDATE bahias SET estado = ?, id_pdi = ?, ingreso = CURRENT_DATE WHERE bahia IN (?)';
//       await connection.query(updateBahiasQuery, [estado_B, pedido, ubicacionesFiltradas.join(',')]);
//     }

//     const deletePedidoQuery = 'DELETE FROM pedi WHERE pedido = ?'; 
//     await connection.query(deletePedidoQuery, [pedido]);
//     console.log(`Pedido ${pedido} eliminado de la tabla pedi.`);

//     await connection.commit();
//     res.json({ message: 'Pedido surtido guardado correctamente y eliminado de la tabla pedi', pedido });
//   } catch (error) {
//     await connection.rollback();
//     console.error(`Error al guardar el pedido surtido: ${error.message}`);
//     res.status(500).json({ message: 'Error al guardar el pedido surtido', error: error.message });
//   } finally {
//     connection.release();
//   }
// };

const savePedidoSurtido = async (req, res) => {
  const { pedido, estado, bahias, items, usuarioId } = req.body;

  if (!pedido || !estado || !bahias || !items) {
    console.error('Datos incompletos en la solicitud');
    return res.status(400).json({ message: 'Datos incompletos en la solicitud' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingPedidoSurtido] = await connection.query('SELECT * FROM pedido_surtido WHERE pedido = ?', [pedido]);
    if (existingPedidoSurtido.length > 0) {
      await connection.rollback();
      console.error(`El pedido ${pedido} ya existe en la tabla pedido_surtido`);
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_surtido' });
    }

    const [existingPedidoEmbarque] = await connection.query('SELECT * FROM pedido_embarque WHERE pedido = ?', [pedido]);
    if (existingPedidoEmbarque.length > 0) {
      await connection.rollback();
      console.error(`El pedido ${pedido} ya existe en la tabla pedido_embarque`);
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_embarque' });
    }

    const [existingPedidoFinalizado] = await connection.query('SELECT * FROM pedido_finalizado WHERE pedido = ?', [pedido]);
    if (existingPedidoFinalizado.length > 0) {
      await connection.rollback();
      console.error(`El pedido ${pedido} ya existe en la tabla pedido_finalizado`);
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_finalizado' });
    }

    const insertPedidoSurtidoQuery = `
      INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave, unido, id_usuario, cant_no_env, inicio_surtido, fin_surtido, registro_surtido, motivo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const codigosPedATADO = [3446, 3496, 3494, 3492, 3450, 3493, 3447, 3449, 3495, 3497, 3448, 3451];
    const codigoBLs = [4299,4300,2463,3496,3494,2466,3450,3449,3495,3497,3448,3451,2464,4295,4307,2461,4303,2467,2471,4298,2462,4311,2465,4313,2468,2470,8307,1574,7410,7412];
    const codigosExcluir = [8792, 8793, 8247, 8291, 8293, 8294, 8805, 8295, 8863];
    const coidigoPQ =[ 6970,6971,6972,7023,7024,7029,7100,6969,6973,6974,6975,6976,6977,6978,6979,7015,7016,7017,7018,7019,7020,7021,7022,7025,7026,7027,7049,7068,7069,7098,7099,7862,7863]

    const now = new Date();


    for (const item of items) {
      if (item.codigo_ped !== 0) {
        if (codigosExcluir.includes(item.codigo_ped)) {
          console.log(`Código ${item.codigo_ped} excluido de la inserción.`);
        } else {
          // Asignación condicional de la unidad de medida
          let um = codigosPedATADO.includes(item.codigo_ped) ? 'ATADO' : item.um;
          
          // Si el código está en la lista de códigoBLs, sobrescribe la unidad de medida con 'BL'
          if (codigoBLs.includes(item.codigo_ped)) {
            um = 'BL';
          }

          if (coidigoPQ.includes(item.codigo_ped)) {
            um = 'PQTE';
          }
    
          const unido = item.unido != null ? item.unido : 0;
          let cant_no_env = 0;
          let item_estado = estado;
          let inicio_surtido = null;
          let fin_surtido = null;
          let motivo = null;
    
          if (item.pz_ && item.pz_ > 1 && item.cantidad % item.pz_ !== 0) {
            cant_no_env = item.cantidad;
            item_estado = 'B';
            inicio_surtido = now;
            fin_surtido = now;
            motivo = 'UM NO COINCIDE';
          }
    
          await connection.query(insertPedidoSurtidoQuery, [
            pedido, item.tipo, item.codigo_ped, item.cantidad, item.registro, bahias.join(','), item_estado, um, item.clave, unido, usuarioId || null, cant_no_env, inicio_surtido, fin_surtido, now, motivo
          ]);
        }
      }
    }
    console.log(`Pedido ${pedido} insertado en la tabla pedido_surtido.`);

    const estado_B = 1;
    const ubicacionesAExcluir = ['Pasillo-1', 'Pasillo-2', 'Pasillo-3', 'Pasillo-4', 'Pasillo-5', 'Pasillo-6', 'Pasillo-7', 'Pasillo-8'];
    const ubicacionesFiltradas = bahias.filter(bahia => !ubicacionesAExcluir.includes(bahia));

    if (ubicacionesFiltradas.length > 0) {
      const updateBahiasQuery = 'UPDATE bahias SET estado = ?, id_pdi = ?, ingreso = CURRENT_DATE WHERE bahia IN (?)';
      await connection.query(updateBahiasQuery, [estado_B, pedido, ubicacionesFiltradas.join(',')]);
    }

    const deletePedidoQuery = 'DELETE FROM pedi WHERE pedido = ?';
    await connection.query(deletePedidoQuery, [pedido]);
    console.log(`Pedido ${pedido} eliminado de la tabla pedi.`);

    await connection.commit();
    res.json({ message: 'Pedido surtido guardado correctamente y eliminado de la tabla pedi', pedido });
  } catch (error) {
    await connection.rollback();
    console.error(`Error al guardar el pedido surtido: ${error.message}`);
    res.status(500).json({ message: 'Error al guardar el pedido surtido', error: error.message });
  } finally {
    connection.release();
  }
};

const mergePedidos = async (req, res) => {
  const { pedido, tipo, items, bahias, usuarioId } = req.body;

  if (!pedido || !tipo || !items || items.length === 0 || !bahias) {
    console.error('Datos incompletos en la solicitud:', { pedido, tipo, items, bahias, usuarioId });
    return res.status(400).json({ message: 'Datos incompletos en la solicitud' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const insertPedidoSurtidoQuery = `
      INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave, unido, id_usuario, cant_no_env, inicio_surtido, fin_surtido, registro_surtido, unificado, motivo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    
    const codigosPedATADO = [3446, 3496, 3494, 3492, 3450, 3493, 3447, 3449, 3495, 3497, 3448, 3451];
    const codigoBLs = [4299,4300,2463,3496,3494,2466,3450,3449,3495,3497,3448,3451,2464,4295,4307,2461,4303,2467,2471,4298,2462,4311,2465,4313,2468,2470,8307,1574,7410,7412];
    const codigosExcluir = [8792, 8793, 8247, 8291, 8293, 8294, 8805, 8295, 8863];
    const coidigoPQ =[ 6970,6971,6972,7023,7024,7029,7100,6969,6973,6974,6975,6976,6977,6978,6979,7015,7016,7017,7018,7019,7020,7021,7022,7025,7026,7027,7049,7068,7069,7098,7099,7862,7863]

    const now = new Date(); // Obtenemos la fecha y hora actuales

    for (const item of items) {
      if (item.codigo_ped !== 0) {
        if (codigosExcluir.includes(item.codigo_ped)) {
          console.log(`Código ${item.codigo_ped} excluido de la inserción.`);
        } else {
          const um = codigosPedATADO.includes(item.codigo_ped) ? 'ATADO' : item.um;
          const unido = item.unido != null ? item.unido : 0;
          let cant_no_env = 0;
          let item_estado = 'S';
          let inicio_surtido = null;
          let fin_surtido = null;
          let motivo = null;

          if (item.pz_ && item.pz_ > 1 && item.cantidad % item.pz_ !== 0) {
            cant_no_env = item.cantidad;
            item_estado = 'B';
            inicio_surtido = now;
            fin_surtido = now;
            motivo = 'UM NO COINCIDE';
          }

          console.log(`Insertando item UNI: ${JSON.stringify(item)}`);
          await connection.query(insertPedidoSurtidoQuery, [
            pedido, tipo, item.codigo_ped, item.cantidad, now, bahias.join(','), item_estado, um, item.clave, unido, usuarioId || null, cant_no_env, inicio_surtido, fin_surtido, now, item.unificado, motivo
          ]); // Se inserta "item.unificado" individualmente por cada código de pedido
        }
      }
    }
    console.log(`Pedido ${pedido} fusionado e insertado en la tabla pedido_surtido.`);

    await connection.commit();
    res.json({ message: 'Pedido fusionado guardado correctamente', pedido });
  } catch (error) {
    await connection.rollback();
    console.error(`Error al fusionar el pedido: ${error.message}`);
    res.status(500).json({ message: 'Error al fusionar el pedido', error: error.message });
  } finally {
    connection.release();
  }
};




const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error(`Error al obtener Usuarios: ${error.message}`);
    res.status(500).json({ message: 'Error al obtener Usuarios', error: error.message });
  }
};

module.exports = { getPedidos, getBahias, savePedidoSurtido, getUsuarios, mergePedidos };

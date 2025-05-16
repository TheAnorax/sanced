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
      const key = `${pedido.pedido}-${pedido.tipo}`; // ✅ clave compuesta

      if (!acc[key]) {
        acc[key] = {
          pedido: pedido.pedido,
          tipo: pedido.tipo,
          registro: pedido.registro,
          items: [],
        };
      }

      acc[key].items.push({
        clave: pedido.clave,
        codigo_ped: pedido.codigo_ped,
        des: pedido.des,
        cantidad: pedido.cantidad,
        pasillo: pedido.pasillo,
        ubi: pedido.ubi,
        um: pedido.um,
        unido: pedido.unido,
        pz_: pedido._pz,
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
  const tipo = items[0]?.tipo;
 // console.log("pendiente",req.body)
  if (!pedido || !estado || !bahias || !items || !tipo) {
    console.error('Datos incompletos en la solicitud');
    return res.status(400).json({ message: 'Datos incompletos o tipo inválido' });
  }
  
  const allSameTipo = items.every(item => item.tipo === tipo);
  if (!allSameTipo) {
    return res.status(400).json({ message: 'Todos los ítems deben tener el mismo tipo.' });
  }
  

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingPedidoSurtido] = await connection.query('SELECT * FROM pedido_surtido WHERE pedido = ? AND tipo = ?', [pedido, tipo]);
    if (existingPedidoSurtido.length > 0) {
      await connection.rollback();
      console.error(`El pedido ${pedido} ya existe en la tabla pedido_surtido`);
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_surtido' });
    }

    const [existingPedidoEmbarque] = await connection.query('SELECT * FROM pedido_embarque WHERE pedido = ? AND tipo = ?', [pedido, tipo]);
    if (existingPedidoEmbarque.length > 0) {
      await connection.rollback();
      console.error(`El pedido ${pedido} ya existe en la tabla pedido_embarque`);
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_embarque' });
    }

    const [existingPedidoFinalizado] = await connection.query('SELECT * FROM pedido_finalizado WHERE pedido = ? AND tipo = ?', [pedido, tipo]);
    if (existingPedidoFinalizado.length > 0) {
      await connection.rollback();
      console.error(`El pedido ${pedido} ya existe en la tabla pedido_finalizado`);
      return res.status(400).json({ message: 'El pedido ya existe en la tabla pedido_finalizado' });
    }

    const insertPedidoSurtidoQuery = `
      INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave, unido, id_usuario, cant_no_env, inicio_surtido, fin_surtido, registro_surtido, motivo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const codigoPZ = [1323];
    const codigosPedATADO = [ 3448,3449,3450,3494,3495,3496,3497,3446,3447,3492,3493,4651,4652];
    const codigoBLs = [4299,4300,2463,2466,2464,4295,4307,2461,4303,2467,2471,4298,2462,4311,2465,
                       4313,2468,2470,8307,1574,7412,3528,3527,3514,3456,3506,3469,3512,3523,3524,
                       3470,3513,3522,3526,3468,3461,3511,3525,3471,3467,3521,3457,3458,3459,3460,
                       3507,3509,3510,3466,3520,3508,3230,3231,3232,3233,3234,3235,3245,3247,3248,
                       3325,3326,3270,3271,3299,3267,3294,3265,3307,3318,3420,3421,3335,3337,3336,
                       3345,3395,3316,3317,3305,3344,3394,3343,3393,3391,3280,3281,6938,3384,3392,
                       3341,3342,3423,3431,3430,3274,3435,3368,3366,3367,3364,3365,3298,3315,3340,
                       3390,3236,3237,3239,3251,3253,3254,3255,3256,3260,3353,3354,3355,3356,3357,
                       3351,3362,3359,3360,3361,3358,3238,3252,3272,3293,3273,3296,3295,3297,3266,
                       3308,3319,6935,3382,3402,3383,3417,3415,3416,3403,3375,3376,3422,6937,3380,
                       3400,3381,3401,7869,7870,7872,7873,7866,7867,7868,7874,7864,7865,7876,7879,
                       7875,7877,7878,7741,7742,7743,7744,7745,5780,5772,5781,5773,7746,7747,7748,
                       7749,5782,5785,5787,5776,5788,5778,5775,5799,5777,4354,4353,4352,1509,1512,
                       3246,4611,4619,4618,4610,4617,4613,4620,4615,4612,5789,5798,4614,5774,7540,
                       8743,8450,8452,7799,3320,3321,3322,8533,6936,3290,3291,3292,3249,3250,3306,
                       3261,3350,3352,3363,8790,7602,8451,8453,7871,7410,7411,8441,8442,9755,9756,4286,3477,3487,3486,3476,9307,9308];

    const codigoCj =[ 3219,6945,6944,6947,6946,6948,6941,6943,6931,6939,6940,6942,3210,3222,3215,
                      3216,3213,3214,3218,3220,3217,7154,7153,7174,8092,1462,1463,6973,6972,6971,
                      7098,7026,7019,7015,6975,6977,6978,7025,7017,6979,7100,7022,7029,6969,7049,
                      7021,7016,6974,7023,7018,7068,7020,7069,8091,8088,8090,8093,8089,7024,7027,
                            6976,6970,7099,3211,3212,3221,9771,9772,9773,7314,7315,7316,7317,7318,7319,5524,5525]
    const codigoEm =[3451,3498,5712,5708,5706,5705,5703,5713,5702,5506,5520,5513,5508,5514,5517,5522,5521,
                     5523,5509,5515,5518,2498,4294,2461,2451,2452,8307,2464,2459,2460,4307,2470,2465,
                     2455,2487,2454,4315,8368,8369,2490,1520,1521,1513,1523,4295,2482,8563,5691,5763,5709,
                     5762,5694,2471,8300,4298,4303,4308,4300,2466,2469,2462,2458,2492,2478,2477,2499,2488,
                     2479,2456,8367,2484,4316,1574,5761,2457,1501,5692,5760,5693,2463,2467,2473,1508,2472,
                     2475,5719,5720,5721,5722,5695,8499,8811,8812,8815,9226,9227,9228,8564,8561,8562,5696,
                     5697,5716,5717,8751,8753,8989,8030,5916,8530,7862,7863,8531,8817,8813,8570,
                     9232,9233,8810,8816,9225,9229,9230,9231,8752,8843,5915,8814,8818,5718,1506,7984,7981,
                     4650,4653,4654,9765,9766,9767,6801,6802,6803,6804,6805,6806,6808,6810,6830,6832,
                     9211,2704,2705,2706,2707,8572,9309,9310,9311,9141,9597,9596,9599,9598
 ]
    const codigoJg =[ 5987,7135,6999,8045,8978,8114,8095,8716,7113,8094,8161,7483,7484,7488,7659,7665,7660,
                      7663,7662,7667,8744,7485,7486,7476,7477,7475,7474,8653,7853,7854,7857,7855,7859,7858,
                      7112,7480,8068,8711,8717,7065,7060,8111,8112,8113,6595,6672,6671,6670,8602,7479,8745,
                      8746,7664,7661,7666,7668,5986,8652,8189,7852,7856,8712,8715,8809,9463,9464,8115,9207,9208,9209,9210,8066]    
    const coidigoPQ =[8496,1465,1452,1454,1450,1455,1453,1461,8949,1451,9247,8003,8005,5906,5907,5908,7469,7473,7472,7468,7471,7467,8050,8708,7470,7224,7225,1323
    ]

    const codigosExcluir = [8792, 8793, 8247, 8291, 8293, 8294, 8805, 8295, 8863];
    const codigosinner = [4352, 4353, 4354];

    const codigosAnegar = [1095, 1096, 1097, 1098, 1099, 1100, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1123, 1124, 1125, 1126, 1127, 1130, 1131, 1132, 1133, 1134, 1135, 1211, 1217, 1218, 1223, 1224, 1225, 1226, 1227, 1228, 1240, 1241, 1242, 1243, 1252, 1253, 1254, 1255, 1256, 1257, 1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1270, 1271, 1275, 1276, 1278, 1284, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1298, 1299, 1314, 1315, 1316, 1317, 1318, 1319, 1362, 1363, 1600, 2128, 2155, 2156, 2157, 2158, 2162, 2163, 2165, 2167, 2170, 2171, 2194, 2203, 2204, 2205, 2500, 2501, 2502, 2503, 1158, 1159, 1624, 2116, 2117, 2118, 2119, 2122, 2125, 1351, 1352, 1353, 2114, 2120, 2121, 2126, 2130, 2132, 2140, 2148, ];
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
          if (codigoPZ.includes(item.codigo_ped)) {
            um = 'PZ';
          }
          if (codigoCj.includes(item.codigo_ped)) {
            um = 'CJ';
          }
          if (codigoEm.includes(item.codigo_ped)) {
            um = 'EM';
          }
          if (codigoJg.includes(item.codigo_ped)) {
            um = 'JG';
          }
          if (codigosinner.includes(item.codigo_ped)) {
            um = 'INNER';
          }
    
    
          const unido = item.unido != null ? item.unido : 0;
          let cant_no_env = 0;
          let item_estado = estado;
          let inicio_surtido = null;
          let fin_surtido = null;
          let motivo = null;
    
          // if (item.pz_ && item.pz_ > 1 && item.cantidad % item.pz_ !== 0) {
          //   cant_no_env = item.cantidad;
          //   item_estado = 'B';
          //   inicio_surtido = now;
          //   fin_surtido = now;
          //   motivo = 'UM NO COINCIDE';
          // }
          
          if (codigosAnegar.includes(item.codigo_ped)) {
            motivo = `${item.cantidad} BACKORDER`;
            item.cantidad = 18; // cantidad forzada
          }

          if (item.pz_ && item.pz_ > 1 && item.cantidad % item.pz_ !== 0) {
            const resto = item.cantidad % item.pz_;
            cant_no_env = resto;
            motivo = 'UM NO COINCIDE';
            inicio_surtido = now;
            fin_surtido = now;
          
            // ✅ Si la cantidad es menor que el mínimo vendible, no se puede surtir nada
            if (item.cantidad < item.pz_) {
              item_estado = 'B'; // no se envía nada
            } else {
              item_estado = 'S'; // se puede surtir parcialmente
            }
          }
          
          
    
          await connection.query(insertPedidoSurtidoQuery, [
            pedido, item.tipo, item.codigo_ped, item.cantidad, item.registro, bahias.join(','), item_estado, um, item.clave, unido, usuarioId || null, cant_no_env, inicio_surtido, fin_surtido, now, motivo
          ]);
        }
      }
    }
    console.log(`Pedido ${pedido}  insertado en la tabla pedido_surtido.`);

    const estado_B = 1;
    const ubicacionesAExcluir = ['Pasillo-1', 'Pasillo-2', 'Pasillo-3', 'Pasillo-4', 'Pasillo-5', 'Pasillo-6', 'Pasillo-7', 'Pasillo-8'];
    const ubicacionesFiltradas = bahias.filter(bahia => !ubicacionesAExcluir.includes(bahia));

    if (ubicacionesFiltradas.length > 0) {
      const updateBahiasQuery = 'UPDATE bahias SET estado = ?, id_pdi = ?, ingreso = CURRENT_DATE WHERE bahia IN (?)';
      await connection.query(updateBahiasQuery, [estado_B, pedido, ubicacionesFiltradas.join(',')]);
    }

    // const deletePedidoQuery = 'DELETE FROM pedi WHERE pedido = ?';
    // await connection.query(deletePedidoQuery, [pedido]);
    const deletePedidoQuery = 'DELETE FROM pedi WHERE pedido = ? AND tipo = ?';
    await connection.query(deletePedidoQuery, [pedido, tipo]);

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
      INSERT INTO pedido_surtido (pedido, tipo, codigo_ped, cantidad, registro, ubi_bahia, estado, um, clave, unido, id_usuario, cant_no_env, inicio_surtido, fin_surtido, registro_surtido, unificado, motivo, fusion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    
    const codigosPedATADO = [3446, 3496, 3494, 3492, 3450, 3493, 3447, 3449, 3495, 3497, 3448, 3451, 4651, 4652];
    const codigoBLs = [4299,4300,2463,3496,2466,3450,3449,3495,3497,3448,3451,2464,4295,4307,2461,4303,2467,2471,4298,2462,4311,2465,4313,2468,2470,8307,1574,7410,7412];
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
            const resto = item.cantidad % item.pz_;
            cant_no_env = resto;
            motivo = 'UM NO COINCIDE';
            inicio_surtido = now;
            fin_surtido = now;
            
            // ✅ Si la cantidad es menor que el mínimo vendible, no se puede surtir nada
            if (item.cantidad < item.pz_) {
              item_estado = 'B'; // no se envía nada
            } else {
              item_estado = 'S'; // se puede surtir parcialmente
            }
          }

          console.log(`Insertando item UNI: ${JSON.stringify(item)}`);
          await connection.query(insertPedidoSurtidoQuery, [
            pedido, tipo, item.codigo_ped, item.cantidad, now, bahias.join(','), item_estado, um, item.clave, unido, usuarioId || null, cant_no_env, inicio_surtido, fin_surtido, now, item.unificado, motivo, pedido
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

const pool = require("../config/database");
const moment = require("moment");

const getObservacionesPorClientes = async (req, res) => {
  const { clientes } = req.body; // Recibe un array con los números de clientes

  if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
    return res.status(400).json({ message: "No se proporcionaron clientes válidos" });
  }

  try {
    // Generar los placeholders "?" para cada cliente en la consulta SQL
    const placeholders = clientes.map(() => "?").join(", ");
    const query = `SELECT NUM_CLIENTE, OBSERVACIONES FROM clientes_especificacciones WHERE NUM_CLIENTE IN (${placeholders})`;

    const [rows] = await pool.query(query, clientes);

    // Crear un mapa para almacenar las observaciones
    const observacionesMap = {};
    clientes.forEach((cliente) => {
      observacionesMap[cliente] = "Sin observaciones"; // Valor por defecto
    });

    rows.forEach((row) => {
      observacionesMap[row.NUM_CLIENTE] = row.OBSERVACIONES || "Sin observaciones";
    });

    res.json(observacionesMap);
  } catch (error) {
    console.error("Error al obtener observaciones:", error.message);
    res.status(500).json({ message: "Error al obtener observaciones" });
  }
};


const getUltimaFechaEmbarque = async (req, res) => {
  const { pedido } = req.params; // Tomamos el "pedido" como parámetro

  try {
    // Consulta SQL para obtener el último registro de embarque
    const query = `
            SELECT registro_embarque 
            FROM pedido_embarque 
            WHERE pedido = ?
            ORDER BY registro_embarque DESC 
            LIMIT 1;
        `;

    const [rows] = await pool.query(query, [pedido]); // Ejecutamos la consulta con el número de pedido

    if (rows.length > 0) {
      // Si encontramos un registro, devolvemos la fecha de embarque
      res.json({ registro_embarque: rows[0].registro_embarque });
    } else {
      // Si no encontramos registros, devolvemos un mensaje adecuado
      res.json({ message: "No se encontraron registros para este pedido" });
    }
  } catch (error) {
    console.error("Error al obtener la fecha de embarque:", error.message);
    res.status(500).json({ message: "Error al obtener la fecha de embarque" });
  }
};

const insertarRutas = async (req, res) => {
  const { rutas } = req.body;
  // console.log("📥 Datos recibidos del frontend:", rutas);

  try {
    for (let ruta of rutas) {
      const {
        routeName,
        FECHA,
        "NO ORDEN": noOrden,
        NO_FACTURA: noFactura,
        "NUM. CLIENTE": numCliente,
        "NOMBRE DEL CLIENTE": nombreCliente,
        ZONA,
        MUNICIPIO,
        ESTADO,
        OBSERVACIONES,
        TOTAL,
        PARTIDAS,
        PIEZAS,
        TIPO,
        DIRECCION,
        TELEFONO,
        CORREO,
        GUIA, // ✅ Agregamos GUIA
      } = ruta;

      const formattedDate = moment(FECHA, "DD/MM/YYYY").format("YYYY-MM-DD");

      // Consulta SQL
      const query = `
                INSERT INTO paqueteria (routeName, FECHA, \`NO ORDEN\`, \`NO_FACTURA\`, \`NUM. CLIENTE\`, 
                    \`NOMBRE DEL CLIENTE\`, ZONA, MUNICIPIO, ESTADO, OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS, 
                    TRANSPORTE, PAQUETERIA, TIPO, DIRECCION, TELEFONO, CORREO, GUIA) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      // Eliminado el cálculo de IVA. Se inserta TOTAL directamente.
      const values = [
        routeName,
        formattedDate,
        noOrden,
        noFactura,
        numCliente,
        nombreCliente,
        ZONA,
        MUNICIPIO,
        ESTADO,
        OBSERVACIONES,
        TOTAL,
        PARTIDAS,
        PIEZAS,
        routeName,
        routeName,
        TIPO,
        DIRECCION,
        TELEFONO,
        CORREO,
        GUIA,
      ];

      await pool.query(query, values);
    }

    res.status(200).json({ message: "✅ Rutas insertadas correctamente." });
  } catch (error) {
    console.error("❌ Error al insertar las rutas:", error.message);
    res.status(500).json({ message: "Error al insertar las rutas" });
  }
};

const obtenerRutasDePaqueteria = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query; // Paginación
    const offset = (page - 1) * limit;

    const query = "SELECT * FROM paqueteria LIMIT ? OFFSET ?";
    const [rows] = await pool.query(query, [parseInt(limit), parseInt(offset)]);

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(404)
        .json({ message: "No hay rutas de paquetería disponibles." });
    }
  } catch (error) {
    console.error("Error al obtener rutas de paquetería:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener las rutas de paquetería" });
  }
};

const getFechaYCajasPorPedido = async (req, res) => {
  const { noOrden } = req.params;

  try {
    const query = `
                    SELECT
                    MAX(fin_embarque) AS ultimaFechaEmbarque,
                    SUM(caja) AS totalCajas
                    FROM pedido_finalizado
                    WHERE pedido = ?;
                `;

    const [rows] = await pool.query(query, [noOrden]);

    if (rows.length > 0) {
      res.json({
        ultimaFechaEmbarque: moment(rows[0].ultimaFechaEmbarque).format(
          "DD/MM/YYYY"
        ), // Formateamos la fecha
        totalCajas: rows[0].totalCajas,
      });
    } else {
      res.status(404).json({
        message: "No se encontraron registros para este número de pedido",
      });
    }
  } catch (error) {
    console.error(
      "Error al obtener la fecha de embarque y las cajas:",
      error.message
    );
    res
      .status(500)
      .json({ message: "Error al obtener la fecha de embarque y las cajas" });
  }
};

const actualizarGuia = async (req, res) => {
  const {
    paqueteria,
    fechaEntregaCliente,
    diasEntrega,
    entregaSatisfactoria,
    motivo,
    totalFacturaLT,
    prorateoFacturaLT,
    prorateoFacturaPaqueteria,
    gastosExtras,
    sumaFlete,
    porcentajeEnvio,
    porcentajePaqueteria,
    sumaGastosExtras,
    porcentajeGlobal,
    diferencia,
    noFactura,
    fechaFactura,
    tarimas,
    numeroFacturaLT,
    observaciones,
  } = req.body;

  try {
    const noOrden = req.params.noOrden || null;
    const guia = req.params.guia || null;

    if (!noOrden || !guia) {
      return res.status(400).json({
        message: "Faltan datos automáticos: noOrden o guia no definidos.",
      });
    }

    // Verifica que 'guia' no sea vacío ni nulo
    if (!guia || guia.trim() === "") {
      console.error("❌ Error: La guía no tiene un valor válido.");
      return res
        .status(400)
        .json({ message: "La guía no tiene un valor válido." });
    }

    const query = `
            UPDATE paqueteria
            SET 
                GUIA = ?, 
                PAQUETERIA = ?, 
                FECHA_DE_ENTREGA_CLIENTE = ?, 
                DIAS_DE_ENTREGA = ?, 
                ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA = ?, 
                MOTIVO = ?, 
                TOTAL_FACTURA_LT = ?, 
                PRORRATEO_FACTURA_LT = ?, 
                PRORRATEO_FACTURA_PAQUETERIA = ?, 
                GASTOS_EXTRAS = ?, 
                SUMA_FLETE = ?, 
                PORCENTAJE_ENVIO = ?, 
                PORCENTAJE_PAQUETERIA = ?, 
                SUMA_GASTOS_EXTRAS = ?, 
                PORCENTAJE_GLOBAL = ?, 
                DIFERENCIA = ?, 
                NO_FACTURA = ?, 
                FECHA_DE_FACTURA = ?, 
                TARIMAS = ?, 
                NUMERO_DE_FACTURA_LT = ?, 
                OBSERVACIONES = ?
            WHERE \`NO ORDEN\` = ?
        `;

    const [result] = await pool.query(query, [
      guia,
      paqueteria,
      fechaEntregaCliente,
      diasEntrega,
      entregaSatisfactoria,
      motivo,
      totalFacturaLT,
      prorateoFacturaLT,
      prorateoFacturaPaqueteria,
      gastosExtras,
      sumaFlete,
      porcentajeEnvio,
      porcentajePaqueteria,
      sumaGastosExtras,
      porcentajeGlobal,
      diferencia,
      noFactura,
      fechaFactura,
      tarimas,
      numeroFacturaLT,
      observaciones,
      noOrden,
    ]);

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: "Guía actualizada correctamente" });
    } else {
      return res.status(404).json({
        message:
          "No se encontró el número de orden o no se actualizó ninguna fila",
      });
    }
  } catch (error) {
    console.error("Error al actualizar la guía:", error.message);
    return res.status(500).json({ message: "Error al actualizar la guía" });
  }
};

const getPedidosEmbarque = async (req, res) => {
  try {
    const { codigo_ped } = req.params;

    const query = `
      SELECT pe.pedido, pe.codigo_ped, p.des, pe.cantidad, pe.um, pe._pz, 
             pe._inner, pe._master, pe.cantidad, pe.caja, pe.estado
      FROM pedido_finalizado pe
      LEFT JOIN productos p ON pe.codigo_ped = p.codigo_pro
      WHERE pe.pedido = ? LIMIT 50;
    `;

    const [rows] = await pool.query(query, [codigo_ped]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron registros." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener pedidos de embarque:", error);
    res.status(500).json({ message: "Error al obtener pedidos de embarque" });
  }
};

const getTransportistas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT nombre, apellidos, clave FROM transportista;
        `);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron transportistas." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los transportistas:", error);
    res.status(500).json({
      message: "Error al obtener los transportistas",
      error: error.message,
    });
  }
};

const getEmpresasTransportistas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT id_veh empresa, marca, modelo, placa FROM vehiculos;
        `);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron empresas de transportistas." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener las empresas de transportistas:", error);
    res.status(500).json({
      message: "Error al obtener las empresas de transportistas",
      error: error.message,
    });
  }
};

const insertarVisita = async (req, res) => {
  const { id_vit, clave_visit, motivo, personal, reg_entrada, id_veh } =
    req.body;
  // console.log("📥 Datos recibidos en la solicitud:", req.body);

  if (!id_veh) {
    return res
      .status(400)
      .json({ message: "El ID del vehículo es requerido." });
  }

  try {
    // Consulta para verificar si el vehículo existe
    const [vehiculoRows] = await pool.query(
      `SELECT * FROM vehiculos WHERE id_veh = ?`,
      [id_veh]
    );

    if (vehiculoRows.length === 0) {
      console.error(`❌ No se encontró el vehículo con ID: ${id_veh}`);
      return res
        .status(404)
        .json({ message: `No se encontró el vehículo con ID: ${id_veh}` });
    }

    // console.log("🔍 Vehículo encontrado:", vehiculoRows[0]);

    // Insertar la nueva visita
    const [insertVisitaResult] = await pool.query(
      `
            INSERT INTO visitas (id_vit, clave_visit, motivo, personal, reg_entrada, area_per) 
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [id_vit, clave_visit, motivo, personal, reg_entrada, 9]
    );

    if (insertVisitaResult.affectedRows === 0) {
      throw new Error("❌ Error al insertar la visita.");
    }

    // console.log(
    //   "✅ Visita insertada con éxito. Resultado:",
    //   insertVisitaResult
    // );

    // Actualizar el vehículo después de insertar la visita
    const [updateVehiculoResult] = await pool.query(
      `
            UPDATE vehiculos 
            SET clave_con = ?, acc_dir = 'S' 
            WHERE id_veh = ?
        `,
      [id_vit, id_veh]
    );

    if (updateVehiculoResult.affectedRows === 0) {
      throw new Error("❌ No se pudo actualizar el vehículo.");
    }

    // console.log("✅ Vehículo actualizado correctamente.");

    res.status(200).json({
      message: "Visita insertada y vehículo actualizado correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al insertar visita o actualizar vehículo:", error);
    res
      .status(500)
      .json({ message: "Error al insertar visita o actualizar vehículo" });
  }
};

const guardarDatos = async (req, res) => {
  const datos = req.body;

  try {
    for (const dato of datos) {
      await pool.query(
        "INSERT INTO rutas (no_orden, fecha, nombre_cliente, total, partidas, piezas) VALUES (?, ?, ?, ?, ?, ?)",
        [
          dato["NO ORDEN"],
          dato["FECHA"],
          dato["NOMBRE DEL CLIENTE"],
          dato["TOTAL"],
          dato["PARTIDAS"],
          dato["PIEZAS"],
        ]
      );
    }

    res.status(201).json({ message: "Datos guardados correctamente." });
  } catch (error) {
    console.error("Error al guardar datos:", error);
    res
      .status(500)
      .json({ message: "Error al guardar datos.", error: error.message });
  }
};

const obtenerDatos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rutas ORDER BY fecha DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener datos.", error: error.message });
  }
};

const eliminarRuta = async (req, res) => {
  const { noOrden } = req.params; // Recibimos el parámetro noOrden (o guia, según lo que necesites)

  try {
    // Consulta SQL para eliminar la ruta basándonos en el número de orden
    const query = "DELETE FROM paqueteria WHERE `NO ORDEN` = ?";

    const [result] = await pool.query(query, [noOrden]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Ruta eliminada correctamente." });
    } else {
      res
        .status(404)
        .json({ message: "No se encontró la ruta para eliminar." });
    }
  } catch (error) {
    console.error("Error al eliminar la ruta:", error.message);
    res.status(500).json({ message: "Error al eliminar la ruta" });
  }
};

const getClientesHistorico = async (req, res) => {
  try {
    const query = `SELECT DISTINCT NO_DE_CLIENTE, CLIENTE FROM historico_2024 ORDER BY CLIENTE ASC;`;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error.message);
    res.status(500).json({ message: "Error al obtener clientes del histórico" });
  }
};

const getHistoricoData = async (req, res) => {
  try {
    const { cliente, columnas, mes, estado } = req.query; // 🟢 Agregar estado a la petición

    if (!columnas || columnas.trim() === "") {
      return res.status(400).json({ message: "Debes seleccionar al menos una columna." });
    }

    const columnasArray = columnas.split(",").map(col => col.trim());

    const columnasPermitidas = [
      "NO_DE_ORDEN", "FECHA", "NO_DE_CLIENTE", "CLIENTE", "MUNICIPIO",
      "ESTADO", "OBSERVACIONES", "TOTAL", "PARTIDAS", "PIEZAS", "ZONA",
      "TIPO_DE_ZONA", "NUMERO_DE_FACTURA", "FECHA_DE_FACTURA", "FECHA_DE_EMBARQUE",
      "DIA_EN_QUE_ESTA_EN_RUTA", "HORA_DE_SALIDA", "CAJAS", "TARIMAS",
      "TRANSPORTE", "PAQUETERIA", "GUIA", "FECHA_DE_ENTREGA_CLIENTE",
      "DIAS_DE_ENTREGA", "ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA",
      "MOTIVO", "NUMERO_DE_FACTURA_LT", "TOTAL_FACTURA_LT",
      "PRORRATEO_$_FACTURA_LT", "PRORRATEO_$_FACTURA_PAQUETERIA",
      "GASTOS_EXTRAS", "SUMA_FLETE", "%_ENVIO", "%_PAQUETERIA",
      "SUMA_GASTOS_EXTRAS", "%_GLOBAL", "DIFERENCIA"
    ];

    const columnasFiltradas = columnasArray.filter(col => columnasPermitidas.includes(col));

    if (columnasFiltradas.length === 0) {
      return res.status(400).json({ message: "Las columnas seleccionadas no son válidas." });
    }

    // 🔹 Formateo de las columnas
    const columnasConvertidas = columnasFiltradas.map(col => {
      if (["TOTAL", "TOTAL_FACTURA_LT", "PRORRATEO_$_FACTURA_LT", "PRORRATEO_$_FACTURA_PAQUETERIA", "GASTOS_EXTRAS", "SUMA_FLETE", "SUMA_GASTOS_EXTRAS"].includes(col)) {
        return `CONCAT('$', FORMAT(SUM(\`${col}\`), 0)) AS \`${col}\``; // 🔹 Se suma y formatea como dinero
      }
      if (["%_ENVIO", "%_PAQUETERIA", "%_GLOBAL"].includes(col)) {
        return `CONCAT(FORMAT(AVG(\`${col}\`) * 100, 2), '%') AS \`${col}\``; // 🔹 Se obtiene el promedio y se formatea como porcentaje
      }
      return `\`${col}\``;
    });

    const columnasSeleccionadas = columnasConvertidas.join(", ");

    let query = `SELECT DISTINCT ${columnasSeleccionadas}, DATE_FORMAT(FECHA, '%d/%m/%Y') AS FECHA FROM historico_2024`;
    const queryParams = [];

    let whereClauses = [];

    // Filtrar por cliente si está seleccionado
    if (cliente && cliente.trim() !== "") {
      whereClauses.push("`NO_DE_CLIENTE` = ?");
      queryParams.push(cliente);
    }

    // Filtrar por mes si está seleccionado
    if (mes && mes.trim() !== "") {
      whereClauses.push("MONTH(STR_TO_DATE(`FECHA`, '%Y-%m-%d')) = ?");
      queryParams.push(mes);
    }

    // 🟢 Filtrar por estado si está seleccionado
    if (estado && estado.trim() !== "") {
      whereClauses.push("`ESTADO` = ?");
      queryParams.push(estado);
    }

    // Unir los filtros en la consulta
    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    // 🔹 Agrupar por estado si está seleccionado
    if (estado && estado.trim() !== "") {
      query += " GROUP BY ESTADO";
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows.length > 0 ? rows : []);
  } catch (error) {
    console.error("❌ Error al obtener datos históricos:", error.message);
    res.status(500).json({ message: "Error en el servidor al obtener los datos históricos" });
  }
};


const getColumnasHistorico = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'historico_2024'
    `;

    const [rows] = await pool.query(query);

    const columnas = rows.map(row => row.COLUMN_NAME);
    res.json(columnas);
  } catch (error) {
    console.error("❌ Error al obtener columnas del histórico:", error.message);
    res.status(500).json({ message: "Error en el servidor al obtener las columnas" });
  }
};




// const getOrderStatus = async (req, res) => {
//   const { orderNumber } = req.params;

//   try {
//     const tables = [
//       "pedi",
//       "pedido_surtido",
//       "pedido_embarque",
//       "pedido_finalizado",
//     ];
//     const statusInfo = {
//       pedi: { progress: 25, statusText: "En pedido" },
//       pedido_surtido: { progress: 50, statusText: "Surtiendo" },
//       pedido_embarque: { progress: 75, statusText: "Embarcando" },
//       pedido_finalizado: { progress: 100, statusText: "Finalizado" },
//     };

//     let bestStatus = { progress: 0, statusText: "No encontrado", table: null };

//     for (const table of tables) {
//       const [result] = await pool.query(
//         `SELECT * FROM ${table} WHERE pedido = ?`,
//         [orderNumber]
//       );

//       if (result.length > 0) {
//         const currentStatus = statusInfo[table];
//         // Actualizar solo si el progreso es mayor al actual
//         if (currentStatus.progress > bestStatus.progress) {
//           bestStatus = { ...currentStatus, table };
//         }
//       }
//     }

//     if (bestStatus.table) {
//       return res.status(200).json(bestStatus);
//     } else {
//       return res
//         .status(404)
//         .json({
//           message: "Pedido no encontrado",
//           progress: 0,
//           statusText: "No encontrado",
//         });
//     }
//   } catch (error) {
//     console.error("Error al buscar el pedido:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// };

module.exports = {
  getObservacionesPorClientes,
  getUltimaFechaEmbarque,
  insertarRutas,
  obtenerRutasDePaqueteria,
  getFechaYCajasPorPedido,
  actualizarGuia,
  getPedidosEmbarque,
  getTransportistas,
  getEmpresasTransportistas,
  insertarVisita,
  guardarDatos,
  obtenerDatos,
  eliminarRuta,
  getHistoricoData,
  getClientesHistorico,
  getColumnasHistorico,
  // getOrderStatus,
};

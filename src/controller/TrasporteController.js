const pool = require("../config/database");
const moment = require("moment");
const multer = require("multer");
const xlsx = require("xlsx");

const getObservacionesPorClientes = async (req, res) => {
  const { clientes } = req.body; // Recibe un array con los números de clientes

  if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
    return res
      .status(400)
      .json({ message: "No se proporcionaron clientes válidos" });
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
      observacionesMap[row.NUM_CLIENTE] =
        row.OBSERVACIONES || "Sin observaciones";
    });

    res.json(observacionesMap);
  } catch (error) {
    console.error("Error al obtener observaciones:", error.message);
    res.status(500).json({ message: "Error al obtener observaciones" });
  }
};

const getUltimaFechaEmbarque = async (req, res) => {
  try {
    // req.query.pedidos vendrá como una cadena tipo "70325,70454,70455"
    const { pedidos } = req.query;

    if (!pedidos) {
      return res.status(400).json({ message: "No se proporcionaron pedidos" });
    }

    const pedidosArray = pedidos.split(",").map((p) => `'${p.trim()}'`); // comillado para VARCHAR

    const query = `
      SELECT 
        pedido, 
        fin_embarque 
      FROM pedido_finalizado 
      WHERE pedido IN (${pedidosArray.join(",")})
    `;

    const [rows] = await pool.query(query);

    return res.json({ fechasEmbarque: rows });
  } catch (error) {
    console.error("Error al obtener fechas:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener fechas de embarque" });
  }
};

const insertarRutas = async (req, res) => {
  const { rutas } = req.body;

  if (!rutas || rutas.length === 0) {
    return res
      .status(400)
      .json({ message: "No se enviaron rutas para insertar." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

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
        "EJECUTIVO VTAS": ejecutivoVtas,
        GUIA,
        tipo_original,
      } = ruta;

      const formattedDate = moment(FECHA, "DD/MM/YYYY").format("YYYY-MM-DD");

      // 👉 Validación: si ya existe ese NO ORDEN con ese tipo_original, no lo insertes
      const [existe] = await connection.query(
        `SELECT 1 FROM paqueteria WHERE \`NO ORDEN\` = ? AND tipo_original = ? LIMIT 1`,
        [noOrden, tipo_original || null]
      );

      if (existe.length > 0) {
        console.log(
          `⏭️ Ya existe NO ORDEN ${noOrden} con tipo_original ${tipo_original}, no se insertará.`
        );
        continue; // Saltar este registro
      }

      const insertQuery = `
        INSERT INTO paqueteria (
          routeName, FECHA, \`NO ORDEN\`, \`NO_FACTURA\`, \`NUM. CLIENTE\`,
          \`NOMBRE DEL CLIENTE\`, ZONA, MUNICIPIO, ESTADO, OBSERVACIONES,
          TOTAL, PARTIDAS, PIEZAS, TRANSPORTE, PAQUETERIA, TIPO,
          DIRECCION, TELEFONO, CORREO, \`EJECUTIVO VTAS\`, GUIA, tipo_original
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

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
        ejecutivoVtas,
        GUIA,
        tipo_original || null,
      ];

      await connection.query(insertQuery, values);
    }

    await connection.commit();

    res.status(200).json({
      message:
        "✅ Rutas insertadas correctamente (sin duplicados por NO ORDEN y tipo_original).",
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al insertar rutas:", error.message);
    res.status(500).json({ message: "Error al insertar rutas" });
  } finally {
    connection.release();
  }
};

// Controlador: obtenerRutasDePaqueteria
const obtenerRutasDePaqueteria = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10000,
      tipo = "",
      guia = "",
      expandir = false,
      desde = "",
      hasta = "",
      mes = "",
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT id, routeName, FECHA, \`NO ORDEN\`, NO_FACTURA, FECHA_DE_FACTURA, 
             \`NUM. CLIENTE\`, \`NOMBRE DEL CLIENTE\`, ZONA, MUNICIPIO, ESTADO, 
             OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS, TARIMAS, TRANSPORTE, 
             PAQUETERIA, GUIA, FECHA_DE_ENTREGA_CLIENTE, DIAS_DE_ENTREGA,
             TIPO, DIRECCION, TELEFONO, TOTAL_FACTURA_LT, ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA,
             created_at, MOTIVO, NUMERO_DE_FACTURA_LT, FECHA_DE_ENTREGA_CLIENTE, tipo_original
      FROM paqueteria
      WHERE 1 = 1
    `;

    const params = [];

    const filtrandoPorGuia = guia && guia.trim() !== "";

    if (!filtrandoPorGuia) {
      if (mes) {
        const anioActual = new Date().getFullYear();
        query += " AND MONTH(created_at) = ? AND YEAR(created_at) = ?";
        params.push(mes, anioActual);
      } else {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 3);
        const fechaLimiteStr = fechaLimite.toISOString().slice(0, 10);
        query += " AND created_at >= ?";
        params.push(fechaLimiteStr);
      }
    }

    if (tipo) {
      query += " AND TIPO = ?";
      params.push(tipo);
    }

    if (guia) {
      query += " AND GUIA = ?";
      params.push(guia);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener rutas de paquetería:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener las rutas de paquetería" });
  }
};

const obtenerRutasParaPDF = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10000,
      tipo = "",
      guia = "",
      expandir = false,
      desde = "",
      hasta = "",
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT routeName, FECHA, \`NO ORDEN\`, NO_FACTURA, FECHA_DE_FACTURA, 
             \`NUM. CLIENTE\`, \`NOMBRE DEL CLIENTE\`, ZONA, MUNICIPIO, ESTADO, 
             OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS, TARIMAS, TRANSPORTE, 
             PAQUETERIA, GUIA, FECHA_DE_ENTREGA_CLIENTE, DIAS_DE_ENTREGA,
             TIPO, DIRECCION, TELEFONO, TOTAL_FACTURA_LT, ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA,
             created_at, MOTIVO, NUMERO_DE_FACTURA_LT, FECHA_DE_ENTREGA_CLIENTE, tipo_original
      FROM paqueteria
      WHERE 1 = 1
    `;

    const params = [];

    // 🔍 Si se pasan fechas personalizadas, usar ese rango
    if (desde && hasta) {
      query += " AND created_at BETWEEN ? AND ?";
      params.push(desde, hasta);
    }
    // 🗓 Si no hay fechas, tipo, ni guía, y no se pide expandir, mostrar solo últimos 3 días
    else if (!expandir && !tipo && !guia) {
      // const fechaLimite = new Date();
      // fechaLimite.setDate(fechaLimite.getDate() - 3);
      // const fechaLimiteStr = fechaLimite.toISOString().slice(0, 10);
      // query += " AND created_at >= ?";
      // params.push(fechaLimiteStr);
    }
    // 🗓 Si hay filtros o se activa expandir, mostrar datos del mes actual
    else {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      query += " AND MONTH(created_at) = ? AND YEAR(created_at) = ?";
      params.push(currentMonth, currentYear);
    }

    // 🔧 Filtros adicionales
    if (tipo) {
      query += " AND TIPO = ?";
      params.push(tipo);
    }

    if (guia) {
      query += " AND GUIA = ?";
      params.push(guia);
    }

    // 🔄 Orden y paginación
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    // 🧪 Ejecutar consulta
    const [rows] = await pool.query(query, params);

    res.json(rows);
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
                    MAX(caja) AS ultimaCaja 
                    FROM pedido_finalizado
                    WHERE pedido = ?;
                `;

    const [rows] = await pool.query(query, [noOrden]);

    if (rows.length > 0 && rows[0].ultimaFechaEmbarque) {
      res.json({
        ultimaFechaEmbarque: moment(rows[0].ultimaFechaEmbarque).format(
          "DD/MM/YYYY"
        ), // Formateamos la fecha correctamente
        ultimaCaja: rows[0].ultimaCaja || 0, // 🔹 Devolver 0 si no hay datos
      });
    } else {
      res.status(404).json({
        message: "No se encontraron registros para este número de pedido",
        ultimaCaja: 0, // 🔹 Asegurar que ultimaCaja no sea undefined
      });
    }
  } catch (error) {
    console.error(
      "Error al obtener la fecha de embarque y la última caja:",
      error.message
    );
    res.status(500).json({
      message: "Error al obtener la fecha de embarque y la última caja",
    });
  }
};

const actualizarGuia = async (req, res) => {
  const {
    guia,
    paqueteria,
    transporte,
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
    tipo,
  } = req.body;

  const id = req.params.id || null;

  if (!id || guia === undefined || guia.trim() === "") {
    return res.status(400).json({
      message: "❌ Faltan datos: ID o GUIA no son válidos.",
    });
  }

  try {
    // Verificar si existe el registro con ese ID
    const [existe] = await pool.query("SELECT * FROM paqueteria WHERE id = ?", [
      id,
    ]);

    if (existe.length === 0) {
      return res.status(404).json({
        message: "❌ No se encontró el pedido con ese ID.",
      });
    }

    // Actualizar campos
    const query = `
      UPDATE paqueteria SET 
        GUIA = ?, 
        PAQUETERIA = ?, 
        TRANSPORTE = ?, 
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
        OBSERVACIONES = ?, 
        TIPO = ?
      WHERE id = ?;
    `;

    const valores = [
      guia,
      paqueteria,
      transporte,
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
      tipo,
      id,
    ];

    const [resultado] = await pool.query(query, valores);

    if (resultado.affectedRows > 0) {
      return res.status(200).json({
        message: "✅ Actualización realizada correctamente.",
      });
    } else {
      return res.status(304).json({
        message: "⚠ No se modificaron campos (ya estaban iguales).",
      });
    }
  } catch (error) {
    console.error("❌ Error al actualizar:", error.message);
    return res.status(500).json({ message: "❌ Error al actualizar." });
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
      WHERE pe.pedido = ? LIMIT 100;
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
    const [rows] = await pool.query("SELECT * FROM rutas ORDER BY fecha DESC"); // ✅ Ahora muestra la más reciente primero

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
    res
      .status(500)
      .json({ message: "Error al obtener clientes del histórico" });
  }
};

const getHistoricoData = async (req, res) => {
  try {
    const { cliente, columnas, mes, estado } = req.query; // 🟢 Agregar estado a la petición

    if (!columnas || columnas.trim() === "") {
      return res
        .status(400)
        .json({ message: "Debes seleccionar al menos una columna." });
    }

    const columnasArray = columnas.split(",").map((col) => col.trim());

    const columnasPermitidas = [
      "NO_DE_ORDEN",
      "FECHA",
      "NO_DE_CLIENTE",
      "CLIENTE",
      "MUNICIPIO",
      "ESTADO",
      "OBSERVACIONES",
      "TOTAL",
      "PARTIDAS",
      "PIEZAS",
      "ZONA",
      "TIPO_DE_ZONA",
      "NUMERO_DE_FACTURA",
      "FECHA_DE_FACTURA",
      "FECHA_DE_EMBARQUE",
      "DIA_EN_QUE_ESTA_EN_RUTA",
      "HORA_DE_SALIDA",
      "CAJAS",
      "TARIMAS",
      "TRANSPORTE",
      "PAQUETERIA",
      "GUIA",
      "FECHA_DE_ENTREGA_CLIENTE",
      "DIAS_DE_ENTREGA",
      "ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA",
      "MOTIVO",
      "NUMERO_DE_FACTURA_LT",
      "TOTAL_FACTURA_LT",
      "PRORRATEO_$_FACTURA_LT",
      "PRORRATEO_$_FACTURA_PAQUETERIA",
      "GASTOS_EXTRAS",
      "SUMA_FLETE",
      "%_ENVIO",
      "%_PAQUETERIA",
      "SUMA_GASTOS_EXTRAS",
      "%_GLOBAL",
      "DIFERENCIA",
    ];

    const columnasFiltradas = columnasArray.filter((col) =>
      columnasPermitidas.includes(col)
    );

    if (columnasFiltradas.length === 0) {
      return res
        .status(400)
        .json({ message: "Las columnas seleccionadas no son válidas." });
    }

    // 🔹 Formateo de las columnas
    const columnasConvertidas = columnasFiltradas.map((col) => {
      if (
        [
          "TOTAL",
          "TOTAL_FACTURA_LT",
          "PRORRATEO_$_FACTURA_LT",
          "PRORRATEO_$_FACTURA_PAQUETERIA",
          "GASTOS_EXTRAS",
          "SUMA_FLETE",
          "SUMA_GASTOS_EXTRAS",
        ].includes(col)
      ) {
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
    res.status(500).json({
      message: "Error en el servidor al obtener los datos históricos",
    });
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

    const columnas = rows.map((row) => row.COLUMN_NAME);
    res.json(columnas);
  } catch (error) {
    console.error("❌ Error al obtener columnas del histórico:", error.message);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener las columnas" });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    let orderNumbers = req.body.orderNumbers || [req.params.orderNumber];
    if (!orderNumbers || orderNumbers.length === 0) {
      return res.status(400).json({ message: "No se enviaron pedidos" });
    }

    let statusResults = {};
    const fusionMap = {}; // 🔁 Mapa para fusiones bidireccionales

    const statusColors = {
      pedi: "#FF0000", // Rojo
      pedido_surtido: "#000000", // Negro
      pedido_embarque: "#0000FF", // Azul
      pedido_finalizado: "#008000", // Verde
    };

    const statusPriority = {
      pedi: 1,
      pedido_surtido: 2,
      pedido_embarque: 3,
      pedido_finalizado: 4,
    };

    // 🔎 Obtener tipo_original de la tabla paquetería
    const [tipoResults] = await pool.query(
      `SELECT \`NO ORDEN\` as pedido, tipo_original 
       FROM paqueteria 
       WHERE \`NO ORDEN\` IN (?)`,
      [orderNumbers]
    );
    const tipoOriginalMap = {};
    tipoResults.forEach(({ pedido, tipo_original }) => {
      tipoOriginalMap[pedido] = (tipo_original || "").toLowerCase();
    });

    // ✅ Función que procesa cada tabla
    const checkFusionStatus = (rows, tableName, statusText) => {
      rows.forEach((row) => {
        const pedido = row.pedido;
        const tipoDesdeTabla = (row.tipo || "").toLowerCase();
        const fusion = row.fusion || null;
        const tipoOriginal = tipoOriginalMap[pedido];

        const tipoCoincide = true;

        const baseColor = statusColors[tableName];
        const currentPriority = statusPriority[tableName];
        const previous = statusResults[pedido];
        const previousPriority = previous ? statusPriority[previous.table] : 0;

        if (tipoCoincide) {
          if (!previous || currentPriority > previousPriority) {
            // 🧠 Solo actualizamos si es de mayor prioridad
            statusResults[pedido] = {
              statusText,
              color: baseColor,
              table: tableName,
              fusionWith:
                fusion && fusion.trim() !== "" && fusion !== pedido
                  ? fusion
                  : null,
              tipo_original: tipoOriginal,
              tipo_tabla: tipoDesdeTabla,
            };
          }
        }

        // 🔁 Guardar fusión para sincronizar después
        if (fusion && fusion.trim() !== "" && fusion !== pedido) {
          fusionMap[pedido] = fusion;
          fusionMap[fusion] = pedido;
        }
      });
    };

    // 🔍 Consultas de las tablas principales
    let [result] = await pool.query(
      `SELECT pedido, tipo, fusion FROM pedido_finalizado WHERE pedido IN (?)`,
      [orderNumbers]
    );
    checkFusionStatus(result, "pedido_finalizado", "Pedido Finalizado");

    try {
      [result] = await pool.query(
        `SELECT DISTINCT pedido, tipo, fusion FROM pedido_embarque WHERE pedido IN (?)`,
        [orderNumbers]
      );
      checkFusionStatus(result, "pedido_embarque", "Embarcando");
    } catch (error) {
      console.warn("⚠️ Tabla 'pedido_embarque' no existe o falló.");
    }

    [result] = await pool.query(
      `SELECT pedido, tipo, fusion FROM pedido_surtido WHERE pedido IN (?)`,
      [orderNumbers]
    );
    checkFusionStatus(result, "pedido_surtido", "Surtiendo");

    [result] = await pool.query(
      `SELECT DISTINCT pedido, tipo FROM pedi WHERE pedido IN (?)`,
      [orderNumbers]
    );
    result = result.map((r) => ({ ...r, fusion: null }));

    // 🔥 Antes de procesar PEDI, proteger si ya hay un estado mejor
    const pediFiltrados = result.filter((row) => {
      const pedido = row.pedido;
      const previous = statusResults[pedido];
      if (previous) {
        // Ya existe en finalizado, embarque o surtido, NO TOCARLO
        return false;
      }
      return true;
    });

    checkFusionStatus(pediFiltrados, "pedi", "Por Asignar");

    // ❗ Asegurar que todos tengan algún estatus
    orderNumbers.forEach((orderNumber) => {
      if (!statusResults[orderNumber]) {
        statusResults[orderNumber] = {
          statusText: "Sin coincidencia de tipo",
          color: "#808080",
          table: "Desconocido",
          fusionWith: null,
          tipo_original: tipoOriginalMap[orderNumber] || "No definido",
          tipo_tabla: "No encontrado",
        };
      }
    });

    // 🔁 Segunda pasada: Sincronizar pedidos fusionados
    Object.entries(statusResults).forEach(([pedido, info]) => {
      const fusionWith = info.fusionWith;
      if (fusionWith && statusResults[fusionWith]) {
        const fusionStatus = statusResults[fusionWith];

        const priorityPedido = statusPriority[info.table] || 0;
        const priorityFusion = statusPriority[fusionStatus.table] || 0;

        const betterStatus =
          priorityPedido >= priorityFusion ? info : fusionStatus;

        statusResults[pedido] = {
          ...betterStatus,
          fusionWith: `${pedido}-${fusionWith}`,
          tipo_original: betterStatus.tipo_original, // <- usar del mejor estado
          tipo_tabla: betterStatus.tipo_tabla,
        };

        statusResults[fusionWith] = {
          ...betterStatus,
          fusionWith: `${fusionWith}-${pedido}`,
          tipo_original: betterStatus.tipo_original, // <- usar del mejor estado
          tipo_tabla: betterStatus.tipo_tabla,
        };
      }
    });

    res.json(statusResults);
  } catch (error) {
    console.error("❌ Error en la API:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const getFusionInfo = async (req, res) => {
  try {
    const orderNumbers = req.body.orderNumbers || [req.params.orderNumber];

    if (!orderNumbers || orderNumbers.length === 0) {
      return res.status(400).json({ message: "No se enviaron pedidos" });
    }

    const fusionResults = {};

    // Tablas que vas a revisar (con prioridad alta a baja)
    const tablas = [
      { nombre: "pedido_finalizado", etiqueta: "Finalizado" },
      { nombre: "pedido_embarque", etiqueta: "Embarcando" },
      { nombre: "pedido_surtido", etiqueta: "Surtiendo" },
    ];

    for (const tabla of tablas) {
      try {
        const [rows] = await pool.query(
          `SELECT pedido, fusion FROM ${tabla.nombre} WHERE pedido IN (?)`,
          [orderNumbers]
        );

        rows.forEach((row) => {
          const pedido = row.pedido;
          const fusion = row.fusion;

          if (!fusionResults[pedido]) {
            fusionResults[pedido] = {
              fusionado: false,
              fusionWith: null,
              estado: tabla.etiqueta,
              tabla: tabla.nombre,
            };
          }

          // Si está fusionado con otro distinto (y no vacío)
          if (fusion && fusion.trim() !== "" && fusion !== pedido) {
            fusionResults[pedido] = {
              fusionado: true,
              fusionWith: fusion,
              estado: tabla.etiqueta,
              tabla: tabla.nombre,
            };
          }
        });
      } catch (error) {
        console.warn(
          `⚠️ Error al consultar tabla ${tabla.nombre}:`,
          error.message
        );
      }
    }

    // Marcar los que no se encontraron en ninguna tabla
    orderNumbers.forEach((pedido) => {
      if (!fusionResults[pedido]) {
        fusionResults[pedido] = {
          fusionado: false,
          fusionWith: null,
          estado: "Pedido no encontrado",
          tabla: "Desconocido",
        };
      }
    });

    res.json(fusionResults);
  } catch (error) {
    console.error("❌ Error en getFusionInfo:", error);
    res.status(500).json({ message: "Error interno al consultar fusión" });
  }
};

const actualizarFacturasDesdeExcel = async (req, res) => {
  try {
    // Validar si se subió un archivo
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "❌ No se ha subido ningún archivo." });
    }

    // Leer el archivo Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Tomamos la primera hoja
    const sheet = workbook.Sheets[sheetName];

    // Convertir la hoja de Excel a JSON
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Validar si el archivo tiene datos
    if (data.length === 0) {
      return res
        .status(400)
        .json({ message: "❌ El archivo Excel está vacío." });
    }

    let actualizaciones = 0;

    // Recorrer cada fila del archivo Excel
    for (const row of data) {
      const noOrden = row["Número orden"];
      const noFactura = row["Número documento"];
      let fechaFactura = row["Fecha factura"];

      // Validar que los datos esenciales existan
      if (!noOrden || !noFactura || !fechaFactura) {
        // console.warn(
        //   `⚠ Saltando fila con datos faltantes: ${JSON.stringify(row)}`
        // );
        continue;
      }

      // Intentar convertir la fecha en caso de que sea un número serial de Excel
      if (typeof fechaFactura === "number") {
        fechaFactura = new Date((fechaFactura - 25569) * 86400 * 1000)
          .toISOString()
          .split("T")[0]; // Convertir a formato YYYY-MM-DD
      }

      // Actualizar la base de datos
      const query = `
        UPDATE paqueteria 
        SET NO_FACTURA = ?, FECHA_DE_FACTURA = ? 
        WHERE \`NO ORDEN\` = ?
      `;

      const [result] = await pool.query(query, [
        noFactura,
        fechaFactura,
        noOrden,
      ]);

      // Contar actualizaciones exitosas
      if (result.affectedRows > 0) {
        actualizaciones++;
      }
    }
  } catch (error) {
    console.error("❌ Error al actualizar facturas:", error);
    return res
      .status(500)
      .json({ message: "❌ Error al actualizar facturas." });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const actualizarPorGuia = async (req, res) => {
  const { guia } = req.params;

  const { numeroFacturaLT, totalFacturaLT, pedidos } = req.body;

  if (!guia || !Array.isArray(pedidos) || pedidos.length === 0) {
    return res
      .status(400)
      .json({ message: "❌ Faltan datos o pedidos vacíos." });
  }

  try {
    let totalActualizados = 0;

    for (const pedido of pedidos) {
      const {
        noOrden,
        prorrateoFacturaLT,
        prorrateoFacturaPaqueteria,
        sumaFlete,
        gastosExtras,
        porcentajeEnvio,
        porcentajePaqueteria,
        porcentajeGlobal,
      } = pedido;

      const query = `
        UPDATE paqueteria
        SET 
          NUMERO_DE_FACTURA_LT = ?, 
          TOTAL_FACTURA_LT = ?, 
          PRORRATEO_FACTURA_LT = ?, 
          PRORRATEO_FACTURA_PAQUETERIA = ?,
          SUMA_FLETE = ?, 
          GASTOS_EXTRAS = ?, 
          PORCENTAJE_ENVIO = ?, 
          PORCENTAJE_PAQUETERIA = ?, 
          PORCENTAJE_GLOBAL = ?
        WHERE GUIA = ? AND \`NO ORDEN\` = ?;
      `;

      const [result] = await pool.query(query, [
        numeroFacturaLT,
        totalFacturaLT,
        prorrateoFacturaLT,
        prorrateoFacturaPaqueteria,
        sumaFlete,
        gastosExtras,
        limpiarPorcentaje(porcentajeEnvio),
        limpiarPorcentaje(porcentajePaqueteria),
        limpiarPorcentaje(porcentajeGlobal),
        guia,
        noOrden,
      ]);

      totalActualizados += result.affectedRows;
    }

    return res.status(200).json({
      message: `✅ Se actualizaron ${totalActualizados} pedidos para la guía ${guia}.`,
    });
  } catch (error) {
    console.error("❌ Error al actualizar por guía:", error.message);
    return res
      .status(500)
      .json({ message: "❌ Error interno al actualizar los datos." });
  }
};

// Función auxiliar segura
function limpiarPorcentaje(valor) {
  if (typeof valor === "string")
    return parseFloat(valor.replace(" %", "")) || 0;
  if (typeof valor === "number") return valor;
  return 0;
}

//para que la puedan ver las demas computadora

const crearRuta = async (req, res) => {
  const { nombre, pedidos } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ message: "El nombre de la ruta es obligatorio." });
  }

  try {
    // Verificar si la ruta ya existe
    const [rutaExistente] = await pool.query(
      "SELECT id FROM rutas WHERE nombre = ?",
      [nombre]
    );

    let rutaId;
    if (rutaExistente.length > 0) {
      rutaId = rutaExistente[0].id;
    } else {
      const query = `INSERT INTO rutas (nombre) VALUES (?)`;
      const [result] = await pool.query(query, [nombre]);
      rutaId = result.insertId;
    }

    // Insertar los pedidos para esta ruta
    if (pedidos && pedidos.length > 0) {
      for (const pedido of pedidos) {
        const {
          no_orden,
          num_cliente,
          nombre_cliente,
          municipio,
          estado,
          total,
          partidas,
          piezas,
          fecha_emision,
          observaciones,
          tipo,
        } = pedido;

        // Verificar si ya existe en la misma ruta
        const [pedidoExistente] = await pool.query(
          "SELECT id FROM pedidos WHERE no_orden = ? AND ruta_id = ?",
          [no_orden, rutaId]
        );

        if (pedidoExistente.length === 0) {
          const insertPedidoQuery = `
            INSERT INTO pedidos 
            (ruta_id, no_orden, num_cliente, nombre_cliente, municipio, estado, total, partidas, piezas, fecha_emision, observaciones, tipo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          await pool.query(insertPedidoQuery, [
            rutaId,
            no_orden,
            num_cliente,
            nombre_cliente,
            municipio,
            estado,
            total || 0,
            partidas || 0,
            piezas || 0,
            fecha_emision,
            observaciones || "Sin observaciones",
            tipo || "", // Se asegura que tipo llegue correctamente
          ]);
        }
      }
    }

    res.status(201).json({
      message: "✅ Ruta creada o actualizada correctamente con pedidos nuevos.",
      ruta_id: rutaId,
    });
  } catch (error) {
    console.error("❌ Error al crear o actualizar la ruta:", error);
    res.status(500).json({ message: "Error al procesar la ruta." });
  }
};

const agregarPedidoARuta = async (req, res) => {
  const {
    ruta_id,
    no_orden,
    num_cliente,
    nombre_cliente,
    municipio,
    estado,
    total,
    partidas,
    piezas,
    fecha_emision,
    observaciones,
    tipo,
  } = req.body;

  if (
    !ruta_id ||
    !no_orden ||
    !num_cliente ||
    !nombre_cliente ||
    !fecha_emision
  ) {
    return res
      .status(400)
      .json({ message: "Faltan datos obligatorios para el pedido." });
  }

  try {
    const [existingOrder] = await pool.query(
      `SELECT id FROM pedidos WHERE no_orden = ? AND ruta_id = ?`,
      [no_orden, ruta_id]
    );

    if (existingOrder.length > 0) {
      return res
        .status(409)
        .json({ message: "El pedido ya existe en la ruta." });
    }

    const query = `
      INSERT INTO pedidos 
      (ruta_id, no_orden, num_cliente, nombre_cliente, municipio, estado, total, partidas, piezas, fecha_emision, observaciones, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      ruta_id,
      no_orden,
      num_cliente,
      nombre_cliente,
      municipio,
      estado,
      total || 0,
      partidas || 0,
      piezas || 0,
      fecha_emision,
      observaciones || "Sin observaciones",
      tipo || "", // Se asegura que tipo se registre
    ]);

    res
      .status(201)
      .json({ message: "✅ Pedido agregado correctamente a la ruta." });
  } catch (error) {
    // console.error("❌ Error al agregar pedido:", error);
    res.status(500).json({ message: "Error al agregar pedido a la ruta." });
  }
};

const obtenerRutasConPedidos = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id AS ruta_id, 
        r.nombre AS ruta_nombre, 
        r.fecha_creacion,
        p.id AS pedido_id, 
        p.no_orden, 
        p.num_cliente, 
        p.nombre_cliente, 
        p.municipio, 
        p.estado, 
        IFNULL(p.total, 0) AS total, 
        IFNULL(p.partidas, 0) AS partidas, 
        IFNULL(p.piezas, 0) AS piezas, 
        IFNULL(NULLIF(p.fecha_emision, '0000-00-00'), CURRENT_DATE()) AS fecha_emision,
        IFNULL(p.observaciones, 'Sin observaciones') AS observaciones,
        IFNULL(p.tipo, '') AS tipo
      FROM rutas r
      LEFT JOIN pedidos p ON r.id = p.ruta_id
      WHERE p.no_orden IS NOT NULL 
        AND NOT EXISTS (
          SELECT 1
          FROM paqueteria paq
          WHERE TRIM(paq.\`NO ORDEN\`) = p.no_orden
            AND TRIM(paq.\`TIPO_ORIGINAL\`) = p.tipo
        )
      ORDER BY r.fecha_creacion DESC, p.fecha_emision DESC;
    `;

    const [rows] = await pool.query(query);

    const rutas = {};
    rows.forEach((row) => {
      if (!rutas[row.ruta_id]) {
        rutas[row.ruta_id] = {
          id: row.ruta_id,
          nombre: row.ruta_nombre,
          fecha_creacion: row.fecha_creacion,
          pedidos: [],
        };
      }

      if (row.pedido_id) {
        rutas[row.ruta_id].pedidos.push({
          id: row.pedido_id,
          no_orden: row.no_orden,
          num_cliente: row.num_cliente,
          nombre_cliente: row.nombre_cliente,
          municipio: row.municipio,
          estado: row.estado,
          total: row.total,
          partidas: row.partidas,
          piezas: row.piezas,
          fecha_emision: row.fecha_emision,
          observaciones: row.observaciones,
          tipo: row.tipo,
        });
      }
    });

    res.status(200).json(Object.values(rutas));
  } catch (error) {
    console.error("❌ Error al obtener rutas y pedidos:", error);
    res.status(500).json({ message: "Error al obtener rutas y pedidos." });
  }
};

const obtenerRutaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT r.id AS ruta_id, r.nombre AS ruta_nombre, r.fecha_creacion,
             p.id AS pedido_id, p.no_orden, p.num_cliente, p.nombre_cliente, 
             p.municipio, p.estado, p.total, p.partidas, p.piezas, 
             p.fecha_emision, p.observaciones, p.tipo
      FROM rutas r
      LEFT JOIN pedidos p ON r.id = p.ruta_id
      WHERE r.id = ?
      ORDER BY p.fecha_emision DESC;
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ruta no encontrada." });
    }

    const ruta = {
      id: rows[0].ruta_id,
      nombre: rows[0].ruta_nombre,
      fecha_creacion: rows[0].fecha_creacion,
      pedidos: rows
        .filter((row) => row.pedido_id !== null)
        .map((row) => ({
          id: row.pedido_id,
          no_orden: row.no_orden,
          num_cliente: row.num_cliente,
          nombre_cliente: row.nombre_cliente,
          municipio: row.municipio,
          estado: row.estado,
          total: row.total,
          partidas: row.partidas,
          piezas: row.piezas,
          fecha_emision: row.fecha_emision,
          observaciones: row.observaciones,
          tipo: row.tipo, // agregado
        })),
    };

    res.status(200).json(ruta);
  } catch (error) {
    console.error("Error al obtener ruta:", error);
    res.status(500).json({ message: "Error al obtener la ruta." });
  }
};

// Terminacion de la ruras ok

const obtenerResumenDelDia = async (req, res) => {
  try {
    // Asegurar que los nombres de los días estén en español
    await pool.query("SET lc_time_names = 'es_ES'");

    const query = `
      SELECT 
        COUNT(DISTINCT \`NUM. CLIENTE\`) AS totalClientes,
        COUNT(DISTINCT \`NO ORDEN\`) AS totalPedidos,
        IFNULL(SUM(\`TOTAL\`), 0) AS totalGeneral,
        DATE_FORMAT(CURDATE(), '%W') AS diaActual,  -- Nombre del día (Ejemplo: jueves)
        DAYOFWEEK(CURDATE()) AS numeroDiaSemana     -- Número del día (Ejemplo: 5 para jueves)
      FROM paqueteria
      WHERE DATE(\`created_at\`) = CURDATE();
    `;

    const [result] = await pool.query(query);
    res.status(200).json(result[0]); // Enviar el primer resultado como JSON
  } catch (error) {
    console.error("❌ Error al obtener el resumen diario:", error);
    res.status(500).json({ message: "Error al obtener datos." });
  }
};

const getPaqueteriaData = async (req, res) => {
  try {
    const { fecha } = req.query;
    const getFormattedDate = (date = new Date()) =>
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Mexico_City",
      }).format(date);

    const selectedDate = fecha || getFormattedDate();

    const [paqueteria] = await pool.query(
      `SELECT 
        p.id,
        p.routeName,
        p.FECHA,
        p.\`NO ORDEN\` AS no_orden,
        p.\`NUM. CLIENTE\` AS num_cliente,
        p.\`NOMBRE DEL CLIENTE\` AS nombre_cliente,
        p.ESTADO,
        p.TOTAL,
        p.PARTIDAS,
        p.PIEZAS,
        p.created_at,
        p.tipo_original
      FROM paqueteria p
      WHERE DATE(p.created_at) = ?`,
      [selectedDate]
    );

    const pedidosConAvance = await Promise.all(
      paqueteria.map(async (pedido) => {
        const pedidoId = pedido.no_orden;
        const tipo = pedido.tipo_original;

        // 1. Buscar directamente por pedido
        let [[embarcado]] = await pool.query(
          `SELECT pedido, fusion, tipo FROM pedido_embarque 
       WHERE pedido = ? 
       AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
          [pedidoId, tipo]
        );

        if (!embarcado) {
          // 2. Si no se encontró directo, buscar en fusion
          [[embarcado]] = await pool.query(
            `SELECT pedido, fusion, tipo FROM pedido_embarque 
         WHERE FIND_IN_SET(?, fusion) 
         AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
            [pedidoId, tipo]
          );
        }

        if (embarcado) {
          return {
            ...pedido,
            avance: "100%",
            tablaOrigen: "EMBARQUES",
            tipo_encontrado: embarcado.tipo,
            fusion: embarcado.fusion || null,
          };
        }

        // Buscar en finalizado
        let [[finalizado]] = await pool.query(
          `SELECT pedido, fusion, tipo FROM pedido_finalizado 
       WHERE pedido = ? 
       AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
          [pedidoId, tipo]
        );

        if (!finalizado) {
          [[finalizado]] = await pool.query(
            `SELECT pedido, fusion, tipo FROM pedido_finalizado 
         WHERE FIND_IN_SET(?, fusion) 
         AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
            [pedidoId, tipo]
          );
        }

        if (finalizado) {
          return {
            ...pedido,
            avance: "100%",
            tablaOrigen: "FINALIZADO",
            tipo_encontrado: finalizado.tipo,
            fusion: finalizado.fusion || null,
          };
        }

        // Buscar en surtido
        let [[avanceRow]] = await pool.query(
          `SELECT 
          SUM(cant_surti) AS surtido, 
          SUM(cantidad) AS total,
          MAX(tipo) AS tipo, 
          MAX(fusion) AS fusion
       FROM pedido_surtido 
       WHERE pedido = ? 
       AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
          [pedidoId, tipo]
        );

        if (!avanceRow?.total) {
          [[avanceRow]] = await pool.query(
            `SELECT 
            SUM(cant_surti) AS surtido, 
            SUM(cantidad) AS total,
            MAX(tipo) AS tipo, 
            MAX(fusion) AS fusion
         FROM pedido_surtido 
         WHERE FIND_IN_SET(?, fusion)
         AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
            [pedidoId, tipo]
          );
        }

        if (avanceRow?.total > 0) {
          const avance = ((avanceRow.surtido / avanceRow.total) * 100).toFixed(
            0
          );
          return {
            ...pedido,
            avance: `${avance}%`,
            tablaOrigen: "SURTIDO",
            tipo_encontrado: avanceRow.tipo,
            fusion: avanceRow.fusion || null,
          };
        }

        // No encontrado
        return {
          ...pedido,
          avance: "0",
          tablaOrigen: "No Asignado",
          tipo_encontrado: null,
          fusion: null,
        };
      })
    );

    const grouped = pedidosConAvance.reduce((acc, row) => {
      const key = row.routeName || "Sin Ruta";
      if (!acc[key]) {
        acc[key] = { routeName: key, pedidos: [] };
      }
      acc[key].pedidos.push(row);
      return acc;
    }, {});

    const groupedArray = Object.values(grouped).sort((a, b) => {
      const numA = parseInt(a.routeName.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.routeName.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    res.json(groupedArray);
  } catch (error) {
    console.error("Error al obtener paquetería data:", error.message);
    res.status(500).json({
      message: "Error al obtener datos de paquetería",
      error: error.message,
    });
  }
};

const getPedidosDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    const getFormattedDate = (date = new Date()) =>
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Mexico_City",
      }).format(date);
    const selectedDate = fecha || getFormattedDate();

    // 1. Pedidos principales
    const [rows] = await pool.query(
      `
      SELECT 
        p.id, p.routeName, p.\`NO ORDEN\` AS no_orden, p.\`NUM. CLIENTE\` AS num_cliente,
        p.\`NOMBRE DEL CLIENTE\` AS nombre_cliente, p.ZONA, p.TOTAL, p.PARTIDAS, p.PIEZAS
      FROM paqueteria p
      WHERE DATE(p.created_at) = ?
    `,
      [selectedDate]
    );

    const pedidosIds = rows.map((p) => String(p.no_orden).trim());
    if (pedidosIds.length === 0) {
      return res.json([]); // No hay pedidos en paquetería ese día
    }

    // 2. Embarques y Finalizados
    const [embarques] = await pool.query(
      `SELECT pedido FROM pedido_embarque WHERE pedido IN (?)`,
      [pedidosIds]
    );
    const [finalizados] = await pool.query(
      `SELECT pedido FROM pedido_finalizado WHERE pedido IN (?)`,
      [pedidosIds]
    );
    const [surtidos] = await pool.query(
      `
      SELECT pedido, SUM(cant_surti) AS surtido, SUM(cantidad) AS total
      FROM pedido_surtido WHERE pedido IN (?)
      GROUP BY pedido
    `,
      [pedidosIds]
    );

    // 3. Indexamos para lookup rápido
    const embarcadoSet = new Set(embarques.map((e) => String(e.pedido).trim()));
    const finalizadoSet = new Set(
      finalizados.map((f) => String(f.pedido).trim())
    );
    const surtidoMap = new Map();
    for (const s of surtidos) {
      const key = String(s.pedido).trim();
      surtidoMap.set(key, s);
    }
    for (const s of surtidos) surtidoMap.set(s.pedido, s);

    // 4. Procesamiento
    const resumenPorRuta = {};
    const clientesGlobales = new Set();
    let partidasGlobal = 0,
      piezasGlobal = 0,
      totalGlobal = 0;
    let avanceGlobal = 0,
      totalPedidos = 0;

    for (const row of rows) {
      const key = row.routeName || "Sin Ruta";
      //const id = row.no_orden;
      const id = String(row.no_orden).trim();

      let avance = 0;

      if (embarcadoSet.has(id) || finalizadoSet.has(id)) {
        avance = 100;
      } else if (surtidoMap.has(id)) {
        const { surtido = 0, total = 0 } = surtidoMap.get(id) || {};

        avance = total > 0 ? (surtido / total) * 100 : 0;
      }

      if (!resumenPorRuta[key]) {
        resumenPorRuta[key] = {
          routeName: key,
          clientesUnicos: new Set(),
          totalPartidas: 0,
          totalPiezas: 0,
          totalTotal: 0,
          sumaAvance: 0,
          totalPedidos: 0,
        };
      }

      resumenPorRuta[key].clientesUnicos.add(row.num_cliente);
      resumenPorRuta[key].totalPartidas += Number(row.PARTIDAS) || 0;
      resumenPorRuta[key].totalPiezas += Number(row.PIEZAS) || 0;
      resumenPorRuta[key].totalTotal += Number(row.TOTAL) || 0;
      resumenPorRuta[key].sumaAvance += avance;
      resumenPorRuta[key].totalPedidos += 1;

      clientesGlobales.add(row.num_cliente);
      partidasGlobal += Number(row.PARTIDAS) || 0;
      piezasGlobal += Number(row.PIEZAS) || 0;
      totalGlobal += Number(row.TOTAL) || 0;
      avanceGlobal += avance;
      totalPedidos++;
    }

    const resumenPorRutas = Object.values(resumenPorRuta).map((ruta) => ({
      routeName: ruta.routeName,
      totalClientes: ruta.clientesUnicos.size,
      totalPartidas: ruta.totalPartidas,
      totalPiezas: ruta.totalPiezas,
      total: ruta.totalTotal.toFixed(2),
      avance: `${(ruta.sumaAvance / ruta.totalPedidos).toFixed(0)}%`,
    }));

    resumenPorRutas.sort((a, b) => {
      const numA = parseInt(a.routeName.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.routeName.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    const resumenGlobal = {
      routeName: "TOTAL GENERAL",
      totalClientes: clientesGlobales.size,
      totalPartidas: partidasGlobal,
      totalPiezas: piezasGlobal,
      total: totalGlobal.toFixed(2),
      avance: `${(avanceGlobal / totalPedidos).toFixed(0)}%`,
    };

    res.json([...resumenPorRutas, resumenGlobal]);
  } catch (error) {
    console.error("Error al obtener paquetería dia:", error.message);
    res.status(500).json({
      message: "Error al obtener datos de paquetería",
      error: error.message,
    });
  }
};

const datosPedidos = async (req, res) => {
  try {
    const { noOrden, numCliente } = req.query;

    if (!noOrden || !numCliente) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos: 'noOrden' y 'numCliente'.",
      });
    }

    // Buscar pedido específico
    const [result] = await pool.query(
      `SELECT
        p.id,
        p.FECHA,    
        p.\`NO ORDEN\` AS no_orden,
        p.tipo_original,
        p.NO_FACTURA,
        p.FECHA_DE_FACTURA,
        p.\`NUM. CLIENTE\` AS num_cliente,
        p.\`NOMBRE DEL CLIENTE\` AS nombre_cliente,
        p.ZONA,
        p.MUNICIPIO,
        p.ESTADO,
        p.OBSERVACIONES,
        p.TOTAL,
        p.PARTIDAS,
        p.PIEZAS,
        p.TARIMAS,
        p.TRANSPORTE,
        p.GUIA,
        p.FECHA_DE_ENTREGA_CLIENTE,
        p.DIAS_DE_ENTREGA,
        p.ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA AS entrega_satisfactoria,
        p.MOTIVO,
        p.TIPO,
        p.DIRECCION,
        p.TELEFONO,
        p.CORREO,
        p.\`EJECUTIVO VTAS\` AS ejecutivo_vtas
      FROM paqueteria p
      WHERE \`NO ORDEN\` = ? AND \`NUM. CLIENTE\` = ?
      LIMIT 1`,
      [noOrden, numCliente]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró un pedido con NO ORDEN ${noOrden} y NUM. CLIENTE ${numCliente}`,
      });
    }

    const pedido = result[0];
    const pedidoId = pedido.no_orden;
    const tipo = pedido.tipo_original;

    // Buscar en EMBARQUE
    let [[embarcado]] = await pool.query(
      `SELECT pedido, fusion, tipo FROM pedido_embarque 
       WHERE pedido = ? AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
      [pedidoId, tipo]
    );

    if (!embarcado) {
      [[embarcado]] = await pool.query(
        `SELECT pedido, fusion, tipo FROM pedido_embarque 
         WHERE FIND_IN_SET(?, fusion) AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
        [pedidoId, tipo]
      );
    }

    if (embarcado) {
      return res.json({
        success: true,
        data: {
          ...pedido,
          avance: "100%",
          tablaOrigen: "EMBARQUES",
          tipo_encontrado: embarcado.tipo,
          fusion: embarcado.fusion || null,
        },
      });
    }

    // Buscar en FINALIZADO
    let [[finalizado]] = await pool.query(
      `SELECT pedido, fusion, tipo FROM pedido_finalizado 
       WHERE pedido = ? AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
      [pedidoId, tipo]
    );

    if (!finalizado) {
      [[finalizado]] = await pool.query(
        `SELECT pedido, fusion, tipo FROM pedido_finalizado 
         WHERE FIND_IN_SET(?, fusion) AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
        [pedidoId, tipo]
      );
    }

    if (finalizado) {
      return res.json({
        success: true,
        data: {
          ...pedido,
          avance: "100%",
          tablaOrigen: "FINALIZADO",
          tipo_encontrado: finalizado.tipo,
          fusion: finalizado.fusion || null,
        },
      });
    }

    // Buscar en SURTIDO
    let [[avanceRow]] = await pool.query(
      `SELECT 
        SUM(cant_surti) AS surtido, 
        SUM(cantidad) AS total,
        MAX(tipo) AS tipo, 
        MAX(fusion) AS fusion
      FROM pedido_surtido 
      WHERE pedido = ? AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
      [pedidoId, tipo]
    );

    if (!avanceRow?.total) {
      [[avanceRow]] = await pool.query(
        `SELECT 
          SUM(cant_surti) AS surtido, 
          SUM(cantidad) AS total,
          MAX(tipo) AS tipo, 
          MAX(fusion) AS fusion
        FROM pedido_surtido 
        WHERE FIND_IN_SET(?, fusion) AND SUBSTRING_INDEX(tipo, ',', 1) = ?`,
        [pedidoId, tipo]
      );
    }

    if (avanceRow?.total > 0) {
      const avance = ((avanceRow.surtido / avanceRow.total) * 100).toFixed(0);

      return res.json({
        success: true,
        data: {
          ...pedido,
          avance: `${avance}%`,
          tablaOrigen: "SURTIDO",
          tipo_encontrado: avanceRow.tipo,
          fusion: avanceRow.fusion || null,
        },
      });
    }

    // No se encontró avance
    return res.json({
      success: true,
      data: {
        ...pedido,
        avance: "0%",
        tablaOrigen: "No Asignado",
        tipo_encontrado: null,
        fusion: null,
      },
    });
  } catch (error) {
    console.error("❌ Error en datosPedidos:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno al procesar el pedido",
      error: error.message,
    });
  }
};

//funcion de actualisar

const actualizarTipoOriginalDesdeExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "❌ No se ha subido ningún archivo." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    if (data.length === 0) {
      return res
        .status(400)
        .json({ message: "❌ El archivo Excel está vacío." });
    }

    let actualizaciones = 0;

    for (const row of data) {
      const noOrden = String(row["Número orden"] || "").trim();
      const tipoOrd = String(row["Tp ord"] || "").trim();

      if (!noOrden || !tipoOrd) {
        console.warn(
          `⚠ Saltando fila con datos faltantes: ${JSON.stringify(row)}`
        );
        continue;
      }

      const query = `
        UPDATE paqueteria
        SET tipo = ?
        WHERE no_orden = ?
      `;

      const [result] = await pool.query(query, [tipoOrd, noOrden]);

      if (result.affectedRows > 0) {
        actualizaciones++;
      }
    }

    return res.status(200).json({
      message: `✅ Se actualizaron ${actualizaciones} registros correctamente en la tabla pedidos.`,
    });
  } catch (error) {
    console.error("❌ Error al actualizar tipo en pedidos:", error);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

const actualizarGuiaCompleta = async (req, res) => {
  const { guia, transporte, paqueteria } = req.body;
  const noOrden = req.params.noOrden || null;

  try {
    if (
      !noOrden ||
      guia === undefined ||
      guia.trim() === "" ||
      transporte === undefined ||
      transporte.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "❌ Faltan datos: NO ORDEN, GUIA o TRANSPORTE/PAQUETERIA no son válidos.",
      });
    }

    // Verificar si el NO ORDEN existe
    const [registroExiste] = await pool.query(
      "SELECT GUIA FROM paqueteria WHERE `NO ORDEN` = ?",
      [noOrden]
    );

    if (registroExiste.length === 0) {
      return res.status(404).json({
        message: `❌ No se encontró la orden con NO ORDEN ${noOrden}.`,
      });
    }

    // 🔹 Actualizar GUIA, TRANSPORTE y PAQUETERIA
    const query = `
      UPDATE paqueteria
      SET 
        GUIA = ?,
        TRANSPORTE = ?,
        PAQUETERIA = ?
      WHERE \`NO ORDEN\` = ?;
    `;

    const [result] = await pool.query(query, [
      guia,
      transporte,
      paqueteria,
      noOrden,
    ]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "✅ Guía, Transporte y Paquetería actualizados correctamente.",
      });
    } else {
      return res.status(404).json({
        message: `⚠ No se pudo actualizar la orden ${noOrden}.`,
      });
    }
  } catch (error) {
    console.error("❌ Error al actualizar la guía completa:", error.message);
    return res.status(500).json({ message: "❌ Error interno al actualizar." });
  }
};

const getReferenciasClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT `Num_Cliente`, `Nombre_cliente`, `REFERENCIA` FROM referencias"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener referencias:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener referencias de clientes" });
  }
};

module.exports = {
  getReferenciasClientes,
  actualizarTipoOriginalDesdeExcel,
  getPaqueteriaData,
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
  getOrderStatus,
  upload,
  actualizarFacturasDesdeExcel,
  actualizarPorGuia,
  crearRuta,
  agregarPedidoARuta,
  obtenerRutasConPedidos,
  obtenerRutaPorId,
  obtenerResumenDelDia,
  getFusionInfo,
  getPedidosDia,
  obtenerRutasParaPDF,
  actualizarGuiaCompleta,
  datosPedidos,
};

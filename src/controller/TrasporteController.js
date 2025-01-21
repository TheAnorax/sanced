const pool = require("../config/database");
const moment = require("moment");

// Controller: obtenerObservacionesPorCliente
const getObservacionesPorCliente = async (req, res) => {
  const { venta } = req.params;
  try {
    const query =
      "SELECT OBSERVACIONES FROM clientes_especificacciones WHERE Venta = ?";
    const [rows] = await pool.query(query, [venta]);

    if (rows.length > 0) {
      res.json({ observacion: rows[0].OBSERVACIONES });
    } else {
      res.json({ observacion: "Sin observaciones disponibles" });
    }
  } catch (error) {
    console.error("Error al obtener observaciones:", error.message);
    res.status(500).json({ message: "Error al obtener observaciones" });
  }
};

// Función para obtener el último registro de embarque para un pedido específico
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

// Función para insertar las rutas en la tabla "paqueteria"
const insertarRutas = async (req, res) => {
  const { rutas } = req.body;
  console.log("Datos recibidos del frontend:", rutas); // Agregar log aquí para ver los datos

  try {
    for (let ruta of rutas) {
      const {
        routeName,
        FECHA,
        "NO ORDEN": noOrden,
        "NO FACTURA": noFactura,
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
      } = ruta;

      const formattedDate = moment(FECHA, "DD/MM/YYYY").format("YYYY-MM-DD");

      const totalConIva = (TOTAL * 1.16).toFixed(2);

      const query = `
                INSERT INTO paqueteria (routeName, FECHA, \`NO ORDEN\`, \`NO FACTURA\`, \`NUM. CLIENTE\`, 
                    \`NOMBRE DEL CLIENTE\`, ZONA, MUNICIPIO, ESTADO, OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS, TRANSPORTE, PAQUETERIA,TIPO, DIRECCION, TELEFONO, CORREO) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        totalConIva,
        PARTIDAS,
        PIEZAS,
        routeName,
        routeName,
        TIPO,
        DIRECCION,
        TELEFONO,
        CORREO,
      ];

      await pool.query(query, values);
    }

    res.status(200).json({ message: "Rutas insertadas correctamente." });
  } catch (error) {
    console.error("Error al insertar las rutas:", error.message);
    res.status(500).json({ message: "Error al insertar las rutas" });
  }
};

// Controller: obtenerRutasDePaqueteria
const obtenerRutasDePaqueteria = async (req, res) => {
  try {
    const query = "SELECT * FROM paqueteria"; // Consulta SQL para obtener todas las rutas
    const [rows] = await pool.query(query);

    if (rows.length > 0) {
      res.json(rows); // Devolver todas las rutas de paquetería
    } else {
      res
        .status(404)
        .json({ message: "No hay rutas de paquetería disponibles." });
    }
  } catch (error) {
    console.error("Error al obtener las rutas de paquetería:", error.message);
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
      res
        .status(404)
        .json({
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

// Función para actualizar el campo "GUIA"
const actualizarGuia = async (req, res) => {
  const { noOrden, guia } = req.body;

  try {
    const query = `
            UPDATE paqueteria
            SET GUIA = ?
            WHERE \`NO ORDEN\` = ?
        `;
    const [result] = await pool.query(query, [guia, noOrden]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Guía actualizada correctamente" });
    } else {
      res.status(404).json({ message: "No se encontró el número de orden" });
    }
  } catch (error) {
    console.error("Error al actualizar la guía:", error.message);
    res.status(500).json({ message: "Error al actualizar la guía" });
  }
};

const getPedidosEmbarque = async (req, res) => {
  try {
    const codigoPedido = req.params.codigo_ped;

    const [rows] = await pool.query(
      `
            SELECT 
                pe.pedido,
                pe.codigo_ped,
                p.des,
                pe.cantidad, 
                pe.um,
                pe._pz, 
                pe._inner, 
                pe._master,
                pe.cantidad,
                pe.caja,
                pe.estado
            FROM 
                pedido_finalizado pe
            JOIN 
                productos p ON pe.codigo_ped = p.codigo_pro
            WHERE 
                pe.pedido = ?;  -- Filtrar por número de pedido
      `,
      [codigoPedido]
    );

    console.log("Resultados de la consulta para el PDF:", rows);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron registros para este pedido." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los pedidos de embarque:", error);
    res.status(500).json({
      message: "Error al obtener los pedidos de embarque",
      error: error.message,
    });
  }
};

module.exports = {
  getObservacionesPorCliente,
  getUltimaFechaEmbarque,
  insertarRutas,
  obtenerRutasDePaqueteria,
  getFechaYCajasPorPedido,
  actualizarGuia,
  getPedidosEmbarque,
};

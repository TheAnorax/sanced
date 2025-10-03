const pool = require("../config/database");

const getRecibo = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        prod.des,
        r.codigo, 
        r.oc,
        r.cant_recibir,
        r.arribo,
        r.cant_recibida,
        r.recepcion,
        us.name,
        r.estado  
      FROM recibo r
      LEFT JOIN productos prod ON r.codigo = prod.codigo_pro
      LEFT JOIN usuarios us ON r.usuario = us.id_usu
    `);
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los recibo", error: error.message });
  }
};

const updateVolumetria = async (req, res) => {
  const {
    codigo,
    cajas_cama,
    camas_tarima,
    piezas_caja,
    cajas_tarima,
    piezas_tarima,
  } = req.body;
  console.log("tarimas", req.body);

  try {
    // Verificar si el código ya existe en la tabla volumetria
    const [rows] = await pool.query(
      `SELECT codigo FROM volumetria WHERE codigo = ?`,
      [codigo]
    );

    if (rows.length > 0) {
      // Si existe, realizar actualización en volumetria
      await pool.query(
        `UPDATE volumetria SET cajas_cama = ?, camas_tarima = ?, pieza_caja = ?, cajas_tarima = ? , pieza_tarima = ? WHERE codigo = ?`,
        [
          cajas_cama,
          camas_tarima,
          piezas_caja,
          cajas_tarima,
          piezas_tarima,
          codigo,
        ]
      );
      console.log("Datos actualizados en volumetria");
    } else {
      // Si no existe, insertar los datos en volumetria
      await pool.query(
        `INSERT INTO volumetria (codigo, cajas_cama, camas_tarima, pieza_caja, cajas_tarima, pieza_tarima) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          cajas_cama,
          camas_tarima,
          piezas_caja,
          cajas_tarima,
          piezas_tarima,
        ]
      );
      console.log("Datos insertados en volumetria");
    }

    // Nueva actualización: Actualizar el campo _palet en la tabla productos
    await pool.query(`UPDATE productos SET _palet = ? WHERE codigo_pro = ?`, [
      piezas_tarima,
      codigo,
    ]);
    console.log(
      `Campo _palet actualizado en productos para el código: ${codigo}`
    );

    res.json({
      message:
        "Datos de volumetria actualizados correctamente y campo _palet actualizado en productos",
    });
  } catch (error) {
    console.error("Error al actualizar o insertar datos:", error);
    res.status(500).json({
      message: "Error al actualizar o insertar datos de volumetria y productos",
      error: error.message,
    });
  }
};

const saveRecibo = async (req, res) => {
  console.log("recibiendo");
  const {
    codigo,
    cantidad_recibida,
    fecha_recibo,
    oc,
    est, // Estado (enviado desde el frontend)
    pallete,
    restante,
    idRecibo,
  } = req.body;
  console.log("datos recibo", req.body);

  let responseSent = false;

  try {
    // Aseguramos que la fecha esté en un formato que MySQL entienda
    const formattedFechaRecibo = fecha_recibo.split("/").reverse().join("-"); // Convertir 'DD/MM/YYYY' a 'YYYY-MM-DD'

    // Consulta para obtener los datos de `recibo_compras` usando `idRecibo`
    const [reciboCompraRows] = await pool.query(
      `SELECT id_recibo, naviera, pedimento, usuario AS id_usuario, contenedor AS contenedor, cant_recibir, referencia 
      FROM recibo_compras 
      WHERE id_recibo = ?`,
      [idRecibo]
    );

    if (reciboCompraRows.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron datos en recibo_compras para el código y OC proporcionados.",
      });
    }

    const {
      id_recibo,
      naviera,
      pedimento,
      id_usuario,
      contenedor,
      cant_recibir,
      referencia,
    } = reciboCompraRows[0];

    // Verificar si existe un recibo en `recibo_cedis` con los mismos valores de `id_recibo_compras`
    const [existingRecibo] = await pool.query(
      `SELECT * FROM recibo_cedis WHERE id_recibo_compras = ?`,
      [id_recibo]
    );

    if (existingRecibo.length > 0) {
      // Si existe un registro, actualizamos los campos
      await pool.query(
        `UPDATE recibo_cedis 
        SET cantidad_recibida = cantidad_recibida + ?, 
            cantidad_ubicada = cantidad_ubicada + ?, 
            tarimas_completas = tarimas_completas + ?, 
            sobrante_tarima = sobrante_tarima + ?, 
            est = ?, 
            fecha_recibo = NOW() 
        WHERE id_recibo_compras = ?`,
        [
          cantidad_recibida,
          cantidad_recibida,
          pallete,
          restante,
          est,
          id_recibo,
        ]
      );

      if (!responseSent) {
        res.json({
          message: "Registro actualizado correctamente en recibo_cedis",
        });
        responseSent = true;
      }
    } else {
      // Si no existe un registro, insertamos todos los campos
      await pool.query(
        `INSERT INTO recibo_cedis (codigo, cantidad_total, cantidad_recibida, fecha_recibo, oc, contenedor, naviera, pedimento, est, id_usuario, tarimas_completas, sobrante_tarima, fecha_registro, cantidad_ubicada, ingreso_calidad, id_recibo_compras, referencia)
        VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?, ?)`,
        [
          codigo,
          cant_recibir, // cantidad_total a recibir
          cantidad_recibida,
          oc,
          contenedor,
          naviera,
          pedimento,
          est,
          id_usuario,
          pallete,
          restante,
          cantidad_recibida,
          id_recibo,
          referencia,
        ]
      );

      if (!responseSent) {
        res.json({
          message: "Datos del recibo guardados correctamente en recibo_cedis",
        });
        responseSent = true;
      }
    }

    // Verificar la cantidad recibida total para decidir si se debe actualizar `recibo_compras` a 'F'
    const [totalReceived] = await pool.query(
      `SELECT SUM(cantidad_recibida) AS total_recibida 
      FROM recibo_cedis 
      WHERE id_recibo_compras = ?`,
      [idRecibo]
    );

    if (totalReceived[0].total_recibida >= cant_recibir) {
      // Si la cantidad recibida es igual o mayor que la cantidad esperada en `recibo_compras`, actualizar el estado a 'F'
      await pool.query(
        `UPDATE recibo_compras SET estado = 'F' WHERE id_recibo = ?`,
        [idRecibo]
      );

      if (!responseSent) {
        res.json({
          message:
            "Estado actualizado a 'F' en recibo_compras, cantidad total recibida",
        });
        responseSent = true;
      }
    }
  } catch (error) {
    if (!responseSent) {
      console.error("Error al guardar los datos en la base de datos:", error);
      res.status(500).json({
        message: "Error al guardar los datos del recibo",
        error: error.message,
      });
    }
  }
};

const getRecibosPendientes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        rc.oc,
        rc.codigo,
        rc.cantidad_total AS Total,
        rc.cantidad_recibida AS Recibo,
        rc.est,
        rc.fecha_recibo,
        rcom.estado
      FROM recibo_cedis rc
      LEFT JOIN recibo_compras rcom 
             ON rc.oc = rcom.oc 
            AND rc.codigo = rcom.codigo
      WHERE DATE(rc.fecha_recibo) = CURDATE()
        AND rc.est = 'R'
        AND rcom.estado = 'F'
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener recibos pendientes:", error);
    res.status(500).json({
      message: "Error al obtener recibos pendientes",
      error: error.message,
    });
  }
};

const cancelarRecibo = async (req, res) => {
  const { oc, codigo } = req.body;

  try {
    // 1. Actualizar en recibo_cedis
    await pool.query(
      `UPDATE recibo_cedis 
       SET cantidad_recibida = 0, est = 'C'
       WHERE oc = ? AND codigo = ?`,
      [oc, codigo]
    );

    // 2. Actualizar en recibo_compras
    await pool.query(
      `UPDATE recibo_compras 
       SET estado = 'C'
       WHERE oc = ? AND codigo = ?`,
      [oc, codigo]
    );

    res.json({
      message: `Recibo OC ${oc} y código ${codigo} fue cancelado (estado C en ambas tablas).`,
    });
  } catch (error) {
    console.error("❌ Error al cancelar recibo:", error);
    res
      .status(500)
      .json({ message: "Error al cancelar recibo", error: error.message });
  }
};

module.exports = {
  getRecibo,
  updateVolumetria,
  saveRecibo,
  getRecibosPendientes,
  cancelarRecibo,
};

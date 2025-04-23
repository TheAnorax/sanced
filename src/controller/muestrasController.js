const pool = require('../config/database');

const Departamentos = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT nombre FROM departamentos`);
        const departamentos = rows.map(row => ({
            value: row.nombre,
            label: row.nombre,
        }));
        res.json(departamentos);
    } catch (error) {
        console.error("Error al obtener los departamentos:", error);
        res.status(500).json({ message: "Error al obtener los departamentos" });
    }
};

const buscarProducto = async (req, res) => {
    const { codigo } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT 
              codigo_pro AS codigo,
              des,
              um
            FROM productos
            WHERE codigo_pro = ?`,
            [codigo]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al buscar el producto:', error);
        res.status(500).json({ message: 'Error al buscar el producto' });
    }
};

const generarNuevoFolio = async (departamento) => {
    const prefix = departamento.slice(0, 3).toUpperCase();

    const [rows] = await pool.query(
        `SELECT folio FROM solicitudes WHERE folio LIKE ? ORDER BY id DESC LIMIT 1`,
        [`${prefix}-%`]
    );

    let numero = 1;

    if (rows.length > 0) {
        const match = rows[0].folio.match(/-(\d+)$/);
        if (match) {
            numero = parseInt(match[1]) + 1;
        }
    }

    return `${prefix}-${String(numero).padStart(3, '0')}`;
};

const guardarSolicitudes = async (req, res) => {
    const sol = req.body;

    try {
        const folio = await generarNuevoFolio(sol.departamento);

        const [result] = await pool.query(
            `INSERT INTO solicitudes 
            (folio, nombre, departamento, motivo, regresa_articulo, fecha, requiere_envio, detalle_envio, autorizado, enviado_para_autorizar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                folio,
                sol.nombre,
                sol.departamento,
                sol.motivo,
                sol.regresaArticulo,
                sol.fecha,
                sol.requiereEnvio,
                sol.detalleEnvio,
                sol.autorizado,
                sol.enviadoParaAutorizar,
            ]
        );

        const solicitudId = result.insertId;

        for (const producto of sol.carrito) {
            await pool.query(
                `INSERT INTO carrito (solicitud_id, codigo, descripcion, cantidad, imagen, ubicacion) 
               VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    solicitudId,
                    producto.codigo,
                    producto.des,
                    producto.cantidad,
                    producto.imagen,
                    producto.ubi,
                ]
            );
        }

        res.status(200).json({
            message: "Solicitud y productos guardados correctamente",
            folio,
        });
    } catch (error) {
        console.error("\u274C Error al guardar:", error);
        res.status(500).json({ message: "Error al guardar la solicitud" });
    }
};

const actualizarSolicitud = async (req, res) => {
    const { folio } = req.params;
    const { autorizado, enviadoParaAutorizar } = req.body;

    try {
        await pool.query(
            `UPDATE solicitudes SET autorizado = ?, enviado_para_autorizar = ? WHERE folio = ?`,
            [autorizado, enviadoParaAutorizar, folio]
        );

        res.json({ message: "Solicitud actualizada correctamente" });
    } catch (error) {
        console.error("\u274C Error al actualizar solicitud:", error);
        res.status(500).json({ message: "Error al actualizar solicitud" });
    }
};

const obtenerSolicitudes = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM solicitudes WHERE autorizado = 0`);
        for (const row of rows) {
            const [productos] = await pool.query(
                `SELECT * FROM carrito WHERE solicitud_id = ?`,
                [row.id]
            );
            row.carrito = productos;
        }
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        res.status(500).json({ message: "Error al obtener solicitudes" });
    }
};

const obtenerAutorizadas = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM solicitudes WHERE autorizado = 1`);
        for (const row of rows) {
            const [productos] = await pool.query(
                `SELECT * FROM carrito WHERE solicitud_id = ?`,
                [row.id]
            );
            row.carrito = productos;
        }
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener autorizadas:", error);
        res.status(500).json({ message: "Error al obtener solicitudes autorizadas" });
    }
};

const eliminarSolicitud = async (req, res) => {
    const { folio } = req.params;
  
    try {
      // Obtener el ID de la solicitud desde el folio
      const [rows] = await pool.query(
        `SELECT id FROM solicitudes WHERE folio = ?`,
        [folio]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }
  
      const solicitudId = rows[0].id;
  
      // Eliminar los productos del carrito relacionados
      await pool.query(`DELETE FROM carrito WHERE solicitud_id = ?`, [solicitudId]);
  
      // Eliminar la solicitud principal
      await pool.query(`DELETE FROM solicitudes WHERE folio = ?`, [folio]);
  
      res.status(200).json({ message: "Solicitud y productos eliminados correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar solicitud:", error);
      res.status(500).json({ message: "Error al eliminar solicitud" });
    }
  };
  

module.exports = {
    Departamentos,
    buscarProducto,
    guardarSolicitudes,
    obtenerSolicitudes,
    obtenerAutorizadas,
    actualizarSolicitud,
    eliminarSolicitud 
};
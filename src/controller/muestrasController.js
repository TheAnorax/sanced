const pool = require('../config/database');
const path = require("path");
const fs = require("fs/promises");
const moment = require("moment");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "j72525264@gmail.com",
        pass: "cnaa haoa izwh lerm", // ← tu app password generado en Gmail
    },
});


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
              um,
              _pz
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
        `SELECT folio FROM Solicitudes_muestras WHERE folio LIKE ? ORDER BY id DESC LIMIT 1`,
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

    const usuariosAutoAutorizados = [
        "Elias Sandler",
        "Eduardo Sandler",
        "Mauricio Sandler"
    ];

    try {
        const folio = await generarNuevoFolio(sol.departamento);

        const esAutoAutorizado = usuariosAutoAutorizados.includes(sol.nombre);
        const autorizado = esAutoAutorizado ? 1 : sol.autorizado;
        const enviadoParaAutorizar = esAutoAutorizado ? false : sol.enviadoParaAutorizar;
        const autorizado_por = esAutoAutorizado ? sol.nombre : null;

        // Insertar solicitud
        const [result] = await pool.query(
            `INSERT INTO Solicitudes_muestras 
      (folio, nombre, departamento, motivo, laboratorio, organismo_certificador, regresa_articulo, fecha, requiere_envio, detalle_envio, autorizado, enviado_para_autorizar, autorizado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                folio,
                sol.nombre,
                sol.departamento,
                sol.uso,
                sol.laboratorio || null,
                sol.organismo_certificador || null,
                sol.regresaArticulo,
                sol.fecha,
                sol.requiereEnvio,
                sol.detalleEnvio,
                autorizado,
                enviadoParaAutorizar,
                autorizado_por
            ]
        );

        const solicitudId = result.insertId;

        // Insertar productos del carrito
        for (const producto of sol.carrito) {
            await pool.query(
                `INSERT INTO Carrito_muestras (solicitud_id, codigo, descripcion, cantidad, imagen, ubicacion,um) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    solicitudId,
                    producto.codigo,
                    producto.des,
                    producto.cantidad,
                    producto.imagen,
                    producto.ubi,
                    producto.um || null
                ]
            );
        }

        // Enviar correo automático
        try {
            const rutaHTML = esAutoAutorizado
                ? path.join(__dirname, "templates", "correo_autorizado_muestra.html")
                : path.join(__dirname, "templates", "correo_solicitud_muestra.html");

            let html = await fs.readFile(rutaHTML, "utf8");

            const listaHTML = sol.carrito.map(prod =>
                `<li>${prod.codigo} - ${prod.des} (x${prod.cantidad})</li>`
            ).join("");

            html = html
                .replace(/{{folio}}/g, folio)
                .replace(/{{nombre}}/g, sol.nombre)
                .replace(/{{departamento}}/g, sol.departamento)
                .replace(/{{motivo}}/g, sol.uso)
                .replace(/{{fecha}}/g, moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]"))
                .replace(/{{productos}}/g, listaHTML);

            const destinatarios = esAutoAutorizado
                ? [
                    "jonathan.alcantara@santul.net",
                    "rodrigo.arias@santul.net",
                    "elias.sandler@santul.net",
                    "eduardo.sandler@santul.net",
                    "mauricio.sandler@santul.net"
                ]
                : ["jonathan.alcantara@santul.net"];

            await transporter.sendMail({
                from: `"Muestras Sanced" <j72525264@gmail.com>`,
                to: destinatarios,
                subject: esAutoAutorizado
                    ? `✅ Solicitud de muestra AUTORIZADA - ${folio}`
                    : `🧾 Nueva solicitud de muestra - ${folio}`,
                html,
                attachments: [
                    {
                        filename: "logo_sanced.png",
                        path: path.join(__dirname, "templates", "logob.png"),
                        cid: "logo_sanced"
                    }
                ]
            });

        } catch (errorCorreo) {
            console.error("❌ Error al enviar correo de muestra:", errorCorreo);
        }

        res.status(200).json({
            message: "Solicitud y productos guardados correctamente",
            folio
        });

    } catch (error) {
        console.error("❌ Error al guardar:", error);
        res.status(500).json({ message: "Error al guardar la solicitud" });
    }
};



const actualizarSolicitud = async (req, res) => {
    const { folio } = req.params;
    let { autorizado, enviadoParaAutorizar, autorizado_por } = req.body;

    try {
        // ✅ Asegurar que "autorizado" sea número
        autorizado = Number(autorizado);

        await pool.query(
            `UPDATE solicitudes_muestras SET 
          autorizado = ?, 
          enviado_para_autorizar = ?, 
          autorizado_por = ? 
       WHERE folio = ?`,
            [autorizado, enviadoParaAutorizar, autorizado_por, folio]
        );

        // ✅ Solo si fue autorizado
        if (autorizado === 1) {
            console.log("📢 Entrando a envío de correo por autorización");

            // Obtener datos de la solicitud
            const [solRows] = await pool.query(
                `SELECT * FROM solicitudes_muestras WHERE folio = ?`,
                [folio]
            );

            if (solRows.length > 0) {
                const solicitud = solRows[0];

                // Obtener productos
                const [productos] = await pool.query(
                    `SELECT * FROM Carrito_muestras WHERE solicitud_id = ?`,
                    [solicitud.id]
                );

                try {
                    // Leer HTML de plantilla
                    const rutaHTML = path.join(__dirname, "templates", "correo_autorizado_muestra.html");
                    let html = await fs.readFile(rutaHTML, "utf8");

                    // Armar lista de productos
                    const listaHTML = productos
                        .map((prod) => `<li>${prod.codigo} - ${prod.descripcion} (x${prod.cantidad})</li>`)
                        .join("");

                    // Reemplazar variables en HTML
                    html = html
                        .replace(/{{folio}}/g, folio)
                        .replace(/{{nombre}}/g, solicitud.nombre)
                        .replace(/{{departamento}}/g, solicitud.departamento)
                        .replace(/{{motivo}}/g, solicitud.motivo)
                        .replace(/{{fecha}}/g, moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]"))
                        .replace(/{{productos}}/g, listaHTML);

                    // Enviar correo
                    await transporter.sendMail({
                        from: `"Muestras Sanced" <j72525264@gmail.com>`,
                        to: [
                            "jonathan.alcantara@santul.net",
                            "rodrigo.arias@santul.net",
                            "analista.inventarios2@santul.net",
                            "supervisor.inventarios@santul.net",
                        ],
                        subject: `✅ Solicitud de muestra AUTORIZADA - ${folio}`,
                        html,
                        attachments: [
                            {
                                filename: "logo_sanced.png", // puede tener otro nombre real
                                path: path.join(__dirname, "templates", "logob.png"), // tu archivo original
                                cid: "logo_sanced" // debe coincidir con el HTML
                            }
                        ]

                    });

                    console.log("✅ Correo de autorización enviado correctamente.");
                } catch (errorCorreo) {
                    console.error("❌ Error al leer plantilla o enviar correo:", errorCorreo);
                }
            } else {
                console.warn("⚠️ Solicitud no encontrada para el folio:", folio);
            }
        }

        res.json({ message: "Solicitud actualizada correctamente." });
    } catch (error) {
        console.error("❌ Error al actualizar la solicitud:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};




const obtenerSolicitudes = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Solicitudes_muestras WHERE autorizado = 0`);
        for (const row of rows) {
            const [productos] = await pool.query(
                `SELECT * FROM Carrito_muestras WHERE solicitud_id = ?`,
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
        const [rows] = await pool.query(`SELECT * FROM Solicitudes_muestras WHERE autorizado IN (1, 2)`);
        for (const row of rows) {
            const [productos] = await pool.query(
                `SELECT * FROM Carrito_muestras WHERE solicitud_id = ?`,
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
            `SELECT id FROM Solicitudes_muestras WHERE folio = ?`,
            [folio]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        const solicitudId = rows[0].id;

        // Eliminar los productos del carrito relacionados
        await pool.query(`DELETE FROM Carrito_muestras WHERE solicitud_id = ?`, [solicitudId]);

        // Eliminar la solicitud principal
        await pool.query(`DELETE FROM Solicitudes_muestras WHERE folio = ?`, [folio]);

        res.status(200).json({ message: "Solicitud y productos eliminados correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar solicitud:", error);
        res.status(500).json({ message: "Error al eliminar solicitud" });
    }
};

const eliminarProductoDeSolicitud = async (req, res) => {
    const { folio, codigo } = req.params;

    try {
        // 1. Buscar ID de la solicitud
        const [rows] = await pool.query(
            `SELECT id FROM Solicitudes_muestras WHERE folio = ?`,
            [folio]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        const solicitudId = rows[0].id;

        // 2. Eliminar solo ese producto en esa solicitud
        const [result] = await pool.query(
            `DELETE FROM Carrito_muestras WHERE solicitud_id = ? AND codigo = ?`,
            [solicitudId, codigo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado en la solicitud" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
        res.status(500).json({ message: "Error al eliminar producto" });
    }
};

const guardarCantidadSurtida = async (req, res) => {
    const { folio, carrito } = req.body;

    try {
        for (const producto of carrito) {
            await pool.query(
                `UPDATE Carrito_muestras
           SET cantidad_surtida = ?
           WHERE solicitud_id = (
             SELECT id FROM Solicitudes_muestras WHERE folio = ?
           ) AND codigo = ?`,
                [producto.cantidad_surtida, folio, producto.codigo]
            );
        }

        res.status(200).json({ message: "Cantidades surtidas actualizadas correctamente." });
    } catch (error) {
        console.error("❌ Error al actualizar cantidades surtidas:", error);
        res.status(500).json({ message: "Error al actualizar cantidades surtidas." });
    }
};

const marcarSalida = async (req, res) => {
    const { folio } = req.params;
    const { salida_por } = req.body;

    try {
        await pool.query(
            "UPDATE solicitudes_muestras SET salida_por = ? WHERE folio = ?",
            [salida_por, folio]
        );

        res.json({ message: "✅ Salida registrada correctamente." });
    } catch (error) {
        console.error("❌ Error al registrar salida:", error);
        res.status(500).json({ message: "Error al registrar salida" });
    }
};

const registrarFinEmbarque = async (req, res) => {
    const { folio } = req.params;
    const { fin_embarcado_por } = req.body;

    try {
        await pool.query(
            "UPDATE solicitudes_muestras SET fin_embarcado_por = ?, fin_embarcado_at = NOW() WHERE folio = ?",
            [fin_embarcado_por, folio]
        );

        res.json({ message: "✅ Fin de embarque registrado correctamente." });
    } catch (error) {
        console.error("❌ Error al registrar fin de embarque:", error);
        res.status(500).json({ message: "Error al registrar fin de embarque" });
    }
};

const obtenerUbicacionesPorCodigo = async (req, res) => {
    const { codigo } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT ubi 
         FROM ubicaciones 
         WHERE code_prod = ?`,
            [codigo]
        );

        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener ubicaciones:", error);
        res.status(500).json({ message: "Error al obtener ubicaciones" });
    }
};

const actualizarContadorPDF = async (req, res) => {
    const { folio } = req.params;

    try {
        await pool.query(
            `UPDATE solicitudes_muestras SET pdf_generado = IFNULL(pdf_generado, 0) + 1 WHERE folio = ?`,
            [folio]
        );

        res.json({ message: "Contador PDF actualizado" });
    } catch (error) {
        console.error("❌ Error al actualizar contador de PDF:", error);
        res.status(500).json({ message: "Error al actualizar contador de PDF" });
    }
};


module.exports = {
    Departamentos,
    buscarProducto,
    guardarSolicitudes,
    obtenerSolicitudes,
    obtenerAutorizadas,
    actualizarSolicitud,
    eliminarSolicitud,
    eliminarProductoDeSolicitud,
    guardarCantidadSurtida,
    marcarSalida,
    obtenerUbicacionesPorCodigo,
    registrarFinEmbarque,
    actualizarContadorPDF
};
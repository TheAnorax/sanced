const pool = require("../config/database");
const path = require("path");
const fs = require("fs/promises");
const moment = require("moment");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const axios = require("axios");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "j72525264@gmail.com",
        pass: "cnaa haoa izwh lerm",
    },
});

const Departamentos = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT nombre FROM departamentos`);
        const departamentos = rows.map((row) => ({
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
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error al buscar el producto:", error);
        res.status(500).json({ message: "Error al buscar el producto" });
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

    return `${prefix}-${String(numero).padStart(3, "0")}`;
};

const guardarSolicitudes = async (req, res) => {
    const sol = req.body;

    const usuariosAutoAutorizados = [
        "Elias Sandler",
        "Eduardo Sandler",
        "Mauricio Sandler",
    ];

    try {
        const folio = await generarNuevoFolio(sol.departamento);

        const esAutoAutorizado = usuariosAutoAutorizados.includes(sol.nombre);
        const autorizado = esAutoAutorizado ? 1 : sol.autorizado;
        const enviadoParaAutorizar = esAutoAutorizado
            ? false
            : sol.enviadoParaAutorizar;
        const autorizado_por = esAutoAutorizado ? sol.nombre : null;

        // Insertar solicitud
        const [result] = await pool.query(
            `INSERT INTO Solicitudes_muestras 
   (folio, nombre, departamento, motivo, laboratorio, organismo_certificador, regresa_articulo, fecha, requiere_envio, detalle_envio, autorizado, enviado_para_autorizar, autorizado_por, observaciones)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                autorizado_por,
                sol.observaciones || null, // ✅ nuevo campo aquí
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
                    producto.um || null,
                ]
            );
        }

        // Enviar correo automático
        try {
            const rutaHTML = esAutoAutorizado
                ? path.join(__dirname, "templates", "correo_autorizado_muestra.html")
                : path.join(__dirname, "templates", "correo_solicitud_muestra.html");

            let html = await fs.readFile(rutaHTML, "utf8");

            const listaHTML = sol.carrito
                .map(
                    (prod) => `<li>${prod.codigo} - ${prod.des} (x${prod.cantidad})</li>`
                )
                .join("");

            html = html
                .replace(/{{folio}}/g, folio)
                .replace(/{{nombre}}/g, sol.nombre)
                .replace(/{{departamento}}/g, sol.departamento)
                .replace(/{{motivo}}/g, sol.uso)
                .replace(
                    /{{fecha}}/g,
                    moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]")
                )
                .replace(/{{productos}}/g, listaHTML);

            const destinatarios = esAutoAutorizado
                ? [
                    "jonathan.alcantara@santul.net",
                    // "rodrigo.arias@santul.net",
                    // "eduardo.sandler@santul.net",
                    // "mauricio.sandler@santul.net",
                    // "analista.inventarios2@santul.net",
                    // "supervisor.inventarios@santul.net",
                ]
                : [
                    "jonathan.alcantara@santul.net",
                    // "rodrigo.arias@santul.net",
                    // "eduardo.sandler@santul.net",
                    // "mauricio.sandler@santul.net",
                ];

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
                        cid: "logo_sanced",
                    },
                ],
            });
        } catch (errorCorreo) {
            console.error("❌ Error al enviar correo de muestra:", errorCorreo);
        }

        res.status(200).json({
            message: "Solicitud y productos guardados correctamente",
            folio,
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

        // 1) Actualizar los campos en la BD
        await pool.query(
            `UPDATE Solicitudes_muestras SET 
         autorizado = ?, 
         enviado_para_autorizar = ?, 
         autorizado_por = ? 
       WHERE folio = ?`,
            [autorizado, enviadoParaAutorizar, autorizado_por, folio]
        );

        // 2) Obtener datos de la solicitud para saber quién la solicitó
        const [solRows] = await pool.query(
            `SELECT * FROM Solicitudes_muestras WHERE folio = ?`,
            [folio]
        );
        if (solRows.length === 0) {
            console.warn("⚠️ Solicitud no encontrada para el folio:", folio);
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }
        const solicitud = solRows[0];

        // 3) Correo del solicitante según su nombre
        const correoDestino = correosPorNombre[solicitud.nombre];

        // 4) Correos fijos (quienes ya están por determinado)
        const correosFijos = [
            "rodrigo.arias@santul.net",
            "jonathan.alcantara@santul.net",
        ];

        // 5) Si fue AUTORIZADO (1), enviar correo de autorización
        if (autorizado === 1) {
            console.log("📢 Entrando a envío de correo por AUTORIZACIÓN");

            // Obtener productos para la lista en el correo
            const [productos] = await pool.query(
                `SELECT * FROM Carrito_muestras WHERE solicitud_id = ?`,
                [solicitud.id]
            );

            try {
                // Leer plantilla de autorización
                const rutaHTML = path.join(
                    __dirname,
                    "templates",
                    "correo_autorizado_muestra.html"
                );
                let html = await fs.readFile(rutaHTML, "utf8");

                // Armar lista de productos en <li>
                const listaHTML = productos
                    .map(
                        (prod) => `<li>${prod.codigo} - ${prod.descripcion} (x${prod.cantidad})</li>`
                    )
                    .join("");

                // Reemplazar marcadores en la plantilla
                html = html
                    .replace(/{{folio}}/g, folio)
                    .replace(/{{nombre}}/g, solicitud.nombre)
                    .replace(/{{departamento}}/g, solicitud.departamento)
                    .replace(/{{motivo}}/g, solicitud.motivo)
                    .replace(
                        /{{fecha}}/g,
                        moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]")
                    )
                    .replace(/{{productos}}/g, listaHTML);

                // Construir arreglo "to" = solicitante + correos fijos
                const destinatariosAut = [correoDestino, ...correosFijos];

                // Enviar correo de autorización
                await transporter.sendMail({
                    from: `"Muestras Sanced" <j72525264@gmail.com>`,
                    to: destinatariosAut,
                    subject: `✅ Solicitud de muestra AUTORIZADA - ${folio}`,
                    html,
                    attachments: [
                        {
                            filename: "logo_sanced.png",
                            path: path.join(__dirname, "templates", "logob.png"),
                            cid: "logo_sanced",
                        },
                    ],
                });

                console.log("✅ Correo de autorización enviado a:", destinatariosAut);
            } catch (errorCorreo) {
                console.error(
                    "❌ Error al leer plantilla o enviar correo de autorización:",
                    errorCorreo
                );
            }
        }

        // 6) Si se CANCELÓ (2), enviar correo de cancelación
        if (autorizado === 2) {
            console.log("📢 Entrando a envío de correo por CANCELACIÓN");

            try {
                // Leer plantilla de cancelación
                const rutaHTMLCan = path.join(
                    __dirname,
                    "templates",
                    "correo_cancelacion_muestra.html"
                );
                let htmlCan = await fs.readFile(rutaHTMLCan, "utf8");

                // Reemplazar marcadores en la plantilla de cancelación
                htmlCan = htmlCan
                    .replace(/{{folio}}/g, folio)
                    .replace(/{{nombre}}/g, solicitud.nombre)
                    .replace(/{{departamento}}/g, solicitud.departamento)
                    .replace(/{{motivo}}/g, solicitud.motivo)
                    .replace(
                        /{{fecha}}/g,
                        moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]")
                    );

                // Construir arreglo "to" = solicitante + correos fijos
                const destinatariosCan = [correoDestino, ...correosFijos];

                // Enviar correo de cancelación
                await transporter.sendMail({
                    from: `"Muestras Sanced" <j72525264@gmail.com>`,
                    to: destinatariosCan,
                    subject: `❌ Solicitud de muestra CANCELADA - ${folio}`,
                    html: htmlCan,
                    attachments: [
                        {
                            filename: "logo_sanced.png",
                            path: path.join(__dirname, "templates", "logob.png"),
                            cid: "logo_sanced",
                        },
                    ],
                });

                console.log("✅ Correo de cancelación enviado a:", destinatariosCan);
            } catch (errorCorreoCan) {
                console.error(
                    "❌ Error al leer plantilla o enviar correo de cancelación:",
                    errorCorreoCan
                );
            }
        }

        // 7) Responder siempre al front-end
        res.json({ message: "Solicitud actualizada correctamente." });
    } catch (error) {
        console.error("❌ Error al actualizar la solicitud:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};



const obtenerSolicitudes = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM Solicitudes_muestras WHERE autorizado = 0`
        );
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
        const [rows] = await pool.query(`
      SELECT * 
      FROM Solicitudes_muestras 
      WHERE autorizado IN (1, 2)
      ORDER BY created_at DESC 
    `);

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
        res
            .status(500)
            .json({ message: "Error al obtener solicitudes autorizadas" });
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
        await pool.query(`DELETE FROM Carrito_muestras WHERE solicitud_id = ?`, [
            solicitudId,
        ]);

        // Eliminar la solicitud principal
        await pool.query(`DELETE FROM Solicitudes_muestras WHERE folio = ?`, [
            folio,
        ]);

        res
            .status(200)
            .json({ message: "Solicitud y productos eliminados correctamente" });
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
            return res
                .status(404)
                .json({ message: "Producto no encontrado en la solicitud" });
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

        res
            .status(200)
            .json({ message: "Cantidades surtidas actualizadas correctamente." });
    } catch (error) {
        console.error("❌ Error al actualizar cantidades surtidas:", error);
        res
            .status(500)
            .json({ message: "Error al actualizar cantidades surtidas." });
    }
};

const marcarSalida = async (req, res) => {
    const { folio } = req.params;
    const { salida_por, accion } = req.body;

    try {
        // Obtener datos base de la solicitud
        const [rows] = await pool.query(
            "SELECT id, nombre, requiere_envio FROM solicitudes_muestras WHERE folio = ?",
            [folio]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        const solicitud = rows[0];

        // Si solo se quiere mostrar los datos
        if (accion === "mostrar") {
            // Obtener datos adicionales
            const [extra] = await pool.query(
                `SELECT departamento, motivo, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS fecha
           FROM solicitudes_muestras WHERE folio = ?`,
                [folio]
            );

            const [productos] = await pool.query(
                `SELECT codigo, descripcion, cantidad, cantidad_surtida
           FROM Carrito_muestras
           WHERE solicitud_id = ?`,
                [solicitud.id]
            );

            return res.json({
                folio,
                nombre: solicitud.nombre,
                requiere_envio: solicitud.requiere_envio,
                departamento: extra[0].departamento,
                motivo: extra[0].motivo,
                fecha: extra[0].fecha,
                productos,
            });
        }

        // Confirmar salida
        await pool.query(
            "UPDATE solicitudes_muestras SET salida_por = ? WHERE folio = ?",
            [salida_por, folio]
        );

        // Enviar correo solo si es de recolección
        if (!solicitud.requiere_envio || solicitud.requiere_envio === 0) {
            const correoDestino = correosPorNombre[solicitud.nombre];

            // Correos adicionales fijos
            const correosFijos = [
                // "rodrigo.arias@santul.net",
                "jonathan.alcantara@santul.net",
                // "eva.bautista@santul.net",
            ];

            if (correoDestino) {
                const rutaHTML = path.join(
                    __dirname,
                    "templates",
                    "correo_confirmacion_salida.html"
                );
                let html = await fs.readFile(rutaHTML, "utf8");

                html = html
                    .replace(/{{folio}}/g, folio)
                    .replace(/{{nombre}}/g, solicitud.nombre)
                    .replace(
                        /{{fecha}}/g,
                        moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]")
                    );

                await transporter.sendMail({
                    from: `"Muestras Sanced" <j72525264@gmail.com>`,
                    to: correoDestino,
                    cc: correosFijos, // ✅ se agregan correos fijos como copia
                    subject: `✅ Tus muestras han sido ENTREGADAS – Folio ${folio}`,
                    html,
                    attachments: [
                        {
                            filename: "logo_sanced.png",
                            path: path.join(__dirname, "templates", "logob.png"),
                            cid: "logo_sanced",
                        },
                    ],
                });
            }
        }

        res.json({ message: "✅ Salida registrada y correo enviado si aplica." });
    } catch (error) {
        console.error("❌ Error al registrar salida:", error);
        res.status(500).json({ message: "Error al registrar salida" });
    }
};

const registrarFinEmbarque = async (req, res) => {
    const { folio } = req.params;
    const { fin_embarcado_por, accion } = req.body;

    try {
        // 1) Obtener datos de la solicitud
        const [rows] = await pool.query(
            "SELECT id, nombre, departamento, motivo, requiere_envio, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS fecha FROM solicitudes_muestras WHERE folio = ?",
            [folio]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }

        const solicitud = rows[0];
        const solicitudId = solicitud.id;

        // 2) Obtener productos
        const [productos] = await pool.query(
            "SELECT codigo, descripcion, cantidad, cantidad_surtida, um FROM Carrito_muestras WHERE solicitud_id = ?",
            [solicitudId]
        );

        // 3) Si solo se quiere mostrar info, responder y salir
        if (accion === "mostrar") {
            return res.json({
                folio,
                nombre: solicitud.nombre,
                departamento: solicitud.departamento,
                motivo: solicitud.motivo,
                fecha: solicitud.fecha,
                productos,
            });
        }

        // 4) Registrar fin de embarque
        await pool.query(
            "UPDATE solicitudes_muestras SET fin_embarcado_por = ?, fin_embarcado_at = NOW() WHERE folio = ?",
            [fin_embarcado_por, folio]
        );

        // 5) Generar QR solo con el folio
        // 5) Generar QR con solo el texto del folio
        const qrData = folio;
        const qrImageDataURL = await QRCode.toDataURL(qrData);

        // 6) Preparar envío de correo
        const correoDestino = correosPorNombre[solicitud.nombre];
        const correosFijos = [
            "rodrigo.arias@santul.net",
            "jonathan.alcantara@santul.net",
        ];

        if (!correoDestino) {
            return res
                .status(400)
                .json({ message: "Correo no encontrado para este nombre." });
        }

        // 7) Cargar plantilla
        const plantilla = solicitud.requiere_envio
            ? "correo_confirmacion_envio.html"
            : "correo_confirmacion_entrega.html";
        const rutaHTML = path.join(__dirname, "templates", plantilla);
        let html = await fs.readFile(rutaHTML, "utf8");

        html = html
            .replace(/{{folio}}/g, folio)
            .replace(/{{nombre}}/g, solicitud.nombre)
            .replace(/{{departamento}}/g, solicitud.departamento)
            .replace(/{{motivo}}/g, solicitud.motivo)
            .replace(
                /{{fecha}}/g,
                moment().format("D [de] MMMM [de] YYYY, HH:mm [hrs]")
            );

        // 8) Construir tabla HTML
        const tablaProductosHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ccc; padding: 8px;">Código</th>
                        <th style="border: 1px solid #ccc; padding: 8px;">Descripción</th>
                        <th style="border: 1px solid #ccc; padding: 8px;">Cantidad</th>
                        <th style="border: 1px solid #ccc; padding: 8px;">Surtido</th>
                        <th style="border: 1px solid #ccc; padding: 8px;">UM</th>
                    </tr>
                </thead>
                <tbody>
                    ${productos
                .map(
                    (p) => `
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">${p.codigo
                        }</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${p.descripcion
                        }</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${p.cantidad
                        }</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${p.cantidad_surtida || 0
                        }</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${p.um || ""
                        }</td>
                        </tr>
                    `
                )
                .join("")}
                </tbody>
            </table>`;

        html = html.replace(
            /{{tablaProductos}}/g,
            `${tablaProductosHTML}
             <div style="text-align:center; margin-top:20px;">
               <p><strong>Escanea este código QR al momento de recoger tus muestras:</strong></p>
               <img src="${qrImageDataURL}" alt="QR de entrega" style="width:180px;" />
             </div>`
        );

        // 9) Enviar correo
        await transporter.sendMail({
            from: `"Muestras Sanced" <j72525264@gmail.com>`,
            to: correoDestino,
            cc: correosFijos,
            subject: solicitud.requiere_envio
                ? `🚚 Tus muestras serán ENVIADAS – Folio ${folio}`
                : `📦 Tus muestras están LISTAS para recoger – Folio ${folio}`,
            html,
            attachments: [
                {
                    filename: "logo_sanced.png",
                    path: path.join(__dirname, "templates", "logob.png"),
                    cid: "logo_sanced",
                },
            ],
        });

        res.json({
            message: "✅ Fin de embarque registrado y correo enviado correctamente.",
        });
    } catch (error) {
        console.error("❌ Error al registrar fin de embarque:", error);
        res
            .status(500)
            .json({ message: "Error interno al registrar fin de embarque" });
    }
};

const correosPorNombre = {
    "Luis Angel Flores Barbosa": "luis.barbosa@santul.net",
    "Axel Squivias Sanchez": "axel.squivias@santul.net",
    "Marleni Moreno": "marleni.moreno@santul.net",
    "Nadia Cano": "nadia.cano@santul.net",
    "Rocio Mancilla": "rocio.mancilla@santul.net ",
    "Abraham arenas": "abraham.arenas@santul.net",
    "Ariel Ramírez": "ariel.ramirez@santul.net",
    "Daniela Mondragón": "dani.mondragon@santul.net",
    "Katia Daniela Martinez Mo": "katia.martinez@santul.net",
    "Miriam Zayanni Meneses Te": "miriam.meneses@santul.net",
    "Montserrat Roa Nava": "montserrat.roa@santul.net",
    "Jorge Mario Vallejo Pérez": "jorge.vallejo@santul.net",
    "Francisco Javier Pineda B": "francisco.pineda@santul.net",
    "Brenda Zuleyma Velazquez": "marketing@santul.net",
    "Adriana Miron Cortes": "adriana.miron@santul.net",
    "Mariana Lucero Ramirez Me": "mariana.rh@santul.net",
    "Michel Escobar Jimenez": "michel.escobar@santul.net",
    "Sergio Regalado Alvarez": "sergio.regalado@santul.net",
    "Enrrique Saavedra": "gerente.almacen@santul.net",
    "Elias Sandler": "elias.sandler@santul.net",
    "Eduardo Sandler": "eduardo.sandler@santul.net",
    "Mauricio Sandler": "mauricio.sandler@santul.net",
    "Jonathan Alcantara": "jonathan.alcantara@santul.net",
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

const obtenerPreciosLista = async (req, res) => {
    try {
        const codigos = req.body; // ej. ["ST384294","8429",…]
        const respuesta = await axios.post(
            "http://santul.verpedidos.com:9010/Santul/PrecioLista/",
            codigos,
            { timeout: 20000 } // 20 segundos
        );
        return res.json(respuesta.data);
    } catch (err) {
        console.error("❌ Error al obtener precios de lista:", err.message);
        return res
            .status(500)
            .json({ error: "No se pudo obtener precios de lista" });
    }
};

const cron = require("node-cron");

const enviarPendientesEmbarque = async () => {
    try {
        const [rows] = await pool.query(`
      SELECT folio, nombre, departamento, motivo, created_at, 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as fecha_creacion
      FROM solicitudes_muestras
      WHERE fin_embarcado_at IS NULL
        AND DATE(created_at) < CURDATE()
        AND autorizado <> 2         -- No muestra las canceladas
      ORDER BY created_at ASC
    `);

        if (rows.length === 0) {
            console.log("🔔 No hay solicitudes pendientes de embarque.");
            return;
        }

        const hoy = moment().startOf("day");
        const filas = rows
            .map((r) => {
                const fechaSolicitud = moment(r.created_at);
                const diasRetraso = hoy.diff(fechaSolicitud.startOf("day"), "days");
                const fechaVencimiento = fechaSolicitud.clone().add(2, "days");
                return `
        <tr>
          <td style="padding:10px; border:1px solid #ccc;">${r.folio}</td>
          <td style="padding:10px; border:1px solid #ccc;">${r.nombre}</td>
          <td style="padding:10px; border:1px solid #ccc;">${r.departamento
                    }</td>
          <td style="padding:10px; border:1px solid #ccc;">${r.motivo}</td>
          <td style="padding:10px; border:1px solid #ccc;">${r.fecha_creacion
                    }</td>
          <td style="padding:10px; border:1px solid #ccc; color:${diasRetraso > 2 ? "#EA0029" : "#333"
                    }; font-weight:bold;">
            ${diasRetraso} día${diasRetraso === 1 ? "" : "s"}
          </td>
          <td style="padding:10px; border:1px solid #ccc;">
            ${fechaVencimiento.format("YYYY-MM-DD")}
          </td>
        </tr>
      `;
            })
            .join("");

        // Lee tu HTML base
        const plantillaPath = path.join(
            __dirname,
            "templates",
            "correo_pendientes_embarque.html"
        );
        let html = await fs.readFile(plantillaPath, "utf8");

        // Reemplaza el header de la tabla para agregar columnas extra
        html = html.replace(
            '<th style="padding:10px; border:1px solid #ccc;">Fecha de Solicitud</th>',
            `<th style="padding:10px; border:1px solid #ccc;">Fecha de Solicitud</th>
       <th style="padding:10px; border:1px solid #ccc;">Días de Retraso</th>
       <th style="padding:10px; border:1px solid #ccc;">Fecha Límite</th>`
        );

        html = html.replace("{{filas_pendientes}}", filas);

        await transporter.sendMail({
            from: '"Sanced Muestras" <j72525264@gmail.com>',
            to: [
                "rodrigo.arias@santul.net",
                "jonathan.alcantara@santul.net",
                "analista.inventarios2@santul.net",
                "supervisor.inventarios@santul.net",
            ],
            subject: "⚠️ Solicitudes PENDIENTES de embarque",
            html,
            attachments: [
                {
                    filename: "logo_sanced.png",
                    path: path.join(__dirname, "templates", "logob.png"),
                    cid: "logo_sanced",
                },
            ],
        });

        console.log("✅ Correo de pendientes de embarque enviado.");
    } catch (error) {
        console.error("❌ Error al enviar correo de pendientes:", error);
    }
};

// 8:00 AM
cron.schedule("46 8 * * 1-5", async () => {
    console.log(
        "⏰ Ejecutando envío diario de pendientes de embarque (8:46 AM, solo lunes a viernes)..."
    );
    await enviarPendientesEmbarque();
});


const marcarSinMaterial = async (req, res) => {
    const { folio } = req.params;
    const { sin_material_por } = req.body;

    // Validación
    if (!sin_material_por) {
        return res.status(400).json({ ok: false, message: "Falta el nombre del usuario que marca sin material." });
    }

    try {
        // 1) Actualiza las columnas solicitadas
        await pool.query(
            `UPDATE solicitudes_muestras 
             SET sin_material = 1, 
                 fin_embarcado_por = ?, 
                 fin_embarcado_at = NOW(), 
                 salida_por = ? 
             WHERE folio = ?`,
            [sin_material_por, sin_material_por, folio]
        );

        // 2) Obtén datos de la solicitud
        const [rows] = await pool.query(
            'SELECT * FROM solicitudes_muestras WHERE folio = ?',
            [folio]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }
        const solicitud = rows[0];

        // 3) Productos
        const [productos] = await pool.query(
            'SELECT codigo, descripcion, cantidad, cantidad_surtida, um FROM Carrito_muestras WHERE solicitud_id = ?',
            [solicitud.id]
        );

        // 4) Correos
        const correoDestino = correosPorNombre[solicitud.nombre];
        const correosFijos = [
            "rodrigo.arias@santul.net",
            "jonathan.alcantara@santul.net",
        ];

        // 5) Lee y arma HTML
        const rutaHTML = path.join(__dirname, "templates", "correo_sin_material.html");
        let html = await fs.readFile(rutaHTML, "utf8");

        // 6) Tabla de productos
        const tablaProductosHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px;">
            <thead>
                <tr style="background-color: #f0f0f0;">
                    <th style="border: 1px solid #ccc; padding: 6px;">Código</th>
                    <th style="border: 1px solid #ccc; padding: 6px;">Descripción</th>
                    <th style="border: 1px solid #ccc; padding: 6px;">Cantidad</th>
                    <th style="border: 1px solid #ccc; padding: 6px;">Surtido</th>
                    <th style="border: 1px solid #ccc; padding: 6px;">UM</th>
                </tr>
            </thead>
            <tbody>
                ${productos
                .map(
                    (p) => `
                            <tr>
                                <td style="border: 1px solid #ccc; padding: 6px;">${p.codigo}</td>
                                <td style="border: 1px solid #ccc; padding: 6px;">${p.descripcion}</td>
                                <td style="border: 1px solid #ccc; padding: 6px;">${p.cantidad}</td>
                                <td style="border: 1px solid #ccc; padding: 6px;">${p.cantidad_surtida || 0}</td>
                                <td style="border: 1px solid #ccc; padding: 6px;">${p.um || ""}</td>
                            </tr>
                        `
                )
                .join("")}
            </tbody>
        </table>`;

        // 7) Reemplaza marcadores
        html = html
            .replace(/{{folio}}/g, folio)
            .replace(/{{nombre}}/g, solicitud.nombre)
            .replace(/{{departamento}}/g, solicitud.departamento)
            .replace(/{{motivo}}/g, solicitud.motivo)
            .replace(/{{fecha}}/g, moment(solicitud.created_at).format("D [de] MMMM [de] YYYY, HH:mm [hrs]"))
            .replace(/{{tablaProductos}}/g, tablaProductosHTML);

        // 8) Envia correo
        await transporter.sendMail({
            from: '"Muestras Sanced" <j72525264@gmail.com>',
            to: correoDestino,
            cc: correosFijos,
            subject: `❗ SIN MATERIAL para tu solicitud de muestra – Folio ${folio}`,
            html,
            attachments: [
                {
                    filename: "logo_sanced.png",
                    path: path.join(__dirname, "templates", "logob.png"),
                    cid: "logo_sanced",
                },
            ],
        });

        res.json({ ok: true, message: 'Solicitud marcada como sin material y correo enviado' });
    } catch (error) {
        console.error('Error al marcar sin material:', error);
        res.status(500).json({ ok: false, message: 'Error en el servidor' });
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
    actualizarContadorPDF,
    obtenerPreciosLista,
    enviarPendientesEmbarque,
    marcarSinMaterial
};

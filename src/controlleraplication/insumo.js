const InsumoModel = require("../modelaplication/insumos.js");

const fs = require("fs");
const path = require("path");
const pool = require("../config/database");
const nodemailer = require("nodemailer");

const insumoLista = async (req, res) => {
  try {
    res.json(await InsumoModel.listaInsumoCedis());
  } catch (error) {
    res.json({ message: error.message });
  }
};

const reciboInsumo = async (req, res) => {
  try {
    const bodyL = req.body;
    const listarecibo = new InsumoModel(bodyL);
    const guardar = await listarecibo.ObtenerCodigo();
    res.json(guardar);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const newInsumo = async (req, res) => {
  try {
    const bodyL = req.body;
    const listarecibo = new InsumoModel(bodyL);
    const guardar = await listarecibo.newInsumo();
    res.json(guardar);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const updateInsumo = async (req, res) => {
  try {
    const bodyL = req.body;
    const listarecibo = new InsumoModel(bodyL);
    const guardar = await listarecibo.updateInsumo();
    res.json(guardar);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const modifyInsumo = async (req, res) => {
  try {
    const bodyL = req.body;
    const listarecibo = new InsumoModel(bodyL);
    const guardar = await listarecibo.modifyInsumo();
    res.json(guardar);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const ingresoInsumos = async (req, res) => {
  try {
    const bodyL = req.body;
    const listarecibo = new InsumoModel(bodyL);
    const guardar = await listarecibo.ingresoInsumos();
    res.json(guardar);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const Insumos = async (req, res) => {
  try {
    res.json(await InsumoModel.Insumosagregados());
  } catch (error) {
    res.json({ message: error.message });
  }
};

const InsumosReducidos = async (req, res) => {
  try {
    res.json(await InsumoModel.Insumosreducidos());
  } catch (error) {
    res.json({ message: error.message });
  }
};

// mandar correo de solicitud

const listaSolicitudes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM solicitudes_insumos ORDER BY fecha DESC`
    );

    res.json({ ok: true, list: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ ok: false, error: err });
  }
};

const correosDestino = [
  "laura.carbajal@santul.net",
  "janett.torres@santul.net",
  //   "gerencia@santul.net",
].join(",");

const correosCC = [
  "jonathan.alcantara@santul.net",
  "eduardo.sandler@santul.net",
  "rodrigo.arias@santul.net",
  "gerardo.rodriguez@santul.net",
].join(",");

const solicitarInsumo = async (req, res) => {
  try {
    const { codigo, descripcion, cantidad, solicitante, correo } = req.body;

    if (!codigo || !descripcion || !cantidad) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
      });
    }

    // 🕒 Fecha
    const fecha = new Date().toLocaleString("es-MX");

    // 📌 1) Guardar en la BD
    await pool.query(
      `INSERT INTO solicitudes_insumos 
        (codigo, descripcion, cantidad, solicitante_nombre, solicitante_correo) 
       VALUES (?, ?, ?, ?, ?)`,
      [codigo, descripcion, cantidad, solicitante, correo]
    );

    // 📌 2) Leer plantilla HTML
    const templatePath = path.join(
      __dirname,
      "../controller/templates/solicitudInsumo.html"
    );
    let html = fs.readFileSync(templatePath, "utf8");

    // Reemplazar variables
    html = html
      .replace("{{codigo}}", codigo)
      .replace("{{descripcion}}", descripcion)
      .replace("{{cantidad}}", cantidad)
      .replace("{{solicitante}}", solicitante)
      .replace("{{fecha}}", fecha);

    // 📌 3) Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "j72525264@gmail.com",
        pass: "bzgq ssbm nomh sqtw",
      },
    });

    // 📌 4) Enviar correo
    await transporter.sendMail({
      from: '"Santul – Insumos" <j72525264@gmail.com>',
      to: correosDestino,
      cc: correosCC,
      subject: `Solicitud de Insumo: ${codigo}`,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../controller/templates/logob.png"),
          cid: "logo_santul",
        },
      ],
    });

    res.json({
      success: true,
      message: "Solicitud enviada y registrada correctamente.",
    });
  } catch (e) {
    console.error("Error al solicitar insumo:", e);
    res.status(500).json({ success: false, error: e.message });
  }
};

const marcarSolicitudSurtida = async (req, res) => {
  const { id } = req.params;
  const { fecha_llegada } = req.body; // Fecha manual enviada desde React

  try {
    // 1️⃣ Obtener datos de la solicitud
    const [sol] = await pool.query(
      "SELECT * FROM solicitudes_insumos WHERE id = ? LIMIT 1",
      [id]
    );

    if (sol.length === 0) {
      return res.status(404).json({ error: "Solicitud no existe" });
    }

    const solicitud = sol[0];

    // 2️⃣ Buscar correo REAL del solicitante en tabla usuarios
    const [usuario] = await pool.query(
      "SELECT email FROM usuarios WHERE name = ? LIMIT 1",
      [solicitud.solicitante_nombre]
    );

    const correoSolicitante =
      usuario.length > 0 ? usuario[0].email : solicitud.solicitante_correo;

    // 3️⃣ Correos a quienes enviar copia
    const correosCC = [
      "jonathan.alcantara@santul.net",
      "eduardo.sandler@santul.net",
      "rodrigo.arias@santul.net",
    ];

    // 4️⃣ Actualizar solicitud como surtida con fecha manual
    await pool.query(
      "UPDATE solicitudes_insumos SET solicitado = 1, fecha_llegada = ? WHERE id = ?",
      [fecha_llegada, id]
    );

    // 5️⃣ Cargar plantilla HTML
    const plantillaPath = path.join(
      process.cwd(),
      "src",
      "controller",
      "templates",
      "respuesta_solicitud.html"
    );

    let htmlTemplate = fs.readFileSync(plantillaPath, "utf8");

    // Convertir fecha solicitada a solo fecha YYYY-MM-DD
    const fechaSolicitadaSimple = solicitud.fecha
      ? new Date(solicitud.fecha).toISOString().split("T")[0]
      : "Sin fecha";

    // Reemplazar variables {{campo}}
    htmlTemplate = htmlTemplate
      .replace("{{codigo}}", solicitud.codigo)
      .replace("{{descripcion}}", solicitud.descripcion)
      .replace("{{cantidad}}", solicitud.cantidad)
      .replace("{{fecha}}", solicitud.fecha)
      .replace("{{fecha_simple}}", fechaSolicitadaSimple)
      .replace("{{solicitante}}", solicitud.solicitante_nombre)
      .replace("{{fecha_llegada}}", fecha_llegada);

    // 6️⃣ Configuración de envío de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "j72525264@gmail.com",
        pass: "bzgq ssbm nomh sqtw",
      },
    });

    await transporter.sendMail({
      from: '"Santul – Insumos" <j72525264@gmail.com>',
      to: correoSolicitante,
      cc: correosCC, // ← CC funcionando
      subject: "✔ Tu solicitud de insumo ha sido SURTIDA",
      html: htmlTemplate,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(
            process.cwd(),
            "src",
            "controller",
            "templates",
            "logob.png"
          ),
          cid: "logo_santul", // Para mostrar dentro del HTML
        },
      ],
    });

    res.json({ ok: true, message: "Solicitud surtida y correo enviado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = {
  insumoLista,
  reciboInsumo,
  newInsumo,
  updateInsumo,
  modifyInsumo,
  ingresoInsumos,
  Insumos,
  InsumosReducidos,
  solicitarInsumo,
  marcarSolicitudSurtida,
  listaSolicitudes,
};

// controllers/authController.js
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { getUserByEmail, comparePassword, generateToken, updateUserPassword  } = require('../services/userService');
const path = require('path');
const fs = require('fs/promises');
const moment = require('moment'); // Instálalo si no lo tienes: npm i moment


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "j72525264@gmail.com",
    pass: "cnaa haoa izwh lerm",
  },
});

// modificar el forzar cambio 

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Received email:', email);
  console.log('Received password:', password);

  try {
    const user = await getUserByEmail(email);
    console.log('Found user:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    // 🔒 Verifica si necesita cambiar la contraseña
    const ultimaModificacion = moment(user.ultima_modificacion_password);
    const diasDesdeUltimoCambio = moment().diff(ultimaModificacion, 'days');

   if (diasDesdeUltimoCambio >= 90 || user.forzar_cambio_password === 1) {
  const token = jwt.sign({ email: user.email }, 'your_jwt_secret', { expiresIn: '15m' });

  return res.status(403).json({
    message: 'Debes cambiar tu contraseña por motivos de seguridad',
    requirePasswordChange: true,
    token, // 👈 Asegúrate de enviar esto
    user: {
      id: user.id_usu,
      email: user.email,
      nombre: user.name
    }
  });
}


    // ✅ Login exitoso
    const token = generateToken(user);
    console.log('Generated token:', token);
    res.json({ token, user });

  } catch (error) {
    console.log('Error during login:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};



const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const token = jwt.sign({ email: user.email }, 'your_jwt_secret', { expiresIn: '15m' });
  const resetLink = `http://66.232.105.87:3000/reset-password/${token}`;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rodrigo.arias@santul.net';


  try {
    const htmlPath = path.join(__dirname, 'templates', 'correo_reset_password.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    html = html.replace(/{{reset_link}}/g, resetLink);

    await transporter.sendMail({
      from: `"SanCed – Gestor de Accesos" <j72525264@gmail.com>`,
      to: email,
      subject: "Restablecer contraseña",
      html,
      attachments: [
        {
          filename: "logo_sanced.png",
          path: path.join(__dirname, "templates", "logob.png"),
          cid: "logo_sanced"
        }
      ]
    });

    await transporter.sendMail({
  from: `"SanCed – Gestor de Accesos" <j72525264@gmail.com>`,
  to: ADMIN_EMAIL, // 'rodrigo.arias@santul.net'
  subject: `Notificación: restablecimiento para ${email}`,
  html: `
    <p>Se solicitó restablecer la contraseña de <strong>${email}</strong>.</p>
    <p>Fecha: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
    <p>IP origen: ${req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'N/D'}</p>

    <p>Enlace directo (vence en ~15 min):<br>
      <a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a>
    </p>

    <p style="margin:16px 0;">
      <a href="${resetLink}"
         target="_blank" rel="noopener noreferrer"
         style="
           display:inline-block;
           padding:10px 16px;
           background:#0d47a1;
           color:#fff !important;
           text-decoration:none;
           border-radius:8px;
           font-weight:600;
         ">
        Restablecer contraseña
      </a>
    </p>

    <p style="color:#666;font-size:12px;">
      *Este enlace permite cambiar la contraseña del usuario indicado y expira en 15 minutos.
    </p>
  `,
  attachments: [
    {
      filename: "logo_sanced.png",
      path: path.join(__dirname, "templates", "logob.png"),
      cid: "logo_sanced"
    }
  ]
});


    res.json({ message: "Correo de restablecimiento enviado" });
  } catch (err) {
    console.error("Error al enviar correo:", err);
    res.status(500).json({ message: "Error al enviar el correo", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await getUserByEmail(decoded.email);

    // ✅ Validar que la nueva contraseña no sea igual a la actual
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior' });
    }

    // ✅ Guardar nueva contraseña
    await updateUserPassword(user.email, newPassword);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(400).json({ message: 'Token inválido o expirado', error: error.message });
  }
};

module.exports = {
  login,
  sendResetEmail,
  resetPassword
};

const multer = require('multer');
const express = require('express');
const path = require('path');
const app = express();


// server.js

const cors = require("cors");

require("dotenv").config();
const fs = require("fs");
const https = require("https");
const fetch = require("./fetch"); // ✅ SOLUCIÓN FINAL


// ───── Servidor HTTPS separado solo para imagenes ─────
const imageApp = express();

imageApp.get("/imagenes/img_pz/:img", async (req, res) => {
  const { img } = req.params;
  const remoteUrl = `http://66.232.105.87:3011/imagenes/img_pz/${img}`;

  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) {
      return res.status(404).send("Imagen no encontrada");
    }

    res.set("Content-Type", response.headers.get("content-type"));
    response.body.pipe(res);
  } catch (err) {
    console.error("❌ Error al obtener la imagen:", err.message);
    res.status(500).send("Error al conectar con imagen remota");
  }
});

// Certificados autofirmados o reales
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "ssl", "cert.pem")),
};

const httpsPort = 3011;
https.createServer(sslOptions, imageApp).listen(httpsPort, () => {
  console.log(
    `🔐 Servidor HTTPS (imagenes) en https://localhost:${httpsPort}/imagenes/...`
  );
});

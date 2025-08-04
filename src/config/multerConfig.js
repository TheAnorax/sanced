const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();

// === Configuración de certificados ===
const sslOptions = {
  key: fs.readFileSync('C:/certificados/sanced/sanced.santulconnect.com-key.pem'),
  cert: fs.readFileSync('C:/certificados/sanced/sanced.santulconnect.com-crt.pem'),  
}; 

// === Configuración de Multer ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, path.join(__dirname, 'C:/Users/rodrigo/Desktop/react/docs'));
  },
  filename: (req, file, cb) => {
  const currentDate = new Date().toISOString().slice(0, 10);
  cb(null, `${currentDate}-${file.originalname}`);
}

});

const upload = multer({ storage: storage, limits: { files: 5 } });

// === Rutas estáticas ===
app.use('/docs', express.static('C:/Users/rodrigo/Desktop/react/docs'));
app.use('/docsOC', express.static('C:/Users/rodrigo/Desktop/react/docsOC'));
app.use('/imagenes', express.static('C:/Users/rodrigo/Desktop/react/imagenes'));

// === Levantar el servidor HTTPS ===
https.createServer(sslOptions, app).listen(3011, () => {
  console.log('🔐 Servidor HTTPS corriendo en el puerto 3011');
});


module.exports = upload;

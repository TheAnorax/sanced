const multer = require('multer');
const express = require('express');
const path = require('path');
const app = express();

// Configuración del almacenamiento para guardar los archivos en la carpeta proporcionada
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'C:/Users/rodrigo/Desktop/react/docs')); // Ajusta la ruta si es necesario
  },
  filename: (req, file, cb) => {
    // Obtener la fecha actual en un formato deseado
    const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    // Concatenar la fecha con el nombre original del archivo
    cb(null, `${currentDate}-${file.originalname}`); // Guardar con la fecha y el nombre original
  }
});

// Exporta solo la configuración de Multer (sin `.fields()`)
const upload = multer({ storage: storage, limits: { files: 5 } });



app.use('/docs', express.static('C:/Users/rodrigo/Desktop/react/docs'));
app.use('/docsOC', express.static('C:/Users/rodrigo/Desktop/react/docsOC'));


app.listen(3011, () => {
  console.log('Servidor corriendo en el puerto 3011');
});
module.exports = upload;

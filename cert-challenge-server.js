const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));


app.listen(80, () => {
  console.log('Servidor escuchando en puerto 80 para validación del certificado');
});

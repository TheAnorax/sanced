const express = require('express');
const cors = require('cors');
const actualizar = require('./src/routesaplication/actualizarRoutes.js');

const app1 = express();
const port = 3008;

app1.use(cors());
app1.use(express.json());
app1.use('/actualizar', actualizar);

app1.listen(port, () => {
    console.log(`ServerApp is running on http://localhost:${port}`);
});
// server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const surtidoRoutes = require('./src/routes/surtidoRoutes')
const pedidoSurtido = require('./src/routes/pedidoSurtidosRoutes')
const productosPaqueteria = require('./src/routes/paqueteriaRoutes')
const pedidosFinalizados = require('./src/routes/finalizadosRoutes')

const app = express();
const port = 3007;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/productos', productoRoutes); // Usar las rutas de productos
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/surtidos', surtidoRoutes)
app.use('/api/pedidos-surtidos', pedidoSurtido)
app.use('/api/paqueterias', productosPaqueteria)
app.use('/api/finalizados', pedidosFinalizados) 

app.listen(port, () => {
  console.log(`Server is running on http://192.168.3.225:${port}`);
});

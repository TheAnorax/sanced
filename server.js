// server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/productos', productoRoutes); // Usar las rutas de productos
app.use('/api/pedidos', pedidoRoutes)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

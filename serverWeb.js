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
const plan = require('./src/routes/planRoutes')
const bahias = require('./src/routes/bahiasRoutes')
const ubicaciones = require('./src//routes/ubicacionesRoutes')
const compras = require('./src/routes/comprasRoutes')
const recibo = require('./src/routes/reciboRoutes')
const embarque = require('./src/routes/embarquesRoutes')
const usuarios = require('./src/routes/usuariosRoutes')
const reciboCedis = require('./src/routesaplication/reciboCedisRoutes')
const calidad = require('./src/routes/calidadRoutes')
const inventarios = require('./src/routes/inventariosRoutes')
const embarqueLista = require('./src/routesaplication/embarqueRoutes')
const insumo = require('./src/routesaplication/insumos')
const Inventario_P = require('./src/routesaplication/Inventario_P')
const inventory = require('./src/routes/inventoryRouters')


const app = express();
const port = 3007;
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' })); // Aumenta el límite si es necesario
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/productos', productoRoutes); // Usar las rutas de productos
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/surtidos', surtidoRoutes)
app.use('/api/pedidos-surtidos', pedidoSurtido)
app.use('/api/paqueterias', productosPaqueteria)
app.use('/api/finalizados', pedidosFinalizados) 
app.use('/api/plan', plan)
app.use('/api/bahias', bahias)
app.use('/api/ubicaciones', ubicaciones)
app.use('/api/compras', compras)
app.use('/api/recibo', recibo)
app.use('/api/embarque', embarque)
app.use('/api/usuarios', usuarios)
app.use('/api/calidad', calidad)
app.use('/api/inventarios', inventarios)
app.use('/recibo', reciboCedis)
app.use('/insumo',insumo)
app.use('/api/Inventario_P',Inventario_P)
app.use('/api/inventory',inventory)
app.use(embarqueLista)


app.listen(port, () => {
  console.log(`Server is running on http://192.168.3.27:${port}`);
});

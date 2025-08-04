const express = require('express');
const router = express.Router();

//const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Configurar body-parser para manejar solicitudes JSON con un límite mayor de tamaño
app.use(bodyParser.json({ limit: '20mb' })); // Puedes ajustar el tamaño, por ejemplo, 20 MB
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
const { getSurtidos, updatePedido, updateBahias, authorizePedido, cancelPedido, getPedidosDelDia, updateBahiasfinalizado } = require('../controller/pedidosSurtidosController');

router.get('/pedidos-surtido', getSurtidos);
router.get('/pedidos-dia', getPedidosDelDia);

router.put('/pedidos-surtido/:pedidoId/bahias', updateBahias); 

router.get('/pedidos-surtido', getSurtidos);
router.put('/pedidos-surtido/:pedidoId', updatePedido);
router.post('/pedidos-surtido/:pedidoId/authorize', authorizePedido); 
// RUTA
router.put('/pedidos-surtido-finalizado/:pedidoId/:tipo/bahias', updateBahiasfinalizado);

router.put('/pedidos-surtido/:pedidoId/cancel', cancelPedido); 

module.exports = router; 
 

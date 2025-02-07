const pool = require('../config/database');
const moment = require('moment');


const getObservacionesPorCliente = async (req, res) => {
    const { venta } = req.params;  // El parámetro "venta" ahora será el número de cliente
    try {
        // Actualiza el nombre de la columna a `NUM. CLIENTE`
        const query = 'SELECT OBSERVACIONES FROM clientes_especificacciones WHERE `NUM_CLIENTE` = ?';
        const [rows] = await pool.query(query, [venta]);

        if (rows.length > 0) {
            // Si encuentra la observación, la devuelve
            res.json({ observacion: rows[0].OBSERVACIONES });
        } else {
            // Si no encuentra observación, responde con "Sin observaciones disponibles"
            res.json({ observacion: 'Sin observaciones disponibles' });
        }
    } catch (error) {
        // En caso de error, responde con un mensaje de error
        console.error('Error al obtener observaciones:', error.message);
        res.status(500).json({ message: 'Error al obtener observaciones' });
    }
};

const getUltimaFechaEmbarque = async (req, res) => {
    const { pedido } = req.params; // Tomamos el "pedido" como parámetro

    try {
        // Consulta SQL para obtener el último registro de embarque
        const query = `
            SELECT registro_embarque 
            FROM pedido_embarque 
            WHERE pedido = ?
            ORDER BY registro_embarque DESC 
            LIMIT 1;
        `;

        const [rows] = await pool.query(query, [pedido]); // Ejecutamos la consulta con el número de pedido

        if (rows.length > 0) {
            // Si encontramos un registro, devolvemos la fecha de embarque
            res.json({ registro_embarque: rows[0].registro_embarque });
        } else {
            // Si no encontramos registros, devolvemos un mensaje adecuado
            res.json({ message: 'No se encontraron registros para este pedido' });
        }
    } catch (error) {
        console.error('Error al obtener la fecha de embarque:', error.message);
        res.status(500).json({ message: 'Error al obtener la fecha de embarque' });
    }
};

const insertarRutas = async (req, res) => {
    const { rutas } = req.body;
    console.log("📥 Datos recibidos del frontend:", rutas);

    try {
        for (let ruta of rutas) {
            const {
                routeName, FECHA, 'NO ORDEN': noOrden, 'NO_FACTURA': noFactura,
                'NUM. CLIENTE': numCliente, 'NOMBRE DEL CLIENTE': nombreCliente,
                ZONA, MUNICIPIO, ESTADO, OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS,
                TIPO, DIRECCION, TELEFONO, CORREO, GUIA  // ✅ Agregamos GUIA
            } = ruta;

            const formattedDate = moment(FECHA, 'DD/MM/YYYY').format('YYYY-MM-DD');

            // Consulta SQL
            const query = `
                INSERT INTO paqueteria (routeName, FECHA, \`NO ORDEN\`, \`NO_FACTURA\`, \`NUM. CLIENTE\`, 
                    \`NOMBRE DEL CLIENTE\`, ZONA, MUNICIPIO, ESTADO, OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS, 
                    TRANSPORTE, PAQUETERIA, TIPO, DIRECCION, TELEFONO, CORREO, GUIA) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Eliminado el cálculo de IVA. Se inserta TOTAL directamente.
            const values = [
                routeName, formattedDate, noOrden, noFactura, numCliente, nombreCliente,
                ZONA, MUNICIPIO, ESTADO, OBSERVACIONES, TOTAL, PARTIDAS, PIEZAS,
                routeName, routeName, TIPO, DIRECCION, TELEFONO, CORREO, GUIA
            ];

            await pool.query(query, values);
        }

        res.status(200).json({ message: '✅ Rutas insertadas correctamente.' });
    } catch (error) {
        console.error('❌ Error al insertar las rutas:', error.message);
        res.status(500).json({ message: 'Error al insertar las rutas' });
    }
};

const obtenerRutasDePaqueteria = async (req, res) => {
    try {
        const query = 'SELECT * FROM paqueteria'; // Consulta SQL para obtener todas las rutas
        const [rows] = await pool.query(query);

        if (rows.length > 0) {
            res.json(rows); // Devolver todas las rutas de paquetería
        } else {
            res.status(404).json({ message: 'No hay rutas de paquetería disponibles.' });
        }
    } catch (error) {
        console.error('Error al obtener las rutas de paquetería:', error.message);
        res.status(500).json({ message: 'Error al obtener las rutas de paquetería' });
    }
};

const getFechaYCajasPorPedido = async (req, res) => {
    const { noOrden } = req.params;

    try {
        const query = `
                    SELECT
                    MAX(fin_embarque) AS ultimaFechaEmbarque,
                    SUM(caja) AS totalCajas
                    FROM pedido_finalizado
                    WHERE pedido = ?;
                `;

        const [rows] = await pool.query(query, [noOrden]);

        if (rows.length > 0) {
            res.json({
                ultimaFechaEmbarque: moment(rows[0].ultimaFechaEmbarque).format('DD/MM/YYYY'), // Formateamos la fecha
                totalCajas: rows[0].totalCajas
            });
        } else {
            res.status(404).json({ message: 'No se encontraron registros para este número de pedido' });
        }
    } catch (error) {
        console.error('Error al obtener la fecha de embarque y las cajas:', error.message);
        res.status(500).json({ message: 'Error al obtener la fecha de embarque y las cajas' });
    }
};

const actualizarGuia = async (req, res) => {
    const {
        paqueteria,
        fechaEntregaCliente,
        diasEntrega,
        entregaSatisfactoria,
        motivo,
        totalFacturaLT,
        prorateoFacturaLT,
        prorateoFacturaPaqueteria,
        gastosExtras,
        sumaFlete,
        porcentajeEnvio,
        porcentajePaqueteria,
        sumaGastosExtras,
        porcentajeGlobal,
        diferencia,
        noFactura,
        fechaFactura,
        tarimas,
        numeroFacturaLT,
        observaciones
    } = req.body;

    try {
        const noOrden = req.params.noOrden || null;
        const guia = req.params.guia || null;

        if (!noOrden || !guia) {
            return res.status(400).json({ message: 'Faltan datos automáticos: noOrden o guia no definidos.' });
        }

        // Verifica que 'guia' no sea vacío ni nulo
        if (!guia || guia.trim() === "") {
            console.error("❌ Error: La guía no tiene un valor válido.");
            return res.status(400).json({ message: 'La guía no tiene un valor válido.' });
        }

        const query = `
            UPDATE paqueteria
            SET 
                GUIA = ?, 
                PAQUETERIA = ?, 
                FECHA_DE_ENTREGA_CLIENTE = ?, 
                DIAS_DE_ENTREGA = ?, 
                ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA = ?, 
                MOTIVO = ?, 
                TOTAL_FACTURA_LT = ?, 
                PRORRATEO_FACTURA_LT = ?, 
                PRORRATEO_FACTURA_PAQUETERIA = ?, 
                GASTOS_EXTRAS = ?, 
                SUMA_FLETE = ?, 
                PORCENTAJE_ENVIO = ?, 
                PORCENTAJE_PAQUETERIA = ?, 
                SUMA_GASTOS_EXTRAS = ?, 
                PORCENTAJE_GLOBAL = ?, 
                DIFERENCIA = ?, 
                NO_FACTURA = ?, 
                FECHA_DE_FACTURA = ?, 
                TARIMAS = ?, 
                NUMERO_DE_FACTURA_LT = ?, 
                OBSERVACIONES = ?
            WHERE \`NO ORDEN\` = ?
        `;

        const [result] = await pool.query(query, [
            guia, paqueteria, fechaEntregaCliente, diasEntrega, entregaSatisfactoria, motivo,
            totalFacturaLT, prorateoFacturaLT, prorateoFacturaPaqueteria, gastosExtras, sumaFlete,
            porcentajeEnvio, porcentajePaqueteria, sumaGastosExtras, porcentajeGlobal, diferencia,
            noFactura, fechaFactura, tarimas, numeroFacturaLT, observaciones, noOrden
        ]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Guía actualizada correctamente' });
        } else {
            return res.status(404).json({ message: 'No se encontró el número de orden o no se actualizó ninguna fila' });
        }
    } catch (error) {
        console.error('Error al actualizar la guía:', error.message);
        return res.status(500).json({ message: 'Error al actualizar la guía' });
    }
};

const getPedidosEmbarque = async (req, res) => {
    try {
        const codigoPedido = req.params.codigo_ped;

        const [rows] = await pool.query(`
            SELECT 
                pe.pedido,
                pe.codigo_ped,
                p.des,
                pe.cantidad, 
                pe.um,
                pe._pz, 
                pe._inner, 
                pe._master,
                pe.cantidad,
                pe.caja,
                pe.estado
            FROM 
                pedido_finalizado pe
            JOIN 
                productos p ON pe.codigo_ped = p.codigo_pro
            WHERE 
                pe.pedido = ?;  -- Filtrar por número de pedido
      `, [codigoPedido]);

        console.log("Resultados de la consulta para el PDF:", rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron registros para este pedido." });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los pedidos de embarque:', error);
        res.status(500).json({
            message: 'Error al obtener los pedidos de embarque',
            error: error.message
        });
    }
};

const getTransportistas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT nombre, apellidos, clave FROM transportista;
        `);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron transportistas.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los transportistas:', error);
        res.status(500).json({ message: 'Error al obtener los transportistas', error: error.message });
    }
};

const getEmpresasTransportistas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id_veh empresa, marca, modelo, placa FROM vehiculos;
        `);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron empresas de transportistas.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las empresas de transportistas:', error);
        res.status(500).json({ message: 'Error al obtener las empresas de transportistas', error: error.message });
    }
};

const insertarVisita = async (req, res) => {
    const { id_vit, clave_visit, motivo, personal, reg_entrada, id_veh } = req.body;
    console.log('📥 Datos recibidos en la solicitud:', req.body);

    if (!id_veh) {
        return res.status(400).json({ message: 'El ID del vehículo es requerido.' });
    }

    try {
        // Consulta para verificar si el vehículo existe
        const [vehiculoRows] = await pool.query(`SELECT * FROM vehiculos WHERE id_veh = ?`, [id_veh]);

        if (vehiculoRows.length === 0) {
            console.error(`❌ No se encontró el vehículo con ID: ${id_veh}`);
            return res.status(404).json({ message: `No se encontró el vehículo con ID: ${id_veh}` });
        }

        console.log('🔍 Vehículo encontrado:', vehiculoRows[0]);

        // Insertar la nueva visita
        const [insertVisitaResult] = await pool.query(`
            INSERT INTO visitas (id_vit, clave_visit, motivo, personal, reg_entrada, area_per) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_vit, clave_visit, motivo, personal, reg_entrada, 9]);

        if (insertVisitaResult.affectedRows === 0) {
            throw new Error('❌ Error al insertar la visita.');
        }

        console.log('✅ Visita insertada con éxito. Resultado:', insertVisitaResult);

        // Actualizar el vehículo después de insertar la visita
        const [updateVehiculoResult] = await pool.query(`
            UPDATE vehiculos 
            SET clave_con = ?, acc_dir = 'S' 
            WHERE id_veh = ?
        `, [id_vit, id_veh]);

        if (updateVehiculoResult.affectedRows === 0) {
            throw new Error('❌ No se pudo actualizar el vehículo.');
        }

        console.log('✅ Vehículo actualizado correctamente.');

        res.status(200).json({ message: 'Visita insertada y vehículo actualizado correctamente.' });
    } catch (error) {
        console.error('❌ Error al insertar visita o actualizar vehículo:', error);
        res.status(500).json({ message: 'Error al insertar visita o actualizar vehículo' });
    }
};

const guardarDatos = async (req, res) => {
    const datos = req.body;

    try {
        for (const dato of datos) {
            await pool.query(
                'INSERT INTO rutas (no_orden, fecha, nombre_cliente, total, partidas, piezas) VALUES (?, ?, ?, ?, ?, ?)',
                [dato['NO ORDEN'], dato['FECHA'], dato['NOMBRE DEL CLIENTE'], dato['TOTAL'], dato['PARTIDAS'], dato['PIEZAS']]
            );
        }

        res.status(201).json({ message: 'Datos guardados correctamente.' });
    } catch (error) {
        console.error('Error al guardar datos:', error);
        res.status(500).json({ message: 'Error al guardar datos.', error: error.message });
    }
};


const obtenerDatos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rutas ORDER BY fecha DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ message: 'Error al obtener datos.', error: error.message });
    }
};

const eliminarRuta = async (req, res) => {
    const { noOrden } = req.params; // Recibimos el parámetro noOrden (o guia, según lo que necesites)

    try {
        // Consulta SQL para eliminar la ruta basándonos en el número de orden
        const query = 'DELETE FROM paqueteria WHERE `NO ORDEN` = ?';

        const [result] = await pool.query(query, [noOrden]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Ruta eliminada correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró la ruta para eliminar.' });
        }
    } catch (error) {
        console.error('Error al eliminar la ruta:', error.message);
        res.status(500).json({ message: 'Error al eliminar la ruta' });
    }
};

const getOrderStatus = async (req, res) => {
    const { orderNumber } = req.params;

    try {
        const tables = ['pedi', 'pedido_surtido', 'pedido_embarque', 'pedido_finalizado'];
        const statusInfo = {
            pedi: { progress: 25, statusText: 'En pedido' },
            pedido_surtido: { progress: 50, statusText: 'Surtiendo' },
            pedido_embarque: { progress: 75, statusText: 'Embarcando' },
            pedido_finalizado: { progress: 100, statusText: 'Finalizado' }
        };

        for (const table of tables) {
            const [result] = await pool.query(`SELECT * FROM ${table} WHERE pedido = ?`, [orderNumber]);
            if (result.length > 0) {
                return res.status(200).json({
                    progress: statusInfo[table].progress,
                    statusText: statusInfo[table].statusText,
                    table
                });
            }
        }

        return res.status(404).json({ message: 'Pedido no encontrado', progress: 0, statusText: 'No encontrado' });

    } catch (error) {
        console.error('Error al buscar el pedido:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


module.exports = {
    getObservacionesPorCliente, getUltimaFechaEmbarque, insertarRutas, obtenerRutasDePaqueteria, getFechaYCajasPorPedido, actualizarGuia,
    getPedidosEmbarque, getTransportistas, getEmpresasTransportistas, insertarVisita, guardarDatos, obtenerDatos, eliminarRuta, getOrderStatus
};
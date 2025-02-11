const pool = require('../config/database');
const moment = require('moment');

// Función para convertir minutos a formato "HH:mm"
const convertirMinutosAHoras = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}m`;
};

// Controlador para obtener KPIs de pedidos surtidos
const getPrduSurtido = async (req, res) => {
    try {
        const selectedDate = req.query.date || moment().format('YYYY-MM-DD');
        const previousDate = moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');

        const query = `
            SELECT * FROM (
                SELECT 'surtido' AS origen, 
                       p.id_pedi, 
                       p.pedido, 
                       p.cantidad, 
                       p.cant_surti, 
                       p.inicio_surtido, 
                       p.fin_surtido, 
                       us.name AS usuario_nombre,
                       us.role AS usuario_role
                FROM pedido_surtido p
                LEFT JOIN usuarios us ON p.id_usuario_surtido = us.id_usu
                WHERE DATE(p.inicio_surtido) = ? 
                      OR (DATE(p.inicio_surtido) = ? AND TIME(p.inicio_surtido) >= '21:30:00')

                UNION ALL

                SELECT 'embarque' AS origen, 
                       e.id_pedi, 
                       e.pedido, 
                       e.cantidad, 
                       e.cant_surti, 
                       e.inicio_surtido, 
                       e.fin_surtido, 
                       us.name AS usuario_nombre,
                       us.role AS usuario_role
                FROM pedido_embarque e
                LEFT JOIN usuarios us ON e.id_usuario_surtido = us.id_usu
                WHERE DATE(e.inicio_surtido) = ? 
                      OR (DATE(e.inicio_surtido) = ? AND TIME(e.inicio_surtido) >= '21:30:00')

                UNION ALL

                SELECT 'finalizado' AS origen, 
                       f.id_pedi, 
                       f.pedido, 
                       f.cantidad, 
                       f.cant_surti, 
                       f.inicio_surtido, 
                       f.fin_surtido, 
                       us.name AS usuario_nombre,
                       us.role AS usuario_role
                FROM pedido_finalizado f
                LEFT JOIN usuarios us ON f.id_usuario_surtido = us.id_usu
                WHERE DATE(f.inicio_surtido) = ? 
                      OR (DATE(f.inicio_surtido) = ? AND TIME(f.inicio_surtido) >= '21:30:00')
            ) AS pedidos;
        `;

        const [rows] = await pool.query(query, [
            selectedDate, previousDate, selectedDate, previousDate, selectedDate, previousDate,
        ]);

        const clasificarPorTurno = (inicio) => {
            if (moment(inicio).isBetween(`${selectedDate} 06:00:00`, `${selectedDate} 14:00:00`)) {
                return 'turno1';
            } else if (moment(inicio).isBetween(`${selectedDate} 14:00:00`, `${selectedDate} 21:30:00`)) {
                return 'turno2';
            } else if (moment(inicio).isBetween(`${previousDate} 21:30:00`, `${selectedDate} 06:00:00`)) {
                return 'turno3';
            }
            return null;
        };

        const turnosData = {
            turno1: { pedidos: [], usuarios: {}, primer_inicio: null, ultimo_fin: null },
            turno2: { pedidos: [], usuarios: {}, primer_inicio: null, ultimo_fin: null },
            turno3: { pedidos: [], usuarios: {}, primer_inicio: null, ultimo_fin: null },
        };

        rows.forEach((item) => {
            const turno = clasificarPorTurno(item.inicio_surtido);
            if (!turno) return;

            const inicio = moment(item.inicio_surtido).toDate();
            const fin = moment(item.fin_surtido).toDate();

            if (!turnosData[turno].primer_inicio || inicio < turnosData[turno].primer_inicio) {
                turnosData[turno].primer_inicio = inicio;
            }

            if (!turnosData[turno].ultimo_fin || fin > turnosData[turno].ultimo_fin) {
                turnosData[turno].ultimo_fin = fin;
            }

            const usuario = item.usuario_nombre || 'Desconocido';
            if (!turnosData[turno].usuarios[usuario]) {
                turnosData[turno].usuarios[usuario] = {
                    role: item.usuario_role,
                    pedidos_surtidos: new Set(),
                    total_partidas: 0,
                    total_piezas: 0,
                    primer_inicio: null,
                    ultimo_fin: null,
                    tiempo_productivo_minutos: 0,  // Nuevo campo para el tiempo productivo
                };
            }

            const userStats = turnosData[turno].usuarios[usuario];
            userStats.pedidos_surtidos.add(item.pedido);
            userStats.total_partidas += 1;
            userStats.total_piezas += item.cant_surti;

            // Calcular el tiempo productivo para cada registro y sumarlo
            const tiempoProductivo = moment(item.fin_surtido).diff(moment(item.inicio_surtido), 'minutes');
            userStats.tiempo_productivo_minutos += tiempoProductivo;

            // Actualizar los tiempos de inicio y fin para cada usuario
            if (!userStats.primer_inicio || inicio < userStats.primer_inicio) {
                userStats.primer_inicio = inicio;
            }

            if (!userStats.ultimo_fin || fin > userStats.ultimo_fin) {
                userStats.ultimo_fin = fin;
            }

            turnosData[turno].pedidos.push(item);
        });

        const calcularKPIs = (turnoData) => {
            const totalPedidos = turnoData.pedidos.length;
            const totalProductos = turnoData.pedidos.reduce((sum, pedido) => sum + pedido.cant_surti, 0);
            const usuariosValidos = Object.values(turnoData.usuarios).filter((usuario) => usuario.role !== 'AV');
            const totalPartidas = usuariosValidos.reduce((sum, usuario) => sum + usuario.total_partidas, 0);

            let tiempoTrabajoMinutos = 0;
            if (turnoData.primer_inicio && turnoData.ultimo_fin) {
                tiempoTrabajoMinutos = moment(turnoData.ultimo_fin).diff(moment(turnoData.primer_inicio), 'minutes');
            }

            const tiempoTrabajoFormato = convertirMinutosAHoras(tiempoTrabajoMinutos);

            return {
                total_pedidos: totalPedidos,
                total_productos_surtidos: totalProductos,
                tiempo_trabajo: tiempoTrabajoFormato,
                total_partidas: totalPartidas,
            };
        };

        const formatearUsuarios = (usuarios) => {
            const resultado = {};
            Object.entries(usuarios).forEach(([usuario, stats]) => {
                let tiempoTrabajoUsuarioMinutos = 0;
                if (stats.primer_inicio && stats.ultimo_fin) {
                    tiempoTrabajoUsuarioMinutos = moment(stats.ultimo_fin).diff(moment(stats.primer_inicio), 'minutes');
                }

                const tiempoTrabajoUsuario = convertirMinutosAHoras(tiempoTrabajoUsuarioMinutos);
                const tiempoProductivoUsuario = convertirMinutosAHoras(stats.tiempo_productivo_minutos);

                resultado[usuario] = {
                    role: stats.role,
                    total_pedidos: stats.pedidos_surtidos.size,
                    total_partidas: stats.total_partidas,
                    total_piezas: stats.total_piezas,
                    tiempo_trabajo: tiempoTrabajoUsuario,
                    tiempo_productivo: tiempoProductivoUsuario,  // Tiempo productivo agregado
                };
            });
            return resultado;
        };

        res.json({
            turno1: { kpis: calcularKPIs(turnosData.turno1), usuarios: formatearUsuarios(turnosData.turno1.usuarios) },
            turno2: { kpis: calcularKPIs(turnosData.turno2), usuarios: formatearUsuarios(turnosData.turno2.usuarios) },
            turno3: { kpis: calcularKPIs(turnosData.turno3), usuarios: formatearUsuarios(turnosData.turno3.usuarios) },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los KPIs del surtido', error: error.message });
    }
};

module.exports = {
    getPrduSurtido,
};

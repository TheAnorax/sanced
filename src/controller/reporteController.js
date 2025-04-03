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


const getPrduPaqueteria = async (req, res) => {
    try {
        // Ejecutar la consulta para obtener los datos generales
        const [rows] = await pool.query(`
            SELECT 
                us.name AS usuario,
                us.role,
                COUNT(DISTINCT combined.codigo_ped) AS partidas, -- Total de partidas
                SUM(combined._pz + combined._pq + combined._inner + combined._master) AS cantidad_piezas, -- Total de piezas
                MIN(combined.inicio_embarque) AS primer_inicio_embarque, -- Primer embarque del grupo
                MAX(combined.fin_embarque) AS ultimo_fin_embarque -- Último embarque del grupo
            FROM (
                SELECT 
                    p.id_usuario_paqueteria,
                    p.codigo_ped,
                    p._pz,
                    p._pq,
                    p._inner,
                    p._master,
                    p.inicio_embarque,
                    p.fin_embarque
                FROM pedido_embarque p
                WHERE p.estado = 'F'
                AND p.id_usuario_paqueteria IS NOT NULL
                AND DATE(p.inicio_embarque) = CURDATE()

                UNION ALL

                SELECT 
                    pf.id_usuario_paqueteria,
                    pf.codigo_ped,
                    pf._pz,
                    pf._pq,
                    pf._inner,
                    pf._master,
                    pf.inicio_embarque,
                    pf.fin_embarque
                FROM pedido_finalizado pf
                WHERE pf.estado = 'F'
                AND pf.id_usuario_paqueteria IS NOT NULL
                AND DATE(pf.inicio_embarque) = CURDATE()
            ) AS combined
            LEFT JOIN usuarios us ON combined.id_usuario_paqueteria = us.id_usu
            WHERE us.role LIKE 'PQ%' -- Solo los usuarios con role PQ
            GROUP BY us.role, us.name;
        `);

        // Verificar si hay datos
        if (rows.length === 0) {
            return res.json({ message: "No hay datos disponibles para el día de hoy." });
        }

        // Calcular los valores generales
        const totalPartidas = rows.reduce((sum, row) => sum + row.partidas, 0);
        const totalPiezas = rows.reduce((sum, row) => sum + parseInt(row.cantidad_piezas || 0), 0);
        const primerInicioEmbarque = rows.reduce((min, row) => row.primer_inicio_embarque < min ? row.primer_inicio_embarque : min, rows[0].primer_inicio_embarque);
        const ultimoFinEmbarque = rows.reduce((max, row) => row.ultimo_fin_embarque > max ? row.ultimo_fin_embarque : max, rows[0].ultimo_fin_embarque);

        // Calcular tiempo total de trabajo
        const tiempoTotalTrabajo = new Date(new Date(ultimoFinEmbarque) - new Date(primerInicioEmbarque));
        const horas = String(tiempoTotalTrabajo.getUTCHours()).padStart(2, '0');
        const minutos = String(tiempoTotalTrabajo.getUTCMinutes()).padStart(2, '0');
        const segundos = String(tiempoTotalTrabajo.getUTCSeconds()).padStart(2, '0');

        // Responder con los datos generales
        res.json({
            total_partidas: totalPartidas,
            total_piezas: totalPiezas,
            primer_inicio_embarque: primerInicioEmbarque,
            ultimo_fin_embarque: ultimoFinEmbarque,
            tiempo_total_trabajo: `${horas}:${minutos}:${segundos}`
        });

    } catch (error) {
        console.error('Error al obtener la productividad de empaquetadores:', error);
        res.status(500).json({ message: 'Error al obtener la productividad de empaquetadores', error: error.message });
    }
};


const getPrduEmbarque = async (req, res) => {
    try {
        // Ejecutar la consulta para obtener los datos generales
        const [rows] = await pool.query(`
            WITH pedidos AS (
                -- Obtener los registros de pedido_embarque
                SELECT 
                    p.codigo_ped,
                    p._pz,
                    p._pq,
                    p._inner,
                    p._master,
                    p.inicio_embarque,
                    p.fin_embarque
                FROM pedido_embarque p
                WHERE p.estado = 'F'
                    AND p.id_usuario_paqueteria IS NOT NULL
                    AND (
                        (DATE(p.inicio_embarque) = CURDATE() AND TIME(p.inicio_embarque) >= '06:30:00') 
                        OR 
                        (DATE(p.inicio_embarque) = CURDATE() - INTERVAL 1 DAY AND TIME(p.inicio_embarque) >= '21:30:00')
                    )

                UNION ALL

                -- Obtener los registros de pedido_finalizado
                SELECT 
                    pf.codigo_ped,
                    pf._pz,
                    pf._pq,
                    pf._inner,
                    pf._master,
                    pf.inicio_embarque,
                    pf.fin_embarque
                FROM pedido_finalizado pf
                WHERE pf.estado = 'F'
                    AND pf.id_usuario_paqueteria IS NOT NULL
                    AND (
                        (DATE(pf.inicio_embarque) = CURDATE() AND TIME(pf.inicio_embarque) >= '06:30:00') 
                        OR 
                        (DATE(pf.inicio_embarque) = CURDATE() - INTERVAL 1 DAY AND TIME(pf.inicio_embarque) >= '21:30:00')
                    )
            )

            -- Agrupar por turno
            SELECT 
                CASE 
                    WHEN TIME(pedidos.inicio_embarque) >= '21:30:00' OR TIME(pedidos.inicio_embarque) < '06:30:00' THEN 'Turno 3'
                    WHEN TIME(pedidos.inicio_embarque) >= '06:30:00' AND TIME(pedidos.inicio_embarque) < '14:00:00' THEN 'Turno 1'
                    WHEN TIME(pedidos.inicio_embarque) >= '14:00:00' AND TIME(pedidos.inicio_embarque) < '21:30:00' THEN 'Turno 2'
                END AS turno,
                COUNT(DISTINCT pedidos.codigo_ped) AS total_partidas,  -- Suma total de partidas
                SUM(pedidos._pz + pedidos._pq + pedidos._inner + pedidos._master) AS total_piezas, -- Suma total de piezas
                MIN(pedidos.inicio_embarque) AS primer_inicio_embarque, -- Primer embarque del turno
                MAX(pedidos.fin_embarque) AS ultimo_fin_embarque, -- Último embarque del turno
                TIMEDIFF(MAX(pedidos.fin_embarque), MIN(pedidos.inicio_embarque)) AS tiempo_total_trabajo -- Tiempo total trabajado en el turno
            FROM pedidos
            GROUP BY turno
            ORDER BY FIELD(turno, 'Turno 3', 'Turno 1', 'Turno 2');
        `);

        // Enviar la respuesta con los datos generales por turno
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener la productividad de embarque:', error);
        res.status(500).json({ message: 'Error al obtener la productividad de embarque', error: error.message });
    }
};

const getPrduRecibo = async (req, res) => {
    try {
        // Ejecutar la consulta SQL
        const [rows] = await pool.query(`
            SELECT 
                COUNT(DISTINCT codigo) AS total_codigos,  -- Total de códigos únicos
                SUM(cantidad_recibida) AS total_cantidad_recibida  -- Suma total de cantidad recibida
            FROM recibo_cedis
            WHERE DATE(fecha_recibo) = CURDATE()
            AND est = 'R';
        `);

        // Verificar si hay datos y enviar respuesta
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Enviar solo el primer objeto (único resultado)
        } else {
            res.status(404).json({ message: "No hay datos disponibles para el día de hoy." });
        }
    } catch (error) {
        console.error("Error al obtener la productividad del recibo:", error);
        res.status(500).json({ message: "Error al obtener la productividad del recibo", error: error.message });
    }
};



const getHstorico2024 = async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          FECHA,
          ESTADO, 
          TOTAL_FACTURA_LT,
          CAJAS,
          TARIMAS,
          DIAS_DE_ENTREGA,
          NO_DE_CLIENTE
        FROM historico_2024
      `);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "No hay datos disponibles." });
      }
  
      const resultado = {};
  
      rows.forEach(row => {
        const estado = row.ESTADO;
        const fecha = new Date(row.FECHA);
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
  
        if (!resultado[estado]) {
          resultado[estado] = {};
        }
  
        if (!resultado[estado][mes]) {
          resultado[estado][mes] = {
            total_factura_lt: 0,
            total_cajas: 0,
            total_tarimas: 0,
            total_dias_entrega: 0,
            total_registros: 0,
            clientes: new Set()
          };
        }
  
        const grupo = resultado[estado][mes];
        grupo.total_factura_lt += parseFloat(row.TOTAL_FACTURA_LT) || 0;
        grupo.total_cajas += row.CAJAS || 0;
        grupo.total_tarimas += row.TARIMAS || 0;
        grupo.total_dias_entrega += row.DIAS_DE_ENTREGA || 0;
        grupo.total_registros += 1;
        if (row.NO_DE_CLIENTE) grupo.clientes.add(row.NO_DE_CLIENTE);
      });
  
      // Convertir Set a count y calcular promedios
      for (const estado in resultado) {
        for (const mes in resultado[estado]) {
          const grupo = resultado[estado][mes];
          grupo.promedio_dias_entrega = parseFloat((grupo.total_dias_entrega / grupo.total_registros).toFixed(2));
          grupo.total_clientes = grupo.clientes.size;
          delete grupo.clientes;
          delete grupo.total_dias_entrega;
          delete grupo.total_registros;
        }
      }
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al obtener la productividad:", error);
      res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
  };
  
  

module.exports = { getPrduRecibo };



module.exports = {
    getPrduSurtido,
    getPrduPaqueteria,
    getPrduEmbarque,
    getPrduRecibo,
    getHstorico2024
};

const pool = require("../config/database");
const moment = require("moment");

// Función para convertir minutos a formato "HH:mm"
const convertirMinutosAHoras = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return `${horas}h ${minutosRestantes}m`;
};

// Controlador para obtener KPIs de pedidos surtidos por dia 
const getPrduSurtido = async (req, res) => {
  try {
    const selectedDate = req.query.date || moment().format("YYYY-MM-DD");
    const previousDate = moment(selectedDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");

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
      selectedDate,
      previousDate,
      selectedDate,
      previousDate,
      selectedDate,
      previousDate,
    ]);

    const clasificarPorTurno = (inicio) => {
      if (
        moment(inicio).isBetween(
          `${selectedDate} 06:00:00`,
          `${selectedDate} 14:00:00`
        )
      ) {
        return "turno1";
      } else if (
        moment(inicio).isBetween(
          `${selectedDate} 14:00:00`,
          `${selectedDate} 21:30:00`
        )
      ) {
        return "turno2";
      } else if (
        moment(inicio).isBetween(
          `${previousDate} 21:30:00`,
          `${selectedDate} 06:00:00`
        )
      ) {
        return "turno3";
      }
      return null;
    };

    const turnosData = {
      turno1: {
        pedidos: [],
        usuarios: {},
        primer_inicio: null,
        ultimo_fin: null,
      },
      turno2: {
        pedidos: [],
        usuarios: {},
        primer_inicio: null,
        ultimo_fin: null,
      },
      turno3: {
        pedidos: [],
        usuarios: {},
        primer_inicio: null,
        ultimo_fin: null,
      },
    };

    rows.forEach((item) => {
      const turno = clasificarPorTurno(item.inicio_surtido);
      if (!turno) return;

      const inicio = moment(item.inicio_surtido).toDate();
      const fin = moment(item.fin_surtido).toDate();

      if (
        !turnosData[turno].primer_inicio ||
        inicio < turnosData[turno].primer_inicio
      ) {
        turnosData[turno].primer_inicio = inicio;
      }

      if (!turnosData[turno].ultimo_fin || fin > turnosData[turno].ultimo_fin) {
        turnosData[turno].ultimo_fin = fin;
      }

      const usuario = item.usuario_nombre || "Desconocido";
      if (!turnosData[turno].usuarios[usuario]) {
        turnosData[turno].usuarios[usuario] = {
          role: item.usuario_role,
          pedidos_surtidos: new Set(),
          total_partidas: 0,
          total_piezas: 0,
          primer_inicio: null,
          ultimo_fin: null,
          tiempo_productivo_minutos: 0, // Nuevo campo para el tiempo productivo
        };
      }

      const userStats = turnosData[turno].usuarios[usuario];
      userStats.pedidos_surtidos.add(item.pedido);
      userStats.total_partidas += 1;
      userStats.total_piezas += item.cant_surti;

      // Calcular el tiempo productivo para cada registro y sumarlo
      const tiempoProductivo = moment(item.fin_surtido).diff(
        moment(item.inicio_surtido),
        "minutes"
      );
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
      const totalProductos = turnoData.pedidos.reduce(
        (sum, pedido) => sum + pedido.cant_surti,
        0
      );
      const usuariosValidos = Object.values(turnoData.usuarios).filter(
        (usuario) => usuario.role !== "AV"
      );
      const totalPartidas = usuariosValidos.reduce(
        (sum, usuario) => sum + usuario.total_partidas,
        0
      );

      let tiempoTrabajoMinutos = 0;
      if (turnoData.primer_inicio && turnoData.ultimo_fin) {
        tiempoTrabajoMinutos = moment(turnoData.ultimo_fin).diff(
          moment(turnoData.primer_inicio),
          "minutes"
        );
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
          tiempoTrabajoUsuarioMinutos = moment(stats.ultimo_fin).diff(
            moment(stats.primer_inicio),
            "minutes"
          );
        }

        const tiempoTrabajoUsuario = convertirMinutosAHoras(
          tiempoTrabajoUsuarioMinutos
        );
        const tiempoProductivoUsuario = convertirMinutosAHoras(
          stats.tiempo_productivo_minutos
        );

        resultado[usuario] = {
          role: stats.role,
          total_pedidos: stats.pedidos_surtidos.size,
          total_partidas: stats.total_partidas,
          total_piezas: stats.total_piezas,
          tiempo_trabajo: tiempoTrabajoUsuario,
          tiempo_productivo: tiempoProductivoUsuario, // Tiempo productivo agregado
        };
      });
      return resultado;
    };

    res.json({
      turno1: {
        kpis: calcularKPIs(turnosData.turno1),
        usuarios: formatearUsuarios(turnosData.turno1.usuarios),
      },
      turno2: {
        kpis: calcularKPIs(turnosData.turno2),
        usuarios: formatearUsuarios(turnosData.turno2.usuarios),
      },
      turno3: {
        kpis: calcularKPIs(turnosData.turno3),
        usuarios: formatearUsuarios(turnosData.turno3.usuarios),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener los KPIs del surtido",
        error: error.message,
      });
  }
};

const getPrduPaqueteria  = async (req, res) => {
  try {
    const selectedDate = req.query.date || moment().format("YYYY-MM-DD");

    const [rows] = await pool.query(
      `
      SELECT 
          us.name AS usuario,
          us.role,
          COUNT(DISTINCT combined.codigo_ped) AS partidas,
          SUM(combined._pz + combined._pq + combined._inner + combined._master) AS cantidad_piezas,
          MIN(combined.inicio_embarque) AS primer_inicio_embarque,
          MAX(combined.fin_embarque) AS ultimo_fin_embarque
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
          AND DATE(p.inicio_embarque) = ?

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
          AND DATE(pf.inicio_embarque) = ?
      ) AS combined
      LEFT JOIN usuarios us ON combined.id_usuario_paqueteria = us.id_usu
      WHERE us.role LIKE 'PQ%'
      GROUP BY us.role, us.name;
    `,
      [selectedDate, selectedDate]
    );

    if (rows.length === 0) {
      return res.json({
        message: `No hay datos disponibles para la fecha: ${selectedDate}`,
      });
    }

    const totalPartidas = rows.reduce((sum, row) => sum + row.partidas, 0);
    const totalPiezas = rows.reduce((sum, row) => sum + parseInt(row.cantidad_piezas || 0), 0);

    const primerInicioEmbarque = rows.reduce(
      (min, row) => row.primer_inicio_embarque < min ? row.primer_inicio_embarque : min,
      rows[0].primer_inicio_embarque
    );
    const ultimoFinEmbarque = rows.reduce(
      (max, row) => row.ultimo_fin_embarque > max ? row.ultimo_fin_embarque : max,
      rows[0].ultimo_fin_embarque
    );

    const tiempoTotalTrabajo = new Date(new Date(ultimoFinEmbarque) - new Date(primerInicioEmbarque));
    const horas = String(tiempoTotalTrabajo.getUTCHours()).padStart(2, "0");
    const minutos = String(tiempoTotalTrabajo.getUTCMinutes()).padStart(2, "0");
    const segundos = String(tiempoTotalTrabajo.getUTCSeconds()).padStart(2, "0");

    res.json({
      total_partidas: totalPartidas,
      total_piezas: totalPiezas,
      primer_inicio_embarque: primerInicioEmbarque,
      ultimo_fin_embarque: ultimoFinEmbarque,
      tiempo_total_trabajo: `${horas}:${minutos}:${segundos}`,
      fecha_consultada: selectedDate
    });
  } catch (error) {
    console.error("Error al obtener la productividad de empaquetadores:", error);
    res.status(500).json({
      message: "Error al obtener la productividad de empaquetadores",
      error: error.message,
    });
  }
};


const getPrduEmbarque = async (req, res) => {
  try {
    const selectedDate = req.query.date || moment().format("YYYY-MM-DD");
    const previousDate = moment(selectedDate).subtract(1, "day").format("YYYY-MM-DD");

    const [rows] = await pool.query(
      `
      WITH pedidos AS (
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
                  (DATE(p.inicio_embarque) = ? AND TIME(p.inicio_embarque) >= '06:30:00') 
                  OR 
                  (DATE(p.inicio_embarque) = ? AND TIME(p.inicio_embarque) >= '21:30:00')
              )

          UNION ALL

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
                  (DATE(pf.inicio_embarque) = ? AND TIME(pf.inicio_embarque) >= '06:30:00') 
                  OR 
                  (DATE(pf.inicio_embarque) = ? AND TIME(pf.inicio_embarque) >= '21:30:00')
              )
      )

      SELECT 
          CASE 
              WHEN TIME(pedidos.inicio_embarque) >= '21:30:00' OR TIME(pedidos.inicio_embarque) < '06:30:00' THEN 'Turno 3'
              WHEN TIME(pedidos.inicio_embarque) >= '06:30:00' AND TIME(pedidos.inicio_embarque) < '14:00:00' THEN 'Turno 1'
              WHEN TIME(pedidos.inicio_embarque) >= '14:00:00' AND TIME(pedidos.inicio_embarque) < '21:30:00' THEN 'Turno 2'
          END AS turno,
          COUNT(DISTINCT pedidos.codigo_ped) AS total_partidas,
          SUM(pedidos._pz + pedidos._pq + pedidos._inner + pedidos._master) AS total_piezas,
          MIN(pedidos.inicio_embarque) AS primer_inicio_embarque,
          MAX(pedidos.fin_embarque) AS ultimo_fin_embarque,
          TIMEDIFF(MAX(pedidos.fin_embarque), MIN(pedidos.inicio_embarque)) AS tiempo_total_trabajo
      FROM pedidos
      GROUP BY turno
      ORDER BY FIELD(turno, 'Turno 3', 'Turno 1', 'Turno 2');
    `,
      [selectedDate, previousDate, selectedDate, previousDate]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener la productividad de embarque:", error);
    res.status(500).json({
      message: "Error al obtener la productividad de embarque",
      error: error.message,
    });
  }
};

const getPrduRecibo = async (req, res) => {
  try {
    const selectedDate = req.query.date || moment().format("YYYY-MM-DD");

    const [rows] = await pool.query(
      `
      SELECT 
          COUNT(DISTINCT codigo) AS total_codigos,
          SUM(cantidad_recibida) AS total_cantidad_recibida
      FROM recibo_cedis
      WHERE DATE(fecha_recibo) = ?
        AND est = 'R';
    `,
      [selectedDate]
    );

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({
        message: `No hay datos disponibles para la fecha: ${selectedDate}`,
      });
    }
  } catch (error) {
    console.error("❌ Error al obtener la productividad del recibo:", error);
    res.status(500).json({
      message: "Error al obtener la productividad del recibo",
      error: error.message,
    });
  }
};

const getHstorico2024 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT 
          FECHA,
          ESTADO, 
          TOTAL,
          CAJAS,
          TARIMAS,
          DIAS_DE_ENTREGA,
          NO_DE_CLIENTE,
          SUMA_GASTOS_EXTRAS
        FROM historico_2024
      `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay datos disponibles." });
    }

    const resultado = {};
    const totalGeneral = {}; // Acumulador global por mes

    rows.forEach((row) => {
      const estado = row.ESTADO;
      const fecha = new Date(row.FECHA);
      const mes = `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}`;

      // Estructura por estado
      if (!resultado[estado]) resultado[estado] = {};
      if (!resultado[estado][mes]) {
        resultado[estado][mes] = {
          total_factura_lt: 0,
          total_flete: 0,
          total_cajas: 0,
          total_tarimas: 0,
          total_dias_entrega: 0,
          total_registros: 0,
          clientes: new Set(),
        };
      }

      // Acumulador por estado/mes
      const grupo = resultado[estado][mes];
      grupo.total_factura_lt += parseFloat(row.TOTAL) || 0;
      grupo.total_flete += parseFloat(row.SUMA_GASTOS_EXTRAS) || 0;
      grupo.total_cajas += row.CAJAS || 0;
      grupo.total_tarimas += row.TARIMAS || 0;
      grupo.total_dias_entrega += row.DIAS_DE_ENTREGA || 0;
      grupo.total_registros += 1;
      if (row.NO_DE_CLIENTE) grupo.clientes.add(row.NO_DE_CLIENTE);

      // Acumulador general por mes
      if (!totalGeneral[mes]) {
        totalGeneral[mes] = {
          total_factura_lt: 0,
          total_flete: 0,
          total_cajas: 0,
          total_tarimas: 0,
          total_dias_entrega: 0,
          total_registros: 0,
          clientes: new Set(),
        };
      }

      const global = totalGeneral[mes];
      global.total_factura_lt += parseFloat(row.TOTAL) || 0;
      global.total_flete += parseFloat(row.SUMA_GASTOS_EXTRAS) || 0;
      global.total_cajas += row.CAJAS || 0;
      global.total_tarimas += row.TARIMAS || 0;
      global.total_dias_entrega += row.DIAS_DE_ENTREGA || 0;
      global.total_registros += 1;
      if (row.NO_DE_CLIENTE) global.clientes.add(row.NO_DE_CLIENTE);
    });

    // Procesamiento por estado → promedio, conteo
    for (const estado in resultado) {
      for (const mes in resultado[estado]) {
        const grupo = resultado[estado][mes];
        grupo.promedio_dias_entrega = parseFloat(
          (grupo.total_dias_entrega / grupo.total_registros).toFixed(2)
        );
        grupo.total_clientes = grupo.clientes.size;

        delete grupo.clientes;
        delete grupo.total_dias_entrega;
        delete grupo.total_registros;
      }
    }

    // Procesamiento de total general
    const resumenGeneral = {};
    for (const mes in totalGeneral) {
      const grupo = totalGeneral[mes];
      resumenGeneral[mes] = {
        total_factura_lt: grupo.total_factura_lt,
        total_flete: grupo.total_flete,
        total_cajas: grupo.total_cajas,
        total_tarimas: grupo.total_tarimas,
        promedio_dias_entrega: parseFloat(
          (grupo.total_dias_entrega / grupo.total_registros).toFixed(2)
        ),
        total_clientes: grupo.clientes.size,
      };
    }

    // Agregamos el arreglo adicional sin modificar el objeto base
    resultado["total_general"] = resumenGeneral;

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener la productividad:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};
// Controlador para obtener KPIs de pedidos surtidos por mes

const getPrduSurtidoPorRango = async (req, res) => {
  try {
    let fechaInicio = req.query.inicio;
    let fechaFin = req.query.fin;

    if (!fechaInicio || !fechaFin) {
      const ahora = moment();
      fechaInicio = ahora.startOf("month").format("YYYY-MM-DD");
      fechaFin = ahora.endOf("month").format("YYYY-MM-DD");
    }

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
          WHERE DATE(p.inicio_surtido) BETWEEN ? AND ?

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
          WHERE DATE(e.inicio_surtido) BETWEEN ? AND ?

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
          WHERE DATE(f.inicio_surtido) BETWEEN ? AND ?
      ) AS pedidos
      ORDER BY inicio_surtido ASC
    `;

    const [rows] = await pool.query(query, [
      fechaInicio, fechaFin,
      fechaInicio, fechaFin,
      fechaInicio, fechaFin
    ]);

    const resultadosPorDia = {};

    rows.forEach((item) => {
      const fecha = moment(item.inicio_surtido).format("YYYY-MM-DD");
      const hora = moment(item.inicio_surtido).format("HH:mm:ss");
      let turno = "otro";

      if (hora >= "06:00:00" && hora < "14:00:00") turno = "turno1";
      else if (hora >= "14:00:00" && hora < "21:30:00") turno = "turno2";
      else turno = "turno3";

      if (!resultadosPorDia[fecha]) {
        resultadosPorDia[fecha] = {
          turno1: [],
          turno2: [],
          turno3: [],
        };
      }

      resultadosPorDia[fecha][turno].push(item);
    });

    // Calcular KPIs por día y por turno
    const resumenPorDia = {};

    Object.entries(resultadosPorDia).forEach(([fecha, turnos]) => {
      resumenPorDia[fecha] = {};
      Object.entries(turnos).forEach(([turno, pedidos]) => {
        const usuarios = {};
        let primer_inicio = null;
        let ultimo_fin = null;

        pedidos.forEach((p) => {
          const inicio = moment(p.inicio_surtido);
          const fin = moment(p.fin_surtido);

          if (!primer_inicio || inicio.isBefore(primer_inicio)) primer_inicio = inicio;
          if (!ultimo_fin || fin.isAfter(ultimo_fin)) ultimo_fin = fin;

          const usuario = p.usuario_nombre || "Desconocido";
          if (!usuarios[usuario]) {
            usuarios[usuario] = {
              role: p.usuario_role,
              pedidos_surtidos: new Set(),
              total_partidas: 0,
              total_piezas: 0,
              primer_inicio: null,
              ultimo_fin: null,
              tiempo_productivo_minutos: 0,
            };
          }

          const userStats = usuarios[usuario];
          userStats.pedidos_surtidos.add(p.pedido);
          userStats.total_partidas += 1;
          userStats.total_piezas += p.cant_surti;
          userStats.tiempo_productivo_minutos += fin.diff(inicio, "minutes");

          if (!userStats.primer_inicio || inicio.isBefore(userStats.primer_inicio)) userStats.primer_inicio = inicio;
          if (!userStats.ultimo_fin || fin.isAfter(userStats.ultimo_fin)) userStats.ultimo_fin = fin;
        });

        const usuariosFormateados = {};
        Object.entries(usuarios).forEach(([nombre, datos]) => {
          const tiempo_trabajo = datos.ultimo_fin && datos.primer_inicio
            ? convertirMinutosAHoras(datos.ultimo_fin.diff(datos.primer_inicio, "minutes"))
            : "00:00:00";

          usuariosFormateados[nombre] = {
            role: datos.role,
            total_pedidos: datos.pedidos_surtidos.size,
            total_partidas: datos.total_partidas,
            total_piezas: datos.total_piezas,
            tiempo_trabajo,
            tiempo_productivo: convertirMinutosAHoras(datos.tiempo_productivo_minutos),
          };
        });

        const total_pedidos = pedidos.length;
        const total_piezas = pedidos.reduce((acc, p) => acc + p.cant_surti, 0);
        const tiempo_total = primer_inicio && ultimo_fin ? convertirMinutosAHoras(ultimo_fin.diff(primer_inicio, "minutes")) : "00:00:00";

        resumenPorDia[fecha][turno] = {
          kpis: {
            total_pedidos,
            total_productos_surtidos: total_piezas,
            tiempo_trabajo: tiempo_total,
            total_partidas: pedidos.length,
          },
          usuarios: usuariosFormateados,
        };
      });
    });

    res.json({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      resumen: resumenPorDia
    });
  } catch (error) {
    console.error("❌ Error al obtener los KPIs del surtido por rango:", error);
    res.status(500).json({
      message: "Error al obtener los KPIs del surtido por rango",
      error: error.message,
    });
  }
};

const getPrduPaqueteriaPorrango = async (req, res) => {
  try {
    const { date, inicio, fin } = req.query;
    const moment = require("moment");

    let fechaInicio, fechaFin;

    if (inicio && fin) {
      fechaInicio = inicio;
      fechaFin = fin;
    } else if (date) {
      fechaInicio = fechaFin = date;
    } else {
      const today = moment();
      fechaInicio = today.startOf("month").format("YYYY-MM-DD");
      fechaFin = today.endOf("month").format("YYYY-MM-DD");
    }

    const [rows] = await pool.query(
      `
      SELECT 
          DATE(combined.inicio_embarque) AS fecha,
          us.name AS usuario,
          us.role,
          combined.codigo_ped,
          combined._pz,
          combined._pq,
          combined._inner,
          combined._master,
          combined.inicio_embarque,
          combined.fin_embarque
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
          AND DATE(p.inicio_embarque) BETWEEN ? AND ?

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
          AND DATE(pf.inicio_embarque) BETWEEN ? AND ?
      ) AS combined
      LEFT JOIN usuarios us ON combined.id_usuario_paqueteria = us.id_usu
      WHERE us.role LIKE 'PQ%'
      ORDER BY combined.inicio_embarque;
      `,
      [fechaInicio, fechaFin, fechaInicio, fechaFin]
    );

    if (rows.length === 0) {
      return res.json({
        message: `No hay datos disponibles entre: ${fechaInicio} y ${fechaFin}`,
      });
    }

    // 🔹 Agrupar por fecha
    const resumenDiario = {};
    const usuariosMap = {};

    for (const row of rows) {
      const fecha = row.fecha;

      const piezas =
        parseInt(row._pz || 0) +
        parseInt(row._pq || 0) +
        parseInt(row._inner || 0) +
        parseInt(row._master || 0);

      // Resumen diario
      if (!resumenDiario[fecha]) {
        resumenDiario[fecha] = {
          fecha,
          total_partidas: 0,
          total_piezas: 0,
          primer_inicio_embarque: row.inicio_embarque,
          ultimo_fin_embarque: row.fin_embarque,
        };
      }

      resumenDiario[fecha].total_partidas += 1;
      resumenDiario[fecha].total_piezas += piezas;

      if (row.inicio_embarque < resumenDiario[fecha].primer_inicio_embarque) {
        resumenDiario[fecha].primer_inicio_embarque = row.inicio_embarque;
      }
      if (row.fin_embarque > resumenDiario[fecha].ultimo_fin_embarque) {
        resumenDiario[fecha].ultimo_fin_embarque = row.fin_embarque;
      }

      // Por usuario
      const key = `${row.usuario}_${row.role}`;
      if (!usuariosMap[key]) {
        usuariosMap[key] = {
          usuario: row.usuario,
          role: row.role,
          partidas: 0,
          cantidad_piezas: 0,
          primer_inicio_embarque: row.inicio_embarque,
          ultimo_fin_embarque: row.fin_embarque,
        };
      }

      usuariosMap[key].partidas += 1;
      usuariosMap[key].cantidad_piezas += piezas;

      if (row.inicio_embarque < usuariosMap[key].primer_inicio_embarque) {
        usuariosMap[key].primer_inicio_embarque = row.inicio_embarque;
      }
      if (row.fin_embarque > usuariosMap[key].ultimo_fin_embarque) {
        usuariosMap[key].ultimo_fin_embarque = row.fin_embarque;
      }
    }

    // 🔹 Procesar duración de trabajo por día
    const resumenDiarioFinal = Object.values(resumenDiario).map((d) => {
      const diff = new Date(d.ultimo_fin_embarque) - new Date(d.primer_inicio_embarque);
      const tiempo = new Date(diff);
      const horas = String(tiempo.getUTCHours()).padStart(2, "0");
      const minutos = String(tiempo.getUTCMinutes()).padStart(2, "0");
      const segundos = String(tiempo.getUTCSeconds()).padStart(2, "0");
      return {
        ...d,
        tiempo_total_trabajo: `${horas}:${minutos}:${segundos}`,
      };
    });

    const totalPartidas = resumenDiarioFinal.reduce((acc, d) => acc + d.total_partidas, 0);
    const totalPiezas = resumenDiarioFinal.reduce((acc, d) => acc + d.total_piezas, 0);

    const primerInicio = resumenDiarioFinal[0].primer_inicio_embarque;
    const ultimoFin = resumenDiarioFinal.reduce(
      (max, d) => (d.ultimo_fin_embarque > max ? d.ultimo_fin_embarque : max),
      resumenDiarioFinal[0].ultimo_fin_embarque
    );

    const tiempoTotal = new Date(new Date(ultimoFin) - new Date(primerInicio));
    const h = String(tiempoTotal.getUTCHours()).padStart(2, "0");
    const m = String(tiempoTotal.getUTCMinutes()).padStart(2, "0");
    const s = String(tiempoTotal.getUTCSeconds()).padStart(2, "0");

    res.json({
      total_partidas: totalPartidas,
      total_piezas: totalPiezas,
      primer_inicio_embarque: primerInicio,
      ultimo_fin_embarque: ultimoFin,
      tiempo_total_trabajo: `${h}:${m}:${s}`,
      rango_consultado: { inicio: fechaInicio, fin: fechaFin },
      resumen_diario: resumenDiarioFinal,
      usuarios: Object.values(usuariosMap),
    });
  } catch (error) {
    console.error("❌ Error al obtener la productividad de empaquetadores:", error);
    res.status(500).json({
      message: "Error al obtener la productividad de empaquetadores",
      error: error.message,
    });
  }
};




// reporte mapa
const getTop102024 = async (req, res) => {
    try {
      const [top10] = await pool.query(`
        SELECT 
          codigo_ped,
          SUM(cantidad) AS total_vendido
        FROM 
          pedido_finalizados_2024
        GROUP BY 
          codigo_ped
        ORDER BY 
          total_vendido DESC
        LIMIT 10;
      `);
  
      if (top10.length === 0) {
        return res.status(404).json({ message: "No hay datos disponibles para el día de hoy." });
      }
  
      // Obtener solo los códigos
      const codigos = top10.map((item) => item.codigo_ped);
  
      // Crear placeholders dinámicamente (?, ?, ?, ...)
      const placeholders = codigos.map(() => "?").join(",");
  
      // Consulta de descripciones desde productos
      const [productos] = await pool.query(
        `SELECT codigo_pro, des FROM productos WHERE codigo_pro IN (${placeholders})`,
        codigos
      );
  
      // Indexar productos por codigo_pro para buscar rápido
      const productosMap = {};
      productos.forEach(prod => {
        productosMap[prod.codigo_pro] = prod.des;
      });
  
      // Unir la info
      const resultado = top10.map(item => ({
        codigo_ped: item.codigo_ped,
        total_vendido: Number(item.total_vendido).toLocaleString("es-MX"),
        descripcion: productosMap[item.codigo_ped] || "Sin descripción"
      }));
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al obtener el top de productos vendidos:", error);
      res.status(500).json({
        message: "Error al obtener el top de productos vendidos",
        error: error.message,
      });
    }
  };

  
const getTop102025 = async (req, res) => {
    try {
      const [top10] = await pool.query(`
        SELECT 
          codigo_ped,
          SUM(cantidad) AS total_vendido
        FROM 
          pedido_finalizado
        GROUP BY 
          codigo_ped
        ORDER BY 
          total_vendido DESC
        LIMIT 10;
      `);
  
      if (top10.length === 0) {
        return res.status(404).json({ message: "No hay datos disponibles para el día de hoy." });
      }
  
      // Obtener solo los códigos
      const codigos = top10.map((item) => item.codigo_ped);
  
      // Crear placeholders dinámicamente (?, ?, ?, ...)
      const placeholders = codigos.map(() => "?").join(",");
  
      // Consulta de descripciones desde productos
      const [productos] = await pool.query(
        `SELECT codigo_pro, des FROM productos WHERE codigo_pro IN (${placeholders})`,
        codigos
      );
  
      // Indexar productos por codigo_pro para buscar rápido
      const productosMap = {};
      productos.forEach(prod => {
        productosMap[prod.codigo_pro] = prod.des;
      });
  
      // Unir la info
      const resultado = top10.map(item => ({
        codigo_ped: item.codigo_ped,
        total_vendido: Number(item.total_vendido).toLocaleString("es-MX"),
        descripcion: productosMap[item.codigo_ped] || "Sin descripción"
      }));
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al obtener el top de productos vendidos:", error);
      res.status(500).json({
        message: "Error al obtener el top de productos vendidos",
        error: error.message,
      });
    }
  };

  const getTopProductosPorEstado = async (req, res) => {
    try {
      const [ordenes] = await pool.query(`
        SELECT NO_DE_ORDEN, ESTADO
        FROM historico_2024
        WHERE NO_DE_ORDEN IS NOT NULL AND ESTADO IS NOT NULL
      `);
  
      if (ordenes.length === 0) {
        return res.status(404).json({ message: "No hay órdenes disponibles." });
      }
  
      const estadoPedidosMap = {};
      for (const row of ordenes) {
        const estado = row.ESTADO;
        const pedido = row.NO_DE_ORDEN;
        if (!estadoPedidosMap[estado]) estadoPedidosMap[estado] = new Set();
        estadoPedidosMap[estado].add(pedido);
      }
  
      const resultado = {};
      const codigosGlobalSet = new Set();
  
      for (const estado in estadoPedidosMap) {
        const pedidos = Array.from(estadoPedidosMap[estado]);
        if (pedidos.length === 0) continue;
  
        const placeholders = pedidos.map(() => "?").join(",");
        const [productos] = await pool.query(
          `
          SELECT 
            codigo_ped,
            SUM(cantidad) AS total_vendido
          FROM pedido_finalizados_2024
          WHERE pedido IN (${placeholders})
          GROUP BY codigo_ped
          ORDER BY total_vendido DESC
          LIMIT 10;
          `,
          pedidos
        );
  
        // Guardamos códigos para luego buscar descripciones
        productos.forEach(p => codigosGlobalSet.add(p.codigo_ped));
  
        resultado[estado] = productos.map(p => ({
          codigo_ped: p.codigo_ped,
          total_vendido: Number(p.total_vendido).toLocaleString("es-MX")
        }));
      }
  
      // Buscar descripciones en lote
      const codigos = Array.from(codigosGlobalSet);
      let descripcionMap = {};
      if (codigos.length > 0) {
        const placeholders = codigos.map(() => "?").join(",");
        const [descripciones] = await pool.query(
          `SELECT codigo_pro, des FROM productos WHERE codigo_pro IN (${placeholders})`,
          codigos
        );
  
        descripcionMap = Object.fromEntries(descripciones.map(d => [d.codigo_pro, d.des]));
      }
  
      // Agregar descripciones al resultado
      for (const estado in resultado) {
        resultado[estado] = resultado[estado].map(item => ({
          ...item,
          descripcion: descripcionMap[item.codigo_ped] || "Sin descripción"
        }));
      }
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al obtener top productos por estado:", error);
      res.status(500).json({
        message: "Error al procesar la información",
        error: error.message,
      });
    }
  };
  
  
  
  
  
  

module.exports = {
  getPrduSurtido,
  getPrduPaqueteria,
  getPrduEmbarque,
  getPrduRecibo,
  getHstorico2024,
  getTop102024,
  getTop102025,
  getTopProductosPorEstado,
  getPrduSurtidoPorRango,
  getPrduPaqueteriaPorrango
};

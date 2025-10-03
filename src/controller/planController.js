const pool = require('../config/database');

const PlanDelDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    const getFormattedDate = (date = new Date()) =>
      new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City" }).format(date);
    const selectedDate = fecha || getFormattedDate();

    // 1. Pedidos principales
    const [rows] = await pool.query(
      `
      SELECT 
        p.id, p.routeName, p.\`NO ORDEN\` AS no_orden, p.\`NUM. CLIENTE\` AS num_cliente,
        p.\`NOMBRE DEL CLIENTE\` AS nombre_cliente, p.ZONA, p.TOTAL, p.PARTIDAS, p.PIEZAS
      FROM paqueteria p
      WHERE DATE(p.created_at) = ?
    `,
      [selectedDate]
    );

    const pedidosIds = rows.map((p) => String(p.no_orden).trim());
    if (pedidosIds.length === 0) return res.json([]);

    // 2. Consultas auxiliares
    const [surtidos] = await pool.query(
      `
      SELECT 
        pedido,
        COUNT(*) AS total_partidas,
        SUM(CASE WHEN cant_surti = cantidad OR (cant_surti + cant_no_env) = cantidad THEN 1 ELSE 0 END) AS partidas_surtidas
      FROM pedido_surtido
      WHERE pedido IN (?)
      GROUP BY pedido
    `,
      [pedidosIds]
    );

    const [embarques] = await pool.query(
      `
      SELECT 
        pedido,
        COUNT(*) AS total_partidas,
        SUM(CASE WHEN (v_pz > 0 OR v_pq > 0 OR v_inner > 0 OR v_master > 0) THEN 1 ELSE 0 END) AS partidas_embarcadas
      FROM pedido_embarque
      WHERE pedido IN (?)
      GROUP BY pedido
    `,
      [pedidosIds]
    );

    const [finalizados] = await pool.query(
      `SELECT pedido FROM pedido_finalizado WHERE pedido IN (?)`,
      [pedidosIds]
    );

    // 3. Indexamos
    const surtidoMap = new Map(surtidos.map(s => [String(s.pedido).trim(), s]));
    const embarqueMap = new Map(embarques.map(e => [String(e.pedido).trim(), e]));
    const finalizadoSet = new Set(finalizados.map(f => String(f.pedido).trim()));

    // 4. Procesamiento
    const resumenPorRuta = {};
    const clientesGlobales = new Set();
    let partidasGlobal = 0, piezasGlobal = 0, totalGlobal = 0;
    let totalPedidos = 0;
    let avanceGlobalSurtido = 0, avanceGlobalEmbarque = 0, avanceGlobalFinalizado = 0;
    let partidasGlobalSurtidas = 0, partidasGlobalEmbarcadas = 0;

    // 🔹 contadores globales de estado
    let pedidosNoAsignados = 0;
    let pedidosEnSurtido = 0;
    let pedidosEnEmbarque = 0;
    let pedidosFinalizados = 0;

    for (const row of rows) {
      const key = row.routeName || "Sin Ruta";
      const id = String(row.no_orden).trim();

      let avanceSurtido = 0, avanceEmbarque = 0, avanceFinalizado = 0;
      let partidasSurtidas = 0, partidasEmbarcadas = 0;
      const totalPartidasPedido = Number(row.PARTIDAS) || 0;

      if (finalizadoSet.has(id)) {
        pedidosFinalizados++;
        avanceSurtido = 100;
        avanceEmbarque = 100;
        avanceFinalizado = 100;
        partidasSurtidas = totalPartidasPedido;
        partidasEmbarcadas = totalPartidasPedido;
      } else if (embarqueMap.has(id)) {
        pedidosEnEmbarque++;
        const { total_partidas = 0, partidas_embarcadas = 0 } = embarqueMap.get(id) || {};
        avanceSurtido = 100;
        avanceEmbarque = total_partidas > 0 ? (partidas_embarcadas / total_partidas) * 100 : 0;
        partidasSurtidas = Number(total_partidas);
        partidasEmbarcadas = Number(partidas_embarcadas);
      } else if (surtidoMap.has(id)) {
        pedidosEnSurtido++;
        const { total_partidas = 0, partidas_surtidas = 0 } = surtidoMap.get(id) || {};
        avanceSurtido = total_partidas > 0 ? (partidas_surtidas / total_partidas) * 100 : 0;
        partidasSurtidas = Number(partidas_surtidas);
        partidasEmbarcadas = 0;
      } else {
        pedidosNoAsignados++;
      }

      if (!resumenPorRuta[key]) {
        resumenPorRuta[key] = {
          routeName: key,
          clientesUnicos: new Set(),
          totalPartidas: 0,
          totalPiezas: 0,
          totalTotal: 0,
          sumaAvanceSurtido: 0,
          sumaAvanceEmbarque: 0,
          sumaAvanceFinalizado: 0,
          partidasSurtidas: 0,
          partidasEmbarcadas: 0,
          totalPedidos: 0,
        };
      }

      resumenPorRuta[key].clientesUnicos.add(row.num_cliente);
      resumenPorRuta[key].totalPartidas += totalPartidasPedido;
      resumenPorRuta[key].totalPiezas += Number(row.PIEZAS) || 0;
      resumenPorRuta[key].totalTotal += Number(row.TOTAL) || 0;
      resumenPorRuta[key].sumaAvanceSurtido += avanceSurtido;
      resumenPorRuta[key].sumaAvanceEmbarque += avanceEmbarque;
      resumenPorRuta[key].sumaAvanceFinalizado += avanceFinalizado;
      resumenPorRuta[key].partidasSurtidas += Number(partidasSurtidas);
      resumenPorRuta[key].partidasEmbarcadas += Number(partidasEmbarcadas);
      resumenPorRuta[key].totalPedidos += 1;

      clientesGlobales.add(row.num_cliente);
      partidasGlobal += totalPartidasPedido;
      piezasGlobal += Number(row.PIEZAS) || 0;
      totalGlobal += Number(row.TOTAL) || 0;
      avanceGlobalSurtido += avanceSurtido;
      avanceGlobalEmbarque += avanceEmbarque;
      avanceGlobalFinalizado += avanceFinalizado;
      partidasGlobalSurtidas += Number(partidasSurtidas);
      partidasGlobalEmbarcadas += Number(partidasEmbarcadas);
      totalPedidos++;
    }

    let resumenPorRutas = Object.values(resumenPorRuta).map((ruta) => ({
      routeName: ruta.routeName,
      totalClientes: ruta.clientesUnicos.size,
      totalPartidas: ruta.totalPartidas,
      totalPiezas: ruta.totalPiezas,
      total: ruta.totalTotal.toFixed(2),
      partidasSurtidas: Number(ruta.partidasSurtidas),
      partidasEmbarcadas: Number(ruta.partidasEmbarcadas),
      avanceSurtido: `${(ruta.sumaAvanceSurtido / ruta.totalPedidos).toFixed(0)}%`,
      avanceEmbarque: `${(ruta.sumaAvanceEmbarque / ruta.totalPedidos).toFixed(0)}%`,
      avanceFinalizado: `${(ruta.sumaAvanceFinalizado / ruta.totalPedidos).toFixed(0)}%`,
    }));

    const resumenGlobal = {
      routeName: "TOTAL GENERAL",
      totalClientes: clientesGlobales.size,
      totalPartidas: partidasGlobal,
      totalPiezas: piezasGlobal,
      total: totalGlobal.toFixed(2),
      partidasSurtidas: Number(partidasGlobalSurtidas),
      partidasEmbarcadas: Number(partidasGlobalEmbarcadas),
      avanceSurtido: `${(avanceGlobalSurtido / totalPedidos).toFixed(0)}%`,
      avanceEmbarque: `${(avanceGlobalEmbarque / totalPedidos).toFixed(0)}%`,
      avanceFinalizado: `${(avanceGlobalFinalizado / totalPedidos).toFixed(0)}%`,
    };

    // 👇 Ordenar: primero paqueterías, después R- ordenadas, y al final el total
    const paqueteriasPrimero = ["C.R", "TRES GUERRAS", "PAQUETEXPRESS", "PITIC", "FLECHISA"];

    resumenPorRutas = resumenPorRutas.sort((a, b) => {
      // Paqueterías primero
      if (paqueteriasPrimero.includes(a.routeName) && !paqueteriasPrimero.includes(b.routeName)) return -1;
      if (!paqueteriasPrimero.includes(a.routeName) && paqueteriasPrimero.includes(b.routeName)) return 1;

      // Si ambos son R-, orden numérico
      if (a.routeName.startsWith("R-") && b.routeName.startsWith("R-")) {
        const numA = parseInt(a.routeName.replace(/\D/g, ""), 10);
        const numB = parseInt(b.routeName.replace(/\D/g, ""), 10);
        return numA - numB;
      }

      // Mantener orden alfabético para otros
      return a.routeName.localeCompare(b.routeName);
    });

    // 👇 Agregamos el total al final
    const resultadoFinal = [...resumenPorRutas, resumenGlobal];

    // Contadores globales
    const resumenEstados = {
      totalPedidosPlan: rows.length,
      pedidosNoAsignados,
      pedidosEnSurtido,
      pedidosEnEmbarque,
      pedidosFinalizados
    };

    res.json({ rutas: resultadoFinal, estados: resumenEstados });
  } catch (error) {
    console.error("Error en PlanDelDia:", error.message);
    res.status(500).json({ message: "Error al obtener plan del día", error: error.message });
  }
};

module.exports = { PlanDelDia };

const pool = require('../config/database');

const PlanDelDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    const getFormattedDate = (date = new Date()) =>
      new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City" }).format(date);
    const selectedDate = fecha || getFormattedDate();

    // 1️⃣ Pedidos principales (ahora incluimos tipo_original)
    const [rows] = await pool.query(
      `
      SELECT 
        p.id, 
        p.routeName, 
        p.\`NO ORDEN\` AS no_orden,
        p.tipo_original,
        p.\`NUM. CLIENTE\` AS num_cliente,
        p.\`NOMBRE DEL CLIENTE\` AS nombre_cliente,
        p.ZONA, 
        p.TOTAL, 
        p.PARTIDAS, 
        p.PIEZAS
      FROM paqueteria p
      WHERE DATE(p.created_at) = ?
    `,
      [selectedDate]
    );

    // 🔹 Clave única combinando pedido + tipo
    const pedidosClaves = rows.map(
      (p) => `${String(p.no_orden).trim()}_${String(p.tipo_original || "").trim().toUpperCase()}`
    );

    if (pedidosClaves.length === 0) return res.json([]);

    // 2️⃣ Consultas auxiliares (usando clave combinada)
    const [surtidos] = await pool.query(`
      SELECT 
        CONCAT(pedido, '_', tipo) AS clave,
        COUNT(*) AS total_partidas,
        SUM(CASE 
              WHEN cant_surti = cantidad OR (cant_surti + cant_no_env) = cantidad 
              THEN 1 ELSE 0 
            END) AS partidas_surtidas
      FROM pedido_surtido
      WHERE CONCAT(pedido, '_', tipo) IN (?)
      GROUP BY clave
    `, [pedidosClaves]);

    const [embarques] = await pool.query(`
      SELECT 
        CONCAT(pedido, '_', tipo) AS clave,
        COUNT(*) AS total_partidas,
        SUM(CASE 
              WHEN (v_pz > 0 OR v_pq > 0 OR v_inner > 0 OR v_master > 0) 
              THEN 1 ELSE 0 
            END) AS partidas_embarcadas
      FROM pedido_embarque
      WHERE CONCAT(pedido, '_', tipo) IN (?)
      GROUP BY clave
    `, [pedidosClaves]);

    const [finalizados] = await pool.query(`
      SELECT CONCAT(pedido, '_', tipo) AS clave
      FROM pedido_finalizado
      WHERE CONCAT(pedido, '_', tipo) IN (?)
    `, [pedidosClaves]);

    // 3️⃣ Indexamos por clave única
    const surtidoMap = new Map(surtidos.map(s => [String(s.clave).trim(), s]));
    const embarqueMap = new Map(embarques.map(e => [String(e.clave).trim(), e]));
    const finalizadoSet = new Set(finalizados.map(f => String(f.clave).trim()));

    // 4️⃣ Procesamiento
    const resumenPorRuta = {};
    const clientesGlobales = new Set();
    let partidasGlobal = 0, piezasGlobal = 0, totalGlobal = 0;
    let totalPedidos = 0;
    let avanceGlobalSurtido = 0, avanceGlobalEmbarque = 0, avanceGlobalFinalizado = 0;
    let partidasGlobalSurtidas = 0, partidasGlobalEmbarcadas = 0;
    let pedidosNoAsignados = 0, pedidosEnSurtido = 0, pedidosEnEmbarque = 0, pedidosFinalizados = 0;

    for (const row of rows) {
      const key = row.routeName || "Sin Ruta";
      const clave = `${String(row.no_orden).trim()}_${String(row.tipo_original || "").trim().toUpperCase()}`;
      const totalPartidasPedido = Number(row.PARTIDAS) || 0;

      let avanceSurtido = 0, avanceEmbarque = 0, avanceFinalizado = 0;
      let partidasSurtidas = 0, partidasEmbarcadas = 0;

      if (finalizadoSet.has(clave)) {
        pedidosFinalizados++;
        avanceSurtido = 100;
        avanceEmbarque = 100;
        avanceFinalizado = 100;
        partidasSurtidas = totalPartidasPedido;
        partidasEmbarcadas = totalPartidasPedido;
      } else if (embarqueMap.has(clave)) {
        pedidosEnEmbarque++;
        const { total_partidas = 0, partidas_embarcadas = 0 } = embarqueMap.get(clave) || {};
        avanceSurtido = 100;
        avanceEmbarque = total_partidas > 0 ? (partidas_embarcadas / total_partidas) * 100 : 0;
        partidasSurtidas = Number(total_partidas);
        partidasEmbarcadas = Number(partidas_embarcadas);
      } else if (surtidoMap.has(clave)) {
        pedidosEnSurtido++;
        const { total_partidas = 0, partidas_surtidas = 0 } = surtidoMap.get(clave) || {};
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
      resumenPorRuta[key].partidasSurtidas += partidasSurtidas;
      resumenPorRuta[key].partidasEmbarcadas += partidasEmbarcadas;
      resumenPorRuta[key].totalPedidos += 1;

      clientesGlobales.add(row.num_cliente);
      partidasGlobal += totalPartidasPedido;
      piezasGlobal += Number(row.PIEZAS) || 0;
      totalGlobal += Number(row.TOTAL) || 0;
      avanceGlobalSurtido += avanceSurtido;
      avanceGlobalEmbarque += avanceEmbarque;
      avanceGlobalFinalizado += avanceFinalizado;
      partidasGlobalSurtidas += partidasSurtidas;
      partidasGlobalEmbarcadas += partidasEmbarcadas;
      totalPedidos++;
    }

    // 5️⃣ Generar resumenes
    let resumenPorRutas = Object.values(resumenPorRuta).map((ruta) => ({
      routeName: ruta.routeName,
      totalClientes: ruta.clientesUnicos.size,
      totalPartidas: ruta.totalPartidas,
      totalPiezas: ruta.totalPiezas,
      total: ruta.totalTotal.toFixed(2),
      partidasSurtidas: ruta.partidasSurtidas,
      partidasEmbarcadas: ruta.partidasEmbarcadas,
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
      partidasSurtidas: partidasGlobalSurtidas,
      partidasEmbarcadas: partidasGlobalEmbarcadas,
      avanceSurtido: `${(avanceGlobalSurtido / totalPedidos).toFixed(0)}%`,
      avanceEmbarque: `${(avanceGlobalEmbarque / totalPedidos).toFixed(0)}%`,
      avanceFinalizado: `${(avanceGlobalFinalizado / totalPedidos).toFixed(0)}%`,
    };

    // 6️⃣ Ordenar rutas
    const paqueteriasPrimero = ["C.R", "TRES GUERRAS", "PAQUETEXPRESS", "PITIC", "FLECHISA"];
    resumenPorRutas.sort((a, b) => {
      if (paqueteriasPrimero.includes(a.routeName) && !paqueteriasPrimero.includes(b.routeName)) return -1;
      if (!paqueteriasPrimero.includes(a.routeName) && paqueteriasPrimero.includes(b.routeName)) return 1;
      if (a.routeName.startsWith("R-") && b.routeName.startsWith("R-")) {
        const numA = parseInt(a.routeName.replace(/\D/g, ""), 10);
        const numB = parseInt(b.routeName.replace(/\D/g, ""), 10);
        return numA - numB;
      }
      return a.routeName.localeCompare(b.routeName);
    });

    const resultadoFinal = [...resumenPorRutas, resumenGlobal];

    const resumenEstados = {
      totalPedidosPlan: rows.length,
      pedidosNoAsignados,
      pedidosEnSurtido,
      pedidosEnEmbarque,
      pedidosFinalizados,
    };

    res.json({ rutas: resultadoFinal, estados: resumenEstados });
  } catch (error) {
    console.error("Error en PlanDelDia:", error.message);
    res.status(500).json({ message: "Error al obtener plan del día", error: error.message });
  }
};


const DetallePlan = async (req, res) => {
  try {
    const { fecha } = req.query;
    const getFormattedDate = (date = new Date()) =>
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Mexico_City",
      }).format(date);

    const selectedDate = fecha || getFormattedDate();

    // 1️⃣ Pedidos del día en paquetería
    const [rows] = await pool.query(
      `SELECT 
        p.routeName,
        p.\`NO ORDEN\` AS no_orden,
        p.tipo_original,
        p.NO_FACTURA AS factura,
        p.\`NOMBRE DEL CLIENTE\` AS nombre_cliente,
        p.TOTAL,
        p.PARTIDAS,
        p.PIEZAS
      FROM paqueteria p
      WHERE DATE(p.created_at) = ?`,
      [selectedDate]
    );

    if (rows.length === 0) return res.json([]);

    const pedidosIds = rows.map((r) => String(r.no_orden).trim());
    if (pedidosIds.length === 0) return res.json([]);

    // 2️⃣ Consultas de tablas auxiliares (solo por pedido)
   const [surtidos] = await pool.query(`
  SELECT pedido, SUM(cant_surti) AS surtido, SUM(cantidad) AS total
  FROM pedido_surtido
  WHERE pedido IN (?)
  GROUP BY pedido
`, [pedidosIds]);

const [embarques] = await pool.query(`
  SELECT 
    pedido,
    COUNT(*) AS total_partidas,
    SUM(
      CASE 
        WHEN (v_pz > 0 OR v_pq > 0 OR v_inner > 0 OR v_master > 0) THEN 1 
        ELSE 0 
      END
    ) AS partidas_embarcadas,
    MAX(id_usuario_paqueteria) AS id_usuario_paqueteria
  FROM pedido_embarque
  WHERE pedido IN (?)
  GROUP BY pedido
`, [pedidosIds]);

const [finalizados] = await pool.query(`
  SELECT pedido
  FROM pedido_finalizado
  WHERE pedido IN (?)
`, [pedidosIds]);

    
// 3️⃣ Estructuras rápidas de lookup
const surtidoMap = new Map(surtidos.map((s) => [String(s.pedido).trim(), s]));
const embarqueMap = new Map(embarques.map((e) => [String(e.pedido).trim(), e]));
const finalizadoSet = new Set(finalizados.map((f) => String(f.pedido).trim()));

// 4️⃣ Procesar pedidos
const pedidosConAvance = rows.map((row) => {
  const pedidoId = String(row.no_orden).trim();
  let estado_pedido = "Sin asignar";
  let tabla = "ninguna";
  let avanceSurtido = 0,
    avanceEmbarque = 0,
    avanceFinalizado = 0;

  // 🔹 FINALIZADO
  if (finalizadoSet.has(pedidoId)) {
    tabla = "pedido_finalizado";
    estado_pedido = "Finalizado";
    avanceSurtido = 100;
    avanceEmbarque = 100;
    avanceFinalizado = 100;
  }
  // 🔹 EMBARQUE
  else if (embarqueMap.has(pedidoId)) {
    const {
      total_partidas = 0,
      partidas_embarcadas = 0,
      id_usuario_paqueteria,
    } = embarqueMap.get(pedidoId) || {};

    tabla = "pedido_embarque";
    avanceSurtido = 100;
    avanceEmbarque =
      total_partidas > 0
        ? (partidas_embarcadas / total_partidas) * 100
        : 0;
    estado_pedido = id_usuario_paqueteria
      ? "Embarcando"
      : "Embarque";
  }
  // 🔹 SURTIDO
  else if (surtidoMap.has(pedidoId)) {
    const { surtido = 0, total = 0 } = surtidoMap.get(pedidoId) || {};
    tabla = "pedido_surtido";
    avanceSurtido = total > 0 ? (surtido / total) * 100 : 0;
    estado_pedido = "Surtiendo";
  }

  return {
    routeName: row.routeName || "Sin Ruta",
    no_orden: row.no_orden,
    tipo_original: row.tipo_original,
    nombre_cliente: row.nombre_cliente,
    factura: row.factura,
    TOTAL: row.TOTAL,
    PARTIDAS: row.PARTIDAS,
    PIEZAS: row.PIEZAS,
    avanceSurtido: `${avanceSurtido.toFixed(0)}%`,
    avanceEmbarque: `${avanceEmbarque.toFixed(0)}%`,
    avanceFinalizado: `${avanceFinalizado.toFixed(0)}%`,
    estado_pedido,
    tabla,
  };
});
    // 5️⃣ Agrupar por ruta
    const grouped = pedidosConAvance.reduce((acc, row) => {
      const key = row.routeName;
      if (!acc[key]) {
        acc[key] = {
          routeName: key,
          pedidos: [],
          totalClientes: new Set(),
          totalPartidas: 0,
          totalPiezas: 0,
          totalTotal: 0,
        };
      }
      acc[key].pedidos.push(row);
      acc[key].totalClientes.add(row.nombre_cliente);
      acc[key].totalPartidas += Number(row.PARTIDAS) || 0;
      acc[key].totalPiezas += Number(row.PIEZAS) || 0;
      acc[key].totalTotal += Number(row.TOTAL) || 0;
      return acc;
    }, {});

    // 6️⃣ Convertir a array
    const groupedArray = Object.values(grouped).map((ruta) => ({
      routeName: ruta.routeName,
      totalClientes: ruta.totalClientes.size,
      totalPartidas: ruta.totalPartidas,
      totalPiezas: ruta.totalPiezas,
      total: ruta.totalTotal.toFixed(2),
      pedidos: ruta.pedidos,
    }));

    // Ordenar rutas
    groupedArray.sort((a, b) => {
      const numA = parseInt(a.routeName.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.routeName.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    res.json(groupedArray);
  } catch (error) {
    console.error("Error en DetallePlan:", error.message);
    res.status(500).json({ message: "Error al obtener detalle plan", error: error.message });
  }
};





const FaltantesPlan = async (req, res) => {
  try {
    const { dias = 15 } = req.query;

    // 1️⃣ Base principal: pedidos con ruta (paquetería)
    const [rows] = await pool.query(`
      SELECT 
        DATE(p.created_at) AS fecha,
        p.\`NO ORDEN\` AS no_orden,
        p.tipo_original AS tipo,
        p.TOTAL
      FROM paqueteria p
      WHERE DATE(p.created_at) >= CURDATE() - INTERVAL ? DAY
      ORDER BY fecha DESC
    `, [Number(dias)]);

    if (rows.length === 0) return res.json([]);

    // 2️⃣ Indexar paquetería por fecha
    const pedidosPorFecha = {};
    for (const row of rows) {
      const fecha = row.fecha.toISOString().split("T")[0];
      const totalNum = parseFloat(String(row.TOTAL).replace(/[^\d.-]/g, "")) || 0;
      if (!pedidosPorFecha[fecha]) {
        pedidosPorFecha[fecha] = { pedidos: [], totalPorPedido: {}, sinRuta: [] };
      }
      const pedido = String(row.no_orden).trim();
      const tipo = String(row.tipo).trim();
      const key = `${pedido}_${tipo}`;
      pedidosPorFecha[fecha].pedidos.push(key);
      pedidosPorFecha[fecha].totalPorPedido[key] = totalNum;
    }

    // 3️⃣ Buscar pedidos sin ruta (solo si su fecha ya existe en paquetería)
    const [sinRutaRows] = await pool.query(`
      SELECT 
        DATE(p.fecha_emision) AS fecha,
        p.no_orden,
        p.tipo,
        p.total
      FROM pedidos p
      WHERE DATE(p.fecha_emision) >= CURDATE() - INTERVAL ? DAY
        AND NOT EXISTS (
          SELECT 1 
          FROM paqueteria pq
          WHERE pq.\`NO ORDEN\` = p.no_orden
            AND pq.tipo_original = p.tipo
        )
    `, [Number(dias)]);

    for (const row of sinRutaRows) {
      const fecha = row.fecha?.toISOString().split("T")[0];
      if (!fecha || !pedidosPorFecha[fecha]) continue; // ❗ Solo agregamos si la fecha ya existe
      pedidosPorFecha[fecha].sinRuta.push({
        id: `${row.no_orden}_${row.tipo}`,
        total: parseFloat(row.total) || 0,
      });
    }

    const resultado = [];

    // 4️⃣ Calcular totales como antes, pero con campo adicional de sin ruta
    for (const fecha of Object.keys(pedidosPorFecha)) {
      const pedidosIds = pedidosPorFecha[fecha].pedidos;
      const totalPorPedido = pedidosPorFecha[fecha].totalPorPedido;
      const sinRutaPedidos = pedidosPorFecha[fecha].sinRuta || [];

      if (pedidosIds.length === 0 && sinRutaPedidos.length === 0) continue;

      const [surtidos] = await pool.query(`SELECT pedido FROM pedido_surtido WHERE pedido IN (?)`, [pedidosIds.map(p => p.split("_")[0])]);
      const [embarques] = await pool.query(`SELECT pedido FROM pedido_embarque WHERE pedido IN (?)`, [pedidosIds.map(p => p.split("_")[0])]);
      const [finalizados] = await pool.query(`SELECT pedido FROM pedido_finalizado WHERE pedido IN (?)`, [pedidosIds.map(p => p.split("_")[0])]);

      const surtidoSet = new Set(surtidos.map(s => String(s.pedido).trim()));
      const embarqueSet = new Set(embarques.map(e => String(e.pedido).trim()));
      const finalizadoSet = new Set(finalizados.map(f => String(f.pedido).trim()));

      let pedidosNoAsignados = 0,
        pedidosEnSurtido = 0,
        pedidosEnEmbarque = 0,
        pedidosFinalizados = 0;

      let totalNoAsignados = 0,
        totalEnSurtido = 0,
        totalEnEmbarque = 0,
        totalFinalizados = 0;

      for (const key of pedidosIds) {
        const [id] = key.split("_");
        const totalPedido = totalPorPedido[key] || 0;
        if (finalizadoSet.has(id)) {
          pedidosFinalizados++;
          totalFinalizados += totalPedido;
        } else if (embarqueSet.has(id)) {
          pedidosEnEmbarque++;
          totalEnEmbarque += totalPedido;
        } else if (surtidoSet.has(id)) {
          pedidosEnSurtido++;
          totalEnSurtido += totalPedido;
        } else {
          pedidosNoAsignados++;
          totalNoAsignados += totalPedido;
        }
      }

      const totalSinRuta = sinRutaPedidos.reduce((acc, r) => acc + r.total, 0);
      const pedidosSinRuta = sinRutaPedidos.length;

      const totalDia =
        totalNoAsignados + totalEnSurtido + totalEnEmbarque + totalFinalizados;

      // ❌ Excluir días cerrados si no hay sin ruta
      if (
        pedidosNoAsignados === 0 &&
        pedidosEnSurtido === 0 &&
        pedidosEnEmbarque === 0 &&
        pedidosFinalizados > 0 &&
        pedidosSinRuta === 0
      ) continue;

      resultado.push({
        fecha,
        totalPedidos: pedidosIds.length,
        pedidosNoAsignados,
        pedidosEnSurtido,
        pedidosEnEmbarque,
        pedidosFinalizados,
        pedidosSinRuta,
        totalNoAsignados: Number(totalNoAsignados.toFixed(2)),
        totalEnSurtido: Number(totalEnSurtido.toFixed(2)),
        totalEnEmbarque: Number(totalEnEmbarque.toFixed(2)),
        totalFinalizados: Number(totalFinalizados.toFixed(2)),
        totalSinRuta: Number(totalSinRuta.toFixed(2)),
        totalDia: Number(totalDia.toFixed(2)), // mismo comportamiento que antes
      });
    }

    res.json(resultado.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
  } catch (error) {
    console.error("❌ Error en FaltantesPlan:", error.message);
    res.status(500).json({
      message: "Error al obtener faltantes de plan",
      error: error.message,
    });
  }
};




module.exports = { PlanDelDia, DetallePlan, FaltantesPlan };

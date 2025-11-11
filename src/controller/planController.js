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

const DetallePlan = async (req, res) => {
  try {
    const { fecha } = req.query;

    const getFormattedDate = (date = new Date()) =>
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Mexico_City",
      }).format(date);

    const selectedDate = fecha || getFormattedDate();

    // 1️⃣ Pedidos del día desde paquetería
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

    // 2️⃣ Consultas de apoyo
    const [surtidos] = await pool.query(
      `
      SELECT 
        pedido, 
        SUM(cant_surti) AS surtido, 
        SUM(cantidad) AS total
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
        GREATEST(COUNT(*), 1) AS total_partidas,
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
      `,
      [pedidosIds]
    );

    const [finalizados] = await pool.query(
      `
      SELECT pedido
      FROM pedido_finalizado
      WHERE pedido IN (?)
      `,
      [pedidosIds]
    );

    // 3️⃣ Mapas rápidos para acceso
    const surtidoMap = new Map(
      surtidos.map((s) => [String(s.pedido).trim(), s])
    );
    const embarqueMap = new Map(
      embarques.map((e) => [String(e.pedido).trim(), e])
    );
    const finalizadoSet = new Set(
      finalizados.map((f) => String(f.pedido).trim())
    );

    // 4️⃣ Procesar pedidos uno a uno
    const pedidosConAvance = rows.map((row) => {
      const pedidoId = String(row.no_orden).trim();

      let estado_pedido = "Sin asignar";
      let tabla = "ninguna";
      let avanceSurtido = 0;
      let avanceEmbarque = 0;
      let avanceFinalizado = 0;

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
          total_partidas = 1,
          partidas_embarcadas = 0,
          id_usuario_paqueteria,
        } = embarqueMap.get(pedidoId) || {};

        tabla = "pedido_embarque";
        avanceSurtido = 100;
        avanceEmbarque =
          total_partidas > 0
            ? (partidas_embarcadas / total_partidas) * 100
            : 0;
        avanceFinalizado = 0;

        estado_pedido = id_usuario_paqueteria
          ? "Embarcando"
          : "Embarque";
      }

      // 🔹 SURTIDO
      else if (surtidoMap.has(pedidoId)) {
        const { surtido = 0, total = 0 } = surtidoMap.get(pedidoId) || {};
        tabla = "pedido_surtido";
        avanceSurtido = total > 0 ? (surtido / total) * 100 : 0;
        avanceEmbarque = 0;
        avanceFinalizado = 0;
        estado_pedido = "Surtiendo";
      }

      // 🔹 Pedido sin tabla
      else {
        tabla = "ninguna";
        estado_pedido = "Sin asignar";
        avanceSurtido = 0;
        avanceEmbarque = 0;
        avanceFinalizado = 0;
      }

      return {
        routeName: row.routeName || "Sin Ruta",
        no_orden: row.no_orden,
        tipo_original: row.tipo_original,
        nombre_cliente: row.nombre_cliente,
        factura: row.factura,
        TOTAL: Number(row.TOTAL) || 0,
        PARTIDAS: Number(row.PARTIDAS) || 0,
        PIEZAS: Number(row.PIEZAS) || 0,
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
          partidasSurtidas: 0,
          partidasEmbarcadas: 0,
          totalPiezas: 0,
          totalTotal: 0,
        };
      }

      acc[key].pedidos.push(row);
      acc[key].totalClientes.add(row.nombre_cliente);
      acc[key].totalPartidas += Number(row.PARTIDAS) || 0;
      acc[key].totalPiezas += Number(row.PIEZAS) || 0;
      acc[key].totalTotal += Number(row.TOTAL) || 0;

      // 👇 Nuevos acumuladores
      if (
        row.tabla === "pedido_surtido" ||
        row.estado_pedido === "Surtiendo" ||
        row.avanceSurtido === "100%"
      ) {
        acc[key].partidasSurtidas += Number(row.PARTIDAS) || 0;
      }

      if (
        row.tabla === "pedido_embarque" ||
        row.estado_pedido.includes("Embarque") ||
        row.avanceEmbarque === "100%"
      ) {
        acc[key].partidasEmbarcadas += Number(row.PARTIDAS) || 0;
      }

      return acc;
    }, {});

    // 6️⃣ Convertir a arreglo final
    const groupedArray = Object.values(grouped).map((ruta) => ({
      routeName: ruta.routeName,
      totalClientes: ruta.totalClientes.size,
      totalPartidas: ruta.totalPartidas,
      partidasSurtidas: ruta.partidasSurtidas,
      partidasEmbarcadas: ruta.partidasEmbarcadas,
      totalPiezas: ruta.totalPiezas,
      total: ruta.totalTotal.toFixed(2),
      pedidos: ruta.pedidos,
    }));

    // 7️⃣ Ordenar rutas numéricamente
    groupedArray.sort((a, b) => {
      const numA = parseInt(a.routeName.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.routeName.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    // 8️⃣ Respuesta final
    res.json(groupedArray);
  } catch (error) {
    console.error("❌ Error en DetallePlan:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener detalle plan", error: error.message });
  }
};


const FaltantesPlan = async (req, res) => {
  try {
    const { dias = 15 } = req.query;

    // Pedidos de paquetería (rutas asignadas)
    const [paqRows] = await pool.query(
      `
      SELECT 
        DATE(p.created_at) AS fecha,
        p.\`NO ORDEN\` AS no_orden,
        p.tipo_original,
        p.TOTAL,
        p.routeName
      FROM paqueteria p
      WHERE DATE(p.created_at) >= CURDATE() - INTERVAL ? DAY
      ORDER BY fecha DESC
      `,
      [Number(dias)]
    );

    // Agrupar los pedidos por fecha
    const pedidosPorFecha = {};
    for (const row of paqRows) {
      const fecha = row.fecha.toISOString().split("T")[0];
      const totalNum = parseFloat(String(row.TOTAL).replace(/[^\d.-]/g, "")) || 0;
      
      if (!pedidosPorFecha[fecha]) {
        pedidosPorFecha[fecha] = { pedidos: [], totalPorPedido: {}, routeByPedido: {} };
      }

      const pedido = String(row.no_orden).trim();
      pedidosPorFecha[fecha].pedidos.push(pedido);
      pedidosPorFecha[fecha].totalPorPedido[pedido] = totalNum;
      pedidosPorFecha[fecha].routeByPedido[pedido] = row.routeName || "";
    }

    const resultado = [];

    // Procesar día por día
    for (const fecha of Object.keys(pedidosPorFecha)) {
      const pedidosIds = pedidosPorFecha[fecha].pedidos;
      const totalPorPedido = pedidosPorFecha[fecha].totalPorPedido;
      const routeByPedido = pedidosPorFecha[fecha].routeByPedido;

      if (pedidosIds.length === 0) continue;

      // Consultar estados
      const [surtidos] = await pool.query(
        `SELECT pedido FROM pedido_surtido WHERE pedido IN (?)`,
        [pedidosIds]
      );
      const [embarques] = await pool.query(
        `SELECT pedido FROM pedido_embarque WHERE pedido IN (?)`,
        [pedidosIds]
      );
      const [finalizados] = await pool.query(
        `SELECT pedido FROM pedido_finalizado WHERE pedido IN (?)`,
        [pedidosIds]
      );

      const surtidoSet = new Set(surtidos.map((s) => String(s.pedido).trim()));
      const embarqueSet = new Set(embarques.map((e) => String(e.pedido).trim()));
      const finalizadoSet = new Set(finalizados.map((f) => String(f.pedido).trim()));

      let pedidosNoAsignados = 0,
        pedidosEnSurtido = 0,
        pedidosEnEmbarque = 0,
        pedidosFinalizados = 0;

      let totalNoAsignados = 0,
        totalEnSurtido = 0,
        totalEnEmbarque = 0,
        totalFinalizados = 0;

      // Clasificar estatus
      for (const id of pedidosIds) {
        const totalPedido = totalPorPedido[id] || 0;
        const routeName = routeByPedido[id] || "";
        const esRutaManual = routeName.toUpperCase().startsWith("R-"); // <<--- Ignorar rutas R-

        if (finalizadoSet.has(id)) {
          pedidosFinalizados++;
          totalFinalizados += totalPedido;

        } else if (embarqueSet.has(id)) {
          pedidosEnEmbarque++;
          totalEnEmbarque += totalPedido;

        } else if (surtidoSet.has(id)) {
          pedidosEnSurtido++;
          totalEnSurtido += totalPedido;

        } else if (!esRutaManual) { 
          pedidosNoAsignados++;
          totalNoAsignados += totalPedido;
        }
      }

      const totalDia =
        totalNoAsignados + totalEnSurtido + totalEnEmbarque + totalFinalizados;

      // Consulta SQL de pedidos sin ruta
      const [sinRutaRows] = await pool.query(
        `
        SELECT 
          p.id,
          p.no_orden,
          p.tipo,
          p.num_cliente,
          p.nombre_cliente,
          p.municipio,
          p.estado,
          p.total,
          p.partidas,
          p.piezas,
          p.fecha_emision,
          p.observaciones
        FROM pedidos p
        LEFT JOIN paqueteria pq 
          ON CAST(p.no_orden AS UNSIGNED) = pq.\`NO ORDEN\`
          AND TRIM(UPPER(p.tipo)) = TRIM(UPPER(pq.tipo_original))
        WHERE pq.\`NO ORDEN\` IS NULL
          AND p.fecha_emision = ?
        ORDER BY p.fecha_emision DESC
        `,
        [fecha]
      );

      const pedidosSinRuta = sinRutaRows.length;
      const totalSinRuta = sinRutaRows.reduce(
        (acc, p) => acc + (Number(p.total) || 0),
        0
      );

      // Filtrar días sin cifras útiles
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
        totalDia: Number(totalDia.toFixed(2)),
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en FaltantesPlan:", error.message);
    res.status(500).json({
      message: "Error al obtener faltantes de plan",
      error: error.message,
    });
  }
};


const detalleSinRuta = async (req, res) => {
  try {
    const { fecha } = req.query;

    let query = `
      SELECT 
        p.no_orden,
        p.tipo,
        p.num_cliente,
        p.nombre_cliente,
        p.municipio,
        p.estado,
        p.total,
        p.partidas,
        p.piezas,
        DATE_FORMAT(p.fecha_emision, '%Y-%m-%d') AS fecha_emision,  -- 👈 solo fecha
        p.observaciones
      FROM pedidos p
      LEFT JOIN paqueteria pq 
        ON CAST(p.no_orden AS UNSIGNED) = pq.\`NO ORDEN\`
        AND TRIM(UPPER(p.tipo)) = TRIM(UPPER(pq.tipo_original))
      WHERE pq.\`NO ORDEN\` IS NULL
    `;

    const params = [];

    if (fecha) {
      query += ` AND DATE(p.fecha_emision) = ? `;
      params.push(fecha);
    } else {
      query += `
        AND DATE(p.fecha_emision) BETWEEN CURDATE() - INTERVAL 20 DAY AND CURDATE()
      `;
    }

    query += ` ORDER BY p.fecha_emision ASC; `;

    const [rows] = await pool.query(query, params);

    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    const agrupadosPorFecha = rows.reduce((acc, pedido) => {
      const fechaKey = pedido.fecha_emision || "Sin fecha";

      if (!acc[fechaKey]) {
        acc[fechaKey] = {
          fecha: fechaKey,
          totalPedidos: 0,
          totalMonto: 0,
          pedidos: [],
        };
      }

      acc[fechaKey].pedidos.push(pedido);
      acc[fechaKey].totalPedidos += 1;
      acc[fechaKey].totalMonto += parseFloat(pedido.total) || 0;

      return acc;
    }, {});

    const resultado = Object.values(agrupadosPorFecha).sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    res.json({
      rango: fecha ? fecha : "Últimos 20 días",
      totalDias: resultado.length,
      dias: resultado,
    });
  } catch (error) {
    console.error("❌ Error en detalleSinRuta:", error.message);
    res.status(500).json({
      message: "Error al obtener detalle de pedidos sin ruta",
      error: error.message,
    });
  }
};


module.exports = { PlanDelDia, DetallePlan, FaltantesPlan, detalleSinRuta };

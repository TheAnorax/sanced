// src/controller/rhController.js  (CommonJS)

const multer = require('multer');
const XLSX = require('xlsx');
const pool = require('../config/database');

/* =========================
   UTILIDADES
   ========================= */
function toMySQLDateTime(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') { // serial Excel
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  const s = String(v).trim();
  const d = new Date(s.includes('T') || s.includes(':') ? s : (s + ' 00:00:00'));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function toIntOrNull(n) {
  if (n == null || n === '') return null;
  const v = parseInt(String(n).replace(/[^0-9\-]/g, ''), 10);
  return Number.isNaN(v) ? null : v;
}

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

function pickAlias(row, aliases = []) {
  const map = new Map(Object.keys(row || {}).map(k => [norm(k), k]));
  for (const a of aliases) {
    const real = map.get(norm(a));
    if (real && row[real] != null && String(row[real]).trim() !== '') return row[real];
  }
  return '';
}

// EXTRAE(D,4,4) sobre “2º nº artículo”
function codigoFromSegundoArticulo(val) {
  if (!val) return null;
  const s = String(val);
  const sub = s.length >= 7 ? s.substring(3, 7) : s.replace(/\D+/g, '').substring(0, 4);
  const n = toIntOrNull(sub);
  if (n != null) return n;
  const m = s.match(/(\d{4})/);
  return m ? toIntOrNull(m[1]) : null;
}

function deriveCodigo(obj) {
  const direct = pickAlias(obj, ['CÓDIGO', 'CODIGO', 'Codigo', 'codigo']);
  if (direct) return toIntOrNull(direct);
  const art = pickAlias(obj, [
    '2º nº artículo', '2° nº artículo', '2º n° artículo', '2° n° artículo',
    '2o nº artículo', '2o n° artículo', '2º nº articulo', '2o n° articulo'
  ]);
  const fromArt = codigoFromSegundoArticulo(art);
  return fromArt != null ? fromArt : null;
}

function guessHeaderRow(allRows) {
  const EXPECTED = [
    'código', 'codigo', 'descripcion', 'descripción', 'clave', 'um', '_pz', 'pz',
    'cantidad', 'almacen', 'almacén', 'almacen_envio', 'fecha', 'solicitud',
    'dia', 'envio', 'llegada', 'estimado', 'tiempo', '2º nº artículo', '2° nº artículo',
    'numero orden', 'número orden', 'tp ord', 'venta'
  ];
  let bestIdx = 0, bestScore = -1;
  for (let i = 0; i < Math.min(25, allRows.length); i++) {
    const row = (allRows[i] || []).map(x => String(x ?? '').trim());
    const nonEmpty = row.filter(Boolean).length;
    const matches = row.filter(c => EXPECTED.some(k => c.toLowerCase().includes(k))).length;
    const score = nonEmpty + matches * 3;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
}

/* =========================
   CRUD INSUMOS RH
   ========================= */
const getInsumosRH = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM insumosrh');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los insumos', error: error.message });
  }
};

const createInsumo = async (req, res) => {
  try {
    const { Codigo, Descripcion, Cantidad, Talla, Categoria, UM } = req.body;
    await pool.query('INSERT INTO insumosrh SET ?', { Codigo, Descripcion, Cantidad, Talla, Categoria, UM });
    res.status(201).json({ message: 'Insumo creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el insumo', error: error.message });
  }
};

const updateInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { Codigo, Descripcion, Cantidad, Talla, Categoria, UM } = req.body;
    await pool.query('UPDATE insumosrh SET ? WHERE Codigo = ?', [{ Codigo, Descripcion, Cantidad, Talla, Categoria, UM }, id]);
    res.status(200).json({ message: 'Insumo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el insumo', error: error.message });
  }
};

const deleteInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM insumosrh WHERE Codigo = ?', [id]);
    res.status(200).json({ message: 'Insumo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el insumo', error: error.message });
  }
};

/* =========================
   PRODUCTO (autocompletar)
   ========================= */
const buscarProducto = async (req, res) => {
  const { codigo } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT codigo_pro AS codigo, des, um, _pz, clave
         FROM productos
        WHERE codigo_pro = ?`,
      [codigo]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el producto' });
  }
};

/* =========================
   CREAR TRASPASO (manual)
   ========================= */
const createTraspaso = async (req, res) => {
  try {
    const body = req.body || {};
    let {
      Codigo, Descripcion, Clave, um, _pz,
      Cantidad, dia_envio, almacen_envio, tiempo_llegada_estimado, lote_serie
    } = body;

    const No_Orden = pickAlias(body, ['No_Orden', 'NO_Orden', 'Número orden', 'Numero orden', 'No Orden']) || null;
    const tipo_orden = pickAlias(body, ['tipo_orden', 'Tp ord', 'TP ORD', 'Tipo ord']) || null;

    if (Codigo == null || Codigo === '') {
      return res.status(400).json({ message: 'Falta Codigo.' });
    }
    if (!Descripcion || Cantidad == null || !dia_envio) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios: Descripcion, Cantidad, dia_envio'
      });
    }

    const CantidadN = toIntOrNull(Cantidad) ?? 0;
    const _pzN = toIntOrNull(_pz);
    const envio = toMySQLDateTime(dia_envio);
    const llegada = toMySQLDateTime(tiempo_llegada_estimado) || envio;

    await pool.query(
      `INSERT INTO mandar_traspaso
       (No_Orden, tipo_orden, Codigo, Descripcion, Clave, um, _pz, Cantidad, dia_envio, almacen_envio, tiempo_llegada_estimado, lote_serie)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        No_Orden,
        tipo_orden,
        toIntOrNull(Codigo),
        String(Descripcion).trim(),
        Clave || null,
        um || null,
        _pzN,
        CantidadN,
        envio,
        almacen_envio || null,
        llegada,
        lote_serie || null, // 👈 YA SOPORTA LOTE
      ]
    );

    res.status(201).json({ message: 'Registro de traspaso creado correctamente' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El Código ya existe. No se puede duplicar.' });
    }
    res.status(500).json({ message: 'Error al crear el registro de traspaso', error: error.message });
  }
};


/* =========================
   LISTAR TRASPASOS
   ========================= */
const Traspasos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mandar_traspaso');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los traspasos', error: error.message });
  }
};

/* =========================
   EXCEL: PREVIEW + IMPORT
   ========================= */

// multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const importTraspasosExcelMiddleware = upload.single('archivoExcel');

/* -------- PREVIEW -------- */
const excelToJson = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió archivo Excel.' });

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!allRows.length) return res.json({ headers: [], data: [] });

    const hIdx = guessHeaderRow(allRows);
    let headers = (allRows[hIdx] || []).map((h, i) => String(h ?? '').trim() || `Col${i + 1}`);
    const dataRows = allRows.slice(hIdx + 1).filter(r => (r || []).some(c => String(c ?? '').trim() !== ''));

    const data = dataRows.map(row =>
      headers.reduce((o, k, i) => { o[k] = row[i] ?? ''; return o; }, {})
    );

    // Garantizar columna CÓDIGO y ponerla al frente
    const hasCodigo = headers.some(h => ['codigo', 'código'].includes(norm(h)));
    if (!hasCodigo) {
      headers = ['CÓDIGO', ...headers];
      for (const obj of data) obj['CÓDIGO'] = deriveCodigo(obj) ?? '';
    } else {
      for (const obj of data) {
        const cur = pickAlias(obj, ['CÓDIGO', 'CODIGO', 'Codigo', 'codigo']);
        if (!cur) {
          const d = deriveCodigo(obj);
          const key = ['CÓDIGO', 'CODIGO', 'Codigo', 'codigo'].find(k => Object.prototype.hasOwnProperty.call(obj, k)) || 'CÓDIGO';
          obj[key] = d ?? '';
        }
      }
      const canonical = ['CÓDIGO', 'CODIGO', 'Codigo', 'codigo'].find(c => headers.includes(c));
      if (canonical) headers = [canonical, ...headers.filter(h => h !== canonical)];
    }

    return res.json({ headers, data });
  } catch (error) {
    console.error('Error procesando el Excel:', error);
    res.status(500).json({ error: 'No se pudo procesar el archivo Excel.' });
  }
};

/* -------- IMPORT -------- */
// -------- IMPORT (con lookup a productos) --------
const importTraspasosExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, msg: 'No se adjuntó archivo.' });

    const { tiempoLlegadaLote } = req.body;
    const llegadaLote = toMySQLDateTime(tiempoLlegadaLote);

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const parsed = [];
    const codigos = new Set();

    for (const r of rows) {
      const Codigo = deriveCodigo(r);

      const No_Orden = pickAlias(r, ['Número orden', 'Numero orden', 'No Orden', 'No_Orden', 'NO_Orden']) || null;
      const tipo_orden = pickAlias(r, ['Tp ord', 'TP ORD', 'tipo_orden', 'Tipo ord']) || null;

      const almacen_envio =
        pickAlias(r, ['Venta', 'venta']) ||
        pickAlias(r, ['almacen_envio', 'almacén', 'almacen']) || null;

      const dia_envio = toMySQLDateTime(
        pickAlias(r, ['Fecha solicitud', 'FECHA SOLICITUD', 'fecha solicitud', 'dia_envio', 'DIA_ENVIO'])
      );

      const tiempo_llegada_estimado =
        llegadaLote ||
        toMySQLDateTime(pickAlias(r, [
          'tiempo_llegada_estimado', 'LLEGADA ESTIMADA', 'TIEMPO LLEGADA', 'Llegada Estimada'
        ])) ||
        dia_envio;

      const articulo2 = pickAlias(r, [
        '2º nº artículo', '2° nº artículo', '2º n° artículo', '2º nº articulo'
      ]) || null;

      // 🔥 NUEVO: leer lote / serie
      const lote_serie = pickAlias(r, [
        'Nº lote /serie',
        'Nº lote / serie',
        'N° lote /serie',
        'N° lote / serie',
        'No lote / serie',
        'No. lote / serie',
        'Lote',
        'lote',
        'Serie',
        'serie',
        'lote_serie',
        'lote serie'
      ]) || null;


      const DescripcionExcel = pickAlias(r, ['Descripcion', 'DESCRIPCION', 'descripción', 'descripcion']);
      const ClaveExcel = pickAlias(r, ['Clave', 'CLAVE', 'clave']);
      const umExcel = pickAlias(r, ['um', 'UM', 'Um']);
      const pzExcel = toIntOrNull(pickAlias(r, ['_pz', 'PZ', 'pz']));
      const Cantidad = toIntOrNull(pickAlias(r, ['Cantidad', 'CANTIDAD', 'cantidad'])) ?? 0;

      parsed.push({
        raw: r,
        Codigo,
        No_Orden,
        tipo_orden,
        almacen_envio,
        dia_envio,
        tiempo_llegada_estimado,
        DescripcionExcel,
        ClaveExcel,
        umExcel,
        pzExcel,
        Cantidad,
        articulo2,
        lote_serie, // 👈 AQUI YA VIAJA
      });

      if (Codigo != null) codigos.add(Number(Codigo));
    }

    // Lookup a productos
    let productoByCod = new Map();
    if (codigos.size) {
      const uniq = [...codigos];
      const placeholders = uniq.map(() => '?').join(',');
      const [prodRows] = await pool.query(
        `SELECT codigo_pro AS codigo, des, clave, um, _pz
         FROM productos
         WHERE codigo_pro IN (${placeholders})`,
        uniq
      );
      productoByCod = new Map(prodRows.map(p => [Number(p.codigo), p]));
    }

    let inserted = 0, skipped = 0;
    const errors = [];

    for (const r of parsed) {
      try {
        const Codigo = toIntOrNull(r.Codigo);
        if (Codigo == null) { skipped++; errors.push({ row: r.raw, reason: 'Sin Código válido' }); continue; }
        if (!r.dia_envio) { skipped++; errors.push({ row: r.raw, reason: 'Falta dia_envio (Fecha solicitud)' }); continue; }

        const prod = productoByCod.get(Codigo) || null;

        const Descripcion =
          (r.DescripcionExcel && String(r.DescripcionExcel).trim()) ||
          (prod && prod.des) ||
          'SIN DESCRIPCION';

        const Clave = r.ClaveExcel || (prod && prod.clave) || r.articulo2 || null;
        const um = r.umExcel || (prod && prod.um) || null;
        const _pz = (r.pzExcel != null ? r.pzExcel : (prod ? prod._pz : null));

        await pool.query(
          `INSERT INTO mandar_traspaso
           (No_Orden, tipo_orden, Codigo, Descripcion, Clave, um, _pz, Cantidad, dia_envio, almacen_envio, tiempo_llegada_estimado, lote_serie)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.No_Orden,
            r.tipo_orden,
            Codigo,
            Descripcion,
            Clave,
            um,
            _pz,
            r.Cantidad,
            r.dia_envio,
            r.almacen_envio,
            r.tiempo_llegada_estimado,
            r.lote_serie, // 👈 SE INSERTA AQUÍ
          ]
        );

        inserted++;
      } catch (e) {
        skipped++;
        errors.push({ row: r.raw, reason: e.message });
      }
    }

    return res.json({ ok: true, inserted, skipped, errors });

  } catch (err) {
    console.error('importTraspasosExcel error:', err);
    return res.status(500).json({ ok: false, msg: 'Error importando Excel', error: err.message });
  }
};


/* =========================
   RH CEDIS
   ========================= */
/* =========================
   PRODUCTIVIDAD POR ÁREA
   ========================= */

// helpers simples para fechas
function isValidDateYYYYMMDD(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
}

function addOneDayYYYYMMDD(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * GET /api/RH/productividad?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
 * Regresa productividad para: SURTIDO, PAQUETERIA, EMBARQUES
 */
const getProductividadAreas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!isValidDateYYYYMMDD(fecha_inicio) || !isValidDateYYYYMMDD(fecha_fin)) {
      return res.status(400).json({
        ok: false,
        message: "Parámetros inválidos. Usa fecha_inicio y fecha_fin con formato YYYY-MM-DD",
      });
    }

    if (fecha_inicio > fecha_fin) {
      return res.status(400).json({
        ok: false,
        message: "fecha_inicio no puede ser mayor que fecha_fin",
      });
    }

    // Rango: [inicio 00:00:00, fin+1día 00:00:00)
    const start = `${fecha_inicio} 00:00:00`;
    const end = `${addOneDayYYYYMMDD(fecha_fin)} 00:00:00`;

    /* =========================
       1) SURTIDO (resumen)
       ========================= */
    const querySurtido = `
      SELECT 
        DATE(resumen.inicio_surtido) AS fecha,
        resumen.id_usuario_surtido AS id_usuario,
        u.name AS nombre,
        u.role,
        COUNT(DISTINCT resumen.id_pedi) AS codigos,
        SUM(resumen.cant_surti) AS piezas,
        COUNT(DISTINCT resumen.pedido) AS pedidos,
        ROUND(
          SUM(TIMESTAMPDIFF(MINUTE, resumen.inicio_surtido, resumen.fin_surtido)) / 60,
          2
        ) AS horas
      FROM (
        SELECT id_pedi, pedido, cant_surti, inicio_surtido, fin_surtido, id_usuario_surtido
        FROM pedido_surtido
        WHERE cant_surti > 0
          AND id_usuario_surtido IS NOT NULL
          AND inicio_surtido >= ?
          AND inicio_surtido < ?

        UNION ALL

        SELECT id_pedi, pedido, cant_surti, inicio_surtido, fin_surtido, id_usuario_surtido
        FROM pedido_embarque
        WHERE cant_surti > 0
          AND id_usuario_surtido IS NOT NULL
          AND inicio_surtido >= ?
          AND inicio_surtido < ?

        UNION ALL

        SELECT id_pedi, pedido, cant_surti, inicio_surtido, fin_surtido, id_usuario_surtido
        FROM pedido_finalizado
        WHERE cant_surti > 0
          AND id_usuario_surtido IS NOT NULL
          AND inicio_surtido >= ?
          AND inicio_surtido < ?
      ) resumen
      LEFT JOIN usuarios u ON u.id_usu = resumen.id_usuario_surtido
      GROUP BY fecha, id_usuario, nombre, u.role
      ORDER BY fecha DESC;
    `;

    const [surtido] = await pool.query(querySurtido, [start, end, start, end, start, end]);

    /* =========================
       2) PAQUETERÍA / EMBARQUES
       Base: agrupa primero por pedido
       ========================= */
    const queryBasePaqEmb = `
      SELECT 
        resumen.fecha,
        resumen.id_usuario,
        u.name AS nombre,
        u.role,

        COUNT(resumen.pedido) AS pedidos,
        SUM(resumen.codigos) AS codigos,
        SUM(resumen.piezas) AS piezas,
        SUM(resumen.horas) AS horas,

        COUNT(p.no_orden_int) AS pedidos_facturados,
        SUM(CAST(p.total_api AS DECIMAL(12,2))) AS monto_sin_iva,
        SUM(p.totalIva) AS monto_con_iva

      FROM (
        SELECT
          DATE(inicio_embarque) AS fecha,
          id_usuario_paqueteria AS id_usuario,
          pedido,

          COUNT(DISTINCT id_pedi) AS codigos,
          SUM(cant_surti) AS piezas,

          ROUND(
            SUM(TIMESTAMPDIFF(MINUTE, inicio_embarque, fin_embarque)) / 60,
            2
          ) AS horas

        FROM (
          SELECT id_pedi, pedido, cant_surti, inicio_embarque, fin_embarque, id_usuario_paqueteria
          FROM pedido_embarque
          WHERE cant_surti > 0
            AND id_usuario_paqueteria IS NOT NULL
            AND inicio_embarque >= ?
            AND inicio_embarque < ?

          UNION ALL

          SELECT id_pedi, pedido, cant_surti, inicio_embarque, fin_embarque, id_usuario_paqueteria
          FROM pedido_finalizado
          WHERE cant_surti > 0
            AND id_usuario_paqueteria IS NOT NULL
            AND inicio_embarque >= ?
            AND inicio_embarque < ?
        ) base
        GROUP BY DATE(inicio_embarque), id_usuario_paqueteria, pedido
      ) resumen

      INNER JOIN usuarios u ON u.id_usu = resumen.id_usuario
      LEFT JOIN paqueteria p ON p.no_orden_int = resumen.pedido

      WHERE u.role LIKE ?

      GROUP BY resumen.fecha, resumen.id_usuario, u.name, u.role
      ORDER BY resumen.fecha DESC;
    `;

    // paquetería (PQ%)
    const [paqueteria] = await pool.query(queryBasePaqEmb, [start, end, start, end, "PQ%"]);

    // embarques (EB%)
    const [embarques] = await pool.query(queryBasePaqEmb, [start, end, start, end, "EB%"]);

    return res.json({
      ok: true,
      rango: { fecha_inicio, fecha_fin },
      surtido,
      paqueteria,
      embarques,
    });

  } catch (error) {
    console.error("getProductividadAreas error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al generar productividad",
      error: error.message,
    });
  }
};

/* =========================
   EXPORTS
   ========================= */
 

module.exports = {
  // CRUD RH
  getInsumosRH,
  createInsumo,
  updateInsumo,
  deleteInsumo,

  // Traspasos
  buscarProducto,
  createTraspaso,
  Traspasos,

  // Excel 
  importTraspasosExcelMiddleware,
  excelToJson,
  importTraspasosExcel,

    // RH CEDIS
  getProductividadAreas

  
};

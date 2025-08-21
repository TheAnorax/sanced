const pool = require('../config/database');
const XLSX = require("xlsx");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const uploadExcelPedi = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: "Falta el archivo." });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
        if (!rows.length) {
            return res.status(400).json({ ok: false, message: "El Excel está vacío." });
        }

        // normaliza llaves a minúsculas
        const norm = rows.map((r) => {
            const o = {};
            for (const [k, v] of Object.entries(r)) o[String(k).trim().toLowerCase()] = v;
            return o;
        });

        const pickValue = (row, keys) => {
            for (const k of keys) {
                if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
            }
            return null;
        };

        const values = [];
        const errores = [];

        norm.forEach((r, idx) => {
            const fila = idx + 2; // encabezados en fila 1

            // OBLIGATORIOS: pedido, codigo_ped, cantidad
            const pedido = pickValue(r, ["pedido", "no_orden", "orden"]);
            const codigo_ped = pickValue(r, ["codigo_ped", "codigo ped", "codigo", "codigoped"]);
            const cantidad = pickValue(r, ["cantidad", "cant", "qty"]);

            const pedidoNum = Number(pedido);
            const codigoNum = Number(codigo_ped);
            const cantidadNum = Number(cantidad);

            if (!Number.isFinite(pedidoNum) || pedidoNum <= 0) {
                errores.push({ fila, campo: "pedido", error: "pedido inválido", valor: pedido });
                return;
            }
            if (!Number.isFinite(codigoNum) || codigoNum <= 0) {
                errores.push({ fila, campo: "codigo_ped", error: "codigo_ped inválido", valor: codigo_ped });
                return;
            }
            if (!Number.isFinite(cantidadNum) || cantidadNum < 0) {
                errores.push({ fila, campo: "cantidad", error: "cantidad inválida", valor: cantidad });
                return;
            }

            values.push([
                pedidoNum,     // pedido
                codigoNum,     // codigo_ped
                cantidadNum,   // cantidad
                0,             // cant_surti
                0,             // cant_no_env
                0,             // _bl
                0,             // _pz
                0,             // _pq
                0,             // _inner
                0,             // _master
                new Date(),    // registro
            ]);
        });

        if (!values.length) {
            return res.status(400).json({ ok: false, message: "No hay filas válidas para insertar.", errores });
        }

        const sql = `
      INSERT INTO pedi
        (pedido, codigo_ped, cantidad, cant_surti, cant_no_env, _bl, _pz, _pq, _inner, _master, registro)
      VALUES ?
    `;

        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(sql, [values]);
            conn.release();

            // Si NO quieres ver mensaje en frontend, puedes devolver 204:
            // return res.status(204).send();

            // Si quieres algo mínimo:
            return res.json({ ok: true, inserted: result.affectedRows, errores });
        } catch (e) {
            conn.release();
            return res.status(500).json({ ok: false, message: "Error al insertar en BD.", error: e.message });
        }
    } catch (err) {
        return res.status(500).json({ ok: false, message: "Error procesando el archivo.", error: err.message });
    }
};

// Body: { codigos: [3312,2421,4633,2285] }
const getProductosByCodigos = async (req, res) => {
    try {
        let { codigos } = req.body || {};
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return res.status(400).json({ ok: false, message: "codigos requerido (array)" });
        }

        // Normaliza => enteros únicos > 0 (o cambia a strings si tu columna es VARCHAR)
        const list = [...new Set(codigos.map(c => Number(c)).filter(n => Number.isFinite(n) && n > 0))];
        if (list.length === 0) {
            return res.status(400).json({ ok: false, message: "codigos inválidos" });
        }

        // OJO: ajusta nombres si en tu tabla son distintos
        // En tu captura aparecen: productos(codigo_pro, um, clave, des)
        const sql = `
      SELECT codigo_pro, um, clave, des
      FROM productos
      WHERE codigo_pro IN (?)
    `;

        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(sql, [list]);
            conn.release();

            const map = {};
            rows.forEach(r => {
                map[r.codigo_pro] = {
                    des: r.des || "",
                    um: r.um || "",
                    clave: r.clave || ""
                };
            });

            return res.json({
                ok: true,
                count: rows.length,
                map,                            // { 3312: {des,um,clave}, ... }
                notFound: list.filter(c => map[c] === undefined)
            });
        } catch (e) {
            conn.release();
            return res.status(500).json({ ok: false, message: "Error consultando productos", error: e.message });
        }
    } catch (err) {
        return res.status(500).json({ ok: false, message: "Error interno", error: err.message });
    }
};



module.exports = {
    uploadExcelPedi, upload, getProductosByCodigos
};

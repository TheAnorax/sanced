const pool = require("../config/database");
const multer = require('multer');
const path = require('path');

const obtenerChecklist = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM checklist_equipos ORDER BY fecha DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener checklist:", error);
        res.status(500).json({ message: "Error al obtener checklist" });
    }
};

const insertarChecklist = async (req, res) => {
    try {
        const data = req.body;

        const query = `
            INSERT INTO checklist_equipos (
                fecha,
                folio,
                marca,
                modelo,
                serie,
                empresa,
                tipo_equipo,
                supervisor,
                firma_supervisor,
                firma_operador
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.fecha,
            data.folio,
            data.marca,
            data.modelo,
            data.serie,
            data.empresa,
            data.tipo_equipo,
            data.supervisor,           // NORMAL
            data.supervisor,           // 🟢 firma_supervisor = supervisor
            data.firma_operador        // 🟢 operador REAL
        ];

        await pool.query(query, values);

        res.json({ message: "Checklist creado correctamente" });

    } catch (error) {
        console.error("❌ Error al insertar checklist:", error);
        res.status(500).json({ message: "Error al insertar checklist" });
    }
};



// ===============================
// MULTER DENTRO DEL CONTROLLER
// ===============================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/checklist');
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).any(); // 👈 aquí mismo

const actualizarPartesChecklist = async (req, res) => {

    upload(req, res, async function (err) {
        if (err) {
            console.log("❌ Error en upload:", err);
            return res.status(500).json({ message: "Error subiendo archivos" });
        }

        const { id } = req.params;
        const cambios = req.body;
        const usuario = cambios.usuario || "SISTEMA";

        try {
            const [rows] = await pool.query(
                "SELECT * FROM checklist_equipos WHERE id = ?",
                [id]
            );

            if (!rows.length) {
                return res.status(404).json({ message: "Checklist no encontrado" });
            }

            const actual = rows[0];
            const camposModificados = {};
            const historialValues = [];

            // =========================
            // 📸 FOTOS
            // =========================
            if (req.files && req.files.length) {
                req.files.forEach(file => {
                    const campo = file.fieldname; // ej: foto_torreta
                    const ruta = `/uploads/checklist/${file.filename}`;
                    const valorAnterior = actual[campo];

                    camposModificados[campo] = ruta;

                    historialValues.push([
                        id,
                        campo,
                        valorAnterior,
                        ruta,
                        valorAnterior,
                        ruta,
                        usuario
                    ]);
                });
            }

            // =========================
            // 📝 CAMPOS NORMALES
            // =========================
            Object.keys(cambios).forEach((campo) => {
                if (campo === "usuario") return;

                const valorNuevo = cambios[campo];
                const valorAnterior = actual[campo];

                if (valorNuevo !== valorAnterior) {
                    camposModificados[campo] = valorNuevo;

                    historialValues.push([
                        id,
                        campo,
                        valorAnterior,
                        valorNuevo,
                        null,
                        null,
                        usuario
                    ]);
                }
            });

            if (!Object.keys(camposModificados).length) {
                return res.json({ message: "No hubo cambios" });
            }

            await pool.query(
                "UPDATE checklist_equipos SET ? WHERE id = ?",
                [camposModificados, id]
            );

            await pool.query(
                `
                INSERT INTO checklist_equipos_historial
                (id_checklist, columna, valor_anterior, valor_nuevo, foto_anterior, foto_nueva, usuario)
                VALUES ?
                `,
                [historialValues]
            );

            res.json({ message: "Checklist actualizado correctamente" });

        } catch (error) {
            console.log("❌ Error al actualizar:", error);
            res.status(500).json({ message: "Error en actualización" });
        }
    });
};



const getHistorialChecklist = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                l.id_checklist,
                u.name AS usuario,
                l.columna,
                l.valor_anterior,
                l.valor_nuevo,
                l.fecha
            FROM checklist_equipos_historial l
            JOIN usuarios u ON l.usuario = u.id_usu
            ORDER BY u.name ASC, l.fecha DESC;
        `);

        return res.json(rows);

    } catch (error) {
        console.error("❌ Error al obtener historial:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener historial",
            error
        });
    }
};



module.exports = { obtenerChecklist, insertarChecklist, actualizarPartesChecklist, getHistorialChecklist }; 
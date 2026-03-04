const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getInsumos, crearInsumo, getAreas, actualizarInsumo, getConfigByInsumo, saveConfig, movimientoInsumo, getHistorialGeneral, solicitarInsumo, aprobarSolicitud, obtenerSolicitudes,
    getResumenSolicitudesMes, getMesesSolicitudes, getConsumoPorInsumo
} = require("../controller/insumosController");

// ================================
// Configuración de multer
// ================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/Insumos/");
    },
    filename: function (req, file, cb) {
        const nombre =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);
        cb(null, nombre);
    },
});

const upload = multer({ storage });

// ================================
// Rutas
// ================================

// Obtener insumos
router.get("/obtenerInsumos", getInsumos);

// NUEVO
router.get("/obtenerAreas", getAreas);

// Crear insumo con imagen
router.post("/crearInsumo", upload.single("foto"), crearInsumo);

//actualizar insumo 
router.put("/actualizarInsumo/:id", upload.single("foto"), actualizarInsumo);

// Obtener configuración
router.get("/config/:id_insumo", getConfigByInsumo);

// Guardar configuración
router.post("/config/:id_insumo", saveConfig);

//Movimientos de insumos
router.post("/movimiento", movimientoInsumo);

//Historial de Movimientos 
router.get("/historial", getHistorialGeneral);

// routes/insumosRoutes.js

router.post("/solicitar", solicitarInsumo);

router.put("/aprobar/:id", aprobarSolicitud);

router.get("/solicitudes", obtenerSolicitudes);

router.get("/solicitudes/resumen", getResumenSolicitudesMes);

router.get("/solicitudes/meses", getMesesSolicitudes);

router.get("/consumo/:codigo", getConsumoPorInsumo);

module.exports = router;

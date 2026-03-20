// routes/rh.js
const express = require('express');
const {
  getInsumosRH, createInsumo, updateInsumo, deleteInsumo,
  buscarProducto, createTraspaso, Traspasos,
  excelToJson, importTraspasosExcel, importTraspasosExcelMiddleware,getProductividadAreas, getEmpleadosPorDepartamento, getEmpleadoDetalle, updateEmpleado, createEmpleado,
  obtenerAmonestacionesEmpleado, crearAmonestacion, getFaltasCatalogo, subirEvidenciaAmonestacion
} = require('../controller/rhController');

const { uploadRHEvidencia } = require('../config/multerConfig');

const router = express.Router();

// CRUD
router.get('/RH', getInsumosRH);
router.post('/RH', createInsumo);
router.put('/RH/:id', updateInsumo);
router.delete('/RH/:id', deleteInsumo);

// Traspasos
router.get('/productos/:codigo', buscarProducto);
router.post('/traspaso', createTraspaso);
router.get('/ObtenerTraspaso', Traspasos);

// Excel
router.post('/excel-to-json', importTraspasosExcelMiddleware, excelToJson);
router.post('/import-excel', importTraspasosExcelMiddleware, importTraspasosExcel, );

// rh cedis
router.get("/productividad", getProductividadAreas);

router.get("/departamentos",  getEmpleadosPorDepartamento);

router.get("/empleado/:id",  getEmpleadoDetalle);

router.put("/edit-empleado/:id",  updateEmpleado);

router.post("/creat-empleado",  createEmpleado);

router.get("/empleado/:id/amonestaciones",  obtenerAmonestacionesEmpleado);

router.post("/amonestacion",  crearAmonestacion);

router.get("/faltas", getFaltasCatalogo);

router.post("/amonestacion/evidencia",  uploadRHEvidencia.single("file"),  subirEvidenciaAmonestacion
);


module.exports = router; 

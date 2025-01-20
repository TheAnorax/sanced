const express = require('express');
const router = express.Router();
const { createVisita, darAccesoVisitante, getVisitas, getVisitasAct, getVisitantes, getVisitanteId, getTransportistas, createTransportista, 
    getCategorias, createVisitante, upload, updateVisitante, createTransportistaExcel, darSalidaVisitante, getVisitasReporte, getAllPermisos, 
    permisosAutos, createMulta, multas, visitantesAll, getCategoriasMT, getAllVehiculos, createVehiculosExcel, updateInfoVisitantes, updateClave, 
    getConceptosMultas, getProveedores, createVisitaProveedor,actividadVigilancia,getActividadVigilancia, updateInfoVisitantesVehiculo,
    validacionVehiculo, uploadImgVehiculo, pagarMulta, getMultaDetails, getMultaDetail, pasarValidar, createEmpleado, 
    getAreas, getEmpleados, createEmpleadoExcel,
    validacionProveedor,
    createVehiculo,
} = require('../controller/visitasController');


router.get('/list/visitantes', getVisitantes);
router.get('/list/proveedores', getProveedores);
router.get('/det/visitante/:id', getVisitanteId);
router.post('/create/visitante', upload.single('foto'), createVisitante);
router.post('/update/visitante', upload.single('foto'), updateVisitante);
router.put('/up/informacion', upload.single('foto'), updateInfoVisitantes);
router.put('/up/informacion/vehiculo', upload.single('foto'), updateInfoVisitantesVehiculo);
router.put('/up/clave', upload.single('foto'), updateClave);

router.get('/agenda/hoy', getVisitas);
router.post('/create/visita', createVisita);
router.post('/create/visita/proveedor', createVisitaProveedor);
router.post('/up/imgs', uploadImgVehiculo.fields([{ name: 'img1', maxCount: 1 }, { name: 'img2', maxCount: 1 }, { name: 'img3', maxCount: 1 }, { name: 'img4', maxCount: 1 }]), validacionVehiculo);
router.put('/up/foto/proveedor', upload.single('foto'), validacionProveedor);
router.put('/up/acceso/:id_visit', darAccesoVisitante);
router.put('/up/validar/:id_visit', pasarValidar);
router.put('/up/salida/:id_visit', darSalidaVisitante);
router.get('/agenda/activas', getVisitasAct);
router.get('/reporte', getVisitasReporte);
router.get('/visitantes/all', visitantesAll);

router.get('/transportistas', getTransportistas);
router.post('/create/transportista', upload.single('foto'), createTransportista);
router.post('/upload/transportistas', createTransportistaExcel);

router.get('/categorias', getCategorias);
router.get('/categorias/mt', getCategoriasMT);

router.post('/create/vehiculo', createVehiculo);
router.get('/vh/per', getAllPermisos);
router.put('/permiso/:id_vehpr', permisosAutos);

router.post('/multa', createMulta);
router.put('/pagar/multa/:id_mul', upload.single('foto_pago'), pagarMulta);
router.get('/list/multas', multas);
router.post('/detail/multas', getMultaDetails);
router.post('/deta/multas', getMultaDetail);

router.get('/vehiculos', getAllVehiculos);
router.post('/upveh/excel', createVehiculosExcel);

router.get('/con/multas', getConceptosMultas);
router.post('/actividad/vigilancia', actividadVigilancia);
router.get('/actividad', getActividadVigilancia);

router.get('/areas', getAreas);
router.post('/create/empleado', upload.single('foto'), createEmpleado);
router.get('/list/empleados', getEmpleados);
router.post('/import/empleados', createEmpleadoExcel);

module.exports = router;
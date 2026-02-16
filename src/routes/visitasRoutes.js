const express = require('express');
const router = express.Router();
const { createVisita, darAccesoVisitante, getVisitas, getVisitasAct, getVisitantes, getVisitanteId, getTransportistas, createTransportista, getCategorias, createVisitante, upload, 
    updateVisitante, createTransportistaExcel, darSalidaVisitante, getVisitasReporte, getAllPermisos, permisosAutos, createMulta, multas, visitantesAll, getCategoriasMT, getAllVehiculos, 
    createVehiculosExcel, updateInfoVisitantes, updateClave, getConceptosMultas, getProveedores, createVisitaProveedor,actividadVigilancia,getActividadVigilancia, updateInfoVisitantesVehiculo,
    validacionVehiculo, uploadImgVehiculo, pagarMulta, getMultaDetails, getMultaDetail, pasarValidar, createEmpleado,  getAreas, getEmpleados, createEmpleadoExcel, uploadImgPagos, validacionProveedor, 
    createVehiculo, getAreasTransp, desactivarEmpleado, updateEmpleado, pasarLlegada, getCategoriasPP, getPaqueterias, getCortinas, createVisitaPaqueteria, getVisitasVehiculoValidado, registrarAcompañantes, 
    cancelarVisita, getVisitasHoy, updatePaqueteria, createVisitaEntrevista, sendVisitEmail,
    createVisitaOper,
    darSalidaOper,
    sendEmailEviden,
    createVisitaManiobra,
} = require('../controller/visitasController');
const { obtenerHorarios } = require('../controller/alertasController');

router.get('/alert', obtenerHorarios);
router.get('/list/visitantes', getVisitantes);
router.get('/list/proveedores', getProveedores);
router.get('/det/visitante/:id', getVisitanteId);
router.post('/create/visitante', upload.single('foto'), createVisitante);
router.post('/update/visitante', upload.single('foto'), updateVisitante);
router.put('/up/informacion', upload.single('foto'), updateInfoVisitantes);
router.put('/up/informacion/vehiculo', upload.single('foto'), updateInfoVisitantesVehiculo);
router.put('/up/clave', upload.single('foto'), updateClave);

router.get('/agenda/hoy', getVisitas);
router.get('/agenda/hoy/rh', getVisitasHoy);
router.post('/create/visita', createVisita);
router.post('/create/visita/proveedor', createVisitaProveedor);
router.post('/up/imgs', uploadImgVehiculo.fields([{ name: 'img1', maxCount: 1 }, { name: 'img2', maxCount: 1 }, { name: 'img3', maxCount: 1 }, { name: 'img4', maxCount: 1 }]), validacionVehiculo);
router.put('/up/foto/proveedor', upload.single('foto'), validacionProveedor);
router.put('/up/acceso/:id_visit', darAccesoVisitante);
router.post('/create/acomp', registrarAcompañantes);
router.put('/llegada/:id_visit', pasarLlegada);
router.put('/validar/:id_visit', pasarValidar);
router.put('/up/salida/:id_visit', darSalidaVisitante);
router.put('/up/salida/oper/:id_visit', darSalidaOper);
router.get('/agenda/activas', getVisitasAct);
router.get('/agenda/hoy/valid', getVisitasVehiculoValidado);
router.put('/cancelar/visita/:id_visit', cancelarVisita);
router.get('/reporte', getVisitasReporte);
router.get('/visitantes/all', visitantesAll);

router.get('/transportistas', getTransportistas);
router.post('/create/transportista', upload.single('foto'), createTransportista);
router.post('/upload/transportistas', createTransportistaExcel);

router.get('/cortinas', getCortinas);
router.get('/categorias', getCategorias);
router.get('/categorias/mt', getCategoriasMT);
router.get('/categorias/pp', getCategoriasPP);

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
router.get('/areas/tr', getAreasTransp);
router.post('/create/empleado', upload.single('foto'), createEmpleado);
router.put('/update/empleado', upload.single('foto'),  updateEmpleado);
router.put('/cancel/empleado/:id_emp', desactivarEmpleado);
router.get('/list/empleados', getEmpleados);
router.post('/import/empleados', createEmpleadoExcel);
router.get('/paqueterias', getPaqueterias);
router.post('/create/visita/pq', createVisitaPaqueteria);
router.post('/create/visita/et', createVisitaEntrevista);
router.post('/create/visita/man', createVisitaManiobra);
router.post('/send/visita/et', sendVisitEmail);
router.put('/update/visita/pq/:clave_visit', updatePaqueteria);
router.post('/create/visita/oper',upload.single('foto'), createVisitaOper);
router.post('/send/visita/eviden', sendEmailEviden);
module.exports = router;
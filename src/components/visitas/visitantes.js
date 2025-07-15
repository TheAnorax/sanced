import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { Checkbox, Dialog, Divider, Select, TextField, Typography, Box, FormControl, InputLabel, MenuItem, FormControlLabel, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Avatar, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert,
  Snackbar, Grid, Tooltip, ButtonGroup,
  Menu,} from "@mui/material";
import { PhotoCamera, CloudUpload, CarCrash, Search, PersonAddAlt, LocalShipping, Add, PrecisionManufacturing, UploadFile, Schedule, Clear, Backup, DoNotDisturbOn, CheckCircleOutline, DirectionsCarFilled, AccessAlarm, EventAvailableOutlined,
  Error, AvTimer, DeleteOutline, Autorenew, Business, Person, CarCrashOutlined, CloudQueue, UploadFileOutlined, HelpOutline,ErrorOutline, DirectionsSubway, BusAlert, EditCalendar, SensorOccupied, ConnectWithoutContact,
  AirlineSeatReclineNormal, DirectionsCar, EventBusy, FmdGoodOutlined, EngineeringOutlined,
  KeyboardArrowDown, } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useMediaQuery } from "@mui/material";
import { ArrowDropDownIcon, DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import logob from './logo.png';
import ejemplo from './ejemplo.png';
import ejemploVeh from './ej_vehiculo.png';
import { QRCodeCanvas } from "qrcode.react";
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/es' 
import EscPosEncoder from 'esc-pos-encoder';
import Swal from "sweetalert2";

dayjs.locale('es');
//const api = "http://192.168.3.27:3007/api/visitas";
//const foto = "http://192.168.3.27:3007/api/fotos";
function Visitantes() {
  const api = "http://66.232.105.87:3007/api/visitas";
  const foto = "http://66.232.105.87:3007/api/fotos";

  
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  //tab
    const [tabIndex, setTabIndex] = useState(0);
  //data
  const [empleados, setEmpleados] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [proveedoresAct, setProveedoresAct] = useState([]);
  const [visitantesAll, setVisitantesAll] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [selectedVisita, setSelectedVisita] = useState(null);
  const [selectedVisitaSalida, setSelectedVisitaSalida] = useState(null);
  const [selectedVisitaBloqeo, setSelectedVisitaBloqeo] = useState(null);

  const [selectedVisitante, setSelectedVisitante] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriasMT, setCategoriasMT] = useState([]);
  const [categoriasPP, setCategoriasPP] = useState([]);
  const [paqueterias, setPaqueterias] = useState([]);
  const [selectedPaqueteria, setSelectedPaqueteria] = useState([]);
  const [selectCategorias, setSelectCategorias] = useState(null);
  const [areas, setAreas] = useState([]);
  const [areasTR, setAreasTR] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [cortinas, setCortinas] = useState([]);
  const [selectedCortina, setSelectedCortina] = useState(null);
   
  const [selectCategoriasMT, setSelectCategoriasMT] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryEmpleado, setSearchQueryEmpleado] = useState("");
  const [searchQueryPlaca, setSearchQueryPlaca] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filteredVisitas, setFilteredVisitas] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [searchPerformedPlacas, setSearchPerformedPlacas] = useState(false);
  const [filteredPlacas, setFilteredPlacas] = useState([]);
  const [selectedAcs, setSelectedAcs] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [selectedPR, setSelectedPR] = useState([]);
  const [tiempo, setTiempo] = useState("");
  const [excesoTiempo, setExcesoTiempo] = useState(false); 
  const [image, setImage] = useState(null);
  const [imageUp, setImageUp] = useState(null);
  const [imageProv, setImageProv] = useState(null);
  const [images, setImages] = useState({
    img1: '',//frente del camion
    img2:'',//cabina
    img3:'',//caja abierta
    img4:''//por fuera
  });
  const imageLabels = {
    img1: 'Frente del camión',
    img2: 'Cabina',
    img3: 'Caja abierta',
    img4: 'Por fuera',
    img5: 'Placa', // Etiqueta para la imagen de la placa
};

  const [comentario, setComentario] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [actividad, setActividad] = useState([]);
 
  const [conMulta, setConMulta] = useState([]);
  const [selectedConMulta, setSelectedConMulta] = useState(null);
  const [clave, setClave] = useState('')

  const [checked, setChecked] = useState(false);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);


  const [checkedVisita, setCheckedVisita] = useState(false);
  const [checkedPaq, setCheckedPaq] = useState(false);
  const [checkedIne, setCheckedIne] = useState(false);
  const [checkedLic, setCheckedLic] = useState(false);
  const [acompanantes, setAcompanantes] = useState([]);
  const [acompanantesPaq, setAcompanantesPaq] = useState([]);
  const [checkedAcceso, setCheckedAcceso] = useState(false);

  const [invalidColumns, setInvalidColumns] = useState([]);
  const [dataExcel, setDataExcel] = useState([]);
  const expectedColumns = [
    "nombre",
    "apellidos",
    "empresa",
    "telefono",
    "no_licencia",
    "no_ine",
    //"marca",
    //"modelo",
    //"placa",
    //"anio",
    //"seguro",
  ];
  const [invalidColumnsVeh, setInvalidColumnsVeh] = useState([]);
  const [dataExcelVeh, setDataExcelVeh] = useState([]);
  const expectedColumnsVeh = [
    "empresa",
    "marca",
    "modelo",
    "placa",
    "anio",
    "seguro",
  ];


  //data error
  const [errorExcel, setErrorExcel] = useState([]);
  const [errorExcelVeh, setErrorExcelVeh] = useState([]);
  const [errorSave, setErrorSave] = useState([]);
  const [errorSaveVeh, setErrorSaveVeh] = useState([]);
  const [errorVisita, setErrorVisita] = useState('');
  const [errorVisitaPaqueteria, setErrorVisitaPaqueteria] = useState('');
  const [errorVisitaAcomp, setErrorVisitaAcomp] = useState('');
  const [errorVisitaAuto, setErrorVisitaAuto] = useState('');
  const [errorVehiculo, setErrorVehiculo] = useState('');
  const [errorTransp, setErrorTransp] = useState('');
  const [errorVisitas, setErrorVisitas] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraReadyUp, setIsCameraReadyUp] = useState(false);
  const [errorMulta, setErrorMulta] = useState('');
  const [errorProveedor, setErrorProveedor] = useState('');
  const [errorVisitante, setErrorVisitante] = useState('');
  const [errorTransportista, setErrorTransportista] = useState('');

  const visitaDetailsRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  //dialogs
  const [openCam, setOpenCam] = useState(false);
  const [openCamVehiculo, setOpenCamVehiculo] = useState(false);
  const [openCamUp, setOpenCamUp] = useState(false);
  const [openCamUpDatos, setOpenCamUpDatos] = useState(false);
  const [openCreateInvitado, setOpenCreateInvitado] = useState(false);
  const [openCreateTransp, setOpenCreateTransp] = useState(false);
  const [openCreateVisita, setOpenCreateVisita] = useState(false);
  const [openCreatePaqueteria, setOpenCreatePaqueteria] = useState(false);
  const [openCreateCliente, setOpenCreateCliente] = useState(false);
  const [openValidarVehiculo, setOpenValidarVehiculo] = useState(false);
  const [openGenerarAcceso, setOpenGenerarAcceso] = useState(false);
  const [openRegAcomp, setOpenRegAcomp] = useState(false);
  const [openUpExcel, setOpenUpExcel] = useState(false);
  const [openUpExcelVeh, setOpenUpExcelVeh] = useState(false);
  const [openNewVeh, setOpenNewVeh] = useState(false);
  const [openSalida, setOpenSalida] = useState(false);
  const [openBloqueo, setOpenBloqueo] = useState(false);
  const [openVisitaAgendada, setOpenVisitaAgendada] = useState(false);
  const [openUpExcelInfo, setOpenUpExcelInfo] = useState(false);
  const [openMultaFinalizar, setOpenMultaFinalizar] = useState(false);
  const [openVisitaDup, setOpenVisitaDup] = useState(false);
  const [openTransportistaError, setOpenTransportistaError] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);
  const [alertaMostrada, setAlertaMostrada] = useState(false);
  const [showErrorAlertPlaca, setShowErrorAlertPlaca] = useState(false); 

  const [openExcesoTiempo, setOpenExcesoTiempo] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showSuccessAlertImgs, setShowSuccessAlertImgs] = useState(false);
  const [showErrorAlertImgs, setShowErrorAlertImgs] = useState(false);

  
  const webcamRef = useRef(null);
  
  //filto
  const [filtro, setFiltro] = useState('todos');

  const mostrarVisitantes = () => setFiltro('visitantes');
  const mostrarTransportistas = () => setFiltro('transportistas');
  const mostrarProveedores = () => setFiltro('proveedores');
  const mostrarPaqueterias = () => setFiltro('paqueterias');
  const mostrarProveedor = () => setFiltro('paqueterias');
  const mostrarClientes = () => setFiltro('clientes');
  const mostrarTodos = () => setFiltro('todos');

  const paqueteriasAct = transportistas.filter((trans) => trans.tipo === 'PAQUETERIA');
  const transportistasAct = transportistas.filter((trans) => trans.tipo === 'TRANSPORTISTA');
  const proveedor = transportistas.filter((trans) => trans.tipo === 'PROVEEDOR');
  const proveedorImp = visitantes.filter((trans) => trans.tipo === 'PROVEEDOR (IMPORTACIONES/NACIONALES)');
  const clienteRecoge = transportistas.filter((trans) => trans.tipo === 'CLIENTE RECOGE');

  const datosFiltradosVisitantes = filtro === 'visitantes' || filtro === 'todos' ? visitantes : [];
  const datosFiltradosTransportistas = filtro === 'transportistas' || filtro === 'todos' ? transportistasAct : [];
  const datosFiltradosProveedores = filtro === 'proveedores' || filtro === 'todos' ? proveedoresAct : [];
  const datosFiltradosProveedor = filtro === 'proveedores' || filtro === 'todos' ? proveedor : [];
  const datosFiltradosProveedorImp = filtro === 'proveedores' || filtro === 'todos' ? proveedorImp : [];
  const datosFiltradosPaqueterias = filtro === 'paqueterias' || filtro === 'todos' ? paqueteriasAct : [];
  const datosFiltradosClienteRecoge = filtro === 'clientes' || filtro === 'todos' ? clienteRecoge : [];

  const columns = [
    { id: '', label: '', minWidth: 170 },
    { id: 'nombre', label: 'NOMBRE', minWidth: 170 },
    { id: 'empresa', label: 'EMPRESA', minWidth: 100 },
    { id: 'respon', label: 'RESPONSABLE', minWidth: 170 },
    { id: 'area', label: 'ÁREA', minWidth: 170, align: 'right' },
    { id: 'entrada', label: 'ENTRADA', minWidth: 170  },
    { id: 'vehiculo', label: 'VEHÍCULO', minWidth: 170  },
  ];


  //dialog de actividad
  const [dialogOpen, setDialogOpen] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);
  const [codigoIng, setCodigoIng] = useState("");
  const [codigoGenerado, setCodigoGenerado] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageImp, setErrorMessageImp] = useState("");
  const [AlertaCodigo, setAlertaCodigo] = useState(false);
  const [alertasEnviadas, setAlertasEnviadas] = useState(0);
  const [alertasTardeEnviadas, setAlertasTardeEnviadas] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(60);

  const generarCodigo = () => {
    const nuevoCodigo = Math.floor(1000 + Math.random() * 9000);
    setCodigoGenerado(nuevoCodigo);
    setRandomNumber(nuevoCodigo);
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  }

  const enviarAlerta = () => {
    generarCodigo();
    console.log("Alerta enviada con el código:", randomNumber);
  };

  const programarAlertas = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Configuración de alertas de la mañana
    if (currentHour >= 7 && currentHour < 12) {
      if (alertasEnviadas === 0 && currentHour < 9) {
        enviarAlerta();
        setAlertasEnviadas((prev) => prev + 1);
      } else if (alertasEnviadas === 1 || alertasEnviadas === 0 && currentHour >= 9) {
        enviarAlerta();
        setAlertasEnviadas((prev) => prev + 1);
      }
    }

    // Configuración de alertas de la tarde
    if (currentHour >= 13 && currentHour < 20) {
      if (alertasTardeEnviadas === 0 && currentHour < 15) {
        enviarAlerta();
        setAlertasTardeEnviadas((prev) => prev + 1);
      } else if (alertasTardeEnviadas === 1 && currentHour >= 15 && currentHour < 18) {
        enviarAlerta();
        setAlertasTardeEnviadas((prev) => prev + 1);
      } else if (alertasTardeEnviadas === 2 && currentHour >= 18) {
        enviarAlerta();
        setAlertasTardeEnviadas((prev) => prev + 1);
      }
    }

    // Configuración de alertas nocturnas
    if (currentHour >= 20 || currentHour < 7) {
      enviarAlerta();
      setTimeout(programarAlertas, 60 * 60 * 1000); // Cada hora
    }
  };

  const iniciarAlertas = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (!actividad) {
      // No hay actividad previa, iniciar a las 7 am
      const inicio = new Date();
      inicio.setHours(7, 0, 0, 0);

      if (now < inicio) {
        const tiempoHastaInicio = inicio - now;
        setTimeout(programarAlertas, tiempoHastaInicio);
      } else {
        programarAlertas();
      }
    } else {
      programarAlertas();
    }
  };

  const getUltimaActividad = async () => {
    try {
      const response = await axios.get(`${api}/actividad`);
      if (response.data && response.data.fecha) {
        const ultimaActividad = new Date(response.data.fecha);
        setActividad(ultimaActividad);
        console.log("Última actividad:", ultimaActividad);
      } else {
        console.error("No se encontró la propiedad 'fecha' en la respuesta.");
      }
    } catch (error) {
      console.error("Error al obtener la última actividad:", error);
    }
  };

  useEffect(() => {
    getUltimaActividad();
  }, []);

  useEffect(() => {
    iniciarAlertas();
  }, [actividad]);

const handleClose = () => {
    setDialogOpen(false);
    setCodigoIng("");
    setErrorMessage("");
  };

  
  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer); 
      setTiempoRestante(60); 
      setRandomNumber(Math.floor(1000 + Math.random() * 9000)); 
    }
  }, [tiempoRestante]);

  const handleValidate = () => {
    if (parseInt(codigoIng, 10) === randomNumber) {
        const coincidencia = 'S';
        enviarActividad(codigoGenerado, codigoIng, coincidencia);
        setAlertaCodigo(true);
        setTimeout(() => setAlertaCodigo(false), 1000); 
        setTimeout(() => handleClose(), 1000); 
    } else {
        setErrorMessage("El número ingresado no coincide. Inténtalo de nuevo.");
        setCodigoIng('')
        const nuevoCodigo = Math.floor(1000 + Math.random() * 9000);
        setRandomNumber(nuevoCodigo); 
        setCodigoGenerado(nuevoCodigo); 
        
        const coincidencia = 'N';
        enviarActividad(codigoGenerado, codigoIng, coincidencia);
    }
};

  const enviarActividad = async (codigoGenerado, codigoIngresado, coincidencia) => {
    const datos = {
      id_us: user.id_usu,  
      codigo_generado: codigoGenerado,
      codigo_ingresado: codigoIngresado,
      coincidencia: coincidencia}

    try {
        const response = await axios.post(`${api}/actividad/vigilancia`, datos,{
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (data.success) {
           // alert('Datos guardados correctamente');
            console.log('Datos guardados correctamente')
        } else {
            alert('Error al guardar los datos');
            console.log('Error al guardar los datos');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
};

const handleSearchChangeEmpleado = (e) => {
  const query = e.target.value;
  setSearchQueryEmpleado(query);
  if (query.trim() === "") {
    setFilteredEmpleados([]);
    setSearchPerformed(false);
  }
};

const handleSearchEmpleado = () => {
  if (searchQueryEmpleado.trim() === "") {
    return;
  }

  const filtered = empleados.filter((empleado) => {
    const noEmpleado = (empleado.no_empleado || "").trim().toLowerCase();
    const nombreCompleto = (empleado.nombre_completo || "").trim().toLowerCase();
    const searchQuery = searchQueryEmpleado.trim().toLowerCase();

    return noEmpleado === searchQuery || nombreCompleto === searchQuery;
  });

  setFilteredEmpleados(filtered);
  setSearchPerformed(true);
};

const handleClearSearchEmpleado = () => {
  setSearchQueryEmpleado("");
  setFilteredEmpleados([]);
  setSearchPerformed(false);
};
///

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredVisitas([]);
      setSearchPerformed(false);
    }
  };
  
  // const handleSearch = () => {
  //   if (searchQuery.trim() === "") {
  //     return;
  //   }
  
  //   const filtered = visitas.filter((visita) => {
  //     const nombreCompleto = (visita.nombre_completo || "").trim().toLowerCase();
  //     const contenedor = (visita.contenedor || "").toLowerCase().includes(searchQueryPlaca.toLowerCase());
  //     return nombreCompleto === searchQuery.trim().toLowerCase();
  //   });
  
  //   setFilteredVisitas(filtered);
  //   setSearchPerformed(true);
  // };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      return;
    }
  
    const filtered = visitas.filter((visita) => {
      const nombreCompleto = (visita.nombre_completo || "").trim().toLowerCase();
      const contenedor = (visita.contenedor || "").toLowerCase();

      // Perform partial matching for both fields
      const matchesNombreCompleto = nombreCompleto.includes(searchQuery.trim().toLowerCase());
      const matchesContenedor = contenedor.includes(searchQuery.toLowerCase());

      return matchesNombreCompleto || matchesContenedor;  // Allow matches in either field
    });
  
    setFilteredVisitas(filtered);
    setSearchPerformed(true);
};
  
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredVisitas([]);
    setSearchPerformed(false);
  };

  const handleSearchChangePlaca = (e) => {
    const query = e.target.value;
    setSearchQueryPlaca(query);

    if (query.trim() === "") {
      setFilteredPlacas([]); 
      setSearchPerformedPlacas(false); 
    }
  };

  const handleSearchPlaca = () => {
    if (searchQueryPlaca.trim() === "") {
      return;
    }
    const filtered = visitas.filter(
      (visita) =>
        (visita.placa || "").toLowerCase().includes(searchQueryPlaca.toLowerCase()) || 
        (visita.contenedor || "").toLowerCase().includes(searchQueryPlaca.toLowerCase())
    );
    setFilteredPlacas(filtered);
    setSearchPerformedPlacas(true);
  };

  const handleClearSearchPlaca = () => {
    setSearchQueryPlaca("");
    setFilteredPlacas([]);
    setSearchPerformedPlacas(false); 
  };

  const formatDateToYMDQR = (date) => {
    if (!date) return "";
    
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) return ""; 

    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const day = String(validDate.getDate()).padStart(2, "0");
    const hour = validDate.getHours();
    const minutes = validDate.getMinutes();
    const seconds = validDate.getSeconds();
    
    return `${year}-${month}-${day}`;
};

  useEffect(() => {
    getTiposVist();
    getVisitas();
    getVisitantes();
    getVisitasAct();
    getTiposVistMT();
    getTiposVistPP();
    getConMultas();
    getProveedores();
    getUltimaActividad();
    getAreas();
    getEmpleados();
    getAreasTR();
    getPaqueterias();
    getCortinas();
  }, []);

  useEffect(() => {
    if (!openCamUp) {
      setIsCameraReadyUp(false); // Reinicia el estado al cerrar el diálogo
    }
    if (!openCam) {
      setIsCameraReady(false); // Reinicia el estado al cerrar el diálogo
    }
  }, [openCamUp, openCam]);


  const getEmpleados = async () => {
    try {
        const response = await axios.get(`${api}/list/empleados`);
        setEmpleados(response.data.empleados);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
  };

  const getAreas = async () => {
    try {
      const response = await axios.get(`${api}/areas`);

      setAreas(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getAreasTR = async () => {
    try {
      const response = await axios.get(`${api}/areas/tr`);

      setAreasTR(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getTiposVist = async () => {
    try {
      const response = await axios.get(`${api}/categorias`);

      setCategorias(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getTiposVistMT = async () => {
    try {
      const response = await axios.get(`${api}/categorias/mt`);

      setCategoriasMT(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getTiposVistPP = async () => {
    try {
      const response = await axios.get(`${api}/categorias/pp`);

      setCategoriasPP(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getPaqueterias = async () => {
    try {
      const response = await axios.get(`${api}/paqueterias`);

      setPaqueterias(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getCortinas = async () => {
    try {
      const response = await axios.get(`${api}/cortinas`);

      setCortinas(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getVisitas = async () => {
    try {
      const response = await axios.get(`${api}/agenda/hoy`);
      const All = response.data.visitantes;
      const contenedores = response.data.contenedores;
      const transportistas = response.data.transportistas;
      setVisitas([...All, ...transportistas, ...contenedores]);
      //console.log
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getVisitantes = async () => {
    try {
        const response = await axios.get(`${api}/list/visitantes`);
        const visitantes = response.data.visitantes.map((visitante) => ({
            id_vit: visitante.id_vit,
            label: visitante.nombre_completo,
            clave:visitante.clave, 
            value: visitante, 
            categoria: visitante.categoria,
            acomp: visitante.nom_com ,
            placa: visitante.placa,
            id_veh: visitante.id_veh,
            acc: visitante.acc || ''
        }));
        
        const transportistas = response.data.transportistas.map((transp) => ({
            id_vit: transp.id_transp,
            label: transp.nombre_completo || transp.nombre,
            clave: transp.clave,   
            value: transp,   
            categoria: transp.categoria,  
            acomp: transp.nom_com,
            acc_veh: transp.acc_veh || ''
        }));
        
        setAccesos([...visitantes, ...transportistas]);
        console.log('list',response.data);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
};

const getProveedores = async () => {
  try {
    const response = await axios.get(`${api}/list/proveedores`);
    const visitantes = response.data.visitantes.map((visitante) => ({
        id_vit: visitante.id_vit,
        label: visitante.nombre_completo,
        clave:visitante.clave, 
        value: visitante, 
        categoria: visitante.categoria,
        acomp: visitante.nom_com ,
        placa: visitante.placa,
        id_veh: visitante.id_veh,
        acc: visitante.acc || ''
    }));
    setProveedores(visitantes);
    //console.log
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const getConMultas = async () => {
  try {
    const response = await axios.get(`${api}/con/multas`);
    setConMulta(response.data);
    //console.log
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

  //letras mayusculas
  const convertirATextoMayusculas = (obj) => {
    const nuevoObjeto = {};
      for (const [key, value] of Object.entries(obj)) {
        nuevoObjeto[key] =
          typeof value === "string" ? value.toUpperCase() : value;
      }
      return nuevoObjeto;
    };

  const createTransportista = async () => { 
    const invitMayusculas = convertirATextoMayusculas(transp);

    const formData = new FormData();
    Object.entries(invitMayusculas).forEach(([key, value]) => {
        formData.append(key, value);
    });

    if (image) {
      formData.append('foto', image);
    } else {
      console.error("No se ha seleccionado ninguna imagen.");
      // return;
    }

    try {
      const response = await axios.post(`${api}/create/transportista`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Guardado exitoso', response.data);
      setClave({ tipo: response.data.tipo, mensaje: response.data.message });
      //setOpenRegistro(true);
      Swal.fire({
        title:'Transportista registrado con exito.',
        text: `Clave: ${response.data.message}`,

        icon: "success",
        confirmButtonText: "CERRAR",
        confirmButtonColor: "#6dba27",
        // denyButtonText: `AGENDAR`,
        // denyButtonColor: "#FFA500",
        // showDenyButton: true,
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
          }
        }
      }).then(() => {
        window.location.reload();
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error inesperado al registrar.";
      setErrorTransportista(errorMessage);
      //setOpenTransportistaError(true);
      Swal.fire({
        //title: "Error",
        text: errorMessage,
        //text: msg,
        icon: "error",
        confirmButtonText: "CERRAR",
        //confirmButtonColor: "#6dba27",
        confirmButtonColor: "#FFA500",
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
          }
        }
      }).then(() => {
        //getLista()
        window.location.reload();
      })
    }
  };
    

  const [transp, setTransp] = useState(
    {
      id_catv: "",
      nombre: "",
      apellidos:"",
      foto: "", 
      empresa: "",
      telefono:"",
      no_licencia:"",
      no_ine:"",
      marca:"",
      modelo:"",
      placa: "",
      anio:"",
      seguro:"",
      
        
    }
  );

const validateTransportista = () => {
  let validationErrors = {};
  let isValid = true;

  if(!transp.nombre.trim()) {
    validationErrors.nombre = "Este dato es obligatorio.";
    isValid = false;
  }
  if (!transp.apellidos.trim()) {
    validationErrors.apellidos = "Este dato es obligatorio.";
    isValid = false;
  } else if (!transp.apellidos.trim().includes(' ') || transp.apellidos.trim().split(' ').length < 2) {
    validationErrors.apellidos = "Debe ingresar los dos apellidos.";
    isValid = false;
  }
  if(!transp.empresa.trim()){
    validationErrors.empresa = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!transp.no_ine.trim()){
    validationErrors.no_ine = "Este dato es obligatorio.";
    isValid = false;
  }else if(!/^\d{12,13}$/.test(transp.no_ine)){
    validationErrors.no_ine = "Se requieren almenos 12 números.";
    isValid = false;
  }
  if(!transp.telefono.trim()){
    validationErrors.telefono = "Este dato es obligatorio.";
    isValid = false;
  }else if(!/^\d{10}$/.test(transp.telefono)){
    validationErrors.telefono = "Se requieren almenos 10 números.";
    isValid = false;
  }

  if(!!(selectCategoriasMT?.id_catv === 5 || selectCategoriasMT?.id_catv === 6 || selectCategoriasMT?.id_catv === 11)){
    if (!transp.no_licencia.trim()) {
      validationErrors.no_licencia = "Este dato es obligatorio.";
      isValid = false;
    } else if (!/^[a-zA-Z0-9]{10,12}$/.test(transp.no_licencia)) {
      validationErrors.no_licencia = "Debe contener al menos 11 o 12 caracteres.";
      isValid = false;
    }
  }
  
  
  if(!transp.id_catv){
    validationErrors.id_catv = "Este campo es obligatorio.";
    isValid = false;
  }

  setErrorTransp(validationErrors);

  return isValid;
}


const SaveTransp = () => {
  if(validateTransportista()){
    createTransportista();
  }else{
    console.log('error en la validacion')
  }
}

const inputChangeTransp = (event) => {
  const { name, value } = event.target;

  setTransp((prevState) => ({
    ...prevState,
    [name]: value,
  }));
  //setInvit({ ...invit, [e.target.name]: e.target.value });
};

const handleDropdownChangeTipoMt = (event) => {
  const selectedValue = event.target.value;
  setSelectCategoriasMT(selectedValue);
  setTransp((prevState) => ({
    ...prevState,
    id_catv: selectedValue?.id_catv || "",
  }));
};

const updateInvitado = async (e) => {
  const idVisit = selectedVisitante.clave; 
  e.preventDefault();

  const formData = new FormData();

  if (imageUp) {
      formData.append('foto', imageUp);
      formData.append('clave', idVisit);
  } else {
      console.error("No se ha seleccionado ninguna imagen.");
      return;
  }

  try {
      const response = await axios.post(`${api}/update/visitante`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
      });
      //console.log("Guardado exitoso", response.data);
      if (response.status === 200) {
        console.log("Guardado exitoso", response.data);
  
        // Actualiza el estado de la foto del visitante sin recargar la página
        const updatedVisitante = { ...selectedVisitante, foto: response.data.foto };
        setSelectedVisitante(updatedVisitante);
  
        // Cierra el diálogo
        setOpenCamUp(false);
        //window.location.reload();
        if(selectedVisitante.id_catv === 5) {
          //handleClickOpenValidarVehiculo(selectedVisitante);
          window.location.reload();
        } else{
           handleClickOpenAcceso(selectedVisitante);
        }
       
      }
  } catch (error) {
      console.error(
          "Error al actualizar:",
          error.response?.data || error.message
      );
  } 
  //setOpenCreateInvitado(false);
};


const createInvitado = async () => {
  const invitMayusculas = convertirATextoMayusculas(invit);
  const formData = new FormData();

  Object.entries(invitMayusculas).forEach(([key, value]) => {
    if (key.startsWith("no_licencia") || key.startsWith("marca") || key.startsWith("modelo") || key.startsWith("placa") || key.startsWith("anio") || key.startsWith("seguro")) {
      if (checked) {
        formData.append(key, value);
      }
    } else {
      formData.append(key, value);
    }
  });

  if (image) {
    formData.append("foto", image);
  } else {
    console.error("No se ha seleccionado ninguna imagen.");
  }

  try {
    const response = await axios.post(`${api}/create/visitante`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Guardado exitoso", response.data);
    setClave({ tipo: response.data.tipo, mensaje: response.data.message });
    Swal.fire({
      title:'Visitante registrado con exito.',
      text: `Clave: ${response.data.message}`,

      icon: "success",
      confirmButtonText: "CERRAR",
      confirmButtonColor: "#6dba27",
      denyButtonText: `AGENDAR`,
      denyButtonColor: "#FFA500",
      showDenyButton: true,
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.location.reload();
      } else if (result.isDenied) {
        await getVisitantes();
        setOpenCreateVisita(true);
      }
    });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error inesperado al registrar.";
    setErrorVisitante(errorMessage);
    Swal.fire({
      //title: "Error",
      text: errorMessage,
      //text: msg,
      icon: "error",
      confirmButtonText: "CERRAR",
      //confirmButtonColor: "#6dba27",
      confirmButtonColor: "#FFA500",
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
        }
      }
    }).then(() => {
     window.location.reload();
    })
  }
};


  const [invit, setInvit] = useState({
    id_catv: 0,
    nombre: "",
    apellidos:"",
    puesto:"",
    no_empleado:'',
    empresa: "",
    telefono: "",
    foto: "",
    no_licencia: "",
    no_ine: "",
    marca: "",
    modelo: "",
    placa: "",
    anio: "",
    seguro: "",
  });

//separar la validaciones
  const validateVisitante = () => { 
    let validationErrors = {};
    let validationErrorsAuto = {};
    let isValid = true;

    // Validación de los campos generales
    if(!(invit.nombre || '').trim()) {
      validationErrors.nombre = "Este dato es obligatorio.";
      isValid = false;
    }
    if (!(invit.apellidos || '').trim()) {
      validationErrors.apellidos = "Este dato es obligatorio.";
      isValid = false;
    } else if (!/^(\w+\s+\w+).*$/i.test(invit.apellidos.trim())) {
      validationErrors.apellidos = "Debes ingresar los dos apellidos.";
      isValid = false;
    }

    if(!!(selectCategorias?.id_catv === 1)) {
      if(!(invit.puesto || '').trim()){
        validationErrors.puesto = "Este dato es obligatorio.";
        isValid = false;
      }
      if (!(invit.no_empleado || '').trim()) {
        validationErrors.no_empleado = "Este dato es obligatorio.";
        isValid = false;
      } else if (!/^\d+$/.test(invit.no_empleado)) {
        validationErrors.no_empleado = "Solo se permiten números.";
        isValid = false;
      }
    }
    
    if (!(selectCategorias?.id_catv === 1 || selectCategorias?.id_catv === 2 || selectCategorias?.id_catv === 10)) {
      if (!(invit.empresa || '').trim()) {
        validationErrors.empresa = "Este dato es obligatorio.";
        isValid = false;
      }
    }
    if (!(selectCategorias?.id_catv ===  9 || selectCategorias?.id_catv ===  10)) {
      if(!(invit.no_ine || '').trim()){
        validationErrors.no_ine = "Este dato es obligatorio.";
        isValid = false;
      } else if(!/^\d{12,13}$/.test(invit.no_ine)){
        validationErrors.no_ine = "Se requieren al menos 12 números.";
        isValid = false;
      }
    }
    
    if(!(invit.telefono || '').trim()){
      validationErrors.telefono = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{10}$/.test(invit.telefono)){
      validationErrors.telefono = "Se requieren al menos 10 números.";
      isValid = false;
    }
    if(!invit.id_catv){
      validationErrors.id_catv = "Este campo es obligatorio.";
      isValid = false;
    }

    // Validación condicional si el checkbox está marcado
    if(checked){
      
      if(!(invit.no_licencia || '').trim()){
        validationErrorsAuto.no_licencia = "Este dato es obligatorio.";
        isValid = false;
      } else if(!/^\d{12}$/.test(invit.no_licencia)){
        validationErrorsAuto.no_licencia = "Se requieren al menos 12 números.";
        isValid = false;
      }
      if(!(invit.marca || '').trim()){
        validationErrorsAuto.marca = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(invit.modelo || '').trim()){
        validationErrorsAuto.modelo = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(invit.anio || '').trim()){
        validationErrorsAuto.anio = "Este dato es obligatorio.";
        isValid = false;
      } else if(!/^\d{4}$/.test(invit.anio)){
        validationErrorsAuto.anio = "Se requieren al menos 4 números.";
        isValid = false;
      }
      if (!(invit.placa || '').trim()) {
        validationErrorsAuto.placa = "Este dato es obligatorio.";
        isValid = false;
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/i.test(invit.placa)) {
        validationErrorsAuto.placa = "Debe tener 6 caracteres, incluyendo letras y números.";
        isValid = false;
      }
      /*if(!(invit.seguro || '').trim()){
        validationErrorsAuto.seguro = "Este dato es obligatorio.";
        isValid = false;
      } else if(!/^\d{8,13}$/.test(invit.seguro)){
        validationErrorsAuto.seguro = "Se requieren de 8 a 13 números.";
        isValid = false;
      }*/
    }

    setErrorVisita(validationErrors);
    setErrorVisitaAuto(validationErrorsAuto);
    return isValid;
}

  const SaveVisitante = () => {
    if(validateVisitante() ){
      createInvitado();
    }else{
      console.log('error en la validacion')
    }
  }

  const inputChange = (event) => {
    const { name, value } = event.target;
    
    setInvit((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    //setInvit({ ...invit, [e.target.name]: e.target.value });
  };


  const handleDropdownChangeTipo = (event) => {
    const selectedValue = event.target.value;
    setSelectCategorias(selectedValue);
    setInvit((prevState) => ({
      ...prevState,
      id_catv: selectedValue?.id_catv || "",
      //id_catv: selectedValue || "",
    }));
  };

  const handleCheckboxChange = (e) => {
    setChecked(e.target.checked); 
    
};

const createVehiculo = async () => {
  const dataMayusculas = convertirATextoMayusculas(vehiculo);

  try {
    const response = await axios.post(`${api}/create/vehiculo`, dataMayusculas, {
      headers: { 'Content-Type': 'application/json'}
    });
    console.log('Guardado extoso', response.data);
    window.location.reload();
  } catch (error) {
    console.log('error al registra vehiculo');
  }
}

const [vehiculo, setVehiculo] = useState({
  empresa: "",
  marca: "",
  modelo: "",
  placa: "",
  anio: "",
  seguro: "",
});


const validateVehiculo = () => { 
  let validationErrors = {};
  let isValid = true;

  
    if(!(vehiculo.empresa || '').trim()){
      validationErrors.empresa = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!(vehiculo.marca || '').trim()){
      validationErrors.marca = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!(vehiculo.modelo || '').trim()){
      validationErrors.modelo = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!(vehiculo.anio || '').trim()){
      validationErrors.anio = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{4}$/.test(vehiculo.anio)){
      validationErrors.anio = "Se requieren al menos 4 números.";
      isValid = false;
    }
    if (!(vehiculo.placa || '').trim()) {
      validationErrors.placa = "Este dato es obligatorio.";
      isValid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/i.test(vehiculo.placa)) {
      validationErrors.placa = "Debe tener 6 caracteres, incluyendo letras y números.";
      isValid = false;
    }

  setErrorVehiculo(validationErrors);
  return isValid;
}

const SaveVehiculo = () => {
  if(validateVehiculo() ){
    createVehiculo();
  }else{
    console.log('error en la validacion')
  }
}

const inputChangeVehiculo = (event) => {
  const { name, value } = event.target;
  
  setVehiculo((prevState) => ({
    ...prevState,
    [name]: value,
  }));
  //setInvit({ ...invit, [e.target.name]: e.target.value });
};

  const tomarFoto1 = () => {
    const screenshot = webcamRef.current.getScreenshot();
    const imageBlob = dataURLtoBlob(screenshot);
    const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" }); 
    setImage(imageFile);
  };

  const tomarFoto = () => {
    if (webcamRef.current && isCameraReady) {
      const screenshot = webcamRef.current.getScreenshot();
      const imageBlob = dataURLtoBlob(screenshot);
      const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" });
      setImage(imageFile);
    } else {
      //alert("La cámara no está lista.");
    }
  };

  const dataURLtoBlob1 = (dataURL) => {
    const parts = dataURL.split(",");
    const mime = parts[0].match(/:(.*?);/)[1];
    const binary = atob(parts[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
  };

  const dataURLtoBlob = (dataURL) => {
    const parts = dataURL.split(",");
    const mime = parts[0].match(/:(.*?);/)[1];
    const binary = atob(parts[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
  };
  

  const tomarFotoUpdate = () => {
    if (webcamRef.current && isCameraReady) {
      const screenshot = webcamRef.current.getScreenshot();
      const imageBlob = dataURLtoBlob(screenshot);
      const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" });
      setImageUp(imageFile);
    } else {
     // alert("La cámara no está lista.");
    }
    
  };

  const tomarFotoProveedor = () => {
    if (webcamRef.current && isCameraReady) {
      const screenshot = webcamRef.current.getScreenshot();
      const imageBlob = dataURLtoBlob(screenshot);
      const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" });
      setImageProv(imageFile);
    } else {
      //alert("La cámara no está lista.");
    }
    
  };

  const handleUserMedia1 = () => {
    if (webcamRef.current) {
        setIsCameraReadyUp(true);
        console.log("Cámara lista y funcionando");

        // Información del dispositivo
        const videoTrack = webcamRef.current.stream?.getVideoTracks()?.[0];
        if (videoTrack) {
            console.log("Usando cámara:", videoTrack.label);
        }
    }
};

  // const handleUserMediaError = (error) => {
  //   console.error("Error al acceder a la cámara:", error);
  // };
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user", // Por defecto, cámara frontal
  });
 

  const seleccionarCamaraUSB = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
  
      console.log("Cámaras disponibles:", videoDevices);
  
      // Seleccionar cámara USB por nombre (si sabes el nombre)
      const usbCamera = videoDevices.find((device) =>
        device.label.toLowerCase().includes("usb")
      );
  
      // Si encuentras una cámara USB, configúrala
      if (usbCamera) {
        setVideoConstraints({ deviceId: { exact: usbCamera.deviceId } });
        console.log("Cámara USB seleccionada:", usbCamera.label);
      } else if (videoDevices.length > 0) {
        // Si no encuentras una cámara USB, selecciona la primera disponible
        setVideoConstraints({ deviceId: { exact: videoDevices[0].deviceId } });
        console.log("Cámara predeterminada seleccionada:", videoDevices[0].label);
      } else {
        //alert("No se encontraron cámaras disponibles.");
      }
    } catch (error) {
      console.error("Error al enumerar dispositivos:", error);
      //alert("Error al acceder a las cámaras. Verifica los permisos.");
    }
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
    setIsCameraReadyUp(true);
  };

  const handleUserMediaError = (error) => {
    console.error("Error al acceder a la cámara:", error);
  };

  useEffect(() => {
    seleccionarCamaraUSB();
  }, []);

  const onTemplateSelect1 = (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log("Archivo cargado:", file);
        setImage(file);
    } else {
        console.error("No se seleccionó ningún archivo.");
    }
};

  const removeImage = () => {
    setImage(null);
  };

  const onTemplateSelectUp = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Archivo cargado:", file);
      setImage(file);
    } else {
      console.error("No se seleccionó ningún archivo.");
    }
  };

  const removeImageUp = () => {
    setImageUp(null);
  };
  const removeImageProv = () => {
    setImageProv(null);
  };
  const handleClickOpenCam = () => {
    setOpenCam(true);
  };

  const handleCloseCam = () => {
    setOpenCam(false);
  };

  const handleClickOpenCamUp = (visita) => {
    console.log('El objeto visita contiene el campo id_visit:', visita);
    if (!visita.clave) {
      console.error('El objeto visita no contiene el campo id_visit:', visita);
      return;
  }
  setSelectedVisitante(visita);
  setOpenCamUp(true);
  };

  const handleClickOpenCamProv = (visita) => {
    console.log('El objeto visita no contiene el campo id_visit:', visita);
    if (!visita.clave) {
      console.error('El objeto visita no contiene el campo id_visit:', visita);
      return;
  }
  setSelectedProveedor(visita);
  setOpenCamUpDatos(true);
  };

  const handleCloseCamUp = () => {
    setOpenCamUp(false);
    setImageUp(null);
  };
  const handleCloseCamProv = () => {
    setOpenCamUpDatos(false);
    setImageProv(null);
  };
  const handleOpenMultaFinalizar = (visita) => {
    if (!visita.id_visit) {
      console.error('El objeto visita no contiene el campo id_visit:', visita);
      return;
    } 
    setSelectedVisitaSalida(visita);
    setOpenMultaFinalizar(true);
  };
  const handleCloseMultaFinalizar = () => {
    setOpenMultaFinalizar(false);
    setOpenBloqueo(false);
  };
  
  
  const handleClickOpenCreateIn = () => {
    setOpenCreateInvitado(true);
  };
  const handleClickOpenPaqueteria = () => {
    setOpenCreatePaqueteria(true);
  };

  const handleClickClosePaqueteria = () => {
    setOpenCreatePaqueteria(false);
    setSelectedPaqueteria(null);
    setSelectedCortina(null);
    setPaq({
      id_catv: '', 
      nombre: '',
      apellidos: '',
      empresa:'',
      reg_entrada: '',
      motivo: '',
      area_per: '',
      no_ine: '',
      marca:'',
      placa:'',
      acompanantesPaq:[]
    })
  };

  const handleClickCloseCliente = () => {
    setOpenCreateCliente(false);
    setSelectedPaqueteria(null);
    setSelectedCortina(null);
    setPaq({
      id_catv: '', 
      nombre: '',
      apellidos: '',
      empresa:'',
      reg_entrada: '',
      motivo: '',
      area_per: '',
      no_ine: '',
      marca:'',
      placa:'',
      acompanantesPaq:[]
    })
  };

  const handleCloseCreateIn = () => {
    setOpenCreateInvitado(false);
    setSelectCategorias(null);
    setImage(null);
    setInvit({
      id_catv: 0,
      nombre: "",
      apellidos:"",
      empresa: "",
      telefono: "",
      foto: "",
      no_licencia: "",
      no_ine: "",
      marca: "",
      modelo: "",
      placa: "",
      anio: "",
      seguro: "",
    });
  };
  const handleClickOpenCreateTransp = () => {
    setOpenCreateTransp(true);
    setImage(null);
    setTransp({
        id_catv: "5",
        nombre: "",
        apellidos:"",
        foto: "", 
        empresa: "",
        telefono:"",
        no_licencia:"",
        no_ine:"",
        marca:"",
        modelo:"",
        placa: "",
        anio:"",
        seguro:"",
      });
  };

  const onCloseGenEtiqueta = () => {
    setOpenGenerarAcceso(false);
  }
  const handleCloseCreateTransp = () => {
    setOpenCreateTransp(false);
    setSelectCategoriasMT(null);
    //setTransp('')
  };
  const handleClickOpenCreateVisita = () => {
    getVisitantes();
    setOpenCreateVisita(true);
  };
  const handleClickOpenCreateVisita2 = () => {
    setOpenCreateInvitado(false);
    setOpenCreateVisita(true);
  };
  

  const handleCloseCreateVisita = () => {
    handleCloseCreateIn();
    setOpenCreateVisita(false);
    setSelectedAcs(null);
    setSelectedPR(null);
    setSelectedArea(null);
    setImage(null);
    setVisita({ 
      id_vit: '', 
      reg_entrada: '',  
      hora_entrada: '',
      motivo: '',
      area_per: '',
      personal: '',
      nom_com: []
    });
  };
  const handleClickOpenAcceso = (visita) => {
    if (!visita.clave) {
        console.error('El objeto visita no contiene el campo clave:', visita);
        return;
    }
    setSelectedVisita(visita);
    setOpenGenerarAcceso(true);
  };

  const handleClickOpenRegAcomp = (visita) => {
    console.log('El objeto visita no contiene el campo id_visit:', visita);
    if (!visita.clave) {
        console.error('El objeto visita no contiene el campo clave:', visita);
        return;
    }
    setSelectedVisita(visita);
    setOpenRegAcomp(true);
  };

  const handleCloseRegAcomp = () => {
    setOpenRegAcomp(false); 
    setSelectedVisita(null);
    setVitAcomp({
      nombre_acomp:'',
      apellidos_acomp:'',
      no_ine_acomp:''
    })
  };

  const handleCloseAcceso = () => {
    setOpenGenerarAcceso(false); 
    setSelectedVisita(null);
  };
  //validar vehiculo
  const handleClickOpenValidarVehiculo = (visita) => {
    if (!visita.clave) {
        console.error('El objeto visita no contiene el campo clave:', visita);
        return;
    }
    setSelectedVisita(visita);
    setOpenValidarVehiculo(true);
  };
  const handleCloseValidarVehiculo = () => {
    setOpenValidarVehiculo(false); 
    setSelectedVisita(null);
    setComentario('');
    setImages({
      img1: '',
    img2:'',
    img3:'',
    img4:''
    })
  };

  const handleCloseValidarProveedor = () => {
    setOpenValidarVehiculo(false); 
    setSelectedVisita(null);
    setComentario('');
    setImageProv(null)
  };

  const handleCloseCamVehiculos = () => {
    setOpenCamVehiculo(false);
  };

  const handleClickOpenCamVehiculo = (index) => {
    setCurrentImageIndex(index);
    setOpenCamVehiculo(true);
  };
  const tomarFotoVehiculo = () => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot(); // Captura la imagen como base64
        if (imageSrc) {
            // Convierte el base64 a un Blob
            const imageBlob = dataURLtoBlobVehiculos(imageSrc);

            // Crea un archivo a partir del Blob
            const imageFile = new File([imageBlob], `foto${currentImageIndex + 1}.jpg`, {
                type: "image/jpeg",
            });

            // Actualiza el estado de imágenes con la base64 para previsualización
            setImages((prevImages) => ({
                ...prevImages,
                [`img${currentImageIndex + 1}`]: imageSrc, // Guarda la imagen base64
            }));

            // Opcional: Guarda el archivo si necesitas enviar los blobs/archivos directamente
            // Puedes agregar una lógica aquí si lo necesitas.
        }
    }
    setOpenCamVehiculo(false); // Cierra la cámara
};
const dataURLtoBlobVehiculos = (dataURL) => {
  const byteString = atob(dataURL.split(",")[1]);
  const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
};

const handleFileChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prevImages) => ({
        ...prevImages,
        [Object.keys(images)[index]]: reader.result, // Actualizar la imagen correspondiente
      }));
    };
    reader.readAsDataURL(file); // Leer la imagen como base64
  }
};

const removeImageVehiculo = (index) => {
  setImages((prevImages) => ({
      ...prevImages,
      [`img${index + 1}`]: ''
  }));
};
const [conductor, setConductor] = useState(
  {
    nombre_acomp: '',
    apellidos_acomp: '',
    no_ine_acomp: ''
  }
)
const handleFinalizar = async () => {

  const toUpperCase = (value) => {
    return value ? value.toUpperCase() : value;
  };

  try {
    const formData = new FormData();

    if (selectedVisita.clave.startsWith("PR")) {
      //formData.append('id_vit', selectedVisita.clave);
      formData.append('id_veh', selectedVisita.contenedor);
    } else {
      formData.append('id_veh', selectedVisita.id_veh);
    }

    // Agregar imágenes al formData
    Object.entries(images).forEach(([key, base64]) => {
      if (base64) {
        const imageBlob = dataURLtoBlob(base64); 
        formData.append(key, new File([imageBlob], `${key}.jpg`, { type: "image/jpeg" }));
      }
    });

    if (!images.img1 || !images.img2 || !images.img3 || !images.img4) {
      console.log("Debe agregar las 4 imágenes obligatorias.");
      setShowErrorAlertImgs(true); // Mostrar alerta de error
      setTimeout(() => {
        setShowErrorAlertImgs(false);
      }, 1000);
      return;
    }

    // Agregar otros datos al formData, asegurándose de convertir todo a mayúsculas
    formData.append('comentario', toUpperCase(comentario));
    formData.append('id_visit', selectedVisita.id_visit);
    formData.append('id_usu', user.id_usu);
    formData.append('clave_visit', selectedVisita.clave_visit);
    
    formData.append('id_vit', toUpperCase(selectedVisita.clave));
    formData.append('proveedor', 'S');

    // Realizar la solicitud
    const response = await axios.post(`${api}/up/imgs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 201) {
      setShowSuccessAlertImgs(true);
      setTimeout(() => {
        setShowSuccessAlertImgs(false);
      }, 1000);
      //setOpenGenerarAcceso(true);
      window.location.reload();
    }
  } catch (error) {
    console.error('Error al guardar la información:', error);
    setShowErrorAlertImgs(true);
    setTimeout(() => {
      setShowErrorAlertImgs(false);
    }, 1000);
  }
};


const handleFinalizarProveedor = async () => {
  if(!validateProveedor()){
    console.error("Existen errores en el formulario.");
    return;
  }

  const toUpperCase = (value) => {
    return value ? value.toUpperCase() : value;
  };

  try {
    const formData = new FormData();

    if (selectedProveedor.clave.startsWith("PR")) {
      formData.append('id_vit', selectedProveedor.clave);
      formData.append('id_veh', selectedProveedor.contenedor);
    } else {
      formData.append('id_veh', selectedProveedor.id_veh);
    }

    if (imageProv) {
      formData.append('foto', imageProv);
    } else {
        console.error("No se ha seleccionado ninguna imagen.");
        return;
    }

    formData.append('id_visit', selectedProveedor.id_visit);
    //formData.append('id_usu', user.id_usu);
    formData.append('clave_visit', selectedProveedor.clave_visit);

    // Agregar datos del acompañante en mayúsculas
    formData.append('nombre_acomp', toUpperCase(conductor.nombre_acomp));
    formData.append('apellidos_acomp', toUpperCase(conductor.apellidos_acomp));
    formData.append('no_ine_acomp', toUpperCase(conductor.no_ine_acomp));
    
    formData.append('clave', toUpperCase(selectedProveedor.clave));
    formData.append('proveedor', 'S');

    // Realizar la solicitud
    const response = await axios.put(`${api}/up/foto/proveedor`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Guadado con exito', response.data);
    handleClickOpenAcceso(selectedProveedor);;
  } catch (error) {
    console.error('Error al guardar la información:', error);
    setShowErrorAlertImgs(true);
    setTimeout(() => {
      setShowErrorAlertImgs(false);
    }, 1000);
  }
};

const validateProveedor = () => {
  const errors = {};
  
    if(!(conductor.nombre_acomp || '').trim()) {
      errors.nombre_acomp = "Este dato es obligatorio.";
    }
    if (!(conductor.apellidos_acomp || '').trim()) {
      errors.apellidos_acomp = "Este dato es obligatorio.";
    } else if (!/\b\w+\b\s+\b\w+\b/.test(conductor.apellidos_acomp.trim())) {
      errors.apellidos_acomp = "Debe ingresar los dos apellidos.";
    }if(!(conductor.no_ine_acomp || '').trim()){
      errors.no_ine = "Este dato es obligatorio.";
    } else if(!/^\d{12,13}$/.test(conductor.no_ine_acomp)){
      errors.no_ine_acomp = "Se requieren al menos 12 números.";
    }
  
  setErrorProveedor(errors);
  return Object.keys(errors).length === 0; 
};
  const handleClickOpenUpExcel = () => {
    setOpenUpExcel(true);
  };

  const handleCloseUpExcel = () => {
    setOpenUpExcel(false);
  };

  const handleClickOpenUpExcelVeh = () => {
    setOpenUpExcelVeh(true);
  };

  const handleCloseUpExcelVeh = () => {
    setOpenUpExcelVeh(false);
  };
  const handleCloseNewVeh = () => {
    setOpenNewVeh(false);
  };

  const handleOpenNewVeh = () => {
    setOpenUpExcelVeh(false);
    setOpenNewVeh(true);
  };

  const handleCloseSave = (reason ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  const handleClickOpenSalida = (visitante) => {
    if (!visitante.id_visit) {
      console.error('El objeto visita no contiene el campo id_visit:', visitante);
      return;
    } 
    setSelectedVisitaSalida(visitante);
    setOpenSalida(true);
  };

  const handleClickOpenBloquear = (visitante) => {
    if (!visitante.id_visit) {
      console.error('El objeto visita no contiene el campo id_visit:', visitante);
      return;
    } 
    setSelectedVisitaBloqeo(visitante);
    setOpenBloqueo(true);
  };
  const handleCloseSalida = () => {
    
    //setSelectedVisitaSalida(null);
    setOpenSalida(false);
  };
  const handleCloseBloqueo = () => {
    
    //setSelectedVisitaSalida(null);
    setOpenBloqueo(false);
    setSelectedConMulta(null);

  };
  const handleCloseExcesoTiempo = () => {
    
    //setSelectedVisitaSalida(null);
    setOpenExcesoTiempo(false);
  };
  
  const handleCloseVisitaAgendada = () => {
    
    setOpenVisitaAgendada(false);
    window.location.reload();
  };
  const handleCloseVisitaAgendadaError = () => {
    
    setOpenVisitaAgendada(false);
  };
  const handleCloseUpExcelInfo = () => {
    
    setOpenUpExcelInfo(false);
    window.location.reload();
  };

  const createAcompañantes = async () => {
    const invitMayusculas = convertirATextoMayusculas(vitAcomp);
    const formData = new FormData();
    
    Object.entries(invitMayusculas).forEach(([key, value]) => {
      formData.append(key, value);
    });
  
    formData.append('id_vit', selectedVisita.id_vit);
    formData.append('id_visit', selectedVisita.id_visit);
    formData.append('clave_visit', selectedVisita.clave_visit);
  
    try {
      const response = await axios.post(`${api}/create/acomp`, formData,  {
        headers: { 'Content-Type': 'application/json'},
      });
      console.log('Guardado exitoso', response.data);
      //window.location.reload();
      
      Swal.fire({
        //title:'Registro exitoso.',
        text: 'Acompañante registrado con éxito.',
  
        icon: "success",
        confirmButtonText: "CERRAR",
        confirmButtonColor: "#6dba27",
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
          }
        }
      }).then(() => {
       window.location.reload();
      })
  
    } catch (error) {
      console.error('Error al registrar visita:', error.response?.data || error.message);
    }
  };
// useEffect(() => {
//   fetchAcompañantes();
// }, []);
// const fetchAcompañantes = async () => {
//   try {
//     const response = await axios.get(`${api}/get/acomp`, {
//       params: { id_visit: selectedVisita.id_visit }
//     });
//     setAcompañantes(response.data); // Actualiza el estado con los nuevos datos
//   } catch (error) {
//     console.error("Error al obtener acompañantes:", error);
//   }
// };
const [vitAcomp, setVitAcomp] = useState(
  { 
      nombre_acomp: '',
      apellidos_acomp: '',
      no_ine_acomp: '',
      
      
  }
);

const validateVisitaAcomp = () => { 
  let validationErrors = {};
  let isValid = true;

  
  if (!vitAcomp.nombre_acomp || !vitAcomp.nombre_acomp.trim()) {
    validationErrors.nombre_acomp = "Este dato es obligatorio.";
    isValid = false;
  }

  if (!vitAcomp.apellidos_acomp || !vitAcomp.apellidos_acomp.trim()) {
    validationErrors.apellidos_acomp = "Este dato es obligatorio.";
    isValid = false;
  } else if (!/^(\w+\s+\w+).*$/i.test(vitAcomp.apellidos_acomp.trim())) {
    validationErrors.apellidos_acomp = "Debes ingresar los dos apellidos.";
    isValid = false;
  }

  if (!vitAcomp.no_ine_acomp || !vitAcomp.no_ine_acomp.trim()) {
    validationErrors.no_ine_acomp = "Este dato es obligatorio.";
    isValid = false;
  } else if (!/^\d{10,13}$/.test(vitAcomp.no_ine_acomp)) {
    validationErrors.no_ine_acomp = "Se requieren al menos 10 números.";
    isValid = false;
  }
  
  setErrorVisitaAcomp(validationErrors);
  return isValid;
}

const inputChangeAcomp = (event) => {
  const { name, value } = event.target;
  
  setVitAcomp((prevState) => ({
    ...prevState,
    [name]: value,
    
  }));
};

const SaveVisitanteAcomp = () => {
  if(validateVisitaAcomp() ){
    createAcompañantes(); 
  }else{
    console.log('error en la validacion')
  }
};
const createVisitaPaqueteria = async () => {

  let acompanantesPaqData = [];
  let id_catv = paq.id_catv;

  if (checkedPaq) {
    acompanantesPaqData = acompanantesPaq.map((acomp) => ({
      nombre_acomp: acomp.nombre_acomp,
      apellidos_acomp: acomp.apellidos_acomp,
      no_ine_acomp: acomp.no_ine_acomp,
    }));
  }

  if ([1, 2, 3, 4, 5].includes(paq.empresa)) {
    id_catv = 7;
  } if ([6].includes(paq.empresa)) {
    id_catv = 13;
  }else if([7,8].includes(paq.empresa)){
    id_catv = 11;
  }

  const data = {
    ...paq,
    id_catv, 
    acompanantesPaq: acompanantesPaqData,
  };

  const invitMayusculas = convertirATextoMayusculas(data);

  
  try {
      
      const response = await axios.post(`${api}/create/visita/pq`, invitMayusculas);
      console.log('Guardado exitoso', response.data);
      //setOpenVisitaAgendada(true);
      window.location.reload();
      
  } catch (error) {
      console.error('Error al registrar visita:', error.response?.data || error.message);
      setShowErrorAlertPlaca(true);
      setTimeout(() => setShowErrorAlertPlaca(false), 5000); 
      //setErrorVisitaPaqueteria(error.response?.data || error.message);
  }
};

const [paq, setPaq] = useState(
  {
      id_catv: 7, 
      nombre: '',
      apellidos: '',
      empresa:'',
      motivo: '',
      area_per: 0,
      no_ine: '',
      no_licencia: '',
      marca:'',
      placa:'',
      acompanantesPaq:[],
      no_ide:'',
  }
);

const validateVisitantePaqueteria = () => { 
  let validationErrors = {};
  let isValid = true;

  // Validación de los campos generales
  if(!paq.empresa){
    validationErrors.empresa = "Este campo es obligatorio.";
    isValid = false;
  }
  if(!(paq.nombre || '').trim()) {
    validationErrors.nombre = "Este dato es obligatorio.";
    isValid = false;
  }
  if (!(paq.apellidos || '').trim()) {
    validationErrors.apellidos = "Este dato es obligatorio.";
    isValid = false;
  } else if (!/^(\w+\s+\w+).*$/i.test(paq.apellidos.trim())) {
    validationErrors.apellidos = "Debes ingresar los dos apellidos.";
    isValid = false;
  }
  
  if(!(paq.no_ide || '').trim()){
    validationErrors.no_ide = "Este dato es obligatorio.";
    isValid = false;
  } else if(!/^\d{10,13}$/.test(paq.no_ide)){
    validationErrors.no_ide = "Se requieren al menos 10 números.";
    isValid = false;
  }
  if(!(paq.motivo || '').trim()) {
    validationErrors.motivo = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!paq.area_per){
    validationErrors.area_per = "Este campo es obligatorio.";
    isValid = false;
  }
  

  if (checkedPaq) {
    acompanantesPaq.forEach((acompanante, index) => {
      if (!acompanante.nombre_acomp || !acompanante.nombre_acomp.trim()) {
        validationErrors[`nombre_${index}`] = `El nombre del acompañante ${index + 1} es obligatorio.`;
        isValid = false;
      }
      if (!acompanante.apellidos_acomp || !acompanante.apellidos_acomp.trim()) {
        validationErrors[`apellidos_${index}`] = `Los apellidos del acompañante ${index + 1} son obligatorios.`;
        isValid = false;
      }
      if (!acompanante.no_ine_acomp || !acompanante.no_ine_acomp.trim()) {
        validationErrors[`no_ine_${index}`] = `El número de identidifación del acompañante ${index + 1} es obligatorio.`;
        isValid = false;
      }
    });
  }
  
  if(selectedPaqueteria.id_paq ==! 8) {
    if(!(paq.marca || '').trim()){
      validationErrors.marca = "Este dato es obligatorio.";
      isValid = false;
    }
    
    if (!(paq.placa || '').trim()) {
      validationErrors.placa = "Este dato es obligatorio.";
      isValid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/i.test(paq.placa)) {
      validationErrors.placa = "Debe tener 6 caracteres, incluyendo letras y números.";
      isValid = false;
    }
  }
  

  
  if (!checkedIne && !checkedLic) {
    validationErrors.checks = "Debes seleccionar al menos una opción (No. INE o No. Licencia).";
    isValid = false;
  }

  setErrorVisitaPaqueteria(validationErrors);
  return isValid;
}

const SaveVisitantePaqueteria = () => {
  if(validateVisitantePaqueteria() ){
    createVisitaPaqueteria();
  }else{
    console.log('error en la validacion')
  }
};

const handleDropdownChangePP = (value) => {
  setSelectedPaqueteria(value);
  setPaq((prevState) => ({
      ...prevState,
      empresa: value?.id_paq || '',
  }));
};

const inputChangePaq = (event) => {
  const { name, value } = event.target;
  
  setPaq((prevState) => ({
    ...prevState,
    [name]: value,
    
  }));
};

const handleCheckboxChangeIne = (type) => {
  setPaq((prevState) => ({
    ...prevState,
    no_ine: type === "ine" ? prevState.no_ide : "",
    no_licencia: type === "lic" ? prevState.no_ide : "",
  }));

  if (type === "ine") {
    setCheckedIne(true);
    setCheckedLic(false);
  } else {
    setCheckedIne(false);
    setCheckedLic(true);
  }
};

const newVisita = async () => {
  // Determina el valor final de `personal`.
  const personalFinal = 
    visita.personal || 
    (selectedAcs?.categoria === "TRANSPORTISTA" || selectedAcs?.categoria === "PAQUETERIA" ? "LAURA RODRIGUEZ" : "");

  // Función para transformar todos los valores de un objeto a mayúsculas.
  const transformarAMayusculas = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Si no es un objeto, devolver el valor tal cual.
    }

    if (Array.isArray(obj)) {
      return obj.map(transformarAMayusculas); // Si es un array, procesar cada elemento.
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.toUpperCase() : transformarAMayusculas(value),
      ])
    );
  };

  // Construcción del objeto de datos, incluyendo `personal` y `acompanantes`.
  const data = {
    ...visita,
    personal: personalFinal,
    acompanantes: acompanantes.map((acomp) => ({
      nombre_acomp: acomp.nombre_acomp,
      apellidos_acomp: acomp.apellidos_acomp,
      no_ine_acomp: acomp.no_ine_acomp,
    })),
  };

  // Transforma los datos a mayúsculas.
  const dataMayusculas = transformarAMayusculas(data);

  try {
    // Enviar los datos al endpoint de la API.
    const response = await axios.post(`${api}/create/visita`, dataMayusculas);
    console.log('Guardado exitoso', response.data);
    setErrorVisita(response.data.error);
    let msg = response.data.error;
    // Si la respuesta tiene error, muestra el mensaje de error en el modal.
    if (response.data.success === false) {
      Swal.fire({
        title: "Error",
        //text: "Ocurrio un error. Intenta nuevamente.",
        text: msg,
        icon: "error",
        confirmButtonText: "Cerrar",
        //confirmButtonColor: "#6dba27",
        confirmButtonColor: "#dd6b55",
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
          }
        }
      }).then(() => {
        //getLista()
       window.location.reload();
      })
      //
    } else {
      Swal.fire({
        title:'Visita agendada con exito.',
        icon: "success",
        confirmButtonText: "CERRAR",
        confirmButtonColor: "#6dba27",
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
          }
        }
      }).then(() => {
        //getLista()
       window.location.reload();
      })// Muestra el modal de éxito
    }
  } catch (error) {
    let errorVisita = error.response?.data.error;
    Swal.fire({
      //title: "Error",
      text: errorVisita,
      //text: msg,
      icon: "warning",
      confirmButtonText: "CERRAR",
      //confirmButtonColor: "#6dba27",
      confirmButtonColor: "#FFA500",
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
        }
      }
    }).then(() => {
      //getLista()
     window.location.reload();
    })
    console.error('Error al registrar visita:', error.response?.data || error.message);
    //setErrorVisita(error.response?.data || error.message); 
    //setOpenVisitaAgendada(true);
  }
};

const [visita, setVisita] = useState(
    {
        id_vit: '', 
        reg_entrada: '',  
        hora_entrada:'',
        motivo: '',
        area_per: '',
        personal: '',
        acompanantes:[],

        access: '',
        id_veh: '',
        motivo_acc: '',
    }
);
const validateVisita = () => {
  let validationErrors = {};
  let isValid = true;

  if(!visita.reg_entrada.trim()) {
    validationErrors.reg_entrada = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!visita.hora_entrada.trim()){
    validationErrors.hora_entrada = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!visita.motivo.trim()){
    validationErrors.motivo = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!visita.area_per){
    validationErrors.area_per = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!visita.personal.trim() && selectedAcs?.categoria !== "TRANSPORTISTA" && selectedAcs?.categoria !== "PAQUETERIA")  {
    validationErrors.personal = "Este dato es obligatorio.";
    isValid = false;
  }
  if(!visita.id_vit){
    validationErrors.id_vit = "Este campo es obligatorio.";
    isValid = false;
  }

  if (checkedVisita) {
    acompanantes.forEach((acompanante, index) => {
      if (!acompanante.nombre_acomp || !acompanante.nombre_acomp.trim()) {
        validationErrors[`nombre_${index}`] = `El nombre del acompañante ${index + 1} es obligatorio.`;
        isValid = false;
      }
      if (!acompanante.apellidos_acomp || !acompanante.apellidos_acomp.trim()) {
        validationErrors[`apellidos_${index}`] = `Los apellidos del acompañante ${index + 1} son obligatorios.`;
        isValid = false;
      }
      if (!acompanante.no_ine_acomp || !acompanante.no_ine_acomp.trim()) {
        validationErrors[`no_ine_${index}`] = `El número de INE del acompañante ${index + 1} es obligatorio.`;
        isValid = false;
      }
    });
  }

  if(accesos.placa) {
    if(!visita.motivo_acc.trim()){
      validationErrors.motivo_acc = "Este dato es obligatorio.";
      isValid = false;
    }
  }
  setErrorVisitas(validationErrors);

  return isValid;
}

const saveVisitas = () => {
  if(validateVisita()){
    newVisita();
  }else{
    console.log('error en la validacion')
  }
}

const handleDateChange = (value) => {
    const formattedDate = value.format('YYYY-MM-DD'); 
    const [year, month, day] = formattedDate.split('-');
    const shortFormattedDate = `${year.slice(2)}/${month}/${day}`;

    setDate(value);
    setVisita((prevState) => ({
      ...prevState,
      reg_entrada: shortFormattedDate,
    }));
  };

  const handleTimeChange = (value) => {
    if (!value) {
      setTime(null);
      setVisita((prevState) => ({
        ...prevState,
        hora_entrada: '',
      }));
      return;
    }

    const formattedTime = value.format('hh:mm A'); 

    setTime(value);
    setVisita((prevState) => ({
      ...prevState,
      hora_entrada: formattedTime,
    }));
  };


const handleDropdownChange = (value) => {
    setSelectedAcs(value);
    setVisita((prevState) => ({
        ...prevState,
        id_vit: value?.clave || '',
        id_veh: value?.id_veh || '',
    }));
};

const inputChangeVis = (event) => {
    const { name, value } = event.target;
    setVisita((prevState) => ({
        ...prevState,
        [name]: value,
    }));
};

const handleDropdownChangeArea = (event) => {
  const selectedValue = event.target.value;
  setSelectedArea(selectedValue);
  setVisita((prevState) => ({
    ...prevState,
    area_per: selectedValue?.id_area || "",
  }));
}; 
const handleCheckboxChangeAccess = (e) => {
  const isCheckedAcc = e.target.checked;
  setCheckedAcceso(isCheckedAcc);
  setVisita((prev) => ({
    ...prev,
    access: isCheckedAcc ? 1 : 0,
  }));
};

const inputChangeAccess = (value) => {
  setSelectedAcs(value);
  setVisita((prevState) => ({
      ...prevState,
      id_veh: value?.id_veh || '',
  }));
}; 

const handleInputChange = (index, updatedFields) => {
  const nuevosAcompanantes = [...acompanantes];
  nuevosAcompanantes[index] = {
    ...nuevosAcompanantes[index],
    ...updatedFields,
  };
  setAcompanantes(nuevosAcompanantes);
};

const agregarAcompanante = () => {
    setAcompanantes([...acompanantes, { nombre: "", apellidos: '', no_ine:'' }]);
};

const eliminarAcompanante = (index) => {
    const nuevosAcompanantes = acompanantes.filter((_, i) => i !== index);
    setAcompanantes(nuevosAcompanantes);
};

const validarVisita = async (idVisit) => {
  try {
    const idV = idVisit.id_visit;
     

    const response = await axios.put(
      `${api}/llegada/${idV}`,
      { llegada: 'S',},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Actualización exitosa:', response.data);
    //alert('Datos actualizados correctamente.');
    window.location.reload();
  } catch (error) {
    console.error('Error al actualizar los datos:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 500) {
      console.log('Error en el servidor. Por favor, intente nuevamente.');
    } else {
      console.log('Error al actualizar los datos. Por favor, intente nuevamente.');
    }
  }
};

const validar = async (idVisit) => {
  try {
    const idV = idVisit.id_visit;
     

    const response = await axios.put(
      `${api}/validar/${idV}`,
      { validar: 'S',},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Actualización exitosa:', response.data);
    //alert('Datos actualizados correctamente.');
    window.location.reload();
  } catch (error) {
    console.error('Error al actualizar los datos:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 500) {
      console.log('Error en el servidor. Por favor, intente nuevamente.');
    } else {
      console.log('Error al actualizar los datos. Por favor, intente nuevamente.');
    }
  }
};

const darAcceso = async (idVisit, estado) => {
  try {
    const response = await axios.put(
      `${api}/up/acceso/${idVisit}`,
      {
        est: estado,
        id_usu_ac: user.id_usu,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Actualización exitosa:', response.data);
    //return true; // Indicar éxito
    window.location.reload();
  } catch (error) {
    console.error('Error al actualizar los datos:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return false;
  }
};

const handleGenerateImage = async () => {
  const idVisit = selectedVisita.id_visit;
  const estado = "A";

  if (!selectedVisita) {
    console.error("selectedVisita no está definida");
    return;
  }

  const nombre =
    selectedVisita.tipo === "PROVEEDOR (IMPORTACIONES/NACIONALES)"
      ? selectedVisita.nombre_com_acomp || "PROVEEDOR"
      : selectedVisita.nombre_completo;

  const empresa =
    selectedVisita.id_catv === 2 || selectedVisita.id_catv === 4 || selectedVisita.id_catv === 13
      ? "NO APLICA"
      : selectedVisita.id_catv === 1
      ? "COLABORADOR SANTUL"
      : selectedVisita.id_catv === 7 || selectedVisita.id_catv === 11
      ? selectedVisita.paqueteria
      : selectedVisita.empresa;

  const vehiculo =
    selectedVisita.tipo === "PROVEEDOR (IMPORTACIONES/NACIONALES)"
      ? selectedVisita.contenedor || "N/A"
      : selectedVisita.placa === "" || selectedVisita.placa === null
      ? "N/A"
      : selectedVisita.placa;

  const fechaVisita = formatDateToYMD(selectedVisita.reg_entrada);
  const horaVisita = selectedVisita.hora_entrada;
  const areaAcceso = selectedVisita.area;

  // Convertir a array para manejar múltiples acompañantes
  const acompanantes = selectedVisita.nombre_acomp
    ? selectedVisita.nombre_acomp.split(",").map((a) => a.trim()) // Suponiendo que vienen en un string separados por comas
    : [];

  const printContent = `
    VISITA SANTUL - ${selectedVisita.clave_visit}
    NOMBRE: ${nombre}
    EMPRESA: ${empresa}
    TIPO DE VISITA: ${selectedVisita.tipo}
    AREA DE ACCESO: ${selectedVisita.area}
  `;
  const visitanteQRContent = `
    NOMBRE: ${nombre}\n
    EMPRESA: ${empresa}\n
    PLACA O CONTENEDOR: ${vehiculo}\n
    DÍA DE VISITA: ${fechaVisita}\n
    HORA VISITA: ${horaVisita || '-'}\n
    AREA DE ACCESO: ${areaAcceso}\n
  `;

  try {
    console.log("Generando QR del visitante principal...");
    const qrVisitante = await generateQRCode(visitanteQRContent);

    // const qrAcompanantes = await Promise.all(
    //   acompanantes.map(async (acompanante) => {
    //     const qrContent = `
    //       NOMBRE ACOMPAÑANTE: ${acompanante}\n
    //       EMPRESA: ${empresa}\n
    //       PLACA O CONTENEDOR: ${vehiculo}\n
    //       DÍA DE VISITA: ${fechaVisita}\n
    //       HORA VISITA: ${horaVisita || '-'}\n
    //       AREA DE ACCESO: ${areaAcceso}\n
    //     `;
    //     return generateQRCode(qrContent);
    //   })
    // );
    // const contentAcompanantes = await Promise.all(
    //   acompanantes.map(async (acompanante) => {
    //     const qrContent = `
    //       VISITA SANTUL - ${selectedVisita.clave_visit}
    //       NOM. ACOMPAÑANTE: ${acompanante}
    //       EMPRESA: ${empresa}
    //       TIPO DE VISITA: ${selectedVisita.tipo}
    //       AREA DE ACCESO: ${areaAcceso}
    //     `;
    //     return generateQRCode(qrContent);
    //   })
    // );

    // console.log("Conectando e imprimiendo...");
    // await connectAndPrint(printContent, visitanteQRContent, qrAcompanantes, contentAcompanantes);

    console.log("Impresión completada, actualizando datos...");
    await darAcceso(idVisit, estado);

    console.log("Proceso completado.");
  } catch (error) {
    console.error("Error durante el proceso:", error);
    setErrorMessageImp(error.message || "Ocurrió un error");
  }
};

const connectAndPrint = async (printContent, qrVisitante, qrAcompanantes, contentAcompanantes) => {
  try {
    console.log("Solicitando dispositivo...");

    const device = await navigator.bluetooth.requestDevice({
      //cambiar el nombre del dispositivo por el de la impresora
      filters: [{ name: "NLS-PP310-6654" }],
      optionalServices: ["49535343-fe7d-4ae5-8fa9-9fafd205e455"],
    });

    console.log("Dispositivo encontrado:", device);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("49535343-fe7d-4ae5-8fa9-9fafd205e455");
    const characteristic = await service.getCharacteristic("49535343-8841-43f4-a8d4-ecbe34729bb3");

    const encoder = new EscPosEncoder();
    let commands = encoder
      .initialize()
      .align("center")
      .newline()
      .text("VISITA SANTUL")
      .newline()
      .text(printContent)
      .newline()
      .qrcode(qrVisitante, { size: 5 })
      .newline()
      .newline()
      .newline();

    qrAcompanantes.forEach((qr, index) => {
      commands = commands
        .initialize()
        .newline()
        .align("center")
        .newline()
        .text("VISITA SANTUL")
        .newline()
        .text(contentAcompanantes)
        .newline()
        .qrcode(qr, { size: 5 })
        .newline()
        .newline();
    });

    commands = commands.cut().encode();

    const chunkSize = 512;
    for (let i = 0; i < commands.length; i += chunkSize) {
      const chunk = commands.slice(i, i + chunkSize);
      await characteristic.writeValue(new Uint8Array(chunk));
    }

    console.log("Impresión enviada correctamente.");
  } catch (error) {
    console.error("Error al imprimir:", error);
    throw error;
  }
};

const generateQRCode = (content) => {
  return content; // Solo para prueba, aquí deberías generar el QR real
};


// const handleGenerateImage = async () => {
//   const idVisit = selectedVisita.id_visit;
//   const estado = "A";

//   if (!selectedVisita) {
//     console.error("selectedVisita no está definida");
//     return;
//   }
 
//   const nombre =
//     selectedVisita.tipo === "PROVEEDOR (IMPORTACIONES/NACIONALES)"
//       ? selectedVisita.nombre_com_acomp || 'PROVEEDOR'
//       : selectedVisita.nombre_completo;

//   const empresa =
//     selectedVisita.id_catv === 2 || selectedVisita.id_catv === 4 || selectedVisita.id_catv === 13
//       ? "NO APLICA"
//       : selectedVisita.id_catv === 1
//       ? "COLABORADOR SANTUL"
//       : selectedVisita.id_catv === 7 || selectedVisita.id_catv === 11
//       ? selectedVisita.paqueteria
//       : selectedVisita.empresa;

//   const vehiculo =
//     selectedVisita.tipo === "PROVEEDOR (IMPORTACIONES/NACIONALES)"
//       ? selectedVisita.contenedor || "N/A"
//       : selectedVisita.placa === "" || selectedVisita.placa === null
//       ? "N/A"
//       : selectedVisita.placa;

//   const printContent = `
//     VISITA SANTUL - ${selectedVisita.clave_visit}
//     NOMBRE: ${nombre}
//     EMPRESA: ${empresa}
//     TIPO DE VISITA: ${selectedVisita.tipo}
//     AREA DE ACCESO: ${selectedVisita.area}
//   `;

//   const printContentQR = `
//     NOMBRE: ${nombre}\n
//     EMPRESA: ${empresa}\n
//     PLACA O CONTENEDOR: ${vehiculo}\n
//     DÍA DE VISITA: ${formatDateToYMD(selectedVisita.reg_entrada)}\n
//     HORA VISITA: ${selectedVisita.hora_entrada}\n
//     ACOMPAÑANTE(S): ${selectedVisita.nombre_acomp}\n
//     AREA DE ACCESO: ${selectedVisita.area}\n
//   `;

//   try {
//     console.log("Generando QR...");
//     const qrCodeDataUrl = await generateQRCode(printContentQR);

//     console.log("Conectando e imprimiendo...");
//     await connectAndPrint(printContent, qrCodeDataUrl);

//     console.log("Impresión completada, actualizando datos...");
//     await darAcceso(idVisit, estado);

//     console.log("Proceso completado.");
//   } catch (error) {
//     console.error("Error durante el proceso:", error);
//     setErrorMessageImp(error.message || "Ocurrió un error");
//   }
// };

// const connectAndPrint = async (printContent, printContentQR) => {
//   try {
//     console.log("Solicitando dispositivo...");

//     // Filtrar dispositivos por nombre que contenga "Impresora"
//     const device = await navigator.bluetooth.requestDevice({
//       filters: [{ name: "NLS-PP310-EA20" }], // Cambia "Impresora" por el prefijo de tu dispositivo
//       optionalServices: ["49535343-fe7d-4ae5-8fa9-9fafd205e455"],
//     });

//     console.log("Dispositivo encontrado:", device);

//     const server = await device.gatt.connect();
//     console.log("Conectado al servidor GATT.");

//     const service = await server.getPrimaryService("49535343-fe7d-4ae5-8fa9-9fafd205e455");
//     console.log("Servicio obtenido:", service);

//     const characteristic = await service.getCharacteristic("49535343-8841-43f4-a8d4-ecbe34729bb3");
//     console.log("Característica obtenida:", characteristic);

//     const encoder = new EscPosEncoder();
//     const commands = encoder
//       .initialize()
//       .align("center")
//       .newline()
//       .text(printContent)
//       .newline()
//       .newline()
//       .qrcode(printContentQR, { size: 5 })
//       .newline()
//       .newline()
//       .cut()
//       .encode();

//     const chunkSize = 512;
//     for (let i = 0; i < commands.length; i += chunkSize) {
//       const chunk = commands.slice(i, i + chunkSize);
//       await characteristic.writeValue(new Uint8Array(chunk));
//     }

//     console.log("Impresión enviada correctamente.");
//   } catch (error) {
//     console.error("Error al imprimir:", error);
//     throw error; // Propaga el error para manejarlo en `handleGenerateImage`
//   }
// };

// const generateQRCode = (content) => {
//   return content;
// };



const darSalida = async () => {
  try {
    const idUsuario = user.id_usu; 
    const idVisit = selectedVisitaSalida.id_visit;
     

    const response = await axios.put(
      `${api}/up/salida/${idVisit}`,
      {
        est: 'C', 
        id_usu_out: idUsuario, 
        tiempo_visita: tiempo,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Actualización exitosa:', response.data);
    //alert('Datos actualizados correctamente.');
    window.location.reload();
  } catch (error) {
    console.error('Error al actualizar los datos:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 500) {
      console.log('Error en el servidor. Por favor, intente nuevamente.');
    } else {
      console.log('Error al actualizar los datos. Por favor, intente nuevamente.');
    }
  }
};

const multaVisitante = async () => {

  try{
    const data = {
      ...multa,
      id_vit: selectedVisitaBloqeo.clave,
      id_usu_mul: user.id_usu
    }
    const response = await axios.post(`${api}/multa`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Guardado exitosamente', response.data);
    setShowSuccessAlert(true);
    // Swal.fire({
    //   title: 'El visitante ha sido multado con éxito.',
    //   text: '¿Desea finalizar la visita?',
    //   icon: "success",
    //   confirmButtonText: "NO FINALIZAR",
    //   confirmButtonColor: "#6dba27",
    //   denyButtonText: `FINALIZAR`,
    //   denyButtonColor: "#FFA500",
    //   showDenyButton: true,
    //   didOpen: () => {
    //     const swalContainer = document.querySelector('.swal2-container');
    //     if (swalContainer) {
    //       swalContainer.style.zIndex = '9999'; // Asegúrate que sea mayor al Dialog
    //     }
    //   }
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     window.location.reload();
    //   } else if (result.isDenied) {
    //     await getVisitantes();
    //     setOpenCreateVisita(true);
    //   }
    // });
    handleOpenMultaFinalizar(selectedVisitaBloqeo);
    setTimeout(() => setShowSuccessAlert(false), 5000); 
  } catch (error) {
    console.log('Error al multar', {
      message: error.message,
      response: error.response?.data.error,
      status: error.response?.status,
      
    });
    if (error.response?.status === 500) {
      console.log('Error en el servidor. Por favor, intente nuevamente.');
    } else {
      console.log('Error al actualizar los datos. Por favor, intente nuevamente.');
    }
  }
}

const [multa, setMulta] = useState({
    
    id_vit: '',
    id_multa: '',
    id_usu_mul: '',
  })

const handleDropdownChangeMulta = (event) => {
  const selectedValue = event.target.value;
  setSelectedConMulta(selectedValue);
  setMulta((prevState) => ({
    ...prevState,
    id_multa: selectedValue?.id_multa || "",
  }));
};

const validateMulta = () =>{
  let validationErrors = {};
  let isValid = true;

  if(!multa.id_multa){
    validationErrors.id_multa = "Seleccione un motivo para multar.";
    isValid = false;
  }

  setErrorMulta(validationErrors);
  return isValid;
}

const SaveMulta = () => {
  if(validateMulta() ){
    multaVisitante();
  }else{
    console.log('error en la validacion de multa.')
  }
}

//visitas activas
const getVisitasAct = async () => {
  try {
    const response = await axios.get(`${api}/agenda/activas`);
    console.log('Respuesta de la API:', response.data);

    const visitantes = Array.isArray(response.data.visitantes) ? response.data.visitantes : [];
    const transportistas = Array.isArray(response.data.transportistas) ? response.data.transportistas : [];
    const proveedores = Array.isArray(response.data.contenedores) ? response.data.contenedores : [];

    setVisitantes(visitantes);
    setTransportistas(transportistas);
    setProveedoresAct(proveedores);
    setVisitantesAll([...visitantes, ...transportistas, ...proveedores]);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
};

 const handleFileUpload = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const fileColumns = Object.keys(jsonData[0] || {});

    const missingColumns = expectedColumns.filter((col) => !fileColumns.includes(col));
    const extraColumns = fileColumns.filter((col) => !expectedColumns.includes(col));
    const isOrdered = expectedColumns.every((col, index) => fileColumns[index] === col);

    const validationErrors = [];
    const invalidCols = [];

    if (missingColumns.length > 0) {
      validationErrors.push(`Faltan las columnas: ${missingColumns.join(", ")}`);
      invalidCols.push(...missingColumns);
    }
    if (extraColumns.length > 0) {
      validationErrors.push(`Columnas adicionales detectadas: ${extraColumns.join(", ")}`);
      invalidCols.push(...extraColumns);
    }
    if (!isOrdered) {
      validationErrors.push("Orden de las columnas incorrecto.");
      invalidCols.push(...fileColumns.filter((col, index) => expectedColumns[index] !== col));
    }

    setErrorExcel(validationErrors);
    setInvalidColumns(invalidCols);
    setDataExcel(jsonData); 
  };

  reader.readAsArrayBuffer(file);
};

const handleFileUploadVeh = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const fileColumns = Object.keys(jsonData[0] || {});

    const missingColumns = expectedColumnsVeh.filter((col) => !fileColumns.includes(col));
    const extraColumns = fileColumns.filter((col) => !expectedColumnsVeh.includes(col));
    const isOrdered = expectedColumnsVeh.every((col, index) => fileColumns[index] === col);

    const validationErrors = [];
    const invalidCols = [];

    if (missingColumns.length > 0) {
      validationErrors.push(`Faltan las columnas: ${missingColumns.join(", ")}`);
      invalidCols.push(...missingColumns);
    }
    if (extraColumns.length > 0) {
      validationErrors.push(`Columnas adicionales detectadas: ${extraColumns.join(", ")}`);
      invalidCols.push(...extraColumns);
    }
    if (!isOrdered) {
      validationErrors.push("Orden de las columnas incorrecto.");
      invalidCols.push(...fileColumns.filter((col, index) => expectedColumns[index] !== col));
    }

    setErrorExcelVeh(validationErrors);
    setInvalidColumnsVeh(invalidCols);
    setDataExcelVeh(jsonData); 
  };

  reader.readAsArrayBuffer(file);
};

const handleClearExcelVeh = () => {
  setDataExcelVeh([]); 
  setErrorExcelVeh([]);
  setErrorSaveVeh(""); 
};

const handleSaveVehiculoData = async () => {
  if (errorExcelVeh.length > 0) {
    setErrorSave("No se puede guardar la información debido a errores en el archivo.");
    setOpenAlertError(true);
    return;
  }
  try {
      const response = await axios.post(`${api}/upveh/excel`, dataExcelVeh, {
          headers: { "Content-Type": "application/json" },
      });
      //alert(response.data.message);
      
      setOpenAlert(true);
        setTimeout(()=>{
          setOpenAlert(false);
        }, 1000);
      setOpenUpExcelVeh(false);
      window.location.reload();
  } catch (error) {
      console.error("Error al guardar los datos:", error);
      //alert("Error al guardar los datos");
  }
};

const handleSaveData = async () => {
  if (errorExcel.length > 0) {
    setErrorSave("No se puede guardar la información debido a errores en el archivo.");
    setOpenAlert(true);
    return;
  }
  try {
      const response = await axios.post(`${api}/upload/transportistas`, dataExcel, {
          headers: { "Content-Type": "application/json" },
      });
      //alert(response.data.message);
      setOpenUpExcel(false);
      setOpenCreateTransp(false);
      window.location.reload();
  } catch (error) {
      console.error("Error al guardar los datos:", error);
      //alert("Error al guardar los datos");
  }
};

const handleClearExcel = () => {
  setDataExcel([]); 
  setErrorExcel([]);
  setErrorSave(""); 
};

const calcularTiempoTranscurrido = (entrada_h) => {
  const entrada = new Date(entrada_h);
  const ahora = new Date();
  const diferenciaMs = ahora - entrada;

  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

  return { tiempo: `${horas}hr : ${minutos}min.`, excede: horas >= 1 };
};
const calcularTiempo = (entrada_h) => {
  if (!entrada_h) return "N/A";
  const entrada = new Date(entrada_h);
  const ahora = new Date();
  const diferenciaMs = ahora - entrada;

  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${horas}hr : ${minutos}min.`;
};

useEffect(() => {
  if (selectedVisitaSalida && selectedVisitaSalida.entrada_h) {
    const { tiempo, excede } = calcularTiempoTranscurrido(selectedVisitaSalida.entrada_h);
    setTiempo(tiempo);
    setExcesoTiempo(excede);

    if (excede && !alertaMostrada && !openSalida) {
      setOpenExcesoTiempo(true); 
      setAlertaMostrada(true);   
    }
  }
}, [selectedVisitaSalida, alertaMostrada, openSalida]);


function formatTo12Hour(time) {
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convierte 0 en 12 para el formato 12 horas
  return `${hour}:${minutes} ${period}`;
}

const formatDateToYMD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Meses empiezan en 0
  const day = d.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const handleTabChange = (event, newValue) => {
  setTabIndex(newValue);
};
const validTypes = [
  "TRANSPORTISTA", 
  "MANIOBRISTA", 
  "PERSONAL CORPORATIVO", 
  "CANDIDATO (ENTREVISTA)", 
  "INVITADO (EVENTOS)", 
  "CLIENTE RECOGE", 
  "ENTREGA DE EVIDENCIAS", 
  "DIRECCION GENERAL", 
  "CLIENTE",
  "PAQUETERIA",
];
const validProv = [
  "PROVEEDOR (IMPORTACIONES/NACIONALES)"
];
const getEmpresa = (visita) => {
  if (visita.id_catv === 1) {
    return "Colaborador Santul";
  } else if (visita.id_catv === 4 || visita.id_catv === 2) {
    return "N/A";
  } else {
    return visita.empresa;
  }
};

const handleInputChangePaq = (index, updatedFields) => {
  const nuevosAcompanantes = [...acompanantesPaq];
  nuevosAcompanantes[index] = {
    ...nuevosAcompanantes[index],
    ...updatedFields,
  };
  setAcompanantesPaq(nuevosAcompanantes);
};

const agregarAcompanantePaq = () => {
    setAcompanantesPaq([...acompanantesPaq, { nombre: "", apellidos: '', no_ine:'' }]);
};

const eliminarAcompanantePaq = (index) => {
    const nuevosAcompanantes = acompanantesPaq.filter((_, i) => i !== index);
    setAcompanantesPaq(nuevosAcompanantes);
};

const handleDropdownChangeCortina = (event) => {
  const selectedValue = event.target.value;
  setSelectedCortina(selectedValue);
  setPaq((prevState) => ({
    ...prevState,
    area_per: selectedValue?.id_cor || "",
    motivo: selectedValue?.area || "",
  }));
}; 

const isMobile = useMediaQuery('(max-width:1200px)');

//responsive filtros
const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFiltro = (callback) => {
    setAnchorEl(null);
    if (callback) callback();
  };


  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={isMobile ? "" : "center"}
        mb={2}
        flexDirection={isSmallScreen ? "column" : "row"}
      >
        {(user?.role === 'POLIB' || user?.role === 'Admin') && (
          <>
          <Box mb={2}>
            <TextField
              label="Buscar visita"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              size="small"
              sx={{
                width: isMobile ? 200 : 300,
                mb: 2,
              }}
              InputProps={{ 
                endAdornment: (
                  <>
                    {filteredVisitas.length > 0  ? (
                      <IconButton
                        aria-label="clear"
                        size="small"
                        onClick={handleClearSearch}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label="search"
                        size="small"
                        onClick={handleSearch}
                      >
                        <Search fontSize="small" />
                      </IconButton>
                    )}
                  </>
                ),
              }}
            />{' '}
            <TextField
              label="Buscar empleado"
              value={searchQueryEmpleado}
              onChange={handleSearchChangeEmpleado}
              variant="outlined"
              size="small"
              onKeyDown={(e) => e.key === "Enter" && handleSearchEmpleado()}
              sx={{
                width: isMobile ? 200 : 300,
                mb: 2,
              }}
              InputProps={{
                endAdornment: (
                  <>
                    {/* Mostrar el ícono de búsqueda solo si hay texto en el input */}
                    {filteredEmpleados.length > 0  ? (
                      <IconButton
                        aria-label="clear"
                        size="small"
                        onClick={handleClearSearchEmpleado}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label="search"
                        size="small"
                        onClick={handleSearchEmpleado}
                      >
                        <Search fontSize="small" />
                      </IconButton>
                    )}
                  </>
                ),
              }}
            />{' '}
            {(user?.role === 'POLIA' || user?.role === 'Admin')  && (
              <TextField
                label="Buscar placa"
                value={searchQueryPlaca}
                onChange={handleSearchChangePlaca}
                variant="outlined"
                size="small"
                onKeyDown={(e) => e.key === "Enter" && handleSearchPlaca()}
                sx={{
                  width: isMobile ? 200 : 300,
                  mb: 2,
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      {/* Mostrar el ícono de búsqueda solo si hay texto en el input */}
                      {filteredPlacas.length > 0  ? (
                        <IconButton
                          aria-label="clear"
                          size="small"
                          onClick={handleClearSearchPlaca}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          aria-label="search"
                          size="small"
                          onClick={handleSearchPlaca}
                        >
                          <Search fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  ),
                  }}
                />
            )}
            
          </Box>
          </>
          
        )}
        
        <Box display="flex" gap={isMobile ? 1 : 2} sx={{
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "left" : "flex-start", // Alineación a la derecha en dispositivos móviles
            alignItems: isMobile ? "left" : "center",
          }}>
          {(user?.role === 'RH' || user?.role === 'Admin') && ( 
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddAlt />}
              onClick={handleClickOpenCreateIn}
              size={isMobile ? "small" : "medium"}
            >
              Nuevo visitante
            </Button>
          )}
          {(user?.role === 'CONTROL' || user?.role === 'Admin') && (
            <Button
              variant="contained"
              startIcon={<LocalShipping />}
              onClick={handleClickOpenCreateTransp}
              size={isMobile ? "small" : "medium"}
            > 
              Nuevo transportista
            </Button>
          )}
          {(user?.role === 'RH' || user?.role === 'CONTROL' || user?.role === 'Nac' || user?.role === 'TRAFICO' || user?.role === 'Imp' || user?.role === 'Admin') && (
            <>
              <Button
                variant="contained"
                startIcon={<Schedule />}
                onClick={handleClickOpenCreateVisita}
                size={isMobile ? "small" : "medium"}
              >
                Programar visita
              </Button>
            </>
          )}
          {(user?.role === 'POLIB' || user?.role === 'Admin') && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LocalShipping />}
                onClick={handleClickOpenPaqueteria}
                size={isMobile ? "small" : "medium"}
              >
                LLEGADA DE PAQUETERIA
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      { (user?.role === 'Admin' || user?.role === 'POLIB') && (
      <Box mb={2}>
        <Grid container spacing={3}>
          {filteredEmpleados.map((empleado, index) => (
            <Grid item xs={12} sm={6} md={4.5} key={index}>
              <Card sx={{ height: '100%', width: '120%', display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <CardContent sx={{ display: "flex" }}>
                  <Avatar
                    src={`${foto}/${empleado.foto}`}
                    alt={empleado.nombre_completo}
                    sx={{ width: 150, height: 150, marginRight: "15px", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      <i className="pi pi-user" style={{ marginRight: 5 }} />
                      {empleado.nombre_completo}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      <EngineeringOutlined fontSize="small" /> No. Empleado: {empleado.no_empleado}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      <Business fontSize="small" /> Empresa: {empleado.id_catv === 8 && "COLABORADOR SANTUL" }
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      <Autorenew fontSize="small" /> Relación: {empleado.tipo}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      <ConnectWithoutContact fontSize="small" />Acceso: {empleado.est === 'A' ? (<span style={{color:'green'}}><strong>AUTORIZADO</strong></span>):(<span style={{color:'red'}}><strong>NO AUTORIZADO</strong></span>)}
                    </Typography>
                    
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>)}

        <Box mb={2}>
          <Grid container spacing={3}>
            {filteredVisitas.length > 0 ? (
              <>
              
              {filteredVisitas.filter((visita) => validTypes.some(type => visita.tipo?.startsWith(type)))
              .map((visita, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <CardContent sx={{ display: 'flex' }}>
                      <Avatar
                        src={`${foto}/${visita.foto}`}
                        alt={visita.nombre_completo}
                        sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          <i className="pi pi-user" style={{ marginRight: 5 }} />
                          {visita.nombre_completo}
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Business fontSize="small" />{' '}
                          Empresa: {visita.id_catv === 1 ? ( 'COLABORADOR SANTUL'): visita.id_catv === 2 ? ('N/A'): visita.id_catv === 11 || visita.id_catv === 13 ? (visita.paqueteria): (visita.empresa)} 
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Autorenew fontSize="small"/>{' '}
                          Relación:  {visita.tipo}
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <CarCrashOutlined fontSize="small" />{' '}
                          Placa: {visita.id_catv === 1 || visita.id_catv === 2 || visita.id_catv === 3 ? (
                            'N/A'
                          ) : ( visita.placa )} 
                          <br />
                          {visita.id_catv === 1 || visita.id_catv === 2 || visita.placa === null ? (
                            ' '
                          ) : (
                            <small style={{ marginLeft: '8px' }}>
                              {visita.acc_veh === 'S' || visita.acc === 'S' || visita.acc_dir === 'S' ? (
                                <span style={{ color: 'green' }}>Vehículo con acceso autorizado.</span>
                              ) : visita.acc_veh === '' || visita.acc === null ? (
                                <span style={{ color: '#ed6b1b' }}>Vehículo pendiente de autorizar acceso.</span>
                              ) : (
                                <span style={{ color: 'red' }}>Vehículo sin acceso autorizado.</span>
                              )}
                            </small>
                          )}
                        {visita.id_catv === 1 || visita.id_catv === 2 ? (
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <SensorOccupied fontSize="small"/>{' '}
                            Responsable: {visita.personal}
                          </Typography>
                        ) : (' ')}

                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <CloudQueue fontSize="small"/>{' '}
                          Día y hora de visita: {formatDateToYMD(visita.reg_entrada)}, {visita.hora_entrada}
                        </Typography>
                        <div> 
                        <Button
                            variant="outlined"
                            startIcon={<FmdGoodOutlined />}
                            sx={{ width: "90%", mb: 1 }}
                            onClick={() => validarVisita(visita)}
                          >
                            Marcar llegada
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    
                  </Card>
                </Grid>
              
              ))}

            {filteredVisitas
              .filter((visita) => validProv.some(type => visita.tipo?.startsWith(type)))
              .map((visita, index) => (
                <Grid item xs={12} sm={6} md={4.5} key={`PR-${index}`}>
                  <Card
                    sx={{
                      height: '100%', width:'150%',
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <CardContent sx={{ display: "flex" }}>
                      {/* Contenido del card */}
                      <Avatar
                        src={`${foto}/${visita.foto}`}
                        alt={visita.nombre_completo}
                        sx={{
                          width: 150,
                          height: 150,
                          marginRight: "15px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        {/* Contenido de los detalles */}
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          <i className="pi pi-user" style={{ marginRight: 5 }} />
                          {visita.contenedor} -
                          <small style={{ marginLeft: '8px' }}>
                            {visita.acc_veh === 'S' || visita.acc_dir === 'S' ? (
                              <small style={{ color: 'green' }}>Vehículo con acceso autorizado.</small>
                            ) : (
                              <small style={{ color: 'red' }}>Vehículo con acceso denegado.</small>
                            )}
                          </small>
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Autorenew fontSize="small" /> Relación: {visita.tipo}
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <DirectionsSubway fontSize="small" /> Contenedor: {visita.contenedor}<br/>
                          <small style={{marginLeft:'8px'}}>{visita.acc_veh === 'S' ? (<span style={{color:'green'}}>Vehículo con acceso autorizado.</span>):
                          visita.acc_veh === ''  (<span style={{color:'#ed6b1b'}}>Vehiculo pendiente de autorizar acceso.</span>)}</small>
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <CloudQueue fontSize="small" /> Día y hora de la visita: {formatDateToYMD(visita.reg_entrada)}
                        </Typography>
                        <div>
                        <Button
                            variant="outlined"
                            startIcon={<FmdGoodOutlined />}
                            sx={{ width: "90%", mb: 1 }}
                            onClick={() => validarVisita(visita)}
                          >
                            Marcar llegada
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              </>
            ) :  searchPerformed && filteredVisitas.length === 0 ? (
              <Grid item xxs={12}>
                <Typography variant="h6" color="textSecondary" align="left">
                  {searchQuery.trim() !== "" && !searchPerformed
                    ? "Por favor, ingresa el nombre completo para realizar la búsqueda."
                    : "No se encontró ninguna visita."}
                </Typography>
              </Grid>
            ) : null}
            
          </Grid>
        </Box>

        <Box mb={2} sx={{marginTop:'30px'}}>
          <Grid container spacing={2}>
            {filteredPlacas.length > 0 ? (
              filteredPlacas
               //.filter((visita) => visita.llegada === 'S' && visita.validar === null || visita.validar === '' && visita.id_catv !== 4)
                .map((visita, index) => (
                  <Grid item xs={12} sm={6} md={4.5} key={index}>
                    <Card
                      sx={{
                        height: '100%', width: '120%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardContent sx={{ display: 'flex' }}>
                        <Avatar
                          src={`${foto}/${visita.foto}`}
                          alt={visita.nombre_completo}
                          sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                        />
                        {visita.id_catv === 4 ? (
                          <div style={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              <i className="pi pi-user" fontSize="small" />
                              {visita.contenedor} -
                              <small style={{ marginLeft: '8px' }}>
                                {visita.acc_veh === 'S' || visita.acc_dir === 'S' ? (
                                  <small style={{ color: 'green' }}>Vehículo con acceso autorizado.</small>
                                ) : (
                                  <small style={{ color: 'red' }}>Vehículo con acceso denegado.</small>
                                )}
                              </small>
                            </Typography>
                            {visita.tipoCom === 'Importaciones' ? (
                              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                <Person fontSize="small" /> Nombre: N/A
                              </Typography>
                            ):(
                              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                <Person fontSize="small" /> Nombre: {visita.nombre_completo}
                              </Typography>
                            )}
                            {visita.tipoCom === 'Importaciones' ? (
                              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                <Business fontSize="small" /> Empresa: N/A
                              </Typography>
                            ):(
                              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                <Business fontSize="small" /> Empresa: {visita.empresa}
                              </Typography>
                            )}
                            
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                              <Autorenew fontSize="small" /> Relación: {visita.tipo}<br/>
                              {visita.tipoCom === 'Importaciones' && (
                                <small style={{marginLeft:'25px' }}>{visita.tipoCom} </small>
                                )}
                            </Typography>
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                              <CloudQueue fontSize="small" /> Día y hora de visita: {formatDateToYMD(visita.reg_entrada)}, {visita.hora_entrada}
                            </Typography>
                            <div>
                              <Button
                                variant="outlined"
                                startIcon={<BusAlert />}
                                sx={{ width: '90%', mb: 1 }}
                                onClick={() => validar(visita)}
                              >
                                Validar acceso
                              </Button>
                            </div>
                          </div>
                        ): (
                          <div style={{ flex: 1 }}>
                          {visita.tipo === 'PROVEEDOR (IMPORTACIONES/NACIONALES)' ? (
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              <i className="pi pi-user" fontSize="small" />
                              {visita.contenedor} - 
                              <small style={{ marginLeft: '8px' }}>
                                {visita.acc_veh === 'S' || visita.acc_dir === 'S' ? (
                                  <small style={{ color: 'green' }}>Vehículo con acceso autorizado.</small>
                                ) : (
                                  <small style={{ color: 'red' }}>Vehículo con acceso denegado.</small>
                                )}
                              </small>
                            </Typography>
                          ):( 
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              <i className="pi pi-user" fontSize="small" />
                              {visita.placa} - 
                              <small style={{ marginLeft: '8px' }}>
                                {visita.acc_veh === 'S' || visita.acc_dir === 'S' ? (
                                  <small style={{ color: 'green' }}>Vehículo con acceso autorizado.</small>
                                ) : (
                                  <small style={{ color: 'red' }}>Vehículo con acceso denegado.</small>
                                )}
                              </small>
                            </Typography> 
                          )}
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <Person fontSize="small" /> Nombre: {visita.nombre_completo}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <Business fontSize="small" /> Empresa: {visita.empresa}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <Autorenew fontSize="small" /> Relación: {visita.tipo}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <CloudQueue fontSize="small" /> Día y hora de visita: {formatDateToYMD(visita.reg_entrada)}, {visita.hora_entrada}
                          </Typography>
                          {visita.llegada === 'S' && visita.id_catv !== 4 && (
                          <div>
                            <Button
                              variant="outlined"
                              startIcon={<BusAlert />}
                              sx={{ width: '90%', mb: 1 }}
                              onClick={() => validar(visita)}
                            >
                              Validar acceso
                            </Button>
                          </div>)}
                        </div>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
            ) : searchPerformedPlacas && filteredPlacas.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" color="textSecondary" align="left">
                  {searchQueryPlaca.trim() !== '' && !searchPerformedPlacas
                    ? 'Por favor, ingresa el nombre completo para realizar la búsqueda.'
                    : 'No se encontró ninguna visita.'}
                </Typography>
              </Grid>
            ) : null}
          </Grid>
        </Box>
        


        {/**card de validar todos los visitantes */}
        {(user?.role === 'POLIB' || user?.role === 'Admin') && (
          <Box mb={2} sx={{marginTop:'30px'}}>
          <Grid container spacing={2}>
            {visitas 
                .filter((vit) => vit.llegada === 'S' && vit.entrada_h === null )
              .map((vit, index) => (
                <Grid item xs={12} sm={6} md={4.5} key={index}>
                  <Card
                    sx={{
                      height: '100%', width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ display: 'flex' }}>
                      <Avatar
                        src={`${foto}/${vit.foto}`}
                        alt={vit.nombre_completo}
                        sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        {vit.catv === '4' || vit.tipo === 'PROVEEDOR (IMPORTACIONES/NACIONALES)' ? (
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            <i className="pi pi-user" style={{ marginRight: 5 }} />
                            {vit.contenedor}
                          </Typography>
                        ): (
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            <i className="pi pi-user" style={{ marginRight: 5 }} />
                            {vit.nombre_completo}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Business fontSize="small" /> 
                            Empresa: {
                              vit.id_catv === 1
                                ? 'COLABORADOR SANTUL'
                                : vit.id_catv === 7
                                ? vit.paqueteria
                                : vit.id_catv === 2 || vit.id_catv === 4
                                ? 'N/A'
                                : vit.empresa === '6' || vit.empresa === '7' || vit.empresa === '8'
                                ? 'N/A'
                                : vit.empresa
                            }
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Autorenew fontSize="small" /> Relación: {vit.tipo}
                        </Typography>
                          {vit.catv === '4' || vit.tipo === 'PROVEEDOR (IMPORTACIONES/NACIONALES)' ? (
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                              <DirectionsSubway fontSize="small" /> Contenedor: {vit.contenedor}<br/>
                              <small style={{ marginLeft:'12px', color:'green'}}>Vehículo con acceso autorizado.</small>
                            </Typography>
                          ): vit.id_catv === 1 || vit.id_catv === 2 ? (
                            ' '
                          ):(
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                              <CarCrashOutlined fontSize="small" /> Placa: {vit.id_catv === 1 || vit.id_catv === 2 || vit.id_catv === 3 ? ( 'N/A'):(vit.placa)} <br/>
                            {vit.id_catv === 1 || vit.id_catv === 2 || vit.placa === null ? ( ' '):(
                              <small style={{marginLeft:'8px'}}>{vit.acc_veh === 'S' || vit.acc === 'S' || vit.acc_dir === 'S' ? (<span style={{color:'green'}}>Vehículo con acceso autorizado.</span>):
                              vit.acc_veh === '' || vit.acc === null ? (<span style={{color:'#ed6b1b'}}>Vehiculo pendiente de autorizar acceso.</span>):
                              (<span style={{color:'red'}}>Vehículo sin acceso autorizado.</span>)}</small>
                            )} 
                              
                            </Typography>
                          )}
                          <Typography>
                            {vit.id_catv === 1 || vit.id_catv === 2 ? (
                              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                <SensorOccupied fontSize="small"/>{' '}
                                Responsable: {vit.personal}
                              </Typography>
                            ) : (' ')}
                            
                          </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <CloudQueue fontSize="small" /> Día y hora de visita: {formatDateToYMD(vit.reg_entrada)}, {vit.hora_entrada}
                        </Typography>
                        <div>
                          {vit.foto === null || vit.foto === '' ? (
                            vit.id_catv === 4 ? (
                              <Button
                                variant="outlined"
                                startIcon={<PhotoCamera />}
                                sx={{ width: "90%", mb: 1 }}
                                onClick={() => handleClickOpenCamProv(vit)}
                              >
                                Tomar Foto
                              </Button>
                              
                            ):(
                              (vit.foto !== null || vit.foto === '' &&  vit.entrada_h === null  ? (
                                <>
                                  <Button
                                    style={{marginTop:'8px'}}
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<i className="pi pi-qrcode" />}
                                    onClick={() => handleClickOpenAcceso(vit)}
                                  >
                                    Pase de acceso
                                  </Button>
                                  <Button 
                                    style={{ marginTop: '8px' }}
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<i className="pi pi-qrcode" />}
                                    onClick={() => handleClickOpenRegAcomp(vit)}
                                  >
                                    Registrar acompañante
                                  </Button>
                                </>
                              ): (
                              <Button
                                variant="outlined"
                                startIcon={<PhotoCamera />}
                                sx={{ width: "90%", mb: 1 }}
                                onClick={() => handleClickOpenCamUp(vit)}
                              >
                                Tomar Foto
                              </Button>
                            ))
                          )
                            
                          ): null}

                          {vit.foto !== null && vit.entrada_h === null ? (
                            <>
                              <Button
                                style={{marginTop:'8px'}}
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<i className="pi pi-qrcode" />}
                                onClick={() => handleClickOpenAcceso(vit)}
                              >
                                Pase de acceso
                              </Button>
                              <Button 
                                style={{ marginTop: '8px' }}
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<i className="pi pi-qrcode" />}
                                onClick={() => handleClickOpenRegAcomp(vit)}
                              >
                                Registrar acompañante
                              </Button>
                            </>
                          ): null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

            </Grid>
          </Box>
        )}
        
        {(user?.role === 'POLIP' || user?.role === 'Admin') && (
          <Box mb={2} sx={{marginTop:'30px'}}>
          <Grid container spacing={2}>
            {visitas 
              .filter((vit) =>  vit.img1 === '' || vit.validado === '' || vit.validado === null && (vit.entrada_h !== null)) 
              .map((vit, index) => (
                <Grid item xs={12} sm={6} md={4.5} key={index}>
                  <Card  className="card__responsive"
                    sx={{
                      height: '100%', width: '100%',
                      //display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ display: 'flex'  }}>
                      <Avatar
                        src={`${foto}/${vit.foto}`}
                        alt={vit.nombre_completo}
                        sx={{
                          width: isMobile ? 65 : 150,
                          height: isMobile ? 65 : 150,
                          marginRight: isMobile ? 1 : '15px',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        {vit.catv === '4' || vit.tipo === 'PROVEEDOR (IMPORTACIONES/NACIONALES)' ? (
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text__card">
                            <i className="pi pi-user" style={{ marginRight: 5 }} />
                            {vit.contenedor}
                          </Typography>
                        ): (
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text__card">
                            <i className="pi pi-user " style={{ marginRight: 5 }} />
                            {vit.nombre_completo}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Business fontSize="small" /> 
                            Empresa: {
                              vit.id_catv === 1
                                ? 'COLABORADOR SANTUL'
                                : vit.id_catv === 7
                                ? vit.paqueteria
                                : vit.id_catv === 2 || vit.id_catv === 4
                                ? 'N/A'
                                : vit.empresa === '6' || vit.empresa === '8'
                                ? 'N/A'
                                : vit.empresa
                            }
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <Autorenew fontSize="small" /> Relación: {vit.tipo}
                        </Typography>
                          {vit.catv === '4' || vit.tipo === 'PROVEEDOR (IMPORTACIONES/NACIONALES)' ? (
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                              <DirectionsSubway fontSize="small" /> Contenedor: {vit.contenedor}<br/>
                              <small style={{ marginLeft:'12px', color:'green'}}>Vehículo con acceso autorizado.</small>
                            </Typography>
                          ): vit.id_catv === 1 || vit.id_catv === 2 ? (
                            ' '
                          ):(
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                              <CarCrashOutlined fontSize="small" /> Placa: {vit.id_catv === 1 || vit.id_catv === 2 || vit.id_catv === 3 ? ( 'N/A'):(vit.placa)} <br/>
                            {vit.id_catv === 1 || vit.id_catv === 2 || vit.placa === null ? ( ' '):(
                              <small style={{marginLeft:'8px'}}>{vit.acc_veh === 'S' || vit.acc === 'S' || vit.acc_dir === 'S' ? (<span style={{color:'green'}}>Vehículo con acceso autorizado.</span>):
                              vit.acc_veh === '' || vit.acc === null ? (<span style={{color:'#ed6b1b'}}>Vehiculo pendiente de autorizar acceso.</span>):
                              (<span style={{color:'red'}}>Vehículo sin acceso autorizado.</span>)}</small>
                            )} 
                              
                            </Typography>
                          )}
                          <Typography>
                            {vit.id_catv === 1 || vit.id_catv === 2 ? (
                              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                <SensorOccupied fontSize="small"/>{' '}
                                Responsable: {vit.personal}
                              </Typography>
                            ) : (' ')}
                            
                          </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>
                          <CloudQueue fontSize="small" /> Día y hora de visita: {formatDateToYMD(vit.reg_entrada)}, {vit.hora_entrada}
                        </Typography>
                        <div>
                          {vit.img1 === null  && (
                              <div >
                              <Button
                                style={{marginTop:'8px'}}
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<i className="pi pi-qrcode" />}
                                onClick={() => handleClickOpenValidarVehiculo(vit)}
                              >
                                Validar vehiculo
                              </Button>
                              
                            </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

            </Grid>
          </Box>
        )}
        


      <Dialog open={openValidarVehiculo} onClose={handleCloseValidarVehiculo} >
      <DialogTitle>Evidencia del vehículo</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // Dos columnas
            gap: 2, // Espacio entre las imágenes
            justifyItems: 'center', // Centra las imágenes
            textAlign: 'center',
            width: '100%',
          }}
        >
          
          {/* Mostrar las imágenes del vehículo */}
          {Object.entries(images).map(([key, value], index) => (
            <Box
              key={index}
              sx={{
                width: 230,
                height: 240,
                border: '1px dashed #ccc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {value ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={value}
                    alt={`Foto ${index + 1}`}
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'black' }}>
                    {imageLabels[key]} {/* Mostrar la descripción según la clave */}
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => removeImageVehiculo(index)}
                    sx={{ position: 'absolute', top: 5, right: 5 }}
                  >
                    Quitar
                  </Button>
                </Box>
              ) : (
                <Box>
                  <input
                    accept="image/*"
                    type="file"
                    style={{ display: 'none' }}
                    id={`file-input-${index}`}
                    onChange={(e) => handleFileChange(e, index)}
                  />
                  <label htmlFor={`file-input-${index}`}>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      sx={{ width: '100%' }}
                      component="span"
                    >
                      Seleccionar Imagen {imageLabels[key]}
                    </Button>
                  </label>
                </Box>
              )}
            </Box>
          ))}

        </Box>
        <FormControl fullWidth>
          <TextField
          onChange={(e) => setComentario(e.target.value)}
            variant="outlined"
            label="¿Trae algún material adicional?"
            sx={{
              width: '100%',
              marginTop: 2,
              marginX: 'auto',
            }}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
        </FormControl>
      </DialogContent>
      {showSuccessAlertImgs && (
        <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
          ¡Evidencia del vehículo registrada correctamente!
        </Alert>
      )}
      {showErrorAlertImgs && (
        <Alert icon={<ErrorOutline fontSize="inherit" />} severity="error">
          Debe agregar las 4 imágenes obligatorias.
        </Alert>
      )}
      <DialogActions>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button onClick={handleCloseValidarVehiculo}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleFinalizar}>Finalizar</Button>
        </Box>
      </DialogActions>

      </Dialog>
      <Dialog
        open={openCreateInvitado}
        onClose={handleCloseCreateIn}
        maxWidth="md"
        fullWidth
      >

        <DialogTitle>NUEVO VISITANTE</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Imagen o selección de foto */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed #ccc",
                  width: "100%",
                  height: 230,
                  textAlign: "center",
                  margin: "auto",
                }}
              >
                {image ? (
                  <Box
                    sx={{ textAlign: "center", width: "100%", height: "100%" }}
                  >
                    <img
                      src={image ? URL.createObjectURL(image) : ""}
                      alt="preview"
                      style={{ width: "100%", maxHeight: 170, borderRadius: 8 }}
                    />
                    <Typography variant="body2" sx={{ color: "black" }}>
                      {image.name || "Captura de Webcam"}
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={removeImage}
                      sx={{ mt: 1 }}
                    >
                      Quitar Imagen
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{ width: "90%", mb: 1 }}
                      component="label"
                    >
                      Seleccionar Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onTemplateSelect1}
                        hidden
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      sx={{ width: "90%", mb: 1 }}
                      onClick={handleClickOpenCam}
                    >
                      Tomar Foto
                    </Button>
                    <Dialog
                      header="TOMAR FOTO"
                      open={openCam}
                      onClose={handleCloseCam}
                    >
                      <Box style={{textAlign: "center", margin:'20px'  }}>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        style={{ width: '100%' }}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMedia={handleUserMedia}
                        onUserMediaError={handleUserMediaError}
                      />
                        {!isCameraReady ? ( // Mostrar mensaje de carga mientras la cámara no esté lista
                          <p style={{ marginTop: "20px", fontSize: "16px", color: "#888", textAlign:'center' }}>
                            Cargando cámara...
                          </p>
                        ) : (
                          <Button
                            severity="danger"
                            variant="outlined"
                            startIcon={<PhotoCamera />}
                            style={{ width: "100%", marginTop: "20px" }}
                            onClick={tomarFoto}
                          >
                            Tomar Foto
                          </Button>
                        )}
                        
                      </Box>
                    </Dialog>
                  </Box>
                  
                )}
                
              </Box>
              <small style={{color:'gray'}}>
              * Opcional.
              </small>
            </Grid>

            {/* Formulario de selección */}
            <Grid container item marginTop={2} sm={6} md={4.5} >

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="id_catv">Tipo de invitado</InputLabel>
                  <Select
                    labelId="id_catv"
                    id="id_catv"
                    name="id_catv"
                    value={selectCategorias}
                    onChange={handleDropdownChangeTipo}
                    label="Tipo de invitado"
                  >
                    <MenuItem value={null}>SELECCIONAR TIPO</MenuItem>
                    {categorias.map((item) => (
                      <MenuItem key={item.id_catv} value={item}>
                          {item.tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  <small>
                  {errorVisita.id_catv && (
                    <span style={{color: 'red'}}>
                      * {errorVisita.id_catv}
                    </span>
                  )}
                </small>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="apellidos"
                  name="apellidos"
                  label="Apellidos"
                  value={invit.apellidos}
                  onChange={inputChange}
                  variant="outlined"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <small >
                  {errorVisita.apellidos && (
                    <span style={{color: 'red'}}>
                      * {errorVisita.apellidos}
                    </span>
                  )}
                </small>
              </FormControl>
              {selectCategorias?.id_catv === 1 && (
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                      id="no_empleado"
                      name="no_empleado"
                      label="No. Empleado"
                      value={invit.no_empleado}
                      onChange={inputChange}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <small>
                    {errorVisita.no_empleado && (
                      <span style={{color: 'red'}}>
                        * {errorVisita.no_empleado}
                      </span>
                    )}
                  </small>
                </FormControl>
              )}
               {selectCategorias?.id_catv !== 10 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    id="no_ine"
                    name="no_ine"
                    label="No. INE"
                    value={invit.no_ine}
                    onChange={inputChange}
                  />
                  <small color="red">
                    {errorVisita.no_ine && (
                      <span style={{color: 'red'}}>
                        * {errorVisita.no_ine}
                      </span>
                    )}
                  </small>
                </FormControl>
            )}
            </Grid>

            {/* Más campos de texto */}
            <Grid container item marginTop={2} sm={6} md={4.5} >
            <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="nombre"
                  name="nombre"
                  label="Nombre (s)"
                  value={invit.nombre}
                  onChange={inputChange}
                  variant="outlined"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <small>
                  {errorVisita.nombre && (
                    <span style={{color: 'red'}}>
                      * {errorVisita.nombre}
                    </span>
                  )}
                </small>
              </FormControl>
              {selectCategorias?.id_catv === 1 && (
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                      id="puesto"
                      name="puesto"
                      label="Puesto"
                      value={invit.puesto}
                      onChange={inputChange}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <small>
                    {errorVisita.puesto && (
                      <span style={{color: 'red'}}>
                        * {errorVisita.puesto}
                      </span>
                    )}
                  </small>
                </FormControl>
              )}
              {selectCategorias?.id_catv === 1 || selectCategorias?.id_catv === 2 || selectCategorias?.id_catv === 10 ? (
                <div></div>
              ):(
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="empresa"
                  name="empresa"
                  value={invit.empresa}
                  onChange={inputChange}
                  variant="outlined"
                  label="Empresa"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                  disabled={selectCategorias?.id_catv === 1 || selectCategorias?.id_catv === 2}
                />
                <small color="red">
                  {errorVisita.empresa && (
                    <span style={{color: 'red'}}>
                      * {errorVisita.empresa}
                    </span>
                  )}
                </small>
              </FormControl>
              )}
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="telefono"
                  name="telefono"
                  label="Teléfono"
                  value={invit.telefono}
                  onChange={inputChange}
                />
                <small color="red">
                  {errorVisita.telefono && (
                    <span style={{color: 'red'}}>
                      * {errorVisita.telefono}
                    </span>
                  )}
                </small>
              </FormControl>
              
            </Grid>

            {/* Checkbox y datos adicionales */}
            {selectCategorias?.id_catv === 2 || selectCategorias?.id_catv === 12 ? (
            <div></div>
            ): (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox  
                      checked={checked}
                      onChange={handleCheckboxChange}
                      color="primary"
                    />
                  }
                  label="Cuenta con vehículo"
                />
              </Grid>)}

            {checked && (
              <Grid item xs={12}>
                <Divider textAlign="left">
                  <DirectionsCarFilled /> {' '}
                  <b>DATOS DEL VEHÍCULO</b>
                </Divider>
                <Grid container spacing={2} marginTop={2}>
                  <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="no_licencia"
                      name="no_licencia"
                      label="No. licencia"
                      value={invit.no_licencia}
                      onChange={inputChange}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVisitaAuto.no_licencia && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaAuto.no_licencia}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="marca"
                        name="marca"
                        label="Marca"
                        value={invit.marca}
                        onChange={inputChange}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                      <small>
                        {errorVisitaAuto.marca && (
                          <span style={{color: 'red'}}>
                            * {errorVisitaAuto.marca}
                          </span>
                        )}
                      </small>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="modelo"
                        name="modelo"
                        label="Modelo"
                        value={invit.modelo}
                        onChange={inputChange}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                      <small>
                        {errorVisitaAuto.modelo && (
                          <span style={{color: 'red'}}>
                            * {errorVisitaAuto.modelo}
                          </span>
                        )}
                      </small>
                    </FormControl>
                    
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="placa"
                        name="placa"
                        label="Placa"
                        value={invit.placa}
                        onChange={inputChange}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                      <small>
                        {errorVisitaAuto.placa && (
                          <span style={{color: 'red'}}>
                            * {errorVisitaAuto.placa}
                          </span>
                        )}
                      </small>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="anio"
                        name="anio"
                        label="Año"
                        value={invit.anio}
                        onChange={inputChange}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                      <small>
                        {errorVisitaAuto.anio && (
                          <span style={{color: 'red'}}>
                            * {errorVisitaAuto.anio}
                          </span>
                        )}
                      </small>
                    </FormControl>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="seguro"
                        name="seguro"
                        label="Poliza de seguro"
                        value={invit.seguro}
                        onChange={inputChange}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                      <small style={{color:'gray'}}>
                        * Opcional
                      </small>
                    </FormControl>
                    
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {/* Botones de acción */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button variant="outlined" color="secondary" sx={{ mr: 2 }} onClick={handleCloseCreateIn}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={SaveVisitante}
            >
              Finalizar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openCreateTransp}
        onClose={handleCloseCreateTransp}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle> 
            <Box display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              flexDirection={isSmallScreen ? "column" : "row"}>
                NUEVO TRANSPORTISTA
            
                <Grid container item sm={2} md={3} direction="column" marginTop={1} spacing={2}>
                  <Grid item>
                    <Button variant="outlined" color="error" endIcon={<UploadFileOutlined />} onClick={handleClickOpenUpExcelVeh}>
                      Vehículos
                    </Button>
                  </Grid>
                  <Grid item>
                  <Button variant="outlined" color="error" endIcon={<UploadFileOutlined />} onClick={handleClickOpenUpExcel}>
                      transportistas
                    </Button>
                  </Grid>
                </Grid>
              <Dialog
                open={openUpExcel}
                onClose={handleCloseUpExcel}
                maxWidth="md"
                fullWidth
              >
                <Box >
                  <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={isSmallScreen ? "column" : "row"} marginTop={3}>
                      <Typography variant="h6" gutterBottom>
                        Importar información
                      </Typography>
                      <Grid item marginTop={2} sm={2} md={3.5}>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          id="upload-excel"
                        />
                        <label htmlFor="upload-excel">
                          <Button
                            variant="outlined"
                            endIcon={<UploadFile />}
                            component="span"
                            fontSize="small"
                          >
                            Seleccionar archivo
                          </Button>
                        </label>
                      </Grid>
                    </Box>
                    
                  </DialogTitle>
                  <DialogContent>

                    {dataExcel.length > 0 ? (
                      <>
                      <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 600 }} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              {Object.keys(dataExcel[0]).map((key) => (
                                <TableCell key={key}
                                style={{
                                  backgroundColor: invalidColumns.includes(key) ? "#f8d7da" : "inherit",
                                  color: invalidColumns.includes(key) ? "#721c24" : "inherit",
                                }}>{key}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dataExcel.map((row, index) => (
                              <TableRow key={index} >
                                {Object.values(row).map((value, i) => (
                                  <TableCell key={i}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {errorExcel.length > 0 ? (
                        <div style={{ color: "red", marginTop: "20px" }}>
                          <Alert severity="error">
                          <h4>Errores en el archivo:</h4>
                          <ul>
                            {errorExcel.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                          <h4 color="black">Ejemplo del orden: </h4>
                          <img preview src={ejemplo} width='100%'/></Alert>
                        </div>
                      ):(
                        <p>
                          <Alert severity="success">Archivo correcto.</Alert>
                        </p>
                      )}
                      </>
                    ) : (
                      <Grid>
                        <Typography>
                          Antes de cargar el archivo Excel, asegurate que tenga la estructura correcta.
                        </Typography><p/>
                        <Typography>
                          Ejemplo:
                        </Typography>
                        <img preview src={ejemplo} width='100%'/>
                      </Grid>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Box>
                    {dataExcel.length > 0 && (
                      <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleClearExcel}
                        sx={{ mr: 2 }}>
                          Cancelar 
                        </Button>
                        <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseSave}>
                          <Alert severity="error" onClose={handleCloseSave}>{errorSave}</Alert>
                        </Snackbar>
                        <Button
                          variant="outlined"
                          color="primary"
                          endIcon={<Backup />}
                          onClick={handleSaveData}
                          disabled={dataExcel.length === 0}
                        >
                          Guardar Datos
                        </Button>
                        
                      </Box>
                    )}
                  </Box>
                  </DialogActions>
                    
                  
                </Box>
              </Dialog>
              <Dialog
                open={openUpExcelVeh}
                onClose={handleCloseUpExcelVeh}
                maxWidth="md"
                fullWidth
              >
                <Box >
                  <DialogTitle>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                    flexDirection={isSmallScreen ? "column" : "row"}
                    marginTop={3}
                  >
                    <Typography variant="h6" gutterBottom>
                      Importar información de vehículos
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
                      <Grid item sm={12}>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUploadVeh}
                          style={{ display: "none" }}
                          id="upload-excel"
                        />
                        <label htmlFor="upload-excel">
                          <Button
                            variant="outlined"
                            endIcon={<UploadFile />}
                            component="span"
                            fontSize="small"
                          >
                            Seleccionar archivo
                          </Button>
                        </label>
                      </Grid>
                      <Grid item sm={12}>
                        <Button
                          variant="outlined"
                          endIcon={<DirectionsCar />}
                          component="span"
                          fontSize="small"
                          onClick={handleOpenNewVeh}
                        >
                          Registrar vehículo
                        </Button>
                      </Grid>
                    </Box>
                  </Box>

                    
                  </DialogTitle>
                  <DialogContent>

                    {dataExcelVeh.length > 0 ? (
                      <>
                      <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 600 }} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              {Object.keys(dataExcelVeh[0]).map((key) => (
                                <TableCell key={key}
                                style={{
                                  backgroundColor: invalidColumns.includes(key) ? "#f8d7da" : "inherit",
                                  color: invalidColumns.includes(key) ? "#721c24" : "inherit",
                                }}>{key}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dataExcelVeh.map((row, index) => (
                              <TableRow key={index} >
                                {Object.values(row).map((value, i) => (
                                  <TableCell key={i}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {errorExcel.length > 0 ? (
                        <div style={{ color: "red", marginTop: "20px" }}>
                          <Alert severity="error">
                          <h4>Errores en el archivo:</h4>
                          <ul>
                            {errorExcelVeh.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                          <h4 color="black">Ejemplo del orden: </h4>
                          <img preview src={ejemploVeh} width='100%'/></Alert>
                        </div>
                      ):(
                        <p>
                          <Alert severity="success">Archivo correcto.</Alert>
                        </p>
                      )}
                      </>
                    ) : (
                      <Grid>
                        <Typography>
                          Antes de cargar el archivo Excel, asegurate que tenga la estructura correcta.
                        </Typography><p/>
                        <Typography>
                          Ejemplo:
                        </Typography>
                        <img preview src={ejemploVeh} width='100%'/>
                      </Grid>
                    )}
                    {openAlert && (
                      <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
                        ¡Archivo cargado con éxito!
                      </Alert>
                    )}
                    {openAlertError && (
                      <Alert icon={<ErrorOutline fontSize="inherit" />} severity="error">
                        ¡Hubo un error al guardar la información!
                        Verifica el archivo.
                      </Alert>
                    )}
                    
                  </DialogContent>
                  <DialogActions>
                    <Box>
                    {dataExcelVeh.length > 0 && (
                      <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleClearExcelVeh}
                        sx={{ mr: 2 }}>
                          Cancelar 
                        </Button>
                        <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseSave}>
                          <Alert severity="error" onClose={handleCloseSave}>{errorSaveVeh}</Alert>
                        </Snackbar>
                        <Button
                          variant="outlined"
                          color="primary" 
                          endIcon={<Backup />}
                          onClick={handleSaveVehiculoData}
                          disabled={dataExcelVeh.length === 0}
                        >
                          Guardar Datos
                        </Button>
                        
                      </Box>
                    )}
                  </Box>
                  </DialogActions>
                    
                  
                </Box>
              </Dialog>
              <Dialog open={openNewVeh} onClose={handleCloseNewVeh}>
                <DialogTitle>Registrar vehiculo</DialogTitle>
                <DialogContent>
                <Grid container  style={{marginTop:'7px'}}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="empresa"
                      name="empresa"
                      label="Empresa del vehículo"
                      value={vehiculo.empresa}
                      onChange={inputChangeVehiculo}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVehiculo.empresa && (
                        <span style={{color: 'red'}}>
                          * {errorVehiculo.empresa}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="marca"
                      name="marca"
                      label="Marca"
                      value={vehiculo.marca}
                      onChange={inputChangeVehiculo}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVehiculo.marca && (
                        <span style={{color: 'red'}}>
                          * {errorVehiculo.marca}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="modelo"
                      name="modelo"
                      label="Modelo"
                      value={vehiculo.modelo}
                      onChange={inputChangeVehiculo}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVehiculo.modelo && (
                        <span style={{color: 'red'}}>
                          * {errorVehiculo.modelo}
                        </span>
                      )}
                    </small>
                  </FormControl>
                   <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="placa"
                      name="placa"
                      label="Placa"
                      value={vehiculo.placa}
                      onChange={inputChangeVehiculo}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVehiculo.placa && (
                        <span style={{color: 'red'}}>
                          * {errorVehiculo.placa}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="anio"
                      name="anio"
                      label="Año"
                      value={vehiculo.anio}
                      onChange={inputChangeVehiculo}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVehiculo.anio && (
                        <span style={{color: 'red'}}>
                          * {errorVehiculo.anio}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="seguro"
                      name="seguro"
                      label="Poliza de seguro"
                      value={vehiculo.seguro}
                      onChange={inputChangeVehiculo}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small style={{color:'gray'}}>
                      * Opcional
                    </small>
                  </FormControl>
                </Grid>
                
                </DialogContent>
                <DialogActions>
                  <Button variant="outlined">Cancelar</Button>
                  <Button variant="contained" onClick={SaveVehiculo}>Finalizar</Button>
                </DialogActions>
              </Dialog>
          </Box>
        </DialogTitle>
        <DialogContent style={{marginLeft:'5px'}}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed #ccc",
                  width: "100%",
                  height: 230,
                  textAlign: "center",
                  margin: "auto",
                }}
              >
                {image ? (
                  <Box
                    sx={{ textAlign: "center", width: "100%", height: "100%" }}
                  >
                    <img
                      src={
                        typeof image === "string"
                          ? image
                          : URL.createObjectURL(image)
                      }
                      alt="preview"
                      style={{ width: "100%", maxHeight: 170, borderRadius: 8 }}
                    />
                    <Typography variant="body2" sx={{ color: "black" }}>
                      {image.name || "Captura de Webcam"}
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={removeImage}
                      sx={{ mt: 1 }}
                    >
                      Quitar Imagen
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{ width: "95%", mb: 1 }}
                      component="label"
                    >
                      Seleccionar Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onTemplateSelect1}
                        hidden
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      sx={{ width: "95%", mb: 1 }}
                      onClick={handleClickOpenCam}
                    >
                      Tomar Foto
                    </Button>
                    <Dialog
                      header="TOMAR FOTO"
                      open={openCam}
                      onClose={handleCloseCam}
                    >
                      <Box style={{ textAlign: "center", margin:'20px'  }}>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        style={{ width: '100%' }}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMedia={handleUserMedia}
                        onUserMediaError={handleUserMediaError}
                      />
                        {!isCameraReady && webcamRef ? ( // Mostrar mensaje de carga mientras la cámara no esté lista
                          <p style={{ marginTop: "20px", fontSize: "16px", color: "#888", textAlign:'center' }}>
                            Cargando cámara...
                          </p>
                        ) : (
                          <Button
                            severity="danger"
                            variant="outlined"
                            startIcon={<PhotoCamera />}
                            style={{ width: "100%", marginTop: "20px" }}
                            onClick={tomarFoto}
                          >
                            Tomar Foto
                          </Button>
                        )}
                        
                      </Box>
                    </Dialog>
                  </Box>
                )}
              </Box>
              <small style={{color:'gray'}}>
                * Opcional
              </small>
            </Grid>

            <Grid container item marginTop={2} sm={6} md={4.5}  >
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="id_catv">Tipo de invitado</InputLabel>
                  <Select
                    labelId="id_catv"
                    id="id_catv"
                    name="id_catv"
                    value={selectCategoriasMT}
                    onChange={handleDropdownChangeTipoMt}
                    label="Tipo de invitado"
                  >
                    <MenuItem value={null}>SELECCIONAR TIPO</MenuItem>
                    {categoriasMT.map((item) => (
                      <MenuItem key={item.id_catv} value={item}>
                          {item.tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  <small>
                  {errorTransp.id_catv && (
                    <span style={{color: 'red'}}>
                      * {errorTransp.id_catv}
                    </span>
                  )}
                </small>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="apellidos"
                  name="apellidos"
                  label="Apellidos"
                  value={transp.apellidos}
                  onChange={inputChangeTransp}
                  variant="outlined"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <small >
                  {errorTransp.apellidos && (
                    <span style={{color: 'red'}}>
                      * {errorTransp.apellidos}
                    </span>
                  )}
                </small>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="telefono"
                  name="telefono"
                  label="Teléfono"
                  value={transp.telefono}
                  onChange={inputChangeTransp}
                />
                <small>
                  {errorTransp.telefono && (
                    <span style={{color: 'red'}}>
                      * {errorTransp.telefono}
                    </span>
                  )}
                </small>
              </FormControl>
              {(selectCategoriasMT?.id_catv === 5 || selectCategoriasMT?.id_catv === 6 || selectCategoriasMT?.id_catv === 11) && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  id="no_licencia"
                  name="no_licencia"
                  label="No. licencia"
                  value={transp.no_licencia}
                  onChange={inputChangeTransp}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <small>
                  {errorTransp.no_licencia && (
                    <span style={{color: 'red'}}>
                      * {errorTransp.no_licencia}
                    </span>
                  )}
                </small>
              </FormControl>)}
            </Grid>

            {/* Más campos de texto */}
            <Grid container item marginTop={2} md={4.5}>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="nombre"
                  name="nombre"
                  value={transp.nombre}
                  onChange={inputChangeTransp}
                  variant="outlined"
                  label="Nombre (s)"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <small>
                  {errorTransp.nombre && (
                    <span style={{color: 'red'}}>
                      * {errorTransp.nombre}
                    </span>
                  )}
                </small>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="empresa"
                  name="empresa"
                  value={transp.empresa}
                  onChange={inputChangeTransp}
                  variant="outlined"
                  label="Empresa"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <small>
                  {errorTransp.empresa && (
                    <span style={{color: 'red'}}>
                      * {errorTransp.empresa}
                    </span>
                  )}
                </small>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="no_ine"
                  name="no_ine"
                  label="No. INE"
                  value={transp.no_ine}
                  onChange={inputChangeTransp}
                />
                <small>
                {errorTransp.no_ine && (
                  <span style={{color: 'red'}}>
                    * {errorTransp.no_ine}
                  </span>
                )}
              </small>
              </FormControl>
            </Grid>

            {/* Checkbox y datos adicionales */}
            {/*<Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label="Cuenta con vehículo"
              />
            </Grid>*/}

          </Grid>
        </DialogContent>
        <DialogActions>
          {/* Botones de acción */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button variant="outlined" color="secondary" sx={{ mr: 2 }} onClick={handleCloseCreateTransp}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={SaveTransp}
            >
              Finalizar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openCreateVisita}
        onClose={handleCloseCreateVisita}
        maxWidth="md"
        fullWidth
        >
          <DialogTitle>NUEVA VISITA</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Selección de visita */}
              <Grid item xs={4} sm={6} style={{marginTop:'5px'}}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="id_vit">Selecciona una visita</InputLabel>
                <Select
                  labelId="id_vit"
                  id="id_vit"
                  name="id_vit"
                  value={selectedAcs}
                  onChange={(e) => handleDropdownChange(e.target.value)}
                  label="Selecciona una visita"
                >
                  {/* Opción predeterminada */}
                  <MenuItem value={null}>SELECCIONAR UNA VISITA</MenuItem>

                  {/* Opciones filtradas */}
                  {accesos
                    .filter((item) => {
                      if (user?.role === "Admin") {
                        // Admin ve todo
                        return true;
                      }
                      if (user?.role === "CONTROL" || user?.role === "Imp") {
                        return item.clave.startsWith("TR") || item.clave.startsWith("MN");
                      }
                      if (user?.role === "RH") {
                        return item.clave.startsWith("VT");
                      }
                      if (user?.role === "Nac") {
                        return false; // No muestra nada para este rol
                      }
                      return true; // Otros roles ven todo
                    })
                    .map((item) => (
                      <MenuItem key={item.clave} value={item}>
                        {item.label}
                      </MenuItem>
                    ))}
                </Select>

                {/* Mensaje de error */}
                <small>
                  {errorVisitas.id_vit && (
                    <span style={{ color: "red" }}>* {errorVisitas.id_vit}</span>
                  )}
                </small>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="categoria"
                  name="categoria"
                  value={selectedAcs?.categoria || ""}
                  label="Tipo de visita"
                  InputProps={{ readOnly: true }}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    id="personal"
                    name="personal"
                    label="Responsable de la visita"
                    value={visita.personal || (selectedAcs?.categoria === "TRANSPORTISTA" || selectedAcs?.categoria === "PAQUETERIA" ? "LAURA RODRIGUEZ" : "")}
                    onChange={(e) => {
                      const value = e.target.value;
                      inputChangeVis({ target: { name: "personal", value } }); // Actualiza el estado
                    }}
                    inputProps={{
                      style: { textTransform: 'uppercase' }, // Transforma visualmente
                    }}
                  />
                  <small>
                    {errorVisitas.personal && (
                      <span style={{ color: 'red' }}>* {errorVisitas.personal}</span>
                    )}
                  </small>
                </FormControl>
              </Grid>

              {/* fecha y hors */}
              <Grid item xs={12} sm={6} style={{marginTop:'5px'}}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <LocalizationProvider adapterLocale="es" dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Día de la visita"
                      value={date}
                      onChange={handleDateChange}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                  <small>
                    {errorVisitas.reg_entrada && (
                      <span style={{color: 'red'}}>
                        * {errorVisitas.reg_entrada}
                      </span>
                    )}
                  </small>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Hora de la visita"
                      value={time}
                      onChange={handleTimeChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                  <small>
                    {errorVisitas.hora_entrada && (
                      <span style={{color: 'red'}}>
                        * {errorVisitas.hora_entrada}
                      </span>
                    )}
                  </small>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="area_per">Area que visita</InputLabel>
                    <Select
                      labelId="area_per"
                      id="area_per"
                      name="area_per"
                      value={selectedArea}
                      onChange={handleDropdownChangeArea}
                      label="Area que visita"
                    >
                      <MenuItem value={null}>SELECCIONAR ÁREA</MenuItem>
                      { 
                        (selectedAcs?.categoria === 'TRANSPORTISTA' || selectedAcs?.categoria === 'PAQUETERIA' || selectedAcs?.categoria === 'MANIOBRISTA' ? areasTR : areas)
                        .map((item) => (
                          <MenuItem key={item.id_area} value={item}>
                            {item.area}
                          </MenuItem>
                        ))
                      }
                    </Select>
                    <small>
                    {errorVisita.id_area && (
                      <span style={{color: 'red'}}>
                        * {errorVisita.id_area}
                      </span>
                    )}
                  </small>
                </FormControl>
              </Grid>

              {/* Área y acompañantes */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    id="motivo"
                    name="motivo"
                    label="Motivo de la visita"
                    value={visita.motivo}
                    onChange={inputChangeVis}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                  <small>
                    {errorVisitas.motivo && (
                      <span style={{color: 'red'}}>
                        * {errorVisitas.motivo}
                      </span>
                    )}
                  </small>
                </FormControl>
                <FormControlLabel
                  control={
                      <Checkbox
                      checked={checkedVisita}
                      onChange={(e) => setCheckedVisita(e.target.checked)}
                      />
                  }
                  label="Acompañantes"
                />


                {checkedVisita && (
                  <Grid item xs={12}>
                    {acompanantes.map((acompanante, index) => (
                      <div>
                        <span>{`Datos de acompañante ${index + 1}`}</span><p/>
                      <Grid
                        container
                        key={index}
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                          <Grid item>
                            <TextField
                            fullWidth
                            id={`nombre_acomp_${index}`}
                            name={`nombre_acomp_${index}`}
                            value={acompanante.nombre_acomp}
                            onChange={(e) =>
                              handleInputChange(index, {
                                ...acompanante,
                                nombre_acomp: e.target.value,
                              })
                            }
                            label={`Nombre de acompañante`}
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                          />
                          </Grid>
                          <Grid item>
                          
                          <TextField
                            fullWidth
                            id={`apellidos_acomp_${index}`}
                            name={`apellidos_acomp_${index}`}
                            value={acompanante.apellidos_acomp}
                            onChange={(e) =>
                              handleInputChange(index, {
                                ...acompanante,
                                apellidos_acomp: e.target.value,
                              })
                            }
                            label={`Apellidos de acompañante`}
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                          />
                          </Grid>
                          <Grid item>
                          <TextField
                            fullWidth
                            id={`no_ine_acomp_${index}`}
                            name={`no_ine_acomp_${index}`}
                            value={acompanante.no_ine_acomp}
                            onChange={(e) =>
                              handleInputChange(index, {
                                ...acompanante,
                                no_ine_acomp: e.target.value,
                              })
                            }
                            label={`No. INE de acompañante`}
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                          />
                        </Grid>
                        <Grid item>
                          <IconButton
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => eliminarAcompanante(index)}
                          >
                            <DeleteOutline/>
                          </IconButton>
                        </Grid>
                      </Grid>
                      </div>
                    ))}
                    {acompanantes.length < 4 ? ( // Controla si el botón se muestra
                      <Button
                        variant="outlined"
                        onClick={agregarAcompanante}
                        startIcon={<Add />}
                      >
                        Otro acompañante
                      </Button>
                    ) : (
                      <p style={{ color: "red" }}>Solo puedes agregar un máximo de 2 acompañantes</p>
                    )}
                      </Grid>
                    )}
                
                {selectedAcs?.placa && selectedAcs?.tipo === "PAQUETERIA" && selectedAcs?.clave?.startsWith('VT') && (
                  <p>  
                  <Divider textAlign="left" style={{margin:'10px'}}>
                    <CarCrash/>
                  </Divider>  
                  <Typography variant="h7">
                    Este visitante tiene un vehículo registrado.
                  </Typography><p/>
                  <Typography variant="h8">
                    ¿Desea solicitar el acceso del vehículo? 
                    
                  </Typography>
                  <FormControlLabel
                    sx={{marginLeft:'2px'}}
                    control={
                      <Checkbox
                      checked={checkedAcceso}
                      onChange={handleCheckboxChangeAccess}
                      />
                    }
                    label="Solicitar acceso"
                  />

                    {checkedAcceso && (
                      <FormControl fullWidth sx={{ mb: 2 }}>   
                        <TextField
                          sx={{marginTop:'10px'}}
                          fullWidth
                          id='motivo_acc'
                          name='motivo_acc'
                          value={visita.motivo_acc}
                          onChange={inputChangeVis}
                          label='Motivo del acceso'
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          />
                          
                      </FormControl>
                    )}
                  </p>
                )}
              </Grid>
              
        {/**seguir modificando la solicitud de acceso de los autos de los carros */}
            </Grid>
          </DialogContent>
          <DialogActions>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCloseCreateVisita}
            >
            Cancelar
            </Button>
            <Button
            variant="contained"
            color="primary"
            onClick={saveVisitas}
            startIcon={<EditCalendar />}
            >
              Agendar
            </Button>
          </DialogActions>
            
        </Dialog>
        <Dialog
          open={openCreatePaqueteria}
          onClose={handleClickClosePaqueteria}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ENTRADA DE PAQUETERIA</DialogTitle>
            <DialogContent style={{margin:'5px'}}>
              <Grid container spacing={2}>

                <Grid item xs={4} sm={6}  style={{marginTop:'5px'}}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="empresa">Selecciona una paqueteria</InputLabel>
                    <Select 
                      labelId="empresa" 
                      id="empresa" 
                      name="empresa" 
                      value={selectedPaqueteria} 
                      onChange={(e) => handleDropdownChangePP(e.target.value)}
                      label='Selecciona una paqueteria' 
                    >
                      <MenuItem value={null}>SELECCIONAR UNA PAQUETERIA</MenuItem>
                        {paqueterias.map((item) => (
                          <MenuItem key={item.id_paq} value={item}>
                              {item.paqueteria}
                          </MenuItem>
                        ))}
                    </Select>
                    <small>
                      {errorVisitaPaqueteria.empresa && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.empresa}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      id="apellidos"
                      name="apellidos"
                      label="Apellidos"
                      value={paq.apellidos}
                      onChange={inputChangePaq}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <small>
                      {errorVisitaPaqueteria.apellidos && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.apellidos}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  
                </Grid>

                <Grid item xs={12} sm={6} style={{marginTop:'5px'}}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      id="nombre"
                      name="nombre"
                      label="Nombre (s)"
                      value={paq.nombre}
                      onChange={inputChangePaq}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <small>
                      {errorVisitaPaqueteria.nombre && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.nombre}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      id="no_ide"
                      name="no_ide"
                      label="No. Identificación"
                      value={paq.no_ide}
                      onChange={inputChangePaq}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <small>
                      {errorVisitaPaqueteria.no_ide && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.no_ide}
                        </span>
                      )}
                    </small>
                  </FormControl>

                  {paq.no_ide && ( 
                    <>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={checkedIne}
                            onChange={() => handleCheckboxChangeIne("ine")}
                          />
                        }
                        label="No. INE"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={checkedLic}
                            onChange={() => handleCheckboxChangeIne("lic")}
                          />
                        }
                        label="No. Licencia"
                      /><br/>
                      <small>
                      {errorVisitaPaqueteria.checks && (
                        <span style={{ color: 'red' }}>
                          * {errorVisitaPaqueteria.checks}
                        </span>
                      )}
                      </small>
                    </>
                  )}
                  
                  
                </Grid>
                      
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="area_per">No. Cortina</InputLabel>
                    <Select
                      labelId="area_per"
                      id="area_per"
                      name="area_per"
                      value={selectedCortina}
                      onChange={handleDropdownChangeCortina}
                      label="No. Cortina"
                    >
                      <MenuItem value={null}>SELECCIONAR CORTINA</MenuItem>
                      {cortinas
                        .filter((item) => 
                          selectedPaqueteria?.id_paq === 7 || selectedPaqueteria?.id_paq === 8 ? [1, 2, 3, 4, 5,7].includes(item.id_cor) : true
                        )
                        .map((item) => (
                          <MenuItem key={item.id_cor} value={item}>
                              {item.cortina}
                          </MenuItem>
                      ))}
                    </Select>
                    <small>
                      {errorVisitaPaqueteria.area_per && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.area_per}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  
                    <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="marca"
                      name="marca"
                      label="Marca"
                      value={paq.marca}
                      onChange={inputChangePaq}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVisitaPaqueteria.marca && (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.marca}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  
                </Grid>
                <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    id="motivo"
                    name="motivo" 
                    label="Motivo de la visita"
                    value={paq.motivo || selectedCortina?.area || ""}
                    onChange={inputChangePaq}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                </FormControl>
                
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="placa"
                      name="placa"
                      label="Placa"
                      value={paq.placa}
                      onChange={inputChangePaq}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorVisitaPaqueteria.placa&& (
                        <span style={{color: 'red'}}>
                          * {errorVisitaPaqueteria.placa}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  
                </Grid>
                <Grid item xs={12} >
                  <FormControlLabel
                    control={
                      <Checkbox
                      checked={checkedPaq}
                      onChange={(e) => setCheckedPaq(e.target.checked)}
                      />
                    }
                    label="Acompañantes"
                  />
                  {checkedPaq && (
                    <Grid item xs={12}>
                      {acompanantesPaq.map((acompanante, index) => (
                        <div>
                          <span>{`Datos de acompañante ${index + 1}`}</span><p/>
                        <Grid
                          container
                          key={index}
                          spacing={2}
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                            <Grid item>
                              <TextField
                              fullWidth
                              id={`nombre_acomp_${index}`}
                              name={`nombre_acomp_${index}`}
                              value={acompanante.nombre_acomp}
                              onChange={(e) =>
                                handleInputChangePaq(index, {
                                  ...acompanante,
                                  nombre_acomp: e.target.value,
                                })
                              }
                              label={`Nombre de acompañante`}
                              inputProps={{ style: { textTransform: 'uppercase' } }}
                            />
                            </Grid>
                            <Grid item>
                            
                            <TextField
                              fullWidth
                              id={`apellidos_acomp_${index}`}
                              name={`apellidos_acomp_${index}`}
                              value={acompanante.apellidos_acomp}
                              onChange={(e) =>
                                handleInputChangePaq(index, {
                                  ...acompanante,
                                  apellidos_acomp: e.target.value,
                                })
                              }
                              label={`Apellidos de acompañante`}
                              inputProps={{ style: { textTransform: 'uppercase' } }}
                            />
                            </Grid>
                            <Grid item>
                            <TextField
                              fullWidth
                              id={`no_ine_acomp_${index}`}
                              name={`no_ine_acomp_${index}`}
                              value={acompanante.no_ine_acomp}
                              onChange={(e) =>
                                handleInputChangePaq(index, {
                                  ...acompanante,
                                  no_ine_acomp: e.target.value,
                                })
                              }
                              label={`No. Identificación`}
                              inputProps={{ style: { textTransform: 'uppercase' } }}
                            />
                          </Grid>
                          <Grid item>
                            <IconButton
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => eliminarAcompanantePaq(index)}
                            >
                              <DeleteOutline/>
                            </IconButton>
                          </Grid>
                        </Grid>
                        </div>
                      ))}
                      {acompanantesPaq.length < 2 ? (
                        <Button
                          variant="outlined"
                          onClick={agregarAcompanantePaq}
                          startIcon={<Add />}
                        >
                          Otro acompañante
                        </Button>
                      ) : (
                        <p style={{ color: "red" }}>Solo puedes agregar un máximo de 2 acompañantes</p>
                      )}
                    </Grid>
                  )}
                  {showErrorAlertPlaca && (
                  <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="error">
                    Esta placa ya ha sido registrada hoy
                  </Alert>
                )}
                </Grid>
                
              </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClickClosePaqueteria}
                >
                Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={SaveVisitantePaqueteria}
                  startIcon={<EditCalendar />}
                >
                  Registrar
                </Button>
            </DialogActions>
            
        </Dialog>
        {/* Filtro debajo del buscador y botones */}
        
        {(user?.role === 'POLIB' || user?.role === 'POLIP' || user?.role === 'Admin') && (
          <div>
            <Box mb={2}>
              <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
                <Grid item>
                  {isMobile ? (
                    <div>
                      <ButtonGroup>
                      <Button onClick={mostrarTodos}>
                        VISITAS ACTIVAS
                      </Button>
                      <Button
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDown  />}
                      />
                      </ButtonGroup>
                        <Menu anchorEl={anchorEl} open={open} onClose={() => handleCloseFiltro()}>
                          <MenuItem onClick={() => handleCloseFiltro(mostrarTodos)}>TODOS</MenuItem>
                          <MenuItem onClick={() => handleCloseFiltro(mostrarVisitantes)}>VISITANTES</MenuItem>
                          <MenuItem onClick={() => handleCloseFiltro(mostrarTransportistas)}>TRANSPORTISTAS</MenuItem>
                          <MenuItem onClick={() => handleCloseFiltro(() => { mostrarProveedores(); mostrarProveedor(); })}>PROVEEDORES</MenuItem>
                          <MenuItem onClick={() => handleCloseFiltro(mostrarPaqueterias)}>PAQUETERIAS</MenuItem>
                          <MenuItem onClick={() => handleCloseFiltro(mostrarClientes)}>CLIENTES RECOGE</MenuItem>
                      </Menu>
                    </div>
                  ):(
                    <div style={{ marginBottom: "10px", textAlign:'center' }}>
                      <ButtonGroup variant="text" aria-label="Basic button group">
                        <Button size="small"  onClick={mostrarTodos}>TODOS</Button>
                        <Button size="small"  onClick={mostrarVisitantes}>VISITANTES</Button>
                        <Button size="small"  onClick={mostrarTransportistas}>TRANSPORTISTAS</Button>
                        <Button size="small"  onClick={mostrarProveedores && mostrarProveedor}>PROVEEDORES</Button>
                        <Button size="small"  onClick={mostrarPaqueterias}>PAQUETERIAS</Button>
                        <Button size="small"  onClick={mostrarClientes}>CLIENTES RECOGE</Button>
                      </ButtonGroup> 
                    </div>
                    
                  )}
                
                </Grid>
              </Grid>
              <p>
              {showSuccessAlert && (
                <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
                  ¡Multa registrada con éxito!
                </Alert>
              )}
              </p>
              <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  {/* Encabezado de la tabla para Visitantes */}
                  <TableHead>
                    {/* <TableRow>
                      <TableCell align="center"></TableCell>
                      <TableCell align="center">NOMBRE</TableCell>
                      <TableCell align="center">EMPRESA</TableCell>
                      <TableCell align="center">RESPONSABLE</TableCell>
                      <TableCell align="center">ÁREA</TableCell>
                      <TableCell align="center">ENTRADA</TableCell>
                      <TableCell align="center">VEHÍCULO</TableCell>
                    </TableRow> */}
                    <TableRow>
                      {columns.map((column) => (
                         
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ top: 57, minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} align="left" style={{ backgroundColor: '#f5f3f3', textAlign: isMobile ? 'left' :'center' }}><strong>VISITANTES</strong></TableCell>
                    </TableRow>
                    {/* <TableRow>
                      <TableCell align="center"></TableCell>
                      <TableCell align="left" >Nombre</TableCell>
                      <TableCell align="left">Empresa</TableCell>
                      <TableCell align="left">Responsable</TableCell>
                      <TableCell align="left">Área</TableCell>
                      <TableCell align="left">Entrada</TableCell>
                      <TableCell align="left">Vehículo</TableCell>
                    </TableRow>  */}
                  </TableHead>
                  <TableBody>
                    {datosFiltradosVisitantes.filter((row) => row.est === 'A').map((row, index) => {
                      const tiempoTranscurrido = calcularTiempo(row.entrada_h);
                      const excedeTiempo = tiempoTranscurrido.includes('hr') && parseInt(tiempoTranscurrido.split('hr')[0]) >= 1;

                      return (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" align="center" sx={{ width: '30%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Avatar
                                src={row.foto ? `${foto}/${row.foto}` : '/placeholder.png'}
                                alt={row.nombre_completo || 'Sin nombre'}
                                sx={{ width: 85, height: 85, marginRight: '15px', objectFit: 'cover' }}
                              />
                              <strong>Visita: {row.clave_visit}</strong>
                            </div>
                            <br />
                            <Alert
                              icon={excedeTiempo ? <AvTimer/> : <PrecisionManufacturing />}
                              severity={excedeTiempo ? 'error' : 'success'}
                              action={
                                <div>
                                  <Tooltip title="Multar">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenBloquear(row)}>
                                      <DoNotDisturbOn fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Finalizar">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenSalida(row)}>
                                      <Error fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              }
                            >
                              {excedeTiempo ? `Tiempo excedido:  ${tiempoTranscurrido}` : `Trabajando:  ${tiempoTranscurrido}`}
                            </Alert>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '18%' }}>
                            <strong>{row.nombre_completo}</strong>
                            <br />
                            <small style={{ marginLeft: '10px' }}>{row.tipo}</small>
                          </TableCell>
                          <TableCell align="center" sx={{ width: '18%' }}>{row.id_catv === 1 ? ( 'COLABORADOR SANTUL'): row.id_catv === 2 ? ('NO APLICA') : (row.empresa)} </TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.personal}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.area}<br/>
                          <small style={{ marginLeft: '10px' }}>Motivo: {row.motivo}</small>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '15%' }}>
                            {row.entrada_h
                              ? new Date(row.entrada_h).toLocaleString('es-ES', {
                                  hour12: true,
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </TableCell>
                          <TableCell align="left">
                            {row.id_catv === 4 ? (
                              <span>{row.contenedor}</span>
                            ) : row.placa === '' || row.placa === null ? (
                              <span>No aplica</span>
                            ) : (
                              <span>{row.placa}</span>
                            )}
                            
                            <br />
                            <small style={{ marginLeft: '10px' }}>
                            
                            { row.acc === 'S' || row.acc_veh === 'S' ? (
                              <span>Vehículo: AUTORIZADO.</span>
                            ) : row.acc === 'N' || row.acc_veh === '' ? (
                              <span>Vehículo: NO AUTORIZADO</span>
                            ) : (
                              <span>No aplica</span>
                            )}
                              
                            </small>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody><p/>

                  <TableHead>
                    <TableRow >
                      <TableCell colSpan={7} align="left" style={{ backgroundColor: '#f5f3f3', textAlign: isMobile ? 'left' :'center' }}><strong>TRANSPORTISTAS</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filtro === 'transportistas' || filtro === 'todos') && datosFiltradosTransportistas.filter((row) => row.validado === "S" && row.est === 'A').map((row, index) => {
                      const tiempoTranscurrido = calcularTiempo(row.entrada_h);
                      const excedeTiempo = tiempoTranscurrido.includes('hr') && parseInt(tiempoTranscurrido.split('hr')[0]) >= 4;
              
                      return (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" align="center" sx={{width: '30%'}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Avatar
                                src={row.foto ? `${foto}/${row.foto}` : '/placeholder.png'}
                                alt={row.nombre_completo || 'Sin nombre'}
                                sx={{ width: 85, height: 85, marginRight: '15px', objectFit: 'cover' }}
                              />
                              <strong>Visita: {row.clave_visit}</strong>
                            </div>
                            <br />
                            <Alert
                              icon={excedeTiempo ? <AvTimer/> : <PrecisionManufacturing />}
                              severity={excedeTiempo ? 'error' : 'success'}
                              action={
                                <div>
                                  <Tooltip title="Bloquear">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenBloquear(row)}>
                                      <DoNotDisturbOn fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Finalizar">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenSalida(row)}>
                                      <Error fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              }
                            >
                              {excedeTiempo ? `Tiempo excedido:  ${tiempoTranscurrido}` : `Trabajando:  ${tiempoTranscurrido}`}
                            </Alert>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '18%' }}>
                            <strong>{row.nombre_completo}</strong>
                            <br />
                            <small style={{ marginLeft: '10px' }}>{row.tipo}</small>
                          </TableCell>
                          <TableCell align="center" sx={{ width: '18%' }}>{row.id_catv === 7 ? (row.paqueteria): (row.empresa)}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.personal}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.area}<br/>
                          <small style={{ marginLeft: '10px' }}>Motivo: {row.motivo}</small>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '12%' }}>
                            {row.entrada_h
                              ? new Date(row.entrada_h).toLocaleString('es-ES', {
                                  hour12: true,
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </TableCell>
                          <TableCell align="left" sx={{ width: '16%' }}>
                            {row.placa}
                            <br />
                            <small style={{ marginLeft: '10px' }}>
                              {row.acc === 'S' || row.acc_veh === 'S' || row.acc_dir === 'S' ? (
                                <span>Vehículo: AUTORIZADO.</span>
                              ) :row.acc === 'N' || row.acc_veh === '' ? (
                                <span>Vehículo: NO AUTORIZADO</span>
                              ): (
                                <span>No aplica</span>
                              )}
                            </small>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  <TableHead>
                    <TableRow >
                      <TableCell colSpan={7} align="left" style={{ backgroundColor: '#f5f3f3', textAlign: isMobile ? 'left' :'center'}}><strong>PROVEEDORES</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filtro === 'proveedores' || filtro === 'todos') && datosFiltradosProveedor && datosFiltradosProveedorImp && datosFiltradosProveedores.filter((row) => row.validado === "S" &&  row.est === 'A').map((row, index) => {
                      const tiempoTranscurrido = calcularTiempo(row.entrada_h);
                      const excedeTiempo = tiempoTranscurrido.includes('hr') && parseInt(tiempoTranscurrido.split('hr')[0]) >= 4;
              
                      return (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" align="center" sx={{width: '30%'}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Avatar
                                src={row.foto ? `${foto}/${row.foto}` : '/placeholder.png'}
                                alt={row.nombre_completo || 'Sin nombre'}
                                sx={{ width: 85, height: 85, marginRight: '15px', objectFit: 'cover' }}
                              />
                              <strong>Visita: {row.clave_visit}</strong>
                            </div>
                            <br />
                            <Alert
                              icon={excedeTiempo ? <AvTimer/> : <PrecisionManufacturing />}
                              severity={excedeTiempo ? 'error' : 'success'}
                              action={
                                <div>
                                  <Tooltip title="Bloquear">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenBloquear(row)}>
                                      <DoNotDisturbOn fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Finalizar">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenSalida(row)}>
                                      <Error fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              }
                            >
                              {excedeTiempo ? `Tiempo excedido:  ${tiempoTranscurrido}` : `Trabajando:  ${tiempoTranscurrido}`}
                            </Alert>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '18%' }}>
                            {row.id_catv === 13 ? (
                              <strong>{row.nombre_completo}</strong>
                            ):(
                              <strong>{row.nombre_com_acomp}</strong>
                            )}
                            
                            <br />
                            <small style={{ marginLeft: '10px' }}>{row.tipo}</small>
                          </TableCell>
                          <TableCell align="center" sx={{ width: '18%' }}>NO APLICA</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.personal}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.area}<br/>
                          <small style={{ marginLeft: '10px' }}>Motivo: {row.motivo}</small>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '12%' }}>
                            {row.entrada_h
                              ? new Date(row.entrada_h).toLocaleString('es-ES', {
                                  hour12: true,
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </TableCell>
                          <TableCell align="left" sx={{ width: '16%' }}>
                            {row.contenedor}
                            <br />
                            <small style={{ marginLeft: '10px' }}>
                              {row.acc === 'S' || row.acc_veh === 'S' ? (
                                <span>Vehículo: AUTORIZADO.</span>
                              ) :row.acc === 'N' || row.acc_veh === '' ? (
                                <span>Vehículo: NO AUTORIZADO</span>
                              ): (
                                <span>No aplica</span>
                              )}
                            </small>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  <TableHead>
                    <TableRow >
                      <TableCell colSpan={7} align="left" style={{ backgroundColor: '#f5f3f3', textAlign: isMobile ? 'left' :'center' }}><strong>PAQUETERIAS</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filtro === 'paqueterias' || filtro === 'todos') && datosFiltradosPaqueterias.filter((row) => row.validado === "S" &&  row.est === 'A').map((row, index) => {
                      const tiempoTranscurrido = calcularTiempo(row.entrada_h);
                      const excedeTiempo = tiempoTranscurrido.includes('hr') && parseInt(tiempoTranscurrido.split('hr')[0]) >= 4;
              
                      return (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" align="center" sx={{width: '30%'}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Avatar
                                src={row.foto ? `${foto}/${row.foto}` : '/placeholder.png'}
                                alt={row.nombre_completo || 'Sin nombre'}
                                sx={{ width: 85, height: 85, marginRight: '15px', objectFit: 'cover' }}
                              />
                              <strong>Visita: {row.clave_visit}</strong>
                            </div>
                            <br />
                            <Alert
                              icon={excedeTiempo ? <AvTimer/> : <PrecisionManufacturing />}
                              severity={excedeTiempo ? 'error' : 'success'}
                              action={
                                <div>
                                  <Tooltip title="Bloquear">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenBloquear(row)}>
                                      <DoNotDisturbOn fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Finalizar">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenSalida(row)}>
                                      <Error fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              }
                            >
                              {excedeTiempo ? `Tiempo excedido:  ${tiempoTranscurrido}` : `Trabajando:  ${tiempoTranscurrido}`}
                            </Alert>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '18%' }}>
                            <strong>{row.nombre_completo}</strong>
                            <br />
                            <small style={{ marginLeft: '10px' }}>{row.tipo}</small>
                          </TableCell>
                          <TableCell align="center" sx={{ width: '18%' }}>{row.id_catv === 7 ? (row.paqueteria): (row.empresa)}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.personal}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.area}<br/>
                          <small style={{ marginLeft: '10px' }}>Motivo: {row.motivo}</small>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '12%' }}>
                            {row.entrada_h
                              ? new Date(row.entrada_h).toLocaleString('es-ES', {
                                  hour12: true,
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </TableCell>
                          <TableCell align="left" sx={{ width: '16%' }}>
                            {row.placa}
                            <br />
                            <small style={{ marginLeft: '10px' }}>
                              {row.acc === 'S' || row.acc_veh === 'S' || row.acc_dir === 'S' ? (
                                <span>Vehículo: AUTORIZADO.</span>
                              ) :row.acc === 'N' || row.acc_veh === '' ? (
                                <span>Vehículo: NO AUTORIZADO</span>
                              ): (
                                <span>No aplica</span>
                              )}
                            </small>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableHead>
                    <TableRow >
                      <TableCell colSpan={7} align="left" style={{ backgroundColor: '#f5f3f3', textAlign: isMobile ? 'left' :'center' }}><strong>CLIENTES</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody> 
                    {(filtro === 'clientes' || filtro === 'todos') && datosFiltradosClienteRecoge.filter((row) => row.validado === "S" &&  row.est === 'A').map((row, index) => {
                      const tiempoTranscurrido = calcularTiempo(row.entrada_h); 
                      const excedeTiempo = tiempoTranscurrido.includes('hr') && parseInt(tiempoTranscurrido.split('hr')[0]) >= 4;
              
                      return (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" align="center" sx={{width: '30%'}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Avatar
                                src={row.foto ? `${foto}/${row.foto}` : '/placeholder.png'}
                                alt={row.nombre_completo || 'Sin nombre'}
                                sx={{ width: 85, height: 85, marginRight: '15px', objectFit: 'cover' }}
                              />
                              <strong>Visita: {row.clave_visit}</strong>
                            </div>
                            <br />
                            <Alert
                              icon={excedeTiempo ? <AvTimer/> : <PrecisionManufacturing />}
                              severity={excedeTiempo ? 'error' : 'success'}
                              action={
                                <div>
                                  <Tooltip title="Bloquear">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenBloquear(row)}>
                                      <DoNotDisturbOn fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Finalizar">
                                    <IconButton aria-label="delete" size="small" onClick={() => handleClickOpenSalida(row)}>
                                      <Error fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              }
                            >
                              {excedeTiempo ? `Tiempo excedido:  ${tiempoTranscurrido}` : `Trabajando:  ${tiempoTranscurrido}`}
                            </Alert>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '18%' }}>
                            <strong>{row.nombre_completo}</strong>
                            <br />
                            <small style={{ marginLeft: '10px' }}>{row.tipo}</small>
                          </TableCell>
                          <TableCell align="center" sx={{ width: '18%' }}>{row.id_catv === 11 ? 'N/A': (row.empresa)}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.personal}</TableCell>
                          <TableCell align="left"  sx={{ width: '18%' }}>{row.area}<br/>
                          <small style={{ marginLeft: '10px' }}>Motivo: {row.motivo}</small>
                          </TableCell>
                          <TableCell align="left" sx={{ width: '12%' }}>
                            {row.entrada_h
                              ? new Date(row.entrada_h).toLocaleString('es-ES', {
                                  hour12: true,
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </TableCell>
                          <TableCell align="left" sx={{ width: '16%' }}>
                            {row.placa === '' ? (
                              'No aplica'
                            ): (
                              <>{row.placa}</>
                            )}
                            <br />
                            <small style={{ marginLeft: '10px' }}>
                              {row.acc === 'S' || row.acc_veh === 'S' || row.acc_dir === 'S' ? (
                                <span>Vehículo: AUTORIZADO.</span>
                              ) :row.acc === 'N' || row.acc_veh === '' ? (
                                <span>Vehículo: NO AUTORIZADO</span>
                              ): row.placa === '' || row.placa === null ? (
                                <span>No aplica</span>
                              ): null}
                            </small>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

            </Box>
          </div>
        )}
        <Dialog open={openSalida} onClose={handleCloseSalida}>
          <DialogTitle>
            Finalizar visita
          </DialogTitle>
          <DialogContent sx={{display: 'flex'}}>
            {selectedVisitaSalida && (
              <>
            {/**hacer el calculo del tiempo de la visita y el button para la salida y desactivar el qr */}
            <Avatar
              src={selectedVisitaSalida.foto ? `${foto}/${selectedVisitaSalida.foto}` : '/placeholder.png'}
              alt={selectedVisitaSalida.nombre_completo || 'Sin nombre'}
              sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              {selectedVisitaSalida.id_catv === 4 ?(
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} >
                  {selectedVisitaSalida.nombre_com_acomp || 'N/A'}
                </Typography>
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} >
                  {selectedVisitaSalida.nombre_completo || 'N/A'}
                </Typography>
              )}
              
              <Grid container spacing={1} sx={{marginTop:'2px'}}>
                {/* QR Code */}
                <Grid item>
                  {selectedVisitaSalida && (
                    <QRCodeCanvas
                      value={`Nombre: ${selectedVisitaSalida.nombre_completo},\nEmpresa: ${selectedVisitaSalida.empresa},\nPlaca: ${selectedVisitaSalida.placa || 'S/A'},\nDía Visita: ${formatDateToYMDQR(selectedVisitaSalida.reg_entrada)} - ${selectedVisitaSalida.hora_entrada},\nAcompañante: ${selectedVisitaSalida.nom_com || 'S/A'}`}
                      size={80}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="Q"
                    />
                  )}
                </Grid>
                <Grid item>
                  <Typography variant="body2">
                    <strong>Entrada:</strong> {selectedVisitaSalida.entrada_h ? new Date(selectedVisitaSalida.entrada_h).toLocaleString('es-ES', {
                      hour12: true,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }) : 'N/A'}
                  </Typography>
                  {selectedVisitaSalida.entrada_h && (
                    <Typography variant="body2">
                      <strong>Tiempo de permanencia: </strong>
                      <span style={{ color: excesoTiempo ? 'red' : 'inherit' }}>
                        {tiempo}
                      </span>
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid sx={{textAlign:'center', marginTop:'20px'}}>
                <Button variant="outlined" onClick={darSalida}>
                  Finalizar visita
                </Button>
              </Grid>
              </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={openBloqueo} onClose={handleCloseBloqueo}>
          <DialogTitle>
            MULTAR VISITANTE
          </DialogTitle>
          <DialogContent>
          {selectedVisitaBloqeo && (
           
            <div>
              <div style={{display:'flex', margin:'10px'}}>
                <div>
                  <Avatar
                    src={selectedVisitaBloqeo.foto ? `${foto}/${selectedVisitaBloqeo.foto}` : '/placeholder.png'}
                    alt={selectedVisitaBloqeo.nombre_completo || 'Sin nombre'}
                    sx={{ width: 150, height: 150, objectFit: 'cover', marginRight: '15px' }}
                  />
                </div>
                <div >
                  {selectedVisitaBloqeo.id_catv === 4 ? (
                    <Typography variant="h5" sx={{ marginBottom: 1 , fontWeight: 'bold',}}>
                    {selectedVisitaBloqeo.nombre_com_acomp || 'N/A'} 
                  </Typography>
                  ): (
                    <Typography variant="h5" sx={{ marginBottom: 1 , fontWeight: 'bold',}}>
                    {selectedVisitaBloqeo.nombre_completo || 'N/A'} 
                  </Typography>
                  )}
                  
                  <Typography variant="body2" >
                    <strong>Entrada:</strong>{' '}
                    {selectedVisitaBloqeo.entrada_h
                      ? new Date(selectedVisitaBloqeo.entrada_h).toLocaleString('es-ES', {
                          hour12: true,
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'N/A'}
                  </Typography>
                  {selectedVisitaBloqeo.id_catv === 4 ? (
                    <Typography variant="body2"  >
                      <strong>Responsable:</strong> NO APLICA
                    </Typography>
                  ): (
                    <Typography variant="body2"  >
                      <strong>Responsable:</strong> {selectedVisitaBloqeo.personal}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" >
                    <strong>Motivo de visita:</strong> {selectedVisitaBloqeo.motivo}
                  </Typography>
                  <Typography variant="body2" >
                    <strong>Area de acceso:</strong> {selectedVisitaBloqeo.area}
                  </Typography>
                  <Typography variant="body2" >
                    <strong>Empresa:</strong> {selectedVisitaBloqeo.empresa === '' || selectedVisitaBloqeo.empresa === '' && selectedVisitaBloqeo.id_catv === 1 ? (
                      <span>COLABORADOR SANTUL</span>
                    ): selectedVisitaBloqeo.empresa === '' || selectedVisitaBloqeo.empresa === '' && selectedVisitaBloqeo.id_catv === 2 || selectedVisitaBloqeo.id_catv === 11 ? (
                      <span> NO APLICA </span>
                    ): selectedVisitaBloqeo.id_catv === 4 ? (
                      <span>PROVEEDOR</span>
                    ): selectedVisitaBloqeo.id_catv === 7 ?(
                      <span>{selectedVisitaBloqeo.paqueteria} </span>
                    ): (
                      <span>{selectedVisitaBloqeo.empresa} </span>
                    )}
                  </Typography>
                </div>
                
              </div>
              <Divider style={{marginTop:'10px'}}/>
              {/* TextField */}
              <div style={{marginTop:'15px'}}>
                <FormControl fullWidth>
                  <InputLabel id="id_multa">Motivo de la multa</InputLabel>
                  <Select
                    labelId="id_multa"
                    id="id_multa"
                    name="id_multa"
                    label="Motivo de la multa"
                    value={selectedConMulta || ''}
                    onChange={handleDropdownChangeMulta}
                  >
                    <MenuItem value="">SELECCIONAR MOTIVO DE MULTA</MenuItem>
                    {conMulta.map((item) => (
                      <MenuItem key={item.id_multa} value={item}>
                        {item.motivo} 
                      </MenuItem>
                    ))}
                  </Select>
                  {errorMulta.id_multa && (
                    <small style={{color:'red'}}>
                      * {errorMulta.id_multa}
                    </small>
                  )}
                </FormControl>
              </div>

              {/* Botón */}
              <DialogActions sx={{ margin:'10px', textAlign: 'center' }}>
                <Button variant="outlined" onClick={SaveMulta}>
                  Multar 
                </Button>
              </DialogActions>
            </div>
          )}
          </DialogContent>
        </Dialog>
        <Dialog open={openVisitaAgendada}> 
          <DialogTitle style={{ alignItems: 'center', textAlign: 'center', margin: '30px' }}>
            {errorVisita ? (
              <EventBusy sx={{ fontSize: 100, color: 'red',opacity:'0.6' }} />
            ) : (
              <EventAvailableOutlined sx={{ fontSize: 100, color: 'green' }} />
            )}
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <div style={{ margin: '10px' }}>
              {errorVisita 
                ? errorVisita.error || 'Error al registrar la visita.' 
                : 'Visita agendada correctamente.'}
            </div>
            <div style={{ margin: '20px' }}>
            {errorVisita ? (
              <Button onClick={handleCloseVisitaAgendadaError}>
                CERRAR
              </Button>
            ) : (
              <Button onClick={handleCloseVisitaAgendada}>
                CERRAR
              </Button>
            )}
              
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openUpExcelInfo} onClose={false}>
          <DialogTitle style={{alignItems:'center', textAlign:'center', margin:'30px'}}>
           <CheckCircleOutline sx={{ fontSize: 100, color:'green' }} /> 
          </DialogTitle>
          <DialogContent sx={{textAlign:'center'}}>
            <div style={{margin:'10px'}}>
              Información cargada correctamente
            </div>
            <div style={{margin:'20px'}}>
              <Button onClick={handleCloseUpExcelInfo}>
                CERRAR
              </Button>
            </div>
            
          </DialogContent>
        </Dialog>
        {(user?.role === 'POLIB' || user?.role === 'Admin') && (
          <Dialog open={openExcesoTiempo} onClose={handleCloseExcesoTiempo}>
            {selectedVisitaSalida && ( 
              <div>
              <DialogContent sx={{ textAlign: 'center' }}>
              <AccessAlarm sx={{ fontSize: '7rem', color: '#6ec860', opacity: '0.8' }} />
                <div>
                  <h3>Este usuario ha excedido el tiempo de visita permitido (1hrs).</h3>
                  <p>
                    <strong>Nombre:</strong> {selectedVisitaSalida.nombre_completo}
                    <br />
                    <strong>Tiempo de permanencia: </strong> 
                    <span style={{ color: excesoTiempo ? 'red' : 'inherit' }}>
                      {tiempo}
                    </span>
                  </p>
                  
                </div>
              
              </DialogContent>
              <DialogActions>
                <Button variant="contained" onClick={() => handleClickOpenSalida(selectedVisitaSalida)}>
                  Ver visita
                </Button>
              </DialogActions> 
            </div>
          )}
          </Dialog>
        )}
        {(user?.role === 'POLIB') && (
          <>
        <Dialog open={dialogOpen} onClose={false}>
          <DialogTitle style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <HelpOutline style={{ fontSize: '4.5em', marginRight: '8px' }} />
            <p>¿Sigues ahí?</p>
          </DialogTitle>
          <DialogContent sx={{textAlign:'center'}}>
          {AlertaCodigo && (
              <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
                ¡Correcto! Permanece activo.
              </Alert>
            )}
            <h1><strong>{randomNumber}</strong></h1>
            <p>
              <h2><AvTimer/> {' '} Tiempo restante: {tiempoRestante}s</h2> 
            </p>
            <TextField
              autoFocus
              margin="dense"
              label="Número"
              fullWidth
              value={codigoIng}
              onChange={(e) => setCodigoIng(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              error={Boolean(errorMessage)}
              helperText={errorMessage}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleValidate}>Validar</Button>
          </DialogActions>
        </Dialog>
        </>)}
        <Dialog
          header="TOMAR FOTO"
          open={openCamVehiculo}
          onClose={handleCloseCamVehiculos}
        >
          <DialogContent>
            <Box style={{ textAlign: 'center', margin: '20px' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                style={{ width: '100%' }}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
              />
              {!isCameraReady ? (
                <p style={{ marginTop: '20px', fontSize: '16px', color: '#888' }}>
                  Cargando cámara...
                </p>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  style={{ width: '100%', marginTop: '20px' }}
                  onClick={tomarFotoVehiculo}
                >
                  Tomar Foto
                </Button>
              )}
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog open={openGenerarAcceso} onClose={onCloseGenEtiqueta}>
          <DialogContent style={{margin:'10px', textAlign:'center'}} >
          {selectedVisita && (
            <div ref={visitaDetailsRef}>
              <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                      <img src={logob} width={25} height={25} alt="Logo" className="imagen-visita" />
                  </Grid>

                  <Grid item>
                  <h2>VISITA SANTUL - {selectedVisita.clave_visit}</h2>
                  </Grid>
              </Grid>
              <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                  {selectedVisita && (
                    <QRCodeCanvas
                      value={`
                        Nombre: ${selectedVisita.id_catv === 4 ? selectedVisita.nombre_com_acomp : selectedVisita.nombre_completo}
                        Empresa: ${getEmpresa(selectedVisita)}
                        Placa: ${selectedVisita.placa ? selectedVisita.placa : 'N/A'}
                        Día de Visita: ${formatDateToYMD(selectedVisita.reg_entrada)}
                        Hora de Visita: ${selectedVisita.hora_entrada}
                        Acompañante (s): ${selectedVisita.nombre_acomp || ''}
                      `}
                      size={80}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="Q"
                    />
                  )}
                  </Grid>
                  <Grid item>
                      <Typography variant="body1" align="left"><strong>NOMBRE:</strong> {selectedVisita.id_catv === 4 ? 'NO APLICA' : selectedVisita.nombre_completo}</Typography>
                      <Typography variant="body1" align="left"><strong>RELACION:</strong> {selectedVisita.id_catv === 4 ? 'PROVEEDOR (IMP/NAC)' : selectedVisita.tipo}</Typography> 
                      <Typography variant="body1" align="left"><strong>AREA DE ACCESO:</strong> {selectedVisita.area}</Typography>
                  </Grid>
                  
              </Grid>
              
            </div>
          )}
            <Button
              onClick={handleGenerateImage}
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
            >
              Generar etiqueta
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={openRegAcomp} onClose={handleCloseRegAcomp} >
        <DialogTitle>{"REGISTRAR ACOMPAÑANTE"}</DialogTitle>
          <DialogContent style={{margin:'8px', textAlign:'center'}}  >
            
          {selectedVisita && (
            <div ref={visitaDetailsRef}>
              <h3>VISITANTE: {selectedVisita.nombre_completo}</h3>
              
              <Grid container alignItems="center" spacing={1}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    id="nombre_acomp"
                    name="nombre_acomp"
                    value={vitAcomp.nombre_acomp}
                    onChange={inputChangeAcomp}
                    label={`Nombre (s) de acompañante`}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                  <small>
                    {errorVisitaAcomp.nombre_acomp && (
                      <span style={{color: 'red'}}>
                        * {errorVisitaAcomp.nombre_acomp}
                      </span>
                    )}
                  </small>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    id="apellidos_acomp"
                    name="apellidos_acomp"
                    value={vitAcomp.apellidos_acomp}
                    onChange={inputChangeAcomp}
                    label={`Apellidos de acompañante`}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                  <small>
                    {errorVisitaAcomp.apellidos_acomp && (
                      <span style={{color: 'red'}}>
                        * {errorVisitaAcomp.apellidos_acomp}
                      </span>
                    )}
                  </small>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="no_ine_acomp"
                      name="no_ine_acomp"
                      value={vitAcomp.no_ine_acomp}
                      onChange={inputChangeAcomp}
                      label={`No. Identificación`}
                    />
                    <small>
                    {errorVisitaAcomp.no_ine_acomp && (
                      <span style={{color: 'red'}}>
                        * {errorVisitaAcomp.no_ine_acomp}
                      </span>
                    )}
                  </small>
                  </FormControl>
                </Grid>
              
            </div>
          )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseRegAcomp}
            >
              Cancelar
            </Button>
            <Button
              onClick={SaveVisitanteAcomp}
              variant="contained"
              color="primary"
            >
              GUARDAR
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          header="TOMAR FOTO"
          open={openCamUp}
          onClose={handleCloseCamUp}
        >
          <DialogContent >
            {imageUp ? (
              <Box sx={{ textAlign: "center", width: "100%", height: "100%" }}>
                <img
                  src={typeof imageUp === "string" ? imageUp : URL.createObjectURL(imageUp)}
                    alt="preview"
                    style={{ width: "100%", height: "150%", borderRadius: 8 }}
                  />
                  <Typography variant="body2" sx={{ color: "black" }}>
                    {imageUp.name || "Captura de Webcam"}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={removeImageUp}
                    sx={{ mt: 1, margin:'10px',width: "50%" }}
                  >
                    Tomar de nuevo
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={updateInvitado}
                    sx={{ mt: 1, margin:'10px',width: "50%" }}
                  >
                    Guardar
                  </Button>
                </Box>
              ):(
                <div>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    style={{ width: '100%' }}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                  />
                  {!isCameraReadyUp ? (
                    <p
                      style={{
                        marginTop: "20px",
                        fontSize: "16px",
                        color: "#888",
                        textAlign: "center",
                      }}
                    >
                      Cargando cámara...
                    </p>
                  ) : (
                      <Button
                        severity="danger"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        style={{ width: "100%", marginTop: "20px" }}
                        onClick={tomarFotoUpdate}
                      >
                        Tomar Foto
                      </Button>
                      
                  )}
                </div>
            )}
            
              <div>
            </div>
            
          </DialogContent>

        </Dialog>
        <Dialog
          header="TOMAR FOTO"
          open={openCamUpDatos}
          onClose={handleCloseCamProv}
        >
          <DialogContent >
            {imageProv ? (
              <Box sx={{ textAlign: "center", width: "100%", height: "100%" }}>
                <img
                  src={typeof imageProv === "string" ? imageProv : URL.createObjectURL(imageProv)}
                    alt="preview"
                    style={{ width: "100%", height: "150%", borderRadius: 8 }}
                  />
                  <Typography variant="body2" sx={{ color: "black" }}>
                    {imageProv.name || "Captura de Webcam"}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={removeImageProv}
                    sx={{ mt: 1, margin:'10px',width: "50%" }}
                  >
                    Tomar de nuevo
                  </Button>
                </Box>
              ):(
                <div>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    style={{ width: '100%' }}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                  />
                  {!isCameraReadyUp ? (
                    <p
                      style={{
                        marginTop: "20px",
                        fontSize: "16px",
                        color: "#888",
                        textAlign: "center",
                      }}
                    >
                      Cargando cámara...
                    </p>
                  ) : (
                      <Button
                        severity="danger"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        style={{ width: "100%", marginTop: "20px" }}
                        onClick={tomarFotoProveedor}
                      >
                        Tomar Foto
                      </Button>
                  )}
                </div>
            )}
            
              <div>
              <Divider style={{marginTop:'20px'}} textAlign="left" ><AirlineSeatReclineNormal fontSize="small"/> Datos del conductor</Divider>
              <FormControl fullWidth>
                <TextField
                onChange={(e) => setConductor({ ...conductor, nombre_acomp: e.target.value })}
                  variant="outlined"
                  label="Nombre del conductor"
                  sx={{
                    width: '100%',
                    marginTop: 2,
                    marginX: 'auto',
                  }}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                {errorProveedor.nombre_acomp && (
                  <small style={{ color: "red" }}>* {errorProveedor.nombre_acomp}</small>
                )}
              </FormControl>
              <FormControl fullWidth>
                <TextField
                onChange={(e) => setConductor({ ...conductor, apellidos_acomp: e.target.value })}
                  variant="outlined"
                  label="Apellidos del conductor"
                  sx={{
                    width: '100%',
                    marginTop: 2,
                    marginX: 'auto',
                  }}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                {errorProveedor.apellidos_acomp && (
                  <small style={{ color: "red" }}>* {errorProveedor.apellidos_acomp}</small>
                )}
              </FormControl>
              <FormControl fullWidth>
                <TextField
                onChange={(e) => setConductor({ ...conductor, no_ine_acomp: e.target.value })}
                  variant="outlined"
                  label="NO. INE"
                  sx={{
                    width: '100%',
                    marginTop: 2,
                    marginX: 'auto',
                  }}
                />
                {errorProveedor.no_ine_acomp && (
                  <small style={{ color: "red" }}>* {errorProveedor.no_ine_acomp}</small>
                )}
              </FormControl>
              <div>
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button onClick={handleCloseValidarProveedor}>Cancelar</Button>
                  <Button variant="contained" color="primary" onClick={handleFinalizarProveedor}>Finalizar</Button>
                </Box>
              </div>
            </div>
            
          </DialogContent>

        </Dialog>
        <Dialog open={openMultaFinalizar}>
        <DialogContent>
          <h2>El visitante ha sido multado.</h2><br />
          <h3 style={{textAlign:'center'}}>¿Desea finalizar la visita?</h3>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              marginTop: 2,
            }}
          >
            <Button variant="contained" onClick={darSalida}>Finalizar</Button>
            <Button variant="outlined" onClick={handleCloseMultaFinalizar}>No finalizar</Button>
          </Box>
        </DialogContent>

        </Dialog>
        <Dialog open={openVisitaDup}>
        <DialogContent>
          <h2>El visitante ha sido multado.</h2><br />
          <h3 style={{textAlign:'center'}}>¿Desea finalizar la visita?</h3>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              marginTop: 2,
            }}
          >
            <Button variant="contained" onClick={darSalida}>Finalizar</Button>
            <Button variant="outlined" onClick={handleCloseMultaFinalizar}>No finalizar</Button>
          </Box>
        </DialogContent>

        </Dialog>
       
    </div>
  );
}

export default Visitantes;


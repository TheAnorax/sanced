import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button, Tabs, Tab, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, Typography, TextField, ButtonGroup, Avatar, DialogActions, FormControl, Divider, InputLabel, Select, MenuItem, Alert, Snackbar, Menu} from "@mui/material";
import { format } from 'date-fns';
import { es, is, se } from 'date-fns/locale';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { useMediaQuery} from "@mui/material";
import { CancelOutlined, CheckCircleOutline, CloudUpload, CloudDownload, PhotoCamera, ModeEditOutline, PaymentsOutlined,  HelpOutline, Visibility,  Circle, AccountCircle, UploadFile, UploadFileOutlined, Backup, MonetizationOn, Block, Edit, ErrorOutline, PersonOffOutlined, PermIdentityOutlined, KeyboardArrowDown, Person } from "@mui/icons-material";
import Webcam from "react-webcam";
import ejemplo from './ej_empleados.png';

function VisitasReporte (){
  // const api = "http://localhost:3007/api/visitas";
  // const foto = "http://localhost:3007/api/fotos";
  const api = "http://66.232.105.87:3007/api/visitas";
  const foto = "http://66.232.105.87:3007/api/fotos";

  const user = JSON.parse(localStorage.getItem("user"));
  //tab
  const [tabIndex, setTabIndex] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMobile = useMediaQuery('(max-width:1024px)');

  const [empleados, setEmpleados] = useState([]);
  const [areaT, setAreaT] = useState([]);
  const [selectedEmpleados, setSelectedEmpleados] = useState([]);
  const [selectedAreaT, setSelectedAreaT] = useState(null);
  const [reporte, setReporte] = useState([]);
  const [multas, setMultas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [visitantesAll, setVisitantesAll] = useState([]);
  const [selectedVehiculos, setSelectedVehiculos] = useState(null);
  const [selectedMulta, setSelectedMulta] = useState(null);
  const [selectedVisitante, setSelectedVisitante] = useState(null);
  const [vehiculosAll, setVehiculosAll] = useState([]);
  const [selectedPlaca, setSelectedPlaca] = useState(null);
  const [detalleMulta, setDetalleMulta] = useState([]);
  const [filter, setFilter] = useState("todas"); 
  const [filterVisitas, setFilterVisitas] = useState("todas"); 

  //DATA
  const webcamRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imageEmpleado, setImageEmpleado] = useState(null);
  const [imagePago, setImagePago] = useState(null);
  
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  const [invalidColumns, setInvalidColumns] = useState([]);
  const [dataExcel, setDataExcel] = useState([]);
  const expectedColumns = [
    "nombre",
    "apellidos",
    "no_empleado",
    "no_ine",
    "telefono",
    "puesto",
    "tel_emergencia",
    "nom_emergencia",
    "parentesco_contacto",
    "calle",
    "colonia",
    "delegacion",
    "estado",
    "area_trabajo",
  ];

  //dialog
  const [openMulta, setOpenMulta] = useState(false);
  const [openMultaEmpleado, setOpenMultaEmpleado] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCam, setOpenCam] = useState(false);
  const [openCamEmpleado, setOpenCamEmpleado] = useState(false);
  const [openUpFotoPago, setOpenUpFotoPago] = useState(false);
  const [openUpdateInfo, setOpenUpdateInfo] = useState(false);
  const [openUpdateClave, setOpenUpdateClave] = useState(false);
  const [openDetailInfo, setOpenDetailInfo] = useState(false);
  const [openCreateEmpleado, setOpenCreateEmpleado] = useState(false);
  const [openUpdateEmpleado, setOpenUpdateEmpleado] = useState(false);
  const [openUpExcel, setOpenUpExcel] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [isErrorDialogVisible, setIsErrorDialogVisible] = useState(false);
  const [OpenBloquearEmpleado, setOpenBloquearEmpleado] = useState(false);
  const [OpenDesbloquearEmpleado, setOpenDesbloquearEmpleado] = useState(false);

  //data error
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errorInfo, setErrorInfo] = useState('');
  const [errorInfoVit, setErrorInfoVit] = useState('');
  const [errorInfoVitAuto, setErrorInfoVitAuto] = useState('');
  const [updateError, setUpdateError] = useState({ message: "", type: "" });
  const [errorEmpleado, setErrorEmpleado] = useState('');
  const [errorEmpleadoUp, setErrorEmpleadoUp] = useState('');
  const [errorExcel, setErrorExcel] = useState([]);
  const [errorSave, setErrorSave] = useState([]);

  //alert
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showAlertCancelEmploye, setShowAlertCancelEmploye] = useState(false);


  //data exito
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateClaveSuccess, setUpdateClaveSuccess] = useState(false);

  
  // Función para filtrar las multas
  const filteredMultas = (multas || []).filter((multa) => {
    if (filter === "pagada") {
      return multa.pago !== null && multa.pago !== ""; 
    } else if (filter === "") {
      return multa.pago === null || multa.pago === "";
    }
    return true; 
  });

  const filteredVisitantes = (visitantesAll || []).filter((visit) => {
    if (!filterVisitas) return true;

    if (filterVisitas === "TRANSPORTISTA") {
      return visit.tipo === "TRANSPORTISTA";
    }
  
    if (filterVisitas === "PROVEEDOR") {
      return visit.tipo === "PROVEEDOR";
    }
    if (filterVisitas === "CANDIDATO (ENTREVISTA)") {
      return visit.tipo === "CANDIDATO (ENTREVISTA)";
    }
    if (filterVisitas === "INVITADO (EVENTOS)") {
      return ["INVITADO (EVENTOS)", "ENTREGA DE EVIDENCIAS"].includes(visit.tipo);
    }
    if (filterVisitas === "PERSONAL CORPORATIVO") {
      return visit.tipo === "PERSONAL CORPORATIVO";
    }
    if (filterVisitas === "PAQUETERIA / TRANSPORTE") {
      return visit.tipo === "PAQUETERIA / TRANSPORTE";
    }
  
    if (filterVisitas === "otros") {
      return ["PERSONAL CORPORATIVO", "CANDIDATO (ENTREVISTA)", "INVITADO (EVENTOS)", "TRANSPORTISTA", "PROVEEDOR", "CLIENTE", "CLIENTE RECOGE", "DIRECCION GENERAL", "ENTREGA DE EVIDENCIAS", "PAQUETERIA / TRANSPORTE"].includes(visit.tipo);
    }
  
    return true;
  });
  /**const filteredVisitantes = (visitantesAll || []).filter((visit) => {
    if (!filterVisitas) return true;

    if (filterVisitas === "TRANSPORTISTA") {
      return visit.tipo === "TRANSPORTISTA";
    }
  
    if (filterVisitas === "PROVEEDOR") {
      return visit.tipo === "PROVEEDOR";
    }
    if (filterVisitas === "CANDIDATO (ENTREVISTA)") {
      return visit.tipo === "CANDIDATO (ENTREVISTA)";
    }
    if (filterVisitas === "INVITADO (EVENTOS)") {
      return visit.tipo === "INVITADO (EVENTOS)";
    }
    if (filterVisitas === "PERSONAL CORPORATIVO" || filterVisitas === "PERSONAL CEDIS") {
      return visit.tipo === "PERSONAL CORPORATIVO" || visit.tipo === "PERSONAL CEDIS";
    }
  
    if (filterVisitas === "otros") {
      return ["PERSONAL CORPORATIVO", "PERSONAL CEDIS", "CANDIDATO (ENTREVISTA)", "INVITADO (EVENTOS)", "TRANSPORTISTA", "PROVEEDOR"].includes(visit.tipo);
    }
  
    return true;
  }); */

  useEffect(() => {
      getReporte();
      getAllPermisos();
      getAllMultas();
      getAllVisitantes();
      getAllVehiculos();
      getAreas();
      getEmpleados();
    }, []);

  useEffect(() => {
      if (!openCam) {
        setIsCameraReady(false);
      }
    }, [openCam]);

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

  const exportExcel = () => {
    try {

      const data = {
        ['nombre']: 'JUANA',
        ['apellidos']: 'LOPEZ LOPEZ',
        ['no_empleado']: '2525',
        ['no_ine']: '00000000000',
        ['telefono']: '555555555',
        ['puesto']: 'GERENTE',
        ['area_trabajo']: 'CEDIS SANTUL / CORPORATIVO SANTUL',
        ['tel_emergencia']: '555555555',
        ['nom_emergencia']: 'LILIA CRUZ LOPEZ',
        ['parentesco_contacto']: 'MAMA',
        ['calle']: 'ROVERETO',
        ['colonia']: 'BUENAVISTA',
        ['delegacion']: 'TECAMAC',
        ['estado']: 'ESTADO DE MEXICO',
      };

      const ws = XLSX.utils.json_to_sheet([data]);

      ws['!cols'] = [
        { wch: 13 }, // NOMBRE
        { wch: 18 }, // APELLIDOS
        { wch: 13 }, // NO EMPLEADO
        { wch: 18 }, // INE
        { wch: 11 }, // TEL
        { wch: 11 }, // PUESTO
        { wch: 35 }, // AREA TRABAJO
        { wch: 14 }, // TEL EMR
        { wch: 16 }, // NOM EMER
        { wch: 20 }, // PERENTESCO
        { wch: 15 }, // CALLE
        { wch: 14 }, // COLONIA
        { wch: 13 }, // DELEGACION
        { wch: 18 }, // ESTADO
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla.");

      XLSX.writeFile(wb, "plantilla_empleados.xlsx");
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    }
  };

  const getEmpleados = async () => {
    try {
        const response = await axios.get(`${api}/list/empleados`);
        setEmpleados(response.data.empleados);
        setAreaT([
          { id_catv: 8, area: 'PERSONAL CEDIS' },
          { id_catv: 1, area: 'PERSONAL CORPORATIVO' },
        ]);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
  };

  const getReporte = async () => {
    try {
        const response = await axios.get(`${api}/reporte`);
        setReporte(response.data.reporte);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
  };

  const getAllPermisos = async () => {
    try {
        const response = await axios.get(`${api}/vh/per`);
        setVehiculos(response.data);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
  };

  const getAllMultas = async () => {
    try {
        const response = await axios.get(`${api}/list/multas`);
        setMultas(response.data.multas);
        // console.log('response', response.data.multas)
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
  };

  const getAllVisitantes = async () => {
    try {
      const response = await axios.get(`${api}/visitantes/all`);
      setVisitantesAll(response.data.visitantesAll);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
    
  } 

  const getAllVehiculos = async () => {
    try {
      const response = await axios.get(`${api}/vehiculos`);
      setVehiculosAll(response.data);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
    
  } 

  const getAreas = async () => {
    try {
      const response = await axios.get(`${api}/areas`);

      setAreas(response.data);
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

  const updateVisitante = async () => {
    const invitMayusculas = convertirATextoMayusculas(selectedVisitante);
    const formData = new FormData();

    // Agregar todos los campos al FormData
    Object.entries(invitMayusculas).forEach(([key, value]) => {
        formData.append(key, value);
    });

    let fotoToUpload = null;
    // Solo añadir la foto si fue seleccionada
    if (image) {
      // Si se seleccionó una nueva imagen, usarla
      fotoToUpload = image;
    } else if (selectedVisitante.foto) {
      // Usar la imagen existente si no se seleccionó una nueva
      if (Array.isArray(selectedVisitante.foto)) {
        // En caso de ser un arreglo, tomar la primera imagen válida
        fotoToUpload = selectedVisitante.foto[0];
      } else {
        fotoToUpload = selectedVisitante.foto;
      }
    }
    if (fotoToUpload) { 
      formData.append('foto', imageEmpleado);
    }
  
    //update informacion de trnasportista
    try {
        const response = await axios.put(`${api}/up/informacion`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Guardado exitoso', response.data);
        setUpdateSuccess(true);
        setOpenUpdateInfo(true);
    } catch (error) {
      const errorResponse = error.response?.data?.error;
      const errorResponseType = error.response?.data?.type;
  
      if (errorResponseType === 'placaAsignada') {
          setUpdateError({ 
              message: 'El visitante ya tiene el vehículo asignado.', 
              type: 'placaAsignada' 
          });
      } else if (errorResponseType === 'placaOtroVisitante') {
          setUpdateError({ 
              message: 'El vehículo ya está asociado a otro visitante.', 
              type: 'placaOtroVisitante' 
          });
      } else {
          setUpdateError({ 
              message: errorResponse || "Ocurrió un error inesperado.", 
              type: 'generalError' 
          });
      }
  
      setUpdateSuccess(false);
      setOpenUpdateInfo(true);
      
  }
};

const updateInfoVehiculo = async () => {
  if (!validateInfoVit()) {
    console.error("Existen errores en el formulario.");
    return;
  }
  const invitMayusculas = convertirATextoMayusculas(selectedVisitante);
  const formData = new FormData();

  // Agregar todos los campos al FormData
  Object.entries(invitMayusculas).forEach(([key, value]) => {
    formData.append(key, value);
  });

  let fotoToUpload = null;

  if (image) {
    fotoToUpload = image;
  } else if (selectedVisitante.foto) {
    if (Array.isArray(selectedVisitante.foto)) {
      fotoToUpload = selectedVisitante.foto[0];
    } else {
      fotoToUpload = selectedVisitante.foto;
    }
  }

  if (fotoToUpload) {
    formData.append("foto", fotoToUpload);
  }

  try {
    const response = await axios.put(`${api}/up/informacion/vehiculo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Guardado exitoso', response.data);
    setUpdateSuccess(true);
    setOpenUpdateInfo(true);
  } catch (error) {
    console.error('Error al actualizar:', error.response?.data || error.message);
  }
};


const validateInfo = () => {
  let validationErrors = {};
  let isValid = true;

  // Validar nombre
  if (!selectedVisitante?.nombre?.trim()) {
      validationErrors.nombre = "Este dato es obligatorio.";
      isValid = false;
  }

  // Validar apellidos
  if (!selectedVisitante?.apellidos?.trim()) {
    validationErrors.apellidos = "Este dato es obligatorio.";
    isValid = false;
  } else if (selectedVisitante.apellidos.trim().split(/\s+/).length < 2) {
    validationErrors.apellidos = "Debe ingresar los dos apellidos.";
    isValid = false;
  }
  if(!selectedVisitante.id_catv === 2){
  if (!selectedVisitante?.empresa?.trim()) {
        validationErrors.empresa = "Este dato es obligatorio.";
        isValid = false;
    }
  }
  

  // Validar número de INE
  if (!selectedVisitante?.no_ine?.trim()) {
      validationErrors.no_ine = "Este dato es obligatorio.";
      isValid = false;
  } else if (!/^\d{5,13}$/.test(selectedVisitante.no_ine)) {
      validationErrors.no_ine = "Se requieren al menos 12 números.";
      isValid = false;
  }

  // Validar teléfono
  if (!selectedVisitante?.telefono?.trim()) {
      validationErrors.telefono = "Este dato es obligatorio.";
      isValid = false;
  } else if (!/^\d{10}$/.test(selectedVisitante.telefono)) {
      validationErrors.telefono = "Se requieren al menos 10 números.";
      isValid = false;
  }

  // Validar número de licencia
  if (selectedVisitante?.no_licencia?.trim() || selectedVisitante?.no_licencia ==! null) {
      if (!/^[A-Za-z0-9]+$/.test(selectedVisitante.no_licencia)) {
          validationErrors.no_licencia = "Solo se permiten letras y números.";
          isValid = false;
      } else if (selectedVisitante.no_licencia.length < 8) {
          validationErrors.no_licencia = "Debe contener al menos 8 caracteres.";
          isValid = false;
      }

  }

  // Establecer los errores en el estado
  setErrorInfo(validationErrors);

  return isValid;
};

  
  const validateInfoVit = () => {
    const errors = {};
    const errorsDatos = {};
    let isValid = true;

  //Validar todos los datos del carro si el visitante no es "TRANSPORTISTA", "MANIOBRISTA", "CANDIDATO (ENTREVISTA)"
  if (!["TRANSPORTISTA", "MANIOBRISTA", "CANDIDATO (ENTREVISTA)"].includes(selectedVisitante?.tipo)) {
    if (selectedVisitante?.no_licencia?.trim()) {
      if (!selectedVisitante?.placa?.trim()) {
        errors.placa = "La placa es obligatoria.";
        isValid = false;
      }else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/i.test(selectedVisitante.placa)) {
        errors.placa = "Debe tener 6 caracteres, incluyendo letras y números.";
        isValid = false;
      }
      if (!selectedVisitante?.no_licencia?.trim()) {
        errors.no_licencia = "El número de licencia es obligatorio.";
        isValid = false;
      }else if(!/^\d{10,12}$/.test(selectedVisitante.no_licencia)){
        errors.no_licencia = "Se requieren al menos 10 números.";
        isValid = false;
      }
      if (!selectedVisitante?.modelo?.trim()) {
        errors.modelo = "El modelo es obligatorio.";
        isValid = false;
      }
      if (!selectedVisitante?.marca?.trim()) {
        errors.marca = "La marca es obligatoria.";
        isValid = false;
      }
      if (!selectedVisitante?.anio?.trim()) {
        errors.anio = "El año es obligatorio.";
        isValid = false;
      }else if(!/^\d{4}$/.test(selectedVisitante.anio)){
        errors.anio = "Se requieren al menos 4 números.";
        isValid = false;
      }
    }
  }
 // if (!["PERSONAL CORPORATIVO"].includes(selectedVisitante?.tipo)) {}
    if (!selectedVisitante?.nombre?.trim()) {
      errorsDatos.nombre = "Este dato es obligatorio.";
      isValid = false;
    }

    // Validar apellidos
    if (!selectedVisitante?.apellidos?.trim()) {
      errorsDatos.apellidos = "Este dato es obligatorio.";
      isValid = false;
    } else if (selectedVisitante.apellidos.trim().split(/\s+/).length < 2) {
      errorsDatos.apellidos = "Debes ingresar los dos apellidos.";
      isValid = false;
    }

    if(!selectedVisitante.id_catv === 2) {

    
    if (!selectedVisitante?.empresa?.trim()) {
        errorsDatos.empresa = "Este dato es obligatorio.";
        isValid = false;
    }

    // Validar número de INE
    if (!selectedVisitante?.no_ine?.trim()) {
        errorsDatos.no_ine = "Este dato es obligatorio.";
        isValid = false;
    } else if (!/^\d{5,13}$/.test(selectedVisitante.no_ine)) {
        errorsDatos.no_ine = "Se requieren al menos 12 números.";
        isValid = false;
    }

    // Validar teléfono
    if (!selectedVisitante?.telefono?.trim()) {
        errorsDatos.telefono = "Este dato es obligatorio.";
        isValid = false;
    } else if (!/^\d{10}$/.test(selectedVisitante.telefono)) {
        errorsDatos.telefono = "Se requieren al menos 10 números.";
        isValid = false;
    }
  }
    setErrorInfoVitAuto(errors);
    setErrorInfo(errorsDatos);
    return isValid;
  };

  const SaveInfo = () => {
    if(validateInfo()){
      updateVisitante();
    }else{
      console.log('error en la validacion')
    }
  }

  const inputChangeUpdate = (event) => {
    const { name, value } = event.target;
  
    setSelectedVisitante((prevState) => ({
      ...prevState,
      [name]: value, 
    }));
  };

  const handleDropdownChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedPlaca(selectedValue);
    setSelectedVisitante((prevState) => ({
      ...prevState,
      placa: selectedValue?.placa || "",
    }));
  };

  const createEmpleado = async () => {
    const invitMayusculas = convertirATextoMayusculas(empleado);

    const formData = new FormData();
    Object.entries(invitMayusculas).forEach(([key, value]) => {
        formData.append(key, value);
    });

    if (imageEmpleado) {
        formData.append('foto', imageEmpleado);
    } else {
        console.error("No se ha seleccionado ninguna imagen.");
    }

    try {
        const response = await axios.post(`${api}/create/empleado`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Guardado exitoso', response.data);
        window.location.reload();
    } catch (error) {
        console.error('Error al registrar empleado:', error.response?.data || error.message);
        setErrorEmpleado(error.response?.data?.message || 'Error desconocido');
        setIsErrorDialogVisible(true); // Mostrar el diálogo de error
    }
};

const validateEmpleadoUpdate = () => {
  let validationErrors = {};
    let isValid = true;

    // Validación de los campos generales
    if(!selectedEmpleados?.nombre?.trim()) {
      validationErrors.nombre = "Este dato es obligatorio.";
      isValid = false;
    }
    if (!selectedEmpleados?.apellidos?.trim()) {
      validationErrors.apellidos = "Este dato es obligatorio.";
      isValid = false;
    } else if ((selectedEmpleados.apellidos.trim().split(/\s+/).length) < 2) {
      validationErrors.apellidos = "Debe ingresar los dos apellidos.";
      isValid = false;
    }
    if(!selectedEmpleados?.no_empleado?.trim()){
      validationErrors.no_empleado = "Este dato es obligatorio.";
      isValid = false;
    }
    
    if(!selectedEmpleados?.no_ine?.trim()){
      validationErrors.no_ine = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{10,13}$/.test(selectedEmpleados.no_ine)){
      validationErrors.no_ine = "Debe contener entre 10 y 13 números.";
      isValid = false;
    }
    if(!selectedEmpleados?.telefono?.trim()){
      validationErrors.telefono = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{10}$/.test(selectedEmpleados.telefono)){
      validationErrors.telefono = "Se requieren al menos 10 números.";
      isValid = false;
    }
    if(!selectedEmpleados?.puesto?.trim()) {
      validationErrors.puesto = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.tel_emergencia?.trim()) {
      validationErrors.tel_emergencia = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.nom_emergencia?.trim()) {
      validationErrors.nom_emergencia = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.parentesco_contacto?.trim()) {
      validationErrors.parentesco_contacto = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.calle?.trim()) {
      validationErrors.calle = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.colonia?.trim()) {
      validationErrors.colonia = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.delegacion?.trim()) {
      validationErrors.delegacion = "Este dato es obligatorio.";
      isValid = false;
    }
    if(!selectedEmpleados?.estado?.trim()) {
      validationErrors.estado = "Este dato es obligatorio.";
      isValid = false;
    } 
    setErrorEmpleadoUp(validationErrors);
    return isValid;
}

const updateEmpleado = async () => {
  if (!validateEmpleadoUpdate()) {
    console.error("Existen errores en el formulario.");
    return;
  }
  const invitMayusculas = convertirATextoMayusculas(selectedEmpleados);

  const formData = new FormData();
  Object.entries(invitMayusculas).forEach(([key, value]) => {
      formData.append(key, value);
  });


  let fotoToUpload = null;

  if (imageEmpleado) {
    fotoToUpload = imageEmpleado;
  } else if (selectedEmpleados.foto) {
    if (Array.isArray(selectedEmpleados.foto)) {
      fotoToUpload = selectedEmpleados.foto[0];
    } else {
      fotoToUpload = selectedEmpleados.foto;
    }
  }
  if (fotoToUpload) { 
    formData.append('foto', imageEmpleado);
  }

  try {
      const response = await axios.put(`${api}/update/empleado`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Guardado exitoso', response.data);
      window.location.reload();
  } catch (error) {
    console.error('Error al actualizar:', error.response?.data || error.message)
  }
};

const savaUpdateEmpleado =() => {
  if(validateEmpleadoUpdate()){
    updateEmpleado();
  }else{
    console.log('error en la validacion')
  }
}
const cancelEmpleado = async ( idEmp, est) => {
  try {
    const response =await axios.put(`${api}/cancel/empleado/${idEmp}`,
      {
        est: est
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Actualización exitosa:', response.data);
  } catch (error) {
    console.error('Error al enviar los datos:', error);
  }
}

const handleCancelarEmpleado = (emp) => {
  if (!emp.id_emp) {
    console.error('El objeto emp no contiene el campo clave:', emp);
    return;
  } 
  console.log('selectedCancelVisitante:', emp);
  setSelectedEmpleados(emp);
  setOpenBloquearEmpleado(true);
}

  const [empleado, setEmpleado] = useState({
    id_catv: 0,
    nombre: "",
    apellidos:"",
    foto: "",
    no_empleado: "",
    no_ine: "",
    telefono: "",
    puesto:"", 
    tel_emergencia: "",
    nom_emergencia: "",
    parentesco_contacto: "",
    calle: "",
    colonia: "",
    delegacion: "",
    estado: "",
    num: 0,
  });

const validateEmpleado= () => {
  let validationErrors = {};
    let isValid = true;

    // Validación de los campos generales
    if(!empleado.id_catv){
      validationErrors.id_catv = "Este campo es obligatorio.";
      isValid = false;
    }
    if(!(empleado.nombre || '').trim()) {
      validationErrors.nombre = "Este dato es obligatorio.";
      isValid = false;
    }
    if (!(empleado.apellidos || '').trim()) {
      validationErrors.apellidos = "Este dato es obligatorio.";
      isValid = false;
    } else if ((empleado.apellidos.trim().split(/\s+/).length) < 2) {
      validationErrors.apellidos = "Debe ingresar los dos apellidos.";
      isValid = false;
    }
    if(!(empleado.no_empleado || '').trim()){
      validationErrors.no_empleado = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{1,6}$/.test(empleado.no_empleado)){
      validationErrors.no_empleado = "Se requieren al menos 1 números.";
      isValid = false;
    }
    if(!(empleado.no_ine || '').trim()){
      validationErrors.no_ine = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{10,13}$/.test(empleado.no_ine)){
      validationErrors.no_ine = "Se requieren al menos 12 números.";
      isValid = false;
    }
    if(!(empleado.telefono || '').trim()){
      validationErrors.telefono = "Este dato es obligatorio.";
      isValid = false;
    } else if(!/^\d{10}$/.test(empleado.telefono)){
      validationErrors.telefono = "Se requieren al menos 10 números.";
      isValid = false;
    }
    if(!(empleado.puesto || '').trim()) {
      validationErrors.puesto = "Este dato es obligatorio.";
      isValid = false;
    }

    if(selectedAreaT?.num === 8 ) {
      if(!(empleado.tel_emergencia || '').trim()){
        validationErrors.tel_emergencia = "Este dato es obligatorio.";
        isValid = false;
      } else if(!/^\d{10}$/.test(empleado.tel_emergencia)){
        validationErrors.tel_emergencia = "Se requieren al menos 10 números.";
        isValid = false;
      }
      if(!(empleado.nom_emergencia || '').trim()) { 
        validationErrors.nom_emergencia = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(empleado.parentesco_contacto || '').trim()) {
        validationErrors.parentesco_contacto = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(empleado.calle || '').trim()) {
        validationErrors.calle = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(empleado.colonia || '').trim()) {
        validationErrors.colonia = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(empleado.delegacion || '').trim()) {
        validationErrors.delegacion = "Este dato es obligatorio.";
        isValid = false;
      }
      if(!(empleado.estado || '').trim()) {
        validationErrors.estado = "Este dato es obligatorio.";
        isValid = false;
      }
    }
    setErrorEmpleado(validationErrors);
    return isValid;
}

const saveEmpleado = () => {
  if(validateEmpleado()){
    createEmpleado();
  }else{
    console.log('error en la validacion')
  }
}

const inputChange = (event) => {
  const { name, value } = event.target;
  setEmpleado((prevState) => ({
      ...prevState,
      [name]: value,
  }));
};



const handleDropdownChangeTipo = (event) => {
  const selectedId = event.target.value;
  const selectedObj = areaT.find(item => item.id_catv === selectedId);
  setSelectedAreaT(selectedObj);
  setEmpleado((prevState) => ({
    ...prevState,
    id_catv: selectedObj?.id_catv || "",
  }));
};

const inputChangeUpdateEmpleado = (event) => {
  const { name, value } = event.target;
  setSelectedEmpleados((prevState) => ({
      ...prevState,
      [name]: value,
  }));
};

const handleClickOpenCreateEmpleado = () => {
  setOpenCreateEmpleado(true);
};

const handleCloseCreateEmpleado = () => {
  setOpenCreateEmpleado(false);
  setSelectedArea(null);
  setEmpleado({ 
    id_catv: '', 
    nombre: "",
    apellidos:"",
    foto: "",
    no_empleado: "",
    no_ine: "",
    tel_emergencia: "",
    nom_emergencia: "",
    parentesco_contacto: "",
    calle: "",
    colonia: "",
    delegacion: "",
    estado: "",
  });
}

const handleCloseUpdateEmpleado = () => {
  setOpenUpdateEmpleado(false);
};

const closeErrorDialog = () => {
  setIsErrorDialogVisible(false);
  setErrorEmpleado('');
};

const handleClickOpenEditEmpleado = (emp) => {
  if (!emp.id_emp) {
    console.error('El objeto emp no contiene el campo clave:', emp);
    return;
  } 
  console.log('selectedMultaVisitante:', emp);
  setSelectedEmpleados(emp);
  setOpenUpdateEmpleado(true); 
};

const closebloquearDialog = () => {
  setOpenBloquearEmpleado(false);
};

const handleBloquearEmpleado = async () => {
  setOpenBloquearEmpleado(false); 
  setShowAlertCancelEmploye(true);
  try {
    await cancelEmpleado(selectedEmpleados.id_emp, "C");
    console.log("Empleado desactivado");
    setTimeout(() => {
      setShowAlertCancelEmploye(false);
    }, 5000);
  } catch (error) {
    console.error("Error al enviar el permiso:", error);
    setShowAlertCancelEmploye(false);
  }
};

const handleDesbloquearEmpleado = async () => {
  setOpenBloquearEmpleado(false); 
  setShowAlertCancelEmploye(true);

  try {
    await cancelEmpleado(selectedEmpleados.id_emp, "A");
    console.log("Empleado desactivado");
    setTimeout(() => {
      setShowAlertCancelEmploye(false);
    }, 5000);
  } catch (error) {
    console.error("Error al enviar el permiso:", error);
    setShowAlertCancelEmploye(false);
  }
};

  const handleDownloadReport = () => {
    const ws = XLSX.utils.json_to_sheet(
        reporte.map((rep) => ({
            "Nombre completo": rep.nombre_completo || "Sin nombre",
            "Hora entrada": rep.entrada_h 
                ? format(new Date(rep.entrada_h), "dd/MM/yyyy HH:mm aa", { locale: es })
                : "No disponible",
            "Hora salida": rep.reg_salida 
                ? format(new Date(rep.reg_salida), "dd/MM/yyyy HH:mm aa", { locale: es })
                : "No disponible",
            "Tiempo visita": rep.tiempo_visita || "No disponible",
            "Empresa": rep.empresa || "No disponible",
            "Área de acceso": rep.area_per || "No disponible",
            "Relación": rep.tipo || "No disponible",
        }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VISITAS");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const fecha = moment().format("YYYYMMDD-HHmmss");
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Visitas-Santul-${fecha}.xlsx`);
};

const handleDownloadReportMultas = () => {
  const ws = XLSX.utils.json_to_sheet(
      multas.map((rep) => ({
          "Nombre completo": rep.nombre_completo || "Sin nombre",
          "Empresa": rep.empresa || "Sin nombre",
          "Fecha de multa": rep.fecha_multa 
              ? format(new Date(rep.fecha_multa), "dd/MM/yyyy", { locale: es })
              : "No disponible",
          "Motivo": rep.motivo || "No disponible",
          "Sanción": rep.sancion_actual || "No disponible",
          "Acción": rep.accion_actual || "No disponible",
          "No. Multas": rep.total_multas || "No disponible",
          "Monto": rep.monto_t || "No disponible",
          "Pago": rep.pago || "Pendiente",
      }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MULTAS");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const fecha = moment().format("YYYYMMDD-HHmmss");
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Visitantes-Multados-Santul-${fecha}.xlsx`);
};

const permiso = async ( idVehpr, acc) => {
  try {
    const response =await axios.put(`${api}/permiso/${idVehpr}`,
      {
        acc: acc
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Actualización exitosa:', response.data);
  } catch (error) {
    console.error('Error al enviar los datos:', error);
  }
}

const handlePermisoAcc = async (veh, acc) => {
  if (!veh.id_vehpr) {
    console.error(' id_vehpr:', veh);
    return;
  }
  setSelectedVehiculos(veh);

  setShowSuccessAlert(true);
  window.location.reload();
  setTimeout(() => setShowSuccessAlert(false), 5000); 
  try {
    await permiso(veh.id_vehpr, acc);
    console.log(`Permiso '${acc}' enviado para el vehículo:`, veh);
  } catch (error) {
    console.error('Error al enviar el permiso:', error);
  }
}

const detailMulta = async (idVit, idMul) => {
  try {
    const response = await axios.post(
      `${api}/detail/multas`,
      {
        id_multa: idMul,
        id_vit: idVit,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Detalle de multa:', response.data.data);
    setDetalleMulta(response.data.data);
    //return true; // Indicar éxito
    //window.location.reload();
  } catch (error) {
    console.error('Error al obtener datos');
  }
};
const handleClickOpenMulta = (multa) => {
  if (!multa.id_multa || !multa.id_vit) {
    console.error('El objeto visita no contiene los campos id_mul o id_vit:', multa);
    return;
  }

  detailMulta(multa.id_vit, multa.id_multa );
  console.log('selectedMultaVisitante:', multa.id_multa, multa.id_vit); // Log para verificar los valores
  setSelectedMulta(multa);  // Almacenar la multa seleccionada
  setOpenMulta(true);        // Abrir el modal o la vista relacionada
};
const handleClickOpenUpExcel = () => {
  setOpenUpExcel(true);
};
const handleCloseUpExcel = () => {
  setOpenUpExcel(false);
};
const handleCloseSave = (reason ) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpenAlert(false);
};
const handleClearExcel = () => {
  setDataExcel([]); 
  setErrorExcel([]);
  setErrorSave(""); 
};

const handleSaveData = async () => {
  if (errorExcel.length > 0) {
    setErrorSave("No se puede guardar la información debido a errores en el archivo.");
    setOpenAlert(true);
    return;
  }
  try {
      await axios.post(`${api}/import/empleados`, dataExcel, {
          headers: { "Content-Type": "application/json" },
      });
      //alert(response.data.message);
      setOpenUpExcel(false);
      window.location.reload();
  } catch (error) {
      console.error("Error al guardar los datos:", error);
      //alert("Error al guardar los datos");
  }
};

const handleCloseMulta = () => {
  setOpenMulta(false); 
  setSelectedMulta(false);
};
const handleCloseMultaEmpleado = () => {
  setOpenMultaEmpleado(false); 
  setSelectedMulta(false);
};
const handleCloseCamPago = () => {
  setOpenUpFotoPago(false);
};
const handleClickOpenCamPago = () => {
  setOpenUpFotoPago(true);
};
const onTemplateSelectPago = (event) => {
  const file = event.target.files[0];
  if (file) {
    setImagePago(file);  // Almacena el archivo de imagen
  }
};
const removeImagePago = () => { 
  setImagePago(null);
};

const tomarFotoPago = () => {
  if(webcamRef.current){
    const screenshot = webcamRef.current.getScreenshot();
    const imageBlob = dataURLtoBlob(screenshot);
    const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" }); 
    setImagePago(imageFile);
  } else {
    console.error("La cámara no está lista o no se pudo acceder.");
  }
};
const pagarMulta = async (idMul) => {
  if (!imagePago) {
    //alert("Selecciona una imagen antes de continuar.");
    console.error("Selecciona una imagen antes de continuar.");
    return;
  }

  const formData = new FormData();
  formData.append('id_mul', selectedMulta.id_mul);
  formData.append('pago', 'PAGADO');
  formData.append('foto_pago', imagePago); // Cambia a 'foto_pago' para que coincida con el backend

  try {
    const response = await axios.put(`${api}/pagar/multa/${idMul}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    setSelectedMulta((prev) => ({ ...prev, pago: 'PAGADO' }));
    //alert('Comprobante guardado correctamente.');
    window.location.reload();
  } catch (error) {
    console.log('Error al guardar el comprobante.');
  }
};


const handleClickOpenEdit = (visit) => {
  if (!visit.clave) {
    console.error('El objeto visita no contiene el campo clave:', visit);
    return;
  } 
  console.log('selectedMultaVisitante:', visit);
  setSelectedVisitante(visit);
  setOpenEdit(true); 
};

const handleCloseEdit = () => {
  setOpenEdit(false);
  setImage(null);
  setSelectedVisitante(null);
  setSelectedPlaca(null);
  setOpenCam(false);
};
const handleCloseErrorUpdate = () => {
  setOpenUpdateInfo(false);
};
const handleCloseClaveUpdate = () => {
  setOpenUpdateClave(false);
  window.location.reload();
};

const handleAcceptUpdate = async () => {
  const formData = new FormData();

  let fotoToUpload = null;

  if (image) {
    fotoToUpload = image;
  } else if (selectedVisitante.foto) {
    if (Array.isArray(selectedVisitante.foto)) {
      fotoToUpload = selectedVisitante.foto[0];
    } else {
      fotoToUpload = selectedVisitante.foto;
    }
  }

  if (fotoToUpload) {
    formData.append("foto", fotoToUpload);
  }

  formData.append('clave', selectedVisitante.clave);
  formData.append('placa', selectedVisitante.placa);

  try {
    const response = await axios.put(`${api}/up/clave`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      console.log(response.data.message);
      setUpdateClaveSuccess(true);
      handleCloseErrorUpdate();
      setOpenUpdateClave(true);
    }
  } catch (error) {
    console.error('Error al actualizar:', error.response?.data || error.message);
  }
};


const handleCloseUpdate = () => {
  setOpenUpdateInfo(false);
  window.location.reload();
};


const handleClickOpenCam = () => {
  setOpenCam(true);
};

const handleCloseCam = () => {
  setOpenCam(false);
};

const handleClickOpenCamEmpleado = () => {
  setOpenCamEmpleado(true);
};

const handleCloseCamEmpleado = () => {
  setOpenCamEmpleado(false);
};

const handleClickDeatailInfo = (visit) => {
  if (!visit.clave) {
    console.error('El objeto visita no contiene el campo clave:', visit);
    return;
  } 
  console.log('selectedMultaVisitante:', visit);
  setSelectedVisitante(visit);
  setOpenDetailInfo(true); 
};
const handleCloseDetailInfo = () => {
  setOpenDetailInfo(false);
};

const onTemplateSelect1 = (event) => {
  const file = event.target.files[0];
  if (file) {
    setSelectedVisitante((prevState) => ({
      ...prevState,
      foto: URL.createObjectURL(file), 
    }));
    setImage(file); 
  }
};

const tomarFoto = () => {
  if (!webcamRef.current) {
    console.error("La cámara no está lista.");
    return;
  }

  const screenshot = webcamRef.current.getScreenshot();

  if (!screenshot) {
    console.error("No se pudo capturar la foto.");
    return;
  }

  const imageBlob = dataURLtoBlob(screenshot);

  const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" });

  setSelectedVisitante((prevState) => ({
    ...prevState,
    foto: screenshot, 
  }));

  setImage(imageFile); 
};

const dataURLtoBlob = (dataURL) => {
  try {
    const [header, base64] = dataURL.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
  } catch (error) {
    console.error("Error al convertir Data URL a Blob:", error);
    return null;
  }
};


const removeImage = () => { 
  setSelectedVisitante((prevState) => ({
    ...prevState,
    foto: null, 
  }));
  setImage(null);
};

const handleTabChange = (event, newValue) => {
  setTabIndex(newValue);
};

function formatTo12Hour(time) {
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; 
  return `${hour}:${minutes} ${period}`;
}

//foto empleado
const removeImageEmpleado = () => { 
  setImageEmpleado(null);
  setOpenCamEmpleado(false);
};

const onTemplateSelectEmpleado = (e) => {
  const file = e.target.files[0];
    if (file) {
        console.log("Archivo cargado:", file);
        setImageEmpleado(file);
    } else {
        console.error("No se seleccionó ningún archivo.");
    }
};

const onTemplateSelectUpdateEmpleado = (event) => {
  const file = event.target.files[0];
  if (file) {
    setSelectedEmpleados((prevState) => ({
      ...prevState,
      foto: URL.createObjectURL(file), 
    }));
    setImageEmpleado(file); 
  }
};

const tomarFotoEmpleado = () => {
  if (!webcamRef.current) {
    console.error("La cámara no está lista.");
    return;
  }

  const screenshot = webcamRef.current.getScreenshot();
  if (!screenshot) {
    console.error("No se pudo capturar la foto.");
    return;
  }
  const imageBlob = dataURLtoBlob(screenshot);
  const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" });
  setImageEmpleado(imageFile); 
};

 const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user", // Por defecto, cámara frontal
  });
 

  const seleccionarCamaraUSB = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
  
      // console.log("Cámaras disponibles:", videoDevices);
  
      // Seleccionar cámara USB por nombre (si sabes el nombre)
      const usbCamera = videoDevices.find((device) =>
        device.label.toLowerCase().includes("usb")
      );
  
      // Si encuentras una cámara USB, configúrala
      if (usbCamera) {
        setVideoConstraints({ deviceId: { exact: usbCamera.deviceId } });
        // console.log("Cámara USB seleccionada:", usbCamera.label);
      } else if (videoDevices.length > 0) {
        // Si no encuentras una cámara USB, selecciona la primera disponible
        setVideoConstraints({ deviceId: { exact: videoDevices[0].deviceId } });
        // console.log("Cámara predeterminada seleccionada:", videoDevices[0].label);
      } else {
        //alert("No se encontraron cámaras disponibles.");
        // console.error("No se encontraron cámaras disponibles.");
      }
    } catch (error) {
      console.error("Error al enumerar dispositivos:", error);
      //alert("Error al acceder a las cámaras. Verifica los permisos.");
      console.error("Error al acceder a las cámaras. Verifica los permisos.");
    }
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  const handleUserMediaError = (error) => {
    console.error("Error al acceder a la cámara:", error);
    alert("No se pudo acceder a la cámara. Verifica los permisos.");
  };

  useEffect(() => {
    seleccionarCamaraUSB();
  }, []);

  useEffect(() => {
    return () => {
      if (image && typeof image !== "string") {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

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
      <Paper elevation={3} sx={{ p: 3, overflow: "auto" }}>
        <>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons allowScrollButtonsMobile>
        {(user?.role === "CONTROL" || user?.role === "Admin" || user?.role === 'Master' || user?.role === "RH") &&(<Tab label="visitantes"/>)}
        {(user?.role === "CONTROL" || user?.role === "Admin" || user?.role === 'Master' || user?.role === "RH") &&(<Tab label="Visitantes multados"/>)}
        {(user?.role === "Admin" || user?.role === 'Master' || user?.role === "RH") && (<Tab label="reporte visitas"/>)}
        {(user?.role === 'Admin' || user?.role === 'Master' || user?.role === "RH") &&(<Tab label="Permisos autos"/>)}
        {(user?.role === 'Admin' || user?.role === 'Master'  || user?.role === "RH")&&(<Tab label="EMPLEADOS"/>)}
      </Tabs>
        {tabIndex === 0  &&
          <div>
          <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={isSmallScreen ? "column" : "row"}
        >
          <h2 style={{marginLeft: "10px"}}>VISITANTES</h2>
          </Box>
          {isMobile ? (
            <div>
              <ButtonGroup>
              <Button onClick={() => setFilterVisitas("otros")}>
                VISITAS
              </Button>
              <Button
                onClick={handleClick}
                endIcon={<KeyboardArrowDown />}
              />
              </ButtonGroup>
                <Menu anchorEl={anchorEl} open={open} onClose={() => handleCloseFiltro()}>
                  <MenuItem onClick={() => setFilterVisitas("otros")}>TODOS</MenuItem>
                  <MenuItem onClick={() => setFilterVisitas("PERSONAL CORPORATIVO")}>CORPORATIVO</MenuItem>
                  <MenuItem onClick={() => setFilterVisitas("TRANSPORTISTA")}>TRANSPORTISTAS</MenuItem>
                  <MenuItem onClick={() => setFilterVisitas("CANDIDATO (ENTREVISTA)")}>ENTREVISTA</MenuItem>
                  <MenuItem onClick={() => setFilterVisitas("INVITADO (EVENTOS)")}>INVITADO</MenuItem>
                  <MenuItem onClick={() => setFilterVisitas("PROVEEDOR")}>PROVEEDORES</MenuItem>
                  <MenuItem onClick={() => setFilterVisitas("PAQUETERIA / TRANSPORTE")}>PAQUETERIAS</MenuItem>
              </Menu>
            </div>
          ): (
            <div style={{ marginBottom: "10px", textAlign:'center' }}>
            <ButtonGroup variant="text" aria-label="Basic button group">
              <Button onClick={() => setFilterVisitas("otros")}>TODOS</Button>
              <Button onClick={() => setFilterVisitas("PERSONAL CORPORATIVO")}>CORPORATIVO</Button>
              <Button onClick={() => setFilterVisitas("PROVEEDOR")}>PROVEEDORES</Button>
              <Button onClick={() => setFilterVisitas("CANDIDATO (ENTREVISTA)")}>ENTREVISTA</Button>
              <Button onClick={() => setFilterVisitas("INVITADO (EVENTOS)")}>INVITADO</Button>
              <Button onClick={() => setFilterVisitas("TRANSPORTISTA")}>TRANSPORTISTAS</Button>
              <Button onClick={() => setFilterVisitas("PAQUETERIA / TRANSPORTE")}>PAQUETERIAS</Button>
            </ButtonGroup>
          </div>
          )}
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                <TableCell>FOTO</TableCell>
                  <TableCell align="center">NOMBRE</TableCell>
                  <TableCell align="center">EMPRESA</TableCell>
                  <TableCell align="center">CLAVE</TableCell>
                  <TableCell align="center">PLACAS</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitantes.length > 0 ? (
                  filteredVisitantes.filter((item) => {
                    if (user?.role === "CONTROL") {
                      return item.clave.startsWith("TR") || item.clave.startsWith("MN");
                    }
                    if (user?.role === "RH") {
                      return item.clave.startsWith("VT");
                    }
                    return true; 
                  }).map((visit, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Avatar
                          src={`${foto}/${visit.foto}`}
                          alt={`Foto de ${visit.nombre_completo || "visitante"}`}
                          sx={{ width: 100, height: 100, marginRight: '15px', objectFit: 'cover' }}
                        />
                      </TableCell>
                      {visit.id_catv === 4 ? (
                        <TableCell align="left">
                        {visit.nombre_com_acomp} <br />
                        <small style={{ marginLeft: "10px" }}>{visit.tipo} {visit.id_catv === 4 &&(<small> | CONDUCTOR </small>)}</small>
                      </TableCell>
                      ): (
                        <TableCell align="left">
                          {visit.nombre_completo} <br />
                          <small style={{ marginLeft: "10px" }}>{visit.tipo} {visit.id_catv === 1 &&(<small> | {visit.puesto}</small>)}</small>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        {visit.id_catv === 2 || visit.id_catv === 4 ? (
                          <span>NO APLICA</span>
                        ): visit.id_catv === 1 ? (
                          <span>COLABORADOR SANTUL</span>
                        ): visit.id_catv === 7 ?(
                          <span>{visit.empresa}</span>
                        ): visit.id_catv === 10 ?(
                          <span>DIRECCION GENERAL</span>
                        ):(
                          <span>{visit.empresa}</span>
                        )}
                      </TableCell>
                      <TableCell align="center" >
                        {visit.clave}
                      </TableCell>
                      <TableCell align="center">
                        {(visit.placa === null || visit.placa === 'null' || visit.placa === '') ? (
                          "NO APLICA"
                        ) : visit.id_catv === 5 && visit.placa === '' ? (
                          "POR ASIGNAR"
                        ) : visit.id_catv === 4 ? (
                          <div>{visit.contenedor} <br/>{visit.id_catv === 4 &&(<small> CONTENEDOR </small>)}</div>
                        ):(
                          visit.placa
                        )}
                      </TableCell>
                      <TableCell align="center" >
                        <Button size="small" variant="text" onClick={() => handleClickDeatailInfo(visit)} endIcon={<Visibility/>}></Button>
                        {visit.id_catv === 4 || visit.id_catv === 7 ? (
                          <div></div>
                        ): (
                          <Button size="small" variant="text" onClick={() => handleClickOpenEdit(visit)} endIcon={<ModeEditOutline/>}></Button>
                        )}
                        
                        
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      No hay visitantes que coincidan con el filtro seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          </div>}
        {tabIndex === 1  && 
          <div>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={isSmallScreen ? "column" : "row"}>
            <h2>VISITANTES MULTADOS</h2>
            <Button variant="contained" startIcon={<CloudDownload/>} onClick={handleDownloadReportMultas}>Descargar reporte</Button>
          </Box>
          <div style={{ marginBottom: "10px", margin:'5px' }}>
            <ButtonGroup variant="text" aria-label="Basic button group">
              <Button onClick={() => setFilter("todas")}>TODO</Button>
              <Button onClick={() => setFilter("pagada")}>MULTAS PAGADAS</Button>
              <Button onClick={() => setFilter("")}>MULTAS NO PAGADAS</Button>
            </ButtonGroup>
          </div>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>VISITANTE</TableCell>
                  <TableCell align="center">EMPRESA</TableCell>
                  <TableCell align="center">FECHA DE MULTA</TableCell>
                  <TableCell align="center">MOTIVO</TableCell>
                  <TableCell align="center">NO. MULTAS</TableCell>
                  <TableCell align="center">PAGO</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMultas.length > 0 ? (filteredMultas.filter((item) => {
                  if (!item.clave) return false; // Verifica que item.clave exista antes de continuar
                    switch (user?.role) {
                      case "CONTROL":
                        return (
                          item.clave.startsWith("TR") ||
                          item.clave.startsWith("MN") ||
                          item.clave.startsWith("PR") ||
                          item.clave.startsWith("PQ")
                        );
                      case "RH":
                        return item.clave.startsWith("VT");
                      case "Admin":
                        return true; // Admin ve todas las multas
                      default:
                        return false; // Por defecto, no muestra nada para otros roles
                    }
                  }).map((multa, index) => (
                    <TableRow key={index} >
                      <TableCell component="th" scope="row">
                        {multa.nombre_completo} <br />
                        <small style={{ marginLeft: "10px" }}>{multa.tipo}</small>
                      </TableCell>
                      <TableCell align="center" component="th" scope="row">
                        {multa.empresa === '' || multa.empresa === null ? (
                          'N/A'
                        ): <span>{multa.empresa}</span>}
                      </TableCell>
                      <TableCell align="center">
                        {multa.fecha_multa &&
                          new Date(multa.fecha_multa).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                      </TableCell>
                      <TableCell align="center" style={{ width: "30%" }}>
                        {multa.motivo}
                      </TableCell>
                      <TableCell align="center">
                        {multa.total_multas}
                      </TableCell>
                      {multa.pago === null || multa.pago === "" ? (
                        <TableCell align="center">PENDIENTE</TableCell>
                      ) : (
                        <TableCell align="center">{multa.pago}</TableCell>
                      )}
                      <TableCell align="center">
                        <Tooltip title='Gnerar monto'>
                          <Button endIcon={<PaymentsOutlined/>} onClick={() => handleClickOpenMulta(multa)}>
                        </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      No hay multas que coincidan con el filtro seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Dialog open={openMulta} onClose={handleCloseMulta} maxWidth="md" fullWidth>
              <DialogTitle>Monto de multa</DialogTitle>
              <DialogContent>
                {selectedMulta ? (
                  <div style={{ display: 'flex' }}>
                    <div style={{ marginTop: '25px', margin: '5px' }}>
                      <Avatar
                        src={`${foto}/${selectedMulta.foto}`}
                        alt={selectedMulta.nombre_completo}
                        sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ marginTop: '10px', margin: '5px' }}>
                      <Typography variant="h6" sx={{ marginBottom: 1 }}>
                        <strong>{selectedMulta.nombre_completo || 'NO DISPONIBLE'}</strong>
                      </Typography>
                      <p />
                      <Typography variant="body1">
                        <strong>MOTIVO:</strong> {selectedMulta.motivo || 'NO DISPONIBLE'}
                        <br />
                        <small style={{ marginLeft: '12px' }}>
                          Este visitante ha sido multado por este motivo {detalleMulta?.total_multas || 'NO DISPONIBLE'} veces.
                        </small>
                      </Typography>
                      <p />
                      <Typography variant="body1">
                        <strong>SANCIÓN:</strong> {selectedMulta.sancion_actual || 'NO DISPONIBLE'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>ACCIÓN:</strong> {selectedMulta.accion_actual || 'NO DISPONIBLE'}
                      </Typography>
                    </div>
                    {/* Mostrar Monto y Pago solo si id_catv no es 1 */}
                    {selectedMulta.id_catv !== 1 && (
                      <div style={{ marginTop: '20px', margin: '5px' }}>
                        <Typography variant="body1">
                          <strong>MONTO:</strong>{' '}
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN', // Usa la moneda que prefieras
                          }).format(detalleMulta?.monto)}
                        </Typography>
                        <p style={{ marginTop: '8px', textAlign: 'center' }}>
                          {imagePago ? (
                            <Box sx={{ textAlign: 'center', width: '100%', height: '100%' }}>
                              <img
                                src={typeof imagePago === 'string' ? imagePago : URL.createObjectURL(imagePago)}
                                alt="preview"
                                style={{ width: '100%', maxHeight: 170, borderRadius: 8 }}
                              />
                              <Typography variant="body2" sx={{ color: 'black' }}>
                                {imagePago.name || 'Captura de Webcam'}
                              </Typography>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={removeImagePago}
                                sx={{ mt: 1 }}
                              >
                                Quitar Imagen
                              </Button>
                              <Box sx={{ margin: '20px', textAlign: 'center' }}>
                                <Button
                                  style={{ width: '100%', height: '100%' }}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => pagarMulta(selectedMulta.id_mul)}
                                >
                                  Guardar comprobante
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              {selectedMulta.pago === 'PAGADO' ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '85px' }}>
                                  <div style={{ marginTop: '25px', margin: '5px' }}>
                                    <Avatar
                                      src={`${foto}/${detalleMulta?.foto_pago}`}
                                      alt={detalleMulta?.pago}
                                      sx={{ width: 100, height: 100, marginRight: '15px', objectFit: 'cover' }}
                                    />
                                  </div>
                                  <Button variant="contained" color="success" size="small" style={{ marginLeft: '85px' }}>
                                    MULTA PAGADA
                                  </Button>
                                </Box>
                              ) : (
                                <Box>
                                  <Button
                                    variant="outlined"
                                    startIcon={<CloudUpload />}
                                    sx={{ width: '95%', mb: 1 }}
                                    component="label"
                                  >
                                    Seleccionar Foto
                                    <input type="file" accept="image/*" onChange={onTemplateSelectPago} hidden />
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    startIcon={<PhotoCamera />}
                                    sx={{ width: '95%', mb: 1 }}
                                    onClick={handleClickOpenCamPago}
                                  >
                                    Tomar Foto
                                  </Button>
                                  <Dialog header="TOMAR FOTO" open={openUpFotoPago} onClose={handleCloseCamPago}>
                                    <Box style={{ textAlign: 'center', margin: '20px' }}>
                                    <Webcam
                                      audio={false}
                                      ref={webcamRef}
                                      screenshotFormat="image/jpeg"
                                      style={{ width: "100%" }}
                                      onUserMedia={handleUserMedia} // La cámara está lista
                                      onUserMediaError={handleUserMediaError} // Manejo de errores de la cámara
                                    />
                                      {!isCameraReady && webcamRef ? (
                                        <p
                                          style={{
                                            marginTop: '20px',
                                            fontSize: '16px',
                                            color: '#888',
                                            textAlign: 'center',
                                          }}
                                        >
                                          Cargando cámara...
                                        </p>
                                      ) : (
                                        <Button
                                          severity="danger"
                                          variant="outlined"
                                          startIcon={<PhotoCamera />}
                                          style={{ width: '100%', marginTop: '20px' }}
                                          onClick={tomarFotoPago}
                                        >
                                          Tomar Foto
                                        </Button>
                                      )}
                                    </Box>
                                  </Dialog>
                                </Box>
                              )}
                            </Box>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Typography>No hay datos disponibles</Typography>
                )}
              </DialogContent>
            </Dialog>

          </TableContainer>
          </div>
        }
        {tabIndex === 2  &&
          <div>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexDirection={isSmallScreen ? "column" : "row"}
            >
              <h2>Reporte de visitas</h2>
              <Button variant="contained" startIcon={<CloudDownload/>} onClick={handleDownloadReport}>Descargar reporte</Button>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>VISITANTE</TableCell>
                    <TableCell align="center">ENTRADA</TableCell>
                    <TableCell align="center">SALIDA</TableCell>
                    <TableCell align="center">TIEMPO DE VISITA</TableCell>
                    <TableCell align="center">AREA DE ACCESO</TableCell>
                    <TableCell align="center">NO. MULTAS</TableCell>
                    <TableCell align="center">NO. VISITAS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {reporte && reporte.length > 0 ? (
                  reporte.map((rep, index) => {
                    const formattedEntrada = format(new Date(rep.entrada_h), "dd/MM/yyyy HH:mm aa", { locale: es });
                    const formattedSalida = format(new Date(rep.reg_salida), "dd/MM/yyyy HH:mm aa", { locale: es });

                    const tiempoEnHoras = rep.tiempo_visita 
                        ? parseFloat(rep.tiempo_visita.replace(' horas', ''))
                        : 0; 

                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {rep.nombre_completo}
                        </TableCell>
                        <TableCell align="center">{formattedEntrada}</TableCell>
                        <TableCell align="center">{formattedSalida}</TableCell>
                        <TableCell
                          align="center"
                          style={{
                            color: tiempoEnHoras > 4 ? 'red' : 'green', 
                          }}
                        >
                          {rep.tiempo_visita || "No disponible"} 
                        </TableCell>
                        <TableCell align="center">{rep.area_per}</TableCell>
                        <TableCell align="center">{rep.total_multas}</TableCell>
                        <TableCell align="center">{rep.total_visitas}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="left">
                      No se ha encontrado información.
                    </TableCell>
                  </TableRow>
                )}

                </TableBody>
              </Table>
            </TableContainer>
            
          </div>
        }
        {tabIndex === 3  &&
        <div>
          <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={isSmallScreen ? "column" : "row"}
        >
          <h2>PERMISOS DE VEHICULOS</h2>
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          {showSuccessAlert && (
            <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
              ¡Permiso actualizado con exito.!
            </Alert>
          )}
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>VISITANTE</TableCell>
                <TableCell align="center">DÍA</TableCell>
                <TableCell align="center">HORA</TableCell>
                <TableCell align="center">MOTIVO</TableCell>
                <TableCell align="center">ACCESO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehiculos && vehiculos.length > 0 ? (
                vehiculos.map((veh, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {veh.nombre_completo} {' '}<br/>
                      <small style={{ marginLeft: '10px' }}>{veh.tipo}</small>
                    </TableCell>
                    <TableCell align="center">
                      {veh.reg_entrada &&
                        new Date(veh.reg_entrada).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                    </TableCell>
                    <TableCell align="center">{veh.hora_entrada && formatTo12Hour(veh.hora_entrada)}</TableCell>
                    <TableCell align="center">{veh.motivo_acc}</TableCell>
                    {user?.role === 'Admin' && (
                    <TableCell align="center">
                      <IconButton color="success" onClick={() => handlePermisoAcc(veh, 'S')}>
                        <CheckCircleOutline />
                      </IconButton>
                      <IconButton color="error" onClick={() => handlePermisoAcc(veh, 'N')}>
                        <CancelOutlined />
                      </IconButton>
                    </TableCell>)}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} >
                    No hay solicitud de permisos pendientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </div>}
        {tabIndex === 4 && 
          <div>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={isSmallScreen ? "column" : "row"}>
              <h2>EMPLEADOS SANTUL</h2>
              <div display="flex" >
                <Button variant="contained" startIcon={<CloudUpload/>} onClick={handleClickOpenUpExcel} style={{margin: '2px'}}>Importar empleados</Button>
                <Button variant="contained" startIcon={<AccountCircle/>} onClick={handleClickOpenCreateEmpleado} style={{margin: '2px'}}>Registrar empleado</Button>
              </div>
              {/* <Button variant="contained" startIcon={<CloudUpload/>} onClick={handleClickOpenUpExcel}>Importar empleados</Button> */}
              <Dialog open={openUpExcel} onClose={handleCloseUpExcel} maxWidth="md" fullWidth>
                <Box >
                  <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={isSmallScreen ? "column" : "row"} marginTop={3}>
                      <Typography variant="h6" gutterBottom>
                        Importar información
                      </Typography>
                      <div>
                        <Button variant="outlined" endIcon={<CloudDownload />} component="span" fontSize="small" style={{margin:'3px'}} onClick={exportExcel}>
                          Descargar plantilla
                        </Button>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          style={{ display: 'none'}}
                          id="upload-excel"
                        />
                        <label htmlFor="upload-excel">
                          <Button variant="outlined" endIcon={<UploadFile />} component="span" fontSize="small" style={{margin:'3px'}}>
                            Seleccionar archivo
                          </Button>
                        </label>
                      </div>
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
                      <div>
                        <Typography>
                          Antes de cargar el archivo Excel, asegurate que tenga la estructura correcta.
                        </Typography><p/>
                        <Typography>
                          Ejemplo:
                        </Typography>
                        <img preview src={ejemplo} width='100%'/>
                      </div>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Box>
                    {dataExcel.length > 0 && (
                      <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Button variant="outlined" color="primary" onClick={handleClearExcel} sx={{ mr: 2 }}>
                          Cancelar 
                        </Button>
                        <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseSave}>
                          <Alert severity="error" onClose={handleCloseSave}>{errorSave}</Alert>
                        </Snackbar>
                        <Button variant="outlined" color="primary" endIcon={<Backup />} onClick={handleSaveData} disabled={dataExcel.length === 0}>
                          Guardar Datos
                        </Button>
                      </Box>
                    )}
                  </Box>
                  </DialogActions>
                </Box>
              </Dialog>
              {/* <Button variant="contained" startIcon={<AccountCircle/>} onClick={handleClickOpenCreateEmpleado}>Registrar empleado</Button> */}
              <Dialog open={openCreateEmpleado} onClose={handleCloseCreateEmpleado} maxWidth="md" fullWidth>
                <DialogTitle >NUEVO EMPLEADO</DialogTitle>
                <DialogContent style={{ marginLeft: '5px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '15px' }}>
                    <div>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #ccc", width: 210, height: 280, textAlign: "center", margin: "auto", }}>
                        {imageEmpleado ? (
                          <Box sx={{ textAlign: "center", width: "100%", height: "100%" }}>
                            <img src={ typeof imageEmpleado === "string" ? imageEmpleado : URL.createObjectURL(imageEmpleado)} alt="preview" style={{ width: "100%", maxHeight: 170, borderRadius: 8 }}/>
                            <Typography variant="body2" sx={{ color: "black" }}>
                              {imageEmpleado.name || "Captura de Webcam"}
                            </Typography>
                            <Button variant="contained" color="error" size="small" onClick={removeImageEmpleado} sx={{ mt: 1 }}>Quitar Imagen</Button>
                          </Box>
                        ) : (
                          <Box>
                            <Button variant="outlined" startIcon={<CloudUpload />} sx={{ width: "95%", mb: 1 }} component="label">
                              Seleccionar Foto
                              <input type="file" accept="image/*" onChange={onTemplateSelectEmpleado} hidden />
                            </Button>
                            <Button variant="outlined" startIcon={<PhotoCamera />} sx={{ width: "95%", mb: 1 }} onClick={handleClickOpenCamEmpleado}>
                              Tomar Foto
                            </Button>
                            <Dialog header="TOMAR FOTO" open={openCamEmpleado} onClose={handleCloseCamEmpleado}>
                              <Box style={{ textAlign: "center", margin:'20px'  }}>
                                <Webcam
                                  audio={false}
                                  ref={webcamRef}
                                  screenshotFormat="image/jpeg"
                                  style={{ width: "100%" }}
                                  onUserMedia={handleUserMedia} // La cámara está lista
                                  onUserMediaError={handleUserMediaError} // Manejo de errores de la cámara
                                />
                                {!isCameraReady && webcamRef ? ( // Mostrar mensaje de carga mientras la cámara no esté lista
                                  <p style={{ marginTop: "20px", fontSize: "16px", color: "#888", textAlign:'center' }}>
                                    Cargando cámara...
                                  </p>
                                ) : (
                                  <Button severity="danger" variant="outlined" startIcon={<PhotoCamera />} style={{ width: "100%", marginTop: "20px" }} onClick={tomarFotoEmpleado}> 
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
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop:'10px' }} >
                      <FormControl fullWidth>
                        <InputLabel id="id_catv">Area de trabajo</InputLabel>
                        <Select
                          labelId="id_catv"
                          id="id_catv"
                          value={selectedAreaT?.id_catv || ''}
                          label="Area de trabajo"
                          onChange={handleDropdownChangeTipo}
                        >
                          <MenuItem value="">SELECCIONAR TIPO</MenuItem>
                          {areaT.map((item) => (
                            <MenuItem key={item.id_catv} value={item.id_catv}>
                              {item.area}
                            </MenuItem>
                          ))}
                        </Select>
                        <small>{errorEmpleado.id_catv && (
                          <span style={{color: 'red'}}>* {errorEmpleado.id_catv}</span>)}
                        </small>
                      </FormControl>
                      <FormControl fullWidth >
                        <TextField
                          id="apellidos"
                          name="apellidos"
                          label="Apellidos"
                          value={empleado.apellidos}
                          onChange={inputChange}
                          variant="outlined"
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        <small>
                          {errorEmpleado.apellidos && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.apellidos}
                            </span>
                          )}
                        </small>
                      </FormControl>
                      <FormControl fullWidth>
                        <TextField
                          id="telefono"
                          name="telefono"
                          label="Teléfono"
                          value={empleado.telefono}
                          onChange={inputChange}
                        />
                        <small>
                          {errorEmpleado.telefono && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.telefono}
                            </span>
                          )}
                        </small>
                      </FormControl>
                      <FormControl fullWidth>
                        <TextField
                          id="no_ine"
                          name="no_ine"
                          label="No. INE"
                          value={empleado.no_ine}
                          onChange={inputChange}
                        />
                        <small>
                        {errorEmpleado.no_ine && (
                          <span style={{color: 'red'}}>
                            * {errorEmpleado.no_ine}
                          </span>
                        )}
                      </small>
                      </FormControl>
                      {selectedAreaT?.id_catv === 8 && (
                      <FormControl fullWidth >
                        <TextField
                          id="parentesco_contacto"
                          name="parentesco_contacto"
                          label="Parentesco del contacto"
                          value={empleado.parentesco_contacto}
                          onChange={inputChange}
                          variant="outlined"
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        <small>
                          {errorEmpleado.parentesco_contacto && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.parentesco_contacto}
                            </span>
                          )}
                        </small>
                      </FormControl>)}
                    </div>
                    {/* Más campos de texto */}
                    <div style={{  display: "flex", flexWrap: "wrap", gap: "20px", marginTop:'10px'  }}>
                      <FormControl fullWidth>
                        <TextField
                          id="nombre"
                          name="nombre"
                          value={empleado.nombre}
                          onChange={inputChange}
                          variant="outlined"
                          label="Nombre (s)"
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        <small>
                          {errorEmpleado.nombre && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.nombre}
                            </span>
                          )}
                        </small>
                      </FormControl>
                      <FormControl fullWidth >
                        <TextField
                          fullWidth
                          id="no_empleado"
                          name="no_empleado"
                          label="No. empleado"
                          value={empleado.no_empleado}
                          onChange={inputChange}
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        <small>
                          {errorEmpleado.no_empleado && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.no_empleado}
                            </span>
                          )}
                        </small>
                      </FormControl>
                      <FormControl fullWidth >
                        <TextField
                          id="puesto"
                          name="puesto"
                          label="Puesto"
                          value={empleado.puesto}
                          onChange={inputChange}
                          variant="outlined"
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        <small>
                          {errorEmpleado.puesto && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.puesto}
                            </span>
                          )}
                        </small>
                      </FormControl>
                      {selectedAreaT?.id_catv === 8 && (
                        <>
                          <FormControl fullWidth >
                            <TextField
                              id="nom_emergencia"
                              name="nom_emergencia"
                              label="Nombre del contacto"
                              value={empleado.nom_emergencia}
                              onChange={inputChange}
                              variant="outlined"
                              inputProps={{ style: { textTransform: "uppercase" } }}
                            />
                            <small>
                              {errorEmpleado.nom_emergencia && (
                                <span style={{color: 'red'}}>
                                  * {errorEmpleado.nom_emergencia}
                                </span>
                              )}
                            </small>
                          </FormControl>
                          <FormControl fullWidth >
                            <TextField
                              id="tel_emergencia"
                              name="tel_emergencia"
                              label="Teléfono de emergencia"
                              value={empleado.tel_emergencia}
                              onChange={inputChange}
                              variant="outlined"
                              inputProps={{ style: { textTransform: "uppercase" } }}
                            />
                            <small>
                              {errorEmpleado.tel_emergencia && (
                                <span style={{color: 'red'}}>
                                  * {errorEmpleado.tel_emergencia}
                                </span>
                              )}
                            </small>
                          </FormControl>
                          </>)}
                    </div>
                  </div>
                  {selectedAreaT?.id_catv === 8 && (
                    <>
                      <Divider/>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop:'10px' }} >
                        <FormControl fullWidth>
                          <TextField
                            id="calle"
                            name="calle"
                            value={empleado.calle}
                            onChange={inputChange}
                            variant="outlined"
                            label="Calle"
                            inputProps={{ style: { textTransform: "uppercase" } }}
                          />
                          <small>
                            {errorEmpleado.calle && (
                              <span style={{color: 'red'}}>
                                * {errorEmpleado.calle}
                              </span>
                            )}
                          </small>
                        </FormControl>
                        <FormControl fullWidth>
                          <TextField
                            id="colonia"
                            name="colonia"
                            label="Colonia"
                            value={empleado.colonia}
                            onChange={inputChange}
                          />
                          <small>
                            {errorEmpleado.colonia && (
                              <span style={{color: 'red'}}>
                                * {errorEmpleado.colonia}
                              </span>
                            )}
                          </small>
                        </FormControl>
                        <FormControl fullWidth>
                          <TextField
                            id="delegacion"
                            name="delegacion"
                            label="Delegación o municipio"
                            value={empleado.delegacion}
                            onChange={inputChange}
                          />
                          <small>
                          {errorEmpleado.delegacion && (
                            <span style={{color: 'red'}}>
                              * {errorEmpleado.delegacion}
                            </span>
                          )}
                        </small>
                        </FormControl>
                        <FormControl fullWidth>
                          <TextField
                            id="estado"
                            name="estado"
                            label="Estado"
                            value={empleado.estado}
                            onChange={inputChange}
                          />
                          <small>
                            {errorEmpleado.estado && (
                              <span style={{color: 'red'}}>* {errorEmpleado.estado}</span>
                            )}
                          </small>
                        </FormControl>
                      </div>
                    </>
                  )}
                </DialogContent>
                <DialogActions>
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Button variant="outlined" color="secondary" sx={{ mr: 2 }} onClick={handleCloseCreateEmpleado}>
                      Cancelar
                    </Button>
                    <Button variant="contained" color="primary" onClick={saveEmpleado}>
                      Finalizar
                    </Button>
                  </Box>
                </DialogActions>
              </Dialog>
              
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}> 
              {showAlertCancelEmploye && (
                <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
                  ¡Empleado cancelado correctamente.!
                </Alert>
              )}
              <Table  stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center">NOMBRE</TableCell>
                    <TableCell align="center">PUESTO</TableCell>
                    <TableCell align="center">NO. EMPLEADO</TableCell>
                    <TableCell align="center">ESTADO</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {empleados && empleados.length > 0 ? ( empleados.map((emp, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row" align="center">
                      <Avatar src={`${foto}/${emp.foto}`} alt={emp.nombre_completo} sx={{ width: 100, height: 100, marginRight: '15px' }} imgProps={{ style: { objectFit: 'cover' } }}/>
                    </TableCell>
                    <TableCell align="center">{emp.nombre_completo}</TableCell>
                    <TableCell align="center">{emp.puesto}</TableCell>
                    <TableCell align="center">{emp.no_empleado}</TableCell>
                    <TableCell align="center">{emp.est}</TableCell>
                    <TableCell align="center">
                      {emp.est === 'C' ? (
                        <IconButton onClick={() => handleCancelarEmpleado(emp)} aria-label="cancelar empleado">
                          <Person/>
                        </IconButton>
                      ) : (
                        <Button onClick={() => handleCancelarEmpleado(emp)} aria-label="Habilitar empleado">
                          <Person />
                        </Button>
                      )}
                      <IconButton color="success" onClick={() => handleClickOpenEditEmpleado(emp)} aria-label="Editar empleado">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="left">
                      No se ha encontrado información.
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        }
        </>
      </Paper>
        <Dialog
          open={openEdit}
          onClose={handleCloseEdit}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">
            INFORMACIÓN DE {selectedVisitante && (<span>{selectedVisitante.tipo}</span>)}
          </DialogTitle>
          <DialogContent style={{ marginLeft: '5px', display: 'flex', flexDirection: 'column' }}>
          {selectedVisitante && (
            <>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '15px' }}>
                <div>
                  {/* Mostrar Avatar o Imagen seleccionada */}
                  <Box 
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed #ccc",
                      width: 210,
                      height: 280,
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {selectedVisitante.foto || image ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <img
                          // Determina la fuente de la imagen:
                          src={
                            selectedVisitante.foto && !selectedVisitante.foto.startsWith("blob")
                              ? `${foto}/${selectedVisitante.foto}` // URL relativa a una base conocida
                              : typeof image === "string"
                              ? image // Fuente directa si es una cadena
                              : image
                              ? URL.createObjectURL(image) // Fuente temporal si es un archivo
                              : "ruta/placeholder.png" // Imagen por defecto si no hay datos
                          }
                          alt={selectedVisitante.nombre_completo || "Imagen del visitante"} // Texto alternativo
                          style={{
                            width: 150, // Ancho fijo
                            height: 150, // Alto fijo
                            objectFit: "cover", // Ajusta el contenido
                            borderRadius: "8px", // Bordes redondeados
                          }}
                        />
                        <Typography variant="body2" sx={{ color: "black", mt: 1 }}>
                          {selectedVisitante.nombre_completo || "Foto actual"}
                        </Typography>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedVisitante((prev) => ({ ...prev, foto: null }));
                            setImage(null);
                          }}
                          sx={{ mt: 1 }}
                        >
                          Quitar Imagen
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        {/* Seleccionar o tomar nueva foto */}
                        <Button
                          variant="outlined"
                          startIcon={<CloudUpload />}
                          sx={{ width: "100%", mb: 1 }}
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
                          sx={{ width: "100%", mb: 1 }}
                          onClick={handleClickOpenCam}
                        >
                          Tomar Foto
                        </Button>

                        {/* Dialog para la cámara */}
                        <Dialog
                          header="TOMAR FOTO"
                          open={openCam}
                          onClose={handleCloseCam}
                        >
                          <Box style={{ textAlign: "center", margin: "20px" }}>
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            style={{ width: "100%" }}
                            onUserMedia={handleUserMedia} // La cámara está lista
                            onUserMediaError={handleUserMediaError} // Manejo de errores de la cámara
                          />
                            {!isCameraReady ? (
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
                                variant="outlined"
                                startIcon={<PhotoCamera />}
                                style={{ width: "100%", marginTop: "20px" }}
                                onClick={() => {
                                  tomarFoto();
                                  handleCloseCam(); // Cerrar el diálogo después de tomar la foto
                                }}
                              >
                                Tomar Foto
                              </Button>
                            )}
                          </Box>
                        </Dialog>
                      </Box>
                    )}
                  </Box>

                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                  {/* Primera fila */}
                  <FormControl style={{ flex: "1 1 calc(50% - 10px)", width: '50%' }}>
                    <TextField
                      id="nombre"
                      name="nombre"
                      value={selectedVisitante.nombre || ''}  
                      onChange={inputChangeUpdate}
                      variant="outlined"
                      label="Nombre (s)"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    {errorInfo.nombre && (
                      <small style={{ color: "red" }}>* {errorInfo.nombre}</small>
                    )}
                  </FormControl>

                  <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                    <TextField
                      id="apellidos"
                      name="apellidos"
                      label="Apellidos"
                      value={selectedVisitante.apellidos || ""}
                      onChange={inputChangeUpdate}
                      variant="outlined"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    {errorInfo.apellidos && (
                      <small style={{ color: "red" }}>* {errorInfo.apellidos}</small>
                    )}
                  </FormControl>
                  <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                    <TextField
                      id="tipo"
                      name="tipo"
                      label="Tipo de visitante"
                      value={selectedVisitante.tipo || ""}
                      variant="outlined"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    {errorInfo.tipo && (
                      <small style={{ color: "red" }}>* {errorInfo.tipo}</small>
                    )}
                  </FormControl>
                  {/* Segunda fila */}
                  <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                    <TextField
                      id="no_ine"
                      name="no_ine"
                      value={selectedVisitante.no_ine || ""}
                      onChange={inputChangeUpdate}
                      variant="outlined"
                      label="No. identificación"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    {errorInfo.no_ine && (
                      <small style={{ color: "red" }}>* {errorInfo.no_ine}</small>
                    )}
                  </FormControl>

                  <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                    <TextField
                      id="telefono"
                      name="telefono"
                      label="Teléfono"
                      value={selectedVisitante.telefono || ""}
                      onChange={inputChangeUpdate}
                      variant="outlined"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    {errorInfo.telefono && (
                      <small style={{ color: "red" }}>* {errorInfo.telefono}</small>
                    )}
                  </FormControl>
                  <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                    <TextField
                      id="no_licencia"
                      name="no_licencia"
                      label="No. licencia"
                      value={selectedVisitante.no_licencia || ''}
                      onChange={inputChangeUpdate}
                      variant="outlined"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    {errorInfo.no_licencia &&  (
                      <small style={{ color: "red" }}>* {errorInfo.no_licencia}</small>
                    )}
                  </FormControl>
                  {selectedVisitante?.id_catv === 1 ? (
                      <div></div>
                  ):(
                    <>
                      <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                        <TextField
                          id="empresa"
                          name="empresa"
                          value={selectedVisitante.empresa || ""}
                          variant="outlined"
                          label="Empresa"
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        {errorInfo.empresa && (
                          <small style={{ color: "red" }}>* {errorInfo.empresa}</small>
                        )}
                      </FormControl>
                    </>
                  )}
                  
                </div>
              </div>

              <Divider/>
              <div style={{  display: "flex", flexWrap: "wrap", gap: "20px", margin:'15px', marginTop:'20px' }}>
                <FormControl style={{ flex: "1 1 calc(50% - 10px)" }}>
                  {["TRANSPORTISTA", "MANIOBRISTA"].includes(selectedVisitante.tipo) ? (
                    <>
                      <InputLabel id="placa">Placa</InputLabel>
                      <Select
                        labelId="placa"
                        id="placa"
                        name="placa"
                        value={selectedPlaca || ""}
                        onChange={handleDropdownChange}
                        label="Placa"
                      >
                        <MenuItem value="">SELECCIONAR PLACA</MenuItem>
                        {vehiculosAll
                          .filter((item) => item.empresa === selectedVisitante.empresa)
                          .map((item) => (
                            <MenuItem key={item.id_veh} value={item}>
                              {item.placa} | {item.empresa}
                            </MenuItem>
                          ))}
                      </Select>
                      {errorInfoVitAuto.placa && (
                        <small style={{ color: "red" }}>* {errorInfoVitAuto.placa}</small>
                      )}
                      <div>
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                          <Button variant="outlined" color="secondary" sx={{ mr: 2 }}onClick={handleCloseEdit}>
                            Cancelar
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={SaveInfo}
                          >
                            Finalizar
                          </Button>
                        </Box>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div  style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                      <FormControl style={{ flex: "1 1 calc(50% - 10px)", width: '50%' }}>
                        <TextField
                          id="placa"
                          label="Placa"
                          name="placa"
                          value={selectedVisitante.placa || ''}
                          onChange={inputChangeUpdate}
                          fullWidth
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        {errorInfoVitAuto.placa && (
                          <small style={{ color: "red" }}>* {errorInfoVitAuto.placa}</small>
                        )}
                      </FormControl>
                      <FormControl style={{ flex: "1 1 calc(50% - 10px)", width: '50%' }}>
                        <TextField
                          id="modelo"
                          label="Modelo"
                          name="modelo"
                          value={selectedVisitante.modelo || ''}
                          onChange={inputChangeUpdate}
                          fullWidth
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        {errorInfoVitAuto.modelo && (
                          <small style={{ color: "red" }}>* {errorInfoVitAuto.modelo}</small>
                        )}
                      </FormControl>
                      <FormControl style={{ flex: "1 1 calc(50% - 10px)", width: '50%' }}>
                        <TextField
                          id="marca"
                          label="Marca"
                          name="marca"
                          value={selectedVisitante.marca || ''}
                          onChange={inputChangeUpdate}
                          fullWidth
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        {errorInfoVitAuto.marca && (
                          <small style={{ color: "red" }}>* {errorInfoVitAuto.marca}</small>
                        )}
                      </FormControl>
                      <FormControl style={{ flex: "1 1 calc(50% - 10px)", width: '50%' }}>
                        <TextField
                          id="anio"
                          label="Año"
                          name="anio"
                          value={selectedVisitante.anio || ''}
                          onChange={inputChangeUpdate}
                          fullWidth
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                        {errorInfoVitAuto.anio && (
                          <small style={{ color: "red" }}>* {errorInfoVitAuto.anio}</small>
                        )}
                      </FormControl>
                      <FormControl style={{ flex: "1 1 calc(50% - 10px)", width: '50%' }}>
                        <TextField 
                          id="seguro"
                          label="Seguro"
                          name="seguro"
                          value={selectedVisitante.seguro || ''}
                          onChange={inputChangeUpdate}
                          fullWidth
                          inputProps={{ style: { textTransform: "uppercase" } }}
                        />
                          <small style={{ color: "gray", opacity:'0.7' }}>* Opcional</small>
                      </FormControl>
                      </div>
                      <div>
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Button variant="outlined" color="secondary" sx={{ mr: 2 }}onClick={handleCloseEdit}>
                              Cancelar
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={updateInfoVehiculo}
                            >
                              Finalizar
                            </Button>
                          </Box>
                      </div>
                    </div>
                  )}
                </FormControl>
              </div>
            </>
          )}
          </DialogContent>
        </Dialog>
        <Dialog open={openUpdateInfo}>
          <DialogTitle sx={{ textAlign: 'center' }}>
            {updateSuccess ? (
              <CheckCircleOutline sx={{ fontSize: '90px', color: 'green', opacity: '0.6' }}/>
            ):(
              <HelpOutline sx={{ fontSize: '90px', color: 'gray', opacity: '0.6' }} />
            )}
              
          </DialogTitle>
          <DialogContent>
              {updateSuccess ? (
                  <div style={{ textAlign: 'center' }}>
                      <h3>¡Actualización exitosa!</h3>
                      <p>La información del visitante se ha actualizado correctamente.</p>
                      <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleCloseUpdate}
                          style={{ marginTop: '1rem' }}
                      >
                          Cerrar
                      </Button>
                  </div>
              ) : (
                  <>
                      {updateError.type === 'placaAsignada' && (
                          <>
                              <div style={{ textAlign: 'center' }}>
                                  <h3>El conductor ya tiene un vehículo asignado. </h3>
                                  <p>¿Desea actualizar la información seleccionada?</p>
                              </div>
                              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                  <Button variant="contained" color="primary" onClick={handleAcceptUpdate}>
                                      Aceptar
                                  </Button>
                                  <Button 
                                      variant="outlined" 
                                      color="secondary" 
                                      style={{ marginLeft: '0.5rem' }}
                                      onClick={handleCloseErrorUpdate}
                                  >
                                      Cancelar
                                  </Button>
                              </div>
                          </>
                      )}

                      {updateError.type === 'placaOtroVisitante' && (
                          <>
                              <div style={{ textAlign: 'center' }}>
                                  <h3>El vehículo ya está asociado a otro conductor.</h3>
                                  <p>¿Desea actualizar la información seleccionada?</p>
                              </div>
                              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                  <Button variant="contained" color="primary" onClick={handleAcceptUpdate}>
                                      Aceptar
                                  </Button>
                                  <Button 
                                      variant="outlined" 
                                      color="secondary" 
                                      style={{ marginLeft: '0.5rem' }}
                                      onClick={handleCloseErrorUpdate}
                                  >
                                      Cancelar
                                  </Button>
                              </div>
                          </>
                      )}

                      {updateError.type === 'generalError' && (
                          <>
                              <span>Ocurrió un error al actualizar la información. Por favor, intente nuevamente.</span>
                              <div style={{ marginTop: '1rem' }}>
                                  <Button 
                                      variant="contained" 
                                      color="primary" 
                                      onClick={handleCloseErrorUpdate}
                                  >
                                      Cerrar
                                  </Button>
                              </div>
                          </>
                      )}
                  </>
              )}
          </DialogContent>
        </Dialog>
        <Dialog open={openUpdateClave}>
          <DialogTitle sx={{ textAlign: 'center' }}>
            
            <CheckCircleOutline sx={{ fontSize: '90px', color: 'green', opacity: '0.6' }}/>
            
              
          </DialogTitle>
          <DialogContent>
              {updateClaveSuccess &&(
                <div style={{ textAlign: 'center' }}>
                    <h3>¡Actualización exitosa!</h3>
                    <p>La información del visitante se ha actualizado correctamente.</p>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleCloseClaveUpdate}
                        style={{ marginTop: '1rem' }}
                    >
                        Cerrar
                    </Button>
                </div>
              )}
          </DialogContent>
        </Dialog>
        <Dialog open={openDetailInfo} onClose={handleCloseDetailInfo}>
          <DialogTitle>
              DETALLE DE VISITANTE  
          </DialogTitle>
          <DialogContent>
              {selectedVisitante && (
                selectedVisitante.id_catv === 4 ? (
                  <div >
                  <div style={{display:'flex', margin:'10px'}}>
                    <div>
                      <Avatar
                        src={`${foto}/${selectedVisitante.foto}`}
                        alt={selectedVisitante.nombre_completo}
                        sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                      />

                    </div>
                    <div>
                      <Typography variant="h5" sx={{ marginBottom: 1 }}><strong>{selectedVisitante.nombre_com_acomp}</strong></Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>NO. INE: {selectedVisitante.no_ine_acomp}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>RELACIÓN: {selectedVisitante.tipo}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>EMPRESA: NO APLICA</Typography>
                    </div>
                  </div>
                  <Divider/>
                  <div style={{display:'flex', marginTop:'15px'}}>
                    <div style={{margin:'8px'}}>
                      
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>ACCESO PERSONAL: {selectedVisitante.estado_acceso === 'CON ACCESO' ?(<span><Circle sx={{color:'green', fontSize:'12px'}}/> {selectedVisitante.estado_acceso}</span>):(<span><Circle sx={{color:'red', fontSize:'12px'}}/> SIN ACCESO</span>) || 'SIN INFORMACIÓN'}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>ACCESO DE VEHICULO: {selectedVisitante.acc_dir === 'S' ? (<span><Circle sx={{color:'green', fontSize:'12px'}}/> ACCESO DIRECTO</span>) : (<span><Circle sx={{color:'red', fontSize:'12px'}}/> SIN ACCESO DE VEHICULO</span>) }</Typography>
                      </div>
                      <div style={{margin:'8px', marginLeft:'13px'}}>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>TOTAL - MULTAS: {selectedVisitante.total_multas || 'SIN MULTAS'}</Typography>
                        <Typography variant="body2" sx={{ marginBottom: 1 }}>TOTAL - VISITAS: {selectedVisitante.total_visitas || 'SIN VISITAS'}</Typography>
                      </div>
                  </div>
                </div>
                ):(
                <div >
                  <div style={{display:'flex', margin:'10px'}}>
                    <div>
                      <Avatar
                        src={`${foto}/${selectedVisitante.foto}`}
                        alt={selectedVisitante.nombre_completo}
                        sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                      />

                    </div>
                    <div>
                      <Typography variant="h5" sx={{ marginBottom: 1 }}><strong>{selectedVisitante.nombre_completo}</strong></Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>TELEFONO: {selectedVisitante.telefono}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>NO. INE: {selectedVisitante.no_ine}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>RELACIÓN: {selectedVisitante.tipo}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>EMPRESA: {selectedVisitante.empresa}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>NO. LICENCIA: {selectedVisitante.no_licencia || 'SIN INFORMACIÓN'}</Typography>
                    </div>
                  </div>
                  <Divider/>
                  <div style={{display:'flex', marginTop:'15px'}}>
                    <div style={{margin:'8px'}}>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>PLACA: {selectedVisitante.placa || 'SIN INFORMACIÓN'}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>MARCA: {selectedVisitante.marca || 'SIN INFORMACIÓN'}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>MODELO: {selectedVisitante.modelo || 'SIN INFORMACIÓN'}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>AÑO: {selectedVisitante.anio || 'SIN INFORMACIÓN'}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>NO. SEGURO (POILIZA): {selectedVisitante.seguro === '' || selectedVisitante.seguro === null ? (
                      <span>SIN INFORMACIÓN</span>
                    ): (
                    <span>{selectedVisitante.seguro}</span>
                    )}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>ACCESO PERSONAL: {selectedVisitante.estado_acceso === 'CON ACCESO' ?(<span><Circle sx={{color:'green', fontSize:'12px'}}/> {selectedVisitante.estado_acceso}</span>):(<span><Circle sx={{color:'red', fontSize:'12px'}}/> SIN ACCESO</span>) || 'SIN INFORMACIÓN'}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>ACCESO DE VEHICULO: {selectedVisitante.acc_dir === 'S' ? (<span><Circle sx={{color:'green', fontSize:'12px'}}/> ACCESO DIRECTO</span>) : (<span><Circle sx={{color:'red', fontSize:'12px'}}/> SIN ACCESO DE VEHICULO</span>) }</Typography>
                    </div>
                    <div style={{margin:'8px', marginLeft:'13px'}}>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>TOTAL - MULTAS: {selectedVisitante.total_multas || 'SIN MULTAS'}</Typography>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>TOTAL - VISITAS: {selectedVisitante.total_visitas || 'SIN VISITAS'}</Typography>
                    </div>
                  </div>
                </div>
                )
              )}
          </DialogContent>
        </Dialog>
        <Dialog open={openUpdateEmpleado} onClose={handleCloseUpdateEmpleado} maxWidth="md" fullWidth>
          <DialogTitle >ACTUALIZAR EMPLEADO</DialogTitle>
          <DialogContent style={{ marginLeft: '5px', display: 'flex', flexDirection: 'column' }}>
            {selectedEmpleados && (
              <>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '15px' }}>
                
                <div>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed #ccc",
                      width: 210,
                      height: 280,
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {selectedEmpleados.foto || imageEmpleado ? (
                      <Box
                        sx={{ textAlign: "center", width: "100%", height: "100%" }}
                      >
                        <img
                          src={selectedEmpleados.foto && !selectedEmpleados.foto.startsWith("blob") 
                            ? `${foto}/${selectedEmpleados.foto}` 
                            : typeof imageEmpleado === "string" ? imageEmpleado : URL.createObjectURL(imageEmpleado)}
                          alt={selectedEmpleados.nombre_completo || "Imagen del visitante"}
                          style={{ width: "100%", maxHeight: 170, borderRadius: 8 }}
                        />
                        <Typography variant="body2" sx={{ color: "black" }}>
                          {selectedEmpleados.nombre_completo || "Foto actual"}
                        </Typography>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedEmpleados((prev) => ({ ...prev, foto: null }));
                            setImageEmpleado(null);
                          }}
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
                            onChange={onTemplateSelectUpdateEmpleado}
                            hidden
                          />
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCamera />}
                          sx={{ width: "95%", mb: 1 }}
                          onClick={handleClickOpenCamEmpleado}
                        >
                          Tomar Foto
                        </Button>
                        <Dialog
                          header="TOMAR FOTO"
                          open={openCamEmpleado}
                          onClose={handleCloseCamEmpleado}
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
                                onClick={tomarFotoEmpleado}
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
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop:'10px' }} >
                  <FormControl fullWidth>
                    <TextField
                      id="nombre"
                      name="nombre"
                      value={selectedEmpleados.nombre || ''}
                      onChange={inputChangeUpdateEmpleado}
                      variant="outlined"
                      label="Nombre (s)"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorEmpleadoUp.nombre && ( 
                        <span style={{color: 'red'}}>
                          * {errorEmpleadoUp.nombre}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="telefono"
                      name="telefono"
                      label="Teléfono"
                      value={selectedEmpleados.telefono || ''}
                      onChange={inputChangeUpdateEmpleado}
                    />
                    <small>
                      {errorEmpleadoUp.telefono && (
                        <span style={{color: 'red'}}>
                          * {errorEmpleadoUp.telefono}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="no_ine"
                      name="no_ine"
                      label="No. INE"
                      value={selectedEmpleados.no_ine || ''}
                      onChange={inputChangeUpdateEmpleado}
                    />
                    <small>
                    {errorEmpleadoUp.no_ine && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.no_ine}
                      </span>
                    )}
                  </small>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="tel_emergencia"
                      name="tel_emergencia"
                      label="Telefono de emergencia"
                      value={selectedEmpleados.tel_emergencia || ''}
                      onChange={inputChangeUpdateEmpleado}
                    />
                    <small>
                    {errorEmpleadoUp.tel_emergencia && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.tel_emergencia}
                      </span>
                    )}
                  </small>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="parentesco_contacto"
                      name="parentesco_contacto"
                      label="Parentesco del contacto"
                      value={selectedEmpleados.parentesco_contacto || ''}
                      onChange={inputChangeUpdateEmpleado}
                    />
                    <small>
                    {errorEmpleadoUp.parentesco_contacto && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.parentesco_contacto}
                      </span>
                    )}
                  </small>
                  </FormControl>
                </div>

                {/* Más campos de texto */}
                <div style={{  display: "flex", flexWrap: "wrap", gap: "20px", marginTop:'10px'  }}>
                  <FormControl fullWidth >
                    <TextField
                      id="apellidos"
                      name="apellidos"
                      label="Apellidos"
                      value={selectedEmpleados.apellidos || ''}
                      onChange={inputChangeUpdateEmpleado}
                      variant="outlined"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorEmpleadoUp.apellidos && (
                        <span style={{color: 'red'}}>
                          * {errorEmpleadoUp.apellidos}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth >
                    <TextField
                      fullWidth
                      id="no_empleado"
                      name="no_empleado"
                      label="No. empleado"
                      value={selectedEmpleados.no_empleado || ''}
                      onChange={inputChangeUpdateEmpleado}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorEmpleadoUp.no_empleado && (
                        <span style={{color: 'red'}}>
                          * {errorEmpleadoUp.no_empleado}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth >
                    <TextField
                      id="puesto"
                      name="puesto"
                      label="Puesto"
                      value={selectedEmpleados.puesto || ''}
                      onChange={inputChangeUpdateEmpleado}
                      variant="outlined"
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <small>
                      {errorEmpleadoUp.puesto && (
                        <span style={{color: 'red'}}>
                          * {errorEmpleadoUp.puesto}
                        </span>
                      )}
                    </small>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="nom_emergencia"
                      name="nom_emergencia"
                      label="Nambre de contacto"
                      value={selectedEmpleados.nom_emergencia || ''}
                      onChange={inputChangeUpdateEmpleado}
                    />
                    <small>
                    {errorEmpleadoUp.nom_emergencia && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.nom_emergencia}
                      </span>
                    )}
                  </small>
                  </FormControl>
                </div>
                
                
              </div>
            <Divider></Divider>
              <div style={{  display: "flex", flexWrap: "wrap", gap: "20px", marginTop:'10px'  }}>
                <FormControl fullWidth >
                  <TextField
                    id="calle"
                    name="calle"
                    label="Calle"
                    value={selectedEmpleados.calle || ''}
                    onChange={inputChangeUpdateEmpleado}
                    variant="outlined"
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                  <small>
                    {errorEmpleadoUp.calle && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.calle}
                      </span>
                    )}
                  </small>
                </FormControl>
                <FormControl fullWidth >
                  <TextField
                    fullWidth
                    id="colonia"
                    name="colonia"
                    label="Colonia"
                    value={selectedEmpleados.colonia || ''}
                    onChange={inputChangeUpdateEmpleado}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                  <small>
                    {errorEmpleadoUp.colonia && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.colonia}
                      </span>
                    )}
                  </small>
                </FormControl>
                <FormControl fullWidth >
                  <TextField
                    id="delegacion"
                    name="delegacion"
                    label="Delegación o Municipio"
                    value={selectedEmpleados.delegacion || ''}
                    onChange={inputChangeUpdateEmpleado}
                    variant="outlined"
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                  <small>
                    {errorEmpleadoUp.delegacion && (
                      <span style={{color: 'red'}}>
                        * {errorEmpleadoUp.delegacion}
                      </span>
                    )}
                  </small>
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    id="estado"
                    name="estado"
                    label="Estado"
                    value={selectedEmpleados.estado || ''}
                    onChange={inputChangeUpdateEmpleado}
                  />
                  <small>
                  {errorEmpleadoUp.estado && (
                    <span style={{color: 'red'}}>
                      * {errorEmpleadoUp.estado}
                    </span>
                  )}
                </small>
                </FormControl>
              </div>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button variant="outlined" color="secondary" sx={{ mr: 2 }} onClick={handleCloseUpdateEmpleado}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={updateEmpleado}
              >
                Finalizar
              </Button>
            </Box>
            </>
          )}
          </DialogContent>
        
        </Dialog>
        <Dialog
          open={isErrorDialogVisible}
          onClose={closeErrorDialog}
        >
          <DialogTitle style={{textAlign:'center'}}>
            <ErrorOutline style={{color:'red', fontSize: 100, opacity:'0.5' }}/><p/>
            Error al registar empleado</DialogTitle>
          <DialogContent>{errorEmpleado}</DialogContent>
          <DialogActions>
            <Button onClick={closeErrorDialog}>
              cancelar
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={OpenBloquearEmpleado} onClose={closebloquearDialog}>
          {selectedEmpleados && (
            <DialogTitle style={{textAlign:'center'}}>
            {selectedEmpleados.est === 'C' ? (
              <div>
                <ErrorOutline style={{color:'green', fontSize: 100, opacity:'0.5' }}/><p/>
                ¿ACTIVAR EMPLEADO?
              </div>
            ):(
              <div>
                <ErrorOutline style={{color:'red', fontSize: 100, opacity:'0.5' }}/><p/>
                ¿DESACTIVAR EMPLEADO?
              </div>
            )}
          </DialogTitle>)}
          <DialogContent style={{textAlign:'center'}}>
            <small>
              NOMBRE: <strong>{selectedEmpleados.nombre_completo}</strong><br/>
              PUESTO: <strong>{selectedEmpleados.puesto}</strong>
            </small>
            <div style={{margin:'20px'}}>
              <Button onClick={closebloquearDialog} variant="outlined" style={{margin:'4px'}}>
                CANCELAR
              </Button>
              {selectedEmpleados.est === 'C' ? (
                <Button onClick={handleDesbloquearEmpleado} variant="contained" color="error" style={{margin:'4px'}}>
                  ACEPTAR
                </Button>
              ):(
                <Button onClick={handleBloquearEmpleado} variant="contained" color="error" style={{margin:'4px'}}>
                  ACEPTAR
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}

export default VisitasReporte;
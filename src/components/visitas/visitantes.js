import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import {
  Checkbox,
  Container,
  Dialog,
  Divider,
  Select,
  TextField,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  FormControlLabel,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import Alert from '@mui/material/Alert';
import {
  PhotoCamera,
  CloudUpload,
  CarCrash,
  Group,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useMediaQuery } from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddIcon from '@mui/icons-material/Add';
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import html2canvas from 'html2canvas';
//import logob from './logo.png';
import { QRCodeCanvas } from "qrcode.react";
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

function Visitantes() {
  const api = "http://192.168.3.27:3007/api/visitas";
  const foto = "http://192.168.3.27:3007/api/fotos";

  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:960px)");
  //data
  const [visitas, setVisitas] = useState([]);
  const [selectedVisita, setSelectedVisita] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [selectCategorias, setSelectCategorias] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVisitas, setFilteredVisitas] = useState(visitas);
  const [selectedAcs, setSelectedAcs] = useState([]);
  const [accesos, setAccesos] = useState([]);
  console.log('dd', accesos);

  const [checked, setChecked] = useState(false);
  const [dateV, setDateV] = useState(null);
  const [time, setTime] = useState(null);

  const [checkedVisita, setCheckedVisita] = useState(false);
  const [acompanantes, setAcompanantes] = useState([]);

  const visitaDetailsRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  //dialog
  const [openCam, setOpenCam] = useState(false);
  const [openCreateInvitado, setOpenCreateInvitado] = useState(false);
  const [openCreateTransp, setOpenCreateTransp] = useState(false);
  const [openCreateVisita, setOpenCreateVisita] = useState(false);
  const [openGenerarAcceso, setOpenGenerarAcceso] = useState(false);

  const [date, setDate] = useState(new Date());

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    const filtered = visitas.filter(
      (visita) =>
        (visita.nombre || "").toLowerCase().includes(query.toLowerCase()) ||
        (visita.empresa || "").toLowerCase().includes(query.toLowerCase()) ||
        (visita.relacion || "").toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredVisitas(filtered); 
  };

  const formatDateToYMD = (date) => {
    if (!date) return "";
    
    // Convertir la fecha a un objeto Date si es un string
    const validDate = new Date(date);
    
    // Verificar si la fecha es válida
    if (isNaN(validDate.getTime())) return ""; // Si la fecha no es válida, retorna una cadena vacía
    
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const day = String(validDate.getDate()).padStart(2, "0");
    const hour = validDate.getHours();
    const minutes = validDate.getMinutes();
    const seconds = validDate.getSeconds();
    
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
};


  const formattedDate = formatDateToYMD(date);

  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    getTiposVist();
    getVisitas();
    getVisitantes();
    getVisitasAct();
  }, []);

  const getTiposVist = async () => {
    try {
      const response = await axios.get(`${api}/categorias`);

      setCategorias(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };
  const getVisitas = async () => {
    try {
      const response = await axios.get(`${api}/agenda/hoy`);
      const visitantes = response.data.visitantes;

      const transportistas = response.data.transportistas;

      setVisitas([...visitantes, ...transportistas]);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const getVisitantes = async () => {
    try {
        const response = await axios.get(`${api}/list/visitantes`);
        const visitantes = response.data.visitantes.map((visitante) => ({
            id_vit: visitante.id_vit,
            label: visitante.nombre,  
            clave:visitante.clave, 
            value: visitante, 
            categoria: visitante.categoria 
        }));
        
        const transportistas = response.data.transportistas.map((transp) => ({
            id_vit: transp.id_transp,
            label: transp.nombre,
            clave: transp.clave,   
            value: transp,   
            categoria: transp.categoria   
        }));
        
        setAccesos([...visitantes, ...transportistas]);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
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

  const createInvitado = async (e) => {
    e.preventDefault();

    const invitMayusculas = convertirATextoMayusculas(invit);

  const formData = new FormData();
  Object.entries(invitMayusculas).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Verificar que la imagen esté en FormData
  console.log("Imagen antes de enviar:", image);
  if (image) {
    formData.append('foto', image);
  } else {
    console.error("No se ha seleccionado ninguna imagen.");
  }

    try {
      const response = await axios.post(`${api}/create/visitante`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Guardado exitoso", response.data);
      ///navigate('/san/dashboard');
    } catch (error) {
      console.error(
        "Error al registrar usuario:",
        error.response?.data || error.message
      );
    }
    setOpenCreateInvitado(false);
  };

const [transp, setTransp] = useState(
    {
        nombre: '',
        foto: '', 
        empresa: '',
        telefono:'',
        no_licencia:'',
        no_ine:'',
        marca:'',
        modelo:'',
        placa: '',
        anio:'',
        peso:'',
        seguro:'',
        id_catv: 5,
        est: 'A',
        registro:formatDateToYMD(date),
        
    }
);
const inputChangeTransp = (event) => {
  const { name, value } = event.target;
  setTransp((prevState) => ({
    ...prevState,
    [name]: value,
  }));
  //setInvit({ ...invit, [e.target.name]: e.target.value });
};

const createTransportista = async (e) => {
  e.preventDefault();

  const invitMayusculas = convertirATextoMayusculas(invit);

  const formData = new FormData();
  Object.entries(invitMayusculas).forEach(([key, value]) => {
      formData.append(key, value);
  });
  
  if (image) {  // Verifica que image esté definido
      formData.append('foto', image);
      console.log('Imagen añadida al FormData:', image);  // Verifica que la imagen se añade al formData
  } else {
      console.log('No se ha seleccionado imagen');
  }

  try {
      const response = await axios.post(`${api}/create/transportista`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Guardado exitoso', response.data);
  } catch (error) {
      console.error('Error al registrar usuario:', error.response?.data || error.message);
  }
  setOpenCreateTransp(false);
};


  const [invit, setInvit] = useState({
    id_catv: 0,
    nombre: "",
    empresa: "",
    registro: formattedDate,
    telefono: "",
    foto: "",
    no_licencia: "",
    no_ine: "",
    marca: "",
    modelo: "",
    placa: "",
    anio: "",
    seguro: "",
    est: "A",
  });

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
    }));
  };

  const handleCheckboxChange = (e) => {
    setChecked(e.target.checked);
    if (!e.checked) {
      setInvit({
        no_licencia: "",
        marca: "",
        modelo: "",
        placa: "",
        anio: "",
        seguro: "",
      });
    }
  };

  const tomarFoto = () => {
    const screenshot = webcamRef.current.getScreenshot();
    const imageBlob = dataURLtoBlob(screenshot);
    const imageFile = new File([imageBlob], "foto.jpg", { type: "image/jpeg" }); // Crear archivo
    setImage(imageFile);
  };

  const dataURLtoBlob = (dataURL) => {
    const parts = dataURL.split(",");
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

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

  const handleClickOpenCam = () => {
    setOpenCam(true);
  };

  const handleCloseCam = () => {
    setOpenCam(false);
  };
  const handleClickOpenCreateIn = () => {
    setOpenCreateInvitado(true);
  };

  const handleCloseCreateIn = () => {
    setOpenCreateInvitado(false);
  };
  const handleClickOpenCreateTransp = () => {
    setOpenCreateTransp(true);
  };

  const handleCloseCreateTransp = () => {
    setOpenCreateTransp(false);
    //setTransp('')
  };
  const handleClickOpenCreateVisita = () => {
    setOpenCreateVisita(true);
  };

  const handleCloseCreateVisita = () => {
    setOpenCreateVisita(false);
  };
  const handleClickOpenAcceso = (visita) => {
    if (!visita.id_visit) {
        console.error('El objeto visita no contiene el campo id_visit:', visita);
        return;
    }
    setSelectedVisita(visita);
    setOpenGenerarAcceso(true);
};

  const handleCloseAcceso = () => {
    setOpenGenerarAcceso(false); // Cierra el dialog
    setSelectedVisita(null); // Limpia la visita seleccionada
  };

  const newVisita = async (e) => {
    e.preventDefault();

    try {
        const data = {
            ...visita,
            nom_com: acompanantes.map(acomp => acomp.nom_com) 
        };

        const response = await axios.post(`${api}/create/visita`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Guardado exitoso', response.data);
        //alert('Usuario registrado exitosamente');
        setOpenCreateVisita(false);
    } catch (error) {
        console.error('Error al registrar visita:', error.response?.data || error.message);
        //alert('Error al registrar el usuario. Por favor, intente nuevamente.');
        //setError('')
    }
    setOpenCreateVisita(false);
};

const [visita, setVisita] = useState(
    {
        id_vit: '', 
        reg_entrada: '',  
        hora_entrada:'',
        motivo: '',
        area_per: '',
        personal: '',
        nom_com:[]
    }
);

const handleDateChange = (value) => {
    const formattedDate = value.format('YYYY-MM-DD'); 
    const [year, month, day] = formattedDate.split('-');
    const shortFormattedDate = `${year.slice(2)}/${month}/${day}`;

    setDateV(value);
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
    }));
};

const inputChangeVis = (event) => {
    const { name, value } = event.target;
    setVisita((prevState) => ({
        ...prevState,
        [name]: value,
    }));
};

const handleInputChange = (index, value) => {
    const nuevosAcompanantes = [...acompanantes];
    nuevosAcompanantes[index].nom_com = value.toUpperCase();
    setAcompanantes(nuevosAcompanantes);
};

const agregarAcompanante = () => {
    setAcompanantes([...acompanantes, { nom_com: "" }]);
};

const eliminarAcompanante = (index) => {
    const nuevosAcompanantes = acompanantes.filter((_, i) => i !== index);
    setAcompanantes(nuevosAcompanantes);
};

const darAcceso = async (idVisit, entradaH, estado) => {
  try {
      const response = await axios.put(`${api}/up/acceso/${idVisit}`, {
          //id_visit: idVisit,
          entrada_r: entradaH,
          est: estado,
          id_usu: user.id_usu,
      }, {
          headers: {
              'Content-Type': 'application/json',
          },
      });

      console.log('Actualización exitosa:', response.data);
      //alert('Datos actualizados correctamente.');
  } catch (error) {
      console.error('Error al actualizar los datos:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
      });

      if (error.response?.status === 500) {
          //alert('Error en el servidor. Por favor, intente nuevamente.');
      } else {
          //alert('Error al actualizar los datos. Por favor, intente nuevamente.');
      }
  }
  setOpenGenerarAcceso(false);
};

const handleGenerateImage = () => {
  const idVisit = selectedVisita.id_visit; 
  const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); 
  const estado = "A";
  const idUsuario = user.id_usu; 

 
  darAcceso(idVisit, currentDateTime, estado, idUsuario);

  if (visitaDetailsRef.current) {
      visitaDetailsRef.current.style.padding = '20px'; 

      html2canvas(visitaDetailsRef.current).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = 'visita_acceso.png';
          link.click();

      });
  } else {
      console.error('El elemento para la imagen no existe');
  }
};


//visitas activas
const [visitantes, setVisitantes] = useState([]);
const [transportistas, setTransportistas] = useState([]);

const getVisitasAct = async () => {
  try {
    const response = await axios.get(`${api}/agenda/activas`);
    console.log('Respuesta de la API:', response.data);

    // Validar datos y establecerlos en el estado
    setVisitantes(Array.isArray(response.data.visitas) ? response.data.visitas : []);
    setTransportistas(Array.isArray(response.data.transportistas) ? response.data.transportistas : []);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
};


  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexDirection={isSmallScreen ? "column" : "row"}
      >
        <TextField
          label="Buscar"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{
            width: isSmallScreen ? "100%" : "300px",
            mb: isSmallScreen ? 2 : 0,
          }}
        />
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddAltIcon />}
            onClick={handleClickOpenCreateIn}
          >
            Nuevo visitante
          </Button>
          <Button
            variant="contained"
            startIcon={<LocalShippingIcon />}
            onClick={handleClickOpenCreateTransp}
          > 
            Nuevo transportista
          </Button>
          <Button
            variant="contained"
            startIcon={<ScheduleIcon />}
            onClick={handleClickOpenCreateVisita}
          >
            Programar visita
          </Button>
        </Box>

        
      </Box>
      <Dialog
        open={openCreateInvitado}
        onClose={handleCloseCreateIn}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nuevo visitante</DialogTitle>
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
                      <div style={{ marginTop: "10px" }}>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          style={{ display: "block", margin: "auto" }}
                        />
                        <Button
                          severity="danger"
                          rounded
                          outlined
                          text
                          startIcon={<PhotoCamera />}
                          style={{ width: "90%" }}
                          onClick={tomarFoto}
                        >
                          Tomar Foto
                        </Button>
                      </div>
                    </Dialog>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Formulario de selección */}
            <Grid item xs={12} sm={6} md={4}>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="tipo-invitado-label">Tipo de invitado</InputLabel>
                    <Select
                        labelId="tipo-invitado-label"
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
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="empresa"
                  name="empresa"
                  value={invit.empresa}
                  onChange={inputChange}
                  variant="outlined"
                  label="Empresa"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="no_ine"
                  name="no_ine"
                  label="No. INE"
                  value={invit.no_ine}
                  onChange={inputChange}
                />
              </FormControl>
            </Grid>

            {/* Más campos de texto */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="nombre"
                  name="nombre"
                  label="Nombre completo"
                  value={invit.nombre}
                  onChange={inputChange}
                  variant="outlined"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  id="telefono"
                  name="telefono"
                  label="Teléfono"
                  value={invit.telefono}
                  onChange={inputChange}
                />
              </FormControl>
            </Grid>

            {/* Checkbox y datos adicionales */}
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
            </Grid>

            {checked && (
              <Grid item xs={12}>
                <Divider textAlign="left">
                  <CarCrash />
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
                    </FormControl>
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
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button variant="outlined" color="secondary" sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={createInvitado}
            >
              Finalizar
            </Button>
          </Box>
        </DialogContent>
        <Container></Container>
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
              mb={2}
              flexDirection={isSmallScreen ? "column" : "row"} marginTop={5}>
            Nuevo transportista
            <Grid item xs={12} sm={6} md={3} >
              <Button variant="outlined" color="secondary" sx={{ mr: 2 }}>
                Importar
              </Button>
            </Grid>
          </Box>
        </DialogTitle>
        <DialogContent>
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
                      <div style={{ marginTop: "10px" }}>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          style={{ display: "block", margin: "auto" }}
                        />
                        <Button
                          severity="danger"
                          rounded
                          outlined
                          text
                          startIcon={<PhotoCamera />}
                          style={{ width: "90%" }}
                          onClick={tomarFoto}
                        >
                          Tomar Foto
                        </Button>
                      </div>
                    </Dialog>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="empresa"
                  name="empresa"
                  value={transp.empresa}
                  onChange={inputChange}
                  variant="outlined"
                  label="Empresa"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="no_ine"
                  name="no_ine"
                  label="No. INE"
                  value={transp.no_ine}
                  onChange={inputChange}
                />
              </FormControl>
            </Grid>

            {/* Más campos de texto */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  id="nombre"
                  name="nombre"
                  label="Nombre completo"
                  value={transp.nombre}
                  onChange={inputChange}
                  variant="outlined"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  id="telefono"
                  name="telefono"
                  label="Teléfono"
                  value={transp.telefono}
                  onChange={inputChange}
                />
              </FormControl>
            </Grid>

            {/* Checkbox y datos adicionales */}
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
            </Grid>

            {checked && (
              <Grid item xs={12}>
                <Divider textAlign="left">
                  <CarCrash />
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
                        value={transp.no_licencia}
                        onChange={inputChangeTransp}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="modelo"
                        name="modelo"
                        label="Modelo"
                        value={transp.modelo}
                        onChange={inputChangeTransp}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="placa"
                        name="placa"
                        label="Placa"
                        value={transp.placa}
                        onChange={inputChangeTransp}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="marca"
                        name="marca"
                        label="Marca"
                        value={transp.marca}
                        onChange={inputChangeTransp}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="anio"
                        name="anio"
                        label="Año"
                        value={transp.anio}
                        onChange={inputChangeTransp}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        id="seguro"
                        name="seguro"
                        label="Poliza de seguro"
                        value={transp.seguro}
                        onChange={inputChangeTransp}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button variant="outlined" color="secondary" sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={createTransportista}
            >
              Finalizar
            </Button>
          </Box>
        </DialogContent>
        <Container></Container>
      </Dialog>
      <Dialog
        open={openCreateVisita}
        onClose={handleCloseCreateVisita}
        maxWidth="md"
        fullWidth
        >
        <DialogTitle>Agendar visita</DialogTitle>
        <DialogContent >
            <Grid container spacing={2}>
            {/* Selección de visita */}
            <Grid item xs={4} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="id_vit-label">Selecciona una visita</InputLabel>
                <Select
                    labelId="id_vit-label"
                    id="id_vit"
                    name="id_vit"
                    value={selectedAcs}
                    onChange={(e) => handleDropdownChange(e.target.value)}
                >
                    <MenuItem value="">Seleccionar visita</MenuItem>
                    {accesos.map((item) => (
                    <MenuItem key={item.clave} value={item}>
                        {item.label}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    id="categoria"
                    name="categoria"
                    value={selectedAcs?.categoria || ''}
                    label="Tipo de visita"
                    InputProps={{ readOnly: true }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    id="personal"
                    name="personal"
                    label="Responsable de la visita"
                    value={visita.personal}
                    onChange={inputChangeVis}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                />
                </FormControl>
            </Grid>

            {/* Fechas y horas */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    label="Día de la visita"
                    value={dateV}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
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
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    id="motivo"
                    name="motivo"
                    label="Motivo de la visita"
                    value={visita.motivo}
                    onChange={inputChangeVis}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                />
                </FormControl>
            </Grid>

            {/* Área y acompañantes */}
            <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    id="area_per"
                    name="area_per"
                    label="Área que visita"
                    value={visita.area_per}
                    onChange={inputChangeVis}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                />
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
            </Grid>

            {checkedVisita && (
                <Grid item xs={12}>
                {acompanantes.map((acompanante, index) => (
                    <Grid
                    container
                    key={index}
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                    >
                    <Grid item xs={10}>
                        <TextField
                        fullWidth
                        id={`nom_com_${index}`}
                        name={`nom_com_${index}`}
                        value={acompanante.nom_com}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        label={`Nombre de acompañante ${index + 1}`}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button
                        variant="contained"
                        color="error"
                        onClick={() => eliminarAcompanante(index)}
                        >
                        Eliminar
                        </Button>
                    </Grid>
                    </Grid>
                ))}
                <Button
                    variant="outlined"
                    onClick={agregarAcompanante}
                    startIcon={<AddIcon />}
                >
                    Otro acompañante
                </Button>
                </Grid>
            )}
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button
            variant="outlined"
            color="secondary"
            onClick={handleClickOpenCreateVisita}
            >
            Cancelar
            </Button>
            <Button
            variant="contained"
            color="primary"
            onClick={newVisita}
            startIcon={<Group />}
            >
            Agendar
            </Button>
        </DialogActions>
        </Dialog>
        {/* Filtro debajo del buscador y botones */}
        <div>
          <Box mb={2}>
            <Grid container spacing={3}>
              {searchQuery && filteredVisitas.length > 0 ? (
                filteredVisitas.map((visita, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent sx={{ display: 'flex' }}>
                        {/* Avatar and Image */}
                        <Avatar
                          src={`${foto}/${visita.foto}`}
                          alt={visita.nombre}
                          sx={{
                            width: 150,
                            height: 150,
                            marginRight: '15px',
                            objectFit: 'cover',
                          }}
                        />
                        {/* Textual information */}
                        <div style={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            <i className="pi pi-user" style={{ marginRight: 5 }} />
                            {visita.nombre}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <i className="pi pi-warehouse" style={{ marginRight: 5 }} />
                            Empresa: {visita.empresa}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <i className="pi pi-thumbtack" style={{ marginRight: 5 }} />
                            Relación: {visita.tipo}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <i className="pi pi-car" style={{ marginRight: 5 }} />
                            Placa: {visita.placa}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <i className="pi pi-cloud" style={{ marginRight: 5 }} />
                            Día visita: {formatDateToYMD(visita.reg_entrada)}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 2 }}>
                            <i className="pi pi-clock" style={{ marginRight: 5 }} />
                            Hora visita: {visita.hora_entrada}
                          </Typography>

                          {/* Button */}
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<i className="pi pi-qrcode" />}
                            onClick={() => handleClickOpenAcceso(visita)}
                          >
                            Pase de acceso
                          </Button>
                          <Dialog open={openGenerarAcceso} onClose={handleCloseAcceso} >
                            <DialogContent style={{margin:'10px'}} >
                            {selectedVisita && (
                                  <div ref={visitaDetailsRef}>
                                    <Grid container alignItems="center" spacing={1}>
                                        {/* Imagen */}
                                        <Grid item>
                                            {/*<img src={logob} width={25} height={25} alt="Logo" className="imagen-visita" />*/}
                                        </Grid>

                                        {/* Texto */}
                                        <Grid item>
                                        <h2>VISITA SANTUL - {selectedVisita.id_vit}</h2>
                                        </Grid>
                                    </Grid>
                                    <Grid container alignItems="center" spacing={1}>
                                        <Grid item>
                                            {selectedVisita && (
                                                <QRCodeCanvas
                                                value={JSON.stringify({
                                                    nombre: selectedVisita.nombre,
                                                    empresa: selectedVisita.empresa,
                                                    placa: selectedVisita.placa,
                                                    diaVisita: formatDateToYMD(selectedVisita.reg_entrada),
                                                    horaVisita: selectedVisita.hora_entrada,
                                                })}
                                                size={80}
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                level="Q"
                                                width={20}
                                                height={20}
                                                />
                                            )}
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1"><strong>NOMBRE:</strong> {selectedVisita.nombre}</Typography>
                                            <Typography variant="body1"><strong>RELACION:</strong> {selectedVisita.tipo}</Typography> 
                                            <Typography variant="body1"><strong>AREA DE ACCESO:</strong> {selectedVisita.area_per}</Typography>
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
                                  Generar Imagen
                                </Button>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : searchQuery ? (
                <Grid item xs={12}>
                  <Typography variant="h6" color="textSecondary" align="center">
                    No se encontraron coincidencias para "{searchQuery}".
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="h6" color="textSecondary" align="center">
                    Ingresa un nombre para buscar visitas.
                  </Typography>
                  <div>
          {/* Listado de visitantes */}
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Visitantes
          </Typography>
          <Grid container spacing={2}>
            {visitantes.map((visitante, index) => (
              <Grid item xs={12} sm={6} md={4} key={`visitante-${index}`}>
                <Card>
                  <CardContent sx={{ display: 'flex' }}>
                    <Avatar
                      src={visitante.foto ? `${foto}/${visitante.foto}` : '/placeholder.png'}
                      alt={visitante.nombre || 'Sin nombre'}
                      sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {visitante.nombre || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Empresa: {visitante.empresa || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Relación: {visitante.tipo || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Entrada: {visitante.reg_entrada ? new Date(visitante.reg_entrada).toLocaleDateString('es-ES') : 'N/A'}
                      </Typography>
                    </div>
                  </CardContent>
                  {visitante.est === 'A' && (
                    <Alert icon={<PrecisionManufacturingIcon/>} severity="success">
                      Trabajando
                  </Alert>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Listado de transportistas */}
          <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
            Transportistas
          </Typography>
          <Grid container spacing={2}>
            {transportistas.map((transportista, index) => (
              <Grid item xs={12} sm={6} md={4} key={`transportista-${index}`}>
                <Card>
                  <CardContent sx={{ display: 'flex' }}>
                    <Avatar
                      src={transportista.foto ? `${foto}/${transportista.foto}` : '/placeholder.png'}
                      alt={transportista.nombre || 'Sin nombre'}
                      sx={{ width: 150, height: 150, marginRight: '15px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {transportista.nombre || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Empresa: {transportista.empresa || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Placa: {transportista.placa || 'N/A'}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
                </Grid>
              )}
            </Grid>
          </Box>
        </div>
    </Container>
  );
}

export default Visitantes;

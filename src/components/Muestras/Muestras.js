import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
  TextField, Button, Grid, Container, Typography, Paper, FormControlLabel, Checkbox, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, Box, Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import { pdfTemplate } from "./pdfTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddTaskIcon from "@mui/icons-material/AddTask";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import Swal from 'sweetalert2';


function Muestras() {
  const [currentTab, setCurrentTab] = useState(0);
  const [vista, setVista] = useState("formulario");
  const [user, setUser] = useState(null);

  const [departamento, setDepartamento] = useState("");
  const [motivo, setMotivo] = useState("");
  const [regresaArticulo, setRegresaArticulo] = useState(false);
  const [fecha, setFecha] = useState("");
  const [requiereEnvio, setRequiereEnvio] = useState(false);
  const [detalleEnvio, setDetalleEnvio] = useState("");
  const [departamentos, setDepartamentos] = useState([]);

  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [producto, setProducto] = useState(null);

  const [alerta, setAlerta] = useState(false);
  const [alertaMessage, setAlertaMessage] = useState("");

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesAutorizadas, setSolicitudesAutorizadas] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [productosModal, setProductosModal] = useState([]);

  const [solicitudModalFolio, setSolicitudModalFolio] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);


  let timeoutId = useRef(null);



  useEffect(() => {
    if (user) {
      // Establecer el valor inicial de las pestañas según el rol
      if (user.role === "Master") {
        setCurrentTab(1); // Solo puede ver "Autorizar"
      } else if (user.role === "INV") {
        setCurrentTab(0); // Solo puede ver "Formulario y Carrito"
      } else if (user.role === "Admin") {
        setCurrentTab(0); // Admin puede ver todo (Formulario, Autorizar, Imprimir)
      }
    }
  }, [user]);

  const handleOpenModal = (productos, folio) => {
    setProductosModal(productos);
    setSolicitudModalFolio(folio); // ✅ Aquí se guarda el folio actual
    setOpenModal(true);
  };

  const [reabrirModal, setReabrirModal] = useState(false);



  const handleCloseModal = () => {
    setOpenModal(false);
    setProductosModal([]); // Limpiar datos si quieres
    setSolicitudSeleccionada(null); // o setOpenParentModal(false) si es otro estado
  };


  const obtenerDepartamentos = async () => {
    try {
      const response = await axios.get("http://localhost:3007/api/muestras/departamentos");
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };


  const handleMotivoChange = (event) => {
    setMotivo(event.target.value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    obtenerDepartamentos(); // 👈 ESTA LÍNEA FALTA
  }, []);



  const manejarEnvio = (e) => {
    e.preventDefault();

    if (!user || !user.name || !departamento || !motivo) {
      setAlerta(true);
      setAlertaMessage("¡Por favor complete los campos obligatorios!");
      return;
    }

    const nuevaSolicitud = {
      nombre: user.name,
      departamento,
      motivo,
      regresaArticulo,
      fecha: regresaArticulo ? fecha : null,
      requiereEnvio: regresaArticulo ? requiereEnvio : false,
      detalleEnvio: regresaArticulo && requiereEnvio ? detalleEnvio : "",
      carrito: [],
      autorizado: false,
      enviadoParaAutorizar: false,
    };

    // ⛔ Ya no guardes en backend aquí
    setSolicitudes((prev) => [...prev, nuevaSolicitud]);
    setVista("carrito");
  };





  const handleCodigoChange = (event) => {
    const value = event.target.value;
    setCodigo(value);

    // Si hay un "timeout" previo, lo limpia para esperar el nuevo valor
    clearTimeout(timeoutId);

    // Establece un nuevo "timeout" para ejecutar la búsqueda después de 500ms
    timeoutId = setTimeout(() => {
      buscarProducto(value);
    }, 500);
  };

  const buscarProducto = async (codigo) => {
    if (codigo.trim() === "") {
      setProducto(null);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3007/api/muestras/producto/${codigo}`
      );

      // Verifica la estructura de la respuesta
      console.log("Producto recibido:", response.data);

      setProducto(response.data); // Asigna la respuesta del producto
    } catch (error) {
      console.error("Error al buscar el producto:", error);
      setProducto(null);
    }
  };


  const agregarAlCarrito = () => {
    if (!producto || !producto.codigo || cantidad <= 0) {
      setAlerta(true);
      setAlertaMessage("Producto no válido o cantidad incorrecta");
      return;
    }

    const item = {
      codigo: producto.codigo,
      des: producto.des,
      imagen: `../assets/image/img_pz/${producto.codigo}.jpg`,
      cantidad,
      ubi: producto.ubi || "",
    };

    const lastSolicitudIndex = solicitudes.length - 1;
    if (lastSolicitudIndex < 0) {
      setAlerta(true);
      setAlertaMessage("No hay ninguna solicitud activa para agregar productos.");
      return;
    }

    const currentSolicitud = solicitudes[lastSolicitudIndex];

    const productoExistente = currentSolicitud.carrito.find(
      (p) => p.codigo === item.codigo
    );

    let updatedCarrito;
    if (productoExistente) {
      updatedCarrito = currentSolicitud.carrito.map((p) =>
        p.codigo === item.codigo ? { ...p, cantidad: p.cantidad + cantidad } : p
      );
    } else {
      updatedCarrito = [...currentSolicitud.carrito, item];
    }

    const updatedSolicitud = { ...currentSolicitud, carrito: updatedCarrito };
    const updatedSolicitudes = [
      ...solicitudes.slice(0, lastSolicitudIndex),
      updatedSolicitud,
    ];

    setSolicitudes(updatedSolicitudes);

    setCodigo(""); // limpiar
    setCantidad(1);
    setProducto(null);
  };



  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const autorizarSolicitud = async (folio) => {
    try {
      // Actualiza en el backend
      await axios.patch(`http://localhost:3007/api/muestras/solicitudes/${folio}`, {
        autorizado: true,
        enviadoParaAutorizar: true,
        autorizado_por: user.name
      });

      // Actualiza en frontend
      const solicitudIndex = solicitudes.findIndex((s) => s.folio === folio);
      if (solicitudIndex === -1) return;

      const solicitudAutorizada = {
        ...solicitudes[solicitudIndex],
        autorizado: true,
        enviadoParaAutorizar: true,
        autorizado_por: user.name // ✅ AÑADIDO AL ESTADO
      };

      const nuevasSolicitudes = [...solicitudes];
      nuevasSolicitudes.splice(solicitudIndex, 1);
      setSolicitudes(nuevasSolicitudes);

      setSolicitudesAutorizadas([...solicitudesAutorizadas, solicitudAutorizada]);
    } catch (error) {
      console.error("❌ Error al autorizar solicitud:", error);
      setAlerta(true);
      setAlertaMessage("No se pudo autorizar la solicitud.");
    }
    await obtenerSolicitudesAutorizadas(); // 🔥 Esto actualiza con los datos correctos
  };

  const borrarSolicitudAutorizada = async (folio) => {
    try {
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Esta acción eliminará la solicitud ${folio}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmacion.isConfirmed) {
        await axios.delete(`http://localhost:3007/api/muestras/solicitudes/${folio}`);

        // 🔁 ACTUALIZA EL ESTADO PARA QUE LA TABLA SE REFRESQUE
        setSolicitudesAutorizadas((prev) => prev.filter((sol) => sol.folio !== folio));

        Swal.fire('Eliminado', 'La solicitud fue eliminada correctamente.', 'success');
      }
    } catch (error) {
      console.error("❌ Error al borrar solicitud:", error);
      Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
    }
  };


  const solicitudesAutorizadasFiltradas = solicitudesAutorizadas;

  const generarPDF = async (solicitud) => {
    const htmlString = pdfTemplate(solicitud);

    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.style.width = "210mm";
    iframe.style.height = "297mm";
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlString);
    iframe.contentDocument.close();

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeBody = iframeDoc.body;

    const canvas = await html2canvas(iframeBody, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Solicitud_${solicitud.folio}.pdf`);

    document.body.removeChild(iframe);
  };

  const enviarAAutorizar = async () => {
    if (solicitudes.length === 0) {
      setAlerta(true);
      setAlertaMessage("No hay solicitudes para enviar a autorizar.");
      return;
    }

    const lastSolicitudIndex = solicitudes.length - 1;
    const lastSolicitud = { ...solicitudes[lastSolicitudIndex] };

    if (!lastSolicitud.enviadoParaAutorizar) {
      lastSolicitud.enviadoParaAutorizar = true;

      try {
        await axios.post("http://localhost:3007/api/muestras/solicitudes", lastSolicitud);
        setSolicitudes((prev) => {
          const copia = [...prev];
          copia[lastSolicitudIndex] = lastSolicitud;
          return copia;
        });
        setCurrentTab(1);
      } catch (error) {
        console.error("❌ Error al enviar a autorizar:", error);
        setAlerta(true);
        setAlertaMessage("Error al enviar solicitud.");
      }
    }
  };


  const guardarSolicitudes = async (arr) => {
    setSolicitudes(arr);
    try {
      await axios.post("http://localhost:3007/api/muestras/solicitudes", arr[arr.length - 1]);
    } catch (error) {
      console.error("Error al guardar solicitudes:", error);
      setAlerta(true);
      setAlertaMessage("Error al guardar solicitudes en el servidor");
    }
  };

  const guardarAutorizadas = async (arr) => {
    setSolicitudesAutorizadas(arr);
    try {
      await axios.post("http://localhost:3007/api/muestras/solicitudes", arr);
    } catch (error) {
      console.error("Error al guardar autorizadas:", error);
      setAlerta(true);
      setAlertaMessage("Error al guardar solicitudes autorizadas en el servidor");
    }
  };


  const removeProduct = async (codigo, folio) => {
    setOpenModal(false); // 🔒 Cierra temporalmente el modal para evitar superposición visual
    setReabrirModal(true); // 🔁 Indica que debe reabrirse si se cancela

    const confirmacion = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Este producto será removido de la solicitud.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      setOpenModal(true);  // ❌ No se eliminó, vuelve a mostrar el modal
      setReabrirModal(false);
      return;
    }

    try {
      // 🔥 Eliminar del backend solo si ya fue guardado
      if (folio) {
        await axios.delete(`http://localhost:3007/api/muestras/solicitudes/${folio}/producto/${codigo}`);
      }

      const nuevasSolicitudes = [...solicitudes];
      const index = nuevasSolicitudes.findIndex((s) => s.folio === folio);
      if (index !== -1) {
        const productosActualizados = nuevasSolicitudes[index].carrito.filter((p) => p.codigo !== codigo);
        nuevasSolicitudes[index].carrito = productosActualizados;

        setSolicitudes(nuevasSolicitudes);
        guardarSolicitudes(nuevasSolicitudes);
        setProductosModal(productosActualizados);
      }

      Swal.fire("Eliminado", "Producto eliminado correctamente.", "success");
      setReabrirModal(false);

    } catch (error) {
      console.error("❌ Error al eliminar el producto:", error);
      Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      if (reabrirModal) setOpenModal(true); // Reabre si hubo error
      setReabrirModal(false);
    }
  };





  useEffect(() => {
    obtenerSolicitudes();
    obtenerSolicitudesAutorizadas();
  }, []);



  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        const response = await axios.get("http://localhost:3007/api/muestras/solicitudes");
        setSolicitudes(response.data);
      } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error);
      }
    };

    cargarSolicitudes();
  }, []);


  const normalizarSolicitudes = (data) =>
    data.map((s) => ({
      ...s,
      requiereEnvio: s.requiere_envio === 1,
      detalleEnvio: s.detalle_envio,
      regresaArticulo: s.regresa_articulo === 1,
    }));

  const obtenerSolicitudes = async () => {
    try {
      const response = await axios.get("http://localhost:3007/api/muestras/solicitudes");
      const normalizadas = normalizarSolicitudes(response.data);
      setSolicitudes(normalizadas);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  const obtenerSolicitudesAutorizadas = async () => {
    try {
      const response = await axios.get("http://localhost:3007/api/muestras/autorizadas");
      const normalizadas = normalizarSolicitudes(response.data);
      setSolicitudesAutorizadas(normalizadas);
    } catch (error) {
      console.error("Error al obtener autorizadas:", error);
    }
  };

  const borrarSolicitud = async (folio) => {
    try {
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Esta acción eliminará la solicitud ${folio}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmacion.isConfirmed) {
        await axios.delete(`http://localhost:3007/api/muestras/solicitudes/${folio}`);

        // 🔁 ACTUALIZA EL ESTADO PARA QUE LA TABLA SE REFRESQUE
        setSolicitudesAutorizadas((prev) => prev.filter((sol) => sol.folio !== folio));

        Swal.fire('Eliminado', 'La solicitud fue eliminada correctamente.', 'success');
      }
    } catch (error) {
      console.error("❌ Error al borrar solicitud:", error);
      Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
    }
  };



  return (

    <Container component="main" maxWidth="lg">
      <Tabs value={currentTab} onChange={handleTabChange} centered>
        {/* Solo Admin, INV y Master pueden ver "Formulario y Carrito" */}
        <Tab
          label="Formulario y Carrito"
          disabled={
            user?.role !== "Admin" &&
            user?.role !== "INV" &&
            user?.role !== "Master"
          }
        />
        {/* Solo Admin y Master pueden ver "Autorizar" */}
        <Tab
          label="Autorizar"
          disabled={user?.role !== "Admin" && user?.role !== "Master"}
        />
        {/* Solo Admin e INV pueden ver "Imprimir" */}
        <Tab
          label="Imprimir"
          disabled={
            user?.role !== "Admin" &&
            user?.role !== "INV" &&
            user?.role !== "Master"
          }
        />
      </Tabs>

      <Box mt={3}>



        {currentTab === 0 && (
          <Paper elevation={3} style={{ padding: "20px" }}>
            {vista === "formulario" && (
              <Paper
                elevation={3}
                style={{ padding: "20px", marginBottom: "20px" }}
              >
                <Typography variant="h5" align="center" gutterBottom>
                  Formulario de Solicitud
                </Typography>

                <form onSubmit={manejarEnvio}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Nombre del solicitante"
                        variant="outlined"
                        fullWidth
                        value={user?.name || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>

                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Departamento</InputLabel>
                        <Select
                          label="Departamento"
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                          required
                        >
                          {departamentos.map((dept, index) => (
                            <MenuItem key={index} value={dept.value}>
                              {dept.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>


                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="motivo-label">
                          Motivo de la solicitud
                        </InputLabel>
                        <Select
                          labelId="motivo-label"
                          value={motivo}
                          onChange={handleMotivoChange}
                          label="Motivo de la solicitud"
                        >
                          <MenuItem value="Muestras">Muestras</MenuItem>
                          <MenuItem value="Donaciones">Donaciones</MenuItem>
                          <MenuItem value="Maquila Interns">
                            Maquila Interns
                          </MenuItem>
                          <MenuItem value="Obsequio">Obsequio</MenuItem>
                          <MenuItem value="Cambio Fisico">
                            Cambio Fisico
                          </MenuItem>
                          <MenuItem value="Insumos Pop">Insumos Pop</MenuItem>
                          <MenuItem value="Maquila Externa">
                            Maquila Externa
                          </MenuItem>
                          <MenuItem value="Uso Interno">Uso Interno</MenuItem>
                          <MenuItem value="Pruebas">Pruebas</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Ambos campos visibles, sin dependencias */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={regresaArticulo}
                            onChange={(e) =>
                              setRegresaArticulo(e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label="¿Regresa artículo?"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={requiereEnvio}
                            onChange={(e) => setRequiereEnvio(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="¿Requiere envío?"
                      />
                    </Grid>

                    {/* Si "Regresa artículo" está seleccionado, muestra la fecha de devolución */}
                    {regresaArticulo && (
                      <Grid item xs={12}>
                        <TextField
                          label="Fecha de devolución"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          required
                        />
                      </Grid>
                    )}

                    {/* Si "Requiere envío" está seleccionado, muestra los detalles del envío */}
                    {requiereEnvio && (
                      <Grid item xs={12}>
                        <TextField
                          label="Detalles del envío"
                          variant="outlined"
                          fullWidth
                          value={detalleEnvio}
                          onChange={(e) => setDetalleEnvio(e.target.value)}
                          required
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                      >
                        Continuar
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            )}

            {vista === "carrito" && (
              <Paper elevation={3} style={{ padding: "20px" }}>
                <Typography variant="h5" align="center" gutterBottom>
                  Carrito de Solicitudes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Código del Producto"
                      variant="outlined"
                      fullWidth
                      value={codigo}
                      onChange={handleCodigoChange} // Llama a la función que maneja el cambio
                    />
                  </Grid>
                </Grid>

                {producto && (
                  <TableContainer
                    component={Paper}
                    style={{ marginTop: "20px" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Imagen</TableCell>
                          <TableCell>Código</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell>UM en Piezas</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>

                            <img
                              src={`../assets/image/img_pz/${producto.codigo}.jpg`}

                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/image/img_pz/noimage.png";
                              }}
                              alt="Producto"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />

                          </TableCell>
                          <TableCell>{producto.codigo}</TableCell>
                          <TableCell>{producto.des}</TableCell>
                          <TableCell>

                            <Grid container spacing={2} alignItems="center">
                              <Grid item>
                                <IconButton
                                  onClick={() =>
                                    setCantidad(cantidad > 1 ? cantidad - 1 : 1)
                                  } // Reduce la cantidad, pero nunca menos de 1
                                  sx={{ minWidth: "40px", padding: "10px" }}
                                  title="Disminuir cantidad"
                                >
                                  <RemoveCircleOutlineIcon />
                                </IconButton>
                              </Grid>
                              <Grid item>
                                <TextField
                                  type="outlined"
                                  value={cantidad}
                                  onChange={(e) =>
                                    setCantidad(Number(e.target.value))
                                  }
                                  inputProps={{ min: 1 }}
                                  style={{ width: "80px", textAlign: "center" }}
                                />
                              </Grid>
                              <Grid item>
                                <IconButton
                                  onClick={() => setCantidad(cantidad + 1)} // Incrementa la cantidad
                                  sx={{ minWidth: "40px", padding: "10px" }}
                                  title="Aumentar cantidad"
                                >
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </Grid>
                            </Grid>

                          </TableCell>
                          <TableCell>
                            <Button
                              sx={{
                                backgroundColor: "green",
                                color: "white",
                                "&:hover": { backgroundColor: "darkgreen" },
                              }}
                              onClick={agregarAlCarrito}
                              startIcon={<AddShoppingCartIcon />}
                            >
                              Agregar
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {solicitudes.length > 0 && (
                  <>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Typography variant="h6">
                        Productos en la Última Solicitud:
                      </Typography>
                    </Box>
                    <TableContainer
                      component={Paper}
                      style={{ marginTop: "20px" }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Imagen</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {solicitudes[solicitudes.length - 1].carrito.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.codigo}</TableCell>
                              <TableCell>
                                <img
                                  src={`../assets/image/img_pz/${item.codigo}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/assets/image/img_pz/noimage.png";
                                  }}
                                  alt="Producto"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              </TableCell>
                              <TableCell>{item.des}</TableCell>
                              <TableCell>{item.cantidad}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => {
                                    const folio = solicitudes[solicitudes.length - 1].folio;
                                    removeProduct(item.codigo, folio);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>


                      </Table>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={enviarAAutorizar}
                      >
                        Enviar a Autorizar
                      </Button>
                    </TableContainer>
                  </>
                )}
              </Paper>
            )}
          </Paper>
        )}



        {currentTab === 1 && (
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h5" align="center" gutterBottom>
              Autorizar Solicitudes
            </Typography>

            {solicitudes.filter((s) => s.enviadoParaAutorizar || s.enviado_para_autorizar === 1).length === 0 && (
              <Typography>No hay solicitudes para autorizar.</Typography>
            )}

            {solicitudes.filter((s) => s.enviadoParaAutorizar || s.enviado_para_autorizar === 1).length > 0 && (
              <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Folio</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Fecha Devolución</TableCell>
                      <TableCell>Requiere Envío</TableCell>
                      <TableCell>Detalles Envío</TableCell>
                      <TableCell>Artículos</TableCell>
                      <TableCell>Autorizado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {solicitudes
                      .filter((s) => s.enviadoParaAutorizar || s.enviado_para_autorizar === 1)
                      .map((sol) => (
                        <TableRow key={sol.folio}>
                          <TableCell>{sol.folio}</TableCell>
                          <TableCell>{sol.nombre}</TableCell>
                          <TableCell>{sol.departamento}</TableCell>
                          <TableCell>{sol.motivo}</TableCell>
                          <TableCell>
                            {sol.fecha ? new Date(sol.fecha).toLocaleDateString("es-MX") : "N/A"}
                          </TableCell>
                          <TableCell>{sol.requiere_envio ? "Sí" : "No"}</TableCell>
                          <TableCell>{sol.detalle_envio || "N/A"}</TableCell>
                          <TableCell>{sol.carrito?.length || 0}</TableCell>
                          <TableCell>{sol.autorizado ? "Sí" : "No"}</TableCell>

                          <TableCell>
                            <Box display="flex" justifyContent="flex-start" alignItems="center">
                              {!sol.autorizado && (
                                <IconButton
                                  onClick={() => autorizarSolicitud(sol.folio)}
                                  color="success"
                                  title="Autorizar y Generar PDF"
                                  style={{ marginRight: "10px" }}
                                >
                                  <AddTaskIcon />
                                </IconButton>
                              )}

                              <IconButton
                                onClick={() => handleOpenModal(sol.carrito, sol.folio)}
                                sx={{ color: "orange" }}
                                title="Ver productos"
                              >
                                <VisibilityIcon />
                              </IconButton>


                              {!sol.autorizado && (
                                <IconButton
                                  onClick={() => borrarSolicitud(sol.folio)}
                                  color="error"
                                  title="Eliminar solicitud"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}



        {currentTab === 2 && (
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h5" align="center" gutterBottom>
              Imprimir Solicitudes
            </Typography>
            {solicitudesAutorizadas.length > 0 ? (
              <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Folio</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Fecha Devolución</TableCell>
                      <TableCell>Requiere Envío</TableCell>
                      <TableCell>Detalles Envío</TableCell>
                      <TableCell>Artículos</TableCell>
                      <TableCell>Autorizado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {solicitudesAutorizadas.map((sol) => (
                      <TableRow key={sol.folio}>
                        <TableCell>{sol.folio}</TableCell>
                        <TableCell>{sol.nombre}</TableCell>
                        <TableCell>{sol.departamento}</TableCell>
                        <TableCell>{sol.motivo}</TableCell>
                        <TableCell>
                          {sol.fecha ? new Date(sol.fecha).toLocaleDateString("es-MX") : "N/A"}
                        </TableCell>

                        <TableCell>{sol.requiereEnvio ? "Sí" : "No"}</TableCell>
                        <TableCell>{sol.detalleEnvio || "N/A"}</TableCell>


                        <TableCell>{sol.carrito.length}</TableCell>
                        <TableCell>{sol.autorizado ? "Sí" : "No"}</TableCell>

                        <TableCell>
                          <IconButton
                            onClick={() => generarPDF(sol)}
                            sx={{ color: 'black' }}
                          >
                            <LocalPrintshopIcon />
                          </IconButton>

                          <IconButton
                            onClick={() => borrarSolicitud(sol.folio)}
                            color="error"
                            title="Eliminar solicitud"
                          >
                            <DeleteIcon />
                          </IconButton>


                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No hay solicitudes autorizadas.</Typography>
            )}
          </Paper>
        )}



        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Productos de la Solicitud</DialogTitle>
          <DialogContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosModal.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.imagen}
                        alt="Producto"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />

                    </TableCell>
                    <TableCell>{item.codigo}</TableCell>
                    <TableCell>{item.descripcion || item.des || "Sin descripción"}</TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>

                      <IconButton
                        color="error"
                        onClick={() => removeProduct(item.codigo, solicitudModalFolio)}
                      >
                        <DeleteIcon />
                      </IconButton>





                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

      </Box>

      <Snackbar
        open={alerta}
        autoHideDuration={6000}
        onClose={() => setAlerta(false)}
      >
        <Alert
          onClose={() => setAlerta(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {alertaMessage}
        </Alert>
      </Snackbar>

    </Container>

  );
}

export default Muestras;
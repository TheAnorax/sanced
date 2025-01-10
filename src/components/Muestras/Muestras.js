import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { pdfTemplate } from "./pdfTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddTaskIcon from "@mui/icons-material/AddTask";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Para aumentar
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"; // Para disminuir

function Muestras() {
  const [currentTab, setCurrentTab] = useState(0); // 0: Formulario/Carrito, 1: Autorizar, 2: Imprimir
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
  const [solicitudesAutorizadas, setSolicitudesAutorizadas] = useState([]); // Al autorizar se moverán aquí

  const [openModal, setOpenModal] = useState(false);
  const [productosModal, setProductosModal] = useState([]);

  let timeoutId = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedSolicitudes = localStorage.getItem("solicitudes");
    if (storedSolicitudes) {
      setSolicitudes(JSON.parse(storedSolicitudes));
    }

    const storedAutorizadas = localStorage.getItem("solicitudesAutorizadas");
    if (storedAutorizadas) {
      setSolicitudesAutorizadas(JSON.parse(storedAutorizadas));
    }

    obtenerDepartamentos();
  }, []);

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

  const handleOpenModal = (productos) => {
    setProductosModal(productos);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const guardarSolicitudes = (arr) => {
    setSolicitudes(arr);
    localStorage.setItem("solicitudes", JSON.stringify(arr));
  };

  const guardarAutorizadas = (arr) => {
    setSolicitudesAutorizadas(arr);
    localStorage.setItem("solicitudesAutorizadas", JSON.stringify(arr));
  };

  const obtenerDepartamentos = async () => {
    try {
      const response = await axios.get(
        "http://192.168.3.27:3007/api/muestras/departamentos"
      );
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };

  const handleMotivoChange = (event) => {
    setMotivo(event.target.value);
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (!user || !user.name || !departamento || !motivo) {
      setAlerta(true);
      setAlertaMessage("¡Por favor complete los campos obligatorios!");
      return;
    }

    const depPrefix = departamento.slice(0, 3).toUpperCase();
    let lastFolioNumber = localStorage.getItem("lastFolioNumber");
    if (!lastFolioNumber) {
      lastFolioNumber = 1;
      localStorage.setItem("lastFolioNumber", lastFolioNumber);
    }

    const folio = `${depPrefix}-${String(lastFolioNumber).padStart(3, "0")}`;

    const nuevaSolicitud = {
      folio,
      nombre: user.name,
      departamento,
      motivo,
      regresaArticulo,
      fecha: regresaArticulo ? fecha : null,
      requiereEnvio: regresaArticulo ? requiereEnvio : false,
      detalleEnvio: regresaArticulo && requiereEnvio ? detalleEnvio : "",
      carrito: [],
      autorizado: false,
      enviadoParaAutorizar: false, // Aquí aseguramos que no se mueva a "autorizar" aún
    };

    const updatedSolicitudes = [...solicitudes, nuevaSolicitud];
    guardarSolicitudes(updatedSolicitudes);

    localStorage.setItem("lastFolioNumber", parseInt(lastFolioNumber) + 1);

    setVista("carrito"); // Cambia a la vista de carrito, no a "Autorizar"
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
        `http://192.168.3.27:3007/api/muestras/producto/${codigo}`
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
    if (!producto || cantidad <= 0) {
      setAlerta(true);
      setAlertaMessage("Por favor ingrese una cantidad válida.");
      return;
    }

    const lastSolicitudIndex = solicitudes.length - 1;
    if (lastSolicitudIndex < 0) {
      setAlerta(true);
      setAlertaMessage("No hay ninguna solicitud para agregar productos.");
      return;
    }

    const currentSolicitud = solicitudes[lastSolicitudIndex];

    const item = {
      codigo: producto.code_prod,
      des: producto.des,
      cant_stock: producto.cant_stock,
      imagen: `../assets/image/img_pz/${producto.code_prod}.jpg`,
      cantidad,
      ubi: producto.ubi,
    };

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
    guardarSolicitudes(updatedSolicitudes);

    setCodigo(""); // Limpiar el código
    setCantidad(1);
    setProducto(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const autorizarSolicitud = (folio) => {
    const solicitudIndex = solicitudes.findIndex((s) => s.folio === folio);
    if (solicitudIndex === -1) return;

    const solicitud = { ...solicitudes[solicitudIndex], autorizado: true };

    // Mover a autorizadas
    const updatedSolicitudes = [...solicitudes];
    updatedSolicitudes.splice(solicitudIndex, 1);
    guardarSolicitudes(updatedSolicitudes);

    const updatedAutorizadas = [...solicitudesAutorizadas, solicitud];
    guardarAutorizadas(updatedAutorizadas);
  };

  const borrarSolicitud = (folio) => {
    const updatedSolicitudes = solicitudes.filter((s) => s.folio !== folio);
    guardarSolicitudes(updatedSolicitudes);
  };

  const borrarSolicitudAutorizada = (folio) => {
    const updatedAutorizadas = solicitudesAutorizadas.filter(
      (s) => s.folio !== folio
    );
    guardarAutorizadas(updatedAutorizadas);
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

  const enviarAAutorizar = () => {
    if (solicitudes.length === 0) {
      setAlerta(true);
      setAlertaMessage("No hay solicitudes para enviar a autorizar.");
      return;
    }

    // Filtramos para obtener la solicitud más reciente que no haya sido enviada a autorizar
    const lastSolicitudIndex = solicitudes.length - 1;
    const lastSolicitud = solicitudes[lastSolicitudIndex];

    // Solo cambiamos el estado a "enviadoParaAutorizar: true" si aún no se ha enviado
    if (!lastSolicitud.enviadoParaAutorizar) {
      lastSolicitud.enviadoParaAutorizar = true;

      // Actualizamos la lista de solicitudes
      const updatedSolicitudes = [
        ...solicitudes.slice(0, lastSolicitudIndex),
        lastSolicitud,
      ];
      guardarSolicitudes(updatedSolicitudes);
      // Cambiamos a la pestaña de "Autorizar"
      setCurrentTab(1); // Cambia a la pestaña "Autorizar"
    }
  };

  const removeProduct = (codigo) => {
    // Filtrar el producto a eliminar
    const productosActualizados = productosModal.filter(
      (item) => item.codigo !== codigo
    );
    setProductosModal(productosActualizados); // Actualizar los productos en el modal

    const lastSolicitudIndex = solicitudes.length - 1;
    const currentSolicitud = solicitudes[lastSolicitudIndex];

    // Actualizar el carrito con los productos restantes
    const updatedSolicitud = {
      ...currentSolicitud,
      carrito: productosActualizados,
    };
    const updatedSolicitudes = [
      ...solicitudes.slice(0, lastSolicitudIndex),
      updatedSolicitud,
    ];
    guardarSolicitudes(updatedSolicitudes);

    // También actualizamos el número de artículos en la solicitud
    const cantidadArticulos = productosActualizados.length;
    const updatedSolicitudWithCount = {
      ...updatedSolicitud,
      cantidadArticulos,
    };
    const updatedSolicitudesWithCount = [
      ...solicitudes.slice(0, lastSolicitudIndex),
      updatedSolicitudWithCount,
    ];
    guardarSolicitudes(updatedSolicitudesWithCount);
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
                              src={`../assets/image/img_pz/${producto.code_prod}.jpg`}
                              alt="Producto"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/50"; // Imagen por defecto si no se encuentra
                              }}
                            />
                          </TableCell>
                          <TableCell>{producto.code_prod}</TableCell>
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
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {solicitudes[solicitudes.length - 1].carrito.map(
                            (item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.codigo}</TableCell>
                                <TableCell>
                                  <img
                                    src={item.imagen}
                                    alt="Producto"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/50";
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{item.des}</TableCell>
                                <TableCell>{item.cantidad}</TableCell>
                              </TableRow>
                            )
                          )}
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
            {solicitudes.filter((s) => s.enviadoParaAutorizar).length === 0 && (
              <Typography>No hay solicitudes para autorizar.</Typography>
            )}
            {solicitudes.filter((s) => s.enviadoParaAutorizar).length > 0 && (
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
                      .filter((s) => s.enviadoParaAutorizar)
                      .map((sol) => (
                        <TableRow key={sol.folio}>
                          <TableCell>{sol.folio}</TableCell>
                          <TableCell>{sol.nombre}</TableCell>
                          <TableCell>{sol.departamento}</TableCell>
                          <TableCell>{sol.motivo}</TableCell>
                          <TableCell>{sol.fecha || "N/A"}</TableCell>
                          <TableCell>
                            {sol.requiereEnvio ? "Sí" : "No"}
                          </TableCell>
                          <TableCell>{sol.detalleEnvio || "N/A"}</TableCell>
                          <TableCell>{sol.carrito.length}</TableCell>
                          <TableCell>{sol.autorizado ? "Sí" : "No"}</TableCell>
                          <TableCell>
                            <Box
                              display="flex"
                              justifyContent="flex-start"
                              alignItems="center"
                            >
                              {!sol.autorizado && (
                                <IconButton
                                  onClick={() => autorizarSolicitud(sol.folio)}
                                  color="success"
                                  title="Autorizar"
                                  style={{ marginRight: "10px" }} // Espacio entre los botones
                                >
                                  <AddTaskIcon />
                                </IconButton>
                              )}
                              <IconButton
                                onClick={() => handleOpenModal(sol.carrito)} // Abre el modal con los productos de la solicitud
                                sx={{ color: "orange" }} // Color personalizable: naranja
                                title="Ver productos"
                                style={{ marginRight: "10px" }} // Espacio entre los botones
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => borrarSolicitud(sol.folio)}
                                color="error"
                                title="Borrar solicitud"
                              >
                                <DeleteIcon />
                              </IconButton>
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
                    <TableCell>{item.des}</TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removeProduct(item.codigo)} // Abre el modal con los productos de la solicitud
                        color="error"
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
                        <TableCell>{sol.fecha || "N/A"}</TableCell>
                        <TableCell>{sol.requiereEnvio ? "Sí" : "No"}</TableCell>
                        <TableCell>{sol.detalleEnvio || "N/A"}</TableCell>
                        <TableCell>{sol.carrito.length}</TableCell>
                        <TableCell>{sol.autorizado ? "Sí" : "No"}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => generarPDF(sol)}
                          >
                            Imprimir PDF
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => borrarSolicitudAutorizada(sol.folio)}
                          >
                            Borrar
                          </Button>
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
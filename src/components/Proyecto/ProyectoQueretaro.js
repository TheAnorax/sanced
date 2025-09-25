import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Box,
  TextField,
  TablePagination,
  Tabs,
  Tab,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { es } from "date-fns/locale"; // en v3 es "named export"

function ProyectoQueretaro() {
  const [posicion, setPosicion] = useState(null);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("queretaro");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [tabData, setTabData] = useState([]);
  const [selectedZona, setSelectedZona] = useState("");
  const [selectedRuta, setSelectedRuta] = useState("");
  const [diaVisita, setDiaVisita] = useState("");
  const [rutaReparto, setRutaReparto] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [currentView, setCurrentView] = useState("empty");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState([]);

  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [modalImagenAbierto, setModalImagenAbierto] = useState(false);

  const abrirImagen = (src) => {
    setImagenSeleccionada(src);
    setModalImagenAbierto(true);
  };

  const cerrarImagen = () => {
    setModalImagenAbierto(false);
    setImagenSeleccionada(null);
  };

  const [exhibitors, setExhibitors] = useState([]);

  useEffect(() => {
    const daysOfWeek = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];
    const today = new Date().getDay();
    setCurrentDay(daysOfWeek[today]);
  }, []);

  useEffect(() => {
    filterData();
  }, [selectedZona, selectedRuta, diaVisita]);

  useEffect(() => {
    if (!currentDay) return;

    const base = "http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro";
    const url = selectedRuta
      ? `${base}?dia_visita=${currentDay}&ruta=${selectedRuta}`
      : `${base}?dia_visita=${currentDay}`;

    axios
      .get(url)
      .then((response) => {
        const ordenados = response.data.sort(
          (a, b) => (a.orden_visita || 9999) - (b.orden_visita || 9999)
        );
        setData(ordenados);
        setFilteredData(ordenados);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [currentDay, selectedRuta]);

  const handleRutaRepartoChange = (event) => {
    setRutaReparto(event.target.value);
  };

  const filterData = () => {
    let filtered = data;

    if (currentDay) {
      filtered = filtered.filter((item) => item.dia_visita === currentDay);
    }

    if (selectedZona) {
      filtered = filtered.filter((item) => item.zona === selectedZona);
    }

    if (selectedRuta) {
      filtered = filtered.filter(
        (item) => parseInt(item.ruta, 10) === parseInt(selectedRuta, 10)
      );
    }

    if (diaVisita) {
      filtered = filtered.filter((item) => item.dia_visita === diaVisita);
    }

    if (rutaReparto) {
      filtered = filtered.filter(
        (item) => parseInt(item.ruta_reparto, 10) === parseInt(rutaReparto, 10)
      );
    }

    console.log("Datos Filtrados:", filtered);
    setFilteredData(filtered);
  };

  const handlePersonaChange = (event) => {
    setSelectedPersona(event.target.value);
    filterData();
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = data.filter((item) =>
      item.nombre.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 15));
    setPage(0);
  };

  const [productosComprados, setProductosComprados] = useState([]);

  const [loadingCompra, setLoadingCompra] = useState(false);

  const [segmento, setSegmento] = useState("");
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Función para obtener precios por segmento
  const fetchPrecios = async (segmentoReal) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://66.232.105.87:3007/api/Queretaro/precios_${segmentoReal.toLowerCase()}`
      );
      console.log("📦 Datos de precios recibidos:", res.data);
      setPrecios(res.data);
    } catch (error) {
      console.error(`❌ Error al cargar precios (${segmentoReal}):`, error);
      setPrecios([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Función principal al abrir modal
  const handleClickOpen = (project) => {
    console.log("Proyecto seleccionado:", project);
    setSelectedProject(project);
    setOpen(true);
    setLoadingCompra(true);

    // Normalizar campos
    const giro = project.giro?.trim() || "";
    const portafolio = project.portafolio?.trim() || "";
    const segmentoReal = project.segmento?.trim().toLowerCase() || "";
    const exhibidores = project.exhibidores || [];

    setSegmento(segmentoReal); // 🔄 Para que quede reflejado también en el estado
    setExhibitors(exhibidores);

    // ⚡ Llamar precios con el segmento real
    if (segmentoReal) {
      fetchPrecios(segmentoReal); // ✅ Llama directo desde aquí
    }

    // Codificar para categoría
    const encodedGiro = encodeURIComponent(giro);
    const encodedPortafolio = encodeURIComponent(portafolio);
    const encodedSegmento = encodeURIComponent(segmentoReal);

    const promProductosComprados = axios
      .get("http://66.232.105.79:9100/hdia")
      .then((response) => {
        if (response.data && Array.isArray(response.data.lista)) {
          const productosCliente = response.data.lista.filter(
            (p) =>
              String(p.cliente).trim() === String(project.Num_Cliente).trim()
          );
          setProductosComprados(productosCliente);
        } else {
          setProductosComprados([]);
        }
      })
      .catch((err) => {
        console.error("❌ Error al obtener productos comprados:", err);
        setProductosComprados([]);
      });

    const promDatosCategoria = axios
      .get(
        `http://66.232.105.87:3007/api/Queretaro/category/${encodedGiro}/${encodedPortafolio}/${encodedSegmento}`
      )
      .then((response) => {
        if (response.data.data && response.data.data.length > 0) {
          setTabData(response.data.data);
        } else {
          setTabData([]);
        }
      })
      .catch((error) => {
        console.error("❌ Error al obtener datos filtrados:", error);
        setTabData([]);
      });

    Promise.all([promProductosComprados, promDatosCategoria]).then(() => {
      setLoadingCompra(false);
    });
  };

  const fueComprado = (codigoUI) => {
    const normalizar = (val) => parseInt(String(val).trim(), 10); // ✅ Conversión fuerte a número

    const codUI = normalizar(codigoUI);

    const match = productosComprados.some((prod) => {
      const codProd = normalizar(prod.codigo);
      const isMatch = codProd === codUI;

      if (isMatch) {
        console.log("✔ MATCH:", codUI, "⇨", codProd);
      } else {
        console.log("✘ NO MATCH:", codUI, "⇨", codProd);
      }

      return isMatch;
    });

    return match;
  };

  const handleZoneChange = (event) => {
    const zone = event.target.value;
    setSelectedZone(zone);

    // Filtrar los proyectos según la zona seleccionada
    axios
      .get(`http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro?zona=${zone}`)
      .then((response) => {
        setFilteredData(response.data);
        setPage(0); // Reset the page when changing the filter
      })
      .catch((error) => {
        console.error(
          "Error al obtener los proyectos filtrados por zona:",
          error
        );
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);

    if (newValue === 1 && selectedProject) {
      const table = selectedProject.giro;
    }
  };

  useEffect(() => {
    const daysOfWeek = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];
    const today = new Date().getDay();
    console.log("Día actual:", daysOfWeek[today]);
    setCurrentDay(daysOfWeek[today]);
  }, []);

  useEffect(() => {
    filterData();
  }, [currentDay]);

  const handleZonaChange = (event) => {
    setSelectedZona(event.target.value);
  };

  const handleRutaChange = (event) => {
    setSelectedRuta(event.target.value);
  };

  const handleDiaVisitaChange = (event) => {
    setDiaVisita(event.target.value);
  };

  useEffect(() => {
    filterData();
  }, [selectedZona, selectedRuta, diaVisita]);

  const handleRoutesChange = (event) => {
    const value = event.target.value;
    const routes = value.split(",").map((route) => route.trim());
    setSelectedRoutes(routes);
  };

  const enviarOrdenAlServidor = async (nuevoOrdenIds) => {
    try {
      await axios.post(
        "http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro/ordenar",
        {
          orden: nuevoOrdenIds,
        }
      );
      alert("Orden guardado correctamente");
    } catch (error) {
      console.error("Error al guardar el orden:", error);
    }
  };

  const renderVistaPrincipal = () => (
    <>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        {/* Filtro por Zona */}
        {/* <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ maxWidth: '300px' }}>
                        <InputLabel id="zona-label">Zona</InputLabel>
                        <Select
                            labelId="zona-label"
                            value={selectedZona}
                            onChange={handleZonaChange}
                            label="Zona"
                        >
                            <MenuItem value="">Todas las zonas</MenuItem>
                            <MenuItem value="Zona 1">Zona 1</MenuItem>
                            <MenuItem value="Zona 2">Zona 2</MenuItem>
                            <MenuItem value="Zona 3">Zona 3</MenuItem>
                        </Select>
                    </FormControl>
                </Grid> */}

        {/* Filtro por Ruta */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ maxWidth: "300px" }}>
            <InputLabel id="ruta-label">Ruta</InputLabel>
            <Select
              labelId="ruta-label"
              value={selectedRuta}
              label="Ruta"
              onChange={(e) => setSelectedRuta(e.target.value)} // <--- habilitar cambio
            >
              <MenuItem value="">Todas</MenuItem> {/* <--- importante */}
              <MenuItem value="1">Ruta 1</MenuItem>
              <MenuItem value="2">Ruta 2</MenuItem>
              <MenuItem value="3">Ruta 3</MenuItem>
              <MenuItem value="4">Ruta 4</MenuItem>
              <MenuItem value="5">Ruta 5</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <br />

      <Grid container spacing={2} justifyContent="center">
        {filteredData
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "16px",
                }}
                onClick={() => handleClickOpen(row)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {/* Columna 1: Imagen */}
                  <CardMedia
                    component="img"
                    height="120"
                    image={row.foto}
                    alt={row.nombre}
                    onClick={(e) => {
                      e.stopPropagation(); // 👈 Detiene el evento para que no llegue al Card
                      abrirImagen(row.foto); // Abre el modal de la imagen
                    }}
                    sx={{
                      objectFit: "cover",
                      width: "120px",
                      height: "120px",
                      marginRight: "16px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                        transform: "scale(1.03)",
                      },
                    }}
                  />

                  {/* Columna 2: Información */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {row.nombre}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {row.zona}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Segmento: {row.segmento}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Día de Visita: {row.dia_visita}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Ruta: {row.ruta}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        Status:
                      </Typography>
                      <FiberManualRecordIcon
                        sx={{
                          fontSize: 14,
                          color:
                            row.status === "ACTIVO"
                              ? "green"
                              : row.status === "PROSPECTO"
                              ? "orange"
                              : "gray",
                          mr: 0.5,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {row.status}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 18, 20, 30]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* aqui inicia las tablas y los modal */}
      {selectedProject && (
        <Dialog
          open={open}
          onClose={handleClose}
          BackdropProps={{ style: { backgroundColor: "rgba(0, 0, 0, 0.6)" } }} // Este estilo puede bloquear la interacción, intenta comentarlo.
          sx={{
            "& .MuiDialog-paper": {
              maxWidth: "90vw", // Establecer el ancho máximo a un porcentaje del ancho de la ventana
              width: "90vw", // Puedes cambiar este valor según tus necesidades
            },
          }}
        >
          <DialogTitle>
            {selectedProject ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {selectedProject.nombre}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  /
                </Typography>

                <FiberManualRecordIcon
                  sx={{
                    fontSize: 16,
                    color:
                      selectedProject.status === "ACTIVO"
                        ? "green"
                        : selectedProject.status === "PROSPECTO"
                        ? "orange"
                        : "gray",
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedProject.status}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  /
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedProject.Num_cliente}
                </Typography>
              </Box>
            ) : (
              "Cargando..."
            )}
          </DialogTitle>

          <DialogContent>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              aria-label="Información del Proyecto"
            >
              <Tab label="Información General" />
              <Tab label="Datos de Compra" />
              <Tab label="Marketing" />
              <Tab label="Promociones" />
            </Tabs>

            {tabIndex === 0 && (
              <Box sx={{ paddingTop: 2 }}>
                <Grid container spacing={2}>
                  {/* Fila 1 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nombre Encargado"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.nombre_encargado}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Teléfono"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.num_telf}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {/* Fila 2 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Correo"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.correo}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Calle Principal"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.calle_principal}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {/* Fila 3 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Num Ext"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.num_ext}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ruta"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.ruta}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Latitud"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.lat}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {/* Fila 4 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Longitud"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.long}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ marginTop: 2 }}>
                      <a
                        href={`https://www.google.com/maps?q=${selectedProject.lat},${selectedProject.long}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconButton sx={{ color: "red" }}>
                          <LocationOnIcon />
                        </IconButton>{" "}
                        Ver en el mapa
                      </a>
                    </Typography>
                  </Grid>
                  {/* Fila 5 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Zona"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.zona}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Giro"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.giro}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {/* Fila 6 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Portafolio"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.portafolio}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Segmento"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.segmento}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dia Visita"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.dia_visita}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dia Reparto"
                      variant="outlined"
                      fullWidth
                      value={selectedProject.dia_reparto}
                      sx={{ marginBottom: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box sx={{ paddingTop: 2 }}>
                {tabData.length > 0 ? (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: "10px 8px",
                      marginTop: "16px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Código
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Descripción
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Precio
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Inner
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Master
                        </th>
                        <th>Precio AK</th>
                        <th>AK vs ST</th>
                        <th>Precio TP</th>
                        <th>TR vs ST</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tabData.map((item, index) => {
                        const comprado = fueComprado(item.Codigo);

                        // 🔎 Buscar los precios por código
                        const precioMatch = precios.find(
                          (p) => Number(p.Codigo) === Number(item.Codigo)
                        );

                        return (
                          <tr
                            key={index}
                            style={{
                              borderBottom: "1px solid #ddd",
                              backgroundColor: comprado
                                ? "#d4edda"
                                : "transparent",
                            }}
                          >
                            <td style={{ padding: "8px" }}>
                              {item.Codigo}{" "}
                              {comprado && (
                                <span style={{ color: "green" }}>✔</span>
                              )}
                            </td>
                            <td style={{ padding: "8px" }}>
                              {item.Descripcion}
                            </td>
                            <td style={{ padding: "8px" }}>{item.Precio}</td>
                            <td style={{ padding: "8px" }}>{item.Inner}</td>
                            <td style={{ padding: "8px" }}>{item.Master}</td>
                            <td style={{ padding: "8px" }}>
                              {precioMatch ? `$${precioMatch.PrecioAksi}` : ""}
                            </td>
                            <td style={{ padding: "8px" }}>
                              {precioMatch ? precioMatch.AKvsST : ""}
                            </td>
                            <td style={{ padding: "8px" }}>
                              {precioMatch
                                ? `$${precioMatch.PrecioTruper}`
                                : ""}
                            </td>
                            <td style={{ padding: "8px" }}>
                              {precioMatch ? precioMatch.TrvsST : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <Typography variant="body1">
                    No hay datos disponibles
                  </Typography>
                )}
              </Box>
            )}

            {tabIndex === 2 && (
              <Box sx={{ paddingTop: 2 }}>
                {exhibitors.length > 0 ? (
                  <Grid container spacing={2}>
                    {exhibitors.map((exhibitor) => (
                      <Grid item xs={12} sm={6} md={4} key={exhibitor.id}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={exhibitor.imagen}
                            alt={
                              exhibitor.descripcion || "Imagen no disponible"
                            }
                            onError={(e) =>
                              (e.target.src = "/imagenes/default.png")
                            }
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que se dispare algún evento del Card si existiera
                              abrirImagen(exhibitor.imagen);
                            }}
                            sx={{
                              cursor: "pointer",
                              borderRadius: "4px",
                              objectFit: "cover",
                              transition: "0.3s",
                              "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                              },
                            }}
                          />

                          <CardContent>
                            <Typography variant="h6">
                              {exhibitor.descripcion}
                            </Typography>
                            <Typography variant="body2">
                              Medidas: {exhibitor.medidas}
                            </Typography>
                            <Typography variant="body2">
                              Material: {exhibitor.material}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1">
                    No hay exhibidores disponibles.
                  </Typography>
                )}
              </Box>
            )}

            {tabIndex === 3 && (
              <Box sx={{ paddingTop: 2 }}>
                <p>Productos nuevos</p>
              </Box>
            )}

            {tabIndex === 4 && (
              <Box sx={{ paddingTop: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ordena los lugares de visita para el día siguiente (
                  {currentDay})
                </Typography>

                <DragDropContext
                  onDragEnd={(result) => {
                    const { source, destination } = result;
                    if (!destination) return;

                    const reordered = Array.from(ordenData);
                    const [removed] = reordered.splice(source.index, 1);
                    reordered.splice(destination.index, 0, removed);
                    setOrdenData(reordered);
                  }}
                >
                  <Droppable droppableId="ordenVisita">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {ordenData.map((item, index) => (
                          <Draggable
                            key={item.id.toString()}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  border: "1px solid #ccc",
                                  marginBottom: 2,
                                  backgroundColor: "#fff",
                                  borderRadius: 1,
                                  userSelect: "none", // 🔒 Evita selección
                                  cursor: "grab", // 👆 Muestra manita
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "40px",
                                    height: "100%",
                                    backgroundColor: "#e0e0e0",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRight: "1px solid #ccc",
                                    userSelect: "none",
                                    cursor: "grab",
                                  }}
                                >
                                  <Typography variant="h6">≡</Typography>
                                </Box>

                                <CardMedia
                                  component="img"
                                  height="120"
                                  image={item.foto}
                                  alt={item.nombre}
                                  sx={{
                                    objectFit: "cover",
                                    width: "120px",
                                    height: "120px",
                                    marginLeft: "16px",
                                    borderRadius: "4px",
                                    userSelect: "none",
                                  }}
                                />

                                <CardContent
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    ml: 2,
                                  }}
                                >
                                  <Typography variant="h6">
                                    #{index + 1} - {item.nombre}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {item.zona}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Segmento: {item.segmento}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Día de Visita: {item.dia_visita}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Ruta: {item.ruta}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mr: 1 }}
                                    >
                                      Status:
                                    </Typography>
                                    <FiberManualRecordIcon
                                      sx={{
                                        fontSize: 14,
                                        color:
                                          item.status === "ACTIVO"
                                            ? "green"
                                            : item.status === "PROSPECTO"
                                            ? "orange"
                                            : "gray",
                                        mr: 0.5,
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {item.status}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                  onClick={() => {
                    const ordenIds = ordenData.map((item) => item.id);
                    enviarOrdenAlServidor(ordenIds);
                  }}
                >
                  Guardar orden
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );

  const renderTable = () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Zona</TableCell>
          <TableCell>Ruta</TableCell>
          <TableCell>Día de Visita</TableCell>
          <TableCell>Segmento</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.nombre}</TableCell>
            <TableCell>{row.zona}</TableCell>
            <TableCell>{row.ruta}</TableCell>
            <TableCell>{row.segmento}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Mapeo de la informacion

  const convertToEmbedUrl = (url) => {
    if (!url.includes("viewer")) return url; // Si ya es embed, no cambiarlo
    return url.replace("/viewer?", "/embed?");
  };

  const mainMap =
    "https://www.google.com/maps/d/embed?mid=16AT0b4cYTSNQQVQYHkQKC8Rp4Q1g2VE&ll=20.561320310882667,-100.38615969894488&z=15";

  const otherMaps = [
    convertToEmbedUrl(
      "https://www.google.com/maps/d/u/0/viewer?mid=1ih6-YP-d1yE3ZviYr5z-ddiPhdwfVCI&femb=1&ll=20.563953977471986%2C-100.39009649543087&z=13"
    ),
    convertToEmbedUrl(
      "https://www.google.com/maps/d/u/0/viewer?mid=1VSCN-JF-whrAHR5twiO6CRrPfxOAXu8&femb=1&ll=20.640139755227455%2C-100.42183552642823&z=12"
    ),
    convertToEmbedUrl(
      "https://www.google.com/maps/d/u/0/viewer?mid=1KXHSTDk2Cp0AjYSE_y3mXsO9s9XfAGs&femb=1&ll=20.636652202622624%2C-100.44765901324463&z=13"
    ),
    convertToEmbedUrl(
      "https://www.google.com/maps/d/u/0/viewer?mid=15d-dWNOfWPMZnm85WI0hYTaqUvNB3Yg&ll=20.64328286231578%2C-100.39405011241543&z=13"
    ),
    convertToEmbedUrl(
      "https://www.google.com/maps/d/u/0/viewer?mid=16Mxu_WIDcLeIdh3TpdM42BfPEZTS49A&ll=20.562950614267464%2C-100.39048423373035&z=14"
    ),
  ];

  const imagePaths = [
    "/Rutas/Ruta1.jpeg",
    "/Rutas/Ruta2.jpeg",
    "/Rutas/Ruta3.jpeg",
    "/Rutas/Ruta4.jpeg",
    "/Rutas/Ruta5.jpeg",
  ];

  const MapaRutas = () => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedMap, setSelectedMap] = useState("");

    // Función para abrir el modal con la imagen y el mapa seleccionados
    const handleOpenModal = (image, map) => {
      setSelectedImage(image);
      setSelectedMap(map);
      setOpenModal(true);
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
      setOpenModal(false);
    };

    return (
      <Box sx={{ p: 3 }}>
        {/* Mapa principal arriba */}
        <Box sx={{ mb: 3 }}>
          <iframe
            src={mainMap}
            width="100%"
            height="600px"
            title="Mapa Principal"
            style={{ border: "none" }}
            allowFullScreen
          />
        </Box>

        {/* Otros mapas con sus imágenes */}
        <Grid container spacing={2} justifyContent="center">
          {otherMaps.map((link, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{ maxWidth: "100%", cursor: "pointer" }}
                onClick={() => handleOpenModal(imagePaths[index], link)}
              >
                {/* Imagen asociada al mapa */}
                <CardMedia
                  component="img"
                  sx={{
                    width: "100%",
                    height: 180,
                    objectFit: "contain",
                  }}
                  image={imagePaths[index]}
                  alt={`Ruta ${index + 1}`}
                  onError={(e) => (e.target.style.display = "none")}
                />
                {/* Mapa en iframe */}
                <iframe
                  src={link}
                  width="100%"
                  height="300px"
                  title={`Mapa ${index + 2}`}
                  style={{ border: "none" }}
                  allowFullScreen
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Modal para mostrar la imagen y el mapa en grande */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              p: 3,
              borderRadius: 2,
              boxShadow: 24,
              width: "80vw",
              height: "80vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Botón de cierre */}
            <IconButton
              onClick={handleCloseModal}
              sx={{ alignSelf: "flex-end" }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Vista Ampliada
            </Typography>

            {/* Imagen ampliada con mayor tamaño */}
            <CardMedia
              component="img"
              sx={{
                width: "100%", // Ocupa el ancho completo del modal
                maxWidth: "95vw", // Máximo 80% del viewport width
                height: "auto",
                maxHeight: "95vh", // Máximo 80% del viewport height
                objectFit: "contain",
                marginBottom: 2,
              }}
              image={selectedImage}
              alt="Imagen ampliada"
            />

            {/* Mapa ampliado */}
            <iframe
              src={selectedMap}
              width="100%"
              height="400px"
              title="Mapa ampliado"
              style={{ border: "none" }}
              allowFullScreen
            />
          </Box>
        </Modal>
      </Box>
    );
  };

  const transformImageUrl = (url) => {
    if (!url || typeof url !== "string") {
      return "https://via.placeholder.com/140"; // Imagen de respaldo si la URL es inválida
    }

    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/id=([-\w]+)/);
      return fileIdMatch
        ? `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`
        : url;
    }

    return url;
  };

  //Menu de los de queretaro

  const renderView = () => {
    if (ciudadSeleccionada === "queretaro") {
      return (
        <>
          {!selectedRuta ? (
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="ruta-select-label">
                    Selecciona una Ruta
                  </InputLabel>
                  <Select
                    labelId="ruta-label"
                    value={selectedRuta}
                    label="Ruta"
                    onChange={(e) => setSelectedRuta(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="1">Ruta 1</MenuItem>
                    <MenuItem value="2">Ruta 2</MenuItem>
                    <MenuItem value="3">Ruta 3</MenuItem>
                    <MenuItem value="4">Ruta 4</MenuItem>
                    <MenuItem value="5">Ruta 5</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <>
              <Grid
                container
                spacing={2}
                justifyContent="center"
                sx={{ mb: 3 }}
              >
                <Button onClick={() => setCurrentView("view1")}>Mapa</Button>
                <Button onClick={() => setCurrentView("default")}>
                  Lugares de visita
                </Button>
                <Button onClick={() => setCurrentView("orden")}>
                  Orden de Visita
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSelectedRuta("");
                    setFilteredData([]);
                    setData([]);
                  }}
                >
                  Cambiar Ruta
                </Button>
              </Grid>

              {currentView === "default" && renderVistaPrincipal()}
              {currentView === "view1" && <MapaRutas />}
              {currentView === "orden" && renderOrdenVisita()}
              {currentView === "visita" && renderVisita()}
            </>
          )}
        </>
      );
    }

    if (ciudadSeleccionada === "guadalajara") {
      return (
        <>
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            <Button onClick={() => setCurrentView("view1")}>Mapa</Button>
            <Button onClick={() => setCurrentView("default")}>
              Lugares de visita
            </Button>
          </Grid>
          {currentView === "default" && (
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Lugares de Visita en Guadalajara
            </Typography>
          )}
          {currentView === "view1" && <MapaGuadalajara />}
        </>
      );
    }
  };

  //Menu de guadalajara

  const mainMapGuadalajara =
    "https://www.google.com/maps/d/embed?mid=12F4jYMqNRKzfA-yKLT103arH_z6-O20&usp=sharing";

  const guadalajaraMaps = [
    "https://www.google.com/maps/d/embed?mid=1Kquz4EpHe4OC8iIHDr4OGORC1mCgfas&usp=sharing",
    "https://www.google.com/maps/d/embed?mid=18tM2i6o7VGZxaKbY4OovV7Goo2NT6ew&usp=sharing",
    "https://www.google.com/maps/d/embed?mid=1FbRzanZ4v40HgMhTIWR9YPkL2Yapzis&usp=sharing",
    "https://www.google.com/maps/d/embed?mid=1zZGg93zlxhcz1wYZQCP-k1vLlxTlqYw&usp=sharing",
    "https://www.google.com/maps/d/embed?mid=1BrkCdcLCVZF9joPSaclV8TSHSEwekyM&usp=sharing",
    "https://www.google.com/maps/d/embed?mid=12F4jYMqNRKzfA-yKLT103arH_z6-O20&usp=sharing",
  ];

  const MapaGuadalajara = () => (
    <Box sx={{ p: 3 }}>
      {/* Mapa principal */}
      <iframe
        src={mainMapGuadalajara}
        width="100%"
        height="600px"
        title="Mapa Guadalajara"
        style={{ border: "none", marginBottom: "20px" }}
        allowFullScreen
      />
      {/* Mapas adicionales */}
      <Grid container spacing={2} justifyContent="center">
        {guadalajaraMaps.map((map, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ maxWidth: "100%", mb: 2 }}>
              <iframe
                src={map}
                width="100%"
                height="300px"
                title={`Mapa Adicional ${index + 1}`}
                style={{ border: "none" }}
                allowFullScreen
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  //ordenar el siguiente dia

  const [ordenData, setOrdenData] = useState([]);

  useEffect(() => {
    const getTomorrowName = () => {
      const days = [
        "DOMINGO",
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SÁBADO",
      ];
      const tomorrowIndex = (new Date().getDay() + 1) % 7;
      return days[tomorrowIndex];
    };

    const diaManana = getTomorrowName();

    if (selectedRuta) {
      axios
        .get(
          `http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro?dia_visita=${diaManana}&ruta=${selectedRuta}`
        )
        .then((response) => {
          const ordenados = response.data.sort(
            (a, b) => (a.orden_visita || 9999) - (b.orden_visita || 9999)
          );
          setOrdenData(ordenados); // <- aquí llenas el ordenData correctamente
        })
        .catch((error) => {
          console.error("Error al obtener datos del día siguiente:", error);
        });
    }
  }, [selectedRuta]);

  const renderOrdenVisita = () => {
    const getTomorrowName = () => {
      const days = [
        "DOMINGO",
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SÁBADO",
      ];
      const tomorrowIndex = (new Date().getDay() + 1) % 7;
      return days[tomorrowIndex];
    };

    const diaManana = getTomorrowName();

    const moverElemento = (index, direccion) => {
      const nuevoOrden = [...ordenData];
      const nuevoIndex = index + direccion;
      if (nuevoIndex < 0 || nuevoIndex >= ordenData.length) return;
      const temp = nuevoOrden[index];
      nuevoOrden[index] = nuevoOrden[nuevoIndex];
      nuevoOrden[nuevoIndex] = temp;
      setOrdenData(nuevoOrden);
    };

    if (!ordenData || ordenData.length === 0) {
      return (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            No hay lugares registrados para el día siguiente ({diaManana}).
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ordena los lugares de visita para el día siguiente ({diaManana})
        </Typography>

        {ordenData.map((item, index) => (
          <Card
            key={item.id}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              border: "1px solid #ccc",
              marginBottom: 2,
              backgroundColor: "#fff",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRight: "1px solid #ccc",
                padding: 1,
              }}
            >
              <IconButton onClick={() => moverElemento(index, -1)}>
                <ArrowUpwardIcon />
              </IconButton>
              <IconButton onClick={() => moverElemento(index, 1)}>
                <ArrowDownwardIcon />
              </IconButton>
            </Box>

            <CardMedia
              component="img"
              height="120"
              image={item.foto}
              alt={item.nombre}
              sx={{
                objectFit: "cover",
                width: "120px",
                height: "120px",
                marginLeft: "16px",
                borderRadius: "4px",
              }}
            />

            <CardContent
              sx={{ display: "flex", flexDirection: "column", ml: 2 }}
            >
              <Typography variant="h6">
                #{index + 1} - {item.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.zona}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Segmento: {item.segmento}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Día de Visita: {item.dia_visita}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ruta: {item.ruta}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  Status:
                </Typography>
                <FiberManualRecordIcon
                  sx={{
                    fontSize: 14,
                    color:
                      item.status === "ACTIVO"
                        ? "green"
                        : item.status === "PROSPECTO"
                        ? "orange"
                        : "gray",
                    mr: 0.5,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.status}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={() => {
            const ordenIds = ordenData.map((item) => item.id);
            enviarOrdenAlServidor(ordenIds);
          }}
        >
          Guardar orden
        </Button>
      </Box>
    );
  };

  useEffect(() => {
    // Si viene ?visita=queretaro|guadalajara, abre esa vista directo
    const params = new URLSearchParams(window.location.search);
    const visita = (params.get("visita") || "").toLowerCase();

    if (visita === "queretaro" || visita === "guadalajara") {
      setCiudadSeleccionada(visita);
      // elige qué quieres mostrar al abrir la pestaña:
      setCurrentView("default"); // "default" (lugares), "view1" (mapa) o "orden"
    }
  }, []);

  const abrirVisitaEnNuevaPestana = (ciudad) => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = `${base}?visita=${encodeURIComponent(ciudad)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 1) Ten tu lista de asesores (puede venir de tu API)

  const asesores = [
    { clave: 128268, nom: "Solis Rodriguez Martha Elena" },
    { clave: 124095, nom: "EVANGELINA BARRERA AVILA" },
    { clave: 124837, nom: "VALERIA RODRIGUEZ CABRERA" },
  ];

  const asesoresMap = React.useMemo(() => {
    const m = new Map();
    asesores.forEach((a) => m.set(Number(a.clave), a.nom));
    return m;
  }, []);

  const numVentas = React.useMemo(
    () => Number(filteredData?.[0]?.num_ventas ?? NaN),
    [filteredData]
  );
  const nombreAsesor = asesoresMap.get(numVentas) || "-";
  const [fechaPos, setFechaPos] = React.useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [posicionesDia, setPosicionesDia] = useState([]); // <-- NUEVO

  const pickUltimaPos = (payload) => {
    const arr =
      payload?.posiciones || payload?.data?.posiciones || payload?.data || [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return [...arr].sort((a, b) => new Date(a.fec) - new Date(b.fec)).at(-1);
  };

  const fetchPosicionesDelDia = async (clave, fechaISO) => {
    try {
      const res = await axios.post(
        "http://66.232.105.79:9100/agente_posicion",
        { clave, fecha: fechaISO }
      );
      const arr = res?.data?.posiciones ?? [];
      return arr.sort((a, b) => new Date(a.fec) - new Date(b.fec));
    } catch (e) {
      console.error("agente_posicion error:", e);
      return [];
    }
  };

  // (opcional) fallback si no hay datos en ese día
  const fetchPosicionConFallback = async (clave, fechaBase, rangoDias = 7) => {
    for (let i = 0; i <= rangoDias; i++) {
      const d = new Date(fechaBase);
      d.setDate(d.getDate() - i);
      const fechaISO = d.toISOString().split("T")[0];
      const arr = await fetchPosicionesDelDia(clave, fechaISO);
      if (arr.length) return { arr, fechaISO };
    }
    return { arr: [], fechaISO: null };
  };

  useEffect(() => {
    const run = async () => {
      if (!Number.isFinite(numVentas) || !selectedDate) {
        setPosicionesDia([]);
        setPosicion(null);
        setFechaPos(null);
        return;
      }
      const fechaISO = new Date(selectedDate).toISOString().split("T")[0];
      // si NO quieres fallback, usa directamente fetchPosicionesDelDia
      const { arr } = await fetchPosicionConFallback(
        numVentas,
        selectedDate,
        7
      );
      setPosicionesDia(arr); // <-- todas las posiciones
      const last = arr.at(-1) || null; // última para el banner
      setPosicion(last);
      setFechaPos(last?.fec || null);
    };
    run();
  }, [numVentas, selectedDate]);

  const clientesVisitados = React.useMemo(() => {
    return new Set(posicionesDia.map((p) => String(p.clie).trim()));
  }, [posicionesDia]);

  // (fuera de renderVisita)
  const matches = filteredData.filter((r) => {
    const idFila = getClienteIdFromRow(r); // <-- se usa aquí...
    return idFila && clientesVisitados.has(idFila);
  });

  // 1) Mapa: clie -> última posición de ese día
  const posMap = React.useMemo(() => {
    const m = new Map();
    posicionesDia.forEach((p) => {
      const key = String(p.clie).trim();
      // si hay varias, nos quedamos con la última (ya viene ordenado; si no, compara fechas)
      m.set(key, p);
    });
    return m;
  }, [posicionesDia]);

  // 2) Función que saca el id de cliente de una fila
  function getClienteIdFromRow(r) {
    const cand = [
      r["FISCAL_RELACIONADO_(CAMPO 2)"],
      r["FISCAL_RELACIONADO_(CAMPO_2)"],
      r.FISCAL_RELACIONADO_CAMPO_2,
      r.fiscal_relacionado,
      r.fiscal_relacionado_campo2,
      r.clie,
      r.Num_cliente,
      r.Num_Cliente,
      r.num_cliente,
      r.num_Cliente,
    ].find((v) => v !== undefined && v !== null);
    return cand == null ? null : String(cand).trim();
  }

  const dayName = (d) => {
    const days = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];
    return days[d.getDay()];
  };

  useEffect(() => {
    setCurrentDay(dayName(selectedDate));
  }, [selectedDate]);

  const renderVisita = () => {
    const clieFromPos =
      posicion?.clie != null ? String(posicion.clie).trim() : null;

    const matches = clieFromPos
      ? filteredData.filter((r) => {
          const idFila = getClienteIdFromRow(r);
          return idFila && idFila === clieFromPos;
        })
      : [];

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Visita – Resumen de Clientes (Querétaro)
          <br />
          Asesor De Ventas: {Number.isNaN(numVentas) ? "-" : numVentas} –{" "}
          {nombreAsesor}
          {fechaPos && (
            <span style={{ fontWeight: 400 }}>
              {"  "}• Última posición: {new Date(fechaPos).toLocaleString()}
            </span>
          )}
        </Typography>

        <br></br>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Selecciona día"
              value={selectedDate}
              onChange={(newValue) => {
                if (newValue) setSelectedDate(newValue);
              }}
              slotProps={{
                textField: { size: "small", sx: { minWidth: 220 } },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Banner con última posición */}
        {posicion && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              backgroundColor: "#f7f7f7",
              fontSize: 14,
            }}
          >
            <strong>Última posición del asesor:</strong>{" "}
            {new Date(posicion.fec).toLocaleString()} &nbsp;|&nbsp;
            <strong>lat:</strong> {posicion.lat} &nbsp;|&nbsp;{" "}
            <strong>lon:</strong> {posicion.lon}
            {Boolean(posicionesDia.length) && (
              <>
                {" "}
                &nbsp;|&nbsp; <strong>paradas:</strong> {posicionesDia.length}
              </>
            )}
          </Box>
        )}

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total lugares
                </Typography>
                <Typography variant="h5">{filteredData.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Activos
                </Typography>
                <Typography variant="h5">
                  {filteredData.filter((x) => x.status === "ACTIVO").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Prospectos
                </Typography>
                <Typography variant="h5">
                  {filteredData.filter((x) => x.status === "PROSPECTO").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Ruta seleccionada
                </Typography>
                <Typography variant="h5">{selectedRuta || "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Num Cliente</TableCell>
              <TableCell>Total de Venta</TableCell>
              <TableCell>Portafolio</TableCell>
              <TableCell>Dia de Visita</TableCell>
              <TableCell>lat</TableCell>
              <TableCell>long</TableCell>
              <TableCell>Fecha y Hora de visita</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.map((row, idx) => {
              const idFila = getClienteIdFromRow(row);

              // ← AQUÍ SÍ definimos pos usando el mapa de posiciones del día
              const pos = idFila ? posMap.get(idFila) : null;

              const isVisited = Boolean(pos); // hay posición para este cliente hoy
              const fechaBonita = pos?.fec
                ? new Date(pos.fec.replace(" ", "T")).toLocaleString()
                : "";

              return (
                <TableRow
                  key={row.id || idx}
                  hover
                  sx={
                    isVisited
                      ? {
                          backgroundColor: "#C8F7C5",
                          "& td": { color: "#1B5E20", fontWeight: 700 },
                          borderLeft: "4px solid #2e7d32",
                        }
                      : {
                          backgroundColor: "#fdecea",
                          "& td": { color: "#b71c1c", fontWeight: 700 },
                          borderLeft: "4px solid #c62828",
                        }
                  }
                >
                  <TableCell>{idx + 1}</TableCell>

                  <TableCell>
                    {row.nombre}
                    <span style={{ marginLeft: 8, fontSize: 12 }}>
                      {isVisited ? "● Visitado" : "● No visitado"}
                    </span>
                  </TableCell>

                  <TableCell>{idFila || ""}</TableCell>
                  <TableCell>{/* Total de Venta si lo tienes */}</TableCell>
                  <TableCell>{/* Portafolio si lo tienes */}</TableCell>
                  <TableCell>{row.dia_visita}</TableCell>

                  {/* lat/lon de la posición del día (si no hay, vacío) */}
                  <TableCell>{pos?.lat ?? ""}</TableCell>
                  <TableCell>{pos?.lon ?? ""}</TableCell>

                  {/* fecha/hora de la visita (si no hay, vacío) */}
                  <TableCell>{fechaBonita}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    );
  };

  useEffect(() => {
    const getTomorrowName = () => {
      const days = [
        "DOMINGO",
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SÁBADO",
      ];
      const tomorrowIndex = (new Date().getDay() + 1) % 7;
      return days[tomorrowIndex];
    };

    const diaManana = getTomorrowName();

    const base = "http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro";
    const url = selectedRuta
      ? `${base}?dia_visita=${diaManana}&ruta=${selectedRuta}` // solo esa ruta
      : `${base}?dia_visita=${diaManana}`; // TODAS las rutas

    axios
      .get(url)
      .then((response) => {
        const ordenados = response.data.sort(
          (a, b) => (a.orden_visita || 9999) - (b.orden_visita || 9999)
        );
        setOrdenData(ordenados);
      })
      .catch((error) => {
        console.error("Error al obtener datos del día siguiente:", error);
      });
  }, [selectedRuta]); // si quieres que también se recalcule al cambiar la fecha de hoy, agrega esa dep.

  return (
    <>
      {/* Botones para cambiar la ciudad */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        <Button
          onClick={() => setCiudadSeleccionada("guadalajara")}
          sx={{ color: "red" }}
        >
          Ver Guadalajara
        </Button>

        <Button
          onClick={() => setCiudadSeleccionada("queretaro")}
          sx={{ color: "red" }}
        >
          Ver Querétaro
        </Button>

        <Button
          onClick={() => {
            setCurrentView("visita");
          }}
          sx={{ color: "red" }}
        >
          Lugares que se visitaron
        </Button>
      </Grid>

      {renderView()}

      {/* //MODAL PARA ABRIR LAS IMAGENES */}
      <Modal
        open={modalImagenAbierto}
        onClose={cerrarImagen}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 2,
            maxWidth: "90vw",
            maxHeight: "90vh",
            outline: "none",
            boxShadow: 24,
          }}
        >
          <IconButton
            onClick={cerrarImagen}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={imagenSeleccionada}
            alt="Vista ampliada"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "80vh",
              borderRadius: "8px",
            }}
            onError={(e) => (e.target.src = "/imagenes/default.png")}
          />
        </Box>
      </Modal>
    </>
  );
}

export default ProyectoQueretaro;

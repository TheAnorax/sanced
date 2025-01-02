import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead, 
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Modal,
  IconButton,
  Grid,
  Divider,
  Button,
  Input,
  TextField,
  Card,
  TablePagination,
  Collapse,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import InfoIcon from "@mui/icons-material/Info";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonIcon from "@mui/icons-material/Person";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Swal from "sweetalert2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { styled } from "@mui/material/styles";

// Estilos personalizados para una apariencia más profesional
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  fontWeight: "bold",
  textAlign: "center",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function ReporteReciboCedis() {
  const [reporteData, setReporteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOc, setExpandedOc] = useState({});
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleData, setDetalleData] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    codigo: "",
    oc: "",
    pedimento: "",
    referencia: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const formatFechaHora = (fecha) => {
    if (!fecha || isNaN(new Date(fecha).getTime()))
      return "Fecha no disponible";
    const opciones = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Mexico_City",
    };
    return new Intl.DateTimeFormat("es-MX", opciones).format(new Date(fecha));
  };

  useEffect(() => {
    // Llamada a la API para obtener los datos del reporte
    const fetchReporteData = async () => {
      try {
        setLoading(true); // Iniciar el estado de carga
        const response = await axios.get(
          "http://192.168.3.27:3007/recibo/reporte"
        );
        if (response.data.resultado.error === "false") {
          setReporteData(response.data.resultado.list); // Guardar los datos obtenidos en el estado
          setFilteredData(response.data.resultado.list);
        } else {
          setError("No se pudieron obtener los datos del reporte.");
        }
      } catch (err) {
        setError("Error al obtener los datos del reporte."); // Guardar cualquier error en el estado
      } finally {
        setLoading(false); // Finalizar el estado de carga
      }
    };

    fetchReporteData();
  }, []);

  useEffect(() => {
    const filtered = reporteData.filter(
      (item) =>
        item.codigo.toLowerCase().includes(filters.codigo.toLowerCase()) &&
        item.oc.toLowerCase().includes(filters.oc.toLowerCase()) &&
        item.pedimento
          .toLowerCase()
          .includes(filters.pedimento.toLowerCase()) &&
        item.referencia.toLowerCase().includes(filters.referencia.toLowerCase())
    );
    setFilteredData(filtered);
  }, [filters, reporteData]);

  // Función para manejar la apertura del modal con la información detallada
  // Función para manejar la apertura del modal con la información detallada
  const handleViewDetails = async (id_recibo) => {
    setDetalleLoading(true);
    setModalOpen(true); // Abrir el modal antes de cargar los detalles

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/recibo/detalle",
        { id_recibo }
      );

      if (response.data.resultado.error === "false") {
        setDetalleData(response.data.resultado.list[0]); // Guardar los datos detallados en el estado
      } else {
        setError("No se pudieron obtener los detalles del producto.");
        Swal.fire({
          title: "Error",
          text: "No se pudieron obtener los detalles del producto.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      setError("Error al obtener los detalles del producto.");
      Swal.fire({
        title: "Error",
        text: "Error al obtener los detalles del producto.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setDetalleLoading(false);
    }
  };

  // Función para cerrar el modal y limpiar los datos
  const handleCloseModal = () => {
    setModalOpen(false); // Limpiar los datos cuando se cierra el modal
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio en la cantidad de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página al cambiar la cantidad de filas
  };

  // Función para manejar la búsqueda en los filtros
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  const handleFilesChange = (event, fieldName, isMultiple = false) => {
    const files = event.target.files;

    if (isMultiple) {
      // Verifica que todos los archivos sean PDFs
      const validFiles = Array.from(files).filter(
        (file) => file.type === "application/pdf"
      );

      if (validFiles.length !== files.length) {
        Swal.fire("Error", "Solo se permiten archivos PDF.", "error");
        return;
      }

      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [fieldName]: validFiles,
      }));
    } else {
      const file = files[0];
      if (file && file.type !== "application/pdf") {
        Swal.fire("Error", "Solo se permiten archivos PDF.", "error");
      } else {
        setSelectedFiles((prevFiles) => ({
          ...prevFiles,
          [fieldName]: file,
        }));
      }
    }
  };

  const groupByOC = (data) => {
    return data.reduce((acc, item) => {
      const { oc } = item;
      if (!acc[oc]) {
        acc[oc] = [];
      }
      acc[oc].push(item);
      return acc;
    }, {});
  };

  const groupedData = groupByOC(filteredData);

  const handleExpandClick = (oc) => {
    setExpandedOc((prevState) => ({
      ...prevState,
      [oc]: !prevState[oc],
    }));
  };
  const handleFilesUpload = async () => {
    const formData = new FormData();

    // Agregar archivos PDF al formData
    if (selectedFiles.cartaPorte)
      formData.append("pdf_1", selectedFiles.cartaPorte);
    if (selectedFiles.packingList)
      formData.append("pdf_2", selectedFiles.packingList);
    if (selectedFiles.pedimento)
      formData.append("pdf_3", selectedFiles.pedimento);
    if (selectedFiles.referencia && Array.isArray(selectedFiles.referencia)) {
      selectedFiles.referencia.forEach((file) => {
        formData.append("pdf_4", file); // Añadir cada archivo individualmente
      });
    } else if (selectedFiles.referencia) {
      formData.append("pdf_4", selectedFiles.referencia);
    }
 

    /////////
    if (selectedFiles.oe && Array.isArray(selectedFiles.oe)) {
      selectedFiles.oe.forEach((file) => {
        formData.append("pdf_6", file); // Añadir cada archivo individualmente
      });
    } else if (selectedFiles.oe) {
      formData.append("pdf_6", selectedFiles.oe);
    }

    //////
    if (selectedFiles.ordenCompra)
      formData.append("pdf_5", selectedFiles.ordenCompra);

    // Verificar si al menos un archivo ha sido subido
    if (
      !selectedFiles.cartaPorte &&
      !selectedFiles.packingList &&
      !selectedFiles.pedimento &&
      !selectedFiles.referencia &&
      !selectedFiles.ordenCompra && 
      !selectedFiles.oe
    ) {
      Swal.fire("Error", "Debes subir al menos un archivo.", "error");
      return;
    }

    // Agregar datos adicionales al formData
    formData.append("id_recibo", detalleData.id_recibo); // Asegúrate de que detalleData contiene id_recibo
    formData.append("pedimento", detalleData.pedimento || ""); // Agregar pedimento si está disponible
    formData.append("referencia", detalleData.referencia || ""); // Agregar factura si está disponible
    formData.append("ordenCompra", detalleData.oc || ""); // Agregar orden de compra si está disponible
    formData.append("oe", detalleData.oe || "");  

    try {
      // Realizar la solicitud de subida con axios
      const response = await axios.post(
        "http://192.168.3.27:3007/api/compras/compras/upload-pdfs",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (
        response.data.message === "Recibo actualizado exitosamente" ||
        response.data.message ===
          "Recibo agregado exitosamente desde recibo_compras"
      ) {
        Swal.fire("Éxito", "Archivos subidos con éxito.", "success");
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Error al subir los archivos.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al subir archivos:", error);
      Swal.fire("Error", "Hubo un problema al subir los archivos.", "error");
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Productos Recibidos en CEDIS
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      ) : (
        <Card sx={{ boxShadow: 3, p: 2 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    O.C
                    <TextField
                      name="oc"
                      value={filters.oc}
                      onChange={handleFilterChange}
                      placeholder="Buscar O.C"
                      variant="outlined"
                      size="small"
                      sx={{ width: "100%", mt: 1 }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    Pedimento
                    <TextField
                      name="pedimento"
                      value={filters.pedimento}
                      onChange={handleFilterChange}
                      placeholder="Buscar pedimento"
                      variant="outlined"
                      size="small"
                      sx={{ width: "100%", mt: 1 }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    Factura
                    <TextField
                      name="referencia"
                      value={filters.referencia}
                      onChange={handleFilterChange}
                      placeholder="Buscar factura"
                      variant="outlined"
                      size="small"
                      sx={{ width: "100%", mt: 1 }}
                    />
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(groupedData)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((oc) => (
                    <React.Fragment key={oc}>
                      <StyledTableRow>
                        <TableCell
                          colSpan={4}
                          align="left"
                          sx={{
                            bgcolor: "#f5f5f5",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <IconButton
                            onClick={() => handleExpandClick(oc)}
                            aria-label="expand row"
                          >
                            {expandedOc[oc] ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            O.C: {oc}
                          </Typography>
                        </TableCell>
                      </StyledTableRow>

                      <TableRow>
                        <TableCell colSpan={4}>
                          <Collapse
                            in={expandedOc[oc]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Table size="small" sx={{ mt: 2 }}>
                              <TableHead>
                                <TableRow>
                                  <StyledTableCell>ID</StyledTableCell>
                                  <StyledTableCell>Código</StyledTableCell>
                                  <StyledTableCell>
                                    Cantidad Total
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    Cantidad Recibida
                                  </StyledTableCell>
                                  <StyledTableCell>Estado</StyledTableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {groupedData[oc].map((item) => (
                                  <StyledTableRow key={item.codigo}>
                                    <TableCell align="center">
                                      {item.id_recibo}
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.codigo}
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.cantidad_total}
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.cantidad_recibida}
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.cantidad_recibida ===
                                      item.cantidad_total ? (
                                        <Button
                                          variant="contained"
                                          onClick={() =>
                                            handleViewDetails(item.id_recibo)
                                          }
                                          sx={{
                                            backgroundColor: "green",
                                            color: "white",
                                          }}
                                        >
                                          Recibo Completo
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="contained"
                                          onClick={() =>
                                            handleViewDetails(item.id_recibo)
                                          }
                                          sx={{
                                            backgroundColor: "red",
                                            color: "white",
                                          }}
                                        >
                                          Faltan Productos
                                        </Button>
                                      )}
                                    </TableCell>
                                  </StyledTableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={Object.keys(groupedData).length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Card>
      )}

      {/* Modal para mostrar la información detallada del producto */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%", // Ajustar ancho para que los documentos quepan en línea
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {detalleLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : detalleData ? (
            <Box>
              {/* Título con Semáforo Visual */}
              <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FiberManualRecordIcon
                  sx={{
                    color:
                      detalleData.total === detalleData.recibido
                        ? "green"
                        : "red",
                    fontSize: 30,
                  }}
                />
                Proceso de Recepción del Producto
              </Typography>

              {/* Información General */}
              <Divider sx={{ mb: 2 }} />

              {/* Contenedor para las dos secciones en la misma línea */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                {/* Información General */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoIcon color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Información General
                  </Typography>
                </Box>

                {/* Información de Transporte */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocalShippingIcon color="secondary" />
                  <Typography variant="h6" sx={{ ml: 1, marginRight: 42 }}>
                    Información de Transporte
                  </Typography>
                </Box>
              </Box>

              {/* Grid para Información General e Información de Transporte */}
              <Grid container spacing={2} sx={{ mb: 1 }}>
                {/* Información General */}
                <Grid item xs={6}>
                  <Typography>
                    <strong>Descripción:</strong> {detalleData.descr}
                  </Typography>
                  <Typography>
                    <strong>Código:</strong> {detalleData.codigo}
                  </Typography>
                  <Typography>
                    <strong>O.C.:</strong> {detalleData.oc}
                  </Typography>
                  <Typography>
                    <strong>Fecha de Recibo:</strong>{" "}
                    {formatFechaHora(detalleData.fecha_recibo)}
                  </Typography>
                </Grid>

                {/* Información de Transporte */}
                <Grid item xs={6}>
                  <Typography>
                    <strong>Placa:</strong> {detalleData.placa}
                  </Typography>
                  <Typography>
                    <strong>Naviera:</strong> {detalleData.naviera}
                  </Typography>
                  <Typography>
                    <strong>Pedimento:</strong> {detalleData.pedimento}
                  </Typography>
                  <Typography>
                    <strong>Factura:</strong> {detalleData.referencia}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Contenedor para los dos títulos en la misma línea */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                {/* Estado de Recepción alineado a la izquierda */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AssignmentIcon color="info" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Estado de Recepción
                  </Typography>
                </Box>

                {/* Información de Validaciones alineado del centro hacia la derecha */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flex: 1,
                  }}
                >
                  <VerifiedIcon color="success" />
                  <Typography variant="h6" sx={{ ml: 1, marginRight: 40 }}>
                    Información de Validaciones
                  </Typography>
                </Box>
              </Box>

              {/* Grid para Estado de Recepción e Información de Validaciones */}
              <Grid container spacing={2} sx={{ mb: 1 }}>
                {/* Estado de Recepción */}
                <Grid item xs={3}>
                  <Typography>
                    <strong>Total:</strong> {detalleData.total} PZ
                  </Typography>
                  <Typography>
                    <strong>Faltante por Recibir:</strong>{" "}
                    {detalleData.restante} PZ
                  </Typography>
                  <Typography>
                    <strong>Tarimas Completas:</strong>{" "}
                    {detalleData.tarimas_completas}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>
                    <strong>Recibido:</strong> {detalleData.recibido} PZ
                  </Typography>
                  <Typography>
                    <strong>Sobrante Tarima:</strong>{" "}
                    {detalleData.sobrante_tarima} PZ
                  </Typography>
                </Grid>

                {/* Información de Validaciones */}
                <Grid item xs={3}>
                  <Typography>
                    <strong>Ing. Calidad:</strong>{" "}
                    {formatFechaHora(detalleData.ingreso_calidad)}
                  </Typography>
                  <Typography>
                    <strong>Ing. Inventario:</strong>{" "}
                    {formatFechaHora(detalleData.ingreso_inventario)}
                  </Typography>
                  <Typography>
                    <strong>Usuario Calidad:</strong> {detalleData.usu_calidad}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>
                    <strong>Valid. Calidad:</strong>{" "}
                    {formatFechaHora(detalleData.validacion_calidad)}
                  </Typography>
                  <Typography>
                    <strong>Valid. Inventario:</strong>{" "}
                    {formatFechaHora(detalleData.vali_inventario)}
                  </Typography>
                  <Typography>
                    <strong>Usuario Inventario:</strong>{" "}
                    {detalleData.usu_inventario}
                  </Typography>
                </Grid>
              </Grid>

              {/* Registro */}
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon color="action" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Registro
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Usuario Registro:</strong>{" "}
                    {detalleData.usu_registro}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Fecha de Registro:</strong>{" "}
                    {formatFechaHora(detalleData.fecha_registro)}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Documentos Adjuntos
              </Typography>

              <Card sx={{ p: 3, mb: 1 }}>
                <Grid
                  container
                  spacing={4}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* Documento: Carta Porte */}
                  <Grid item xs={2}>
                    <Typography variant="h6" gutterBottom>
                      Carta Porte
                    </Typography>
                    {detalleData?.pdf_1 ? (
                      <div>
                        <Button
                          href={`http://192.168.3.27:3011/docs/${detalleData.pdf_1}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          sx={{
                            backgroundColor: "rgba(76, 175, 80, 0.5)", // Verde con transparencia
                            color: "white",
                            width: "300px",
                            justifyContent: "flex-start", // Alinea el contenido a la izquierda
                            textAlign: "left", // Alinea el texto a la izquierda
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.8)", // Hover más oscuro
                            },
                            marginBottom: "10px",
                          }}
                        >
                          {detalleData.pdf_1.split("-").slice(3).join("-")}
                        </Button>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Reemplazar
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => handleFilesChange(e, "cartaPorte")}
                          />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                        >
                          Seleccionar Documento
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => handleFilesChange(e, "cartaPorte")}
                          />
                        </Button>
                        {selectedFiles.cartaPorte && (
                          <Typography sx={{ mt: 1 }}>
                            {selectedFiles.cartaPorte.name}
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>

                  {/* Documento: Packing List */}
                  <Grid item xs={2}>
                    <Typography variant="h6" gutterBottom>
                      Packing List
                    </Typography>
                    {detalleData?.pdf_2 ? (
                      <div>
                        {detalleData.pdf_2.split(",").map((pdfName, index) => (
                          <Button
                            key={index}
                            href={`http://192.168.3.27:3011/docs/${pdfName.trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            sx={{
                              backgroundColor: "rgba(76, 175, 80, 0.5)",
                              width: "300px",
                              justifyContent: "flex-start", // Alinea el contenido a la izquierda
                              textAlign: "left", // Alinea el texto a la izquierda
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(76, 175, 80, 0.8)",
                              },
                              marginBottom: "10px",
                            }}
                          >
                            {pdfName.trim().split("-").slice(3).join("-")}
                          </Button>
                        ))}
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Reemplazar
                          <VisuallyHiddenInput
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleFilesChange(e, "packingList", true)
                            }
                          />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                        >
                          Seleccionar Documento
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) =>
                              handleFilesChange(e, "packingList")
                            }
                          />
                        </Button>
                        {selectedFiles.packingList && (
                          <Typography sx={{ mt: 1 }}>
                            {selectedFiles.packingList.name}
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>

                  {/* Documento: Pedimento */}
                  <Grid item xs={2}>
                    <Typography variant="h6" gutterBottom>
                      Pedimento
                    </Typography>
                    {detalleData?.pdf_3 ? (
                      <div>
                        <Button
                          href={`http://192.168.3.27:3011/docs/${detalleData.pdf_3}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          sx={{
                            backgroundColor: "rgba(76, 175, 80, 0.5)",
                            color: "white",
                            width: "300px",
                            justifyContent: "flex-start", // Alinea el contenido a la izquierda
                            textAlign: "left",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.8)",
                            },
                            marginBottom: "10px",
                          }}
                        >
                          {detalleData.pdf_3.split("-").slice(3).join("-")}
                        </Button>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Reemplazar
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => handleFilesChange(e, "pedimento")}
                          />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                        >
                          Seleccionar Documento
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => handleFilesChange(e, "pedimento")}
                          />
                        </Button>
                        {selectedFiles.pedimento && (
                          <Typography sx={{ mt: 1 }}>
                            {selectedFiles.pedimento.name}
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>

                  {/* Documento: Factura */}
                  <Grid item xs={2}>
                    <Typography variant="h6" gutterBottom>
                      Factura
                    </Typography>
                    {detalleData?.pdf_4 ? (
                      <div>
                        {detalleData.pdf_4.split(",").map((pdfName, index) => (
                          <Button
                            key={index}
                            href={`http://192.168.3.27:3011/docs/${pdfName.trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            sx={{
                              backgroundColor: "rgba(76, 175, 80, 0.5)",
                              color: "white",
                              width: "300px",
                              justifyContent: "flex-start", // Alinea el contenido a la izquierda
                              textAlign: "left", // Alinea el texto a la izquierda
                              "&:hover": {
                                backgroundColor: "rgba(76, 175, 80, 0.8)",
                              },
                              marginBottom: "10px",
                            }}
                          >
                            {pdfName.trim().split("-").slice(3).join("-")}
                          </Button>
                        ))}
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Reemplazar
                          <VisuallyHiddenInput
                            type="file"
                            multiple // Permitir seleccionar múltiples archivos
                            onChange={(e) =>
                              handleFilesChange(e, "referencia", true)
                            }
                          />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                        >
                          Seleccionar Documento
                          <VisuallyHiddenInput
                            type="file"
                            multiple // Permitir seleccionar múltiples archivos
                             onChange={(e) =>
                              handleFilesChange(e, "referencia", true)
                            }
                          />
                        </Button>
                        {selectedFiles.referencia && (
                          <Typography sx={{ mt: 1 }}>
                            {Array.from(selectedFiles.referencia)
                              .map((file) => file.name)
                              .join(", ")}
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>

                  {/* Documento: Orden de Compra */}
                  <Grid item xs={2}>
                    <Typography variant="h6" gutterBottom>
                      Orden de Compra
                    </Typography>
                    {detalleData?.pdf_5 ? (
                <div>
                  <Button
                    href={`http://192.168.3.27:3011/docs/${detalleData.pdf_5}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    sx={{
                      backgroundColor: "rgba(76, 175, 80, 0.5)",
                      color: "white",
                      width: "300px",
                      justifyContent: "flex-start", // Alinea el contenido a la izquierda
                      textAlign: "left", // Alinea el texto a la izquierda
                      "&:hover": {
                        backgroundColor: "rgba(76, 175, 80, 0.8)",
                      },
                      marginBottom: "10px",
                    }}
                  >
                    {detalleData.pdf_5.split("-").slice(3).join("-")}
                  </Button>
                 
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Reemplazar
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "ordenCompra")}
                      />
                    </Button>
                 
                </div>
              ) : (
                      <>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Seleccionar Documento
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "ordenCompra")}
                      />
                    </Button>
                  {selectedFiles.ordenCompra && (
                    <Typography sx={{ mt: 1 }}>
                      {selectedFiles.ordenCompra.name}
                    </Typography>
                  )}
                      </>
                    )}
                  </Grid>
                  {/* Documento: Orden de entrada  */}
                  <Grid item xs={2}>
                    <Typography variant="h6" gutterBottom>
                      Orden de entrada
                    </Typography>
                    {detalleData?.pdf_6 ? (
                      <div>
                        {detalleData.pdf_6.split(",").map((pdfName, index) => (
                          <Button
                            key={index}
                            href={`http://192.168.3.27:3011/docs/${pdfName.trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            sx={{
                              backgroundColor: "rgba(76, 175, 80, 0.5)",
                              color: "white",
                              width: "300px",
                              justifyContent: "flex-start", // Alinea el contenido a la izquierda
                              textAlign: "left", // Alinea el texto a la izquierda
                              "&:hover": {
                                backgroundColor: "rgba(76, 175, 80, 0.8)",
                              },
                              marginBottom: "10px",
                            }}
                          >
                            {pdfName.trim().split("-").slice(3).join("-")}
                          </Button>
                        ))}
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Reemplazar
                          <VisuallyHiddenInput
                            type="file"
                            multiple // Permitir seleccionar múltiples archivos
                            onChange={(e) =>
                              handleFilesChange(e, "oe", true)
                            }
                          />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                        >
                          Seleccionar Documento
                          <VisuallyHiddenInput
                            type="file"
                            multiple // Permitir seleccionar múltiples archivos
                            onChange={(e) =>
                              handleFilesChange(e, "oe", true)
                            }
                          />
                        </Button>
                        {selectedFiles.oe && (
                          <Typography sx={{ mt: 1 }}>
                            {Array.from(selectedFiles.oe)
                              .map((file) => file.name)
                              .join(", ")}
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>
                  {/* Botón para subir todos los archivos */}
                  <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFilesUpload}
                      startIcon={<UploadFileIcon />}
                    >
                      Subir Archivos
                    </Button>
                  </Grid>
                </Grid>
              </Card>

              {/* Botón de Cerrar */}
              <Box sx={{ mt: 1, textAlign: "right" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseModal}
                  startIcon={<VerifiedIcon />}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography>Cargando detalles...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default ReporteReciboCedis;

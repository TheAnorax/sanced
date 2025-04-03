import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Importamos SweetAlert
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
  Button,
  Modal,
  Backdrop,
  Fade,
  CircularProgress,
  Checkbox,
  TextField,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PapeletaTarima from "./papeleta";
import PapeletaTarimaRestante from "./PapeletaTarimaRestante";
import { UserContext } from "../context/UserContext";

import ReactDOM from "react-dom";

function Recibo() {
  const [recibos, setRecibos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [tarimaData, setTarimaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cantidadCompleta, setCantidadCompleta] = useState(true);
  const [cantidadRecibida, setCantidadRecibida] = useState("");
  const [tarimaInfo, setTarimaInfo] = useState(null);
  const [isGenerateEnabled, setIsGenerateEnabled] = useState(false); // Estado para controlar botón de generar PDF con nueva cantidad
  const [editMode, setEditMode] = useState(false); // Estado para habilitar edición
  const [editedTarimaData, setEditedTarimaData] = useState({}); // Datos modificados
  const [initialTarimaData, setInitialTarimaData] = useState({}); // Estado para almacenar los datos originales
  const printRef = useRef();
  const [loadingDialogOpen, setLoadingDialogOpen] = useState(false);
  const [dato, setDato] = useState("0");
  const [checked, setChecked] = useState(false); // Estado del Switch
  const [filterOC, setFilterOC] = useState("");
  const [filterCodigo, setFilterCodigo] = useState("");
  const { user } = useContext(UserContext);

  const handlePrint = async () => {
    setLoadingDialogOpen(true); // Mostrar el diálogo de carga

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const tarimasCompletas = tarimaInfo.tarimasCompletas; // Número de tarimas completas
    const piezasRestantes = tarimaInfo.piezasRestantes; // Piezas restantes
    const name = tarimaData.recibido?.codigo;

    try {
      // Guardar los datos en la base de datos antes de generar el PDF
      await axios.post("http://66.232.105.87:3007/api/recibo/guardarRecibo", {
        codigo: tarimaData.recibido?.codigo,
        cantidad_recibida: tarimaData.recibido?.cant_recibir,
        fecha_recibo: new Date().toLocaleDateString("es-MX"),
        oc: selectedRecibo?.oc,
        est: "R", // Estado
        pallete: tarimasCompletas, // Total de tarimas completas
        restante: piezasRestantes, // Piezas restantes por recibir
        idRecibo: selectedRecibo.id_recibo,
      });

      // Generar las páginas de tarimas completas
      const generateTarimasPages = async () => {
        const promises = Array.from(
          { length: tarimasCompletas },
          async (_, i) => {
            const input = printRef.current;
            const canvas = await html2canvas(input, {
              scale: 1.5,
              useCORS: true,
            });
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 297; // Ancho de la página en mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            if (i < tarimasCompletas - 1) pdf.addPage();
          }
        );

        await Promise.all(promises);
      };

      // Generar la página de "Piezas restantes"
      const generateRestantesPage = async () => {
        if (piezasRestantes > 0) {
          // Crear contenedor temporal para renderizar el componente
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.top = "0";
          container.style.left = "0";
          container.style.width = "3508px"; // Tamaño proporcional a A4 horizontal a 300 DPI
          container.style.height = "2480px"; // Altura proporcional
          container.style.backgroundColor = "white";
          container.style.margin = "0";
          container.style.padding = "0";
          container.style.display = "flex";
          container.style.flexDirection = "column";
          container.style.justifyContent = "center"; // Centrar verticalmente
          container.style.alignItems = "center"; // Centrar horizontalmente
          document.body.appendChild(container);

          ReactDOM.render(
            <PapeletaTarimaRestante
              codigo={tarimaData?.recibido?.codigo}
              descripcion={tarimaData?.recibido?.descripcion}
              restante={piezasRestantes}
              fecha={new Date().toLocaleDateString("es-MX")}
            />,
            container
          );

          // Espera para que el contenido se renderice correctamente
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Capturar el contenido renderizado en un canvas
          const canvas = await html2canvas(container, {
            scale: 2.5, // Escala mejorada para alta calidad
            useCORS: true,
            allowTaint: true,
          });

          // Convertir canvas a imagen para PDF
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 297; // Ancho en mm para PDF (A4 horizontal)
          const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calcular altura proporcional

          // Agregar imagen al PDF en una nueva página
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

          // Limpiar contenedor temporal
          ReactDOM.unmountComponentAtNode(container);
          document.body.removeChild(container);
        }
      };

      // Ejecutar la generación de las páginas
      await generateTarimasPages();
      await generateRestantesPage();

      // Guardar el PDF
      pdf.save(`papeleta_${name}.pdf`);
      setLoadingDialogOpen(false);
      handleCloseModal(); // Cerrar el modal y actualizar la tabla
    } catch (error) {
      console.error("Error al guardar los datos en la base de datos:", error);
      setLoadingDialogOpen(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al generar el PDF.",
      });
    }
  };

  const handlePrintWithNewQuantity = async () => {
    // Lógica para generar PDF con nueva cantidad
    setLoadingDialogOpen(true);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const tarimasCompletas = tarimaInfo.tarimasCompletas;
    const name = tarimaData.recibido?.codigo;

    let currentTarima = 0;
    const cantidadRecibidaTarimas = tarimaInfo.tarimasCompletas;

    try {
      // Guardar los datos en la base de datos antes de generar el PDF
      await axios.post("http://66.232.105.87:3007/api/recibo/guardarRecibo", {
        codigo: tarimaData.recibido?.codigo,
        cantidad_recibida: cantidadRecibida,
        fecha_recibo: new Date().toLocaleDateString("es-MX"),
        oc: selectedRecibo?.oc,
        est: "R", // Estado
        pallete: cantidadRecibidaTarimas, // Total de tarimas completas
        restante: tarimaInfo.piezasRestantes, // Piezas restantes
        idRecibo: selectedRecibo.id_recibo,
      });

      // Generación del PDF con la nueva cantidad
      const generatePDFPage = () => {
        if (currentTarima < tarimasCompletas) {
          const input = printRef.current;

          html2canvas(input, { scale: 2, useCORS: true })
            .then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              const imgWidth = 297;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

              currentTarima++;
              if (currentTarima < tarimasCompletas) {
                pdf.addPage();
                generatePDFPage();
              } else {
                pdf.save(`papeleta_${name}_nueva_cantidad.pdf`);
                handleCloseModal();
                setLoadingDialogOpen(false);
              }
            })
            .catch((error) => {
              console.error("Error al generar el PDF:", error);
              setLoadingDialogOpen(false);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al generar el PDF.",
              });
            });
        }
      };

      generatePDFPage();
    } catch (error) {
      console.error("Error al guardar los datos en la base de datos:", error);
      setLoadingDialogOpen(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al guardar los datos del recibo con la nueva cantidad.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false); // Salir del modo de edición
    setEditedTarimaData(initialTarimaData); // Restaurar los datos originales
  };

  const fetchRecibos = async (dato) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://66.232.105.87:3007/recibo/lista",
        {
          dato: dato,
        }
      );
  
      if (response.data.resultado.error) {
        Swal.fire({
          icon: "info",
          title: "Información",
          text: response.data.resultado.msg,
        });
        setRecibos([]);
      } else {
        const recibosFiltrados = response.data.resultado.list.filter(
          (recibo) => Number(recibo.cant_recibir) > 0
        );
  
        const recibosOrdenados = recibosFiltrados.sort(
          (a, b) => new Date(a.arribo) - new Date(b.arribo)
        );
  
        setRecibos(recibosOrdenados);
      }
    } catch (error) {
      console.error("Error al obtener los datos del recibo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los datos. Inténtalo nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRecibos("0");
  }, []);

  const handleSwitchChange = (event) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    const newDato = isChecked ? "1" : "0";
    setDato(newDato);
    fetchRecibos(newDato);
  };

  const handleRecibir = async (recibo) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://66.232.105.87:3007/recibo/tarima",
        { 
          id_recibo: recibo.id_recibo,
        }
      );
      if (response.data && response.data.resultado) {
        setTarimaData(response.data.resultado);
        setEditedTarimaData(response.data.resultado.tarimas[0]);
        setInitialTarimaData(response.data.resultado.tarimas[0]);
        setSelectedRecibo(recibo);
        setModalOpen(true);
        setCantidadRecibida(response.data.resultado.recibido.cant_recibir);
        setTarimaInfo(
          calculateTarimas(
            response.data.resultado.recibido.cant_recibir,
            response.data.resultado.tarimas[0]
          )
        );
      }
    } catch (error) {
      console.error("Error al recibir datos de tarima:", error);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTarimaData(null);
    setSelectedRecibo(null);
    setCantidadCompleta(true);
    setCantidadRecibida("");
    setTarimaInfo(null);
    setEditMode(false);
    setIsGenerateEnabled(false);
    fetchRecibos("0"); // Actualizar la tabla principal
  };

  const handleCantidadCompletaChange = (event) => {
    setCantidadCompleta(event.target.checked);
    if (event.target.checked) {
      setCantidadRecibida(tarimaData?.recibido?.cant_recibir || "");
      setTarimaInfo(
        calculateTarimas(
          tarimaData?.recibido?.cant_recibir,
          tarimaData?.tarimas[0]
        )
      );
      setIsGenerateEnabled(false);
    } else {
      setCantidadRecibida("");
      setTarimaInfo(null);
      setIsGenerateEnabled(false);
    }
  };

  const handleCantidadRecibidaChange = (e) => {
    const nuevaCantidad = e.target.value;
    setCantidadRecibida(nuevaCantidad);
    if (nuevaCantidad && !isNaN(nuevaCantidad)) {
      const infoTarima = calculateTarimas(nuevaCantidad, tarimaData.tarimas[0]);
      setTarimaInfo(infoTarima);
      if (infoTarima && infoTarima.tarimasCompletas > 0) {
        setIsGenerateEnabled(true); // Habilitar botón para generar PDF
      }
    } else {
      setTarimaInfo(null);
      setIsGenerateEnabled(false);
    }
  };

  const calculateTarimas = (cantidad, tarima) => {
    if (!tarima) return null;

    const { cajas_cama, camas_tarima, piezas_caja, piezas_tarima } = tarima;
    const piezasPorTarima = piezas_tarima;

    // Calcular el número de tarimas completas correctamente
    const tarimasCompletas = Math.floor(cantidad / piezasPorTarima);

    // Calcular las piezas restantes
    const piezasRestantes = cantidad % piezasPorTarima;

    // Calcular cuántas cajas caben en las piezas restantes
    const cajasMaster = Math.floor(piezasRestantes / piezas_caja);
    const piezasRestantesMaster = piezasRestantes % piezas_caja;

    // Si hay piezas restantes, debe considerarse una tarima incompleta extra.
    const tarimasIncompletas = piezasRestantes > 0 ? 1 : 0;

    return {
      tarimasCompletas, // Número de tarimas completas
      tarimasIncompletas, // Si hay piezas restantes, hay una tarima incompleta
      piezasRestantes, // Piezas que no llenan una tarima completa
      cajasMaster, // Número de cajas completas que caben en las piezas restantes
      piezasRestantesMaster, // Piezas que sobran después de llenar las cajas
    };
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  useEffect(() => {
    if (
      editMode &&
      editedTarimaData.cajas_cama &&
      editedTarimaData.camas_tarima
    ) {
      const cajasTarima =
        editedTarimaData.cajas_cama * editedTarimaData.camas_tarima;
      setEditedTarimaData((prevData) => ({
        ...prevData,
        cajas_tarima: cajasTarima,
      }));
    }
  }, [editedTarimaData.cajas_cama, editedTarimaData.camas_tarima, editMode]);

  const handleTarimaDataChange = (e) => {
    const { name, value } = e.target;
    setEditedTarimaData({
      ...editedTarimaData,
      [name]: value || tarimaData.tarimas[0][name],
    });
  };

  const handleGuardarDatos = async () => {
    handleCloseModal();
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas guardar los cambios en los detalles de la tarima?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
      });

      if (confirmacion.isConfirmed) {
        await axios.post(
          "http://66.232.105.87:3007/api/recibo/guardarTarima",
          editedTarimaData
        );
        Swal.fire(
          "¡Guardado!",
          "Los datos de la tarima han sido actualizados.",
          "success"
        );
        handleCloseModal();
      } else {
        setModalOpen(false);
      }
    } catch (error) {
      Swal.fire("Error", "Ocurrió un error al guardar los datos.", "error");
      console.error("Error al guardar los datos de tarima:", error);
      setModalOpen(true);
    }
  };
  const filteredRecibos = recibos.filter((recibo) => {
    return (
      recibo.oc.toLowerCase().includes(filterOC.toLowerCase()) &&
      recibo.codigo.toLowerCase().includes(filterCodigo.toLowerCase())
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Recibos
      </Typography>

      <Dialog open={loadingDialogOpen}>
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Generando Papeletas...
          </Typography>
        </DialogContent>
      </Dialog>

      <Typography variant="body1" gutterBottom>
        Mostrar recibos de 15 días adelante
      </Typography>
      <Switch
        checked={checked}
        onChange={handleSwitchChange}
        color="primary"
        sx={{ mb: 2 }}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 3, borderRadius: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Imagen</TableCell>
                <TableCell>O.C</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Cantidad a Recibir</TableCell>
                <TableCell>Arribo</TableCell>
                <TableCell>Comprador</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
              {/* Filtros debajo del encabezado */}
              <TableRow>
                <TableCell />
                <TableCell />
                <TableCell>
                  <TextField
                    label=" O.C"
                    variant="outlined"
                    size="small"
                    value={filterOC}
                    onChange={(e) => setFilterOC(e.target.value)}
                    sx={{ width: "50%" }} // Ocupa todo el ancho de la celda
                  />
                </TableCell>
                <TableCell />
                <TableCell>
                  <TextField
                    label="Código"
                    variant="outlined"
                    size="small"
                    value={filterCodigo}
                    onChange={(e) => setFilterCodigo(e.target.value)}
                    sx={{ width: "50%" }} // Ocupa todo el ancho de la celda
                  />
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRecibos.map((recibo, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell>{recibo.id_recibo}</TableCell>
                  <TableCell>
                    <img
                      src={`../assets/image/img_pz/${recibo.codigo}.jpg`}
                      alt="Producto"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </TableCell>
                  <TableCell>{recibo.oc}</TableCell>
                  <TableCell>{recibo.des}</TableCell>
                  <TableCell>{recibo.codigo}</TableCell>
                  <TableCell>{recibo.cant_recibir}</TableCell>
                  <TableCell>
                    {new Date(`${recibo.arribo}T00:00:00`).toLocaleDateString(
                      "es-MX",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell>{recibo.comprador}</TableCell>
                  <TableCell>
                    <Typography
                      color={
                        recibo.estado === "Pendiente" ? "error" : "primary"
                      }
                    >
                      {recibo.estado ?? "Pendiente"}
                    </Typography>
                  </TableCell>
                  {["Admin", "Recibo"].includes(user?.role) && (
                  <TableCell>
                    {isToday(new Date(`${recibo.arribo}T00:00:00`)) ? (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleRecibir(recibo)}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : "Recibir"}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No disponible
                      </Typography>
                    )}
                  </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              p: 4,
              boxShadow: 24,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" component="h2" mb={2}>
              Detalles del Recibo: {selectedRecibo?.oc} ID:{" "}
              {selectedRecibo?.id_recibo}
            </Typography>

            {tarimaData && tarimaData.recibido && (
              <Box>
                <Box
                  mt={2}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <TextField
                    label="Descripción"
                    value={tarimaData.recibido?.descripcion ?? "N/A"}
                    InputProps={{ readOnly: true }}
                    sx={{ width: "48%" }}
                  />
                </Box>
                <Box
                  mt={2}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <TextField
                    label="Código"
                    value={tarimaData.recibido?.codigo ?? "N/A"}
                    InputProps={{ readOnly: true }}
                    sx={{ width: "48%" }}
                  />
                  <TextField
                    label="Cantidad Original a Recibir"
                    value={tarimaData.recibido?.cant_recibir ?? "N/A"}
                    InputProps={{ readOnly: true }}
                    sx={{ width: "48%" }}
                  />
                </Box>

                <Box
                  mt={2}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <TextField
                    label="Tarimas Completas"
                    value={tarimaData.tarimas[0].tarimas_completas}
                    InputProps={{ readOnly: true }}
                    sx={{ width: "48%" }}
                  />
                  <TextField
                    label="Piezas Restantes"
                    value={tarimaData.tarimas[0].tarimas_incompletas}
                    InputProps={{ readOnly: true }}
                    sx={{ width: "48%" }}
                  />
                </Box>
                <Box
                  mt={2}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* <TextField
                    label="Piezas por Tarima"
                    value={tarimaData.tarimas[0].piezas_tarima}
                    InputProps={{ readOnly: true }}
                    sx={{ width: "48%" }}
                  /> */}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">Detalles de Tarima:</Typography>
                    {editMode && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleGuardarDatos}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleCancelEdit}
                          startIcon={<CancelIcon />}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    <IconButton onClick={handleEditMode}>
                      <EditIcon color={editMode ? "primary" : "action"} />
                    </IconButton>
                    <Button
                      variant="contained"
                      onClick={handlePrint}
                      disabled={!cantidadCompleta}
                    >
                      Generar PDF
                    </Button>
                  </Box>

                  <Box
                    mt={2}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <TextField
                      label="Cajas por Cama:"
                      name="cajas_cama"
                      value={editedTarimaData.cajas_cama}
                      onChange={handleTarimaDataChange}
                      InputProps={{ readOnly: !editMode }}
                      sx={{ width: "48%" }}
                    />
                    <TextField
                      label="Camas por Tarima:"
                      name="camas_tarima"
                      value={editedTarimaData.camas_tarima}
                      onChange={handleTarimaDataChange}
                      InputProps={{ readOnly: !editMode }}
                      sx={{ width: "48%" }}
                    />
                  </Box>
                  <Box
                    mt={2}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <TextField
                      label="Piezas por Tarima:"
                      name="piezas_tarima"
                      value={editedTarimaData.piezas_tarima}
                      onChange={handleTarimaDataChange}
                      InputProps={{ readOnly: !editMode }}
                      sx={{ width: "48%" }}
                    />
                    <TextField
                      label="Piezas por Caja:"
                      name="piezas_caja"
                      value={editedTarimaData.piezas_caja}
                      onChange={handleTarimaDataChange}
                      InputProps={{ readOnly: !editMode }}
                      sx={{ width: "48%" }}
                    />
                  </Box>
                  <Box
                    mt={2}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <TextField
                      label="Cajas por Tarima:"
                      name="cajas_tarima"
                      value={editedTarimaData.cajas_tarima}
                      InputProps={{ readOnly: true }}
                      sx={{ width: "48%" }}
                    />
                  </Box>

                  <Box mt={3} sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={cantidadCompleta}
                      onChange={handleCantidadCompletaChange}
                    />
                    <Typography variant="body1">
                      Cantidad completa recibida
                    </Typography>
                  </Box>

                  {!cantidadCompleta && (
                    <Box mt={2}>
                      <TextField
                        label="Cantidad Recibida"
                        type="number"
                        value={cantidadRecibida}
                        onChange={handleCantidadRecibidaChange}
                        fullWidth
                      />
                    </Box>
                  )}

                  {!cantidadCompleta && tarimaInfo && (
                    <Box mt={2}>
                      <Typography variant="h6">
                        Cálculo de Tarimas con Cantidad Recibida:
                      </Typography>
                      <Box
                        mt={2}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <TextField
                          label="Tarimas Completas:"
                          value={tarimaInfo ? tarimaInfo.tarimasCompletas : ""}
                          InputProps={{ readOnly: true }}
                          sx={{ width: "48%" }}
                        />
                        <TextField
                          label="Tarimas Incompletas:"
                          value={
                            tarimaInfo ? tarimaInfo.tarimasIncompletas : ""
                          }
                          InputProps={{ readOnly: true }}
                          sx={{ width: "48%" }}
                        />
                      </Box>
                      <Box
                        mt={2}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <TextField
                          label="Piezas Restantes:"
                          value={tarimaInfo ? tarimaInfo.piezasRestantes : ""}
                          InputProps={{ readOnly: true }}
                          sx={{ width: "48%" }}
                        />
                        <TextField
                          label="Cajas Master:"
                          value={tarimaInfo ? tarimaInfo.cajasMaster : ""}
                          InputProps={{ readOnly: true }}
                          sx={{ width: "48%" }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Botón para generar PDF con nueva cantidad */}
                  {!cantidadCompleta && isGenerateEnabled && (
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePrintWithNewQuantity}
                      >
                        Generar PDF con Nueva Cantidad
                      </Button>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    width: 600,
                    position: "absolute",
                    top: "-10000px",
                    left: "-10000px",
                  }}
                >
                  {tarimaInfo &&
                    tarimaData &&
                    tarimaData.tarimas &&
                    tarimaData.tarimas.length > 0 && (
                      <div ref={printRef}>
                        {/* Condicional para manejar los datos originales o calculados */}
                        {cantidadCompleta ? (
                          <PapeletaTarima
                            tarimaData={tarimaData.tarimas[0]} // Datos originales
                            recibo={selectedRecibo}
                            cantidadRecibidaTarimas={
                              tarimaData.recibido?.cant_recibir
                            } // Usar cantidad original
                            descripcion={tarimaData.recibido?.descripcion}
                            fecha={new Date().toLocaleDateString()}
                            codigo={tarimaData.recibido?.codigo}
                            piezas_tarima={tarimaData.tarimas[0].piezas_tarima}
                            caja_cama={tarimaData.tarimas[0].cajas_cama}
                            caja_palet={tarimaData.tarimas[0].camas_tarima}
                            restante={tarimaInfo?.piezasRestantes}
                          />
                        ) : (
                          <PapeletaTarima
                            tarimaData={tarimaInfo} // Usar los datos calculados con la nueva cantidad
                            recibo={selectedRecibo}
                            cantidadRecibidaTarimas={
                              tarimaInfo.tarimasCompletas
                            } // Usar la cantidad recibida modificada
                            descripcion={tarimaData.recibido?.descripcion}
                            fecha={new Date().toLocaleDateString()}
                            codigo={tarimaData.recibido?.codigo}
                            piezas_tarima={tarimaData.tarimas[0].piezas_tarima}
                            caja_cama={tarimaData.tarimas[0].cajas_cama}
                            caja_palet={tarimaData.tarimas[0].camas_tarima}
                            restante={tarimaInfo?.piezasRestantes}
                          />
                        )}
                      </div>
                    )}
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default Recibo;

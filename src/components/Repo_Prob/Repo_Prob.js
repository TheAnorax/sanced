import React, { useState } from "react";
import axios from "axios"; // Importamos axios
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import RepoTable from "./tables/Table_Prob"; // Importamos el componente de la tabla
import TableSku from "./tables/Table_SKUs";

function Repo_Prob() {
  const initialState = {
    indole: "",
    encargado: "",
    area: "",
    descripcion: "",
    remitente: "",
    destinatario: "",
    sku: "",
    noPedido: "",
    turno: "",
  };

  const surtidosData = Array.from({ length: 120 }, (_, index) => ({
    sku: 5000 + index,
    descripcion: `Producto ${index + 1}`,
  }));

  const [problemData, setProblemData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0); // Estado para manejar la pestaña activa
  const [selectedCheck, setSelectedCheck] = useState("General");
  const [selectedSurtido, setSelectedSurtido] = useState(null);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemData({ ...problemData, [name]: value });

    if (value.trim() !== "") {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

const handleSubmit = async () => {
  // Validar que todos los campos estén llenos
  const requiredFields = ["indole", "encargado", "area", "descripcion", "remitente"];
  const newErrors = {};

  // Verificar si algún campo requerido está vacío
  requiredFields.forEach((field) => {
    if (!problemData[field] || problemData[field].trim() === "") {
      newErrors[field] = "Este campo es obligatorio";
    }
  });

  // Si el tipo de reporte es "Surtidos", validar campos adicionales
  if (selectedCheck === "Surtidos") {
    if (!problemData.sku || problemData.sku.trim() === "") {
      newErrors.sku = "Debes seleccionar un SKU";
    }
    if (!problemData.noPedido || problemData.noPedido.trim() === "") {
      newErrors.noPedido = "Este campo es obligatorio";
    }
    if (!problemData.turno || problemData.turno.trim() === "") {
      newErrors.turno = "Este campo es obligatorio";
    }
  }

  // Si hay errores, actualiza el estado y muestra un mensaje
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    alert("Por favor, completa todos los campos obligatorios.");
    return;
  }

  try {
    // Determinar el tipo de reporte
    const tip_rep = selectedCheck === "General" ? "gen" : "surt";

    // Generar la fecha y hora actuales
    const now = new Date();

    // Formatear la fecha como "21/Mayo/2025"
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const anio = now.getFullYear();
    const fecha = `${dia}/${mes}/${anio}`;

    // Formatear la hora como "01:13 p. m."
    const horas = now.getHours();
    const minutos = now.getMinutes();
    const periodo = horas >= 12 ? "p. m." : "a. m.";
    const horaFormateada = `${horas % 12 || 12}:${minutos
      .toString()
      .padStart(2, "0")} ${periodo}`;

    // Crear el objeto de datos para enviar
    const reportData = {
      tip_rep,
      motivo: problemData.indole,
      encargado: problemData.encargado,
      area: problemData.area,
      sku: problemData.sku || null,
      desc_sku: selectedSurtido ? selectedSurtido.descripcion : null,
      desc_prob: problemData.descripcion,
      remitente: problemData.remitente,
      no_pedido: problemData.noPedido || null,
      turno: problemData.turno || null,
      fecha, // Fecha formateada
      hora: horaFormateada, // Hora formateada
    };

    // Enviar la solicitud POST al backend
    const response = await axios.post(
      "http://66.232.105.87:3007/api/repo_prob/upload",
      reportData
    );

    console.log("Reporte enviado exitosamente:", response.data);

    // Mensaje de éxito
    alert(
      `Reporte enviado exitosamente.\nFecha: ${fecha}\nHora: ${horaFormateada}`
    );

    // Restablecer el estado del formulario al estado inicial
    setProblemData(initialState);
    setErrors({}); // Limpiar errores
    setSelectedSurtido(null); // Restablecer selección de SKU
  } catch (error) {
    console.error("Error al enviar el reporte:", error);
    alert(
      "Hubo un error al enviar el reporte. Por favor, inténtalo de nuevo."
    );
  }
};



  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCheckChange = (event) => {
    setSelectedCheck(event.target.value);
    if (event.target.value === "Surtidos") {
      setSelectedSurtido(null);
      setProblemData({ ...problemData, sku: "", noPedido: "", turno: "" });
    }
  };

  const handleOpenTableDialog = () => {
    setShowTableDialog(true);
  };

  const handleCloseTableDialog = () => {
    setShowTableDialog(false);
  };

  const handleSelectSku = ({ codigo_pro, des }) => {
    const surtido = { codigo_pro, descripcion: des }; // Crear objeto con código y descripción
    setSelectedSurtido(surtido); // Actualiza el objeto seleccionado
    setProblemData({ ...problemData, sku: codigo_pro }); // Actualiza el SKU en el estado
    setShowTableDialog(false); // Cierra el diálogo
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reiniciar a la primera página cuando se aplica una búsqueda
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrar los datos según el término de búsqueda
  const filteredData = surtidosData.filter(
    (item) =>
      item.sku.toString().includes(searchTerm) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{ marginBottom: 4 }}
      >
        <Tab label="Formulario de Reporte" />
        <Tab label="Tabla de Reportes" />
      </Tabs>
      {activeTab === 0 && (
        <>
          <Box
            sx={{
              padding: "8px",
              textAlign: "center",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <Typography variant="h4">Reportar problema</Typography>
          </Box>

          <Box sx={{ marginBottom: 4 }}>
            <FormControl component="fieldset">
              <Typography variant="h6">Seleccionar tipo de reporte</Typography>
              <RadioGroup
                row
                value={selectedCheck}
                onChange={handleCheckChange}
              >
                <FormControlLabel
                  value="General"
                  control={<Radio />}
                  label="General"
                />
                <FormControlLabel
                  value="Surtidos"
                  control={<Radio />}
                  label="Surtidos"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {selectedCheck === "Surtidos" && (
            <Box>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                sx={{ marginBottom: 4 }}
              >
                <Typography variant="body1" sx={{ marginRight: 2 }}>
                  <strong>Código:</strong>{" "}
                  {problemData.sku || "No seleccionado"}
                </Typography>
                <Typography variant="body1" sx={{ marginRight: 2 }}>
                  <strong>Descripción:</strong>{" "}
                  {selectedSurtido
                    ? selectedSurtido.descripcion
                    : "No seleccionado"}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenTableDialog}
                >
                  Seleccionar SKU
                </Button>
              </Box>
            </Box>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Índole del problema"
                    variant="outlined"
                    fullWidth
                    name="indole"
                    value={problemData.indole}
                    onChange={handleChange}
                    error={!!errors.indole}
                    helperText={errors.indole}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Encargado/a del área"
                    variant="outlined"
                    fullWidth
                    name="encargado"
                    value={problemData.encargado}
                    onChange={handleChange}
                    error={!!errors.encargado}
                    helperText={errors.encargado}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.area}>
                    <InputLabel id="area-label">Área</InputLabel>
                    <Select
                      labelId="area-label"
                      name="area"
                      value={problemData.area}
                      onChange={handleChange}
                      label="Área"
                    >
                      <MenuItem value="">
                        <em>Seleccione un área</em>
                      </MenuItem>
                      <MenuItem value="Recibo">Recibo</MenuItem>
                      <MenuItem value="Inventarios">Inventarios</MenuItem>
                      <MenuItem value="Embarques">Embarques</MenuItem>
                      <MenuItem value="Paquetería">Paquetería</MenuItem>
                      <MenuItem value="Surtido">Surtido</MenuItem>
                      <MenuItem value="Desarrollo">Desarrollo</MenuItem>
                      <MenuItem value="Transportes">Transportes</MenuItem>
                    </Select>
                    {errors.area && (
                      <Typography variant="caption" color="error">
                        {errors.area}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción del problema"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={10}
                    name="descripcion"
                    value={problemData.descripcion}
                    onChange={handleChange}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="Quien envía el reporte"
                  variant="outlined"
                  fullWidth
                  name="remitente"
                  value={problemData.remitente}
                  onChange={handleChange}
                  error={!!errors.remitente}
                  helperText={errors.remitente}
                />
                {selectedCheck === "Surtidos" && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="No Pedido"
                        variant="outlined"
                        fullWidth
                        name="noPedido"
                        value={problemData.noPedido}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Turno"
                        variant="outlined"
                        fullWidth
                        name="turno"
                        value={problemData.turno}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                )}
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleSubmit}
                  sx={{ mt: 2 }}
                >
                  Enviar reporte
                </Button>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
      {activeTab === 1 && (
        <Box
          sx={{
            padding: "8px",
            borderRadius: "4px",
            marginTop: "20px",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Tabla de Reportes
          </Typography>

          <RepoTable />
        </Box>
      )}

      {/* Dialogo con la tabla de SKUs */}
      <TableSku
        open={showTableDialog}
        onClose={handleCloseTableDialog}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredData={filteredData}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSelectSku={handleSelectSku}
      />
    </Container>
  );
}

export default Repo_Prob;

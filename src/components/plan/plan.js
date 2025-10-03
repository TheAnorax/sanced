import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { blueGrey } from "@mui/material/colors";

const Plan = () => {
  const [planResumen, setPlanResumen] = useState([]);
  const [estados, setEstados] = useState(null); // 👈 para los datos de estados
  const [tabIndex, setTabIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📅 Fecha inicial
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toLocaleDateString("sv-SE")
  );

  // --- Obtener datos del plan ---
  const fetchPlanResumen = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://66.232.105.87:3007/api/plan/plan?fecha=${selectedDate}`
      );

      // 👇 ahora el backend devuelve { rutas, estados }
      setPlanResumen(response.data.rutas || []);
      setEstados(response.data.estados || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching plan resumen:", error);
      Swal.fire("Error", "Ocurrió un error al obtener el resumen del plan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanResumen();
  }, [selectedDate]);

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  );

  const formatTime = (date) => {
    if (!date) return "Nunca";
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value || 0);

  const getProgressColor = (avance) => {
    if (avance >= 100) return "success";
    if (avance >= 50) return "warning";
    return "error";
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          🚚 Resumen del plan del día
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fecha seleccionada: <strong>{selectedDate}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Última actualización: <strong>{formatTime(lastUpdated)}</strong>
        </Typography>

        {/* 👇 Aquí mostramos el total de pedidos */}
        {estados && (
          <Box mt={2} p={2} sx={{ bgcolor: blueGrey[50], borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              📦 Pedidos del plan: {estados.totalPedidosPlan}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No asignados: {estados.pedidosNoAsignados} | 
              En Surtido: {estados.pedidosEnSurtido} | 
              En Embarque: {estados.pedidosEnEmbarque} | 
              Finalizados: {estados.pedidosFinalizados}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 📅 Selector de fecha */}
      <Box mb={3}>
        <TextField
          label="Selecciona fecha"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Plan (Resumen)" />
        <Tab label="Detalle de Plan" />
        <Tab label="Faltantes de Plan" />
      </Tabs>

      {/* TAB 1 */}
      <TabPanel value={tabIndex} index={0}>
        {loading ? (
          <Alert severity="info">Cargando información...</Alert>
        ) : planResumen.length === 0 ? (
          <Alert severity="warning">No hay datos para esta fecha.</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: blueGrey[50] }}>
                <TableRow>
                  <TableCell><strong>Ruta</strong></TableCell>
                  <TableCell align="right"><strong>Total Clientes</strong></TableCell>
                  <TableCell align="right"><strong>Partidas</strong></TableCell>
                  <TableCell align="right"><strong>Partidas Surtido</strong></TableCell>
                  <TableCell align="right"><strong>Total Embarque</strong></TableCell>
                  <TableCell align="right"><strong>Total Piezas</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                  <TableCell align="center"><strong>Avance</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planResumen.map((ruta, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{ruta.routeName}</TableCell>
                    <TableCell align="right">{ruta.totalClientes}</TableCell>
                    <TableCell align="right">{ruta.totalPartidas}</TableCell>
                    <TableCell align="right">{ruta.partidasSurtidas}</TableCell>
                    <TableCell align="right">{ruta.partidasEmbarcadas}</TableCell>
                    <TableCell align="right">{ruta.totalPiezas}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(ruta.total)}
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 300 }}>
                      <Box display="flex" justifyContent="space-evenly" mb={1}>
                        <Typography variant="caption">🟡 {ruta.avanceSurtido}</Typography>
                        <Typography variant="caption">🔵 {ruta.avanceEmbarque}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                          🟢 {ruta.avanceFinalizado}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Number(String(ruta.avanceFinalizado || "0").replace("%", ""))}
                        color={getProgressColor(Number(String(ruta.avanceFinalizado || "0").replace("%", "")))}
                        sx={{ width: "100%", height: 10, borderRadius: 5 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Box>
  );
};

export default Plan;

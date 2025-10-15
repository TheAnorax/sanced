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
  Grid,
  Chip,
  Divider
} from "@mui/material";
import { blueGrey, green, red, orange } from "@mui/material/colors";
import Swal from "sweetalert2";
import UpdateIcon from "@mui/icons-material/Update";
import ScheduleIcon from "@mui/icons-material/Schedule";
import InventoryIcon from "@mui/icons-material/Inventory";

const Plan = () => {
  const [planResumen, setPlanResumen] = useState([]);
  const [detallePlan, setDetallePlan] = useState([]);
  const [faltantesPlan, setFaltantesPlan] = useState([]); // 👈 Nuevo estado para faltantes
  const [estados, setEstados] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toLocaleDateString("sv-SE")
  );

  const REFRESH_INTERVAL = 300; // 5 minutos
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  // 🔹 Función para comparar objetos/arreglos y evitar re-render
  const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // --- Obtener datos del resumen ---
  const fetchPlanResumen = async () => {
    try {
      const response = await axios.get(
        `http://66.232.105.87:3007/api/plan/plan?fecha=${selectedDate}`
      );
      if (!isEqual(response.data.rutas || [], planResumen)) {
        setPlanResumen(response.data.rutas || []);
      }
      if (!isEqual(response.data.estados || null, estados)) {
        setEstados(response.data.estados || null);
      }
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch (error) {
      console.error("Error fetching plan resumen:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error al obtener el resumen del plan.",
        "error"
      );
    }
  };

  // --- Obtener datos del detalle ---
  const fetchDetallePlan = async () => {
    try {
      const response = await axios.get(
        `http://66.232.105.87:3007/api/plan/datalle-plan?fecha=${selectedDate}`
      );
      if (!isEqual(response.data || [], detallePlan)) {
        setDetallePlan(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching detalle plan:", error);
    }
  };

  // --- Obtener datos de faltantes (últimos 15 días) ---
  const fetchFaltantesPlan = async () => {
    try {
      const response = await axios.get(
        `http://66.232.105.87:3007/api/plan/faltante-plan?dias=15`
      );
      setFaltantesPlan(response.data || []);
    } catch (error) {
      console.error("Error fetching faltantes plan:", error);
    }
  };

  // --- Carga inicial + intervalos ---
  useEffect(() => {
    fetchPlanResumen();
    fetchDetallePlan();
    fetchFaltantesPlan();

    const refreshInterval = setInterval(() => {
      fetchPlanResumen();
      fetchDetallePlan();
      fetchFaltantesPlan();
    }, REFRESH_INTERVAL * 1000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [selectedDate]);

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box p={2}>{children}</Box>}
      {/* 🔍 Buscador */}
<Box mb={2} display="flex" justifyContent="flex-end">
  <TextField
    label="Buscar pedido, cliente o ruta"
    variant="outlined"
    size="small"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    sx={{ width: 300 }}
  />
</Box>
 
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

  // 🟦 Tabla Faltantes compacta (para mostrar arriba)
  const renderFaltantesCompacto = () => {
    if (faltantesPlan.length === 0) {
      return (
        <Alert severity="warning">
          No se encontraron faltantes en los últimos 15 días.
        </Alert>
      );
    }

    // 🧮 Calcular total general
    const totalGeneral = faltantesPlan.reduce(
      (acc, item) => {
        acc.totalPedidos += item.totalPedidos || 0;
        acc.noAsignados += item.pedidosNoAsignados || 0;
        acc.surtido += item.pedidosEnSurtido || 0;
        acc.embarque += item.pedidosEnEmbarque || 0;
        acc.finalizados += item.pedidosFinalizados || 0;
        acc.montoPendientes += item.totalNoAsignados || 0;
        acc.montoTotalDia += item.totalDia || 0;
        return acc;
      },
      {
        totalPedidos: 0,
        noAsignados: 0,
        surtido: 0,
        embarque: 0,
        finalizados: 0,
        montoPendientes: 0,
        montoTotalDia: 0,
      }
    );

    return (
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 1,
          backgroundColor: blueGrey[50],
        }}
      >
        <Table
          size="small"
          sx={{
            "& th, & td": { py: 0.4, px: 1 }, // 👈 reduce alto de filas
            "& thead th": { fontSize: "0.8rem" },
            "& tbody td": { fontSize: "0.8rem" },
          }}
        >
          <TableHead sx={{ bgcolor: blueGrey[100] }}>
            <TableRow>
              <TableCell>
                <strong>Fecha</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Total Pedidos</strong>
              </TableCell>
              <TableCell align="right">
                <strong>No asignados</strong>
              </TableCell>
              <TableCell align="right">
                <strong>En Surtido</strong>
              </TableCell>
              <TableCell align="right">
                <strong>En Embarque</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Finalizados</strong>
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "#d32f2f", fontWeight: "bold" }}
              >
                💰 Pendientes ($)
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "#1976d2", fontWeight: "bold" }}
              >
                💰 Total Día ($)
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {faltantesPlan.map((f, idx) => (
              <TableRow key={idx}>
                <TableCell>{f.fecha}</TableCell>
                <TableCell align="right">{f.totalPedidos}</TableCell>
                <TableCell align="right">{f.pedidosNoAsignados}</TableCell>
                <TableCell align="right">{f.pedidosEnSurtido}</TableCell>
                <TableCell align="right">{f.pedidosEnEmbarque}</TableCell>
                <TableCell align="right">{f.pedidosFinalizados}</TableCell>
                <TableCell align="right" sx={{ color: "#d32f2f" }}>
                  {formatCurrency(f.totalNoAsignados)}
                </TableCell>
                <TableCell align="right" sx={{ color: "#1976d2" }}>
                  {formatCurrency(f.totalDia)}
                </TableCell>
              </TableRow>
            ))}

            {/* 🧮 Fila de Total General */}
            <TableRow sx={{ bgcolor: blueGrey[100], fontWeight: "bold" }}>
              <TableCell>
                <strong>Total General</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{totalGeneral.totalPedidos}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{totalGeneral.noAsignados}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{totalGeneral.surtido}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{totalGeneral.embarque}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{totalGeneral.finalizados}</strong>
              </TableCell>
              <TableCell align="right" sx={{ color: "#d32f2f" }}>
                <strong>{formatCurrency(totalGeneral.montoPendientes)}</strong>
              </TableCell>
              <TableCell align="right" sx={{ color: "#1976d2" }}>
                <strong>{formatCurrency(totalGeneral.montoTotalDia)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
     {/* 🧭 Encabezado general optimizado */}
      <Box sx={{ mb: 2 }}>
        {/* 🔹 Encabezado superior */}
        <Grid container spacing={2} alignItems="flex-start" justifyContent="space-between">
          {/* 🕒 Izquierda: actualización, contador y selector */}
          
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                <Chip
                  icon={<UpdateIcon />}
                  label={`Última actualización: ${formatTime(lastUpdated)}`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
                <Chip
                  icon={<ScheduleIcon />}
                  label={`Próxima en ${countdown}s`}
                  size="small"
                  color={countdown <= 10 ? "error" : countdown <= 20 ? "warning" : "success"}
                />
              </Box>
              <TextField
                label="Selecciona fecha"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ width: 200 }}
              />
            </Box>
          </Grid>

          {/* 📊 Derecha: resumen visual compacto sin tabla */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: "#f5f7fa",
                borderRadius: 2,
                boxShadow: 1,
                p: 1,
                overflowY: "auto",
                maxHeight: 240,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  color: blueGrey[800],
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                📅 Resumen últimos días
              </Typography>

              {faltantesPlan.length === 0 ? (
                <Alert severity="info" sx={{ mb: 1 }}>
                  No se encontraron registros recientes.
                </Alert>
              ) : (
                <Box display="flex" flexDirection="column" gap={0.4}>
                  {/* Encabezado */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr repeat(5, 58px)",
                      alignItems: "center",
                      backgroundColor: blueGrey[50],
                      borderRadius: 1,
                      px: 1,
                      py: 0.4,
                      fontSize: "0.74rem",
                      fontWeight: "bold",
                      color: blueGrey[900],
                    }}
                  >
                    <span>Fecha</span>
                    <span >Total</span>
                    <span>No Asig.</span>
                    <span>Surtido</span>
                    <span>Embarque</span>
                    <span>Finaliz.</span>
                  </Box>

                  {/* Filas */}
                  {faltantesPlan.map((f, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr repeat(5, 58px)",
                        alignItems: "center",
                        px: 1,
                        py: 0.25,
                        fontSize: "0.74rem",
                        borderRadius: 1,
                        bgcolor: idx % 2 === 0 ? "#fff" : blueGrey[50],
                      }}
                    >
                      <Typography variant="body2" sx={{ color: blueGrey[900], fontSize: "0.74rem" }}>
                        {f.fecha}
                      </Typography>
                      <Typography align="right" sx={{ fontSize: "0.74rem" }}>
                        {f.totalPedidos}
                      </Typography>
                      <Typography
                        align="right"
                        sx={{ color: red[700], fontWeight: 500, fontSize: "0.74rem" }}
                      >
                        {f.pedidosNoAsignados}
                      </Typography>
                      <Typography
                        align="right"
                        sx={{ color: orange[800], fontWeight: 500, fontSize: "0.74rem" }}
                      >
                        {f.pedidosEnSurtido}
                      </Typography>
                      <Typography
                        align="right"
                        sx={{ color: blueGrey[700], fontWeight: 500, fontSize: "0.74rem" }}
                      >
                        {f.pedidosEnEmbarque}
                      </Typography>
                      <Typography
                        align="right"
                        sx={{ color: green[700], fontWeight: 600, fontSize: "0.74rem" }}
                      >
                        {f.pedidosFinalizados}
                      </Typography>
                    </Box>
                  ))}

                  {/* Total general */}
                  {(() => {
                    const totalGeneral = faltantesPlan.reduce(
                      (acc, item) => {
                        acc.totalPedidos += item.totalPedidos || 0;
                        acc.noAsignados += item.pedidosNoAsignados || 0;
                        acc.surtido += item.pedidosEnSurtido || 0;
                        acc.embarque += item.pedidosEnEmbarque || 0;
                        acc.finalizados += item.pedidosFinalizados || 0;
                        return acc;
                      },
                      {
                        totalPedidos: 0,
                        noAsignados: 0,
                        surtido: 0,
                        embarque: 0,
                        finalizados: 0,
                      }
                    );

                    return (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr repeat(5, 58px)",
                          alignItems: "center",
                          px: 1,
                          py: 0.4,
                          fontSize: "0.74rem",
                          borderRadius: 1,
                          bgcolor: blueGrey[100],
                          fontWeight: "bold",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: "0.74rem" }}>
                          Total
                        </Typography>
                        <Typography align="right" sx={{ fontSize: "0.74rem" }}>
                          {totalGeneral.totalPedidos}
                        </Typography>
                        <Typography align="right" sx={{ color: red[700], fontSize: "0.74rem" }}>
                          {totalGeneral.noAsignados}
                        </Typography>
                        <Typography align="right" sx={{ color: orange[800], fontSize: "0.74rem" }}>
                          {totalGeneral.surtido}
                        </Typography>
                        <Typography align="right" sx={{ color: blueGrey[700], fontSize: "0.74rem" }}>
                          {totalGeneral.embarque}
                        </Typography>
                        <Typography align="right" sx={{ color: green[700], fontSize: "0.74rem" }}>
                          {totalGeneral.finalizados}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              )}
            </Box>
          </Grid>


        </Grid>

        {/* 🧾 Título centrado */}
        <Box mt={2} mb={1} textAlign="center">
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: blueGrey[800],
            }}
          >
            🚚 Resumen del plan del día
          </Typography>
        </Box>

        {/* 🔸 Chips de estado (centrados bajo el título) */}
        {estados && (
          <Grid container justifyContent="center" spacing={1.2} sx={{ mb: 2 }}>
            <Grid item>
              <Chip
                label={`Pedidos: ${estados.totalPedidosPlan || 0}`}
                size="small"
                color="primary"
              />
            </Grid>
            <Grid item>
              <Chip
                label={`No asignados: ${estados.pedidosNoAsignados}`}
                size="small"
                sx={{ bgcolor: red[100] }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`En Surtido: ${estados.pedidosEnSurtido}`}
                size="small"
                sx={{ bgcolor: orange[100] }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`En Embarque: ${estados.pedidosEnEmbarque}`}
                size="small"
                sx={{ bgcolor: blueGrey[100] }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Finalizados: ${estados.pedidosFinalizados}`}
                size="small"
                sx={{ bgcolor: green[100] }}
              />
            </Grid>
          </Grid>
        )}
      </Box>


      {/* Tabs */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Plan (Resumen)" />
        <Tab label="Detalle de Plan" />
        <Tab label="Faltantes de Plan" />
      </Tabs>

      {/* TAB 1 - Resumen */}
      <TabPanel value={tabIndex} index={0}>
        {loading ? (
          <Alert severity="info">Cargando información...</Alert>
        ) : planResumen.length === 0 ? (
          <Alert severity="warning">No hay datos para esta fecha.</Alert>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: 3 }}
          >
            <Table>
              <TableHead sx={{ bgcolor: blueGrey[50] }}>
                <TableRow>
                  <TableCell>
                    <strong>Ruta</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total Clientes</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Partidas</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Partidas Surtido</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total Embarque</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total Piezas</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Avance</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planResumen.map((ruta, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{ruta.routeName}</TableCell>
                    <TableCell align="right">{ruta.totalClientes}</TableCell>
                    <TableCell align="right">{ruta.totalPartidas}</TableCell>
                    <TableCell align="right">{ruta.partidasSurtidas}</TableCell>
                    <TableCell align="right">
                      {ruta.partidasEmbarcadas}
                    </TableCell>
                    <TableCell align="right">{ruta.totalPiezas}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(ruta.total)}
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 300 }}>
                      <Box display="flex" justifyContent="space-evenly" mb={1}>
                        <Typography variant="caption">
                          🟡 {ruta.avanceSurtido}
                        </Typography>
                        <Typography variant="caption">
                          🔵 {ruta.avanceEmbarque}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", color: "#2e7d32" }}
                        >
                          🟢 {ruta.avanceFinalizado}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Number(
                          String(ruta.avanceFinalizado || "0").replace("%", "")
                        )}
                        color={getProgressColor(
                          Number(
                            String(ruta.avanceFinalizado || "0").replace(
                              "%",
                              ""
                            )
                          )
                        )}
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

      {/* TAB 2 - Detalle */}
      <TabPanel value={tabIndex} index={1}>

        
        {detallePlan.length === 0 ? (
          <Alert severity="warning">No hay detalle para esta fecha.</Alert>
        ) : (

          
          detallePlan.map((ruta, idx) => (
            <Box key={idx} mb={5}>
              {/* 🔹 Encabezado de la ruta */}
              <Box
                p={2}
                mb={2}
                sx={{
                  bgcolor: blueGrey[50],
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  🚛 {ruta.routeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clientes: <strong>{ruta.totalClientes}</strong> | Pedidos:{" "}
                  <strong>{ruta.pedidos.length}</strong> | Partidas:{" "}
                  <strong>{ruta.totalPartidas}</strong> | Surtidas:{" "}
                  <strong>{ruta.partidasSurtidas}</strong> | Embarcadas:{" "}
                  <strong>{ruta.partidasEmbarcadas}</strong> | Piezas:{" "}
                  <strong>{ruta.totalPiezas}</strong> | Total:{" "}
                  <strong>{formatCurrency(ruta.total)}</strong>
                </Typography>
              </Box>

              {/* 🔹 Tabla con los pedidos de la ruta */}
              <TableContainer
                component={Paper}
                sx={{ borderRadius: 2, boxShadow: 3 }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: blueGrey[50] }}>
                    <TableRow>
                      <TableCell align="center"><strong>#</strong></TableCell>
                      <TableCell><strong>Pedido</strong></TableCell>
                      <TableCell><strong>Tipo</strong></TableCell>                      
                      <TableCell><strong>Factura</strong></TableCell>
                      <TableCell><strong>Cliente</strong></TableCell>
                      <TableCell align="right"><strong>Partidas</strong></TableCell>
                      <TableCell align="right"><strong>Piezas</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                      <TableCell align="center"><strong>Estado / Avance</strong></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {ruta.pedidos.map((pedido, i) => {
                     // --- Avances individuales ---
const avanceSurtidoNum = Number(pedido.avanceSurtido.replace("%", "")) || 0;
const avanceEmbarqueNum = Number(pedido.avanceEmbarque.replace("%", "")) || 0;
const avanceFinalizadoNum = Number(pedido.avanceFinalizado.replace("%", "")) || 0;

let avanceGeneral = 0;

// --- Etapas ponderadas ---
if (pedido.estado_pedido?.toLowerCase() === "finalizado") {
  avanceGeneral = 100;
} else if (
  pedido.estado_pedido?.toLowerCase() === "embarque" ||
  pedido.estado_pedido?.toLowerCase() === "embarcando"
) {
  // Primera mitad = surtido completo (50%)
  // Segunda mitad = progreso real del embarque
  avanceGeneral = 50 + (avanceEmbarqueNum / 2);
} else if (
  pedido.estado_pedido?.toLowerCase() === "surtiendo" ||
  pedido.estado_pedido?.toLowerCase() === "surtido"
) {
  // Avance solo del surtido (mitad de la barra)
  avanceGeneral = avanceSurtidoNum / 2;
} else {
  // Sin asignar
  avanceGeneral = 0;
}


                      // 🎨 Color del estado según su valor
                      const getEstadoColor = (estado) => {
                        switch (estado?.toLowerCase()) {
                          case "surtido":
                            return blueGrey[900]; // negro
                          case "embarque":
                            return orange[700];
                          case "embarcando":
                            return "#1565C0"; // azul fuerte
                          case "finalizado":
                            return green[700];
                          case "sin asignar":
                          default:
                            return red[700];
                        }
                      };

                      return (
                        <TableRow key={i}>
                          <TableCell align="center">{i + 1}</TableCell>
                          <TableCell>{pedido.no_orden}</TableCell>
                          <TableCell>{pedido.tipo_original}</TableCell>
                          <TableCell>{pedido.factura}</TableCell>
                          <TableCell>{pedido.nombre_cliente}</TableCell>
                          <TableCell align="right">{pedido.PARTIDAS}</TableCell>
                          <TableCell align="right">{pedido.PIEZAS}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {formatCurrency(pedido.TOTAL)}
                          </TableCell>

                          <TableCell align="center" sx={{ minWidth: 260 }}>
                            {/* 🟦 Estado arriba */}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                color: getEstadoColor(pedido.estado_pedido),
                                mb: 0.5,
                              }}
                            >
                              {pedido.estado_pedido?.toUpperCase() || "SIN ASIGNAR"}
                            </Typography>

                            {/* 🔄 Barras de avance */}
                            <Box display="flex" justifyContent="space-evenly" mb={1}>
                              <Typography variant="caption">
                                🟡 {pedido.avanceSurtido}
                              </Typography>
                              <Typography variant="caption">
                                🔵 {pedido.avanceEmbarque}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: "bold", color: "#2e7d32" }}
                              >
                                🟢 {pedido.avanceFinalizado}
                              </Typography>
                            </Box>

                            <LinearProgress
  variant="determinate"
  value={avanceGeneral}
  color={getProgressColor(avanceGeneral)}
  sx={{ width: "100%", height: 8, borderRadius: 5 }}
/>

                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}
      </TabPanel>


      {/* TAB 3 - Faltantes */}
<TabPanel value={tabIndex} index={2}>
  {faltantesPlan.length === 0 ? (
    <Alert severity="warning">
      No se encontraron faltantes en los últimos 15 días.
    </Alert>
  ) : (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        mt: 2,
      }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: blueGrey[50] }}>
          <TableRow>
            <TableCell><strong>Fecha</strong></TableCell>
            <TableCell align="right"><strong>Total Pedidos</strong></TableCell>
            <TableCell align="right"><strong>No asignados</strong></TableCell>
            <TableCell align="right"><strong>En Surtido</strong></TableCell>
            <TableCell align="right"><strong>En Embarque</strong></TableCell>
            <TableCell align="right"><strong>Finalizados</strong></TableCell>
            <TableCell align="right"><strong>Sin Ruta</strong></TableCell>
            <TableCell align="right" sx={{ color: "#d32f2f", fontWeight: "bold" }}>
              💰 Pendientes ($)
            </TableCell>
            <TableCell align="right" sx={{ color: "#0288d1", fontWeight: "bold" }}>
              💰 Sin Ruta ($)
            </TableCell>
            <TableCell align="right" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              💰 Total Día ($)
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {faltantesPlan.map((f, idx) => (
            <TableRow key={idx}>
              <TableCell>{f.fecha}</TableCell>
              <TableCell align="right">{f.totalPedidos}</TableCell>
              <TableCell align="right">{f.pedidosNoAsignados}</TableCell>
              <TableCell align="right">{f.pedidosEnSurtido}</TableCell>
              <TableCell align="right">{f.pedidosEnEmbarque}</TableCell>
              <TableCell align="right">{f.pedidosFinalizados}</TableCell>
              <TableCell align="right">{f.pedidosSinRuta}</TableCell>

              {/* 💰 Totales por tipo */}
              <TableCell align="right" sx={{ color: "#d32f2f", fontWeight: 500 }}>
                {formatCurrency(f.totalNoAsignados)}
              </TableCell>
              <TableCell align="right" sx={{ color: "#0288d1", fontWeight: 500 }}>
                {formatCurrency(f.totalSinRuta)}
              </TableCell>
              <TableCell align="right" sx={{ color: "#1976d2", fontWeight: 500 }}>
                {formatCurrency(f.totalDia)}
              </TableCell>
            </TableRow>
          ))}

          {/* 🧮 Fila de totales generales */}
          {(() => {
            const totalGeneral = faltantesPlan.reduce(
              (acc, item) => {
                acc.totalPedidos += item.totalPedidos || 0;
                acc.noAsignados += item.pedidosNoAsignados || 0;
                acc.surtido += item.pedidosEnSurtido || 0;
                acc.embarque += item.pedidosEnEmbarque || 0;
                acc.finalizados += item.pedidosFinalizados || 0;
                acc.sinRuta += item.pedidosSinRuta || 0;
                acc.montoPendientes += item.totalNoAsignados || 0;
                acc.montoSinRuta += item.totalSinRuta || 0;
                acc.montoTotalDia += item.totalDia || 0;
                return acc;
              },
              {
                totalPedidos: 0,
                noAsignados: 0,
                surtido: 0,
                embarque: 0,
                finalizados: 0,
                sinRuta: 0,
                montoPendientes: 0,
                montoSinRuta: 0,
                montoTotalDia: 0,
              }
            );

            return (
              <TableRow sx={{ bgcolor: blueGrey[100] }}>
                <TableCell><strong>Total General</strong></TableCell>
                <TableCell align="right"><strong>{totalGeneral.totalPedidos}</strong></TableCell>
                <TableCell align="right"><strong>{totalGeneral.noAsignados}</strong></TableCell>
                <TableCell align="right"><strong>{totalGeneral.surtido}</strong></TableCell>
                <TableCell align="right"><strong>{totalGeneral.embarque}</strong></TableCell>
                <TableCell align="right"><strong>{totalGeneral.finalizados}</strong></TableCell>
                <TableCell align="right"><strong>{totalGeneral.sinRuta}</strong></TableCell>
                <TableCell align="right" sx={{ color: "#d32f2f", fontWeight: "bold" }}>
                  {formatCurrency(totalGeneral.montoPendientes)}
                </TableCell>
                <TableCell align="right" sx={{ color: "#0288d1", fontWeight: "bold" }}>
                  {formatCurrency(totalGeneral.montoSinRuta)}
                </TableCell>
                <TableCell align="right" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                  {formatCurrency(totalGeneral.montoTotalDia)}
                </TableCell>
              </TableRow>
            );
          })()}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</TabPanel>

    </Box>
  );
};

export default Plan;

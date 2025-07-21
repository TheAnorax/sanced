import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Extender dayjs para manejar zona horaria
dayjs.extend(utc);
dayjs.extend(timezone);

function Plansurtido() {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz("America/Mexico_City")
  );
  const [loading, setLoading] = useState(false);
  const [surtidores, setSurtidores] = useState(8); // Valor inicial

  const fetchPaqueteria = async (fecha) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.3.154:3007/api/Trasporte/getPaqueteriaData?fecha=${fecha}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener datos de paquetería:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumen = async (fecha) => {
    try {
      const response = await axios.get(
        `http://192.168.3.154:3007/api/Trasporte/getPedidosDia?fecha=${fecha}`
      );
      setResumen(response.data);
    } catch (error) {
      console.error("Error al obtener resumen del día:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dateStr = selectedDate.format("YYYY-MM-DD");
      try {
        await Promise.all([fetchPaqueteria(dateStr), fetchResumen(dateStr)]);
      } catch (err) {
        console.error("Error fetching datos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  const obtenerResumenPorStatus = () => {
    const conteo = {
      surtido: 0,
      embarques: 0,
      finalizado: 0,
      sin_asignar: 0,
    };

    data.forEach((grupo) => {
      grupo.pedidos.forEach((pedido) => {
        // Considerar fusión
        const fusion = grupo.pedidos.find(
          (p) =>
            p.fusion &&
            p.fusion.split("-").includes(String(pedido.no_orden)) &&
            p.no_orden !== pedido.no_orden
        );
        const tabla = (fusion?.tablaOrigen || pedido.tablaOrigen || "")
          .trim()
          .toLowerCase();

        if (tabla === "surtido") conteo.surtido += 1;
        else if (tabla === "embarques") conteo.embarques += 1;
        else if (tabla === "finalizado") conteo.finalizado += 1;
        else conteo.sin_asignar += 1;
      });
    });

    return conteo;
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Planificación
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Plan del Día" />
        <Tab label="Plan de Surtido" />
      </Tabs>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <DatePicker
            label="Seleccionar Fecha"
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue) {
                const convertedDate = dayjs(newValue);
                setSelectedDate(convertedDate.tz("America/Mexico_City"));
              }
            }}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ maxWidth: 240 }} />
            )}
          />
        </Box>
      </LocalizationProvider>

      <Box sx={{ mt: 2, mb: 2, maxWidth: 200 }}>
        <TextField
          type="number"
          label="Surtidores"
          value={surtidores}
          onChange={(e) => setSurtidores(Number(e.target.value))}
          fullWidth
        />
      </Box>

      {/* Tab 0: Plan del Día */}
      {tabIndex === 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Resumen del plan del día
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : resumen.length === 0 ? (
            <Typography sx={{ mt: 2, ml: 2 }}>
              No se han cargado datos de los pedidos.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Ruta</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Clientes</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Partidas</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Piezas</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Avance</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tiempo Estimado de Surtido</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumen.map((ruta, idx) => {
                    const totalMin =
                      (ruta.totalPartidas / (30 * surtidores)) * 60;
                    const horas = Math.floor(totalMin / 60);
                    const minutos = Math.round(totalMin % 60);
                    const tiempoEstimado =
                      surtidores > 0
                        ? `${horas}h ${minutos}m (${surtidores} personas a 30 líneas/hr)`
                        : "—";

                    return (
                      <TableRow key={idx}>
                        <TableCell>{ruta.routeName}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-MX").format(
                            ruta.totalClientes
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-MX").format(
                            ruta.totalPartidas
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-MX").format(
                            ruta.totalPiezas
                          )}
                        </TableCell>

                        <TableCell>
                          {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          }).format(ruta.total)}
                        </TableCell>
                        <TableCell>{ruta.avance}</TableCell>
                        <TableCell>{tiempoEstimado}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Tab 1: Plan de Surtido */}
      {tabIndex === 1 && (
        <Box mt={4}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : resumen.length === 0 ? (
            <Typography sx={{ mt: 2, ml: 2 }}>
              No se han cargado datos de los pedidos.
            </Typography>
          ) : (
            <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">Resumen de Pedidos por Estado</Typography>
                  {(() => {
                    const resumenStatus = obtenerResumenPorStatus();
                    return (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item><strong>Surtido:</strong> {resumenStatus.surtido}</Grid>
                        <Grid item><strong>Embarques:</strong> {resumenStatus.embarques}</Grid>
                        <Grid item><strong>Finalizado:</strong> {resumenStatus.finalizado}</Grid>
                        <Grid item><strong>No Asignado:</strong> {resumenStatus.sin_asignar}</Grid>
                      </Grid>
                    );
                  })()}
                </Box>
                {data.map((grupo, index) => (
              <Box key={index} mb={4}>
                <Typography variant="h6" gutterBottom>
                  Ruta: {grupo.routeName}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Orden</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Fusionado</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Partidas</TableCell>
                        <TableCell>Piezas</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Porcentaje</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grupo.pedidos.map((pedido) => {
                        // Buscar si este pedido está fusionado dentro de otro
                        const pedidoFusionado = grupo.pedidos.find(
                          (p) =>
                            p.fusion &&
                            p.fusion
                              .split("-")
                              .includes(String(pedido.no_orden)) &&
                            p.no_orden !== pedido.no_orden
                        );

                        // Si encontró que este pedido está fusionado en otro, hereda los datos
                        const avanceFinal = pedidoFusionado
                          ? pedidoFusionado.avance
                          : pedido.avance;
                        const tablaOrigenFinal = pedidoFusionado
                          ? pedidoFusionado.tablaOrigen
                          : pedido.tablaOrigen;
                        const estadoFinal = pedidoFusionado
                          ? pedidoFusionado.ESTADO
                          : pedido.ESTADO;
                        const tipoFinal = pedidoFusionado
                          ? pedidoFusionado.tipo_encontrado ||
                            pedidoFusionado.tipo_original
                          : pedido.tipo_encontrado || pedido.tipo_original;

                        return (
                          <TableRow key={pedido.id}>
                            <TableCell>{pedido.no_orden}</TableCell>
                            <TableCell>{tipoFinal}</TableCell>
                            <TableCell>{pedido.fusion}</TableCell>
                            <TableCell>{pedido.nombre_cliente}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("es-MX", {
                                style: "currency",
                                currency: "MXN",
                              }).format(pedido.TOTAL)}
                            </TableCell>
                            <TableCell>{pedido.PARTIDAS}</TableCell>
                            <TableCell>{pedido.PIEZAS}</TableCell>
                            <TableCell>{estadoFinal}</TableCell>
                            <TableCell>{avanceFinal}</TableCell>
                            <TableCell
                              sx={{
                                color: (() => {
                                  const tabla = (tablaOrigenFinal || "")
                                    .trim()
                                    .toLowerCase();
                                  if (tabla === "surtido") return "black";
                                  if (tabla === "embarques") return "blue";
                                  if (tabla === "finalizado") return "green";
                                  return "red";
                                })(),
                                fontWeight: "bold",
                              }}
                            >
                              {tablaOrigenFinal || "No Asignado"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Plansurtido;

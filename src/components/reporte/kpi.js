import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  Grid,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Tabs, Tab } from "@mui/material";

import {
  ListAlt,
  Timer,
  DirectionsCar,
  PrecisionManufacturing,
} from "@mui/icons-material";

dayjs.extend(utc);
dayjs.extend(timezone);

function KpiDashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [dataSurtido, setDataSurtido] = useState(null);
  const [dataMontacargas, setDataMontacargas] = useState(null);
  const [dataPaqueteria, setDataPaqueteria] = useState(null);
  const [dataEmbarques, setDataEmbarques] = useState(null);
  const [dataRecibo, setDataRecibo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  // Estados de carga y errores
  const [loadingSurtido, setLoadingSurtido] = useState(true);
  const [loadingMontacargas, setLoadingMontacargas] = useState(true);
  const [loadingPaqueteria, setLoadingPaqueteria] = useState(true);
  const [loadingEmbarques, setLoadingEmbarques] = useState(true);
  const [loadingRecibo, setLoadingRecibo] = useState(true);

  const [errorSurtido, setErrorSurtido] = useState(null);
  const [errorMontacargas, setErrorMontacargas] = useState(null);
  const [errorPaqueteria, setErrorPaqueteria] = useState(null);
  const [errorEmbarques, setErrorEmbarques] = useState(null);
  const [errorRecibo, setErrorRecibo] = useState(null);
  const [historico, setHistorico] = useState({});
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [rangoInicio, setRangoInicio] = useState(dayjs().startOf("month"));
  const [rangoFin, setRangoFin] = useState(dayjs().endOf("month"));

  const [resumenPaqueteria, setResumenPaqueteria] = useState([]);

  useEffect(() => {
    fetchSurtidoData(selectedDate);
    fetchMontacargasData(selectedDate); // ← aquí lo pasas
    fetchPaqueteriaData(selectedDate);
    fetchEmbarquesData(selectedDate);
    fetchReciboData(selectedDate);
  }, [selectedDate]);

  const fetchSurtidoData = async (date) => {
    setLoadingSurtido(true);
    setErrorSurtido(null);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(
        `http://66.232.105.87:3007/api/kpi/getPrduSurtido`,
        {
          params: { date: formattedDate },
        }
      );
      setDataSurtido(response.data);
    } catch (err) {
      setErrorSurtido("Error al obtener los datos de Surtido");
    } finally {
      setLoadingSurtido(false);
    }
  };

  const fetchMontacargasData = async (date) => {
    setLoadingMontacargas(true);
    setErrorMontacargas(null);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(
        `http://66.232.105.87:3007/api/historial/kpi`,
        {
          params: { date: formattedDate },
        }
      );
      const groupedData = groupByTurno(response.data);
      setDataMontacargas(groupedData);
    } catch (err) {
      setErrorMontacargas("Error al obtener los datos de Montacargas");
    } finally {
      setLoadingMontacargas(false);
    }
  };

  const fetchPaqueteriaData = async () => {
    setLoadingPaqueteria(true);
    setErrorPaqueteria(null);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await axios.get(
        `http://66.232.105.87:3007/api/kpi/getPrduPaqueteria`,
        {
          params: { date: formattedDate },
        }
      );
      setDataPaqueteria(response.data);
    } catch (err) {
      setErrorPaqueteria("Error al obtener los datos de Paquetería");
    } finally {
      setLoadingPaqueteria(false);
    }
  };

  // API de Embarques
  const fetchEmbarquesData = async () => {
    setLoadingEmbarques(true);
    setErrorEmbarques(null);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await axios.get(
        `http://66.232.105.87:3007/api/kpi/getPrduEmbarque`,
        {
          params: { date: formattedDate },
        }
      );
      setDataEmbarques(response.data);
    } catch (err) {
      setErrorEmbarques("Error al obtener los datos de Embarques");
    } finally {
      setLoadingEmbarques(false);
    }
  };

  const fetchReciboData = async () => {
    setLoadingRecibo(true);
    setErrorRecibo(null);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await axios.get(
        `http://66.232.105.87:3007/api/kpi/getPrduRecibo`,
        {
          params: { date: formattedDate },
        }
      );
      setDataRecibo(response.data);
    } catch (err) {
      setErrorRecibo("Error al obtener los datos de Recibo");
    } finally {
      setLoadingRecibo(false);
    }
  };

  const groupByTurno = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.turno]) acc[item.turno] = [];
      acc[item.turno].push(item);
      return acc;
    }, {});
  };

  const renderKpiCard = (icon, label, value) => (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          p: 1.5,
          textAlign: "center",
          boxShadow: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          ":hover": { boxShadow: 4, transform: "scale(1.01)" },
        }}
      >
        {icon}
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          {value}
        </Typography>
      </Card>
    </Grid>
  );

  const renderSurtidoTurno = (turnoData, titulo) => (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        variant="outlined"
        sx={{
          boxShadow: 3,
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
        >
          {titulo}
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#ff9800" }} />,
            "Total Partidas",
            turnoData.kpis.total_pedidos
          )}
          {renderKpiCard(
            <DirectionsCar sx={{ fontSize: 25, color: "#9c27b0" }} />,
            "Total Piezas",
            turnoData.kpis.total_productos_surtidos
          )}
          {renderKpiCard(
            <Timer sx={{ fontSize: 25, color: "#f44336" }} />,
            "Tiempo General",
            turnoData.kpis.tiempo_trabajo
          )}
        </Grid>
      </Card>
    </Grid>
  );

  const renderMontacargasTurno = (turnoData, titulo) => (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        variant="outlined"
        sx={{
          boxShadow: 3,
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
        >
          {titulo}
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {turnoData.map((entry, index) =>
            renderKpiCard(
              <PrecisionManufacturing
                sx={{ fontSize: 25, color: "#1976d2" }}
              />,
              entry.usuario,
              entry.total_movimientos
            )
          )}
        </Grid>
      </Card>
    </Grid>
  );

  const renderPaqueteria = () => (
    <Grid item xs={12} md={6}>
      <Card
        variant="outlined"
        sx={{
          boxShadow: 3,
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
        >
          Paquetería
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#ff9800" }} />,
            "Total Partidas",
            dataPaqueteria?.total_partidas || 0
          )}
          {renderKpiCard(
            <DirectionsCar sx={{ fontSize: 25, color: "#9c27b0" }} />,
            "Total Piezas",
            dataPaqueteria?.total_piezas || 0
          )}
          {renderKpiCard(
            <Timer sx={{ fontSize: 25, color: "#f44336" }} />,
            "Tiempo Total",
            dataPaqueteria?.tiempo_total_trabajo || "00:00:00"
          )}
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#4caf50" }} />,
            "Total Facturado",
            `$${dataPaqueteria?.total_facturado || "0.00"}`
          )}
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#03a9f4" }} />,
            "Total Pedidos",
            dataPaqueteria?.total_pedidos || 0
          )}
        </Grid>
      </Card>
    </Grid>
  );

  const renderTurno = (turnoData, titulo) => (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        variant="outlined"
        sx={{
          boxShadow: 3,
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
        >
          {titulo}
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#ff9800" }} />,
            "Total Partidas",
            turnoData.total_partidas
          )}
          {renderKpiCard(
            <DirectionsCar sx={{ fontSize: 25, color: "#9c27b0" }} />,
            "Total Piezas",
            turnoData.total_piezas
          )}
          {renderKpiCard(
            <Timer sx={{ fontSize: 25, color: "#f44336" }} />,
            "Tiempo Total",
            turnoData.tiempo_total_trabajo
          )}
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#4caf50" }} />,
            "Total Facturado",
            `$${turnoData.total_facturado || "0.00"}`
          )}
        </Grid>
      </Card>
    </Grid>
  );

  const buildChartData = () => {
    const fechas = Object.keys(historico).sort();
    const turnos = ["turno1", "turno2", "turno3"];
    const colores = ["#1976d2", "#ff9800", "#4caf50"]; // Turno 1, 2, 3

    const datasets = turnos.map((turno, index) => ({
      label: `Turno ${turno.slice(-1)}`,
      data: fechas.map(
        (fecha) => historico[fecha]?.[turno]?.kpis?.total_partidas || 0
      ),
      backgroundColor: colores[index],
    }));

    return {
      labels: fechas,
      datasets,
    };
  };

  const fetchHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/kpi/getPrduSurtidoPorRango",
        {
          params: {
            inicio: rangoInicio.format("YYYY-MM-DD"),
            fin: rangoFin.format("YYYY-MM-DD"),
          },
        }
      );
      setHistorico(response.data.resumen);
    } catch (error) {
      console.error("❌ Error al obtener histórico:", error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchHistorico();
      fetchHistoricoPaqueteria(); // ← aquí
    }
  }, [activeTab, rangoInicio, rangoFin]);

  const exportarHistoricoSurtido = () => {
    const rows = [];

    Object.entries(historico).forEach(([fecha, turnos]) => {
      ["turno1", "turno2", "turno3"].forEach((turno) => {
        const dataTurno = turnos[turno];
        if (dataTurno) {
          rows.push({
            Fecha: fecha,
            Turno: turno.toUpperCase(),
            "Total Partidas": dataTurno.kpis.total_partidas,
            "Total Piezas": dataTurno.kpis.total_productos_surtidos,
            "Tiempo Trabajo": dataTurno.kpis.tiempo_trabajo,
          });
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Histórico Surtido");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `Historico_Surtido_${rangoInicio.format("YYYYMMDD")}_a_${rangoFin.format(
        "YYYYMMDD"
      )}.xlsx`
    );
  };

  const fetchHistoricoPaqueteria = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/kpi/getPrduPaqueteriaPorrango",
        {
          params: {
            inicio: rangoInicio.format("YYYY-MM-DD"),
            fin: rangoFin.format("YYYY-MM-DD"),
          },
        }
      );
      setResumenPaqueteria(response.data.resumen_diario || []);
    } catch (error) {
      console.error("❌ Error al obtener el histórico de paquetería:", error);
    }
  };
  const buildChartPaqueteria = () => {
    const fechas = resumenPaqueteria.map((item) =>
      dayjs(item.fecha).format("YYYY-MM-DD")
    );

    const partidas = resumenPaqueteria.map((item) => item.total_partidas);

    return {
      labels: fechas,
      datasets: [
        {
          label: "Total Partidas",
          data: partidas,
          backgroundColor: "#2196f3",
        },
      ],
    };
  };

  const renderRecibo = () => (
    <Grid item xs={12} md={4}>
      <Card
        variant="outlined"
        sx={{
          boxShadow: 3,
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
        >
          Recibo
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {renderKpiCard(
            <ListAlt sx={{ fontSize: 25, color: "#ff9800" }} />,
            "Total Códigos",
            dataRecibo?.total_codigos || 0
          )}
          {renderKpiCard(
            <DirectionsCar sx={{ fontSize: 25, color: "#9c27b0" }} />,
            "Total Cantidad Recibida",
            dataRecibo?.total_cantidad_recibida || 0
          )}
        </Grid>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 2, width: "100vw", maxWidth: "100%", margin: 0 }}>
      <Typography
        variant="h5"
        textAlign="center"
        sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
      >
        OnePage KPIs
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        centered
        sx={{ mb: 2 }}
      >
        <Tab label="KPI por Día" />
        <Tab label="Histórico KPI" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
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

          {/* Surtido */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, color: "#ff5722" }}
          >
            Surtido
          </Typography>
          {loadingSurtido ? (
            <CircularProgress />
          ) : errorSurtido ? (
            <Alert severity="error">{errorSurtido}</Alert>
          ) : (
            <Grid container spacing={1} justifyContent="center">
              {renderSurtidoTurno(dataSurtido.turno3, "Turno 3")}
              {renderSurtidoTurno(dataSurtido.turno1, "Turno 1")}
              {renderSurtidoTurno(dataSurtido.turno2, "Turno 2")}
            </Grid>
          )}

          {/* Montacargas */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mt: 3, mb: 1, color: "#3f51b5" }}
          >
            Montacargas
          </Typography>
          {loadingMontacargas ? (
            <CircularProgress />
          ) : errorMontacargas ? (
            <Alert severity="error">{errorMontacargas}</Alert>
          ) : dataMontacargas && Object.keys(dataMontacargas).length > 0 ? (
            <Grid container spacing={1} justifyContent="center">
              {Object.keys(dataMontacargas).map((turno, index) =>
                renderMontacargasTurno(dataMontacargas[turno], `Turno ${turno}`)
              )}
            </Grid>
          ) : (
            <Alert severity="info">
              No hay datos de Montacargas para esta fecha.
            </Alert>
          )}

          {/* Paquetería y Recibo */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mt: 3, mb: 1, color: "#3f51b5" }}
          >
            Paquetería y Recibo
          </Typography>
          {loadingPaqueteria || loadingRecibo ? (
            <CircularProgress />
          ) : errorPaqueteria || errorRecibo ? (
            <Alert severity="error">{errorPaqueteria || errorRecibo}</Alert>
          ) : (
            <Grid container spacing={1} justifyContent="center">
              {renderPaqueteria()}
              {renderRecibo()}
            </Grid>
          )}

          {/* Embarques */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mt: 3, mb: 1, color: "#3f51b5" }}
          >
            Embarques
          </Typography>
          {loadingEmbarques ? (
            <CircularProgress />
          ) : errorEmbarques ? (
            <Alert severity="error">{errorEmbarques}</Alert>
          ) : (
            <Grid container spacing={1} justifyContent="center">
              {dataEmbarques?.resumen_por_turno?.map((turno, index) =>
                renderTurno(turno, turno.turno)
              )}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha Inicio"
                value={rangoInicio}
                onChange={(newVal) => newVal && setRangoInicio(newVal)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="Fecha Fin"
                value={rangoFin}
                onChange={(newVal) => newVal && setRangoFin(newVal)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={exportarHistoricoSurtido}
            sx={{ mb: 2 }}
          >
            Descargar Histórico Surtido
          </Button>

          {loadingHistorico ? (
            <CircularProgress />
          ) : Object.keys(historico).length === 0 ? (
            <Alert severity="info">
              No hay datos para el rango seleccionado.
            </Alert>
          ) : (
            <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Bar
                data={buildChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Total Partidas",
                      },
                    },
                  },
                }}
              />
              {resumenPaqueteria.length > 0 && (
                <Box sx={{ mt: 4, maxWidth: "100%", overflowX: "auto" }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "#4caf50", fontWeight: "bold" }}
                  >
                    📦 Histórico Paquetería (por día)
                  </Typography>
                  <Bar
                    data={buildChartPaqueteria()}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Total por Día",
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default KpiDashboard;

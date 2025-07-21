import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  Tabs,
  Tab
} from "@mui/material";

export default function MapaMexico() {
  const [datosEstados, setDatosEstados] = useState({});
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [top10, setTop10] = useState([]);
  const [top10_2025, setTop10_2025] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [topProductosPorEstado, setTopProductosPorEstado] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.3.154:3007/api/kpi/getHstorico2024");
        const data = await response.json();
        setDatosEstados(data);
      } catch (error) {
        console.error("Error al obtener datos de la API:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTop10 = async () => {
      try {
        const response2024 = await fetch("http://192.168.3.154:3007/api/kpi/getTop102024");
        const data2024 = await response2024.json();
        setTop10(data2024);

        const response2025 = await fetch("http://192.168.3.154:3007/api/kpi/getTop102025");
        const data2025 = await response2025.json();
        setTop10_2025(data2025);

        const responseEstado = await fetch("http://192.168.3.154:3007/api/kpi/getTopProductosPorEstado");
        const dataEstado = await responseEstado.json();
        setTopProductosPorEstado(dataEstado);
      } catch (error) {
        console.error("Error al obtener los datos del top por estado:", error);
      }
    };

    fetchTop10();
  }, []);

  const mesesOrdenados = [
   // "2024-01", "2024-02", 
    "2024-03", "2024-04", "2024-05", "2024-06",
    "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"
  ];

  const nombresMeses = {
   // "2024-01": "ENERO", "2024-02": "FEBRERO",
     "2024-03": "MARZO",
    "2024-04": "ABRIL", "2024-05": "MAYO", "2024-06": "JUNIO",
    "2024-07": "JULIO", "2024-08": "AGOSTO", "2024-09": "SEPTIEMBRE",
    "2024-10": "OCTUBRE", "2024-11": "NOVIEMBRE", "2024-12": "DICIEMBRE",
  };

  const nombresEstados = {
    total_general: "Total General",
    AGS: "Aguascalientes", BCN: "Baja California", BCS: "Baja California Sur",
    CAM: "Campeche", CHS: "Chiapas", CHI: "Chihuahua", COH: "Coahuila",
    COL: "Colima", CDM: "Ciudad de México", DGO: "Durango", GTO: "Guanajuato",
    GRO: "Guerrero", HGO: "Hidalgo", JAL: "Jalisco", MEX: "Estado de México",
    MIC: "Michoacán", MOR: "Morelos", NAY: "Nayarit", NL: "Nuevo León",
    OAX: "Oaxaca", PUE: "Puebla", QR: "Querétaro", QRO: "Quintana Roo",
    SLP: "San Luis Potosí", SIN: "Sinaloa", SON: "Sonora", TAB: "Tabasco",
    TAM: "Tamaulipas", TLA: "Tlaxcala", VER: "Veracruz", YUC: "Yucatán",
    ZAC: "Zacatecas"
  };

  const handleSeleccionarEstado = (clave) => {
    setEstadoSeleccionado((prev) => (prev === clave ? null : clave));
  };

  const estadosOrdenados = Object.entries(datosEstados).sort(([a], [b]) => {
    if (a === "total_general") return -1;
    if (b === "total_general") return 1;
    return 0;
  });

  return (
    <Box p={3}>
      <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} sx={{ mb: 3 }}>
        <Tab label="Histórico de Ventas" />
        <Tab label="Top 10 Productos Más Vendidos" />
      </Tabs>

      {tabIndex === 0 && (
        <>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            📍 Selecciona un estado para ver sus datos:
          </Typography>

          {estadosOrdenados.map(([estado, dataEstado]) => (
            <Box key={estado} mt={4}>
              <Typography
                variant="h6"
                onClick={() => handleSeleccionarEstado(estado)}
                sx={{
                  cursor: "pointer",
                  color: estadoSeleccionado === estado ? "primary.main" : "text.primary",
                  fontWeight: "bold",
                  '&:hover': { textDecoration: "underline" }
                }}
              >
                ▶ {nombresEstados[estado] || estado}
              </Typography>

              {estadoSeleccionado === estado && (
                <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                  <Box flex={3} minWidth={400}>
                    <TableContainer
                      component={Paper}
                      elevation={3}
                      sx={{ borderRadius: 3, overflowX: "auto", whiteSpace: "nowrap" }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell align="left"><strong>MES</strong></TableCell>
                            <TableCell align="left"><strong>FACTURADO</strong></TableCell>
                            <TableCell align="left"><strong>FLETE</strong></TableCell>
                            <TableCell align="center"><strong>%</strong></TableCell>
                            <TableCell align="center"><strong>CAJAS</strong></TableCell>
                            <TableCell align="center"><strong>TARIMAS</strong></TableCell>
                            <TableCell align="center"><strong>⏱ DÍAS ENTREGA</strong></TableCell>
                            <TableCell align="center"><strong>CLIENTES</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mesesOrdenados.map((mes) => {
                            const datos = dataEstado[mes];
                            if (!datos) return null;
                            const facturado = datos.total_factura_lt || 0;
                            const flete = datos.total_flete || 0;
                            const porcentaje = facturado ? ((flete / facturado) * 100).toFixed(2) : "0.";
                            return (
                              <TableRow key={mes} hover>
                                <TableCell align="left">{nombresMeses[mes]}</TableCell>
                                <TableCell align="left">${Number(facturado).toLocaleString("es-MX", { maximumFractionDigits: 0 })}</TableCell>
                                <TableCell align="left">${Number(flete).toLocaleString("es-MX", { maximumFractionDigits: 0 })}</TableCell>
                                <TableCell align="center">{porcentaje}%</TableCell>
                                <TableCell align="center">{Number(datos.total_cajas || 0).toLocaleString("es-MX")}</TableCell>
                                <TableCell align="center">{Number(datos.total_tarimas || 0).toLocaleString("es-MX")}</TableCell>
                                <TableCell align="center">{Number(datos.promedio_dias_entrega || 0).toFixed(1)}</TableCell>
                                <TableCell align="center">{Number(datos.total_clientes || 0).toLocaleString("es-MX")}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {topProductosPorEstado[estado] && (
                    <Box flex={1} minWidth={400}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        🧾 Top 10 Productos Más Vendidos en {nombresEstados[estado] || estado}
                      </Typography>
                      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>CÓDIGO</strong></TableCell>
                              <TableCell align="left" ><strong>DECRIPCION</strong></TableCell>
                              <TableCell align="right"><strong>VENDIDO</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topProductosPorEstado[estado].map((item, i) => (
                              <TableRow key={i} hover>
                                <TableCell>{item.codigo_ped}</TableCell>                                
                                <TableCell align="left">{item.descripcion?.slice(0, 20) || ''}</TableCell>
                                <TableCell align="right">{item.total_vendido}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </>
      )}
{tabIndex === 1 && (
  <Box>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      🏆 Top 10 Productos Más Vendidos 2024 vs 2025
    </Typography>

    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box flex={1} minWidth={300}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📊 Año 2024
        </Typography>
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>CÓDIGO</strong></TableCell>
                <TableCell><strong>DESCRIPCIÓN</strong></TableCell>
                <TableCell align="right"><strong>PIEZAS VENDIDAS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {top10.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.codigo_ped}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell align="right">{item.total_vendido}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box flex={1} minWidth={300}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📊 Año 2025
        </Typography>
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>CÓDIGO</strong></TableCell>
                <TableCell><strong>DESCRIPCIÓN</strong></TableCell>
                <TableCell align="right"><strong>PIEZAS VENDIDAS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {top10_2025.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.codigo_ped}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell align="right">{item.total_vendido}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  </Box>
)}
    </Box>
  );
}

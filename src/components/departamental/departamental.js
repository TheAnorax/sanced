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

dayjs.extend(utc);
dayjs.extend(timezone);

function Departamental() {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs().tz("America/Mexico_City"));
  const [loading, setLoading] = useState(false);
  const [surtidores, setSurtidores] = useState(8);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dateStr = selectedDate.format("YYYY-MM-DD");
      try {
        const [dataResponse, resumenResponse] = await Promise.all([
          axios.get(`/api/departamental/data?fecha=${dateStr}`),
          axios.get(`/api/departamental/resumen?fecha=${dateStr}`),
        ]);
        setData(dataResponse.data);
        setResumen(resumenResponse.data);
      } catch (err) {
        console.error("Error al obtener datos departamentales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Panel Departamental
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Resumen" />
        <Tab label="Detalle" />
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

      {tabIndex === 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Resumen Departamental
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : resumen.length === 0 ? (
            <Typography sx={{ mt: 2, ml: 2 }}>
              No hay datos para mostrar.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Departamento</strong></TableCell>
                    <TableCell><strong>Total Pedidos</strong></TableCell>
                    <TableCell><strong>Progreso</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumen.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.departamento}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>{item.progreso}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Detalle por Pedido
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : data.length === 0 ? (
            <Typography sx={{ mt: 2, ml: 2 }}>No hay datos para mostrar.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Orden</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((pedido, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{pedido.orden}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>{pedido.departamento}</TableCell>
                      <TableCell>{pedido.total}</TableCell>
                      <TableCell>{pedido.estado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Departamental;

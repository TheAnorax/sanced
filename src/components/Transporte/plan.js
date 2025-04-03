import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
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
  CircularProgress
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Extender dayjs para manejar zona horaria
dayjs.extend(utc);
dayjs.extend(timezone);

function Plansurtido() {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs().tz('America/Mexico_City'));
  const [loading, setLoading] = useState(false);
  const [surtidores, setSurtidores] = useState(8); // Valor inicial

  
  

  const fetchPaqueteria = async (fecha) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://66.232.105.87:3007/api/Trasporte/getPaqueteriaData?fecha=${fecha}`);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener datos de paquetería:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumen = async (fecha) => {
    try {
      const response = await axios.get(`http://66.232.105.87:3007/api/Trasporte/getPedidosDia?fecha=${fecha}`);
      setResumen(response.data);
    } catch (error) {
      console.error('Error al obtener resumen del día:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      try {
        await Promise.all([
          fetchPaqueteria(dateStr),
          fetchResumen(dateStr)
        ]);
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

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Planificación
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Plan del Día" />
        <Tab label="Plan de Surtido" />
      </Tabs>

      <LocalizationProvider dateAdapter={AdapterDayjs}  adapterLocale="es">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <DatePicker
            label="Seleccionar Fecha"
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue) {
                const convertedDate = dayjs(newValue);
                setSelectedDate(convertedDate.tz('America/Mexico_City'));
              }
            }}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ maxWidth: 240 }} />}
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
          <Typography variant="h6" gutterBottom>Resumen del plan del día</Typography>
          <Grid container spacing={3}>
          {loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
) : resumen.length === 0 ? (
  <Typography sx={{ mt: 2, ml: 2 }}>No se han cargado datos de los pedidos.</Typography>
) : (
              resumen.map((ruta, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Ruta: {ruta.routeName}
                    </Typography>
                    <Typography>Total Clientes: {ruta.totalClientes}</Typography>
                    <Typography>Total Partidas: {ruta.totalPartidas}</Typography>
                    <Typography>Total Piezas: {ruta.totalPiezas}</Typography>
                    <Typography>Total: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(ruta.total)}</Typography>
                    <Typography>Avance: {ruta.avance}</Typography>
                    <Typography sx={{ mt: 1 }}>
  {surtidores > 0 ? (() => {
    const totalMin = (ruta.totalPartidas / (30 * surtidores)) * 60;
    const horas = Math.floor(totalMin / 60);
    const minutos = Math.round(totalMin % 60);
    return (
      <>
        Tiempo estimado de surtido: <strong>{horas}h {minutos}m</strong> ({surtidores} personas a 30 líneas/hr)
      </>
    );
  })() : '—'}
</Typography>



                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Tab 1: Plan de Surtido */}
      {tabIndex === 1 && (
        <Box mt={4}>
          {loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
) : resumen.length === 0 ? (
  <Typography sx={{ mt: 2, ml: 2 }}>No se han cargado datos de los pedidos.</Typography>
) : (
            data.map((grupo, index) => (
              <Box key={index} mb={4}>
                <Typography variant="h6" gutterBottom>
                  Ruta: {grupo.routeName}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Orden</TableCell>
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
                      {grupo.pedidos.map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell>{pedido.no_orden}</TableCell>
                          <TableCell>{pedido.nombre_cliente}</TableCell>
                          <TableCell>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(pedido.TOTAL)}</TableCell>
                          <TableCell>{pedido.PARTIDAS}</TableCell>
                          <TableCell>{pedido.PIEZAS}</TableCell>
                          <TableCell>{pedido.ESTADO}</TableCell>
                          <TableCell>{pedido.avance}</TableCell>
                          <TableCell
                            sx={{
                              color: (() => {
                                const tabla = (pedido.tablaOrigen || '').trim().toLowerCase();
                                if (tabla === 'surtido') return 'black';
                                if (tabla === 'embarques') return 'blue';
                                if (tabla === 'finalizado') return 'green';
                                return 'red';
                              })(),
                              fontWeight: 'bold',
                            }}
                          >
                            {pedido.tablaOrigen || 'No Asignado'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

export default Plansurtido;

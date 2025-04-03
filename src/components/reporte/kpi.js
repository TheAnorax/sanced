import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, Card, Grid, CircularProgress, Alert, TextField
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ListAlt, Timer, DirectionsCar, PrecisionManufacturing } from '@mui/icons-material';

dayjs.extend(utc);
dayjs.extend(timezone);

function KpiDashboard() {
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [dataSurtido, setDataSurtido] = useState(null);
    const [dataMontacargas, setDataMontacargas] = useState(null);
    const [dataPaqueteria, setDataPaqueteria] = useState(null);
    const [dataEmbarques, setDataEmbarques] = useState(null);
    const [dataRecibo, setDataRecibo] = useState(null);

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

  useEffect(() => {
        fetchSurtidoData(selectedDate);
        fetchMontacargasData();
        fetchPaqueteriaData();
        fetchEmbarquesData();
        fetchReciboData();
    }, [selectedDate]);


    const fetchSurtidoData = async (date) => {
        setLoadingSurtido(true);
        setErrorSurtido(null);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            const response = await axios.get(`http://66.232.105.87:3007/api/kpi/getPrduSurtido`, {
                params: { date: formattedDate },
            });
            setDataSurtido(response.data);
        } catch (err) {
            setErrorSurtido('Error al obtener los datos de Surtido');
        } finally {
            setLoadingSurtido(false);
        }
    };

    const fetchMontacargasData = async () => {
        setLoadingMontacargas(true);
        setErrorMontacargas(null);
        try {
            const response = await axios.get(`http://66.232.105.87:3007/api/historial/kpi`);
            const groupedData = groupByTurno(response.data);
            setDataMontacargas(groupedData);
        } catch (err) {
            setErrorMontacargas('Error al obtener los datos de Montacargas');
        } finally {
            setLoadingMontacargas(false);
        }
    };

    
    const fetchPaqueteriaData = async () => {
        setLoadingPaqueteria(true);
        setErrorPaqueteria(null);
        try {
            const response = await axios.get(`http://66.232.105.87:3007/api/kpi/getPrduPaqueteria`);
            setDataPaqueteria(response.data);
        } catch (err) {
            setErrorPaqueteria('Error al obtener los datos de Paquetería');
        } finally {
            setLoadingPaqueteria(false);
        }
    };

      // API de Embarques
      const fetchEmbarquesData = async () => {
        setLoadingEmbarques(true);
        setErrorEmbarques(null);
        try {
            const response = await axios.get(`http://66.232.105.87:3007/api/kpi/getPrduEmbarque`);
            setDataEmbarques(response.data);
        } catch (err) {
            setErrorEmbarques('Error al obtener los datos de Embarques');
        } finally {
            setLoadingEmbarques(false);
        }
    };

    const fetchReciboData = async () => {
        setLoadingRecibo(true);
        setErrorRecibo(null);
        try {
            const response = await axios.get(`http://66.232.105.87:3007/api/kpi/getPrduRecibo`);
            setDataRecibo(response.data);
        } catch (err) {
            setErrorRecibo('Error al obtener los datos de Recibo');
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
            <Card sx={{
                p: 1.5, textAlign: 'center', boxShadow: 2, height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                ':hover': { boxShadow: 4, transform: 'scale(1.01)' }
            }}>
                {icon}
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{value}</Typography>
            </Card>
        </Grid>
    );

    const renderSurtidoTurno = (turnoData, titulo) => (
        <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 3, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{titulo}</Typography>
                <Grid container spacing={1} justifyContent="center">
                    {renderKpiCard(<ListAlt sx={{ fontSize: 25, color: '#ff9800' }} />, "Total Partidas", turnoData.kpis.total_pedidos)}
                    {renderKpiCard(<DirectionsCar sx={{ fontSize: 25, color: '#9c27b0' }} />, "Total Piezas", turnoData.kpis.total_productos_surtidos)}
                    {renderKpiCard(<Timer sx={{ fontSize: 25, color: '#f44336' }} />, "Tiempo General", turnoData.kpis.tiempo_trabajo)}
                </Grid>
            </Card>
        </Grid>
    );

    const renderMontacargasTurno = (turnoData, titulo) => (
        <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 3, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{titulo}</Typography>
                <Grid container spacing={1} justifyContent="center">
                    {turnoData.map((entry, index) => (
                        renderKpiCard(<PrecisionManufacturing sx={{ fontSize: 25, color: '#1976d2' }} />, entry.usuario, entry.total_movimientos)
                    ))}
                </Grid>
            </Card>
        </Grid>
    );

    const renderPaqueteria = () => (
        <Grid item xs={12} md={6}>  {/* 🔹 Cambiar md={4} por md={6} */}
            <Card variant="outlined" sx={{ boxShadow: 3, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Paquetería</Typography>
                <Grid container spacing={1} justifyContent="center">
                    {renderKpiCard(<ListAlt sx={{ fontSize: 25, color: '#ff9800' }} />, "Total Partidas", dataPaqueteria?.total_partidas || 0)}
                    {renderKpiCard(<DirectionsCar sx={{ fontSize: 25, color: '#9c27b0' }} />, "Total Piezas", dataPaqueteria?.total_piezas || 0)}
                    {renderKpiCard(<Timer sx={{ fontSize: 25, color: '#f44336' }} />, "Tiempo Total", dataPaqueteria?.tiempo_total_trabajo || "00:00:00")}
                </Grid>
            </Card>
        </Grid>
    );
    
    const renderTurno = (turnoData, titulo) => (
        <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 3, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{titulo}</Typography>
                <Grid container spacing={1} justifyContent="center">
                    {renderKpiCard(<ListAlt sx={{ fontSize: 25, color: '#ff9800' }} />, "Total Partidas", turnoData.total_partidas)}
                    {renderKpiCard(<DirectionsCar sx={{ fontSize: 25, color: '#9c27b0' }} />, "Total Piezas", turnoData.total_piezas)}
                    {renderKpiCard(<Timer sx={{ fontSize: 25, color: '#f44336' }} />, "Tiempo Total", turnoData.tiempo_total_trabajo)}
                </Grid>
            </Card>
        </Grid>
    );

    const renderRecibo = () => (
        <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 3, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Recibo</Typography>
                <Grid container spacing={1} justifyContent="center">
                    {renderKpiCard(<ListAlt sx={{ fontSize: 25, color: '#ff9800' }} />, "Total Códigos", dataRecibo?.total_codigos || 0)}
                    {renderKpiCard(<DirectionsCar sx={{ fontSize: 25, color: '#9c27b0' }} />, "Total Cantidad Recibida", dataRecibo?.total_cantidad_recibida || 0)}
                </Grid>
            </Card>
        </Grid>
    );

    return (
        <Box sx={{ p: 2, width: "100vw", maxWidth: "100%", margin: 0 }}>
            <Typography variant="h5" textAlign="center" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                OnePage
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}adapterLocale="es" >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
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

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ff5722' }}>Surtido</Typography>
            {loadingSurtido ? <CircularProgress /> : errorSurtido ? <Alert severity="error">{errorSurtido}</Alert> :
                <Grid container spacing={1} justifyContent="center">
                    {renderSurtidoTurno(dataSurtido.turno3, 'Turno 3')}
                    {renderSurtidoTurno(dataSurtido.turno1, 'Turno 1')}
                    {renderSurtidoTurno(dataSurtido.turno2, 'Turno 2')}
                </Grid>
            }

            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, color: '#3f51b5' }}>Montacargas</Typography>
            {loadingMontacargas ? <CircularProgress /> : errorMontacargas ? <Alert severity="error">{errorMontacargas}</Alert> :
                <Grid container spacing={1} justifyContent="center">
                    {Object.keys(dataMontacargas).map((turno, index) => (
                        renderMontacargasTurno(dataMontacargas[turno], `Turno ${turno}`)
                    ))}
                </Grid>
            }   
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, color: '#3f51b5' }}>Paquetería y Recibo</Typography>
{(loadingPaqueteria || loadingRecibo) ? <CircularProgress /> : 
(errorPaqueteria || errorRecibo) ? <Alert severity="error">{errorPaqueteria || errorRecibo}</Alert> :
    <Grid container spacing={1} justifyContent="center">
        {renderPaqueteria()}
        {renderRecibo()}
    </Grid>
}

             <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, color: '#3f51b5' }}>Embarques</Typography>
            {loadingEmbarques ? <CircularProgress /> : errorEmbarques ? <Alert severity="error">{errorEmbarques}</Alert> :
                <Grid container spacing={1} justifyContent="center">
                    {dataEmbarques.map((turno, index) => renderTurno(turno, turno.turno))}
                </Grid>
            }

          

        </Box>
    );
}

export default KpiDashboard;

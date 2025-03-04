import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Collapse,
    CircularProgress,
    Alert,
    TextField,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);



function Kpi() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTurno, setExpandedTurno] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    // Llamada a la API para obtener los datos de los KPIs
    const fetchData = async (date) => {
        setLoading(true);
        setError(null);

        try {
            const formattedDate = date.format('YYYY-MM-DD');
            const response = await axios.get(`http://66.232.105.87:3007/api/kpi/getPrduSurtido`, {
                params: { date: formattedDate },
            });
            setData(response.data);
        } catch (err) {
            setError('Error al obtener los datos');
        } finally {
            setLoading(false);
        }
    };

    // Ejecutar la primera carga con la fecha de hoy
    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    // Manejar la expansión del turno
    const toggleExpand = (turno) => {
        setExpandedTurno(expandedTurno === turno ? null : turno);
    };

    // Renderizado mientras se cargan los datos
    if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Box textAlign="center" mt={4}><Alert severity="error">{error}</Alert></Box>;

    // Formatea un turno con sus datos de KPIs y usuarios
    const renderTurno = (turnoData, titulo, turnoId) => (
        <Card variant="outlined" sx={{ mb: 3,  boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>{titulo}</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={3} sm={3}>
                        <Typography variant="body2" color="textSecondary">Total Partidas</Typography>
                        <Typography variant="h4">{turnoData.kpis.total_pedidos}</Typography>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Typography variant="body2" color="textSecondary">Total Sin AV</Typography>
                        <Typography variant="h4">{turnoData.kpis.total_partidas}</Typography>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Typography variant="body2" color="textSecondary">Total Piezas</Typography>
                        <Typography variant="h4">{turnoData.kpis.total_productos_surtidos}</Typography>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Typography variant="body2" color="textSecondary">Tiempo General</Typography>
                        <Typography variant="h4">{turnoData.kpis.tiempo_trabajo}</Typography>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    onClick={() => toggleExpand(turnoId)}
                >
                    {expandedTurno === turnoId ? 'Ocultar Detalles' : 'Ver Detalles'}
                </Button>
            </CardContent>
            <Collapse in={expandedTurno === turnoId} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Detalles por Surtidor</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Surtidor</TableCell>
                                <TableCell>Pedidos</TableCell>
                                <TableCell>Partidas</TableCell>
                                <TableCell>Piezas</TableCell>
                                <TableCell>Tiempo de trabajo</TableCell>                                
                                <TableCell>Tiempo Productivo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(turnoData.usuarios).map(([usuario, stats], index) => (
                                <TableRow key={index}>
                                    <TableCell>{usuario}</TableCell>
                                    <TableCell>{stats.total_pedidos}</TableCell>
                                    <TableCell>{stats.total_partidas}</TableCell>
                                    <TableCell>{stats.total_piezas}</TableCell>
                                    <TableCell>{stats.tiempo_trabajo}</TableCell>                                    
                                    <TableCell>{stats.tiempo_productivo}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Collapse>
        </Card>
    );

    return (
        <Box 
    >
        <Typography variant="h4" textAlign="center" gutterBottom>
            KPIs de Surtido
        </Typography>
    
        {/* Selector de fecha */} 
        <LocalizationProvider dateAdapter={AdapterDayjs} >
        <DatePicker
    label="Seleccionar Fecha"
    value={selectedDate}
    onChange={(newValue) => {
        if (newValue) {
            // Convierte a objeto Day.js antes de aplicar tz()
            const convertedDate = dayjs(newValue);
            setSelectedDate(convertedDate.tz('America/Mexico_City'));
        }
    }}
    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 4 }} />}
/>

        </LocalizationProvider>
    
        {/* Mostrar los datos por turno de manera más espaciosa */}
        <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12} md={4}>
                {renderTurno(data.turno1, 'Turno 1 (06:00 - 14:00)', 'turno1')}
            </Grid>
            <Grid item xs={12} md={4}>
                {renderTurno(data.turno2, 'Turno 2 (14:00 - 21:30)', 'turno2')}
            </Grid>
            <Grid item xs={12} md={4}>
                {renderTurno(data.turno3, 'Turno 3 (21:30 - 06:00)', 'turno3')}
            </Grid>
        </Grid>
    </Box>
    
    );
}

export default Kpi;

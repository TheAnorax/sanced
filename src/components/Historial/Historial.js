import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Container, CircularProgress, TablePagination, TextField, Box,
  Tabs, Tab, Grid, Card, CardContent
} from '@mui/material';


import * as XLSX from 'xlsx';
import { Button, Modal, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

function Historial() {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [kpiData, setKpiData] = useState([]); // Estado para KPI
  const [loading, setLoading] = useState(true);
  const [loadingKPI, setLoadingKPI] = useState(true); // Cargando KPI
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(["ubi_origen", "ubi_destino", "code_prod", "cant_stock", "fecha_movimiento", "name"]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    // Obtener movimientos
    const fetchMovimientos = async () => {
      try {
        const response = await axios.get('http://66.232.105.87:3007/api/historial/histo');
        const modifiedData = response.data.map(movimiento => ({
          ...movimiento,
          ubi_origen: (movimiento.ubi_origen === 9999) ? 'recibido' : movimiento.ubi_origen
        }));
        setMovimientos(modifiedData);
        setFilteredMovimientos(modifiedData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener el historial:', error);
        setLoading(false);
      }
    };

    // Obtener datos KPI
    const fetchKpiData = async () => {
      try {
        const response = await axios.get('http://66.232.105.87:3007/api/historial/kpi');
        setKpiData(response.data);
        setLoadingKPI(false);
      } catch (error) {
        console.error('Error al obtener los KPIs:', error);
        setLoadingKPI(false);
      }
    };

    fetchMovimientos();
    fetchKpiData();
  }, []);


  const handleExportToExcel = () => {
    let data = [...filteredMovimientos];
  
    // Filtrado por fecha
    if (startDate && endDate) {
      const from = new Date(startDate).getTime();
      const to = new Date(endDate).getTime();
      data = data.filter(m =>
        new Date(m.fecha_movimiento).getTime() >= from &&
        new Date(m.fecha_movimiento).getTime() <= to
      );
    }


  
    // Mapeo de columnas seleccionadas
    const exportData = data.map((row) => {
      const formattedRow = {};
      selectedColumns.forEach((col) => {
        let value = row[col];
    
        // 👉 Formatear solo si es fecha_movimiento
        if (col === "fecha_movimiento" && value) {
          const date = new Date(value);
          value = date.toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
    
        formattedRow[columnLabels[col]] = value;
      });
      return formattedRow;
    });
    
    
  
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
  
    XLSX.writeFile(wb, `Historial_Reporte.xlsx`);
    setModalOpen(false);
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    const search = event.target.value.toLowerCase();
    setSearchTerm(search);

    const filtered = movimientos.filter(movimiento =>
      movimiento.code_prod.toLowerCase().includes(search)
    );

    setFilteredMovimientos(filtered);
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" align="center" gutterBottom>
          Cargando historial de movimientos...
        </Typography>
        <CircularProgress />
      </Container>
    );
  }

  const columnLabels = {
    ubi_origen: "Ubicación Origen",
    ubi_destino: "Ubicación Destino",
    code_prod: "Código del Producto",
    cant_stock: "Cantidad",
    fecha_movimiento: "Fecha de Movimiento",
    name: "Usuario Responsable"
  };
  

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Historial de Movimientos
      </Typography>

      

      {/* Navegación entre secciones */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Historial" />
        <Tab label="Resumen" />
        <Tab label="Estadísticas" />
      </Tabs>

      {/* Contenido basado en la pestaña seleccionada */}
      {tabIndex === 0 && (
        <>
          <Box mb={2}>
            <TextField
              label="Buscar por Código de Producto"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ maxWidth: 400 }}
            />
          </Box>

          <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
  Seleccionar Reporte
</Button>

          <TableContainer component={Paper} style={{ maxHeight: 600, overflowY: 'auto', width: '100%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ubicación Origen</TableCell>
                  <TableCell>Ubicación Destino</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Fecha Movimiento</TableCell>
                  <TableCell>Monta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMovimientos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((movimiento, index) => (
                    <TableRow key={index}>
                      <TableCell>{movimiento.ubi_origen}</TableCell>
                      <TableCell>{movimiento.ubi_destino}</TableCell>
                      <TableCell>{movimiento.code_prod}</TableCell>
                      <TableCell>{movimiento.cant_stock}</TableCell>
                      <TableCell>{new Date(movimiento.fecha_movimiento).toLocaleString()}</TableCell>
                      <TableCell>{movimiento.name}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredMovimientos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {tabIndex === 1 && (
        <Box mt={3}>
          <Typography variant="h6" align="center">
            Resumen de Movimientos
          </Typography>
          <Typography variant="body1" align="center">
            {/* KPIs - Tarjetas arriba de la tabla */}
      {loadingKPI ? (
        <Typography align="center">Cargando indicadores...</Typography>
      ) : (
        <Grid container spacing={2} mb={3}>
          {kpiData.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{kpi.usuario}</Typography>
                  <Typography variant="body2">Turno: {kpi.turno}</Typography>
                  <Typography variant="h5" color="primary">
                    {kpi.total_movimientos} Movimientos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
          </Typography>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box mt={3}>
          <Typography variant="h6" align="center">
            Estadísticas (En desarrollo)
          </Typography>
          <Typography variant="body1" align="center">
            Próximamente se mostrarán gráficos y análisis de los movimientos.
          </Typography>
        </Box>
      )}

<Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Generar Reporte</DialogTitle>
  <DialogContent>
    <Typography variant="subtitle1">Selecciona columnas:</Typography>
    
    {Object.keys(columnLabels).map((col) => (
  <FormControlLabel
    key={col}
    control={
      <Checkbox
        checked={selectedColumns.includes(col)}
        onChange={() =>
          setSelectedColumns((prev) =>
            prev.includes(col)
              ? prev.filter((c) => c !== col)
              : [...prev, col]
          )
        }
      />
    }
    label={columnLabels[col]} // 👈 nombre bonito aquí
  />
))}


    <Box mt={2}>
      <LocalizationProvider dateAdapter={AdapterDayjs}  adapterLocale="es">
        <DatePicker
          label="Fecha inicio"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
        <Box mt={2} />
        <DatePicker
          label="Fecha fin"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
      </LocalizationProvider>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
    <Button onClick={handleExportToExcel} variant="contained" color="primary">Exportar</Button>
  </DialogActions>
</Dialog>

    </Container>
  );
}

export default Historial;

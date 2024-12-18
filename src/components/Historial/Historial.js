import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Container, CircularProgress, TablePagination, TextField, Box
} from '@mui/material';

function Historial() {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Controla la página de la tabla
  const [rowsPerPage, setRowsPerPage] = useState(10); // Número de filas por página
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await axios.get('http://192.168.3.27:3007/api/historial/histo'); // Ruta para obtener datos
        // Reemplazar "9999" por "recibido" en los datos
        const modifiedData = response.data.map(movimiento => {
          return {
            ...movimiento,
            ubi_origen: (movimiento.ubi_origen === 9999) ? 'recibido' : movimiento.ubi_origen
          };
        });
        setMovimientos(modifiedData);
        setFilteredMovimientos(modifiedData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener el historial:', error);
        setLoading(false);
      }
    };

    fetchMovimientos();
  }, []);

  // Función para manejar el cambio de página en la paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrar los movimientos por código de producto
  const handleSearchChange = (event) => {
    const search = event.target.value.toLowerCase();
    setSearchTerm(search);

    const filtered = movimientos.filter(movimiento =>
      movimiento.code_prod.toLowerCase().includes(search)
    );

    setFilteredMovimientos(filtered);
    setPage(0); // Volver a la primera página al buscar
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

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Historial de Movimientos
      </Typography>

      {/* Buscador de productos por código */}
      <Box mb={2}>
        <TextField
          label="Buscar por Código de Producto"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ maxWidth: 400 }}  // Ajustar tamaño del buscador
        />
      </Box>

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
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Pagina los resultados
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

      {/* Agregar paginación */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredMovimientos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
}

export default Historial;

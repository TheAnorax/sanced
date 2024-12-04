import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography, Box, Paper, TextField,
  FormControl, Fab, Snackbar, Select, MenuItem, InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Embarques() {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuarios, setSelectedUsuarios] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://192.168.3.27:3007/api/embarque/embarque');
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };
 
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('http://192.168.3.27:3007/api/pedidos/usuarios');

        // Filtrar usuarios que incluyan "embarque" en el nombre y también a "Dany"
        const paqueteriaUsuarios = response.data.filter(usuario => 
          usuario.name && 
          usuario.name.toLowerCase().includes('embarque') || usuario.name.toLowerCase() === 'Dany'
        );

        setUsuarios(paqueteriaUsuarios);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
      }
    };

    fetchPedidos();
    fetchUsuarios();

    const intervalId = setInterval(fetchPedidos, 5000); // Fetch every 5 seconds
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleUserChange = async (pedidoId, event) => {
    const { value } = event.target;
    setSelectedUsuarios((prev) => ({
      ...prev,
      [pedidoId]: value,
    }));

    try {
      await axios.put(`http://192.168.3.27:3007/api/embarque/embarque/${pedidoId}/usuario-embarque`, {
        id_usuario_paqueteria: value,
      });
      setSnackbarMessage('Usuario de embarques asignado correctamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating usuario de paquetería:', error);
      setSnackbarMessage('Error al asignar el usuario de paquetería');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Filtro seguro para evitar errores con valores undefined
  const filteredPedidos = pedidos.filter(pedido => {
    const pedidoStr = pedido.pedido?.toString() || '';  // Verifica si pedido.pedido es válido
    const tipoStr = pedido.tipo?.toLowerCase() || '';  // Verifica si pedido.tipo es válido
    return pedidoStr.includes(searchTerm) || tipoStr.includes(searchTerm);
  });

  const columns = [
    { field: 'pedido', headerName: 'Pedido', width: 150 },
    { field: 'tipo', headerName: 'Tipo', width: 150 },
    { field: 'partidas', headerName: 'Partidas', width: 150 },
    {
      field: 'usuario',
      headerName: 'Usuario de Embarques',
      width: 200,
      renderCell: (params) => (
        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
          <InputLabel id={`select-label-${params.row.pedido}`}>Seleccione Usuario</InputLabel>
          <Select
            labelId={`select-label-${params.row.pedido}`}
            value={selectedUsuarios[params.row.pedido] || ''}
            label="Seleccione Usuario"
            onChange={(event) => handleUserChange(params.row.pedido, event)}
          >
            {usuarios.map((usuario) => (
              <MenuItem key={usuario.id_usu} value={usuario.id_usu}>
                {usuario.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection="column">
        <Typography variant="h4" component="h2">
          Pedidos en Embarques
        </Typography>
        <TextField
          label="Buscar"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mt: 2, mb: 2, width: '100%' }}
        />
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <div style={{ height: '70vh', width: '100%' }}>
            <DataGrid
              rows={filteredPedidos}
              columns={columns}
              pageSize={5}
              getRowId={(row) => row.pedido} // El campo "pedido" como ID único
            />
          </div>
        </Paper>
      </Box>

      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default Embarques;
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
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 3px 6px rgba(0,0,0,0.16)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { marginBottom: '16px' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          minHeight: '32px',
        },
      },
    },
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Paqueteria() {
  const [pedidos, setPedidos] = useState([]);
  const [originalPedidos, setOriginalPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuarios, setSelectedUsuarios] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [pedidoLiberarManual, setPedidoLiberarManual] = useState('');


  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://localhost:3007/api/paqueterias/paqueteria'); 
        setOriginalPedidos(response.data); // Guardar los datos originales
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };
    
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('http://localhost:3007/api/pedidos/usuarios');
        
        // Filtra usuarios que tienen un rol definido y contienen 'PQ' en cualquier parte
        const paqueteriaUsuarios = response.data.filter(usuario =>     usuario.role && usuario.role.toUpperCase().includes('PQ')
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

  useEffect(() => {
    if (searchTerm) {
      const filteredData = originalPedidos.filter((pedido) =>
        pedido.pedido.toString().includes(searchTerm) ||
        pedido.tipo.toLowerCase().includes(searchTerm)
      );
      setPedidos(filteredData);
    } else {
      setPedidos(originalPedidos);
    }
  }, [originalPedidos, searchTerm]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = originalPedidos.filter((pedido) =>
      pedido.pedido.toString().includes(value) ||
      pedido.tipo.toLowerCase().includes(value)
    );
    setPedidos(filteredData);
  };

  const handleUserChange = async (pedidoId, tipo, event) => {
    const { value } = event.target;
    const key = `${pedidoId}-${tipo}`;
  
    setSelectedUsuarios((prev) => ({
      ...prev,
      [key]: value,
    }));
  
    try {
      await axios.put(
        `http://localhost:3007/api/paqueterias/paqueteria/${pedidoId}/usuario-paqueteria`,
        {
          id_usuario_paqueteria: value,
          tipo, // importante
        }
      );
      setSnackbarMessage('Usuario de paquetería asignado correctamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating usuario de paquetería:', error);
      setSnackbarMessage('Error al asignar el usuario de paquetería');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  

  const handleResetManual = async () => {
    if (!pedidoLiberarManual) return;
  
    const confirmacion = window.confirm(`¿Estás seguro que deseas deshabilitar el pedido ${pedidoLiberarManual}?`);
    if (!confirmacion) return;
  
    try {
      await axios.put(`http://localhost:3007/api/embarque/reset-usuario/${pedidoLiberarManual}`);
      setSnackbarMessage(`Usuario de paquetería liberado para el pedido ${pedidoLiberarManual}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setPedidoLiberarManual('');
  
      // Recarga pedidos
      const response = await axios.get('http://localhost:3007/api/embarque/embarque');
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al liberar usuario de paquetería:', error);
      setSnackbarMessage('Error al liberar usuario de paquetería');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  


  const columns = [
    { field: 'pedido', headerName: 'Pedido', width: 150 },
    { field: 'tipo', headerName: 'Tipo', width: 150 },
    { field: 'partidas', headerName: 'Partidas', width: 150 },
    {
      field: 'usuario',
      headerName: 'Usuario de Paquetería',
      width: 200,
      renderCell: (params) => (
        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
          <InputLabel id={`select-label-${params.row.pedido}`}>Seleccione Usuario</InputLabel>
          <Select
            labelId={`select-label-${params.row.pedido}`}
            value={selectedUsuarios[params.row.pedido] || ''}
            label="Seleccione Usuario"
            onChange={(event) => handleUserChange(params.row.pedido, params.row.tipo, event)}

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
          Pedidos en Paquetería
        </Typography>
        <TextField
          label="Buscar"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mt: 2, mb: 2, width: '100%' }}
        />

        <Box
  display="flex"
  alignItems="center"
  justifyContent="center"
  gap={2}
  mb={2}
  sx={{ width: '100%' }}
>
  <Box display="flex" alignItems="center" gap={1} sx={{ width: 'auto' }}>
    <TextField
      label="Pedido a liberar"
      variant="outlined"
      size="small"
      value={pedidoLiberarManual}
      onChange={(e) => setPedidoLiberarManual(e.target.value)}
      sx={{ width: 200 }}
    />
    <Fab
      color="secondary"
      size="small"
      onClick={handleResetManual}
      sx={{ minWidth: 40, height: 40 }}
    >
      <Typography variant="button" fontSize="0.75rem">
        OK
      </Typography>
    </Fab>
  </Box>
</Box>

        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <div style={{ height: '70vh', width: '100%' }}>
            <DataGrid
              rows={pedidos}
              columns={columns}
              pageSize={5}
              getRowId={(row) => `${row.pedido}-${row.tipo}`}
              // Ensure unique row ID
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

export default Paqueteria;

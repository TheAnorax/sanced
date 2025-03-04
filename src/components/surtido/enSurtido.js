import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography, CircularProgress, LinearProgress
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontSize: 18,
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px',
          fontSize: '1.1rem',
          whiteSpace: 'nowrap', // Asegura que el contenido no se divida
        },
      },
    },
  },
});

function EnSurtido() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://66.232.105.87:3007/api/surtidos/surtido');
        setPedidos(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        setLoading(false);
      }
    };

    fetchPedidos();
    const intervalId = setInterval(() => {
      fetchPedidos();
    }, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(intervalId);
  }, []);

  const calcularPorcentajeSurtido = (totalSurtido, totalProductos) => {
    if (totalProductos === 0) return 0;
    return Math.round((totalSurtido / totalProductos) * 100);
  };

  const interpolateColor = (percentage) => {
    if (percentage === 100) {
      return 'rgb(0, 128, 0)'; // Verde semáforo
    }
    const r = percentage < 50 ? 255 : Math.floor(255 - ((percentage - 50) * 5.1));
    const g = percentage < 50 ? Math.floor(percentage * 5.1) : 255;
    return `rgb(${r}, ${g}, 0)`;
  };

  const renderPasillos = (pasilloProductos) => {
    const allPasillos = ['AV', '1', '2', '3', '4', '5', '6', '7', '8'];
    return allPasillos.map(pasillo => (
      <TableCell key={pasillo}>
        {pasilloProductos[pasillo] ? (
          <Box>
            <Typography variant="body2" fontWeight="bold" noWrap>Tot: {pasilloProductos[pasillo].cantidadTotal}</Typography>
            <Typography variant="body2" fontWeight="bold" noWrap>Surt: {pasilloProductos[pasillo].cantidadSurtida}</Typography>
          </Box>
        ) : (
          <Box>-</Box>
        )}
      </TableCell>
    ));
  };

  const obtenerUsuario = (pedido) => {
    const productosRestantes = pedido.productos.filter(producto => producto.estado !== 'B');
    const soloAV = productosRestantes.every(producto => producto.pasillo === 'AV');
  
    if (soloAV) {
      return 'AV';
    }
  
    if (pedido.pasillo === 'AV' && pedido.usuario) {
      return pedido.usuario;
    }
  
    const otroUsuario = pedido.productos.find(producto => producto.pasillo !== 'AV' && producto.usuario);
    return otroUsuario ? otroUsuario.usuario : 'Por Pasillo';
  };

  return (
    <ThemeProvider theme={theme}>
      <Box p={2} sx={{ overflowX: 'auto' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              Total de pedidos en surtido: {pedidos.length}
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>O.C</TableCell>
                    <TableCell>Surtido</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Progreso </TableCell>
                    {['AV', '1', '2', '3', '4', '5', '6', '7', '8'].map(pasillo => (
                      <TableCell key={pasillo}>Pasillo {pasillo}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido, index) => {
                    const porcentajeSurtido = calcularPorcentajeSurtido(pedido.totalSurtido, pedido.totalProductos);                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{pedido.numeroPedido}</TableCell>
                        <TableCell>{obtenerUsuario(pedido)}</TableCell>
                        <TableCell>{pedido.totalProductos}</TableCell>
                        <TableCell>
                          <Box >
                            <Typography variant="h6" fontWeight="bold">{porcentajeSurtido}%</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={porcentajeSurtido} 
                              sx={{ 
                                height: 9, 
                                borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: interpolateColor(porcentajeSurtido)
                                }
                              }} 
                            />
                          </Box>
                        </TableCell>
                        {renderPasillos(pedido.pasilloProductos)}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default EnSurtido;

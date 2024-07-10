import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontSize: 18,
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          fontSize: '1.7rem',
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
        const response = await axios.get('http://192.168.3.225:3007/api/surtidos/surtido');
        const pedidosConSurtido = response.data.filter(pedido => pedido.estado && pedido.pasillo !== null);
        const pedidosAgrupados = agruparPedidos(pedidosConSurtido);
        const pedidosActualizados = actualizarPedidos(pedidosAgrupados);
        setPedidos(pedidosActualizados);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        setLoading(false);
      }
    };

    const agruparPedidos = (pedidos) => {
      const pedidosAgrupados = pedidos.reduce((acumulador, pedido) => {
        const { pedido: numeroPedido, cantidad, cant_surti, pasillo, ubi_bahia, usuario } = pedido;

        if (!acumulador[numeroPedido]) {
          acumulador[numeroPedido] = {
            numeroPedido,
            totalProductos: 0,
            totalSurtido: 0,
            productos: [],
            pasilloProductos: {},
            ubi_bahia: ubi_bahia,
            usuario: usuario
          };
        }
        acumulador[numeroPedido].totalProductos += cantidad;
        acumulador[numeroPedido].totalSurtido += cant_surti;
        acumulador[numeroPedido].productos.push(pedido);

        acumulador[numeroPedido].pasilloProductos[pasillo] = {
          cantidadTotal: (acumulador[numeroPedido].pasilloProductos[pasillo]?.cantidadTotal || 0) + cantidad,
          cantidadSurtida: (acumulador[numeroPedido].pasilloProductos[pasillo]?.cantidadSurtida || 0) + cant_surti
        };

        return acumulador;
      }, {});
      return Object.values(pedidosAgrupados);
    };

    const actualizarPedidos = (pedidos) => {
      return pedidos.filter(pedido => {
        const productosCompletos = pedido.productos.every(producto => producto.estado === 'B');
        return !productosCompletos;
      });
    };

    fetchPedidos();
    const intervalId = setInterval(() => {
      fetchPedidos();
    }, 9000); // Actualizar cada 9 segundos

    return () => clearInterval(intervalId);
  }, []);

  const calcularPorcentajeSurtido = (totalSurtido, totalProductos) => {
    if (totalProductos === 0) return 0;
    return (totalSurtido / totalProductos) * 100;
  };

  const getColorPorcentaje = (porcentaje) => {
    if (porcentaje === 0) return 'red';
    if (porcentaje > 0 && porcentaje < 50) return 'orange';
    if (porcentaje >= 50 && porcentaje < 75) return 'yellow';
    if (porcentaje >= 75 && porcentaje < 100) return 'lightgreen';
    if (porcentaje >= 100 && porcentaje < 101) return 'green';
  };

  const renderPasillos = (pasilloProductos) => {
    const allPasillos = ['AV','1', '2', '3', '4', '5', '6', '7', '8'];
    return allPasillos.map(pasillo => (
      <TableCell key={pasillo}>
        {pasilloProductos[pasillo] ? (
          <Box>
            Total: {pasilloProductos[pasillo].cantidadTotal} <br />
            Surtido: {pasilloProductos[pasillo].cantidadSurtida}
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
      <Box p={2}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Total de pedidos en surtido: {pedidos.length}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>O.C</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Surtido</TableCell>
                    <TableCell>Pasillo:AV</TableCell>
                    <TableCell>Pasillo:1</TableCell>
                    <TableCell>Pasillo:2</TableCell>
                    <TableCell>Pasillo:3</TableCell>
                    <TableCell>Pasillo:4</TableCell>
                    <TableCell>Pasillo:5</TableCell>
                    <TableCell>Pasillo:6</TableCell>
                    <TableCell>Pasillo:7</TableCell>
                    <TableCell>Pasillo:8</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido, index) => {
                    const porcentajeSurtido = calcularPorcentajeSurtido(pedido.totalSurtido, pedido.totalProductos).toFixed(1);
                    const color = getColorPorcentaje(porcentajeSurtido);
                    return (
                      <TableRow key={index}>
                        <TableCell>{pedido.numeroPedido}</TableCell>
                        <TableCell>{obtenerUsuario(pedido)}</TableCell>
                        <TableCell>{pedido.totalProductos}</TableCell>
                        <TableCell sx={{ backgroundColor: color }}>{porcentajeSurtido}%</TableCell>
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

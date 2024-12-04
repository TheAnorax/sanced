import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  CircularProgress,
  Alert,
  Fab,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';

function Empaquetando() {
  const [pedidos, setPedidos] = useState([]);
  const [usuariosConRecuento, setUsuariosConRecuento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Estado para controlar la apertura del modal
  const [productividad, setProductividad] = useState([]); // Estado para almacenar los datos de productividad

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch('http://192.168.3.27:3007/api/paqueterias/progreso');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const { pedidos, recuentoUsuarios } = data;

        const sortedPedidos = pedidos.sort((a, b) => parseFloat(b.progreso_validacion) - parseFloat(a.progreso_validacion));
        setPedidos(sortedPedidos);
        setUsuariosConRecuento(recuentoUsuarios);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPedidos();
    const intervalId = setInterval(fetchPedidos, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Función para determinar el color basado en el progreso
  const getColorByProgress = (progress) => {
    if (progress <= 25) return '#e74c3c'; // Rojo para 0-25%
    if (progress <= 50) return '#f39c12'; // Naranja para 26-50%
    if (progress <= 75) return '#f1c40f'; // Amarillo para 51-75%
    return '#2ecc71'; // Verde para 76-100%
  };

  // Función para abrir el modal
  const handleOpen = async () => {
    try {
      const response = await fetch('http://192.168.3.27:3007/api/paqueterias/productividad'); // URL para obtener los datos de productividad
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setProductividad(data); // Almacenar los datos de productividad en el estado
      setOpen(true); // Abrir el modal
    } catch (error) {
      console.error('Error fetching productividad data:', error);
    }
  };

  // Función para cerrar el modal
  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">Error al cargar los datos: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Progreso de Validación de Paquetería
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recuento de Pedidos por Usuario
        </Typography>
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto', // Permite el desplazamiento horizontal si es necesario
            gap: 2, // Espacio entre elementos
            padding: 1,
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc',
              borderRadius: 4,
            },
          }}
        >
          {usuariosConRecuento.map((usuario, index) => {
            const primerNombre = usuario.usuario.split(' ')[0];
            return (
              <Card variant="outlined" key={index} sx={{ minWidth: 120, flexShrink: 0 }}>
                <CardContent>
                  <Typography variant="h6">{primerNombre}</Typography>
                  <Typography variant="body2">Pedidos: {usuario.cantidad_pedidos}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Pedidos en Progreso
        </Typography>
        {pedidos.length === 0 ? (
          <Typography variant="body1">No hay pedidos en progreso.</Typography>
        ) : (
          pedidos.map((pedido) => {
            const progreso = parseFloat(pedido.progreso_validacion);
            const primerNombreUsuario = pedido.usuario.split(' ')[0];
            const progressColor = getColorByProgress(progreso); // Obtener el color de la barra según el progreso

            return (
              <Card key={pedido.pedido} variant="outlined" sx={{ marginBottom: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>Pedido:</strong> {pedido.pedido}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Usuario:</strong> {primerNombreUsuario} | <strong>Partidas:</strong> {pedido.partidas} |{' '}
                    <strong>Piezas:</strong> {pedido.cantidad_piezas}
                  </Typography>
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="body2">Progreso: {isNaN(progreso) ? '0.00' : progreso.toFixed(2)}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={isNaN(progreso) ? 0 : progreso}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        marginTop: 1,
                        backgroundColor: '#ddd', // Color de fondo de la barra
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progressColor, // Cambiar el color de la barra de progreso dinámicamente
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>

      {/* Botón flotante en la parte inferior derecha */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpen} // Abrir el modal al hacer clic en el botón
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Modal para mostrar la productividad */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80vw', // Hacer el modal más ancho
              height: '80vh', // Hacer el modal más alto
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              overflowY: 'auto', // Permitir desplazamiento vertical si el contenido es demasiado grande
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Productividad de Empaquetadores
            </Typography>
            <Grid container spacing={2}> {/* Cambié el `spacing` de 3 a 2 para reducir el espacio entre los elementos */}
                {productividad.length > 0 ? (
                  productividad.map((item, index) => (
                    <Grid item xs={12} sm={4} md={3} key={index}> {/* Ajustado para mostrar 4 en una fila en pantallas grandes */}
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h5" sx={{ marginBottom: 1 }}>
                            {item.usuario}
                          </Typography>
                          <Typography variant="subtitle1" color="textSecondary">
                            {item.role}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <AssignmentIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body1"><strong>Partidas:</strong> {item.partidas}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <WorkIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body1"><strong>Cantidad de piezas:</strong> {item.cantidad_piezas}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <TimerIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body1"><strong>Tiempo Total de Trabajo:</strong> {item.tiempo_total_trabajo}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography>No hay datos disponibles.</Typography>
                )}
              </Grid>

          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default Empaquetando;

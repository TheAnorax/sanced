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

function Embarcando() {
    const [pedidos, setPedidos] = useState([]);
    const [usuariosConRecuento, setUsuariosConRecuento] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [productividad, setProductividad] = useState({
        cantidad_piezas:'',
        tiempo_total_trabajo:'',
    });

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined || isNaN(seconds)) {
            return 'N/A';
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await fetch('http://66.232.105.87:3007/api/embarque/embarque/progreso');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                const { pedidos } = data;

                // Crear un objeto para contar pedidos y sumar piezas
                const usuariosMap = {};

                // Iterar sobre cada pedido
                pedidos.forEach(pedido => {
                    const { usuario, cantidad_piezas } = pedido;

                    // Asegurarse de que cantidad_piezas sea un número
                    const piezas = Number(cantidad_piezas); // Convertir a número
                    if (isNaN(piezas)) {
                        console.warn(`Cantidad de piezas no es un número: ${cantidad_piezas}`);
                        return; // Si no es un número, continuar al siguiente pedido
                    }

                    if (!usuariosMap[usuario]) {
                        usuariosMap[usuario] = {
                            usuario,
                            cantidad_pedidos: 0,
                            cantidad_piezas: 0,
                        };
                    }

                    // Incrementar el conteo de pedidos y sumar las piezas
                    usuariosMap[usuario].cantidad_pedidos += 1;
                    usuariosMap[usuario].cantidad_piezas += piezas; // Usar la variable convertida
                });

                // Convertir el objeto a un array
                const usuariosConRecuento = Object.values(usuariosMap);


                // Ordenar los pedidos según progreso
                const sortedPedidos = pedidos.sort((a, b) => parseFloat(b.progreso_validacion) - parseFloat(a.progreso_validacion));

                setPedidos(sortedPedidos);
                setUsuariosConRecuento(usuariosConRecuento);
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



    const getColorByProgress = (progress) => {
        if (progress <= 25) return '#e74c3c'; // Rojo para 0-25%
        if (progress <= 50) return '#f39c12'; // Naranja para 26-50%
        if (progress <= 75) return '#f1c40f'; // Amarillo para 51-75%
        return '#2ecc71';                     // Verde para 76-100%
    };

    const handleOpen = async () => {
        try {
            const response = await fetch('http://66.232.105.87:3007/api/embarque/embarque/productividad'); // URL para obtener los datos de productividad
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
                Progreso de Validación de Embarcado
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
                    {usuariosConRecuento.map((usuario, index) => (
                        <Card variant="outlined" key={index} sx={{ minWidth: 120, flexShrink: 0 }}>
                            <CardContent>
                                <Typography variant="h6">{usuario.usuario}</Typography>
                                <Typography variant="body2">Pedidos: {usuario.cantidad_pedidos}</Typography>
                                <Typography variant="body2">Cantidad de piezas: {usuario.cantidad_piezas}</Typography>
                            </CardContent>
                        </Card>
                    ))}
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
                        const primerNombreUsuario = pedido.usuario;
                        const progressColor = getColorByProgress(progreso); // Obtener el color de la barra según el progreso

                        return (
                            <Card key={pedido.pedido} variant="outlined" sx={{ marginBottom: 2 }}>
                                <CardContent>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ color: progreso === 0 ? 'red' : 'inherit' }} // Cambia el color a rojo si el progreso es 0
                                    >
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
                            Productividad de Embarcadores
                        </Typography>
                        <Grid container spacing={2}>
                            {productividad.length > 0 ? (
                                productividad.map((item, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}> {/* Ajustado a 3 para mostrar 4 cuadros en fila */}
                                        <Card variant="outlined" sx={{ height: '100%', borderRadius: '16px' }}>
                                            <CardContent>
                                                <Typography variant="h6" align="center">{item.usuario}</Typography>
                                                <Typography variant="body1" align="center">
                                                    <strong>Partidas:</strong> {item.partidas}
                                                </Typography>
                                                <Typography variant="body1" align="center">
                                                    <strong>Cnatidad de Piezas:</strong> {item.cantidad_piezas}
                                                </Typography>
                                                <Typography variant="body1" align="center">
                                                    <strong>Tiempo Total:</strong> {(item.tiempo_total_trabajo)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12} display="flex" justifyContent="center">
                                    <Alert severity="warning">No hay datos de productividad disponibles.</Alert>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}

export default Embarcando;

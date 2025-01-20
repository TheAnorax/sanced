import React, { useState, useEffect } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Button, Modal, Select, MenuItem, FormControl, InputLabel, AppBar, Tabs, Tab, IconButton, Snackbar, Checkbox }
    from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';

const hasExpired = (timestamp) => {
    const now = new Date().getTime();
    return now - timestamp > 24 * 60 * 60 * 1000; // 24 horas en milisegundos
};

function Transporte() {
    const [data, setData] = useState([]); // Datos cargados desde Excel
    const [groupedData, setGroupedData] = useState({}); // Datos agrupados por ruta
    const [newRoute, setNewRoute] = useState(''); // Nueva ruta para asignar datos
    const [selectedRoute, setSelectedRoute] = useState(null); // Ruta seleccionada para mostrar en modal
    const [modalOpen, setModalOpen] = useState(false); // Estado del modal
    const [selectedActionRoute, setSelectedActionRoute] = useState(''); // Ruta seleccionada desde Select
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para mostrar el Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Mensaje del Snackbar
    const [observaciones, setObservaciones] = useState({}); // Almacenar observaciones por cliente
    const [loadingObservaciones, setLoadingObservaciones] = useState(false); // Carga de observaciones
    const [observacionesPorRegistro, setObservacionesPorRegistro] = useState({});
    const [loadingObservacionId, setLoadingObservacionId] = useState(null);
    const [tabIndex, setTabIndex] = useState(0); // Estado para manejar las pestañas

    const [selectedRoutes, setSelectedRoutes] = useState([]); // Rutas seleccionadas para enviar
    const [confirmSendModalOpen, setConfirmSendModalOpen] = useState(false); // Modal de confirmación
    const [sentRoutesData, setSentRoutesData] = useState([]); // Datos enviados a la segunda tabla

    const [totalClientes, setTotalClientes] = useState(0);  // Estado para los clientes
    const [totalPedidos, setTotalPedidos] = useState(0);    // Estado para los pedidos
    const [totalGeneral, setTotalGeneral] = useState(0);     // Estado para el total general

    const exportToImage = () => {
        // Captura el contenedor con los datos
        const element = document.getElementById('data-to-capture');

        html2canvas(element).then((canvas) => {
            // Crea una URL de la imagen generada
            const imageUrl = canvas.toDataURL('image/png');

            // Crea un enlace para descargar la imagen
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'Resumen_Rutas.png'; // Nombre del archivo de la imagen
            link.click();
        });
    };

    // Obtener fecha actual
    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    // Manejo de pestañas
    const handleChangeTab = (event, newValue) => {
        setTabIndex(newValue);
    };

    // Cargar datos desde localStorage al iniciar
    useEffect(() => {
        const storedData = localStorage.getItem('transporteData');
        const storedGroupedData = localStorage.getItem('transporteGroupedData');
        const storedTimestamp = localStorage.getItem('transporteTimestamp');

        if (storedData && storedGroupedData && storedTimestamp) {
            if (hasExpired(Number(storedTimestamp))) {
                // Si los datos han caducado, limpiar localStorage
                localStorage.removeItem('transporteData');
                localStorage.removeItem('transporteGroupedData');
                localStorage.removeItem('transporteTimestamp');
            } else {
                // Si los datos son válidos, cargarlos al estado
                setData(JSON.parse(storedData));
                setGroupedData(JSON.parse(storedGroupedData));
            }
        }
    }, []);

    useEffect(() => {
        if (data.length > 0 || Object.keys(groupedData).length > 0 || sentRoutesData.length > 0) {
            localStorage.setItem('transporteData', JSON.stringify(data));
            localStorage.setItem('transporteGroupedData', JSON.stringify(groupedData));
            localStorage.setItem('sentRoutesData', JSON.stringify(sentRoutesData)); // Guardar los datos de la segunda tabla
            localStorage.setItem('transporteTimestamp', new Date().getTime());
        }
    }, [data, groupedData, sentRoutesData]); // Actualizamos cuando cambia cualquier dato

    // Formatear números como moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    };

    // Mapear columnas del Excel
    const mapColumns = (row) => ({
        RUTA: 'Sin Ruta',
        FECHA: row['Fecha Lista Surtido'],
        'NO ORDEN': row['No Orden'] || row['__EMPTY_1'] || '',
        'NO FACTURA': row['No Factura'] || row['__EMPTY_4'] || '',
        'NUM. CLIENTE': row['Cliente'] || row['__EMPTY_8'] || '',
        'NOMBRE DEL CLIENTE': row['Nombre Cliente'] || row['__EMPTY_11'] || '',
        ZONA: row['Zona'] || row['__EMPTY_10'] || '',
        MUNICIPIO: row['Municipio'] || row['Municipo'] || row['__EMPTY_12'] || row['__EMPTY_13'] || '', // Ajustado
        ESTADO: row['Estado'] || row['__EMPTY_15'] || '',
        OBSERVACIONES: '',
        TOTAL: parseFloat(String(row['Total'] || row['__EMPTY_21'] || '0').replace(',', '')) || 0,
        PARTIDAS: Number(row['Partidas'] || row['__EMPTY_22'] || 0),
        PIEZAS: Number(row['Cantidad'] || row['__EMPTY_23'] || 0),
    });

    // Cargar archivo Excel
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            const mappedData = jsonData.map(mapColumns).filter((row) => row['NO ORDEN']);
            setData(mappedData);
        };
        reader.readAsBinaryString(file);
    };

    // Crear una nueva ruta
    const addRoute = () => {
        if (newRoute && !groupedData[newRoute]) {
            setGroupedData({ ...groupedData, [newRoute]: { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0, rows: [] } });
            setNewRoute('');
        }
    };

    // Asignar un elemento a una ruta específica
    const assignToRoute = (item, route) => {
        setGroupedData((prev) => {
            const updatedRoute = prev[route] || { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0, rows: [] };

            updatedRoute.rows.push(item);
            updatedRoute.TOTAL += item.TOTAL;
            updatedRoute.PARTIDAS += item.PARTIDAS;
            updatedRoute.PIEZAS += item.PIEZAS;

            return { ...prev, [route]: updatedRoute };
        });

        setData((prevData) => prevData.filter((row) => row !== item));
    };

    // Mostrar modal con detalles de la ruta
    const openModal = (route) => {
        setSelectedRoute(route);
        setModalOpen(true);

        const firstRow = groupedData[route]?.rows?.[0];
        if (firstRow) {
            fetchObservacionPorRegistro(firstRow['NUM. CLIENTE']); // ✅ Corrección
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRoute(null);
        setObservaciones(''); // Limpiar observaciones
    };

    // Calcular Totales
    const calculateTotals = (route) => {
        const routeData = groupedData[route] || { rows: [] };
        return routeData.rows.reduce(
            (totals, row) => {
                totals.TOTAL += row.TOTAL;
                totals.PARTIDAS += row.PARTIDAS;
                totals.PIEZAS += row.PIEZAS;
                return totals;
            },
            { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0 }
        );
    };

    const removeFromRoute = (item, route) => {
        setGroupedData((prev) => {
            const updatedRoute = { ...prev[route] };
            updatedRoute.rows = updatedRoute.rows.filter((row) => row !== item);
            updatedRoute.TOTAL -= item.TOTAL;
            updatedRoute.PARTIDAS -= item.PARTIDAS;
            updatedRoute.PIEZAS -= item.PIEZAS;

            return { ...prev, [route]: updatedRoute };
        });

        // Devolver el registro a la tabla principal
        setData((prevData) => [...prevData, item]);
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('transporteData');
        localStorage.removeItem('transporteGroupedData');
        localStorage.removeItem('transporteTimestamp');
        setData([]);
        setGroupedData({});
        handleSnackbarOpen('Datos eliminados correctamente. Carga un nuevo archivo Excel para comenzar.');
    };

    // Llamada para obtener las rutas de paquetería
    const fetchPaqueteriaRoutes = async () => {
        try {
            const response = await fetch('http://192.168.3.27:3007/api/Trasporte/rutas');
            const data = await response.json();

            if (Array.isArray(data)) {
                // Por cada ruta, obtener datos adicionales
                const enrichedData = await Promise.all(data.map(async (routeData) => {
                    // Llamada a la API para obtener los detalles adicionales
                    const additionalData = await fetchAdditionalData(routeData['NO ORDEN']);
                    return {
                        ...routeData,
                        ...additionalData, // Combina los datos de la primera API con los datos adicionales
                    };
                }));

                // Establecer los datos combinados en el estado
                setSentRoutesData(enrichedData);
            } else {
                console.error('No se encontraron rutas de paquetería');
            }
        } catch (error) {
            console.error('Error al obtener las rutas de paquetería:', error.message);
        }
    };

    // Función en el frontend para obtener la fecha de embarque y el total de cajas
    const fetchAdditionalData = async (noOrden) => {
        try {
            const url = `http://192.168.3.27:3007/api/Trasporte/pedido/detalles/${noOrden}`;  // Usamos el parámetro en la URL
            const response = await fetch(url);
            const data = await response.json();

            return {
                ultimaFechaEmbarque: data.ultimaFechaEmbarque,
                totalCajas: data.totalCajas,
            };
        } catch (error) {
            console.error('Error al obtener los datos adicionales:', error.message);
            return {};
        }
    };


    useEffect(() => {
        fetchPaqueteriaRoutes(); // Llama a la API para cargar las rutas de paquetería
    }, []);  // Se ejecuta una vez al montar el componente

    useEffect(() => {
        console.log("Datos de la paquetería:", sentRoutesData); // Verifica el estado
    }, [sentRoutesData]); // Esto se ejecuta cada vez que `sentRoutesData` cambia



    const handleSnackbarOpen = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const fetchObservacionPorRegistro = async (venta) => {
        try {
            setLoadingObservacionId(venta); // Mostrar loading en el registro actual
            const response = await fetch(`http://192.168.3.27:3007/api/Trasporte/clientes/observaciones/${venta}`);
            const data = await response.json();

            setObservacionesPorRegistro((prev) => ({
                ...prev,
                [venta]: data.observacion || 'Sin observaciones disponibles',
            }));
        } catch (error) {
            console.error('Error al obtener observaciones:', error.message);
            setObservacionesPorRegistro((prev) => ({
                ...prev,
                [venta]: 'Error al obtener observaciones',
            }));
        } finally {
            setLoadingObservacionId(null); // Finalizar loading
        }
    };

    const handleSelectRoute = (route) => {
        console.log('Ruta seleccionada:', route);
        console.log('Datos de la ruta:', groupedData[route]);

        setSelectedRoutes((prevRoutes) => {
            if (prevRoutes.includes(route)) {
                return prevRoutes.filter(r => r !== route); // Desmarcar ruta
            } else {
                return [...prevRoutes, route]; // Marcar ruta
            }
        });
    };



    const handleSendRoutes = async () => {
        if (selectedRoutes.length > 0) {
            const newSentRoutesData = [];

            selectedRoutes.forEach((route) => {
                const routeData = groupedData[route];

                // Verificar si routeData y routeData.rows están definidos antes de intentar acceder a ellas
                if (routeData && routeData.rows) {
                    routeData.rows.forEach((row) => {
                        newSentRoutesData.push({
                            ...row,  // Mantener todos los detalles de la fila
                            routeName: route,  // Mantener el nombre de la ruta
                            OBSERVACIONES: observacionesPorRegistro[row['NUM. CLIENTE']] || 'Sin observaciones disponibles'
                        });
                    });
                } else {
                    console.warn(`Ruta ${route} no tiene datos o filas definidas.`);
                }
            });

            // Verifica que estás enviando todos los datos
            console.log("Datos enviados a la base de datos:", newSentRoutesData);

            // Enviar las rutas al backend para registrar en la base de datos
            try {
                const response = await fetch('http://192.168.3.27:3007/api/Trasporte/insertarRutas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rutas: newSentRoutesData }), // Asegúrate de enviar todos los datos aquí
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Rutas insertadas:', result);
                    handleSnackbarOpen('Rutas enviadas a paquetería con éxito y registradas en la base de datos.');

                    // Agregar los datos a la segunda tabla
                    setSentRoutesData((prevData) => [...prevData, ...newSentRoutesData]);

                    // Eliminar las rutas de groupedData después de enviarlas
                    setGroupedData((prevData) => {
                        const newGroupedData = { ...prevData };
                        selectedRoutes.forEach((route) => {
                            delete newGroupedData[route];  // Eliminar la ruta de groupedData
                        });
                        return newGroupedData;
                    });
                } else {
                    handleSnackbarOpen('Hubo un error al registrar las rutas.');
                }
            } catch (error) {
                console.error('Error al enviar las rutas:', error);
                handleSnackbarOpen('Error al enviar las rutas.');
            }

            setConfirmSendModalOpen(false);
        } else {
            handleSnackbarOpen('Por favor, selecciona al menos una ruta.');
        }
    };

    useEffect(() => {
        // Recorre todos los clientes de la segunda tabla para obtener sus observaciones
        sentRoutesData.forEach((routeData) => {
            // Verifica si la observación ya está cargada
            if (!observacionesPorRegistro[routeData['NUM. CLIENTE']]) {
                // Si no está cargada, llama a la API para cargarla
                fetchObservacionPorRegistro(routeData['NUM. CLIENTE']);
            }
        });
    }, [sentRoutesData]); // Este efecto se ejecuta cuando los datos en la segunda tabla cambian

    const clearSentRoutesData = () => {
        setSentRoutesData([]);
        localStorage.removeItem('sentRoutesData');
        handleSnackbarOpen('Datos de la paquetería eliminados correctamente.');
    };

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return date.toLocaleDateString(undefined, options); // Locale-based formatting
    }

    // Usar esta función cuando el usuario hace clic en "Mandar a Paquetería"
    const handleGenerateRoutes = () => {
        if (selectedRoutes.length > 0) {
            setConfirmSendModalOpen(true);

            // Verifica que hay datos en las rutas seleccionadas
            const rutasConDatos = selectedRoutes.filter(route => groupedData[route]?.rows?.length > 0);

            if (rutasConDatos.length > 0) {
                const totalClientes = calculateTotalClientes(rutasConDatos);
                const totalPedidos = calculateTotalPedidos(rutasConDatos);
                const totalGeneral = calculateTotalGeneral(rutasConDatos);

                // Actualizamos los estados para mostrar los datos en el modal
                setTotalClientes(totalClientes);
                setTotalPedidos(totalPedidos);
                setTotalGeneral(totalGeneral);
            } else {
                handleSnackbarOpen('Las rutas seleccionadas no tienen datos.');
            }
        } else {
            handleSnackbarOpen('Por favor, selecciona al menos una ruta.');
        }
    };


    const calculateTotalClientes = (rutasSeleccionadas) => {
        const clientes = new Set(); // Usamos un Set para asegurar que los clientes sean únicos

        rutasSeleccionadas.forEach((route) => {
            const routeData = groupedData[route];
            if (routeData && routeData.rows) { // Verificamos si hay datos de esa ruta
                routeData.rows.forEach((row) => {
                    // Aseguramos que estamos agregando correctamente al Set
                    clientes.add(row['NUM. CLIENTE']);
                });
            }
        });

        return clientes.size; // El tamaño del Set nos da el total de clientes únicos
    };


    // Función para obtener el total de pedidos
    const calculateTotalPedidos = (rutasSeleccionadas) => {
        let totalPedidos = 0;

        rutasSeleccionadas.forEach((route) => {
            const routeData = groupedData[route];
            if (routeData && routeData.rows) {
                totalPedidos += routeData.rows.length; // Contamos las filas (pedidos) de cada ruta
            }
        });

        return totalPedidos;
    };

    // Función para obtener el total general
    const calculateTotalGeneral = (rutasSeleccionadas) => {
        let totalGeneral = 0;

        rutasSeleccionadas.forEach((route) => {
            const routeData = groupedData[route];
            if (routeData && routeData.rows) {
                routeData.rows.forEach((row) => {
                    totalGeneral += row.TOTAL; // Sumamos el total de cada pedido
                });
            }
        });

        return totalGeneral;
    };



    return (
        <Paper elevation={3} style={{ padding: '20px' }}>

            {/* Pestañas */}
            <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 'none' }}>
                <Tabs value={tabIndex} onChange={handleChangeTab} textColor="primary" indicatorColor="primary" centered>
                    <Tab label="OVR y Rutas" />
                    <Tab label="Paqueteria" />
                </Tabs>
            </AppBar>

            {/* Primer Tab: Mostrar rutas y detalles */}
            {tabIndex === 0 && (
                <Box marginTop={2}>

                    <Typography variant="h5">Cargar Archivo Excel</Typography>

                    <Box marginTop={2} display="flex" alignItems="center" gap={2}>

                        <label htmlFor="file-upload">
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }} />
                            <Button
                                variant="contained"
                                component="span"
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: '#1976D2',
                                    '&:hover': {
                                        backgroundColor: '#135BA1',
                                    },
                                }}>
                                📂 Subir Archivo
                            </Button>
                        </label>

                        <Button onClick={clearLocalStorage} variant="contained" color="secondary">
                            Limpiar Datos
                        </Button>

                        <TextField
                            label="Nueva Ruta"
                            value={newRoute}
                            onChange={(e) => setNewRoute(e.target.value)}
                            variant="outlined"
                            style={{ marginRight: '10px' }}
                        />
                        <Button onClick={addRoute} variant="contained">
                            Agregar Ruta
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateRoutes}>
                            Mandar a Paqueteria
                        </Button>

                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={6000}
                            onClose={handleSnackbarClose}
                            message={snackbarMessage}
                            action={
                                <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            }
                        />
                    </Box>

                    {Object.keys(groupedData).length <= 5 ? (
                        <Box display="flex" gap={2} flexWrap="wrap" marginTop={2}>
                            {Object.keys(groupedData).map((route) => {
                                const totals = calculateTotals(route); // Calcular totales para esta ruta
                                return (
                                    <Box
                                        key={route}
                                        style={{
                                            textAlign: 'center',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px',
                                            minWidth: '200px',
                                        }}
                                    >
                                        <Checkbox
                                            checked={selectedRoutes.includes(route)}
                                            onChange={() => handleSelectRoute(route)} // Llama la función de selección
                                        />
                                        <Typography variant="h6" fontWeight="bold">
                                            Ruta: {route}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Total:</strong> {formatCurrency(totals.TOTAL)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Partidas:</strong> {totals.PARTIDAS}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Piezas:</strong> {totals.PIEZAS}
                                        </Typography>
                                        <Button onClick={() => openModal(route)} size="small" color="primary">
                                            Ver Detalles
                                        </Button>

                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <FormControl fullWidth style={{ marginTop: '20px' }}>
                            <InputLabel>Seleccionar Ruta</InputLabel>
                            <Select value={selectedActionRoute} onChange={(e) => openModal(e.target.value)}>
                                {Object.keys(groupedData).map((route) => (
                                    <MenuItem key={route} value={route}>
                                        {route}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Modal para mandar a paqueteria */}
                    <Modal
                        open={confirmSendModalOpen}
                        onClose={() => setConfirmSendModalOpen(false)}
                        aria-labelledby="confirm-send-modal-title"
                        aria-describedby="confirm-send-modal-description"
                    >
                        <Box
                            padding="20px"
                            backgroundColor="white"
                            margin="50px auto"
                            maxWidth="400px"
                            textAlign="center"
                            borderRadius="8px"
                        >
                            <Typography variant="h6" id="confirm-send-modal-title">
                                ¿Está seguro de mandar estas rutas a paquetería?
                            </Typography>

                            <Box position="relative" style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>

                                <IconButton
                                    style={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 10
                                    }}
                                    color="primary"
                                    onClick={exportToImage}
                                >
                                    <DownloadIcon />
                                </IconButton>

                                {/* Contenedor con los datos a capturar */}
                                <div id="data-to-capture" style={{ padding: '20px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#FFEB3B' }}>
                                                <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center' }}>CLIENTES</th>
                                                <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center' }}>PEDIDOS</th>
                                                <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center' }}>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{totalClientes}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{totalPedidos}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{formatCurrency(totalGeneral)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Box>

                            <Box marginTop={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSendRoutes} // Llama directamente a handleSendRoutes
                                >
                                    Sí
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setConfirmSendModalOpen(false)} // Cerrar modal sin hacer cambios
                                    style={{ marginLeft: 10 }}
                                >
                                    No
                                </Button>
                            </Box>
                        </Box>
                    </Modal>


                    {/* Modal para mostrar detalles de la ruta */}
                    <Modal open={modalOpen} onClose={closeModal}>
                        <Box
                            padding="20px"
                            backgroundColor="white"
                            margin="50px auto"
                            maxWidth="80%"
                            maxHeight="80%"
                            overflow="auto"
                            borderRadius="8px"
                        >
                            <Typography variant="h6">
                                Detalles de la Ruta: {selectedRoute || 'Ruta no seleccionada'}
                            </Typography>


                            {/* Validación de Datos */}
                            {selectedRoute && groupedData[selectedRoute]?.rows?.length > 0 ? (
                                <>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>FECHA</TableCell>
                                                    <TableCell>NO ORDEN</TableCell>
                                                    <TableCell>NO FACTURA</TableCell>
                                                    <TableCell>NUM. CLIENTE</TableCell>
                                                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                                                    <TableCell>ZONA</TableCell>
                                                    <TableCell>MUNICIPIO</TableCell>
                                                    <TableCell>ESTADO</TableCell>
                                                    <TableCell>OBSERVACIONES</TableCell>
                                                    <TableCell>TOTAL</TableCell>
                                                    <TableCell>PARTIDAS</TableCell>
                                                    <TableCell>PIEZAS</TableCell>
                                                    <TableCell>ACCIONES</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groupedData[selectedRoute].rows.map((row, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{row.FECHA}</TableCell>
                                                        <TableCell>{row['NO ORDEN']}</TableCell>
                                                        <TableCell>{row['NO FACTURA']}</TableCell>
                                                        <TableCell>{row['NUM. CLIENTE']}</TableCell>
                                                        <TableCell>{row['NOMBRE DEL CLIENTE']}</TableCell>
                                                        <TableCell>{row['ZONA']}</TableCell>
                                                        <TableCell>{row.MUNICIPIO}</TableCell>
                                                        <TableCell>{row.ESTADO}</TableCell>
                                                        <TableCell>
                                                            {observacionesPorRegistro[row['NUM. CLIENTE']] || 'Sin observaciones'}
                                                        </TableCell>
                                                        <TableCell>{formatCurrency(row.TOTAL)}</TableCell>
                                                        <TableCell>{row.PARTIDAS}</TableCell>
                                                        <TableCell>{row.PIEZAS}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => removeFromRoute(row, selectedRoute)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                {/* Fila de Totales Generales */}
                                                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                                    <TableCell colSpan={8} align="right">
                                                        <strong>Totales Generales:</strong>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <strong>
                                                            {formatCurrency(calculateTotals(selectedRoute).TOTAL)}
                                                        </strong>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <strong>{calculateTotals(selectedRoute).PARTIDAS}</strong>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <strong>{calculateTotals(selectedRoute).PIEZAS}</strong>
                                                    </TableCell>
                                                    <TableCell />
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            ) : (
                                <Typography>No hay datos disponibles para esta ruta.</Typography>
                            )}

                            {/* Botón de Cerrar */}
                            <Box textAlign="right" marginTop={2}>
                                <Button onClick={closeModal} variant="contained">
                                    Cerrar
                                </Button>
                            </Box>
                        </Box>
                    </Modal>


                    {/* Tabla de datos cargados */}
                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>FECHA</TableCell>
                                    <TableCell>NO ORDEN</TableCell>
                                    <TableCell>NO FACTURA</TableCell>
                                    <TableCell>NUM. CLIENTE</TableCell>
                                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                                    <TableCell>ZONA</TableCell>
                                    <TableCell>MUNICIPIO</TableCell>
                                    <TableCell>ESTADO</TableCell>
                                    <TableCell>TOTAL</TableCell>
                                    <TableCell>PARTIDAS</TableCell>
                                    <TableCell>PIEZAS</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.FECHA}</TableCell>
                                        <TableCell>{row['NO ORDEN']}</TableCell>
                                        <TableCell>{row['NO FACTURA']}</TableCell>
                                        <TableCell>{row['NUM. CLIENTE']}</TableCell>
                                        <TableCell>{row['NOMBRE DEL CLIENTE']}</TableCell>
                                        <TableCell>{row['ZONA']}</TableCell>
                                        <TableCell>{row.MUNICIPIO || 'Sin Municipio'}</TableCell>
                                        <TableCell>{row.ESTADO}</TableCell>
                                        <TableCell>{formatCurrency(row.TOTAL)}</TableCell>
                                        <TableCell>{row.PARTIDAS}</TableCell>
                                        <TableCell>{row.PIEZAS}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth>
                                                <InputLabel>Seleccionar Ruta</InputLabel>
                                                <Select
                                                    value=""
                                                    onChange={(e) => assignToRoute(row, e.target.value)}
                                                    displayEmpty
                                                >
                                                    <MenuItem disabled value="">
                                                        Seleccionar Ruta
                                                    </MenuItem>
                                                    {Object.keys(groupedData).map((route) => (
                                                        <MenuItem key={route} value={route}>
                                                            {route}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Box>
            )}

            {/* Segundo Tab: Otra información o tabla */}
            {tabIndex === 1 && (
                <Box marginTop={2}>
                    <Typography variant="h6">Paquetería</Typography>

                    {/* Botón para limpiar la tabla de la segunda pestaña */}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={clearSentRoutesData}
                        style={{ marginBottom: '20px' }}
                    >
                        Limpiar Paquetería
                    </Button>

                    {/* Tabla */}
                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>NO ORDEN</TableCell>
                                    <TableCell>FECHA</TableCell>
                                    <TableCell>NUM CLIENTE</TableCell>
                                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                                    <TableCell>MUNICIPIO</TableCell>
                                    <TableCell>ESTADO</TableCell>
                                    <TableCell>OBSERVACIONES</TableCell>
                                    <TableCell>TOTAL</TableCell>
                                    <TableCell>PARTIDAS</TableCell>
                                    <TableCell>PIEZAS</TableCell>
                                    <TableCell>ZONA</TableCell>
                                    <TableCell>TIPO DE ZONA</TableCell>
                                    <TableCell>NUMERO DE FACTURA</TableCell>
                                    <TableCell>FECHA DE FACTURA</TableCell>
                                    <TableCell>FECHA DE EMBARQUE</TableCell>
                                    <TableCell>DIA EN QUE ESTA EN RUTA</TableCell>
                                    <TableCell>HORA DE SALIDA</TableCell>
                                    <TableCell>CAJAS</TableCell>
                                    <TableCell>TARIMAS</TableCell>
                                    <TableCell>TRANSPORTE</TableCell>
                                    <TableCell>PAQUETERIA</TableCell>
                                    <TableCell>GUIA</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sentRoutesData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={22} style={{ textAlign: 'center' }}>
                                            No hay datos disponibles.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sentRoutesData.map((routeData, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{routeData['NO ORDEN']}</TableCell>
                                            <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                                            <TableCell>{routeData['NUM. CLIENTE']}</TableCell>
                                            <TableCell>{routeData['NOMBRE DEL CLIENTE']}</TableCell>
                                            <TableCell>{routeData.MUNICIPIO}</TableCell>
                                            <TableCell>{routeData.ESTADO}</TableCell>
                                            <TableCell>{routeData.OBSERVACIONES}</TableCell>
                                            <TableCell>{formatCurrency(routeData.TOTAL)}</TableCell>
                                            <TableCell>{routeData.PARTIDAS}</TableCell>
                                            <TableCell>{routeData.PIEZAS}</TableCell>
                                            <TableCell>{routeData.ZONA}</TableCell>
                                            <TableCell>{routeData['TIPO DE ZONA']}</TableCell>
                                            <TableCell>{routeData['NO FACTURA']}</TableCell>
                                            <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                                            <TableCell>{formatDate(routeData.ultimaFechaEmbarque)}</TableCell>
                                            <TableCell>{routeData['DIA EN QUE ESTA EN RUTA']}</TableCell>
                                            <TableCell>{routeData['HORA DE SALIDA']}</TableCell>
                                            <TableCell>{routeData.totalCajas}</TableCell>
                                            <TableCell>{routeData.TARIMAS}</TableCell>
                                            <TableCell>{routeData.routeName}</TableCell>
                                            <TableCell>{routeData.routeName}</TableCell>
                                            <TableCell>{routeData.GUIA}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </TableContainer>
                </Box>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                action={
                    <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Paper>
    );
};

export default Transporte;
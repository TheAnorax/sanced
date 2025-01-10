import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card, CardContent, CardMedia, Grid, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box, TextField, TablePagination,
    Tabs, Tab, MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function ProyectoQueretaro() {
    // 📊 **Estados Principales**
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [open, setOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [tabData, setTabData] = useState([]);
    const [selectedZona, setSelectedZona] = useState('');
    const [selectedRuta, setSelectedRuta] = useState('');
    const [diaVisita, setDiaVisita] = useState('');
    const [rutaReparto, setRutaReparto] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [currentView, setCurrentView] = useState('empty'); // Vista inicial vacía
    const [selectedZone, setSelectedZone] = useState('');  // State for selected zone
    const [selectedPersona, setSelectedPersona] = useState('');
    const [selectedRoutes, setSelectedRoutes] = useState([]);

    // 📅 **Obtener Día Actual**
    useEffect(() => {
        const daysOfWeek = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        const today = new Date().getDay();
        setCurrentDay(daysOfWeek[today]);
    }, []);

    useEffect(() => {
        filterData();
    }, [selectedZona, selectedRuta, diaVisita]);

    useEffect(() => {
        if (currentDay) {
            console.log("Enviando solicitud a la API con dia_visita:", currentDay);  // Verifica el valor de dia_visita
            axios.get(`http://192.168.3.27:3007/api/Queretaro/proyectoqueretaro?dia_visita=${currentDay}`)
                .then((response) => {
                    console.log("Respuesta de la API:", response.data);  // Verifica la respuesta de la API
                    setData(response.data);
                    setFilteredData(response.data);  // Filtra los datos de acuerdo con el día
                })
                .catch((error) => {
                    console.error('Error al obtener los datos:', error);
                });
        }
    }, [currentDay]);

    const handleRutaRepartoChange = (event) => {
        setRutaReparto(event.target.value);
    };

    const filterData = () => {
        let filtered = data;

        if (currentDay) {
            filtered = filtered.filter(item => item.dia_visita === currentDay);
        }

        if (selectedZona) {
            filtered = filtered.filter(item => item.zona === selectedZona);
        }

        if (selectedRuta) {
            filtered = filtered.filter(item => parseInt(item.ruta, 10) === parseInt(selectedRuta, 10));
        }

        if (diaVisita) {
            filtered = filtered.filter(item => item.dia_visita === diaVisita);
        }

        if (rutaReparto) {
            filtered = filtered.filter(item => parseInt(item.ruta_reparto, 10) === parseInt(rutaReparto, 10));
        }

        console.log("Datos Filtrados:", filtered);
        setFilteredData(filtered);
    };

    const handlePersonaChange = (event) => {
        setSelectedPersona(event.target.value);
        filterData();
    };

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = data.filter((item) =>
            item.nombre.toLowerCase().includes(term)
        );
        setFilteredData(filtered);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 15));
        setPage(0);
    };

    const handleClickOpen = (project) => {
        console.log('Proyecto seleccionado:', project);  // Verifica si los datos son correctos
        setSelectedProject(project);  // Establece el proyecto seleccionado
        setOpen(true);  // Abre el modal

        // Obtener el valor del portafolio, giro y segmento del proyecto
        const { giro, portafolio, segmento } = project;

        // Codificar los parámetros para evitar problemas con caracteres especiales
        const encodedGiro = encodeURIComponent(giro);
        const encodedPortafolio = encodeURIComponent(portafolio);
        const encodedSegmento = encodeURIComponent(segmento);

        // Hacer la consulta a la API para obtener los datos filtrados por categoría y segmento
        axios.get(`http://192.168.3.27:3007/api/Queretaro/category/${encodedGiro}/${encodedPortafolio}/${encodedSegmento}`)
            .then((response) => {
                console.log('Datos filtrados por portafolio, categoría y segmento:', response.data.data);
                if (response.data.data && response.data.data.length > 0) {
                    setTabData(response.data.data);
                } else {
                    console.log("No se encontraron datos que coincidan con el portafolio, la categoría y el segmento");
                    setTabData([]);
                }
            })
            .catch((error) => {
                console.error('Error al obtener los datos filtrados:', error);
            });


    };

    const handleZoneChange = (event) => {
        const zone = event.target.value;
        setSelectedZone(zone);

        // Filtrar los proyectos según la zona seleccionada
        axios.get(`http://192.168.3.27:3007/api/Queretaro/proyectoqueretaro?zona=${zone}`)
            .then((response) => {
                setFilteredData(response.data);
                setPage(0); // Reset the page when changing the filter
            })
            .catch((error) => {
                console.error('Error al obtener los proyectos filtrados por zona:', error);
            });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchTableData = (giro) => {
        let table = '';
        switch (giro.toLowerCase()) {
            case 'ferretería':
                table = 'Ferreteria';
                break;
            case 'papelería':
                table = 'Papelería';
                break;
            case 'mecánica':
                table = 'Mecanica';
                break;
            case 'herrería':
                table = 'Herreria';
                break;
            case 'cerrajería':
                table = 'Cerrajería';
                break;
            case 'vidrio y aluminio':
                table = 'Vidrio_y_Aluminio';
                break;
            case 'plomería':
                table = 'Plomería';
                break;
            case 'construcción':
                table = 'Construcción';
                break;
            case 'pintura':
                table = 'Pintura';
                break;
            case 'eléctricoiluminación':
                table = 'EléctricoIluminación';
                break;
            case 'construcción ligera':
                table = 'ConstrucciónLigera';
                break;
            default:
                table = 'Ferreteria';  // Default to "Ferreteria" if no match
        }

        // Llamada a la API para obtener los datos de la tabla correspondiente
        axios.get(`http://192.168.3.27:3007/api/Queretaro/${table}`)
            .then((response) => {
                setTabData(response.data);  // Establecer los datos para mostrar en el segundo tab
            })
            .catch((error) => {
                console.error('Error al obtener los datos de la tabla:', error);
            });
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);

        // Cuando se cambia al segundo tab, obtener los datos de la tabla según el giro
        if (newValue === 1 && selectedProject) {
            const table = selectedProject.giro;
            fetchTableData(table);
        }
    };

    useEffect(() => {
        const daysOfWeek = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        const today = new Date().getDay();  // Obtén el día de la semana como número (0-6)
        console.log("Día actual:", daysOfWeek[today]);  // Verifica que este valor sea correcto
        setCurrentDay(daysOfWeek[today]);  // Establece el día actual en la variable `currentDay`
    }, []);

    useEffect(() => {
        filterData();  // Vuelve a filtrar cuando el día actual cambie
    }, [currentDay]);

    const handleZonaChange = (event) => {
        setSelectedZona(event.target.value);
    };

    const handleRutaChange = (event) => {
        setSelectedRuta(event.target.value);
    };

    const handleDiaVisitaChange = (event) => {
        setDiaVisita(event.target.value);
    };

    useEffect(() => {
        filterData(); // Actualiza los datos cuando cambie algún filtro
    }, [selectedZona, selectedRuta, diaVisita]);

    // Manejo de las rutas seleccionadas
    const handleRoutesChange = (event) => {
        const value = event.target.value;
        const routes = value.split(',').map(route => route.trim());  // Convertir las rutas en un array
        setSelectedRoutes(routes);
    };

    // Obtener datos filtrados cuando se aplican filtros
    const fetchFilteredData = () => {
        if (!selectedZone || selectedRoutes.length === 0) return; // No hacer nada si no hay filtros

        axios.get('http://192.168.3.27:3007/api/Queretaro/proyectoqueretaro/filtrado', {
            params: {
                zona: selectedZone,
                rutas: selectedRoutes.join(',')  // Pasar las rutas como una cadena
            }
        })
            .then(response => {
                setData(response.data);  // Establecer los datos filtrados
            })
            .catch(error => {
                console.error('Error al obtener los datos filtrados:', error);
            });
    };

    /*
     * 🟢 **Vista Principal: Formulario y Resultados**
     */
    const renderVistaPrincipal = () => (
        <>

            <Grid container spacing={2} justifyContent="center" alignItems="center">
                {/* Filtro por Zona */}
                <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ maxWidth: '300px' }}>
                        <InputLabel id="zona-label">Zona</InputLabel>
                        <Select
                            labelId="zona-label"
                            value={selectedZona}
                            onChange={handleZonaChange}
                            label="Zona"
                        >
                            <MenuItem value="">Todas las zonas</MenuItem>
                            <MenuItem value="Zona 1">Zona 1</MenuItem>
                            <MenuItem value="Zona 2">Zona 2</MenuItem>
                            <MenuItem value="Zona 3">Zona 3</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Filtro por Ruta */}
                <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ maxWidth: '300px' }}>
                        <InputLabel id="ruta-label">Ruta</InputLabel>
                        <Select
                            labelId="ruta-label"
                            value={selectedRuta}
                            onChange={handleRutaChange}
                            label="Ruta"
                        >
                            <MenuItem value="">Todas las rutas</MenuItem>
                            <MenuItem value="1">Ruta 1</MenuItem>
                            <MenuItem value="2">Ruta 2</MenuItem>
                            <MenuItem value="3">Ruta 3</MenuItem>
                            <MenuItem value="4">Ruta 4</MenuItem>
                            <MenuItem value="5">Ruta 5</MenuItem>
                        </Select>
                    </FormControl>


                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setSelectedPersona('');
                            setSelectedRuta('');
                            setDiaVisita('');
                            setRutaReparto('');
                            filterData();
                        }}
                    >
                        Reiniciar Filtros
                    </Button>

                </Grid>

            </Grid>

            <br />

            <Grid container spacing={2} justifyContent="center">
                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <Grid item xs={12} key={index}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }} onClick={() => handleClickOpen(row)}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                {/* Columna 1: Imagen */}
                                <CardMedia
                                    component="img"
                                    height="120"
                                    image={row.foto}
                                    alt={row.nombre}
                                    sx={{ objectFit: 'cover', width: '120px', height: '120px', marginRight: '16px' }}
                                />

                                {/* Columna 2: Información */}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="div">
                                        {row.nombre}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Zona: {row.zona}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Segmento: {row.segmento}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Día de Visita: {row.dia_visita}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Ruta: {row.ruta}
                                    </Typography>

                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <TablePagination
                rowsPerPageOptions={[5, 10, 15, 18, 20, 30]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage} />

            {/* aqui inicia las tablas y los modal */}
            {selectedProject && (
                <Dialog
                    open={open}
                    onClose={handleClose}
                    BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.6)' } }}  // Este estilo puede bloquear la interacción, intenta comentarlo.
                    sx={{
                        '& .MuiDialog-paper': {
                            maxWidth: '90vw',  // Establecer el ancho máximo a un porcentaje del ancho de la ventana
                            width: '90vw',      // Puedes cambiar este valor según tus necesidades
                        },
                    }}
                >

                    <DialogTitle>{selectedProject ? selectedProject.nombre : 'Cargando...'}</DialogTitle>
                    <DialogContent>
                        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Información del Proyecto">
                            <Tab label="Información General" />
                            <Tab label="Datos de Compra" />
                        </Tabs>

                        {tabIndex === 0 && (
                            <Box sx={{ paddingTop: 2 }}>
                                <Grid container spacing={2}>
                                    {/* Fila 1 */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Nombre Encargado"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.nombre_encargado}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Teléfono"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.num_telf}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    {/* Fila 2 */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Correo"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.correo}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Calle Principal"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.calle_principal}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    {/* Fila 3 */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Num Ext"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.num_ext}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ruta"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.ruta}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Latitud"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.lat}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    {/* Fila 4 */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Longitud"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.long}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ marginTop: 2 }}>
                                            <a href={`https://www.google.com/maps?q=${selectedProject.lat},${selectedProject.long}`} target="_blank" rel="noopener noreferrer">
                                                <IconButton sx={{ color: 'red' }}><LocationOnIcon /></IconButton> Ver en el mapa
                                            </a>
                                        </Typography>
                                    </Grid>
                                    {/* Fila 5 */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Zona"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.zona}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Giro"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.giro}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    {/* Fila 6 */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Portafolio"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.portafolio}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Segmento"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.segmento}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Dia Visita"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.dia_visita}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Dia Reparto"
                                            variant="outlined"
                                            fullWidth
                                            value={selectedProject.dia_reparto}
                                            sx={{ marginBottom: 2 }}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {tabIndex === 1 && (
                            <Box sx={{ paddingTop: 2 }}>
                                {tabData.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Código</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Descripción</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Categoria</th>
                                                {/* Mostrar solo la columna correspondiente según el segmento */}
                                                {selectedProject.segmento === 'ORO' && <th style={{ padding: '8px', textAlign: 'left' }}>ORO</th>}
                                                {selectedProject.segmento === 'PLATA' && <th style={{ padding: '8px', textAlign: 'left' }}>PLATA</th>}
                                                {selectedProject.segmento === 'BRONCE' && <th style={{ padding: '8px', textAlign: 'left' }}>BRONCE</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tabData
                                                .sort((a, b) => a.Codigo - b.Codigo)
                                                .map((item, index) => {
                                                    if (
                                                        (selectedProject.segmento === 'ORO' && item.ORO === "Aplica") ||
                                                        (selectedProject.segmento === 'PLATA' && item.PLATA === "Aplica") ||
                                                        (selectedProject.segmento === 'BRONCE' && item.BRONCE === "Aplica")
                                                    ) {
                                                        return (
                                                            <tr key={index}>
                                                                <td style={{ padding: '8px', textAlign: 'left' }}>{item.Codigo}</td>
                                                                <td style={{ padding: '8px', textAlign: 'left' }}>{item.Descripcion}</td>
                                                                <td style={{ padding: '8px', textAlign: 'left' }}>{item.Categoria}</td>
                                                                {/* Mostrar la columna correspondiente al segmento */}
                                                                {selectedProject.segmento === 'ORO' && item.ORO === "Aplica" && <td style={{ padding: '8px', textAlign: 'left' }}>{item.ORO}</td>}
                                                                {selectedProject.segmento === 'PLATA' && item.PLATA === "Aplica" && <td style={{ padding: '8px', textAlign: 'left' }}>{item.PLATA}</td>}
                                                                {selectedProject.segmento === 'BRONCE' && item.BRONCE === "Aplica" && <td style={{ padding: '8px', textAlign: 'left' }}>{item.BRONCE}</td>}
                                                            </tr>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <Typography variant="body1">No hay datos disponibles</Typography>
                                )}
                            </Box>
                        )}

                    </DialogContent >
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog >
            )}
        </>
        
    );

    /*
     * 🟠 **Vista 1: Formulario Adicional**
     */
    const renderTable = () => (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Zona</TableCell>
                    <TableCell>Ruta</TableCell>
                    <TableCell>Día de Visita</TableCell>
                    <TableCell>Segmento</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell>{row.zona}</TableCell>
                        <TableCell>{row.ruta}</TableCell>
                        <TableCell>{row.dia_visita}</TableCell>
                        <TableCell>{row.segmento}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    // Renderizado del formulario
    const renderVista1 = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5">Vista 1: Formulario Personalizado</Typography>

            <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel>Seleccionar Zona</InputLabel>
                <Select
                    value={selectedZone}
                    onChange={handleZoneChange}
                    label="Seleccionar Zona"
                >
                    <MenuItem value="">Todas las Zonas</MenuItem>
                    <MenuItem value="Zona 1">Zona 1</MenuItem>
                    <MenuItem value="Zona 2">Zona 2</MenuItem>
                    <MenuItem value="Zona 3">Zona 3</MenuItem>
                </Select>
            </FormControl>

            {/* Mostrar la tabla con los datos filtrados */}
            {data.length > 0 ? renderTable() : <Typography variant="body1" sx={{ mt: 2 }}>No hay datos disponibles</Typography>}
        </Box>
    );

    /*
     🔵 Vista 2: Mapa Personalizado de Google Maps
    */
    const renderVista2 = () => (
        <Box sx={{ p: 3 }}>
            <iframe
                src="https://www.google.com/maps/d/embed?mid=16AT0b4cYTSNQQVQYHkQKC8Rp4Q1g2VE&ll=20.561320310882667,-100.38615969894488&z=15"
                width="100%"
                height="600px"
                title="Mapa Personalizado"
                style={{ border: 'none' }}
                allowFullScreen
            />
        </Box>
    );

    /*
     * 🎯 **Renderizar Vistas**
     */
    const renderView = () => {
        switch (currentView) {
            case 'default': return renderVistaPrincipal();
            case 'view1': return renderVista2();
            case 'view2': return renderVista1();
            default: return <Typography variant="h6">Selecciona una vista para empezar</Typography>;
        }
    };

    return (
        <>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Button onClick={() => setCurrentView('view1')}>Mapeo</Button>
                <Button onClick={() => setCurrentView('view2')}>Informacion</Button>
                <Button onClick={() => setCurrentView('default')}>Lugares de visita</Button>
            </Grid>
            {renderView()}
        </>
    );
}

export default ProyectoQueretaro;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card, CardContent, CardMedia, Grid, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box, TextField, TablePagination,
    Tabs, Tab, MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell, TableBody, Modal
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';


function ProyectoQueretaro() {

    const [ciudadSeleccionada, setCiudadSeleccionada] = useState("queretaro");




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
    const [currentView, setCurrentView] = useState('empty');
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedPersona, setSelectedPersona] = useState('');
    const [selectedRoutes, setSelectedRoutes] = useState([]);

    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [modalImagenAbierto, setModalImagenAbierto] = useState(false);

    const abrirImagen = (src) => {
        setImagenSeleccionada(src);
        setModalImagenAbierto(true);
    };

    const cerrarImagen = () => {
        setModalImagenAbierto(false);
        setImagenSeleccionada(null);
    };


    const [exhibitors, setExhibitors] = useState([]);

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
            axios.get(`http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro?dia_visita=${currentDay}`)
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
        console.log('Proyecto seleccionado:', project);
        setSelectedProject(project);
        setOpen(true);

        const { giro, portafolio, segmento, exhibidores } = project;

        const encodedGiro = encodeURIComponent(giro);
        const encodedPortafolio = encodeURIComponent(portafolio);
        const encodedSegmento = encodeURIComponent(segmento);

        // Guardar los exhibidores directamente
        setExhibitors(exhibidores || []);

        // Hacer la consulta a la API para obtener los datos filtrados por categoría y segmento
        axios.get(`http://66.232.105.87:3007/api/Queretaro/category/${encodedGiro}/${encodedPortafolio}/${encodedSegmento}`)
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
        axios.get(`http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro?zona=${zone}`)
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
        axios.get(`http://66.232.105.87:3007/api/Queretaro/${table}`)
            .then((response) => {
                setTabData(response.data);  // Establecer los datos para mostrar en el segundo tab
            })
            .catch((error) => {
                console.error('Error al obtener los datos de la tabla:', error);
            });
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);

        if (newValue === 1 && selectedProject) {
            const table = selectedProject.giro;
            fetchTableData(table);
        }
    };

    useEffect(() => {
        const daysOfWeek = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        const today = new Date().getDay();
        console.log("Día actual:", daysOfWeek[today]);
        setCurrentDay(daysOfWeek[today]);
    }, []);

    useEffect(() => {
        filterData();
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
        filterData();
    }, [selectedZona, selectedRuta, diaVisita]);

    const handleRoutesChange = (event) => {
        const value = event.target.value;
        const routes = value.split(',').map(route => route.trim());
        setSelectedRoutes(routes);
    };

    const fetchFilteredData = () => {
        if (!selectedZone || selectedRoutes.length === 0) return;

        axios.get('http://66.232.105.87:3007/api/Queretaro/proyectoqueretaro/filtrado', {
            params: {
                zona: selectedZone,
                rutas: selectedRoutes.join(',')
            }
        })
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error al obtener los datos filtrados:', error);
            });
    };

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
                                    onClick={(e) => {
                                        e.stopPropagation(); // 👈 Detiene el evento para que no llegue al Card
                                        abrirImagen(row.foto); // Abre el modal de la imagen
                                    }}
                                    sx={{
                                        objectFit: 'cover',
                                        width: '120px',
                                        height: '120px',
                                        marginRight: '16px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        transition: '0.3s',
                                        '&:hover': {
                                            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                            transform: 'scale(1.03)',
                                        }
                                    }}
                                />



                                {/* Columna 2: Información */}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="div">
                                        {row.nombre}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {row.zona}
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

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                            Status:
                                        </Typography>
                                        <FiberManualRecordIcon
                                            sx={{
                                                fontSize: 14,
                                                color: row.status === 'ACTIVO'
                                                    ? 'green'
                                                    : row.status === 'PROSPECTO'
                                                        ? 'orange'
                                                        : 'gray',
                                                mr: 0.5
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {row.status}
                                        </Typography>
                                    </Box>



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

                    <DialogTitle>
                        {selectedProject ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {selectedProject.nombre}
                                </Typography>

                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    /
                                </Typography>

                                <FiberManualRecordIcon
                                    sx={{
                                        fontSize: 16,
                                        color:
                                            selectedProject.status === 'ACTIVO'
                                                ? 'green'
                                                : selectedProject.status === 'PROSPECTO'
                                                    ? 'orange'
                                                    : 'gray',
                                    }}
                                />
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {selectedProject.status}
                                </Typography>
                            </Box>
                        ) : (
                            'Cargando...'
                        )}
                    </DialogTitle>



                    <DialogContent>
                        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Información del Proyecto">
                            <Tab label="Información General" />
                            <Tab label="Datos de Compra" />
                            <Tab label="Marketing" />
                            <Tab label="Promociones" />
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
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px 8px', marginTop: '16px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Código</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Descripción</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Precio</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Inner</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Master</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>TP</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Precio TP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tabData.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.Codigo}</td>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.Descripcion}</td>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.Precio}</td>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.Inner}</td>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.Master}</td>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.TP}</td>
                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{item.Precio_T}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <Typography variant="body1">No hay datos disponibles</Typography>
                                )}


                            </Box>
                        )}

                        {tabIndex === 2 && (
                            <Box sx={{ paddingTop: 2 }}>
                                {exhibitors.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {exhibitors.map((exhibitor) => (
                                            <Grid item xs={12} sm={6} md={4} key={exhibitor.id}>
                                                <Card>
                                                    <CardMedia
                                                        component="img"
                                                        height="140"
                                                        image={exhibitor.imagen}
                                                        alt={exhibitor.descripcion || "Imagen no disponible"}
                                                        onError={(e) => e.target.src = "/imagenes/default.png"}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Evita que se dispare algún evento del Card si existiera
                                                            abrirImagen(exhibitor.imagen);
                                                        }}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            borderRadius: '4px',
                                                            objectFit: 'cover',
                                                            transition: '0.3s',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                                                            }
                                                        }}
                                                    />

                                                    <CardContent>
                                                        <Typography variant="h6">{exhibitor.descripcion}</Typography>
                                                        <Typography variant="body2">Medidas: {exhibitor.medidas}</Typography>
                                                        <Typography variant="body2">Material: {exhibitor.material}</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography variant="body1">No hay exhibidores disponibles.</Typography>
                                )}
                            </Box>
                        )}

                        {tabIndex === 3 && (
                            <Box sx={{ paddingTop: 2 }}>
                                <p>Prodcutos nuevos</p>
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


    // Mapeo de la informacion

    const convertToEmbedUrl = (url) => {
        if (!url.includes("viewer")) return url; // Si ya es embed, no cambiarlo
        return url.replace("/viewer?", "/embed?");
    };

    const mainMap = "https://www.google.com/maps/d/embed?mid=16AT0b4cYTSNQQVQYHkQKC8Rp4Q1g2VE&ll=20.561320310882667,-100.38615969894488&z=15";

    const otherMaps = [
        convertToEmbedUrl("https://www.google.com/maps/d/u/0/viewer?mid=1ih6-YP-d1yE3ZviYr5z-ddiPhdwfVCI&femb=1&ll=20.563953977471986%2C-100.39009649543087&z=13"),
        convertToEmbedUrl("https://www.google.com/maps/d/u/0/viewer?mid=1VSCN-JF-whrAHR5twiO6CRrPfxOAXu8&femb=1&ll=20.640139755227455%2C-100.42183552642823&z=12"),
        convertToEmbedUrl("https://www.google.com/maps/d/u/0/viewer?mid=1KXHSTDk2Cp0AjYSE_y3mXsO9s9XfAGs&femb=1&ll=20.636652202622624%2C-100.44765901324463&z=13"),
        convertToEmbedUrl("https://www.google.com/maps/d/u/0/viewer?mid=15d-dWNOfWPMZnm85WI0hYTaqUvNB3Yg&ll=20.64328286231578%2C-100.39405011241543&z=13"),
        convertToEmbedUrl("https://www.google.com/maps/d/u/0/viewer?mid=16Mxu_WIDcLeIdh3TpdM42BfPEZTS49A&ll=20.562950614267464%2C-100.39048423373035&z=14"),
    ];

    const imagePaths = [
        "/Rutas/Ruta1.jpeg",
        "/Rutas/Ruta2.jpeg",
        "/Rutas/Ruta3.jpeg",
        "/Rutas/Ruta4.jpeg",
        "/Rutas/Ruta5.jpeg",
    ];

    const MapaRutas = () => {
        const [openModal, setOpenModal] = useState(false);
        const [selectedImage, setSelectedImage] = useState("");
        const [selectedMap, setSelectedMap] = useState("");

        // Función para abrir el modal con la imagen y el mapa seleccionados
        const handleOpenModal = (image, map) => {
            setSelectedImage(image);
            setSelectedMap(map);
            setOpenModal(true);
        };

        // Función para cerrar el modal
        const handleCloseModal = () => {
            setOpenModal(false);
        };

        return (
            <Box sx={{ p: 3 }}>
                {/* Mapa principal arriba */}
                <Box sx={{ mb: 3 }}>
                    <iframe
                        src={mainMap}
                        width="100%"
                        height="600px"
                        title="Mapa Principal"
                        style={{ border: "none" }}
                        allowFullScreen
                    />
                </Box>

                {/* Otros mapas con sus imágenes */}
                <Grid container spacing={2} justifyContent="center">
                    {otherMaps.map((link, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card sx={{ maxWidth: "100%", cursor: "pointer" }} onClick={() => handleOpenModal(imagePaths[index], link)}>
                                {/* Imagen asociada al mapa */}
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: "100%",
                                        height: 180,
                                        objectFit: "contain",
                                    }}
                                    image={imagePaths[index]}
                                    alt={`Ruta ${index + 1}`}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                {/* Mapa en iframe */}
                                <iframe
                                    src={link}
                                    width="100%"
                                    height="300px"
                                    title={`Mapa ${index + 2}`}
                                    style={{ border: "none" }}
                                    allowFullScreen
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Modal para mostrar la imagen y el mapa en grande */}
                <Modal open={openModal} onClose={handleCloseModal}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{
                        bgcolor: "white",
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 24,
                        width: "80vw",
                        height: "80vh",
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        {/* Botón de cierre */}
                        <IconButton onClick={handleCloseModal} sx={{ alignSelf: "flex-end" }}>
                            <CloseIcon />
                        </IconButton>

                        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>Vista Ampliada</Typography>

                        {/* Imagen ampliada con mayor tamaño */}
                        <CardMedia
                            component="img"
                            sx={{
                                width: "100%",      // Ocupa el ancho completo del modal
                                maxWidth: "95vw",   // Máximo 80% del viewport width
                                height: "auto",
                                maxHeight: "95vh",  // Máximo 80% del viewport height
                                objectFit: "contain",
                                marginBottom: 2
                            }}
                            image={selectedImage}
                            alt="Imagen ampliada"
                        />

                        {/* Mapa ampliado */}
                        <iframe
                            src={selectedMap}
                            width="100%"
                            height="400px"
                            title="Mapa ampliado"
                            style={{ border: "none" }}
                            allowFullScreen
                        />
                    </Box>
                </Modal>

            </Box>
        );
    };

    const transformImageUrl = (url) => {
        if (!url || typeof url !== 'string') {
            return "https://via.placeholder.com/140"; // Imagen de respaldo si la URL es inválida
        }

        if (url.includes("drive.google.com")) {
            const fileIdMatch = url.match(/id=([-\w]+)/);
            return fileIdMatch ? `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}` : url;
        }

        return url;
    };

    //Menu de los de queretaro 

    const renderView = () => {
        if (ciudadSeleccionada === "queretaro") {
            return (
                <>
                    <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                        <Button onClick={() => setCurrentView('view1')}>Mapa</Button>
                        <Button onClick={() => setCurrentView('default')}>Lugares de visita</Button>
                    </Grid>

                    {currentView === 'default' && renderVistaPrincipal()}
                    {currentView === 'view1' && <MapaRutas />}
                </>
            );
        } else if (ciudadSeleccionada === "guadalajara") {
            return (
                <>
                    <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                        <Button onClick={() => setCurrentView('view1')}>Mapa</Button>
                        <Button onClick={() => setCurrentView('default')}>Lugares de visita</Button>
                    </Grid>
                    {currentView === 'default' && <Typography variant="h6" sx={{ textAlign: 'center' }}>Lugares de Visita en Guadalajara</Typography>}
                    {currentView === 'view1' && <MapaGuadalajara />}
                </>
            );
        }
    };

    //Menu de guadalajara 

    const mainMapGuadalajara = "https://www.google.com/maps/d/embed?mid=12F4jYMqNRKzfA-yKLT103arH_z6-O20&usp=sharing";

    const guadalajaraMaps = [
        "https://www.google.com/maps/d/embed?mid=1Kquz4EpHe4OC8iIHDr4OGORC1mCgfas&usp=sharing",
        "https://www.google.com/maps/d/embed?mid=18tM2i6o7VGZxaKbY4OovV7Goo2NT6ew&usp=sharing",
        "https://www.google.com/maps/d/embed?mid=1FbRzanZ4v40HgMhTIWR9YPkL2Yapzis&usp=sharing",
        "https://www.google.com/maps/d/embed?mid=1zZGg93zlxhcz1wYZQCP-k1vLlxTlqYw&usp=sharing",
        "https://www.google.com/maps/d/embed?mid=1BrkCdcLCVZF9joPSaclV8TSHSEwekyM&usp=sharing",
        "https://www.google.com/maps/d/embed?mid=12F4jYMqNRKzfA-yKLT103arH_z6-O20&usp=sharing",
    ];

    const MapaGuadalajara = () => (
        <Box sx={{ p: 3 }}>
            {/* Mapa principal */}
            <iframe
                src={mainMapGuadalajara}
                width="100%"
                height="600px"
                title="Mapa Guadalajara"
                style={{ border: "none", marginBottom: "20px" }}
                allowFullScreen
            />
            {/* Mapas adicionales */}
            <Grid container spacing={2} justifyContent="center">
                {guadalajaraMaps.map((map, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ maxWidth: "100%", mb: 2 }}>
                            <iframe
                                src={map}
                                width="100%"
                                height="300px"
                                title={`Mapa Adicional ${index + 1}`}
                                style={{ border: "none" }}
                                allowFullScreen
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );



    return (
        <>
            {/* Botones para cambiar la ciudad */}
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Button onClick={() => setCiudadSeleccionada("guadalajara")} sx={{ color: "red" }}>Ver Guadalajara</Button>
                <Button onClick={() => setCiudadSeleccionada("queretaro")} sx={{ color: "red" }}>Ver Querétaro</Button>
            </Grid>

            {/* Renderiza la vista seleccionada */}
            {renderView()}

            {/* //MODAL PARA ABRIR LAS IMAGENES */}
            <Modal
                open={modalImagenAbierto}
                onClose={cerrarImagen}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 2,
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    outline: 'none',
                    boxShadow: 24
                }}>
                    <IconButton onClick={cerrarImagen} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <CloseIcon />
                    </IconButton>
                    <img
                        src={imagenSeleccionada}
                        alt="Vista ampliada"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '80vh',
                            borderRadius: '8px'
                        }}
                        onError={(e) => e.target.src = "/imagenes/default.png"}
                    />
                </Box>
            </Modal>



        </>
    );

}

export default ProyectoQueretaro;
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
    Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tabs, Tab, Modal, Box, Dialog, DialogTitle, InputLabel,
    DialogContent, DialogActions, Snackbar, TextField, Alert, useMediaQuery, IconButton, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel, Select, MenuItem, TablePagination, Grid
} from "@mui/material";
import { Inventory, AddCircle, Settings, Dashboard, CheckCircle, } from "@mui/icons-material";
import Swal from "sweetalert2";
import { UserContext } from "../context/UserContext";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import MySwal from "sweetalert2";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import GridViewIcon from '@mui/icons-material/GridView';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';


import RefreshIcon from "@mui/icons-material/Refresh";

function INVENTARIODOS() {

    //insertara Nuevo Producto, Editar y Eliminar 
    const [modalOpen, setModalOpen] = useState(false);
    const [nuevaUbicacion, setNuevaUbicacion] = useState({
        ubi: '',
        code_prod: '',
        cant_stock: ''
    });

    const abrirModal = () => setModalOpen(true);
    const cerrarModal = () => {
        setModalOpen(false);
        setNuevaUbicacion({ ubi: '', code_prod: '', cant_stock: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaUbicacion(prev => ({ ...prev, [name]: value }));
    };

    const guardarUbicacion = async () => {
        const { ubi, code_prod, cant_stock } = nuevaUbicacion;

        // 1. Cerramos primero el modal de MUI
        cerrarModal();

        // 2. Mostramos SweetAlert con confirmación
        const confirmacion = await Swal.fire({
            title: '¿Guardar nueva ubicación?',
            html: `
            <p><strong>Ubicación:</strong> ${ubi}</p>
            <p><strong>Código del Producto:</strong> ${code_prod}</p>
            <p><strong>Cantidad en Stock:</strong> ${cant_stock}</p>
          `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        // 3. Si el usuario confirma, procede a guardar
        if (confirmacion.isConfirmed) {
            axios.post("http://localhost:3007/api/Inventario/insertar-ubicacion", nuevaUbicacion)
                .then(res => {
                    Swal.fire("Guardado", "La ubicación se guardó correctamente", "success");

                    // Recarga datos después de insertar
                    axios.get("http://localhost:3007/api/Inventario/inventario-ubicaciones")
                        .then(res => {
                            setData(res.data);
                            setFiltroData(res.data);
                        });
                })
                .catch(err => {
                    console.error("Error al insertar:", err);
                    Swal.fire("Error", "Hubo un problema al guardar", "error");
                });
        }
    };

    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [ubicacionEditando, setUbicacionEditando] = useState(null);

    const abrirModalEditar = (row) => {
        setUbicacionEditando({
            ...row,
            pasillo: row.pasillo ?? '',
            lote: row.lote ?? '',
            almacen: row.almacen ?? ''
        });
        setModalEditarOpen(true);
    };


    const cerrarModalEditar = () => {
        setModalEditarOpen(false);
        setUbicacionEditando(null);
        setCantidadAdicionales(0);
        setProductosAdicionales([]);
    };

    const guardarCambiosUbicacion = async () => {
        try {
            const payload = {
                ...ubicacionEditando,
                adicionales: ubicacionEditando.estado === "Compartido" ? productosAdicionales : []
            };

            await axios.put("http://localhost:3007/api/Inventario/actualizar-ubicacion", payload);
            Swal.fire("Actualizado", "La ubicación fue actualizada correctamente", "success");

            cerrarModalEditar();

            // Recargar datos
            const res = await axios.get("http://localhost:3007/api/Inventario/inventario-ubicaciones");
            setData(res.data);
            setFiltroData(res.data);

        } catch (error) {
            console.error("Error al actualizar:", error);
            Swal.fire("Error", "Hubo un problema al actualizar", "error");
        }
    };


    // Estado de Compartido 
    const [cantidadAdicionales, setCantidadAdicionales] = useState(0);
    const [productosAdicionales, setProductosAdicionales] = useState([]);

    useEffect(() => {
        if (cantidadAdicionales > productosAdicionales.length) {
            setProductosAdicionales(prev => [...prev, { code_prod: '', cant_stock: '' }]);
        }
    }, [cantidadAdicionales]);



    const [estado, setEstado] = useState('ninguno');
    const [vecesInsertar, setVecesInsertar] = useState(0);
    const [productos, setProductos] = useState([]);

    const handleCambiarEstado = (e) => {
        const valor = e.target.value;
        setEstado(valor);
        if (valor !== 'compartido') {
            setVecesInsertar(0);
            setProductos([]);
        }
    };

    const agregarProducto = () => {
        setProductos([...productos, { code_prod: '', cant_stock: '' }]);
        setVecesInsertar(prev => prev + 1);
    };

    const quitarProducto = () => {
        if (vecesInsertar > 0) {
            const nuevos = [...productos];
            nuevos.pop();
            setProductos(nuevos);
            setVecesInsertar(prev => prev - 1);
        }
    };

    const handleCambiarValor = (index, field, value) => {
        const nuevos = [...productos];
        nuevos[index][field] = value;
        setProductos(nuevos);
    };

    //Eliminar ubicaciones 

    const eliminarUbicacion = async (id_ubi) => {
        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará permanentemente la ubicación.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {
            try {
                const res = await axios.delete(
                    `http://localhost:3007/api/Inventario/eliminar-ubicacion/${id_ubi}`
                );

                if (res.data.success) {
                    Swal.fire("Eliminado", "La ubicación fue eliminada correctamente.", "success");
                } else {
                    Swal.fire("Error", "No se encontró la ubicación para eliminar.", "error");
                }

                // Recargar datos después de eliminar
                const nuevaRespuesta = await axios.get(
                    "http://localhost:3007/api/Inventario/inventario-ubicaciones"
                );
                setData(nuevaRespuesta.data);
                setFiltroData(nuevaRespuesta.data);
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire("Error", "No se pudo eliminar la ubicación.", "error");
            }
        }
    };



    //Mostrar la informacion de la tabla 

    const [data, setData] = useState([]);
    const [page, setPage] = useState(0); // Página actual
    const [rowsPerPage, setRowsPerPage] = useState(20); // 20 por default
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:3007/api/Inventario/inventario-ubicaciones")
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar datos:", err);
                setLoading(false);
            });
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    //Filtro para los pares y impares 

    const [filtroData, setFiltroData] = useState([]); // datos filtrados
    const [tipoFiltro, setTipoFiltro] = useState("todos"); // control del filtro

    useEffect(() => {
        axios.get("http://localhost:3007/api/Inventario/inventario-ubicaciones")
            .then(res => {
                setData(res.data);
                setFiltroData(res.data); // al inicio mostramos todo
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar datos:", err);
                setLoading(false);
            });
    }, []);

    const filtrarPares = () => {
        const filtrado = data.filter(row => {
            if (!row.ubicacion) return false; // Evitar errores
            const partes = row.ubicacion.split("-");
            const numeroCentral = parseInt(partes[1], 10);
            return !isNaN(numeroCentral) && numeroCentral % 2 === 0;
        });
        setFiltroData(filtrado);
        setPage(0);
    };

    const filtrarImpares = () => {
        const filtrado = data.filter(row => {
            if (!row.ubicacion) return false;
            const partes = row.ubicacion.split("-");
            const numeroCentral = parseInt(partes[1], 10);
            return !isNaN(numeroCentral) && numeroCentral % 2 !== 0;
        });
        setFiltroData(filtrado);
        setPage(0);
    };

    const mostrarTodo = () => {
        setFiltroData(data);
        setPage(0);
        setTipoFiltro("todos");
    };

    //Filtro por ubi y codigo 

    const [busquedaUbicacion, setBusquedaUbicacion] = useState("");
    const [busquedaCodigo, setBusquedaCodigo] = useState("");
    const [busquedaNivel, setBusquedaNivel] = useState("");

    const filtrarDatos = (ubicacionTexto, codigoTexto, nivelTexto) => {
        const ubicacion = ubicacionTexto.toUpperCase();
        const codigo = codigoTexto.trim().toLowerCase();
        const nivel = nivelTexto.trim();

        const filtrado = data.filter((row) => {
            const cumpleUbicacion =
                !ubicacion || (row.ubicacion && row.ubicacion.toUpperCase().includes(ubicacion));
            const cumpleCodigo =
                !codigo ||
                (row.codigo_producto && row.codigo_producto.toString().includes(codigo)) ||
                (row.descripcion && row.descripcion.toLowerCase().includes(codigo));
            const cumpleNivel =
                !nivel || (row.nivel !== null && row.nivel.toString().includes(nivel));

            return cumpleUbicacion && cumpleCodigo && cumpleNivel;
        });

        setFiltroData(filtrado);
        setPage(0);
    };



    const handleBusquedaUbicacion = (e) => {
        const valor = e.target.value;
        setBusquedaUbicacion(valor);
        filtrarDatos(valor, busquedaCodigo);
    };

    const handleBusquedaCodigo = (e) => {
        const valor = e.target.value;
        setBusquedaCodigo(valor);
        filtrarDatos(busquedaUbicacion, valor);
    };

    // PARA HCER LOS MOVIEMINETO DE LOS ALMACENES 

    const [arribosPorTabla, setArribosPorTabla] = useState({});
    const [tablaSeleccionada, setTablaSeleccionada] = useState("principal");



    useEffect(() => {
        axios.get("http://localhost:3007/api/Inventario/arribos")
            .then(res => {
                setArribosPorTabla(res.data);
            })
            .catch(err => {
                console.error("Error al cargar arribos:", err);
            });
    }, []);

    const [modalTraspasoOpen, setModalTraspasoOpen] = useState(false);
    const [datoTraspaso, setDatoTraspaso] = useState(null);
    const [almacenDestino, setAlmacenDestino] = useState("");
    const [cantidadMover, setCantidadMover] = useState("");
    const { user } = useContext(UserContext);

    const almacenesDisponibles = [
        "departamental",
        "maq_externa",
        "cuarentena",
        "exportaciones",
        "segunda",
        "devoluciones",
        "diferencia",
        "muestras",
    ];

    const abrirModalTraspaso = (row) => {
        setDatoTraspaso(row);
        setAlmacenDestino("");
        setCantidadMover("");
        setModalTraspasoOpen(true);
    };

    const cerrarModalTraspaso = () => {
        setModalTraspasoOpen(false);
        setDatoTraspaso(null);
    };

    const realizarTraspaso = async () => {
        const cantidadNum = Number(cantidadMover);

        if (!datoTraspaso || !almacenDestino) {
            Swal.fire("Faltan datos", "Debes seleccionar el almacén destino", "warning");
            return;
        }

        if (!cantidadMover || cantidadNum <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }

        if (cantidadNum > datoTraspaso.cantidad_stock) {
            Swal.fire("Cantidad excedida", "La cantidad a mover es mayor al stock disponible", "error");
            return;
        }

        try {
            const payload = {
                id_ubicacion: datoTraspaso.ubicacion,
                code_prod: datoTraspaso.codigo_producto,
                cant_stock: cantidadNum,
                almacen_origen_tabla: tablaSeleccionada, // 👈 importante, se lo mandamos al backend
                almacen_entrada: almacenDestino,
                codigo_salida: user.id,
              };
              
              


            const response = await axios.post("http://localhost:3007/api/Inventario/traspaso", payload);
            if (response.data.success) {
                Swal.fire("✅ Éxito", "Traspaso realizado correctamente", "success");
                cerrarModalTraspaso();
                mostrarTodo();
            } else {
                Swal.fire("Error", response.data.error || "No se pudo completar el traspaso", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Hubo un problema al conectar con el servidor", "error");
        }
    };

    return (

        <Box sx={{ width: "90%", margin: "auto", marginTop: 5, maxWidth: "1200px" }}>

            <Tabs
                value={tablaSeleccionada}
                onChange={(e, nueva) => setTablaSeleccionada(nueva)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                    flexWrap: "wrap",
                    justifyContent: "center",
                    "& .MuiTabs-flexContainer": {
                        flexWrap: "wrap",
                        justifyContent: "center"
                    }
                }} >

                <Tab icon={<GridViewIcon />} iconPosition="top" label="Inventario 7050" value="principal" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Departamental 7066" value="departamental" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Maq Externa 7237" value="maq_externa" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Cuarentena 7008" value="cuarentena" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Exportaciones 7080" value="exportaciones" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Segunda 7235" value="segunda" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Devoluciones 7236" value="devoluciones" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Diferencia 7090" value="diferencia" />
                <Tab icon={<GridViewIcon />} iconPosition="top" label="Muestras 7081" value="muestras" />

            </Tabs>



            {tablaSeleccionada === "principal" ? (
                // TODO: Aquí se deja tal cual tu vista de inventario actual
                <>
                    <Box sx={{ width: "90%", margin: "auto", marginTop: 4, maxWidth: "1200px" }}>
                        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3 }}>

                            {/* Fila 1: Búsqueda */}
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1000px" }}>
                                <TextField
                                    label="Buscar por Ubicación"
                                    variant="outlined"
                                    value={busquedaUbicacion}
                                    onChange={handleBusquedaUbicacion}
                                    size="small"
                                    sx={{ minWidth: 220 }}
                                />

                                <TextField
                                    label="Buscar por Código"
                                    variant="outlined"
                                    value={busquedaCodigo}
                                    onChange={handleBusquedaCodigo}
                                    size="small"
                                    sx={{ minWidth: 220 }}
                                />
                                <TextField
                                    label="Buscar por Nivel"
                                    variant="outlined"
                                    value={busquedaNivel}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        setBusquedaNivel(valor);
                                        filtrarDatos(busquedaUbicacion, busquedaCodigo, valor);
                                    }}
                                    size="small"
                                    sx={{ minWidth: 180 }}
                                />
                            </Box>

                            {/* Fila 2: Botones */}
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1000px" }}>
                                <Button variant="contained" color="primary" onClick={filtrarPares}>
                                    Ubicaciones Pares
                                </Button>
                                <Button variant="contained" color="secondary" onClick={filtrarImpares}>
                                    Ubicaciones Impares
                                </Button>
                                <Button variant="outlined" color="inherit" onClick={mostrarTodo}>
                                    Mostrar Todo
                                </Button>
                                <Button variant="contained" color="success" onClick={abrirModal}>
                                    Agregar Ubicación
                                </Button>
                            </Box>

                        </Box>

                        <Typography variant="h5" align="center" gutterBottom>
                            Inventario 7050
                        </Typography>

                        <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 400, overflowY: "auto" }}>
                            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="tabla de inventario">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Ubicación</strong></TableCell>
                                        <TableCell><strong>Código del Producto</strong></TableCell>
                                        <TableCell><strong>Descripción</strong></TableCell>
                                        <TableCell><strong>Cantidad Stock</strong></TableCell>
                                        <TableCell><strong>Nivel</strong></TableCell>
                                        <TableCell><strong>Ingreso</strong></TableCell>
                                        <TableCell><strong>Acciones</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtroData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{row.ubicacion}</TableCell>
                                                <TableCell>{row.codigo_producto}</TableCell>
                                                <TableCell>{row.descripcion}</TableCell>
                                                <TableCell>{row.cantidad_stock}</TableCell>
                                                <TableCell>{row.nivel ?? "-"}</TableCell>
                                                <TableCell>{new Date(row.ingreso).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => abrirModalEditar(row)} sx={{ color: "#1976d2" }}>
                                                        <EditIcon />
                                                    </IconButton>

                                                    <IconButton onClick={() => eliminarUbicacion(row.id_ubi)} sx={{ color: "#d32f2f" }}>
                                                        <DeleteIcon />
                                                    </IconButton>

                                                    <IconButton onClick={() => abrirModalTraspaso(row)} sx={{ color: "#2e7d32" }}>
                                                        <CompareArrowsRoundedIcon />
                                                    </IconButton>

                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>

                            <TablePagination
                                component="div"
                                count={data.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={[20]}
                            />
                        </TableContainer>

                        {/* Modal para insertar productos */}
                        <Dialog open={modalOpen} onClose={cerrarModal}>
                            <DialogTitle>Agregar Nueva Ubicación</DialogTitle>
                            <DialogContent>
                                <TextField
                                    margin="dense"
                                    name="ubi"
                                    label="Ubicación"
                                    fullWidth
                                    value={nuevaUbicacion.ubi}
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    margin="dense"
                                    name="code_prod"
                                    label="Código del Producto"
                                    type="number"
                                    fullWidth
                                    value={nuevaUbicacion.code_prod}
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    margin="dense"
                                    name="cant_stock"
                                    label="Cantidad en Stock"
                                    type="number"
                                    fullWidth
                                    value={nuevaUbicacion.cant_stock}
                                    onChange={handleInputChange}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={cerrarModal}>Cancelar</Button>
                                <Button onClick={guardarUbicacion} variant="contained" color="primary">Guardar</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Modal para editar Informacion */}
                        <Dialog open={modalEditarOpen} onClose={cerrarModalEditar} fullWidth maxWidth="md">
                            <DialogTitle sx={{ pb: 2 }}>
                                <Typography variant="h6" align="center">
                                    Actualizar Ubicación
                                </Typography>
                            </DialogTitle>

                            <DialogContent>
                                {ubicacionEditando && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Código Ubicación"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={ubicacionEditando.ubicacion}
                                                onChange={(e) =>
                                                    setUbicacionEditando({ ...ubicacionEditando, ubicacion: e.target.value })
                                                }
                                                sx={{ mt: 1 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Código Producto"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={ubicacionEditando.codigo_producto}
                                                onChange={(e) =>
                                                    setUbicacionEditando({ ...ubicacionEditando, codigo_producto: e.target.value })
                                                }
                                                sx={{ mt: 1 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Cantidad Stock"
                                                fullWidth
                                                value={ubicacionEditando.cantidad_stock}
                                                onChange={(e) =>
                                                    setUbicacionEditando({ ...ubicacionEditando, cantidad_stock: e.target.value })
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Pasillo"
                                                fullWidth
                                                value={ubicacionEditando.pasillo || ""}
                                                onChange={(e) =>
                                                    setUbicacionEditando({ ...ubicacionEditando, pasillo: e.target.value })
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Lote"
                                                fullWidth
                                                value={ubicacionEditando.lote || ""}
                                                onChange={(e) =>
                                                    setUbicacionEditando({ ...ubicacionEditando, lote: e.target.value })
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Almacen"
                                                fullWidth
                                                value={ubicacionEditando.almacen || ""}
                                                onChange={(e) =>
                                                    setUbicacionEditando({ ...ubicacionEditando, almacen: e.target.value })
                                                }
                                            />
                                        </Grid>

                                        {/* Estado */}
                                        <Grid item xs={12}>
                                            <FormLabel component="legend">Estado</FormLabel>
                                            <RadioGroup
                                                row
                                                value={ubicacionEditando.estado || 'Ninguno'}
                                                onChange={(e) => setUbicacionEditando({ ...ubicacionEditando, estado: e.target.value })}
                                            >
                                                <FormControlLabel value="Compartido" control={<Radio />} label="Compartido" />
                                            </RadioGroup>
                                        </Grid>

                                        {/* Productos adicionales */}
                                        {ubicacionEditando.estado === "Compartido" && (
                                            <>
                                                <Grid item xs={12}>
                                                    <Button color="error" size="small" onClick={() => setCantidadAdicionales(c => Math.max(0, c - 1))}>-</Button>
                                                    <Button color="error" size="small" onClick={() => setCantidadAdicionales(c => c + 1)}>+1</Button>
                                                    <Typography variant="body2" sx={{ display: "inline", ml: 2 }}>
                                                        Productos a insertar: {cantidadAdicionales} veces
                                                    </Typography>
                                                </Grid>

                                                {productosAdicionales.slice(0, cantidadAdicionales).map((producto, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Código del Producto"
                                                                value={producto.code_prod}
                                                                onChange={(e) => {
                                                                    const nuevos = [...productosAdicionales];
                                                                    nuevos[idx].code_prod = e.target.value;
                                                                    setProductosAdicionales(nuevos);
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Cantidad en Stock"
                                                                value={producto.cant_stock}
                                                                onChange={(e) => {
                                                                    const nuevos = [...productosAdicionales];
                                                                    nuevos[idx].cant_stock = e.target.value;
                                                                    setProductosAdicionales(nuevos);
                                                                }}
                                                            />
                                                        </Grid>
                                                    </React.Fragment>
                                                ))}
                                            </>
                                        )}
                                    </Grid>
                                )}
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={cerrarModalEditar}>Cancelar</Button>
                                <Button
                                    variant="contained"
                                    onClick={guardarCambiosUbicacion}
                                    color="primary"
                                >
                                    Actualizar
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Modal para hacer el Traspaso */}

                        <Dialog open={modalTraspasoOpen} onClose={cerrarModalTraspaso}>
                            <DialogTitle>Traspasar Inventario</DialogTitle>
                            <DialogContent>
                                {datoTraspaso && (
                                    <>
                                        <Typography>Producto: <strong>{datoTraspaso.descripcion}</strong></Typography>
                                        <Typography>Código: {datoTraspaso.codigo_producto}</Typography>
                                        <Typography>Cantidad disponible: {datoTraspaso.cantidad_stock}</Typography>
                                        <TextField
                                            fullWidth
                                            label="Cantidad a mover"
                                            type="number"
                                            value={cantidadMover}
                                            onChange={(e) => setCantidadMover(e.target.value)}
                                            sx={{ mt: 2 }}
                                        />
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                            <InputLabel>Seleccionar almacén destino</InputLabel>
                                            <Select
                                                value={almacenDestino}
                                                onChange={(e) => setAlmacenDestino(e.target.value)}
                                                label="Seleccionar almacén destino"
                                            >
                                                {almacenesDisponibles.map((alm) => (
                                                    <MenuItem key={alm} value={alm}>{alm.toUpperCase()}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={cerrarModalTraspaso}>Cancelar</Button>
                                <Button variant="contained" color="error" onClick={realizarTraspaso}>
                                    Confirmar Traspaso
                                </Button>
                            </DialogActions>
                        </Dialog>


                    </Box>
                </>
            ) : (
                
                <>
                    <Typography variant="h6" align="center" gutterBottom>
                        {tablaSeleccionada.toUpperCase()}
                    </Typography>
                    <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 400, overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 1200, tableLayout: 'fixed' }} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Ubicación</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Código Producto</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Cantidad Stock</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Cantidad Movimiento</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Pasillo</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Lote</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Almacén Entrada</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Almacén Salida</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Fecha Salida</strong></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Responsable</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(arribosPorTabla[tablaSeleccionada] || [])
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ubi}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.code_prod}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cant_stock}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cant_stock_mov}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.pasillo}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.lote}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.almacen_entrada}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.almacen_salida}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.fecha_salida ? new Date(row.fecha_salida).toLocaleDateString() : ''}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.responsable}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={(arribosPorTabla[tablaSeleccionada] || []).length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                        rowsPerPageOptions={[10, 20, 30, 50]}
                    />
                </>

            )
            }

        </Box >

    );
}

export default INVENTARIODOS;

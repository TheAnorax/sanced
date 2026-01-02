import React, { useEffect, useState } from "react";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useMediaQuery from "@mui/material/useMediaQuery";
import EditIcon from "@mui/icons-material/Edit";
import { useTheme } from "@mui/material/styles";



import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    IconButton,
    DialogActions,
    TextField,
    Tooltip,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TableContainer,
    Tabs,
    Tab,
    Box
} from "@mui/material";
import { name } from "dayjs/locale/es";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";


function Check() {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const user = JSON.parse(localStorage.getItem("user"));


    // Estado general
    const [checklists, setChecklists] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [openModalNuevo, setOpenModalNuevo] = useState(false);

    // MODIFACION DE LOS DATOS 
    const [openModalEditar, setOpenModalEditar] = useState(false);
    const [formEdit, setFormEdit] = useState({});
    const [editId, setEditId] = useState(null);

    const [tab, setTab] = useState(0);
    const [historial, setHistorial] = useState([]);

    const hoy = new Date().toISOString().slice(0, 10);
    const [fechaFiltro, setFechaFiltro] = useState(hoy);



    const abrirModal = (item) => {
        setDetalle(item);
        setFormEdit(item);
        setOpenModal(true);
    };

    // Estado del formulario de inserción
    const [form, setForm] = useState({
        fecha: "",
        folio: "",
        marca: "",
        modelo: "",
        serie: "",
        tipo_equipo: "Renta",
        empresa: "",
        supervisor: "",
        torreta: "",
        obs_torreta: "",
        claxon: "",
        obs_claxon: "",
        extintor: "",
        obs_extintor: "",
        espejos_protector_cristal: "",
        obs_espejos_protector_cristal: "",
        firma_operador: "",
        firma_supervisor: "",
        bateria: "",
        palanca_control_velocidades: "",
        valtaje_cargador: "",
    });

    useEffect(() => {
        obtenerDatos();
        obtenerHistorial();
    }, []);

    const obtenerDatos = async () => {
        try {
            const res = await axios.get("http://66.232.105.87:3007/api/Check-List/checklist");
            setChecklists(res.data);
        } catch (error) {
            console.error("Error al obtener checklist:", error);
        }
    };

    const cerrarModal = () => {
        setOpenModal(false);
        setDetalle(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "supervisor") {
            setForm({
                ...form,
                supervisor: value,
                firma_supervisor: value,
            });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async () => {
        const camposObligatorios = [
            "fecha",
            "folio",
            "marca",
            "modelo",
            "serie",
            "empresa",
            "supervisor",
            "tipo_equipo",
        ];

        const camposFaltantes = camposObligatorios.filter(
            campo => !form[campo] || form[campo].trim() === ""
        );

        if (camposFaltantes.length > 0) {
            // cierre inmediato
            setOpenModalNuevo(false);

            Swal.fire({
                icon: "warning",
                title: "Campos faltantes",
                html: `
                <p>Por favor completa los siguientes campos:</p>
                <ul style="text-align:left;margin-top:10px">
                    ${camposFaltantes.map(f => `<li><b>${f}</b></li>`).join("")}
                </ul>
            `,
            }).then(() => setOpenModalNuevo(true)); // <- vuelve a abrir modal
            return;
        }

        try {
            await axios.post(
                "http://66.232.105.87:3007/api/Check-List/checklist-insert",
                form
            );

            setOpenModalNuevo(false);

            Swal.fire({
                icon: "success",
                title: "Checklist guardado",
                text: "Se insertó correctamente.",
            });

            obtenerDatos();

            setForm({
                fecha: "",
                folio: "",
                marca: "",
                modelo: "",
                serie: "",
                tipo_equipo: "Renta",
                empresa: "",
                supervisor: "",
                firma_supervisor: "",
                firma_operador: "",
            });

        } catch (error) {
            setOpenModalNuevo(false);

            Swal.fire({
                icon: "error",
                title: "Error al insertar",
                text: error.response?.data?.message || "Ocurrió un problema.",
            });
        }
    };

    const guardarCambios = async () => {
        if (!editId) {
            Swal.fire("Error", "No se encontró el ID del checklist", "error");
            return;
        }

        const camposPermitidos = [
            "torreta", "obs_torreta", "alarma_reversa", "obs_alarma_reversa",
            "claxon", "obs_claxon", "extintor", "obs_extintor",
            "espejos_protector_cristal", "obs_espejos_protector_cristal",
            "cuartos", "obs_cuartos", "base_cuartos", "obs_base_cuartos",
            "faro", "obs_faro", "switch_ignicion", "obs_switch_ignicion",
            "llave_switch", "obs_llave_switch", "tapas_plastico", "obs_tapas_plastico",
            "perno_arrastre", "obs_perno_arrastre", "calcomanias", "obs_calcomanias",
            "portahorquillas", "obs_portahorquillas",
            "horquilla", "obs_horquilla", "respaldo_carga", "obs_respaldo_carga",
            "parrilla_contrapeso", "obs_parrilla_contrapeso",
            "desplazador_lateral", "obs_desplazador_lateral",
            "palanca_control_velocidades", "obs_palanca_control_velocidades",
            "aditamento", "obs_aditamento", "llantas_delanteras", "obs_llantas_delanteras",
            "llantas_traseras", "obs_llantas_traseras", "bateria", "obs_bateria",
            "cargador", "obs_cargador", "valtaje_cargador", "obs_valtaje_cargador",
            "asiento", "obs_asiento", "protector_operador", "obs_protector_operador",
            "piso_plataforma", "obs_piso_plataforma", "tapon_aceite", "obs_tapon_aceite",
            "estado_pintura", "obs_estado_pintura", "altura_mastil", "obs_altura_mastil",
            "golpes", "obs_golpes", "nota_adicional"
        ];// tu lista

        const payload = {};

        camposPermitidos.forEach(c => {
            if (formEdit[c] !== undefined) {
                payload[c] = formEdit[c];
            }
        });

        payload.usuario = user.id_usu;


        try {
            await axios.put(
                `http://66.232.105.87:3007/api/Check-List/checklist-update/${editId}`,
                payload
            );


            setOpenModalEditar(false);
            Swal.fire("OK", "Checklist actualizado", "success");
            obtenerDatos();

        } catch (err) {
            Swal.fire("Error", "No se pudo actualizar", "error");
            console.log(err);
        }
    };

    const SelectEstado = ({ label, name, value, onChange }) => {
        const opciones = ["BIEN", "DAÑADO", "REVISAR", "CAMBIO"];

        return (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>{label}</InputLabel>
                <Select
                    name={name}
                    label={label}
                    value={value || ""}
                    onChange={onChange}
                >
                    {opciones.map((op) => (
                        <MenuItem key={op} value={op}>
                            {op}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };


    //HISTORIAL DE MOVIMIENTOS 

    const obtenerHistorial = async () => {
        try {
            const res = await axios.get("http://66.232.105.87:3007/api/Check-List/historial");
            setHistorial(res.data);
        } catch (error) {
            console.error("Error al obtener Historial", error);
        }
    };

    const historialFiltrado = (historial || []).filter(row => {
        if (!fechaFiltro) return true; // si no hay filtro → todos
        const fechaRow = new Date(row.fecha).toISOString().slice(0, 10);
        return fechaRow === fechaFiltro;
    });

    // AGRUPAR SIEMPRE SIN FILTRO
    const historialAgrupado = historial.reduce((acc, row) => {
        const usuario = row.usuario;
        if (!acc[usuario]) acc[usuario] = [];
        acc[usuario].push(row);
        return acc;
    }, {});



    const customLabels = {

        torreta: "Torreta",
        obs_torreta: "Obs Torreta",

        alarma_reversa: "Alarma de Reversa",
        obs_alarma_reversa: "Obs de Alarma de Reversa",

        claxon: "Claxon",
        Obs_claxon: "Obs de Claxon",

        extintor: "Extintor",
        obs_extintor: "Obs de Exttintor",

        espejos_protector_cristal: "Espejos Protector cristal",
        obs_espejos_protector_cristal: "Obs Espejos Protector cristal",

        cuartos: "Cuartos",
        obs_cuartos: "Obs Cuartos",

        base_cuartos: "Base de Cuarto",
        obs_base_cuartos: "Obs de Bade de Cuarto",

        faro: "Faro",
        obs_faro: "Obs de Faro",

        base_faro: "Base del Faro",
        obs_base_faro: "Obs de base deL faro",

        switch_ignicion: "Switch de Ignición",
        obs_switch_ignicion: "OBS Switch de Ignición",

        llave_switch: "Llave de Encendido",
        obs_llave_switch: "Obs Llave de Encendido",

        tapas_plastico: "Tapa de Plastico",
        obs_tapas_plastico: "Obs de Tapas de Plastico",

        perno_arrastre: "Perno de Arrastre",
        obs_perno_arrastre: "Obs de Perno de Arrastre",

        calcomanias: "Calcomania",
        obs_calcomanias: "Obs Calcomania",

        portahorquillas: "Portahorquillas",
        obs_portahorquillas: "Obs de Portahorquillas",

        horquilla: "Horquilla",
        obs_horquilla: "Obs de Horquilla",

        respaldo_carga: "Respaldo de Carga",
        obs_respaldo_carga: "Obs Respaldo de Carga",

        parrilla_contrapeso: "Parrilla de Contrapeso",
        obs_parrilla_contrapeso: "Obs de Parrilla de Contrapeso",

        desplazador_lateral: "Desplazador Lateral",
        obs_desplazador_lateral: "Obs de Desplazador Lateral",

        palanca_control_velocidades: "Palanca de Control Velocidades",
        obs_palanca_control_velocidades: "Obs de Palanca de Control Velocidades",

        aditamento: "Aditamento",
        obs_aditamento: "Obs de Aditamento",

        llantas_delanteras: "Llantas Delanteras",
        obs_llantas_delanteras: "Obs de Llantas Delanteras",

        llantas_traseras: "Llantas Traseras",
        obs_llantas_traseras: "Obs de Llantas Traseras",

        bateria: "Bateria",
        obs_bateria: "Obs de Bateria",

        cargador: "Cargador",
        obs_cargador: "Obs del Cargador",

        valtaje_cargador: "Voltaje Cargador",
        obs_valtaje_cargador: "Obs del Voltaje Cargador",

        asiento: "Asiento",
        obs_asiento: "Obs de Asiento",

        protector_operador: "Protección Operador",
        obs_protector_operador: "Obs del Protección Operador",


        piso_plataforma: "Piso de Plataforma",
        obs_piso_plataforma: "Obs del Piso de la Plataforma",


        tapon_aceite: "Tapon de Aceite",
        obs_tapon_aceite: "Obs del Tapon de Aceite",

        estado_pintura: "Estado de Pintura",
        obs_estado_pintura: "Obs deñ Estado de Pintura",

        altura_mastil: "Altura del Mastil",
        obs_altura_mastil: "Obs de la Altura del Mastil",

        golpes: "Golpes",
        obs_golpes: "Obs de Golpes",

        nota_adicional: "Nota Adicional"

    };

    function formatLabel(col) {
        if (!col) return "-";

        // Diccionario — prioridad
        if (customLabels[col]) return customLabels[col];

        // Caso observación
        if (col.startsWith("obs_")) {
            const base = col.replace("obs_", "");
            return "Observación " + formatLabel(base);
        }

        // Texto estándar
        return col
            .split("_")
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ");
    }

    // Contadores por usuario para DAÑADO, REVISAR, CAMBIO
    const resumenValores = historialFiltrado.reduce((acc, item) => {
        const u = item.usuario;
        const estado = item.valor_nuevo?.toUpperCase() || "";

        if (!acc[u]) {
            acc[u] = {
                DANADO: 0,
                REVISAR: 0,
                CAMBIO: 0,
            };
        }

        if (estado === "DAÑADO" || estado === "DANADO") acc[u].DANADO++;
        if (estado === "REVISAR") acc[u].REVISAR++;
        if (estado === "CAMBIO") acc[u].CAMBIO++;

        return acc;
    }, {});


    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom>
                Check List de Equipos
            </Typography>


            <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 2 }}
            >
                <Tab label="CheckList" />
                <Tab label="Historial" />

            </Tabs>


            {tab === 0 && (
                <>
                    {/* Botón nuevo checklist */}
                    <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenModalNuevo(true)}
                        >
                            Nuevo Checklist
                        </Button>
                    </Box>

                    {/* TABLA */}
                    <Paper sx={{ p: 1, mt: 1 }}>
                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Id</b></TableCell>
                                        <TableCell><b>Folio</b></TableCell>
                                        <TableCell><b>Marca</b></TableCell>
                                        <TableCell><b>Fecha</b></TableCell>
                                        <TableCell><b>Supervisor</b></TableCell>
                                        <TableCell><b>Operador</b></TableCell>
                                        <TableCell align="center"><b>Acciones</b></TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {checklists.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.folio}</TableCell>
                                            <TableCell>{item.marca}</TableCell>

                                            <TableCell>
                                                {item.fecha
                                                    ? new Date(item.fecha).toLocaleDateString()
                                                    : "-"}
                                            </TableCell>

                                            <TableCell>{item.supervisor}</TableCell>
                                            <TableCell>{item.firma_operador}</TableCell>

                                            {/* 🔥 COLUMNA ACCIONES */}
                                            <TableCell align="center">
                                                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>

                                                    {/* Ver */}
                                                    <Tooltip title="Ver Checklist">
                                                        <IconButton
                                                            sx={{ color: "#FFB300" }}
                                                            size="small"
                                                            onClick={() => abrirModal(item)}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {/* Editar */}
                                                    <Tooltip title="Editar partes">
                                                        <IconButton
                                                            sx={{ color: "#275EF5" }} 
                                                            size="small"
                                                            onClick={() => {
                                                                setFormEdit(item);
                                                                setEditId(item.id);
                                                                setOpenModalEditar(true);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                </Box>
                                            </TableCell>



                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}


            {tab === 1 && (
                <Paper sx={{ p: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Historial de cambios
                    </Typography>

                    {/* ==== FILTRO DE FECHA ==== */}
                    <div style={{ marginBottom: 20 }}>
                        <label><b>Filtrar por fecha: </b></label>
                        <input
                            type="date"
                            value={fechaFiltro}
                            onChange={(e) => setFechaFiltro(e.target.value)}
                            style={{ padding: 6, marginLeft: 10 }}
                        />
                    </div>

                    {/* === RESUMEN POR OPERADOR === */}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Resumen diario por usuario
                    </Typography>

                    <Grid container spacing={2}>
                        {Object.entries(resumenValores).map(([usuario, data]) => (
                            <Grid item xs={12} sm={6} md={3} key={usuario}>
                                <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2, boxShadow: 3 }}>
                                    <Typography sx={{ fontWeight: "bold" }}>{usuario}</Typography>

                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        🟥 <b style={{ color: "#d32f2f" }}>DAÑADO: {data.DANADO}</b>
                                    </Typography>

                                    <Typography variant="body2">
                                        🟧 <b style={{ color: "#ff9800" }}>REVISAR: {data.REVISAR}</b>
                                    </Typography>

                                    <Typography variant="body2">
                                        🟨 <b style={{ color: "#ffcc00ff" }}>CAMBIO: {data.CAMBIO}</b>
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>


                    {/* ==== TABLA DEL HISTORIAL ==== */}
                    <TableContainer sx={{ maxHeight: 600 }}>

                        {Object.entries(historialAgrupado)
                            .filter(([usuario, cambios]) => cambios.length > 0)
                            .map(([usuario, cambios]) => {

                                const cambiosFiltrados = fechaFiltro
                                    ? cambios.filter(c => new Date(c.fecha).toISOString().slice(0, 10) === fechaFiltro)
                                    : cambios;

                                if (cambiosFiltrados.length === 0) return null;

                                return (
                                    <div key={usuario} style={{ marginBottom: 40 }}>

                                        {/* nombre usuario */}
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}
                                        >
                                            {usuario}
                                        </Typography>

                                        <TableContainer sx={{ maxHeight: 350, border: "1px solid #ddd" }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><b>Columna</b></TableCell>
                                                        <TableCell><b>Valor Anterior</b></TableCell>
                                                        <TableCell><b>Valor Nuevo</b></TableCell>
                                                        <TableCell><b>Fecha</b></TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {cambiosFiltrados.map((c, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>{formatLabel(c.columna)}</TableCell>
                                                            <TableCell>{c.valor_anterior}</TableCell>
                                                            <TableCell>{c.valor_nuevo}</TableCell>
                                                            <TableCell>{new Date(c.fecha).toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                );
                            })}


                    </TableContainer>
                </Paper>
            )}


            {/* 🔹 Modal de Inserción */}
            <Dialog
                open={openModalNuevo}
                onClose={() => setOpenModalNuevo(false)}
                maxWidth="md"
                fullWidth
                fullScreen={fullScreen}
            >
                <DialogTitle
                    sx={{
                        background: "#1976d2",
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center"
                    }}
                >
                    Nuevo Checklist de Equipo
                </DialogTitle>

                <DialogContent dividers>

                    {/* DATOS GENERALES */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                        Información general del equipo
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                name="fecha"
                                type="date"
                                fullWidth
                                label="Fecha"
                                InputLabelProps={{ shrink: true }}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                name="folio"
                                fullWidth
                                label="Folio"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                name="marca"
                                fullWidth
                                label="Marca"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                name="modelo"
                                fullWidth
                                label="Modelo"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                name="serie"
                                fullWidth
                                label="Serie"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                name="empresa"
                                fullWidth
                                label="Empresa"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                name="supervisor"
                                fullWidth
                                label="Supervisor"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Equipo</InputLabel>
                                <Select
                                    name="tipo_equipo"
                                    value={form.tipo_equipo}
                                    label="Tipo de Equipo"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Renta">Renta</MenuItem>
                                    <MenuItem value="Venta">Venta</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <hr style={{ margin: 20 }} />

                    {/* FIRMAS */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                        Responsable del montacargas
                    </Typography>

                    <Grid container spacing={2}>

                        <Grid item xs={6}>
                            <TextField
                                name="firma_operador"
                                fullWidth
                                label="Operador"
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        color="error"
                        onClick={() => setOpenModalNuevo(false)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>


            {/* 🔹 Modal Detalle */}
            <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullScreen={fullScreen} fullWidth>

                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#d21919ff",
                        color: "white",
                        fontWeight: "bold",
                    }}
                >
                    Detalle del Checklist
                    <IconButton
                        aria-label="close"
                        onClick={cerrarModal}
                        sx={{
                            color: "white",
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {detalle ? (
                        <div>
                            <Typography variant="h6" gutterBottom>
                                {detalle.folio} — {detalle.marca} ({detalle.modelo})
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom>
                                Fecha: {new Date(detalle.fecha).toLocaleDateString()}
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom>
                                Supervisor: {detalle.supervisor} | Tipo de Equipo: {detalle.tipo_equipo}
                            </Typography>

                            <hr />
                            <Grid container spacing={2}>

                                <Grid item xs={6}>
                                    <b>Modelo:</b> {detalle.modelo || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Serie:</b> {detalle.serie || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Empresa:</b> {detalle.empresa || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Torreta:</b> {detalle.torreta || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_torreta || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Alarma Reversa:</b> {detalle.alarma_reversa || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_alarma_reversa || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Claxon:</b> {detalle.claxon || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_claxon || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Extintor:</b> {detalle.extintor || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_extintor || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Espejos Protector Cristal:</b> {detalle.espejos_protector_cristal || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_espejos_protector_cristal || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Cuartos:</b> {detalle.cuartos || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_cuartos || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Base Cuartos:</b> {detalle.base_cuartos || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_base_cuartos || "-"}
                                </Grid>


                                <Grid item xs={6}>
                                    <b>Faros:</b> {detalle.faro || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_faro || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Switch Ignición:</b> {detalle.switch_ignicion || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_switch_ignicion || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Llave Switc:</b> {detalle.llave_switch || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_llave_switch || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Tapas Plastico:</b> {detalle.tapas_plastico || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_tapas_plastico || "-"}
                                </Grid>


                                <Grid item xs={6}>
                                    <b>Perno Arrastre:</b> {detalle.perno_arrastre || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_perno_arrastre || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Calcomanías:</b> {detalle.calcomanias || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_calcomanias || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Portahorquillas:</b> {detalle.portahorquillas || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_portahorquillas || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Horquillas:</b> {detalle.horquilla || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_horquilla || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Respaldo Carga:</b> {detalle.respaldo_carga || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_respaldo_carga || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Parrilla Contrapeso:</b> {detalle.parrilla_contrapeso || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_parrilla_contrapeso || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Desplazador Lateral:</b> {detalle.desplazador_lateral || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_desplazador_lateral || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Palacan de control de velocidades:</b> {detalle.palanca_control_velocidades || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_palanca_control_velocidades || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Aditamento:</b> {detalle.aditamento || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_aditamento || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Llantas Delanteras:</b> {detalle.llantas_delanteras || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_llantas_delanteras || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Llantas Traseras:</b> {detalle.llantas_traseras || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_llantas_traseras || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Bateria:</b> {detalle.bateria || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_bateria || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Cargador:</b> {detalle.cargador || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_cargador || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Voltaje:</b> {detalle.valtaje_cargador || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_valtaje_cargador || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Asiento:</b> {detalle.asiento || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_asiento || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Protector Operador:</b> {detalle.protector_operador || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_protector_operador || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Piso Plataforma:</b> {detalle.piso_plataforma || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_piso_plataforma || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Tapon Aceite:</b> {detalle.tapon_aceite || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_tapon_aceite || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Estado de Pintura:</b> {detalle.estado_pintura || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_estado_pintura || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Altura Mastil:</b> {detalle.altura_mastil || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_altura_mastil || "-"}
                                </Grid>

                                <Grid item xs={6}>
                                    <b>Golpes:</b> {detalle.golpes || "-"}
                                    <br />
                                    <b>Obs:</b> {detalle.obs_golpes || "-"}
                                </Grid>

                                <Grid item xs={12}>
                                    <b>Notas Adicionales:</b> {detalle.nota_adicional || "-"}
                                </Grid>


                            </Grid>

                            <hr />
                            <Typography variant="body2" style={{ marginTop: 10 }}>
                                <b>Responsable del montacargas:</b> {detalle.firma_operador || "-"} <br />
                            </Typography>
                        </div>
                    ) : (
                        <Typography>Cargando...</Typography>
                    )}
                </DialogContent>
            </Dialog>


            {/* MODAL DE aCTUIALIZACION */}
            <Dialog
                open={openModalEditar}
                onClose={() => setOpenModalEditar(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ background: "#0011ffff", color: "white", fontWeight: "bold" }}>
                    Editar checklist del montacargas
                </DialogTitle>

                <DialogContent dividers>

                    <Typography sx={{ mb: 2, fontSize: 14 }}>
                        Selecciona el estado del componente y agrega observaciones si aplica.
                    </Typography>

                    <Grid container spacing={2}>
                        {[
                            ["torreta", "obs_torreta"],
                            ["alarma_reversa", "obs_alarma_reversa"],
                            ["claxon", "obs_claxon"],
                            ["extintor", "obs_extintor"],
                            ["espejos_protector_cristal", "obs_espejos_protector_cristal"],
                            ["cuartos", "obs_cuartos"],
                            ["base_cuartos", "obs_base_cuartos"],
                            ["faro", "obs_faro"],
                            ["switch_ignicion", "obs_switch_ignicion"],
                            ["llave_switch", "obs_llave_switch"],
                            ["tapas_plastico", "obs_tapas_plastico"],
                            ["perno_arrastre", "obs_perno_arrastre"],
                            ["calcomanias", "obs_calcomanias"],
                            ["portahorquillas", "obs_portahorquillas"],
                            ["horquilla", "obs_horquilla"],
                            ["respaldo_carga", "obs_respaldo_carga"],
                            ["parrilla_contrapeso", "obs_parrilla_contrapeso"],
                            ["desplazador_lateral", "obs_desplazador_lateral"],
                            ["palanca_control_velocidades", "obs_palanca_control_velocidades"],
                            ["aditamento", "obs_aditamento"],
                            ["llantas_delanteras", "obs_llantas_delanteras"],
                            ["llantas_traseras", "obs_llantas_traseras"],
                            ["bateria", "obs_bateria"],
                            ["cargador", "obs_cargador"],
                            ["valtaje_cargador", "obs_valtaje_cargador"],
                            ["asiento", "obs_asiento"],
                            ["protector_operador", "obs_protector_operador"],
                            ["piso_plataforma", "obs_piso_plataforma"],
                            ["tapon_aceite", "obs_tapon_aceite"],
                            ["estado_pintura", "obs_estado_pintura"],
                            ["altura_mastil", "obs_altura_mastil"],
                            ["golpes", "obs_golpes"],
                            ["nota_adicional", null]
                        ].map(([campo, obs]) => {
                            // 🔥 caso especial
                            if (campo === "nota_adicional") {
                                return (
                                    <Grid item xs={12} key={campo}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Notas adicionales"
                                            name="nota_adicional"
                                            value={formEdit.nota_adicional || ""}
                                            onChange={(e) =>
                                                setFormEdit({
                                                    ...formEdit,
                                                    nota_adicional: e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>
                                );
                            }

                            return (
                                <React.Fragment key={campo}>
                                    {/* Select */}
                                    <Grid item xs={4}>
                                        <SelectEstado
                                            label={campo}
                                            name={campo}
                                            value={formEdit[campo] || ""}
                                            onChange={(e) =>
                                                setFormEdit({
                                                    ...formEdit,
                                                    [campo]: e.target.value,
                                                })
                                            }
                                        />
                                    </Grid>

                                    {/* Observación */}
                                    {obs && (
                                        <Grid item xs={8}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={1}
                                                label={`Observación ${campo}`}
                                                name={obs}
                                                size="small"
                                                value={formEdit[obs] || ""}
                                                onChange={(e) =>
                                                    setFormEdit({
                                                        ...formEdit,
                                                        [obs]: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Grid>


                </DialogContent>

                <DialogActions>
                    <Button color="error" onClick={() => setOpenModalEditar(false)}>
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={guardarCambios}
                    >
                        Guardar cambios
                    </Button>
                </DialogActions>
            </Dialog>



        </div>
    );
}

export default Check;

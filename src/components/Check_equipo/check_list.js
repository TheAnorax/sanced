import React, { useEffect, useState } from "react";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useMediaQuery from "@mui/material/useMediaQuery";
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
    TableContainer
} from "@mui/material";
import { name } from "dayjs/locale/es";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";


function Check() {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));


    // Estado general
    const [checklists, setChecklists] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [openModalNuevo, setOpenModalNuevo] = useState(false);

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
    }, []);

    const obtenerDatos = async () => {
        try {
            const res = await axios.get("http://66.232.105.87:3007/api/Check-List/checklist");
            setChecklists(res.data);
        } catch (error) {
            console.error("Error al obtener checklist:", error);
        }
    };

    const abrirModal = (item) => {
        setDetalle(item);
        setOpenModal(true);
    };

    const cerrarModal = () => {
        setOpenModal(false);
        setDetalle(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleSubmit = async () => {
        // 🔹 Campos obligatorios
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

        // 🔹 Detectar vacíos
        const camposFaltantes = camposObligatorios.filter(
            (campo) => !form[campo] || form[campo].trim() === ""
        );

        if (camposFaltantes.length > 0) {
            // 🔹 Cierra el modal temporalmente
            setOpenModalNuevo(false);

            // ⚠️ Mostrar advertencia
            Swal.fire({
                icon: "warning",
                title: "Campos faltantes",
                html: `
            <p>Por favor completa los siguientes campos antes de guardar:</p>
            <ul style="text-align: left; margin-top: 10px;">
              ${camposFaltantes.map((f) => `<li><b>${f}</b></li>`).join("")}
            </ul>
        `,
                confirmButtonColor: "#1976d2",
                confirmButtonText: "Entendido",
            }).then(() => {
                // 🔹 Vuelve a abrir el modal al cerrar el SweetAlert
                setOpenModalNuevo(true);
            });

            return;
        }

        // ✅ Si pasa validación
        try {
            await axios.post("http://66.232.105.87:3007/api/Check-List/checklist-insert", form);

            setOpenModalNuevo(false);

            // 🟢 Mostrar mensaje de éxito y cerrar solo después
            Swal.fire({
                icon: "success",
                title: "Checklist guardado",
                text: "El checklist se ha insertado correctamente.",
                confirmButtonColor: "#1976d2",
            }).then(() => {
                // 🔹 Esto se ejecuta cuando el usuario cierra el alert de éxito
                setOpenModalNuevo(false);
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
                    cargador: "",
                    obs_cargador: "",
                    valtaje_cargador: "",
                    obs_valtaje_cargador: "",
                    bateria: "",
                    palanca_control_velocidades: "",
                    obs_palanca_control_velocidades: "",
                });
            });
        } catch (error) {
            console.error("Error al insertar checklist:", error);
            Swal.fire({
                icon: "error",
                title: "Error al insertar",
                text: "Hubo un problema al guardar el checklist. Revisa la consola para más detalles.",
                confirmButtonColor: "#d33",
            });
        }
    };



    const CheckBoxGroup = ({ label, name, value, onChange }) => {
        const options = ["BIEN", "MAL", "NUEVO", "USADO", "N/A"];

        const handleOptionChange = (e) => {
            onChange({
                target: {
                    name,
                    value: e.target.value,
                },
            });
        };

        return (
            <div style={{ marginBottom: 15 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                    {label}
                </Typography>
                <FormGroup row>
                    {options.map((opt) => (
                        <FormControlLabel
                            key={opt}
                            control={
                                <Checkbox
                                    checked={value === opt}
                                    onChange={handleOptionChange}
                                    value={opt}
                                />
                            }
                            label={opt}
                        />
                    ))}
                </FormGroup>
            </div>
        );
    };



    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom>
                Check List de Equipos
            </Typography>

            {/* Botón nuevo checklist */}
            <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenModalNuevo(true)}
            >
                Nuevo Checklist
            </Button>

            {/* Tabla de datos */}
            <Paper sx={{ p: 1, mt: 2 }}>
                <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
                    <Table size="small" stickyHeader>

                        <TableHead>
                            <TableRow>
                                <TableCell><b>Folio</b></TableCell>
                                <TableCell><b>Marca</b></TableCell>
                                <TableCell><b>Fecha</b></TableCell>
                                <TableCell><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {checklists.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.folio}</TableCell>
                                    <TableCell>{item.marca}</TableCell>
                                    <TableCell>
                                        {item.fecha ? new Date(item.fecha).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Ver Detalle">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => abrirModal(item)}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Paper>

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
                        textAlign: "center",

                    }}
                >
                    Nuevo Checklist de Equipo
                </DialogTitle>

                <DialogContent dividers>
                    {/* 🟦 Sección: Datos generales */}
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Datos Generales
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                name="fecha"
                                type="date"
                                label="Fecha"
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth name="folio" label="Folio" onChange={handleChange} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth name="marca" label="Marca" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField fullWidth name="modelo" label="Modelo" onChange={handleChange} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth name="serie" label="Serie" onChange={handleChange} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth name="empresa" label="Empresa" onChange={handleChange} />
                        </Grid>
                    </Grid>

                    {/* 🟩 Sección: Personal / Supervisor */}
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Personal
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <TextField fullWidth name="supervisor" label="Supervisor" onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
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
                    </Grid>

                    {/* 🟨 Sección: Conceptos */}
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Revisión Técnica
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>

                        {/* 🔹 Ejemplo 1 */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Torreta" name="torreta" value={form.torreta} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_torreta" label="Observación Torreta" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Alarma de Reversa */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Alarma de Reversa" name="alarma_reversa" value={form.alarma_reversa} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_alarma_reversa" label="Observación de Alarma de Reversa" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Claxon */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Claxon" name="claxon" value={form.claxon} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_claxon" label="Observación Claxon" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Extintor */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Extintor" name="extintor" value={form.extintor} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_extintor" label="Observación Extintor" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Espejos / Protector Cristal */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Espejos / Protector Cristal" name="espejos_protector_cristal" value={form.espejos_protector_cristal} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_espejos_protector_cristal" label="Observación Espejos" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Cuartos */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Cuartos" name="cuartos" value={form.cuartos} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_cuartos" label="Observación Cuartos" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Base Cuartos */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Base Cuartos" name="base_cuartos" value={form.base_cuartos} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_base_cuartos" label="Observación Base Cuartos" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Faros */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Faros" name="faro" value={form.faro} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_faro" label="Observación Faros" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Base Faros */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Base Faros" name="base_faro" value={form.base_faro} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_base_faro" label="Observación Base Faros" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Switch Ignición */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Switch Ignición" name="switch_ignicion" value={form.switch_ignicion} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_switch_ignicion" label="Observación Switch Ignición" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Llave Switch */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Llave Switch" name="llave_switch" value={form.llave_switch} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_llave_switch" label="Observación Llave Switch" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Tapas de Plástico */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Tapas Plástico" name="tapas_plastico" value={form.tapas_plastico} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_tapas_plastico" label="Observación Tapas Plástico" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Perno Arrastre */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Perno Arrastre" name="perno_arrastre" value={form.perno_arrastre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_perno_arrastre" label="Observación Perno Arrastre" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Calcomanías */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Calcomanías" name="calcomanias" value={form.calcomanias} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_calcomanias" label="Observación Calcomanías" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Portahorquillas */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Portahorquillas" name="portahorquillas" value={form.portahorquillas} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_portahorquillas" label="Observación Portahorquillas" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Horquilla */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Horquilla" name="horquilla" value={form.horquilla} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_horquilla" label="Observación Horquilla" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Respaldo Carga */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Respaldo Carga" name="respaldo_carga" value={form.respaldo_carga} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_respaldo_carga" label="Observación Respaldo Carga" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Parrilla Contrapeso */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Parrilla Contrapeso" name="parrilla_contrapeso" value={form.parrilla_contrapeso} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_parrilla_contrapeso" label="Observación Parrilla Contrapeso" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Desplazador Lateral */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Desplazador Lateral" name="desplazador_lateral" value={form.desplazador_lateral} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_desplazador_lateral" label="Observación Desplazador Lateral" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Palanca de control de velocidades */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Palanca de control de velocidades " name="palanca_control_velocidades" value={form.palanca_control_velocidades} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_palanca_control_velocidades" label="Observación Palanca de control de Velocidades" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Aditamento */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Aditamento" name="aditamento" value={form.aditamento} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_aditamento" label="Observación Aditamento" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Llantas Delanteras */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Llantas Delanteras" name="llantas_delanteras" value={form.llantas_delanteras} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_llantas_delanteras" label="Observación Llantas Delanteras" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Llantas Traseras */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Llantas Traseras" name="llantas_traseras" value={form.llantas_traseras} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_llantas_traseras" label="Observación Llantas Traseras" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Batería con Select */}
                        <Grid item xs={6}>
                            <CheckBoxGroup
                                label="Batería"
                                name="bateria"
                                value={form.bateria}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_bateria" label="Observación Batería" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Cargador */}
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Cargador</InputLabel>
                                <Select
                                    name="cargador"
                                    value={form.cargador || ""}
                                    label="Cargador"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="S/Clavija">S/Clavija</MenuItem>
                                    <MenuItem value="C/Clavija">C/Clavija</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_cargador" label="Observación Cargador" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Voltaje del cargador */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Voltaje Cargador" name="valtaje_cargador" value={form.valtaje_cargador} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_valtaje_cargador" label="Observación de Voltaje Cargador" onChange={handleChange} />
                        </Grid>


                        {/* 🔹 Asiento con Select */}
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Asiento</InputLabel>
                                <Select
                                    name="asiento"
                                    value={form.asiento || ""}
                                    label="Asiento"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="S/Cinturón">S/Cinturón</MenuItem>
                                    <MenuItem value="C/Cinturón">C/Cinturón</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_asiento" label="Observación Asiento" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Resto de campos */}
                        <Grid item xs={6}>
                            <CheckBoxGroup label="Protector Operador" name="protector_operador" value={form.protector_operador} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_protector_operador" label="Observación Protector Operador" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={6}>
                            <CheckBoxGroup label="Piso Plataforma" name="piso_plataforma" value={form.piso_plataforma} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_piso_plataforma" label="Observación Piso Plataforma" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={6}>
                            <CheckBoxGroup label="Tapon Aceite" name="tapon_aceite" value={form.tapon_aceite} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_tapon_aceite" label="Observación Tapon Aceite" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={6}>
                            <CheckBoxGroup label="Estado Pintura" name="estado_pintura" value={form.estado_pintura} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_estado_pintura" label="Observación Estado Pintura" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={6}>
                            <CheckBoxGroup label="Altura Mastil" name="altura_mastil" value={form.altura_mastil} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_altura_mastil" label="Observación Altura Mastil" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={6}>
                            <CheckBoxGroup label="Golpes" name="golpes" value={form.golpes} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth name="obs_golpes" label="Observación Golpes" onChange={handleChange} />
                        </Grid>

                        {/* 🔹 Nota adicional */}
                        <Grid item xs={12}>
                            <TextField fullWidth name="nota_adicional" label="Nota Adicional" onChange={handleChange} />
                        </Grid>

                    </Grid>


                    {/* 🟧 Sección: Firmas */}
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Firmas
                    </Typography>


                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField fullWidth name="firma_supervisor" label="Firma Supervisor" onChange={handleChange} />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField fullWidth name="firma_operador" label="Firma Operador" onChange={handleChange} />
                        </Grid>
                    </Grid>

                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Button
                        onClick={() => setOpenModalNuevo(false)}
                        color="error"
                        sx={{ fontWeight: "bold" }}
                    >
                        CANCELAR
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                        onClick={handleSubmit}
                    >
                        GUARDAR
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
                        background: "#1976d2",
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
                                <b>Firma Operador:</b> {detalle.firma_operador || "-"} <br />
                                <b>Firma Supervisor:</b> {detalle.firma_supervisor || "-"}
                            </Typography>
                        </div>
                    ) : (
                        <Typography>Cargando...</Typography>
                    )}
                </DialogContent>
            </Dialog>


        </div>
    );
}

export default Check;

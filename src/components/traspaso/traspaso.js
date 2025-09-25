import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, Alert, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import Swal from "sweetalert2";

/* ===== helpers de preview ===== */
const strip = (s) =>
    String(s ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, " ")
        .trim();

function detectSecondArticleKey(headers = []) {
    let best = null, bestScore = -1;
    headers.forEach((h) => {
        const n = strip(h);
        let score = 0;
        if (n.includes("articulo")) score += 2;
        if (/\b2\b/.test(n) || n.includes("2º") || n.includes("2o") || n.includes("segundo")) score += 2;
        if (n.includes("n") || n.includes("num") || n.includes("numero")) score += 1;
        if (score > bestScore) { bestScore = score; best = h; }
    });
    return bestScore >= 3 ? best : null;
}

function deriveCodigoFromSecondArticle(val) {
    if (val == null) return "";
    const slice = String(val).slice(3, 7);
    const digits = slice.replace(/\D/g, "");
    if (digits.length === 4) return digits;
    const m = String(val).match(/(\d{4})/);
    return m ? m[1] : "";
}

function Traspasos() {
    /* ===== listado ===== */
    const [insumos, setInsumos] = useState([]);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [errorFetch, setErrorFetch] = useState("");

    /* ===== alta manual ===== */
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        Codigo: "", Descripcion: "", Clave: "", um: "", _pz: "", Cantidad: "",
        dia_envio: "", almacen_envio: "1074", tiempo_llegada_estimado: ""
    });
    const [errorSKU, setErrorSKU] = useState("");
    const [errorSave, setErrorSave] = useState("");
    const [loadingSave, setLoadingSave] = useState(false);

    /* ===== preview + import ===== */
    const fileInputRef = useRef(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [pendingFile, setPendingFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [searchPreview, setSearchPreview] = useState("");
    const [loteLlegada, setLoteLlegada] = useState(""); // <- único campo requerido en el modal

    useEffect(() => { fetchInsumos(); }, []);

    const fetchInsumos = async () => {
        setLoadingFetch(true); setErrorFetch("");
        try {
            const [traspasoRes, recibidosRes] = await Promise.all([
                axios.get("http://66.232.105.87:3007/api/RH/ObtenerTraspaso"),
                axios.get("http://66.232.105.107:3001/api/traspaso/recibidos"),
            ]);
            const todos = traspasoRes.data || [];
            const recibidos = recibidosRes.data || [];
            const s = new Set(recibidos.map((r) => r.Codigo));
            setInsumos(todos.filter((x) => !s.has(x.Codigo)));
        } catch (e) {
            console.error(e);
            setErrorFetch("No se pudieron cargar los insumos.");
        } finally {
            setLoadingFetch(false);
        }
    };

    const handleOpen = () => {
        setFormData({
            Codigo: "", Descripcion: "", Clave: "", um: "", _pz: "",
            Cantidad: "", dia_envio: "", almacen_envio: "1074", tiempo_llegada_estimado: ""
        });
        setErrorSKU(""); setErrorSave(""); setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        if (name === "Codigo") setErrorSKU("");
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleCodigoBlur = async () => {
        const codigo = String(formData.Codigo || "").trim();
        if (!codigo) return;
        try {
            const { data } = await axios.get(`http://66.232.105.87:3007/api/RH/productos/${codigo}`);
            setFormData((p) => ({
                ...p,
                Descripcion: data.des || "",
                Clave: data.clave || "",
                um: data.um || "",
                _pz: data._pz != null ? String(data._pz) : "",
            }));
            setErrorSKU("");
        } catch (e) {
            setErrorSKU(e?.response?.status === 404 ? "Producto no encontrado" : "Error al consultar el producto");
            setFormData((p) => ({ ...p, Descripcion: "", Clave: "", um: "", _pz: "" }));
        }
    };

    const handleSubmit = async () => {
        const { Codigo, Descripcion, Clave, um, _pz, Cantidad, dia_envio, almacen_envio, tiempo_llegada_estimado } = formData;
        if (!Codigo || !Descripcion.trim() || !Cantidad) return setErrorSave("Código, descripción y cantidad son obligatorios.");
        if (!dia_envio) return setErrorSave("Debes seleccionar el día y hora de envío.");
        if (!tiempo_llegada_estimado) return setErrorSave("Debes seleccionar la llegada estimada.");
        if (errorSKU) return setErrorSave("Debe corregir el SKU antes de guardar.");

        setErrorSave(""); setLoadingSave(true);
        try {
            const envioISO = typeof dia_envio === "string"
                ? new Date(dia_envio.includes(":") ? dia_envio + ":00" : dia_envio).toISOString()
                : dia_envio.toISOString();
            const llegadaISO = typeof tiempo_llegada_estimado === "string"
                ? new Date((tiempo_llegada_estimado.includes(":") ? tiempo_llegada_estimado + ":00" : tiempo_llegada_estimado)).toISOString()
                : tiempo_llegada_estimado.toISOString();

            await axios.post("http://66.232.105.87:3007/api/RH/traspaso", {
                Codigo, Descripcion, Clave, um, _pz, Cantidad,
                dia_envio: envioISO, almacen_envio, tiempo_llegada_estimado: llegadaISO
            });

            Swal.fire({ icon: "success", title: "¡Guardado!", timer: 1600, showConfirmButton: false });
            await fetchInsumos(); handleClose();
        } catch (e) {
            console.error(e);
            setErrorSave("Ocurrió un error al guardar.");
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar el insumo." });
        } finally { setLoadingSave(false); }
    };

    /* ===== PREVIEW + IMPORT ===== */
    const handleExcelPick = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setPreviewLoading(true);
        setPreviewHeaders([]); setPreviewRows([]);

        try {
            const fd = new FormData();
            fd.append("archivoExcel", file);
            const { data } = await axios.post("http://66.232.105.87:3007/api/RH/excel-to-json", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPreviewHeaders(data.headers || []);
            setPreviewRows(data.data || []);
            setPreviewOpen(true);
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo leer el Excel." });
            if (fileInputRef.current) fileInputRef.current.value = "";
            setPendingFile(null);
        } finally { setPreviewLoading(false); }
    };

    const closePreview = () => {
        setPreviewOpen(false);
        setPreviewHeaders([]); setPreviewRows([]);
        setPendingFile(null); setSearchPreview(""); setLoteLlegada("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const secondArticleKey = useMemo(() => detectSecondArticleKey(previewHeaders), [previewHeaders]);

    const displayHeaders = useMemo(() => {
        if (!secondArticleKey) return previewHeaders;
        // mostramos nuevo CÓDIGO calculado al inicio
        return ["CÓDIGO", ...previewHeaders];
    }, [previewHeaders, secondArticleKey]);

    const displayRows = useMemo(() => {
        const base = previewRows.map((r) => {
            if (!secondArticleKey) return r;
            const codigo = deriveCodigoFromSecondArticle(r[secondArticleKey]);
            return { "CÓDIGO": codigo, ...r };
        });

        const q = strip(searchPreview);
        const arr = !q
            ? base
            : base.filter((row) => displayHeaders.some((h) => strip(row[h]).includes(q)));

        return arr.slice(0, 200); // vista rápida
    }, [previewRows, displayHeaders, secondArticleKey, searchPreview]);

    const confirmImport = async () => {
        if (!pendingFile) return;
        if (!loteLlegada) {
            Swal.fire({ icon: "warning", title: "Falta la llegada estimada", text: "Selecciona fecha y hora para el lote." });
            return;
        }
        setImporting(true);
        try {
            const fd = new FormData();
            fd.append("archivoExcel", pendingFile);
            // ÚNICO dato que pedimos en el modal → aplica a todas las filas
            fd.append("tiempoLlegadaLote", new Date(loteLlegada).toISOString());

            const { data } = await axios.post("http://66.232.105.87:3007/api/RH/import-excel", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const { ok, inserted, skipped } = data || {};
            if (ok) {
                Swal.fire({
                    icon: "success",
                    title: "Importación terminada",
                    html: `<div style="text-align:left"><b>Insertados:</b> ${inserted}<br/><b>Omitidos:</b> ${skipped}</div>`,
                });
                await fetchInsumos();
            } else {
                Swal.fire({ icon: "error", title: "Error", text: "No se pudo importar." });
            }
            closePreview();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "Error", text: "Falló la importación." });
        } finally { setImporting(false); }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Traspasos</h2>

            {/* Acciones */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <Button component="label" variant="outlined" disabled={previewLoading}>
                    {previewLoading ? "Leyendo…" : "Importar Excel"}
                    <input ref={fileInputRef} type="file" hidden accept=".xlsx,.xls" onChange={handleExcelPick} />
                </Button>
            </Box>

            {/* Lista */}
            {loadingFetch && <Box sx={{ mt: 3, textAlign: "center" }}><CircularProgress /></Box>}
            {errorFetch && <Box sx={{ mt: 2 }}><Alert severity="error">{errorFetch}</Alert></Box>}

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>No orden</TableCell>
                            <TableCell>Código</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Clave</TableCell>
                            <TableCell>UM</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Día de envío</TableCell>
                            <TableCell>Almacén envío</TableCell>
                            <TableCell>Llegada estimada</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {insumos.map((x) => (
                            <TableRow key={`${x.Codigo}-${x.tiempo_llegada_estimado || ""}`}>
                                <TableCell>{x.No_Orden ?? x.NO_Orden ?? "—"}</TableCell>
                                <TableCell>{x.Codigo}</TableCell>
                                <TableCell>{x.Descripcion}</TableCell>
                                <TableCell>{x.Clave}</TableCell>
                                <TableCell>{x.um || "—"}</TableCell>
                                <TableCell>{x.Cantidad}</TableCell>
                                <TableCell>{x.dia_envio ? new Date(x.dia_envio).toLocaleString() : "—"}</TableCell>
                                <TableCell>{x.almacen_envio || "—"}</TableCell>
                                <TableCell>{x.tiempo_llegada_estimado ? new Date(x.tiempo_llegada_estimado).toLocaleString() : "—"}</TableCell>
                            </TableRow>
                        ))}
                        {!loadingFetch && insumos.length === 0 && (
                            <TableRow><TableCell colSpan={9} align="center">No hay insumos pendientes por recibir.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Alta manual */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Agregar producto</DialogTitle>
                <DialogContent dividers>
                    {errorSave && <Box sx={{ mb: 2 }}><Alert severity="error">{errorSave}</Alert></Box>}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField label="SKU (Código)" name="Codigo" type="number" fullWidth
                                value={formData.Codigo} onChange={handleFieldChange}
                                onBlur={handleCodigoBlur} error={!!errorSKU} helperText={errorSKU || ""} />
                        </Grid>
                        <Grid item xs={12} md={6}><TextField label="Descripción" name="Descripcion" fullWidth value={formData.Descripcion} disabled /></Grid>
                        <Grid item xs={12} md={6}><TextField label="Clave" name="Clave" fullWidth value={formData.Clave} disabled /></Grid>
                        <Grid item xs={12} md={6}><TextField label="UM" name="um" fullWidth value={formData.um} disabled /></Grid>
                        <Grid item xs={12} md={6}><TextField label="Cantidad por paquete (_pz)" name="_pz" type="number" fullWidth value={formData._pz} disabled /></Grid>
                        <Grid item xs={12} md={6}><TextField label="Cantidad enviada" name="Cantidad" type="number" fullWidth value={formData.Cantidad} onChange={handleFieldChange} /></Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Día de envío" name="dia_envio" type="datetime-local" fullWidth
                                value={formData.dia_envio} onChange={handleFieldChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} md={6}><TextField label="Almacén envío" name="almacen_envio" fullWidth value={formData.almacen_envio} disabled /></Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Llegada estimada" name="tiempo_llegada_estimado" type="datetime-local" fullWidth
                                value={formData.tiempo_llegada_estimado} onChange={handleFieldChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ pr: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loadingSave}>
                        {loadingSave ? <CircularProgress size={22} color="inherit" /> : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* PREVIEW Excel */}
            <Dialog open={previewOpen} onClose={importing ? undefined : closePreview} fullWidth maxWidth="lg">
                <DialogTitle sx={{ pb: 1 }}>
                    Previsualizar importación
                    <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        <Chip size="small" label={`Columnas: ${displayHeaders.length}`} />
                        <Chip size="small" label={`Filas: ${previewRows.length}`} />
                        {!!secondArticleKey && <Chip size="small" color="error" variant="outlined" label="Columna: CÓDIGO" />}
                        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                            <TextField
                                size="small" type="datetime-local" label="Llegada estimada (lote)"
                                value={loteLlegada} onChange={(e) => setLoteLlegada(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                size="small" placeholder="Buscar en la previsualización…"
                                value={searchPreview} onChange={(e) => setSearchPreview(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0, "& .MuiTableRow-root:nth-of-type(even)": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                    {previewLoading ? (
                        <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>
                    ) : (
                        <>
                            <Typography variant="caption" sx={{ px: 2, pt: 1, display: "block", color: "text.secondary" }}>
                                *Vista rápida limitada a 200 filas
                            </Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 520, borderRadius: 0 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {displayHeaders.map((h, i) => (
                                                <TableCell key={i} sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {displayRows.map((row, idx) => (
                                            <TableRow key={idx} hover>
                                                {displayHeaders.map((h, i) => (<TableCell key={i}>{row[h]}</TableCell>))}
                                            </TableRow>
                                        ))}
                                        {!displayRows.length && (
                                            <TableRow>
                                                <TableCell colSpan={displayHeaders.length} align="center">No se detectaron filas en el archivo.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={closePreview} disabled={importing}>Cancelar</Button>
                    <Button onClick={confirmImport} variant="contained" disabled={importing || !displayRows.length}>
                        {importing ? "Importando…" : "Confirmar e importar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Traspasos;

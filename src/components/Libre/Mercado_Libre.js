import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    Stack,
    Snackbar,
    Alert,
    LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";
import axios from "axios";

function normalizeRowKeys(row) {
    const o = {};
    for (const [k, v] of Object.entries(row)) {
        o[String(k).trim().toLowerCase()] = v;
    }
    return o;
}

// Devuelve el primer valor no vacío para una lista de posibles llaves
function pickValue(row, keys) {
    for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
    }
    return null;
}

function Mercado() {
    const [file, setFile] = useState(null);
    const [validRows, setValidRows] = useState([]);     // filas OK para subir
    const [invalidRows, setInvalidRows] = useState([]); // filas con error
    const [openPreview, setOpenPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

    const handleCloseSnack = () => setSnack({ ...snack, open: false });

    const handleFileChange = async (e) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setValidRows([]);
        setInvalidRows([]);
        if (!f) return;

        try {
            const ab = await f.arrayBuffer();
            const wb = XLSX.read(ab, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

            if (!rows.length) {
                setSnack({ open: true, type: "error", msg: "El Excel está vacío." });
                return;
            }

            // Normaliza encabezados a minúsculas
            const normalized = rows.map(normalizeRowKeys);

            const _valid = [];
            const _invalid = [];
            const seen = new Set(); // para detectar duplicados (pedido|codigo_ped)

            normalized.forEach((r, idx) => {
                const fila = idx + 2; // encabezados en fila 1
                const pedido = pickValue(r, ["pedido", "no_orden", "orden"]);
                const codigoPed = pickValue(r, ["codigo_ped", "codigo ped", "codigo", "codigoped"]);
                const cantidad = pickValue(r, ["cantidad", "cant", "qty"]);

                const pedidoNum = Number(pedido);
                const codigoNum = Number(codigoPed);
                const cantidadNum = Number(cantidad);

                const errs = [];
                if (!Number.isFinite(pedidoNum) || pedidoNum <= 0) errs.push("pedido inválido");
                if (!Number.isFinite(codigoNum) || codigoNum <= 0) errs.push("codigo_ped inválido");
                if (!Number.isFinite(cantidadNum) || cantidadNum < 0) errs.push("cantidad inválida");

                const key = `${pedidoNum}|${codigoNum}`;
                if (seen.has(key)) errs.push("duplicado (pedido+codigo_ped)");
                else if (errs.length === 0) seen.add(key);

                if (errs.length > 0) {
                    _invalid.push({ fila, pedido, codigo_ped: codigoPed, cantidad, errores: errs.join(", ") });
                } else {
                    _valid.push({ pedido: pedidoNum, codigo_ped: codigoNum, cantidad: cantidadNum });
                }
            });

            // Enriquecer con des/um/clave desde productos
            let enriched = _valid;
            if (_valid.length > 0) {
                const uniqueCodes = [...new Set(_valid.map(r => r.codigo_ped))];
                try {
                    const { data } = await axios.post("http://66.232.105.87:3007/api/mercado-libre/codigos", {
                        codigos: uniqueCodes
                    });
                    const map = data?.map || {};
                    enriched = _valid.map(r => ({
                        ...r,
                        des: map[r.codigo_ped]?.des || "No encontrado",
                        um: map[r.codigo_ped]?.um || "",
                        clave: map[r.codigo_ped]?.clave || ""
                    }));
                } catch (err) {
                    setSnack({ open: true, type: "warning", msg: "No se pudo cargar descripciones." });
                }
            }

            setValidRows(enriched);
            setInvalidRows(_invalid);
            setOpenPreview(true);
        } catch (err) {
            setSnack({ open: true, type: "error", msg: `Error leyendo Excel: ${err.message}` });
        }
    };


    const handleConfirmUpload = async () => {
        if (!file || validRows.length === 0) {
            setSnack({ open: true, type: "warning", msg: "No hay filas válidas para subir." });
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);

            await axios.post(
                "http://66.232.105.87:3007/api/mercado-libre/upload-excel",
                fd,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setSnack({ open: true, type: "success", msg: "Registros subidos correctamente." });
            setOpenPreview(false);
            setFile(null);
            setValidRows([]);
            setInvalidRows([]);
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || "Error al subir.";
            setSnack({ open: true, type: "error", msg });
        } finally {
            setLoading(false);
        }

    };

    return (
        <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Subir Excel de PEDIDOS a <code>pedi</code>
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    component="label"
                >
                    Seleccionar Excel (.xlsx/.xls)
                    <input
                        hidden
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                    />
                </Button>

                {file && (
                    <Chip label={file.name} variant="filled" />
                )}

                {validRows.length > 0 && (
                    <Chip
                        color="success"
                        label={`Válidos: ${validRows.length}`}
                        variant="outlined"
                    />
                )}
                {invalidRows.length > 0 && (
                    <Chip
                        color="error"
                        label={`Inválidos: ${invalidRows.length}`}
                        variant="outlined"
                    />
                )}

                {file && (
                    <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setOpenPreview(true)}
                    >
                        Ver previsualización
                    </Button>
                )}
            </Stack>

            {/* Modal de previsualización */}
            <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
                {/* ... (encabezado y botones idénticos a la versión anterior) ... */}

                <Dialog fullWidth maxWidth="lg" open={openPreview} onClose={() => !loading && setOpenPreview(false)}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Previsualización antes de subir</DialogTitle>
                    <DialogContent dividers>
                        {loading && <LinearProgress sx={{ mb: 2 }} />}

                        <Typography sx={{ mb: 1 }}>
                            Se subirá(n) <b>{validRows.length}</b> registro(s).
                            {invalidRows.length > 0 && <> — <b style={{ color: "#d32f2f" }}>{invalidRows.length}</b> con error(es) se ignorarán.</>}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                            Registros válidos (pedido, codigo_ped, cantidad, des)
                        </Typography>
                        <Box sx={{ maxHeight: 360, overflow: "auto", border: "1px solid #eee", borderRadius: 1 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>pedido</TableCell>
                                        <TableCell>codigo</TableCell>
                                        <TableCell>descripcion</TableCell>
                                        <TableCell>cantidad</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {validRows.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{r.pedido}</TableCell>
                                            <TableCell>{r.codigo_ped}</TableCell>
                                            <TableCell>{r.des}</TableCell>
                                            <TableCell>{r.cantidad}</TableCell>

                                        </TableRow>
                                    ))}
                                    {validRows.length === 0 && (
                                        <TableRow><TableCell colSpan={4}>Sin registros válidos.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>

                        {/* … tabla de inválidos igual que antes, opcional agregar col des si quieres … */}
                    </DialogContent>
                    <DialogActions>
                        <Button startIcon={<CancelIcon />} onClick={() => setOpenPreview(false)} disabled={loading}>Cancelar</Button>
                        <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleConfirmUpload} disabled={loading || validRows.length === 0}>
                            Confirmar y subir
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snack.open} autoHideDuration={3500} onClose={handleCloseSnack} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                    <Alert onClose={handleCloseSnack} severity={snack.type} variant="filled" sx={{ width: "100%" }}>
                        {snack.msg}
                    </Alert>
                </Snackbar>
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={handleCloseSnack}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnack} severity={snack.type} variant="filled" sx={{ width: "100%" }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Mercado;

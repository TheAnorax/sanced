import React, { useState } from "react";
import axios from "axios";
import {
    TextField,
    Button,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Grid,
    TablePagination,
} from "@mui/material";

function COBERTURA() {
    const [codigoPostal, setCodigoPostal] = useState("");
    const [datos2025, setDatos2025] = useState([]);
    const [datosGuerras, setDatosGuerras] = useState([]);
    const [datosPitic, setDatosPitic] = useState([]);
    const [error, setError] = useState("");

    const [page1, setPage1] = useState(0);
    const [rowsPerPage1] = useState(5);
    const [page2, setPage2] = useState(0);
    const [rowsPerPage2] = useState(5);
    const [page3, setPage3] = useState(0);
    const [rowsPerPage3] = useState(5);

    const handleBuscar = async () => {
        if (!codigoPostal) return;

        try {
            const response = await axios.get("http://192.168.3.154:3007/api/cobertura/cobertura", {
                params: { codigo_postal: codigoPostal },
            });

            setDatos2025(response.data.cobertura2025 || []);
            setDatosGuerras(response.data.coberturaGuerras || []);
            setDatosPitic(response.data.coberturaPitic || []);
            setPage1(0);
            setPage2(0);
            setPage3(0);
            setError("");
        } catch (err) {
            console.error("Error al consultar:", err);
            setError("Ocurrió un error al consultar los datos");
        }
    };

    const renderTable = (title, headers, data, page, setPage, rowsPerPage, keys) => (
        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                {headers.map((label, i) => (
                                    <TableCell key={i}>{label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headers.length} align="center">Sin resultados</TableCell>
                                </TableRow>
                            ) : (
                                data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                                    <TableRow key={i}>
                                        {keys.map((key, j) => (
                                            <TableCell key={j}>{row[key]}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                />
            </Paper>
        </Grid>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Consulta de Cobertura por Código Postal
            </Typography>

            <Paper sx={{ p: 3, mb: 3, maxWidth: 400, mx: "auto" }}>
                <Box display="flex" gap={2}>
                    <TextField
                        label="Código Postal"
                        variant="outlined"
                        fullWidth
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleBuscar} color="error">
                        Buscar
                    </Button>
                </Box>
                {error && (
                    <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
                )}
            </Paper>

            <Grid container spacing={4}>
                {renderTable("Cobertura PAQUETEXPRRES",
                    ["CP", "Delegación", "Colonia", "Ciudad", "Estado", "Cobertura", "Días"],
                    datos2025,
                    page1,
                    setPage1,
                    rowsPerPage1,
                    ["CODIGO_POSTAL", "DELEGACIÓN/MUNICIPIO", "COLONIA/ASENTAMIENTO", "CIUDAD", "ESTADO", "COBERTURA", "DIAS"]
                )}

                {renderTable("Cobertura TRES GUERRAS",
                    ["CP", "Colonia", "Población", "Sucursal", "Cobertura Paquetería"],
                    datosGuerras,
                    page2,
                    setPage2,
                    rowsPerPage2,
                    ["CP", "COLONIA", "POBLACION", "SUCURSAL", "COBERTURA_PAQUETERIA"]
                )}

                {renderTable("Cobertura PITIC",
                    ["CP", "Estado", "Municipio", "Ciudad", "Tipo Asentamiento", "Ofna", "Cobertura", "Paquetería"],
                    datosPitic,
                    page3,
                    setPage3,
                    rowsPerPage3,
                    ["CP", "Estado", "Municipio", "Ciudad", "Tipo_de_Asentamiento", "Ofna", "Cobertura", "Paqueteria"]
                )}
            </Grid>
        </Container>
    );
}

export default COBERTURA;

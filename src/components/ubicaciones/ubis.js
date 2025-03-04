import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, Box, Paper, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import QRCodeGenerator from 'qrcode';

function Ubicaciones() {
    const [ubicaciones, setUbicaciones] = useState({});
    const [selectedPasillo, setSelectedPasillo] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://66.232.105.87:3007/api/ubicaciones');
                setUbicaciones(response.data);
            } catch (error) {
                console.error('Error fetching ubicaciones:', error);
            }
        };

        fetchData();
    }, []);

    const ordenarUbicacionesPorNivel = (ubicaciones) => {
        return ubicaciones.sort((a, b) => {
            const nivelA = a.NIVEL || '';
            const nivelB = b.NIVEL || '';
            return nivelB.localeCompare(nivelA); // Orden descendente
        });
    };

    const renderSeccion = (seccion, data, tipo) => {
        if (!data[0] && !data[1]) {
            return null;
        }

        const data0Exists = data[0] && data[0].ubicaciones && Array.isArray(data[0].ubicaciones);
        const data1Exists = data[1] && data[1].ubicaciones && Array.isArray(data[1].ubicaciones);

        if (data0Exists) {
            data[0].ubicaciones = ordenarUbicacionesPorNivel(data[0].ubicaciones);
        }
        if (data1Exists) {
            data[1].ubicaciones = ordenarUbicacionesPorNivel(data[1].ubicaciones);
        }

        const maxRows = Math.max(data0Exists ? data[0].ubicaciones.length : 0, data1Exists ? data[1].ubicaciones.length : 0);

        return (
            <Paper elevation={3} key={`${seccion}`} sx={{ mb: 2 }}>
                <Box p={2}>
                    <Typography variant="h6">{`Sección ${seccion} ${tipo}`}</Typography>
                    <table style={{ width: '35%', textAlign: 'center', borderCollapse: 'collapse', marginLeft: '35%' }}>
                        <thead>
                            <tr>
                                <th>{data0Exists ? `${data[0].seccion}` : 'N/A'}</th>
                                <th>{data1Exists ? `${data[1].seccion}` : 'N/A'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: maxRows }).map((_, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {data0Exists && data[0].ubicaciones[index] ? (
                                            <>
                                                <QRCode value={data[0].ubicaciones[index].UBICACIÓN} size={70} />
                                                <Typography>{data[0].ubicaciones[index].UBICACIÓN}</Typography>
                                            </>
                                        ) : null}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {data1Exists && data[1].ubicaciones[index] ? (
                                            <>
                                                <QRCode value={data[1].ubicaciones[index].UBICACIÓN} size={70} />
                                                <Typography>{data[1].ubicaciones[index].UBICACIÓN}</Typography>
                                            </>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Paper>
        );
    };

    const renderPasillo = (pasillo, data) => {
        const renderedPairs = [];
        const renderedImpares = [];

        Object.keys(data).forEach(seccion => {
            const pares = data[seccion].Pares;
            const impares = data[seccion].Impares;

            if (pares.length > 0) {
                renderedPairs.push(renderSeccion(seccion, pares, "Pares"));
            }
            if (impares.length > 0) {
                renderedImpares.push(renderSeccion(seccion, impares, "Impares"));
            }
        });

        return (
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    {renderedImpares.length > 0 && (
                        <Box>
                            <Typography variant="h5" gutterBottom>Impares</Typography>
                            {renderedImpares}
                        </Box>
                    )}
                </Grid>
                <Grid item xs={6}>
                    {renderedPairs.length > 0 && (
                        <Box>
                            <Typography variant="h5" gutterBottom>Pares</Typography>
                            {renderedPairs}
                        </Box>
                    )}
                </Grid>
            </Grid>
        );
    };

    const handlePasilloChange = (event) => {
        setSelectedPasillo(event.target.value);
    };
    const generatePDF = async () => {
        const doc = new jsPDF();
        const qrSize = 18.5; // Tamaño del QR en puntos
        const fontSize = 7; // Tamaño de fuente ajustado al tamaño del QR
    
        // Márgenes para las columnas
        const marginXLeft = 10;
        const marginXSecondColumn = 50; // Ajustado para la segunda columna de la izquierda
        const marginXRight = 95; // Ajustado para la primera columna de la derecha
        const marginXSecondRightColumn = 135; // Ajustado para la segunda columna de la derecha
    
        const marginYStart = 2; // Ajustar margen inicial superior para reducir el espacio superior
        const spacingY = qrSize + 2; // Espaciado vertical entre filas
    
        const logoURL = '../assets/image/logob.png';
        const logoWidth = 35; // Ajusta el tamaño del logo según sea necesario
        const logoHeight = 15; // Ajusta el tamaño del logo según sea necesario
        const logoOffsetY = 1; // Espacio adicional para el logo
    
        const pasilloData = ubicaciones[selectedPasillo];
    
        // Agrupar y ordenar ubicaciones por sección y nivel (de mayor a menor)
        const ordenarPorSeccionYNivel = (ubicaciones) => {
            return ubicaciones.sort((a, b) => {
                const [nivelA] = a.UBICACIÓN.split('-').slice(2); // Extrae el nivel
                const [nivelB] = b.UBICACIÓN.split('-').slice(2);
                return nivelB.localeCompare(nivelA, undefined, { numeric: true }); // Ordena de mayor a menor
            });
        };
    
        // Función para agregar una tabla de ubicaciones
        const addUbicacionesTable = async (ubicaciones, tipo, seccion, posX, posY) => {
            if (Array.isArray(ubicaciones) && ubicaciones.length > 0) {
                let marginY = posY;
    
                // Ordenar ubicaciones
                const ubicacionesOrdenadas = ordenarPorSeccionYNivel(
                    ubicaciones
                        .filter((ubicacionData) => ubicacionData && ubicacionData.ubicaciones && Array.isArray(ubicacionData.ubicaciones)) // Filtrar para evitar datos undefined
                        .flatMap((ubicacionData) => ubicacionData.ubicaciones)
                );
    
                for (let i = 0; i < ubicacionesOrdenadas.length; i += 2) {
                    const leftUbicacion = ubicacionesOrdenadas[i];
                    const rightUbicacion = ubicacionesOrdenadas[i + 1];
    
                    // Ajusta el tamaño del texto según sea necesario
                    doc.setFontSize(fontSize);
    
                    if (leftUbicacion) {
                        const qrCodeLeftURL = await QRCodeGenerator.toDataURL(leftUbicacion.UBICACIÓN);
                        doc.addImage(qrCodeLeftURL, 'PNG', posX, marginY, qrSize, qrSize);
                        const textXLeft = posX + (qrSize / 2) - (doc.getTextWidth(leftUbicacion.UBICACIÓN) / 2);
                        doc.text(leftUbicacion.UBICACIÓN, textXLeft, marginY + qrSize + 1);
                    }
    
                    if (rightUbicacion) {
                        const qrCodeRightURL = await QRCodeGenerator.toDataURL(rightUbicacion.UBICACIÓN);
                        doc.addImage(qrCodeRightURL, 'PNG', posX + 20, marginY, qrSize, qrSize); // Ajustado para la segunda columna
                        const textXRight = posX + 20 + (qrSize / 2) - (doc.getTextWidth(rightUbicacion.UBICACIÓN) / 2);
                        doc.text(rightUbicacion.UBICACIÓN, textXRight, marginY + qrSize + 1);
                    }
    
                    marginY += spacingY;
                }
            }
        };
    
        // Agrupar las secciones en bloques de 4 por hoja (2 a la izquierda y 2 a la derecha)
        const seccionesAgrupadas = Object.keys(pasilloData).reduce((result, seccion, index) => {
            const grupoIndex = Math.floor(index / 4); // Cambia de grupo cada 4 secciones
            if (!result[grupoIndex]) result[grupoIndex] = [];
            result[grupoIndex].push(seccion);
            return result;
        }, []);
    
        // Dibujar las secciones en cada hoja
        let isFirstPage = true; // Flag para manejar la primera página sin agregar una en blanco
        for (const grupo of seccionesAgrupadas) {
            if (!isFirstPage) {
                doc.addPage(); // Nueva página para cada grupo después de la primera página
            }
            isFirstPage = false;
    
            // Mostrar las secciones en cuadrantes
            for (let i = 0; i < grupo.length; i++) {
                const seccion = grupo[i];
                const pares = pasilloData[seccion].Pares;
                const impares = pasilloData[seccion].Impares;
    
                // Determinar la posición para cada cuadrante
                let posX;
                let posY = marginYStart + logoOffsetY; // Ajusta la altura para el logo
    
                if (i === 0) posX = marginXLeft; // Primera columna (izquierda)
                else if (i === 1) posX = marginXSecondColumn; // Segunda columna (izquierda)
                else if (i === 2) posX = marginXRight; // Primera columna (derecha)
                else posX = marginXSecondRightColumn; // Segunda columna (derecha)
    
                // Agregar el logo antes de cada par de secciones
                doc.addImage(logoURL, 'PNG', posX, marginYStart, logoWidth, logoHeight);
    
                // Ajusta el espacio entre el logo y las secciones
                posY += 12;
    
                // Dibujar las secciones en su respectivo cuadrante
                await addUbicacionesTable(impares, 'Impares', seccion, posX, posY);
                await addUbicacionesTable(pares, 'Pares', seccion, posX, posY);
            }
        }
    
        doc.save(`Pasillo_${selectedPasillo}.pdf`);
    };
    
    
    
    
    
    

    

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Ubicaciones de Pasillos
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="pasillo-select-label">Seleccionar Pasillo</InputLabel>
                <Select
                    labelId="pasillo-select-label"
                    id="pasillo-select"
                    value={selectedPasillo}
                    label="Seleccionar Pasillo"
                    onChange={handlePasilloChange}
                >
                    {Object.keys(ubicaciones).map(pasilloKey => (
                        <MenuItem key={pasilloKey} value={pasilloKey}>{pasilloKey}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {selectedPasillo && (
                <>
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={generatePDF}>
                        Descargar PDF
                    </Button>
                    <Box>
                        <Typography variant="h5" gutterBottom>{`Pasillo ${selectedPasillo}`}</Typography>
                        {renderPasillo(selectedPasillo, ubicaciones[selectedPasillo])}
                    </Box>
                </>
            )}
        </Box>
    );
}

export default Ubicaciones;

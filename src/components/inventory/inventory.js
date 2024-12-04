import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import CircularProgress from "@mui/material/CircularProgress";
import { FixedSizeList as List } from "react-window";
import { utils, write } from "xlsx"; // Importar utils y write para manejo de Excel
import { saveAs } from "file-saver"; // Importar saveAs para guardar archivos

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Inventory() {
    // Estados
    const [inventoryData, setInventoryData] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const [locations, setLocations] = useState([]);
    const [pasilloPercentages, setPasilloPercentages] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [responsableProgress, setResponsableProgress] = useState([]);
    const [manualData, setManualData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Efecto para cargar datos
    useEffect(() => {
        let isMounted = true; // Control para evitar actualizaciones después del desmontaje

        const fetchData = async () => {
            try {
                setLoading(true); // Activa el estado de carga

                const [
                    porcentajeRes,
                    ubicacionesRes,
                    personaRes,
                    manualRes,
                    inventarioRes,
                ] = await Promise.all([
                    axios.get("http://192.168.3.27:3007/api/inventory/porcentaje"),
                    axios.get("http://192.168.3.27:3007/api/inventory/ubicaciones"),
                    axios.get("http://192.168.3.27:3007/api/inventory/persona"),
                    axios.get("http://192.168.3.27:3007/api/inventory/Manuealsi"),
                    axios.get("http://192.168.3.27:3007/api/inventory/obtenerinventario"),
                ]);

                if (isMounted) {
                    setPercentage(porcentajeRes.data.percentage || 0);
                    setLocations(
                        inventarioRes.data.locations || ubicacionesRes.data.locations || []
                    );
                    setPasilloPercentages(ubicacionesRes.data.pasilloPercentages || []);
                    setResponsableProgress(personaRes.data || []);
                    setManualData(manualRes.data || []);
                    setInventoryData(inventarioRes.data.data || []); // Asigna datos a inventoryData
                    console.log("Datos de inventario asignados:", inventarioRes.data.data);
                }
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            } finally {
                if (isMounted) setLoading(false); // Desactiva el estado de carga
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Evita actualizaciones si el componente está desmontado
        };
    }, []);

    // Función para exportar a Excel
    const handleDownloadExcel = () => {
        if (!inventoryData || inventoryData.length === 0) {
            console.error("No hay datos de inventario para exportar.");
            return;
        }

        try {
            const worksheet = utils.json_to_sheet(inventoryData); // Convierte datos a hoja de cálculo
            const workbook = utils.book_new(); // Crea un libro de trabajo
            utils.book_append_sheet(workbook, worksheet, "Inventario");

            const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

            saveAs(blob, "inventario.xlsx"); // Descarga el archivo Excel
        } catch (error) {
            console.error("Error al exportar el archivo Excel:", error);
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage <= 30) return "red";
        if (percentage <= 89) return "orange";
        return "green";
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const calculateStockPercentage = (cantidad, cant_stock, estado) => {
        if (estado === "F") return 100;
        if (!cantidad || cantidad === 0) return 0;
        if (!cant_stock) cant_stock = 0;
        return Math.min((cant_stock / cantidad) * 100, 100);
    };

    const barData = {
        labels: pasilloPercentages.map((p) => p.pasillo),
        datasets: [
            {
                label: "Porcentaje de Progreso",
                data: pasilloPercentages.map((p) => p.percentage),
                backgroundColor: pasilloPercentages.map((p) =>
                    getProgressColor(p.percentage)
                ),
                borderRadius: 10,
            },
        ],
    };

    const barDataPersona = {
        labels: responsableProgress.map((persona) => persona.responsable),
        datasets: [
            {
                label: "Porcentaje de Progreso",
                data: responsableProgress.map((persona) =>
                    parseFloat(persona.porcentaje_completado)
                ),
                backgroundColor: responsableProgress.map((persona) =>
                    getProgressColor(parseFloat(persona.porcentaje_completado))
                ),
                borderRadius: 10, // Bordes redondeados
            },
        ],
    };

    const barOptionsPersona = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Avance por Persona" },
        },
        scales: {
            x: {
                grid: { display: false },
                title: { display: true, text: "Responsable" },
            },
            y: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: "Porcentaje (%)" },
                ticks: { stepSize: 20 },
            },
        },
    };


    return (
        <Box width="100%" textAlign="center" marginTop={4}>
            <Tabs value={selectedTab} onChange={handleTabChange} centered>
                <Tab label="Progreso General" />
                <Tab label="Progreso por Ubicaciones" />
                <Tab label="Avance por Persona" />
                <Tab label="Manual" />
            </Tabs>

            {/* Tab 0: Progreso General */}
            {selectedTab === 0 && (
                <Box marginTop={4} display="flex" justifyContent="center">
                    <Box width="50%" marginRight={2}>
                        <Typography variant="h4" gutterBottom>Progreso General de Ubicaciones</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownloadExcel}
                            disabled={loading || inventoryData.length === 0}
                        >
                            {loading ? "Cargando..." : "Descargar Excel"}
                        </Button>
                        <br></br>
                        <Box display="flex" alignItems="center" justifyContent="center" marginBottom={4}>
                            <Box width="90%" marginRight={1}>
                                <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    sx={{
                                        height: 30,
                                        borderRadius: 5,
                                        bgcolor: "grey.300",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: getProgressColor(percentage),
                                        },
                                    }}
                                />
                                <Box minWidth={35}>
                                    <Typography variant="h4" color="textSecondary">
                                        {`${Math.round(percentage)}%`}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>


                        {/* Panel de información de pasillos */}
                        <Box display="flex" flexWrap="wrap" justifyContent="center">
                            {pasilloPercentages.map((pasilloData, index) => (
                                <Box key={index} width="20%" padding={1} textAlign="center" margin={1} border={3} borderRadius={5}>
                                    <Typography variant="h6">{`Pasillo: ${pasilloData.pasillo}`}</Typography>
                                    <Typography variant="body2" color="black">
                                        {`Completadas: ${pasilloData.completed} / Pendientes: ${pasilloData.pending}`}
                                    </Typography>
                                    <Box position="relative" display="inline-flex" justifyContent="center" alignItems="center" marginTop={1}>

                                        <CircularProgress
                                            variant="determinate"
                                            value={pasilloData.percentage}
                                            size={100}
                                            thickness={5}
                                            sx={{ color: getProgressColor(pasilloData.percentage) }} />

                                        <Box
                                            top={0}
                                            left={0}
                                            bottom={0}
                                            right={0}
                                            position="absolute"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center">

                                            <Typography variant="caption" component="div" color="textSecondary">
                                                {`${Math.round(pasilloData.percentage)}%`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>


                    </Box>

                </Box>
            )}


            {/* Tab 1: Progreso por Ubicaciones */}
            {selectedTab === 1 && (
                <Box marginTop={4}>
                    <Typography variant="h5">Progreso por Ubicaciones</Typography>
                    <Box display="flex" justifyContent="space-between" marginTop={4}>
                        {["PAR", "IMPAR"].map((tipo) => (
                            <Box key={tipo} width="48%" textAlign="center">
                                <Typography variant="h6">{`Ubicaciones tipo: ${tipo}`}</Typography>
                                <Box width="100%" height={400} overflow="auto" display="flex" flexWrap="wrap" justifyContent="center">
                                    <List
                                        height={400}
                                        itemCount={Math.ceil(locations.filter(location => location.tipo === tipo).length / 2)} // Dividido en grupos de 2
                                        itemSize={160} // Ajusta la altura de cada grupo de ubicaciones
                                        width="100%"
                                    >
                                        {({ index, style }) => {
                                            const start = index * 2;
                                            const end = start + 2;
                                            const locationGroup = locations.filter(location => location.tipo === tipo).slice(start, end);

                                            return (
                                                <Box key={index} style={style} display="flex" justifyContent="center" width="100%">
                                                    {locationGroup.map((location, subIndex) => {
                                                        const progress = calculateStockPercentage(location.cantidad, location.cant_stock, location.estado);
                                                        return (
                                                            <Box key={subIndex} width="45%" display="flex" flexDirection="column" alignItems="center" margin={1}>
                                                                <Typography variant="h6">{`Ubicación: ${location.ubi}`}</Typography>
                                                                <Box position="relative" display="inline-flex" justifyContent="center" alignItems="center">
                                                                    <CircularProgress
                                                                        variant="determinate"
                                                                        value={progress}
                                                                        size={100}
                                                                        thickness={5}
                                                                        sx={{ color: getProgressColor(progress) }}
                                                                    />
                                                                    <Box
                                                                        top={0}
                                                                        left={0}
                                                                        bottom={0}
                                                                        right={0}
                                                                        position="absolute"
                                                                        display="flex"
                                                                        alignItems="center"
                                                                        justifyContent="center"
                                                                    >
                                                                        <Typography variant="caption" component="div" color="textSecondary">
                                                                            {`${Math.round(progress)}%`}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            );
                                        }}
                                    </List>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}


            {/* Tab 2: Avance por Persona */}
            {selectedTab === 2 && (
                <Box marginTop={4}>
                    <Typography variant="h5">Avance por Persona</Typography>
                    <Box width="70%" margin="auto">
                        <Bar data={barDataPersona} options={barOptionsPersona} />
                    </Box>
                </Box>
            )}


            {/* Tab 3: Manual */}
            {selectedTab === 3 && (
                <Box marginTop={4}>
                    <Typography variant="h5">Datos de Inventario Manual</Typography>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Box display="flex" flexWrap="wrap" justifyContent="center">
                            {manualData.length > 0 ? (
                                manualData.map((item, index) => (
                                    <Box
                                        key={index}
                                        border={1}
                                        borderColor="grey.300"
                                        borderRadius={4}
                                        padding={2}
                                        margin={1}
                                        width="300px"
                                        textAlign="left">

                                        <Typography variant="h6">{`Ubicación: ${item.ubi}`}</Typography>
                                        <Typography>{`Tipo: ${item.tipo}`}</Typography>
                                        <Typography>{`Asignado: ${item.asignado}`}</Typography>
                                        <Typography>{`Responsable: ${item.responsable}`}</Typography>
                                        <Typography>{`Estado: ${item.estado || 'Pendiente'}`}</Typography>
                                        <Typography>{`Hora Inicio: ${item.hora_inicio || 'No disponible'}`}</Typography>
                                        <Typography>{`Hora Final: ${item.hora_final || 'No disponible'}`}</Typography>
                                        <Typography>{`Código: ${item.codigo}`}</Typography>
                                        <Typography>{`Cantidad: ${item.cantidad}`}</Typography>
                                        <Typography>{`Stock: ${item.cant_stock || 0}`}</Typography>
                                        <Typography>{`Manual: ${item.manual}`}</Typography>
                                        <Typography>{`Nivel: ${item.nivel}`}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No hay datos disponibles con manual = "Si".
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}


        </Box>
    );
}

export default Inventory;


import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { UserContext } from "../context/UserContext";
import ArticleIcon from "@mui/icons-material/Article";
<<<<<<< HEAD
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Autocomplete from "@mui/material/Autocomplete";
import { CloudUpload } from "@mui/icons-material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Tooltip } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import moment from "moment";

=======
>>>>>>> origin/master
import { NumerosALetras } from "numero-a-letras";

import axios from "axios";
import {
<<<<<<< HEAD
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Box,
    Button,
    Modal,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    AppBar,
    Tabs,
    Tab,
    IconButton,
    Snackbar,
    Checkbox,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    Card,
    CircularProgress,
    CardContent,
    CardActions,
} from "@mui/material";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./Packing.jpg";
=======
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Grid,
  TablePagination,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./logo.png";
>>>>>>> origin/master
import infoBancaria from "./informacion_bancaria.jpg";
import barraFooter from "./BARRA.jpg";

const hasExpired = (timestamp) => {
<<<<<<< HEAD
    const now = new Date().getTime();
    return now - timestamp > 24 * 60 * 60 * 1000;
};

function Tracking() {
    const [data, setData] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [newRoute, setNewRoute] = useState("");
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [observaciones, setObservaciones] = useState({});
    const [observacionesPorRegistro, setObservacionesPorRegistro] = useState(
        () => {
            const storedObservaciones = localStorage.getItem(
                "observacionesPorRegistro"
            );
            return storedObservaciones ? JSON.parse(storedObservaciones) : {};
        }
    );

    const [tabIndex, setTabIndex] = useState(0);

    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [confirmSendModalOpen, setConfirmSendModalOpen] = useState(false);
    const [sentRoutesData, setSentRoutesData] = useState([]);

    const [totalClientes, setTotalClientes] = useState(0);
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [totalGeneral, setTotalGeneral] = useState(0);

    const [guiaModalOpen, setGuiaModalOpen] = useState(false);
    const [selectedNoOrden, setSelectedNoOrden] = useState(null);
    const [guia, setGuia] = useState("");
    const [tipoRuta, setTipoRuta] = useState("");
    const { user } = useContext(UserContext);

    const [paqueteriaData, setPaqueteriaData] = useState([]);
    const [directaData, setDirectaData] = useState([]);
    const [ventaEmpleadoData, setVentaEmpleadoData] = useState([]);

    const [subTabIndex, setSubTabIndex] = useState(0); // Inicia en 0 para Paquetería

    const [totalFacturaLT, setTotalFacturaLT] = useState("");
    const [totalValue, setTotalValue] = useState(0);
    const [paqueteria, setPaqueteria] = useState("");
    const [fechaEntregaCliente, setFechaEntregaCliente] = useState("");
    const [fechaEstimadaCliente, setFechaEstimadaCliente] = useState("");
    const [diasEntrega, setDiasEntrega] = useState("");
    const [entregaSatisfactoria, setEntregaSatisfactoria] = useState("");
    const [motivo, setMotivo] = useState("");
    const [gastosExtras, setGastosExtras] = useState("");
    const [porcentajeEnvio, setPorcentajeEnvio] = useState("");
    const [porcentajePaqueteria, setPorcentajePaqueteria] = useState("");
    const [sumaGastosExtras, setSumaGastosExtras] = useState("");
    const [porcentajeGlobal, setPorcentajeGlobal] = useState("");
    const [diferencia, setDiferencia] = useState("");
    const [noFactura, setNoFactura] = useState("");
    const [fechaFactura, setFechaFactura] = useState("");
    const [tarimas, setTarimas] = useState("");
    const [numeroFacturaLT, setNumeroFacturaLT] = useState("");
    const [total, setTotal] = useState("");

    const [prorateoFacturaLT, setProrateoFacturaLT] = useState(0);
    const [prorateoFacturaPaqueteria, setProrateoFacturaPaqueteria] = useState(0);
    const [sumaFlete, setSumaFlete] = useState(0);

    const [directaModalOpen, setDirectaModalOpen] = useState(false);
    const [selectedDirectaData, setSelectedDirectaData] = useState(null);

    const [editRouteIndex, setEditRouteIndex] = useState(null);

    const [fecha, setFecha] = useState("");
    const [numCliente, setNumCliente] = useState("");
    const [nombreCliente, setNombreCliente] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [estado, setEstado] = useState("");
    const [partidas, setPartidas] = useState("");
    const [piezas, setPiezas] = useState("");
    const [zona, setZona] = useState("");
    const [tipoZona, setTipoZona] = useState("");
    const [fechaEmbarque, setFechaEmbarque] = useState("");
    const [diaEnRuta, setDiaEnRuta] = useState("");
    const [cajas, setCajas] = useState("");
    const [transporte, setTransporte] = useState("");
    const [error, setError] = useState(null);

    const [transportistaData, setTransportistaData] = useState([]);
    const [empresaData, setEmpresaData] = useState([]);

    const [tipo, setTipo] = useState(""); // Agregar esto
    const [loading, setLoading] = useState(false);
    const [calculatedTotals, setCalculatedTotals] = useState(null);

    const [totalsModalOpen, setTotalsModalOpen] = useState(false);

    const [editingClientId, setEditingClientId] = useState(null);
    const [currentObservation, setCurrentObservation] = useState("");

    const [filterOrderValue, setFilterOrderValue] = useState("");
    const [highlightedRow, setHighlightedRow] = useState(null); // Fila temporalmente resaltada

    const [historicoData, setHistoricoData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(""); // Cliente seleccionado
    const [clienteFilteredData, setClienteFilteredData] = useState([]); // 🔹 Cambio de nombre para evitar conflicto
    const [clientes, setClientes] = useState([]);

    const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
    const [columnasDisponibles, setColumnasDisponibles] = useState([]);

    const [selectedMonth, setSelectedMonth] = useState("");

    const [filtro, setFiltro] = useState("");

    //estos son de los status
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (sentRoutesData.length === 0) return;

        let filteredData = [];
        let tabName = "";

        // Filtra sentRoutesData según el tipo, según la pestaña seleccionada
        switch (subTabIndex) {
            case 0:
                filteredData = sentRoutesData.filter(
                    (d) => d.TIPO?.trim().toLowerCase() === "paqueteria"
                );
                tabName = "Paquetería";
                break;
            case 1:
                filteredData = sentRoutesData.filter(
                    (d) => d.TIPO?.trim().toLowerCase() === "directa"
                );
                tabName = "Directa";
                break;
            case 2:
                filteredData = sentRoutesData.filter(
                    (d) => d.TIPO?.trim().toLowerCase() === "venta empleado"
                );
                tabName = "Recoge";
                break;
            case 3:
                filteredData = sentRoutesData.filter(
                    (d) => d.TIPO?.trim().toLowerCase() === "asignacion"
                );
                tabName = "Asignación";
                filteredData = sentRoutesData.filter((d) =>
                    ["paqueteria", "directa"].includes(d.TIPO?.trim().toLowerCase())
                );
                tabName = "Asignación";
                break;
            default:
                return;
        }

        // Si todos los elementos ya tienen un status válido, no es necesario llamar a la API
        if (
            !filteredData.some((d) => !d.statusText || d.statusText === "Cargando...")
        ) {
            return;
        }

        // Evita llamadas en paralelo
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        console.log(`🔍 Se ejecutará fetchStatuses para la pestaña: ${tabName}`);
        fetchFusions(filteredData)
            .then(() => fetchStatuses(filteredData, tabName))
            .catch((error) => console.error(error))
            .finally(() => {
                isFetchingRef.current = false;
            });
    }, [subTabIndex, sentRoutesData]);

    const fetchStatuses = async (data, tabName) => {
        if (data.length === 0) return;

        console.log(`📌 Buscando estado de pedidos en la pestaña: ${tabName}`);
        const orderNumbers = data.map((d) => d["NO ORDEN"]);
        console.log("📌 Enviando estos números de orden:", orderNumbers);

        // 🔥 Prioridad de estados
        const statusPriority = {
            "Sin coincidencia de tipo": 0,
            "Por Asignar": 1,
            Surtiendo: 2,
            Embarcando: 3,
            "Pedido Finalizado": 4,
        };

        try {
            const response = await axios.post(
                `http://localhost:3007/api/Ventas/status`,
                { orderNumbers }
            );

            console.log(`✅ Respuesta recibida para ${tabName}:`, response.data);

            const statusMap = response.data;

            setSentRoutesData((prevData) => {
                const updatedData = prevData.map((route) => {
                    const currentStatus = statusMap[route["NO ORDEN"]];
                    if (!currentStatus) return route; // 🚫 Si no hay actualización, deja igual

                    const prevPriority = statusPriority[route.statusText] || 0;
                    const newPriority = statusPriority[currentStatus.statusText] || 0;

                    let updatedRoute = { ...route };

                    // 🔥 Solo actualizar si el nuevo status es mejor o igual
                    if (newPriority >= prevPriority) {
                        updatedRoute.statusText =
                            currentStatus.statusText || route.statusText;
                        updatedRoute.color = currentStatus.color || route.color;
                        updatedRoute.fusionWith =
                            currentStatus.fusionWith || route.fusionWith || null;
                    }

                    // 🔥 Si es un pedido fusionado, también sincronizar
                    if (currentStatus.fusionWith) {
                        const fusionOrders = currentStatus.fusionWith.split("-");
                        if (fusionOrders.includes(String(route["NO ORDEN"]))) {
                            updatedRoute.statusText = currentStatus.statusText;
                            updatedRoute.color = currentStatus.color;
                            updatedRoute.fusionWith = currentStatus.fusionWith;
                        }
                    }

                    return updatedRoute;
                });

                // 🔥 Actualizar filtrados
                const finalUpdatedData = actualizarEstadosFusionados(updatedData);

                const paqueteria = finalUpdatedData.filter(
                    (route) => route.TIPO?.trim().toLowerCase() === "paqueteria"
                );
                const directa = finalUpdatedData.filter(
                    (route) => route.TIPO?.trim().toLowerCase() === "directa"
                );
                const ventaEmpleado = finalUpdatedData.filter(
                    (route) => route.TIPO?.trim().toLowerCase() === "venta empleado"
                );

                setPaqueteriaData(paqueteria);
                setDirectaData(directa);
                setVentaEmpleadoData(ventaEmpleado);

                return finalUpdatedData;
            });

        } catch (error) {
            console.error(`❌ Error en la API para ${tabName}:`, error);

            // 🔥 Si hubo error, asignar "Error en estado"
            setPaqueteriaData((prevData) =>
                prevData.map((route) => ({
                    ...route,
                    statusText: route.statusText || "Error en estado",
                }))
            );
            setDirectaData((prevData) =>
                prevData.map((route) => ({
                    ...route,
                    statusText: route.statusText || "Error en estado",
                }))
            );
            setVentaEmpleadoData((prevData) =>
                prevData.map((route) => ({
                    ...route,
                    statusText: route.statusText || "Error en estado",
                }))
            );
            setSentRoutesData((prevData) =>
                prevData.map((route) => ({
                    ...route,
                    statusText: route.statusText || "Error en estado",
                }))
            );
        }
    };

    const fetchFusions = async (data) => {
        const orderNumbers = data.map((d) => d["NO ORDEN"]);
        console.log("🔄 Consultando fusión para pedidos:", orderNumbers);

        try {
            const response = await axios.post(
                `http://localhost:3007/api/Ventas/fusion`,
                { orderNumbers }
            );

            const fusionMap = response.data;

            // Actualiza el estado con la info de fusión
            setSentRoutesData((prevData) =>
                prevData.map((route) =>
                    fusionMap[route["NO ORDEN"]]
                        ? {
                            ...route,
                            fusionWith: fusionMap[route["NO ORDEN"]].fusionWith || null,
                            fusionState: fusionMap[route["NO ORDEN"]].estado,
                            fusionTable: fusionMap[route["NO ORDEN"]].tabla,
                        }
                        : route
                )
            );

            // Si también quieres reflejarlo en los tabs específicos
            setPaqueteriaData((prevData) =>
                prevData.map((route) =>
                    fusionMap[route["NO ORDEN"]]
                        ? {
                            ...route,
                            fusionWith: fusionMap[route["NO ORDEN"]].fusionWith || null,
                        }
                        : route
                )
            );
            setDirectaData((prevData) =>
                prevData.map((route) =>
                    fusionMap[route["NO ORDEN"]]
                        ? {
                            ...route,
                            fusionWith: fusionMap[route["NO ORDEN"]].fusionWith || null,
                        }
                        : route
                )
            );
            setVentaEmpleadoData((prevData) =>
                prevData.map((route) =>
                    fusionMap[route["NO ORDEN"]]
                        ? {
                            ...route,
                            fusionWith: fusionMap[route["NO ORDEN"]].fusionWith || null,
                        }
                        : route
                )
            );
        } catch (error) {
            console.error("❌ Error al consultar fusión:", error);
        }
    };

    //estos son lo del estatus de las fuciones

    // 🔥 Ranking de estados
    const statusRanking = {
        "Pedido Finalizado": 3,
        "Salida de Almacén": 2,
        "Por Asignar": 1,
        "Error en estado": 0, // Si quieres agregar más estados, ponlos aquí
    };

    // 🔥 Función para actualizar estados fusionados

    const actualizarEstadosFusionados = (data) => {
        const pedidosMap = {};

        // 🔵 Mapeamos todos los pedidos por NO ORDEN
        data.forEach((pedido) => {
            pedidosMap[pedido["NO ORDEN"]] = pedido;
        });

        // 🔥 Ranking de estados
        const statusRanking = {
            "Pedido Finalizado": 4,
            Embarcando: 3,
            Surtiendo: 2,
            "Por Asignar": 1,
            "Sin coincidencia de tipo": 0,
            "Error en estado": 0,
        };

        // 🔥 Primera pasada: actualizar según fusión
        data.forEach((pedido) => {
            if (pedido.fusionWith) {
                const partes = pedido.fusionWith.split("-");
                const otroPedido = partes.find((p) => p !== String(pedido["NO ORDEN"]));

                const fusionado = pedidosMap[otroPedido];

                if (fusionado) {
                    const rankPedido = statusRanking[pedido.statusText] || 0;
                    const rankFusionado = statusRanking[fusionado.statusText] || 0;

                    // 🔥 Escoger el mejor estado entre los dos
                    const mejorStatus = rankPedido >= rankFusionado ? pedido : fusionado;

                    // 🔥 Aplicar el mejor estado a ambos
                    pedido.statusText = mejorStatus.statusText;
                    pedido.color = mejorStatus.color;

                    fusionado.statusText = mejorStatus.statusText;
                    fusionado.color = mejorStatus.color;
                }
            }
        });

        return data;
    };

    // fin de las fuciones

    const handleRowClick = (routeData) => {
        // console.log("Route Data:", routeData); // Esto te ayudará a verificar qué datos están siendo pasados
        setTotalValue(routeData.TOTAL);
    };

    const handleChangeSubTab = (event, newValue) => {
        setSubTabIndex(newValue); // Cambia el índice de la subpestaña seleccionada
    };

    useEffect(() => {
        const storedData = localStorage.getItem("transporteData");
        const storedGroupedData = localStorage.getItem("transporteGroupedData");
        const storedTimestamp = localStorage.getItem("transporteTimestamp");

        if (storedData && storedGroupedData && storedTimestamp) {
            if (hasExpired(Number(storedTimestamp))) {
                // Si los datos han caducado, limpiar localStorage
                localStorage.removeItem("transporteData");
                localStorage.removeItem("transporteGroupedData");
                localStorage.removeItem("transporteTimestamp");
            } else {
                // Si los datos son válidos, cargarlos al estado
                setData(JSON.parse(storedData));
                setGroupedData(JSON.parse(storedGroupedData));
            }
        }
    }, []);

    useEffect(() => {
        try {
            if (
                data.length > 0 ||
                Object.keys(groupedData).length > 0 ||
                sentRoutesData.length > 0
            ) {
                localStorage.setItem("transporteData", JSON.stringify(data));
                localStorage.setItem(
                    "transporteGroupedData",
                    JSON.stringify(groupedData)
                );

                // Verificar si sentRoutesData cabe en localStorage
                const strSentRoutes = JSON.stringify(sentRoutesData);
                const sizeInKB = new Blob([strSentRoutes]).size / 1024;

                if (sizeInKB < 4800) {
                    localStorage.setItem("sentRoutesData", strSentRoutes);
                } else {
                    console.warn(
                        "⚠️ No se guardó 'sentRoutesData': excede los 5MB (~" +
                        sizeInKB.toFixed(2) +
                        "KB)"
                    );
                }

                localStorage.setItem("transporteTimestamp", new Date().getTime());
            }
        } catch (error) {
            console.error("❌ Error guardando en localStorage:", error);
        }
    }, [data, groupedData, sentRoutesData]);

    useEffect(() => {
        fetchPaqueteriaRoutes(); // Llama a la API para cargar las rutas de paquetería
    }, []);

    useEffect(() => {
        const getTipo = (item) =>
            (item.TIPO || item.tipo_original || "").toLowerCase().trim();

        const paqueteria = sentRoutesData.filter(
            (item) => getTipo(item) === "paqueteria"
        );
        const directa = sentRoutesData.filter(
            (item) => getTipo(item) === "directa"
        );
        const ventaEmpleado = sentRoutesData.filter(
            (item) => getTipo(item) === "venta empleado"
        );

        setPaqueteriaData(paqueteria);
        setDirectaData(directa);
        setVentaEmpleadoData(ventaEmpleado);
    }, [sentRoutesData]);


    useEffect(() => {
        if (total && prorateoFacturaLT) {
            const porcentajeEnvio = (prorateoFacturaLT / total) * 100;
            setPorcentajeEnvio(porcentajeEnvio.toFixed(2)); // Redondear a 2 decimales
        } else {
            setPorcentajeEnvio(""); // Limpiar si no hay valores válidos
        }
    }, [total, prorateoFacturaLT]);

    useEffect(() => {
        if (total && prorateoFacturaPaqueteria) {
            const porcentajePaqueteria = (prorateoFacturaPaqueteria / total) * 100;
            setPorcentajePaqueteria(porcentajePaqueteria.toFixed(2)); // Redondear a 2 decimales
        } else {
            setPorcentajePaqueteria(""); // Limpiar si no hay valores válidos
        }
    }, [total, prorateoFacturaPaqueteria]);

    useEffect(() => {
        // Convertimos a número y verificamos si es NaN
        const prorateoLTNum = parseFloat(prorateoFacturaLT) || 0;
        const prorateoPaqueteriaNum = parseFloat(prorateoFacturaPaqueteria) || 0;
        const gastosExtrasNum = parseFloat(gastosExtras) || 0;
        // Realizamos la suma
        const sumaTotal = prorateoLTNum + prorateoPaqueteriaNum + gastosExtrasNum;

        setSumaGastosExtras(sumaTotal.toFixed(2)); // Redondear a 2 decimales
    }, [prorateoFacturaLT, prorateoFacturaPaqueteria, gastosExtras]);

    useEffect(() => {
        if (total && sumaGastosExtras) {
            const porcentaje =
                (parseFloat(sumaGastosExtras) / parseFloat(total)) * 100;
            // console.log("Porcentaje Global calculado:", porcentaje);
            setPorcentajeGlobal(porcentaje.toFixed(2)); // Redondear a 2 decimales
        } else {
            setPorcentajeGlobal("");
        }
    }, [total, sumaGastosExtras]);

    useEffect(() => {
        if (total && sumaGastosExtras) {
            const porcentaje =
                (parseFloat(sumaGastosExtras) / parseFloat(total)) * 100;
            // console.log("Porcentaje Global calculado:", porcentaje);
            setPorcentajeGlobal(porcentaje.toFixed(2)); // Redondear a 2 decimales
        } else {
            setPorcentajeGlobal("");
        }
    }, [total, sumaGastosExtras]);

    useEffect(() => {
        fetchTransportistas();
        fetchEmpresas();
    }, []);

    useEffect(() => {
        data.forEach((row) => {
            const numCliente = row["NUM. CLIENTE"];
            if (numCliente !== undefined && numCliente !== null) {
                const clienteKey = String(numCliente).trim(); // más seguro
                if (!observacionesPorRegistro[clienteKey]) {
                    fetchObservacionPorRegistro(clienteKey);
                }
            }
        });
    }, [data]);

    const exportToImage = () => {
        const element = document.getElementById("data-to-capture");

        html2canvas(element).then((canvas) => {
            // Crea una URL de la imagen generada
            const imageUrl = canvas.toDataURL("image/png");

            // Crea un enlace para descargar la imagen
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = "Resumen_Rutas.png"; // Nombre del archivo de la imagen
            link.click();
        });
    };

    const handleChangeTab = (event, newValue) => {
        setTabIndex(newValue);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };



    const mapColumns = (row) => ({
        RUTA: "Sin Ruta",
        FECHA: row["Fecha Lista Surtido"],
        "NO ORDEN": row["No Orden"] || row["__EMPTY_1"] || "",
        "NO FACTURA": row["No Factura"] || row["__EMPTY_4"] || "",
        "NUM. CLIENTE":
            row["No Dir Entrega"] || row["Cliente"] || row["__EMPTY_8"] || "",
        "NOMBRE DEL CLIENTE": row["Nombre Cliente"] || row["__EMPTY_11"] || "",
        Codigo_Postal: row["Codigo Postal"] || row["__EMPTY_14"] || "",
        ZONA: row["Zona"] || row["__EMPTY_10"] || "",
        MUNICIPIO:
            row["Municipio"] ||
            row["Municipo"] ||
            row["__EMPTY_12"] ||
            row["__EMPTY_13"] ||
            "",
        ESTADO: row["Estado"] || row["__EMPTY_15"] || "",
        OBSERVACIONES: "",
        TOTAL:
            parseFloat(
                String(row["Total"] || row["__EMPTY_21"] || "0").replace(",", "")
            ) || 0,
        PARTIDAS: Number(row["Partidas"] || row["__EMPTY_22"] || 0),
        PIEZAS: Number(row["Cantidad"] || row["__EMPTY_23"] || 0),
        DIRECCION: `${row["Calle"] || ""} ${row["Colonia"] || ""} ${row["Municipio"] || ""
            } ${row["Codigo Postal"] || ""} ${row["Estado"] || ""}`,
        CORREO: row["E-mail"] || "",
        TELEFONO: row["No. Telefonico"] || "",
        "EJECUTIVO VTAS": row["Ejecutico Vtas"] || "",
        "TIPO ORIGINAL": row["Tipo"] || "",
    });



    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: "binary" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
                range: 6, // Omitir las primeras 6 filas
            });

            // 🔹 Pedidos ya registrados
            const pedidosRegistrados = new Set();

            // Pedidos ya enviados
            sentRoutesData.forEach((r) => {
                const orden = String(r["NO ORDEN"]).trim();
                const tipo = String(r["TIPO ORIGINAL"] || r["tipo_original"]).trim().toUpperCase();
                pedidosRegistrados.add(`${orden}_${tipo}`);
            });

            // Pedidos ya asignados a rutas
            Object.values(groupedData).forEach((route) => {
                route.rows.forEach((r) => {
                    const orden = String(r["NO ORDEN"]).trim();
                    const tipo = String(r["TIPO ORIGINAL"] || r["tipo_original"]).trim().toUpperCase();
                    pedidosRegistrados.add(`${orden}_${tipo}`);
                });
            });

            // 🔹 Obtener los últimos 5 días hábiles
            const getLastBusinessDays = (numDays) => {
                const businessDays = [];
                let currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                while (businessDays.length < numDays) {
                    if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
                        businessDays.push(new Date(currentDate));
                    }
                    currentDate.setDate(currentDate.getDate() - 1);
                }
                return businessDays;
            };

            const lastBusinessDays = getLastBusinessDays(5);

            // 🔹 Pedidos con 'Lista Surtido' recientes
            const filteredData = jsonData
                .map((row) => {
                    if (!row["Fecha Lista Surtido"]) return null;

                    let rowDate;
                    if (typeof row["Fecha Lista Surtido"] === "number") {
                        rowDate = new Date((row["Fecha Lista Surtido"] - 25569) * 86400 * 1000);
                    } else {
                        const dateParts = row["Fecha Lista Surtido"].split("/");
                        if (dateParts.length === 3) {
                            rowDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                        } else {
                            rowDate = new Date(row["Fecha Lista Surtido"]);
                        }
                    }

                    if (isNaN(rowDate.getTime())) return null;

                    row.rowDateObject = new Date(rowDate.setHours(0, 0, 0, 0));

                    return lastBusinessDays
                        .slice(0, 3)
                        .some((bd) => bd.toDateString() === rowDate.toDateString()) &&
                        row["Estatus"] === "Lista Surtido"
                        ? row
                        : null;
                })
                .filter(Boolean)
                .sort((a, b) => b.rowDateObject - a.rowDateObject)
                .map(mapColumns)
                .filter((row) => {
                    const orden = String(row["NO ORDEN"]).trim();
                    const tipo = String(row["TIPO ORIGINAL"] || row["tipo_original"]).trim().toUpperCase();
                    return orden && tipo && !pedidosRegistrados.has(`${orden}_${tipo}`);
                });

            // 🔹 Pedidos Facturados
            const facturados = jsonData
                .filter((row) => row["Estatus"] === "Factura")
                .map((row) => {
                    let rowDate;
                    if (typeof row["Fecha Lista Surtido"] === "number") {
                        rowDate = new Date((row["Fecha Lista Surtido"] - 25569) * 86400 * 1000);
                    } else {
                        const dateParts = row["Fecha Lista Surtido"].split("/");
                        if (dateParts.length === 3) {
                            rowDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                        } else {
                            rowDate = new Date(row["Fecha Lista Surtido"]);
                        }
                    }
                    rowDate.setHours(0, 0, 0, 0);
                    return lastBusinessDays.some(
                        (bd) => bd.toDateString() === rowDate.toDateString()
                    )
                        ? row
                        : null;
                })
                .filter(Boolean);

            if (facturados.length > 0) {
                const facturadosCleaned = facturados.map((row) => String(row["No Orden"]).trim());
                const pedidoIds = facturadosCleaned.join(", ");
                const userInput = prompt(
                    `Se encontraron pedidos facturados: ${pedidoIds}\nIngrese los números de orden que desea insertar, separados por comas o deje vacío para insertarlos todos:`
                );

                let pedidosSeleccionados = [];

                if (userInput) {
                    const ordenesSeleccionadas = userInput.split(",").map((num) => num.trim());
                    pedidosSeleccionados = facturados.filter((row) =>
                        ordenesSeleccionadas.includes(String(row["No Orden"]).trim())
                    );
                } else {
                    pedidosSeleccionados = facturados;
                }

                const mappedFacturados = pedidosSeleccionados
                    .map(mapColumns)
                    .filter((row) => {
                        const orden = String(row["NO ORDEN"]).trim();
                        const tipo = String(row["TIPO ORIGINAL"] || row["tipo_original"]).trim().toUpperCase();
                        return orden && tipo && !pedidosRegistrados.has(`${orden}_${tipo}`);
                    });

                setData([...filteredData, ...mappedFacturados]);
            } else {
                setData(filteredData);
            }
        };

        reader.readAsBinaryString(file);
    };






    // 🔹 Esperar a que `setData()` actualice el estado antes de calcular totales
    useEffect(() => {
        if (data.length > 0) {
            console.log("🟢 Ejecutando cálculo de totales con data:", data);
            calcularTotales(data);
        }
    }, [data]);

    // 🔹 Función corregida `calcularTotales`
    const calcularTotales = (data) => {
        let totalClientes = 0;
        let totalPedidos = 0;
        let totalGeneral = 0;
        const clientesProcesados = new Set();
        const today = new Date();

        const isSameDay = (d1, d2) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        console.log("📊 Iniciando cálculo de totales...");

        data.forEach((row) => {
            console.log("🔍 Registro:", row);

            if (!row["Fecha Lista Surtido"]) {
                console.warn("⚠️ Registro sin 'Fecha Lista Surtido':", row);
                return;
            }

            let fechaSurtido = row["Fecha Lista Surtido"];
            let fechaSurtidoObj = null;

            if (typeof fechaSurtido === "string" && fechaSurtido.includes("/")) {
                const partes = fechaSurtido.split("/");
                fechaSurtidoObj = new Date(partes[2], partes[1] - 1, partes[0]);
            } else if (typeof fechaSurtido === "number") {
                fechaSurtidoObj = new Date((fechaSurtido - 25569) * 86400 * 1000);
            }

            if (!fechaSurtidoObj || isNaN(fechaSurtidoObj.getTime())) {
                console.warn("🚨 Fecha inválida en fila:", row["Fecha Lista Surtido"]);
                return;
            }

            console.log(`📅 Pedido con fecha: ${fechaSurtidoObj.toDateString()}`);

            if (isSameDay(fechaSurtidoObj, today)) {
                let orderTotal = row["Total"] || "0"; // Asegurar que no sea undefined
                orderTotal =
                    parseFloat(orderTotal.toString().replace(/[$,]/g, "")) || 0;

                console.log(`📝 Pedido ${row["NO ORDEN"]} → Total: ${orderTotal}`);

                if (row["Cliente"]) {
                    if (!clientesProcesados.has(row["Cliente"])) {
                        clientesProcesados.add(row["Cliente"]);
                        totalClientes++;
                    }
                    totalPedidos++;
                    totalGeneral += orderTotal;
                }
            }
        });

        console.log("✅ Total Clientes:", totalClientes);
        console.log("✅ Total Pedidos:", totalPedidos);
        console.log("✅ Total General:", totalGeneral);

        setTotalClientes(totalClientes || 0);
        setTotalPedidos(totalPedidos || 0);
        setTotalGeneral(totalGeneral || 0);
    };

    const cleanAddress = (address) => {
        if (!address) return "No disponible"; // Si no hay dirección, devolvemos 'No disponible'

        // Eliminar espacios al principio y al final
        let cleanedAddress = address.trim();

        // Reemplazar múltiples espacios consecutivos por un solo espacio
        cleanedAddress = cleanedAddress.replace(/\s+/g, " ");

        // Eliminar caracteres especiales no deseados (puedes personalizar esta lista)
        cleanedAddress = cleanedAddress.replace(/[^\w\s,.-]/g, "");

        return cleanedAddress;
    };

    const addRoute = () => {
        if (newRoute.trim() === "") {
            alert("⚠️ El nombre de la ruta no puede estar vacío.");
            return;
        }

        if (groupedData[newRoute]) {
            alert("⚠️ Esta ruta ya existe.");
            return;
        }

        // Agregar la nueva ruta al estado groupedData
        setGroupedData((prevGroupedData) => ({
            ...prevGroupedData,
            [newRoute]: { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0, rows: [] },
        }));

        // ✅ Agregar la ruta a las opciones del Autocomplete
        setOptions((prevOptions) => [...prevOptions, newRoute]);

        // Limpiar el campo de entrada después de agregar la ruta
        setNewRoute("");
    };

    const assignToRoute = (item, newRoute) => {
        setGroupedData((prev) => {
            let oldRoute = null;

            // 🔍 Buscar en qué ruta está actualmente el pedido
            for (const route in prev) {
                if (
                    prev[route].rows.some((row) => row["NO ORDEN"] === item["NO ORDEN"])
                ) {
                    oldRoute = route;
                    break;
                }
            }

            // 🔥 Si el pedido ya está en la nueva ruta, no hacemos nada
            if (oldRoute === newRoute) {
                console.log(
                    `⚠ Pedido ${item["NO ORDEN"]} ya está en la ruta ${newRoute}, no se hace nada.`
                );
                return prev;
            }

            // Crear una copia del estado actual de rutas
            const updatedGroupedData = { ...prev };

            // ⚡ 1. Eliminar el pedido de la ruta actual (oldRoute) si existe
            if (oldRoute && updatedGroupedData[oldRoute]) {
                updatedGroupedData[oldRoute].rows = updatedGroupedData[
                    oldRoute
                ].rows.filter((row) => row["NO ORDEN"] !== item["NO ORDEN"]);
                updatedGroupedData[oldRoute].TOTAL = Math.max(
                    updatedGroupedData[oldRoute].TOTAL - item.TOTAL,
                    0
                );
                updatedGroupedData[oldRoute].PARTIDAS = Math.max(
                    updatedGroupedData[oldRoute].PARTIDAS - item.PARTIDAS,
                    0
                );
                updatedGroupedData[oldRoute].PIEZAS = Math.max(
                    updatedGroupedData[oldRoute].PIEZAS - item.PIEZAS,
                    0
                );
            }

            // ⚡ 2. Si la nueva ruta no existe, crearla
            if (!updatedGroupedData[newRoute]) {
                updatedGroupedData[newRoute] = {
                    TOTAL: 0,
                    PARTIDAS: 0,
                    PIEZAS: 0,
                    rows: [],
                };
            }

            // ⚡ 3. Eliminar el pedido de la nueva ruta antes de agregarlo (evita que se duplique)
            updatedGroupedData[newRoute].rows = updatedGroupedData[
                newRoute
            ].rows.filter((row) => row["NO ORDEN"] !== item["NO ORDEN"]);

            // 🚀 **Conservar observaciones**
            const observacionGuardada =
                observacionesPorRegistro[item["NUM. CLIENTE"]] || "Sin observaciones";
            const observacionActual = item.OBSERVACIONES || observacionGuardada;

            // ⚡ 4. Agregar el pedido a la nueva ruta, asegurando que conserve las observaciones
            updatedGroupedData[newRoute].rows.push({
                ...item,
                OBSERVACIONES: observacionActual,
            });
            updatedGroupedData[newRoute].TOTAL += item.TOTAL;
            updatedGroupedData[newRoute].PARTIDAS += item.PARTIDAS;
            updatedGroupedData[newRoute].PIEZAS += item.PIEZAS;

            console.log(
                `✅ Pedido ${item["NO ORDEN"]} movido de ${oldRoute || "Ninguna"
                } a ${newRoute}`
            );

            // ⚡ 5. Guardar cambios en `localStorage`
            localStorage.setItem(
                "transporteGroupedData",
                JSON.stringify(updatedGroupedData)
            );

            // ⚡ **Guardar las observaciones en localStorage**
            const updatedObservaciones = {
                ...observacionesPorRegistro,
                [item["NUM. CLIENTE"]]: observacionActual,
            };
            localStorage.setItem(
                "observacionesPorRegistro",
                JSON.stringify(updatedObservaciones)
            );

            return updatedGroupedData;
        });

        // ⚡ 6. Eliminar el pedido de la lista general si no tenía ruta antes
        setData((prevData) =>
            prevData.filter((row) => row["NO ORDEN"] !== item["NO ORDEN"])
        );
    };

    useEffect(() => {
        if (sentRoutesData.length > 0) {
            const uniqueOrders = new Set();
            const cleanedData = sentRoutesData.filter((routeData) => {
                const claveUnica = `${routeData["NO ORDEN"]}_${routeData["tipo_original"]}`;
                if (!uniqueOrders.has(claveUnica)) {
                    uniqueOrders.add(claveUnica);
                    return true;
                }
                return false;
            });

            setSentRoutesData(cleanedData);
        }
    }, [sentRoutesData]);


    const cleanDuplicatedOrders = () => {
        setGroupedData((prev) => {
            const newGroupedData = {};

            Object.keys(prev).forEach((route) => {
                const ordersSet = new Set();
                newGroupedData[route] = {
                    ...prev[route],
                    rows: prev[route].rows.filter((row) => {
                        if (!ordersSet.has(row["NO ORDEN"])) {
                            ordersSet.add(row["NO ORDEN"]);
                            return true;
                        }
                        return false;
                    }),
                };
            });

            return newGroupedData;
        });

        console.log("🚀 Se eliminaron pedidos duplicados en las rutas.");
    };

    useEffect(() => {
        cleanDuplicatedOrders();
    }, []);

    useEffect(() => {
        let clientesSet = new Set();
        let pedidosSet = new Set();
        let totalGeneral = 0;

        // Recuperar valores previos de localStorage si existen
        const prevClientes =
            JSON.parse(localStorage.getItem("totalClientes")) || [];
        const prevPedidos = JSON.parse(localStorage.getItem("totalPedidos")) || [];
        const prevTotalGeneral =
            JSON.parse(localStorage.getItem("totalGeneral")) || 0;

        // Convertimos prevClientes y prevPedidos en Sets para evitar duplicados
        let clientesAcumulados = new Set(prevClientes);
        let pedidosAcumulados = new Set(prevPedidos);
        let totalAcumulado = prevTotalGeneral;

        Object.keys(groupedData).forEach((route) => {
            const routeData = groupedData[route];

            if (routeData && Array.isArray(routeData.rows)) {
                routeData.rows.forEach((row) => {
                    let clienteKey = Object.keys(row).find((key) =>
                        key.toLowerCase().includes("cliente")
                    );

                    if (
                        clienteKey &&
                        row[clienteKey] !== undefined &&
                        row[clienteKey] !== null
                    ) {
                        clientesAcumulados.add(row[clienteKey]); // Acumular clientes únicos
                    }

                    if (row["NO ORDEN"] !== undefined && row["NO ORDEN"] !== null) {
                        pedidosAcumulados.add(row["NO ORDEN"]); // Acumular pedidos únicos
                    }

                    if (row.TOTAL && !isNaN(row.TOTAL)) {
                        totalGeneral += Number(row.TOTAL); // Sumar solo los nuevos valores
                    }
                });
            }
        });

        // ✅ Asegurar que el total no disminuya
        totalAcumulado = Math.max(totalAcumulado, prevTotalGeneral + totalGeneral);

        // Guardar en localStorage
        localStorage.setItem(
            "totalClientes",
            JSON.stringify([...clientesAcumulados])
        );
        localStorage.setItem(
            "totalPedidos",
            JSON.stringify([...pedidosAcumulados])
        );
        localStorage.setItem("totalGeneral", JSON.stringify(totalAcumulado));

        // Actualizar los estados con valores acumulados
        setTotalClientes(clientesAcumulados.size);
        setTotalPedidos(pedidosAcumulados.size);
        setTotalGeneral(totalAcumulado);
    }, [groupedData]);

    const handleShowTotal = () => {
        setTotalsModalOpen(true);
    };

    const calculateTotalClientes = (rutasSeleccionadas) => {
        const clientesSet = new Set();

        rutasSeleccionadas.forEach((route) => {
            const routeData = groupedData[route];
            if (routeData && routeData.rows) {
                routeData.rows.forEach((row) => {
                    if (row["NUM CLIENTE"]) {
                        clientesSet.add(row["NUM CLIENTE"]);
                    }
                });
            }
        });

        return clientesSet.size;
    };

    const calculateTotalPedidos = (rutasSeleccionadas) => {
        const pedidosSet = new Set();

        rutasSeleccionadas.forEach((route) => {
            const routeData = groupedData[route];
            if (routeData && routeData.rows) {
                routeData.rows.forEach((row) => {
                    if (row["NO ORDEN"]) {
                        pedidosSet.add(row["NO ORDEN"]); // Usamos el número de orden para contar pedidos únicos
                    }
                });
            }
        });

        return pedidosSet.size;
    };

    const calculateTotalGeneral = (rutasSeleccionadas) => {
        let totalGeneral = 0;

        rutasSeleccionadas.forEach((route) => {
            const routeData = groupedData[route];
            if (routeData && routeData.rows) {
                routeData.rows.forEach((row) => {
                    if (row.TOTAL && !isNaN(row.TOTAL)) {
                        totalGeneral += row.TOTAL;
                    }
                });
            }
        });

        return totalGeneral;
    };

    const renameRoute = (oldRouteName, newRouteName) => {
        if (!newRouteName.trim()) {
            alert("⚠️ El nombre de la ruta no puede estar vacío.");
            return;
        }

        setGroupedData((prev) => {
            // Si la ruta original no existe, no hacer nada
            if (!prev[oldRouteName]) {
                alert("⚠️ La ruta original no existe.");
                return prev;
            }

            // Si la nueva ruta ya existe, evita la sobrescritura
            if (prev[newRouteName]) {
                alert("⚠️ Ya existe una ruta con ese nombre. Elige otro.");
                return prev;
            }

            // Crear una nueva clave con el nuevo nombre, copiando los datos de la anterior
            const updatedData = { ...prev, [newRouteName]: prev[oldRouteName] };

            // Eliminar la ruta antigua SOLO después de asegurarnos de que la nueva existe
            delete updatedData[oldRouteName];

            // Guardar cambios en localStorage para persistencia
            localStorage.setItem(
                "transporteGroupedData",
                JSON.stringify(updatedData)
            );

            console.log(
                `✅ Ruta renombrada de '${oldRouteName}' a '${newRouteName}' sin perder datos.`
            );
            return updatedData;
        });

        // Cerrar edición después de renombrar
        setEditingRoute(null);
    };

    const [editingRoute, setEditingRoute] = useState(null);
    const [newRouteName, setNewRouteName] = useState("");

    const openModal = (route) => {
        setSelectedRoute(route);
        setModalOpen(true);

        const firstRow = groupedData[route]?.rows?.[0];
        if (firstRow) {
            fetchObservacionPorRegistro(firstRow["NUM. CLIENTE"]); // ✅ Corrección
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRoute(null);
        setObservaciones(""); // Limpiar observaciones
    };

    const calculateTotals = (route) => {
        const routeData = groupedData[route] || { rows: [] };
        return routeData.rows.reduce(
            (totals, row) => {
                totals.TOTAL += row.TOTAL;
                totals.PARTIDAS += row.PARTIDAS;
                totals.PIEZAS += row.PIEZAS;
                return totals;
            },
            { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0 }
        );
    };

    const removeFromRoute = (item, route) => {
        setGroupedData((prev) => {
            const updatedRoute = { ...prev[route] };
            updatedRoute.rows = updatedRoute.rows.filter((row) => row !== item);
            updatedRoute.TOTAL -= item.TOTAL;
            updatedRoute.PARTIDAS -= item.PARTIDAS;
            updatedRoute.PIEZAS -= item.PIEZAS;

            return { ...prev, [route]: updatedRoute };
        });

        // Devolver el registro a la tabla principal
        setData((prevData) => [...prevData, item]);
    };

    const clearLocalStorage = () => {
        localStorage.removeItem("transporteTimestamp");
        setData([]);
        handleSnackbarOpen(
            "Datos eliminados correctamente. Carga un nuevo archivo Excel para comenzar."
        );
    };

    const fetchPaqueteriaRoutes = async ({
        filtro = "",
        desde = "",
        hasta = "",
        mes = "",
    } = {}) => {
        try {
            let url = `http://localhost:3007/api/Ventas/rutas?expandir=true`;

            if (filtro) url += `&guia=${filtro}`;
            if (desde && hasta) url += `&desde=${desde}&hasta=${hasta}`;
            if (mes) url += `&mes=${mes}`;

            const response = await fetch(url);
            const data = await response.json();

            if (Array.isArray(data)) {
                setSentRoutesData(data); // Aquí actualizas la tabla
            }
        } catch (error) {
            console.error("Error al obtener rutas:", error);
        }
    };

    useEffect(() => {
        if (!Array.isArray(sentRoutesData) || sentRoutesData.length === 0) {
            console.warn(
                "⚠ No hay datos en sentRoutesData, las tablas estarán vacías"
            );
            return;
        }

        const getTipo = (routeData) =>
            (routeData.TIPO || routeData.tipo_original || "").trim().toLowerCase();

        const paqueteria = sentRoutesData.filter(
            (routeData) => getTipo(routeData) === "paqueteria"
        );
        const directa = sentRoutesData.filter(
            (routeData) => getTipo(routeData) === "directa"
        );
        const ventaEmpleado = sentRoutesData.filter(
            (routeData) => getTipo(routeData) === "venta empleado"
        );

        setPaqueteriaData(paqueteria);
        setDirectaData(directa);
        setVentaEmpleadoData(ventaEmpleado);
    }, [sentRoutesData]);


    useEffect(() => {
        console.log("🔄 Cambio de pestaña activa:", subTabIndex);
    }, [subTabIndex]);

    const fetchAdditionalData = async (noOrden) => {
        try {
            const url = `http://localhost:3007/api/Ventas/pedido/detalles/${noOrden}`; // Usamos el parámetro en la URL
            const response = await fetch(url);
            const data = await response.json();

            return {
                ultimaFechaEmbarque: data.ultimaFechaEmbarque,
                totalCajas: data.totalCajas,
            };
        } catch (error) {
            console.error("Error al obtener los datos adicionales:", error.message);
            return {};
        }
    };

    const handleSnackbarOpen = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const fetchObservacionPorRegistro = async () => {
        const clientesUnicos = [
            ...new Set(sentRoutesData.map((route) => route["NUM. CLIENTE"])), // Extraer los clientes únicos
        ];

        if (clientesUnicos.length === 0) return;

        try {
            const response = await axios.post(
                "http://localhost:3007/api/Ventas/clientes/observaciones",
                { clientes: clientesUnicos }
            );

            const observaciones = response.data;

            // Actualizar la tabla con las observaciones recibidas
            const updatedRoutes = sentRoutesData.map((route) => ({
                ...route,
                OBSERVACIONES:
                    observaciones[route["NUM. CLIENTE"]] || "Sin observaciones",
            }));

            setSentRoutesData(updatedRoutes); // Actualiza el estado
        } catch (error) {
            console.error("Error al obtener observaciones:", error);
        }
    };

    const handleSelectRoute = (route) => {
        setSelectedRoutes((prevRoutes) => {
            const newSelectedRoutes = prevRoutes.includes(route)
                ? prevRoutes.filter((r) => r !== route) // Desmarcar ruta
                : [...prevRoutes, route]; // Marcar ruta

            // Recalcular los totales incluyendo todas las rutas
            let totalClientes = 0;
            let totalPedidos = 0;
            let totalGeneral = 0;

            // Aquí recorremos todas las rutas, no solo las seleccionadas
            Object.keys(groupedData).forEach((routeKey) => {
                const routeData = groupedData[routeKey];
                if (routeData) {
                    totalClientes += routeData.rows.length;
                    totalPedidos += routeData.rows.reduce(
                        (sum, row) => sum + (row.PARTIDAS || 0),
                        0
                    );
                    totalGeneral += routeData.rows.reduce(
                        (sum, row) => sum + (row.TOTAL || 0),
                        0
                    );
                }
            });

            // Actualiza los totales basados en todas las rutas, no solo las seleccionadas
            setTotalClientes(totalClientes);
            setTotalPedidos(totalPedidos);
            setTotalGeneral(totalGeneral);

            return newSelectedRoutes;
        });
    };

    const handleSendRoutes = async () => {
        if (selectedRoutes.length > 0) {
            const newSentRoutesData = [];

            selectedRoutes.forEach((route) => {
                const routeData = groupedData[route];

                if (routeData && routeData.rows) {
                    routeData.rows.forEach((row) => {
                        let tipoRutaActual = row.TIPO
                            ? row.TIPO.toLowerCase()
                            : tipoRuta.toLowerCase();

                        let guiaEnviar = row.GUIA || "";

                        if (
                            tipoRutaActual === "directa" ||
                            tipoRutaActual === "venta empleado"
                        ) {
                            guiaEnviar = "NA";
                        }

                        newSentRoutesData.push({
                            ...row, // Mantener todos los detalles de la fila
                            routeName: route, // Mantener el nombre de la ruta
                            OBSERVACIONES:
                                row.OBSERVACIONES ||
                                observacionesPorRegistro[row["NUM. CLIENTE"]] ||
                                "Sin observaciones disponibles",
                            TIPO: tipoRutaActual, // ✅ Asegurar que se inserta el tipo correcto
                            GUIA: guiaEnviar, // ✅ Asignar "NA" si es Directa o Venta Empleado
                            tipo_original: row["TIPO ORIGINAL"] || row.tipo || row.TIPO || row.tipo_original || null,
                        });
                    });
                } else {
                    console.warn(`⚠ Ruta ${route} no tiene datos o filas definidas.`);
                }
            });

            try {
                const response = await fetch(
                    "http://localhost:3007/api/Ventas/insertarRutas",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ rutas: newSentRoutesData }),
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    handleSnackbarOpen("Rutas enviadas con éxito y registradas.");

                    setSentRoutesData((prevData) => [...prevData, ...newSentRoutesData]);

                    setGroupedData((prevData) => {
                        const newGroupedData = { ...prevData };
                        selectedRoutes.forEach((route) => {
                            delete newGroupedData[route];
                        });
                        return newGroupedData;
                    });

                    setTotalClientes((prev) => -selectedRoutes.length);
                    setTotalPedidos((prev) => -selectedRoutes.length);
                    setTotalGeneral((prev) => -selectedRoutes.length);
                } else {
                    handleSnackbarOpen("⚠ Hubo un error al registrar las rutas.");
                }
            } catch (error) {
                console.error("❌ Error al enviar las rutas:", error);
                handleSnackbarOpen("Error al enviar las rutas.");
            }

            setConfirmSendModalOpen(false);
        } else {
            handleSnackbarOpen("⚠ Por favor, selecciona al menos una ruta.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Sin fecha";

        // Si ya viene en formato YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split("-");
            return `${day}/${month}/${year}`;
        }

        // Si no viene en ese formato, usar Date como respaldo
        const date = new Date(dateString);
        if (isNaN(date)) return "Fecha inválida";

        return date.toLocaleDateString("es-MX");
    };

    const handleGenerateRoutes = () => {
        if (!tipoRuta) {
            handleSnackbarOpen(
                "Por favor, selecciona un tipo de ruta antes de mandar."
            );
            return;
        }

        if (selectedRoutes.length > 0) {
            setConfirmSendModalOpen(true);

            // Verifica que hay datos en las rutas seleccionadas
            const rutasConDatos = selectedRoutes.filter(
                (route) => groupedData[route]?.rows?.length > 0
            );

            if (rutasConDatos.length > 0) {
                const totalClientes = calculateTotalClientes(rutasConDatos);
                const totalPedidos = calculateTotalPedidos(rutasConDatos);
                const totalGeneral = calculateTotalGeneral(rutasConDatos);

                // Actualizamos los estados para mostrar los datos en el modal
                setTotalClientes(totalClientes);
                setTotalPedidos(totalPedidos);
                setTotalGeneral(totalGeneral);
            } else {
                handleSnackbarOpen("Las rutas seleccionadas no tienen datos.");
            }
        } else {
            handleSnackbarOpen("Por favor, selecciona al menos una ruta.");
        }
    };

    const handleProrateoFacturaLTChange = (e) => {
        const value = parseFloat(e.target.value) || 0; // Convertir a número
        setProrateoFacturaLT(value); // Actualiza el valor en el estado
    };

    const actualizarGuia = async () => {
        if (!selectedNoOrden || !guia) {
            console.error("❌ Error: Faltan datos para actualizar.");
            alert("Error: Falta la guía o el número de orden.");
            return;
        }

        // ✅ Aquí obtenemos el tipo_original real desde sentRoutesData
        const tipo_original_actual =
            sentRoutesData.find(
                (r) => String(r["NO ORDEN"]).trim() === String(selectedNoOrden).trim()
            )?.tipo_original || null;

        try {
            const url = `http://localhost:3007/api/Ventas/paqueteria/actualizar-guia/${selectedNoOrden}`;

            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guia,
                    paqueteria,
                    transporte: paqueteria,
                    fechaEntregaCliente,
                    diasEntrega,
                    entregaSatisfactoria,
                    motivo,
                    totalFacturaLT,
                    prorateoFacturaLT,
                    prorateoFacturaPaqueteria,
                    gastosExtras,
                    sumaFlete,
                    porcentajeEnvio,
                    porcentajePaqueteria,
                    sumaGastosExtras,
                    porcentajeGlobal,
                    diferencia,
                    noFactura,
                    fechaFactura,
                    tarimas,
                    numeroFacturaLT,
                    observaciones,
                    tipo,
                    tipo_original_actual, // ✅ se manda correctamente desde sentRoutesData
                }),
            });

            if (response.ok) {
                alert("✅ Información actualizada correctamente.");

                // Cerrar el modal después de la actualización
                setDirectaModalOpen(false);

                // Refrescar los datos
                const mesActual =
                    selectedMonth || localStorage.getItem("mesSeleccionado") || "";
                fetchPaqueteriaRoutes({ mes: mesActual });
            } else {
                const errorData = await response.json();
                console.error("❌ Error al actualizar:", errorData);
                alert("❌ Error al actualizar la guía: " + errorData.message);
            }
        } catch (error) {
            console.error("❌ Error en la actualización:", error);
            alert("❌ Error en la actualización de la guía.");
        }
    };

    const getVisibleColumns = (role) => {
        // Definir todas las columnas posibles
        const allColumns = [
            {
                name: "NO ORDEN",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Paquet",
                    "Control",
                    "Rep",
                    "Tran",
                    "Rep",
                    "Embar",
                ],
            },
            {
                name: "ESTADO",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Paquet",
                    "Embar",
                    "Control",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "FECHA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Paquet",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "NUM CLIENTE",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Paquet",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "NOMBRE DEL CLIENTE",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Control",
                    "Paquet",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "MUNICIPIO",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Paquet",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "ESTADO",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "EB1",
                    "Paquet",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "OBSERVACIONES",
                role: ["Admin", "Master", "Trans", "PQ1", "Rep", "Tran", "Rep"],
            },
            {
                name: "TOTAL",
                role: ["Admin", "Master", "Trans", "Rep", "PQ1", "Tran", "Rep"],
            },
            {
                name: "PARTIDAS",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "Control",
                    "Embar",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "PIEZAS",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "Control",
                    "Embar",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "ZONA",
                role: ["Admin", "Master", "Rep", "Trans", "Tran", "Rep"],
            },
            {
                name: "TIPO DE ZONA",
                role: ["Admin", "Master", "Rep", "Trans", "Tran", "Rep"],
            },
            {
                name: "NUMERO DE FACTURA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "Control",
                    "Tran",
                    "Rep",
                    "Embar",
                ],
            },
            {
                name: "FECHA DE FACTURA",
                role: ["Admin", "Master", "Trans", "Rep", "Control", "Tran", "Rep"],
            },
            {
                name: "FECHA DE EMBARQUE",
                role: ["Admin", "Master", "Rep", "Trans", "Tran", "Rep"],
            },
            {
                name: "DIA EN QUE ESTA EN RUTA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "EB1",
                    "Embar",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "HORA DE SALIDA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "EB1",
                    "Embar",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "CAJAS",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "PQ1",
                    "Paquet",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "TARIMAS",
                role: ["Admin", "Master", "Trans", "Rep", "Paquet", "Tran", "Rep"],
            },
            {
                name: "TRANSPORTE",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "PQ1",
                    "Paquet",
                    "Control",
                    "Tran",
                    "Rep",
                    "Embar",
                ],
            },
            {
                name: "PAQUETERIA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "PQ1",
                    "Paquet",
                    "Control",
                    "Tran",
                    "Rep",
                    "Embar",
                ],
            },
            {
                name: "GUIA",
                role: [
                    "Admin",
                    "Master",
                    "Rep",
                    "Trans",
                    "PQ1",
                    "Paquet",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "FECHA DE ENTREGA (CLIENTE)",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Rep",
                    "PQ1",
                    "Paquet",
                    "Embar",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "FECHA ESTIMADA DE ENTREGA",
                role: ["Admin", "Master", "Trans", "PQ1", "Rep", "Tran", "Rep"],
            },
            {
                name: "DIAS DE ENTREGA",
                role: ["Admin", "Master", "Trans", "PQ1", "Rep", "Tran", "Rep"],
            },
            {
                name: "ENTREGA SATISFACTORIA O NO SATISFACTORIA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "PQ1",
                    "Paquet",
                    "Rep",
                    "Tran",
                    "Rep",
                    "Embar",
                ],
            },
            { name: "MOTIVO", role: ["Admin", "Master", "Trans", "Tran", "Rep"] },
            {
                name: "NUMERO DE FACTURA LT",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "TOTAL FACTURA LT",
                role: ["Admin", "Master", "Trans", "Paquet", "Rep", "Tran", "Rep"],
            },
            {
                name: "PRORRATEO $ FACTURA LT",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "PRORRATEO $ FACTURA PAQUETERIA",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "GASTOS EXTRAS",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "SUMA FLETE",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "% ENVIO",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "% PAQUETERIA",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "SUMA GASTOS EXTRAS",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "% GLOBAL",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "DIFERENCIA",
                role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep"],
            },
            {
                name: "Acciones",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Control",
                    "PQ1",
                    "Paquet",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "TRANSPORTISTA",
                role: [
                    "Admin",
                    "Master",
                    "Trans",
                    "Control",
                    "Embar",
                    "Rep",
                    "Tran",
                    "Rep",
                ],
            },
            {
                name: "EMPRESA",
                role: ["Admin", "Master", "Trans", "Control", "Rep", "Tran", "Rep"],
            },
            {
                name: "CLAVE",
                role: ["Admin", "Master", "Trans", "Control", "Rep", "Tran", "Rep"],
            },
            {
                name: "ACCIONES",
                role: ["Admin", "Master", "Trans", "Control", "Rep", "Tran", "Rep"],
            },
            {
                name: "REG_ENTRADA",
                role: ["Admin", "Master", "Trans", "Control", "Rep", "Tran", "Rep"],
            },
        ];

        return allColumns
            .filter((col) => col.role.includes(role))
            .map((col) => col.name);
    };

    const visibleColumns = getVisibleColumns(user?.role);

    const [createdAt, setCreatedAt] = useState(null);

    const handleGenerateExcel = () => {
        if (!sentRoutesData || sentRoutesData.length === 0) {
            console.error("❌ No hay datos en `sentRoutesData`.");
            alert("Error: No hay datos disponibles para exportar.");
            return;
        }

        // 🔹 Obtener la fecha actual respetando la zona horaria del usuario (Formato YYYY-MM-DD)
        const today = new Date().toLocaleDateString("fr-CA"); // "YYYY-MM-DD"

        console.log("📅 Fecha de referencia para el filtrado:", today);

        // 🔹 Filtrar solo las rutas con tipo "Directa" y cuya fecha de creación (`created_at`) sea hoy
        const filteredData = sentRoutesData.filter((row) => {
            if (!row.created_at) {
                console.warn("⚠ Registro sin `created_at` encontrado:", row);
                return false;
            }

            // Convertir created_at a formato YYYY-MM-DD
            const rowDate = new Date(row.created_at).toLocaleDateString("fr-CA");

            console.log(`🔍 Comparando: ${rowDate} === ${today}`);

            return row["TIPO"]?.toLowerCase?.() === "directa" && rowDate === today;
        });

        if (filteredData.length === 0) {
            alert(`No hay datos de tipo 'Directa' registrados en la fecha ${today}.`);
            return;
        }

        console.log("✅ Datos filtrados:", filteredData);

        const groupedData = {};

        // 🔹 Agrupar los datos por cliente
        filteredData.forEach((row) => {
            const clientId = row["NUM. CLIENTE"];

            if (!groupedData[clientId]) {
                groupedData[clientId] = {
                    clientName: row["NOMBRE DEL CLIENTE"],
                    referenceIds: [row["NO ORDEN"]],
                    contactInfo: {
                        phone: row["TELEFONO"] || "",
                        email: row["CORREO"] || "",
                    },
                    transporte: row["TRANSPORTE"] || "No disponible",
                    orders: [],
                };
            } else {
                groupedData[clientId].referenceIds.push(row["NO ORDEN"]);
            }

            groupedData[clientId].contactInfo.address =
                row["DIRECCION"] || "Dirección no disponible";
            groupedData[clientId].orders.push(row);
        });

        // 🔹 Preparar los datos para exportación
        let exportData = Object.keys(groupedData).map((clientId) => {
            const clientData = groupedData[clientId];

            return {
                "Nombre Vehiculo": clientData.transporte,
                "Titulo de la Visita": clientData.clientName,
                Dirección: clientData.contactInfo.address,
                Latitud: "",
                Longitud: "",
                "ID Referencia": clientData.orders
                    .map((order) => order["NO ORDEN"])
                    .join(", "),
                "Persona de contacto": "",
                Telefono: clientData.contactInfo.phone,
                Correo: clientData.contactInfo.email,
            };
        });

        // 🔹 Ordenar los datos por "Nombre Vehículo" y "Titulo de la Visita"
        exportData.sort((a, b) => {
            if (a["Nombre Vehiculo"] < b["Nombre Vehiculo"]) return -1;
            if (a["Nombre Vehiculo"] > b["Nombre Vehiculo"]) return 1;
            if (a["Titulo de la Visita"] < b["Titulo de la Visita"]) return -1;
            if (a["Titulo de la Visita"] > b["Titulo de la Visita"]) return 1;
            return 0;
        });

        console.log("📂 Datos listos para exportar:", exportData);

        // 🔹 Crear hoja de Excel
        const ws = XLSX.utils.json_to_sheet(exportData, {
            header: [
                "Nombre Vehiculo",
                "Titulo de la Visita",
                "Dirección",
                "Latitud",
                "Longitud",
                "ID Referencia",
                "Persona de contacto",
                "Telefono",
                "Correo",
            ],
        });

        // 🔹 Ajustar el ancho de columnas para mejor visibilidad
        ws["!cols"] = [
            { wch: 20 },
            { wch: 40 },
            { wch: 50 },
            { wch: 10 },
            { wch: 10 },
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
        ];

        // 🔹 Crear libro de Excel y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Datos_Directa_${today}`);

        // 🔹 Descargar el archivo
        XLSX.writeFile(wb, `Datos_Directa_${today}.xlsx`);

        console.log("✅ Archivo Excel generado correctamente.");
    };

    // ✅ Versión con tabla de IMPORTE AGREGADA al final (corregida)

    const totalPagesExp = "___total_pages___";

    function addPageNumber(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        if (pageCount >= 1) {
            doc.setPage(1);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(`PÁGINA 1 de ${pageCount}`, 200, 59, { align: "right" });
        }

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageHeight = doc.internal.pageSize.height;
            doc.addImage(barraFooter, "JPEG", 10, pageHeight - 15, 190, 8);
        }
    }

    function verificarEspacio(doc, currentY, filas = 10, margenInferior = 20) {
        const pageHeight = doc.internal.pageSize.height;
        const alturaEstim = 10 + filas * 6;
        if (currentY + alturaEstim > pageHeight - margenInferior) {
            doc.addPage();
            return 20;
        }
        return currentY;
    }

    const generatePDF = async (pedido) => {
        try {
            const responseRoutes = await fetch(
                "http://localhost:3007/api/Ventas/ruta-unica"
            );
            const routesData = await responseRoutes.json();
            const route = routesData.find(
                (r) => String(r["NO ORDEN"]) === String(pedido)
            );
            if (!route) return alert("No se encontró la ruta");

            const responseEmbarque = await fetch(
                `http://localhost:3007/api/Ventas/embarque/${pedido}`
            );
            const data = await responseEmbarque.json();
            if (!data || !Array.isArray(data) || data.length === 0)
                return alert("No hay productos");

            const doc = new jsPDF();
            const marginLeft = 10;
            let currentY = 26;

            doc.setFillColor(240, 36, 44);
            doc.rect(10, 10, 190, 8, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.text("FORMATO PARA RECEPCIÓN DEL PEDIDO", 105, 15.5, {
                align: "center",
            });

            doc.addImage(logo, "JPEG", 145, 23, 50, 18);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(84, 84, 84);
            doc.text("Santul Herramientas S.A. de C.V.", marginLeft, currentY);
            currentY += 4;
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(
                "Henry Ford 257 C y D, Col. Bondojito, Gustavo A. Madero,",
                marginLeft,
                currentY
            );
            currentY += 4;
            doc.text("Ciudad de México, C.P. 07850, México,", marginLeft, currentY);
            currentY += 4;
            doc.text("Tel.: 58727290", marginLeft, currentY);
            currentY += 4;
            doc.text("R.F.C. SHE130912866", marginLeft, currentY);
            currentY += 5;
            doc.setDrawColor(240, 36, 44);
            doc.setLineWidth(0.5);
            doc.line(10, currentY, 200, currentY);
            currentY += 4;

            const tipo_original = route["tipo_original"] || "No definido";
            const nombreCliente = route["NOMBRE DEL CLIENTE"] || "No disponible";
            const numeroFactura = route["NO_FACTURA"] || "No disponible";
            const direccion = cleanAddress(route["DIRECCION"]) || "No disponible";
            const numero = route["NUM. CLIENTE"] || "No disponible";
            const telefono = route["TELEFONO"] || "Sin número";
            const rawTotal = route["TOTAL"];
            let totalImporte = 0;
            if (
                rawTotal &&
                !isNaN(parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, "")))
            ) {
                totalImporte = parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, ""));
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(0, 0, 0);
            doc.text(
                `CLIENTE NO.: ${numero}                      NOMBRE DEL CLIENTE: ${nombreCliente}`,
                marginLeft,
                currentY
            );
            currentY += 4;
            doc.text(
                `TELÉFONO: ${telefono}     DIRECCIÓN: ${direccion}`,
                marginLeft,
                currentY
            );
            currentY += 4;
            doc.text(`VT: ${pedido}-${tipo_original}`, marginLeft, currentY);
            currentY += 4;
            doc.text(`FACTURA No.: ${numeroFactura}`, marginLeft, currentY);
            currentY += 4;

            const infoY = currentY;
            doc.setFillColor(255, 255, 0);
            doc.rect(marginLeft, infoY, 190, 11, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(0, 0, 0);
            doc.text("INFORMACIÓN IMPORTANTE", 105, infoY + 4, { align: "center" });
            doc.setFontSize(5.3);
            doc.text(
                "En caso de detectar cualquier irregularidad (daños, faltantes, o manipulaciones), Favor de comunicarse de inmediato al departamento de atención al cliente al número:(55) 58727290 EXT.: (8815, 8819)",
                105,
                infoY + 9,
                { align: "center", maxWidth: 180 }
            );
            currentY = infoY + 15;

            const productosConCaja = data.filter((i) => i.caja && i.caja > 0);
            const productosSinCaja = data.filter((i) => !i.caja || i.caja === 0);

            // ✔️ Primero agrupamos productos por caja original

            const cajasAgrupadasOriginal = productosConCaja.reduce((acc, item) => {
                if (!acc[item.caja]) acc[item.caja] = [];
                acc[item.caja].push(item);
                return acc;
            }, {});

            const cajasOrdenadas = Object.entries(cajasAgrupadasOriginal).sort(
                (a, b) => Number(a[0]) - Number(b[0])
            );

            const totalINNER_MASTER = productosSinCaja.reduce(
                (s, i) => s + (i._inner || 0) + (i._master || 0),
                0
            );
            const totalCajasArmadas = cajasOrdenadas.length;
            const totalCajas = totalINNER_MASTER + totalCajasArmadas;

            const totalTarimas = data.reduce((s, i) => s + (i.tarimas || 0), 0);
            const totalAtados = data.reduce((s, i) => s + (i.atados || 0), 0);

            currentY = verificarEspacio(doc, currentY, 2);
            doc.autoTable({
                startY: currentY,
                head: [
                    ["INNER/MASTER", "TARIMAS", "ATADOS", "CAJAS ARMADAS", "TOTAL CAJAS"],
                ],
                body: [
                    [
                        totalINNER_MASTER,
                        totalTarimas,
                        totalAtados,
                        totalCajasArmadas,
                        totalCajas,
                    ],
                ],
                theme: "grid",
                margin: { left: 10 },
                tableWidth: 190,
                styles: { fontSize: 9, halign: "center", cellPadding: 3 },
                headStyles: { fillColor: [210, 210, 210], textColor: [0, 0, 0] },
            });
            currentY = doc.lastAutoTable.finalY + 4;

            const cajasAgrupadas = productosConCaja.reduce((acc, item) => {
                if (!acc[item.caja]) acc[item.caja] = [];
                acc[item.caja].push(item);
                return acc;
            }, {});

            let numeroCajaSecuencial = 1;

            for (const [, productos] of cajasOrdenadas) {
                const titulo = `Productos en la Caja ${numeroCajaSecuencial}`;

                // Título de la tabla
                doc.autoTable({
                    startY: currentY,
                    head: [[titulo]],
                    body: [],
                    theme: "grid",
                    styles: { halign: "center", fontSize: 9 },
                    headStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [0, 0, 0],
                        fontStyle: "bold",
                    },
                    margin: { left: 10 },
                    tableWidth: 190,
                });

                currentY = doc.lastAutoTable.finalY;

                let yaContinua = false;

                doc.autoTable({
                    startY: currentY,
                    head: [
                        [
                            "SKU",
                            "DESCRIPCIÓN",
                            "CANTIDAD",
                            "UM",
                            "PZ",
                            "PQ",
                            "INNER",
                            "MASTER",
                            "TARIMA",
                            "ATADOS",
                            "VALIDA",
                        ],
                    ],
                    body: productos.map((item) => [
                        item.codigo_ped || "",
                        item.des || "",
                        item.cantidad || "",
                        item.um || "",
                        item._pz || 0,
                        item._pq || 0,
                        item._inner || 0,
                        item._master || 0,
                        item.tarimas || 0,
                        item.atados || 0,
                        "",
                    ]),
                    theme: "grid",
                    margin: { left: 10 },
                    tableWidth: 190,
                    styles: {
                        fontSize: 5.5,
                        halign: "center",
                        cellPadding: 2,
                        lineColor: [200, 200, 200],
                        lineWidth: 0.1,
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 70 },
                        2: { cellWidth: 15 },
                        3: { cellWidth: 10 },
                        4: { cellWidth: 10 },
                        5: { cellWidth: 10 },
                        6: { cellWidth: 12 },
                        7: { cellWidth: 12 },
                        8: { cellWidth: 12 },
                        9: { cellWidth: 12 },
                        10: { cellWidth: 12 },
                    },
                    headStyles: {
                        fillColor: [20, 20, 20],
                        textColor: [255, 255, 255],
                        fontSize: 5.5,
                    },
                    didDrawCell: function (data) {
                        if (
                            data.row.index === 0 &&
                            data.section === "body" &&
                            data.cursor.y < 30 && // Está en una nueva página
                            !yaContinua
                        ) {
                            const text = `Continuación de la Caja ${numeroCajaSecuencial}`;
                            doc.setFontSize(8);
                            doc.text(text, 105, data.cursor.y - 6, { align: "center" });
                            yaContinua = true;
                        }
                    },
                });

                currentY = doc.lastAutoTable.finalY + 4;
                numeroCajaSecuencial++;
            }

            if (productosSinCaja.length > 0) {
                // Título principal
                currentY = verificarEspacio(doc, currentY, 2);
                doc.autoTable({
                    startY: currentY,
                    head: [["Productos sin caja"]],
                    body: [],
                    theme: "grid",
                    styles: { halign: "center", fontSize: 9 },
                    margin: { left: 10 },
                    tableWidth: 190,
                    headStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [0, 0, 0],
                        fontStyle: "bold",
                    },
                });
                currentY = doc.lastAutoTable.finalY;

                let yaContinua = false;

                doc.autoTable({
                    startY: currentY,
                    head: [
                        [
                            "SKU",
                            "DESCRIPCIÓN",
                            "CANTIDAD",
                            "UM",
                            "PZ",
                            "INNER",
                            "MASTER",
                            "TARIMAS",
                            "ATADOS",
                            "VALIDAR",
                        ],
                    ],
                    body: productosSinCaja.map((item) => [
                        item.codigo_ped || "",
                        item.des || "",
                        item.cantidad || "",
                        item.um || "",
                        item._pz || 0,
                        item._inner || 0,
                        item._master || 0,
                        item.tarimas || 0,
                        item.atados || 0,
                        "",
                    ]),
                    theme: "grid",
                    margin: { left: 10 },
                    tableWidth: 190,
                    styles: {
                        fontSize: 5.5,
                        halign: "center",
                        cellPadding: 2,
                        lineColor: [200, 200, 200],
                        lineWidth: 0.1,
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 80 },
                        2: { cellWidth: 15 },
                        3: { cellWidth: 10 },
                        4: { cellWidth: 10 },
                        5: { cellWidth: 12 },
                        6: { cellWidth: 12 },
                        7: { cellWidth: 12 },
                        8: { cellWidth: 12 },
                        9: { cellWidth: 12 },
                    },
                    headStyles: {
                        fillColor: [20, 20, 20],
                        textColor: [255, 255, 255],
                        fontSize: 5.5,
                    },
                    didDrawCell: function (data) {
                        if (
                            data.row.index === 0 &&
                            data.section === "body" &&
                            data.cursor.y < 30 &&
                            !yaContinua
                        ) {
                            const text = "Continuación de productos sin caja";
                            doc.setFontSize(8);
                            doc.text(text, 105, data.cursor.y - 6, { align: "center" });
                            yaContinua = true;
                        }
                    },
                });

                currentY = doc.lastAutoTable.finalY + 4;
            }

            currentY = doc.lastAutoTable.finalY + 5;
            currentY = verificarEspacio(doc, currentY, 1);
            const pageWidth = doc.internal.pageSize.getWidth();
            const tableWidth = 90;
            const leftMargin = (pageWidth - tableWidth) / 2;

            doc.autoTable({
                startY: currentY,
                head: [
                    [
                        {
                            content: "DETALLES DEL PEDIDO",
                            colSpan: 2,
                            styles: {
                                halign: "center",
                                fillColor: [230, 230, 230],
                                fontSize: 7,
                            },
                        },
                        {
                            content: pedido,
                            styles: {
                                halign: "center",
                                fillColor: [200, 200, 200],
                                fontSize: 9,
                            },
                        },
                    ],
                    [
                        {
                            content: "IMPORTE DEL PEDIDO\n(SIN IVA)",
                            styles: { halign: "center", fontSize: 5 },
                        },
                        {
                            content: "TOTAL A PAGAR\n(SIN IVA)",
                            styles: { halign: "center", fontSize: 5 },
                        },
                        {
                            content: "PORCENTAJE DE ENTREGA",
                            styles: { halign: "center", fontSize: 5 },
                        },
                    ],
                ],
                body: [
                    [
                        `$${totalImporte.toFixed(2)}`,
                        `$${totalImporte.toFixed(2)}`,
                        "100.00 %",
                    ],
                ],
                theme: "grid",
                styles: { fontSize: 8, halign: "center" },
                margin: { left: leftMargin },
                tableWidth: tableWidth,
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    fontSize: 4.5,
                },
            });

            currentY = doc.lastAutoTable.finalY + 5;
            currentY = verificarEspacio(doc, currentY, 1);
            doc.autoTable({
                startY: currentY,
                body: [
                    [
                        {
                            content:
                                "Se confirma que las cajas, atados y/o tarimas listadas en esta lista de empaque fueron recibidas cerradas y en buen estado, y así serán entregadas al cliente. Cualquier anomalía se atenderá según lo establecido en el contrato",
                            styles: { fontSize: 7, halign: "justify", textColor: [0, 0, 0] },
                        },
                        {
                            content: "Firma del Transportista",
                            styles: { fontSize: 7, halign: "center", fontStyle: "bold" },
                        },
                    ],
                ],
                theme: "grid",
                styles: { cellPadding: 3, valign: "top" },
                columnStyles: {
                    0: { cellWidth: 150 },
                    1: { cellWidth: 40 },
                },
                margin: { left: 10 },
                tableWidth: 190,
            });

            currentY = doc.lastAutoTable.finalY + 0;

            const instrucciones = [
                "•Estimado cliente, nuestro transportista cuenta con ruta asignada por lo que agradeceríamos agilizar el tiempo de recepción de su mercancía, el material viaja consignado por lo que solo podrá entregarse en la dirección estipulada en este documento.",
                "•Cualquier retraso en la recepción generan costos adicionales y pueden afectar la entrega a otros clientes. En casos repetitivos, podrían cancelarse beneficios como descuentos adicionales.",
                "•El transportista solo entregará en planta baja o *nivel de calle*, si cuenta con alguna política especial de recepción, por favor solicita un esquema de entrega con tu Asesor de ventas.",
                "•Si Ud. detecta alguna anomalía en el empaque, embalaje, atado de la mercancía, alguna diferencia vs las cajas embarcadas y/o que el transportista retiene mercancía de forma intencional repórtalo en el apartado de observaciones.",
                "•El transportista no está autorizado a recibir mercancía, todo reporte de devolución, garantía,etc. deberá ser reportado a su asesor de ventas y aplicará de acuerdo a la Política vigente.",
                "•Con la firma y/o sello en el presente documento, se da por recibida a entera conformidad la mercancía descrita y se acepta el monto a pagar aquí indicado.",
            ];

            const instruccionesTexto = instrucciones.join("\n");
            currentY = verificarEspacio(doc, currentY, instrucciones.length);

            doc.autoTable({
                startY: currentY,
                body: [[{ content: instruccionesTexto }]],
                theme: "grid",
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    valign: "top",
                    textColor: [0, 0, 0],
                },
                columnStyles: { 0: { cellWidth: 190 } },
                margin: { left: 10 },
                tableWidth: 190,
            });

            currentY = doc.lastAutoTable.finalY + 0;

            const letras = NumerosALetras(totalImporte);
            const fechaActual = new Date();
            const fechaHoy = fechaActual.toLocaleDateString("es-MX");
            const fechaVence = new Date(
                fechaActual.setMonth(fechaActual.getMonth() + 1)
            ).toLocaleDateString("es-MX");

            const textoPagare =
                `En cualquier lugar de este documento donde se estampe la firma por este pagaré debo(emos) y pagaré(mos) ` +
                `incondicionalmente a la vista y a la orden de SANTUL HERRAMIENTAS S.A. DE C.V., la cantidad de: $${totalImporte.toFixed(
                    2
                )} ` +
                `(${letras} M.N.) En el total a pagar en Cuautitlán, Estado de México, o en la que SANTUL HERRAMIENTAS S.A. DE C.V., juzgue necesario. ` +
                `Este documento causará intereses al 3% mensual si no se paga a su vencimiento. expide el ${fechaHoy}, vence el ${fechaVence}.`;

            currentY = verificarEspacio(doc, currentY, 8);

            doc.autoTable({
                startY: currentY,
                body: [[textoPagare, "Firma del Cliente"]],
                theme: "grid",
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    valign: "top",
                    textColor: [0, 0, 0],
                },
                columnStyles: {
                    0: { cellWidth: 150, fillColor: [240, 240, 240] },
                    1: { cellWidth: 40, halign: "center", fontStyle: "bold" },
                },
                margin: { left: 10 },
                tableWidth: 190,
            });

            currentY = doc.lastAutoTable.finalY + 0;
            currentY = verificarEspacio(doc, currentY, 5);
            doc.addImage(infoBancaria, "JPEG", 10, currentY, 190, 35);

            addPageNumber(doc);
            doc.save(`PackingList_de_${pedido}.pdf`);
            alert(`PDF generado con éxito para el pedido ${pedido}`);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF.");
        }
    };

    useEffect(() => {
        // console.log("Observaciones actuales:", observacionesPorRegistro);
    }, [observacionesPorRegistro, groupedData]);

    const MAX_VISIBLE_ROUTES = 100;

    const removeRoute = (route) => {
        setGroupedData((prevData) => {
            const updatedRoutes = { ...prevData };
            delete updatedRoutes[route]; // Eliminar la ruta del objeto
            return updatedRoutes;
        });

        // También remover la ruta de las seleccionadas si estaba marcada
        setSelectedRoutes((prevSelected) =>
            prevSelected.filter((r) => r !== route)
        );
    };

    const [filter, setFilter] = useState({
        noOrden: "",
        numCliente: "",
        estado: "",
    });

    useEffect(() => {
        if (!data || !Array.isArray(data)) {
            setData([]);
        }
    }, [data]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOrderFilterChange = (e) => {
        const value = e.target.value;
        setFilterOrderValue(value);

        // Resaltar solo si hay un valor en el filtro
        if (value) {
            const rowIndex = groupedData[selectedRoute]?.rows.findIndex(
                (row) => row["NO ORDEN"].toString() === value
            );

            // Si se encuentra la fila, resaltar temporalmente
            if (rowIndex !== -1) {
                setHighlightedRow(rowIndex);
            } else {
                setHighlightedRow(null); // Quitar el resaltado si no se encuentra
            }
        } else {
            setHighlightedRow(null); // Quitar el resaltado si el filtro está vacío
        }
    };

    const openDirectaModal = (data) => {
        console.log("🔍 Datos recibidos en openDirectaModal:", data);

        setSelectedDirectaData(data);
        setGuia(data.GUIA || "");
        setSelectedNoOrden(data["NO ORDEN"] || "");
        setFecha(data.FECHA || "");
        setNumCliente(data["NUM CLIENTE"] || "");
        setNombreCliente(data["NOMBRE DEL CLIENTE"] || "");
        setMunicipio(data.MUNICIPIO || "");
        setEstado(data.ESTADO || "");
        setObservaciones(data.OBSERVACIONES || "");
        setTotal(data.TOTAL || "");
        setPartidas(data.PARTIDAS || "");
        setPiezas(data.PIEZAS || "");
        setZona(data.ZONA || "");
        setTipoZona(data["TIPO DE ZONA"] || "");
        setNoFactura(data.NO_FACTURA || "");
        setDiaEnRuta(data["DIA EN QUE ESTA EN RUTA"] || "");
        setCajas(data.CAJAS || "");
        setTransporte(data.TRANSPORTE || "");
        setPaqueteria(data.PAQUETERIA || "");
        setDiasEntrega(data["DIAS_DE_ENTREGA"] || "");
        setEntregaSatisfactoria(
            data["ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA"] || ""
        );
        setMotivo(data.MOTIVO || "");
        setDiferencia(data.DIFERENCIA || "");
        setTipo(data.TIPO || "");

        setFechaEmbarque(
            data["FECHA_DE_EMBARQUE"]
                ? new Date(data["FECHA_DE_EMBARQUE"]).toISOString().split("T")[0]
                : ""
        );

        setFechaEntregaCliente(parseFechaEntrega(data["FECHA_DE_ENTREGA_CLIENTE"]));

        setFechaFactura(
            data.FECHA_DE_FACTURA ? data.FECHA_DE_FACTURA.split(" ")[0] : ""
        );

        setTipo(data.TIPO || "");

        console.log("📌 Estado después de setState:");
        console.log({
            guia,
            selectedNoOrden,
            fecha,
            numCliente,
            nombreCliente,
            municipio,
            estado,
            observaciones,
            total,
            partidas,
            piezas,
            zona,
            tipoZona,
            noFactura,
            diaEnRuta,
            cajas,
            transporte,
            paqueteria,
            diasEntrega,
            entregaSatisfactoria,
            motivo,
            diferencia,
            fechaEmbarque,
            fechaEntregaCliente,
            fechaEstimadaCliente,
            tipo,
        });

        setDirectaModalOpen(true);
    };

    const parseFechaEntrega = (valor) => {
        if (!valor) return "";
        if (typeof valor === "string" && valor.includes("/")) {
            const [dia, mes, anio] = valor.split("/");
            return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
        }
        const fecha = new Date(valor);
        return isNaN(fecha) ? "" : fecha.toISOString().split("T")[0];
    };

    const closeDirectaModal = () => {
        setDirectaModalOpen(false);
        setSelectedDirectaData(null);
    };

    const fetchTransportistas = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/transportistas"
            );
            // console.log("Datos de transportistas:", response.data); // Verifica que contenga datos
            setTransportistaData(response.data);
        } catch (error) {
            console.error("Error al obtener transportistas:", error);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/transportistas/empresas"
            );

            // console.log("Datos de empresa:", response.data); // Verifica que contenga datos
            setEmpresaData(response.data);
        } catch (error) {
            console.error("Error al obtener empresas:", error);
            setError("Error al obtener empresas");
        }
    };

    const handleRowChange = (index, field, value) => {
        let updatedData = [...directaData, ...paqueteriaData].map((item) => ({
            ...item,
        }));

        if (field === "transportista") {
            const selectedTransportista = transportistaData.find(
                (item) => `${item.nombre} ${item.apellidos}` === value
            );

            updatedData[index] = {
                ...updatedData[index],
                transportista: selectedTransportista
                    ? `${selectedTransportista.nombre} ${selectedTransportista.apellidos}`
                    : "",
                clave: selectedTransportista?.clave || "", // Mantener clave actualizada
            };
        } else if (field === "id_veh") {
            if (value) {
                const empresaSeleccionada = empresaData.find(
                    (item) => item.id_veh === Number(value)
                );

                if (empresaSeleccionada) {
                    // console.log(
                    //   "🏢 Empresa seleccionada correctamente:",
                    //   empresaSeleccionada
                    // );
                    updatedData[index] = {
                        ...updatedData[index],
                        empresa: empresaSeleccionada.empresa, // Mantener el nombre de la empresa
                        id_veh: Number(value), // Actualizar id_veh
                    };
                } else {
                    console.warn(
                        "⚠️ No se encontró la empresa seleccionada en los datos."
                    );
                }
            } else {
                // Si no hay valor seleccionado, limpiar los campos
                updatedData[index] = {
                    ...updatedData[index],
                    empresa: "",
                    id_veh: "",
                };
            }
        } else {
            updatedData[index] = {
                ...updatedData[index],
                [field]: value, // Actualizar cualquier otro campo
            };
        }

        // Actualiza los datos en los estados separados
        setDirectaData(updatedData.filter((item) => item.TIPO === "directa"));
        setPaqueteriaData(updatedData.filter((item) => item.TIPO === "paqueteria"));

        // console.log("📊 Datos después de actualizar:", updatedData[index]);
    };

    const handleInsertarVisita = async (routeData, index) => {
        try {
            if (!routeData.id_veh) {
                alert("No se ha seleccionado un vehículo válido.");
                return;
            }

            // Datos a enviar al backend
            const dataToSend = {
                id_vit: routeData.clave,
                clave_visit: `${routeData.clave}1`,
                motivo: "Transporte",
                personal: "Administracion de Transporte",
                reg_entrada:
                    routeData.reg_entrada || new Date().toISOString().split("T")[0],
                id_veh: routeData.id_veh,
            };

            // // Mostrar datos en consola antes de enviar
            // console.log(
            //   "📤 Datos preparados para envío:",
            //   JSON.stringify(dataToSend, null, 2)
            // );

            // Enviar la solicitud al backend
            const response = await axios.post(
                "http://localhost:3007/api/Ventas/insertar-visita",
                dataToSend
            );

            alert(`✅ Visita insertada correctamente: ${response.data.message}`);

            // Actualizar el estado local para marcar como insertado
            const updatedData = [...directaData, ...paqueteriaData];
            updatedData[index] = {
                ...routeData,
                insertado: true,
            };

            setDirectaData(updatedData.filter((item) => item.TIPO === "directa"));
            setPaqueteriaData(
                updatedData.filter((item) => item.TIPO === "paqueteria")
            );
        } catch (error) {
            console.error("❌ Error al insertar la visita:", error);
            alert("Error al insertar la visita.");
        }
    };

    const eliminarRuta = async (noOrden) => {
        try {
            setLoading(true); // Muestra el loading
            const response = await axios.delete(
                `http://localhost:3007/api/Ventas/ruta/eliminar/${noOrden}`
            );
            alert(response.data.message); // Muestra el mensaje de éxito
            // Aquí puedes también actualizar el estado para eliminar la ruta de la vista sin necesidad de recargar
        } catch (error) {
            console.error(
                "Error al eliminar la ruta:",
                error.response ? error.response.data.message : error.message
            );
            alert("Error al eliminar la ruta");
        } finally {
            setLoading(false); // Oculta el loading
        }
    };

    const calculateTotalRoutes = () => {
        let totalClientes = 0;
        let totalPedidos = 0;
        let totalGeneral = 0;

        // Iterar sobre todas las rutas en groupedData
        Object.keys(groupedData).forEach((routeKey) => {
            const routeData = groupedData[routeKey];

            // Contar el número de registros/órdenes (clientes) en cada ruta
            totalClientes += routeData.rows.length; // Número de órdenes = número de registros en la ruta
            totalPedidos += routeData.rows.length; // Contar el número de órdenes (no sumar partidas)
            totalGeneral += routeData.rows.reduce(
                (sum, row) => sum + (row.TOTAL || 0),
                0
            ); // Sumar los totales de cada ruta
        });

        // Guardar los totales calculados en el estado
        const totals = { totalClientes, totalPedidos, totalGeneral };
        setCalculatedTotals(totals);
        setTotalClientes(totalClientes);
        setTotalPedidos(totalPedidos);
        setTotalGeneral(totalGeneral);
    };

    const handleEditObservation = (clientId) => {
        setEditingClientId(clientId);
        setCurrentObservation(observacionesPorRegistro[clientId] || "");
    };

    const handleSaveObservation = (clientId, newObservation) => {
        setObservacionesPorRegistro((prev) => ({
            ...prev,
            [clientId]: newObservation,
        }));
    };

    useEffect(() => { }, [observacionesPorRegistro, groupedData]);

    const getTransportUrl = (transport) => {
        const cleanedTransport = transport
            ?.trim()
            .replace(/\s+/g, " ")
            .toUpperCase();

        switch (cleanedTransport) {
            case "EXPRESS":
                return "https://www.paquetexpress.com.mx/";
            case "TRESGUERRAS":
                return "https://www.tresguerras.com.mx/3G/tracking.php";
            case "FLECHISA":
                return "https://fch.envionet.mx/CFDI-FC?P=1";
            case "FEDEX":
                return "https://www.fedex.com/es-mx/home.html";
            case "PITIC":
                return "https://transportespitic.com/soluciones-tecnologia.html";
            default:
                // console.log("Transporte no encontrado. Usando enlace por defecto.");
                return "https://app2.simpliroute.com/#/planner/vehicles";
        }
    };

    const [options, setOptions] = useState([
        "EXPRESS",
        "TRESGUERRAS",
        "FLECHISA",
        "FEDEX",
        "PITIC",
    ]);

    const [inputValue, setInputValue] = useState("");

    const transportUrl = getTransportUrl(transporte);

    const handleOpenHistoricoModal = async () => {
        if (user?.role !== "Admin" && user?.role !== "Master") {
            alert("No tienes permisos para ver este módulo.");
            return;
        }
        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/historico"
            );
            setHistoricoData(response.data);
        } catch (error) {
            console.error("Error al obtener los datos históricos:", error);
        }
        setHistoricoModalOpen(true);
    };

    const handleFetchHistoricoData = async () => {
        if (selectedColumns.length === 0) {
            alert("Selecciona al menos una columna.");
            return;
        }

        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/historico",
                {
                    params: {
                        cliente: selectedCliente || "",
                        columnas: selectedColumns.join(","),
                        mes: selectedMonth || "", // 🟢 Enviar el mes seleccionado
                    },
                }
            );

            setHistoricoData(response.data);
        } catch (error) {
            console.error("Error al obtener datos históricos:", error);
            alert("Error al obtener datos históricos.");
        }
    };

    const fetchClientesRegistrados = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/historico_clientes"
            );

            // Limpiar comillas innecesarias en nombres de clientes
            const clientesLimpios = response.data.map((cliente) => ({
                noCliente: cliente.NO_DE_CLIENTE,
                nombreCliente: cliente.CLIENTE.replace(/^"|"$/g, ""), // Elimina comillas extras
            }));

            setClientes(clientesLimpios);
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
        }
    };

    const handleCloseHistoricoModal = () => {
        setHistoricoModalOpen(false);
    };

    useEffect(() => {
        fetchClientesRegistrados(); // Se ejecuta solo una vez al cargar la página
    }, []);

    const fetchColumnasDisponibles = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/historico_columnas"
            );
            setColumnasDisponibles(response.data);
        } catch (error) {
            console.error("Error al obtener las columnas:", error);
        }
    };

    useEffect(() => {
        if (historicoModalOpen) {
            fetchColumnasDisponibles();
        }
    }, [historicoModalOpen]);

    const resetFilters = () => {
        setSelectedCliente(""); // Reinicia el cliente
        setSelectedColumns([]); // Reinicia las columnas seleccionadas
        setHistoricoData([]); // Borra los datos mostrados en la tabla
    };

    const meses = [
        { value: "01", label: "Enero" },
        { value: "02", label: "Febrero" },
        { value: "03", label: "Marzo" },
        { value: "04", label: "Abril" },
        { value: "05", label: "Mayo" },
        { value: "06", label: "Junio" },
        { value: "07", label: "Julio" },
        { value: "08", label: "Agosto" },
        { value: "09", label: "Septiembre" },
        { value: "10", label: "Octubre" },
        { value: "11", label: "Noviembre" },
        { value: "12", label: "Diciembre" },
    ];

    const handleColumnSelection = (event) => {
        const selectedCols = event.target.value;
        setSelectedColumns(selectedCols);

        if (selectedCols.includes("FECHA")) {
            setSelectedMonth("01"); // Por defecto Enero
        } else {
            setSelectedMonth(""); // Reiniciar selección de mes si "FECHA" no está seleccionada
        }
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Estado para la paginación

    const filteredData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return []; // Previene errores

        return data.filter((row) => {
            return (
                (filter.noOrden === "" ||
                    row["NO ORDEN"]?.toString().includes(filter.noOrden)) &&
                (filter.numCliente === "" ||
                    row["NUM. CLIENTE"]?.toString().includes(filter.numCliente)) &&
                (filter.estado === "" ||
                    row.ESTADO?.toLowerCase().includes(filter.estado.toLowerCase()))
            );
        });
    }, [data, filter]); // Dependencias correctas

    const paginatedData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        // Asegurar que la página actual no exceda el máximo
        const maxPage = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= maxPage) setPage(0); // Resetear a la primera página si está fuera de rango

        return filteredData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredData, page, rowsPerPage]);

    const [filtroGeneralAsignacion, setFiltroGeneralAsignacion] = useState("");
    const [filtroEstadoAsignacion, setFiltroEstadoAsignacion] = useState("");

    const filteredAsignacion = useMemo(() => {
        return sentRoutesData.filter((item) => {
            if (
                item.TIPO?.toLowerCase() !== "paqueteria" &&
                item.TIPO?.toLowerCase() !== "directa"
            ) {
                return false;
            }

            const cumpleGeneral =
                !filtroGeneralAsignacion ||
                item["NO ORDEN"]?.toString().includes(filtroGeneralAsignacion) ||
                item["NUM. CLIENTE"]?.toString().includes(filtroGeneralAsignacion) ||
                item["NOMBRE DEL CLIENTE"]
                    ?.toLowerCase()
                    .includes(filtroGeneralAsignacion.toLowerCase());

            const cumpleEstado =
                !filtroEstadoAsignacion ||
                item.ESTADO?.toLowerCase().includes(
                    filtroEstadoAsignacion.toLowerCase()
                );

            return cumpleGeneral && cumpleEstado;
        });
    }, [sentRoutesData, filtroGeneralAsignacion, filtroEstadoAsignacion]);

    const paginatedAsignacion = filteredAsignacion.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const filteredClientes = clientes.filter((cliente) =>
        `${cliente.noCliente} - ${cliente.nombreCliente}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const [paqueteriaSeleccionada, setPaqueteriaSeleccionada] = useState(""); // 🔥 Estado para filtrar

    const handlePaqueteriaChange = (event) => {
        setPaqueteriaSeleccionada(event.target.value);
    };

    const [estatusSeleccionado, setEstatusSeleccionado] = useState(""); // Estatus vacío por defecto

    // Función para manejar el cambio del filtro de estatus
    const handleEstatusChange = (event) => {
        setEstatusSeleccionado(event.target.value);
    };

    const [mostrarSinGuia, setMostrarSinGuia] = useState(false);

    const [filtroGeneral, setFiltroGeneral] = useState(""); // para No Orden y Num Cliente
    const [filtroEstado, setFiltroEstado] = useState(""); // separado

    const toggleMostrarSinGuia = () => {
        setMostrarSinGuia((prev) => !prev);
    };

    const paqueteriaFiltrada = useMemo(() => {
        return paqueteriaData.filter((routeData) => {
            const coincideGeneral =
                !filtroGeneral ||
                routeData["NO ORDEN"]?.toString().includes(filtroGeneral) ||
                routeData["NUM. CLIENTE"]
                    ?.toString()
                    .toLowerCase()
                    .includes(filtroGeneral.toLowerCase());

            const coincideEstado =
                !filtroEstado ||
                routeData.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

            const coincidePaqueteria =
                !paqueteriaSeleccionada ||
                routeData.PAQUETERIA === paqueteriaSeleccionada;

            const coincideEstatus =
                !estatusSeleccionado || routeData.statusText === estatusSeleccionado;

            const coincideGuia =
                !mostrarSinGuia || !routeData.GUIA || routeData.GUIA.trim() === "";

            return (
                coincideGeneral &&
                coincideEstado &&
                coincidePaqueteria &&
                coincideEstatus &&
                coincideGuia
            );
        });
    }, [
        filtroGeneral,
        filtroEstado,
        paqueteriaData,
        paqueteriaSeleccionada,
        estatusSeleccionado,
        mostrarSinGuia,
    ]);

    const [facturaSeleccionada, setFacturaSeleccionada] = useState(""); // Filtro por factura
    const [fechaEntregaSeleccionada, setFechaEntregaSeleccionada] = useState(""); // Filtro por fecha

    // Manejo de cambios en los filtros
    const handleFacturaChange = (event) => {
        setFacturaSeleccionada(event.target.value);
    };

    // 🔹 Función para convertir fecha de DD/MM/YYYY a YYYY-MM-DD
    const formatDateToYYYYMMDD = (fecha) => {
        if (!fecha) return "";
        const partes = fecha.split("/"); // Divide por "/"
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(
                2,
                "0"
            )}`;
        }
        return fecha; // Si ya está en otro formato, se deja igual
    };

    // Manejo del cambio en la fecha
    const handleFechaEntregaChange = (event) => {
        setFechaEntregaSeleccionada(event.target.value); // Se guarda tal cual el usuario la escribe
    };

    // Filtrar los datos de "directaData"
    const directaFiltrada = useMemo(() => {
        return directaData.filter((item) => {
            const cumpleGeneral =
                !filtroGeneral ||
                item["NUM. CLIENTE"]
                    ?.toLowerCase()
                    .includes(filtroGeneral.toLowerCase()) ||
                item["NO ORDEN"]?.toString().includes(filtroGeneral);

            const cumpleEstado =
                !filtroEstado ||
                item.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

            const cumpleEstatus =
                !estatusSeleccionado || item.statusText === estatusSeleccionado;

            const cumpleFechaEntrega =
                !fechaEntregaSeleccionada ||
                item.FECHA_DE_ENTREGA_CLIENTE === fechaEntregaSeleccionada;

            return (
                cumpleGeneral && cumpleEstado && cumpleEstatus && cumpleFechaEntrega
            );
        });
    }, [
        filtroGeneral,
        filtroEstado,
        directaData,
        estatusSeleccionado,
        fechaEntregaSeleccionada,
    ]);

    const ventaEmpleadoFiltrada = useMemo(() => {
        return ventaEmpleadoData.filter((item) => {
            const cumpleGeneral =
                !filtroGeneral ||
                item["NUM. CLIENTE"]
                    ?.toLowerCase()
                    .includes(filtroGeneral.toLowerCase()) ||
                item["NO ORDEN"]?.toString().includes(filtroGeneral);

            const cumpleEstado =
                !filtroEstado ||
                item.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

            return cumpleGeneral && cumpleEstado;
        });
    }, [filtroGeneral, filtroEstado, ventaEmpleadoData]);



    const calcularDiasEntrega = (fechaInicio, fechaFin) => {
        if (!fechaInicio || !fechaFin) return 0;

        let startDate = new Date(fechaInicio);
        startDate.setDate(startDate.getDate() + 1); // 🔥 SUMA UN DÍA MÁS

        let endDate = new Date(fechaFin);
        let count = 0;

        while (startDate < endDate) {
            const day = startDate.getDay();
            if (day !== 0 && day !== 6) {
                // Solo contar lunes a viernes (evitar sábado y domingo)
                count++;
            }
            startDate.setDate(startDate.getDate() + 1); // Avanza un día
        }

        return count;
    };

    const PaqueteriaAutocomplete = ({
        visibleColumns,
        paqueteria,
        setPaqueteria,
    }) => {
        const [options, setOptions] = useState([
            "EXPRESS",
            "TRESGUERRAS",
            "FLECHISA",
            "FEDEX",
            "PITIC",
        ]);
    };

    useEffect(() => {
        if (fecha && fechaEntregaCliente) {
            const dias = calcularDiasEntrega(fecha, fechaEntregaCliente);
            setDiasEntrega(dias);
        }
    }, [fecha, fechaEntregaCliente]);

    const [modalObservaciones, setModalObservaciones] = useState({});
    const [editingObservationId, setEditingObservationId] = useState(null);

    useEffect(() => {
        const savedObservations =
            JSON.parse(localStorage.getItem("modalObservaciones")) || {};
        setModalObservaciones(savedObservations);
    }, []);

    const handleEditModalObservation = (clienteId) => {
        setEditingObservationId(clienteId);
    };

    const handleSaveModalObservation = (clienteId, nuevaObservacion) => {
        setModalObservaciones((prev) => {
            const updatedObservations = { ...prev, [clienteId]: nuevaObservacion };

            // Guardamos en localStorage para persistencia
            localStorage.setItem(
                "modalObservaciones",
                JSON.stringify(updatedObservations)
            );

            return updatedObservations;
        });

        // Mantener el campo activo hasta que el usuario haga clic fuera
    };

    const handleClearStorage = () => {
        localStorage.removeItem("totalClientes");
        localStorage.removeItem("totalPedidos");
        localStorage.removeItem("totalGeneral");

        // Restablecer los valores en la UI
        setTotalClientes(0);
        setTotalPedidos(0);
        setTotalGeneral(0);

        console.log(
            "🗑️ Datos de clientes, pedidos y total eliminados de localStorage."
        );
    };

    // Cambiar de página
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    // Cambiar el número de filas por página
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Volver a la primera página cuando se cambia el número de filas
    };

    const obtenerFechasDeEmbarque = async (noOrdenes) => {
        if (!noOrdenes || noOrdenes.length === 0) {
            console.error("Error: No se recibieron números de orden válidos.");
            return {};
        }

        try {
            console.log("Llamando a la API con No Ordenes:", noOrdenes);
            // Construimos la URL, uniendo los pedidos con comas
            const response = await axios.get(
                `http://localhost:3007/api/Ventas/pedido/ultimas-fechas-embarque?pedidos=${noOrdenes.join(
                    ","
                )}`
            );

            return response.data.fechasEmbarque.reduce((acc, item) => {
                acc[item.pedido] = item.fin_embarque || "Sin fecha";
                return acc;
            }, {});
        } catch (error) {
            console.error("Error al obtener las fechas de embarque:", error);
            return {};
        }
    };

    const [fechasEmbarque, setFechasEmbarque] = useState({});

    const [lastOrders, setLastOrders] = useState([]);

    useEffect(() => {
        const currentOrders = paginatedAsignacion.map((r) => r["NO ORDEN"]);

        // Verifica si ya tienes los datos de esas mismas órdenes
        if (JSON.stringify(currentOrders) === JSON.stringify(lastOrders)) {
            return; // No vuelvas a llamar si son las mismas
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const fechas = await obtenerFechasDeEmbarque(currentOrders);
                setFechasEmbarque(fechas);
                setLastOrders(currentOrders); // Guarda las órdenes que acabas de consultar
            } catch (error) {
                console.error("Error al obtener fechas de embarque:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [paginatedAsignacion, lastOrders]);

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [updatedOrders, setUpdatedOrders] = useState([]);

    const updateFacturas = async () => {
        if (!file) {
            alert("Por favor selecciona un archivo antes de subirlo.");
            return;
        }

        setUploading(true);
        setUploadMessage("");
        setUpdatedOrders([]); // Limpiar la lista antes de la nueva carga

        const formData = new FormData();
        formData.append("archivo", file);

        try {
            const response = await fetch(
                "http://localhost:3007/api/Ventas/subir-excel",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok) {
                const updatedOrders = data.updatedOrders || []; // Asegurar que es un array

                setUploadMessage(
                    `✅ Archivo subido correctamente. Se actualizaron las NO ORDEN.`
                );
                setUpdatedOrders(updatedOrders); // Guardar la lista de órdenes actualizadas
                fetchPaqueteriaRoutes(); // Recargar datos después de la actualización
            } else {
                setUploadMessage(`❌ Error: ${data.message}`);
                alert("Error al subir el archivo.");
            }
        } catch (error) {
            console.error("❌ Error en la subida:", error);
            setUploadMessage("❌ Error en la subida del archivo.");
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    //porrateo va aui

    const [modalGuiaOpen, setModalGuiaOpen] = useState(false);
    const [pedidos, setPedidos] = useState([]);

    const [sumaTotalPedidos, setSumaTotalPedidos] = useState(0);
    const [porcentajeRelacion, setPorcentajeRelacion] = useState(0);

    const buscarPedidosPorGuia = async () => {
        try {
            if (!guia && !numeroFacturaLT) {
                alert("⚠ Debes ingresar una guía o un número de factura LT.");
                return;
            }

            const guiaNormalizada = guia ? guia.trim().toUpperCase() : "";
            const facturaNormalizada = numeroFacturaLT
                ? numeroFacturaLT.trim().toUpperCase()
                : "";

            const queryParams = new URLSearchParams();
            if (guiaNormalizada) queryParams.append("guia", guiaNormalizada);
            if (facturaNormalizada)
                queryParams.append("numeroFacturaLT", facturaNormalizada);

            const response = await fetch(
                `http://localhost:3007/api/Ventas/rutas?${queryParams.toString()}`
            );
            const data = await response.json();

            console.log("🧪 DATA recibida:", data); // ✅ DEBUG VISUAL

            if (Array.isArray(data) && data.length > 0) {
                setPedidos(data);
                const sumaTotal = data.reduce((sum, pedido) => {
                    const totalLimpio = parseFloat(
                        String(pedido.TOTAL).replace(/[^0-9.-]+/g, "")
                    );
                    return sum + (isNaN(totalLimpio) ? 0 : totalLimpio);
                }, 0);

                setSumaTotalPedidos(sumaTotal);
                if (totalFacturaLT > 0) {
                    setPorcentajeRelacion((sumaTotal / totalFacturaLT) * 100);
                } else {
                    setPorcentajeRelacion(0);
                }
            } else {
                alert("⚠ No se encontraron pedidos con los datos ingresados.");
                setPedidos([]);
                setSumaTotalPedidos(0);
                setPorcentajeRelacion(0);
            }
        } catch (error) {
            console.error("❌ Error al buscar pedidos:", error);
            alert("❌ Hubo un error al buscar los pedidos.");
        }
    };

    const handleTotalFacturaLTChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setTotalFacturaLT(value);

        const sumaTotal = pedidos.reduce((sum, pedido) => {
            const total = parseFloat(String(pedido.TOTAL).replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(total) ? 0 : total);
        }, 0);

        setSumaTotalPedidos(sumaTotal);

        const nuevosPedidos = pedidos.map((pedido) => {
            const totalPedido =
                parseFloat(String(pedido.TOTAL).replace(/[^0-9.-]+/g, "")) || 0;

            // Calcular el porcentaje prorrateado del total
            const porcentaje = sumaTotal > 0 ? totalPedido / sumaTotal : 0;

            // Calcular el valor proporcional para el prorrateo
            const prorrateoFacturaLT = porcentaje * value;

            // Calcular valores iniciales (sin gastos)
            const sumaFlete = prorrateoFacturaLT; // Se duplica solo si no hay gastos luego
            const porcentajePaqueteria =
                totalPedido > 0 ? (prorrateoFacturaLT / totalPedido) * 100 : 0;

            return {
                ...pedido,
                prorrateoFacturaLT: prorrateoFacturaLT.toFixed(2),
                gastosExtras: 0,
                sumaFlete: sumaFlete.toFixed(2),
                porcentajeEnvio: "", // Se actualizará después con gastos
                porcentajePaqueteria: porcentajePaqueteria.toFixed(2) + " %",
                porcentajeGlobal: "",
            };
        });

        setPedidos(nuevosPedidos);
    };

    const handleGastosExtrasChange = (index, value) => {
        const nuevosPedidos = [...pedidos];
        const pedido = nuevosPedidos[index];

        const gastosExtras = parseFloat(value) || 0;
        const prorrateo = parseFloat(pedido.prorrateoFacturaLT) || 0;
        const totalPedido =
            parseFloat(String(pedido.TOTAL).replace(/[^0-9.-]+/g, "")) || 0;

        pedido.gastosExtras = gastosExtras;

        // Calcular suma flete
        const sumaFlete = gastosExtras > 0 ? prorrateo + gastosExtras : prorrateo;
        pedido.sumaFlete = sumaFlete.toFixed(2);

        // % Envío = prorrateo / total pedido
        const porcentajeEnvio =
            totalPedido > 0 ? (prorrateo / totalPedido) * 100 : 0;
        pedido.porcentajeEnvio = porcentajeEnvio.toFixed(2) + " %";

        // % Global = (suma flete + gastos) / total pedido
        const porcentajeGlobal =
            totalPedido > 0 ? (sumaFlete / totalPedido) * 100 : 0;
        pedido.porcentajeGlobal = porcentajeGlobal.toFixed(2) + " %";

        setPedidos(nuevosPedidos);
    };

    const guardarPorGuia = async () => {
        if (!guia || guia.trim() === "") {
            alert("❌ Faltan datos: El número de guía es obligatorio.");
            return;
        }

        // Modificación del bloque datosAGuardar dentro de guardarPorGuia

        const datosAGuardar = {
            numeroFacturaLT,
            totalFacturaLT,
            pedidos: pedidos.map((pedido) => ({
                noOrden: pedido["NO ORDEN"],
                numeroFacturaLT, // ✅ Aquí lo agregamos dentro de cada pedido
                prorrateoFacturaLT: parseFloat(pedido.prorrateoFacturaLT) || 0,
                prorrateoFacturaPaqueteria: 0,
                sumaFlete: parseFloat(pedido.sumaFlete) || 0,
                gastosExtras: parseFloat(pedido.gastosExtras) || 0,
                porcentajeEnvio:
                    parseFloat(
                        typeof pedido.porcentajeEnvio === "string"
                            ? pedido.porcentajeEnvio.replace(" %", "")
                            : pedido.porcentajeEnvio
                    ) || 0,
                porcentajePaqueteria:
                    parseFloat(
                        typeof pedido.porcentajePaqueteria === "string"
                            ? pedido.porcentajePaqueteria.replace(" %", "")
                            : pedido.porcentajePaqueteria
                    ) || 0,
                porcentajeGlobal:
                    parseFloat(
                        typeof pedido.porcentajeGlobal === "string"
                            ? pedido.porcentajeGlobal.replace(" %", "")
                            : pedido.porcentajeGlobal
                    ) || 0,
            })),
        };

        console.log("📤 Enviando datos a la API:", datosAGuardar);

        try {
            const response = await fetch(
                `http://localhost:3007/api/Ventas/actualizar-por-guia/${guia}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosAGuardar),
                }
            );

            const resultado = await response.json();
            if (response.ok) {
                alert("✅ Datos guardados correctamente.");
                handleCloseModalGuia(); // Cierra el modal después de guardar
            } else {
                alert("❌ Error al guardar: " + resultado.message);
            }
        } catch (error) {
            console.error("❌ Error en la solicitud:", error);
            alert("❌ Error al conectar con el servidor.");
        }
    };

    const limpiarPorcentaje = (valor) => {
        if (typeof valor === "string") {
            return parseFloat(valor.replace(" %", "")) || 0;
        }
        return typeof valor === "number" ? valor : 0;
    };

    const handleOpenModalGuia = () => {
        setModalGuiaOpen(true);
    };

    const handleCloseModalGuia = () => {
        setModalGuiaOpen(false);
    };

    //sincronisar rutas y toda la informacion

    const [loadingSync, setLoadingSync] = useState(false);

    const [pedidosDeBDOpen, setPedidosDeBDOpen] = useState(false);
    const [rutasConPedidos, setRutasConPedidos] = useState([]);
    const [selectedRuta, setSelectedRuta] = useState(null);
    const [lastSync, setLastSync] = useState(null);

    const syncRoutesToDB = async () => {
        if (loadingSync) return; // ✅ Evita que se ejecute si ya está en proceso

        setLoadingSync(true);
        let rutasMap = {};

        try {
            console.log("🔄 Iniciando sincronización automática...");

            const rutasArray = Object.keys(groupedData || {});

            if (rutasArray.length === 0) {
                console.warn("⚠️ No hay rutas para sincronizar.");
                setLoadingSync(false);
                return;
            }

            for (const route of rutasArray) {
                try {
                    const response = await axios.post(
                        "http://localhost:3007/api/Ventas/rutas",
                        {
                            nombre: route,
                        }
                    );

                    console.log("✅ Ruta sincronizada:", response.data);
                    rutasMap[route] = response.data.ruta_id;
                } catch (error) {
                    console.error(`❌ Error al sincronizar la ruta ${route}:`, error);
                }
            }

            for (const route of rutasArray) {
                const pedidos = groupedData[route]?.rows || [];

                if (pedidos.length === 0) {
                    console.log(`🔹 No hay pedidos para la ruta ${route}, omitiendo...`);
                    continue;
                }

                console.log(
                    `📤 Enviando ${pedidos.length} pedidos para la ruta ${route}`
                );

                for (const pedido of pedidos) {
                    const mappedPedido = {
                        ruta_id: rutasMap[route],
                        no_orden: pedido["NO ORDEN"],
                        num_cliente: pedido["NUM. CLIENTE"],
                        nombre_cliente: pedido["NOMBRE DEL CLIENTE"],
                        municipio: pedido["MUNICIPIO"],
                        estado: pedido["ESTADO"],
                        total: pedido["TOTAL"],
                        partidas: pedido["PARTIDAS"],
                        piezas: pedido["PIEZAS"],
                        fecha_emision: parseFechaEmision(pedido["FECHA"]),
                        observaciones: pedido["OBSERVACIONES"] || "Sin observaciones",
                        tipo: pedido["TIPO ORIGINAL"] || "", // 👈 esta es la línea clave
                    };

                    console.log("📤 Enviando pedido a la API:", mappedPedido);

                    try {
                        const response = await axios.post(
                            "http://localhost:3007/api/Ventas/rutas/pedidos",
                            mappedPedido
                        );
                        console.log("✅ Pedido sincronizado:", response.data);
                    } catch (error) {
                        console.error("❌ Error al sincronizar pedido:", error);
                    }
                }
            }

            console.log("✅ Rutas y pedidos sincronizados con éxito.");
            setLastSync(new Date().toLocaleTimeString()); // ✅ Guardar la hora de la última sincronización
        } catch (error) {
            console.error("❌ Error al sincronizar rutas y pedidos:", error);
        }

        setLoadingSync(false);
    };

    const parseFechaEmision = (fecha) => {
        if (!fecha) return null;

        const parsed = new Date(fecha);
        if (isNaN(parsed)) return null;

        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const getTotalRuta = (ruta) => {
        if (!ruta?.pedidos || ruta.pedidos.length === 0) return 0;
        return ruta.pedidos.reduce(
            (acc, pedido) => acc + (Number(pedido.total) || 0),
            0
        );
    };

    useEffect(() => {
        syncRoutesToDB(); // ✅ Se ejecuta una vez al inicio

        const interval = setInterval(() => {
            console.log("⏳ Ejecutando sincronización automática...");
            syncRoutesToDB();
        }, 5 * 60 * 1000); // 🔹 5 minutos en milisegundos

        return () => clearInterval(interval); // 🔹 Limpia el intervalo al desmontar el componente
    }, []);

    const fetchRutasConPedidos = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3007/api/Ventas/Rutasconpedido"
            );
            console.log("✅ Rutas obtenidas:", response.data);
            setRutasConPedidos(response.data);
        } catch (error) {
            console.error("❌ Error al obtener rutas y pedidos:", error);
        }
    };

    useEffect(() => {
        fetchRutasConPedidos();
    }, []);

    //mostrar en diferentes maquinas

    const openPedidosDeBDModal = async (ruta) => {
        const pedidos = ruta.pedidos || [];
        const ordenes = pedidos.map((p) => String(p.no_orden));

        try {
            const response = await axios.post(
                `http://localhost:3007/api/Ventas/status`,
                { orderNumbers: ordenes }
            );

            const statusMap = response.data;
            console.log("✅ StatusMap directo:", statusMap);

            const pedidosActualizados = pedidos.map((pedido) => {
                const match = statusMap[pedido.no_orden];
                return {
                    ...pedido,
                    statusText: match?.statusText || "Sin status",
                    color: match?.color || "#000000",
                    fusionWith: match?.fusionWith || null,
                };
            });

            // ✅ Actualizar la ruta seleccionada (modal)
            setSelectedRuta({
                ...ruta,
                pedidos: pedidosActualizados,
            });

            // ✅ Actualizar también la ruta dentro de rutasConPedidos para que los statusText estén en las tarjetas
            setRutasConPedidos((prev) =>
                prev.map((r) =>
                    r.id === ruta.id
                        ? {
                            ...r,
                            pedidos: pedidosActualizados,
                        }
                        : r
                )
            );
        } catch (error) {
            console.error("❌ Error al consultar estados antes del modal:", error);
        }
    };

    const closePedidosDeBDModal = () => {
        setSelectedRuta(null);
    };

    const getStatusCountForRuta = (pedidos = []) => {
        const statusCounts = {
            "Por Asignar": 0,
            Surtiendo: 0,
            Embarcando: 0,
            "Pedido Finalizado": 0,
            Otro: 0,
        };

        pedidos.forEach((pedido) => {
            const status = (pedido.statusText || "").trim();

            switch (status) {
                case "Por Asignar":
                    statusCounts["Por Asignar"]++;
                    break;
                case "Surtiendo":
                    statusCounts.Surtiendo++;
                    break;
                case "Embarcando":
                    statusCounts.Embarcando++;
                    break;
                case "Pedido Finalizado":
                    statusCounts["Pedido Finalizado"]++;
                    break;
                case "Sin coincidencia de tipo":
                    console.warn("🚫 Pedido sin coincidencia de tipo:", pedido.no_orden);
                    break;
                default:
                    statusCounts.Otro++;
            }
        });

        return statusCounts;
    };

    //calculo del dia

    const [resumen, setResumen] = useState(null);

    useEffect(() => {
        const fetchResumenDelDia = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3007/api/Ventas/resumen-dia"
                );
                setResumen(response.data);
            } catch (error) {
                console.error("Error al obtener el resumen del día:", error);
            }
        };

        fetchResumenDelDia();
    }, []);

    //Funcionamiento para poder mover los pedidos

    const moverPedido = (ruta, index, direccion) => {
        setGroupedData((prev) => {
            const nuevaRuta = { ...prev[ruta] };
            const items = [...nuevaRuta.rows];

            if (direccion === "arriba" && index > 0) {
                [items[index - 1], items[index]] = [items[index], items[index - 1]];
            }

            if (direccion === "abajo" && index < items.length - 1) {
                [items[index], items[index + 1]] = [items[index + 1], items[index]];
            }

            return {
                ...prev,
                [ruta]: {
                    ...nuevaRuta,
                    rows: items,
                },
            };
        });
    };

    //AGREGAR MASIVAMENTE A UNA RUTA VARIOS PEDIDOS

    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedMassRoute, setSelectedMassRoute] = useState("");

    const handleToggleOrderSelection = (pedido) => {
        setSelectedOrders((prev) => {
            const already = prev.includes(pedido["NO ORDEN"]);
            return already
                ? prev.filter((id) => id !== pedido["NO ORDEN"])
                : [...prev, pedido["NO ORDEN"]];
        });
    };

    const handleAssignMultipleToRoute = () => {
        if (!selectedMassRoute) {
            alert("Selecciona una ruta antes de continuar.");
            return;
        }

        const pedidosSeleccionados = data.filter((row) =>
            selectedOrders.includes(row["NO ORDEN"])
        );

        pedidosSeleccionados.forEach((pedido) => {
            assignToRoute(pedido, selectedMassRoute); // ✅ Usa la función existente
        });

        // Limpiar selección
        setSelectedOrders([]);
        setSelectedMassRoute("");
    };

    const handleBuscarPorOrden = () => {
        const noOrdenBuscado = filterOrderValue.trim();
        if (!noOrdenBuscado) return;

        let rutaEncontrada = null;

        for (const ruta in groupedData) {
            const contieneOrden = groupedData[ruta].rows.some(
                (row) => String(row["NO ORDEN"]) === noOrdenBuscado
            );

            if (contieneOrden) {
                rutaEncontrada = ruta;
                break;
            }
        }

        if (rutaEncontrada) {
            openModal(rutaEncontrada); // 👈 ya tienes esta función para abrir ruta
            setHighlightedRow(noOrdenBuscado); // (opcional) para resaltar visualmente
        } else {
            alert("No se encontró el número de orden en ninguna ruta.");
        }
    };

    //ocultar las rutas
    const [hiddenRoutes, setHiddenRoutes] = useState(() => {
        const saved = localStorage.getItem("hiddenRoutes");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("hiddenRoutes", JSON.stringify(hiddenRoutes));
    }, [hiddenRoutes]);

    useEffect(() => {
        const storedHidden = localStorage.getItem("hiddenRoutes");
        if (storedHidden) {
            setHiddenRoutes(JSON.parse(storedHidden));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("hiddenRoutes", JSON.stringify(hiddenRoutes));
    }, [hiddenRoutes]);

    //actualizar las guias de directas

    const [bulkGuiaModalOpen, setBulkGuiaModalOpen] = useState(false);
    const [bulkNoOrdenes, setBulkNoOrdenes] = useState("");
    const [bulkGuiaValue, setBulkGuiaValue] = useState("");
    const [bulkTransporteValue, setBulkTransporteValue] = useState("");
    const [bulkPaqueteriaValue, setBulkPaqueteriaValue] = useState("");

    const [bulkTransportePaqueteriaValue, setBulkTransportePaqueteriaValue] =
        useState("");

    const handleBulkGuiaUpdate = async () => {
        if (!bulkGuiaValue || !bulkNoOrdenes || !bulkTransportePaqueteriaValue) {
            alert(
                "Por favor ingresa los pedidos, la guía y el transporte/paquetería."
            );
            return;
        }

        const ordenes = bulkNoOrdenes
            .split(",")
            .map((o) => o.trim())
            .filter((o) => o !== "");

        const errores = [];

        for (const orden of ordenes) {
            try {
                const response = await fetch(
                    `http://localhost:3007/api/Ventas/actualizar-guia-completa/${orden}`, // 🔥 nueva ruta aquí
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            guia: bulkGuiaValue, // Lo que capturaste en "Guía"
                            transporte: bulkTransportePaqueteriaValue, // Lo que capturaste en "Transporte/Paquetería"
                            paqueteria: bulkTransportePaqueteriaValue, // Igual aquí
                        }),
                    }
                );

                if (!response.ok) {
                    const data = await response.json();
                    errores.push(`Pedido ${orden}: ${data.message}`);
                }
            } catch (err) {
                errores.push(`Pedido ${orden}: Error de red`);
            }
        }

        if (errores.length > 0) {
            alert("❌ Errores al actualizar:\n" + errores.join("\n"));
        } else {
            alert("✅ Actualización exitosa en todos los pedidos.");
            fetchPaqueteriaRoutes(); // 🔄 Refresca tu tabla
        }

        // 🔹 Limpia todo
        setBulkGuiaModalOpen(false);
        setBulkNoOrdenes("");
        setBulkGuiaValue("");
        setBulkTransportePaqueteriaValue("");
    };

    //filtar por mes

    const [mesSeleccionado, setMesSeleccionado] = useState("");

    useEffect(() => {
        fetchPaqueteriaRoutes(); // Al inicio carga últimos 3 días por defecto
    }, []);

    const handleChangeMes = (e) => {
        const nuevoMes = e.target.value;
        setMesSeleccionado(nuevoMes);
        fetchPaqueteriaRoutes({ mes: nuevoMes });
    };

    // mandar correo

    const handleEnviarCorreo = async (noOrden) => {
        try {
            const response = await axios.post(
                "http://localhost:3007/api/Ventas/enviar",
                {
                    noOrden,
                }
            );

            if (response.data.success) {
                alert(`✅ Correo enviado para la orden ${noOrden}`);
            } else {
                alert(`⚠️ Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error("❌ Error al enviar correo:", error);
            alert("❌ No se pudo enviar el correo.");
        }
    };

    // calcular por status

    const [conteoEstatus, setConteoEstatus] = useState({});

    const ordenEstatus = [
        "Por Asignar",
        "Surtiendo",
        "Embarcando",
        "Pedido Finalizado",
    ];

    const colorPorEstatus = {
        "Pedido no encontrado": "#9e9e9e",
        "Por Asignar": "#e53935",
        Surtiendo: "#1e88e5",
        Embarcando: "#8e24aa",
        "Pedido Finalizado": "#43a047",
    };

    const calcularConteoPorEstatus = (data) => {
        const conteo = {};
        data.forEach((item) => {
            const estatus = item.statusText || "Sin Estatus";
            conteo[estatus] = (conteo[estatus] || 0) + 1;
        });
        setConteoEstatus(conteo);
    };

    useEffect(() => {
        let dataActual = [];

        switch (subTabIndex) {
            case 0:
                dataActual = paqueteriaData;
                break;
            case 1:
                dataActual = directaData;
                break;
            case 2:
                dataActual = ventaEmpleadoData;
                break;
            case 3:
                dataActual = sentRoutesData.filter((d) =>
                    ["paqueteria", "directa"].includes(d.TIPO?.trim().toLowerCase())
                );
                break;
            default:
                dataActual = [];
        }

        calcularConteoPorEstatus(dataActual);
    }, [subTabIndex, paqueteriaData, directaData, ventaEmpleadoData]);

    //exportar exel

    const handleExportarPorMes = () => {
        if (!mesSeleccionado) {
            alert("Selecciona un mes para exportar.");
            return;
        }

        // Obtener año actual y armar el mes en formato "YYYY-MM"
        const anioActual = new Date().getFullYear();
        const mesFormateado = `${anioActual}-${String(mesSeleccionado).padStart(
            2,
            "0"
        )}`;

        const datosFiltrados = sentRoutesData.filter((pedido) => {
            if (!pedido.created_at) return false;

            const fecha = new Date(pedido.created_at);
            if (isNaN(fecha)) return false;

            const mesActual = `${fecha.getFullYear()}-${String(
                fecha.getMonth() + 1
            ).padStart(2, "0")}`;
            return mesActual === mesFormateado;
        });

        if (datosFiltrados.length === 0) {
            alert("No hay registros para exportar en ese mes.");
            return;
        }

        const datosPaqueteria = datosFiltrados.filter(
            (pedido) => pedido.TIPO?.trim().toLowerCase() === "paqueteria"
        );
        const datosDirecta = datosFiltrados.filter(
            (pedido) => pedido.TIPO?.trim().toLowerCase() === "directa"
        );

        const columnas = [
            "FECHA",
            "NO ORDEN",
            "NO_FACTURA",
            "FECHA_DE_FACTURA",
            "NUM. CLIENTE",
            "NOMBRE DEL CLIENTE",
            "ZONA",
            "MUNICIPIO",
            "ESTADO",
            "OBSERVACIONES",
            "TOTAL",
            "PARTIDAS",
            "PIEZAS",
            "TARIMAS",
            "TRANSPORTE",
            "PAQUETERIA",
            "GUIA",
            "FECHA_DE_ENTREGA_CLIENTE",
            "DIAS_DE_ENTREGA",
            "ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA",
            "MOTIVO",
            "NUMERO_DE_FACTURA_LT",
            "TOTAL_FACTURA_LT",
            "PRORRATEO_FACTURA_LT",
            "PRORRATEO_FACTURA_PAQUETERIA",
            "GASTOS_EXTRAS",
            "SUMA_FLETE",
            "PORCENTAJE_ENVIO",
            "PORCENTAJE_PAQUETERIA",
            "SUMA_GASTOS_EXTRAS",
            "PORCENTAJE_GLOBAL",
            "DIFERENCIA",
        ];

        const transformData = (datos) => {
            return datos.map((row) => {
                const exportRow = {};
                columnas.forEach((col) => {
                    exportRow[col] = row[col] ?? "";
                });
                return exportRow;
            });
        };

        const datosPaqueteriaExportados = transformData(datosPaqueteria);
        const datosDirectaExportados = transformData(datosDirecta);

        const workbook = XLSX.utils.book_new();
        if (datosPaqueteriaExportados.length > 0) {
            const worksheetPaqueteria = XLSX.utils.json_to_sheet(
                datosPaqueteriaExportados
            );
            XLSX.utils.book_append_sheet(workbook, worksheetPaqueteria, "Paquetería");
        }
        if (datosDirectaExportados.length > 0) {
            const worksheetDirecta = XLSX.utils.json_to_sheet(datosDirectaExportados);
            XLSX.utils.book_append_sheet(workbook, worksheetDirecta, "Directa");
        }

        XLSX.writeFile(workbook, `Rutas_Mes_${mesFormateado}.xlsx`);
    };

    //recuperar las eliminada

    const reactivarRuta = (nombreRuta, pedidos) => {
        if (!nombreRuta || !Array.isArray(pedidos) || pedidos.length === 0) {
            alert("⚠ No hay pedidos disponibles para reactivar esta ruta.");
            return;
        }

        if (groupedData[nombreRuta]) {
            alert("⚠️ Esta ruta ya existe.");
            return;
        }

        const nuevaRuta = {
            TOTAL: 0,
            PARTIDAS: 0,
            PIEZAS: 0,
            rows: [],
        };

        pedidos.forEach((pedido) => {
            const total = parseFloat(pedido.total || pedido.TOTAL || 0);
            const partidas = parseInt(pedido.partidas || pedido.PARTIDAS || 0);
            const piezas = parseInt(pedido.piezas || pedido.PIEZAS || 0);

            nuevaRuta.TOTAL += total;
            nuevaRuta.PARTIDAS += partidas;
            nuevaRuta.PIEZAS += piezas;

            const pedidoNormalizado = {
                ...pedido,
                "NO ORDEN": pedido["NO ORDEN"] || pedido.no_orden || "",
                "NO FACTURA": pedido["NO FACTURA"] || pedido.no_factura || "",
                "FECHA DE FACTURA": pedido["FECHA DE FACTURA"] || pedido.fecha_de_factura || "",
                "NUM. CLIENTE": pedido["NUM. CLIENTE"] || pedido.num_cliente || "",
                "NOMBRE DEL CLIENTE": pedido["NOMBRE DEL CLIENTE"] || pedido.nombre_cliente || "",
                MUNICIPIO: pedido.MUNICIPIO || pedido.municipio || "",
                ESTADO: pedido.ESTADO || pedido.estado || "",
                ZONA: pedido.ZONA || pedido.zona || "",
                FECHA: pedido.FECHA || pedido.fecha || moment().format("YYYY-MM-DD"),
                OBSERVACIONES: pedido.OBSERVACIONES || pedido.observaciones || "Sin observaciones",
                TOTAL: total,
                PARTIDAS: partidas,
                PIEZAS: piezas,
                tipo_original: pedido.tipo || pedido.TIPO || "",
                tipo: pedido.tipo || pedido.TIPO || "", // si también lo necesitas con ese nombre
                "EJECUTIVO VTAS": pedido["EJECUTIVO VTAS"] || "",
                GUIA: pedido.GUIA || "",
            };

            console.log("✅ Pedido normalizado:", pedidoNormalizado); // Verifica visualmente

            nuevaRuta.rows.push(pedidoNormalizado);
        });

        setGroupedData((prev) => {
            const updated = { ...prev, [nombreRuta]: nuevaRuta };
            localStorage.setItem("transporteGroupedData", JSON.stringify(updated));
            return updated;
        });

        alert("✅ Ruta reactivada correctamente.");
    };


    const openDetallesRuta = (ruta) => {
        const pedidos = groupedData[ruta]?.rows || [];
        setModalPedidos(pedidos);
    };

    const getPedidosRuta = (nombreRuta) => {
        if (groupedData[nombreRuta]?.rows?.length > 0) {
            return groupedData[nombreRuta].rows;
        }

        const ruta = rutasConPedidos.find((r) => r.nombre === nombreRuta);
        return ruta?.pedidos || [];
    };

    const [pedidosModal, setPedidosModal] = useState([]);
    const [modalPedidos, setModalPedidos] = useState([]);
    const [modalRoute, setModalRoute] = useState("");

    //actualisar el originan el tipo

    const [archivoTipoOriginal, setArchivoTipoOriginal] = useState(null);

    const handleArchivoTipoOriginal = (e) => {
        setArchivoTipoOriginal(e.target.files[0]);
    };

    const subirArchivoTipoOriginal = async () => {
        if (!archivoTipoOriginal) {
            alert("❌ Selecciona un archivo Excel primero.");
            return;
        }

        const formData = new FormData();
        formData.append("archivo", archivoTipoOriginal);

        try {
            const response = await axios.post(
                "http://localhost:3007/api/Ventas/actualizar-tipo-original",
                formData
            );

            alert(response.data.message || "✅ Actualización completada.");
            fetchPaqueteriaRoutes(); // Refrescar tabla si es necesario
        } catch (error) {
            console.error("❌ Error al subir archivo:", error);
            alert("Error al subir el archivo.");
        }
    };

    return (
        <Paper elevation={3} style={{ padding: "20px" }}>
            <Box marginTop={2}>
                <br />

                {/* Pestañas internas para Paquetería, Directa, Venta Empleado */}
                <Tabs value={subTabIndex} onChange={handleChangeSubTab} centered>
                    <Tab label="Paquetería" />
                    <Tab label="Directa" />
                    <Tab label="Recoge" />
                    <Tab label="Asignacion" />
                </Tabs>

                {/* Sub-tab de PAQUETERIA */}
                {subTabIndex === 0 && (
                    <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            {/* Imagen agregada desde la misma carpeta */}
                            <img
                                src={logo}
                                alt="Filtro"
                                style={{ width: "400px", height: "auto" }}
                            />

                            <select
                                value={mesSeleccionado}
                                onChange={(e) => setMesSeleccionado(e.target.value)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                    color: "#333",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    outline: "none",
                                    transition: "border-color 0.3s ease",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#ff6600")}
                                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                            >
                                <option value="">Últimos 3 días</option>
                                <option value="1">Enero</option>
                                <option value="2">Febrero</option>
                                <option value="3">Marzo</option>
                                <option value="4">Abril</option>
                                <option value="5">Mayo</option>
                                {/* <option value="6">Junio</option>
                                <option value="7">Julio</option>
                                <option value="8">Agosto</option>
                                <option value="9">Septiembre</option>
                                <option value="10">Octubre</option>
                                <option value="11">Noviembre</option>
                                <option value="12">Diciembre</option> */}
                            </select>

                            <Typography variant="h5" style={{ textAlign: "center" }}>
                                Transportes
                            </Typography>

                            {/* Caja de texto centrada y más grande */}
                            <TextField
                                label="Buscar por No Orden o Num Cliente"
                                value={filtroGeneral}
                                onChange={(e) => setFiltroGeneral(e.target.value)}
                                variant="outlined"
                                size="small"
                            />

                            <TextField
                                label="Buscar por Estado"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </div>

                        <TablePagination
                            component="div"
                            count={paqueteriaFiltrada.length} // O usa directaFiltrada.length o ventaEmpleadoFiltrada.length según la tabla
                            rowsPerPage={10} // Fijado en 10 filas por página
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            labelRowsPerPage="" // Oculta "Rows per page"
                            rowsPerPageOptions={[]} // Elimina el selector de filas
                            style={{ textAlign: "right" }}
                        />

                        <Table>
                            <TableBody>
                                <TableRow>
                                    {visibleColumns.includes("NO ORDEN") && (
                                        <TableCell>NO ORDEN</TableCell>
                                    )}
                                    {visibleColumns.includes("NO ORDEN") && (
                                        <TableCell>Estado del Pedido</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA") && (
                                        <TableCell>FECHA</TableCell>
                                    )}
                                    {visibleColumns.includes("NUM CLIENTE") && (
                                        <TableCell>NUM CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("MUNICIPIO") && (
                                        <TableCell>MUNICIPIO</TableCell>
                                    )}
                                    {visibleColumns.includes("ESTADO") && (
                                        <TableCell>ESTADO</TableCell>
                                    )}
                                    {visibleColumns.includes("OBSERVACIONES") && (
                                        <TableCell>OBSERVACIONES</TableCell>
                                    )}
                                    {visibleColumns.includes("TOTAL") && (
                                        <TableCell>TOTAL</TableCell>
                                    )}
                                    {visibleColumns.includes("TOTAL FACTURA LT") && (
                                        <TableCell>TOTAL FACTURA LT</TableCell>
                                    )}
                                    {visibleColumns.includes("NUMERO DE FACTURA") && (
                                        <TableCell>NUMERO DE FACTURA</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE FACTURA") && (
                                        <TableCell>FECHA DE FACTURA</TableCell>
                                    )}
                                    {visibleColumns.includes("TRANSPORTE") && (
                                        <TableCell>TRANSPORTE</TableCell>
                                    )}
                                    {visibleColumns.includes("PAQUETERIA") && (
                                        <TableCell>PAQUETERIA</TableCell>
                                    )}
                                    {visibleColumns.includes("GUIA") && (
                                        <TableCell>GUIA</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                                        <TableCell>FECHA DE ENTREGA</TableCell>
                                    )}
                                    {visibleColumns.includes("Acciones") && (
                                        <TableCell>Acciones</TableCell>
                                    )}
                                </TableRow>
                                {paqueteriaData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={visibleColumns.length}
                                            style={{ textAlign: "center" }}
                                        >
                                            No hay datos disponibles.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paqueteriaFiltrada
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((routeData, index) => (
                                            <TableRow
                                                key={index}
                                                onClick={() => handleRowClick(routeData)}
                                            >
                                                {visibleColumns.includes("NO ORDEN") && (
                                                    <TableCell>{routeData["NO ORDEN"]}</TableCell>
                                                )}

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        style={{ color: routeData.color }}
                                                    >
                                                        {routeData.statusText}
                                                    </Typography>
                                                </TableCell>

                                                {visibleColumns.includes("FECHA") && (
                                                    <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                                                )}
                                                {visibleColumns.includes("NUM CLIENTE") && (
                                                    <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                                                )}
                                                {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                                                    <TableCell>
                                                        {" "}
                                                        {routeData["NOMBRE DEL CLIENTE"]}{" "}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.includes("MUNICIPIO") && (
                                                    <TableCell>{routeData.MUNICIPIO}</TableCell>
                                                )}
                                                {visibleColumns.includes("ESTADO") && (
                                                    <TableCell>{routeData.ESTADO}</TableCell>
                                                )}
                                                {visibleColumns.includes("OBSERVACIONES") && (
                                                    <TableCell>{routeData.OBSERVACIONES}</TableCell>
                                                )}
                                                {visibleColumns.includes("TOTAL") && (
                                                    <TableCell>
                                                        {" "}
                                                        {formatCurrency(routeData.TOTAL)}{" "}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.includes("TOTAL FACTURA LT") && (
                                                    <TableCell>
                                                        {routeData.TOTAL_FACTURA_LT &&
                                                            !isNaN(parseFloat(routeData.TOTAL_FACTURA_LT))
                                                            ? formatCurrency(
                                                                parseFloat(routeData.TOTAL_FACTURA_LT)
                                                            )
                                                            : "$0.00"}
                                                    </TableCell>
                                                )}

                                                {visibleColumns.includes("NUMERO DE FACTURA") && (
                                                    <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                                                )}
                                                {visibleColumns.includes("FECHA DE FACTURA") && (
                                                    <TableCell>
                                                        {" "}
                                                        {formatDate(routeData["FECHA DE FACTURA"])}{" "}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.includes("TRANSPORTE") && (
                                                    <TableCell>{routeData.TRANSPORTE}</TableCell>
                                                )}
                                                {visibleColumns.includes("PAQUETERIA") && (
                                                    <TableCell>{routeData.PAQUETERIA}</TableCell>
                                                )}
                                                {visibleColumns.includes("GUIA") && (
                                                    <TableCell>{routeData.GUIA}</TableCell>
                                                )}
                                                {visibleColumns.includes(
                                                    "FECHA DE ENTREGA (CLIENTE)"
                                                ) && (
                                                        <TableCell>
                                                            {" "}
                                                            {formatDate(
                                                                routeData.FECHA_DE_ENTREGA_CLIENTE
                                                            )}{" "}
                                                        </TableCell>
                                                    )}

                                                <TableCell>
                                                    <Grid
                                                        container
                                                        spacing={1}
                                                        justifyContent="flex-start"
                                                        alignItems="center"
                                                    >
                                                        <Grid item>
                                                            <IconButton
                                                                onClick={() => {
                                                                    const url = getTransportUrl(
                                                                        routeData.TRANSPORTE
                                                                    );
                                                                    // console.log("Abriendo enlace:", url);
                                                                    window.open(url, "_blank");
                                                                }}
                                                                size="small"
                                                                style={{ color: "#616161" }}
                                                            >
                                                                <AirportShuttleIcon />
                                                            </IconButton>
                                                        </Grid>

                                                        <Grid item>
                                                            <IconButton
                                                                variant="contained"
                                                                style={{ color: "black" }} // Negro con texto blanco
                                                                onClick={() =>
                                                                    generatePDF(routeData["NO ORDEN"])
                                                                }
                                                            >
                                                                <ArticleIcon />
                                                            </IconButton>
                                                        </Grid>

                                                        <Grid item>
                                                            {(user?.role === "Admin" ||
                                                                user?.role === "Trans") && (
                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() =>
                                                                            eliminarRuta(routeData["NO ORDEN"])
                                                                        } // Cambiar 'row' a 'routeData'
                                                                        disabled={loading}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                )}
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Sub-tab de Directa */}
                {subTabIndex === 1 && (
                    <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <img
                                src={logo}
                                alt="Filtro"
                                style={{ width: "400px", height: "auto" }}
                            />
                            <Typography variant="h5" style={{ textAlign: "center" }}>
                                Transportes
                            </Typography>

                            <TextField
                                label="Buscar por No Orden o Nombre del Cliente"
                                value={filtroGeneral}
                                onChange={(e) => setFiltroGeneral(e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mr: 2 }}
                            />

                            <TextField
                                label="Buscar por Estado"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </div>

                        <TablePagination
                            component="div"
                            count={directaFiltrada.length} // O usa directaFiltrada.length o ventaEmpleadoFiltrada.length según la tabla
                            rowsPerPage={10} // Fijado en 10 filas por página
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            labelRowsPerPage="" // Oculta "Rows per page"
                            rowsPerPageOptions={[]} // Elimina el selector de filas
                            style={{ textAlign: "right" }}
                        />

                        <Table>
                            <TableHead>
                                <TableRow>
                                    {visibleColumns.includes("NO ORDEN") && (
                                        <TableCell>NO ORDEN</TableCell>
                                    )}
                                    {visibleColumns.includes("ESTADO") && (
                                        <TableCell>Estado del Pedido</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA") && (
                                        <TableCell>FECHA</TableCell>
                                    )}
                                    {visibleColumns.includes("NUM CLIENTE") && (
                                        <TableCell>NUM CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("MUNICIPIO") && (
                                        <TableCell>MUNICIPIO</TableCell>
                                    )}
                                    {visibleColumns.includes("ESTADO") && (
                                        <TableCell>ESTADO</TableCell>
                                    )}
                                    {visibleColumns.includes("OBSERVACIONES") && (
                                        <TableCell>OBSERVACIONES</TableCell>
                                    )}
                                    {visibleColumns.includes("TOTAL") && (
                                        <TableCell>TOTAL</TableCell>
                                    )}
                                    {visibleColumns.includes("NUMERO DE FACTURA") && (
                                        <TableCell>NUMERO DE FACTURA</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE FACTURA") && (
                                        <TableCell>FECHA DE FACTURA</TableCell>
                                    )}
                                    {visibleColumns.includes("TRANSPORTE") && (
                                        <TableCell>TRANSPORTE</TableCell>
                                    )}
                                    {visibleColumns.includes("PAQUETERIA") && (
                                        <TableCell>TIPO DE RUTA</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                                        <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>
                                    )}

                                    {visibleColumns.includes("Acciones") && (
                                        <TableCell>Acciones</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {directaData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={visibleColumns.length}
                                            style={{ textAlign: "center" }}
                                        >
                                            No hay datos disponibles.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    directaFiltrada
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // ✅ PAGINACIÓN SIN AFECTAR FILTROS
                                        .map((routeData, index) => (
                                            <TableRow key={index}>
                                                {visibleColumns.includes("NO ORDEN") && (
                                                    <TableCell>{routeData["NO ORDEN"]}</TableCell>
                                                )}

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        style={{ color: routeData.color }}
                                                    >
                                                        {routeData.statusText &&
                                                            routeData.statusText !== "Cargando..."
                                                            ? routeData.statusText
                                                            : "Cargando..."}
                                                    </Typography>
                                                </TableCell>

                                                {visibleColumns.includes("FECHA") && (
                                                    <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                                                )}
                                                {visibleColumns.includes("NUM CLIENTE") && (
                                                    <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                                                )}
                                                {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                                                    <TableCell>
                                                        {routeData["NOMBRE DEL CLIENTE"]}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.includes("MUNICIPIO") && (
                                                    <TableCell>{routeData.MUNICIPIO}</TableCell>
                                                )}
                                                {visibleColumns.includes("ESTADO") && (
                                                    <TableCell>{routeData.ESTADO}</TableCell>
                                                )}
                                                {visibleColumns.includes("OBSERVACIONES") && (
                                                    <TableCell>{routeData.OBSERVACIONES}</TableCell>
                                                )}
                                                {visibleColumns.includes("TOTAL") && (
                                                    <TableCell>
                                                        {formatCurrency(routeData.TOTAL)}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.includes("NUMERO DE FACTURA") && (
                                                    <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                                                )}
                                                {visibleColumns.includes("FECHA DE FACTURA") && (
                                                    <TableCell>
                                                        {formatDate(routeData["FECHA_DE_FACTURA"])}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.includes("TRANSPORTE") && (
                                                    <TableCell>{routeData.TRANSPORTE}</TableCell>
                                                )}
                                                {visibleColumns.includes("PAQUETERIA") && (
                                                    <TableCell>{routeData.PAQUETERIA}</TableCell>
                                                )}
                                                {visibleColumns.includes(
                                                    "FECHA DE ENTREGA (CLIENTE)"
                                                ) && (
                                                        <TableCell>
                                                            {formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}
                                                        </TableCell>
                                                    )}
                                                {visibleColumns.includes("Acciones") && (
                                                    <TableCell>
                                                        <Grid
                                                            container
                                                            spacing={1}
                                                            justifyContent="flex-start"
                                                            alignItems="center"
                                                        >
                                                            <Grid item>
                                                                {/* <Grid item>
=======
  const now = new Date().getTime();
  return now - timestamp > 24 * 60 * 60 * 1000;
};

function Tracking() {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [newRoute, setNewRoute] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [observaciones, setObservaciones] = useState({});
  const [observacionesPorRegistro, setObservacionesPorRegistro] = useState(
    () => {
      const storedObservaciones = localStorage.getItem(
        "observacionesPorRegistro"
      );
      return storedObservaciones ? JSON.parse(storedObservaciones) : {};
    }
  );

  const [tabIndex, setTabIndex] = useState(0);

  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [confirmSendModalOpen, setConfirmSendModalOpen] = useState(false);
  const [sentRoutesData, setSentRoutesData] = useState([]);

  const [totalClientes, setTotalClientes] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [selectedNoOrden, setSelectedNoOrden] = useState(null);
  const [guia, setGuia] = useState("");
  const [tipoRuta, setTipoRuta] = useState("");
  const { user } = useContext(UserContext);

  const [paqueteriaData, setPaqueteriaData] = useState([]);
  const [directaData, setDirectaData] = useState([]);
  const [ventaEmpleadoData, setVentaEmpleadoData] = useState([]);

  const [subTabIndex, setSubTabIndex] = useState(0); // Inicia en 0 para Paquetería

  const [totalFacturaLT, setTotalFacturaLT] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [paqueteria, setPaqueteria] = useState("");
  const [fechaEntregaCliente, setFechaEntregaCliente] = useState("");
  const [fechaEstimadaCliente, setFechaEstimadaCliente] = useState("");
  const [diasEntrega, setDiasEntrega] = useState("");
  const [entregaSatisfactoria, setEntregaSatisfactoria] = useState("");
  const [motivo, setMotivo] = useState("");
  const [gastosExtras, setGastosExtras] = useState("");
  const [porcentajeEnvio, setPorcentajeEnvio] = useState("");
  const [porcentajePaqueteria, setPorcentajePaqueteria] = useState("");
  const [sumaGastosExtras, setSumaGastosExtras] = useState("");
  const [porcentajeGlobal, setPorcentajeGlobal] = useState("");
  const [diferencia, setDiferencia] = useState("");
  const [noFactura, setNoFactura] = useState("");
  const [fechaFactura, setFechaFactura] = useState("");
  const [tarimas, setTarimas] = useState("");
  const [numeroFacturaLT, setNumeroFacturaLT] = useState("");
  const [total, setTotal] = useState("");

  const [prorateoFacturaLT, setProrateoFacturaLT] = useState(0);
  const [prorateoFacturaPaqueteria, setProrateoFacturaPaqueteria] = useState(0);
  const [sumaFlete, setSumaFlete] = useState(0);

  const [directaModalOpen, setDirectaModalOpen] = useState(false);
  const [selectedDirectaData, setSelectedDirectaData] = useState(null);

  const [fecha, setFecha] = useState("");
  const [numCliente, setNumCliente] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");
  const [partidas, setPartidas] = useState("");
  const [piezas, setPiezas] = useState("");
  const [zona, setZona] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const [fechaEmbarque, setFechaEmbarque] = useState("");
  const [diaEnRuta, setDiaEnRuta] = useState("");
  const [cajas, setCajas] = useState("");
  const [transporte, setTransporte] = useState("");
  const [error, setError] = useState(null);

  const [transportistaData, setTransportistaData] = useState([]);
  const [empresaData, setEmpresaData] = useState([]);

  const [tipo, setTipo] = useState(""); // Agregar esto
  const [loading, setLoading] = useState(false);
  const [calculatedTotals, setCalculatedTotals] = useState(null);

  const [totalsModalOpen, setTotalsModalOpen] = useState(false);

  const [editingClientId, setEditingClientId] = useState(null);
  const [currentObservation, setCurrentObservation] = useState("");

  const [filterOrderValue, setFilterOrderValue] = useState("");
  const [highlightedRow, setHighlightedRow] = useState(null); // Fila temporalmente resaltada

  const [historicoData, setHistoricoData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(""); // Cliente seleccionado
  const [clienteFilteredData, setClienteFilteredData] = useState([]); // 🔹 Cambio de nombre para evitar conflicto
  const [clientes, setClientes] = useState([]);

  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [columnasDisponibles, setColumnasDisponibles] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");

  const [filtro, setFiltro] = useState("");

  //estos son
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (sentRoutesData.length === 0) return;

    let filteredData = [];
    let tabName = "";

    // Filtra sentRoutesData según el tipo, según la pestaña seleccionada
    switch (subTabIndex) {
      case 0:
        filteredData = sentRoutesData.filter(
          (d) => d.TIPO?.trim().toLowerCase() === "paqueteria"
        );
        tabName = "Paquetería";
        break;
      case 1:
        filteredData = sentRoutesData.filter(
          (d) => d.TIPO?.trim().toLowerCase() === "directa"
        );
        tabName = "Directa";
        break;
      case 2:
        filteredData = sentRoutesData.filter(
          (d) => d.TIPO?.trim().toLowerCase() === "venta empleado"
        );
        tabName = "Recoge";
        break;
      case 3:
        filteredData = sentRoutesData.filter(
          (d) => d.TIPO?.trim().toLowerCase() === "asignacion"
        );
        tabName = "Asignación";
        filteredData = sentRoutesData.filter((d) =>
          ["paqueteria", "directa"].includes(d.TIPO?.trim().toLowerCase())
        );
        tabName = "Asignación";
        break;
      default:
        return;
    }

    // Si todos los elementos ya tienen un status válido, no es necesario llamar a la API
    if (
      !filteredData.some((d) => !d.statusText || d.statusText === "Cargando...")
    ) {
      return;
    }

    // Evita llamadas en paralelo
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    console.log(`🔍 Se ejecutará fetchStatuses para la pestaña: ${tabName}`);
    fetchStatuses(filteredData, tabName)
      .catch((error) => console.error(error))
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [subTabIndex, sentRoutesData]);

  const fetchStatuses = async (data, tabName) => {
    if (data.length === 0) return;

    console.log(`📌 Buscando estado de pedidos en la pestaña: ${tabName}`);
    const orderNumbers = data.map((d) => d["NO ORDEN"]);
    console.log("📌 Enviando estos números de orden:", orderNumbers);

    try {
      const response = await axios.post(
        `http://66.232.105.87:3007/api/Ventas/status`,
        { orderNumbers }
      );
      console.log(`✅ Respuesta recibida para ${tabName}:`, response.data);

      const statusMap = response.data;

      // Actualiza el estado de Paquetería
      setPaqueteriaData((prevData) =>
        prevData.map((route) =>
          statusMap[route["NO ORDEN"]]
            ? {
                ...route,
                // Si la API trae un statusText, lo usamos. Si no, conservamos el que ya tenía.
                statusText:
                  statusMap[route["NO ORDEN"]].statusText || route.statusText,
                // Asigna el color devuelto por la API. Si no hay color, conserva el anterior.
                color: statusMap[route["NO ORDEN"]].color || route.color,
              }
            : route
        )
      );

      // Actualiza el estado de Directa
      setDirectaData((prevData) =>
        prevData.map((route) =>
          statusMap[route["NO ORDEN"]]
            ? {
                ...route,
                statusText:
                  statusMap[route["NO ORDEN"]].statusText || route.statusText,
                color: statusMap[route["NO ORDEN"]].color || route.color,
              }
            : route
        )
      );

      // Actualiza el estado de Venta Empleado
      setVentaEmpleadoData((prevData) =>
        prevData.map((route) =>
          statusMap[route["NO ORDEN"]]
            ? {
                ...route,
                statusText:
                  statusMap[route["NO ORDEN"]].statusText || route.statusText,
                color: statusMap[route["NO ORDEN"]].color || route.color,
              }
            : route
        )
      );

      // Actualiza también el arreglo original (sentRoutesData) para que el próximo filtrado ya tenga el color
      setSentRoutesData((prevData) =>
        prevData.map((route) =>
          statusMap[route["NO ORDEN"]]
            ? {
                ...route,
                statusText:
                  statusMap[route["NO ORDEN"]].statusText || route.statusText,
                color: statusMap[route["NO ORDEN"]].color || route.color,
              }
            : route
        )
      );
    } catch (error) {
      console.error(`❌ Error en la API para ${tabName}:`, error);

      // En caso de error, asigna "Error en estado" a los registros
      setPaqueteriaData((prevData) =>
        prevData.map((route) => ({
          ...route,
          statusText: route.statusText || "Error en estado",
        }))
      );
      setDirectaData((prevData) =>
        prevData.map((route) => ({
          ...route,
          statusText: route.statusText || "Error en estado",
        }))
      );
      setVentaEmpleadoData((prevData) =>
        prevData.map((route) => ({
          ...route,
          statusText: route.statusText || "Error en estado",
        }))
      );
      setSentRoutesData((prevData) =>
        prevData.map((route) => ({
          ...route,
          statusText: route.statusText || "Error en estado",
        }))
      );
    }
  };

  //estos son lo del estatus

  const handleRowClick = (routeData) => {
    // console.log("Route Data:", routeData); // Esto te ayudará a verificar qué datos están siendo pasados
    setTotalValue(routeData.TOTAL);
  };

  const handleChangeSubTab = (event, newValue) => {
    setSubTabIndex(newValue); // Cambia el índice de la subpestaña seleccionada
  };

  useEffect(() => {
    const storedData = localStorage.getItem("transporteData");
    const storedGroupedData = localStorage.getItem("transporteGroupedData");
    const storedTimestamp = localStorage.getItem("transporteTimestamp");

    if (storedData && storedGroupedData && storedTimestamp) {
      if (hasExpired(Number(storedTimestamp))) {
        // Si los datos han caducado, limpiar localStorage
        localStorage.removeItem("transporteData");
        localStorage.removeItem("transporteGroupedData");
        localStorage.removeItem("transporteTimestamp");
      } else {
        // Si los datos son válidos, cargarlos al estado
        setData(JSON.parse(storedData));
        setGroupedData(JSON.parse(storedGroupedData));
      }
    }
  }, []);

  useEffect(() => {
    if (
      data.length > 0 ||
      Object.keys(groupedData).length > 0 ||
      sentRoutesData.length > 0
    ) {
      localStorage.setItem("transporteData", JSON.stringify(data));
      localStorage.setItem(
        "transporteGroupedData",
        JSON.stringify(groupedData)
      );
      localStorage.setItem("sentRoutesData", JSON.stringify(sentRoutesData)); // Guardar los datos de la segunda tabla
      localStorage.setItem("transporteTimestamp", new Date().getTime());
    }
  }, [data, groupedData, sentRoutesData]);

  useEffect(() => {
    fetchPaqueteriaRoutes();
  }, []);

  const [asignacionData, setAsignacionData] = useState([]);

  useEffect(() => {
    const paqueteria = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "paqueteria"
    );
    const directa = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "directa"
    );
    const ventaEmpleado = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "venta empleado"
    );
    const asignacion = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "asignacion"
    );

    setPaqueteriaData(paqueteria);
    setDirectaData(directa);
    setVentaEmpleadoData(ventaEmpleado);
    setAsignacionData(asignacion); // ✅ Agregado
  }, [sentRoutesData]);

  useEffect(() => {
    if (total && prorateoFacturaLT) {
      const porcentajeEnvio = (prorateoFacturaLT / total) * 100;
      setPorcentajeEnvio(porcentajeEnvio.toFixed(2)); // Redondear a 2 decimales
    } else {
      setPorcentajeEnvio(""); // Limpiar si no hay valores válidos
    }
  }, [total, prorateoFacturaLT]);

  useEffect(() => {
    if (total && prorateoFacturaPaqueteria) {
      const porcentajePaqueteria = (prorateoFacturaPaqueteria / total) * 100;
      setPorcentajePaqueteria(porcentajePaqueteria.toFixed(2)); // Redondear a 2 decimales
    } else {
      setPorcentajePaqueteria(""); // Limpiar si no hay valores válidos
    }
  }, [total, prorateoFacturaPaqueteria]);

  useEffect(() => {
    // Convertimos a número y verificamos si es NaN
    const prorateoLTNum = parseFloat(prorateoFacturaLT) || 0;
    const prorateoPaqueteriaNum = parseFloat(prorateoFacturaPaqueteria) || 0;
    const gastosExtrasNum = parseFloat(gastosExtras) || 0;
    // Realizamos la suma
    const sumaTotal = prorateoLTNum + prorateoPaqueteriaNum + gastosExtrasNum;

    setSumaGastosExtras(sumaTotal.toFixed(2)); // Redondear a 2 decimales
  }, [prorateoFacturaLT, prorateoFacturaPaqueteria, gastosExtras]);

  useEffect(() => {
    if (total && sumaGastosExtras) {
      const porcentaje =
        (parseFloat(sumaGastosExtras) / parseFloat(total)) * 100;
      // console.log("Porcentaje Global calculado:", porcentaje);
      setPorcentajeGlobal(porcentaje.toFixed(2)); // Redondear a 2 decimales
    } else {
      setPorcentajeGlobal("");
    }
  }, [total, sumaGastosExtras]);

  useEffect(() => {
    if (total && sumaGastosExtras) {
      const porcentaje =
        (parseFloat(sumaGastosExtras) / parseFloat(total)) * 100;
      // console.log("Porcentaje Global calculado:", porcentaje);
      setPorcentajeGlobal(porcentaje.toFixed(2)); // Redondear a 2 decimales
    } else {
      setPorcentajeGlobal("");
    }
  }, [total, sumaGastosExtras]);

  useEffect(() => {
    fetchTransportistas();
    fetchEmpresas();
  }, []);

  useEffect(() => {
    data.forEach((row) => {
      const clienteKey = row["NUM. CLIENTE"].toString().trim();
      if (!observacionesPorRegistro[clienteKey]) {
        fetchObservacionPorRegistro(clienteKey);
      }
    });
  }, [data]);

  const exportToImage = () => {
    const element = document.getElementById("data-to-capture");

    html2canvas(element).then((canvas) => {
      // Crea una URL de la imagen generada
      const imageUrl = canvas.toDataURL("image/png");

      // Crea un enlace para descargar la imagen
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "Resumen_Rutas.png"; // Nombre del archivo de la imagen
      link.click();
    });
  };

  const handleChangeTab = (event, newValue) => {
    setTabIndex(newValue);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const mapColumns = (row) => ({
    RUTA: "Sin Ruta",
    FECHA: row["Fecha Lista Surtido"],
    "NO ORDEN": row["No Orden"] || row["__EMPTY_1"] || "",
    "NO FACTURA": row["No Factura"] || row["__EMPTY_4"] || "",
    "NUM. CLIENTE":
      row["No Dir Entrega"] || row["Cliente"] || row["__EMPTY_8"] || "",
    "NOMBRE DEL CLIENTE": row["Nombre Cliente"] || row["__EMPTY_11"] || "",
    Codigo_Postal: row["Codigo Postal"] || row["__EMPTY_14"] || "",
    ZONA: row["Zona"] || row["__EMPTY_10"] || "",
    MUNICIPIO:
      row["Municipio"] ||
      row["Municipo"] ||
      row["__EMPTY_12"] ||
      row["__EMPTY_13"] ||
      "",
    ESTADO: row["Estado"] || row["__EMPTY_15"] || "",
    OBSERVACIONES: "",
    TOTAL:
      parseFloat(
        String(row["Total"] || row["__EMPTY_21"] || "0").replace(",", "")
      ) || 0,
    PARTIDAS: Number(row["Partidas"] || row["__EMPTY_22"] || 0),
    PIEZAS: Number(row["Cantidad"] || row["__EMPTY_23"] || 0),
    DIRECCION: `${row["Calle"] || ""} ${row["Colonia"] || ""} ${
      row["Municipio"] || ""
    } ${row["Codigo Postal"] || ""} ${row["Estado"] || ""}`,
    CORREO: row["E-mail"] || "",
    TELEFONO: row["No. Telefonico"] || "",
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        range: 6, // Omitir las primeras 6 filas
      });

      // 🔹 Obtener los pedidos que YA están en una ruta (groupedData)
      const pedidosEnRuta = new Set();
      Object.values(groupedData).forEach((route) => {
        route.rows.forEach((row) => {
          pedidosEnRuta.add(row["NO ORDEN"]);
        });
      });

      // 🔹 Función para obtener los últimos 3 días hábiles (sin contar fines de semana)
      const getLastBusinessDays = (numDays) => {
        const businessDays = [];
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        while (businessDays.length < numDays) {
          if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
            businessDays.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() - 1);
        }
        return businessDays;
      };

      const lastBusinessDays = getLastBusinessDays(5); // Últimos 5 días hábiles

      // 🔹 Filtrar datos SOLO de los últimos 3 días hábiles con 'Lista Surtido'
      const filteredData = jsonData
        .map((row) => {
          if (!row["Fecha Lista Surtido"]) {
            console.warn("⚠️ Registro sin fecha:", row);
            return null;
          }

          let rowDate;
          if (typeof row["Fecha Lista Surtido"] === "number") {
            rowDate = new Date(
              (row["Fecha Lista Surtido"] - 25569) * 86400 * 1000
            );
          } else {
            const dateParts = row["Fecha Lista Surtido"].split("/");
            if (dateParts.length === 3) {
              rowDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            } else {
              rowDate = new Date(row["Fecha Lista Surtido"]);
            }
          }

          if (isNaN(rowDate.getTime())) {
            console.warn(
              "🚨 Fecha inválida detectada:",
              row["Fecha Lista Surtido"]
            );
            return null;
          }

          rowDate.setHours(0, 0, 0, 0);
          row.rowDateObject = rowDate;

          return lastBusinessDays.some(
            (bd) => bd.toDateString() === rowDate.toDateString()
          ) && row["Estatus"] === "Lista Surtido"
            ? row
            : null;
        })
        .filter(Boolean);

      // 🔹 Ordenar por fecha de manera descendente
      const sortedData = filteredData.sort(
        (a, b) => b.rowDateObject - a.rowDateObject
      );

      // 🔹 Mapea los datos filtrados y FILTRA los pedidos ya asignados
      const mappedData = sortedData
        .map(mapColumns)
        .filter(
          (row) => row["NO ORDEN"] && !pedidosEnRuta.has(row["NO ORDEN"])
        );

      console.log("✅ Pedidos filtrados (sin duplicados):", mappedData);

      // 🔹 Extraer facturados solo de los últimos 5 días hábiles
      const facturados = jsonData
        .filter((row) => row["Estatus"] === "Factura")
        .map((row) => {
          let rowDate;
          if (typeof row["Fecha Lista Surtido"] === "number") {
            rowDate = new Date(
              (row["Fecha Lista Surtido"] - 25569) * 86400 * 1000
            );
          } else {
            const dateParts = row["Fecha Lista Surtido"].split("/");
            if (dateParts.length === 3) {
              rowDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            } else {
              rowDate = new Date(row["Fecha Lista Surtido"]);
            }
          }
          rowDate.setHours(0, 0, 0, 0);
          return lastBusinessDays.some(
            (bd) => bd.toDateString() === rowDate.toDateString()
          )
            ? row
            : null;
        })
        .filter(Boolean);

      if (facturados.length > 0) {
        const facturadosCleaned = facturados.map((row) =>
          String(row["No Orden"]).trim()
        );
        const pedidoIds = facturadosCleaned.join(", ");
        const userInput = prompt(
          `Se encontraron pedidos facturados: ${pedidoIds}\nIngrese los números de orden que desea insertar, separados por comas o deje vacío para insertarlos todos:`
        );

        if (userInput) {
          const ordenesSeleccionadas = userInput
            .split(",")
            .map((num) => num.trim());

          const pedidosSeleccionados = facturados.filter((row) =>
            ordenesSeleccionadas.includes(String(row["No Orden"]).trim())
          );

          const mappedFacturados = pedidosSeleccionados.map(mapColumns);

          setData([...mappedData, ...mappedFacturados]);
        } else {
          setData([...mappedData, ...facturados.map(mapColumns)]);
        }
      } else {
        setData(mappedData);
      }
    };

    reader.readAsBinaryString(file);
  };

  const cleanAddress = (address) => {
    if (!address) return "No disponible"; // Si no hay dirección, devolvemos 'No disponible'

    // Eliminar espacios al principio y al final
    let cleanedAddress = address.trim();

    // Reemplazar múltiples espacios consecutivos por un solo espacio
    cleanedAddress = cleanedAddress.replace(/\s+/g, " ");

    // Eliminar caracteres especiales no deseados (puedes personalizar esta lista)
    cleanedAddress = cleanedAddress.replace(/[^\w\s,.-]/g, "");

    return cleanedAddress;
  };

  const addRoute = () => {
    if (newRoute.trim() === "") {
      alert("⚠️ El nombre de la ruta no puede estar vacío.");
      return;
    }

    if (groupedData[newRoute]) {
      alert("⚠️ Esta ruta ya existe.");
      return;
    }

    // Agregar la nueva ruta al estado groupedData
    setGroupedData((prevGroupedData) => ({
      ...prevGroupedData,
      [newRoute]: { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0, rows: [] },
    }));

    // ✅ Agregar la ruta a las opciones del Autocomplete
    setOptions((prevOptions) => [...prevOptions, newRoute]);

    // Limpiar el campo de entrada después de agregar la ruta
    setNewRoute("");
  };

  const assignToRoute = (item, route) => {
    setGroupedData((prev) => {
      const updatedRoute = prev[route] || {
        TOTAL: 0,
        PARTIDAS: 0,
        PIEZAS: 0,
        rows: [],
      };

      // Verificar si el pedido ya está en la ruta antes de agregarlo
      const pedidoExiste = updatedRoute.rows.some(
        (row) => row["NO ORDEN"] === item["NO ORDEN"]
      );

      if (!pedidoExiste) {
        updatedRoute.rows.push({
          ...item,
          OBSERVACIONES:
            observacionesPorRegistro[item["NUM. CLIENTE"]] ||
            item.OBSERVACIONES ||
            "Sin observaciones disponibles",
        });

        updatedRoute.TOTAL += item.TOTAL;
        updatedRoute.PARTIDAS += item.PARTIDAS;
        updatedRoute.PIEZAS += item.PIEZAS;
      }

      return { ...prev, [route]: updatedRoute };
    });

    // Filtrar los pedidos asignados para que no se dupliquen
    setData((prevData) =>
      prevData.filter((row) => row["NO ORDEN"] !== item["NO ORDEN"])
    );
  };

  useEffect(() => {
    if (sentRoutesData.length > 0) {
      const uniqueOrders = new Set();
      const cleanedData = sentRoutesData.filter((routeData) => {
        const claveUnica = `${routeData["NO ORDEN"]}_${routeData["tipo_original"]}`;
        if (!uniqueOrders.has(claveUnica)) {
          uniqueOrders.add(claveUnica);
          return true;
        }
        return false;
      });

      setSentRoutesData(cleanedData);
    }
  }, [sentRoutesData]);

  const cleanDuplicatedOrders = () => {
    setGroupedData((prev) => {
      const newGroupedData = {};

      Object.keys(prev).forEach((route) => {
        const ordersSet = new Set();
        newGroupedData[route] = {
          ...prev[route],
          rows: prev[route].rows.filter((row) => {
            if (!ordersSet.has(row["NO ORDEN"])) {
              ordersSet.add(row["NO ORDEN"]);
              return true;
            }
            return false;
          }),
        };
      });

      return newGroupedData;
    });

    console.log("🚀 Se eliminaron pedidos duplicados en las rutas.");
  };

  useEffect(() => {
    cleanDuplicatedOrders();
  }, []);

  useEffect(() => {
    let clientesSet = new Set();
    let pedidosSet = new Set();
    let totalGeneral = 0;

    // Recuperar valores previos de localStorage si existen
    const prevClientes =
      JSON.parse(localStorage.getItem("totalClientes")) || [];
    const prevPedidos = JSON.parse(localStorage.getItem("totalPedidos")) || [];
    const prevTotalGeneral =
      JSON.parse(localStorage.getItem("totalGeneral")) || 0;

    // Convertimos prevClientes y prevPedidos en Sets para evitar duplicados
    let clientesAcumulados = new Set(prevClientes);
    let pedidosAcumulados = new Set(prevPedidos);
    let totalAcumulado = prevTotalGeneral;

    Object.keys(groupedData).forEach((route) => {
      const routeData = groupedData[route];

      if (routeData && Array.isArray(routeData.rows)) {
        routeData.rows.forEach((row) => {
          let clienteKey = Object.keys(row).find((key) =>
            key.toLowerCase().includes("cliente")
          );

          if (
            clienteKey &&
            row[clienteKey] !== undefined &&
            row[clienteKey] !== null
          ) {
            clientesAcumulados.add(row[clienteKey]); // Acumular clientes únicos
          }

          if (row["NO ORDEN"] !== undefined && row["NO ORDEN"] !== null) {
            pedidosAcumulados.add(row["NO ORDEN"]); // Acumular pedidos únicos
          }

          if (row.TOTAL && !isNaN(row.TOTAL)) {
            totalGeneral += Number(row.TOTAL); // Sumar solo los nuevos valores
          }
        });
      }
    });

    // ✅ Asegurar que el total no disminuya
    totalAcumulado = Math.max(totalAcumulado, prevTotalGeneral + totalGeneral);

    // Guardar en localStorage
    localStorage.setItem(
      "totalClientes",
      JSON.stringify([...clientesAcumulados])
    );
    localStorage.setItem(
      "totalPedidos",
      JSON.stringify([...pedidosAcumulados])
    );
    localStorage.setItem("totalGeneral", JSON.stringify(totalAcumulado));

    // Actualizar los estados con valores acumulados
    setTotalClientes(clientesAcumulados.size);
    setTotalPedidos(pedidosAcumulados.size);
    setTotalGeneral(totalAcumulado);
  }, [groupedData]);

  const handleShowTotal = () => {
    setTotalsModalOpen(true);
  };

  const calculateTotalClientes = (rutasSeleccionadas) => {
    const clientesSet = new Set();

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        routeData.rows.forEach((row) => {
          if (row["NUM CLIENTE"]) {
            clientesSet.add(row["NUM CLIENTE"]);
          }
        });
      }
    });

    return clientesSet.size;
  };

  const calculateTotalPedidos = (rutasSeleccionadas) => {
    const pedidosSet = new Set();

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        routeData.rows.forEach((row) => {
          if (row["NO ORDEN"]) {
            pedidosSet.add(row["NO ORDEN"]); // Usamos el número de orden para contar pedidos únicos
          }
        });
      }
    });

    return pedidosSet.size;
  };

  const calculateTotalGeneral = (rutasSeleccionadas) => {
    let totalGeneral = 0;

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        routeData.rows.forEach((row) => {
          if (row.TOTAL && !isNaN(row.TOTAL)) {
            totalGeneral += row.TOTAL;
          }
        });
      }
    });

    return totalGeneral;
  };

  const renameRoute = (oldRouteName, newRouteName) => {
    if (!newRouteName.trim()) {
      alert("⚠️ El nombre de la ruta no puede estar vacío.");
      return;
    }

    setGroupedData((prev) => {
      // Si la ruta original no existe, no hacer nada
      if (!prev[oldRouteName]) {
        alert("⚠️ La ruta original no existe.");
        return prev;
      }

      // Si la nueva ruta ya existe, evita la sobrescritura
      if (prev[newRouteName]) {
        alert("⚠️ Ya existe una ruta con ese nombre. Elige otro.");
        return prev;
      }

      // Crear una nueva clave con el nuevo nombre, copiando los datos de la anterior
      const updatedData = { ...prev, [newRouteName]: prev[oldRouteName] };

      // Eliminar la ruta antigua SOLO después de asegurarnos de que la nueva existe
      delete updatedData[oldRouteName];

      // Guardar cambios en localStorage para persistencia
      localStorage.setItem(
        "transporteGroupedData",
        JSON.stringify(updatedData)
      );

      console.log(
        `✅ Ruta renombrada de '${oldRouteName}' a '${newRouteName}' sin perder datos.`
      );
      return updatedData;
    });

    // Cerrar edición después de renombrar
    setEditingRoute(null);
  };

  const [editingRoute, setEditingRoute] = useState(null);
  const [newRouteName, setNewRouteName] = useState("");

  const openModal = (route) => {
    setSelectedRoute(route);
    setModalOpen(true);

    const firstRow = groupedData[route]?.rows?.[0];
    if (firstRow) {
      fetchObservacionPorRegistro(firstRow["NUM. CLIENTE"]); // ✅ Corrección
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRoute(null);
    setObservaciones(""); // Limpiar observaciones
  };

  const calculateTotals = (route) => {
    const routeData = groupedData[route] || { rows: [] };
    return routeData.rows.reduce(
      (totals, row) => {
        totals.TOTAL += row.TOTAL;
        totals.PARTIDAS += row.PARTIDAS;
        totals.PIEZAS += row.PIEZAS;
        return totals;
      },
      { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0 }
    );
  };

  const removeFromRoute = (item, route) => {
    setGroupedData((prev) => {
      const updatedRoute = { ...prev[route] };
      updatedRoute.rows = updatedRoute.rows.filter((row) => row !== item);
      updatedRoute.TOTAL -= item.TOTAL;
      updatedRoute.PARTIDAS -= item.PARTIDAS;
      updatedRoute.PIEZAS -= item.PIEZAS;

      return { ...prev, [route]: updatedRoute };
    });

    // Devolver el registro a la tabla principal
    setData((prevData) => [...prevData, item]);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("transporteTimestamp");
    setData([]);
    handleSnackbarOpen(
      "Datos eliminados correctamente. Carga un nuevo archivo Excel para comenzar."
    );
  };

  const fetchPaqueteriaRoutes = async ({
    filtro = "",
    desde = "",
    hasta = "",
    mes = "",
  } = {}) => {
    try {
      let url = `http://66.232.105.87:3007/api/Ventas/rutas?expandir=true`;

      if (filtro) url += `&guia=${filtro}`;
      if (desde && hasta) url += `&desde=${desde}&hasta=${hasta}`;
      if (mes) url += `&mes=${mes}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("📦 Data recibida desde API:", data);

      if (Array.isArray(data)) {
        setSentRoutesData(data); // Aquí actualizas la tabla
      }
    } catch (error) {
      console.error("Error al obtener rutas:", error);
    }
  };

  useEffect(() => {
    if (!Array.isArray(sentRoutesData) || sentRoutesData.length === 0) {
      console.warn(
        "⚠ No hay datos en sentRoutesData, las tablas estarán vacías"
      );
      return;
    }

    const getTipo = (item) =>
      (item.TIPO || item.tipo_original || "").toLowerCase().trim();

    const paqueteria = sentRoutesData.filter(
      (item) => getTipo(item) === "paqueteria"
    );
    const directa = sentRoutesData.filter(
      (item) => getTipo(item) === "directa"
    );
    const ventaEmpleado = sentRoutesData.filter(
      (item) => getTipo(item) === "venta empleado"
    );

    setPaqueteriaData(paqueteria);
    setDirectaData(directa);
    setVentaEmpleadoData(ventaEmpleado);
  }, [sentRoutesData]);

  useEffect(() => {
    console.log("🔄 Cambio de pestaña activa:", subTabIndex);
  }, [subTabIndex]);

  const fetchAdditionalData = async (noOrden) => {
    try {
      const url = `http://66.232.105.87:3007/api/Ventas/pedido/detalles/${noOrden}`; // Usamos el parámetro en la URL
      const response = await fetch(url);
      const data = await response.json();

      return {
        ultimaFechaEmbarque: data.ultimaFechaEmbarque,
        totalCajas: data.totalCajas,
      };
    } catch (error) {
      console.error("Error al obtener los datos adicionales:", error.message);
      return {};
    }
  };

  const handleSnackbarOpen = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchObservacionPorRegistro = async () => {
    const clientesUnicos = [
      ...new Set(sentRoutesData.map((route) => route["NUM. CLIENTE"])), // Extraer los clientes únicos
    ];

    if (clientesUnicos.length === 0) return;

    try {
      const response = await axios.post(
        "http://66.232.105.87:3007/api/Ventas/clientes/observaciones",
        { clientes: clientesUnicos }
      );

      const observaciones = response.data;

      // Actualizar la tabla con las observaciones recibidas
      const updatedRoutes = sentRoutesData.map((route) => ({
        ...route,
        OBSERVACIONES:
          observaciones[route["NUM. CLIENTE"]] || "Sin observaciones",
      }));

      setSentRoutesData(updatedRoutes); // Actualiza el estado
    } catch (error) {
      console.error("Error al obtener observaciones:", error);
    }
  };

  const handleSelectRoute = (route) => {
    // console.log("Ruta seleccionada:", route);

    // Actualiza las rutas seleccionadas
    setSelectedRoutes((prevRoutes) => {
      const newSelectedRoutes = prevRoutes.includes(route)
        ? prevRoutes.filter((r) => r !== route) // Desmarcar ruta
        : [...prevRoutes, route]; // Marcar ruta

      // Recalcular los totales incluyendo todas las rutas
      let totalClientes = 0;
      let totalPedidos = 0;
      let totalGeneral = 0;

      // Aquí recorremos todas las rutas, no solo las seleccionadas
      Object.keys(groupedData).forEach((routeKey) => {
        const routeData = groupedData[routeKey];
        if (routeData) {
          totalClientes += routeData.rows.length;
          totalPedidos += routeData.rows.reduce(
            (sum, row) => sum + (row.PARTIDAS || 0),
            0
          );
          totalGeneral += routeData.rows.reduce(
            (sum, row) => sum + (row.TOTAL || 0),
            0
          );
        }
      });

      // Actualiza los totales basados en todas las rutas, no solo las seleccionadas
      setTotalClientes(totalClientes);
      setTotalPedidos(totalPedidos);
      setTotalGeneral(totalGeneral);

      return newSelectedRoutes;
    });
  };

  const handleSendRoutes = async () => {
    if (selectedRoutes.length > 0) {
      const newSentRoutesData = [];

      selectedRoutes.forEach((route) => {
        const routeData = groupedData[route];

        if (routeData && routeData.rows) {
          routeData.rows.forEach((row) => {
            let tipoRutaActual = row.TIPO
              ? row.TIPO.toLowerCase()
              : tipoRuta.toLowerCase();

            let guiaEnviar = row.GUIA || "";

            if (
              tipoRutaActual === "directa" ||
              tipoRutaActual === "venta empleado"
            ) {
              guiaEnviar = "NA";
            }

            newSentRoutesData.push({
              ...row, // Mantener todos los detalles de la fila
              routeName: route, // Mantener el nombre de la ruta
              OBSERVACIONES:
                row.OBSERVACIONES ||
                observacionesPorRegistro[row["NUM. CLIENTE"]] ||
                "Sin observaciones disponibles",
              TIPO: tipoRutaActual, // ✅ Asegurar que se inserta el tipo correcto
              GUIA: guiaEnviar, // ✅ Asignar "NA" si es Directa o Venta Empleado
            });
          });
        } else {
          console.warn(`⚠ Ruta ${route} no tiene datos o filas definidas.`);
        }
      });

      try {
        const response = await fetch(
          "http://66.232.105.87:3007/api/Ventas/insertarRutas",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rutas: newSentRoutesData }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          handleSnackbarOpen("Rutas enviadas con éxito y registradas.");

          setSentRoutesData((prevData) => [...prevData, ...newSentRoutesData]);

          setGroupedData((prevData) => {
            const newGroupedData = { ...prevData };
            selectedRoutes.forEach((route) => {
              delete newGroupedData[route];
            });
            return newGroupedData;
          });

          setTotalClientes((prev) => -selectedRoutes.length);
          setTotalPedidos((prev) => -selectedRoutes.length);
          setTotalGeneral((prev) => -selectedRoutes.length);
        } else {
          handleSnackbarOpen("⚠ Hubo un error al registrar las rutas.");
        }
      } catch (error) {
        console.error("❌ Error al enviar las rutas:", error);
        handleSnackbarOpen("Error al enviar las rutas.");
      }

      setConfirmSendModalOpen(false);
    } else {
      handleSnackbarOpen("⚠ Por favor, selecciona al menos una ruta.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";

    const safeDate = dateString.includes(" ")
      ? dateString.replace(" ", "T")
      : dateString;

    const date = new Date(safeDate);
    if (isNaN(date)) return "Fecha inválida";

    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("es-MX", options);
  };

  const handleGenerateRoutes = () => {
    if (!tipoRuta) {
      handleSnackbarOpen(
        "Por favor, selecciona un tipo de ruta antes de mandar."
      );
      return;
    }

    if (selectedRoutes.length > 0) {
      setConfirmSendModalOpen(true);

      // Verifica que hay datos en las rutas seleccionadas
      const rutasConDatos = selectedRoutes.filter(
        (route) => groupedData[route]?.rows?.length > 0
      );

      if (rutasConDatos.length > 0) {
        const totalClientes = calculateTotalClientes(rutasConDatos);
        const totalPedidos = calculateTotalPedidos(rutasConDatos);
        const totalGeneral = calculateTotalGeneral(rutasConDatos);

        // Actualizamos los estados para mostrar los datos en el modal
        setTotalClientes(totalClientes);
        setTotalPedidos(totalPedidos);
        setTotalGeneral(totalGeneral);
      } else {
        handleSnackbarOpen("Las rutas seleccionadas no tienen datos.");
      }
    } else {
      handleSnackbarOpen("Por favor, selecciona al menos una ruta.");
    }
  };

  const handleProrateoFacturaLTChange = (e) => {
    const value = parseFloat(e.target.value) || 0; // Convertir a número
    setProrateoFacturaLT(value); // Actualiza el valor en el estado
  };

  const actualizarGuia = async () => {
    if (!selectedNoOrden || !guia) {
      console.error("❌ Error: Faltan datos para actualizar.");
      alert("Error: Falta la guía o el número de orden.");
      return;
    }

    try {
      const url = `http://66.232.105.87:3007/api/Ventas/paqueteria/actualizar-guia/${selectedNoOrden}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guia,
          paqueteria,
          fechaEntregaCliente,
          diasEntrega,
          entregaSatisfactoria,
          motivo,
          totalFacturaLT,
          prorateoFacturaLT,
          prorateoFacturaPaqueteria,
          gastosExtras,
          sumaFlete,
          porcentajeEnvio,
          porcentajePaqueteria,
          sumaGastosExtras,
          porcentajeGlobal,
          diferencia,
          noFactura,
          fechaFactura,
          tarimas,
          numeroFacturaLT,
          observaciones,
        }),
      });

      if (response.ok) {
        console.log("✅ Guía actualizada correctamente.");
        alert("✅ Guía actualizada correctamente.");

        // Cerrar el modal después de la actualización
        setDirectaModalOpen(false);

        // Actualizar los datos en la tabla sin recargar la página
        fetchPaqueteriaRoutes();
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar:", errorData);
        alert("❌ Error al actualizar la guía: " + errorData.message);
      }
    } catch (error) {
      console.error("❌ Error en la actualización:", error);
      alert("Error en la actualización de la guía.");
    }
  };

  const getVisibleColumns = (role) => {
    // Definir todas las columnas posibles
    const allColumns = [
      {
        name: "NO ORDEN",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Paquet",
          "Control",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "ESTADO",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Paquet",
          "Embar",
          "Control",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "FECHA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Paquet",
          "Embar",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "NUM CLIENTE",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Paquet",
          "Embar",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "NOMBRE DEL CLIENTE",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Control",
          "Paquet",
          "Embar",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "MUNICIPIO",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Paquet",
          "Embar",
          "Rep",
        ],
      },
      {
        name: "ESTADO",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "EB1",
          "Paquet",
          "Embar",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "OBSERVACIONES",
        role: ["Admin", "Master", "Trans", "PQ1", "Paquet", "Embar", "Rep"],
      },
      {
        name: "TOTAL",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "PQ1",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "PARTIDAS",
        role: ["Admin", "Master", "Trans", "Rep", "Control", "Embar"],
      },
      {
        name: "PIEZAS",
        role: ["Admin", "Master", "Trans", "Rep", "Control", "Embar"],
      },
      { name: "ZONA", role: ["Admin", "Master", "Rep", "Trans"] },
      { name: "TIPO DE ZONA", role: ["Admin", "Master", "Rep", "Trans"] },
      {
        name: "NUMERO DE FACTURA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "Control",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "FECHA DE FACTURA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "Control",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "FECHA DE EMBARQUE",
        role: [
          "Admin",
          "Master",
          "Rep",
          "Trans",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "DIA EN QUE ESTA EN RUTA",
        role: ["Admin", "Master", "Trans", "Rep", "EB1", "Embar"],
      },
      {
        name: "HORA DE SALIDA",
        role: ["Admin", "Master", "Trans", "Rep", "EB1", "Embar"],
      },
      {
        name: "CAJAS",
        role: ["Admin", "Master", "Trans", "Rep", "PQ1", "Paquet"],
      },
      { name: "TARIMAS", role: ["Admin", "Master", "Trans", "Rep", "Paquet"] },
      {
        name: "TRANSPORTE",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "PQ1",
          "Paquet",
          "Control",
          "Vent",
          "Tran",
          "Audi",
          "Rep",
          "VENT",
        ],
      },
      {
        name: "PAQUETERIA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "PQ1",
          "Paquet",
          "Control",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
          "VENT",
        ],
      },
      {
        name: "GUIA",
        role: [
          "Admin",
          "Master",
          "Rep",
          "Trans",
          "PQ1",
          "Paquet",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "FECHA DE ENTREGA (CLIENTE)",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "PQ1",
          "Paquet",
          "Embar",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "FECHA ESTIMADA DE ENTREGA",
        role: ["Admin", "Master", "Trans", "PQ1", "Rep"],
      },
      {
        name: "DIAS DE ENTREGA",
        role: ["Admin", "Master", "Trans", "PQ1", "Rep"],
      },
      {
        name: "ENTREGA SATISFACTORIA O NO SATISFACTORIA",
        role: ["Admin", "Master", "Trans", "PQ1", "Paquet", "Rep"],
      },
      { name: "MOTIVO", role: ["Admin", "Master", "Trans"] },
      {
        name: "NUMERO DE FACTURA LT",
        role: ["Admin", "Master", "Trans", "Rep"],
      },
      {
        name: "TOTAL FACTURA LT",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Paquet",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "PRORRATEO $ FACTURA LT",
        role: ["Admin", "Master", "Trans", "Rep"],
      },
      {
        name: "PRORRATEO $ FACTURA PAQUETERIA",
        role: ["Admin", "Master", "Trans", "Rep"],
      },
      { name: "GASTOS EXTRAS", role: ["Admin", "Master", "Trans", "Rep"] },
      { name: "SUMA FLETE", role: ["Admin", "Master", "Trans", "Rep"] },
      { name: "% ENVIO", role: ["Admin", "Master", "Trans", "Rep"] },
      { name: "% PAQUETERIA", role: ["Admin", "Master", "Trans", "Rep"] },
      { name: "SUMA GASTOS EXTRAS", role: ["Admin", "Master", "Trans", "Rep"] },
      { name: "% GLOBAL", role: ["Admin", "Master", "Trans", "Rep"] },
      { name: "DIFERENCIA", role: ["Admin", "Master", "Trans", "Rep"] },
      {
        name: "Acciones",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Control",
          "PQ1",
          "Paquet",
          "Embar",
          "Rep",
          "Vent",
          "VENT",
          "Tran",
          "Audi",
          "Rep",
        ],
      },
      {
        name: "TRANSPORTISTA",
        role: ["Admin", "Master", "Trans", "Control", "Embar", "Rep"],
      },
      { name: "EMPRESA", role: ["Admin", "Master", "Trans", "Control", "Rep"] },
      { name: "CLAVE", role: ["Admin", "Master", "Trans", "Control", "Rep"] },
      {
        name: "ACCIONES",
        role: ["Admin", "Master", "Trans", "Control", "Rep"],
      },
      {
        name: "REG_ENTRADA",
        role: ["Admin", "Master", "Trans", "Control", "Rep"],
      },
    ];

    return allColumns
      .filter((col) => col.role.includes(role))
      .map((col) => col.name);
  };

  const visibleColumns = getVisibleColumns(user?.role);

  const handleGenerateExcel = () => {
    // 🔹 Filtrar solo las rutas con tipo "Directa"
    const filteredData = sentRoutesData.filter(
      (row) => row["TIPO"].toLowerCase() === "directa"
    );

    if (filteredData.length === 0) {
      alert("No hay datos de tipo 'Directa' para exportar.");
      return;
    }

    const groupedData = {};

    // 🔹 Solo trabajar con los datos filtrados (filteredData)
    filteredData.forEach((row) => {
      const clientId = row["NUM. CLIENTE"];

      if (!groupedData[clientId]) {
        groupedData[clientId] = {
          clientName: row["NOMBRE DEL CLIENTE"],
          referenceIds: [row["NO ORDEN"]],
          contactInfo: {
            phone: row["TELEFONO"] || "",
            email: row["CORREO"] || "",
          },
          transporte: row["TRANSPORTE"] || "No disponible",
          orders: [],
        };
      } else {
        groupedData[clientId].referenceIds.push(row["NO ORDEN"]);
      }

      groupedData[clientId].contactInfo.address = cleanAddress(
        row["DIRECCION"]
      );
      groupedData[clientId].orders.push(row);
    });

    // 🔹 Generar datos para exportación usando SOLO los datos filtrados
    const exportData = Object.keys(groupedData).map((clientId) => {
      const clientData = groupedData[clientId];

      return {
        "Nombre Vehiculo": clientData.transporte,
        "Titulo de la Visita": clientData.clientName,
        Dirección: clientData.contactInfo.address,
        Latitud: "",
        Longitud: "",
        "ID Referencia": clientData.orders
          .map((order) => order["NO ORDEN"])
          .join(", "),
        "Persona de contacto": "",
        Telefono: clientData.contactInfo.phone,
        Correo: clientData.contactInfo.email,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData, {
      header: [
        "Nombre Vehiculo",
        "Titulo de la Visita",
        "Dirección",
        "Latitud",
        "Longitud",
        "ID Referencia",
        "Persona de contacto",
        "Telefono",
        "Correo",
      ],
    });

    ws["!cols"] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos Directa");
    XLSX.writeFile(wb, "Datos_Directa.xlsx");
  };

  // ✅ Versión con tabla de IMPORTE AGREGADA al final (corregida)

  // ✅ Versión con tabla de IMPORTE AGREGADA al final (corregida)

  const totalPagesExp = "___total_pages___";

  function addPageNumber(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    if (pageCount >= 1) {
      doc.setPage(1);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`PÁGINA 1 de ${pageCount}`, 200, 59, { align: "right" });
    }

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      doc.addImage(barraFooter, "JPEG", 10, pageHeight - 15, 190, 8);
    }
  }

  function verificarEspacio(doc, currentY, filas = 10, margenInferior = 20) {
    const pageHeight = doc.internal.pageSize.height;
    const alturaEstim = 10 + filas * 6;
    if (currentY + alturaEstim > pageHeight - margenInferior) {
      doc.addPage();
      return 20;
    }
    return currentY;
  }

  const generatePDF = async (pedido) => {
    try {
      const responseRoutes = await fetch(
        "http://66.232.105.87:3007/api/Trasporte/ruta-unica"
      );
      const routesData = await responseRoutes.json();
      const route = routesData.find(
        (r) => String(r["NO ORDEN"]) === String(pedido)
      );
      if (!route) return alert("No se encontró la ruta");

      const responseEmbarque = await fetch(
        `http://66.232.105.87:3007/api/Trasporte/embarque/${pedido}`
      );
      const data = await responseEmbarque.json();
      if (!data || !Array.isArray(data) || data.length === 0)
        return alert("No hay productos");

      const doc = new jsPDF();
      const marginLeft = 10;
      let currentY = 26;

      doc.setFillColor(240, 36, 44);
      doc.rect(10, 10, 190, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("FORMATO PARA RECEPCIÓN DEL PEDIDO", 105, 15.5, {
        align: "center",
      });

      doc.addImage(logo, "JPEG", 145, 23, 50, 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(84, 84, 84);
      doc.text("Santul Herramientas S.A. de C.V.", marginLeft, currentY);
      currentY += 4;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Henry Ford 257 C y D, Col. Bondojito, Gustavo A. Madero,",
        marginLeft,
        currentY
      );
      currentY += 4;
      doc.text("Ciudad de México, C.P. 07850, México,", marginLeft, currentY);
      currentY += 4;
      doc.text("Tel.: 58727290", marginLeft, currentY);
      currentY += 4;
      doc.text("R.F.C. SHE130912866", marginLeft, currentY);
      currentY += 5;
      doc.setDrawColor(240, 36, 44);
      doc.setLineWidth(0.5);
      doc.line(10, currentY, 200, currentY);
      currentY += 4;

      const nombreCliente = route["NOMBRE DEL CLIENTE"] || "No disponible";
      const numeroFactura = route["NO_FACTURA"] || "No disponible";
      const direccion = cleanAddress(route["DIRECCION"]) || "No disponible";
      const numero = route["NUM. CLIENTE"] || "No disponible";
      const telefono = route["TELEFONO"] || "Sin número";
      const rawTotal = route["TOTAL"];
      let totalImporte = 0;
      if (
        rawTotal &&
        !isNaN(parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, "")))
      ) {
        totalImporte = parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, ""));
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `CLIENTE NO.: ${numero}                      NOMBRE DEL CLIENTE: ${nombreCliente}`,
        marginLeft,
        currentY
      );
      currentY += 4;
      doc.text(
        `TELÉFONO: ${telefono}     DIRECCIÓN: ${direccion}`,
        marginLeft,
        currentY
      );
      currentY += 4;
      doc.text(`VT: ${pedido}`, marginLeft, currentY);
      currentY += 4;
      doc.text(`FACTURA No.: ${numeroFactura}`, marginLeft, currentY);
      currentY += 4;

      const infoY = currentY;
      doc.setFillColor(255, 255, 0);
      doc.rect(marginLeft, infoY, 190, 11, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text("INFORMACIÓN IMPORTANTE", 105, infoY + 4, { align: "center" });
      doc.setFontSize(5.3);
      doc.text(
        "En caso de detectar cualquier irregularidad (daños, faltantes, o manipulaciones), Favor de comunicarse de inmediato al departamento de atención al cliente al número:(55) 58727290 EXT.: (8815, 8819)",
        105,
        infoY + 9,
        { align: "center", maxWidth: 180 }
      );
      currentY = infoY + 15;

      const productosConCaja = data.filter((i) => i.caja && i.caja > 0);
      const productosSinCaja = data.filter((i) => !i.caja || i.caja === 0);

      // ✔️ Primero agrupamos productos por caja original

      const cajasAgrupadasOriginal = productosConCaja.reduce((acc, item) => {
        if (!acc[item.caja]) acc[item.caja] = [];
        acc[item.caja].push(item);
        return acc;
      }, {});

      const cajasOrdenadas = Object.entries(cajasAgrupadasOriginal).sort(
        (a, b) => Number(a[0]) - Number(b[0])
      );

      const totalINNER_MASTER = productosSinCaja.reduce(
        (s, i) => s + (i._inner || 0) + (i._master || 0),
        0
      );
      const totalCajasArmadas = cajasOrdenadas.length;
      const totalCajas = totalINNER_MASTER + totalCajasArmadas;

      const totalTarimas = data.reduce((s, i) => s + (i.tarimas || 0), 0);
      const totalAtados = data.reduce((s, i) => s + (i.atados || 0), 0);

      currentY = verificarEspacio(doc, currentY, 2);
      doc.autoTable({
        startY: currentY,
        head: [
          ["INNER/MASTER", "TARIMAS", "ATADOS", "CAJAS ARMADAS", "TOTAL CAJAS"],
        ],
        body: [
          [
            totalINNER_MASTER,
            totalTarimas,
            totalAtados,
            totalCajasArmadas,
            totalCajas,
          ],
        ],
        theme: "grid",
        margin: { left: 10 },
        tableWidth: 190,
        styles: { fontSize: 9, halign: "center", cellPadding: 3 },
        headStyles: { fillColor: [210, 210, 210], textColor: [0, 0, 0] },
      });
      currentY = doc.lastAutoTable.finalY + 4;

      const cajasAgrupadas = productosConCaja.reduce((acc, item) => {
        if (!acc[item.caja]) acc[item.caja] = [];
        acc[item.caja].push(item);
        return acc;
      }, {});

      let numeroCajaSecuencial = 1;

      for (const [, productos] of cajasOrdenadas) {
        const titulo = `Productos en la Caja ${numeroCajaSecuencial}`;

        // Título de la tabla
        doc.autoTable({
          startY: currentY,
          head: [[titulo]],
          body: [],
          theme: "grid",
          styles: { halign: "center", fontSize: 9 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
          },
          margin: { left: 10 },
          tableWidth: 190,
        });

        currentY = doc.lastAutoTable.finalY;

        let yaContinua = false;

        doc.autoTable({
          startY: currentY,
          head: [
            [
              "SKU",
              "DESCRIPCIÓN",
              "CANTIDAD",
              "UM",
              "PZ",
              "PQ",
              "INNER",
              "MASTER",
              "TARIMA",
              "ATADOS",
              "VALIDA",
            ],
          ],
          body: productos.map((item) => [
            item.codigo_ped || "",
            item.des || "",
            item.cantidad || "",
            item.um || "",
            item._pz || 0,
            item._pq || 0,
            item._inner || 0,
            item._master || 0,
            item.tarimas || 0,
            item.atados || 0,
            "",
          ]),
          theme: "grid",
          margin: { left: 10 },
          tableWidth: 190,
          styles: {
            fontSize: 5.5,
            halign: "center",
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 70 },
            2: { cellWidth: 15 },
            3: { cellWidth: 10 },
            4: { cellWidth: 10 },
            5: { cellWidth: 10 },
            6: { cellWidth: 12 },
            7: { cellWidth: 12 },
            8: { cellWidth: 12 },
            9: { cellWidth: 12 },
            10: { cellWidth: 12 },
          },
          headStyles: {
            fillColor: [20, 20, 20],
            textColor: [255, 255, 255],
            fontSize: 5.5,
          },
          didDrawCell: function (data) {
            if (
              data.row.index === 0 &&
              data.section === "body" &&
              data.cursor.y < 30 && // Está en una nueva página
              !yaContinua
            ) {
              const text = `Continuación de la Caja ${numeroCajaSecuencial}`;
              doc.setFontSize(8);
              doc.text(text, 105, data.cursor.y - 6, { align: "center" });
              yaContinua = true;
            }
          },
        });

        currentY = doc.lastAutoTable.finalY + 4;
        numeroCajaSecuencial++;
      }

      if (productosSinCaja.length > 0) {
        // Título principal
        currentY = verificarEspacio(doc, currentY, 2);
        doc.autoTable({
          startY: currentY,
          head: [["Productos sin caja"]],
          body: [],
          theme: "grid",
          styles: { halign: "center", fontSize: 9 },
          margin: { left: 10 },
          tableWidth: 190,
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
          },
        });
        currentY = doc.lastAutoTable.finalY;

        let yaContinua = false;

        doc.autoTable({
          startY: currentY,
          head: [
            [
              "SKU",
              "DESCRIPCIÓN",
              "CANTIDAD",
              "UM",
              "PZ",
              "INNER",
              "MASTER",
              "TARIMAS",
              "ATADOS",
              "VALIDAR",
            ],
          ],
          body: productosSinCaja.map((item) => [
            item.codigo_ped || "",
            item.des || "",
            item.cantidad || "",
            item.um || "",
            item._pz || 0,
            item._inner || 0,
            item._master || 0,
            item.tarimas || 0,
            item.atados || 0,
            "",
          ]),
          theme: "grid",
          margin: { left: 10 },
          tableWidth: 190,
          styles: {
            fontSize: 5.5,
            halign: "center",
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 80 },
            2: { cellWidth: 15 },
            3: { cellWidth: 10 },
            4: { cellWidth: 10 },
            5: { cellWidth: 12 },
            6: { cellWidth: 12 },
            7: { cellWidth: 12 },
            8: { cellWidth: 12 },
            9: { cellWidth: 12 },
          },
          headStyles: {
            fillColor: [20, 20, 20],
            textColor: [255, 255, 255],
            fontSize: 5.5,
          },
          didDrawCell: function (data) {
            if (
              data.row.index === 0 &&
              data.section === "body" &&
              data.cursor.y < 30 &&
              !yaContinua
            ) {
              const text = "Continuación de productos sin caja";
              doc.setFontSize(8);
              doc.text(text, 105, data.cursor.y - 6, { align: "center" });
              yaContinua = true;
            }
          },
        });

        currentY = doc.lastAutoTable.finalY + 4;
      }

      currentY = doc.lastAutoTable.finalY + 5;
      currentY = verificarEspacio(doc, currentY, 1);
      const pageWidth = doc.internal.pageSize.getWidth();
      const tableWidth = 90;
      const leftMargin = (pageWidth - tableWidth) / 2;

      doc.autoTable({
        startY: currentY,
        head: [
          [
            {
              content: "DETALLES DEL PEDIDO",
              colSpan: 2,
              styles: {
                halign: "center",
                fillColor: [230, 230, 230],
                fontSize: 7,
              },
            },
            {
              content: pedido,
              styles: {
                halign: "center",
                fillColor: [200, 200, 200],
                fontSize: 9,
              },
            },
          ],
          [
            {
              content: "IMPORTE DEL PEDIDO\n(SIN IVA)",
              styles: { halign: "center", fontSize: 5 },
            },
            {
              content: "TOTAL A PAGAR\n(SIN IVA)",
              styles: { halign: "center", fontSize: 5 },
            },
            {
              content: "PORCENTAJE DE ENTREGA",
              styles: { halign: "center", fontSize: 5 },
            },
          ],
        ],
        body: [
          [
            `$${totalImporte.toFixed(2)}`,
            `$${totalImporte.toFixed(2)}`,
            "100.00 %",
          ],
        ],
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: leftMargin },
        tableWidth: tableWidth,
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 4.5,
        },
      });

      currentY = doc.lastAutoTable.finalY + 5;
      currentY = verificarEspacio(doc, currentY, 1);
      doc.autoTable({
        startY: currentY,
        body: [
          [
            {
              content:
                "Se confirma que las cajas, atados y/o tarimas listadas en esta lista de empaque fueron recibidas cerradas y en buen estado, y así serán entregadas al cliente. Cualquier anomalía se atenderá según lo establecido en el contrato",
              styles: { fontSize: 7, halign: "justify", textColor: [0, 0, 0] },
            },
            {
              content: "Firma del Transportista",
              styles: { fontSize: 7, halign: "center", fontStyle: "bold" },
            },
          ],
        ],
        theme: "grid",
        styles: { cellPadding: 3, valign: "top" },
        columnStyles: {
          0: { cellWidth: 150 },
          1: { cellWidth: 40 },
        },
        margin: { left: 10 },
        tableWidth: 190,
      });

      currentY = doc.lastAutoTable.finalY + 0;

      const instrucciones = [
        "•Estimado cliente, nuestro transportista cuenta con ruta asignada por lo que agradeceríamos agilizar el tiempo de recepción de su mercancía, el material viaja consignado por lo que solo podrá entregarse en la dirección estipulada en este documento.",
        "•Cualquier retraso en la recepción generan costos adicionales y pueden afectar la entrega a otros clientes. En casos repetitivos, podrían cancelarse beneficios como descuentos adicionales.",
        "•El transportista solo entregará en planta baja o *nivel de calle*, si cuenta con alguna política especial de recepción, por favor solicita un esquema de entrega con tu Asesor de ventas.",
        "•Si Ud. detecta alguna anomalía en el empaque, embalaje, atado de la mercancía, alguna diferencia vs las cajas embarcadas y/o que el transportista retiene mercancía de forma intencional repórtalo en el apartado de observaciones.",
        "•El transportista no está autorizado a recibir mercancía, todo reporte de devolución, garantía,etc. deberá ser reportado a su asesor de ventas y aplicará de acuerdo a la Política vigente.",
        "•Con la firma y/o sello en el presente documento, se da por recibida a entera conformidad la mercancía descrita y se acepta el monto a pagar aquí indicado.",
      ];

      const instruccionesTexto = instrucciones.join("\n");
      currentY = verificarEspacio(doc, currentY, instrucciones.length);

      doc.autoTable({
        startY: currentY,
        body: [[{ content: instruccionesTexto }]],
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 3,
          valign: "top",
          textColor: [0, 0, 0],
        },
        columnStyles: { 0: { cellWidth: 190 } },
        margin: { left: 10 },
        tableWidth: 190,
      });

      currentY = doc.lastAutoTable.finalY + 0;

      const letras = NumerosALetras(totalImporte);
      const fechaActual = new Date();
      const fechaHoy = fechaActual.toLocaleDateString("es-MX");
      const fechaVence = new Date(
        fechaActual.setMonth(fechaActual.getMonth() + 1)
      ).toLocaleDateString("es-MX");

      const textoPagare =
        `En cualquier lugar de este documento donde se estampe la firma por este pagaré debo(emos) y pagaré(mos) ` +
        `incondicionalmente a la vista y a la orden de SANTUL HERRAMIENTAS S.A. DE C.V., la cantidad de: $${totalImporte.toFixed(
          2
        )} ` +
        `(${letras} M.N.) En el total a pagar en Cuautitlán, Estado de México, o en la que SANTUL HERRAMIENTAS S.A. DE C.V., juzgue necesario. ` +
        `Este documento causará intereses al 3% mensual si no se paga a su vencimiento. expide el ${fechaHoy}, vence el ${fechaVence}.`;

      currentY = verificarEspacio(doc, currentY, 8);

      doc.autoTable({
        startY: currentY,
        body: [[textoPagare, "Firma del Cliente"]],
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 3,
          valign: "top",
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 150, fillColor: [240, 240, 240] },
          1: { cellWidth: 40, halign: "center", fontStyle: "bold" },
        },
        margin: { left: 10 },
        tableWidth: 190,
      });

      currentY = doc.lastAutoTable.finalY + 0;
      currentY = verificarEspacio(doc, currentY, 5);
      doc.addImage(infoBancaria, "JPEG", 10, currentY, 190, 35);

      addPageNumber(doc);
      doc.save(`PackingList_de_${pedido}.pdf`);
      alert(`PDF generado con éxito para el pedido ${pedido}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };

  useEffect(() => {
    // console.log("Observaciones actuales:", observacionesPorRegistro);
  }, [observacionesPorRegistro, groupedData]);

  const MAX_VISIBLE_ROUTES = 25;

  const removeRoute = (route) => {
    setGroupedData((prevData) => {
      const updatedRoutes = { ...prevData };
      delete updatedRoutes[route]; // Eliminar la ruta del objeto
      return updatedRoutes;
    });

    // También remover la ruta de las seleccionadas si estaba marcada
    setSelectedRoutes((prevSelected) =>
      prevSelected.filter((r) => r !== route)
    );
  };

  const [filter, setFilter] = useState({
    noOrden: "",
    numCliente: "",
    estado: "",
  });

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      setData([]);
    }
  }, [data]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderFilterChange = (e) => {
    const value = e.target.value;
    setFilterOrderValue(value);

    // Resaltar solo si hay un valor en el filtro
    if (value) {
      const rowIndex = groupedData[selectedRoute]?.rows.findIndex(
        (row) => row["NO ORDEN"].toString() === value
      );

      // Si se encuentra la fila, resaltar temporalmente
      if (rowIndex !== -1) {
        setHighlightedRow(rowIndex);
      } else {
        setHighlightedRow(null); // Quitar el resaltado si no se encuentra
      }
    } else {
      setHighlightedRow(null); // Quitar el resaltado si el filtro está vacío
    }
  };

  const openDirectaModal = (data) => {
    // console.log("Datos en openDirectaModal:", data); // Verifica que el valor correcto se muestre aquí

    setSelectedDirectaData(data);

    setGuia(data.GUIA); // Asegurar que no esté vacío
    setSelectedNoOrden(data["NO ORDEN"] || "");
    setFecha(data.FECHA || "");
    setNumCliente(data["NUM CLIENTE"] || "");
    setNombreCliente(data["NOMBRE DEL CLIENTE"] || "");
    setMunicipio(data.MUNICIPIO || "");
    setEstado(data.ESTADO || "");
    setObservaciones(data.OBSERVACIONES || "");
    setTotal(data.TOTAL || "");
    setPartidas(data.PARTIDAS || "");
    setPiezas(data.PIEZAS || "");
    setZona(data.ZONA || "");
    setTipoZona(data["TIPO DE ZONA"] || "");
    setNoFactura(data.noFactura);
    setDiaEnRuta(data["DIA EN QUE ESTA EN RUTA"] || "");
    setCajas(data.CAJAS || "");
    setTransporte(data.TRANSPORTE || "");
    setPaqueteria(data.PAQUETERIA || "");
    setDiasEntrega(data["DIAS_DE_ENTREGA"] || "");
    setEntregaSatisfactoria(
      data["ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA"] || ""
    );
    setMotivo(data.MOTIVO || "");
    setDiferencia(data.DIFERENCIA || "");

    setNoFactura(data["NO_FACTURA"] || "");
    setFechaEmbarque(
      data["FECHA_DE_EMBARQUE"]
        ? new Date(data["FECHA_DE_EMBARQUE"]).toISOString().split("T")[0]
        : ""
    );
    setFechaEntregaCliente(
      data["FECHA_DE_ENTREGA (CLIENTE)"]
        ? new Date(data["FECHA_DE_ENTREGA (CLIENTE)"])
            .toISOString()
            .split("T")[0]
        : ""
    );
    setFechaEstimadaCliente(
      data["FECHA_DE_ENTREGA (CLIENTE)"]
        ? new Date(data["FECHA_DE_ENTREGA (CLIENTE)"])
            .toISOString()
            .split("T")[0]
        : ""
    );
    setTipo(data.TIPO || "");

    setDirectaModalOpen(true);
  };

  const closeDirectaModal = () => {
    setDirectaModalOpen(false);
    setSelectedDirectaData(null);
  };

  const fetchTransportistas = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Ventas/transportistas"
      );
      // console.log("Datos de transportistas:", response.data); // Verifica que contenga datos
      setTransportistaData(response.data);
    } catch (error) {
      console.error("Error al obtener transportistas:", error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Ventas/transportistas/empresas"
      );

      // console.log("Datos de empresa:", response.data); // Verifica que contenga datos
      setEmpresaData(response.data);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      setError("Error al obtener empresas");
    }
  };

  const handleRowChange = (index, field, value) => {
    let updatedData = [...directaData, ...paqueteriaData].map((item) => ({
      ...item,
    }));

    if (field === "transportista") {
      const selectedTransportista = transportistaData.find(
        (item) => `${item.nombre} ${item.apellidos}` === value
      );

      updatedData[index] = {
        ...updatedData[index],
        transportista: selectedTransportista
          ? `${selectedTransportista.nombre} ${selectedTransportista.apellidos}`
          : "",
        clave: selectedTransportista?.clave || "", // Mantener clave actualizada
      };
    } else if (field === "id_veh") {
      if (value) {
        const empresaSeleccionada = empresaData.find(
          (item) => item.id_veh === Number(value)
        );

        if (empresaSeleccionada) {
          // console.log(
          //   "🏢 Empresa seleccionada correctamente:",
          //   empresaSeleccionada
          // );
          updatedData[index] = {
            ...updatedData[index],
            empresa: empresaSeleccionada.empresa, // Mantener el nombre de la empresa
            id_veh: Number(value), // Actualizar id_veh
          };
        } else {
          console.warn(
            "⚠️ No se encontró la empresa seleccionada en los datos."
          );
        }
      } else {
        // Si no hay valor seleccionado, limpiar los campos
        updatedData[index] = {
          ...updatedData[index],
          empresa: "",
          id_veh: "",
        };
      }
    } else {
      updatedData[index] = {
        ...updatedData[index],
        [field]: value, // Actualizar cualquier otro campo
      };
    }

    // Actualiza los datos en los estados separados
    setDirectaData(updatedData.filter((item) => item.TIPO === "directa"));
    setPaqueteriaData(updatedData.filter((item) => item.TIPO === "paqueteria"));

    // console.log("📊 Datos después de actualizar:", updatedData[index]);
  };

  const handleInsertarVisita = async (routeData, index) => {
    try {
      if (!routeData.id_veh) {
        alert("No se ha seleccionado un vehículo válido.");
        return;
      }

      // Datos a enviar al backend
      const dataToSend = {
        id_vit: routeData.clave,
        clave_visit: `${routeData.clave}1`,
        motivo: "Transporte",
        personal: "Administracion de Transporte",
        reg_entrada:
          routeData.reg_entrada || new Date().toISOString().split("T")[0],
        id_veh: routeData.id_veh,
      };

      // // Mostrar datos en consola antes de enviar
      // console.log(
      //   "📤 Datos preparados para envío:",
      //   JSON.stringify(dataToSend, null, 2)
      // );

      // Enviar la solicitud al backend
      const response = await axios.post(
        "http://66.232.105.87:3007/api/Ventas/insertar-visita",
        dataToSend
      );

      alert(`✅ Visita insertada correctamente: ${response.data.message}`);

      // Actualizar el estado local para marcar como insertado
      const updatedData = [...directaData, ...paqueteriaData];
      updatedData[index] = {
        ...routeData,
        insertado: true,
      };

      setDirectaData(updatedData.filter((item) => item.TIPO === "directa"));
      setPaqueteriaData(
        updatedData.filter((item) => item.TIPO === "paqueteria")
      );
    } catch (error) {
      console.error("❌ Error al insertar la visita:", error);
      alert("Error al insertar la visita.");
    }
  };

  const eliminarRuta = async (noOrden) => {
    try {
      setLoading(true); // Muestra el loading
      const response = await axios.delete(
        `http://66.232.105.87:3007/api/Ventas/ruta/eliminar/${noOrden}`
      );
      alert(response.data.message); // Muestra el mensaje de éxito
      // Aquí puedes también actualizar el estado para eliminar la ruta de la vista sin necesidad de recargar
    } catch (error) {
      console.error(
        "Error al eliminar la ruta:",
        error.response ? error.response.data.message : error.message
      );
      alert("Error al eliminar la ruta");
    } finally {
      setLoading(false); // Oculta el loading
    }
  };

  const calculateTotalRoutes = () => {
    let totalClientes = 0;
    let totalPedidos = 0;
    let totalGeneral = 0;

    // Iterar sobre todas las rutas en groupedData
    Object.keys(groupedData).forEach((routeKey) => {
      const routeData = groupedData[routeKey];

      // Contar el número de registros/órdenes (clientes) en cada ruta
      totalClientes += routeData.rows.length; // Número de órdenes = número de registros en la ruta
      totalPedidos += routeData.rows.length; // Contar el número de órdenes (no sumar partidas)
      totalGeneral += routeData.rows.reduce(
        (sum, row) => sum + (row.TOTAL || 0),
        0
      ); // Sumar los totales de cada ruta
    });

    // Guardar los totales calculados en el estado
    const totals = { totalClientes, totalPedidos, totalGeneral };
    setCalculatedTotals(totals);
    setTotalClientes(totalClientes);
    setTotalPedidos(totalPedidos);
    setTotalGeneral(totalGeneral);
  };

  const handleEditObservation = (clientId) => {
    setEditingClientId(clientId);
    setCurrentObservation(observacionesPorRegistro[clientId] || "");
  };

  const handleSaveObservation = (clientId, newObservation) => {
    setObservacionesPorRegistro((prev) => ({
      ...prev,
      [clientId]: newObservation,
    }));
  };

  useEffect(() => {}, [observacionesPorRegistro, groupedData]);

  const moveRowUp = (route, index) => {
    setGroupedData((prevData) => {
      const updatedRoute = { ...prevData[route] };
      if (index > 0) {
        const temp = updatedRoute.rows[index - 1];
        updatedRoute.rows[index - 1] = updatedRoute.rows[index];
        updatedRoute.rows[index] = temp;
      }
      return { ...prevData, [route]: updatedRoute };
    });
  };

  const moveRowDown = (route, index) => {
    setGroupedData((prevData) => {
      const updatedRoute = { ...prevData[route] };
      if (index < updatedRoute.rows.length - 1) {
        const temp = updatedRoute.rows[index + 1];
        updatedRoute.rows[index + 1] = updatedRoute.rows[index];
        updatedRoute.rows[index] = temp;
      }
      return { ...prevData, [route]: updatedRoute };
    });
  };

  const getTransportUrl = (transport) => {
    const cleanedTransport = transport
      ?.trim()
      .replace(/\s+/g, " ")
      .toUpperCase();

    switch (cleanedTransport) {
      case "EXPRESS":
        return "https://www.paquetexpress.com.mx/";
      case "TRESGUERRAS":
        return "https://www.tresguerras.com.mx/3G/tracking.php";
      case "FLECHISA":
        return "https://fch.envionet.mx/CFDI-FC?P=1";
      case "FEDEX":
        return "https://www.fedex.com/es-mx/home.html";
      case "PITIC":
        return "https://transportespitic.com/soluciones-tecnologia.html";
      default:
        // console.log("Transporte no encontrado. Usando enlace por defecto.");
        return "https://app2.simpliroute.com/#/planner/vehicles";
    }
  };

  const [options, setOptions] = useState([
    "EXPRESS",
    "TRESGUERRAS",
    "FLECHISA",
    "FEDEX",
    "PITIC",
  ]); // Opciones iniciales
  const [inputValue, setInputValue] = useState("");

  const transportUrl = getTransportUrl(transporte);

  const handleOpenHistoricoModal = async () => {
    if (user?.role !== "Admin" && user?.role !== "Master") {
      alert("No tienes permisos para ver este módulo.");
      return;
    }
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Ventas/historico"
      );
      setHistoricoData(response.data);
    } catch (error) {
      console.error("Error al obtener los datos históricos:", error);
    }
    setHistoricoModalOpen(true);
  };

  const handleFetchHistoricoData = async () => {
    if (selectedColumns.length === 0) {
      alert("Selecciona al menos una columna.");
      return;
    }

    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Ventas/historico",
        {
          params: {
            cliente: selectedCliente || "",
            columnas: selectedColumns.join(","),
            mes: selectedMonth || "", // 🟢 Enviar el mes seleccionado
          },
        }
      );

      setHistoricoData(response.data);
    } catch (error) {
      console.error("Error al obtener datos históricos:", error);
      alert("Error al obtener datos históricos.");
    }
  };

  const fetchClientesRegistrados = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Ventas/historico_clientes"
      );

      // Limpiar comillas innecesarias en nombres de clientes
      const clientesLimpios = response.data.map((cliente) => ({
        noCliente: cliente.NO_DE_CLIENTE,
        nombreCliente: cliente.CLIENTE.replace(/^"|"$/g, ""), // Elimina comillas extras
      }));

      setClientes(clientesLimpios);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };

  const handleCloseHistoricoModal = () => {
    setHistoricoModalOpen(false);
  };

  useEffect(() => {
    fetchClientesRegistrados(); // Se ejecuta solo una vez al cargar la página
  }, []);

  const fetchColumnasDisponibles = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Ventas/historico_columnas"
      );
      setColumnasDisponibles(response.data);
    } catch (error) {
      console.error("Error al obtener las columnas:", error);
    }
  };

  useEffect(() => {
    if (historicoModalOpen) {
      fetchColumnasDisponibles();
    }
  }, [historicoModalOpen]);

  const resetFilters = () => {
    setSelectedCliente(""); // Reinicia el cliente
    setSelectedColumns([]); // Reinicia las columnas seleccionadas
    setHistoricoData([]); // Borra los datos mostrados en la tabla
  };

  const meses = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const handleColumnSelection = (event) => {
    const selectedCols = event.target.value;
    setSelectedColumns(selectedCols);

    if (selectedCols.includes("FECHA")) {
      setSelectedMonth("01"); // Por defecto Enero
    } else {
      setSelectedMonth(""); // Reiniciar selección de mes si "FECHA" no está seleccionada
    }
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Estado para la paginación

  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []; // Previene errores

    return data.filter((row) => {
      return (
        (filter.noOrden === "" ||
          row["NO ORDEN"]?.toString().includes(filter.noOrden)) &&
        (filter.numCliente === "" ||
          row["NUM. CLIENTE"]?.toString().includes(filter.numCliente)) &&
        (filter.estado === "" ||
          row.ESTADO?.toLowerCase().includes(filter.estado.toLowerCase()))
      );
    });
  }, [data, filter]); // Dependencias correctas

  const paginatedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Asegurar que la página actual no exceda el máximo
    const maxPage = Math.ceil(filteredData.length / rowsPerPage);
    if (page >= maxPage) setPage(0); // Resetear a la primera página si está fuera de rango

    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData, page, rowsPerPage]);

  const [filtroGeneralAsignacion, setFiltroGeneralAsignacion] = useState("");
  const [filtroEstadoAsignacion, setFiltroEstadoAsignacion] = useState("");

  const filteredAsignacion = useMemo(() => {
    return sentRoutesData.filter((item) => {
      if (
        item.TIPO?.toLowerCase() !== "paqueteria" &&
        item.TIPO?.toLowerCase() !== "directa"
      ) {
        return false;
      }

      const cumpleGeneral =
        !filtroGeneralAsignacion ||
        item["NO ORDEN"]?.toString().includes(filtroGeneralAsignacion) ||
        item["NUM. CLIENTE"]?.toString().includes(filtroGeneralAsignacion) ||
        item["NOMBRE DEL CLIENTE"]
          ?.toLowerCase()
          .includes(filtroGeneralAsignacion.toLowerCase());

      const cumpleEstado =
        !filtroEstadoAsignacion ||
        item.ESTADO?.toLowerCase().includes(
          filtroEstadoAsignacion.toLowerCase()
        );

      return cumpleGeneral && cumpleEstado;
    });
  }, [sentRoutesData, filtroGeneralAsignacion, filtroEstadoAsignacion]);

  const paginatedAsignacion = filteredAsignacion.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const filteredClientes = clientes.filter((cliente) =>
    `${cliente.noCliente} - ${cliente.nombreCliente}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const [filtroGeneral, setFiltroGeneral] = useState(""); // para No Orden y Num Cliente
  const [filtroEstado, setFiltroEstado] = useState(""); // separado
  const [paqueteriaSeleccionada, setPaqueteriaSeleccionada] = useState(""); // 🔥 Estado para filtrar
  const [estatusSeleccionado, setEstatusSeleccionado] = useState(""); // Estatus vacío por defecto
  const [mostrarSinGuia, setMostrarSinGuia] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(""); // Filtro por factura
  const [fechaEntregaSeleccionada, setFechaEntregaSeleccionada] = useState(""); // Filtro por fecha

  const paqueteriaFiltrada = useMemo(() => {
    return paqueteriaData.filter((routeData) => {
      const coincideGeneral =
        !filtroGeneral ||
        routeData["NO ORDEN"]?.toString().includes(filtroGeneral) ||
        routeData["NOMBRE DEL CLIENTE"]
          ?.toString()
          .toLowerCase()
          .includes(filtroGeneral.toLowerCase());

      const coincideEstado =
        !filtroEstado ||
        routeData.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

      const coincidePaqueteria =
        !paqueteriaSeleccionada ||
        routeData.PAQUETERIA === paqueteriaSeleccionada;

      const coincideEstatus =
        !estatusSeleccionado || routeData.statusText === estatusSeleccionado;

      const coincideGuia =
        !mostrarSinGuia || !routeData.GUIA || routeData.GUIA.trim() === "";

      return (
        coincideGeneral &&
        coincideEstado &&
        coincidePaqueteria &&
        coincideEstatus &&
        coincideGuia
      );
    });
  }, [
    filtroGeneral,
    filtroEstado,
    paqueteriaData,
    paqueteriaSeleccionada,
    estatusSeleccionado,
    mostrarSinGuia,
  ]);

  const directaFiltrada = useMemo(() => {
    return directaData.filter((item) => {
      const cumpleGeneral =
        !filtroGeneral ||
        item["NOMBRE DEL CLIENTE"]
          ?.toLowerCase()
          .includes(filtroGeneral.toLowerCase()) ||
        item["NO ORDEN"]?.toString().includes(filtroGeneral);

      const cumpleEstado =
        !filtroEstado ||
        item.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

      const cumpleEstatus =
        !estatusSeleccionado || item.statusText === estatusSeleccionado;

      const cumpleFechaEntrega =
        !fechaEntregaSeleccionada ||
        item.FECHA_DE_ENTREGA_CLIENTE === fechaEntregaSeleccionada;

      return (
        cumpleGeneral && cumpleEstado && cumpleEstatus && cumpleFechaEntrega
      );
    });
  }, [
    filtroGeneral,
    filtroEstado,
    directaData,
    estatusSeleccionado,
    fechaEntregaSeleccionada,
  ]);

  const ventaEmpleadoFiltrada = useMemo(() => {
    return ventaEmpleadoData.filter((item) => {
      const cumpleGeneral =
        !filtroGeneral ||
        item["NOMBRE DEL CLIENTE"]
          ?.toLowerCase()
          .includes(filtroGeneral.toLowerCase()) ||
        item["NO ORDEN"]?.toString().includes(filtroGeneral);

      const cumpleEstado =
        !filtroEstado ||
        item.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

      return cumpleGeneral && cumpleEstado;
    });
  }, [filtroGeneral, filtroEstado, ventaEmpleadoData]);

  const calcularDiasEntrega = (fechaEstimada) => {
    if (!fechaEstimada) return;

    const fechaActual = new Date(); // 📆 Fecha actual
    const fechaEntrega = new Date(fechaEstimada); // 📆 Fecha estimada ingresada
    let diasHabiles = 0;

    while (fechaActual < fechaEntrega) {
      fechaActual.setDate(fechaActual.getDate() + 1); // 🔄 Avanza un día

      // 🔹 Si el día NO es sábado (6) ni domingo (0), lo cuenta
      if (fechaActual.getDay() !== 6 && fechaActual.getDay() !== 0) {
        diasHabiles++;
      }
    }

    setDiasEntrega(diasHabiles); // 🔥 Actualiza el estado
  };

  const [modalObservaciones, setModalObservaciones] = useState({});
  const [editingObservationId, setEditingObservationId] = useState(null);

  useEffect(() => {
    const savedObservations =
      JSON.parse(localStorage.getItem("modalObservaciones")) || {};
    setModalObservaciones(savedObservations);
  }, []);

  const handleEditModalObservation = (clienteId) => {
    setEditingObservationId(clienteId);
  };

  const handleSaveModalObservation = (clienteId, nuevaObservacion) => {
    setModalObservaciones((prev) => {
      const updatedObservations = { ...prev, [clienteId]: nuevaObservacion };

      // Guardamos en localStorage para persistencia
      localStorage.setItem(
        "modalObservaciones",
        JSON.stringify(updatedObservations)
      );

      return updatedObservations;
    });

    // Mantener el campo activo hasta que el usuario haga clic fuera
  };

  const handleClearStorage = () => {
    localStorage.removeItem("totalClientes");
    localStorage.removeItem("totalPedidos");
    localStorage.removeItem("totalGeneral");

    // Restablecer los valores en la UI
    setTotalClientes(0);
    setTotalPedidos(0);
    setTotalGeneral(0);

    console.log(
      "🗑️ Datos de clientes, pedidos y total eliminados de localStorage."
    );
  };

  // Cambiar de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Cambiar el número de filas por página
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página cuando se cambia el número de filas
  };

  const obtenerFechasDeEmbarque = async (noOrdenes) => {
    if (!noOrdenes || noOrdenes.length === 0) {
      console.error("Error: No se recibieron números de orden válidos.");
      return {};
    }

    try {
      console.log("Llamando a la API con No Ordenes:", noOrdenes);
      // Construimos la URL, uniendo los pedidos con comas
      const response = await axios.get(
        `http://66.232.105.87:3007/api/Ventas/pedido/ultimas-fechas-embarque?pedidos=${noOrdenes.join(
          ","
        )}`
      );

      return response.data.fechasEmbarque.reduce((acc, item) => {
        acc[item.pedido] = item.fin_embarque || "Sin fecha";
        return acc;
      }, {});
    } catch (error) {
      console.error("Error al obtener las fechas de embarque:", error);
      return {};
    }
  };

  const [fechasEmbarque, setFechasEmbarque] = useState({});

  const [lastOrders, setLastOrders] = useState([]);

  useEffect(() => {
    const currentOrders = paginatedAsignacion.map((r) => r["NO ORDEN"]);

    // Verifica si ya tienes los datos de esas mismas órdenes
    if (JSON.stringify(currentOrders) === JSON.stringify(lastOrders)) {
      return; // No vuelvas a llamar si son las mismas
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const fechas = await obtenerFechasDeEmbarque(currentOrders);
        setFechasEmbarque(fechas);
        setLastOrders(currentOrders); // Guarda las órdenes que acabas de consultar
      } catch (error) {
        console.error("Error al obtener fechas de embarque:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paginatedAsignacion, lastOrders]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [updatedOrders, setUpdatedOrders] = useState([]); // Para mostrar órdenes actualizadas

  const updateFacturas = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo antes de subirlo.");
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setUpdatedOrders([]); // Limpiar la lista antes de la nueva carga

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await fetch(
        "http://66.232.105.87:3007/api/Ventas/subir-excel",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        const updatedOrders = data.updatedOrders || []; // Asegurar que es un array

        setUploadMessage(
          `✅ Archivo subido correctamente. Se actualizaron ${updatedOrders.length} órdenes.`
        );
        setUpdatedOrders(updatedOrders); // Guardar la lista de órdenes actualizadas
        alert("Archivo subido correctamente.");
        fetchPaqueteriaRoutes(); // Recargar datos después de la actualización
      } else {
        setUploadMessage(`❌ Error: ${data.message}`);
        alert("Error al subir el archivo.");
      }
    } catch (error) {
      console.error("❌ Error en la subida:", error);
      setUploadMessage("❌ Error en la subida del archivo.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  //filtar por mes

  const [mesSeleccionado, setMesSeleccionado] = useState("");

  const handleFiltrarMes = () => {
    fetchPaqueteriaRoutes({ mes: mesSeleccionado });
  };

  useEffect(() => {
    // Solo ejecuta si el usuario ha seleccionado un mes
    if (mesSeleccionado !== "") {
      fetchPaqueteriaRoutes({ mes: mesSeleccionado });
    }
  }, [mesSeleccionado]);

  return (
    <Paper elevation={3} style={{ padding: "20px" }}>
      <Box marginTop={2}>
        <br />

        {/* Pestañas internas para Paquetería, Directa, Venta Empleado */}
        <Tabs value={subTabIndex} onChange={handleChangeSubTab} centered>
          <Tab label="Paquetería" />
          <Tab label="Directa" />
          <Tab label="Recoge" />
          <Tab label="Asignacion" />
        </Tabs>

        {/* Sub-tab de PAQUETERIA */}
        {subTabIndex === 0 && (
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              {/* Imagen agregada desde la misma carpeta */}
              <img
                src={logo}
                alt="Filtro"
                style={{ width: "400px", height: "auto" }}
              />

              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontWeight: "bold",
                  color: "#333",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#ff6600")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              >
                <option value="">Últimos 3 días</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                {/* <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option> */}
              </select>

              <Typography variant="h5" style={{ textAlign: "center" }}>
                Transportes
              </Typography>

              {/* Caja de texto centrada y más grande */}
              <TextField
                label="Buscar por No Orden o Nombre del Cliente"
                value={filtroGeneral}
                onChange={(e) => setFiltroGeneral(e.target.value)}
                variant="outlined"
                size="small"
              />

              <TextField
                label="Buscar por Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                variant="outlined"
                size="small"
              />
            </div>

            <TablePagination
              component="div"
              count={paqueteriaFiltrada.length} // O usa directaFiltrada.length o ventaEmpleadoFiltrada.length según la tabla
              rowsPerPage={10} // Fijado en 10 filas por página
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              labelRowsPerPage="" // Oculta "Rows per page"
              rowsPerPageOptions={[]} // Elimina el selector de filas
              style={{ textAlign: "right" }}
            />

            <Table>
              <TableBody>
                <TableRow>
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>NO ORDEN</TableCell>
                  )}
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>Estado del Pedido</TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>FECHA</TableCell>
                  )}
                  {visibleColumns.includes("NUM CLIENTE") && (
                    <TableCell>NUM CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("MUNICIPIO") && (
                    <TableCell>MUNICIPIO</TableCell>
                  )}
                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>ESTADO</TableCell>
                  )}
                  {visibleColumns.includes("OBSERVACIONES") && (
                    <TableCell>OBSERVACIONES</TableCell>
                  )}
                  {visibleColumns.includes("TOTAL") && (
                    <TableCell>TOTAL</TableCell>
                  )}
                  {visibleColumns.includes("TOTAL FACTURA LT") && (
                    <TableCell>TOTAL FACTURA LT</TableCell>
                  )}
                  {visibleColumns.includes("NUMERO DE FACTURA") && (
                    <TableCell>NUMERO DE FACTURA</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE FACTURA") && (
                    <TableCell>FECHA DE FACTURA</TableCell>
                  )}
                  {visibleColumns.includes("TRANSPORTE") && (
                    <TableCell>TRANSPORTE</TableCell>
                  )}
                  {visibleColumns.includes("PAQUETERIA") && (
                    <TableCell>PAQUETERIA</TableCell>
                  )}
                  {visibleColumns.includes("GUIA") && (
                    <TableCell>GUIA</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                    <TableCell>FECHA DE ENTREGA</TableCell>
                  )}
                  {visibleColumns.includes("Acciones") && (
                    <TableCell>Acciones</TableCell>
                  )}
                </TableRow>
                {paqueteriaData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      style={{ textAlign: "center" }}
                    >
                      No hay datos disponibles.
                    </TableCell>
                  </TableRow>
                ) : (
                  paqueteriaFiltrada
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((routeData, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleRowClick(routeData)}
                      >
                        {visibleColumns.includes("NO ORDEN") && (
                          <TableCell>{routeData["NO ORDEN"]}</TableCell>
                        )}

                        <TableCell>
                          <Typography
                            variant="body2"
                            style={{ color: routeData.color }}
                          >
                            {routeData.statusText}
                          </Typography>
                        </TableCell>

                        {visibleColumns.includes("FECHA") && (
                          <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                        )}
                        {visibleColumns.includes("NUM CLIENTE") && (
                          <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                        )}
                        {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                          <TableCell>
                            {" "}
                            {routeData["NOMBRE DEL CLIENTE"]}{" "}
                          </TableCell>
                        )}
                        {visibleColumns.includes("MUNICIPIO") && (
                          <TableCell>{routeData.MUNICIPIO}</TableCell>
                        )}
                        {visibleColumns.includes("ESTADO") && (
                          <TableCell>{routeData.ESTADO}</TableCell>
                        )}
                        {visibleColumns.includes("OBSERVACIONES") && (
                          <TableCell>{routeData.OBSERVACIONES}</TableCell>
                        )}
                        {visibleColumns.includes("TOTAL") && (
                          <TableCell>
                            {" "}
                            {formatCurrency(routeData.TOTAL)}{" "}
                          </TableCell>
                        )}
                        {visibleColumns.includes("TOTAL FACTURA LT") && (
                          <TableCell>
                            {routeData.TOTAL_FACTURA_LT &&
                            !isNaN(parseFloat(routeData.TOTAL_FACTURA_LT))
                              ? formatCurrency(
                                  parseFloat(routeData.TOTAL_FACTURA_LT)
                                )
                              : "$0.00"}
                          </TableCell>
                        )}

                        {visibleColumns.includes("NUMERO DE FACTURA") && (
                          <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                        )}
                        {visibleColumns.includes("FECHA DE FACTURA") && (
                          <TableCell>
                            {" "}
                            {formatDate(routeData["FECHA_DE_FACTURA"])}{" "}
                          </TableCell>
                        )}
                        {visibleColumns.includes("TRANSPORTE") && (
                          <TableCell>{routeData.TRANSPORTE}</TableCell>
                        )}
                        {visibleColumns.includes("PAQUETERIA") && (
                          <TableCell>{routeData.PAQUETERIA}</TableCell>
                        )}
                        {visibleColumns.includes("GUIA") && (
                          <TableCell>{routeData.GUIA}</TableCell>
                        )}
                        {visibleColumns.includes(
                          "FECHA DE ENTREGA (CLIENTE)"
                        ) && (
                          <TableCell>
                            {" "}
                            {formatDate(
                              routeData.FECHA_DE_ENTREGA_CLIENTE
                            )}{" "}
                          </TableCell>
                        )}

                        <TableCell>
                          <Grid
                            container
                            spacing={1}
                            justifyContent="flex-start"
                            alignItems="center"
                          >
                            <Grid item>
                              <IconButton
                                onClick={() => {
                                  const url = getTransportUrl(
                                    routeData.TRANSPORTE
                                  );
                                  // console.log("Abriendo enlace:", url);
                                  window.open(url, "_blank");
                                }}
                                size="small"
                                style={{ color: "#616161" }}
                              >
                                <AirportShuttleIcon />
                              </IconButton>
                            </Grid>

                            <Grid item>
                              <IconButton
                                variant="contained"
                                style={{ color: "black" }} // Negro con texto blanco
                                onClick={() =>
                                  generatePDF(routeData["NO ORDEN"])
                                }
                              >
                                <ArticleIcon />
                              </IconButton>
                            </Grid>

                            <Grid item>
                              {(user?.role === "Admin" ||
                                user?.role === "Trans") && (
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    eliminarRuta(routeData["NO ORDEN"])
                                  } // Cambiar 'row' a 'routeData'
                                  disabled={loading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Sub-tab de Directa */}
        {subTabIndex === 1 && (
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <img
                src={logo}
                alt="Filtro"
                style={{ width: "400px", height: "auto" }}
              />
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontWeight: "bold",
                  color: "#333",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#ff6600")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              >
                <option value="">Últimos 3 días</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                {/*<option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option> */}
              </select>
              <Typography variant="h5" style={{ textAlign: "center" }}>
                Transportes
              </Typography>

              <TextField
                label="Buscar por No Orden o Nombre del Cliente"
                value={filtroGeneral}
                onChange={(e) => setFiltroGeneral(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
              />

              <TextField
                label="Buscar por Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                variant="outlined"
                size="small"
              />
            </div>

            <TablePagination
              component="div"
              count={directaFiltrada.length} // O usa directaFiltrada.length o ventaEmpleadoFiltrada.length según la tabla
              rowsPerPage={10} // Fijado en 10 filas por página
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              labelRowsPerPage="" // Oculta "Rows per page"
              rowsPerPageOptions={[]} // Elimina el selector de filas
              style={{ textAlign: "right" }}
            />

            <Table>
              <TableHead>
                <TableRow>
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>NO ORDEN</TableCell>
                  )}
                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>Estado del Pedido</TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>FECHA</TableCell>
                  )}
                  {visibleColumns.includes("NUM CLIENTE") && (
                    <TableCell>NUM CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("MUNICIPIO") && (
                    <TableCell>MUNICIPIO</TableCell>
                  )}
                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>ESTADO</TableCell>
                  )}
                  {visibleColumns.includes("OBSERVACIONES") && (
                    <TableCell>OBSERVACIONES</TableCell>
                  )}
                  {visibleColumns.includes("TOTAL") && (
                    <TableCell>TOTAL</TableCell>
                  )}
                  {visibleColumns.includes("NUMERO DE FACTURA") && (
                    <TableCell>NUMERO DE FACTURA</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE FACTURA") && (
                    <TableCell>FECHA DE FACTURA</TableCell>
                  )}
                  {visibleColumns.includes("TRANSPORTE") && (
                    <TableCell>TRANSPORTE</TableCell>
                  )}
                  {visibleColumns.includes("PAQUETERIA") && (
                    <TableCell>TIPO DE RUTA</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                    <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>
                  )}

                  {visibleColumns.includes("Acciones") && (
                    <TableCell>Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {directaData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      style={{ textAlign: "center" }}
                    >
                      No hay datos disponibles.
                    </TableCell>
                  </TableRow>
                ) : (
                  directaFiltrada
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // ✅ PAGINACIÓN SIN AFECTAR FILTROS
                    .map((routeData, index) => (
                      <TableRow key={index}>
                        {visibleColumns.includes("NO ORDEN") && (
                          <TableCell>{routeData["NO ORDEN"]}</TableCell>
                        )}

                        <TableCell>
                          <Typography
                            variant="body2"
                            style={{ color: routeData.color }}
                          >
                            {routeData.statusText &&
                            routeData.statusText !== "Cargando..."
                              ? routeData.statusText
                              : "Cargando..."}
                          </Typography>
                        </TableCell>

                        {visibleColumns.includes("FECHA") && (
                          <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                        )}
                        {visibleColumns.includes("NUM CLIENTE") && (
                          <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                        )}
                        {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                          <TableCell>
                            {routeData["NOMBRE DEL CLIENTE"]}
                          </TableCell>
                        )}
                        {visibleColumns.includes("MUNICIPIO") && (
                          <TableCell>{routeData.MUNICIPIO}</TableCell>
                        )}
                        {visibleColumns.includes("ESTADO") && (
                          <TableCell>{routeData.ESTADO}</TableCell>
                        )}
                        {visibleColumns.includes("OBSERVACIONES") && (
                          <TableCell>{routeData.OBSERVACIONES}</TableCell>
                        )}
                        {visibleColumns.includes("TOTAL") && (
                          <TableCell>
                            {formatCurrency(routeData.TOTAL)}
                          </TableCell>
                        )}
                        {visibleColumns.includes("NUMERO DE FACTURA") && (
                          <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                        )}
                        {visibleColumns.includes("FECHA DE FACTURA") && (
                          <TableCell>
                            {formatDate(routeData["FECHA_DE_FACTURA"])}
                          </TableCell>
                        )}
                        {visibleColumns.includes("TRANSPORTE") && (
                          <TableCell>{routeData.TRANSPORTE}</TableCell>
                        )}
                        {visibleColumns.includes("PAQUETERIA") && (
                          <TableCell>{routeData.PAQUETERIA}</TableCell>
                        )}
                        {visibleColumns.includes(
                          "FECHA DE ENTREGA (CLIENTE)"
                        ) && (
                          <TableCell>
                            {formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}
                          </TableCell>
                        )}
                        {visibleColumns.includes("Acciones") && (
                          <TableCell>
                            <Grid
                              container
                              spacing={1}
                              justifyContent="flex-start"
                              alignItems="center"
                            >
                              <Grid item>
                                {/* <Grid item>
>>>>>>> origin/master

                                                                    <IconButton
                                                                        onClick={() => {
                                                                            window.open(
                                                                                "https://app2.simpliroute.com/#/planner/vehicles",
                                                                                "_blank"
                                                                            );
                                                                        }}
                                                                        size="small"
                                                                        style={{ color: "#616161" }}
                                                                    >
                                                                        <AirportShuttleIcon />
                                                                    </IconButton>

                                                                </Grid> */}
<<<<<<< HEAD
                                                            </Grid>

                                                            <Grid item>
                                                                <IconButton
                                                                    variant="contained"
                                                                    style={{ color: "black" }} // Negro con texto blanco
                                                                    onClick={() =>
                                                                        generatePDF(routeData["NO ORDEN"])
                                                                    }
                                                                >
                                                                    <ArticleIcon />
                                                                </IconButton>
                                                            </Grid>

                                                            <Grid item>
                                                                {(user?.role === "Admin" ||
                                                                    user?.role === "Trans") && (
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() =>
                                                                                eliminarRuta(routeData["NO ORDEN"])
                                                                            } // Cambiar 'row' a 'routeData'
                                                                            disabled={loading}
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    )}
                                                            </Grid>
                                                        </Grid>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Sub-tab de Venta Empleado */}
                {subTabIndex === 2 && (
                    <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <img
                                src={logo}
                                alt="Filtro"
                                style={{ width: "400px", height: "auto" }}
                            />
                            <Typography variant="h5" style={{ textAlign: "center" }}>
                                Transportes
                            </Typography>

                            <TextField
                                label="Buscar por No Orden o Nombre del Cliente"
                                value={filtroGeneral}
                                onChange={(e) => setFiltroGeneral(e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mr: 2 }}
                            />

                            <TextField
                                label="Buscar por Estado"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </div>

                        <TablePagination
                            component="div"
                            count={ventaEmpleadoFiltrada.length} // O usa directaFiltrada.length o ventaEmpleadoFiltrada.length según la tabla
                            rowsPerPage={10} // Fijado en 10 filas por página
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            labelRowsPerPage="" // Oculta "Rows per page"
                            rowsPerPageOptions={[]} // Elimina el selector de filas
                            style={{ textAlign: "right" }}
                        />

                        <Table>
                            <TableHead>
                                <TableRow>
                                    {visibleColumns.includes("NO ORDEN") && (
                                        <TableCell>NO ORDEN</TableCell>
                                    )}
                                    {visibleColumns.includes("ESTADO") && (
                                        <TableCell>Estado del Pedido</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA") && (
                                        <TableCell>FECHA</TableCell>
                                    )}
                                    {visibleColumns.includes("PARTIDAS") && (
                                        <TableCell>PARTIDAS</TableCell>
                                    )}
                                    {visibleColumns.includes("PIEZAS") && (
                                        <TableCell>PIEZAS</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                                        <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>
                                    )}
                                    {visibleColumns.includes("Acciones") && (
                                        <TableCell>Acciones</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ventaEmpleadoData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={visibleColumns.length}
                                            style={{ textAlign: "center" }}
                                        >
                                            No hay datos disponibles.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ventaEmpleadoFiltrada
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // ✅ PAGINACIÓN SIN AFECTAR FILTROS
                                        .map((routeData, index) => (
                                            <TableRow key={index}>
                                                {visibleColumns.includes("NO ORDEN") && (
                                                    <TableCell>{routeData["NO ORDEN"]}</TableCell>
                                                )}

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        style={{ color: routeData.color }}
                                                    >
                                                        {routeData.statusText &&
                                                            routeData.statusText !== "Cargando..."
                                                            ? routeData.statusText
                                                            : "Cargando..."}
                                                    </Typography>
                                                </TableCell>

                                                {visibleColumns.includes("FECHA") && (
                                                    <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                                                )}
                                                {visibleColumns.includes("PARTIDAS") && (
                                                    <TableCell>{routeData.PARTIDAS}</TableCell>
                                                )}
                                                {visibleColumns.includes("PIEZAS") && (
                                                    <TableCell>{routeData.PIEZAS}</TableCell>
                                                )}

                                                {visibleColumns.includes(
                                                    "FECHA DE ENTREGA (CLIENTE)"
                                                ) && (
                                                        <TableCell>
                                                            {formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}
                                                        </TableCell>
                                                    )}

                                                {visibleColumns.includes(
                                                    "FECHA ESTIMADA DE ENTREGA"
                                                ) && (
                                                        <TableCell>
                                                            {formatDate(routeData.FECHA_ESTIMADA_ENTREGA)}
                                                        </TableCell>
                                                    )}

                                                {visibleColumns.includes("Acciones") && (
                                                    <TableCell>
                                                        <Grid
                                                            container
                                                            spacing={1}
                                                            justifyContent="flex-start"
                                                            alignItems="center"
                                                        >
                                                            <Grid item>
                                                                <IconButton
                                                                    variant="contained"
                                                                    style={{ color: "black" }} // Negro con texto blanco
                                                                    onClick={() =>
                                                                        generatePDF(routeData["NO ORDEN"])
                                                                    }
                                                                >
                                                                    <ArticleIcon />
                                                                </IconButton>
                                                            </Grid>

                                                            <Grid item>
                                                                {(user?.role === "Admin" ||
                                                                    user?.role === "Trans") && (
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() =>
                                                                                eliminarRuta(routeData["NO ORDEN"])
                                                                            } // Cambiar 'row' a 'routeData'
                                                                            disabled={loading}
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    )}

                                                                <Grid item>
                                                                    {(user?.role === "Admin" ||
                                                                        user?.role === "Trans" ||
                                                                        user?.role === "Embar") && (
                                                                            <IconButton
                                                                                style={{ color: "#1976D2" }} // Azul
                                                                                onClick={() =>
                                                                                    openDirectaModal(routeData)
                                                                                }
                                                                            >
                                                                                <BorderColorIcon />
                                                                            </IconButton>
                                                                        )}
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Sub-tab de Asignación */}
                {subTabIndex === 3 && (
                    <TableContainer
                        component={Paper}
                        style={{ marginTop: "20px", padding: "20px" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <img
                                src={logo}
                                alt="Filtro"
                                style={{ width: "400px", height: "auto" }}
                            />
                            <Typography variant="h5" style={{ textAlign: "center" }}>
                                Transportes
                            </Typography>

                            <TextField
                                label="Buscar por No. Orden, Cliente o Num. Cliente"
                                value={filtroGeneralAsignacion}
                                onChange={(e) => setFiltroGeneralAsignacion(e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mr: 2 }}
                            />

                            <TextField
                                label="Buscar por Estado"
                                value={filtroEstadoAsignacion}
                                onChange={(e) => setFiltroEstadoAsignacion(e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </div>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    {visibleColumns.includes("ESTADO") && (
                                        <TableCell>Estado del Pedido</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA") && (
                                        <TableCell>FECHA</TableCell>
                                    )}
                                    {visibleColumns.includes("NO ORDEN") && (
                                        <TableCell>NO ORDEN</TableCell>
                                    )}
                                    {visibleColumns.includes("NO ORDEN") && (
                                        <TableCell>EJECUTIVO VTAS</TableCell>
                                    )}
                                    {visibleColumns.includes("GUIA") && (
                                        <TableCell>GUIA</TableCell>
                                    )}
                                    {visibleColumns.includes("NUMERO DE FACTURA") && (
                                        <TableCell>NUMERO DE FACTURA</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE FACTURA") && (
                                        <TableCell>FECHA DE FACTURA</TableCell>
                                    )}
                                    {visibleColumns.includes("NUM CLIENTE") && (
                                        <TableCell>NUM CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("TRANSPORTE") && (
                                        <TableCell>TRANSPORTE / RUTA</TableCell>
                                    )}
                                    {visibleColumns.includes("TOTAL") && (
                                        <TableCell>TOTAL</TableCell>
                                    )}
                                    {visibleColumns.includes("TOTAL FACTURA LT") && (
                                        <TableCell>COSTO DEL FLETE</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE EMBARQUE") && (
                                        <TableCell>FECHA DE EMBARQUE</TableCell>
                                    )}
                                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                                        <TableCell>FECHA DE ENTREGA CLIENTE</TableCell>
                                    )}
                                    {visibleColumns.includes("PARTIDAS") && (
                                        <TableCell>PARTIDAS</TableCell>
                                    )}
                                    {visibleColumns.includes("PIEZAS") && (
                                        <TableCell>PIEZAS</TableCell>
                                    )}
                                    {visibleColumns.includes("CAJAS") && (
                                        <TableCell>CAJAS</TableCell>
                                    )}
                                    {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (
                                        <TableCell>DIA EN QUE ESTA EN RUTA</TableCell>
                                    )}
                                    {visibleColumns.includes("DIAS DE ENTREGA") && (
                                        <TableCell>DIAS DE ENTREGA</TableCell>
                                    )}
                                    {visibleColumns.includes(
                                        "ENTREGA SATISFACTORIA O NO SATISFACTORIA"
                                    ) && (
                                            <TableCell>
                                                ENTREGA SATISFACTORIA O NO SATISFACTORIA
                                            </TableCell>
                                        )}
                                    {visibleColumns.includes("MOTIVO") && (
                                        <TableCell>MOTIVO</TableCell>
                                    )}
                                    {visibleColumns.includes("DIFERENCIA") && (
                                        <TableCell>DIFERENCIA</TableCell>
                                    )}
                                    {visibleColumns.includes("Acciones") && (
                                        <TableCell>Acciones</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedAsignacion.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={visibleColumns.length}
                                            style={{ textAlign: "center" }}
                                        >
                                            No hay datos disponibles.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedAsignacion.map((routeData, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    style={{ color: routeData.color }}
                                                >
                                                    {routeData.statusText &&
                                                        routeData.statusText !== "Cargando..."
                                                        ? routeData.statusText
                                                        : "Cargando..."}
                                                </Typography>
                                            </TableCell>

                                            {visibleColumns.includes("FECHA") && (
                                                <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                                            )}
                                            {visibleColumns.includes("NO ORDEN") && (
                                                <TableCell>{routeData["NO ORDEN"]}</TableCell>
                                            )}
                                            {visibleColumns.includes("NO ORDEN") && (
                                                <TableCell>{routeData["EJECUTIVO VTAS"] || "Sin Ejecutivo"}</TableCell>
                                            )}
                                            {visibleColumns.includes("GUIA") && (
                                                <TableCell>{routeData.GUIA}</TableCell>
                                            )}
                                            {visibleColumns.includes("NUMERO DE FACTURA") && (
                                                <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                                            )}
                                            {visibleColumns.includes("FECHA DE FACTURA") && (
                                                <TableCell>
                                                    {formatDate(routeData["FECHA DE FACTURA"])}
                                                </TableCell>
                                            )}
                                            {visibleColumns.includes("NUM CLIENTE") && (
                                                <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                                            )}
                                            {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                                                <TableCell>{routeData["NOMBRE DEL CLIENTE"]}</TableCell>
                                            )}
                                            {visibleColumns.includes("PAQUETERIA") && (
                                                <TableCell>{routeData.PAQUETERIA}</TableCell>
                                            )}
                                            {visibleColumns.includes("TOTAL") && (
                                                <TableCell>{formatCurrency(routeData.TOTAL)}</TableCell>
                                            )}
                                            {visibleColumns.includes("TOTAL FACTURA LT") && (
                                                <TableCell>
                                                    {routeData.TOTAL_FACTURA_LT &&
                                                        !isNaN(parseFloat(routeData.TOTAL_FACTURA_LT))
                                                        ? formatCurrency(
                                                            parseFloat(routeData.TOTAL_FACTURA_LT)
                                                        )
                                                        : "$0.00"}
                                                </TableCell>
                                            )}
                                            {visibleColumns.includes("FECHA DE EMBARQUE") && (
                                                <TableCell>
                                                    {loading
                                                        ? "Cargando..."
                                                        : fechasEmbarque[routeData["NO ORDEN"]]
                                                            ? formatDate(fechasEmbarque[routeData["NO ORDEN"]])
                                                            : "Sin fecha"}
                                                </TableCell>
                                            )}
                                            {visibleColumns.includes(
                                                "FECHA DE ENTREGA (CLIENTE)"
                                            ) && (
                                                    <TableCell>
                                                        {formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}
                                                    </TableCell>
                                                )}
                                            {visibleColumns.includes("PARTIDAS") && (
                                                <TableCell>{routeData.PARTIDAS}</TableCell>
                                            )}
                                            {visibleColumns.includes("PIEZAS") && (
                                                <TableCell>{routeData.PIEZAS}</TableCell>
                                            )}
                                            {visibleColumns.includes("CAJAS") && (
                                                <TableCell>{routeData.totalCajas}</TableCell>
                                            )}
                                            {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (
                                                <TableCell>
                                                    {formatDate(routeData.ultimaFechaEmbarque)}
                                                </TableCell>
                                            )}
                                            {visibleColumns.includes("DIAS DE ENTREGA") && (
                                                <TableCell>{routeData.DIAS_DE_ENTREGA}</TableCell>
                                            )}
                                            {visibleColumns.includes(
                                                "ENTREGA SATISFACTORIA O NO SATISFACTORIA"
                                            ) && (
                                                    <TableCell>
                                                        {routeData.ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA}
                                                    </TableCell>
                                                )}
                                            {visibleColumns.includes("MOTIVO") && (
                                                <TableCell>{routeData.MOTIVO}</TableCell>
                                            )}
                                            {visibleColumns.includes("DIFERENCIA") && (
                                                <TableCell>{routeData.DIFERENCIA}</TableCell>
                                            )}

                                            {visibleColumns.includes("Acciones") && (
                                                <TableCell>
                                                    <Grid item>
                                                        <IconButton
                                                            onClick={() => {
                                                                const url = getTransportUrl(
                                                                    routeData.PAQUETERIA
                                                                );
                                                                window.open(url, "_blank");
                                                            }}
                                                            size="small"
                                                            style={{ color: "#616161" }}
                                                        >
                                                            <AirportShuttleIcon />
                                                        </IconButton>
                                                    </Grid>

                                                    <Grid item>
                                                        <IconButton
                                                            variant="contained"
                                                            style={{ color: "black" }}
                                                            onClick={() => generatePDF(routeData["NO ORDEN"])}
                                                        >
                                                            <ArticleIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={filteredAsignacion.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </TableContainer>
                )}

            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                action={
                    <IconButton
                        size="small"
                        color="inherit"
                        onClick={handleSnackbarClose}
                    >
                        <CloseIcon fontSize="small" />{" "}
                    </IconButton>
                }
            />
        </Paper>
    );
=======
                              </Grid>

                              <Grid item>
                                <IconButton
                                  variant="contained"
                                  style={{ color: "black" }} // Negro con texto blanco
                                  onClick={() =>
                                    generatePDF(routeData["NO ORDEN"])
                                  }
                                >
                                  <ArticleIcon />
                                </IconButton>
                              </Grid>

                              <Grid item>
                                {(user?.role === "Admin" ||
                                  user?.role === "Trans") && (
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      eliminarRuta(routeData["NO ORDEN"])
                                    } // Cambiar 'row' a 'routeData'
                                    disabled={loading}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Grid>
                            </Grid>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Sub-tab de Venta Empleado */}
        {subTabIndex === 2 && (
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <img
                src={logo}
                alt="Filtro"
                style={{ width: "400px", height: "auto" }}
              />
              <Typography variant="h5" style={{ textAlign: "center" }}>
                Transportes
              </Typography>

              <TextField
                label="Buscar por No Orden o Nombre del Cliente"
                value={filtroGeneral}
                onChange={(e) => setFiltroGeneral(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
              />

              <TextField
                label="Buscar por Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                variant="outlined"
                size="small"
              />
            </div>

            <TablePagination
              component="div"
              count={ventaEmpleadoFiltrada.length} // O usa directaFiltrada.length o ventaEmpleadoFiltrada.length según la tabla
              rowsPerPage={10} // Fijado en 10 filas por página
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              labelRowsPerPage="" // Oculta "Rows per page"
              rowsPerPageOptions={[]} // Elimina el selector de filas
              style={{ textAlign: "right" }}
            />

            <Table>
              <TableHead>
                <TableRow>
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>NO ORDEN</TableCell>
                  )}
                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>Estado del Pedido</TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>FECHA</TableCell>
                  )}
                  {visibleColumns.includes("PARTIDAS") && (
                    <TableCell>PARTIDAS</TableCell>
                  )}
                  {visibleColumns.includes("PIEZAS") && (
                    <TableCell>PIEZAS</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                    <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>
                  )}
                  {visibleColumns.includes("Acciones") && (
                    <TableCell>Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {ventaEmpleadoData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      style={{ textAlign: "center" }}
                    >
                      No hay datos disponibles.
                    </TableCell>
                  </TableRow>
                ) : (
                  ventaEmpleadoFiltrada
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // ✅ PAGINACIÓN SIN AFECTAR FILTROS
                    .map((routeData, index) => (
                      <TableRow key={index}>
                        {visibleColumns.includes("NO ORDEN") && (
                          <TableCell>{routeData["NO ORDEN"]}</TableCell>
                        )}

                        <TableCell>
                          <Typography
                            variant="body2"
                            style={{ color: routeData.color }}
                          >
                            {routeData.statusText &&
                            routeData.statusText !== "Cargando..."
                              ? routeData.statusText
                              : "Cargando..."}
                          </Typography>
                        </TableCell>

                        {visibleColumns.includes("FECHA") && (
                          <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                        )}
                        {visibleColumns.includes("PARTIDAS") && (
                          <TableCell>{routeData.PARTIDAS}</TableCell>
                        )}
                        {visibleColumns.includes("PIEZAS") && (
                          <TableCell>{routeData.PIEZAS}</TableCell>
                        )}

                        {visibleColumns.includes(
                          "FECHA DE ENTREGA (CLIENTE)"
                        ) && (
                          <TableCell>
                            {formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}
                          </TableCell>
                        )}

                        {visibleColumns.includes(
                          "FECHA ESTIMADA DE ENTREGA"
                        ) && (
                          <TableCell>
                            {formatDate(routeData.FECHA_ESTIMADA_ENTREGA)}
                          </TableCell>
                        )}

                        {visibleColumns.includes("Acciones") && (
                          <TableCell>
                            <Grid
                              container
                              spacing={1}
                              justifyContent="flex-start"
                              alignItems="center"
                            >
                              <Grid item>
                                <IconButton
                                  variant="contained"
                                  style={{ color: "black" }} // Negro con texto blanco
                                  onClick={() =>
                                    generatePDF(routeData["NO ORDEN"])
                                  }
                                >
                                  <ArticleIcon />
                                </IconButton>
                              </Grid>

                              <Grid item>
                                {(user?.role === "Admin" ||
                                  user?.role === "Trans") && (
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      eliminarRuta(routeData["NO ORDEN"])
                                    } // Cambiar 'row' a 'routeData'
                                    disabled={loading}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}

                                <Grid item>
                                  {(user?.role === "Admin" ||
                                    user?.role === "Trans" ||
                                    user?.role === "Embar") && (
                                    <IconButton
                                      style={{ color: "#1976D2" }} // Azul
                                      onClick={() =>
                                        openDirectaModal(routeData)
                                      }
                                    >
                                      <BorderColorIcon />
                                    </IconButton>
                                  )}
                                </Grid>
                              </Grid>
                            </Grid>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Sub-tab de Asignación */}
        {subTabIndex === 3 && (
          <TableContainer
            component={Paper}
            style={{ marginTop: "20px", padding: "20px" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <img
                src={logo}
                alt="Filtro"
                style={{ width: "400px", height: "auto" }}
              />
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontWeight: "bold",
                  color: "#333",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#ff6600")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              >
                <option value="">Últimos 3 días</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                {/* <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option> */}
              </select>
              <Typography variant="h5" style={{ textAlign: "center" }}>
                Transportes
              </Typography>

              <TextField
                label="Buscar por No. Orden, Cliente o Num. Cliente"
                value={filtroGeneralAsignacion}
                onChange={(e) => setFiltroGeneralAsignacion(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
              />

              <TextField
                label="Buscar por Estado"
                value={filtroEstadoAsignacion}
                onChange={(e) => setFiltroEstadoAsignacion(e.target.value)}
                variant="outlined"
                size="small"
              />
            </div>

            <Table>
              <TableHead>
                <TableRow>
                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>Estado del Pedido</TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>FECHA</TableCell>
                  )}
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>NO ORDEN</TableCell>
                  )}
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>EJECUTIVO VTAS</TableCell>
                  )}
                  {visibleColumns.includes("GUIA") && (
                    <TableCell>GUIA</TableCell>
                  )}
                  {visibleColumns.includes("NUMERO DE FACTURA") && (
                    <TableCell>NUMERO DE FACTURA</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE FACTURA") && (
                    <TableCell>FECHA DE FACTURA</TableCell>
                  )}
                  {visibleColumns.includes("NUM CLIENTE") && (
                    <TableCell>NUM CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("TRANSPORTE") && (
                    <TableCell>TRANSPORTE / RUTA</TableCell>
                  )}
                  {visibleColumns.includes("TOTAL") && (
                    <TableCell>TOTAL</TableCell>
                  )}
                  {visibleColumns.includes("TOTAL FACTURA LT") && (
                    <TableCell>COSTO DEL FLETE</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE EMBARQUE") && (
                    <TableCell>FECHA DE EMBARQUE</TableCell>
                  )}
                  {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
                    <TableCell>FECHA DE ENTREGA CLIENTE</TableCell>
                  )}
                  {visibleColumns.includes("PARTIDAS") && (
                    <TableCell>PARTIDAS</TableCell>
                  )}
                  {visibleColumns.includes("PIEZAS") && (
                    <TableCell>PIEZAS</TableCell>
                  )}
                  {visibleColumns.includes("CAJAS") && (
                    <TableCell>CAJAS</TableCell>
                  )}
                  {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (
                    <TableCell>DIA EN QUE ESTA EN RUTA</TableCell>
                  )}
                  {visibleColumns.includes("DIAS DE ENTREGA") && (
                    <TableCell>DIAS DE ENTREGA</TableCell>
                  )}
                  {visibleColumns.includes(
                    "ENTREGA SATISFACTORIA O NO SATISFACTORIA"
                  ) && (
                    <TableCell>
                      ENTREGA SATISFACTORIA O NO SATISFACTORIA
                    </TableCell>
                  )}
                  {visibleColumns.includes("MOTIVO") && (
                    <TableCell>MOTIVO</TableCell>
                  )}
                  {visibleColumns.includes("DIFERENCIA") && (
                    <TableCell>DIFERENCIA</TableCell>
                  )}
                  {visibleColumns.includes("Acciones") && (
                    <TableCell>Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedAsignacion.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      style={{ textAlign: "center" }}
                    >
                      No hay datos disponibles.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAsignacion.map((routeData, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          style={{ color: routeData.color }}
                        >
                          {routeData.statusText &&
                          routeData.statusText !== "Cargando..."
                            ? routeData.statusText
                            : "Cargando..."}
                        </Typography>
                      </TableCell>

                      {visibleColumns.includes("FECHA") && (
                        <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                      )}
                      {visibleColumns.includes("NO ORDEN") && (
                        <TableCell>{routeData["NO ORDEN"]}</TableCell>
                      )}
                      {visibleColumns.includes("NO ORDEN") && (
                        <TableCell>
                          {routeData["EJECUTIVO VTAS"] || "Sin Ejecutivo"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("GUIA") && (
                        <TableCell>{routeData.GUIA}</TableCell>
                      )}
                      {visibleColumns.includes("NUMERO DE FACTURA") && (
                        <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                      )}
                      {visibleColumns.includes("FECHA DE FACTURA") && (
                        <TableCell>
                          {formatDate(routeData["FECHA_DE_FACTURA"])}
                        </TableCell>
                      )}
                      {visibleColumns.includes("NUM CLIENTE") && (
                        <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                      )}
                      {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                        <TableCell>{routeData["NOMBRE DEL CLIENTE"]}</TableCell>
                      )}
                      {visibleColumns.includes("PAQUETERIA") && (
                        <TableCell>{routeData.PAQUETERIA}</TableCell>
                      )}
                      {visibleColumns.includes("TOTAL") && (
                        <TableCell>{formatCurrency(routeData.TOTAL)}</TableCell>
                      )}
                      {visibleColumns.includes("TOTAL FACTURA LT") && (
                        <TableCell>
                          {routeData.TOTAL_FACTURA_LT &&
                          !isNaN(parseFloat(routeData.TOTAL_FACTURA_LT))
                            ? formatCurrency(
                                parseFloat(routeData.TOTAL_FACTURA_LT)
                              )
                            : "$0.00"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("FECHA DE EMBARQUE") && (
                        <TableCell>
                          {loading
                            ? "Cargando..."
                            : fechasEmbarque[routeData["NO ORDEN"]]
                            ? formatDate(fechasEmbarque[routeData["NO ORDEN"]])
                            : "Sin fecha"}
                        </TableCell>
                      )}
                      {visibleColumns.includes(
                        "FECHA DE ENTREGA (CLIENTE)"
                      ) && (
                        <TableCell>
                          {formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}
                        </TableCell>
                      )}
                      {visibleColumns.includes("PARTIDAS") && (
                        <TableCell>{routeData.PARTIDAS}</TableCell>
                      )}
                      {visibleColumns.includes("PIEZAS") && (
                        <TableCell>{routeData.PIEZAS}</TableCell>
                      )}
                      {visibleColumns.includes("CAJAS") && (
                        <TableCell>{routeData.totalCajas}</TableCell>
                      )}
                      {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (
                        <TableCell>
                          {formatDate(routeData.ultimaFechaEmbarque)}
                        </TableCell>
                      )}
                      {visibleColumns.includes("DIAS DE ENTREGA") && (
                        <TableCell>{routeData.DIAS_DE_ENTREGA}</TableCell>
                      )}
                      {visibleColumns.includes(
                        "ENTREGA SATISFACTORIA O NO SATISFACTORIA"
                      ) && (
                        <TableCell>
                          {routeData.ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA}
                        </TableCell>
                      )}
                      {visibleColumns.includes("MOTIVO") && (
                        <TableCell>{routeData.MOTIVO}</TableCell>
                      )}
                      {visibleColumns.includes("DIFERENCIA") && (
                        <TableCell>{routeData.DIFERENCIA}</TableCell>
                      )}

                      {visibleColumns.includes("Acciones") && (
                        <TableCell>
                          <Grid item>
                            <IconButton
                              onClick={() => {
                                const url = getTransportUrl(
                                  routeData.PAQUETERIA
                                );
                                window.open(url, "_blank");
                              }}
                              size="small"
                              style={{ color: "#616161" }}
                            >
                              <AirportShuttleIcon />
                            </IconButton>
                          </Grid>

                          <Grid item>
                            <IconButton
                              variant="contained"
                              style={{ color: "black" }}
                              onClick={() => generatePDF(routeData["NO ORDEN"])}
                            >
                              <ArticleIcon />
                            </IconButton>
                          </Grid>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredAsignacion.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />{" "}
          </IconButton>
        }
      />
    </Paper>
  );
>>>>>>> origin/master
}

export default Tracking;

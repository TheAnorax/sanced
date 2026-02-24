import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { UserContext } from "../context/UserContext";
import ArticleIcon from "@mui/icons-material/Article";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Autocomplete from "@mui/material/Autocomplete";
import { CloudUpload } from "@mui/icons-material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Tooltip } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import moment from "moment";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import Swal from "sweetalert2";

import { NumerosALetras } from "numero-a-letras";

import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import ButtonGroup from "@mui/material/ButtonGroup";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";

import SearchIcon from "@mui/icons-material/Search";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import SyncIcon from "@mui/icons-material/Sync";
import HistoryIcon from "@mui/icons-material/History";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RouteIcon from "@mui/icons-material/Route";
import BadgeIcon from "@mui/icons-material/Badge";

import axios from "axios";
import {
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
  FormControlLabel,
} from "@mui/material";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./Packing.jpg";
import infoBancaria from "./informacion_bancaria.jpg";
import barraFooter from "./BARRA.jpg";

// import logo from "./logos.jpg";

const hasExpired = (timestamp) => {
  const now = new Date().getTime();
  return now - timestamp > 500 * 24 * 60 * 60 * 1000; // 500 días
};

function Transporte() {
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

  const [sentRoutesData, setSentRoutesData] = useState([]);

  const [anio, setAnio] = useState(2026);

  const [filtro, setFiltro] = useState("");

  const [numeroFacturaGrupo, setNumeroFacturaGrupo] = useState("");

  const [mes, setMes] = useState(""); // 1 - 12
  const [rutas, setRutas] = useState([]);

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

    // console.log(`🔍 Se ejecutará fetchStatuses para la pestaña: ${tabName}`);
    fetchFusions(filteredData)
      .then(() => fetchStatuses(filteredData, tabName))
      .catch((error) => console.error(error))
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [subTabIndex, sentRoutesData]);

  const fetchStatuses = async (data, tabName) => {
    if (data.length === 0) return;

    // console.log(`📌 Buscando estado de pedidos en la pestaña: ${tabName}`);
    const orderNumbers = data.map((d) => d["NO ORDEN"]);
    // console.log("📌 Enviando estos números de orden:", orderNumbers);

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
        `http://66.232.105.87:3007/api/Trasporte/status`,
        { orderNumbers }
      );

      // console.log(` Respuesta recibida para ${tabName}:`, response.data);

      const statusMap = response.data;

      setSentRoutesData((prevData) => {
        const updatedData = prevData.map((route) => {
          const currentStatus = statusMap[route["NO ORDEN"]];
          if (!currentStatus) return route; //  Si no hay actualización, deja igual

          const prevPriority = statusPriority[route.statusText] || 0;
          const newPriority = statusPriority[currentStatus.statusText] || 0;

          let updatedRoute = { ...route };

          //  Solo actualizar si el nuevo status es mejor o igual
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
    // console.log("🔄 Consultando fusión para pedidos:", orderNumbers);

    try {
      const response = await axios.post(
        `http://66.232.105.87:3007/api/Trasporte/fusion`,
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
          // console.warn(
          //   "⚠️ No se guardó 'sentRoutesData': excede los 5MB (~" +
          //     sizeInKB.toFixed(2) +
          //     "KB)"
          // );
        }

        localStorage.setItem("transporteTimestamp", new Date().getTime());
      }
    } catch (error) {
      console.error("❌ Error guardando en localStorage:", error);
    }
  }, [data, groupedData, sentRoutesData]);

  useEffect(() => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = 2026; // o new Date().getFullYear()

    fetchPaqueteriaRoutes({
      mes: mesActual,
      anio: anioActual,
    });
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

  //subor archivo o carga de la api
  dayjs.extend(isSameOrAfter);

  const getLastBusinessDays = (numDays) => {
    const businessDays = [];
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    while (businessDays.length < numDays) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        businessDays.push(new Date(current));
      }
      current.setDate(current.getDate() - 1);
    }

    return businessDays.map((d) => d.toISOString().split("T")[0]);
  };

  const [modoCarga, setModoCarga] = useState("api"); // o "excel"

  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const mes = new Date().getMonth() + 1;
    return mes.toString();
  });

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
    "EJECUTIVO VTAS": row["Ejecutico Vtas"] || "",
    "TIPO ORIGINAL": row["Tipo"] || "",
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    // 🔹 Función para generar clave única
    const buildKey = (orden, tipo) => {
      return `${String(orden || "").trim()}_${String(tipo || "")
        .trim()
        .toUpperCase()}`;
    };

    // 🔹 Pedidos ya registrados en BD
    const registradosRes = await axios.get(
      "http://66.232.105.87:3007/api/Trasporte/pedidosRegistrados"
    );
    const pedidosRegistradosDB = new Set(
      registradosRes.data.map((r) => buildKey(r.no_orden, r.tipo_original))
    );

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        range: 6, // Omitir las primeras 6 filas
      });

      // 🔹 Pedidos ya registrados (de BD + enviados + asignados)
      const pedidosRegistrados = new Set([...pedidosRegistradosDB]);

      // Pedidos ya enviados
      sentRoutesData.forEach((r) =>
        pedidosRegistrados.add(
          buildKey(r["NO ORDEN"], r["TIPO ORIGINAL"] || r["tipo_original"])
        )
      );

      // Pedidos ya asignados a rutas
      Object.values(groupedData).forEach((route) => {
        route.rows.forEach((r) =>
          pedidosRegistrados.add(
            buildKey(r["NO ORDEN"], r["TIPO ORIGINAL"] || r["tipo_original"])
          )
        );
      });

      // 🔹 Obtener últimos 3 días hábiles
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
      const lastBusinessDays = getLastBusinessDays(3);

      // 🔹 Pedidos con 'Lista Surtido'
      const filteredData = jsonData
        .map((row) => {
          if (!row["Fecha Lista Surtido"]) return null;

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
          const key = buildKey(
            row["NO ORDEN"],
            row["TIPO ORIGINAL"] || row["tipo_original"]
          );
          return key && !pedidosRegistrados.has(key);
        });

      // 🔹 Pedidos Facturados
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

        let pedidosSeleccionados = [];

        if (userInput) {
          const ordenesSeleccionadas = userInput
            .split(",")
            .map((num) => num.trim());
          pedidosSeleccionados = facturados.filter((row) =>
            ordenesSeleccionadas.includes(String(row["No Orden"]).trim())
          );
        } else {
          pedidosSeleccionados = facturados;
        }

        const mappedFacturados = pedidosSeleccionados
          .map(mapColumns)
          .filter((row) => {
            const key = buildKey(
              row["NO ORDEN"],
              row["TIPO ORIGINAL"] || row["tipo_original"]
            );
            return key && !pedidosRegistrados.has(key);
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
      // console.log("🟢 Ejecutando cálculo de totales con data:", data);
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

    // console.log("📊 Iniciando cálculo de totales...");

    data.forEach((row) => {
      // console.log("🔍 Registro:", row);

      if (!row["Fecha Lista Surtido"]) {
        // console.warn("⚠️ Registro sin 'Fecha Lista Surtido':", row);
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
        // console.warn("🚨 Fecha inválida en fila:", row["Fecha Lista Surtido"]);
        return;
      }

      // console.log(`📅 Pedido con fecha: ${fechaSurtidoObj.toDateString()}`);

      if (isSameDay(fechaSurtidoObj, today)) {
        let orderTotal = row["Total"] || "0"; // Asegurar que no sea undefined
        orderTotal =
          parseFloat(orderTotal.toString().replace(/[$,]/g, "")) || 0;

        // console.log(`📝 Pedido ${row["NO ORDEN"]} → Total: ${orderTotal}`);

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
    // console.log(" Total Clientes:", totalClientes);
    // console.log(" Total Pedidos:", totalPedidos);
    // console.log(" Total General:", totalGeneral);

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

    //  Agregar la ruta a las opciones del Autocomplete
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
        // console.log( `⚠ Pedido ${item["NO ORDEN"]} ya está en la ruta ${newRoute}, no se hace nada.`);
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
      const observacionActual =
        observacionesPorRegistro[item["NUM. CLIENTE"]] ||
        item.OBSERVACIONES ||
        "";

      //  4. Agregar el pedido a la nueva ruta, asegurando que conserve las observaciones
      updatedGroupedData[newRoute].rows.push({
        ...item,
        OBSERVACIONES: observacionActual,
      });
      updatedGroupedData[newRoute].TOTAL += item.TOTAL;
      updatedGroupedData[newRoute].PARTIDAS += item.PARTIDAS;
      updatedGroupedData[newRoute].PIEZAS += item.PIEZAS;

      // console.log(
      //   ` Pedido ${item["NO ORDEN"]} movido de ${
      //     oldRoute || "Ninguna"
      //   } a ${newRoute}`
      // );

      //  5. Guardar cambios en `localStorage`
      localStorage.setItem(
        "transporteGroupedData",
        JSON.stringify(updatedGroupedData)
      );

      //  **Guardar las observaciones en localStorage**
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

    // console.log("🚀 Se eliminaron pedidos duplicados en las rutas.");
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

    //  Asegurar que el total no disminuya
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

      // console.log(
      //   ` Ruta renombrada de '${oldRouteName}' a '${newRouteName}' sin perder datos.`
      // );

      return updatedData;
    });

    // Cerrar edición después de renombrar
    setEditingRoute(null);
  };

  const [editingRoute, setEditingRoute] = useState(null);
  const [newRouteName, setNewRouteName] = useState("");

  const openModal = async (route) => {
    setSelectedRoute(route);
    setModalOpen(true);

    // 🔹 Obtiene todos los NUM. CLIENTE de la ruta seleccionada
    const clientesDeRuta = [
      ...new Set(
        groupedData[route]?.rows?.map((r) => r["NUM. CLIENTE"]).filter(Boolean)
      ),
    ];

    if (clientesDeRuta.length > 0) {
      await fetchObservacionPorRegistro(clientesDeRuta);
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

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1 // mes actual
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() // año actual
  );

  const fetchPaqueteriaRoutes = async ({
    filtro = "",
    desde = "",
    hasta = "",
    mes = "",
    anio = "",
  } = {}) => {
    try {
      let url = `http://66.232.105.87:3007/api/Trasporte/rutas?expandir=true`;

      if (filtro) url += `&guia=${filtro}`;
      if (desde && hasta) url += `&desde=${desde}&hasta=${hasta}`;
      if (mes) url += `&mes=${mes}`;
      if (anio) url += `&anio=${anio}`; // 🔥 CLAVE

      console.log("URL FINAL:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setSentRoutesData(data);
      } else {
        setSentRoutesData([]);
      }
    } catch (error) {
      console.error("Error al obtener rutas:", error);
      setSentRoutesData([]);
    }
  };

  useEffect(() => {
    if (!Array.isArray(sentRoutesData) || sentRoutesData.length === 0) {
      // console.warn(
      //   "⚠ No hay datos en sentRoutesData, las tablas estarán vacías"
      // );
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
    // console.log("🔄 Cambio de pestaña activa:", subTabIndex);
  }, [subTabIndex]);

  const fetchAdditionalData = async (noOrden) => {
    try {
      const url = `http://66.232.105.87:3007/api/Trasporte/pedido/detalles/${noOrden}`; // Usamos el parámetro en la URL
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

  const fetchObservacionPorRegistro = async (clientesArray) => {
    if (!clientesArray || clientesArray.length === 0) return;

    try {
      const response = await axios.post(
        "http://66.232.105.87:3007/api/Trasporte/clientes/observaciones",
        { clientes: clientesArray }
      );

      const observaciones = response.data;

      // 🔹 Actualiza groupedData (donde el modal obtiene los datos)
      setGroupedData((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((routeName) => {
          updated[routeName].rows = updated[routeName].rows.map((row) => ({
            ...row,
            OBSERVACIONES:
              row.OBSERVACIONES && row.OBSERVACIONES.trim() !== ""
                ? row.OBSERVACIONES
                : observaciones[row["NUM. CLIENTE"]] &&
                  observaciones[row["NUM. CLIENTE"]].trim() !== ""
                ? observaciones[row["NUM. CLIENTE"]]
                : "Sin observaciones",
          }));
        });

        return updated;
      });

      console.log(" Observaciones actualizadas:", observaciones);
    } catch (error) {
      console.error(" Error al obtener observaciones:", error);
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
              ...row,
              routeName: route,
              OBSERVACIONES:
                row.OBSERVACIONES && row.OBSERVACIONES.trim() !== ""
                  ? row.OBSERVACIONES
                  : "Sin observaciones",

              TIPO: tipoRutaActual,
              GUIA: guiaEnviar,
              tipo_original:
                row["TIPO ORIGINAL"] ||
                row.tipo ||
                row.TIPO ||
                row.tipo_original ||
                null,
            });
          });
        } else {
          console.warn(`⚠ Ruta ${route} no tiene datos o filas definidas.`);
        }
      });

      // 👀 Aquí verás exactamente qué se va a insertar
      console.log("🚀 Datos listos para insertar:", newSentRoutesData);

      try {
        const response = await fetch(
          "http://66.232.105.87:3007/api/Trasporte/insertarRutas",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rutas: newSentRoutesData }),
          }
        );

        console.log("📩 Enviando a backend:", {
          url: "http://66.232.105.87:3007/api/Trasporte/insertarRutas",
          body: { rutas: newSentRoutesData },
        });

        if (response.ok) {
          const result = await response.json();
          console.log(" Respuesta del servidor:", result);

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
          console.error(
            "⚠ Error en la respuesta del backend:",
            response.status
          );
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

  const [selectedId, setSelectedId] = useState(null);

  const actualizarGuia = async () => {
    if (!selectedId || !guia) {
      Swal.fire("❌", "Faltan datos para actualizar.", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://66.232.105.87:3007/api/Trasporte/paqueteria/actualizar-guia/${selectedId}`,
        {
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
            diferencia,
            noFactura,
            fechaFactura,
            tarimas,
            numeroFacturaLT,
            observaciones,
            tipo,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire("", data.message, "success");
        setDirectaModalOpen(false);
        fetchPaqueteriaRoutes({
          mes: selectedMonth || localStorage.getItem("mesSeleccionado") || "",
        });
      } else {
        Swal.fire("⚠", data.message || "Error al actualizar", "warning");
      }
    } catch (error) {
      console.error(" Error en la actualización:", error);
      Swal.fire("", "Error al actualizar la guía.", "error");
    }
  };

  const handleReenrutar = async () => {
    if (!selectedId || !paqueteria) {
      Swal.fire(
        "❌",
        "Debes seleccionar una paquetería para reenrutar.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(
        `http://66.232.105.87:3007/api/Trasporte/paqueteria/actualizar-guia/${selectedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paqueteria,
            transporte: paqueteria,
            reenrutar: true, // 👈 activa el modo reenruteo
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire("🚚", data.message, "success");
        setDirectaModalOpen(false);
        fetchPaqueteriaRoutes({
          mes: selectedMonth || localStorage.getItem("mesSeleccionado") || "",
        });
      } else {
        Swal.fire("⚠", data.message || "Error al reenrutar", "warning");
      }
    } catch (error) {
      console.error("❌ Error al reenrutar:", error);
      Swal.fire("❌", "Error al reenrutar la guía.", "error");
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
        ],
      },
      {
        name: "OBSERVACIONES",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "TOTAL",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "PQ1",
          "Tran",
          "Rep",
          "AdminTran",
        ],
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
          "AdminTran",
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
          "AdminTran",
        ],
      },
      {
        name: "ZONA",
        role: ["Admin", "Master", "Rep", "Trans", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "TIPO DE ZONA",
        role: ["Admin", "Master", "Rep", "Trans", "Tran", "Rep", "AdminTran"],
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
          "AdminTran",
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
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "FECHA DE EMBARQUE",
        role: ["Admin", "Master", "Rep", "Trans", "Tran", "Rep", "AdminTran"],
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
        ],
      },
      {
        name: "TARIMAS",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Rep",
          "Paquet",
          "Tran",
          "Rep",
          "AdminTran",
        ],
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
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
          "AdminTran",
        ],
      },
      {
        name: "FECHA ESTIMADA DE ENTREGA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "DIAS DE ENTREGA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
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
          "AdminTran",
        ],
      },
      {
        name: "MOTIVO",
        role: ["Admin", "Master", "Trans", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "NUMERO DE FACTURA LT",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "TOTAL FACTURA LT",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Paquet",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "PRORRATEO $ FACTURA LT",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "PRORRATEO $ FACTURA PAQUETERIA",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "GASTOS EXTRAS",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "SUMA FLETE",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "% ENVIO",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "% PAQUETERIA",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "SUMA GASTOS EXTRAS",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "% GLOBAL",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
      },
      {
        name: "DIFERENCIA",
        role: ["Admin", "Master", "Trans", "Rep", "Tran", "Rep", "AdminTran"],
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
          "AdminTran",
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
          "AdminTran",
        ],
      },
      {
        name: "EMPRESA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Control",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "CLAVE",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Control",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "ACCIONES",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Control",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
      },
      {
        name: "REG_ENTRADA",
        role: [
          "Admin",
          "Master",
          "Trans",
          "Control",
          "Rep",
          "Tran",
          "Rep",
          "AdminTran",
        ],
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

    // console.log("📅 Fecha de referencia para el filtrado:", today);

    // 🔹 Filtrar solo las rutas con tipo "Directa" y cuya fecha de creación (`created_at`) sea hoy
    const filteredData = sentRoutesData.filter((row) => {
      if (!row.created_at) {
        // console.warn("⚠ Registro sin `created_at` encontrado:", row);
        return false;
      }

      // Convertir created_at a formato YYYY-MM-DD
      const rowDate = new Date(row.created_at).toLocaleDateString("fr-CA");

      // console.log(`🔍 Comparando: ${rowDate} === ${today}`);

      return row["TIPO"]?.toLowerCase?.() === "directa" && rowDate === today;
    });

    if (filteredData.length === 0) {
      alert(`No hay datos de tipo 'Directa' registrados en la fecha ${today}.`);
      return;
    }

    // console.log(" Datos filtrados:", filteredData);

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

    // console.log("📂 Datos listos para exportar:", exportData);

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

    // console.log(" Archivo Excel generado correctamente.");
  };

  // Versión con tabla de IMPORTE AGREGADA al final (corregida)

  const [referenciasClientes, setReferenciasClientes] = useState([]);

  useEffect(() => {
    axios
      .get("http://66.232.105.87:3007/api/Trasporte/referencias")
      .then((res) => setReferenciasClientes(res.data))
      .catch((err) => console.error("Error cargando referencias", err));
  }, []);

  function buscarReferenciaCliente(numCliente, nombreCliente, referencias) {
    // 1. Busca por número (asegura trims y mismo tipo)
    let ref = referencias.find(
      (r) => String(r.Num_Cliente).trim() === String(numCliente).trim()
    );
    if (ref) return ref.REFERENCIA;

    // 2. Si no existe, busca por nombre
    ref = referencias.find(
      (r) =>
        r.Nombre_cliente.trim().toUpperCase() ===
        (nombreCliente || "").trim().toUpperCase()
    );
    return ref ? ref.REFERENCIA : "";
  }

  const totalPagesExp = "___total_pages___";

  function addPageNumber(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");

      if (i === 1) {
        // Página 1: debajo del logo
        const posX = 190;
        const posY = 50;
        doc.text(`PÁGINA ${i} de ${pageCount}`, posX, posY, { align: "right" });
      }

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.addImage(barraFooter, "JPEG", 10, pageHeight - 15, 190, 8);
      }
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

  const getTipoDominante = (productos) => {
    const tipos = productos.map((p) => (p.tipo_caja || "").toUpperCase());
    const cuenta = {};
    for (const tipo of tipos) cuenta[tipo] = (cuenta[tipo] || 0) + 1;

    const tipoMasUsado =
      Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0]?.[0] || "CAJA";
    return tipoMasUsado === "ATA" ? "ATADO" : tipoMasUsado;
  };

  const generatePDF = async (pedido, tipo, modo = "descargar") => {
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
        `http://66.232.105.87:3007/api/Trasporte/embarque/${pedido}/${tipo}`
      );
      const result = await responseEmbarque.json();

      // Validar que tenga datos
      if (!result || !result.datos || result.datos.length === 0) {
        return alert("No hay productos");
      }

      // Extraer datos y conteos
      const data = result.datos; // Productos reales para imprimir
      const totalLineasDB = result.totalLineas || 0;
      const totalMotivo = result.totalMotivo || 0;
      const totalLineasPDF = result.totalLineasPDF || data.length;

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

      // 🔸 Obtener la dirección desde la API externa usando NoOrden
      const direccionAPI = await axios.post(
        "http://66.232.105.87:3007/api/Trasporte/obtenerPedidos"
      );
      const pedidosExternos = direccionAPI.data;

      //  Ahora sí puedes buscar con pedido + tipo
      const pedidoEncontrado = pedidosExternos.find(
        (p) =>
          String(p.NoOrden) === String(pedido) &&
          String(p.TpoOriginal).toUpperCase() === String(tipo).toUpperCase()
      );

      if (!pedidoEncontrado) {
        alert(`No se encontró el pedido ${pedido}-${tipo}`);
        return null;
      }

      const numeroFactura =
        pedidoEncontrado?.NoFactura || route["NO_FACTURA"] || "No disponible";
      const direccion = cleanAddress(
        pedidoEncontrado?.Direccion || route["DIRECCION"] || "No disponible"
      );

      const numero = route["NUM. CLIENTE"] || "No disponible";
      const telefono = route["TELEFONO"] || "Sin número";
      const rawTotal = route["TOTAL"];
      const referenciaCliente = buscarReferenciaCliente(
        numero,
        nombreCliente,
        referenciasClientes
      );
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
        `CLIENTE NO.: ${numero}     NOMBRE DEL CLIENTE: ${nombreCliente}`,
        marginLeft,
        currentY
      );
      currentY += 4;
      doc.text(`TELÉFONO: ${telefono}`, marginLeft, currentY);
      currentY += 4;

      const direccionFormateada = `DIRECCIÓN: ${direccion}`;
      doc.text(direccionFormateada, marginLeft, currentY, {
        maxWidth: 180, // controla el ancho antes de saltar de línea
      });

      const lineCount = Math.ceil(doc.getTextWidth(direccionFormateada) / 180);
      currentY += 4 * lineCount;

      currentY += 4;
      doc.text(`No Orden: ${pedido}-${tipo_original}`, marginLeft, currentY);
      currentY += 4;
      doc.text(`FACTURA No.: ${numeroFactura}`, marginLeft, currentY);
      currentY += 4;

      const textoLineas = `Líneas BD: ${totalLineasDB} | Líneas PDF: ${totalLineasPDF} | Motivo: ${totalMotivo}`;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      // Si hay diferencia, marcar en rojo
      if (totalLineasDB !== totalLineasPDF + totalMotivo) {
        doc.setTextColor(255, 0, 0); // Rojo si hay diferencia
      } else {
        doc.setTextColor(0, 0, 0); // Negro si coincide
      }

      doc.text(textoLineas, marginLeft, currentY);
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
        "En caso de detectar cualquier irregularidad (daños, faltantes,cajas mojadas o manipulaciones), Favor de comunicarse de inmediato al departamento de atención al cliente al número:(55) 58727290 EXT.: (8815, 8819)",
        105,
        infoY + 9,
        { align: "center", maxWidth: 180 }
      );
      currentY = infoY + 15;

      const productosConCaja = data.filter((i) => i.caja && i.caja > 0);
      const productosSinCaja = data.filter((i) => !i.caja || i.caja === 0);

      const productosSinCajaAtados = productosSinCaja.filter(
        (p) => (p.um || "").toUpperCase() === "ATA"
      );

      //  AGRUPAR por tipo + cajas (fusionadas respetadas)
      const cajasAgrupadasOriginal = {};

      for (const item of productosConCaja) {
        const tipo = (item.tipo_caja || "").toUpperCase().trim();
        const cajasTexto = item.cajas || item.caja;

        if (!cajasTexto) continue;

        const cajas = String(cajasTexto)
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c !== "")
          .sort((a, b) => parseInt(a) - parseInt(b)); // asegura orden

        const claveCaja = cajas.join(","); // ejemplo: "2,6"
        const clave = `${tipo}_${claveCaja}`;

        if (!cajasAgrupadasOriginal[clave]) cajasAgrupadasOriginal[clave] = [];
        cajasAgrupadasOriginal[clave].push(item);
      }

      const cajasOrdenadas = Object.entries(cajasAgrupadasOriginal).sort(
        (a, b) => {
          const getMin = (key) => {
            const parts = key.split("_")[1]; // "2,6"
            return Math.min(...parts.split(",").map((p) => parseInt(p.trim())));
          };
          return getMin(a[0]) - getMin(b[0]);
        }
      );

      // === Contador REAL de cajas por tipo ===
      const cajasArmadas = new Set();
      const cajasAtados = new Set();
      const cajasTarimas = new Set();

      for (const key of Object.keys(cajasAgrupadasOriginal)) {
        const [tipo, cajasStr] = key.split("_");
        const cajas = cajasStr
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c !== "");

        for (const caja of cajas) {
          const clave = `${tipo}_${caja}`;

          if (tipo === "CAJA") {
            cajasArmadas.add(clave); // solo cuenta como caja si es física
          } else if (["ATA", "ATADO"].includes(tipo)) {
            cajasAtados.add(clave);
          } else if (tipo === "TARIMA") {
            cajasTarimas.add(clave);
          }
        }
      }

      // 💡 INNER y MASTER sólo si están sueltos (sin tipo_caja = CAJA)
      const totalINNER_MASTER = data.reduce((s, i) => {
        const tipo = (i.tipo_caja || "").toUpperCase();
        if (["INNER", "MASTER"].includes(tipo)) {
          return s + (i._inner || 0) + (i._master || 0);
        }
        return s;
      }, 0);

      const totalCajasArmadas = cajasArmadas.size;
      const totalAtados = cajasAtados.size;
      const totalTarimas = cajasTarimas.size;
      const totalCajas =
        totalINNER_MASTER + totalCajasArmadas + totalAtados + totalTarimas;

      currentY = verificarEspacio(doc, currentY, 2);
      doc.autoTable({
        startY: currentY,
        head: [
          [
            "INNER/MASTER",
            "TARIMAS",
            "ATADOS",
            "CAJAS ARMADAS",
            "TOTAL DE ENTREGA",
          ],
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

      for (const [key, productos] of cajasOrdenadas) {
        const [_, numeroCaja] = key.split("_");
        const tipoVisible = getTipoDominante(productos);
        const titulo = `Productos en  ${tipoVisible} ${numeroCaja}`;

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
            item.cant_surti || "",
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

      if (productosSinCajaAtados.length > 0) {
        currentY = verificarEspacio(doc, currentY, 2);
        doc.autoTable({
          startY: currentY,
          head: [["Lotes Atados"]],
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
          body: productosSinCajaAtados.map((item) => [
            item.codigo_ped || "",
            item.des || "",
            item.cant_surti || "",
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
              const text = "Continuación de productos atados sin caja";
              doc.setFontSize(8);
              doc.text(text, 105, data.cursor.y - 6, { align: "center" });
              yaContinua = true;
            }
          },
        });

        currentY = doc.lastAutoTable.finalY + 4;
      }

      const productosNoEnviados = productosSinCaja.filter(
        (item) =>
          (item._inner || 0) === 0 &&
          (item._master || 0) === 0 &&
          (item.tarimas || 0) === 0 &&
          (item.atados || 0) === 0 &&
          (item._pz || 0) === 0 &&
          (item._pq || 0) === 0
      );

      const productosSinCajaValidos = productosSinCaja.filter(
        (item) => !productosNoEnviados.includes(item)
      );

      if (productosNoEnviados.length > 0) {
        currentY = verificarEspacio(doc, currentY, 2);
        doc.autoTable({
          startY: currentY,
          head: [["Productos no enviados"]],
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
          body: productosNoEnviados.map((item) => [
            item.codigo_ped || "",
            item.des || "",
            item.cant_surti || "",
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
              const text = "Continuación de productos no enviados";
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

      const totalConIva = pedidoEncontrado?.TotalConIva
        ? parseFloat(pedidoEncontrado.TotalConIva)
        : totalImporte;

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
              content: "TOTAL A PAGAR\n(con IVA)",
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
            `$${totalConIva.toFixed(2)}`,
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

      // === LEYENDA VERTICAL AL COSTADO DE LA TABLA DE BANCOS ===

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

      //informacion bancaria
      // === Información Bancaria + Observaciones alineadas ===

      const tablaBancosY = currentY + 10; // Ajusta el +3 si lo quieres más arriba o abajo

      // Muestra la referencia bancaria arriba de la tabla
      doc.setFontSize(10);
      doc.text("Referencia bancaria:", 20, tablaBancosY - 5, {
        styles: { fontStyle: "bold" },
      });
      doc.setFont(undefined, "bold");
      doc.text(`${referenciaCliente}`, 75, tablaBancosY - 5, {
        align: "right",
        styles: { fontStyle: "bold" },
      }); // Ajusta la posición x para alinearlo a la derecha
      doc.setFont(undefined, "normal");

      // TABLA DE BANCOS
      doc.autoTable({
        startY: tablaBancosY,
        head: [
          [
            {
              content: "BANCO",
              styles: { halign: "left", fontStyle: "bold", fontSize: 8 },
            },
            {
              content: "NO. DE CUENTA",
              styles: { halign: "center", fontStyle: "bold", fontSize: 8 },
            },
            {
              content: "SUCURSAL",
              styles: { halign: "center", fontStyle: "bold", fontSize: 8 },
            },
            {
              content: "CLABE",
              styles: { halign: "center", fontStyle: "bold", fontSize: 8 },
            },
          ],
        ],

        body: [
          ["BANAMEX", "6860432", "7006", "002180700668604325"],
          [
            { content: "BANORTE" },
            { content: "0890771176" },
            { content: "04" },
            { content: "072180008907711766" },
          ],
          ["BANCOMER", "CIE 2476827", "1838"],
        ],
        startY: tablaBancosY, // tu variable de Y si la usas
        theme: "plain", // O 'grid' si quieres líneas de tabla
        headStyles: {
          fillColor: [0, 0, 0], // Fondo negro
          textColor: [255, 255, 255], // Texto blanco
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
          valign: "middle",
        },
        // Opcional: para que las celdas no tengan borde
        styles: {
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          fontSize: 8,
        },

        theme: "plain", // Sin bordes, puro alineado como quieres
        styles: { fontSize: 8, cellPadding: 1, halign: "center" },
        margin: { left: 10 },
        tableWidth: 115, // ajusta a 115-120 según el ancho de tu hoja, eso te da espacio a la derecha para observaciones
        headStyles: { textColor: [0, 0, 0], fontStyle: "bold" },
        bodyStyles: { textColor: [0, 0, 0] },
      });

      // CAJA OBSERVACIONES (alineada a la derecha)
      // =============== CAJA DE OBSERVACIONES ===============
      const obsBoxX = 133;
      const obsBoxY = tablaBancosY;
      const obsBoxWidth = 65;
      const obsBoxHeight = 28;

      // Dibuja el recuadro
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.3);
      doc.rect(obsBoxX, obsBoxY, obsBoxWidth, obsBoxHeight);

      // Título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Observaciones:", obsBoxX + 3, obsBoxY + 7);

      // Líneas punteadas dentro del recuadro, bien alineadas
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      const numLineas = 4;
      const leftPadding = 5; // padding izquierdo dentro de la caja
      const rightPadding = 5;
      const lineaAncho = obsBoxWidth - leftPadding - rightPadding;
      for (let i = 0; i < numLineas; i++) {
        // Empieza un poco debajo del título y separadas
        const lineaY = obsBoxY + 11 + i * 5.3;
        doc.text(
          "...".repeat(Math.floor(lineaAncho / 2.5)), // Ajusta el divisor para el largo de puntos
          obsBoxX + leftPadding,
          lineaY
        );
      }

      // Poner leyenda final justo abajo, centrado
      const leyendaY = obsBoxY + obsBoxHeight + 7; // Ajusta el +7 para el espaciado
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        "A la firma/sello del presente documento se tiene por recibida de conformidad la mercancía y aceptado el monto a pagar aquí descrita.",
        10,
        leyendaY
      );

      currentY = leyendaY + 4; // Si necesitas continuar después

      addPageNumber(doc);

      if (modo === "descargar") {
        doc.save(`PackingList_de_${pedido}-${tipo}.pdf`);
      }

      return await doc.output("blob");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
      return null;
    }
  };

  //fin del PDF

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
    // console.log("🔍 Datos recibidos en openDirectaModal:", data);

    setSelectedId(data.id); //  ¡Agregar esto!
    setSelectedDirectaData(data);
    setGuia(data.GUIA?.toString() || ""); // fuerza a string si viene null o número
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

    setTotalFacturaLT(data.TOTAL_FACTURA_LT || "");
    setNumeroFacturaLT(data.NUMERO_DE_FACTURA_LT || "");

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

    // console.log("📌 Estado después de setState:");
    // console.log({
    //   guia,
    //   selectedNoOrden,
    //   fecha,
    //   numCliente,
    //   nombreCliente,
    //   municipio,
    //   estado,
    //   observaciones,
    //   total,
    //   partidas,
    //   piezas,
    //   zona,
    //   tipoZona,
    //   noFactura,
    //   diaEnRuta,
    //   cajas,
    //   transporte,
    //   paqueteria,
    //   diasEntrega,
    //   entregaSatisfactoria,
    //   motivo,
    //   diferencia,
    //   fechaEmbarque,
    //   fechaEntregaCliente,
    //   fechaEstimadaCliente,
    //   tipo,
    // });

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
        "http://66.232.105.87:3007/api/Trasporte/transportistas"
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
        "http://66.232.105.87:3007/api/Trasporte/transportistas/empresas"
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
          // console.warn(
          //   "⚠️ No se encontró la empresa seleccionada en los datos."
          // );
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
        "http://66.232.105.87:3007/api/Trasporte/insertar-visita",
        dataToSend
      );

      alert(` Visita insertada correctamente: ${response.data.message}`);

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
      console.error(" Error al insertar la visita:", error);
      alert("Error al insertar la visita.");
    }
  };

  const eliminarRuta = async (noOrden) => {
    try {
      setLoading(true); // Muestra el loading
      const response = await axios.delete(
        `http://66.232.105.87:3007/api/Trasporte/ruta/eliminar/${noOrden}`
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

  const handleSaveObservation = (cliente, value) => {
    // Guardar en el mapa (como ya lo haces)
    setObservacionesPorRegistro((prev) => {
      const updated = {
        ...prev,
        [cliente]: value,
      };

      localStorage.setItem("observacionesPorRegistro", JSON.stringify(updated));
      return updated;
    });

    // 🔥 AGREGAR ESTO (LA CLAVE)
    setData((prev) =>
      prev.map((row) =>
        row["NUM. CLIENTE"] === cliente ? { ...row, OBSERVACIONES: value } : row
      )
    );
  };

  useEffect(() => {}, [observacionesPorRegistro, groupedData]);

  const getTransportUrl = (transport) => {
    const cleanedTransport = transport
      ?.trim()
      .replace(/\s+/g, " ")
      .toUpperCase();

    switch (cleanedTransport) {
      case "EXPRESS":
      case "PAQUETEXPRESS":
        return "https://www.paquetexpress.com.mx/";
      case "TRES GUERRAS":
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
        "http://66.232.105.87:3007/api/Trasporte/historico"
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
        "http://66.232.105.87:3007/api/Trasporte/historico",
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
        "http://66.232.105.87:3007/api/Trasporte/historico_clientes"
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
        "http://66.232.105.87:3007/api/Trasporte/historico_columnas"
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
  const [filterFactura, setFilterFactura] = useState("");
  const [filterGuia, setFilterGuia] = useState("");

  const toggleMostrarSinGuia = () => {
    setMostrarSinGuia((prev) => !prev);
  };

  const paqueteriaFiltrada = useMemo(() => {
    const normalizar = (texto) =>
      texto ? texto.toString().replace(/\s+/g, "").toUpperCase() : "";

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

      const paq = normalizar(
        routeData.PAQUETERIA ||
          routeData.paqueteria ||
          routeData.TRANSPORTE ||
          routeData.transporte
      );
      const filtroPaq = normalizar(paqueteriaSeleccionada);

      const coincidePaqueteria =
        !paqueteriaSeleccionada ||
        paq.includes(filtroPaq) ||
        (filtroPaq === "EXPRESS" &&
          (paq.includes("PAQUETEXPRESS") || paq.includes("EXPRESS"))) ||
        ((filtroPaq === "TRESGUERRAS" || filtroPaq === "TRES GUERRAS") &&
          paq.includes("TRESGUERRAS"));

      const coincideEstatus =
        !estatusSeleccionado || routeData.statusText === estatusSeleccionado;

      // ----------- 🔥 FILTRO POR GUIA (texto) -------------
      const coincideGuiaTexto =
        !filterGuia ||
        routeData.GUIA?.toString()
          .toLowerCase()
          .includes(filterGuia.toLowerCase());

      // ----------- 🔥 FILTRO DE SIN GUIA ------------------
      const coincideGuiaVacia =
        !mostrarSinGuia || !routeData.GUIA || routeData.GUIA.trim() === "";

      const coincideFactura =
        !filterFactura ||
        routeData["NO_FACTURA"]
          ?.toString()
          .toLowerCase()
          .includes(filterFactura.toLowerCase());

      return (
        coincideGeneral &&
        coincideEstado &&
        coincidePaqueteria &&
        coincideEstatus &&
        coincideGuiaTexto && // <- 💥 ESTA ES LA LÍNEA CLAVE
        coincideGuiaVacia &&
        coincideFactura
      );
    });
  }, [
    filtroGeneral,
    filtroEstado,
    paqueteriaData,
    paqueteriaSeleccionada,
    estatusSeleccionado,
    mostrarSinGuia,
    filterFactura,
    filterGuia, // <-- AGREGA EL NUEVO DEPENDENCY
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

      const cumpleFactura =
        !filterFactura ||
        item["NO_FACTURA"]
          ?.toString()
          .toLowerCase()
          .includes(filterFactura.toLowerCase());

      return (
        cumpleGeneral &&
        cumpleEstado &&
        cumpleEstatus &&
        cumpleFechaEntrega &&
        cumpleFactura
      );
    });
  }, [
    directaData,
    filtroGeneral,
    filtroEstado,
    estatusSeleccionado,
    fechaEntregaSeleccionada,
    filterFactura, //  No olvides agregarlo aquí
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
      "PAQUETEXPRESS",
      "TRESGUERRAS",
      "TRES GUERRAS",
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
    // 🔹 1. Actualiza el estado local del modal
    setModalObservaciones((prev) => {
      const updated = { ...prev, [clienteId]: nuevaObservacion };
      localStorage.setItem("modalObservaciones", JSON.stringify(updated));
      return updated;
    });

    // 🔹 2. Actualiza las observaciones globales
    setObservacionesPorRegistro((prev) => {
      const updated = { ...prev, [clienteId]: nuevaObservacion };
      localStorage.setItem("observacionesPorRegistro", JSON.stringify(updated));
      return updated;
    });

    // 🔹 3. Actualiza groupedData (para que se mande al backend)
    setGroupedData((prev) => {
      const updatedGrouped = { ...prev };
      for (const route in updatedGrouped) {
        updatedGrouped[route].rows = updatedGrouped[route].rows.map((row) =>
          row["NUM. CLIENTE"] === clienteId
            ? { ...row, OBSERVACIONES: nuevaObservacion }
            : row
        );
      }
      return updatedGrouped;
    });
  };

  const handleClearStorage = () => {
    localStorage.removeItem("totalClientes");
    localStorage.removeItem("totalPedidos");
    localStorage.removeItem("totalGeneral");

    // Restablecer los valores en la UI
    setTotalClientes(0);
    setTotalPedidos(0);
    setTotalGeneral(0);

    // console.log(
    //   "🗑️ Datos de clientes, pedidos y total eliminados de localStorage."
    // );
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
      // console.log("Llamando a la API con No Ordenes:", noOrdenes);
      // Construimos la URL, uniendo los pedidos con comas
      const response = await axios.get(
        `http://66.232.105.87:3007/api/Trasporte/pedido/ultimas-fechas-embarque?pedidos=${noOrdenes.join(
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
        "http://66.232.105.87:3007/api/Trasporte/subir-excel",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        const updatedOrders = data.updatedOrders || []; // Asegurar que es un array

        setUploadMessage(
          ` Archivo subido correctamente. Se actualizaron las NO ORDEN.`
        );
        setUpdatedOrders(updatedOrders); // Guardar la lista de órdenes actualizadas
        fetchPaqueteriaRoutes(); // Recargar datos después de la actualización
      } else {
        setUploadMessage(` Error: ${data.message}`);
        alert("Error al subir el archivo.");
      }
    } catch (error) {
      console.error(" Error en la subida:", error);
      setUploadMessage(" Error en la subida del archivo.");
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
        `http://66.232.105.87:3007/api/Trasporte/rutas?${queryParams.toString()}`
      );
      const data = await response.json();

      // console.log("🧪 DATA recibida:", data);

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
      alert(" Faltan datos: El número de guía es obligatorio.");
      return;
    }

    // Modificación del bloque datosAGuardar dentro de guardarPorGuia

    const datosAGuardar = {
      numeroFacturaLT,
      totalFacturaLT,
      pedidos: pedidos.map((pedido) => ({
        noOrden: pedido["NO ORDEN"],
        numeroFacturaLT, //  Aquí lo agregamos dentro de cada pedido
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

    // console.log("📤 Enviando datos a la API:", datosAGuardar);

    try {
      const response = await fetch(
        `http://66.232.105.87:3007/api/Trasporte/actualizar-por-guia/${guia}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosAGuardar),
        }
      );

      const resultado = await response.json();
      if (response.ok) {
        alert(" Datos guardados correctamente.");
        handleCloseModalGuia(); // Cierra el modal después de guardar
      } else {
        alert(" Error al guardar: " + resultado.message);
      }
    } catch (error) {
      console.error(" Error en la solicitud:", error);
      alert(" Error al conectar con el servidor.");
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

  // ==== Helpers de normalización (puedes ponerlos arriba de tu componente) ====

  const toISODate = (raw) => {
    if (!raw) return null;

    if (typeof raw === "string") {
      // Soporta "DD/MM/YYYY" o "DD-MM-YYYY"
      const m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (m) {
        const [, d, M, y] = m;
        const yyyy = String(y).length === 2 ? `20${y}` : y;
        return `${String(yyyy).padStart(4, "0")}-${String(M).padStart(
          2,
          "0"
        )}-${String(d).padStart(2, "0")}`;
      }
      // Ya viene en ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    }

    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    } catch (_) {}

    return null; // mejor null que basura
  };

  const parseMoney = (v) => {
    if (v == null) return null;
    if (typeof v === "number") return v;
    const s = String(v).replace(/[$,%\s,]/g, ""); // quita $, %, espacios y comas
    const n = Number(s);
    return isNaN(n) ? null : n;
  };

  const toStringOrEmpty = (v) => (v == null ? "" : String(v));

  // ==== FUNCIÓN ACTUALIZADA ====

  const syncRoutesToDB = async () => {
    if (loadingSync) return;

    setLoadingSync(true);
    const rutasMap = {};
    let totalPedidosSync = 0; // 👈 contador de pedidos sincronizados

    try {
      const rutasArray = Object.keys(groupedData || {});
      if (rutasArray.length === 0) {
        setLoadingSync(false);
        return;
      }

      // 1) Crear/obtener rutas
      for (const route of rutasArray) {
        try {
          const { data } = await axios.post(
            "http://66.232.105.87:3007/api/Trasporte/rutas",
            { nombre: route },
            { headers: { "Content-Type": "application/json" } }
          );

          const rutaId =
            data?.ruta_id ?? data?.id ?? data?.data?.ruta_id ?? data?.data?.id;
          if (!rutaId) continue;
          rutasMap[route] = rutaId;
        } catch (error) {
          console.error(
            `❌ Error al sincronizar la ruta "${route}":`,
            error.response?.status,
            error.response?.data || error.message
          );
        }
      }

      // 2) Enviar pedidos
      for (const route of rutasArray) {
        const ruta_id = rutasMap[route];
        if (!ruta_id) continue;

        const pedidos = groupedData[route]?.rows || [];
        if (pedidos.length === 0) continue;

        for (const pedido of pedidos) {
          const tipoOriginal =
            pedido["tipo_original"] ??
            pedido["TIPO ORIGINAL"] ??
            pedido["TPO ORIGINAL"] ??
            pedido["tipo"] ??
            "";

          const mappedPedido = {
            ruta_id,
            no_orden: Number(pedido["NO ORDEN"]) || null,
            num_cliente: pedido["NUM. CLIENTE"] || "",
            nombre_cliente: pedido["NOMBRE DEL CLIENTE"] || "",
            municipio: pedido["MUNICIPIO"] || "",
            estado: pedido["ESTADO"] || "",
            total:
              parseFloat(String(pedido["TOTAL"]).replace(/[$,%\s,]/g, "")) || 0,
            partidas: Number(pedido["PARTIDAS"]) || 0,
            piezas: Number(pedido["PIEZAS"]) || 0,
            fecha_emision: toISODate(pedido["FECHA"]),
            observaciones: pedido["OBSERVACIONES"] || "Sin observaciones",
            tipo: String(tipoOriginal).toUpperCase().trim(),
          };

          if (!mappedPedido.no_orden || !mappedPedido.tipo) continue;

          try {
            await axios.post(
              "http://66.232.105.87:3007/api/Trasporte/rutas/pedidos",
              mappedPedido,
              { headers: { "Content-Type": "application/json" } }
            );
            totalPedidosSync++; //  sumamos cuando se sincroniza bien
          } catch (error) {
            console.error(
              " Error al sincronizar pedido:",
              error.response?.status,
              error.response?.data || error.message
            );
          }
        }
      }

      console.log(
        ` Sincronización completada. Total pedidos sincronizados: ${totalPedidosSync}`
      );
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(
        " Error general al sincronizar rutas y pedidos:",
        error.message
      );
    } finally {
      setLoadingSync(false);
    }
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
    syncRoutesToDB(); //  Se ejecuta una vez al inicio

    const interval = setInterval(() => {
      // console.log(" Ejecutando sincronización automática...");
      syncRoutesToDB();
    }, 5 * 60 * 1000); //  5 minutos en milisegundos

    return () => clearInterval(interval); //  Limpia el intervalo al desmontar el componente
  }, []);

  const fetchRutasConPedidos = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Trasporte/Rutasconpedido"
      );
      // console.log(" Rutas obtenidas:", response.data);
      setRutasConPedidos(response.data);
    } catch (error) {
      console.error(" Error al obtener rutas y pedidos:", error);
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
        `http://66.232.105.87:3007/api/Trasporte/status`,
        { orderNumbers: ordenes }
      );

      const statusMap = response.data;
      // console.log(" StatusMap directo:", statusMap);

      const pedidosActualizados = pedidos.map((pedido) => {
        const match = statusMap[pedido.no_orden];
        return {
          ...pedido,
          statusText: match?.statusText || "Sin status",
          color: match?.color || "#000000",
          fusionWith: match?.fusionWith || null,
        };
      });

      //  Actualizar la ruta seleccionada (modal)
      setSelectedRuta({
        ...ruta,
        pedidos: pedidosActualizados,
      });

      //  Actualizar también la ruta dentro de rutasConPedidos para que los statusText estén en las tarjetas
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
      console.error(" Error al consultar estados antes del modal:", error);
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
          // console.warn("🚫 Pedido sin coincidencia de tipo:", pedido.no_orden);
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
          "http://66.232.105.87:3007/api/Trasporte/resumen-dia"
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
      assignToRoute(pedido, selectedMassRoute); //  Usa la función existente
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
          `http://66.232.105.87:3007/api/Trasporte/actualizar-guia-completa/${orden}`, // 🔥 nueva ruta aquí
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
      alert(" Errores al actualizar:\n" + errores.join("\n"));
    } else {
      alert(" Actualización exitosa en todos los pedidos.");
      fetchPaqueteriaRoutes(); // 🔄 Refresca tu tabla
    }

    // 🔹 Limpia todo
    setBulkGuiaModalOpen(false);
    setBulkNoOrdenes("");
    setBulkGuiaValue("");
    setBulkTransportePaqueteriaValue("");
  };

  //filtar por mes

  const handleChangeMes = (e) => {
    const nuevoMes = e.target.value;
    setMesSeleccionado(nuevoMes);
    fetchPaqueteriaRoutes({ mes: nuevoMes });
  };

  // mandar correo

  const handleEnviarCorreo = async (noOrden) => {
    try {
      const response = await axios.post(
        "http://66.232.105.87:3007/api/Trasporte/enviar",
        {
          noOrden,
        }
      );

      if (response.data.success) {
        alert(` Correo enviado para la orden ${noOrden}`);
      } else {
        alert(` Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error(" Error al enviar correo:", error);
      alert(" No se pudo enviar el correo.");
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
    if (!mesSeleccionado || !anio) {
      alert("Selecciona mes y año.");
      return;
    }

    if (!sentRoutesData || sentRoutesData.length === 0) {
      alert("No hay datos cargados para exportar.");
      return;
    }

    const datosPaqueteria = sentRoutesData.filter(
      (pedido) => pedido.TIPO?.trim().toLowerCase() === "paqueteria"
    );

    const datosDirecta = sentRoutesData.filter(
      (pedido) => pedido.TIPO?.trim().toLowerCase() === "directa"
    );

    if (datosPaqueteria.length === 0 && datosDirecta.length === 0) {
      alert("No hay registros para exportar en ese mes.");
      return;
    }

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

    const transformData = (datos) =>
      datos.map((row) => {
        const exportRow = {};
        columnas.forEach((col) => {
          exportRow[col] = row[col] ?? "";
        });
        return exportRow;
      });

    const workbook = XLSX.utils.book_new();

    if (datosPaqueteria.length > 0) {
      const ws = XLSX.utils.json_to_sheet(transformData(datosPaqueteria));
      XLSX.utils.book_append_sheet(workbook, ws, "Paquetería");
    }

    if (datosDirecta.length > 0) {
      const ws = XLSX.utils.json_to_sheet(transformData(datosDirecta));
      XLSX.utils.book_append_sheet(workbook, ws, "Directa");
    }

    XLSX.writeFile(workbook, `Rutas_${anio}_${mesSeleccionado}.xlsx`);
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
        "FECHA DE FACTURA":
          pedido["FECHA DE FACTURA"] || pedido.fecha_de_factura || "",
        "NUM. CLIENTE": pedido["NUM. CLIENTE"] || pedido.num_cliente || "",
        "NOMBRE DEL CLIENTE":
          pedido["NOMBRE DEL CLIENTE"] || pedido.nombre_cliente || "",
        MUNICIPIO: pedido.MUNICIPIO || pedido.municipio || "",
        ESTADO: pedido.ESTADO || pedido.estado || "",
        ZONA: pedido.ZONA || pedido.zona || "",
        FECHA: pedido.FECHA || pedido.fecha || moment().format("YYYY-MM-DD"),
        OBSERVACIONES:
          pedido.OBSERVACIONES || pedido.observaciones || "Sin observaciones",
        TOTAL: total,
        PARTIDAS: partidas,
        PIEZAS: piezas,
        tipo_original: pedido.tipo || pedido.TIPO || "",
        tipo: pedido.tipo || pedido.TIPO || "", // si también lo necesitas con ese nombre
        "EJECUTIVO VTAS": pedido["EJECUTIVO VTAS"] || "",
        GUIA: pedido.GUIA || "",
      };

      // console.log(" Pedido normalizado:", pedidoNormalizado); // Verifica visualmente

      nuevaRuta.rows.push(pedidoNormalizado);
    });

    setGroupedData((prev) => {
      const updated = { ...prev, [nombreRuta]: nuevaRuta };
      localStorage.setItem("transporteGroupedData", JSON.stringify(updated));
      return updated;
    });

    alert(" Ruta reactivada correctamente.");
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
        "http://66.232.105.87:3007/api/Trasporte/actualizar-tipo-original",
        formData
      );

      alert(response.data.message || " Actualización completada.");
      fetchPaqueteriaRoutes(); // Refrescar tabla si es necesario
    } catch (error) {
      console.error(" Error al subir archivo:", error);
      alert("Error al subir el archivo.");
    }
  };

  // Funcionamiento del porrateo

  // Funcionamiento del porrateo

  // ====== PORRATEO (modal con transporte seleccionado) ======
  const [openPorrateo, setOpenPorrateo] = useState(false);
  const [loadingPorrateo, setLoadingPorrateo] = useState(false);
  const [errorPorrateo, setErrorPorrateo] = useState("");
  const [porrateoGroups, setPorrateoGroups] = useState({});
  const [transportKeys, setTransportKeys] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState("");
  const [porrateoPage, setPorrateoPage] = useState(0);
  const [porrateoRowsPerPage, setPorrateoRowsPerPage] = useState(25);

  const [guiaQuery, setGuiaQuery] = useState("");
  const [selectedGuia, setSelectedGuia] = useState("");

  const [selectedMonthPorrateo, setSelectedMonthPorrateo] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`; // "YYYY-MM"
  });

  const aNumero = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isNaN(n) ? null : n;
  };

  const handleOpenPorrateo = async () => {
    try {
      setOpenPorrateo(true);
      setLoadingPorrateo(true);
      setErrorPorrateo("");

      const [yStr, mStr] = selectedMonthPorrateo.split("-");
      const { data } = await axios.get(
        "http://66.232.105.87:3007/api/Trasporte/Actualizar-Porrateo",
        { params: { year: parseInt(yStr, 10), month: parseInt(mStr, 10) } }
      );

      const rows = Array.isArray(data) ? data : data.rows || [];

      // Orden alfabético por TRANSPORTE
      rows.sort((a, b) =>
        String(a.TRANSPORTE || "").localeCompare(
          String(b.TRANSPORTE || ""),
          "es"
        )
      );

      // Agrupar
      const grouped = rows.reduce((acc, r) => {
        const k = r.TRANSPORTE || "SIN_TRANSPORTE";
        (acc[k] ||= []).push(r);
        return acc;
      }, {});

      // Orden interno por NO ORDEN (numérico si aplica)
      Object.keys(grouped).forEach((k) => {
        grouped[k].sort((a, b) =>
          String(a["NO ORDEN"]).localeCompare(String(b["NO ORDEN"]), "es", {
            numeric: true,
          })
        );
      });

      // Llaves ordenadas
      const keys = Object.keys(grouped).sort((a, b) =>
        a.localeCompare(b, "es")
      );

      setPorrateoGroups(grouped);
      setTransportKeys(keys);
      setSelectedTransport(keys[0] || ""); // Selecciona el primero por defecto
      setPorrateoPage(0);
    } catch (e) {
      console.error(e);
      setErrorPorrateo("Error al cargar datos de porrteo.");
    } finally {
      setLoadingPorrateo(false);
    }
  };

  // === ENDPOINT de actualización (uno a uno) ===
  const UPDATE_ONE_URL =
    "http://66.232.105.87:3007/api/Trasporte/Paqueteria/actualizar";

  // Lee NO ORDEN robusto (sirve si viene "NO ORDEN", no_orden o noOrden)
  const getNoOrden = (r) => r["NO ORDEN"] ?? r.no_orden ?? r.noOrden ?? "";

  // Llave única por fila = NO ORDEN + tipo_original
  const keyFor = (r) =>
    `${getNoOrden(r)}|${String(r.tipo_original || "").trim()}`;

  // Normaliza fecha para el input
  const normFecha = (f) =>
    !f || f === "0000-00-00" || f === "0000-00-00 00:00:00"
      ? ""
      : String(f).substring(0, 10);

  // Convierte a número o cadena vacía (para el input)
  const toNumberOrEmpty = (v) => {
    if (v === null || v === undefined || v === "") return "";
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isNaN(n) ? "" : n;
  };

  // Editor por fila: { "NO|TIPO": {guia, fecha, total} }
  const [editPorrateo, setEditPorrateo] = useState({});
  const [savingRowKey, setSavingRowKey] = useState(""); // loading por fila

  // Obtiene lo editado o la fila original si no hay cambios
  const getEdit = (row) => {
    const k = keyFor(row);
    return (
      editPorrateo[k] ?? {
        guia: row.GUIA || "",
        fecha: normFecha(row.FECHA_DE_ENTREGA_CLIENTE),
        total: toNumberOrEmpty(row.TOTAL_FACTURA_LT),
      }
    );
  };

  // Cambia un campo del editor de ESA fila
  const setEditField = (row, field, value) => {
    const k = keyFor(row);
    const base = getEdit(row);
    setEditPorrateo((prev) => ({ ...prev, [k]: { ...base, [field]: value } }));
  };

  // ===================== ACTUALIZAR UNA SOLA FILA =====================

  const handleUpdatePorrateo = async (row) => {
    const k = keyFor(row);
    const ed = getEdit(row);

    try {
      setSavingRowKey(k); // loading sólo en esa fila
      setErrorPorrateo(""); // limpia error del modal (si lo usas)

      const body = {
        no_orden: String(getNoOrden(row)), // <- NO ORDEN robusto
        tipo_original: String(row.tipo_original || "").trim(),
        guia: (ed.guia || "").trim(), // "" -> backend lo guarda NULL
        fecha_de_entrega_cliente: ed.fecha || "", // "" -> NULL
        total_factura_lt: ed.total === "" ? "" : Number(ed.total), // "" -> NULL
      };

      await axios.put(UPDATE_ONE_URL, body);

      // Parchea sólo la fila clickeada dentro del transporte seleccionado
      const t = selectedTransport;
      setPorrateoGroups((prev) => {
        const copy = { ...prev };
        copy[t] = (copy[t] || []).map((r) =>
          keyFor(r) === k
            ? {
                ...r,
                GUIA: body.guia || null,
                FECHA_DE_ENTREGA_CLIENTE: body.fecha_de_entrega_cliente || null,
                TOTAL_FACTURA_LT:
                  body.total_factura_lt === "" ? null : body.total_factura_lt,
              }
            : r
        );
        return copy;
      });

      // (Opcional) limpiar el editor de esa fila:
      // setEditPorrateo(prev => { const x = {...prev}; delete x[k]; return x; });
    } catch (e) {
      console.error(e);
      setErrorPorrateo?.("Error al actualizar esta fila.");
    } finally {
      setSavingRowKey("");
    }
  };

  // Normaliza la GUIA (incluye opción "SIN_GUIA" cuando viene vacía)
  const normGuia = (v) => {
    const s = String(v ?? "").trim();
    return s === "" ? "SIN_GUIA" : s;
  };

  // Monto total de la factura del grupo (lo que escribirás)
  const [montoGrupo, setMontoGrupo] = useState("");

  // utilidades numéricas
  const toNumber = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    return parseFloat(String(v).replace(/[^0-9.-]/g, "")) || 0;
  };
  const round2 = (n) => Math.round(n * 100) / 100;

  // (helper por si lo necesitas)

  const paqueterias = [
    "TRES GUERRAS",
    "PAQUETEXPRESS",
    "PITIC",
    "FLECHISA",
    "FEDEX",
  ];

  const [showExtras, setShowExtras] = useState(false);

  //Quitar por el momento de la base

  // 🔍 Elimina de la tabla los pedidos que ya existen en la base de datos
  const filtrarPedidosExistentes = async () => {
    try {
      // 1️⃣ Consultar pedidos ya registrados en la BD
      const response = await axios.get(
        "http://66.232.105.87:3007/api/Trasporte/pedidosRegistrados"
      );

      // 2️⃣ Crear set con las claves únicas de la BD (NO ORDEN + TIPO ORIGINAL)
      const pedidosRegistradosDB = new Set(
        response.data.map(
          (r) =>
            `${String(r.no_orden).trim()}_${String(r.tipo_original)
              .trim()
              .toUpperCase()}`
        )
      );

      // 3️⃣ Contar antes de filtrar
      const totalAntes = data.length;

      // 4️⃣ Filtrar los que NO están en la BD
      const nuevosPedidos = data.filter((pedido) => {
        const clave = `${String(pedido["NO ORDEN"]).trim()}_${String(
          pedido["TIPO ORIGINAL"] || ""
        )
          .trim()
          .toUpperCase()}`;
        return !pedidosRegistradosDB.has(clave);
      });

      // 5️⃣ Calcular cuántos fueron quitados
      const eliminados = totalAntes - nuevosPedidos.length;

      // 6️⃣ Actualizar la tabla (solo frontend)
      setData(nuevosPedidos);

      // 7️⃣ Mostrar alerta bonita con SweetAlert
      Swal.fire({
        icon: eliminados > 0 ? "success" : "info",
        title: eliminados > 0 ? "Filtrado exitoso" : "Sin coincidencias",
        html:
          eliminados > 0
            ? `Se eliminaron <b>${eliminados}</b> pedidos que ya estaban registrados en la base de datos.`
            : "No se encontró ningún pedido duplicado en la base de datos.",
        timer: 4000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("❌ Error al filtrar pedidos existentes:", error);
      Swal.fire({
        icon: "error",
        title: "Error al validar pedidos",
        text: "No se pudo verificar contra la base de datos.",
      });
    }
  };

  return (
    <Paper elevation={3} style={{ padding: "20px" }}>
      {/* Pestañas */}
      <AppBar
        position="static"
        sx={{ backgroundColor: "white", boxShadow: "none" }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleChangeTab}
          textColor="primary"
          indicatorColor="primary"
          centered
        >
          <Tab label="OVR y Rutas" />
          <Tab label="Embarques" />
        </Tabs>
      </AppBar>

      {/* Primer Tab: Mostrar rutas y detalles */}
      {tabIndex === 0 &&
        (user?.role === "Admin" ||
          user?.role === "Master" ||
          user?.role === "Trans" ||
          user?.role === "Control" ||
          user?.role === "Embar") && (
          <Box mt={2}>
            {/* === HEADER / TOOLBAR === */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                background:
                  "linear-gradient(135deg, rgba(246,248,252,0.9) 0%, rgba(255,255,255,1) 60%)",
              }}
            >
              {/* Fila 1: Buscar + Acciones de datos (izquierda)  |  Nueva Ruta + Agregar (derecha) */}
              {/* Fila 1: Nueva Ruta (izquierda) | Buscar + Acciones (derecha) */}
              <Stack
                direction={{ xs: "column", xl: "row" }}
                alignItems={{ xs: "stretch", xl: "center" }}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                {/* IZQUIERDA — NUEVA RUTA + AGREGAR */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ minWidth: 300 }}
                >
                  <Autocomplete
                    freeSolo // 👈 permite escribir valores no incluidos en la lista
                    disablePortal
                    options={paqueterias}
                    value={newRoute || ""}
                    onChange={(event, newValue) => setNewRoute(newValue || "")}
                    onInputChange={(event, newInputValue) =>
                      setNewRoute(newInputValue || "")
                    }
                    sx={{ width: { xs: 160, sm: 220, md: 260 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Nueva Ruta"
                        placeholder="Selecciona o escribe paquetería"
                      />
                    )}
                  />

                  <Button
                    size="small"
                    variant="contained"
                    onClick={addRoute}
                    sx={{
                      textTransform: "none",
                      bgcolor: "#fb8c00",
                      "&:hover": { bgcolor: "#ef6c00" },
                    }}
                  >
                    AGREGAR RUTA
                  </Button>

                  {/* Subir archivo */}
                  <Button
                    size="small"
                    variant="contained"
                    component="label"
                    sx={{
                      textTransform: "none",
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#135BA1" },
                    }}
                    startIcon={<UploadFileIcon />}
                  >
                    Subir Archivo
                    <input
                      hidden
                      id="file-upload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </Stack>

                {/* DERECHA — BUSCAR + ACCIONES (empujado a la derecha) */}
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent={{ xl: "flex-end" }}
                  sx={{ flex: 1, minWidth: 300, ml: { xl: "auto" } }}
                >
                  {/* Buscar por No. Orden */}
                  <TextField
                    label="Buscar No. Orden"
                    variant="outlined"
                    size="small"
                    value={filterOrderValue}
                    onChange={(e) => setFilterOrderValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleBuscarPorOrden()
                    }
                    sx={{ width: { xs: "100%", sm: 230 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleBuscarPorOrden}
                    sx={{ textTransform: "none" }}
                  >
                    BUSCAR ORDEN
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => {
                      const keysToClear = [
                        "sentRoutesData",
                        "transporteTimestamp",
                        "observacionesPorRegistro",
                        "totalClientes",
                        "totalPedidos",
                        "totalGeneral",
                      ];
                      keysToClear.forEach((k) => localStorage.removeItem(k));
                      alert(
                        "🧹 Se limpiaron todos los datos de localStorage utilizados."
                      );
                      window.location.reload();
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    LIMPIAR LOCALSTORAGE
                  </Button>

                  <Divider
                    flexItem
                    orientation="vertical"
                    sx={{ mx: 0.5, display: { xs: "none", md: "block" } }}
                  />

                  {/* Limpiar Datos suaves */}
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CleaningServicesIcon />}
                    onClick={clearLocalStorage}
                    sx={{
                      textTransform: "none",
                      bgcolor: "#ef9a9a",
                      color: "#222",
                      "&:hover": { bgcolor: "#e57373" },
                    }}
                  >
                    LIMPIAR DATOS
                  </Button>
                </Stack>
              </Stack>

              {/* Fila 2: Tipos de ruta + Sincronizar + Histórico (alineados) */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1 }}
              >
                {/* Tipos de ruta con tonos pastel */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant={
                      tipoRuta === "paqueteria" ? "contained" : "outlined"
                    }
                    startIcon={<LocalShippingIcon />}
                    onClick={() => {
                      setTipoRuta("paqueteria");
                      setConfirmSendModalOpen(true);
                      handleGenerateRoutes();
                    }}
                    sx={{
                      textTransform: "none",
                      ...(tipoRuta === "paqueteria"
                        ? {
                            bgcolor: "#90caf9",
                            color: "#0d47a1",
                            "&:hover": { bgcolor: "#64b5f6" },
                          }
                        : {}),
                    }}
                  >
                    PAQUETERÍA
                  </Button>

                  <Button
                    size="small"
                    variant={tipoRuta === "Directa" ? "contained" : "outlined"}
                    startIcon={<RouteIcon />}
                    onClick={() => {
                      setTipoRuta("Directa");
                      setConfirmSendModalOpen(true);
                      handleGenerateRoutes();
                    }}
                    sx={{
                      textTransform: "none",
                      ...(tipoRuta === "Directa"
                        ? {
                            bgcolor: "#ffccbc",
                            color: "#0f0cbfff",
                            "&:hover": { bgcolor: "#ffab91" },
                          }
                        : {}),
                    }}
                  >
                    DIRECTA
                  </Button>

                  <Button
                    size="small"
                    variant={
                      tipoRuta === "venta empleado" ? "contained" : "outlined"
                    }
                    startIcon={<BadgeIcon />}
                    onClick={() => {
                      setTipoRuta("venta empleado");
                      setConfirmSendModalOpen(true);
                      handleGenerateRoutes();
                    }}
                    sx={{
                      textTransform: "none",
                      ...(tipoRuta === "venta empleado"
                        ? {
                            bgcolor: "#c8e6c9",
                            color: "#1b5e20",
                            "&:hover": { bgcolor: "#a5d6a7" },
                          }
                        : {}),
                    }}
                  >
                    VENTA EMPLEADO
                  </Button>
                </Stack>

                <Box sx={{ flex: 1 }} />

                {/* Sincronizar / Histórico */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SyncIcon />}
                    onClick={syncRoutesToDB}
                    disabled={loadingSync}
                    sx={{
                      textTransform: "none",
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#135BA1" },
                    }}
                  >
                    {loadingSync ? "Sincronizando..." : "SINCRONIZAR RUTAS"}
                  </Button>

                  {(user?.role === "Admin" || user?.role === "Master") && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<HistoryIcon />}
                      onClick={handleOpenHistoricoModal}
                      sx={{
                        textTransform: "none",
                        bgcolor: "#e53935",
                        "&:hover": { bgcolor: "#c62828" },
                      }}
                    >
                      HISTÓRICO 2024
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* =========== (TODO LO DEMÁS SE MANTIENE: resumen, rutas, carrusel, modales y tabla) =========== */}

            {/* === Rutas disponibles (horizontal con scroll) === */}
            {(user?.role === "Admin" || user?.role === "Control") && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Rutas Disponibles
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridAutoColumns: {
                      xs: "90%",
                      sm: "60%",
                      md: "40%",
                      lg: "32%",
                      xl: "26%",
                    },
                    gap: 2,
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    px: 1,
                    py: 1,
                    "&::-webkit-scrollbar": { height: 8 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "divider",
                      borderRadius: 4,
                    },
                    "& > *": { scrollSnapAlign: "start" },
                    borderRadius: 2,
                  }}
                >
                  {rutasConPedidos.length > 0 ? (
                    rutasConPedidos.map((ruta) => {
                      const totalRuta =
                        ruta.pedidos?.reduce(
                          (acc, p) => acc + (Number(p.total) || 0),
                          0
                        ) || 0;
                      const statusCount = getStatusCountForRuta(
                        ruta.pedidos || []
                      );
                      return (
                        <Card
                          key={ruta.id}
                          sx={{
                            borderRadius: 3,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            minHeight: 180,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Typography
                              variant="h6"
                              align="center"
                              sx={{
                                fontWeight: 700,
                                letterSpacing: 0.3,
                                mb: 0.5,
                              }}
                            >
                              {ruta.nombre}
                            </Typography>

                            <Stack
                              spacing={0.3}
                              sx={{ color: "text.secondary" }}
                            >
                              <Typography variant="body2">
                                Pedidos: {ruta.pedidos?.length || 0}
                              </Typography>
                              <Typography variant="body2">
                                Total:{" "}
                                {formatCurrency(
                                  Number.isFinite(totalRuta) ? totalRuta : 0
                                )}
                              </Typography>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={0.5}
                              flexWrap="wrap"
                              sx={{ mt: 1 }}
                            >
                              {Object.entries(statusCount).map(
                                ([status, count]) =>
                                  count > 0 ? (
                                    <Chip
                                      key={status}
                                      label={`${status}: ${count}`}
                                      size="small"
                                      sx={{ bgcolor: "grey.100" }}
                                    />
                                  ) : null
                              )}
                            </Stack>
                          </CardContent>

                          <CardActions
                            sx={{ justifyContent: "center", mt: "auto", pb: 2 }}
                          >
                            <Button
                              variant="contained"
                              sx={{ textTransform: "none" }}
                              onClick={() => {
                                openDetallesRuta?.(ruta.nombre);
                                openPedidosDeBDModal?.(ruta);
                                setModalRoute(ruta.nombre);
                                setSelectedRuta(ruta);
                              }}
                            >
                              Ver Pedidos
                            </Button>
                          </CardActions>
                        </Card>
                      );
                    })
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "text.secondary",
                        minHeight: 120,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      No hay rutas disponibles.
                    </Paper>
                  )}
                </Box>

                {/* Modal Pedidos de la ruta */}
                <Modal
                  open={!!selectedRuta}
                  onClose={() => setSelectedRuta(null)}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "95%",
                      maxWidth: 1100,
                      maxHeight: "85vh",
                      overflowY: "auto",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Pedidos de la Ruta: {selectedRuta?.nombre} —{" "}
                      {formatCurrency(getTotalRuta(selectedRuta))}
                    </Typography>

                    {getPedidosRuta(selectedRuta?.nombre).length > 0 ? (
                      <TableContainer component={Paper}>
                        <Button
                          onClick={() =>
                            reactivarRuta(
                              selectedRuta.nombre,
                              getPedidosRuta(selectedRuta.nombre)
                            )
                          }
                          sx={{ m: 1 }}
                        >
                          Reactivar como Ruta
                        </Button>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>No. Orden</TableCell>
                              <TableCell>Tipo Orden</TableCell>
                              <TableCell>Cliente</TableCell>
                              <TableCell>Municipio</TableCell>
                              <TableCell>Estado</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Partidas</TableCell>
                              <TableCell>Piezas</TableCell>
                              <TableCell>Fecha Emisión</TableCell>
                              <TableCell>Observaciones</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPedidosRuta(selectedRuta?.nombre).map(
                              (pedido) => (
                                <TableRow key={pedido.id}>
                                  <TableCell>{pedido.no_orden}</TableCell>
                                  <TableCell>
                                    {pedido.tipo || "Sin tipo"}
                                  </TableCell>
                                  <TableCell>{pedido.nombre_cliente}</TableCell>
                                  <TableCell>{pedido.municipio}</TableCell>
                                  <TableCell>{pedido.estado}</TableCell>
                                  <TableCell>
                                    {formatCurrency(Number(pedido.total) || 0)}
                                  </TableCell>
                                  <TableCell>{pedido.partidas}</TableCell>
                                  <TableCell>{pedido.piezas}</TableCell>
                                  <TableCell>{pedido.fecha_emision}</TableCell>
                                  <TableCell>{pedido.observaciones}</TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: pedido.color }}
                                    >
                                      {pedido.statusText}
                                    </Typography>
                                    {pedido.fusionWith && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "#800080",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        (Fusionado con {pedido.fusionWith})
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">
                        No hay pedidos en esta ruta.
                      </Typography>
                    )}

                    <Box textAlign="right" mt={2}>
                      <Button
                        onClick={() => setSelectedRuta(null)}
                        variant="contained"
                        size="small"
                      >
                        Cerrar
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Box>
            )}

            {/* === Carrusel de rutas (groupedData) o selector múltiple === */}
            {Object.keys(groupedData).length <= MAX_VISIBLE_ROUTES ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    px: 1,
                    py: 1,
                    gap: 1,
                    maxWidth: "100%",
                  }}
                >
                  {Object.keys(groupedData)
                    .filter((route) => !hiddenRoutes.includes(route))
                    .map((route) => {
                      const totals = calculateTotals(route);
                      const pedidosOrdenes = groupedData[route].rows
                        .map((p) => p["NO ORDEN"])
                        .join(", ");
                      return (
                        <Tooltip
                          key={route}
                          title={
                            <Typography sx={{ fontSize: 14, p: 1 }}>
                              <b>Órdenes:</b> {pedidosOrdenes || "Sin pedidos"}
                            </Typography>
                          }
                          arrow
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              minWidth: 220,
                              maxWidth: 220,
                              textAlign: "center",
                              p: 1.5,
                              borderRadius: 1.5,
                              position: "relative",
                              cursor: "pointer",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() =>
                                  setHiddenRoutes((prev) => [...prev, route])
                                }
                              >
                                <VisibilityOffIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeRoute(route)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <Checkbox
                              checked={selectedRoutes.includes(route)}
                              onChange={() => handleSelectRoute(route)}
                            />
                            <Typography variant="subtitle1" fontWeight={700}>
                              Ruta: {route}
                            </Typography>
                            <Typography variant="body2">
                              <b>Total:</b> {formatCurrency(totals.TOTAL)}
                            </Typography>
                            <Typography variant="body2">
                              <b>Partidas:</b> {totals.PARTIDAS}
                            </Typography>
                            <Typography variant="body2">
                              <b>Piezas:</b> {totals.PIEZAS}
                            </Typography>
                            <Button
                              onClick={() => openModal(route)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            >
                              Ver Detalles
                            </Button>
                          </Paper>
                        </Tooltip>
                      );
                    })}
                </Box>

                {hiddenRoutes.length > 0 && (
                  <Box mt={1.5}>
                    <Typography fontWeight="bold">Rutas ocultas:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                      {hiddenRoutes.map((route) => (
                        <Chip
                          key={route}
                          label={route}
                          onDelete={() =>
                            setHiddenRoutes((prev) =>
                              prev.filter((r) => r !== route)
                            )
                          }
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Seleccionar Ruta</InputLabel>
                <Select
                  multiple
                  value={selectedRoutes}
                  onChange={(e) => setSelectedRoutes(e.target.value)}
                  renderValue={(s) => s.join(", ")}
                >
                  {Object.keys(groupedData).map((route) => (
                    <MenuItem key={route} value={route}>
                      <Checkbox checked={selectedRoutes.includes(route)} />
                      {route}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Confirmar envío */}
            <Modal
              open={confirmSendModalOpen}
              onClose={() => setConfirmSendModalOpen(false)}
              aria-labelledby="confirm-send-modal-title"
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  m: "50px auto",
                  maxWidth: 420,
                  textAlign: "center",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" id="confirm-send-modal-title">
                  ¿Está seguro de mandar estas rutas?
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Rutas seleccionadas: {selectedRoutes.join(", ")}
                </Typography>
                <Box mt={2} display="flex" gap={1} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendRoutes}
                  >
                    Sí
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setConfirmSendModalOpen(false)}
                  >
                    No
                  </Button>
                </Box>
              </Box>
            </Modal>

            {/* === Modal Detalles de la Ruta === */}
            <Modal open={modalOpen} onClose={closeModal}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  m: "20px auto",
                  maxWidth: "95%",
                  maxHeight: "90vh",
                  overflow: "auto",
                  borderRadius: 2,
                  boxShadow: 6,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {editingRoute === selectedRoute ? (
                    <>
                      <TextField
                        value={newRouteName}
                        onChange={(e) => setNewRouteName(e.target.value)}
                        onBlur={() => {
                          renameRoute(selectedRoute, newRouteName);
                          setEditingRoute(null);
                        }}
                        autoFocus
                        size="small"
                      />
                      <Button
                        onClick={() => renameRoute(selectedRoute, newRouteName)}
                      >
                        Guardar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6">
                        Detalles de la Ruta: {selectedRoute}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingRoute(selectedRoute);
                          setNewRouteName(selectedRoute);
                        }}
                      >
                        <BorderColorIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>

                {selectedRoute &&
                groupedData[selectedRoute]?.rows?.length > 0 ? (
                  <>
                    <Grid item xs={12} sm={4} sx={{ mb: 2 }}>
                      <TextField
                        label="Buscar por No Orden"
                        variant="outlined"
                        value={filterOrderValue}
                        onChange={handleOrderFilterChange}
                        fullWidth
                        size="small"
                        sx={{ maxWidth: 300 }}
                      />
                    </Grid>

                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Movimientos</TableCell>
                            <TableCell>FECHA</TableCell>
                            <TableCell>NO ORDEN</TableCell>
                            <TableCell>TIPO ORDEN</TableCell>
                            <TableCell>NO FACTURA</TableCell>
                            <TableCell>NUM. CLIENTE</TableCell>
                            <TableCell>NOMBRE DEL CLIENTE</TableCell>
                            <TableCell>ZONA</TableCell>
                            <TableCell>MUNICIPIO</TableCell>
                            <TableCell>ESTADO</TableCell>
                            <TableCell>OBSERVACIONES</TableCell>
                            <TableCell>TOTAL</TableCell>
                            <TableCell>PARTIDAS</TableCell>
                            <TableCell>PIEZAS</TableCell>
                            <TableCell>ACCIONES</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {(() => {
                            const rows = groupedData[selectedRoute].rows;
                            const len = rows.length;

                            // 1) Clon + index real
                            const sorted = rows
                              .map((row, originalIndex) => ({
                                row,
                                originalIndex,
                              }))
                              .sort((a, b) => {
                                const nombreA = (
                                  a.row["NOMBRE DEL CLIENTE"] ||
                                  a.row.nombre_cliente ||
                                  ""
                                ).toUpperCase();
                                const nombreB = (
                                  b.row["NOMBRE DEL CLIENTE"] ||
                                  b.row.nombre_cliente ||
                                  ""
                                ).toUpperCase();
                                return nombreA.localeCompare(nombreB);
                              });

                            // 2) Render usando originalIndex en todos los handlers
                            return sorted.map(
                              ({ row, originalIndex }, visualIndex) => (
                                <TableRow
                                  key={row["NO ORDEN"]}
                                  sx={{
                                    bgcolor:
                                      highlightedRow === row["NO ORDEN"]
                                        ? "#fff59d"
                                        : "transparent",
                                  }}
                                >
                                  <TableCell>
                                    {originalIndex !== 0 && (
                                      <IconButton
                                        onClick={() =>
                                          moverPedido(
                                            selectedRoute,
                                            originalIndex,
                                            "arriba"
                                          )
                                        }
                                      >
                                        <ArrowUpwardIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      </IconButton>
                                    )}
                                    {originalIndex !== len - 1 && (
                                      <IconButton
                                        onClick={() =>
                                          moverPedido(
                                            selectedRoute,
                                            originalIndex,
                                            "abajo"
                                          )
                                        }
                                      >
                                        <ArrowDownwardIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      </IconButton>
                                    )}
                                  </TableCell>

                                  <TableCell>{row["FECHA"]}</TableCell>
                                  <TableCell>
                                    {row["NO ORDEN"] || row.no_orden}
                                  </TableCell>
                                  <TableCell>
                                    {row.tipo ||
                                      row["TIPO ORIGINAL"] ||
                                      "Sin dato"}
                                  </TableCell>
                                  <TableCell>{row["NO FACTURA"]}</TableCell>
                                  <TableCell>
                                    {row["NUM. CLIENTE"] || row.num_cliente}
                                  </TableCell>
                                  <TableCell>
                                    {row["NOMBRE DEL CLIENTE"] ||
                                      row.nombre_cliente}
                                  </TableCell>
                                  <TableCell>{row["ZONA"]}</TableCell>
                                  <TableCell>
                                    {row["MUNICIPIO"] || row.municipio}
                                  </TableCell>
                                  <TableCell>
                                    {row["ESTADO"] || row.estado}
                                  </TableCell>

                                  <TableCell>
                                    {editingObservationId ===
                                    row["NUM. CLIENTE"] ? (
                                      <TextField
                                        value={
                                          modalObservaciones[
                                            row["NUM. CLIENTE"]
                                          ] ||
                                          row["OBSERVACIONES"] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleSaveModalObservation(
                                            row["NUM. CLIENTE"],
                                            e.target.value
                                          )
                                        }
                                        variant="outlined"
                                        size="small"
                                        autoFocus
                                        onKeyDown={(e) =>
                                          e.key === "Enter" &&
                                          setEditingObservationId(null)
                                        }
                                      />
                                    ) : (
                                      <span
                                        onDoubleClick={() =>
                                          handleEditModalObservation(
                                            row["NUM. CLIENTE"]
                                          )
                                        }
                                        style={{ cursor: "pointer" }}
                                      >
                                        {modalObservaciones[
                                          row["NUM. CLIENTE"]
                                        ] ||
                                          row["OBSERVACIONES"] ||
                                          "Sin observaciones"}
                                      </span>
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {formatCurrency(row.TOTAL)}
                                  </TableCell>
                                  <TableCell>{row.PARTIDAS}</TableCell>
                                  <TableCell>{row.PIEZAS}</TableCell>

                                  <TableCell>
                                    {editRouteIndex === originalIndex ? (
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Cambiar Ruta</InputLabel>
                                        <Select
                                          value={selectedRoute}
                                          onChange={(e) => {
                                            assignToRoute(row, e.target.value);
                                            setEditRouteIndex(null);
                                          }}
                                          displayEmpty
                                        >
                                          <MenuItem disabled value="">
                                            Seleccionar Ruta
                                          </MenuItem>
                                          {Object.keys(groupedData).map(
                                            (route) => (
                                              <MenuItem
                                                key={route}
                                                value={route}
                                              >
                                                {route}
                                              </MenuItem>
                                            )
                                          )}
                                        </Select>
                                      </FormControl>
                                    ) : (
                                      <IconButton
                                        onClick={() =>
                                          setEditRouteIndex(originalIndex)
                                        }
                                      >
                                        <CompareArrowsIcon />
                                      </IconButton>
                                    )}
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        removeFromRoute(row, selectedRoute)
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Typography>
                    No hay datos disponibles para esta ruta.
                  </Typography>
                )}

                <Box textAlign="right" mt={2}>
                  <Button onClick={closeModal} variant="contained" size="small">
                    Cerrar
                  </Button>
                </Box>
              </Box>
            </Modal>

            {/* === Tabla principal con filtros === */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Grid container spacing={1} sx={{ p: 2, pb: 0 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Buscar por No Orden"
                    variant="outlined"
                    name="noOrden"
                    value={filter.noOrden}
                    onChange={handleFilterChange}
                    fullWidth
                    size="small"
                    sx={{ maxWidth: 260 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Buscar por Num Cliente"
                    variant="outlined"
                    name="numCliente"
                    value={filter.numCliente}
                    onChange={handleFilterChange}
                    fullWidth
                    size="small"
                    sx={{ maxWidth: 260 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Buscar por Estado"
                    variant="outlined"
                    name="estado"
                    value={filter.estado}
                    onChange={handleFilterChange}
                    fullWidth
                    size="small"
                    sx={{ maxWidth: 260 }}
                  />
                </Grid>
              </Grid>

              {tabIndex === 0 &&
                selectedOrders.length > 0 &&
                ["Admin", "Master", "Trans"].includes(user?.role) && (
                  <Box display="flex" alignItems="center" gap={2} p={2}>
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 240 }}
                    >
                      <InputLabel>Seleccionar Ruta</InputLabel>
                      <Select
                        value={selectedMassRoute}
                        onChange={(e) => setSelectedMassRoute(e.target.value)}
                        label="Seleccionar Ruta"
                      >
                        {Object.keys(groupedData).map((ruta) => (
                          <MenuItem key={ruta} value={ruta}>
                            {ruta}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!selectedMassRoute}
                      onClick={handleAssignMultipleToRoute}
                    >
                      Asignar
                    </Button>
                  </Box>
                )}

              <TablePagination
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={Math.min(
                  page,
                  Math.floor(filteredData.length / rowsPerPage)
                )}
                onPageChange={(event, newPage) => setPage(newPage)}
                labelRowsPerPage=""
                rowsPerPageOptions={[]}
                sx={{ px: 2 }}
              />

              {(user?.role === "Trans" || user?.role === "Admin") && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={filtrarPedidosExistentes}
                  startIcon={<DeleteSweepIcon />}
                  style={{ marginLeft: "10px" }}
                >
                  Limpiar pedidos registrados
                </Button>
              )}

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Seleccionar</TableCell>
                    <TableCell>FECHA</TableCell>
                    <TableCell>NO ORDEN</TableCell>
                    <TableCell>TIPO ORDEN</TableCell>
                    <TableCell>NUM. CLIENTE</TableCell>
                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                    <TableCell>Codigo Postal</TableCell>
                    <TableCell>MUNICIPIO</TableCell>
                    <TableCell>ESTADO</TableCell>
                    <TableCell>OBSERVACIONES</TableCell>
                    <TableCell>TOTAL</TableCell>
                    <TableCell>PARTIDAS</TableCell>
                    <TableCell>PIEZAS</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        No hay datos disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedOrders.includes(row["NO ORDEN"])}
                            onChange={() => handleToggleOrderSelection(row)}
                          />
                        </TableCell>
                        <TableCell>{row.FECHA}</TableCell>
                        <TableCell>{row["NO ORDEN"]}</TableCell>
                        <TableCell>
                          {row["TIPO ORIGINAL"] || "Sin dato"}
                        </TableCell>
                        <TableCell>{row["NUM. CLIENTE"]}</TableCell>
                        <TableCell>{row["NOMBRE DEL CLIENTE"]}</TableCell>
                        <TableCell>{row["Codigo_Postal"]}</TableCell>
                        <TableCell>
                          {row.MUNICIPIO || "Sin Municipio"}
                        </TableCell>
                        <TableCell>{row.ESTADO}</TableCell>

                        <TableCell>
                          {editingClientId === row["NUM. CLIENTE"] ? (
                            <TextField
                              value={
                                observacionesPorRegistro[row["NUM. CLIENTE"]] ||
                                "Sin observaciones disponibles"
                              }
                              onChange={(e) =>
                                handleSaveObservation(
                                  row["NUM. CLIENTE"],
                                  e.target.value
                                )
                              }
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <span
                              onClick={() =>
                                handleEditObservation(row["NUM. CLIENTE"])
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {observacionesPorRegistro[row["NUM. CLIENTE"]] ||
                                "Sin observaciones"}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>{formatCurrency(row.TOTAL)}</TableCell>
                        <TableCell>{row.PARTIDAS}</TableCell>
                        <TableCell>{row.PIEZAS}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel>Seleccionar Ruta</InputLabel>
                            <Select
                              value=""
                              onChange={(e) =>
                                assignToRoute(row, e.target.value)
                              }
                              displayEmpty
                            >
                              <MenuItem disabled value="">
                                Seleccionar Ruta
                              </MenuItem>
                              {Object.keys(groupedData).map((route) => (
                                <MenuItem key={route} value={route}>
                                  {route}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

      {/* Segundo Tab: Otra información o tabla */}
      {tabIndex === 1 &&
        (user?.role === "Admin" ||
          user?.role === "Master" ||
          user?.role === "Trans" ||
          user?.role === "PQ1" ||
          user?.role === "Control" ||
          user?.role === "EB1" ||
          user?.role === "Paquet" ||
          user?.role === "Embar" ||
          user?.role === "Rep" ||
          user?.role === "Tran",
        "Rep") && (
          <Box marginTop={2}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Tipos de rutas
            </Typography>

            {tabIndex === 1 &&
              (user?.role === "Admin" ||
                user?.role === "Master" ||
                user?.role === "Tran") && (
                <Card
                  sx={{
                    padding: 2,
                    marginBottom: 2,
                    boxShadow: 2,
                    borderRadius: 2,
                    maxWidth: "600px",
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h6"
                    color="black"
                    sx={{ fontSize: "16px", marginBottom: 1 }}
                  >
                    Subir archivo de facturas
                  </Typography>

                  {/* Contenedor de carga de archivo */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    marginBottom={1}
                  >
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{
                        background:
                          "linear-gradient(to right, #ff6b6b, #ff8e53)",
                        color: "white",
                        fontSize: "12px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        minWidth: "auto",
                        "&:hover": {
                          background:
                            "linear-gradient(to right, #ff3b3b, #ff6b6b)",
                        },
                      }}
                    >
                      Subir Archivo
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={updateFacturas}
                      disabled={!file || uploading}
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        minWidth: "auto",
                        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        "Actualizar"
                      )}
                    </Button>
                  </Box>

                  {/* <Box mt={2}>
                    <Typography variant="h6">
                      Actualizar tipo original desde Excel
                    </Typography>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleArchivoTipoOriginal}
                      style={{ marginTop: "8px" }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={subirArchivoTipoOriginal}
                      style={{ marginLeft: "12px", marginTop: "8px" }}
                      startIcon={<CloudUpload />}
                    >
                      Subir Excel
                    </Button>
                  </Box> */}

                  {uploadMessage && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: uploading ? "gray" : "green",
                        marginBottom: 1,
                        fontSize: "12px",
                      }}
                    >
                      {uploadMessage}
                    </Typography>
                  )}

                  {/* Lista de órdenes actualizadas */}
                  {updatedOrders.length > 0 && (
                    <Card
                      sx={{
                        padding: 1,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 2,
                        fontSize: "12px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        sx={{ fontSize: "12px" }}
                      >
                        Órdenes actualizadas:
                      </Typography>
                      <Box
                        sx={{
                          maxHeight: "100px",
                          overflowY: "auto",
                          padding: "3px",
                        }}
                      >
                        {updatedOrders.map((order, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: "#333",
                              fontSize: "12px",
                            }}
                          >
                            {order}
                          </Typography>
                        ))}
                      </Box>
                    </Card>
                  )}
                </Card>
              )}

            {["Admin", "Master", "Tran", "Trans", "Rep", "AdminTran"].includes(
              user?.role
            ) && (
              <Box display="flex" gap={2} mb={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenModalGuia}
                  sx={{ fontWeight: "bold" }}
                >
                  PRORRATEO
                </Button>

                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setBulkGuiaModalOpen(true)}
                  sx={{ fontWeight: "bold" }}
                >
                  Actualizar Guías
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={handleExportarPorMes}
                  style={{ marginLeft: 10 }}
                >
                  EXPORTAR PAQUETERÍA POR MES
                </Button>

                <Button
                  variant="contained"
                  onClick={handleOpenPorrateo}
                  style={{ marginBottom: 10 }}
                >
                  Ver Porrateo (por Transporte)
                </Button>
              </Box>
            )}

            <select
              value={mesSeleccionado}
              className="form-select"
              onChange={(e) => {
                const mes = e.target.value;
                setMesSeleccionado(mes);

                fetchPaqueteriaRoutes({
                  mes,
                  anio, // 👈 SIEMPRE manda el año
                });
              }}
            >
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>

            <select
              value={anio}
              className="form-select"
              onChange={(e) => {
                const nuevoAnio = e.target.value;
                setAnio(nuevoAnio);

                fetchPaqueteriaRoutes({
                  mes: mesSeleccionado, // 👈 SIEMPRE manda el mes
                  anio: nuevoAnio,
                });
              }}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>

            {/* ===== Modal: Porrateo por Transporte ===== */}

            <Dialog
              open={openPorrateo}
              onClose={() => setOpenPorrateo(false)}
              fullWidth
              maxWidth="xl"
              PaperProps={{
                sx: {
                  width: { xs: "100vw", md: "95vw" },
                  maxWidth: { xs: "100vw", md: "95vw" },
                  height: { xs: "100vh", md: "90vh" },
                },
              }}
            >
              <DialogTitle>Porrateo por Transporte</DialogTitle>

              <DialogContent dividers sx={{ p: 1 }}>
                {/* Barra superior */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    label="Mes"
                    type="month"
                    size="small"
                    value={selectedMonthPorrateo}
                    onChange={(e) => setSelectedMonthPorrateo(e.target.value)}
                  />
                  <Button variant="outlined" onClick={handleOpenPorrateo}>
                    Cargar
                  </Button>

                  {/* ÚNICO campo que captura el usuario */}
                  <TextField
                    label="Total Factura LT (grupo)"
                    size="small"
                    value={montoGrupo}
                    onChange={(e) => setMontoGrupo(e.target.value)}
                    sx={{ ml: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Número de Factura LT (grupo)"
                    size="small"
                    value={numeroFacturaGrupo}
                    onChange={(e) => setNumeroFacturaGrupo(e.target.value)}
                    sx={{ ml: 1, minWidth: 220 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      ml: "auto",
                    }}
                  >
                    <TextField
                      label="Buscar por Guía"
                      size="small"
                      value={guiaQuery}
                      onChange={(e) => {
                        const query = e.target.value.trim();
                        setGuiaQuery(query);
                        setPorrateoPage(0);

                        const guiasDisponibles = Object.keys(
                          (porrateoGroups[selectedTransport] || []).reduce(
                            (acc, r) => {
                              const g = String(r.GUIA ?? "").trim();
                              if (g) acc[g] = true;
                              return acc;
                            },
                            {}
                          )
                        );

                        if (guiasDisponibles.includes(query)) {
                          setSelectedGuia(query);
                        } else {
                          setSelectedGuia("");
                        }
                      }}
                    />
                    <Button
                      variant="text"
                      onClick={() => {
                        setSelectedGuia("");
                        setGuiaQuery("");
                        setPorrateoPage(0);
                      }}
                    >
                      Limpiar
                    </Button>
                  </Box>

                  {loadingPorrateo && (
                    <Typography variant="body2">Cargando…</Typography>
                  )}
                  {errorPorrateo && (
                    <Typography color="error">{errorPorrateo}</Typography>
                  )}
                </Box>

                {/* Chips transporte */}
                {transportKeys.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      overflowX: "auto",
                      pb: 1,
                      mb: 2,
                    }}
                  >
                    {transportKeys.map((t) => (
                      <Chip
                        key={t}
                        label={`${t} — ${porrateoGroups[t]?.length || 0}`}
                        clickable
                        color={selectedTransport === t ? "primary" : "default"}
                        onClick={() => {
                          setSelectedTransport(t);
                          setPorrateoPage(0);
                        }}
                        sx={{ flexShrink: 0 }}
                      />
                    ))}
                  </Box>
                )}

                {/* Chips guía */}
                {!!selectedTransport && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      overflowX: "auto",
                      pb: 1,
                      mb: 2,
                    }}
                  >
                    {Object.entries(
                      (porrateoGroups[selectedTransport] || []).reduce(
                        (acc, r) => {
                          const g = String(r.GUIA ?? "").trim();
                          acc[g] = (acc[g] || 0) + 1;
                          return acc;
                        },
                        {}
                      )
                    )
                      .sort(([a], [b]) =>
                        a.localeCompare(b, "es", { numeric: true })
                      )
                      .map(([g, count]) => (
                        <Chip
                          key={g}
                          label={`${g} — ${count}`}
                          clickable
                          color={selectedGuia === g ? "primary" : "default"}
                          onClick={() => {
                            setSelectedGuia(selectedGuia === g ? "" : g);
                            setPorrateoPage(0);
                          }}
                          sx={{ flexShrink: 0 }}
                        />
                      ))}
                  </Box>
                )}

                {/* Tabla / cálculo */}
                {!selectedTransport ? (
                  <Typography variant="body2">
                    Selecciona un transporte.
                  </Typography>
                ) : (
                  <>
                    {(() => {
                      // ===== Helpers =====
                      const normGuia = (v) => String(v ?? "").trim();
                      const toNumber = (v) => {
                        if (v === null || v === undefined) return 0;
                        const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
                        return Number.isFinite(n) ? n : 0;
                      };
                      const round2 = (n) =>
                        Math.round((n + Number.EPSILON) * 100) / 100;
                      const formatCurrency = (n) =>
                        n?.toLocaleString?.("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        }) ?? n;
                      const formatDate = (iso) => {
                        if (!iso) return "";
                        const d = new Date(iso);
                        if (isNaN(d)) return String(iso);
                        const dd = String(d.getDate()).padStart(2, "0");
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const yy = d.getFullYear();
                        return `${dd}/${mm}/${yy}`;
                      };
                      // llave ESTABLE (NO usa GUIA)
                      const keyForStable = (r) =>
                        `${
                          r["NO ORDEN"] ?? r.no_orden ?? r.noOrden ?? ""
                        }__${String(r.tipo_original ?? "").trim()}`;
                      const getNoOrden = (r) =>
                        r["NO ORDEN"] ?? r.no_orden ?? r.noOrden ?? "";

                      const baseRows = porrateoGroups[selectedTransport] || [];
                      const byChip = selectedGuia
                        ? baseRows.filter(
                            (r) => normGuia(r.GUIA) === selectedGuia
                          )
                        : baseRows;
                      const q = guiaQuery.trim().toLowerCase();
                      const filteredRows = q
                        ? byChip.filter((r) =>
                            normGuia(r.GUIA).toLowerCase().includes(q)
                          )
                        : byChip;

                      // === Cálculos ===
                      const baseTotal = filteredRows.reduce(
                        (acc, r) => acc + toNumber(r.TOTAL),
                        0
                      );

                      // Prefiere lo que capture el usuario; si no hay, toma el primero que venga de BD
                      const grupoFromDB = toNumber(
                        filteredRows[0]?.TOTAL_FACTURA_LT
                      );
                      const totalGrupoEff =
                        toNumber(montoGrupo) || grupoFromDB || 0;

                      const factor =
                        baseTotal > 0 ? totalGrupoEff / baseTotal : 0;

                      // Paginación
                      const totalCount = filteredRows.length;
                      const pageStart = porrateoPage * porrateoRowsPerPage;
                      const pageEnd = pageStart + porrateoRowsPerPage;
                      const pageRows = filteredRows.slice(pageStart, pageEnd);

                      const putFila = async (
                        r,
                        isFirst,
                        prCalc,
                        totalGrupoEff,
                        porcentajeGlobalCalc
                      ) => {
                        const body = {
                          no_orden: String(getNoOrden(r)),
                          tipo_original: String(r.tipo_original || "").trim(),
                          guia: String(r.GUIA ?? "").trim(),
                          fecha_de_entrega_cliente:
                            r.fecha_de_entrega_cliente || "",
                          prorrateo_factura_lt: prCalc, // 👈 cálculo
                          suma_flete: prCalc, // 👈 cálculo
                          total_factura_lt: totalGrupoEff, // 👈 solo primera; demás NULL
                          NUMERO_DE_FACTURA_LT:
                            numeroFacturaGrupo || r.NUMERO_DE_FACTURA_LT,
                          por_paq: (factor * 100).toFixed(2),

                          suma_gastos_extras:
                            r.suma_gastos_extras !== undefined
                              ? r.suma_gastos_extras
                              : r.SUMA_GASTOS_EXTRAS,

                          // 👇 igual para % global
                          porcentaje_global:
                            porcentajeGlobalCalc ?? r.PORCENTAJE_GLOBAL,
                        };

                        const rowKey = keyForStable(r);
                        try {
                          setSavingRowKey(rowKey);
                          await axios.put(
                            "http://66.232.105.87:3007/api/Trasporte/Paqueteria/actualizarNuevoPorrateo",
                            body
                          );

                          // Parche local
                          const t = selectedTransport;
                          setPorrateoGroups((prev) => {
                            const copy = { ...prev };
                            copy[t] = (copy[t] || []).map((x) =>
                              keyForStable(x) === rowKey
                                ? {
                                    ...x,
                                    TOTAL_FACTURA_LT: isFirst
                                      ? totalGrupoEff
                                      : null,
                                    PRORRATEO_FACTURA_LT: prCalc,
                                    SUMA_FLETE: prCalc,
                                    NUMERO_DE_FACTURA_LT:
                                      numeroFacturaGrupo ||
                                      r.NUMERO_DE_FACTURA_LT,
                                    PORCENTAJE_PAQUETERIA: (
                                      factor * 100
                                    ).toFixed(2),
                                  }
                                : x
                            );
                            return copy;
                          });
                        } catch (e) {
                          console.error(
                            "[PUT ERROR]",
                            e?.response?.status,
                            e?.response?.data || e.message
                          );
                          setErrorPorrateo?.("Error al actualizar la fila.");
                        } finally {
                          setSavingRowKey("");
                        }
                      };

                      // Guardado masivo
                      const aplicarYGuardarProrrateo = async () => {
                        if (totalGrupoEff <= 0 || baseTotal <= 0) {
                          alert(
                            "Escribe un Total Factura LT (grupo) válido y asegúrate que la suma de TOTAL sea mayor a 0."
                          );
                          return;
                        }
                        for (let i = 0; i < filteredRows.length; i++) {
                          const r = filteredRows[i];

                          // TOTAL de la fila (no el acumulado del grupo)
                          const totalBaseRow = toNumber(r.TOTAL);

                          // prorrateo para la fila
                          const prCalc = round2(factor * totalBaseRow);

                          // gasto extra de la fila
                          const gastoExtra = toNumber(r.suma_gastos_extras);

                          // % global de la fila = (prorrateo + gasto extra) / TOTAL fila * 100
                          const porcentajeGlobalCalc =
                            totalBaseRow > 0
                              ? round2(
                                  ((prCalc + gastoExtra) / totalBaseRow) * 100
                                )
                              : 0;

                          await putFila(
                            r,
                            i === 0, // la primera manda TOTAL_FACTURA_LT
                            prCalc,
                            totalGrupoEff,
                            porcentajeGlobalCalc // <-- ahora sí lo enviamos
                          );
                        }
                      };

                      return (
                        <>
                          {/* Resumen */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              mb: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {selectedTransport} — {totalCount} registros
                              {selectedGuia ? ` (Guía: ${selectedGuia})` : ""}
                            </Typography>
                            <Typography variant="body2">
                              Suma TOTAL (base): {formatCurrency(baseTotal)}
                            </Typography>
                            <Typography variant="body2">
                              Total Factura LT (grupo):{" "}
                              {formatCurrency(totalGrupoEff)}
                            </Typography>
                            <Typography variant="body2">
                              Factor: {factor.toFixed(6)}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={aplicarYGuardarProrrateo}
                            >
                              Aplicar prorrateo y guardar
                            </Button>

                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={showExtras}
                                  onChange={(e) =>
                                    setShowExtras(e.target.checked)
                                  }
                                />
                              }
                              label="Mostrar Gastos Extras"
                            />
                          </Box>

                          {/* Tabla */}
                          <Box sx={{ overflowX: "auto" }}>
                            <Box sx={{ minWidth: 1500 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                      NO ORDEN / TIPO
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 110,
                                      }}
                                    >
                                      Guía
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 170,
                                      }}
                                    >
                                      Número Factura LT
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 150,
                                      }}
                                    >
                                      Fecha Entrega (Cliente)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 130,
                                      }}
                                    >
                                      Total (base)
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 170,
                                      }}
                                    >
                                      Total Factura LT (actual)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 170,
                                      }}
                                    >
                                      PRORRATEO_FACTURA_LT (actual)
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 150,
                                      }}
                                    >
                                      % Paquetería
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 150,
                                      }}
                                    >
                                      SUMA_FLETE (actual)
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 170,
                                      }}
                                    >
                                      Prorrateo (cálculo en vivo)
                                    </TableCell>

                                    {showExtras && (
                                      <TableCell
                                        sx={{
                                          whiteSpace: "nowrap",
                                          minWidth: 110,
                                        }}
                                      >
                                        % Global
                                      </TableCell>
                                    )}

                                    {showExtras && (
                                      <TableCell
                                        sx={{
                                          whiteSpace: "nowrap",
                                          minWidth: 110,
                                        }}
                                      >
                                        Gastos Extras
                                      </TableCell>
                                    )}

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 110,
                                      }}
                                    >
                                      Tipo
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 120,
                                      }}
                                    >
                                      Creado
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "nowrap",
                                        minWidth: 120,
                                      }}
                                    >
                                      Acciones
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {pageRows.map((r, idx) => {
                                    const rowKey = keyForStable(r);
                                    const totalBase = toNumber(r.TOTAL);
                                    const prCalc = round2(factor * totalBase);

                                    const totalLtDB = toNumber(
                                      r.TOTAL_FACTURA_LT
                                    );
                                    const prorrDB = toNumber(
                                      r.PRORRATEO_FACTURA_LT
                                    );
                                    const sumaFleteDB = toNumber(r.SUMA_FLETE);

                                    // Mostrar lo que haya en BD; si no, el cálculo
                                    const prActual = prorrDB || prCalc;
                                    const sumaFleteActual =
                                      sumaFleteDB || prCalc;

                                    const gastoExtra = toNumber(
                                      r.suma_gastos_extras
                                    );

                                    // 🔥 cálculo del % Global
                                    const porcentajeGlobalCalc =
                                      totalBase > 0
                                        ? (
                                            ((prActual + gastoExtra) /
                                              totalBase) *
                                            100
                                          ).toFixed(2)
                                        : "0.00";

                                    const absIndex = pageStart + idx;
                                    const isFirst = absIndex === 0;

                                    return (
                                      <TableRow key={`${rowKey}-${idx}`}>
                                        <TableCell>
                                          {r["NO ORDEN"] ??
                                            r.no_orden ??
                                            r.noOrden ??
                                            ""}{" "}
                                          - {r.tipo_original}
                                        </TableCell>

                                        {/* Guía editable */}
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            value={String(r.GUIA ?? "")}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              const t = selectedTransport;
                                              setPorrateoGroups((prev) => {
                                                const copy = { ...prev };
                                                copy[t] = (copy[t] || []).map(
                                                  (x) =>
                                                    keyForStable(x) === rowKey
                                                      ? { ...x, GUIA: v }
                                                      : x
                                                );
                                                return copy;
                                              });
                                            }}
                                            placeholder="Guía"
                                          />
                                        </TableCell>

                                        {/* Número Factura LT editable */}
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            value={String(
                                              r.NUMERO_DE_FACTURA_LT ?? ""
                                            )}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              const t = selectedTransport;
                                              setPorrateoGroups((prev) => {
                                                const copy = { ...prev };
                                                copy[t] = (copy[t] || []).map(
                                                  (x) =>
                                                    keyForStable(x) === rowKey
                                                      ? {
                                                          ...x,
                                                          NUMERO_DE_FACTURA_LT:
                                                            v,
                                                        }
                                                      : x
                                                );
                                                return copy;
                                              });
                                            }}
                                            placeholder="Factura LT"
                                          />
                                        </TableCell>

                                        {/* Fecha editable */}
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            type="date"
                                            value={(
                                              r.fecha_de_entrega_cliente ??
                                              r.FECHA_DE_ENTREGA_CLIENTE ??
                                              ""
                                            )
                                              .toString()
                                              .slice(0, 10)}
                                            onChange={(e) => {
                                              const v = e.target.value; // YYYY-MM-DD
                                              const t = selectedTransport;
                                              setPorrateoGroups((prev) => {
                                                const copy = { ...prev };
                                                copy[t] = (copy[t] || []).map(
                                                  (x) =>
                                                    keyForStable(x) === rowKey
                                                      ? {
                                                          ...x,
                                                          fecha_de_entrega_cliente:
                                                            v,
                                                        }
                                                      : x
                                                );
                                                return copy;
                                              });
                                            }}
                                            InputLabelProps={{ shrink: true }}
                                            placeholder="yyyy-mm-dd"
                                          />
                                        </TableCell>

                                        {/* Total base (solo lectura) */}
                                        <TableCell>
                                          {formatCurrency(totalBase)}
                                        </TableCell>

                                        {/* Total Factura LT (actual) => SOLO en la primera fila; BD o grupo */}
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            type="number"
                                            value={
                                              isFirst
                                                ? totalLtDB || totalGrupoEff
                                                : ""
                                            }
                                            InputProps={{ readOnly: true }}
                                            placeholder={isFirst ? "" : "—"}
                                          />
                                        </TableCell>

                                        {/* PRORRATEO_FACTURA_LT (actual) => prorrateo */}
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            type="number"
                                            value={prActual}
                                            InputProps={{ readOnly: true }}
                                          />
                                        </TableCell>

                                        <TableCell>
                                          {r.PORCENTAJE_PAQUETERIA != null
                                            ? `${toNumber(
                                                r.PORCENTAJE_PAQUETERIA
                                              ).toFixed(2)}%`
                                            : `${(factor * 100).toFixed(2)}%`}
                                        </TableCell>

                                        {/* SUMA_FLETE (actual) => prorrateo */}
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            type="number"
                                            value={sumaFleteActual}
                                            InputProps={{ readOnly: true }}
                                          />
                                        </TableCell>

                                        {/* Prorrateo (visual formateado) */}
                                        <TableCell>
                                          {formatCurrency(prCalc)}
                                        </TableCell>

                                        {/* % Global editable por fila */}
                                        {showExtras && (
                                          <TableCell>
                                            <TextField
                                              size="small"
                                              type="text"
                                              value={
                                                r.PORCENTAJE_GLOBAL !==
                                                undefined
                                                  ? `${Number(
                                                      r.PORCENTAJE_GLOBAL
                                                    ).toFixed(2)}%`
                                                  : `${porcentajeGlobalCalc}%`
                                              }
                                              InputProps={{ readOnly: true }}
                                              sx={{ minWidth: 120 }}
                                            />
                                          </TableCell>
                                        )}

                                        {showExtras && (
                                          <TableCell>
                                            <TextField
                                              size="small"
                                              type="number"
                                              value={
                                                r.suma_gastos_extras !==
                                                undefined
                                                  ? r.suma_gastos_extras
                                                  : r.SUMA_GASTOS_EXTRAS ?? ""
                                              }
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                const gastoExtra = toNumber(v);
                                                const totalBaseRow = toNumber(
                                                  r.TOTAL
                                                );
                                                const prCalc = round2(
                                                  factor * totalBaseRow
                                                );

                                                const nuevoPorcentajeGlobal =
                                                  totalBaseRow > 0
                                                    ? round2(
                                                        ((prCalc + gastoExtra) /
                                                          totalBaseRow) *
                                                          100
                                                      )
                                                    : 0;

                                                const t = selectedTransport;
                                                setPorrateoGroups((prev) => {
                                                  const copy = { ...prev };
                                                  copy[t] = (copy[t] || []).map(
                                                    (x) =>
                                                      keyForStable(x) === rowKey
                                                        ? {
                                                            ...x,
                                                            suma_gastos_extras:
                                                              v,
                                                            PORCENTAJE_GLOBAL:
                                                              nuevoPorcentajeGlobal,
                                                          }
                                                        : x
                                                  );
                                                  return copy;
                                                });
                                              }}
                                              placeholder="Suma Gastos Extras"
                                              sx={{ minWidth: 160 }}
                                            />
                                          </TableCell>
                                        )}

                                        <TableCell>{r.TIPO}</TableCell>

                                        <TableCell>
                                          {formatDate(r.created_at)}
                                        </TableCell>

                                        <TableCell>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                              putFila(
                                                r,
                                                isFirst,
                                                prCalc,
                                                totalGrupoEff,
                                                porcentajeGlobalCalc
                                              )
                                            }
                                            disabled={savingRowKey === rowKey}
                                          >
                                            {savingRowKey === rowKey
                                              ? "Guardando..."
                                              : "Actualizar"}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          </Box>

                          <TablePagination
                            component="div"
                            count={totalCount}
                            page={porrateoPage}
                            onPageChange={(e, newPage) =>
                              setPorrateoPage(newPage)
                            }
                            rowsPerPage={porrateoRowsPerPage}
                            onRowsPerPageChange={(e) => {
                              setPorrateoRowsPerPage(
                                parseInt(e.target.value, 10)
                              );
                              setPorrateoPage(0);
                            }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                          />
                        </>
                      );
                    })()}
                  </>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 1 }}>
                <Button onClick={() => setOpenPorrateo(false)}>Cerrar</Button>
              </DialogActions>
            </Dialog>

            {/* Modal para actualizar las guias */}

            <Dialog
              open={bulkGuiaModalOpen}
              onClose={() => setBulkGuiaModalOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Actualizar Guía y Transporte</DialogTitle>
              <DialogContent>
                <TextField
                  label="Números de Orden (separados por comas)"
                  fullWidth
                  multiline
                  minRows={2}
                  value={bulkNoOrdenes}
                  onChange={(e) => setBulkNoOrdenes(e.target.value)}
                  margin="normal"
                />
                <TextField
                  label="Nueva Guía"
                  fullWidth
                  value={bulkGuiaValue}
                  onChange={(e) => setBulkGuiaValue(e.target.value)}
                  margin="normal"
                />
                <TextField
                  label="Transportista"
                  fullWidth
                  value={bulkTransportePaqueteriaValue}
                  onChange={(e) =>
                    setBulkTransportePaqueteriaValue(e.target.value)
                  }
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setBulkGuiaModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBulkGuiaUpdate}
                >
                  Actualizar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Modal dentro de Transporte.js */}

            <Dialog
              open={modalGuiaOpen}
              onClose={handleCloseModalGuia}
              fullWidth
              maxWidth="md"
            >
              <DialogTitle>Ingresar Guía</DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Número de Guía"
                      fullWidth
                      value={guia}
                      onChange={(e) => setGuia(e.target.value)}
                      margin="dense"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      onClick={buscarPedidosPorGuia}
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Buscar Pedidos
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Número de Factura LT"
                      fullWidth
                      value={numeroFacturaLT}
                      onChange={(e) => setNumeroFacturaLT(e.target.value)}
                      margin="dense"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Total Factura LT"
                      type="number"
                      fullWidth
                      value={totalFacturaLT}
                      onChange={handleTotalFacturaLTChange}
                      margin="dense"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Suma Total Pedidos"
                      value={`$${sumaTotalPedidos.toFixed(2)}`}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>

                  {pedidos.length > 0 &&
                    pedidos.map((pedido, index) => (
                      <Grid
                        item
                        xs={12}
                        key={`${pedido["NO ORDEN"]}-${index}`}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: 900,
                            padding: 3,
                            border: "1px solid #ddd",
                            borderRadius: "16px",
                            backgroundColor: "#fff",
                            boxShadow: 3,
                            position: "relative",
                          }}
                        >
                          {/* Botón X */}
                          <IconButton
                            size="small"
                            onClick={() => {
                              const nuevos = [...pedidos];
                              nuevos.splice(index, 1);
                              setPedidos(nuevos);
                            }}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "#f44336",
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>

                          <Grid container spacing={2}>
                            {/* Fila 1 */}
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Pedido"
                                value={`${pedido["NO ORDEN"]} - ${
                                  pedido.tipo_original || "tipo no definido"
                                }`}
                                fullWidth
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Total Pedido"
                                value={`$${pedido.TOTAL}`}
                                fullWidth
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Prorrateo Factura LT"
                                value={pedido.prorrateoFacturaLT}
                                onChange={(e) => {
                                  const nuevos = [...pedidos];
                                  nuevos[index].prorrateoFacturaLT =
                                    e.target.value;
                                  setPedidos(nuevos);
                                }}
                                fullWidth
                              />
                            </Grid>

                            {/* Fila 2 */}
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Suma Flete"
                                value={`$${pedido.sumaFlete}`}
                                fullWidth
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Gastos Extras"
                                value={pedido.gastosExtras || ""}
                                onChange={(e) =>
                                  handleGastosExtrasChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="% Envío"
                                value={pedido.porcentajeEnvio || ""}
                                fullWidth
                                disabled
                              />
                            </Grid>

                            {/* Fila 3 */}
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="% Paquetería"
                                value={pedido.porcentajePaqueteria}
                                fullWidth
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="% Global"
                                value={pedido.porcentajeGlobal}
                                fullWidth
                                disabled
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    ))}
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{ padding: "16px", justifyContent: "space-between" }}
              >
                <Button
                  onClick={guardarPorGuia}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    fontSize: "1rem",
                    padding: "10px",
                    backgroundColor: "#F44336",
                  }}
                >
                  GUARDAR
                </Button>
                <Button
                  onClick={handleCloseModalGuia}
                  color="secondary"
                  sx={{
                    fontSize: "0.9rem",
                    color: "#F44336",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  CANCELAR
                </Button>
              </DialogActions>
            </Dialog>

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
                <Typography variant="h6">Paquetería</Typography>

                <TextField
                  label="Buscar por No Orden o Num Cliente"
                  value={filtroGeneral}
                  onChange={(e) => setFiltroGeneral(e.target.value)}
                  variant="outlined"
                  size="small"
                  style={{ marginRight: 16 }}
                />

                <TextField
                  label="Buscar por Estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  variant="outlined"
                  size="small"
                  style={{ marginRight: 16 }}
                />

                <TextField
                  label="Buscar por Factura"
                  variant="outlined"
                  size="small"
                  value={filterFactura}
                  onChange={(e) => setFilterFactura(e.target.value)}
                  style={{ marginRight: 16 }}
                />

                <TextField
                  label="Buscar por Guía"
                  variant="outlined"
                  size="small"
                  value={filterGuia}
                  onChange={(e) => setFilterGuia(e.target.value)}
                  style={{ marginRight: 16 }}
                />

                <FormControl
                  variant="outlined"
                  style={{ minWidth: 200, marginBottom: 10, marginRight: 16 }}
                >
                  <InputLabel>Filtrar por Paquetería</InputLabel>
                  <Select
                    value={paqueteriaSeleccionada}
                    onChange={handlePaqueteriaChange}
                    label="Filtrar por Paquetería"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="PITIC">PITIC</MenuItem>
                    <MenuItem value="FLECHISA">FLECHISA</MenuItem>
                    <MenuItem value="TRESGUERRAS">TRESGUERRAS</MenuItem>
                    <MenuItem value="EXPRESS">EXPRESS</MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  variant="outlined"
                  style={{ minWidth: 200, marginBottom: 10, marginRight: 16 }}
                >
                  <InputLabel>Filtrar por Estatus</InputLabel>
                  <Select
                    value={estatusSeleccionado}
                    onChange={handleEstatusChange}
                    label="Filtrar por Estatus"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Por Asignar">Por Asignar</MenuItem>
                    <MenuItem value="Surtiendo">Surtiendo</MenuItem>
                    <MenuItem value="Embarcando">Embarcando</MenuItem>
                    <MenuItem value="Pedido Finalizado">
                      Pedido Finalizado
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* 🔹 Botón para mostrar solo las filas sin guía */}
                <Button
                  variant="contained"
                  color={mostrarSinGuia ? "secondary" : "primary"}
                  onClick={toggleMostrarSinGuia}
                  style={{ marginBottom: 10 }}
                >
                  {mostrarSinGuia ? "Mostrar Todas" : "Mostrar Sin Guía"}
                </Button>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {ordenEstatus.map((estatus) => {
                    const cantidad = conteoEstatus[estatus] || 0;

                    return (
                      <Box
                        key={estatus}
                        sx={{
                          backgroundColor: colorPorEstatus[estatus] || "#ccc",
                          color: "#fff",
                          borderRadius: 2,
                          padding: "6px 12px",
                          fontSize: 14,
                          boxShadow: 1,
                        }}
                      >
                        <strong>{estatus}:</strong> {cantidad}
                      </Box>
                    );
                  })}
                </Box>

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
                      {visibleColumns.includes("PARTIDAS") && (
                        <TableCell>PARTIDAS</TableCell>
                      )}
                      {visibleColumns.includes("PIEZAS") && (
                        <TableCell>PIEZAS</TableCell>
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
                      {visibleColumns.includes(
                        "FECHA DE ENTREGA (CLIENTE)"
                      ) && <TableCell>FECHA DE ENTREGA</TableCell>}
                      {visibleColumns.includes("Acciones") && (
                        <TableCell>Acciones</TableCell>
                      )}
                    </TableRow>
                    {paqueteriaFiltrada.length === 0 ? (
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
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((routeData, index) => (
                          <TableRow
                            key={index}
                            onClick={() => handleRowClick(routeData)}
                          >
                            {visibleColumns.includes("NO ORDEN") && (
                              <TableCell>
                                {routeData["NO ORDEN"]} -{" "}
                                {routeData["tipo_original"]}
                              </TableCell>
                            )}

                            <TableCell>
                              {/* Estado del pedido con color */}
                              <Typography
                                variant="body2"
                                style={{ color: routeData.color }}
                              >
                                {routeData.statusText}
                              </Typography>

                              {/* Si el pedido está fusionado, mostrarlo debajo en morado */}
                              {routeData.fusionWith && (
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: "#800080",
                                    fontWeight: "bold",
                                  }}
                                >
                                  ({routeData.fusionWith})
                                </Typography>
                              )}
                            </TableCell>

                            {visibleColumns.includes("FECHA") && (
                              <TableCell>
                                {formatDate(routeData.FECHA)}
                              </TableCell>
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
                                !isNaN(
                                  parseFloat(
                                    routeData.TOTAL_FACTURA_LT.toString().replace(
                                      /,/g,
                                      ""
                                    )
                                  )
                                )
                                  ? formatCurrency(
                                      parseFloat(
                                        routeData.TOTAL_FACTURA_LT.toString().replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                    )
                                  : "$0.00"}
                              </TableCell>
                            )}

                            {visibleColumns.includes("NUMERO DE FACTURA") && (
                              <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                            )}
                            {visibleColumns.includes("PARTIDAS") && (
                              <TableCell>{routeData.PARTIDAS}</TableCell>
                            )}
                            {visibleColumns.includes("PIEZAS") && (
                              <TableCell>{routeData.PIEZAS}</TableCell>
                            )}
                            {visibleColumns.includes("FECHA DE FACTURA") && (
                              <TableCell>
                                {formatDate(routeData.FECHA_DE_FACTURA)}
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
                                    style={{ color: "#1976D2" }} // Azul
                                    onClick={() => openDirectaModal(routeData)}
                                  >
                                    <BorderColorIcon />
                                  </IconButton>
                                </Grid>

                                <Grid item>
                                  {(user?.role === "Admin" ||
                                    user?.role === "Master" ||
                                    user?.role === "Trans") && (
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
                                  )}
                                </Grid>

                                <Grid item>
                                  <IconButton
                                    variant="contained"
                                    style={{ color: "black" }} // Negro con texto blanco
                                    onClick={() =>
                                      generatePDF(
                                        String(routeData["NO ORDEN"]),
                                        String(routeData["tipo_original"])
                                          .toUpperCase()
                                          .trim()
                                      )
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
                <Typography variant="h6">Directa</Typography>

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

                <TextField
                  label="Buscar por Factura"
                  variant="outlined"
                  size="small"
                  value={filterFactura}
                  onChange={(e) => setFilterFactura(e.target.value)}
                  style={{ marginRight: 16 }}
                />

                <br />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {ordenEstatus.map((estatus) => {
                    const cantidad = conteoEstatus[estatus] || 0;

                    return (
                      <Box
                        key={estatus}
                        sx={{
                          backgroundColor: colorPorEstatus[estatus] || "#ccc",
                          color: "#fff",
                          borderRadius: 2,
                          padding: "6px 12px",
                          fontSize: 14,
                          boxShadow: 1,
                        }}
                      >
                        <strong>{estatus}:</strong> {cantidad}
                      </Box>
                    );
                  })}
                </Box>

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

                {(user?.role === "Admin" ||
                  user?.role === "Master" ||
                  user?.role === "Trans") && (
                  <Button onClick={() => handleGenerateExcel(createdAt)}>
                    Exportar Datos
                  </Button>
                )}

                {(user?.role === "Admin" ||
                  user?.role === "Master" ||
                  user?.role === "Trans" ||
                  user?.role === "Embar") && (
                  <FormControl
                    variant="outlined"
                    style={{ minWidth: 200, marginBottom: 10 }}
                  >
                    <InputLabel>Filtrar por Estatus</InputLabel>
                    <Select
                      value={estatusSeleccionado}
                      onChange={handleEstatusChange}
                      label="Filtrar por Estatus"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Por Asignar">Por Asignar</MenuItem>
                      <MenuItem value="Surtiendo">Surtiendo</MenuItem>
                      <MenuItem value="Embarcando">Embarcando</MenuItem>
                      <MenuItem value="Pedido Finalizado">
                        Pedido Finalizado
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}

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
                      {visibleColumns.includes("PARTIDAS") && (
                        <TableCell>PARTIDAS</TableCell>
                      )}
                      {visibleColumns.includes("PIEZAS") && (
                        <TableCell>PIEZAS</TableCell>
                      )}
                      {visibleColumns.includes("TRANSPORTE") && (
                        <TableCell>TRANSPORTE</TableCell>
                      )}
                      {visibleColumns.includes("PAQUETERIA") && (
                        <TableCell>TIPO DE RUTA</TableCell>
                      )}
                      {visibleColumns.includes(
                        "FECHA DE ENTREGA (CLIENTE)"
                      ) && <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>}
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
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        ) //  PAGINACIÓN SIN AFECTAR FILTROS
                        .map((routeData, index) => (
                          <TableRow key={index}>
                            {visibleColumns.includes("NO ORDEN") && (
                              <TableCell>
                                {routeData["NO ORDEN"]} -{" "}
                                {routeData["tipo_original"]}
                              </TableCell>
                            )}

                            <TableCell>
                              {/* Estado del pedido con color */}
                              <Typography
                                variant="body2"
                                style={{ color: routeData.color }}
                              >
                                {routeData.statusText}
                              </Typography>

                              {/* Si el pedido está fusionado, mostrarlo debajo en morado */}
                              {routeData.fusionWith && (
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: "#800080",
                                    fontWeight: "bold",
                                  }}
                                >
                                  ({routeData.fusionWith})
                                </Typography>
                              )}
                            </TableCell>

                            {visibleColumns.includes("FECHA") && (
                              <TableCell>
                                {formatDate(routeData.FECHA)}
                              </TableCell>
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
                                {formatDate(routeData.FECHA_DE_FACTURA)}
                              </TableCell>
                            )}
                            {visibleColumns.includes("PARTIDAS") && (
                              <TableCell>{routeData.PARTIDAS}</TableCell>
                            )}
                            {visibleColumns.includes("PIEZAS") && (
                              <TableCell>{routeData.PIEZAS}</TableCell>
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
                                    <Grid item>
                                      {(user?.role === "Admin" ||
                                        user?.role === "Master" ||
                                        user?.role === "Trans") && (
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
                                      )}
                                    </Grid>

                                    <IconButton
                                      style={{ color: "#1976D2" }} // Azul
                                      onClick={() =>
                                        openDirectaModal(routeData)
                                      }
                                    >
                                      <BorderColorIcon />
                                    </IconButton>
                                  </Grid>

                                  <Grid item>
                                    <IconButton
                                      variant="contained"
                                      style={{ color: "black" }} // Negro con texto blanco
                                      onClick={() =>
                                        generatePDF(
                                          String(routeData["NO ORDEN"]),
                                          String(routeData["tipo_original"])
                                            .toUpperCase()
                                            .trim()
                                        )
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
                <Typography variant="h6">Venta Empleado</Typography>
                <br />

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

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {ordenEstatus.map((estatus) => {
                    const cantidad = conteoEstatus[estatus] || 0;

                    return (
                      <Box
                        key={estatus}
                        sx={{
                          backgroundColor: colorPorEstatus[estatus] || "#ccc",
                          color: "#fff",
                          borderRadius: 2,
                          padding: "6px 12px",
                          fontSize: 14,
                          boxShadow: 1,
                        }}
                      >
                        <strong>{estatus}:</strong> {cantidad}
                      </Box>
                    );
                  })}
                </Box>

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
                      {visibleColumns.includes(
                        "FECHA DE ENTREGA (CLIENTE)"
                      ) && <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>}
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
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        ) //  PAGINACIÓN SIN AFECTAR FILTROS
                        .map((routeData, index) => (
                          <TableRow key={index}>
                            {visibleColumns.includes("NO ORDEN") && (
                              <TableCell>
                                {routeData["NO ORDEN"]} -{" "}
                                {routeData["tipo_original"]}
                              </TableCell>
                            )}
                            <TableCell>
                              {/* Estado del pedido con color */}
                              <Typography
                                variant="body2"
                                style={{ color: routeData.color }}
                              >
                                {routeData.statusText}
                              </Typography>

                              {/* Si el pedido está fusionado, mostrarlo debajo en morado */}
                              {routeData.fusionWith && (
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: "#800080",
                                    fontWeight: "bold",
                                  }}
                                >
                                  ({routeData.fusionWith})
                                </Typography>
                              )}
                            </TableCell>

                            {visibleColumns.includes("FECHA") && (
                              <TableCell>
                                {formatDate(routeData.FECHA)}
                              </TableCell>
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
                                        generatePDF(
                                          String(routeData["NO ORDEN"]),
                                          String(routeData["tipo_original"])
                                            .toUpperCase()
                                            .trim()
                                        )
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
            {tabIndex === 1 &&
              (user?.role === "Admin" ||
                user?.role === "Master" ||
                user?.role === "Trans" ||
                user?.role === "Rep" ||
                user?.role === "Tran",
              "Rep") &&
              subTabIndex === 3 && (
                <TableContainer
                  component={Paper}
                  style={{ marginTop: "20px", padding: "20px" }}
                >
                  <Typography variant="h6">
                    Asignación de transporte / Historico
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
                        {visibleColumns.includes("NUM CLIENTE") && (
                          <TableCell>NUM CLIENTE</TableCell>
                        )}
                        {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                          <TableCell>NOMBRE DEL CLIENTE</TableCell>
                        )}
                        {visibleColumns.includes("NUMERO DE FACTURA") && (
                          <TableCell>NUMERO DE FACTURA</TableCell>
                        )}
                        {visibleColumns.includes("GUIA") && (
                          <TableCell>GUIA</TableCell>
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
                        {visibleColumns.includes("FECHA DE FACTURA") && (
                          <TableCell>FECHA DE FACTURA</TableCell>
                        )}
                        {visibleColumns.includes("FECHA DE EMBARQUE") && (
                          <TableCell>FECHA DE EMBARQUE</TableCell>
                        )}
                        {visibleColumns.includes(
                          "FECHA DE ENTREGA (CLIENTE)"
                        ) && <TableCell>FECHA DE ENTREGA CLIENTE</TableCell>}
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
                              {/* Estado del pedido con color */}
                              <Typography
                                variant="body2"
                                style={{ color: routeData.color }}
                              >
                                {routeData.statusText}
                              </Typography>

                              {/* Si el pedido está fusionado, mostrarlo debajo en morado */}
                              {routeData.fusionWith && (
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: "#800080",
                                    fontWeight: "bold",
                                  }}
                                >
                                  ({routeData.fusionWith})
                                </Typography>
                              )}
                            </TableCell>

                            {visibleColumns.includes("FECHA") && (
                              <TableCell>
                                {formatDate(routeData.FECHA)}
                              </TableCell>
                            )}
                            {visibleColumns.includes("NO ORDEN") && (
                              <TableCell>
                                {routeData["NO ORDEN"]} -{" "}
                                {routeData["tipo_original"]}
                              </TableCell>
                            )}
                            {visibleColumns.includes("NUM CLIENTE") && (
                              <TableCell>{routeData["NUM. CLIENTE"]}</TableCell>
                            )}
                            {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                              <TableCell>
                                {routeData["NOMBRE DEL CLIENTE"]}
                              </TableCell>
                            )}
                            {visibleColumns.includes("NUMERO DE FACTURA") && (
                              <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                            )}
                            {visibleColumns.includes("GUIA") && (
                              <TableCell>{routeData.GUIA}</TableCell>
                            )}
                            {visibleColumns.includes("PAQUETERIA") && (
                              <TableCell>{routeData.PAQUETERIA}</TableCell>
                            )}
                            {visibleColumns.includes("TOTAL") && (
                              <TableCell>
                                {formatCurrency(routeData.TOTAL)}
                              </TableCell>
                            )}

                            {visibleColumns.includes("TOTAL FACTURA LT") && (
                              <TableCell>
                                {routeData.TOTAL_FACTURA_LT &&
                                !isNaN(
                                  parseFloat(
                                    routeData.TOTAL_FACTURA_LT.toString().replace(
                                      /,/g,
                                      ""
                                    )
                                  )
                                )
                                  ? formatCurrency(
                                      parseFloat(
                                        routeData.TOTAL_FACTURA_LT.toString().replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                    )
                                  : "$0.00"}
                              </TableCell>
                            )}

                            {visibleColumns.includes("FECHA DE FACTURA") && (
                              <TableCell>
                                {formatDate(routeData.FECHA_DE_FACTURA)}
                              </TableCell>
                            )}
                            {visibleColumns.includes("FECHA DE EMBARQUE") && (
                              <TableCell>
                                {loading
                                  ? "Cargando..."
                                  : fechasEmbarque[routeData["NO ORDEN"]]
                                  ? formatDate(
                                      fechasEmbarque[routeData["NO ORDEN"]]
                                    )
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
                            {visibleColumns.includes(
                              "DIA EN QUE ESTA EN RUTA"
                            ) && (
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
                                {
                                  routeData.ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA
                                }
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
                                    style={{ color: "black" }} // Negro con texto blanco
                                    onClick={() =>
                                      generatePDF(
                                        String(routeData["NO ORDEN"]),
                                        String(routeData["tipo_original"])
                                          .toUpperCase()
                                          .trim()
                                      )
                                    }
                                  >
                                    <ArticleIcon />
                                  </IconButton>
                                </Grid>

                                {/* <Grid item>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<EmailIcon />}
                                onClick={() => {
                                  if (!routeData.CORREO) {
                                    alert("⚠️ Este pedido no tiene correo.");
                                    return;
                                  }
                                  handleEnviarCorreo(routeData["NO ORDEN"]);
                                }}
                              >
                                Enviar Correo
                              </Button>

                            </Grid> */}
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
        )}

      {/* El Modal para actualizar la guía */}
      <Modal open={directaModalOpen} onClose={closeDirectaModal}>
        <Box
          padding="20px"
          backgroundColor="white"
          margin="50px auto"
          maxWidth="600px"
          textAlign="center"
          borderRadius="8px"
        >
          <Typography variant="h6">Actualizar Guía</Typography>

          <Grid container spacing={2}>
            {/* Fila 1 */}
            {visibleColumns.includes("GUIA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nueva Guía"
                  value={guia}
                  onChange={(e) => setGuia(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}
            {(user?.role === "Admin" ||
              user?.role === "Trans" ||
              user?.role === "Tran") &&
              visibleColumns.includes("NO ORDEN") && (
                <Grid item xs={12} sm={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={tipo || ""}
                      onChange={(e) => setTipo(e.target.value)}
                      label="Tipo"
                    >
                      <MenuItem value="paqueteria">Paquetería</MenuItem>
                      <MenuItem value="directa">Directa</MenuItem>
                      <MenuItem value="venta empleado">Venta Empleado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

            {visibleColumns.includes("TOTAL") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {/* Fila 6 - Agregar los nuevos campos */}
            {visibleColumns.includes("NUMERO DE FACTURA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="No Factura"
                  value={noFactura}
                  onChange={(e) => setNoFactura(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}
            {visibleColumns.includes("FECHA DE FACTURA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Factura"
                  value={fechaFactura || ""}
                  onChange={(e) => setFechaFactura(e.target.value)}
                  variant="outlined"
                  fullWidth
                  type="date"
                />
              </Grid>
            )}

            {visibleColumns.includes("TARIMAS") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tarimas"
                  value={tarimas}
                  onChange={(e) => setTarimas(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {/* Fila 2 */}
            {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  value={paqueteria || ""}
                  onChange={(event, newValue) => {
                    if (newValue && !options.includes(newValue)) {
                      setOptions((prevOptions) => [...prevOptions, newValue]);
                    }
                    setPaqueteria(newValue || "");
                  }}
                  inputValue={paqueteria || ""}
                  onInputChange={(event, newInputValue) => {
                    setPaqueteria(newInputValue || "");
                  }}
                  id="autocomplete-paqueteria"
                  options={options}
                  sx={{ width: "100%" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Paquetería"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}

            {/* Fila 2 */}
            {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha Entrega Cliente"
                  value={fechaEntregaCliente || ""}
                  onChange={(e) => setFechaEntregaCliente(e.target.value)}
                  variant="outlined"
                  fullWidth
                  type="date"
                />
              </Grid>
            )}

            {visibleColumns.includes("DIAS DE ENTREGA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Días de Entrega"
                  value={diasEntrega || ""}
                  variant="outlined"
                  fullWidth
                  disabled // 🔥 Se llena automáticamente con el cálculo
                />
              </Grid>
            )}

            {/* Fila 3 */}
            {visibleColumns.includes(
              "ENTREGA SATISFACTORIA O NO SATISFACTORIA"
            ) && (
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Entrega Satisfactoria</InputLabel>
                  <Select
                    value={entregaSatisfactoria}
                    onChange={(e) => setEntregaSatisfactoria(e.target.value)}
                    label="Entrega Satisfactoria"
                  >
                    <MenuItem value="">Selecciona una opción</MenuItem>
                    <MenuItem value="SATISFACTORIA">SATISFACTORIA</MenuItem>
                    <MenuItem value="NO SATISFACTORIA">
                      NO SATISFACTORIA
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {visibleColumns.includes("MOTIVO") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {visibleColumns.includes("NUMERO DE FACTURA LT") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Factura LT"
                  value={numeroFacturaLT}
                  onChange={(e) => setNumeroFacturaLT(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {/* Fila 4 */}
            {visibleColumns.includes("TOTAL FACTURA LT") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Factura LT"
                  value={totalFacturaLT}
                  onChange={(e) => setTotalFacturaLT(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {visibleColumns.includes("DIFERENCIA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Diferencia"
                  value={diferencia}
                  onChange={(e) => setDiferencia(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {/* 🔹 Observaciones */}
            {visibleColumns.includes("OBSERVACIONES") && (
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}

            {/* Botón para actualizar */}
            <Grid item xs={12}>
              <Button
                onClick={actualizarGuia}
                variant="contained"
                color="primary"
                fullWidth
                style={{ marginTop: "20px" }}
              >
                Actualizar
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                onClick={handleReenrutar}
                variant="contained"
                color="warning"
                fullWidth
              >
                Volver a Reenrutar
              </Button>
            </Grid>

            {/* Botón para cerrar */}
            <Grid item xs={12}>
              <Button
                onClick={closeDirectaModal}
                variant="outlined"
                color="secondary"
                fullWidth
                style={{ marginTop: "10px" }}
              >
                Cancelar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

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
}

export default Transporte;

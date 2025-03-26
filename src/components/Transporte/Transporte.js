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


import axios from "axios";
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Button, Modal, Select, MenuItem, FormControl,
  InputLabel, AppBar, Tabs, Tab, IconButton, Snackbar, Checkbox, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Card, CircularProgress, CardContent, CardActions,

} from "@mui/material";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./logos.jpg";

const hasExpired = (timestamp) => {
  const now = new Date().getTime();
  return now - timestamp > 24 * 60 * 60 * 1000;
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
      .then(() => fetchFusions(filteredData)) // 👈 Llamada a fusión justo después
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
        `http://localhost:3007/api/Trasporte/status`,
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
              statusText:
                statusMap[route["NO ORDEN"]].statusText || route.statusText,
              color: statusMap[route["NO ORDEN"]].color || route.color,
              fusionWith: statusMap[route["NO ORDEN"]].fusionWith || null, // Aquí aseguramos que fusionWith se guarda
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
              fusionWith: statusMap[route["NO ORDEN"]].fusionWith || null, // Aquí aseguramos que fusionWith se guarda
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
              fusionWith: statusMap[route["NO ORDEN"]].fusionWith || null, // Aquí aseguramos que fusionWith se guarda
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
              fusionWith: statusMap[route["NO ORDEN"]].fusionWith || null, // Aquí aseguramos que fusionWith se guarda
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

  //fusion de los pedidos 

  const fetchFusions = async (data) => {
    const orderNumbers = data.map((d) => d["NO ORDEN"]);
    console.log("🔄 Consultando fusión para pedidos:", orderNumbers);

    try {
      const response = await axios.post(
        `http://localhost:3007/api/Trasporte/fusion`,
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
    fetchPaqueteriaRoutes(); // Llama a la API para cargar las rutas de paquetería
  }, []);

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
    DIRECCION: `${row["Calle"] || ""} ${row["Colonia"] || ""} ${row["Municipio"] || ""
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
        if (!uniqueOrders.has(routeData["NO ORDEN"])) {
          uniqueOrders.add(routeData["NO ORDEN"]);
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

  const fetchPaqueteriaRoutes = async () => {
    try {
      // console.time("Tiempo de carga de rutas");

      const response = await fetch(
        "http://localhost:3007/api/Trasporte/rutas"
      );
      const data = await response.json();

      console.timeEnd("Tiempo de carga de rutas");

      // console.log("✅ Datos recibidos desde la API:", data);

      if (Array.isArray(data) && data.length > 0) {
        console.time("Tiempo de enriquecimiento de datos");

        setSentRoutesData(data); // Guarda directamente los datos en el estado

        console.timeEnd("Tiempo de enriquecimiento de datos");
        console.log("✅ Estado actualizado con las rutas:", data);
      } else {
        console.warn("⚠ No se encontraron rutas de paquetería");
      }
    } catch (error) {
      console.error("Error al obtener las rutas de paquetería:", error.message);
    }
  };

  useEffect(() => {
    // console.log("🔍 sentRoutesData antes de filtrar:", sentRoutesData);

    if (!Array.isArray(sentRoutesData) || sentRoutesData.length === 0) {
      console.warn(
        "⚠ No hay datos en sentRoutesData, las tablas estarán vacías"
      );
      return;
    }

    const paqueteria = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "paqueteria"
    );
    const directa = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "directa"
    );
    const ventaEmpleado = sentRoutesData.filter(
      (routeData) => routeData.TIPO?.trim().toLowerCase() === "venta empleado"
    );

    // console.log("✅ Datos filtrados para paquetería:", paqueteria);
    // console.log("✅ Datos filtrados para directa:", directa);
    // console.log("✅ Datos filtrados para venta empleado:", ventaEmpleado);

    setPaqueteriaData(paqueteria);
    setDirectaData(directa);
    setVentaEmpleadoData(ventaEmpleado);
  }, [sentRoutesData]);

  useEffect(() => {
    console.log("🔄 Cambio de pestaña activa:", subTabIndex);
  }, [subTabIndex]);

  const fetchAdditionalData = async (noOrden) => {
    try {
      const url = `http://localhost:3007/api/Trasporte/pedido/detalles/${noOrden}`; // Usamos el parámetro en la URL
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
        "http://localhost:3007/api/Trasporte/clientes/observaciones",
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
            });
          });
        } else {
          console.warn(`⚠ Ruta ${route} no tiene datos o filas definidas.`);
        }
      });

      try {
        const response = await fetch(
          "http://localhost:3007/api/Trasporte/insertarRutas",
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
    if (!dateString) return "Sin fecha"; // Si no hay fecha, muestra "Sin fecha"

    const date = new Date(dateString); // Convierte el string de fecha a un objeto Date
    if (isNaN(date)) {
      return "Fecha inválida"; // Si no se puede convertir a fecha, devuelve 'Fecha inválida'
    }

    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return date.toLocaleDateString("es-MX", options); // Devuelve la fecha formateada en formato local
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
      const url = `http://localhost:3007/api/Trasporte/paqueteria/actualizar-guia/${selectedNoOrden}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guia,
          paqueteria,
          transporte: paqueteria, // 🔹 Se actualiza TRANSPORTE con el mismo valor de PAQUETERIA
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
        }),
      });

      if (response.ok) {
        alert("✅ Informacion Actualilzada ");

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
        role: [
          "Admin",
          "Master",
          "Trans",
          "PQ1",
          "Paquet",
          "Embar",
          "Rep",
          "Tran",
          "Rep",
        ],
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

      return row["TIPO"].toLowerCase() === "directa" && rowDate === today;
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

  const generatePDF = async (pedido) => {
    try {
      // Paso 1: Obtener datos de la API de rutas
      const responseRoutes = await fetch(
        "http://localhost:3007/api/Trasporte/rutas"
      );

      const routesData = await responseRoutes.json();

      if (!Array.isArray(routesData) || routesData.length === 0) {
        alert("No se encontraron rutas de paquetería");
        return;
      }

      // Paso 2: Buscar la ruta que corresponde al pedido
      const route = routesData.find((route) => route["NO ORDEN"] === pedido);
      if (!route) {
        alert("No se encontró la ruta para este pedido.");
        return;
      }

      // Obtener los datos de la ruta (Cliente, Dirección, Factura)
      const nombreCliente = route["NOMBRE DEL CLIENTE"] || "No disponible";
      const numeroFactura = route["NO_FACTURA"] || "No disponible";
      const direccion = cleanAddress(route["DIRECCION"]) || "No disponible";
      const numero = route["NUM. CLIENTE"] || "No disponible";

      const telefono = route["TELEFONO"] || "Sin numero de Contacto";

      const responseEmbarque = await fetch(
        `http://localhost:3007/api/Trasporte/embarque/${pedido}`
      );
      const data = await responseEmbarque.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert("No hay productos disponibles para este pedido.");
        return;
      }

      const productosConCaja = data.filter(
        (item) => item.caja && item.caja > 0
      );

      const productosSinCaja = data.filter(
        (item) => !item.caja || item.caja === 0
      );

      // Crear instancia de jsPDF
      const doc = new jsPDF();

      // Ajustar logo para que quede a la izquierda, sin sobrepasar el texto
      doc.addImage(logo, "JPEG", 140, 5, 65, 25); // Mueve el logo más a la derecha y ajusta tamaño

      // Definir márgenes y tamaños de fuente
      const marginLeft = 15;
      const marginTop = 20;
      let currentY = marginTop;

      // Encabezado con formato formal
      doc.setFont("times", "normal"); // Fuente Arial sin negritas
      doc.setFontSize(10); // Aumenta tamaño a 12

      doc.text("SANTUL HERRAMIENTAS S.A. DE C.V.", marginLeft, currentY);
      currentY += 6;

      doc.text(`VT: ${pedido}`, marginLeft, currentY);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 50, currentY); // Mueve la fecha a la derecha
      currentY += 7;

      doc.text(
        `Cliente: ${nombreCliente} Núm. Cliente: ${numero} Núm. Teléfono: ${telefono}`,
        marginLeft,
        currentY
      );
      currentY += 7; // Baja el cursor para separar

      doc.text(
        `No Factura: ${numeroFactura} Dirección: ${direccion} `,
        marginLeft,
        currentY
      );
      currentY += 8;
      // Definir título del recuadro
      const titulo = "INSTRUCCIONES DE ENTREGA";

      // Definir las instrucciones con el texto proporcionado
      const instruccionesIzquierda =
        "En caso de detectar cualquier irregularidad (daños, faltantes, o manipulaciones),";
      const instruccionesDerecha =
        "Favor de comunicarse de inmediato al departamento de atención al cliente al número: 123-456-7890.\nAgradecemos su confianza y preferencia.";

      // Posiciones y dimensiones
      const cajaX = marginLeft;
      const cajaY = currentY;
      const cajaAncho = 180;
      const padding = 6;
      const columnaAncho = cajaAncho / 2 - 10; // Ajuste para que el texto no se salga

      // Calcular altura del cuadro en base al texto
      doc.setFont("times", "normal");
      doc.setFontSize(9.5);

      const lineasIzquierda = doc.splitTextToSize(
        instruccionesIzquierda,
        columnaAncho
      );

      const lineasDerecha = doc.splitTextToSize(
        instruccionesDerecha,
        columnaAncho
      );

      const lineasTotales = Math.max(
        lineasIzquierda.length,
        lineasDerecha.length
      );

      const cajaAlto = lineasTotales * 5 + padding; // Ajustar altura con espaciado extra

      // Dibujar el borde del recuadro
      doc.rect(cajaX, cajaY, cajaAncho, cajaAlto, "S");

      // Dibujar el fondo gris para el título
      doc.setFillColor(200, 200, 200); // Gris claro
      doc.rect(cajaX, cajaY, cajaAncho, 8, "F"); // Fondo del título

      // Agregar el título centrado
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        titulo,
        cajaX + cajaAncho / 2 - doc.getTextWidth(titulo) / 2,
        cajaY + 5.5
      );

      // Agregar el contenido en dos columnas
      doc.setFont("times", "normal");
      doc.setFontSize(9.5); // Tamaño correcto
      doc.setTextColor(0, 0, 0);

      doc.text(lineasIzquierda, cajaX + 5, cajaY + 13);
      doc.text(lineasDerecha, cajaX + columnaAncho + 15, cajaY + 13);

      // Ajustar la posición después del recuadro
      currentY += cajaAlto + 5;

      currentY += 10; // Agrega más espacio antes de la tabla

      // Agrupación de productos y tablas sigue igual
      const cajasAgrupadas = productosConCaja.reduce((groups, item) => {
        if (!groups[item.caja]) {
          groups[item.caja] = [];
        }
        groups[item.caja].push(item);
        return groups;
      }, {});

      let totalPZ = 0;
      let totalINNER_MASTER = 0;
      let totalProductos = 0;
      let totalTarimas = 0;
      let totalAtados = 0;

      productosConCaja.forEach((item) => {
        totalPZ += item._pz || 0;
        totalINNER_MASTER += (item._inner || 0) + (item._master || 0);
        totalProductos += item.cantidad || 0;
        totalTarimas += item.tarimas || 0;
        totalAtados += item.atados || 0;
      });

      productosSinCaja.forEach((item) => {
        totalPZ += item._pz || 0;
        totalINNER_MASTER += (item._inner || 0) + (item._master || 0);
        totalProductos += item.cantidad || 0;
        totalTarimas += item.tarimas || 0;
        totalAtados += item.atados || 0;
      });

      const ultimasCajas = Object.keys(cajasAgrupadas).sort((a, b) => a - b);
      const totalCajasArmadas =
        parseInt(ultimasCajas[ultimasCajas.length - 1]) || 0;
      const totalCajas = totalINNER_MASTER + totalCajasArmadas;

      // Insertar los totales en una tabla
      doc.autoTable({
        startY: currentY,
        head: [
          ["INNER/MASTER", "Tarimas", "Atados", "Cajas Armadas", "Total Cajas"],
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
        styles: {
          halign: "center",
          fontSize: 10,
          cellPadding: 3,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fontStyle: "time",
          textColor: [0, 0, 0], // Texto negro
          fillColor: [240, 240, 240], // Fondo gris claro para cabecera
          lineColor: [0, 0, 0], // Bordes negros
          lineWidth: 0.5,
        },
        margin: { left: 10 },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // Mostrar las cajas agrupadas
      Object.keys(cajasAgrupadas).forEach((caja) => {
        const productosDeCaja = cajasAgrupadas[caja];

        doc.autoTable({
          startY: currentY,
          head: [[`Productos en la Caja ${caja}`]],
          body: [],
          theme: "grid",
          styles: {
            halign: "center",
            fontSize: 10,
            cellPadding: 3,
            lineColor: [0, 0, 0],
          },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5,
          },
        });
        currentY = doc.lastAutoTable.finalY + 10;

        doc.autoTable({
          startY: currentY,
          head: [
            [
              "Sku",
              "Descripción",
              "Cantidad",
              "UM",
              "PZ",
              "PQ",
              "INNER",
              "MASTER",
              "Tarimas",
              "Atados",
              "Validar",
            ],
          ],
          body: productosDeCaja.map((item) => [
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
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            halign: "center",
            cellPadding: 2,
            lineColor: [0, 0, 0],
          },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5,
          },
          bodyStyles: { halign: "center" },
        });
        currentY = doc.lastAutoTable.finalY + 10;
      });

      // Mostrar productos sin caja (igual)
      if (productosSinCaja.length > 0) {
        doc.autoTable({
          startY: currentY,
          head: [["Productos sin caja"]],
          body: [],
          theme: "grid",
          styles: {
            halign: "center",
            fontSize: 10,
            cellPadding: 1,
            lineColor: [0, 0, 0],
          },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5,
          },
        });

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 10,
          head: [
            [
              "Sku",
              "Descripción",
              "Cantidad",
              "UM",
              "Piezas",
              "INNER",
              "MASTER",
              "Tarimas",
              "Atados",
              "Validar",
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
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            halign: "center",
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
          },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5,
          },
          bodyStyles: { halign: "center" },
        });
        currentY = doc.lastAutoTable.finalY + 10;
      } else {
        doc.text("No hay productos sin cajas.", marginLeft, currentY);
        currentY += 10;
      }

      // Obtener la altura de la página
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 30; // Margen inferior deseado

      // Verificar si hay espacio suficiente antes de agregar las firmas y referencias bancarias
      if (currentY + 60 > pageHeight - marginBottom) {
        doc.addPage(); // Si no hay espacio suficiente, agregar una nueva página
        currentY = 20; // Reiniciar la posición Y en la nueva página
      }

      // 📌 Agregar las firmas
      const firmaY = currentY + 30;
      const linea1InicioX = 20;
      const linea1FinalX = 80;
      doc.line(linea1InicioX, firmaY - 5, linea1FinalX, firmaY - 5);
      const textoFirmaCliente = "Firma del Cliente";
      const textoFirmaClienteX =
        (linea1InicioX + linea1FinalX) / 2 -
        doc.getTextWidth(textoFirmaCliente) / 2;
      doc.text(textoFirmaCliente, textoFirmaClienteX, firmaY);

      const linea2InicioX = 120;
      const linea2FinalX = 180;
      doc.line(linea2InicioX, firmaY - 5, linea2FinalX, firmaY - 5);
      const textoFirmaTransportista = "Firma del Transportista";
      const textoFirmaTransportistaX =
        (linea2InicioX + linea2FinalX) / 2 -
        doc.getTextWidth(textoFirmaTransportista) / 2;
      doc.text(textoFirmaTransportista, textoFirmaTransportistaX, firmaY);

      currentY += 50; // Mover la posición para la referencia bancaria

      // 📌 Si no hay espacio para la referencia bancaria, agregar nueva página
      if (currentY + 40 > pageHeight - marginBottom) {
        doc.addPage();
        currentY = 20; // Reiniciar Y en la nueva página
      }

      // 📌 Agregar la referencia bancaria
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("REFERENCIA BANCARIA:", marginLeft, currentY);
      currentY += 6; // Espacio para los datos bancarios

      const cuentas = [
        [
          "BANAMEX",
          "Cuenta: 6860432",
          "Sucursal: 7006",
          "Clabe: 00218070068604325",
        ],
        [
          "BANORTE",
          "Cuenta: 0890771176",
          "Sucursal: 04",
          "Clabe: 072180008907711766",
        ],
        [
          "BANCOMER",
          "Cuenta: 0194242696",
          "Sucursal: 1838",
          "Clabe: 012580001942426961",
        ],
      ];

      // 📌 Dibujar la referencia bancaria en columnas
      cuentas.forEach((banco, index) => {
        const startX = marginLeft + index * 65;
        doc.text(banco[0], startX, currentY);
        doc.text(banco[1], startX, currentY + 5);
        doc.text(banco[2], startX, currentY + 10);
        doc.text(banco[3], startX, currentY + 15);
      });

      currentY += 25; // Espacio final

      // Guardar el PDF
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

    setFechaEntregaCliente(
      data["FECHA_DE_ENTREGA (CLIENTE)"]
        ? new Date(data["FECHA_DE_ENTREGA (CLIENTE)"])
          .toISOString()
          .split("T")[0]
        : ""
    );

    setFechaFactura(
      data.FECHA_DE_FACTURA
        ? new Date(data.FECHA_DE_FACTURA).toISOString().split("T")[0]
        : ""
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

  const closeDirectaModal = () => {
    setDirectaModalOpen(false);
    setSelectedDirectaData(null);
  };

  const fetchTransportistas = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3007/api/Trasporte/transportistas"
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
        "http://localhost:3007/api/Trasporte/transportistas/empresas"
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
        "http://localhost:3007/api/Trasporte/insertar-visita",
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
        `http://localhost:3007/api/Trasporte/ruta/eliminar/${noOrden}`
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
        "http://localhost:3007/api/Trasporte/historico"
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
        "http://localhost:3007/api/Trasporte/historico",
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
        "http://localhost:3007/api/Trasporte/historico_clientes"
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
        "http://localhost:3007/api/Trasporte/historico_columnas"
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
      if (item.TIPO?.toLowerCase() !== "paqueteria" && item.TIPO?.toLowerCase() !== "directa") {
        return false;
      }

      const cumpleGeneral =
        !filtroGeneralAsignacion ||
        item["NO ORDEN"]?.toString().includes(filtroGeneralAsignacion) ||
        item["NUM. CLIENTE"]?.toString().includes(filtroGeneralAsignacion) ||
        item["NOMBRE DEL CLIENTE"]?.toLowerCase().includes(filtroGeneralAsignacion.toLowerCase());

      const cumpleEstado =
        !filtroEstadoAsignacion ||
        item.ESTADO?.toLowerCase().includes(filtroEstadoAsignacion.toLowerCase());

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
  const [filtroEstado, setFiltroEstado] = useState("");   // separado


  const toggleMostrarSinGuia = () => {
    setMostrarSinGuia((prev) => !prev);
  };

  const paqueteriaFiltrada = useMemo(() => {
    return paqueteriaData.filter((routeData) => {
      const coincideGeneral =
        !filtroGeneral ||
        routeData["NO ORDEN"]?.toString().includes(filtroGeneral) ||
        routeData["NUM. CLIENTE"]?.toString().toLowerCase().includes(filtroGeneral.toLowerCase());

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

      return coincideGeneral && coincideEstado && coincidePaqueteria && coincideEstatus && coincideGuia;
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
        item["NUM. CLIENTE"]?.toLowerCase().includes(filtroGeneral.toLowerCase()) ||
        item["NO ORDEN"]?.toString().includes(filtroGeneral);

      const cumpleEstado =
        !filtroEstado || item.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

      const cumpleEstatus =
        !estatusSeleccionado || item.statusText === estatusSeleccionado;

      const cumpleFechaEntrega =
        !fechaEntregaSeleccionada || item.FECHA_DE_ENTREGA_CLIENTE === fechaEntregaSeleccionada;

      return cumpleGeneral && cumpleEstado && cumpleEstatus && cumpleFechaEntrega;
    });
  }, [filtroGeneral, filtroEstado, directaData, estatusSeleccionado, fechaEntregaSeleccionada]);



  const ventaEmpleadoFiltrada = useMemo(() => {
    return ventaEmpleadoData.filter((item) => {
      const cumpleGeneral =
        !filtroGeneral ||
        item["NUM. CLIENTE"]?.toLowerCase().includes(filtroGeneral.toLowerCase()) ||
        item["NO ORDEN"]?.toString().includes(filtroGeneral);

      const cumpleEstado =
        !filtroEstado || item.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

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
        `http://localhost:3007/api/Trasporte/pedido/ultimas-fechas-embarque?pedidos=${noOrdenes.join(
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
        "http://localhost:3007/api/Trasporte/subir-excel",
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


  const buscarPedidosPorGuia = async () => {
    try {
      if (!guia) {
        alert("⚠ Debes ingresar un número de guía.");
        return;
      }

      const response = await fetch(
        `http://localhost:3007/api/Trasporte/rutas?guia=${guia}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setPedidos(data);

        // ✅ Calcular la suma total de los pedidos de inmediato
        const sumaTotal = data.reduce((sum, pedido) => {
          const totalLimpio = parseFloat(
            String(pedido.TOTAL).replace(/[^0-9.-]+/g, "")
          );
          return sum + (isNaN(totalLimpio) ? 0 : totalLimpio);
        }, 0);

        setSumaTotalPedidos(sumaTotal);
        // También puedes limpiar el % de relación si no hay Factura LT aún
        if (totalFacturaLT > 0) {
          const relacion = (sumaTotal / totalFacturaLT) * 100;
          setPorcentajeRelacion(relacion);
        } else {
          setPorcentajeRelacion(0);
        }

      } else {
        alert("⚠ No se encontraron pedidos para esta guía.");
        setPedidos([]);
        setSumaTotalPedidos(0); // Reiniciar si no hay datos
        setPorcentajeRelacion(0);
      }
    } catch (error) {
      console.error("❌ Error al buscar pedidos:", error);
      alert("Hubo un error al buscar los pedidos.");
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
      const totalPedido = parseFloat(String(pedido.TOTAL).replace(/[^0-9.-]+/g, "")) || 0;

      // Calcular el porcentaje prorrateado del total
      const porcentaje = sumaTotal > 0 ? totalPedido / sumaTotal : 0;

      // Calcular el valor proporcional para el prorrateo
      const prorrateoFacturaLT = porcentaje * value;

      // Calcular valores iniciales (sin gastos)
      const sumaFlete = prorrateoFacturaLT; // Se duplica solo si no hay gastos luego
      const porcentajePaqueteria = totalPedido > 0 ? (prorrateoFacturaLT / totalPedido) * 100 : 0;

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
    const totalPedido = parseFloat(String(pedido.TOTAL).replace(/[^0-9.-]+/g, "")) || 0;

    pedido.gastosExtras = gastosExtras;

    // Calcular suma flete
    const sumaFlete = gastosExtras > 0 ? prorrateo + gastosExtras : prorrateo;
    pedido.sumaFlete = sumaFlete.toFixed(2);

    // % Envío = prorrateo / total pedido
    const porcentajeEnvio = totalPedido > 0 ? (prorrateo / totalPedido) * 100 : 0;
    pedido.porcentajeEnvio = porcentajeEnvio.toFixed(2) + " %";

    // % Global = (suma flete + gastos) / total pedido
    const porcentajeGlobal = totalPedido > 0 ? (sumaFlete / totalPedido) * 100 : 0;
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
        porcentajeEnvio: parseFloat(
          typeof pedido.porcentajeEnvio === "string"
            ? pedido.porcentajeEnvio.replace(" %", "")
            : pedido.porcentajeEnvio
        ) || 0,
        porcentajePaqueteria: parseFloat(
          typeof pedido.porcentajePaqueteria === "string"
            ? pedido.porcentajePaqueteria.replace(" %", "")
            : pedido.porcentajePaqueteria
        ) || 0,
        porcentajeGlobal: parseFloat(
          typeof pedido.porcentajeGlobal === "string"
            ? pedido.porcentajeGlobal.replace(" %", "")
            : pedido.porcentajeGlobal
        ) || 0,
      })),
    };



    console.log("📤 Enviando datos a la API:", datosAGuardar);

    try {
      const response = await fetch(
        `http://localhost:3007/api/Trasporte/actualizar-por-guia/${guia}`,
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

  const [sumaTotalPedidos, setSumaTotalPedidos] = useState(0);
  const [porcentajeRelacion, setPorcentajeRelacion] = useState(0);


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
            "http://localhost:3007/api/Trasporte/rutas",
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
            fecha_emision: pedido["FECHA"],
            observaciones: pedido["OBSERVACIONES"] || "Sin observaciones",
          };

          console.log("📤 Enviando pedido a la API:", mappedPedido);

          try {
            const response = await axios.post(
              "http://localhost:3007/api/Trasporte/rutas/pedidos",
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

  const getTotalRuta = (ruta) => {
    if (!ruta?.pedidos || ruta.pedidos.length === 0) return 0;
    return ruta.pedidos.reduce((acc, pedido) => acc + (Number(pedido.total) || 0), 0);
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
        "http://localhost:3007/api/Trasporte/Rutasconpedido"
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

  const openPedidosDeBDModal = (ruta) => {
    setSelectedRuta(ruta);
  };

  const closePedidosDeBDModal = () => {
    setSelectedRuta(null);
  };

  //calculo del dia

  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const fetchResumenDelDia = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3007/api/Trasporte/resumen-dia"
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

      if (direccion === 'arriba' && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      }

      if (direccion === 'abajo' && index < items.length - 1) {
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




  return (
    <Paper elevation={3} style={{ padding: "20px" }}>
      {/* Pestañas */}
      <AppBar
        position="static"
        sx={{ backgroundColor: "white", boxShadow: "none" }}>

        <Tabs
          value={tabIndex}
          onChange={handleChangeTab}
          textColor="primary"
          indicatorColor="primary"
          centered>

          <Tab label="OVR y Rutas" />
          <Tab label="Embarques" />

        </Tabs>

      </AppBar>

      {/* Primer Tab: Mostrar rutas y detalles */}
      {tabIndex === 0 && (user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans" || user?.role === "Control") && (
        <Box marginTop={2}>
          <Typography variant="h5">Cargar Archivo Excel</Typography>

          <Box marginTop={2} display="flex" alignItems="center" gap={2}>
            <label htmlFor="file-upload">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />

              <Button
                variant="contained"
                component="span"
                color="primary"
                sx={{
                  textTransform: "none",
                  backgroundColor: "#1976D2",
                  "&:hover": {
                    backgroundColor: "#135BA1",
                  },
                }}
              >
                📂 Subir Archivo
              </Button>
            </label>

            <Button
              onClick={clearLocalStorage}
              variant="contained"
              color="secondary"
            >
              Limpiar Datos
            </Button>

            <Autocomplete
              freeSolo
              value={newRoute}
              onChange={(event, newValue) => {
                if (newValue && !options.includes(newValue)) {
                  setOptions((prevOptions) => [...prevOptions, newValue]); // Agregar nueva ruta si no existe
                }
                setNewRoute(newValue); // Guardar la selección o nueva ruta
              }}
              inputValue={newRoute}
              onInputChange={(event, newInputValue) => {
                setNewRoute(newInputValue); // Permitir escritura manual
              }}
              id="autocomplete-routes"
              options={options}
              sx={{ width: 300, marginRight: "10px" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nueva Ruta"
                  variant="outlined"
                />
              )}
            />

            <Button
              onClick={addRoute}
              variant="contained"
              sx={{
                backgroundColor: "#FF9800", // Color de fondo personalizado (naranja)
                color: "white", // Color del texto
                "&:hover": {
                  backgroundColor: "#FB8C00", // Color de fondo cuando el cursor está encima (naranja oscuro)
                },
              }}
            >
              Agregar Ruta
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setTipoRuta("paqueteria"); // Establecer el tipo de ruta como "paquetería"
                setConfirmSendModalOpen(true); // Abrir el modal
                handleGenerateRoutes();
              }}
              style={{
                backgroundColor:
                  tipoRuta === "paqueteria" ? "#1976D2" : "#E3F2FD",
                color: tipoRuta === "paqueteria" ? "white" : "black",
              }}
            >
              Paquetería
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setTipoRuta("Directa"); // Establecer el tipo de ruta como "ruta1"
                setConfirmSendModalOpen(true); // Abrir el modal
                handleGenerateRoutes();
              }}
              style={{
                backgroundColor:
                  tipoRuta === "Directa" ? "#FF5722" : "#FFCCBC",
                color: tipoRuta === "ruta1" ? "white" : "black",
              }}
            >
              Directa
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setTipoRuta("venta empleado"); // Establecer el tipo de ruta como "venta empleado"
                setConfirmSendModalOpen(true); // Abrir el modal
                handleGenerateRoutes();
              }}
              style={{
                backgroundColor:
                  tipoRuta === "venta empleado" ? "#4CAF50" : "#C8E6C9",
                color: tipoRuta === "venta empleado" ? "white" : "black",
              }}
            >
              Venta Empleado
            </Button>

            <Button
              onClick={syncRoutesToDB}
              variant="contained"
              sx={{
                backgroundColor: "#1976D2",
                color: "white",
                "&:hover": { backgroundColor: "#1565C0" },
                marginTop: "10px",
              }}
              disabled={loadingSync} // 🔹 Deshabilita si está sincronizando
            >
              {loadingSync ? "Sincronizando..." : "Sincronizar Rutas"}
            </Button>

            {/* Botón para abrir el modal */}
            {user?.role === "Admin" || user?.role === "Master" ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenHistoricoModal}
              >
                Histórico 2024
              </Button>
            ) : null}

            <Dialog
              open={historicoModalOpen}
              onClose={handleCloseHistoricoModal}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Histórico 2024</DialogTitle>
              <DialogContent>
                {/* Selección de Cliente */}
                <FormControl fullWidth>
                  <InputLabel>Selecciona un Cliente</InputLabel>

                  {/* 🔍 Input para buscar clientes */}
                  <TextField
                    label="Buscar Cliente"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* 📋 Selector con paginación */}
                  <Select
                    value={selectedCliente}
                    onChange={(event) =>
                      setSelectedCliente(event.target.value)
                    }
                    displayEmpty
                  >
                    {filteredClientes
                      .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                      .map((cliente) => (
                        <MenuItem
                          key={cliente.noCliente}
                          value={cliente.noCliente}
                        >
                          {cliente.noCliente} - {cliente.nombreCliente}
                        </MenuItem>
                      ))}
                  </Select>

                  {/* 📌 Paginación de 10 en 10 */}
                  <TablePagination
                    component="div"
                    count={filteredClientes.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPageOptions={[10]}
                  />
                </FormControl>

                {/* Selección de Columnas */}
                <FormControl fullWidth margin="dense">
                  <InputLabel>Selecciona Columnas</InputLabel>
                  <Select
                    multiple
                    value={selectedColumns}
                    onChange={(event) =>
                      setSelectedColumns(event.target.value)
                    }
                    onClose={() =>
                      console.log("Selector de columnas cerrado")
                    }
                    renderValue={(selected) =>
                      selected.length
                        ? selected.join(", ")
                        : "Selecciona columnas"
                    }
                  >
                    {columnasDisponibles.map((col) => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selector de Mes (solo si "FECHA" está seleccionada) */}
                {selectedColumns.includes("FECHA") && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Selecciona un Mes</InputLabel>
                    <Select
                      value={selectedMonth}
                      onChange={(event) =>
                        setSelectedMonth(event.target.value)
                      }
                    >
                      {meses.map((mes) => (
                        <MenuItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Botones de Acción */}
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFetchHistoricoData}
                  >
                    Buscar
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={resetFilters}
                  >
                    Reiniciar
                  </Button>
                </div>

                {/* Tabla de Datos */}
                <TableContainer
                  component={Paper}
                  style={{ marginTop: "20px" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        {selectedColumns.map((col) => (
                          <TableCell key={col}>{col}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historicoData.map((row, index) => (
                        <TableRow key={index}>
                          {selectedColumns.map((col) => (
                            <TableCell key={col}>{row[col]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>

              {/* Acciones del Modal */}
              <DialogActions>
                <Button onClick={handleCloseHistoricoModal} color="secondary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>

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
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            />
          </Box>

          {(user?.role === "Admin" || user?.role === "Control") && (
            <Box>
              <Grid container spacing={2} wrap="nowrap">
                {/* Modal para ver las rutas ya creadas */}
                <Typography variant="h6" gutterBottom>
                  Rutas Disponibles
                </Typography>

                <Grid container spacing={2}>
                  {rutasConPedidos.length > 0 ? (
                    rutasConPedidos.map((ruta) => {
                      const totalRuta = ruta.pedidos?.reduce((acc, pedido) => acc + pedido.total, 0) || 0; // Calcula el total de la ruta
                      return (
                        <Grid item key={ruta.id} xs={12} sm={6} md={4}>
                          <Card sx={{ bgcolor: "#f5f5f5", borderRadius: "8px", p: 2 }}>
                            <CardContent>
                              <Typography variant="h6" textAlign="center">
                                {ruta.nombre}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Pedidos: {ruta.pedidos ? ruta.pedidos.length : 0}
                              </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: "center" }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSelectedRuta(ruta)}
                              >
                                Ver Pedidos
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })
                  ) : (
                    <Typography>No hay rutas disponibles.</Typography>
                  )}
                </Grid>

                {/* Modal para mostrar pedidos de la ruta seleccionada */}
                <Modal open={!!selectedRuta} onClose={() => setSelectedRuta(null)}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "80%",
                      maxHeight: "80vh",
                      overflowY: "auto",
                      bgcolor: "white",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: "12px",
                    }}
                  >
                    {/* ✅ Muestra correctamente el total al lado del nombre */}
                    <Typography variant="h6" gutterBottom>
                      Pedidos de la Ruta: {selectedRuta?.nombre} - {formatCurrency(getTotalRuta(selectedRuta))}
                    </Typography>

                    {selectedRuta?.pedidos?.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>No. Orden</TableCell>
                              <TableCell>Cliente</TableCell>
                              <TableCell>Municipio</TableCell>
                              <TableCell>Estado</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Partidas</TableCell>
                              <TableCell>Piezas</TableCell>
                              <TableCell>Fecha Emisión</TableCell>
                              <TableCell>Observaciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedRuta?.pedidos?.map((pedido) => (
                              <TableRow key={pedido.id}>
                                <TableCell>{pedido.no_orden}</TableCell>
                                <TableCell>{pedido.nombre_cliente}</TableCell>
                                <TableCell>{pedido.municipio}</TableCell>
                                <TableCell>{pedido.estado}</TableCell>
                                {/* ✅ Asegura que el total de cada pedido esté bien formateado */}
                                <TableCell>{formatCurrency(Number(pedido.total) || 0)}</TableCell>
                                <TableCell>{pedido.partidas}</TableCell>
                                <TableCell>{pedido.piezas}</TableCell>
                                <TableCell>{pedido.fecha_emision}</TableCell>
                                <TableCell>{pedido.observaciones}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="textSecondary">No hay pedidos en esta ruta.</Typography>
                    )}
                  </Box>
                </Modal>
              </Grid>
            </Box>
          )}


          <center>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Contenedor de la tabla */}
              <div
                id="data-to-capture"
                style={{
                  padding: "10px",
                  maxWidth: "600px",
                  fontSize: "14px",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    borderColor: "black",
                    borderRadius: "1px",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#FFEB3B" }}>
                      <th
                        style={{
                          padding: "6px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        CLIENTES
                      </th>
                      <th
                        style={{
                          padding: "6px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        PEDIDOS
                      </th>
                      <th
                        style={{
                          padding: "6px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px", textAlign: "center" }}>
                        {resumen ? resumen.totalClientes : "Cargando..."}
                      </td>
                      <td style={{ padding: "6px", textAlign: "center" }}>
                        {resumen ? resumen.totalPedidos : "Cargando..."}
                      </td>
                      <td style={{ padding: "6px", textAlign: "center" }}>
                        {resumen
                          ? formatCurrency(resumen.totalGeneral)
                          : "Cargando..."}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Contenedor de los botones al lado derecho */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  marginLeft: "10px",
                }}
              >
                {/* Botón para limpiar localStorage */}
                <IconButton
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    localStorage.removeItem("totalClientes");
                    localStorage.removeItem("totalPedidos");
                    localStorage.removeItem("totalGeneral");
                    setResumen({
                      totalClientes: 0,
                      totalPedidos: 0,
                      totalGeneral: 0,
                    });
                  }}
                >
                  🗑️
                </IconButton>

                {/* Botón para descargar */}
                <IconButton
                  style={{
                    backgroundColor: "#1976D2",
                    color: "white",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    // Aquí debe ir tu función exportToImage
                  }}
                >
                  ⬇️
                </IconButton>
              </div>
            </div>
          </center>



          {Object.keys(groupedData).length <= MAX_VISIBLE_ROUTES ? (
            <Box
              sx={{
                display: "flex",
                overflowX: "auto", // Habilita el desplazamiento horizontal
                whiteSpace: "nowrap", // Evita que los elementos salten de línea
                padding: "10px",
                gap: "10px", // Espaciado entre tarjetas
                maxWidth: "100%", // Ocupa el ancho de la pantalla
              }}
            >
              {Object.keys(groupedData).map((route) => {
                const totals = calculateTotals(route);
                const pedidosOrdenes = groupedData[route].rows.map((pedido) => pedido["NO ORDEN"]).join(", ");

                return (
                  <Tooltip
                    key={route}
                    title={
                      <Typography sx={{ fontSize: "16px", fontWeight: "bold", p: 1 }}>
                        Órdenes: {pedidosOrdenes.length > 0 ? pedidosOrdenes : "Sin pedidos"}
                      </Typography>
                    }
                    arrow
                    sx={{
                      "& .MuiTooltip-tooltip": {
                        fontSize: "16px",
                        maxWidth: "300px", // Ajusta el ancho máximo del tooltip
                        backgroundColor: "#333", // Color de fondo más visible
                        color: "white", // Texto en blanco
                        padding: "10px", // Más espacio interno
                      },
                    }}
                  >

                    <Box
                      sx={{
                        minWidth: "200px",
                        maxWidth: "200px",
                        textAlign: "center",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        backgroundColor: "#fff",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                        position: "relative", // Necesario para la posición del botón de cerrar
                        cursor: "pointer", // Hace que parezca interactivo
                      }}
                    >
                      {/* Botón para eliminar ruta */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRoute(route)}
                        sx={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                        }}
                      >
                        <CloseIcon />
                      </IconButton>

                      <Checkbox
                        checked={selectedRoutes.includes(route)}
                        onChange={() => handleSelectRoute(route)}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Ruta: {route}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total:</strong> {formatCurrency(totals.TOTAL)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Partidas:</strong> {totals.PARTIDAS}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Piezas:</strong> {totals.PIEZAS}
                      </Typography>
                      <Button
                        onClick={() => openModal(route)}
                        size="small"
                        color="primary"
                      >
                        Ver Detalles
                      </Button>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ) : (
            <FormControl fullWidth style={{ marginTop: "20px" }}>
              <InputLabel>Seleccionar Ruta</InputLabel>
              <Select
                multiple
                value={selectedRoutes}
                onChange={(e) => setSelectedRoutes(e.target.value)}
                renderValue={(selected) => selected.join(", ")}
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


          {/* Modal para mandar a paqueteria */}
          <Modal
            open={confirmSendModalOpen}
            onClose={() => setConfirmSendModalOpen(false)}
            aria-labelledby="confirm-send-modal-title"
            aria-describedby="confirm-send-modal-description"
          >
            <Box
              padding="20px"
              backgroundColor="white"
              margin="50px auto"
              maxWidth="400px"
              textAlign="center"
              borderRadius="8px"
            >
              <Typography variant="h6" id="confirm-send-modal-title">
                ¿Está seguro de mandar estas rutas a paquetería?
              </Typography>

              <Typography variant="body1" style={{ marginTop: 20 }}>
                Rutas seleccionadas: {selectedRoutes.join(", ")}
              </Typography>

              <Box
                position="relative"
                style={{
                  padding: "20px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                }}
              ></Box>

              <Box marginTop={2}>
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
                  style={{ marginLeft: 10 }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Modal para mostrar detalles de la ruta */}
          <Modal open={modalOpen} onClose={closeModal}>
            <Box
              padding="30px"
              backgroundColor="white"
              margin="20px auto"
              maxWidth="90%"
              maxHeight="90%"
              overflow="auto"
              borderRadius="12px"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            >
              <Box display="flex" alignItems="center" gap={1}>
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
                    <Button onClick={() => renameRoute(selectedRoute, newRouteName)}>
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

              {selectedRoute && groupedData[selectedRoute]?.rows?.length > 0 ? (
                <>
                  <TableContainer>
                    <Grid item xs={12} sm={4} style={{ marginBottom: "20px" }}>
                      <TextField
                        label="Buscar por No Orden"
                        variant="outlined"
                        value={filterOrderValue}
                        onChange={handleOrderFilterChange}
                        fullWidth
                        size="small"
                        style={{ maxWidth: "300px" }}
                      />
                    </Grid>

                    <Table size="small" sx={{ '& td, & th': { padding: '4px 8px', fontSize: '12px' }, '& tr': { height: '36px' } }}>

                      <TableHead>
                        <TableRow>
                          <TableCell>Movimientos</TableCell>
                          <TableCell>FECHA</TableCell>
                          <TableCell>NO ORDEN</TableCell>
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
                        {groupedData[selectedRoute].rows.map((row, index) => (
                          <TableRow key={row["NO ORDEN"]}>
                            <TableCell>
                              {index !== 0 && (
                                <IconButton onClick={() => moverPedido(selectedRoute, index, 'arriba')}>
                                  <ArrowUpwardIcon color="primary" fontSize="small" />
                                </IconButton>
                              )}
                              {index !== groupedData[selectedRoute].rows.length - 1 && (
                                <IconButton onClick={() => moverPedido(selectedRoute, index, 'abajo')}>
                                  <ArrowDownwardIcon color="primary" fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>

                            <TableCell>{row["FECHA"]}</TableCell>
                            <TableCell>{row["NO ORDEN"]}</TableCell>
                            <TableCell>{row["NO FACTURA"]}</TableCell>
                            <TableCell>{row["NUM. CLIENTE"]}</TableCell>
                            <TableCell>{row["NOMBRE DEL CLIENTE"]}</TableCell>
                            <TableCell>{row["ZONA"]}</TableCell>
                            <TableCell>{row["MUNICIPIO"]}</TableCell>
                            <TableCell>{row["ESTADO"]}</TableCell>

                            <TableCell>
                              {editingObservationId === row["NUM. CLIENTE"] ? (
                                <TextField
                                  value={modalObservaciones[row["NUM. CLIENTE"]] || row["OBSERVACIONES"] || ""}
                                  onChange={(e) => handleSaveModalObservation(row["NUM. CLIENTE"], e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") setEditingObservationId(null);
                                  }}
                                />
                              ) : (
                                <span
                                  onDoubleClick={() => handleEditModalObservation(row["NUM. CLIENTE"])}
                                  style={{ cursor: "pointer" }}
                                >
                                  {modalObservaciones[row["NUM. CLIENTE"]] || row["OBSERVACIONES"] || "Sin observaciones"}
                                </span>
                              )}
                            </TableCell>

                            <TableCell>{formatCurrency(row.TOTAL)}</TableCell>
                            <TableCell>{row.PARTIDAS}</TableCell>
                            <TableCell>{row.PIEZAS}</TableCell>

                            <TableCell>
                              {editRouteIndex === index ? (
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
                                    <MenuItem disabled value="">Seleccionar Ruta</MenuItem>
                                    {Object.keys(groupedData).map((route) => (
                                      <MenuItem key={route} value={route}>
                                        {route}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
                                <IconButton onClick={() => setEditRouteIndex(index)}>
                                  <CompareArrowsIcon />
                                </IconButton>
                              )}
                              <IconButton color="error" onClick={() => removeFromRoute(row, selectedRoute)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>No hay datos disponibles para esta ruta.</Typography>
              )}

              <Box textAlign="right" marginTop={2}>
                <Button onClick={closeModal} variant="contained" size="small">
                  Cerrar
                </Button>

              </Box>
            </Box>
          </Modal>



          {/* Tabla de datos cargados */}
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            {/* Filtros */}
            <Grid
              container
              spacing={1}
              marginBottom={2}
              style={{ marginTop: "20px" }}
            >
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Buscar por No Orden"
                  variant="outlined"
                  name="noOrden"
                  value={filter.noOrden}
                  onChange={handleFilterChange}
                  fullWidth
                  size="small" // Ajuste del tamaño
                  style={{ maxWidth: "200px" }} // Limitar la longitud
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
                  size="small" // Ajuste del tamaño
                  style={{ maxWidth: "200px" }} // Limitar la longitud
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
                  size="small" // Ajuste del tamaño
                  style={{ maxWidth: "200px" }} // Limitar la longitud
                />
              </Grid>
            </Grid>

            {tabIndex === 0 && selectedOrders.length > 0 && ["Admin", "Master", "Trans"].includes(user?.role) && (
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
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
              count={filteredData.length} // Se asegura de que `count` es válido
              rowsPerPage={rowsPerPage}
              page={Math.min(
                page,
                Math.floor(filteredData.length / rowsPerPage)
              )}
              onPageChange={(event, newPage) => setPage(newPage)}
              labelRowsPerPage=""
              rowsPerPageOptions={[]}
            />

            {/* Tabla */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Seleccionar</TableCell>
                  <TableCell>FECHA</TableCell>
                  <TableCell>NO ORDEN</TableCell>
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
                    <TableCell colSpan={12} style={{ textAlign: "center" }}>
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
                        <FormControl fullWidth>
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
      {tabIndex === 1 && (user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans" || user?.role === "PQ1" || user?.role === "Control" || user?.role === "EB1" || user?.role === "Paquet" || user?.role === "Embar" || user?.role === "Rep" || user?.role === "Tran", "Rep") && (

        <Box marginTop={2}>
          <Typography variant="h5" style={{ textAlign: "center" }}>
            Tipos de rutas
          </Typography>

          {tabIndex === 1 && (user?.role === "Admin" || user?.role === "Master" || user?.role === "Tran") && (
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

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModalGuia}
          >
            Buscar Pedidos
          </Button>

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
                {/* Número de Guía */}
                <Grid item xs={12}>
                  <TextField
                    label="Número de Guía"
                    fullWidth
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                    margin="dense"
                    sx={{ fontSize: "1rem" }}
                  />
                </Grid>

                {/* Botón para buscar pedidos */}
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

                {/* Número de Factura LT y Total Factura LT */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Número de Factura LT"
                    fullWidth
                    value={numeroFacturaLT}
                    onChange={(e) => setNumeroFacturaLT(e.target.value)}
                    margin="dense"
                    sx={{ fontSize: "1rem" }}
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
                    sx={{ fontSize: "1rem", textAlign: "right" }}
                  />

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Suma Total Pedidos"
                      value={`$${sumaTotalPedidos.toFixed(2)}`}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      sx={{ fontSize: "1rem", textAlign: "right" }}
                    />
                  </Grid>

                </Grid>




                {/* Mostrando los pedidos en tarjetas organizadas */}
                {pedidos.length > 0 && pedidos.map((pedido, index) => (
                  <Grid
                    container
                    spacing={3}
                    key={pedido["NO ORDEN"]}
                    sx={{
                      padding: 3,
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    {/* Fila 1: Pedido, Total y Prorrateo Factura LT */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Pedido"
                        value={pedido["NO ORDEN"]}
                        fullWidth
                        disabled
                        sx={{ fontSize: "1rem" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Total Pedido"
                        value={`$${pedido.TOTAL}`}
                        fullWidth
                        disabled
                        sx={{ fontSize: "1rem", textAlign: "right" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Prorrateo Factura LT"
                        value={pedido.prorrateoFacturaLT}
                        fullWidth
                        onChange={(e) => {
                          const newPedidos = [...pedidos];
                          newPedidos[index].prorrateoFacturaLT =
                            e.target.value;
                          setPedidos(newPedidos);
                        }}
                        sx={{ fontSize: "1rem" }}
                      />
                    </Grid>

                    {/* Fila 2: Prorrateo Factura Paquetería, Suma Flete y Gastos Extras */}

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Suma Flete"
                        value={`$${pedido.sumaFlete}`}
                        fullWidth
                        disabled
                        sx={{ fontSize: "1rem", textAlign: "right" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Gastos Extras"
                        value={pedido.gastosExtras || ""}
                        onChange={(e) => handleGastosExtrasChange(index, e.target.value)}
                        fullWidth
                      />



                    </Grid>

                    {/* Fila 3: Porcentajes organizados correctamente */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="% Envío"
                        value={pedido.porcentajeEnvio || ""}
                        fullWidth
                        disabled
                        sx={{ fontSize: "1rem", textAlign: "right" }}
                      />

                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="% Paquetería"
                        value={pedido.porcentajePaqueteria}
                        fullWidth
                        disabled
                        sx={{ fontSize: "1rem", textAlign: "right" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="% Global"
                        value={pedido.porcentajeGlobal}
                        fullWidth
                        disabled
                        sx={{ fontSize: "1rem", textAlign: "right" }}
                      />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>

            <DialogActions
              sx={{ padding: "16px", justifyContent: "space-between" }}
            >
              {/* Botón de Guardar - Ocupa todo el ancho */}
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

              {/* Botón de Cancelar - Alineado a la derecha */}
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
              />

              <TextField
                label="Buscar por Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                variant="outlined"
                size="small"
              />


              <FormControl
                variant="outlined"
                style={{ minWidth: 200, marginBottom: 10 }}
              >
                <InputLabel>Filtrar por Paquetería</InputLabel>
                <Select
                  value={paqueteriaSeleccionada}
                  onChange={handlePaqueteriaChange}
                  label="Filtrar por Paquetería"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="PITIC">PITIC</MenuItem>
                  <MenuItem value="TRESGUERRAS">TRESGUERRAS</MenuItem>
                  <MenuItem value="EXPRESS">EXPRESS</MenuItem>
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
                    {visibleColumns.includes("NO ORDEN") && (<TableCell>NO ORDEN</TableCell>)}
                    {visibleColumns.includes("NO ORDEN") && (<TableCell>Estado del Pedido</TableCell>)}
                    {visibleColumns.includes("FECHA") && (<TableCell>FECHA</TableCell>)}
                    {visibleColumns.includes("NUM CLIENTE") && (<TableCell>NUM CLIENTE</TableCell>)}
                    {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>NOMBRE DEL CLIENTE</TableCell>)}
                    {visibleColumns.includes("MUNICIPIO") && (<TableCell>MUNICIPIO</TableCell>)}
                    {visibleColumns.includes("ESTADO") && (<TableCell>ESTADO</TableCell>)}
                    {visibleColumns.includes("OBSERVACIONES") && (<TableCell>OBSERVACIONES</TableCell>)}
                    {visibleColumns.includes("TOTAL") && (<TableCell>TOTAL</TableCell>)}
                    {visibleColumns.includes("TOTAL FACTURA LT") && (<TableCell>TOTAL FACTURA LT</TableCell>)}
                    {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>NUMERO DE FACTURA</TableCell>)}
                    {visibleColumns.includes("PARTIDAS") && (<TableCell>PARTIDAS</TableCell>)}
                    {visibleColumns.includes("PIEZAS") && (<TableCell>PIEZAS</TableCell>)}
                    {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>FECHA DE FACTURA</TableCell>)}
                    {visibleColumns.includes("TRANSPORTE") && (<TableCell>TRANSPORTE</TableCell>)}
                    {visibleColumns.includes("PAQUETERIA") && (<TableCell>PAQUETERIA</TableCell>)}
                    {visibleColumns.includes("GUIA") && (<TableCell>GUIA</TableCell>)}
                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && <TableCell>FECHA DE ENTREGA</TableCell>}
                    {visibleColumns.includes("Acciones") && (<TableCell>Acciones</TableCell>)}
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
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((routeData, index) => (
                        <TableRow
                          key={index}
                          onClick={() => handleRowClick(routeData)}
                        >
                          {visibleColumns.includes("NO ORDEN") && (<TableCell>{routeData["NO ORDEN"]}</TableCell>)}

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

                          {visibleColumns.includes("FECHA") && (<TableCell>{formatDate(routeData.FECHA)}</TableCell>)}
                          {visibleColumns.includes("NUM CLIENTE") && (<TableCell>{routeData["NUM. CLIENTE"]}</TableCell>)}
                          {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>{" "}{routeData["NOMBRE DEL CLIENTE"]}{" "}</TableCell>)}
                          {visibleColumns.includes("MUNICIPIO") && (<TableCell>{routeData.MUNICIPIO}</TableCell>)}
                          {visibleColumns.includes("ESTADO") && (<TableCell>{routeData.ESTADO}</TableCell>)}
                          {visibleColumns.includes("OBSERVACIONES") && (<TableCell>{routeData.OBSERVACIONES}</TableCell>)}
                          {visibleColumns.includes("TOTAL") && (<TableCell>{" "}{formatCurrency(routeData.TOTAL)}{" "}</TableCell>)}
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

                          {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>{routeData["NO_FACTURA"]}</TableCell>)}
                          {visibleColumns.includes("PARTIDAS") && (<TableCell>{routeData.PARTIDAS}</TableCell>)}
                          {visibleColumns.includes("PIEZAS") && (<TableCell>{routeData.PIEZAS}</TableCell>)}
                          {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>{formatDate(routeData.FECHA_DE_FACTURA)}</TableCell>)}
                          {visibleColumns.includes("TRANSPORTE") && (<TableCell>{routeData.TRANSPORTE}</TableCell>)}
                          {visibleColumns.includes("PAQUETERIA") && (<TableCell>{routeData.PAQUETERIA}</TableCell>)}
                          {visibleColumns.includes("GUIA") && (<TableCell>{routeData.GUIA}</TableCell>)}
                          {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (<TableCell>{" "}{formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}{" "}</TableCell>)}

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


              <FormControl
                variant="outlined"
                style={{ minWidth: 200, marginRight: 10 }}
              >
                <InputLabel>Filtrar por Factura</InputLabel>
                <TextField
                  label="Filtrar por Factura"
                  variant="outlined"
                  value={facturaSeleccionada}
                  onChange={(e) => setFacturaSeleccionada(e.target.value)}
                  style={{ minWidth: 200, marginRight: 10 }}
                />
              </FormControl>

              <br />

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
                    {visibleColumns.includes("NO ORDEN") && (<TableCell>NO ORDEN</TableCell>)}
                    {visibleColumns.includes("ESTADO") && (<TableCell>Estado del Pedido</TableCell>)}
                    {visibleColumns.includes("FECHA") && (<TableCell>FECHA</TableCell>)}
                    {visibleColumns.includes("NUM CLIENTE") && (<TableCell>NUM CLIENTE</TableCell>)}
                    {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>NOMBRE DEL CLIENTE</TableCell>)}
                    {visibleColumns.includes("MUNICIPIO") && (<TableCell>MUNICIPIO</TableCell>)}
                    {visibleColumns.includes("ESTADO") && (<TableCell>ESTADO</TableCell>)}
                    {visibleColumns.includes("OBSERVACIONES") && (<TableCell>OBSERVACIONES</TableCell>)}
                    {visibleColumns.includes("TOTAL") && (<TableCell>TOTAL</TableCell>)}
                    {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>NUMERO DE FACTURA</TableCell>)}
                    {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>FECHA DE FACTURA</TableCell>)}
                    {visibleColumns.includes("PARTIDAS") && (<TableCell>PARTIDAS</TableCell>)}
                    {visibleColumns.includes("PIEZAS") && (<TableCell>PIEZAS</TableCell>)}
                    {visibleColumns.includes("TRANSPORTE") && (<TableCell>TRANSPORTE</TableCell>)}
                    {visibleColumns.includes("PAQUETERIA") && (<TableCell>TIPO DE RUTA</TableCell>)}
                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>}
                    {visibleColumns.includes("Acciones") && (<TableCell>Acciones</TableCell>)}
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
                      ) // ✅ PAGINACIÓN SIN AFECTAR FILTROS
                      .map((routeData, index) => (
                        <TableRow key={index}>
                          {visibleColumns.includes("NO ORDEN") && (<TableCell>{routeData["NO ORDEN"]}</TableCell>)}

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

                          {visibleColumns.includes("FECHA") && (<TableCell>{formatDate(routeData.FECHA)}</TableCell>)}
                          {visibleColumns.includes("NUM CLIENTE") && (<TableCell>{routeData["NUM. CLIENTE"]}</TableCell>)}
                          {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>{routeData["NOMBRE DEL CLIENTE"]}</TableCell>)}
                          {visibleColumns.includes("MUNICIPIO") && (<TableCell>{routeData.MUNICIPIO}</TableCell>)}
                          {visibleColumns.includes("ESTADO") && (<TableCell>{routeData.ESTADO}</TableCell>)}
                          {visibleColumns.includes("OBSERVACIONES") && (<TableCell>{routeData.OBSERVACIONES}</TableCell>)}
                          {visibleColumns.includes("TOTAL") && (<TableCell>{formatCurrency(routeData.TOTAL)}</TableCell>)}
                          {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>{routeData["NO_FACTURA"]}</TableCell>)}
                          {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>{formatDate(routeData.FECHA_DE_FACTURA)}</TableCell>)}
                          {visibleColumns.includes("PARTIDAS") && (<TableCell>{routeData.PARTIDAS}</TableCell>)}
                          {visibleColumns.includes("PIEZAS") && (<TableCell>{routeData.PIEZAS}</TableCell>)}
                          {visibleColumns.includes("TRANSPORTE") && (<TableCell>{routeData.TRANSPORTE}</TableCell>)}
                          {visibleColumns.includes("PAQUETERIA") && (<TableCell>{routeData.PAQUETERIA}</TableCell>)}
                          {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (<TableCell>{formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}</TableCell>)}
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
                      ) // ✅ PAGINACIÓN SIN AFECTAR FILTROS
                      .map((routeData, index) => (
                        <TableRow key={index}>
                          {visibleColumns.includes("NO ORDEN") && (
                            <TableCell>{routeData["NO ORDEN"]}</TableCell>
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
          {tabIndex === 1 && (user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans" || user?.role === "Rep" || user?.role === "Tran", "Rep") && subTabIndex === 3 && (
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
                    {visibleColumns.includes("ESTADO") && (<TableCell>Estado del Pedido</TableCell>)}
                    {visibleColumns.includes("FECHA") && (<TableCell>FECHA</TableCell>)}
                    {visibleColumns.includes("NO ORDEN") && (<TableCell>NO ORDEN</TableCell>)}
                    {visibleColumns.includes("GUIA") && (<TableCell>GUIA</TableCell>)}
                    {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>NUMERO DE FACTURA</TableCell>)}
                    {visibleColumns.includes("NUM CLIENTE") && (<TableCell>NUM CLIENTE</TableCell>)}
                    {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>NOMBRE DEL CLIENTE</TableCell>)}
                    {visibleColumns.includes("TRANSPORTE") && (<TableCell>TRANSPORTE / RUTA</TableCell>)}
                    {visibleColumns.includes("TOTAL") && (<TableCell>TOTAL</TableCell>)}
                    {visibleColumns.includes("TOTAL FACTURA LT") && (<TableCell>COSTO DEL FLETE</TableCell>)}
                    {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>FECHA DE FACTURA</TableCell>)}
                    {visibleColumns.includes("FECHA DE EMBARQUE") && (<TableCell>FECHA DE EMBARQUE</TableCell>)}
                    {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && <TableCell>FECHA DE ENTREGA CLIENTE</TableCell>}
                    {visibleColumns.includes("PARTIDAS") && (<TableCell>PARTIDAS</TableCell>)}
                    {visibleColumns.includes("PIEZAS") && (<TableCell>PIEZAS</TableCell>)}
                    {visibleColumns.includes("CAJAS") && (<TableCell>CAJAS</TableCell>)}
                    {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (<TableCell>DIA EN QUE ESTA EN RUTA</TableCell>)}
                    {visibleColumns.includes("DIAS DE ENTREGA") && (<TableCell>DIAS DE ENTREGA</TableCell>)}
                    {visibleColumns.includes("ENTREGA SATISFACTORIA O NO SATISFACTORIA") && (<TableCell>ENTREGA SATISFACTORIA O NO SATISFACTORIA</TableCell>)}
                    {visibleColumns.includes("MOTIVO") && (<TableCell>MOTIVO</TableCell>)}
                    {visibleColumns.includes("DIFERENCIA") && (<TableCell>DIFERENCIA</TableCell>)}
                    {visibleColumns.includes("Acciones") && (<TableCell>Acciones</TableCell>)}
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
                        {visibleColumns.includes("NO ORDEN") && (<TableCell>{routeData["NO ORDEN"]}</TableCell>)}
                        {visibleColumns.includes("GUIA") && (<TableCell>{routeData.GUIA}</TableCell>)}
                        {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>{routeData["NO_FACTURA"]}</TableCell>)}
                        {visibleColumns.includes("NUM CLIENTE") && (<TableCell>{routeData["NUM. CLIENTE"]}</TableCell>)}
                        {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>{routeData["NOMBRE DEL CLIENTE"]}</TableCell>)}
                        {visibleColumns.includes("PAQUETERIA") && (<TableCell>{routeData.PAQUETERIA}</TableCell>)}
                        {visibleColumns.includes("TOTAL") && (<TableCell>{formatCurrency(routeData.TOTAL)}</TableCell>)}
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
                        {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>{formatDate(routeData.FECHA_DE_FACTURA)}</TableCell>)}
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
                        {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (<TableCell>{formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}</TableCell>)}
                        {visibleColumns.includes("PARTIDAS") && (<TableCell>{routeData.PARTIDAS}</TableCell>)}
                        {visibleColumns.includes("PIEZAS") && (<TableCell>{routeData.PIEZAS}</TableCell>)}
                        {visibleColumns.includes("CAJAS") && (<TableCell>{routeData.totalCajas}</TableCell>)}
                        {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (<TableCell>{formatDate(routeData.ultimaFechaEmbarque)}</TableCell>)}
                        {visibleColumns.includes("DIAS DE ENTREGA") && (<TableCell>{routeData.DIAS_DE_ENTREGA}</TableCell>)}
                        {visibleColumns.includes("ENTREGA SATISFACTORIA O NO SATISFACTORIA") && (<TableCell>{routeData.ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA}</TableCell>)}
                        {visibleColumns.includes("MOTIVO") && (<TableCell>{routeData.MOTIVO}</TableCell>)}
                        {visibleColumns.includes("DIFERENCIA") && (<TableCell>{routeData.DIFERENCIA}</TableCell>)}

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
                                onClick={() =>
                                  generatePDF(routeData["NO ORDEN"])
                                }
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
            {visibleColumns.includes("NO ORDEN") && (
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
              user?.role === "Master" ||
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
                  value={total} // Asegúrate de que el valor de total esté correctamente vinculado aquí
                  onChange={(e) => setTotal(e.target.value)} // Si deseas cambiar el valor
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
                  value={fechaFactura ? formatDate(fechaFactura) : ""}
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
                  label="Fecha de Entrega Cliente"
                  value={fechaEntregaCliente}
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
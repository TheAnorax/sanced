import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { UserContext } from "../context/UserContext";
import ArticleIcon from "@mui/icons-material/Article";
import { NumerosALetras } from "numero-a-letras";

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
import infoBancaria from "./informacion_bancaria.jpg";
import barraFooter from "./BARRA.jpg";

const hasExpired = (timestamp) => {
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
      // localStorage.setItem("sentRoutesData", JSON.stringify(sentRoutesData));  Guardar los datos de la segunda tabla
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
          "VENT3",
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
          "Tran",
          "Audi",
          "Rep",
          "VENT",
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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
          "VENT3",
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

  function addPageNumber(
    doc,
    pedido,
    numeroFactura,
    tipo_original,
    numeroCliente
  ) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      const pageHeight = doc.internal.pageSize.height;

      if (i === 1) {
        // Página 1 → solo número de página arriba derecha
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`PÁGINA ${i} de ${pageCount}`, pageWidth - 10, 55, {
          align: "right",
        });
      } else {
        // Páginas 2+ → encabezado completo (orden, factura, página)
        const headerY = 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);

        doc.text(`PEDIDO: ${pedido}-${tipo_original}`, 10, headerY + 4);
        doc.text(`FACTURA: ${numeroFactura}`, 10, headerY + 8);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`PÁGINA ${i} de ${pageCount}`, pageWidth - 10, headerY, {
          align: "right",
        });
      }

      // Pie de página (si usas barraFooter)
      if (typeof barraFooter !== "undefined") {
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

      // ✅ Ahora sí puedes buscar con pedido + tipo
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

      // 🔍 Consultar OC mediante la API surtidoOC SOLO para clientes específicos
      let numeroOC = "";
      if (
        nombreCliente === "IMPULSORA INDUSTRIAL MONTERREY" ||
        nombreCliente === "IMPULSORA INDUSTRIAL GUADALAJARA"
      ) {
        try {
          const ocResponse = await axios.post(
            "http://66.232.105.79:9100/surtidoOC",
            {
              orden: pedido,
            }
          );
          numeroOC = ocResponse.data?.oc || "";
        } catch (err) {
          console.warn("⚠️ No se pudo obtener el OC desde surtidoOC:", err);
        }
      }

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
      doc.text(
        `FACTURA No.: ${numeroFactura}  OC: ${numeroOC}`,
        marginLeft,
        currentY
      );
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

      // ✅ AGRUPAR por tipo + cajas (fusionadas respetadas)
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

      const letras = NumerosALetras(totalConIva);
      const fechaActual = new Date();
      const fechaHoy = fechaActual.toLocaleDateString("es-MX");
      const fechaVence = new Date(
        fechaActual.setMonth(fechaActual.getMonth() + 1)
      ).toLocaleDateString("es-MX");

      const textoPagare =
        `En cualquier lugar de este documento donde se estampe la firma por este pagaré debo(emos) y pagaré(mos) ` +
        `incondicionalmente a la vista y a la orden de SANTUL HERRAMIENTAS S.A. DE C.V., la cantidad de: $${totalConIva.toFixed(
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
      doc.text("Observaciones: ", obsBoxX + 3, obsBoxY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`OC: ${numeroOC}`, obsBoxX + 5, obsBoxY + 15); // Mostrar el OC limpio

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

      addPageNumber(doc, pedido, numeroFactura, tipo_original);

      if (modo === "descargar") {
        doc.save(`PackingList de ${pedido}-${tipo_original}.pdf`);
        alert(`PDF generado con éxito para el pedido ${pedido}-${tipo_original}`);
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

  const [filtroAsigNoOrden, setFiltroAsigNoOrden] = useState("");
  const [filtroAsigNombreCliente, setFiltroAsigNombreCliente] = useState("");
  const [filtroAsigNumCliente, setFiltroAsigNumCliente] = useState("");
  const [filtroAsigEstado, setFiltroAsigEstado] = useState("");
  const [filtroAsigEjecutivo, setFiltroAsigEjecutivo] = useState("");

  const filteredAsignacion = useMemo(() => {
    return sentRoutesData.filter((item) => {
      if (
        item.TIPO?.toLowerCase() !== "paqueteria" &&
        item.TIPO?.toLowerCase() !== "directa"
      ) {
        return false;
      }

      const coincideNoOrden =
        !filtroAsigNoOrden ||
        item["NO ORDEN"]?.toString().includes(filtroAsigNoOrden);

      const coincideNombreCliente =
        !filtroAsigNombreCliente ||
        item["NOMBRE DEL CLIENTE"]
          ?.toLowerCase()
          .includes(filtroAsigNombreCliente.toLowerCase());

      const coincideNumCliente =
        !filtroAsigNumCliente ||
        item["NUM. CLIENTE"]?.toString().includes(filtroAsigNumCliente);

      const coincideEstado =
        !filtroAsigEstado ||
        item.ESTADO?.toLowerCase().includes(filtroAsigEstado.toLowerCase());

      const coincideEjecutivo =
        !filtroAsigEjecutivo ||
        item["EJECUTIVO VTAS"]
          ?.toLowerCase()
          .includes(filtroAsigEjecutivo.toLowerCase());

      return (
        coincideNoOrden &&
        coincideNombreCliente &&
        coincideNumCliente &&
        coincideEstado &&
        coincideEjecutivo
      );
    });
  }, [
    sentRoutesData,
    filtroAsigNoOrden,
    filtroAsigNombreCliente,
    filtroAsigNumCliente,
    filtroAsigEstado,
    filtroAsigEjecutivo,
  ]);

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

  const [filtroNoOrden, setFiltroNoOrden] = useState("");
  const [filtroNombreCliente, setFiltroNombreCliente] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroNumCliente, setFiltroNumCliente] = useState("");

  const [filtroEjecutivo, setFiltroEjecutivo] = useState("");

  const paqueteriaFiltrada = useMemo(() => {
    return paqueteriaData.filter((routeData) => {
      const coincideNoOrden =
        !filtroNoOrden ||
        routeData["NO ORDEN"]?.toString().includes(filtroNoOrden);

      const coincideNombreCliente =
        !filtroNombreCliente ||
        routeData["NOMBRE DEL CLIENTE"]
          ?.toLowerCase()
          .includes(filtroNombreCliente.toLowerCase());

      const coincideEstado =
        !filtroEstado ||
        routeData.ESTADO?.toLowerCase().includes(filtroEstado.toLowerCase());

      const coincideMunicipio =
        !filtroMunicipio ||
        routeData.MUNICIPIO?.toLowerCase().includes(
          filtroMunicipio.toLowerCase()
        );

      const coincideNumCliente =
        !filtroNumCliente ||
        routeData["NUM CLIENTE"]?.toString().includes(filtroNumCliente);

      const coincidePaqueteria =
        !paqueteriaSeleccionada ||
        routeData.PAQUETERIA === paqueteriaSeleccionada;

      const coincideEstatus =
        !estatusSeleccionado || routeData.statusText === estatusSeleccionado;

      const coincideGuia =
        !mostrarSinGuia || !routeData.GUIA || routeData.GUIA.trim() === "";

      const coincideEjecutivo =
        !filtroEjecutivo ||
        routeData["EJECUTIVO VTAS"]
          ?.toLowerCase()
          .includes(filtroEjecutivo.toLowerCase());

      return (
        coincideNoOrden &&
        coincideNombreCliente &&
        coincideEstado &&
        coincideMunicipio &&
        coincideNumCliente &&
        coincidePaqueteria &&
        coincideEstatus &&
        coincideGuia &&
        coincideEjecutivo
      );
    });
  }, [
    paqueteriaData,
    filtroNoOrden,
    filtroNombreCliente,
    filtroEstado,
    filtroMunicipio,
    filtroNumCliente,
    paqueteriaSeleccionada,
    estatusSeleccionado,
    mostrarSinGuia,
    filtroEjecutivo,
  ]);

  const [filtroDirectaNoOrden, setFiltroDirectaNoOrden] = useState("");
  const [filtroDirectaNombreCliente, setFiltroDirectaNombreCliente] =
    useState("");
  const [filtroDirectaEstado, setFiltroDirectaEstado] = useState("");
  const [filtroDirectaMunicipio, setFiltroDirectaMunicipio] = useState("");
  const [filtroDirectaNumCliente, setFiltroDirectaNumCliente] = useState("");
  const [filtroDirectaEjecutivo, setFiltroDirectaEjecutivo] = useState("");

  const directaFiltrada = useMemo(() => {
    return directaData.filter((item) => {
      const coincideNoOrden =
        !filtroDirectaNoOrden ||
        item["NO ORDEN"]?.toString().includes(filtroDirectaNoOrden);

      const coincideNombreCliente =
        !filtroDirectaNombreCliente ||
        item["NOMBRE DEL CLIENTE"]
          ?.toLowerCase()
          .includes(filtroDirectaNombreCliente.toLowerCase());

      const coincideEstado =
        !filtroDirectaEstado ||
        item.ESTADO?.toLowerCase().includes(filtroDirectaEstado.toLowerCase());

      const coincideMunicipio =
        !filtroDirectaMunicipio ||
        item.MUNICIPIO?.toLowerCase().includes(
          filtroDirectaMunicipio.toLowerCase()
        );

      const coincideNumCliente =
        !filtroDirectaNumCliente ||
        item["NUM. CLIENTE"]?.toString().includes(filtroDirectaNumCliente);

      const coincideEjecutivo =
        !filtroDirectaEjecutivo ||
        item["EJECUTIVO VTAS"]
          ?.toLowerCase()
          .includes(filtroDirectaEjecutivo.toLowerCase());

      const coincideEstatus =
        !estatusSeleccionado || item.statusText === estatusSeleccionado;

      const coincideFechaEntrega =
        !fechaEntregaSeleccionada ||
        item.FECHA_DE_ENTREGA_CLIENTE === fechaEntregaSeleccionada;

      return (
        coincideNoOrden &&
        coincideNombreCliente &&
        coincideEstado &&
        coincideMunicipio &&
        coincideNumCliente &&
        coincideEjecutivo &&
        coincideEstatus &&
        coincideFechaEntrega
      );
    });
  }, [
    directaData,
    filtroDirectaNoOrden,
    filtroDirectaNombreCliente,
    filtroDirectaEstado,
    filtroDirectaMunicipio,
    filtroDirectaNumCliente,
    filtroDirectaEjecutivo,
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
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                {/*  <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option> */}
              </select>
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
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">
                          EJECUTIVO VTAS
                        </Typography>
                        <TextField
                          value={filtroEjecutivo}
                          onChange={(e) => setFiltroEjecutivo(e.target.value)}
                          size="small"
                          placeholder="Buscar ejecutivo"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  )}

                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">NO ORDEN</Typography>
                        <TextField
                          value={filtroNoOrden}
                          onChange={(e) => setFiltroNoOrden(e.target.value)}
                          size="small"
                          placeholder="Buscar orden"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>Estado del pedido</TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>FECHA</TableCell>
                  )}
                  {visibleColumns.includes("NUM CLIENTE") && (
                    <TableCell>NUM CLIENTE</TableCell>
                  )}

                  {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                        <TextField
                          value={filtroNombreCliente}
                          onChange={(e) =>
                            setFiltroNombreCliente(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar cliente"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  )}

                  {visibleColumns.includes("MUNICIPIO") && (
                    <TableCell>MUNICIPIO</TableCell>
                  )}

                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">ESTADO</Typography>
                        <TextField
                          value={filtroEstado}
                          onChange={(e) => setFiltroEstado(e.target.value)}
                          size="small"
                          placeholder="Buscar estado"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
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
                          <TableCell>
                            {routeData["EJECUTIVO VTAS"] || "Sin Ejecutivo"}
                          </TableCell>
                        )}

                        {visibleColumns.includes("NO ORDEN") && (
                          <TableCell>
                            {routeData["NO ORDEN"]} -{" "}
                            {routeData["tipo_original"]}
                          </TableCell>
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
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                {/*   <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option> */}
              </select>
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
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">
                          EJECUTIVO VTAS
                        </Typography>
                        <TextField
                          value={filtroDirectaEjecutivo}
                          onChange={(e) =>
                            setFiltroDirectaEjecutivo(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar ejecutivo"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  )}

                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">NO ORDEN</Typography>
                        <TextField
                          value={filtroDirectaNoOrden}
                          onChange={(e) =>
                            setFiltroDirectaNoOrden(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar orden"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
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
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">
                          NOMBRE DEL CLIENTE
                        </Typography>
                        <TextField
                          value={filtroDirectaNombreCliente}
                          onChange={(e) =>
                            setFiltroDirectaNombreCliente(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar cliente"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  )}
                  {visibleColumns.includes("MUNICIPIO") && (
                    <TableCell>MUNICIPIO</TableCell>
                  )}

                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2">ESTADO</Typography>
                        <TextField
                          value={filtroDirectaEstado}
                          onChange={(e) =>
                            setFiltroDirectaEstado(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar estado"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
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
                          <TableCell>
                            {routeData["EJECUTIVO VTAS"] || "Sin Ejecutivo"}
                          </TableCell>
                        )}

                        {visibleColumns.includes("NO ORDEN") && (
                          <TableCell>
                            {routeData["NO ORDEN"]} -{" "}
                            {routeData["tipo_original"]}
                          </TableCell>
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
                          <TableCell>
                            {routeData["NO ORDEN"]}-{routeData["tipo_original"]}
                          </TableCell>
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
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                {/*   <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option> */}
              </select>
            </div>

            <Table>
              <TableHead>
                <TableRow>
                  {visibleColumns.includes("ESTADO") && (
                    <TableCell>Status</TableCell>
                  )}
                  {visibleColumns.includes("FECHA") && (
                    <TableCell>FECHA</TableCell>
                  )}
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <TableCell>NO ORDEN</TableCell>
                        <TextField
                          value={filtroAsigNoOrden}
                          onChange={(e) => setFiltroAsigNoOrden(e.target.value)}
                          size="small"
                          placeholder="Buscar orden"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                  )}
                  {visibleColumns.includes("NO ORDEN") && (
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <TableCell>EJECUTIVO VTAS</TableCell>
                        <TextField
                          value={filtroAsigEjecutivo}
                          onChange={(e) =>
                            setFiltroAsigEjecutivo(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar ejecutivo"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
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
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                        <TextField
                          value={filtroAsigNombreCliente}
                          onChange={(e) =>
                            setFiltroAsigNombreCliente(e.target.value)
                          }
                          size="small"
                          placeholder="Buscar cliente"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
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
                        <TableCell>
                          {routeData["NO ORDEN"]} - {routeData["tipo_original"]}
                        </TableCell>
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
}

export default Tracking;

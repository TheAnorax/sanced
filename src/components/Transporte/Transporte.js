import React, { useState, useEffect, useContext, useMemo } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { UserContext } from "../context/UserContext";
import ArticleIcon from "@mui/icons-material/Article";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { LinearProgress } from "@mui/material";

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
  const [observacionesPorRegistro, setObservacionesPorRegistro] = useState(() => {
    const storedObservaciones = localStorage.getItem("observacionesPorRegistro");
    return storedObservaciones ? JSON.parse(storedObservaciones) : {};
  });


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


  useEffect(() => {
    let isCancelled = false;

    const fetchStatuses = async (data, setData) => {
      const updatedData = await Promise.all(
        data.map(async (route) => {
          const orderNumber = route["NO ORDEN"];
          // console.log("Obteniendo estado del pedido:", orderNumber);

          try {
            // Realizar la solicitud al backend
            const response = await axios.get(
              `http://192.168.3.27:3007/api/Trasporte/status/${orderNumber}`
            );
            const { progress, statusText } = response.data;

            return {
              ...route,
              progress,
              statusText,
            };
          } catch (error) {
            console.error(
              `Error al obtener el estado para el pedido ${orderNumber}:`,
              error
            );
            return {
              ...route,
              statusText: "Error al cargar datos",
            };
          }
        })
      );

      // Actualizar el estado solo si el componente sigue montado
      if (!isCancelled) {
        setData(updatedData);
      }
    };

    const fetchInitialStatuses = () => {
      // Ejecutar la carga inicial para mostrar los avances
      if (paqueteriaData.length > 0)
        fetchStatuses(paqueteriaData, setPaqueteriaData);
      if (directaData.length > 0) fetchStatuses(directaData, setDirectaData);
      if (ventaEmpleadoData.length > 0)
        fetchStatuses(ventaEmpleadoData, setVentaEmpleadoData);
    };

    // Cargar el estado inicial al montar el componente
    fetchInitialStatuses();

    // Programar la actualización cada 20 minutos (1200000 ms)
    const intervalId = setInterval(() => {
      // console.log("Ejecutando actualización periódica de estados...");
      fetchInitialStatuses();
    }, 1200000);

    return () => {
      clearInterval(intervalId);
      isCancelled = true; // Evitar actualizaciones si el componente se desmonta
    };
  }, [paqueteriaData, directaData, ventaEmpleadoData]);

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
    // console.log("Datos de la paquetería:", sentRoutesData); // Verifica el estado
  }, [sentRoutesData]);

  // useEffect(() => {
  //   // Recorre todos los clientes de la segunda tabla para obtener sus observaciones
  //   sentRoutesData.forEach((routeData) => {
  //     // Verifica si la observación ya está cargada
  //     if (!observacionesPorRegistro[routeData["NUM. CLIENTE"]]) {
  //       // Si no está cargada, llama a la API para cargarla
  //       fetchObservacionPorRegistro(routeData["NUM. CLIENTE"]);
  //     }
  //   });
  // }, [sentRoutesData]);

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

  // useEffect(() => {
  //   sentRoutesData.forEach((routeData) => {
  //     if (!observacionesPorRegistro[routeData["NUM. CLIENTE"]]) {
  //       fetchObservacionPorRegistro(routeData["NUM. CLIENTE"]);
  //     }
  //   });
  // }, [sentRoutesData]);

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

      // 🔹 Definir las fechas de hoy, ayer y anteayer (ajustando el tiempo a medianoche)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(today.getDate() - 2);

      // 🔹 Filtrar datos por la fecha de hoy, ayer y anteayer y "Estatus" = "Lista Surtido"
      const filteredData = jsonData
        .map((row) => {
          if (!row["Fecha Lista Surtido"]) {
            console.warn("⚠️ Registro sin fecha:", row);
            return null; // Ignorar filas sin fecha
          }

          let rowDate;
          if (typeof row["Fecha Lista Surtido"] === "number") {
            // 🔹 Convertir formato numérico de Excel a fecha en JS
            rowDate = new Date(Date.UTC(0, 0, row["Fecha Lista Surtido"] - 1));
          } else {
            // 🔹 Convertir string a Date (posibles formatos "DD/MM/YYYY" o "YYYY-MM-DD")
            const dateParts = row["Fecha Lista Surtido"].split("/");
            if (dateParts.length === 3) {
              rowDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            } else {
              rowDate = new Date(row["Fecha Lista Surtido"]);
            }
          }

          if (isNaN(rowDate.getTime())) {
            console.warn("🚨 Fecha inválida detectada:", row["Fecha Lista Surtido"]);
            return null;
          }

          // 🔹 Ajustar rowDate a medianoche para comparación precisa
          rowDate.setHours(0, 0, 0, 0);
          row.rowDateObject = rowDate; // Guardar el objeto Date para ordenarlo después

          return (
            (rowDate.getTime() === today.getTime() ||
              rowDate.getTime() === yesterday.getTime() ||
              rowDate.getTime() === dayBeforeYesterday.getTime()) &&
            row["Estatus"] === "Lista Surtido"
          )
            ? row
            : null;
        })
        .filter(Boolean); // Filtrar valores null

      // 🔹 Ordenar por fecha de manera descendente
      const sortedData = filteredData.sort(
        (a, b) => b.rowDateObject - a.rowDateObject
      );

      // 🔹 Mapea los datos filtrados
      const mappedData = sortedData
        .map(mapColumns)
        .filter((row) => row["NO ORDEN"]);

      setData(mappedData);
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
    if (newRoute && !groupedData[newRoute]) {
      setGroupedData({
        ...groupedData,
        [newRoute]: { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0, rows: [] },
      });
      setNewRoute("");
    }
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
    setData((prevData) => prevData.filter((row) => row["NO ORDEN"] !== item["NO ORDEN"]));
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
      localStorage.setItem("transporteGroupedData", JSON.stringify(updatedData));

      console.log(`✅ Ruta renombrada de '${oldRouteName}' a '${newRouteName}' sin perder datos.`);
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
      console.time("Tiempo de carga de rutas");

      const response = await fetch("http://192.168.3.27:3007/api/Trasporte/rutas");
      const data = await response.json();

      console.timeEnd("Tiempo de carga de rutas");

      console.log("✅ Datos recibidos desde la API:", data);

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
    console.log("🔍 sentRoutesData antes de filtrar:", sentRoutesData);

    if (!Array.isArray(sentRoutesData) || sentRoutesData.length === 0) {
      console.warn("⚠ No hay datos en sentRoutesData, las tablas estarán vacías");
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

    console.log("✅ Datos filtrados para paquetería:", paqueteria);
    console.log("✅ Datos filtrados para directa:", directa);
    console.log("✅ Datos filtrados para venta empleado:", ventaEmpleado);

    setPaqueteriaData(paqueteria);
    setDirectaData(directa);
    setVentaEmpleadoData(ventaEmpleado);
  }, [sentRoutesData]);

  useEffect(() => {
    console.log("🔄 Cambio de pestaña activa:", subTabIndex);
  }, [subTabIndex]);




  const fetchAdditionalData = async (noOrden) => {
    try {
      const url = `http://192.168.3.27:3007/api/Trasporte/pedido/detalles/${noOrden}`; // Usamos el parámetro en la URL
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
      ...new Set(sentRoutesData.map((route) => route["NUM. CLIENTE"])) // Extraer los clientes únicos
    ];

    if (clientesUnicos.length === 0) return;

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Trasporte/clientes/observaciones",
        { clientes: clientesUnicos }
      );

      const observaciones = response.data;

      // Actualizar la tabla con las observaciones recibidas
      const updatedRoutes = sentRoutesData.map((route) => ({
        ...route,
        OBSERVACIONES: observaciones[route["NUM. CLIENTE"]] || "Sin observaciones"
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
          "http://192.168.3.27:3007/api/Trasporte/insertarRutas",
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

          setTotalClientes((prev) => - selectedRoutes.length);
          setTotalPedidos((prev) => - selectedRoutes.length);
          setTotalGeneral((prev) => - selectedRoutes.length);

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

  const calculateTotalClientes = (rutasSeleccionadas) => {
    const clientes = new Set(); // Utilizar un Set para asegurarnos de que los clientes sean únicos

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        routeData.rows.forEach((row) => {
          clientes.add(row["NUM. CLIENTE"]); // Agregar solo clientes únicos
        });
      }
    });

    return clientes.size; // El tamaño del Set nos da el total de clientes únicos
  };

  const calculateTotalPedidos = (rutasSeleccionadas) => {
    let totalPedidos = 0;

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        totalPedidos += routeData.rows.length; // Contamos las filas (pedidos) de cada ruta
      }
    });

    return totalPedidos;
  };

  const calculateTotalGeneral = (rutasSeleccionadas) => {
    let totalGeneral = 0;

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        routeData.rows.forEach((row) => {
          totalGeneral += row.TOTAL; // Sumamos el total de cada pedido
        });
      }
    });

    return totalGeneral;
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
      const url = `http://192.168.3.27:3007/api/Trasporte/paqueteria/actualizar-guia/${selectedNoOrden}`;

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
          "Embar",
          "Control",
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
        ],
      },
      {
        name: "FECHA",
        role: ["Admin", "Master", "Trans", "PQ1", "EB1", "Paquet", "Embar"],
      },
      {
        name: "NUM CLIENTE",
        role: ["Admin", "Master", "Trans", "PQ1", "EB1", "Paquet", "Embar"],
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
        ],
      },
      {
        name: "MUNICIPIO",
        role: ["Admin", "Master", "Trans", "PQ1", "EB1", "Paquet", "Embar"],
      },
      {
        name: "ESTADO",
        role: ["Admin", "Master", "Trans", "PQ1", "EB1", "Paquet", "Embar"],
      },
      {
        name: "OBSERVACIONES",
        role: ["Admin", "Master", "Trans", "PQ1", "Paquet", "Embar"],
      },
      { name: "TOTAL", role: ["Admin", "Master", "Trans", "PQ1", "Paquet"] },
      { name: "PARTIDAS", role: ["Admin", "Master", "Trans", "Control"] },
      { name: "PIEZAS", role: ["Admin", "Master", "Trans", "Control"] },
      { name: "ZONA", role: ["Admin", "Master", "Trans"] },
      { name: "TIPO DE ZONA", role: ["Admin", "Master", "Trans"] },
      {
        name: "NUMERO DE FACTURA",
        role: ["Admin", "Master", "Trans", "Control"],
      },
      {
        name: "FECHA DE FACTURA",
        role: ["Admin", "Master", "Trans", "Control"],
      },
      { name: "FECHA DE EMBARQUE", role: ["Admin", "Master", "Trans"] },
      {
        name: "DIA EN QUE ESTA EN RUTA",
        role: ["Admin", "Master", "Trans", "EB1", "Embar"],
      },
      {
        name: "HORA DE SALIDA",
        role: ["Admin", "Master", "Trans", "EB1", "Embar"],
      },
      { name: "CAJAS", role: ["Admin", "Master", "Trans", "PQ1", "Paquet"] },
      { name: "TARIMAS", role: ["Admin", "Master", "Trans", "Paquet"] },
      {
        name: "TRANSPORTE",
        role: ["Admin", "Master", "Trans", "PQ1", "Paquet", "Control"],
      },
      {
        name: "PAQUETERIA",
        role: ["Admin", "Master", "Trans", "PQ1", "Paquet", "Control"],
      },
      { name: "GUIA", role: ["Admin", "Master", "Trans", "PQ1", "Paquet"] },
      {
        name: "FECHA DE ENTREGA (CLIENTE)",
        role: ["Admin", "Master", "Trans", "PQ1"],
      },
      {
        name: "FECHA ESTIMADA DE ENTREGA",
        role: ["Admin", "Master", "Trans", "PQ1"],
      },
      { name: "DIAS DE ENTREGA", role: ["Admin", "Master", "Trans", "PQ1"] },
      {
        name: "ENTREGA SATISFACTORIA O NO SATISFACTORIA",
        role: ["Admin", "Master", "Trans", "PQ1", "Paquet"],
      },
      { name: "MOTIVO", role: ["Admin", "Master", "Trans"] },
      { name: "NUMERO DE FACTURA LT", role: ["Admin", "Master", "Trans"] },
      { name: "TOTAL FACTURA LT", role: ["Admin", "Master", "Trans"] },
      { name: "PRORRATEO $ FACTURA LT", role: ["Admin", "Master", "Trans"] },
      {
        name: "PRORRATEO $ FACTURA PAQUETERIA",
        role: ["Admin", "Master", "Trans"],
      },
      { name: "GASTOS EXTRAS", role: ["Admin", "Master", "Trans"] },
      { name: "SUMA FLETE", role: ["Admin", "Master", "Trans"] },
      { name: "% ENVIO", role: ["Admin", "Master", "Trans"] },
      { name: "% PAQUETERIA", role: ["Admin", "Master", "Trans"] },
      { name: "SUMA GASTOS EXTRAS", role: ["Admin", "Master", "Trans"] },
      { name: "% GLOBAL", role: ["Admin", "Master", "Trans"] },
      { name: "DIFERENCIA", role: ["Admin", "Master", "Trans"] },
      {
        name: "Acciones",
        role: ["Admin", "Master", "Trans", "Control", "PQ1", "Paquet", "Embar"],
      },
      {
        name: "TRANSPORTISTA",
        role: ["Admin", "Master", "Trans", "Control", "Embar"],
      },
      { name: "EMPRESA", role: ["Admin", "Master", "Trans", "Control"] },
      { name: "CLAVE", role: ["Admin", "Master", "Trans", "Control"] },
      { name: "ACCIONES", role: ["Admin", "Master", "Trans", "Control"] },
      { name: "REG_ENTRADA", role: ["Admin", "Master", "Trans", "Control"] },
    ];

    return allColumns
      .filter((col) => col.role.includes(role))
      .map((col) => col.name);
  };

  const visibleColumns = getVisibleColumns(user?.role);

  const handleGenerateExcel = () => {
    // 🔹 Filtrar solo las rutas con tipo "Directa"
    const filteredData = sentRoutesData.filter(row => row["TIPO"].toLowerCase() === "directa");

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

      groupedData[clientId].contactInfo.address = cleanAddress(row["DIRECCION"]);
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
        "ID Referencia": clientData.orders.map(order => order["NO ORDEN"]).join(", "),
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
        "Correo"
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


  const generatePDF = async (pedido) => {
    try {
      // Paso 1: Obtener datos de la API de rutas
      const responseRoutes = await fetch("http://192.168.3.27:3007/api/Trasporte/rutas");
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

      const telefono = route["TELÉFONO"] || "Sin numero de Contacto";

      const responseEmbarque = await fetch(`http://192.168.3.27:3007/api/Trasporte/embarque/${pedido}`);
      const data = await responseEmbarque.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert("No hay productos disponibles para este pedido.");
        return;
      }

      const productosConCaja = data.filter((item) => item.caja && item.caja > 0);
      const productosSinCaja = data.filter((item) => !item.caja || item.caja === 0);


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

      doc.text(`Cliente: ${nombreCliente} Núm. Cliente: ${numero} Núm. Teléfono: ${telefono}`, marginLeft, currentY);
      currentY += 7; // Baja el cursor para separar

      doc.text(`No Factura: ${numeroFactura} Dirección: ${direccion} `, marginLeft, currentY);
      currentY += 8;
      // Definir título del recuadro
      const titulo = "INSTRUCCIONES DE ENTREGA";

      // Definir las instrucciones con el texto proporcionado
      const instruccionesIzquierda = "En caso de detectar cualquier irregularidad (daños, faltantes, o manipulaciones),";
      const instruccionesDerecha = "Favor de comunicarse de inmediato al departamento de atención al cliente al número: 123-456-7890.\nAgradecemos su confianza y preferencia.";

      // Posiciones y dimensiones
      const cajaX = marginLeft;
      const cajaY = currentY;
      const cajaAncho = 180;
      const padding = 6;
      const columnaAncho = cajaAncho / 2 - 10; // Ajuste para que el texto no se salga

      // Calcular altura del cuadro en base al texto
      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      const lineasIzquierda = doc.splitTextToSize(instruccionesIzquierda, columnaAncho);
      const lineasDerecha = doc.splitTextToSize(instruccionesDerecha, columnaAncho);
      const lineasTotales = Math.max(lineasIzquierda.length, lineasDerecha.length);
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
      doc.text(titulo, cajaX + (cajaAncho / 2) - (doc.getTextWidth(titulo) / 2), cajaY + 5.5);

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
        styles: { halign: "center", fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0] },
        headStyles: {
          fontStyle: "time",
          textColor: [0, 0, 0], // Texto negro
          fillColor: [240, 240, 240], // Fondo gris claro para cabecera
          lineColor: [0, 0, 0], // Bordes negros
          lineWidth: 0.5
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
          styles: { halign: "center", fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0] },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5
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
          styles: { fontSize: 8, halign: "center", cellPadding: 2, lineColor: [0, 0, 0] },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5
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
          styles: { halign: "center", fontSize: 10, cellPadding: 1, lineColor: [0, 0, 0] },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5
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
          styles: { fontSize: 8, halign: "center", cellPadding: 1.5, lineColor: [0, 0, 0] },
          headStyles: {
            fontStyle: "time",
            textColor: [0, 0, 0], // Texto negro
            fillColor: [240, 240, 240], // Fondo gris claro para cabecera
            lineColor: [0, 0, 0], // Bordes negros
            lineWidth: 0.5
          },
          bodyStyles: { halign: "center" },
        });
        currentY = doc.lastAutoTable.finalY + 10;
      } else {
        doc.text("No hay productos sin cajas.", marginLeft, currentY);
        currentY += 10;
      }

      // Firmas permanecen igual
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

      // Información de referencia bancaria
      const infoBancaria = [
      ];



      // Ajustar posición para los datos
      currentY += 6;
      const columnWidth = 65; // Ancho de cada columna
      const columnStartX = [
        marginLeft,
        marginLeft + columnWidth,
        marginLeft + columnWidth * 2,
      ]; // Posición inicial de cada columna

      // Configurar estilo de texto
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8); // Tamaño de letra más pequeño

      // Dibujar cada bloque de información bancaria en columnas
      infoBancaria.forEach((banco, index) => {
        const startX = columnStartX[index];
        doc.text(banco.banco, startX, currentY);
        doc.text(banco.cuenta, startX, currentY + 6);
        doc.text(banco.sucursal, startX, currentY + 12);
        doc.text(banco.clabe, startX, currentY + 18);
      });

      // 📌 Mover la información bancaria hasta el final
      const pageHeight = doc.internal.pageSize.height; // Altura total de la página
      const marginBottom = 30; // Margen inferior deseado
      currentY = pageHeight - marginBottom - 25; // Ajustar espacio para la referencia bancaria


      // 📌 Referencia bancaria al final del documento
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("REFERENCIA BANCARIA:", marginLeft, currentY);

      currentY += 6; // Espacio para los datos bancarios

      const cuentas = [
        ["BANAMEX", "Cuenta: 6860432", "Sucursal: 7006", "Clabe: 00218070068604325"],
        ["BANORTE", "Cuenta: 0890771176", "Sucursal: 04", "Clabe: 072180008907711766"],
        ["BANCOMER", "Cuenta: 0194242696", "Sucursal: 1838", "Clabe: 012580001942426961"]
      ];

      // 📌 Dibujar la referencia bancaria en columnas
      cuentas.forEach((banco, index) => {
        const startX = marginLeft + (index * 65);
        doc.text(banco[0], startX, currentY);
        doc.text(banco[1], startX, currentY + 5);
        doc.text(banco[2], startX, currentY + 10);
        doc.text(banco[3], startX, currentY + 15);
      });

      currentY += 25;

      // 📌 Ahora agrega la numeración de páginas
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("times", "normal");
        doc.setFontSize(9);

        // 📌 Posicionamos el número de página al centro y por debajo de la referencia bancaria
        const pageWidth = doc.internal.pageSize.width;
        const textoPagina = `Página ${i} de ${totalPages}`;

        doc.text(textoPagina, pageWidth / 2 - doc.getTextWidth(textoPagina) / 2, pageHeight - 5);
      }

      // Guardar el PDF
      doc.save(`PackingList_de_${pedido}.pdf`);
      alert(`PDF generado con éxito para el pedido ${pedido}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };




  useEffect(() => {
    console.log("Observaciones actuales:", observacionesPorRegistro);
  }, [observacionesPorRegistro, groupedData]);

  // useEffect(() => {
  //   // Recorre todos los clientes de la segunda tabla para obtener sus observaciones
  //   sentRoutesData.forEach((routeData) => {
  //     // Verifica si la observación ya está cargada
  //     if (!observacionesPorRegistro[routeData["NUM. CLIENTE"]]) {
  //       // Si no está cargada, llama a la API para cargarla
  //       fetchObservacionPorRegistro(routeData["NUM. CLIENTE"]);
  //     }
  //   });
  // }, [sentRoutesData]);

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

  const filteredData = data.filter((row) => {
    return (
      (filter.noOrden === "" ||
        row["NO ORDEN"].toString().includes(filter.noOrden)) &&
      (filter.numCliente === "" ||
        row["NUM. CLIENTE"].toString().includes(filter.numCliente)) &&
      (filter.estado === "" ||
        row.ESTADO.toLowerCase().includes(filter.estado.toLowerCase()))
    );
  });

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
        "http://192.168.3.27:3007/api/Trasporte/transportistas"
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
        "http://192.168.3.27:3007/api/Trasporte/transportistas/empresas"
      );

      // console.log("Datos de empresa:", response.data); // Verifica que contenga datos
      setEmpresaData(response.data);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      setError("Error al obtener empresas");
    }
  };

  const handleRowChange = (index, field, value) => {
    // console.log(`🛠️ handleRowChange - Campo: ${field}, Valor: ${value}`);

    // Clonar los datos sin referencias
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
        "http://192.168.3.27:3007/api/Trasporte/insertar-visita",
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
        `http://192.168.3.27:3007/api/Trasporte/ruta/eliminar/${noOrden}`
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

  const handleShowTotal = () => {
    const rutasSeleccionadas = Object.keys(groupedData);

    setTotalClientes(prev => prev + calculateTotalClientes(rutasSeleccionadas));
    setTotalPedidos(prev => prev + calculateTotalPedidos(rutasSeleccionadas));
    setTotalGeneral(prev => prev + calculateTotalGeneral(rutasSeleccionadas));

    setTotalsModalOpen(true);
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

  useEffect(() => {
    // console.log("Observaciones actuales:", observacionesPorRegistro);
  }, [observacionesPorRegistro, groupedData]);

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
      case "PAQUETE EXPRES":
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

  const transportUrl = getTransportUrl(transporte);

  const handleOpenHistoricoModal = async () => {
    if (user?.role !== "Admin" && user?.role !== "Master") {
      alert("No tienes permisos para ver este módulo.");
      return;
    }
    try {
      const response = await axios.get("http://192.168.3.27:3007/api/Trasporte/historico");
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
      const response = await axios.get("http://192.168.3.27:3007/api/Trasporte/historico", {
        params: {
          cliente: selectedCliente || "",
          columnas: selectedColumns.join(","),
          mes: selectedMonth || "", // 🟢 Enviar el mes seleccionado
        },
      });

      setHistoricoData(response.data);
    } catch (error) {
      console.error("Error al obtener datos históricos:", error);
      alert("Error al obtener datos históricos.");
    }
  };


  const fetchClientesRegistrados = async () => {
    try {
      const response = await axios.get("http://192.168.3.27:3007/api/Trasporte/historico_clientes");

      // Limpiar comillas innecesarias en nombres de clientes
      const clientesLimpios = response.data.map(cliente => ({
        noCliente: cliente.NO_DE_CLIENTE,
        nombreCliente: cliente.CLIENTE.replace(/^"|"$/g, '') // Elimina comillas extras
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
    fetchClientesRegistrados();  // Se ejecuta solo una vez al cargar la página
  }, []);

  const fetchColumnasDisponibles = async () => {
    try {
      const response = await axios.get("http://192.168.3.27:3007/api/Trasporte/historico_columnas");
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
    setSelectedCliente("");  // Reinicia el cliente
    setSelectedColumns([]);  // Reinicia las columnas seleccionadas
    setHistoricoData([]);    // Borra los datos mostrados en la tabla
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
    { value: "12", label: "Diciembre" }
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

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const filteredClientes = clientes.filter((cliente) =>
    `${cliente.noCliente} - ${cliente.nombreCliente}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

  const paqueteriaFiltrada = useMemo(() => {
    if (!filtro) return paqueteriaData; // Si no hay filtro, mostrar todos los datos
    return paqueteriaData.filter((routeData) => {
      return (
        routeData["NO ORDEN"]?.toString().includes(filtro) ||
        routeData["NOMBRE DEL CLIENTE"]?.toLowerCase().includes(filtro.toLowerCase()) ||
        routeData.ESTADO?.toLowerCase().includes(filtro.toLowerCase())
      );
    });
  }, [filtro, paqueteriaData]);



  const directaFiltrada = useMemo(() => {
    if (!filtro) return directaData; // Si no hay filtro, muestra todos los datos
    return directaData.filter((item) =>
      item["NOMBRE DEL CLIENTE"]?.toLowerCase().includes(filtro.toLowerCase()) ||
      item["NO ORDEN"]?.toString().includes(filtro) ||
      item.ESTADO?.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [filtro, directaData]);

  const ventaEmpleadoFiltrada = useMemo(() => {
    if (!filtro) return ventaEmpleadoData; // Si no hay filtro, muestra todos los datos
    return ventaEmpleadoData.filter((item) =>
      item["NOMBRE DEL CLIENTE"]?.toLowerCase().includes(filtro.toLowerCase()) ||
      item["NO ORDEN"]?.toString().includes(filtro) ||
      item.ESTADO?.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [filtro, ventaEmpleadoData]);


  const [modalObservaciones, setModalObservaciones] = useState({});
  const [editingObservationId, setEditingObservationId] = useState(null);

  useEffect(() => {
    const savedObservations = JSON.parse(localStorage.getItem("modalObservaciones")) || {};
    setModalObservaciones(savedObservations);
  }, []);
  // Función para activar la edición de observaciones en el Modal
  const handleEditModalObservation = (clienteId) => {
    setEditingObservationId(clienteId);
  };

  // Función para guardar la observación dentro del Modal y mantenerla en localStorage
  const handleSaveModalObservation = (clienteId, nuevaObservacion) => {
    setModalObservaciones((prev) => {
      const updatedObservations = { ...prev, [clienteId]: nuevaObservacion };

      // Guardamos en localStorage para persistencia
      localStorage.setItem("modalObservaciones", JSON.stringify(updatedObservations));

      return updatedObservations;
    });

    // Mantener el campo activo hasta que el usuario haga clic fuera
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
          user?.role === "Trans") && (
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

              <TextField
                label="Nueva Ruta"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                variant="outlined"
                style={{ marginRight: "10px" }}
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
                onClick={handleShowTotal}
                variant="contained"
                color="primary"
              >
                Ver Suma Total de Rutas
              </Button>

              {/* Botón para abrir el modal */}
              {user?.role === "Admin" || user?.role === "Master" ? (
                <Button variant="contained" color="primary" onClick={handleOpenHistoricoModal}>
                  Histórico 2024
                </Button>
              ) : null}

              <Dialog open={historicoModalOpen} onClose={handleCloseHistoricoModal} maxWidth="md" fullWidth>
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
                      onChange={(event) => setSelectedCliente(event.target.value)}
                      displayEmpty
                    >
                      {filteredClientes.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((cliente) => (
                        <MenuItem key={cliente.noCliente} value={cliente.noCliente}>
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
                      onChange={(event) => setSelectedColumns(event.target.value)}
                      onClose={() => console.log("Selector de columnas cerrado")}
                      renderValue={(selected) => selected.length ? selected.join(", ") : "Selecciona columnas"}
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
                      <Select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                        {meses.map((mes) => (
                          <MenuItem key={mes.value} value={mes.value}>
                            {mes.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Botones de Acción */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <Button variant="contained" color="primary" onClick={handleFetchHistoricoData}>
                      Buscar
                    </Button>

                    <Button variant="outlined" color="secondary" onClick={resetFilters}>
                      Reiniciar
                    </Button>
                  </div>

                  {/* Tabla de Datos */}
                  <TableContainer component={Paper} style={{ marginTop: "20px" }}>
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



              {/* Totals Modal */}
              <Dialog
                open={totalsModalOpen}
                onClose={() => setTotalsModalOpen(false)}
              >
                <DialogTitle>Resumen de Rutas Cargadas</DialogTitle>
                <DialogContent>
                  <div
                    style={{
                      backgroundColor: "yellow",
                      padding: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: "bold", width: "30%" }}>
                      CLIENTES
                    </span>
                    <span style={{ fontWeight: "bold", width: "30%" }}>
                      PEDIDOS
                    </span>
                    <span style={{ fontWeight: "bold", width: "30%" }}>
                      TOTAL
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "16px",
                    }}
                  >
                    <span>{totalClientes}</span>
                    <span>{totalPedidos}</span>
                    <span>{formatCurrency(totalGeneral)}</span>
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setTotalsModalOpen(false)}
                    color="primary"
                  >
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
                  return (
                    <Box
                      key={route}
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
                  );
                })}
              </Box>
            ) : (
              <FormControl fullWidth style={{ marginTop: "20px" }}>
                <InputLabel>Seleccionar Ruta</InputLabel>
                <Select
                  multiple // ✅ Permite seleccionar varias rutas
                  value={selectedRoutes} // ✅ Vinculado al estado
                  onChange={(e) => setSelectedRoutes(e.target.value)} // ✅ Actualiza rutas seleccionadas
                  renderValue={(selected) => selected.join(", ")} // ✅ Muestra rutas seleccionadas
                >
                  {Object.keys(groupedData).map((route) => (
                    <MenuItem key={route} value={route}>
                      <Checkbox checked={selectedRoutes.includes(route)} />{" "}
                      {/* ✅ Permite checkboxes dentro del Select */}
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
                >
                  <IconButton
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                    }}
                    color="primary"
                    onClick={exportToImage}
                  >
                    <DownloadIcon />
                  </IconButton>

                  {/* Contenedor con los datos a capturar */}
                  <div id="data-to-capture" style={{ padding: "20px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        borderColor: "black",
                        borderRadius: "1px",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#FFEB3B" }}>
                          <th
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            CLIENTES
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            PEDIDOS
                          </th>
                          <th
                            style={{
                              padding: "8px",
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
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {totalClientes}
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {totalPedidos}
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {formatCurrency(totalGeneral)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Box>

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
                          renameRoute(selectedRoute, newRouteName); // Renombrar sin perder datos
                          setEditingRoute(null);
                        }}
                        autoFocus
                        size="small"
                      />
                      <Button onClick={() => renameRoute(selectedRoute, newRouteName)}>Guardar</Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6">
                        Detalles de la Ruta: {selectedRoute}
                      </Typography>
                      <IconButton onClick={() => { setEditingRoute(selectedRoute); setNewRouteName(selectedRoute); }}>
                        <BorderColorIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>


                {/* Validación de Datos */}
                {selectedRoute &&
                  groupedData[selectedRoute]?.rows?.length > 0 ? (
                  <>
                    <TableContainer>
                      <Grid
                        item
                        xs={12}
                        sm={4}
                        style={{ marginBottom: "20px" }}
                      >
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

                      <Table>
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
                            <TableRow
                              key={index}
                              style={{
                                backgroundColor:
                                  highlightedRow === index
                                    ? "#FFD700"
                                    : "inherit",
                                transition: "background-color 0.3s ease",
                              }}
                            >
                              <TableCell align="center">
                                <IconButton
                                  onClick={() =>
                                    moveRowUp(selectedRoute, index)
                                  }
                                  disabled={index === 0}
                                >
                                  <ArrowUpwardIcon
                                    fontSize="large"
                                    style={{
                                      color: index === 0 ? "#ccc" : "red",
                                    }}
                                  />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    moveRowDown(selectedRoute, index)
                                  }
                                  disabled={
                                    index ===
                                    groupedData[selectedRoute].rows.length - 1
                                  }
                                >
                                  <ArrowDownwardIcon
                                    fontSize="large"
                                    style={{
                                      color:
                                        index ===
                                          groupedData[selectedRoute].rows.length -
                                          1
                                          ? "#ccc"
                                          : "red",
                                    }}
                                  />
                                </IconButton>
                              </TableCell>
                              <TableCell>{row.FECHA}</TableCell>
                              <TableCell>{row["NO ORDEN"]}</TableCell>
                              <TableCell>{row["NO FACTURA"]}</TableCell>
                              <TableCell>{row["NUM. CLIENTE"]}</TableCell>
                              <TableCell>{row["NOMBRE DEL CLIENTE"]}</TableCell>
                              <TableCell>{row["ZONA"]}</TableCell>
                              <TableCell>{row.MUNICIPIO}</TableCell>
                              <TableCell>{row.ESTADO}</TableCell>

                              <TableCell>
                                {editingObservationId === row["NUM. CLIENTE"] ? (
                                  <TextField
                                    value={modalObservaciones[row["NUM. CLIENTE"]] || row["OBSERVACIONES"] || ""}
                                    onChange={(e) => handleSaveModalObservation(row["NUM. CLIENTE"], e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        setEditingObservationId(null); // Guardar y salir del modo edición al presionar "Enter"
                                      }
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
                          ))}

                          {/* Fila de Totales Generales */}
                          <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell colSpan={8} align="right">
                              <strong>Totales Generales:</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>
                                {formatCurrency(
                                  calculateTotals(selectedRoute).TOTAL
                                )}
                              </strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>
                                {calculateTotals(selectedRoute).PARTIDAS}
                              </strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>
                                {calculateTotals(selectedRoute).PIEZAS}
                              </strong>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Typography>
                    No hay datos disponibles para esta ruta.
                  </Typography>
                )}

                {/* Botón de Cerrar */}
                <Box textAlign="right" marginTop={2}>
                  <Button onClick={closeModal} variant="contained">
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

              {/* Tabla */}
              <Table>
                <TableHead>
                  <TableRow>
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
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} style={{ textAlign: "center" }}>
                        No hay datos disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, index) => (
                      <TableRow key={index}>
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
      {tabIndex === 1 && (user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans" || user?.role === "PQ1" || user?.role === "Control" || user?.role === "EB1" ||
        user?.role === "Paquet" || user?.role === "Embar") && (
          <Box marginTop={2}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Tipos de rutas
            </Typography>

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
                  label="Filtrar por Cliente, Orden o Estado"
                  variant="outlined"
                  size="small"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  style={{ marginBottom: 10, width: "300px" }}
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
                      {visibleColumns.includes("PARTIDAS") && (<TableCell>PARTIDAS</TableCell>)}
                      {visibleColumns.includes("PIEZAS") && (<TableCell>PIEZAS</TableCell>)}
                      {visibleColumns.includes("ZONA") && (<TableCell>ZONA</TableCell>)}
                      {visibleColumns.includes("TIPO DE ZONA") && (<TableCell>TIPO DE ZONA</TableCell>)}
                      {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>NUMERO DE FACTURA</TableCell>)}
                      {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>FECHA DE FACTURA</TableCell>)}
                      {visibleColumns.includes("FECHA DE EMBARQUE") && (<TableCell>FECHA DE EMBARQUE</TableCell>)}
                      {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (<TableCell>DIA EN QUE ESTA EN RUTA</TableCell>)}
                      {visibleColumns.includes("HORA DE SALIDA") && (<TableCell>HORA DE SALIDA</TableCell>)}
                      {visibleColumns.includes("CAJAS") && (<TableCell>CAJAS</TableCell>)}
                      {visibleColumns.includes("TARIMAS") && (<TableCell>TARIMAS</TableCell>)}
                      {visibleColumns.includes("TRANSPORTE") && (<TableCell>TRANSPORTE</TableCell>)}
                      {visibleColumns.includes("PAQUETERIA") && (<TableCell>PAQUETERIA</TableCell>)}
                      {visibleColumns.includes("GUIA") && (<TableCell>GUIA</TableCell>)}
                      {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>}
                      {visibleColumns.includes("FECHA ESTIMADA DE ENTREGA") && <TableCell>FECHA ESTIMADA DE ENTREGA</TableCell>}
                      {visibleColumns.includes("DIAS DE ENTREGA") && (<TableCell>DIAS DE ENTREGA</TableCell>)}
                      {visibleColumns.includes("ENTREGA SATISFACTORIA O NO SATISFACTORIA") && (<TableCell>ENTREGA SATISFACTORIA O NO SATISFACTORIA </TableCell>)}
                      {visibleColumns.includes("MOTIVO") && (<TableCell>MOTIVO</TableCell>)}
                      {visibleColumns.includes("NUMERO DE FACTURA LT") && (<TableCell>NUMERO DE FACTURA LT</TableCell>)}
                      {visibleColumns.includes("TOTAL FACTURA LT") && (<TableCell>TOTAL FACTURA LT</TableCell>)}
                      {visibleColumns.includes("PRORRATEO $ FACTURA LT") && (<TableCell>PRORRATEO $ FACTURA LT</TableCell>)}
                      {visibleColumns.includes("PRORRATEO $ FACTURA PAQUETERIA") && (<TableCell>PRORRATEO $ FACTURA PAQUETERIA</TableCell>
                      )}
                      {visibleColumns.includes("GASTOS EXTRAS") && (
                        <TableCell>GASTOS EXTRAS</TableCell>
                      )}
                      {visibleColumns.includes("SUMA FLETE") && (
                        <TableCell>SUMA FLETE</TableCell>
                      )}
                      {visibleColumns.includes("% ENVIO") && (
                        <TableCell>% ENVIO</TableCell>
                      )}
                      {visibleColumns.includes("% PAQUETERIA") && (
                        <TableCell>% PAQUETERIA</TableCell>
                      )}
                      {visibleColumns.includes("SUMA GASTOS EXTRAS") && (
                        <TableCell>SUMA GASTOS EXTRAS</TableCell>
                      )}
                      {visibleColumns.includes("% GLOBAL") && (
                        <TableCell>% GLOBAL</TableCell>
                      )}
                      {visibleColumns.includes("DIFERENCIA") && (
                        <TableCell>DIFERENCIA</TableCell>
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
                      paqueteriaFiltrada.map((routeData, index) => (
                        <TableRow key={index} onClick={() => handleRowClick(routeData)}>

                          {visibleColumns.includes("NO ORDEN") && (<TableCell>{routeData["NO ORDEN"]}</TableCell>)}
                          <TableCell>
                            <Typography variant="body1" gutterBottom>
                              Progreso: {routeData.progress || 0}%
                            </Typography>

                            <LinearProgress
                              variant="determinate"
                              value={routeData.progress || 0} // Valor de progreso
                              style={{
                                height: "10px",
                                borderRadius: "5px",
                                width: "100%",
                                marginTop: "5px",
                                backgroundColor: routeData.progress === 100 ? "#4CAF50" : "", // Fondo si es 100%
                              }}
                              sx={{
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: routeData.progress === 100 ? "#4CAF50" : "#FF5722", // Verde si es 100%, otro color si no
                                },
                              }}
                            />

                            <Typography
                              variant="body2"
                              color="textSecondary"
                              style={{ marginTop: "8px" }}
                            >
                              Estado: {routeData.statusText || "Cargando..."}
                            </Typography>
                          </TableCell>

                          {visibleColumns.includes("FECHA") && (<TableCell>{formatDate(routeData.FECHA)}</TableCell>)}
                          {visibleColumns.includes("NUM CLIENTE") && (<TableCell>{routeData["NUM. CLIENTE"]}</TableCell>)}
                          {visibleColumns.includes("NOMBRE DEL CLIENTE") && (<TableCell>{routeData["NOMBRE DEL CLIENTE"]}</TableCell>)}
                          {visibleColumns.includes("MUNICIPIO") && (<TableCell>{routeData.MUNICIPIO}</TableCell>)}
                          {visibleColumns.includes("ESTADO") && (<TableCell>{routeData.ESTADO}</TableCell>)}
                          {visibleColumns.includes("OBSERVACIONES") && (<TableCell>{routeData.OBSERVACIONES}</TableCell>)}
                          {visibleColumns.includes("TOTAL") && (<TableCell>{formatCurrency(routeData.TOTAL)}</TableCell>)}
                          {visibleColumns.includes("PARTIDAS") && (<TableCell>{routeData.PARTIDAS}</TableCell>)}
                          {visibleColumns.includes("PIEZAS") && (<TableCell>{routeData.PIEZAS}</TableCell>)}
                          {visibleColumns.includes("ZONA") && (<TableCell>{routeData.ZONA}</TableCell>)}
                          {visibleColumns.includes("TIPO DE ZONA") && (<TableCell>{routeData["TIPO DE ZONA"]}</TableCell>)}
                          {visibleColumns.includes("NUMERO DE FACTURA") && (<TableCell>{routeData["NO_FACTURA"]}</TableCell>)}
                          {visibleColumns.includes("FECHA DE FACTURA") && (<TableCell>{formatDate(routeData["FECHA DE FACTURA"])}</TableCell>)}
                          {visibleColumns.includes("FECHA DE EMBARQUE") && (<TableCell>{formatDate(routeData.ultimaFechaEmbarque)}</TableCell>)}
                          {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (<TableCell>{routeData["DIA EN QUE ESTA EN RUTA"]}</TableCell>)}
                          {visibleColumns.includes("HORA DE SALIDA") && (<TableCell>{routeData["HORA DE SALIDA"]}</TableCell>)}
                          {visibleColumns.includes("CAJAS") && (<TableCell>{routeData.totalCajas}</TableCell>)}
                          {visibleColumns.includes("TARIMAS") && (<TableCell>{routeData.TARIMAS}</TableCell>)}
                          {visibleColumns.includes("TRANSPORTE") && (<TableCell>{routeData.TRANSPORTE}</TableCell>)}
                          {visibleColumns.includes("PAQUETERIA") && (<TableCell>{routeData.PAQUETERIA}</TableCell>)}
                          {visibleColumns.includes("GUIA") && (<TableCell>{routeData.GUIA}</TableCell>)}
                          {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (<TableCell>{formatDate(routeData.FECHA_DE_ENTREGA_CLIENTE)}</TableCell>)}
                          {visibleColumns.includes("FECHA DE ENTREGA (CLIENTE)") && (<TableCell>{formatDate(routeData.FECHA_ESTIMADA_ENTREGA)}</TableCell>)}
                          {visibleColumns.includes("DIAS DE ENTREGA") && (<TableCell>{routeData.DIAS_DE_ENTREGA}</TableCell>)}
                          {visibleColumns.includes("ENTREGA SATISFACTORIA O NO SATISFACTORIA") && (<TableCell>{routeData.ENTREGA_SATISFACTORIA_O_NO_SATISFACTORIA}</TableCell>)}
                          {visibleColumns.includes("MOTIVO") && (
                            <TableCell>{routeData.MOTIVO}</TableCell>
                          )}
                          {visibleColumns.includes("NUMERO DE FACTURA LT") && (
                            <TableCell>
                              {routeData.NUMERO_DE_FACTURA_LT}
                            </TableCell>
                          )}
                          {visibleColumns.includes("TOTAL FACTURA LT") && (
                            <TableCell>{routeData.TOTAL_FACTURA_LT}</TableCell>
                          )}
                          {visibleColumns.includes(
                            "PRORRATEO $ FACTURA LT"
                          ) && (
                              <TableCell>
                                {routeData.PRORRATEO_FACTURA_LT}
                              </TableCell>
                            )}
                          {visibleColumns.includes(
                            "PRORRATEO $ FACTURA PAQUETERIA"
                          ) && (
                              <TableCell>
                                {routeData.PRORRATEO_FACTURA_PAQUETERIA}
                              </TableCell>
                            )}
                          {visibleColumns.includes("GASTOS EXTRAS") && (
                            <TableCell>{routeData.GASTOS_EXTRAS}</TableCell>
                          )}
                          {visibleColumns.includes("SUMA FLETE") && (
                            <TableCell>{routeData.SUMA_FLETE}</TableCell>
                          )}
                          {visibleColumns.includes("% ENVIO") && (
                            <TableCell>{routeData.PORCENTAJE_ENVIO}</TableCell>
                          )}
                          {visibleColumns.includes("% PAQUETERIA") && (
                            <TableCell>
                              {routeData.PORCENTAJE_PAQUETERIA}
                            </TableCell>
                          )}
                          {visibleColumns.includes("SUMA GASTOS EXTRAS") && (
                            <TableCell>
                              {routeData.SUMA_GASTOS_EXTRAS}
                            </TableCell>
                          )}
                          {visibleColumns.includes("% GLOBAL") && (
                            <TableCell>{routeData.PORCENTAJE_GLOBAL}</TableCell>
                          )}
                          {visibleColumns.includes("DIFERENCIA") && (
                            <TableCell>{routeData.DIFERENCIA}</TableCell>
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
                                {(user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans") && (
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
                                {(user?.role === "Admin" || user?.role === "Trans") && (
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
                  label="Filtrar por Cliente, Orden o Estado"
                  variant="outlined"
                  size="small"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  style={{ marginBottom: 10, width: "300px" }}
                />
                <br />

                {(user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans") && (
                  <Button
                    onClick={handleGenerateExcel}
                    variant="contained"
                    color="primary"
                  >
                    Generar Excel
                  </Button>
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
                      {visibleColumns.includes("PARTIDAS") && (
                        <TableCell>PARTIDAS</TableCell>
                      )}
                      {visibleColumns.includes("PIEZAS") && (
                        <TableCell>PIEZAS</TableCell>
                      )}
                      {visibleColumns.includes("ZONA") && (
                        <TableCell>ZONA</TableCell>
                      )}
                      {visibleColumns.includes("TIPO DE ZONA") && (
                        <TableCell>TIPO DE ZONA</TableCell>
                      )}
                      {visibleColumns.includes("NUMERO DE FACTURA") && (
                        <TableCell>NUMERO DE FACTURA</TableCell>
                      )}
                      {visibleColumns.includes("FECHA DE FACTURA") && (
                        <TableCell>FECHA DE FACTURA</TableCell>
                      )}
                      {visibleColumns.includes("FECHA DE EMBARQUE") && (
                        <TableCell>FECHA DE EMBARQUE</TableCell>
                      )}
                      {visibleColumns.includes("DIA EN QUE ESTA EN RUTA") && (
                        <TableCell>DIA EN QUE ESTA EN RUTA</TableCell>
                      )}
                      {visibleColumns.includes("CAJAS") && (
                        <TableCell>CAJAS</TableCell>
                      )}
                      {visibleColumns.includes("TRANSPORTE") && (
                        <TableCell>TRANSPORTE</TableCell>
                      )}
                      {visibleColumns.includes("PAQUETERIA") && (
                        <TableCell>PAQUETERIA</TableCell>
                      )}
                      {visibleColumns.includes(
                        "FECHA DE ENTREGA (CLIENTE)"
                      ) && <TableCell>FECHA DE ENTREGA (CLIENTE)</TableCell>}
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
                      directaFiltrada.map((routeData, index) => (
                        <TableRow key={index}>
                          {visibleColumns.includes("NO ORDEN") && (
                            <TableCell>{routeData["NO ORDEN"]}</TableCell>
                          )}
                          <TableCell>
                            <Typography variant="body1" gutterBottom>
                              Progreso: {routeData.progress || 0}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={routeData.progress || 0} // Valor de progreso
                              style={{
                                height: "10px",
                                borderRadius: "5px",
                                width: "100%",
                                marginTop: "5px",
                                backgroundColor: routeData.progress === 100 ? "#4CAF50" : "", // Fondo si es 100%
                              }}
                              sx={{
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: routeData.progress === 100 ? "#4CAF50" : "#FF5722", // Verde si es 100%, otro color si no
                                },
                              }}
                            />

                            <Typography
                              variant="body2"
                              color="textSecondary"
                              style={{ marginTop: "8px" }}
                            >
                              Estado: {routeData.statusText || "Cargando..."}
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
                          {visibleColumns.includes("PARTIDAS") && (
                            <TableCell>{routeData.PARTIDAS}</TableCell>
                          )}
                          {visibleColumns.includes("PIEZAS") && (
                            <TableCell>{routeData.PIEZAS}</TableCell>
                          )}
                          {visibleColumns.includes("ZONA") && (
                            <TableCell>{routeData.ZONA}</TableCell>
                          )}
                          {visibleColumns.includes("TIPO DE ZONA") && (
                            <TableCell>{routeData["TIPO DE ZONA"]}</TableCell>
                          )}
                          {visibleColumns.includes("NUMERO DE FACTURA") && (
                            <TableCell>{routeData["NO_FACTURA"]}</TableCell>
                          )}
                          {visibleColumns.includes("FECHA DE FACTURA") && (
                            <TableCell>
                              {formatDate(routeData["FECHA_DE_FACTURA"])}
                            </TableCell>
                          )}
                          {visibleColumns.includes("FECHA DE EMBARQUE") && (
                            <TableCell>
                              {formatDate(routeData.ultimaFechaEmbarque)}
                            </TableCell>
                          )}
                          {visibleColumns.includes(
                            "DIA EN QUE ESTA EN RUTA"
                          ) && (
                              <TableCell>
                                {formatDate(routeData.ultimaFechaEmbarque)}
                              </TableCell>
                            )}
                          {visibleColumns.includes("CAJAS") && (
                            <TableCell>{routeData.totalCajas}</TableCell>
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
                              <Grid
                                container
                                spacing={1}
                                justifyContent="flex-start"
                                alignItems="center"
                              >
                                <Grid item>

                                  <Grid item>
                                    {(user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans") && (
                                      <IconButton
                                        onClick={() => {
                                          window.open("https://app2.simpliroute.com/#/planner/vehicles", "_blank");
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
                                    onClick={() => openDirectaModal(routeData)}
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
                                  {(user?.role === "Admin" || user?.role === "Trans") && (
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
                  label="Filtrar por Cliente, Orden o Estado"
                  variant="outlined"
                  size="small"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  style={{ marginBottom: 10, width: "300px" }}
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
                    ) : (ventaEmpleadoFiltrada.map((routeData, index) => (
                      <TableRow key={index}>
                        {visibleColumns.includes("NO ORDEN") && (
                          <TableCell>{routeData["NO ORDEN"]}</TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body1" gutterBottom>
                            Progreso: {routeData.progress || 0}%
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={routeData.progress || 0} // Valor de progreso
                            style={{
                              height: "10px",
                              borderRadius: "5px",
                              width: "100%",
                              marginTop: "5px",
                              backgroundColor: routeData.progress === 100 ? "#4CAF50" : "", // Fondo si es 100%
                            }}
                            sx={{
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: routeData.progress === 100 ? "#4CAF50" : "#FF5722", // Verde si es 100%, otro color si no
                              },
                            }}
                          />


                          <Typography
                            variant="body2"
                            color="textSecondary"
                            style={{ marginTop: "8px" }}
                          >
                            Estado: {routeData.statusText || "Cargando..."}
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
                                    user?.role === "Trans") && (
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
            {tabIndex === 1 && (user?.role === "Admin" || user?.role === "Master" || user?.role === "Trans") && subTabIndex === 3 && (
              <TableContainer
                component={Paper}
                style={{ marginTop: "20px", padding: "20px" }}
              >
                <Typography variant="h6">Asignación de transporte</Typography>

                <Table>
                  <TableHead>
                    <TableRow>
                      {visibleColumns.includes("NO ORDEN") && (
                        <TableCell>NO ORDEN</TableCell>
                      )}
                      {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                      )}
                      {visibleColumns.includes("TRANSPORTE") && (
                        <TableCell>TRANSPORTE</TableCell>
                      )}
                      {visibleColumns.includes("TRANSPORTISTA") && (
                        <TableCell>TRANSPORTISTA</TableCell>
                      )}
                      {visibleColumns.includes("CLAVE") && (
                        <TableCell>CLAVE</TableCell>
                      )}
                      {visibleColumns.includes("EMPRESA") && (
                        <TableCell>EMPRESA</TableCell>
                      )}
                      {visibleColumns.includes("REG_ENTRADA") && (
                        <TableCell>FECHA DE ENTRADA</TableCell>
                      )}
                      {visibleColumns.includes("ACCIONES") && (
                        <TableCell>ACCIONES</TableCell>
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {directaData.length === 0 &&
                      paqueteriaData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={visibleColumns.length}
                          style={{ textAlign: "center" }}
                        >
                          No hay datos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...directaData, ...paqueteriaData].map(
                        (routeData, index) => (
                          <TableRow key={index}>
                            {visibleColumns.includes("NO ORDEN") && (
                              <TableCell>{routeData["NO ORDEN"]}</TableCell>
                            )}
                            {visibleColumns.includes("NUM CLIENTE") && (
                              <TableCell>
                                {routeData["NUM. CLIENTE"]}
                              </TableCell>
                            )}
                            {visibleColumns.includes(
                              "NOMBRE DEL CLIENTE"
                            ) && (
                                <TableCell>
                                  {routeData["NOMBRE DEL CLIENTE"]}
                                </TableCell>
                              )}
                            {visibleColumns.includes("TRANSPORTE") && (
                              <TableCell>{routeData.TRANSPORTE}</TableCell>
                            )}

                            {visibleColumns.includes("TRANSPORTISTA") && (
                              <TableCell>
                                <TextField
                                  select
                                  value={routeData.transportista || ""}
                                  onChange={(e) =>
                                    handleRowChange(
                                      index,
                                      "transportista",
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  label="Transportista"
                                  disabled={routeData.insertado}
                                >
                                  {transportistaData.map((item, tIndex) => (
                                    <MenuItem
                                      key={tIndex}
                                      value={`${item.nombre} ${item.apellidos}`}
                                    >
                                      {item.nombre} {item.apellidos}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                            )}

                            {visibleColumns.includes("CLAVE") && (
                              <TableCell>
                                {routeData.clave || "Sin clave asignada"}
                              </TableCell>
                            )}

                            {visibleColumns.includes("EMPRESA") && (
                              <TableCell>
                                <TextField
                                  select
                                  value={
                                    routeData.id_veh
                                      ? String(routeData.id_veh)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    // console.log( "🏢 Empresa seleccionada en el select:", e.target.value);
                                    handleRowChange(
                                      index,
                                      "id_veh",
                                      e.target.value
                                    );
                                  }}
                                  variant="outlined"
                                  fullWidth
                                  label="Empresa"
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 48 * 5 + 8,
                                        width: 300,
                                      },
                                    },
                                  }}
                                >
                                  <MenuItem value="">
                                    Seleccionar empresa
                                  </MenuItem>
                                  {empresaData.map((item, eIndex) => (
                                    <MenuItem
                                      key={eIndex}
                                      value={String(item.id_veh)}
                                    >
                                      {`${item.empresa} - ${item.marca} (${item.placa})`}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                            )}

                            {visibleColumns.includes("REG_ENTRADA") && (
                              <TableCell>
                                <TextField
                                  type="date"
                                  value={routeData.reg_entrada || ""}
                                  onChange={(e) =>
                                    handleRowChange(
                                      index,
                                      "reg_entrada",
                                      e.target.value
                                    )
                                  }
                                  fullWidth
                                  disabled={routeData.insertado}
                                />
                              </TableCell>
                            )}

                            {visibleColumns.includes("ACCIONES") && (
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => {
                                    // console.log("🟡 Insertar visita clickeado",routeData);
                                    handleInsertarVisita(routeData, index);
                                  }}
                                  disabled={routeData.insertado}
                                >
                                  Insertar
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      )
                    )}
                  </TableBody>
                </Table>
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

            {visibleColumns.includes("PAQUETERIA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Paquetería"
                  value={paqueteria}
                  onChange={(e) => setPaqueteria(e.target.value)}
                  variant="outlined"
                  fullWidth
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
                  value={diasEntrega}
                  variant="outlined"
                  fullWidth
                  disabled // 🔥 Este campo se llena automáticamente
                />
              </Grid>
            )}

            {/* Fila 3 */}
            {visibleColumns.includes(
              "ENTREGA SATISFACTORIA O NO SATISFACTORIA"
            ) && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Entrega Satisfactoria"
                    value={entregaSatisfactoria}
                    onChange={(e) => setEntregaSatisfactoria(e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
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

            {visibleColumns.includes("PRORRATEO $ FACTURA LT") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prorateo Factura LT"
                  value={prorateoFacturaLT} // Este es el valor que proviene del estado
                  onChange={handleProrateoFacturaLTChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {/* Fila 5 */}
            {visibleColumns.includes("PRORRATEO $ FACTURA PAQUETERIA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prorateo Factura Paquetería"
                  value={prorateoFacturaPaqueteria || ""} // Evita valores nulos
                  onChange={(e) => {
                    const value = e.target.value.replace(",", "."); // Reemplaza comas por puntos
                    const parsedValue = parseFloat(value);
                    setProrateoFacturaPaqueteria(
                      isNaN(parsedValue) ? 0 : parsedValue
                    ); // Si es NaN, guarda 0
                  }}
                  variant="outlined"
                  fullWidth
                  type="text"
                />
              </Grid>
            )}

            {visibleColumns.includes("GASTOS EXTRAS") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gastos Extras"
                  value={gastosExtras}
                  onChange={(e) => setGastosExtras(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            )}

            {/* Fila 6 */}
            {visibleColumns.includes("SUMA FLETE") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Suma Flete"
                  value={sumaFlete} // Aquí se debe mostrar el valor de la suma
                  variant="outlined"
                  fullWidth
                  disabled
                />
              </Grid>
            )}

            {visibleColumns.includes("% ENVIO") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="% Envio"
                  value={porcentajeEnvio}
                  onChange={(e) => setPorcentajeEnvio(e.target.value)} // Puedes dejar el onChange, pero no deberías modificar manualmente este campo
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true, // Hacer que el campo sea solo lectura
                  }}
                />
              </Grid>
            )}

            {/* Fila 7 */}
            {visibleColumns.includes("% PAQUETERIA") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="% Paquetería"
                  value={porcentajePaqueteria || ""} // Asegúrate de que si el valor es nulo o indefinido, se maneje correctamente
                  onChange={(e) => setPorcentajePaqueteria(e.target.value)} // Este onChange es opcional si deseas modificar el campo manualmente
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true, // Hacer el campo solo lectura para evitar que el usuario modifique el valor manualmente
                  }}
                />
              </Grid>
            )}

            {visibleColumns.includes("SUMA GASTOS EXTRAS") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Suma Gastos Extras"
                  value={sumaGastosExtras} // Aquí se mostrará la suma calculada
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true, // Hace que el campo sea de solo lectura
                  }}
                />
              </Grid>
            )}

            {/* Fila 8 */}
            {visibleColumns.includes("% GLOBAL") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Porcentaje Global"
                  value={porcentajeGlobal} // ✅ Aquí se refleja el resultado
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true, // Para que no se edite manualmente
                  }}
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
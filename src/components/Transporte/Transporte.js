import React, { useState, useEffect, useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { UserContext } from "../context/UserContext";
import ArticleIcon from "@mui/icons-material/Article";
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
} from "@mui/material";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./logos.jpg";

const hasExpired = (timestamp) => {
  const now = new Date().getTime();
  return now - timestamp > 24 * 60 * 60 * 1000;
};

function Transporte() {
  const allowedRoles = new Set(["Admin", "Master", "Trans"]);

  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [newRoute, setNewRoute] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActionRoute, setSelectedActionRoute] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [observaciones, setObservaciones] = useState({});
  const [observacionesPorRegistro, setObservacionesPorRegistro] = useState({});
  const [loadingObservacionId, setLoadingObservacionId] = useState(null);
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

  // Modal para editar "TOTAL FACTURA LT"
  const openTotalFacturaLTModal = (noOrden, currentValue) => {
    setSelectedNoOrden(noOrden);
    setTotalFacturaLT(currentValue); // Asigna el valor actual de TOTAL FACTURA LT
    setGuiaModalOpen(true); // Abre el modal
  };

  // Función para cambiar la subpestaña
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
  }, [data, groupedData, sentRoutesData]); // Actualizamos cuando cambia cualquier dato

  useEffect(() => {
    fetchPaqueteriaRoutes(); // Llama a la API para cargar las rutas de paquetería
  }, []); // Se ejecuta una vez al montar el componente

  useEffect(() => {
    console.log("Datos de la paquetería:", sentRoutesData); // Verifica el estado
  }, [sentRoutesData]); // Esto se ejecuta cada vez que `sentRoutesData` cambia

  useEffect(() => {
    // Recorre todos los clientes de la segunda tabla para obtener sus observaciones
    sentRoutesData.forEach((routeData) => {
      // Verifica si la observación ya está cargada
      if (!observacionesPorRegistro[routeData["NUM. CLIENTE"]]) {
        // Si no está cargada, llama a la API para cargarla
        fetchObservacionPorRegistro(routeData["NUM. CLIENTE"]);
      }
    });
  }, [sentRoutesData]); // Este efecto se ejecuta cuando los datos en la segunda tabla cambian

  useEffect(() => {
    // Filtrar datos según el tipo
    const paqueteria = sentRoutesData.filter(
      (routeData) => routeData.TIPO === "paqueteria"
    );
    const directa = sentRoutesData.filter(
      (routeData) => routeData.TIPO === "Directa"
    );
    const ventaEmpleado = sentRoutesData.filter(
      (routeData) => routeData.TIPO === "venta empleado"
    );

    // Actualizar el estado con los datos filtrados
    setPaqueteriaData(paqueteria);
    setDirectaData(directa);
    setVentaEmpleadoData(ventaEmpleado);
  }, [sentRoutesData]); // Se ejecuta cada vez que cambian los datos

  const exportToImage = () => {
    // Captura el contenedor con los datos
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

  // Formatear números como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  // Mapear columnas del Excel
  const mapColumns = (row) => ({
    RUTA: "Sin Ruta",
    FECHA: row["Fecha Lista Surtido"],
    "NO ORDEN": row["No Orden"] || row["__EMPTY_1"] || "",
    "NO FACTURA": row["No Factura"] || row["__EMPTY_4"] || "",
    "NUM. CLIENTE": row["Cliente"] || row["__EMPTY_8"] || "",
    "NOMBRE DEL CLIENTE": row["Nombre Cliente"] || row["__EMPTY_11"] || "",
    Codigo_Postal: row["Codigo Postal"] || row["__EMPTY_14"] || "",
    ZONA: row["Zona"] || row["__EMPTY_10"] || "",
    MUNICIPIO:
      row["Municipio"] ||
      row["Municipo"] ||
      row["__EMPTY_12"] ||
      row["__EMPTY_13"] ||
      "", // Ajustado
    ESTADO: row["Estado"] || row["__EMPTY_15"] || "",
    OBSERVACIONES: "",
    TOTAL:
      parseFloat(
        String(row["Total"] || row["__EMPTY_21"] || "0").replace(",", "")
      ) || 0,
    PARTIDAS: Number(row["Partidas"] || row["__EMPTY_22"] || 0),
    PIEZAS: Number(row["Cantidad"] || row["__EMPTY_23"] || 0),
    // Guardar los datos de la dirección y contacto
    DIRECCION: `${row["Calle"] || ""} ${row["Colonia"] || ""} ${
      row["Municipio"] || ""
    } ${row["Codigo Postal"] || ""} ${row["Estado"] || ""}`,
    CORREO: row["E-mail"] || "",
    TELEFONO: row["No. Telefonico"] || "",
  });

  // Cargar archivo Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Filtrar los datos para que solo se muestren los que tengan "Lista Surtido" en la columna "Estatus"
      const filteredData = jsonData.filter(
        (row) => row["Estatus"] === "Lista Surtido"
      );

      // Mapea los datos filtrados
      const mappedData = filteredData
        .map(mapColumns)
        .filter((row) => row["NO ORDEN"]);

      // Establece los datos filtrados y mapeados en el estado
      setData(mappedData);
    };
    reader.readAsBinaryString(file);
  };

  // Función para limpiar la dirección
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

  // Crear una nueva ruta
  const addRoute = () => {
    if (newRoute && !groupedData[newRoute]) {
      setGroupedData({
        ...groupedData,
        [newRoute]: { TOTAL: 0, PARTIDAS: 0, PIEZAS: 0, rows: [] },
      });
      setNewRoute("");
    }
  };

  // Asignar un elemento a una ruta específica
  const assignToRoute = (item, route) => {
    setGroupedData((prev) => {
      const updatedRoute = prev[route] || {
        TOTAL: 0,
        PARTIDAS: 0,
        PIEZAS: 0,
        rows: [],
      };

      updatedRoute.rows.push(item);
      updatedRoute.TOTAL += item.TOTAL;
      updatedRoute.PARTIDAS += item.PARTIDAS;
      updatedRoute.PIEZAS += item.PIEZAS;

      return { ...prev, [route]: updatedRoute };
    });

    setData((prevData) => prevData.filter((row) => row !== item));
  };

  // Mostrar modal con detalles de la ruta
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

  // Calcular Totales
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
    localStorage.removeItem("transporteData");
    localStorage.removeItem("transporteTimestamp");
    setData([]);
    handleSnackbarOpen(
      "Datos eliminados correctamente. Carga un nuevo archivo Excel para comenzar."
    );
  };

  // Llamada para obtener las rutas de paquetería
  const fetchPaqueteriaRoutes = async () => {
    try {
      const response = await fetch("http://192.168.3.27:3007/api/Trasporte/rutas");
      const data = await response.json();

      if (Array.isArray(data)) {
        // Por cada ruta, obtener datos adicionales
        const enrichedData = await Promise.all(
          data.map(async (routeData) => {
            // Llamada a la API para obtener los detalles adicionales
            const additionalData = await fetchAdditionalData(
              routeData["NO ORDEN"]
            );
            return {
              ...routeData,
              ...additionalData, // Combina los datos de la primera API con los datos adicionales
            };
          })
        );

        // Establecer los datos combinados en el estado
        setSentRoutesData(enrichedData);
      } else {
        console.error("No se encontraron rutas de paquetería");
      }
    } catch (error) {
      console.error("Error al obtener las rutas de paquetería:", error.message);
    }
  };

  // Función en el frontend para obtener la fecha de embarque y el total de cajas
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

  const fetchObservacionPorRegistro = async (venta) => {
    try {
      setLoadingObservacionId(venta); // Mostrar loading en el registro actual
      const response = await fetch(
        `http://192.168.3.27:3007/api/Trasporte/clientes/observaciones/${venta}`
      );
      const data = await response.json();

      setObservacionesPorRegistro((prev) => ({
        ...prev,
        [venta]: data.observacion || "Sin observaciones disponibles",
      }));
    } catch (error) {
      console.error("Error al obtener observaciones:", error.message);
      setObservacionesPorRegistro((prev) => ({
        ...prev,
        [venta]: "Error al obtener observaciones",
      }));
    } finally {
      setLoadingObservacionId(null); // Finalizar loading
    }
  };

  const handleSelectRoute = (route) => {
    console.log("Ruta seleccionada:", route);
    console.log("Datos de la ruta:", groupedData[route]);

    setSelectedRoutes((prevRoutes) => {
      if (prevRoutes.includes(route)) {
        return prevRoutes.filter((r) => r !== route); // Desmarcar ruta
      } else {
        return [...prevRoutes, route]; // Marcar ruta
      }
    });
  };

  const handleSendRoutes = async () => {
    if (selectedRoutes.length > 0) {
      const newSentRoutesData = [];

      selectedRoutes.forEach((route) => {
        const routeData = groupedData[route];

        if (routeData && routeData.rows) {
          routeData.rows.forEach((row) => {
            newSentRoutesData.push({
              ...row, // Mantener todos los detalles de la fila
              routeName: route, // Mantener el nombre de la ruta
              OBSERVACIONES:
                observacionesPorRegistro[row["NUM. CLIENTE"]] ||
                "Sin observaciones disponibles",
              TIPO: tipoRuta, // Aquí agregamos el tipo de ruta
            });
          });
        } else {
          console.warn(`Ruta ${route} no tiene datos o filas definidas.`);
        }
      });

      // Verifica que estás enviando todos los datos
      console.log("Datos enviados a la base de datos:", newSentRoutesData);

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
          console.log("Rutas insertadas:", result);
          handleSnackbarOpen("Rutas enviadas con éxito y registradas.");

          // Agregar los datos a la segunda tabla
          setSentRoutesData((prevData) => [...prevData, ...newSentRoutesData]);

          // Eliminar las rutas de groupedData después de enviarlas
          setGroupedData((prevData) => {
            const newGroupedData = { ...prevData };
            selectedRoutes.forEach((route) => {
              delete newGroupedData[route]; // Eliminar la ruta de groupedData
            });
            return newGroupedData;
          });
        } else {
          handleSnackbarOpen("Hubo un error al registrar las rutas.");
        }
      } catch (error) {
        console.error("Error al enviar las rutas:", error);
        handleSnackbarOpen("Error al enviar las rutas.");
      }

      setConfirmSendModalOpen(false); // Cerrar el modal después de enviar
    } else {
      handleSnackbarOpen("Por favor, selecciona al menos una ruta.");
    }
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convierte el string de fecha a un objeto Date
    if (isNaN(date)) {
      return "Fecha inválida"; // Si no se puede convertir a fecha, devuelve 'Fecha inválida'
    }
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return date.toLocaleDateString(undefined, options); // Devuelve la fecha formateada
  };

  // Usar esta función cuando el usuario hace clic en "Mandar a Paquetería"
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
    const clientes = new Set(); // Usamos un Set para asegurar que los clientes sean únicos

    rutasSeleccionadas.forEach((route) => {
      const routeData = groupedData[route];
      if (routeData && routeData.rows) {
        // Verificamos si hay datos de esa ruta
        routeData.rows.forEach((row) => {
          // Aseguramos que estamos agregando correctamente al Set
          clientes.add(row["NUM. CLIENTE"]);
        });
      }
    });

    return clientes.size; // El tamaño del Set nos da el total de clientes únicos
  };

  // Función para obtener el total de pedidos
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

  // Función para obtener el total general
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

  // Función para actualizar la guía
  const actualizarGuia = async () => {
    console.log(
      "Actualizando guía para el NO ORDEN:",
      selectedNoOrden,
      "Guía:",
      guia
    );

    if (!selectedNoOrden || !guia) {
      alert("Error: No se proporcionó el noOrden o la guía");
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.3.27:3007/api/Trasporte/paqueteria/actualizar-guia",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            noOrden: selectedNoOrden, // Pasamos el noOrden
            guia: guia, // Pasamos la nueva guía
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        handleSnackbarOpen("Guía actualizada correctamente.");
        setGuia(""); // Limpiar el campo de la guía
        setSelectedNoOrden(null); // Limpiar el noOrden
        closeGuiaModal(); // Cerramos el modal

        const updatedRoutesData = [...sentRoutesData];
        const updatedRouteIndex = updatedRoutesData.findIndex(
          (route) => route["NO ORDEN"] === selectedNoOrden
        );
        if (updatedRouteIndex !== -1) {
          updatedRoutesData[updatedRouteIndex].GUIA = guia;
        }

        setSentRoutesData(updatedRoutesData); // Actualizamos el estado de las rutas
      } else {
        alert("Error al actualizar la guía");
      }
    } catch (error) {
      console.error("Error al actualizar la guía:", error);
      alert("Hubo un error al actualizar la guía");
    }
  };

  const openGuiaModal = (noOrden, guia) => {
    setSelectedNoOrden(noOrden); // Asignamos el noOrden
    setGuia(guia); // Asignamos la guía actual
    setGuiaModalOpen(true); // Abrimos el modal de actualización de la guía
  };

  // Función para cerrar el modal de actualización de guía
  const closeGuiaModal = () => {
    setGuiaModalOpen(false);
    setGuia(""); // Limpiar el campo de la guía
  };

  const getVisibleColumns = (role) => {
    // Definir todas las columnas posibles
    const allColumns = [
      {
        name: "NO ORDEN",
        role: ["Admin", "Master", "Trans", "PQ1", "Control", "EB1"],
      },
      { name: "FECHA", role: ["Admin", "Master", "Trans", "PQ1", "EB1"] },
      { name: "NUM CLIENTE", role: ["Admin", "Master", "Trans", "PQ1", "EB1"] },
      {
        name: "NOMBRE DEL CLIENTE",
        role: ["Admin", "Master", "Trans", "PQ1", "EB1"],
      },
      { name: "MUNICIPIO", role: ["Admin", "Master", "Trans", "PQ1", "EB1"] },
      { name: "ESTADO", role: ["Admin", "Master", "Trans", "PQ1", "EB1"] },
      { name: "OBSERVACIONES", role: ["Admin", "Master", "Trans", "PQ1"] },
      { name: "TOTAL", role: ["Admin", "Master", "Trans", "PQ1"] },
      { name: "PARTIDAS", role: ["Admin", "Master", "Trans"] },
      { name: "PIEZAS", role: ["Admin", "Master", "Trans"] },
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
        role: ["Admin", "Master", "Trans", "EB1"],
      },
      { name: "HORA DE SALIDA", role: ["Admin", "Master", "Trans", "EB1"] },
      { name: "CAJAS", role: ["Admin", "Master", "Trans", "PQ1", "PQ1"] },
      { name: "TARIMAS", role: ["Admin", "Master", "Trans", "PQ1"] },
      { name: "TRANSPORTE", role: ["Admin", "Master", "Trans", "PQ1"] },
      { name: "PAQUETERIA", role: ["Admin", "Master", "Trans", "PQ1"] },
      { name: "GUIA", role: ["Admin", "Master", "Trans", "PQ1"] },
      {
        name: "FECHA DE ENTREGA (CLIENTE)",
        role: ["Admin", "Master", "Trans"],
      },
      { name: "DIAS DE ENTREGA", role: ["Admin", "Master", "Trans"] },
      {
        name: "ENTREGA SATISFACTORIA O NO SATISFACTORIA",
        role: ["Admin", "Master", "Trans"],
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
        role: ["Admin", "Master", "Trans", "PQ1", "Control"],
      },
    ];

    return allColumns
      .filter((col) => col.role.includes(role))
      .map((col) => col.name);
  };

  const visibleColumns = getVisibleColumns(user?.role);

  const handleGenerateExcel = () => {
    const groupedData = {};

    sentRoutesData.forEach((row) => {
      const clientId = row["NUM. CLIENTE"];

      if (!groupedData[clientId]) {
        groupedData[clientId] = {
          clientName: row["NOMBRE DEL CLIENTE"],
          referenceIds: [row["NO ORDEN"]],
          contactInfo: {
            phone: row["TELEFONO"] || "", // Aseguramos que si no hay teléfono, pongamos un valor por defecto
            email: row["CORREO"] || "", // Aseguramos que si no hay correo, pongamos un valor por defecto
          },
          transporte: row["TRANSPORTE"] || "No disponible", // Asignamos el valor de Transporte
          orders: [],
        };
      } else {
        groupedData[clientId].referenceIds.push(row["NO ORDEN"]);
      }

      // Limpiar la dirección antes de almacenarla
      groupedData[clientId].contactInfo.address = cleanAddress(
        row["DIRECCION"]
      );

      groupedData[clientId].orders.push(row);
    });

    const exportData = Object.keys(groupedData).map((clientId) => {
      const clientData = groupedData[clientId];

      return {
        "Nombre Vehiculo": clientData.transporte, // Columna de Transporte
        "Titulo de la Visita": clientData.clientName,
        Dirección: clientData.contactInfo.address, // Dirección limpia
        Latitud: "", // Columna vacía
        Longitud: "", // Columna vacía
        "ID Referencia": clientData.orders
          .map((order) => order["NO ORDEN"])
          .join(", "), // Muestra las órdenes
        "Persona de contacto": "", // Columna vacía
        Telefono: clientData.contactInfo.phone, // Teléfono separado
        Correo: clientData.contactInfo.email, // Correo separado
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData, {
      header: [
        "Nombre Vehiculo",
        "Titulo de la Visita",
        "Dirección",
        "Latitud",
        "Longitud",
        "",
        "ID Referencia",
        "Persona de contacto",
      ],
    });

    // Establecer anchos personalizados para las columnas
    ws["!cols"] = [
      { wch: 20 }, // Nombre Vehiculo
      { wch: 40 }, // Titulo de la Visita
      { wch: 50 }, // Dirección
      { wch: 10 }, // Latitud
      { wch: 10 }, // Longitud
      { wch: 20 }, // ID Referencia
      { wch: 30 }, // Persona de contacto
      { wch: 20 }, // Correo
      { wch: 20 }, // Teléfono
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos Agrupados");
    XLSX.writeFile(wb, "Datos_Agrupados.xlsx");
  };

  const generatePDF = async (pedido) => {
    try {
      // Obtener los datos del pedido usando el número de orden
      const response = await fetch(
        `http://192.168.3.27:3007/api/Trasporte/embarque/${pedido}`
      );
      if (!response.ok) throw new Error("Error al obtener datos del pedido");
      const data = await response.json();
      console.log("Datos recibidos del pedido:", data); // Verifica los datos

      if (!Array.isArray(data) || data.length === 0) {
        alert("No hay datos disponibles para este pedido.");
        return; // Salir si no hay datos
      }

      // Dividir los productos en dos categorías: con caja (Caja > 0) y sin caja (Caja === 0)
      const productosConCaja = data.filter((item) => item.caja > 0);
      const productosSinCaja = data.filter((item) => item.caja === 0);

      // Crear instancia de jsPDF
      const doc = new jsPDF();

      // Insertar el logo
      doc.addImage(logo, "JPEG", 10, 10, 80, 20);

      // Encabezado del pedido
      doc.setFontSize(12);
      doc.text(`VT.${pedido}`, 150, 15);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 25);

      // Agrupar los productos con cajas según el número de caja
      const cajasAgrupadas = productosConCaja.reduce((groups, item) => {
        if (!groups[item.caja]) {
          groups[item.caja] = [];
        }
        groups[item.caja].push(item);
        return groups;
      }, {});

      // Mostrar la tabla de totales (PZ, INNER, MASTER, Total Productos)
      let totalPZ = 0;
      let totalINNER = 0;
      let totalMASTER = 0;
      let totalProductos = 0;

      // Calcular los totales por producto
      productosConCaja.forEach((item) => {
        totalPZ += item._pz || 0;
        totalINNER += item._inner || 0;
        totalMASTER += item._master || 0;
        totalProductos += item.cantidad || 0;
      });

      // Calcular los totales para productos sin caja
      productosSinCaja.forEach((item) => {
        totalPZ += item._pz || 0;
        totalINNER += item._inner || 0;
        totalMASTER += item._master || 0;
        totalProductos += item.cantidad || 0;
      });

      // Crear la tabla para mostrar los totales
      doc.autoTable({
        startY: 40,
        head: [
          [
            "PZ",
            "INNER",
            "MASTER",
            "Total Productos",
            "Caja 1",
            "Caja 2",
            "Caja 3",
          ],
        ],
        body: [
          [
            totalPZ,
            totalINNER,
            totalMASTER,
            totalProductos,
            cajasAgrupadas[1]?.length || 0, // Productos en Caja 1
            cajasAgrupadas[2]?.length || 0, // Productos en Caja 2
            cajasAgrupadas[3]?.length || 0,
          ],
        ], // Productos en Caja 3
        theme: "grid",
        styles: {
          halign: "center",
          fontSize: 10,
          cellPadding: 1,
          fillColor: [255, 255, 255], // Color blanco
          textColor: [0, 0, 0], // Color negro
        },
        headStyles: {
          fontStyle: "bold",
          textColor: 0,
        },
        tableWidth: "auto", // Ajuste automático al contenido
        margin: { left: 10 }, // Alinear a la izquierda
      });

      // Mostrar productos sin caja
      if (productosSinCaja.length > 0) {
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 10,
          head: [["Productos sin caja"]],
          body: [],
          theme: "grid",
          styles: {
            halign: "center",
            fontSize: 10,
            cellPadding: 1,
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          headStyles: {
            fontStyle: "bold",
            textColor: 0,
            fillColor: [255, 255, 255],
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
              "PZ",
              "PQ",
              "INNER",
              "MASTER",
              "Validar",
            ],
          ],
          body: productosSinCaja.map((item) => [
            item.codigo_ped || "",
            item.des || "",
            item.cantidad || "",
            item.um || "",
            item._pz || 0, // PZ
            item._pq || 0, // PQ
            item._inner || 0, // INNER
            item._master || 0, // MASTER
          ]),
          theme: "grid",
          styles: { fontSize: 8, halign: "center", cellPadding: 1.5 },
          headStyles: {
            fontStyle: "bold",
            textColor: 0, // Texto negro
            fillColor: [255, 255, 255],
          },
          bodyStyles: { halign: "center" },
        });
      } else {
        doc.text(
          "No hay productos sin cajas.",
          10,
          doc.lastAutoTable.finalY + 10
        );
      }

      // Mostrar los productos agrupados por caja
      Object.keys(cajasAgrupadas).forEach((caja) => {
        const productosDeCaja = cajasAgrupadas[caja];

        // Título de la caja (Contiene Caja 1, Contiene Caja 2, etc.)
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 10,
          head: [[`Caja ${caja}`]],
          body: [],
          theme: "grid",
          styles: {
            halign: "center",
            fontSize: 10,
            cellPadding: 1,
            fillColor: [255, 255, 255], // Fondo blanco
            textColor: [0, 0, 0], // Texto negro
          },
          headStyles: {
            fontStyle: "bold",
            textColor: 0,
            fillColor: [255, 255, 255],
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
              "PZ",
              "PQ",
              "INNER",
              "MASTER",
              "Validar",
            ],
          ],
          body: productosDeCaja.map((item) => [
            item.codigo_ped || "",
            item.des || "",
            item.cantidad || "",
            item.um || "",
            item._pz || 0, // PZ
            item._pq || 0, // PQ
            item._inner || 0, // INNER
            item._master || 0, // MASTER
          ]),
          theme: "grid",
          styles: { fontSize: 8, halign: "center", cellPadding: 1.5 },
          headStyles: {
            fontStyle: "bold",
            textColor: 0, // Texto negro
            fillColor: [255, 255, 255],
          },
          bodyStyles: { halign: "center" },
        });
      });

      // Guardar el PDF
      doc.save(`progreso_${pedido}.pdf`);
      alert(`PDF generado con éxito para el pedido ${pedido}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
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
          <Tab label="Paqueteria" />
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

            {Object.keys(groupedData).length <= 5 ? (
              <Box display="flex" gap={2} flexWrap="wrap" marginTop={2}>
                {Object.keys(groupedData).map((route) => {
                  const totals = calculateTotals(route); // Calcular totales para esta ruta
                  return (
                    <Box
                      key={route}
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        minWidth: "200px",
                      }}
                    >
                      <Checkbox
                        checked={selectedRoutes.includes(route)}
                        onChange={() => handleSelectRoute(route)} // Llama la función de selección
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
                  value={selectedActionRoute}
                  onChange={(e) => openModal(e.target.value)}
                >
                  {Object.keys(groupedData).map((route) => (
                    <MenuItem key={route} value={route}>
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
                    onClick={() => setConfirmSendModalOpen(false)} // Cerrar modal sin hacer cambios
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
                padding="20px"
                backgroundColor="white"
                margin="50px auto"
                maxWidth="80%"
                maxHeight="80%"
                overflow="auto"
                borderRadius="8px"
              >
                <Typography variant="h6">
                  Detalles de la Ruta: {selectedRoute || "Ruta no seleccionada"}
                </Typography>

                {/* Validación de Datos */}
                {selectedRoute &&
                groupedData[selectedRoute]?.rows?.length > 0 ? (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
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
                            <TableRow key={index}>
                              <TableCell>{row.FECHA}</TableCell>
                              <TableCell>{row["NO ORDEN"]}</TableCell>
                              <TableCell>{row["NO FACTURA"]}</TableCell>
                              <TableCell>{row["NUM. CLIENTE"]}</TableCell>
                              <TableCell>{row["NOMBRE DEL CLIENTE"]}</TableCell>
                              <TableCell>{row["ZONA"]}</TableCell>
                              <TableCell>{row.MUNICIPIO}</TableCell>
                              <TableCell>{row.ESTADO}</TableCell>
                              <TableCell>
                                {observacionesPorRegistro[
                                  row["NUM. CLIENTE"]
                                ] || "Sin observaciones"}
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>FECHA</TableCell>
                    <TableCell>NO ORDEN</TableCell>
                    <TableCell>NO FACTURA</TableCell>
                    <TableCell>NUM. CLIENTE</TableCell>
                    <TableCell>NOMBRE DEL CLIENTE</TableCell>
                    <TableCell>Codigo Postal</TableCell>
                    <TableCell>MUNICIPIO</TableCell>
                    <TableCell>ESTADO</TableCell>
                    <TableCell>TOTAL</TableCell>
                    <TableCell>PARTIDAS</TableCell>
                    <TableCell>PIEZAS</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.FECHA}</TableCell>
                      <TableCell>{row["NO ORDEN"]}</TableCell>
                      <TableCell>{row["NO FACTURA"]}</TableCell>
                      <TableCell>{row["NUM. CLIENTE"]}</TableCell>
                      <TableCell>{row["NOMBRE DEL CLIENTE"]}</TableCell>
                      <TableCell>{row["Codigo_Postal"]}</TableCell>
                      <TableCell>{row.MUNICIPIO || "Sin Municipio"}</TableCell>
                      <TableCell>{row.ESTADO}</TableCell>
                      <TableCell>{formatCurrency(row.TOTAL)}</TableCell>
                      <TableCell>{row.PARTIDAS}</TableCell>
                      <TableCell>{row.PIEZAS}</TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <InputLabel>Seleccionar Ruta</InputLabel>
                          <Select
                            value=""
                            onChange={(e) => assignToRoute(row, e.target.value)}
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
                  ))}
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
          user?.role === "EB1") && (
          <Box marginTop={2}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Tipos de rutas
            </Typography>
            <br></br>

            {/* Pestañas internas para Paquetería, Directa, Venta Empleado */}
            <Tabs value={subTabIndex} onChange={handleChangeSubTab} centered>
              <Tab label="Paquetería" />
              <Tab label="Directa" />
              <Tab label="Venta Empleado" />
            </Tabs>

            {/* Sub-tab de Paquetería */}
            {subTabIndex === 0 && (
              <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Typography variant="h6">Paquetería</Typography>

                {(user?.role === "Admin" ||
                  user?.role === "Master" ||
                  user?.role === "Trans") && (
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
                      {visibleColumns.includes("HORA DE SALIDA") && (
                        <TableCell>HORA DE SALIDA</TableCell>
                      )}
                      {visibleColumns.includes("CAJAS") && (
                        <TableCell>CAJAS</TableCell>
                      )}
                      {visibleColumns.includes("TARIMAS") && (
                        <TableCell>TARIMAS</TableCell>
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
                      {visibleColumns.includes("NUMERO DE FACTURA LT") && (
                        <TableCell>NUMERO DE FACTURA LT</TableCell>
                      )}
                      {visibleColumns.includes("TOTAL FACTURA LT") && (
                        <TableCell>TOTAL FACTURA LT</TableCell>
                      )}
                      {visibleColumns.includes("PRORRATEO $ FACTURA LT") && (
                        <TableCell>PRORRATEO $ FACTURA LT</TableCell>
                      )}
                      {visibleColumns.includes(
                        "PRORRATEO $ FACTURA PAQUETERIA"
                      ) && (
                        <TableCell>PRORRATEO $ FACTURA PAQUETERIA</TableCell>
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
                  </TableHead>

                  <TableBody>
                    {sentRoutesData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={visibleColumns.length}
                          style={{ textAlign: "center" }}
                        >
                          No hay datos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sentRoutesData.map((routeData, index) => (
                        <TableRow key={index}>
                          {visibleColumns.includes("NO ORDEN") && (
                            <TableCell>{routeData["NO ORDEN"]}</TableCell>
                          )}
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
                            <TableCell>{routeData["NO FACTURA"]}</TableCell>
                          )}
                          {visibleColumns.includes("FECHA DE FACTURA") && (
                            <TableCell>
                              {formatDate(routeData["FECHA DE FACTURA"])}
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
                              {routeData["DIA EN QUE ESTA EN RUTA"]}
                            </TableCell>
                          )}
                          {visibleColumns.includes("HORA DE SALIDA") && (
                            <TableCell>{routeData["HORA DE SALIDA"]}</TableCell>
                          )}
                          {visibleColumns.includes("CAJAS") && (
                            <TableCell>{routeData.totalCajas}</TableCell>
                          )}
                          {visibleColumns.includes("TARIMAS") && (
                            <TableCell>{routeData.TARIMAS}</TableCell>
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
                                    onClick={() =>
                                      openGuiaModal(
                                        routeData["NO ORDEN"],
                                        routeData["GUIA"]
                                      )
                                    }
                                    size="small"
                                    style={{ color: "#1976D2" }} // Azul
                                  >
                                    <BorderColorIcon />
                                  </IconButton>
                                </Grid>

                                <Grid item>
                                  <IconButton
                                    onClick={() =>
                                      window.open(
                                        "https://app2.simpliroute.com/#/planner/vehicles",
                                        "_blank"
                                      )
                                    }
                                    size="small"
                                    style={{ color: "#616161" }} // Gris
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

            {/* Sub-tab de Directa */}
            {subTabIndex === 1 && (
              <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Typography variant="h6">Directa</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      {visibleColumns.includes("NO ORDEN") && (
                        <TableCell>NO ORDEN</TableCell>
                      )}
                      {visibleColumns.includes("FECHA") && (
                        <TableCell>FECHA</TableCell>
                      )}
                      {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                      )}
                      {/* Otras columnas */}
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
                      directaData.map((routeData, index) => (
                        <TableRow key={index}>
                          {visibleColumns.includes("NO ORDEN") && (
                            <TableCell>{routeData["NO ORDEN"]}</TableCell>
                          )}
                          {visibleColumns.includes("FECHA") && (
                            <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                          )}
                          {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                            <TableCell>
                              {routeData["NOMBRE DEL CLIENTE"]}
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
                <Table>
                  <TableHead>
                    <TableRow>
                      {visibleColumns.includes("NO ORDEN") && (
                        <TableCell>NO ORDEN</TableCell>
                      )}
                      {visibleColumns.includes("FECHA") && (
                        <TableCell>FECHA</TableCell>
                      )}
                      {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                        <TableCell>NOMBRE DEL CLIENTE</TableCell>
                      )}
                      {/* Otras columnas */}
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
                      ventaEmpleadoData.map((routeData, index) => (
                        <TableRow key={index}>
                          {visibleColumns.includes("NO ORDEN") && (
                            <TableCell>{routeData["NO ORDEN"]}</TableCell>
                          )}
                          {visibleColumns.includes("FECHA") && (
                            <TableCell>{formatDate(routeData.FECHA)}</TableCell>
                          )}
                          {visibleColumns.includes("NOMBRE DEL CLIENTE") && (
                            <TableCell>
                              {routeData["NOMBRE DEL CLIENTE"]}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

      {/* El Modal para actualizar la guía */}
      <Modal open={guiaModalOpen} onClose={closeGuiaModal}>
        <Box
          padding="20px"
          backgroundColor="white"
          margin="50px auto"
          maxWidth="400px"
          textAlign="center"
          borderRadius="8px"
        >
          <Typography variant="h6">Actualizar Guía</Typography>

          <TextField
            label="Nueva Guía"
            value={guia}
            onChange={(e) => setGuia(e.target.value)}
            variant="outlined"
            fullWidth
            style={{ marginTop: "20px" }}
          />

          <Button
            onClick={actualizarGuia}
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Actualizar
          </Button>

          <Button
            onClick={closeGuiaModal}
            variant="outlined"
            color="secondary"
            style={{ marginTop: "10px" }}
          >
            Cancelar
          </Button>
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
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Paper>
  );
}

export default Transporte;

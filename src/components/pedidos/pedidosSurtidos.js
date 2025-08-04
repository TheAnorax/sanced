import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Button,
  Modal,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  CircularProgress,
  Autocomplete,
  Tooltip,
  Fab,
  Snackbar,
  LinearProgress,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx"; // Importa la librería xlsx
import { UserContext } from "../context/UserContext";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#faa6b1" },
    success: { main: "#4caf50" },
    error: { main: "#f44336" },
    warning: { main: "#ff9800" },
    info: { main: "#2196f3" },
    alert: { main: "#a6ccfa" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 3px 6px rgba(0,0,0,0.16)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { marginBottom: "16px" },
      },
    },
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const interpolateColor = (progress) => {
  const red = Math.min(255, 255 - Math.round(progress * 2.55));
  const green = Math.min(255, Math.round(progress * 2.55));
  return `rgb(${red}, ${green}, 0)`;
};

const ColorLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 10,
  borderRadius: 5,
  [`& .${LinearProgress.bar}`]: {
    borderRadius: 5,
    background: interpolateColor(value),
  },
}));

function EnSurtido() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthorization, setIsAuthorization] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bahias, setBahias] = useState([]);
  const [selectedBahias, setSelectedBahias] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editedItems, setEditedItems] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [incidences, setIncidences] = useState({});
  const [openCancelModal, setOpenCancelModal] = useState(false);
  // const [confirmCancel, setConfirmCancel] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [turnoPedidos, setTurnoPedidos] = useState([]);
  const [selectedTurno, setSelectedTurno] = useState("turno1");
  const [turnoPedidosCount, setTurnoPedidosCount] = useState(0); // Nuevo estado para el conteo de pedidos del turno
  const [totalPartidas, setTotalPartidas] = useState(0); // Nuevo estado para el total de partidas
  const [totalPiezas, setTotalPiezas] = useState(0);
  const [usuarios, setUsuarios] = useState({});
  const { user } = useContext(UserContext);

  const [openBahiaModal, setOpenBahiaModal] = useState(false);
  const [pedidoBahiaSeleccionado, setPedidoBahiaSeleccionado] = useState(null);
  const [selectedBahiasModal, setSelectedBahiasModal] = useState([]);

  const handleOpenBahiaModal = (pedido) => {
    const existingBahias = pedido.ubi_bahia ? pedido.ubi_bahia.split(", ") : [];
    setPedidoBahiaSeleccionado(pedido);
    setSelectedBahiasModal(existingBahias.map((b) => ({ bahia: b })));
    setOpenBahiaModal(true);
  };

  const handleCloseBahiaModal = () => {
    setOpenBahiaModal(false);
    setPedidoBahiaSeleccionado(null);
    setSelectedBahiasModal([]);
  };

  const updateBahiasFromModal = async () => {
    try {
      const combinedBahias = [
        ...new Set(selectedBahiasModal.map((b) => b.bahia)),
      ].join(", ");

      const response = await axios.put(
        `http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido/${pedidoBahiaSeleccionado.pedido}/bahias`,
        {
          ubi_bahia: combinedBahias,
        }
      );

      if (response.status === 200) {
        const updatedPedidos = pedidos.map((pedido) =>
          pedido.pedido === pedidoBahiaSeleccionado.pedido
            ? { ...pedido, ubi_bahia: combinedBahias }
            : pedido
        );
        setPedidos(updatedPedidos);
        setFilteredPedidos(updatedPedidos);
        handleCloseBahiaModal();
        setSnackbarMessage("Bahías actualizadas exitosamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error al actualizar bahías:", error);
      setSnackbarMessage("Error al actualizar las bahías");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido"
        );
        const dataWithTimes = response.data.map((pedido) => {
          const itemsInStateB = pedido.items.filter(
            (item) => item.estado === "B"
          );
          const itemsAV = itemsInStateB.filter((item) => item.pasillo === "AV");
          const itemsNonAV = itemsInStateB.filter(
            (item) => item.pasillo !== "AV"
          );

          let inicioSurtidoAV,
            finSurtidoAV,
            inicioSurtidoNonAV,
            finSurtidoNonAV;

          if (itemsAV.length > 0) {
            inicioSurtidoAV = Math.min(
              ...itemsAV.map((item) => new Date(item.inicio_surtido).getTime())
            );
            finSurtidoAV = Math.max(
              ...itemsAV.map((item) => new Date(item.fin_surtido).getTime())
            );
          }

          if (itemsNonAV.length > 0) {
            inicioSurtidoNonAV = Math.min(
              ...itemsNonAV.map((item) =>
                new Date(item.inicio_surtido).getTime()
              )
            );
            finSurtidoNonAV = Math.max(
              ...itemsNonAV.map((item) => new Date(item.fin_surtido).getTime())
            );
          }

          const fechaSurtido = new Date(
            inicioSurtidoAV || inicioSurtidoNonAV
          ).toLocaleDateString();
          const inicioSurtido = new Date(
            Math.min(
              inicioSurtidoAV || Infinity,
              inicioSurtidoNonAV || Infinity
            )
          );
          const finSurtido = new Date(
            Math.max(finSurtidoAV || -Infinity, finSurtidoNonAV || -Infinity)
          );
          const tiempoSurtido = (finSurtido - inicioSurtido) / 60000; // tiempo en minutos

          return {
            ...pedido,
            inicio_surtido:
              inicioSurtido.getTime() !== Infinity
                ? inicioSurtido.toLocaleTimeString()
                : null,
            fin_surtido:
              finSurtido.getTime() !== -Infinity
                ? finSurtido.toLocaleTimeString()
                : null,
            tiempo_surtido:
              tiempoSurtido > 0 ? `${tiempoSurtido.toFixed(2)} min` : null,
            inicio_surtido_av: inicioSurtidoAV
              ? new Date(inicioSurtidoAV).toLocaleTimeString()
              : null,
            fin_surtido_av: finSurtidoAV
              ? new Date(finSurtidoAV).toLocaleTimeString()
              : null,
            inicio_surtido_non_av: inicioSurtidoNonAV
              ? new Date(inicioSurtidoNonAV).toLocaleTimeString()
              : null,
            fin_surtido_non_av: finSurtidoNonAV
              ? new Date(finSurtidoNonAV).toLocaleTimeString()
              : null,
            fecha_surtido: fechaSurtido,
          };
        });
        setPedidos(dataWithTimes);
        setFilteredPedidos(dataWithTimes);
      } catch (error) {
        console.error("Error fetching pedidos:", error);
      }
    };

    const fetchBahias = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/pedidos/bahias"
        );
        const filteredBahias = response.data.filter(
          (bahia) => bahia.estado === null && bahia.id_pdi === null
        );
        setBahias(filteredBahias);
      } catch (error) {
        console.error("Error fetching bahias:", error);
      }
    };

    fetchPedidos();
    fetchBahias();

    const intervalId = setInterval(fetchPedidos, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleExportToExcel = () => {
    const turno = selectedTurno;
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const fileName = `Pedidos_${turno}_${formattedDate}.xlsx`;

    const sortedUsuarios = Object.keys(usuarios).map((usuario) => ({
      Nombre: usuario,
      Role: usuarios[usuario].role,
      Productos_Surtidos: usuarios[usuario].productos_surtidos,
      Pedidos_Surtidos: usuarios[usuario].pedidos_surtidos,
      Cantidad_Total_Surti: usuarios[usuario].cantidad_total_surti,
      Tiempo_Surtido: usuarios[usuario].tiempo_surtido,
    }));

    const dataToExport = turnoPedidos.map((pedido) => ({
      Pedido: pedido.pedido,
      Tipo: pedido.productos[0].tipo,
      Partidas: pedido.partidas,
      Bahia: pedido.ubi_bahia,
      PZ: pedido.totalPZ,
      Inicio_Surtido: pedido.inicio_surtido,
      Fin_Surtido: pedido.fin_surtido,
      Tiempo_Surtido: pedido.tiempo_surtido,
      Status: pedido.origen,
    }));

    if (sortedUsuarios.length === 0 && dataToExport.length === 0) {
      console.warn("No hay datos para exportar.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Función para aplicar estilos a las cabeceras
    const applyHeaderStyle = (worksheet) => {
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_col(C) + "1";
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: "FF0000" }, // Fondo rojo
          },
          font: {
            bold: true,
            color: { rgb: "FFFFFF" }, // Texto blanco
          },
        };
      }
    };

    // Función para ajustar el ancho de las columnas
    const adjustColumnWidth = (worksheet) => {
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10; // Ancho mínimo
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
          const cell = worksheet[cellAddress];
          if (cell && cell.v) {
            maxWidth = Math.max(maxWidth, cell.v.toString().length);
          }
        }
        colWidths.push({ wch: maxWidth });
      }
      worksheet["!cols"] = colWidths;
    };

    if (sortedUsuarios.length > 0) {
      const wsUsuarios = XLSX.utils.json_to_sheet(sortedUsuarios);
      applyHeaderStyle(wsUsuarios);
      adjustColumnWidth(wsUsuarios);
      XLSX.utils.book_append_sheet(wb, wsUsuarios, "Usuarios");
    }

    if (dataToExport.length > 0) {
      const wsPedidos = XLSX.utils.json_to_sheet(dataToExport);
      applyHeaderStyle(wsPedidos);
      adjustColumnWidth(wsPedidos);
      XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos");
    }

    // Descargar el archivo Excel con el nombre generado
    XLSX.writeFile(wb, fileName);
  };

  const fetchTurnoPedidos = async (turno) => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-dia"
      );
      const data = response.data[turno] || [];

      // Calcular tiempos y otros datos
      const dataWithTimes = data.pedidos.map((pedido) => {
        const inicioSurtido = new Date(
          Math.min(
            ...pedido.productos.map((p) => new Date(p.inicio_surtido).getTime())
          )
        );
        const finSurtido = new Date(
          Math.max(
            ...pedido.productos.map((p) => new Date(p.fin_surtido).getTime())
          )
        );
        const tiempoSurtido = (finSurtido - inicioSurtido) / 60000;

        const totalPZ = pedido.productos.reduce(
          (sum, item) => sum + item.cantidad,
          0
        );

        return {
          ...pedido,
          inicio_surtido:
            inicioSurtido.getTime() !== Infinity
              ? inicioSurtido.toLocaleTimeString()
              : null,
          fin_surtido:
            finSurtido.getTime() !== -Infinity
              ? finSurtido.toLocaleTimeString()
              : null,
          tiempo_surtido:
            tiempoSurtido > 0 ? `${tiempoSurtido.toFixed(2)} min` : null,
          totalPZ: totalPZ,
          ubi_bahia: pedido.ubi_bahia, // Asegurarte de mantener ubi_bahia en el objeto final
        };
      });

      setTurnoPedidos(dataWithTimes);
      setTurnoPedidosCount(dataWithTimes.length);

      const totalPartidas = dataWithTimes.reduce(
        (sum, pedido) => sum + pedido.partidas,
        0
      );
      setTotalPartidas(totalPartidas);

      const totalPiezas = dataWithTimes.reduce(
        (sum, pedido) => sum + pedido.totalPZ,
        0
      );
      setTotalPiezas(totalPiezas); // Guardar el total de piezas

      // Filtrar y guardar solo los usuarios del turno seleccionado, incluyendo el tiempo_general
      setUsuarios(data.usuarios || {});
    } catch (error) {
      console.error("Error fetching turno pedidos:", error);
    }
  };

  const handleTurnoChange = (event) => {
    setSelectedTurno(event.target.value);
    fetchTurnoPedidos(event.target.value);
  };

  const handleOpenModal = (pedido, editing, authorization) => {
    const existingBahias = pedido.ubi_bahia ? pedido.ubi_bahia.split(", ") : [];
    setSelectedPedido(pedido);
    setSelectedBahias(existingBahias.map((bahia) => ({ bahia })));
    setIsEditing(editing);
    setIsAuthorization(authorization);
    setOpenModal(true);

    const newIncidences = {};
    pedido.items.forEach((item, index) => {
      if (
        item.cant_surti > item.cantidad ||
        item.cant_surti + item.cant_no_env !== item.cantidad ||
        item.cantidad % item.pieza !== 0
      ) {
        newIncidences[index] = true;
      }
    });
    setIncidences(newIncidences);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
    setIsEditing(false);
    setIsAuthorization(false);
    setEditedItems({});
    setIncidences({});
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = pedidos.filter(
      (pedido) =>
        pedido.pedido.toString().includes(value) ||
        pedido.tipo.toLowerCase().includes(value)
    );
    setFilteredPedidos(filteredData);
  };

  const handleInputChange = (event, itemIndex) => {
    const { name, value } = event.target;
    const updatedItems = [...selectedPedido.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [name]: parseFloat(value),
    };

    if (
      updatedItems[itemIndex].cant_surti +
        updatedItems[itemIndex].cant_no_env ===
      updatedItems[itemIndex].cantidad
    ) {
      updatedItems[itemIndex].estado = "B";
    }

    setSelectedPedido({ ...selectedPedido, items: updatedItems });

    setEditedItems({
      ...editedItems,
      [itemIndex]: {
        ...updatedItems[itemIndex],
        edited: true,
      },
    });

    const newIncidences = { ...incidences };
    if (
      updatedItems[itemIndex].cant_surti +
        updatedItems[itemIndex].cant_no_env ===
      updatedItems[itemIndex].cantidad
    ) {
      delete newIncidences[itemIndex];
    }
    setIncidences(newIncidences);
  };

const handleSave = async () => {
  // 🔥 Validación de motivo ANTES de guardar
  const missingMotives = selectedPedido.items.filter(
    (item) => !item.ubi && item.cant_no_env > 0 && !item.motivo
  );

  if (missingMotives.length > 0) {
    setOpenModal(false);
    Swal.fire({
      icon: "warning",
      title: "Motivo requerido",
      text: "Debes agregar un motivo para los productos sin ubicación y con cantidad no enviada antes de guardar el pedido.",
    }).then(() => setOpenModal(true));
    return;
  }

  // 🔎 Validación de incidencias normales
  const newIncidences = {};
  const errorMessages = [];

  for (let [index, item] of selectedPedido.items.entries()) {
    if (
      !item.ubi &&
      item.cant_surti !== item.cantidad &&
      item.cant_surti + item.cant_no_env !== item.cantidad
    ) {
      newIncidences[index] = true;
      errorMessages.push(
        `Producto ${item.codigo_ped}: La cantidad surtida y la cantidad no enviada no coinciden con la cantidad total.`
      );
    }
  }

  if (Object.keys(newIncidences).length > 0) {
    setIncidences(newIncidences);
    setSnackbarMessage(
      `No se puede guardar el pedido debido a las siguientes incidencias:\n${errorMessages.join("\n")}`
    );
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }

  // 🔄 Guardado del pedido
  setIsSaving(true);
  try {
    const updatedItems = selectedPedido.items.map((item, index) => {
      const baseItem = editedItems[index] ? { ...editedItems[index] } : { ...item };
      return { ...baseItem, motivo: item.motivo || "" }; // ✅ Incluye siempre el motivo
    });

    const existingBahias = selectedPedido.ubi_bahia
      ? selectedPedido.ubi_bahia.split(", ")
      : [];
    const combinedBahias = [
      ...new Set([...existingBahias, ...selectedBahias.map((b) => b.bahia)]),
    ].join(", ");

    const updatedPedido = {
      ...selectedPedido,
      items: updatedItems,
      ubi_bahia: combinedBahias,
    };

    console.log("📤 Datos enviados en actualización:", updatedPedido);

    await axios.put(
      `http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido/${selectedPedido.pedido}`,
      updatedPedido
    );

    const updatedPedidos = pedidos.map((pedido) =>
      pedido.pedido === selectedPedido.pedido
        ? { ...selectedPedido, items: updatedItems } 
        : pedido
    );

    setPedidos(updatedPedidos);
    setFilteredPedidos(updatedPedidos);
    handleCloseModal();
    setSnackbarMessage("Pedido guardado exitosamente");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  } catch (error) {
    console.error("Error saving pedido:", error);
    setSnackbarMessage("Error al guardar el pedido");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setIsSaving(false);
  }
};


  const updateAllBahias = async () => {
    try {
      const existingBahias = selectedPedido.ubi_bahia
        ? selectedPedido.ubi_bahia.split(", ")
        : [];
      const combinedBahias = [
        ...new Set([...existingBahias, ...selectedBahias.map((b) => b.bahia)]),
      ].join(", ");

      const response = await axios.put(
        `http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido/${selectedPedido.pedido}/bahias`,
        {
          ubi_bahia: combinedBahias,
        }
      );

      if (response.status === 200) {
        const updatedItems = selectedPedido.items.map((item) => ({
          ...item,
          ubi_bahia: combinedBahias,
        }));

        const updatedPedidos = pedidos.map((pedido) =>
          pedido.pedido === selectedPedido.pedido
            ? { ...selectedPedido, items: updatedItems }
            : pedido
        );

        setPedidos(updatedPedidos);
        setFilteredPedidos(updatedPedidos);
        handleCloseModal();
        setSnackbarMessage("Bahías actualizadas exitosamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error al actualizar bahías:", error);
      setSnackbarMessage("Error al actualizar las bahías");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchTurnoPedidos(selectedTurno);
    }
  };

const authorizePedido = async () => {



  // (Tu código actual de validaciones sigue aquí)
  const newIncidences = {};
  const errorMessages = [];

  for (let [index, item] of selectedPedido.items.entries()) {
    if (item.cant_surti > item.cantidad) {
      newIncidences[index] = "El producto cuenta con cantidades surtidas de más.";
      errorMessages.push(
        `Producto ${item.codigo_ped}: Cantidad surtida (${item.cant_surti}) es mayor que la cantidad (${item.cantidad}).`
      );
    } else if (item.cant_surti + item.cant_no_env !== item.cantidad) {
      newIncidences[index] =
        "La cantidad surtida y la cantidad no mandada no coinciden con la cantidad.";
      errorMessages.push(
        `Producto ${item.codigo_ped}: La suma de cantidad surtida (${item.cant_surti}) y cantidad no enviada (${item.cant_no_env}) no coincide con la cantidad (${item.cantidad}).`
      );
    }
  }

  if (Object.keys(newIncidences).length > 0) {
    setIncidences(newIncidences);
    setSnackbarMessage(
      `No se puede autorizar el pedido debido a las siguientes incidencias:\n${errorMessages.join("\n")}`
    );
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }

   try {

  const updatedItems = selectedPedido.items.map((item) => ({
    ...item,
    estado: "E",
    cant_surti: item.cant_surti,
    cant_no_env: item.cant_no_env,
    tipo: selectedPedido.tipo,
  }));

 
  await axios.post(
    `http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido/${selectedPedido.pedido}/authorize`,
    {
      tipo: selectedPedido.tipo,
      items: updatedItems,
    }
  );

      const updatedPedidos = pedidos.filter(
        (pedido) => pedido.pedido !== selectedPedido.pedido
      );
      setPedidos(updatedPedidos);
      setFilteredPedidos(updatedPedidos);
      handleCloseModal();
      setSnackbarMessage(
        "Pedido autorizado exitosamente y transferido a embarque"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Generate PDF
      generatePDF(updatedItems, selectedPedido.pedido);
    } catch (error) {
      console.error("Error autorizando pedido:", error);
      setSnackbarMessage("Error al autorizar el pedido");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const isPedidoSurtidoCorrectamente = (pedido) => {
    return pedido.items.every(
      (item) => item.estado === "B" && item.cant_surti === item.cantidad
    );
  };

  const obtenerRecuentoPorTipo = (items) => {
    const tipoMap = {};

    items.forEach((item) => {
      const unificado = item.unificado || "";

      // Soporte para separadores: coma o pipe
      const partes = unificado
        .split(/[,|]/)
        .map((p) => p.trim())
        .filter(Boolean);

      partes.forEach((parte) => {
        // Extraer solo el tipo antes de los dos puntos (ej. VQ de "VQ:96")
        const tipo = parte.split(":")[0].trim().toUpperCase();
        if (!tipo) return;

        if (!tipoMap[tipo]) tipoMap[tipo] = new Set();
        tipoMap[tipo].add(item.codigo_ped); // contar solo códigos únicos por tipo
      });
    });

    const resumen = Object.entries(tipoMap)
      .map(([tipo, codigos]) => `${tipo}: ${codigos.size}`)
      .join(" | ");

    return resumen;
  };

  const generatePDF = (items, pedido) => {
    const drawHeader = (
      doc,
      itemTipo,
      pedido,
      totalCodigos,
      bahiaFromItems,
      fusion,
      route,
      nombreCliente, 
      tipoFusionado,
      isFaltantes = false,
      esUnificado = false
    ) => {
      doc.setFontSize(14);

      const baseY = 10;
      const rowHeight = 7;
      const title = isFaltantes
        ? `Faltantes Pedido: ${itemTipo} ${pedido}`
        : `Pedido: ${itemTipo} ${pedido} (Total códigos: ${totalCodigos})`;
      doc.text(title, 10, baseY);

      let y = baseY + rowHeight;

      if (tipoFusionado) {
        doc.text(`Pedido Fusionado: ${fusion}`, 10, y);
        y += rowHeight;
      }

      doc.text(`Bahías: ${bahiaFromItems}`, 10, y);
      y += rowHeight;
       doc.text(`Cliente: ${nombreCliente || "N/A"}    |    Tipo de Ruta: ${route}`, 10, y);
      y += rowHeight;

      return y + 4; // espacio extra
    };

    const generateFullPDF = () => {
      const doc = new jsPDF();
      const itemTipo = items[0]?.tipo || "";
      const totalCodigos = items.length;
      const bahiaFromItems = items[0]?.ubi_bahia || "No asignadas";
      const fusion = items.find((item) => item.fusion)?.fusion || "N/A";
      const route = items[0]?.routeName || "N/A";
      const tiposFusionValidos = [
        ["VQ", "VT"],
        ["VQ", "VW"],
        ["VW", "VT"],
        ["VT", "VQ"],
        ["VW", "VQ"],
        ["VT", "VW"],
      ];

      const tipoFusionado = tiposFusionValidos.some((grupo) => {
        const tiposItem = itemTipo.split(",").map((s) => s.trim());
        return grupo.every((t) => tiposItem.includes(t));
      });

      const unidos = items.filter((i) => i.unido === 1);
      const noUnidos = items.filter((i) => i.unido !== 1);
      const nombreCliente = items[0]?.nombre_cliente || "N/A"; // ✅ Nuevo
      const sortedItems = [...unidos, ...noUnidos].sort(
        (a, b) => b.cant_no_env - a.cant_no_env
      );

      let startY = drawHeader(
        doc,
        itemTipo,
        pedido,
        totalCodigos,
        bahiaFromItems,
        fusion,
        route,
         nombreCliente, // ✅ Aquí lo pasamos
        tipoFusionado,
        false,
        unidos.length > 0
      );

      const resumenUnificado = obtenerRecuentoPorTipo(items);
      if (resumenUnificado) {
        doc.setFontSize(11);
        doc.text(
          `Recuento por tipo unificado: ${resumenUnificado}`,
          10,
          startY
        );
        startY += 8;
      }

      const tableData = sortedItems.map((item) => {
        const isUnido = item.unido === 1;
        const unificado = isUnido ? "SI" : "";
        const highlight = item.cant_no_env > 0;

        return [
          item.codigo_ped,
          item.des,
          item.cantidad,
          item.cant_surti,
          item.cant_no_env,
          item.motivo || "",
          item.tipo.length > 3 ? item.unificado || "" : "",
          unificado,
          highlight,
          isUnido,
        ];
      });
      const tableHeaders = [
        "Código",
        "Descripción",
        "Cantidad",
        "Cant Surti",
        "Cant No Enviado",
        "Motivo",
         "Unido" // 💡 mostrar siempre
      ];

      if (items.some((item) => item.tipo.length > 3)) {
        tableHeaders.push("Unificado");
      }

      doc.autoTable({
        head: [tableHeaders],
        body: tableData.map((row) => row.slice(0, -1)),
        startY,
        didParseCell(data) {
          const rowData = tableData[data.row.index];
          const isHighlighted = rowData[rowData.length - 2];
          const isUnido = rowData[rowData.length - 1];

          if (data.section === "body") {
            if (isHighlighted) {
              data.cell.styles.fillColor = [255, 0, 0];
              data.cell.styles.textColor = [255, 255, 255];
            }
            if (isUnido && data.column.dataKey === tableHeaders.length - 1) {
              data.cell.text = ["SI"];
              data.cell.styles.textColor = [165, 42, 42];
            }
          }
        },
      });

      doc.save(`Pedido-${pedido}.pdf`);
    };

    const generateMissingPDF = () => {
      const doc = new jsPDF();
      const itemTipo = items[0]?.tipo || "";
      const fusion = items[0]?.fusion || "N/A";
      const route = items[0]?.routeName || "N/A";
      const bahiaFromItems = items[0]?.ubi_bahia || "No asignadas";
      const tipoFusionado = ["VT", "VQ", "VQ, VT", "VT, VQ"].includes(itemTipo);

      const filteredItems = items.filter((item) => item.cant_no_env > 0);

      let startY = drawHeader(
        doc,
        itemTipo,
        pedido,
        filteredItems.length,
        bahiaFromItems,
        fusion,
        route,
        tipoFusionado,
        true
      );

     

      if (filteredItems.length === 0) {
        doc.text("No hay ítems con cantidades no enviadas.", 10, startY);
        doc.save(`Faltantes-${pedido}.pdf`);
        return;
      }

      const tableData = filteredItems.map((item) => [
        item.codigo_ped,
        item.des,
        item.cantidad,
        item.cant_surti,
        item.cant_no_env,
        item.motivo || "",
        item.tipo.length > 3 ? item.unificado || "" : "",
      ]);

      const tableHeaders = [
        "Código",
        "Descripción",
        "Cantidad",
        "Cant Surti",
        "Cant No Enviado",
        "Motivo",
      ];
      if (filteredItems.some((item) => item.tipo.length > 3))
        tableHeaders.push("Unificado");

      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY,
      });

      doc.save(`Faltantes-${pedido}.pdf`);
    };

    generateFullPDF();
    setTimeout(generateMissingPDF, 1000);
  };

  const confirmCancelPedido = (pedidoId) => {
    handleCloseCancelModal();
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cancelar!",
      customClass: {
        popup: "swal2-popup-custom",
      },
      backdrop: `
        rgba(0,0,0,0.4)
        left top
        no-repeat
      `,
      didOpen: () => {
        const popup = document.querySelector(".swal2-popup-custom");
        if (popup) {
          popup.style.zIndex = "1400";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleCancelPedido(pedidoId);
      }
    });
  };

  const handleCancelPedido = async (pedidoId) => {
    try {
      const response = await axios.put(
        `http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido/${pedidoId}/cancel`,
        { estado: "C" }
      );
      if (response.status === 200) {
        const updatedPedidos = pedidos.map((pedido) => {
          if (pedido.pedido === pedidoId) {
            return {
              ...pedido,
              items: pedido.items.map((item) => ({ ...item, estado: "C" })),
            };
          }
          return pedido;
        });
        setPedidos(updatedPedidos);
        setFilteredPedidos(updatedPedidos);
        Swal.fire("Cancelado!", "El pedido ha sido cancelado.", "success");
      }
    } catch (error) {
      console.error("Error cancelando el pedido:", error);
      Swal.fire("Error!", "No se pudo cancelar el pedido.", "error");
    }
  };

  const getButtonColor = (pedido) => {
    let color = "inherit";
    const hasIncidencia = pedido.items.some((item) => item.cant_no_env > 0);
    const hasCantidadMenor = pedido.items.some(
      (item) => item.cantidad % item.pieza !== 0
    );
    const hasCarretillaEscoba = pedido.items.some(
      (item) =>
        item.des &&
        (item.des.includes("carretilla") || item.des.includes("escoba"))
    );
    const hasNoUbicacion = pedido.items.some((item) => !item.ubi);

    if (isPedidoSurtidoCorrectamente(pedido)) {
      color = "success";
    } else if (hasIncidencia || hasCantidadMenor) {
      color = "error";
    } else if (hasCarretillaEscoba) {
      color = "info";
    } else if (hasNoUbicacion) {
      color = "secondary";
    }

    return color;
  };

  const renderActions = (params) => {
    const buttonColor = getButtonColor(params.row);

    // if (params.row.items.some(item => item.estado === 'S')) {
    //   return (
    //     user.role === "Admin" || user.role === "INV" ? (
    //     <IconButton color="primary" onClick={() => handleOpenModal(params.row, true, false)}>
    //       <EditIcon />
    //     </IconButton>
    //     ) : null,
    //   );
    // }

    if (params.row.items.some((item) => item.estado === "S")) {
      return user.role === "Admin" || user.role === "Control" ? (
        <IconButton
          color="primary"
          onClick={() => handleOpenModal(params.row, true, false)}
        >
          <EditIcon />
        </IconButton>
      ) : null;
    }

    return user.role === "Admin" || user.role === "Control" ? (
      <Button
        variant="contained"
        color={buttonColor}
        onClick={() => handleOpenModal(params.row, false, true)}
      >
        Autorización
      </Button>
    ) : null;
  };

  const renderIndicators = (params) => {
    const hasIncidencia = params.row.items.some((item) => item.cant_no_env > 0);
    const hasCantidadMenor = params.row.items.some(
      (item) => item.cantidad % item.pieza !== 0
    );
    const hasCarretillaEscoba = params.row.items.some(
      (item) =>
        item.des &&
        (item.des.includes("carretilla") || item.des.includes("escoba"))
    );
    const hasNoUbicacion = params.row.items.some((item) => !item.ubi);
    const hasUnido = params.row.items.some((item) => item.unido === 1);

    const getProductCodesWithIssue = (condition) => {
      return params.row.items
        .filter(condition)
        .map((item) => item.codigo_ped)
        .join(", ");
    };

    return (
      <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
        {hasIncidencia && (
          <Tooltip
            title={`No Enviado: ${getProductCodesWithIssue(
              (item) => item.cant_no_env > 0
            )}`}
          >
            <Button
              variant="contained"
              color="error"
              style={{ minWidth: 25, minHeight: 25, marginTop: 15 }}
            />
          </Tooltip>
        )}
        {hasCantidadMenor && (
          <Tooltip
            title={`La cantidad a surtir de este producto no es múltiplo de la venta mínima: ${getProductCodesWithIssue(
              (item) => item.cantidad % item.pieza !== 0
            )}`}
          >
            <Button
              variant="contained"
              color="warning"
              style={{ minWidth: 25, minHeight: 25, marginTop: 15 }}
            />
          </Tooltip>
        )}
        {hasCarretillaEscoba && (
          <Tooltip
            title={`Carretilla o Escoba: ${getProductCodesWithIssue(
              (item) =>
                item.des &&
                (item.des.includes("carretilla") || item.des.includes("escoba"))
            )}`}
          >
            <Button
              variant="contained"
              color="info"
              style={{ minWidth: 25, minHeight: 25, marginTop: 15 }}
            />
          </Tooltip>
        )}
        {hasNoUbicacion && (
          <Tooltip
            title={`Sin Ubicación: ${getProductCodesWithIssue(
              (item) => !item.ubi
            )}`}
          >
            <Button
              variant="contained"
              color="secondary"
              style={{ minWidth: 25, minHeight: 25, marginTop: 15 }}
            />
          </Tooltip>
        )}
        {hasUnido && (
          <Tooltip
            title={`Unido: ${getProductCodesWithIssue(
              (item) => item.unido === 1
            )}`}
          >
            <Button
              variant="contained"
              color="alert"
              style={{ minWidth: 25, minHeight: 25, marginTop: 15 }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  const calculateProgress = (items, condition) => {
    const filteredItems = items
      .filter(condition)
      .filter((item) => item.cant_no_env !== item.cantidad);
    const totalQuantity = filteredItems.reduce(
      (sum, item) => sum + item.cantidad,
      0
    );
    const totalSurtido = filteredItems.reduce(
      (sum, item) => sum + item.cant_surti,
      0
    );
    return totalQuantity === 0 ? 0 : (totalSurtido / totalQuantity) * 100;
  };

  const renderProgress = (params, condition, label) => {
    const progress = calculateProgress(params.row.items, condition);
    if (progress === 0 && params.row.items.filter(condition).length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="body1">{label}</Typography>
          <Typography variant="caption">
            {label === "Jaula" ? "Sin Jaula" : "Sin Pasillo"}
          </Typography>
        </Box>
      );
    }
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1">{label}</Typography>
        <ColorLinearProgress
          variant="determinate"
          value={progress}
          style={{ width: "30%", height: "6px", marginTop: "4px" }} // Ajusta el tamaño aquí
        />
        <Typography variant="caption">{`${Math.round(progress)}%`}</Typography>
      </Box>
    );
  };

  const handleOpenCancelModal = () => {
    const now = new Date();
    const hour = now.getHours();
    let turno;

    if (hour >= 6 && hour < 14) {
      turno = "turno1";
    } else if (hour >= 14 && hour < 21) {
      turno = "turno2";
    } else {
      turno = "turno3";
    }

    setSelectedTurno(turno);
    fetchTurnoPedidos(turno);
    setOpenCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
  };

  const columns = [
    { field: "pedido", headerName: "Pedido", width: 70 },
    { field: "tipo", headerName: "Tipo", width: 70 },
    { field: "partidas", headerName: "Partidas", width: 70 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 170,
      renderCell: renderActions,
    },
    // { field: 'fecha_surtido', headerName: 'Fecha Surtido', width: 150 },
    {
      field: "inicio_surtido_non_av",
      headerName: "Inicio Surtido",
      width: 150,
    },
    { field: "fin_surtido_non_av", headerName: "Fin Surtido ", width: 150 },
    {
      field: "indicadores",
      headerName: "Indicadores",
      width: 150,
      renderCell: renderIndicators,
    },
    {
      field: "progreso_jaula",
      headerName: "Progreso Jaula",
      width: 200,
      renderCell: (params) =>
        renderProgress(params, (item) => item.pasillo === "AV", "Jaula"),
    },
    {
      field: "progreso_pasillo",
      headerName: "Progreso Pasillo",
      width: 200,
      renderCell: (params) =>
        renderProgress(params, (item) => item.pasillo !== "AV", "Pasillo"),
    },
    {
      field: "bahias",
      headerName: "Bahías",
      width: 200,
      renderCell: (params) =>
        user.role === "Admin" || user.role === "Control" ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenBahiaModal(params.row)}
          >
            Agregar Bahía
          </Button>
        ) : null,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexDirection="column"
      >
        <Typography variant="h4" component="h2">
          Pedidos
        </Typography>
        <TextField
          label="Buscar"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mt: 2, mb: 2, width: "100%" }}
        />
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Button variant="contained" color="success" sx={{ mr: 1 }}>
              Surtido Correctamente
            </Button>
            <Button variant="contained" color="error" sx={{ mr: 1 }}>
              Incidencia Cant No Env
            </Button>
            <Button variant="contained" color="warning" sx={{ mr: 1 }}>
              Cantidad Menor a _pz
            </Button>
            <Button variant="contained" color="info" sx={{ mr: 1 }}>
              Carretilla o Escoba
            </Button>
            <Button variant="contained" color="secondary" sx={{ mr: 1 }}>
              Sin Ubicación
            </Button>
            <Button variant="contained" color="alert">
              Unificado 
            </Button>
          </Box>
        </Box>
        <Paper elevation={3} sx={{ p: 3, width: "100%" }}>
          <div style={{ width: "100%", height: "100vh" }}>
            <DataGrid
              rows={filteredPedidos}
              columns={columns}
              pageSize={5}
              getRowId={(row) => row.id_pedi}
            />
          </div>
        </Paper>
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleOpenCancelModal}
      >
        <AddIcon />
      </Fab>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        style={{ zIndex: 1300 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
          }}
        >
          {selectedPedido && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box display="flex" alignItems="center">
                  <img
                    src="../assets/image/santul2.png"
                    alt="Logo"
                    style={{ width: 90, height: 90, marginRight: 16 }}
                  />
                </Box>
                <Box flex={1} textAlign="center">
                  <Typography variant="h5">
                    {selectedPedido.tipo} : {selectedPedido.pedido}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5">
                    Partidas: {selectedPedido.partidas}
                  </Typography>
                  <Typography variant="h6">
                    Bahía: {selectedPedido.ubi_bahia}
                  </Typography>
                </Box>
              </Box>

              {isEditing && (
                <Box mb={2}>
                  <FormControl sx={{ minWidth: 300 }}>
                    <Autocomplete
                      multiple
                      options={bahias}
                      getOptionLabel={(option) => option.bahia}
                      filterSelectedOptions
                      value={selectedBahias}
                      onChange={(event, value) => setSelectedBahias(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Bahías"
                          placeholder="Seleccionar Bahías"
                        />
                      )}
                    />
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={updateAllBahias}
                    sx={{ ml: 2 }}
                  >
                    Actualizar Bahías
                  </Button>
                </Box>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Cant Surti</TableCell>
                      <TableCell>Cant No Enviado</TableCell>
                      {isEditing && (
                        <>
                          <TableCell>Ubicación</TableCell>
                          <TableCell>Estado</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
  {selectedPedido.items.map((item, index) => {
    const isOrange = item.cantidad % item.pieza !== 0 && item.cant_no_env > 0;
    const noUbi = !item.ubi;
    const noEnv = item.cant_no_env !== 0;

    return (
      <Tooltip
        key={index}
        title={
          isOrange
            ? "La cantidad a surtir de este producto no es múltiplo de la venta mínima"
            : noUbi
            ? "El producto no tiene ubicación"
            : ""
        }
        placement="top"
      >
        <TableRow
          style={{
            backgroundColor: isOrange
              ? theme.palette.warning.main // Naranja
              : noEnv
              ? "red" // Rojo
              : noUbi
              ? theme.palette.secondary.main // Morado
              : "transparent", // Normal
          }}
        >
          <>
            <TableCell>{item.codigo_ped}</TableCell>
            <TableCell>{item.des}</TableCell>
            <TableCell>
              {item.cantidad} {item.um}
            </TableCell>
            <TableCell>
              <TextField
                fullWidth
                name="cant_surti"
                value={item.cant_surti}
                onChange={(event) => handleInputChange(event, index)}
                variant="outlined"
                type="number"
                disabled={
                  !(
                    isOrange ||
                    noUbi ||
                    item.cant_surti > item.cantidad
                  )
                }
              />
            </TableCell>
            <TableCell>
              <TextField
                fullWidth
                name="cant_no_env"
                value={item.cant_no_env}
                onChange={(event) => handleInputChange(event, index)}
                variant="outlined"
                type="number"
                disabled={!(isOrange || noUbi)}
              />
            </TableCell>

            {/* Mostrar select solo si no tiene ubicación y tiene cantidad no enviada */}
            {(!item.ubi && item.cant_no_env > 0) && (
              <TableCell>
               <FormControl fullWidth>
                <TextField
                  select
                  label="Motivo"
                  value={item.motivo || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedPedido((prevState) => {
                      const updatedItems = [...prevState.items];
                      updatedItems[index] = { ...updatedItems[index], motivo: value };
                      return { ...prevState, items: updatedItems };
                    });
                  }}
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Seleccione un motivo</option>
                  <option value="A MENOS X FALTA DE INVENTARIO">A MENOS X FALTA DE INVENTARIO</option>
                  <option value="CERO X FALTA DE EXISTENCIA">CERO X FALTA DE EXISTENCIA</option>
                  <option value="CUARENTENA">CUARENTENA</option>
                  <option value="ELIMINADO X VENTAS">ELIMINADO X VENTAS</option>
                  <option value="UM NO COINCIDE">UM NO COINCIDE</option>
                </TextField>
              </FormControl>

              </TableCell>
            )}

            {isEditing && (
              <>
                <TableCell>{item.ubi}</TableCell>
                <TableCell>{item.estado}</TableCell>
              </>
            )}
          </>
        </TableRow>
      </Tooltip>
    );
  })}
</TableBody>

                </Table>
              </TableContainer>
              {!isEditing && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color={getButtonColor(selectedPedido)}
                    onClick={authorizePedido}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Autorizar Pedido"
                    )}
                  </Button>
                </Box>
              )}
              {isEditing && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </Box>
              )}
              {isAuthorization && !isEditing && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      generatePDF(selectedPedido.items, selectedPedido.pedido)
                    }
                  >
                    Descargar PDF Faltantes
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>

      <Modal open={openCancelModal} onClose={handleCloseCancelModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" mb={2}>
            Cancelar Pedidos
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Pedidos Cancelados" />
            <Tab label={`Pedidos del Turno (${turnoPedidosCount})`} />
          </Tabs>
          {tabValue === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Partidas</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPedidos.map((pedido) => (
                    <TableRow key={pedido.id_pedi}>
                      <TableCell>{pedido.pedido}</TableCell>
                      <TableCell>{pedido.tipo}</TableCell>
                      <TableCell>{pedido.partidas}</TableCell>
                      <TableCell>
                        {(user.role === "Admin" || user.role === "Control") && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => confirmCancelPedido(pedido.pedido)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tabValue === 1 && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="auto"
                mb={2}
              >
                <Typography variant="h6">Pedidos del Turno</Typography>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                bgcolor="#faf7f7"
                p={2}
                borderRadius={4}
                boxShadow={2}
                width="auto"
              >
                <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Nombre</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Códigos</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Pedidos</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Piezas</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Tiempo de Surtido</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Tiempo General</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(usuarios)
                        .map((usuario) => ({
                          nombre: usuario,
                          ...usuarios[usuario],
                        }))
                        .sort(
                          (a, b) =>
                            (b.productos_surtidos || 0) -
                            (a.productos_surtidos || 0)
                        ) // <-- Aquí se ordena de mayor a menor
                        .map((usuario, index) => (
                          <TableRow key={index}>
                            <TableCell>{usuario.nombre}</TableCell>
                            <TableCell>
                              {usuario.productos_surtidos
                                ? Number(
                                    usuario.productos_surtidos
                                  ).toLocaleString("es-MX")
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {usuario.pedidos_surtidos
                                ? Number(
                                    usuario.pedidos_surtidos
                                  ).toLocaleString("es-MX")
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {usuario.cantidad_total_surti
                                ? Number(
                                    usuario.cantidad_total_surti
                                  ).toLocaleString("es-MX")
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {usuario.tiempo_surtido || "N/A"}
                            </TableCell>
                            <TableCell>
                              {usuario.tiempo_general || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Typography variant="h6" mb={2} mt={5}>
                Total de pedidos: {turnoPedidosCount} - Total de partidas:{" "}
                {totalPartidas} - Total de piezas: {totalPiezas}
              </Typography>
              <RadioGroup
                row
                aria-label="turno"
                name="row-radio-buttons-group"
                value={selectedTurno}
                onChange={handleTurnoChange}
              >
                <FormControlLabel
                  value="turno1"
                  control={<Radio />}
                  label="Turno 1"
                />
                <FormControlLabel
                  value="turno2"
                  control={<Radio />}
                  label="Turno 2"
                />
                <FormControlLabel
                  value="turno3"
                  control={<Radio />}
                  label="Turno 3"
                />
              </RadioGroup>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExportToExcel}
              >
                Descargar en Excel
              </Button>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pedido</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Partidas</TableCell>
                      <TableCell>PZ</TableCell>
                      <TableCell>Bahia</TableCell>
                      <TableCell>Inicio Surtido</TableCell>
                      <TableCell>Fin Surtido</TableCell>
                      <TableCell>Tiempo de Surtido</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {turnoPedidos.map((pedido, index) => (
                      <TableRow key={index}>
                        <TableCell>{pedido.pedido}</TableCell>
                        <TableCell>{pedido.productos[0].tipo}</TableCell>
                        <TableCell>{pedido.partidas}</TableCell>
                        <TableCell>{pedido.totalPZ}</TableCell>
                        <TableCell>{pedido.ubi_bahia}</TableCell>{" "}
                        {/* Aquí se muestra ubi_bahia */}
                        <TableCell>{pedido.inicio_surtido}</TableCell>
                        <TableCell>{pedido.fin_surtido}</TableCell>
                        <TableCell>{pedido.tiempo_surtido}</TableCell>
                        <TableCell>{pedido.origen}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseCancelModal}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openBahiaModal} onClose={handleCloseBahiaModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 1000,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Asignar Bahías al Pedido {pedidoBahiaSeleccionado?.pedido}
          </Typography>
          <Autocomplete
            multiple
            options={bahias}
            getOptionLabel={(option) => option.bahia}
            filterSelectedOptions
            value={selectedBahiasModal}
            onChange={(event, value) => setSelectedBahiasModal(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Bahías"
                placeholder="Seleccionar Bahías"
              />
            )}
          />
          <Box mt={2} textAlign="right">
            <Button onClick={handleCloseBahiaModal} sx={{ mr: 1 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={updateBahiasFromModal}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default EnSurtido;

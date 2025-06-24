import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Autocomplete,
  Tabs,
  Tab,
  Chip,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importamos la funcionalidad de tablas
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver"; // Ya lo tienes también
import "jspdf-autotable";
import logo from "./Packing.jpg";
import infoBancaria from "./informacion_bancaria.jpg";
import barraFooter from "./BARRA.jpg";
import { NumerosALetras } from "numero-a-letras";
import ArticleIcon from "@mui/icons-material/Article";

function Finalizados() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [pedidoDetalles, setPedidoDetalles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [filteredPedidos, setFilteredPedidos] = useState([]); // Pedidos filtrados
  const [searchQuery, setSearchQuery] = useState(""); // Estado para el filtro
  const [bahias, setBahias] = useState([]);
  const [selectedBahias, setSelectedBahias] = useState([]);
  const [editBahiaMode, setEditBahiaMode] = useState(false);
  const { user } = useContext(UserContext);
  const [openModalBahias, setOpenModalBahias] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [motivosData, setMotivosData] = useState(null);
  const [rangoInicio, setRangoInicio] = useState(dayjs().startOf("month")); // ✅ inicio del mes actual
  const [rangoFin, setRangoFin] = useState(dayjs()); // Hasta hoy

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/finalizados/pedidos-finalizados"
        );
        const dataWithFormattedTimes = response.data.map((pedido) => ({
          id: `${pedido.pedido}-${pedido.tipo}`, // Identificador único basado en pedido y tipo
          ...pedido,
          registro: new Date(pedido.registro).toLocaleString("es-MX", {
            timeZone: "America/Mexico_City",
          }),
          registro_surtido: pedido.registro_surtido
            ? new Date(pedido.registro_surtido).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          inicio_surtido: pedido.inicio_surtido
            ? new Date(pedido.inicio_surtido).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          fin_surtido: pedido.fin_surtido
            ? new Date(pedido.fin_surtido).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          registro_embarque: pedido.registro_embarque
            ? new Date(pedido.registro_embarque).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
        }));

        setPedidos(dataWithFormattedTimes);
        setFilteredPedidos(dataWithFormattedTimes);
      } catch (error) {
        console.error("Error fetching pedidos:", error);
      }
    };

    fetchPedidos();
    fetchMotivos();
  }, []);
  const fetchMotivos = async () => {
    try {
      const desde = rangoInicio.format("YYYY-MM-DD");
      const hasta = rangoFin.format("YYYY-MM-DD");

      const res = await axios.get(
        `http://66.232.105.87:3007/api/finalizados/pedidos-finalizados/motivos`,
        {
          params: { desde, hasta },
        }
      );

      setMotivosData(res.data);
    } catch (err) {
      console.error("Error fetching motivos:", err);
    }
  };
  useEffect(() => {
    fetchMotivos(); // carga inicial con el mes o año actual
  }, []);

  useEffect(() => {
    const fetchBahias = async () => {
      try {
        const res = await axios.get(
          "http://66.232.105.87:3007/api/pedidos/bahias"
        );
        setBahias(res.data);
      } catch (err) {
        console.error("Error fetching bahias", err);
      }
    };
    fetchBahias();
  }, []);

  const handleOpenBahiaEdit = () => {
    const existing = selectedPedido?.ubi_bahia?.split(", ") || [];
    setSelectedBahias(existing.map((b) => ({ bahia: b })));
    setEditBahiaMode(true);
  };

  const exportarMotivosAExcel = () => {
    if (
      !motivosData ||
      !motivosData.resultados ||
      motivosData.resultados.length === 0
    ) {
      Swal.fire("Sin datos", "No hay datos para exportar.", "info");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(motivosData.resultados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Motivos");

    const fechaInicio = rangoInicio.format("YYYY-MM-DD");
    const fechaFin = rangoFin.format("YYYY-MM-DD");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `Motivos_${fechaInicio}_a_${fechaFin}.xlsx`);
  };

  const handleSaveBahias = async () => {
    const combined = selectedBahias.map((b) => b.bahia).join(", ");
    try {
      await axios.put(
        `http://66.232.105.87:3007/api/pedidos-surtidos/pedidos-surtido-finalizado/${selectedPedido.pedido}/${selectedPedido.tipo}/bahias`,
        { ubi_bahia: combined }
      );

      const updated = pedidos.map((p) =>
        p.pedido === selectedPedido.pedido ? { ...p, ubi_bahia: combined } : p
      );
      setPedidos(updated);
      setFilteredPedidos(updated);
      setSelectedPedido((p) => ({ ...p, ubi_bahia: combined }));

      // 🔒 Cerrar el modal y salir del modo edición
      setEditBahiaMode(false);
      setOpenModal(false);

      // Espera antes de mostrar el alert
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Bahías actualizadas correctamente",
          showConfirmButton: false,
          timer: 2000,
        });
      }, 200);
    } catch (err) {
      console.error("Error updating bahia", err);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar bahías",
        text: err.message,
      });
    }
  };

  const handleOpenModal = async (pedido) => {
    try {
      // const response = await axios.get(`http://66.232.105.87:3007/api/finalizados/pedido/${pedido.pedido}`);
      const response = await axios.get(
        `http://66.232.105.87:3007/api/finalizados/pedido/${pedido.pedido}/${pedido.tipo}`
      );
      const detallesOrdenados = response.data
        .sort((a, b) => {
          if (a.cant_no_env !== 0 && b.cant_no_env === 0) return -1;
          if (a.cant_no_env === 0 && b.cant_no_env !== 0) return 1;
          return a.codigo_ped - b.codigo_ped;
        })
        .map((detalle) => ({
          ...detalle,
          registro: detalle.registro
            ? new Date(detalle.registro).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          registro_surtido: detalle.registro_surtido
            ? new Date(detalle.registro_surtido).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          inicio_surtido: detalle.inicio_surtido
            ? new Date(detalle.inicio_surtido).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          fin_surtido: detalle.fin_surtido
            ? new Date(detalle.fin_surtido).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          inicio_embarque: detalle.inicio_embarque
            ? new Date(detalle.inicio_embarque).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          fin_embarque: detalle.fin_embarque
            ? new Date(detalle.fin_embarque).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          registro_embarque: detalle.registro_embarque
            ? new Date(detalle.registro_embarque).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
              })
            : "N/A",
          v_pz: detalle.v_pz || 0, // Valores por defecto
          v_pq: detalle.v_pq || 0,
          v_inner: detalle.v_inner || 0,
          v_master: detalle.v_master || 0,
        }));
      setPedidoDetalles(detallesOrdenados);
      setSelectedPedido(pedido);
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching pedido details:", error);
    }
  };

  // Filtrar los pedidos cuando cambia el valor de búsqueda
  useEffect(() => {
    if (searchQuery) {
      setFilteredPedidos(
        pedidos.filter(
          (pedido) =>
            String(pedido.pedido)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) // Convertir a cadena antes de aplicar toLowerCase
        )
      );
    } else {
      setFilteredPedidos(pedidos); // Si no hay búsqueda, muestra todos
    }
  }, [searchQuery, pedidos]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
    setPedidoDetalles([]);
  };

  const handleGenerateNoEnviadoPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Pedido No Enviado", 14, 22);
    doc.setFontSize(12);
    doc.text(`Pedido: ${selectedPedido.pedido}`, 14, 30);
    doc.text(`Tipo: ${selectedPedido.tipo}`, 14, 36);

    const noEnviados = pedidoDetalles.filter(
      (detalle) => detalle.cant_no_env !== 0
    );

    const tableColumn = [
      "Código",
      "Descripción",
      "Cantidad",
      "Surtido",
      "No Enviado",
      "Motivo",
      "Union",
    ];
    const tableRows = noEnviados.map((detalle) => [
      detalle.codigo_ped,
      detalle.descripcion,
      detalle.cantidad,
      detalle.cant_surti,
      detalle.cant_no_env,
      detalle.motivo,
      detalle.unificado,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`Pedido_No_Enviado_${selectedPedido.pedido}.pdf`);
  };

  const obtenerRecuentoPorTipo = (items) => {
    const conteo = items.reduce((acc, item) => {
      const tipo = item.unificado || "Sin Tipo";
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(conteo)
      .map(([tipo, count]) => `${tipo}: ${count}`)
      .join(" | ");
  };

  const generatePedidoPDF = async ({
    mode = "full",
    pedido,
    items = [],
    pedidoDetalles = [],
    selectedPedido = {},
    obtenerRecuentoPorTipo,
    logoPath = null,
  }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (mode === "surtido" && logoPath) {
      const imgData = await fetch(logoPath)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );

      doc.addImage(
        imgData,
        "PNG",
        (pageWidth - 100) / 2,
        (pageHeight - 100) / 2,
        100,
        100,
        undefined,
        "FAST"
      );
    }

    const drawHeader = (subtitleLines = []) => {
      doc.setFontSize(12);
      let y = 30;
      subtitleLines.forEach((line) => {
        doc.text(line, 14, y);
        y += 6;
      });
      doc.setLineWidth(0.5);
      doc.line(10, y, pageWidth - 10, y);
      return y + 5;
    };

    let tableRows = [],
      tableHeaders = [];

    if (mode === "surtido") {
      const totalProductos = pedidoDetalles.length;
      const y = drawHeader([
        `Bahías: ${selectedPedido.ubi_bahia || "N/A"}`,
        `Pedido: ${selectedPedido.tipo}: ${selectedPedido.pedido} (Total de Códigos: ${totalProductos})`,
      ]);

      tableHeaders = [
        "Código",
        "Descripción",
        "Cantidad",
        "Surtido",
        "No Enviado",
        "Motivo",
        "Unificado",
      ];
      tableRows = pedidoDetalles.map((d) => [
        d.codigo_ped,
        d.descripcion,
        d.cantidad,
        d.cant_surti,
        d.cant_no_env,
        d.motivo,
        d.unificado,
      ]);

      doc.autoTable({
        head: [tableHeaders],
        body: tableRows,
        startY: y,
        didParseCell: function (data) {
          const row = data.row.raw;
          const cantNoEnviado = Number(row[4]);
          if (!isNaN(cantNoEnviado) && cantNoEnviado > 1) {
            data.cell.styles.fillColor = [255, 0, 0];
            data.cell.styles.textColor = [255, 255, 255];
          }
        },
      });

      doc.setFontSize(12);

      doc.save(`Pedido_Surtido_${selectedPedido.pedido}.pdf`);
      return;
    }

    // Resto del código permanece sin cambios para los otros modos...
  };

  const handleGenerateSurtidoPDF = async () => {
    const doc = new jsPDF();

    // Cargar el logo (convertido previamente a base64 o usando una herramienta para convertirlo)
    const imgData = await fetch("../assets/image/sanced.png")
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });

    // Tamaño del PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Agregar la imagen como marca de agua centrada y ajustada
    const imgWidth = 100; // Ajustar tamaño de la imagen (ancho)
    const imgHeight = 100; // Ajustar tamaño de la imagen (alto)
    const imgX = (pageWidth - imgWidth) / 2; // Centrar en X
    const imgY = (pageHeight - imgHeight) / 2; // Centrar en Y

    // Colocar la imagen en el fondo con baja opacidad (marca de agua)
    doc.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    // Título centrado
    doc.setFontSize(18);
    doc.text("Reporte de Surtido Embarcado", pageWidth / 2, 35, {
      align: "center",
    });

    // Añadir detalles del pedido y fecha
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Fecha: ${currentDate}`, 14, 50);
    doc.text(
      `Pedido: ${selectedPedido.tipo}: ${selectedPedido.pedido}`,
      14,
      55
    );
    doc.text(
      `Surtido: ${selectedPedido.registro_surtido || "Desconocido"}`,
      14,
      60
    );
    doc.text(
      `Validado: ${selectedPedido.registro_embarque || "Desconocido"}`,
      14,
      65
    );

    // Separador
    doc.setLineWidth(0.5);
    doc.line(10, 70, pageWidth - 10, 70); // Línea separadora

    // Definir las columnas de la tabla
    const tableColumn = [
      { header: "Código", dataKey: "codigo_ped" },
      { header: "Descripción", dataKey: "descripcion" },
      { header: "Cantidad", dataKey: "cantidad" },
      { header: "Surtido", dataKey: "cant_surti" },
      { header: "No Enviado", dataKey: "cant_no_env" },
      { header: "Motivo", dataKey: "motivo" },
      { header: "Surtidor", dataKey: "usuario_surtido" },
      { header: "S. PZ", dataKey: "_pz" },
      { header: "S. PQ", dataKey: "_pq" },
      { header: "S. INNER", dataKey: "_inner" },
      { header: "S. MASTER", dataKey: "_master" },
      { header: "Validador", dataKey: "usuario_paqueteria" },
      { header: "V. PZ", dataKey: "v_pz" },
      { header: "V. PQ", dataKey: "v_pq" },
      { header: "V. INNER", dataKey: "v_inner" },
      { header: "V. MASTER", dataKey: "v_master" },
      { header: "Union", dataKey: "unificado" },
    ];

    // Mapeamos los datos a una estructura que jsPDF autoTable pueda procesar
    const tableRows = pedidoDetalles.map((detalle) => ({
      codigo_ped: detalle.codigo_ped,
      descripcion: detalle.descripcion.split(" ")[0],
      cantidad: detalle.cantidad,
      cant_surti: detalle.cant_surti,
      cant_no_env: detalle.cant_no_env,
      motivo: detalle.motivo,
      usuario_surtido: detalle.usuario_surtido.split(" ")[0],
      _pz: detalle._pz,
      _pq: detalle._pq,
      _inner: detalle._inner,
      _master: detalle._master,
      usuario_paqueteria: detalle.usuario_paqueteria,
      v_pz: detalle.v_pz,
      v_pq: detalle.v_pq,
      v_inner: detalle.v_inner,
      v_master: detalle.v_master,
      unificado: detalle.unificado,
    }));

    // Generar la tabla centrada
    doc.autoTable({
      head: [tableColumn.map((col) => col.header)],
      body: tableRows.map((row) => Object.values(row)),
      startY: 80, // Posición de inicio después del encabezado
      margin: { left: 1, right: 1 }, // Márgenes para centrar la tabla
      columnStyles: {
        0: { cellWidth: 20 }, // Código
        1: { cellWidth: 40 }, // Descripción
        2: { cellWidth: 15 }, // Cantidad
        3: { cellWidth: 15 }, // Surtido
        4: { cellWidth: 15 }, // No Enviado
        5: { cellWidth: 30 }, // Motivo
        6: { cellWidth: 20 }, // Surtidor
        7: { cellWidth: 15 }, // S. PZ
        8: { cellWidth: 15 }, // S. PQ
        9: { cellWidth: 15 }, // S. INNER
        10: { cellWidth: 15 }, // S. MASTER
        11: { cellWidth: 25 }, // Validador
        12: { cellWidth: 15 }, // V. PZ
        13: { cellWidth: 15 }, // V. PQ
        14: { cellWidth: 15 }, // V. INNER
        15: { cellWidth: 15 }, // V. MASTER
        16: { cellWidth: 20 }, // Union
      },
      styles: { fontSize: 10, overflow: "linebreak" }, // Ajusta la fuente y permite saltos de línea
      headStyles: { fillColor: [255, 0, 0], halign: "center" }, // Encabezado rojo y centrado
      theme: "grid",
    });

    // Guardar el PDF
    doc.save(`Pedido_Surtido_${selectedPedido.pedido}.pdf`);
  };

  const columns = [
    { field: "pedido", headerName: "Pedido", width: 150 },
    { field: "tipo", headerName: "Tipo", width: 150 },
    { field: "partidas", headerName: "Partidas", width: 150 },
    { field: "registro", headerName: "Registro", width: 200 },
    { field: "registro_surtido", headerName: "Registro Surtido", width: 200 },
    { field: "registro_embarque", headerName: "Registro Embarque", width: 200 },
    { field: "ubi_bahia", headerName: "Bahia", width: 200 },
    {
      field: "pdf",
      headerName: "PDF",
      width: 100,
      renderCell: (params) => (
        <IconButton
          variant="contained"
          style={{ color: "black" }}
          onClick={() => generatePDF(params.row.pedido)}
        >
          <ArticleIcon />
        </IconButton>
      ),
    },

    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleOpenModal(params.row)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 250,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          {(user.role === "Admin" || user.role === "Control") && (
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={() => {
                setSelectedPedido(params.row);
                handleOpenBahiaEdit();
                setOpenModal(true); // Abre el modal directamente con el editor activo
              }}
            >
              Editar Bahía
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const detalleColumns = [
    { field: "descripcion", headerName: "Descripción", width: 100 },
    { field: "codigo_ped", headerName: "Código", width: 60 },
    { field: "cantidad", headerName: "Cantidad", width: 70 },
    { field: "cant_surti", headerName: "Surtido", width: 60 },
    { field: "cant_no_env", headerName: "No Enviado", width: 90 },
    { field: "_pz", headerName: "S. PZ", width: 50 },
    { field: "_pq", headerName: "S. PQ", width: 50 },
    { field: "_inner", headerName: "S. INNER", width: 75 },
    { field: "_master", headerName: "S. MASTER", width: 88 },
    { field: "usuario_surtido", headerName: "Surtidor", width: 100 },
    { field: "inicio_surtido", headerName: "Inicio Surtido", width: 190 },
    { field: "fin_surtido", headerName: "Fin Surtido", width: 190 },
    {
      field: "v_pz",
      headerName: "V. PZ",
      width: 80,
      renderCell: (params) => params.value || 0,
    },
    {
      field: "v_pq",
      headerName: "V. PQ",
      width: 80,
      renderCell: (params) => params.value || 0,
    },
    {
      field: "v_inner",
      headerName: "V. INNER",
      width: 80,
      renderCell: (params) => params.value || 0,
    },
    {
      field: "v_master",
      headerName: "V. MASTER",
      width: 90,
      renderCell: (params) => params.value || 0,
    },
    { field: "usuario_paqueteria", headerName: "Validador", width: 100 },
    { field: "inicio_embarque", headerName: "Inicio", width: 190 },
    { field: "fin_embarque", headerName: "Fin", width: 190 },
    { field: "motivo", headerName: "Motivo No Enviado", width: 170 },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  //feuncion del pdf

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

      const tipo_original = route["tipo_original"] || "No definido";
      const nombreCliente = route["NOMBRE DEL CLIENTE"] || "No disponible";
      const numeroFactura = route["NO_FACTURA"] || "No disponible";
      const direccion = cleanAddress(route["DIRECCION"]) || "No disponible";
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
      doc.text(`No Orden: ${pedido}-${tipo_original}`, marginLeft, currentY);
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
      const atadosProductos = data.filter(
        (i) => (i.um || "").toUpperCase() === "ATA"
      );
      const totalAtados = atadosProductos.length;

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
              const text = "Continuación de productos atados sin caja";
              doc.setFontSize(8);
              doc.text(text, 105, data.cursor.y - 6, { align: "center" });
              yaContinua = true;
            }
          },
        });

        currentY = doc.lastAutoTable.finalY + 4;
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
          body: productosSinCaja
            .filter((item) => (item.um || "").toUpperCase() !== "ATA")
            .map((item) => [
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
      doc.save(`PackingList_de_${pedido}.pdf`);
      alert(`PDF generado con éxito para el pedido ${pedido}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pedidos Finalizados
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Resumen de Pedidos" />
        <Tab label="Motivos No Enviados" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <TextField
            label="Buscar Pedido"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Paper elevation={3} sx={{ p: 3, overflow: "auto" }}>
            <div style={{ height: "90%", width: "100%" }}>
              <DataGrid
                rows={filteredPedidos}
                columns={columns}
                pageSize={5}
                getRowId={(row) => row.id}
              />
            </div>
          </Paper>
        </>
      )}

      {tabValue === 1 && motivosData && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Consulta de motivos del <strong>{motivosData.desde}</strong> al{" "}
            <strong>{motivosData.hasta}</strong>
          </Typography>

          <Typography variant="body1" gutterBottom>
            Total registros: <strong>{motivosData.total}</strong> | Motivos
            únicos: <strong>{motivosData.motivos_unicos}</strong>
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha Inicio"
                value={rangoInicio}
                onChange={(newVal) => newVal && setRangoInicio(newVal)}
                format="YYYY-MM-DD"
              />
              <DatePicker
                label="Fecha Fin"
                value={rangoFin}
                onChange={(newVal) => newVal && setRangoFin(newVal)}
                format="YYYY-MM-DD"
              />
            </LocalizationProvider>

            <Button variant="contained" color="primary" onClick={fetchMotivos}>
              Consultar
            </Button>

            <Button
              variant="outlined"
              color="success"
              onClick={exportarMotivosAExcel}
            >
              Exportar a Excel
            </Button>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            {Object.entries(motivosData.motivos_contador).map(
              ([motivo, count]) => (
                <Chip
                  key={motivo}
                  label={`${motivo}: ${count}`}
                  color="primary"
                  variant="outlined"
                />
              )
            )}
          </Stack>

          <div style={{ height: "auto", width: "100%" }}>
            <DataGrid
              rows={motivosData.resultados.map((row, index) => ({
                id: index,
                ...row,
              }))}
              columns={[
                { field: "pedido", headerName: "Pedido", width: 120 },
                { field: "tipo", headerName: "Tipo", width: 100 },
                { field: "codigo_ped", headerName: "Código Ped", width: 130 },
                { field: "descripcion", headerName: "Descripción", width: 300 },
                { field: "motivo", headerName: "Motivo", width: 250 },
                { field: "cantidad", headerName: "Cantidad", width: 100 },
                { field: "cant_surti", headerName: "Surtido", width: 100 },
                { field: "cant_no_env", headerName: "No enviado", width: 100 },
              ]}
              pageSize={1}
            />
          </div>
        </Box>
      )}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="90%"
        fullWidth
      >
        <DialogTitle>Detalles del Pedido</DialogTitle>
        <DialogContent sx={{ height: "800px" }}>
          {selectedPedido && pedidoDetalles.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Pedido: {selectedPedido.pedido}
              </Typography>

              <div style={{ height: 700, width: "100%" }}>
                <DataGrid
                  rows={pedidoDetalles.map((detalle, index) => ({
                    id: index,
                    ...detalle,
                  }))}
                  columns={detalleColumns}
                  pageSize={5}
                  getRowId={(row) => row.id}
                  getRowClassName={
                    (params) => (params.row.cant_no_env !== 0 ? "red-row" : "") // Condición para marcar la fila en rojo
                  }
                  sx={{
                    "& .red-row": {
                      backgroundColor: "rgba(255, 0, 0, 0.2)", // Color de fondo rojo claro
                    },
                  }}
                />
              </div>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerateNoEnviadoPDF}
                >
                  Generar PDF No Enviado
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    generatePedidoPDF({
                      mode: "surtido",
                      pedido: selectedPedido.pedido,
                      items: pedidoDetalles, // o items si aplicable
                      pedidoDetalles,
                      selectedPedido,
                      obtenerRecuentoPorTipo,
                      logoPath: "../assets/image/sanced.png",
                    })
                  }
                >
                  Generar PDF Surtido
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </Button>
              </Box>
            </>
          )}

          {editBahiaMode ? (
            <Box my={2}>
              <Autocomplete
                multiple
                options={bahias}
                getOptionLabel={(o) => o.bahia}
                filterSelectedOptions
                value={selectedBahias}
                onChange={(e, value) => setSelectedBahias(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Editar Bahía" />
                )}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveBahias}
                sx={{ mt: 1 }}
              >
                Guardar Bahías
              </Button>
              <Button
                onClick={() => setEditBahiaMode(false)}
                sx={{ mt: 1, ml: 1 }}
              >
                Cancelar
              </Button>
            </Box>
          ) : (
            <Button
              onClick={handleOpenBahiaEdit}
              variant="outlined"
              color="secondary"
              sx={{ my: 2 }}
            >
              Editar Bahía
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Finalizados;

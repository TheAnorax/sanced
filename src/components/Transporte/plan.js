import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  CircularProgress,
  Button,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { NumerosALetras } from "numero-a-letras";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "./Packing.jpg";
import barraFooter from "./BARRA.jpg";
import IconButton from "@mui/material/IconButton";
import ArticleIcon from "@mui/icons-material/Article";
import Swal from "sweetalert2";

import * as JSZip from "jszip";

// Extender dayjs para manejar zona horaria
dayjs.extend(utc);
dayjs.extend(timezone);

function Plansurtido() {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz("America/Mexico_City")
  );
  const [loading, setLoading] = useState(false);
  const [surtidores, setSurtidores] = useState(8); // Valor inicial

  const [loadingZIP, setLoadingZIP] = useState(false);

  // ==========================
  // 🔰 EXPORTAR PLAN DEL DÍA
  // ==========================

  const exportPlanDiaToExcel = () => {
    try {
      if (!resumen?.rutas?.length) {
        Swal.fire("Sin datos", "No hay rutas para exportar.", "info");
        return;
      }

      const dataExcel = resumen.rutas.map((r) => ({
        Ruta: r.routeName,
        "Total Clientes": r.totalClientes,
        "Total Partidas": r.totalPartidas,
        "Total Piezas": r.totalPiezas,
        Total: r.total,
        Avance: r.avance,
        "Tiempo Estimado": `${(
          (r.totalPartidas / (30 * surtidores)) *
          60
        ).toFixed(1)} min`,
      }));

      const ws = XLSX.utils.json_to_sheet(dataExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plan del Día");

      const fechaStr = selectedDate.format("YYYY-MM-DD");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `PlanDelDia_${fechaStr}.xlsx`
      );
    } catch (error) {
      console.error("❌ Error exportando Plan del Día:", error);
      Swal.fire("Error", "Hubo un problema exportando el archivo.", "error");
    }
  };

  // ==========================
  // 🔰 EXPORTAR PLAN DE SURTIDO
  // ==========================

  const exportPlanSurtidoToExcel = () => {
    try {
      if (!data?.length) {
        Swal.fire(
          "Sin datos",
          "No hay datos de surtido para exportar.",
          "info"
        );
        return;
      }

      // Flatten los pedidos de todas las rutas
      const pedidos = data.flatMap((grupo) =>
        grupo.pedidos.map((p) => ({
          Ruta: grupo.routeName,
          Orden: p.no_orden,
          Tipo: p.tipo_encontrado || p.tipo_original,
          Factura: p.factura,
          Fusionado: p.fusion || "",
          Cliente: p.nombre_cliente,
          Total: p.TOTAL,
          Partidas: p.PARTIDAS,
          Piezas: p.PIEZAS,
          Estado: p.ESTADO,
          Porcentaje: p.avance,
          Status: p.tablaOrigen || "No Asignado",
        }))
      );

      const ws = XLSX.utils.json_to_sheet(pedidos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plan de Surtido");

      const fechaStr = selectedDate.format("YYYY-MM-DD");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `PlanSurtido_${fechaStr}.xlsx`
      );
    } catch (error) {
      console.error("❌ Error exportando Plan de Surtido:", error);
      Swal.fire("Error", "Hubo un problema exportando el archivo.", "error");
    }
  };

  const fetchPaqueteria = async (fecha) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://66.232.105.87:3007/api/Trasporte/getPaqueteriaData?fecha=${fecha}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener datos de paquetería:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumen = async (fecha) => {
    try {
      const response = await axios.get(
        `http://66.232.105.87:3007/api/Trasporte/getPedidosDia?fecha=${fecha}`
      );

      const data = response.data;
      console.log("📦 Respuesta completa del backend:", data);

      // 🔹 Guarda tanto las rutas como los pedidos
      setResumen({
        rutas: Array.isArray(data.resumenRutas) ? data.resumenRutas : [],
        pedidos: Array.isArray(data.pedidos) ? data.pedidos : [],
      });
    } catch (error) {
      console.error("❌ Error al obtener resumen del día:", error);
      setResumen({ rutas: [], pedidos: [] });
    }
  };

  useEffect(() => {
  let mounted = true;

  const fetchData = async () => {
    setLoading(true);
    const dateStr = selectedDate.format("YYYY-MM-DD");

    try {
      const [paqRes, resumenRes] = await Promise.all([
        axios.get(`http://66.232.105.87:3007/api/Trasporte/getPaqueteriaData?fecha=${dateStr}`),
        axios.get(`http://66.232.105.87:3007/api/Trasporte/getPedidosDia?fecha=${dateStr}`)
      ]);

      if (!mounted) return;

      const resumenData = {
        rutas: resumenRes.data.resumenRutas || [],
        pedidos: resumenRes.data.pedidos || []
      };

      const dataFinal = paqRes.data.map((grupo) => ({
        ...grupo,
        pedidos: grupo.pedidos.map((pedido) => {
          const encontrado = resumenData.pedidos.find(
            (p) => String(p.pedido) === String(pedido.no_orden)
          );
          return {
            ...pedido,
            factura: encontrado?.factura || "—"
          };
        })
      }));

      setResumen(resumenData);
      setData(dataFinal);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  return () => { mounted = false; };

}, [selectedDate]);

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  const obtenerResumenPorStatus = () => {
    const conteo = {
      surtido: 0,
      embarques: 0,
      finalizado: 0,
      sin_asignar: 0,
    };

    data.forEach((grupo) => {
      grupo.pedidos.forEach((pedido) => {
        // Considerar fusión
        const fusion = grupo.pedidos.find(
          (p) =>
            p.fusion &&
            p.fusion.split("-").includes(String(pedido.no_orden)) &&
            p.no_orden !== pedido.no_orden
        );
        const tabla = (fusion?.tablaOrigen || pedido.tablaOrigen || "")
          .trim()
          .toLowerCase();

        if (tabla === "surtido") conteo.surtido += 1;
        else if (tabla === "embarques") conteo.embarques += 1;
        else if (tabla === "finalizado") conteo.finalizado += 1;
        else conteo.sin_asignar += 1;
      });
    });

    return conteo;
  };

  //funcion para crear el pdf

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

  const getTipoDominante = (productos) => {
    const tipos = productos.map((p) => (p.tipo_caja || "").toUpperCase());
    const cuenta = {};
    for (const tipo of tipos) cuenta[tipo] = (cuenta[tipo] || 0) + 1;

    const tipoMasUsado =
      Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0]?.[0] || "CAJA";
    return tipoMasUsado === "ATA" ? "ATADO" : tipoMasUsado;
  };

  const [rutas, setRutas] = useState([]);
  const [pedidosExternos, setPedidosExternos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Rutas
        const resRutas = await fetch(
          "http://66.232.105.87:3007/api/Trasporte/ruta-unica"
        );
        setRutas(await resRutas.json());

        // Pedidos externos
        const resPedidos = await axios.post(
          "http://66.232.105.87:3007/api/Trasporte/obtenerPedidos"
        );
        setPedidosExternos(resPedidos.data);
      } catch (err) {
        console.error("❌ Error precargando datos:", err);
      }
    };

    fetchData();
  }, []);

  // 🔹 Dentro de generatePDF

  const generatePDF = async (pedido, tipo_original, rutas, pedidosExternos) => {
    try {
      console.time("⏳ Tiempo total PDF");
      let numero = "";
      let numeroFactura = "";
      let nombreCliente = "";
      let direccion = "";
      let telefono = "";
      let rawTotal = 0; // Subtotal SIN IVA
      let totalConIva = 0; // Total CON IVA
      let pedidoEncontrado = "";

      // ======================
      // 1. Buscar en memoria rutas/pedidos
      // ======================
      console.time("Buscar en memoria");
      const route = rutas.find((r) => String(r["NO ORDEN"]) === String(pedido));
      pedidoEncontrado = pedidosExternos.find(
        (p) => String(p.NoOrden) === String(pedido)
      );
      console.timeEnd("Buscar en memoria");

      if (!route && !pedidoEncontrado) {
        alert("❌ No se encontraron datos para el pedido.");
        return;
      }

      // ======================
      // 2. Datos del pedido
      // ======================
      tipo_original = route?.["tipo_original"] || tipo_original;
      nombreCliente =
        route?.["NOMBRE DEL CLIENTE"] ||
        pedidoEncontrado?.Nombre_Cliente ||
        "No disponible";
      direccion = cleanAddress(
        pedidoEncontrado?.Direccion || route?.["DIRECCION"] || "No disponible"
      );
      numeroFactura =
        pedidoEncontrado?.NoFactura || route?.["NO_FACTURA"] || "No disponible";
      numero =
        route?.["NUM. CLIENTE"] ||
        pedidoEncontrado?.NumConsigna ||
        "No disponible";
      telefono =
        route?.["TELEFONO"] || pedidoEncontrado?.Telefono || "No disponible";

      rawTotal =
        parseFloat(
          String(
            route?.["total_api"] || pedidoEncontrado?.Total || "0"
          ).replace(/[^0-9.-]+/g, "")
        ) || 0;

      const totalIvaAPI = pedidoEncontrado?.TotalConIva
        ? parseFloat(
            String(pedidoEncontrado.TotalConIva).replace(/[^0-9.-]+/g, "")
          )
        : 0;

      const totalIvaDB = route
        ? parseFloat(
            String(route?.totalIva ?? route?.TOTAL_FACTURA_LT ?? 0).replace(
              /[^0-9.-]+/g,
              ""
            )
          ) || 0
        : 0;

      totalConIva = totalIvaAPI || totalIvaDB || rawTotal;

      // ======================
      // 3. Confirmar totales (idéntico)
      // ======================
      const { isConfirmed: aceptaTotales } = await Swal.fire({
        title: `Pedido ${pedido}-${tipo_original}`,
        html: `
    <div style="font-size:14px; line-height:1.7; text-align:left">
      <h2><div><b>Subtotal (sin IVA):</b> $${(Number(rawTotal) || 0).toFixed(
        2
      )}</div></h2>
      <h2><div><b>Total factura (con IVA):</b> $${(
        Number(totalConIva) || 0
      ).toFixed(2)}</div></h2>
    </div>
    <h2><div style="margin-top:6px; color:#666; font-size:12px;">
      ¿Está de acuerdo con estos totales?
    </div></h2>
  `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "No, modificar",

        // 🔴 DESHABILITA EL BOTÓN "CONTINUAR" SI ALGUNO ES 0
        didOpen: () => {
          const btnConfirm = Swal.getConfirmButton();

          if (
            (Number(rawTotal) || 0) === 0 ||
            (Number(totalConIva) || 0) === 0
          ) {
            btnConfirm.disabled = true;
            btnConfirm.style.opacity = "0.4";
            btnConfirm.style.cursor = "not-allowed";
          }
        },
      });

      if (!aceptaTotales) {
        const { value: nuevos, isConfirmed } = await Swal.fire({
          title: "Modificar totales",
          html: `
      <div style="text-align:left">
        <label style="font-size:12px;">Subtotal (sin IVA)</label>
        <input id="swal-subtotal" type="number" step="0.01" min="0"
               inputmode="decimal"
               value="${(Number(rawTotal) || 0).toFixed(2)}"
               class="swal2-input" style="width:100%;margin:6px 0 10px;">
        <label style="font-size:12px;">Total factura (con IVA)</label>
        <input id="swal-total" type="number" step="0.01" min="0"
               inputmode="decimal"
               value="${(Number(totalConIva) || 0).toFixed(2)}"
               class="swal2-input" style="width:100%;margin:6px 0 10px;">
      </div>
    `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Usar estos totales",
          cancelButtonText: "Cancelar",

          preConfirm: () => {
            const s = parseFloat(
              String(document.getElementById("swal-subtotal").value).replace(
                ",",
                "."
              )
            );
            const t = parseFloat(
              String(document.getElementById("swal-total").value).replace(
                ",",
                "."
              )
            );

            // ❌ Validación: deben ser números
            if (!isFinite(s) || !isFinite(t)) {
              Swal.showValidationMessage(
                "Ambos totales son requeridos y deben ser números."
              );
              return false;
            }

            // ❌ Validación: no permitir negativos
            if (s < 0 || t < 0) {
              Swal.showValidationMessage(
                "Los totales no pueden ser negativos."
              );
              return false;
            }

            // ❌ Validación: no permitir CERO
            if (s === 0 || t === 0) {
              Swal.showValidationMessage("Los totales deben ser mayores a 0.");
              return false;
            }

            // ✔️ Totales válidos
            return { subtotal: s, total: t };
          },
        });

        if (!isConfirmed || !nuevos) {
          await Swal.fire("Cancelado", "No se generó el PDF.", "info");
          return;
        }

        rawTotal = nuevos.subtotal;
        totalConIva = nuevos.total;
      }

      // ======================
      // 4. Obtener productos (solo aquí sigue fetch real)
      // ======================
      console.time("Fetch embarque");
      const responseEmbarque = await fetch(
        `http://66.232.105.87:3007/api/Trasporte/embarque/${pedido}/${tipo_original}`
      );
      const result = await responseEmbarque.json();
      console.timeEnd("Fetch embarque");

      if (!result || !result.datos || result.datos.length === 0)
        return alert("No hay productos");

      console.log(` Productos recibidos: ${result.totalLineas} líneas`);
      const data = result.datos;

      // ======================
      // 5. Obtener OC (sin quitar nada)
      // ======================
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

      //inico de la creacion del pdf
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

      const referenciaCliente = buscarReferenciaCliente(
        numero,
        nombreCliente,
        referenciasClientes
      );
      let totalImporte = Number(rawTotal) || 0;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);

      doc.text(
        `CLIENTE NO.: ${numero}   NOMBRE DEL CLIENTE: ${nombreCliente}`,
        marginLeft,
        currentY
      );
      currentY += 4;
      doc.text(`TELÉFONO: ${telefono}`, marginLeft, currentY);
      currentY += 4;

      const direccionFormateada = `DIRECCIÓN: ${direccion}`;
      doc.text(direccionFormateada, marginLeft, currentY, { maxWidth: 180 });

      const lineCount = Math.ceil(doc.getTextWidth(direccionFormateada) / 180);
      currentY += 4 * lineCount;

      currentY += 4;
      doc.text(`No Orden: ${pedido}-${tipo_original}`, marginLeft, currentY);
      currentY += 4;
      doc.text(
        `FACTURA No.: ${numeroFactura}    OC: ${numeroOC}`,
        marginLeft,
        currentY
      );
      currentY += 4;

      // 🔴 Conteo de líneas
      const totalLineasDB = result.totalLineas;
      const totalMotivo = result.totalMotivo;
      const totalLineasPDF = result.totalLineasPDF;

      const textoLineas = `Líneas BD: ${totalLineasDB} | Líneas PDF: ${totalLineasPDF} | Motivo: ${totalMotivo}`;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      if (totalLineasDB !== totalLineasPDF + totalMotivo) {
        doc.setTextColor(255, 0, 0);
      } else {
        doc.setTextColor(0, 0, 0);
      }

      doc.text(textoLineas, marginLeft, currentY);
      currentY += 4;

      const infoY = currentY;
      doc.setFillColor(255, 255, 0);
      doc.rect(marginLeft, infoY, 190, 13, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text("INFORMACIÓN IMPORTANTE", 105, infoY + 4, { align: "center" });
      doc.setFontSize(6.3);
      doc.text(
        "En caso de detectar cualquier irregularidad (daños, faltantes,cajas mojadas o manipulaciones), Favor de comunicarse de inmediato al departamento de atención al cliente al número:(55) 58727290 EXT.: (8815, 8819) en un Horario de Lunes a Viernes de 8:30 am a 5:00 pm",
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

      // ✔️ Agrupar productos por caja original
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
        const clave = `${tipo}_${claveCaja}`; // ejemplo: "CAJA_2,6"

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
          return (
            s + (i._pz || 0) + (i._pq || 0) + (i._inner || 0) + (i._master || 0)
          );
        }

        // También suma productos sin tipo de caja pero que tienen INNER o MASTER
        if (!tipo || tipo === "") {
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

      // Productos que NO tienen caja y NO tienen motivo registrado
      const productosSinCajaNoRegistrada = productosSinCaja.filter(
        (p) =>
          (!p.caja || p.caja === null || p.caja === "") &&
          (!p.motivo || p.motivo === null)
      );

      let numeroCajaSecuencial = 1;

      //  Si hay productos sin caja, agrégalos a la última caja
      if (
        productosSinCajaNoRegistrada.length > 0 &&
        cajasOrdenadas.length > 0
      ) {
        const indexUltimaCaja = cajasOrdenadas.length - 1;
        cajasOrdenadas[indexUltimaCaja][1].push(
          ...productosSinCajaNoRegistrada
        );
      }

      //  Recorremos las cajas
      for (const [key, productos] of cajasOrdenadas) {
        const [_, numeroCaja] = key.split("_");
        const tipoVisible = getTipoDominante(productos);
        const titulo = `Productos en ${tipoVisible} ${numeroCaja}`;

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

      // 🟢 Productos atados sin caja
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

      // Resumen totales
      currentY = doc.lastAutoTable.finalY + 5;
      currentY = verificarEspacio(doc, currentY, 1);
      const pageWidth = doc.internal.pageSize.getWidth();
      const tableWidth = 90;
      const leftMargin = (pageWidth - tableWidth) / 2;

      const totalConIvaParaTexto = totalConIva; // ya viene de confirmación o edición

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
            `$${totalConIvaParaTexto.toFixed(2)}`,
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

      // === LEYENDA VERTICAL
      doc.saveGraphicsState();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "Documento expedido sobre resolución miscelánea vigente",
        5,
        doc.internal.pageSize.getHeight() / 2 + 30,
        { angle: 270, align: "center" }
      );
      doc.restoreGraphicsState();

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

      const letras = NumerosALetras(totalConIvaParaTexto);
      const fechaActual = new Date();
      const fechaHoy = fechaActual.toLocaleDateString("es-MX");
      const fechaVence = new Date(
        fechaActual.setMonth(fechaActual.getMonth() + 1)
      ).toLocaleDateString("es-MX");

      const textoPagare =
        `En cualquier lugar de este documento donde se estampe la firma por este pagaré debo(emos) y pagaré(mos) ` +
        `incondicionalmente a la vista y a la orden de SANTUL HERRAMIENTAS S.A. DE C.V., la cantidad de: $${totalConIvaParaTexto.toFixed(
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

      // === Información bancaria + Observaciones
      const tablaBancosY = currentY + 10;

      // Referencia bancaria arriba de la tabla
      doc.setFontSize(10);
      doc.text("Referencia bancaria:", 20, tablaBancosY - 5, {
        styles: { fontStyle: "bold" },
      });
      doc.setFont(undefined, "bold");
      doc.text(`${referenciaCliente}`, 75, tablaBancosY - 5, {
        align: "right",
        styles: { fontStyle: "bold" },
      });
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
          ["BANORTE", "0890771176", "04", "072180008907711766"],
          ["BANCOMER", "CIE 2476827", "1838"],
        ],
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 1, halign: "center" },
        margin: { left: 10 },
        tableWidth: 115,
        headStyles: { textColor: [0, 0, 0], fontStyle: "bold" },
        bodyStyles: { textColor: [0, 0, 0] },
      });

      // Caja de observaciones
      const obsBoxX = 133;
      const obsBoxY = tablaBancosY;
      const obsBoxWidth = 65;
      const obsBoxHeight = 28;

      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.3);
      doc.rect(obsBoxX, obsBoxY, obsBoxWidth, obsBoxHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Observaciones: ", obsBoxX + 3, obsBoxY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`OC: ${numeroOC}`, obsBoxX + 5, obsBoxY + 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      const numLineas = 4;
      const leftPadding = 5;
      const rightPadding = 5;
      const lineaAncho = obsBoxWidth - leftPadding - rightPadding;
      for (let i = 0; i < numLineas; i++) {
        const lineaY = obsBoxY + 11 + i * 5.3;
        doc.text(
          "...".repeat(Math.floor(lineaAncho / 2.5)),
          obsBoxX + leftPadding,
          lineaY
        );
      }

      const leyendaY = obsBoxY + obsBoxHeight + 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        "A la firma/sello del presente documento se tiene por recibida de conformidad la mercancía y aceptado el monto a pagar aquí descrita.",
        10,
        leyendaY
      );

      currentY = leyendaY + 4;

      addPageNumber(doc, pedido, numeroFactura, tipo_original);

      doc.save(`PackingList_de_${pedido}-${tipo_original}.pdf`);
      alert(`PDF generado con éxito para el pedido ${pedido}-${tipo_original}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };

  // 👉 Nueva función para descargar todos los PDFs de una ruta, uno por uno
  const generateAllPDFs = async (grupo) => {
    try {
      for (const pedido of grupo.pedidos) {
        const tipoFinal = (pedido.tipo_encontrado || pedido.tipo_original || "")
          .toUpperCase()
          .trim();

        await generatePDF(
          pedido.no_orden,
          tipoFinal,
          rutas, // 👈 los pasas aquí
          pedidosExternos // 👈 también
        );
      }
    } catch (error) {
      console.error("❌ Error generando los PDFs:", error);
      Swal.fire("Error", "Hubo un problema generando los PDFs", "error");
    }
  };

  return (
    <Box p={4}>

      <Typography variant="h4" align="center" gutterBottom>
        Planificación
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} centered>

        <Tab label="Plan del Día" />

        <Tab label="Plan de Surtido" />

      </Tabs>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <DatePicker
            label="Seleccionar Fecha"
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue) {
                const convertedDate = dayjs(newValue);
                setSelectedDate(convertedDate.tz("America/Mexico_City"));
              }
            }}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ maxWidth: 240 }} />
            )}
          />
        </Box>
      </LocalizationProvider>

      <Box sx={{ mt: 2, mb: 2, maxWidth: 200 }}>
        <TextField
          type="number"
          label="Surtidores"
          value={surtidores}
          onChange={(e) => setSurtidores(Number(e.target.value))}
          fullWidth
        />
      </Box>

      {/* Tab 0: Plan del Día */}
      {tabIndex === 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Resumen del plan del día
          </Typography>

          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ mb: 2 }}
            onClick={exportPlanDiaToExcel}
          >
            Descargar Excel (Plan del Día)
          </Button>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : resumen.length === 0 ? (
            <Typography sx={{ mt: 2, ml: 2 }}>
              No se han cargado datos de los pedidos.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Ruta</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Clientes</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Partidas</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Piezas</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Avance</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tiempo Estimado de Surtido</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumen?.rutas?.map((ruta, idx) => {
                    const totalMin =
                      (ruta.totalPartidas / (30 * surtidores)) * 60;
                    const horas = Math.floor(totalMin / 60);
                    const minutos = Math.round(totalMin % 60);
                    const tiempoEstimado =
                      surtidores > 0
                        ? `${horas}h ${minutos}m (${surtidores} personas a 30 líneas/hr)`
                        : "—";

                    return (
                      <TableRow key={idx}>
                        <TableCell>{ruta.routeName}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-MX").format(
                            ruta.totalClientes
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-MX").format(
                            ruta.totalPartidas
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-MX").format(
                            ruta.totalPiezas
                          )}
                        </TableCell>

                        <TableCell>
                          {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          }).format(ruta.total)}
                        </TableCell>
                        <TableCell>{ruta.avance}</TableCell>
                        <TableCell>{tiempoEstimado}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
      

      {/* Tab 1: Plan de Surtido */}
      {tabIndex === 1 && (
        <Box mt={4}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : resumen.length === 0 ? (
            <Typography sx={{ mt: 2, ml: 2 }}>
              No se han cargado datos de los pedidos.
            </Typography>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Resumen de Pedidos por Estado
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{ mb: 2 }}
                  onClick={exportPlanSurtidoToExcel}
                >
                  Descargar Excel (Plan de Surtido)
                </Button>

                {(() => {
                  const resumenStatus = obtenerResumenPorStatus();
                  return (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item>
                        <strong>Surtido:</strong> {resumenStatus.surtido}
                      </Grid>
                      <Grid item>
                        <strong>Embarques:</strong> {resumenStatus.embarques}
                      </Grid>
                      <Grid item>
                        <strong>Finalizado:</strong> {resumenStatus.finalizado}
                      </Grid>
                      <Grid item>
                        <strong>No Asignado:</strong>{" "}
                        {resumenStatus.sin_asignar}
                      </Grid>
                    </Grid>
                  );
                })()}
              </Box>
              {data.map((grupo, index) => (
                <Box key={index} mb={4}>
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    Ruta: {grupo.routeName}
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => generateAllPDFs(grupo)} // 👈 ahora descarga 1x1
                      disabled={loadingZIP}
                    >
                      {loadingZIP ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Generar todos los PackingList"
                      )}
                    </Button>
                  </Typography>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Orden</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Factura</TableCell>
                          <TableCell>Fusionado</TableCell>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Partidas</TableCell>
                          <TableCell>Piezas</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Porcentaje</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>PackingList</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grupo.pedidos.map((pedido) => {
                          // Buscar si este pedido está fusionado dentro de otro
                          const pedidoFusionado = grupo.pedidos.find(
                            (p) =>
                              p.fusion &&
                              p.fusion
                                .split("-")
                                .includes(String(pedido.no_orden)) &&
                              p.no_orden !== pedido.no_orden
                          );

                          // Si encontró que este pedido está fusionado en otro, hereda los datos
                          const avanceFinal = pedidoFusionado
                            ? pedidoFusionado.avance
                            : pedido.avance;
                          const tablaOrigenFinal = pedidoFusionado
                            ? pedidoFusionado.tablaOrigen
                            : pedido.tablaOrigen;
                          const estadoFinal = pedidoFusionado
                            ? pedidoFusionado.ESTADO
                            : pedido.ESTADO;
                          const tipoFinal = pedidoFusionado
                            ? pedidoFusionado.tipo_encontrado ||
                              pedidoFusionado.tipo_original
                            : pedido.tipo_encontrado || pedido.tipo_original;

                          return (
                            <TableRow key={pedido.id}>
                              <TableCell>{pedido.no_orden}</TableCell>
                              <TableCell>{tipoFinal}</TableCell>

                              <TableCell>{pedido.factura}</TableCell>
                              <TableCell>{pedido.fusion}</TableCell>
                              <TableCell>{pedido.nombre_cliente}</TableCell>
                              <TableCell>
                                {new Intl.NumberFormat("es-MX", {
                                  style: "currency",
                                  currency: "MXN",
                                }).format(pedido.TOTAL)}
                              </TableCell>
                              <TableCell>{pedido.PARTIDAS}</TableCell>
                              <TableCell>{pedido.PIEZAS}</TableCell>
                              <TableCell>{estadoFinal}</TableCell>
                              <TableCell>{avanceFinal}</TableCell>
                              <TableCell
                                sx={{
                                  color: (() => {
                                    const tabla = (tablaOrigenFinal || "")
                                      .trim()
                                      .toLowerCase();
                                    if (tabla === "surtido") return "black";
                                    if (tabla === "embarques") return "blue";
                                    if (tabla === "finalizado") return "green";
                                    return "red";
                                  })(),
                                  fontWeight: "bold",
                                }}
                              >
                                {tablaOrigenFinal || "No Asignado"}
                              </TableCell>

                              <TableCell>
                                <IconButton
                                  style={{ color: "black" }}
                                  onClick={() =>
                                    generatePDF(
                                      String(pedido.no_orden),
                                      String(tipoFinal || "")
                                        .toUpperCase()
                                        .trim(),
                                      rutas, // 👈 ahora sí como argumento
                                      pedidosExternos // 👈 correcto
                                    )
                                  }
                                >
                                  <ArticleIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </>
          )}
        </Box>
      )}


    </Box>
  );
}

export default Plansurtido;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";

import { pdfTemplate } from "./pdfTemplate";
import { pdfUbicacionesTemplate } from "./pdfUbicacionesTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddTaskIcon from "@mui/icons-material/AddTask";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import Swal from "sweetalert2";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Pagination from "@mui/material/Pagination";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

function Muestras() {
  const [currentTab, setCurrentTab] = useState(0);
  const [vista, setVista] = useState("formulario");
  const [user, setUser] = useState(null);

  const [departamento, setDepartamento] = useState("");
  const [motivo, setMotivo] = useState("");
  const [regresaArticulo, setRegresaArticulo] = useState(false);
  const [fecha, setFecha] = useState("");
  const [requiereEnvio, setRequiereEnvio] = useState(false);
  const [detalleEnvio, setDetalleEnvio] = useState("");
  const [departamentos, setDepartamentos] = useState([]);

  const [cantidad, setCantidad] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [producto, setProducto] = useState(null);

  const [alerta, setAlerta] = useState(false);
  const [alertaMessage, setAlertaMessage] = useState("");

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesAutorizadas, setSolicitudesAutorizadas] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [productosModal, setProductosModal] = useState([]);

  const [solicitudModalFolio, setSolicitudModalFolio] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [mostrarObservaciones, setMostrarObservaciones] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  let timeoutId = useRef(null);

  useEffect(() => {
    if (user) {
      // Establecer el valor inicial de las pestañas según el rol
      if (user.role === "Master") {
        setCurrentTab(1); // Solo puede ver "Autorizar"
      } else if (user.role === "INV") {
        setCurrentTab(0); // Solo puede ver "Formulario y Carrito"
      } else if (user.role === "Admin") {
        setCurrentTab(0); // Admin puede ver todo (Formulario, Autorizar, Imprimir)
      }
    }
  }, [user]);

  const handleOpenModal = async (productos, folio) => {
    setProductosModal(productos);
    setSolicitudModalFolio(folio);
    setOpenModal(true);

    // Si quieres obtener ubicaciones del primer producto
    if (productos.length > 0) {
      try {
        const response = await axios.get(
          `http://66.232.105.87:3007/api/muestras/ubicaciones/${productos[0].codigo}`
        );
        setUbicaciones(response.data.map((u) => u.ubicacion));
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
        setUbicaciones([]);
      }
    }
  };

  const [reabrirModal, setReabrirModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductosModal([]); // Limpiar datos si quieres
    setSolicitudSeleccionada(null); // o setOpenParentModal(false) si es otro estado
  };

  const obtenerDepartamentos = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/muestras/departamentos"
      );

      let deps = response.data.map((d) => {
        const valueNormalizado = d.value.trim(); // ✅ CAMBIO AQUÍ
        const labelCapitalizado = d.label.trim(); // ✅ CAMBIO AQUÍ

        return {
          value: valueNormalizado,
          label: labelCapitalizado,
        };
      });

      const libres = [
        "Elias Sandler",
        "Eduardo Sandler",
        "Mauricio Sandler",
        "Jonathan Alcantara",
      ];

      if (
        user?.name &&
        usuariosFijos[user.name] &&
        !libres.includes(user.name)
      ) {
        const depAsignado = usuariosFijos[user.name];
        if (!deps.find((d) => d.value === depAsignado)) {
          deps.push({ value: depAsignado, label: depAsignado });
        }
      }

      setDepartamentos(deps);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };

  const handleMotivoChange = (event) => {
    setMotivo(event.target.value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      obtenerDepartamentos();
    }
  }, [user]);

  const [indiceSolicitudActiva, setIndiceSolicitudActiva] = useState(null);

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (!user || !user.name || !departamento || !uso) {
      setAlerta(true);
      setAlertaMessage("¡Por favor complete todos los campos obligatorios!");
      return;
    }

    // ✅ Validación nueva: forzar a elegir una opción de entrega
    const recogeSolicitante = detalleEnvio === `Se entrega a ${user.name}`;
    const envioRequerido = requiereEnvio && detalleEnvio.trim() !== "";

    if (!recogeSolicitante && !envioRequerido && !mostrarObservaciones) {
      setAlerta(true);
      setAlertaMessage(
        "Debe seleccionar si recoge el solicitante o si requiere envío."
      );
      return;
    }

    const motivoFinal = uso === "Laboratorio/Certificacion" ? motivo : uso;

    const nuevaSolicitud = {
      uso,
      nombre: user.name,
      departamento,
      motivo,
      laboratorio: uso === "Laboratorio/Certificacion" ? laboratorio : null,
      organismo_certificador:
        uso === "Laboratorio/Certificacion" ? organismo : null,
      regresaArticulo,
      fecha: regresaArticulo ? fecha : null,
      requiereEnvio: envioRequerido, // ✅ esto se asegura de que sí sea true solo si aplica
      detalleEnvio: detalleEnvio || "",
      carrito: solicitudes[indiceSolicitudActiva]?.carrito || [],
      autorizado: false,
      enviadoParaAutorizar: false,
      observaciones: observaciones || "",
    };

    let nuevasSolicitudes;

    if (indiceSolicitudActiva !== null) {
      nuevasSolicitudes = [...solicitudes];
      nuevasSolicitudes[indiceSolicitudActiva] = nuevaSolicitud;
    } else {
      nuevasSolicitudes = [...solicitudes, nuevaSolicitud];
      setIndiceSolicitudActiva(nuevasSolicitudes.length - 1);
    }

    setSolicitudes(nuevasSolicitudes);
    setVista("carrito");
  };

  const handleCodigoChange = (event) => {
    const value = event.target.value;
    setCodigo(value);

    // Si hay un "timeout" previo, lo limpia para esperar el nuevo valor
    clearTimeout(timeoutId);

    // Establece un nuevo "timeout" para ejecutar la búsqueda después de 500ms
    timeoutId = setTimeout(() => {
      buscarProducto(value);
    }, 500);
  };

  const buscarProducto = async (codigo) => {
    if (codigo.trim() === "") {
      setProducto(null);
      return;
    }

    try {
      const response = await axios.get(
        `http://66.232.105.87:3007/api/muestras/producto/${codigo}`
      );

      // Verifica la estructura de la respuesta
      console.log("Producto recibido:", response.data);

      setProducto(response.data); // Asigna la respuesta del producto
    } catch (error) {
      console.error("Error al buscar el producto:", error);
      setProducto(null);
    }
  };

  const agregarAlCarrito = () => {
    if (!producto || !producto.codigo || cantidad <= 0) {
      setAlerta(true);
      setAlertaMessage("Producto no válido o cantidad incorrecta");
      return;
    }

    const totalPiezas = cantidad * (producto._pz || 1); // 👈 Calculas antes de usarla

    const item = {
      codigo: producto.codigo,
      des: producto.des,
      imagen: `../assets/image/img_pz/${producto.codigo}.jpg`,
      cantidad,
      ubi: String(totalPiezas),
      um: producto.um || "", // ✅ Aquí se agrega
    };

    const lastSolicitudIndex = solicitudes.length - 1;
    if (lastSolicitudIndex < 0) {
      setAlerta(true);
      setAlertaMessage(
        "No hay ninguna solicitud activa para agregar productos."
      );
      return;
    }

    const currentSolicitud = solicitudes[lastSolicitudIndex];

    const productoExistente = currentSolicitud.carrito.find(
      (p) => p.codigo === item.codigo
    );

    let updatedCarrito;
    if (productoExistente) {
      updatedCarrito = currentSolicitud.carrito.map((p) =>
        p.codigo === item.codigo ? { ...p, cantidad: p.cantidad + cantidad } : p
      );
    } else {
      updatedCarrito = [...currentSolicitud.carrito, item];
    }

    const updatedSolicitud = { ...currentSolicitud, carrito: updatedCarrito };
    const updatedSolicitudes = [
      ...solicitudes.slice(0, lastSolicitudIndex),
      updatedSolicitud,
    ];

    setSolicitudes(updatedSolicitudes);

    setCodigo(""); // limpiar
    setCantidad(1);
    setProducto(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const autorizarSolicitud = async (folio) => {
    try {
      // Actualiza en el backend
      await axios.patch(
        `http://66.232.105.87:3007/api/muestras/solicitudes/${folio}`,
        {
          autorizado: true,
          enviadoParaAutorizar: true,
          autorizado_por: user.name,
        }
      );

      // Actualiza en frontend
      const solicitudIndex = solicitudes.findIndex((s) => s.folio === folio);
      if (solicitudIndex === -1) return;

      const solicitudAutorizada = {
        ...solicitudes[solicitudIndex],
        autorizado: true,
        enviadoParaAutorizar: true,
        autorizado_por: user.name, // ✅ AÑADIDO AL ESTADO
      };

      const nuevasSolicitudes = [...solicitudes];
      nuevasSolicitudes.splice(solicitudIndex, 1);
      setSolicitudes(nuevasSolicitudes);

      setSolicitudesAutorizadas([
        ...solicitudesAutorizadas,
        solicitudAutorizada,
      ]);
    } catch (error) {
      console.error("❌ Error al autorizar solicitud:", error);
      setAlerta(true);
      setAlertaMessage("No se pudo autorizar la solicitud.");
    }
    await obtenerSolicitudesAutorizadas(); // 🔥 Esto actualiza con los datos correctos
  };

  const borrarSolicitudAutorizada = async (folio) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: `Esta acción eliminará la solicitud ${folio}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar",
      });

      if (confirmacion.isConfirmed) {
        await axios.delete(
          `http://66.232.105.87:3007/api/muestras/solicitudes/${folio}`
        );

        // 🔁 ACTUALIZA EL ESTADO PARA QUE LA TABLA SE REFRESQUE
        setSolicitudesAutorizadas((prev) =>
          prev.filter((sol) => sol.folio !== folio)
        );

        Swal.fire(
          "Eliminado",
          "La solicitud fue eliminada correctamente.",
          "success"
        );
      }
    } catch (error) {
      console.error("❌ Error al borrar solicitud:", error);
      Swal.fire("Error", "No se pudo eliminar la solicitud.", "error");
    }
  };

  const solicitudesAutorizadasFiltradas = solicitudesAutorizadas;

  const enviarAAutorizar = async () => {
    if (enviandoSolicitud) return; // ⛔ evita doble clic
    setEnviandoSolicitud(true); // 🔒 bloquea el botón

    if (solicitudes.length === 0) {
      setAlerta(true);
      setAlertaMessage("No hay solicitudes para enviar a autorizar.");
      setEnviandoSolicitud(false); // 🔓 desbloquea si hay error
      return;
    }

    const lastSolicitudIndex = solicitudes.length - 1;
    const lastSolicitud = { ...solicitudes[lastSolicitudIndex] };

    if (!lastSolicitud.carrito || lastSolicitud.carrito.length === 0) {
      setEnviandoSolicitud(false);
      await Swal.fire({
        icon: "warning",
        title: "Sin Productos para las Muestras",
        text: "Debes agregar al menos un producto antes de enviar la solicitud.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!lastSolicitud.enviadoParaAutorizar) {
      lastSolicitud.enviadoParaAutorizar = true;

      try {
        await axios.post(
          "http://66.232.105.87:3007/api/muestras/solicitudes",
          lastSolicitud
        );

        setSolicitudes((prev) => {
          const copia = [...prev];
          copia[lastSolicitudIndex] = lastSolicitud;
          return copia;
        });

        setCurrentTab(1);
      } catch (error) {
        console.error("❌ Error al enviar a autorizar:", error);
        setAlerta(true);
        setAlertaMessage("Error al enviar solicitud.");
      }
    }

    setEnviandoSolicitud(false); // 🔓 desbloquea al final
  };

  const guardarSolicitudes = async (arr) => {
    setSolicitudes(arr);
    try {
      await axios.post(
        "http://66.232.105.87:3007/api/muestras/solicitudes",
        arr[arr.length - 1]
      );
    } catch (error) {
      console.error("Error al guardar solicitudes:", error);
      setAlerta(true);
      setAlertaMessage("Error al guardar solicitudes en el servidor");
    }
  };

  const guardarAutorizadas = async (arr) => {
    setSolicitudesAutorizadas(arr);
    try {
      await axios.post(
        "http://66.232.105.87:3007/api/muestras/solicitudes",
        arr
      );
    } catch (error) {
      console.error("Error al guardar autorizadas:", error);
      setAlerta(true);
      setAlertaMessage(
        "Error al guardar solicitudes autorizadas en el servidor"
      );
    }
  };

  const removeProduct = async (codigo, folio) => {
    setOpenModal(false); // 🔒 Cierra temporalmente el modal
    setReabrirModal(true); // 🔁 Indica que debe reabrirse si se cancela

    const confirmacion = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Este producto será removido de la solicitud.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      setOpenModal(true); // ❌ No se eliminó, vuelve a mostrar el modal
      setReabrirModal(false);
      return;
    }

    try {
      // 🔥 Eliminar del backend solo si ya fue guardado
      if (folio) {
        await axios.delete(
          `http://66.232.105.87:3007/api/muestras/solicitudes/${folio}/producto/${codigo}`
        );
      }

      const nuevasSolicitudes = [...solicitudes];
      const index = nuevasSolicitudes.findIndex((s) => s.folio === folio);
      if (index !== -1) {
        const productosActualizados = nuevasSolicitudes[index].carrito.filter(
          (p) => p.codigo !== codigo
        );
        nuevasSolicitudes[index].carrito = productosActualizados;

        setSolicitudes(nuevasSolicitudes);
        setProductosModal(productosActualizados);
      }

      Swal.fire("Eliminado", "Producto eliminado correctamente.", "success");
      setReabrirModal(false);
    } catch (error) {
      console.error("❌ Error al eliminar el producto:", error);
      Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      if (reabrirModal) setOpenModal(true); // Reabre si hubo error
      setReabrirModal(false);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
    obtenerSolicitudesAutorizadas();
  }, []);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/muestras/solicitudes"
        );
        setSolicitudes(response.data);
      } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error);
      }
    };

    cargarSolicitudes();
  }, []);

  const normalizarSolicitudes = (data) =>
    data.map((s) => ({
      ...s,
      requiereEnvio: s.requiere_envio === 1,
      detalleEnvio: s.detalle_envio,
      regresaArticulo: s.regresa_articulo === 1,
      sin_material: s.sin_material === 1,
    }));

  const obtenerSolicitudes = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/muestras/solicitudes"
      );
      const normalizadas = normalizarSolicitudes(response.data);
      setSolicitudes(normalizadas);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  const obtenerSolicitudesAutorizadas = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/muestras/autorizadas"
      );
      const normalizadas = normalizarSolicitudes(response.data);
      setSolicitudesAutorizadas(normalizadas);
    } catch (error) {
      console.error("Error al obtener autorizadas:", error);
    }
  };

  const borrarSolicitud = async (folio) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: `Esta acción eliminará la solicitud ${folio}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar",
      });

      if (confirmacion.isConfirmed) {
        await axios.delete(
          `http://66.232.105.87:3007/api/muestras/solicitudes/${folio}`
        );

        // 🔁 ACTUALIZA EL ESTADO PARA QUE LA TABLA SE REFRESQUE
        setSolicitudesAutorizadas((prev) =>
          prev.filter((sol) => sol.folio !== folio)
        );

        Swal.fire(
          "Eliminado",
          "La solicitud fue eliminada correctamente.",
          "success"
        );
      }
    } catch (error) {
      console.error("❌ Error al borrar solicitud:", error);
      Swal.fire("Error", "No se pudo eliminar la solicitud.", "error");
    }
  };

  //cancelar solicitud

  const cancelarSolicitud = async (folio) => {
    try {
      await axios.patch(
        `http://66.232.105.87:3007/api/muestras/solicitudes/${folio}`,
        {
          autorizado: 2, // ❌ Cancelado
          enviadoParaAutorizar: true,
          autorizado_por: user.name,
        }
      );

      // Quitarla visualmente de la lista activa
      setSolicitudes((prev) => prev.filter((s) => s.folio !== folio));

      Swal.fire(
        "Cancelada",
        "La solicitud fue marcada como cancelada.",
        "info"
      );
    } catch (error) {
      console.error("❌ Error al cancelar solicitud:", error);
      Swal.fire("Error", "No se pudo cancelar la solicitud.", "error");
    }
  };

  //cantidad surtida

  const [modalSurtidoOpen, setModalSurtidoOpen] = useState(false);

  const abrirModalSurtido = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalSurtidoOpen(true);
  };

  const guardarSurtido = async () => {
    const errores = [];

    solicitudSeleccionada.carrito.forEach((item) => {
      const solicitada = parseInt(item.cantidad);
      const surtida = parseInt(item.cantidad_surtida || 0);

      if (surtida > solicitada) {
        errores.push(
          `Código ${item.codigo} - Surtido (${surtida}) mayor a solicitado (${solicitada})`
        );
      }
    });

    if (errores.length > 0) {
      setModalSurtidoOpen(false); // 👈 CIERRA EL MODAL PRIMERO

      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Cantidad inválida",
          html: `Las siguientes líneas tienen errores:<br><br><ul style="text-align: left;">${errores
            .map((e) => `<li>${e}</li>`)
            .join("")}</ul>`,
        });
      }, 200); // espera pequeña para que el DOM cierre el modal

      return;
    }

    try {
      const payload = {
        folio: solicitudSeleccionada.folio,
        it: solicitudSeleccionada.IT || "",
        carrito: solicitudSeleccionada.carrito.map((item) => ({
          codigo: item.codigo,
          cantidad_surtida: parseInt(item.cantidad_surtida || 0),
        })),
      };

      await axios.post(
        "http://66.232.105.87:3007/api/muestras/surtido",
        payload
      );

      setSolicitudesAutorizadas((prev) =>
        prev.map((sol) =>
          sol.folio === solicitudSeleccionada.folio
            ? { ...sol, IT: solicitudSeleccionada.IT }
            : sol
        )
      );

      setModalSurtidoOpen(false);
      setTimeout(() => {
        Swal.fire("Éxito", "Cantidades surtidas guardadas", "success");
      }, 200);
    } catch (error) {
      console.error("❌ Error al guardar surtido:", error);
      Swal.fire(
        "Error",
        "No se pudieron guardar las cantidades surtidas",
        "error"
      );
    }
  };

  const handleSurtidoChange = (index, value) => {
    setSolicitudSeleccionada((prev) => {
      const copia = { ...prev };
      copia.carrito[index].cantidad_surtida = parseInt(value, 10) || 0;
      return copia;
    });
  };

  const registrarSalida = async (folio) => {
    try {
      const solicitud = solicitudesAutorizadas.find((s) => s.folio === folio);

      if (!solicitud) {
        return Swal.fire("Error", "Solicitud no encontrada", "error");
      }

      // 🔍 Si NO hay fin de embarque (nombre o fecha), primero registrar embarque
      if (!solicitud.fin_embarcado_at) {
        const confirmar = await Swal.fire({
          title: "¿Registrar fin de embarque?",
          text: "Aún no se ha registrado el fin de embarque. ¿Deseas hacerlo ahora?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, registrar embarque",
          cancelButtonText: "Cancelar",
        });

        if (!confirmar.isConfirmed) return;

        await axios.patch(
          `http://66.232.105.87:3007/api/muestras/embarque/${folio}`,
          {
            fin_embarcado_por: user.name,
          }
        );

        Swal.fire(
          "✅ Listo",
          "Fin de embarque registrado correctamente",
          "success"
        );
        await obtenerSolicitudesAutorizadas();
        return; // ⛔ Ya no hace más, espera segundo clic para registrar salida
      }

      // ✅ Si YA hay fin de embarque, ahora sí registrar salida
      const confirmarSalida = await Swal.fire({
        title: "¿Registrar salida?",
        text: "Ya se ha registrado el embarque. ¿Deseas registrar ahora la salida?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, registrar salida",
        cancelButtonText: "Cancelar",
      });

      if (!confirmarSalida.isConfirmed) return;

      await axios.patch(
        `http://66.232.105.87:3007/api/muestras/salida/${folio}`,
        {
          salida_por: user.name,
        }
      );

      Swal.fire("✅ Listo", "Salida registrada correctamente", "success");
      await obtenerSolicitudesAutorizadas();
    } catch (error) {
      console.error("❌ Error en proceso de salida:", error);
      Swal.fire("Error", "No se pudo completar el proceso", "error");
    }
  };

  //configuracion de los departamentos

  const configuracionPorDepartamento = {
    Calidad: {
      usos: [
        "Laboratorio/Certificacion",
        "Nuevos Productos",
        "Cambios fisicos garantias",
        "Comparativos",
      ],
      motivos: {
        "Laboratorio/Certificacion": [],
        "Nuevos Productos": [],
        "Cambios fisicos garantias": [],
        Comparativos: [],
      },
    },
    Cedis: {
      usos: ["Uso Interno"],
      motivos: {
        "Uso Interno": [],
      },
    },
    Compras: {
      usos: ["Campo abierto"],
      motivos: {
        "Campo abierto": [],
      },
    },
    Desarrollo: {
      usos: ["Pruebas de funcionamiento"],
      motivos: {
        "Pruebas de funcionamiento": [],
      },
    },
    Departamental: {
      usos: [
        "Walmart",
        "Futurama",
        "Walmart GS1",
        "Walmart La Naranja",
        "Casa Ley",
        "Dollar General",
        "Tiendas 3B",
        "Tiendas del sol",
        "Smart",
        "Especificaciones de producto",
        "Chedraui",
        "Tramontina",
        "Sears",
        "HEB",
        "Liverpool",
        "Coppel",
        "Soriana",
        "SODIMAC",
        "Waldos",
        "Central Detallista",
        "Merco",
      ],
      motivos: {
        Walmart: [],
        Futurama: [],
        "Walmart GS1": [],
        "Walmart La Naranja": [],
        "Casa Ley": [],
        "Dollar General": [],
        "Tiendas 3B": [],
        "Tiendas del sol": [],
        Smart: [],
        "Especificaciones de producto": [],
        Chedraui: [],
        Tramontina: [],
        Sears: [],
        HEB: [],
        Liverpool: [],
        Coppel: [],
        Soriana: [],
        SODIMAC: [],
        Waldos: [],
        "Central Detallista": [],
        Merco: [],
      },
    },
    Direccion: {
      usos: [
        "Material para Elias Sandler",
        "Material para Eduardo Sandler",
        "Material para Mauricio Sandler",
      ],
      motivos: {
        "Material para Elias Sandler": [],
        "Material para Eduardo Sandler": [],
        "Material para Mauricio Sandler": [],
      },
    },
    Diseño: {
      usos: ["Toma de fotografias y video", "Revision de empaque"],
      motivos: {
        "Toma de fotografias y video": [],
        "Revision de empaque": [],
      },
    },
    Exportaciones: {
      usos: ["Para clientes varios"],
      motivos: {
        "Para clientes varios": [],
      },
    },
    Mercadotecnia: {
      usos: ["Expo Ferretera", "Toma de fotografias y video"],
      motivos: {
        "Expo Ferretera": [],
        "Toma de fotografias y video": [],
      },
    },
    Planta: {
      usos: [
        "Equipo De Proteccion Personal",
        "Herramientas De Uso Comun",
        "Consumibles De Proceso",
        "Material Para Mantenimiento",
        "Material Para Proyectos",
        "Muestras De Producto",
      ],
      motivos: {
        "Equipo De Proteccion Personal": [],
        "Herramientas De Uso Comun": [],
        "Consumibles De Proceso": [],
        "Material Para Mantenimiento": [],
        "Material Para Proyectos": [],
        "Muestras De Producto": [],
      },
    },
    "Recursos Humanos": {
      usos: ["Uso Interno"],
      motivos: {
        "Uso Interno": [],
      },
    },
    "E-commerce": {
      usos: ["Toma de fotografias y video"],
      motivos: {
        "Toma de fotografias y video": [],
      },
    },
    "Taller POP": {
      usos: ["Uso Interno", "Expo Ferretera"],
      motivos: {
        "Uso Interno": [],
        "Expo Ferretera": [],
      },
    },
  };

  const normalizarDepartamento = (nombre) => {
    const capitalizar = (str) =>
      str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const excepciones = {
      MECARDOTECNIA: "Mercadotecnia",
      "RECURSOS HUMANOS": "Recursos Humanos",
      "E-COMMERCE": "E-commerce",
      "TALLER POP": "Taller POP",
      DISEÑO: "Diseño",
    };

    return excepciones[nombre] || capitalizar(nombre);
  };

  const [uso, setUso] = useState("");

  const [laboratorio, setLaboratorio] = useState("");
  const [organismo, setOrganismo] = useState("");

  const laboratorios = [
    "Ampliequipos",
    "Tecnom",
    "Nyce",
    "Ance",
    "Comecer",
    "Prucer",
    "Santul",
    "Tesso",
  ];

  const organismosCertificadores = [
    "Solnom",
    "Normalitec",
    "Factual",
    "Mexen",
    "Intertrade",
    "Nyce",
    "Ance",
    "Comecer",
  ];

  const [departamentoBloqueado, setDepartamentoBloqueado] = useState(false);
  const [nombre, setNombre] = useState(""); // si no lo tienes ya

  const usuariosFijos = {
    "Luis Angel Flores Barbosa": "Calidad",
    "Axel Squivias Sanchez": "Compras",
    "Marleni Moreno": "Compras",
    "Nadia Cano": "Compras",
    "Rocio Mancilla": "Compras",
    "Abraham arenas": "Compras",
    "Laura Carbajal": "Compras",
    "Ariel Ramírez": "Compras",
    "Daniela Mondragón": "Compras",
    "Joel Duran": "Compras",
    "Katia Daniela Martinez Mo": "Departamental",
    "Miriam Zayanni Meneses Te": "Departamental",
    "Montserrat Roa Nava": "Departamental",
    "Jorge Mario Vallejo Pérez": "Departamental",
    "Francisco Javier Pineda B": "DISEÑO",
    "Brenda Zuleyma Velazquez": "Mercadotecnia",
    "Adriana Miron Cortes": "Planta",
    "Mariana Lucero Ramirez Me": "Recursos Humanos",
    "Michel Escobar Jimenez": "E-COMMERCE",
    "Sergio Regalado Alvarez": "TALLER POP",
    "Enrrique Saavedra": "Cedis",
    "Elias Sandler": "Direccion",
    "Eduardo Sandler": "Direccion",
    "Mauricio Sandler": "Direccion",
    "Jonathan Alcantara": "Direccion",
  };

  useEffect(() => {
    if (user?.name) {
      setNombre(user.name);

      const libres = [
        "Elias Sandler",
        "Eduardo Sandler",
        "Mauricio Sandler",
        "Jonathan Alcantara",
      ];

      if (usuariosFijos[user.name] && !libres.includes(user.name)) {
        const depOriginal = usuariosFijos[user.name];
        setDepartamento(depOriginal);
        setDepartamentoBloqueado(true);
      } else {
        setDepartamentoBloqueado(false);
      }
    }
  }, [user]);

  const [ubicaciones, setUbicaciones] = useState([]);

  const [ubicacionesPorCodigo, setUbicacionesPorCodigo] = useState({});

  const handleOpenSurtidoModal = async (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalSurtidoOpen(true);

    const ubicacionesTemp = {};

    for (const item of solicitud.carrito) {
      try {
        const res = await axios.get(
          `http://66.232.105.87:3007/api/muestras/ubicaciones/${item.codigo}`
        );
        const ubicaciones = res.data.map((u) => u.ubi);
        ubicacionesTemp[item.codigo] =
          ubicaciones.length > 0
            ? ubicaciones
            : ["No hay ubicaciones registradas"];
      } catch (error) {
        console.error(`Error ubicaciones para ${item.codigo}`, error);
        ubicacionesTemp[item.codigo] = ["Error al cargar ubicaciones"];
      }
    }

    setUbicacionesPorCodigo(ubicacionesTemp);
  };

  const [departamentoFiltrado, setDepartamentoFiltrado] = useState("");

  const handleGenerarPDF = async (solicitud) => {
    const pdfCount = parseInt(solicitud.pdf_generado || 0);

    if (pdfCount >= 2) {
      alert(
        "Ya se generaron los dos documentos permitidos para esta solicitud."
      );
      return;
    }

    const generar = async (solicitud, template, nombreArchivo) => {
      const html = template(solicitud); // ahora el template ya genera todas las páginas .page

      const iframe = document.createElement("iframe");
      iframe.style.width = "210mm";
      iframe.style.height = "297mm";
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      document.body.appendChild(iframe);

      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const iframeBody = iframeDoc.body;

      const pdf = new jsPDF("p", "mm", "a4");
      const pages = iframeBody.querySelectorAll(".page");

      for (let j = 0; j < pages.length; j++) {
        const canvas = await html2canvas(pages[j], {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (j > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      document.body.removeChild(iframe);
      pdf.save(nombreArchivo);
    };

    try {
      if (pdfCount === 0) {
        // 🟡 PRIMER PDF – UBICACIONES
        const carritoConUbicaciones = await Promise.all(
          solicitud.carrito.map(async (item) => {
            try {
              const res = await axios.get(
                `http://66.232.105.87:3007/api/muestras/ubicaciones/${item.codigo}`
              );
              const ubicaciones = res.data.map((u) => u.ubi).join(" | ");
              return { ...item, ubicacion: ubicaciones || "N/A" };
            } catch (err) {
              console.error("Error al obtener ubicación:", item.codigo, err);
              return { ...item, ubicacion: "Error" };
            }
          })
        );

        const solicitudConUbicaciones = {
          ...solicitud,
          carrito: carritoConUbicaciones,
        };

        await generar(
          solicitudConUbicaciones,
          pdfUbicacionesTemplate,
          `Ubicaciones_${solicitud.folio}.pdf`
        );
      } else if (pdfCount === 1) {
        // 🔵 SEGUNDO PDF – FINAL
        await generar(
          solicitud,
          pdfTemplate,
          `Solicitud_${solicitud.folio}.pdf`
        );
      }

      // 🔄 Actualiza contador
      await axios.put(
        `http://66.232.105.87:3007/api/muestras/contador-pdf/${solicitud.folio}`
      );
      await obtenerSolicitudesAutorizadas();
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      alert("Error al generar el PDF.");
    }
  };

  const [paginaAutorizadas, setPaginaAutorizadas] = useState(1);
  const [paginaCanceladas, setPaginaCanceladas] = useState(1);
  const registrosPorPagina = 4;

  useEffect(() => {
    setPaginaAutorizadas(1);
    setPaginaCanceladas(1);
  }, [departamentoFiltrado]);

  const autorizadasFiltradas = solicitudesAutorizadas.filter(
    (sol) =>
      sol.autorizado === 1 &&
      (departamentoFiltrado === "" ||
        sol.departamento?.toLowerCase() === departamentoFiltrado.toLowerCase())
  );

  const canceladasFiltradas = solicitudesAutorizadas.filter(
    (sol) =>
      sol.autorizado === 2 &&
      (departamentoFiltrado === "" ||
        sol.departamento?.toLowerCase() === departamentoFiltrado.toLowerCase())
  );

  const totalPaginasAutorizadas = Math.ceil(
    autorizadasFiltradas.length / registrosPorPagina
  );

  const totalPaginasCanceladas = Math.ceil(
    canceladasFiltradas.length / registrosPorPagina
  );

  const autorizadasPaginadas = autorizadasFiltradas.slice(
    (paginaAutorizadas - 1) * registrosPorPagina,
    paginaAutorizadas * registrosPorPagina
  );

  const canceladasPaginadas = canceladasFiltradas.slice(
    (paginaCanceladas - 1) * registrosPorPagina,
    paginaCanceladas * registrosPorPagina
  );

  // Dentro de tu componente Muestras, justo donde defines las funciones:
  const exportarExcel = () => {
    try {
      const filas = autorizadasFiltradas.flatMap((sol) =>
        sol.carrito.map((prod) => ({
          Fecha: moment(sol.created_at).format("DD/MM/YYYY"),
          Código: prod.codigo,
          Descripción: prod.descripcion,
          "Cantidad solicitada": prod.cantidad,
          UM: prod.um || "",
          "Cantidad Surtida": prod.cantidad_surtida ?? "",
          "UM ": prod.um || "",
          Área: sol.departamento,
          Folio: sol.folio,
          Uso: sol.motivo || sol.uso || "",
          Solicitó: sol.nombre,
          Autorizó: sol.autorizado_por || "",
          "Movimiento JDE": "58826", // fijo, o sol.movimiento_jde si lo tienes
          "Fecha de entrega": sol.fin_embarcado_at
            ? moment(sol.fin_embarcado_at).format("DD/MM/YYYY")
            : "",
          Comentario: sol.comentario || `Muestras ${sol.departamento}`,
        }))
      );

      if (filas.length === 0) {
        alert("No hay filas para exportar.");
        return;
      }

      const headers = [
        "Fecha",
        "Código",
        "Descripción",
        "Cantidad solicitada",
        "UM",
        "Cantidad Surtida",
        "UM ",
        "Área",
        "Folio",
        "Uso",
        "Solicitó",
        "Autorizó",
        "Movimiento JDE",
        "Fecha de entrega",
        "Comentario",
      ];

      const ws = XLSX.utils.json_to_sheet(filas, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Surtido");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        "Surtido_Solicitudes.xlsx"
      );
    } catch (err) {
      console.error("Error al exportar Excel:", err);
      alert("Hubo un problema al generar el Excel.");
    }
  };

  useEffect(() => {
    if (user?.name) {
      const depUsuario = usuariosFijos[user.name];

      const departamentosLibres = ["Direccion"]; // departamentos que pueden ver todo

      if (depUsuario && !departamentosLibres.includes(depUsuario)) {
        setDepartamento(depUsuario);
        setDepartamentoBloqueado(true);
        setDepartamentoFiltrado(depUsuario); // Forzar el filtro
      } else {
        setDepartamento("");
        setDepartamentoBloqueado(false);
        setDepartamentoFiltrado(""); // Libre elección
      }
    }
  }, [user]);

  // sin material

  const [marcandoSinMaterial, setMarcandoSinMaterial] = useState(false);

  const marcarSinMaterial = async (folio) => {
    setMarcandoSinMaterial(true);
    try {
      await axios.post(
        `http://66.232.105.87:3007/api/muestras/sin-material/${folio}`,
        { sin_material_por: user.name } // Aquí mandas el nombre correctamente
      );
      Swal.fire(
        "Sin material",
        "La solicitud fue marcada como SIN MATERIAL.",
        "info"
      );
      await obtenerSolicitudesAutorizadas(); // Recarga la tabla
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo marcar como sin material.", "error");
    }
    setMarcandoSinMaterial(false);
  };

  return (
    <Container component="main" maxWidth="auto">
      <Tabs value={currentTab} onChange={handleTabChange} centered>
        {/* Solo Admin, INV y Master pueden ver "Formulario y Carrito" */}
        <Tab
          label="Formulario"
          disabled={
            user?.role !== "Admin" &&
            user?.role !== "INV" &&
            user?.role !== "Master" &&
            user?.role !== "Mue" &&
            user?.role !== "Mues" &&
            user?.role !== "Audi" &&
            user?.role !== "Nac2" &&
            user?.role !== "Ins" &&
            user?.role !== "Nac"
          }
        />
        {/* Solo Admin y Master pueden ver "Autorizar" */}
        <Tab
          label="Autorizar"
          disabled={user?.role !== "Admin" && user?.role !== "Master"}
        />
        {/* Solo Admin e INV pueden ver "Imprimir" */}
        <Tab
          label="Reportes"
          disabled={
            user?.role !== "Admin" &&
            user?.role !== "INV" &&
            user?.role !== "Master" &&
            user?.role !== "Mue" &&
            user?.role !== "Audi" &&
            user?.role !== "Nac2" &&
            user?.role !== "Ins" &&
            user?.role !== "Mues" &&
            user?.role !== "Nac"
          }
        />
      </Tabs>

      <Box mt={3}>
        {currentTab === 0 && (
          <Paper elevation={3} style={{ padding: "20px" }}>
            {vista === "formulario" && (
              <Paper
                elevation={3}
                style={{ padding: "20px", marginBottom: "20px" }}
              >
                <Typography variant="h5" align="center" gutterBottom>
                  Formulario de Solicitud
                </Typography>

                <form onSubmit={manejarEnvio}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Nombre del solicitante"
                        variant="outlined"
                        fullWidth
                        value={user?.name || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Departamento</InputLabel>
                        <Select
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                          disabled={departamentoBloqueado}
                          displayEmpty
                        >
                          {departamentoBloqueado && (
                            <MenuItem value={departamento}>
                              {departamento}
                            </MenuItem>
                          )}
                          {!departamentoBloqueado &&
                            departamentos.map((dep) => (
                              <MenuItem key={dep.value} value={dep.value}>
                                {dep.label}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      {departamento && (
                        <Grid item xs={12}>
                          <FormControl fullWidth required>
                            <InputLabel>Uso</InputLabel>
                            <Select
                              value={uso}
                              onChange={(e) => {
                                setUso(e.target.value);
                                setMotivo("");
                                setLaboratorio("");
                                setOrganismo("");
                              }}
                            >
                              {(
                                configuracionPorDepartamento[
                                  normalizarDepartamento(departamento)
                                ]?.usos || []
                              ).map((u) => (
                                <MenuItem key={u} value={u}>
                                  {u}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      {uso === "Laboratorio/Certificacion" && (
                        <>
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <InputLabel>Laboratorio</InputLabel>
                              <Select
                                value={laboratorio}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setLaboratorio(value);
                                  setOrganismo(""); // 🔄 Ya no necesitas organismosPorLaboratorio
                                }}
                              >
                                {laboratorios.map((lab) => (
                                  <MenuItem key={lab} value={lab}>
                                    {lab}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <br></br>

                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <InputLabel>Organismo Certificador</InputLabel>
                              <Select
                                value={organismo}
                                onChange={(e) => setOrganismo(e.target.value)}
                              >
                                {organismosCertificadores.map((org) => (
                                  <MenuItem key={org} value={org}>
                                    {org}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <br></br>
                        </>
                      )}
                    </Grid>

                    {/* Ambos campos visibles, sin dependencias */}
                    <Grid item xs={12}>
                      <Grid
                        container
                        spacing={2}
                        direction="row"
                        alignItems="center"
                      >
                        <Grid item>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mostrarObservaciones}
                                onChange={(e) => {
                                  setMostrarObservaciones(e.target.checked);
                                  if (!e.target.checked) {
                                    setObservaciones("");
                                  }
                                }}
                                color="primary"
                              />
                            }
                            label="Observaciones"
                          />
                        </Grid>

                        <Grid item>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={regresaArticulo}
                                onChange={(e) =>
                                  setRegresaArticulo(e.target.checked)
                                }
                                color="primary"
                              />
                            }
                            label="¿Regresa artículo?"
                          />
                        </Grid>

                        <Grid item>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  detalleEnvio === `Se entrega a ${user?.name}`
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDetalleEnvio(
                                      `Se entrega a ${user?.name}`
                                    );
                                    setRequiereEnvio(false);
                                  } else {
                                    setDetalleEnvio("");
                                  }
                                }}
                                color="primary"
                              />
                            }
                            label="¿Recoge el solicitante?"
                          />
                        </Grid>

                        {["DIRECCION", "DEPARTAMENTAL"].includes(
                          departamento.toUpperCase()
                        ) && (
                          <Grid item>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={requiereEnvio}
                                  onChange={(e) => {
                                    setRequiereEnvio(e.target.checked);
                                    if (e.target.checked) {
                                      setDetalleEnvio("");
                                    }
                                  }}
                                  color="primary"
                                />
                              }
                              label="¿Requiere envío?"
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>

                    {/* Si "Regresa artículo" está seleccionado, muestra la fecha de devolución */}
                    {regresaArticulo && (
                      <Grid item xs={12}>
                        <TextField
                          label="Fecha de devolución"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          required
                        />
                      </Grid>
                    )}

                    {(requiereEnvio ||
                      detalleEnvio === `Se entrega a ${user?.name}`) && (
                      <Grid item xs={12}>
                        <TextField
                          label={
                            detalleEnvio === `Se entrega a ${user?.name}`
                              ? "Lugar de entrega"
                              : "Cómo se envía"
                          }
                          variant="outlined"
                          fullWidth
                          required
                          value={detalleEnvio}
                          onChange={(e) => setDetalleEnvio(e.target.value)}
                          InputProps={{
                            readOnly:
                              detalleEnvio === `Se entrega a ${user?.name}`,
                          }}
                        />
                      </Grid>
                    )}

                    {mostrarObservaciones && (
                      <Grid item xs={12}>
                        <TextField
                          label="Observaciones"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                      >
                        Continuar
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            )}

            {vista === "carrito" && (
              <Paper elevation={3} style={{ padding: "20px" }}>
                <Typography variant="h5" align="center" gutterBottom>
                  Carrito de Solicitudes
                </Typography>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    const sol = solicitudes[indiceSolicitudActiva];
                    if (sol) {
                      setUso(sol.uso);
                      setMotivo(sol.motivo);
                      setDepartamento(sol.departamento);
                      setDetalleEnvio(sol.detalleEnvio || "");
                      setRegresaArticulo(sol.regresaArticulo || false);
                      setFecha(sol.fecha || "");
                      setRequiereEnvio(sol.requiereEnvio || false);
                      setLaboratorio(sol.laboratorio || "");
                      setOrganismo(sol.organismo_certificador || "");
                    }
                    setVista("formulario");
                  }}
                  style={{ marginBottom: "16px" }}
                >
                  ← Regresar al formulario
                </Button>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Código del Producto"
                      variant="outlined"
                      fullWidth
                      value={codigo}
                      onChange={handleCodigoChange} // Llama a la función que maneja el cambio
                    />
                  </Grid>
                </Grid>

                {producto && (
                  <TableContainer
                    component={Paper}
                    style={{ marginTop: "20px" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Imagen</TableCell>
                          <TableCell>Código</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell>UM - Cantidad</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <img
                              src={`../assets/image/img_pz/${producto.codigo}.jpg`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/assets/image/img_pz/noimage.png";
                              }}
                              alt="Producto"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                          </TableCell>
                          <TableCell>{producto.codigo}</TableCell>
                          <TableCell>{producto.des}</TableCell>
                          <TableCell>
                            {producto.um} - {producto._pz}
                          </TableCell>

                          <TableCell>
                            <Grid container spacing={1} alignItems="center">
                              <Grid item>
                                <IconButton
                                  onClick={() =>
                                    setCantidad(cantidad > 1 ? cantidad - 1 : 1)
                                  }
                                  sx={{ minWidth: "40px", padding: "10px" }}
                                  title="Disminuir cantidad"
                                >
                                  <RemoveCircleOutlineIcon />
                                </IconButton>
                              </Grid>
                              <Grid item>
                                <TextField
                                  type="number"
                                  value={cantidad}
                                  onChange={(e) =>
                                    setCantidad(Number(e.target.value))
                                  }
                                  inputProps={{ min: 1 }}
                                  style={{ width: "80px", textAlign: "center" }}
                                />
                              </Grid>
                              <Grid item>
                                <IconButton
                                  onClick={() => setCantidad(cantidad + 1)}
                                  sx={{ minWidth: "40px", padding: "10px" }}
                                  title="Aumentar cantidad"
                                >
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2">
                                  Total:{" "}
                                  <strong>
                                    {cantidad * (producto._pz || 1)} piezas
                                  </strong>
                                </Typography>
                              </Grid>
                            </Grid>
                          </TableCell>

                          <TableCell>
                            <Button
                              sx={{
                                backgroundColor: "green",
                                color: "white",
                                "&:hover": { backgroundColor: "darkgreen" },
                              }}
                              onClick={agregarAlCarrito}
                              startIcon={<AddShoppingCartIcon />}
                            >
                              Agregar
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {solicitudes.length > 0 && (
                  <>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Typography variant="h6">
                        Productos en la Última Solicitud:
                      </Typography>
                    </Box>
                    <TableContainer
                      component={Paper}
                      style={{ marginTop: "20px" }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Imagen</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Cantidad (UM)</TableCell>
                            <TableCell>Total Piezas</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {solicitudes[solicitudes.length - 1].carrito.map(
                            (item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.codigo}</TableCell>
                                <TableCell>
                                  <img
                                    src={`../assets/image/img_pz/${item.codigo}.jpg`}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "/assets/image/img_pz/noimage.png";
                                    }}
                                    alt="Producto"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{item.des}</TableCell>
                                <TableCell>{item.cantidad}</TableCell>
                                <TableCell>{item.ubi}</TableCell>
                                <TableCell>
                                  <IconButton
                                    onClick={() => {
                                      const folio =
                                        solicitudes[solicitudes.length - 1]
                                          .folio;
                                      removeProduct(item.codigo, folio);
                                    }}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={enviarAAutorizar}
                        disabled={enviandoSolicitud}
                      >
                        {enviandoSolicitud
                          ? "Enviando..."
                          : "Enviar a Autorizar"}
                      </Button>
                    </TableContainer>
                  </>
                )}
              </Paper>
            )}
          </Paper>
        )}

        {currentTab === 1 &&
          (user?.role === "Admin" || user?.role === "Master") && (
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h5" align="center" gutterBottom>
                Autorizar Solicitudes
              </Typography>

              {solicitudes.filter(
                (s) =>
                  (s.enviadoParaAutorizar || s.enviado_para_autorizar === 1) &&
                  s.autorizado !== 2 // ⛔ ocultar canceladas
              ).length === 0 && (
                <Typography>No hay solicitudes para autorizar.</Typography>
              )}

              {solicitudes.filter(
                (s) =>
                  (s.enviadoParaAutorizar || s.enviado_para_autorizar === 1) &&
                  s.autorizado !== 2 // ⛔ ocultar canceladas
              ).length > 0 && (
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Folio</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Departamento</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Fecha Devolución</TableCell>
                        <TableCell>Informacion de entrega o de Envio</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Artículos</TableCell>
                        <TableCell>Autorizado</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {solicitudes
                        .filter(
                          (s) =>
                            s.enviadoParaAutorizar ||
                            s.enviado_para_autorizar === 1
                        )
                        .map((sol) => (
                          <TableRow key={sol.folio}>
                            <TableCell>
                              {moment(sol.created_at).format("DD/MM/YYYY")}
                            </TableCell>
                            <TableCell>{sol.folio}</TableCell>
                            <TableCell>{sol.nombre}</TableCell>
                            <TableCell>{sol.departamento}</TableCell>
                            <TableCell>{sol.motivo}</TableCell>
                            <TableCell>
                              {sol.fecha
                                ? new Date(sol.fecha).toLocaleDateString(
                                    "es-MX"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>{sol.detalle_envio || "N/A"}</TableCell>
                            <TableCell>{sol.observaciones || "N/A"}</TableCell>
                            <TableCell>{sol.carrito?.length || 0}</TableCell>
                            <TableCell>
                              {sol.autorizado ? "Sí" : "No"}
                            </TableCell>

                            <TableCell>
                              <Box
                                display="flex"
                                justifyContent="flex-start"
                                alignItems="center"
                              >
                                {sol.autorizado === 0 && (
                                  <>
                                    {/* Botón verde: Autorizar */}
                                    <IconButton
                                      onClick={() =>
                                        autorizarSolicitud(sol.folio)
                                      }
                                      color="success"
                                      title="Autorizar y Generar PDF"
                                      style={{ marginRight: "10px" }}
                                    >
                                      <AddTaskIcon />
                                    </IconButton>

                                    {/* Botón gris: Cancelar / Negar */}
                                    <IconButton
                                      onClick={() =>
                                        cancelarSolicitud(sol.folio)
                                      }
                                      color="error"
                                      title="Cancelar solicitud"
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </>
                                )}

                                <IconButton
                                  onClick={() =>
                                    handleOpenModal(sol.carrito, sol.folio)
                                  }
                                  sx={{ color: "orange" }}
                                  title="Ver productos"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

        {currentTab === 2 && (
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h5" align="center" gutterBottom>
              Imprimir Solicitudes
            </Typography>

            <FormControl sx={{ width: 300, mb: 2 }}>
              <InputLabel>Filtrar por Departamento</InputLabel>
              <Select
                value={departamentoFiltrado}
                label="Filtrar por Departamento"
                onChange={(e) => setDepartamentoFiltrado(e.target.value)}
                disabled={departamentoBloqueado} // bloqueado si departamento es fijo
              >
                {departamentoBloqueado ? (
                  <MenuItem value={departamentoFiltrado}>
                    {departamentoFiltrado}
                  </MenuItem>
                ) : (
                  [
                    <MenuItem key="" value="">
                      Todos los departamentos
                    </MenuItem>,
                    ...departamentos.map((dep) => (
                      <MenuItem key={dep.value} value={dep.label}>
                        {dep.label}
                      </MenuItem>
                    )),
                  ]
                )}
              </Select>
            </FormControl>

            {/* AUTORIZADAS */}
            <Typography variant="h6" gutterBottom>
              Solicitudes Autorizadas
            </Typography>

            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={exportarExcel}
              sx={{
                mb: 2,
                px: 4,
                py: 1,
                textTransform: "none",
              }}
            >
              Exportar a Excel
            </Button>

            {autorizadasFiltradas.length > 0 ? (
              <>
                <TableContainer
                  component={Paper}
                  style={{ marginBottom: "10px" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#. IT</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Folio</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Departamento</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Fecha Devolución</TableCell>
                        <TableCell>Detalles de Envio</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Artículos</TableCell>
                        <TableCell>Autorizado por</TableCell>
                        <TableCell>Embarcado</TableCell>
                        <TableCell>Autorizo Salida</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {autorizadasPaginadas.map((sol) => (
                        <TableRow key={sol.folio}>
                          <TableCell>{sol.IT}</TableCell>
                          <TableCell>
                            {moment(sol.created_at).format("DD/MM/YYYY")}
                          </TableCell>
                          <TableCell>{sol.folio}</TableCell>
                          <TableCell>{sol.nombre}</TableCell>
                          <TableCell>{sol.departamento}</TableCell>
                          <TableCell>{sol.motivo}</TableCell>
                          <TableCell>
                            {sol.fecha
                              ? new Date(sol.fecha).toLocaleDateString("es-MX")
                              : "N/A"}
                          </TableCell>
                          <TableCell>{sol.detalleEnvio || "N/A"}</TableCell>
                          <TableCell>{sol.observaciones || "N/A"}</TableCell>
                          <TableCell>{sol.carrito?.length || 0}</TableCell>
                          <TableCell>{sol.autorizado_por || "N/A"}</TableCell>
                          <TableCell>
                            {sol.fin_embarcado_por
                              ? `${sol.fin_embarcado_por} - ${new Date(
                                  sol.fin_embarcado_at
                                ).toLocaleTimeString("es-MX")}`
                              : "Pendiente"}
                          </TableCell>
                          <TableCell>{sol.salida_por || "Pendiente"}</TableCell>

                          <TableCell>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              gap={1} // espacio entre íconos
                            >
                              <IconButton
                                onClick={() => handleOpenSurtidoModal(sol)}
                                color="info"
                                title="Ver productos"
                              >
                                <VisibilityIcon />
                              </IconButton>

                              {sol.sin_material ? (
                                <Tooltip title="Sin material disponible">
                                  <CancelIcon color="error" fontSize="medium" />
                                </Tooltip>
                              ) : sol.salida_por ? (
                                <Tooltip title="Solicitud finalizada">
                                  <CheckCircleIcon
                                    color="success"
                                    fontSize="medium"
                                  />
                                </Tooltip>
                              ) : (
                                <>
                                  <Tooltip
                                    title={`Generar PDF (${sol.pdf_generado}/2)`}
                                  >
                                    <span>
                                      {(user?.role === "Admin" ||
                                        user?.role === "INV") &&
                                        sol.pdf_generado < 2 && (
                                          <IconButton
                                            onClick={() =>
                                              handleGenerarPDF(sol)
                                            }
                                            title="Generar PDF"
                                          >
                                            <LocalPrintshopIcon />
                                          </IconButton>
                                        )}
                                    </span>
                                  </Tooltip>

                                  {(user?.role === "INV" ||
                                    user?.role === "Admin" ||
                                    user?.role === "Master") && (
                                    <IconButton
                                      onClick={() => registrarSalida(sol.folio)}
                                      color="success"
                                      title={
                                        !sol.fin_embarcado_at
                                          ? "Registrar fin de embarque"
                                          : "Registrar salida"
                                      }
                                    >
                                      <ExitToAppIcon />
                                    </IconButton>
                                  )}

                                  {(user?.role === "INV" ||
                                    user?.role === "Admin") && (
                                    <Tooltip title="Marcar como SIN MATERIAL">
                                      <IconButton
                                        color="primary"
                                        size="medium"
                                        disabled={marcandoSinMaterial}
                                        onClick={() =>
                                          Swal.fire({
                                            title: "¿Marcar como SIN MATERIAL?",
                                            text: "Esto notificará al solicitante que NO hay material disponible.",
                                            icon: "warning",
                                            showCancelButton: true,
                                            confirmButtonText: "Sí, marcar",
                                            cancelButtonText: "Cancelar",
                                          }).then((result) => {
                                            if (result.isConfirmed)
                                              marcarSinMaterial(sol.folio);
                                          })
                                        }
                                      >
                                        <DoNotDisturbIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPaginasAutorizadas}
                    page={paginaAutorizadas}
                    onChange={(event, value) => setPaginaAutorizadas(value)}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Typography>No hay solicitudes autorizadas.</Typography>
            )}

            {/* CANCELADAS */}
            <Typography variant="h5" align="center" gutterBottom>
              Solicitudes Canceladas
            </Typography>

            {canceladasFiltradas.length > 0 ? (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Folio</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Departamento</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Fecha Devolución</TableCell>
                        <TableCell>Detalles Envío</TableCell>
                        <TableCell>Artículos</TableCell>
                        <TableCell>Cancelado por</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {canceladasPaginadas.map((sol) => (
                        <TableRow
                          key={sol.folio}
                          sx={{ backgroundColor: "#f2f2f2" }}
                        >
                          <TableCell>
                            {moment(sol.created_at).format("DD/MM/YYYY")}
                          </TableCell>
                          <TableCell>{sol.folio}</TableCell>
                          <TableCell>{sol.nombre}</TableCell>
                          <TableCell>{sol.departamento}</TableCell>
                          <TableCell>{sol.motivo}</TableCell>
                          <TableCell>
                            {sol.fecha
                              ? new Date(sol.fecha).toLocaleDateString("es-MX")
                              : "N/A"}
                          </TableCell>
                          <TableCell>{sol.detalleEnvio || "N/A"}</TableCell>
                          <TableCell>{sol.carrito?.length || 0}</TableCell>
                          <TableCell>{sol.autorizado_por || "N/A"}</TableCell>
                          {/* <TableCell>
                            {["Admin", "Master", "Master2", "Master3"].includes(user?.role) && (
                              <IconButton
                                onClick={() => borrarSolicitud(sol.folio)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPaginasCanceladas}
                    page={paginaCanceladas}
                    onChange={(event, value) => setPaginaCanceladas(value)}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Typography>No hay solicitudes canceladas.</Typography>
            )}
          </Paper>
        )}

        {/* modal de productos solicitados  */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Productos de la Solicitud</DialogTitle>
          <DialogContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Cantidad (UM)</TableCell>
                  <TableCell>Total Piezas</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosModal.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.imagen}
                        alt="Producto"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.codigo}</TableCell>
                    <TableCell>
                      {item.descripcion || item.des || "Sin descripción"}
                    </TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>{item.ubi || item.ubicacion}</TableCell>

                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() =>
                          removeProduct(item.codigo, solicitudModalFolio)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* modal se confirmar piesas  */}
        <Dialog
          open={modalSurtidoOpen}
          onClose={() => setModalSurtidoOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Productos Surtidos – {solicitudSeleccionada?.folio}
            <IconButton onClick={() => setModalSurtidoOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {/* Campo de texto para IT */}
            <Box mb={2}>
              <TextField
                label="Número de IT"
                variant="outlined"
                fullWidth
                value={solicitudSeleccionada?.IT || ""}
                onChange={(e) => {
                  const itValue = e.target.value;
                  setSolicitudSeleccionada((prev) => ({
                    ...prev,
                    IT: itValue,
                  }));
                }}
              />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Imagen</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Ubicaciones:</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Cantidad Solicitada</TableCell>
                    <TableCell>Total Piezas</TableCell>
                    <TableCell>Cantidad Surtida</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudSeleccionada?.carrito.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <img
                          src={`/assets/image/img_pz/${item.codigo}.jpg`}
                          alt="producto"
                          width={50}
                        />
                      </TableCell>
                      <TableCell>{item.codigo}</TableCell>

                      <TableCell>
                        {ubicacionesPorCodigo[item.codigo] &&
                        ubicacionesPorCodigo[item.codigo].length > 0 ? (
                          <Tooltip
                            title={
                              <ul style={{ margin: 0, padding: 0 }}>
                                {ubicacionesPorCodigo[item.codigo].map(
                                  (ubi, i) => (
                                    <li
                                      key={i}
                                      style={{ listStyleType: "none" }}
                                    >
                                      {ubi}
                                    </li>
                                  )
                                )}
                              </ul>
                            }
                            arrow
                            placement="top-start"
                          >
                            <div
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 120,
                              }}
                            >
                              {ubicacionesPorCodigo[item.codigo]
                                .slice(0, 2)
                                .join(", ")}
                              {ubicacionesPorCodigo[item.codigo].length > 2 &&
                                " ..."}
                            </div>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2">
                            No hay ubicaciones registradas
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>{item.ubi || item.ubicacion}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.cantidad_surtida || ""}
                          onChange={(e) =>
                            handleSurtidoChange(index, e.target.value)
                          }
                          inputProps={{ min: 0, max: item.cantidad }}
                          style={{ width: "80px" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setModalSurtidoOpen(false)}
              color="secondary"
            >
              Cancelar
            </Button>

            {(user?.role === "INV" || user?.role === "Admin") && (
              <Button
                onClick={guardarSurtido}
                variant="contained"
                color="primary"
              >
                Guardar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>

      <Snackbar
        open={alerta}
        autoHideDuration={6000}
        onClose={() => setAlerta(false)}
      >
        <Alert
          onClose={() => setAlerta(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {alertaMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Muestras;

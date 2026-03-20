import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";
import Swal from "sweetalert2";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";

function Insumos() {
  const hoy = new Date().getDay();
  const esDiaLaboral = hoy >= 1 && hoy <= 5;
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const [insumos, setInsumos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingAprobacion, setLoadingAprobacion] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);

  const [openResumen, setOpenResumen] = useState(false);

  const [resumenes, setResumenes] = useState([]);
  const [loadingResumenes, setLoadingResumenes] = useState(false);

  //INSUMO INDIVIDUAL

  // MODAL CONSUMO POR INSUMO (NUEVO)
  const [openConsumoModal, setOpenConsumoModal] = useState(false);
  const [insumoConsumo, setInsumoConsumo] = useState(null);
  const [consumoData, setConsumoData] = useState([]);
  const [loadingConsumoModal, setLoadingConsumoModal] = useState(false);

  const [consumoInsumo, setConsumoInsumo] = useState([]);
  const [insumoSeleccionadoConsumo, setInsumoSeleccionadoConsumo] =
    useState(null);
  const [loadingConsumo, setLoadingConsumo] = useState(false);

  const verConsumoInsumo = async (row) => {
    setOpenConsumoModal(true);
    setInsumoSeleccionadoConsumo(row);
    setLoadingConsumo(true);

    try {
      const res = await axios.get(
        `http://66.232.105.87:3007/insumos/consumo/${row.codigo_insumo}`
      );
      setConsumoInsumo(res.data);
    } catch (error) {
      console.error("Error consumo:", error);
      setConsumoInsumo([]);
    } finally {
      setLoadingConsumo(false);
    }
  };

  const cerrarConsumoModal = () => {
    setOpenConsumoModal(false);
    setInsumoConsumo(null);
    setConsumoData([]);
  };

  const [filaExpandida, setFilaExpandida] = useState(null);
  const [consumoFila, setConsumoFila] = useState({});
  const [loadingFila, setLoadingFila] = useState(false);

  const toggleFila = async (row) => {
    // Si ya está abierta → cerrar
    if (filaExpandida === row.codigo_insumo) {
      setFilaExpandida(null);
      return;
    }

    setFilaExpandida(row.codigo_insumo);
    setLoadingFila(true);

    try {
      const res = await axios.get(
        `http://66.232.105.87:3007/insumos/consumo/${row.codigo_insumo}`
      );

      setConsumoFila((prev) => ({
        ...prev,
        [row.codigo_insumo]: res.data,
      }));
    } catch (error) {
      console.error("Error consumo:", error);
    } finally {
      setLoadingFila(false);
    }
  };
  //  Validacion por meses
  const parseMesLocal = (mes) => {
    const [y, m] = mes.split("-").map(Number);
    return new Date(y, m - 1, 1); // ✅ esto es fecha LOCAL, sin UTC shift
  };

  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  const obtenerMeses = async () => {
    try {
      const { data } = await axios.get(
        "http://66.232.105.87:3007/insumos/solicitudes/meses"
      );

      // Soporta: 1) array directo  2) objeto { meses: [...] }
      const meses = Array.isArray(data) ? data : data?.meses ?? [];

      setMesesDisponibles(meses);

      // (opcional) si quieres ver el pool_time en consola
      if (!Array.isArray(data) && data?.pool_time) {
        console.log("POOL TIME:", data.pool_time);
      }
    } catch (error) {
      console.error("Error meses:", error);
      setMesesDisponibles([]); // para evitar crasheos
    }
  };

  const obtenerResumenes = async () => {
    if (!mesesDisponibles.length) return;

    setLoadingResumenes(true);

    try {
      // Solo los últimos 4 meses
      const meses = mesesDisponibles.slice(0, 4);

      const promesas = meses.map((mes) =>
        axios.get("http://66.232.105.87:3007/insumos/solicitudes/resumen", {
          params: { mes, top: 5 },
        })
      );

      const respuestas = await Promise.all(promesas);

      const data = respuestas.map((r) => r.data);

      setResumenes(data);
    } catch (error) {
      console.error("Error obteniendo resumenes:", error);
      setResumenes([]);
    } finally {
      setLoadingResumenes(false);
    }
  };

  useEffect(() => {
    if (openResumen && mesesDisponibles.length > 0) {
      obtenerResumenes();
    }
  }, [openResumen, mesesDisponibles]);

  // Obtener INSUMOS MAS CONSUMIDOS

  const mesLocalActual = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // ============================
  // Modal Solicitud de Insumo  =
  // ============================

  const [openAprobacion, setOpenAprobacion] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);

  const abrirAprobacion = (row) => {
    setSolicitudSeleccionada(row);
    setOpenAprobacion(true);
    obtenerSolicitudes(); // ya lo tienes
  };

  const showSpinner = () => <CircularProgress size={18} color="success" />;

  const aprobarSolicitud = async () => {
    if (!solicitudSeleccionada) return;

    setLoadingAprobacion(true); // 🔒 bloquea

    try {
      await axios.put(
        `http://66.232.105.87:3007/insumos/aprobar/${solicitudSeleccionada.id}`
      );

      // Actualiza lista sin esperar recargar todo
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === solicitudSeleccionada.id ? { ...s, solicitado: 1 } : s
        )
      );

      setSolicitudSeleccionada({
        ...solicitudSeleccionada,
        solicitado: 1,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al aprobar",
      });
    } finally {
      setLoadingAprobacion(false); // 🔓 desbloquea
    }
  };

  const obtenerSolicitudes = async () => {
    try {
      const res = await axios.get(
        "http://66.232.105.87:3007/insumos/solicitudes"
      );
      setSolicitudes(res.data);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  // ============================
  // Modal Solicitud de Insumo
  // ============================
  const [openSolicitud, setOpenSolicitud] = useState(false);
  const [cantidadSolicitud, setCantidadSolicitud] = useState("");
  const [fechaSolicitud, setFechaSolicitud] = useState(null);

  const abrirSolicitud = (row) => {
    setInsumoSeleccionado(row);
    setCantidadSolicitud("");
    setFechaSolicitud(null);
    setOpenSolicitud(true);
  };

  // Histarial de entradas y salidas de Insumos

  const [openHistorial, setOpenHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialAgrupado, setHistorialAgrupado] = useState({});

  const abrirHistorialGeneral = async () => {
    try {
      const res = await axios.get(
        "http://66.232.105.87:3007/insumos/historial"
      );

      const data = res.data;

      if (data.length === 0) {
        setHistorialAgrupado({});
        setOpenHistorial(true);
        return;
      }

      // Agrupar por mes
      const agrupado = data.reduce((acc, item) => {
        if (!acc[item.mes]) {
          acc[item.mes] = [];
        }
        acc[item.mes].push(item);
        return acc;
      }, {});

      setHistorialAgrupado(agrupado);
      setOpenHistorial(true);
    } catch (error) {
      console.error("Error historial:", error);
    }
  };

  //Movimientos de Insumos
  const [openMovimiento, setOpenMovimiento] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("SALIDA");

  const [movimiento, setMovimiento] = useState({
    cantidad: "",
    area: "",
    entregado_a: "",
  });

  const abrirMovimiento = (row) => {
    setInsumoSeleccionado(row);
    setImagenActual(row.foto_insumos); // ← ESTA LÍNEA FALTABA

    setMovimiento({
      cantidad: "",
      area: "",
      entregado_a: "",
    });

    setTipoMovimiento("SALIDA");
    setOpenMovimiento(true);
  };

  const guardarMovimiento = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const cantidad = Number(movimiento.cantidad);
      const inventarioActual = Number(insumoSeleccionado.inventario);

      // =============================
      // Validaciones
      // =============================

      if (!cantidad || cantidad <= 0) {
        setOpenMovimiento(false);

        Swal.fire({
          icon: "warning",
          title: "Cantidad inválida",
          text: "Ingresa una cantidad mayor a 0",
        });
        return;
      }

      // 🚨 Validación de salida sin inventario
      if (tipoMovimiento === "SALIDA") {
        if (inventarioActual === 0) {
          setOpenMovimiento(false); // ← cerrar el modal primero

          Swal.fire({
            icon: "error",
            title: "Sin inventario",
            text: "No puedes realizar una salida porque el inventario está en 0",
          });

          return;
        }

        if (cantidad > inventarioActual) {
          setOpenMovimiento(false);

          Swal.fire({
            icon: "error",
            title: "Inventario insuficiente",
            text: `Solo tienes ${inventarioActual} en inventario`,
          });
          return;
        }

        if (!movimiento.area) {
          setOpenMovimiento(false);

          Swal.fire({
            icon: "warning",
            title: "Área requerida",
            text: "Selecciona un área",
          });
          return;
        }
      }

      // =============================
      // Guardar movimiento
      // =============================

      await axios.post("http://66.232.105.87:3007/insumos/movimiento", {
        codigo_insumo: insumoSeleccionado.codigo_insumo,
        tipo_movimiento: tipoMovimiento,
        cantidad: cantidad,
        responsable: user.id_usu,
        area: movimiento.area,
        entregado_a: movimiento.entregado_a,
      });

      // =============================
      // Mensaje de éxito
      // =============================

      Swal.fire({
        icon: "success",
        title: "Movimiento guardado",
        text:
          tipoMovimiento === "SALIDA"
            ? "Salida registrada correctamente"
            : "Entrada registrada correctamente",
        timer: 1800,
        showConfirmButton: false,
      });

      setOpenMovimiento(false);
      obtenerInsumos();
    } catch (error) {
      console.error("Error movimiento:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el movimiento",
      });
    }
  };

  //editar indumo

  const [modoEdicion, setModoEdicion] = useState(false);
  const [imagenActual, setImagenActual] = useState(null);
  const [idEditar, setIdEditar] = useState(null);

  const editarInsumo = async (row) => {
    setForm({
      codigo_insumo: row.codigo_insumo,
      descripcion: row.descripcion,
      medidas: row.medidas,
      um: row.um,
      inventario: row.inventario,
      minimo_compra: row.minimo_compra,
      tiempo_entrega: row.tiempo_entrega,
      area: row.area,
    });

    setImagenActual(row.foto_insumos);
    setIdEditar(row.id_insumo);
    setModoEdicion(true);

    // 🔹 Cargar configuración adicional
    try {
      const res = await axios.get(
        `http://66.232.105.87:3007/insumos/config/${row.id_insumo}`
      );

      const configData = res.data;

      setConfig({
        ...configData,
        requerimiento: calcularRequerimiento(
          row.inventario,
          configData.inventario_minimo
        ),
      });
    } catch (error) {
      console.error("Error cargando configuración:", error);
      setConfig({
        consumo_mensual: 0,
        inventario_optimo: 0,
        inventario_minimo: 0,
        requerimiento: 0,
      });
    }

    setOpenModal(true);
  };

  const nuevoInsumo = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setImagenActual(null);
    setFoto(null);

    setForm({
      codigo_insumo: "",
      descripcion: "",
      medidas: "",
      um: "",
      inventario: 0,
      minimo_compra: 0,
      tiempo_entrega: 0,
      area: "",
    });

    // 🔹 limpiar configuración
    setConfig({
      consumo_mensual: 0,
      inventario_optimo: 0,
      inventario_minimo: 0,
      requerimiento: 0,
    });

    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setModoEdicion(false);
    setIdEditar(null);
    setImagenActual(null);
    setFoto(null);
  };

  // Filtro de busqueda
  const [busqueda, setBusqueda] = useState("");

  const insumosFiltrados = insumos.filter((item) => {
    const texto = busqueda.toLowerCase();

    return (
      item.codigo_insumo.toLowerCase().includes(texto) ||
      item.descripcion.toLowerCase().includes(texto)
    );
  });

  // Modal imagen
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [areas, setAreas] = useState([]);

  // Formulario
  const [form, setForm] = useState({
    codigo_insumo: "",
    descripcion: "",
    medidas: "",
    um: "",
    inventario: 0,
    minimo_compra: 0,
    tiempo_entrega: 0,
    area: "",
  });

  const [foto, setFoto] = useState(null);

  useEffect(() => {
    obtenerInsumos();
    obtenerAreas();
    obtenerSolicitudes(); // ← importante
  }, []);

  // ============================
  // Obtener datos===============
  // ============================
  const obtenerInsumos = async () => {
    try {
      const res = await axios.get(
        "http://66.232.105.87:3007/insumos/obtenerInsumos"
      );
      setInsumos(res.data);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    }
  };

  // ============================
  // Manejo formulario===========
  // ============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    setFoto(e.target.files[0]);
  };

  // ============================
  // Guardar insumo y actualizar
  // ============================
  const guardarInsumo = async () => {
    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      if (foto) {
        data.append("foto", foto);
      }

      let idInsumo = idEditar;
      let mensaje = "";

      if (modoEdicion) {
        await axios.put(
          `http://66.232.105.87:3007/insumos/actualizarInsumo/${idEditar}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        mensaje = "Insumo actualizado correctamente";
      } else {
        const res = await axios.post(
          "http://66.232.105.87:3007/insumos/crearInsumo",
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        idInsumo = res.data.id_insumo;
        mensaje = "Insumo creado correctamente";
      }

      // Guardar configuración
      if (idInsumo) {
        await axios.post(
          `http://66.232.105.87:3007/insumos/config/${idInsumo}`,
          config
        );
      }

      // Cerrar modal
      setOpenModal(false);
      setModoEdicion(false);
      setIdEditar(null);
      setFoto(null);

      // Refrescar tabla
      obtenerInsumos();

      // ✅ Mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Operación exitosa",
        text: mensaje,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al guardar:", error);

      setOpenModal(false); // 🔴 Cierra el modal primero

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el insumo",
      });
    }
  };

  // ============================
  // Abrir modal imagen
  // ============================
  const handleOpenImage = (row) => {
    setSelectedInsumo(row);
    setOpenImageModal(true);
  };

  // ============================
  // Obtener Los Departamentos
  // ============================
  const obtenerAreas = async () => {
    try {
      const res = await axios.get(
        "http://66.232.105.87:3007/insumos/obtenerAreas"
      );
      setAreas(res.data);
    } catch (error) {
      console.error("Error al obtener áreas:", error);
    }
  };

  //obtener cinfuguracion adicional

  const [config, setConfig] = useState({
    consumo_mensual: 0,
    inventario_optimo: 0,
    inventario_minimo: 0,
    requerimiento: 0,
  });

  //Calculo de inventario

  const calcularRequerimiento = (inventario, inventarioMinimo) => {
    if (inventario <= inventarioMinimo) {
      return inventarioMinimo - inventario;
    }
    return 0;
  };

  // Solicitar Insumo

  const obtenerFechaBaseYTurno = () => {
    // ===== MODO PRUEBA =====
    const modoPrueba = false;

    let ahora;

    if (modoPrueba) {
      // Simular hora nocturna (por ejemplo 20:30)
      ahora = new Date();
      ahora.setHours(20);
      ahora.setMinutes(30);
    } else {
      ahora = new Date();
    }

    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();

    const horaTotal = hora * 60 + minutos;

    let fechaBase = new Date(ahora);
    let esHoy = true;

    // Horario operativo: 7:00 (420) a 17:00 (1020)
    if (horaTotal > 1020 || horaTotal < 420) {
      fechaBase.setDate(fechaBase.getDate() + 1);
      esHoy = false;
    }

    return {
      fechaBase,
      esHoy,
    };
  };

  // ============================
  // Funciones de fecha operativa
  // ============================

  const obtenerFechaOperativa = () => {
    // ===== MODO PRUEBA =====
    const modoPrueba = false; // ← cambia a true para simular
    const horaPrueba = 20; // 20 = 8:00 PM
    const minutoPrueba = 30;

    let ahora;

    if (modoPrueba) {
      ahora = new Date();
      ahora.setHours(horaPrueba);
      ahora.setMinutes(minutoPrueba);
    } else {
      ahora = new Date();
    }

    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    const minutosActuales = hora * 60 + minutos;

    const inicioOperacion = 7 * 60; // 07:00
    const finOperacion = 17 * 60; // 17:00

    let fechaBase = new Date(ahora);

    if (minutosActuales > finOperacion || minutosActuales < inicioOperacion) {
      fechaBase.setDate(fechaBase.getDate() + 1);
    }

    // Evitar fin de semana
    const dia = fechaBase.getDay();
    if (dia === 6) fechaBase.setDate(fechaBase.getDate() + 2);
    if (dia === 0) fechaBase.setDate(fechaBase.getDate() + 1);

    return fechaBase;
  };

  const obtenerTurnoHoy = () => {
    const modoPrueba = false;
    const horaPrueba = 20;
    const minutoPrueba = 30;

    let ahora;

    if (modoPrueba) {
      ahora = new Date();
      ahora.setHours(horaPrueba);
      ahora.setMinutes(minutoPrueba);
    } else {
      ahora = new Date();
    }

    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

    const inicioOperacion = 7 * 60;
    const finOperacion = 17 * 60;

    return (
      minutosActuales >= inicioOperacion && minutosActuales <= finOperacion
    );
  };

  // ================================
  // Variables que usan las funciones
  // ================================

  const fechaBase = obtenerFechaOperativa();
  const esHoy = obtenerTurnoHoy();

  const fechaEstimada = insumoSeleccionado
    ? new Date(
        fechaBase.getFullYear(),
        fechaBase.getMonth(),
        fechaBase.getDate() + Number(insumoSeleccionado.tiempo_entrega)
      )
    : null;

  const solicitar = async () => {
    // 🔒 Evita doble clic
    if (loadingSolicitud) return;

    setLoadingSolicitud(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const cantidad = Number(cantidadSolicitud);

      if (!insumoSeleccionado) {
        Swal.fire({ icon: "warning", title: "Selecciona un insumo" });
        setLoadingSolicitud(false);
        return;
      }

      if (!cantidad || cantidad <= 0) {
        Swal.fire({ icon: "warning", title: "Cantidad inválida" });
        setLoadingSolicitud(false);
        return;
      }

      if (cantidad < insumoSeleccionado.minimo_compra) {
        setOpenSolicitud(false);
        Swal.fire({
          icon: "warning",
          title: "Cantidad mínima",
          text: `El mínimo de compra es ${insumoSeleccionado.minimo_compra}`,
        });
        setLoadingSolicitud(false);
        return;
      }

      // Fecha operativa
      const fechaSolicitudOperativa = obtenerFechaOperativa();

      await axios.post("http://66.232.105.87:3007/insumos/solicitar", {
        codigo: insumoSeleccionado.codigo_insumo,
        descripcion: insumoSeleccionado.descripcion,
        cantidad,
        solicitante_nombre: user.name,
        solicitante_correo: user.email,
        tiempo_entrega: insumoSeleccionado.tiempo_entrega,
        fecha_solicitud: fechaSolicitudOperativa,
        solicitante_id: user.id_usu,
      });

      setOpenSolicitud(false);

      Swal.fire({
        icon: "success",
        title: "Solicitud registrada",
        text:
          fechaSolicitudOperativa.toDateString() === new Date().toDateString()
            ? "Se procesará hoy"
            : "Se procesará el siguiente día hábil",
        timer: 1800,
        showConfirmButton: false,
      });

      setInsumoSeleccionado(null);
      setCantidadSolicitud("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al solicitar",
      });
    } finally {
      // 🔓 Siempre se libera el botón
      setLoadingSolicitud(false);
    }
  };

  return (
    <Paper sx={{ padding: 3 }}>
      {/* Encabezado */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {/* BOTONES LADO IZQUIERDO */}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={nuevoInsumo}
        >
          Nuevo Insumo
        </Button>

        {(role === "Admin" || role === "Ins") && (
          <Button
            variant="outlined"
            color="info"
            startIcon={<HistoryIcon />}
            onClick={abrirHistorialGeneral}
          >
            Entradas y Salidas
          </Button>
        )}

        {esDiaLaboral && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => {
              setInsumoSeleccionado(null);
              setCantidadSolicitud("");
              setOpenSolicitud(true);
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Solicitar Insumo
          </Button>
        )}

        {(role === "Admin" || role === "Ins") && (
          <Button
            size="small"
            variant="outlined"
            sx={{
              minWidth: 36,
              borderRadius: 2,
              color: "#2e7d32",
              borderColor: "#2e7d32",
              "&:hover": {
                backgroundColor: "rgba(46,125,50,0.08)",
              },
            }}
            onClick={() => abrirAprobacion()}
          >
            ✔ Aprobar
          </Button>
        )}

        {(role === "Admin" || role === "Ins" || role === "Master") && (
          <Button
            variant="outlined"
            onClick={() => {
              setOpenResumen(true);
              obtenerMeses();
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            📊 Resumen
          </Button>
        )}

        {/* BUSCADOR GRANDE */}
        <TextField
          placeholder="Buscar código o descripción..."
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{
            width: 320,
            ml: "auto", // 👈 ESTO lo empuja hacia la derecha
            backgroundColor: "#fff",
            borderRadius: 2,
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 3, color: "gray" }} />,
          }}
        />
      </Box>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: 450, // altura máxima
          overflow: "auto",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <b>Imagen</b>
              </TableCell>
              <TableCell>
                <b>Código</b>
              </TableCell>
              <TableCell>
                <b>Descripción</b>
              </TableCell>
              <TableCell>
                <b>Medidas</b>
              </TableCell>
              <TableCell>
                <b>Inventario</b>
              </TableCell>
              <TableCell>
                <b>Inventario Minimo</b>
              </TableCell>
              <TableCell>
                <b>UM</b>
              </TableCell>
              <TableCell>
                <b>Mínimo de Compra</b>
              </TableCell>
              <TableCell>
                <b>Entrega</b>
              </TableCell>
              <TableCell>
                <b>Área</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {insumosFiltrados.map((row) => (
              <React.Fragment key={row.id_insumo}>
                {/* FILA PRINCIPAL */}
                <TableRow
                  hover
                  onClick={() => verConsumoInsumo(row)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      Number(row.inventario) <=
                      Number(row.inventario_minimo_config)
                        ? "#ffebee"
                        : "inherit",
                  }}
                >
                  <TableCell>
                    {row.foto_insumos ? (
                      <img
                        src={`http://66.232.105.87:3007/uploads/Insumos/${row.foto_insumos}`}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover", borderRadius: 5 }}
                      />
                    ) : (
                      "Sin foto"
                    )}
                  </TableCell>

                  <TableCell>{row.codigo_insumo}</TableCell>
                  <TableCell>{row.descripcion}</TableCell>
                  <TableCell>{row.medidas}</TableCell>

                  <TableCell
                    sx={{
                      color:
                        Number(row.inventario) <=
                        Number(row.inventario_minimo_config)
                          ? "error.main"
                          : "inherit",
                      fontWeight:
                        Number(row.inventario) <=
                        Number(row.inventario_minimo_config)
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {row.inventario}
                  </TableCell>

                  <TableCell>{row.inventario_minimo_config}</TableCell>
                  <TableCell>{row.um}</TableCell>
                  <TableCell>{row.minimo_compra}</TableCell>
                  <TableCell>{row.tiempo_entrega} días</TableCell>
                  <TableCell>{row.area}</TableCell>

                  <TableCell align="center">
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                    >
                      {/* Editar */}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          editarInsumo(row);
                        }}
                        sx={{
                          minWidth: 36,
                          borderRadius: 2,
                          color: "#f44336",
                          borderColor: "#f44336",
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>

                      {/* Movimiento */}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirMovimiento(row);
                        }}
                        sx={{
                          minWidth: 36,
                          borderRadius: 2,
                          color: "#1976d2",
                          borderColor: "#1976d2",
                        }}
                      >
                        <SyncAltIcon fontSize="small" />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================
          MODAL NUEVO INSUMO
      ============================ */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {modoEdicion ? "Editar Insumo" : "Nuevo Insumo"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={4}>
              <TextField
                label="Código"
                name="codigo_insumo"
                fullWidth
                value={form.codigo_insumo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={8}>
              <TextField
                label="Descripción"
                name="descripcion"
                fullWidth
                value={form.descripcion}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label="Medidas"
                name="medidas"
                fullWidth
                value={form.medidas}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="UM"
                name="um"
                fullWidth
                value={form.um}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="Inventario"
                name="inventario"
                type="number"
                fullWidth
                value={form.inventario}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="Mínimo de Compra"
                name="minimo_compra"
                type="number"
                fullWidth
                value={form.minimo_compra}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="Entrega"
                name="tiempo_entrega"
                type="number"
                fullWidth
                value={form.tiempo_entrega}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label="Área"
                name="area"
                fullWidth
                value={form.area}
                onChange={handleChange}
              >
                {areas.map((a) => (
                  <MenuItem key={a.id} value={a.nombre}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              {/* Imagen actual solo en edición */}
              {modoEdicion && imagenActual && (
                <Box mb={1} textAlign="center">
                  <Typography variant="caption">Imagen actual</Typography>
                  <br />
                  <img
                    src={`http://66.232.105.87:3007/uploads/Insumos/${imagenActual}`}
                    alt="actual"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      marginTop: 5,
                    }}
                  />
                </Box>
              )}

              <Button variant="outlined" component="label" fullWidth>
                {modoEdicion ? "Cambiar Imagen" : "Subir Imagen"}
                <input type="file" hidden onChange={handleFile} />
              </Button>
            </Grid>
          </Grid>

          {/* ============================
             CONFIGURACIÓN ADICIONAL
            ============================ */}
          {modoEdicion && (
            <>
              <Box mt={3} mb={1}>
                <Typography variant="subtitle2">
                  Configuración de Inventario
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField
                    label="Consumo mensual"
                    type="number"
                    fullWidth
                    value={config.consumo_mensual}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        consumo_mensual: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    label="Inventario óptimo"
                    type="number"
                    fullWidth
                    value={config.inventario_optimo}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        inventario_optimo: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    label="Inventario mínimo"
                    type="number"
                    fullWidth
                    value={config.inventario_minimo}
                    onChange={(e) => {
                      const nuevoMin = Number(e.target.value);

                      setConfig({
                        ...config,
                        inventario_minimo: nuevoMin,
                        requerimiento: calcularRequerimiento(
                          form.inventario,
                          nuevoMin
                        ),
                      });
                    }}
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    label="Requerimiento"
                    type="number"
                    fullWidth
                    value={config.requerimiento}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid #e0e0e0",
            padding: "16px 24px",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {/* Cancelar */}
          <Button
            variant="outlined"
            onClick={cerrarModal}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#bdbdbd",
              color: "#616161",
              "&:hover": {
                borderColor: "#9e9e9e",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Cancelar
          </Button>

          {/* Guardar - Verde sin fondo */}
          <Button
            variant="outlined"
            onClick={guardarInsumo}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#2e7d32",
              color: "#2e7d32",
              "&:hover": {
                borderColor: "#1b5e20",
                color: "#1b5e20",
                backgroundColor: "rgba(46, 125, 50, 0.05)",
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================
          MODAL VER IMAGEN
      ============================ */}
      <Dialog
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedInsumo?.codigo_insumo}</DialogTitle>

        <DialogContent sx={{ textAlign: "center" }}>
          {selectedInsumo && (
            <>
              <img
                src={`http://66.232.105.87:3007/uploads/Insumos/${selectedInsumo.foto_insumos}`}
                alt="insumo"
                style={{
                  width: "100%",
                  maxHeight: 400,
                  objectFit: "contain",
                  marginBottom: 15,
                }}
              />

              <Typography>
                <b>Descripción:</b> {selectedInsumo.descripcion}
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenImageModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ============================
          MODAL DE MOVIMIENTOS
      ============================ */}
      <Dialog
        open={openMovimiento}
        onClose={() => setOpenMovimiento(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Movimiento - {insumoSeleccionado?.codigo_insumo}{" "}
          {insumoSeleccionado?.descripcion}
        </DialogTitle>

        {imagenActual ? (
          <Box mb={1} textAlign="center">
            <Typography variant="caption">Imagen actual</Typography>
            <br />
            <img
              src={`http://66.232.105.87:3007/uploads/Insumos/${imagenActual}`}
              alt="actual"
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #ddd",
                marginTop: 5,
              }}
            />
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Sin imagen
          </Typography>
        )}

        <DialogContent>
          <Box display="flex" gap={2} mb={2}>
            <Button
              variant={tipoMovimiento === "SALIDA" ? "contained" : "outlined"}
              onClick={() => setTipoMovimiento("SALIDA")}
            >
              Salida
            </Button>

            <Button
              variant={tipoMovimiento === "ENTRADA" ? "contained" : "outlined"}
              onClick={() => setTipoMovimiento("ENTRADA")}
            >
              Entrada
            </Button>
          </Box>

          <TextField
            label="Cantidad"
            type="number"
            fullWidth
            margin="normal"
            value={movimiento.cantidad}
            onChange={(e) =>
              setMovimiento({ ...movimiento, cantidad: e.target.value })
            }
          />

          {tipoMovimiento === "SALIDA" && (
            <>
              <TextField
                select
                label="Área"
                fullWidth
                margin="normal"
                value={movimiento.area}
                onChange={(e) =>
                  setMovimiento({ ...movimiento, area: e.target.value })
                }
              >
                {areas.map((a) => (
                  <MenuItem key={a.id} value={a.nombre}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Entregado a"
                fullWidth
                margin="normal"
                value={movimiento.entregado_a}
                onChange={(e) =>
                  setMovimiento({ ...movimiento, entregado_a: e.target.value })
                }
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenMovimiento(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarMovimiento}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================
            Historial de Solucitudes
          ============================ */}
      <Dialog
        open={openHistorial}
        onClose={() => setOpenHistorial(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Historial De Entradas y Salidas</DialogTitle>

        <DialogContent>
          {Object.keys(historialAgrupado).length === 0 ? (
            <Typography>No hay movimientos</Typography>
          ) : (
            Object.keys(historialAgrupado).map((mes) => {
              const movimientosMes = historialAgrupado[mes];

              const entradas = movimientosMes.filter(
                (m) => m.tipo_movimiento === "ENTRADA"
              );

              const salidas = movimientosMes.filter(
                (m) => m.tipo_movimiento === "SALIDA"
              );

              const totalEntradas = entradas.reduce(
                (sum, m) => sum + Number(m.cantidad),
                0
              );

              const totalSalidas = salidas.reduce(
                (sum, m) => sum + Number(m.cantidad),
                0
              );

              return (
                <Box key={mes} mb={4}>
                  {/* ===== Encabezado Mes ===== */}
                  <Box
                    sx={{
                      backgroundColor: "#f5f5f5",
                      padding: 1,
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" color="primary">
                      Mes: {mes}
                    </Typography>

                    <Typography variant="body2">
                      Entradas:{" "}
                      <b style={{ color: "green" }}>{totalEntradas}</b>
                      {"  |  "}
                      Salidas: <b style={{ color: "red" }}>{totalSalidas}</b>
                    </Typography>
                  </Box>

                  {/* ======================
                           ENTRADAS
                    ====================== */}
                  {entradas.length > 0 && (
                    <Box mb={3}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "green", fontWeight: "bold", mb: 1 }}
                      >
                        ENTRADAS
                      </Typography>

                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                            <TableCell>Codigo de Insumo</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Responsable</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {entradas.map((mov) => (
                            <TableRow key={mov.id_movimiento}>
                              <TableCell>{mov.codigo_insumo}</TableCell>
                              <TableCell>
                                {new Date(mov.fecha).toLocaleString()}
                              </TableCell>
                              <TableCell
                                sx={{ color: "green", fontWeight: "bold" }}
                              >
                                +{mov.cantidad}
                              </TableCell>
                              <TableCell>{mov.responsable_nombre}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}

                  {/* ======================
                            SALIDAS
                   ====================== */}
                  {salidas.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "red", fontWeight: "bold", mb: 1 }}
                      >
                        SALIDAS
                      </Typography>

                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#ffebee" }}>
                            <TableCell>Codigo de Insumo</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Responsable</TableCell>
                            <TableCell>Área</TableCell>
                            <TableCell>Entregado a</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {salidas.map((mov) => (
                            <TableRow key={mov.id_movimiento}>
                              <TableCell>{mov.codigo_insumo}</TableCell>
                              <TableCell>
                                {new Date(mov.fecha).toLocaleString()}
                              </TableCell>
                              <TableCell
                                sx={{ color: "red", fontWeight: "bold" }}
                              >
                                -{mov.cantidad}
                              </TableCell>
                              <TableCell>{mov.responsable_nombre}</TableCell>
                              <TableCell>{mov.area}</TableCell>
                              <TableCell>{mov.entregado_a}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenHistorial(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ============================
              MODAL SOLICITAR INSUMO
          ============================ */}
      <Dialog
        open={openSolicitud}
        onClose={() => setOpenSolicitud(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Solicitar Insumo</DialogTitle>

        <DialogContent>
          {/* Buscador */}
          <Autocomplete
            options={insumos}
            getOptionLabel={(option) =>
              `${option.codigo_insumo} - ${option.descripcion}`
            }
            onChange={(event, value) => {
              setInsumoSeleccionado(value);
              setCantidadSolicitud("");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Insumo"
                margin="normal"
                fullWidth
              />
            )}
          />

          {/* Información del insumo */}
          {insumoSeleccionado && (
            <>
              {/* Indicador de turno */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                mt={1}
              >
                <Typography variant="body2" fontWeight="bold">
                  {esHoy ? (
                    <>
                      <LightModeIcon sx={{ color: "#FFC107" }} />
                      Se procesará hoy
                    </>
                  ) : (
                    <>
                      <DarkModeIcon sx={{ color: "#1976D2" }} />
                      Se procesará mañana
                    </>
                  )}
                  <br />
                  {esHoy
                    ? "Horario: 7:00 AM - 4:00 PM"
                    : "Horario: 4:00 PM - 7:00 AM"}
                </Typography>
              </Box>
              {/* Imagen */}
              <Box mt={2} textAlign="center">
                {insumoSeleccionado.foto_insumos ? (
                  <img
                    src={`http://66.232.105.87:3007/uploads/Insumos/${insumoSeleccionado.foto_insumos}`}
                    alt="insumo"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      marginBottom: 10,
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Sin imagen
                  </Typography>
                )}
              </Box>

              {/* Descripción y mínimo */}
              <Typography variant="body2">
                <b>Descripción:</b> {insumoSeleccionado.descripcion}
              </Typography>

              <Typography variant="body2" mb={1}>
                <b>Mínimo de compra:</b>{" "}
                {Number(insumoSeleccionado.minimo_compra).toLocaleString()}{" "}
                {insumoSeleccionado.um}
              </Typography>

              {/* Cantidad */}
              <TextField
                label="Cantidad"
                type="number"
                fullWidth
                margin="normal"
                value={cantidadSolicitud}
                onChange={(e) => setCantidadSolicitud(e.target.value)}
                helperText={`Mínimo: ${Number(
                  insumoSeleccionado.minimo_compra
                ).toLocaleString()}`}
              />

              {/* Tiempo de entrega abajo */}
              <Typography variant="caption" color="text.secondary">
                Tiempo de entrega: {insumoSeleccionado.tiempo_entrega} días
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenSolicitud(false)}>
            Cancelar
          </Button>

          <Button
            variant="outlined"
            onClick={solicitar}
            disabled={loadingSolicitud}
            sx={{
              borderColor: "#2e7d32",
              color: "#2e7d32",
              minWidth: 120,
              "&:hover": {
                backgroundColor: "rgba(46,125,50,0.08)",
              },
            }}
          >
            {loadingSolicitud ? <CircularProgress size={18} /> : "Solicitar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================
          ==MODAL APROBAR SOLICITUDES=
          ============================ */}
      <Dialog
        open={openAprobacion}
        onClose={() => {
          setOpenAprobacion(false);
          setSolicitudSeleccionada(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aprobar Solicitudes</DialogTitle>

        <DialogContent>
          {/* ======================
                LISTADO DE SOLICITUDES
            ====================== */}
          {!solicitudSeleccionada && (
            <>
              {solicitudes.length === 0 ? (
                <Typography color="text.secondary">
                  No hay solicitudes registradas
                </Typography>
              ) : (
                solicitudes.map((sol) => {
                  const esAutorizada = sol.solicitado === 1;

                  return (
                    <Paper
                      key={sol.id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: esAutorizada ? "#f1f8e9" : "#fafafa",
                        border: esAutorizada
                          ? "1px solid #c8e6c9"
                          : "1px solid #e0e0e0",
                      }}
                    >
                      <Box>
                        <Typography fontWeight="bold">
                          {sol.codigo} - {sol.descripcion}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Cantidad: {sol.cantidad} | {sol.solicitante_nombre} |
                          ${sol.costo_unitario}
                        </Typography>

                        <Typography fontWeight="bold" color="primary">
                          Total: ${sol.costo_total.toLocaleString()}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            fontWeight: "bold",
                            color: esAutorizada ? "#2e7d32" : "#ed6c02",
                          }}
                        >
                          {esAutorizada ? "AUTORIZADA" : "PENDIENTE"}
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSolicitudSeleccionada(sol)}
                        sx={{
                          borderColor: esAutorizada ? "#2e7d32" : "#ed6c02",
                          color: esAutorizada ? "#2e7d32" : "#ed6c02",
                        }}
                      >
                        VER
                      </Button>
                    </Paper>
                  );
                })
              )}
            </>
          )}

          {/* ======================
              DETALLE DE SOLICITUD
            ====================== */}
          {solicitudSeleccionada && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Detalle de la solicitud
              </Typography>

              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography>
                  <b>Código:</b> {solicitudSeleccionada.codigo}
                </Typography>
                <Typography>
                  <b>Descripción:</b> {solicitudSeleccionada.descripcion}
                </Typography>
                <Typography>
                  <b>Cantidad:</b> {solicitudSeleccionada.cantidad}
                </Typography>
                <Typography>
                  <b>Solicitante:</b> {solicitudSeleccionada.solicitante_nombre}
                </Typography>
                <Typography>
                  <b>Fecha llegada:</b>{" "}
                  {new Date(
                    solicitudSeleccionada.fecha_llegada
                  ).toLocaleDateString()}
                </Typography>

                <Box
                  mt={2}
                  p={1}
                  borderRadius={1}
                  bgcolor={
                    solicitudSeleccionada.solicitado === 1
                      ? "#e8f5e9"
                      : "#fff3cd"
                  }
                >
                  <Typography variant="caption">
                    {solicitudSeleccionada.solicitado === 1
                      ? "Esta solicitud ya fue autorizada."
                      : "Esta acción marcará la solicitud como autorizada."}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {/* VOLVER */}
          {solicitudSeleccionada && (
            <Button
              variant="outlined"
              onClick={() => setSolicitudSeleccionada(null)}
            >
              Volver
            </Button>
          )}

          {/* CERRAR */}
          <Button
            variant="outlined"
            onClick={() => {
              setOpenAprobacion(false);
              setSolicitudSeleccionada(null);
            }}
            sx={{
              borderColor: "#f44336",
              color: "#f44336",
              "&:hover": {
                backgroundColor: "rgba(244,67,54,0.08)",
              },
            }}
          >
            Cerrar
          </Button>

          {/* APROBAR */}
          {solicitudSeleccionada && solicitudSeleccionada.solicitado === 0 && (
            <Button
              variant="outlined"
              onClick={aprobarSolicitud}
              disabled={
                loadingAprobacion || solicitudSeleccionada?.solicitado === 1
              }
              sx={{
                borderColor: "#2e7d32",
                color: "#2e7d32",
                minWidth: 120,
                "&:hover": {
                  backgroundColor: "rgba(46,125,50,0.08)",
                },
              }}
            >
              {loadingAprobacion ? showSpinner() : "Aprobar"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ============================
          ===MODAL RESUMEN DEL MES====
          ============================ */}
      <Dialog
        open={openResumen}
        onClose={() => setOpenResumen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Comparativo de Consumo por Mes
        </DialogTitle>

        <DialogContent
          sx={{
            background: "#f5f6fa",
            py: 3,
          }}
        >
          {loadingResumenes ? (
            <CircularProgress />
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2,1fr)",
                  md: "repeat(3,1fr)",
                  lg: "repeat(4,1fr)",
                },
              }}
            >
              {resumenes.map((resumen) => {
                const fecha = parseMesLocal(resumen.mes);

                const label = fecha.toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                });

                return (
                  <Paper
                    key={resumen.mes}
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: 420,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Mes */}
                    <Typography fontWeight="bold" mb={1}>
                      {label}
                    </Typography>

                    {/* Totales */}
                    <Typography variant="caption">Solicitudes</Typography>
                    <Typography fontWeight="bold">
                      {resumen.totales?.solicitudes || 0}
                    </Typography>

                    <Typography variant="caption">Piezas</Typography>
                    <Typography fontWeight="bold">
                      {Number(
                        resumen.totales?.piezas_total || 0
                      ).toLocaleString()}
                    </Typography>

                    <Typography variant="caption">Total</Typography>
                    <Typography fontWeight="bold" color="success.main" mb={1}>
                      $
                      {Number(
                        resumen.totales?.costo_total || 0
                      ).toLocaleString()}
                    </Typography>

                    {/* Lista insumos */}
                    <Typography variant="caption" fontWeight="bold">
                      Insumos del mes
                    </Typography>

                    <Box
                      sx={{
                        mt: 1,
                        flex: 1,
                        overflowY: "auto",
                        borderTop: "1px solid #eee",
                        pt: 1,
                      }}
                    >
                      {(resumen.insumos || []).map((i, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            mb: 1,
                            pb: 1,
                            borderBottom: "1px dashed #eee",
                            fontSize: 12,
                          }}
                        >
                          <b>{i.codigo}</b>
                          <br />
                          {i.descripcion}
                          <br />
                          Cant: {Number(i.cantidad_total).toLocaleString()}
                          {" | "}${Number(i.costo_total).toLocaleString()}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpenResumen(false)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================
          ===MODAL RESUMEN DEL MES====
          ============================ */}
      <Dialog
        open={openConsumoModal}
        onClose={() => setOpenConsumoModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Consumo por mes — {insumoSeleccionadoConsumo?.codigo_insumo}
        </DialogTitle>

        <DialogContent sx={{ background: "#f5f6fa", py: 3 }}>
          {/* ===== Encabezado del insumo ===== */}
          {insumoSeleccionadoConsumo && (
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Imagen */}
              {insumoSeleccionadoConsumo.foto_insumos ? (
                <img
                  src={`http://66.232.105.87:3007/uploads/Insumos/${insumoSeleccionadoConsumo.foto_insumos}`}
                  alt="insumo"
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    background: "#eee",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  Sin imagen
                </Box>
              )}

              {/* Info */}
              <Box>
                <Typography fontWeight="bold">
                  {insumoSeleccionadoConsumo.codigo_insumo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insumoSeleccionadoConsumo.descripcion}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* ===== Tarjetas por mes ===== */}
          {loadingConsumo ? (
            <Box textAlign="center">
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                alignItems: "start",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2,1fr)",
                  md: "repeat(3,1fr)",
                  lg: "repeat(4,1fr)",
                },
              }}
            >
              {(consumoInsumo || []).map((mesData, idx) => {
                const fecha = parseMesLocal(mesData.mes);

                const label = fecha.toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                });

                return (
                  <Paper
                    key={idx}
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    {/* Mes */}
                    <Typography fontWeight="bold" mb={1}>
                      {label}
                    </Typography>

                    {/* Datos */}
                    <Typography variant="caption">Solicitudes</Typography>
                    <Typography fontWeight="bold">
                      {mesData.solicitudes}
                    </Typography>

                    <Typography variant="caption">Piezas</Typography>
                    <Typography fontWeight="bold">
                      {Number(mesData.cantidad_total).toLocaleString()}
                    </Typography>

                    <Typography variant="caption">Total</Typography>
                    <Typography fontWeight="bold" color="success.main" mb={1}>
                      ${Number(mesData.costo_total).toLocaleString()}
                    </Typography>

                    {/* Detalle del mes */}
                    {mesData.detalle?.length > 0 && (
                      <>
                        <Typography variant="caption" fontWeight="bold">
                          Movimientos del mes
                        </Typography>

                        <Box
                          sx={{
                            mt: 1,
                            maxHeight: 140,
                            overflowY: "auto",
                            borderTop: "1px solid #eee",
                            pt: 1,
                          }}
                        >
                          {mesData.detalle.map((d, i) => (
                            <Box
                              key={i}
                              sx={{
                                fontSize: 12,
                                mb: 0.5,
                                borderBottom: "1px dashed #eee",
                                pb: 0.5,
                              }}
                            >
                              Cant: {Number(d.cantidad).toLocaleString()} | $
                              {Number(d.total).toLocaleString()}
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpenConsumoModal(false)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Insumos;

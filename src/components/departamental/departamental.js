import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  TableContainer,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  InputAdornment,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";

function Departamental() {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [mes, setMes] = useState(""); // vacío = todos los meses
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [clienteFiltro, setClienteFiltro] = useState("");

  const [errores, setErrores] = useState({});

  const [opcionesCedis, setOpcionesCedis] = useState([]);
  const [opcionesDestino, setOpcionesDestino] = useState([]);

  const [registrosExcel, setRegistrosExcel] = useState([]);

  const [cargandoExcel, setCargandoExcel] = useState(false);

  const [tabExcel, setTabExcel] = useState("lista");

  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const [tabModal, setTabModal] = useState(0);

  const [tabVista, setTabVista] = useState(0);

  const [clientesValidos, setClientesValidos] = useState([]);

  const [opcionesPorCliente, setOpcionesPorCliente] = useState({});

  const camposObligatorios = [
    "FOLIO",
    "CLIENTE",
    "CEDIS",
    "DESTINO",
    "NO_DE_OC",
    "VD",
    "MONTO",
    "FECHA_LLEGADA_OC",
  ];

  const abrirNuevo = async () => {
    setModoEdicion(false);
    setErrores({});

    try {
      const res = await axios.get(
        "http://66.232.105.87:3007/api/departamental/siguiente-folio"
      );

      const siguienteFolio = res.data.siguienteFolio;

      setForm({
        FOLIO: siguienteFolio, // 👈 AQUÍ SE ASIGNA AUTOMÁTICO
        CLIENTE: "",
        CEDIS: "",
        DESTINO: "",
        NO_DE_OC: "",
        VD: "",
        CONFIRMACION: "",
        MONTO: "",
        FECHA_LLEGADA_OC: "",
        FECHA_CANCELACION: "",
        FECHA_DE_CARGA: "",
        HORA: "",
        FECHA_DE_CITA: "",
        HORA_CITA: "",
        EMPACADOR: "",
        ESTATUS: "",
        TIPO_DE_ENVIO: "",
        COMENTARIOS: "",
      });

      setOpenModal(true);
    } catch (error) {
      mostrarMensaje("Error al generar el folio", "error");
    }
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  const [form, setForm] = useState({
    CEDIS: "",
    DESTINO: "",
    NO_DE_OC: "",
    VD: "",
    CONFIRMACION: "",
    MONTO: "",
    FECHA_LLEGADA_OC: "",
    FECHA_CANCELACION: "",
    FECHA_DE_CARGA: "",
    HORA: "",
    FECHA_DE_CITA: "",
    HORA_CITA: "",
    EMPACADOR: "",
    ESTATUS: "",
    TIPO_DE_ENVIO: "",
    COMENTARIOS: "",
    FOLIO: "",
    GUIA: "",
  });

  // ================================
  // Carga inicial
  // ================================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    axios
      .get("http://66.232.105.87:3007/api/departamental/datos", {
        params: {
          nombre: user?.name, // 👈 aquí va Abigail Ruiz
        },
      })
      .then((res) => setData(res.data.data))
      .catch((e) => console.error(e))
      .finally(() => setCargando(false));
  }, []);

  // ======Formato de fecha======
  const parseFecha = (rawFecha) => {
    if (!rawFecha) return null;

    // Caso 1: YYYY-MM-DD
    if (rawFecha.includes("-")) {
      const [anio, mes, dia] = rawFecha.split("-");
      return {
        dia,
        mes: mes.padStart(2, "0"),
        anio,
      };
    }

    // Caso 2: DD/MM/YYYY o D/M/YYYY
    if (rawFecha.includes("/")) {
      const [dia, mes, anio] = rawFecha.split("/");
      return {
        dia,
        mes: mes.padStart(2, "0"),
        anio,
      };
    }

    return null;
  };

  // Filtrar por Año
  // ================================
  const filtrados = data.filter((row) => {
    // 📅 FECHA (ya lo tienes bien)
    const rawFecha = row.FECHA_LLEGADA_OC;
    if (!rawFecha) return false;

    const fecha = parseFecha(rawFecha);
    if (!fecha) return false;

    const { mes: mesFecha, anio } = fecha;

    if (anio !== year) return false;
    if (mes && mesFecha !== mes) return false;

    // 🏪 CLIENTE
    if (clienteFiltro && row.CLIENTE !== clienteFiltro) {
      return false;
    }

    // 🔍 BUSCADOR
    if (busqueda) {
      const folio = row.FOLIO?.toString() || "";
      const oc = row.NO_DE_OC?.toString() || "";
      const vd = row.VD?.toString() || "";

      if (
        !folio.includes(busqueda.trim()) &&
        !oc.includes(busqueda.trim()) &&
        !vd.includes(busqueda.trim())
      ) {
        return false;
      }
    }

    return true;
  });

  const obtenerEstatusAutomatico = (row) => {
    const estatusBD = row.ESTATUS;
    const fechaCita = row.FECHA_DE_CITA;

    // Si ya tiene estatus en BD, se respeta
    if (estatusBD && estatusBD.trim() !== "") {
      return estatusBD.toUpperCase();
    }

    // Si no tiene estatus, se calcula
    if (
      !fechaCita ||
      fechaCita === "" ||
      fechaCita === null ||
      fechaCita === "-"
    ) {
      return "EN PROCESO";
    }

    return "EN PROCESO DE SURTIDO";
  };

  const obtenerColorEstatus = (estatus) => {
    switch (estatus) {
      case "EN PROCESO":
        return "#e53935"; // rojo
      case "EN PROCESO DE SURTIDO":
        return "#fb8c00"; // naranja
      case "ENVIADO":
        return "#2e7d32"; // verde
      case "CANCELADO":
        return "#616161"; // gris
      default:
        return "#000"; // negro normal
    }
  };

  const activosGlobal = filtrados.filter((p) => {
    const est = obtenerEstatusAutomatico(p);
    return est === "EN PROCESO" || est === "EN PROCESO DE SURTIDO";
  });

  const enviadosGlobal = filtrados.filter((p) => {
    const est = obtenerEstatusAutomatico(p);
    return est === "ENVIADO" || est === "EMBARCADO";
  });

  const canceladosGlobal = filtrados.filter(
    (p) => obtenerEstatusAutomatico(p) === "CANCELADO"
  );

  useEffect(() => {
    axios
      .get("http://66.232.105.87:3007/api/departamental/clientes-validos")
      .then((res) => setClientesValidos(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  if (cargando)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  //ontener status o se agrega el nuevo status

  const resumenEstatus = filtrados.reduce(
    (acc, item) => {
      const estatus = obtenerEstatusAutomatico(item);

      acc.total += 1;

      if (estatus === "EN PROCESO") acc.enProceso += 1;
      else if (estatus === "EN PROCESO DE SURTIDO") acc.enProcesoCita += 1;
      else if (estatus === "ENVIADO" || estatus === "EMBARCADO")
        acc.enviado += 1;
      else if (estatus === "CANCELADO") acc.cancelado += 1;

      return acc;
    },
    {
      total: 0,
      enProceso: 0,
      enProcesoCita: 0,
      enviado: 0,
      cancelado: 0,
    }
  );

  //Crear nueva insercion de departamental

  const esCancelado = form.ESTATUS === "CANCELADO";

  const handleGuardar = async () => {
    setErrores({});
    const nuevosErrores = {};

    // 🔴 Validar obligatorios
    if (!esCancelado) {
      camposObligatorios.forEach((campo) => {
        if (!form[campo] || form[campo].toString().trim() === "") {
          nuevosErrores[campo] = "Campo obligatorio";
        }
      });
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      mostrarMensaje("Completa los campos obligatorios", "warning");
      return;
    }

    // ===============================
    // 🔒 VALIDACIONES DE CATÁLOGO
    // ===============================

    // Cliente válido
    if (!clientesUnicos.includes(form.CLIENTE)) {
      mostrarMensaje("Cliente no válido", "error");
      return;
    }

    // CEDIS válido para ese cliente
    if (form.CEDIS && !opcionesCedis.includes(form.CEDIS)) {
      mostrarMensaje("CEDIS no válido para el cliente", "error");
      return;
    }

    // Destino válido para ese cliente
    if (form.DESTINO && !opcionesDestino.includes(form.DESTINO)) {
      mostrarMensaje("Destino no válido para el cliente", "error");
      return;
    }

    // ===============================
    // GUARDAR
    // ===============================
    try {
      const payload = {
        ...form,
        MONTO: normalizarMonto(form.MONTO),
      };

      if (modoEdicion) {
        await axios.put(
          `http://66.232.105.87:3007/api/departamental/actualizar/VD/${form.VD}`,
          payload
        );
        mostrarMensaje("Registro actualizado correctamente", "success");
      } else {
        await axios.post(
          "http://66.232.105.87:3007/api/departamental/crear",
          payload
        );
        mostrarMensaje("Registro creado correctamente", "success");
      }

      setOpenModal(false);

      const user = JSON.parse(localStorage.getItem("user"));

      const refrescar = await axios.get(
        "http://66.232.105.87:3007/api/departamental/datos",
        {
          params: { nombre: user?.name },
        }
      );

      setData(refrescar.data.data);
    } catch (error) {
      if (error.response && error.response.data) {
        const { campo, mensaje } = error.response.data;

        if (campo) {
          setErrores((prev) => ({
            ...prev,
            [campo]: mensaje,
          }));
        }

        mostrarMensaje(mensaje || "Error de validación", "error");
      } else {
        mostrarMensaje("Error de conexión con el servidor", "error");
      }
    }
  };

  const clientesUnicos = [
    ...new Set(
      data
        .map((d) => d.CLIENTE?.toString().trim().toUpperCase())
        .filter(Boolean)
    ),
  ].sort();

  const formatearMonto = (valor) => {
    if (valor === null || valor === undefined || valor === "") return "$0.00";

    const numero = Number(valor);

    if (isNaN(numero)) return "$0.00";

    return numero.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const normalizarMonto = (valor) => {
    if (!valor) return 0;

    return Number(valor.toString().replace(/\$/g, "").replace(/,/g, "").trim());
  };

  const abrirEditar = async (row) => {
    setModoEdicion(true);

    setForm({
      FOLIO: row.FOLIO || "",
      CLIENTE: row.CLIENTE || "",
      CEDIS: row.CEDIS || "",
      DESTINO: row.DESTINO || "",
      NO_DE_OC: row.NO_DE_OC || "",
      VD: row.VD || "",
      CONFIRMACION: row.CONFIRMACION || "",
      MONTO: row.MONTO || "",
      FECHA_LLEGADA_OC: row.FECHA_LLEGADA_OC || "",
      FECHA_CANCELACION: row.FECHA_CANCELACION || "",
      FECHA_DE_CARGA: row.FECHA_DE_CARGA || "",
      HORA: row.HORA || "",
      FECHA_DE_CITA: row.FECHA_DE_CITA || "",
      HORA_CITA: row.HORA_CITA || "",
      EMPACADOR: row.EMPACADOR || "",
      ESTATUS: row.ESTATUS || "",
      TIPO_DE_ENVIO: row.TIPO_DE_ENVIO || "",
      COMENTARIOS: row.COMENTARIOS || "",
      GUIA: row.GUIA || "",
    });

    // 🔥 IMPORTANTE: cargar opciones del cliente
    if (row.CLIENTE) {
      try {
        const cliente = row.CLIENTE.trim().toUpperCase();

        const res = await axios.get(
          `http://66.232.105.87:3007/api/departamental/opciones/${cliente}`
        );

        const data = res.data.data || [];

        setOpcionesCedis([...new Set(data.map((d) => d.CEDIS?.trim()))]);

        setOpcionesDestino([...new Set(data.map((d) => d.DESTINO?.trim()))]);
      } catch (error) {
        console.error("Error cargando opciones del cliente:", error);
        setOpcionesCedis([]);
        setOpcionesDestino([]);
      }
    }

    setOpenModal(true);
  };

  const mostrarMensaje = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const cerrarSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatearFechaISO = (rawFecha) => {
    if (!rawFecha) return "-";

    // ISO → DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawFecha)) {
      const [anio, mes, dia] = rawFecha.split("-");
      return `${dia}-${mes}-${anio}`;
    }

    // Si ya viene DD/MM/YYYY
    if (rawFecha.includes("/")) {
      return rawFecha;
    }

    return rawFecha;
  };

  const handleClienteChange = async (cliente) => {
    if (!cliente) return;

    const clienteNormalizado = cliente.trim().toUpperCase();

    setForm({
      ...form,
      CLIENTE: clienteNormalizado,
      CEDIS: "",
      DESTINO: "",
    });

    const res = await axios.get(
      `http://66.232.105.87:3007/api/departamental/opciones/${clienteNormalizado}`
    );

    const data = res.data.data;

    setOpcionesCedis([...new Set(data.map((d) => d.CEDIS?.trim()))]);

    setOpcionesDestino([...new Set(data.map((d) => d.DESTINO?.trim()))]);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const puedeEditar = user?.role === "Admin" || user?.role === "Muetras";

  const disabledEdicion = modoEdicion && !puedeEditar;

  const empacadores = [
    "Mauricio Torres",
    "Ana Guerrero",
    "Berenize Sánchez",
    "Leonardo Butron",
    "Alan Resendiz",
    "Alan Morales",
    "Meryllin Olarte",
    "Gabriela Martinez",
    "Ivonne Montoya",
    "Enrique velazquez ",
    "Alejandra",
    "Enrique velazquez",
    "Francisco ortiz",
    "Francisco ortiz",
    "Erick paredes",
    "Gael rojas",
  ];

  const handleExcel = async (file) => {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const folioBase = Number(form.FOLIO);

    // ✅ clientes válidos
    const clientesValidosSet = new Set(
      clientesValidos.map((c) => c.toString().toUpperCase().trim())
    );

    // ✅ Cache para no pedir opciones por cliente 500 veces
    const opcionesCache = {}; // { "CHEDRAUI": [{CEDIS, DESTINO}, ...] }

    const procesados = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const clienteExcel = (row.CLIENTE || "").toString().toUpperCase().trim();
      const cedisExcel = (row.CEDIS || "").toString().toUpperCase().trim();
      const destinoExcel = (row.DESTINO || "").toString().toUpperCase().trim();

      // ==========
      // Validar CLIENTE
      // ==========
      const clienteValido = clientesValidosSet.has(clienteExcel);

      let cedisValido = false;
      let destinoValido = false;

      // ==========
      // Validar CEDIS/DESTINO solo si cliente es válido
      // ==========
      if (clienteValido) {
        if (!opcionesCache[clienteExcel]) {
          try {
            const res = await axios.get(
              `http://66.232.105.87:3007/api/departamental/opciones/${clienteExcel}`
            );

            opcionesCache[clienteExcel] = (res.data.data || []).map((x) => ({
              CEDIS: (x.CEDIS || "").toUpperCase().trim(),
              DESTINO: (x.DESTINO || "").toUpperCase().trim(),
            }));
          } catch (err) {
            opcionesCache[clienteExcel] = [];
          }
        }

        const combos = opcionesCache[clienteExcel];

        // ✅ valida si existe esa combinación exacta
        const existeCombo = combos.some(
          (c) => c.CEDIS === cedisExcel && c.DESTINO === destinoExcel
        );

        if (existeCombo) {
          cedisValido = true;
          destinoValido = true;
        } else {
          // si no coincide la combinación, podrías permitir validar por separado
          cedisValido = combos.some((c) => c.CEDIS === cedisExcel);
          destinoValido = combos.some((c) => c.DESTINO === destinoExcel);
        }
      }

      // ==========
      // LIMPIAR lo inválido (pero NO eliminar el registro)
      // ==========
      const finalCliente = clienteValido ? clienteExcel : "";
      const finalCedis = clienteValido && cedisValido ? cedisExcel : "";
      const finalDestino = clienteValido && destinoValido ? destinoExcel : "";

      // Mensaje para que en modal se vea qué falló
      let motivo = "";
      if (!clienteValido) motivo = "Cliente no registrado";
      else if (!cedisValido && !destinoValido)
        motivo = "CEDIS y DESTINO no coinciden con ese cliente";
      else if (!cedisValido) motivo = "CEDIS no válido para ese cliente";
      else if (!destinoValido) motivo = "DESTINO no válido para ese cliente";

      // Opciones del cliente (si existe)
      let opcionesCliente = [];

      if (clienteValido) {
        opcionesCliente = opcionesCache[clienteExcel] || [];
      }

      const cedisOpciones = [...new Set(opcionesCliente.map((x) => x.CEDIS))];

      const destinoOpciones = [
        ...new Set(opcionesCliente.map((x) => x.DESTINO)),
      ];

      procesados.push({
        FOLIO: folioBase + i,
        CLIENTE: finalCliente,
        CEDIS: finalCedis,
        DESTINO: finalDestino,
        NO_DE_OC: row.NO_DE_OC || "",
        VD: row.VD || "",
        MONTO: row.MONTO || "",
        FECHA_LLEGADA_OC: row.FECHA_LLEGADA_OC || "",

        // 🔥 IMPORTANTE
        __cedisOpciones: cedisOpciones,
        __destinoOpciones: destinoOpciones,

        __motivo: motivo,
        __valido: motivo === "",
      });
    }

    setRegistrosExcel(procesados);

    // Aviso general
    const invalidos = procesados.filter((x) => !x.__valido).length;
    if (invalidos > 0) {
      mostrarMensaje(
        `Se cargaron ${procesados.length} registros. ${invalidos} requieren corrección.`,
        "warning"
      );
    } else {
      mostrarMensaje(
        `Se cargaron ${procesados.length} registros válidos.`,
        "success"
      );
    }
  };

  const guardarExcel = async () => {
    try {
      for (const r of registrosExcel) {
        await axios.post("http://66.232.105.87:3007/api/departamental/crear", {
          ...r,
          MONTO: normalizarMonto(r.MONTO),
        });
      }

      mostrarMensaje("Registros guardados correctamente", "success");
      setRegistrosExcel([]);
      setOpenModal(false);
    } catch (err) {
      mostrarMensaje("Error al guardar Excel", "error");
    }
  };

  const handleClienteChangeExcel = async (index, cliente) => {
    if (!cliente) return;

    const clienteNormalizado = cliente.trim().toUpperCase();

    try {
      const res = await axios.get(
        `http://66.232.105.87:3007/api/departamental/opciones/${clienteNormalizado}`
      );

      const data = res.data.data || [];

      const cedis = [...new Set(data.map((d) => d.CEDIS?.trim()))];
      const destinos = [...new Set(data.map((d) => d.DESTINO?.trim()))];

      // 🔥 TODO en un solo setState (clave del problema)
      setRegistrosExcel((prev) => {
        const copia = [...prev];

        copia[index] = {
          ...copia[index],
          CLIENTE: clienteNormalizado,
          CEDIS: "",
          DESTINO: "",
          __cedisOpciones: cedis,
          __destinoOpciones: destinos,
        };

        return copia;
      });
    } catch (error) {
      console.error("Error cargando opciones Excel:", error);
    }
  };

  const actualizarRegistroExcel = (index, campo, valor) => {
    setRegistrosExcel((prev) => {
      const copia = [...prev];

      let valorNormalizado = valor;
      if (typeof valor === "string") {
        valorNormalizado = valor.trim().toUpperCase();
      }

      copia[index] = {
        ...copia[index],
        [campo]: valorNormalizado,
      };

      return copia;
    });
  };

  let datosTab = [];

  if (tabVista === 0) datosTab = activosGlobal;
  if (tabVista === 1) datosTab = enviadosGlobal;
  if (tabVista === 2) datosTab = canceladosGlobal;

  // AHORA sí agrupar
  const agrupado = datosTab.reduce((acc, item) => {
    const cliente = item.CLIENTE || "SIN CLIENTE";
    if (!acc[cliente]) acc[cliente] = [];
    acc[cliente].push(item);
    return acc;
  }, {});

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Panel Departamental
      </Typography>

      {/* ------------------ SELECT DE AÑO ------------------ */}
      <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
        <Typography sx={{ mt: 1 }}>Cliente:</Typography>

        <Select
          size="small"
          value={clienteFiltro}
          onChange={(e) => setClienteFiltro(e.target.value)}
          sx={{ width: 220 }}
          displayEmpty
        >
          <MenuItem value="">Todos</MenuItem>

          {clientesUnicos.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>

        <Typography sx={{ mt: 1 }}>Año:</Typography>

        <Select
          size="small"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{ width: 120 }}
        >
          <MenuItem value="2026">2026</MenuItem>
        </Select>

        <Typography sx={{ mt: 1 }}>Mes:</Typography>

        <Select
          size="small"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          sx={{ width: 150 }}
          displayEmpty
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="01">Enero</MenuItem>
          <MenuItem value="02">Febrero</MenuItem>
          <MenuItem value="03">Marzo</MenuItem>
          <MenuItem value="04">Abril</MenuItem>
          <MenuItem value="05">Mayo</MenuItem>
          <MenuItem value="06">Junio</MenuItem>
          <MenuItem value="07">Julio</MenuItem>
          <MenuItem value="08">Agosto</MenuItem>
          <MenuItem value="09">Septiembre</MenuItem>
          <MenuItem value="10">Octubre</MenuItem>
          <MenuItem value="11">Noviembre</MenuItem>
          <MenuItem value="12">Diciembre</MenuItem>
        </Select>

        <input
          type="text"
          placeholder="Folio o OC"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            minWidth: 180,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ color: "#e53935", fontWeight: 700 }}>
          🔴 En Proceso: {resumenEstatus.enProceso}
        </Typography>

        <Typography sx={{ color: "#fb4700", fontWeight: 700 }}>
          🟠 En Proceso de Surtido: {resumenEstatus.enProcesoCita}
        </Typography>

        <Typography sx={{ fontWeight: 900 }}>
          📦 Total: {resumenEstatus.total}
        </Typography>
      </Box>

      {(user?.role === "Muetras" || user?.role === "Admin") && (
        <Button variant="contained" onClick={abrirNuevo}>
          ➕ Nuevo Registro
        </Button>
      )}

      <Tabs
        value={tabVista}
        onChange={(e, v) => setTabVista(v)}
        sx={{ mt: 3, mb: 2 }}
      >
        <Tab label={` 📦 Activos (${activosGlobal.length})`} />
        <Tab label={` 📤 Enviados y 📦 EMBARCADO (${enviadosGlobal.length})`} />
        <Tab label={` ❌ Cancelados (${canceladosGlobal.length})`} />
      </Tabs>

      {/* ------------------ BLOQUES POR CLIENTE ------------------ */}
      {Object.entries(agrupado).map(([cliente, pedidos]) => (
        <Box key={cliente} mt={4}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
            🏪 {cliente}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#666", mb: 1 }}>
            Total pedidos {year}: {pedidos.length}
          </Typography>

          <Paper
            sx={{
              maxHeight: 380,
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: 1,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Folio</TableCell>
                  <TableCell>Numero de Orden</TableCell>
                  <TableCell>OC</TableCell>
                  <TableCell>Destino</TableCell>
                  <TableCell sx={{ textAlign: "right" }}>Monto</TableCell>
                  <TableCell>Llegada OC</TableCell>
                  <TableCell>Vigencia OC</TableCell>
                  <TableCell>Fecha Cita</TableCell>
                  <TableCell>Hora de Cita</TableCell>
                  <TableCell>Empacador</TableCell>
                  <TableCell>Fecha Carga y Hora</TableCell>
                  <TableCell>Hora de Carga</TableCell>
                  <TableCell>Estatus</TableCell>
                  <TableCell>Tipo Envío</TableCell>
                  <TableCell>Comentarios</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pedidos.map((p, idx) => {
                  const estatusFinal = obtenerEstatusAutomatico(p);

                  return (
                    <TableRow key={idx}>
                      <TableCell>{p.FOLIO}</TableCell>
                      <TableCell>{p.VD}</TableCell>
                      <TableCell>{p.NO_DE_OC}</TableCell>
                      <TableCell>{p.DESTINO}</TableCell>

                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatearMonto(p.MONTO)}
                      </TableCell>

                      <TableCell>
                        {formatearFechaISO(p.FECHA_LLEGADA_OC)}
                      </TableCell>
                      <TableCell>
                        {formatearFechaISO(p.FECHA_CANCELACION)}
                      </TableCell>
                      <TableCell>
                        {formatearFechaISO(p.FECHA_DE_CITA)}
                      </TableCell>
                      <TableCell>{p.HORA_CITA}</TableCell>
                      <TableCell>{p.EMPACADOR}</TableCell>
                      <TableCell>
                        {formatearFechaISO(p.FECHA_DE_CARGA)}
                      </TableCell>
                      <TableCell>{p.HORA}</TableCell>

                      <TableCell
                        sx={{
                          color: obtenerColorEstatus(estatusFinal),
                          fontWeight: 700,
                        }}
                      >
                        {estatusFinal}
                      </TableCell>

                      <TableCell>{p.TIPO_DE_ENVIO}</TableCell>
                      <TableCell>{p.COMENTARIOS}</TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => abrirEditar(p)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Divider sx={{ mt: 3 }} />
        </Box>
      ))}

      {/* ------------------ Dialog de insercion / edicion ------------------ */}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="200"
        fullWidth
      >
        <DialogTitle>
          {modoEdicion
            ? "Editar Registro Departamental"
            : "Nuevo Registro Departamental"}
        </DialogTitle>

        <Tabs
          value={tabModal}
          onChange={(e, newValue) => setTabModal(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Registro Manual" />
          {(user?.role === "Muetras" || user?.role === "Admin") && (
            <Tab label="Carga por Excel" />
          )}
        </Tabs>

        {tabModal === 0 && (
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* ================= FOLIO ================= */}
              <Grid item xs={12}>
                <TextField
                  label="FOLIO"
                  fullWidth
                  value={form.FOLIO || ""}
                  disabled={!modoEdicion} // 👈 SOLO editable en edición
                  error={!!errores.FOLIO}
                  helperText={errores.FOLIO}
                />
              </Grid>

              {/* ================= CLIENTE ================= */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disabled={disabledEdicion}
                  options={clientesUnicos}
                  value={form.CLIENTE || null}
                  freeSolo={false}
                  onChange={(e, value) => {
                    if (!value) {
                      setForm({ ...form, CLIENTE: "", CEDIS: "", DESTINO: "" });
                      return;
                    }

                    // Validar que exista
                    if (!clientesUnicos.includes(value)) {
                      mostrarMensaje("Cliente no válido", "error");
                      return;
                    }

                    handleClienteChange(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="CLIENTE"
                      fullWidth
                      error={!!errores.CLIENTE}
                      helperText={errores.CLIENTE}
                    />
                  )}
                />
              </Grid>

              {/* ================= CEDIS ================= */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disabled={disabledEdicion}
                  options={opcionesCedis}
                  value={form.CEDIS}
                  onChange={(e, value) =>
                    setForm({ ...form, CEDIS: value || "" })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="CEDIS" fullWidth />
                  )}
                />
              </Grid>

              {/* ================= DESTINO ================= */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disabled={disabledEdicion}
                  options={opcionesDestino}
                  value={form.DESTINO}
                  onChange={(e, value) =>
                    setForm({ ...form, DESTINO: value || "" })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="DESTINO" fullWidth />
                  )}
                />
              </Grid>

              {/* ================= NO DE OC ================= */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="NO DE OC"
                  fullWidth
                  disabled={disabledEdicion}
                  value={form.NO_DE_OC}
                  error={!!errores.NO_DE_OC}
                  helperText={errores.NO_DE_OC}
                  onChange={(e) => {
                    setForm({ ...form, NO_DE_OC: e.target.value });
                    setErrores({ ...errores, NO_DE_OC: null });
                  }}
                />
              </Grid>

              {/* ================= VD ================= */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="VD"
                  fullWidth
                  disabled={modoEdicion}
                  value={form.VD}
                  error={!!errores.VD}
                  helperText={errores.VD}
                  onChange={(e) => {
                    setForm({ ...form, VD: e.target.value });
                    setErrores({ ...errores, VD: null });
                  }}
                />
              </Grid>

              {/* ================= MONTO ================= */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="MONTO"
                  fullWidth
                  disabled={disabledEdicion}
                  value={form.MONTO}
                  onChange={(e) => setForm({ ...form, MONTO: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* ================= FECHA LLEGADA OC ================= */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="FECHA LLEGADA OC"
                  type="date"
                  disabled={disabledEdicion}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.FECHA_LLEGADA_OC}
                  error={!!errores.FECHA_LLEGADA_OC}
                  helperText={errores.FECHA_LLEGADA_OC}
                  onChange={(e) => {
                    setForm({ ...form, FECHA_LLEGADA_OC: e.target.value });
                    setErrores({ ...errores, FECHA_LLEGADA_OC: null });
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="FECHA CANCELACIÓN"
                  type="date"
                  disabled={disabledEdicion}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.FECHA_CANCELACION || ""}
                  onChange={(e) =>
                    setForm({ ...form, FECHA_CANCELACION: e.target.value })
                  }
                />
              </Grid>

              {/* ================= FECHA DE CITA ================= */}
              {modoEdicion && (
                <>
                  {/* ================= CONFIRMACION ================= */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CONFIRMACION"
                      fullWidth
                      value={form.CONFIRMACION}
                      onChange={(e) =>
                        setForm({ ...form, CONFIRMACION: e.target.value })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="FECHA DE CITA"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={form.FECHA_DE_CITA}
                      onChange={(e) =>
                        setForm({ ...form, FECHA_DE_CITA: e.target.value })
                      }
                    />
                  </Grid>

                  {/* ================= HORA DE CITA ================= */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="HORA DE CITA"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={form.HORA_CITA}
                      onChange={(e) =>
                        setForm({ ...form, HORA_CITA: e.target.value })
                      }
                    />
                  </Grid>

                  {/* ======================================================
                          👇👇👇 SOLO EN MODO EDICIÓN 👇👇👇
                    ====================================================== */}

                  {/* FECHA DE CARGA */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="FECHA DE CARGA"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={form.FECHA_DE_CARGA}
                      onChange={(e) =>
                        setForm({ ...form, FECHA_DE_CARGA: e.target.value })
                      }
                    />
                  </Grid>

                  {/* HORA CARGA */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="HORA CARGA"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={form.HORA}
                      onChange={(e) =>
                        setForm({ ...form, HORA: e.target.value })
                      }
                    />
                  </Grid>

                  {/* EMPACADOR */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="EMPACADOR"
                      fullWidth
                      value={form.EMPACADOR || ""}
                      onChange={(e) =>
                        setForm({ ...form, EMPACADOR: e.target.value })
                      }
                    >
                      <MenuItem value="">
                        <em>Seleccionar empacador</em>
                      </MenuItem>

                      {empacadores.map((nombre) => (
                        <MenuItem key={nombre} value={nombre}>
                          {nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* ESTATUS */}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="ESTATUS"
                      fullWidth
                      value={form.ESTATUS || ""}
                      onChange={(e) =>
                        setForm({ ...form, ESTATUS: e.target.value })
                      }
                    >
                      <MenuItem value="EMBARCADO">EMBARCADO</MenuItem>
                      <MenuItem value="ENVIADO">ENVIADO</MenuItem>
                      <MenuItem value="CANCELADO">CANCELADO</MenuItem>
                    </TextField>
                  </Grid>

                  {(user?.role === "Muetras" || user?.role === "Admin") && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="GUÍA"
                        fullWidth
                        value={form.GUIA}
                        onChange={(e) =>
                          setForm({ ...form, GUIA: e.target.value })
                        }
                      />
                    </Grid>
                  )}
                </>
              )}

              {/* ================= COMENTARIOS ================= */}
              <Grid item xs={12}>
                <TextField
                  label="COMENTARIOS"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.COMENTARIOS}
                  onChange={(e) =>
                    setForm({ ...form, COMENTARIOS: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
        )}

        {tabModal === 1 &&
          (user?.role === "Muetras" || user?.role === "Admin") && (
            <DialogContent dividers>
              {/* BOTÓN CARGAR */}
              <Box mb={2} display="flex" gap={2}>
                <Button variant="contained" component="label">
                  📄 Cargar Excel
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={(e) => handleExcel(e.target.files[0])}
                  />
                </Button>

                {!form.CLIENTE && (
                  <Typography color="error" fontSize={12}>
                    Primero selecciona un cliente
                  </Typography>
                )}
              </Box>

              {/* TABLA */}
              {registrosExcel.length > 0 && (
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 500,
                    overflow: "auto",
                  }}
                >
                  <Table
                    stickyHeader
                    size="small"
                    sx={{ tableLayout: "fixed" }}
                  >
                    {/* ===== HEAD ===== */}
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 70 }}>Folio</TableCell>
                        <TableCell sx={{ width: 180 }}>Cliente</TableCell>
                        <TableCell sx={{ width: 140 }}>Cedis</TableCell>
                        <TableCell sx={{ width: 160 }}>Destino</TableCell>
                        <TableCell sx={{ width: 120 }}>OC</TableCell>
                        <TableCell sx={{ width: 100 }}>VD</TableCell>
                        <TableCell sx={{ width: 120 }}>Monto</TableCell>
                        <TableCell sx={{ width: 120 }}>Fecha Llegada</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          Fecha Cancelación
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    {/* ===== BODY ===== */}
                    <TableBody>
                      {registrosExcel.map((r, i) => (
                        <TableRow
                          key={i}
                          sx={{
                            "& td": {
                              padding: "6px 8px",
                              verticalAlign: "middle",
                            },
                          }}
                        >
                          <TableCell>{r.FOLIO}</TableCell>

                          {/* CLIENTE */}
                          <TableCell>
                            <Autocomplete
                              options={clientesUnicos}
                              value={r.CLIENTE || null}
                              getOptionLabel={(option) => option || ""}
                              isOptionEqualToValue={(option, value) =>
                                option?.toUpperCase().trim() ===
                                value?.toUpperCase().trim()
                              }
                              onChange={(e, value) => {
                                if (!value) {
                                  actualizarRegistroExcel(i, "CLIENTE", "");
                                  return;
                                }

                                handleClienteChangeExcel(i, value);
                              }}
                              renderInput={(params) => (
                                <TextField {...params} size="small" />
                              )}
                            />
                          </TableCell>

                          {/* CEDIS */}
                          <TableCell>
                            <Autocomplete
                              options={r.__cedisOpciones || []}
                              value={r.CEDIS || null}
                              isOptionEqualToValue={(option, value) =>
                                option === value
                              }
                              onChange={(e, value) =>
                                actualizarRegistroExcel(i, "CEDIS", value || "")
                              }
                              renderInput={(params) => (
                                <TextField {...params} size="small" />
                              )}
                            />
                          </TableCell>

                          {/* DESTINO */}
                          <TableCell>
                            <Autocomplete
                              options={r.__destinoOpciones || []}
                              value={r.DESTINO || null}
                              isOptionEqualToValue={(option, value) =>
                                option === value
                              }
                              onChange={(e, value) =>
                                actualizarRegistroExcel(
                                  i,
                                  "DESTINO",
                                  value || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField {...params} size="small" />
                              )}
                            />
                          </TableCell>

                          {/* OC */}
                          <TableCell>
                            <TextField
                              size="small"
                              value={r.NO_DE_OC}
                              onChange={(e) =>
                                actualizarRegistroExcel(
                                  i,
                                  "NO_DE_OC",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>

                          {/* VD */}
                          <TableCell>
                            <TextField
                              size="small"
                              value={r.VD}
                              onChange={(e) =>
                                actualizarRegistroExcel(i, "VD", e.target.value)
                              }
                            />
                          </TableCell>

                          {/* MONTO */}
                          <TableCell>
                            <TextField
                              size="small"
                              value={r.MONTO}
                              onChange={(e) =>
                                actualizarRegistroExcel(
                                  i,
                                  "MONTO",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>

                          {/* FECHA LLEGADA */}
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              value={r.FECHA_LLEGADA_OC}
                              onChange={(e) =>
                                actualizarRegistroExcel(
                                  i,
                                  "FECHA_LLEGADA_OC",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>

                          {/* FECHA CANCELACIÓN */}
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              value={r.FECHA_CANCELACION || ""}
                              onChange={(e) =>
                                actualizarRegistroExcel(
                                  i,
                                  "FECHA_CANCELACION",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
          )}

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>

          {tabModal === 0 && (
            <Button variant="contained" onClick={handleGuardar}>
              Guardar
            </Button>
          )}

          {tabModal === 1 && registrosExcel.length > 0 && (
            <Button variant="contained" color="success" onClick={guardarExcel}>
              Guardar todos ({registrosExcel.length})
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={cerrarSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={cerrarSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Departamental;

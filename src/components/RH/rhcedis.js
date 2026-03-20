import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import * as XLSX from "xlsx";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  alertSuccess,
  alertError,
  alertConfirm,
  alertLoading,
  alertClose,
} from "../../utils/alerts";
const API_BASE = "http://66.232.105.87:3007/api/RH";

function formatDateYYYYMMDD(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return String(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toNumberSafe(v) {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

const MODULES = [
  { label: "Productividad", key: "prod" },
  { label: "Asistencia", key: "asis" },
  { label: "Nómina", key: "nom" },
  { label: "Amonestaciones", key: "amo" },
  { label: "Colaboradores CEDIS", key: "col" },
];

const AREAS = [
  { label: "CEDIS", value: "CEDIS" },
  { label: "Surtido", value: "SURTIDO" },
  { label: "Embarques", value: "EMBARQUES" },
  { label: "Paquetería", value: "PAQUETERIA" },
  { label: "Administración", value: "ADMIN" },
];

function RhCedis() {
  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [moduleTab, setModuleTab] = useState(0);

  // filtros globales por fecha (muchos módulos usan rango)
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // PRODUCTIVIDADS
  // =========================
  const [prodTab, setProdTab] = useState(0); // 0 surtido, 1 embarques, 2 paqueteria
  const [prodData, setProdData] = useState({
    surtido: [],
    embarques: [],
    paqueteria: [],
  });

  const fetchProductividad = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await axios.get(`${API_BASE}/productividad`, {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      });

      if (!resp.data?.ok) {
        setError(resp.data?.message || "No se pudo obtener productividad.");
        setProdData({ surtido: [], embarques: [], paqueteria: [] });
        return;
      }

      setProdData({
        surtido: resp.data.surtido || [],
        embarques: resp.data.embarques || [],
        paqueteria: resp.data.paqueteria || [],
      });
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Error consultando productividad."
      );
      setProdData({ surtido: [], embarques: [], paqueteria: [] });
    } finally {
      setLoading(false);
    }
  };

  const prodRows =
    prodTab === 0
      ? prodData.surtido
      : prodTab === 1
      ? prodData.embarques
      : prodData.paqueteria;

  const prodTotals = useMemo(() => {
    const rows = prodRows || [];
    return {
      pedidos: rows.reduce((acc, r) => acc + toNumberSafe(r.pedidos), 0),
      codigos: rows.reduce((acc, r) => acc + toNumberSafe(r.codigos), 0),
      piezas: rows.reduce((acc, r) => acc + toNumberSafe(r.piezas), 0),
      horas: rows.reduce((acc, r) => acc + toNumberSafe(r.horas), 0),
    };
  }, [prodRows]);

  // carga inicial (solo productividad por ahora)
  useEffect(() => {
    fetchProductividad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportarProductividadExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const crearHoja = (data, nombre) => {
        if (!data || data.length === 0) return;

        const rows = data.map((r) => ({
          Fecha: formatDateYYYYMMDD(r.fecha),
          ID_Usuario: r.id_usuario,
          Nombre: r.nombre,
          Rol: r.role,
          Pedidos: toNumberSafe(r.pedidos),
          Codigos: toNumberSafe(r.codigos),
          Piezas: toNumberSafe(r.piezas),
          Horas: toNumberSafe(r.horas),
        }));

        // 👉 totales
        const totales = {
          Fecha: "TOTAL",
          Pedidos: rows.reduce((a, b) => a + b.Pedidos, 0),
          Codigos: rows.reduce((a, b) => a + b.Codigos, 0),
          Piezas: rows.reduce((a, b) => a + b.Piezas, 0),
          Horas: rows.reduce((a, b) => a + b.Horas, 0),
        };

        rows.push({});
        rows.push(totales);

        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, nombre);
      };

      crearHoja(prodData.surtido, "Surtido");
      crearHoja(prodData.embarques, "Embarques");
      crearHoja(prodData.paqueteria, "Paqueteria");

      const fileName = `Productividad_${fechaInicio}_a_${fechaFin}.xlsx`;

      XLSX.writeFile(wb, fileName);

      alertSuccess("Excel generado", "Se descargó correctamente");
    } catch (error) {
      console.error(error);
      alertError("Error", "No se pudo generar el Excel");
    }
  };

  // =========================
  // COLABORADORES CEDIS
  // =========================

  const [departamentos, setDepartamentos] = useState({});
  const [depTab, setDepTab] = useState(0);
  const [loadingColab, setLoadingColab] = useState(false);

  const fetchColaboradores = async () => {
    setLoadingColab(true);

    try {
      const resp = await axios.get(`${API_BASE}/departamentos`);

      if (resp.data?.ok) {
        setDepartamentos(resp.data.departamentos || {});
      }
    } catch (error) {
      console.error("Error cargando colaboradores", error);
    } finally {
      setLoadingColab(false);
    }
  };

  useEffect(() => {
    if (MODULES[moduleTab]?.key === "col") {
      fetchColaboradores();
    }
  }, [moduleTab]);

  // =========================
  // MODAL EMPLEADO
  // =========================

  const [openEmpleadoModal, setOpenEmpleadoModal] = useState(false);
  const [loadingEmpleado, setLoadingEmpleado] = useState(false);

  const [empleadoDetalle, setEmpleadoDetalle] = useState({
    id_empleado: "",
    clave_empleado: "",
    nombre_completo: "",
    genero: "",
    estatus: "",
    fecha_ingreso: "",
    tipo_nomina: "",
    frecuencia_nomina: "",
    unidad_negocio: "",
    departamento: "",
    centro_costo: "",
    puesto: "",
  });

  const openEmpleado = async (id) => {
    setLoadingEmpleado(true);

    try {
      const resp = await axios.get(`${API_BASE}/empleado/${id}`);

      if (resp.data?.ok) {
        setEmpleadoDetalle(resp.data.empleado);

        await fetchAmonestacionesEmpleado(id);

        setOpenEmpleadoModal(true);
      }
    } catch (error) {
      console.error("Error cargando empleado", error);
    } finally {
      setLoadingEmpleado(false);
    }
  };

  const saveEmpleado = async () => {
    try {
      alertLoading("Guardando cambios...");

      const resp = await axios.put(
        `${API_BASE}/edit-empleado/${empleadoDetalle.id_empleado}`,
        empleadoDetalle
      );

      alertClose();

      if (resp.data?.ok) {
        await alertSuccess(
          "Empleado actualizado",
          "Los cambios se guardaron correctamente"
        );

        setOpenEmpleadoModal(false);
        fetchColaboradores();
      }
    } catch (error) {
      alertClose();

      alertError(
        "Error",
        error?.response?.data?.message || "No se pudo actualizar el empleado"
      );
    }
  };

  const departamentosKeys = Object.keys(departamentos || {});
  const colaboradoresActual = departamentos[departamentosKeys[depTab]] || [];

  // =========================
  // ALTA EMPLEADO
  // =========================
  const [openNewEmpleado, setOpenNewEmpleado] = useState(false);

  const GENEROS = ["MASCULINO", "FEMENINO"];

  const TIPOS_NOMINA = ["Especial", "Quincenal", "Semanal"];

  const UNIDADES_NEGOCIO = ["Cedis", "Corporativo", "Cross Dock"];

  const DEPARTAMENTOS = [
    "Administración",
    "Almacen",
    "Cross Dock",
    "Desarrollo",
    "Dirección",
    "Embarques",
    "Inventarios",
    "Mantenimiento",
    "Montacargas",
    "Paqueteria",
    "Recibo/Devoluciones",
    "Recursos Humanos",
    "Retail",
    "Surtido",
    "Transportes",
  ];

  const PUESTOS = [
    "Almacenisa C",
    "Almacenista A",
    "Almacenista A Especializado",
    "Almacenista B",
    "Almacenista B Especializado",
    "Almacenista C",
    "Analista de Inventarios",
    "Analista de inventarios Jr",
    "Analista de Mesa de Control",
    "Analista de Planeación Logistico",
    "Auxiliar de operaciones",
    "Capturista",
    "Chofer",
    "Contador Cíclico",
    "Coordinador de Devoluciones Semi Sr",
    "Coordinador de Inventarios Jr",
    "Coordinador de Paquetería Semi Sr",
    "Coordinador de Trafico Jr",
    "Director de Almacen",
    "Facturista Semi Sr",
    "Facturista Sr",
    "Gerente de Almacen",
    "HRBP",
    "Jefe de Desarrolladores",
    "Mantenimiento",
    "Mesa de control transportes",
    "Montacarguista especializado",
    "Supervisor de Embarques Jr",
    "Supervisor de montacarguistas Jr",
    "Supervisor de surtido Sr",
    "Supervisor Semi Sr",
  ];

  const saveNewEmpleado = async () => {
    setOpenNewEmpleado(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      alertLoading("Creando colaborador...");

      const resp = await axios.post(`${API_BASE}/creat-empleado`, newEmpleado);

      alertClose();

      if (resp.data?.ok) {
        await alertSuccess(
          "Colaborador creado",
          "El colaborador se registró correctamente"
        );

        // 🔹 limpiar formulario
        setNewEmpleado(EMPTY_EMPLEADO);

        fetchColaboradores();
      }
    } catch (error) {
      alertClose();

      alertError(
        "Error",
        error?.response?.data?.message || "No se pudo crear el colaborador"
      );
    }
  };

  const EMPTY_EMPLEADO = {
    clave_empleado: "",
    nombre_completo: "",
    genero: "",
    estatus: "Activo",
    fecha_ingreso: today,
    tipo_nomina: "",
    frecuencia_nomina: "",
    unidad_negocio: "",
    departamento: "",
    puesto: "",
  };

  const [newEmpleado, setNewEmpleado] = useState(EMPTY_EMPLEADO);

  // =========================
  // AMONESTACIONES EMPLEADO
  // =========================

  const [amonestacionesEmpleado, setAmonestacionesEmpleado] = useState([]);
  const [faltasCatalogo, setFaltasCatalogo] = useState([]);
  const [openNuevaAmonestacion, setOpenNuevaAmonestacion] = useState(false);

  const [nuevaAmonestacion, setNuevaAmonestacion] = useState({
    id_falta: "",
    descripcion: "",
    fecha: today,
  });

  const [archivosAmonestacion, setArchivosAmonestacion] = useState([]);

  const fetchAmonestacionesEmpleado = async (idEmpleado) => {
    try {
      const resp = await axios.get(
        `${API_BASE}/empleado/${idEmpleado}/amonestaciones`
      );
      if (resp.data?.ok) {
        setAmonestacionesEmpleado(resp.data.amonestaciones);
      }
    } catch (error) {
      console.error("Error cargando amonestaciones", error);
    }
  };

  const fetchCatalogoFaltas = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/faltas`);
      if (resp.data?.ok) {
        setFaltasCatalogo(resp.data.faltas);
      }
    } catch (error) {
      console.error("Error cargando faltas", error);
    }
  };

  const saveNuevaAmonestacion = async () => {
    try {
      alertLoading("Registrando amonestación...");

      const resp = await axios.post(`${API_BASE}/amonestacion`, {
        id_empleado: empleadoDetalle.id_empleado,
        id_falta: nuevaAmonestacion.id_falta,
        descripcion: nuevaAmonestacion.descripcion,
        fecha: nuevaAmonestacion.fecha,
        creado_por: 1,
      });

      if (!resp.data?.ok) {
        throw new Error("No se pudo crear la amonestación");
      }

      const idAmonestacion = resp.data.id_amonestacion;

      // subir archivos si existen

      if (archivosAmonestacion.length > 0) {
        const formData = new FormData();

        archivosAmonestacion.forEach((file) => {
          formData.append("file", file);
        });

        formData.append("id_amonestacion", idAmonestacion);

        await axios.post(`${API_BASE}/amonestacion/evidencia`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      alertClose();

      await alertSuccess(
        "Amonestación registrada",
        `Sanción aplicada: ${resp.data.tipo_sancion}`
      );

      setOpenNuevaAmonestacion(false);

      setArchivosAmonestacion([]);

      fetchAmonestacionesEmpleado(empleadoDetalle.id_empleado);
    } catch (error) {
      alertClose();

      alertError(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo registrar la amonestación"
      );
    }
  };

  // =========================
  // DOCUMRNTOS AMONESTACIONES EMPLEADO
  // =========================

  const [openPdfViewer, setOpenPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const abrirEvidencia = (archivo) => {
    const url = `https://sanced.santulconnect.com:3011/rh-evidencias/${archivo}`;

    setPdfUrl(url);

    setOpenPdfViewer(true);
  };
  // =========================
  // AMONESTACIONES (UI lista)
  // =========================
  const [amonestaciones, setAmonestaciones] = useState([]); // placeholder
  const [openAmoModal, setOpenAmoModal] = useState(false);
  const [amoForm, setAmoForm] = useState({
    empleado: "",
    area: "CEDIS",
    motivo: "",
    nivel: "Leve",
    fecha: today,
  });

  const openNewAmonestacion = () => {
    setAmoForm({
      empleado: "",
      area: "CEDIS",
      motivo: "",
      nivel: "Leve",
      fecha: today,
    });
    setOpenAmoModal(true);
  };

  const saveAmonestacion = async () => {
    const newAmo = {
      id: Date.now(),
      ...amoForm,
      created_at: new Date().toISOString(),
    };
    setAmonestaciones((prev) => [newAmo, ...prev]);
    setOpenAmoModal(false);
  };

  // =========================
  // ASISTENCIA (UI lista)
  // =========================
  const [asistencia, setAsistencia] = useState([]); // placeholder
  const [openAsisModal, setOpenAsisModal] = useState(false);

  const [asisForm, setAsisForm] = useState({
    empleado: "",
    area: "CEDIS",
    fecha: today,
    entrada: "07:00",
    salida: "16:00",
    estatus: "Asistió",
  });

  const openNewAsistencia = () => {
    setAsisForm({
      empleado: "",
      area: "CEDIS",
      fecha: today,
      entrada: "07:00",
      salida: "16:00",
      estatus: "Asistió",
    });
    setOpenAsisModal(true);
  };

  const saveAsistencia = async () => {
    const row = { id: Date.now(), ...asisForm };
    setAsistencia((prev) => [row, ...prev]);
    setOpenAsisModal(false);
  };

  // =========================
  // NOMINA (UI lista)
  // =========================
  const [nomina, setNomina] = useState([]); // placeholder
  const [openNomModal, setOpenNomModal] = useState(false);
  const [nomForm, setNomForm] = useState({
    empleado: "",
    area: "CEDIS",
    periodo_inicio: fechaInicio,
    periodo_fin: fechaFin,
    percepciones: "",
    deducciones: "",
    neto: "",
  });

  const openNewNomina = () => {
    setNomForm({
      empleado: "",
      area: "CEDIS",
      periodo_inicio: fechaInicio,
      periodo_fin: fechaFin,
      percepciones: "",
      deducciones: "",
      neto: "",
    });
    setOpenNomModal(true);
  };

  const saveNomina = async () => {
    const row = { id: Date.now(), ...nomForm };
    setNomina((prev) => [row, ...prev]);
    setOpenNomModal(false);
  };

  // =========================
  // Header + acciones por módulo
  // =========================
  const currentModule = MODULES[moduleTab]?.key;

  const moduleActions = () => {
    if (currentModule === "amo") {
      return (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewAmonestacion}
        >
          Nueva amonestación
        </Button>
      );
    }
    if (currentModule === "asis") {
      return (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewAsistencia}
        >
          Registrar asistencia
        </Button>
      );
    }
    if (currentModule === "nom") {
      return (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewNomina}
        >
          Capturar nómina
        </Button>
      );
    }
    if (currentModule === "prod") {
      return (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={fetchProductividad}
            disabled={loading || !fechaInicio || !fechaFin}
          >
            {loading ? "Consultando..." : "Consultar"}
          </Button>

          <Button
            variant="outlined"
            onClick={exportarProductividadExcel}
            disabled={
              !prodData.surtido.length &&
              !prodData.embarques.length &&
              !prodData.paqueteria.length
            }
          >
            Descargar Excel
          </Button>

          <Tooltip title="Refrescar">
            <IconButton onClick={fetchProductividad} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    }
    if (currentModule === "col") {
      return (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewEmpleado(true)}
        >
          Nuevo colaborador
        </Button>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1e293b" }}
          >
            RH CEDIS
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#64748b" }}>
            Asistencia, nómina, productividad, amonestaciones y altas de
            personal
          </Typography>
        </Box>

        <Box>{moduleActions()}</Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Tabs de módulos */}
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={moduleTab}
          onChange={(_, v) => setModuleTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {MODULES.map((m) => (
            <Tab key={m.key} label={m.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Filtros comunes (fecha) — solo se muestra donde tiene sentido */}
      {(currentModule === "prod" ||
        currentModule === "asis" ||
        currentModule === "nom") && (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                label="Fecha inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <TextField
                label="Fecha fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress size={26} />
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Selecciona el rango para filtrar
                </Typography>
              )}
            </Grid>
          </Grid>

          {error ? (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : null}
        </Paper>
      )}

      {/* CONTENIDO POR MÓDULO */}
      {currentModule === "prod" && (
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Tabs
            value={prodTab}
            onChange={(_, v) => setProdTab(v)}
            variant="fullWidth"
          >
            <Tab label={`Surtido (${prodData.surtido.length})`} />
            <Tab label={`Embarques (${prodData.embarques.length})`} />
            <Tab label={`Paquetería (${prodData.paqueteria.length})`} />
          </Tabs>

          <Divider />

          <Box sx={{ p: 2 }}>
            {/* Totales */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 2 }}
            >
              <Chip label={`Pedidos: ${prodTotals.pedidos}`} />
              <Chip label={`Códigos: ${prodTotals.codigos}`} />
              <Chip label={`Piezas: ${prodTotals.piezas}`} />
              <Chip label={`Horas: ${prodTotals.horas.toFixed(2)}`} />
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>ID Usuario</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="right">Pedidos</TableCell>
                    <TableCell align="right">Códigos</TableCell>
                    <TableCell align="right">Piezas</TableCell>
                    <TableCell align="right">Horas</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {prodRows?.length ? (
                    prodRows.map((r, idx) => (
                      <TableRow key={`${r.id_usuario}-${r.fecha}-${idx}`}>
                        <TableCell>{formatDateYYYYMMDD(r.fecha)}</TableCell>
                        <TableCell>{r.id_usuario}</TableCell>
                        <TableCell>{r.nombre}</TableCell>
                        <TableCell>{r.role}</TableCell>
                        <TableCell align="right">{r.pedidos}</TableCell>
                        <TableCell align="right">{r.codigos}</TableCell>
                        <TableCell align="right">{r.piezas}</TableCell>
                        <TableCell align="right">{r.horas}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          No hay registros para este rango.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}

      {currentModule === "asis" && (
        <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>Asistencia</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Registra entradas/salidas e incidencias (retardo, falta, permiso).
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Entrada</TableCell>
                  <TableCell>Salida</TableCell>
                  <TableCell>Estatus</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asistencia.length ? (
                  asistencia.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.fecha}</TableCell>
                      <TableCell>{r.empleado}</TableCell>
                      <TableCell>{r.area}</TableCell>
                      <TableCell>{r.entrada}</TableCell>
                      <TableCell>{r.salida}</TableCell>
                      <TableCell>{r.estatus}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 4, color: "#94a3b8" }}
                    >
                      Sin registros aún. Usa “Registrar asistencia”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {currentModule === "nom" && (
        <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>Nómina</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Captura por periodo (quincena/semana) y centraliza
            percepciones/deducciones.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Periodo</TableCell>
                  <TableCell align="right">Percepciones</TableCell>
                  <TableCell align="right">Deducciones</TableCell>
                  <TableCell align="right">Neto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nomina.length ? (
                  nomina.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.empleado}</TableCell>
                      <TableCell>{r.area}</TableCell>
                      <TableCell>
                        {r.periodo_inicio} a {r.periodo_fin}
                      </TableCell>
                      <TableCell align="right">{r.percepciones}</TableCell>
                      <TableCell align="right">{r.deducciones}</TableCell>
                      <TableCell align="right">{r.neto}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 4, color: "#94a3b8" }}
                    >
                      Sin nóminas aún. Usa “Capturar nómina”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {currentModule === "amo" && (
        <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Amonestaciones
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Historial por empleado: motivo, nivel, fecha y evidencias (después).
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Nivel</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {amonestaciones.length ? (
                  amonestaciones.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.fecha}</TableCell>
                      <TableCell>{r.empleado}</TableCell>
                      <TableCell>{r.area}</TableCell>
                      <TableCell>{r.nivel}</TableCell>
                      <TableCell>{r.motivo}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 4, color: "#94a3b8" }}
                    >
                      Sin amonestaciones aún. Usa “Nueva amonestación”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {currentModule === "col" && (
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          {loadingColab ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Tabs
                value={depTab}
                onChange={(_, v) => setDepTab(v)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {departamentosKeys.map((dep) => (
                  <Tab
                    key={dep}
                    label={`${dep} (${departamentos[dep].length})`}
                  />
                ))}
              </Tabs>

              <Divider />

              <Box sx={{ p: 2 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Clave</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Puesto</TableCell>
                        <TableCell>Estatus</TableCell>
                        <TableCell>Fecha ingreso</TableCell>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {colaboradoresActual.length ? (
                        colaboradoresActual.map((emp) => (
                          <TableRow key={emp.id_empleado} hover>
                            <TableCell>{emp.clave_empleado}</TableCell>
                            <TableCell>{emp.nombre_completo}</TableCell>
                            <TableCell>{emp.puesto}</TableCell>
                            <TableCell>{emp.estatus}</TableCell>
                            <TableCell>
                              {formatDateYYYYMMDD(emp.fecha_ingreso)}
                            </TableCell>
                            <TableCell>{emp.usuario}</TableCell>
                            <TableCell>{emp.role}</TableCell>
                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                              >
                                {/* Editar empleado */}
                                <Tooltip title="Ver / Editar colaborador">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() =>
                                      openEmpleado(emp.id_empleado)
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>

                                {/* Nueva amonestación */}
                                <Tooltip title="Registrar amonestación">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setEmpleadoDetalle(emp);
                                      fetchCatalogoFaltas();
                                      setOpenNuevaAmonestacion(true);
                                    }}
                                  >
                                    <WarningAmberIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography
                              variant="body2"
                              sx={{ color: "#94a3b8" }}
                            >
                              No hay colaboradores en este departamento
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* =========================
          MODALES
         ========================= */}

      {/* Nueva amonestación */}
      <Dialog
        open={openAmoModal}
        onClose={() => setOpenAmoModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nueva amonestación</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label="Empleado"
                value={amoForm.empleado}
                onChange={(e) =>
                  setAmoForm((p) => ({ ...p, empleado: e.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Área"
                value={amoForm.area}
                onChange={(e) =>
                  setAmoForm((p) => ({ ...p, area: e.target.value }))
                }
                fullWidth
              >
                {AREAS.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Nivel"
                value={amoForm.nivel}
                onChange={(e) =>
                  setAmoForm((p) => ({ ...p, nivel: e.target.value }))
                }
                fullWidth
              >
                {["Leve", "Media", "Grave"].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha"
                type="date"
                value={amoForm.fecha}
                onChange={(e) =>
                  setAmoForm((p) => ({ ...p, fecha: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Motivo"
                value={amoForm.motivo}
                onChange={(e) =>
                  setAmoForm((p) => ({ ...p, motivo: e.target.value }))
                }
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAmoModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={saveAmonestacion}
            variant="contained"
            disabled={!amoForm.empleado || !amoForm.motivo}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asistencia */}
      <Dialog
        open={openAsisModal}
        onClose={() => setOpenAsisModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Registrar asistencia</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label="Empleado"
                value={asisForm.empleado}
                onChange={(e) =>
                  setAsisForm((p) => ({ ...p, empleado: e.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Área"
                value={asisForm.area}
                onChange={(e) =>
                  setAsisForm((p) => ({ ...p, area: e.target.value }))
                }
                fullWidth
              >
                {AREAS.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha"
                type="date"
                value={asisForm.fecha}
                onChange={(e) =>
                  setAsisForm((p) => ({ ...p, fecha: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Entrada"
                type="time"
                value={asisForm.entrada}
                onChange={(e) =>
                  setAsisForm((p) => ({ ...p, entrada: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Salida"
                type="time"
                value={asisForm.salida}
                onChange={(e) =>
                  setAsisForm((p) => ({ ...p, salida: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Estatus"
                value={asisForm.estatus}
                onChange={(e) =>
                  setAsisForm((p) => ({ ...p, estatus: e.target.value }))
                }
                fullWidth
              >
                {["Asistió", "Retardo", "Falta", "Permiso", "Vacaciones"].map(
                  (s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAsisModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={saveAsistencia}
            variant="contained"
            disabled={!asisForm.empleado || !asisForm.fecha}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nómina */}
      <Dialog
        open={openNomModal}
        onClose={() => setOpenNomModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Capturar nómina</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label="Empleado"
                value={nomForm.empleado}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, empleado: e.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Área"
                value={nomForm.area}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, area: e.target.value }))
                }
                fullWidth
              >
                {AREAS.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Periodo inicio"
                type="date"
                value={nomForm.periodo_inicio}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, periodo_inicio: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Periodo fin"
                type="date"
                value={nomForm.periodo_fin}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, periodo_fin: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Percepciones"
                value={nomForm.percepciones}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, percepciones: e.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Deducciones"
                value={nomForm.deducciones}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, deducciones: e.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Neto"
                value={nomForm.neto}
                onChange={(e) =>
                  setNomForm((p) => ({ ...p, neto: e.target.value }))
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNomModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={saveNomina}
            variant="contained"
            disabled={
              !nomForm.empleado ||
              !nomForm.periodo_inicio ||
              !nomForm.periodo_fin
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detalle de usuario */}

      <Dialog
        open={openEmpleadoModal}
        onClose={() => setOpenEmpleadoModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Detalle del colaborador</DialogTitle>

        <DialogContent dividers>
          <Box id="empleado-modal-root">
            {loadingEmpleado ? (
              <Box sx={{ textAlign: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* ============================= */
                /* DATOS DEL COLABORADOR */
                /* ============================= */}

                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Información del colaborador
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Clave empleado"
                      value={empleadoDetalle.clave_empleado || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          clave_empleado: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Nombre completo"
                      value={empleadoDetalle.nombre_completo || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          nombre_completo: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Genero"
                      value={empleadoDetalle.genero || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          genero: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Estatus"
                      value={empleadoDetalle.estatus || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          estatus: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Fecha ingreso"
                      type="date"
                      value={formatDateYYYYMMDD(empleadoDetalle.fecha_ingreso)}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          fecha_ingreso: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Puesto"
                      value={empleadoDetalle.puesto || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          puesto: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Departamento"
                      value={empleadoDetalle.departamento || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          departamento: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unidad negocio"
                      value={empleadoDetalle.unidad_negocio || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          unidad_negocio: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Centro costo"
                      value={empleadoDetalle.centro_costo || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          centro_costo: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tipo nomina"
                      value={empleadoDetalle.tipo_nomina || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          tipo_nomina: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Frecuencia nomina"
                      value={empleadoDetalle.frecuencia_nomina || ""}
                      onChange={(e) =>
                        setEmpleadoDetalle({
                          ...empleadoDetalle,
                          frecuencia_nomina: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>

                {/* ============================= */
                /* SEPARADOR */
                /* ============================= */}

                <Divider sx={{ my: 4 }} />

                {/* ============================= */
                /* AMONESTACIONES */
                /* ============================= */}

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Histórico de amonestaciones
                  </Typography>
                </Stack>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Falta</TableCell>
                        <TableCell>Reincidencia</TableCell>
                        <TableCell>Sanción</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Evidencias</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {amonestacionesEmpleado.length ? (
                        amonestacionesEmpleado.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{formatDateYYYYMMDD(a.fecha)}</TableCell>
                            <TableCell>{a.nombre_falta}</TableCell>
                            <TableCell>{a.reincidencia}</TableCell>
                            <TableCell>{a.tipo_sancion}</TableCell>
                            <TableCell>{a.descripcion}</TableCell>
                            <TableCell>
                              {a.evidencias?.length ? (
                                a.evidencias.map((ev) => (
                                  <Button
                                    key={ev.id}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => abrirEvidencia(ev.archivo)}
                                  >
                                    Ver
                                  </Button>
                                ))
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Sin archivos
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            Sin amonestaciones registradas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEmpleadoModal(false)} color="inherit">
            Cerrar
          </Button>

          <Button variant="contained" onClick={saveEmpleado}>
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alta de usuario */}
      <Dialog
        open={openNewEmpleado}
        onClose={() => setOpenNewEmpleado(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Nuevo colaborador</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Clave empleado"
                value={newEmpleado.clave_empleado}
                onChange={(e) =>
                  setNewEmpleado({
                    ...newEmpleado,
                    clave_empleado: e.target.value,
                  })
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                label="Nombre completo"
                value={newEmpleado.nombre_completo}
                onChange={(e) =>
                  setNewEmpleado({
                    ...newEmpleado,
                    nombre_completo: e.target.value,
                  })
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Genero"
                value={newEmpleado.genero}
                onChange={(e) =>
                  setNewEmpleado({ ...newEmpleado, genero: e.target.value })
                }
                fullWidth
              >
                {GENEROS.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Tipo nomina"
                value={newEmpleado.tipo_nomina}
                onChange={(e) =>
                  setNewEmpleado({
                    ...newEmpleado,
                    tipo_nomina: e.target.value,
                  })
                }
                fullWidth
              >
                {TIPOS_NOMINA.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Fecha ingreso"
                type="date"
                value={newEmpleado.fecha_ingreso}
                onChange={(e) =>
                  setNewEmpleado({
                    ...newEmpleado,
                    fecha_ingreso: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Unidad negocio"
                value={newEmpleado.unidad_negocio}
                onChange={(e) =>
                  setNewEmpleado({
                    ...newEmpleado,
                    unidad_negocio: e.target.value,
                  })
                }
                fullWidth
              >
                {UNIDADES_NEGOCIO.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Departamento"
                value={newEmpleado.departamento}
                onChange={(e) =>
                  setNewEmpleado({
                    ...newEmpleado,
                    departamento: e.target.value,
                  })
                }
                fullWidth
              >
                {DEPARTAMENTOS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Puesto"
                value={newEmpleado.puesto}
                onChange={(e) =>
                  setNewEmpleado({ ...newEmpleado, puesto: e.target.value })
                }
                fullWidth
              >
                {PUESTOS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenNewEmpleado(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveNewEmpleado}>
            Crear colaborador
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alta de Amonestacion */}
      <Dialog
        open={openNuevaAmonestacion}
        onClose={() => setOpenNuevaAmonestacion(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nueva amonestación</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Falta"
                value={nuevaAmonestacion.id_falta}
                onChange={(e) =>
                  setNuevaAmonestacion({
                    ...nuevaAmonestacion,
                    id_falta: e.target.value,
                  })
                }
                fullWidth
              >
                {faltasCatalogo.map((f) => (
                  <MenuItem key={f.id_falta} value={f.id_falta}>
                    {f.nombre_falta}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                value={nuevaAmonestacion.descripcion}
                onChange={(e) =>
                  setNuevaAmonestacion({
                    ...nuevaAmonestacion,
                    descripcion: e.target.value,
                  })
                }
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Fecha"
                type="date"
                value={nuevaAmonestacion.fecha}
                onChange={(e) =>
                  setNuevaAmonestacion({
                    ...nuevaAmonestacion,
                    fecha: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                Subir evidencias (PDF / imágenes)
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    setArchivosAmonestacion(Array.from(e.target.files));
                  }}
                />
              </Button>

              {archivosAmonestacion.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {archivosAmonestacion.map((file, i) => (
                    <Typography key={i} variant="caption" display="block">
                      📎 {file.name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenNuevaAmonestacion(false)}>
            Cancelar
          </Button>

          <Button variant="contained" onClick={saveNuevaAmonestacion}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Alta de Amonestacion */}

      <Dialog
        open={openPdfViewer}
        onClose={() => setOpenPdfViewer(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Evidencia</DialogTitle>

        <DialogContent dividers>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="visor-pdf"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            />
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPdfViewer(false)} color="inherit">
            Cerrar
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = "";
              link.click();
            }}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RhCedis;

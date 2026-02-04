import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Modal,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Paper,
  Menu,
  Divider,
} from "@mui/material";
import { AddTask, ArrowDropDown } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

const API_URL = "http://66.232.105.87:3007/api/devs";

const ESTADOS = [
  "Pendiente",
  "En desarrollo",
  "En pruebas",
  "Bloqueada",
  "Finalizada",
];

const estadoColor = {
  Pendiente: "#90a4ae",
  "En desarrollo": "#42a5f5",
  "En pruebas": "#ffa726",
  Bloqueada: "#ef5350",
  Finalizada: "#66bb6a",
};

function TareaDev() {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [tareas, setTareas] = useState([]);
  const [devs, setDevs] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  const [estadoMenu, setEstadoMenu] = useState(null);
  const [tareaEstado, setTareaEstado] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "Media",
    id_dev: "",
    id_proyecto: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  // ==========================
  // Fetch
  // ==========================
  useEffect(() => {
    const fetchData = async () => {
      const [t, d, p] = await Promise.all([
        axios.get(`${API_URL}/tareas`),
        axios.get(`${API_URL}/desarrolladores`),
        axios.get(`${API_URL}/proyectos`),
      ]);

      setTareas(
        t.data
          .map((x) => ({ ...x, id: x.id_tarea }))
          .filter((x) => x.estado !== "Finalizada")
      );
      setDevs(d.data);
      setProyectos(p.data);
    };
    fetchData();
  }, []);

  // ==========================
  // Estado
  // ==========================
  const openEstado = (e, row) => {
    setEstadoMenu(e.currentTarget);
    setTareaEstado(row);
  };

  const changeEstado = async (nuevo) => {
    await axios.put(`${API_URL}/tareas/${tareaEstado.id_tarea}`, {
      estado: nuevo,
    });

    setTareas((prev) =>
      prev.map((t) => (t.id === tareaEstado.id ? { ...t, estado: nuevo } : t))
    );

    setSnackbar({
      open: true,
      message: `Estado actualizado a "${nuevo}"`,
      severity: "info",
    });

    setEstadoMenu(null);
    setTareaEstado(null);
  };

  // ==========================
  // Crear
  // ==========================
  const handleSubmit = async () => {
    setLoading(true);

    await axios.post(`${API_URL}/tareas`, {
      ...form,
      id_dev: Number(form.id_dev),
      id_proyecto: Number(form.id_proyecto),
    });

    const res = await axios.get(`${API_URL}/tareas`);
    setTareas(
      res.data
        .map((x) => ({ ...x, id: x.id_tarea }))
        .filter((x) => x.estado !== "Finalizada")
    );

    setForm({
      titulo: "",
      descripcion: "",
      prioridad: "Media",
      id_dev: "",
      id_proyecto: "",
    });

    setOpenModal(false);
    setLoading(false);

    setSnackbar({
      open: true,
      message: "Tarea creada correctamente",
      severity: "success",
    });
  };

  // ==========================
  // Columnas
  // ==========================
  const columns = [
    { field: "titulo", headerName: "Tarea", flex: 1.2 },
    { field: "descripcion", headerName: "Descripción", flex: 2 },
    {
      field: "prioridad",
      headerName: "Prioridad",
      flex: 0.7,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            background: "rgba(0,0,0,0.05)",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          onClick={(e) => openEstado(e, params.row)}
          icon={<ArrowDropDown />}
          sx={{
            cursor: "pointer",
            background: `${estadoColor[params.value]}22`,
            color: estadoColor[params.value],
            border: `1px solid ${estadoColor[params.value]}55`,
            backdropFilter: "blur(6px)",
          }}
        />
      ),
    },
    { field: "desarrollador", headerName: "Desarrollador", flex: 1 },
    { field: "nombre_proyecto", headerName: "Proyecto", flex: 1 },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Tareas Pendientes
        </Typography>

        <Button
          startIcon={<AddTask />}
          onClick={() => setOpenModal(true)}
          sx={{
            borderRadius: 3,
            background: "rgba(25,118,210,0.15)",
            color: "#1976d2",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(25,118,210,0.25)",
            "&:hover": {
              background: "rgba(25,118,210,0.25)",
            },
          }}
        >
          Nueva tarea
        </Button>
      </Stack>

      {/* TABLA */}
      <Paper
        sx={{
          height: 620,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 1)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(177, 176, 176, 0.4)",
        }}
      >
        <DataGrid
          rows={tareas}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              fontWeight: 600,
            },
            "& .MuiDataGrid-row:hover": {
              background: "rgba(25,118,210,0.06)",
            },
          }}
        />
      </Paper>

      {/* MENU ESTADOS */}
      <Menu
        anchorEl={estadoMenu}
        open={Boolean(estadoMenu)}
        onClose={() => setEstadoMenu(null)}
        PaperProps={{
          sx: {
            backdropFilter: "blur(18px)",
            background: "rgba(255,255,255,0.85)",
            borderRadius: 3,
          },
        }}
      >
        {ESTADOS.map((e) => (
          <MenuItem key={e} onClick={() => changeEstado(e)}>
            <Chip
              label={e}
              size="small"
              sx={{
                background: `${estadoColor[e]}22`,
                color: estadoColor[e],
                border: `1px solid ${estadoColor[e]}55`,
              }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* MODAL CREAR */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            m: "auto",
            width: 440,
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(24px)",
            background: "rgba(231, 231, 231, 0.72)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <Typography fontWeight={600} mb={1}>
            Nueva tarea
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Completa la información de la tarea
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            <TextField
              label="Descripción"
              multiline
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />

            <TextField
              select
              label="Prioridad"
              value={form.prioridad}
              onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
            >
              {["Baja", "Media", "Alta", "Urgente"].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Desarrollador"
              value={form.id_dev}
              onChange={(e) => setForm({ ...form, id_dev: e.target.value })}
            >
              {devs.map((d) => (
                <MenuItem key={d.id_dev} value={d.id_dev}>
                  {d.nombre_completo}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Proyecto"
              value={form.id_proyecto}
              onChange={(e) =>
                setForm({ ...form, id_proyecto: e.target.value })
              }
            >
              {proyectos.map((p) => (
                <MenuItem key={p.id_proyecto} value={p.id_proyecto}>
                  {p.nombre_proyecto}
                </MenuItem>
              ))}
            </TextField>

            <Button
              onClick={handleSubmit}
              sx={{
                mt: 1,
                borderRadius: 3,
                background: "#1976d2",
                color: "#fff",
                "&:hover": { background: "#1565c0" },
              }}
            >
              Guardar tarea
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* LOADER */}
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default TareaDev;

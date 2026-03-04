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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const API_BASE = "http://66.232.105.87:3007/api/RH";

function formatDateYYYYMMDD(dateLike) {
  if (!dateLike) return "";
  // viene como "2026-03-04T06:00:00.000Z"
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

function RhCedis() {
  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [tab, setTab] = useState(0);

  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    surtido: [],
    embarques: [],
    paqueteria: [],
  });

  const fetchProductividad = async () => {
    setLoading(true);
    setError("");

    try {
      const resp = await axios.get(`${API_BASE}/productividad`, {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
      });

      if (!resp.data?.ok) {
        setError(resp.data?.message || "No se pudo obtener productividad.");
        setData({ surtido: [], embarques: [], paqueteria: [] });
        return;
      }

      setData({
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
      setData({ surtido: [], embarques: [], paqueteria: [] });
    } finally {
      setLoading(false);
    }
  };

  // si quieres que cargue automático al abrir, déjalo
  useEffect(() => {
    fetchProductividad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRows =
    tab === 0 ? data.surtido : tab === 1 ? data.embarques : data.paqueteria;

  const totals = useMemo(() => {
    const rows = currentRows || [];
    return {
      pedidos: rows.reduce((acc, r) => acc + toNumberSafe(r.pedidos), 0),
      codigos: rows.reduce((acc, r) => acc + toNumberSafe(r.codigos), 0),
      piezas: rows.reduce((acc, r) => acc + toNumberSafe(r.piezas), 0),
      horas: rows.reduce((acc, r) => acc + toNumberSafe(r.horas), 0),
    };
  }, [currentRows]);

  return (
    <Box sx={{ padding: 3 }}>
      {/* Encabezado */}
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", marginBottom: 1, color: "#1e293b" }}
      >
        Recursos Humanos CEDIS
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{ color: "#64748b", marginBottom: 2 }}
      >
        Productividad por área: Surtido, Embarques y Paquetería
      </Typography>

      <Divider sx={{ marginBottom: 3 }} />

      {/* Filtros */}
      <Paper
        elevation={2}
        sx={{ padding: 2, borderRadius: 2, marginBottom: 2 }}
      >
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
            <Button
              variant="contained"
              fullWidth
              onClick={fetchProductividad}
              disabled={loading || !fechaInicio || !fechaFin}
              sx={{ height: 56 }}
            >
              {loading ? "Consultando..." : "Consultar"}
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : null}
          </Grid>
        </Grid>

        {error ? (
          <Box sx={{ marginTop: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : null}
      </Paper>

      {/* Tabs + contenido */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
        >
          <Tab label={`Surtido (${data.surtido.length})`} />
          <Tab label={`Embarques (${data.embarques.length})`} />
          <Tab label={`Paquetería (${data.paqueteria.length})`} />
        </Tabs>

        <Divider />

        <Box sx={{ padding: 2 }}>
          {/* Totales del tab actual */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              marginBottom: 2,
              color: "#334155",
            }}
          >
            <Typography variant="body2">
              <b>Pedidos:</b> {totals.pedidos}
            </Typography>
            <Typography variant="body2">
              <b>Códigos:</b> {totals.codigos}
            </Typography>
            <Typography variant="body2">
              <b>Piezas:</b> {totals.piezas}
            </Typography>
            <Typography variant="body2">
              <b>Horas:</b> {totals.horas.toFixed(2)}
            </Typography>
          </Box>

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
                {currentRows?.length ? (
                  currentRows.map((r, idx) => (
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
                        No hay registros para este rango de fechas.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}

export default RhCedis;
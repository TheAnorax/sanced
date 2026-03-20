import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";

export default function AdminTransportes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [columnasDisponibles, setColumnasDisponibles] = useState([]);
  const [columnasVisibles, setColumnasVisibles] = useState([]);
  const STORAGE_KEY = "admin_transportes_columns";

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [openConfig, setOpenConfig] = useState(false);

  const [openExport, setOpenExport] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoExport, setTipoExport] = useState("visibles");

const colores = [
  "#f8fafc", // base
  "#f1f5f9",
  "#e2e8f0",
  "#f8fafc",
  "#f1f5f9",
];  const toggleTodasColumnas = (checked) => {
    if (checked) {
      setColumnasVisibles(columnasDisponibles);
    } else {
      setColumnasVisibles([]);
    }
  };

  const getColorPorGuia = (guia, mapa) => {
    if (!mapa[guia]) {
      mapa[guia] = colores[Object.keys(mapa).length % colores.length];
    }
    return mapa[guia];
  };

  // 🔥 FETCH
  const fetchData = async (fechaConsulta) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://66.232.105.87:3007/api/Trasporte/allTransportes?fecha=${fechaConsulta}`
      );

      const routes = res.data.routes || [];
      setData(routes);

      if (routes.length && routes[0].data.length) {
        const columnas = Object.keys(routes[0].data[0]);
        setColumnasDisponibles(columnas);

        const guardadas = localStorage.getItem(STORAGE_KEY);
        if (guardadas) {
          const parsed = JSON.parse(guardadas);
          setColumnasVisibles(parsed.length ? parsed : columnas);
        } else {
          setColumnasVisibles(columnas);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(fecha);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnasVisibles));
  }, [columnasVisibles]);

  const toggleColumna = (col) => {
    setColumnasVisibles((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleExportExcel = async () => {
    const res = await axios.get(
      `http://66.232.105.87:3007/api/Trasporte/allTransportes?fecha=${fechaInicio}`
    );

    let rows = [];
    res.data.routes.forEach((r) => r.data.forEach((i) => rows.push(i)));

    let columnasFinales =
      tipoExport === "todas" ? Object.keys(rows[0] || {}) : columnasVisibles;

    const dataExport = rows.map((row) => {
      const obj = {};
      columnasFinales.forEach((col) => (obj[col] = row[col]));
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transportes");

    XLSX.writeFile(wb, `Reporte_${fechaInicio}_${fechaFin}.xlsx`);
    setOpenExport(false);
  };

  return (
    <Box p={3} sx={{ background: "#f4f6f8", minHeight: "100vh" }}>
      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          🚛 Administración de Transportes
        </Typography>
        <Typography color="text.secondary">
          Control y validación de guías y fletes
        </Typography>
      </Paper>

      {/* CONTROLES */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              type="date"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                fetchData(e.target.value);
              }}
            />
          </Grid>

          <Grid item>
            <Button variant="contained" onClick={() => setOpenConfig(true)}>
              ⚙️ Columnas
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="success"
              onClick={() => setOpenExport(true)}
            >
              📊 Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* LOADING */}
      {loading && <CircularProgress />}

      {/* RUTAS */}
      {!loading &&
        data.map((ruta) => (
          <Paper key={ruta.routeName} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              {ruta.routeName} ({ruta.total})
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  {columnasVisibles.map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {(() => {
                  const mapaGuias = {};

                  const agrupado = ruta.data.reduce((acc, item) => {
                    const guia = item.GUIA || "SIN_GUIA";
                    if (!acc[guia]) acc[guia] = [];
                    acc[guia].push(item);
                    return acc;
                  }, {});

                  return Object.entries(agrupado).map(([guia, items]) => {
                    const color = getColorPorGuia(guia, mapaGuias);

                    const totalFactura = parseFloat(
                      items[0]?.TOTAL_FACTURA_LT || 0
                    );

                    const sumaProrrateo = items.reduce((sum, i) => {
                      return sum + parseFloat(i.PRORRATEO_FACTURA_LT || 0);
                    }, 0);

                    const diff = Math.abs(totalFactura - sumaProrrateo);
                    const correcto = diff < 0.5;

                    return (
                      <React.Fragment key={guia}>
                        <TableRow
                          sx={{
                            background: "#1e293b", // 🔥 negro elegante (tailwind slate-900)
                          }}
                        >
                          <TableCell colSpan={columnasVisibles.length}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              {/* IZQUIERDA */}
                              <Box display="flex" gap={2} alignItems="center">
                                <Typography
                                  sx={{
                                    color: "#fff",
                                    fontWeight: 700,    
                                    fontSize: "14px",
                                  }}
                                >
                                  📦 GUIA: {guia}
                                </Typography>

                                <Typography
                                  sx={{ color: "#94a3b8", fontSize: "13px" }}
                                >
                                  ({items.length} pedidos)
                                </Typography>
                              </Box>

                              {/* DERECHA */}
                              <Box display="flex" gap={3} alignItems="center">
                                <Typography
                                  sx={{ color: "#38bdf8", fontWeight: 600 }}
                                >
                                  Total: ${totalFactura.toLocaleString()}
                                </Typography>

                                <Typography
                                  sx={{ color: "#facc15", fontWeight: 600 }}
                                >
                                  Prorrateo: ${sumaProrrateo.toLocaleString()}
                                </Typography>

                                <Typography
                                  sx={{
                                    color: correcto ? "#22c55e" : "#ef4444",
                                    fontWeight: 700,
                                  }}
                                >
                                  {correcto
                                    ? "✔ Correcto"
                                    : `✖ Error (${diff.toFixed(2)})`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>

                        {items.map((row, i) => (
                          <TableRow key={i} sx={{ background: color }}>
                            {columnasVisibles.map((col) => (
                              <TableCell key={col}>{row[col] ?? "-"}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </Paper>
        ))}

      {/* MODAL CONFIG */}
      <Dialog open={openConfig} onClose={() => setOpenConfig(false)}>
        <DialogTitle>Columnas</DialogTitle>

        <DialogContent>
          {/* 🔥 SELECT ALL */}
          <FormControlLabel
            control={
              <Checkbox
                checked={columnasVisibles.length === columnasDisponibles.length}
                indeterminate={
                  columnasVisibles.length > 0 &&
                  columnasVisibles.length < columnasDisponibles.length
                }
                onChange={(e) => toggleTodasColumnas(e.target.checked)}
              />
            }
            label="Seleccionar / Deseleccionar todas"
          />

          <Divider sx={{ my: 2 }} />

          {/* 🔥 LISTA NORMAL */}
          <FormGroup>
            {columnasDisponibles.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Checkbox
                    checked={columnasVisibles.includes(col)}
                    onChange={() => toggleColumna(col)}
                  />
                }
                label={col}
              />
            ))}
          </FormGroup>
        </DialogContent>
      </Dialog>

      {/* MODAL EXPORT */}
      <Dialog open={openExport} onClose={() => setOpenExport(false)}>
        <DialogTitle>Exportar Excel</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            type="date"
            label="Inicio"
            InputLabelProps={{ shrink: true }}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />

          <TextField
            type="date"
            label="Fin"
            InputLabelProps={{ shrink: true }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />

          <Button onClick={handleExportExcel} variant="contained">
            Descargar
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

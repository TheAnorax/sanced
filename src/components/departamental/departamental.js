import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Divider,
  Select,
  MenuItem,
} from "@mui/material";

function Departamental() {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [year, setYear] = useState("2025"); // Default 2025

  // ================================
  // Carga inicial
  // ================================
  useEffect(() => {
    axios
      .get("http://66.232.105.87:3007/api/departamental/datos")
      .then((res) => setData(res.data.data))
      .catch((e) => console.error(e))
      .finally(() => setCargando(false));
  }, []);

  // ================================
  // Filtrar por Año
  // ================================
  const filtrados = data.filter((row) => {
    const fecha =
      row.FECHA_DE_CITA || row.FECHA_DE_CARGA || row.FECHA_LLEGADA_OC || "";

    if (fecha.includes("/")) {
      const extraido = fecha.split("/")[2]; // DD/MM/YYYY
      return extraido === year;
    }
    return false;
  });

  // ================================
  // Agrupar por cliente
  // ================================
  const agrupado = filtrados.reduce((acc, item) => {
    const cliente = item.CLIENTE || "SIN CLIENTE";
    if (!acc[cliente]) acc[cliente] = [];
    acc[cliente].push(item);
    return acc;
  }, {});

  if (cargando)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Panel Departamental
      </Typography>

      {/* ------------------ SELECT DE AÑO ------------------ */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Typography sx={{ mr: 2, mt: 1 }}>Año:</Typography>
        <Select
          size="small"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{ width: 120 }}
        >
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2024">2024</MenuItem>
          <MenuItem value="2025">2025</MenuItem>
        </Select>
      </Box>

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
                  <TableCell>OC</TableCell>
                  <TableCell>Destino</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Llegada OC</TableCell>
                  <TableCell>Fecha Carga</TableCell>
                  <TableCell>Fecha Cita</TableCell>
                  <TableCell>Empacador</TableCell>
                  <TableCell>Estatus</TableCell>
                  <TableCell>Tipo Envío</TableCell>
                  <TableCell>Comentarios</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pedidos.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{p.FOLIO}</TableCell>
                    <TableCell>{p.NO_DE_OC}</TableCell>
                    <TableCell>{p.DESTINO}</TableCell>
                    <TableCell>{p.MONTO}</TableCell>
                    <TableCell>{p.FECHA_LLEGADA_OC}</TableCell>
                    <TableCell>{p.FECHA_DE_CARGA}</TableCell>
                    <TableCell>{p.FECHA_DE_CITA}</TableCell>
                    <TableCell>{p.EMPACADOR}</TableCell>
                    <TableCell>{p.ESTATUS}</TableCell>
                    <TableCell>{p.TIPO_DE_ENVIO}</TableCell>
                    <TableCell>{p.COMENTARIOS}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Divider sx={{ mt: 3 }} />
        </Box>
      ))}
    </Box>
  );
}

export default Departamental;

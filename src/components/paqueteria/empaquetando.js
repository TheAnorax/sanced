import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  CircularProgress,
  Alert,
  Fab,
  Modal,
  Backdrop,
  Fade,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WorkIcon from "@mui/icons-material/Work";
import TimerIcon from "@mui/icons-material/Timer";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Barcode from "react-barcode";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

function Empaquetando() {
  const [pedidos, setPedidos] = useState([]);
  const [usuariosConRecuento, setUsuariosConRecuento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Estado para controlar la apertura del modal
  const [productividad, setProductividad] = useState([]); // Estado para almacenar los datos de productividad

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(
          "http://66.232.105.87:3007/api/paqueterias/progreso"
        );
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const { pedidos, recuentoUsuarios } = data;

        const sortedPedidos = pedidos.sort(
          (a, b) =>
            parseFloat(b.progreso_validacion) -
            parseFloat(a.progreso_validacion)
        );
        setPedidos(sortedPedidos);
        setUsuariosConRecuento(recuentoUsuarios);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPedidos();
    const intervalId = setInterval(fetchPedidos, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Función para determinar el color basado en el progreso
  const getColorByProgress = (progress) => {
    if (progress <= 25) return "#e74c3c"; // Rojo para 0-25%
    if (progress <= 50) return "#f39c12"; // Naranja para 26-50%
    if (progress <= 75) return "#f1c40f"; // Amarillo para 51-75%
    return "#2ecc71"; // Verde para 76-100%
  };

  const totalPedidosGeneral = productividad.reduce(
    (total, item) => total + (item.pedidos || 0),
    0
  );

  // Función para abrir el modal
  const handleOpen = async () => {
    try {
      const response = await fetch(
        "http://66.232.105.87:3007/api/paqueterias/productividad"
      ); // URL para obtener los datos de productividad
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setProductividad(data); // Almacenar los datos de productividad en el estado
      setOpen(true); // Abrir el modal
    } catch (error) {
      console.error("Error fetching productividad data:", error);
    }
  };

  const [tab, setTab] = useState(0);

  const [impresoras, setImpresoras] = useState([]);
  const [empacadores, setEmpacadores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);

  // GET impresoras EMPACADORES
  useEffect(() => {
    const fetchImpresoras = async () => {
      try {
        const resp = await fetch(
          "http://66.232.105.87:3007/api/paqueterias/prints/empacadores"
        );
        const data = await resp.json();

        // 🔥 Normaliza a ARRAY
        const result = Array.isArray(data) ? data : data.impresoras || [];

        setImpresoras(result);
      } catch (err) {
        console.error("Error cargando impresoras empacadores:", err);
        setImpresoras([]);
      }
    };

    fetchImpresoras();
  }, []);

  // GET empacadores
  useEffect(() => {
    const fetchEmpacadores = async () => {
      try {
        const resp = await fetch(
          "http://66.232.105.87:3007/api/paqueterias/empacadores"
        );
        const data = await resp.json();

        if (data.ok) {
          setEmpacadores(data.embarcadores); // 👈 AQUÍ EL CAMBIO
        } else {
          setEmpacadores([]);
        }
      } catch (err) {
        console.error("Error cargando empacadores:", err);
        setEmpacadores([]);
      }
    };

    fetchEmpacadores();
  }, []);

  const asignarImpresora = async (id_print, id_usu) => {
    try {
      const res = await fetch(
        "http://66.232.105.87:3007/api/paqueterias/impresora/asignar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_print, id_usu }),
        }
      );

      const data = await res.json();

      if (!data.ok) {
        alert("❌ No se pudo asignar");
        return;
      }

      alert("✔ Impresora asignada correctamente");
      cerrarModal();
      window.location.reload(); // refresco suave
    } catch (e) {
      console.log("Error asignando impresora:", e);
    }
  };

  const abrirModal = (imp) => {
    setSelectedPrinter(imp);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSelectedPrinter(null);
  };

  // Lista de impresoras válidas en Paquetería
  const printersValidas = [
    "NLS-PP310-EA30",
    "NLS-PP310-1F3D",
    "NLS-PP310-147D",
    "NLS-PP310-EE93",
    "NLS-PP310-6654",
    "NLS-PP310-25C8",
    "NLS-PP310-EA15",
    "NLS-PP310-EA57",
  ];

  // Normaliza texto
  const normalize = (v) => (v || "").trim().toLowerCase();

  // 1️⃣ Filtrar impresoras válidas
  const impresorasFiltradas = impresoras
    .map((imp) => ({
      ...imp,
      hand: imp.hand ? imp.hand.trim() : "",
      usuario: imp.usuario ? imp.usuario.trim() : null,
    }))
    .filter((imp) => printersValidas.includes(imp.hand));

  // 2️⃣ Agrupar por modelo
  const impresorasAgrupadas = impresorasFiltradas.reduce((acc, imp) => {
    if (!acc[imp.hand]) acc[imp.hand] = [];
    acc[imp.hand].push(imp);
    return acc;
  }, {});

  const liberarImpresora = async (id_print) => {
    const res = await fetch(
      "http://66.232.105.87:3007/api/paqueterias/impresora/liberar",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_print }),
      }
    );

    const data = await res.json();

    if (data.ok) {
      alert(" ✔ Impresora liberada correctamente");
      window.location.reload();
    } else {
      alert("❌ No se pudo liberar");
    }
  };

  const estaEnUso = (usuario) => {
    if (!usuario) return false;

    return usuariosConRecuento.some(
      (u) => u.usuario.trim().toLowerCase() === usuario.trim().toLowerCase()
    );
  };

  // Función para cerrar el modal
  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="error">Error al cargar los datos: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Panel de Paquetería 📦
      </Typography>

      {/* ------------ TABS --------------- */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="En progreso" />
        <Tab label="Impresoras - Usuarios" />
      </Tabs>

      {/* ==========================================================
          TAB 0 — PRINCIPAL
          ========================================================== */}
      {tab === 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Recuento por Usuario
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 1,
            }}
          >
            {usuariosConRecuento?.length > 0 &&
              usuariosConRecuento.map((u, i) => {
                const primerNombre = u.usuario.split(" ")[0];
                return (
                  <Card key={i} sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography variant="h6">{primerNombre}</Typography>
                      <Typography variant="body2">
                        Pedidos: {u.cantidad_pedidos}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
          </Box>

          <Typography variant="h5" sx={{ mt: 4 }}>
            Pedidos en Progreso
          </Typography>

          {pedidos.map((pedido, i) => {
            const progreso = parseFloat(pedido.progreso_validacion) || 0;
            const color = getColorByProgress(progreso);
            const primerNombre = pedido.usuario.split(" ")[0];

            return (
              <Card key={i} sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6">Pedido: {pedido.pedido}</Typography>

                  <Typography sx={{ mb: 1 }}>
                    Usuario: {primerNombre} — Partidas: {pedido.partidas} —
                    Piezas: {pedido.cantidad_piezas}
                  </Typography>

                  <Box>
                    <Typography>Progreso: {progreso.toFixed(2)}%</Typography>
                    <LinearProgress
                      value={progreso}
                      variant="determinate"
                      sx={{
                        height: 10,
                        borderRadius: 3,
                        mt: 1,
                        backgroundColor: "#ddd",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: color,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {/* BOTÓN PRODUCTIVIDAD */}
          <Fab
            color="primary"
            sx={{ position: "fixed", bottom: 20, right: 20 }}
            onClick={handleOpen}
          >
            <AddIcon />
          </Fab>

          {/* MODAL PRODUCTIVIDAD */}

          {/* ================= MODAL PRODUCTIVIDAD ================== */}
          <Modal open={open} onClose={handleClose}>
            <Fade in={open}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "65vw",
                  maxHeight: "80vh",
                  bgcolor: "#fff",
                  borderRadius: 3,
                  p: 3,
                  boxShadow: 24,
                  overflow: "hidden",
                }}
              >
                {/* HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mr: 2 }}>
                    🏆 Ranking Productividad
                  </Typography>
                </Box>

                {/* TABLA CONTENT SCROLLABLE */}
                <Box sx={{ overflowY: "auto", maxHeight: "65vh", pr: 1 }}>
                  <TableContainer component={Paper} elevation={2}>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#f7f7f7" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", width: "5%" }}>
                            #
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Usuario
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Piezas
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Partidas
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Tiempo
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {[...productividad]
                          .sort((a, b) => b.partidas - a.partidas)
                          .map((item, i) => {
                            let trophy = "";
                            if (i === 0) trophy = "🥇";
                            if (i === 1) trophy = "🥈";
                            if (i === 2) trophy = "🥉";

                            return (
                              <TableRow key={i}>
                                <TableCell sx={{ fontWeight: "bold" }}>
                                  {i + 1} {trophy}
                                </TableCell>
                                <TableCell>{item.usuario}</TableCell>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>
                                  {item.cantidad_piezas?.toLocaleString(
                                    "es-MX"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.partidas?.toLocaleString("es-MX")}
                                </TableCell>
                                <TableCell>
                                  {item.tiempo_total_trabajo}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* BOTÓN CERRAR */}
                <Box textAlign="center" mt={2}>
                  <Fab color="error" size="small" onClick={handleClose}>
                    ✖
                  </Fab>
                </Box>
              </Box>
            </Fade>
          </Modal>
        </>
      )}

      {/* ==========================================================
    TAB 1 — IMPRESORAS
    ========================================================== */}
      {tab === 1 && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            🖨️ Impresoras asignadas a empacadores
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              pb: 2,
            }}
          >
            {Object.keys(impresorasAgrupadas).length === 0 ? (
              <Typography align="center" sx={{ mt: 3 }}>
                🔌 No hay impresoras registradas todavía
              </Typography>
            ) : (
              Object.entries(impresorasAgrupadas).map(([modelo, lista]) => (
                <Box
                  key={modelo}
                  sx={{
                    minWidth: 280,
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#fff",
                    border: "1px solid #ddd",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    {modelo}
                  </Typography>

                  {lista.map((imp) => {
                    const enUsoReal = imp.usuario && estaEnUso(imp.usuario);

                    return (
                      <Card
                        key={imp.id_print}
                        sx={{
                          border: enUsoReal
                            ? "2px solid #3498db"
                            : "1px solid #ddd",
                          backgroundColor: enUsoReal ? "#E6F3FF" : "#fff",
                          mb: 1,
                          transition: ".2s",
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: imp.usuario ? "#1B4F72" : "#000",
                              }}
                            >
                              {imp.usuario || "Sin usuario"}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1 }}>
                              {/* 👁 Ver detalles */}
                              <IconButton onClick={() => abrirModal(imp)}>
                                <VisibilityIcon />
                              </IconButton>

                              {/* 🗑 SOLO si tiene usuario */}
                              {imp.usuario && (
                                <IconButton
                                  onClick={() => liberarImpresora(imp.id_print)}
                                  color="error"
                                  title="Liberar impresora"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          <Typography>MAC: {imp.mac_print}</Typography>
                          <Typography>Modelo: {imp.hand}</Typography>

                          {/* 🔥 REALMENTE EN USO */}
                          {imp.usuario && enUsoReal && (
                            <Typography
                              sx={{
                                mt: 1,
                                fontSize: 13,
                                color: "#1B4F72",
                                fontWeight: 600,
                              }}
                            >
                              🔵 En uso
                            </Typography>
                          )}

                          {/* ⚪ ASIGNADO PERO NO ESTÁ TRABAJANDO */}
                          {imp.usuario && !enUsoReal && (
                            <Typography
                              sx={{
                                mt: 1,
                                fontSize: 13,
                                color: "#999",
                                fontWeight: 600,
                              }}
                            >
                              ⚪ Disponible
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ))
            )}
          </Box>

          {/* MODAL ASIGNAR */}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 450,
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                boxShadow: 5,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {selectedPrinter?.usuario || "Impresora sin asignar"}
              </Typography>

              <Typography>MAC: {selectedPrinter?.mac_print}</Typography>
              <Typography>Modelo: {selectedPrinter?.hand}</Typography>

              <Typography sx={{ mt: 2, mb: 1 }}>Asignar a:</Typography>

              <Select
                fullWidth
                disabled={selectedPrinter?.usuario !== null} // 👈 BLOQUEA CUANDO YA TIENE USUARIO
                defaultValue=""
                onChange={(e) =>
                  asignarImpresora(selectedPrinter.id_print, e.target.value)
                }
              >
                <MenuItem value="">
                  <em>— Selecciona empacador —</em>
                </MenuItem>

                {empacadores.map((emp) => (
                  <MenuItem key={emp.id_usu} value={emp.id_usu}>
                    {emp.name} ({emp.role})
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                {selectedPrinter?.mac_print && (
                  <Barcode value={selectedPrinter.mac_print} format="CODE128" />
                )}
              </Box>
            </Box>
          </Modal>
        </>
      )}
    </Box>
  );
}

export default Empaquetando;

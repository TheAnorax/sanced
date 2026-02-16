import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Barcode from "react-barcode";


import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  LinearProgress,
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
  Select, MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function Embarcando() {
  const [tab, setTab] = useState(0);

  const [pedidos, setPedidos] = useState([]);
  const [usuariosConRecuento, setUsuariosConRecuento] = useState([]);
  const [productividad, setProductividad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);

  const abrirModal = (imp) => {
    setSelectedPrinter(imp);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSelectedPrinter(null);
  };

  const [impresoras, setImpresoras] = useState([]);

  useEffect(() => {
    const fetchImpresoras = async () => {
      try {
        const resp = await fetch("http://66.232.105.87:3007/api/embarque/prints/embarcadores");
        const data = await resp.json();
        setImpresoras(data);
      } catch (err) {
        console.error("Error cargando impresoras:", err);
      }
    };

    fetchImpresoras();
  }, []);

  const [embarcadores, setEmbarcadores] = useState([]);

  useEffect(() => {
    const fetchEmbarcadores = async () => {
      try {
        const resp = await fetch("http://66.232.105.87:3007/api/embarque/embarcadores");
        const data = await resp.json();

        if (data.ok) {
          setEmbarcadores(data.embarcadores);
        }
      } catch (error) {
        console.error("Error cargando embarcadores:", error);
      }
    };

    fetchEmbarcadores();
  }, []);

  const asignarImpresora = async (id_print, id_usu) => {
    try {
      const res = await fetch("http://66.232.105.87:3007/api/embarque/impresora/asignar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_print, id_usu }),
      });

      const data = await res.json();

      if (!data.ok) {
        alert("No se pudo asignar 😓");
        return;
      }

      alert("Impresora actualizada correctamente ✔");
      cerrarModal();

      // 🔥 Recargar impresoras
      window.location.reload();

    } catch (e) {
      console.log("❌ Error asignando impresora:", e);
    }
  };


  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // ================================
  // FETCH PRINCIPAL
  // ================================
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(
          "http://66.232.105.87:3007/api/embarque/embarque/progreso"
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const { pedidos } = data;

        // Agrupación por usuario
        const usuariosMap = {};

        pedidos.forEach((pedido) => {
          const { usuario, cantidad_piezas } = pedido;
          const piezas = Number(cantidad_piezas);

          if (isNaN(piezas)) return;

          if (!usuariosMap[usuario]) {
            usuariosMap[usuario] = {
              usuario,
              cantidad_pedidos: 0,
              cantidad_piezas: 0,
            };
          }

          usuariosMap[usuario].cantidad_pedidos++;
          usuariosMap[usuario].cantidad_piezas += piezas;
        });

        setUsuariosConRecuento(Object.values(usuariosMap));

        // Sort: mayor progreso primero
        const sortedPedidos = pedidos.sort(
          (a, b) =>
            parseFloat(b.progreso_validacion) -
            parseFloat(a.progreso_validacion)
        );

        setPedidos(sortedPedidos);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (_, val) => {
    setTab(val);
  };

  const getColorByProgress = (progress) => {
    if (progress <= 25) return "#e74c3c";
    if (progress <= 50) return "#f39c12";
    if (progress <= 75) return "#f1c40f";
    return "#2ecc71";
  };

  const handleOpen = async () => {
    try {
      const res = await fetch(
        "http://66.232.105.87:3007/api/embarque/embarque/productividad"
      );
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();
      setProductividad(data);
      setOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClose = () => setOpen(false);

  // ==========================
  // RENDER
  // ==========================

  if (loading)
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 5 }}>
        Error al cargar datos: {error}
      </Alert>
    );

  // ========================================
  // UI FINAL
  // ========================================



  const printersValidas = [
    "NLS-PP310-EE8E",
    "NLS-PP310-D8CF",
    "NLS-PP310-EE97",
    "NLS-PP310-28D3",
    "NLS-PP310-6630"
  ];


  const normalize = (v) => (v || "").trim().toLowerCase();

  // ============ Filtrado + Normalización ============
  const impresorasFiltradas = impresoras
    .map(imp => ({
      ...imp,
      hand: imp.hand ? imp.hand.trim() : "",
      usuario: imp.usuario ? imp.usuario.trim() : null
    }))
    .filter(imp => printersValidas.includes(imp.hand));

  // ============ Agrupación UNA VEZ ============
  const impresorasAgrupadas = impresorasFiltradas.reduce((acc, imp) => {
    if (!acc[imp.hand]) acc[imp.hand] = [];
    acc[imp.hand].push(imp);
    return acc;
  }, {});

  // ============ Usuarios activos ============
  const usuariosActivos = new Set(
    usuariosConRecuento.map(u => normalize(u.usuario))
  );





  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Panel de Embarque 🚚
      </Typography>

      {/* ------------ TABS --------------- */}
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="En progreso" />
        <Tab label="Impresoras - Usuarios" />
      </Tabs>

      {/* ======================================
         TAB 0: TU CONTENIDO ORIGINAL COMPLETO
      ======================================= */}
      <TabPanel value={tab} index={0}>
        {/* --------- CARDS DE USUARIOS -------- */}
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
          {usuariosConRecuento.map((u, i) => (
            <Card key={i} sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">{u.usuario}</Typography>
                <Typography variant="body2">
                  Pedidos: {u.cantidad_pedidos}
                </Typography>
                <Typography variant="body2">
                  Piezas: {u.cantidad_piezas}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* ------------ PEDIDOS ------------- */}
        <Typography variant="h5" sx={{ mt: 4 }}>
          Pedidos en Progreso
        </Typography>

        {pedidos.map((pedido, i) => {
          const progreso = parseFloat(pedido.progreso_validacion) || 0;
          const color = getColorByProgress(progreso);

          return (
            <Card key={i} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  Pedido: {pedido.pedido}
                </Typography>

                <Typography>
                  Usuario: {pedido.usuario} — Partidas: {pedido.partidas} — Piezas:{" "}
                  {pedido.cantidad_piezas}
                </Typography>

                <Box sx={{ mt: 2 }}>
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

        {/* BOTÓN FLOTANTE */}
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 20, right: 20 }}
          onClick={handleOpen}
        >
          <AddIcon />
        </Fab>

        {/* MODAL PRODUCTIVIDAD */}
        <Modal open={open} onClose={handleClose}>
          <Fade in={open}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80vw",
                height: "80vh",
                bgcolor: "#fff",
                borderRadius: 3,
                p: 4,
                overflowY: "auto",
              }}
            >
              <Typography variant="h4" align="center" gutterBottom>
                🏆 Ranking Productividad
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell align="right">Partidas</TableCell>
                      <TableCell align="right">Piezas</TableCell>
                      <TableCell align="center">Tiempo</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {productividad.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{item.usuario}</TableCell>
                        <TableCell align="right">{item.partidas}</TableCell>
                        <TableCell align="right">
                          {item.cantidad_piezas}
                        </TableCell>
                        <TableCell align="center">
                          {item.tiempo_total_trabajo}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Fade>
        </Modal>


      </TabPanel>

      {/* ==========================================================
        TAB 1 — Impresoras agrupadas por rol
          ========================================================== */}
      <TabPanel value={tab} index={1}>
        <Typography variant="h4" gutterBottom>
          🖨️ Impresoras asignadas a embarcadores
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            pb: 2,
          }}
        >

          {Object.entries(impresorasAgrupadas).map(([hand, lista]) => {

            const columnaOcupada = lista.some(imp => usuariosActivos.has(normalize(imp.usuario)));

            return (
              <Box
                key={hand}
                sx={{
                  minWidth: 280,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  bgcolor: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.3,
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {hand}
                </Typography>

                {lista.map((imp) => {
                  const activo = usuariosActivos.has(normalize(imp.usuario));

                  return (
                    <Card
                      key={imp.id_print}
                      sx={{
                        border: activo ? "2px solid #2ecc71" : "1px solid #ddd",
                        backgroundColor: activo ? "#E8F8EC" : "#fff",
                        position: "relative",
                        transition: ".25s",
                      }}
                    >
                      <CardContent>
                        {/* HEADER */}
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: activo ? "#1e8449" : "#000",
                            }}
                          >
                            {imp.usuario}
                          </Typography>

                          <IconButton
                            onClick={() => abrirModal(imp)}
                            disabled={columnaOcupada}  // 🔥 toda columna bloqueada
                            sx={{
                              color: columnaOcupada ? "#aaa" : "#1976d2", // gris si bloqueada
                              "&:hover": {
                                color: columnaOcupada ? "#aaa" : "#0d47a1",
                              },
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Box>

                        <Typography variant="body2">Mac: {imp.mac_print}</Typography>
                        <Typography variant="body2">Printer: {imp.hand}</Typography>

                        {activo && (
                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 12,
                              color: "#1e8449",
                              fontWeight: "bold",
                            }}
                          >
                            🟢 En uso
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            );
          })}


        </Box>
      </TabPanel>

      <Modal open={modalOpen} onClose={cerrarModal}>
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
          {/* =========================
       TÍTULO USUARIO ACTUAL
    ========================= */}
          <Typography variant="h6" fontWeight={700}>
            {selectedPrinter?.usuario || "Impresora"}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <b>MAC:</b> {selectedPrinter?.mac_print}
          </Typography>

          <Typography sx={{ mb: 2 }}>
            <b>Modelo:</b> {selectedPrinter?.hand}
          </Typography>

          {/* =========================
        SELECT PARA ASIGNAR
     ========================= */}
          <Typography sx={{ mt: 2, mb: 1 }} fontWeight={600}>
            Asignar a:
          </Typography>

          <Select
            fullWidth
            size="small"
            defaultValue=""
            onChange={(e) =>
              asignarImpresora(selectedPrinter?.id_print, e.target.value)
            }
            sx={{ textAlign: "left" }}
          >
            <MenuItem value="">
              <em>— Selecciona embarcador —</em>
            </MenuItem>

            {embarcadores.map((emp) => (
              <MenuItem key={emp.id_usu} value={emp.id_usu}>
                {emp.name} ({emp.role})
              </MenuItem>
            ))}
          </Select>

          {/* =========================
       CÓDIGO DE BARRAS
    ========================= */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Barcode
              value={selectedPrinter?.mac_print}
              format="CODE128"
              width={2.2}
              height={95}
              displayValue={true}
              fontSize={15}
              background="#fff"
            />
          </Box>
        </Box>
      </Modal>






    </Box>
  );
}

export default Embarcando;

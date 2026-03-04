import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Grid,
  Divider,
  Card,
  CardContent,
  TextField,
  CardHeader,
  Chip,
  Stack,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { QRCodeCanvas } from "qrcode.react";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";

import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CloseIcon from "@mui/icons-material/Close";

/** =========================
 *  CONFIG
 *  ========================= */
const API_BASE = "http://66.232.105.87:3007/api";

// Etiquetas de “área” (reporte por área). Ajusta a tu gusto.
const AREA_GROUPS = [
  {    key: "WEB",    title: "Accesos Web (Turno 4)",    matcher: (u) => u?.turno === 4,  },
  {    key: "ADMIN",    title: "Administradores",    matcher: (u) => includesAnyRole(u.role, ["Admin", "Master"]),  },
  {    key: "CONTROL",    title: "Mesa de Control",    matcher: (u) => includesAnyRole(u.role, ["Admin", "Control"]),  },
  {    key: "EMBAR",    title: "Embarques",    matcher: (u) => includesAnyRole(u.role, ["Admin", "Embar", "EB"]),  },
  {    key: "PAQUET",    title: "Paquetería",    matcher: (u) => includesAnyRole(u.role, ["Admin", "Paquet", "PQ"]),  },
  {    key: "MONTA",    title: "Montacargas",    matcher: (u) => includesAnyRole(u.role, ["Admin", "MONTA"]),  },
  {    key: "INV",    title: "Inventario",    matcher: (u) => includesAnyRole(u.role, ["Admin", "INV"]),  },
  {    key: "DEV",    title: "Desarrollo",    matcher: (u) => includesAnyRole(u.role, ["Admin", "Dep"]),  },
];

function includesAnyRole(roleString = "", tokens = []) {
  const r = String(roleString || "");
  return tokens.some((t) => r.includes(t));
}

/** =========================
 *  HELPERS
 *  ========================= */
function flattenUsuariosPorTurno(data) {
  // data: [{turno: number, usuarios: []}, ...]
  const flat = [];
  for (const grupo of data || []) {
    for (const u of grupo.usuarios || []) {
      flat.push({ ...u, turno: grupo.turno }); // 👈 guardo turno dentro del usuario
    }
  }
  return flat;
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {});
}

/** =========================
 *  SMALL UI COMPONENTS
 *  ========================= */
function SectionHeader({ title, count }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Typography variant="h5">{title}</Typography>
      <Chip label={`${count} usuarios`} />
    </Box>
  );
}

function UserTable({
  rows,
  showRole = true,
  showUnidad = true,
  actionsLeft,
  actionsRight,
}) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        maxHeight: "auto",
        overflow: "auto",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Table
        size="small"
        stickyHeader
        sx={{
          minWidth: 650,
          "& .MuiTableCell-head": {
            backgroundColor: "#f4f6f8",
            fontWeight: "bold",
            fontSize: 13,
          },
          "& .MuiTableCell-body": {
            fontSize: 12,
            py: 0.8,
          },
          "& .MuiTableRow-root:hover": {
            backgroundColor: "#f9fbff",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell width={70}>ID</TableCell>
            <TableCell>Nombre</TableCell>
            {showRole && <TableCell width={140}>Rol</TableCell>}
            {showUnidad && <TableCell width={120}>Unidad</TableCell>}
            {actionsLeft && <TableCell width={120}>Acciones</TableCell>}
            {actionsRight && <TableCell width={140}>Admin</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id_usu}>
              <TableCell>{u.id_usu}</TableCell>
              <TableCell>
                <Typography fontWeight={500}>
                  {u.name}
                </Typography>
              </TableCell>

              {showRole && (
                <TableCell>
                  <Chip
                    label={u.role}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
              )}

              {showUnidad && <TableCell>{u.unidad}</TableCell>}

              {actionsLeft && <TableCell>{actionsLeft(u)}</TableCell>}
              {actionsRight && <TableCell>{actionsRight(u)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
const generarPDFPorUsuarios = async (usuarios, titulo = "Credenciales") => {
  if (!usuarios || usuarios.length === 0) {
    alert("No hay usuarios para generar el PDF");
    return;
  }

  const QRCode = await import("qrcode");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "A4",
  });

  // Medidas credencial
  const credW = 54;
  const credH = 86;

  // Márgenes
  const marginX = 10;
  const marginY = 10;

  // Espaciado
  const gapX = 4;
  const gapY = 4;

  const pageWidth = 210;
  const pageHeight = 297;

  const cols = 3;
  const rows = 3;

  let index = 0;

  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];

    const col = index % cols;
    const row = Math.floor(index / cols) % rows;

    const x = marginX + col * (credW + gapX);
    const y = marginY + row * (credH + gapY);

    // Nueva página cada 9 credenciales
    if (index > 0 && index % (cols * rows) === 0) {
      doc.addPage();
    }

    // QR
    const qrEmail = await QRCode.toDataURL(usuario.email || "");
    const qrPass = await QRCode.toDataURL(usuario.password || "");

    // Marco
    doc.rect(x, y, credW, credH);

    // Nombre
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text((usuario.name || "").toUpperCase(), x + credW / 2, y + 6, {
      align: "center",
    });

    // Rol
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(usuario.role || "", x + credW / 2, y + 11, {
      align: "center",
    });

    // QR Usuario
    doc.text("Usuario", x + credW / 2, y + 16, { align: "center" });
    doc.addImage(qrEmail, "PNG", x + 12, y + 18, 30, 30);

    // QR Password
    doc.text("Contraseña", x + credW / 2, y + 52, { align: "center" });
    doc.addImage(qrPass, "PNG", x + 12, y + 54, 30, 30);

    index++;
  }

  doc.save(`${titulo}.pdf`);
};

function UserBarcodesModal({ open, onClose, user }) {
  const qrUsuario = user?.email || "";
  const qrPassword = user?.password || "";
  const printRef = React.useRef(null);

  const imprimirCredencialPDF = async () => {
    if (!user) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [54, 86], // tamaño credencial real
    });

    // Generar QR como imagen
    const canvasEmail = document.createElement("canvas");
    const canvasPass = document.createElement("canvas");

    const QRCode = await import("qrcode");

    const qrEmail = await QRCode.toDataURL(user.email || "");
    const qrPass = await QRCode.toDataURL(user.password || "");

    // ===== Diseño =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(user.name || "", 27, 8, { align: "center" });

    doc.setFontSize(8);
    doc.text(user.role || "", 27, 13, { align: "center" });

    // QR Usuario
    doc.text("Usuario", 27, 18, { align: "center" });
    doc.addImage(qrEmail, "PNG", 12, 20, 30, 30);

    // QR Password
    doc.text("Contraseña", 27, 54, { align: "center" });
    doc.addImage(qrPass, "PNG", 12, 56, 30, 30);

    doc.save(`Credencial_${user.name}.pdf`);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 760,
          maxWidth: "95vw",
          bgcolor: "#f5f6f8",
          boxShadow: 24,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {user && (
          <>
            {/* ===== Línea superior branding ===== */}
            <Box sx={{ height: 6, bgcolor: "primary.main" }} />

            {/* ===== Encabezado ===== */}
            <Box sx={{ p: 3, bgcolor: "#ffffff" }}>
              <Typography variant="h5" fontWeight="bold">
                🔐 Credenciales de Acceso
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Escanee los códigos para iniciar sesión en el sistema
              </Typography>
            </Box>

            <Divider />

            {/* ===== Ficha de usuario ===== */}
            <Box sx={{ p: 3, bgcolor: "#ffffff" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Chip
                    icon={<PersonIcon />}
                    label={`Usuario: ${user.name}`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Chip
                    icon={<BadgeIcon />}
                    label={`Rol: ${user.role}`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Grid>

                {user.unidad && (
                  <Grid item xs={12} md={6}>
                    <Chip
                      icon={<BusinessIcon />}
                      label={`Unidad: ${user.unidad}`}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Chip
                    icon={<EmailIcon />}
                    label={user.email}
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* ===== Contenido QR ===== */}
            <Box sx={{ p: 4 }}>
              <Grid container spacing={4} justifyContent="center">
                {/* QR Usuario */}
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      textAlign: "center",
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                    }}
                  >
                    <CardHeader
                      avatar={<QrCodeIcon color="primary" />}
                      title="Identificación de Usuario"
                      subheader="Escanear para identificar cuenta"
                      sx={{ bgcolor: "grey.100" }}
                    />
                    <CardContent>
                      <QRCodeCanvas
                        value={qrUsuario}
                        size={190}
                        level="H"
                        includeMargin
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* QR Password */}
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      textAlign: "center",
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                    }}
                  >
                    <CardHeader
                      avatar={<QrCodeIcon color="secondary" />}
                      title="Acceso al Sistema"
                      subheader="Escanear para iniciar sesión"
                      sx={{ bgcolor: "grey.100" }}
                    />
                    <CardContent>
                      <QRCodeCanvas
                        value={qrPassword}
                        size={190}
                        level="H"
                        includeMargin
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Botones */}
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Button variant="outlined" onClick={imprimirCredencialPDF}>
                  Descargar Credencial
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={onClose}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>
          </>
        )}

        {/* ===== CONTENIDO OCULTO PARA IMPRESIÓN ===== */}
        <Box sx={{ display: "none" }}>
          <div ref={printRef}>
            <div className="credencial">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                  {user?.name}
                </div>

                <div style={{ fontSize: "9px", marginBottom: "4mm" }}>
                  {user?.role}
                </div>

                <QRCodeCanvas value={qrUsuario} size={140} level="H" />

                <div style={{ fontSize: "8px", marginBottom: "3mm" }}>
                  Usuario
                </div>

                <QRCodeCanvas value={qrPassword} size={140} level="H" />

                <div style={{ fontSize: "8px" }}>Contraseña</div>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </Modal>
  );
}

function EditUserModal({ open, onClose, isEditMode, form, setForm, onSave }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 520,
          maxWidth: "95vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {isEditMode ? "Editar Usuario" : "Crear Usuario"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <TextField
          label="Nombre"
          fullWidth
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Correo"
          fullWidth
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          sx={{ mb: 2 }}
          disabled={isEditMode}
          helperText={
            isEditMode
              ? "Para cambiar contraseña, hazlo por flujo dedicado (si existe)."
              : ""
          }
        />
        <TextField
          label="Unidad"
          fullWidth
          value={form.unidad}
          onChange={(e) => setForm({ ...form, unidad: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Rol"
          fullWidth
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Box sx={{ textAlign: "right" }}>
          <Button variant="contained" color="primary" onClick={onSave}>
            Guardar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClose}
            sx={{ ml: 2 }}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

/** =========================
 *  MAIN COMPONENT
 *  ========================= */
function Usuarios() {
  const { user } = useContext(UserContext);

  // DATA base
  const [rawByTurno, setRawByTurno] = useState([]);
  const [, setSecciones] = useState([]);

  // UI selection
  const [selectedUser, setSelectedUser] = useState(null);

  const [openBarcodes, setOpenBarcodes] = useState(false);

  const [openUserModal, setOpenUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    password: "",
    unidad: "",
    role: "",
  });

  /** ========= FETCH ========= */
  const fetchUsuarios = useCallback(async () => {
    const res = await axios.get(`${API_BASE}/usuarios/usuarios`);
    setRawByTurno(res.data || []);
  }, []);

  const fetchSecciones = useCallback(async () => {
    const res = await axios.get(`${API_BASE}/usuarios/secciones`);
    setSecciones(res.data || []);
  }, []);

  useEffect(() => {
    fetchUsuarios().catch((e) => console.error("fetchUsuarios", e));
    fetchSecciones().catch((e) => console.error("fetchSecciones", e));
  }, [fetchUsuarios, fetchSecciones]);

  /** ========= DERIVED DATA ========= */
  const flatUsers = useMemo(
    () => flattenUsuariosPorTurno(rawByTurno),
    [rawByTurno],
  );

  // Turno 4 para “Accesos Web”
  const turno4 = useMemo(
    () => flatUsers.filter((u) => u.turno === 4),
    [flatUsers],
  );

  // Turnos “operativos” (sin turno 4)
  const flatWithoutTurno4 = useMemo(
    () => flatUsers.filter((u) => u.turno !== 4),
    [flatUsers],
  );

  // =========================
  // FILTROS POR ÁREA
  // =========================

  // Paquetería: Paquet o PQ + número
  const usuariosPaqueteria = useMemo(() => {
    return flatUsers.filter((u) => {
      const role = String(u.role || "").toUpperCase();
      return role.includes("PAQUET") || /^PQ\d+/.test(role);
    });
  }, [flatUsers]);

  // Embarques: Embar o EB + número
  const usuariosEmbarques = useMemo(() => {
    return flatUsers.filter((u) => {
      const role = String(u.role || "").toUpperCase();
      return role.includes("EMBAR") || /^EB\d+/.test(role);
    });
  }, [flatUsers]);

  const usuariosMontacargas = useMemo(() => {
    return flatUsers.filter((u) => {
      const role = String(u.role || "").toUpperCase();
      return role.includes("MONTACARGAS") || /^MONTA\d+/.test(role);
    });
  }, [flatUsers]);

  // Filtrado por rol del usuario logueado (igual que tu lógica, pero limpio)
  const visibleOperationalByTurn = useMemo(() => {
    const grouped = groupBy(flatWithoutTurno4, (u) => u.turno);

    // 🔹 ADMIN o MASTER → ver TODO
    if (user?.role === "Admin" || user?.role === "Master") {
      return Object.keys(grouped)
        .map((k) => ({ turno: Number(k), usuarios: grouped[k] }))
        .sort((a, b) => a.turno - b.turno);
    }

    // 🔹 CONTROL → solo Pasillo / AV
    if (user?.role === "Control") {
      Object.keys(grouped).forEach((k) => {
        grouped[k] = grouped[k].filter((u) =>
          includesAnyRole(u.role, ["Pasillo", "AV"]),
        );
      });
    }

    // 🔹 EMBAR → solo EB
    if (user?.role === "Embar") {
      Object.keys(grouped).forEach((k) => {
        grouped[k] = grouped[k].filter((u) => includesAnyRole(u.role, ["EB"]));
      });
    }

    return Object.keys(grouped)
      .map((k) => ({ turno: Number(k), usuarios: grouped[k] }))
      .sort((a, b) => a.turno - b.turno);
  }, [flatWithoutTurno4, user?.role]);
  // Reporte por área (conteos)
  const areaReport = useMemo(() => {
    return AREA_GROUPS.map((g) => {
      const usersForArea = flatUsers.filter((u) => g.matcher(u));
      return {
        key: g.key,
        title: g.title,
        count: usersForArea.length,
      };
    });
  }, [flatUsers]);

  /** ========= ACTIONS ========= */
  const openCreateUser = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setUserForm({ email: "", name: "", password: "", unidad: "", role: "" });
    setOpenUserModal(true);
  };

  const openEditUser = (u) => {
    setIsEditMode(true);
    setSelectedUser(u);
    setUserForm({
      email: u.email || "",
      name: u.name || "",
      password: "",
      unidad: u.unidad || "",
      role: u.role || "",
    });
    setOpenUserModal(true);
  };

  const saveUser = async () => {
    try {
      if (isEditMode && selectedUser?.id_usu) {
        await axios.put(
          `${API_BASE}/usuarios/usuarios/${selectedUser.id_usu}`,
          userForm,
        );
        alert("Usuario actualizado correctamente");
      } else {
        await axios.post(`${API_BASE}/usuarios/usuarios`, userForm);
        alert("Usuario creado correctamente");
      }
      setOpenUserModal(false);
      await fetchUsuarios();
    } catch (e) {
      console.error("saveUser", e);
      alert("Error al guardar el usuario");
    }
  };

  const deleteUser = async (id_usu) => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?",
    );
    if (!confirm) return;

    try {
      await axios.delete(`${API_BASE}/usuarios/usuarios/${id_usu}`);
      alert("Usuario eliminado correctamente");
      await fetchUsuarios();
    } catch (e) {
      console.error("deleteUser", e);
      alert("Error al eliminar el usuario");
    }
  };

  const openBarcodeModal = (u) => {
    setSelectedUser(u);
    setOpenBarcodes(true);
  };

  // PDF credenciales
  const generarPDF = async () => {
    try {
      const res = await axios.get(`${API_BASE}/usuarios/usuarios`);
      const usuariosPorTurno = res.data || [];
      if (!usuariosPorTurno.length) {
        alert("No hay usuarios para generar el PDF");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "A4",
      });

      let xPos = 10;
      let yPos = 30;
      let credencialesPorHoja = 0;

      for (const grupo of usuariosPorTurno) {
        const turnoActual = grupo.turno;

        doc.addPage();
        doc.setFontSize(14);
        doc.text(`Surtido Turno ${turnoActual}`, 105, 15, { align: "center" });

        for (const usuario of grupo.usuarios || []) {
          const usuarioQR = await QRCodeCanvas.toDataURL(usuario.email || "");
          const passwordQR = await QRCodeCanvas.toDataURL(
            usuario.password || "",
          );

          doc.setLineWidth(0.5);
          doc.rect(xPos, yPos, 100, 60);

          doc.setFontSize(11);
          doc.text(
            String(usuario.name || "").toUpperCase(),
            xPos + 50,
            yPos + 10,
            { align: "center" },
          );
          doc.setFontSize(9);
          doc.text(`(${usuario.role || ""})`, xPos + 50, yPos + 16, {
            align: "center",
          });

          doc.setFontSize(9);
          doc.text("USUARIO", xPos + 25, yPos + 28, { align: "center" });
          doc.text("CONTRASEÑA", xPos + 75, yPos + 28, { align: "center" });

          doc.addImage(usuarioQR, "PNG", xPos + 10, yPos + 30, 25, 25);
          doc.addImage(passwordQR, "PNG", xPos + 65, yPos + 30, 25, 25);

          credencialesPorHoja++;
          if (credencialesPorHoja % 2 === 0) {
            xPos = 10;
            yPos += 70;
          } else {
            xPos = 110;
          }

          if (credencialesPorHoja % 4 === 0) {
            doc.addPage();
            xPos = 10;
            yPos = 30;
            doc.setFontSize(14);
            doc.text(`Surtido Turno ${turnoActual}`, 105, 15, {
              align: "center",
            });
          }
        }
      }

      doc.save("Credenciales_Surtidos.pdf");
    } catch (e) {
      console.error("generarPDF", e);
      alert("Error al generar el PDF");
    }
  };

  /** ========= RENDER ========= */
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4">Usuarios</Typography>
          <Typography variant="body2" color="text.secondary">
            Logueado: {user?.name} ({user?.role})
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {( user?.role === "Admin") && (
            <Button variant="contained" onClick={openCreateUser}>
              Crear Usuario
            </Button>
          )}
        </Stack>
      </Box>

      {/* ===== Reporte por Área ===== */}
      {(user?.role === "Admin" || user?.role === "Master") &&
        turno4.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Reporte por área
            </Typography>
            <Grid container spacing={2}>
              {areaReport.map((a) => (
                <Grid item xs={12} sm={6} md={3} key={a.key}>
                  <Card variant="outlined">
                    <CardHeader title={a.title} />
                    <CardContent>
                      <Typography variant="h4">{a.count}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        usuarios
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      {/* ===== Accesos Web (Turno 4) ===== */}
      {(user?.role === "Admin" || user?.role === "Master") &&
        turno4.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <SectionHeader title="Accesos Web" count={turno4.length} />
            <UserTable
              rows={turno4}
              actionsLeft={(u) => (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openBarcodeModal(u)}
                  >
                    Accesos
                  </Button>
                </Stack>
              )}
              actionsRight={(u) => (
                <Stack direction="row" spacing={1}>
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openEditUser(u)}
                    >
                      Editar
                    </Button>
                  )}
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => deleteUser(u.id_usu)}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              )}
            />
          </Box>
        )}

      {/* ===== Usuarios Operativos por Turno ===== */}
      {(user?.role === "Control" || user?.role === "Admin" || user?.role === "Master" ) &&
        visibleOperationalByTurn.map((g) => (
          <Box key={g.turno} sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Surtido Turno {g.turno}</Typography>

              <Stack direction="row" spacing={1}>
                <Chip label={`${g.usuarios.length} usuarios`} />

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    generarPDFPorUsuarios(
                      g.usuarios,
                      `Credenciales_Turno_${g.turno}`,
                    )
                  }
                >
                  Descargar Credenciales
                </Button>
              </Stack>
            </Box>
            <UserTable
              rows={g.usuarios}
              actionsLeft={(u) => (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openBarcodeModal(u)}
                  >
                    Accesos
                  </Button>
                </Stack>
              )}
              actionsRight={(u) => (
                <Stack direction="row" spacing={1}>
                  {(user?.role === "Master" ||
                    user?.role === "Admin" ||
                    user?.role === "Control") && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openEditUser(u)}
                    >
                      Editar
                    </Button>
                  )}
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => deleteUser(u.id_usu)}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              )}
            />
          </Box>
        ))}

      {/* ===== Usuarios Paquetería ===== */}

      {(user?.role === "Admin" ||
        user?.role === "Master" ||
        user?.role === "Paquet") &&
        usuariosPaqueteria.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h5">Usuarios de Paquetería</Typography>

              <Stack direction="row" spacing={1}>
                <Chip label={`${usuariosPaqueteria.length} usuarios`} />

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    generarPDFPorUsuarios(
                      usuariosPaqueteria,
                      "Credenciales_Paqueteria",
                    )
                  }
                >
                  Descargar Credenciales
                </Button>
              </Stack>
            </Box>

            <UserTable
              rows={usuariosPaqueteria}
              actionsLeft={(u) => (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openBarcodeModal(u)}
                  >
                    Accesos
                  </Button>
                </Stack>
              )}
              actionsRight={(u) => (
                <Stack direction="row" spacing={1}>
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openEditUser(u)}
                    >
                      Editar
                    </Button>
                  )}
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => deleteUser(u.id_usu)}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              )}
            />
          </Box>
        )}

      {/* ===== Usuarios Embarques ===== */}
      {(user?.role === "Admin" ||
        user?.role === "Master" ||
        user?.role === "Embar") &&
        usuariosEmbarques.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Usuarios de Embarques</Typography>

              <Stack direction="row" spacing={1}>
                <Chip label={`${usuariosEmbarques.length} usuarios`} />

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    generarPDFPorUsuarios(
                      usuariosEmbarques,
                      "Credenciales_Embarques",
                    )
                  }
                >
                  Descargar Credenciales
                </Button>
              </Stack>
            </Box>

            <UserTable
              rows={usuariosEmbarques}
              actionsLeft={(u) => (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openBarcodeModal(u)}
                  >
                    Accesos
                  </Button>
                </Stack>
              )}
              actionsRight={(u) => (
                <Stack direction="row" spacing={1}>
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openEditUser(u)}
                    >
                      Editar
                    </Button>
                  )}
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => deleteUser(u.id_usu)}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              )}
            />
          </Box>
        )}

      {/* ===== Usuarios Montacargas ===== */}
      {(user?.role === "Admin" ||
        user?.role === "Master" ||
        user?.role === "MONT") &&
        usuariosMontacargas.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Usuarios de Montacargas</Typography>

              <Stack direction="row" spacing={1}>
                <Chip label={`${usuariosMontacargas.length} usuarios`} />

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    generarPDFPorUsuarios(
                      usuariosMontacargas,
                      "Credenciales_Montacargas",
                    )
                  }
                >
                  Descargar Credenciales
                </Button>
              </Stack>
            </Box>

            <UserTable
              rows={usuariosMontacargas}
              actionsLeft={(u) => (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openBarcodeModal(u)}
                  >
                    Accesos
                  </Button>
                </Stack>
              )}
              actionsRight={(u) => (
                <Stack direction="row" spacing={1}>
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openEditUser(u)}
                    >
                      Editar
                    </Button>
                  )}
                  {user?.role === "Admin" && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => deleteUser(u.id_usu)}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              )}
            />
          </Box>
        )}

      {/* ===== Modales ===== */}
      <UserBarcodesModal
        open={openBarcodes}
        onClose={() => {
          setOpenBarcodes(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <EditUserModal
        open={openUserModal}
        onClose={() => {
          setOpenUserModal(false);
          setSelectedUser(null);
        }}
        isEditMode={isEditMode}
        form={userForm}
        setForm={setUserForm}
        onSave={saveUser}
      />
    </Box>
  );
}

export default Usuarios;

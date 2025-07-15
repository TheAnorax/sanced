  import React, { useState, useEffect, useContext } from "react";
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
    Checkbox,
    FormControlLabel,
    Divider,
    Card,
    CardContent,
    TextField,
    List,
    ListItem,
    ListItemText,
    CardHeader,
  } from "@mui/material";
  import Barcode from "react-barcode";
  import { UserContext } from "../context/UserContext";
  import CheckCircleIcon from "@mui/icons-material/CheckCircle";
  import LockIcon from "@mui/icons-material/Lock";
  import HighlightOffIcon from "@mui/icons-material/HighlightOff";
  import { jsPDF } from "jspdf";
  import "jspdf-autotable";
  import QRCode from "qrcode";

  const roleAccessMap = {
    Master: [
      "Dashboard",
      "Usuarios",
      "Productos",
      "Surtiendo",
      "Pedidos",
      "Finalizados",
      "Bahias",
      "Ubicaciones",
      "Compras",
      "Producto a Recibir",
      "Calidad",
      "Inventarios",
      "Insumos",
      "Historial de Mov",
      "Tareas",
      "PQ",
    ],
    Control: [
      "Dashboard",
      "Usuarios",
      "Productos",
      "Pedidos Pendientes",
      "Surtiendo",
      "Pedidos",
      "Finalizados",
      "Plan",
      "Bahias",
      "Inventarios",
    ],
    Admin: [
      "Dashboard",
      "Usuarios",
      "Productos",
      "Pedidos Pendientes",
      "Surtiendo",
      "Pedidos",
      "Finalizados",
      "Paqueteria",
      "Empacando",
      "Embarques",
      "Embarcando",
      "Plan",
      "Bahias",
      "Ubicaciones",
      "Compras",
      "Producto a Recibir",
      "Calidad",
      "Inventarios",
      "Reporte Recibo",
      "Insumos",
      "Muestras",
      "Historial de Mov",
      "Tareas",
      "RH",
      "PQ",
      "Visitas",
    ],
    Paquet: [
      "Dashboard",
      "Productos",
      "Finalizados",
      "Paqueteria",
      "Empacando",
      "Bahias",
      "Insumos",
    ],
    Embar: [
      "Usuarios",
      "Productos",
      "Finalizados",
      "Embarques",
      "Embarcando",
      "Bahias",
    ],
    Rep: ["Productos", "Finalizados"],
    INV: [
      "Productos",
      "Producto a Recibir",
      "Calidad",
      "Inventarios",
      "Reporte Recibo",
      "Insumos",
      "Historial de Mov",
    ],
    Imp: ["Productos", "Compras", "Reporte Recibo"],
    Audi: ["Productos", "Finalizados", "Inventarios"],
    Plan: ["Productos", "Compras", "Plan"],
    VENT: ["Productos", "Pedidos"],
    CON: ["Productos"],
    Nac: ["Compras", "Reporte Recibo"],
    Nac2: ["Compras", "Reporte Recibo"],
    Ins: ["Compras", "Insumos"],
    Recibo: ["Compras", "Producto a Recibir", "Reporte Recibo", "Insumos"],
    MONTA6: ["Inventarios"],
    ECOMERCE: ["Inventarios"],
    Reporte: ["Reporte Recibo"],
    Dep: ["Insumos"],
    P: ["Insumos"],
    RH: ["RH"],
  };

  function Usuarios() {
    const [usuariosPorTurno, setUsuariosPorTurno] = useState([]);
    const [turno4Usuarios, setTurno4Usuarios] = useState([]); // Almacena usuarios del Turno 4
    const [usuariosEmbarques, setUsuariosEmbarques] = useState([]); // Usuarios de Embarques
    const [usuariosPaqueteria, setUsuariosPaqueteria] = useState([]);
    const [usuariosMonta, setUsuariosMonta] = useState([]); // Usuarios con rol MONTA
    const [usuariosAdmin, setUsuariosAdmin] = useState([]); // Usuarios con rol Admin
    const [usuariosControl, setUsuariosControl] = useState([]); // Usuarios con rol Control
    const [usuariosMaster, setUsuariosMaster] = useState([]); // Usuarios con rol Master
    const [usuariosPaquet, setUsuariosPaquet] = useState([]); // Usuarios con rol Paquet
    const [usuariosEmbar, setUsuariosEmbar] = useState([]); // Usuarios con rol Embar
    const [usuariosRep, setUsuariosRep] = useState([]); // Usuarios con rol Rep
    const [usuariosEti, setUsuariosEti] = useState([]); // Usuarios con rol Eti
    const [usuariosNac, setUsuariosNac] = useState([]); // Usuarios con rol Nac
    const [usuariosImp, setUsuariosImp] = useState([]); // Usuarios con rol Imp
    const [usuariosPlan, setUsuariosPlan] = useState([]); // Usuarios con rol Plan
    const [usuariosRecibo, setUsuariosRecibo] = useState([]); // Usuarios con rol Recibo
    const [usuariosCali, setUsuariosCali] = useState([]); // Usuarios con rol Cali
    const [usuariosInv, setUsuariosInv] = useState([]); // Usuarios con rol Inv
    const [usuariosAudi, setUsuariosAudi] = useState([]); // Usuarios con rol Audi
    const [usuariosVent, setUsuariosVent] = useState([]); // Usuarios con rol Vent
    const [usuariosEcom, setUsuariosEcom] = useState([]); // Usuarios con rol Ecom
    const [usuariosCon, setUsuariosCon] = useState([]); // Usuarios con rol Con
    const [usuariosIns, setUsuariosIns] = useState([]); // Usuarios con rol Ins
    const [usuariosPoli, setUsuariosPoli] = useState([]); // Usuarios con rol Poli
    const [usuariosRH, setUsuariosRH] = useState([]); // Usuarios con rol RH
    const [usuariosTrans, setUsuariosTrans] = useState([]); // Usuarios con rol Trans
    const [usuariosUser, setUsuariosUser] = useState([]); // Usuarios con rol User
    const [usuariosDep, setUsuariosDep] = useState([]); // Usuarios con rol Dep
    const [selectedUser, setSelectedUser] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openModalUser, setOpenModalUser] = useState(false);
    const [openAccessModal, setOpenAccessModal] = useState(false);
    const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]);
    const [accesos, setAccesos] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const { user } = useContext(UserContext); // Usuario logueado
    const [isEditMode, setIsEditMode] = useState(false); // Controla si el modal es para editar o crear
    const [editModePermissions, setEditModePermissions] = useState(false); // Nuevo estado para activar/desactivar edición de permisos
    const [editablePermissions, setEditablePermissions] = useState([]); // Estado para manejar permisos editables
    const [inactivePermissions, setInactivePermissions] = useState([]); // Permisos inactivos

    const [userForm, setUserForm] = useState({
      email: "",
      name: "",
      password: "",
      unidad: "",
      role: "",
    });

    useEffect(() => {
      const fetchUsuarios = async () => {
        try {
          const response = await axios.get(
            "http://66.232.105.87:3007/api/usuarios/usuarios"
          );
          let usuariosFiltrados = response.data;

          // Filtrar usuarios con el rol MONTA
          const usuariosMontaFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("MONTA"))
          );
          setUsuariosMonta(usuariosMontaFiltrados);

          // Filtrar usuarios con el rol Admin
          const setUsuariosAdminFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Admin"))
          );
          setUsuariosAdmin(setUsuariosAdminFiltrados);

          // Filtrar usuarios con el rol Control
          const setUsuariosControlFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Control"))
          );
          setUsuariosControl(setUsuariosControlFiltrados);

          // Filtrar usuarios con el rol Master
          const setUsuariosMasterFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Master"))
          );
          setUsuariosMaster(setUsuariosMasterFiltrados);

          // Filtrar usuarios con el rol Paquet
          const setUsuariosPaquetFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter(
              (usuario) =>
                usuario.role.includes("Paquet") || usuario.role.includes("PQ")
            )
          );
          ;
          setUsuariosPaquet(setUsuariosPaquetFiltrados);

          // Filtrar usuarios con el rol Embar
          const setUsuariosEmbarFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Embar"))
          );
          setUsuariosEmbar(setUsuariosEmbarFiltrados);

          // Filtrar usuarios con el rol Reb
          const setUsuariosRepFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Rep"))
          );
          setUsuariosRep(setUsuariosRepFiltrados);

          // Filtrar usuarios con el rol Eti
          const usuariosEtiFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Eti"))
          );
          setUsuariosEti(usuariosEtiFiltrados);

          // Filtrar usuarios con el rol Nac
          const setUsuariosNacFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Nac"))
          );
          setUsuariosNac(setUsuariosNacFiltrados);

          // Filtrar usuarios con el rol Imp
          const setUsuariosImpFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Imp"))
          );
          setUsuariosImp(setUsuariosImpFiltrados);

          // Filtrar usuarios con el rol Plan
          const setUsuariosPlanFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Plan"))
          );
          setUsuariosPlan(setUsuariosPlanFiltrados);

          // Filtrar usuarios con el rol Recibo
          const setUsuariosReciboFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Recibo"))
          );
          setUsuariosRecibo(setUsuariosReciboFiltrados);

          // Filtrar usuarios con el rol Cali
          const setUsuariosCaliFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("CALI"))
          );
          setUsuariosCali(setUsuariosCaliFiltrados);

          // Filtrar usuarios con el rol Inv
          const setUsuariosInvFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("INV"))
          );
          setUsuariosInv(setUsuariosInvFiltrados);

          // Filtrar usuarios con el rol Audi
          const setUsuariosAudiFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Audi"))
          );
          setUsuariosAudi(setUsuariosAudiFiltrados);

          // Filtrar usuarios con el rol Vent
          const setUsuariosVentFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("VENT"))
          );
          setUsuariosVent(setUsuariosVentFiltrados);

          // Filtrar usuarios con el rol Ecom
          const usuariosEcomFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("ECOMERCE"))
          );
          setUsuariosEcom(usuariosEcomFiltrados);

          // Filtrar usuarios con el rol Con
          const setUsuariosConFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("CON"))
          );
          setUsuariosCon(setUsuariosConFiltrados);

          // Filtrar usuarios con el rol Ins
          const setUsuariosInsFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Ins"))
          );
          setUsuariosIns(setUsuariosInsFiltrados);

          // Filtrar usuarios con el rol Poli
          const setUsuariosPoliFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("POLI"))
          );
          setUsuariosPoli(setUsuariosPoliFiltrados);

          // Filtrar usuarios con el rol RH
          const setUsuariosRHFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("RH"))
          );
          setUsuariosRH(setUsuariosRHFiltrados);

          // Filtrar usuarios con el rol Trans
          const setUsuariosTransFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Trans"))
          );
          setUsuariosTrans(setUsuariosTransFiltrados);

          // Filtrar usuarios con el rol User
          const setUsuariosUserFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("user"))
          );
          setUsuariosUser(setUsuariosUserFiltrados);

          // Filtrar usuarios con el rol Dep
          const setUsuariosDepFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("Dep"))
          );
          setUsuariosDep(setUsuariosDepFiltrados);

          if (user?.role === "Control") {
            usuariosFiltrados = usuariosFiltrados.map((turnoData) => ({
              ...turnoData,
              usuarios: turnoData.usuarios.filter(
                (usuario) =>
                  usuario.role.includes("Pasillo") || usuario.role.includes("AV") // Incluye roles que contengan "Pasillo" o "AV"
              ),
            }));
          }

          // Filtrar los usuarios del Turno 4
          const turno4 = usuariosFiltrados.find((turno) => turno.turno === 4);
          if (turno4) {
            setTurno4Usuarios(turno4.usuarios);
            usuariosFiltrados = usuariosFiltrados.filter(
              (turno) => turno.turno !== 4
            );
          }

          if (user?.role === "Embar") {
            usuariosFiltrados = usuariosFiltrados.map((turnoData) => ({
              usuarios: turnoData.usuarios.filter(
                (usuario) => usuario.role.includes("EB") // Incluye roles que contengan "Pasillo" o "AV"
              ),
            }));
          }

          // Filtrar usuarios de Embarques (rol que contiene "EMB")
          const usuariosEmbarquesFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("EB"))
          );
          setUsuariosEmbarques(usuariosEmbarquesFiltrados);

          // Filtrar usuarios de Paquetería (rol que contiene "PQ")
          const usuariosPaqueteriaFiltrados = usuariosFiltrados.flatMap((turno) =>
            turno.usuarios.filter((usuario) => usuario.role.includes("PQ"))
          );
          setUsuariosPaqueteria(usuariosPaqueteriaFiltrados);

          setUsuariosPorTurno(usuariosFiltrados); // Guardar los usuarios por turno
        } catch (error) {
          console.error("Error al obtener los datos de usuarios:", error);
        }
      };

      // Obtener todas las secciones disponibles
      const fetchSecciones = async () => {
        try {
          const response = await axios.get(
            "http://66.232.105.87:3007/api/usuarios/secciones"
          );
          setSecciones(response.data);
        } catch (error) {
          console.error("Error al obtener las secciones:", error);
        }
      };

      fetchUsuarios();
      fetchSecciones();
    }, [user]);

    // Función para abrir el modal con los detalles del usuario
    const handleOpenModalUsers = (usuario = null) => {
      if (usuario) {
        setIsEditMode(true);
        setUserForm({
          email: usuario.email,
          name: usuario.name,
          password: "", // Vaciar la contraseña al editar
          unidad: usuario.unidad,
          role: usuario.role,
        });
      } else {
        setIsEditMode(false);
        setUserForm({
          email: "",
          name: "",
          password: "",
          unidad: "",
          role: "",
        });
      }
      setSelectedUser(usuario);
      setOpenModalUser(true);
    };

    // Función para abrir el modal con los detalles del usuario
    const handleOpenModal = (usuario) => {
      setSelectedUser(usuario);
      setOpenModal(true);
    };

    const handleSaveUser = async () => {
      try {
        if (isEditMode) {
          // Actualizar usuario
          await axios.put(
            `http://66.232.105.87:3007/api/usuarios/usuarios/${selectedUser.id_usu}`,
            userForm
          );
          alert("Usuario actualizado correctamente");
        } else {
          // Crear nuevo usuario
          await axios.post(
            `http://66.232.105.87:3007/api/usuarios/usuarios`,
            userForm
          );
          alert("Usuario creado correctamente");
        }
        setOpenModalUser(false);
        //fetchUsuarios(); // Refrescar la lista de usuarios
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
        alert("Error al guardar el usuario");
      }
    };

    const handleDeleteUser = async (id_usu) => {
      const confirm = window.confirm(
        "¿Estás seguro de que deseas eliminar este usuario?"
      );
      if (!confirm) return;

      try {
        await axios.delete(
          `http://66.232.105.87:3007/api/usuarios/usuarios/${id_usu}`
        );
        alert("Usuario eliminado correctamente");
        //fetchUsuarios(); // Refrescar la lista de usuarios
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        alert("Error al eliminar el usuario");
      }
    };

    const handleCloseModal = () => {
      setOpenModal(false);
      setOpenModalUser(false);
      setSelectedUser(null);
    };

    // Función para abrir el modal de administración de accesos del usuario
    const handleOpenAccessModal = async (usuario) => {
      setSelectedUser(usuario);
      try {
        const response = await axios.get(
          `http://66.232.105.87:3007/api/usuarios/usuarios/${usuario.id_usu}/accesos`
        );
        console.log(response.data);
        setAccesos(response.data); // Cargar accesos del usuario seleccionado
        setOpenAccessModal(true);
      } catch (error) {
        console.error("Error al obtener los accesos del usuario:", error);
      }
    };

    const handleCloseAccessModal = () => {
      setOpenAccessModal(false);
      setSelectedUser(null);
      setAccesos([]);
    };

    // Toggle acceso (lectura/escritura)
    const toggleAccess = (id_seccion, id_permiso) => {
      const exists = accesos.find(
        (access) =>
          access.id_seccion === id_seccion && access.id_permiso === id_permiso
      );
      if (exists) {
        setAccesos(
          accesos.filter(
            (access) =>
              !(
                access.id_seccion === id_seccion &&
                access.id_permiso === id_permiso
              )
          )
        );
      } else {
        setAccesos([...accesos, { id_seccion, id_permiso }]);
      }
    };

    // Guardar los cambios de accesos
    const handleSaveAccess = async () => {
      try {
        await axios.put(
          `http://66.232.105.87:3007/api/usuarios/usuarios/${selectedUser.id_usu}/accesos`,
          {
            secciones: accesos,
          }
        );
        alert("Accesos actualizados correctamente");
        handleCloseAccessModal();
      } catch (error) {
        console.error("Error al actualizar los accesos:", error);
        alert("Error al actualizar los accesos");
      }
    };

    const toggleSection = (id_seccion) => {
      const exists = accesos.some((access) => access.id_seccion === id_seccion);
      if (exists) {
        // Si ya existe la sección, eliminar todos sus permisos
        setAccesos(accesos.filter((access) => access.id_seccion !== id_seccion));
      } else {
        // Si no existe, agregar la sección (sin permisos, solo habilitarla)
        setAccesos([...accesos, { id_seccion, id_permiso: 0 }]); // id_permiso: 0 indica que no tiene permisos asignados
      }
    };

    const handleOpenPermissionsModal = (usuario) => {
      setSelectedUser(usuario);
      setUserPermissions(roleAccessMap[usuario.role] || []); // Permisos activos actuales

      // Permisos activos
      setEditablePermissions(roleAccessMap[usuario.role] || []);

      // Permisos inactivos
      const allPermissions = Object.keys(roleAccessMap).flatMap(
        (role) => roleAccessMap[role]
      );
      setInactivePermissions(
        allPermissions.filter((perm) => !editablePermissions.includes(perm))
      );

      setEditModePermissions(false); // Comenzar en modo vista
      setOpenPermissionsModal(true);
    };

    const toggleEditablePermission = (section) => {
      setEditablePermissions(
        (prev) =>
          prev.includes(section)
            ? prev.filter((permiso) => permiso !== section) // Desactivar permiso
            : [...prev, section] // Activar permiso
      );
    };

    const saveEditablePermissions = async () => {
      try {
        await axios.put(
          `http://66.232.105.87:3007/api/usuarios/usuarios/${selectedUser.id_usu}/permisos`,
          { permisos: editablePermissions }
        );
        alert("Permisos actualizados correctamente");
        setOpenPermissionsModal(false);
      } catch (error) {
        console.error("Error al actualizar permisos:", error);
        alert("Error al actualizar permisos");
      }
    };

    const handleClosePermissionsModal = () => {
      setOpenPermissionsModal(false);
      setSelectedUser(null);
      setUserPermissions([]);
    };

    const generarPDF = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/usuarios/usuarios"
        );
        const usuariosPorTurno = response.data;

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
          let turnoActual = grupo.turno; // Se obtiene el número de turno
          doc.addPage();
          doc.setFontSize(14);
          doc.text(`Surtido Turno ${turnoActual}`, 105, 15, { align: "center" });

          for (const usuario of grupo.usuarios) {
            const usuarioQR = await QRCode.toDataURL(usuario.email);
            const passwordQR = await QRCode.toDataURL(usuario.password);

            // 📌 Marco general de la credencial con línea normal
            doc.setLineWidth(0.5);
            doc.rect(xPos, yPos, 100, 60);

            // 🏷 Nombre y Pasillo del usuario
            doc.setFontSize(11);
            doc.text(usuario.name.toUpperCase(), xPos + 50, yPos + 10, {
              align: "center",
            });
            doc.setFontSize(9);
            doc.text(`(${usuario.role})`, xPos + 50, yPos + 16, {
              align: "center",
            });

            // 🔹 Usuario y Contraseña QR en una misma línea
            doc.setFontSize(9);
            doc.text("USUARIO", xPos + 25, yPos + 28, { align: "center" });
            doc.text("CONTRASEÑA", xPos + 75, yPos + 28, { align: "center" });

            doc.addImage(usuarioQR, "PNG", xPos + 10, yPos + 30, 25, 25);
            doc.addImage(passwordQR, "PNG", xPos + 65, yPos + 30, 25, 25);

            // 📌 Control de posición de credenciales
            credencialesPorHoja++;
            if (credencialesPorHoja % 2 === 0) {
              xPos = 10;
              yPos += 70;
            } else {
              xPos = 110;
            }

            // 📝 Cuando hay 4 credenciales en una hoja, se agrega una nueva
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
      } catch (error) {
        console.error("Error al generar el PDF", error);
        alert("Error al generar el PDF");
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3, // Espaciado inferior
          }}
        >
          <Typography variant="h4">
            Usuarios por Turno {user?.role} {user?.name}
          </Typography>

        
        </Box>
          {(user?.role === "Master" || user?.role === "Admin") && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModalUsers(null)}
            >
              Crear Usuario
            </Button>
          )}

          <Button variant="contained" color="primary" onClick={generarPDF}>
            Descargar PDF de Accesos
          </Button>
        {/* Mostrar tabla "Accesos Web" solo a los administradores */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          turno4Usuarios.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Accesos Web
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Pasillo</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Accesos</TableCell>
                      {(user?.role === "Master" || user?.role === "Admin") && (
                        <TableCell>Acciones</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {turno4Usuarios.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>

                        <TableCell>
                          <Button
                            variant="contained"
                            ml="3px"
                            color="info"
                            onClick={() => handleOpenPermissionsModal(usuario)}
                          >
                            Permisos Vistas
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

        {/* Muestra todas las tablas de turno, si se modifica, todas las demas tendran el mismo cambio */}

        {/* Mostrar tablas separadas para cada turno */}
        {usuariosPorTurno.map(
          (turnoData, index) =>
            (user?.role === "Control" || user?.role === "Admin") && (
              <Box key={index} sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Surtido Turno {turnoData.turno}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Pasillo</TableCell>
                        <TableCell>Unidad de Negocio</TableCell>
                        <TableCell>Acciones</TableCell>
                        {(user?.role === "Master" || user?.role === "Admin") && (
                          <TableCell>Acciones</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {turnoData.usuarios.map((usuario) => (
                        <TableRow key={usuario.id_usu}>
                          <TableCell>{usuario.id_usu}</TableCell>
                          <TableCell>{usuario.name}</TableCell>
                          <TableCell>{usuario.role}</TableCell>
                          <TableCell>{usuario.unidad}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModal(usuario)}
                            >
                              Ver Accesos
                            </Button>

                            {/* Mostrar el botón de "Administrar Accesos" solo si el usuario tiene el rol de "master" o "admin" */}
                          </TableCell>
                          <TableCell>
                            {(user?.role === "Master" ||
                              user?.role === "Admin"   ||
                              user?.role === "Control") && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenModalUsers(usuario)}
                                sx={{ mr: 1 }}
                              >
                                Editar
                              </Button>
                            )}
                            {(user?.role === "Master" ||
                              user?.role === "Admin") && (
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleDeleteUser(usuario.id_usu)}
                              >
                                Eliminar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) 
        )}

        {/* Mostrar tablas separadas para cada turno */}
        {(user?.role === "Embar" || user?.role === "Admin") && usuariosEmbarques.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Usuarios de Embarques
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Unidad de Negocio</TableCell>
                    <TableCell>Acciones</TableCell>
                    {(user?.role === "Master" || user?.role === "Admin") && (
                      <TableCell>Acciones</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosEmbarques.map((usuario) => (
                    <TableRow key={usuario.id_usu}>
                      <TableCell>{usuario.id_usu}</TableCell>
                      <TableCell>{usuario.name}</TableCell>
                      <TableCell>{usuario.role}</TableCell>
                      <TableCell>{usuario.unidad}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenModal(usuario)}
                        >
                          Ver Accesos
                        </Button>
                      </TableCell>
                      <TableCell>
                        {(user?.role === "Master" || user?.role === "Admin") && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModalUsers(usuario)}
                            sx={{ mr: 1 }}
                          >
                            Editar
                          </Button>
                        )}
                        {(user?.role === "Master" || user?.role === "Admin") && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteUser(usuario.id_usu)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tabla para usuarios de Paquetería */}
        {/* {usuariosPaqueteria.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Usuarios de Paquetería
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Unidad de Negocio</TableCell>
                    <TableCell>Acciones</TableCell>
                    {(user?.role === "Master" || user?.role === "Admin") && (
                      <TableCell>Acciones</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosPaqueteria.map((usuario) => (
                    <TableRow key={usuario.id_usu}>
                      <TableCell>{usuario.id_usu}</TableCell>
                      <TableCell>{usuario.name}</TableCell>
                      <TableCell>{usuario.role}</TableCell>
                      <TableCell>{usuario.unidad}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenModal(usuario)}
                        >
                          Ver Accesos
                        </Button>
                      </TableCell>
                      <TableCell>
                        {(user?.role === "Master" || user?.role === "Admin") && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModalUsers(usuario)}
                            sx={{ mr: 1 }}
                          >
                            Editar
                          </Button>
                        )}
                        {(user?.role === "Master" || user?.role === "Admin") && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteUser(usuario.id_usu)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )} */}
        
        {/* Tabla para usuarios con rol MONTA */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosMonta.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Montacargas
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    {user?.role === "Master" || user?.role === "Admin" ? (
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Unidad de Negocio</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Unidad de Negocio</TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  <TableBody>
                    {usuariosMonta.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        {user?.role === "Admin" && (
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModal(usuario)}
                            >
                              Ver Accesos
                            </Button>
                          </TableCell>
                        )}
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Admin */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosAdmin.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Administradores
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosAdmin.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>

                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Control */}
        {(user?.role === "Control" ||
          user?.role === "Admin" ||
          user?.role === "Master") &&
          usuariosControl.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Mesa de Control
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosControl.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Master */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosMaster.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Dueños
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosMaster.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Paquet */}
        {(user?.role === "Paquet" ||
          user?.role === "Admin" ||
          user?.role === "Master") &&
          usuariosPaquet.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Paqueteria
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosPaquet.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Embarque */}
        {(user?.role === "Embar" ||
          user?.role === "Admin" ||
          user?.role === "Master") &&
          usuariosEmbar.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Embarques
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosEmbar.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Rep */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosRep.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Reporte
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosRep.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Eti */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosEti.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Eti
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosEti.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Nac */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosNac.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Nac
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosNac.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Imp */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosImp.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Imp
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosImp.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Plan */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosPlan.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Plan
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosPlan.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Recib */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosRecibo.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Recibo
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosRecibo.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Cali */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosCali.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Calidad
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosCali.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Inv */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosInv.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Inventario
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosInv.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Audi */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosAudi.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Auditoria
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosAudi.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Vent */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosVent.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Ventas
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosVent.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Ecomerce */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosEcom.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Ecomerce
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosEcom.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Con */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosCon.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios Con
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosCon.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Ins */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosIns.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Ins
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosIns.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Poli */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosPoli.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Policias
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosPoli.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol RH */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosRH.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Recursos Humanos
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosRH.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Trans */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosTrans.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Transporte
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosTrans.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol User */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosUser.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosUser.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Tabla para usuarios con rol Dep */}
        {(user?.role === "Admin" || user?.role === "Master") &&
          usuariosDep.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Usuarios de Desarrollo
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Unidad de Negocio</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosDep.map((usuario) => (
                      <TableRow key={usuario.id_usu}>
                        <TableCell>{usuario.id_usu}</TableCell>
                        <TableCell>{usuario.name}</TableCell>
                        <TableCell>{usuario.role}</TableCell>
                        <TableCell>{usuario.unidad}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenModal(usuario)}
                          >
                            Ver Accesos
                          </Button>
                        </TableCell>
                        <TableCell>
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalUsers(usuario)}
                              sx={{ mr: 1 }}
                            >
                              Editar
                            </Button>
                          )}
                          {(user?.role === "Master" ||
                            user?.role === "Admin") && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id_usu)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={openPermissionsModal}
                onClose={handleClosePermissionsModal}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: "1200px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {selectedUser && (
                    <>
                      {/* Encabezado */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        Permisos de {selectedUser.name} ({selectedUser.role})
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      {/* Botón para alternar entre Modo Vista y Edición */}
                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          variant="contained"
                          color={editModePermissions ? "warning" : "primary"}
                          onClick={() =>
                            setEditModePermissions(!editModePermissions)
                          }
                        >
                          {editModePermissions
                            ? "Cancelar Edición"
                            : "Editar Permisos"}
                        </Button>
                      </Box>

                      {/* MODO VISTA */}
                      {!editModePermissions ? (
                        <Grid container spacing={2}>
                          {userPermissions.map((seccion, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                variant="outlined"
                                sx={{ textAlign: "center" }}
                              >
                                <CardHeader
                                  title={seccion}
                                  sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    borderRadius: "8px 8px 0 0",
                                  }}
                                />
                                <CardContent>
                                  <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 40 }}
                                  />
                                  <Typography>Acceso Autorizado</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        /* MODO EDICIÓN */
                        <>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Activos
                          </Typography>
                          <Grid container spacing={2}>
                            {editablePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "success.light",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "success.dark",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>

                          <Divider sx={{ my: 3 }} />

                          {/* Permisos Inactivos */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Permisos Inactivos
                          </Typography>
                          <Grid container spacing={2}>
                            {inactivePermissions.map((seccion, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2,
                                    textAlign: "center",
                                    boxShadow: 1,
                                    backgroundColor: "grey.300",
                                  }}
                                >
                                  <CardHeader
                                    title={seccion}
                                    sx={{
                                      backgroundColor: "grey.500",
                                      color: "white",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                  />
                                  <CardContent>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={editablePermissions.includes(
                                            seccion
                                          )}
                                          onChange={() =>
                                            toggleEditablePermission(seccion)
                                          }
                                        />
                                      }
                                      label="Habilitar"
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {/* Botones de Acción */}
                      <Box sx={{ mt: 4, textAlign: "right" }}>
                        {editModePermissions && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={saveEditablePermissions}
                            sx={{ mr: 2 }}
                          >
                            Guardar Permisos
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleClosePermissionsModal}
                        >
                          Cerrar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Modal>
            </Box>
          )}

        {/* Modal para mostrar los detalles del usuario */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600, // Ajusta el ancho para que sea mayor
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            {selectedUser && (
              <>
                <Typography variant="h5" gutterBottom>
                  Detalles del Usuario
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Pasillo:</strong> {selectedUser.role}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Nombre:</strong> {selectedUser.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Correo:</strong> {selectedUser.email}
                    </Typography>
                    {/* Código de barras para el correo */}
                    <Barcode value={selectedUser.email} width={1.5} />{" "}
                    {/* Ajusta el ancho del código de barras */}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Contraseña:</strong>
                    </Typography>
                    {/* Código de barras para la contraseña */}
                    <Barcode value={selectedUser.password} width={1.5} />{" "}
                    {/* Ajusta el ancho del código de barras */}
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCloseModal}
                  >
                    Cerrar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
        {/* Modal para mostrar los detalles del usuario */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            {selectedUser && (
              <>
                <Typography variant="h5" gutterBottom>
                  Detalles del Usuario
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Pasillo:</strong> {selectedUser.role}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Nombre:</strong> {selectedUser.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Correo:</strong> {selectedUser.email}
                    </Typography>
                    <Barcode value={selectedUser.email} width={1.5} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Contraseña:</strong>
                    </Typography>
                    <Barcode value={selectedUser.password} width={1.5} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCloseModal}
                  >
                    Cerrar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
        <Modal open={openAccessModal} onClose={handleCloseAccessModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            {selectedUser && (
              <>
                <Typography variant="h5" gutterBottom>
                  Administrar Accesos para {selectedUser.name}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  {secciones.map((seccion) => {
                    const isEnabled = accesos.some(
                      (access) => access.id_seccion === seccion.id_seccion
                    ); // Verifica si la sección está habilitada

                    return (
                      <Grid item xs={12} sm={12} md={2} key={seccion.id_seccion}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {seccion.name}{" "}
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isEnabled}
                                    onChange={() =>
                                      toggleSection(seccion.id_seccion)
                                    } // Toggle para habilitar o deshabilitar la sección
                                  />
                                }
                              />
                            </Typography>

                            {/* Checkbox para habilitar/deshabilitar la sección */}

                            {/* Checkbox de Lectura, habilitado solo si la sección está habilitada */}
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={accesos.some(
                                    (access) =>
                                      access.id_seccion === seccion.id_seccion &&
                                      access.id_permiso === 1
                                  )}
                                  onChange={() =>
                                    toggleAccess(seccion.id_seccion, 1)
                                  }
                                  disabled={!isEnabled} // Deshabilitado si la sección no está habilitada
                                />
                              }
                              label="Lectura"
                            />

                            {/* Checkbox de Escritura, habilitado solo si la sección está habilitada */}
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={accesos.some(
                                    (access) =>
                                      access.id_seccion === seccion.id_seccion &&
                                      access.id_permiso === 2
                                  )}
                                  onChange={() =>
                                    toggleAccess(seccion.id_seccion, 2)
                                  }
                                  disabled={!isEnabled} // Deshabilitado si la sección no está habilitada
                                />
                              }
                              label="Escritura"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                <Box sx={{ mt: 3, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveAccess}
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCloseAccessModal}
                    sx={{ ml: 2 }}
                  >
                    Cerrar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
        <Modal open={openModalUser} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              {isEditMode ? "Editar Usuario" : "Crear Usuario"}
            </Typography>
            <form>
              <TextField
                label="Nombre"
                fullWidth
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Correo Electrónico"
                fullWidth
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                sx={{ mb: 2 }}
                disabled={isEditMode} // Solo habilitar en modo creación
              />
              <TextField
                label="Unidad"
                fullWidth
                value={userForm.unidad}
                onChange={(e) =>
                  setUserForm({ ...userForm, unidad: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Rol"
                fullWidth
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <Box sx={{ textAlign: "right" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveUser}
                >
                  Guardar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCloseModal}
                  sx={{ ml: 2 }}
                >
                  Cancelar
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </Box>
    );
  }

  export default Usuarios;

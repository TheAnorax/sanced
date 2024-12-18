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
} from "@mui/material";
import Barcode from "react-barcode";
import { UserContext } from "../context/UserContext";

function Usuarios() {
  const [usuariosPorTurno, setUsuariosPorTurno] = useState([]);
  const [turno4Usuarios, setTurno4Usuarios] = useState([]); // Almacena usuarios del Turno 4
  const [usuariosEmbarques, setUsuariosEmbarques] = useState([]); // Usuarios de Embarques
  const [usuariosPaqueteria, setUsuariosPaqueteria] = useState([]);
  const [usuariosMonta, setUsuariosMonta] = useState([]); // Usuarios con rol MONTA
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalUser, setOpenModalUser] = useState(false);
  const [openAccessModal, setOpenAccessModal] = useState(false);
  const [accesos, setAccesos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const { user } = useContext(UserContext); // Usuario logueado
  const [isEditMode, setIsEditMode] = useState(false); // Controla si el modal es para editar o crear
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
          "http://192.168.3.27:3007/api/usuarios/usuarios"
        );
        let usuariosFiltrados = response.data;


        // Filtrar usuarios con el rol MONTA
        const usuariosMontaFiltrados = usuariosFiltrados.flatMap((turno) =>
          turno.usuarios.filter((usuario) => usuario.role.includes("MONTA"))
        );
        setUsuariosMonta(usuariosMontaFiltrados);

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
          "http://192.168.3.27:3007/api/usuarios/secciones"
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
          `http://192.168.3.27:3007/api/usuarios/usuarios/${selectedUser.id_usu}`,
          userForm
        );
        alert("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        await axios.post(
          `http://192.168.3.27:3007/api/usuarios/usuarios`,
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
        `http://192.168.3.27:3007/api/usuarios/usuarios/${id_usu}`
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
        `http://192.168.3.27:3007/api/usuarios/usuarios/${usuario.id_usu}/accesos`
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
        `http://192.168.3.27:3007/api/usuarios/usuarios/${selectedUser.id_usu}/accesos`,
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Usuarios por Turno {user?.role} {user?.name}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModalUsers(null)}
          sx={{ mb: 3 }}
        >
          Crear Usuario
        </Button>
      </Typography>

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
                    {(user?.role === "Master" ||
                          user?.role === "Admin") && (
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
                        {/* <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenModal(usuario)}
                        >
                          Ver Accesos
                        </Button> */}

                        {/* Mostrar el botón de "Administrar Accesos" solo si el usuario tiene el rol de "master" o "admin" */}
                        {/* {(user?.role === "Master" ||
                          user?.role === "Admin") && (
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleOpenAccessModal(usuario)}
                            sx={{ ml: 2 }}
                          >
                            Administrar Accesos
                          </Button>
                        )} */}
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

      {/* Mostrar tablas separadas para cada turno */}
      {usuariosPorTurno.map((turnoData, index) => (
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
                  {(user?.role === "Master" ||
                          user?.role === "Admin") && (
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
      ))}

      {usuariosEmbarques.length > 0 && (
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
                  {(user?.role === "Master" ||
                          user?.role === "Admin") && (
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

      {/* Tabla para usuarios de Paquetería */}
      {usuariosPaqueteria.length > 0 && (
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
                  {(user?.role === "Master" ||
                          user?.role === "Admin") && (
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

      {/* Tabla para usuarios con rol MONTA */}
{usuariosMonta.length > 0 && (
  <Box sx={{ mb: 5 }}>
    <Typography variant="h5" sx={{ mb: 2 }}>
      Usuarios MONTA
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
          {usuariosMonta.map((usuario) => (
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenModalUsers(usuario)}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteUser(usuario.id_usu)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  CircularProgress,
  TablePagination,
  Box,
  Button,
  Modal,
  TextField,
  IconButton,
} from "@mui/material";
import { Delete, PlayArrow, CheckCircle } from "@mui/icons-material";
import { UserContext } from "../context/UserContext";
import * as XLSX from "xlsx";


function TareaDev() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    asignado_a: "",
  });
  const [alerta, setAlerta] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const { user } = useContext(UserContext);
  const [usuarios, setUsuarios] = useState([]);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3007/api/devs/tareas"
        );
        setTareas(response.data);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:3007/api/usuarios/usuarios");
        console.log("Datos de la API:", response.data); // Para verificar la estructura
  
        // Busca el grupo con turno === 4
        const turno4 = response.data.find((grupo) => grupo.turno === 4);
        const usuariosTurno4 = turno4 ? turno4.usuarios : []; // Si no hay usuarios, retorna un arreglo vacío
  
        console.log("Usuarios con turno 4:", usuariosTurno4); // Verifica que se carguen los usuarios correctamente
        setUsuarios(usuariosTurno4);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
  
    fetchUsuarios();
  }, []);
  
  const handleCrearTarea = async () => {
    try {
      const tareaConAsignador = {
        ...nuevaTarea,
        asignador: user?.id_usu,
      };
  
      console.log("Tarea que se enviará al backend:", tareaConAsignador);
  
      const response = await axios.post(
        "http://localhost:3007/api/devs/tareas",
        tareaConAsignador
      );
  
      setTareas([...tareas, response.data]);
  
      setNuevaTarea({
        titulo: "",
        area: "",
        descripcion: "",
        asignado_a: "",
        asignador: "",
        fecha_inicio: "",
        fecha_fin: "",
      });
  
      setAlerta("Tarea creada correctamente");
      setModalOpen(false);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      setAlerta("Error al crear la tarea");
    }
  };
  

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Delete a task
  const handleEliminarTarea = async (id) => {
    try {
      await axios.delete(`http://localhost:3007/api/devs/tareas/${id}`);
      setTareas(tareas.filter((tarea) => tarea.id !== id));
      setAlerta("Tarea eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      setAlerta("Error al eliminar la tarea");
    }
  };

  // Change the task state (start or finish)
  const handleCambiarEstado = async (id, estado) => {
    const tarea = tareas.find((t) => t.id === id);
    if (!tarea) return;
  
    try {
      await axios.put(`http://localhost:3007/api/devs/tareas/${id}`, {
        ...tarea, // Enviar todos los datos actuales de la tarea
        estado, // Actualizar únicamente el estado
      });
  
      setTareas(
        tareas.map((tarea) =>
          tarea.id === id ? { ...tarea, estado } : tarea
        )
      );
      setAlerta("Estado de la tarea actualizado");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setAlerta("Error al actualizar el estado");
    }
  };

  const handleArchivoExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
  
      // Tomamos la primera hoja
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
  
      // Convertimos a JSON
      const datos = XLSX.utils.sheet_to_json(hoja, { defval: "" });
  
      // Filtramos las columnas que nos interesan
      const datosFiltrados = datos.map((fila) => ({
        NoOrden: fila.NoOrden,
        Articulo: fila.Articulo,
        Cantidad: fila.Cantidad,
        UM: fila.UM,
        TpOrden: fila.TpOrden,
      }));
  
      console.log("📦 Datos cargados desde Excel:", datosFiltrados);
    };
  
    reader.readAsArrayBuffer(file);
  };
   
  
  

  // Open and close modal for new task
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const handleVerDetalles = (tarea) => {
    setTareaSeleccionada(tarea);
    setModalDetallesOpen(true);
  };
  const handleCerrarDetalles = () => {
    setTareaSeleccionada(null);
    setModalDetallesOpen(false);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        Tareas Dev's
      </Typography>

      {alerta && (
        <Typography color="error" sx={{ mb: 2 }}>
          {alerta}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Button to open modal */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>

           
  {/* Botón de carga de Excel */}
  <Button
    variant="outlined"
    component="label"
    sx={{ borderRadius: "12px", boxShadow: 3 }}
  >
    Cargar Excel
    <input
      type="file"
      hidden
      accept=".xlsx, .xls"
      onChange={handleArchivoExcel}
    />
  </Button> 
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
              sx={{
                borderRadius: "12px",
                padding: "8px 16px",
                boxShadow: 3,
                "&:hover": { boxShadow: 6 },
              }}
            >
              Nueva Tarea
            </Button>
          </Box>

          {/* Table of tasks */}
          <TableContainer
            component={Paper}
            sx={{ boxShadow: 5, height: "auto" }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f4f4f4" }}>
                <TableRow>
                  <TableCell>
                    <strong>Área</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Título</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Responsable</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fecha Inicio</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fecha Fin</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tareas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tarea) => (
                    <TableRow
                      key={tarea.id}
                      sx={{ "&:hover": { backgroundColor: "#e1f5fe" } }}
                    >
                      <TableCell>{tarea.area}</TableCell>
                      <TableCell>{tarea.titulo}</TableCell>
                      <TableCell>{tarea.asignado}</TableCell>
                      <TableCell>{formatFecha(tarea.fecha_inicio)}</TableCell>
                      <TableCell>{formatFecha(tarea.fecha_fin)}</TableCell>
                      <TableCell>
  <TextField
    select
    size="small"
    value={tarea.estado}
    onChange={(e) => handleCambiarEstado(tarea.id, e.target.value)}
    SelectProps={{ native: true }}
    sx={{
      minWidth: 150,
      backgroundColor: "#fff",
      borderRadius: "6px",
    }}
  >
    {[
      "Creado Pendiente",
      "En Progreso",
      "Pruebas Unitarias",
      "Autorizada",
      "Finalizado",
    ].map((estado) => (
      <option key={estado} value={estado}>
        {estado}
      </option>
    ))}
  </TextField>
  <Box sx={{ mt: 1 }}>
    <IconButton
      color="error"
      onClick={() => handleEliminarTarea(tarea.id)}
      title="Eliminar"
    >
      <Delete />
    </IconButton>
    <Button
      variant="outlined"
      size="small"
      onClick={() => handleVerDetalles(tarea)}
      sx={{ ml: 1 }}
    >
      Ver Detalles
    </Button>
  </Box>
</TableCell>

                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={tareas.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />

          {/* Modal for new task */}
          <Modal open={modalOpen} onClose={handleModalClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: "16px", // Rounded corners
                display: "flex",
                flexDirection: "column", // Ensure inputs stack vertically
                alignItems: "center", // Center the content inside the modal
                gap: 2, // Add gap between the fields
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center", fontWeight: "bold" }}
              >
                Nueva Tarea
              </Typography>

              <TextField
                label="Título"
                fullWidth
                value={nuevaTarea.titulo}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Área"
                fullWidth
                value={nuevaTarea.area}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, area: e.target.value })
                }
              />

              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={4}
                value={nuevaTarea.descripcion}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })
                }
                sx={{ mb: 2 }}
              />

<TextField
  select
  label="Asignado a"
  fullWidth
  value={nuevaTarea.asignado_a}
  onChange={(e) => {
    setNuevaTarea({ ...nuevaTarea, asignado_a: e.target.value });
    console.log("Usuario seleccionado:", e.target.value); // Verifica el id_usu del usuario
  }}
  SelectProps={{
    native: true,
  }}
  sx={{ mb: 2 }}
>
  <option value="" disabled>
    Selecciona un usuario
  </option>
  {usuarios.length === 0 ? (
    <option value="" disabled>
      No hay usuarios disponibles para el turno 4
    </option>
  ) : (
    usuarios.map((usuario) => (
      <option key={usuario.id_usu} value={usuario.id_usu}>
        {usuario.name}
      </option>
    ))
  )}
</TextField>


              <TextField
                label="Fecha de Inicio"
                fullWidth
                type="date"
                value={nuevaTarea.fecha_inicio}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, fecha_inicio: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Fecha de Fin"
                fullWidth
                type="date"
                value={nuevaTarea.fecha_fin}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, fecha_fin: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCrearTarea}
                  sx={{ borderRadius: "12px", flexGrow: 1 }}
                >
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleModalClose}
                  sx={{ borderRadius: "12px", ml: 2 }}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal
            open={modalDetallesOpen}
            onClose={handleCerrarDetalles}
            aria-labelledby="modal-tarea-detalles"
            aria-describedby="modal-detalles-descripcion"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: "16px",
              }}
            >
              <Typography
                id="modal-tarea-detalles"
                variant="h6"
                component="h2"
                gutterBottom
              >
                Detalles de la Tarea
              </Typography>
              {tareaSeleccionada ? (
                <>
                  <Typography>
                    <strong>Área:</strong> {tareaSeleccionada.area || "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Título:</strong> {tareaSeleccionada.titulo}
                  </Typography>
                  <Typography>
                    <strong>Descripción:</strong>{" "}
                    {tareaSeleccionada.descripcion}
                  </Typography>
                  <Typography>
                    <strong>Responsable:</strong> {tareaSeleccionada.asignado}
                  </Typography>
                  <Typography>
                    <strong>Estado:</strong> {tareaSeleccionada.estado}
                  </Typography>
                  <Typography>
                    <strong>Fecha de Inicio:</strong>{" "}
                    {formatFecha(tareaSeleccionada.fecha_inicio)}
                  </Typography>
                  <Typography>
                    <strong>Fecha de Fin:</strong>{" "}
                    {formatFecha(tareaSeleccionada.fecha_fin)}
                  </Typography>
                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleCerrarDetalles}
                      sx={{ borderRadius: "12px" }}
                    >
                      Cerrar
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography>
                  No se encontraron detalles para esta tarea.
                </Typography>
              )}
            </Box>
          </Modal>
        </>
      )}
    </Container>
  );
}

export default TareaDev;

import React, { useState, useEffect } from "react";
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

  // Fetch tasks from API
  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const response = await axios.get(
          "http://192.168.3.27:3007/api/devs/tareas"
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

  // Create a new task
  const handleCrearTarea = async () => {
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/devs/tareas",
        nuevaTarea
      );
      setTareas([...tareas, response.data]);
      setNuevaTarea({ titulo: "", descripcion: "", asignado_a: "" });
      setAlerta("Tarea creada correctamente");
      setModalOpen(false);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      setAlerta("Error al crear la tarea");
    }
  };

  // Delete a task
  const handleEliminarTarea = async (id) => {
    try {
      await axios.delete(`http://192.168.3.27:3007/api/devs/tareas/${id}`);
      setTareas(tareas.filter((tarea) => tarea.id !== id));
      setAlerta("Tarea eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      setAlerta("Error al eliminar la tarea");
    }
  };

  // Change the task state (start or finish)
  const handleCambiarEstado = async (id, estado) => {
    try {
      await axios.put(`http://192.168.3.27:3007/api/devs/tareas/${id}`, {
        estado,
      });
      setTareas(
        tareas.map((tarea) => (tarea.id === id ? { ...tarea, estado } : tarea))
      );
      setAlerta("Estado de la tarea actualizado");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setAlerta("Error al actualizar el estado");
    }
  };

  // Open and close modal for new task
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

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
          <TableContainer component={Paper} sx={{ boxShadow: 5 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f4f4f4" }}>
                <TableRow>
                  <TableCell>
                    <strong>Título</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Descripción</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado</strong>
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
                      <TableCell>{tarea.titulo}</TableCell>
                      <TableCell>{tarea.descripcion}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor:
                              tarea.estado === "Finalizado"
                                ? "green"
                                : "orange",
                            color: "white",
                            borderRadius: "8px",
                            padding: "2px 8px",
                          }}
                        >
                          {tarea.estado}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="success"
                          onClick={() =>
                            handleCambiarEstado(tarea.id, "En Progreso")
                          }
                        >
                          <PlayArrow />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() =>
                            handleCambiarEstado(tarea.id, "Finalizado")
                          }
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleEliminarTarea(tarea.id)}
                        >
                          <Delete />
                        </IconButton>
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
                label="Asignado a"
                fullWidth
                value={nuevaTarea.asignado_a}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, asignado_a: e.target.value })
                }
                sx={{ mb: 2 }}
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
        </>
      )}
    </Container>
  );
}

export default TareaDev;

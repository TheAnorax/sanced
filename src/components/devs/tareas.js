import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

function TareaDev() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', descripcion: '', asignado_a: '' });
  const [alerta, setAlerta] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const response = await axios.get('http://192.168.3.27:3007/api/devs/tareas');
        setTareas(response.data);
      } catch (error) {
        console.error('Error al cargar tareas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
  }, []);

  const handleCrearTarea = async () => {
    try {
      const response = await axios.post('http://192.168.3.27:3007/api/devs/tareas', nuevaTarea);
      setTareas([...tareas, response.data]);
      setNuevaTarea({ titulo: '', descripcion: '', asignado_a: '' });
      setAlerta('Tarea creada correctamente');
      setModalOpen(false);
    } catch (error) {
      console.error('Error al crear tarea:', error);
      setAlerta('Error al crear la tarea');
    }
  };

  const handleEliminarTarea = async (id) => {
    try {
      await axios.delete(`http://192.168.3.27:3007/api/devs/tareas/${id}`);
      setTareas(tareas.filter((tarea) => tarea.id !== id));
      setAlerta('Tarea eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      setAlerta('Error al eliminar la tarea');
    }
  };

  const handleCambiarEstado = async (id, estado) => {
    try {
      await axios.put(`http://192.168.3.27:3007/api/devs/tareas/${id}`, { estado });
      setTareas(
        tareas.map((tarea) => (tarea.id === id ? { ...tarea, estado } : tarea))
      );
      setAlerta('Estado de la tarea actualizado');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setAlerta('Error al actualizar el estado');
    }
  };
  

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Tareas Dev's
      </Typography>
      {alerta && (
        <Typography color="error" sx={{ mb: 2 }}>
          {alerta}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Botón para abrir modal */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" color="primary" onClick={handleModalOpen}>
              Nueva Tarea
            </Button>
          </Box>

          {/* Tabla de tareas */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tareas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tarea) => (
                  <TableRow key={tarea.id}>
                    <TableCell>{tarea.titulo}</TableCell>
                    <TableCell>{tarea.descripcion}</TableCell>
                    <TableCell>{tarea.estado}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleCambiarEstado(tarea.id, 'En Progreso')}
                        sx={{ mr: 1 }}
                      >
                        Iniciar
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleCambiarEstado(tarea.id, 'Finalizado')}
                        sx={{ mr: 1 }}
                      >
                        Finalizar
                      </Button>
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

          {/* Paginación */}
          <TablePagination
            component="div"
            count={tareas.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />

          {/* Modal para nueva tarea */}
          <Modal open={modalOpen} onClose={handleModalClose}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Nueva Tarea
              </Typography>
              <TextField
                label="Título"
                fullWidth
                value={nuevaTarea.titulo}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={4}
                value={nuevaTarea.descripcion}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Asignado a"
                fullWidth
                value={nuevaTarea.asignado_a}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, asignado_a: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCrearTarea}
                  sx={{ mr: 2 }}
                >
                  Guardar
                </Button>
                <Button variant="outlined" onClick={handleModalClose}>
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

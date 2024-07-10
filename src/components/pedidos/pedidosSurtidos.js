import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography, Box, Button, Modal, Paper, TextField,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, CircularProgress, Autocomplete, Tooltip, Fab, Snackbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 3px 6px rgba(0,0,0,0.16)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { marginBottom: '16px' },
      },
    },
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function EnSurtido() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthorization, setIsAuthorization] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bahias, setBahias] = useState([]);
  const [selectedBahias, setSelectedBahias] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editedItems, setEditedItems] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [incidences, setIncidences] = useState({});

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://192.168.3.225:3007/api/pedidos-surtidos/pedidos-surtido');
        const dataWithTimes = response.data.map(pedido => {
          const itemsInStateB = pedido.items.filter(item => item.estado === 'B');
          if (itemsInStateB.length === pedido.items.length) {
            const inicioSurtido = Math.min(...itemsInStateB.map(item => new Date(item.inicio_surtido).getTime()));
            const finSurtido = Math.max(...itemsInStateB.map(item => new Date(item.fin_surtido).getTime()));
            const fechaSurtido = new Date(inicioSurtido).toLocaleDateString();
            return {
              ...pedido,
              inicio_surtido: new Date(inicioSurtido).toLocaleTimeString(),
              fin_surtido: new Date(finSurtido).toLocaleTimeString(),
              fecha_surtido: fechaSurtido
            };
          }
          return pedido;
        });
        setPedidos(dataWithTimes);
        setFilteredPedidos(dataWithTimes);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    const fetchBahias = async () => {
      try {
        const response = await axios.get('http://192.168.3.225:3007/api/pedidos/bahias');
        const filteredBahias = response.data.filter(bahia => bahia.estado === null && bahia.id_pdi === null);
        setBahias(filteredBahias);
      } catch (error) {
        console.error('Error fetching bahias:', error);
      }
    };

    fetchPedidos();
    fetchBahias();

    const intervalId = setInterval(fetchPedidos, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenModal = (pedido, editing, authorization) => {
    const existingBahias = pedido.ubi_bahia ? pedido.ubi_bahia.split(', ') : [];
    setSelectedPedido(pedido);
    setSelectedBahias(existingBahias.map(bahia => ({ bahia })));
    setIsEditing(editing);
    setIsAuthorization(authorization);
    setOpenModal(true);

    const newIncidences = {};
    pedido.items.forEach((item, index) => {
      if (item.cant_surti > item.cantidad || (item.cant_surti + item.cant_no_env) !== item.cantidad) {
        newIncidences[index] = true;
      }
    });
    setIncidences(newIncidences);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
    setIsEditing(false);
    setIsAuthorization(false);
    setEditedItems({});
    setIncidences({});
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = pedidos.filter((pedido) =>
      pedido.pedido.toString().includes(value) ||
      pedido.tipo.toLowerCase().includes(value)
    );
    setFilteredPedidos(filteredData);
  };

  const handleInputChange = (event, itemIndex) => {
    const { name, value } = event.target;
    const updatedItems = [...selectedPedido.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [name]: parseFloat(value),
    };

    // Actualizar el estado a 'B' cuando la cantidad surtida es válida
    if ((updatedItems[itemIndex].cant_surti + updatedItems[itemIndex].cant_no_env) === updatedItems[itemIndex].cantidad) {
      updatedItems[itemIndex].estado = 'B';
    }

    setSelectedPedido({ ...selectedPedido, items: updatedItems });

    setEditedItems({
      ...editedItems,
      [itemIndex]: {
        ...updatedItems[itemIndex],
        edited: true,
      },
    });

    const newIncidences = { ...incidences };
    if ((updatedItems[itemIndex].cant_surti + updatedItems[itemIndex].cant_no_env) === updatedItems[itemIndex].cantidad) {
      delete newIncidences[itemIndex];
    }
    setIncidences(newIncidences);
  };

  const handleSave = async () => {
    const newIncidences = {};
    const errorMessages = [];

    for (let [index, item] of selectedPedido.items.entries()) {
      if (!item.ubi && (item.cant_surti !== item.cantidad && (item.cant_surti + item.cant_no_env) !== item.cantidad)) {
        newIncidences[index] = true;
        errorMessages.push(`Producto ${item.codigo_ped}: La cantidad surtida y la cantidad no enviada no coinciden con la cantidad total.`);
      }
    }

    if (Object.keys(newIncidences).length > 0) {
      setIncidences(newIncidences);
      setSnackbarMessage(`No se puede guardar el pedido debido a las siguientes incidencias:\n${errorMessages.join('\n')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const updatedItems = selectedPedido.items.map((item, index) => {
        if (editedItems[index]) {
          return editedItems[index];
        }
        return item;
      });

      const existingBahias = selectedPedido.ubi_bahia ? selectedPedido.ubi_bahia.split(', ') : [];
      const combinedBahias = [...new Set([...existingBahias, ...selectedBahias.map(b => b.bahia)])].join(', ');

      const updatedPedido = {
        ...selectedPedido,
        items: updatedItems,
        ubi_bahia: combinedBahias,
      };

      await axios.put(`http://192.168.3.225:3007/api/pedidos-surtidos/pedidos-surtido/${selectedPedido.id_pedi}`, updatedPedido);
      const updatedPedidos = pedidos.map(pedido =>
        pedido.id_pedi === selectedPedido.id_pedi ? { ...selectedPedido, items: updatedItems } : pedido
      );

      setPedidos(updatedPedidos);
      setFilteredPedidos(updatedPedidos);
      handleCloseModal();
      setSnackbarMessage('Pedido guardado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving pedido:', error);
      setSnackbarMessage('Error al guardar el pedido');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const updateAllBahias = async () => {
    try {
      const existingBahias = selectedPedido.ubi_bahia ? selectedPedido.ubi_bahia.split(', ') : [];
      const combinedBahias = [...new Set([...existingBahias, ...selectedBahias.map(b => b.bahia)])].join(', ');

      const response = await axios.put(`http://192.168.3.225:3007/api/pedidos-surtidos/pedidos-surtido/${selectedPedido.pedido}/bahias`, {
        ubi_bahia: combinedBahias // Asegúrate de que ubi_bahia se envía en el cuerpo de la solicitud
      });

      console.log(response.data);
      console.log("Datos:", combinedBahias);
      if (response.status === 200) {
        const updatedItems = selectedPedido.items.map(item => ({
          ...item,
          ubi_bahia: combinedBahias,
        }));

        const updatedPedidos = pedidos.map(pedido =>
          pedido.id_pedi === selectedPedido.id_pedi ? { ...selectedPedido, items: updatedItems } : pedido
        );

        setPedidos(updatedPedidos);
        setFilteredPedidos(updatedPedidos);
        handleCloseModal();
        setSnackbarMessage('Bahías actualizadas exitosamente');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error al actualizar bahías:', error);
      setSnackbarMessage('Error al actualizar las bahías');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const authorizePedido = async () => {
    const newIncidences = {};
    const errorMessages = [];

    for (let [index, item] of selectedPedido.items.entries()) {
      if (item.cant_surti > item.cantidad) {
        newIncidences[index] = 'El producto cuenta con cantidades surtidas de más.';
        errorMessages.push(`Producto ${item.codigo_ped}: Cantidad surtida (${item.cant_surti}) es mayor que la cantidad (${item.cantidad}).`);
      } else if ((item.cant_surti + item.cant_no_env) !== item.cantidad) {
        newIncidences[index] = 'La cantidad surtida y la cantidad no mandada no coinciden con la cantidad.';
        errorMessages.push(`Producto ${item.codigo_ped}: La suma de cantidad surtida (${item.cant_surti}) y cantidad no enviada (${item.cant_no_env}) no coincide con la cantidad (${item.cantidad}).`);
      }
    }

    if (Object.keys(newIncidences).length > 0) {
      setIncidences(newIncidences);
      setSnackbarMessage(`No se puede autorizar el pedido debido a las siguientes incidencias:\n${errorMessages.join('\n')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const updatedItems = selectedPedido.items.map(item => ({
        ...item,
        estado: 'E',
        cant_surti: item.cant_surti,
        cant_no_env: item.cant_no_env
      }));

      const updatedPedido = {
        ...selectedPedido,
        items: updatedItems,
      };

      await axios.put(`http://192.168.3.225:3007/api/pedidos-surtidos/pedidos-surtido/${selectedPedido.id_pedi}`, updatedPedido);
      const updatedPedidos = pedidos.map(pedido =>
        pedido.id_pedi === selectedPedido.id_pedi ? { ...selectedPedido, items: updatedItems } : pedido
      );

      setPedidos(updatedPedidos);
      setFilteredPedidos(updatedPedidos);
      handleCloseModal();
      setSnackbarMessage('Pedido autorizado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error autorizando pedido:', error);
      setSnackbarMessage('Error al autorizar el pedido');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const isPedidoSurtidoCorrectamente = (pedido) => {
    return pedido.items.every(item => item.estado === 'B' && item.cant_surti === item.cantidad);
  };

  const getButtonColor = (pedido) => {
    let color = 'inherit';
    const hasIncidencia = pedido.items.some(item => item.cant_no_env > 0);
    const hasCantidadMenor = pedido.items.some(item => item.cantidad < item._pz);
    const hasCarretillaEscoba = pedido.items.some(item => item.des && (item.des.includes('carretilla') || item.des.includes('escoba')));

    if (isPedidoSurtidoCorrectamente(pedido)) {
      color = 'success';
    } else if (hasIncidencia || hasCantidadMenor) {
      color = 'error';
    } else if (hasCarretillaEscoba) {
      color = 'info';
    }

    return color;
  };

  const renderActions = (params) => {
    const buttonColor = getButtonColor(params.row);

    if (params.row.items.some(item => item.estado === 'S')) {
      return (
        <IconButton color="primary" onClick={() => handleOpenModal(params.row, true, false)}>
          <EditIcon />
        </IconButton>
      );
    }

    return (
      <Button variant="contained" color={buttonColor} onClick={() => handleOpenModal(params.row, false, true)}>
        Autorización
      </Button>
    );
  };

  const columns = [
    { field: 'pedido', headerName: 'Pedido', width: 150 },
    { field: 'tipo', headerName: 'Tipo', width: 150 },
    { field: 'partidas', headerName: 'Partidas', width: 150 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 170,
      renderCell: renderActions,
    },
    { field: 'fecha_surtido', headerName: 'Fecha Surtido', width: 150 },
    { field: 'inicio_surtido', headerName: 'Inicio Surtido', width: 150 },
    { field: 'fin_surtido', headerName: 'Fin Surtido', width: 150 },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection="column">
        <Typography variant="h4" component="h2">
          Pedidos
        </Typography>
        <TextField
          label="Buscar"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mt: 2, mb: 2, width: '100%' }}
        />
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Button variant="contained" color="success" sx={{ mr: 1 }}>Surtido Correctamente</Button>
            <Button variant="contained" color="error" sx={{ mr: 1 }}>Incidencia Cant No Env</Button>
            <Button variant="contained" color="warning" sx={{ mr: 1 }}>Cantidad Menor a _pz</Button>
            <Button variant="contained" color="info">Carretilla o Escoba</Button>
          </Box>
        </Box>
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <div style={{  width: '100%', height: '100vh' }}>
            <DataGrid rows={filteredPedidos} columns={columns} pageSize={5} getRowId={(row) => row.id_pedi} />
          </div>
        </Paper>
      </Box>

      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80%', maxHeight: '80vh', bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, overflowY: 'auto'
        }}>
          {selectedPedido && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <img src="../assets/image/santul2.png" alt="Logo" style={{ width: 90, height: 90, marginRight: 16 }} />
                </Box>
                <Box flex={1} textAlign="center">
                  <Typography variant="h5">{selectedPedido.tipo} : {selectedPedido.pedido}</Typography>
                </Box>
                <Box>
                  <Typography variant="h5">Partidas: {selectedPedido.partidas}</Typography>
                  <Typography variant="h6">Bahía: {selectedPedido.ubi_bahia}</Typography>
                </Box>
              </Box>

              {isEditing && (
                <Box mb={2}>
                  <FormControl sx={{ minWidth: 300 }}>
                    <Autocomplete
                      multiple
                      options={bahias}
                      getOptionLabel={(option) => option.bahia}
                      filterSelectedOptions
                      value={selectedBahias}
                      onChange={(event, value) => setSelectedBahias(value)}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Bahías" placeholder="Seleccionar Bahías" />
                      )}
                    />
                  </FormControl>
                  <Button variant="contained" color="primary" onClick={updateAllBahias} sx={{ ml: 2 }}>
                    Actualizar Bahías
                  </Button>
                </Box>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Cant Surti</TableCell>
                      <TableCell>Cant No Enviado</TableCell>
                      {isEditing && (
                        <>
                          <TableCell>Ubicación</TableCell>
                          <TableCell>Estado</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPedido.items.map((item, index) => {
                      const isOrange = item.cantidad < item._pz;
                      const noUbi = !item.ubi;
                      const noEnv = item.cant_no_env !== 0;

                      return (
                        <Tooltip
                          key={index}
                          title={isOrange ? 'La cantidad a surtir de este producto es menor a la venta mínima' : noUbi ? 'El producto no tiene ubicación' : ''}
                          placement="top"
                        >
                          <TableRow style={{ backgroundColor: noEnv ? 'red' : noUbi ? 'red' : isOrange ? 'orange' : 'transparent' }}>
                            <>
                              <TableCell>{item.codigo_ped}</TableCell>
                              <TableCell>{item.des}</TableCell>
                              <TableCell>{item.cantidad}</TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  name="cant_surti"
                                  value={item.cant_surti}
                                  onChange={(event) => handleInputChange(event, index)}
                                  variant="outlined"
                                  type="number"
                                  disabled={!(isOrange || noUbi || item.cant_surti > item.cantidad)}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  name="cant_no_env"
                                  value={item.cant_no_env}
                                  onChange={(event) => handleInputChange(event, index)}
                                  variant="outlined"
                                  type="number"
                                  disabled={!(isOrange || noUbi)}
                                />
                              </TableCell>
                              {isEditing && (
                                <>
                                  <TableCell>{item.ubi}</TableCell>
                                  <TableCell>{item.estado}</TableCell>
                                </>
                              )}
                            </>
                          </TableRow>
                        </Tooltip>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {!isEditing && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color={getButtonColor(selectedPedido)} onClick={authorizePedido} disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} /> : 'Autorizar Pedido'}
                  </Button>
                </Box>
              )}
              {isEditing && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default EnSurtido;

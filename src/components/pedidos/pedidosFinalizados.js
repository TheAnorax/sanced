import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography, Box, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, TextField
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

function Finalizados() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://192.168.3.225:3007/api/finalizados/pedidos-finalizados');
        const dataWithFormattedTimes = response.data.map(pedido => ({
          ...pedido,
          inicio_surtido: new Date(pedido.inicio_surtido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin_surtido: new Date(pedido.fin_surtido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fecha_surtido: new Date(pedido.fecha_surtido).toLocaleDateString(),
        }));
        setPedidos(dataWithFormattedTimes);
        setFilteredPedidos(dataWithFormattedTimes);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    fetchPedidos();
  }, []);

  const handleOpenModal = (pedido) => {
    setSelectedPedido(pedido);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = pedidos.filter(pedido =>
      pedido.pedido.toString().includes(value) ||
      pedido.tipo.toLowerCase().includes(value) ||
      pedido.ubi_bahia.toLowerCase().includes(value)
    );
    setFilteredPedidos(filteredData);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pedidos Finalizados
      </Typography>
      <TextField
        label="Buscar Pedido"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pedido</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Partidas</TableCell>
              <TableCell>Fecha Surtido</TableCell>
              <TableCell>Inicio Surtido</TableCell>
              <TableCell>Fin Surtido</TableCell>
              <TableCell>Bahía</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPedidos.map((pedido) => (
              <TableRow key={pedido.id_pedi}>
                <TableCell>{pedido.pedido}</TableCell>
                <TableCell>{pedido.tipo}</TableCell>
                <TableCell>{pedido.partidas}</TableCell>
                <TableCell>{pedido.fecha_surtido}</TableCell>
                <TableCell>{pedido.inicio_surtido}</TableCell>
                <TableCell>{pedido.fin_surtido}</TableCell>
                <TableCell>{pedido.ubi_bahia}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenModal(pedido)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80%', maxHeight: '80vh', bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, overflowY: 'auto'
        }}>
          {selectedPedido && (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                Pedido {selectedPedido.pedido} - {selectedPedido.tipo}
              </Typography>
              <Typography variant="h6" component="h3" gutterBottom>
                Bahía: {selectedPedido.ubi_bahia}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Cant Surti</TableCell>
                      <TableCell>Cant No Enviado</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPedido.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.codigo_ped}</TableCell>
                        <TableCell>{item.des}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>{item.cant_surti}</TableCell>
                        <TableCell>{item.cant_no_env}</TableCell>
                        <TableCell>{item.ubi}</TableCell>
                        <TableCell>{item.estado}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={2}>
                <Button variant="contained" color="primary" onClick={handleCloseModal}>
                  Cerrar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default Finalizados;

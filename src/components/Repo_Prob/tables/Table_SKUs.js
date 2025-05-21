import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TablePagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Importamos el ícono de cierre
import axios from "axios"; // Asegúrate de instalar axios: npm install axios

const TableSku = ({ open, onClose, onSelectSku }) => {
  // Estados para manejar los datos y la interfaz
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]); // Datos originales de la API
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados para la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Llamada a la API para cargar los datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/repo_prob/sku-info"
        );
        const cleanedData = response.data.map((item) => ({
          codigo_pro: item.codigo_pro || "", // Aseguramos que siempre haya un string
          des: item.des || "", // Aseguramos que siempre haya un string
        }));

        setData(cleanedData);
        setFilteredData(cleanedData);
      } catch (error) {
        console.error("Error al obtener los datos de SKU:", error);
      }
    };

    fetchData();
  }, []);

  // Filtrar los datos según el término de búsqueda
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        (item.codigo_pro &&
          item.codigo_pro.toLowerCase().includes(searchTerm.toLowerCase())) || // Filtrar por código
        (item.des && item.des.toLowerCase().includes(searchTerm.toLowerCase())) // Filtrar por descripción
    );
    setFilteredData(filtered);
    setPage(0); // Reinicia la paginación al buscar
  }, [searchTerm, data]);

  // Manejadores de eventos
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Aplicar paginación a los datos filtrados
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Seleccionar SKU
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Barra de búsqueda alineada a la izquierda */}
        <TextField
          label="Buscar SKU o descripción"
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: "40%", // Reducimos el ancho al 40% del contenedor
          }}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.codigo_pro}>
                  <TableCell>{item.codigo_pro}</TableCell>
                  <TableCell>{item.des}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        onSelectSku({
                          codigo_pro: item.codigo_pro,
                          des: item.des,
                        })
                      }
                    >
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TableSku;

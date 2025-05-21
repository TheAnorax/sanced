import React, { useState, useEffect } from "react";
import { TextField, Box, Typography, Paper, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReportDialog from "../dialogs/Report_Dialog";

// URL del backend
const API_URL = "http://66.232.105.87:3007/api/repo_prob/repo-info";

const TableProb = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]); // Estado para los datos obtenidos del backend
  const [filteredData, setFilteredData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Pendiente"); // Estado inicial para estatus

  // Función para obtener los datos del backend
  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Error al obtener los datos del backend");
      }
      const result = await response.json();
      setData(result); // Guardar los datos en el estado
      setFilteredData(result); // Inicializar los datos filtrados
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  // Llamar a la función fetchData cuando el componente se monta
  useEffect(() => {
    fetchData();
  }, []);

  // Manejar el cambio en el campo de búsqueda
  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = data.filter(
      (item) =>
        item.area.toLowerCase().includes(value) ||
        item.motivo.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleDeleteRow = async (id) => {
  const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este reporte?");
  if (!confirmDelete) return;

  try {
    // Asegúrate de enviar el ID como parámetro de consulta
    const response = await fetch(`http://66.232.105.87:3007/api/repo_prob/delete-report?id=${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);

      // Actualizar la tabla eliminando el registro localmente
      const updatedData = filteredData.filter((row) => row.id_rep !== id);
      setFilteredData(updatedData);
      setData(updatedData); // También actualizamos el estado general
    } else {
      const errorMessage = await response.json();
      console.error("Error al eliminar el reporte:", errorMessage);
      alert("Error al eliminar el reporte: " + (errorMessage.message || "Error desconocido"));
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    alert("No se pudo conectar con el servidor.");
  }
};


  const handleViewReport = (report) => {
    setSelectedReport(report); // Guardar el reporte seleccionado
    setSelectedStatus(report.estatus || "Pendiente"); // Actualizar el estatus
    setOpenDialog(true); // Abrir el diálogo
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completado":
        return { color: "green", fontWeight: "bold" };
      case "Pendiente":
        return { color: "blue", fontWeight: "bold" };
      case "En Proceso":
        return { color: "orange", fontWeight: "bold" };
      default:
        return {};
    }
  };

  const columns = [
    { field: "motivo", headerName: "Motivo", width: 150 },
    { field: "area", headerName: "Área", width: 150 },
    { field: "encargado", headerName: "Encargado", width: 150 },
    { field: "remitente", headerName: "Remitente", width: 150 },
    {
      field: "estatus",
      headerName: "Estatus",
      width: 150,
      renderCell: (params) => (
        <span style={getStatusStyle(params.value)}>{params.value}</span>
      ),
    },
    { field: "fecha", headerName: "Fecha", width: 100 },
    { field: "hora", headerName: "Hora", width: 100 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            gap: 1,
          }}
        >
          {/* Ícono de visualización */}
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleViewReport(params.row)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>

          {/* Ícono de eliminación */}
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteRow(params.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      {/* Barra de búsqueda */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>
          Buscar reporte por área o motivo
        </Typography>
        <TextField
          label="Buscar por área o motivo"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>

      {/* Tabla */}
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          checkboxSelection={false}
          hideFooterSelectedRowCount
          getRowId={(row) => row.id_rep} // Aquí especificamos que `id_rep` es el identificador único
        />
      </Paper>

      {/* Diálogo para mostrar la información del reporte */}
      <ReportDialog
        open={openDialog}
        onClose={handleCloseDialog}
        selectedReport={selectedReport}
        selectedStatus={selectedStatus}
        handleStatusChange={(status) => setSelectedStatus(status)} // Pasar la función como prop
      />
    </Box>
  );
};

export default TableProb;

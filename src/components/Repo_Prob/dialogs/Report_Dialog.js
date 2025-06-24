import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Función para obtener estilos según el estatus
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

const ReportDialog = ({
  open,
  onClose,
  selectedReport,
  selectedStatus,
  handleStatusChange,
}) => {
  // Función para manejar el clic en "Actualizar Estatus"
  const handleUpdateStatus = async () => {
    if (selectedReport) {
      const updatedData = {
        id: selectedReport.id_rep, // ID del reporte
        newStatus: selectedStatus, // Nuevo estado seleccionado
      };

      try {
        const response = await fetch(
          "http://66.232.105.87:3007/api/repo_prob/update-status",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("Respuesta del servidor:", result.message);
        } else {
          console.error("Error al actualizar el estatus");
          alert("Estatus actualizado correctamente");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("No se pudo conectar con el servidor.");
      }
    } else {
      console.error("No se seleccionó ningún reporte.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        Información del Reporte
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {selectedReport && (
          <Box sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", marginBottom: 2 }}
                  >
                    Info del Área
                  </Typography>
                  <Box
                    sx={{ borderBottom: "2px solid red", marginBottom: 2 }}
                  />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 2,
                    }}
                  >
                    <Typography>
                      <strong>Motivo:</strong> {selectedReport.motivo}
                    </Typography>
                    <Typography>
                      <strong>Área:</strong> {selectedReport.area}
                    </Typography>
                    <Typography>
                      <strong>Encargado:</strong> {selectedReport.encargado}
                    </Typography>
                    {selectedReport.sku && (
                      <Typography>
                        <strong>SKU:</strong> {selectedReport.sku}
                      </Typography>
                    )}
                    {selectedReport.desc_sku && (
                      <Typography>
                        <strong>Descripción SKU:</strong>{" "}
                        {selectedReport.desc_sku}
                      </Typography>
                    )}
                    {selectedReport.no_pedido && (
                      <Typography>
                        <strong>No Pedido:</strong> {selectedReport.no_pedido}
                      </Typography>
                    )}
                    {selectedReport.turno && (
                      <Typography>
                        <strong>Turno:</strong> {selectedReport.turno}
                      </Typography>
                    )}
                    {selectedReport.pzs && (
                      <Typography>
                        <strong>No Piezas:</strong> {selectedReport.pzs}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", marginBottom: 2 }}
                  >
                    Descripción del problema
                  </Typography>
                  <Box
                    sx={{ borderBottom: "2px solid red", marginBottom: 2 }}
                  />
                  <Typography>{selectedReport.desc_prob}</Typography>
                </Box>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Detalles del reporte
                </Typography>
                <Box sx={{ borderBottom: "2px solid red", marginBottom: 2 }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                  }}
                >
                  <Typography>
                    <strong>Remitente:</strong> {selectedReport.remitente}
                  </Typography>
                  <Typography>
                    <strong>Hora:</strong> {selectedReport.hora}
                  </Typography>
                  <Typography>
                    <strong>Fecha:</strong> {selectedReport.fecha}
                  </Typography>
                  <Typography>
                    <strong>Estatus:</strong>{" "}
                    <span style={getStatusStyle(selectedStatus)}>
                      {selectedStatus}
                    </span>
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <List
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 0.5,
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {["Completado", "Pendiente", "En Proceso"].map((status) => (
                    <ListItem
                      key={status}
                      disablePadding
                      sx={{ width: "auto" }}
                    >
                      <ListItemButton
                        selected={selectedStatus === status}
                        onClick={() => handleStatusChange(status)} // Llama a la función pasada como prop
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: "rgba(0, 123, 255, 0.1)",
                            color: "blue",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                          },
                          borderRadius: 1,
                        }}
                      >
                        <ListItemText primary={status} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ height: "fit-content" }}
                  onClick={handleUpdateStatus} // Llama a la función al hacer clic
                >
                  Actualizar Estatus
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;

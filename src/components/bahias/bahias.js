import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";

function Bahias() {
  const [bahias, setBahias] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBahia, setSelectedBahia] = useState(null);

  const fetchBahias = () => {
    fetch("http://66.232.105.87:3007/api/bahias/bahias")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setBahias(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bahias:", error);
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBahias();

    const interval = setInterval(fetchBahias, 9000);

    return () => clearInterval(interval);
  }, []);

  const handleClickOpen = (bahia) => {
    // Bloquear el evento de click si la bahía comienza con "B" o "C"
    if (/^B-/.test(bahia.bahia)) {
      Swal.fire(
        "Error",
        "Esta bahía está bloqueada y no se puede liberar.",
        "error"
      );
      return; // No continuar con la liberación si está bloqueada
    }

    if (bahia.estado && bahia.id_pdi) {
      setSelectedBahia(bahia);
      Swal.fire({
        title: "¿Deseas liberar esta ubicación? ",
        html: `Bahia: ${bahia.bahia} <br /> Con el pedido: ${bahia.id_pdi}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          handleConfirm(bahia);
        }
      });
    }
  };

  const handleConfirm = (bahia) => {
    fetch(`http://66.232.105.87:3007/api/bahias/liberar/${bahia.id_bahia}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado: null, id_pdi: null }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Actualizar la bahía localmente
        setBahias((prevBahias) => {
          const updatedBahias = { ...prevBahias };
          const letter = bahia.bahia.charAt(0);
          updatedBahias[letter] = updatedBahias[letter].map((b) =>
            b.id_bahia === bahia.id_bahia
              ? { ...b, estado: null, id_pdi: null }
              : b
          );
          return updatedBahias;
        });
        Swal.fire("Liberado!", "La ubicación ha sido liberada.", "success");
      })
      .catch((error) => {
        console.error("Error updating bahia:", error);
        Swal.fire(
          "Error!",
          "Hubo un problema al liberar la ubicación.",
          "error"
        );
      });
  };

  const getCardStyle = (bahia) => {
    // Bloquear y aplicar estilo gris si la bahía comienza con "B" o "C"
    // if (/^B-/.test(bahia.bahia)) {
    //   return { backgroundColor: 'lightgray', color: 'darkgray', cursor: 'not-allowed' };
    // }
    // Estilo según el estado
    if (bahia.estado === 1 && bahia.id_pdi === null) {
      return { backgroundColor: "#2196f3", color: "white" };
    } else if (bahia.estado === 1 && bahia.id_pdi !== null) {
      return { backgroundColor: "red", color: "white" };
    } else if (bahia.estado === 2 && bahia.id_pdi !== null) {
      return { backgroundColor: "orange", color: "white" };
    } else if (bahia.estado === 3 && bahia.id_pdi !== null) {
      return { backgroundColor: "green", color: "white" };
    } else if (
      (bahia.estado === 3 || bahia.estado === 4) &&
      bahia.id_pdi !== null
    ) {
      return { backgroundColor: "green", color: "white" };
    } else {
      return {};
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto", padding: 2 }}>
      <Typography variant="h2" gutterBottom>
        Bahías
      </Typography>
      <center>
        <Grid container spacing={1} justifyContent="center">
          {Object.keys(bahias)
            .sort()
            .map((letter) => (
              <Grid item key={letter}>
                <Typography
                  variant="h5"
                  component="div"
                  gutterBottom
                  align="center"
                >
                  <center>{letter}</center>
                </Typography>
                <Grid
                  container
                  direction="column"
                  alignItems="center"
                  spacing={1}
                >
                  {bahias[letter].map((bahia) => (
                    <Grid item key={bahia.id_bahia}>
                      <Card
                        style={{
                          width: 100,
                          height: 100,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative", // necesario para el distintivo
                          ...getCardStyle(bahia),
                        }}
                        onClick={() => handleClickOpen(bahia)}
                      >
                        {bahia.estado === 4 && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 80,
                              right: 6,
                              backgroundColor: "black",
                              color: "white",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              fontSize: "0.7em",
                              zIndex: 10,
                            }}
                          >
                            REUBICADO
                          </Box>
                        )}

                        <CardContent style={{ textAlign: "center" }}>
                          <Typography
                            variant="body2"
                            component="div"
                            style={{ fontSize: "1em" }}
                          >
                            {bahia.bahia}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            style={{ fontSize: "1em" }}
                          >
                            {bahia.id_pdi || "N/A"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            style={{ fontSize: "1em" }}
                          >
                            {bahia.ingreso
                              ? new Date(bahia.ingreso).toLocaleDateString()
                              : "Sin Ingreso"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
        </Grid>
      </center>
    </Box>
  );
}

export default Bahias;

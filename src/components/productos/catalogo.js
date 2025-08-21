import React, { useEffect, useState, useContext} from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Modal,
  Button,
  Grid,
  Paper, 
  Stack,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  useMediaQuery,
  Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { DataGrid } from "@mui/x-data-grid";
import Barcode from "react-barcode";
import CancelIcon from "@mui/icons-material/Cancel";
import { UserContext } from "../context/UserContext";
const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 1300,
  maxHeight: "95vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: 24,
  p: 5,
};

const unidades = ["Pieza", "Inner", "Master"];

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [detalleProducto, setDetalleProducto] = useState(null);
  const [open, setOpen] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const { user } = useContext(UserContext);
  const [alerta, setAlerta] = useState({
    open: false,
    mensaje: "",
    tipo: "success",
  });
  const [search, setSearch] = useState("");
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [editandoImagenes, setEditandoImagenes] = useState(false);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState({});
  const baseURL = "https://sanced.santulconnect.com:3011"; // Puedes mover esto a un archivo config.js si gustas

  const [detalleOriginal, setDetalleOriginal] = useState(null);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:960px)");
  const [imagenZoom, setImagenZoom] = useState(null);

  const handleOpen = async (producto) => {
    setProductoSeleccionado(producto);
    setOpen(true);
    setCargandoDetalle(true);

    try {
      const res = await fetch(
        `http://66.232.105.87:3007/api/productos/catalogo-detall?codigo_pro=${producto.codigo_pro}`
      );
      const data = await res.json();
      setDetalleProducto(data);
      setDetalleOriginal(data); // guardar copia original
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const obtenerInventarioSantul = async () => {
    try {
      const response = await fetch(
        "http://santul.verpedidos.com:9010/Santul/Inventarios/",
        {
          method: "POST",
          body: JSON.stringify({ petición: "Inventario" }),
        }
      );
      const data = await response.json();

      // Convertir en objeto clave => cantidad
      const inventarioMap = {};
      data.forEach((item) => {
        inventarioMap[item.Clave] = item.Cant;
      });

      // Mezclar con productos
      setProductos((prev) =>
        prev.map((prod) => ({
          ...prod,
          cant_santul: inventarioMap[prod.codigo_pro] || "0",
        }))
      );
    } catch (error) {
      console.error("Error al obtener inventario Santul:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    filterProductos(e.target.value);
  };

  const filterProductos = (searchTerm) => {
    const filtered = productos.filter(
      (producto) =>
        (producto.des &&
          String(producto.des)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (producto.codigo_pro &&
          String(producto.codigo_pro)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (producto.code_pz &&
          String(producto.code_pz)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (producto.code_pq &&
          String(producto.code_pq)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (producto.code_master &&
          String(producto.code_master)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (producto.code_inner &&
          String(producto.code_inner)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (producto.code_palet &&
          String(producto.code_palet)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
    setFilteredProductos(filtered);
  };

  const handleClose = () => {
    setOpen(false);
    setDetalleProducto(null);
    setModoEdicion(false);
  };

  const handleEditarDatos = () => {
    setModoEdicion(true);
  };
  const handleCancelarEdicion = () => {
    setDetalleProducto(detalleOriginal);
    setModoEdicion(false);
  };

  const handleGuardarCambios = async () => {
  try {
    const payload = {
      ...detalleProducto,
      id_usuario: user.id_usu, // ⬅️ enviar el ID del usuario logeado
    };

    const res = await fetch(
      "http://66.232.105.87:3007/api/productos/catalogo-detall-update",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();

    setModoEdicion(false);
    setAlerta({
      open: true,
      mensaje: "¡Datos actualizados correctamente!",
      tipo: "success",
    });
  } catch (error) {
    console.error("Error al guardar:", error);
    setAlerta({
      open: true,
      mensaje: "Error al guardar los datos.",
      tipo: "error",
    });
  }
};


  const handleGuardarImagenes = async () => {
    const formData = new FormData();
    formData.append("codigo_pro", detalleProducto.codigo_pro);

    // Asegúrate de que `imagenesSeleccionadas` tenga claves como: pz, inner, master
    Object.entries(imagenesSeleccionadas).forEach(([unidad, archivo]) => {
      if (archivo) {
        const nombreArchivo = `${detalleProducto.codigo_pro}.jpg`;
        formData.append(`img_${unidad}`, archivo, nombreArchivo);
      }
    });

    try {
      const res = await fetch(
        "http://66.232.105.87:3007/api/productos/catalogo-detall-img",
        {
          method: "POST",
          body: formData, // ❗ NO agregues headers, fetch lo hace automáticamente
        }
      );

      if (res.ok) {
        setAlerta({
          open: true,
          mensaje: "Imágenes actualizadas correctamente",
          tipo: "success",
        });
        setEditandoImagenes(false);
        setImagenesSeleccionadas({});
      } else {
        throw new Error("Error al subir imágenes");
      }
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      setAlerta({
        open: true,
        mensaje: "Error al subir imágenes",
        tipo: "error",
      });
    }
  };

  useEffect(() => {
    const obtenerCatalogo = async () => {
      try {
        const response = await fetch(
          "http://66.232.105.87:3007/api/productos/catalogo"
        );
        const data = await response.json();
        const dataConId = data.map((item, index) => ({
          id: item.id_prod || index,
          ...item,
        }));
        setProductos(dataConId);
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      }
    };
    obtenerCatalogo().then(() => {
      obtenerInventarioSantul(); // ⬅ después de cargar productos
    });
  }, []);

  const columnas = [
    {
      field: "image",
      headerName: "Imagen",
      width: 100,
      renderCell: (params) => (
        <img
          src={`${baseURL}/imagenes/img_pz/${params.row.codigo_pro}.jpg`} // ✅ Nueva ruta externa
          alt="Producto"
          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${baseURL}/imagenes/img_pz/noimage.png`; // también redirige correctamente si falla
          }}
        />
      ),
    },
    { field: "codigo_pro", headerName: "Código" },
    { field: "clave", headerName: "clave" },
    { field: "des", headerName: "Descripción", width: 300 },
    { field: "_pz", headerName: "PZ", width: 70 },
    { field: "_inner", headerName: "Inner", width: 70 },
    { field: "_master", headerName: "Master", width: 80 },
    { field: "ubi", headerName: "Ubicacion", width: 150 },
    { field: "stock_almacen", headerName: "Almacenamiento", width: 100 },
    { field: "stock_picking", headerName: "Picking", width: 150 },
    { field: "stock_total", headerName: "Total", width: 100 },
    {
      field: "cant_santul",
      headerName: "Cant. Santul",
      width: 120,
    },

    {
      field: "acciones",
      headerName: "Acciones",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpen(params.row)}
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight="bold" mb={2}>
            Catálogo de Productos
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TextField
            label="Buscar"
            value={search}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{
              width: isSmallScreen ? "100%" : "300px",
              mb: isSmallScreen ? 2 : 0,
            }}
          />
          <Box sx={{ height: "auto", width: "100%", overflowX: "auto" }}>
            <DataGrid
              rows={search ? filteredProductos : productos}
              columns={columnas}
              autoHeight
              pageSize={20}
              rowsPerPageOptions={[10, 20, 50]}
              disableSelectionOnClick
              sx={{
                minWidth: 1000,
                borderRadius: 2,
                rowSpacing: 2, // <-- Espacio entre filas
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f0f2f5", // Fondo header más elegante
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#333",
                },
                "& .MuiDataGrid-cell": {
                  fontSize: "14px",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f9f9f9", // Efecto hover suave en filas
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ ...styleModal, position: "relative" }}>
          {/* Botón de cerrar */}
          <Button
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              minWidth: "auto",
              padding: 0,
              color: "gray",
            }}
          >
            ❌
          </Button>

          {cargandoDetalle ? (
            <Box textAlign="center">
              <CircularProgress />
              <Typography>Cargando datos del producto...</Typography>
            </Box>
          ) : detalleProducto ? (
            <>
              {/* Encabezado con código y descripción */}
              <Box
                mb={3}
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                textAlign="center"
              >
                <Typography variant="h6" fontWeight="bold">
                  {detalleProducto.codigo_pro} - {detalleProducto.des}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="center" mb={3}>
                <Stack direction="row" spacing={1}>
                  {modoEdicion ? (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        color="success"
                        onClick={handleGuardarCambios}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        color="error"
                        onClick={handleCancelarEdicion}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      color="primary"
                      onClick={handleEditarDatos}
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setEditandoImagenes(true)}
                  >
                    Editar Imágenes
                  </Button>

                  {editandoImagenes && (
                    <Box mt={3} textAlign="center">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleGuardarImagenes}
                      >
                        Subir Imágenes
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ ml: 2 }}
                        onClick={() => setEditandoImagenes(false)}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Grid container spacing={3}>
                {unidades.map((unidad) => {
                  const suffix =
                    unidad === "Pieza"
                      ? "pz"
                      : unidad === "Inner"
                      ? "inner"
                      : "master";

                  return (
                    <Grid item xs={12} md={4} key={unidad}>
                      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography
                          variant="h6"
                          mb={2}
                          align="center"
                          color="primary"
                        >
                           Unidad: {unidad === "Pieza" ? detalleProducto?.um || "Pieza" : unidad}
                        </Typography>

                        <Box display="flex" justifyContent="center" mb={2}>
                          {editandoImagenes ? (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setImagenesSeleccionadas((prev) => ({
                                  ...prev,
                                  [suffix]: file,
                                }));
                              }}
                            />
                          ) : (
                            // Puedes mover esto a un archivo config.js si gustas
                            <img
                              src={`https://sanced.santulconnect.com:3011/imagenes/img_${suffix}/${detalleProducto?.codigo_pro}.jpg`}
                              alt={`${unidad}`}
                              style={{
                                width: 120,
                                height: 120,
                                objectFit: "contain",
                                cursor: "zoom-in",
                              }}
                              onClick={() =>
                                setImagenZoom(
                                  `https://sanced.santulconnect.com:3011/imagenes/img_${suffix}/${detalleProducto?.codigo_pro}.jpg`
                                )
                              }
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://sanced.santulconnect.com:3011/imagenes/img_${suffix}/noimage.png`;
                              }}
                            />
                          )}
                        </Box>

                        {modoEdicion ? (
                          <TextField
                            label={`Código de Barras (${suffix})`}
                            fullWidth
                            size="small"
                            value={detalleProducto[`code_${suffix}`] || ""}
                            onChange={(e) =>
                              setDetalleProducto({
                                ...detalleProducto,
                                [`code_${suffix}`]: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <Box mb={2} display="flex" justifyContent="center">
                            <Barcode
                              value={
                                detalleProducto[`code_${suffix}`]?.toString() ||
                                ""
                              }
                              width={2}
                              height={60}
                              fontSize={16}
                              displayValue={true}
                            />
                          </Box>
                        )}

                        <Stack spacing={1} mt={2}>
                          <TextField
                            label="Cantidad"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={detalleProducto[`_${suffix}`] || ""}
                            onChange={(e) =>
                              setDetalleProducto({
                                ...detalleProducto,
                                [`_${suffix}`]: e.target.value,
                              })
                            }
                            disabled={!modoEdicion}
                          />

                          <Grid container spacing={1}>
                            {["largo", "ancho", "alto", "peso"].map((dim) => (
                              <Grid item xs={6} key={dim}>
                                <TextField
                                  label={`${
                                    dim.charAt(0).toUpperCase() + dim.slice(1)
                                  } (${dim === "peso" ? "kg" : "m"})`}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  value={
                                    detalleProducto[`${dim}_${suffix}`] || ""
                                  }
                                  onChange={(e) =>
                                    setDetalleProducto({
                                      ...detalleProducto,
                                      [`${dim}_${suffix}`]: e.target.value,
                                    })
                                  }
                                  disabled={!modoEdicion}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Sección de Volumetría */}
              <Box mt={5}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    Volumetría Tarima
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    color="primary"
                  >
                    Editar volumetría
                  </Button>
                </Box>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">
                        <strong>Cajas por cama:</strong> 25
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">
                        <strong>Piezas por cama:</strong> 250
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">
                        <strong>Cajas por tarima:</strong> 100
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">
                        <strong>Camas por tarima:</strong> 4
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">
                        <strong>Piezas por tarima:</strong> 1000
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </>
          ) : (
            <Typography color="error">
              No se pudo cargar el detalle del producto
            </Typography>
          )}
        </Box>
      </Modal>
      <Dialog
        open={!!imagenZoom}
        onClose={() => setImagenZoom(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            maxHeight: "90vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          },
        }}
      >
        <img
          src={imagenZoom}
          alt="Zoom"
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
      </Dialog>

      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.tipo}
          sx={{ width: "100%" }}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Catalogo;

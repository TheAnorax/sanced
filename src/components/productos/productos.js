import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Button,
  Grid,
  Paper,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tabs,
  Tab,
  Divider,
  Typography, 
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useMediaQuery, createTheme, ThemeProvider } from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Barcode from "react-barcode";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { UserContext } from "../context/UserContext";

const MySwal = withReactContent(Swal);

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 3px 6px rgba(0,0,0,0.16)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { marginBottom: "16px" },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          // Quita las flechitas en navegadores basados en Webkit (Chrome, Edge)
          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: 0,
          },
          // Quita las flechitas en Firefox
          "&[type=number]": {
            "-moz-appearance": "textfield",
          },
        },
      },
    },
  },
});

function ProductoCRUD() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const { user } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    codigo_pro: "",
    clave: "",
    inventario: 0,
    inv_m: 0,
    inv_i: 0,
    inv_p: 0,
    des: "",
    code_pz: "",
    code_pq: "",
    code_master: "",
    code_inner: "",
    code_palet: "",
    _pz: 0,
    _pq: 0,
    _inner: 0,
    _master: 0,
    _palet: 0,
    largo_pz: 0,
    largo_inner: 0,
    largo_master: 0,
    ancho_pz: 0,
    ancho_inner: 0,
    ancho_master: 0,
    alto_pz: 0,
    alto_inner: 0,
    alto_master: 0,
    peso_pz: 0,
    peso_inner: 0,
    peso_master: 0,
    img_pz: null,
    img_pq: null,
    img_inner: null,
    img_master: null,
  });
  const [ubicaciones, setUbicaciones] = useState([]);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [editId, setEditId] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [flyerData, setFlyerData] = useState(null); 

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:960px)");

  const fetchProductos = async () => {
    try {
      const response = await axios.get(
        "http://192.168.3.27:3007/api/productos"
      );
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  const [enteredQuantities, setEnteredQuantities] = useState({
    pieces: 0,
    inners: 0,
    masters: 0,
  });

  const fetchUbicaciones = async (codigo_pro) => {
    try {
      const response = await axios.get(
        `http://192.168.3.27:3007/api/productos/ubicaciones?codigo_pro=${codigo_pro}`
      );
      setUbicaciones(response.data);
    } catch (error) {
      console.error("Error fetching ubicaciones:", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    filterProductos(e.target.value);
  };

  const handleOpenCalculator = (product) => {
    setSelectedProduct(product);
    setCalculatorOpen(true);
  };

  useEffect(() => {
    console.log("Estado de calculatorOpen:", calculatorOpen);
    console.log("Producto seleccionado:", selectedProduct);
  }, [calculatorOpen, selectedProduct]);

  const handleCloseCalculator = () => {
    setCalculatorOpen(false);
    setSelectedProduct(null);
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (!!errors[e.target.name])
      setErrors({ ...errors, [e.target.name]: null });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = findFormErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const formData = new FormData();
        const userId = user?.id_usu; // Obtén el id del usuario logueado
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key]);
        });

        // Agregar el userId al formData
        if (userId) {
          formData.append("id_usu", userId); // Enviar el userId como parte de formData
        }

        if (editing) {
          handleClose(); // Cierra el modal primero
          const confirmUpdate = await MySwal.fire({
            title: "¿Estás seguro?",
            text: "¿Deseas actualizar este producto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, actualizar",
            customClass: {
              popup: "swal2-z-index-higher",
            },
          });
          if (confirmUpdate.isConfirmed) {
            await axios.put(
              `http://192.168.3.27:3007/api/productos/${editId}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            fetchProductos();
            MySwal.fire(
              "Actualizado",
              "El producto ha sido actualizado correctamente.",
              "success"
            );
          }
        } else {
          await axios.post(
            "http://192.168.3.27:3007/api/productos",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          fetchProductos();
          handleClose();
          MySwal.fire(
            "Guardado",
            "El producto ha sido guardado correctamente.",
            "success"
          );
        }
      } catch (error) {
        console.error("Error saving producto:", error);
        MySwal.fire("Error", "Hubo un problema guardando el producto", "error");
      }
    }
  };

  const findFormErrors = () => {
    const { codigo_pro, des } = form;
    const newErrors = {};
    if (!codigo_pro || codigo_pro === "")
      newErrors.codigo_pro = "El código es obligatorio";
    if (!des || des === "") newErrors.des = "La descripción es obligatoria";
    return newErrors;
  };

  // const handleView = async (producto) => {
  //   setForm(producto);
  //   setEditing(false);
  //   setReadOnly(true);
  //   setEditId(producto.id_prod);
  //   setOpen(true);
  //   await fetchUbicaciones(producto.codigo_pro);

  //   // Carga los datos de la volumetría para el Flyer
  //   try {
  //     const response = await axios.get(
  //       `http://192.168.3.27:3007/api/productos/volumetria?codigo_pro=${producto.codigo_pro}`
  //     );
  //     setFlyerData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching flyer data:", error);
  //     setFlyerData(null); // Limpia los datos en caso de error
  //   }
  // };

  const handleView = async (producto) => {
    setForm(producto);
    setEditing(false);
    setReadOnly(true);
    setEditId(producto.id_prod);
    setOpen(true);
  
    // Carga las ubicaciones
    await fetchUbicaciones(producto.codigo_pro);
  
    // Carga los datos de la volumetría para el Flyer
    try {
      const response = await axios.get(
        `http://192.168.3.27:3007/api/productos/volumetria?codigo_pro=${producto.codigo_pro}`
      );
      console.log("Datos de volumetría:", response.data); // Verifica los datos
      setFlyerData(response.data);
      console.log("datosfiktesxdxd",setFlyerData)
    } catch (error) {
      console.error("Error fetching flyer data:", error);
      setFlyerData(null);
    }
    
  };

  const handleDelete = async (id) => {
    const confirmDelete = await MySwal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      customClass: {
        popup: "swal2-z-index-higher",
      },
    });
    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://192.168.3.27:3007/api/productos/${id}`);
        fetchProductos();
        MySwal.fire("Eliminado", "El producto ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error deleting producto:", error);
        MySwal.fire(
          "Error",
          "Hubo un problema eliminando el producto",
          "error"
        );
      }
    }
  };

  const handleClickOpen = () => {
    setForm({
      codigo_pro: "",
      clave: "",
      inventario: 0,
      inv_m: 0,
      inv_i: 0,
      inv_p: 0,
      des: "",
      code_pz: "",
      code_pq: "",
      code_master: "",
      code_inner: "",
      code_palet: "",
      _pz: 0,
      _pq: 0,
      _inner: 0,
      _master: 0,
      _palet: 0,
      largo_pz: 0,
      largo_inner: 0,
      largo_master: 0,
      ancho_pz: 0,
      ancho_inner: 0,
      ancho_master: 0,
      alto_pz: 0,
      alto_inner: 0,
      alto_master: 0,
      peso_pz: 0,
      peso_inner: 0,
      peso_master: 0,
      img_pz: null,
      img_pq: null,
      img_inner: null,
      img_master: null,
    });
    setEditing(false);
    setReadOnly(false);
    setErrors({}); // Limpiar los errores al abrir el modal
    setUbicaciones([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({}); // Limpiar los errores al cerrar el modal
    setUbicaciones([]);
  };

  const enableEditing = () => {
    setReadOnly(false);
    setEditing(true);
  };

  const handleDownloadReport = () => {
    const ws = XLSX.utils.json_to_sheet(
      productos.map((producto, index) => ({
        Número: index + 1,
        Código: producto.codigo_pro,
        Descripción: producto.des,
        "Código de PIEZA": producto.code_pz,
        "Cantidad en PIEZA": producto._pz,
        "Código de PAQUETE": producto.code_pq,
        "Cantidad en PAQUETE": producto._pq,
        "Código de INNER": producto.code_inner,
        "Cantidad en INNER": producto._inner,
        "Código de MASTER": producto.code_master,
        "Cantidad en MASTER": producto._master,
        "Largo PZ": producto.largo_pz,
        "Largo INNER": producto.largo_inner,
        "Largo MASTER": producto.largo_master,
        "Ancho PZ": producto.ancho_pz,
        "Ancho INNER": producto.ancho_inner,
        "Ancho MASTER": producto.ancho_master,
        "Alto PZ": producto.alto_pz,
        "Alto INNER": producto.alto_inner,
        "Alto MASTER": producto.alto_master,
        "Peso PZ": producto.peso_pz,
        "Peso INNER": producto.peso_inner,
        "Peso MASTER": producto.peso_master,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const fecha = moment().format("YYYYMMDD-HHmmss");
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Productos-Santul-${fecha}.xlsx`);
  };

  const columns = isSmallScreen
    ? [
        { field: "codigo_pro", headerName: "Código", width: 150 },
        {
          field: "des",
          headerName: "Descripción",
          width: 150,
          renderCell: (params) => <span>{params.value.slice(0, 6)}</span>,
        },
        {
          field: "image",
          headerName: "Imagen",
          width: 100,
          renderCell: (params) => (
            <img
              src={`../assets/image/img_pz/${params.row.codigo_pro}.jpg`}
              alt="Producto"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../assets/image/img_pz/noimage.png";
              }}
            />
          ),
        },
        {
          field: "actions",
          headerName: "Actions",
          width: 150,
          renderCell: (params) => (
            <Box display="flex" gap={1}>
              <IconButton
                color="primary"
                onClick={() => handleView(params.row)}
              >
                <VisibilityIcon />
              </IconButton>
              <IconButton
                color="secondary"
                onClick={() => handleDelete(params.row.id_prod)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ),
        },
      ]
    : [
        {
          field: "image",
          headerName: "Imagen",
          width: 100,
          renderCell: (params) => (
            <img
              src={`../assets/image/img_pz/${params.row.codigo_pro}.jpg`}
              alt="Producto"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../assets/image/img_pz/noimage.png";
              }}
            />
          ),
        },
        { field: "codigo_pro", headerName: "Código", width: 100 },
        { field: "des", headerName: "Descripción", width: 300 },
        { field: "_pz", headerName: "PZ", width: 150 },
        { field: "_pq", headerName: "PQ", width: 150 },
        { field: "_inner", headerName: "Inner", width: 150 },
        { field: "_master", headerName: "Master", width: 150 },
        {
          field: "actions",
          headerName: "Actions",
          width: 150,
          renderCell: (params) => {
            return (
              <Box display="flex" gap={1}>
                <IconButton
                  color="primary"
                  onClick={() => handleView(params.row)}
                >
                  <VisibilityIcon />
                </IconButton>
                {user?.role === "Admin" && (
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(params.row.id_prod)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            );
          },
        },
      ];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexDirection={isSmallScreen ? "column" : "row"}
      >
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
        <Box display="flex" gap={2}>
          {user?.role === "Admin" && ( // Mostrar sólo si el usuario tiene rol Admin
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
            >
              Crear Producto
            </Button>
          )}
          <Button
            variant="contained"
            style={{ backgroundColor: "green", color: "white" }}
            startIcon={<SimCardDownloadIcon />}
            onClick={handleDownloadReport}
          >
            Descargar Reporte
          </Button>
        </Box>
      </Box>
      <Paper elevation={3} sx={{ p: 3, overflow: "auto" }}>
        <div style={{ height: isMediumScreen ? 500 : 750, width: "100%" }}>
          <DataGrid
            rows={filteredProductos}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row.id_prod}
          />
        </div>
      </Paper>
      <Dialog
        open={calculatorOpen}
        onClose={handleCloseCalculator}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Calcular Total por Unidades</DialogTitle>
        <DialogContent>
          {selectedProduct ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">
                Producto: {selectedProduct.des}
              </Typography>
              <TextField
                label="Cantidad de PIEZAS"
                type="number"
                defaultValue={selectedProduct._pz}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    _pz: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
              <TextField
                label="Cantidad de INNER"
                type="number"
                defaultValue={selectedProduct._inner}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    _inner: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
              <TextField
                label="Cantidad de MASTER"
                type="number"
                defaultValue={selectedProduct._master}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    _master: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
              <TextField
                label="Cantidad de PIEZAS"
                type="number"
                value={enteredQuantities.pieces}
                onChange={(e) =>
                  setEnteredQuantities((prev) => ({
                    ...prev,
                    pieces: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
              <TextField
                label="Cantidad de INNER"
                type="number"
                value={enteredQuantities.inners}
                onChange={(e) =>
                  setEnteredQuantities((prev) => ({
                    ...prev,
                    inners: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
              <TextField
                label="Cantidad de MASTER"
                type="number"
                value={enteredQuantities.masters}
                onChange={(e) =>
                  setEnteredQuantities((prev) => ({
                    ...prev,
                    masters: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </Box>
          ) : (
            <Typography variant="body1">
              Cargando datos del producto...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCalculator} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {readOnly
            ? "Vista de Producto"
            : editing
            ? "Editar Producto"
            : "Crear Producto"}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Volumetría" />
            <Tab label="Flyer" />
            <Tab label="Ficha Técnica" />
            <Tab label="Ficha Comercial" />
          </Tabs>
          {tabIndex === 0 && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6} sm={6}>
                  <TextField
                    fullWidth
                    label="Código"
                    name="codigo_pro"
                    value={form.codigo_pro}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!errors.codigo_pro}
                    helperText={errors.codigo_pro}
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Ubicación"
                    value={
                      ubicaciones.length > 0
                        ? ubicaciones
                            .map((ubicacion) => ubicacion.ubi)
                            .join(", ")
                        : "Sin ubicación"
                    }
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="des"
                    value={form.des}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!errors.des}
                    helperText={errors.des}
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Garantia"
                    name="garantia"
                    value={form.garantia}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!errors.garantia}
                    helperText={errors.garantia}
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Divider>
                    <Typography variant="h6">PIEZA</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6} width={150} height={70}>
                  {readOnly ? (
                    form.img_pz ? (
                      <img
                        src={`../assets/image/img_pz/${form.img_pz}`}
                        alt="Producto"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    ) : (
                      <img
                        src="../assets/image/img_pz/noimage.png"
                        alt="Sin imagen"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Imagen de PIEZA"
                      name="img_pz"
                      type="file"
                      onChange={handleImageChange}
                      variant="outlined"
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={6} mt={2}>
                  <TextField
                    fullWidth
                    label="Cantidad en PIEZA"
                    name="_pz"
                    value={form._pz}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Largo PZ"
                    name="largo_pz"
                    value={form.largo_pz}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Ancho PZ"
                    name="ancho_pz"
                    value={form.ancho_pz}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Alto PZ"
                    name="alto_pz"
                    value={form.alto_pz}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Peso PZ"
                    name="peso_pz"
                    value={form.peso_pz}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  width={150}
                  height={70}
                  marginLeft={6}
                  mb={5}
                >
                  {readOnly ? (
                    form.code_pz ? (
                      <Barcode value={form.code_pz} />
                    ) : (
                      <Box width={266} height={142}>
                        Sin código
                      </Box>
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Código de barras de PIEZA"
                      name="code_pz"
                      value={form.code_pz}
                      onChange={handleChange}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={12} mt={4}>
                  <Divider>
                    <Typography variant="h6">PAQUETE</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6} width={150} height={70}>
                  {readOnly ? (
                    form.img_pq ? (
                      <img
                        src={`../assets/image/img_pq/${form.img_pq}`}
                        alt="Producto"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    ) : (
                      <img
                        src="../assets/image/img_pz/noimage.png"
                        alt="Sin imagen"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Imagen de PAQUETE"
                      name="img_pq"
                      type="file"
                      onChange={handleImageChange}
                      variant="outlined"
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6} mt={2}>
                  <TextField
                    fullWidth
                    label="Cantidad en PAQUETE"
                    name="_pq"
                    value={form._pq}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Largo PQ"
                    name="largo_pq"
                    value={form.largo_pq}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Ancho PQ"
                    name="ancho_pq"
                    value={form.ancho_pq}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Alto PQ"
                    name="alto_pq"
                    value={form.alto_pq}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Peso PQ"
                    name="peso_pq"
                    value={form.peso_pq}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  width={150}
                  height={70}
                  marginLeft={6}
                  mb={5}
                >
                  {readOnly ? (
                    form.code_pq ? (
                      <Barcode value={form.code_pq} />
                    ) : (
                      <Box width={266} height={142} marginLeft={12}>
                        Sin código
                      </Box>
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Código de barras de PAQUETE"
                      name="code_pq"
                      value={form.code_pq}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={12} mt={4}>
                  <Divider>
                    <Typography variant="h6">INNER</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6} width={150} height={70}>
                  {readOnly ? (
                    form.img_inner ? (
                      <img
                        src={`../assets/image/img_inner/${form.img_inner}`}
                        alt="Producto"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    ) : (
                      <img
                        src="../assets/image/img_pz/noimage.png"
                        alt="Sin imagen"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Imagen de INNER"
                      name="img_inner"
                      type="file"
                      onChange={handleImageChange}
                      variant="outlined"
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6} mt={2}>
                  <TextField
                    fullWidth
                    label="Cantidad en INNER"
                    name="_inner"
                    value={form._inner}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Largo INNER"
                    name="largo_inner"
                    value={form.largo_inner}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Ancho INNER"
                    name="ancho_inner"
                    value={form.ancho_inner}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Alto INNER"
                    name="alto_inner"
                    value={form.alto_inner}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Peso INNER"
                    name="peso_inner"
                    value={form.peso_inner}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  width={150}
                  height={70}
                  marginLeft={6}
                  mb={5}
                >
                  {readOnly ? (
                    form.code_inner ? (
                      <Barcode value={form.code_inner} />
                    ) : (
                      <Box width={266} height={142}>
                        Sin código
                      </Box>
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Código de barras de Inner"
                      name="code_inner"
                      value={form.code_inner}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={12} mt={4}>
                  <Divider>
                    <Typography variant="h6">MASTER</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6} width={150} height={70}>
                  {readOnly ? (
                    form.img_master ? (
                      <img
                        src={`../assets/image/img_master/${form.img_master}`}
                        alt="Producto"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    ) : (
                      <img
                        src="../assets/image/img_pz/noimage.png"
                        alt="Sin imagen"
                        style={{
                          width: "250px",
                          height: "250px",
                          marginLeft: "55px",
                        }}
                      />
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Imagen de MASTER"
                      name="img_master"
                      type="file"
                      onChange={handleImageChange}
                      variant="outlined"
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6} mt={2}>
                  <TextField
                    fullWidth
                    label="Cantidad en MASTER"
                    name="_master"
                    value={form._master}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                    inputProps={{
                      style: { appearance: "textfield" },
                      inputMode: "numeric",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Largo MASTER"
                    name="largo_master"
                    value={form.largo_master}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Ancho MASTER"
                    name="ancho_master"
                    value={form.ancho_master}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Alto MASTER"
                    name="alto_master"
                    value={form.alto_master}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Peso MASTER"
                    name="peso_master"
                    value={form.peso_master}
                    onChange={handleChange}
                    variant="outlined"
                    type="number"
                    InputProps={{
                      readOnly: readOnly,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  width={150}
                  height={70}
                  marginLeft={6}
                  mb={5}
                >
                  {readOnly ? (
                    form.code_master ? (
                      <Barcode value={form.code_master} />
                    ) : (
                      <Box width={266} height={142}>
                        Sin código
                      </Box>
                    )
                  ) : (
                    <TextField
                      fullWidth
                      label="Código de barras de Master"
                      name="code_master"
                      value={form.code_master}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  )}
                </Grid>
                {/* Fin Nuevos Campos */}

                {/* Datos de volumetría debajo de los campos de MASTER */}
      <Grid item xs={12} sm={12} mt={20}>
        <Divider>
          <Typography variant="h6">Volumetría del Producto</Typography>
        </Divider>
      </Grid>
      {flyerData && flyerData.length > 0 ? (
  <>
    <Grid item xs={6}>
      <Typography variant="body1">
        <strong>Piezas por Caja:</strong> {flyerData[0].pieza_caja}
      </Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body1">
        <strong>Cajas por Tarima:</strong> {flyerData[0].cajas_tarima}
      </Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body1">
        <strong>Camas por Tarima:</strong> {flyerData[0].camas_tarima}
      </Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body1">
        <strong>Piezas por Tarima:</strong> {flyerData[0].pieza_tarima}
      </Typography>
    </Grid>
  </>
) : (
  <Grid item xs={12}>
    <Typography variant="body2">
      Cargando datos de volumetría o no disponibles.
    </Typography>
  </Grid>
)}

              </Grid>
              <DialogActions>
                {readOnly && user?.role === "Admin" && (
                  <Button onClick={enableEditing} color="primary">
                    Editar
                  </Button>
                )}

                <Button onClick={handleClose} color="primary">
                  Cancelar
                </Button>
                {!readOnly && (
                  <Button type="submit" color="primary">
                    {editing ? "Actualizar" : "Crear"}
                  </Button>
                )}
              </DialogActions>
            </form>
          )}
       {tabIndex === 1 && <div>Contenido de Ficha Técnica</div>}

          {tabIndex === 2 && <div>Contenido de Ficha Técnica</div>}
          {tabIndex === 3 && <div>Contenido de Ficha Comercial</div>}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default ProductoCRUD;

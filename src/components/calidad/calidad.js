import axios from "axios";
import CloseIcon from '@mui/icons-material/Close';
import Swal from "sweetalert2";
import { UserContext } from '../context/UserContext';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Button, Dialog, IconButton,DialogContent, DialogActions, TextField, DialogTitle, Box, Divider, Grid, FormControlLabel, Checkbox} from "@mui/material";
import React, { useState, useEffect, useContext } from "react";

function Calidad({ onCloseModal }) {
  const [productoDetalles, setProductoDetalles] = useState(null);
  const [open, setOpen] = useState(false);
  const [openInsertModal, setOpenInsertModal] = useState(false); // Estado para el modal de inserción
  const [openInactiveModal, setOpenInactiveModal] = useState(false); // Estado para el modal de productos inactivos
  const [inactiveProducts, setInactiveProducts] = useState([]); // Estado para almacenar los productos inactivos
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [datosCalidad, setDatosCalidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { user } = useContext(UserContext);
  const [readOnlyStates, setReadOnlyStates] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionAllChecked, setSectionAllChecked] = useState({});
  const [searchCode, setSearchCode] = useState(""); // Estado para el código de búsqueda


  const sections = [
    {
      title: "Información General del Producto",
      fields: ["inventario", "garantia", "des", "code_pz", "code_pq", "_pq"],
    },
    {
      title: "Unidad (Pieza)",
      fields: ["_pz", "peso_pz", "largo_pz", "ancho_pz", "alto_pz"],
    },
    {
      title: "Inner",
      fields: ["code_inner", "_inner", "peso_inner", "largo_inner", "ancho_inner", "alto_inner"],
    },
    {
      title: "Master",
      fields: ["code_master", "_master", "peso_master", "largo_master", "ancho_master", "alto_master"],
    },
  ];


  const handleCheckboxChange = (field) => {
    setReadOnlyStates((prevStates) => ({
      ...prevStates,
      [field]: !prevStates[field],
    }));
  };

  const fetchCalidadData = async () => {
    try {
      const response = await axios.get("http://192.168.3.154:3007/api/calidad/calidad");
      setDatosCalidad(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de calidad:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutorizar = async (recibo) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas autorizar el producto con Código: ${recibo.codigo}, O.C.: ${recibo.oc},--------- Cantidad: ${recibo.cantidad_recibida} y Fecha Recibo: ${recibo.fecha_recibo}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, autorizar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put("http://192.168.3.154:3007/api/calidad/calidad/autorizar", {
            codigo: recibo.codigo,
            oc: recibo.oc,
            cantidad_recibida: recibo.cantidad_recibida,
            fecha_recibo: recibo.fecha_recibo,
            userId: user.id_usu,
            id_recibo_compras: recibo.id_recibo_compras,
            
          });
          Swal.fire("¡Autorizado!", "El producto ha sido autorizado.", "success").then(() => {
            fetchCalidadData();
          });
        } catch (error) {
          console.error("Error al autorizar el producto:", error);
          Swal.fire("Error", "Hubo un error al autorizar el producto.", "error");
        }}
    });
  };

  const handleCuarentena = async (recibo) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas mandar el producto con Código: ${recibo.codigo} a cuarentena?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, mandar a cuarentena",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put("http://192.168.3.154:3007/api/calidad/calidad/cuarentena", {
            codigo: recibo.codigo,
            oc: recibo.oc,
            cantidad_recibida: recibo.cantidad_recibida,
            fecha_recibo: recibo.fecha_recibo,
            userId: user.id_usu,
          });
          Swal.fire("¡En Cuarentena!", "El producto ha sido enviado a cuarentena.", "success").then(() => {
            fetchCalidadData();
          });
        } catch (error) {
          console.error("Error al mandar el producto a cuarentena:", error);
          Swal.fire("Error", "Hubo un error al mandar el producto a cuarentena.", "error");
        }
      }
    });
  };

  const handleSegundas = async (recibo) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas mandar el producto con Código: ${recibo.codigo} a Segundas?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, mandar a Segundas",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put("http://192.168.3.154:3007/api/calidad/calidad/segundas", {
            codigo: recibo.codigo,
            oc: recibo.oc,
            cantidad_recibida: recibo.cantidad_recibida,
            fecha_recibo: recibo.fecha_recibo,
            userId: user.id_usu,
          });
          Swal.fire("¡En Segundas!", "El producto ha sido enviado a Segundas.", "success").then(() => {
            fetchCalidadData();
          });
        } catch (error) {
          console.error("Error al mandar el producto a Segundas:", error);
          Swal.fire("Error", "Hubo un error al mandar el producto a Segundas.", "error");
        }
      }
    });
  };

  const fetchProductoDetalles = async (codigo) => {
    setLoading(true);
    try {
      const response = await axios.post("http://192.168.3.154:3007/api/calidad/calidad/codigo", { codigo_pro: codigo });
      setProductoDetalles(response.data);
    } catch (error) {
      console.error("Error al obtener los detalles del producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put("http://192.168.3.154:3007/api/calidad/calidad/updatecodigo", {
        ...productoDetalles,
        codigo_pro: selectedProducto.codigo,
      });
      Swal.fire("Actualizado", "Producto actualizado correctamente.", "success");
      setEditMode(false);
      fetchCalidadData();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      Swal.fire("Error", "Hubo un error al actualizar el producto.", "error");
    }
  };

  const handleOpenModal = (producto) => {
    setSelectedProducto(producto);
    setOpen(true);
    fetchProductoDetalles(producto.codigo);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedProducto(null);
    setProductoDetalles(null);
    setEditMode(false);

    if (currentSection >= sections.length) {
      // Reiniciar el formulario si todas las secciones están completas
      setReadOnlyStates({});
      setSectionAllChecked({});
      setCurrentSection(0);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const isSectionComplete = (section) => {
    return section.fields.every((field) => readOnlyStates[field]);
  };

  const handleContinue = () => {
    if (isSectionComplete(sections[currentSection])) {
      setCurrentSection((prevSection) => prevSection + 1);
    }
  };

  const handleSelectAllChange = (section) => {
    const allChecked = !sectionAllChecked[section.title];
    const updatedStates = {};

    section.fields.forEach((field) => {
      updatedStates[field] = allChecked;
    });

    setReadOnlyStates((prevStates) => ({ ...prevStates, ...updatedStates }));
    setSectionAllChecked((prev) => ({ ...prev, [section.title]: allChecked }));
  };

  const handleInsertProduct = () => {
    setOpenInsertModal(true);
    setProductoDetalles(null);
    setSearchCode("");
  };

  const handleSearchProduct = async (e) => {
    if (e.key === "Enter" && searchCode.trim() !== "") {
      try {
        const response = await axios.post("http://192.168.3.154:3007/api/calidad/calidad/codigo", { codigo_pro: searchCode });
        setProductoDetalles(response.data);
      } catch (error) {
        console.error("Error al buscar el producto:", error);
        Swal.fire("Error", "No se encontró el producto o hubo un error en la búsqueda.", "error");
      }
    }
  };

  const handleSaveNewProduct = async () => {
    try {
      const response = await axios.post("http://192.168.3.154:3007/api/calidad/calidad/insertarBuscar", {
        ...productoDetalles,
        codigo_pro: searchCode // Asegúrate de que `searchCode` sea un string o un número aquí
      });
      Swal.fire("Producto Insertado", "El nuevo producto ha sido insertado correctamente.", "success");
      setOpenInsertModal(false);
      fetchCalidadData();
    } catch (error) {
      console.error("Error al insertar el producto:", error);
      Swal.fire("Error", "Hubo un error al insertar el producto.", "error");
    }
  };


  const fetchInactiveProducts = async () => {
    try {
      const response = await axios.get("http://192.168.3.154:3007/api/calidad/calidad/activoinactivo");
      setInactiveProducts(response.data);
    } catch (error) {
      console.error("Error al obtener productos inactivos:", error);
    }
  };

  const handleShowInactiveProducts = () => {
    fetchInactiveProducts();
    setOpenInactiveModal(true);
  };

  useEffect(() => {
    fetchCalidadData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Datos de Calidad
      </Typography>

      <Button variant="contained" color="primary" onClick={handleInsertProduct} style={{ marginBottom: "20px" }}>
        Insertar Nuevo Producto
      </Button>

      <Button variant="contained" color="secondary" onClick={handleShowInactiveProducts} style={{ marginLeft: "10px", marginBottom: "20px" }}>
        Ver Productos Inactivos
      </Button>


      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Recibo</TableCell>
                <TableCell>Imagen</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>O.C.</TableCell>
                <TableCell>Cantidad Recibida</TableCell>
                <TableCell>Naviera</TableCell>
                <TableCell>Pedimento</TableCell>
                <TableCell>Pallete</TableCell>
                <TableCell>Restante</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosCalidad.map((dato) => (
                <TableRow key={dato.id_recibo} style={{ backgroundColor: dato.est === "7008" ? "#ffeb3b" : "inherit" }}>
                  <TableCell>{dato.id_recibo}</TableCell>
                  <TableCell>
                    <img
                      src={`../assets/image/img_pz/${dato.codigo}.jpg`}
                      alt="Producto"
                      style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }}
                    />
                  </TableCell>
                  <TableCell>{dato.des}</TableCell>
                  <TableCell>{dato.codigo}</TableCell>
                  <TableCell>{dato.oc}</TableCell>
                  <TableCell>{dato.cantidad_recibida}</TableCell>
                  <TableCell>{dato.naviera}</TableCell>
                  <TableCell>{dato.pedimento}</TableCell>
                  <TableCell>{dato.pallete}</TableCell>
                  <TableCell>{dato.restante}</TableCell>
                  <TableCell>{dato.name}</TableCell>
                  <TableCell>{dato.est === "7008" ? "En Cuarentena" : "Normal"}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleOpenModal(dato)}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openInsertModal}
        onClose={() => setOpenInsertModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Insertar Nuevo Producto
          <IconButton
            aria-label="close"
            onClick={() => setOpenInsertModal(false)}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

        </DialogTitle>
        <DialogContent>
          <TextField
            label="Buscar Código del Producto"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyPress={handleSearchProduct}
          />

          {productoDetalles && (
            <Box>
              {sections.map((section, index) => (
                <Box key={index} style={{ marginBottom: "20px" }}>
                  <Typography variant="h6" style={{ marginTop: "20px" }}>{section.title}</Typography>
                  <Divider style={{ marginBottom: "15px" }} />
                  <Grid container spacing={2}>
                    {section.fields.map((field, idx) => (
                      <Grid item xs={6} key={idx}>
                        <TextField
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          variant="outlined"
                          fullWidth
                          value={productoDetalles[field] || ""}
                          onChange={(e) => setProductoDetalles({ ...productoDetalles, [field]: e.target.value })}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={() => setOpenInsertModal(false)}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveNewProduct} disabled={!productoDetalles}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para productos inactivos */}
      <Dialog
        open={openInactiveModal}
        onClose={() => setOpenInactiveModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Productos Inactivos</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>estado</TableCell>
                  {/* Añade más columnas si es necesario */}
                </TableRow>
              </TableHead>
              <TableBody>
                {inactiveProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.codigo}</TableCell>
                    <TableCell>{product.des}</TableCell>
                    <TableCell>{product.estado}</TableCell>
                    {/* Renderiza más datos si es necesario */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInactiveModal(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={open}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          tyle: { minHeight: editMode ? "600px" : "400px", transition: "all 0.3s ease-in-out" },
        }}>

        <DialogTitle>
          Detalles del Producto
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            style={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedProducto && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                  src={`../assets/image/img_pz/${selectedProducto.codigo}.jpg`}
                  alt="Imagen del Producto"
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                />
              </div>

              {editMode ? (
                <Box>
                  {sections.map((section, index) => (
                    index === currentSection && (
                      <Box key={index}>
                        <Typography variant="h6" align="center" style={{ marginTop: "20px", marginBottom: "10px" }}>
                          {section.title}
                        </Typography>
                        <Divider style={{ marginBottom: "15px" }} />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={sectionAllChecked[section.title] || false}
                              onChange={() => handleSelectAllChange(section)}
                            />
                          }
                          label="Seleccionar todos"
                        />

                        <Grid container spacing={2}>
                          {section.fields.map((field, idx) => (
                            <Grid item xs={6} key={idx}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={readOnlyStates[field] || false}
                                    onChange={() => handleCheckboxChange(field)}
                                  />
                                }
                                label="Validado"
                              />
                              <TextField
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                variant="outlined"
                                fullWidth
                                value={productoDetalles?.[field] || ""}
                                onChange={(e) => setProductoDetalles({ ...productoDetalles, [field]: e.target.value })}
                                InputProps={{ readOnly: readOnlyStates[field] }}
                                style={{
                                  backgroundColor: readOnlyStates[field] ? "#f0f0f0" : "white",
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>

                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleContinue}
                          disabled={!isSectionComplete(section)}
                          style={{ marginTop: "20px", display: "block", marginLeft: "auto", marginRight: "auto" }}
                        >
                          Continuar
                        </Button>
                      </Box>
                    )
                  ))}

                  {currentSection >= sections.length && (
                    <Box textAlign="center" mt={4}>
                      <Typography variant="h6" style={{ marginBottom: "10px" }}>
                        Todas las secciones están completas.
                      </Typography>
                    </Box>
                  )}
                </Box>

              ) : (

                <TableContainer component={Paper} style={{ marginTop: "20px" }}>

                  <TextField label="Código" variant="outlined" fullWidth margin="normal" value={selectedProducto.codigo} InputProps={{ readOnly: true }} />
                  <TextField label="Descripción" variant="outlined" fullWidth margin="normal" value={selectedProducto.des} InputProps={{ readOnly: true }} />
                  <TextField label="Cantidad Recibida" variant="outlined" fullWidth margin="normal" value={selectedProducto.cantidad_recibida} InputProps={{ readOnly: true }} />


                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Inventario</TableCell>
                        <TableCell>Codigo Pieza</TableCell>
                        <TableCell>Codigo Paquete</TableCell>
                        <TableCell>Codigo Master</TableCell>
                        <TableCell>Codigo Inner</TableCell>
                        <TableCell>Pz</TableCell>
                        <TableCell>Pq</TableCell>
                        <TableCell>Inner</TableCell>
                        <TableCell>Master</TableCell>
                        <TableCell>Largo Pz</TableCell>
                        <TableCell>Largo Inner</TableCell>
                        <TableCell>Largo Master</TableCell>
                        <TableCell>Ancho Pz</TableCell>
                        <TableCell>Ancho Inner</TableCell>
                        <TableCell>Ancho Master</TableCell>
                        <TableCell>Alto Pz</TableCell>
                        <TableCell>Alto Inner</TableCell>
                        <TableCell>Alto Master</TableCell>
                        <TableCell>Peso Pz</TableCell>
                        <TableCell>Peso Inner</TableCell>
                        <TableCell>Peso Master</TableCell>
                        <TableCell>Garantía</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{productoDetalles?.inventario}</TableCell>
                        <TableCell>{productoDetalles?.code_pz}</TableCell>
                        <TableCell>{productoDetalles?.code_pq}</TableCell>
                        <TableCell>{productoDetalles?.code_master}</TableCell>
                        <TableCell>{productoDetalles?.code_inner}</TableCell>
                        <TableCell>{productoDetalles?._pz}</TableCell>
                        <TableCell>{productoDetalles?._pq}</TableCell>
                        <TableCell>{productoDetalles?._inner}</TableCell>
                        <TableCell>{productoDetalles?._master}</TableCell>
                        <TableCell>{productoDetalles?.largo_pz}</TableCell>
                        <TableCell>{productoDetalles?.largo_inner}</TableCell>
                        <TableCell>{productoDetalles?.largo_master}</TableCell>
                        <TableCell>{productoDetalles?.ancho_pz}</TableCell>
                        <TableCell>{productoDetalles?.ancho_inner}</TableCell>
                        <TableCell>{productoDetalles?.ancho_master}</TableCell>
                        <TableCell>{productoDetalles?.alto_pz}</TableCell>
                        <TableCell>{productoDetalles?.alto_inner}</TableCell>
                        <TableCell>{productoDetalles?.alto_master}</TableCell>
                        <TableCell>{productoDetalles?.peso_pz}</TableCell>
                        <TableCell>{productoDetalles?.peso_inner}</TableCell>
                        <TableCell>{productoDetalles?.peso_master}</TableCell>
                        <TableCell>{productoDetalles?.garantia}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleCuarentena(selectedProducto)}
                    style={{ marginRight: "10px" }}>
                    Cuarentena
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleSegundas(selectedProducto)}
                    style={{ marginRight: "10px" }}>
                    Segundas
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAutorizar(selectedProducto)}
                    style={{ marginRight: "10px" }}>
                    Autorizar
                  </Button>

                </TableContainer>
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions>

          {!editMode ? (
            <Button variant="contained" color="primary" onClick={handleEdit}>
              Validar
            </Button>
          ) : (
            <>
              <Button variant="contained" color="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Guardar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Calidad;
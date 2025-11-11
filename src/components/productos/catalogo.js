import React, { useEffect, useRef, useState, useContext } from "react";
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
  Tabs,
  Tab,
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
  maxHeight: "98vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: 24,
  p: 3,
};

const unidades = ["Pieza", "Inner", "Master"];


function Catalogo() {

  const inputRefs = useRef({ pz: null, inner: null, master: null });
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
  const baseURL = "https://sanced.santulconnect.com:3011"; // servidor estático

  const [detalleOriginal, setDetalleOriginal] = useState(null);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const [imagenZoom, setImagenZoom] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  const columnasDesktop = [
  {
    field: "image",
    headerName: "Img",
    width: 80,
    renderCell: (params) => (
      <img
        src={`${baseURL}/imagenes/img_pz/${params.row.codigo_pro}.jpg`}
        style={{ width: 45, height: 45, objectFit: "cover", borderRadius: 4 }}
        onError={(e) => (e.target.src = `${baseURL}/imagenes/img_pz/noimage.png`)}
      />
    ),
  },
  { field: "codigo_pro", headerName: "Código", width: 80 },
  { field: "clave", headerName: "Clave", width: 90 },
  { field: "des", headerName: "Descripción", width: 280 },
  { field: "_pz", headerName: "PZ", width: 70 },
  { field: "_inner", headerName: "Inner", width: 70 },
  { field: "_master", headerName: "Master", width: 80 },
  { field: "ubi", headerName: "Ubicación", width: 150 },
  { field: "stock_almacen", headerName: "Almacen", width: 100 },
  { field: "stock_picking", headerName: "Pick", width: 100 },
  { field: "stock_total", headerName: "Total", width: 80 },
  { field: "cant_santul", headerName: "Santul", width: 100 },
  {
    field: "acciones",
    headerName: "Ver",
    width: 110,
    renderCell: (params) => (
      <Button size="small" onClick={() => handleOpen(params.row)}>
        Detalle
      </Button>
    ),
  },
];


const columnasMobile = [
  { field: "codigo_pro", headerName: "Código", width: 80 },
  { field: "ubi", headerName: "Ubicación", width: 120 },
  { field: "des", headerName: "Descripción", width: 280 },
  {
    field: "acciones",
    headerName: "",
    width: 70,
    renderCell: (params) => (
      <Button variant="contained" size="small" onClick={() => handleOpen(params.row)}>
        👁
      </Button>
    ),
  },
];

  // ---------- Tabs ----------
  const [tab, setTab] = useState(0);

  function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
  }

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // URL del doc con cache-busting para ver cambios al instante
  // URL del doc con cache-busting para ver cambios al instante
  const docUrl = (tipo) => {
    if (!detalleProducto) return null;
    // usamos la API del 3007: GET /api/productos/:codigo_pro/archivos/:tipo
    const ts = detalleProducto?.[`${tipo}_file_updated_at`];
    const v = ts ? new Date(ts).getTime() : Date.now();
    return `http://66.232.105.87:3007/api/productos/${detalleProducto.codigo_pro}/archivos/${tipo}?v=${v}`;
  };


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
      setDetalleOriginal(data);
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const refetchDetalle = async () => {
    if (!productoSeleccionado) return;
    try {
      const res = await fetch(
        `http://66.232.105.87:3007/api/productos/catalogo-detall?codigo_pro=${productoSeleccionado.codigo_pro}`
      );
      const data = await res.json();
      setDetalleProducto(data);
      setDetalleOriginal(data);
    } catch (e) {
      console.error("Error al refrescar detalle:", e);
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

      const inventarioMap = {};
      data.forEach((item) => {
        inventarioMap[item.Clave] = item.Cant;
      });

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
          String(producto.des).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.codigo_pro &&
          String(producto.codigo_pro).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.code_pz &&
          String(producto.code_pz).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.code_pq &&
          String(producto.code_pq).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.code_master &&
          String(producto.code_master).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.code_inner &&
          String(producto.code_inner).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.code_palet &&
          String(producto.code_palet).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProductos(filtered);
  };

  const handleClose = () => {
    setOpen(false);
    setDetalleProducto(null);
    setModoEdicion(false);
  };


  const handleCancelarEdicion = () => {
    setDetalleProducto(detalleOriginal);
    setModoEdicion(false);
  };

  const handleGuardarCambios = async () => {
    try {
      const payload = {
        ...detalleProducto,
        code_pz: localCodes.pz,
        code_inner: localCodes.inner,
        code_master: localCodes.master,
        id_usuario: user.id_usu,
      };

      const res = await fetch(
        "http://66.232.105.87:3007/api/productos/catalogo-detall-update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      await res.json();
      setModoEdicion(false);
      setAlerta({
        open: true,
        mensaje: "¡Datos actualizados correctamente!",
        tipo: "success",
      });
      refetchDetalle();
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
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Error al subir imágenes");

      setAlerta({
        open: true,
        mensaje: "Imágenes actualizadas correctamente",
        tipo: "success",
      });
      setEditandoImagenes(false);
      setImagenesSeleccionadas({});
      refetchDetalle();
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
        const response = await fetch("http://66.232.105.87:3007/api/productos/catalogo");
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
      obtenerInventarioSantul();
    });
  }, []);

  const columnas = [
    {
      field: "image",
      headerName: "Imagen",
      width: 100,
      renderCell: (params) => (
        <img
          src={`${baseURL}/imagenes/img_pz/${params.row.codigo_pro}.jpg`}
          alt="Producto"
          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${baseURL}/imagenes/img_pz/noimage.png`;
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
        <Button variant="outlined" size="small" onClick={() => handleOpen(params.row)}>
          Ver Detalle
        </Button>
      ),
    },
  ];

  // ----- Sub-componente para cada TAB de documentos -----
  const DocumentUploader = ({ tipo, titulo }) => {
    const [localFile, setLocalFile] = useState(null);
    const [localPreview, setLocalPreview] = useState(null);
    const [subiendo, setSubiendo] = useState(false);

    const nombre = detalleProducto?.[`${tipo}_file`];
    const updatedAt = detalleProducto?.[`${tipo}_file_updated_at`];
    const url = docUrl(tipo);

    const isImageName = (name) => /\.(png|jpe?g|webp|gif)$/i.test(name || "");
    const isPdfName = (name) => /\.pdf$/i.test(name || "");

    useEffect(() => {
      if (!localFile) {
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
          setLocalPreview(null);
        }
        return;
      }
      const objUrl = URL.createObjectURL(localFile);
      setLocalPreview(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }, [localFile]);

    const subir = async () => {
      if (!localFile) {
        setAlerta({ open: true, mensaje: "Selecciona un archivo primero.", tipo: "warning" });
        return;
      }
      try {
        setSubiendo(true);

        const form = new FormData();
        form.append("archivo", localFile);

        form.append("id_usuario", user.id_usu);

        const res = await fetch(
          `http://66.232.105.87:3007/api/productos/${detalleProducto.codigo_pro}/archivos/${tipo}`,
          { method: "POST", body: form }
        );

        const payload = await res.json().catch(async () => ({ message: await res.text() }));
        if (!res.ok) throw new Error(payload?.message || "Error al subir archivo");

        setAlerta({ open: true, mensaje: "Archivo subido correctamente", tipo: "success" });
        setLocalFile(null);
        await refetchDetalle();
      } catch (e) {
        console.error(e);
        setAlerta({ open: true, mensaje: e.message || "No se pudo subir el archivo", tipo: "error" });
      } finally {
        setSubiendo(false);
      }
    };


    const previewSrc = localPreview || url;
    const previewName = localFile?.name || nombre;

    const PREVIEW_HEIGHT = isSmallScreen ? '60vh' : '75vh';


    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>{titulo}</Typography>

        <Grid container spacing={2}>
          {/* PREVIEW */}
          <Grid item xs={12} md={8}>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Archivo actual:</strong>{" "}
                {nombre ? (
                  <a href={url} target="_blank" rel="noreferrer">{nombre}</a>
                ) : "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Última actualización:</strong>{" "}
                {formatDateTime(updatedAt)}
              </Typography>

              {/* Vista previa inline */}
              {previewSrc && previewName ? (
                // ---- PDF ----
                isPdfName(previewName) ? (
                  <Box
                    sx={{
                      mt: 1,
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      overflow: 'hidden',        // evita scroll interior del contenedor
                      height: PREVIEW_HEIGHT,    // << alto controlado
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <object
                      data={`${previewSrc}#toolbar=1&navpanes=0&view=FitH`} // opcional: controla zoom/toolbar
                      type="application/pdf"
                      style={{ width: '100%', height: '100%' }}            // << ocupa todo el alto
                    >
                      <iframe
                        title={`${tipo}-preview`}
                        src={`${previewSrc}#toolbar=1&navpanes=0&view=FitH`}
                        style={{ border: 0, width: '100%', height: '100%' }}  // << ocupa todo el alto
                      />
                    </object>
                  </Box>
                )
                  // ---- IMAGEN ----
                  : isImageName(previewName) ? (
                    <Box
                      sx={{
                        mt: 1,
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: PREVIEW_HEIGHT,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <img
                        src={previewSrc}
                        alt={titulo}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay vista previa disponible para este tipo de archivo.
                    </Typography>
                  )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin archivo para previsualizar.
                </Typography>
              )}


              {/* Selector de archivo */}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setLocalFile(e.target.files?.[0] || null)}
                style={{ marginTop: 8 }}
              />
              {localFile && (
                <Typography variant="caption" color="text.secondary">
                  Archivo seleccionado: {localFile.name}
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* ACCIONES */}
          <Grid
            item
            xs={12}
            md={4}
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                disabled={!localFile || subiendo}
                onClick={subir}
              >
                {subiendo ? "Subiendo..." : "Subir archivo"}
              </Button>
              {url && (
                <Button
                  variant="outlined"
                  onClick={() => window.open(url, "_blank")}
                >
                  Ver archivo
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const [localCodes, setLocalCodes] = useState({ pz: "", inner: "", master: "" });

  const handleEditarDatos = () => {
    setLocalCodes({
      pz: detalleProducto?.code_pz ?? "",
      inner: detalleProducto?.code_inner ?? "",
      master: detalleProducto?.code_master ?? "",
    });
    setModoEdicion(true);
  }


  useEffect(() => {
    if (!open) return;

    // Captura global (fase capture = true) para frenar cualquier keydown/keyup
    const stopAllKeys = (e) => {
      // Permite Esc si lo usas para cerrar el modal. Si NO, quítalo.
      // if (e.key === 'Escape') return;
      e.stopPropagation();
    };

    window.addEventListener('keydown', stopAllKeys, true);
    window.addEventListener('keyup', stopAllKeys, true);

    return () => {
      window.removeEventListener('keydown', stopAllKeys, true);
      window.removeEventListener('keyup', stopAllKeys, true);
    };
  }, [open]);


  return (
    <Box p={isMobile ? 0.5 : 3}>
      <Card elevation={isMobile ? 0 : 3}  sx={{    borderRadius: isMobile ? 0 : 3,    boxShadow: isMobile ? "none" : undefined,  }}>
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
            {!open && (
              <DataGrid
  rows={search ? filteredProductos : productos}
  columns={isMobile ? columnasMobile : columnasDesktop}
  autoHeight
  pageSize={isMobile ? 10 : 20}
  rowsPerPageOptions={[10, 20, 50]}
  sx={{
    width: "100% !important",
    minWidth: isMobile ? "100%" : 1000,
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#f0f2f5",
      fontWeight: "bold",
      fontSize: isMobile ? "12px" : "16px",
    },
    "& .MuiDataGrid-cell": {
      fontSize: isMobile ? "12px" : "14px",
      padding: isMobile ? "4px" : "8px",
    },
  }}
/>


            )}
          </Box>



        </CardContent>
      </Card>

      {/* ================= MODAL ================= */}
      <Modal open={open} onClose={handleClose} keepMounted>
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
              {/* Encabezado */}
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

              {/* Acciones principales */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
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

                {/* Tabs centrados bajo los botones */}
                <Tabs
                  value={tab}
                  onChange={(e, v) => setTab(v)}
                  variant="scrollable"
                  allowScrollButtonsMobile
                  sx={{
                    width: "fit-content",
                    mx: "auto",
                    ".MuiTabs-flexContainer": {
                      justifyContent: "center",
                    },
                  }}
                >
                  <Tab label="VOLUMETRÍA" />
                  <Tab label="FLYER" />
                  <Tab label="FICHA TÉCNICA" />
                  <Tab label="FICHA COMERCIAL" />
                </Tabs>
              </Box>

              {/* TAB 0 */}
              <TabPanel value={tab} index={0}>
                <Grid container spacing={3}>
                  {unidades.map((unidad) => {
                    const suffix =
                      unidad === "Pieza" ? "pz" : unidad === "Inner" ? "inner" : "master";

                    return (
                      <Grid item xs={12} md={4} key={unidad}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                          <Typography
                            variant="h6"
                            mb={2}
                            align="center"
                            color="primary"
                          >
                            Unidad:{" "}
                            {unidad === "Pieza" ? detalleProducto?.um || "Pieza" : unidad}
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
                              <img
                                src={`${baseURL}/imagenes/img_${suffix}/${detalleProducto?.codigo_pro}.jpg`}
                                alt={`${unidad}`}
                                style={{
                                  width: 120,
                                  height: 120,
                                  objectFit: "contain",
                                  cursor: "zoom-in",
                                }}
                                onClick={() =>
                                  setImagenZoom(
                                    `${baseURL}/imagenes/img_${suffix}/${detalleProducto?.codigo_pro}.jpg`
                                  )
                                }
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `${baseURL}/imagenes/img_${suffix}/noimage.png`;
                                }}
                              />
                            )}
                          </Box>

                          {modoEdicion ? (
                            <TextField
                              key={`barcode-input-${suffix}`}
                              id={`barcode-${detalleProducto?.codigo_pro}-${suffix}`}
                              label={`Código de Barras (${suffix})`}
                              fullWidth
                              size="small"
                              value={localCodes[suffix] ?? ""}
                              // guarda la referencia al input real (no al wrapper)
                              inputRef={(el) => { inputRefs.current[suffix] = el; }}
                              onChange={(e) => {
                                const v = e.target.value;
                                setLocalCodes(prev => ({ ...prev, [suffix]: v }));
                                // re-enfoca y coloca el cursor al final después del render
                                queueMicrotask(() => {
                                  const el = inputRefs.current[suffix];
                                  if (el) {
                                    el.focus({ preventScroll: true });
                                    if (el.setSelectionRange) {
                                      const len = el.value?.length ?? 0;
                                      el.setSelectionRange(len, len);
                                    }
                                  }
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />


                          ) : (
                            <Box mb={2} display="flex" justifyContent="center">
                              <Barcode
                                value={(detalleProducto[`code_${suffix}`] ?? "").toString()}
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
                                    label={`${dim.charAt(0).toUpperCase() + dim.slice(1)} (${dim === "peso" ? "kg" : "m"
                                      })`}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={detalleProducto[`${dim}_${suffix}`] || ""}
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

                {/* Volumetría Tarima */}
                <Box mt={5}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      Volumetría Tarima
                    </Typography>
                    <Button variant="outlined" size="small" color="primary">
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
              </TabPanel>

              {/* TAB 1: FLYER */}
              <TabPanel value={tab} index={1}>
                <DocumentUploader tipo="flyer" titulo="Flyer del producto" />
              </TabPanel>

              {/* TAB 2: FICHA TÉCNICA */}
              <TabPanel value={tab} index={2}>
                <DocumentUploader tipo="ficha_tecnica" titulo="Ficha técnica" />
              </TabPanel>

              {/* TAB 3: FICHA COMERCIAL */}
              <TabPanel value={tab} index={3}>
                <DocumentUploader tipo="ficha_comercial" titulo="Ficha comercial" />
              </TabPanel>
            </>
          ) : (
            <Typography color="error">No se pudo cargar el detalle del producto</Typography>
          )}
        </Box>
      </Modal>

      {/* Zoom de imagen */}
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

      {/* Snackbar */}
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

    </Box >
  );
}

export default Catalogo;

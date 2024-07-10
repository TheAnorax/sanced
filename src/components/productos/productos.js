import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Grid, Paper, Box, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Barcode from 'react-barcode';

const MySwal = withReactContent(Swal);

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
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

function ProductoCRUD() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    codigo_pro: '', clave: '', inventario: 0, inv_m: 0, inv_i: 0, inv_p: 0,
    des: '', code_pz: '', code_pq: '', code_master: '', code_inner: '',
    code_palet: '', _pz: 0, _pq: 0, _inner: 0, _master: 0, _palet: 0
  });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [editId, setEditId] = useState(null);

  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isMediumScreen = useMediaQuery('(max-width:960px)');

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://192.168.3.225:3007/api/productos');
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    filterProductos(e.target.value);
  };

  const filterProductos = (searchTerm) => {
    const filtered = productos.filter(producto =>
      (producto.des && producto.des.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.codigo_pro && producto.codigo_pro.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProductos(filtered);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (!!errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = findFormErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        if (editing) {
          handleClose(); // Cierra el modal primero
          const confirmUpdate = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas actualizar este producto?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, actualizar',
            customClass: {
              popup: 'swal2-z-index-higher'
            }
          });
          if (confirmUpdate.isConfirmed) {
            await axios.put(`http://192.168.3.225:3007/api/productos/${editId}`, form);
            fetchProductos();
            MySwal.fire(
              'Actualizado',
              'El producto ha sido actualizado correctamente.',
              'success'
            );
          }
        } else {
          await axios.post('http://192.168.3.225:3007/api/productos', form);
          fetchProductos();
          handleClose();
          MySwal.fire(
            'Guardado',
            'El producto ha sido guardado correctamente.',
            'success'
          );
        }
      } catch (error) {
        console.error('Error saving producto:', error);
        MySwal.fire('Error', 'Hubo un problema guardando el producto', 'error');
      }
    }
  };

  const findFormErrors = () => {
    const { codigo_pro, des } = form;
    const newErrors = {};
    if (!codigo_pro || codigo_pro === '') newErrors.codigo_pro = 'El código es obligatorio';
    if (!des || des === '') newErrors.des = 'La descripción es obligatoria';
    return newErrors;
  };

  const handleView = (producto) => {
    setForm(producto);
    setEditing(false);
    setReadOnly(true);
    setEditId(producto.id_prod);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = await MySwal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      customClass: {
        popup: 'swal2-z-index-higher'
      }
    });
    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://192.168.3.225:3007/api/productos/${id}`);
        fetchProductos();
        MySwal.fire(
          'Eliminado',
          'El producto ha sido eliminado.',
          'success'
        );
      } catch (error) {
        console.error('Error deleting producto:', error);
        MySwal.fire('Error', 'Hubo un problema eliminando el producto', 'error');
      }
    }
  };

  const handleClickOpen = () => {
    setForm({
      codigo_pro: '', clave: '', inventario: 0, inv_m: 0, inv_i: 0, inv_p: 0,
      des: '', code_pz: '', code_pq: '', code_master: '', code_inner: '',
      code_palet: '', _pz: 0, _pq: 0, _inner: 0, _master: 0, _palet: 0
    });
    setEditing(false);
    setReadOnly(false);
    setErrors({});  // Limpiar los errores al abrir el modal
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});  // Limpiar los errores al cerrar el modal
  };

  const enableEditing = () => {
    setReadOnly(false);
    setEditing(true);
  };

  const columns = isSmallScreen ? [
    { field: 'codigo_pro', headerName: 'Código', width: 150 },
    { field: 'des', headerName: 'Descripción', width: 150, renderCell: (params) => (
        <span>{params.value.slice(0, 6)}</span>
      ) },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleView(params.row)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row.id_prod)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ] : [
    { field: 'codigo_pro', headerName: 'Código', width: 100 },
    { field: 'des', headerName: 'Descripción', width: 250 },
    { field: 'code_pz', headerName: 'Código de barras de PZ', width: 150 },
    { field: 'code_master', headerName: 'Código de barras de Master', width: 150 },
    { field: 'code_inner', headerName: 'Código de barras de Inner', width: 150 },
    { field: '_pz', headerName: 'PZ', width: 150 },
    { field: '_pq', headerName: 'PQ', width: 150 },
    { field: '_inner', headerName: 'Inner', width: 150 },
    { field: '_master', headerName: 'Master', width: 150 },
    { field: '_palet', headerName: 'Palet', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleView(params.row)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row.id_prod)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={isSmallScreen ? 'column' : 'row'}>
        <TextField
          label="Buscar"
          value={search}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ width: isSmallScreen ? '100%' : '300px', mb: isSmallScreen ? 2 : 0 }}
        />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleClickOpen}>
          Crear Producto
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 3, overflow: 'auto' }}>
        <div style={{ height: isMediumScreen ? 500 : 750, width: '100%' }}>
          <DataGrid rows={filteredProductos} columns={columns} pageSize={5} getRowId={(row) => row.id_prod} />
        </div>
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{readOnly ? 'Vista de Producto' : (editing ? 'Editar Producto' : 'Crear Producto')}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12} sm={6}>
                {readOnly ? (
                  form.code_pz ? <Barcode value={form.code_pz} /> : <Box width={266} height={142}>Sin código</Box>
                ) : (
                  <TextField
                    fullWidth
                    label="Código de barras de PIEZA"
                    name="code_pz"
                    value={form.code_pz}
                    onChange={handleChange}
                    variant="outlined"
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>  
                {readOnly ? (
                  form.code_pq ? <Barcode value={form.code_pq} /> : <Box width={266} height={142}>Sin código</Box>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                {readOnly ? (
                  form.code_inner ? <Barcode value={form.code_inner} /> : <Box width={266} height={142}>Sin código</Box>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                {readOnly ? (
                  form.code_master ? <Barcode value={form.code_master} /> : <Box width={266} height={142}>Sin código</Box>
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
              <Grid item xs={12} sm={6}>
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
                />
              </Grid>
            </Grid>
            <DialogActions>
              {readOnly && (
                <Button onClick={enableEditing} color="primary">
                  Editar
                </Button>
              )}
              <Button onClick={handleClose} color="primary">
                Cancelar
              </Button>
              {!readOnly && (
                <Button type="submit" color="primary">
                  {editing ? 'Actualizar' : 'Crear'}
                </Button>
              )}
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default ProductoCRUD;

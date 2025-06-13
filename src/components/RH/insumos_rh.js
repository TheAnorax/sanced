import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

// … (importaciones y demás arriba.)

function InsumosRH() {
  const [insumos, setInsumos] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    Codigo: '',
    Descripcion: '',
    Clave: '',
    um: '',
    _pz: '',
    Cantidad: '',
    dia_envio: '',
    almacen_envio: '',
    tiempo_llegada_estimado: '',
  });

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [errorFetch, setErrorFetch] = useState('');
  const [errorSKU, setErrorSKU] = useState('');
  const [errorSave, setErrorSave] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // Al montar el componente, traemos traslados y recibidos y filtramos
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    setLoadingFetch(true);
    setErrorFetch('');

    try {
      // 1) Llamamos simultáneamente a ambos endpoints:
      const [traspasoRes, recibidosRes] = await Promise.all([
        axios.get('http://localhost:3007/api/RH/ObtenerTraspaso'),
        axios.get('http://localhost:3001/api/traspaso/recibidos'),
      ]);

      const todosLosTraspasos = traspasoRes.data;     // Ejemplo: [{ Codigo: 2704, … }, { Codigo: 3470, … }, …]
      const recibidos = recibidosRes.data;           // Ejemplo: [{ Codigo: 2704, Cantidad: 1000, … }, { Codigo: 3470, … }, …]

      // 2) Creamos un Set (o arreglo) de códigos que ya están “recibidos”:
      const codigosRecibidos = new Set(recibidos.map(r => r.Codigo));

      // 3) Filtramos “todosLosTraspasos” excluyendo los que ya están en codigosRecibidos:
      const filtrados = todosLosTraspasos.filter(
        insumo => !codigosRecibidos.has(insumo.Codigo)
      );

      // 4) Asignamos el arreglo filtrado a nuestro estado
      setInsumos(filtrados);
    } catch (err) {
      console.error('Error al obtener insumos o recibidos:', err);
      setErrorFetch('No se pudieron cargar los insumos.');
    } finally {
      setLoadingFetch(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Resto de tu código de componente (modal, formulario, handleSubmit, etc.)
  // permanece igual, sólo que tu <TableBody> ahora iterará sobre “insumos” ya filtrados
  // ──────────────────────────────────────────────────────────────────────────

  const handleOpen = () => {
    setFormData({
      Codigo: '',
      Descripcion: '',
      Clave: '',
      um: '',
      _pz: '',
      Cantidad: '',
      dia_envio: '',
      almacen_envio: '1074',
      tiempo_llegada_estimado: '',
    });
    setErrorSKU('');
    setErrorSave('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Codigo') {
      setErrorSKU('');
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCodigoBlur = async () => {
    const codigoTrim = formData.Codigo.toString().trim();
    if (!codigoTrim) return;

    try {
      const res = await axios.get(
        `http://localhost:3007/api/RH/productos/${codigoTrim}`
      );
      const data = res.data;
      setFormData((prev) => ({
        ...prev,
        Descripcion: data.des || '',
        Clave: data.clave || '',
        um: data.um || '',
        _pz: data._pz != null ? data._pz.toString() : '',
      }));
      setErrorSKU('');
    } catch (err) {
      console.error('Error al buscar el producto:', err);
      if (err.response && err.response.status === 404) {
        setErrorSKU('Producto no encontrado');
        setFormData((prev) => ({
          ...prev,
          Descripcion: '',
          Clave: '',
          um: '',
          _pz: '',
        }));
      } else {
        setErrorSKU('Error al consultar el producto');
        setFormData((prev) => ({
          ...prev,
          Descripcion: '',
          Clave: '',
          um: '',
          _pz: '',
        }));
      }
    }
  };

  const handleSubmit = async () => {
    const {
      Codigo,
      Descripcion,
      Clave,
      um,
      _pz,
      Cantidad,
      dia_envio,
      almacen_envio,
      tiempo_llegada_estimado,
    } = formData;

    // Validaciones mínimas
    if (!Codigo || !Descripcion.trim() || !Cantidad) {
      setErrorSave('Código, descripción y cantidad son obligatorios.');
      return;
    }
    if (!dia_envio) {
      setErrorSave('Debes seleccionar el día y hora de envío.');
      return;
    }
    if (!tiempo_llegada_estimado) {
      setErrorSave('Debes seleccionar la fecha y hora de llegada estimada.');
      return;
    }
    if (errorSKU) {
      setErrorSave('Debe corregir el SKU antes de guardar.');
      return;
    }

    setErrorSave('');
    setLoadingSave(true);

    try {
      // Convertir dates a ISO
      let envioISO;
      if (typeof dia_envio === 'string') {
        const withSeconds = dia_envio.includes(':') ? dia_envio + ':00' : dia_envio;
        envioISO = new Date(withSeconds).toISOString();
      } else {
        envioISO = dia_envio.toISOString();
      }

      let llegadaISO;
      if (typeof tiempo_llegada_estimado === 'string') {
        const withSeconds = tiempo_llegada_estimado.includes(':')
          ? tiempo_llegada_estimado + ':00'
          : tiempo_llegada_estimado;
        llegadaISO = new Date(withSeconds).toISOString();
      } else {
        llegadaISO = tiempo_llegada_estimado.toISOString();
      }

      // POST al backend
      await axios.post('http://localhost:3007/api/RH/traspaso', {
        Codigo,
        Descripcion,
        Clave,
        um,
        _pz,
        Cantidad,
        dia_envio: envioISO,
        almacen_envio,
        tiempo_llegada_estimado: llegadaISO,
      });

      // Mostrar éxito y recargar lista
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'El Producto se insertó correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      await fetchInsumos();
      handleClose();
    } catch (err) {
      console.error('Error al guardar el insumo:', err);
      setErrorSave('Ocurrió un error al guardar.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el insumo. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoadingSave(false);
    }
  };

  //exportal de exel 

  const [excelData, setExcelData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [errorExcel, setErrorExcel] = useState('');

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingExcel(true);
    setErrorExcel('');
    setExcelData([]);
    setExcelHeaders([]);

    const formData = new FormData();
    formData.append('archivoExcel', file);

    try {
      const res = await axios.post(
        'http://localhost:3007/api/RH/excel-to-json',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setExcelData(res.data.data || []);
      setExcelHeaders(res.data.headers || []);
    } catch (err) {
      setErrorExcel('No se pudo procesar el archivo Excel.');
    } finally {
      setLoadingExcel(false);
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <h2>Insumos RH</h2>

      {/* Botón para abrir el modal de “Agregar Insumo” */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Agregar Insumo
      </Button>

      <Box sx={{ mb: 2 }}>
        <input
          accept=".xls,.xlsx"
          type="file"
          onChange={handleExcelUpload}
          style={{ display: 'inline-block', marginRight: 16 }}
        />
        {loadingExcel && <CircularProgress size={20} />}
        {errorExcel && <Alert severity="error" sx={{ mt: 1 }}>{errorExcel}</Alert>}
      </Box>

      {/* Si quieres ver el JSON tabulado */}
      {excelData.length > 0 && (
        <Box sx={{ my: 2 }}>
          <h4>Datos cargados del Excel:</h4>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {excelHeaders.map((h, i) => (
                    <TableCell key={i}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.map((row, idx) => (
                  <TableRow key={idx}>
                    {excelHeaders.map((h, i) => (
                      <TableCell key={i}>{row[h]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}


      {/* Estado de carga al traer la lista */}
      {loadingFetch && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensaje de error si no se pudo cargar la lista */}
      {errorFetch && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{errorFetch}</Alert>
        </Box>
      )}

      {/* Tabla que muestra sólo los insumos NO recibidos */}
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Clave</TableCell>
              <TableCell>UM</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Día de Envío</TableCell>
              <TableCell>Almacén Envío</TableCell>
              <TableCell>Llegada Estimada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insumos.map((insumo) => (
              <TableRow key={insumo.Codigo}>
                <TableCell>{insumo.Codigo}</TableCell>
                <TableCell>{insumo.Descripcion}</TableCell>
                <TableCell>{insumo.Clave}</TableCell>
                <TableCell>{insumo.um || '—'}</TableCell>
                <TableCell>{insumo.Cantidad}</TableCell>
                <TableCell>
                  {insumo.dia_envio
                    ? new Date(insumo.dia_envio).toLocaleString()
                    : '—'}
                </TableCell>
                <TableCell>{insumo.almacen_envio || '—'}</TableCell>
                <TableCell>
                  {insumo.tiempo_llegada_estimado
                    ? new Date(insumo.tiempo_llegada_estimado).toLocaleString()
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
            {insumos.length === 0 && !loadingFetch && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay insumos pendientes por recibir.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para agregar nuevo insumo */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Insumo</DialogTitle>
        <DialogContent dividers>
          {errorSave && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error">{errorSave}</Alert>
            </Box>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* SKU (Código) */}
            <Grid item xs={12} md={6}>
              <TextField
                label="SKU (Código)"
                name="Codigo"
                type="number"
                fullWidth
                value={formData.Codigo}
                onChange={handleFieldChange}
                onBlur={handleCodigoBlur}
                error={Boolean(errorSKU)}
                helperText={errorSKU || ''}
              />
            </Grid>

            {/* Descripción (autocompletada) */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Descripción"
                name="Descripcion"
                fullWidth
                value={formData.Descripcion}
                disabled
              />
            </Grid>

            {/* Clave (autocompletada) */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Clave"
                name="Clave"
                fullWidth
                value={formData.Clave}
                disabled
              />
            </Grid>

            {/* UM (autocompletada) */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Unidad de Medida (UM)"
                name="um"
                fullWidth
                value={formData.um}
                disabled
              />
            </Grid>

            {/* _pz (autocompletada) */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Cantidad por Paquete (_pz)"
                name="_pz"
                type="number"
                fullWidth
                value={formData._pz}
                disabled
              />
            </Grid>

            {/* Cantidad Enviada */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Cantidad Enviada"
                name="Cantidad"
                type="number"
                fullWidth
                value={formData.Cantidad}
                onChange={handleFieldChange}
              />
            </Grid>

            {/* Día de Envío */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Día de Envío"
                name="dia_envio"
                type="datetime-local"
                fullWidth
                value={formData.dia_envio}
                onChange={handleFieldChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Almacén Envío */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Almacén Envío"
                name="almacen_envio"
                fullWidth
                value={formData.almacen_envio}
                disabled
              />
            </Grid>

            {/* Llegada Estimada */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Llegada Estimada"
                name="tiempo_llegada_estimado"
                type="datetime-local"
                fullWidth
                value={formData.tiempo_llegada_estimado}
                onChange={handleFieldChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loadingSave}
          >
            {loadingSave ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InsumosRH;

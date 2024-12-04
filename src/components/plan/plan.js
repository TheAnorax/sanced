import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Plan = () => {
  const [results, setResults] = useState([]);
  const [file, setFile] = useState(null);

  // Obtener todos los registros de la tabla "plan" y su fuente
  const fetchPlanData = async () => {
    try {
      const response = await axios.get('http://192.168.3.225:3007/api/plan/plan');
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching plan data:', error);
      Swal.fire('Error', 'Ocurrió un error al obtener los datos del plan.', 'error');
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, []); // Ejecuta la consulta al cargar el componente

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTruncarPlan = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Esta acción eliminará todos los registros en el plan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await axios.delete('http://192.168.3.225:3007/api/plan/plan/truncar');
        Swal.fire('¡Eliminado!', 'Todos los registros han sido eliminados.', 'success');
        fetchPlanData(); // Actualizar los datos después de truncar la tabla
      }
    } catch (error) {
      console.error('Error al truncar la tabla:', error);
      Swal.fire('Error', 'Ocurrió un error al limpiar el plan.', 'error');
    }
  };

  const formatExcelDate = (excelDate) => {
    const dateObj = XLSX.SSF.parse_date_code(excelDate);
    if (dateObj) {
      return `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
    }
    return null;
  };

  const parseExcelNumber = (value) => {
    if (typeof value === 'number') {
      return value;
    }
    return parseInt(value.toString().replace(/[^0-9]/g, ''), 10);
  };

  const formatCurrency = (value) => {
    const numericValue = parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numericValue);
  };

  const handleFileUpload = async () => {
    if (!file) {
      Swal.fire('Advertencia', 'Por favor seleccione un archivo.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      const startRowIndex = 1;
      const filteredData = jsonData.slice(startRowIndex).filter(row => row[2] && !isNaN(row[2]));

      const orderedData = filteredData.map(row => ({
        ruta: row[0] || "Sin ruta",
        fecha_ruta: formatExcelDate(row[1]) || null,
        no_orden: parseExcelNumber(row[2]),
        fecha_pedido: formatExcelDate(row[3]) || null,
        num_cliente: parseExcelNumber(row[11]),
        total: formatCurrency(row[26])
      }));

      try {
        await axios.post('http://192.168.3.225:3007/api/plan/plan/importar', { data: orderedData });
        Swal.fire('Éxito', 'Datos importados correctamente', 'success');
        fetchPlanData(); // Actualizar los datos después de importar
      } catch (error) {
        console.error('Error al importar datos:', error);
        Swal.fire({
          title: 'Error al importar datos',
          text: 'Ocurrió un error al importar los datos. Asegúrese de que el archivo tenga el formato correcto y que todos los campos requeridos estén presentes.',
          icon: 'error',
          footer: '<a href="https://link-a-documentacion.com">Ver más detalles</a>'
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = [
    { field: 'no_orden', headerName: 'No Orden', width: 150 },
    { field: 'source', headerName: 'Ubicación', width: 150 },
    { field: 'ruta', headerName: 'Ruta', width: 150 },
    { field: 'fecha_ruta', headerName: 'Fecha Ruta', width: 150 },
    { field: 'fecha_pedido', headerName: 'Fecha Pedido', width: 150 },
    { field: 'num_cliente', headerName: 'Num Cliente', width: 150 },
    { field: 'total', headerName: 'Total', width: 150 },
  ];

  return (
    <div>
      <h2>Información del Plan</h2>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <input
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span" color="secondary">
            Cargar archivo Excel
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFileUpload}
          disabled={!file}
        >
          Importar datos
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleTruncarPlan}
        >
          Limpiar Plan
        </Button>
      </Box>
      <Paper>
        <DataGrid
          rows={results.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          pageSize={10}
          autoHeight
          getRowClassName={(params) => 
            params.row.source === 'paquetería' || params.row.source === 'finalizados' ? 'row-green' : ''
          }
          sx={{
            '& .row-green': {
              backgroundColor: '#d0f0c0', // Verde claro
            },
          }}
        />
      </Paper>
    </div>
  );
};

export default Plan;

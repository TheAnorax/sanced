import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography, Box, Paper, Button, Dialog, DialogContent, DialogTitle, IconButton, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importamos la funcionalidad de tablas

function Finalizados() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [pedidoDetalles, setPedidoDetalles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [filteredPedidos, setFilteredPedidos] = useState([]);  // Pedidos filtrados
  const [searchQuery, setSearchQuery] = useState('');  // Estado para el filtro

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://192.168.3.27:3007/api/finalizados/pedidos-finalizados');
        const dataWithFormattedTimes = response.data.map((pedido, index) => ({
          id: index,
          ...pedido,
          registro: new Date(pedido.registro).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
          registro_surtido: pedido.registro_surtido ? new Date(pedido.registro_surtido).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
          inicio_surtido: pedido.inicio_surtido ? new Date(pedido.inicio_surtido).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
          fin_surtido: pedido.fin_surtido ? new Date(pedido.fin_surtido).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
          registro_embarque: pedido.registro_embarque ? new Date(pedido.registro_embarque).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
        }));
        setPedidos(dataWithFormattedTimes);
        setFilteredPedidos(dataWithFormattedTimes); 
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    fetchPedidos();
  }, []);

  const handleOpenModal = async (pedido) => {
    try {
      const response = await axios.get(`http://192.168.3.27:3007/api/finalizados/pedido/${pedido.pedido}`);
      const detallesOrdenados = response.data
        .sort((a, b) => {
          if (a.cant_no_env !== 0 && b.cant_no_env === 0) return -1;
          if (a.cant_no_env === 0 && b.cant_no_env !== 0) return 1;
          return a.codigo_ped - b.codigo_ped;
        })
        .map((detalle) => ({
          ...detalle,
          registro: new Date(detalle.registro).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
          registro_surtido: detalle.registro_surtido ? new Date(detalle.registro_surtido).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
          inicio_surtido: detalle.inicio_surtido ? new Date(detalle.inicio_surtido).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
          fin_surtido: detalle.fin_surtido ? new Date(detalle.fin_surtido).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
          registro_embarque: detalle.registro_embarque ? new Date(detalle.registro_embarque).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
        }));
      setPedidoDetalles(detallesOrdenados);
      setSelectedPedido(pedido);
      setOpenModal(true);
    } catch (error) {
      console.error('Error fetching pedido details:', error);
    }
  };

  // Filtrar los pedidos cuando cambia el valor de búsqueda
  useEffect(() => {
    if (searchQuery) {
      setFilteredPedidos(pedidos.filter(pedido => 
        String(pedido.pedido).toLowerCase().includes(searchQuery.toLowerCase())  // Convertir a cadena antes de aplicar toLowerCase
      ));
    } else {
      setFilteredPedidos(pedidos);  // Si no hay búsqueda, muestra todos
    }
  }, [searchQuery, pedidos]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
    setPedidoDetalles([]);
  };

  const handleGenerateNoEnviadoPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Pedido No Enviado', 14, 22);
    doc.setFontSize(12);
    doc.text(`Pedido: ${selectedPedido.pedido}`, 14, 30);
    doc.text(`Tipo: ${selectedPedido.tipo}`, 14, 36);

    const noEnviados = pedidoDetalles.filter((detalle) => detalle.cant_no_env !== 0);

    const tableColumn = ['Código', 'Descripción', 'Cantidad', 'Surtido','No Enviado', 'Motivo', 'Union'];
    const tableRows = noEnviados.map((detalle) => [
      detalle.codigo_ped,
      detalle.descripcion,
      detalle.cantidad,
      detalle.cant_surti,
      detalle.cant_no_env,
      detalle.motivo,
      detalle.unificado
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40
    });

    doc.save(`Pedido_No_Enviado_${selectedPedido.pedido}.pdf`);
  };

  const handleGenerateSurtidoPDF = async () => {
    const doc = new jsPDF();
  
    // Cargar el logo (convertido previamente a base64 o usando una herramienta para convertirlo)
    const imgData = await fetch('../assets/image/sanced.png')
      .then(res => res.blob())
      .then(blob => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });
  
    // Tamaño del PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // Agregar la imagen como marca de agua centrada y ajustada
    const imgWidth = 100; // Ajustar tamaño de la imagen (ancho)
    const imgHeight = 100; // Ajustar tamaño de la imagen (alto)
    const imgX = (pageWidth - imgWidth) / 2; // Centrar en X
    const imgY = (pageHeight - imgHeight) / 2; // Centrar en Y
  
    // Colocar la imagen en el fondo con baja opacidad (marca de agua)
    doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
  
    // Título centrado
    doc.setFontSize(18);
    doc.text('Reporte de Surtido Embarcado', pageWidth / 2, 35, { align: 'center' });
  
    // Añadir detalles del pedido y fecha
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Fecha: ${currentDate}`, 14, 50);
    doc.text(`Pedido: ${selectedPedido.tipo}: ${selectedPedido.pedido}`, 14, 55);
    doc.text(`Surtido: ${selectedPedido.registro_surtido || 'Desconocido'}`, 14, 60);
    doc.text(`Validado: ${selectedPedido.registro_embarque || 'Desconocido'}`, 14, 65);
  
    // Separador
    doc.setLineWidth(0.5);
    doc.line(10, 70, pageWidth - 10, 70); // Línea separadora
  
    // Definir las columnas de la tabla
    const tableColumn = [
      { header: 'Código', dataKey: 'codigo_ped' },
      { header: 'Descripción', dataKey: 'descripcion' },
      { header: 'Cantidad', dataKey: 'cantidad' },
      { header: 'Surtido', dataKey: 'cant_surti' },
      { header: 'No Enviado', dataKey: 'cant_no_env' },
      { header: 'Motivo', dataKey: 'motivo' },
      { header: 'Surtidor', dataKey: 'usuario_surtido' },
      { header: 'S. PZ', dataKey: '_pz' },
      { header: 'S. PQ', dataKey: '_pq' },
      { header: 'S. INNER', dataKey: '_inner' },
      { header: 'S. MASTER', dataKey: '_master' },
      { header: 'Validador', dataKey: 'usuario_paqueteria' },
      { header: 'V. PZ', dataKey: 'v_pz' },
      { header: 'V. PQ', dataKey: 'v_pq' },
      { header: 'V. INNER', dataKey: 'v_inner' },
      { header: 'V. MASTER', dataKey: 'v_master' },
      { header: 'Union', dataKey: 'unificado' }
    ];
  
    // Mapeamos los datos a una estructura que jsPDF autoTable pueda procesar
    const tableRows = pedidoDetalles.map((detalle) => ({
      codigo_ped: detalle.codigo_ped,
      descripcion: detalle.descripcion.split(' ')[0],
      cantidad: detalle.cantidad,
      cant_surti: detalle.cant_surti,
      cant_no_env: detalle.cant_no_env,
      motivo: detalle.motivo,
      usuario_surtido: detalle.usuario_surtido.split(' ')[0],
      _pz: detalle._pz,
      _pq: detalle._pq,
      _inner: detalle._inner,
      _master: detalle._master,
      usuario_paqueteria: detalle.usuario_paqueteria,
      v_pz: detalle.v_pz,
      v_pq: detalle.v_pq,
      v_inner: detalle.v_inner,
      v_master: detalle.v_master,
      unificado: detalle.unificado
    }));
  
    // Generar la tabla centrada
    doc.autoTable({
      head: [tableColumn.map(col => col.header)],
      body: tableRows.map(row => Object.values(row)),
      startY: 80, // Posición de inicio después del encabezado
      margin: { left: 1, right: 1 }, // Márgenes para centrar la tabla
      columnStyles: {
        0: { cellWidth: 20 },  // Código
        1: { cellWidth: 40 },  // Descripción
        2: { cellWidth: 15 },  // Cantidad
        3: { cellWidth: 15 },  // Surtido
        4: { cellWidth: 15 },  // No Enviado
        5: { cellWidth: 30 },  // Motivo
        6: { cellWidth: 20 },  // Surtidor
        7: { cellWidth: 15 },  // S. PZ
        8: { cellWidth: 15 },  // S. PQ
        9: { cellWidth: 15 },  // S. INNER
        10: { cellWidth: 15 }, // S. MASTER
        11: { cellWidth: 25 }, // Validador
        12: { cellWidth: 15 }, // V. PZ
        13: { cellWidth: 15 }, // V. PQ
        14: { cellWidth: 15 }, // V. INNER
        15: { cellWidth: 15 }, // V. MASTER
        16: { cellWidth: 20 }, // Union
      },
      styles: { fontSize: 10, overflow: 'linebreak' },  // Ajusta la fuente y permite saltos de línea
      headStyles: { fillColor: [255, 0, 0], halign: 'center' },  // Encabezado rojo y centrado
      theme: 'grid'
    });
  
    // Guardar el PDF
    doc.save(`Pedido_Surtido_${selectedPedido.pedido}.pdf`);
  };
  

  const columns = [
    { field: 'pedido', headerName: 'Pedido', width: 150 },
    { field: 'tipo', headerName: 'Tipo', width: 150 },
    { field: 'partidas', headerName: 'Partidas', width: 150 },
    { field: 'registro', headerName: 'Registro', width: 200 },
    { field: 'registro_surtido', headerName: 'Registro Surtido', width: 200 },
    { field: 'registro_embarque', headerName: 'Registro Embarque', width: 200 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleOpenModal(params.row)}>
          <VisibilityIcon />
        </IconButton>
      )
    }
  ];

  const detalleColumns = [
    { field: 'descripcion', headerName: 'Descripción', width: 150 },
    { field: 'codigo_ped', headerName: 'Código', width: 60 },
    { field: 'cantidad', headerName: 'Cantidad', width: 70 },
    { field: 'cant_surti', headerName: 'Surtido', width: 60 },
    { field: 'cant_no_env', headerName: 'No Enviado', width: 90 },
    { field: '_pz', headerName: 'S. PZ', width: 50 },
    { field: '_pq', headerName: 'S. PQ', width: 50 },    
    { field: '_inner', headerName: 'S. INNER', width: 75 },
    { field: '_master', headerName: 'S. MASTER', width: 88 },    
    { field: 'usuario_surtido', headerName: 'Surtidor', width: 180},
    { field: 'inicio_surtido', headerName: 'Inicio Surtido', width: 180},
    { field: 'fin_surtido', headerName: 'Fin Surtido', width: 150},
    { field: 'v_pz', headerName: 'V. PZ', width: 80 },
    { field: 'v_pq', headerName: 'V. PQ', width: 80 },    
    { field: 'v_inner', headerName: 'V. INNER', width: 80 },
    { field: 'v_master', headerName: 'V. MASTER', width: 90 },    
    { field: 'usuario_paqueteria', headerName: 'Validador', width: 120},  
    { field: 'motivo', headerName: 'Motivo No Enviado', width: 170 },
    { field: 'unificado', headerName: 'Unificado', width: 170 },
    { field: 'ubi_bahia', headerName: 'Bahia', width: 170 },
  ]; 

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pedidos Finalizados
      </Typography>
      <TextField
        label="Buscar Pedido"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}  // Actualiza el valor de búsqueda
        sx={{ marginBottom: 2 }}
      />
      <Paper elevation={3} sx={{ p: 3, overflow: "auto" }}>
        <div style={{ height: "90%", width: "100%" }}>
          <DataGrid
            rows={filteredPedidos}  
            columns={columns}
            pageSize={5}
            getRowId={(row) => row.id}
            
          />
        </div>
      </Paper>
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal} 
        maxWidth="90%"  
        fullWidth
      >
        <DialogTitle>Detalles del Pedido</DialogTitle>
        <DialogContent sx={{ height: '800px' }}>
          {selectedPedido && pedidoDetalles.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Pedido: {selectedPedido.pedido}
              </Typography>
              
              <div style={{ height: 700, width: '100%' }}>
              <DataGrid
                  rows={pedidoDetalles.map((detalle, index) => ({ id: index, ...detalle }))}
                  columns={detalleColumns}
                  pageSize={5}
                  getRowId={(row) => row.id}
                  getRowClassName={(params) => 
                    params.row.cant_no_env !== 0 ? 'red-row' : ''  // Condición para marcar la fila en rojo
                  }
                  sx={{
                    '& .red-row': {
                      backgroundColor: 'rgba(255, 0, 0, 0.2)', // Color de fondo rojo claro
                    }
                  }}
                />
              </div>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="contained" color="primary" onClick={handleGenerateNoEnviadoPDF}>
                  Generar PDF No Enviado
                </Button>
                <Button variant="contained" color="primary" onClick={handleGenerateSurtidoPDF}>
                  Generar PDF Surtido
                </Button>
                <Button variant="contained" color="secondary" onClick={handleCloseModal}>
                  Cerrar
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Finalizados;

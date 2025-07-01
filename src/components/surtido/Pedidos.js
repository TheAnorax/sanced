import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Divider, Button, Autocomplete, TextField, FormControl, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import Swal from 'sweetalert2';
import debounce from 'lodash.debounce';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import * as XLSX from 'xlsx'; // Importar la librería para manejar archivos Excel

const fetchPedidos = async () => {
  const response = await axios.get('http://localhost:3007/api/pedidos/pedidos');
  return response.data;
};

// const fetchBahias = async () => {
//   const response = await axios.get('http://localhost:3007/api/pedidos/bahias'); 
  
//   // Filtrar las bahías que no comiencen con "B" o "C"
//   const filteredBahias = response.data.filter(bahia => !/^C-/.teyyst(bahia.bahia));
  
//   return filteredBahias; 
// };

const fetchBahias = async () => {
  const response = await axios.get('http://localhost:3007/api/pedidos/bahias');
  return response.data;
};

const fetchUsuarios = async () => {
  const response = await axios.get('http://localhost:3007/api/pedidos/usuarios');
  return response.data;
};

const usePedidos = () => {
  const queryClient = useQueryClient();
  const { data: pedidos, isLoading: isLoadingPedidos, error: errorPedidos } = useQuery({
    queryKey: ['pedidos'],
    queryFn: fetchPedidos,
  });
  const { data: bahias, isLoading: isLoadingBahias, error: errorBahias } = useQuery({
    queryKey: ['bahias'],
    queryFn: fetchBahias,
  });
  const { data: usuarios, isLoading: isLoadingUsuarios, error: errorUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios,
  });

  const mutation = useMutation({
    mutationFn: async (pedidoData) => {
      const { pedido, estado, bahias, items, usuarioId } = pedidoData;
      await axios.post('http://localhost:3007/api/pedidos/surtir', {
        pedido,
        estado,
        bahias,
        items,
        usuarioId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['pedidos']);
      queryClient.setQueryData(['pedidos'], (oldData) =>
        oldData.filter((p) => p.pedido !== variables.pedido)
      );
    },
  });

  return { pedidos, bahias, usuarios, isLoadingPedidos, isLoadingBahias, isLoadingUsuarios, errorPedidos, errorBahias, errorUsuarios, mutation };
};

const Pedidos = React.memo(() => {
  const { pedidos, bahias, usuarios, isLoadingPedidos, isLoadingBahias, isLoadingUsuarios, errorPedidos, errorBahias, errorUsuarios, mutation } = usePedidos();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedUsuario, setSelectedUsuario] = useState({});
  const [localPedidos, setLocalPedidos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPorPasillo, setIsPorPasillo] = useState(true);
  const [selectedPedidos, setSelectedPedidos] = useState([]);
  const [isFusionEnabled, setIsFusionEnabled] = useState(false); // Estado para habilitar fusión
  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 200,
  }));

  useEffect(() => {
    if (pedidos) {
      setLocalPedidos(pedidos);
      cache.current.clearAll();
    }
  }, [pedidos]);

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearchTerm(searchTerm), 300);
    handler();
    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  const filteredPedidos = useMemo(() => {
    if (!debouncedSearchTerm || !localPedidos) return localPedidos;
    const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
    return localPedidos.filter((pedido) => {
      const pedidoStr = String(pedido.pedido).toLowerCase();
      return pedidoStr.includes(lowerSearchTerm);
    });
  }, [localPedidos, debouncedSearchTerm]);
  


    // Función para generar y descargar el archivo Excel
    const downloadExcel = () => {
      if (!filteredPedidos || filteredPedidos.length === 0) {
        Swal.fire('Error', 'No hay datos filtrados para exportar.', 'error');
        return;
      }
    
      // Generar datos detallados para exportar
      const data = filteredPedidos.flatMap((pedido) =>
        pedido.items.map((item) => ({
          Pedido: pedido.pedido,
          Tipo: pedido.tipo,
          Registro: new Date(pedido.registro).toLocaleString(),
          Código: item.codigo_ped,
          Descripción: item.des,
          Cantidad: item.cantidad,
          Pasillo: item.ubi || 'Sin pasillo',
        }))
      );
    
      // Crear hoja de Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalles del Pedido');
    
      // Descargar archivo
      XLSX.writeFile(workbook, `Pedido_Filtrado_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };
    
  const handleSelectChange = useCallback((pedido, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [pedido]: value,
    }));
  }, []);

  const handleUsuarioChange = useCallback((pedido, value) => {
    setSelectedUsuario((prev) => ({
      ...prev,
      [pedido]: value,
    }));
  }, []);

  const handleSave = useCallback((pedido) => {
    const selectedBahias = selectedItems[pedido.pedido];
    const selectedUsuarioId = selectedUsuario[pedido.pedido]?.[0]?.id_usu;

    if (!selectedBahias || selectedBahias.length === 0) {
      Swal.fire('Error', 'Por favor seleccione al menos una bahía', 'error');
      return;
    }

    if (!isPorPasillo && !selectedUsuarioId) {
      Swal.fire('Error', 'Por favor seleccione un usuario', 'error');
      return;
    }

    setIsSaving(true);
    const estado = 'S'; // Estado fijo
    const items = pedido.items.map(item => ({
      ...item,
      tipo: pedido.tipo, // Agregar el tipo a cada item
      registro: pedido.registro,
    }));

    setLocalPedidos((prev) => prev.filter((p) => p.pedido !== pedido.pedido));

    mutation.mutate({ pedido: pedido.pedido, estado, bahias: selectedBahias.map(b => b.bahia), items, usuarioId: selectedUsuarioId }, {
      onSettled: () => {
        setIsSaving(false);
        cache.current.clearAll();
      }
    });
  }, [selectedItems, selectedUsuario, isPorPasillo, mutation]);

  const toggleTitle = () => {
    setIsPorPasillo(!isPorPasillo);
  };

  const toggleFusion = () => {
    setIsFusionEnabled(!isFusionEnabled);
    setSelectedPedidos([]); // Limpiar la selección de pedidos al activar/desactivar fusión
  };

  const handlePedidoSelection = (pedidoId) => {
    setSelectedPedidos((prev) => {
      const newSelectedPedidos = [...prev];
      if (newSelectedPedidos.includes(pedidoId)) {
        return newSelectedPedidos.filter((id) => id !== pedidoId);
      } else {
        if (newSelectedPedidos.length < 2) {
          newSelectedPedidos.push(pedidoId);
        } else {
          Swal.fire('Error', 'Solo puedes seleccionar dos pedidos a la vez', 'error');
        }
        return newSelectedPedidos;
      }
    });
  };

  const mergePedidos = async () => {
    if (selectedPedidos.length !== 2) {
      Swal.fire('Error', 'Debes seleccionar dos pedidos para fusionar', 'error');
      return;
    }
  
    const [pedido1, pedido2] = selectedPedidos.map(id => pedidos.find(p => p.pedido === id));
    if (!pedido1 || !pedido2) {
      Swal.fire('Error', 'No se pudieron encontrar los pedidos seleccionados', 'error');
      return;
    }
  
    // Verificar que los usuarios sean los mismos solo si están asignados
    const usuario1 = selectedUsuario[pedido1.pedido]?.[0]?.id_usu;
    const usuario2 = selectedUsuario[pedido2.pedido]?.[0]?.id_usu;
    if (usuario1 && usuario2 && usuario1 !== usuario2) {
      Swal.fire('Error', 'El usuario debe ser el mismo para los pedidos fusionados', 'error');
      return;
    }
  
    // Fusionar ubicaciones
    const mergedBahias = [...new Set([...selectedItems[pedido1.pedido].map(b => b.bahia), ...selectedItems[pedido2.pedido].map(b => b.bahia)])];
  
    const mergedPedido = {
      pedido: `${pedido1.pedido}-${pedido2.pedido}`,
      tipo: `${pedido1.tipo}, ${pedido2.tipo}`,
      registro: new Date(),
      items: [],
      bahias: mergedBahias,
      usuarioId: usuario1 || usuario2, // Asignar el usuario si está presente
      unificado: [] // Campo para almacenar la información unificada por cada item
    };
  
    const itemsMap = {};
  
    pedido1.items.concat(pedido2.items).forEach(item => {
      const tipo = pedido1.items.includes(item) ? pedido1.tipo : pedido2.tipo;
  
      if (!itemsMap[item.codigo_ped]) {
        itemsMap[item.codigo_ped] = { ...item, unificado: `${tipo}:${item.cantidad} ` };
      } else {
        itemsMap[item.codigo_ped].cantidad += item.cantidad;
        itemsMap[item.codigo_ped].unificado += `| ${tipo}:${item.cantidad} `;
      }
    });
  
    mergedPedido.items = Object.values(itemsMap);
    mergedPedido.unificado = mergedPedido.items.map(item => item.unificado); // Crear un arreglo con los registros 'unificado' de cada item
  
    try {
      await axios.post('http://localhost:3007/api/pedidos/merge', mergedPedido);
      Swal.fire('Éxito', 'Pedidos fusionados correctamente', 'success');
      setSelectedPedidos([]);
    } catch (error) {
      console.error('Error al fusionar pedidos:', error);
      Swal.fire('Error', 'Ocurrió un error al fusionar los pedidos', 'error');
    }
  };
  
  
  const rowRenderer = ({ index, key, parent, style }) => {
    const pedido = filteredPedidos[index];
    const isSelected = selectedPedidos.includes(pedido.pedido);

    return (
      <CellMeasurer
        key={key}
        cache={cache.current}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div style={{ ...style, padding: '10px', boxSizing: 'border-box', backgroundColor: isSelected ? '#e0e0e0' : 'transparent' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <img src="../assets/image/santul2.png" alt="Logo" style={{ width: 90, height: 90, marginRight: 16 }} />
                </Box>
                <Box flex={1} textAlign="center">
                  <Typography variant="h5">{pedido.tipo} : {pedido.pedido}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" align="right">
                    Registro: {new Date(pedido.registro).toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {isFusionEnabled && (
                <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handlePedidoSelection(pedido.pedido)}
                        color="primary"
                      />
                    }
                    label="Seleccionar"
                  />
                </Box>
              )}
              <Box display="flex" alignItems="center" mt={2}>
                <FormControl sx={{ minWidth: 300 }}>
                  <Autocomplete
                    multiple
                    options={bahias}
                    getOptionLabel={(option) => option.bahia}
                    filterSelectedOptions
                    value={selectedItems[pedido.pedido] || []}
                    onChange={(event, value) => handleSelectChange(pedido.pedido, value)}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="Bahías" placeholder="Seleccionar Bahías" />
                    )}
                  />
                </FormControl>
                {!isPorPasillo && (
                  <FormControl sx={{ minWidth: 300, ml: 2 }}>
                    <Autocomplete
                      multiple
                      options={usuarios.filter((usuario) => {
                        // Filtrar usuarios que tienen un 'role' que empieza con 'P' seguido de un número
                        return usuario.role && /^P\d/.test(usuario.role);
                      })}
                      getOptionLabel={(option) => option.name}
                      filterSelectedOptions
                      value={selectedUsuario[pedido.pedido] || []}
                      onChange={(event, value) => handleUsuarioChange(pedido.pedido, value)}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Usuarios" placeholder="Seleccionar Usuarios" />
                      )}
                    />
                  </FormControl>
                )}

                <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => handleSave(pedido)} disabled={isSaving || isFusionEnabled}>
                  {isSaving ? <CircularProgress size={24} /> : 'Agregar'}
                </Button>
              </Box>
              <Divider sx={{ mb: 2, mt: 2 }} />
              <Box mb={2}>
                <Typography variant="h6" align="center">Productos</Typography>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box width="100%">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Código</Typography>
                    <Typography variant="body1" sx={{ flex: 2, fontWeight: 'bold' }}>Descripción</Typography>
                    <Typography variant="body1" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Cantidad</Typography>
                    <Typography variant="body1" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Pasillo</Typography>
                  </Box>
                  {pedido.items
                    .sort((a, b) => {
                      if (a.pasillo === 'AV' && b.pasillo !== 'AV') return -1;
                      if (a.pasillo !== 'AV' && b.pasillo === 'AV') return 1;
                      return (a.pasillo || '').localeCompare(b.pasillo || '');
                    })
                    .map((item, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>{item.codigo_ped}</Typography>
                        <Typography variant="body1" sx={{ flex: 2 }}>{item.des}</Typography>
                        <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>{item.cantidad}</Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            flex: 1,
                            textAlign: 'center',
                            color: item.ubi ? 'inherit' : 'red'
                          }}
                        >
                          {item.ubi ? item.ubi : 'Sin ubicación'}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>
      </CellMeasurer>
    );
  };

  if (isLoadingPedidos || isLoadingBahias || isLoadingUsuarios) return <Box display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;
  if (errorPedidos || errorBahias || errorUsuarios) return <div>Error al cargar datos</div>;

  return (

    <Box display="flex" flexDirection="column" width="100%" height="400vh" alignItems="center">
      <Box display="flex" flexDirection="row" width="100%" p={1} justifyContent="space-between" alignItems="center">
        <TextField 
          variant="outlined"
          placeholder="Buscar pedido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '10px', width: '200px' }}
        />
         {filteredPedidos.length > 0 && (
          <Button variant="contained" color="primary" onClick={downloadExcel}>
            Descargar Excel
          </Button>
        )}
        <Typography variant="h6" sx={{ marginBottom: '10px', textAlign: 'center' }}>
          {isPorPasillo ? 'Surtido por Pasillo' : 'Surtido por Pedido'}
        </Typography>
        <Button variant="contained" color="primary" style={{ marginBottom: '10px' }} onClick={toggleTitle}>
          {isPorPasillo ? 'Por Pedido' : 'Por Pasillo'}
        </Button>
        <Button variant="contained" color="secondary" style={{ marginBottom: '10px' }} onClick={toggleFusion}>
          Fusionar
        </Button>
      </Box>
      {isFusionEnabled && (
        <Box mb={2}>
          <Button variant="contained" color="secondary" onClick={mergePedidos} disabled={selectedPedidos.length !== 2}>
            Fusionar Pedidos
          </Button>
        </Box>
      )}
      <Box flexGrow={1} width="80%" >
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              deferredMeasurementCache={cache.current}
              rowHeight={cache.current.rowHeight}
              rowCount={filteredPedidos.length}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      </Box>
    </Box>
    
  );
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Pedidos />
  </QueryClientProvider>
);

export default App;

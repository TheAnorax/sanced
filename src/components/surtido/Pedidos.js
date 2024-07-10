import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Divider, Button, Autocomplete, TextField, FormControl, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import debounce from 'lodash.debounce';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

const fetchPedidos = async () => {
  const response = await axios.get('http://192.168.3.225:3007/api/pedidos/pedidos');
  return response.data;
};

const fetchBahias = async () => {
  const response = await axios.get('http://192.168.3.225:3007/api/pedidos/bahias');
  return response.data;
};

const fetchUsuarios = async () => {
  const response = await axios.get('http://192.168.3.225:3007/api/pedidos/usuarios');
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
      await axios.post('http://192.168.3.225:3007/api/pedidos/surtir', {
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

  const rowRenderer = ({ index, key, parent, style }) => {
    const pedido = filteredPedidos[index];
    return (
      <CellMeasurer
        key={key}
        cache={cache.current}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div style={{ ...style, padding: '10px', boxSizing: 'border-box' }}>
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
                          options={usuarios.filter((usuario) => usuario.name && usuario.name.toLowerCase().includes('pasillo'))}
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
                    <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => handleSave(pedido)} disabled={isSaving}>
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
        <Typography variant="h6" sx={{ marginBottom: '10px', textAlign: 'center' }}>
          {isPorPasillo ? 'Surtido por Pasillo' : 'Surtido por Pedido'}
        </Typography>
        <Button variant="contained" color="primary" style={{ marginBottom: '10px' }} onClick={toggleTitle}>
          {isPorPasillo ? 'Por Pedido' : 'Por Pasillo'}
        </Button>
      </Box>
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

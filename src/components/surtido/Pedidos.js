import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { Toolbar, Card, CardContent, Typography, Grid, Box, Divider, Button, Autocomplete, TextField, FormControl, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import debounce from 'lodash.debounce';
import { List, AutoSizer } from 'react-virtualized';

const fetchPedidos = async () => {
  const response = await axios.get('http://localhost:3001/api/pedidos/pedidos');
  return response.data;
};

const fetchBahias = async () => {
  const response = await axios.get('http://localhost:3001/api/pedidos/bahias');
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

  const mutation = useMutation({
    mutationFn: async (pedidoData) => {
      const { pedido, estado, bahias, items } = pedidoData;
      await axios.post('http://localhost:3001/api/pedidos/surtir', {
        pedido,
        estado,
        bahias,
        items,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['pedidos']);
      queryClient.setQueryData(['pedidos'], (oldData) =>
        oldData.filter((p) => p.pedido !== variables.pedido)
      );
    },
  });

  return { pedidos, bahias, isLoadingPedidos, isLoadingBahias, errorPedidos, errorBahias, mutation };
};

const Pedidos = React.memo(() => {
  const { pedidos, bahias, isLoadingPedidos, isLoadingBahias, errorPedidos, errorBahias, mutation } = usePedidos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [localPedidos, setLocalPedidos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pedidos) {
      setLocalPedidos(pedidos);
    }
  }, [pedidos]);

  const debouncedSetSearchTerm = useCallback(
    debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleSearchChange = (event) => {
    debouncedSetSearchTerm(event.target.value);
  };

  const filteredPedidos = useMemo(() => {
    if (!searchTerm || !localPedidos) return localPedidos;
    return localPedidos.filter((pedido) =>
      pedido.pedido.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localPedidos, searchTerm]);

  const handleSelectChange = useCallback((pedido, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [pedido]: value,
    }));
  }, []);

  const handleSave = useCallback((pedido) => {
    const selectedBahias = selectedItems[pedido.pedido];
    if (!selectedBahias || selectedBahias.length === 0) {
      Swal.fire('Error', 'Por favor seleccione al menos una bahía', 'error');
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

    mutation.mutate({ pedido: pedido.pedido, estado, bahias: selectedBahias.map(b => b.bahia), items }, {
      onSettled: () => {
        setIsSaving(false); // Pequeño retraso para asegurar que la mutación ha terminado
      }
    });
  }, [selectedItems, mutation]);

  if (isLoadingPedidos || isLoadingBahias) return <Box display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;
  if (errorPedidos || errorBahias) return <div>Error al cargar datos</div>;

  const renderRow = ({ index, key, style }) => {
    const pedido = filteredPedidos[index];
    return (
      <div key={key} style={style}>
        <Grid container spacing={2} justifyContent="center" alignItems="center" mb={2}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} width="100%">
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
                    <Divider sx={{ mb: 2, mt: 2 }} />
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
                      <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => handleSave(pedido)} disabled={isSaving}>
                        {isSaving ? <CircularProgress size={24} /> : 'Agregar'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  };

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Toolbar />
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" p={2} mt={3}>
        <TextField
          variant="outlined"
          placeholder="Buscar pedidos"
          onChange={handleSearchChange}
          sx={{ mb: 2, width: '50%' }}
        />
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={600}
              rowCount={filteredPedidos.length}
              rowHeight={200}
              rowRenderer={renderRow}
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

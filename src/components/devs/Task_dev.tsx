import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Card, CardContent, Button, Avatar, IconButton, Box, Chip, TextField } from '@mui/material';
import { Add, Assignment, Comment } from '@mui/icons-material';
import axios from 'axios';

// Definir tipos para tareas
interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  asignado_avatar?: string;
  asignado_nombre?: string;
}

export default function Task_dev(): JSX.Element {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [comentario, setComentario] = useState<string>('');

  useEffect(() => {
    axios.get<Tarea[]>('/api/tareas').then((res) => setTareas(res.data));
  }, []);

  const agregarComentario = (tareaId: number): void => {
    axios.post('/api/comentarios', { tarea_id: tareaId, comentario }).then(() => {
      setComentario('');
    });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f7', minHeight: '100vh', fontFamily: 'San Francisco, Arial' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'black', boxShadow: '0px 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>📋 Task_dev de Tareas</Typography>
          <IconButton color="primary"><Add /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
        {tareas.map((t: Tarea) => (
          <Card key={t.id} sx={{ borderRadius: 4, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6"><Assignment /> {t.titulo}</Typography>
                <Chip label={t.estado} color={t.estado === 'completada' ? 'success' : t.estado === 'en_progreso' ? 'warning' : 'default'} />
              </Box>
              <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>{t.descripcion}</Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <Avatar sx={{ mr: 1 }} src={t.asignado_avatar || ''} />
                <Typography variant="body2">Asignado a: {t.asignado_nombre || 'No asignado'}</Typography>
              </Box>

              <Box mt={2}>
                <TextField
                  size="small"
                  placeholder="Agregar comentario..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  sx={{ width: '80%', mr: 1 }}
                />
                <Button variant="contained" onClick={() => agregarComentario(t.id)}><Comment /></Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

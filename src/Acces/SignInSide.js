import React, { useState, useContext } from 'react';
import { UserContext } from '../components/context/UserContext'; // Asegúrate de importar tu UserContext
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { red } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: red[500],
    },
  },
});

export default function SignInSide() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(UserContext); // Usar el contexto para el login
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3007/api/login', { email, password });
      const { token, user } = response.data;

      login({ ...user, token });

      // Guardar el token y el usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Verificar el rol del usuario y redirigir a la página correspondiente
      const rolesDeCompras = ['Nac', 'Ins', 'Imp', 'Plan']; // Arreglo de roles que deben ser redirigidos a Compras
      const rolesDeRecibo = ['Recibo']; // Arreglo de roles que deben ser redirigidos a Compras
      const rolesDepartamental = ['Dep'];
      const rolesClidad =['CALI'];
      const rolesInventario=['INV'];
      const roleFinanzas = ['Reporte'];
      const roleauditoria = ["Audi"];
      const roleVentas = ["VENT"];

      if (rolesDeCompras.includes(user.role)) {
        navigate('/dashboard/compras');  // Redirigir al componente de compras
      }
      // Si no pertenece a Compras, revisar si pertenece a Recibo
      else if (rolesDeRecibo.includes(user.role)) {
        navigate('/dashboard/recibo');  // Redirigir al componente de recibo
      }
      else if(rolesDepartamental.includes(user.role)){
        navigate('/dashboard/insumos');  // Redirigir al componente de departamento

      }
      else if(roleauditoria.includes(user.role)){
        navigate('/dashboard/inventarios');  // Redirigir al componente de departamento

      }
      else if (rolesClidad.includes(user.role)) {
        navigate('/dashboard/calidad');  // Redirigir al componente de recibo
      } else if (rolesInventario.includes(user.role)) {
        navigate('/dashboard/inventarios');  // Redirigir al componente de recibo
      }
      else if (roleFinanzas.includes(user.role)) {
        navigate('/dashboard/reporter');
      }
      else if (roleVentas.includes(user.role)) {
        navigate('/dashboard/productos');
      }
      else {
        navigate('/dashboard');  // Redirigir al Dashboard general
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      setError('Correo o contraseña incorrectos');
      setTimeout(() => setError(''), 3000);  // Desaparece después de 3 segundos
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          className='background'
          sx={{
            backgroundImage: 'url(../assets/image/cedisxd.png)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img src="../assets/image/sansed.png" alt="Logo de la empresa" style={{ width: '300px', marginBottom: '16px' }} />
            <Typography component="h1" variant="h5">
              Iniciar sesión
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Iniciar sesión
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

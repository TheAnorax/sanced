import React, { useState, useEffect } from "react";
import {
  styled,
  createTheme,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { red } from "@mui/material/colors";
//import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from "@mui/material/Avatar";
import mainListItems from "./listitems"; // Asegúrate de esta importaciónnpm uninstall @mui/material @emotion/react @emotion/styled

const redTheme = createTheme({
  palette: {
    primary: {
      main: red[500],
    },
    secondary: {
      main: red[300],
    },
  },
});

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
    marginLeft: theme.spacing(7),
    width: `calc(100% - ${theme.spacing(7)}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
  [theme.breakpoints.down("sm")]: {
    marginLeft: 0,
    width: "100%",
  },
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
      [theme.breakpoints.down("sm")]: {
        width: 0,
      },
    }),
  },
}));

const getTitle = (pathname) => {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard";
    case "/usuarios":
      return "Usuarios Surtido";
    case "/dashboard/productos":
      return "Productos";
    case "/dashboard/pedidos":
      return "Pedidos Pendientes";
    case "/dashboard/surtido":
      return "Pedidos en Surtido";
    case "/dashboard/pedidos-surtido":
      return "Pedidos";
    case "/dashboard/paqueteria":
      return "Paqueteria";
    case "/dashboard/empaquetando":
      return "Empaquetando";
    case "/dashboard/embarques":
      return "Embarques";
    case "/dashboard/embarcando":
      return "Embarcando";
    case "/dashboard/plan":
      return "Creación de Plan";
    case "/dashboard/bahias":
      return "Bahias";
    case "/dashboard/ubicaciones":
      return "Ubicaciones";
    case "/dashboard/compras":
      return "Compras";
    case "/dashboard/recibo":
      return "Producto a Recibir";
    case "/dashboard/finalizados":
      return "Finalizado";
    case "/dashboard/calidad":
      return "Calidad";
    case "/dashboard/inventarios":
      return "Inventarios";
    case "/dashboard/reporter":
      return "Reportes Recibo";
    case "/dashboard/insumos":
      return "Insumos";
    case "/dashboard/inventario":
      return "Inventario dia 0";
    case "/dashboard/muetras":
      return "muestras";
    case "/dashboard/historial":
      return "Historial de Movimientos";
    case "/dashboard/devs":
      return "devs";
    case "/dashboard/RH":
      return "RH";
    case "/dashboard/Queretaro":
      return "Proyecto";
    case "dashboard/visitas":
      return "Visitas";
    case "dashboard/visitas-reporte":
      return "Visitas Reporte";
    case "/dashboard/Trasporte":
      return "Transporte";
    case "/dashboard/Tracking":
      return "Tracking";
    case "/dashboard/kpi":
      return "kpi";
    case "/dashboard/Mapa":
      return "Mapa";
    case "/dashboard/Plansurtido":
      return "Plansurtido";
    case "/dashboard/Catalogo":
      return "Catalogo";
    case "/dashboard/COBERTURA":
      return "Cobertura";
    case "/dashboard/RepoProb":
      return "RepoProb";
    case "/dashboard/Mercado-Libre":
      return "Mercado-Libre";
    default:
      return "Dashboard";
  }
};

export default function Dashboard() {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const title = getTitle(location.pathname);
  const theme = useTheme();
  //const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Actualizar el contexto con null (para que se refleje inmediatamente en la interfaz)
    setUser(null);

    // Redirigir al usuario a la página de login
    navigate("/login");
  };

  return (
    <ThemeProvider theme={redTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar
            sx={{
              pr: "24px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{ marginRight: "36px" }}
              >
                {open ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
              <Typography component="h1" variant="h6" color="inherit" noWrap>
                {title}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {user && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: red[500], mb: 1 }}>
                    <AccountCircle />
                  </Avatar>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
              )}
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: open ? "block" : "none", // 👈 Esto lo oculta cuando open es false
          }}
        >
          <Toolbar />
          <Divider />
          <Box sx={{ overflowY: "auto", height: "calc(100vh - 64px)" }}>
            <List component="nav">
              {user && mainListItems(user)}
              <Divider sx={{ my: 1 }} />
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh", // ✅ Altura completa de la ventana
            overflowY: "auto", // ✅ Scroll solo vertical
            marginTop: theme.spacing(8),
          }}
        >
          <Container maxWidth={false} sx={{ mb: 4, mx: "auto", px: 2, mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Outlet />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

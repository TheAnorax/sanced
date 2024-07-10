import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HandymanIcon from '@mui/icons-material/Handyman';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GradingIcon from '@mui/icons-material/Grading';
import { Link } from 'react-router-dom';

export const mainListItems = (
  <React.Fragment>
    <ListItemButton component={Link} to="/dashboard">
      <ListItemIcon >
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton component={Link} to="/dashboard/productos">
      <ListItemIcon>
        <HandymanIcon />
      </ListItemIcon>
      <ListItemText primary="Productos" />
    </ListItemButton>
    <ListItemButton component={Link} to="/dashboard/pedidos">
      <ListItemIcon>
        <ListAltIcon />
      </ListItemIcon>
      <ListItemText primary="Pedidos Pendientes" />
    </ListItemButton>
    <ListItemButton component={Link} to="/dashboard/surtido">
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="En Surtido" />
    </ListItemButton>
    <ListItemButton component={Link} to="/dashboard/pedidos-surtido">
      <ListItemIcon>
        <FormatListBulletedIcon />
      </ListItemIcon>
      <ListItemText primary="Pedidos" />
    </ListItemButton>
    <ListItemButton component={Link} to="/dashboard/finalizados">
      <ListItemIcon>
        <GradingIcon />
      </ListItemIcon>
      <ListItemText primary="Finalizados" />
    </ListItemButton>
    <ListItemButton component={Link} to="/dashboard/paqueteria">
      <ListItemIcon>
        <LocalShippingIcon />
      </ListItemIcon>
      <ListItemText primary="Paqueteria" />
    </ListItemButton>
  </React.Fragment>
  
);

export default mainListItems;

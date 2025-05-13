// src/components/layout/listitems.js

import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HandymanIcon from "@mui/icons-material/Handyman";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import AodIcon from "@mui/icons-material/Aod";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import RememberMeIcon from "@mui/icons-material/RememberMe";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import DomainVerificationIcon from "@mui/icons-material/DomainVerification";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { Link } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import GarageIcon from '@mui/icons-material/Garage';
import { AdminPanelSettings } from "@mui/icons-material";
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import NavigationIcon from '@mui/icons-material/Navigation';


// Personalizando el Tooltip
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} placement="top" /> // Se agrega placement="top"
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Negro translúcido
    color: "white", // Color del texto blanco
    fontSize: theme.typography.pxToRem(12), // Tamaño del texto
    display: "flex", // Para alinear el icono y el texto
    alignItems: "center",
    padding: "8px 16px", // Añadiendo algo de padding
  },
}));

export const mainListItems = (user) => {
  const items = [
    {
      role: ["Master", "Control", "Paquet", "Admin", "Master2"],
      path: "/dashboard",
      icon: <SsidChartIcon />,
      text: "Dashboard",
    },
    {
      role: ["Master", "Admin", "Control", "Embar", "Paquet"],
      path: "/dashboard/usuarios",
      icon: <RememberMeIcon />,
      text: "Usuarios ",
    },
    {
      role: [
        "Master",
        "Control",
        "Paquet",
        "Admin",
        "Rep",
        "Master2",
        "INV",
        "Imp",
        "Audi",
        "Plan",
        "VENT",
        "CON",
        "Vent",
        "VentAdmin",
         "VENT",
         "Tran","Rep","embspb", "Dep"
      ],
      path: "/dashboard/productos",
      icon: <HandymanIcon />,
      text: "Productos",
    },
    {
      role: [  "Master", "Admin",  "INV"],
      path: "/dashboard/Catalogo",
      icon: <AodIcon />,
      text: "Catalogo",
    },
    {
      role: ["Admin", "Nac", "Nac2","Imp", "Plan", "Master","VentAdmin", ],  // Ajusta los roles que deberían ver esta opción"
      external: true,
      path: "http://192.168.3.27:3000/menu/estadisticos",
      icon: <AnalyticsIcon />,
      text: "SanPlan",
    },
    {
      role: ["Admin", "Master", "Trans", "PQ1", "Control", "EB1", "Paquet", "Embar","Tran","Rep"],
      path: "/dashboard/Trasporte",
      icon: <GarageIcon />,
      text: "Transporte",
    },
    {
      role: ["Admin", "Master", "Trans", "Rep", "Vent","VentAdmin", "VENT","Tran","Audi"],
      path: "/dashboard/Tracking",
      icon: <PlaceIcon />,
      text: "Tracking",
    },
    {
      role: ["Control", "Admin"],
      path: "/dashboard/pedidos",
      icon: <AssignmentIcon />,
      text: "Pedidos Pendientes",
    },
    {
      role: ["Master", "Control", "Admin", "Master2"],
      path: "/dashboard/surtido",
      icon: <AodIcon />,
      text: "Surtiendo",
    },
    {
      role: ["Master", "Control", "Admin", "Master2"],
      path: "/dashboard/kpi",
      icon: <AodIcon />,
      text: "kpi",
    },
    {
      role: ["Control", "Admin", "Master", "Master2", "VENT", "VentAdmin", "INV"],
      path: "/dashboard/pedidos-surtido",
      icon: <ContentPasteIcon />,
      text: "Pedidos",
    },
    {
      role: [
        "Paquet",
        "Embar",
        "Master",
        "Control",
        "Admin",
        "Rep",
        "Master2",
        "Audi",
        "VENT",
        "VentAdmin",
      ],
      path: "/dashboard/finalizados",
      icon: <PlaylistAddCheckIcon />,
      text: "Finalizados",
    },
    {
      role: ["Paquet", "Admin"],
      path: "/dashboard/paqueteria",
      icon: <LocalShippingIcon />,
      text: "Paqueteria",
    },
    {
      role: ["Admin", "Paquet"],
      path: "/dashboard/empaquetando",
      icon: <ViewQuiltIcon />,
      text: "Empacando",
    },

    {
      role: ["Embar", "Admin"],
      path: "/dashboard/embarques",
      icon: <LocalShippingIcon />,
      text: "Embarques",
    },
    {
      role: ["Admin", "Embar"],
      path: "/dashboard/embarcando",
      icon: <ViewQuiltIcon />,
      text: "Embarcando",
    },

    // {
    //   role: ["Admin"],
    //   path: "/dashboard/plan",
    //   icon: <ViewQuiltIcon />,
    //   text: "Plan",
    // },
    {
      role: ["Admin", "Control", "Embar", "Master", "Paquet"],
      path: "/dashboard/bahias",
      icon: <ViewModuleIcon />,
      text: "Bahias",
    },
    {
      role: ["Admin", "Master"],
      path: "/dashboard/ubicaciones",
      icon: <WarehouseIcon />,
      text: "Ubicaciones",
    },
    {
      role: ["Admin", "Master", "Imp", "Nac", "Ins", "Plan", "Recibo", "Nac2"],
      path: "/dashboard/compras",
      icon: <LocalGroceryStoreIcon />,
      text: "Compras",
    },
    {
      role: ["Admin", "Master", "Recibo", "INV", "VENT", "VentAdmin",],
      path: "/dashboard/recibo",
      icon: <ReceiptLongIcon />,
      text: "Producto a Recibir ",
    },
    {
      role: ["Admin", "INV", "Master"],
      path: "/dashboard/calidad",
      icon: <DomainVerificationIcon />,
      text: "Calidad ",
    },
    {
      role: [
        "Admin",
        "INV",
        "MONTA6",
        "Master",
        "Control",
        "Audi",
        "ECOMERCE",
        "Dep",
        "Recibo",
      ],
      path: "/dashboard/inventarios",
      icon: <InventoryIcon />,
      text: "Inventarios ",
    },
    {
      role: ["Admin", "Nac", "Imp", "INV", "Recibo", "Nac2", "Reporte"],
      path: "/dashboard/reporter",
      icon: <InventoryIcon />,
      text: "Reporte Recibo ",
    },

    {
      role: ["Admin", "Dep", "INV", "P", "Recibo", "Paquet", "Ins", "Master"],
      path: "/dashboard/insumos",
      icon: <AssessmentIcon />,
      text: "Insumos ",
    },
    // {
    //   role: ["Admin", "Master", "Master2" ,"INV"],
    //   path: "/dashboard/inventario",
    //   icon: <AssessmentIcon />,
    //   text: "Inventario dia 0",
    // },
    {
      role: ["Admin", "Master", "Master2","INV"],
      path: "/dashboard/muestras",
      icon: <SummarizeIcon />,
      text: "Muestras",
    },
    {
      role: ["Admin", "INV", "Master", "Audi"],
      path: "/dashboard/historial",
      icon: <CompareArrowsIcon />,
      text: "Historial de Mov",
    },
    {
      role: ["Admin", "Master"],
      path: "/dashboard/devs",
      icon: <ManageSearchIcon />,
      text: "Tareas",
    },
    {
      role: ["Admin", "Master", "RH"],
      path: "/dashboard/RH",
      icon: <ManageSearchIcon />,
      text: "RH",
    },
    {
      role: ["Admin", "Master", "Master2"],
      path: "/dashboard/Queretaro",
      icon: <MapIcon />,
      text: "Proyectos",
    },
    {
      role: ["Admin",'POLIA', 'POLIB', 'POLIP', 'POLIAR', 'CONTROL', 'RH', 'TRAFICO'],
      path: "/dashboard/visitas",
      icon: <PersonPinCircleIcon/>,
      text: "Visitas",
    },
    {
      role: ["Admin", 'CONTROL', 'RH'],
      path: "/dashboard/visitas-reporte",
      icon: <AdminPanelSettings/>,
      text: "Visitas Reporte",
    },
    {
      role: ["Master", "Control", "Admin", "Master2",  "Paquet", "Embar",],
      path: "/dashboard/Plansurtido",
      icon: <AodIcon />,
      text: "Plan",
    },
    {
      role: ["Master",  "Admin", "Master2"],
      path: "/dashboard/Mapa",
      icon: <AodIcon />,
      text: "Mapa",
    },
    {
      role: ["Admin", "Master", "Trans", "Tran"],
      path: "/dashboard/COBERTURA",
      icon: <NavigationIcon />,
      text: "COBERTURA",
    },
    
    
  ];

  return (
    <React.Fragment>
      {items
        .filter((item) => item.role.includes(user.role))
        .map((item, index) => (
          // <ListItemButton component={Link} to={item.path} key={index}>
          //   <CustomTooltip
          //     title={
          //       <React.Fragment>
          //         <InfoIcon sx={{ mr: 1, fontSize: "small" }} />{" "}
          //         {/* Icono dentro del tooltip */}
          //         {item.text}
          //       </React.Fragment>
          //     }
          //   >
          //     <ListItemIcon>{item.icon}</ListItemIcon>{" "}
          //     {/* Tooltip solo en el ícono */}
          //   </CustomTooltip>
          //   <ListItemText primary={item.text} />
          // </ListItemButton>
          item.external ? (
            <ListItemButton
              component="a"
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <CustomTooltip
                title={
                  <React.Fragment>
                    <InfoIcon sx={{ mr: 1, fontSize: "small" }} />
                    {item.text}
                  </React.Fragment>
                }
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
              </CustomTooltip>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ) : (
            <ListItemButton component={Link} to={item.path} key={index}>
              <CustomTooltip
                title={
                  <React.Fragment>
                    <InfoIcon sx={{ mr: 1, fontSize: "small" }} />
                    {item.text}
                  </React.Fragment>
                }
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
              </CustomTooltip>
              <ListItemText primary={item.text} />
            </ListItemButton>
          )
          
        ))}
    </React.Fragment>
  );
};

export default mainListItems;

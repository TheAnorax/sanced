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
import GarageIcon from "@mui/icons-material/Garage";
import { AdminPanelSettings } from "@mui/icons-material";
import PlaceIcon from "@mui/icons-material/Place";
import MapIcon from "@mui/icons-material/Map";
import NavigationIcon from "@mui/icons-material/Navigation";
import FileUploadIcon from '@mui/icons-material/FileUpload';

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
      role: ["MASTER","AdminAudi", "Control", "Paquet", "Admin", "Master2"],
      path: "/dashboard",
      icon: <SsidChartIcon />,
      text: "Dashboard",
    },
    {
      role: ["MASTER","AdminAudi", "Admin", "Control", "Embar", "Paquet"],
      path: "/dashboard/usuarios",
      icon: <RememberMeIcon />,
      text: "Usuarios ",
    },
    {
      role: [
        "MASTER","AdminAudi",
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
        "VENT2",
        "VENT3","VentAdmin",
        "CON",
        "Vent",
        "VentAdmin",
        "VENT",
        "Tran",
        "AdminTran",
        "Rep",
        "embspb",
        "Dep",
        "Nac2",
        "Mues",
        "Nac",
        "VEN",
        "CALI",
        "Recibo",
        "ECOMERCE"
      ],
      path: "/dashboard/productos",
      icon: <HandymanIcon />,
      text: "Productos",
    },
    {
      role: ["MASTER","AdminAudi", "Admin", "INV"],
      path: "/dashboard/Catalogo",
      icon: <AodIcon />,
      text: "Catalogo",
    },
    {
      role: [
        "Admin",
        "Nac",
        "Nac2",
        "Imp",
        "Plan",
        "MASTER","AdminAudi",
        "VentAdmin",
        "VEN",
        "VENT2",        
        "VENT3","VentAdmin",
      ], // Ajusta los roles que deberían ver esta opción"
      external: true,
      path: "http://66.232.105.108:3000/menu/estadisticos",
      icon: <AnalyticsIcon />,
      text: "SanPlan",
    },
    {
      role: [
        "Admin",
        "MASTER","AdminAudi",
        "Trans",
        "PQ1",
        "Control",
        "EB1",
        "Paquet",
        "Embar",
        "Tran",
        "AdminTran",
        "Rep",
      ],
      path: "/dashboard/Trasporte",
      icon: <GarageIcon />,
      text: "Transporte",
    },
    {
      role: [
        "Admin",
        "MASTER","AdminAudi",
        "Trans",
        "AdminTran",
        "Rep",
        "Vent",
        "VentAdmin",
        "VENT",
        "VENT2",
        "VENT3","VentAdmin",
        "Tran",
        "AdminTran",
        "Audi",
      ],
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
      role: ["MASTER","AdminAudi", "Control", "Admin", "Master2"],
      path: "/dashboard/surtido",
      icon: <AodIcon />,
      text: "Surtiendo",
    },
    {
      role: ["MASTER","AdminAudi", "Control", "Admin", "Master2", "Paquet"],
      path: "/dashboard/kpi",
      icon: <AodIcon />,
      text: "kpi",
    },
    {
      role: [
        "Control",
        "Admin",
        "MASTER","AdminAudi",
        "Master2",
        "VENT",
        "VentAdmin",
        "INV",
        "VEN",
        "VENT2",
      ],
      path: "/dashboard/pedidos-surtido",
      icon: <ContentPasteIcon />,
      text: "Pedidos",
    },
    {
      role: [
        "Paquet",
        "Embar",
        "MASTER","AdminAudi",
        "Control",
        "Admin",
        "Rep",
        "Master2",
        "Audi",
        "VENT",
        "VENT3","VentAdmin",
        "VentAdmin",
        "INV",
        "VEN",
        "VENT2",
        "Tran",
        "AdminTran",
      ],
      path: "/dashboard/finalizados",
      icon: <PlaylistAddCheckIcon />,
      text: "Finalizados",
    },
    {
      role: ["Paquet", "Admin", "MASTER","AdminAudi"],
      path: "/dashboard/paqueteria",
      icon: <LocalShippingIcon />,
      text: "Paqueteria",
    },
    {
      role: ["Admin", "Paquet", "MASTER","AdminAudi"],
      path: "/dashboard/empaquetando",
      icon: <ViewQuiltIcon />,
      text: "Empacando",
    },

    {
      role: ["Embar", "Admin", "MASTER","AdminAudi"],
      path: "/dashboard/embarques",
      icon: <LocalShippingIcon />,
      text: "Embarques",
    },
    {
      role: ["Admin", "Embar", "MASTER","AdminAudi"],
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
      role: ["Admin", "Control", "Embar", "MASTER","AdminAudi", "Paquet", "INV", 
        "ECOMERCE"],
      path: "/dashboard/bahias",
      icon: <ViewModuleIcon />,
      text: "Bahias",
    },
    {
      role: ["Admin", "MASTER","AdminAudi"],
      path: "/dashboard/ubicaciones",
      icon: <WarehouseIcon />,
      text: "Ubicaciones",
    },
    {
      role: ["Admin", "MASTER","AdminAudi", "Imp", "Nac", "Ins", "Plan", "Recibo", "Nac2", "INV"],
      path: "/dashboard/compras",
      icon: <LocalGroceryStoreIcon />,
      text: "Compras",
    }, 
    {
      role: [
        "Admin",
        "MASTER","AdminAudi",
        "Recibo",
        "INV",
        "VENT",
        "VentAdmin",
        "VENT3","VentAdmin",
        "VEN",
        "VENT2",
      ],
      path: "/dashboard/recibo",
      icon: <ReceiptLongIcon />,
      text: "Producto a Recibir ",
    },
    {
      role: ["Admin", "INV", "MASTER","AdminAudi"],
      path: "/dashboard/calidad",
      icon: <DomainVerificationIcon />,
      text: "Calidad ",
    },
    {
      role: [
        "Admin",
        "INV",
        "MONTA6",
        "MASTER","AdminAudi",
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
      role: [
        "Admin",
        "Nac",
        "Imp",
        "INV",
        "Recibo",
        "Nac2",
        "Reporte",
        "MASTER","AdminAudi",
      ],
      path: "/dashboard/reporter",
      icon: <InventoryIcon />,
      text: "Reporte Recibo ",
    },

    {
      role: ["Admin", "Dep", "INV", "P", "Recibo", "Paquet", "Ins", "MASTER","AdminAudi"],
      path: "/dashboard/insumos",
      icon: <AssessmentIcon />,
      text: "Insumos ",
    },
    // {
    //   role: ["Admin", "MASTER","AdminAudi", "Master2" ,"INV"],
    //   path: "/dashboard/inventario",
    //   icon: <AssessmentIcon />,
    //   text: "Inventario dia 0",
    // },
    {
      role: [
        "Admin",
        "MASTER","AdminAudi",
        "Master2",
        "INV",
        "Nac",
        "Mue",
        "Audi",
        "Nac2",
        "Ins",
        "Mues",
      ],
      path: "/dashboard/muestras",
      icon: <SummarizeIcon />,
      text: "Muestras",
    },
    {
      role: ["Admin", "INV", "MASTER","AdminAudi", "Audi"],
      path: "/dashboard/historial",
      icon: <CompareArrowsIcon />,
      text: "Historial de Mov",
    },
    {
      role: ["Admin", "MASTER"],
      path: "/dashboard/devs",
      icon: <ManageSearchIcon />,
      text: "Tareas",
    },
    {
      role: ["Admin", "MASTER"],
      path: "/dashboard/RH",
      icon: <ManageSearchIcon />,
      text: "RH",
    },
    {
      role: ["Admin", "MASTER", "Master2", "VENT3","VentAdmin", "Pro"],
      path: "/dashboard/Queretaro",
      icon: <MapIcon />,
      text: "Proyectos",
    },
    {
      role: [
        "Admin",
        "POLIA",
        "POLIB",
        "POLIP",
        "POLIAR",
        "CONTROL",
        "RH",
        "TRAFICO",
        "Tran",
        "AdminTran",
        "MASTER",
      ],
      path: "/dashboard/visitas",
      icon: <PersonPinCircleIcon />,
      text: "Visitas",
    },
    {
      role: ["Admin", "CONTROL", "RH","MASTER"],
      path: "/dashboard/visitas-reporte",
      icon: <AdminPanelSettings />,
      text: "Visitas Reporte",
    },
    {
      role: ["MASTER","AdminAudi", "Control", "Admin", "Master2", "Paquet", "Embar"],
      path: "/dashboard/Plansurtido",
      icon: <AodIcon />,
      text: "Plan",
    },
    {
      role: ["MASTER", "Admin", "Master2", "AdminTran","VentAdmin"],
      path: "/dashboard/Mapa",
      icon: <AodIcon />,
      text: "Mapa",
    },
    {
      role: ["Admin", "MASTER","AdminAudi", "Trans", "Tran", "AdminTran",],
      path: "/dashboard/COBERTURA",
      icon: <NavigationIcon />,
      text: "COBERTURA",
    },
    {
      role: ["Admin"],
      path: "/dashboard/RepoProb",
      icon: <ManageSearchIcon />,
      text: "Reportar Problema",
    },
        {
      role: ["Admin"],
      path: "/dashboard/Mercado-Libre",
      icon: <ManageSearchIcon />,
      text: "Mercado Libre",
    },
        {
      role: ["Admin"],
      path: "/dashboard/Traspasos",
      icon: <FileUploadIcon />,
      text: "Traspasos",
    },
  ];

  return (
    <React.Fragment>
      {items
        .filter((item) => item.role.includes(user.role))
        .map((item, index) =>
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
        )}
    </React.Fragment>
  );
};

export default mainListItems;

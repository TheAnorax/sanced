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
import FileUploadIcon from "@mui/icons-material/FileUpload";

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
      role: ["Master", "AdminAudi", "Control", "Paquet", "Admin", "MASTER", "Master2"],
      path: "/dashboard",
      icon: <SsidChartIcon />,
      text: "Dashboard",
    },
    {
      role: ["Master", "AdminAudi", "Admin", "Control", "Embar", "Paquet" , "MONT", "Master2"],
      path: "/dashboard/usuarios",
      icon: <RememberMeIcon />,
      text: "Usuarios ",
    },
    {
      role: [
        "Master",
        "AdminAudi",
        "Control",
        "Paquet",
        "Admin", "MASTER",
        "Rep",
        "Master2",
        "INV",
        "Imp",
        "Audi",
        "Plan",
        "VENT",
        "VENT2",
        "VENT3",
        "VentAdmin",
        "CON",
        "Vent",
        "VentAdmin",
        "VENT",
        "VENTN",
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
        "ECOMERCE",
        "VENT2",
        "Trans",
      ],
      path: "/dashboard/productos",
      icon: <HandymanIcon />,
      text: "Productos",
    },
    {
      role: ["Master", "AdminAudi", "Admin",  "INV",  "MONT"],
      path: "/dashboard/Catalogo",
      icon: <AodIcon />,
      text: "Catalogo",
    },
    {
      role: [
        "Admin", "MASTER",
        "Nac",
        "Nac2",
        "Imp",
        "Plan",
        "Master",
        "AdminAudi",
        "VentAdmin",
        "VEN",
        "VENT2",
        "VENT3",
        "VentAdmin",      
        "VENTN", "Master2"
      ], // Ajusta los roles que deberían ver esta opción"
      external: true,
      path: "http://66.232.105.108:3000/menu/estadisticos",
      icon: <AnalyticsIcon />,
      text: "SanPlan",
    },
    {
      role: [
        "Admin", 
        "Master",
        "AdminAudi",
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
        "AdminTran",
      ],
      path: "/dashboard/AdminTransportes",
      icon: <GarageIcon />,
      text: "Admin Transporte",
    },
    {
      role: [
        "Admin", 
        "Master",
        "AdminAudi",
        "Trans",
        "AdminTran",
        "Rep",
        "Vent",
        "VentAdmin",
        "VENT",
        "VENT2",
        "VENT3",
        "VENTN",
        "VentAdmin",
        "Tran",
        "AdminTran",
        "Audi", "Master2"
      ],
      path: "/dashboard/Tracking",
      icon: <PlaceIcon />,
      text: "Tracking",
    },
    {
      role: ["Control", "Admin",  "Master"],
      path: "/dashboard/pedidos",
      icon: <AssignmentIcon />,
      text: "Pedidos Pendientes",
    },
    {
      role: ["Master", "AdminAudi", "Control", "Admin", "MASTER", "Master2", "Embar"],
      path: "/dashboard/surtido",
      icon: <AodIcon />,
      text: "Surtiendo",
    },
    {
      role: [
        "Master",
        "AdminAudi",
        "Control",
        "Admin", 
        "Master2",
        "Paquet",
        "AdminTran",
        "Embar",
        "Trans",
      ],
      path: "/dashboard/kpi",
      icon: <AodIcon />,
      text: "kpi",
    },
    {
      role: [
        "Control",
        "Admin",
        "Master",
        "AdminAudi",
        "Master2",
        "VENT",
        "VentAdmin",
        "INV",
        "VEN",
        "VENT2",
        "VENTN",
        "Master",
      ],
      path: "/dashboard/pedidos-surtido",
      icon: <ContentPasteIcon />,
      text: "Pedidos",
    },
    {
      role: [
        "Paquet",
        "Embar",
        "Master",
        "AdminAudi",
        "Control",
        "Admin", "MASTER",
        "Rep",
        "Master2",
        "Audi",
        "VENT",
        "VENT3",
        "VentAdmin",
        "VentAdmin",
        "INV",
        "VEN",
        "VENT2",
        "Tran",
        "Trans",
        "AdminTran",
        "VENTN",
      ],
      path: "/dashboard/finalizados",
      icon: <PlaylistAddCheckIcon />,
      text: "Finalizados",
    },
    {
      role: ["Paquet", "Admin", "Master", "AdminAudi", "Embar", "Master2"],
      path: "/dashboard/paqueteria",
      icon: <LocalShippingIcon />,
      text: "Paqueteria",
    },
    {
      role: ["Admin", "Paquet", "Master", "AdminAudi", "Master2"],
      path: "/dashboard/empaquetando",
      icon: <ViewQuiltIcon />,
      text: "Empacando",
    },

    {
      role: ["Embar", "Admin", "Master", "AdminAudi", "Master2"],
      path: "/dashboard/embarques",
      icon: <LocalShippingIcon />,
      text: "Embarques",
    },
    {
      role: ["Admin", "Embar", "Master", "AdminAudi", "Master2"],
      path: "/dashboard/embarcando",
      icon: <ViewQuiltIcon />,
      text: "Embarcando",
    },

    {
      role: [
        "Admin", 
        "AdminTran",
        "Trans",
        "Master",
        "VentAdmin",
        "Master",
        "AdminAudi",
        "Control",
        "Master2",
        "Paquet",
        "Embar",
        "AdminTran",
        "Trans",
        "VentAdmin",
        "VENTN",
      ],
      path: "/dashboard/plan",
      icon: <ViewQuiltIcon />,
      text: "EL Plan",
    },
    {
      role: [
        "Master",
        "AdminAudi",
        "Control",
        "Master2",
        "Paquet",
        "Embar",
        "AdminTran",
        "Trans",
        "VentAdmin",
        "VENTN",
        "Admin",
      ],
      path: "/dashboard/Plansurtido",
      icon: <AodIcon />,
      text: "Plan",
    },
    {
      role: [
        "Admin", "MASTER",
        "Control",
        "Embar",
        "Master",
        "AdminAudi",
        "Paquet",
        "INV",
        "ECOMERCE", "Master2"
      ],
      path: "/dashboard/bahias",
      icon: <ViewModuleIcon />,
      text: "Bahias",
    },
    // {
    //   role: ["Admin", "Master", "AdminAudi"],
    //   path: "/dashboard/ubicaciones",
    //   icon: <WarehouseIcon />,
    //   text: "Ubicaciones",
    // },
    {
      role: [
        "Admin", "MASTER",
        "Master",
        "AdminAudi",
        "Imp",
        "Nac",
        "Ins",
        "Plan",
        "Recibo",
        "Nac2",
        "INV",
        "Master",
        "VentAdmin", "Master2"
      ],
      path: "/dashboard/compras",
      icon: <LocalGroceryStoreIcon />,
      text: "Compras",
    },
    {
      role: [
        "Admin", "MASTER",
        "Master",
        "AdminAudi",
        "Recibo",
        "INV",
        "VENT",
        "VentAdmin",
        "VENT3",
        "VentAdmin",
        "VEN",
        "VENT2",
        "VENTN", "Master2"
      ],
      path: "/dashboard/recibo",
      icon: <ReceiptLongIcon />,
      text: "Producto a Recibir ",
    },
    {
      role: ["Admin", "INV", "Master", "AdminAudi", "Master2"],
      path: "/dashboard/calidad",
      icon: <DomainVerificationIcon />,
      text: "Calidad ",
    },
    {
      role: [
        "Admin", "MASTER",
        "INV",
        "MONTA6",
        "Master",
        "AdminAudi",
        "Control",
        "Audi",
        "ECOMERCE",
        "Dep",
        "Recibo",
        "Volu", "Master2"
      ],
      path: "/dashboard/inventarios",
      icon: <InventoryIcon />,
      text: "Inventarios ",
    },
    {
      role: [
        "Admin", "MASTER",
        "Nac",
        "Imp",
        "INV",
        "Recibo",
        "Nac2",
        "Reporte",
        "Master",
        "AdminAudi", "Master2"
      ],
      path: "/dashboard/reporter",
      icon: <InventoryIcon />,
      text: "Reporte Recibo ",
    },

    {
      role: [
        "Admin",
        "Dep",
        "INV",
        "P",
        "Recibo",
        "Paquet",
        "Ins",
        "Master",
        "AdminAudi", "Master2"
      ],
      path: "/dashboard/insumos",
      icon: <AssessmentIcon />,
      text: "Insumos ",
    },
    // {
    //   role: ["Admin", "ADMIN","MASTER","master", "Master"],
    //   path: "/dashboard/inventario",
    //   icon: <AssessmentIcon />,
    //   text: "Inventario dia 0",
    // },
    {
      role: [
        "Admin", 
        "Master",
        "AdminAudi",
        "Master2",
        "INV",
        "Nac",
        "Mue",
        "Audi",
        "Nac2",
        "Ins",
        "Mues",
        "Muetras"
      ],
      path: "/dashboard/muestras",
      icon: <SummarizeIcon />,
      text: "Muestras",
    },
    {
      role: ["Admin", "INV", "Master", "MASTER", "AdminAudi", "Audi", "MONT" , "Master2"],
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
    // {
    //   role: ["Admin", "Master"],
    //   path: "/dashboard/RH",
    //   icon: <ManageSearchIcon />,
    //   text: "RH",
    // },
    // {
    //   role: ["Admin", "Master", "MASTER", "Master2", "VENT3", "VentAdmin", "Pro"],
    //   path: "/dashboard/Queretaro",
    //   icon: <MapIcon />,
    //   text: "Proyectos",
    // },

     {
      role: ["Admin","RH"],
      path: "/dashboard/RH-CEDIS",
      icon: <ManageSearchIcon />,
      text: "RH. CEDIS",
    },

    {
      role: [
        "Admin", "MASTER",
        "POLIA",
        "POLIB",
        "POLIP",
        "POLIAR",
        "CONTROL",
        "RH",
        "TRAFICO",
        "Tran",
        "AdminTran",
        "Master",
      ],
      path: "/dashboard/visitas",
      icon: <PersonPinCircleIcon />,
      text: "Visitas",
    },
    {
      role: ["Admin", "CONTROL", "RH", "Master"],
      path: "/dashboard/visitas-reporte",
      icon: <AdminPanelSettings />,
      text: "Visitas Reporte",
    },

    {
      role: ["Master", "Admin",  "Master2", "AdminTran", "VentAdmin"],
      path: "/dashboard/Mapa",
      icon: <AodIcon />,
      text: "Mapa",
    },
    {
      role: ["Admin", "Master", "AdminAudi", "Trans", "Tran", "AdminTran"],
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
      role: ["Admin","Master","INV"],
      path: "/dashboard/Traspasos",
      icon: <FileUploadIcon />,
      text: "Traspasos",
    },
    {
      role: ["Admin","Master"],
      path: "/dashboard/Check",
      icon: <FileUploadIcon />,
      text: "Check",
    },
    {
      role: ["Admin","MASTER2","Dep","Master","Muetras","AdminTran","Tran"],
      path: "/dashboard/Departamental",
      icon: <FileUploadIcon />,
      text: "Departamental",
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

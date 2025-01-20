import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  TextField,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Typography,
  Modal,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Table,
  TableBody,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuItem from "@mui/material/MenuItem";
import ExposureIcon from "@mui/icons-material/Exposure";
import Tooltip from "@mui/material/Tooltip";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./logob.png";
import { UserContext } from "../context/UserContext";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 3px 6px rgba(0,0,0,0.16)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { marginBottom: "16px" },
      },
    },
  },
});

function Insumos() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [includeObservation, setIncludeObservation] = useState(false);
  const [observation, setObservation] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const { user } = useContext(UserContext);
  const [openModal, setOpenModal] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConsumeForm, setOpenConsumeForm] = useState(false);
  const [tabValue, setTabValue] = useState(0); // Inicializa tabValue a 0
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [consecutiveNumber, setConsecutiveNumber] = useState(1); // Estado para el número consecutivo
  const [folio, setFolio] = useState(""); // Estado para el folio
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleGenerateReport = () => {
    setIncludeObservation(false); // Resetea la selección para observación
    incrementConsecutiveNumber();
    handleOpenModal(); // Abre el modal
  };

  const handleObservationSubmit = () => {
    generateLowInventoryReport(includeObservation ? observation : "");
    handleCloseModal(); // Cierra el modal
  };

  const [newInsumoData, setNewInsumoData] = useState({
    codigopropuesto: "",
    minimofabricacion: "",
    descripcion: "",
    caracteristicas: "",
    inventario: "",
    tiempodefabricacion: "",
    um: "",
    consumomensual: "",
    inventarioptimo: "",
    inventariominimo: "",
    requerimiento: "",
    area: "",
  });

  const [insumoData, setInsumoData] = useState({
    codigopropuesto: "",
    cantidad_entrada: "",
    fecha_entrada: "",
    responsable_entrada: "",
    nombre: "",
    cantidad_reducida: "",
    fecha_salida: "",
    responsable_salida: "",
  });

  const [consumeData, setConsumeData] = useState({
    codigopropuesto: "",
    cantidad_reducida: "",
    responsable_salida: "",
    entregado_a: "",
  });

  const [reducedInsumoData, setReducedInsumoData] = useState({
    codigopropuesto: "",
    nombre: "",
    cantidad_reducida: "",
    fecha_salida: "",
    area: "",
    responsable_salida: "",
  });

  const fetchInsumos = async () => {
    try {
      const response = await axios.get("http://192.168.3.27:3007/insumo/lista");
      const data = response.data.resultado.list;

      // Procesamos los insumos para calcular el requerimiento basado en la diferencia
      const updatedData = data.map((insumo) => {
        const inventario = Number(insumo.inv);
        const inventarioMinimo = Number(insumo.inventariomin);
        let requerimiento = 0;

        // Si el inventario actual es menor que el inventario mínimo
        if (inventario < inventarioMinimo) {
          // La diferencia se calcula como lo que falta para llegar al inventario mínimo
          requerimiento = inventarioMinimo - inventario;
        }

        return { ...insumo, requerimiento }; // Actualizamos el requerimiento
      });

      // Actualizamos los insumos con el campo requerimiento
      setInsumos(updatedData);
      setFilteredInsumos(updatedData);
    } catch (error) {
      console.error("Error fetching insumos:", error);
      setInsumos([]);
      setFilteredInsumos([]);
    }
  };

  const generateLowInventoryReport = (observationText) => {
    const lowInventoryByConsumption = insumos.filter((insumo) => {
      const requerimiento = Number(insumo.requerimiento);

      if (isNaN(requerimiento)) {
        console.warn(
          `Valor no válido para el producto ${insumo.id_codigo} (requerimiento: ${insumo.requerimiento})`
        );
        return false;
      }

      // Solo incluye productos cuyo requerimiento sea mayor a 0
      return requerimiento > 0;
    });

    console.log(
      "Productos con inventario menor al consumo mensual o inventario en 0:",
      lowInventoryByConsumption
    );

    if (lowInventoryByConsumption.length === 0) {
      alert(
        "No hay productos cuyo inventario sea menor al consumo mensual o en 0."
      );
      return;
    }

    const printableContent = `
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Informe de Inventario Bajo por Consumo</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 10px;
                                color: #000;
                                margin: 0;
                                padding: 0;
                            }
                            .container {
                                width: 100%;
                                max-width: 800px;
                                margin: 0 auto;
                                border: 1px solid #000;
                                padding: 10px;
                                box-sizing: border-box;
                            }
                            .header, .footer {
                                text-align: center;
                                margin-bottom: 10px;
                            }
                            .header img {
                                height: 50px;
                                vertical-align: middle;
                            }
                            .header table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            .header td {
                                padding: 5px;
                                border: 1px solid #000;
                                text-align: center;
                            }
                            .main-content table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 10px;
                            }
                            .main-content th, .main-content td {
                                border: 1px solid #000;
                                padding: 5px;
                                text-align: left;
                            }
                            .signatures {
                                margin-top: 20px;
                                text-align: center;
                            }
                            .signatures div {
                                display: inline-block;
                                width: 45%;
                                margin: 0 10px;
                                border-top: 1px solid #000;
                                padding-top: 5px;
                            }
                            .footer {
                                display: none; /* Ocultar pie de página por defecto */
                                position: fixed;
                                bottom: 0;
                                width: 100%;
                                text-align: center;
                            }
                            @media print {
                                body {
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    border: none;
                                }
                                .footer {
                                    display: block;
                                    position: absolute;
                                    bottom: 0;
                                    left: 0;
                                    right: 0;
                                }
                            }
                        </style>
                        <script>
                            function updateFooterVisibility() {
                                var pageCount = Math.ceil(document.body.scrollHeight / window.innerHeight);
                                var footer = document.querySelector('.footer');

                                if (pageCount > 1) {
                                    footer.style.display = 'block';
                                } else {
                                    footer.style.display = 'none';
                                }
                            }

                            window.onbeforeprint = updateFooterVisibility;
                        </script>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td rowspan="3"><img src="${logo}" alt="Santul" /></td>
                                            <td colspan="3">Título del Documento</td>
                                            <td>Fecha de emisión:</td>
                                            <td>${new Date().toLocaleDateString()}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="3">REQUERIMIENTO DE PRODUCTOS ESPECIALES</td>
                                            <td>Remplaza a la Rev.:</td>
                                            <td>000</td>
                                        </tr>
                                        <tr>
                                            <td colspan="3">Formato</td>
                                            <td>Realizo:</td>
                                            <td>${user.name}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2">SISTEMA DE GESTIÓN DE LA CALIDAD</td>
                                            <td>Código:</td>
                                            <td>FT-COM-001</td>
                                            <td>Revisó:</td>
                                            <td>Janett Torres</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2">Departamento Solicitante</td>
                                            <td colspan="2">CEDIS</td>
                                            <td>Folio:</td>
                                            <td>${folio}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2">Usuario y Correo</td>
                                            <td colspan="4">${user.name} - ${
      user.email
    }</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2">Observaciones</td>
                                            <td colspan="4">${
                                              observationText ||
                                              "Sin Observaciones"
                                            }</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="main-content">
                                <table>
                                    <tbody>
                                        <tr>
                                            <th>Código o modelo</th>
                                            <th>Requerimiento</th>
                                            <th>Unidad de Medida</th>
                                            <th>Descripción detallada del producto o servicio solicitado</th>
                                            <th>Dónde se utilizará</th>
                                        </tr>
                                        ${lowInventoryByConsumption
                                          .map(
                                            (producto) => `
                                            <tr>
                                                <td>${producto.id_codigo}</td>
                                                <td>${producto.requerimiento}</td>
                                                <td>${producto.um}</td>
                                                <td>${producto.desc}</td>
                                                <td>CEDIS</td>
                                            </tr>
                                        `
                                          )
                                          .join("")}
                                    </tbody>
                                </table>
                            </div> 
                            <div class="signatures"  style="margin-top: 300px;">
                                <div>Nombre y firma Solicitante</div>
                                <div>Nombre y firma Gerente que autoriza</div>
                            </div>
                    
                            <div>
                                <p style="display: flex; justify-content: space-between;">
                                    Procedimiento PR-COM-003 
                                    <span>Formato FT-COM-001 Rev.</span>
                                    <span>Procedimiento PR-COM-004</span>
                                </p>
                                <p>Este documento es propiedad de Santul Herramientas S.A. de C.V., por lo que se prohíbe a terceros su reproducción, transmisión o impresión parcial o total sin previa autorización de la organización</p>
                            </div>
                        </div>
                    </body>
                    </html>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();

      // Mensaje para WhatsApp
      const message = `
                        Hola, se ha generado un informe de inventario bajo en Insumos. 
                        Observaciones: ${
                          observationText || "Sin Observaciones"
                        }.
                        Fecha: ${new Date().toLocaleDateString()}.
                    `;
      const phoneNumber = "5524433962"; // Número de teléfono destino
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

      // Abrir WhatsApp después de generar el reporte
      window.open(whatsappURL, "_blank");
    };
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    const filtered = insumos.filter((insumo) =>
      insumo.id_codigo.toLowerCase().includes(searchTerm)
    );
    setFilteredInsumos(filtered);
  };

  const filterProductos = (searchTerm) => {
    const filtered = productos.filter(
      (producto) =>
        producto.codigopropuesto &&
        String(producto.codigopropuesto)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(filtered);
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  useEffect(() => {
    setFilteredInsumos(
      insumos.filter(
        (insumo) =>
          insumo.desc &&
          insumo.desc.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, insumos]);

  useEffect(() => {
    const storedConsecutiveNumber = localStorage.getItem("consecutiveNumber");
    if (storedConsecutiveNumber) {
      setConsecutiveNumber(parseInt(storedConsecutiveNumber, 10));
    }
  }, []);

  useEffect(() => {
    if (user && user.name) {
      generateFolio(user.name, consecutiveNumber);
    }
  }, [user, consecutiveNumber]);

  const generateFolio = (fullName, consecutive) => {
    const nameParts = fullName.split(" ");
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial =
      nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
    const formattedNumber = String(consecutive).padStart(4, "0");

    const generatedFolio = `${firstInitial}${lastInitial}-${formattedNumber}`;
    setFolio(generatedFolio);
  };

  const incrementConsecutiveNumber = () => {
    const newConsecutiveNumber = consecutiveNumber + 1;
    setConsecutiveNumber(newConsecutiveNumber);
    localStorage.setItem("consecutiveNumber", newConsecutiveNumber);
  };

  const handleView = async (insumo) => {
    try {
      const requestBody = {
        codigopropuesto: insumo.id_codigo,
      };

      const response = await axios.post(
        "http://192.168.3.27:3007/insumo/obtnercodigo",
        requestBody
      );
      const data = response.data.resultado.list[0];

      setSelectedInsumo(data);
      setOpen(true);

      // Mostrar los datos del insumo al abrir el modal
      console.log("Datos del insumo al abrir el modal:", data);
    } catch (error) {
      console.error("Error fetching insumo details:", error);
    }
  };

  const fetchInsumoData = async () => {
    try {
      const response = await fetch(
        "http://192.168.3.27:3007/insumo/Insumosagregados"
      );
      const data = await response.json();
      if (data.resultado && !data.resultado.error) {
        setInsumoData(data.resultado.list);
        console.error("Error en la respuesta:", data.resultado.mensaje);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddNewInsumo = async () => {
    const isAnyFieldEmpty = Object.values(newInsumoData).some(
      (value) => value.trim() === ""
    );

    if (isAnyFieldEmpty) {
      setAlertMessage("Por favor, completa todos los campos.");
      setAlertOpen(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/insumo/newinsumo",
        newInsumoData
      );
      console.log("Nuevo insumo agregado:", response.data);
      fetchInsumos();
      handleFormClose();
    } catch (error) {
      console.error("Error adding new insumo:", error);
    }
  };

  const handleConsumeInsumo = async () => {
    if (!selectedInsumo) {
      console.error("No se ha seleccionado un insumo.");
      setAlertMessage("No se ha seleccionado un insumo.");
      setAlertOpen(true);
      return; // No continúes si no hay insumo seleccionado
    }

    const inventario = Number(selectedInsumo.inv); // Convierte el inventario a un número
    const cantidadReducida = Number(consumeData.cantidad_reducida); // Convierte la cantidad reducida a un número

    console.log("Inventario disponible:", inventario);
    console.log("Cantidad reducida:", cantidadReducida);

    if (isNaN(inventario) || isNaN(cantidadReducida)) {
      console.error("Inventario o cantidad reducida no válidos.");
      setAlertMessage("Inventario o cantidad reducida no válidos.");
      setAlertOpen(true);
      return;
    }

    // Verificamos si la cantidad a reducir no excede el inventario disponible
    if (cantidadReducida > inventario) {
      console.error("La cantidad a reducir excede el inventario disponible.");
      setAlertMessage("La cantidad a reducir excede el inventario disponible.");
      setAlertOpen(true);
      return;
    }

    // Si la validación es exitosa, proceder con la actualización del inventario
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/insumo/updateinventario",
        consumeData
      );

      if (response.data.error) {
        console.error(
          "Error en la respuesta del servidor:",
          response.data.message
        );
        setAlertMessage(response.data.message);
        setAlertOpen(true);
      } else {
        console.log("Reducción exitosa en el servidor.");

        // Recargar los insumos para reflejar la reducción
        fetchInsumos(); // Refresca la lista de insumos

        // Opcional: puedes actualizar el estado local directamente si es necesario
        setInsumos((prevInsumos) =>
          prevInsumos.map((insumo) =>
            insumo.id_codigo === selectedInsumo.id_codigo
              ? { ...insumo, inv: insumo.inv - cantidadReducida }
              : insumo
          )
        );

        handleConsumeFormClose(); // Cierra el formulario de consumo
      }
    } catch (error) {
      console.error("Error al consumir insumo:", error);
      setAlertMessage("Error al consumir insumo.");
      setAlertOpen(true);
    }

    console.log(
      "Inventario después de reducción:",
      inventario - cantidadReducida
    );
  };

  const handleUpdate = async () => {
    if (!selectedInsumo) return;

    const { codigopropuesto, ...dataToUpdate } = selectedInsumo;

    // Calculamos el requerimiento basado en el nuevo inventario
    const inventario = Number(dataToUpdate.inventario);
    const inventarioMinimo = Number(dataToUpdate.inventariominimo);
    let requerimiento = 0;

    if (inventario < inventarioMinimo) {
      requerimiento = inventarioMinimo - inventario;
    }

    // Actualizamos el requerimiento
    const updatedData = { ...dataToUpdate, requerimiento };

    const requestBody = { codigopropuesto, ...updatedData };

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/insumo/modifyInsumo",
        requestBody
      );

      if (response.data.error) {
        console.error(
          "Error en la respuesta del servidor:",
          response.data.message
        );
      } else {
        fetchInsumos();
        handleClose();
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const handleIngresoInsumos = async () => {
    const isAnyFieldEmpty = Object.values(ingresoData).some(
      (value) => String(value).trim() === ""
    );

    if (isAnyFieldEmpty) {
      setAlertMessage("Por favor, completa todos los campos.");
      setAlertOpen(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/insumo/ingresoInsumos",
        ingresoData
      );
      console.log("Insumos agregados:", response.data);

      handleConsumeFormClose();
      fetchInsumos();
    } catch (error) {
      console.error("Error al agregar insumos:", error);
    }
  };

  const fetchReducedInsumoData = async () => {
    try {
      const response = await fetch(
        "http://192.168.3.27:3007/insumo/Insumosreducidos"
      );
      const data = await response.json();
      console.log("Datos reducidos obtenidos:", data);
      setReducedInsumoData(data.resultado.list);
    } catch (error) {
      console.error("Error fetching reduced insumo data:", error);
    }
  };

  const handleFilterToggle = () => {
    if (isFiltered) {
      setFilteredInsumos(insumos);
    } else {
      const filtered = insumos.filter(
        (insumo) =>
          insumo.inv === 0 ||
          (insumo.inv > 0 && insumo.inv <= insumo.inventariomin)
      );
      setFilteredInsumos(filtered);
    }
    setIsFiltered(!isFiltered);

    document
      .getElementById("insumo-container")
      .classList.toggle("scrollable", !isFiltered);
  };

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);

  const handleShowInsumo = async () => {
    await fetchInsumoData();
    handleModalOpen();
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInsumo(null);
  };

  const handleFormOpen = () => {
    setOpenForm(true);
  };

  const handleConsumeFormOpen = (insumo) => {
    console.log("Insumo seleccionado:", insumo); // Agrega un log para verificar los datos

    setConsumeData({
      ...consumeData,
      codigopropuesto: insumo.id_codigo,
      responsable_salida: user.id_usu,
    });

    setSelectedInsumo(insumo); // Asegúrate de que este estado esté actualizado
    setIngresoData({
      ...ingresoData,
      codigopropuesto: insumo.id_codigo,
      responsable_entrada: user.id_usu,
    });
    setOpenConsumeForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setNewInsumoData({
      codigopropuesto: "",
      minimofabricacion: "",
      descripcion: "",
      caracteristicas: "",
      inventario: "",
      tiempodefabricacion: "",
      um: "",
      consumomensual: "",
      inventarioptimo: "",
      inventariominimo: "",
      requerimiento: "",
      area: "",
    });
  };

  const handleConsumeFormClose = () => {
    setOpenConsumeForm(false);
    setConsumeData({
      codigopropuesto: "",
      cantidad_reducida: "",
      responsable_salida: "",
      entregado_a: "",
    });
  };

  const [ingresoData, setIngresoData] = useState({
    codigopropuesto: "",
    cantidad_entrada: "",
    responsable_entrada: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInsumoData({ ...newInsumoData, [name]: value });
  };

  const handleConsumeInputChange = (e) => {
    const { name, value } = e.target;
    setConsumeData({ ...consumeData, [name]: value });
  };

  const handleIngresoInputChange = (e) => {
    const { name, value } = e.target;
    setIngresoData({ ...ingresoData, [name]: value });
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchInsumoData();
    }
  }, [tabValue]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchReducedInsumoData();
    }
  }, [tabValue]);

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const columns = [
    { field: "id_codigo", headerName: "Código del sistema", width: 150 },
    { field: "desc", headerName: "Descripción", width: 300 },
    { field: "car", headerName: "Medidas/Características", width: 300 },
    { field: "inv", headerName: "Inventario", width: 100 },
    { field: "consumo_mensual", headerName: "Consumo Mensual", width: 150 },
    { field: "um", headerName: "Unidad de Medida", width: 150 },
    { field: "inventariomin", headerName: "Inventario Minimo", width: 150 },
    { field: "requerimiento", headerName: "Requerimiento", width: 150 },
    { field: "fecha", headerName: "Fecha de registro", width: 170 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          {(user?.role === "Admin" ||
            user?.role === "Master" ||
            user?.role === "INV") && (
            <IconButton
              sx={{ color: "#51acf8" }}
              onClick={() => handleView(params.row)}
            >
              <EditIcon />
            </IconButton>
          )}

          {(user?.role === "Admin" ||
            user?.role === "Master" ||
            user?.role === "INV") && (
            <IconButton
              sx={{ color: "black" }}
              onClick={() => handleConsumeFormOpen(params.row)}
            >
              <ExposureIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexDirection={isSmallScreen ? "column" : "row"}
        gap={2}
      >
        {/* Grupo de botones alineados */}
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleFormOpen}
          >
            Agregar Insumo
          </Button>

          {(user?.role === "Admin" ||
            user?.role === "Master" ||
            user?.role === "INV") && (
            <Button
              variant="contained"
              sx={{ background: "green" }}
              onClick={handleShowInsumo}
            >
              Informacion de Insumo
            </Button>
          )}

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleGenerateReport}
          >
            Generar Reporte PDF de Inventario Bajo
          </Button>

          <div>
            {/* Botón con Tooltip para activar el filtro */}
            <Tooltip title="Filtro de datos vacíos" placement="top">
              {(user?.role === "Admin" ||
                user?.role === "Master" ||
                user?.role === "INV") && (
                <IconButton onClick={handleFilterToggle} color="primary">
                  <NotificationsIcon />
                </IconButton>
              )}
            </Tooltip>

            {/* Contenedor de insumos con scroll habilitado al aplicar el filtro */}
            <div id="insumo-container" className="insumo-container">
              {filteredInsumos.map((insumo) => (
                <div key={insumo.id}>{insumo.name}</div>
              ))}
            </div>
          </div>

          {/* Modal para agregar observación */}
          <Dialog open={isModalOpen} onClose={handleCloseModal}>
            <DialogTitle>¿Deseas agregar una observación?</DialogTitle>
            <DialogActions>
              <Button
                onClick={() => {
                  setIncludeObservation(false);
                  handleObservationSubmit();
                }}
                color="primary"
              >
                No
              </Button>
              <Button
                onClick={() => setIncludeObservation(true)}
                color="primary"
              >
                Sí
              </Button>
            </DialogActions>

            {/* Campo de texto para ingresar observación si elige "Sí" */}
            {includeObservation && (
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Observación"
                  fullWidth
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </DialogContent>
            )}
            <DialogActions>
              {includeObservation && (
                <Button onClick={handleObservationSubmit} color="primary">
                  Generar Reporte
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>

        {/* Input de búsqueda, alineado a la derecha en pantallas grandes */}
        <TextField
          label="Buscar por Descripcion"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: "200px" }}
        />
      </Box>

      <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          getRowId={(row) => row.id_codigo}
          rows={filteredInsumos}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          getRowClassName={(params) =>
            params.row.inv <= params.row.inventariomin ? "row-red" : ""
          }
          sx={{
            "& .row-red": {
              backgroundColor: "#ffcccc",
            },
          }}
        />
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Insumo</DialogTitle>
        <DialogContent>
          {selectedInsumo && (
            <Box component="form" noValidate autoComplete="off">
              <Grid container spacing={2} mt={2}>
                {/* Primera fila */}
                <Grid item xs={12}>
                  <TextField
                    label="Código"
                    variant="outlined"
                    value={selectedInsumo.codigopropuesto}
                    InputProps={{ readOnly: true }} // Solo lectura
                    fullWidth
                  />
                </Grid>
                {/* Segunda fila */}
                <Grid item xs={6}>
                  <TextField
                    label="Mínimo de Fabricación"
                    variant="outlined"
                    value={selectedInsumo.minimofabricacion}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        minimofabricacion: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Tiempo de Fabricación"
                    variant="outlined"
                    value={selectedInsumo.tiempodefabricacion}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        tiempodefabricacion: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Unidad de Medida"
                    variant="outlined"
                    value={selectedInsumo.um}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        um: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                {/* Tercera fila */}
                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    variant="outlined"
                    value={selectedInsumo.descripcion}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        descripcion: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Características"
                    variant="outlined"
                    value={selectedInsumo.caracteristicas}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        caracteristicas: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                {/* Cuarta fila */}
                <Grid item xs={6}>
                  <TextField
                    label="Inventario"
                    variant="outlined"
                    value={selectedInsumo.inventario}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        inventario: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Consumo Mensual"
                    variant="outlined"
                    value={selectedInsumo.consumomensual}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        consumomensual: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                {/* Quinta fila */}
                <Grid item xs={6}>
                  <TextField
                    label="Inventario Óptimo"
                    variant="outlined"
                    value={selectedInsumo.inventarioptimo}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        inventarioptimo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Inventario Mínimo"
                    variant="outlined"
                    value={selectedInsumo.inventariominimo}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        inventariominimo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Requerimiento"
                    variant="outlined"
                    value={selectedInsumo.requerimiento}
                    onChange={(e) =>
                      setSelectedInsumo({
                        ...selectedInsumo,
                        requerimiento: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                {/* Sección de selección */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="area-select-label">
                      Área/Departamento
                    </InputLabel>
                    <Select
                      labelId="area-select-label"
                      id="area-select"
                      value={selectedInsumo.area}
                      onChange={(e) =>
                        setSelectedInsumo({
                          ...selectedInsumo,
                          area: e.target.value,
                        })
                      }
                    >
                      <MenuItem value={"EMBARQUES"}>EMBARQUES</MenuItem>
                      <MenuItem value={"RECIBO"}>RECIBO</MenuItem>
                      <MenuItem value={"INVENTARIOS"}>INVENTARIOS</MenuItem>
                      <MenuItem value={"SURTIDO"}>SURTIDO</MenuItem>
                      <MenuItem value={"PAQUETERIA"}>PAQUETERIA</MenuItem>
                      <MenuItem value={"DEPARTAMENTAL"}>DEPARTAMENTAL</MenuItem>
                      <MenuItem value={"EXPORTACION"}>EXPORTACION</MenuItem>
                      <MenuItem value={"ECOMMERCE"}>ECOMMERCE</MenuItem>
                      <MenuItem value={"MAQUILA"}>MAQUILA</MenuItem>
                      <MenuItem value={"MONTACARGAS"}>MONTACARGAS</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cerrar
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openForm} onClose={handleFormClose}>
        <DialogTitle>Agregar Nuevo Insumo</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ marginTop: 1 }}
            label="Código Propuesto"
            name="codigopropuesto"
            value={newInsumoData.codigopropuesto}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Mínimo de Fabricación"
            name="minimofabricacion"
            value={newInsumoData.minimofabricacion}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={newInsumoData.descripcion}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Características"
            name="caracteristicas"
            value={newInsumoData.caracteristicas}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Inventario"
            name="inventario"
            value={newInsumoData.inventario}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Tiempo de Fabricación"
            name="tiempodefabricacion"
            value={newInsumoData.tiempodefabricacion}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Unidad de Medida"
            name="um"
            value={newInsumoData.um}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Consumo Mensual"
            name="consumomensual"
            value={newInsumoData.consumomensual}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Inventario Óptimo"
            name="inventarioptimo"
            value={newInsumoData.inventarioptimo}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Inventario Mínimo"
            name="inventariominimo"
            value={newInsumoData.inventariominimo}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Requerimiento"
            name="requerimiento"
            value={newInsumoData.requerimiento}
            onChange={handleInputChange}
            fullWidth
          />
          <Box sx={{ marginBottom: 2 }}>
            <FormControl fullWidth mt={3}>
              <InputLabel id="cantidad-select-label">
                AREA/DEPARTAMENTO
              </InputLabel>
              <Select
                labelId="cantidad-select-label"
                id="cantidad-select"
                value={consumeData.area}
                onChange={handleInputChange}
                name="area"
              >
                <MenuItem value={"EMBARQUES"}>EMBARQUES</MenuItem>
                <MenuItem value={"RECIBO"}>RECIBO</MenuItem>
                <MenuItem value={"INVENTARIOS"}>INVENTARIOS</MenuItem>
                <MenuItem value={"SURTIDO"}>SURTIDO</MenuItem>
                <MenuItem value={"PAQUETERIA"}>PAQUETERIA</MenuItem>
                <MenuItem value={"DEPARTAMENTAL"}>DEPARTAMENTAL</MenuItem>
                <MenuItem value={"EXPORTACION"}>EXPORTACION</MenuItem>
                <MenuItem value={"ECOMMERCE"}>ECOMMERCE</MenuItem>
                <MenuItem value={"MAQUILA"}>MAQUILA</MenuItem>
                <MenuItem value={"MANTACARGAS"}>MONTACARGAS</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddNewInsumo} color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          sx={{
            width: "90%",
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
            margin: "auto",
            marginTop: "100px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" component="h2">
            Detalles del Insumo
          </Typography>

          {/* Pestañas para cambiar entre insumos de entrada y otra sección */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ marginBottom: 2 }}
          >
            <Tab label="Entrada de Insumos" />
            <Tab label="Salida de Insumos" />
          </Tabs>

          {/* Primera pestaña: Insumos de Entrada */}
          {tabValue === 0 && (
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código Propuesto</TableCell>
                    <TableCell>Cantidad Entrada</TableCell>
                    <TableCell>Fecha Entrada</TableCell>
                    <TableCell>Nombre del responsable de Entrada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insumoData.length > 0 ? (
                    insumoData.map((insumo, index) => (
                      <TableRow key={index}>
                        <TableCell>{insumo.codigopropuesto}</TableCell>
                        <TableCell>{insumo.cantidad_entrada}</TableCell>
                        <TableCell>{insumo.fecha_entrada}</TableCell>
                        <TableCell>{insumo.nombre}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Segunda pestaña: Insumos Reducidos */}
          {tabValue === 1 && (
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código Propuesto</TableCell>
                    <TableCell>Cantidad Reducida</TableCell>
                    <TableCell>Fecha Salida</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Nombre del resposnable de salida</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reducedInsumoData.length > 0 ? (
                    reducedInsumoData.map((insumo, index) => (
                      <TableRow key={index}>
                        <TableCell>{insumo.codigopropuesto}</TableCell>
                        <TableCell>{insumo.cantidad_reducida}</TableCell>
                        <TableCell>{insumo.fecha_salida}</TableCell>
                        <TableCell>{insumo.area}</TableCell>
                        <TableCell>{insumo.nombre}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>

      {/* Modal para consumir insumo */}
      <Dialog open={openConsumeForm} onClose={handleConsumeFormClose}>
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs">
              <Tab label="Salida  Insumos" />
              <Tab label="Entrada insumos" />
            </Tabs>

            {/* Contenido de las pestañas */}
            {tabValue === 0 && (
              <>
                <TextField
                  sx={{ marginTop: 3 }}
                  label="Código Propuesto"
                  name="codigopropuesto"
                  value={consumeData.codigopropuesto}
                  onChange={handleConsumeInputChange}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Cantidad Reducida"
                  name="cantidad_reducida"
                  value={consumeData.cantidad_reducida}
                  onChange={handleConsumeInputChange}
                  fullWidth
                />
                <Box sx={{ marginBottom: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel id="cantidad-select-label">
                      AREA/DEPARTAMENTO
                    </InputLabel>
                    <Select
                      labelId="cantidad-select-label"
                      id="cantidad-select"
                      value={consumeData.area}
                      onChange={handleConsumeInputChange}
                      name="area"
                    >
                      <MenuItem value={"EMBARQUES"}>EMBARQUES</MenuItem>
                      <MenuItem value={"RECIBO"}>RECIBO</MenuItem>
                      <MenuItem value={"INVENTARIOS"}>INVENTARIOS</MenuItem>
                      <MenuItem value={"SURTIDO"}>SURTIDO</MenuItem>
                      <MenuItem value={"PAQUETERIA"}>PAQUETERIA</MenuItem>
                      <MenuItem value={"DEPARTAMENTAL"}>DEPARTAMENTAL</MenuItem>
                      <MenuItem value={"EXPORTACION"}>EXPORTACION</MenuItem>
                      <MenuItem value={"ECOMMERCE"}>ECOMMERCE</MenuItem>
                      <MenuItem value={"MAQUILA"}>MAQUILA</MenuItem>
                      <MenuItem value={"MANTACARGAS"}>MONTACARGAS</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  label="Entregado A"
                  name="entregado_a"
                  value={consumeData.entregado_a}
                  onChange={handleConsumeInputChange}
                  fullWidth
                />
                <DialogActions>
                  <Button onClick={handleConsumeInsumo} color="primary">
                    Consumir
                  </Button>
                </DialogActions>
              </>
            )}

            {tabValue === 1 && (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleIngresoInsumos();
                  }}
                >
                  <TextField
                    label="Código Propuesto"
                    variant="outlined"
                    value={ingresoData.codigopropuesto}
                    InputProps={{ readOnly: true }} // Este campo es de solo lectura
                    fullWidth
                    disabled
                    sx={{ mb: 2, marginTop: 2 }}
                  />
                  <TextField
                    label="Cantidad de Entrada"
                    name="cantidad_entrada"
                    type="number"
                    value={ingresoData.cantidad_entrada}
                    onChange={handleIngresoInputChange}
                    fullWidth
                  />
                  <DialogActions>
                    <Button type="submit" color="primary">
                      Ingresar
                    </Button>
                  </DialogActions>
                </form>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConsumeFormClose} color="primary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/*alerta */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity="warning"
          sx={{ width: "center" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default Insumos;

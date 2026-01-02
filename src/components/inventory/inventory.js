import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CircularProgress from "@mui/material/CircularProgress";
import { FixedSizeList as List } from "react-window";
import { utils, write } from "xlsx"; // Importar utils y write para manejo de Excel
import { saveAs } from "file-saver"; // Importar saveAs para guardar archivos
import { DataGrid } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField"; // ✅ Importa desde Material-UI
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import QRCode from "qrcode.react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Inventory() {
  // Estados
  const [inventoryData, setInventoryData] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [locations, setLocations] = useState([]);
  const [pasilloPercentages, setPasilloPercentages] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [responsableProgress, setResponsableProgress] = useState([]);
  const [manualData, setManualData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPasillo, setSelectedPasillo] = useState(""); // Pasillo seleccionado
  const [selectedTipo, setSelectedTipo] = useState(""); // Tipo PAR/IMPAR seleccionado
  const [excelData, setExcelData] = useState([]);
  const [usuariosInv, setUsuariosInv] = useState([]);
  const [loadingUsuariosInv, setLoadingUsuariosInv] = useState(false);
  const [openQrModal, setOpenQrModal] = useState(false);
  const [selectedUserQr, setSelectedUserQr] = useState(null);

  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleOpenQrModal = (user) => {
    setSelectedUserQr(user);
    setOpenQrModal(true);
  };

  const handleCloseQrModal = () => {
    setOpenQrModal(false);
    setSelectedUserQr(null);
  };

  useEffect(() => {
    let isMounted = true; // Control para evitar actualizaciones después del desmontaje

    const fetchData = async () => {
      try {
        setLoading(true); // Activa el estado de carga

        const [
          porcentajeRes,
          ubicacionesRes,
          personaRes,
          manualRes,
          inventarioRes,
        ] = await Promise.all([
          axios.get("http://66.232.105.87:3007/api/inventory/porcentaje"),
          axios.get("http://66.232.105.87:3007/api/inventory/ubicaciones"),
          axios.get("http://66.232.105.87:3007/api/inventory/persona"),
          axios.get("http://66.232.105.87:3007/api/inventory/Manuealsi"),
          axios.get(
            "http://66.232.105.87:3007/api/inventory/obtenerinventario"
          ),
        ]);

        if (isMounted) {
          setPercentage(porcentajeRes.data.percentage || 0);
          setLocations(
            inventarioRes.data.locations || ubicacionesRes.data.locations || []
          );
          setPasilloPercentages(ubicacionesRes.data.pasilloPercentages || []);
          setResponsableProgress(personaRes.data || []);
          setManualData(manualRes.data || []);
          setInventoryData(inventarioRes.data.data || []); // Asigna datos a inventoryData
          console.log(
            "Datos de inventario asignados:",
            inventarioRes.data.data
          );
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        if (isMounted) setLoading(false); // Desactiva el estado de carga
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Evita actualizaciones si el componente está desmontado
    };
  }, []);

  useEffect(() => {
    if (selectedTab === 4 && inventoryReport.length === 0) {
      const fetchInventoryReport = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            "http://66.232.105.87:3007/api/inventory/getInventoryDet"
          );
          setInventoryReport(response.data.data || []);
          setFilteredData(response.data.data || []); // Inicializa los datos filtrados
        } catch (error) {
          console.error("Error al cargar el reporte de inventario:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInventoryReport();
    }
  }, [selectedTab]);

  // Manejar cambio en el filtro de pasillo
  const handlePasilloChange = (event) => {
    const pasillo = event.target.value;
    setSelectedPasillo(pasillo);
    applyFilters(pasillo, selectedTipo);
  };

  // Función para obtener los datos de la API y exportarlos a Excel
  const handleDownloadDistribucionInventario = async () => {
    try {
      setLoading(true);

      // Llamada a la API para obtener los datos
      const response = await axios.get(
        "http://66.232.105.87:3007/api/inventory/obtenerDistribucionInventario"
      );

      const data = response.data;

      if (!data || data.length === 0) {
        console.error(
          "No hay datos de distribución de inventario para exportar."
        );
        return;
      }

      // Convertir los datos a una hoja de cálculo
      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Distribución Inventario");

      // Crear el archivo Excel
      const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      // Descargar el archivo
      saveAs(blob, "Distribucion_Inventario.xlsx");
    } catch (error) {
      console.error("Error al descargar la distribución de inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en el filtro de tipo
  const handleTipoChange = (event) => {
    const tipo = event.target.value;
    setSelectedTipo(tipo);
    applyFilters(selectedPasillo, tipo);
  };

  // Aplicar filtros combinados
  const applyFilters = (pasillo, tipo) => {
    let filtered = inventoryReport;

    if (pasillo) {
      filtered = filtered.filter(
        (item) => Number(item.pasillo) === Number(pasillo)
      );
    }

    if (tipo) {
      filtered = filtered.filter((item) => item.tipo === tipo);
    }

    setFilteredData(filtered);
  };

  // Función para exportar a Excel
  const handleDownloadExcel = () => {
    if (!inventoryData || inventoryData.length === 0) {
      console.error("No hay datos de inventario para exportar.");
      return;
    }

    try {
      const worksheet = utils.json_to_sheet(inventoryData); // Convierte datos a hoja de cálculo
      const workbook = utils.book_new(); // Crea un libro de trabajo
      utils.book_append_sheet(workbook, worksheet, "Inventario");

      const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, "inventario.xlsx"); // Descarga el archivo Excel
    } catch (error) {
      console.error("Error al exportar el archivo Excel:", error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 30) return "red";
    if (percentage <= 89) return "orange";
    return "green";
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const columns = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "des", headerName: "Descripción", width: 150 },
    { field: "codigo", headerName: "Código", width: 150 },
    {
      field: "_pz",
      headerName: "PZ",
      width: 100,
      renderCell: (params) =>
        editRowId === params.row.id_ubi ? (
          <TextField
            size="small"
            value={editValues._pz}
            onChange={(e) => handleInputChange(e, "_pz")}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "_inner",
      headerName: "Inner",
      width: 100,
      renderCell: (params) =>
        editRowId === params.row.id_ubi ? (
          <TextField
            size="small"
            value={editValues._inner}
            onChange={(e) => handleInputChange(e, "_inner")}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "_master",
      headerName: "Master",
      width: 100,
      renderCell: (params) =>
        editRowId === params.row.id_ubi ? (
          <TextField
            size="small"
            value={editValues._master}
            onChange={(e) => handleInputChange(e, "_master")}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "_pallet",
      headerName: "Pallet",
      width: 100,
      renderCell: (params) =>
        editRowId === params.row.id_ubi ? (
          <TextField
            size="small"
            value={editValues._pallet}
            onChange={(e) => handleInputChange(e, "_pallet")}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      width: 150,
      renderCell: (params) =>
        editRowId === params.row.id_ubi ? (
          <TextField
            size="small"
            value={editValues.cantidad}
            onChange={(e) => handleInputChange(e, "cantidad")}
          />
        ) : (
          params.value
        ),
    },
    { field: "manual", headerName: "Manual", width: 150 },
    { field: "pasillo", headerName: "Pasillo", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "tipo", headerName: "Tipo", width: 150 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) =>
        editRowId === params.row.id_ubi ? (
          <Button variant="contained" color="success" onClick={handleSaveClick}>
            Guardar
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditClick(params.row.id_ubi, params.row)}
          >
            Editar
          </Button>
        ),
    },
  ];

  const calculateStockPercentage = (cantidad, cant_stock, estado) => {
    if (estado === "F") return 100;
    if (!cantidad || cantidad === 0) return 0;
    if (!cant_stock) cant_stock = 0;
    return Math.min((cant_stock / cantidad) * 100, 100);
  };

  const barData = {
    labels: pasilloPercentages.map((p) => p.pasillo),
    datasets: [
      {
        label: "Porcentaje de Progreso",
        data: pasilloPercentages.map((p) => p.percentage),
        backgroundColor: pasilloPercentages.map((p) =>
          getProgressColor(p.percentage)
        ),
        borderRadius: 10,
      },
    ],
  };

  const barDataPersona = {
    labels: responsableProgress.map((persona) => persona.responsable),
    datasets: [
      {
        label: "Porcentaje de Progreso",
        data: responsableProgress.map((persona) =>
          parseFloat(persona.porcentaje_completado)
        ),
        backgroundColor: responsableProgress.map((persona) =>
          getProgressColor(parseFloat(persona.porcentaje_completado))
        ),
        borderRadius: 10, // Bordes redondeados
      },
    ],
  };

  const barOptionsPersona = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Avance por Persona" },
    },
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: "Responsable" },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Porcentaje (%)" },
        ticks: { stepSize: 20 },
      },
    },
  };

  const handleGenerateExcelReports = async () => {
    try {
      setLoading(true);

      // Solicita los datos de las tres APIs
      const [pickResponse, almacenajeResponse, consolidatedResponse] =
        await Promise.all([
          axios.get(
            "http://66.232.105.87:3007/api/inventory/reportFinishInventory"
          ),
          axios.get(
            "http://66.232.105.87:3007/api/inventory/reportFinishInventoryAlma"
          ),
          axios.get(
            "http://66.232.105.87:3007/api/inventory/reportConsolidatedInventory"
          ),
        ]);

      // Extrae los datos y totales de las respuestas
      const pickData = pickResponse.data.data || [];
      const pickTotal = pickResponse.data.totalGeneral || 0;

      const almacenajeData = almacenajeResponse.data.data || [];
      const almacenajeTotal = almacenajeResponse.data.totalGeneral || 0;

      const consolidatedData = consolidatedResponse.data.data || [];
      const consolidatedTotal = consolidatedResponse.data.totalGeneral || 0;

      // Crear un libro de trabajo
      const workbook = utils.book_new();

      // Hoja 1: Reporte de Conciliación (Pick)
      const pickSheet = utils.json_to_sheet([
        ...pickData,
        { ubi: "", clave: "", codigo: "TOTAL GENERAL", cantidad: pickTotal },
      ]);
      utils.sheet_add_aoa(
        pickSheet,
        [["Ubicación", "Clave", "Código", "Cantidad"]],
        { origin: "A1" }
      );
      pickSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
      utils.book_append_sheet(workbook, pickSheet, "Pick");

      // Hoja 2: Reporte de Almacenaje
      const almacenajeSheet = utils.json_to_sheet([
        ...almacenajeData,
        {
          ubi: "",
          clave: "",
          codigo: "TOTAL GENERAL",
          cantidad: almacenajeTotal,
        },
      ]);
      utils.sheet_add_aoa(
        almacenajeSheet,
        [["Ubicación", "Clave", "Código", "Cantidad"]],
        { origin: "A1" }
      );
      almacenajeSheet["!cols"] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
      ];
      utils.book_append_sheet(workbook, almacenajeSheet, "Almacenaje");

      // Hoja 3: Reporte de Conciliación Consolidada
      const consolidatedSheet = utils.json_to_sheet([
        ...consolidatedData,
        { codigo: "TOTAL GENERAL", clave: "", cantidad: consolidatedTotal },
      ]);
      utils.sheet_add_aoa(
        consolidatedSheet,
        [["Código", "Clave", "Cantidad"]],
        { origin: "A1" }
      );
      consolidatedSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }];
      utils.book_append_sheet(workbook, consolidatedSheet, "Conciliación");

      // Generar y descargar el archivo Excel con las tres hojas
      const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "reportes.xlsx");
    } catch (error) {
      console.error(
        "Error al generar los reportes de conciliación, almacenaje o consolidación:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editRowId === null) {
      console.log("Recargando inventario después de edición...");
      fetchInventory(); // 🔄 Recargar datos cuando terminas de editar
    }
  }, [editRowId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://66.232.105.87:3007/api/inventory/obtenerinventario"
      );
      setInventoryData(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar los datos de inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (idUbi, row) => {
    setEditRowId(idUbi); // Ahora usa id_ubi
    setEditValues({ ...row });
  };

  const handleInputChange = (event, field) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSaveClick = async () => {
    try {
      console.log("Editando fila con datos:", editValues);

      const response = await axios.put(
        `http://66.232.105.87:3007/api/inventory/update/${editRowId}`,
        editValues
      );

      if (response.status === 200) {
        console.log("Actualización exitosa. Recargando datos...");

        // 🔄 Actualizar manualmente la tabla antes de recargar desde la API
        setInventoryData((prevData) => {
          const newData = prevData.map((row) =>
            row.id_ubi === editRowId ? { ...row, ...editValues } : row
          );
          return [...newData]; // 🔄 Forzar nueva referencia
        });

        await fetchInventory(); // 🔄 Recargar datos desde la API

        setEditRowId(null);
      } else {
        console.error("Error al actualizar: respuesta no exitosa");
      }
    } catch (error) {
      console.error("Error al actualizar el inventario:", error);
    }
  };

  useEffect(() => {
    if (selectedTab === 5 && usuariosInv.length === 0) {
      const fetchUsuariosInv = async () => {
        try {
          setLoadingUsuariosInv(true);

          const response = await axios.get(
            "http://66.232.105.87:3007/api/inventory/obtenerusuarios"
          );

          setUsuariosInv(response.data.data || []);
        } catch (error) {
          console.error("Error al cargar usuarios de inventario:", error);
        } finally {
          setLoadingUsuariosInv(false);
        }
      };

      fetchUsuariosInv();
    }
  }, [selectedTab]);

  const usuariosInvColumns = [
    {
      field: "NAME",
      headerName: "Nombre",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Correo",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Rol",
      width: 120,
    },
    {
      field: "qr",
      headerName: "QR",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenQrModal(params.row)}
        >
          Ver QR
        </Button>
      ),
    },
  ];

  return (
    <Box width="100%" textAlign="center" marginTop={4}>
      <Tabs value={selectedTab} onChange={handleTabChange} centered>
        <Tab label="Progreso General" />
        <Tab label="Progreso por Ubicaciones" />
        <Tab label="Avance por Persona" />
        <Tab label="Manual" />
        <Tab label="Reporte de Inventario" />
        <Tab label="Usuarios Inventario" />
      </Tabs>

      {/* Tab 0: Progreso General */}
      {selectedTab === 0 && (
        <Box marginTop={4} display="flex" justifyContent="center">
          <Box width="50%" marginRight={2}>
            <Typography variant="h4" gutterBottom>
              Progreso General de Ubicaciones Alma.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadExcel}
              disabled={loading || inventoryData.length === 0}
            >
              {loading ? "Cargando..." : "Descargar Excel"}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadDistribucionInventario}
              disabled={loading}
              sx={{ marginBottom: 4 }}
            >
              {loading
                ? "Descargando..."
                : "Descargar Distribución de Inventario"}
            </Button>
            <br></br>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              marginBottom={4}
            >
              <Box width="90%" marginRight={1}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 30,
                    borderRadius: 5,
                    bgcolor: "grey.300",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getProgressColor(percentage),
                    },
                  }}
                />
                <Box minWidth={35}>
                  <Typography variant="h4" color="textSecondary">
                    {`${Math.round(percentage)}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Panel de información de pasillos */}
            <Box display="flex" flexWrap="wrap" justifyContent="center">
              {pasilloPercentages.map((pasilloData, index) => (
                <Box
                  key={index}
                  width="20%"
                  padding={1}
                  textAlign="center"
                  margin={1}
                  border={3}
                  borderRadius={5}
                >
                  <Typography variant="h6">{`Pasillo: ${pasilloData.pasillo}`}</Typography>
                  <Typography variant="body2" color="black">
                    {`Completadas: ${pasilloData.completed} / Pendientes: ${pasilloData.pending}`}
                  </Typography>
                  <Box
                    position="relative"
                    display="inline-flex"
                    justifyContent="center"
                    alignItems="center"
                    marginTop={1}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={pasilloData.percentage}
                      size={100}
                      thickness={5}
                      sx={{ color: getProgressColor(pasilloData.percentage) }}
                    />

                    <Box
                      top={0}
                      left={0}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        {`${Math.round(pasilloData.percentage)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Tab 1: Progreso por Ubicaciones */}
      {selectedTab === 1 && (
        <Box marginTop={4}>
          <Typography variant="h5">Progreso por Ubicaciones</Typography>
          <Box display="flex" justifyContent="space-between" marginTop={4}>
            {["PAR", "IMPAR"].map((tipo) => (
              <Box key={tipo} width="48%" textAlign="center">
                <Typography variant="h6">{`Ubicaciones tipo: ${tipo}`}</Typography>
                <Box
                  width="100%"
                  height={400}
                  overflow="auto"
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="center"
                >
                  <List
                    height={400}
                    itemCount={Math.ceil(
                      locations.filter((location) => location.tipo === tipo)
                        .length / 2
                    )} // Dividido en grupos de 2
                    itemSize={160} // Ajusta la altura de cada grupo de ubicaciones
                    width="100%"
                  >
                    {({ index, style }) => {
                      const start = index * 2;
                      const end = start + 2;
                      const locationGroup = locations
                        .filter((location) => location.tipo === tipo)
                        .slice(start, end);

                      return (
                        <Box
                          key={index}
                          style={style}
                          display="flex"
                          justifyContent="center"
                          width="100%"
                        >
                          {locationGroup.map((location, subIndex) => {
                            const progress = calculateStockPercentage(
                              location.cantidad,
                              location.cant_stock,
                              location.estado
                            );
                            return (
                              <Box
                                key={subIndex}
                                width="45%"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                margin={1}
                              >
                                <Typography variant="h6">{`Ubicación: ${location.ubi}`}</Typography>
                                <Box
                                  position="relative"
                                  display="inline-flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <CircularProgress
                                    variant="determinate"
                                    value={progress}
                                    size={100}
                                    thickness={5}
                                    sx={{ color: getProgressColor(progress) }}
                                  />
                                  <Box
                                    top={0}
                                    left={0}
                                    bottom={0}
                                    right={0}
                                    position="absolute"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Typography
                                      variant="caption"
                                      component="div"
                                      color="textSecondary"
                                    >
                                      {`${Math.round(progress)}%`}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    }}
                  </List>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Tab 2: Avance por Persona */}
      {selectedTab === 2 && (
        <Box marginTop={4}>
          <Typography variant="h5">Avance por Persona</Typography>
          <Box width="70%" margin="auto">
            <Bar data={barDataPersona} options={barOptionsPersona} />
          </Box>
        </Box>
      )}

      {/* Tab 3: Manual */}
      {selectedTab === 3 && (
        <Box marginTop={4}>
          <Typography variant="h5">Datos de Inventario Manual</Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Box display="flex" flexWrap="wrap" justifyContent="center">
              {manualData.length > 0 ? (
                manualData.map((item, index) => (
                  <Box
                    key={index}
                    border={1}
                    borderColor="grey.300"
                    borderRadius={4}
                    padding={2}
                    margin={1}
                    width="300px"
                    textAlign="left"
                  >
                    <Typography variant="h6">{`Ubicación: ${item.ubi}`}</Typography>
                    <Typography>{`Tipo: ${item.tipo}`}</Typography>
                    <Typography>{`Asignado: ${item.asignado}`}</Typography>
                    <Typography>{`Responsable: ${item.responsable}`}</Typography>
                    <Typography>{`Estado: ${
                      item.estado || "Pendiente"
                    }`}</Typography>
                    <Typography>{`Hora Inicio: ${
                      item.hora_inicio || "No disponible"
                    }`}</Typography>
                    <Typography>{`Hora Final: ${
                      item.hora_final || "No disponible"
                    }`}</Typography>
                    <Typography>{`Código: ${item.codigo}`}</Typography>
                    <Typography>{`Cantidad: ${item.cantidad}`}</Typography>
                    <Typography>{`Stock: ${item.cant_stock || 0}`}</Typography>
                    <Typography>{`Manual: ${item.manual}`}</Typography>
                    <Typography>{`Nivel: ${item.nivel}`}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hay datos disponibles con manual = "Si".
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Tab 4: Reporte de Inventario */}
      {selectedTab === 4 && (
        <Box marginTop={4}>
          <Typography variant="h5" gutterBottom>
            Reporte de Inventario
          </Typography>

          {/* Filtros */}
          <Box display="flex" justifyContent="center" gap={4} marginBottom={4}>
            {/* Filtro de Pasillo */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="pasillo-select-label">Pasillo</InputLabel>
              <Select
                labelId="pasillo-select-label"
                value={selectedPasillo}
                onChange={handlePasilloChange}
              >
                <MenuItem value="">Todos</MenuItem>
                {[...new Set(inventoryReport.map((item) => item.pasillo))].map(
                  (pasillo, index) => (
                    <MenuItem key={index} value={pasillo}>
                      {pasillo}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {/* Filtro de Tipo (PAR/IMPAR) */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="tipo-select-label">Tipo</InputLabel>
              <Select
                labelId="tipo-select-label"
                value={selectedTipo}
                onChange={handleTipoChange}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PAR">PAR</MenuItem>
                <MenuItem value="IMPAR">IMPAR</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateExcelReports}
            disabled={loading}
            sx={{ marginBottom: 4 }}
          >
            {loading
              ? "Generando reporte..."
              : "Generar Reporte de Conciliación"}
          </Button>

          {loading ? (
            <CircularProgress />
          ) : filteredData.length > 0 ? (
            <Box sx={{ height: "60%", width: "100%", marginTop: 2 }}>
              <DataGrid
                key={inventoryData.length}
                rows={filteredData} // Datos filtrados
                columns={columns} // Configuración de las columnas
                getRowId={(row) => row.id_ubi} // Define el identificador único de las filas
                pageSize={10} // Tamaño de la página
                rowsPerPageOptions={[5, 10, 20]} // Opciones de paginación
                disableSelectionOnClick // Deshabilita la selección al hacer clic en celdas
              />
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No hay datos disponibles para el reporte de inventario.
            </Typography>
          )}
        </Box>
      )}

      {/* Tab 5: Usuarios Inventario */}
      {selectedTab === 5 && (
        <Box marginTop={4}>
          <Typography variant="h5" gutterBottom>
            Usuarios de Inventario
          </Typography>

          {loadingUsuariosInv ? (
            <CircularProgress />
          ) : usuariosInv.length > 0 ? (
            <Box sx={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={usuariosInv}
                columns={usuariosInvColumns}
                getRowId={(row, index) => `${row.email}-${index}`}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No hay usuarios de inventario registrados.
            </Typography>
          )}

          <Modal
            open={openQrModal}
            onClose={handleCloseQrModal}
            aria-labelledby="qr-modal-title"
            aria-describedby="qr-modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 380,
                bgcolor: "background.paper",
                boxShadow: 24,
                borderRadius: 3,
                p: 2,
              }}
            >
              {selectedUserQr && (
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" gutterBottom>
                      Credenciales de Inventario
                    </Typography>

                    {/* ===== CORREO ===== */}
                    <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                      <strong>Usuario (Correo)</strong>
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {selectedUserQr.email}
                    </Typography>

                    <QRCode value={selectedUserQr.email} size={160} />

                    {/* ===== CONTRASEÑA ===== */}
                    <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
                      <strong>Contraseña</strong>
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {selectedUserQr.password || "******"}
                    </Typography>

                    <QRCode value={selectedUserQr.password || ""} size={160} />

                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ display: "block", mt: 2 }}
                    >
                      Escanea primero el usuario y después la contraseña
                    </Typography>

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={handleCloseQrModal}
                    >
                      Cerrar
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Modal>
        </Box>
      )}
    </Box>
  );
}

export default Inventory;

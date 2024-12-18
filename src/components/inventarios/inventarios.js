import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Modal,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  Alert,
  useMediaQuery,
  IconButton,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import {
  Inventory,
  AddCircle,
  Settings,
  Dashboard,
  CheckCircle,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { UserContext } from "../context/UserContext";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import MySwal from "sweetalert2";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import RemoveIcon from "@mui/icons-material/Remove"; // Ícono para disminuir
import DeleteIcon from "@mui/icons-material/Delete"; // Ícono para eliminar

import RefreshIcon from "@mui/icons-material/Refresh";

function InventarioAdmin() {
  const [section, setSection] = useState(0); // Controla la sección activa
  const [datosInventarios, setDatosInventarios] = useState([]);
  const [datosPicking, setDatosPicking] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [ubicacionFilter, setUbicacionFilter] = useState("");
  const [descripcionFilter, setDecripcionFilter] = useState("");
  const [codigoFilter, setCodigoFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [formData, setFormData] = useState([]); // Para manejar los datos de cada formulario
  const [counter, setCounter] = useState(0); // Contador para las veces que se presiona "Aumentar"
  const [isCompartido, setIsCompartido] = useState(false); // Estado para saber si se selec
  const [openModalInsertUbi, setOpenModalInsertUbi] = useState(false);
  const [formDataNuevaUbi, setFormDataNuevaUbi] = useState({
    nuevaUbi: "",
    nuevoCodigoProd: "",
    nuevaCantStock: "",
    nuevoPasillo: "",
    nuevoLote: "",
    nuevoAlmacen: "",
  });

  // Estado para controlar la apertura del modal
  const [openModal, setOpenModal] = useState(false);
  const [openModalAlma, setOpenModalAlmacenamiento] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null); // Para saber qué recibo se está procesando
  const [depMaq, setDepMaq] = useState([]);
  const [depCua, setDepCua] = useState([]);
  const [depExp, setDepExp] = useState([]);
  const [depSeg, setDepSeg] = useState([]);
  const [depDev, setDepDev] = useState([]);
  const [depDiv, setDepDiv] = useState([]);
  const [depMue, setDepMue] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [newCodeProd, setNewCodeProd] = useState("");
  const [newCantStock, setNewCantStock] = useState("");
  const [showInputFields, setShowInputFields] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ubi, setUbi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [cantReducida, setCantReducida] = useState("");
  const [codigoResponsable, setCodigoResponsable] = useState("");
  const [ubiNuv, setUbiNuv] = useState("");
  const { user } = useContext(UserContext);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [openMovimientoModal, setOpenMovimientoModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [codeProd, setCodeProd] = useState("");
  const almacenes = [7066, 7237, 7008, 7080, 7235, 7236, 7090, 7081];
  const [depInsumos, setDepInsumos] = useState([]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDato, setSelectedDato] = useState(null);
  const [paginatedData, setPaginatedData] = useState([]);
  const [estado, setEstado] = useState("");
  const [editedData, setEditedData] = useState({
    ubi: "",
    code_prod: "",
    cant_stock: "",
    lote: "",
    almacen: "",
  });
  const [isInsertModalOpen, setInsertModalOpen] = useState(false);
  const [newData, setNewData] = useState({
    id_ubi: "",
    code_prod: "",
    cant_stock: "",
    pasillo: "",
    lote: "",
    almacen: "",
  });

  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchInventariosData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.3.27:3007/api/inventarios/inventarios"
        );
        setDatosInventarios(response.data);
      } catch (error) {
        console.error("Error al obtener los datos de Inventarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventariosData();
  }, []);

  useEffect(() => {
    fetchPickingData();
  }, []);

  useEffect(() => {
    const filtered = datosPicking.filter((dato) => {
      const ubi = dato.ubi || "";
      const codeProd = dato.code_prod || "";
      const des = dato.des || "";
      return (
        ubi.toLowerCase().includes(ubicacionFilter.toLowerCase()) &&
        codeProd.toLowerCase().includes(codigoFilter.toLowerCase()) &&
        des.toLowerCase().includes(descripcionFilter.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [ubicacionFilter, codigoFilter, datosPicking, descripcionFilter]);

  // Manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Manejar el cambio de número de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Calcular los datos de la página actual
  // const paginatedData = filteredData.slice(
  //   currentPage * rowsPerPage,
  //   currentPage * rowsPerPage + rowsPerPage
  // );

  useEffect(() => {
    setPaginatedData(
      filteredData.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      )
    );
  }, [filteredData, currentPage, rowsPerPage]);

  const handleAutorizar = async (recibo) => {
    if (!user?.id_usu) {
      Swal.fire(
        "Error",
        "No se pudo obtener el identificador del usuario. Intente nuevamente.",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas autorizar el producto con Código: ${recibo.codigo}, O.C.: ${recibo.oc}, Cantidad: ${recibo.cantidad_recibida} y Fecha Recibo: ${recibo.fecha_recibo}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, autorizar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            "http://192.168.3.27:3007/api/inventarios/inventarios/autorizar",
            {
              codigo: recibo.codigo,
              oc: recibo.oc,
              cantidad_recibida: recibo.cantidad_recibida,
              fecha_recibo: recibo.fecha_recibo,
              userId: user.id_usu,
            }
          );

          setDatosInventarios(
            datosInventarios.filter(
              (dato) => dato.id_recibo !== recibo.id_recibo
            )
          );

          Swal.fire(
            "¡Autorizado!",
            "El producto ha sido autorizado exitosamente.",
            "success"
          );
        } catch (error) {
          console.error("Error al autorizar el producto:", error);
          Swal.fire(
            "Error",
            "Hubo un error al autorizar el producto.",
            "error"
          );
        }
      }
    });
  };

  const handleIncrease = () => {
    setCounter(counter + 1); // Aumenta el contador
    setFormData([...formData, { code_prod: "", cant_stock: "", ubi: "" }]); // Agrega un nuevo formulario vacío
  };

  const handleDecrease = () => {
    if (counter > 0) {
      setCounter(counter - 1); // Disminuir el contador
      const updatedFormData = [...formData];
      updatedFormData.pop(); // Eliminar el último formulario
      setFormData(updatedFormData); // Actualizar el estado de los formularios
    }
  };

  const handleFormChange = (index, field, value) => {
    const updatedFormData = [...formData]; // Copiar el estado actual
    updatedFormData[index] = {
      ...updatedFormData[index], // Mantener los otros valores
      [field]: value, // Solo actualizar el campo que cambió
    };
    setFormData(updatedFormData); // Actualizar el estado con el nuevo valor
  };

  const handleCompartido = () => {
    setIsCompartido(true); // Mostrar los formularios cuando se selecciona "Compartido"
  };

  //almacenamiento

  const [updateData, setUpdateData] = useState({
    id_ubi: "",
    code_prod: "",
    cant_stock: "",
    pasillo: "",
    lote: "",
    almacen: "",
    estado: "",
  });

  useEffect(() => {
    fetchMaqData();
    fetchCuaData();
    fetchExpData();
    fetchSegData();
    fetchDevData();
    fetchDivData();
    fetchMueData();
    fetchData();
    fetchAllInsumos();
  }, []);

  const handleOpenDetailsModal = (item) => {
    setOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };

  const handleChange = (event) => {
    setUbiNuv(event.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      return;
    }

    fetchInsumos();
  };

  const handleOpen = async () => {
    await detailRed();
    setOpen(true);
    fetchData();
  };

  const handleView = (row, rowData) => {
    if (row.cant_stock <= 0) {
      setAlertMessage(
        "No tienes stock disponible para realizar el movimiento."
      );
      setAlertOpen(true);
      return;
    }

    setSelectedRow(row);
    setCantReducida("");
    setUbiNuv("");
    setOpenMovimientoModal(true);
    setCodigoResponsable(user.id_usu);
    setCodeProd(rowData.code_prod);
  };

  const handleClose = () => {
    setCodigoResponsable(user.codigo_responsable || "");
    setOpenMovimientoModal(false);
    setOpenUpdateModal(false);
    setOpen(false);
    setCantReducida("");
    setSelectedRow(null);
    setError(null);
    setData([]);
    setCodeProd("");
    setCantReducida("");
    setOpen(false);
    setSelectedItem(null);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

  const handleOpenUpdateModal = (row) => {
    setUpdateData(row);
    setOpenUpdateModal(true);
  };

  const handleSelectProduct = (codigo) => {
    setCodeProd(codigo);
  };

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://192.168.3.27:3007/api/Inventario_P/obtnercodigoInv`,
        {
          code_prod: searchTerm,
        }
      );
      if (response.data.resultado && !response.data.resultado.error) {
        const data = response.data.resultado.list;
        const filteredData = data
          .filter((insumo) => insumo.cant_stock > 0)
          .slice(0, 10000);

        setInsumos(
          filteredData.map((insumo) => ({ id: insumo.id_ubi, ...insumo }))
        );
      } else {
        setInsumos([]);
        setError("No se encontraron resultados.");
      }
    } catch (error) {
      setInsumos([]);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    // Actualizar los datos antes de la validación
    await fetchAllInsumos();

    if (!cantReducida || !codigoResponsable) {
      setAlertMessage("Debes llenar todos los campos.");
      setAlertOpen(true);
      return;
    }

    if (parseInt(cantReducida, 10) > selectedRow.cant_stock) {
      setAlertMessage(
        "La cantidad a reducir sobrepasa la cantidad en stock disponible."
      );
      setAlertOpen(true);
      return;
    }

    const payload = {
      code_prod: selectedRow.code_prod,
      cant_reducida: parseInt(cantReducida, 10),
      almacen: ubiNuv,
      codigo_responsable: parseInt(codigoResponsable, 10),
    };

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ReduccionInv",
        payload
      );
      // Verificar si la solicitud fue exitosa
      if (response.status === 200) {
        await fetchAllInsumos();
        handleClose();
      } else {
        setAlertMessage(
          "Hubo un problema al reducir el inventario. Intenta nuevamente."
        );
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error al reducir el inventario:", error);
      setAlertMessage(
        "Error de conexión o servidor. Por favor, intenta nuevamente."
      );
      setAlertOpen(true);
    }
  };
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/Obtredinv"
      );

      if (
        response.data?.resultado?.list &&
        response.data.resultado.list.length > 0
      ) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"),
        }));
        setDepInsumos(list);
      } else {
        setDepInsumos([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllInsumos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cambiar el método a GET y usar la URL adecuada
      const response = await axios.get(
        "http://192.168.3.27:3007/api/inventarios/inventarios/obtenerUbiAlma"
      );

      // Validar la respuesta de la API
      if (response.data && !response.data.resultado.error) {
        const nuevosInsumos = response.data.resultado.list.map((insumo) => ({
          id: insumo.id_ubi,
          ...insumo,
          cant_stock: insumo.cant_stock ? Number(insumo.cant_stock) : null,
          ingreso: insumo.ingreso
            ? new Date(insumo.ingreso).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : null,
        }));
        setInsumos(nuevosInsumos);
      } else {
        setInsumos([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching all insumos:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUbi = async (nuevoCodigo) => {
    setCodigo(nuevoCodigo);

    if (nuevoCodigo.trim() === "") {
      await fetchAllInsumos();
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerUbi",
        {
          ubi: nuevoCodigo, // Envío del código para buscar
        }
      );

      if (response.data.resultado && !response.data.resultado.error) {
        const nuevosInsumos = response.data.resultado.list.map((item) => ({
          id: item.id_ubi,
          id_ubi: item.id_ubi,
          ubi: item.ubi,
          code_prod: item.code_prod,
          cant_stock: item.cant_stock,
          pasillo: item.pasillo,
          lote: item.lote,
          almacen: item.almacen,
          ingreso: new Date(item.ingreso).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          area: item.area,
          Estado: item.Estado, // Asegúrate de incluir Estado aquí
        }));

        // Muestra en la consola los valores de los insumos antes de actualizarlos
        console.log(
          "Valores obtenidos en la búsqueda:",
          response.data.resultado.list
        );
        console.log("Insumos cargados después de buscar:", nuevosInsumos);

        setInsumos(nuevosInsumos);
      } else {
        setInsumos([]);
        setError("No se encontraron resultados.");
      }
    } catch (error) {
      setInsumos([]);
      setError("Error al cargar los datos");
    }
  };

  const handleUpdate = async () => {
    try {
      // Verifica que id_ubi no sea undefined
      if (!updateData.id_ubi) {
        console.error(
          "ID de ubicación no está definido. No se puede actualizar."
        );
        setError("ID de ubicación no está definido.");
        return; // Evita hacer la solicitud
      }

      // Prepara los datos para enviar
      const filteredData = {
        id_ubi: updateData.id_ubi,
        code_prod: updateData.code_prod || null,
        ubi: updateData.ubi || null,
        cant_stock: updateData.cant_stock || null,
        pasillo: updateData.pasillo || null,
        lote: updateData.lote || null,
        almacen: updateData.almacen || null,
        estado: updateData.estado || null,
      };

      console.log("Datos a actualizar:", filteredData);

      // Realiza la solicitud a la API
      const response = await axios.post(
        "http://192.168.3.27:3007/api/inventarios/inventarios/ActualizarUbi",
        filteredData
      );

      // Verifica el estado y contenido de la respuesta
      if (response.status === 200 && response.data.success) {
        console.log("Actualización exitosa:", response.data);
        await fetchAllInsumos(); // Recarga los datos después de actualizar
        handleClose(); // Cierra el modal
        setAlertMessage("Actualización exitosa."); // Mensaje de éxito para el usuario
        setAlertOpen(true); // Muestra la alerta de éxito
      } else {
        setError(
          "Registro no encontrado o no se pudo actualizar en el servidor."
        );
        console.warn("Advertencia en la actualización:", response.data);
      }
    } catch (error) {
      console.error("Error al actualizar el inventario:", error);
      setError("Error al realizar la actualización"); // Muestra el mensaje de error
    }
  };

  //insertar

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const openInsertModal = () => {
    setInsertModalOpen(true);
  };

  const closeInsertModal = () => {
    setInsertModalOpen(false);
  };

  const fetchDepInsumos = async () => {
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/Obtredinv"
      );

      if (response.data?.resultado?.list) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida).toLocaleDateString(
            "es-ES",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          ),
        }));
        setDepInsumos(list);
      } else {
        setDepInsumos([]);
        setError("No se encontraron datos.");
      }
    } catch (error) {
      console.error("Error fetching Dep Insumos data:", error);
      setError("Error al cargar los datos.");
    }
  };

  const fetchMaqData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerMaq"
      );

      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"), // Reemplaza el separador por '/'
        }));
        setDepMaq(list);
      } else {
        setDepMaq([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Maq data:", err);
      //setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCuaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerCua"
      );
      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"), // Reemplaza el separador por '/'
        }));
        setDepCua(list);
      } else {
        setDepCua([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Cua data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerExp"
      );

      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"), // Reemplaza el separador por '/'
        }));
        setDepExp(list);
      } else {
        setDepExp([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Exp data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSegData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerSeg"
      );

      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"), // Reemplaza el separador por '/'
        }));
        setDepSeg(list);
      } else {
        setDepSeg([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Seg data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDevData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerDev"
      );
      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"), // Reemplaza el separador por '/'
        }));
        setDepDev(list);
      } else {
        setDepDev([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Dev data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDivData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerDiv"
      );
      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: new Date(item.fecha_salida)
            .toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/"), // Reemplaza el separador por '/'
        }));
        setDepDiv(list);
      } else {
        setDepDiv([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Div data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/ObtenerMue"
      );
      if (response.data && !response.data.resultado.error) {
        const list = response.data.resultado.list.map((item, index) => ({
          ...item,
          id: index + 1,
          fecha_salida: item.fecha_salida
            ? new Date(item.fecha_salida)
                .toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "/") // Reemplaza el separador por '/'
            : "Fecha no disponible", // Mensaje alternativo si no hay fecha
        }));
        setDepMue(list);
      } else {
        setDepMue([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      console.error("Error fetching Mue data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPickingData = async () => {
    try {
      const response = await axios.get(
        "http://192.168.3.27:3007/api/inventarios/inventarios/peacking"
      );
      setDatosPicking(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de Picking:", error);
    }
  };

  const handleOpenEditModal = (dato) => {
    setSelectedDato(dato);
    setEditedData({
      ubi: dato.ubi,
      code_prod: dato.code_prod,
      cant_stock: dato.cant_stock,
      lote: dato.lote,
      almacen: dato.almacen,
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedDato(null);
  };

  const handleOpenModalInsertUbi = () => {
    setOpenModalInsertUbi(true);
  };

  // Función para cerrar el modal de inserción
  const handleCloseModalInsertUbi = () => {
    setOpenModalInsertUbi(false);
  };

  const handleInputChangeNuevaUbi = (e) => {
    const { name, value } = e.target;
    setFormDataNuevaUbi((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGuardarNuevaUbi = async () => {
    // Asegúrate de que todos los campos estén completos
    if (
      !formDataNuevaUbi.nuevaUbi ||
      !formDataNuevaUbi.nuevoCodigoProd ||
      !formDataNuevaUbi.nuevaCantStock
    ) {
      Swal.fire("Error", "Por favor complete todos los campos", "error");
      return;
    }

    // Mapeo de los datos para que coincidan con los nombres esperados por el backend
    const formData = {
      new_code_prod: formDataNuevaUbi.nuevoCodigoProd, // mapeo a new_code_prod
      new_cant_stock: formDataNuevaUbi.nuevaCantStock, // mapeo a new_cant_stock
      ubi: formDataNuevaUbi.nuevaUbi, // mapeo a ubi
      pasillo: formDataNuevaUbi.nuevoPasillo, // mapeo a pasillo
      lote: formDataNuevaUbi.nuevoLote, // mapeo a lote
      almacen: formDataNuevaUbi.nuevoAlmacen, // mapeo a almacen
      estado: formDataNuevaUbi.nuevoEstado, // mapeo a estado
    };

    console.log("Datos que se están enviando:", formData);

    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/inventarios/inventarios/AgregarNuevaUbi",
        formData
      );

      if (response.data.success) {
        Swal.fire(
          "Éxito",
          "La ubicación se ha insertado correctamente",
          "success"
        );
        setOpenModalInsertUbi(false); // Cerrar el modal
      } else {
        Swal.fire("Error", "No se pudo insertar la ubicación", "error");
      }
    } catch (error) {
      console.error("Error al guardar nueva ubicación:", error);
      Swal.fire("Error", "Hubo un problema al insertar la ubicación", "error");
    }
  };

  const handleEditChange = (field, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };
  // Asegúrate de importar SweetAlert2 o MySwal de la manera adecuada en tu proyecto.

  const handleSaveChanges = async () => {
    // Cierra el modal antes de abrir SweetAlert
    handleCloseEditModal();

    // Mostrar un diálogo de confirmación antes de guardar
    const confirmSave = await MySwal.fire({
      title: "¿Guardar cambios?",
      text: "¿Estás seguro de que deseas actualizar esta información?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-z-index-higher",
      },
    });

    if (confirmSave.isConfirmed) {
      try {
        // Realiza la solicitud PUT para actualizar los datos
        await axios.put(
          `http://192.168.3.27:3007/api/inventarios/inventarios/updatePeacking`,
          {
            id_ubi: selectedDato.id_ubi,
            ...editedData,
          }
        );

        // Actualizar la tabla localmente
        const updatedData = paginatedData.map((dato) =>
          dato.id_ubi === selectedDato.id_ubi
            ? { ...dato, ...editedData }
            : dato
        );
        setPaginatedData(updatedData); // Actualiza los datos en la tabla

        // Muestra un mensaje de éxito
        MySwal.fire(
          "Actualizado",
          "Los datos han sido actualizados exitosamente.",
          "success"
        );
      } catch (error) {
        console.error("Error al actualizar los datos:", error);

        // Muestra un mensaje de error si la actualización falla
        MySwal.fire(
          "Error",
          "Hubo un problema actualizando los datos.",
          "error"
        );
      }
    } else {
      // Si el usuario cancela, reabre el modal
      setEditModalOpen(true);
    }
  };

  const handleDelete = async (id_ubi) => {
    console.log("Eliminando producto con 'id_ubi':", id_ubi); // Verifica que estamos recibiendo el id_ubi correctamente

    try {
      // Realiza la solicitud DELETE
      const response = await axios.delete(
        "http://192.168.3.27:3007/api/inventarios/inventarios/borrar",
        {
          data: { id_ubi: id_ubi }, // Asegúrate de que estamos enviando el id_ubi
        }
      );

      if (response.data.success) {
        alert("Producto eliminado correctamente");
        setDepMue((prev) => prev.filter((item) => item.id_ubi !== id_ubi)); // Actualiza el estado eliminando el producto
      } else {
        alert("No se pudo eliminar el producto");
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Hubo un error al intentar eliminar el producto");
    }
  };

  const handleSaveNewRecord = async () => {
    const confirmSave = await MySwal.fire({
      title: "¿Guardar nuevo registro?",
      text: "¿Estás seguro de que deseas guardar esta información?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-z-index-higher",
      },
    });

    if (confirmSave.isConfirmed) {
      try {
        // Realiza la solicitud POST para insertar los datos
        const response = await axios.post(
          `http://192.168.3.27:3007/api/inventarios/inventarios/insertarPeacking`,
          {
            id_ubi: editedData.id_ubi,
            code_prod: editedData.code_prod,
            cant_stock: editedData.cant_stock,
            pasillo: editedData.pasillo,
            lote: editedData.lote,
            almacen: editedData.almacen,
          }
        );

        // Agregar el nuevo dato a la tabla localmente
        const newRecord = { id_ubi: editedData.id_ubi, ...editedData };
        const updatedData = [...paginatedData, newRecord];
        setPaginatedData(updatedData); // Actualiza los datos en la tabla

        // Muestra un mensaje de éxito
        MySwal.fire(
          "Guardado",
          "El nuevo registro ha sido guardado exitosamente.",
          "success"
        );
      } catch (error) {
        console.error("Error al guardar el nuevo registro:", error);

        // Muestra un mensaje de error si la inserción falla
        MySwal.fire(
          "Error",
          "Hubo un problema al guardar el nuevo registro.",
          "error"
        );
      }
    } else {
      // Si el usuario cancela, reabre el modal
      setEditModalOpen(true);
    }
  };

  const detailRed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://192.168.3.27:3007/api/Inventario_P/Red_Ubi"
      ); // Cambia la URL aquí
      if (response.data && !response.data.resultado.error) {
        const nuevosInsumos = response.data.resultado.list.map((insumo) => ({
          id: insumo.id,
          ...insumo,
          cant_stock: Number(insumo.cant_stock),
          ingreso: new Date(insumo.ingreso).toLocaleDateString("es-Es", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        }));
        setInsumos(nuevosInsumos);
      } else {
        setInsumos([]);
        setError("No se encontraron datos.");
      }
    } catch (err) {
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    if (updateData.id_ubi) {
      await handleUpdate();
    } else {
      await handleInsert(); // Si no hay id, debe ser inserción
    }
    try {
      for (let i = 0; i < formData.length; i++) {
        const form = formData[i];

        // Asegúrate de que cant_stock sea un número
        const cant_stock = parseInt(form.cant_stock, 10);

        const response = await axios.post(
          "http://192.168.3.27:3007/api/inventarios/inventarios/AgregarNuevaUbi",
          {
            new_code_prod: form.code_prod,
            new_cant_stock: cant_stock,
            ubi: form.ubi,
          }
        );

        if (response.status === 200 && response.data.success) {
          console.log("Producto insertado correctamente:", response.data);
        } else {
          setError("No se pudo insertar el producto.");
          console.warn("Advertencia en la inserción:", response.data);
          break;
        }
      }

      setAlertOpen(true);
    } catch (error) {
      console.error("Error al insertar productos:", error);
      setError("Error al insertar los productos.");
    }
  };

  // Función para cargar ubicaciones impares
  const fetchImpares = async () => {
    setLoading(true);
    setInsumos([]); // Limpiar los datos previos

    try {
      const response = await fetch(
        "http://192.168.3.27:3007/api/inventarios/impares"
      );
      if (!response.ok) throw new Error("Error al obtener datos de impares");

      const data = await response.json();

      // Asegúrate de que cada fila tenga una propiedad `id` única
      const updatedData = data
        .map((item, index) => ({
          ...item,
          id: `${item.ubi || "impar"}-${index}`, // Asegura un ID único
        }))
        .sort((a, b) => (a.ubi > b.ubi ? 1 : -1)); // Ordenar por 'ubi'

      console.log("Datos de impares ordenados:", updatedData); // Depuración
      setInsumos(updatedData); // Actualizar estado
    } catch (err) {
      console.error("Error al obtener ubicaciones impares:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar ubicaciones pares
  const fetchPares = async () => {
    setLoading(true);
    setInsumos([]); // Limpiar los datos previos

    try {
      const response = await fetch(
        "http://192.168.3.27:3007/api/inventarios/pares"
      );
      if (!response.ok) throw new Error("Error al obtener datos de pares");

      const data = await response.json();

      // Asegúrate de que cada fila tenga una propiedad `id` única
      const updatedData = data
        .map((item, index) => ({
          ...item,
          id: `${item.ubi || "par"}-${index}`, // Asegura un ID único
        }))
        .sort((a, b) => (a.ubi > b.ubi ? 1 : -1)); // Ordenar por 'ubi'

      console.log("Datos de pares ordenados:", updatedData); // Depuración
      setInsumos(updatedData); // Actualizar estado
    } catch (err) {
      console.error("Error al obtener ubicaciones pares:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "ubi",
      headerName: (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "200%",
          }}
        >
          <TextField
            label="Ubicación"
            size="small"
            color="primary"
            value={ubi}
            onChange={(e) => {
              const nuevaUbicacion = e.target.value;
              setUbi(nuevaUbicacion);
              handleSearchUbi(nuevaUbicacion); // Llamar a la búsqueda cada vez que cambia el texto
            }}
            placeholder="Ubicación"
            fullWidth
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchUbi(ubi); // Usar la función para buscar
              }
            }}
          />
        </Box>
      ),
      width: 200,
    },
    {
      field: "code_prod",
      headerName: "Código Producto",
      width: 150,
      renderCell: (params) => {
        return params.row.cant_stock === 0 ? "" : params.value;
      },
    },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => {
        return params.value === 0 ? "" : params.value;
      },
    },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen", headerName: "Almacén", width: 120 },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "ingreso", headerName: "Ingreso", width: 160 },
    { field: "area", headerName: "Área", width: 120 },
    { field: "Estado", headerName: "Estados", width: 120 },
    {
      field: "movimiento",
      headerName: "Movimiento",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={() => handleOpenUpdateModal(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            color="primary"
            onClick={() => handleView(params.row, params.row)}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              padding: "8px 16px",
              margin: "0 4px",
              borderRadius: "8px",
            }}
          >
            Traspaso
          </Button>

          <Button
            color="primary"
            onClick={() => {
              console.log(
                "Eliminando producto con 'id_ubi':",
                params.row.id_ubi
              ); // Aquí mostramos el id_ubi
              handleDelete(params.row.id_ubi); // Enviar id_ubi al backend para eliminar
            }}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              padding: "8px 16px",
              margin: "0 4px",
              borderRadius: "8px",
            }}
          >
            Borrar
          </Button>
        </Box>
      ),
    },
  ];

  const inventoryColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 150 },
    {
      field: "code_prod",
      headerName: "Código Producto",
      width: 150,
      renderCell: (params) => {
        return params.row.cant_stock === 0 ? "" : params.value; // Oculta el código si el stock es 0
      },
    },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const maqColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    {
      field: "code_prod",
      headerName: "Código Producto",
      width: 150,
      renderCell: (params) => {
        return params.row.cant_stock === 0 ? "" : params.value; // Oculta el código si el stock es 0
      },
    },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const cuaColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "code_prod", headerName: "Código Producto", width: 150 },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const expColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "code_prod", headerName: "Código Producto", width: 150 },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const segColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "code_prod", headerName: "Código Producto", width: 150 },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const devColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "code_prod", headerName: "Código Producto", width: 150 },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const divColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "code_prod", headerName: "Código Producto", width: 150 },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  const mueColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 200 },
    { field: "code_prod", headerName: "Código Producto", width: 150 },
    {
      field: "cant_stock",
      headerName: "Cantidad Stock",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "cant_stock_mov",
      headerName: "Cantidad Movimiento",
      width: 150,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    { field: "pasillo", headerName: "Pasillo", width: 100 },
    { field: "lote", headerName: "Lote", width: 100 },
    { field: "almacen_entrada", headerName: "Almacén Entrada", width: 150 },
    { field: "almacen_salida", headerName: "Almacén Salida", width: 150 },
    { field: "fecha_salida", headerName: "Fecha Salida", width: 180 },
    { field: "nombre_responsable", headerName: "Responsable", width: 180 },
  ];

  // Función para abrir el modal de ingreso
  const handleOpenModal = (recibo) => {
    setSelectedRecibo(recibo); // Guardar el recibo seleccionado
    setOpenModal(true); // Abrir el modal
    setOpenMovimientoModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Cerrar el modal
    setOpenModalAlmacenamiento(false);
    setSelectedRecibo(null); // Limpiar el recibo seleccionado
  };

  // Función para cambiar de sección
  const handleSectionChange = (event, newValue) => {
    setSection(newValue);
  };

  // Renderizado de las secciones
  const renderSection = () => {
    switch (section) {
      case 0:
        return renderInventarios();
      case 1:
        return Almacenamiento("Almacenamiento");
      case 2:
        return Departamental("Departamental");
      case 3:
        return Maq_externa("Maq Externa");
      case 4:
        return Cuarentena("Cuarentena");
      case 5:
        return Exportaciones("Exportaciones");
      case 6:
        return Segunda("Segunda");
      case 7:
        return Devoluciones("Devoluciones");
      case 8:
        return Diferencia("Diferencia");
      case 9:
        return Muestras("Muestras");
      case 10:
        return Picking("Picking");
      default:
        return renderInventarios();
    }
  };

  const renderInventarios = () => (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Datos de Inventarios
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Recibo</TableCell>
                <TableCell>Imagen</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>O.C.</TableCell>
                <TableCell>Cantidad Recibida</TableCell>
                <TableCell>Naviera</TableCell>
                <TableCell>Pedimento</TableCell>
                <TableCell>Restante</TableCell>
                <TableCell>fetchExpData</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosInventarios.map((dato) => (
                <TableRow key={dato.id_recibo}>
                  <TableCell>{dato.id_recibo}</TableCell>
                  <TableCell>
                    <img
                      src={`../assets/image/img_pz/${dato.codigo}.jpg`}
                      alt="Producto"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  </TableCell>
                  <TableCell>{dato.des}</TableCell>
                  <TableCell>{dato.codigo}</TableCell>
                  <TableCell>{dato.oc}</TableCell>
                  <TableCell>{dato.cantidad_recibida}</TableCell>
                  <TableCell>{dato.naviera}</TableCell>
                  <TableCell>{dato.pedimento}</TableCell>
                  <TableCell>{dato.restante}</TableCell>
                  <TableCell>{dato.fecha_recibo}</TableCell>
                  <TableCell>
                    {dato.est === "L" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAutorizar(dato)}
                      >
                        Autorizar
                      </Button>
                    )}
                    {dato.est === "I" && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenModal(dato)}
                      >
                        Liberar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );

  const renderNuevaSeccion = (titulo) => (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4">{titulo}</Typography>
      <Typography>Contenido de la sección {titulo}...</Typography>
    </div>
  );

  const Picking = (titulo) => (
    <div style={{ padding: "20px" }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4">{titulo}</Typography>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Button onClick={openInsertModal} variant="contained" color="primary">
            Insertar Producto
          </Button>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "8%" }}>Imagen </TableCell>
                <TableCell sx={{ width: "9%" }}>Ubicación</TableCell>

                <TableCell sx={{ width: "15%" }}>Descripcón </TableCell>
                <TableCell sx={{ width: "10%" }}>Código Producto</TableCell>
                <TableCell sx={{ width: "5%" }}>Cantidad Stock</TableCell>
                <TableCell sx={{ width: "5%" }}>Pasillo</TableCell>
                <TableCell sx={{ width: "5%" }}>Lote</TableCell>
                <TableCell sx={{ width: "5%" }}>Almacén</TableCell>
              </TableRow>
              <TableRow>
                <TableCell> </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Ubicación"
                    value={ubicacionFilter}
                    onChange={(e) => setUbicacionFilter(e.target.value)}
                    sx={{ width: "100%" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Descripción"
                    value={descripcionFilter}
                    onChange={(e) => setDecripcionFilter(e.target.value)}
                    sx={{ width: "100%" }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Código"
                    value={codigoFilter}
                    onChange={(e) => setCodigoFilter(e.target.value)}
                    sx={{ width: "100%" }}
                  />
                </TableCell>
                <TableCell> </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((dato) => (
                <TableRow key={dato.id_ubi}>
                  <TableCell>
                    <img
                      src={`../assets/image/img_pz/${dato.code_prod}.jpg`}
                      alt="Producto"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "../assets/image/img_pz/noimage.png";
                      }}
                    />
                  </TableCell>
                  <TableCell>{dato.ubi}</TableCell>
                  <TableCell>{dato.des}</TableCell>
                  <TableCell>{dato.code_prod}</TableCell>
                  <TableCell>{dato.cant_stock}</TableCell>
                  <TableCell>{dato.pasillo}</TableCell>
                  <TableCell>{dato.lote || "N/A"}</TableCell>
                  <TableCell>{dato.almacen || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditModal(dato)}>
                      <EditIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={currentPage}
            onPageChange={(event, newPage) => setCurrentPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) =>
              setRowsPerPage(parseInt(event.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            labelRowsPerPage="Filas por página"
          />
        </TableContainer>
      </Box>

      {/* Modal de Inserción */}
      <Dialog open={isInsertModalOpen} onClose={closeInsertModal}>
        <DialogTitle>Insertar Nuevo Producto</DialogTitle>
        <DialogContent>
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}

          <TextField
            label="Ubicacion"
            name="ubi"
            value={newData.ubi}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Código Producto"
            name="code_prod"
            value={newData.code_prod}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cantidad Stock"
            type="number"
            name="cant_stock"
            value={newData.cant_stock}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Pasillo"
            name="pasillo"
            value={newData.pasillo}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Lote"
            name="lote"
            value={newData.lote}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Almacén"
            name="almacen"
            value={newData.almacen}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInsertModal}>Cancelar</Button>
          <Button onClick={handleInsert} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>Editar Datos del Producto</DialogTitle>
        <DialogContent>
          <img
            src={`../assets/image/img_pz/${selectedDato?.code_prod}.jpg`}
            alt="Producto"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              marginBottom: "10px",
            }}
          />
          <TextField
            label="Ubicación"
            value={editedData.ubi} // Usar editedData para el valor
            onChange={(e) => handleEditChange("ubi", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Descripción"
            value={selectedDato?.des || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            margin="normal"
          />
          <TextField
            label="Código Producto"
            value={editedData.code_prod}
            onChange={(e) => handleEditChange("code_prod", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cantidad Stock"
            type="number"
            value={editedData.cant_stock}
            onChange={(e) => handleEditChange("cant_stock", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Lote"
            value={editedData.lote}
            onChange={(e) => handleEditChange("lote", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Almacén"
            value={editedData.almacen}
            onChange={(e) => handleEditChange("almacen", e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancelar</Button>
          <Button onClick={handleSaveChanges} color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  const Almacenamiento = (titulo) => (
    <div style={{ padding: "20px" }}>
      <Box sx={{ height: "100%", width: "90%", padding: 2 }}>
        <TextField
          label="Buscar Código"
          size="small"
          color="primary"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.trim() === "") {
              fetchAllInsumos();
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: isSmallScreen ? "100%" : "300px",
            mb: 2,
          }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ ml: 2, background: "blue" }}
        >
          Buscar
        </Button>

        {/* Botón para abrir el modal */}
        <Button
          variant="contained"
          onClick={handleOpenModalInsertUbi}
          sx={{ ml: 2, background: "green" }}
        >
          Insertar Nueva Ubicación
        </Button>

        <Box sx={{ mb: 2 }}>
          {/* Botones para filtrar */}
          <Button variant="contained" color="primary" onClick={fetchImpares}>
            Mostrar Impares
          </Button>

          <Button variant="contained" color="secondary" onClick={fetchPares}>
            Mostrar Pares
          </Button>
        </Box>

       {/*  <Button onClick={handleOpenDetailsModal}>Mostrar Detalles</Button> */}

        <Dialog open={openUpdateModal} onClose={handleClose}>
          <DialogTitle>Actualizar Ubicación</DialogTitle>
          <DialogContent>
            <TextField
              label="Código Ubicación"
              value={updateData.ubi || ""}
              InputProps={{ readOnly: true }} // Campo solo de lectura
              fullWidth
              margin="normal"
            />
            <TextField
              label="Código Producto"
              value={updateData.code_prod || ""}
              onChange={(e) =>
                setUpdateData({ ...updateData, code_prod: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Cantidad Stock"
              type="number"
              value={updateData.cant_stock || ""}
              onChange={(e) =>
                setUpdateData({ ...updateData, cant_stock: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Pasillo"
              value={updateData.pasillo || ""}
              onChange={(e) =>
                setUpdateData({ ...updateData, pasillo: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Lote"
              value={updateData.lote || ""}
              onChange={(e) =>
                setUpdateData({ ...updateData, lote: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Almacen"
              value={updateData.almacen || ""}
              onChange={(e) =>
                setUpdateData({ ...updateData, almacen: e.target.value })
              }
              fullWidth
              margin="normal"
            />

            {/* RadioGroup para seleccionar el Estado */}

            <div>
              {/* Radio buttons para seleccionar el estado */}
              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Estado</FormLabel>
                <RadioGroup
                  row
                  value={updateData.estado || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUpdateData({ ...updateData, estado: value });

                    if (value === "Compartido") {
                      setIsCompartido(true); // Mostrar los formularios cuando se selecciona "Compartido"
                    } else {
                      setIsCompartido(false); // Ocultar el formulario cuando se selecciona otro estado
                    }
                  }}
                >
                  <FormControlLabel
                    value="Ninguno"
                    control={<Radio />}
                    label="Ninguno"
                  />
                  <FormControlLabel
                    value="Unico"
                    control={<Radio />}
                    label="Unico"
                  />
                  <FormControlLabel
                    value="Compartido"
                    control={<Radio />}
                    label="Compartido"
                  />
                </RadioGroup>

                {/* Mostrar formulario de "Compartido" */}
                {isCompartido && (
                  <Box mt={2}>
                    <Button
                      onClick={handleIncrease}
                      startIcon={<PlusOneIcon />} // Agregar el ícono de aumentar
                    />

                    {/* Botón para disminuir el contador */}
                    <Button
                      onClick={handleDecrease} // Llamada a la función que disminuye
                      startIcon={<RemoveIcon />} // Ícono para disminuir
                      style={{ marginLeft: 10 }} // Espaciado entre botones
                    />

                    <Typography variant="h6" sx={{ marginTop: "10px" }}>
                      {`Productos a insertar: ${counter} veces`}
                    </Typography>

                    {/* Renderizar formularios dinámicamente */}
                    {formData.map((form, index) => (
                      <Box key={index} sx={{ marginTop: "20px" }}>
                        <TextField
                          label="Código del Producto"
                          value={form.code_prod}
                          onChange={(e) =>
                            handleFormChange(index, "code_prod", e.target.value)
                          }
                          fullWidth
                          margin="normal"
                          required // Campo obligatorio
                        />
                        <TextField
                          label="Cantidad en Stock"
                          type="number"
                          value={form.cant_stock}
                          onChange={(e) =>
                            handleFormChange(
                              index,
                              "cant_stock",
                              e.target.value
                            )
                          }
                          fullWidth
                          margin="normal"
                          required // Campo obligatorio
                        />
                        <TextField
                          label="bicación"
                          value={form.ubi}
                          onChange={(e) =>
                            handleFormChange(index, "ubi", e.target.value)
                          }
                          fullWidth
                          margin="normal"
                          required // Campo obligatorio
                        />
                      </Box>
                    ))}
                  </Box>
                )}
                {/* Botón para insertar los productos al backend */}
                {updateData.estado === "Compartido" && (
                  <Button onClick={handleInsert} color="primary" sx={{ mt: 2 }}>
                    Insertar Productos
                  </Button>
                )}
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              onClick={() => {
                handleInsert();
                handleUpdate();
              }}
            >
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>

        {error && <Alert severity="error">{error}</Alert>}

        <center>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Inventario 7050
          </Typography>
        </center>

        <DataGrid
          rows={insumos}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[5, 10, 20]}
          loading={loading}
          pagination
          paginationMode="client"
          getRowId={(row) => row.id}
          style={{ height: 800, width: "100%" }} // Establecer una altura fija
          getRowClassName={(params) => {
            if (params.row.cant_stock === 0) {
              return "stock-cero";
            }
            if (!params.row.cant_stock) {
              return "stock-vacio";
            }
            return "";
          }}
        />

        <div>
          {/* Modal de inserción */}
          <Dialog open={openModalInsertUbi} onClose={handleCloseModalInsertUbi}>
            <DialogTitle>Insertar Nueva Ubicación</DialogTitle>
            <DialogContent>
              <Box>
                <TextField
                  label="Ubicación"
                  name="nuevaUbi" // Aquí aseguramos que 'name' coincide con el campo en el estado
                  value={formDataNuevaUbi.nuevaUbi}
                  onChange={handleInputChangeNuevaUbi}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Código Producto"
                  name="nuevoCodigoProd" // Asegúrate de que 'name' sea correcto
                  value={formDataNuevaUbi.nuevoCodigoProd}
                  onChange={handleInputChangeNuevaUbi}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Cantidad en Stock"
                  type="number"
                  name="nuevaCantStock" // Aquí también
                  value={formDataNuevaUbi.nuevaCantStock}
                  onChange={handleInputChangeNuevaUbi}
                  fullWidth
                  margin="normal"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModalInsertUbi} color="secondary">
                Cancelar
              </Button>
              <Button onClick={handleGuardarNuevaUbi} color="primary">
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <Modal open={open} onClose={handleClose}>
          <div
            style={{
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
              margin: "auto",
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "8px",
            }}
          >
            <h2>Datos de Inventario</h2>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código Producto</TableCell>
                    <TableCell>Cantidad Stock</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Almacén</TableCell>
                    <TableCell>Código UBI</TableCell>
                    <TableCell>Ingreso</TableCell>
                    <TableCell>Código Usuario</TableCell>
                    <TableCell>Código Ingreso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insumos.length > 0 ? (
                    insumos.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.code_prod || ""}</TableCell>
                        <TableCell>
                          {item.cant_stock === 0 ? "" : item.cant_stock}
                        </TableCell>
                        <TableCell>{item.lote || ""}</TableCell>
                        <TableCell>{item.almacen || ""}</TableCell>
                        <TableCell>{item.codigo_ubi || ""}</TableCell>
                        <TableCell>{item.ingreso || ""}</TableCell>
                        <TableCell>{item.codigo_usuario || ""}</TableCell>
                        <TableCell>{item.codigo_ingreso || ""}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} style={{ textAlign: "center" }}>
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              onClick={handleClose}
              color="secondary"
              variant="contained"
              style={{ marginTop: "20px" }}
            >
              Cerrar
            </Button>
          </div>
        </Modal>

        <Dialog open={openMovimientoModal} onClose={handleClose}>
          <DialogTitle>Cambio de Inventario</DialogTitle>
          <DialogContent>
            <TextField
              label="Código de Producto"
              value={codeProd || ""} // Muestra el código del producto
              InputProps={{
                readOnly: true, // Solo lectura
              }}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Cantidad a Mover"
              type="number"
              value={cantReducida}
              onChange={(e) => setCantReducida(e.target.value)}
              fullWidth
              margin="dense"
            />
            <Select
              labelId="almacen-label"
              value={ubiNuv}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Seleccione un almacén
              </MenuItem>
              {almacenes.map((almacen) => (
                <MenuItem key={almacen} value={almacen}>
                  {almacen}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          .
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleGuardar} color="primary">
              Guardar
            </Button>
            {alertOpen && <div>{alertMessage}</div>}
          </DialogActions>
        </Dialog>

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
      </Box>
    </div>
  );

  const Departamental = (titulo) => (
    <Box>
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Departamental 7066
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depInsumos} // Usa depInsumos como filas
          columns={inventoryColumnsStatic} // Asegúrate de que aquí se usa inventoryColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
          getRowClassName={(params) => {
            if (params.row.cant_stock === 0) {
              return "stock-cero";
            }
            if (!params.row.cant_stock) {
              return "stock-vacio";
            }
            return "";
          }}
        />
      </div>
    </Box>
  );

  const Maq_externa = (titulo) => (
    <Box>
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Maq Externa 7237
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depMaq} // Usa depMaq como filas
          columns={maqColumnsStatic} // Asegúrate de que aquí se usa maqColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
        />
      </div>
    </Box>
  );

  const Cuarentena = (titulo) => (
    <Box>
      {/* DataGrid para Cuarentena */}
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Cuarentena 7008
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depCua} // Usa depCua como filas
          columns={cuaColumnsStatic} // Asegúrate de que aquí se usa cuaColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
        />
      </div>
    </Box>
  );

  const Exportaciones = (titulo) => (
    <Box>
      {/* DataGrid para Expedientes */}
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Exportaciones 7080
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depExp} // Usa depExp como filas
          columns={expColumnsStatic} // Asegúrate de que aquí se usa expColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
        />
      </div>
    </Box>
  );

  const Segunda = (titulo) => (
    <Box>
      {/* DataGrid para Segunda */}
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Segunda 7235
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depSeg} // Usa depSeg como filas
          columns={segColumnsStatic} // Asegúrate de que aquí se usa segColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
        />
      </div>
    </Box>
  );

  const Devoluciones = (titulo) => (
    <Box>
      {/* DataGrid para Devoluciones */}
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Devoluciones 7236
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depDev} // Usa depDev como filas
          columns={devColumnsStatic} // Asegúrate de que aquí se usa devColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
        />
      </div>
    </Box>
  );

  const Diferencia = (titulo) => (
    <Box>
      {/* DataGrid para Diferencia */}
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Diferencia 7090
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depDiv} // Usa depDiv como filas
          columns={divColumnsStatic} // Asegúrate de que aquí se usa divColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false} // Configura según sea necesario
        />
      </div>
    </Box>
  );

  const Muestras = (titulo) => (
    <Box>
      {/* DataGrid para Muestras */}
      <br />
      <center>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Muestras 7081
        </Typography>
      </center>
      <div style={{ height: 400, width: "100%", overflow: "auto" }}>
        <DataGrid
          rows={depMue} // Usa depMue como filas
          columns={mueColumnsStatic} // Asegúrate de que aquí se usa mueColumnsStatic
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection={false}
        />
      </div>
    </Box>
  );

  return (
    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {/* Menú de pestañas */}
      <Tabs
        value={section}
        onChange={handleSectionChange}
        style={{ alignSelf: "flex-start", marginLeft: "20px" }}
      >
        <Tab label="Inventarios" icon={<Inventory />} />
        <Tab label="Almacenamiento" icon={<Dashboard />} />
        <Tab label="Departamental" icon={<Dashboard />} />
        <Tab label="Maq Externa" icon={<Dashboard />} />
        <Tab label="Cuarentena" icon={<Dashboard />} />
        <Tab label="Exportaciones" icon={<Dashboard />} />
        <Tab label="Segunda" icon={<Dashboard />} />
        <Tab label="Devoluciones" icon={<Dashboard />} />
        <Tab label="Diferencia" icon={<Dashboard />} />
        <Tab label="Muestras" icon={<Dashboard />} />
        <Tab label="Picking" icon={<Dashboard />} />
      </Tabs>

      {/* Contenido según la sección seleccionada */}
      <main style={{ padding: "20px" }}>{renderSection()}</main>
    </div>
  );
}

export default InventarioAdmin;

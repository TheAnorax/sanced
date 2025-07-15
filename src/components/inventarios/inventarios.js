import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
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
import { Dashboard } from "@mui/icons-material";
import Swal from "sweetalert2";
import { UserContext } from "../context/UserContext";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import MySwal from "sweetalert2";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import RemoveIcon from "@mui/icons-material/Remove"; // Ícono para disminuir
import DeleteIcon from "@mui/icons-material/Delete"; // Ícono para eliminar

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
  const [originalInsumos, setOriginalInsumos] = useState([]);
  const [cantStockFilter, setCantStockFilter] = useState("");

  const [nivelFilter, setNivelFilter] = useState("");
  const [ingresoFilter, setIngresoFilter] = useState("");
  const [setDescripcionFilter] = useState("");

  // Estado para controlar la apertura del modal
  const [openModal, setOpenModal] = useState(false);
  const [openModalAlma, setOpenModalAlmacenamiento] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null); // Para saber qué recibo se está procesando
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
  const [pickDep, setPickDep] = useState([]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDato, setSelectedDato] = useState(null);
  const [paginatedData, setPaginatedData] = useState([]);
  const [estado, setEstado] = useState("");
  const [sinUbicacionData, setSinUbicacionData] = useState([]);

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

///////DEPARTAMANTAL//////
  const [openCreateModal, setOpenCreateModal] = useState(false);
const [newPickData, setNewPickData] = useState({
  ubi: "",
  code_prod: "",
  cant_stock: "",
  cant_stock_mov: "",
  pasillo: "",
  lote: "",
  almacen_entrada: "",
  almacen_salida: "",
  codigo_salida: "",
});

const [editModalOpen7066, setEditModalOpen7066] = useState(false);
const [editData, setEditData] = useState({
  id: null,
  ubi: "",
  code_prod: "",
  cant_stock: "",
  pasillo: "",
  codigo_salida: "",
});


const handleOpenEditModal7066 = (row) => {
  setEditData({
    id: row.id_ubicacion,
    ubi: row.ubi || "",
    code_prod: row.code_prod || "",
    cant_stock: row.cant_stock || "",
    pasillo: row.pasillo || "",
    codigo_salida: row.codigo_salida || "",
  });
  setEditModalOpen7066(true);
};

const handleEditChange7066 = (e) => {
  const { name, value } = e.target;
  setEditData((prev) => ({ ...prev, [name]: value }));
};

const handleEditPick7066 = async () => {
  try {
    const response = await axios.put(
      `http://66.232.105.87:3007/api/departamental/update/${editData.id}`,
      {
        ubi: editData.ubi,
        code_prod: editData.code_prod,
        cant_stock: editData.cant_stock,
        pasillo: editData.pasillo,
        codigo_salida: editData.codigo_salida,
      }
    );

    if (response.data && !response.data.error) {
      setEditModalOpen7066(false);
      Swal.fire("✅ Éxito", "Ubicación actualizada correctamente", "success");
      fetchDevData();
    } else {
      Swal.fire("❌ Error", response.data.message, "error");
    }
  } catch (err) {
    console.error("Error al actualizar ubicación:", err);
    Swal.fire("❌ Error", "Hubo un problema en la solicitud", "error");
  }
};

const handleDeletePick7066 = async (id_ubicacion) => {
  const confirm = await Swal.fire({
    title: "¿Eliminar ubicación?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    const response = await axios.delete(
      `http://66.232.105.87:3007/api/departamental/delete/${id_ubicacion}`
    );

    if (response.data && !response.data.error) {
      Swal.fire("Eliminado", "La ubicación fue eliminada.", "success");
      fetchDevData();
    } else {
      Swal.fire("Error", response.data.message, "error");
    }
  } catch (err) {
    console.error("Error al eliminar ubicación:", err);
    Swal.fire("Error", "No se pudo eliminar", "error");
  }
};


const handleInputChangeCreate = (e) => {
  const { name, value } = e.target;
  setNewPickData((prev) => ({ ...prev, [name]: value }));
};

const handleCreateUbicacionDepartamental = async () => {
  try {
    const response = await axios.post(
      "http://66.232.105.87:3007/api/departamental/create",
      newPickData
    );

    if (response.data && !response.data.error) {
      Swal.fire("✅ Éxito", "Ubicación creada correctamente", "success");
      setOpenCreateModal(false);
      fetchDevData(); // Recargar tabla
    } else {
      Swal.fire("❌ Error", response.data.message, "error");
    }
  } catch (err) {
    console.error("Error al crear ubicación:", err);
    Swal.fire("❌ Error", "Hubo un problema en la solicitud", "error");
  }
};
///////////////////////////////


  const exportUbi7050ToExcel = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/inventarios/inventarios/obtenerUbiAlma"
      );

      const data = response.data.resultado.list.map((item) => ({
        Ubicación: item.ubi,
        "Código Producto": item.code_prod,
        Descripción: item.des,
        "Cantidad Stock": item.cant_stock,
        Ingreso: item.ingreso
          ? new Date(item.ingreso).toLocaleDateString("es-ES")
          : null,
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario7050");
      XLSX.writeFile(workbook, "Inventario7050.xlsx");
    } catch (error) {
      console.error("Error al exportar datos de 7050:", error);
    }
  };

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  useEffect(() => {
    const filtered = originalInsumos.filter((dato) => {
      return (
        (ubicacionFilter === "" ||
          (dato.ubi?.toLowerCase() || "").includes(
            ubicacionFilter.toLowerCase()
          )) &&
        (descripcionFilter === "" ||
          (dato.des?.toLowerCase() || "").includes(
            descripcionFilter.toLowerCase()
          )) &&
        (codigoFilter === "" ||
          (dato.code_prod?.toLowerCase() || "").includes(
            codigoFilter.toLowerCase()
          )) &&
        (cantStockFilter === "" ||
          (dato.cant_stock?.toString() || "").includes(cantStockFilter)) &&
        (nivelFilter === "" ||
          (dato.nivel?.toString() || "").includes(nivelFilter)) &&
        (ingresoFilter === "" ||
          (dato.ingreso?.toString() || "").includes(ingresoFilter))
      );
    });

    setInsumos(filtered);
  }, [
    ubicacionFilter,
    descripcionFilter,
    codigoFilter,
    cantStockFilter,
    nivelFilter,
    ingresoFilter,
    originalInsumos,
  ]);

  useEffect(() => {
    const fetchInventariosData = async () => {
      try {
        const response = await axios.get(
          "http://66.232.105.87:3007/api/inventarios/inventarios"
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
            "http://66.232.105.87:3007/api/inventarios/inventarios/autorizar",
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
    fetchDevData();
    fetchAllInsumos();
  }, []);



  const handleChange = (event) => {
    setUbiNuv(event.target.value);
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
  
  const handleDeletePick = async (id_ubi) => {
    try {
      const confirm = await MySwal.fire({
        title: "¿Eliminar ubicación?",
        text: `¿Estás seguro de eliminar la ubicación con ID: ${id_ubi}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      const response = await axios.post(
        "http://66.232.105.87:3007/api/inventarios/inventarios/borrarPick",
        { id_ubi }
      );

      if (response.data.success) {
        setPaginatedData((prev) =>
          prev.filter((item) => item.id_ubi !== id_ubi)
        );
        MySwal.fire("Eliminado", "La ubicación fue eliminada.", "success");
      } else {
        MySwal.fire("Error", "No se pudo eliminar la ubicación", "error");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      MySwal.fire("Error", "Fallo la solicitud al eliminar", "error");
    }
  };

  const fetchAllInsumos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/inventarios/inventarios/obtenerUbiAlma"
      );

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

        setOriginalInsumos(nuevosInsumos); // Guardar los datos originales
        setInsumos(nuevosInsumos); // Aplicar en la tabla también
      } else {
        setOriginalInsumos([]);
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
        user_id: user.id_usu,
      };

      console.log("Datos a actualizar:", filteredData);

      // Realiza la solicitud a la API
      const response = await axios.post(
        "http://66.232.105.87:3007/api/inventarios/inventarios/ActualizarUbi",
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

  const fetchDevData = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/departamental/plan"
      );

      if (response.data?.data?.length > 0) {
        const list = response.data.data.map((item, index) => ({
          ...item,
          id: index + 1, // Obligatorio para DataGrid
          fecha_salida: item.fecha_salida
            ? new Date(item.fecha_salida).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "",
          nombre_responsable: item.name || "", // Por si se requiere
          des: item.des || "", // <-- Asegúrate de que este campo venga en la respuesta de la API
        }));

        setPickDep(list);
      } else {
        setPickDep([]);
        setError("No se encontraron datos.");
      }
    } catch (error) {
      console.error(
        "Error al cargar los datos de inventario departamental:",
        error
      );
      setError("Error al cargar los datos.");
    }
  };

  const exportDepartamentalToExcel = () => {
  if (!pickDep || pickDep.length === 0) {
    Swal.fire("Atención", "No hay datos para exportar.", "info");
    return;
  }

  const data = pickDep.map((item) => ({
    "Ubicación": item.ubi,
    "Código Producto": item.code_prod,
    "Descripción": item.des || "",
    "Cantidad Stock": item.cant_stock || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Departamental");

  XLSX.writeFile(workbook, "Departamental_7066.xlsx");
};


  const fetchPickingData = async () => {
    try {
      const response = await axios.get(
        "http://66.232.105.87:3007/api/inventarios/inventarios/peacking"
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
        "http://66.232.105.87:3007/api/inventarios/inventarios/AgregarNuevaUbi",
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

  const handleGuardarNuevaUbipICK = async () => {
    if (
      !newData.ubi ||
      !newData.code_prod ||
      !newData.cant_stock ||
      !newData.pasillo ||
      !newData.lote ||
      !newData.almacen
    ) {
      closeInsertModal(); // Cierra el modal antes de mostrar la alerta
      Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos",
        icon: "error",
      }).then(() => {
        openInsertModal(); // Vuelve a abrir el modal después de cerrar la alerta
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://66.232.105.87:3007/api/inventarios/inventarios/insertNuevaUbicacion",
        {
          ubi: newData.ubi,
          code_prod: newData.code_prod,
          cant_stock: parseInt(newData.cant_stock, 10),
          pasillo: newData.pasillo,
          lote: newData.lote,
          almacen: newData.almacen,
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Éxito",
          text: "La nueva ubicación se ha guardado correctamente",
          icon: "success",
        });
        closeInsertModal(); // Cierra el modal en caso de éxito
        setNewData({
          ubi: "",
          code_prod: "",
          cant_stock: "",
          pasillo: "",
          lote: "",
          almacen: "",
        });
      } else {
        closeInsertModal(); // Cierra el modal antes de mostrar la alerta
        Swal.fire({
          title: "Error",
          text: response.data.message,
          icon: "error",
        }).then(() => {
          openInsertModal(); // Vuelve a abrir el modal después de cerrar la alerta
        });
      }
    } catch (error) {
      console.error("Error al guardar la nueva ubicación:", error);
      closeInsertModal(); // Cierra el modal antes de mostrar la alerta
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        Swal.fire({
          title: "Error",
          text: error.response.data.message,
          icon: "error",
        }).then(() => {
          openInsertModal(); // Vuelve a abrir el modal después de cerrar la alerta
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al guardar la nueva ubicación",
          icon: "error",
        }).then(() => {
          openInsertModal(); // Vuelve a abrir el modal después de cerrar la alerta
        });
      }
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
        // Imprimir los datos que se enviarán
        console.log("🔄 Datos que se enviarán a la API:");
        console.log("ID de Ubicación:", selectedDato.id_ubi);
        console.log("Datos editados:", editedData);
        console.log("ID de Usuario:", user.id_usu); // Nuevo log

        // Realiza la solicitud PUT para actualizar los datos
        await axios.put(
          `http://66.232.105.87:3007/api/inventarios/inventarios/updatePeacking`,
          {
            id_ubi: selectedDato.id_ubi,
            ...editedData,
            user_id: user.id_usu,
          }
        );

        // Actualizar la tabla localmente
        const updatedData = paginatedData.map((dato) =>
          dato.id_ubi === selectedDato.id_ubi
            ? { ...dato, ...editedData }
            : dato
        );
        console.log("✅ Datos actualizados localmente:", updatedData);

        setPaginatedData(updatedData); // Actualiza los datos en la tabla

        // Muestra un mensaje de éxito
        MySwal.fire(
          "Actualizado",
          "Los datos han sido actualizados exitosamente.",
          "success"
        );
      } catch (error) {
        console.error("❌ Error al actualizar los datos:", error);

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
        "http://66.232.105.87:3007/api/inventarios/inventarios/borrar",
        {
          data: { id_ubi: id_ubi }, // Asegúrate de que estamos enviando el id_ubi
        }
      );

      if (response.data.success) {
        alert("Producto eliminado correctamente"); // Actualiza el estado eliminando el producto
      } else {
        alert("No se pudo eliminar el producto");
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Hubo un error al intentar eliminar el producto");
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
          "http://66.232.105.87:3007/api/inventarios/inventarios/AgregarNuevaUbi",
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
        "http://66.232.105.87:3007/api/inventarios/impares"
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
        "http://66.232.105.87:3007/api/inventarios/pares"
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
  const exportToExcel = () => {
    // Usar filteredData para exportar solo los datos visibles
    const dataToExport = filteredData.map((dato) => ({
      Ubicación: dato.ubi || "N/A",
      Descripción: dato.des || "N/A",
      "Código Producto": dato.code_prod || "N/A",
      "Cantidad Stock": dato.cant_stock || 0,
      Pasillo: dato.pasillo || "N/A",
      Lote: dato.lote || "N/A",
      Almacén: dato.almacen || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Picking");

    XLSX.writeFile(workbook, "Filtered_Picking.xlsx");
  };


  ////////SinUbicacion
useEffect(() => {
    fetchSinUbicacionData();
  }, []);

 const fetchSinUbicacionData = async () => {
    try {
      const response = await fetch("http://66.232.105.87:3007/api/inventarios/inventarios/sinubicacion");
      if (!response.ok) throw new Error("Error al obtener productos sin ubicación");
      const data = await response.json();

      const formatted = data.map((item, idx) => ({
        id: idx + 1,
        ...item,
      }));

      setSinUbicacionData(formatted);
    } catch (error) {
      console.error("Error al cargar productos sin ubicación:", error);
    }
  };

    const exportSinUbicacionToExcel = () => {
    if (!sinUbicacionData.length) return;

    const dataToExport = sinUbicacionData.map((item) => ({
      "Código Producto": item.codigo_pro,
      "Descripción": item.des,
      "Ubicación": item.ubi || "Sin ubicación",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SinUbicacion");
    XLSX.writeFile(workbook, "Productos_Sin_Ubicacion.xlsx");
  };

const sinUbiColumns = [
    {
      field: "imagen",
      headerName: "Imagen",
      width: 100,
      renderCell: (params) => (
        <img
          src={`../assets/image/img_pz/${params.row.codigo_pro}.jpg`}
          alt="Producto"
          style={{ width: 70, height: 70, objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "../assets/image/img_pz/noimage.png";
          }}
        />
      ),
    },
    { field: "codigo_pro", headerName: "Código Producto", width: 150 },
    { field: "des", headerName: "Descripción", width: 300 },
    {
      field: "ubi",
      headerName: "Ubicación",
      width: 150,
      renderCell: (params) => params.value || "Sin ubicación",
    },
  ];

  
  const columns = [
    { field: "des", headerName: "Descripción", width: 300 },
    { field: "ubi", headerName: "Ubicación", width: 200 },
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

    { field: "nivel", headerName: "Nivel", width: 160 },
    { field: "ingreso", headerName: "Ingreso", width: 160 },
    {
      field: "movimiento",
      headerName: "Movimiento",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {["Admin", "INV"].includes(user?.role) && (
            <IconButton
              onClick={() => handleOpenUpdateModal(params.row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 300,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <div>
            {["Admin", "INV"].includes(user?.role) && (
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
            )}
          </div>
        </Box>
      ),
    },
  ];

  const inventoryColumnsStatic = [
    { field: "ubi", headerName: "Ubicación", width: 140, flex: 1 },
    { field: "des", headerName: "Descripción", width: 280, flex: 2 },
    {
      field: "code_prod",
      headerName: "Código Producto",
      width: 160,
      flex: 1,
      renderCell: (params) => (params.row.cant_stock === 0 ? "" : params.value),
    },
    {
      field: "cant_stock",
      headerName: "Stock Actual",
      width: 140,
      flex: 1,
      renderCell: (params) => (params.value === 0 ? "" : params.value),
    },
    {
      field: "fecha_salida",
      headerName: "Última Salida",
      width: 180,
      flex: 1,
    },
   {
  field: "acciones",
  headerName: "Acciones",
  width: 160,
  renderCell: (params) => {
    return (["Admin", "INV", "Dep"].includes(user?.role) && (
      <Box display="flex" gap={1}>
        <IconButton onClick={() => handleOpenEditModal7066(params.row)}>
          <EditIcon color="primary" />
        </IconButton>
        <IconButton onClick={() => handleDeletePick7066(params.row.id_ubicacion)}>
          <DeleteIcon color="error" />
        </IconButton>
      </Box>
    )) || null; // Si no tiene permiso, no se renderiza nada
  }
}



  ];

  const handleSectionChange = (event, newValue) => {
    setSection(newValue);
  };

  // Renderizado de las secciones
  const renderSection = () => {
    switch (section) {
      case 0:
        return Almacenamiento("Almacenamiento");
      case 1:
        return Departamental("Departamental");
      case 2:
        return Picking("Picking");
      case 3:
        return SnUbi("Sin Ubicacion");
      default:
        return Almacenamiento();
    }
  };

 

  const Picking = (titulo) => (
    <div style={{ padding: "20px" }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4">{titulo}</Typography>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          {["Admin", "INV"].includes(user?.role) && (
            <Button
              onClick={openInsertModal}
              variant="contained"
              color="primary"
            >
              Insertar Producto
            </Button>
          )}
          <Button onClick={exportToExcel} variant="contained" color="secondary">
            Exportar Todo a Excel
          </Button>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imagen </TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Descripcón </TableCell>
                <TableCell>Código Producto</TableCell>
                <TableCell>Cantidad Stock</TableCell>
                {/* <TableCell sx={{ width: "5%" }}>Pasillo</TableCell>
                  <TableCell sx={{ width: "5%" }}>Lote</TableCell>
                  <TableCell sx={{ width: "5%" }}>Almacén</TableCell> */}
                <TableCell>Editar</TableCell>
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
                    // sx={{ width: "100%" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Descripción"
                    value={descripcionFilter}
                    onChange={(e) => setDecripcionFilter(e.target.value)}
                    // sx={{ width: "100%" }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Código"
                    value={codigoFilter}
                    onChange={(e) => setCodigoFilter(e.target.value)}
                    // sx={{ width: "100%" }}
                  />
                </TableCell>
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
                  <TableCell>{dato.cant_stock_real}</TableCell>
                  {/* <TableCell>{dato.pasillo}</TableCell>
                    <TableCell>{dato.lote || "N/A"}</TableCell>
                    <TableCell>{dato.almacen || "N/A"}</TableCell> */}
                  <TableCell>
                    {["Admin", "INV"].includes(user?.role) && (
                      <>
                        <IconButton onClick={() => handleOpenEditModal(dato)}>
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeletePick(dato.id_ubi)}
                          color="error"
                          sx={{ marginLeft: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
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
          <Button onClick={handleGuardarNuevaUbipICK} color="primary">
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
      <Box sx={{ height: "100%", width: "auto", padding: 2 }}>
        {/* Botón para abrir el modal */}
        <center>
        <Typography variant="h6">Inventario 7050</Typography></center>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "center", mb: 2 }}>
  {["Admin", "INV"].includes(user?.role) && (

  <Button
    variant="contained"
    onClick={handleOpenModalInsertUbi}
    sx={{ backgroundColor: "green", color: "white" }}
  >
    Insertar Nueva Ubicación
  </Button>
)}
  <Button
    onClick={exportUbi7050ToExcel}
    variant="contained"
    sx={{ backgroundColor: "green", color: "white" }}
  >
    Exportar 7050 a Excel
  </Button>

  <Button variant="contained" color="error" onClick={fetchImpares}>
    Mostrar Impares
  </Button>

  <Button variant="contained" sx={{ backgroundColor: "#d46a6a", color: "white" }} onClick={fetchPares}>
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
                          label="Ubicación"
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
                handleUpdate();
              }}
            >
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>

        {error && <Alert severity="error">{error}</Alert>}

       

        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Descripción"
            variant="outlined"
            size="small"
            sx={{ width: "auto" }}
          />
          <TextField
            label="Ubicación"
            variant="outlined"
            size="small"
            value={ubicacionFilter}
            onChange={(e) => setUbicacionFilter(e.target.value)}
            sx={{ width: "180px " }}
          />

          <TextField
            label="Código Producto"
            variant="outlined"
            size="small"
            value={codigoFilter}
            onChange={(e) => setCodigoFilter(e.target.value)}
            sx={{ width: "150px" }}
          />

          <TextField
            label="Nivel"
            type="number"
            variant="outlined"
            size="small"
            value={nivelFilter}
            onChange={(e) => setNivelFilter(e.target.value)}
            marginLeft="200px"
          />
        </Box>

        <DataGrid
          rows={insumos} // Ahora renderiza la lista filtrada
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[5, 10, 20]}
          loading={loading}
          pagination
          paginationMode="client"
          getRowId={(row) => row.id}
          style={{ height: 800, width: "auto" }}
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

  const Departamental = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Departamental 7066
      </Typography>
         {["Admin", "INV", "Dep"].includes(user?.role) && (
  <Box display="flex" gap={2} mb={2}>
    <Button
      variant="contained"
      color="primary"
      onClick={() => setOpenCreateModal(true)}
    >
      Crear Nueva Ubicación
    </Button>

    <Button
      variant="contained"
      color="success"
      onClick={exportDepartamentalToExcel}
    >
      Exportar a Excel
    </Button>
  </Box>
)}


      <Paper elevation={3} sx={{ p: 2 }}>
        <Box
          sx={{
            height: 450,
            width: "100%",
            overflowX: "auto", // permite scroll horizontal si es necesario
          }}
        >
          <DataGrid
            rows={pickDep}
            columns={inventoryColumnsStatic}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            disableColumnMenu
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
                fontSize: "0.9rem",
              },
              "& .MuiDataGrid-row": {
                fontSize: "0.85rem",
              },
              "& .stock-cero": {
                backgroundColor: "#ffe6e6",
              },
              "& .stock-vacio": {
                backgroundColor: "#f9f9f9",
              },
            }}
            getRowClassName={(params) => {
              if (params.row.cant_stock === 0) return "stock-cero";
              if (!params.row.cant_stock) return "stock-vacio";
              return "";
            }}
          />

          
<Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
  <DialogTitle>Crear Nueva Ubicación Departamental</DialogTitle>
  <DialogContent>
    {[
      "ubi", "code_prod", "cant_stock", 
      "pasillo", "codigo_salida"
    ].map((field) => (
      <TextField
        key={field}
        name={field}
        label={field.replaceAll("_", " ").toUpperCase()}
        value={newPickData[field]}
        onChange={handleInputChangeCreate}
        fullWidth
        margin="dense"
      />
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenCreateModal(false)}>Cancelar</Button>
    <Button onClick={handleCreateUbicacionDepartamental} color="primary">
      Guardar
    </Button>
  </DialogActions>
</Dialog>


<Dialog open={editModalOpen7066} onClose={() => setEditModalOpen7066(false)}>
  <DialogTitle>Editar Ubicación</DialogTitle>
  <DialogContent>
    {["ubi", "code_prod", "cant_stock", "pasillo", "codigo_salida"].map((field) => (
      <TextField
        key={field}
        name={field}
        label={field.replaceAll("_", " ").toUpperCase()}
        value={editData[field]}
        onChange={handleEditChange7066}
        fullWidth
        margin="dense"
      />
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditModalOpen7066(false)}>Cancelar</Button>
    <Button onClick={handleEditPick7066} color="primary">
      Guardar Cambios
    </Button>
  </DialogActions>
</Dialog>

        </Box>
      </Paper>
    </Box>
  );

  const SnUbi = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Sin Ubicación
      </Typography>
       <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={exportSinUbicacionToExcel}
        >
          Exportar a Excel
        </Button>
      </Box>
      <Paper>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={sinUbicacionData}
            columns={sinUbiColumns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
            sx={{ fontSize: "0.9rem" }}
          />
        </Box>
      </Paper>
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
        <Tab label="Almacenamiento" icon={<Dashboard />} />
        <Tab label="Departamental" icon={<Dashboard />} />
        <Tab label="Picking" icon={<Dashboard />} />
      {['Admin', 'INV'].includes(user?.role) && (
  <Tab label="Codigos Sin Ubicacion" icon={<Dashboard />} />
)}
      </Tabs>

      {/* Contenido según la sección seleccionada */}
      <main style={{ padding: "20px" }}>{renderSection()}</main>
    </div>
  );
}

export default InventarioAdmin;

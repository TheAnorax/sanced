import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Divider,
  Button,
  Modal,
  Grid,
  TablePagination,
  LinearProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { UserContext } from "../context/UserContext";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import Backdrop from "@mui/material/Backdrop";

import CircularProgress from "@mui/material/CircularProgress";

dayjs.extend(localizedFormat);
dayjs.locale("es");
dayjs.extend(isSameOrAfter);

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function Compras() {
  const [loading, setLoading] = useState(false); // Estado para el loader
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [recepcionDate, setRecepcionDate] = useState(dayjs());
  const [oc, setOc] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [contenedor, setContenedor] = useState("");
  const [naviera, setNaviera] = useState("");
  const [pedimento, setPedimento] = useState("");
  const [errors, setErrors] = useState({});
  const [tipo, setTipo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { user } = useContext(UserContext);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [detalleData, setDetalleData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState({
    cartaPorte: null,
    packingList: null,
    pedimento: null,
    factura: null,
    ordenCompra: null,
  });
  const [searchInputs, setSearchInputs] = useState({
    oc: "",
    codigo: "",
    cant_recibir: "",
    contenedor: "",
    pedimento: "",
  });

  const [page, setPage] = useState(0); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(25); // Filas por página

  const [openModalCantidad, setOpenModalCantidad] = useState(false);
  const [cantidadRecibir, setCantidadRecibir] = useState(0);
  const [cantidad1, setCantidad1] = useState(0);
  const [cantidad2, setCantidad2] = useState(0);
  const [almacen1, setAlmacen1] = useState("");
  const [almacen2, setAlmacen2] = useState("");

  const handleOpenModalCantidad = (compra) => {
    setCantidadRecibir(compra.cant_recibir);
    setCantidad1(compra.cant_recibir); // La cantidad completa en el almacén 1
    setCantidad2(0); // Inicialmente 0 en el almacén 2
    setAlmacen1("7050"); // Almacén 1 predefinido
    setAlmacen2("7066"); // Almacén 2 predefinido
    setSelectedProduct(compra); // Asegúrate de que estás asignando la compra seleccionada
    setOpenModalCantidad(true); // Abre el modal
  };

  // Cerrar modal
  const handleCloseModalCantidad = () => {
    setOpenModalCantidad(false);
  };

  // Calcular la cantidad restante
  const handleCantidad1Change = (e) => {
    const value = parseInt(e.target.value) || 0; // Convertir a número
    if (value <= cantidadRecibir) {
      setCantidad1(value);
      setCantidad2(cantidadRecibir - value); // Calcular la cantidad restante
    } else {
      setCantidad1(cantidadRecibir); // No permitir un valor mayor al total
      setCantidad2(0); // Si excede, poner la cantidad restante en 0
    }
  };
  const handleCancelarRecibo = async (id_recibo) => {
    try {
      // Mostrar el diálogo de confirmación
      const result = await Swal.fire({
        title: "¿Deseas cancelar este código?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        // Si se confirma, actualizar el estado en la base de datos
        const response = await axios.put(
          `http://localhost:3007/api/compras/compras/cancelar/${id_recibo}`, // URL corregida
          { estado: "Cancelado" } // Parámetro enviado para actualizar el estado
        );

        if (response.status === 200) {
          Swal.fire(
            "Cancelado",
            "El código ha sido cancelado exitosamente.",
            "success"
          );
          // Refrescar la lista de compras
          await fetchCompras2();
        } else {
          Swal.fire("Error", "Hubo un problema al cancelar el código", "error");
        }
      }
    } catch (error) {
      console.error("Error al cancelar el recibo:", error);
      Swal.fire("Error", "Hubo un problema al cancelar el código", "error");
    }
  };

  const handleGuardarCantidad = async () => {
    if (!selectedProduct || !selectedProduct.id_recibo) {
      Swal.fire(
        "Error",
        "No se seleccionó ningún recibo o el recibo no tiene ID.",
        "error"
      );
      return;
    }

    try {
      // Cerrar el modal antes de mostrar la confirmación
      setOpenModalCantidad(false);

      // Mostrar una única confirmación
      const result = await Swal.fire({
        title: "Confirmar Distribución",
        html: `
          <p>Almacén 7050: ${cantidad1} unidades</p>
          <p>Almacén 7066: ${cantidad2} unidades</p>
          <p>¿Estás seguro de que deseas realizar la distribución en estos almacenes?</p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, realizar cambios",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        // Realizar la llamada a la API para actualizar los datos en la base de datos
        const response = await axios.put(
          `http://localhost:3007/api/compras/compras/recibo/${selectedProduct.id_recibo}`,
          {
            almacen7050: almacen1, // Almacén 7050
            almacen7066: almacen2, // Almacén 7066
            cantidad7050: cantidad1, // Cantidad para el almacén 7050
            cantidad7066: cantidad2, // Cantidad para el almacén 7066
          }
        );

        if (response.status === 200) {
          Swal.fire(
            "Éxito",
            "Cantidad y almacenes actualizados correctamente",
            "success"
          );
          await fetchCompras2(); // Refrescar la lista después de guardar
        } else {
          Swal.fire(
            "Error",
            "Hubo un problema al actualizar los datos",
            "error"
          );
        }
      } else {
        // Reabrir el modal si se cancela
        setOpenModalCantidad(true);
      }
    } catch (error) {
      console.error("Error al guardar las cantidades y almacenes:", error);
      Swal.fire("Error", "Hubo un problema al guardar los datos", "error");
      setOpenModalCantidad(true);
    }
  };

  const handleAssignToAlmacen7050 = async (compra) => {
    if (!compra || !compra.id_recibo) {
      Swal.fire(
        "Error",
        "No se seleccionó ningún recibo o el recibo no tiene ID.",
        "error"
      );
      return;
    }

    try {
      // Confirmación antes de realizar la asignación
      const result = await Swal.fire({
        title: "Confirmar Asignación Automática",
        text: `¿Estás seguro de que deseas asignar todas las ${compra.cant_recibir} unidades al almacén 7050?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, asignar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        // Realizar la asignación automática de todas las unidades al almacén 7050
        const response = await axios.put(
          `http://localhost:3007/api/compras/compras/recibo/${compra.id_recibo}`,
          {
            almacen7050: "7050", // Almacén 7050
            almacen7066: "7066", // Almacén 7066 predefinido (puede ser opcional)
            cantidad7050: compra.cant_recibir, // Toda la cantidad al almacén 7050
            cantidad7066: 0, // Ninguna cantidad al almacén 7066
          }
        );

        if (response.status === 200) {
          Swal.fire(
            "Éxito",
            "Cantidad asignada correctamente al almacén 7050",
            "success"
          );
          await fetchCompras2(); // Refrescar la lista después de guardar
        } else {
          Swal.fire(
            "Error",
            "Hubo un problema al actualizar los datos",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Error al asignar al almacén 7050:", error);
      Swal.fire("Error", "Hubo un problema al asignar la cantidad", "error");
    }
  };

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);

    const foundProduct = productos.find(
      (producto) => producto.codigo_pro === searchValue
    );
    setSelectedProduct(foundProduct || null);
  };

  const handleSearchChange2 = (e, field) => {
    setSearchInputs({
      ...searchInputs,
      [field]: e.target.value,
    });
  };

  const filteredComprasByDate = selectedDate
    ? compras.filter((compra) => {
        const arriboDate = dayjs(compra.arribo); // Convierte arribo a un objeto dayjs
        return arriboDate.isValid() && arriboDate.isSameOrAfter(selectedDate);
      })
    : compras; // Si no hay fecha seleccionada, mostrar todas las compras
  // Filtrado de compras según los inputs de búsqueda
  const filteredCompras = filteredComprasByDate.filter((compra) =>
    Object.keys(searchInputs).every((key) =>
      compra[key]
        ?.toString()
        .toLowerCase()
        .includes(searchInputs[key].toLowerCase())
    )
  );

  // Aplicar paginación a los datos filtrados
  const paginatedCompras = filteredCompras.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Cambiar de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Cambiar la cantidad de filas mostradas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reiniciar a la primera página
  };

  useEffect(() => {
    if (user?.role === "Imp") {
      setTipo("Importaciones");
    } else if (user?.role === "Nac") {
      setTipo("Nacionales");
    } else if (user?.role === "Ins") {
      setTipo("Insumos");
    } else if (user?.role === "Admin") {
      setTipo("Importaciones");
    } else if (user?.role === "Recibo") {
      setTipo("Importaciones");
    } else if (user?.role === "Plan") {
      setTipo("Importaciones");
    } else if (user?.role === "Nac2") {
      setTipo("Importaciones");
    }
  }, [user]);

  const fetchCompras2 = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3007/api/compras/compras?tipo=${tipo}`
      );

      setCompras(response.data);
    } catch (error) {
      console.error(
        "Error fetching compras:",
        error.response ? error.response.data : error.message
      );
      Swal.fire(
        "Error",
        `Hubo un problema al obtener las compras: ${
          error.response ? error.response.data.message : error.message
        }`,
        "error"
      );
    }
  };

  useEffect(() => {
    if (tipo) {
      // Verificar que tipo no sea vacío
      const fetchCompras = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3007/api/compras/compras?tipo=${tipo}`
          );

          setCompras(response.data);
        } catch (error) {
          console.error(
            "Error fetching compras:",
            error.response ? error.response.data : error.message
          );
          Swal.fire(
            "Error",
            `Hubo un problema al obtener las compras: ${
              error.response ? error.response.data.message : error.message
            }`,
            "error"
          );
        }
      };
      const fetchProductos = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3007/api/productos"
          );
          setProductos(response.data);
        } catch (error) {
          console.error("Error fetching productos:", error);
        }
      };

      fetchCompras();
      fetchProductos();
    }
  }, [tipo]);

  // Función para manejar la carga de archivos Excel
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const userId = user?.id_usu;

      let errors = [];
      const formattedData = jsonData
        .slice(1)
        .map((row, index) => {
          const codigo = row[2];
          const oc = row[1];
          const cant_recibir = row[4];
          const tipoP = tipo;
          const referencia = row[0];
          const unidad_medida = row[5];
          const contenedor = row[8];
          const naviera = row[9];
          const pedimento = row[10];
          const sucursal = row[11]; // Nuevo campo sucursal
          const factura = row[12]; // Nuevo campo factura
          let arribo = row[7];
          const usuario = userId;

          // Validación de cada fila
          if (!codigo || !oc || !cant_recibir || !arribo) {
            errors.push(`Fila ${index + 2} contiene datos incompletos.`);
            return null; // Ignora esta fila
          }

          // Convierte fechas de Excel a formato legible (YYYY-MM-DD)
          if (typeof arribo === "number") {
            const dateObj = XLSX.SSF.parse_date_code(arribo);
            arribo = `${dateObj.y}-${dateObj.m}-${dateObj.d}`;
          }

          return {
            codigo,
            oc,
            cant_recibir,
            tipoP,
            referencia,
            unidad_medida,
            contenedor,
            naviera,
            pedimento,
            arribo,
            usuario,
            sucursal,
            factura, // Nuevos campos
          };
        })
        .filter(Boolean);

      if (errors.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Errores en la carga del archivo",
          html: `Se encontraron errores en las siguientes filas:<br>${errors.join(
            "<br>"
          )}`,
          confirmButtonText: "Entendido",
        });
        return;
      }

      if (formattedData.length === 0) {
        Swal.fire("Error", "El archivo no contiene datos válidos", "error");
        return;
      }

      // Función para dividir los datos en lotes
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < formattedData.length; i += batchSize) {
        const batch = formattedData.slice(i, i + batchSize);
        batches.push(batch);
      }

      try {
        // Enviar cada lote por separado
        for (const batch of batches) {
          await axios.post(
            "http://localhost:3007/api/compras/compras/upload-excel",
            batch
          );
        }
        Swal.fire("Éxito", "Datos cargados exitosamente", "success");

        // Refrescar la tabla de compras después de la carga
        const response = await axios.get(
          `http://localhost:3007/api/compras/compras?tipo=${tipo}`
        );
        setCompras(response.data);
      } catch (error) {
        Swal.fire(
          "Error",
          `Hubo un problema al cargar los datos: ${error.message}`,
          "error"
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // PDF
  // Abrir modal de carga de archivos
  const handleOpenUploadModal = (compra) => {
    setDetalleData(compra); // Guardar el recibo seleccionado
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
    setSelectedFiles({
      cartaPorte: null,
      packingList: null,
      pedimento: null,
      referencia: null,
      ordenCompra: null,
    });
  };

  const handleFilesChange = (event, fieldName, isMultiple = false) => {
    const files = event.target.files;

    if (isMultiple) {
      // Verifica que todos los archivos sean PDFs
      const validFiles = Array.from(files).filter(
        (file) => file.type === "application/pdf"
      );

      if (validFiles.length !== files.length) {
        Swal.fire("Error", "Solo se permiten archivos PDF.", "error");
        return;
      }

      // Almacenar todos los archivos seleccionados en un array
      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [fieldName]: validFiles,
      }));
    } else {
      const file = files[0];
      if (file && file.type !== "application/pdf") {
        Swal.fire("Error", "Solo se permiten archivos PDF.", "error");
      } else {
        setSelectedFiles((prevFiles) => ({
          ...prevFiles,
          [fieldName]: file,
        }));
      }
    }
  };

  const handleFilesChangeMasibe = (event) => {
    const files = event.target.files;
    if (files.length > 30) {
      Swal.fire(
        "Error",
        "Solo puedes subir un máximo de 30 archivos.",
        "error"
      );
      return;
    }
    // Almacena los archivos seleccionados
    setSelectedFiles(files);
  };

  // Función para manejar la subida de archivos
  // const handleFilesUploadMasibe = async () => {
  //   if (selectedFiles.length === 0) {
  //     Swal.fire("Error", "No has seleccionado ningún archivo.", "error");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('ordenCompra', oc);  // Agregar la Orden de Compra al FormData
  //   Array.from(selectedFiles).forEach((file, index) => {
  //     formData.append(`pdf_${index + 1}`, file);
  //   });

  //   setLoading(true);
  //   try {
  //     await axios.post(
  //       "http://localhost:3007/api/compras/compras/upload-pdfsOC",
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //         onUploadProgress: (progressEvent) => {
  //           const total = progressEvent.total;
  //           const current = progressEvent.loaded;
  //           const percentage = Math.round((current * 100) / total);
  //           setUploadProgress(percentage);
  //           console.log("Upgrade", percentage);
  //         },
  //       }
  //     );
  //     Swal.fire("Éxito", "Archivos subidos correctamente", "success");
  //   } catch (error) {
  //     Swal.fire("Error", "Hubo un problema al subir los archivos.", "error");
  //   } finally {
  //     setLoading(false);
  //     setUploadProgress(0);
  //   }
  // };

  const handleFilesUpload = async () => {
    const formData = new FormData();

    // Agregar archivos PDF al formData
    if (selectedFiles.cartaPorte)
      formData.append("pdf_1", selectedFiles.cartaPorte);
    if (selectedFiles.packingList && Array.isArray(selectedFiles.packingList)) {
      selectedFiles.packingList.forEach((file) => {
        formData.append("pdf_2", file);
      });
    } else if (selectedFiles.packingList) {
      formData.append("pdf_2", selectedFiles.packingList);
    }
    if (selectedFiles.pedimento)
      formData.append("pdf_3", selectedFiles.pedimento);
    if (selectedFiles.referencia && Array.isArray(selectedFiles.referencia)) {
      selectedFiles.referencia.forEach((file) => {
        formData.append("pdf_4", file);
      });
    } else if (selectedFiles.referencia) {
      formData.append("pdf_4", selectedFiles.referencia);
    }
    if (selectedFiles.ordenCompra)
      formData.append("pdf_5", selectedFiles.ordenCompra);

    if (
      !selectedFiles.cartaPorte &&
      !selectedFiles.packingList &&
      !selectedFiles.pedimento &&
      !selectedFiles.referencia &&
      !selectedFiles.ordenCompra
    ) {
      Swal.fire("Error", "Debes subir al menos un archivo.", "error");
      return;
    }

    // Agregar datos adicionales al formData
    formData.append("id_recibo", detalleData.id_recibo);
    formData.append("pedimento", detalleData.pedimento || "");
    formData.append("referencia", detalleData.referencia || "");
    formData.append("ordenCompra", detalleData.oc || "");

    setLoading(true); // Mostrar el loader
    setOpenUploadModal(false); // Cerrar temporalmente el modal

    try {
      const response = await axios.post(
        "http://localhost:3007/api/compras/compras/upload-pdfs",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total;
            const current = progressEvent.loaded;
            const percentage = Math.round((current * 100) / total);
            setUploadProgress(percentage); // Actualizar el progreso de la subida
          },
        }
      );

      const successMessages = [
        "Recibo actualizado exitosamente",
        "Recibo agregado exitosamente desde recibo_compras",
        "Documentos procesados correctamente para los productos con el mismo pedimento y Packing list",
      ];

      if (successMessages.includes(response.data.message)) {
        Swal.fire("Éxito", "Archivos subidos con éxito.", "success");
        handleCloseUploadModal();
        await fetchCompras2();
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Error al subir los archivos.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al subir archivos:", error);

      // Manejo de errores detallado
      if (error.response) {
        // Errores del servidor
        Swal.fire(
          "Error",
          `El servidor respondió con un error: ${error.response.status} - ${error.response.data.message}`,
          "error"
        );
      } else if (error.request) {
        // Errores de red o conexión
        Swal.fire(
          "Error",
          "No se pudo conectar con el servidor. Verifica tu conexión a la red.",
          "error"
        );
      } else {
        // Otros errores
        Swal.fire("Error", "Hubo un problema al subir los archivos.", "error");
      }
    } finally {
      setLoading(false); // Detener el loader después de la operación
      setUploadProgress(0); // Reiniciar el progreso
    }
  };

  // Resto del código sigue igual...

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setOc(product.oc);
    setCantidad(product.cant_recibir);
    setReferencia(product.referencia);
    setUnidadMedida(product.unidad_medida);
    setContenedor(product.contenedor);
    setNaviera(product.naviera);
    setPedimento(product.pedimento);
    setRecepcionDate(dayjs(product.arribo));
    setTipo(product.tipo);
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleOpenModal = () => {
    if (!isEditing) {
      setOc("");
      setCantidad("");
      setReferencia("");
      setUnidadMedida("");
      setContenedor("");
      setNaviera("");
      setPedimento("");
      setRecepcionDate(dayjs());
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const validateFields = () => {
    const newErrors = {};
    if (!oc) newErrors.oc = "Este campo es requerido";
    if (!cantidad) newErrors.cantidad = "Este campo es requerido";
    if (!recepcionDate) newErrors.recepcion = "Este campo es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      const recepcionFormatted = recepcionDate.format("YYYY-MM-DD");
      handleCloseModal();

      const result = await Swal.fire({
        title: isEditing ? "Confirmar Edición" : "Confirmar Recepción",
        html: `
          <img src="../assets/image/img_pz/${
            selectedProduct.codigo_pro
          }.jpg" alt="Producto" style="width: 150px; height: 150px; margin-bottom: 10px;" /> 
          <p><strong>Código:</strong> ${selectedProduct.codigo_pro}</p>
          <p><strong>Cantidad a ${
            isEditing ? "Editar" : "Recibir"
          }:</strong> ${cantidad}</p>
          <p><strong>O.C:</strong> ${oc}</p>
          <p><strong>Fecha de Recepción:</strong> ${recepcionFormatted}</p>
          <p><strong>Tipo:</strong> ${tipo}</p>
        `,
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        if (isEditing) {
          await axios.put(
            `http://localhost:3007/api/compras/recibo/${selectedProduct.id_recibo}`,
            {
              oc,
              cantidad,
              recepcion: recepcionFormatted,
              codigo: selectedProduct.codigo_pro,
              tipo,
              referencia,
              unidad_medida: unidadMedida,
              contenedor,
              naviera,
              pedimento,
            }
          );
          Swal.fire(
            "Editado",
            "El recibo ha sido editado exitosamente",
            "success"
          );
        } else {
          const userId = user?.id_usu;
          await axios.post("http://localhost:3007/api/compras/recibo", {
            oc,
            cantidad,
            recepcion: recepcionFormatted,
            codigo: selectedProduct.codigo_pro,
            tipo,
            referencia,
            unidad_medida: unidadMedida,
            contenedor,
            naviera,
            pedimento,
            usuario: userId,
          });
          Swal.fire(
            "Guardado",
            "El recibo ha sido agregado exitosamente",
            "success"
          );
        }

        const response = await axios.get(
          `http://localhost:3007/api/compras/compras?tipo=${tipo}`
        );
        setCompras(response.data);

        setSearchTerm("");
        setSelectedProduct(null);
        setOc("");
        setCantidad("");
        setReferencia("");
        setUnidadMedida("");
        setContenedor("");
        setNaviera("");
        setPedimento("");
        setRecepcionDate(dayjs());
        setIsEditing(false);
      } else {
        setOpenModal(true);
      }
    } catch (error) {
      console.error("Error al guardar el recibo:", error);
      Swal.fire("Error", "Hubo un problema al guardar el recibo", "error");
      setOpenModal(true);
    }
  };
  const renderButtonsByRole = () => {
    if (user?.role === "Imp") {
      return (
        <Button
          variant={tipo === "Importaciones" ? "contained" : "outlined"}
          onClick={() => setTipo("Importaciones")}
        >
          Importaciones
        </Button>
      );
    } else if (user?.role === "Nac") {
      return (
        <Button
          variant={tipo === "Nacionales" ? "contained" : "outlined"}
          onClick={() => setTipo("Nacionales")}
        >
          Nacionales
        </Button>
      );
    } else if (user?.role === "Ins") {
      return (
        <Button
          variant={tipo === "Insumos" ? "contained" : "outlined"}
          onClick={() => setTipo("Insumos")}
        >
          Insumos
        </Button>
      );
    } else if (user?.role === "Admin") {
      return (
        <>
          <Button
            variant={tipo === "Importaciones" ? "contained" : "outlined"}
            onClick={() => setTipo("Importaciones")}
          >
            Importaciones
          </Button>
          <Button
            variant={tipo === "Nacionales" ? "contained" : "outlined"}
            onClick={() => setTipo("Nacionales")}
          >
            Nacionales
          </Button>
          <Button
            variant={tipo === "Insumos" ? "contained" : "outlined"}
            onClick={() => setTipo("Insumos")}
          >
            Insumos
          </Button>
        </>
      );
    } else if (user?.role === "Recibo") {
      return (
        <>
          <Button
            variant={tipo === "Importaciones" ? "contained" : "outlined"}
            onClick={() => setTipo("Importaciones")}
          >
            Importaciones
          </Button>
          <Button
            variant={tipo === "Nacionales" ? "contained" : "outlined"}
            onClick={() => setTipo("Nacionales")}
          >
            Nacionales
          </Button>
          <Button
            variant={tipo === "Insumos" ? "contained" : "outlined"}
            onClick={() => setTipo("Insumos")}
          >
            Insumos
          </Button>
        </>
      );
    } else if (user?.role === "Plan") {
      return (
        <>
          <Button
            variant={tipo === "Importaciones" ? "contained" : "outlined"}
            onClick={() => setTipo("Importaciones")}
          >
            Importaciones
          </Button>
          <Button
            variant={tipo === "Nacionales" ? "contained" : "outlined"}
            onClick={() => setTipo("Nacionales")}
          >
            Nacionales
          </Button>
          <Button
            variant={tipo === "Insumos" ? "contained" : "outlined"}
            onClick={() => setTipo("Insumos")}
          >
            Insumos
          </Button>
        </>
      );
    } else if (user?.role === "Nac2") {
      return (
        <>
          <Button
            variant={tipo === "Importaciones" ? "contained" : "outlined"}
            onClick={() => setTipo("Importaciones")}
          >
            Importaciones
          </Button>
          <Button
            variant={tipo === "Nacionales" ? "contained" : "outlined"}
            onClick={() => setTipo("Nacionales")}
          >
            Nacionales
          </Button>
          <Button
            variant={tipo === "Insumos" ? "contained" : "outlined"}
            onClick={() => setTipo("Insumos")}
          >
            Insumos
          </Button>
        </>
      );
    }
    return null;
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate ? dayjs(newDate) : null);
    console.log(
      "Fecha seleccionada (dayjs):",
      newDate ? dayjs(newDate).format() : "Ninguna"
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Compras -{" "}
          {user?.role === "Imp"
            ? "Importaciones"
            : user?.role === "Nac"
            ? "Nacionales"
            : user?.role === "Ins"
            ? "Insumos"
            : user?.role === "Admin"
            ? "Importaciones"
            : user?.role === "Recibo"
            ? "Recibo"
            : user?.role === "Plan"
            ? "Ingreso de Almacenes"
            : user?.role === "Nac2"
            ? "Llegadas Cedis"
            : ""}
        </Typography>

        <Box>
          {/* <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
        Subir PDFs (Máximo 30)
        <VisuallyHiddenInput
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFilesChangeMasibe}
        />
      </Button> */}

          {/* {selectedFiles.length > 0 && (
        <Typography sx={{ mt: 2 }}>
          {selectedFiles.length} archivos seleccionados
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleFilesUploadMasibe}
        startIcon={<UploadFileIcon />}
        disabled={selectedFiles.length === 0}
      >
        Subir Archivos
      </Button>

      <Backdrop open={loading}>
        {uploadProgress === 0 ? (
          <CircularProgress color="inherit" />
        ) : (
          <Box sx={{ width: '80%', textAlign: 'center' }}>
            <Typography variant="h6">Subiendo archivos: {uploadProgress}%</Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Backdrop> */}
        </Box>
        <Button variant="contained" component="label">
          Cargar Excel
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        {renderButtonsByRole()}
      </Box>

      <TextField
        label="Buscar por código"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        sx={{ mb: 3 }}
      />

      {selectedProduct && (
        <Box
          sx={{
            mb: 3,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: 1, mr: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {selectedProduct.des}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Código: {selectedProduct.codigo_pro}
            </Typography>
          </Box>

          <Box sx={{ flex: "0 0 auto", mr: 3 }}>
            <img
              src={`../assets/image/img_pz/${selectedProduct.codigo_pro}.jpg`}
              alt="Producto"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          </Box>

          <Box sx={{ flex: "0 0 auto" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenModal}
              sx={{ fontWeight: "bold" }}
            >
              Agregar
            </Button>
          </Box>
        </Box>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            {selectedProduct?.des || "Detalles del producto"}
          </Typography>

          {selectedProduct && (
            <>
              <img
                src={`../assets/image/img_pz/${selectedProduct.codigo_pro}.jpg`}
                alt="Producto"
                style={{
                  width: "200px",
                  height: "200px",
                  marginBottom: "20px",
                }}
              />
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Referencia"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={user?.role === "Recibo"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Unidad de Medida"
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={user?.role === "Recibo"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Contenedor"
                    value={contenedor}
                    onChange={(e) => setContenedor(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={user?.role === "Recibo"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Naviera"
                    value={naviera}
                    onChange={(e) => setNaviera(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={user?.role === "Recibo"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Pedimento"
                    value={pedimento}
                    onChange={(e) => setPedimento(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={user?.role === "Recibo"}
                  />
                </Grid>
              </Grid>
            </>
          )}

          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Alta Manual de Datos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="O.C *"
                fullWidth
                variant="outlined"
                disabled={user?.role === "Recibo"}
                value={oc}
                onChange={(e) => setOc(e.target.value)}
                error={!!errors.oc}
                helperText={errors.oc}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Cantidad a Recibir *"
                fullWidth
                variant="outlined"
                disabled={user?.role === "Recibo"}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                error={!!errors.cantidad}
                helperText={errors.cantidad}
              />
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es"
              >
                <DatePicker
                  label="Arribo *"
                  value={recepcionDate}
                  onChange={(newValue) => setRecepcionDate(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.recepcion}
                      helperText={errors.recepcion}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Cantidad a Recibir</TableCell>
              <TableCell>Arribo</TableCell>
              <TableCell>O.C</TableCell>
              <TableCell>Contenedor</TableCell>
              <TableCell>Pedimento</TableCell>
              {user?.role !== "Plan" && (
                <>
                  <TableCell>Factura</TableCell>
                  <TableCell>Archivos Cargados</TableCell>
                </>
              )}
              {user?.role === "Plan" && (
                <>
                  <TableCell>Tarima </TableCell>
                  <TableCell>Master </TableCell>
                </>
              )}

              <TableCell>Acciones</TableCell>
              <TableCell>Documentos </TableCell>
              <TableCell>Cancelar Partida </TableCell>
            </TableRow>
            <TableRow>
              <TableCell />

              <TableCell></TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar Código"
                  value={searchInputs.codigo}
                  onChange={(e) => handleSearchChange2(e, "codigo")}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar Cantidad"
                  value={searchInputs.cant_recibir}
                  onChange={(e) => handleSearchChange2(e, "cant_recibir")}
                />
              </TableCell>
              {/* Calendario para seleccionar fecha de arribo */}
              <TableCell>
                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Fecha de Arribo"
                    value={selectedDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField {...params} size="small" variant="outlined" />
                    )}
                  />
                </LocalizationProvider> */}
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DatePicker
                    label="Arribo *"
                    value={selectedDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField {...params} size="small" variant="outlined" />
                    )}
                  />
                </LocalizationProvider>
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar O.C"
                  value={searchInputs.oc}
                  onChange={(e) => handleSearchChange2(e, "oc")}
                />
              </TableCell>

              <TableCell>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar Contenedor"
                  value={searchInputs.contenedor}
                  onChange={(e) => handleSearchChange2(e, "contenedor")}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar Pedimento"
                  value={searchInputs.pedimento}
                  onChange={(e) => handleSearchChange2(e, "pedimento")}
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCompras.map((compra, index) => {
              const archivosCargados = [
                "pdf_1",
                "pdf_2",
                "pdf_3",
                "pdf_4",
                "pdf_5",
              ].filter((key) => compra[key]).length;

              return (
                <TableRow key={index}>
                  {/* Otras celdas */}
                  <TableCell>
                    <img
                      src={`../assets/image/img_pz/${compra.codigo}.jpg`}
                      alt="Producto"
                      style={{ width: "80px", height: "80px" }}
                    />
                  </TableCell>
                  <TableCell>{compra.des}</TableCell>
                  <TableCell>{compra.codigo}</TableCell>
                  <TableCell>{compra.cant_recibir}</TableCell>
                  <TableCell>
                    {dayjs.utc(compra.arribo).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>{compra.oc}</TableCell>
                  <TableCell>{compra.contenedor}</TableCell>
                  <TableCell>{compra.pedimento}</TableCell>
                  <TableCell>{compra.referencia}</TableCell>
                  {user?.role !== "Plan" && (
                    <>
                      <TableCell>{archivosCargados} / 5</TableCell>
                    </>
                  )}
                  {user?.role === "Plan" && (
                    <>
                      <TableCell>{compra._palet}PZ.</TableCell>
                      <TableCell>{compra._master}PZ.</TableCell>
                    </>
                  )}

                  {user?.role !== "Plan" && user?.role !== "Recibo" && (
                    <>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditProduct(compra)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() => handleOpenUploadModal(compra)}
                        >
                          {user?.role !== "Recibo"
                            ? "Subir Documentos"
                            : "Ver Documentos"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleCancelarRecibo(compra.id_recibo)}
                        >
                          Cancelar
                        </Button>
                      </TableCell>
                    </>
                  )}

                  {(user?.role === "Admin" || user?.role === "Plan") && (
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenModalCantidad(compra)}
                        disabled={
                          compra.cantidad7050 + compra.cantidad7066 ===
                          compra.cant_recibir
                        }
                      >
                        Asignar Almacen
                      </Button>
                    </TableCell>
                  )}

                  {(user?.role === "Admin" || user?.role === "Plan") && (
                    <TableCell>
                      {/* Botón adicional para asignar automáticamente al almacén 7050 */}
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleAssignToAlmacen7050(compra)}
                        disabled={
                          compra.cantidad7050 + compra.cantidad7066 ===
                          compra.cant_recibir
                        }
                        sx={{ ml: 2 }} // Espacio entre los botones
                      >
                        Asignar todo a 7050
                      </Button>
                    </TableCell>
                  )}

                  {user?.role === "Recibo" && (
                    <>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditProduct(compra)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() => handleOpenUploadModal(compra)}
                        >
                          Subir Documentos
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={filteredCompras.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>

      {/* Modal para dividir cantidad */}
      <Modal open={openModalCantidad} onClose={handleCloseModalCantidad}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Dividir Cantidad a Recibir en Almacen
          </Typography>

          {/* Mostrar cantidad total a recibir */}
          <Typography variant="subtitle1" gutterBottom>
            Cantidad Total: {cantidadRecibir}
          </Typography>

          {/* Primer campo de cantidad y almacén */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Cantidad 1"
                variant="outlined"
                fullWidth
                value={cantidad1}
                onChange={handleCantidad1Change} // Cálculo automático
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Almacén 7050"
                variant="outlined"
                fullWidth
                value={almacen1}
                disabled // El almacén está predefinido como "7050"
              />
            </Grid>

            {/* Segundo campo de cantidad (calculado) y almacén */}
            <Grid item xs={6}>
              <TextField
                label="Cantidad 2"
                variant="outlined"
                fullWidth
                value={cantidad2}
                disabled // Este campo está deshabilitado ya que se calcula automáticamente
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Almacén 7066"
                variant="outlined"
                fullWidth
                value={almacen2}
                disabled // El almacén está predefinido como "7066"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button variant="contained" onClick={handleGuardarCantidad}>
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para subir documentos */}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        {uploadProgress === 0 ? (
          <CircularProgress color="inherit" />
        ) : (
          <Box sx={{ width: "80%", textAlign: "center" }}>
            <Typography variant="h6">
              Subiendo archivos pdf : {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Backdrop>
      <Modal open={openUploadModal} onClose={handleCloseUploadModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%", // Ajustar ancho para que los documentos quepan en línea
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Subir Documentos para {detalleData?.codigo}
          </Typography>

          <Grid
            container
            spacing={4}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            {/* Documento: Carta Porte */}
            <Grid item xs={2}>
              <Typography variant="h6" gutterBottom>
                Carta Porte
              </Typography>
              {detalleData?.pdf_1 ? (
                <div>
                  <Button
                    href={`http://localhost:3011/docs/${detalleData.pdf_1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    sx={{
                      backgroundColor: "rgba(76, 175, 80, 0.5)", // Verde con transparencia
                      color: "white",
                      width: "300px",
                      justifyContent: "flex-start", // Alinea el contenido a la izquierda
                      textAlign: "left", // Alinea el texto a la izquierda
                      "&:hover": {
                        backgroundColor: "rgba(76, 175, 80, 0.8)", // Hover más oscuro
                      },
                      marginBottom: "10px",
                    }}
                  >
                    {detalleData.pdf_1.split("-").slice(3).join("-")}
                  </Button>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Reemplazar
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "cartaPorte")}
                      />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Seleccionar Documento
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "cartaPorte")}
                      />
                    </Button>
                  )}
                  {selectedFiles.cartaPorte && (
                    <Typography sx={{ mt: 1 }}>
                      {selectedFiles.cartaPorte.name}
                    </Typography>
                  )}
                </>
              )}
            </Grid>

            {/* Documento: Packing List */}
            <Grid item xs={2}>
              <Typography variant="h6" gutterBottom>
                Packing List
              </Typography>
              {detalleData?.pdf_2 ? (
                <div>
                  {detalleData.pdf_2.split(",").map((pdfName, index) => (
                    <Button
                      key={index}
                      href={`http://localhost:3011/docs/${pdfName.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      sx={{
                        backgroundColor: "rgba(76, 175, 80, 0.5)",
                        width: "300px",
                        justifyContent: "flex-start", // Alinea el contenido a la izquierda
                        textAlign: "left", // Alinea el texto a la izquierda
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(76, 175, 80, 0.8)",
                        },
                        marginBottom: "10px",
                      }}
                    >
                      {pdfName.trim().split("-").slice(3).join("-")}
                    </Button>
                  ))}
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Reemplazar
                      <VisuallyHiddenInput
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleFilesChange(e, "packingList", true)
                        }
                      />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Seleccionar Documento
                      <VisuallyHiddenInput
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleFilesChange(e, "packingList", true)
                        }
                      />
                    </Button>
                  )}
                  {selectedFiles.packingList && (
                    <Typography sx={{ mt: 1 }}>
                      {/* {selectedFiles.packingList.name} */}
                      {Array.from(selectedFiles.packingList)
                        .map((file) => file.name)
                        .join(", ")}
                    </Typography>
                  )}
                </>
              )}
            </Grid>

            {/* Documento: Pedimento */}
            <Grid item xs={2}>
              <Typography variant="h6" gutterBottom>
                Pedimento
              </Typography>
              {detalleData?.pdf_3 ? (
                <div>
                  <Button
                    href={`http://localhost:3011/docs/${detalleData.pdf_3}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    sx={{
                      backgroundColor: "rgba(76, 175, 80, 0.5)",
                      color: "white",
                      width: "300px",
                      justifyContent: "flex-start", // Alinea el contenido a la izquierda
                      textAlign: "left", // Alinea el texto a la izquierda
                      "&:hover": {
                        backgroundColor: "rgba(76, 175, 80, 0.8)",
                      },
                      marginBottom: "10px",
                    }}
                  >
                    {detalleData.pdf_3.split("-").slice(3).join("-")}
                  </Button>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Reemplazar
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "pedimento")}
                      />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Seleccionar Documento
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "pedimento")}
                      />
                    </Button>
                  )}
                  {selectedFiles.pedimento && (
                    <Typography sx={{ mt: 1 }}>
                      {selectedFiles.pedimento.name}
                    </Typography>
                  )}
                </>
              )}
            </Grid>

            {/* Documento: Factura */}
            <Grid item xs={2}>
              <Typography variant="h6" gutterBottom>
                Factura
              </Typography>
              {detalleData?.pdf_4 ? (
                <div>
                  {detalleData.pdf_4.split(",").map((pdfName, index) => (
                    <Button
                      key={index}
                      href={`http://localhost:3011/docs/${pdfName.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      sx={{
                        backgroundColor: "rgba(76, 175, 80, 0.5)",
                        color: "white",
                        width: "300px",
                        justifyContent: "flex-start", // Alinea el contenido a la izquierda
                        textAlign: "left", // Alinea el texto a la izquierda
                        "&:hover": {
                          backgroundColor: "rgba(76, 175, 80, 0.8)",
                        },
                        marginBottom: "10px",
                      }}
                    >
                      {pdfName.trim().split("-").slice(3).join("-")}
                    </Button>
                  ))}
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Reemplazar
                      <VisuallyHiddenInput
                        type="file"
                        multiple // Permitir seleccionar múltiples archivos
                        onChange={(e) =>
                          handleFilesChange(e, "referencia", true)
                        }
                      />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Seleccionar Documento
                      <VisuallyHiddenInput
                        type="file"
                        multiple // Permitir seleccionar múltiples archivos
                        onChange={(e) =>
                          handleFilesChange(e, "referencia", true)
                        }
                      />
                    </Button>
                  )}
                  {selectedFiles.referencia && (
                    <Typography sx={{ mt: 1 }}>
                      {Array.from(selectedFiles.referencia)
                        .map((file) => file.name)
                        .join(", ")}
                    </Typography>
                  )}
                </>
              )}
            </Grid>

            {/* Documento: Orden de Compra */}
            <Grid item xs={2}>
              <Typography variant="h6" gutterBottom>
                Orden de Compra
              </Typography>
              {detalleData?.pdf_5 ? (
                <div>
                  <Button
                    href={`http://localhost:3011/docs/${detalleData.pdf_5}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    sx={{
                      backgroundColor: "rgba(76, 175, 80, 0.5)",
                      color: "white",
                      width: "300px",
                      justifyContent: "flex-start", // Alinea el contenido a la izquierda
                      textAlign: "left", // Alinea el texto a la izquierda
                      "&:hover": {
                        backgroundColor: "rgba(76, 175, 80, 0.8)",
                      },
                      marginBottom: "10px",
                    }}
                  >
                    {detalleData.pdf_5.split("-").slice(3).join("-")}
                  </Button>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Reemplazar
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "ordenCompra")}
                      />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {user?.role !== "Recibo" && (
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Seleccionar Documento
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => handleFilesChange(e, "ordenCompra")}
                      />
                    </Button>
                  )}
                  {selectedFiles.ordenCompra && (
                    <Typography sx={{ mt: 1 }}>
                      {selectedFiles.ordenCompra.name}
                    </Typography>
                  )}
                </>
              )}
            </Grid>

            {/* Botón para subir todos los archivos */}
            <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
              {user?.role !== "Recibo" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFilesUpload}
                  startIcon={<UploadFileIcon />} 
                >
                  Subir Archivos
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}

export default Compras;
//

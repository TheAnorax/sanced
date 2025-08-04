// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   TextField,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
// } from '@mui/material';

// function InsumosRH() {
//     const [insumos, setInsumos] = useState([]);
//     const [open, setOpen] = useState(false);
//     const [isEditing, setIsEditing] = useState(false); // Nueva bandera para identificar edición
//     const [formData, setFormData] = useState({
//       Codigo: '',
//       Descripcion: '',
//       Cantidad: '',
//       Talla: '',
//       Categoria: '',
//       UM: '',
//     });

//     // Obtener los datos de la API
//     const fetchInsumos = async () => {
//       try {
//         const response = await axios.get('http://66.232.105.87:3007/api/RH/RH');
//         setInsumos(response.data);
//       } catch (error) {
//         console.error('Error al obtener los insumos:', error);
//       }
//     };

//     useEffect(() => {
//       fetchInsumos();
//     }, []);

//     // Manejar el envío del formulario
//     const handleSubmit = async () => {
//         try {
//           if (isEditing) {
//             console.log('Editando registro con Código:', formData.Codigo);
//             await axios.put(`http://66.232.105.87:3007/api/RH/RH/${formData.Codigo}`, formData);
//           } else {
//             console.log('Creando un nuevo registro:', formData);

//             // Asegúrate de enviar el `Codigo` siempre, incluso si es una creación
//             await axios.post('http://66.232.105.87:3007/api/RH/RH', formData);
//           }

//           fetchInsumos();
//           handleClose();
//         } catch (error) {
//           console.error('Error al guardar el insumo:', error);
//         }
//       };

//     // Manejar la eliminación
//     const handleDelete = async (codigo) => {
//       try {
//         await axios.delete(`http://66.232.105.87:3007/api/RH/RH/${codigo}`);
//         fetchInsumos();
//       } catch (error) {
//         console.error('Error al eliminar el insumo:', error);
//       }
//     };

//     // Abrir el modal para agregar un nuevo insumo
//     const handleOpen = (insumo = {}, editing = false) => {
//       setFormData(insumo);
//       setIsEditing(editing); // Cambiar el estado de edición según corresponda
//       setOpen(true);
//     };

//     // Cerrar el modal y reiniciar los valores
//     const handleClose = () => {
//       setOpen(false);
//       setFormData({
//         Codigo: '',
//         Descripcion: '',
//         Cantidad: '',
//         Talla: '',
//         Categoria: '',
//         UM: '',
//       });
//       setIsEditing(false); // Reiniciar el estado de edición
//     };

//     return (
//       <div>
//         <h2>Insumos RH</h2>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => handleOpen({}, false)} // Abrir el modal en modo creación
//         >
//           Agregar Insumo
//         </Button>
//         <TableContainer component={Paper} style={{ marginTop: '20px' }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Código</TableCell>
//                 <TableCell>Descripción</TableCell>
//                 <TableCell>Cantidad</TableCell>
//                 <TableCell>Talla</TableCell>
//                 <TableCell>Categoría</TableCell>
//                 <TableCell>Acciones</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {insumos.map((insumo) => (
//                 <TableRow key={insumo.Codigo}>
//                   <TableCell>{insumo.Codigo}</TableCell>
//                   <TableCell>{insumo.Descripcion}</TableCell>
//                   <TableCell>{insumo.Cantidad}</TableCell>
//                   <TableCell>{insumo.Talla || 'N/A'}</TableCell>
//                   <TableCell>{insumo.Categoria}</TableCell>
//                   <TableCell>
//                     <Button
//                       variant="outlined"
//                       color="primary"
//                       onClick={() => handleOpen(insumo, true)} // Abrir el modal en modo edición
//                     >
//                       Editar
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={() => handleDelete(insumo.Codigo)}
//                     >
//                       Eliminar
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Dialogo para agregar/editar */}
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>{isEditing ? 'Editar Insumo' : 'Agregar Insumo'}</DialogTitle>
//           <DialogContent>
//             <TextField
//               margin="dense"
//               label="Código"
//               type="number"
//               fullWidth
//               value={formData.Codigo}
//               onChange={(e) => setFormData({ ...formData, Codigo: e.target.value })}
//               disabled={isEditing} // Deshabilitar si estamos editando
//             />
//             <TextField
//               margin="dense"
//               label="Descripción"
//               type="text"
//               fullWidth
//               value={formData.Descripcion}
//               onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
//             />
//             <TextField
//               margin="dense"
//               label="Cantidad"
//               type="number"
//               fullWidth
//               value={formData.Cantidad}
//               onChange={(e) => setFormData({ ...formData, Cantidad: e.target.value })}
//             />
//             <TextField
//               margin="dense"
//               label="Talla"
//               type="text"
//               fullWidth
//               value={formData.Talla}
//               onChange={(e) => setFormData({ ...formData, Talla: e.target.value })}
//             />
//             <TextField
//               margin="dense"
//               label="Categoría"
//               type="text"
//               fullWidth
//               value={formData.Categoria}
//               onChange={(e) => setFormData({ ...formData, Categoria: e.target.value })}
//             />
//             <TextField
//               margin="dense"
//               label="Unidad de Medida (UM)"
//               type="text"
//               fullWidth
//               value={formData.UM}
//               onChange={(e) => setFormData({ ...formData, UM: e.target.value })}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClose} color="secondary">
//               Cancelar
//             </Button>
//             <Button onClick={handleSubmit} color="primary">
//               Guardar
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     );
//   }

// export default InsumosRH;

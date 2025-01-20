import React from 'react';
import QRCode from 'qrcode.react'; // Generador de QR
import { BorderColor } from '@mui/icons-material';

const PapeletaTarimaRestante = ({
    tarimaData,
    recibo,
    cantidadRecibidaTarimas,
    fecha,
    descripcion,
    codigo,
    restante,
    caja_cama,
    caja_palet,
}) => {
    const styles = {
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '50px',  // Reduce font size
            height: '100vh',
            BorderColor: '#f2f2f2', // Fondo gris claro 
            border: '3'
        },
        cell: {
            padding: '10px',  // Eliminar padding
            margin: '0',  // Eliminar margen
            borderCollapse: 'collapse',
            textAlign: 'center',
            height: 'auto',  // Set cell height to make it thinner
            lineHeight: '1',  // Ajustar la altura del texto
        },
        header: {
            fontWeight: 'bold',
            fontSize: '100px',  // Slightly smaller font size
            lineHeight: '1',  // Ajustar la altura del texto
        },
        logoCell: {
            width: '200px',
            height: '40px',
            padding: '0',  // Eliminar padding
            margin: '0',  // Eliminar margen
        },
        celllogo: {
            padding: '0',  // Eliminar padding
            paddingLeft: '5px',  // Agregar padding solo a la izquierda
            margin: '1',  // Eliminar margen
            marginLeft: '10px',  // Agregar margen a la izquierda de 2 cm
            border: '0.1px solid lightgray',
            textAlign: 'left',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        systemCell: {
            height: '12px',
            fontWeight: 'bold',
            fontSize: '90px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        cellsys: {
            padding: '0',
            margin: '0',  // Eliminar margen
            border: '0.1px solid lightgray',
            textAlign: 'left',
            lineHeight: '1',
            paddingLeft: '5px',
        },
        cellmodel: {
            padding: '0',
            margin: '0',  // Eliminar margen
            border: '0.1px solid lightgray',
            textAlign: 'center',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        qrContainer: {
            display: 'flex',
            justifyContent: 'center',  // Alinea el contenido: texto centrado y QR a la derecha
            alignItems: 'center',             // Centra verticalmente los elementos
            padding: '10px',
        },
        piezasContainer: {
            flex: 1,  // Esto permite que el texto ocupe todo el espacio restante
            textAlign: 'center',  // Centra el texto
            fontWeight: 'bold',
            fontSize: '500px',
            lineHeight: '1',  // Ajustar la altura del texto
            paddingLeft: '10px',
        },
        qrCodeStyle: {
            margin: '10px',
            width: '600px', // Incrementa este valor
            height: '600px', // Incrementa este valor
        },
        
        ///////// 


        description: {
            fontWeight: 'bold',
            fontSize: '100px', // Tamaño para la descripción
            textAlign: 'center',
        },
        total: {
            fontWeight: 'bold',
            fontSize: '5000px', // Tamaño grande para el restante
            textAlign: 'center',
        },



        cellmodelQR: {
            marginLeft: 'auto',  // Empuja el QR a la derecha
            justifyContent: 'space-between', // Para colocar el texto centrado y el QR a la derecha
            alignItems: 'right',
        },
        headermodel: {
            fontWeight: 'bold',
            fontSize: '700px',
            lineHeight: '1',  // Ajustar la altura del texto
            textAlign: 'center',
        },
        headermodel2: {
            fontWeight: 'bold',
            fontSize: '100px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headermodel3: {
            fontWeight: 'bold',
            fontSize: '100px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        celltotal: {
            padding: '0',
            margin: '0',  // Eliminar margen
            border: '0.1px solid lightgray',
            textAlign: 'center',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headertotal: {
            fontWeight: 'bold',
            fontSize: '100px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headertota2: {
            fontWeight: 'bold',
            fontSize: '100px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headertotal2: {
            fontWeight: 'bold',
            fontSize: '100px',
            lineHeight: '1',  // Ajustar la altura del texto
        },

        qrCell: {
            display: 'flex',          // Usamos flexbox para controlar la alineación
            justifyContent: 'space-between', // Para colocar el texto centrado y el QR a la derecha
            alignItems: 'center',     // Centrar verticalmente
            padding: '0 10px',        // Espaciado interno para separación
            border: '0.1px solid lightgray',
        },

    };

    const qrData = `Código: ${codigo},\nDescripción: ${descripcion}, \nTotal de piezas: ${restante}`; 

    return (
        <table style={styles.table}>
            <tbody>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.header, ...styles.logoCell }} rowSpan="3" colSpan="1">
                        <img src={`../assets/image/logob.png`} alt="Logo" style={{ width: '100%', height: 'auto' }} />
                    </td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">Titulo de documento</td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">Fecha de emisión:</td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">{fecha}</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">Identificación de pallet</td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">Remplaza a la Rev.:</td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">000</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">Formato:</td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4">Elaboró:</td>
                    <td style={{ ...styles.cell, ...styles.header }} colSpan="4"></td>
                </tr>
                <tr>
                    <td style={{ ...styles.cell, ...styles.systemCell }} colSpan="5" rowSpan="2">
                        SISTEMA DE GESTIÓN DE CALIDAD
                    </td>
                    <td style={{ ...styles.cell, ...styles.systemCell }}>Código: FT-CS-004</td>
                    <td style={{ ...styles.cell, ...styles.systemCell }} colSpan="4">Revisó</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cell, ...styles.systemCell }}>
                        Página: 1 de {cantidadRecibidaTarimas ?? 'N/A'}
                    </td>
                    <td style={{ ...styles.cell, ...styles.systemCell }} colSpan="4">Distribución</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.header }} rowSpan="2">MODELO</td>
                    <td style={{ ...styles.cellmodel, ...styles.headermodel }} colSpan="12">{codigo ?? 'N/A'}</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.header }} colSpan="12">{descripcion ?? 'N/A'}</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cell, ...styles.header }}>Total de piezas</td>
                    <td style={{ ...styles.cell }} colSpan="12">
                        <div style={styles.qrContainer}>
                            <div style={styles.piezasContainer}>
                                {restante ?? 'N/A'}
                            </div>
                            <QRCode value={qrData} style={styles.qrCodeStyle} />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.header }}>Fecha de Arribo</td>
                    <td style={{ ...styles.cellmodel, ...styles.header }} colSpan="12">{recibo?.arribo ?? 'N/A'}</td>
                </tr>
                <tr>
                    <td style={styles.cellmodel}>CAJAS X CAMA</td>
                    <td style={styles.cellmodel} colSpan="4">{caja_cama ?? 'N/A'}</td>
                    <td style={styles.cellmodel}>CAMAS X PALLET</td>
                    <td style={styles.cellmodel} colSpan="4">{caja_palet ?? 'N/A'}</td>
                    <td style={styles.cellmodel}>RESTANTE</td>
                    <td style={styles.cellmodel} colSpan="4">{restante ?? 'N/A'}</td>
                </tr>
                <tr>
                    <td style={styles.cellmodel} colSpan="12">PROCEDIMIENTO RP-CS-001</td>
                </tr>
            </tbody>
        </table>
    );
};

export default PapeletaTarimaRestante;

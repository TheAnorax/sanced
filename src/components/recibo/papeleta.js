import React from 'react';
import QRCode from 'qrcode.react';  // Importamos la librería para generar el QR

const PapeletaTarima = ({ tarimaData, recibo, cantidadRecibidaTarimas, fecha, currentTarima = 0, descripcion, codigo, piezas_tarima, caja_cama,restante, caja_palet }) => {

    const styles = {
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '10px',  // Reduce font size
        },
        cell: {
            padding: '0',  // Eliminar padding
            margin: '0',  // Eliminar margen
            borderCollapse: 'collapse',
            textAlign: 'center',
            height: '20px',  // Set cell height to make it thinner
            lineHeight: '1',  // Ajustar la altura del texto
        },
        header: {
            fontWeight: 'bold',
            fontSize: '12px',  // Slightly smaller font size
            lineHeight: '1',  // Ajustar la altura del texto
        },
        logoCell: {
            width: '80px',
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
            fontSize: '10px',
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
            justifyContent: 'space-between',  // Alinea el contenido: texto centrado y QR a la derecha
            alignItems: 'center',             // Centra verticalmente los elementos
            padding: '0 10px',
        },
        piezasContainer: {
            flex: 1,  // Esto permite que el texto ocupe todo el espacio restante
            textAlign: 'center',  // Centra el texto
            fontWeight: 'bold',
            fontSize: '120px',
            lineHeight: '1',  // Ajustar la altura del texto
            paddingLeft: '10px',
        },
        qrCodeStyle: {
            marginRight: '5px',  // Añadir margen derecho al QR
        },
        ///////// 
     
      
        
       
       
        cellmodelQR: {
            marginLeft: 'auto',  // Empuja el QR a la derecha
            justifyContent: 'space-between', // Para colocar el texto centrado y el QR a la derecha
            alignItems: 'right', 
        },
        headermodel: {
            fontWeight: 'bold',
            fontSize: '160px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headermodel2: {
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headermodel3: {
            fontWeight: 'bold',
            fontSize: '30px',
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
            fontSize: '30px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headertota2: {
            fontWeight: 'bold',
            fontSize: '80px',
            lineHeight: '1',  // Ajustar la altura del texto
        },
        headertotal2: {
            fontWeight: 'bold',
            fontSize: '16px',
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

    const qrData = `Código: ${codigo},\nDescripción: ${descripcion}, \nTotal de piezas: ${piezas_tarima}`;

    return (
        <table style={styles.table}>
            <tbody>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.header, ...styles.logoCell }} rowSpan="3" colSpan="1">
                        <img src={`../assets/image/logob.png`} alt="Logo" style={{ width: '100%', height: 'auto' }} />
                    </td>
                    <td style={{ ...styles.celllogo }} colSpan="4">Titulo de documento</td>
                    <td style={{ ...styles.celllogo }} colSpan="4">Fecha de emisión:</td>
                    <td style={{ ...styles.celllogo }} colSpan="4">{fecha}</td>
                </tr>
                <tr>
                    <td style={{ ...styles.celllogo }} colSpan="4">Identificación de pallet</td>
                    <td style={{ ...styles.celllogo }} colSpan="4">Remplaza a la Rev.:</td>
                    <td style={{ ...styles.celllogo }} colSpan="4">000</td>
                </tr>
                <tr>
                    <td style={{ ...styles.celllogo }} colSpan="4">Formato:</td>
                    <td style={{ ...styles.celllogo }} colSpan="4">Elaboró:</td>
                    <td style={{ ...styles.celllogo }} colSpan="4"></td>
                </tr>
                <tr>
                    <td style={{ ...styles.cellsys, ...styles.systemCell }} colSpan="5" rowSpan="2">
                        SISTEMA DE GESTIÓN DE CALIDAD
                    </td>
                    <td style={{ ...styles.cellsys }}>Código: FT-CS-004</td>
                    <td style={{ ...styles.cellsys }} colSpan="4">Revisó</td>
                </tr>
                <tr>
                     <td style={{ ...styles.cellsys }}>Página: {currentTarima + 1} de {tarimaData?.tarimas_completas ?? cantidadRecibidaTarimas}</td>
                    <td style={{ ...styles.cellsys }} colSpan="4">Distribución</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.headermodel2 }} rowSpan="2">MODELO</td>
                    <td style={{ ...styles.cellmodel, ...styles.headermodel }} colSpan="12">{codigo ?? 'N/A'}</td>
                </tr>
                <tr>
                    <td style={{ ...styles.cellmodel, ...styles.headermodel3 }} colSpan="12">{descripcion ?? 'N/A'}</td>
                </tr>
                <tr>
                    <td style={{ ...styles.celltotal, ...styles.headertotal2 }}>Total de piezas</td>
                    <td style={{ ...styles.celltotal }} colSpan="12">
                        <div style={styles.qrContainer}>
                            <div style={styles.piezasContainer}>
                                {piezas_tarima ?? 'N/A'}
                            </div>
                            <QRCode value={qrData} size={100} style={styles.qrCodeStyle} />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={styles.cellmodel}>Fecha de Arribo</td>
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

export default PapeletaTarima;

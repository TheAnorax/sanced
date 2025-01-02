import logo from './logob.png'; 

export const pdfTemplate = (solicitud) => {
    const { nombre, departamento, motivo, regresaArticulo, requiereEnvio, detalleEnvio, carrito, folio, fecha, des } = solicitud;

    return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                .container {
                    margin: 20px; /* Este margen aleja todo el contenido del borde */
                    border: 5px solid black; /* Borde alrededor de la página */
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid black; 
                    padding: 10px;
                }
                .header img {
                    width: 200px;
                    height: auto;
                }
                .title {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    width: 100%;
                }
                .content {
                    padding: 20px;
                }
                .content .details {
                    display: flex;
                    justify-content: space-between;
                }
                .content .details div {
                    width: 48%;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                .table th, .table td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }
                .table th {
                    background-color: #f0f0f0;
                    font-size: 14px;
                }
                .footer {
                    margin-top: 500px;
                    text-align: center;
                    margin-bottom: 50px;
                }
                .footer .signatures {
                    display: flex;
                    justify-content: space-evenly; /* Distribute the signatures evenly */
                    width: 100%;
                    align-items: center; /* Ensure items are aligned */
                }
                .footer div {
                    text-align: center;
                    margin: 0 20px;
                }
                .footer img {
                    width: 80px;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                }
                .signature-line {
                    border-top: 1px solid black;
                    font-size: 12px;
                    text-align: center;
                    margin-top: 5px;
                }
                .footer div p {
                    font-size: 12px;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logo}" alt="Logo" />
                    <div class="title">BAJA DE ALMACÉN</div>
                    <div class="folio">Folio: ${folio}</div>
                </div>

                <div class="content">
                    <div class="details">
                        <div>
                            <p><strong>Solicitante:</strong> ${nombre}</p>
                            <p><strong>Departamento:</strong> ${departamento}</p>
                            <p><strong>Motivo de la solicitud:</strong> ${motivo}</p>
                            <p><strong>Regresa artículos:</strong> ${regresaArticulo ? "Sí" : "No"}</p>
                            ${regresaArticulo ? `<p><strong>Fecha de devolución:</strong> ${fecha}</p>` : ''}
                        </div>
                        <div>
                            <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Requiere envío:</strong> ${requiereEnvio ? "Sí" : "No"}</p>
                            <p><strong>Detalles del envío:</strong> ${detalleEnvio || "N/A"}</p>
                        </div>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${carrito.map(item => `  
                            <tr>
                                <td>${item.codigo}</td>
                                <td>${item.des}</td>
                                <td>${item.cantidad}</td>
                                
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `;
};
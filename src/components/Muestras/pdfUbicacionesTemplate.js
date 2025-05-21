import logo from "./logob.png";

export const pdfUbicacionesTemplate = (solicitud) => {
  const { nombre, departamento, motivo, detalleEnvio, carrito, folio, fecha } =
    solicitud;

  const fechaFormateada = fecha
    ? new Date(fecha).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

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
                    margin: 20px;
                    border: 5px solid black;
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logo}" alt="Logo" />
                    <div class="title">UBICACIONES DE PRODUCTOS</div>
                    <div class="folio">Folio: ${folio}</div>
                </div>

                <div class="content">
                    <div class="details">
                        <div>
                            <p><strong>Solicitante:</strong> ${nombre}</p>
                            <p><strong>Departamento:</strong> ${departamento}</p>
                            <p><strong>Fecha de solicitud:</strong> ${fechaFormateada}</p>
                        </div>
                        <div>
                            <p><strong>Motivo:</strong> ${motivo}</p>
                            <p><strong>Información de entrega:</strong> ${
                              detalleEnvio || "N/A"
                            }</p>
                        </div>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Ubicación</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${carrito
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.codigo}</td>
                                    <td>${item.descripcion}</td>
                                    <td>${item.cantidad}</td>
                                    <td>${item.ubicacion || "N/A"}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `;
};

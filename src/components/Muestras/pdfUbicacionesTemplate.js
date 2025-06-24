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

  const totalPaginas = Math.ceil(carrito.length / 20);

  let html = `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .page {
          width: 210mm;
          height: 297mm;
          page-break-after: always;
          box-sizing: border-box;
          padding: 15mm;
          border: 4px solid black;
          background-color: #ffffff; /* <- Asegura fondo blanco */
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05); /* <- Delimita el borde al renderizar */
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid black;
          margin-bottom: 10px;
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
        .folio {
          font-size: 14px;
          font-weight: bold;
        }
        .details {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .details div {
          width: 48%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 6px;
          font-size: 12px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
        }
      </style>
    </head>
    <body>
  `;

  for (let i = 0; i < totalPaginas; i++) {
    const productos = carrito.slice(i * 20, (i + 1) * 20);

    html += `
      <div class="page">
        <div class="header">
          <img src="${logo}" alt="Logo" />
          <div class="title">UBICACIONES DE PRODUCTOS</div>
          <div class="folio">Folio: ${folio}</div>
        </div>

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

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            ${productos
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
    `;
  }

  html += `
    </body>
    </html>
  `;

  return html;
};

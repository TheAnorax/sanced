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

  // -------- ORDEN PERSONALIZADO DE UBICACIONES --------
  // Convierte una ubicación a una "clave" numérica para ordenar:
  // [grupoPasillo, numPasillo, tramo, nivel, letra]
  // grupoPasillo: 0 = AV, 1 = Pxx, 9 = otros/invalidos
  const claveOrdenUbicacion = (ubiRaw) => {
    if (!ubiRaw) return [9, 99, 9999, 9999, "Z"];

    const ubi = String(ubiRaw).trim().toUpperCase();
    // Matchea: AV# o P##, luego -numero, luego -numero + letra opcional
    // Ej: AV1-007-3A  /  P02-076-1A
    const m = ubi.match(/^(AV\d*|P\d{1,2})(?:-(\d+))?(?:-(\d+)([A-Z])?)?$/);

    if (!m) return [9, 99, 9999, 9999, "Z"];

    const prefijo = m[1]; // AV1   ó  P02
    const tramo = parseInt(m[2] || "0", 10); // 007
    const nivelN = parseInt(m[3] || "0", 10); // 3
    const nivelL = m[4] || "A"; // A

    if (prefijo.startsWith("AV")) {
      const avN = parseInt(prefijo.slice(2) || "0", 10); // AV1 -> 1
      return [0, avN, tramo, nivelN, nivelL];
    }

    if (prefijo.startsWith("P")) {
      const pN = parseInt(prefijo.slice(1), 10); // P02 -> 2
      return [1, pN, tramo, nivelN, nivelL];
    }

    return [9, 99, tramo, nivelN, nivelL];
  };

  // Ordena: primero AV (por AV1, AV2...), luego P01..P08 (por número asc),
  // y dentro: tramo, nivel numérico y letra.
  const carritoOrdenado = [...(carrito || [])].sort((a, b) => {
    const A = claveOrdenUbicacion(a.ubicacion);
    const B = claveOrdenUbicacion(b.ubicacion);
    for (let i = 0; i < A.length; i++) {
      if (A[i] < B[i]) return -1;
      if (A[i] > B[i]) return 1;
    }
    return 0;
  });

  // Si quieres forzar que SOLO P01..P08 queden antes que P09+,
  // esto ya se cumple porque ordenamos por número de P ascendente.
  // (Los que no matchean el patrón se van al final por grupo 9).

  // -------- PAGINACIÓN (después de ordenar) --------
  const pageSize = 20;
  const totalPaginas = Math.ceil(carritoOrdenado.length / pageSize);

  let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .page {
          width: 210mm; height: 297mm; page-break-after: always;
          box-sizing: border-box; padding: 15mm;
          border: 4px solid black; background-color: #ffffff;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
        }
        .header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 2px solid black; margin-bottom: 10px;
        }
        .header img { width: 200px; height: auto; }
        .title { text-align: center; font-size: 20px; font-weight: bold; width: 100%; }
        .folio { font-size: 14px; font-weight: bold; }
        .details { display: flex; justify-content: space-between; margin-top: 10px; }
        .details div { width: 48%; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: left; }
        th { background-color: #f0f0f0; }
      </style>
    </head>
    <body>
  `;

  for (let i = 0; i < totalPaginas; i++) {
    const productos = carritoOrdenado.slice(i * pageSize, (i + 1) * pageSize);

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

  html += `</body></html>`;
  return html;
};

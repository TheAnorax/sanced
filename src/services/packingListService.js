// /services/packingListService.js


// ✅ Versión con tabla de IMPORTE AGREGADA al final (corregida)


const PDFDocument = require('pdfkit');

const [referenciasClientes, setReferenciasClientes] = useState([]);

useEffect(() => {
    axios.get("http://localhost:3007/api/Trasporte/referencias")
        .then(res => setReferenciasClientes(res.data))
        .catch(err => console.error("Error cargando referencias", err));
}, []);

function buscarReferenciaCliente(numCliente, nombreCliente, referencias) {
    // 1. Busca por número (asegura trims y mismo tipo)
    let ref = referencias.find(r =>
        String(r.Num_Cliente).trim() === String(numCliente).trim()
    );
    if (ref) return ref.REFERENCIA;

    // 2. Si no existe, busca por nombre
    ref = referencias.find(r =>
        r.Nombre_cliente.trim().toUpperCase() === (nombreCliente || '').trim().toUpperCase()
    );
    return ref ? ref.REFERENCIA : "";
}

const totalPagesExp = "___total_pages___";

function addPageNumber(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    if (pageCount >= 1) {
        doc.setPage(1);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`PÁGINA 1 de ${pageCount}`, 200, 59, { align: "right" });
    }

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.addImage(barraFooter, "JPEG", 10, pageHeight - 15, 190, 8);
    }
}

function verificarEspacio(doc, currentY, filas = 10, margenInferior = 20) {
    const pageHeight = doc.internal.pageSize.height;
    const alturaEstim = 10 + filas * 6;
    if (currentY + alturaEstim > pageHeight - margenInferior) {
        doc.addPage();
        return 20;
    }
    return currentY;
}

async function generarPackingListPDF(pedido, productos) {
    try {
        const responseRoutes = await fetch(
            "http://localhost:3007/api/Trasporte/ruta-unica"
        );
        const routesData = await responseRoutes.json();
        const route = routesData.find(
            (r) => String(r["NO ORDEN"]) === String(pedido)
        );
        if (!route) return alert("No se encontró la ruta");

        const responseEmbarque = await fetch(
            `http://localhost:3007/api/Trasporte/embarque/${pedido}`
        );
        const data = await responseEmbarque.json();
        if (!data || !Array.isArray(data) || data.length === 0)
            return alert("No hay productos");

        const doc = new jsPDF();
        const marginLeft = 10;
        let currentY = 26;

        doc.setFillColor(240, 36, 44);
        doc.rect(10, 10, 190, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text("FORMATO PARA RECEPCIÓN DEL PEDIDO", 105, 15.5, {
            align: "center",
        });

        doc.addImage(logo, "JPEG", 145, 23, 50, 18);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(84, 84, 84);
        doc.text("Santul Herramientas S.A. de C.V.", marginLeft, currentY);
        currentY += 4;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(
            "Henry Ford 257 C y D, Col. Bondojito, Gustavo A. Madero,",
            marginLeft,
            currentY
        );
        currentY += 4;
        doc.text("Ciudad de México, C.P. 07850, México,", marginLeft, currentY);
        currentY += 4;
        doc.text("Tel.: 58727290", marginLeft, currentY);
        currentY += 4;
        doc.text("R.F.C. SHE130912866", marginLeft, currentY);
        currentY += 5;
        doc.setDrawColor(240, 36, 44);
        doc.setLineWidth(0.5);
        doc.line(10, currentY, 200, currentY);
        currentY += 4;

        const tipo_original = route["tipo_original"] || "No definido";
        const nombreCliente = route["NOMBRE DEL CLIENTE"] || "No disponible";
        const numeroFactura = route["NO_FACTURA"] || "No disponible";
        const direccion = cleanAddress(route["DIRECCION"]) || "No disponible";
        const numero = route["NUM. CLIENTE"] || "No disponible";
        const telefono = route["TELEFONO"] || "Sin número";
        const rawTotal = route["TOTAL"];
        const referenciaCliente = buscarReferenciaCliente(numero, nombreCliente, referenciasClientes);
        let totalImporte = 0;
        if (
            rawTotal &&
            !isNaN(parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, "")))
        ) {
            totalImporte = parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, ""));
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `CLIENTE NO.: ${numero}                      NOMBRE DEL CLIENTE: ${nombreCliente}`,
            marginLeft,
            currentY
        );
        currentY += 4;
        doc.text(
            `TELÉFONO: ${telefono}     DIRECCIÓN: ${direccion}`,
            marginLeft,
            currentY
        );
        currentY += 4;
        doc.text(`No Orden: ${pedido}-${tipo_original}`, marginLeft, currentY);
        currentY += 4;
        doc.text(`FACTURA No.: ${numeroFactura}`, marginLeft, currentY);
        currentY += 4;

        const infoY = currentY;
        doc.setFillColor(255, 255, 0);
        doc.rect(marginLeft, infoY, 190, 11, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("INFORMACIÓN IMPORTANTE", 105, infoY + 4, { align: "center" });
        doc.setFontSize(5.3);
        doc.text(
            "En caso de detectar cualquier irregularidad (daños, faltantes,cajas mojadas o manipulaciones), Favor de comunicarse de inmediato al departamento de atención al cliente al número:(55) 58727290 EXT.: (8815, 8819)",
            105,
            infoY + 9,
            { align: "center", maxWidth: 180 }
        );
        currentY = infoY + 15;

        const productosConCaja = data.filter((i) => i.caja && i.caja > 0);
        const productosSinCaja = data.filter((i) => !i.caja || i.caja === 0);

        // ✔️ Primero agrupamos productos por caja original

        const cajasAgrupadasOriginal = productosConCaja.reduce((acc, item) => {
            if (!acc[item.caja]) acc[item.caja] = [];
            acc[item.caja].push(item);
            return acc;
        }, {});

        const cajasOrdenadas = Object.entries(cajasAgrupadasOriginal).sort(
            (a, b) => Number(a[0]) - Number(b[0])
        );

        const totalINNER_MASTER = productosSinCaja.reduce(
            (s, i) => s + (i._inner || 0) + (i._master || 0),
            0
        );
        const totalCajasArmadas = cajasOrdenadas.length;
        const totalCajas = totalINNER_MASTER + totalCajasArmadas;

        const totalTarimas = data.reduce((s, i) => s + (i.tarimas || 0), 0);
        const totalAtados = data.reduce((s, i) => s + (i.atados || 0), 0);

        currentY = verificarEspacio(doc, currentY, 2);
        doc.autoTable({
            startY: currentY,
            head: [
                ["INNER/MASTER", "TARIMAS", "ATADOS", "CAJAS ARMADAS", "TOTAL CAJAS"],
            ],
            body: [
                [
                    totalINNER_MASTER,
                    totalTarimas,
                    totalAtados,
                    totalCajasArmadas,
                    totalCajas,
                ],
            ],
            theme: "grid",
            margin: { left: 10 },
            tableWidth: 190,
            styles: { fontSize: 9, halign: "center", cellPadding: 3 },
            headStyles: { fillColor: [210, 210, 210], textColor: [0, 0, 0] },
        });
        currentY = doc.lastAutoTable.finalY + 4;

        const cajasAgrupadas = productosConCaja.reduce((acc, item) => {
            if (!acc[item.caja]) acc[item.caja] = [];
            acc[item.caja].push(item);
            return acc;
        }, {});

        let numeroCajaSecuencial = 1;

        for (const [, productos] of cajasOrdenadas) {
            const titulo = `Productos en la Caja ${numeroCajaSecuencial}`;

            // Título de la tabla
            doc.autoTable({
                startY: currentY,
                head: [[titulo]],
                body: [],
                theme: "grid",
                styles: { halign: "center", fontSize: 9 },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                margin: { left: 10 },
                tableWidth: 190,
            });

            currentY = doc.lastAutoTable.finalY;

            let yaContinua = false;

            doc.autoTable({
                startY: currentY,
                head: [
                    [
                        "SKU",
                        "DESCRIPCIÓN",
                        "CANTIDAD",
                        "UM",
                        "PZ",
                        "PQ",
                        "INNER",
                        "MASTER",
                        "TARIMA",
                        "ATADOS",
                        "VALIDA",
                    ],
                ],
                body: productos.map((item) => [
                    item.codigo_ped || "",
                    item.des || "",
                    item.cantidad || "",
                    item.um || "",
                    item._pz || 0,
                    item._pq || 0,
                    item._inner || 0,
                    item._master || 0,
                    item.tarimas || 0,
                    item.atados || 0,
                    "",
                ]),
                theme: "grid",
                margin: { left: 10 },
                tableWidth: 190,
                styles: {
                    fontSize: 5.5,
                    halign: "center",
                    cellPadding: 2,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 15 },
                    3: { cellWidth: 10 },
                    4: { cellWidth: 10 },
                    5: { cellWidth: 10 },
                    6: { cellWidth: 12 },
                    7: { cellWidth: 12 },
                    8: { cellWidth: 12 },
                    9: { cellWidth: 12 },
                    10: { cellWidth: 12 },
                },
                headStyles: {
                    fillColor: [20, 20, 20],
                    textColor: [255, 255, 255],
                    fontSize: 5.5,
                },
                didDrawCell: function (data) {
                    if (
                        data.row.index === 0 &&
                        data.section === "body" &&
                        data.cursor.y < 30 && // Está en una nueva página
                        !yaContinua
                    ) {
                        const text = `Continuación de la Caja ${numeroCajaSecuencial}`;
                        doc.setFontSize(8);
                        doc.text(text, 105, data.cursor.y - 6, { align: "center" });
                        yaContinua = true;
                    }
                },
            });

            currentY = doc.lastAutoTable.finalY + 4;
            numeroCajaSecuencial++;
        }

        if (productosSinCaja.length > 0) {
            // Título principal
            currentY = verificarEspacio(doc, currentY, 2);
            doc.autoTable({
                startY: currentY,
                head: [["Productos sin caja"]],
                body: [],
                theme: "grid",
                styles: { halign: "center", fontSize: 9 },
                margin: { left: 10 },
                tableWidth: 190,
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
            });
            currentY = doc.lastAutoTable.finalY;

            let yaContinua = false;

            doc.autoTable({
                startY: currentY,
                head: [
                    [
                        "SKU",
                        "DESCRIPCIÓN",
                        "CANTIDAD",
                        "UM",
                        "PZ",
                        "INNER",
                        "MASTER",
                        "TARIMAS",
                        "ATADOS",
                        "VALIDAR",
                    ],
                ],
                body: productosSinCaja.map((item) => [
                    item.codigo_ped || "",
                    item.des || "",
                    item.cantidad || "",
                    item.um || "",
                    item._pz || 0,
                    item._inner || 0,
                    item._master || 0,
                    item.tarimas || 0,
                    item.atados || 0,
                    "",
                ]),
                theme: "grid",
                margin: { left: 10 },
                tableWidth: 190,
                styles: {
                    fontSize: 5.5,
                    halign: "center",
                    cellPadding: 2,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 80 },
                    2: { cellWidth: 15 },
                    3: { cellWidth: 10 },
                    4: { cellWidth: 10 },
                    5: { cellWidth: 12 },
                    6: { cellWidth: 12 },
                    7: { cellWidth: 12 },
                    8: { cellWidth: 12 },
                    9: { cellWidth: 12 },
                },
                headStyles: {
                    fillColor: [20, 20, 20],
                    textColor: [255, 255, 255],
                    fontSize: 5.5,
                },
                didDrawCell: function (data) {
                    if (
                        data.row.index === 0 &&
                        data.section === "body" &&
                        data.cursor.y < 30 &&
                        !yaContinua
                    ) {
                        const text = "Continuación de productos sin caja";
                        doc.setFontSize(8);
                        doc.text(text, 105, data.cursor.y - 6, { align: "center" });
                        yaContinua = true;
                    }
                },
            });

            currentY = doc.lastAutoTable.finalY + 4;
        }

        currentY = doc.lastAutoTable.finalY + 5;
        currentY = verificarEspacio(doc, currentY, 1);
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = 90;
        const leftMargin = (pageWidth - tableWidth) / 2;

        doc.autoTable({
            startY: currentY,
            head: [
                [
                    {
                        content: "DETALLES DEL PEDIDO",
                        colSpan: 2,
                        styles: {
                            halign: "center",
                            fillColor: [230, 230, 230],
                            fontSize: 7,
                        },
                    },
                    {
                        content: pedido,
                        styles: {
                            halign: "center",
                            fillColor: [200, 200, 200],
                            fontSize: 9,
                        },
                    },
                ],
                [
                    {
                        content: "IMPORTE DEL PEDIDO\n(SIN IVA)",
                        styles: { halign: "center", fontSize: 5 },
                    },
                    {
                        content: "TOTAL A PAGAR\n(SIN IVA)",
                        styles: { halign: "center", fontSize: 5 },
                    },
                    {
                        content: "PORCENTAJE DE ENTREGA",
                        styles: { halign: "center", fontSize: 5 },
                    },
                ],
            ],
            body: [
                [
                    `$${totalImporte.toFixed(2)}`,
                    `$${totalImporte.toFixed(2)}`,
                    "100.00 %",
                ],
            ],
            theme: "grid",
            styles: { fontSize: 8, halign: "center" },
            margin: { left: leftMargin },
            tableWidth: tableWidth,
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0],
                fontStyle: "bold",
                fontSize: 4.5,
            },
        });

        currentY = doc.lastAutoTable.finalY + 5;
        currentY = verificarEspacio(doc, currentY, 1);
        doc.autoTable({
            startY: currentY,
            body: [
                [
                    {
                        content:
                            "Se confirma que las cajas, atados y/o tarimas listadas en esta lista de empaque fueron recibidas cerradas y en buen estado, y así serán entregadas al cliente. Cualquier anomalía se atenderá según lo establecido en el contrato",
                        styles: { fontSize: 7, halign: "justify", textColor: [0, 0, 0] },
                    },
                    {
                        content: "Firma del Transportista",
                        styles: { fontSize: 7, halign: "center", fontStyle: "bold" },
                    },
                ],
            ],
            theme: "grid",
            styles: { cellPadding: 3, valign: "top" },
            columnStyles: {
                0: { cellWidth: 150 },
                1: { cellWidth: 40 },
            },
            margin: { left: 10 },
            tableWidth: 190,
        });

        currentY = doc.lastAutoTable.finalY + 0;

        const instrucciones = [
            "•Estimado cliente, nuestro transportista cuenta con ruta asignada por lo que agradeceríamos agilizar el tiempo de recepción de su mercancía, el material viaja consignado por lo que solo podrá entregarse en la dirección estipulada en este documento.",
            "•Cualquier retraso en la recepción generan costos adicionales y pueden afectar la entrega a otros clientes. En casos repetitivos, podrían cancelarse beneficios como descuentos adicionales.",
            "•El transportista solo entregará en planta baja o *nivel de calle*, si cuenta con alguna política especial de recepción, por favor solicita un esquema de entrega con tu Asesor de ventas.",
            "•Si Ud. detecta alguna anomalía en el empaque, embalaje, atado de la mercancía, alguna diferencia vs las cajas embarcadas y/o que el transportista retiene mercancía de forma intencional repórtalo en el apartado de observaciones.",
            "•El transportista no está autorizado a recibir mercancía, todo reporte de devolución, garantía,etc. deberá ser reportado a su asesor de ventas y aplicará de acuerdo a la Política vigente.",
            "•Con la firma y/o sello en el presente documento, se da por recibida a entera conformidad la mercancía descrita y se acepta el monto a pagar aquí indicado.",
        ];

        const instruccionesTexto = instrucciones.join("\n");
        currentY = verificarEspacio(doc, currentY, instrucciones.length);

        doc.autoTable({
            startY: currentY,
            body: [[{ content: instruccionesTexto }]],
            theme: "grid",
            styles: {
                fontSize: 7,
                cellPadding: 3,
                valign: "top",
                textColor: [0, 0, 0],
            },
            columnStyles: { 0: { cellWidth: 190 } },
            margin: { left: 10 },
            tableWidth: 190,
        });

        currentY = doc.lastAutoTable.finalY + 0;

        const letras = NumerosALetras(totalImporte);
        const fechaActual = new Date();
        const fechaHoy = fechaActual.toLocaleDateString("es-MX");
        const fechaVence = new Date(
            fechaActual.setMonth(fechaActual.getMonth() + 1)
        ).toLocaleDateString("es-MX");

        const textoPagare =
            `En cualquier lugar de este documento donde se estampe la firma por este pagaré debo(emos) y pagaré(mos) ` +
            `incondicionalmente a la vista y a la orden de SANTUL HERRAMIENTAS S.A. DE C.V., la cantidad de: $${totalImporte.toFixed(
                2
            )} ` +
            `(${letras} M.N.) En el total a pagar en Cuautitlán, Estado de México, o en la que SANTUL HERRAMIENTAS S.A. DE C.V., juzgue necesario. ` +
            `Este documento causará intereses al 3% mensual si no se paga a su vencimiento. expide el ${fechaHoy}, vence el ${fechaVence}.`;

        currentY = verificarEspacio(doc, currentY, 8);

        doc.autoTable({
            startY: currentY,
            body: [[textoPagare, "Firma del Cliente"]],
            theme: "grid",
            styles: {
                fontSize: 7,
                cellPadding: 3,
                valign: "top",
                textColor: [0, 0, 0],
            },
            columnStyles: {
                0: { cellWidth: 150, fillColor: [240, 240, 240] },
                1: { cellWidth: 40, halign: "center", fontStyle: "bold" },
            },
            margin: { left: 10 },
            tableWidth: 190,
        });

        currentY = doc.lastAutoTable.finalY + 0;
        currentY = verificarEspacio(doc, currentY, 5);

        //informacion bancaria
        // === Información Bancaria + Observaciones alineadas ===

        const tablaBancosY = currentY + 10; // Ajusta el +3 si lo quieres más arriba o abajo


        // Muestra la referencia bancaria arriba de la tabla
        doc.setFontSize(10);
        doc.text('Referencia bancaria:', 20, tablaBancosY - 5, { styles: { fontStyle: 'bold' } });
        doc.setFont(undefined, 'bold');
        doc.text(`${referenciaCliente}`, 75, tablaBancosY - 5, { align: 'right', styles: { fontStyle: 'bold' } }); // Ajusta la posición x para alinearlo a la derecha
        doc.setFont(undefined, 'normal');

        // TABLA DE BANCOS
        doc.autoTable({
            startY: tablaBancosY,
            head: [[
                { content: 'BANCO', styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                { content: 'NO. DE CUENTA', styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } },
                { content: 'SUCURSAL', styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } },
                { content: 'CLABE', styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } }
            ]],

            body: [
                ['BANAMEX', '6860432', '7006', '002180700668604325'],
                [
                    { content: 'BANORTE' },
                    { content: '0890771176' },
                    { content: '04' },
                    { content: '072180008907711766' }
                ],
                ['BANCOMER', 'CIE 2476827', '1838']
            ],
            startY: tablaBancosY, // tu variable de Y si la usas
            theme: 'plain', // O 'grid' si quieres líneas de tabla
            headStyles: {
                fillColor: [0, 0, 0],      // Fondo negro
                textColor: [255, 255, 255],// Texto blanco
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center',
                valign: 'middle',
            },
            // Opcional: para que las celdas no tengan borde
            styles: {
                lineWidth: 0.2,
                lineColor: [0, 0, 0],
                fontSize: 8,
            },

            theme: 'plain', // Sin bordes, puro alineado como quieres
            styles: { fontSize: 8, cellPadding: 1, halign: 'center' },
            margin: { left: 10 },
            tableWidth: 115, // ajusta a 115-120 según el ancho de tu hoja, eso te da espacio a la derecha para observaciones
            headStyles: { textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0] },
        });

        // CAJA OBSERVACIONES (alineada a la derecha)
        // =============== CAJA DE OBSERVACIONES ===============
        const obsBoxX = 133;
        const obsBoxY = tablaBancosY;
        const obsBoxWidth = 65;
        const obsBoxHeight = 28;

        // Dibuja el recuadro
        doc.setDrawColor(120, 120, 120);
        doc.setLineWidth(0.3);
        doc.rect(obsBoxX, obsBoxY, obsBoxWidth, obsBoxHeight);

        // Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Observaciones:', obsBoxX + 3, obsBoxY + 7);

        // Líneas punteadas dentro del recuadro, bien alineadas
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        const numLineas = 4;
        const leftPadding = 5; // padding izquierdo dentro de la caja
        const rightPadding = 5;
        const lineaAncho = obsBoxWidth - leftPadding - rightPadding;
        for (let i = 0; i < numLineas; i++) {
            // Empieza un poco debajo del título y separadas
            const lineaY = obsBoxY + 11 + i * 5.3;
            doc.text(
                '...'.repeat(Math.floor(lineaAncho / 2.5)), // Ajusta el divisor para el largo de puntos
                obsBoxX + leftPadding,
                lineaY
            );
        }

        // Poner leyenda final justo abajo, centrado
        const leyendaY = obsBoxY + obsBoxHeight + 7; // Ajusta el +7 para el espaciado
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(
            'A la firma/sello del presente documento se tiene por recibida de conformidad la mercancía y aceptado el monto a pagar aquí descrita.',
            10,
            leyendaY
        );

        currentY = leyendaY + 4; // Si necesitas continuar después


        addPageNumber(doc);
        doc.save(`PackingList_de_${pedido}.pdf`);
        alert(`PDF generado con éxito para el pedido ${pedido}`);
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Hubo un error al generar el PDF.");
    }
};

module.exports = { generarPackingListPDF };
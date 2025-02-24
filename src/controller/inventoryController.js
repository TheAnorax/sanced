const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

const porcentaje = async (req, res) => {
  try {
    // Excluir pasillos P09 en adelante, TAP, CAB y CAR, pero incluir P21
    const [totalResults] = await pool.query(`
      SELECT COUNT(*) AS total 
      FROM inventoryalma 
      WHERE TRIM(UPPER(ubi)) NOT LIKE '%B' 
        AND ((ubi BETWEEN 'P01' AND 'P08') OR ubi = 'P21')
    `);

    const [fResults] = await pool.query(`
      SELECT COUNT(*) AS completed 
      FROM inventoryalma 
      WHERE estado = 'F' 
        AND TRIM(UPPER(ubi)) NOT LIKE '%B' 
        AND ((ubi BETWEEN 'P01' AND 'P08') OR ubi = 'P21')
    `);

    const total = totalResults[0].total;
    const completed = fResults[0].completed;

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    res.json({ percentage });
  } catch (error) {
    console.error("❌ Error al obtener el porcentaje:", error);
    res.status(500).json({
      error: "Error al obtener el porcentaje de inventarios.",
    });
  }
};




// Obtener inventario
const obtenerInventario = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT
        ubi, 
        codigo AS cod, 
        _pz, 
        _inner, 
        _master, 
        _pallet, 
        cantidad 
      FROM inventory 
      WHERE estado = "F";
    `;

    const [result] = await pool.query(query);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron registros en la tabla 'inventory'",
        data: [],
      });
    }

    if (req.query.format === "csv") {
      const headers = "ubi,cod,_pz,_inner,_master,_pallet,cantidad\n";
      const csvContent = result
        .map((row) =>
          [
            row.ubi,
            row.cod,
            row._pz ?? "",
            row._inner ?? "",
            row._master ?? "",
            row._pallet ?? "",
            row.cantidad,
          ].join(",")
        )
        .join("\n");

      const filePath = path.join(__dirname, "inventario.csv");
      const fileContent = headers + csvContent;

      res.header("Content-Type", "text/csv");
      res.attachment("inventario.csv");
      return res.send(fileContent);
    }

    res.status(200).json({
      success: true,
      message: "Datos obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error al obtener datos de inventory:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos de la tabla 'inventory'",
      error: error.message,
    });
  }
};

// Resto de las funciones
const ubicaciones = async (req, res) => {
  try {
    // Obtener todas las ubicaciones y excluir las que terminan en "B"
    const [locations] = await pool.query(`
      SELECT id_ubi, tipo, ubi, cantidad, estado
      FROM inventoryalma
      WHERE TRIM(UPPER(ubi)) NOT LIKE '%B'
        AND ((ubi BETWEEN 'P01' AND 'P08') OR ubi = 'P21')
    `);

    const pasillos = {};

    locations.forEach((location) => {
      const pasillo =
        typeof location.ubi === "string"
          ? location.ubi.slice(0, 3) // Extrae los primeros 3 caracteres del pasillo
          : "SIN_PASILLO";

      if (!pasillos[pasillo]) {
        pasillos[pasillo] = { total: 0, completed: 0, pending: 0 };
      }

      pasillos[pasillo].total += 1;

      if (location.estado === "F") {
        pasillos[pasillo].completed += 1;
      } else {
        pasillos[pasillo].pending += 1;
      }
    });

    // 🔄 **Nueva fórmula del porcentaje**
    const pasilloPercentages = Object.keys(pasillos).map((pasillo) => {
      const { completed, pending } = pasillos[pasillo];
      const total = completed + pending;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      return {
        pasillo,
        percentage: Math.min(percentage, 100),
        completed,
        pending,
      };
    });

    res.json({ locations, pasilloPercentages });
  } catch (error) {
    console.error("❌ Error al obtener ubicaciones:", error);
    res.status(500).json({ message: "Error al obtener ubicaciones" });
  }
};



const persona = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        responsable,
        COUNT(*) AS total_ubicaciones,
        SUM(IFNULL(estado = 'F', 0)) AS completadas,
        (SUM(IFNULL(estado = 'F', 0)) / COUNT(*)) * 100 AS porcentaje_completado
      FROM inventory
      WHERE responsable IS NOT NULL
      GROUP BY responsable
    `);

    res.json(results);
  } catch (error) {
    console.error("Error al obtener el avance por persona:", error);
    res.status(500).json({ message: "Error al obtener el avance por persona" });
  }
};

const manual = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_ubi, tipo, ubi, asignado, responsable, estado, hora_inicio, hora_final, 
             codigo, _pz, _inner, _master, _pallet, cantidad, cant_stock, manual, 
             id_usu, pasillo, nivel
      FROM inventory
      WHERE manual = 'Si'
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los datos de inventario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los datos de inventario" });
  }
};

// Obtener detalles del inventario
const getInventoryDet = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id_ubi,
        i.ubi,
        prod.des,
        i.codigo, 
        i._pz,
        i._inner,
        i._master,
        i._pallet,
        i.cantidad,
        i.manual,
        i.id_usu,
        us.name,
        i.pasillo,
        i.tipo
      FROM inventory i
       LEFT JOIN productos prod ON i.codigo = prod.codigo_pro
       LEFT JOIN usuarios us ON i.id_usu = us.id_usu
    `);

    // Reemplazar valores nulos con 0
    const formattedRows = rows.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          value === null ? 0 : value,
        ])
      );
    });

    res.status(200).json({
      success: true,
      message: "Datos obtenidos correctamente",
      data: formattedRows,
    });
  } catch (error) {
    console.error("Error al obtener los detalles del inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los detalles del inventario.",
      error: error.message,
    });
  }
};

const reportFinishInventory = async (req, res) => {
  const query = `
    SELECT 
      inv.ubi,
      pr.clave,
      inv.codigo,
      inv.cantidad
    FROM inventory inv
    LEFT JOIN productos pr ON inv.codigo = pr.codigo_pro
  `;

  try {
    const [rows] = await pool.query(query);

    // Calcular el total de la cantidad
    const totalGeneral = rows.reduce(
      (sum, row) => sum + (row.cantidad || 0),
      0
    );

    // Enviar el total dentro del cuerpo de la respuesta JSON
    res.json({ data: rows, totalGeneral });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener los productos",
        error: error.message,
      });
  }
};

const reportFinishInventoryAlma = async (req, res) => {
  const query = `
    SELECT 
      inv.ubi,
      pr.clave,
      inv.codigo,
      inv.cantidad
    FROM inventoryalma inv
    LEFT JOIN productos pr ON inv.codigo = pr.codigo_pro
  `;

  try {
    const [rows] = await pool.query(query);

    // Calcular el total de la cantidad
    const totalGeneral = rows.reduce(
      (sum, row) => sum + (row.cantidad || 0),
      0
    );

    // Enviar el total dentro del cuerpo de la respuesta JSON
    res.json({ data: rows, totalGeneral });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener los productos",
        error: error.message,
      });
  }
};

const reportConsolidatedInventory = async (req, res) => {
  try {
    // Consultas a ambas tablas
    const queryPick = `
      SELECT inv.codigo, pr.clave, inv.ubi, inv.cantidad
      FROM inventory inv
      LEFT JOIN productos pr ON inv.codigo = pr.codigo_pro
    `;

    const queryAlmacenaje = `
      SELECT inv.codigo, pr.clave, inv.ubi, inv.cantidad
      FROM inventoryalma inv
      LEFT JOIN productos pr ON inv.codigo = pr.codigo_pro
    `;

    // Ejecutar ambas consultas
    const [pickRows] = await pool.query(queryPick);
    const [almacenajeRows] = await pool.query(queryAlmacenaje);

    // Combina los resultados de ambas tablas
    const combinedRows = [...pickRows, ...almacenajeRows];

    // Agrupar por código y sumar cantidades
    const groupedData = combinedRows.reduce((acc, row) => {
      const { codigo, clave, ubi, cantidad } = row;
      if (!acc[codigo]) {
        acc[codigo] = { codigo, clave, cantidad: cantidad || 0 };
      } else {
        acc[codigo].cantidad += cantidad || 0;
      }
      return acc;
    }, {});

    // Convertir el objeto agrupado a un array
    const finalData = Object.values(groupedData);

    // Calcular el total general
    const totalGeneral = finalData.reduce(
      (sum, item) => sum + item.cantidad,
      0
    );

    // Enviar la respuesta con los datos agrupados y el total general
    res.json({ data: finalData, totalGeneral });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener el inventario consolidado",
        error: error.message,
      });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params; // Asegúrate de que esto es "id_ubi"
    const { _pz, _inner, _master, _pallet, cantidad, cant_stock } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "ID de ubicación no proporcionado" });
    }

    // Construcción de los campos a actualizar dinámicamente
    const updateFields = {};
    if (_pz !== undefined) updateFields._pz = _pz;
    if (_inner !== undefined) updateFields._inner = _inner;
    if (_master !== undefined) updateFields._master = _master;
    if (_pallet !== undefined) updateFields._pallet = _pallet;
    if (cantidad !== undefined) updateFields.cantidad = cantidad;
    if (cant_stock !== undefined) updateFields.cant_stock = cant_stock;

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "No hay datos válidos para actualizar" });
    }

    // Actualizar solo la fila con el id_ubi correcto
    const query = "UPDATE inventory SET ? WHERE id_ubi = ?";
    await pool.query(query, [updateFields, id]);

    res.json({ message: "Inventario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar inventario:", error);
    res.status(500).json({ error: "Error al actualizar inventario" });
  }
};

const obtenerDistribucionInventario = async (req, res) => {
  try {
    // Ejecutar la consulta SQL para obtener la distribución inicial
    const [rows] = await pool.query(`
      WITH total_inventario AS (
          SELECT combined.codigo, prod.clave, SUM(combined.cantidad) AS total_cantidad
          FROM (
              SELECT codigo, cantidad FROM inventory WHERE codigo IS NOT NULL
              UNION ALL
              SELECT codigo, cantidad FROM inventoryalma WHERE codigo IS NOT NULL
          ) AS combined
          LEFT JOIN productos prod ON combined.codigo = prod.codigo_pro
          GROUP BY combined.codigo, prod.clave
      ),
      lotes_suma AS (
          SELECT clave, COUNT(lote) AS total_lotes, SUM(existencia) AS suma_existencia,
                 MAX(existencia) AS max_lote,
                 MIN(existencia) AS min_lote
          FROM lotes
          GROUP BY clave
      ),
      lotes_ordenados AS (
          SELECT clave, lote, existencia AS capacidad_lote
          FROM lotes
          ORDER BY clave, existencia DESC -- Ordena de mayor a menor capacidad
      ),
      lotes_distribuidos AS (
          SELECT 
              lo.clave,
              lo.lote,
              lo.capacidad_lote,
              LEAST(lo.capacidad_lote, ti.total_cantidad) AS cantidad_asignada,
              ti.total_cantidad
          FROM total_inventario ti
          INNER JOIN lotes_ordenados lo ON ti.clave = lo.clave
      ),
      ajuste_excedente AS (
          SELECT 
              clave,
              total_cantidad,
              SUM(cantidad_asignada) AS cantidad_distribuida,
              GREATEST(total_cantidad - SUM(cantidad_asignada), 0) AS excedente -- Evita valores negativos
          FROM lotes_distribuidos
          GROUP BY clave, total_cantidad
      )
      SELECT 
          ld.clave,
          ld.lote,
          ld.capacidad_lote,
          CASE 
              WHEN ld.cantidad_asignada < ld.capacidad_lote THEN 
                  LEAST(ld.capacidad_lote, ld.cantidad_asignada + COALESCE(ae.excedente, 0)) 
              ELSE ld.cantidad_asignada
          END AS cantidad_final
      FROM lotes_distribuidos ld
      LEFT JOIN ajuste_excedente ae ON ld.clave = ae.clave
      ORDER BY ld.clave, ld.capacidad_lote DESC;
    `);

    // PASO 1: Crear un mapa de claves con el lote de mayor capacidad
    const lotesMaximos = {};
    rows.forEach(row => {
      if (row.lote) { // Solo considerar filas que tienen lote asignado
        if (!lotesMaximos[row.clave] || row.capacidad_lote > lotesMaximos[row.clave].capacidad) {
          lotesMaximos[row.clave] = { lote: row.lote, capacidad: row.capacidad_lote };
        }
      }
    });

    // PASO 2: Asignar el lote más grande a las claves que no tienen lote
    const resultadoFinal = rows.map(row => {
      if (!row.lote && lotesMaximos[row.clave]) {
        return { ...row, lote: lotesMaximos[row.clave].lote }; // Asigna el lote más grande disponible
      }
      return row;
    });

    // Enviar la respuesta con los datos corregidos
    res.json(resultadoFinal);
  } catch (error) {
    console.error("Error al obtener la distribución del inventario:", error);
    res.status(500).json({ message: "Error al obtener la distribución del inventario" });
  }
};






module.exports = {
  porcentaje,
  obtenerInventario,
  ubicaciones,
  persona,
  manual,
  getInventoryDet,
  reportFinishInventory,
  reportFinishInventoryAlma,
  reportConsolidatedInventory,
  updateInventory,
  obtenerDistribucionInventario
};

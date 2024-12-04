const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

// Obtener el porcentaje de inventarios con estado "F"
const porcentaje = async (req, res) => {
  try {
    const [totalResults] = await pool.query(
      "SELECT COUNT(*) AS total FROM inventory"
    );
    const [fResults] = await pool.query(
      "SELECT COUNT(*) AS completed FROM inventory WHERE estado = 'F'"
    );

    const total = totalResults[0].total;
    const completed = fResults[0].completed;

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    res.json({ percentage });
  } catch (error) {
    console.error("Error al obtener el porcentaje:", error);
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
    const [locations] = await pool.query(`
      SELECT id_ubi, tipo, ubi, cantidad, cant_stock, estado
      FROM inventory
    `);

    const pasillos = {};

    locations.forEach((location) => {
      const pasillo = typeof location.ubi === "string" ? location.ubi.slice(0, 3) : "SIN_PASILLO";

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

    const pasilloPercentages = Object.keys(pasillos).map((pasillo) => {
      const { total, completed, pending } = pasillos[pasillo];
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
    console.error("Error al obtener ubicaciones:", error);
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
    res.status(500).json({ message: "Error al obtener los datos de inventario" });
  }
};

module.exports = { porcentaje, obtenerInventario, ubicaciones, persona, manual };

const pool = require("../config/database");

const getpick7066 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT  
        d.id_ubicacion,
        d.ubi,
        d.code_prod,
        p.des,
        d.cant_stock,
        d.cant_stock_mov,
        d.pasillo,
        d.lote,
        d.almacen_entrada,
        d.almacen_salida,
        d.fecha_salida,
        d.codigo_salida,
        u.name    
      FROM departamental_pick AS d
      LEFT JOIN usuarios AS u ON d.codigo_salida = u.id_usu
      LEFT JOIN productos AS p ON d.code_prod = p.codigo_pro
    `);

    res.json({ error: false, message: "Datos obtenidos", data: rows });
  } catch (error) {
    console.error("❌ Error en getpick7066:", error);
    res
      .status(500)
      .json({
        error: true,
        message: "Error al obtener los datos",
        details: error.message,
      });
  }
};

const createPick7066 = async (req, res) => {
  const { ubi, code_prod, cant_stock, pasillo, codigo_salida } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO departamental_pick (ubi, code_prod, cant_stock, pasillo, codigo_salida) 
       VALUES (?, ?, ?, ?, ?)`,
      [ubi, code_prod, cant_stock, pasillo, codigo_salida]
    );
    res
      .status(201)
      .json({
        error: false,
        message: "Registro creado",
        insertId: result.insertId,
      });
  } catch (error) {
    console.error("❌ Error en createPick:", error);
    res
      .status(500)
      .json({
        error: true,
        message: "Error al crear el registro",
        details: error.message,
      });
  }
};

const updatePick7066 = async (req, res) => {
  const { id } = req.params;
  const { ubi, code_prod, cant_stock, pasillo, codigo_salida } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE departamental_pick SET ubi=?, code_prod=?, cant_stock=?,  pasillo=?,  codigo_salida=? WHERE id_ubicacion=?`,
      [ubi, code_prod, cant_stock, pasillo, codigo_salida, id]
    );
    res.json({
      error: false,
      message: "Registro actualizado",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error en updatePick:", error);
    res
      .status(500)
      .json({
        error: true,
        message: "Error al actualizar el registro",
        details: error.message,
      });
  }
};

const deletePick7066 = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM departamental_pick WHERE id_ubicacion = ?`,
      [id]
    );
    res.json({
      error: false,
      message: "Registro eliminado",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error en deletePick:", error);
    res
      .status(500)
      .json({
        error: true,
        message: "Error al eliminar el registro",
        details: error.message,
      });
  }
};

const getDepartamental = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM departamental
      ORDER BY FOLIO DESC;
    `);

    res.json({
      error: false,
      message: "Datos departamental obtenidos correctamente",
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error en getDepartamental:", error);
    res.status(500).json({
      error: true,
      message: "Error al obtener datos de departamental",
      details: error.message,
    });
  }
};

module.exports = {
  getpick7066,
  createPick7066,
  updatePick7066,
  deletePick7066,
  getDepartamental,
};

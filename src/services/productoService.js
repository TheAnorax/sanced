const pool = require('../config/database');

const getProductos = async () => {
  const [rows] = await pool.query('SELECT * FROM productos');
  return rows;
};

const getProductoById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id_prod = ?', [id]);
  return rows[0];
};

const createProducto = async (producto) => {
  const [result] = await pool.query('INSERT INTO productos SET ?', [producto]);
  return result.insertId;
};

const updateProducto = async (id, producto) => {
  const [result] = await pool.query('UPDATE productos SET ? WHERE id_prod = ?', [producto, id]);
  return result;
};

const deleteProducto = async (id) => {
  const [result] = await pool.query('DELETE FROM productos WHERE id_prod = ?', [id]);
  return result;
};

module.exports = { getProductos, getProductoById, createProducto, updateProducto, deleteProducto };

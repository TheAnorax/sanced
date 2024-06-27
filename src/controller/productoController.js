const pool = require('../config/database');

const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

const createProduct = async (req, res) => {
  const { codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO productos (codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [codigo_pro, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet]);
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { codigo_pro, clave, inventario, inv_m, inv_i, inv_p, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet } = req.body;
  try {
    await pool.query('UPDATE productos SET codigo_pro = ?, clave = ?, inventario = ?, inv_m = ?, inv_i = ?, inv_p = ?, des = ?, code_pz = ?, code_pq = ?, code_master = ?, code_inner = ?, code_palet = ?, _pz = ?, _pq = ?, _inner = ?, _master = ?, _palet = ? WHERE id_prod = ?', [codigo_pro, clave, inventario, inv_m, inv_i, inv_p, des, code_pz, code_pq, code_master, code_inner, code_palet, _pz, _pq, _inner, _master, _palet, id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id_prod = ?', [id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };

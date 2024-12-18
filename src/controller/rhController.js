const pool = require('../config/database');

// Obtener todos los insumos
const getInsumosRH = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM insumosrh');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los insumos', error: error.message });
  }
};

// Crear un insumo
const createInsumo = async (req, res) => {
    try {
      console.log('Datos recibidos en createInsumo:', req.body);
  
      const { Codigo, Descripcion, Cantidad, Talla, Categoria, UM } = req.body;
      await pool.query('INSERT INTO insumosrh SET ?', { Codigo, Descripcion, Cantidad, Talla, Categoria, UM });
      res.status(201).json({ message: 'Insumo creado correctamente' });
    } catch (error) {
      console.error('Error en createInsumo:', error.message);
      res.status(500).json({ message: 'Error al crear el insumo', error: error.message });
    }
  };
  
  

// Actualizar un insumo
const updateInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { Codigo, Descripcion, Cantidad, Talla, Categoria, UM } = req.body;
    await pool.query('UPDATE insumosrh SET ? WHERE Codigo = ?', [{ Codigo, Descripcion, Cantidad, Talla, Categoria, UM }, id]);
    res.status(200).json({ message: 'Insumo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el insumo', error: error.message });
  }
};

// Eliminar un insumo
const deleteInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM insumosrh WHERE Codigo = ?', [id]);
    res.status(200).json({ message: 'Insumo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el insumo', error: error.message });
  }
};

module.exports = {
  getInsumosRH,
  createInsumo,
  updateInsumo,
  deleteInsumo,
};

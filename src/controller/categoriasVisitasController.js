const pool = require('../config/database');

const getCategorias = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM categorias_visitas WHERE id_catv != 5`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las categorias.'})
    }
}

module.exports = {getCategorias};
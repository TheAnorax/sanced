const pool = require('../config/database');

const getBahias = async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM bahias`);
  
      // Filtrar las bahías que contienen el texto "Pasillo"
      const filteredRows = rows.filter(bahia => !bahia.bahia.includes('CABECERA'));
  
      // Inicializar un objeto para agrupar las bahías
      const groupedBahias = {
        A: [],
        B: [],
        C: [],
        D: [],
        E: [],
        F: [],
        G: [],
        H: [],
        I: [],
        J: [],
        K: [],
        L: [],
        M: [],
        N: [],
        O: [],
        P: [],
        Q: []
      };
  
      // Agrupar las bahías por la letra inicial
      filteredRows.forEach(bahia => {
        const initial = bahia.bahia.charAt(0);
        if (groupedBahias[initial]) {
          groupedBahias[initial].push(bahia);
        }
      });
  
      res.json(groupedBahias);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las bahías', error: error.message });
    }
  };
  

  

const liberarBahia = async (req, res) => {
    const { id_bahia } = req.params;
    try {
      const result = await pool.query('UPDATE bahias SET estado = NULL, id_pdi = NULL, ingreso = NULL WHERE id_bahia = ?', [id_bahia]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Bahía no encontrada' });
      }
      res.json({ message: 'Bahía liberada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al liberar la bahía', error: error.message });
    }
  };
  
  
module.exports = { getBahias, liberarBahia };

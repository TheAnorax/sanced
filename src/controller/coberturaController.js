const pool = require("../config/database");

const getCoberturasDual = async (req, res) => {
    const { codigo_postal } = req.query;

    if (!codigo_postal) {
        return res.status(400).json({ success: false, message: 'Código postal requerido' });
    }

    try {
        // Cobertura 2025
        const [result2025] = await pool.execute(
            'SELECT * FROM cobertura_2025_ctes WHERE `CODIGO_POSTAL` = ?',
            [codigo_postal]
        );

        // Cobertura Tres Guerras
        const [resultGuerras] = await pool.execute(
            'SELECT * FROM cobertura_guerras WHERE `CP` = ?',
            [codigo_postal]
        );

        // Cobertura PITIC
        const [resultPitic] = await pool.execute(
            'SELECT * FROM cobertura_pitic WHERE `CP` = ?',
            [codigo_postal]
        );

        res.json({
            success: true,
            cobertura2025: result2025,
            coberturaGuerras: resultGuerras,
            coberturaPitic: resultPitic,
        });
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};


module.exports = { getCoberturasDual };
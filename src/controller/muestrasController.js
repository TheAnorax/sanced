const pool = require('../config/database');

const Departamentos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
        SELECT nombre FROM departamentos
      `);
        const departamentos = rows.map(row => ({
            value: row.nombre, // El valor para el select
            label: row.nombre  // El texto que verá el usuario en el select
        }));

        res.json(departamentos); // Respondemos con la lista de departamentos
    } catch (error) {
        console.error("Error al obtener los departamentos:", error);
        res.status(500).json({ message: "Error al obtener los departamentos" });
    }
};

const buscarProducto = async (req, res) => {
    const { codigo } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT 
                m.code_prod,
                m.cant_stock,  -- Agregar la columna cant_stock de la tabla 'muestras'
                p.des          -- Asegúrate de que 'des' sea un campo válido en 'productos'
            FROM muestras m
            JOIN productos p ON m.code_prod = p.codigo_pro  -- Verifica que 'codigo_pro' sea el nombre correcto en la tabla 'productos'
            WHERE m.code_prod = ?`, [codigo]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(rows[0]); // Verifica que cant_stock y los otros campos estén incluidos en la respuesta
    } catch (error) {
        console.error('Error al buscar el producto:', error);
        res.status(500).json({ message: 'Error al buscar el producto' });
    }
};




module.exports = { Departamentos, buscarProducto };
